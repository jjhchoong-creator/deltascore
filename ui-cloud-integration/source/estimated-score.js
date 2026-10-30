// Fixed approved midpoint conversion, reconstructed from6October2026 source evidence.
// Estimates only; no provider calibration, missing-value normalization or live requests.
export const SCORE_VERSION='midpoint-20261006-v1';
const CURVES=Object.freeze({
 VR:Object.freeze([300,320,320,320,320,320,330,340,350,380,390,400,430,450,450,480,500,500,530,550,550,580,590,590,610,620,630,640,660,660,680,700,710,710,730,750,770,800,810,830,850,880,890,900,900]),
 DM35:Object.freeze([300,330,330,340,350,360,380,400,420,440,460,490,510,510,540,560,580,600,610,630,640,650,670,690,690,720,740,750,770,790,800,830,860,890,890,900]),
 QR:Object.freeze([300,320,320,320,340,360,370,380,390,420,430,450,460,480,490,500,520,530,550,620,630,640,650,670,670,690,710,720,750,760,790,810,820,860,880,890,900]),
 DM47:Object.freeze([300,320,330,340,340,350,360,360,380,400,410,420,440,460,470,490,500,510,520,540,560,580,580,600,610,620,630,640,650,670,670,690,690,710,720,740,740,770,770,790,800,830,840,860,890,890,890,900])
});
function integer(value){
 if(!['number','string'].includes(typeof value)||(typeof value==='string'&&!value.trim()))return null;
 const n=Number(value);return Number.isInteger(n)&&n>=0?n:null;
}
export function estimatedSection(section,score,dmMode){
 const earned=integer(score?.earned),maximum=integer(score?.max);
 const key=section==='DM'?(dmMode==='questions'?'DM35':dmMode==='weighted'?'DM47':null):(['VR','QR'].includes(section)?section:null);
 const curve=key&&CURVES[key];
 if(!curve||earned===null||maximum!==curve.length-1||earned>maximum)return null;
 return curve[earned];
}
export function estimatedMock(mock){
 const sections=Object.fromEntries(['VR','DM','QR'].map(section=>[section,estimatedSection(section,mock?.scores?.[section],mock?.dmMode)]));
 const values=Object.values(sections);
 return {version:SCORE_VERSION,sections,total:values.every(value=>value!==null)?values.reduce((sum,value)=>sum+value,0):null};
}


// Personal records use the same frozen scale across supported DM formats.
function savedResult(mock){
 return !!mock&&typeof mock.id==='string'&&!!mock.id.trim()&&mock.draft!==true&&typeof mock.loggedAt==='string'&&Number.isFinite(Date.parse(mock.loggedAt));
}
export function personalBests(current,history){
 const result={version:SCORE_VERSION,overall:null,sections:[]};
 if(!savedResult(current))return result;
 const rows=Array.isArray(history)?history:[];
 if(rows.some(mock=>mock?.id===current.id))return result;
 const counts=new Map();for(const mock of rows)if(typeof mock?.id==='string')counts.set(mock.id,(counts.get(mock.id)||0)+1);
 const previous=rows.filter(mock=>savedResult(mock)&&counts.get(mock.id)===1).map(estimatedMock),now=estimatedMock(current);
 const best=values=>values.reduce((highest,value)=>value===null?highest:highest===null?value:Math.max(highest,value),null);
 const total=best(previous.map(mock=>mock.total));
 if(now.total!==null&&total!==null&&now.total>total)result.overall={score:now.total,previous:total};
 for(const section of ['VR','DM','QR']){
  const value=now.sections[section],highest=best(previous.map(mock=>mock.sections[section]));
  if(value!==null&&highest!==null&&value>highest)result.sections.push({section,score:value,previous:highest});
 }
 return result;
}


// This validates a new committed transition; draft/review writes never qualify.
export function mockSaveFeedback(before,next,id){
 if(!before||!next||!Array.isArray(before.mocks)||!Array.isArray(next.mocks)||!Array.isArray(before.savedIds)||!Array.isArray(next.savedIds))return null;
 if(!Number.isInteger(before.used)||before.used<0||next.used!==before.used+1)return null;
 if(next.savedIds.length!==before.savedIds.length+1||next.savedIds.at(-1)!==id||!before.savedIds.every((old,index)=>next.savedIds[index]===old)||before.savedIds.includes(id))return null;
 if(next.mocks.length!==before.mocks.length+1||before.mocks.some(mock=>mock?.id===id)||!before.mocks.every((mock,index)=>mock?.id===next.mocks[index]?.id))return null;
 const current=next.mocks.at(-1);if(!savedResult(current)||current.id!==id)return null;
 const records=personalBests(current,before.mocks),first=before.used===0&&before.savedIds.length===0&&before.mocks.length===0;
 let kind=first?'first':next.used===2?'second':'saved',headline=first?'First mock logged — you’ve made a start.':next.used===2?'Two mocks logged — keep building.':'Mock logged — another step in your preparation.',detail='',sections='';
 if(records.overall){
  kind='overall';headline='New overall personal best!';detail=`Estimated scaled total: ${records.overall.score} (previous best: ${records.overall.previous}).`;
  if(records.sections.length)sections='Section personal bests (estimated scaled): '+records.sections.map(record=>`${record.section} ${record.score} (previous best: ${record.previous})`).join('; ')+'.';
 }else if(records.sections.length){
  kind='sections';headline=`New section personal best${records.sections.length===1?'':'s'}!`;detail=records.sections.map(record=>`${record.section}: ${record.score} (previous best: ${record.previous})`).join('; ')+'.';
 }
 return {id,kind,headline,detail,sections,text:[headline,detail,sections].filter(Boolean).join(' '),record:kind==='overall'||kind==='sections'};
}
