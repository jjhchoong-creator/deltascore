import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {createMockStore} from './mock-store.mjs';
let app,db;
const namespace='deltascoreFreshV1',key=value=>Buffer.from(value,'utf8').toString('base64url'),owner=uid=>db.collection(namespace).doc(key(uid));
const input=id=>({id,title:'Fictional catalogue record',provider:'Fictional provider',dmMode:'questions',scores:{VR:{earned:'30',max:'99'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}},sjt:null,reviews:[{section:'VR',number:'1',free:'Private question text',reviewed:true}],note:'Private whole-mock note'});
const store=()=>createMockStore({db,namespace,clock:()=>new Date('2026-10-01T00:00:00.000Z')});
before(()=>{assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8080');app=initializeApp({projectId:'demo-deltascore-fresh'},'catalogue-fixtures-'+randomUUID());db=getFirestore(app)});
after(async()=>{if(db)await db.terminate();if(app)await deleteApp(app)});
test('catalogue rejects malformed pagination before datastore access',async()=>{
 let calls=0;const service=createMockStore({db:{collection(){calls++;throw new Error('Unexpected datastore access')}}});
 for(const limit of [0,-1,21,1.5,'1',null,NaN,Infinity])await assert.rejects(service.list('fictional',{limit}),error=>error.code==='invalid_list_request');
 for(const after of ['',42,{},'a','Zg=','_w','Zh','a/b','a\n',key('x'.repeat(129))])await assert.rejects(service.list('fictional',{after}),error=>error.code==='invalid_list_request');
 assert.equal(calls,0);
});
test('catalogue fails closed on corrupt ownership identity or summary data',async()=>{
 const service=store(),uid='fictional-corrupt-'+randomUUID(),record=input('catalogue-integrity');await service.commit(uid,record);const ref=owner(uid).collection('mocks').doc(key(record.id)),baseline=(await ref.get()).data();
 for(const changes of [{ownerUid:'another-fictional-account'},{id:'different-literal-id'},{title:null},{provider:[]},{dmMode:'invalid'},{scores:{...baseline.scores,VR:{earned:'100',max:'99'}}},{sjt:false},{loggedAt:null},{loggedAt:'not-a-date'},{reviewRevision:-1}]){
  await ref.set({...baseline,...changes});await assert.rejects(service.list(uid),undefined,'Corrupt catalogue metadata must not be returned');
 }
 await ref.set({...baseline,internalDiagnostic:'must not escape',scores:{...baseline.scores,VR:{...baseline.scores.VR,internalDiagnostic:'must not escape'}}});const page=await service.list(uid);assert.deepEqual(page.items[0].summary.scores,record.scores);assert.equal(Object.hasOwn(page.items[0].summary,'internalDiagnostic'),false);assert.equal((await owner(uid).get()).data().used,1);assert.equal((await owner(uid).collection('receipts').get()).size,1);
});
test('catalogue pages return only owned saved summaries without altering usage or receipts',async()=>{
 const service=store();assert.equal(typeof service.list,'function','Missing private saved-mock catalogue');
 const a='fictional-a-'+randomUUID(),b='fictional-b-'+randomUUID(),empty='fictional-empty-'+randomUUID(),ids=['same ID','mock/one ?=a','历史/二'];
 for(const id of ids)await service.commit(a,input(id));await service.commit(b,{...input(ids[0]),title:'Other fictional account'});
 const expected=ids.slice().sort((x,y)=>key(x)<key(y)?-1:1),seen=[];let after=null;
 do{const page=await service.list(a,{limit:1,after});assert.deepEqual(Object.keys(page).sort(),['items','nextCursor']);assert.equal(page.items.length,1);const row=page.items[0];assert.deepEqual(Object.keys(row).sort(),['reviewRevision','summary']);const original=input(expected[seen.length]);const {reviews,note,...metadata}=original;assert.deepEqual(row.summary,{...metadata,loggedAt:'2026-10-01T00:00:00.000Z'});assert.equal(row.reviewRevision,0);seen.push(row.summary.id);after=page.nextCursor;if(after!==null)assert.equal(after,key(row.summary.id));assert.ok(seen.length<=ids.length)}while(after!==null);
 assert.deepEqual(seen,expected);assert.equal((await owner(a).get()).data().used,3);assert.equal((await owner(a).collection('receipts').get()).size,3);
 assert.deepEqual(await service.list(empty),{items:[],nextCursor:null});assert.equal((await owner(empty).get()).exists,false);
 await service.updateReviews(a,ids[0],{reviews:[]},0);assert.equal((await service.list(a)).items.find(row=>row.summary.id===ids[0]).reviewRevision,1);
 const first=await service.list(a,{limit:1});await service.remove(a,first.items[0].summary.id,first.items[0].reviewRevision);const remainder=await service.list(a,{limit:20,after:first.nextCursor});assert.deepEqual(remainder.items.map(row=>row.summary.id),expected.slice(1));assert.equal(remainder.nextCursor,null);assert.equal((await owner(a).get()).data().used,3);assert.equal((await owner(a).collection('receipts').get()).size,3);
 const foreignPosition=await service.list(b,{limit:1,after:key(expected[0])});assert.ok(foreignPosition.items.every(row=>row.summary.title==='Other fictional account'));
});
