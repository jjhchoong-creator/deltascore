// P4 Personal notes presenter — PURE view over the app's REAL browser-local
// notes slice and the app-owned tab-local draft/failure state. This module
// owns no storage, no listeners, no router, no identity and no seeded data:
// app.js passes the live draft, the saved record (if any), and which failures
// are pending. Every control reuses the app's existing click dispatch:
// data-act="open-note" bound to the immutable saved id, data-act="save-note",
// "cancel-note", "delete-note", "retry-save-note", "retry-delete-note" and
// the existing "home" navigation. Title and body are individually optional —
// no maxlength or required attributes, because the fixture's 120/5000 caps
// were never agreed production policy; the any-non-whitespace content rule
// lives in app.js. A blank title displays the "Untitled note" fallback and
// never fabricates a saved title. Every student string is escaped by the
// caller-supplied esc at every HTML sink, including retry and confirm labels.
export function notesPage({draft={title:'',body:''},existing=false,missing=false,invalid=false,saveFailure=false,deleteFailure=false,esc=v=>String(v??''),btn=(l,a,c='',x='')=>`<button type="button" data-act="${a}" class="${c}" ${x}>${l}</button>`}={}){
  const fb=invalid?' aria-invalid="true" aria-describedby="note-content-error"':'';
  const fallback=String(draft.title??'').trim()||'Untitled note';
  return `<section class="hp-view hp-view-note" aria-labelledby="note-view-h">
    <p class="hp-view-nav">${btn('Back to Home','home','quiet')}</p>
    <h1 id="note-view-h">${existing?'Editing your note':'Add a note'}</h1>
    <p class="hp-view-sub">Saved in this browser only. Title and note are each optional; Save needs at least some content. Unsaved text stays in this tab — reloading discards it.</p>
    ${missing?'<p class="error">This saved note no longer exists in this browser. Your draft is still here in this tab; nothing else will be changed. Cancel to discard it. The missing saved note cannot be overwritten or recreated by this attempt.</p>':''}
    <div class="hp-note-compose">
      ${invalid?'<p class="error" id="note-content-error" role="alert">Enter a title or a note with some content — a note needs at least one non-blank field.</p>':''}
      <div class="field"><label for="note-entry-title">Title · optional</label><input id="note-entry-title" data-note-field="title" type="text"${fb} value="${esc(draft.title)}" placeholder="Give your note a title"></div>
      <div class="field"><label for="note-entry-body">Note · optional</label><textarea id="note-entry-body" data-note-field="body" rows="6"${fb} placeholder="Write a thought or reminder">${esc(draft.body)}</textarea></div>
      <p class="hp-panel-actions hp-note-actions">${btn('Save note','save-note','primary',missing?'disabled':'')}${btn('Cancel','cancel-note','quiet')}${existing&&!missing?btn('Delete note','delete-note','quiet danger'):''}</p>
      ${saveFailure?`<div class="field">${btn('Retry save note','retry-save-note','primary','data-note-owner="'+esc(existing?draft.id:'new')+'"')}</div>`:''}
      ${deleteFailure?`<div class="field">${btn(`Retry delete “${esc(fallback)}”`,'retry-delete-note','quiet','data-note-owner="'+esc(draft.id)+'"')}</div>`:''}
    </div>
  </section>`;
}
