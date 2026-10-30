export function selectMocks(mocks, range='3', mode='both') {
 const eligible=mocks.filter(m=>Number.isFinite(Date.parse(m.loggedAt))&&(mode==='both'||m.dmMode===mode)).slice().sort((a,b)=>Date.parse(a.loggedAt)-Date.parse(b.loggedAt));
 return range==='all'?eligible:eligible.slice(-Number(range));
}
function raw(value) {
 if(!value||value.earned===null||value.earned===undefined||value.earned===''||value.max===null||value.max===undefined||value.max==='')return null;
 const earned=Number(value.earned),max=Number(value.max);
 return Number.isFinite(earned)&&Number.isFinite(max)&&max>0&&earned>=0&&earned<=max?{earned,max}:null;
}
export function reviewSummary(mocks, includeUnconfirmed=false) {
 const summary={selected:0,reviewed:0,labelled:0,sjtSelected:0,sjtReviewed:0,labels:[]},groups=new Map();
 for(const m of mocks)for(const [questionIndex,q] of (m.reviews||[]).entries()) {
  if(q.section==='SJT'){if(raw(m.sjt)){summary.sjtSelected++;if(q.reviewed===true)summary.sjtReviewed++;}continue;}
  if(!['VR','DM','QR'].includes(q.section))continue;
  summary.selected++;const confirmed=q.reviewed===true;if(confirmed)summary.reviewed++;
  const labels=[...(q.type?[['Question type',q.type]]:[]),...[...new Set(q.reasons||[])].filter(Boolean).map(l=>['Error reason',l])];
  if(confirmed&&labels.length)summary.labelled++;
  if(!confirmed&&!includeUnconfirmed)continue;
  for(const [family,label] of labels){const key=JSON.stringify([q.section,family,label]);if(!groups.has(key))groups.set(key,{section:q.section,family,label,confirmed:0,unconfirmed:0,evidence:[]});const g=groups.get(key);g[confirmed?'confirmed':'unconfirmed']++;g.evidence.push({mockId:m.id,mockTitle:m.title,questionIndex,section:q.section,number:q.number,confirmed});}
 }
 summary.labels=[...groups.values()].sort((a,b)=>a.section.localeCompare(b.section)||a.family.localeCompare(b.family)||a.label.localeCompare(b.label));return summary;
}
export function rawRows(mocks) {
 return mocks.map(m=>({id:m.id,title:m.title,loggedAt:m.loggedAt,dmMode:m.dmMode,VR:raw(m.scores?.VR),DM:raw(m.scores?.DM),QR:raw(m.scores?.QR),SJT:raw(m.sjt)}));
}
