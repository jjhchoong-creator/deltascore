// mock-client-paid-daily-midnight.test.mjs — narrowly named client unit
// regression for the accepted paid-daily contract's reset semantics
// (paid-daily-integration-direction.md §1): the CANONICAL dailyResetAt must
// end at UTC midnight — exactly T00:00:00.000Z. A well-formed canonical ISO
// string that is NOT midnight is a corrupt reset instant and must fail closed
// as invalid_response on the active-paid path (NEVER a silent fallback to the
// initial DTO). accessExpiresAt may legitimately be ANY canonical instant —
// only the reset boundary carries the midnight requirement, and the client
// never compares any of these against its own clock. Pure in-memory fetcher
// (existing mock-client-paid-daily.test.mjs pattern): no emulator, network,
// store/policy/boundary/UI change.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAccountSession} from './account-session.mjs';
import {createMockClient} from './mock-client.mjs';

const initial={cumulativeLogsUsed:5,initialAllowanceLimit:3};
const paid={...initial,accessSource:'self-paid',dailyAllowanceLimit:12,dailyLogsUsed:3,dailyResetAt:'2026-10-29T00:00:00.000Z',accessExpiresAt:'2026-11-27T18:30:00.000Z'};
const paidProjection={...paid};

async function signedIn(uid='student-a'){const session=createAccountSession({verifySession:async()=>({uid})});await session.setAccount({uid,getIdToken:async()=>'opaque-unit-token'});return session}
const usageClient=async(body,status=200)=>createMockClient({session:await signedIn(),fetcher:async()=>new Response(JSON.stringify(body),{status})});

test('getUsage accepts the contracted midnight dailyResetAt projection unchanged',async()=>{
 const reply=await (await usageClient(paid)).getUsage();
 assert.deepEqual(reply.data,paidProjection,'a canonical midnight reset instant projects exactly the contracted fields');
});

test('getUsage fails closed on a non-midnight dailyResetAt while permitting any canonical accessExpiresAt',async()=>{
 // Every shape below is otherwise a fully valid active-paid DTO; only the
 // reset instant moves off UTC midnight. The store contract (paid-daily-
 // policy.mjs nextUtcMidnightIso) can only EVER emit T00:00:00.000Z here, so
 // any other well-formed instant is a corrupt snapshot and must fail closed
 // as invalid_response — never a silent initial fallback.
 const nonMidnight=[
  '2026-10-29T00:00:00.001Z', // one millisecond past midnight
  '2026-10-29T00:00:01.000Z', // one second past midnight
  '2026-10-29T12:34:56.789Z', // an arbitrary canonical instant
  '2026-10-29T23:59:59.999Z', // the last instant of the day
 ];
 for(const dailyResetAt of nonMidnight){
  const api=await usageClient({...paid,dailyResetAt});
  await assert.rejects(api.getUsage(),error=>error.code==='invalid_response'&&error.status===200,`non-midnight dailyResetAt ${dailyResetAt} must fail closed as invalid_response, never a silent initial fallback`);
 }
 // The midnight rule applies to dailyResetAt ONLY: the expiry above
 // (18:30:00.000Z) is non-midnight yet contracted, proven by the passing
 // positive test; a SECOND non-midnight expiry shape stays accepted too —
 // no clock comparison, any canonical instant.
 const expiryApi=await usageClient({...paid,accessExpiresAt:'2026-11-28T00:00:00.001Z'});
 assert.deepEqual((await expiryApi.getUsage()).data,{...paid,accessExpiresAt:'2026-11-28T00:00:00.001Z'},'a non-midnight accessExpiresAt stays a valid canonical instant');
});
