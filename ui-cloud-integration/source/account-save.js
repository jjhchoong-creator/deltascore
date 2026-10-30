// account-save.js — stage-owned account FINAL SAVE controller for the
// account-save first vertical (account-save-first-vertical-contract.md).
// Emulator-only, explicitly injected; attaching selects the cloud final-save
// mode for the existing cancel-safe confirmMockLog entrypoints (labelled
// fictional test-account saving). It NEVER writes cloud data into browser
// local storage, never merges records into state.mocks/used/savedIds and
// never simulates a cloud save via local saveMock. Ownership follows the
// accepted pattern: createMockIntent is chosen at queue time over the SAME
// injected session as history/usage; the app captures account/view/draft-
// version ownership and a FULL CLONE of the draft BEFORE the confirmation/
// token await. Cancellation makes zero commit requests (commit only ever
// runs from the confirmed dialog accept path). Repeat submission while
// pending is refused. A failed or uncertain outcome retains the EXACT stable
// ID and the transmitted snapshot for Retry — a failure is never proof that
// no server commit happened — and Retry re-confirms but transmits the
// retained original clone, never newly typed content. After a successful
// commit the actual getMock is re-read under the SAME intent, and everything
// is announced only inside that synchronous receipt apply with the app's
// receipt-ownership recheck. If the local draft cleanup fails after a cloud
// commit, the controller states saved-to-account-but-cleanup-pending and
// keeps the stable retry identity without a second debit. Errors are
// sanitized typed copy, never raw transport detail; all private text is
// rendered with textContent. First/second-milestone, PB comparison and
// celebration wiring remain deliberately unsequenced at this checkpoint
// (estimated-score.js helpers untouched; no transition persisted).
import {createMockIntent} from '/backend/mock-intent.mjs';

const PENDING='Saving this mock to your account (fictional test-account saving)…';
// Truthful recovery copy (account-save-recovery-contract.md): a transport or
// decode failure BEFORE a valid acknowledgement is an UNCERTAIN outcome — it
// never proves that no server commit happened, so the copy can only say the
// result cannot yet be confirmed and that the exact record is retained.
const ERR_UNAVAILABLE='The save result cannot yet be confirmed. Your draft is unchanged and this exact record is retained. Keep this page open and retry; the retry re-sends the exact same record and re-checks whether it already saved.';
// A get/read failure AFTER a valid commit acknowledgement retains the proof
// of commit: it is never relabelled as a failed transaction.
const ERR_RESULT_UNAVAILABLE='This mock was saved to your account, but the saved result is temporarily unavailable. Nothing was saved again and no second save was counted. Keep this page open; Retry only re-reads the actual saved record.';
// Missing-record resolution (Joseph-approved policy yes1563578781183254579):
// a REAL typed mock_not_found AFTER a valid commit acknowledgement enters an
// explicit acknowledged-record-missing phase — truthful above-notice with
// local-draft guidance (the record can no longer be found, NOT the optimistic
// temporarily-unavailable wording), the draft stays retained readable and
// read-only, Retry stays the optional GET-only re-check (never a recreate),
// and the controller additionally renders an explicit Discard local draft
// action. Ack/queued clone/intent are kept exactly as before.
const ERR_RECORD_MISSING='This mock was saved to your account, but the saved record can no longer be found. Nothing was saved again and no second save was counted. Your browser draft is still here, unchanged and readable. Retry only re-reads the actual saved record. You can also discard the local draft, which clears only this browser draft and never recreates a saved record.';
const ERR_UNVERIFIED='Account access could not be verified. This mock was not saved to your account and your draft is unchanged.';
// Allowance denial (parent-approved architecture from the genuine ad1 RED):
// a KNOWN typed 403 initial_allowance_exhausted on an attempt whose queue
// never saw a transport-uncertain failure is a DEFINITE refusal: the save was
// refused, no additional save was counted, and the draft stays editable in
// this browser. It is NOT the generic cannot-yet-be-confirmed framing, it
// locks nothing, renders no Retry (the backend contract shows an identical
// re-send can only be refused again), claims no upgrade/purchase/new-grant/
// refund/new-quota, and performs no automatic request, navigation or draft
// clear. CRITICAL: this copy is only truthful for a FIRST-ATTEMPT refusal. If
// any earlier attempt on this same queue failed before a valid acknowledgement
// in a way that never proves the server state (q.priorUncertain), the refusal
// on a later attempt cannot establish that the earlier attempt never committed
// — the queue stays in the existing truthful uncertain phase instead.
const ERR_ALLOWANCE_DENIED='Your initial account-save allowance is used up. This save was refused. Your draft is still in this browser, and no additional save was counted.';
// Work-budget refusal (parent-approved copy, operation-work-budget-parent-
// review): a KNOWN typed 422 operation_work_limit_exceeded on an attempt
// whose queue never saw a transport-uncertain failure is the SAME class of
// DEFINITE refusal as the allowance denial — the backend proves zero staged
// writes. The copy is scoped strictly to THIS ATTEMPT and THIS PAGE: it
// claims no reload persistence, no other-request/independent guarantee, and
// no retry success. Same priorUncertain guard as ERR_ALLOWANCE_DENIED: if an
// earlier attempt on this queue failed before a valid acknowledgement in a
// transport-uncertain way, a later 422 cannot prove the original never
// committed, so the queue stays in the existing uncertain phase.
const ERR_WORK_BUDGET_DENIED='This attempt did not save the mock because it exceeded the safety work limit. It did not use a mock log. Your draft is still available to edit on this page. Retrying may hit the same limit.';
// Paid daily-limit refusal (parent-approved copy, paid-daily-integration-direction.md):
// a KNOWN typed 429 daily_mock_limit_exceeded on a FIRST attempt (no prior
// transport-uncertain failure on this queue) is a DEFINITE refusal — the
// backend proves the refused commit staged zero writes and consumed no daily
// allowance. Same priorUncertain guard as the allowance and work-budget
// branches: an earlier uncertain attempt makes a later 429 unable to prove the
// original never committed, so it falls through to the existing conservative
// uncertain phase. The copy claims no grant, purchase, refund or reload
// persistence beyond this page's retained draft.
const ERR_DAILY_LIMIT_DENIED='This attempt did not save the mock because today’s 12-mock logging limit has been reached. It did not use a mock log. Your draft is still available to edit on this page. The daily limit resets at midnight UTC.';
// fm6 pre-commit prior-catalogue failure (GPT-approved architecture): a
// prior listMocks page failure happens BEFORE any commit may start, so it is
// truthful to say nothing was saved and no save was counted. It reuses the
// existing sanitized failed phase + Retry path (never a raw error, never a
// synthesized empty history, never a silent fall-through to commit).
const ERR_PRIOR_UNAVAILABLE='Your saved mocks could not be read before this save. Nothing was saved to your account, no save was counted, and your draft is unchanged. Keep this page open and retry.';
const ERR_CLEANUP='Saved to your account, but this browser could not clear the local draft. Nothing was deleted and no second save was counted. Keep this page open; Retry completes only the local draft cleanup.';
// Home-departure recovery (Joseph-approved lifecycle extension): a COMMITTED
// receipt whose original draft is still owned but is not on its original view
// route is neither applied (no cleanup/navigation while away) nor dropped —
// it enters this explicit pending phase. The draft stays read-only with this
// truthful notice; Retry only re-reads the saved record (never another POST).
const ERR_RESUME='This mock was saved to your account. Its local draft is still here. Use Retry to finish opening the saved result; Retry only re-reads the saved record and does not save it again.';
// Internal sentinel for the deferred route-mismatch receipt (distinct from
// null = changed-draft drop and true = completed apply).
const RESUME_PENDING=Symbol('account-save-resume-pending');
const UNVERIFIED_CODES=new Set(['authentication_required','invalid_authentication','email_verification_required','stale_account','stale_intent']);
// fm6 second-milestone (GPT-approved architecture): the largest page the
// accepted listMocks client schema allows (limit 1..20). Sequential pages
// under the SAME queued intent; NO arbitrary product cap and NO eager
// unbounded fan-out — the loop only continues while the server keeps
// handing out a nextCursor.
const PRIOR_PAGE_LIMIT=20;
// Internal sentinels for the pre-commit prior-catalogue collection.
const OWNER_LOST=Symbol('account-save-prior-owner-lost');
const PRIOR_UNAVAILABLE=Symbol('account-save-prior-unavailable');
// fm7 collector hardening (GPT review): the prior snapshot must be IMMUTABLE
// end to end, so a small local recursive freeze covers the outer object,
// every array, summary, nested scores object and score leaf. No new module,
// no storage, no client/backend edit — the accepted browser client already
// recursively freezes real responses; this makes the guarantee structural.
function deepFreeze(value){
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  Object.freeze(value);
  for(const key of Object.keys(value))deepFreeze(value[key]);
 }
 return value;
}

export function createAccountSave({session,client}={}){
 if(!session||typeof session.getState!=='function')throw new TypeError('createAccountSave requires an injected session');
 if(!client||typeof client.commitMock!=='function'||typeof client.getMock!=='function')throw new TypeError('createAccountSave requires an injected client with commitMock and getMock');
 // seam: the attached app's frozen callbacks {guard,apply,refresh}. While no
 // seam is mounted, no action can start a private request (detached).
 let seam=null;
 // queue: the CURRENT confirmation/save session {queued,intent}; queued is
 // the app-captured {id,route,version,clone} taken at Save-click time.
 // phase: 'queued'|'pending'|'failed'|'acknowledged-result-unavailable'|
 //        'acknowledged-record-missing'|'committed-cleanup-pending'|
 //        'acknowledged-resume-pending'|'allowance-denied'|
 //        'work-budget-denied'|'daily-limit-denied'|null.
 // queue flags: q.committed = a valid commit acknowledgement is in hand;
 // q.priorUncertain = an earlier attempt failed before any valid
 // acknowledgement in a way that does not prove the server state (see the
 // allowance-denial guard in runSave — definite refusals and allowance
 // denials never set it).
 let queue=null,phase=null,failure=null;
 const invalidate=()=>{const q=queue;queue=null;phase=null;failure=null;if(q&&q.intent)try{q.intent.invalidate()}catch{}};
 const refresh=()=>{try{seam&&seam.refresh()}catch{}};
 const accountReady=()=>session.getState().status==='signed-in';
 // fm6 second-milestone (GPT-approved architecture): collect the COMPLETE,
 // immutable, account-ONLY prior catalogue summary snapshot BEFORE the commit
 // under the SAME queued intent q.intent, via intent.listMocks({limit:20,
 // after:cursor}) SEQUENTIALLY with no fan-out. After every awaited page
 // response the queue identity, seam mount and captured session-owner object
 // are rechecked BEFORE dispatching the next page; the data is read only
 // through the receipt's synchronous apply under the same intent guard. The
 // snapshot carries ONLY the accepted list projection fields (summary objects
 // and literal summary IDs) — never full detail claims, never browser-local
 // state. A page failure returns a sentinel: it must NEVER start the commit
 // and NEVER synthesize an empty history. Every returned nonnull cursor is
 // tracked in a seen-set: a cursor replayed at ANY earlier position (multi-
 // step A→B→A cycles included) is refused conservatively — no infinite loop,
 // no partial snapshot. Duplicate summary IDs WITHIN or ACROSS pages are
 // refused conservatively too — never silently deduplicated into a commit.
 // The complete snapshot is recursively frozen (outer object, arrays,
 // summaries, nested scores) before it is cached on the queue.
 // The snapshot is cached on the queue q (never persisted, never merged into
 // local slices) and RETAINED across commit/detail/cleanup retries. Any
 // owner invalidation drops the whole queue, so a snapshot can never cross a
 // session/view owner. A snapshot taken BEFORE the commit may legitimately
 // contain the new id only on an idempotent created:false replay path; the
 // app presentation gates (same-id suppression / no rebuild after an
 // uncertain commit) keep such a queue honest.
 async function collectPrior(q){
  if(!seam||!accountReady()||queue!==q||session.getState()!==q.owner)return OWNER_LOST;
  const items=[],savedIds=[],seen=new Set(),seenCursors=new Set();
  let cursor=null;
  for(;;){
   let reply;
   try{reply=await q.intent.listMocks({limit:PRIOR_PAGE_LIMIT,after:cursor});}
   catch(error){if(queue!==q||!seam)return OWNER_LOST;return PRIOR_UNAVAILABLE;}
   if(queue!==q||!seam||session.getState()!==q.owner)return OWNER_LOST;
   let page;
   try{page=reply.apply(()=>reply.data);}catch{return OWNER_LOST;}
   if(page===OWNER_LOST||queue!==q||!seam)return OWNER_LOST;
   const list=page.items,ids=list.map(item=>item.summary.id);
   // Conservative refusal (GPT review): duplicate summary IDs WITHIN a page
   // never produce a snapshot at all — the runner-up pages cannot rescue it.
   if(new Set(ids).size!==ids.length)return PRIOR_UNAVAILABLE;
   for(const entry of list){const id=entry.summary.id;if(seen.has(id))return PRIOR_UNAVAILABLE;seen.add(id);items.push(entry.summary);savedIds.push(id);}
   if(page.nextCursor===null)break;
   // Repeated cursor in ANY earlier position (A→B→A multi-step cycles, not
   // just the immediately previous cursor) is refused conservatively — every
   // returned nonnull cursor is tracked, so no replay can loop the collector.
   if(seenCursors.has(page.nextCursor))return PRIOR_UNAVAILABLE;
   seenCursors.add(page.nextCursor);
   if(list.length===0)return PRIOR_UNAVAILABLE; // accepted client rejects this; belt-and-braces
   cursor=page.nextCursor;
  }
  return deepFreeze({summaries:items,savedIds});
 }
 async function runSave(q){
  if(!seam||!accountReady()){phase='failed';failure=ERR_UNVERIFIED;refresh();return;}
  phase='pending';failure=null;refresh();
  const queued=q.queued;
  try{
   let ack=null;
   if(!q.committed){
    // fm6: the prior catalogue summary snapshot is collected BEFORE the
    // commit under the same intent. A collection failure (owner lost or list
    // I/O error) means NO commit POST may start and no empty history is ever
    // synthesized: the existing sanitized failure/Retry path handles it.
    if(!q.prior){
     const collected=await collectPrior(q);
     if(queue!==q||!seam)return; // replaced/detached/signed-out: never present
     if(collected===OWNER_LOST){invalidate();refresh();return;}
     if(collected===PRIOR_UNAVAILABLE){phase='failed';failure=ERR_PRIOR_UNAVAILABLE;refresh();return;}
     q.prior=collected; // COMPLETE immutable account-only snapshot on the queue
    }
    // Transmit the captured clone only: identity, content and stable ID are
    // exactly what was confirmed, unchanged by any later typing.
    const ackReply=await q.intent.commitMock(structuredClone(queued.clone));
    if(queue!==q||!seam)return; // replaced/detached/signed-out: never present
    ack=ackReply.apply(()=>ackReply.data); // {created,id,used} server-authoritative
    q.committed=true; // never re-debit on a cleanup/result retry after a valid ack
    q.ack=ack; // internally retained true-created receipt (later feedback integration)
   }
   // After commit, re-read the ACTUAL getMock under the same intent before
   // displaying anything completed.
   const gotReply=await q.intent.getMock(queued.id);
   if(queue!==q||!seam)return; // a late receipt after replacement must never present
   // Synchronous application inside the receipt ownership guard, with no
   // awaited UI effects inside the callback: the app rechecks original
   // ownership/version and performs the ONLY permitted local mutation
   // (clear the unchanged original draft via existing synchronous persist).
   const applied=gotReply.apply(()=>{
    if(queue!==q||!seam)return undefined;
    if(!seam.guard(queued)){
     // Home-departure recovery (approved lifecycle extension): a COMMITTED
     // receipt for the still-OWNED unchanged original draft, departed from
     // its route, is deferred truthfully — never applied (no cleanup or
     // navigation while away) and never silently dropped (the true-created
     // ack must survive to a later presentation). Everything else keeps the
     // existing drop semantics exactly: changed draft/null-owner, signout,
     // replacement and uncommitted receipts still land on the null branch.
     if(q.committed&&seam.ownsDraft&&seam.ownsDraft(queued))return RESUME_PENDING;
     return null;
    }
    const mock=gotReply.data&&gotReply.data.mock;
    if(!mock||mock.id!==queued.id)return null;
    // Pass the RETAINED original acknowledgement (including a previous
    // attempt's true-created receipt after a cleanup/result retry) — the ack
    // must survive to the final application, never nullified by re-entry.
    // fm6: the retained COMPLETE pre-commit prior summary snapshot rides as
    // the optional FOURTH seam.apply argument (never rebuilt after the
    // commit; the original three ack arguments and every existing observer's
    // spread wrapper keep working unchanged).
    return seam.apply(queued,mock,q.ack||ack||null,q.prior);
   });
   if(applied===null){invalidate();refresh();return;} // changed draft: dropped, retained in the UI
   if(applied===true){queue=null;phase=null;failure=null;refresh();return;} // completed
   if(applied===RESUME_PENDING){
    // Deferred acknowledged receipt: retain queue/q.ack/intent — NO apply,
    // cleanup or navigation happened; the explicit pending phase keeps the
    // draft locked read-only with truthful saved/recovery feedback + Retry.
    phase='acknowledged-resume-pending';failure=ERR_RESUME;refresh();return;
   }
   // Cloud commit succeeded; local cleanup failed: clear statement, stable
   // retry identity, no second debit and no premature navigation.
   phase='committed-cleanup-pending';failure=ERR_CLEANUP;refresh();
  }catch(error){
   if(queue!==q||!seam)return; // stale failures cannot replace the current UI
   // Failed/uncertain outcomes are NOT proof that no server commit happened;
   // the exact snapshot and stable ID stay retained for Retry.
   // Phase semantics (account-save-recovery-contract.md): a valid commit
   // acknowledgement already in hand (q.committed) means any get/read failure
   // RETAINS the proof of commit and the original ack — it is never relabelled
   // as a failed transaction; Retry skips the commit and only re-reads.
   // Missing-record resolution (approved): the ONE exception within the
   // acknowledged branch is the REAL typed mock_not_found AFTER q.committed —
   // an explicitly-missing record enters the dedicated acknowledged-record-
   // missing phase with truthful local-draft guidance. Arbitrary 503, unknown
   // ack or auth errors keep the existing acknowledged-result-unavailable
   // behavior byte-for-byte; the ack, queued clone and intent are untouched.
   if(q.committed){const code=error&&typeof error.code==='string'?error.code:'';if(code==='mock_not_found'){phase='acknowledged-record-missing';failure=ERR_RECORD_MISSING;}else{phase='acknowledged-result-unavailable';failure=ERR_RESULT_UNAVAILABLE;}refresh();return;}
   const code=error&&typeof error.code==='string'?error.code:'';
   // No acknowledgement yet. A KNOWN typed initial_allowance_exhausted refusal
   // on a queue whose earlier attempts all resolved definitively is a DEFINITE
   // refusal: dedicated allowance-denied phase, explicit copy, no lock, no
   // Retry, no automatic request/navigation/draft clear. CRITICAL guard: if
   // ANY earlier attempt on this same queue failed before a valid
   // acknowledgement in a transport-uncertain way (q.priorUncertain — a
   // pre-ack failure that does not prove the server did not commit), the 403
   // cannot establish that the original attempt never committed, so the queue
   // stays in the existing truthful uncertain phase instead of claiming a
   // definite refusal. The valid-ack (q.committed) path above is untouched.
   if(code==='initial_allowance_exhausted'&&!q.priorUncertain){phase='allowance-denied';failure=ERR_ALLOWANCE_DENIED;refresh();return;}
   // Work-budget refusal (same approved definite-refusal class): a KNOWN typed
   // 422 operation_work_limit_exceeded with no prior uncertainty is a definite
   // refusal — the backend proves the refusal happens before ANY staged write,
   // so nothing was counted and the draft stays editable with NO Retry
   // affordance, no lock, no automatic request, navigation or draft clear.
   // CRITICAL: gated on !q.priorUncertain exactly like the allowance branch —
   // if an EARLIER attempt on this queue failed transport-uncertain, this 422
   // cannot prove the original never committed, so the queue must fall
   // through to the existing conservative uncertain phase below.
   if(code==='operation_work_limit_exceeded'&&!q.priorUncertain){phase='work-budget-denied';failure=ERR_WORK_BUDGET_DENIED;refresh();return;}
   // Paid daily refusal (same approved definite-refusal class): a KNOWN typed
   // 429 daily_mock_limit_exceeded with no prior uncertainty enters the dedicated
   // daily-limit-denied phase — definite copy, no lock, no Retry, no automatic
   // request/navigation/draft clear. The lockedId and Retry render enumerations
   // intentionally EXCLUDE this phase, so the draft stays editable and no Retry shows.
   if(code==='daily_mock_limit_exceeded'&&!q.priorUncertain){phase='daily-limit-denied';failure=ERR_DAILY_LIMIT_DENIED;refresh();return;}
   // Definite not-saved auth refusals never mark the queue uncertain; a
   // genuine allowance refusal likewise never retroactively marks it.
   if(code==='stale_account'||code==='stale_intent'||UNVERIFIED_CODES.has(code)){phase='failed';failure=ERR_UNVERIFIED;}
   else{
    if(code!=='initial_allowance_exhausted'&&code!=='operation_work_limit_exceeded'&&code!=='daily_mock_limit_exceeded')q.priorUncertain=true;
    phase='failed';failure=ERR_UNAVAILABLE;
   }
   refresh();
  }
 }
 return Object.freeze({
  mount(app){
   if(!app||typeof app.guard!=='function'||typeof app.apply!=='function'||typeof app.refresh!=='function')throw new TypeError('createAccountSave requires an app seam {guard,apply,refresh}');
   if(seam&&seam!==app)invalidate();
   seam=app;
  },
  unmount(){invalidate();seam=null;},
  // Called by the app at Save click, BEFORE the modal await: allocates the
  // queue-time intent over the current owner. Returns false when no private
  // request may start (detached, pending, or not signed-in): the app must
  // then show the sanitized not-saved copy and NEVER fall back silently to
  // the browser-local Save while this controller is attached.
  beginConfirmation(queued){
   if(!seam||phase==='pending')return false;
   if(queue&&queue.queued===queued&&phase==='queued')return true; // same confirmation may re-arm
   if(!(queued&&typeof queued.id==='string'&&queued.id&&typeof queued.route==='string'&&typeof queued.version==='string'&&queued.clone))return false;
   invalidate();
   if(!accountReady())return false;
   try{queue={queued,intent:createMockIntent({session,client,isCurrent:()=>queue!==null&&queue.queued===queued}),committed:false,priorUncertain:false,owner:session.getState()};}catch{invalidate();return false;}
   phase='queued';
   return true;
  },
  // Called from the confirmed dialog accept (the app's own modal guard has
  // already rechecked original ownership and version).
  confirmSave(queued){
   if(!seam||phase==='pending')return false;
   if(!queue||queue.queued!==queued)return false; // cancelled/replaced/superseded: zero private requests
   queue.confirmed=true; // the queue identity finalizes at CONFIRMATION: from
   // here until the outcome resolves, the submitted draft is locked read-only
   // (lockedId below); the unconfirmed queued dialog never locks.
   runSave(queue);
   return true;
  },
  // The retained original capture for keyboard Retry (never newly typed
  // content). null while a submission is pending.
  retained(){return queue&&phase!=='pending'?queue.queued:null;},
  // Explicit Retry activation (the app re-runs the cancel-safe confirmation
  // dialog and calls confirmSave with the retained capture).
  retry(){
   if(!seam||phase==='pending')return false;
   runSave(queue);
   return true;
  },
  // Missing-record resolution (approved policy): the confirmed DISCARD LOCAL
  // DRAFT path. Fully SYNCHRONOUS — every guard is rechecked in-line and the
  // ONLY permitted local mutation (the app's discard seam, a synchronous
  // persist) runs with no await between the final guards and the write. It
  // NEVER calls seam.apply/openSaved and never claims the record is extant:
  // a missing record is not a saved success, so success shows only the
  // local-draft-discard notice. A denied local write keeps the original
  // draft, the queue, the missing phase and the lock, and reports the
  // truthful discard-denied line. Stale queues (replacement, signout, A→B→A
  // new frozen session-state object, detached seam, changed draft) refuse
  // with zero local write.
  discardMissing(queued){
   if(!seam||phase!=='acknowledged-record-missing')return false;
   if(!queue||queue.queued!==queued)return false; // cancelled/replaced/superseded
   if(!queue.committed)return false; // only a committed-then-missing record may be discarded
   if(session.getState()!==queue.owner)return false; // captured identity object, not a mutable uid
   if(typeof seam.discard!=='function')return false;
   if(!seam.guard(queued))return false; // original draft ID + exact version + original route
   let ok=false;
   try{ok=seam.discard(queued)===true;}catch{ok=false;}
   if(ok){invalidate();refresh();return true;}
   refresh();return false;
  },
  // getState() additionally carries the submitted-draft read-only lock
  // identity (Joseph-approved: editing is temporarily locked until the save
  // outcome is resolved): the OPAQUE owned-draft ID while the submission is
  // confirmed but not yet resolved — pending, uncertain/failed (the withheld
  // ERR_UNVERIFIED never locks), acknowledged-result-unavailable or
  // committed-cleanup-pending. null for the unconfirmed queued dialog, a
  // resolved/cancelled/replaced/dropped queue and every unrelated draft; the
  // app applies the lock ONLY to its matching state.draft on the draft
  // routes (never saved-review, never the detached/anonymous app). Exposed
  // via getState so the existing app seam observes it even behind the
  // test-only forwarding wrappers; Retry stays outside the editor.
  getState(){return {phase,failure:failure||null,lockedId:queue&&queue.confirmed&&(phase==='pending'||(phase==='failed'&&failure!==ERR_UNVERIFIED)||phase==='acknowledged-result-unavailable'||phase==='acknowledged-record-missing'||phase==='committed-cleanup-pending'||phase==='acknowledged-resume-pending')?queue.queued.id:null};},
  handleSessionChange(state){
   if(state&&state.status==='signed-in')return;
   // Sign-out/switch/loading: invalidate the owned queue immediately. An
   // already-dispatched commit cannot be undone, but its late receipt must
   // never present (the intent guard above holds).
   invalidate();
   refresh();
  },
  // Rendered by the app inside its existing #messages region for the owning
  // route only. Fixed textContent nodes; the Retry button carries
  // data-act="account-save-retry" so the app's focus identity survives
  // re-renders.
  renderFeedback(container,route){
   if(!seam||!queue||queue.queued.route!==route)return;
   if(phase!=='pending'&&phase!=='failed'&&phase!=='acknowledged-result-unavailable'&&phase!=='acknowledged-record-missing'&&phase!=='committed-cleanup-pending'&&phase!=='acknowledged-resume-pending'&&phase!=='allowance-denied'&&phase!=='work-budget-denied'&&phase!=='daily-limit-denied')return;
   const region=document.createElement('div');
   region.dataset.accountSave='region';
   const line=document.createElement('p');
   if(phase==='pending'){line.className='small';line.dataset.accountSave='status';line.textContent=PENDING;}
   else{line.className='error';line.dataset.accountSave='error';line.textContent=failure;}
   region.append(line);
   // Allowance denial (approved): the resolved definite refusal shows ONLY the
   // explicit denial line on the original route. No Retry (an identical re-send
   // can only be refused again by the backend contract), no lock, no Discard,
   // no success/detail/navigation — and editing stays available because the
   // lockedId predicate above intentionally excludes this phase.
   if(phase!=='allowance-denied'&&(phase==='failed'||phase==='acknowledged-result-unavailable'||phase==='acknowledged-record-missing'||phase==='committed-cleanup-pending'||phase==='acknowledged-resume-pending')){
    const retry=document.createElement('button');
    retry.type='button';retry.dataset.act='account-save-retry';retry.textContent='Retry save this mock to your account';
    region.append(retry);
   }
   // Missing-record resolution (approved): the explicit Discard local draft
   // action lives INSIDE the controller region — deliberately outside the
   // locked editor, so the read-only draft lock never traps it. It opens the
   // app's own cancel-safe discard dialog; nothing here mutates or requests.
   if(phase==='acknowledged-record-missing'){
    const discard=document.createElement('button');
    discard.type='button';discard.dataset.act='account-save-discard';discard.textContent='Discard local draft';
    region.append(discard);
   }
   container.append(region);
  },
 });
}
