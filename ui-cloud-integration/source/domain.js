export function validateScores(draft) {
 const errors=['VR','DM','QR'].flatMap(section=>{const s=draft.scores?.[section];return !s || s.earned==='' || s.max==='' || !Number.isFinite(Number(s.earned)) || !Number.isFinite(Number(s.max)) || Number(s.max)<=0 || Number(s.earned)<0 || Number(s.earned)>Number(s.max) ? [`${section}: enter earned marks and a positive maximum (earned cannot exceed maximum).`] : [];});
 if(draft.scores?.DM && (!['questions','weighted'].includes(draft.dmMode) || Number(draft.scores?.DM?.max)!==(draft.dmMode==='weighted'?47:35))) errors.push('DM: maximum must match the selected 35-question or 47-weighted mode.');
 if(draft.sjt && (draft.sjt.earned==='' || draft.sjt.max==='' || !Number.isFinite(Number(draft.sjt.earned)) || !Number.isFinite(Number(draft.sjt.max)) || Number(draft.sjt.max)<=0 || Number(draft.sjt.earned)<0 || Number(draft.sjt.earned)>Number(draft.sjt.max))) errors.push('SJT: enter valid earned / maximum marks, or skip SJT.');
 return errors;
}
export function saveMock(state,draft,date=new Date().toISOString()) {
 if(state.savedIds.includes(draft.id)) return state;
 if(state.used>=3) throw new Error('Browser-local three-mock limit reached.');
 const errors=validateScores(draft);if(errors.length) throw new Error(errors.join(' '));
 return {...state,used:state.used+1,savedIds:[...state.savedIds,draft.id],mocks:[...state.mocks,{...structuredClone(draft),loggedAt:date}]};
}
export function deleteMock(state,id) { return {...state,mocks:state.mocks.filter(m=>m.id!==id)}; }
export function updateSaved(state,id,patch) {
 if(Object.keys(patch).some(k=>k!=='reviews')) throw new Error('Saved mock identity and scores are immutable.');
 return {...state,mocks:state.mocks.map(m=>m.id===id?{...m,reviews:structuredClone(patch.reviews)}:m)};
}
