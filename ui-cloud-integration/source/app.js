import {validateScores,saveMock,deleteMock,updateSaved} from './domain.js';
import {estimatedMock,mockSaveFeedback} from './estimated-score.js';
import {types,reasons,materials} from './catalogue.js';
import {progressPage} from './progress-view.js';
import {progressAdvice,decodeFocusChoice,operationalRecommendation,addIdentityKey,addTaskFromOption,pendingAddKeys} from './progress-recommendation.js';
import {landingAnalytics} from './landing-analytics.js';
import {practicePage} from './practice-page.js';
import {repeatRootFor,buildRepeatInstance,repeatDuplicateIndex} from './practice-repeat.js';
import {homePage} from './home-page.js';
import {notesPage} from './notes-page.js';
const progressFilters={range:'3',mode:'both',labels:'confirmed'};
const KEY='deltascore-remake-v1';
const fresh=()=>({profile:{target:'',notSure:false,exam:'',notBooked:false,tutor:'',resources:[],format:'guided'},step:0,complete:false,started:false,mocks:[],used:0,savedIds:[],draft:null,tasks:[],route:'home',current:null,reviewIndex:-1});
let state=fresh(),message='',editingProfile=false,lastScreen='';
let pendingMockAcknowledgement=null;
// P5a tab-local preference stage (never persisted; reload keeps only the committed value).
// NOTE: formatPreferenceCommitted() below runs after the load parse and mirrors the committed value.
try{state=JSON.parse(localStorage.getItem(KEY))||state;}catch{message='Browser storage is unavailable. Keep this page open; local saving may fail.';}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(label,act,cls='',extra='')=>`<button type="button" data-act="${act}" class="${cls}" ${extra}>${label}</button>`;
const checked=b=>b?'checked':'';
const field=(label,name,value='',type='text',extra='')=>`<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`;
const check=(label,name,on)=>`<label class="check"><input type="checkbox" name="${name}" ${checked(on)}>${label}</label>`;
const title=(heading,copy='')=>`<h1>${heading}</h1>${copy?`<p>${copy}</p>`:''}`;
function persist(next=state){try{localStorage.setItem(KEY,JSON.stringify(next));state=next;const box=document.getElementById('messages');if(message.startsWith('Could not save your study profile to this browser.')&&box?.textContent===message)box.replaceChildren();message='';return true;}catch{message=(!state.complete&&state.started)||editingProfile?'Could not save your study profile to this browser. Your input is still here, but these changes are not saved. Keep this page open and retry; reloading may lose unsaved changes.':'Could not save to browser storage. Your allowance was not consumed. Keep this page open and retry.';if((!state.complete&&state.started)||editingProfile)showError(message);return false;}}
// Practice commits are transactional; unsaved text stays in this tab, not the record schema.
let practiceError=null,practiceComposer='';
const practiceEdits=new Map(),practiceFailures=new Map(),practiceMetadata=new Map(),practiceDetails=new Map();
// Targets are tab-local identities, never persisted; only committed structure changes move them.
let nextPracticeTarget=0;
// During a committed structural removal, persist() replaces state.tasks
// before practiceTargets is spliced; destructive revalidation must wait
// for the aligned mapping (the post-splice render) or it mispicks rows.
let practiceStructuralShift=false;
const practiceTargets=state.tasks.map(()=>nextPracticeTarget++);
function practiceFailureSummary(){practiceError=practiceFailures.size?{text:'Could not save practice to this browser. These changes are not saved. '+[...new Set(practiceFailures.values())].join(' ')+' Keep this page open; reloading may lose unsaved changes.'}:null;}
// P2 Do again: the failed repeat intent is a tab-local, target-bound snapshot
// (stable practiceTargets token), retired honestly when the source is
// removed/uncompleted or a matching pending instance appears meanwhile.
function practiceRepeatRevalidate(){if(practiceStructuralShift)return;let changed=false;for(const k of [...practiceFailures.keys()]){if(!String(k).startsWith('repeat-'))continue;const t=Number(k.slice(7)),i=practiceTargets.indexOf(t),s=i>=0?state.tasks[i]:undefined;if(!s||!s.done||repeatDuplicateIndex(practiceTasks(),i)>=0){practiceFailures.delete(k);changed=true;}}if(changed)practiceFailureSummary();}
const repeatLabel=t=>`“${t.text}”`;
function focusPracticeCheck(i){const el=document.querySelector(`[data-task-check="${i}"]`);if(!el)return;el.focus({preventScroll:true});el.scrollIntoView({block:'nearest'});}
function practiceRepeatCommit(index,target,isRetry=false){
  const failKey='repeat-'+target,tasks=practiceTasks(),source=tasks[index];
  if(isRetry){
    if(practiceTargets[index]!==target||!source||!source.done){practiceFailures.delete(failKey);practiceFailureSummary();render();document.getElementById('status').textContent='The activity you tried to repeat is no longer completed. Nothing was added.';return;}
    const dupNow=repeatDuplicateIndex(tasks,index);
    if(dupNow>=0){practiceFailures.delete(failKey);practiceFailureSummary();render();focusPracticeCheck(dupNow);document.getElementById('status').textContent=repeatLabel(source)+' is already on your to-do list. Nothing was added.';return;}
  }
  if(practiceTargets[index]!==target||!source||!source.done)return;
  const dup=repeatDuplicateIndex(tasks,index);
  if(dup>=0){focusPracticeCheck(dup);document.getElementById('status').textContent=repeatLabel(source)+' is already on your to-do list. Nothing was added.';return;}
  const root=repeatRootFor(source,crypto.randomUUID());
  const next=tasks.map((t,j)=>j===index?{...t,hpRoot:root}:t);
  next.push(buildRepeatInstance(source,root));
  if(savePractice(next,`repeat-${target}`,'Retry Do again to add this activity again.')){
    practiceFailures.delete(failKey);practiceFailureSummary();
    practiceTargets.push(nextPracticeTarget++);
    render();
    focusPracticeCheck(next.length-1);
    if(!practiceError)document.getElementById('status').textContent='Added a fresh instance of '+repeatLabel(source)+'.';
  }else{
    document.querySelector(`[data-act="retry-repeat"][data-repeat-target="${target}"]`)?.focus();
  }
}
const practiceTasks=()=>state.tasks.map((t,i)=>{const task=practiceEdits.has(i)?{...t,text:practiceEdits.get(i)}:{...t};for(const [name,value] of Object.entries(practiceMetadata.get(i)||{})){if(value==='')delete task[name];else task[name]=value;}return task;});
function practiceDetailsFields(t,i){const token=practiceTargets[i],value={...t,...practiceMetadata.get(i)};return `<details class="practice-details" data-practice-details="${token}" ${practiceDetails.get(token)?'open':''}><summary id="practice-summary-${token}">Task details <span class="sr-only">${i+1}</span></summary><div class="field"><label for="practice-date-${token}">Due date · optional</label><input id="practice-date-${token}" type="date" data-task-meta="dueDate" data-task-index="${i}" value="${esc(value.dueDate||'')}"></div><div class="field"><label for="practice-note-${token}">Completion note · optional</label><textarea id="practice-note-${token}" data-task-meta="completionNote" data-task-index="${i}">${esc(value.completionNote||'')}</textarea></div></details>`;}
document.addEventListener('toggle',e=>{if(e.target.matches?.('[data-practice-details]')&&e.target.isConnected)practiceDetails.set(Number(e.target.dataset.practiceDetails),e.target.open);},true);
function editPracticeMetadata(el){if(el.dataset.taskMeta==='dueDate'){const id=el.id+'-error';document.getElementById(id)?.remove();if(el.validity.badInput){el.setAttribute('aria-invalid','true');el.setAttribute('aria-describedby',id);const error=document.createElement('p');error.id=id;error.className='error';error.setAttribute('role','alert');error.textContent='Enter a valid date, or clear all date parts to leave it blank.';el.after(error);return;}}const i=Number(el.dataset.taskIndex);practiceMetadata.set(i,{...practiceMetadata.get(i),[el.dataset.taskMeta]:el.value});savePractice(practiceTasks(),'edit','Use Retry practice save or edit task details again to retry.');}
function practiceFeedback(){practiceRepeatRevalidate();const box=document.getElementById('messages'),retryFocused=document.activeElement?.dataset.act==='retry-practice';if(practiceError){message=practiceError.text;const repeatRetries=[...practiceFailures].filter(([k])=>String(k).startsWith('repeat-')).map(([k])=>`<div class="field">${btn('Retry Do again','retry-repeat','',`data-repeat-target=\"${k.slice(7)}\"`)}</div>`).join('');box.innerHTML=`<div class=\"error\">${esc(message)}</div>${practiceEdits.size||practiceMetadata.size?`<div class=\"field\">${btn('Retry practice save','retry-practice')}</div>`:''}${repeatRetries}`;if(retryFocused)box.querySelector('button')?.focus();const active=document.activeElement;if(keyboardOrigin&&active?.closest('.practice-task')){const r=active.getBoundingClientRect();if(r.top<12||r.bottom>innerHeight-12)active.scrollIntoView({block:'center',behavior:'instant'});}}else if(box.textContent.startsWith('Could not save practice'))box.replaceChildren();}
function savePractice(tasks,kind,instruction){if(persist({...state,tasks})){practiceEdits.clear();practiceMetadata.clear();practiceFailures.delete('edit');practiceFailures.delete(kind);if(kind.startsWith('remove-'))practiceFailures.delete('check-'+kind.slice(7));practiceFailureSummary();practiceFeedback();document.getElementById('status').textContent=practiceError?'Practice changes are not saved.':'Practice saved in this browser.';return true;}practiceFailures.set(kind,instruction);practiceFailureSummary();practiceFeedback();document.getElementById('status').textContent='Practice changes are not saved.';return false;}
// BEGIN P4 personal notes: input-authoritative, tab-local drafts only.
const noteNewOwner='new-note',noteDrafts=new Map(),noteSaveFailures=new Set(),noteDeleteFailures=new Map(),noteInvalid=new Set();
let noteOwner=noteNewOwner;
const noteRecords=()=>state.notes||[];
const noteDisplay=n=>String(n?.title??'').trim()?n.title:'Untitled note';
function noteDraft(){if(!noteDrafts.has(noteOwner)){const saved=noteRecords().find(n=>n.id===noteOwner);noteDrafts.set(noteOwner,{id:saved?.id||crypto.randomUUID(),title:saved?.title??'',body:saved?.body??''});}return noteDrafts.get(noteOwner);}
function notesView(){return notesPage({draft:noteDraft(),existing:noteOwner!==noteNewOwner,missing:noteOwner!==noteNewOwner&&!noteRecords().some(n=>n.id===noteOwner),invalid:noteInvalid.has(noteOwner),esc,btn});}
function focusNote(id){const control=[...document.querySelectorAll('[data-act="open-note"]')].find(e=>e.dataset.note===id);(control||document.querySelector('[data-act="add-note"]'))?.focus();}
function noteFeedback(){
 for(const id of noteDeleteFailures.keys())if(!noteRecords().some(n=>n.id===id))noteDeleteFailures.delete(id);
 if(!['home','notes'].includes(state.route))return;
 const box=document.getElementById('messages');if(!box)return;
 let region=document.getElementById('notes-persistence');if(!region){region=document.createElement('div');region.id='notes-persistence';box.append(region);}
 const focused=document.activeElement?.closest('#notes-persistence')?document.activeElement?.dataset.act:null;
 const current=state.route==='notes';
 const saveRows=[...noteSaveFailures].map(owner=>{const d=noteDrafts.get(owner);if(!d)return '';const own=current&&owner===noteOwner;return `<div class="note-recovery"><p class="error" id="note-save-warning-${owner===noteNewOwner?'new':esc(owner)}">Could not save note “${esc(noteDisplay(d))}”. These changes are not saved. Keep this tab open and retry; reloading loses unsaved drafts.</p>${own?btn('Retry save note “'+esc(noteDisplay(d))+'”','retry-save-note','',`data-note-owner="${esc(owner)}"`):''}</div>`;}).join('');
 const deleteRows=[...noteDeleteFailures].map(([id,label])=>`<div class="note-recovery"><p class="error">Could not delete note “${esc(label)}”. The deletion is not saved; the record is still saved in this browser. Return to this note to retry or dismiss this attempted deletion.</p>${current&&noteOwner===id?btn('Retry delete note “'+esc(label)+'”','retry-delete-note','',`data-note-owner="${esc(id)}"`)+btn('Dismiss attempted deletion','dismiss-note-delete','quiet',`data-note-owner="${esc(id)}"`):''}</div>`).join('');
 region.innerHTML=saveRows+deleteRows;
 if(current){const unsaved=noteSaveFailures.has(noteOwner);for(const el of document.querySelectorAll('[data-note-field]')){const ids=[...(noteInvalid.has(noteOwner)?['note-content-error']:[]),...(unsaved?['note-save-warning-'+(noteOwner===noteNewOwner?'new':noteOwner)]:[])];if(ids.length)el.setAttribute('aria-describedby',ids.join(' '));else el.removeAttribute('aria-describedby');}}
 if(focused)region.querySelector(`[data-act="${focused}"][data-note-owner="${CSS.escape(noteOwner)}"]`)?.focus();
 if(saveRows||deleteRows)document.getElementById('status').textContent='Note actions are not saved. Keep this tab open to recover them.';
}
function noteCommit(){
 const owner=noteOwner,d=noteDraft(),records=noteRecords(),existing=owner!==noteNewOwner;
 if(existing&&!records.some(n=>n.id===owner)){message='';render();return;}
 if(!d.title.trim()&&!d.body.trim()){noteInvalid.add(owner);message='';render();document.getElementById('note-entry-title')?.focus();return;}
 noteInvalid.delete(owner);
 const notes=existing?records.map(n=>n.id===owner?{...n,title:d.title,body:d.body}:n):[...records,{id:d.id,title:d.title,body:d.body}];
 if(persist({...state,notes,route:'home'})){noteDrafts.delete(owner);noteSaveFailures.delete(owner);message='';render();focusNote(d.id);if(!noteSaveFailures.size&&!noteDeleteFailures.size)document.getElementById('status').textContent='Note saved in this browser.';}
 else{noteSaveFailures.add(owner);message='';render();document.querySelector('[data-act="retry-save-note"]')?.focus();}
}
function noteDelete(id){
 if(state.route!=='notes'||noteOwner!==id)return;
 const n=noteRecords().find(n=>n.id===id);if(!n){noteDeleteFailures.delete(id);message='';render();return;}
 if(!confirm('Delete note "'+noteDisplay(n)+'" from this browser? This removes the saved note.'))return;
 if(persist({...state,notes:noteRecords().filter(n=>n.id!==id),route:'home'})){noteDeleteFailures.delete(id);noteDrafts.delete(id);noteSaveFailures.delete(id);noteInvalid.delete(id);message='';render();focusNote();if(!noteSaveFailures.size&&!noteDeleteFailures.size)document.getElementById('status').textContent='Note deleted from this browser.';}
 else{noteDeleteFailures.set(id,noteDisplay(n));message='';render();document.querySelector('[data-act="retry-delete-note"]')?.focus();}
}
function noteInput(el){noteDraft()[el.dataset.noteField]=el.value;if(noteInvalid.has(noteOwner)&&(noteDraft().title.trim()||noteDraft().body.trim())){noteInvalid.delete(noteOwner);document.getElementById('note-content-error')?.remove();for(const f of document.querySelectorAll('[data-note-field]')){f.removeAttribute('aria-invalid');f.removeAttribute('aria-describedby');}}noteFeedback();}
function noteAction(a,el){
 if(a==='add-note'||a==='open-note'){const owner=a==='add-note'?noteNewOwner:el.dataset.note;if(owner!==noteNewOwner&&!noteRecords().some(n=>n.id===owner))return true;noteOwner=owner;noteDraft();go('notes');return true;}
 if(state.route!=='notes')return false;
 if(a==='save-note'){noteCommit();return true;}
 if(a==='retry-save-note'){if(el.dataset.noteOwner===noteOwner&&noteSaveFailures.has(noteOwner))noteCommit();return true;}
 if(a==='delete-note'){noteDelete(noteOwner);return true;}
 if(a==='retry-delete-note'){if(el.dataset.noteOwner===noteOwner&&noteDeleteFailures.has(noteOwner))noteDelete(noteOwner);return true;}
 if(a==='dismiss-note-delete'){if(el.dataset.noteOwner===noteOwner)noteDeleteFailures.delete(noteOwner);render();return true;}
 if(a==='cancel-note'){const id=noteOwner;noteDrafts.delete(id);noteSaveFailures.delete(id);noteInvalid.delete(id);state={...state,route:'home'};message='';render();focusNote(id);return true;}
 return false;
}
// END P4 personal notes.
// BEGIN P5a reflection-default preference: an attempted default is staged in
// this tab and shared state.profile.format stays the LAST SUCCESSFULLY
// PERSISTED value until a preference write succeeds. Unrelated saves never
// commit a denied attempt; the new-question consumer reads the committed value.
const FORMAT_PREFS={guided:'Guided prompts',free:'Free-text reflection'};
const formatPreference={committed:'guided',attempted:'guided',failed:false};
function formatPreferenceCommitted(){formatPreference.committed=state.profile.format==='free'?'free':'guided';return formatPreference.committed;}
function formatPreferenceFeedback(){const el=document.getElementById('defaultFormat');if(!el)return;el.removeAttribute('aria-invalid');el.removeAttribute('aria-describedby');document.getElementById('format-preference-status')?.remove();if(!formatPreference.failed||formatPreference.attempted===formatPreferenceCommitted())return;el.setAttribute('aria-invalid','true');el.setAttribute('aria-describedby','format-preference-warning');const div=document.createElement('div');div.id='format-preference-status';div.className='format-preference';div.innerHTML=`<p class="error" id="format-preference-warning">Not saved: “${esc(FORMAT_PREFS[formatPreference.attempted])}” is shown here as your new default, but this browser still has “${esc(FORMAT_PREFS[formatPreferenceCommitted()])}” saved. If you reload this page, this choice is not saved and will be lost.</p>${btn('Retry saving the reflection default','retry-format')}`;el.closest('.field').after(div);}
function formatPreferenceCommit(isRetry){const el=document.getElementById('defaultFormat');if(!el)return;const target=isRetry?formatPreference.attempted:(FORMAT_PREFS[el.value]?el.value:formatPreferenceCommitted());formatPreference.attempted=target;const committed=formatPreferenceCommitted();if(target===committed){formatPreference.failed=false;render();if(isRetry)document.getElementById('defaultFormat')?.focus();return;}if(persist({...state,profile:{...state.profile,format:target}})){formatPreferenceCommitted();formatPreference.failed=false;message='';render();document.getElementById('status').textContent='Saved: new reviews now default to '+FORMAT_PREFS[target]+'.';}else{formatPreference.failed=true;message='';render();const again=document.querySelector('[data-act="retry-format"]')||document.getElementById('defaultFormat');again?.focus();document.getElementById('status').textContent='Reflection default “'+FORMAT_PREFS[target]+'” is shown but not saved.';}}
// END P5a reflection-default preference helper.
// BEGIN P5b step3 intermediate: tab-local Settings profile edit draft. While
// editingProfile is active, staged profile-field values (target/exam/tutor/
// notSure/notBooked/resources) live in this tab-local draft and are NOT persisted; the edit-profile entry
// resets the draft and tab-local cursor; configure prefers draft values,
// and the input dispatcher writes the draft instead of state.profile. Onboarding
// (editingProfile false) and shared persist/go/P5a/reset paths are unchanged.
// Step navigation is tab-local: entry resets profileEditStep without
// touching state.step/state.editingProfile or persisting, and edit-mode
// Next (steps 0-2) and Back (>0) move only the local cursor; edit-mode Next
// applies the ORIGINAL gate rules and messages to the STAGED draft view
// (profileEditDraft full clone when present, else the committed profile),
// invalid Next keeps the cursor put with zero writes and no root
// resourcesAnswered change.
// Explicit Cancel now discards the tab-local draft/archive/composer/cursor
// and returns to Settings with zero persistence. Dirty nav/brand departures
// now raise the in-page Save/Discard/Stay region, including a dirty
// Back press on the editor's first step; denied-save Cancel
// recovery, clean-departure provability,
// complex resource discard variants and legacy resume remain later
// verticals; after a forced reload the tab-local draft is empty and typing
// resumes the pre-existing live-autosave behavior (known intermediate
// limitation, not a recovery guarantee).
let profileEditDraft=null;
// While editingProfile is active, the known-provider archive is mirrored into
// this tab-local CLONE of state.providerArchive (never the live root slice):
// provider toggles stage into profileEditDraft.resources plus this clone and
// never call persist(); it resets at edit-profile entry and clears after a
// SUCCESSFUL final Save (never on a failed or invalid Save).
let profileEditArchive=null;
// While editingProfile is active, the Other composer is mirrored into this
// tab-local CLONE of state.onboardingOther (or a fresh default when the root
// slice is absent; structuredClone lets any unknown extra metadata ride along,
// and the durable root is NEVER mutated or created). The checkbox/name/
// material handlers, the draft commit helper and the resourceFields read seam
// touch only this composer and never call persist(); it resets at edit-profile
// entry and clears after a SUCCESSFUL final Save (never on a failed or
// invalid Save).
let profileEditOther=null;
// While editingProfile is active, the four-step cursor is mirrored into this
// tab-local copy. The edit-profile entry resets it to 0; edit-mode Next/Back
// only advance/decrement it and re-render; configure and render read it
// through effectiveStep(); the invalid-Save redirect writes it, never
// state.step; and it clears ONLY after a SUCCESSFUL final Save (never on a
// denied persist). state.step and state.editingProfile are NEVER mutated by
// entry, intermediate Next or Back >0. Back at 0 inside an edit session
// now goes through the departure flow; the untouched onboarding Back
// body is NOT covered by this isolation claim.
let profileEditStep=null;
function profileDraftRead(name){return editingProfile&&profileEditDraft&&name in profileEditDraft?profileEditDraft[name]:undefined;}
function profileDraftWrite(name,value){if(!editingProfile)return false;profileEditDraft??=structuredClone(state.profile);profileEditDraft[name]=value;return true;}
// Effective step: the tab-local edit cursor while an edit session owns one,
// otherwise the durable root step. Never writes; never persists.
function effectiveStep(){return editingProfile&&profileEditStep!==null?profileEditStep:state.step;}
// Save (intermediate): overlay ONLY the staged draft keys (target/exam/
// tutor/notSure/notBooked/resources) onto the LATEST state.profile, validate the WHOLE merged profile
// before the single persist. Invalid field: the tab-local step cursor moves
// to its step (in-memory only, never persisted), the draft value is shown
// there, showError marks/focuses it, nothing is applied. Denied persist: the
// existing persist() edit-view error path fires and profileEditDraft stays
// intact so Save-again is the explicit retry. Known-provider
// checkboxes now stage through the draft plus a tab-local archive clone;
// remove-resource now stages through the draft with zero persistence;
// the Other composer now stages through a tab-local profileEditOther clone
// with zero persistence (the durable root onboardingOther is never mutated);
// add-resource still mutates live
// (known deferred limitation; notSure, notBooked and resources also stage).
function profileDraftInvalid(p){
if(!p.notSure&&(!/^\d+$/.test(String(p.target))||!Number.isInteger(Number(p.target))||Number(p.target)<900||Number(p.target)>2700))return {step:0,field:'target',msg:'Enter a whole-number target from 900 to 2700, or choose Not sure yet.'};
if(!p.notBooked&&!validExam(p.exam))return {step:1,field:'exam',msg:'Choose a real exam date today or later, or select Not booked yet.'};
if(!p.tutor)return {step:3,field:'tutor',msg:'Choose your tutor status.'};
return null;
}
// Departure bookkeeping is tab-local and never persisted: where the user
// tried to go (captured route + a refocus SELECTOR STRING, because render()
// rebuilds the header and disconnects the clicked node), plus the edit-entry
// baseline (owned six profile keys, owned composer fields, providerArchive
// key set) used for the dirty comparison. Reloading loses all of it; only a
// committed Save or the permitted navigation-only Discard write survives.
let profilePendingDeparture=null,profileEditBaseline=null;
const PROFILE_OWN_KEYS=['target','notSure','exam','notBooked','tutor','resources'];
function profileEditBaselineNow(){const p=state.profile,o=state.onboardingOther??{other:false,otherName:'',otherMaterials:[]};return {profile:Object.fromEntries(PROFILE_OWN_KEYS.map(k=>[k,structuredClone(p[k]??null)])),other:{other:!!o.other,otherName:o.otherName??'',otherMaterials:structuredClone(o.otherMaterials??[])},archive:Object.keys(structuredClone(state.providerArchive??{})).sort(),archiveContents:structuredClone(state.providerArchive??{})};}
// Dirty = any OWNED draft field diverging from the baseline, plus owned
// composer fields (unknown composer metadata rides along and is never
// editable) and an added archive key whose stored value is NOT the exact
// generated default entry array for that provider index. Pure check-then-
// archive round-trip bookkeeping (the factory default the handler itself
// inserts) is clean; a non-canonical or out-of-range key, or an added entry
// differing in any field, order or extra metadata, stays dirty. Content
// changes on keys already present at baseline are compared against their
// captured contents, including user-authored materials. Never compares
// format, unknownProfile, unknownRoot, root step or resourcesAnswered.
function profileEditDirty(){if(!editingProfile||!profileEditBaseline)return false;const d=profileEditDraft??state.profile,b=profileEditBaseline;for(const k of PROFILE_OWN_KEYS)if(JSON.stringify(d[k]??null)!==JSON.stringify(b.profile[k]))return true;const o=profileEditOther;if(o&&(!!o.other!==b.other.other||String(o.otherName??'')!==b.other.otherName||JSON.stringify(o.otherMaterials??[])!==JSON.stringify(b.other.otherMaterials)))return true;const ar=profileEditArchive;if(ar){const ka=Object.keys(structuredClone(ar)).sort();for(const k of ka){if(b.archive.includes(k)){if(JSON.stringify(ar[k])!==JSON.stringify(b.archiveContents[k]))return true;continue;}if(!/^(0|[1-9]\d*)$/.test(k)||Number(k)>=providers.length)return true;const i=Number(k),gen=[{id:'provider-'+i,name:providers[i],materials:providerMaterials(i),provenance:i===1?'Joseph-confirmed':'provider-information'}];if(JSON.stringify(ar[k])!==JSON.stringify(gen))return true;}}return false;}
// Shared profile-scoped commit helper (contract §12/§14), extracted verbatim
// from the existing final-Save branch: six-key merge onto the LATEST
// state.profile (preserves format and unknown fields), WHOLE-profile
// validation, single persist, destination as parameter. Invalid: local step
// cursor moves, render, showError focuses the bad field, draft+intent kept.
// Denied persist: existing persist() edit-view error path fires, nothing
// cleared, Save-again stays the explicit retry. ONLY success clears the
// tab-local holders.
function profileEditCommit(route){const merged={...state.profile,...(profileEditDraft?{target:profileEditDraft.target,exam:profileEditDraft.exam,tutor:profileEditDraft.tutor,notSure:profileEditDraft.notSure,notBooked:profileEditDraft.notBooked,resources:profileEditDraft.resources}:{})},bad=profileDraftInvalid(merged);if(bad){profileEditStep=bad.step;render();showError(bad.msg,[bad.field]);return false;}if(persist({...state,profile:merged,complete:true,route,...('editingProfile' in state?{editingProfile:false}:{})})){editingProfile=false;profileEditStep=null;profileEditDraft=null;profileEditArchive=null;profileEditOther=null;profilePendingDeparture=null;profileEditBaseline=null;render();return true;}return false;}
function profileDepartureRegion(){if(!editingProfile||!profilePendingDeparture)return '';return `<section class="p5b-departure" role="region" aria-label="Unsaved profile changes"><p>You have unsaved profile changes. If you reload this page, these changes will be lost.</p><div class="actions split">${btn('Save','departure-save','primary')}${btn('Discard','departure-discard','quiet')}${btn('Stay','departure-stay','quiet')}</div></section>`;}
function profileDepartureChoice(a){const intent=profilePendingDeparture;if(!editingProfile||!intent)return;
if(a==='departure-stay'){profilePendingDeparture=null;render();document.querySelector(intent.focusSelector)?.focus({preventScroll:true});return;}
if(a==='departure-discard'){const next={...state,...('editingProfile' in state?{editingProfile:false}:{}),route:intent.route};if(persist(next)){editingProfile=false;profilePendingDeparture=null;profileEditBaseline=null;profileEditDraft=null;profileEditArchive=null;profileEditOther=null;profileEditStep=null;render();}else render();return;}
if(a==='departure-save'){profileEditCommit(intent.route);}}
// END P5b step3 draft seam.
formatPreferenceCommitted();
function go(route){state.route=route;message='';persist();render();}
// ui-cloud first slice: optional explicit account-access connection seam
// (contract decision 3). No global window auth detection, no MutationObserver;
// attachAccountAccess registers an injected controller and returns teardown.
let accountAccessController=null;
function accountAccessLifecycle(){
if(!accountAccessController)return;
const slot=state.route==='settings'?document.getElementById('account-access-slot'):null;
if(slot)accountAccessController.mount(slot);else accountAccessController.unmount();
}
export function attachAccountAccess(controller){
if(!controller||typeof controller.mount!=='function'||typeof controller.unmount!=='function'||typeof controller.handleSessionChange!=='function')throw new TypeError('attachAccountAccess requires an account-access controller');
// Lifecycle repair 1 (lifecycle-review-repairs.md): unmount the outgoing
// controller BEFORE overwriting the owner. Replacement invalidates the old
// controller's in-flight intent even though its returned detach stays a
// no-op via the identity guard below (old detachA can never detach B).
if(accountAccessController&&accountAccessController!==controller)accountAccessController.unmount();
accountAccessController=controller;
accountAccessLifecycle();
return ()=>{if(accountAccessController!==controller)return;accountAccessController=null;controller.unmount();};
}
// ui-cloud account-history contract FIRST LIST VERTICAL: optional explicit
// History account-catalogue connection seam (contract decision: narrow app
// seam only). No global window auth detection, no MutationObserver;
// attachAccountHistory registers an injected controller and returns teardown.
let accountHistoryController=null;
function accountHistoryLifecycle(){
if(!accountHistoryController)return;
const slot=state.route==='history'?document.getElementById('account-history-slot'):null;
if(slot)accountHistoryController.mount(slot);else accountHistoryController.unmount();
}
export function attachAccountHistory(controller){
if(!controller||typeof controller.mount!=='function'||typeof controller.unmount!=='function'||typeof controller.handleSessionChange!=='function')throw new TypeError('attachAccountHistory requires an account-history controller');
// Accepted replacement lifecycle: unmount the outgoing controller BEFORE
// overwriting the owner; the returned detach keeps the identity guard so an
// old detachA can never detach B.
if(accountHistoryController&&accountHistoryController!==controller)accountHistoryController.unmount();
accountHistoryController=controller;
accountHistoryLifecycle();
return ()=>{if(accountHistoryController!==controller)return;accountHistoryController=null;controller.unmount();};
}
// ui-cloud account-analytics FIRST TRACER (account-analytics-first-slice-
// contract.md): optional explicit Progress account-analytics connection seam,
// mirroring the accepted attachAccountHistory shape-check/replacement/detach
// lifecycle byte-for-byte in structure. A small SEPARATE controller owns the
// complete-snapshot lifecycle so History's mounted, unmount-invalidated list
// is never reused as analytics. The DEFAULT with no attached controller keeps
// the browser-local Progress page unchanged; nothing here merges account data
// into state.mocks/used/savedIds or durable storage.
let accountProgressController=null;
function accountProgressLifecycle(){
if(!accountProgressController)return;
const slot=state.route==='progress'?document.getElementById('account-progress-slot'):null;
if(slot)accountProgressController.mount(slot);else accountProgressController.unmount();
}
export function attachAccountProgress(controller){
if(!controller||typeof controller.mount!=='function'||typeof controller.unmount!=='function'||typeof controller.handleSessionChange!=='function')throw new TypeError('attachAccountProgress requires an account-progress controller');
if(accountProgressController&&accountProgressController!==controller)accountProgressController.unmount();
accountProgressController=controller;
accountProgressLifecycle();
return ()=>{if(accountProgressController!==controller)return;accountProgressController=null;controller.unmount();};
}
// BEGIN account-save first vertical: optional explicit account final-save
// connection seam (account-save-first-vertical-contract.md). The DEFAULT with
// NO attached controller preserves the existing anonymous browser-only Save
// path byte-for-byte below. Attaching selects the cloud final-save mode
// (clearly labelled fictional test-account saving); while attached but
// signed-out/loading, the final Save is refused with sanitized copy and does
// NOT silently fall back to the browser-local Save. Draft creation and review
// autosaves stay explicitly browser-local; the final confirmation is an
// intentional copy of the selected draft to this account, never a migration
// of saved local records. The account record is never merged into
// state.mocks/used/savedIds and never written to localStorage; the ONLY
// permitted local mutation after a validated receipt is clearing the
// unchanged original draft (and the route) through the existing synchronous
// persist().
let accountSaveController=null,accountSaveMessage='',accountSaveDiscardedMessage='',accountSaveDiscardError='';
// fm1firstmilestone (GPT-approved architecture): a SEPARATE tab-local,
// account-only milestone acknowledgement variable (renamed
// accountSaveAcknowledgement by the fm6 second-milestone slice for clarity;
// exact inverse of the first-only name). It is NEVER stored in
// pendingMockAcknowledgement (the anonymous browser-local path), NEVER
// persisted, NEVER mixed with local history, and NEVER synthesized from a
// clone. It is derived only from the ACTUAL authoritative getMock detail, the
// RETAINED true-created server acknowledgement already supplied to this
// seam, and (for the second milestone ONLY) the complete ephemeral prior
// account summary snapshot the controller collected BEFORE the commit under
// the same queue intent, applied only after the cleanup persist succeeds.
let accountSaveAcknowledgement=null;
const ACCOUNT_SAVE_UNVERIFIED='Account access could not be verified. This mock was not saved to your account and your draft is unchanged.';
// Missing-record resolution (approved policy): the local-only discard
// acknowledgement shown after a CONFIRMED discard of a missing record's
// draft — never the saved-to-account success copy, because the missing
// record is not treated as extant and nothing was applied at the seam.
const ACCOUNT_SAVE_DISCARDED='Discarded the local draft for the missing saved record in this browser. Nothing was saved again and no new save was counted; your local mock records, counter and saved history are untouched.';
// Truthful denial line (approved): the local write failed — the draft is
// still here. It replaces ONLY this seam's misleading generic persist
// message; nothing is claimed cleared and the queue/phase/lock stay.
const ACCOUNT_SAVE_DISCARD_DENIED='Could not discard this local draft. It is still here.';
function accountSaveQueued(){const d=state.draft;if(!d||!['selection','review'].includes(state.route))return null;return {id:d.id,route:state.route,version:JSON.stringify(d),clone:structuredClone(d)};}
// Draft OWNERSHIP (separated from view eligibility per the approved
// lifecycle architecture): the ORIGINAL draft identity and exact JSON
// version are still here and never saved locally — NO route check. Used
// only to defer a COMMITTED receipt across a Home departure; never to apply.
function accountSaveOwnsDraft(queued){return !!state.draft&&state.draft.id===queued.id&&JSON.stringify(state.draft)===queued.version&&!state.savedIds.includes(queued.id);}
// Existing application guard, behavior byte-identical: ownership AND the
// original route (no cleanup/apply while the view is away).
function accountSaveGuard(queued){return accountSaveOwnsDraft(queued)&&state.route===queued.route;}
function accountSaveApply(queued,mock,ack,prior){
accountSaveMessage='';
const next={...state,draft:null,current:null,route:'history',reviewIndex:-1};
// Cloud-commit cleanup seam: a denied draft-clear persist here happens
// AFTER an acknowledged account debit, so the generic browser-local
// "allowance was not consumed" copy that persist() sets would contradict
// the committed state. Drop only this seam's misleading generic message;
// the account-save controller owns the accurate saved-but-cleanup-pending
// copy and Retry. Other persist callers and messages are unchanged.
if(!persist(next)){message='';return false;}
// fm1firstmilestone (GPT-approved architecture): derive the FIRST-milestone
// acknowledgement ONLY after the cleanup persist succeeded, ONLY from the
// ACTUAL authoritative getMock detail plus the RETAINED server acknowledgement
// already supplied by the unchanged controller, under strict identity gates:
// true-created (no created:false replay), used===1 (the server's cumulative
// counter proves the first-ever save; deletion never resets it), and BOTH ack
// and detail bound to the original queued id. Transient account-only helper
// inputs on the unchanged mockSaveFeedback policy (before = the empty ledger
// the server proves for a first save — no prior list fetch is needed for this
// first-only slice since ack.used===1 shows there were no prior saves; next =
// the ONE acknowledged commit). Never persisted, never merged into local
// history, never synthesized from the draft clone.
if(ack&&ack.created===true&&ack.used===1&&ack.id===queued.id&&mock&&mock.id===queued.id){
const derived=mockSaveFeedback({mocks:[],used:0,savedIds:[]},{mocks:[mock],savedIds:[mock.id],used:ack.used},queued.id);
if(derived&&derived.kind==='first')accountSaveAcknowledgement=derived;
}
// fm6secondmilestone (GPT-approved architecture): extend ONLY the second
// (ack.used>=2) second-or-later true-created branch. Required gates, all on ACTUAL values:
// true-created ack (created:false idempotent replays stay silent), the
// server's cumulative used>=2, queue/ack/detail ID agreement, and a
// COMPLETE owned pre-commit prior summary snapshot supplied as the optional
// fourth seam.apply argument by the controller (never rebuilt after the
// commit — a post-uncertain-commit snapshot could already include the new
// record — and dropped with the queue on any invalidation so it can never
// cross a session/view owner). A snapshot that already carries the new
// literal ID suppresses the presentation conservatively (same-ID replay
// never earns a second-milestone encouragement). Helper inputs are transient
// account-ONLY: before = the prior summary objects + the server-proven
// used-1 (never the browser counters), savedIds = the PRIOR LITERAL summary
// IDs (the cumulative server count drives used; list length is not the
// truth), next = prior + the ACTUAL acknowledged new detail at ack.used with
// savedIds extended by the new ID. The unchanged mockSaveFeedback helper is
// the only copy authority (kind 'second' or a PB kind; fm12pb + fm13section
// GREEN: this presents the helper's 'second', 'overall' and section-only
// 'sections' kinds — any generic third feedback remains
// deliberately NOT presented, so no PB may be mislabelled as encouragement).
// Never persisted, never merged into state.mocks/used/savedIds.
if(ack&&ack.created===true&&Number.isInteger(ack.used)&&ack.used>=2&&ack.id===queued.id&&mock&&mock.id===queued.id
 &&prior&&Array.isArray(prior.summaries)&&Array.isArray(prior.savedIds)
 &&prior.summaries.length===prior.savedIds.length
 &&!prior.savedIds.includes(queued.id)){
const derived=mockSaveFeedback({mocks:prior.summaries,used:ack.used-1,savedIds:prior.savedIds},{mocks:[...prior.summaries,mock],savedIds:[...prior.savedIds,mock.id],used:ack.used},queued.id);
if(derived&&(derived.kind==='second'||derived.kind==='overall'||derived.kind==='sections'))accountSaveAcknowledgement=derived;
}
accountSaveMessage='Saved to your account (fictional test-account saving). The unchanged browser draft was cleared; your local mock records, counter and saved history are untouched.';
if(accountHistoryController&&typeof accountHistoryController.openSaved==='function')accountHistoryController.openSaved(queued.id);
return true;
}
// Missing-record resolution (approved): the controller's dedicated DISCARD
// seam for an acknowledged record that can no longer be found. It reuses the
// SAME synchronous persist the save cleanup uses but a LOCAL-ONLY next state
// (Home, no draft, no current): it NEVER calls accountSaveApply/openSaved/
// done — a missing record is not treated as extant. Only the original draft
// ID, exact version and original route are cleared; every other local slice
// is spread through unchanged. A denied write suppresses ONLY this seam's
// misleading generic allowance-not-consumed persist message; the original
// draft, queue, phase and lock stay and the truthful still-here line shows.
function accountSaveDiscard(queued){
const next={...state,draft:null,current:null,route:'home',reviewIndex:-1};
if(!persist(next)){message='';return false;}
return true;
}
// Cancel-first, accessible DISCARD dialog (deliberately NOT the 'Log this
// mock' save dialog and never its save callback). Captures the ORIGINAL
// queued ref retained from queue activation, the exact draft version, the
// route and the controller identity at OPEN time, and rechecks everything
// synchronously on ACCEPT before the controller's synchronous guards and
// local write — no await between. Cancel/Escape perform zero mutation and
// zero network; focus returns to the initiating control. A stale snapshot
// (draft/route changed while the dialog was open, e.g. an account switch
// invalidating the queue) refuses with no local write and dismisses safely.
function confirmMissingDraftDiscard(commit,origin){
if(document.getElementById('missing-draft-discard')||!accountSaveController||!state.draft)return;
const controller=accountSaveController;
const queued=controller.retained();
if(!queued||queued.id!==state.draft.id||queued.route!==state.route)return;
const id=state.draft.id,route=state.route,snapshot=JSON.stringify(state.draft);
const dialog=document.createElement('dialog');dialog.id='missing-draft-discard';dialog.className='mock-save-confirmation';dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','missing-draft-discard-question');dialog.setAttribute('aria-describedby','missing-draft-discard-description');
dialog.innerHTML=`<h2 id="missing-draft-discard-question">Discard this browser draft?</h2><p id="missing-draft-discard-description">This clears only the browser-local draft. Nothing is saved again, no save is counted, and a discard never recreates a saved account record.</p><div class="actions"><button type="button" id="missing-draft-discard-cancel" autofocus>Keep this draft</button><button type="button" id="missing-draft-discard-confirm" class="danger">Discard local draft</button></div>`;
let settled=false;const finish=accept=>{if(settled)return;settled=true;dialog.close();dialog.remove();if(origin?.isConnected)origin.focus({preventScroll:true});if(!accept)return;if(controller!==accountSaveController||state.route!==route||state.draft?.id!==id||JSON.stringify(state.draft)!==snapshot){showError('This draft or account changed. Check your draft before discarding again.');return;}commit();};
dialog.addEventListener('keydown',e=>{if(e.key!=='Tab'||e.ctrlKey||e.altKey||e.metaKey)return;const cancel=dialog.querySelector('#missing-draft-discard-cancel'),confirm=dialog.querySelector('#missing-draft-discard-confirm');if(e.shiftKey&&document.activeElement===cancel){e.preventDefault();confirm.focus();}else if(!e.shiftKey&&document.activeElement===confirm){e.preventDefault();cancel.focus();}});dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});dialog.querySelector('#missing-draft-discard-cancel').addEventListener('click',()=>finish(false));dialog.querySelector('#missing-draft-discard-confirm').addEventListener('click',()=>finish(true));document.body.append(dialog);dialog.showModal();dialog.querySelector('#missing-draft-discard-cancel').focus();
}
function accountSaveStart(el){
// Repeat submission while a cloud save is pending: no second request, no new
// confirmation, feedback region already shows the pending state.
if(accountSaveController&&accountSaveController.getState().phase==='pending')return true;
const queued=accountSaveQueued();
if(!queued||!accountSaveController.beginConfirmation(queued)){showError(ACCOUNT_SAVE_UNVERIFIED);return true;}
accountSaveMessage='';
confirmMockLog(()=>{if(!accountSaveController||!accountSaveController.confirmSave(queued))showError(ACCOUNT_SAVE_UNVERIFIED);},el);
return true;
}
function accountSaveFeedback(){
accountSaveController&&accountSaveController.renderFeedback(document.getElementById('messages'),state.route);
// Truthful denied-discard line (approved): shown ONLY while this seam's
// discard attempt failed; the original draft, queue, missing phase and lock
// stay exactly as they were and nothing is claimed cleared.
if(accountSaveDiscardError&&accountSaveController&&accountSaveController.getState().phase==='acknowledged-record-missing'){const box=document.getElementById('messages');if(box){const p=document.createElement('p');p.className='error';p.dataset.accountSave='discard-error';p.textContent=accountSaveDiscardError;box.append(p);}}
// The completed acknowledgement is drawn exactly once: render() rebuilds
// #messages on every call, so the message is cleared right after appending.
if(accountSaveMessage&&state.route==='history'){const box=document.getElementById('messages');if(box){const p=document.createElement('p');p.className='small';p.dataset.accountSave='done';p.textContent=accountSaveMessage;box.append(p);accountSaveMessage='';}}
// fm1firstmilestone + fm6secondmilestone + fm12pb + fm13sectionpb: the
// derived FIRST/SECOND/OVERALL/SECTIONS account-save acknowledgement (only
// those four kinds can ever be stored above)
// renders exactly once on
// its own accessible leaf beside the done line on the History route, through
// a textContent assignment (the helper copy is never treated as markup), is
// announced once through the existing polite status, and the tab-local
// reference is consumed immediately after rendering — never an indefinite
// feedback state, never a reopen/foreign/replay reuse. No confetti for the
// milestones (the unchanged helper returns record:false for both kinds).
if(accountSaveAcknowledgement&&state.route==='history'){const box=document.getElementById('messages');if(box){const p=document.createElement('p');p.id='mock-acknowledgement';p.className='mock-acknowledgement';p.dataset.feedbackKind=accountSaveAcknowledgement.kind;p.textContent=accountSaveAcknowledgement.text;box.append(p);if(accountSaveAcknowledgement.record===true)playMockRecordConfetti();const status=document.getElementById('status');if(status)status.textContent+=' '+accountSaveAcknowledgement.text;accountSaveAcknowledgement=null;}}
// The confirmed missing-record discard acknowledgement (approved): shown
// ONLY on the local route it moved to, and ONLY the local-draft-discard
// copy — never the saved-to-account/done message for a missing record.
if(accountSaveDiscardedMessage&&state.route==='home'){const box=document.getElementById('messages');if(box){const p=document.createElement('p');p.className='small';p.dataset.accountSave='local-draft-discarded';p.textContent=accountSaveDiscardedMessage;box.append(p);accountSaveDiscardedMessage='';}}
if(state.route!=='history')accountSaveMessage='';
if(state.route!=='history')accountSaveAcknowledgement=null; // never carried across a departure before its single render
if(state.route!=='home')accountSaveDiscardedMessage='';
}
// BEGIN submitted-draft read-only lock (Joseph-approved interaction choice:
// temporarily lock editing until the save outcome is resolved). Scoped to the
// controller's OWNED draft only: account-save.js getState().lockedId is the
// opaque ID of the confirmed-but-unresolved queue (pending / uncertain
// failed / acknowledged-result-unavailable / committed-cleanup-pending), null
// for the unconfirmed queued dialog, a resolved/cancelled/replaced queue and
// any unrelated draft; the detached/anonymous app never locks and saved-
// review never locks. The retained draft stays READABLE: textual inputs and
// textareas become readOnly, selects/checkboxes and the draft-mutating
// controls are disabled, and the matching input/change/action handler
// entries refuse while locked so a stale control or synthetic event cannot
// mutate the owned draft. Retry lives in the controller region OUTSIDE the
// editor and stays active; navigation and workspace controls are NOT
// disabled (route/account ABA stays the separately-sequenced risk). The
// existing changed-draft receipt guard stays exactly as it was.
const ACCOUNT_SAVE_READONLY_COPY='This submitted draft is read-only while its account save is being resolved. Use Retry if needed.';
// Draft-mutating or draft-recommitting actions refused at the dispatcher
// ENTRY while the owned draft is locked (a stale control or synthetic event
// must not mutate the retained submission). The legacy review-persistence
// Retry ('retry-review', rendered in #messages OUTSIDE the controller
// region) is included: replaying a captured mark/navigate/content intent
// would mutate the locked submitted draft, while settled review retries
// outside a locked submission keep their existing semantics. Navigation,
// the ACCOUNT-save Retry action and every non-draft route stay untouched.
const ACCOUNT_SAVE_LOCK_BLOCKED_ACTS=['save','add-question','mark','continue','back-scores','leave-score','retry-score','review-question','selection','next-question','retry-review'];
function accountSaveLockActive(){
if(!accountSaveController||!state.draft||!['scores','selection','review'].includes(state.route))return false;
let id=null;try{id=accountSaveController.getState().lockedId;}catch{return false;}
return !!id&&id===state.draft.id;
}
function accountSaveLockUi(){
if(!accountSaveLockActive())return;
const box=document.getElementById('messages');
if(box&&!box.querySelector('[data-account-save-lock="note"]')){const p=document.createElement('p');p.className='small';p.dataset.accountSaveLock='note';p.textContent=ACCOUNT_SAVE_READONLY_COPY;box.append(p);}
for(const el of document.querySelectorAll('#main input,#main textarea,#main select')){if(el.closest('[data-account-save]'))continue;if(el.type==='checkbox'||el.type==='radio'||el.tagName==='SELECT')el.disabled=true;else el.readOnly=true;}
for(const act of ACCOUNT_SAVE_LOCK_BLOCKED_ACTS)for(const el of document.querySelectorAll(`#main [data-act="${act}"]`)){if(!el.closest('[data-account-save]'))el.disabled=true;}
}
// END submitted-draft read-only lock.
export function attachAccountSave(controller){
if(!controller||typeof controller.mount!=='function'||typeof controller.unmount!=='function'||typeof controller.handleSessionChange!=='function'||typeof controller.beginConfirmation!=='function'||typeof controller.confirmSave!=='function'||typeof controller.retained!=='function'||typeof controller.renderFeedback!=='function')throw new TypeError('attachAccountSave requires an account-save controller');
if(accountSaveController&&accountSaveController!==controller)accountSaveController.unmount();
accountSaveController=controller;
try{controller.mount(Object.freeze({guard:accountSaveGuard,apply:accountSaveApply,refresh:render,ownsDraft:accountSaveOwnsDraft,discard:accountSaveDiscard}));}catch{accountSaveController=null;throw new TypeError('attachAccountSave requires an account-save controller');}
accountSaveMessage='';accountSaveDiscardedMessage='';accountSaveDiscardError='';accountSaveAcknowledgement=null; // owner-invalidated on attach: no pre-existing milestone feedback survives a controller change
render();
return ()=>{if(accountSaveController!==controller)return;accountSaveController=null;accountSaveMessage='';accountSaveAcknowledgement=null;controller.unmount();render();};
}
// END account-save first vertical seam.
function landing(){return `<div class="landing-hero"><div class="eyebrow">Your UCAT study workspace</div><h1>Turn mock results into <span>your next step.</span></h1><p>Log your scores, reflect on selected questions and keep the practice you choose in one place.</p><div class="landing-actions">${btn('Log your first mock','start','primary')}${btn('See an example','example')}</div></div><section class="example" id="example" aria-label="Example review and raw results"><div class="example-label">Example · fictional results</div><div class="example-flow"><div class="example-output"><div class="demo-label">02 / Review → practise</div><h2>Choose what comes next.</h2><div class="demo-question"><strong>QR · Question 8</strong><p>“Check the units before calculating.”</p><span class="pill">Unit Conversion Error</span></div><div class="demo-line"><span>Manually chosen practice</span></div><p class="small">Revisit unit conversions in my own notes.</p><p class="small">An example of the manual flow, not AI advice.</p></div><div class="example-input analytics-example">${landingAnalytics()}</div></div><p class="flow-caption">Scores first. Selected reviews optional. Practice stays your choice.</p></section><div class="public-foot"><span>Design preview. Only browser-local records.</span>${btn('Preview details','preview-details','quiet')}</div>`;}
// Step C activates the approved layout; the explicit fixture remains for layout regressions.
// Joseph-confirmed Medify configuration, not independently researched feature proof.
export const resourceLayoutFixtureMaterials=Object.freeze({Medify:Object.freeze([...materials])});
const providers=['MedEntry','Medify','PassMedicine','UCAT Ninja'];
const providerId=name=>providers.findIndex(n=>n.toLowerCase().replace(/[^a-z]/g,'')===String(name).toLowerCase().replace(/[^a-z]/g,''));
const providerMaterials=i=>i===1?[...materials]:i===2?[materials[2]]:materials.filter((_,j)=>j!==3);
function validExam(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [y,m,d]=value.split('-').map(Number),v=new Date(y,m-1,d),now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());return v.getFullYear()===y&&v.getMonth()===m-1&&v.getDate()===d&&v>=today;}
function otherDraft(){if(editingProfile)return profileEditOther??=structuredClone(state.onboardingOther??{other:false,otherName:'',otherMaterials:[]});return state.onboardingOther??={other:false,otherName:'',otherMaterials:[]};}
function commitOtherDraft(){const d=otherDraft();if(!d.other)return true;profileEditDraft??=structuredClone(state.profile);const draftResources=profileEditDraft.resources??=[];if(!d.otherName.trim()){showError('Enter a resource name.',['layout-resource-name']);return false;}if(!d.otherMaterials.length){showError('Choose at least one material type.',['layout-other-material-0']);return false;}const name=d.otherName.trim(),i=providerId(name);if(draftResources.some(r=>(i>=0&&(r.id==='provider-'+i||providerId(r.name)===i))||String(r.name).trim().toLowerCase()===name.toLowerCase())){showError('This resource is already selected. Enter a different resource name.',['layout-resource-name']);return false;}draftResources.push({id:i<0?crypto.randomUUID():'provider-'+i,name:i<0?name:providers[i],materials:[...d.otherMaterials],provenance:'student'});profileEditOther={other:false,otherName:'',otherMaterials:[]};return true;}
function commitOther(){if(editingProfile)return commitOtherDraft();const d=otherDraft();if(!d.other)return true;if(!d.otherName.trim()){showError('Enter a resource name.',['layout-resource-name']);return false;}if(!d.otherMaterials.length){showError('Choose at least one material type.',['layout-other-material-0']);return false;}const name=d.otherName.trim(),i=providerId(name);if(state.profile.resources.some(r=>(i>=0&&(r.id==='provider-'+i||providerId(r.name)===i))||String(r.name).trim().toLowerCase()===name.toLowerCase())){showError('This resource is already selected. Enter a different resource name.',['layout-resource-name']);return false;}state.profile.resources.push({id:i<0?crypto.randomUUID():'provider-'+i,name:i<0?name:providers[i],materials:[...d.otherMaterials],provenance:'student'});state.onboardingOther={other:false,otherName:'',otherMaterials:[]};return true;}
function resourceFields(layout=null){if(!layout)layout={resources:profileDraftRead('resources')??state.profile.resources,...otherDraft()};if(layout){
 const selected=layout.resources||[];
 const materialFields=(name,chosen,prefix)=>`<fieldset class="resource-materials"><legend>${esc(name)} materials · required</legend><div class="material-options">${materials.map((m,i)=>check(esc(m),`${prefix}-${i}`,chosen.includes(m)).replace('<input ',`<input id="${prefix}-${i}" `)).join('')}</div></fieldset>`;
 return `<div class="resource-layout"><div class="resource-baseline"><div><strong>Official UK question bank</strong><span class="pill">Included</span></div><p class="small">Question banks · your default resource. Personal access is not verified.</p></div><details class="resource-picker"><summary><span>Add the resources you use</span><span class="small">Choose any</span></summary><fieldset><legend class="sr-only">Study resources</legend>${['MedEntry','Medify','PassMedicine','UCAT Ninja'].map((name,i)=>check(name,`layout-provider-${i}`,selected.some(r=>r.id==='provider-'+i||providerId(r.name)===i))).join('')}${check('Other resource','layout-other',!!layout.other)}</fieldset></details><div class="selected-resources">${layout.other?`<section class="other-materials" aria-label="Other resource details">${field('Resource name · required','layout-resource-name',layout.otherName||'')}${materialFields('Other',layout.otherMaterials||[],'layout-other-material')}${btn('Add resource','add-other')}</section>`:''}${selected.filter(r=>providerId(r.name)<0).map((r)=>`<div class="row"><div><strong>${esc(r.name)}</strong><p>${(r.materials||[]).map(esc).join(' · ')||'Materials not specified'}</p></div>${btn('Remove','remove-resource','quiet',`data-i="${selected.indexOf(r)}" aria-label="Remove ${esc(r.name)}"`)}</div>`).join('')}</div></div>`;
 }return `<div class="resource"><strong>Official question bank</strong> <span class="pill">Included by default</span><p class="small">Profile baseline only; personal access is not verified.</p></div><details open><summary>Add the resources you use</summary>${check('Other resource','otherResource',false)}<div id="other-entry" hidden>${field('Resource name','resourceName')}<fieldset><legend>Available materials · optional</legend>${materials.map((m,i)=>check(m,'material-'+i,false)).join('')}</fieldset>${btn('Add resource','add-resource')}</div></details>${state.profile.resources.map((r,i)=>`<div class="row"><div><strong>${esc(r.name)}</strong><p>${r.materials.map(esc).join(' · ')||'Materials not specified'}</p></div>${btn('Remove','remove-resource','quiet',`data-i="${i}" aria-label="Remove ${esc(r.name)}"`)}</div>`).join('')}`;}
export function configure(layout=null){const p=state.profile;const headings=['What are you aiming for?','When is your exam?','What will you practise with?','Do you have a tutor?'];const descriptions=['Add your target, or leave it open for now.','Not booked yet? You can add a date later.','Keep your available materials in your profile.','This answer does not connect a tutor or share data.'];let body='';
if(effectiveStep()===0){const ns=profileDraftRead('notSure')??p.notSure;body=field('Target score','target',profileDraftRead('target')??p.target,'number',ns?'disabled':'')+check('Not sure yet','notSure',ns);}
if(effectiveStep()===1){const nb=profileDraftRead('notBooked')??p.notBooked;body=field('Exam date','exam',profileDraftRead('exam')??p.exam,'date',nb?'disabled':'')+check('Not booked yet','notBooked',nb);}
if(effectiveStep()===2)body=resourceFields(layout);
if(effectiveStep()===3)body=`<div class="field"><label for="tutor">Tutor status</label><select id="tutor" name="tutor"><option value="">Choose an answer</option>${['Yes','No'].map(v=>`<option ${(profileDraftRead('tutor')??p.tutor)===v?'selected':''}>${v}</option>`).join('')}</select></div>`;
return `<section class="configure"><div class="overline"><span class="small">${editingProfile?'Study profile':'Set up your workspace'}</span><span class="small">Step ${effectiveStep()+1} of 4</span></div><div class="step-line" aria-hidden="true">${[0,1,2,3].map(i=>`<i class="${i<=effectiveStep()?'done':''}"></i>`).join('')}</div>${title(headings[effectiveStep()],descriptions[effectiveStep()])}<div class="formbody">${body}<div class="actions split">${btn('Back','onback')}${editingProfile?btn('Cancel','cancel-profile','quiet'):''}${btn(effectiveStep()===3?(editingProfile?'Save profile':'Open workspace'):'Next','onnext','primary')}</div><p class="small">You can change these answers in Settings.</p>${profileDepartureRegion()}</div></section>`;}
function previewDetails(){return `${title('About this preview')}<div class="settings"><section class="settings-section"><h2>Browser-only, not a live service</h2><p>Records and drafts are stored on this browser only. Do not enter real student information. Clearing browser storage loses this preview’s records.</p><p>Login, cloud storage, tutor sharing, AI, payments and funded access are not connected. Estimated scaled scores use a fixed browser-local conversion; no prediction or official score is produced.</p><p>Browser-local allowance and immutable-score checks are demonstrations, not server-enforced security. Educator tools and the production application are outside this first visual slice.</p>${btn('Back to entry','entry')}</section></div>`;}
function historyRows(n=Infinity){return state.mocks.length?[...state.mocks].reverse().slice(0,n).map(m=>{const total=estimatedMock(m).total;return `<div class="row saved-mock-row"><div><strong>${esc(m.title||'Untitled mock')}</strong><p>${m.provider?esc(m.provider)+' · ':''}Logged ${esc(new Date(m.loggedAt).toLocaleDateString('en-GB'))} · ${m.reviews.length?`${m.reviews.filter(q=>q.reviewed).length}/${m.reviews.length} selected reviewed`:'No questions selected'}</p></div><div class="saved-mock-summary"><p class="saved-mock-score" data-local-score><strong>${total===null?'Unavailable':`${total} / 2700`}</strong></p>${btn('View mock','open-mock','',`data-id="${m.id}"`)}</div></div>`;}).join(''):'<div class="empty">No mocks saved in this browser yet.</div>';}
// P3: Home now renders the approved home-priority composition from the REAL
// state slices via the pure home-page.js presenter. All controls reuse the
// existing dispatch (log/open-mock/history/settings/practice/data-task-check);
// editing, task details, removal and Do again live on the practice route.
function home(){if(practiceError)message=practiceError.text;return homePage({profile:state.profile,tasks:practiceTasks(),mocks:state.mocks,used:state.used,draft:state.draft,notes:noteRecords(),esc});}
// Successful Home completion hides the row; keyboard focus moves to the next
// pending checkbox by original index, else the Add practice control.
function homeFocusAfterCheck(i){if(state.route!=='home')return;const boxes=[...document.querySelectorAll('.hp-tasks-panel [data-task-check]')].filter(k=>Number(k.dataset.taskCheck)>i);const next=boxes[0]||document.querySelector('.hp-tasks-panel [data-task-check]')||document.querySelector('.hp-tasks-panel [data-act="practice"]');if(next){next.focus({preventScroll:true});next.scrollIntoView({block:'nearest'});}}
function practiceView(){if(practiceError)message=practiceError.text;return practicePage({tasks:practiceTasks(),composer:practiceComposer,detail:(t,i)=>practiceDetailsFields(t,i),esc,btn,checked});}
function settings(){const p=state.profile;return `<div class="settings">${title('Settings')}<section class="settings-section"><h2>Goals</h2><dl><div class="setting-row"><dt>Target score</dt><dd>${p.notSure?'Not sure yet':esc(p.target)}</dd></div><div class="setting-row"><dt>Exam date</dt><dd>${p.notBooked?'Not booked yet':esc(p.exam)}</dd></div></dl>${btn('Edit study profile','edit-profile')}</section><section class="settings-section"><h2>Resources</h2><p class="small">Official question bank · included by default, access not verified.</p>${p.resources.map(r=>`<p><strong>${esc(r.name)}</strong><br><span class="small">${r.materials.map(esc).join(' · ')||'Materials not specified'}</span></p>`).join('')}</section><section class="settings-section"><h2>Tutor</h2><p class="small">Profile answer: ${esc(p.tutor)}. No tutor is connected and no data is shared.</p></section><section class="settings-section"><h2>Review preferences</h2><div class="field"><label for="defaultFormat">Default reflection format</label><select id="defaultFormat" name="defaultFormat" ${formatPreference.failed?'aria-invalid="true" aria-describedby="format-preference-warning"':''}><option value="guided" ${(formatPreference.failed?formatPreference.attempted:p.format)==='guided'?'selected':''}>Guided prompts</option><option value="free" ${(formatPreference.failed?formatPreference.attempted:p.format)==='free'?'selected':''}>Free-text reflection</option></select></div><p class="small">Changes affect new reviews. Existing reflection text stays intact.</p><p class="small">AI label suggestions are not connected. Manual labels are available.</p></section><section class="settings-section"><h2>Access</h2><p>${state.used} of 3 cumulative browser-local mock logs used.</p><div id="account-access-slot"></div><p class="small">Deletion does not replenish allowance. No purchased or funded pass is connected. Existing results and question reviews remain available at the limit.</p></section><section class="settings-section"><h2>Preview & data</h2><p class="small">Only this browser stores these records. Login, backend, tutor sharing, AI and payments are not connected. Estimated scaled score conversion is unavailable. Do not enter real student information.</p><p class="small">Local controls are not production authorization. Clearing storage loses this preview’s records. Task completion records activity, not mastery.</p><details><summary>Preview testing tools</summary><p class="small">Resets only this remake’s browser-local demonstration data. It does not affect the rejected preview or a real account.</p>${btn('Reset all preview data','reset','danger')}</details></section></div>`;}
function history(){return `${title('Mock history','Saved scores stay fixed. Question reviews remain editable.')}<div id="account-history-slot"></div>${historyRows()}`;}
const activeMock=()=>state.mocks.find(m=>m.id===state.current);
const work=()=>state.route==='saved-review'?activeMock():state.draft;
function flow(which){return `<div class="flow" role="group" aria-label="Mock logging progress"><span class="${which===0?'current':''}">1 · Scores</span><span class="${which===1?'current':''}">2 · Review</span><span>3 · Save</span></div>`;}
// Score failures and inactive SJT snapshots are tab-local, never durable schema.
let scorePending=false,scoreValidated=false;
const inactiveSjt=new Map();
function toggleSjt(on){const d=state.draft;if(on){const snapshot=inactiveSjt.get(d.id);d.sjt=snapshot?structuredClone(snapshot.sjt):{earned:'',max:''};if(snapshot){const reviews=[...d.reviews];for(const {review,index} of snapshot.reviews)reviews.splice(Math.min(index,reviews.length),0,structuredClone(review));d.reviews=reviews;}inactiveSjt.delete(d.id);}else{inactiveSjt.set(d.id,{sjt:structuredClone(d.sjt),reviews:d.reviews.flatMap((review,index)=>review.section==='SJT'?[{review:structuredClone(review),index}]:[])});d.sjt=null;d.reviews=d.reviews.filter(q=>q.section!=='SJT');}persistScore();render();}
function scoreFeedback(){const box=document.getElementById('messages');if(!box)return;let feedback=document.getElementById('score-persistence');if(!feedback){feedback=document.createElement('div');feedback.id='score-persistence';box.append(feedback);}const focused=document.activeElement?.dataset.act==='retry-score';feedback.innerHTML=scorePending?`<div class="error">Could not save draft to this browser. Draft changes are not saved. Keep this page open; reloading may lose unsaved changes.</div><div class="field">${btn('Retry draft save','retry-score')}</div>`:'';if(scorePending)document.getElementById('status').textContent='Draft changes are not saved.';if(focused)feedback.querySelector('button')?.focus();}
function persistScore(next=state){const saved=persist(next);scorePending=!saved;message='';scoreFeedback();if(state.route==='scores'&&scoreValidated)scoreErrors(validateScores(state.draft),false);if(saved)document.getElementById('status').textContent='Draft saved in this browser.';return saved;}
function scoreNavigate(route,stage){const next={...state,route,draft:stage?{...state.draft,stage}:state.draft};if(persistScore(next))render();}
function scoreRow(s,v){const fixed=s!=='SJT',unit=Number(v.max)===(s==='DM'&&state.draft.dmMode==='weighted'?47:({VR:44,DM:35,QR:36})[s])?(s==='DM'&&state.draft.dmMode==='weighted'?'marks':'questions'):'total';return `<div class="score-row"><div class="section"><strong>${s}</strong><span>${({VR:'Verbal Reasoning',DM:'Decision Making',QR:'Quantitative Reasoning',SJT:'Situational Judgement'})[s]}</span></div><div><label for="${s}-earned">${s} earned</label><input id="${s}-earned" name="${s}-earned" type="number" min="0" step="any" ${fixed?`aria-describedby="${s}-max-label ${s}-max"`:''} value="${esc(v.earned)}"></div><span class="divider" aria-hidden="true">/</span>${fixed?`<div class="score-maximum"><span class="small" id="${s}-max-label">${s} maximum</span><span id="${s}-max" class="fixed-maximum">${esc(v.max)} ${unit}</span></div>`:`<div><label for="${s}-max">${s} maximum</label><input id="${s}-max" name="${s}-max" type="number" min="1" step="any" value="${esc(v.max)}"></div>`}</div>`;}
function scores(){const d=state.draft;for(const [s,max] of [['VR','44'],['QR','36']])if(d.scores[s].max==='')d.scores[s].max=max;return `${flow(0)}<div class="formbody">${title('Log a mock','Enter your earned scores. Cognitive section totals are shown for reference.')}<div class="twocol">${field('Mock name or number · optional','title',d.title)}${field('Provider / source · optional','provider',d.provider)}</div><div class="field"><label for="dmMode">Decision Making scoring mode</label><select id="dmMode" name="dmMode"><option value="questions" ${d.dmMode==='questions'?'selected':''}>35 questions · question-count</option><option value="weighted" ${d.dmMode==='weighted'?'selected':''}>47 marks · partial credit</option></select></div><div class="score-table">${['VR','DM','QR'].map(s=>scoreRow(s,d.scores[s])).join('')}</div>${check('Record SJT · optional, kept separate','includeSjt',!!d.sjt)}${d.sjt?scoreRow('SJT',d.sjt):''}<p class="small">Zero is a result. Blank is missing. This draft stays editable until saved.</p><div class="actions split">${btn('Save draft & leave','leave-score')}${btn('Continue to optional review','continue','primary')}</div></div>`;}
function questionAdder(){const d=work();return `<div class="twocol"><div class="field"><label for="section">Section</label><select id="section">${['VR','DM','QR',...(d.sjt?['SJT']:[])].map(s=>`<option>${s}</option>`).join('')}</select></div>${field('Question number','questionNumber','','number','min="1" step="1"')}</div>${btn('Add selected question','add-question')}`;}
function confirmMockLog(commit,origin){
 if(document.getElementById('mock-save-confirmation')||!state.draft)return;
 const id=state.draft.id,route=state.route,snapshot=JSON.stringify(state.draft),hasReviewed=state.draft.reviews.some(q=>q.reviewed===true);
 const dialog=document.createElement('dialog');dialog.id='mock-save-confirmation';dialog.className='mock-save-confirmation';dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','mock-save-question');dialog.setAttribute('aria-describedby','mock-save-description');
 dialog.innerHTML=`<h2 id="mock-save-question">${hasReviewed?'Log this mock now?':'Save this mock without reviewing any questions?'}</h2><p id="mock-save-description">${hasReviewed?'You can return to edit your question reviews later.':'You can add reviews later.'}</p><div class="actions"><button type="button" id="mock-save-cancel" autofocus>Keep reviewing</button><button type="button" id="mock-save-commit" class="primary">Log mock</button></div>`;
 let settled=false;const finish=accept=>{if(settled)return;settled=true;dialog.close();dialog.remove();if(origin?.isConnected)origin.focus({preventScroll:true});if(!accept)return;if(state.route!==route||state.draft?.id!==id||JSON.stringify(state.draft)!==snapshot||state.savedIds.includes(id)){showError('This mock changed. Check your draft and choose Save mock again.');return;}commit();};
 dialog.addEventListener('keydown',e=>{if(e.key!=='Tab'||e.ctrlKey||e.altKey||e.metaKey)return;const cancel=dialog.querySelector('#mock-save-cancel'),confirm=dialog.querySelector('#mock-save-commit');if(e.shiftKey&&document.activeElement===cancel){e.preventDefault();confirm.focus();}else if(!e.shiftKey&&document.activeElement===confirm){e.preventDefault();cancel.focus();}});dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});dialog.querySelector('#mock-save-cancel').addEventListener('click',()=>finish(false));dialog.querySelector('#mock-save-commit').addEventListener('click',()=>finish(true));document.body.append(dialog);dialog.showModal();dialog.querySelector('#mock-save-cancel').focus();
}
function finalMockSaveAction(a,el){
 if(!state.draft||!['selection','review'].includes(state.route))return false;
 if(a==='account-save-retry'){const retained=accountSaveController&&accountSaveController.retained();if(!retained)return true;accountSaveMessage='';confirmMockLog(()=>{accountSaveController&&accountSaveController.retry();},el);return true;}
 // Missing-record resolution (approved): the Discard local draft action in
 // the controller region opens its OWN cancel-safe dialog. The original
 // queued ref captured at activation is the exact object handed to the
 // controller — never a replacement fetched at confirmation.
 if(a==='account-save-discard'){if(!accountSaveController)return true;
  // Retain the ORIGINAL queued ref from activation — the exact object the
  // queue owns right now; the accept path never fetches a replacement.
  const queuedDiscard=accountSaveController.retained();
  if(!queuedDiscard)return true;
  confirmMissingDraftDiscard(()=>{
  if(!accountSaveController||accountSaveController.retained()!==queuedDiscard||accountSaveController.getState().phase!=='acknowledged-record-missing'){showError('This draft or account changed. Check your draft before discarding again.');return;}
  accountSaveDiscardError='';
  if(accountSaveController.discardMissing(queuedDiscard)){accountSaveDiscardedMessage=ACCOUNT_SAVE_DISCARDED;render();document.getElementById('status').textContent='Local draft discarded. The saved record was not recreated and no new save was counted.';}
  else{accountSaveDiscardError=ACCOUNT_SAVE_DISCARD_DENIED;render();document.getElementById('status').textContent='Local draft could not be discarded. It is still here.';}
 },el);return true;}
 if(a==='save'){
  // Attached account controller: cloud final-save mode. Default detached app:
  // the existing anonymous browser-only path below, byte-for-byte unchanged.
  if(accountSaveController)return accountSaveStart(el);
  confirmMockLog(()=>{if(!reviewGate('save'))mockAction('save',el);},el);return true;
 }
 const key=el.dataset.reviewRetry;
 if(a==='retry-review'&&key?.endsWith(':final')&&reviewFailures.has(key)){confirmMockLog(()=>reviewFailures.get(key)?.retry(),el);return true;}
 return false;
}
function reviewCoverage(m){return ['VR','DM','QR'].map(section=>{
 const reviewed=new Set(m.reviews.filter(q=>q.section===section&&q.reviewed===true&&Number.isInteger(Number(q.number))&&Number(q.number)>0).map(q=>Number(q.number))).size;
 const score=m.scores?.[section],expected=section==='DM'?(m.dmMode==='questions'?35:null):({VR:44,QR:36})[section];
 const known=expected!==null&&score&&score.earned!==''&&Number(score.max)===expected&&Number.isInteger(Number(score.earned))&&Number(score.earned)>=0&&Number(score.earned)<=expected;
 const missed=known?expected-Number(score.earned):null;
 const text=known?(reviewed>missed?`${reviewed} questions reviewed · score records ${missed} incorrect questions`:missed===0?'No incorrect questions recorded.':`${reviewed} out of ${missed} incorrect questions reviewed`):`${reviewed} ${section==='DM'&&m.dmMode==='weighted'&&Number(score?.max)===47?'incorrect questions':'questions'} reviewed`;
 return `<p class="small"><strong>${section}</strong> · ${text}</p>`;
}).join('');}
function selection(){const d=work(),saved=state.route==='saved-review';return `${saved?'':flow(1)}<div class="formbody">${title(saved?'Continue your review':'Choose what to revisit','Review incorrect, partial or unanswered questions from your marked results. Choose as many as you want, or continue without reviewing. Reflection fields are optional.')}${questionAdder()}<div>${d.reviews.map((q,i)=>`<div class="row"><div><strong>${q.section} · Question ${esc(q.number)}</strong><p>${q.reviewed?'Reviewed · current labels confirmed':'Needs review'}</p></div>${btn('Review','review-question','',`data-i="${i}"`)}</div>`).join('')}</div>${saved?`<div class="actions">${btn('Back to overview','overview')}</div>`:`<div class="field"><label for="note">Whole-mock reflection · optional</label><textarea id="note" name="note">${esc(d.note)}</textarea></div>${accountSaveLockActive()?`<p class="small">Saving locks identity, scores and DM mode. This submitted draft is read-only until the account save is resolved.</p>`:`<p class="small">Saving locks identity, scores and DM mode. Question reviews stay editable.</p>`}<div class="actions">${btn('Back to scores','back-scores')}${btn('Save mock','save','primary')}</div>`}</div>`;}
function recordMockAcknowledgement(before,next,id){pendingMockAcknowledgement=mockSaveFeedback(before,next,id);}
function mockAcknowledgement(mock){
 const ack=pendingMockAcknowledgement;if(!ack||ack.id!==mock.id)return '';
 const content=ack.record?`<strong id="mock-feedback-title">${esc(ack.headline)}</strong>${ack.detail?`<span class="mock-record-detail">${esc(ack.detail)}</span>`:''}${ack.sections?`<span class="mock-record-sections">${esc(ack.sections)}</span>`:''}`:esc(ack.text);
 return `<p id="mock-acknowledgement" class="mock-acknowledgement" data-feedback-kind="${esc(ack.kind)}">${content}</p>`;
}
function playMockRecordConfetti(){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const target=document.getElementById('mock-acknowledgement');if(!target)return;
 const layer=document.createElement('span');layer.className='mock-confetti';layer.setAttribute('aria-hidden','true');
 for(let index=0;index<12;index++)layer.append(document.createElement('i'));
 target.append(layer);setTimeout(()=>layer.remove(),2000);
}
function overview(){const m=activeMock();if(!m)return home();const estimate=estimatedMock(m);return `<div class="formbody">${title(esc(m.title||'Untitled mock'),`${m.provider?esc(m.provider)+' · ':''}Logged ${esc(new Date(m.loggedAt).toLocaleString('en-GB'))}`)}${mockAcknowledgement(m)}<span class="saved-state">Saved in this browser · identity & scores locked</span><section id="estimated-score-summary" class="settings-section" aria-labelledby="estimated-score-title"><h2 id="estimated-score-title">Estimated scaled score</h2><p class="estimated-score-total"><strong id="estimated-score-total">${estimate.total??'Unavailable'}</strong>${estimate.total!==null?' <span class="small">/ 2700</span>':''}</p>${estimate.total===null?'<p class="small">This result format has no supported estimated total.</p>':''}</section><div class="raw-results">${['VR','DM','QR'].map(s=>`<div class="result-line"><h2>${s}</h2><b>${esc(m.scores[s].earned)} <span>/ ${esc(m.scores[s].max)}</span></b><p>${s==='DM'?(m.dmMode==='weighted'?'Weighted / partial credit':'Question-count mode'):'Raw earned / maximum'}</p><p class="small">Estimated scaled score: <strong data-estimated-section="${s}">${estimate.sections[s]??'Unavailable'}</strong></p></div>`).join('')}</div>${m.sjt?`<p class="small"><strong>SJT, separate:</strong> ${esc(m.sjt.earned)} / ${esc(m.sjt.max)} raw marks</p>`:'<p class="small">SJT not recorded · missing, not zero.</p>'}${m.note?`<section class="settings-section"><h2>Whole-mock reflection</h2><p class="note-copy">${esc(m.note)}</p></section>`:''}<section class="settings-section"><h2>Question reviews</h2><p><strong>Mock review complete</strong></p>${reviewCoverage(m)}${btn('Add or resume question reviews','saved-review')}</section><div class="actions">${btn('Open practice','home','primary')}${btn('Delete this mock','delete-mock','danger')}</div></div>`;}
function limit(){return `<section class="limit">${title('Upgrade','You’ve reached the cumulative browser-local preview allowance. Three mock logs used.')}<p>Deleting mocks does not replenish allowance. Existing results and question reviews remain available.</p><p><strong>Paid access has no total mock-log cap while active. Up to 12 new mock logs may be saved per day, resetting at midnight UTC.</strong></p><p class="small">Further logging needs purchased or funded access in the planned product. Neither service is connected here. This preview is browser-local only — not server-owned paid authorization.</p><div class="actions">${btn('Continue','upgrade-continue','primary')}${btn('View mock history','history')}${btn('Back to home','home')}</div></section>`;}
// Upgrade entry first vertical (upgrade-entry-contract.md): plan/pricing
// information reached ONLY by Continue from the limit screen. Presentation/
// navigation only — no price is invented (none approved), no allowance grant,
// no checkout, no storage schema change.
function upgradePlan(){return `<section class="limit">${title('Plans & pricing','Paid access has no total mock-log cap while active. Up to 12 new mock logs may be saved per day, resetting at midnight UTC.')}<p>Price and purchase availability are not configured in this browser-local preview. No approved price exists, so none is shown here; Continue does not grant mock logs or start any checkout.</p><p class="small">Renewal rules and funded exceptions remain undecided. Existing results and question reviews stay readable at the limit.</p><div class="actions">${btn('Back to Upgrade','upgrade-back','primary')}${btn('View mock history','history')}${btn('Back to home','home')}</div></section>`;}
function scoreErrors(errors,focus=true){scoreValidated=true;const ids=[];for(const e of document.querySelectorAll('.score-row [aria-invalid],#dmMode[aria-invalid]')){e.removeAttribute('aria-invalid');const fixed=/^(VR|DM|QR)-earned$/.test(e.id);if(fixed){const s=e.id.split('-')[0];e.setAttribute('aria-describedby',s+'-max-label '+s+'-max');}else e.removeAttribute('aria-describedby');}for(const s of ['VR','DM','QR',...(state.draft.sjt?['SJT']:[])]){const v=s==='SJT'?state.draft.sjt:state.draft.scores[s],max=Number(v.max),earned=Number(v.earned);if(v.earned===''||!Number.isFinite(earned)||earned<0||(max>0&&earned>max))ids.push(s+'-earned');if(v.max===''||!Number.isFinite(max)||max<=0)ids.push(s+'-max');if(s==='DM'&&max!==(state.draft.dmMode==='weighted'?47:35))ids.push('dmMode');}let box=document.getElementById('score-validation');if(!box){box=document.createElement('div');box.id='score-validation';document.getElementById('messages').prepend(box);}box.innerHTML=errors.length?`<div class="error">${esc(errors.join(' '))}</div>`:'';const fields=ids.map(id=>document.getElementById(id)).filter(Boolean);for(const e of fields){e.setAttribute('aria-invalid','true');e.setAttribute('aria-describedby',[e.getAttribute('aria-describedby'),'score-validation'].filter(Boolean).join(' '));}if(focus)fields[0]?.focus();scoreFeedback();}
// BEGIN Progress recommendation: optional preference, explicit Add-to-practice and tab-local recovery only.
let progressFocusDraft=null,progressFocusPending=null,progressFocusNotice='',progressRestoreId=null,progressAddIdentity='',nextProgressAddId=0;
const progressAddAttempts=new Map(),progressAddNotices=new Map();
const progressDisclosures=new Map();
document.addEventListener('toggle',e=>{if(e.target.matches?.('[data-progress-disclosure]')&&e.target.isConnected)progressDisclosures.set(e.target.dataset.progressDisclosure,e.target.open);},true);
function progressEvidenceIdentity(){return JSON.stringify(state.mocks.map(m=>[m.id,m.loggedAt,m.dmMode,m.scores,m.reviews?.map(q=>[q.section,q.number,q.reviewed,q.type,q.reasons]) ]));}
function progressAddIdentityNow(entryId=null){const model=progressAdvice(state);return JSON.stringify([progressEvidenceIdentity(),model.options.filter(o=>entryId===null||o.entryId===entryId).map(o=>o.entryId+addIdentityKey(o)).sort()]);}
function progressOperational(){const active=document.activeElement;progressRestoreId=active?.closest('#progress-operational')?active.id:null;for(const d of document.querySelectorAll('[data-progress-disclosure]'))progressDisclosures.set(d.dataset.progressDisclosure,d.open);if(progressFocusPending&&progressFocusPending.identity!==progressEvidenceIdentity()){progressFocusPending=null;progressFocusNotice='The recorded evidence changed. This attempted focus was not saved. Choose and save again using current records.';}const identity=progressAddIdentityNow();for(const [entryId,attempt] of [...progressAddAttempts]){if(attempt.identity!==progressAddIdentityNow(entryId)){progressAddAttempts.delete(entryId);progressAddNotices.delete(entryId);}}progressAddIdentity=identity;const model=progressAdvice(state);const attemptKeys=new Set([...progressAddAttempts.values()].map(a=>a.key));const addKeys=pendingAddKeys(state.tasks);const ui={saved:state.progressRecommendation,draft:progressFocusDraft,pending:!!progressFocusPending,notice:progressFocusNotice,addKeys,addPending:progressAddAttempts,addNotice:progressAddNotices,addIdentity:progressAddIdentity};return {html:operationalRecommendation(model,esc,ui)};}
function progressRecommendationRestore(){for(const d of document.querySelectorAll('[data-progress-disclosure]'))d.open=progressDisclosures.get(d.dataset.progressDisclosure)||false;if(progressRestoreId)document.getElementById(progressRestoreId)?.focus({preventScroll:true});progressRestoreId=null;}
function progressFocusCommit(value,isRetry=false){if(state.route!=='progress')return;if(isRetry&&(!progressFocusPending||progressFocusPending.identity!==progressEvidenceIdentity())){progressFocusPending=null;progressFocusNotice='The recorded evidence changed. Choose and save again using current records.';render();return;}const choice=decodeFocusChoice(value);if(value&&!choice){progressFocusNotice='This focus is no longer supported. Choose another focus.';progressFocusPending=null;render();return;}const model=progressAdvice(state),preference={version:1,learnerChoice:choice,previousFocus:model.overallFocus?.entryId||null,previousOrder:model.options.map(o=>o.entryId)};if(persist({...state,progressRecommendation:preference})){progressFocusDraft=null;progressFocusPending=null;progressFocusNotice='';render();document.getElementById('status').textContent='Practice focus saved in this browser. No tasks were created.';}else{message='';progressFocusDraft=value;progressFocusPending={value,identity:progressEvidenceIdentity()};progressFocusNotice='Could not save practice focus. Your choice is not saved; the saved focus is unchanged. No tasks were added. Keep this page open and retry. Reloading discards this unsaved choice.';render();document.getElementById('status').textContent='Practice focus is not saved.';}}
function progressAddCommit(entryId,isRetry=false){const model=progressAdvice(state),option=model.options.find(o=>o.entryId===entryId),identity=progressAddIdentityNow(entryId);if(isRetry){const attempt=progressAddAttempts.get(entryId);if(!attempt){render();return;}if(attempt.identity!==identity){progressAddAttempts.delete(entryId);progressAddNotices.set(entryId,'The recorded suggestion changed (evidence or declared resources). Nothing was added; choose again from the current list.');render();return;}if(attempt.key!==addIdentityKey(option)){progressAddAttempts.delete(entryId);progressAddNotices.set(entryId,'This suggestion is no longer offered from current records. Nothing was added.');render();return;}}if(!option){progressAddAttempts.delete(entryId);progressAddNotices.set(entryId,'This suggestion is no longer offered from current records. Nothing was added.');render();return;}const key=addIdentityKey(option);if(pendingAddKeys(state.tasks).has(key)){progressAddAttempts.delete(entryId);progressAddNotices.delete(entryId);render();return;}const task=addTaskFromOption(option);if(persist({...state,tasks:[...state.tasks,task]})){progressAddAttempts.delete(entryId);progressAddNotices.delete(entryId);practiceTargets.push(nextPracticeTarget++);render();document.getElementById('status').textContent='Added to your practice list in this browser. Edit the task on Home anytime.';}else{message='';nextProgressAddId++;progressAddAttempts.set(entryId,{id:nextProgressAddId,key,identity});progressAddNotices.set(entryId,'Could not add to practice. Your list is unchanged and this task was not saved. Keep this page open and retry; reloading discards this attempt.');render();document.getElementById('progressAddRetry-'+nextProgressAddId)?.focus({preventScroll:true});document.getElementById('status').textContent='Task was not added. This task was not saved. Your list is unchanged.';}}
function progressRecommendationAction(a,el){if(state.route!=='progress')return false;if(a==='save-progress-focus'){progressFocusCommit(document.getElementById('progressFocus').value);return true;}if(a==='auto-progress-focus'){progressFocusCommit('');return true;}if(a==='retry-progress-focus'){if(progressFocusPending)progressFocusCommit(progressFocusPending.value,true);return true;}
if(a==='add-progress-task'||a==='retry-progress-add'){const entryId=el.closest('.progress-suggestion')?.dataset.recommendation;if(entryId)progressAddCommit(entryId,a==='retry-progress-add');return true;}return false;}
document.addEventListener('change',e=>{if(state.route==='progress'&&e.target.id==='progressFocus'){progressFocusDraft=e.target.value;progressFocusPending=null;progressFocusNotice='Unsaved focus choice. Use Save focus to save it in this browser; reloading discards this draft.';render();}});
// END Progress recommendation.
// BEGIN Progress navigation: browser-local, explicit destination intents only.
const progressDepartures=new Map();
const progressIntentKey=v=>JSON.stringify([v.route,v.id??null,v.section??null,v.number??null]);
function progressTarget(v){const m=v.id===undefined?null:state.mocks.find(m=>m.id===v.id);if(v.id!==undefined&&!m)return null;const index=v.section===undefined?-1:m.reviews.findIndex(q=>q.section===v.section&&Number(q.number)===v.number);if(v.section!==undefined&&index<0)return null;return {...state,route:v.route,...(v.id===undefined?{}:{current:v.id,reviewIndex:index})};}
function progressFeedback(){if(state.route!=='progress')return;for(const [key,v] of progressDepartures)if(!progressTarget(v))progressDepartures.delete(key);const box=document.getElementById('messages');if(!box)return;let feedback=document.getElementById('progress-navigation-persistence');if(!feedback){feedback=document.createElement('div');feedback.id='progress-navigation-persistence';feedback.className='progress-navigation-feedback';box.append(feedback);}const focused=document.activeElement?.dataset.progressRetry;feedback.innerHTML=[...progressDepartures].map(([key,v])=>`<div class="progress-navigation-intent"><div class="error">Could not open ${esc(v.label)}. Progress is still open and your saved data is unchanged. Keep this page open to retry; reloading discards this attempted navigation.</div><div class="field">${btn('Retry navigation to '+esc(v.label),'retry-progress-navigation','progress-navigation-retry',`data-progress-retry="${esc(key)}"`)}</div></div>`).join('');if(progressDepartures.size)document.getElementById('status').textContent='Navigation not saved. Progress is still open.';if(focused)feedback.querySelector(`[data-progress-retry="${CSS.escape(focused)}"]`)?.focus();}
function progressNavigate(v){if(state.route!=='progress')return;const key=progressIntentKey(v),next=progressTarget(v);if(!next){progressDepartures.delete(key);progressFeedback();document.getElementById('status').textContent='This navigation target is no longer available. Your saved data is unchanged.';return;}if(persist(next)){progressDepartures.delete(key);render();}else{message='';progressDepartures.set(key,v);progressFeedback();}}
function progressAction(a,el){if(state.route!=='progress')return false;if(a==='retry-progress-navigation'){const v=progressDepartures.get(el.dataset.progressRetry);if(v)progressNavigate(v);return true;}if(a==='progress')return true;if(['home','history','settings'].includes(a)){progressNavigate({route:a,label:({home:'Home',history:'History',settings:'Settings'})[a]});return true;}if(['open-mock','evidence-review'].includes(a)){const m=state.mocks.find(m=>m.id===el.dataset.id);if(m){const q=a==='evidence-review'?m.reviews[Number(el.dataset.i)]:null;if(a==='open-mock'||q)progressNavigate({route:q?'saved-review':'overview',id:m.id,...(q?{section:q.section,number:Number(q.number)}:{}),label:(m.title||'Untitled mock')+(q?` · ${q.section} · Question ${q.number}`:'')});}return true;}return false;}
// END Progress navigation.
// History departures are captured tab-local intents; no unrelated save replays them.
const historyDepartures=new Map();
const historyOwner=()=>JSON.stringify([state.route,state.current]);
function historyFeedback(){for(const [key,v] of historyDepartures)if(v.current!==null&&!state.mocks.some(m=>m.id===v.current))historyDepartures.delete(key);const box=document.getElementById('messages');if(!box)return;let feedback=document.getElementById('history-persistence');if(!feedback){feedback=document.createElement('div');feedback.id='history-persistence';box.append(feedback);}const focused=document.activeElement?.dataset.historyRetry,pending=[...historyDepartures].filter(([,v])=>v.owner===historyOwner());feedback.innerHTML=pending.map(([key,v])=>`<div class="error">Could not open ${esc(v.label)}. History is still open and your saved data is unchanged. Keep this page open to retry; reloading discards this attempted navigation.</div><div class="field">${btn('Retry navigation to '+esc(v.label),'retry-history-departure','',`data-history-retry="${esc(key)}"`)}</div>`).join('');if(pending.length)document.getElementById('status').textContent='Could not open '+pending.map(([,v])=>v.label).join(', ')+'. History is still open. Navigation not saved.';if(focused)feedback.querySelector(`[data-history-retry="${CSS.escape(focused)}"]`)?.focus();}
function historyNavigate(route,label,owner=historyOwner(),current=state.current){if(state.route!=='history'||historyOwner()!==owner||(current!==null&&!state.mocks.some(m=>m.id===current)))return;const key=owner+':'+route,next={...state,route,current,reviewIndex:-1};if(persist(next)){historyDepartures.delete(key);render();}else{message='';historyDepartures.set(key,{owner,current,route,label});historyFeedback();}}
function historyAction(a,el){if(a==='retry-history-departure'){const intent=historyDepartures.get(el.dataset.historyRetry);if(intent?.owner===historyOwner())historyNavigate(intent.route,intent.label,intent.owner,intent.current);return true;}if(state.route==='history'&&['home','progress','settings'].includes(a)){historyNavigate(a,({home:'Home',progress:'Progress',settings:'Settings'})[a]);return true;}return false;}
// Overview actions are captured, tab-local intents, never replayed by unrelated saves.
const overviewFailures=new Map();
const overviewOwner=()=>JSON.stringify([state.route,state.current]);
function overviewFeedback(){for(const [key,v] of overviewFailures)if(v.targetId!==undefined&&!state.mocks.some(m=>m.id===v.targetId))overviewFailures.delete(key);const box=document.getElementById('messages');if(!box)return;let feedback=document.getElementById('overview-persistence');if(!feedback){feedback=document.createElement('div');feedback.id='overview-persistence';box.append(feedback);}const focused=document.activeElement?.dataset.overviewRetry,pending=[...overviewFailures].filter(([,v])=>v.owner===overviewOwner());feedback.innerHTML=pending.map(([key,v])=>`<div class="error">${esc(v.text)}</div><div class="field">${btn(esc(v.label),'retry-overview','',`data-overview-retry="${esc(key)}"`)}</div>`).join('');if(pending.length)document.getElementById('status').textContent='Mock action not saved. Keep this page open to retry.';if(focused)feedback.querySelector(`[data-overview-retry="${CSS.escape(focused)}"]`)?.focus();}
function overviewDelete(id){if(state.route!=='overview'||state.current!==id||!state.mocks.some(m=>m.id===id))return;if(!confirm('Delete this browser-local mock and its reviews? This does NOT restore allowance.'))return;const owner=overviewOwner(),key=owner+':delete',next={...deleteMock(state,id),route:'history',current:null,reviewIndex:-1};if(persist(next)){overviewFailures.delete(key);render();document.getElementById('status').textContent='Mock deleted from this browser. Allowance is unchanged.';}else{message='';overviewFailures.set(key,{owner,label:'Retry delete this mock',text:'Could not delete this mock from this browser. The mock and its reviews are still saved. Keep this page open to retry; reloading discards this attempted deletion, not your saved mock.',retry:()=>overviewDelete(id)});overviewFeedback();}}
function overviewNavigate(route,id=state.current,label=route){const owner=overviewOwner();if(!['overview','history'].includes(state.route)||!state.mocks.some(m=>m.id===id))return;const key=owner+':navigate:'+route+':'+id;const retry=()=>{if(overviewOwner()===owner)overviewNavigate(route,id,label);};if(persist({...state,route,current:id,reviewIndex:-1})){overviewFailures.delete(key);render();}else{message='';overviewFailures.set(key,{owner,targetId:id,label:'Retry navigation to '+label,text:'Could not open '+label+'. Your current view and saved mock are unchanged. Keep this page open to retry; reloading discards this attempted navigation.',retry});overviewFeedback();}}
function overviewAction(a,el){if(a==='retry-overview'){const intent=overviewFailures.get(el.dataset.overviewRetry);if(intent?.owner===overviewOwner())intent.retry();return true;}if(a==='delete-mock'&&state.route==='overview'){overviewDelete(state.current);return true;}if(state.route==='overview'&&['saved-review','home','history'].includes(a)){overviewNavigate(a,state.current,a==='saved-review'?'question reviews':a==='home'?'Home':'History');return true;}if(state.route==='history'&&a==='open-mock'){const m=state.mocks.find(m=>m.id===el.dataset.id);if(m)overviewNavigate('overview',m.id,m.title||'Untitled mock');return true;}return false;}
function mockAction(a,el){
 if(a==='retry-score'){persistScore();}
 else if(a==='log'){if(state.used>=3){go('limit');return true;}if(!state.draft)state.draft={id:crypto.randomUUID(),title:'',provider:'',dmMode:'questions',scores:{VR:{earned:'',max:'44'},DM:{earned:'',max:'35'},QR:{earned:'',max:'36'}},sjt:null,reviews:[],note:'',stage:'scores'};go(state.draft.stage);}
 else if(a==='continue'){const errors=validateScores(state.draft);if(errors.length)scoreErrors(errors);else scoreNavigate('selection','selection');}
 else if(a==='back-scores')scoreNavigate('scores','scores');
 else if(a==='leave-score')scoreNavigate('home');
 else if(['home','progress','history','settings'].includes(a)&&['scores','selection'].includes(state.route))scoreNavigate(a);
 else if(a==='save'){try{const before=state,id=state.draft.id,next={...saveMock(state,state.draft),draft:null,current:id,route:'overview'};if(persistScore(next)){recordMockAcknowledgement(before,next,id);inactiveSjt.delete(id);scoreValidated=false;render();}}catch(err){showError(err.message);}}
 else if(a==='open-mock'){state.current=el.dataset.id;go('overview');}
 // Upgrade entry vertical: Continue/Back are presentation-navigation only.
 else if(a==='upgrade-continue'){go('upgrade-plan');}
 else if(a==='upgrade-back'){go('limit');}
 else if(a==='overview')go('overview');
 else if(a==='saved-review'){state.reviewIndex=-1;go('saved-review');}
 else return false;return true;
}

// Review recovery is tab-local and independent of validation and shared errors.
const reviewFailures=new Map();
const reviewOwner=()=>state.route==='saved-review'?'saved:'+state.current:'draft:'+state.draft?.id;
function reviewFeedback(){const box=document.getElementById('messages');if(!box)return;let feedback=document.getElementById('review-persistence');if(!feedback){feedback=document.createElement('div');feedback.id='review-persistence';box.append(feedback);}const focused=document.activeElement?.dataset.reviewRetry;const pending=[...reviewFailures].filter(([,v])=>v.owner===reviewOwner());feedback.innerHTML=pending.length?`<div class="error">Could not save review to this browser. Review changes are not saved. Keep this page open; reloading may lose unsaved changes.</div>${pending.map(([key,v])=>`<div class="field">${btn(v.label,'retry-review','',`data-review-retry="${esc(key)}"`)}</div>`).join('')}`:'';if(pending.length)document.getElementById('status').textContent='Review changes are not saved.';if(focused)feedback.querySelector(`[data-review-retry="${CSS.escape(focused)}"]`)?.focus();}
function reviewCommit(key,label,propose,transition=false){const before=state,owner=reviewOwner(),next=propose(),finalId=state.draft&&!next.draft?state.draft.id:null;const saved=state.route!=='saved-review'&&scorePending?persistScore(next):persist(next);message='';if(saved){reviewFailures.delete(owner+':content');reviewFailures.delete(key);if(finalId){recordMockAcknowledgement(before,next,finalId);inactiveSjt.delete(finalId);scoreValidated=false;for(const intent of reviewFailures.values())if(intent.owner===owner)intent.owner='saved:'+finalId;}if(transition)render();else document.getElementById('status').textContent='Review saved in this browser.';}else reviewFailures.set(key,{owner,label,retry:()=>reviewCommit(key,label,propose,transition)});reviewFeedback();return saved;}
function saveWork(){const owner=reviewOwner();return reviewCommit(owner+':content','Retry review changes',()=>state.route==='saved-review'?updateSaved(state,state.current,{reviews:work().reviews}):state);}
const reviewIdentity=q=>q.section+':'+Number(q.number);
function reviewNavigate(route,target=null){const owner=reviewOwner(),identity=target?reviewIdentity(target):null,label=target?`${target.section} · Question ${target.number}`:route==='selection'||route==='saved-review'?'selected questions':route;return reviewCommit(owner+':navigate:'+route+':'+identity,'Retry navigation to '+label,()=>{const savedScores=route==='scores'&&state.mocks.some(m=>m.id===owner.slice(6)),index=identity===null?-1:work().reviews.findIndex(q=>reviewIdentity(q)===identity);return {...state,current:savedScores?owner.slice(6):state.current,route:savedScores?'overview':state.route==='saved-review'&&['review','selection'].includes(route)?'saved-review':route,reviewIndex:index,draft:savedScores||state.route==='saved-review'?state.draft:{...state.draft,...(['review','selection','scores'].includes(route)?{stage:route}:{})}};},true);}
function review(){const d=work(),q=d.reviews[state.reviewIndex],saved=state.route==='saved-review';if(!q)return selection();return `${saved?'':flow(1)}<div class="review-wrap">${title(`${q.section} · Question ${esc(q.number)}`)}<div class="question-tabs" role="group" aria-label="Selected questions">${d.reviews.map((v,i)=>btn(`${v.section} · Q${esc(v.number)}${v.reviewed?' · reviewed':''}`,'review-question',i===state.reviewIndex?'selected':'',`data-i="${i}" ${i===state.reviewIndex?'aria-current="true"':''}`)).join('')}</div><div class="review-body"><div class="field"><label for="format">Reflection format</label><select id="format" name="format"><option value="guided" ${q.format==='guided'?'selected':''}>Guided prompts</option><option value="free" ${q.format==='free'?'selected':''}>Free-text reflection</option></select></div>${q.format==='guided'?`<div class="field"><label for="thinking">how I was thinking</label><textarea id="thinking" name="thinking">${esc(q.thinking)}</textarea></div><div class="field"><label for="instead">what I should've thought instead</label><textarea id="instead" name="instead">${esc(q.instead)}</textarea></div>`:`<div class="field"><label for="free">Your reflection · optional</label><textarea id="free" name="free">${esc(q.free)}</textarea></div>`}<div class="review-labels"><h2>Labels · optional</h2><p class="small">Manual selection. AI suggestions are not connected.</p><div class="field"><label for="type">Question type · choose one</label><select id="type" name="type"><option value="">No question type selected</option>${types[q.section].map(t=>`<option value="${esc(t)}" ${q.type===t?'selected':''}>${esc(t)}</option>`).join('')}</select></div>${q.section==='SJT'?'<p class="small">SJT has no error-reason labels.</p>':`<fieldset><legend>Error reasons · choose any that apply</legend><div class="reason-grid">${reasons[q.section].map((v,i)=>check(esc(v),'reason-'+i,q.reasons.includes(v))).join('')}</div></fieldset>${q.reasons.some(v=>v.toLowerCase()==='other')?`<div class="field"><label for="other">Other reason · optional</label><textarea id="other" name="other">${esc(q.other)}</textarea></div>`:''}`}</div><div class="actions">${btn(q.reviewed?'Mark as needing review':'Mark reviewed','mark','primary')}${state.reviewIndex<d.reviews.length-1?btn('Next selected question','next-question'):''}</div><p class="small">${q.reviewed?'Reviewed · current labels confirmed.':'Needs review.'} Reviewed is not a mastery claim.</p><div class="actions">${btn('Back to selected questions','selection')}${!saved?btn('Save mock','save'):''}</div></div></div>`;}
// Selection validation owns its region; pending draft recovery remains independent.
function questionError(){const number=document.getElementById('questionNumber').value,section=document.getElementById('section').value;return !number||!Number.isInteger(Number(number))||Number(number)<1?'Enter a positive whole question number.':work().reviews.some(q=>q.section===section&&Number(q.number)===Number(number))?'That question is already selected.':'';}
function selectionError(text,focus=true){const id=state.route==='saved-review'?'review-selection-validation':'score-selection-validation';let box=document.getElementById(id);if(!box){box=document.createElement('div');box.id=id;document.getElementById('messages').prepend(box);}box.innerHTML=text?`<div class="error">${esc(text)}</div>`:'';const field=document.getElementById('questionNumber');if(text){field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',box.id);if(focus)field.focus();}else{field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby');}}
function reviewGate(a){if(!['review','saved-review','selection'].includes(state.route))return false;if(a==='save'&&state.route!=='saved-review'&&state.draft?.reviews.length){const id=state.draft.id;try{reviewCommit(reviewOwner()+':final','Retry save mock',()=>({...saveMock(state,state.draft),draft:null,current:id,route:'overview'}),true);}catch(err){showError(err.message);reviewFeedback();}return true;}if(['home','progress','history','settings','overview','back-scores'].includes(a)&&(state.route!=='selection'||[...reviewFailures.values()].some(v=>v.owner===reviewOwner()))){reviewNavigate(a==='back-scores'?'scores':a);return true;}return false;}
function reviewAction(a,el){const d=work();
 if(a==='retry-review'){reviewFailures.get(el.dataset.reviewRetry)?.retry();}
 else if(a==='add-question'){const section=document.getElementById('section').value,number=document.getElementById('questionNumber').value;const error=questionError();if(error){selectionError(error);return true;}d.reviews.push({section,number,format:state.profile.format,thinking:'',instead:'',free:'',type:'',reasons:[],other:'',reviewed:false,confirmed:false});const saved=saveWork();render();if(!saved){document.getElementById('section').value=section;document.getElementById('questionNumber').value=number;}}
 else if(a==='review-question')reviewNavigate(state.route==='saved-review'?'saved-review':'review',d.reviews[Number(el.dataset.i)]);
 else if(a==='selection')reviewNavigate(state.route==='saved-review'?'saved-review':'selection');
 else if(a==='next-question')reviewNavigate(state.route,d.reviews[Math.min(state.reviewIndex+1,d.reviews.length-1)]);
 else if(a==='mark'){const q=d.reviews[state.reviewIndex],identity=reviewIdentity(q),reviewed=!q.reviewed,owner=reviewOwner();reviewCommit(owner+':mark:'+identity,`Retry mark ${reviewed?'reviewed':'needing review'} for ${q.section} · Question ${q.number}`,()=>{const reviews=work().reviews.map(v=>reviewIdentity(v)===identity?{...v,reviewed,confirmed:reviewed}:v);return state.route==='saved-review'?updateSaved(state,state.current,{reviews}):{...state,draft:{...state.draft,reviews}};},true);}
 else return false;return true;
}
function reviewChange(el){const q=work()?.reviews[state.reviewIndex];if(!q)return false;
 if(el.name==='format'){q.format=el.value;saveWork();render();}
 else if(el.name==='type'){q.type=el.value;q.confirmed=!!q.reviewed;saveWork();}
 else if(el.name.startsWith('reason-')){const value=reasons[q.section][Number(el.name.split('-')[1])];q.reasons=el.checked?[...new Set([...q.reasons,value])]:q.reasons.filter(v=>v!==value);q.confirmed=!!q.reviewed;saveWork();render();}
 else return false;return true;
}

function render(){const pickerOpen=!!document.querySelector('.resource-picker[open]');const previous=document.activeElement;const identity=previous?.id?'#'+CSS.escape(previous.id):previous?.name?'[name="'+CSS.escape(previous.name)+'"]':previous?.hasAttribute('data-task-check')?'[data-task-check="'+previous.dataset.taskCheck+'"]':previous?.dataset.act?'[data-act="'+previous.dataset.act+'"]':null;
const config=(!state.complete&&state.started)||editingProfile;const screen=[state.started,state.complete,editingProfile,effectiveStep(),state.route,state.reviewIndex].join(':');const transition=screen!==lastScreen,initial=!lastScreen;lastScreen=screen;
const publicEntry=!state.complete&&!state.started;const content=state.route==='preview-details'?previewDetails():config?configure():publicEntry?landing():state.route==='progress'?progressPage(state.mocks,progressFilters,{esc,btn,title},null,progressOperational()):state.route==='settings'?settings():state.route==='history'?history():state.route==='scores'?scores():state.route==='selection'?selection():state.route==='review'?review():state.route==='saved-review'?(state.reviewIndex<0?selection():review()):state.route==='overview'?overview():state.route==='limit'?limit():state.route==='upgrade-plan'?upgradePlan():state.route==='practice'?practiceView():state.route==='notes'?notesView():home();
const brand=`<a class="brand" href="#main" data-act="${state.complete?'home':'entry'}"><span class="brand-mark" aria-hidden="true"></span>DeltaScore</a>`;
document.getElementById('app').innerHTML=`<header class="${state.complete&&!config?'header-rule':''}"><div class="preview-banner" role="note">Browser-only preview · not a live service</div><div class="site-header">${brand}${state.complete&&!config?`<nav aria-label="Workspace">${['home','progress','history','settings'].map((v,i)=>btn(['Home','Progress','History','Settings'][i],v,(v==='home'?['home','practice','notes'].includes(state.route):v===state.route)?'active':'',(v==='home'?['home','practice','notes'].includes(state.route):v===state.route)?'aria-current="page"':'')).join('')}</nav>`:publicEntry?btn('Open preview','start','quiet'):''}</div></header><main id="main" tabindex="-1" class="${publicEntry&&state.route!=='preview-details'?'public':''}"><div id="messages" role="alert">${message?`<div class="error">${esc(message)}</div>`:''}</div>${content}</main>`;
if(!transition&&pickerOpen&&document.querySelector('.resource-picker'))document.querySelector('.resource-picker').open=true;
const heading=document.querySelector('h1');heading?.setAttribute('tabindex','-1');if(!initial){const restore=!transition&&identity?document.querySelector(identity):null;(restore||heading||document.getElementById('main')).focus({preventScroll:!transition});}document.getElementById('status').textContent=state.route==='overview'?'Saved in this browser. Identity and scores locked.':config?'Step '+(effectiveStep()+1)+' of 4. '+heading.textContent:heading?.textContent||'';
if(state.route==='scores'&&scoreValidated)scoreErrors(validateScores(state.draft),false);if(['scores','selection'].includes(state.route))scoreFeedback();
if(['overview','history'].includes(state.route))overviewFeedback();
if(state.route==='history')historyFeedback();
if(['selection','review','saved-review'].includes(state.route))reviewFeedback();
accountSaveFeedback();
accountSaveLockUi();
if(state.route==='progress'){progressFeedback();progressRecommendationRestore();}
if(state.complete&&!config&&['home','practice'].includes(state.route)){practiceFeedback();if(!practiceError)document.getElementById('status').textContent=state.route==='home'?'Home':'Add practice';}
noteFeedback();
if(state.route==='settings'){formatPreferenceCommitted();formatPreferenceFeedback();}
accountAccessLifecycle();
accountHistoryLifecycle();
accountProgressLifecycle();
if(pendingMockAcknowledgement){const ack=pendingMockAcknowledgement;pendingMockAcknowledgement=null;if(state.route==='overview'&&state.current===ack.id){document.getElementById('status').textContent+=' '+ack.text;if(ack.record)playMockRecordConfetti();}}
}
function showError(text,ids=[]){message=text;const box=document.getElementById('messages');box.innerHTML=`<div class="error">${esc(text)}</div>`;const fields=ids.map(id=>document.getElementById(id)).filter(e=>e&&!e.disabled);for(const e of fields){e.setAttribute('aria-invalid','true');e.setAttribute('aria-describedby','messages');}(fields[0]||box).focus();}
document.addEventListener('input',e=>{const el=e.target;if(accountSaveLockActive()&&['scores','selection','review'].includes(state.route)&&el.closest?.('#main'))return;if(state.route==='notes'&&el.dataset.noteField){noteInput(el);return;}if(el.closest('.configure')&&message&&!message.startsWith('Could not save')){message='';document.getElementById('messages').innerHTML='';for(const field of document.querySelectorAll('.configure [aria-invalid]')){field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby');}}el.removeAttribute('aria-invalid');el.removeAttribute('aria-describedby');if(['selection','saved-review'].includes(state.route)&&el.id==='questionNumber'&&document.querySelector('#score-selection-validation,#review-selection-validation'))selectionError(questionError(),false);if(el.name==='layout-resource-name'){if(editingProfile){otherDraft().otherName=el.value;return;}otherDraft().otherName=el.value;persist();return;}if(['target','exam','tutor'].includes(el.name)){if(profileDraftWrite(el.name,el.value))return;state.profile[el.name]=el.value;persist();}else if(['thinking','instead','free','other'].includes(el.name)&&work()?.reviews[state.reviewIndex]){work().reviews[state.reviewIndex][el.name]=el.value;saveWork();}else if(['title','provider','note'].includes(el.name)&&state.draft){state.draft[el.name]=el.value;if(el.name==='note'&&state.route==='selection'&&[...reviewFailures.values()].some(v=>v.owner===reviewOwner()))saveWork();else persistScore();}else if(/^(?:(?:VR|DM|QR|SJT)-earned|SJT-max)$/.test(el.name)&&state.draft){const [s,k]=el.name.split('-');if(s!=='SJT')el.setAttribute('aria-describedby',s+'-max-label '+s+'-max');(s==='SJT'?state.draft.sjt:state.draft.scores[s])[k]=el.value;persistScore();}else if(el.hasAttribute('data-task-meta'))editPracticeMetadata(el);else if(el.id==='task')practiceComposer=el.value;else if(el.hasAttribute('data-task-text')){practiceEdits.set(Number(el.dataset.taskText),el.value);savePractice(practiceTasks(),'edit','Use Retry practice save or edit the text again to retry.');}});
document.addEventListener('change',e=>{const el=e.target;if(accountSaveLockActive()&&['scores','selection','review'].includes(state.route)&&el.closest?.('#main'))return;if(['selection','saved-review'].includes(state.route)&&el.id==='section'&&document.querySelector('#score-selection-validation,#review-selection-validation'))selectionError(questionError(),false);if(['progressRange','progressMode','progressLabels'].includes(el.id)){progressFilters[({progressRange:'range',progressMode:'mode',progressLabels:'labels'})[el.id]]=el.value;render();return;}if(el.name==='layout-other'){if(editingProfile){otherDraft().other=el.checked;render();document.querySelector('.resource-picker').open=true;return;}otherDraft().other=el.checked;persist();render();document.querySelector('.resource-picker').open=true;return;}if(el.name.startsWith('layout-other-material-')){if(editingProfile){const em=materials[Number(el.name.split('-').at(-1))],ed=otherDraft();ed.otherMaterials=el.checked?[...new Set([...ed.otherMaterials,em])]:ed.otherMaterials.filter(v=>v!==em);return;}const m=materials[Number(el.name.split('-').at(-1))],d=otherDraft();d.otherMaterials=el.checked?[...new Set([...d.otherMaterials,m])]:d.otherMaterials.filter(v=>v!==m);persist();return;}if(/^layout-provider-\d$/.test(el.name)){const i=Number(el.name.split('-').at(-1)),matches=r=>r.id==='provider-'+i||providerId(r.name)===i;if(editingProfile){profileEditDraft??=structuredClone(state.profile);profileEditArchive??=structuredClone(state.providerArchive??{});const draftResources=profileEditDraft.resources??=[];if(el.checked&&!draftResources.some(matches))draftResources.push(...(profileEditArchive[i]||[{id:'provider-'+i,name:providers[i],materials:providerMaterials(i),provenance:i===1?'Joseph-confirmed':'provider-information'}]));else if(!el.checked){profileEditArchive[i]=draftResources.filter(matches);profileEditDraft.resources=draftResources.filter(r=>!matches(r));}return;}state.providerArchive??={};if(el.checked&&!state.profile.resources.some(matches))state.profile.resources.push(...(state.providerArchive[i]||[{id:'provider-'+i,name:providers[i],materials:providerMaterials(i),provenance:i===1?'Joseph-confirmed':'provider-information'}]));else if(!el.checked){state.providerArchive[i]=state.profile.resources.filter(matches);state.profile.resources=state.profile.resources.filter(r=>!matches(r));}persist();return;}if(reviewChange(el))return;if((el.name==='notSure'||el.name==='notBooked')&&editingProfile){profileDraftWrite(el.name,el.checked);render();return;}if(['notSure','notBooked'].includes(el.name)){state.profile[el.name]=el.checked;persist();render();}else if(el.name==='otherResource')document.getElementById('other-entry').hidden=!el.checked;else if(el.name==='dmMode'){state.draft.dmMode=el.value;state.draft.scores.DM.max=el.value==='weighted'?'47':'35';persistScore();render();}else if(el.name==='includeSjt'){toggleSjt(el.checked);}else if(el.name==='defaultFormat'){formatPreferenceCommit(false);}else if(el.hasAttribute('data-task-check')){const i=Number(el.dataset.taskCheck),tasks=practiceTasks();if(el.checked===false&&state.route==='practice'){const dup=repeatDuplicateIndex(tasks,i);if(dup>=0){tasks[i]={...tasks[i],done:true};el.checked=true;focusPracticeCheck(dup);document.getElementById('status').textContent=repeatLabel(tasks[i])+' is already on your to-do list. It stayed completed. Nothing was added.';return;}}tasks[i]={...tasks[i],done:el.checked};if(savePractice(tasks,'check-'+practiceTargets[i],'Try the completion checkbox again to retry.')){if(el.checked===false){practiceRepeatRevalidate();practiceFailureSummary();if(!practiceFailures.size&&!practiceError&&state.route==='practice')practiceFeedback();}render();if(el.checked)homeFocusAfterCheck(i);}else el.checked=state.tasks[i].done;}});
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;e.preventDefault();const a=el.dataset.act;if(ACCOUNT_SAVE_LOCK_BLOCKED_ACTS.includes(a)&&accountSaveLockActive())return;message='';if(finalMockSaveAction(a,el)||noteAction(a,el)||progressRecommendationAction(a,el)||progressAction(a,el)||historyAction(a,el)||reviewGate(a)||overviewAction(a,el)||mockAction(a,el)||reviewAction(a,el))return;
if(['departure-save','departure-discard','departure-stay'].includes(a)){profileDepartureChoice(a);return;}if(a==='retry-format'){formatPreferenceCommit(true);return;}if(a==='evidence-review'){state.current=el.dataset.id;state.reviewIndex=Number(el.dataset.i);go('saved-review');return;}if(['home','progress','history','settings','practice'].includes(a)){if(editingProfile){if(profileEditDirty()){profilePendingDeparture={route:a,focusSelector:el.matches('a.brand')?'a.brand[data-act="home"]':'nav [data-act="'+a+'"]'};render();return;}const next={...state,...('editingProfile' in state?{editingProfile:false}:{}),route:a};if(persist(next)){editingProfile=false;render();}}else go(a);return;}if(a==='retry-practice'){const i=practiceEdits.keys().next().value,meta=practiceMetadata.entries().next().value,focus=i!==undefined?`[data-task-text="${i}"]`:meta?`[data-task-index="${meta[0]}"][data-task-meta="${Object.keys(meta[1])[0]}"]`:null;if(savePractice(practiceTasks(),'edit','Use Retry practice save or edit task details again to retry.')&&focus){const field=document.querySelector(focus);if(field?.closest('details'))field.closest('details').open=true;field?.focus();}return;}if(a==='repeat-task'&&state.route==='practice'){practiceRepeatCommit(Number(el.dataset.repeatIndex),practiceTargets[Number(el.dataset.repeatIndex)]);return;}if(a==='retry-repeat'&&state.route==='practice'){const target=Number(el.dataset.repeatTarget),i=practiceTargets.indexOf(target);if(i>=0)practiceRepeatCommit(i,target,true);return;}if(a==='add-task'){const text=document.getElementById('task').value.trim();if(!text){showError('Enter a practice activity.',['task']);return;}if(savePractice([...practiceTasks(),{text,done:false}],'add','Retry Add practice to save this activity.')){practiceTargets.push(nextPracticeTarget++);practiceComposer='';render();}return;}if(a==='remove-task'){const i=Number(el.dataset.i);practiceStructuralShift=true;let removed=false;try{removed=savePractice(practiceTasks().filter((_,j)=>j!==i),'remove-'+practiceTargets[i],'The activity is still here. Try Remove again to retry.');}finally{practiceStructuralShift=false;}if(removed){practiceTargets.splice(i,1);render();}return;}if(a==='edit-profile'){editingProfile=true;profileEditStep=0;profileEditDraft=null;profileEditArchive=null;profileEditOther=null;profilePendingDeparture=null;profileEditBaseline=profileEditBaselineNow();render();return;}if(a==='reset'){if(confirm('PREVIEW RESET: erase ONLY this remake’s browser-local demonstration data? This is not real account deletion.')){persist(fresh());editingProfile=false;render();}return;}if(a==='start'){state.started=true;state.route='home';persist();render();}else if(a==='entry'){state.started=false;go('home');}else if(a==='example'){document.getElementById('example').scrollIntoView({block:'start'});}else if(a==='preview-details')go('preview-details');
else if(a==='add-other'){if(editingProfile){if(commitOther()){document.querySelector('.resource-picker').open=false;render();}return;}const before=structuredClone(state);if(commitOther()){if(persist()){document.querySelector('.resource-picker').open=false;render();}else state=before;}}
else if(a==='onnext'){const before=structuredClone(state);if(editingProfile&&effectiveStep()===3){profileEditCommit('home');return;}if(editingProfile){const es=effectiveStep();const dp=profileEditDraft??state.profile;if(es===2&&!commitOther())return;if(es===0&&!dp.notSure&&(!/^\d+$/.test(String(dp.target))||!Number.isInteger(Number(dp.target))||Number(dp.target)<900||Number(dp.target)>2700)){showError('Enter a whole-number target from 900 to 2700, or choose Not sure yet.',['target']);return;}if(es===1&&!dp.notBooked&&!validExam(dp.exam)){showError('Choose a real exam date today or later, or select Not booked yet.',['exam']);return;}if(es<3)profileEditStep=es+1;render();return;}if(state.step===2&&!commitOther())return;if(state.step===0&&!state.profile.notSure&&(!/^\d+$/.test(String(state.profile.target))||!Number.isInteger(Number(state.profile.target))||Number(state.profile.target)<900||Number(state.profile.target)>2700)){showError('Enter a whole-number target from 900 to 2700, or choose Not sure yet.',['target']);return;}if(state.step===1&&!state.profile.notBooked&&!validExam(state.profile.exam)){showError('Choose a real exam date today or later, or select Not booked yet.',['exam']);return;}if(state.step===3&&!state.profile.tutor){showError('Choose your tutor status.',['tutor']);return;}const next=structuredClone(state);if(state.step===2)next.resourcesAnswered=true;if(state.step<3)next.step++;else{next.complete=true;next.editingProfile=false;next.route='home';}if(persist(next)){if(before.step===3)editingProfile=false;render();}else{state=before;showError('Could not save your study profile to this browser. Your input is still here, but these changes are not saved. Keep this page open and retry; reloading may lose unsaved changes.');}}
else if(a==='onback'){if(editingProfile&&effectiveStep()===0){if(profileEditDirty()){profilePendingDeparture={route:'settings',focusSelector:'.configure [data-act="onback"]'};render();return;}const next={...state,...('editingProfile' in state?{editingProfile:false}:{}),route:'settings'};if(persist(next)){editingProfile=false;profileEditDraft=null;profileEditArchive=null;profileEditOther=null;profileEditStep=null;profilePendingDeparture=null;profileEditBaseline=null;render();}return;}if(editingProfile&&effectiveStep()>0){profileEditStep=effectiveStep()-1;render();return;}const next=structuredClone(state);if(state.step>0)next.step--;else if(editingProfile)next.editingProfile=false;else next.started=false;if(persist(next)){editingProfile=!!next.editingProfile;render();}}
else if(a==='cancel-profile'){if(!editingProfile)return;editingProfile=false;profileEditDraft=null;profileEditArchive=null;profileEditOther=null;profileEditStep=null;profilePendingDeparture=null;profileEditBaseline=null;state.route='settings';render();}
else if(a==='add-resource'){const name=document.getElementById('resourceName').value.trim();if(!name){showError('Enter a resource name.',['resourceName']);return;}state.profile.resources.push({name,materials:materials.filter((v,i)=>document.querySelector(`[name="material-${i}"]`).checked)});persist();render();}
else if(a==='remove-resource'){if(editingProfile){profileEditDraft??=structuredClone(state.profile);const draftResources=profileEditDraft.resources??=[];const raw=el.dataset.i;if(!/^(0|[1-9]\d*)$/.test(raw??''))return;const i=Number(raw);if(!Number.isSafeInteger(i)||i>=draftResources.length)return;draftResources.splice(i,1);render();return;}state.profile.resources.splice(Number(el.dataset.i),1);persist();render();}
});
// Native Tab scrolling can round fractional bounds and clip focus rings.
// Correct only keyboard-origin focus; pointer clicks must not move targets.
let keyboardOrigin=false;
document.addEventListener('keydown',()=>{keyboardOrigin=true;});
document.addEventListener('pointerdown',()=>{keyboardOrigin=false;});
document.addEventListener('focusin',e=>{const el=e.target;if(!keyboardOrigin||el.classList.contains('skip'))return;const r=el.getBoundingClientRect();if(r.top<12||r.bottom>innerHeight-12)el.scrollIntoView({block:'center',behavior:'instant'});});
editingProfile=!!state.editingProfile;
// Resume only at load; Back never triggers this calculation during a live visit.
if(state.started&&!state.complete){const p=state.profile;state.step=!(p.notSure||(/^\d+$/.test(String(p.target))&&Number(p.target)>=900&&Number(p.target)<=2700))?0:!(p.notBooked||validExam(p.exam))?1:otherDraft().other||!(state.resourcesAnswered||state.step>2)?2:3;}
if(editingProfile)profileEditBaseline=profileEditBaselineNow();
render();
