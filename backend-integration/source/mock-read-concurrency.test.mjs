// Bounded vertical: readReviews child-document read CONCURRENCY test.
// Tests 1-4 run against a controlled in-memory transaction fixture that counts
// simultaneous in-flight child-document reads; the fixture is NOT real Firestore.
// The real Firestore emulator proof is the separate guarded test below, registered
// only under emulators:exec (FIRESTORE_EMULATOR_HOST=127.0.0.1:8080).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {createMockStore} from './mock-store.mjs';
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,ordered(value[k])])):value;
const bound=16;
const key=value=>Buffer.from(value,'utf8').toString('base64url');
const reviewsOf=count=>Array.from({length:count},(_,i)=>({section:'VR',number:String(i+1),format:'guided',thinking:'',instead:'',free:'review text '+String(i+1).padStart(3,'0'),type:'',reasons:[],other:'',reviewed:true,confirmed:false}));
// Fake db: each child transaction.get resolves with index-INVERTED jitter (the
// last-dispatched read finishes FIRST), so completion-order dependence is detected.
function makeFixture(count,options={}){
 const uid='fictional-'+randomUUID(),mockId='mock-'+randomUUID(),docId=key(mockId),reviews=reviewsOf(count);
 const order=reviews.map(q=>key(q.section+':'+Number(q.number)));
 const children=new Map();
 order.forEach((id,i)=>children.set(id,{ownerUid:options.foreignChild===i?'fictional-foreign':uid,review:reviews[i],position:i}));
 if(options.missingChild!==undefined)children.delete(order[options.missingChild]);
 const mockDoc={ownerUid:uid,id:mockId,title:'Concurrency fictional mock',provider:'fictional',dmMode:'questions',scores:{VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}},sjt:null,note:'',loggedAt:'2026-10-01T00:00:00.000Z',reviewOrder:order,reviewRevision:0,reviewHash:createHash('sha256').update(JSON.stringify(ordered(reviews))).digest('hex')};
 const mockPath='mocks/'+docId,childPrefix=mockPath+'/reviews/';
 const metrics={inFlight:0,peak:0,writes:[]};
 const childDoc=cid=>({path:childPrefix+cid,ref:()=>({path:childPrefix+cid})});
 const mockDocObj={path:mockPath,ref:()=>({path:mockPath}),collection:rname=>({doc:childDoc})};
 const db={collection:ns=>({doc:()=>({ref:()=>({path:ns}),collection:name=>({doc:()=>mockDocObj})})})};
 db.runTransaction=async fn=>fn({
  get:async ref=>{
   if(ref.path===mockPath)return{exists:true,data:()=>structuredClone(mockDoc),ref};
   if(ref.path.startsWith(childPrefix)){
    const childId=ref.path.slice(childPrefix.length),data=children.get(childId);
    if(data===undefined)return{exists:false,data:()=>undefined,ref};
    const idx=[...children.keys()].indexOf(childId);
    metrics.inFlight+=1;metrics.peak=Math.max(metrics.peak,metrics.inFlight);
    await new Promise(r=>setTimeout(r,Math.max(2,(count-idx)*2)));metrics.inFlight-=1;
    return{exists:true,data:()=>structuredClone(data),ref};
   }
   return{exists:false,data:()=>undefined,ref};
  },
  set:ref=>{metrics.writes.push(['set',ref.path])},
  update:ref=>{metrics.writes.push(['update',ref.path])},
  delete:ref=>{metrics.writes.push(['delete',ref.path])}
 });
 return{db,uid,mockId,reviews,metrics,mockDoc,service:createMockStore({db,namespace:'concurrencyFixtureNamespace',clock:()=>new Date('2026-10-01T00:00:00.000Z')})};
}
test('ordered child reads never exceed the bounded in-flight concurrency',async()=>{
 const f=makeFixture(bound+4);
 const result=await f.service.get(f.uid,f.mockId);
 assert.ok(f.metrics.peak<=bound,`${f.metrics.peak} simultaneous in-flight child reads exceeds bound ${bound}`);
 assert.ok(f.metrics.peak>bound/2,`fixture must actually exercise ${bound+4} children`);
 assert.deepEqual(result.mock.reviews,f.reviews,'full ordered review payload must be preserved');
 assert.equal(f.metrics.writes.length,0);
});
test('identical review retry shares the bounded read path and commits nothing',async()=>{
 const f=makeFixture(bound+4);
 const result=await f.service.updateReviews(f.uid,f.mockId,{reviews:structuredClone(f.reviews)},0);
 assert.equal(result.reviewRevision,0,'identical retry must not bump revision');
 assert.equal(f.metrics.writes.length,0);
 // retry shares readReviews, so the same peak measured by the decisive bound test covers it
 assert.ok(f.metrics.peak>bound/2,`retry must actually read all ${bound+4} children (peak ${f.metrics.peak})`);
});
test('a foreign child document fails closed without any writes',async()=>{
 const f=makeFixture(bound+4,{foreignChild:bound+2});
 await assert.rejects(f.service.get(f.uid,f.mockId),/Saved question ownership or content is incomplete/);
 assert.equal(f.metrics.writes.length,0);
});
test('a missing child document fails closed without any writes',async()=>{
 const f=makeFixture(bound+4,{missingChild:bound+1});
 await assert.rejects(f.service.get(f.uid,f.mockId),/Saved question ownership or content is incomplete/);
 assert.equal(f.metrics.writes.length,0);
});
if(process.env.FIRESTORE_EMULATOR_HOST==='127.0.0.1:8080'){
 test('real emulator: commit over16 ordered reviews, read back, identical retry preserves everything',async()=>{
  const{initializeApp,deleteApp}=await import('firebase-admin/app');
  const{getFirestore}=await import('firebase-admin/firestore');
  const app=initializeApp({projectId:'demo-deltascore-fresh'},'read-concurrency-'+randomUUID());
  const db=getFirestore(app);
  try{
   const service=createMockStore({db,namespace:'deltascoreFreshV1',clock:()=>new Date('2026-10-01T00:00:00.000Z')});
   const uid='fictional-'+randomUUID(),count=bound+2,shuffled=reviewsOf(count);
   const input={id:'emulator-'+randomUUID(),title:'Emulator concurrency mock',provider:'',dmMode:'questions',scores:{VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}},sjt:null,reviews:structuredClone(shuffled),note:''};
   const committed=await service.commit(uid,input);assert.equal(committed.created,true);
   const account=db.collection('deltascoreFreshV1').doc(key(uid)),mockRef=account.collection('mocks').doc(key(input.id));
   const state=async()=>({usage:(await account.get()).data().used,receipt:structuredClone((await account.collection('receipts').doc(key(input.id)).get()).data()),revision:(d=>Object.hasOwn(d,'reviewRevision')?d.reviewRevision:0)((await mockRef.get()).data()),children:(await mockRef.collection('reviews').get()).size});
   const before=await state();assert.equal(before.revision,0);assert.equal(before.usage,1);assert.equal(before.children,count);
   const loaded=await service.get(uid,input.id);
   assert.deepEqual(loaded.mock.reviews,shuffled,'full ordered payload over16 reviews through the real emulator');
   assert.equal(loaded.reviewRevision,0);
   // commit stores no reviewHash yet, so the first differing update is the real write
   // path (batched); its committed hash then makes the following identical retry share readReviews.
   const edited=structuredClone(shuffled);edited[0].confirmed=true;
   const actual=await service.updateReviews(uid,input.id,{reviews:structuredClone(edited)},0);
   assert.equal(actual.reviewRevision,1,'differing update commits at revision1');
   const afterActual=await state();assert.equal(afterActual.revision,1);assert.equal(afterActual.children,count);
   const reloaded=await service.get(uid,input.id);
   assert.deepEqual(reloaded.mock.reviews,edited,'full ordered payload preserved after real update');
   const retry=await service.updateReviews(uid,input.id,{reviews:structuredClone(edited)},1);
   assert.equal(retry.reviewRevision,1,'identical retry must not bump revision on the real emulator');
   assert.deepEqual(await state(),afterActual,'usage, receipt, revision and child count unchanged after identical retry');
  }finally{await db.terminate();await deleteApp(app)}
 });
}
