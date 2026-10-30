const failure=code=>Object.assign(new Error('Private intent is no longer current'),{code});
export function createMockIntent({session,client,isCurrent=()=>true}){
 const owner=session.getState();if(owner.status!=='signed-in')throw failure('authentication_required');let active=true;
 const current=()=>{if(session.getState()!==owner)throw failure('stale_account');let valid=false;try{valid=active&&isCurrent()===true}catch{}if(!valid)throw failure('stale_intent')};
 return Object.freeze({...Object.fromEntries(['getUsage','listMocks','getMock','commitMock','updateReviews','deleteMock'].map(method=>[method,async(...args)=>{current();let reply;try{reply=await client[method](...args)}catch(error){current();throw error}current();return Object.freeze({data:reply.data,apply:callback=>{current();return reply.apply(callback)}})}])),invalidate:()=>{active=false}});
}
