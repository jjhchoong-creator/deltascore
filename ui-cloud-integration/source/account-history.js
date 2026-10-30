// account-history.js — stage-owned History account catalogue LIST + DETAIL
// controller for the account-history contract, extended by the GPT-approved
// account-review-edit contract for QUESTION-REVIEW editing only. Emulator-only,
// explicitly injected; never touches app state, the browser-local storage
// blob, state.mocks/state.used, drafts, navigation, persistence or
// celebration. Catalogue summaries are NEVER merged into local state and are
// never treated as full saved records. No session object / no signed-in
// account means no account UI and zero private requests. All private text is
// rendered with textContent (fixed projection, no HTML injection); failures
// are sanitized typed copy, never raw transport detail. Ownership follows the
// accepted contract: createMockIntent over the SAME injected session with a
// pure synchronous unique-view-token predicate, invalidated on
// departure/detach, cleared immediately on loading/logout/switch (including
// same-UID restoration) and rechecked at synchronous apply. Backend order is
// opaque document-ID cursor order; pages are appended, never re-sorted.
// DETAIL vertical: rows carry a native Open button (literal summary id) that
// fetches the ACTUAL full saved record through the accepted same-session
// createMockIntent.getMock and renders a fixed read-only projection
// (title/provider/loggedAt/raw scores+mode/optional SJT/note/question
// reviews). Full detail is NEVER derived from the summary and never merged
// into state.mocks/localStorage; no score conversion is invented; no
// edit/delete/save controls exist. Detail is a History-slot subview with its
// own per-selection ownership token in addition to the view generation;
// every departure/replacement/detach/logout/switch (including same-UID)
// invalidates selections and clears ALL private DOM. Back stays available
// during loading/error and returns via a FRESH list load under a new list
// ownership token (safe explicit decision). Stale detached Open/Retry/Back
// controls send no private network (active-view + active-selection guards).
import {createMockIntent} from '/backend/mock-intent.mjs';
import {estimatedMock} from '/estimated-score.js';
import {types,reasons} from '/catalogue.js';

const LABEL='Account-saved mocks (fictional emulator data)';
const EMPTY='No mocks are saved on this account yet.';
const LOADING='Loading account-saved mocks…';
const ERR_UNAVAILABLE='The account catalogue is temporarily unavailable. Your browser-local history is unchanged.';
const ERR_UNVERIFIED='Account access could not be verified. No account catalogue is shown.';
const DETAIL_LOADING='Loading saved mock…';
// Review-edit first vertical (account-review-edit-extension-contract.md §8):
// existing questions' thinking/instead/free text only; every other review
// key is preserved verbatim from the actual getMock snapshot. Explicit Save
// only; one PATCH at a time with the exact captured If-Match version; the
// draft is tab-local DOM state, never localStorage, and cleared with the
// slot on departure/switch/logout. No acknowledgement/confetti seam.
const EDIT_LABEL='Edit question reviews';
const SAVE_LABEL='Save question reviews';
const CANCEL_LABEL='Cancel';
const EDIT_CLARIFY='Saved scores stay fixed. Typing review text here is not a reviewed mark; no new mock is saved and no allowance is used.';
const EDIT_ERR='This review edit could not be saved. Your typing is kept. Use "Save question reviews" again to retry.';
// Conflict-specific sanitized copy (re4): a real competing revision does
// NOT authorize overwriting newer server reviews; typing is retained and
// reloading is an explicit, native-confirm, cancel-safe action only.
const EDIT_CONFLICT='Someone else changed these reviews on the account while you were editing. Your typing is kept here. Nothing was replaced automatically and the newer review content has NOT been overwritten. Use "Reload reviews from the account" to fetch the actual newest content, or keep editing: Save will report this conflict again while your version is out of date.';
const RELOAD_LABEL='Reload reviews from the account';
const RELOAD_CONFIRM='Reloading discards your current typing in this editor. Your unsaved typing will not be kept. Reload the newer reviews from the account?';
// Uncertain outcome (re6): the PATCH may or may not have reached the
// account (network/503/ambiguous transport). The client can only report
// uncertainty truthfully — never 'saved', never a definite 'not saved' —
// while the exact submitted version+payload are frozen for an explicit
// retry, and reconciliation stays available through the cancel-safe reload.
const EDIT_UNCERTAIN='We could not confirm whether this review edit reached the account. Your submitted text stays locked below and is not lost: it is kept separately from any newer draft. Use \"Retry the submitted attempt\" to resubmit this exact captured version and content — the account already holds it, if it arrived, so an identical retry cannot duplicate or double-count the work — or use \"Reload reviews from the account\" to reconcile with what is actually stored. Nothing is resent automatically.';
const RETRY_UNCERTAIN_LABEL='Retry the submitted attempt';
// AD1 later-question addition (extension contract §Vertical 3, addition
// semantics note §1/§2): the account editor may append NEW incorrect-question
// review identities to the editor-owned draft. Reuse the existing browser-
// local validation messages verbatim; canonical new object per §1 with
// format:'guided' (direction-set engineering default for this first
// account-add vertical; the existing editor renderer exposes all three text
// fields). Adding/typing sends no write and marks nothing reviewed. No
// weighted-mark upper bounds are derived (settled §6 parent resolution).
const ADD_CLARIFY='Add an incorrect-question review here. Adding or typing marks nothing as reviewed and sends nothing to the account until you press "Save question reviews"; saved scores, identity and dates never change.';
const ADD_ERR_NUMBER='Enter a positive whole question number.';
const ADD_ERR_DUP='That question is already selected.';
const ADD_SECTION_LABEL='Incorrect-question section';
const ADD_NUMBER_LABEL='Question number';
const ADD_BUTTON_LABEL='Add question';
// mk1 explicit per-question reviewed mark (extension contract §Vertical 3,
// addition semantics note §5.3): the ONLY reviewed-flag mechanism mirrors the
// accepted browser-local 'mark' semantics {...q,reviewed,confirmed:reviewed}
// (app.js:692). Typing/adding/opening never marks; there is no separate
// confirmed control and no label catalogs in this slice.
const MARK_LABEL='Mark reviewed';
// lb1 per-question labels (extension contract §Vertical 3 labels step,
// addition semantics note §§1/4/6): reuse the existing browser-local review
// renderer semantics verbatim (app.js review ≈681 + reviewChange ≈694–700).
// Labels are catalogue values imported directly from /catalogue.js — no new
// taxonomy or invented copy. A type change never re-renders and mirrors
// q.confirmed=!!q.reviewed (editing labels NEVER marks reviewed); a reason
// toggle dedups through a Set, mirrors confirmed and re-renders so the
// conditional Other field follows the existing 'other' rule (shown only when
// a stored reason lowercases to 'other'; hiding never erases its text). SJT
// has no error-reason labels (reasons.SJT is empty in the catalogue). All
// edits live only on the editor-owned clone until the explicit Save.
const TYPE_LABEL='Question type · choose one';
const TYPE_BLANK='No question type selected';
const REASONS_LEGEND='Error reasons · choose any that apply';
const SJT_NO_REASONS='SJT has no error-reason labels.';
const OTHER_LABEL='Other reason · optional';
// Codes whose server-side effect cannot be observed from the client: the
// request may have committed before the reply was lost (contract §14:
// network/503/422 ambiguity stays uncertain until a real acknowledgement
// or readback settles it).
const UNCERTAIN_CODES=new Set(['request_failed','storage_unavailable','authentication_unavailable','operation_work_limit_exceeded']);

const EDIT_FIELDS=['thinking','instead','free'];
const editKey=q=>`${q.section}:${Number(q.number)}`;
const ERR_DETAIL_UNAVAILABLE='This saved mock is temporarily unavailable. Your browser-local history is unchanged.';
const ERR_DETAIL_UNVERIFIED='Account access could not be verified. This saved mock is not shown.';
const UNVERIFIED_CODES=new Set(['authentication_required','invalid_authentication','email_verification_required']);
const DEFAULT_LIMIT=10;

export function createAccountHistory({session,client,pageSize=DEFAULT_LIMIT}={}){
 if(!session||typeof session.getState!=='function')throw new TypeError('createAccountHistory requires an injected session');
 if(!client||typeof client.listMocks!=='function')throw new TypeError('createAccountHistory requires an injected client with listMocks');
 // Optional harness-supplied test configuration (contract §11): validated
 // integer 1..20; anything else is rejected before any intent/network work.
 if(!Number.isInteger(pageSize)||pageSize<1||pageSize>20)throw new TypeError('createAccountHistory pageSize must be an integer from 1 to 20');
 // slot: the currently mounted History slot element, or null after departure.
 // active: the unique immutable-token view object owning the in-flight loads;
 // every mount/session transition allocates a fresh one and invalidates the old.
 // Subview ownership: view.subview tracks WHICH list-owned surface is current
 // ('list' or 'detail') INSIDE the same view generation. openDetail switches
 // to 'detail' without replacing `active`, so list-owned controls (row Open,
 // Load more) and late list-load results must check the subview too: a
 // retained/detached list control or a held late page reply may never act on
 // or replace an opened detail within the same live view.
 let slot=null,active=null,refocusRetry=false;
 // Selection ownership: unique per-selection token besides the view
 // generation; only the LAST selected record may render (overlapping
 // selections: an obsolete held reply is discarded, never presented).
 let selSeq=0,activeSel=null;
 let autoOpen=null; // queued programmatic open {owner,id} (account-save seam)
 const invalidateActive=()=>{activeSel=null;const a=active;active=null;if(a)try{a.intent.invalidate()}catch{}};
 const listCurrent=view=>active===view&&activeSel===null;
 const clearSlot=()=>{if(slot)slot.replaceChildren();};
 const el=(tag,kind,text)=>{const node=document.createElement(tag);node.dataset.accountHistory=kind;node.textContent=text;return node;};
 function showError(view,error){
  const code=error&&typeof error.code==='string'?error.code:'';
  const hadFocus=view.slot.contains(document.activeElement);
  const retry=document.createElement('button');
  retry.type='button';retry.dataset.accountHistory='retry';retry.textContent='Retry';
  // Synchronous restart (accepted account-access pattern): load(view) clears
  // the stale error through showLoading before its first await; the
  // active-view guard and refocusRetry-driven refocus are retained.
  retry.addEventListener('click',()=>{if(active!==view)return;refocusRetry=true;load(view);});
  view.slot.replaceChildren(sectionShell(view,el('p','error',UNVERIFIED_CODES.has(code)?ERR_UNVERIFIED:ERR_UNAVAILABLE),retry));
  if(hadFocus||refocusRetry)retry.focus({preventScroll:true});
  refocusRetry=false;
 }
 const sectionShell=(view,...children)=>{
  const section=document.createElement('section');
  section.dataset.accountHistory='section';
  const heading=document.createElement('h2');
  heading.dataset.accountHistory='heading';heading.textContent=LABEL;
  section.append(heading,...children);
  return section;
 };
 function rowNode(view,item){
  const row=document.createElement('div');
  row.className='row saved-mock-row';row.dataset.accountHistory='row';
  // Literal IDs are preserved internally as data attributes; identity is
  // never inferred from a title/index.
  row.dataset.accountHistoryId=item.summary.id;
  const textWrap=document.createElement('div');
  const strong=document.createElement('strong');
  strong.dataset.accountHistory='title';strong.textContent=item.summary.title||'Untitled mock';
  const meta=document.createElement('p');
  meta.dataset.accountHistory='meta';
  meta.textContent=`${item.summary.provider?item.summary.provider+' · ':''}Logged ${new Date(item.summary.loggedAt).toLocaleDateString('en-GB')}`;
  textWrap.append(strong,meta);
  // Native Open control: keyboard-operable button carrying the literal
  // summary id through closure (never inferred from title/index).
  const open=document.createElement('button');
  open.type='button';open.dataset.accountHistory='open';open.textContent='Open';
  open.addEventListener('click',()=>{if(!listCurrent(view))return;openDetail(view,item.summary.id,false);});
  const summary=document.createElement('div');summary.className='saved-mock-summary';
  const score=el('p','score','');score.className='saved-mock-score';
  const value=document.createElement('strong');
  const total=estimatedMock(item.summary).total;value.textContent=total===null?'Unavailable':`${total} / 2700`;
  score.append(value);summary.append(score,open);
  row.append(textWrap,summary);
  return row;
 }
 const para=(kind,text)=>{const n=document.createElement('p');n.dataset.accountHistory=kind;n.textContent=text;return n;};
 // Detail shell keeps a keyboard-operable Back available during loading,
 // error AND success; Back reloads the account list under a FRESH view/
 // ownership token via startLoad (invalidateActive first).
 function detailShell(view,sel,...children){
  const section=sectionShell(view,para('detail-readonly','Saved scores stay fixed. Question reviews are editable here; saved scores, identity, dates and the mock note never change, and no new mock is saved.'));
  const back=document.createElement('button');
  back.type='button';back.dataset.accountHistory='back';back.textContent='Back to account list';
  back.addEventListener('click',()=>{if(active!==view||activeSel!==sel)return;startLoad();});
  section.append(back,...children);
  return section;
 }
 const selCurrent=(view,sel)=>active===view&&activeSel===sel;
 function showDetailLoading(view,sel){
 sel.surface={owner:sel,kind:'loading'}; // newest surface owns this selection
 view.slot.replaceChildren(detailShell(view,sel,para('detail-status',DETAIL_LOADING)));
}
 // Fixed read-only projection of the ACTUAL returned full record only.
 function showDetail(view,sel,mock){
  // Surface ownership: this render becomes the selection's current surface;
  // any retained/detached older editor or detail cannot act or replace it
  // (review-edit safety contract: invalidate on close/replace/success).
  const surface={owner:sel,kind:'detail'};
  sel.surface=surface;
  const detail=document.createElement('div');
  detail.dataset.accountHistory='detail';
  detail.dataset.accountHistoryId=mock.id; // literal id preserved
  const title=document.createElement('h3');
  title.dataset.accountHistory='detail-title';title.textContent=mock.title||'Untitled mock';
  const meta=para('detail-meta',`${mock.provider?mock.provider+' · ':''}Logged ${new Date(mock.loggedAt).toLocaleDateString('en-GB')}`);
  const mode=para('detail-mode',`DM mode: ${mock.dmMode}`);
  detail.append(title,meta,mode);
  for(const s of ['VR','DM','QR'])detail.append(para('detail-score',`${s}: ${mock.scores[s].earned} / ${mock.scores[s].max}`));
  detail.append(para('detail-sjt',mock.sjt===null?'SJT: not recorded':`SJT: ${mock.sjt.earned} / ${mock.sjt.max}`));
  detail.append(para('detail-note',mock.note));
  for(const q of mock.reviews){
   const r=document.createElement('p');r.dataset.accountHistory='detail-review';
   const reasons=[...new Set(q.reasons||[])].filter(Boolean);
   r.textContent=`${q.section} · Question ${Number(q.number)}`+(q.thinking?` · Thinking: ${q.thinking}`:'')+(q.instead?` · Instead: ${q.instead}`:'')+(q.free?` · Reflection: ${q.free}`:'')+(q.type?` · Question type: ${q.type}`:'')+(reasons.length?` · Error reasons: ${reasons.join(', ')}`:'')+(q.other?` · Other reason: ${q.other}`:'');
   detail.append(r);
  }
  // Review-edit first vertical: native keyboard-operable control on the
  // ACTUAL getMock receipt's detail (never derived from summaries).
  // Surface ownership: a RETAINED detached older detail's Edit may not
  // replace the selection's current surface (re3).
  const edit=document.createElement('button');
  edit.type='button';edit.dataset.accountHistory='edit-reviews';edit.textContent=EDIT_LABEL;
  edit.addEventListener('click',()=>{if(!selCurrent(view,sel)||sel.pending||!sel.snapshot)return;if(sel.surface!==surface)return;showEditor(view,sel);});
  detail.append(edit);
  view.slot.replaceChildren(detailShell(view,sel,detail));
}
// Editor is seeded ONLY from the retained actual getMock snapshot. Typing
// lives in the DOM (tab-local memory); nothing is persisted to localStorage
// and no other review key is touched.
const editFieldSel=(section,number,field)=>`[data-account-history="edit-field"][data-section="${section}"][data-number="${number}"][data-field="${field}"]`;
const editFieldLabel=f=>f==='thinking'?'Thinking':f==='instead'?'What to do instead':'Reflection';
function collectDraftValues(root){
 const values={};
 for(const t of root.querySelectorAll('[data-account-history="edit-field"]')){
  const key=`${t.dataset.section}:${Number(t.dataset.number)}`;
  (values[key]??={})[t.dataset.field]=t.value;
 }
 return values;
}
function collectReviews(draftArr,root){
 return draftArr.map(q=>{
  const c=structuredClone(q);
  for(const f of EDIT_FIELDS){
   const t=root.querySelector(editFieldSel(q.section,String(Number(q.number)),f));
   if(t)c[f]=t.value;
  }
  return c;
 });
}
// AD1: browser-local positive-whole-number + normalized identity validation,
// reusing the EXACT existing messages (addition semantics note §2/§5.2).
// Identity is section+':'+Number(number); no weighted-mark upper bounds.
function addErrorFor(draftArr,section,raw){
 if(!raw||!Number.isInteger(Number(raw))||Number(raw)<1)return ADD_ERR_NUMBER;
 const id=`${section}:${Number(raw)}`;
 return draftArr.some(q=>editKey(q)===id)?ADD_ERR_DUP:'';
}
function showEditor(view,sel,{values=null,error=false,conflict=false,uncertain=null,draftArr=null,addError=''}={}){
 const base=sel.snapshot;if(!base)return;
 // Unique per-editor surface ownership (review-edit safety slice re3): the
 // selection can stay current across Cancel/reopen/successful Save, so
 // outer view/selection checks alone cannot make a RETAINED DETACHED old
 // form inert. This token replaces sel.surface: every handler and late
 // callback of THIS editor must still find itself as the current surface.
 const surface={owner:sel,kind:'editor'};
 sel.surface=surface;
 const surfaceCurrent=()=>selCurrent(view,sel)&&sel.surface===surface;
 // AD1 editor-owned draft: a PRIVATE clone of the actual saved review array.
// The saved snapshot sel.snapshot is NEVER mutated before an acknowledged
// PATCH; additions/typing live only here until dispatch clones the complete
// current draft. In uncertain mode the FROZEN captured submitted array (its
// own clone) is the row source, never a newer draft.
 const draft=draftArr??(uncertain&&uncertain.reviews?structuredClone(uncertain.reviews):base.mock.reviews.map(q=>structuredClone(q)));
 const form=document.createElement('div');
 form.dataset.accountHistory='editor';form.dataset.accountHistoryId=base.mock.id;
 form.append(para('edit-note',EDIT_CLARIFY));
 if(uncertain)form.append(para('edit-uncertain',EDIT_UNCERTAIN));
 else if(error)form.append(para(conflict?'edit-conflict':'edit-error',conflict?EDIT_CONFLICT:EDIT_ERR));
 // AD1 native labelled adder (incorrect-question review identities). Reuses
 // the existing positive-whole-number/normalized-duplicate refusal messages;
 // adding sends no write and marks nothing reviewed. Inert while pending or
 // uncertain, exactly like the text fields.
 const addWrap=document.createElement('div');
 addWrap.dataset.accountHistory='adder';
 addWrap.append(para('add-note',ADD_CLARIFY));
 const secLabel=document.createElement('label');
 secLabel.dataset.accountHistory='add-label';secLabel.setAttribute('for','uic-add-section');
 secLabel.append(ADD_SECTION_LABEL);
 const secSel=document.createElement('select');
 secSel.id='uic-add-section';secSel.dataset.accountHistory='add-section';
 // SJT offered only when the saved mock actually recorded SJT (settled §6).
 for(const s of ['VR','DM','QR',...(base.mock.sjt?['SJT']:[])])secSel.append(new Option(s,s));
 const numLabel=document.createElement('label');
 numLabel.dataset.accountHistory='add-label';numLabel.setAttribute('for','uic-add-number');
 numLabel.append(ADD_NUMBER_LABEL);
 const numInput=document.createElement('input');
 numInput.id='uic-add-number';numInput.type='text';numInput.inputMode='numeric';numInput.dataset.accountHistory='add-number';
 const errEl=document.createElement('p');
 errEl.dataset.accountHistory='add-error';errEl.setAttribute('role','alert');errEl.textContent=addError||'';
 if(addError){numInput.setAttribute('aria-invalid','true');numInput.setAttribute('aria-describedby','uic-add-error');}
 errEl.id='uic-add-error';
 const addBtn=document.createElement('button');
 addBtn.type='button';addBtn.dataset.accountHistory='edit-add';addBtn.textContent=ADD_BUTTON_LABEL;
 addBtn.addEventListener('click',()=>{
  if(!surfaceCurrent()||sel.pending||uncertain)return;
  const err=addErrorFor(draft,secSel.value,numInput.value);
  if(err){errEl.textContent=err;numInput.setAttribute('aria-invalid','true');numInput.setAttribute('aria-describedby','uic-add-error');return;}
  // Canonical new review object (addition semantics note §1): guided is the
  // direction-set engineering default for this first account-add vertical;
  // reviewed:false/confirmed:false — adding is not a mark. Number is kept as
  // the normalized whole-number string; every other field starts blank/empty.
  draft.push({section:secSel.value,number:String(Number(numInput.value)),format:'guided',thinking:'',instead:'',free:'',type:'',reasons:[],other:'',reviewed:false,confirmed:false});
  showEditor(view,sel,{values:collectDraftValues(form),draftArr:draft,error:false,conflict:false,uncertain:null});
 });
 if(addError)numInput.value='';
 const addControls=[secSel,numInput,addBtn];
 if(sel.pending||uncertain)for(const c of addControls)c.disabled=true;
 secLabel.append(secSel);numLabel.append(numInput);
 addWrap.append(secLabel,numLabel,addBtn,errEl);
 form.append(addWrap);
 for(const q of draft){
  const key=editKey(q);
  // mk1 explicit per-question reviewed mark (extension contract §Vertical 3,
  // addition semantics note §5.3): a native labelled checkbox mirroring the
  // accepted browser-local 'mark' semantics {reviewed,confirmed:reviewed}
  // (app.js:692). It edits ONLY the editor-owned draft row; nothing is sent
  // before the explicit Save. Typing/adding/opening never touch these flags.
  // There is no separate confirmed control (the flags mirror) and no label
  // catalogs in this slice. Inert while pending or uncertain (frozen attempt).
  const markWrap=document.createElement('label');
  markWrap.dataset.accountHistory='edit-mark-label';
  const mark=document.createElement('input');
  mark.type='checkbox';mark.dataset.accountHistory='edit-mark';
  mark.dataset.section=q.section;mark.dataset.number=String(Number(q.number));
  mark.checked=q.reviewed===true;
  mark.addEventListener('change',()=>{
   if(!surfaceCurrent()||sel.pending||uncertain)return;
   q.reviewed=mark.checked;q.confirmed=mark.checked; // canonical mirror
  });
  if(sel.pending||uncertain)mark.disabled=true;
  markWrap.append(mark,MARK_LABEL);form.append(markWrap);
  // lb1 per-question labels (extension contract §Vertical 3 labels step;
  // addition semantics note §§1/4/6): native labelled type select (blank
  // legal) plus existing catalogue reason checkboxes plus the conditional
  // Other text, replaying the accepted browser-local reviewChange semantics
  // (app.js ≈694–700) on the editor-owned draft ONLY. A saved label/reason
  // outside the catalogue is never offered for selection and is never
  // erased: it simply persists verbatim on the clone unless explicitly
  // changed (no silent legacy migration).
  const numId=`${q.section}-${Number(q.number)}`;
  const typeLabel=document.createElement('label');
  typeLabel.dataset.accountHistory='edit-type-label';
  typeLabel.setAttribute('for','uic-type-'+numId);
  typeLabel.append(TYPE_LABEL);
  const typeSel=document.createElement('select');
  typeSel.id='uic-type-'+numId;typeSel.dataset.accountHistory='edit-type';
  typeSel.dataset.section=q.section;typeSel.dataset.number=String(Number(q.number));
  typeSel.append(new Option(TYPE_BLANK,''));
  for(const t of types[q.section]??[])typeSel.append(new Option(t,t));
  typeSel.value=(types[q.section]??[]).includes(q.type)?q.type:'';
  typeSel.addEventListener('change',()=>{
   if(!surfaceCurrent()||sel.pending||uncertain)return;
   // Existing 'type' semantics: the edit never marks; confirmed mirrors the
   // current reviewed flag; no re-render (the conditional Other depends on
   // reasons only, exactly like the browser-local review page).
   q.type=typeSel.value;q.confirmed=!!q.reviewed;
  });
  if(sel.pending||uncertain)typeSel.disabled=true;
  typeLabel.append(typeSel);form.append(typeLabel);
  if(q.section==='SJT'){
   // Existing rule reused verbatim: SJT has no error-reason labels.
   form.append(para('edit-no-reasons',SJT_NO_REASONS));
  }else{
   const reasonSet=document.createElement('fieldset');
   const legend=document.createElement('legend');legend.textContent=REASONS_LEGEND;
   const reasonGrid=document.createElement('div');reasonGrid.className='reason-grid';
   for(const v of reasons[q.section]??[]){
    const rLabel=document.createElement('label');
    rLabel.dataset.accountHistory='edit-reason-label';
    rLabel.dataset.section=q.section;rLabel.dataset.number=String(Number(q.number));
    const rBox=document.createElement('input');
    rBox.type='checkbox';rBox.dataset.accountHistory='edit-reason';
    rBox.dataset.section=q.section;rBox.dataset.number=String(Number(q.number));rBox.dataset.reason=v;
    rBox.checked=(q.reasons??[]).includes(v);
    rBox.addEventListener('change',()=>{
     if(!surfaceCurrent()||sel.pending||uncertain)return;
     // Existing reason semantics: Set-dedup add / filter remove, confirmed
     // mirror, re-render so the conditional Other field follows the stored
     // 'other' rule. Hiding never erases the Other text (it stays on q).
     q.reasons=rBox.checked?[...new Set([...(q.reasons??[]),v])]:(q.reasons??[]).filter(x=>x!==v);
     q.confirmed=!!q.reviewed;
     showEditor(view,sel,{values:collectDraftValues(form),draftArr:draft,error:false,conflict:false,uncertain:null});
    });
    if(sel.pending||uncertain)rBox.disabled=true;
    rLabel.append(rBox,v);reasonGrid.append(rLabel);
   }
   reasonSet.append(legend,reasonGrid);form.append(reasonSet);
   if((q.reasons??[]).some(v=>String(v).toLowerCase()==='other')){
    const otherLabel=document.createElement('label');
    otherLabel.dataset.accountHistory='edit-other-label';
    otherLabel.setAttribute('for','uic-other-'+numId);
    otherLabel.append(OTHER_LABEL);
    const otherTa=document.createElement('textarea');
    otherTa.id='uic-other-'+numId;otherTa.dataset.accountHistory='edit-other';
    otherTa.dataset.section=q.section;otherTa.dataset.number=String(Number(q.number));
    otherTa.value=typeof q.other==='string'?q.other:'';
    otherTa.addEventListener('input',()=>{
     if(!surfaceCurrent()||sel.pending||uncertain)return;
     q.other=otherTa.value; // existing input-listener 'other' semantics; draft only
    });
    if(sel.pending||uncertain)otherTa.disabled=true;
    otherLabel.append(otherTa);form.append(otherLabel);
   }
  }
  for(const f of EDIT_FIELDS){
   const label=document.createElement('label');
   label.dataset.accountHistory='edit-label';
   label.append(`${q.section} · Question ${Number(q.number)} · ${editFieldLabel(f)}`);
   const ta=document.createElement('textarea');
   ta.dataset.accountHistory='edit-field';
   ta.dataset.section=q.section;ta.dataset.number=String(Number(q.number));ta.dataset.field=f;
    const seeded=values&&values[key]&&Object.hasOwn(values[key],f)?values[key][f]:(q[f]??'');
   ta.value=typeof seeded==='string'?seeded:'';
   // Uncertain mode (re6): the submitted attempt is FROZEN — fields locked,
   // memory-only, kept separate from any newer draft (none can be typed).
   if(sel.pending||uncertain)ta.disabled=true;
   label.append(ta);form.append(label);
  }
 }
 const actions=document.createElement('div');
 const save=document.createElement('button');
 save.type='button';save.dataset.accountHistory='edit-save';save.textContent=SAVE_LABEL;
 const cancel=document.createElement('button');
 cancel.type='button';cancel.dataset.accountHistory='edit-cancel';cancel.textContent=CANCEL_LABEL;
 if(sel.pending||uncertain){save.disabled=true;cancel.disabled=true;}
 // Explicit Save only: snapshot/clone the complete reviews array at dispatch
 // with the exact captured version; one PATCH at a time; editing and saving
 // stay disabled while pending so an acknowledgement can never falsely apply
 // over newer typing. The SAME pipeline serves the frozen retry of the
 // captured attempt (re6): no newer form state can leak into it.
 function settleFailure(error,reviews,version){
  // Classify a rejected update for the CURRENT surface (re4 conflict,
  // re6 uncertainty, generic typed-failure otherwise).
  const code=error&&typeof error.code==='string'?error.code:'';
  if(code==='review_conflict'){
   if(uncertain){
    // A conflict on the retry of the ORIGINAL attempt cannot prove whether
    // the first submission landed: the outcome stays uncertain, never a
    // misleading definite-failure claim (re6).
    showEditor(view,sel,{values:collectDraftValues(form),uncertain});
    return;
   }
   showEditor(view,sel,{values:collectDraftValues(form),draftArr:structuredClone(reviews),error:true,conflict:true});
   return;
  }
  if(UNCERTAIN_CODES.has(code)){
   showEditor(view,sel,{values:collectDraftValues(form),uncertain:{reviews:structuredClone(reviews),version}});
   return;
  }
  if(uncertain){
   // U1: a typed refusal of the RETRY of a frozen captured attempt cannot
   // observe whether the ORIGINAL submission committed — even a
   // definite-looking code outside the ambiguous set (e.g. 403
   // initial_allowance_exhausted or any future typed code). Contract §14:
   // the outcome stays truthfully uncertain until a real acknowledgement
   // or the cancel-safe reload readback settles it; no definite-failure
   // renderer may drop the frozen version+payload here.
   showEditor(view,sel,{values:collectDraftValues(form),uncertain});
   return;
  }
  showEditor(view,sel,{values:collectDraftValues(form),draftArr:structuredClone(reviews),error:true});
}
function dispatchUpdate(reviews,version){
 sel.pending=true;save.disabled=true;cancel.disabled=true;
 for(const c of form.querySelectorAll('[data-account-history="add-section"],[data-account-history="add-number"],[data-account-history="edit-add"],[data-account-history="edit-mark"],[data-account-history="edit-type"],[data-account-history="edit-reason"],[data-account-history="edit-other"]'))c.disabled=true;
  const rb=form.querySelector('[data-account-history="edit-retry-uncertain"]');if(rb)rb.disabled=true;
  const rl=form.querySelector('[data-account-history="edit-reload"]');if(rl)rl.disabled=true;
  for(const t of form.querySelectorAll('[data-account-history="edit-field"]'))t.disabled=true;
  view.intent.updateReviews(sel.id,version,reviews).then(reply=>{
   reply.apply(({etag})=>{
    sel.pending=false;
    if(!surfaceCurrent())return; // synchronous recheck: a replaced/closed
    // editor cannot apply a success receipt, celebrate newer state or
    // re-render detail from an old surface.
    delete sel.uncertain;
    sel.etag=etag; // retain the version actually returned by the server
    sel.snapshot={mock:{...sel.snapshot.mock,reviews:structuredClone(reviews)},etag};
    showDetail(view,sel,sel.snapshot.mock); // replaces sel.surface
   });
  }).catch(error=>{
   sel.pending=false;
   if(!surfaceCurrent())return; // a stale detached editor sends nothing further
   // Failure never says saved: the typed snapshot is preserved verbatim and
   // only sanitized copy is shown; retry uses the SAME captured version.
   // A genuine 412 review_conflict (another revision changed) gets
   // conflict-specific copy plus the explicit cancel-safe reload control;
   // no automatic resend, version refresh or server overwrite (re4).
   settleFailure(error,reviews,version);
  });
 }
 save.addEventListener('click',()=>{
  if(!surfaceCurrent()||sel.pending||uncertain||!sel.snapshot)return;
  // AD1: dispatch the CURRENT editor-owned draft (saved rows plus additions),
  // never the untouched saved snapshot; collectReviews clones it and reads
  // only the EDIT_FIELDS text, preserving every other property verbatim.
  dispatchUpdate(collectReviews(draft,form),sel.etag);
 });
 // Cancel before dispatch sends zero writes; the tab-local draft is simply
 // discarded (never cached, never applied later). A RETAINED detached Cancel
 // cannot replace the newer surface either. While an outcome is uncertain
 // Cancel stays disabled: the frozen attempt must not be silently dropped.
 cancel.addEventListener('click',()=>{
  if(!surfaceCurrent()||sel.pending||uncertain||!sel.snapshot)return;
  showDetail(view,sel,sel.snapshot.mock);
 });
 actions.append(save,cancel);
 if(uncertain){
  // Explicit retry of the SAME captured version and payload (re6). Nothing
  // resends automatically; activation is the student's explicit choice.
  // The accepted backend verifies the actual ordered owned review content:
  // if the original attempt landed, this identical retry settles truthfully.
  const retry=document.createElement('button');
  retry.type='button';retry.dataset.accountHistory='edit-retry-uncertain';retry.textContent=RETRY_UNCERTAIN_LABEL;
  if(sel.pending)retry.disabled=true;
  retry.addEventListener('click',()=>{
   if(!surfaceCurrent()||sel.pending||!uncertain)return;
   dispatchUpdate(structuredClone(uncertain.reviews),uncertain.version);
  });
  actions.append(retry);
 }
 if(conflict||uncertain){
  // Explicit safe reload of saved reviews: a NATIVE confirmation must be
  // accepted BEFORE the current typed edits are discarded. Dismissing keeps
  // everything and sends zero requests; confirming GETs the actual current
  // version and the reopened editor saves against exactly that ETag.
  const reload=document.createElement('button');
  reload.type='button';reload.dataset.accountHistory='edit-reload';reload.textContent=RELOAD_LABEL;
  if(sel.pending)reload.disabled=true;
  reload.addEventListener('click',async()=>{
   if(!surfaceCurrent()||sel.pending)return;
   if(!window.confirm(RELOAD_CONFIRM))return; // cancel-safe: typing stays, zero requests
   // Serialize the confirmed reload (re5): the selection is pending and
   // every editor action is disabled WHILE the actual GET is in flight, so
   // later typing can never enter — or be silently overwritten by — the
   // arriving receipt, and repeated activations dispatch zero extra GETs.
   // Back/departure invalidation (selection-owned) stays available.
   sel.pending=true;
   for(const t of form.querySelectorAll('[data-account-history="edit-field"]'))t.disabled=true;
   // AD1 adder, mk1 marks and lb1 label controls ride the same pending
   // serialization: inert while the reload GET is in flight.
   for(const c of form.querySelectorAll('[data-account-history="add-section"],[data-account-history="add-number"],[data-account-history="edit-add"],[data-account-history="edit-mark"],[data-account-history="edit-type"],[data-account-history="edit-reason"],[data-account-history="edit-other"]'))c.disabled=true;
   save.disabled=true;cancel.disabled=true;reload.disabled=true;
   try{
    const reply=await view.intent.getMock(sel.id);
    if(!surfaceCurrent())return; // a replaced/closed editor presents nothing late
    reply.apply(({mock,etag})=>{
     sel.pending=false;
     if(!surfaceCurrent())return; // synchronous apply recheck
     // The confirmed discard happens HERE: the reopened editor is re-seeded
     // from the ACTUAL current receipt, never the typed draft.
     sel.snapshot={mock:structuredClone(mock),etag};
     sel.etag=etag; // subsequent Save uses the reloaded exact current version
     // The confirmed reload reconciles with the ACTUAL stored state: the
     // editor now mirrors exactly what is on the account (re6).
     delete sel.uncertain;
     showEditor(view,sel,{values:null,error:false});
    });
   }catch{
    sel.pending=false;
    if(!surfaceCurrent())return;
    // A failed reload keeps the recovery state, the exact typing and the
    // explicit controls (re5): no misleading success, no loss of the only
    // route back to the newest saved content. An uncertain attempt stays
    // uncertain (re6) — a failed reconciliation proves nothing either way.
    if(uncertain)showEditor(view,sel,{values:collectDraftValues(form),uncertain});
    else showEditor(view,sel,{values:collectDraftValues(form),draftArr:structuredClone(draft),error:true,conflict:true});
   }
  });
  actions.append(reload);
 }
 form.append(actions);
 view.slot.replaceChildren(detailShell(view,sel,form));
}
 function showDetailError(view,sel,error,focusRetry){
  const code=error&&typeof error.code==='string'?error.code:'';
  const hadFocus=view.slot.contains(document.activeElement);
  const retry=document.createElement('button');
  retry.type='button';retry.dataset.accountHistory='retry';retry.textContent='Retry';
  retry.addEventListener('click',()=>{if(!selCurrent(view,sel))return;openDetail(view,sel.id,true);});
  view.slot.replaceChildren(detailShell(view,sel,para('detail-error',UNVERIFIED_CODES.has(code)?ERR_DETAIL_UNVERIFIED:ERR_DETAIL_UNAVAILABLE),retry));
  if(hadFocus||focusRetry)retry.focus({preventScroll:true});
 }
 function openDetail(view,id,focusRetry){
  const sel={view,id,token:++selSeq};
  activeSel=sel; // replaces any prior selection: only the last may render
  showDetailLoading(view,sel);
  loadDetail(view,sel,focusRetry);
 }
 async function loadDetail(view,sel,focusRetry){
  try{
   const reply=await view.intent.getMock(sel.id);
   if(!selCurrent(view,sel))return; // stale view/selection: never present
   reply.apply(({mock,etag})=>{
    if(!selCurrent(view,sel))return; // synchronous apply recheck
    // Retain the actual receipt's full review snapshot plus its opaque etag
    // together, under this selection's ownership (review-edit contract §9).
    sel.snapshot={mock:structuredClone(mock),etag};
    sel.etag=etag;
    delete sel.pending;
    showDetail(view,sel,mock);
   });
  }catch(error){
   if(!selCurrent(view,sel))return; // stale failures cannot replace current UI
   showDetailError(view,sel,error,focusRetry);
  }
 }
 function showList(view){
  const body=document.createElement('div');body.dataset.accountHistory='list';
  for(const item of view.items)body.append(rowNode(view,item));
  view.listEl=body;
  const children=[body];
  if(view.nextCursor!==null){
   const more=document.createElement('button');
   more.type='button';more.dataset.accountHistory='load-more';more.textContent='Load more';
   more.addEventListener('click',()=>{if(!listCurrent(view))return;loadMore(view);});
   view.moreEl=more;children.push(more);
  }else view.moreEl=null;
  view.slot.replaceChildren(sectionShell(view,...children));
 }
 function showEmpty(view){
  view.listEl=null;view.moreEl=null;
  view.slot.replaceChildren(sectionShell(view,el('p','empty',EMPTY)));
 }
 function showLoading(view){view.slot.replaceChildren(el('p','status',LOADING));}
 async function load(view){
  if(active!==view)return;
  view.items=[];view.nextCursor=null;
  showLoading(view);
  try{
   const reply=await view.intent.listMocks({limit:pageSize});
   if(active!==view)return; // stale view: never present.
   reply.apply(data=>{
    if(active!==view)return; // synchronous apply recheck.
    view.items=[...data.items];view.nextCursor=data.nextCursor;
    if(view.items.length===0&&view.nextCursor===null)showEmpty(view);else showList(view);
    // account-save seam: the owned generation's queued programmatic open
    // renders the ACTUAL full record through getMock under the same view
    // ownership (Back/fresh-list semantics unchanged; a foreign or obsolete
    // generation can never reach here).
    if(view.autoOpen&&listCurrent(view)&&typeof view.autoOpen==='string')openDetail(view,view.autoOpen,false);
   });
  }catch(error){
   if(active!==view)return; // stale failures cannot replace the current view.
   showError(view,error);
  }
 }
 async function loadMore(view){
  if(!listCurrent(view)||view.nextCursor===null)return;
  if(view.moreEl)view.moreEl.disabled=true;
  try{
   const reply=await view.intent.listMocks({limit:pageSize,after:view.nextCursor});
   if(!listCurrent(view))return;
   reply.apply(data=>{
    if(!listCurrent(view))return;
    // Append-only: earlier page order is preserved; no re-sorting.
    view.items=[...view.items,...data.items];view.nextCursor=data.nextCursor;
    showList(view);
   });
  }catch(error){
   if(!listCurrent(view))return;
   showError(view,error);
  }
 }
 function startLoad(){
  invalidateActive();
  if(!slot)return;
  if(session.getState().status!=='signed-in'){clearSlot();return;} // no account: no UI, no request.
  const view={slot,intent:null,items:[],nextCursor:null,listEl:null,moreEl:null};
  // account-save first vertical: an explicitly queued programmatic open is
  // bound to the account generation captured when it was queued: under a
  // replacement account the original-account id is never reopened. Consumed
  // exactly once by the first fresh list load of the owning generation.
  if(autoOpen&&autoOpen.owner===session.getState()){view.autoOpen=autoOpen.id;autoOpen=null;}
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
  // Departure/detach invalidates, CLEARS the owned slot DOM, then nulls the
  // slot (accepted lifecycle-repair semantics): an explicit detach while
  // History stays mounted leaves no private row/error/status text, including
  // late held replies and repeated/idempotent detach.
  unmount(){invalidateActive();autoOpen=null;clearSlot();slot=null;},
  handleSessionChange(state){
   if(state&&state.status==='signed-in'){if(slot)startLoad();return;}
   // loading/signed-out/error (switch, logout, same-UID restoration): clear
   // the private display immediately; a fresh signed-in state reloads. A
   // queued programmatic open belongs to the old generation and is dropped.
   invalidateActive();autoOpen=null;clearSlot();
  },
  // account-save first vertical: optional programmatic open-by-literal-ID
  // seam. Queue a read-only open of the ACTUAL saved record after the next
  // fresh list load of THIS account generation (never a browser-local copy,
  // never an id under a replacement account, never while signed out). Safe
  // no-op when History is not mounted: the app calls this right before its
  // own successful-save cleanup renders History.
  openSaved(id){
   if(typeof id!=='string'||!id)return false;
   if(session.getState().status!=='signed-in')return false;
   autoOpen={owner:session.getState(),id};
   // History already mounted with a live list: refresh under a fresh owning
   // generation to consume the queued open now. Otherwise the next mount
   // (the app's own successful-save cleanup render) consumes it.
   if(slot&&listCurrent(active))startLoad();
   return true;
  },
 });
}
