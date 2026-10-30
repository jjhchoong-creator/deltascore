// mock-client-work-budget-refusal.test.mjs — narrowly named client unit for
// the accepted settled backend contract (store99ededd4 + boundary fe87913d):
// a real HTTP 422 {error:'operation_work_limit_exceeded'} on the three
// mutation methods must become a KNOWN typed client refusal (code+status,
// sanitized message), while every unknown code, mismatched status or
// non-decodable 422-adjacent response stays sanitized request_failed. Pure
// in-memory fetcher (existing mock-client.test.mjs pattern): no emulator,
// no network, no app/store/boundary/limiter change.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAccountSession} from './account-session.mjs';
import {createMockClient} from './mock-client.mjs';
const saved={id:'fixture/work-budget',title:'Fictional work-budget mock',provider:'',dmMode:'questions',scores:{VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}},sjt:null,reviews:[{section:'VR',number:'1',thinking:'Fictional reasoning',reasons:['Fictional reason']}],note:'Fictional note',loggedAt:'2026-10-22T00:00:00.000Z'};
async function signedIn(){const session=createAccountSession({verifySession:async()=>({uid:'student-a'})});await session.setAccount({uid:'student-a',getIdToken:async()=>'opaque-unit-token'});return session}
const apiFor=async body=>createMockClient({session:await signedIn(),fetcher:async()=>new Response(JSON.stringify(body),{status:422})});
test('mutation clients type the real 422 operation_work_limit_exceeded refusal on commit, review edit and removal with a sanitized message',async()=>{
 for(const [name,invoke] of [
  ['commitMock',api=>api.commitMock(saved)],
  ['updateReviews',api=>api.updateReviews(saved.id,'"review-0"',saved.reviews)],
  ['deleteMock',api=>api.deleteMock(saved.id,'"review-0"')]]){
  const api=await apiFor({error:'operation_work_limit_exceeded',message:'Sensitive internal work detail'});
  await assert.rejects(invoke(api),error=>error.code==='operation_work_limit_exceeded'&&error.status===422&&error.message==='Private API request did not complete'&&!error.message.includes('Sensitive')&&!Object.hasOwn(error,'cause'),`${name} must surface the accepted typed 422 refusal`);
 }
});
test('mutation clients sanitize an unknown error code or mismatched status at 422 without forwarding the raw body',async()=>{
 for(const [name,invoke] of [
  ['commitMock',api=>api.commitMock(saved)],
  ['updateReviews',api=>api.updateReviews(saved.id,'"review-0"',saved.reviews)],
  ['deleteMock',api=>api.deleteMock(saved.id,'"review-0"')]]){
  const unknown=await apiFor({error:'unexpected_new_code',message:'Sensitive unknown detail'});
  await assert.rejects(invoke(unknown),error=>error.code==='request_failed'&&error.status===422&&!error.message.includes('Sensitive'),`${name} unknown code must stay request_failed`);
 }
 const wrongStatus=createMockClient({session:await signedIn(),fetcher:async()=>new Response(JSON.stringify({error:'operation_work_limit_exceeded',message:'Sensitive mismatch detail'}),{status:400})});
 await assert.rejects(wrongStatus.commitMock(saved),error=>error.code==='request_failed'&&error.status===400&&!error.message.includes('Sensitive'),'the typed code at a mismatched status must not be trusted');
 const nonJson=createMockClient({session:await signedIn(),fetcher:async()=>new Response('Sensitive not JSON',{status:422})});
 await assert.rejects(nonJson.commitMock(saved),error=>error.code==='request_failed'&&error.status===422&&!error.message.includes('Sensitive'),'a non-decodable 422 stays the uncertain request_failed outcome');
});
test('the typed 422 addition preserves every existing denial mapping unchanged',async()=>{
 const session=await signedIn();
 for(const [status,code] of [[403,'initial_allowance_exhausted'],[409,'commit_conflict'],[400,'invalid_mock'],[404,'mock_not_found'],[503,'storage_unavailable']]){
  const api=createMockClient({session,fetcher:async()=>new Response(JSON.stringify({error:code,message:'Sensitive existing detail'}),{status})});
  await assert.rejects(api.commitMock(saved),error=>error.code===code&&error.status===status&&!error.message.includes('Sensitive'),`existing typed denial ${code}/${status} must be unchanged`);
 }
 const arbitrary=createMockClient({session,fetcher:async()=>new Response(JSON.stringify({error:'Sensitive arbitrary code',message:'x'}),{status:500})});
 await assert.rejects(arbitrary.commitMock(saved),error=>error.code==='request_failed'&&error.status===500&&!error.message.includes('Sensitive'),'arbitrary 500 stays sanitized request_failed');
});
