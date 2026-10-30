import {createHash} from 'node:crypto';
import {validateScores} from './approved-domain.mjs';
import {grantActive,dailyLedger,nextUtcMidnightIso} from './paid-daily-policy.mjs';
const numeric=value=>(typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(Number(value));
const validMark=mark=>mark&&numeric(mark.earned)&&numeric(mark.max);
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,ordered(value[k])])):value;
const key=value=>Buffer.from(value,'utf8').toString('base64url');
function validateReviews(reviews,sjt,code='invalid_mock'){
 const bad=()=>Object.assign(new Error('Invalid question reviews'),{code});
 if(!Array.isArray(reviews))throw bad();
 const seen=new Set();
 for(const q of reviews){
  if(!q||!['VR','DM','QR','SJT'].includes(q.section)||q.section==='SJT'&&!sjt||!numeric(q.number)||!Number.isInteger(Number(q.number))||Number(q.number)<1)throw bad();
  const identity=q.section+':'+Number(q.number);if(seen.has(identity))throw bad();seen.add(identity);
 }
}
function revisionOf(data){const revision=Object.hasOwn(data,'reviewRevision')?data.reviewRevision:0;if(!Number.isSafeInteger(revision)||revision<0)throw new Error('Invalid stored review revision');return revision;}
async function readReviews(transaction,ref,uid,reviewOrder){
 const questions=[];
 for(let start=0;start<reviewOrder.length;start+=16){
  const batch=await Promise.all(reviewOrder.slice(start,start+16).map(id=>transaction.get(ref.collection('reviews').doc(id))));
  for(const q of batch)questions.push(q);
 }
 if(questions.some((q,index)=>{const data=q.data(),review=data?.review;return !q.exists||data.ownerUid!==uid||!review||typeof review!=='object'||Array.isArray(review)||!['VR','DM','QR','SJT'].includes(review.section)||!numeric(review.number)||!Number.isInteger(Number(review.number))||Number(review.number)<1||key(review.section+':'+Number(review.number))!==reviewOrder[index]}))throw new Error('Saved question ownership or content is incomplete');
 return questions.map(q=>q.data().review);
}
function cumulativeUsage(ledger){const used=ledger.exists&&Object.hasOwn(ledger.data(),'used')?ledger.data().used:0;if(!Number.isSafeInteger(used)||used<0)throw Object.assign(new Error('Invalid allowance ledger'),{code:'invalid_allowance_state'});return used;}
// Paid-daily-limit trust adapters (see paid-daily-policy.mjs): malformed/foreign
// grant or ledger daily fields fail closed as storage-level refusals, never as a
// silent fallback to a paid path.
function paidGrantState(snapshot,uid,nowMs){return grantActive(snapshot,uid,nowMs).active;}
function paidGrantUsageState(snapshot,uid,nowMs){return grantActive(snapshot,uid,nowMs);}
function initialDailyLedger(ledger,todayIso,nowMs){return dailyLedger(ledger.exists?ledger.data():{},todayIso,nowMs);}
// Trusted-internal mutation work budget: configurable ONLY at store construction, never per request.
// Defaults are reversible engineering operational bounds (not Firestore/SDK maxima):
// maxReviewDocumentWork=256 review-document work units per mutation transaction,
// maxTransactionAttempts=3 (SDK supports integers >=1; verified in installed
// @google-cloud/firestore validateInteger('transactionOptions.maxAttempts',{optional:true,minValue:1})).
const defaultMaxReviewDocumentWork=256,defaultMaxTransactionAttempts=3;
function validateMutationWorkBudget(budget){
 const bad=message=>{throw Object.assign(new Error(message),{code:'invalid_mutation_work_budget'})};
 if(budget===undefined)return {maxReviewDocumentWork:defaultMaxReviewDocumentWork,maxTransactionAttempts:defaultMaxTransactionAttempts};
 if(!budget||typeof budget!=='object'||Array.isArray(budget))bad('Mutation work budget must be an object');
 const {maxReviewDocumentWork=defaultMaxReviewDocumentWork,maxTransactionAttempts=defaultMaxTransactionAttempts}=budget;
 if(!Number.isSafeInteger(maxReviewDocumentWork)||maxReviewDocumentWork<1)bad('maxReviewDocumentWork must be a positive safe integer');
 if(!Number.isSafeInteger(maxTransactionAttempts)||maxTransactionAttempts<1||maxTransactionAttempts>defaultMaxTransactionAttempts)bad('maxTransactionAttempts must be an integer within the supported SDK range 1-3');
 return {maxReviewDocumentWork,maxTransactionAttempts};
}
export function createMockStore({db,namespace='deltascoreFreshV1',clock=()=>new Date(),mutationWorkBudget=undefined}){
 const budget=validateMutationWorkBudget(mutationWorkBudget),transactionOptions={maxAttempts:budget.maxTransactionAttempts};
 return {list:async(uid,{limit=10,after=null}={})=>{
  const bad=()=>Object.assign(new Error('Invalid catalogue pagination'),{code:'invalid_list_request'});
  if(!Number.isInteger(limit)||limit<1||limit>20)throw bad();
  if(after!==null){if(typeof after!=='string'||after.length>1024||!/^[A-Za-z0-9_-]+$/.test(after)||/[\r\n]/.test(after))throw bad();const decoded=Buffer.from(after,'base64url'),id=decoded.toString('utf8');if(!id||id.length>128||decoded.toString('base64url')!==after||key(id)!==after)throw bad()}
  let query=db.collection(namespace).doc(key(uid)).collection('mocks').orderBy('__name__').limit(limit+1);
  if(after!==null)query=query.startAfter(after);
  const page=await query.get(),selected=page.docs.slice(0,limit);
  return {items:selected.map(doc=>{
   const data=doc.data(),{id,title,provider,dmMode,scores,sjt,loggedAt}=data;
   if(data.ownerUid!==uid||typeof id!=='string'||!id||id.length>128||key(id)!==doc.id||typeof title!=='string'||typeof provider!=='string'||['VR','DM','QR'].some(section=>!validMark(scores?.[section]))||sjt!==null&&!validMark(sjt)||validateScores(data).length||typeof loggedAt!=='string'||!Number.isFinite(Date.parse(loggedAt))||new Date(loggedAt).toISOString()!==loggedAt)throw new Error('Saved catalogue metadata is inconsistent');
   const mark=value=>({earned:value.earned,max:value.max});
   return {summary:{id,title,provider,dmMode,scores:Object.fromEntries(['VR','DM','QR'].map(section=>[section,mark(scores[section])])),sjt:sjt===null?null:mark(sjt),loggedAt},reviewRevision:revisionOf(data)};
  }),nextCursor:page.size>limit?selected[selected.length-1].id:null};
 },getUsage:async(uid)=>{
  const account=db.collection(namespace).doc(key(uid));
  // Consistent snapshot (paid-daily-parent-review.md defect 2): the ledger AND the
  // grant are read in ONE read-only runTransaction — never two bare reads that a
  // concurrent commit could interleave between. Strict owner/state validation,
  // no writes and no document creation: this read must never provision ledger state.
  // Absent/expired grant keeps the EXACT existing shape; a valid active grant appends
  // only the contracted paid fields. Malformed/foreign grant or corrupt daily fields
  // fail closed through the strict validators; genuine read errors propagate.
  return db.runTransaction(async transaction=>{
   const [ledger,grantSnap]=await Promise.all([transaction.get(account),transaction.get(account.collection('entitlements').doc('mock-logs'))]);
   if(ledger.exists&&ledger.data().ownerUid!==uid)throw new Error('Allowance ledger ownership is inconsistent');
   const base={cumulativeLogsUsed:cumulativeUsage(ledger),initialAllowanceLimit:3};
   const now=clock(),nowMs=now.getTime(),todayIso=now.toISOString().slice(0,10);
   const state=paidGrantUsageState(grantSnap,uid,nowMs);
   if(!state.active)return base;
   return {...base,accessSource:'self-paid',dailyAllowanceLimit:12,dailyLogsUsed:dailyLedger(ledger.exists?ledger.data():{},todayIso,nowMs),dailyResetAt:nextUtcMidnightIso(nowMs),accessExpiresAt:state.expiresAt};
  });
 },get:async(uid,id)=>{
  const ref=db.collection(namespace).doc(key(uid)).collection('mocks').doc(key(id));
  return db.runTransaction(async transaction=>{
   const saved=await transaction.get(ref);if(!saved.exists)return null;
   const {ownerUid,reviewOrder,reviewRevision:storedRevision,reviewHash,...record}=saved.data(),reviewRevision=revisionOf(saved.data());
   if(ownerUid!==uid)throw new Error('Saved mock ownership is inconsistent');
   const reviews=await readReviews(transaction,ref,uid,reviewOrder);
   return {mock:{...record,reviews},reviewRevision};
  });
 },updateReviews:async(uid,id,patch,expectedRevision)=>{
  if(!patch||typeof patch!=='object'||Array.isArray(patch)||Object.keys(patch).length!==1||!Object.hasOwn(patch,'reviews'))throw Object.assign(new Error('Only question reviews may change'),{code:'invalid_review_patch'});
  const {reviews}=structuredClone(patch);
  if(!Array.isArray(reviews))throw Object.assign(new Error('Question reviews must be an array'),{code:'invalid_review_patch'});
  const reviewHash=createHash('sha256').update(JSON.stringify(ordered(reviews))).digest('hex'),ref=db.collection(namespace).doc(key(uid)).collection('mocks').doc(key(id));
  return db.runTransaction(async transaction=>{
   const snapshot=await transaction.get(ref);
   if(!snapshot.exists)throw Object.assign(new Error('Saved mock not found'),{code:'mock_not_found'});
   const saved=snapshot.data();if(saved.ownerUid!==uid)throw new Error('Saved mock ownership is inconsistent');
   validateReviews(reviews,saved.sjt,'invalid_review_patch');
   const priorRevision=revisionOf(saved);
   const workLimit=()=>Object.assign(new Error('Operation work budget exceeded'),{code:'operation_work_limit_exceeded'});
   if(saved.reviewHash===reviewHash){
    // Identical-content retry: bound the stored document's work before verifying
    // content, so an over-budget retry refuses without child reads or a false saved reply.
    if(saved.reviewOrder.length>budget.maxReviewDocumentWork)throw workLimit();
    const current=await readReviews(transaction,ref,uid,saved.reviewOrder);
    if(createHash('sha256').update(JSON.stringify(ordered(current))).digest('hex')!==reviewHash)throw new Error('Stored review fingerprint is inconsistent');
    return {id,reviewRevision:priorRevision};
   }
   if(priorRevision!==expectedRevision)throw Object.assign(new Error('Review changed since loading'),{code:'review_conflict'});
   if(priorRevision===Number.MAX_SAFE_INTEGER)throw new Error('Stored review revision exhausted');
   // Replacement conservative upper bound: old-child deletes plus new writes,
   // so a tiny patch cannot delete unbounded prior children. Checked before ANY staged write.
   if(saved.reviewOrder.length+reviews.length>budget.maxReviewDocumentWork)throw workLimit();
   const reviewOrder=reviews.map(q=>key(q.section+':'+Number(q.number))),reviewRevision=priorRevision+1;
   for(const old of saved.reviewOrder)if(!reviewOrder.includes(old))transaction.delete(ref.collection('reviews').doc(old));
   reviews.forEach((review,position)=>transaction.set(ref.collection('reviews').doc(reviewOrder[position]),{review,position,ownerUid:uid}));
   transaction.update(ref,{reviewOrder,reviewRevision,reviewHash});
   return {id,reviewRevision};
  },transactionOptions);
 },remove:async(uid,id,expectedRevision)=>{
  const account=db.collection(namespace).doc(key(uid)),ref=account.collection('mocks').doc(key(id));
  return db.runTransaction(async transaction=>{
   const [snapshot,receipt]=await Promise.all([transaction.get(ref),transaction.get(account.collection('receipts').doc(key(id)))]);
   if(!snapshot.exists&&!receipt.exists)throw Object.assign(new Error('Saved mock not found'),{code:'mock_not_found'});
   const proof=receipt.data();
   if(!proof||proof.ownerUid!==uid||proof.id!==id||typeof proof.requestHash!=='string'||!/^([a-f0-9]{64})$/.test(proof.requestHash))throw new Error('Saved mock receipt is inconsistent');
   if(snapshot.exists&&(snapshot.data().ownerUid!==uid||snapshot.data().id!==id))throw new Error('Saved mock ownership is inconsistent');
   if(snapshot.exists&&revisionOf(snapshot.data())!==expectedRevision)throw Object.assign(new Error('Review changed since loading'),{code:'review_conflict'});
   const childRefs=[],firstPathInit=null;let cursor=null,firstPath=firstPathInit;
   // Bounded traversal: collect at most envelope child refs and probe at most ONE
   // detection sentinel beyond permitted work (page limit min(16, remaining+1)),
   // refusing before ANY staged write once the extra child is observed.
   const envelope=budget.maxReviewDocumentWork;
   for(;;){
    const pageLimit=Math.min(16,envelope-childRefs.length+1);
    let query=ref.collection('reviews').orderBy('__name__').select('ownerUid').limit(pageLimit);
    if(cursor!==null)query=query.startAfter(cursor);
    const page=await transaction.get(query);
    if(page.size>0&&page.docs[0].ref.path===firstPath)throw new Error('Review-child query cursor did not advance');
    for(const question of page.docs){if(question.data().ownerUid!==uid)throw new Error('Saved question ownership is inconsistent');childRefs.push(question.ref);}
    if(childRefs.length>envelope)throw Object.assign(new Error('Operation work budget exceeded'),{code:'operation_work_limit_exceeded'});
    if(page.size<pageLimit)break;
    firstPath=page.docs[0].ref.path;cursor=page.docs[page.docs.length-1];
   }
   for(const question of childRefs)transaction.delete(question);
   transaction.delete(ref);
   return {deleted:true,id};
  },transactionOptions);
 },commit:async(uid,draft)=>{
  draft=structuredClone(draft);
  if(!draft||['VR','DM','QR'].some(s=>!validMark(draft.scores?.[s]))||(draft.sjt!=null&&!validMark(draft.sjt))||validateScores(draft).length)throw Object.assign(new Error('Invalid mock scores'),{code:'invalid_mock'});
  {const {id,title='',provider='',dmMode,scores,sjt=null,reviews=[],note=''}=draft;draft={id,title,provider,dmMode,scores,sjt,reviews,note};}
  const bad=()=>Object.assign(new Error('Invalid mock payload'),{code:'invalid_mock'});
  if(typeof draft.id!=='string'||!draft.id||draft.id.length>128||['title','provider','note'].some(k=>typeof draft[k]!=='string')||!Array.isArray(draft.reviews))throw bad();
  validateReviews(draft.reviews,draft.sjt);
  const requestHash=createHash('sha256').update(JSON.stringify(ordered(draft))).digest('hex');
  const account=db.collection(namespace).doc(key(uid)),id=key(draft.id);
  // Fresh creation only: the trusted grant reference is CONSTRUCTED and READ inside
  // THIS transaction and only AFTER the receipt replay/payload-conflict short-circuit,
  // so matching replays never depend on the grant lookup (paid-daily-parent-review.md
  // defect 1). There is deliberately NO catch: a grant reference-construction or
  // read error fails the fresh creation closed; production never compensates for an
  // incomplete test double by pretending the grant is absent. All grant and ledger
  // reads precede every staged write.
  return db.runTransaction(async transaction=>{
   const [ledger,receipt]=await Promise.all([transaction.get(account),transaction.get(account.collection('receipts').doc(id))]);
   // Defect 3 (paid-daily-parent-review.md): an EXISTING ledger's owner is validated
   // before any fresh write, exactly as getUsage does. A foreign/corrupt owner fails
   // closed as corruption (never silently repaired/overwritten by the merge-set, and
   // never downgraded to an initial-allowance denial) on BOTH fresh creation and
   // replay of a saved record. Absent ledger legitimately has no owner to check.
   if(ledger.exists&&ledger.data().ownerUid!==uid)throw new Error('Allowance ledger ownership is inconsistent');
   const prior=cumulativeUsage(ledger);
   if(receipt.exists){
    if(receipt.data().requestHash!==requestHash)throw Object.assign(new Error('Commit ID belongs to another payload'),{code:'commit_conflict'});
    return {created:false,id:draft.id,used:prior};
   }
   const grantSnap=await transaction.get(account.collection('entitlements').doc('mock-logs'));
   const now=clock(),nowMs=now.getTime(),todayIso=now.toISOString().slice(0,10);
   const paid=paidGrantState(grantSnap,uid,nowMs),dailyUsed=paid?dailyLedger(ledger.exists?ledger.data():{},todayIso,nowMs):initialDailyLedger(ledger,todayIso,nowMs);
   const used=prior+1;
   if(!paid){if(used>3)throw Object.assign(new Error('Initial mock allowance exhausted'),{code:'initial_allowance_exhausted'});}
   else{
    if(!Number.isSafeInteger(used))throw Object.assign(new Error('Allowance ledger overflow'),{code:'invalid_allowance_state'});
    if(dailyUsed+1>12)throw Object.assign(new Error('Daily mock allowance exhausted'),{code:'daily_mock_limit_exceeded',retryAfterSeconds:Math.max(1,Math.ceil((Date.parse(nextUtcMidnightIso(nowMs))-nowMs)/1000))});
   }
   if(draft.reviews.length>budget.maxReviewDocumentWork)throw Object.assign(new Error('Operation work budget exceeded'),{code:'operation_work_limit_exceeded'});
   const {reviews,...metadata}=draft,mockRef=account.collection('mocks').doc(id),reviewOrder=reviews.map(q=>key(q.section+':'+Number(q.number)));
   transaction.create(mockRef,{...metadata,reviewOrder,ownerUid:uid,loggedAt:now.toISOString()});
   reviews.forEach((review,position)=>transaction.create(mockRef.collection('reviews').doc(reviewOrder[position]),{review,position,ownerUid:uid}));
   transaction.create(account.collection('receipts').doc(id),{id:draft.id,ownerUid:uid,requestHash});
   transaction.set(account,{ownerUid:uid,used,dailyLogDate:todayIso,dailyLogsUsed:dailyUsed+1},{merge:true});
   return {created:true,id:draft.id,used};
  },transactionOptions);
 }};
}
