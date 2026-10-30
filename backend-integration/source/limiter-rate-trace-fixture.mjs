import nodeFs from 'node:fs';
import nodeCrypto from 'node:crypto';
// Single-process token-bucket limiter for the auth request boundary.
// Development defaults only; in-memory per handler/process. Not production
// distributed DoS protection. No request-supplied overrides.
export const rateLimitDefaults={ipBurst:120,ipRefillPerSecond:10,accountBurst:30,accountRefillPerSecond:2,maxKeysPerDimension:10000,idleExpiryMs:1800000,saturatedRetryAfterSeconds:60};
function positiveInteger(name,value){if(!Number.isSafeInteger(value)||value<1)throw new TypeError(`Invalid rate limit ${name}`);return value}
function createTracedBaseRateLimiter(options){
 if(options!==undefined&&options!==null&&(typeof options!=='object'||Array.isArray(options)))throw new TypeError('rateLimit must be an options object');
 const source=options??{},defaults=rateLimitDefaults;
 const ipBurst=positiveInteger('ipBurst',source.ipBurst??defaults.ipBurst);
 const ipRefillPerSecond=positiveInteger('ipRefillPerSecond',source.ipRefillPerSecond??defaults.ipRefillPerSecond);
 const accountBurst=positiveInteger('accountBurst',source.accountBurst??defaults.accountBurst);
 const accountRefillPerSecond=positiveInteger('accountRefillPerSecond',source.accountRefillPerSecond??defaults.accountRefillPerSecond);
 const maxKeysPerDimension=positiveInteger('maxKeysPerDimension',source.maxKeysPerDimension??defaults.maxKeysPerDimension);
 const idleExpiryMs=positiveInteger('idleExpiryMs',source.idleExpiryMs??defaults.idleExpiryMs);
 const saturatedRetryAfterSeconds=positiveInteger('saturatedRetryAfterSeconds',source.saturatedRetryAfterSeconds??defaults.saturatedRetryAfterSeconds);
 const externalClock=source.now??Date.now;
 if(typeof externalClock!=='function')throw new TypeError('rateLimit now must be a clock function');
 // Monotonic non-decreasing integer ms; a backwards or malformed tick reads as no elapsed time.
 let last=0;
 const now=()=>{const raw=externalClock();const next=Number.isFinite(raw)?Math.floor(raw):last;last=Math.max(last,next);return last};
 function dimension(burst,refillPerSecond){
  const buckets=new Map();
  // Cleanup scheduling: at most one full sweep per dimension per cleanupIntervalMs of server clock,
  // so request-triggered scan work is amortized instead of repeated per denied identity.
  const cleanupIntervalMs=1000;
  let lastSweepMs=Number.NEGATIVE_INFINITY;
  return rawIdentity=>{
   const key=typeof rawIdentity==='string'&&rawIdentity!==''?rawIdentity:'__missing_identity__';
   const currentMs=now();
   let bucket=buckets.get(key);
   if(bucket===undefined){
    if(buckets.size>=maxKeysPerDimension){
     // Only fully recovered idle buckets may expire; depleted buckets are never evicted to admit new identities.
     if(currentMs-lastSweepMs>=cleanupIntervalMs){
      lastSweepMs=currentMs;
      for(const [existing,stale] of buckets){
       const recovered=Math.min(burst,stale.tokens+(currentMs-stale.lastRefillMs)*refillPerSecond/1000);
       if(recovered>=burst&&currentMs-stale.lastSeenMs>=idleExpiryMs)buckets.delete(existing);
      }
     }
     if(buckets.size>=maxKeysPerDimension)return {retryAfterSeconds:saturatedRetryAfterSeconds,saturated:true};
    }
    bucket={tokens:burst,lastRefillMs:currentMs,lastSeenMs:currentMs};
    buckets.set(key,bucket);
   }else{
    const elapsedMs=currentMs-bucket.lastRefillMs;
    if(elapsedMs>0){bucket.tokens=Math.min(burst,bucket.tokens+elapsedMs*refillPerSecond/1000);bucket.lastRefillMs=currentMs}
    bucket.lastSeenMs=currentMs;
   }
   if(bucket.tokens<1)return {retryAfterSeconds:Math.max(1,Math.ceil((1-bucket.tokens)*1000/(refillPerSecond*1000)))};
   bucket.tokens-=1;
   return null;
  };
 }
 const consumeIp=dimension(ipBurst,ipRefillPerSecond);
 const consumeAccount=dimension(accountBurst,accountRefillPerSecond);
 return {consumeIp,consumeAccount};
}
// TEST-ONLY wrapper: constructs the ORIGINAL limiter (bytes above unchanged except the internal
// function name) with options passed through UNCHANGED, then delegates every consumeIp/consumeAccount
// call exactly once and returns the original result/error object untouched. Each decision appends a
// TEST_ONLY_RATE_TRACE JSON line (real Date.now timestamp, dimension, hashed identity, allow/deny,
// retryAfterSeconds, cumulative call/allowed counts, adapter self-hash) to the trace file. The wrapper
// never logs identities or credentials; trace failures are swallowed so they cannot alter limiter behavior.
const TRACE_DEFAULT_PATH = process.env.DELTASCORE_RATE_TRACE_FILE || 'rate-trace-diagnostic.jsonl';
let traceDest = TRACE_DEFAULT_PATH;
const adapterSelfHash = nodeCrypto.createHash('sha256').update(nodeFs.readFileSync(new URL(import.meta.url,'file:///'))).digest('hex');
try { nodeFs.writeFileSync(traceDest, JSON.stringify({marker:'TEST_ONLY_RATE_TRACE',event:'adapter-load',adapterSelfHash,originalLimiterPin:'ed6f4e87fddf2bf04245ca5925c0746b58d865c16c422d614f2617e38928442a',tsMs:Date.now()})+'\n',{flag:'wx'}); }
catch { try { nodeFs.rmSync(traceDest,{force:true}); nodeFs.writeFileSync(traceDest,''); traceDest=null; } catch {} }
function emitTrace(rec){ if(!traceDest)return; try{ nodeFs.appendFileSync(traceDest,JSON.stringify({...rec,tsMs:Date.now()})+'\n'); }catch{} }
let traceSeq=0;
const traceCalls={ip:0,account:0};
const traceAllowed={ip:0,account:0};
function hashedIdentity(dimension,identity){ return nodeCrypto.createHash('sha256').update(dimension+':'+String(identity)).digest('hex').slice(0,16); }
export function createRateLimiter(options){
 const base=createTracedBaseRateLimiter(options);
 function traced(dimension,consume,identity){
  traceCalls[dimension]++;
  const result=consume.call(base,identity);
  if(result===null||result===undefined)traceAllowed[dimension]++;
  emitTrace({marker:'TEST_ONLY_RATE_TRACE',event:'decision',seq:++traceSeq,dimension,identityHash:hashedIdentity(dimension,identity),allow:result===null||result===undefined,retryAfterSeconds:(result&&result.retryAfterSeconds)??null,cumulativeCalls:{...traceCalls},cumulativeAllowed:{...traceAllowed}});
  return result;
 }
 return {consumeIp(identity){return traced('ip',base.consumeIp,identity)},consumeAccount(identity){return traced('account',base.consumeAccount,identity)}};
}
