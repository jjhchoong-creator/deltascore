// P3 Home presenter — PURE view over the app's REAL browser-local state.
// app.js passes the live profile/tasks/mocks/used/draft slices; this module
// owns no storage, no listeners, no router and no seeded data. Every control
// reuses the app's EXISTING dispatch: data-act="log" (the real logging /
// resume / allowance-limit dispatcher), data-act="history", data-act=
// "open-mock" with the exact stored id, data-act="settings" / data-act=
// "practice" (the existing workspace navigation) and data-task-check with
// the ORIGINAL global task index (the existing savePractice completion path,
// including its tested denial revert and Retry feedback). The visual
// composition follows the approved home-priority layout: one two-sentence
// Welcome-back h1 with the blue local-calendar exam countdown, one dominant
// CTA surface, recent real mocks with raw earned/max only (SJT never merged),
// a pending-only To-do panel and an honest unavailable notes panel; the
// tutor panel is omitted entirely because no verified tutor relationship
// exists — a self-reported profile answer is not linkage. No conversion
// snapshots are integrated, so the average chip stays explicitly unavailable
// and no scaled or estimated numbers are invented. Countdown math uses
// local-calendar day arithmetic against the real today — never a frozen
// clock, never a UTC slice.
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function realExamDate(profile){
  if(profile?.notBooked)return null;
  const v=String(profile?.exam??'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return null;
  const [y,m,d]=v.split('-').map(Number),t=new Date(y,m-1,d);
  return (t.getFullYear()===y&&t.getMonth()===m-1&&t.getDate()===d)?v:null;
}
function localDaysUntil(dateStr){
  const [y,m,d]=dateStr.split('-').map(Number);
  const exam=Date.UTC(y,m-1,d),t=new Date(),today=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate());
  return Math.round((exam-today)/86400000);
}
export function homePage({profile={},tasks=[],mocks=[],used=0,draft=null,notes=[],esc=v=>String(v??'')}={}){
  const today=new Date();
  const todayLabel=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'}).format(today);
  const exam=realExamDate(profile);
  // Greeting: ONE h1, two sentences, blue countdown from the real profile.
  let title,sub='';
  if(!exam){
    title='Welcome back. No exam date set yet.';
    sub=`<p class="hp-exam hp-exam-unknown">The countdown appears here once one exists. <button type="button" class="quiet hp-settings-link" data-act="settings">Add one when you’re ready</button>.</p>`;
  }else{
    const days=localDaysUntil(exam);
    const label=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric'}).format(new Date(exam+'T00:00:00'));
    if(days>0){
      title=`Welcome back. Your exam is in <span class="hp-count"><strong>${days} ${days===1?'day':'days'}</strong></span>.`;
      sub=`<p class="hp-exam-date">${esc(label)} · exam date</p>`;
    }else if(days===0){
      title='Welcome back. Your exam is <span class="hp-count"><strong>today</strong></span>.';
      sub=`<p class="hp-exam-date">${esc(label)} · exam date</p>`;
    }else{
      title='Welcome back. Your exam date has passed.';
      sub=`<p class="hp-exam hp-exam-unknown">Logged after the sitting — <button type="button" class="quiet hp-settings-link" data-act="settings">update your next date in Settings</button>.</p>`;
    }
  }
  const greet=`<div class="hp-greet"><h1>${title}</h1><p class="hp-today">${esc(todayLabel)}</p>${sub}</div>`;
  // CTA: one primary, mirroring the REAL log dispatcher precedence
  // (allowance limit first, then resume-while-draft, then start a log).
  let cta;
  if(used>=3){
    cta=`<section class="hp-cta hp-cta-limit"><div class="hp-cta-copy"><h2>Mock logging allowance</h2><p>You’ve used all three browser-local mock logs in this preview. Existing results and reviews stay available.</p></div><button type="button" class="primary hp-log" data-act="log">View logging limit</button></section>`;
  }else if(draft){
    cta=`<section class="hp-cta hp-cta-resume"><div class="hp-cta-copy"><h2>You have an unfinished mock</h2><p>Resume where you left off — the draft is still yours to edit.</p></div><button type="button" class="primary hp-log" data-act="log">Resume logging</button></section>`;
  }else{
    cta=`<section class="hp-cta"><div class="hp-cta-copy"><h2>Log a mock</h2><p>Record your results after finishing a mock. Everything stays in this browser.</p></div><button type="button" class="primary hp-log" data-act="log">Log mock</button></section>`;
  }
  // Recent mocks: actual records, newest first, latest three; raw earned/max
  // only, SJT kept separate. No estimated or scaled values exist yet.
  const recent=[...mocks].reverse().slice(0,3);
  const logged=m=>{const d=new Date(m.loggedAt);return Number.isNaN(d.getTime())?'date unavailable':new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(d);};
  const raws=m=>['VR','DM','QR'].map(s=>`${s} ${esc(m.scores?.[s]?.earned??'—')}/${esc(m.scores?.[s]?.max??'—')}`).join(' · ');
  const rows=recent.length?recent.map(m=>`<div class="hp-mock-row"><div class="hp-mock-info"><strong>${esc(m.title||'Untitled mock')}</strong><p>${m.provider?esc(m.provider)+' · logged':'Logged'} ${esc(logged(m))}${m.sjt?` · SJT separate · ${esc(m.sjt.earned)}/${esc(m.sjt.max)} raw`:''}</p></div><div class="hp-mock-side"><p class="hp-mock-raws">${raws(m)}</p><button type="button" class="quiet hp-open-mock" data-act="open-mock" data-id="${esc(m.id)}" aria-label="View mock: ${esc(m.title||'Untitled mock')}">View mock</button></div></div>`).join(''):'<p class="hp-empty">No mocks logged yet.</p>';
  const mocksHtml=`<section class="hp-mocks" aria-labelledby="hp-mocks-h"><div class="hp-mocks-head"><h2 id="hp-mocks-h">Recent mocks</h2><span class="hp-avg hp-avg-none">Last-3 average · unavailable</span><button type="button" class="quiet hp-all" data-act="history">All history</button></div>${rows}<p class="hp-fineprint">Recent mocks show raw earned / maximum marks. Open a saved mock for its estimated scaled score. SJT stays separate and is never averaged.</p></section>`;
  // To-do panel: PENDING ONLY with original global indices; completion, the
  // denial revert and Retry feedback are the existing data-task-check path.
  // Editing, details, removal and Do again live on the practice page only.
  const pending=tasks.map((t,i)=>[t,i]).filter(([t])=>!t.done);
  const fmtDue=v=>{const [y,m,d]=String(v).split('-').map(Number),t=new Date(y,m-1,d);return (t.getFullYear()===y&&t.getMonth()===m-1&&t.getDate()===d)?new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(t):esc(v);};
  const taskRows=pending.map(([t,i])=>`<label class="hp-task"><input type="checkbox" aria-label="Mark practice ${i+1} completed" data-task-check="${i}"><span>${esc(t.text)}</span>${t.dueDate?`<small>Due <time datetime="${esc(t.dueDate)}">${fmtDue(t.dueDate)}</time></small>`:''}</label>`).join('')||'<p class="hp-empty">Nothing on your to-do list — add a practice.</p>';
  const tasksPanel=`<section class="hp-support hp-tasks-panel" aria-labelledby="hp-tasks-h"><div class="hp-panel-head"><h2 id="hp-tasks-h">To-do practice</h2><span class="hp-pending-count">${pending.length} pending</span></div>${taskRows}<p class="hp-panel-actions"><button type="button" class="quiet" data-act="practice" aria-label="Add practice — open the practice page">Add practice</button></p><p class="hp-fineprint">Tick to complete — it saves in this browser. Edit details, remove or repeat activities on the practice page.</p></section>`;
  // Browser-local notes in original storage order; cards open the separate editor.
  const noteCards=notes.map(n=>`<button type="button" class="hp-note hp-note-link" data-act="open-note" data-note="${esc(n.id)}" aria-label="Open note: ${esc(String(n.title??'').trim()?n.title:'Untitled note')}"><span class="hp-note-title">${esc(String(n.title??'').trim()?n.title:'Untitled note')}</span><span class="hp-note-excerpt">${esc(n.body)}</span></button>`).join('');
  const notesPanel=`<section class="hp-support hp-notes-panel" aria-labelledby="hp-notes-h"><h2 id="hp-notes-h">Personal notes</h2><div class="hp-notes-grid">${noteCards||'<p class="hp-empty">No notes saved yet.</p>'}</div><p class="hp-panel-actions"><button type="button" class="quiet" data-act="add-note" aria-label="Add note — saved in this browser">Add note</button></p><p class="hp-fineprint">Saved in this browser only; clearing browser storage removes your notes.</p></section>`;
  // Tutor feedback panel is intentionally ABSENT: real data has no verified
  // tutor relationship or feedback source, so the section is omitted and the
  // row reflows to the two equal panels (approved conditional omission).
  return `<div class="hp-wrap">${greet}${cta}${mocksHtml}<div class="hp-support-row hp-without-tutor">${tasksPanel}${notesPanel}</div></div>`;
}
