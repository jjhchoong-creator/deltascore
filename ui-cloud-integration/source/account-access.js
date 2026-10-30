// account-access.js — stage-owned account usage controller/presentation for
// the ui-cloud first slice (ui-cloud-first-slice-contract.md decisions 3–5).
// Informational account usage ONLY: never touches app state, the browser-local
// storage blob, state.used/state.mocks, drafts, navigation, persistence or
// celebration. No session object / no signed-in account means no account row
// and zero private requests. All private text is rendered with textContent
// (fixed projection, no HTML injection); failures are sanitized typed copy,
// never raw transport detail. Ownership follows the accepted contract:
// createMockIntent over the SAME injected session with a pure synchronous
// unique-view-token predicate, invalidated on departure/detach, cleared
// immediately on loading/logout/switch (including same-UID restoration) and
// rechecked at synchronous apply.
import {createMockIntent} from '/backend/mock-intent.mjs';

const LOADING='Loading account usage…';
const ERR_UNAVAILABLE='Account usage is temporarily unavailable. Your browser-local records are unchanged.';
const ERR_UNVERIFIED='Account access could not be verified. No account usage is shown.';
const rowText=used=>`Signed-in test account (fictional emulator data): ${used} of 3 mock logs used on this account.`;
// Paid-daily §3: an ACTIVE paid projection renders its OWN approved row; the
// initial-allowance rowText above stays byte-unchanged for unpaid data. The
// cumulative total NEVER resets daily, so it is never framed as the daily
// figure; no clock comparison happens here (a possibly-stale snapshot may
// carry any canonical expiry), only strict shape validation of the full set.
const PAID_KEYS=['accessSource','dailyAllowanceLimit','dailyLogsUsed','dailyResetAt','accessExpiresAt'];
const paidRowText=(daily,total)=>`${daily} of 12 mock logs used today. Resets at midnight UTC. ${total} mock logs saved in total on this account.`;
const canonicalMidnightUtc=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(Date.parse(value)).toISOString()===value;
const canonicalIso=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(Date.parse(value)).toISOString()===value;
// Full paid-contract validation: NO paid field = unpaid initial projection;
// ANY paid field requires the COMPLETE valid active-paid set — a partial,
// wrong-typed, non-canonical or non-midnight-reset record fails closed
// (invalid sanitized error), never a silent fall back to the initial row.
function classifyPaid(data){
 if(!PAID_KEYS.some(key=>Object.hasOwn(data,key)))return{paid:false};
 if(!PAID_KEYS.every(key=>Object.hasOwn(data,key))||data.accessSource!=='self-paid'||data.dailyAllowanceLimit!==12||!Number.isSafeInteger(data.dailyLogsUsed)||data.dailyLogsUsed<0||data.dailyLogsUsed>12||data.dailyLogsUsed>data.cumulativeLogsUsed||!canonicalMidnightUtc(data.dailyResetAt)||!canonicalIso(data.accessExpiresAt))return{paid:true,valid:false};
 return{paid:true,valid:true};
}
const UNVERIFIED_CODES=new Set(['authentication_required','invalid_authentication','email_verification_required']);

export function createAccountAccess({session,client}={}){
 if(!session||typeof session.getState!=='function')throw new TypeError('createAccountAccess requires an injected session');
 if(!client||typeof client.getUsage!=='function')throw new TypeError('createAccountAccess requires an injected client');
 // slot: the currently mounted Settings slot element, or null after departure.
 // active: the unique immutable-token view object owning the in-flight load;
 // every mount/session transition allocates a fresh one and invalidates the old.
 let slot=null,active=null,refocusRetry=false;
 const invalidateActive=()=>{const a=active;active=null;if(a)try{a.intent.invalidate()}catch{}};
 const clearSlot=()=>{if(slot)slot.replaceChildren();};
 const el=(tag,kind,text)=>{const node=document.createElement(tag);node.dataset.accountUsage=kind;node.textContent=text;return node;};
 function showError(view,error){
  const code=error&&typeof error.code==='string'?error.code:'';
  const hadFocus=view.slot.contains(document.activeElement);
  const retry=document.createElement('button');
  retry.type='button';retry.dataset.accountUsage='retry';retry.textContent='Retry';
  // Synchronous restart: the click (including a native keyboard Space
  // activation) has already been dispatched when this listener runs, so
  // replacing the DOM here cannot lose the click. load(view) clears the
  // stale error through showLoading before its first await, so an observer
  // can never resolve the old error node after activation; the active-view
  // guard and refocusRetry-driven refocus on the fresh error are retained.
  retry.addEventListener('click',()=>{if(active!==view)return;refocusRetry=true;load(view);});
  view.slot.replaceChildren(el('p','error',UNVERIFIED_CODES.has(code)?ERR_UNVERIFIED:ERR_UNAVAILABLE),retry);
  if(hadFocus||refocusRetry)retry.focus({preventScroll:true});
  refocusRetry=false;
 }
 function showRow(view,data){
  refocusRetry=false;
  const used=data?.cumulativeLogsUsed;
  if(!Number.isSafeInteger(used)||data?.initialAllowanceLimit!==3){showError(view,{code:'invalid_response'});return;}
  const paid=classifyPaid(data);
  if(paid.paid){
   // Partial/invalid paid projection fails closed to the sanitized error;
   // the initial row is NEVER rendered from paid-shaped data.
   if(!paid.valid){showError(view,{code:'invalid_response'});return;}
   view.slot.replaceChildren(el('p','row',paidRowText(data.dailyLogsUsed,used)));
   return;
  }
  view.slot.replaceChildren(el('p','row',rowText(used)));
 }
 function showLoading(view){view.slot.replaceChildren(el('p','status',LOADING));}
 async function load(view){
  if(active!==view)return;
  showLoading(view);
  try{
   const reply=await view.intent.getUsage();
   if(active!==view)return; // stale view: never present.
   reply.apply(data=>{if(active===view)showRow(view,data);}); // synchronous apply recheck.
  }catch(error){
   if(active!==view)return; // stale failures cannot replace the current view.
   showError(view,error);
  }
 }
 function startLoad(){
  invalidateActive();
  if(!slot)return;
  if(session.getState().status!=='signed-in'){clearSlot();return;} // no account: no row, no request.
  const view={slot,intent:null};
  try{view.intent=createMockIntent({session,client,isCurrent:()=>active===view});}catch{clearSlot();return;}
  active=view;
  load(view);
 }
 return Object.freeze({
  mount(element){
   if(!(element instanceof Element))return;
   invalidateActive();
   slot=element;
   startLoad();
  },
  // Lifecycle repair 2 (lifecycle-review-repairs.md): departure/detach must
  // invalidate, CLEAR the owned slot DOM, then null the slot. An explicit
  // detach while Settings stays mounted must leave no private row/error/
  // status text; ordinary navigation (app re-renders the slot away) is
  // unchanged because the cleared element is discarded either way.
  unmount(){invalidateActive();clearSlot();slot=null;},
  handleSessionChange(state){
   if(state&&state.status==='signed-in'){if(slot)startLoad();return;}
   // loading/signed-out/error (switch, logout, same-UID restoration): clear
   // the private display immediately; a fresh signed-in state reloads.
   invalidateActive();clearSlot();
  },
 });
}
