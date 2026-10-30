// P1 Practice page — PURE PRESENTER over the real task ledger.
// Renders the approved three-card layout (form left, "Practice · To do" upper
// right, "Previously completed" lower right) from state.tasks data passed in
// by app.js. It owns no state, no storage and no listeners: every control
// reuses the app's EXISTING dispatch attributes (data-task-check /
// data-task-text / data-task-meta / data-task-index / data-act="add-task" /
// data-act="remove-task" / data-practice-details), so add, completion,
// editing, task details, removal and the tested failure-recovery path all
// commit through the existing savePractice/persist handlers. No fixture
// store, no hooks, no URL parameters. P2: each completed row carries a quiet
// "Do again" control (data-act="repeat-task" bound to the durable row index
// via data-repeat-index); the repeat commit, identity and duplicate rules are
// owned by app.js + practice-repeat.js, not by this presenter.
export function practicePage({tasks,detail,composer='',esc=(v)=>String(v??''),btn=(l,a,c='',x='')=>`<button type="button" data-act="${a}" class="${c}" ${x}>${l}</button>`,checked=(b)=>b?'checked':''}={}){
  const row=(t,i)=>`<div class="practice-task pp-task"><div class="pp-task-main"><input type="checkbox" aria-label="Mark practice ${i+1} completed" data-task-check="${i}" ${checked(t.done)}><textarea rows="1" class="task-text pp-task-text" aria-label="Edit practice ${i+1}" data-task-text="${i}">${esc(t.text)}</textarea>${btn('×','remove-task','quiet',`data-i="${i}" aria-label="Remove practice ${i+1}"`)}${t.done?btn('Do again','repeat-task','quiet',`data-repeat-index="${i}" aria-label="Do again: ${esc(t.text)}"`):''}</div>${t.dueDate?`<p class="pp-due">Due <time datetime="${esc(t.dueDate)}">${esc(t.dueDate)}</time></p>`:''}${t.completionNote?`<p class="pp-note">Note: <span class="pp-note-text">${esc(t.completionNote)}</span></p>`:''}${detail?detail(t,i):''}</div>`;
  const pending=tasks.map((t,i)=>[t,i]).filter(([t])=>!t.done);
  const completed=tasks.map((t,i)=>[t,i]).filter(([t])=>t.done);
  return `<div class="pp-view pp-view-practice">
    <p class="pp-view-nav">${btn('Back to Home','home','quiet')}</p>
    <h1>Add practice</h1>
    <p class="pp-view-sub">Your practice list lives in this browser. Changes save when you make them.</p>
    <div class="pp-practice-layout">
      <div class="pp-practice-col pp-practice-col-form">
        <section class="pp-practice-card pp-form-card">
          <div class="practice-form"><label class="sr-only" for="task">Practice activity</label><input id="task" placeholder="Add your next activity" value="${esc(composer)}">${btn('Add practice','add-task')}</div>
        </section>
      </div>
      <div class="pp-practice-col pp-practice-col-collections">
        <section class="pp-practice-card pp-todo-card" aria-labelledby="pp-todo-h">
          <h2 id="pp-todo-h">Practice · To do</h2>
          <div class="pp-todo-list pp-todo-scroll pp-practice-scroll" role="region" tabindex="0" aria-label="To do list, scrollable">${pending.map(([t,i])=>row(t,i)).join('')||'<p class="pp-empty">Nothing on your to-do list — add a practice.</p>'}</div>
        </section>
        <section class="pp-practice-card pp-completed-card" aria-labelledby="pp-done-h">
          <h2 id="pp-done-h">Previously completed</h2>
          <div class="pp-done-list pp-completed-list pp-done-scroll pp-practice-scroll" role="region" tabindex="0" aria-label="Previously completed list, scrollable">${completed.map(([t,i])=>row(t,i)).join('')||'<p class="pp-empty">No completed practice yet.</p>'}</div>
        </section>
      </div>
    </div>
  </div>`;
}
