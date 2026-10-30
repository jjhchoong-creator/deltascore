// Focused request-rate boundary regression. Real loopback HTTP with
// verifier/store spies (boundary fixtures, not real Firebase/emulator).
// Deterministic clock; development-default budgets overridden per test.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
const boundary=await import('./auth-boundary.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND'&&error.message.includes('auth-boundary.mjs'))return {};throw error});
const limiterModule=await import('./request-rate-limit.mjs');
function fixedClock(start=0){const state={now:start};const clock=()=>state.now;clock.advance=ms=>{state.now+=ms};return clock}
async function withBoundary(options,fn){
 assert.equal(typeof boundary.createRequestHandler,'function','Missing fresh backend authenticated-request handler');
 const {verifyIdToken,mockStore,rateLimit}=options;
 const server=createServer(boundary.createRequestHandler({verifyIdToken,mockStore,rateLimit}));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{return await fn(`http://127.0.0.1:${server.address().port}`,server)}finally{await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()))}
}
async function hit(base,path,{method='GET',authorization}={}){
 const headers={};if(authorization)headers.authorization=authorization;
 const response=await fetch(base+path,{method,headers});
 return {status:response.status,retryAfter:response.headers.get('retry-after'),cacheControl:response.headers.get('cache-control'),body:await response.json()};
}
function assert429(result){
 assert.equal(result.status,429,'Burst requests must be denied with 429');
 assert.deepEqual(result.body,{error:'rate_limited'});
 assert.equal(result.cacheControl,'no-store','429 must be no-store');
 assert.match(String(result.retryAfter),/^[1-9][0-9]*$/,'Retry-After must be a deterministic positive integer');
}
test('flood of rejected requests hits the IP budget and returns 429 without touching Firebase',async()=>{
 const clock=fixedClock();
 let verifyCalls=0;
 const result=await withBoundary({verifyIdToken:async()=>{verifyCalls++;return {uid:'student-a',email_verified:true}},rateLimit:{ipBurst:5,ipRefillPerSecond:1,accountBurst:100,accountRefillPerSecond:100,now:clock}},async base=>{
  const statuses=[];
  const flood=[['/api/not-found','GET',undefined],['/api/session','POST',undefined],['/api/session','GET',undefined],['/api/session','GET','Basic abc'],['/api/session','GET','Bearer valid-token']];
  for(const [path,method,authorization] of flood)statuses.push((await hit(base,path,{method,authorization})).status);
  const denied=await hit(base,'/api/session',{authorization:'Bearer valid-token'});
  return {statuses,denied,verifyCalls};
 });
 assert.deepEqual(result.statuses,[404,405,401,401,200],'First five attempts keep their original outcomes');
 assert429(result.denied);
 assert.equal(result.verifyCalls,1,'429 must not dispatch the verifier beyond the IP gate');
});
test('429 denials stay depleted and refill recovers one token per second deterministically',async()=>{
 const clock=fixedClock();
 const outcome=await withBoundary({verifyIdToken:async()=>({uid:'student-a',email_verified:true}),rateLimit:{ipBurst:2,ipRefillPerSecond:1,accountBurst:100,accountRefillPerSecond:100,now:clock}},async base=>{
  await hit(base,'/api/session');await hit(base,'/api/session');
  clock.advance(500);
  const halfSecond=await hit(base,'/api/session');
  clock.advance(500);
  const recovered=await hit(base,'/api/session');
  const next=await hit(base,'/api/session');
  return {halfSecond,recovered,next};
 });
 assert429(outcome.halfSecond);
 assert.equal(outcome.recovered.status,401,'A refilled token admits exactly one attempt (denial still not free)');
 assert429(outcome.next);
});
test('account budget is debited before email-verification denial and is independent per account',async()=>{
 const clock=fixedClock();
 let verifyCalls=0;
 const outcome=await withBoundary({verifyIdToken:async token=>{verifyCalls++;if(token==='invalid')throw Object.assign(new Error('hidden'),{code:'auth/invalid-id-token'});return {uid:token==='tok-b'?'student-b':'student-a',email_verified:false}},rateLimit:{ipBurst:1000,ipRefillPerSecond:1000,accountBurst:2,accountRefillPerSecond:1,now:clock}},async base=>{
  const first=await hit(base,'/api/session',{authorization:'Bearer tok-a'});
  const second=await hit(base,'/api/session',{authorization:'Bearer tok-a'});
  const thirdSameAccount=await hit(base,'/api/session',{authorization:'Bearer tok-a'});
  const differentAccount=await hit(base,'/api/session',{authorization:'Bearer tok-b'});
  const invalidToken=await hit(base,'/api/session',{authorization:'Bearer invalid'});
  return {first,second,thirdSameAccount,differentAccount,invalidToken};
 });
 assert.equal(outcome.first.status,403);assert.equal(outcome.second.status,403);
 assert429(outcome.thirdSameAccount);
 assert.equal(outcome.differentAccount.status,403,'Account budgets are independent across verified accounts');
 assert.equal(outcome.invalidToken.status,401,'Invalid tokens are attributed to the IP budget only');
 assert.equal(verifyCalls,5);
});
test('429 never dispatches store work beyond the account gate',async()=>{
 const clock=fixedClock();
 let storeCalls=0;
 const mockStore={getUsage:async()=>{storeCalls++;return {used:1,remaining:9}}};
 const outcome=await withBoundary({verifyIdToken:async()=>({uid:'student-a',email_verified:true}),mockStore,rateLimit:{ipBurst:1000,ipRefillPerSecond:1000,accountBurst:1,accountRefillPerSecond:1,now:clock}},async base=>{
  const admitted=await hit(base,'/api/account/mock-usage',{authorization:'Bearer tok-a'});
  const denied=await hit(base,'/api/account/mock-usage',{authorization:'Bearer tok-a'});
  const storeCallsAfterDenied=storeCalls;
  clock.advance(1000);
  const recovered=await hit(base,'/api/account/mock-usage',{authorization:'Bearer tok-a'});
  return {admitted,denied,recovered,storeCallsAfterDenied};
 });
 assert.equal(outcome.admitted.status,200);assert.deepEqual(outcome.admitted.body,{used:1,remaining:9});
 assert429(outcome.denied);
 assert.equal(outcome.storeCallsAfterDenied,1,'Denied attempts must not reach the datastore');
 assert.equal(outcome.recovered.status,200);assert.equal(storeCalls,2);
});
test('concurrent burst cannot overspend the IP budget',async()=>{
 const clock=fixedClock();
 const outcome=await withBoundary({verifyIdToken:async()=>({uid:'student-a',email_verified:true}),rateLimit:{ipBurst:5,ipRefillPerSecond:1,accountBurst:100,accountRefillPerSecond:100,now:clock}},async base=>{
  const responses=await Promise.all(Array.from({length:10},()=>fetch(base+'/api/session',{headers:{authorization:'Bearer tok-a'}}).then(response=>response.status)));
  return responses;
 });
 assert.equal(outcome.filter(status=>status===200).length,5,'Exactly the burst budget passes concurrently');
 assert.equal(outcome.filter(status=>status===429).length,5);
});
test('missing socket identity shares a fail-closed fallback bucket with no bypass',async()=>{
 const clock=fixedClock();
 const handler=boundary.createRequestHandler({verifyIdToken:async()=>({uid:'student-a',email_verified:true}),rateLimit:{ipBurst:1,ipRefillPerSecond:1,accountBurst:100,accountRefillPerSecond:100,now:clock}});
 const fakeRequest=()=>({url:'/api/session',method:'GET',headers:{authorization:'Bearer tok-a'},rawHeaders:['authorization','Bearer tok-a'],socket:{}});
 const fakeResponse=()=>({headers:{},statusCode:undefined,body:undefined,setHeader(name,value){this.headers[name.toLowerCase()]=String(value)},writeHead(status,extra){this.statusCode=status;Object.assign(this.headers,extra)},end(body){this.body=body}});
 const first=fakeResponse();await handler(fakeRequest(),first);
 const second=fakeResponse();await handler(fakeRequest(),second);
 const third=fakeResponse();await handler({...fakeRequest(),socket:{}},third);
 assert.equal(first.statusCode,200,'Admitted request still supplies identity');
 assert.equal(second.statusCode,429,'Unknown identity is fail-closed, never bypassed');
 assert.deepEqual(JSON.parse(second.body),{error:'rate_limited'});
 assert.equal(third.statusCode,429,'All missing identities share the same fallback bucket');
});
test('configuration is strictly validated and rejects overrides',async()=>{
 assert.equal(typeof limiterModule.createRateLimiter,'function');
 for(const rateLimit of [{ipBurst:0},{ipBurst:1.5},{ipRefillPerSecond:-5},{accountBurst:'30'},{accountRefillPerSecond:0},{maxKeysPerDimension:0},{idleExpiryMs:0},{saturatedRetryAfterSeconds:0},{now:'not-a-clock'},[],'strict',true]){
  assert.throws(()=>boundary.createRequestHandler({verifyIdToken:async()=>({uid:'a',email_verified:true}),rateLimit}),TypeError,`Invalid rate-limit configuration ${JSON.stringify(rateLimit)} must fail closed at construction`);
 }
});
test('limiter state is bounded and depleted buckets are not evicted to admit new identities',()=>{
 const clock=fixedClock();
 const limiter=limiterModule.createRateLimiter({ipBurst:1,ipRefillPerSecond:1,maxKeysPerDimension:2,idleExpiryMs:1000,now:clock});
 assert.equal(limiter.consumeIp('a'),null);
 assert.equal(limiter.consumeIp('b'),null);
 const saturated=limiter.consumeIp('c');
 assert.ok(saturated&&Number.isSafeInteger(saturated.retryAfterSeconds)&&saturated.retryAfterSeconds>=1,'Fail closed at state capacity with a retry hint');
 clock.advance(5000);
 assert.equal(limiter.consumeIp('c'),null,'Recovered idle buckets may expire so new identities are admitted');
 const tight=nowClock=>limiterModule.createRateLimiter({ipBurst:1,ipRefillPerSecond:1000,maxKeysPerDimension:1,idleExpiryMs:100000,now:nowClock});
 const one=fixedClock();const tightLimiter=tight(one);
 assert.equal(tightLimiter.consumeIp('x'),null);
 one.advance(1000);
 assert.equal(tightLimiter.consumeIp('y')?.saturated,true,'A recently-seen refilled bucket is not evicted just to admit a new identity');
});
test('cleanup work is amortized: a flood of unseen identities does not sweep the full table per denial',()=>{
 const clock=fixedClock();
 const capacity=8;
 const limiter=limiterModule.createRateLimiter({ipBurst:1,ipRefillPerSecond:1,maxKeysPerDimension:capacity,idleExpiryMs:1000,now:clock});
 for(let i=0;i<capacity;i++)assert.equal(limiter.consumeIp(`resident-${i}`),null,'Fill the table to capacity at a fixed clock');
 const original=Map.prototype[Symbol.iterator];
 let yields=0;
 try{
  Map.prototype[Symbol.iterator]=function(){const inner=original.call(this);return{next(){yields++;return inner.next()},[Symbol.iterator](){return this}}};
  for(let i=0;i<capacity;i++)assert.equal(limiter.consumeIp(`flood-${i}`)?.saturated,true,'Every denied new identity still fails closed at capacity');
 }finally{Map.prototype[Symbol.iterator]=original}
 assert.ok(yields<=capacity*2,`Cleanup scans must be bounded per clock interval, not a full sweep per denial: saw ${yields} entries visited for ${capacity} denials against a ${capacity}-entry table`);
 clock.advance(1000);
 assert.equal(limiter.consumeIp('post-window'),null,'Recovered idle buckets still expire so new identities are eventually admitted after the sweep interval');
});
test('refill and recovery never reset an active budget',async()=>{
 const clock=fixedClock();
 const outcome=await withBoundary({verifyIdToken:async()=>({uid:'student-a',email_verified:true}),rateLimit:{ipBurst:3,ipRefillPerSecond:2,accountBurst:100,accountRefillPerSecond:100,now:clock}},async base=>{
  const statuses=[];
  for(const _ of Array(3))statuses.push((await hit(base,'/api/session',{authorization:'Bearer tok-a'})).status);
  clock.advance(250);
  const midWindow=await hit(base,'/api/session',{authorization:'Bearer tok-a'});
  clock.advance(250);
  const oneToken=await hit(base,'/api/session',{authorization:'Bearer tok-a'});
  return {statuses,midWindow,oneToken};
 });
 assert.deepEqual(outcome.statuses,[200,200,200],'Initial burst admits the full budget');
 assert.equal(outcome.midWindow.status,429,'Half-refilled tokens cannot buy a fractional attempt');
 assert.equal(outcome.oneToken.status,200,'One full second of refill admits exactly one more attempt');
});
