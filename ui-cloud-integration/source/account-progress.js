// account-progress.js — dedicated, small account-connected Progress raw-score
// analytics controller (account-analytics-first-slice-contract.md).
// Lifecycle is deliberately SEPARATE from account-history.js: History owns a
// manually paginated mounted list invalidated on unmount, so its items are
// never reused here as an analytics snapshot. This controller owns a COMPLETE
// validated account summary snapshot, built with the accepted guarded
// sequential pagination semantics from account-save.js collectPrior
// (duplicate IDs within/across pages, an empty page with a continuing cursor,
// or ANY repeated cursor refuse partial publication; the snapshot is
// deep-frozen and published atomically only after the LAST page). Those are
// reused as ALGORITHMS only — not account-save's queue or History's view.
// Injected dependencies follow the exact attachAccountHistory session/client
// seam pattern (app.js:266ff) — no new loader, no auto discovery.
// Privacy invariants: rendered via DOM textContent only (safe text); nothing
// here enters state.mocks/used/savedIds, durable storage or recommendations.
// The first block is explicitly "All account-saved results" — it never
// misleadingly inherits the browser-local range/DM filters it ignores; those
// controls stay visibly browser-local-only. Browser-local analytics unchanged.
// No backend changes, no detail fan-out (the summary DTO
// id/title/provider/dmMode/scores/sjt/loggedAt already feeds the existing
// selectMocks/rawRows semantics; label analytics are deferred — summaries
// carry no reviews).
import {createMockIntent} from '/backend/mock-intent.mjs';
import {selectMocks,rawRows} from '/progress.js';

const DEFAULT_LIMIT=10;
const LABEL='Account-saved (fictional emulator data)';
const SCOPE='All account-saved results · date logged, oldest first. The mock-range and DM filters below apply to your browser-local results only.';
const LOADING='Loading account-saved results…';
const EMPTY='No account-saved mocks on this test account yet.';
const ERR_UNAVAILABLE='Account-saved analytics are temporarily unavailable. Your browser-local results are unchanged.';
const ERR_REFUSED='The account record pages were inconsistent. No partial account analytics are shown. Your browser-local results are unchanged.';
const RETRY_LABEL='Retry account analytics';
const deepFreeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(deepFreeze);Object.freeze(value);}return value;};

export function createAccountProgress({session,client,pageSize=DEFAULT_LIMIT}={}){
 if(!session||typeof session.getState!=='function')throw new TypeError('createAccountProgress requires an injected session');
 if(!client||typeof client.listMocks!=='function')throw new TypeError('createAccountProgress requires an injected client with listMocks');
 // Same validated pageSize contract as the accepted history controller.
 if(!Number.isInteger(pageSize)||pageSize<1||pageSize>20)throw new TypeError('createAccountProgress pageSize must be an integer from 1 to 20');
 // slot: the currently mounted Progress slot element, or null after departure.
 // active: the unique view-generation object owning the in-flight snapshot
 // load; every mount element change/session transition invalidates the
 // previous generation. Owner identity + generation are guarded before each
 // dispatch, after every await AND again inside the synchronous apply
 // recheck (same-UID switching replaces the session STATE object even when
 // the uid repeats, so identity is the token, not uid equality).
 let slot=null,active=null;
 const invalidateActive=()=>{const a=active;active=null;if(a)try{a.intent.invalidate()}catch{}};
 const clearSlot=()=>{if(slot)slot.replaceChildren();};
 const node=(tag,ds,value)=>{const n=document.createElement(tag);for(const[k,v]of Object.entries(ds))n.dataset[k]=v;if(value!==undefined)n.textContent=value;return n;};
 function showLoading(view){view.slot.replaceChildren(node('p',{'accountAnalytics':'status'},LOADING));}
 // Typed, sanitized failure surface: explicit Retry ONLY — no automatic
 // repeated loads (retry happens solely on user activation while this exact
 // generation is still current). 'refused' distinguishes a partial-
 // publication refusal from a transport/list failure. No raw response or
 // network detail is ever forwarded.
 function showError(view,refused){
  const box=document.createElement('div');
  box.replaceChildren(node('p',{'accountAnalytics':refused?'refused':'error'},refused?ERR_REFUSED:ERR_UNAVAILABLE));
  const retry=node('button',{'accountAnalytics':'retry'},RETRY_LABEL);
  retry.type='button';
  retry.addEventListener('click',()=>{if(active===view)startLoad();});
  box.append(retry);
  view.slot.replaceChildren(box);
 }
 // Atomic COMPLETE-snapshot publication: only the full frozen snapshot from
 // the last page reaches the DOM. Loading and failure states never render an
 // empty or partial list as if it were the complete account history.
 function showComplete(view,snapshot){
  const rows=rawRows(selectMocks(snapshot.summaries,'all','both'));
  const section=node('section',{'accountAnalytics':'section'});
  section.setAttribute('aria-labelledby','account-analytics-heading');
  const heading=node('h2',{'accountAnalytics':'label'},LABEL);
  heading.id='account-analytics-heading';
  const scope=node('p',{'accountAnalytics':'scope'},SCOPE);
  section.append(heading,scope);
  if(rows.length===0){section.append(node('p',{'accountAnalytics':'empty'},EMPTY));}
  else for(const m of rows){
   const row=node('article',{'accountAnalytics':'row'});
   row.dataset.id=m.id;
   row.append(node('h3',{'accountAnalytics':'title'},m.title||'Untitled mock'));
   row.append(node('p',{'accountAnalytics':'meta'},`Logged ${new Date(m.loggedAt).toLocaleDateString('en-GB')}`));
   const dl=document.createElement('dl');
   for(const s of ['VR','DM','QR']){
    const wrap=document.createElement('div');
    wrap.append(node('dt',{},s));
    wrap.append(node('dd',{'accountAnalytics':'raw','section':s},m[s]?`${m[s].earned} / ${m[s].max}`:'Not recorded'));
    if(s==='DM')wrap.append(node('dd',{'accountAnalytics':'dm-mode'},m.dmMode==='questions'?'Question-count · simple':m.dmMode==='weighted'?'Weighted / partial credit · complex':'Mode not recorded'));
    dl.append(wrap);
   }
   row.append(dl);
   section.append(row);
  }
  view.slot.replaceChildren(section);
 }
 async function load(view){
  showLoading(view);
  const summaries=[],seen=new Set(),seenCursors=new Set();
  let cursor=null;
  for(;;){
   let reply;
   try{reply=await view.intent.listMocks({limit:pageSize,after:cursor});}
   catch(error){if(active!==view)return;showError(view,false);return;}
   if(active!==view)return; // obsolete generation: never present.
   let page;
   try{page=reply.apply(()=>reply.data);} // synchronous apply rechecks owner identity + generation.
   catch{if(active!==view)return;showError(view,false);return;}
   if(active!==view||!page||!Array.isArray(page.items))return;
   const list=page.items,ids=list.map(item=>item.summary.id);
   // Conservative refusals (accepted collectPrior semantics applied to the
   // analytics publication): duplicate IDs within or across pages, an empty
   // page while a cursor continues, or a cursor seen anywhere earlier
   // (A→B→A cycles) refuse the WHOLE snapshot — a partial or looping
   // snapshot is never published as if it were complete history.
   if(new Set(ids).size!==ids.length||list.some(item=>seen.has(item.summary.id))||(!list.length&&page.nextCursor)){showError(view,true);return;}
   for(const id of ids)seen.add(id);
   for(const item of list)summaries.push(item.summary);
   if(page.nextCursor===null)break;
   if(seenCursors.has(page.nextCursor)){showError(view,true);return;}
   seenCursors.add(page.nextCursor);
   cursor=page.nextCursor;
  }
  if(active!==view)return; // final guard before synchronous publication.
  showComplete(view,deepFreeze({summaries}));
 }
 function startLoad(){
  invalidateActive();
  if(!slot)return;
  if(session.getState().status!=='signed-in'){clearSlot();return;} // no account: no UI, no request.
  const view={slot,intent:null};
  try{view.intent=createMockIntent({session,client,isCurrent:()=>active===view});}catch{clearSlot();return;}
  active=view;
  load(view);
 }
 return Object.freeze({
  // Re-mounting the SAME live element with a current generation is a no-op
  // (the app lifecycle calls mount on every Progress re-render while the
  // route stays); any element change, or mounting after a departure, starts
  // a fresh owning generation — mirroring the accepted History lifecycle.
  mount(element){
   if(!(element instanceof Element))return;
   if(slot===element&&active)return;
   invalidateActive();
   slot=element;
   startLoad();
  },
  unmount(){invalidateActive();clearSlot();slot=null;},
  handleSessionChange(state){
   if(state&&state.status==='signed-in'){if(slot)startLoad();return;}
   // loading/signed-out/error (switch, logout, same-UID restoration): clear
   // the private display immediately; a fresh signed-in state reloads under
   // a NEW generation, so held obsolete requests can never be published.
   invalidateActive();clearSlot();
  },
 });
}
