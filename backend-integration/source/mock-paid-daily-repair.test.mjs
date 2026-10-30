// Narrow paid-daily backend repair regressions (paid-daily-parent-review.md defects 1-5).
// ALL tests here run against a CONTROLLED in-memory fixture that is explicitly NOT
// real Firestore. It mirrors the paid-daily fixture flow (staged writes apply only on
// a clean transaction return; all reads precede writes) and additionally:
//  - freezes a consistent snapshot when a transaction starts (mirroring the real
//    transaction snapshot contract), so a bare non-transactional read pair can be
//    shown to MIX two time points while one transaction cannot;
//  - lets the test control grant-reference CONSTRUCTION (grantRefThrows) and grant
//    READS (grantGetThrows) and interpose a mutation mid-grant-read (onGrantRead);
//  - records the actual read topology (bare-get vs tx-get vs staged writes).
// Real Admin-SDK emulator + HTTP behavior stays covered by mock-paid-daily-limit.test.mjs.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {createMockStore} from './mock-store.mjs';
import {grantActive} from './paid-daily-policy.mjs';
const key=value=>Buffer.from(value,'utf8').toString('base64url');
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,ordered(value[k])])):value;
const namespace='paidRepairFixture';
const scores=()=>({VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}});
const draft=(id=randomUUID())=>({id,title:'Fictional repair mock',provider:'',dmMode:'questions',scores:scores(),sjt:null,reviews:[],note:''});
const paidGrant=(uid,expiresAt='2099-01-01T00:00:00.000Z')=>({ownerUid:uid,kind:'self-paid-daily12',expiresAt});
const pathOf=value=>typeof value==='string'?value:String(value&&value.ref?value.ref.path:value&&value.path);
// Mirrors the store's canonical request hash over the destructured draft fields.
const requestHashOf=input=>createHash('sha256').update(JSON.stringify(ordered({id:input.id,title:input.title??'',provider:input.provider??'',dmMode:input.dmMode,scores:input.scores,sjt:input.sjt??null,reviews:input.reviews??[],note:input.note??''}))).digest('hex');

// Controlled repair fixture (NOT real Firestore). See header for the flags.
function makeRepairFixture({clock='2026-10-01T12:00:00.000Z',grantRefThrows=false,grantGetThrows=false,onGrantRead=null}={}){
  const uid='fictional-'+randomUUID(),accountPath=namespace+'/'+key(uid);
  const grantPath=accountPath+'/entitlements/mock-logs';
  const flags={grantRefThrows,grantGetThrows,onGrantRead};
  const state={ledger:null,grant:null,mocks:new Map(),receipts:new Map()};
  const metrics={ops:[],txCalls:0,writes:0,aborts:[]};
  const rec=entry=>metrics.ops.push(entry);
  const readLive=path=>{
    if(path===accountPath)return{exists:state.ledger!==null,data:()=>structuredClone(state.ledger)};
    if(path===grantPath)return{exists:state.grant!==null,data:()=>structuredClone(state.grant)};
    if(path.startsWith(accountPath+'/receipts/')){const d=state.receipts.get(path.slice((accountPath+'/receipts/').length));return{exists:d!==undefined,data:()=>structuredClone(d)};}
    if(path.startsWith(accountPath+'/mocks/')){const d=state.mocks.get(path.slice((accountPath+'/mocks/').length));return{exists:d!==undefined,data:()=>structuredClone(d)};}
    return{exists:false,data:()=>undefined};
  };
  const readSnapshot=(snap,path)=>{
    if(path===accountPath)return{exists:snap.ledger!==null,data:()=>structuredClone(snap.ledger)};
    if(path===grantPath)return{exists:snap.grant!==null,data:()=>structuredClone(snap.grant)};
    if(path.startsWith(accountPath+'/receipts/')){const d=snap.receipts.get(path.slice((accountPath+'/receipts/').length));return{exists:d!==undefined,data:()=>structuredClone(d)};}
    if(path.startsWith(accountPath+'/mocks/')){const d=snap.mocks.get(path.slice((accountPath+'/mocks/').length));return{exists:d!==undefined,data:()=>structuredClone(d)};}
    return{exists:false,data:()=>undefined};
  };
  const grantDocumentRef={path:grantPath,get:async()=>{if(flags.grantGetThrows)throw new Error('fictional simulated entitlement read failure');if(flags.onGrantRead)await flags.onGrantRead();rec(['bare-get',grantPath]);return readLive(grantPath)}};
  const subcollections={mocks:{doc:id=>({path:accountPath+'/mocks/'+id})},receipts:{doc:id=>({path:accountPath+'/receipts/'+id})},entitlements:{doc:()=>grantDocumentRef}};
  if(flags.grantRefThrows)delete subcollections.entitlements;
  const account={path:accountPath,
    get:async()=>{rec(['bare-get',accountPath]);return readLive(accountPath)},
    collection:name=>{if(!Object.hasOwn(subcollections,name))throw new Error('fixture collection '+name+' unsupported');return subcollections[name]}};
  const db={collection:ns=>{if(ns!==namespace)throw new Error('fixture namespace mismatch');return{doc:()=>account}}};
  db.runTransaction=async(fn,options)=>{
    metrics.txCalls++;
    // Snapshot contract (mirrors real Firestore): the transaction reads state as it
    // was when the transaction started; later external mutations are invisible to it.
    const snap={ledger:structuredClone(state.ledger),grant:structuredClone(state.grant),receipts:new Map(state.receipts),mocks:new Map(state.mocks)};
    const staged=[];
    const transaction={get:async arg=>{const path=pathOf(arg&&arg.ref?arg.ref:arg);rec(['tx-get',path]);
      if(path===grantPath){if(flags.grantGetThrows)throw new Error('fictional simulated entitlement read failure');if(flags.onGrantRead)await flags.onGrantRead();}
      return readSnapshot(snap,path)},
      create:(ref,data)=>{staged.push(['create',ref.path,data]);rec(['create',ref.path])},
      set:(ref,data)=>{staged.push(['set',ref.path,data]);rec(['set',ref.path])},
      update:(ref,data)=>{staged.push(['update',ref.path,data]);rec(['update',ref.path])},
      delete:ref=>{staged.push(['delete',ref.path]);rec(['delete',ref.path])}};
    let result;
    try{result=await fn(transaction)}
    catch(error){metrics.aborts.push(error?.code||error?.message||String(error));throw error}
    for(const [op,p,data] of staged){
      metrics.writes++;
      if(p===accountPath)state.ledger={...(state.ledger??{}),...data};
      else if(p===grantPath)state.grant=data;
      else if(p.startsWith(accountPath+'/receipts/'))state.receipts.set(p.slice((accountPath+'/receipts/').length),data);
      else if(p.startsWith(accountPath+'/mocks/'))state.mocks.set(p.slice((accountPath+'/mocks/').length),data);
    }
    return result;
  };
  const service=extra=>createMockStore({db,namespace,clock:()=>new Date(clock),...extra});
  return {db,uid,state,flags,metrics,service,grantPath,accountPath,
    seedGrant:g=>{state.grant=structuredClone(g)},seedLedger:l=>{state.ledger=structuredClone(l)},
    seedReceipt:(docId,data)=>state.receipts.set(docId,structuredClone(data))};
}

test('fixture sanity: supported entitlement reads keep fresh creation and receipt replay working',async()=>{
  const f=makeRepairFixture(),service=f.service();
  const input=draft();
  const first=await service.commit(f.uid,input);
  assert.equal(first.created,true);assert.equal(first.used,1);
  const writesAfterFirst=f.metrics.writes;
  const replay=await service.commit(f.uid,structuredClone(input));
  assert.deepEqual(replay,{created:false,id:input.id,used:1},'clean replay acknowledges without debit');
  assert.equal(f.metrics.writes,writesAfterFirst,'the replay adds no writes');
  assert.equal(f.state.grant,null,'the repair fixture never invents grant state');
});

test('commit: a receipt replay must NEVER consult the entitlement lookup, and fresh creation without entitlement support fails closed',async()=>{
  // (defect 1, store 162-164) A saved record's replay must not depend on the grant
  // read: the reference is built and read only AFTER the receipt short-circuit.
  const f=makeRepairFixture(),service=f.service();
  const input=draft();
  await service.commit(f.uid,input);
  f.flags.grantGetThrows=true;
  let replay,replayError=null;
  try{replay=await service.commit(f.uid,structuredClone(input))}catch(error){replayError=error}
  assert.equal(replayError,null,'an unavailable grant read must not reject a replay of a saved record');
  assert.deepEqual(replay,{created:false,id:input.id,used:1});
  // (defect 4, remove the catch) NO production catch->null fallback: a fixture whose
  // entitlements reference construction throws must fail closed for a FRESH creation,
  // not be silently treated as an absent grant.
  const g=makeRepairFixture({grantRefThrows:true}),gService=g.service();
  let freshFreshOk=true,freshError=null;
  try{await gService.commit(g.uid,draft())}catch(error){freshError=error;freshFreshOk=false}
  assert.equal(freshFreshOk,false,'a grant reference construction error must fail closed, never be treated as an absent grant');
  assert.match(String(freshError?.message||freshError),/entitlements unsupported/);
  assert.equal(g.metrics.writes,0,'the fail-closed fresh creation wrote nothing durable');
  assert.equal(g.state.mocks.size,0);assert.equal(g.state.receipts.size,0);assert.equal(g.state.ledger,null);
  // Matching replay and payload conflict still short-circuit BEFORE any reference:
  // the same broken-reference fixture resolves both receipt paths cleanly.
  const h=makeRepairFixture({grantRefThrows:true}),hService=h.service();
  const saved=draft('saved-under-broken-fixture');
  h.seedLedger({ownerUid:h.uid,used:1});
  h.seedReceipt(key(saved.id),{id:saved.id,ownerUid:h.uid,requestHash:requestHashOf(saved)});
  const altered=structuredClone(saved);altered.scores.VR.earned='31';
  await assert.rejects(hService.commit(h.uid,altered),error=>error?.code==='commit_conflict','payload conflict short-circuits without constructing the entitlement reference');
  const okReplay=await hService.commit(h.uid,saved);
  assert.deepEqual(okReplay,{created:false,id:saved.id,used:1},'matching replay short-circuits without constructing the entitlement reference');
});

test('getUsage reads ledger and grant in ONE read-only transaction: no mixed snapshot across a concurrent grant mutation, zero writes, correct paid DTO',async()=>{
  // Defect 2 (store 65-77): the current bare read pair lets a mutation landing
  // between the ledger read and the grant read produce a MIXED snapshot. The
  // fixture snapshots at transaction start (mirroring real Firestore), so the
  // single-transaction read must see the PRE-mutation grant, not the new one.
  const f=makeRepairFixture(),service=f.service();
  f.seedLedger({ownerUid:f.uid,used:2,dailyLogDate:'2026-10-01',dailyLogsUsed:2});
  f.seedGrant(paidGrant(f.uid,'2026-10-01T00:00:00.000Z')); // expired at the 12:00 clock
  let flipped=false;
  f.flags.onGrantRead=async()=>{if(!flipped){flipped=true;f.seedGrant(paidGrant(f.uid));}}; // concurrent activation mid-read
  const usage=await service.getUsage(f.uid);
  assert.deepEqual(usage,{cumulativeLogsUsed:2,initialAllowanceLimit:3},'a consistent snapshot must not mix the pre-mutation ledger with the post-mutation grant');
  assert.equal(f.metrics.txCalls,1,'getUsage must use one read-only transaction');
  assert.deepEqual(f.metrics.ops.filter(entry=>entry[0]==='bare-get'),[],'getUsage must perform no bare non-transactional document reads');
  const txReads=f.metrics.ops.filter(entry=>entry[0]==='tx-get').map(entry=>entry[1]).sort();
  assert.deepEqual(txReads,[f.accountPath,f.grantPath].sort(),'the ONE transaction must read exactly ledger plus grant');
  assert.equal(f.metrics.writes,0,'getUsage stays pure and non-creating');
  // Positive control: consistent ACTIVE state in the same snapshot yields the exact paid DTO.
  const g=makeRepairFixture(),gService=g.service();
  g.seedLedger({ownerUid:g.uid,used:2,dailyLogDate:'2026-10-01',dailyLogsUsed:2});
  g.seedGrant(paidGrant(g.uid,'2026-11-01T00:00:00.000Z'));
  assert.deepEqual(await gService.getUsage(g.uid),{cumulativeLogsUsed:2,initialAllowanceLimit:3,accessSource:'self-paid',dailyAllowanceLimit:12,dailyLogsUsed:2,dailyResetAt:'2026-10-02T00:00:00.000Z',accessExpiresAt:'2026-11-01T00:00:00.000Z'});
  assert.equal(g.metrics.txCalls,1);assert.equal(g.metrics.writes,0);
});

test('commit validates an existing ledger owner before fresh writes so a foreign grant plus ledger fails closed and merge never repairs the owner',async()=>{
  // Defect 3: getUsage validated ledger.ownerUid but commit only validated `used`.
  const f=makeRepairFixture(),service=f.service();
  f.seedLedger({ownerUid:'fictional-foreign-owner',used:2});
  f.seedGrant(paidGrant(f.uid));
  let refused=null;
  try{await service.commit(f.uid,draft())}catch(error){refused=error}
  assert.notEqual(refused,null,'a foreign-owned ledger must fail closed on fresh creation');
  assert.match(String(refused?.message||refused),/Allowance ledger ownership is inconsistent/);
  assert.equal(refused?.code!=='initial_allowance_exhausted',true,'corrupted ownership is corruption, never an allowance denial');
  assert.equal(f.state.ledger.ownerUid,'fictional-foreign-owner','the refusing commit must not overwrite the foreign owner via merge');
  assert.equal(f.metrics.writes,0,'the fail-closed fresh creation wrote nothing');
  // Corrupted-owner replay of a saved record also fails closed, not as initial denial.
  const g=makeRepairFixture(),gService=g.service();
  const saved=draft('saved-before-owner-corruption');
  await gService.commit(g.uid,saved);
  g.seedLedger({ownerUid:'fictional-foreign-owner',used:1,dailyLogDate:'2026-10-01',dailyLogsUsed:1});
  let replayRefused=null;
  try{await gService.commit(g.uid,saved)}catch(error){replayRefused=error}
  assert.notEqual(replayRefused,null,'a corrupted-owner replay fails closed as corruption');
  assert.match(String(replayRefused?.message||replayRefused),/Allowance ledger ownership is inconsistent/);
  assert.equal(replayRefused?.code!=='initial_allowance_exhausted',true);
  assert.equal(g.state.ledger.ownerUid,'fictional-foreign-owner','the replay rejection leaves the corrupt owner untouched');
});
test('grant expiry enforces the contracted four-digit canonical ISO shape as well as the Date roundtrip',async()=>{
  // Minor helper defect: CANONICAL_ISO was defined but never enforced. A
  // six-digit signed year round-trips through Date.parse/toISOString yet is NOT
  // the contracted four-digit canonical ISO — it must fail closed.
  const nowMs=Date.parse('2026-10-01T00:00:00.000Z');
  const snap=data=>({exists:true,data:()=>data});
  assert.deepEqual(grantActive(snap(paidGrant('u')),'u',nowMs),{active:true,expiresAt:'2099-01-01T00:00:00.000Z'},'canonical expiry stays valid');
  for(const shape of ['-000001-01-01T00:00:00.000Z','2099-1-01T00:00:00.000Z','2099-01-01T00:00:00Z','2099-01-01T00:00:00.00Z','2099-01-01T00:00:00.000+00:00']){
    assert.throws(()=>grantActive(snap(paidGrant('u',shape)),'u',nowMs),error=>error?.code==='invalid_entitlement_state','non-canonical expiry must fail closed regardless of Date roundtrip: '+shape);
  }
  assert.throws(()=>grantActive(snap(paidGrant('u','2026-13-40T00:00:00.000Z')),'u',nowMs),error=>error?.code==='invalid_entitlement_state','impossible date still fails closed through the roundtrip');
});
