// P2 repeat — pure identity helpers over the real task ledger (no state, no
// storage, no DOM). app.js owns dispatch, focus and status; this module owns
// only the repeat decisions: lazy additive hpRoot for manual occurrences,
// the fresh-instance shape and duplicate lookup. C3 identity is delegated to
// the canonical progress-recommendation helpers — recommendation metadata is
// reused exact and never stripped. Legacy tasks gain hpRoot ONLY inside the
// single successful repeat commit that also creates the fresh instance;
// nothing here runs at load time or migrates stored bytes.
import {addIdentityKeyFromTask} from './progress-recommendation.js';
export function validHpRoot(v){return typeof v==='string'&&v.length>0&&v.length<=128;}
export function repeatRootFor(task,nextRoot){return validHpRoot(task&&task.hpRoot)?task.hpRoot:nextRoot;}
// Fresh occurrence: retains activity text, valid recommendation metadata and
// unknown fields via the copied task; the OLD occurrence's dueDate and
// completionNote are not applicable to a fresh attempt and are omitted.
// No completion timestamp is invented; done:false + shared hpRoot are added.
export function buildRepeatInstance(task,root){const fresh={...task,done:false,hpRoot:root};delete fresh.dueDate;delete fresh.completionNote;return fresh;}
// Stable duplicate identity across ALL pending tasks: matching hpRoot, or —
// for sources whose recommendation metadata is valid — the canonical C3 add
// key (covers entries created by Progress Add that carry no hpRoot).
// Returns the index of the existing pending task, or -1 when a repeat may
// proceed. Same-text manual tasks are never deduplicated by text.
export function repeatDuplicateIndex(tasks,index){
  const s=tasks&&tasks[index];if(!s)return -1;
  const root=validHpRoot(s.hpRoot)?s.hpRoot:null;
  const recKey=addIdentityKeyFromTask(s)||null;
  for(let j=0;j<tasks.length;j++){
    if(j===index)continue;const t=tasks[j];if(!t||t.done!==false)continue;
    if(root&&validHpRoot(t.hpRoot)&&t.hpRoot===root)return j;
    if(recKey&&addIdentityKeyFromTask(t)===recKey)return j;
  }
  return -1;
}
