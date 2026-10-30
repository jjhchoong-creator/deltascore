// mock-client-paid-daily.test.mjs — narrowly named client unit for the ACCEPTED
// settled paid-daily backend contract (store afc0ad17 / helper e9a2f3ed /
// boundary dd2b451a, paid-daily-backend-parent-acceptance.md):
// 1) a real HTTP 429 {error:'daily_mock_limit_exceeded'} on the commit mutation
//    becomes a KNOWN typed client refusal (code+status, sanitized message) —
//    no client timer, no Retry-After reading or display promise, no raw
//    body/header forwarding; unknown code, mismatched status or non-JSON 429
//    stay sanitized request_failed.
// 2) getUsage strictly projects the OPTIONAL active-paid DTO: the initial
//    {cumulativeLogsUsed safe-int>=0, initialAllowanceLimit:3} shape is
//    unchanged, while a valid active grant appends exactly
//    accessSource:'self-paid', dailyAllowanceLimit:12,
//    dailyLogsUsed 0..12 integer <= cumulativeLogsUsed,
//    dailyResetAt/accessExpiresAt canonical four-digit ISO UTC.
//    Partial/wrong-type/non-canonical/unsupported-discriminant paid payloads
//    fail closed as invalid_response — NEVER a silent fallback to the
//    initial DTO. Only contracted fields are projected; the frozen
//    account-bound receipt/stale-application behavior is preserved.
// Pure in-memory fetcher (existing mock-client.test.mjs pattern): no
// emulator, no network, no app/store/boundary/limiter/UI change.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAccountSession} from './account-session.mjs';
import {createMockClient} from './mock-client.mjs';

const saved={id:'fixture/paid-daily',title:'Fictional paid-daily mock',provider:'',dmMode:'questions',scores:{VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}},sjt:null,reviews:[{section:'VR',number:'1',thinking:'Fictional reasoning',reasons:['Fictional reason']}],note:'Fictional note',loggedAt:'2026-10-22T00:00:00.000Z'};
const initial={cumulativeLogsUsed:5,initialAllowanceLimit:3};
const paid={...initial,accessSource:'self-paid',dailyAllowanceLimit:12,dailyLogsUsed:3,dailyResetAt:'2026-10-29T00:00:00.000Z',accessExpiresAt:'2026-11-27T18:30:00.000Z'};
const paidProjection={cumulativeLogsUsed:5,initialAllowanceLimit:3,accessSource:'self-paid',dailyAllowanceLimit:12,dailyLogsUsed:3,dailyResetAt:'2026-10-29T00:00:00.000Z',accessExpiresAt:'2026-11-27T18:30:00.000Z'};

async function signedIn(uid='student-a'){const session=createAccountSession({verifySession:async()=>({uid})});await session.setAccount({uid,getIdToken:async()=>'opaque-unit-token'});return session}
const usageClient=async(body,status=200)=>createMockClient({session:await signedIn(),fetcher:async()=>new Response(JSON.stringify(body),{status})});

// ── typed 429 daily refusal ──────────────────────────────────────────────
test('commit client types the real 429 daily_mock_limit_exceeded refusal with a sanitized message and no Retry-After promise',async()=>{
 const session=await signedIn();
 const seen=[];
 const api=createMockClient({session,fetcher:async(url,options)=>{
  seen.push({url,options});
  return new Response(JSON.stringify({error:'daily_mock_limit_exceeded',message:'Sensitive internal daily detail',retryAfterSeconds:3600}),{status:429,headers:{'retry-after':'3600','x-internal-grant':'fictional-secret'}});
 }});
 await assert.rejects(api.commitMock(saved),error=>error.code==='daily_mock_limit_exceeded'&&error.status===429&&error.message==='Private API request did not complete'&&!error.message.includes('Sensitive')&&!Object.hasOwn(error,'cause')&&!Object.hasOwn(error,'retryAfter')&&!Object.hasOwn(error,'retryAfterSeconds'),
  'commit must surface the accepted typed 429 daily refusal');
 // the refusal consumed no new client timer or retry-after surface: exactly one
 // synchronous fetch attempt, GET-free, no scheduling artifacts on the error.
 assert.equal(seen.length,1);
 assert.equal(seen[0].url,'/api/mocks/commit');
 assert.equal(seen[0].options.method,'POST');
});

test('commit client sanitizes an unknown code, mismatched status or non-decodable body at 429 without forwarding raw body or headers',async()=>{
 const session=await signedIn();
 const unknown=createMockClient({session,fetcher:async()=>new Response(JSON.stringify({error:'unexpected_new_code',message:'Sensitive unknown detail'}),{status:429})});
 await assert.rejects(unknown.commitMock(saved),error=>error.code==='request_failed'&&error.status===429&&!error.message.includes('Sensitive'),'unknown code at 429 must stay request_failed');
 const wrongStatus=createMockClient({session,fetcher:async()=>new Response(JSON.stringify({error:'daily_mock_limit_exceeded',message:'Sensitive mismatch detail'}),{status:400})});
 await assert.rejects(wrongStatus.commitMock(saved),error=>error.code==='request_failed'&&error.status===400&&!error.message.includes('Sensitive'),'the daily code at a mismatched status must not be trusted');
 const nonJson=createMockClient({session,fetcher:async()=>new Response('Sensitive not JSON',{status:429})});
 await assert.rejects(nonJson.commitMock(saved),error=>error.code==='request_failed'&&error.status===429&&!error.message.includes('Sensitive'),'a non-decodable 429 stays the uncertain request_failed outcome');
});

test('the typed 429 addition preserves every existing denial mapping unchanged',async()=>{
 const session=await signedIn();
 for(const [status,code] of [[403,'initial_allowance_exhausted'],[409,'commit_conflict'],[400,'invalid_mock'],[404,'mock_not_found'],[503,'storage_unavailable'],[422,'operation_work_limit_exceeded']]){
  const api=createMockClient({session,fetcher:async()=>new Response(JSON.stringify({error:code,message:'Sensitive existing detail'}),{status})});
  await assert.rejects(api.commitMock(saved),error=>error.code===code&&error.status===status&&!error.message.includes('Sensitive'),`existing typed denial ${code}/${status} must be unchanged`);
 }
 const arbitrary=createMockClient({session,fetcher:async()=>new Response(JSON.stringify({error:'Sensitive arbitrary code',message:'x'}),{status:500})});
 await assert.rejects(arbitrary.commitMock(saved),error=>error.code==='request_failed'&&error.status===500&&!error.message.includes('Sensitive'),'arbitrary 500 stays sanitized request_failed');
});

// ── strict optional paid getUsage projection ─────────────────────────────
test('getUsage projects a valid active-paid DTO with exactly the contracted fields, frozen and account-bound',async()=>{
 const session=await signedIn();
 const api=createMockClient({session,fetcher:async()=>new Response(JSON.stringify({...paid,ownerUid:'student-a',dailyLogDate:'2026-10-28',totalLogsAllowed:100,extra:'sensitive'}),{status:200})});
 const reply=await api.getUsage();
 assert.deepEqual(reply.data,paidProjection,'only contracted fields may be projected');
 assert.equal(Object.isFrozen(reply.data),true);
 // the frozen reply is still bound to the account generation: application after
 // switching accounts fails closed exactly as the existing receipt contract.
 await session.setAccount({uid:'student-b',getIdToken:async()=>'unit-b'});
 const stable=session.getState();
 let applied=0;
 assert.throws(()=>reply.apply(()=>applied++),error=>error.code==='stale_account');
 assert.equal(applied,0);
 assert.equal(session.getState(),stable);
});

test('getUsage keeps the initial-only DTO projection exactly unchanged',async()=>{
 const session=await signedIn();
 // extra non-paid fields are stripped exactly as before; NO paid field
 // present keeps the initial path. A partial or unsupported accessSource is
 // NOT the initial path — that fails closed (covered in the malformed suite).
 const api=createMockClient({session,fetcher:async()=>new Response(JSON.stringify({...initial,totalLogsAllowed:100,ownerUid:'student-a',internal:'sensitive'}),{status:200})});
 const reply=await api.getUsage();
 assert.deepEqual(reply.data,initial);
});

test('getUsage fails closed on malformed active-paid payloads instead of silently falling back to the initial DTO',async()=>{
 const malformed=[
  ['partial paid fields',{}],
  ['accessSource only',{accessSource:'self-paid'}],
  ['missing dailyResetAt',{cumulativeLogsUsed:5,initialAllowanceLimit:3,accessSource:'self-paid',dailyAllowanceLimit:12,dailyLogsUsed:1,accessExpiresAt:'2026-11-27T18:30:00.000Z'}],
  ['missing accessExpiresAt',{cumulativeLogsUsed:5,initialAllowanceLimit:3,accessSource:'self-paid',dailyAllowanceLimit:12,dailyLogsUsed:1,dailyResetAt:'2026-10-29T00:00:00.000Z'}],
  ['unsupported discriminant',{...paid,accessSource:'funded'}],
  ['non-integer dailyLogsUsed',{...paid,dailyLogsUsed:1.5}],
  ['dailyLogsUsed above cap',{...paid,dailyLogsUsed:13}],
  ['negative dailyLogsUsed',{...paid,dailyLogsUsed:-1}],
  ['dailyLogsUsed exceeding cumulative',{...paid,dailyLogsUsed:6,cumulativeLogsUsed:5}],
  ['non-canonical dailyResetAt',{...paid,dailyResetAt:'2026-10-29T00:00:00Z'}],
  ['non-canonical accessExpiresAt',{...paid,accessExpiresAt:'2026-11-27T18:30:00.000+00:00'}],
  ['six-digit-year accessExpiresAt',{...paid,accessExpiresAt:'+000001-01-01T00:00:00.000Z'}],
  ['dailyAllowanceLimit not 12',{...paid,dailyAllowanceLimit:100}],
  ['daily fields as strings',{...paid,dailyLogsUsed:'5',dailyAllowanceLimit:'12'}],
 ];
 for(const [label,body] of malformed){
  const api=await usageClient(body);
  await assert.rejects(api.getUsage(),error=>error.code==='invalid_response'&&error.status===200,`${label} must fail closed as invalid_response, never a silent initial fallback`);
 }
 // the missing-partial-branch shapes above must specifically not resolve to
 // the bare initial projection (regression against a permissive projection).
 const half=await usageClient({accessSource:'self-paid',dailyAllowanceLimit:12});
 await assert.rejects(half.getUsage(),error=>error.code==='invalid_response');
});

test('getUsage still rejects a corrupt initial base and preserves non-JSON, bad-status and transport sanitization on the usage path',async()=>{
 const session=await signedIn();
 for(const body of [{cumulativeLogsUsed:-1,initialAllowanceLimit:3},{cumulativeLogsUsed:5,initialAllowanceLimit:4},{...paid,initialAllowanceLimit:4},{...paid,cumulativeLogsUsed:null}]){
  const api=createMockClient({session,fetcher:async()=>new Response(JSON.stringify(body),{status:200})});
  await assert.rejects(api.getUsage(),error=>error.code==='invalid_response'&&error.status===200,'corrupt base fields must stay rejected even with valid paid additions');
 }
 for(const [status,body,code] of [[503,{error:'storage_unavailable',message:'Sensitive server detail'},'storage_unavailable'],[401,{error:'invalid_authentication'},'invalid_authentication'],[500,{error:'Sensitive arbitrary code'},'request_failed']]){
  const api=createMockClient({session,fetcher:async()=>new Response(JSON.stringify(body),{status})});
  await assert.rejects(api.getUsage(),error=>error.code===code&&error.status===status&&!error.message.includes('Sensitive'),`usage denial ${code}/${status} must be unchanged`);
 }
 const nonJson=createMockClient({session,fetcher:async()=>new Response('Sensitive invalid JSON',{status:200})});
 await assert.rejects(nonJson.getUsage(),error=>error.code==='invalid_response'&&error.status===200&&!error.message.includes('Sensitive'));
 const network=createMockClient({session,fetcher:async()=>{throw Error('Sensitive transport details')}});
 await assert.rejects(network.getUsage(),error=>error.code==='request_failed'&&!error.message.includes('Sensitive')&&!Object.hasOwn(error,'cause'));
 // stale snapshot: an initial-shaped body with NO paid fields remains the
 // authoritative projection — no invented clock comparison on the client.
 const plain=await usageClient(initial);
 assert.deepEqual((await plain.getUsage()).data,initial);
});
