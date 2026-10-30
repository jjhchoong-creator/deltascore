import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
const module=await import('./mock-store.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND'&&error.message.includes('mock-store.mjs'))return {};throw error});
let app,db;
const namespace='deltascoreFreshV1';const key=value=>Buffer.from(value,'utf8').toString('base64url');
const owner=uid=>db.collection(namespace).doc(key(uid));
const draft=(id=randomUUID())=>({id,title:'Fictional mock',provider:'',dmMode:'questions',scores:{VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}},sjt:null,reviews:[],note:'',stage:'selection'});
test('two tabs racing for the last initial allowance can commit only once',async()=>{
 const uid='fictional-'+randomUUID(),service=store();await service.commit(uid,draft());await service.commit(uid,draft());
 const attempts=await Promise.allSettled([service.commit(uid,draft()),service.commit(uid,draft())]);
 assert.equal(attempts.filter(x=>x.status==='fulfilled').length,1);const rejected=attempts.find(x=>x.status==='rejected');assert.equal(rejected.reason.code,'initial_allowance_exhausted');
 assert.equal((await owner(uid).get()).data().used,3);assert.equal((await owner(uid).collection('mocks').get()).size,3);assert.equal((await owner(uid).collection('receipts').get()).size,3);
 await assert.rejects(service.commit(uid,draft()),error=>error.code==='initial_allowance_exhausted');
});
test('a reused commit ID cannot overwrite saved scores or consume another allowance',async()=>{
 const uid='fictional-'+randomUUID(),service=store(),input=draft();await service.commit(uid,input);const altered=structuredClone(input);altered.scores.VR.earned='31';
 await assert.rejects(service.commit(uid,altered),error=>error.code==='commit_conflict');
 assert.equal((await owner(uid).get()).data().used,1);assert.equal((await owner(uid).collection('mocks').doc(key(input.id)).get()).data().scores.VR.earned,'30');
});
test('invalid new scores cannot create a record receipt or consume an allowance',async()=>{
 const uid='fictional-'+randomUUID(),service=store();
 for(const alter of [d=>{d.scores.VR.earned='99'},d=>{d.scores.VR.max='0'},d=>{d.scores.QR.max='-1'},d=>{d.dmMode='weighted'},d=>{d.scores.VR.earned=null},d=>{d.scores.DM=null}]){
  const input=draft();alter(input);await assert.rejects(service.commit(uid,input),error=>error.code==='invalid_mock');
 }
 assert.equal((await owner(uid).get()).exists,false);assert.equal((await owner(uid).collection('mocks').get()).size,0);assert.equal((await owner(uid).collection('receipts').get()).size,0);
});
test('record ownership and allowance ignore browser-supplied identity quota and navigation fields',async()=>{
 const uid='fictional/a-'+randomUUID(),other='fictional-b-'+randomUUID(),service=store(),input={...draft(),ownerUid:other,uid:other,used:-999,loggedAt:'forged',route:'settings',current:'forged'};
 await service.commit(uid,input);await service.commit(other,{...draft(input.id),title:'Other fictional student'});
 const saved=(await owner(uid).collection('mocks').doc(key(input.id)).get()).data();assert.equal(saved.ownerUid,uid);assert.equal(saved.loggedAt,'2026-10-01T00:00:00.000Z');
 for(const field of ['uid','used','route','current','stage'])assert.equal(Object.hasOwn(saved,field),false,'client-only field leaked: '+field);
 assert.equal((await owner(other).collection('mocks').doc(key(input.id)).get()).data().title,'Other fictional student');assert.equal((await owner(uid).get()).data().used,1);assert.equal((await owner(other).get()).data().used,1);
 const retry=await service.commit(uid,{...input,used:999,stage:'review',ownerUid:'forged-again'});assert.equal(retry.created,false);assert.equal(retry.used,1);
});
test('a real Firestore create failure rolls back the receipt and allowance together',async()=>{
 const uid='fictional-'+randomUUID(),input=draft(),ref=owner(uid).collection('mocks').doc(key(input.id));await ref.create({title:'Existing fictional collision'});
 await assert.rejects(store().commit(uid,input),/ALREADY_EXISTS/);
 assert.equal((await owner(uid).get()).exists,false);assert.equal((await owner(uid).collection('receipts').get()).size,0);assert.equal((await ref.get()).data().title,'Existing fictional collision');
});
test('deleted saved content does not restore consumed allowance or recreate on retry',async()=>{
 const uid='fictional-'+randomUUID(),input=draft(),service=store();await service.commit(uid,input);await owner(uid).collection('mocks').doc(key(input.id)).delete();
 const retry=await service.commit(uid,input);assert.equal(retry.created,false);assert.equal(retry.used,1);assert.equal((await owner(uid).collection('mocks').get()).size,0);assert.equal((await owner(uid).collection('receipts').get()).size,1);
 await service.commit(uid,draft());await service.commit(uid,draft());await assert.rejects(service.commit(uid,draft()),error=>error.code==='initial_allowance_exhausted');assert.equal((await owner(uid).get()).data().used,3);
});
test('concurrent retries of one draft create exactly one record and consume one allowance',async()=>{
 const uid='fictional-'+randomUUID(),input=draft(),service=store();const results=await Promise.all([service.commit(uid,input),service.commit(uid,input),service.commit(uid,input)]);
 assert.equal(results.filter(r=>r.created).length,1);assert.ok(results.every(r=>r.id===input.id&&r.used===1));assert.equal((await owner(uid).get()).data().used,1);assert.equal((await owner(uid).collection('mocks').get()).size,1);assert.equal((await owner(uid).collection('receipts').get()).size,1);
});
test('equivalent JSON key order is idempotent and in-flight input edits cannot alter the saved snapshot',async()=>{
 const uid='fictional-'+randomUUID(),input=draft(),snapshot=structuredClone(input),service=store(),promise=service.commit(uid,input);input.title='Uncommitted later edit';await promise;
 const reversed=Object.fromEntries(Object.entries(snapshot).reverse());reversed.scores=Object.fromEntries(Object.entries(snapshot.scores).reverse());const retry=await service.commit(uid,reversed);
 assert.equal(retry.created,false);assert.equal(retry.used,1);assert.equal((await owner(uid).collection('mocks').doc(key(input.id)).get()).data().title,snapshot.title);
});
test('direct unauthenticated database reads and writes are denied by the actual local rules',async()=>{
 const uid='fictional-'+randomUUID(),input=draft();await store().commit(uid,input);
 const url='http://127.0.0.1:8080/v1/projects/demo-deltascore-fresh/databases/(default)/documents/'+owner(uid).path;
 const read=await fetch(url,{signal:AbortSignal.timeout(5000)});assert.equal(read.status,403);await read.arrayBuffer();
 const write=await fetch(url+'/mocks?documentId=unauthorized',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({fields:{title:{stringValue:'Unauthorized fictional write'}}}),signal:AbortSignal.timeout(5000)});assert.equal(write.status,403);await write.arrayBuffer();assert.equal((await owner(uid).collection('mocks').get()).size,1);
});
test('selected review text is committed atomically in separate question documents',async()=>{
 const uid='fictional-'+randomUUID(),input=draft(),service=store();input.reviews=[1,2].map(number=>({section:'VR',number:String(number),format:'guided',thinking:'',instead:'',free:'F'.repeat(600000),type:'',reasons:[],other:'',reviewed:false,confirmed:false}));
 await service.commit(uid,input);const saved=(await owner(uid).collection('mocks').doc(key(input.id)).get()).data();assert.equal(Object.hasOwn(saved,'reviews'),false);assert.deepEqual(saved.reviewOrder,input.reviews.map(q=>key(q.section+':'+Number(q.number))));
 const questions=owner(uid).collection('mocks').doc(key(input.id)).collection('reviews');const rows=await Promise.all(saved.reviewOrder.map(id=>questions.doc(id).get()));
 assert.deepEqual(rows.map(r=>r.data().review),input.reviews);assert.deepEqual(rows.map(r=>r.data().position),[0,1]);assert.ok(rows.every(r=>r.data().ownerUid===uid));assert.equal((await owner(uid).get()).data().used,1);
 const replay=await service.commit(uid,input);assert.equal(replay.created,false);assert.equal(replay.used,1);assert.equal((await questions.get()).size,2);
});
test('a corrupt server allowance fails closed rather than granting extra mocks',async()=>{
 const service=store();for(const used of [-1,0.5,'0',null]){
  const uid='fictional-'+randomUUID();await owner(uid).create({ownerUid:uid,used});await assert.rejects(service.commit(uid,draft()),error=>error.code==='invalid_allowance_state');
  assert.equal((await owner(uid).get()).data().used,used);assert.equal((await owner(uid).collection('mocks').get()).size,0);assert.equal((await owner(uid).collection('receipts').get()).size,0);
 }
});
test('malformed mock and question payloads are rejected before any durable write',async()=>{
 const uid='fictional-'+randomUUID(),service=store();
 for(const patch of [{id:''},{id:null},{id:42},{note:[]},{title:{}},{reviews:'invalid'},{reviews:[{section:'VR',number:'0'}]},{reviews:[{section:'invalid',number:'1'}]},{reviews:[{section:'VR',number:'1'},{section:'VR',number:1}]},{reviews:[{section:'SJT',number:'1'}]},{sjt:false}]){
  await assert.rejects(service.commit(uid,{...draft(),...patch}),error=>error.code==='invalid_mock');
 }
 assert.equal((await owner(uid).get()).exists,false);assert.equal((await owner(uid).collection('mocks').get()).size,0);assert.equal((await owner(uid).collection('receipts').get()).size,0);
});
test('weighted DM optional SJT and retained legacy maxima keep their original values',async()=>{
 const uid='fictional-'+randomUUID(),input=draft(),service=store();input.dmMode='weighted';input.scores.DM.max='47';input.sjt={earned:'40',max:'69'};await service.commit(uid,input);
 const weighted=(await owner(uid).collection('mocks').doc(key(input.id)).get()).data();assert.equal(weighted.dmMode,'weighted');assert.deepEqual(weighted.scores,input.scores);assert.deepEqual(weighted.sjt,input.sjt);
 const retained=draft();retained.scores.VR.max='45';retained.scores.QR.max='37';await service.commit(uid,retained);const legacy=(await owner(uid).collection('mocks').doc(key(retained.id)).get()).data();assert.deepEqual(legacy.scores,retained.scores);assert.equal((await owner(uid).get()).data().used,2);
});
const store=()=>{assert.equal(typeof module.createMockStore,'function','Missing atomic mock-commit store');return module.createMockStore({db,namespace,clock:()=>new Date('2026-10-01T00:00:00.000Z')})};
before(()=>{assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8080','This test must never use live Firestore');app=initializeApp({projectId:'demo-deltascore-fresh'},'mock-fixtures-'+randomUUID());db=getFirestore(app)});
after(async()=>{if(db)await db.terminate();if(app)await deleteApp(app)});
test('first final save atomically commits record receipt and cumulative allowance',async()=>{
 const uid='fictional-'+randomUUID(),input=draft(),service=store();const result=await service.commit(uid,input);
 assert.equal(result.created,true);assert.equal(result.used,1);assert.equal(result.id,input.id);
 const ledger=(await owner(uid).get()).data(),saved=(await owner(uid).collection('mocks').doc(key(input.id)).get()).data(),receipt=(await owner(uid).collection('receipts').doc(key(input.id)).get()).data();
 assert.equal(ledger.used,1);assert.equal(ledger.ownerUid,uid);assert.equal(saved.title,input.title);assert.deepEqual(saved.scores,input.scores);assert.equal(saved.loggedAt,'2026-10-01T00:00:00.000Z');assert.equal(receipt.id,input.id);assert.equal(receipt.ownerUid,uid);
});
test('retry of the same final save returns its receipt without consuming another allowance',async()=>{
 const uid='fictional-'+randomUUID(),input=draft(),service=store();await service.commit(uid,input);
 const result=await service.commit(uid,structuredClone(input));assert.equal(result.created,false);assert.equal(result.used,1);assert.equal(result.id,input.id);
 assert.equal((await owner(uid).get()).data().used,1);assert.equal((await owner(uid).collection('mocks').get()).size,1);assert.equal((await owner(uid).collection('receipts').get()).size,1);
});
