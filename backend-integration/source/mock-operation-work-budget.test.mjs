// Operation work budget — deterministic per-mutation review-document work envelope.
// Controlled fixtures here are explicitly NOT real Firestore: they mirror the
// store's existing single-atomic-transaction flow (staged writes apply only when
// the callback returns; a thrown refusal stages nothing) and record transaction
// options, query shapes, child reads and staged operations. The real emulator
// proof is the guarded block at the bottom, registered only under
// FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 + FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {createMockStore} from './mock-store.mjs';
const key=value=>Buffer.from(value,'utf8').toString('base64url');
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,ordered(value[k])])):value;
const hashOf=reviews=>createHash('sha256').update(JSON.stringify(ordered(reviews))).digest('hex');
const reviewOf=(section,number)=>({section,number:String(number),format:'guided',thinking:'',instead:'',free:'fictional review '+section+':'+number,type:'',reasons:[],other:'',reviewed:true,confirmed:false});
const reviewsOf=(count,section='VR')=>Array.from({length:count},(_,i)=>reviewOf(section,i+1));
const scores=()=>({VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}});
const draftOf=(count,id=randomUUID())=>({id,title:'Work-budget fictional mock',provider:'',dmMode:'questions',scores:scores(),sjt:null,reviews:reviewsOf(count),note:''});

function makeFixture({namespace='workBudgetFixture'}={}){
 const uid='fictional-'+randomUUID();
 const accountPath=namespace+'/'+key(uid),mockBase=accountPath+'/mocks';
 const state={ledgerExists:false,used:0,mockDocId:null,receiptDocId:null,mock:null,receipt:null,children:new Map()};
 const metrics={transactions:[],operations:[],childReads:0,queries:[]};
 const receiptPathFor=docId=>accountPath+'/receipts/'+docId;
 const mockPath=()=>mockBase+'/'+state.mockDocId;
 const childPrefix=()=>mockBase+'/'+state.mockDocId+'/reviews/';
 const pathOf=value=>typeof value==='string'?value:String(value&&value.ref?value.ref.path:value&&value.path);
 const mkQuery=(spec={})=>{
  const s={ordered:false,projected:false,limit:null,cursor:null,...spec};
  return {__query:true,spec:s,
   orderBy:f=>mkQuery({...s,ordered:f==='__name__'}),
   select:p=>mkQuery({...s,projected:p==='ownerUid'}),
   limit:n=>mkQuery({...s,limit:n}),
   startAfter:d=>mkQuery({...s,cursor:pathOf(d)})};
 };
 const reviewsRoot={doc:id=>({path:childPrefix()+id}),
  orderBy:f=>mkQuery({ordered:f==='__name__'}),
  select:p=>mkQuery({projected:p==='ownerUid'}),
  limit:n=>mkQuery({limit:n}),
  startAfter:d=>mkQuery({cursor:pathOf(d)})};
 const mockRefFor=docId=>({path:mockBase+'/'+docId,collection:name=>{if(name!=='reviews')throw new Error('fixture supports only reviews children');return{...reviewsRoot,doc:id=>({path:mockBase+'/'+docId+'/reviews/'+id})}}});
 const subcollections={mocks:{doc:id=>mockRefFor(id)},receipts:{doc:id=>({path:receiptPathFor(id)})}};
 const db={collection:ns=>{if(ns!==namespace)throw new Error('fixture namespace mismatch');return{doc:id=>({path:ns+'/'+id,collection:name=>{if(!Object.hasOwn(subcollections,name))throw new Error('fixture collection '+name+' unsupported');return subcollections[name]}})}}};
 db.runTransaction=async(fn,options)=>{
  const attempt=[];
  metrics.transactions.push(options);
  const staged=()=>attempt.filter(entry=>entry[0]!=='get'&&entry[0]!=='query');
  const transaction={
   get:async arg=>{
    if(arg&&arg.__query===true){
     const spec=arg.spec;
     metrics.operations.push(['query',spec.limit]);
     let sorted=[...state.children.keys()].sort();
     if(spec.cursor!==null)sorted=sorted.filter(id=>childPrefix()+id>spec.cursor);
     const selected=spec.limit===null?sorted:sorted.slice(0,spec.limit);
     metrics.queries.push({ordered:spec.ordered,projected:spec.projected,limit:spec.limit,cursor:spec.cursor,size:selected.length,lastPath:selected.length>0?childPrefix()+selected[selected.length-1]:null});
     return {size:selected.length,docs:selected.map(id=>({ref:{path:childPrefix()+id},data:()=>structuredClone(state.children.get(id))}))};
    }
    const path=pathOf(arg&&arg.ref?arg.ref:arg);
    metrics.operations.push(['get',path]);
    if(state.mockDocId&&path.startsWith(childPrefix())){metrics.childReads++;const data=state.children.get(path.slice(childPrefix().length));return {exists:data!==undefined,data:()=>structuredClone(data),ref:{path}};}
    if(path===mockPath())return {exists:state.mock!==null,data:()=>structuredClone(state.mock),ref:{path}};
    if(path===accountPath)return {exists:state.ledgerExists,data:()=>({ownerUid:uid,used:state.used}),ref:{path}};
    if(path.startsWith(accountPath+'/receipts/'))return {exists:state.receipt!==null&&path===receiptPathFor(state.receiptDocId),data:()=>structuredClone(state.receipt),ref:{path}};
    return {exists:false,data:()=>undefined,ref:{path}};
   },
   create:(ref,data)=>attempt.push(['create',ref.path,structuredClone(data)]),
   set:(ref,data)=>attempt.push(['set',ref.path,structuredClone(data)]),
   update:(ref,data)=>attempt.push(['update',ref.path,structuredClone(data)]),
   delete:ref=>attempt.push(['delete',ref.path])
  };
  let result;
  try{result=await fn(transaction)}
  catch(error){metrics.operations.push(...attempt.map(entry=>[entry[0],entry[1],error?.code||'aborted']));throw error}
  // mirror transaction atomicity: apply staged writes only on a clean return
  for(const [op,path,data] of attempt){
   if(op==='delete'){
    if(path===mockPath()){state.mock=null;state.mockDocId=null;state.children.clear();}
    else if(path.startsWith(childPrefix()))state.children.delete(path.slice(childPrefix().length));
   }
   else if(op==='create'||op==='set'||op==='update'){
    if(path===accountPath){state.ledgerExists=true;state.used=data.used;}
    else if(path.startsWith(accountPath+'/receipts/')){state.receipt=data;state.receiptDocId=path.slice(path.lastIndexOf('/')+1);}
    else if(path.startsWith(mockBase+'/')&&path!==mockBase){
     const rest=path.slice(mockBase.length+1);
     if(rest.includes('/reviews/')){if(state.mockDocId)state.children.set(rest.slice(rest.indexOf('/reviews/')+'/reviews/'.length),data);}
     else if(op==='update'&&state.mockDocId===rest)state.mock={...state.mock,...data};
     else{state.mock=data;state.mockDocId=rest;}
    }
    else state.mock=data;
   }
   metrics.operations.push([op,path]);
  }
  return result;
 };
 const seed=(reviews,{revision=0,used=1,hash=null}={})=>{
  const id='seed-'+randomUUID(),docId=key(id);
  const order=reviews.map(q=>key(q.section+':'+Number(q.number)));
  state.ledgerExists=true;state.used=used;state.mockDocId=docId;
  state.mock={id,title:'Seeded work-budget mock',provider:'',dmMode:'questions',scores:scores(),sjt:null,note:'',reviewOrder:order,ownerUid:uid,loggedAt:'2026-10-01T00:00:00.000Z',reviewRevision:revision};
  if(hash)state.mock.reviewHash=hash;
  reviews.forEach((review,position)=>state.children.set(order[position],{review,position,ownerUid:uid}));
  state.receipt={id,ownerUid:uid,requestHash:'0'.repeat(64)};state.receiptDocId=docId;
  return id;
 };
 return {db,uid,seed,state,metrics,
  service:options=>createMockStore({db,namespace,clock:()=>new Date('2026-10-01T00:00:00.000Z'),...options})};
}

test('commit exceeding maxReviewDocumentWork is refused with operation_work_limit_exceeded before any write',async()=>{
 const f=makeFixture();
 const service=f.service({mutationWorkBudget:{maxReviewDocumentWork:8,maxTransactionAttempts:3}});
 await assert.rejects(service.commit(f.uid,draftOf(9)),error=>error?.code==='operation_work_limit_exceeded');
 const staged=f.metrics.operations.filter(entry=>['create','set','update','delete'].includes(entry[0]));
 assert.equal(staged.length,0,'refusal must stage no writes of any kind');
 assert.equal(f.state.ledgerExists,false);assert.equal(f.state.mock,null);assert.equal(f.state.children.size,0);assert.equal(f.state.receipt,null);
});

test('commit exactly at maxReviewDocumentWork succeeds; the stable-ID receipt replay still acknowledges after the budget is lowered below the stored size',async()=>{
 const f=makeFixture();
 const service=f.service({mutationWorkBudget:{maxReviewDocumentWork:8}});
 const input=draftOf(8);
 const first=await service.commit(f.uid,input);
 assert.equal(first.created,true);assert.equal(first.used,1);
 assert.equal(f.state.children.size,8,'at-threshold commit stores every review child');
 // Lower the budget below the stored document size, then replay the identical payload.
 const lowered=f.service({mutationWorkBudget:{maxReviewDocumentWork:2}});
 const replay=await lowered.commit(f.uid,input);
 assert.deepEqual(replay,{created:false,id:input.id,used:1},'receipt replay must acknowledge unchanged even when today\'s budget is lower');
 assert.equal(f.state.used,1,'replay consumes no allowance');assert.equal(f.state.children.size,8,'replay mutates nothing');
 // A genuinely new over-budget mutation under the lowered budget is refused.
 await assert.rejects(lowered.commit(f.uid,draftOf(3)),error=>error?.code==='operation_work_limit_exceeded');
 assert.equal(f.state.children.size,8);assert.equal(f.state.used,1);
});

test('malformed or unsafe mutationWorkBudget fails closed at construction; defaults and explicit attempts are validated',async()=>{
 const f=makeFixture();
 for(const bad of [null,'x',42,[],{maxReviewDocumentWork:0},{maxReviewDocumentWork:-1},{maxReviewDocumentWork:1.5},{maxReviewDocumentWork:'8'},{maxReviewDocumentWork:Number.MAX_SAFE_INTEGER+1},{maxTransactionAttempts:0},{maxTransactionAttempts:4},{maxTransactionAttempts:'3'},{maxTransactionAttempts:1.5},{maxTransactionAttempts:null}])
  assert.throws(()=>f.service({mutationWorkBudget:bad}),error=>error?.code==='invalid_mutation_work_budget','unsafe provided budget must be refused before any store work');
 assert.ok(f.service({}),'an empty object falls back to documented defaults');
 assert.ok(f.service({mutationWorkBudget:{maxReviewDocumentWork:1}}));
 assert.ok(f.service({mutationWorkBudget:{maxTransactionAttempts:1}}));
 assert.doesNotThrow(()=>f.service({mutationWorkBudget:undefined}));
});

test('mutation transactions pass the SDK-supported maxAttempts option; read-only get stays without transaction options',async()=>{
 const f=makeFixture();
 const service=f.service({mutationWorkBudget:{maxReviewDocumentWork:8,maxTransactionAttempts:2}});
 const input=draftOf(2);
 await service.commit(f.uid,input);
 assert.deepEqual(f.metrics.transactions.at(-1),{maxAttempts:2},'commit must use the configured attempt bound');
 await service.get(f.uid,input.id);
 assert.equal(f.metrics.transactions.at(-1),undefined,'read-only get keeps its existing unoptioned transaction');
 await service.updateReviews(f.uid,input.id,{reviews:reviewsOf(3,'VR')},0);
 assert.deepEqual(f.metrics.transactions.at(-1),{maxAttempts:2},'update must use the configured attempt bound');
 await service.remove(f.uid,input.id,1);
 assert.deepEqual(f.metrics.transactions.at(-1),{maxAttempts:2},'remove must use the configured attempt bound');
});

test('updateReviews identical-content retry over budget refuses with operation_work_limit_exceeded without child reads or a false saved reply',async()=>{
 const f=makeFixture();
 const stored=reviewsOf(10,'VR');
 const id=f.seed(stored,{revision:2,used:1,hash:hashOf(stored)});
 const service=f.service({mutationWorkBudget:{maxReviewDocumentWork:8}});
 await assert.rejects(service.updateReviews(f.uid,id,{reviews:structuredClone(stored)},2),error=>error?.code==='operation_work_limit_exceeded');
 assert.equal(f.metrics.childReads,0,'retry budget check must happen before readReviews verifies existing content');
 const staged=f.metrics.operations.filter(entry=>['create','set','update','delete'].includes(entry[0]&&entry[0]));
 assert.equal(staged.filter(e=>['create','set','update','delete'].includes(e[0])).length,0,'refusal stages no writes');
 assert.equal(f.state.mock.reviewRevision,2,'revision unchanged');
});

test('updateReviews replacement whose stored+incoming document touch exceeds the envelope refuses before any delete or write',async()=>{
 const f=makeFixture();
 const stored=reviewsOf(6,'VR');
 const id=f.seed(stored,{revision:1,used:1,hash:hashOf(stored)});
 const service=f.service({mutationWorkBudget:{maxReviewDocumentWork:8}});
 // stored 6 + incoming 3 = 9 > 8 (conservative existing+replacement upper bound)
 await assert.rejects(service.updateReviews(f.uid,id,{reviews:reviewsOf(3,'DM')},1),error=>error?.code==='operation_work_limit_exceeded');
 const staged=f.metrics.operations.filter(entry=>['create','set','update','delete'].includes(entry[0]));
 assert.equal(staged.length,0,'a tiny patch that would delete unbounded prior children must refuse before any staged write');
 assert.equal(f.state.children.size,6,'old children intact');assert.equal(f.state.mock.reviewRevision,1);assert.equal(f.state.used,1,'no quota movement');
});

test('within-budget updateReviews replacement keeps existing revision/owner semantics and unoptioned content checks pass unchanged',async()=>{
 const f=makeFixture();
 const stored=reviewsOf(4,'VR');
 const id=f.seed(stored,{revision:1,used:1,hash:hashOf(stored)});
 const service=f.service({mutationWorkBudget:{maxReviewDocumentWork:8}});
 const incoming=reviewsOf(3,'VR');
 const result=await service.updateReviews(f.uid,id,{reviews:incoming},1);
 assert.equal(result.reviewRevision,2);
 assert.equal(f.state.children.size,3,'stale children removed, new written');
 // stale-expectedRevision conflict stays unchanged on the within-budget path
 await assert.rejects(service.updateReviews(f.uid,id,{reviews:reviewsOf(2,'VR')},1),error=>error?.code==='review_conflict');
});


test('remove refuses with operation_work_limit_exceeded once a budget-plus-one sentinel child is observed, staging no delete',async()=>{
 const f=makeFixture();
 const stored=reviewsOf(11,'VR');
 const id=f.seed(stored,{revision:0,used:1,hash:hashOf(stored)});
 const service=f.service({mutationWorkBudget:{maxReviewDocumentWork:10}});
 await assert.rejects(service.remove(f.uid,id,0),error=>error?.code==='operation_work_limit_exceeded');
 const staged=f.metrics.operations.filter(entry=>['create','set','update','delete'].includes(entry[0]));
 assert.equal(staged.length,0,'the extra child must be detected before ANY delete is staged');
 assert.equal(f.state.children.size,11,'nothing partially deleted');
 assert.ok(f.state.receipt!==null&&f.state.receiptDocId!==null,'receipt untouched');
 assert.ok(f.metrics.queries.every(q=>q.size<=11&&q.limit<=11),'traversal never collects more than budget+1 snapshots per query');
});

test('remove with children exactly at the envelope completes via one bounded min(16,budget+1) page, all reads before any delete',async()=>{
 const f=makeFixture();
 const id=f.seed(reviewsOf(10,'VR'),{revision:0,used:1});
 const service=f.service({mutationWorkBudget:{maxReviewDocumentWork:10}});
 assert.deepEqual(await service.remove(f.uid,id,0),{deleted:true,id});
 assert.equal(f.state.children.size,0,'every child removed');assert.equal(f.state.mock,null,'parent removed');
 assert.deepEqual(f.metrics.queries.map(q=>q.limit),[11],'single page of limit min(16,10+1)');
 assert.ok(f.metrics.queries.every(q=>q.ordered===true&&q.projected===true),'keeps the accepted bounded ordered ownerUid-projected page shape');
 const dels=f.metrics.operations.findIndex(entry=>entry[0]==='delete');
 const lastQuery=f.metrics.operations.map(e=>e[0]).lastIndexOf('query');
 assert.ok(dels>lastQuery,'all page reads complete before the first staged delete');
});

test('multi-page removal: within-envelope uses budget-bounded pages, the cross-page budget+1 sentinel refuses before any staged delete',async()=>{
 const f=makeFixture();
 const idA=f.seed(reviewsOf(20,'VR'),{revision:0,used:1});
 const service=f.service({mutationWorkBudget:{maxReviewDocumentWork:20}});
 assert.deepEqual(await service.remove(f.uid,idA,0),{deleted:true,id:idA});
 assert.deepEqual(f.metrics.queries.map(q=>q.limit),[16,5],'first page capped at 16, second page at most the remaining 4 allowed plus one sentinel');
 const g=makeFixture();
 const idB=g.seed(reviewsOf(21,'VR'),{revision:0,used:1});
 await assert.rejects(g.service({mutationWorkBudget:{maxReviewDocumentWork:20}}).remove(g.uid,idB,0),error=>error?.code==='operation_work_limit_exceeded');
 const staged=g.metrics.operations.filter(entry=>['create','set','update','delete'].includes(entry[0]));
 assert.equal(staged.length,0,'cross-page sentinel detection stages no delete');
 assert.equal(g.state.children.size,21,'nothing partially deleted across pages');
 assert.deepEqual(g.metrics.queries.map(q=>q.limit),[16,5],'the same bounded page plan detects the 21st child before any write');
});

test('remove gates stay unchanged on within-budget deletions: stale revision, foreign child and receipt-only idempotent repeat',async()=>{
 const f=makeFixture();
 const id=f.seed(reviewsOf(5,'VR'),{revision:1,used:1});
 const service=f.service({mutationWorkBudget:{maxReviewDocumentWork:10}});
 await assert.rejects(service.remove(f.uid,id,0),error=>error?.code==='review_conflict','stale revision still refused');
 const g=makeFixture();
 const idG=g.seed(reviewsOf(5,'VR'),{revision:0,used:1});
 g.state.children.set('zz-foreign-child',[...g.state.children.values()][0]&&{ownerUid:'fictional-foreign',position:99});
 await assert.rejects(g.service({mutationWorkBudget:{maxReviewDocumentWork:10}}).remove(g.uid,idG,0),/Saved question ownership is inconsistent/);
 const h=makeFixture();
 const idH=h.seed(reviewsOf(5,'VR'),{revision:0,used:1});
 const svc=h.service({mutationWorkBudget:{maxReviewDocumentWork:10}});
 const first=await svc.remove(h.uid,idH,0);
 const second=await svc.remove(h.uid,idH,0);
 assert.deepEqual(second,first,'receipt-only repeat stays idempotent');
 assert.equal(h.state.used,1,'no quota refund or movement');
});

// Boundary mapping: ONLY the known operation_work_limit_exceeded code becomes
// HTTP 422 on the commit/edit/remove mutation paths — sanitized body, no
// Retry-After promise, no raw details. Controlled fake store; not Firestore.
import {createServer} from 'node:http';
import {createRequestHandler} from './auth-boundary.mjs';
async function withBoundary(store,fn){
 const server=createServer(createRequestHandler({verifyIdToken:async()=>({uid:'boundary-student',email_verified:true}),mockStore:store}));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{return await fn('http://127.0.0.1:'+server.address().port)}
 finally{await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()))}
}
const refusing=code=>Object.assign(new Error('Operation work budget exceeded'),{code});
test('commit, edit and remove refuse over-budget work with a sanitized 422 and no Retry-After, while unrelated storage errors stay 503',async()=>{
 await withBoundary({commit:async()=>{throw refusing('operation_work_limit_exceeded')},updateReviews:async()=>{throw refusing('operation_work_limit_exceeded')},remove:async()=>{throw refusing('operation_work_limit_exceeded')},list:async()=>({items:[],nextCursor:null}),getUsage:async()=>({cumulativeLogsUsed:0,initialAllowanceLimit:3}),get:async()=>null},async base=>{
  const commit=await fetch(base+'/api/mocks/commit',{method:'POST',headers:{authorization:'Bearer fixture','content-type':'application/json'},body:'{}'});
  assert.equal(commit.status,422);assert.deepEqual(await commit.json(),{error:'operation_work_limit_exceeded'});assert.equal(commit.headers.get('retry-after'),null,'no Retry-After promise');assert.equal(commit.headers.get('cache-control'),'no-store');
  const edit=await fetch(base+'/api/mocks/reviews?id=m',{method:'PATCH',headers:{authorization:'Bearer fixture','content-type':'application/json','if-match':'"review-0"'},body:'{"reviews":[]}'});
  assert.equal(edit.status,422);assert.deepEqual(await edit.json(),{error:'operation_work_limit_exceeded'});assert.equal(edit.headers.get('retry-after'),null);
  const del=await fetch(base+'/api/mocks/item?id=m',{method:'DELETE',headers:{authorization:'Bearer fixture','if-match':'"review-0"'}});
  assert.equal(del.status,422);assert.deepEqual(await del.json(),{error:'operation_work_limit_exceeded'});assert.equal(del.headers.get('retry-after'),null);
 });
 // unknown store failures keep the existing fail-closed 503 mapping unchanged
 await withBoundary({commit:async()=>{throw new Error('raw internal detail that must not leak')},updateReviews:async()=>{throw refusing('operation_work_limit_exceeded')},remove:async()=>{throw refusing('operation_work_limit_exceeded')},get:async()=>null},async base=>{
  const other=await fetch(base+'/api/mocks/commit',{method:'POST',headers:{authorization:'Bearer fixture','content-type':'application/json'},body:'{}'});
  assert.equal(other.status,503);assert.deepEqual(await other.json(),{error:'storage_unavailable'});
 });
 // read-only paths are not mutation paths: a budget code from get must not become 422
 await withBoundary({get:async()=>{throw refusing('operation_work_limit_exceeded')},list:async()=>({items:[],nextCursor:null}),getUsage:async()=>({cumulativeLogsUsed:0,initialAllowanceLimit:3})},async base=>{
  const read=await fetch(base+'/api/mocks/item?id=m',{headers:{authorization:'Bearer fixture'}});
  assert.equal(read.status,503,'read semantics unchanged in this slice');
 });
});

if(process.env.FIRESTORE_EMULATOR_HOST==='127.0.0.1:8080'&&process.env.FIREBASE_AUTH_EMULATOR_HOST==='127.0.0.1:9099'){
 // Real Firestore emulator + real HTTP boundary with explicitly LOW test budgets
 // (no giant load probes). The SDK maxAttempts option is exercised by passing it to
 // the installed SDK on real mutations; a fake-fixture refusal is NOT claimed as
 // proof of real contention behavior.
 const {initializeApp,deleteApp}=await import('firebase-admin/app');
 const {getAuth}=await import('firebase-admin/auth');
 const {getFirestore}=await import('firebase-admin/firestore');
 const {createFirebaseVerifier}=await import('./firebase-verifier.mjs');
 const app=initializeApp({projectId:'demo-deltascore-fresh'},'opwork-'+randomUUID());
 const admin=getAuth(app),db=getFirestore(app);
 const owner=uid=>db.collection('deltascoreFreshV1').doc(key(uid));
 const account=async()=>{const email='fictional-opwork-'+randomUUID()+'@example.test',password='FictionalEmulatorOnly-42!';const user=await admin.createUser({email,password,emailVerified:true});const r=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});assert.equal(r.status,200);return {uid:user.uid,token:(await r.json()).idToken}};
 async function serve(budget){
  const verifier=createFirebaseVerifier({mode:'emulator',projectId:'demo-deltascore-fresh'});
  const server=createServer(createRequestHandler({...verifier,mockStore:createMockStore({db,mutationWorkBudget:budget}),rateLimit:{ipBurst:1000}}));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {base:'http://127.0.0.1:'+server.address().port,stop:async()=>{server.closeAllConnections();await new Promise((res,rej)=>server.close(e=>e?rej(e):res()));await verifier.close()}};
 }
 const http=(base,method,path,token,body,headers={})=>fetch(base+path,{method,headers:{authorization:'Bearer '+token,...(body?{'content-type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)}).then(async r=>({status:r.status,body:await r.json(),retryAfter:r.headers.get('retry-after')}));
 test('real emulator HTTP: over-budget commit is refused 422 with untouched storage; at-threshold commit within budget succeeds',async()=>{
  const s=await serve({maxReviewDocumentWork:4,maxTransactionAttempts:3});
  try{
   const a=await account(),over=draftOf(5),at=draftOf(4);
   const refused=await http(s.base,'POST','/api/mocks/commit',a.token,over);
   assert.equal(refused.status,422);assert.deepEqual(refused.body,{error:'operation_work_limit_exceeded'});assert.equal(refused.retryAfter,null,'no Retry-After promise');
   assert.equal((await owner(a.uid).get()).exists,false,'refused commit consumed no allowance');
   assert.equal((await owner(a.uid).collection('mocks').get()).size,0,'no partial record');
   assert.equal((await owner(a.uid).collection('receipts').get()).size,0,'no receipt written');
   const accepted=await http(s.base,'POST','/api/mocks/commit',a.token,at);
   assert.equal(accepted.status,201);assert.equal(accepted.body.created,true);assert.equal(accepted.body.used,1);
   const readback=await http(s.base,'GET','/api/mocks/item?id='+encodeURIComponent(at.id),a.token);
   assert.equal(readback.status,200);assert.equal(readback.body.mock.reviews.length,4,'within-budget content readable in full, untruncated');
  }finally{await s.stop()}
 });
 test('real emulator HTTP: stable-ID receipt replay acknowledges after the budget is lowered below the stored size, while a new over-budget commit is refused',async()=>{
  const s=await serve({maxReviewDocumentWork:6});
  const a=await account(),input=draftOf(6);
  try{assert.equal((await http(s.base,'POST','/api/mocks/commit',a.token,input)).status,201)}finally{await s.stop()}
  const lowered=await serve({maxReviewDocumentWork:2});
  try{
   const replay=await http(lowered.base,'POST','/api/mocks/commit',a.token,input);
   assert.equal(replay.status,200);assert.deepEqual(replay.body,{created:false,id:input.id,used:1},'identical stable-ID replay still acknowledged under a lower budget');
   assert.equal((await owner(a.uid).get()).data().used,1,'replay consumed nothing');
   assert.equal((await owner(a.uid).collection('mocks').doc(key(input.id)).collection('reviews').get()).size,6,'stored document untouched');
   const fresh=await http(lowered.base,'POST','/api/mocks/commit',a.token,draftOf(3));
   assert.equal(fresh.status,422);assert.deepEqual(fresh.body,{error:'operation_work_limit_exceeded'});
  }finally{await lowered.stop()}
 });
 test('real emulator HTTP: over-budget edit retry and oversized replacement refuse 422 with unchanged revision/content; within-budget edit keeps revision semantics',async()=>{
  const s=await serve({maxReviewDocumentWork:5});
  try{
   const a=await account(),stored=reviewsOf(6,'VR'),input={...draftOf(0),reviews:stored};
   // commit exceeds 5 — seed via direct store instead so the edit path can be tested over a stored over-budget document
   const seeded=await createMockStore({db}).commit(a.uid,input);assert.equal(seeded.created,true);
   const readback=await http(s.base,'GET','/api/mocks/item?id='+encodeURIComponent(input.id),a.token);assert.equal(readback.status,200);
   const etag='"review-0"';
   const retry=await http(s.base,'PATCH','/api/mocks/reviews?id='+encodeURIComponent(input.id),a.token,{reviews:structuredClone(stored)},{'if-match':etag});
   assert.equal(retry.status,422);assert.deepEqual(retry.body,{error:'operation_work_limit_exceeded'});assert.equal(retry.retryAfter,null);
   const replacement=await http(s.base,'PATCH','/api/mocks/reviews?id='+encodeURIComponent(input.id),a.token,{reviews:reviewsOf(2,'VR')},{'if-match':etag});
   assert.equal(replacement.status,422);assert.deepEqual(replacement.body,{error:'operation_work_limit_exceeded'});
   const detail=(await owner(a.uid).collection('mocks').doc(key(input.id)).get()).data();
   assert.equal(Object.hasOwn(detail,'reviewRevision')?detail.reviewRevision:0,0,'stale revision unchanged on refusal (field-absence is revision 0 in the existing schema)');assert.equal(detail.reviewOrder.length,6,'content and order unchanged');
   assert.equal((await owner(a.uid).collection('mocks').doc(key(input.id)).collection('reviews').get()).size,6,'no children deleted');
   // shrink replacement within envelope: stored 6 + incoming 1 = 7 > 5 refuses; rebuild small doc first
   const smallId='opwork-small-'+randomUUID();
   assert.equal((await http(s.base,'POST','/api/mocks/commit',a.token,{...draftOf(2),id:smallId})).status,201);
   const okEdit=await http(s.base,'PATCH','/api/mocks/reviews?id='+encodeURIComponent(smallId),a.token,{reviews:reviewsOf(1,'VR')},{'if-match':'"review-0"'});
   assert.equal(okEdit.status,200);assert.equal(okEdit.body.saved,true);
   const edited=(await owner(a.uid).collection('mocks').doc(key(smallId)).get()).data();
   assert.equal(edited.reviewRevision,1,'within-budget edit bumps revision as before');
  }finally{await s.stop()}
 });
 test('real emulator HTTP: deletion traversal over the envelope refuses 422 keeping parent children and receipt intact; within-budget delete removes unreferenced children and repeats idempotently',async()=>{
  const s=await serve({maxReviewDocumentWork:4});
  try{
   const a=await account();
   const big=await createMockStore({db}).commit(a.uid,{...draftOf(5),id:'opwork-big-'+randomUUID()});assert.equal(big.created,true);
   const detail=(await owner(a.uid).collection('mocks').doc(key(big.id)).get());
   const refused=await http(s.base,'DELETE','/api/mocks/item?id='+encodeURIComponent(big.id),a.token,null,{'if-match':'"review-0"'});
   assert.equal(refused.status,422);assert.deepEqual(refused.body,{error:'operation_work_limit_exceeded'});assert.equal(refused.retryAfter,null);
   assert.equal((await owner(a.uid).collection('mocks').doc(key(big.id)).get()).exists,true,'parent intact');
   assert.equal((await owner(a.uid).collection('mocks').doc(key(big.id)).collection('reviews').get()).size,5,'all children intact — no partial deletion');
   assert.equal((await owner(a.uid).collection('receipts').doc(key(big.id)).get()).exists,true,'receipt intact');
   assert.equal((await owner(a.uid).get()).data().used,1,'no quota movement on refusal');
   // within-budget deletion including an unreferenced child
   const smallId='opwork-del-'+randomUUID();
   assert.equal((await http(s.base,'POST','/api/mocks/commit',a.token,{...draftOf(2),id:smallId})).status,201);
   const mockRef=owner(a.uid).collection('mocks').doc(key(smallId));
   await mockRef.collection('reviews').doc(key('DM:77')).create({ownerUid:a.uid,position:77,review:reviewOf('DM',77)});
   const del=await http(s.base,'DELETE','/api/mocks/item?id='+encodeURIComponent(smallId),a.token,null,{'if-match':'"review-0"'});
   assert.equal(del.status,200);assert.deepEqual(del.body,{deleted:true,id:smallId});
   assert.equal((await mockRef.get()).exists,false);assert.equal((await mockRef.collection('reviews').get()).size,0,'referenced and unreferenced children removed');
   assert.equal((await owner(a.uid).collection('receipts').doc(key(smallId)).get()).exists,true,'original save receipt preserved');
   assert.equal((await owner(a.uid).get()).data().used,2,'cumulative usage unchanged by deletion');
   const repeat=await http(s.base,'DELETE','/api/mocks/item?id='+encodeURIComponent(smallId),a.token,null,{'if-match':'"review-0"'});
   assert.equal(repeat.status,200);assert.deepEqual(repeat.body,{deleted:true,id:smallId},'receipt-only repeat stays idempotent');
  }finally{await s.stop()}
 });
 test('real emulator: the installed SDK accepts the bounded maxAttempts option on every mutation path and mutations complete normally',async()=>{
  // Honest scope: this proves the option is SDK-supported and does not break real
  // transactions (and that the fake fixture above proves the option is PASSED).
  // It is NOT a demonstration of real contention retries.
  const a=await account();
  const service=createMockStore({db,clock:()=>new Date('2026-10-01T00:00:00.000Z'),mutationWorkBudget:{maxReviewDocumentWork:8,maxTransactionAttempts:2}});
  const input=draftOf(3,'opwork-attempts-'+randomUUID());
  assert.equal((await service.commit(a.uid,input)).created,true);
  assert.equal((await service.updateReviews(a.uid,input.id,{reviews:reviewsOf(2,'VR')},0)).reviewRevision,1);
  assert.equal((await service.remove(a.uid,input.id,1)).deleted,true);
  assert.equal((await service.get(a.uid,input.id)),null);
 });
 test('real emulator: default-constructed store (budget 256) accepts 30-review documents exactly as before — the new default does not narrow accepted work',async()=>{
  const a=await account();
  const service=createMockStore({db});
  const input=draftOf(30,'opwork-default-'+randomUUID());
  assert.equal((await service.commit(a.uid,input)).created,true);
  const saved=await service.get(a.uid,input.id);
  assert.equal(saved.mock.reviews.length,30,'full content retained, no truncation');
 });
}
