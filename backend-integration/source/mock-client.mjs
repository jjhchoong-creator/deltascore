import {validateScores} from './approved-domain.mjs';
const record=value=>value&&typeof value==='object'&&!Array.isArray(value);
const numeric=value=>(typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(Number(value));
const mark=value=>record(value)&&numeric(value.earned)&&numeric(value.max);
const failure=(code,status)=>Object.assign(new Error('Private API request did not complete'),{code,status});
const knownErrors={authentication_required:401,invalid_authentication:401,email_verification_required:403,authentication_unavailable:503,storage_unavailable:503,mock_not_found:404,invalid_mock_id:400,invalid_list_request:400,invalid_mock:400,commit_conflict:409,initial_allowance_exhausted:403,payload_too_large:413,unsupported_media_type:415,review_conflict:412,review_version_required:428,invalid_review_version:400,invalid_review_patch:400,operation_work_limit_exceeded:422,daily_mock_limit_exceeded:429};
const encodeId=id=>{if(typeof id!=='string'||!id||id.length>128)throw failure('invalid_mock_id');try{return encodeURIComponent(id)}catch{throw failure('invalid_mock_id')}};
const validVersion=value=>{const match=typeof value==='string'&&/^"review-(0|[1-9][0-9]*)"$/.exec(value);return Boolean(match&&match[0]===value&&Number.isSafeInteger(Number(match[1])))};
const requireVersion=etag=>{if(etag===undefined||etag===null||etag==='')throw failure('review_version_required');if(!validVersion(etag))throw failure('invalid_review_version')};
const canonicalKey=id=>{const match=typeof id==='string'&&/^[A-Za-z0-9_-]{1,1024}$/.exec(id);return Boolean(match&&match[0]===id)};
const b64url=value=>{let binary='';for(const byte of new TextEncoder().encode(value))binary+=String.fromCharCode(byte);return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const literalId=id=>{if(typeof id!=='string'||!id||id.length>128)throw failure('invalid_response');try{if(decodeURIComponent(encodeURIComponent(id))!==id)throw failure('invalid_response')}catch{throw failure('invalid_response')}return id};
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value)}return value};
export function createMockClient({session,fetcher=globalThis.fetch}){
 const request=async(url,decode,options={},success=[200])=>{
  const owner=session.getState();
  const current=()=>{if(session.getState()!==owner)throw Object.assign(new Error('Account changed before applying private data'),{code:'stale_account'})};
  const data=await session.runPrivate(async({token})=>{
   let response;
   try{response=await fetcher(url,{method:'GET',...options,headers:{...options.headers,authorization:'Bearer '+token},credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)})}catch{throw failure('request_failed')}
   let body;try{body=await response.json()}catch{throw failure(success.includes(response.status)?'invalid_response':'request_failed',response.status)}
   if(!success.includes(response.status)){const code=body?.error;throw failure(typeof code==='string'&&Object.hasOwn(knownErrors,code)&&knownErrors[code]===response.status?code:'request_failed',response.status)}
   return decode(body,response);
  });
  current();freeze(data);
  return Object.freeze({data,apply:callback=>{current();return callback(data)}});
 };
 return {deleteMock:async(id,etag)=>{const encoded=encodeId(id);requireVersion(etag);return request('/api/mocks/item?id='+encoded,(ack,response)=>{if(!record(ack)||ack.deleted!==true||ack.id!==id)throw failure('invalid_response',response.status);return {deleted:true,id:ack.id}},{method:'DELETE',headers:{'if-match':etag}})},updateReviews:async(id,etag,reviews)=>{
  const encoded=encodeId(id);requireVersion(etag);
  let body;try{if(!Array.isArray(reviews))throw failure('invalid_review_patch');body=JSON.stringify(structuredClone({reviews}))}catch{throw failure('invalid_review_patch')}
  return request('/api/mocks/reviews?id='+encoded,(ack,response)=>{const returned=response.headers.get('etag');if(!record(ack)||ack.saved!==true||ack.id!==id||!validVersion(returned))throw failure('invalid_response',response.status);return {saved:true,id:ack.id,etag:returned}},{method:'PATCH',headers:{'content-type':'application/json','if-match':etag},body});
 },commitMock:async raw=>{
  let id,body;try{
   if(!record(raw))throw failure('invalid_mock');
   const {id:submittedId,title='',provider='',dmMode,scores,sjt=null,reviews=[],note=''}=structuredClone(raw);id=submittedId;
   if(typeof id!=='string'||!id||id.length>128)throw failure('invalid_mock');encodeURIComponent(id);
   body=JSON.stringify({id,title,provider,dmMode,scores,sjt,reviews,note});
  }catch{throw failure('invalid_mock')}
  return request('/api/mocks/commit',(ack,response)=>{if(!record(ack)||ack.id!==id||ack.created!==(response.status===201)||!Number.isSafeInteger(ack.used)||ack.used<1)throw failure('invalid_response',response.status);return {created:ack.created,id:ack.id,used:ack.used}},{method:'POST',headers:{'content-type':'application/json'},body},[200,201]);
 },getUsage:()=>{
 const paidKeys=['accessSource','dailyAllowanceLimit','dailyLogsUsed','dailyResetAt','accessExpiresAt'];
 // Strict OPTIONAL paid projection (paid-daily-backend-parent-acceptance.md):
 // NO paid field present keeps the EXACT initial DTO; ANY paid field present
 // requires the full valid active-paid set — partial, wrong-typed,
 // non-canonical or an unsupported accessSource discriminant fails closed as
 // invalid_response and NEVER silently falls back to the initial DTO. No
 // client clock comparison on a possibly-stale snapshot; no Retry-After use.
 const canonicalIso=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(Date.parse(value)).toISOString()===value;
 return request('/api/account/mock-usage',(body,response)=>{
  const invalid=()=>failure('invalid_response',response.status);
  if(!record(body)||!Number.isSafeInteger(body.cumulativeLogsUsed)||body.cumulativeLogsUsed<0||body.initialAllowanceLimit!==3)throw invalid();
  const projected={cumulativeLogsUsed:body.cumulativeLogsUsed,initialAllowanceLimit:body.initialAllowanceLimit};
  if(!paidKeys.some(key=>Object.hasOwn(body,key)))return projected;
  if(!paidKeys.every(key=>Object.hasOwn(body,key))||body.accessSource!=='self-paid'||body.dailyAllowanceLimit!==12||!Number.isSafeInteger(body.dailyLogsUsed)||body.dailyLogsUsed<0||body.dailyLogsUsed>12||body.dailyLogsUsed>body.cumulativeLogsUsed||!canonicalIso(body.dailyResetAt)||!body.dailyResetAt.endsWith('T00:00:00.000Z')||!canonicalIso(body.accessExpiresAt))throw invalid();
  return {...projected,accessSource:body.accessSource,dailyAllowanceLimit:body.dailyAllowanceLimit,dailyLogsUsed:body.dailyLogsUsed,dailyResetAt:body.dailyResetAt,accessExpiresAt:body.accessExpiresAt};
 });
 },listMocks:async(options={})=>{
  if(!record(options))throw failure('invalid_list_request');
  const {limit:suppliedLimit=10,after:suppliedAfter=null}=options;
  if(!Number.isInteger(suppliedLimit)||suppliedLimit<1||suppliedLimit>20)throw failure('invalid_list_request');
  let after=null;
  if(suppliedAfter!==null){
   if(!canonicalKey(suppliedAfter))throw failure('invalid_list_request');
   let literal;
   try{const padded=suppliedAfter.replace(/-/g,'+').replace(/_/g,'/');literal=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(Uint8Array.from(atob(padded+'='.repeat((4-padded.length%4)%4)),char=>char.charCodeAt(0)))}catch{throw failure('invalid_list_request')}
   if(!literal||literal.length>128||b64url(literal)!==suppliedAfter)throw failure('invalid_list_request');
   after=suppliedAfter;
  }
  return request('/api/mocks?limit='+suppliedLimit+(after===null?'':'&after='+encodeURIComponent(after)),(body,response)=>{
   const invalid=()=>failure('invalid_response',response.status);
   if(!record(body)||!Array.isArray(body.items)||body.items.length>suppliedLimit)throw invalid();
   if(body.nextCursor!==null&&!canonicalKey(body.nextCursor))throw invalid();
   let previous=after;
   const items=body.items.map(row=>{
    if(!record(row)||!record(row.summary)||!validVersion(row.etag))throw invalid();
    const summary=row.summary;
    try{literalId(summary.id)}catch{throw invalid()}
    if(typeof summary.title!=='string'||typeof summary.provider!=='string'||typeof summary.loggedAt!=='string'||!Number.isFinite(Date.parse(summary.loggedAt))||new Date(summary.loggedAt).toISOString()!==summary.loggedAt)throw invalid();
    if(!['VR','DM','QR'].every(section=>mark(summary.scores?.[section])))throw invalid();
    if(summary.sjt!==null&&!mark(summary.sjt))throw invalid();
    const projected={id:summary.id,title:summary.title,provider:summary.provider,dmMode:summary.dmMode,scores:Object.fromEntries(['VR','DM','QR'].map(section=>[section,{earned:summary.scores[section].earned,max:summary.scores[section].max}])),sjt:summary.sjt===null?null:{earned:summary.sjt.earned,max:summary.sjt.max},loggedAt:summary.loggedAt};
    if(validateScores(projected).length)throw invalid();
    const position=b64url(projected.id);
    if(previous!==null&&!(position>previous))throw invalid();
    previous=position;
    return {summary:projected,etag:row.etag};
   });
   if(body.nextCursor!==null&&(items.length===0||b64url(items[items.length-1].summary.id)!==body.nextCursor))throw invalid();
   return {items,nextCursor:body.nextCursor};
  });
 },getMock:async id=>{
  const encoded=encodeId(id);
  return request('/api/mocks/item?id='+encoded,(body,response)=>{
   const mock=body?.mock,etag=response.headers.get('etag'),invalid=()=>failure('invalid_response',response.status);
   if(!record(mock)||mock.id!==id||['title','provider','note','loggedAt'].some(key=>typeof mock[key]!=='string')||!Number.isFinite(Date.parse(mock.loggedAt))||['VR','DM','QR'].some(section=>!mark(mock.scores?.[section]))||mock.sjt!==null&&!mark(mock.sjt)||validateScores(mock).length||!Array.isArray(mock.reviews)||!validVersion(etag))throw invalid();
   const seen=new Set();for(const q of mock.reviews){if(!record(q)||!['VR','DM','QR','SJT'].includes(q.section)||q.section==='SJT'&&!mock.sjt||!numeric(q.number)||!Number.isInteger(Number(q.number))||Number(q.number)<1)throw invalid();const key=q.section+':'+Number(q.number);if(seen.has(key))throw invalid();seen.add(key)}
   return {mock:Object.fromEntries(['id','title','provider','dmMode','scores','sjt','reviews','note','loggedAt'].map(key=>[key,mock[key]])),etag};
  });
 }};
}
