import {practiceCatalogue} from './practice-routines.js';
import {materials} from './catalogue.js';
const sections=['VR','DM','QR'];
const compare=(a,b)=>a<b?-1:a>b?1:0;
function completeRaw(value) {
 if(!value || [value.earned,value.max].some(v=>v===null||v===undefined||v===''))return false;
 const earned=Number(value.earned),max=Number(value.max);
 return Number.isFinite(earned)&&Number.isFinite(max)&&max>0&&earned>=0&&earned<=max;
}
export function collectEvidence(mocks=[]) {
 return collectLabelEvidence(mocks,false);
}
function collectLabelEvidence(mocks,selectionOnly) {
 const eligible=selectEvidenceMocks(mocks),support=eligible.slice(-10),current=support.slice(-3),currentIds=new Set(current.map(m=>m.id));
 const groups=new Map(),unknown=[],knownEntries=practiceCatalogue.entries;
 let selected=0,reviewedSelected=0;
 for(const [mockIndex,m] of support.entries()) {
  const questions=new Map();
  for(const r of m.reviews||[]) {
   if(!sections.includes(r.section))continue;
   const key=JSON.stringify([r.section,r.number]);
   if(!questions.has(key))questions.set(key,{section:r.section,number:r.number,labels:new Map(),reviewed:false});
   const question=questions.get(key);
   if(r.reviewed!==true)continue;
   question.reviewed=true;
   const labels=[...(r.type?[['type',r.type]]:[]),...[...new Set(r.reasons||[])].filter(Boolean).map(l=>['reason',l])];
   for(const [family,label] of labels)question.labels.set(JSON.stringify([family,label]),{family,label});
  }
  for(const question of questions.values()) {
   if(currentIds.has(m.id)){selected++;if(question.reviewed)reviewedSelected++;}
   const values=[...question.labels.values()];
   const knownType=values.some(v=>v.family==='type'&&knownEntries.some(e=>e.section===question.section&&e.family==='type'&&e.label===v.label));
   const specificReason=values.some(v=>v.family==='reason'&&!['Guess','Other','other'].includes(v.label)&&knownEntries.some(e=>e.section===question.section&&e.family==='reason'&&e.label===v.label));
   for(const {family,label} of values) {
    const entry=knownEntries.find(e=>e.section===question.section&&e.family===family&&e.label===label);
    const ref={mockId:m.id,section:question.section,number:question.number};
    if(!entry){unknown.push({...ref,family,label});continue;}
    if(!groups.has(entry.id))groups.set(entry.id,{entryId:entry.id,section:entry.section,family,label,evidence:[],supportMockIds:[],currentMockIds:[],latestIndex:-1,eligibleQuestionCount:0});
    const selectionEligible=family==='type'?!specificReason:!(['Guess','Other','other'].includes(label)&&knownType);
    // Descriptive labels retain every occurrence; ranking uses only selecting questions.
    if(selectionOnly&&!selectionEligible)continue;
    const g=groups.get(entry.id);g.evidence.push(ref);g.latestIndex=mockIndex;
    if(selectionEligible)g.eligibleQuestionCount++;
    if(!g.supportMockIds.includes(m.id))g.supportMockIds.push(m.id);
    if(currentIds.has(m.id)&&!g.currentMockIds.includes(m.id))g.currentMockIds.push(m.id);
   }
  }
 }
 const labels=[...groups.values()].map(g=>({...g,questionCount:g.evidence.length,currentMockCount:g.currentMockIds.length,supportMockCount:g.supportMockIds.length,recurring:g.currentMockIds.length>=2}));
 return {eligibleCount:eligible.length,currentMockIds:current.map(m=>m.id),supportMockIds:support.map(m=>m.id),selected,reviewedSelected,labels,unknownLabels:unknown,excludedCount:mocks.length-eligible.length};
}
export function resourceOptions(resources=[]) {
 return [{name:'Official UK question bank',materials:['Question banks'],status:'included-default-access-unverified',accessVerified:false},...resources.map(r=>({name:typeof r.name==='string'?r.name:'',materials:[...new Set((r.materials||[]).filter(m=>materials.includes(m)))],status:'student-declared-access-unverified',accessVerified:false}))];
}
function resourceChecks(r,resources) {
 return {availability:'check-required',choices:resourceOptions(resources).filter(c=>c.materials.some(m=>materials.slice(0,4).includes(m))),requirement:r.resource,limit:r.internal.limit,checks:['Check the exact format and answer explanations in your material.','Check all steps and prerequisites against the existing items actually available.','Personal access, provider filters, exercise IDs and interface features are not verified.']};
}
function learnerItem(r,section,focus) {
 return {title:r.title,section,focus,steps:[...r.steps],dose:r.dose,resource:r.resource};
}
export function recommendPractice({mocks=[],previousFocus=null,previousOrder=[],learnerChoice=null,resources=[]}={}) {
 const evidence=collectEvidence(mocks),selectionEvidence=collectLabelEvidence(mocks,true),entries=practiceCatalogue.entries;
 const candidates=selectionEvidence.labels.filter(l=>l.eligibleQuestionCount>0).map(l=>({entry:entries.find(e=>e.id===l.entryId),evidence:l}));
 let chosen=null;
 const selectedEntry=entries.find(e=>e.routines.some(r=>r.id===learnerChoice?.routineId));
 const selectedShared=practiceCatalogue.shared.find(r=>r.id===learnerChoice?.routineId);
 if(selectedEntry || (selectedShared&&sections.includes(learnerChoice?.section))) {
  const entry=selectedEntry||{id:selectedShared.id,section:learnerChoice.section,family:'shared',label:selectedShared.title,routines:[selectedShared]};
  const recorded=selectionEvidence.labels.find(l=>l.entryId===entry.id&&l.eligibleQuestionCount>0);
  chosen={entry,chosenRoutine:entry.routines.find(r=>r.id===learnerChoice.routineId),selection:'learner-choice',evidence:recorded||{entryId:entry.id,currentMockCount:0,supportMockCount:0,currentMockIds:[],supportMockIds:[],evidence:[],questionCount:0,recurring:false,latestIndex:-1,general:true}};
  const index=candidates.findIndex(c=>c.entry.id===entry.id);if(index>=0)candidates.splice(index,1);candidates.push(chosen);
 }
 const method=c=>Number((c.entry.section==='DM'&&c.entry.label==='Unable to do')||(c.entry.section==='QR'&&c.entry.label==='Formula Forgotten'));
 const previousIndex=c=>previousOrder.includes(c.entry.id)?previousOrder.indexOf(c.entry.id):Infinity;
 candidates.sort((a,b)=>Number(b===chosen)-Number(a===chosen)||Number(b.evidence.recurring)-Number(a.evidence.recurring)||b.evidence.currentMockCount-a.evidence.currentMockCount||b.evidence.latestIndex-a.evidence.latestIndex||method(b)-method(a)||b.evidence.supportMockCount-a.evidence.supportMockCount||Number(b.entry.id===previousFocus)-Number(a.entry.id===previousFocus)||previousIndex(a)-previousIndex(b)||entries.indexOf(a.entry)-entries.indexOf(b.entry));
 const options=candidates.slice(0,3).map((c,i)=>({entryId:c.entry.id,routineId:(c.chosenRoutine||c.entry.routines[0]).id,selection:c.selection||'evidence',priority:`Priority ${i+1}`,resources:resourceChecks(c.chosenRoutine||c.entry.routines[0],resources),item:learnerItem(c.chosenRoutine||c.entry.routines[0],c.entry.section,c.entry.label),evidence:{...c.evidence,status:c.evidence.general?'learner-choice':c.evidence.recurring?'recurring':c.evidence.currentMockCount?'single-mock':'historical-context',causeStatus:c.evidence.general?'not-diagnosed':c.entry.family==='type'||['Guess','Other','other','Unable to do'].includes(c.entry.label)?'unknown-cause':'confirmed-label'}}));
 const optionalFallback={id:practiceCatalogue.shared[6].id,optional:true,resources:resourceChecks(practiceCatalogue.shared[6],resources),item:learnerItem(practiceCatalogue.shared[6],null,'Insufficient evidence')};
 const top=options[0];
 const overallFocus=top?{entryId:top.entryId,section:top.item.section,label:top.item.focus,evidenceStatus:top.evidence.status}:null;
 const limitations=[...(evidence.currentMockIds.length<3?[`Only ${evidence.currentMockIds.length} of 3 current-window mocks available.`]:[]),...(evidence.excludedCount?[`${evidence.excludedCount} records excluded: incomplete, draft, invalid chronology or duplicate saved identity.`]:[]),'Selected reviewed questions are not all attempted questions; counts are not error rates or marks lost.','Resources require format, explanation and access checks; completion is activity, not mastery.'];
 return {catalogueVersion:practiceCatalogue.version,overallFocus,limitations,status:options.length?(chosen?.evidence.general?'learner-chosen':'supported'):'insufficient-confirmed-evidence',options,evidence,explanation:chosen?.evidence.general?`Learner-chosen ${top.item.section} focus: ${top.item.focus}; not a diagnosis from recorded evidence.`:options.length?`${top.item.section} focus: ${top.item.focus}. Confirmed label in ${top.evidence.currentMockCount} of ${evidence.currentMockIds.length} latest eligible mocks among selected reviewed questions; ${top.evidence.supportMockCount} of ${evidence.supportMockIds.length} available latest 10 mocks support context. Cause ${top.evidence.causeStatus==='unknown-cause'?'remains unknown':'is learner-confirmed, not independently diagnosed'}.`:`Insufficient confirmed review information among selected reviewed questions in ${evidence.currentMockIds.length} latest eligible mocks. Optional review or learner-chosen practice remains available.`,optionalFallback,chooseAnother:[...entries.flatMap(e=>e.routines.map(r=>({routineId:r.id,entryId:e.id,section:e.section,focus:e.label,provenance:'learner-choice'}))),...practiceCatalogue.shared.map(r=>({routineId:r.id,sectionRequired:true,provenance:'learner-choice'}))]};
}
export function selectEvidenceMocks(mocks=[]) {
 const counts=new Map();for(const m of mocks)counts.set(m?.id,(counts.get(m?.id)||0)+1);
 return mocks.filter(m=>m&&typeof m.id==='string'&&m.id.length>0&&counts.get(m.id)===1&&m.draft!==true&&Number.isFinite(Date.parse(m.loggedAt))&&['questions','weighted'].includes(m.dmMode)&&sections.every(s=>completeRaw(m.scores?.[s]))&&Number(m.scores.DM.max)===(m.dmMode==='weighted'?47:35)).slice().sort((a,b)=>Date.parse(a.loggedAt)-Date.parse(b.loggedAt)||compare(a.id,b.id)).map(m=>structuredClone(m));
}
