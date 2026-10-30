// Bounded vertical: remove() must query review children in bounded,
// deterministically-ordered, ownerUid-projected pages (<=16) using the correct
// startAfter SDK cursor, reading and validating EVERY page before ANY delete
// is staged inside the existing single atomic transaction.
// Tests 1-4 run against a controlled in-memory transaction fixture that
// records query shapes and operation order; the fixture is NOT real Firestore.
// The real Firestore emulator proof is the separate guarded test below,
// registered only under FIRESTORE_EMULATOR_HOST=127.0.0.1:8080.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createMockStore} from './mock-store.mjs';
const PAGE=16;
const namespace='deletePagesFixtureNamespace';
const key=value=>Buffer.from(value,'utf8').toString('base64url');
const pathOf=value=>typeof value==='string'?value:String(value&&value.ref?value.ref.path:value&&value.path);

// Controlled fixture (explicitly NOT real Firestore): document gets plus query
// gets. Query chains honour orderBy/select/limit/startAfter when the product
// uses them but TOLERATE an unbounded raw query (old source), so the decisive
// bounded-page assertion lives in the test and fails genuinely on old bytes.
function makeFixture({children=3,unreferenced=0,foreignAt=null,stuckCursor=false}={}){
 const uid='fictional-'+randomUUID(),mockId='mock-'+randomUUID(),docId=key(mockId);
 const accountPath=namespace+'/'+key(uid),mockPath=accountPath+'/mocks/'+docId,receiptPath=accountPath+'/receipts/'+docId,childPrefix=mockPath+'/reviews/';
 const ids=[...Array.from({length:children},(_,i)=>key('VR:'+(i+1))),...Array.from({length:unreferenced},(_,i)=>key('QR:'+(100+i)))].sort();
 const childData=new Map(ids.map((id,i)=>[id,{ownerUid:foreignAt===i?'fictional-foreign-'+randomUUID():uid,position:i}]));
 const mockDoc={ownerUid:uid,id:mockId,title:'Paginated fictional mock',reviewOrder:ids,reviewRevision:0};
 const receipt={id:mockId,ownerUid:uid,requestHash:'0'.repeat(64)};
 const state={mock:true,receipt:true,children:new Set(ids)};
 const metrics={sequence:[],queries:[],writes:[]};
 const mkQuery=(spec={})=>{
  const s={ordered:false,projected:false,limit:null,cursor:null,...spec};
  return {__query:true,spec:s,
   orderBy:f=>mkQuery({...s,ordered:f==='__name__'}),
   select:p=>mkQuery({...s,projected:p==='ownerUid'}),
   limit:n=>mkQuery({...s,limit:n}),
   startAfter:d=>mkQuery({...s,cursor:pathOf(d)})};
 };
 const reviewsRoot={doc:id=>({path:childPrefix+id}),
  orderBy:f=>mkQuery({ordered:f==='__name__'}),
  select:p=>mkQuery({projected:p==='ownerUid'}),
  limit:n=>mkQuery({limit:n}),
  startAfter:d=>mkQuery({cursor:pathOf(d)})};
 const mockRef={path:mockPath,collection:name=>{if(name!=='reviews')throw new Error('fixture supports only reviews children');return reviewsRoot}};
 const subcollections={mocks:{doc:()=>mockRef},receipts:{doc:()=>({path:receiptPath})}};
 const db={collection:ns=>{if(ns!==namespace)throw new Error('fixture namespace mismatch');return{doc:id=>({path:ns+'/'+id,ref:()=>({path:ns+'/'+id}),collection:name=>{if(!Object.hasOwn(subcollections,name))throw new Error('fixture collection '+name+' unsupported');return subcollections[name]}})}}};
 db.runTransaction=async fn=>{
  const transaction={
   get:async arg=>{
    if(arg&&arg.__query===true){
     const spec=arg.spec;
     metrics.sequence.push(['query',spec.limit]);
     let sorted=[...state.children].sort();
     if(!stuckCursor&&spec.cursor!==null)sorted=sorted.filter(id=>childPrefix+id>spec.cursor);
     const selected=spec.limit===null?sorted:sorted.slice(0,spec.limit);
     metrics.queries.push({ordered:spec.ordered,projected:spec.projected,limit:spec.limit,cursor:spec.cursor,size:selected.length,lastPath:selected.length>0?childPrefix+selected[selected.length-1]:null});
     return {size:selected.length,docs:selected.map(id=>({ref:{path:childPrefix+id},data:()=>structuredClone(childData.get(id))}))};
    }
    const path=pathOf(arg&&arg.ref?arg.ref:arg);
    metrics.sequence.push(['get',path]);
    if(path===mockPath)return {exists:state.mock,data:()=>structuredClone(mockDoc),ref:{path:mockPath}};
    if(path===receiptPath)return {exists:state.receipt,data:()=>structuredClone(receipt),ref:{path:receiptPath}};
    return {exists:false,data:()=>undefined,ref:{path}};
   },
   delete:ref=>{metrics.sequence.push(['delete',ref.path]);metrics.writes.push(ref.path);transaction._staged.push(ref.path);},
   set:ref=>{metrics.sequence.push(['set',ref.path]);metrics.writes.push(ref.path);transaction._staged.push(ref.path);},
   update:ref=>{metrics.sequence.push(['update',ref.path]);metrics.writes.push(ref.path);transaction._staged.push(ref.path);}
  };
  transaction._staged=[];
  const result=await fn(transaction);
  // The fixture commits staged writes only when the callback returns without
  // throwing, mirroring transaction atomicity so repeat-delete sees removal.
  for(const path of transaction._staged){if(path===mockPath)state.mock=false;else if(path.startsWith(childPrefix))state.children.delete(path.slice(childPrefix.length));}
  return result;
 };
 return {db,uid,mockId,mockPath,receiptPath,childPrefix,allIds:ids,state,metrics,service:createMockStore({db,namespace,clock:()=>new Date('2026-10-01T00:00:00.000Z')})};
}

test('review children are queried in bounded ordered pages with every read completing before any delete',async()=>{
 const f=makeFixture({children:33,unreferenced:2});
 const result=await f.service.remove(f.uid,f.mockId,0);
 assert.equal(result.deleted,true);assert.equal(result.id,f.mockId);
 assert.ok(f.metrics.queries.length>2,'more than 35 children must be queried in multiple pages, not one unbounded query');
 assert.ok(f.metrics.queries.every(q=>q.ordered===true&&q.projected===true&&q.limit===PAGE&&q.size<=PAGE),'review-child queries must use bounded ordered ownerUid-projected pages of 16, never an unbounded single query');
 const firstDelete=f.metrics.sequence.findIndex(entry=>entry[0]==='delete');
 const lastQuery=f.metrics.sequence.map(entry=>entry[0]).lastIndexOf('query');
 assert.ok(firstDelete>lastQuery,'every page read must complete before the first delete is staged');
 assert.equal(f.metrics.queries[0].cursor,null);
 for(let page=1;page<f.metrics.queries.length;page++)assert.equal(f.metrics.queries[page].cursor,f.metrics.queries[page-1].lastPath,'startAfter cursor must advance to the previous page boundary');
 assert.deepEqual(f.metrics.queries.map(q=>q.size),[PAGE,PAGE,3]);
 const deletes=f.metrics.writes.filter(path=>true).slice().sort();
 const expected=[...f.allIds.map(id=>f.childPrefix+id),f.mockPath].sort();
 assert.deepEqual(deletes,expected,'every referenced and unreferenced child plus the parent must be deleted exactly once');
 assert.equal(f.metrics.writes.includes(f.receiptPath),false,'receipt must never be written');
 assert.equal(f.state.receipt,true);
 // Cursor-advancement guard: a fixture/API that repeats the same page must be
 // refused before any delete is staged.
 const stuck=makeFixture({children:20,stuckCursor:true});
 await assert.rejects(stuck.service.remove(stuck.uid,stuck.mockId,0),/cursor did not advance/);
 assert.equal(stuck.metrics.writes.length,0,'a repeating cursor must refuse before staging any delete');
});

test('a foreign-owned child on a later page is refused before staging any delete',async()=>{
 const f=makeFixture({children:33,unreferenced:2,foreignAt:30});
 await assert.rejects(f.service.remove(f.uid,f.mockId,0),/Saved question ownership is inconsistent/);
 assert.equal(f.metrics.writes.length,0,'ownership refusal must stage no deletes');
 assert.equal(f.state.mock,true);assert.equal(f.state.children.size,35);
});

test('a single small page deletes children and parent atomically and preserves the receipt',async()=>{
 const f=makeFixture({children:3,unreferenced:1});
 const result=await f.service.remove(f.uid,f.mockId,0);
 assert.deepEqual(result,{deleted:true,id:f.mockId});
 assert.equal(f.metrics.writes.length,5,'four children plus parent, nothing else');
 assert.equal(f.metrics.writes.includes(f.receiptPath),false);
 assert.equal(f.state.mock,false);assert.equal(f.state.children.size,0);
});

test('repeat deletion of the surviving receipt stays idempotent without touching the receipt',async()=>{
 const f=makeFixture({children:3});
 const first=await f.service.remove(f.uid,f.mockId,0);
 const second=await f.service.remove(f.uid,f.mockId,0);
 assert.deepEqual(second,first);
 assert.equal(f.state.receipt,true);
 assert.equal(f.metrics.writes.includes(f.receiptPath),false);
});

if(process.env.FIRESTORE_EMULATOR_HOST==='127.0.0.1:8080'){
 test('real emulator: over32 review children including an unreferenced child delete atomically with preserved receipt and idempotent repeat',async()=>{
  const{initializeApp,deleteApp}=await import('firebase-admin/app');
  const{getFirestore}=await import('firebase-admin/firestore');
  const app=initializeApp({projectId:'demo-deltascore-fresh'},'delete-pages-'+randomUUID());
  const db=getFirestore(app);
  try{
   const service=createMockStore({db,namespace:'deltascoreFreshV1',clock:()=>new Date('2026-10-01T00:00:00.000Z')});
   const uid='fictional-'+randomUUID(),count=33;
   const reviews=Array.from({length:count},(_,i)=>({section:'VR',number:String(i+1),format:'guided',thinking:'',instead:'',free:'review '+String(i+1).padStart(3,'0'),type:'',reasons:[],other:'',reviewed:true,confirmed:false}));
   const input={id:'emulator-'+randomUUID(),title:'Emulator paged deletion mock',provider:'',dmMode:'questions',scores:{VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}},sjt:null,reviews,note:''};
   assert.equal((await service.commit(uid,input)).created,true);
   const account=db.collection('deltascoreFreshV1').doc(key(uid)),mockRef=account.collection('mocks').doc(key(input.id));
   await mockRef.collection('reviews').doc(key('DM:99')).create({ownerUid:uid,position:99,review:{section:'DM',number:'99',format:'guided',thinking:'',instead:'',free:'Fictional unreferenced child',type:'',reasons:[],other:'',reviewed:false,confirmed:false}});
   const total=count+1;assert.equal((await mockRef.collection('reviews').get()).size,total);
   const ledgerBefore=(await account.get()).data(),receiptBefore=(await account.collection('receipts').doc(key(input.id)).get()).data();
   const first=await service.remove(uid,input.id,0);
   assert.deepEqual(first,{deleted:true,id:input.id});
   assert.equal((await mockRef.get()).exists,false,'parent must be absent after deletion');
   assert.equal((await mockRef.collection('reviews').get()).size,0,'every referenced and unreferenced child must be removed');
   assert.deepEqual((await account.get()).data(),ledgerBefore,'cumulative usage ledger unchanged');
   assert.deepEqual((await account.collection('receipts').doc(key(input.id)).get()).data(),receiptBefore,'original save receipt preserved');
   const repeat=await service.remove(uid,input.id,0);
   assert.deepEqual(repeat,first,'repeat deletion acknowledges with the surviving receipt');
   assert.deepEqual((await account.get()).data(),ledgerBefore,'repeat deletion consumes nothing');
   assert.deepEqual((await account.collection('receipts').doc(key(input.id)).get()).data(),receiptBefore,'repeat deletion preserves the receipt');
  }finally{await db.terminate();await deleteApp(app)}
 });
}
