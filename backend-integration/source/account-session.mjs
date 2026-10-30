export function createAccountSession({verifySession,onChange=()=>{}}){
 let generation=0,currentUser=null;
 let state=Object.freeze({status:'signed-out',uid:null,error:null});
 const publish=(status,uid=null,error=null)=>{state=Object.freeze({status,uid,error});onChange(state)};
 return {getState:()=>state,runPrivate:async operation=>{
  if(state.status!=='signed-in'||!currentUser)throw Object.assign(new Error('Verified sign-in required'),{code:'authentication_required'});
  const owner=generation,uid=state.uid,user=currentUser;
  const stale=()=>owner!==generation;
  const obsolete=()=>Object.assign(new Error('Account changed during private request'),{code:'stale_account'});
  try{
   const token=await user.getIdToken();
   if(stale())throw obsolete();
   const result=await operation({uid,token});
   if(stale())throw obsolete();
   return result;
  }catch(error){if(stale())throw obsolete();throw error}
 },setAccount:async user=>{
  const owner=++generation;currentUser=null;
  if(!user){publish('signed-out');return}
  publish('loading');
  const expectedUid=user.uid;
  try{
   if(typeof expectedUid!=='string'||!expectedUid)throw new Error('Invalid client identity');
   const token=await user.getIdToken();
   if(owner!==generation)return;
   const identity=await verifySession(token);
   if(owner!==generation)return;
   if(identity?.uid!==expectedUid)throw new Error('Verified identity mismatch');
   currentUser=user;publish('signed-in',identity.uid);
  }catch{if(owner===generation)publish('error',null,'authentication_failed')}
 }};
}
