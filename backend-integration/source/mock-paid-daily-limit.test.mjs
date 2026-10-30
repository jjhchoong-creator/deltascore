// Unlimited-while-active paid access, 12 successful distinct new commits per UTC
// calendar day (paid-daily-limit-contract.md).
// Tests 1..n run against a CONTROLLED in-memory transaction fixture that mirrors
// the store's existing single-atomic-transaction flow (staged writes apply only
// when the callback returns cleanly; reads precede writes). The fixture is
// explicitly NOT real Firestore. The real Admin-SDK/Auth-emulator + real HTTP
// proof is the guarded block at the bottom, registered only under
// FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 + FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099.
// Every entitlement/ledger record below is an explicitly labelled FICTIONAL TEST
// FIXTURE provisioned server-side via the Admin SDK in the demo namespace — not
// payment proof, not a live activation, not a real grant date. No client path
// can set grants or counters.
import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {createMockStore} from './mock-store.mjs';
const key=value=>Buffer.from(value,'utf8').toString('base64url');
const namespace='paidDailyFixtureNamespace';
const scores=()=>({VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}});
const draft=(id=randomUUID())=>({id,title:'Fictional paid-daily mock',provider:'',dmMode:'questions',scores:scores(),sjt:null,reviews:[],note:''});
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,ordered(value[k])])):value;

// Controlled fixture (NOT real Firestore): mirrors the store's commit/remove
// flow, records staged operations, and applies them atomically only on a clean
// transaction return. Grants live at account/entitlements/mock-logs and are
// seeded only through this server-side fixture.
function makeFixture({clock='2026-10-01T00:00:00.000Z',grant=undefined,budget=undefined}={}){
  const uid='fictional-'+randomUUID(),accountPath=namespace+'/'+key(uid);
  const state={ledger:null,grant:grant===undefined?null:structuredClone(grant),mocks:new Map(),receipts:new Map(),children:new Map()};
  const metrics={operations:[]};
  const pathOf=value=>typeof value==='string'?value:String(value&&value.ref?value.ref.path:value&&value.path);
  const grantPath=accountPath+'/entitlements/mock-logs';
  const reviewsRootFor=docId=>{
    const docRelPrefix=docId+'/reviews/';
    const mkQuery=(spec={})=>({__query:true,docRelPrefix,ordered:false,projected:false,limit:null,cursor:null,...spec,
      orderBy:f=>mkQuery({docRelPrefix,ordered:f==='__name__',cursor:spec.cursor,limit:spec.limit,projected:spec.projected}),
      select:p=>mkQuery({docRelPrefix,projected:p==='ownerUid',cursor:spec.cursor,limit:spec.limit,ordered:spec.ordered}),
      limit:n=>mkQuery({docRelPrefix,limit:n,cursor:spec.cursor,ordered:spec.ordered,projected:spec.projected}),
      startAfter:d=>mkQuery({docRelPrefix,cursor:pathOf(d),limit:spec.limit,ordered:spec.ordered,projected:spec.projected})});
    return {doc:id=>({path:accountPath+'/mocks/'+docRelPrefix+id}),orderBy:f=>mkQuery({ordered:f==='__name__'}),select:p=>mkQuery({projected:p==='ownerUid'}),limit:n=>mkQuery({limit:n}),startAfter:d=>mkQuery({cursor:pathOf(d)})};
  };
  const mockRefFor=docId=>({path:accountPath+'/mocks/'+docId,collection:name=>{if(name!=='reviews')throw new Error('fixture supports only reviews children');return reviewsRootFor(docId)}});
  const subcollections={mocks:{doc:id=>mockRefFor(id)},receipts:{doc:id=>({path:accountPath+'/receipts/'+id})},entitlements:{doc:id=>({path:accountPath+'/entitlements/'+id,get:async()=>({exists:state.grant!==null,data:()=>structuredClone(state.grant)})})}};
  const db={collection:ns=>{if(ns!==namespace)throw new Error('fixture namespace mismatch');return{doc:id=>({path:ns+'/'+id,get:async()=>({exists:state.ledger!==null,data:()=>structuredClone(state.ledger)}),collection:name=>{if(!Object.hasOwn(subcollections,name))throw new Error('fixture collection '+name+' unsupported');return subcollections[name]}})}}};
  db.runTransaction=async(fn,options)=>{
    const attempt=[],staged=[];
    const transaction={
      get:async arg=>{
        if(arg&&arg.__query===true){
          const spec=arg; // fields: docRelPrefix like `${docId}/reviews/`, ordered/projected/limit/cursor
          metrics.operations.push(['query',spec.limit]);
          const mocksBase=accountPath+'/mocks/';
          let keys=[...state.children.keys()].filter(id=>id.startsWith(spec.docRelPrefix)).sort();
          if(spec.cursor!==null)keys=keys.filter(id=>mocksBase+id>spec.cursor);
          const selected=spec.limit===null?keys:keys.slice(0,spec.limit);
          return {size:selected.length,docs:selected.map(id=>({ref:{path:mocksBase+id},data:()=>structuredClone(state.children.get(id)),exists:true}))};
        }
        const path=pathOf(arg&&arg.ref?arg.ref:arg);
        metrics.operations.push(['get',path]);attempt.push(['get',path]);
        if(path===accountPath)return{exists:state.ledger!==null,data:()=>structuredClone(state.ledger),ref:{path}};
        if(path===grantPath)return{exists:state.grant!==null,data:()=>structuredClone(state.grant),ref:{path}};
        if(path.startsWith(accountPath+'/receipts/')){const d=state.receipts.get(path.slice((accountPath+'/receipts/').length));return{exists:d!==undefined,data:()=>structuredClone(d),ref:{path}};}
        if(path.startsWith(accountPath+'/mocks/')){
          const rest=path.slice((accountPath+'/mocks/').length);
          if(rest.includes('/reviews/')){const d=state.children.get(rest);return{exists:d!==undefined,data:()=>structuredClone(d),ref:{path}};}
          const d=state.mocks.get(rest);return{exists:d!==undefined,data:()=>structuredClone(d),ref:{path}};
        }
        return{exists:false,data:()=>undefined,ref:{path}};
      },
      create:(ref,data)=>staged.push(['create',ref.path,structuredClone(data)]),
      set:(ref,data)=>staged.push(['set',ref.path,structuredClone(data)]),
      update:(ref,data)=>staged.push(['update',ref.path,structuredClone(data)]),
      delete:ref=>staged.push(['delete',ref.path])
    };
    let result;
    try{result=await fn(transaction)}
    catch(error){metrics.operations.push(...staged.map(entry=>[entry[0],entry[1],error?.code||'aborted']));throw error}
    for(const [op,path,data] of staged){
      metrics.operations.push([op,path]);
      if(op==='delete'){if(path.startsWith(accountPath+'/mocks/')){const rest=path.slice((accountPath+'/mocks/').length);if(rest.includes('/reviews/'))state.children.delete(rest);else{state.mocks.delete(rest);for(const k of[...state.children.keys()])if(k.startsWith(rest+'/reviews/'))state.children.delete(k);}}continue}
      if(path===accountPath)state.ledger={...(state.ledger??{}),...data};
      else if(path===grantPath)state.grant=data;
      else if(path.startsWith(accountPath+'/receipts/'))state.receipts.set(path.slice((accountPath+'/receipts/').length),data);
      else if(path.startsWith(accountPath+'/mocks/')){const rest=path.slice((accountPath+'/mocks/').length);if(rest.includes('/reviews/'))state.children.set(rest,data);else state.mocks.set(rest,data);}
    }
    return result;
  };
  const service=extra=>createMockStore({db,namespace,clock:()=>new Date(typeof clock==='function'?clock():clock),...(budget?{mutationWorkBudget:budget}:{}),...extra});
  return {db,uid,state,metrics,service,seedGrant:g=>{state.grant=structuredClone(g);},ledgerSeed:l=>{state.ledger=structuredClone(l);}};
}
const paidGrant=(uid,expiresAt='2099-01-01T00:00:00.000Z')=>({ownerUid:uid,kind:'self-paid-daily12',expiresAt});

test('fixture sanity: absent grant keeps initial-3 behaviour AND every initial commit tracks the daily counter atomically',async()=>{
  const f=makeFixture(),service=f.service();
  for(const i of[1,2,3])assert.equal((await service.commit(f.uid,draft())).created,true);
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='initial_allowance_exhausted');
  assert.equal(f.state.ledger.used,3);assert.equal(f.state.mocks.size,3);assert.equal(f.state.receipts.size,3);assert.equal(f.state.grant,null,'sanity path must not invent grant state');
  assert.equal(f.state.ledger.dailyLogDate,'2026-10-01');assert.equal(f.state.ledger.dailyLogsUsed,3,'successful initial commits must count toward the UTC-day ledger so an upgrade cannot reset it');
});

test('a valid trusted self-paid-daily12 grant lifts the initial cap for fresh creation while cumulative state remains owned by the ledger',async()=>{
  const f=makeFixture(),service=f.service();
  for(const i of[1,2,3])await service.commit(f.uid,draft());
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='initial_allowance_exhausted');
  f.seedGrant(paidGrant(f.uid));
  const fourth=await service.commit(f.uid,draft());
  assert.equal(fourth.created,true,'active paid grant must admit the fourth fresh commit beyond the initial allowance');
  assert.equal(fourth.used,4);
  const fifth=await service.commit(f.uid,draft());
  assert.equal(fifth.created,true);assert.equal(fifth.used,5);
  assert.equal(f.state.ledger.used,5);assert.equal(f.state.mocks.size,5);assert.equal(f.state.receipts.size,5);
});

// One UTC day, controllable via the fixture clock string.
function dayClock(){let iso='2026-10-01T12:00:00.000Z';return {at:v=>{iso=v;},service:()=>makeFixture({clock:()=>iso})};}
test('paid day: exactly twelve successful distinct commits succeed, the thirteenth refuses with daily_mock_limit_exceeded and stages no writes',async()=>{
  let iso='2026-10-01T12:00:00.000Z';
  const f=makeFixture({clock:()=>iso,grant:null}),service=f.service();
  f.seedGrant(paidGrant(f.uid));
  const drafts=[...Array(12)].map(()=>draft());
  for(const [i,input] of drafts.entries()){const r=await service.commit(f.uid,input);assert.equal(r.created,true);assert.equal(r.used,i+1);}
  assert.equal(f.state.ledger.dailyLogsUsed,12);assert.equal(f.state.ledger.dailyLogDate,'2026-10-01');
  const before={mocks:f.state.mocks.size,receipts:f.state.receipts.size,used:f.state.ledger.used,children:f.state.children.size};
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='daily_mock_limit_exceeded','13th fresh commit must refuse on the same UTC day');
  assert.equal(f.state.ledger.used,before.used,'refusal never debits cumulative');
  assert.equal(f.state.ledger.dailyLogsUsed,12,'refusal never debits daily');
  assert.deepEqual({mocks:f.state.mocks.size,receipts:f.state.receipts.size,children:f.state.children.size},{mocks:before.mocks,receipts:before.receipts,children:before.children},'refusal writes nothing');
  // The stable-ID replay of an already-accepted 12th payload acknowledges without any debit.
  const replay=await service.commit(f.uid,drafts[11]);
  assert.deepEqual(replay,{created:false,id:drafts[11].id,used:12},'replay at cap acknowledges the original receipt');
  assert.equal(f.state.ledger.dailyLogsUsed,12);
  // Same ID with a changed payload stays a conflict, checked before the daily gate.
  const altered=structuredClone(drafts[11]);altered.scores.VR.earned='31';
  await assert.rejects(service.commit(f.uid,altered),error=>error?.code==='commit_conflict');
});

test('daily counter resets at exact UTC midnight and the 13th commit of the new day succeeds',async()=>{
  let iso='2026-10-01T12:00:00.000Z';
  const f=makeFixture({clock:()=>iso}),service=f.service();
  f.seedGrant(paidGrant(f.uid));
  for(const i of Array(12))await service.commit(f.uid,draft());
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='daily_mock_limit_exceeded');
  // One second BEFORE midnight the new day's first commit is still refused.
  iso='2026-10-01T23:59:59.000Z';
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='daily_mock_limit_exceeded');
  iso='2026-10-02T00:00:00.000Z'; // exact midnight boundary: NEW day
  const nextDay=await service.commit(f.uid,draft());
  assert.equal(nextDay.created,true);assert.equal(nextDay.used,13,'cumulative never resets');
  assert.equal(f.state.ledger.dailyLogsUsed,1);assert.equal(f.state.ledger.dailyLogDate,'2026-10-02');
});

test('exact expiry instant is expired: paid commits stop falling back to the untouched initial-3 rule',async()=>{
  let iso='2026-10-01T12:00:00.000Z';
  const f=makeFixture({clock:()=>iso}),service=f.service();
  f.seedGrant(paidGrant(f.uid,'2026-10-01T12:00:00.000Z'));
  // clock() === expiresAt: strictly-less-than comparison means EXACT instant is expired.
  await service.commit(f.uid,draft());await service.commit(f.uid,draft());await service.commit(f.uid,draft());
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='initial_allowance_exhausted');
  iso='2026-10-01T11:59:59.999Z'; // one millisecond before: active again
  const paidSave=await service.commit(f.uid,draft());
  assert.equal(paidSave.created,true);assert.equal(paidSave.used,4,'cumulative is preserved across expiry, never reset');
});

test('upgrade during a day counts earlier initial saves: first3today plus nine paid commits fill the day exactly',async()=>{
  let iso='2026-10-01T12:00:00.000Z';
  const f=makeFixture({clock:()=>iso}),service=f.service();
  for(const i of Array(3))await service.commit(f.uid,draft()); // initial allowance, same UTC day
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='initial_allowance_exhausted');
  f.seedGrant(paidGrant(f.uid));
  for(const i of Array(9))assert.equal((await service.commit(f.uid,draft())).created,true,'nine more paid commits after upgrade');
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='daily_mock_limit_exceeded','upgrade cannot reset a day already instrumented at 3');
  assert.equal(f.state.ledger.dailyLogsUsed,12);
});

test('deletion of a paid save never credits the daily counter nor the cumulative ledger',async()=>{
  let iso='2026-10-01T12:00:00.000Z';
  const f=makeFixture({clock:()=>iso}),service=f.service();
  f.seedGrant(paidGrant(f.uid));
  const saved=[...Array(12)].map(()=>draft());
  for(const input of saved)await service.commit(f.uid,input);
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='daily_mock_limit_exceeded');
  const removed=await service.remove(f.uid,saved[0].id,0);
  assert.deepEqual(removed,{deleted:true,id:saved[0].id});
  assert.equal(f.state.ledger.used,12);assert.equal(f.state.ledger.dailyLogsUsed,12);assert.equal(f.state.ledger.dailyLogDate,'2026-10-01');
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='daily_mock_limit_exceeded','deletion grants no room');
});

test('malformed foreign or wrong-kind grant records fail closed as refusals, never as a silent paid fallback',async()=>{
  const f=makeFixture(),service=f.service();
  for(const bad of [{ownerUid:'fictional-foreign-owner',kind:'self-paid-daily12',expiresAt:'2099-01-01T00:00:00.000Z'},
                   {ownerUid:f.uid,kind:'self-paid-total100',expiresAt:'2099-01-01T00:00:00.000Z'},
                   {ownerUid:f.uid,kind:'self-paid-daily12',expiresAt:'not-a-date'},
                   {ownerUid:f.uid,kind:'self-paid-daily12',expiresAt:'2099-01-01T00:00:00Z'},
                   {ownerUid:f.uid,kind:'self-paid-daily12'},
                   {ownerUid:f.uid,expiresAt:'2099-01-01T00:00:00.000Z'},[1,2],'not-an-object']){
    f.seedGrant(bad);
    await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='invalid_entitlement_state','malformed grant must fail closed: '+JSON.stringify(bad));
  }
  assert.equal(f.state.ledger,null,'fail-closed refusals write nothing at all');
  assert.equal(f.state.mocks.size,0);assert.equal(f.state.receipts.size,0);
  // A genuinely missing grant document still takes the initial-3 fallback, not a refusal.
  f.seedGrant(null);f.ledgerSeed(null);
  for(const i of Array(3))assert.equal((await service.commit(f.uid,draft())).created,true);
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='initial_allowance_exhausted');
});

test('half-populated corrupt or future daily ledger fields fail closed; a valid past day counts as zero',async()=>{
  const f=makeFixture(),service=f.service();
  f.seedGrant(paidGrant(f.uid));
  for(const bad of [{ownerUid:f.uid,used:5,dailyLogDate:'2026-10-01'},                    // count missing
                    {ownerUid:f.uid,used:5,dailyLogsUsed:3},                              // date missing
                    {ownerUid:f.uid,used:5,dailyLogDate:'2026-10-01',dailyLogsUsed:'3'},  // string count
                    {ownerUid:f.uid,used:5,dailyLogDate:'2026-10-01',dailyLogsUsed:13},   // out of range
                    {ownerUid:f.uid,used:5,dailyLogDate:'2026-10-01',dailyLogsUsed:-1},
                    {ownerUid:f.uid,used:5,dailyLogDate:'2026-10-01',dailyLogsUsed:1.5},
                    {ownerUid:f.uid,used:5,dailyLogDate:'2026-10-02',dailyLogsUsed:1},    // FUTURE day
                    {ownerUid:f.uid,used:5,dailyLogDate:'2026-10-01T12:00:00.000Z',dailyLogsUsed:1}, // malformed date
                    {ownerUid:f.uid,used:5,dailyLogDate:'2025-13-40',dailyLogsUsed:1}]){
    f.ledgerSeed(bad);
    await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='invalid_entitlement_state','corrupt daily ledger must fail closed: '+JSON.stringify(bad));
  }
  // Valid PAST day => zero for the new day; cumulative preserved.
  f.ledgerSeed({ownerUid:f.uid,used:9,dailyLogDate:'2026-09-30',dailyLogsUsed:12});
  const fresh=await service.commit(f.uid,draft());
  assert.equal(fresh.created,true);assert.equal(fresh.used,10);
  assert.equal(f.state.ledger.dailyLogsUsed,1);assert.equal(f.state.ledger.dailyLogDate,'2026-10-01');
});

test('cumulative overflow refuses safely without partial writes',async()=>{
  const f=makeFixture(),service=f.service();
  f.seedGrant(paidGrant(f.uid));
  f.ledgerSeed({ownerUid:f.uid,used:Number.MAX_SAFE_INTEGER,dailyLogDate:'2026-09-30',dailyLogsUsed:2});
  await assert.rejects(service.commit(f.uid,draft()),error=>error?.code==='invalid_allowance_state');
  assert.equal(f.state.ledger.used,Number.MAX_SAFE_INTEGER);assert.equal(f.state.ledger.dailyLogsUsed,2);
  assert.equal(f.state.mocks.size,0);assert.equal(f.state.receipts.size,0);
});

// --- getUsage contract -------------------------------------------------------
test('usage keeps the exact initial response shape unless a paid grant is ACTIVE, and paid appends only the contracted fields',async()=>{
  let iso='2026-10-01T12:00:00.000Z';
  const f=makeFixture({clock:()=>iso}),service=f.service();
  assert.deepEqual(await service.getUsage(f.uid),{cumulativeLogsUsed:0,initialAllowanceLimit:3},'absent grant is byte-identical to the existing contract');
  f.seedGrant(paidGrant(f.uid,'2026-11-01T00:00:00.000Z'));
  for(const i of Array(2))await service.commit(f.uid,draft());
  const paid=await service.getUsage(f.uid);
  assert.deepEqual(paid,{cumulativeLogsUsed:2,initialAllowanceLimit:3,accessSource:'self-paid',dailyAllowanceLimit:12,dailyLogsUsed:2,dailyResetAt:'2026-10-02T00:00:00.000Z',accessExpiresAt:'2026-11-01T00:00:00.000Z'});
  assert.equal(Object.hasOwn(paid,'totalLimit'),false,'no 100 ceiling field may exist');
  // Expired grant: EXACT existing shape returns; daily fields are not exposed.
  iso='2026-11-01T00:00:00.000Z';
  assert.deepEqual(await service.getUsage(f.uid),{cumulativeLogsUsed:2,initialAllowanceLimit:3});
  // getUsage never creates a ledger document.
  const g=makeFixture();await g.service().getUsage(g.uid);assert.equal(g.state.ledger,null);
  // Corrupt ledger still fails closed through the strict validator (existing behavior).
  f.ledgerSeed({ownerUid:f.uid,used:-1});
  await assert.rejects(service.getUsage(f.uid),error=>error?.code==='invalid_allowance_state');
  // Corrupt grant fails closed, not silent fallback.
  f.ledgerSeed({ownerUid:f.uid,used:2,dailyLogDate:'2026-10-01',dailyLogsUsed:2});
  f.seedGrant({ownerUid:f.uid,kind:'self-paid-daily12',expiresAt:'garbage'});
  iso='2026-10-01T12:00:00.000Z';
  await assert.rejects(service.getUsage(f.uid),error=>error?.code==='invalid_entitlement_state');
});

// --- boundary HTTP mapping (controlled fake boundary; NOT real Firestore) ----
import {createServer} from 'node:http';
import {createRequestHandler} from './auth-boundary.mjs';
async function withBoundary(store,fn){
  const server=createServer(createRequestHandler({verifyIdToken:async()=>({uid:'boundary-student',email_verified:true}),mockStore:store,rateLimit:{ipBurst:1000}}));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{return await fn('http://127.0.0.1:'+server.address().port)}
  finally{await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()))}
}
test('daily refusal maps to sanitized 429 with integer Retry-After, initial exhaustion stays 403, unknown stays 503, and malformed entitlement state stays a sanitized 503',async()=>{
  const dailyStore={commit:async()=>{throw Object.assign(new Error('Daily mock allowance exhausted'),{code:'daily_mock_limit_exceeded',retryAfterSeconds:43210})},getUsage:async()=>({cumulativeLogsUsed:0,initialAllowanceLimit:3}),get:async()=>null,list:async()=>({items:[],nextCursor:null}),remove:async()=>({deleted:true,id:'x'}),updateReviews:async()=>({id:'x',reviewRevision:0})};
  await withBoundary(dailyStore,async base=>{
    const r=await fetch(base+'/api/mocks/commit',{method:'POST',headers:{authorization:'Bearer fixture','content-type':'application/json'},body:'{}'});
    assert.equal(r.status,429);assert.deepEqual(await r.json(),{error:'daily_mock_limit_exceeded'});
    assert.equal(r.headers.get('retry-after'),'43210');assert.equal(r.headers.get('cache-control'),'no-store');
    const text=JSON.stringify(await fetch(base+'/api/mocks/commit',{method:'POST',headers:{authorization:'Bearer fixture','content-type':'application/json'},body:'{}'}).then(x=>x.json()));
    assert.equal(text.includes('boundary-student'),false,'no raw UID forwarded');
  });
  // edit/remove/get are NOT commit paths: the daily code must not leak a 429 there.
  await withBoundary({updateReviews:async()=>{throw Object.assign(new Error('x'),{code:'daily_mock_limit_exceeded'})},remove:async()=>{throw Object.assign(new Error('x'),{code:'daily_mock_limit_exceeded'})},get:async()=>{throw Object.assign(new Error('x'),{code:'daily_mock_limit_exceeded'})},commit:async()=>({created:true,id:'y',used:1}),getUsage:async()=>({cumulativeLogsUsed:0,initialAllowanceLimit:3}),list:async()=>({items:[],nextCursor:null})},async base=>{
    const edit=await fetch(base+'/api/mocks/reviews?id=m',{method:'PATCH',headers:{authorization:'Bearer fixture','content-type':'application/json','if-match':'"review-0"'},body:'{"reviews":[]}'});
    assert.equal(edit.status,503,'daily 429 mapping is limited to the commit mutation');
    const del=await fetch(base+'/api/mocks/item?id=m',{method:'DELETE',headers:{authorization:'Bearer fixture','if-match':'"review-0"'}});
    assert.equal(del.status,503);
    const read=await fetch(base+'/api/mocks/item?id=m',{headers:{authorization:'Bearer fixture'}});
    assert.equal(read.status,503);
  });
  // initial_allowance_exhausted remains an unchanged 403.
  await withBoundary({commit:async()=>{throw Object.assign(new Error('Initial mock allowance exhausted'),{code:'initial_allowance_exhausted'})},getUsage:async()=>({cumulativeLogsUsed:3,initialAllowanceLimit:3}),get:async()=>null},async base=>{
    const r=await fetch(base+'/api/mocks/commit',{method:'POST',headers:{authorization:'Bearer fixture','content-type':'application/json'},body:'{}'});
    assert.equal(r.status,403);assert.deepEqual(await r.json(),{error:'initial_allowance_exhausted'});assert.equal(r.headers.get('retry-after'),null);
  });
  // entitlement-state failures stay sanitized 503 (no code forwarding).
  await withBoundary({commit:async()=>{throw Object.assign(new Error('Entitlement record is malformed or foreign'),{code:'invalid_entitlement_state'})},getUsage:async()=>{throw Object.assign(new Error('Entitlement record is malformed or foreign'),{code:'invalid_entitlement_state'})},get:async()=>null},async base=>{
    const r=await fetch(base+'/api/mocks/commit',{method:'POST',headers:{authorization:'Bearer fixture','content-type':'application/json'},body:'{}'});
    assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'storage_unavailable'});
    const u=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer fixture'}});
    assert.equal(u.status,503);assert.deepEqual(await u.json(),{error:'storage_unavailable'});
  });
});

if(process.env.FIRESTORE_EMULATOR_HOST==='127.0.0.1:8080'&&process.env.FIREBASE_AUTH_EMULATOR_HOST==='127.0.0.1:9099'){
 // REAL Admin SDK + Auth/Firestore emulator + real HTTP boundary. Every grant and
 // ledger record below is an explicitly labelled FICTIONAL TEST FIXTURE provisioned
 // only via the Admin SDK in the demo namespace: not payment proof, not a live
 // activation, not an assumed official grant date. The clock is controlled per
 // transaction attempt for boundary determinism; nothing here fakes the store path.
 const {initializeApp,deleteApp}=await import('firebase-admin/app');
 const {getAuth}=await import('firebase-admin/auth');
 const {getFirestore}=await import('firebase-admin/firestore');
 const {createFirebaseVerifier}=await import('./firebase-verifier.mjs');
 const app=initializeApp({projectId:'demo-deltascore-fresh'},'paid-daily-'+randomUUID());
 const admin=getAuth(app),db=getFirestore(app);
 const owner=uid=>db.collection('deltascoreFreshV1').doc(key(uid));
 const seedGrant=(uid,expiresAt)=>owner(uid).collection('entitlements').doc('mock-logs').set({ownerUid:uid,kind:'self-paid-daily12',expiresAt});
 const seedLedger=(uid,fields)=>owner(uid).set({ownerUid:uid,...fields},{merge:true});
 const account=async()=>{const email='fictional-pdd-'+randomUUID()+'@example.test',password='FictionalEmulatorOnly-42!';const user=await admin.createUser({email,password,emailVerified:true});const r=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});assert.equal(r.status,200);return {uid:user.uid,token:(await r.json()).idToken}};
 async function serve({clockStart='2026-10-01T12:00:00.000Z',mutationWorkBudget=undefined}={}){
  let iso=clockStart;
  const verifier=createFirebaseVerifier({mode:'emulator',projectId:'demo-deltascore-fresh'});
  const store=createMockStore({db,namespace:'deltascoreFreshV1',clock:()=>new Date(iso),...(mutationWorkBudget?{mutationWorkBudget}:{}),});
  const server=createServer(createRequestHandler({...verifier,mockStore:store,rateLimit:{ipBurst:2000,accountBurst:2000}}));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const at=v=>{iso=v;};
  const stop=async()=>{server.closeAllConnections();await new Promise((res,rej)=>server.close(e=>e?rej(e):res()));await verifier.close()};
  const http=(method,path,token,body,headers={})=>fetch(base+path,{method,headers:{...(token?{authorization:'Bearer '+token}:{}),...(body?{'content-type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)}).then(async r=>({status:r.status,body:await r.json().catch(()=>({})),retryAfter:r.headers.get('retry-after'),etag:r.headers.get('etag'),cache:r.headers.get('cache-control')}));
  return {base,store,at,stop,http};
 }
 test('real emulator HTTP: active grant admits past initial-3 and past a LABELLED cumulative-100 seed; the 13th same-day commit returns sanitized 429 with exact Retry-After and zero writes',async()=>{
  const s=await serve();
  try{
   const a=await account();
   for(const i of Array(3))assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   const denied=await s.http('POST','/api/mocks/commit',a.token,draft());
   assert.equal(denied.status,403);assert.deepEqual(denied.body,{error:'initial_allowance_exhausted'});
   await seedGrant(a.uid,'2099-01-01T00:00:00.000Z'); // FICTIONAL fixture only
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201,'4th admitted past initial cap while active');
   // LABELLED fixture: cumulative 99 + 11 used today — NOT actual 100 browser saves.
   await seedLedger(a.uid,{used:99,dailyLogDate:'2026-10-01',dailyLogsUsed:11});
   const hundredth=await s.http('POST','/api/mocks/commit',a.token,draft());
   assert.equal(hundredth.status,201);assert.equal(hundredth.body.used,100);
   const before={used:100,daily:12};
   const refusal=await s.http('POST','/api/mocks/commit',a.token,draft());
   assert.equal(refusal.status,429);assert.deepEqual(refusal.body,{error:'daily_mock_limit_exceeded'});
   assert.equal(refusal.retryAfter,'43200','trusted-clock seconds to next UTC midnight');
   assert.equal(refusal.cache,'no-store');
   assert.equal(JSON.stringify(refusal.body).includes(a.uid),false,'no raw UID leaked');
   const ledger=(await owner(a.uid).get()).data();
   assert.equal(ledger.used,before.used);assert.equal(ledger.dailyLogsUsed,before.daily);
   assert.equal((await owner(a.uid).collection('mocks').get()).size,5,'refusal wrote no record');
   assert.equal((await owner(a.uid).collection('receipts').get()).size,5,'refusal wrote no receipt');
   // Past a cumulative-100 on a fresh day: unlimited while active means NO 100 ceiling.
   s.at('2026-10-02T00:00:01.000Z');
   const beyond=await s.http('POST','/api/mocks/commit',a.token,draft());
   assert.equal(beyond.status,201);assert.equal(beyond.body.used,101,'no paid total-100 ceiling may exist');
   // same-ID replay after the day changed still acknowledges without any debit.
  }finally{await s.stop()}
 });
 test('real emulator HTTP: exact UTC midnight flips the day; one minute before midnight the cap still refuses with the matching Retry-After',async()=>{
  const s=await serve();
  try{
   const a=await account();await seedGrant(a.uid,'2099-01-01T00:00:00.000Z');
   for(const i of Array(12))assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   s.at('2026-10-01T23:59:00.000Z');
   const refused=await s.http('POST','/api/mocks/commit',a.token,draft());
   assert.equal(refused.status,429);assert.equal(refused.retryAfter,'60');
   s.at('2026-10-02T00:00:00.000Z'); // EXACT midnight: new day
   const ok=await s.http('POST','/api/mocks/commit',a.token,draft());
   assert.equal(ok.status,201);assert.equal(ok.body.used,13);
   const ledger=(await owner(a.uid).get()).data();
   assert.equal(ledger.dailyLogDate,'2026-10-02');assert.equal(ledger.dailyLogsUsed,1);assert.equal(ledger.used,13,'cumulative never resets');
  }finally{await s.stop()}
 });
 test('real emulator HTTP: exact expiry instant is expired — fresh commits fall back to the untouched initial-3 denial, stable-ID replays still acknowledge without debit, usage returns the exact initial shape',async()=>{
  const s=await serve();
  try{
   const a=await account(),input=draft();
   await seedGrant(a.uid,'2026-10-01T12:00:00.000Z'); // clock === expiresAt: expired at exact instant
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   const fourth=await s.http('POST','/api/mocks/commit',a.token,draft());
   assert.equal(fourth.status,403);assert.deepEqual(fourth.body,{error:'initial_allowance_exhausted'});
   const usage=await s.http('GET','/api/account/mock-usage',a.token);
   assert.deepEqual(usage.body,{cumulativeLogsUsed:3,initialAllowanceLimit:3},'expired grant exposes no daily fields');
   // One ms earlier the same grant is active.
   s.at('2026-10-01T11:59:59.999Z');
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,input)).status,201);
   s.at('2026-10-01T12:00:00.000Z'); // expired again
   const replay=await s.http('POST','/api/mocks/commit',a.token,input);
   assert.equal(replay.status,200);assert.deepEqual(replay.body,{created:false,id:input.id,used:4},'same-ID replay across expiry never debits');
   const ledger=(await owner(a.uid).get()).data();
   assert.equal(ledger.used,4);assert.equal(ledger.dailyLogsUsed,4,'replay left the daily counter at its pre-replay value');
  }finally{await s.stop()}
 });
 test('real emulator HTTP: an upgrade during the day counts the three earlier initial saves — exactly nine paid commits remain that day',async()=>{
  const s=await serve();
  try{
   const a=await account();
   for(const i of Array(3))assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   await seedGrant(a.uid,'2099-01-01T00:00:00.000Z');
   for(const i of Array(9))assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   const refusal=await s.http('POST','/api/mocks/commit',a.token,draft());
   assert.equal(refusal.status,429,'upgrade cannot reset a day already instrumented at 3');
   assert.equal((await owner(a.uid).get()).data().dailyLogsUsed,12);
  }finally{await s.stop()}
 });
 test('real emulator HTTP: deletion never credits the daily counter or the cumulative ledger',async()=>{
  const s=await serve();
  try{
   const a=await account();await seedGrant(a.uid,'2099-01-01T00:00:00.000Z');
   const saved=[];
   for(const i of Array(12))assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   const list=await s.http('GET','/api/mocks?limit=1',a.token);
   const target=list.body.items[0];
   const del=await s.http('DELETE','/api/mocks/item?id='+encodeURIComponent(target.summary.id),a.token,null,{'if-match':target.etag});
   assert.equal(del.status,200);assert.deepEqual(del.body,{deleted:true,id:target.summary.id});
   const ledger=(await owner(a.uid).get()).data();
   assert.equal(ledger.used,12);assert.equal(ledger.dailyLogsUsed,12);
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,429,'deletion grants no room');
  }finally{await s.stop()}
 });
 test('real emulator HTTP: two concurrent fresh commits racing for the 12th slot serialize to exactly one success and one daily refusal with no double count',async()=>{
  const s=await serve();
  try{
   const a=await account();await seedGrant(a.uid,'2099-01-01T00:00:00.000Z');
   await seedLedger(a.uid,{used:11,dailyLogDate:'2026-10-01',dailyLogsUsed:11}); // LABELLED fixture
   const [x,y]=await Promise.all([s.http('POST','/api/mocks/commit',a.token,draft()),s.http('POST','/api/mocks/commit',a.token,draft())]);
   const ok=[x,y].filter(r=>r.status===201),refused=[x,y].filter(r=>r.status===429);
   assert.equal(ok.length,1,'exactly one commit may claim the 12th slot');
   assert.equal(refused.length,1,'the other must be the sanitized daily refusal');
   assert.equal(refused[0].body.error,'daily_mock_limit_exceeded');
   const ledger=(await owner(a.uid).get()).data();
   assert.equal(ledger.used,12);assert.equal(ledger.dailyLogsUsed,12);
   // LABELLED seed: cumulative 11 was fixture state, not 11 stored mocks — only the ONE winning commit wrote documents.
   assert.equal((await owner(a.uid).collection('mocks').get()).size,1);assert.equal((await owner(a.uid).collection('receipts').get()).size,1);
  }finally{await s.stop()}
 });
 test('real emulator HTTP: usage appends only the contracted paid fields, never a 100 ceiling, and ignores spoofed uid while reading no writes',async()=>{
  const s=await serve();
  try{
   const a=await account(),b=await account();
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   let usage=await s.http('GET','/api/account/mock-usage?uid='+b.uid+'&paid=true',a.token);
   assert.deepEqual(usage.body,{cumulativeLogsUsed:1,initialAllowanceLimit:3},'no grant: exact existing shape');
   await seedGrant(a.uid,'2026-11-01T00:00:00.000Z');
   await s.http('POST','/api/mocks/commit',a.token,draft());
   usage=await s.http('GET','/api/account/mock-usage',a.token);
   assert.deepEqual(usage.body,{cumulativeLogsUsed:2,initialAllowanceLimit:3,accessSource:'self-paid',dailyAllowanceLimit:12,dailyLogsUsed:2,dailyResetAt:'2026-10-02T00:00:00.000Z',accessExpiresAt:'2026-11-01T00:00:00.000Z'});
   assert.equal(Object.keys(usage.body).includes('totalLogsLimit'),false);assert.equal(JSON.stringify(usage.body).includes('100'),false,'no total-100 field may exist');
   assert.equal((await s.http('GET','/api/account/mock-usage',b.token)).body.cumulativeLogsUsed,0,'per-account isolation over real HTTP');
   const g=await account();const u=await s.http('GET','/api/account/mock-usage',g.token);assert.deepEqual(u.body,{cumulativeLogsUsed:0,initialAllowanceLimit:3});assert.equal((await owner(g.uid).get()).exists,false,'getUsage never creates a ledger');
  }finally{await s.stop()}
 });
 test('real emulator HTTP: at the daily cap and after expiry, saved get/review/edit stay fully allowed and consume nothing',async()=>{
  const s=await serve();
  try{
   const a=await account();await seedGrant(a.uid,'2026-10-01T13:00:00.000Z');
   const saved=[];
   for(const i of Array(12)){const input=draft();saved.push(input);assert.equal((await s.http('POST','/api/mocks/commit',a.token,input)).status,201);}
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,429);
   const detail=await s.http('GET','/api/mocks/item?id='+encodeURIComponent(saved[0].id),a.token);
   assert.equal(detail.status,200);assert.equal(detail.etag,'"review-0"');
   const q={section:'VR',number:'1',format:'guided',thinking:'Fictional paid daily review',instead:'',free:'',type:'',reasons:[],other:'',reviewed:false,confirmed:false};
   const edit=await s.http('PATCH','/api/mocks/reviews?id='+encodeURIComponent(saved[0].id),a.token,{reviews:[q]},{'if-match':detail.etag});
   assert.equal(edit.status,200);assert.deepEqual(edit.body,{saved:true,id:saved[0].id});assert.equal(edit.etag,'"review-1"');
   const ledger=(await owner(a.uid).get()).data();
   assert.equal(ledger.dailyLogsUsed,12);assert.equal(ledger.used,12,'read/review work debits nothing');
   s.at('2026-10-01T13:00:00.000Z'); // grant expired; ledger still paid-shaped
   const afterExpiry=await s.http('GET','/api/mocks/item?id='+encodeURIComponent(saved[0].id),a.token);
   assert.equal(afterExpiry.status,200);assert.equal(afterExpiry.etag,'"review-1"');
   assert.deepEqual((await s.http('GET','/api/account/mock-usage',a.token)).body,{cumulativeLogsUsed:12,initialAllowanceLimit:3},'expired usage reads exact initial shape');
  }finally{await s.stop()}
 });
 test('real emulator HTTP: spoofed entitlement fields in the request cannot grant access; a work-budget refusal and a failed real transaction both leave the daily counter untouched',async()=>{
  const s=await serve({mutationWorkBudget:{maxReviewDocumentWork:2}});
  try{
   const a=await account(),b=await account();
   const spoof={...draft(),ownerUid:b.uid,paid:true,dailyAllowanceLimit:999,dailyLogsUsed:0,expiresAt:'2099-01-01T00:00:00.000Z'};
   for(const i of Array(3))assert.equal((await s.http('POST','/api/mocks/commit',a.token,{...spoof,id:randomUUID()})).status,201,'initial-3 only; forged grant fields must be inert');
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,{...spoof,id:randomUUID()})).status,403);
   assert.equal((await owner(a.uid).get()).data().dailyLogsUsed,3);assert.equal((await owner(b.uid).get()).exists,false,'forged owner never touched');
   const review={section:'VR',number:'1',format:'guided',thinking:'',instead:'',free:'x',type:'',reasons:[],other:'',reviewed:false,confirmed:false};
   // Work-budget refusal needs a grant-bearing account: without one the initial-3 gate (checked first) answers 403.
   const d=await account();await seedGrant(d.uid,'2099-01-01T00:00:00.000Z');
   assert.equal((await s.http('POST','/api/mocks/commit',d.token,draft())).status,201);
   const overBudget=await s.http('POST','/api/mocks/commit',d.token,{...draft(),reviews:[review,{...review,number:'2'},{...review,number:'3'}]});
   assert.equal(overBudget.status,422);assert.equal((await owner(d.uid).get()).data().dailyLogsUsed,1,'work-budget refusal must not debit the day');
   assert.equal((await owner(a.uid).get()).data().dailyLogsUsed,3,'spoofer state untouched by the above');
   // A REAL Firestore failure (colliding create) must roll back every staged write including the counters.
   const c=await account();await seedGrant(c.uid,'2099-01-01T00:00:00.000Z');
   const collide=draft();await owner(c.uid).collection('mocks').doc(key(collide.id)).create({title:'Existing fictional collision'});
   const failed=await s.http('POST','/api/mocks/commit',c.token,collide);
   assert.equal(failed.status,503);assert.deepEqual(failed.body,{error:'storage_unavailable'});
   assert.equal((await owner(c.uid).get()).exists,false,'failed paid transaction rolled the cumulative AND daily ledger back entirely');
   assert.equal((await owner(c.uid).collection('receipts').doc(key(collide.id)).get()).exists,false,'no receipt survived');
  }finally{await s.stop()}
 });
 test('real emulator HTTP: a foreign or malformed grant record fails closed as a sanitized 503 with zero writes, while a genuinely missing grant keeps the untouched initial-3 path',async()=>{
  const s=await serve();
  try{
   const a=await account();
   await seedGrant(a.uid,'2099-01-01T00:00:00.000Z');
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   await owner(a.uid).collection('entitlements').doc('mock-logs').update({ownerUid:'fictional-foreign-owner'});
   const foreign=await s.http('POST','/api/mocks/commit',a.token,draft());
   assert.equal(foreign.status,503);assert.deepEqual(foreign.body,{error:'storage_unavailable'});
   const usage=await s.http('GET','/api/account/mock-usage',a.token);
   assert.equal(usage.status,503);assert.deepEqual(usage.body,{error:'storage_unavailable'});
   const ledger=(await owner(a.uid).get()).data();
   assert.equal(ledger.used,1);assert.equal(ledger.dailyLogsUsed,1,'fail-closed refusal changed nothing');
   await owner(a.uid).collection('entitlements').doc('mock-logs').delete();
   for(const i of Array(2))assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,201);
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,draft())).status,403,'missing grant falls back to initial-3 (cumulative already exceeded its rule cleanly)');
  }finally{await s.stop()}
 });
 test('real emulator HTTP: same-ID records across two active accounts stay fully isolated including the daily counters',async()=>{
  const s=await serve();
  try{
   const a=await account(),b=await account(),shared=draft();
   await seedGrant(a.uid,'2099-01-01T00:00:00.000Z');await seedGrant(b.uid,'2099-01-01T00:00:00.000Z');
   assert.equal((await s.http('POST','/api/mocks/commit',a.token,{...shared,title:'Fictional A paid'})).status,201);
   assert.equal((await s.http('POST','/api/mocks/commit',b.token,{...shared,title:'Fictional B paid'})).status,201);
   assert.equal((await s.http('POST','/api/mocks/commit',b.token,{...shared,title:'Fictional A paid'})).status,409,'B may not replay A payload identity');
   assert.equal((await s.http('POST','/api/mocks/commit',b.token,{...shared,title:'Fictional B paid'})).status,200);
   assert.equal((await owner(a.uid).get()).data().dailyLogsUsed,1);assert.equal((await owner(b.uid).get()).data().dailyLogsUsed,1);
   assert.equal((await owner(a.uid).collection('mocks').doc(key(shared.id)).get()).data().title,'Fictional A paid');
   assert.equal((await owner(b.uid).collection('mocks').doc(key(shared.id)).get()).data().title,'Fictional B paid');
  }finally{await s.stop()}
 });
 after(async()=>{if(db)await db.terminate();if(app)await deleteApp(app)});
}
