import {createRateLimiter} from './request-rate-limit.mjs';
function reply(response,status,body,extraHeaders){response.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extraHeaders});response.end(JSON.stringify(body))}
function readBody(request){
 const maxBytes=9*1024*1024;
 return new Promise((resolve,reject)=>{
  let bytes=0,chunks=[],settled=false;
  const fail=code=>{if(!settled){settled=true;chunks=[];reject(Object.assign(new Error(code),{code}))}};
  if(request.aborted)return fail('invalid_json');
  if(Number(request.headers['content-length'])>maxBytes){request.resume();return fail('payload_too_large')}
  request.on('data',chunk=>{if(settled)return;bytes+=chunk.length;if(bytes>maxBytes)return fail('payload_too_large');chunks.push(chunk)});
  request.once('end',()=>{if(settled)return;settled=true;const body=Buffer.concat(chunks);chunks=[];resolve(body)});
  request.once('aborted',()=>fail('invalid_json'));
  request.once('error',()=>fail('invalid_json'));
 });
}
function requestReviewRevision(request){
 const match=request.headers['if-match'];
 if(!match)throw Object.assign(new Error('Review version required'),{code:'review_version_required'});
 const revision=/^"review-(0|[1-9][0-9]*)"$/.exec(match)?.[1];
 if(revision===undefined||!Number.isSafeInteger(Number(revision)))throw Object.assign(new Error('Invalid review version'),{code:'invalid_review_version'});
 return Number(revision);
}
export function createRequestHandler({verifyIdToken,mockStore,rateLimit}) {
 const limiter=createRateLimiter(rateLimit);
 const denyRateLimited=(response,retryAfterSeconds)=>reply(response,429,{error:'rate_limited'},{'retry-after':String(retryAfterSeconds)});
 return async (request,response)=>{
  const ipDenied=limiter.consumeIp(request.socket&&request.socket.remoteAddress);
  if(ipDenied)return denyRateLimited(response,ipDenied.retryAfterSeconds);
  const path=(request.url||'').split('?')[0],isCommit=Boolean(mockStore)&&path==='/api/mocks/commit',isItem=Boolean(mockStore)&&path==='/api/mocks/item',isEdit=Boolean(mockStore)&&path==='/api/mocks/reviews',isList=Boolean(mockStore)&&path==='/api/mocks',isUsage=Boolean(mockStore)&&path==='/api/account/mock-usage';
  if(!isCommit&&!isItem&&!isEdit&&!isList&&!isUsage&&path!=='/api/session')return reply(response,404,{error:'not_found'});
  const methods=isCommit?['POST']:isEdit?['PATCH']:isItem?['GET','DELETE']:['GET'];
  if(!methods.includes(request.method)){response.setHeader('allow',methods.join(', '));return reply(response,405,{error:'method_not_allowed'})}
  const count=request.rawHeaders.filter((name,index)=>index%2===0&&name.toLowerCase()==='authorization').length;
  const token=count===1?/^Bearer ([^\s,]+)$/i.exec(request.headers.authorization||'')?.[1]:undefined;
  if(!token)return reply(response,401,{error:'authentication_required'});
  try{
   const decoded=await verifyIdToken(token,true);
   if(!decoded||typeof decoded.uid!=='string'||!decoded.uid)return reply(response,401,{error:'invalid_authentication'});
   const accountDenied=limiter.consumeAccount(decoded.uid);
   if(accountDenied)return denyRateLimited(response,accountDenied.retryAfterSeconds);
   if(decoded.email_verified!==true)return reply(response,403,{error:'email_verification_required'});
   if(isUsage){try{return reply(response,200,await mockStore.getUsage(decoded.uid))}catch{return reply(response,503,{error:'storage_unavailable'})}}
   if(isList){
    const params=new URL(request.url,'http://local.invalid').searchParams,bad=()=>reply(response,400,{error:'invalid_list_request'});
    if(params.getAll('limit').length>1||params.getAll('after').length>1)return bad();
    let limit=10;
    if(params.has('limit')){const raw=params.get('limit');if(!/^(?:[1-9]|1[0-9]|20)$/.test(raw))return bad();limit=Number(raw)}
    const after=params.has('after')?params.get('after'):null;
    if(after!==null&&!/^[A-Za-z0-9_-]{1,1024}$/.test(after))return bad();
    try{
     const page=await mockStore.list(decoded.uid,{limit,after});
     return reply(response,200,{items:page.items.map(({summary,reviewRevision})=>({summary,etag:'"review-'+reviewRevision+'"'})),nextCursor:page.nextCursor});
    }catch(error){return error?.code==='invalid_list_request'?bad():reply(response,503,{error:'storage_unavailable'})}
   }
   if(isItem){
    try{
     const id=new URL(request.url,'http://local.invalid').searchParams.get('id');
     if(typeof id!=='string'||!id||id.length>128)return reply(response,400,{error:'invalid_mock_id'});
     if(request.method==='DELETE'){
      // Operation work budget refuses oversized deletion traversal with a
      // sanitized 422 on this mutation path only; no Retry-After is promised.
      try{return reply(response,200,await mockStore.remove(decoded.uid,id,requestReviewRevision(request)))}
      catch(error){if(error?.code==='operation_work_limit_exceeded')return reply(response,422,{error:'operation_work_limit_exceeded'});throw error}
     }
     const saved=await mockStore.get(decoded.uid,id);
     if(!saved)return reply(response,404,{error:'mock_not_found'});
     response.setHeader('etag','"review-'+saved.reviewRevision+'"');
     return reply(response,200,{mock:saved.mock});
    }catch(error){const statuses={review_conflict:412,mock_not_found:404,review_version_required:428,invalid_review_version:400};return Object.hasOwn(statuses,error?.code)?reply(response,statuses[error.code],{error:error.code}):reply(response,503,{error:'storage_unavailable'})}
   }
   if(isCommit||isEdit){
    if(!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type']||'')||(request.headers['content-encoding']&&request.headers['content-encoding']!=='identity'))return reply(response,415,{error:'unsupported_media_type'});
    let payload;
    try{payload=JSON.parse((await readBody(request)).toString('utf8'))}catch(error){
     if(error?.code==='payload_too_large'){request.resume();response.setHeader('connection','close');return reply(response,413,{error:'payload_too_large'})}
     return reply(response,400,{error:'invalid_json'});
    }
    try{
     if(isEdit){
      const id=new URL(request.url,'http://local.invalid').searchParams.get('id');
      if(typeof id!=='string'||!id||id.length>128)return reply(response,400,{error:'invalid_mock_id'});
      const result=await mockStore.updateReviews(decoded.uid,id,payload,requestReviewRevision(request));
      response.setHeader('etag','"review-'+result.reviewRevision+'"');return reply(response,200,{saved:true,id:result.id});
     }
     const result=await mockStore.commit(decoded.uid,payload);
     return reply(response,result.created?201:200,result);
    }catch(error){
     // The daily paid refusal is a COMMIT-mutation-only 429 with a trusted-clock
     // Retry-After integer (seconds to next UTC midnight); edit/remove keep the
     // default 503 for this code. Sanitized body; no raw UID/grant/config leaked.
     if(isCommit&&error?.code==='daily_mock_limit_exceeded'){
      const retryAfter=Number.isSafeInteger(error.retryAfterSeconds)&&error.retryAfterSeconds>=1?String(error.retryAfterSeconds):'1';
      return reply(response,429,{error:'daily_mock_limit_exceeded'},{'retry-after':retryAfter});
     }
     const statuses={invalid_mock:400,commit_conflict:409,initial_allowance_exhausted:403,review_conflict:412,mock_not_found:404,invalid_review_patch:400,review_version_required:428,invalid_review_version:400,operation_work_limit_exceeded:422};
     return Object.hasOwn(statuses,error?.code)?reply(response,statuses[error.code],{error:error.code}):reply(response,503,{error:'storage_unavailable'});
    }
   }
   return reply(response,200,{uid:decoded.uid});
  }catch(error){
   const invalid=new Set(['auth/argument-error','auth/invalid-id-token','auth/id-token-expired','auth/id-token-revoked','auth/user-disabled','auth/user-not-found']);
   return invalid.has(error?.code)?reply(response,401,{error:'invalid_authentication'}):reply(response,503,{error:'authentication_unavailable'});
  }
 };
}
