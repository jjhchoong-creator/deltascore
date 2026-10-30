// ui-cloud-current-backend-detail.test.mjs — DERIVED current-backend detail
// harness: immutable ui-cloud-account-history-detail.test.mjs (325d2d6543…)
// with EXACTLY three reversible substitutions (auth-boundary pin f7d06e1d→
// e568bd72, mock-store pin f6762bfc→382ed19b, one inserted current
// request-rate-limit.mjs pin line ed6f4e87…) plus this header and a marked
// EOF append. Reversing the substitutions, removing the header and truncating
// at the BEGIN marker reproduces the 325d2d65… bytes byte-exact (receipt in
// the run evidence dir). All inherited assertions preserved unchanged.
// ui-cloud-account-usage.test.mjs — stage-owned vertical browser journey for
// the ui-cloud first slice (Settings → Access authenticated account usage).
//
// TDD binding: UICLOUD_PHASE=RED runs the SAME behavioral assertions against
// the UNTOUCHED staged app (app.js pinned to the accepted baseline
// 7c311a811110d3743aa8b2d630a2608e36947a2215068f12db7314522f05b2f0); the
// missing-feature failures are genuine behavioral RED, never asserted as
// success. UICLOUD_PHASE=GREEN pins the current staged app.js via
// UICLOUD_FINAL_HASHES (must differ from baseline) and must pass all tests.
// Orchestration/setup faults are prefixed [uicloud-harness] and are
// infrastructure evidence, NOT behavioral verdicts.
//
// Chain: real browser → createAccountSession (generation-guarded) →
// createMockClient → createMockIntent (pure synchronous ownership predicate)
// → same-origin loopback HTTP → integration-server → accepted
// createRequestHandler + createFirebaseVerifier(emulator) + createMockStore →
// Auth/Firestore emulators (fictional accounts only). No mocked getUsage on
// the connected happy path. Controlled fault/delay fixtures
// (/__fixture/*) are explicitly labeled instrumentation, never backend
// outage claims.
//
// Evidence: refuse-reuse directory, SERVED.json served-source binding,
// screenshots, receipt.json with lock/listener/process cleanup proof.
import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {chromium} from '/workspace/design-preview/node_modules/playwright/index.mjs';

const STAGE=new URL('.',import.meta.url).pathname;
const BACKEND='/workspace/backend-integration/';
const PROJECT='demo-deltascore-fresh';
const KEY='deltascore-remake-v1';
const LOCK='/workspace/.mock-overview-frontend-test.lock';
const BASELINE_APP='04513d752bceee25df4dfd01314e6b2c6dfc6197f8dd4bd5a3f58b3dcfa6fe24'; // derived: RED pins the CURRENT starting app (list seam absent), not the pre-tracer baseline
const GATE197={
 'account-session.mjs':'ce83695093db59a485ebbcde39e83fd55a0dc88fd85f407e635d46411819f597',
 'mock-client.mjs':'4f3b3a36c523dd631b94795637f5dc2696563db8f43bfd68c964fabf470be72b', // final-pin binding adapter: rebased to CURRENT accepted client 4f3b3a36 (typed daily 429 knownErrors),
 'mock-intent.mjs':'ac6d47af52671ddd5fe3cc7e3e250358bc7c5628062b2f48304439c0bcf9760f',
 'approved-domain.mjs':'d9f59b7a5be80624fdede072b6155713928103439e95c950483d26680681e8f7',
 'auth-boundary.mjs':'dd2b451a3793c9d9c401714a01ad6a9becb7948af837d5df568a6e34f95b4a61', // final-pin binding adapter: rebased to CURRENT accepted boundary dd2b451a (daily 429 commit-mutation map),
 'mock-store.mjs':'afc0ad176ac5456e7ecde0ceef8332010517dff89f6d08bc476ffb9cca4c925f', // final-pin binding adapter: rebased to CURRENT accepted store afc0ad17 (paid-daily accepted, inverse-verified),
 'firebase-verifier.mjs':'43a45889a6bd885d6f59c9dd30bce3935b9b24625c2446e61879e6c99fac238f',
 'request-rate-limit.mjs':'ed6f4e87fddf2bf04245ca5925c0746b58d865c16c422d614f2617e38928442a',
 'paid-daily-policy.mjs':'e9a2f3ed649f8f933d5dbcef39cd5e254e341b42867cc10cb5b3c8e76f207a36'}; // final-pin binding adapter: pin the store's transitive paid-daily-policy import (must resolve and match)
const UI_BASELINE_FILE_HASH='479ca27d3956527a26a1888811a3da044646b5d6c221ab1a83ad5ba910bb13ab';
const sha=b=>createHash('sha256').update(b).digest('hex');
const harness=m=>{throw new Error('[uicloud-harness] '+m)};

const PHASE=process.env.UICLOUD_PHASE;
if(!['RED','GREEN'].includes(PHASE))harness('UICLOUD_PHASE must be RED or GREEN, got '+PHASE);
const dir=process.env.UICLOUD_EVIDENCE_DIR;
if(!dir||!/^[A-Za-z0-9._-]+$/.test(dir))harness('bad UICLOUD_EVIDENCE_DIR');
const out=new URL(`./evidence/ui-cloud-account-usage/${dir}/`,import.meta.url);
await fs.mkdir(new URL('./evidence/ui-cloud-account-usage/',import.meta.url),{recursive:true});
try{await fs.mkdir(out);}catch{harness(`evidence directory already used (refuse-reuse): ${out.pathname}`);}

const supplied=JSON.parse(process.env.UICLOUD_FINAL_HASHES||'{}');
const stagePins=JSON.parse(process.env.UICLOUD_STAGE_HASHES||'{}');
const APP_PIN=PHASE==='RED'?BASELINE_APP:supplied['app.js'];
if(PHASE==='RED'){if(supplied['app.js']&&supplied['app.js']!==BASELINE_APP)harness('RED must run against the untouched staged app');}
else{if(!/^[0-9a-f]{64}$/.test(APP_PIN||'')||APP_PIN===BASELINE_APP)harness('GREEN requires a real non-baseline app.js pin');}
// At RED the implementation module is deliberately NOT served; its pin is required only at GREEN.
const STAGE_FILES=(()=>{const base=PHASE==='RED'?['account-access.js','integration-server.js','ui-cloud-account-usage.test.mjs']:['account-access.js','account-history.js','integration-server.js','ui-cloud-account-usage.test.mjs'];if(/^[0-9a-f]{64}$/.test(stagePins['account-save.js']||''))base.push('account-save.js');return base;})(); // uic-account-save: explicit optional stage-module registration
for(const n of STAGE_FILES)
 if(!/^[0-9a-f]{64}$/.test(stagePins[n]||''))harness('missing stage pin for '+n);

// --- Source binding: protected UI baseline (46) + stage-owned new modules.
const uiBaselineBytes=await fs.readFile(BACKEND+'ui-baseline.json');
assert.equal(sha(uiBaselineBytes),UI_BASELINE_FILE_HASH,'backend ui-baseline.json must be the protected 46-entry file');
const uiBaseline=JSON.parse(uiBaselineBytes.toString());
assert.equal(Object.keys(uiBaseline).length,46);
assert.equal(uiBaseline['app.js'],'7c311a811110d3743aa8b2d630a2608e36947a2215068f12db7314522f05b2f0','ui-baseline app entry must remain the historical tracer baseline');
assert.notEqual(BASELINE_APP,'7c311a811110d3743aa8b2d630a2608e36947a2215068f12db7314522f05b2f0','derived harness RED baseline is the current starting app');
const snapshot=async()=>{const o={};for(const n of Object.keys(uiBaseline))o[n]=sha(await fs.readFile(STAGE+n));for(const n of STAGE_FILES)o[n]=sha(await fs.readFile(STAGE+n));return o;};
const FINAL_STYLES=process.env.UICLOUD_FINAL_STYLES||'';if(FINAL_STYLES&&!/^[0-9a-f]{64}$/.test(FINAL_STYLES))harness('bad UICLOUD_FINAL_STYLES pin');
const expectedSnapshot=()=>Object.fromEntries(Object.entries({...uiBaseline,...(FINAL_STYLES?{'styles.css':FINAL_STYLES}:{}),...Object.fromEntries(STAGE_FILES.map(n=>[n,stagePins[n]])),'app.js':APP_PIN}));
{const s=await snapshot(),e=expectedSnapshot();for(const n of Object.keys(e))assert.equal(s[n],e[n],`pre-run source drift: ${n}`);}
for(const [name,digest] of Object.entries(GATE197))assert.equal(sha(await fs.readFile(BACKEND+name)),digest,`backend reference module drift: ${name}`);

process.env.DELTASCORE_INTEGRATION_MODE='demo-emulator';
const {createIntegrationServer}=await import('./integration-server.js');
const integ=await createIntegrationServer({staticRoot:STAGE,projectId:PROJECT,pins:{...GATE197,'account-access.js':stagePins['account-access.js'],...(PHASE==='RED'?{}:{'account-history.js':stagePins['account-history.js']}),...(stagePins['account-save.js']?{'account-save.js':stagePins['account-save.js']}:{})}}).catch(e=>harness('integration server refused to start: '+e.message)); // uic-account-save: pinned new-module allowlist spread
await new Promise((resolve,reject)=>{integ.server.once('error',e=>reject(harness('listen failed: '+e.message)));integ.server.listen(0,'127.0.0.1',resolve);});
const base=`http://127.0.0.1:${integ.server.address().port}`;
const backendRequire=createRequire(BACKEND+'package.json');
const {getAuth}=backendRequire('firebase-admin/auth');
const admin=getAuth(integ.adminApp);
const fixtureCtl=async(path)=>{const r=await fetch(base+path);if(!r.ok)harness('fixture control failed '+path+' '+r.status);return r.json();};
const setHold=ms=>fixtureCtl(`/__fixture/hold-usage?ms=${ms}`);
const setStatus=code=>fixtureCtl('/__fixture/usage-status'+(code===null?'':'?code='+code));

// Fictional emulator accounts (accepted mock-api.test.mjs pattern).
async function account(){
 const email=`fictional-uicloud-${randomUUID()}@example.test`,password='FictionalEmulatorOnly-42!';
 const user=await admin.createUser({email,password,emailVerified:true}).catch(e=>harness('emulator account creation failed: '+e.message));
 const r=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});
 if(r.status!==200)harness('emulator sign-in failed: '+r.status);
 return {uid:user.uid,token:(await r.json()).idToken};
}
const draft=()=>({id:randomUUID(),title:'Fictional usage probe',provider:'',dmMode:'questions',scores:{VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}},sjt:null,reviews:[],note:''});
async function commit(token){const r=await fetch(base+'/api/mocks/commit',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify(draft())});const b=await r.json();if(![200,201].includes(r.status))harness(`commit failed ${r.status} ${JSON.stringify(b)}`);return b;}

const lock=await fs.open(LOCK,'wx');
await lock.writeFile('ui-cloud-account-usage '+PHASE+' '+process.pid);
let browser;const contexts=[];
const futureExam=(()=>{const d=new Date();d.setUTCFullYear(d.getUTCFullYear()+1);return d.toISOString().slice(0,10);})();
const seed=()=>({profile:{target:'900',notSure:false,exam:futureExam,notBooked:false,tutor:'No',resources:[],format:'guided'},step:3,complete:true,started:true,route:'home',current:null,reviewIndex:-1,resourcesAnswered:true,mocks:[],used:0,savedIds:[],draft:null,tasks:[],notes:[]});
const ROW=used=>`Signed-in test account (fictional emulator data): ${used} of 3 mock logs used on this account.`;
const LOCAL_ROW='0 of 3 cumulative browser-local mock logs used.';
const ERR_UNAVAILABLE='Account usage is temporarily unavailable. Your browser-local records are unchanged.';
const ERR_UNVERIFIED='Account access could not be verified. No account usage is shown.';
const LOADING='Loading account usage…';

async function openPage(width=1440){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});contexts.push(ctx);
 const p=await ctx.newPage();p.setDefaultTimeout(8000);
 const rec={errors:[],external:[],api:[],usage:0};
 p.on('pageerror',e=>rec.errors.push(e.message));
 p.on('request',r=>{const u=r.url();if(u.startsWith(base+'/')){if(u.includes('/api/')||u.includes('/backend/'))rec.api.push(u);if(u.includes('/api/account/mock-usage'))rec.usage++;}else rec.external.push(u);});
 p.on('dialog',async d=>{rec.errors.push('unexpected dialog: '+d.message());await d.dismiss().catch(()=>{});});
 await p.goto(base);
 await p.evaluate(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:KEY,s:seed()});
 await p.reload();
 return {p,rec};
}
async function connectHarness(p,acct){
 return p.evaluate(async({uid,token})=>{
  const sessionMod=await import('/backend/account-session.mjs');
  const clientMod=await import('/backend/mock-client.mjs');
  const app=await import('/app.js');
  const h={attachAvailable:typeof app.attachAccountAccess==='function',moduleAvailable:false,events:[]};
  // At RED the account-access module deliberately does not exist yet: the
  // missing feature itself, recorded as moduleAvailable=false — the primary
  // behavioral assertion (row visible) is what fails, not this setup step.
  try{h.accessMod=await import('/account-access.js');h.moduleAvailable=true;}catch{}
  const verifySession=async t=>{const r=await fetch('/api/session',{headers:{authorization:'Bearer '+t},credentials:'omit',cache:'no-store'});if(!r.ok)throw new Error('session verification failed: '+r.status);const b=await r.json();return {uid:b.uid};};
  h.session=sessionMod.createAccountSession({verifySession,onChange:s=>{h.events.push(s.status+(s.uid?':'+s.uid:''));if(h.controller)h.controller.handleSessionChange(s);}});
  h.client=clientMod.createMockClient({session:h.session});
  if(h.moduleAvailable)h.controller=h.accessMod.createAccountAccess({session:h.session,client:h.client});
  h.accounts={};h.accounts[uid]=token;
  if(h.attachAvailable&&h.controller)h.detach=app.attachAccountAccess(h.controller);
  await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});
  window.__uicloudHarness=h;
  return {attachAvailable:h.attachAvailable,moduleAvailable:h.moduleAvailable,status:h.session.getState().status,signedInUid:h.session.getState().uid};
 },{uid:acct.uid,token:acct.token});
}
const switchAccount=async(p,acct)=>p.evaluate(async({uid,token})=>{const h=window.__uicloudHarness;h.accounts[uid]=token;await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});return h.session.getState();},{uid:acct.uid,token:acct.token});
const logout=async p=>p.evaluate(async()=>{await window.__uicloudHarness.session.setAccount(null);return window.__uicloudHarness.session.getState();});
const goSettings=async p=>{await p.locator('nav [data-act="settings"]').click();await p.waitForSelector('#defaultFormat');};
const goHome=async p=>{await p.locator('nav [data-act="home"]').click();await p.waitForSelector('.hp-tasks-panel,[data-act="log"]');};
const rowText=async p=>{const l=p.locator('[data-account-usage="row"]');return (await l.count())?l.first().textContent():null;};
const slotHtmlCount=async p=>p.evaluate(()=>{const s=document.getElementById('account-access-slot');return s?s.childElementCount:-1;});
const waitRow=async(p,text)=>{await p.waitForSelector('[data-account-usage="row"]',{timeout:15000});if(text!==undefined)assert.equal(await rowText(p),text);};
const waitLoad=async p=>{await p.waitForFunction(t=>document.querySelector('[data-account-usage="status"]')?.textContent===t,LOADING,{timeout:15000});};
const settle=ms=>new Promise(r=>setTimeout(r,ms));
const shot=(p,name)=>p.screenshot({path:new URL(name,out).pathname,fullPage:true});
const checkClean=(rec,where)=>{assert.deepEqual(rec.errors,[],'pageerror must be empty at '+where);assert.deepEqual(rec.external,[],'no non-same-origin browser requests at '+where);};

// Cleanup runs via node:test after() — NOT a top-level try/finally, which
// would execute before the scheduled test bodies run (observed: admin app
// deleted mid-run). This preserves genuine behavioral RED.
browser=await chromium.launch({headless:true,args:['--no-sandbox']}).catch(e=>harness('browser launch failed (infrastructure, not behavioral RED): '+e.message));

// ── t1: authenticated account usage row visible (primary missing-feature assertion).
test('settings access shows the authenticated account usage row over the real emulator chain',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const connected=await connectHarness(p,acct);
 await goSettings(p);
 const visible=await p.locator('[data-account-usage="row"]').first().waitFor({state:'visible',timeout:15000}).then(()=>true,()=>false);
 assert.ok(visible,`account usage row must be visible in Settings under the explicit authenticated harness connection (attachAvailable=${connected.attachAvailable}, session=${connected.status})`);
 assert.equal(await rowText(p),ROW(0));
 assert.ok((await p.locator('section.settings-section').filter({has:p.getByRole('heading',{name:'Access',exact:true})}).locator('p').first().textContent()).includes(LOCAL_ROW),'browser-local usage line must remain unchanged');
 checkClean(rec,'t1-desktop');
 await shot(p,'shot-1440-account-usage-row.png');
 await p.locator('[data-account-usage="row"]').evaluate(el=>el.scrollIntoView());
 const {p:pm,rec:recm}=await openPage(390);
 await connectHarness(pm,acct);
 await goSettings(pm);
 await waitRow(pm,ROW(0));
 checkClean(recm,'t1-mobile');
 await shot(pm,'shot-390-account-usage-row.png');
});

// ── t2: real HTTP commit through the accepted API, depart/reenter shows the increment.
test('committed fictional mock via the accepted HTTP API increments the displayed account usage after re-entering settings',async()=>{
 const acct=await account();
 const {p,rec}=await openPage();
 await connectHarness(p,acct);
 await goSettings(p);
 await waitRow(p,ROW(0));
 const ack=await commit(acct.token);
 assert.equal(ack.created,true);assert.equal(ack.used,1);
 await goHome(p);
 await settle(150);
 assert.equal(await p.locator('[data-account-usage="row"]').count(),0,'departed settings must not keep the account row mounted');
 await goSettings(p);
 await waitRow(p,ROW(1));
 assert.ok(rec.usage>=2,'re-entry must fetch usage again over real HTTP');
 assert.ok((await p.locator('section.settings-section').filter({has:p.getByRole('heading',{name:'Access',exact:true})}).locator('p').first().textContent()).includes(LOCAL_ROW),'browser-local counter must stay unchanged by account reads');
 checkClean(rec,'t2');
 await shot(p,'shot-1440-account-usage-incremented.png');
});

// ── t3: default anonymous preview unchanged — no attach, no network, no storage mutation.
test('default anonymous preview renders no account row and performs no private network or extra storage writes',async()=>{
 const {p,rec}=await openPage();
 // Write-counting shim (accepted harness pattern): navigation writes are
 // legitimate; account read/load/refresh/detach must add none.
 await p.evaluate(()=>{window.__uicloudWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicloudWrites++;return set.apply(this,a)}});
 const apiBefore=rec.api.length;
 await goSettings(p);
 const writesAtSettings=await p.evaluate(()=>window.__uicloudWrites);
 const usedAtEntry=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).used,KEY);
 await settle(500);
 assert.equal(await p.locator('[data-account-usage]').count(),0,'no account-access UI may render without an explicit harness connection');
 assert.ok((await p.locator('section.settings-section').filter({has:p.getByRole('heading',{name:'Access',exact:true})}).locator('p').first().textContent()).includes(LOCAL_ROW));
 await goHome(p);await goSettings(p);await settle(500);
 assert.equal(rec.api.length,apiBefore,'anonymous settings visits must issue zero /api or /backend requests');
 assert.equal(await p.locator('[data-account-usage]').count(),0);
 const usedFinal=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).used,KEY);
 assert.equal(usedFinal,usedAtEntry,'stored browser-local usage must be unchanged by settings visits');
 checkClean(rec,'t3');
 await shot(p,'shot-1440-anonymous-settings.png');
});

// ── t4: held response + departure; late success cannot apply; stale retry sends zero network.
test('departing settings while the usage response is held prevents late presentation and a stale retry sends zero requests',async()=>{
 const acct=await account();
 const {p,rec}=await openPage();
 await connectHarness(p,acct);
 // 401 error view, keep a live JS reference to the Retry button, depart,
 // then activate the stale retry handler after the view is gone.
 await setStatus(401);
 await goSettings(p);
 await p.waitForSelector('[data-account-usage="error"]');
 await p.evaluate(()=>{window.__staleRetry=document.querySelector('[data-account-usage="retry"]');});
 await goHome(p);
 const usageAfterDepart=rec.usage;
 await p.evaluate(()=>window.__staleRetry.click());
 await settle(400);
 assert.equal(rec.usage,usageAfterDepart,'a queued stale retry must cause zero network');
 assert.equal(await p.locator('[data-account-usage]').count(),0,'departed view must render no account UI');
 // Held success: depart mid-flight; the late success must never appear.
 await setStatus(null);await setHold(2500);
 await goSettings(p);
 await waitLoad(p);
 await goHome(p);
 await setHold(0);
 await settle(3000);
 assert.equal(await p.locator('[data-account-usage]').count(),0,'late success after departure must not render anywhere');
 assert.equal(await rowText(p),null);
 // Re-entry works normally afterwards.
 await goSettings(p);
 await waitRow(p,ROW(0));
 checkClean(rec,'t4');
});

// ── t5: account switch while held — obsolete account data must never display.
test('switching accounts while the usage response is held discards the obsolete reply with no cross-account leak',async()=>{
 const a=await account(),b=await account();
 await commit(b.token);await commit(b.token);
 const {p,rec}=await openPage();
 await connectHarness(p,a);
 await setHold(2500);
 await goSettings(p);
 await waitLoad(p);
 await switchAccount(p,b);
 await setHold(0);
 // Immediately after switch: private display cleared (loading), never A data.
 const during=await p.evaluate(()=>document.getElementById('account-access-slot')?.textContent??'');
 assert.ok(!during.includes('0 of 3'),'obsolete account data must not be displayed during switch: '+JSON.stringify(during));
 await waitRow(p,ROW(2));
 await settle(3200); // A's held reply resolves here and must be discarded.
 assert.equal(await rowText(p),ROW(2),'a late obsolete reply must not replace the current account view');
 checkClean(rec,'t5');
 await shot(p,'shot-1440-switched-account.png');
});

// ── t6: logout and same-UID restoration while held — cleared, no late apply.
test('logout and same-UID restoration during a held request clear the display and discard the stale reply',async()=>{
 const a=await account();
 const {p,rec}=await openPage();
 await connectHarness(p,a);
 await setHold(2500);
 await goSettings(p);
 await waitLoad(p);
 await logout(p);
 for(let i=0;i<20;i++){const t=await p.evaluate(()=>document.getElementById('account-access-slot')?.textContent??'');assert.equal(t,'','logout must clear the private display immediately');await settle(25);}
 // Same-UID restoration: fresh generation, fresh load; the stale reply cannot apply.
 await p.evaluate(async({uid,t})=>{const h=window.__uicloudHarness;await h.session.setAccount({uid,getIdToken:async()=>t});},{uid:a.uid,t:a.token});
 await waitLoad(p);
 await setHold(0);
 await waitRow(p,ROW(0));
 await settle(3000);
 assert.equal(await rowText(p),ROW(0),'stale same-UID reply must not disturb the restored view');
 checkClean(rec,'t6');
});

// ── t7: sanitized 401 with keyboard-accessible retry and recovery.
test('a current 401 shows sanitized text and the keyboard retry recovers after the fault clears',async()=>{
 const acct=await account();
 const {p,rec}=await openPage();
 await connectHarness(p,acct);
 await setStatus(401);
 await goSettings(p);
 await p.waitForSelector('[data-account-usage="error"]');
 assert.equal(await p.locator('[data-account-usage="error"]').textContent(),ERR_UNVERIFIED);
 const body=await p.locator('[data-account-usage="error"]').evaluate(el=>el.textContent);
 assert.ok(!body.includes('authentication_required')&&!body.includes('401')&&!body.includes('Bearer'),'no raw transport detail may be forwarded');
 const retry=p.locator('[data-account-usage="retry"]');
 await retry.focus();
 assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.accountUsage),'retry','retry must be keyboard focusable');
 await p.keyboard.press('Enter');
 await p.waitForSelector('[data-account-usage="error"]');
 assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.accountUsage),'retry','focus must survive a failed retry');
 await setStatus(null);
 await p.keyboard.press('Space');
 await waitRow(p,ROW(0));
 checkClean(rec,'t7');
 await shot(p,'shot-1440-retry-recovery.png');
});

// ── t8: sanitized 503 and account change clears cached private text.
test('a current 503 shows sanitized text and an account change clears the cached private error immediately',async()=>{
 const a=await account(),b=await account();
 const {p,rec}=await openPage();
 await connectHarness(p,a);
 await setStatus(503);
 await goSettings(p);
 await p.waitForSelector('[data-account-usage="error"]');
 assert.equal(await p.locator('[data-account-usage="error"]').textContent(),ERR_UNAVAILABLE);
 assert.ok(!(await p.locator('[data-account-usage="error"]').textContent()).includes('storage_unavailable'));
 await setStatus(null);
 await switchAccount(p,b);
 const during=await p.evaluate(()=>document.getElementById('account-access-slot')?.textContent??'');
 assert.ok(!during.includes('temporarily unavailable'),'account change must clear cached private text immediately: '+JSON.stringify(during));
 await waitRow(p,ROW(0));
 checkClean(rec,'t8');
});

// ── t9: served-source binding — the browser actually received the pinned bytes.
test('served source responses bind the browser to the exact staged app and accepted backend module bytes',async()=>{
 const served={};
 const targets={'/index.html':uiBaseline['index.html'],'/styles.css':FINAL_STYLES||uiBaseline['styles.css'],'/app.js':APP_PIN,'/backend/account-session.mjs':GATE197['account-session.mjs'],'/backend/mock-client.mjs':GATE197['mock-client.mjs'],'/backend/mock-intent.mjs':GATE197['mock-intent.mjs'],'/backend/approved-domain.mjs':GATE197['approved-domain.mjs'],...(PHASE==='GREEN'?{'/account-access.js':stagePins['account-access.js'],'/account-history.js':stagePins['account-history.js']}:{'/account-access.js':stagePins['account-access.js']})};
 for(const [url,digest] of Object.entries(targets)){
  const r=await fetch(base+url);const b=Buffer.from(await r.arrayBuffer());
  served[url]={status:r.status,sha256:sha(b),expected:digest};
  assert.equal(r.status,200,`served ${url} must be 200`);
  assert.equal(sha(b),digest,`served ${url} bytes must equal the pinned source`);
 }
 // Node-only backend modules, configs and traversal must never be exposed.
 // At RED /account-access.js is also part of the not-served inventory.
 for(const url of ['/auth-boundary.mjs','/mock-store.mjs','/firebase-verifier.mjs','/integration-server.js','/ui-cloud-account-usage.test.mjs','/firebase-all.json','/backend/auth-boundary.mjs','/backend/mock-store.mjs','/backend/firebase-verifier.mjs','/../backend-integration/firebase.json','/..%2fbackend-integration/firebase.json','/SOURCE-MANIFEST.json',...(PHASE==='RED'?['/account-history.js']:[])]){
  const r=await fetch(base+url);await r.arrayBuffer();
  served[url]={status:r.status,mustNotServe:true};
  assert.equal(r.status,404,`${url} must not be served`);
 }
 const s=await snapshot(),e=expectedSnapshot();
 assert.deepEqual(s,e,'stage source must be unchanged during the run');
 await fs.writeFile(new URL('SERVED.json',out),JSON.stringify({phase:PHASE,base,served,sourceAfter:s},null,2));
});
after(async()=>{
 const receipt={phase:PHASE,evidenceDir:out.pathname,lockRemoved:false,serverClosed:false,browserClosed:false,contexts:contexts.length};
 try{await integ.server.closeAllConnections?.();await new Promise(r=>integ.server.close(r));receipt.serverClosed=integ.server.address()===null;}catch(e){receipt.serverCloseError=String(e);}
 try{await integ.close();}catch(e){receipt.integCloseError=String(e);}
 for(const ctx of contexts)try{await ctx.close()}catch{}
 try{if(browser){await browser.close();receipt.browserClosed=true;}}catch(e){receipt.browserCloseError=String(e);}
 try{await lock.close();await fs.unlink(LOCK);receipt.lockRemoved=true;}catch(e){receipt.lockError=String(e);}
 try{receipt.lockAbsent=!(await fs.access(LOCK).then(()=>true,()=>false));}catch{}
 try{const s=await snapshot();receipt.postSource=s;receipt.postSourceMatches=JSON.stringify(s)===JSON.stringify(expectedSnapshot());}catch(e){receipt.postSourceError=String(e);}
 try{await fs.writeFile(new URL('receipt.json',out),JSON.stringify(receipt,null,2));}catch{}
 if(!receipt.lockRemoved||!receipt.serverClosed)console.error('[uicloud-harness] cleanup incomplete: '+JSON.stringify(receipt));
});

// ── BEGIN account-history list vertical append ──
// Derived append r2 (account-history-contract.md, FIRST LIST VERTICAL only):
// named list/pagination/lifecycle/error tests reusing the harness helpers
// above. Inverse proof: deleting everything from the BEGIN marker to EOF and
// reversing the documented generator substitutions reproduces
// ui-cloud-account-usage-adapted.test.mjs byte-exact (generator receipt +
// inverse proof JSON in evidence). All existing nine tracer assertions are
// untouched. NO detail/getMock/back/open-record coverage here — that is the
// next vertical and deliberately NOT implemented or asserted.
//
// r2 parent-reviewed TEST-FIXTURE corrections (assertions never weakened; the
// historical h1-GREEN append bytes 7ac3fac2… and derived harness 3e60a067…
// remain immutable and are NOT modified):
//  FIX-1 (h8): the write counter is baselined AFTER each legitimate
//   navigation write and the zero-EXTRA-write requirement is asserted
//   against that baseline; stored browser-local blob preservation added.
//  FIX-2 (holdListRoutes + h5/h6/h7): bounded await readiness for the FIRST
//   actual route.fetch response; the real held body's status/items are
//   exposed and asserted to contain the expected ORIGINAL record ID/title
//   BEFORE replacement/departure/switch/release, so each stale-response
//   proof establishes the original account response actually existed and
//   was withheld. Only-first-request semantics preserved (B is never
//   blocked). No authorization tokens are printed (list bodies carry none).
//  FIX-3 (h7): the same-UID portion now initiates an ACTUAL held request
//   while B is signed in, verifies the withheld original B body, logs out
//   (immediate clear), restores the SAME UID (fresh non-held response
//   renders), and releases the obsolete heldB LAST, asserting no stale
//   overwrite. The cross-account A→B proof is kept unchanged in intent.
//  No application/product code change is made or required by these fixture
//  corrections.
//
// Fault semantics for this vertical (no integration-server fixture change is
// authorised beyond module registration):
// - 401: REAL authentication boundary — the harness supplies an invalid
//   emulator token through the same injected getIdToken, so the accepted
//   verifier/handler chain returns an actual 401.
// - 503 and held responses: narrowly labelled browser-layer fixture controls
//   (Playwright route): 503 is an explicit fulfilled fixture response
//   (instrumentation, NOT a backend outage claim); holds use route.fetch()
//   so the ORIGINAL real request reaches the real server and its real
//   response is withheld until the test releases it.

const LIST_LABEL='Account-saved mocks (fictional emulator data)';
const LIST_EMPTY='No mocks are saved on this account yet.';
const LIST_LOADING='Loading account-saved mocks…';
const LIST_ERR_UNAVAILABLE='The account catalogue is temporarily unavailable. Your browser-local history is unchanged.';
const LIST_ERR_UNVERIFIED='Account access could not be verified. No account catalogue is shown.';

const goHistory=async p=>{await p.locator('nav [data-act="history"]').click();await p.getByRole('heading',{name:'Mock history'}).waitFor();};
const goHomeFrom=async p=>{await p.locator('nav [data-act="home"]').click();await p.waitForSelector('.hp-tasks-panel,[data-act="log"]');};
const histRows=p=>p.locator('[data-account-history="row"]');
const histRowIds=async p=>p.locator('[data-account-history="row"]').evaluateAll(els=>els.map(e=>e.getAttribute('data-account-history-id')));
const histRowTitles=async p=>p.locator('[data-account-history="row"] [data-account-history="title"]').evaluateAll(els=>els.map(e=>e.textContent));
const histSlotCount=async p=>p.evaluate(()=>{const s=document.getElementById('account-history-slot');return s?s.childElementCount:-1;});
const listCount=rec=>rec.api.filter(u=>u.includes('/api/mocks?')).length;
const waitHistRows=async(p,n)=>{await p.waitForFunction(k=>document.querySelectorAll('[data-account-history="row"]').length===k,n,{timeout:15000});};
const waitHistLoad=async p=>{await p.waitForFunction(t=>document.querySelector('[data-account-history="status"]')?.textContent===t,LIST_LOADING,{timeout:15000});};
const waitHistEmpty=async p=>{await p.waitForSelector('[data-account-history="empty"]',{timeout:15000});};
const waitHistError=async p=>{await p.waitForSelector('[data-account-history="error"]',{timeout:15000});};

async function commitTitled(token,title,provider=''){const d=draft();d.title=title;d.provider=provider;const r=await fetch(base+'/api/mocks/commit',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify(d)});const b=await r.json();if(![200,201].includes(r.status))harness(`titled commit failed ${r.status} ${JSON.stringify(b)}`);return b;}

// Explicit History-owned connection (contract: injected controller only, no
// auto discovery). At RED the seam/module deliberately do not exist yet:
// attachAvailable/moduleAvailable=false records the missing feature itself;
// the primary behavioral assertions (section visible) are what fail.
async function connectHistoryHarness(p,acct,{pageSize=null}={}){
 return p.evaluate(async({uid,token,pageSize})=>{
  const sessionMod=await import('/backend/account-session.mjs');
  const clientMod=await import('/backend/mock-client.mjs');
  const app=await import('/app.js');
  const h={attachAvailable:typeof app.attachAccountHistory==='function',moduleAvailable:false,events:[]};
  try{h.historyMod=await import('/account-history.js');h.moduleAvailable=true;}catch{}
  const verifySession=async t=>{const r=await fetch('/api/session',{headers:{authorization:'Bearer '+t},credentials:'omit',cache:'no-store'});if(!r.ok)throw new Error('session verification failed: '+r.status);const b=await r.json();return {uid:b.uid};};
  h.session=sessionMod.createAccountSession({verifySession,onChange:s=>{h.events.push(s.status+(s.uid?':'+s.uid:''));if(h.controller)h.controller.handleSessionChange(s);}});
  h.client=clientMod.createMockClient({session:h.session});
  if(h.moduleAvailable)h.controller=h.historyMod.createAccountHistory({session:h.session,client:h.client,...(pageSize?{pageSize}:{})});
  h.accounts={};h.accounts[uid]=token;
  if(h.attachAvailable&&h.controller)h.detach=app.attachAccountHistory(h.controller);
  await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});
  window.__uicHistoryHarness=h;
  return {attachAvailable:h.attachAvailable,moduleAvailable:h.moduleAvailable,status:h.session.getState().status,signedInUid:h.session.getState().uid};
 },{uid:acct.uid,token:acct.token,pageSize});
}
const histLogout=async p=>p.evaluate(async()=>{await window.__uicHistoryHarness.session.setAccount(null);return window.__uicHistoryHarness.session.getState();});
const histSetToken=async(p,token)=>p.evaluate(async t=>{const h=window.__uicHistoryHarness;const uid=h.session.getState().uid;h.accounts[uid]=t;},token);
const histRestore=async(p,acct)=>p.evaluate(async({uid,t})=>{const h=window.__uicHistoryHarness;h.accounts[uid]=t;await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});},{uid:acct.uid,t:acct.token});

// Narrowly labelled browser-layer fixture controls (NOT backend claims).
const route503=p=>p.route(base+'/api/mocks?*',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})}));
// r2 FIX-2: bounded readiness await for the FIRST actual route.fetch
// response + exposure of that real body (status/items). Only-first-request
// semantics are preserved (only=1 default) so a later B request is never
// also blocked.
async function holdListRoutes(p,{only=1,timeoutMs=15000}={}){
 const held=[];let heldCount=0;
 await p.route(base+'/api/mocks?*',async route=>{if(heldCount>=only){await route.continue();return;}heldCount++;const resp=await route.fetch();const body=await resp.text();held.push({route,resp,body,status:resp.status()});});
 const waitHeld=async(n=1,ms=timeoutMs)=>{const t0=Date.now();while(held.length<n){if(Date.now()-t0>ms)harness(`held list response not captured within ${ms}ms (held=${held.length}/${n}) — route.fetch readiness timed out`);await new Promise(r=>setTimeout(r,50));}return held.length;};
 const heldBodies=()=>held.map(h=>({status:h.status,body:h.body}));
 const release=async()=>{while(held.length){const h=held.shift();try{await h.route.fulfill({response:h.resp,body:h.body});}catch{}}} ;
 const pending=()=>held.length;
 return {release,pending,waitHeld,heldBodies};
}
// r2 FIX-2: verify the withheld ORIGINAL response actually existed and
// belongs to the expected account before any release. Prints no transport
// detail beyond list ids/titles (never authorization tokens; list bodies
// contain none).
async function heldListSummary(hold,timeoutMs=15000){
 await hold.waitHeld(1,timeoutMs);
 const first=hold.heldBodies()[0];
 assert.equal(first.status,200,'the withheld ORIGINAL list response must be a real HTTP 200, got '+first.status);
 let parsed;try{parsed=JSON.parse(first.body);}catch(e){harness('held list body is not valid JSON: '+e.message);}
 assert.ok(parsed&&Array.isArray(parsed.items),'held list body must carry an items array');
 return {status:first.status,ids:parsed.items.map(i=>i.summary.id),titles:parsed.items.map(i=>i.summary.title),nextCursor:parsed.nextCursor};
}

// ── h1: primary list assertion — real committed account records render as
// safe literal summaries on History; browser-local history/storage untouched.
test('history list: injected signed-in controller lists real account-saved summaries without touching browser-local history',async()=>{
 const acct=await account();
 const titles=['Fictional account mock A','Fictional account mock B','Fictional account mock C'];
 const acks=[];for(const t of titles)acks.push(await commitTitled(acct.token,t,'Fictional provider'));
 const {p,rec}=await openPage(1440);
 const connected=await connectHistoryHarness(p,acct);
 await goHistory(p);
 // Shim installed AFTER the navigation write baseline: list operations must
 // add zero further storage writes.
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 assert.ok(connected.attachAvailable,`app.attachAccountHistory seam must exist under the explicit harness connection (moduleAvailable=${connected.moduleAvailable}, session=${connected.status})`);
 assert.ok(connected.moduleAvailable,'account-history.js module must be served and importable');
 await p.waitForSelector('[data-account-history="section"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="heading"]').textContent(),LIST_LABEL);
 await waitHistRows(p,3);
 assert.deepEqual((await histRowTitles(p)).slice().sort(),titles.slice().sort(),'list must show the ACTUAL committed titles as literal text');
 const ids=await histRowIds(p);
 assert.deepEqual(ids.slice().sort(),acks.map(a=>a.id).sort(),'rows must carry the literal committed record IDs');
 const meta=await p.locator('[data-account-history="row"] [data-account-history="meta"]').first().textContent();
 assert.ok(meta.includes('Fictional provider')&&/Logged \d{2}\/\d{2}\/\d{4}/.test(meta),'row meta must show provider and logged date: '+meta);
 assert.equal(await p.locator('[data-account-history="load-more"]').count(),0,'no Load more without a nextCursor (no fabricated total)');
 // Browser-local history and storage untouched by the account catalogue.
 const stored=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.deepEqual(stored.mocks,[],'catalogue summaries must never merge into state.mocks');
 assert.equal(stored.used,0,'account reads must not touch the browser-local counter');
 assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'account list operations must add zero storage writes');
 assert.ok((await p.locator('main').innerText()).includes('No mocks logged yet.'),'browser-local History copy must remain unchanged');
 assert.ok(listCount(rec)>=1,'the list must be fetched over real same-origin HTTP');
 checkClean(rec,'h1-desktop');
 await shot(p,'shot-1440-history-list-rows.png');
 await fs.writeFile(new URL('h1-dom-snapshot.html',out),await p.locator('#account-history-slot').innerHTML());
 const {p:pm,rec:recm}=await openPage(390);
 await connectHistoryHarness(pm,acct);
 await goHistory(pm);
 await waitHistRows(pm,3);
 checkClean(recm,'h1-mobile');
 await shot(pm,'shot-390-history-list-rows.png');
});

// ── h2: pagination — harness-injected validated pageSize2 proves three real
// commits across two real pages via nextCursor + Load more.
test('history list: injected pageSize2 paginates three real commits through nextCursor and Load more with real second-page HTTP',async()=>{
 const acct=await account();
 const acks=[];for(const t of ['Pagination mock 1','Pagination mock 2','Pagination mock 3'])acks.push(await commitTitled(acct.token,t));
 const {p,rec}=await openPage();
 await connectHistoryHarness(p,acct,{pageSize:2});
 await goHistory(p);
 await waitHistRows(p,2);
 const page1=await histRowIds(p);
 assert.equal(page1.length,2,'first page must honour the validated injected pageSize 2');
 assert.ok(page1.every(id=>acks.some(a=>a.id===id)),'page1 ids must be real committed ids');
 assert.equal(await p.locator('[data-account-history="load-more"]').count(),1,'a nextCursor page must offer Load more');
 const beforeMore=listCount(rec);
 await p.locator('[data-account-history="load-more"]').click();
 await waitHistRows(p,3);
 assert.equal(await p.locator('[data-account-history="load-more"]').count(),0,'Load more must disappear when nextCursor is null');
 assert.ok(listCount(rec)>beforeMore,'Load more must issue a REAL second HTTP list request');
 const all=await histRowIds(p);
 assert.equal(new Set(all).size,3,'rows must be unique literal ids, never index-inferred');
 assert.deepEqual(all.slice().sort(),acks.map(a=>a.id).sort(),'both pages together must equal the three real commits');
 assert.equal(all.indexOf(page1[0]),0,'page1 order must be preserved before the appended page (opaque cursor order, no re-sorting)');
 checkClean(rec,'h2');
 await shot(p,'shot-1440-history-list-paginated.png');
});

// ── h3: empty state — signed-in account with zero saved records.
test('history list: a signed-in account with no saved records shows the empty state with zero rows and no error',async()=>{
 const acct=await account();
 const {p,rec}=await openPage();
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 await waitHistEmpty(p);
 assert.equal(await p.locator('[data-account-history="empty"]').textContent(),LIST_EMPTY);
 assert.equal(await histRows(p).count(),0);
 assert.equal(await p.locator('[data-account-history="error"]').count(),0);
 checkClean(rec,'h3');
 await shot(p,'shot-1440-history-list-empty.png');
});

// ── h4: REAL 401 through the accepted auth boundary — sanitized text,
// keyboard-accessible Retry, focus survives failure, recovery after the token
// is restored. No fixture involved: an invalid emulator token is rejected by
// the actual verifier/handler chain.
test('history list: a real 401 shows sanitized text and the keyboard Retry recovers after the valid token is restored',async()=>{
 const acct=await account();
 await commitTitled(acct.token,'Recovery mock');
 const {p,rec}=await openPage();
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 await waitHistRows(p,1);
 // Poison the token, then remount History: the fresh real list request 401s.
 await histSetToken(p,'invalid-token-for-real-401');
 await goHomeFrom(p);
 await goHistory(p);
 await waitHistError(p);
 assert.equal(await p.locator('[data-account-history="error"]').textContent(),LIST_ERR_UNVERIFIED);
 const body=await p.locator('[data-account-history="error"]').textContent();
 assert.ok(!body.includes('401')&&!body.includes('Bearer')&&!body.includes('authentication_required'),'no raw transport detail may be forwarded');
 const retry=p.locator('[data-account-history="retry"]');
 await retry.focus();
 assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.accountHistory),'retry','retry must be keyboard focusable');
 await p.keyboard.press('Enter');
 await waitHistError(p);
 assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.accountHistory),'retry','focus must survive a failed retry');
 await histSetToken(p,acct.token);
 await p.keyboard.press('Space');
 await waitHistRows(p,1);
 assert.deepEqual(await histRowTitles(p),['Recovery mock']);
 checkClean(rec,'h4');
 await shot(p,'shot-1440-history-list-retry-recovery.png');
});

// ── h5: labelled 503 fixture is sanitized; stale Retry after departure sends
// zero network; held ORIGINAL list response (route.fetch) released after
// departure never renders. r2 FIX-2: the withheld original body is verified
// (real 200 + expected record id/title) BEFORE departure/release.
test('history list: sanitized 503 fixture, stale retry zero network, and a held original response released after departure never renders',async()=>{
 const acct=await account();
 const ackHeld=await commitTitled(acct.token,'Held mock');
 const {p,rec}=await openPage();
 await connectHistoryHarness(p,acct);
 // (a) labelled 503 fixture → sanitized unavailable copy.
 await route503(p);
 await goHistory(p);
 await waitHistError(p);
 assert.equal(await p.locator('[data-account-history="error"]').textContent(),LIST_ERR_UNAVAILABLE);
 assert.ok(!(await p.locator('[data-account-history="error"]').textContent()).includes('storage_unavailable'));
 // (b) stale retry after departure: zero new requests.
 await p.evaluate(()=>{window.__staleHistRetry=document.querySelector('[data-account-history="retry"]');});
 await p.unroute(base+'/api/mocks?*');
 await goHomeFrom(p);
 const apiAfterDepart=rec.api.length;
 await p.evaluate(()=>window.__staleHistRetry.click());
 await settle(400);
 assert.equal(rec.api.length,apiAfterDepart,'a stale detached retry must cause zero network');
 assert.equal(await p.locator('[data-account-history]').count(),0,'departed History must render no account UI');
 // (c) held ORIGINAL response: real request via route.fetch, withheld fulfilment.
 const hold=await holdListRoutes(p);
 await goHistory(p);
 await waitHistLoad(p);
 // r2 FIX-2: prove the ORIGINAL account response actually exists and is
 // withheld BEFORE departure/release.
 const held5=await heldListSummary(hold);
 assert.ok(held5.ids.includes(ackHeld.id),'the withheld body must be the ORIGINAL account response carrying the committed record id');
 assert.ok(held5.titles.includes('Held mock'),'the withheld body must carry the original committed title');
 await goHomeFrom(p);
 await hold.release();
 await settle(600);
 assert.equal(await p.locator('[data-account-history]').count(),0,'a late held list success must never render after departure');
 // (d) normal re-entry afterwards.
 await goHistory(p);
 await waitHistRows(p,1);
 assert.deepEqual(await histRowTitles(p),['Held mock']);
 checkClean(rec,'h5');
});

// ── h6: controller replacement + explicit detach lifecycle while History
// stays mounted (list-vertical analogue of the accepted usage lifecycle).
// r2 FIX-2: A's withheld original body is verified BEFORE the replacement.
test('history list: controller A replaced by B shows only B contents, old detachA is inert, and explicit/repeated detach clears all private DOM',async()=>{
 const a=await account(),b=await account();
 const ackA=await commitTitled(a.token,'A-only mock');
 await commitTitled(b.token,'B-first mock');await commitTitled(b.token,'B-second mock');
 const {p,rec}=await openPage();
 await goHistory(p); // History stays mounted for the whole cycle
 await p.evaluate(async({uidA,tokenA,uidB,tokenB})=>{
  const sessionMod=await import('/backend/account-session.mjs');
  const clientMod=await import('/backend/mock-client.mjs');
  const historyMod=await import('/account-history.js');
  const app=await import('/app.js');
  const mk=async(uid,token)=>{
   const verifySession=async t=>{const r=await fetch('/api/session',{headers:{authorization:'Bearer '+t},credentials:'omit',cache:'no-store'});if(!r.ok)throw new Error('session verification failed: '+r.status);const j=await r.json();return {uid:j.uid};};
   const holder={controller:null};
   const session=sessionMod.createAccountSession({verifySession,onChange:s=>{if(holder.controller)holder.controller.handleSessionChange(s);}});
   const client=clientMod.createMockClient({session});
   holder.controller=historyMod.createAccountHistory({session,client});
   await session.setAccount({uid,getIdToken:async()=>token});
   return {controller:holder.controller,status:session.getState().status,uid:session.getState().uid};
  };
  const A=await mk(uidA,tokenA);
  const B=await mk(uidB,tokenB);
  window.__histLifecycle={app,A,B};
 },{uidA:a.uid,tokenA:a.token,uidB:b.uid,tokenB:b.token});
 // Hold A's ORIGINAL list request, attach A, then replace with B.
 const hold=await holdListRoutes(p);
 await p.evaluate(()=>{window.__histLifecycle.detachA=window.__histLifecycle.app.attachAccountHistory(window.__histLifecycle.A.controller);});
 await waitHistLoad(p);
 // r2 FIX-2: the withheld body must be A's ORIGINAL real response before the
 // replacement proceeds.
 const held6=await heldListSummary(hold);
 assert.ok(held6.ids.includes(ackA.id),'the withheld body must be A\'s ORIGINAL response carrying A\'s committed record id');
 assert.ok(held6.titles.includes('A-only mock'),'the withheld body must carry A\'s original committed title');
 await p.evaluate(()=>{window.__histLifecycle.detachB=window.__histLifecycle.app.attachAccountHistory(window.__histLifecycle.B.controller);});
 await waitHistRows(p,2);
 await p.unroute(base+'/api/mocks?*');
 await hold.release(); // A's held real reply resolves here and must be discarded
 await settle(600);
 assert.deepEqual((await histRowTitles(p)).slice().sort(),['B-first mock','B-second mock'],'only B contents may remain after replacement and A late release');
 await p.evaluate(()=>window.__histLifecycle.detachA());
 assert.deepEqual((await histRowTitles(p)).slice().sort(),['B-first mock','B-second mock'],'old detachA must not detach or alter B');
 assert.equal(await p.locator('[data-account-history="section"]').count(),1,'exactly one account section (B) may be mounted');
 // Explicit detach while History stays mounted clears ALL private DOM.
 const cleared=async where=>{
  assert.equal(await histSlotCount(p),0,'detach while History stays mounted must clear the slot: '+where);
  assert.equal(await p.locator('[data-account-history]').count(),0,'no private row/error/status may remain: '+where);
  assert.equal(await p.getByRole('heading',{name:'Mock history'}).count(),1,'History must stay mounted: '+where);
 };
 await p.evaluate(()=>window.__histLifecycle.detachB());
 await cleared('explicit detach');
 await p.evaluate(()=>window.__histLifecycle.detachB());
 await cleared('repeated detach');
 checkClean(rec,'h6');
 await shot(p,'shot-1440-history-list-lifecycle.png');
});

// ── h7: held request across switch/logout/same-UID restoration — obsolete
// replies discarded, cleared immediately, fresh generation reloads.
// r2 FIX-2: each held body is verified as the ORIGINAL owner's real response
// before switch/release. r2 FIX-3: the same-UID portion now withholds an
// ACTUAL already-dispatched signed-in B load, verifies that original B body,
// logs out (immediate clear), restores the SAME UID with a fresh non-held
// response, and releases the obsolete heldB LAST.
test('history list: switch, logout and same-UID restoration during a held original request discard stale replies and reload fresh',async()=>{
 const a=await account(),b=await account();
 const ackA=await commitTitled(a.token,'A-held mock');
 const ackB1=await commitTitled(b.token,'B1-held mock');const ackB2=await commitTitled(b.token,'B2-held mock');
 const {p,rec}=await openPage();
 await connectHistoryHarness(p,a);
 const hold=await holdListRoutes(p);
 await goHistory(p);
 await waitHistLoad(p);
 // r2 FIX-2: A's ORIGINAL real response must be actually withheld before the
 // switch proceeds.
 const heldA=await heldListSummary(hold);
 assert.ok(heldA.ids.includes(ackA.id),'the withheld body must be A\'s ORIGINAL response carrying A\'s committed record id');
 assert.ok(heldA.titles.includes('A-held mock'),'the withheld body must carry A\'s original committed title');
 // Switch to B while A's original reply is held: immediate clear, then B rows.
 await p.evaluate(async({uid,token})=>{const h=window.__uicHistoryHarness;h.accounts[uid]=token;await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});},{uid:b.uid,token:b.token});
 const during=await p.evaluate(()=>document.getElementById('account-history-slot')?.textContent??'');
 assert.ok(!during.includes('A-held mock'),'obsolete account data must not be displayed during switch: '+JSON.stringify(during));
 await p.unroute(base+'/api/mocks?*');
 await hold.release();
 await waitHistRows(p,2);
 assert.deepEqual((await histRowTitles(p)).slice().sort(),['B1-held mock','B2-held mock']);
 await settle(600);
 assert.deepEqual((await histRowTitles(p)).slice().sort(),['B1-held mock','B2-held mock'],'a late obsolete reply must not replace the current account view');
 // r2 FIX-3: logout + same-UID restoration must invalidate an ALREADY
 // DISPATCHED held signed-in B load. Initiate that real held request while B
 // is still signed in (History remount), verify the withheld original B body,
 // then logout(clear), restore the SAME UID (fresh response), and release the
 // obsolete heldB LAST.
 const hold2=await holdListRoutes(p);
 await goHomeFrom(p);
 await goHistory(p);
 await waitHistLoad(p);
 const heldB=await heldListSummary(hold2);
 assert.deepEqual(heldB.ids.slice().sort(),[ackB1.id,ackB2.id].sort(),'the withheld body must be the ORIGINAL signed-in B response');
 assert.ok(heldB.titles.includes('B1-held mock')&&heldB.titles.includes('B2-held mock'),'the withheld body must carry B\'s original committed titles');
 await histLogout(p);
 for(let i=0;i<20;i++){const t=await p.evaluate(()=>document.getElementById('account-history-slot')?.textContent??'');assert.equal(t,'','logout must clear the private display immediately');await settle(25);}
 await histRestore(p,b);
 await waitHistRows(p,2);
 assert.deepEqual((await histRowTitles(p)).slice().sort(),['B1-held mock','B2-held mock'],'same-UID restoration must obtain a FRESH response without waiting on the obsolete held load');
 await hold2.release(); // obsolete heldB released LAST
 await settle(600);
 assert.deepEqual((await histRowTitles(p)).slice().sort(),['B1-held mock','B2-held mock'],'a stale same-UID held reply released after restoration must never overwrite the fresh view');
 checkClean(rec,'h7');
});

// ── h8: default anonymous History — no seam use, no account UI, zero
// private network, zero storage writes beyond the legitimate navigation
// baseline. r2 FIX-1: the counter is baselined AFTER each navigation write
// and the zero-EXTRA-write requirement is asserted against that baseline;
// stored browser-local blob preservation is asserted explicitly.
test('history list: default anonymous preview renders no account catalogue and performs zero private network or storage writes',async()=>{
 const {p,rec}=await openPage();
 const storedSeed=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const apiBefore=rec.api.length;
 await goHistory(p);
 // r2 FIX-1: baseline AFTER the legitimate History navigation write.
 const writesAfterNav1=await p.evaluate(()=>window.__uicHistWrites);
 await settle(500);
 assert.equal(await p.locator('[data-account-history]').count(),0,'no account-history UI may render without an explicit harness connection');
 assert.ok(await p.evaluate(()=>{const s=document.getElementById('account-history-slot');return s===null||s.childElementCount===0;}),'the History slot must stay empty when no controller is attached');
 assert.equal(await p.evaluate(()=>window.__uicHistWrites),writesAfterNav1,'settling on anonymous History must add ZERO storage writes beyond the navigation baseline');
 await goHomeFrom(p);await goHistory(p);
 // r2 FIX-1: re-baseline AFTER the legitimate Home/History navigation writes.
 const writesAfterNav2=await p.evaluate(()=>window.__uicHistWrites);
 await settle(500);
 assert.equal(rec.api.length,apiBefore,'anonymous History visits must issue zero /api or /backend requests');
 assert.equal(await p.evaluate(()=>window.__uicHistWrites),writesAfterNav2,'anonymous History revisits must add ZERO storage writes beyond the navigation baseline');
 const storedNow=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.deepEqual(storedNow.mocks,storedSeed.mocks,'stored browser-local mocks must be preserved across anonymous History visits');
 assert.equal(storedNow.used,storedSeed.used,'stored browser-local counter must be preserved across anonymous History visits');
 checkClean(rec,'h8');
 await shot(p,'shot-1440-history-list-anonymous.png');
});

// ── h9: textual injection stays literal in list summaries.
test('history list: a hostile committed title renders as literal text with no injected nodes',async()=>{
 const acct=await account();
 const hostile='<img src=x onerror=alert(1)> Fictional <script>window.__pwn=1</'+'script>';
 await commitTitled(acct.token,hostile);
 const {p,rec}=await openPage();
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 await waitHistRows(p,1);
 assert.equal((await histRowTitles(p))[0],hostile,'the hostile title must render verbatim as text');
 assert.equal(await p.locator('[data-account-history="section"] img').count(),0,'no injected img node');
 assert.equal(await p.evaluate(()=>window.__pwn??null),null,'no script execution');
 checkClean(rec,'h9');
});
// ── END account-history list vertical append ──
// ── BEGIN account-history detail vertical append (d1 primary) ──
// Derived append (account-history-contract.md READ-ONLY DETAIL/open/back
// vertical): the ONE primary behavioral regression appended to the immutable
// r2 list harness (848ecdda…). Inverse proof: truncating this exact append
// (everything from the BEGIN marker to EOF) reproduces
// ui-cloud-account-history-list-r2.test.mjs byte-exact. No list test or r2
// helper is modified. Uses the existing r2 helpers with real Auth/Firestore
// emulator + HTTP commits carrying known note/review content that is NOT
// present in any list summary. Detail copy pins (match the owned
// account-history.js fixed read-only projection):
//   'DM mode: <mode>', '<SEC>: <earned> / <max>', 'SJT: not recorded'.
const DETAIL_NOTE='Fictional private detail note 7c1 not present in any list summary';
const DETAIL_THINKING='Fictional private detail thinking 9d4 not present in any list summary';
const DETAIL_FREE='Fictional free reflection 3b8 not present in any list summary';
const detailSel='[data-account-history="detail"]';
const waitDetail=async p=>{await p.waitForSelector(detailSel,{timeout:15000});};
const itemCount=rec=>rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length;
async function commitDetailed(token,{title='Fictional detail mock',provider='Fictional detail provider',note=DETAIL_NOTE,reviews=null,id=null}={}){
 const d=draft();d.title=title;d.provider=provider;d.note=note;
 if(id!==null)d.id=id;
 d.reviews=reviews===null?[{section:'VR',number:'1',format:'guided',thinking:DETAIL_THINKING,instead:'',free:'',type:'',reasons:[],other:'',reviewed:false,confirmed:false},{section:'QR',number:'2',format:'free',thinking:'',instead:'',free:DETAIL_FREE,type:'',reasons:[],other:'',reviewed:true,confirmed:true}]:reviews;
 const r=await fetch(base+'/api/mocks/commit',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify(d)});
 const b=await r.json();if(![200,201].includes(r.status))harness(`detailed commit failed ${r.status} ${JSON.stringify(b)}`);return b;
}
// True-failure evidence: screenshot + full DOM captured while the page is
// still alive (catch, before rethrow), distinct from any fixture failure.
async function captureFailure(p,where){
 try{await p.screenshot({path:new URL(`FAIL-${where}.png`,out).pathname,fullPage:true});}catch{}
 try{await fs.writeFile(new URL(`FAIL-${where}-dom.html`,out),await p.evaluate(()=>document.documentElement.outerHTML));}catch{}
}

// ── d1: PRIMARY detail/open/back regression. A native Open control on the
// real committed row fetches the ACTUAL full saved record via the accepted
// same-session createMockIntent.getMock(literal summary id) and renders the
// fixed read-only projection (title/provider/loggedAt/raw scores+mode/
// optional SJT/note/question reviews — full stored content, never derived
// from the summary); Back stays available and returns to the account list
// via a fresh list load under a new list ownership token. Zero storage
// writes, browser-local blob/counter preserved, no edit/delete/save.
test('history detail: Open renders the actual full saved record read-only and Back returns to a fresh account list',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const {p,rec}=await openPage(1440);
 try{
  await connectHistoryHarness(p,acct);
  await goHistory(p);
  // Write-counting shim installed AFTER the legitimate navigation write:
  // account detail operations must add zero further storage writes.
  await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
  await waitHistRows(p,1);
  // Native keyboard-operable Open control carrying the literal summary id.
  const open=p.locator('[data-account-history="row"] [data-account-history="open"]');
  assert.equal(await open.count(),1,'each account row must offer a native Open control');
  const itemsBefore=itemCount(rec);
  await open.focus();
  assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.accountHistory),'open','Open must be keyboard focusable');
  await p.keyboard.press('Enter');
  await waitDetail(p);
  assert.ok(itemCount(rec)>itemsBefore,'detail must be fetched via a real getMock HTTP request over the accepted client chain');
  assert.equal(await p.locator(detailSel).getAttribute('data-account-history-id'),ack.id,'detail must carry the literal committed record id');
  assert.equal(await p.locator('[data-account-history="detail-title"]').textContent(),'Fictional detail mock');
  const meta=await p.locator('[data-account-history="detail-meta"]').textContent();
  assert.ok(meta.includes('Fictional detail provider'),'detail meta must show the actual stored provider: '+meta);
  assert.ok(/Logged \d{2}\/\d{2}\/\d{4}/.test(meta),'detail meta must show the logged date: '+meta);
  assert.equal(await p.locator('[data-account-history="detail-mode"]').textContent(),'DM mode: questions');
  const scores=await p.locator('[data-account-history="detail-score"]').allTextContents();
  assert.deepEqual(scores,['VR: 30 / 44','DM: 25 / 35','QR: 25 / 36'],'raw stored scores must render verbatim with no invented conversion');
  assert.equal(await p.locator('[data-account-history="detail-sjt"]').textContent(),'SJT: not recorded');
  assert.equal(await p.locator('[data-account-history="detail-note"]').textContent(),DETAIL_NOTE,'the FULL stored note must render literally (content absent from the list summary)');
  const reviews=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.equal(reviews.length,2,'both stored question reviews must render');
  assert.ok(reviews[0].includes('VR')&&reviews[0].includes('Question 1')&&reviews[0].includes(DETAIL_THINKING),'full stored review content must render literally: '+reviews[0]);
  assert.ok(reviews[1].includes('QR')&&reviews[1].includes('Question 2')&&reviews[1].includes(DETAIL_FREE),'full stored free reflection must render literally: '+reviews[1]);
  // Read-only: no edit/delete/save controls anywhere in the account slot.
  assert.equal(await p.locator('#account-history-slot button').evaluateAll(els=>els.filter(e=>/save|delete|edit/i.test(e.textContent)).length),0,'detail must expose no save/edit/delete controls');
  // Browser-local blob/counter untouched; zero extra storage writes.
  const stored=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
  assert.deepEqual(stored.mocks,[],'retrieved account detail must never merge into state.mocks/localStorage');
  assert.equal(stored.used,0,'account detail reads must not touch the browser-local counter');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'detail open/render must add zero storage writes');
  checkClean(rec,'d1-detail');
  await shot(p,'shot-1440-history-detail-open.png');
  await fs.writeFile(new URL('d1-detail-dom-snapshot.html',out),await p.locator('#account-history-slot').innerHTML());
  // Back (keyboard) returns to the account list via a FRESH list load.
  const listsBefore=listCount(rec);
  const back=p.locator('[data-account-history="back"]');
  assert.equal(await back.count(),1,'a Back to account list action must remain available in the detail subview');
  await back.focus();
  await p.keyboard.press('Enter');
  await waitHistRows(p,1);
  assert.equal(await p.locator(detailSel).count(),0,'Back must leave the detail subview');
  assert.ok(listCount(rec)>listsBefore,'Back must reload the account list under a fresh list ownership token');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'Back/list reload must add zero storage writes');
  checkClean(rec,'d1-back');
  await shot(p,'shot-1440-history-detail-back.png');
  // Mobile 390 detail render.
  const {p:pm,rec:recm}=await openPage(390);
  await connectHistoryHarness(pm,acct);
  await goHistory(pm);
  await waitHistRows(pm,1);
  await pm.locator('[data-account-history="open"]').click();
  await waitDetail(pm);
  assert.equal(await pm.locator('[data-account-history="detail-note"]').textContent(),DETAIL_NOTE);
  checkClean(recm,'d1-mobile');
  await shot(pm,'shot-390-history-detail-open.png');
 }catch(e){await captureFailure(p,'d1');throw e;}
});

// ── Expanded focused DETAIL coverage (d2–d9), appended after the d1 primary
// GREEN. Reuses r2 list helpers and the accepted hold-route readiness/body
// proof pattern (route.fetch + withheld fulfilment; original status/id/
// content proven BEFORE departure/switch/release). No authorization tokens
// are printed. 503s are explicitly labelled browser-layer fixtures
// (instrumentation, not backend outage claims); 401s are REAL auth-boundary
// failures via a poisoned injected token.
const DETAIL_LOADING_TEXT='Loading saved mock…';
const DETAIL_ERR_UNAVAILABLE='This saved mock is temporarily unavailable. Your browser-local history is unchanged.';
const DETAIL_ERR_UNVERIFIED='Account access could not be verified. This saved mock is not shown.';
const waitDetailLoad=async p=>{await p.waitForFunction(t=>document.querySelector('[data-account-history="detail-status"]')?.textContent===t,DETAIL_LOADING_TEXT,{timeout:15000});};
const waitDetailError=async p=>{await p.waitForSelector('[data-account-history="detail-error"]',{timeout:15000});};
const detailTitle=p=>p.locator('[data-account-history="detail-title"]').textContent();
const detailNote=p=>p.locator('[data-account-history="detail-note"]').textContent();
const slotText=p=>p.evaluate(()=>document.getElementById('account-history-slot')?.textContent??'');
const openRowById=async(p,id)=>{await p.locator(`[data-account-history="row"][data-account-history-id="${id}"] [data-account-history="open"]`).click();};
const histSwitch=async(p,acct)=>p.evaluate(async({uid,token})=>{const h=window.__uicHistoryHarness;h.accounts[uid]=token;await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});},{uid:acct.uid,token:acct.token});
const routeItem503=p=>p.route(base+'/api/mocks/item?id=*',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})}));
const qReview=(section,number,{thinking='',free='',format='guided',reviewed=false,confirmed=false}={})=>({section,number:String(number),format,thinking,instead:'',free,type:'',reasons:[],other:'',reviewed,confirmed});
// Held ORIGINAL detail responses: the real request reaches the real server
// via route.fetch; the real reply is withheld until released. Only-first-
// request semantics (only=1) so a later second-record getMock is never blocked.
async function holdItemRoutes(p,{only=1,timeoutMs=15000}={}){
 const held=[];let heldCount=0;
 await p.route(base+'/api/mocks/item?id=*',async route=>{if(heldCount>=only){await route.continue();return;}heldCount++;const resp=await route.fetch();const body=await resp.text();held.push({route,resp,body,status:resp.status()});});
 const waitHeld=async(n=1,ms=timeoutMs)=>{const t0=Date.now();while(held.length<n){if(Date.now()-t0>ms)harness(`held detail response not captured within ${ms}ms (held=${held.length}/${n}) — route.fetch readiness timed out`);await new Promise(r=>setTimeout(r,50));}return held.length;};
 const heldBodies=()=>held.map(h=>({status:h.status,body:h.body}));
 const release=async()=>{while(held.length){const h=held.shift();try{await h.route.fulfill({response:h.resp,body:h.body});}catch{}}};
 const pending=()=>held.length;
 return {release,pending,waitHeld,heldBodies};
}
// Prove the withheld ORIGINAL detail response actually existed and belongs to
// the expected record/owner BEFORE any departure/switch/release. Prints no
// transport detail beyond record content (never authorization tokens).
async function heldItemDetail(hold,timeoutMs=15000){
 await hold.waitHeld(1,timeoutMs);
 const first=hold.heldBodies()[0];
 assert.equal(first.status,200,'the withheld ORIGINAL detail response must be a real HTTP 200, got '+first.status);
 let parsed;try{parsed=JSON.parse(first.body);}catch(e){harness('held detail body is not valid JSON: '+e.message);}
 assert.ok(parsed&&parsed.mock&&typeof parsed.mock.id==='string','held detail body must carry the full stored mock record');
 return {status:first.status,mock:parsed.mock};
}

// ── d2: account isolation — the SAME literal record id under two fictional
// owners shows each owner only its own full stored content (real seed/commit
// helpers; one quota credit each; no bypass).
test('history detail: the same literal record id under two fictional owners renders each owner its own full stored content',async()=>{
 const a=await account(),b=await account();
 const sharedId=randomUUID();
 await commitDetailed(a.token,{id:sharedId,title:'Shared-id A mock',note:'A-only full note 111 not in any summary',reviews:[qReview('VR',1,{thinking:'A-only thinking 222 not in any summary'})]});
 await commitDetailed(b.token,{id:sharedId,title:'Shared-id B mock',note:'B-only full note 333 not in any summary',reviews:[qReview('QR',3,{free:'B-only reflection 444 not in any summary',format:'free',reviewed:true,confirmed:true})]});
 const {p,rec}=await openPage();
 try{
  await connectHistoryHarness(p,a);
  await goHistory(p);
  await waitHistRows(p,1);
  await openRowById(p,sharedId);
  await waitDetail(p);
  assert.equal(await detailTitle(p),'Shared-id A mock');
  assert.equal(await p.locator(detailSel).getAttribute('data-account-history-id'),sharedId,'the literal shared id must be preserved');
  assert.equal(await detailNote(p),'A-only full note 111 not in any summary');
  assert.ok((await p.locator('[data-account-history="detail-review"]').first().textContent()).includes('A-only thinking 222 not in any summary'));
  assert.ok(!(await slotText(p)).includes('B-only'),'A must never see B content under the same literal id');
  await p.locator('[data-account-history="back"]').click();
  await waitHistRows(p,1);
  await histSwitch(p,b);
  await waitHistRows(p,1);
  assert.deepEqual(await histRowTitles(p),['Shared-id B mock']);
  await openRowById(p,sharedId);
  await waitDetail(p);
  assert.equal(await detailTitle(p),'Shared-id B mock');
  assert.equal(await detailNote(p),'B-only full note 333 not in any summary');
  assert.ok(!(await slotText(p)).includes('A-only'),'B must never see A content under the same literal id');
  checkClean(rec,'d2');
  await shot(p,'shot-1440-history-detail-isolation.png');
 }catch(e){await captureFailure(p,'d2');throw e;}
});

// ── d3: held ORIGINAL detail response proven before departure; late release
// after departure never renders; normal re-entry afterwards.
test('history detail: a held original detail response proven before departure never renders after late release',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token,{title:'Held detail mock',note:DETAIL_NOTE});
 const {p,rec}=await openPage();
 try{
  await connectHistoryHarness(p,acct);
  const hold=await holdItemRoutes(p);
  await goHistory(p);
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetailLoad(p);
  const held=await heldItemDetail(hold);
  assert.equal(held.mock.id,ack.id,'the withheld body must be the ORIGINAL record response');
  assert.equal(held.mock.note,DETAIL_NOTE,'the withheld body must carry the actual stored note');
  assert.ok(held.mock.reviews.some(q=>q.thinking===DETAIL_THINKING),'the withheld body must carry the actual stored review content');
  await goHomeFrom(p);
  await hold.release();
  await settle(600);
  assert.equal(await p.locator('[data-account-history]').count(),0,'a late held detail success must never render after departure');
  await goHistory(p);
  await waitHistRows(p,1);
  checkClean(rec,'d3');
 }catch(e){await captureFailure(p,'d3');throw e;}
});

// ── d4: reachable OVERLAPPING real selections — OpenA held, Back (available
// during loading) to a fresh list, OpenB while A is still held; the obsolete
// held A is released LAST and never presents. Only B renders.
test('history detail: overlapping selections render only the last record and an obsolete held selection released last never presents',async()=>{
 const acct=await account();
 const ackA=await commitDetailed(acct.token,{title:'Overlap A mock',note:'A overlap note 555'});
 const ackB=await commitDetailed(acct.token,{title:'Overlap B mock',note:'B overlap note 666'});
 const {p,rec}=await openPage();
 try{
  await connectHistoryHarness(p,acct);
  const hold=await holdItemRoutes(p,{only:1}); // only A's getMock is held
  await goHistory(p);
  await waitHistRows(p,2);
  await openRowById(p,ackA.id);
  await waitDetailLoad(p); // A is loading and held
  // Back stays available during loading and returns via a fresh list load.
  await p.locator('[data-account-history="back"]').click();
  await waitHistRows(p,2);
  assert.equal(await p.locator(detailSel).count(),0,'Back during loading must leave the detail subview');
  await openRowById(p,ackB.id); // second REAL overlapping selection while A held
  await waitDetail(p);
  assert.equal(await detailTitle(p),'Overlap B mock');
  assert.equal(await p.locator(detailSel).getAttribute('data-account-history-id'),ackB.id);
  // Prove the withheld body is A's ORIGINAL response before releasing it.
  const held=await heldItemDetail(hold);
  assert.equal(held.mock.id,ackA.id);
  assert.equal(held.mock.note,'A overlap note 555');
  await p.unroute(base+'/api/mocks/item?id=*');
  await hold.release(); // obsolete held A released LAST
  await settle(600);
  assert.equal(await p.locator(detailSel).count(),1,'exactly one detail (the last selection) may be mounted');
  assert.equal(await detailTitle(p),'Overlap B mock','the obsolete held A selection must never replace B');
  assert.ok(!(await slotText(p)).includes('A overlap note 555'));
  checkClean(rec,'d4');
  await shot(p,'shot-1440-history-detail-overlap.png');
 }catch(e){await captureFailure(p,'d4');throw e;}
});

// ── d5: switch / logout / same-UID restoration during held original detail
// responses — stale replies discarded, immediate clear, fresh response on
// restoration, obsolete held reply released LAST.
test('history detail: switch, logout and same-UID restoration during held original detail responses discard stale replies',async()=>{
 const a=await account(),b=await account();
 const ackA=await commitDetailed(a.token,{title:'A held detail mock',note:'A held detail note 777'});
 const ackB=await commitDetailed(b.token,{title:'B held detail mock',note:'B held detail note 888'});
 const {p,rec}=await openPage();
 try{
  await connectHistoryHarness(p,a);
  const hold=await holdItemRoutes(p);
  await goHistory(p);
  await waitHistRows(p,1);
  await openRowById(p,ackA.id);
  await waitDetailLoad(p);
  const heldA=await heldItemDetail(hold);
  assert.equal(heldA.mock.id,ackA.id,'the withheld body must be A\'s ORIGINAL detail response');
  assert.equal(heldA.mock.note,'A held detail note 777');
  await histSwitch(p,b); // switch while A's original reply is held
  await p.unroute(base+'/api/mocks/item?id=*');
  await hold.release();
  await waitHistRows(p,1);
  assert.deepEqual(await histRowTitles(p),['B held detail mock']);
  await settle(600);
  assert.ok(!(await slotText(p)).includes('A held detail note 777'),'a late obsolete detail reply must never present after switch');
  // Same-UID restoration: hold an ACTUAL signed-in B detail load, verify the
  // withheld original B body, logout (immediate clear), restore the SAME UID,
  // obtain a fresh detail response, release the obsolete heldB LAST.
  const hold2=await holdItemRoutes(p);
  await openRowById(p,ackB.id);
  await waitDetailLoad(p);
  const heldB=await heldItemDetail(hold2);
  assert.equal(heldB.mock.id,ackB.id,'the withheld body must be the ORIGINAL signed-in B detail response');
  assert.equal(heldB.mock.note,'B held detail note 888');
  await histLogout(p);
  for(let i=0;i<20;i++){assert.equal(await slotText(p),'','logout must clear the private detail display immediately');await settle(25);}
  await histRestore(p,b);
  await waitHistRows(p,1);
  await p.unroute(base+'/api/mocks/item?id=*');
  await openRowById(p,ackB.id); // fresh non-held response after restoration
  await waitDetail(p);
  assert.equal(await detailNote(p),'B held detail note 888','same-UID restoration must obtain a FRESH detail response');
  await hold2.release(); // obsolete heldB released LAST
  await settle(600);
  assert.equal(await p.locator(detailSel).count(),1);
  assert.equal(await detailNote(p),'B held detail note 888','a stale same-UID held detail reply released after restoration must never overwrite the fresh view');
  checkClean(rec,'d5');
 }catch(e){await captureFailure(p,'d5');throw e;}
});

// ── d6: controller replacement clears a held detail; old detachA inert;
// explicit/repeated detach clears detail, error AND loading states.
test('history detail: controller replacement clears a held detail, old detachA is inert, and detach clears detail, error and loading',async()=>{
 const a=await account(),b=await account();
 const ackA=await commitDetailed(a.token,{title:'A detach mock',note:'A detach note 999'});
 const ackB1=await commitDetailed(b.token,{title:'B first detach mock',note:'B1 note'});
 const ackB2=await commitDetailed(b.token,{title:'B second detach mock',note:'B2 note'});
 const {p,rec}=await openPage();
 try{
  await goHistory(p); // History stays mounted for the whole cycle
  await p.evaluate(async({uidA,tokenA,uidB,tokenB})=>{
   const sessionMod=await import('/backend/account-session.mjs');
   const clientMod=await import('/backend/mock-client.mjs');
   const historyMod=await import('/account-history.js');
   const app=await import('/app.js');
   const mk=async(uid,token)=>{
    const verifySession=async t=>{const r=await fetch('/api/session',{headers:{authorization:'Bearer '+t},credentials:'omit',cache:'no-store'});if(!r.ok)throw new Error('session verification failed: '+r.status);const j=await r.json();return {uid:j.uid};};
    const holder={controller:null};
    const session=sessionMod.createAccountSession({verifySession,onChange:s=>{if(holder.controller)holder.controller.handleSessionChange(s);}});
    const client=clientMod.createMockClient({session});
    holder.controller=historyMod.createAccountHistory({session,client});
    await session.setAccount({uid,getIdToken:async()=>token});
    return {controller:holder.controller};
   };
   const A=await mk(uidA,tokenA);
   const B=await mk(uidB,tokenB);
   window.__histDetailLifecycle={app,A,B};
  },{uidA:a.uid,tokenA:a.token,uidB:b.uid,tokenB:b.token});
  const hold=await holdItemRoutes(p);
  await p.evaluate(()=>{window.__histDetailLifecycle.detachA=window.__histDetailLifecycle.app.attachAccountHistory(window.__histDetailLifecycle.A.controller);});
  await waitHistRows(p,1);
  await openRowById(p,ackA.id);
  await waitDetailLoad(p);
  const held=await heldItemDetail(hold);
  assert.equal(held.mock.id,ackA.id,'the withheld body must be A\'s ORIGINAL detail response before the replacement');
  // Replace A with B while A's detail load is held: replacement unmounts A.
  await p.evaluate(()=>{window.__histDetailLifecycle.detachB=window.__histDetailLifecycle.app.attachAccountHistory(window.__histDetailLifecycle.B.controller);});
  await waitHistRows(p,2);
  assert.equal(await p.locator(detailSel).count(),0,'replacement must clear A\'s in-flight detail subview');
  await p.unroute(base+'/api/mocks/item?id=*');
  await hold.release();
  await settle(600);
  assert.ok(!(await slotText(p)).includes('A detach note 999'),'A\'s held detail must never present under B');
  await p.evaluate(()=>window.__histDetailLifecycle.detachA());
  assert.deepEqual((await histRowTitles(p)).slice().sort(),['B first detach mock','B second detach mock'],'old detachA must not detach or alter B');
  const cleared=async where=>{
   assert.equal(await histSlotCount(p),0,'detach while History stays mounted must clear the slot: '+where);
   assert.equal(await p.locator('[data-account-history]').count(),0,'no private detail/row/error/status may remain: '+where);
   assert.equal(await p.getByRole('heading',{name:'Mock history'}).count(),1,'History must stay mounted: '+where);
  };
  // Detach clears an ERROR detail state.
  await p.evaluate(()=>{window.__histDetailLifecycle.detachB2=window.__histDetailLifecycle.app.attachAccountHistory(window.__histDetailLifecycle.B.controller);});
  await waitHistRows(p,2);
  await routeItem503(p);
  await openRowById(p,ackB1.id);
  await waitDetailError(p);
  await p.evaluate(()=>window.__histDetailLifecycle.detachB2());
  await cleared('detach with detail error mounted');
  await p.evaluate(()=>window.__histDetailLifecycle.detachB2());
  await cleared('repeated detach after error');
  // Detach clears a LOADING detail state (held) — late release never renders.
  await p.unroute(base+'/api/mocks/item?id=*');
  await p.evaluate(()=>{window.__histDetailLifecycle.detachB3=window.__histDetailLifecycle.app.attachAccountHistory(window.__histDetailLifecycle.B.controller);});
  await waitHistRows(p,2);
  const hold2=await holdItemRoutes(p);
  await openRowById(p,ackB1.id);
  await waitDetailLoad(p);
  await heldItemDetail(hold2); // original B1 body proven before detach
  await p.evaluate(()=>window.__histDetailLifecycle.detachB3());
  await cleared('detach with detail loading held');
  await p.unroute(base+'/api/mocks/item?id=*');
  await hold2.release();
  await settle(600);
  await cleared('after held release post-detach');
  checkClean(rec,'d6');
  await shot(p,'shot-1440-history-detail-lifecycle.png');
 }catch(e){await captureFailure(p,'d6');throw e;}
});

// ── d7: stale detached Open / Retry / Back controls send zero private
// network after departure (live JS references clicked post-departure).
test('history detail: stale detached Open, Retry and Back controls send zero private requests',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token,{title:'Stale control mock'});
 const {p,rec}=await openPage();
 try{
  await connectHistoryHarness(p,acct);
  await goHistory(p);
  await waitHistRows(p,1);
  // (a) stale Open after departure.
  await p.evaluate(id=>{window.__staleOpen=document.querySelector(`[data-account-history="row"][data-account-history-id="${id}"] [data-account-history="open"]`);},ack.id);
  await goHomeFrom(p);
  let apiBefore=rec.api.length;
  await p.evaluate(()=>window.__staleOpen.click());
  await settle(400);
  assert.equal(rec.api.length,apiBefore,'a stale detached Open must cause zero network');
  assert.equal(await p.locator('[data-account-history]').count(),0);
  // (b) stale detail Retry and Back after departure.
  await goHistory(p);
  await waitHistRows(p,1);
  await routeItem503(p);
  await openRowById(p,ack.id);
  await waitDetailError(p);
  await p.evaluate(()=>{window.__staleDetailRetry=document.querySelector('[data-account-history="retry"]');window.__staleDetailBack=document.querySelector('[data-account-history="back"]');});
  await p.unroute(base+'/api/mocks/item?id=*');
  await goHomeFrom(p);
  apiBefore=rec.api.length;
  await p.evaluate(()=>{window.__staleDetailRetry.click();window.__staleDetailBack.click();});
  await settle(400);
  assert.equal(rec.api.length,apiBefore,'stale detached detail Retry/Back must cause zero network');
  assert.equal(await p.locator('[data-account-history]').count(),0,'departed History must render no account UI');
  checkClean(rec,'d7');
 }catch(e){await captureFailure(p,'d7');throw e;}
});

// ── d8: REAL 401 (poisoned injected token through the accepted auth
// boundary) and explicitly labelled 503 fixture: sanitized typed copy, Back
// available during the error, keyboard Retry with focus survival, recovery.
test('history detail: a real 401 and a labeled 503 fixture show sanitized text and the keyboard Retry recovers',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token,{title:'Error detail mock'});
 const {p,rec}=await openPage();
 try{
  await connectHistoryHarness(p,acct);
  await goHistory(p);
  await waitHistRows(p,1);
  // (a) REAL 401 at the detail boundary.
  await histSetToken(p,'invalid-token-for-real-401');
  await openRowById(p,ack.id);
  await waitDetailError(p);
  assert.equal(await p.locator('[data-account-history="detail-error"]').textContent(),DETAIL_ERR_UNVERIFIED);
  const body=await p.locator('[data-account-history="detail-error"]').textContent();
  assert.ok(!body.includes('401')&&!body.includes('Bearer')&&!body.includes('authentication_required'),'no raw transport detail may be forwarded');
  assert.equal(await p.locator('[data-account-history="back"]').count(),1,'Back must remain available during a detail error');
  const retry=p.locator('[data-account-history="retry"]');
  await retry.focus();
  assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.accountHistory),'retry','detail retry must be keyboard focusable');
  await p.keyboard.press('Enter');
  await waitDetailError(p);
  assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.accountHistory),'retry','focus must survive a failed detail retry');
  await histSetToken(p,acct.token);
  await p.keyboard.press('Space');
  await waitDetail(p);
  assert.equal(await detailTitle(p),'Error detail mock');
  // (b) labelled 503 fixture at the detail boundary.
  await p.locator('[data-account-history="back"]').click();
  await waitHistRows(p,1);
  await routeItem503(p);
  await openRowById(p,ack.id);
  await waitDetailError(p);
  assert.equal(await p.locator('[data-account-history="detail-error"]').textContent(),DETAIL_ERR_UNAVAILABLE);
  assert.ok(!(await p.locator('[data-account-history="detail-error"]').textContent()).includes('storage_unavailable'));
  await p.unroute(base+'/api/mocks/item?id=*');
  await p.locator('[data-account-history="retry"]').focus();
  await p.keyboard.press('Enter');
  await waitDetail(p);
  assert.equal(await detailTitle(p),'Error detail mock','keyboard Retry must recover the detail after the fixture clears');
  checkClean(rec,'d8');
  await shot(p,'shot-1440-history-detail-error-recovery.png');
 }catch(e){await captureFailure(p,'d8');throw e;}
});

// ── d9: hostile full-detail content (title/note/review text) renders as
// literal text via textContent — no injected nodes, no script execution.
test('history detail: hostile full-detail content renders as literal text with no injected nodes',async()=>{
 const acct=await account();
 const hostileNote='<img src=x onerror=alert(1)> Hostile note <script>window.__pwnDetail=1</'+'script>';
 const hostileThinking='"><b>bold</b> <script>window.__pwnReview=1</'+'script> hostile thinking';
 const ack=await commitDetailed(acct.token,{title:'Hostile detail mock',note:hostileNote,reviews:[qReview('DM',2,{thinking:hostileThinking})]});
 const {p,rec}=await openPage();
 try{
  await connectHistoryHarness(p,acct);
  await goHistory(p);
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  assert.equal(await detailNote(p),hostileNote,'the hostile note must render verbatim as text');
  assert.ok((await p.locator('[data-account-history="detail-review"]').first().textContent()).includes(hostileThinking),'the hostile review text must render verbatim');
  assert.equal(await p.locator('#account-history-slot img').count(),0,'no injected img node');
  assert.equal(await p.locator('#account-history-slot script').count(),0,'no injected script node');
  assert.equal(await p.evaluate(()=>(window.__pwnDetail??null)==null&&(window.__pwnReview??null)==null?null:'executed'),null,'no script execution');
  checkClean(rec,'d9');
 }catch(e){await captureFailure(p,'d9');throw e;}
});
// ── END account-history detail vertical append (d1 primary + d2–d9 coverage) ──
// BEGIN uic-current-backend-append — current-backend Node dependency pin
// seam checks (derived-harness-only append; truncate-at-marker proof above).
test('current backend: integration server refuses to start with a wrong request-rate-limit pin',async()=>{
 const pins={...GATE197,'request-rate-limit.mjs':'0'.repeat(64),'account-access.js':stagePins['account-access.js'],...(PHASE==='GREEN'?{'account-history.js':stagePins['account-history.js']}:{})};
 let extra=null;let started=false;
 try{extra=await createIntegrationServer({staticRoot:STAGE,projectId:PROJECT,pins});started=true;}
 catch(e){assert.match(e.message,/request-rate-limit\.mjs/,'startup refusal must name the Node helper');}
 if(started)await extra.close().catch(()=>{});
 assert.ok(!started,'wrong request-rate-limit.mjs pin must refuse startup before import/use');
});
test('current backend: integration server refuses to start with a missing request-rate-limit pin',async()=>{
 const pins={...GATE197};delete pins['request-rate-limit.mjs'];
 const extra={...pins,'account-access.js':stagePins['account-access.js'],...(PHASE==='GREEN'?{'account-history.js':stagePins['account-history.js']}:{})};
 let srv=null;let started=false;
 try{srv=await createIntegrationServer({staticRoot:STAGE,projectId:PROJECT,pins:extra});started=true;}
 catch(e){assert.match(e.message,/request-rate-limit\.mjs/,'startup refusal must name the Node helper');}
 if(started)await srv.close().catch(()=>{});
 assert.ok(!started,'missing request-rate-limit.mjs pin must refuse startup before import/use');
});
test('current backend: the Node-only request-rate-limit helper is never browser served',async()=>{
 for(const url of ['/request-rate-limit.mjs','/backend/request-rate-limit.mjs','/backend-integration/request-rate-limit.mjs']){
  const r=await fetch(base+url);const body=await r.text();
  assert.equal(r.status,404,`helper URL must 404: ${url} got ${r.status}`);
  assert.ok(!body.includes('createRateLimiter')&&!body.includes('request-rate-limit'),`helper bytes must not leak at ${url}`);
 }
});
// END uic-current-backend-append
// BEGIN ui-cloud-account-save-append — account-save first vertical
// (account-save-first-vertical-contract.md). Internal FIRST-GREEN checkpoint,
// NOT full feature acceptance: ONE primary connected journey, ONE controlled
// 503 commit-boundary recovery journey and the explicit new-module served-byte
// proof. Everything from the BEGIN marker above to EOF is a marked append;
// truncating here reproduces the base harness byte-exact. No base test or
// helper is modified. Cancel-safe confirmation, stable-ID retry, server-only
// debit, commit-only acknowledgement, browser-local draft/counter separation
// and anonymous-default preservation are asserted through the REAL UI over
// the REAL Auth+Firestore emulator chain with explicit harness injection.
// Remaining lifecycle risks (uncertain-response classification, quota at cap,
// concurrent edit, local-cleanup denial, PB/celebration milestones, zero-
// review variant) are deliberately NOT implemented or asserted at this
// checkpoint and are returned for sequencing.
const SAVE_ERR_UNAVAILABLE='The save result cannot yet be confirmed. Your draft is unchanged and this exact record is retained. Keep this page open and retry; the retry re-sends the exact same record and re-checks whether it already saved.'; // uic-account-save-recovery: copy-only supersession (a pre-ack transport failure is uncertain, never proof of no-save; all s2 behaviour assertions unchanged)
const SAVE_PINNED=/^[0-9a-f]{64}$/.test(stagePins['account-save.js']||'');
const SAVE_ERR_UNVERIFIED='Account access could not be verified. This mock was not saved to your account and your draft is unchanged.';
const SAVE_DONE='Saved to your account (fictional test-account saving). The unchanged browser draft was cleared; your local mock records, counter and saved history are untouched.';
const SAVE_NOTE='Account save fictional note 5t3 never merged into browser-local records';
const SAVE_THINKING='Account save fictional thinking 8m6 never merged into browser-local records';
const commitCount=rec=>rec.api.filter(u=>u.includes('/api/mocks/commit')).length;
const saveLine=p=>p.locator('[data-account-save]');

// Explicit save-mode connection: session+client shared with the history
// controller (same session/controller identity for both), History FIRST so
// the successful-save programmatic open seam is live, then the account-save
// attach. At the missing-feature RED both attach/module flags are false and
// the primary assertion is the ABSENT real cloud commit, not an import error.
async function connectSaveHarness(p,acct,opts={}){
 return p.evaluate(async({uid,token,pageSize,skipHistory,skipSave})=>{
  const sessionMod=await import('/backend/account-session.mjs');
  const clientMod=await import('/backend/mock-client.mjs');
  const app=await import('/app.js');
  const h={attachHistoryAvailable:typeof app.attachAccountHistory==='function',attachSaveAvailable:typeof app.attachAccountSave==='function',events:[],detachSave:null};
  try{h.historyMod=await import('/account-history.js');}catch{h.historyMod=null;}
  try{h.saveMod=await import('/account-save.js');h.moduleAvailable=true;}catch{h.moduleAvailable=false;}
  const verifySession=async t=>{const r=await fetch('/api/session',{headers:{authorization:'Bearer '+t},credentials:'omit',cache:'no-store'});if(!r.ok)throw new Error('session verification failed: '+r.status);const b=await r.json();return {uid:b.uid};};
  h.session=sessionMod.createAccountSession({verifySession,onChange:s=>{h.events.push(s.status+(s.uid?':'+s.uid:''));if(h.historyController)h.historyController.handleSessionChange(s);if(h.saveController)h.saveController.handleSessionChange(s);}});
  h.client=clientMod.createMockClient({session:h.session});
  if(!skipHistory&&h.historyMod)h.historyController=h.historyMod.createAccountHistory({session:h.session,client:h.client,...(pageSize?{pageSize}:{})});
  if(!skipSave&&h.moduleAvailable)h.saveController=h.saveMod.createAccountSave({session:h.session,client:h.client});
  h.accounts={};h.accounts[uid]=token;
  if(h.attachHistoryAvailable&&h.historyController)h.detachHistory=app.attachAccountHistory(h.historyController);
  if(h.attachSaveAvailable&&h.saveController)h.detachSave=app.attachAccountSave(h.saveController);
  await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});
  window.__uicSaveHarness=h;
  return {attachHistoryAvailable:h.attachHistoryAvailable,attachSaveAvailable:h.attachSaveAvailable,moduleAvailable:!!h.moduleAvailable,openSavedAvailable:typeof h.historyController?.openSaved==='function',status:h.session.getState().status,signedInUid:h.session.getState().uid};
 },{uid:acct.uid,token:acct.token,...opts});
}
async function saveJourneys(p){
 // Real score -> selection -> review UI with full optional text; the draft
 // stays browser-local until the FINAL confirmation. Returns the stable ID.
 await p.locator('[data-act="log"]').click();
 await p.waitForSelector('#VR-earned');
 await p.fill('#title','Account save fictional mock');
 await p.fill('#provider','Fictional save provider');
 await p.fill('#VR-earned','31');await p.fill('#DM-earned','33');await p.fill('#QR-earned','26');
 await p.locator('[data-act="continue"]').click();
 await p.waitForSelector('#questionNumber');
 await p.selectOption('#section','VR');await p.fill('#questionNumber','1');
 await p.locator('[data-act="add-question"]').click();
 await p.locator('[data-act="review-question"]').first().click();
 await p.waitForSelector('#thinking');
 await p.fill('#thinking',SAVE_THINKING);
 await p.locator('[data-act="mark"]').click();
 await p.locator('[data-act="selection"]').click();
 await p.fill('#note',SAVE_NOTE);
 return p.evaluate(k=>JSON.parse(localStorage.getItem(k)).draft.id,KEY);
}
const confirmLogDialog=p=>p.getByRole('dialog').getByRole('button',{name:'Log mock'});
// Controlled 503 at the COMMIT boundary only: an explicitly labelled
// browser-layer fixture (never a backend outage claim). route.fetch() is NOT
// used — the fixture replaces the response, so no commit can reach the server
// while armed; release means unroute.
async function arm503Commit(p){
 await p.route(base+'/api/mocks/commit',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})}));
}
const clear503Commit=p=>p.unroute(base+'/api/mocks/commit');

// ── s1: PRIMARY connected journey — the existing confirmed Save becomes a
// real account commit over the actual emulator chain. Cancel makes zero
// commit requests; the confirmed save debits the server exactly once, shows
// the ACTUAL full account detail (not a browser copy), keeps every
// browser-local slice untouched, and clears the unchanged original draft only
// after the validated receipt.
test('account save: confirmed save through the real UI commits once to the account over the emulator chain and shows the actual saved detail',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 const id=await saveJourneys(p);
 // (a) Cancellation first: zero commit requests, everything retained.
 const apiBeforeCancel=rec.api.length,commitBeforeCancel=commitCount(rec);
 await p.locator('[data-act="save"]').click();
 await p.getByRole('dialog').getByRole('button',{name:'Keep reviewing'}).click();
 await settle(300);
 assert.equal(commitCount(rec),commitBeforeCancel,'cancel must make zero commit requests');
 assert.equal(rec.api.length,apiBeforeCancel,'cancel must make zero new requests at all');
 assert.equal(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).draft.id,KEY),id,'cancelled save must preserve the draft');
 assert.ok((await p.locator('#note').inputValue()).includes('Account save'),'cancelled save must preserve typed review text');
 // (b) Confirmed save: one real commit, server-only acknowledgement.
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 // PRIMARY missing-feature assertion: the confirmed Save must make a real
 // /api/mocks/commit request over the same session. At RED (no seam/module)
 // this fails as the absent cloud commit — never as a module/import error.
 for(let td=0;commitCount(rec)===0&&td<15000;td+=25)await settle(25); // fm2sup-t1 TIMING-ONLY adapter: the accepted async precommit prior-collector list (fm7pc) may legitimately delay the commit POST past the confirm click's resolution; await the ACTUAL dispatch event on the existing request recorder (bounded, event-polled, no fixed sleep) so the UNCHANGED one-request assertion below measures the new async semantics; a never-dispatched commit still fails the original assertion with its exact product reason.
 assert.equal(commitCount(rec),1,`one confirmed save must issue exactly one real /api/mocks/commit over the connected account (attachSaveAvailable=${connected.attachSaveAvailable}, moduleAvailable=${connected.moduleAvailable}, session=${connected.status})`);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal((await p.locator('[data-account-save="done"]').textContent()),SAVE_DONE);
 // Actual emulator/HTTP readback: the record truly exists with the content.
 const got=await fetch(base+`/api/mocks/item?id=${encodeURIComponent(id)}`,{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal(got.status,200,'the saved record must actually exist in the emulator store');
 const body=await got.json();
 assert.equal(body.mock.id,id);assert.equal(body.mock.note,SAVE_NOTE);
 assert.ok(body.mock.reviews.some(q=>q.thinking===SAVE_THINKING),'the review text must be transmitted unchanged');
 // One server debit only.
 const usage=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 const usageBody=await usage.json();
 assert.equal(usageBody.cumulativeLogsUsed,1,'the commit debited the SERVER counter exactly once');
 // Browser-local slices untouched; only the draft cleared after the receipt.
 const stored=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.equal(stored.draft,null,'the unchanged original draft is cleared only after the successful receipt');
 assert.deepEqual(stored.mocks,[],'no cloud record may merge into state.mocks');
 assert.equal(stored.used,0,'the browser-local counter must stay untouched');
 assert.deepEqual(stored.savedIds,[],'savedIds must stay untouched');
 // Show the saved ACCOUNT full detail via the history programmatic-open seam.
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the detail must be the actual saved record by literal id');
 assert.equal(await p.locator('[data-account-history="detail-title"]').textContent(),'Account save fictional mock');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'full detail shows note and review text, not a summary');
 assert.ok(listCount(rec)>=1,'the list and detail are fetched over real same-origin HTTP');
 checkClean(rec,'s1-desktop');
 await shot(p,'shot-1440-account-save-detail.png');
 // Back keeps fresh-list semantics.
 await p.locator('[data-account-history="back"]').click();
 await waitHistRows(p,1);
 assert.equal((await histRowIds(p)).length,1,'the fresh list shows exactly the one account record');
 assert.ok((await histRowIds(p)).includes(id),'the fresh list row carries the literal saved id');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'Back returns to the fresh list, detail closed');
 const storedAfterBack=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.deepEqual(storedAfterBack.mocks,[],'list browsing must still never merge account rows into local state');
 assert.equal(storedAfterBack.used,0);
 // Mobile capture of the same acknowledgement/detail surface.
 const acct2=await account();const id2=await commitTitled(acct2.token,'Mobile save fixture');
 const {p:pm,rec:recm}=await openPage(390);
 await connectSaveHarness(pm,acct2);
 await goHistory(pm);await waitHistRows(pm,1);
 await pm.locator('[data-account-history="open"]').first().click();
 await pm.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 checkClean(recm,'s1-mobile');
 await shot(pm,'shot-390-account-save-detail.png');
 // (c) Zero-review variant: save straight after scores with no reviewed
 // questions — same connected cloud path, no review-count requirement.
 await p.locator('nav [data-act="home"]').click();
 await p.waitForSelector('[data-act="log"]');
 await p.locator('[data-act="log"]').click();
 await p.waitForSelector('#VR-earned');
 await p.fill('#title','Account save zero-review mock');
 await p.fill('#VR-earned','10');await p.fill('#DM-earned','10');await p.fill('#QR-earned','10');
 await p.locator('[data-act="continue"]').click();
 await p.waitForSelector('#questionNumber');
 const idz=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).draft.id,KEY);
 await p.locator('[data-act="save"]').click();
 assert.match(await p.getByRole('dialog').textContent(),/without reviewing any questions/,'zero-review drafts confirm without a review-count gate');
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(commitCount(rec),2,'the zero-review variant is the second real commit request');
 const usage2=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usage2.json()).cumulativeLogsUsed,2,'the server debited the second save exactly once');
 const got2=await fetch(base+`/api/mocks/item?id=${encodeURIComponent(idz)}`,{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal(got2.status,200,'the zero-review record actually exists in the emulator store');
 const stored2=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.equal(stored2.draft,null);assert.deepEqual(stored2.mocks,[]);assert.equal(stored2.used,0);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),idz,'the programmatic open shows the actual new record');
 checkClean(rec,'s1-zero-review');
 await shot(p,'shot-1440-account-save-zero-review.png');
});

// ── s2: ONE narrow failure/recovery journey — a controlled explicit 503 at
// the commit boundary preserves the draft with zero debit and no success
// claim; the keyboard Retry re-confirms and transmits the EXACT same stable
// ID and content, then actually commits with exactly one server debit.
test('account save: a controlled 503 at the commit boundary preserves the draft with no debit or success and the keyboard retry commits the exact same id and content',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const bodies=[];
 p.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/api/mocks/commit'))bodies.push(r.postData());});
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'account-save seam and module must be live for the retry journey');
 const id=await saveJourneys(p);
 await arm503Commit(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 assert.equal((await p.locator('[data-account-save="error"]').textContent()),SAVE_ERR_UNAVAILABLE);
 const errBody=await p.locator('[data-account-save="error"]').textContent();
 assert.ok(!errBody.includes('storage_unavailable')&&!errBody.includes('503'),'no raw transport detail may be forwarded');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'a failed commit must never announce success');
 await clear503Commit(p);
 // Draft, typed review text and selections retained; local slices untouched.
 assert.equal(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).draft.id,KEY),id,'a failed save must preserve the draft with its stable ID');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no completed result before a validated receipt');
 const storedFail=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.deepEqual(storedFail.mocks,[]);assert.equal(storedFail.used,0);assert.equal(storedFail.draft.id,id);
 const usageFail=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageFail.json()).cumulativeLogsUsed,0,'the denied commit debits nothing on the server');
 // Keyboard Retry re-runs the cancel-safe confirmation, then transmits the
// retained original snapshot (a failure never proves no commit happened,
  // so the same stable ID must be re-used).
 const retry=p.locator('[data-act="account-save-retry"]');
 await retry.focus();
 assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.act),'account-save-retry','retry must be keyboard focusable');
 await p.keyboard.press('Enter');
 await p.getByRole('dialog').waitFor({state:'visible',timeout:5000});
 assert.equal(await p.locator('#mock-save-description').textContent(),'You can return to edit your question reviews later.','the retry re-confirms through the same cancel-safe dialog');
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(bodies.length,2,'failed attempt plus successful retry: exactly two commit POSTs');
 assert.equal(bodies[0],bodies[1],'the retry must transmit the EXACT same stable ID and payload, not newly typed content');
 assert.ok(bodies[0].includes(id)&&bodies[0].includes(SAVE_NOTE)&&bodies[0].includes(SAVE_THINKING),'the retained snapshot carries the original content');
 // Actual successful HTTP/emulator readback with ONE debit.
 const got=await fetch(base+`/api/mocks/item?id=${encodeURIComponent(id)}`,{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal(got.status,200,'the retried save actually exists in the emulator store');
 const usage=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usage.json()).cumulativeLogsUsed,1,'one debit total across the failed attempt and the retry');
 assert.equal(commitCount(rec),2);
 const stored=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.equal(stored.draft,null,'the retained draft is cleared only on the successful receipt');
 assert.deepEqual(stored.mocks,[]);assert.equal(stored.used,0);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the retry shows the actual saved account detail');
 checkClean(rec,'s2');
 await shot(p,'shot-1440-account-save-retry-detail.png');
});

// ── s3: attached signed-out — the final Save is refused with sanitized copy
// and never silently falls back to the browser-local Save while attached.
test('account save: attached but signed-out refuses the final save with sanitized copy and zero commit or browser-local save',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live to prove the signed-out refusal');
 const id=await saveJourneys(p);
 // Sign out mid-draft (the shared session drives every controller). While
 // attached-but-signed-out the cloud mode is selected: the Save click must
 // NOT silently fall back to the browser-local save and opens no commit.
 await p.evaluate(async()=>{await window.__uicSaveHarness.session.setAccount(null);});
 await p.locator('[data-act="save"]').click();
 await settle(500);
 assert.equal(await p.getByRole('dialog').count(),0,'a refused signed-out save must not reach a committable confirmation');
 assert.equal(commitCount(rec),0,'a signed-out attached save must not reach the commit route');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no cloud success may be claimed');
 const bodyText=await p.locator('main').innerText();
 assert.ok(bodyText.includes(SAVE_ERR_UNVERIFIED),'sanitized unverified copy must be shown: '+bodyText.slice(0,200));
 const stored=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.deepEqual(stored.mocks,[],'the refused save must NOT silently fall back to the browser-local save');
 assert.equal(stored.used,0,'the browser-local counter must be untouched by a refused cloud save');
 assert.equal(stored.draft.id,id,'the draft stays retained for a signed-in retry');
 assert.equal(await p.locator('[data-account-history]').count(),0,'signed-out History renders no account UI');
 checkClean(rec,'s3');
});

// ── s4: served bytes — the browser-facing entry serves the EXACT new
// account-save module while Node-only backend modules stay private.
test('account save: the pinned account-save.js bytes are actually served and non-allowlisted paths stay 404',async()=>{
 const served={};
 const r=await fetch(base+'/account-save.js');const b=Buffer.from(await r.arrayBuffer());
 served['/account-save.js']={status:r.status,sha256:sha(b)};
 if(SAVE_PINNED){
  assert.equal(r.status,200,'account-save.js must be served under the explicit pin');
  assert.equal(sha(b),stagePins['account-save.js'],'served account-save.js bytes must equal the pinned source');
  for(const url of ['/ui-cloud-account-save.test.mjs','/drafts/uic-account-save-append.mjs','/backend-integration/mock-intent.mjs','/../backend-integration/firebase.json']){
   const bad=await fetch(base+url);await bad.arrayBuffer();served[url]={status:bad.status,mustNotServe:true};
   assert.equal(bad.status,404,`${url} must not be served`);
  }
 }else{
  assert.equal(r.status,404,'account-save.js must not be served before explicit pin registration');
 }
 const s=await snapshot(),e=expectedSnapshot();
 assert.deepEqual(s,e,'stage source must be unchanged during the run');
 await fs.writeFile(new URL('ACCOUNT-SAVE-SERVED.json',out),JSON.stringify({phase:PHASE,base,served,sourceAfter:s},null,2));
});

// ── s5: default app (NO controllers attached) — existing anonymous
// browser-only Save behaviour preserved exactly: one local save, zero private
// network, no cloud mode.
test('account save: default app without any attached controller keeps the anonymous browser-only save journey with zero private network',async()=>{
 const {p,rec}=await openPage(1440);
 await p.goto(base);
 await p.evaluate(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:KEY,s:seed()});
 await p.reload();
 const apiBefore=rec.api.length;
 const id=await saveJourneys(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('.saved-state',{timeout:8000});
 assert.equal(rec.api.length,apiBefore,'the default app must issue zero /api or /backend requests');
 assert.equal(commitCount(rec),0,'the default app must make zero commit requests');
 assert.equal(await p.locator('[data-account-save]').count(),0,'no account-save UI may render without an explicit connection');
 const stored=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.equal(stored.draft,null,'the existing browser-local save clears its own draft as before');
 assert.equal(stored.used,1,'the existing browser-local counter still debits locally');
 assert.equal(stored.mocks.length,1);assert.equal(stored.mocks[0].id,id);
 assert.equal(stored.savedIds.length,1);
 checkClean(rec,'s5');
 await shot(p,'shot-1440-account-save-anonymous-local.png');
});
// ── END ui-cloud-account-save-append ──
// BEGIN ui-cloud-account-save-recovery-append — account-save truthful-recovery
// (account-save-recovery-contract.md). Derived harness = immutable
// ui-cloud-account-save.test.mjs (ac52c683…) + ONE documented occurrence-counted
// copy-only supersession of the s2 leaf-error expectation (a pre-acknowledgement
// transport failure never proves no commit happened, so the old definite
// "nothing was counted as saved" copy is replaced by the truthful cannot-yet-
// confirm copy; every BEHAVIOUR assertion in s2 — no debit, draft retained,
// exact same retry body, one debit total — is unchanged) + this marked EOF
// append. Truncating here and reversing that substitution reproduces the
// ac52c683… bytes byte-exact. No historical test or helper is modified.
// Fixture labelling (explicit, never a backend outage claim): the lost-ack
// fixture intercepts with route.fetch() so the ORIGINAL commit ACTUALLY reaches
// the server; the harness records and asserts the real upstream 201/created/id/
// used AND an actual HTTP store readback BEFORE a controlled malformed 503 is
// delivered in place — this is a lost acknowledgement after a real commit, not
// a simulated outage. The detail-read fixture is a controlled 503 on the get
// route only; the cleanup fixture is a key-scoped Storage.prototype.setItem
// denial armed only around the final draft-clear persist.
const SAVE_RECOVERY_ERR_UNCERTAIN='The save result cannot yet be confirmed. Your draft is unchanged and this exact record is retained. Keep this page open and retry; the retry re-sends the exact same record and re-checks whether it already saved.';
const SAVE_RECOVERY_ERR_SAVED_UNAVAILABLE='This mock was saved to your account, but the saved result is temporarily unavailable. Nothing was saved again and no second save was counted. Keep this page open; Retry only re-reads the actual saved record.';
// The exact current committed-cleanup-pending copy (account-save.js ERR_CLEANUP).
const SAVE_ERR_CLEANUP='Saved to your account, but this browser could not clear the local draft. Nothing was deleted and no second save was counted. Keep this page open; Retry completes only the local draft cleanup.';
const REC_ITEM=base+'/api/mocks/item*';
// Lost-ack commit fixture: first POST actually fetches upstream (proof
// captured in proofs.upstream) then a malformed 503 replaces the response;
// subsequent POSTs (the retry) are recorded (proofs.retry) and passed through
// truthfully so the UI can complete. proofs.calls counts every intercepted
// commit request and proofs.posts captures each transmitted body from the
// route's own request, immune to any duplicate page-level request events
// that route.fetch() may fire.
async function armLostAckCommit(p,proofs,expectId,expectToken){
 let first=true;
 proofs.calls=0;proofs.posts=[];proofs.receipt=null;proofs.fixtureError=null;
 await p.route(base+'/api/mocks/commit',async route=>{
  proofs.calls++;proofs.posts.push(route.request().postData());
  const resp=await route.fetch();
  const text=await resp.text();
  let body=null;try{body=JSON.parse(text);}catch{}
  if(first){
   first=false;
   proofs.upstream={status:resp.status(),body};
   // r2 proof-repair: the ACTUAL 201 acknowledgement is validated and the
   // DIRECT actual HTTP item+usage readback (full stored content INCLUDING
   // reviews) is completed and recorded BEFORE the controlled 503
   // replacement is fulfilled. The ordered event list is the persisted
   // receipt. Any fixture problem is recorded and the request is STILL
   // RELEASED with the controlled response, so a broken fixture fails the
   // test early (assertions below) rather than hanging silently.
   const receipt={events:[],upstreamStatus:resp.status(),upstreamBody:body};
   proofs.receipt=receipt;
   try{
    if(resp.status()!==201)throw new Error('original commit ack status '+resp.status()+' (expected 201)');
    if(!body||body.id!==expectId)throw new Error('original commit ack id mismatch: '+JSON.stringify(body&&body.id));
    if(body.created!==true)throw new Error('original commit ack created not true: '+JSON.stringify(body&&body.created));
    if(body.used!==1)throw new Error('original commit ack used not 1: '+JSON.stringify(body&&body.used));
    receipt.events.push('original-ack-validated:201:id='+expectId+':created=true:used=1');
    const gotItem=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(expectId),{headers:{authorization:'Bearer '+expectToken},credentials:'omit'});
    const gotText=await gotItem.text();
    let gotJson=null;try{gotJson=JSON.parse(gotText);}catch{}
    if(gotItem.status!==200)throw new Error('direct HTTP item readback status '+gotItem.status);
    const mock=gotJson&&gotJson.mock;
    if(!mock||mock.id!==expectId)throw new Error('direct HTTP item readback id mismatch');
    if(mock.note!==SAVE_NOTE)throw new Error('direct HTTP item readback note mismatch');
    const reviews=Array.isArray(mock.reviews)?mock.reviews:[];
    if(reviews.length!==1)throw new Error('direct HTTP item readback review count '+reviews.length);
    if(!reviews.some(q=>q.thinking===SAVE_THINKING))throw new Error('direct HTTP item readback missing the original thinking review');
    receipt.itemStatus=gotItem.status;receipt.itemNote=mock.note;
    receipt.itemReviews=reviews.map(q=>({section:q.section,number:q.number,thinking:q.thinking,free:q.free}));
    receipt.events.push('direct-http-item-readback:200:id='+expectId+':note=SAVE_NOTE:reviews=1');
    const gotUsage=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+expectToken},credentials:'omit'});
    const usageJson=await gotUsage.json();
    if(gotUsage.status!==200)throw new Error('direct HTTP usage readback status '+gotUsage.status);
    receipt.usageStatus=gotUsage.status;receipt.usage=usageJson.cumulativeLogsUsed;
    if(usageJson.cumulativeLogsUsed!==1)throw new Error('direct HTTP usage readback shows '+JSON.stringify(usageJson.cumulativeLogsUsed)+' (expected 1)');
    receipt.events.push('direct-http-usage-readback:200:used=1');
    await route.fulfill({status:503,contentType:'text/plain; charset=utf-8',body:'lost-ack fixture'});
    receipt.events.push('controlled-503-replacement-fulfilled');
   }catch(e){
    proofs.fixtureError=String(e&&e.message||e);
    receipt.events.push('fixture-error:'+proofs.fixtureError);
    await route.fulfill({status:503,contentType:'text/plain; charset=utf-8',body:'lost-ack fixture'}).catch(()=>{});
   }
  }
  else{proofs.retry={status:resp.status(),body};await route.fulfill({status:resp.status(),contentType:'application/json',body:text});}
 });
}
// Controlled 503 on the detail GET route only (browser-layer fixture).
const arm503DetailRead=p=>p.route(REC_ITEM,route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})}));
const clear503DetailRead=p=>p.unroute(REC_ITEM);
// Key-scoped browser-local cleanup denial: only refuses the owning KEY while
// armed; every other storage write behaves normally.
async function armCleanupDenial(p){
 await p.evaluate(k=>{
  if(window.__uicCleanupShim)return;
  window.__uicCleanupDeny=false;
  const set=Storage.prototype.setItem;
  Storage.prototype.setItem=function(...a){if(window.__uicCleanupDeny&&a[0]===k)throw new DOMException('Synthetic browser storage denial (test fixture)','NotSupportedError');return set.apply(this,a);};
  window.__uicCleanupShim=k;
 },KEY);
}
const setCleanupDeny=(p,on)=>p.evaluate(v=>{window.__uicCleanupDeny=v;},on);
// Native keyboard Retry: focus the retry button, Enter re-opens the SAME
// cancel-safe dialog, confirm accepts.
async function keyboardRetryConfirm(p){
 const retry=p.locator('[data-act="account-save-retry"]');
 await retry.focus();
 assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.act),'account-save-retry','retry must be keyboard focusable');
 await p.keyboard.press('Enter');
 await p.getByRole('dialog').waitFor({state:'visible',timeout:5000});
 assert.equal(await p.locator('#mock-save-description').textContent(),'You can return to edit your question reviews later.','the retry re-confirms through the same cancel-safe dialog');
 await confirmLogDialog(p).click();
}
const localDraft=async p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
// ── r2 proof-repair helpers ──
// armCommitObserver: records the ACTUAL upstream commit acknowledgement while
// returning the real response to the page UNCHANGED — no replacement, no
// second POST, no faked results.
async function armCommitObserver(p,obs){
 await p.route(base+'/api/mocks/commit',async route=>{
  const resp=await route.fetch();
  const text=await resp.text();
  let body=null;try{body=JSON.parse(text);}catch{}
  obs.commits.push({status:resp.status(),body});
  await route.fulfill({status:resp.status(),contentType:'application/json',body:text});
 });
}
const clearCommitObserver=p=>p.unroute(base+'/api/mocks/commit');
// wrapSaveApplyObserver: TEST-ONLY wrapper injected through the EXISTING
// app/controller mount seam BEFORE the actual journey: wraps seam.apply,
// records the serialised acknowledgement ARGUMENT, delegates the UNCHANGED
// synchronous call, and retains the real client/network/session. No append
// hook in production; no monkey faked results. Re-attaching the wrapper
// controller goes through the app's own attachAccountSave seam; the app's
// real apply/guard/refresh are reused verbatim inside the wrapper.
const wrapSaveApplyObserver=p=>p.evaluate(()=>{
 const h=window.__uicSaveHarness;
 if(!h||!h.saveController||typeof h.saveController.mount!=='function')throw new Error('save controller must be mounted to wrap the apply seam');
 const inner=h.saveController;
 window.__uicAckAcks=[];
 const recorder=window.__uicAckAcks;
 const wrapper=Object.freeze({
  mount(app){
   if(!app||typeof app.apply!=='function'||typeof app.guard!=='function')throw new Error('mount seam missing apply/guard');
   const origApply=app.apply,origGuard=app.guard;
   const wrapped=Object.freeze({...app,
    guard:(...a)=>origGuard(...a),
    apply:(...a)=>{if(a.length>=3&&a[2]!==undefined)recorder.push(JSON.parse(JSON.stringify(a[2])));return origApply(...a);}});
   inner.mount(wrapped);
  },
  unmount(){inner.unmount();},
  handleSessionChange(s){inner.handleSessionChange(s);},
  beginConfirmation(q){return inner.beginConfirmation(q);},
  confirmSave(q){return inner.confirmSave(q);},
  retained(){return inner.retained();},
  retry(){return inner.retry();},
  getState(){return inner.getState();},
  renderFeedback(c,r){inner.renderFeedback(c,r);},
 });
 return import('/app.js').then(app=>{if(h.detachSave)h.detachSave();h.detachSave=app.attachAccountSave(wrapper);return {wrapped:true};});
});
const readAckAcks=p=>p.evaluate(()=>window.__uicAckAcks?window.__uicAckAcks.slice():null);

// ── r1: LOST ACKNOWLEDGEMENT AFTER AN ACTUAL COMMIT — the original commit
// really returns 201 created:true used:1 (proven via the recorded upstream
// response and a direct HTTP readback) but the browser only sees a controlled
// malformed/503 replacement. The UI must TRUTHFULLY say the result cannot yet
// be confirmed and retain the exact stable ID and transmitted payload; it must
// NOT claim the record was not saved or that nothing was counted. The keyboard
// Retry re-confirms and re-sends the EXACT same POST body; the server then
// actually answers 200 created:false with the SAME usage (idempotent, no
// second debit), and the completed save shows the actual detail.
test('account save recovery p: a lost acknowledgement after a real upstream commit shows truthful cannot-confirm copy with the exact retained payload and the keyboard retry re-sends the identical commit answered created:false at unchanged usage',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the lost-ack journey');
 await wrapSaveApplyObserver(p);
 const id=await saveJourneys(p);
 const proofs={};
 await armLostAckCommit(p,proofs,id,acct.token);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 // Fixture proof BEFORE any UI claim: the commit ACTUALLY committed upstream.
 assert.equal(proofs.upstream&&proofs.upstream.status,201,'fixture: the ORIGINAL commit request must have actually reached the server and returned 201');
 assert.equal(proofs.upstream.body&&proofs.upstream.body.id,id,'fixture: the upstream ack carries the expected stable ID');
 assert.equal(proofs.upstream.body&&proofs.upstream.body.created,true,'fixture: the upstream ack reports created:true');
 assert.equal(proofs.upstream.body&&proofs.upstream.body.used,1,'fixture: the upstream ack reports the first usage');
 const gotUp=await fetch(base+`/api/mocks/item?id=${encodeURIComponent(id)}`,{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal(gotUp.status,200,'fixture: the record actually exists in the emulator store despite the lost ack');
 const gotUpBody=await gotUp.json();
 assert.equal(gotUpBody.mock.note,SAVE_NOTE,'fixture: the committed store record carries the original content');
 // r2 proof-repair: independently assert the ordered event receipt — the
 // ACTUAL item and usage HTTP readbacks were recorded strictly BEFORE the
 // controlled replacement fulfilment, with the full stored review content,
 // and that the fixture itself never errored.
 assert.equal(proofs.fixtureError,null,'lost-ack fixture readback must succeed: '+proofs.fixtureError);
 const receiptEvents=(proofs.receipt&&proofs.receipt.events)||[];
 const idxReadItem=receiptEvents.indexOf('direct-http-item-readback:200:id='+id+':note=SAVE_NOTE:reviews=1');
 const idxReadUsage=receiptEvents.indexOf('direct-http-usage-readback:200:used=1');
 const idxReplaced=receiptEvents.indexOf('controlled-503-replacement-fulfilled');
 assert.ok(idxReadItem>=0,'ordered receipt must record the actual item readback: '+JSON.stringify(receiptEvents));
 assert.ok(idxReadUsage>=0,'ordered receipt must record the actual usage readback: '+JSON.stringify(receiptEvents));
 assert.ok(idxReplaced>=0,'ordered receipt must record the replacement fulfilment: '+JSON.stringify(receiptEvents));
 assert.ok(idxReadItem<idxReplaced,'the actual HTTP item readback event must precede the controlled 503 replacement event');
 assert.ok(idxReadUsage<idxReplaced,'the actual HTTP usage readback event must precede the controlled 503 replacement event');
 assert.deepEqual(proofs.receipt.itemReviews,[{section:'VR',number:'1',thinking:SAVE_THINKING,free:''}],'the receipt must carry the actual stored review content');
 assert.equal(proofs.receipt.usage,1,'the receipt must carry the actual usage readback');
 await fs.writeFile(new URL('r1p-receipt.json',out),JSON.stringify({stableId:id,receipt:proofs.receipt,upstreamAck:proofs.upstream,retryAck:proofs.retry},null,2));
 // PRIMARY truthful-copy assertion (missing-feature RED against the current
// controller: it claims the record was NOT saved / nothing was counted).
 const err=await p.locator('[data-account-save="error"]').textContent();
 assert.ok(!/nothing was counted|was not saved|Could not save/i.test(err),'a lost ack must NOT claim the record was not saved or nothing was counted: '+err);
 assert.equal(err,SAVE_RECOVERY_ERR_UNCERTAIN,'the uncertain outcome must state truthfully that the result cannot yet be confirmed');
 assert.ok(!err.includes('fixture')&&!err.includes('503'),'no raw transport detail may be forwarded');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success claim before a validated receipt');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no completed result before a validated receipt');
 // Draft, stable ID and typed content retained; local slices untouched.
 const storedUncertain=await localDraft(p);
 assert.equal(storedUncertain.draft&&storedUncertain.draft.id,id,'the exact stable ID and draft are retained for the re-check');
 assert.deepEqual(storedUncertain.mocks,[]);assert.equal(storedUncertain.used,0);
 // The server already debited once (real commit) — usage must stay at 1.
 const usageMid=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageMid.json()).cumulativeLogsUsed,1,'the actual upstream commit debited exactly once despite the lost ack');
 // Keyboard Retry re-confirms and re-sends the EXACT same payload (the ack
 // was unknown, so the retry is an idempotent commit of the retained snapshot).
 await shot(p,'shot-1440-account-save-recovery-r1p-error-before-retry.png');
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(proofs.calls,2,'uncertain attempt plus retry: exactly two intercepted commit POSTs');
 assert.equal(proofs.posts[0],proofs.posts[1],'the retry must transmit the EXACT same stable ID and payload, not newly typed content');
 assert.ok(proofs.posts[0].includes(id)&&proofs.posts[0].includes(SAVE_NOTE)&&proofs.posts[0].includes(SAVE_THINKING),'the retained snapshot carries the original content');
 // The server ACTUALLY answered the retry: 200 created:false, same usage.
 assert.equal(proofs.retry&&proofs.retry.status,200,'the retry must reach the server and be answered 200 (already committed)');
 assert.equal(proofs.retry.body&&proofs.retry.body.created,false,'the retry ack must be the actual created:false idempotent acknowledgement');
 assert.equal(proofs.retry.body&&proofs.retry.body.used,1,'the retry must reuse the same usage, never a second debit');
 const usageAfter=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageAfter.json()).cumulativeLogsUsed,1,'exactly one server debit total across the lost-ack attempt and the retry');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'the retained draft is cleared only on the successful receipt');
 assert.deepEqual(stored.mocks,[]);assert.equal(stored.used,0);assert.deepEqual(stored.savedIds,[]);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the retry shows the actual saved account detail');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'the full detail shows the unchanged stored content');
 assert.deepEqual((await readAckAcks(p)),[{created:false,id,used:1}],'r1p: exactly ONE application, carrying the retry\'s actual ack (the original ack was LOST to the browser and must not be fabricated; its truth is the proven ordered readback receipt)');
 checkClean(rec,'r1');
 await shot(p,'shot-1440-account-save-recovery-lost-ack-detail.png');
});

// ── r2: ACKNOWLEDGED COMMIT + DETAIL READ FAILURE — the commit received a
// valid 201 acknowledgement, then the post-commit getMock is refused by a
// controlled 503 on the GET route. The UI must say ALREADY SAVED but result
// temporarily unavailable — never a failed-transaction claim — and the
// keyboard Retry must RE-READ the actual record without any second commit.
test('account save recovery p: an acknowledged commit whose detail read gets a controlled 503 says already-saved-but-temporarily-unavailable and the keyboard retry re-reads with zero second commit',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const bodies=[];
 p.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/api/mocks/commit'))bodies.push(r.postData());});
 // r2 proof-repair: ACTUAL-COMMIT-ACK OBSERVER — the commit route fetches
 // the real request and fulfills the real response UNCHANGED while recording
 // the actual acknowledgement; no second POST, no replacement, nothing faked.
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the acknowledged-read-failure journey');
 await wrapSaveApplyObserver(p);
 const id=await saveJourneys(p);
 await arm503DetailRead(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 // The commit POST actually reached the server with an accepted response.
 // r2 proof-repair: the ACTUAL ack is proven through the observer (route
 // handler fires exactly once per intercepted POST; immune to duplicate
 // page-level request events that route.fetch may surface).
 assert.equal(obs.commits.length,1,'the acknowledged commit issued exactly one POST');
 assert.ok(bodies[0].includes(id),'the committed payload carries the stable ID');
 const gotUp=await fetch(base+`/api/mocks/item?id=${encodeURIComponent(id)}`,{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal(gotUp.status,200,'fixture: the acknowledged commit actually persisted in the emulator store');
 const gotUpJsonR2p=await gotUp.json();
 assert.equal(gotUpJsonR2p.mock.note,SAVE_NOTE,'r2p: the acknowledged commit actually persisted the original note');
 assert.ok((gotUpJsonR2p.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'r2p: the acknowledged commit actually persisted the original thinking review');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'the commit-route observer must record the ACTUAL upstream 201 created:true used:1 acknowledgement for the acknowledged journey');
 assert.equal((await readAckAcks(p)).length,0,'no receipt application may occur while the detail read is failing');
 await shot(p,'shot-1440-account-save-recovery-r2p-error-before-retry.png');
 const usageMid=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageMid.json()).cumulativeLogsUsed,1,'the acknowledged commit debited exactly once');
 // PRIMARY truthful-copy assertion (missing-feature RED: the current
// controller relabels an acknowledged commit as a failed transaction).
 const err=await p.locator('[data-account-save="error"]').textContent();
 assert.ok(!/Could not save|nothing was counted|was not saved/i.test(err),'an acknowledged commit must never be relabelled as a failed transaction: '+err);
 assert.equal(err,SAVE_RECOVERY_ERR_SAVED_UNAVAILABLE,'a get failure after a valid acknowledgement must state already-saved-but-temporarily-unavailable');
 assert.ok(!err.includes('storage_unavailable')&&!err.includes('503'),'no raw transport detail may be forwarded');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success claim before the full result is re-read');
 const storedFail=await localDraft(p);
 assert.equal(storedFail.draft&&storedFail.draft.id,id,'the draft stays retained until the result can be re-read');
 assert.deepEqual(storedFail.mocks,[]);assert.equal(storedFail.used,0);
 // Clear the fixture and retry: the known acknowledgement must SKIP the
// commit and only re-read the actual record.
 await clear503DetailRead(p);
 await clearCommitObserver(p);
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(new Set(bodies).size,1,'the retry after a known acknowledgement must NOT post another commit: exactly one distinct transmitted body');
 assert.equal(obs.commits.length,1,'exactly one actual POST reached the commit route across the whole journey (observer; a known ack skips the commit)');
 const usageAfter=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageAfter.json()).cumulativeLogsUsed,1,'one server debit total');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'the retained draft clears on the completed re-read receipt');
 assert.deepEqual(stored.mocks,[]);assert.equal(stored.used,0);assert.deepEqual(stored.savedIds,[]);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the retry re-read shows the ACTUAL saved detail');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE),'the re-read detail carries the stored note');
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1}],'r2p: the ORIGINAL true-created ack (created:true, id, used) must survive the detail-read failure and arrive at the final application');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'r2p: exactly one actual upstream commit acknowledgement across the whole journey');
 checkClean(rec,'r2');
 await shot(p,'shot-1440-account-save-recovery-read-failure-detail.png');
});

// ── r3: LOCAL CLEANUP DENIAL AFTER A REAL CLOUD COMMIT + GET — a key-scoped
// Storage denial blocks only the final draft-clear persist. The UI must state
// saved-to-account-but-cleanup-pending with the stable retry identity; the
// denial release plus keyboard Retry completes ONLY the local cleanup: the
// draft clears and the actual full detail opens, with one server debit and no
// second commit.
test('account save recovery p: a local draft-cleanup denial after an actual cloud commit and read states saved-but-cleanup-pending with one debit, and the released keyboard retry clears the draft and opens the actual detail without any second commit',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const bodies=[];
 p.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/api/mocks/commit'))bodies.push(r.postData());});
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the cleanup-denial journey');
 const id=await saveJourneys(p);
 // r2 proof-repair: test-only apply-seam wrapper before the actual journey.
 await wrapSaveApplyObserver(p);
 await armCleanupDenial(p);
 await setCleanupDeny(p,true);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 await setCleanupDeny(p,false);
 const err=await p.locator('[data-account-save="error"]').textContent();
 assert.equal(err,SAVE_ERR_CLEANUP,'a cleanup denial after a cloud commit must state saved-to-account-but-cleanup-pending');
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1}],'r3p: the failed local apply must ALREADY have carried the ORIGINAL true-created ack (created:true, id, used) into the seam');
 await shot(p,'shot-1440-account-save-recovery-r3p-cleanup-pending-before-retry.png');
 assert.equal(bodies.length,1,'the cleanup retry path must never post another commit');
 assert.ok(bodies[0].includes(id),'the committed payload carries the stable ID');
 const usageMid=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageMid.json()).cumulativeLogsUsed,1,'exactly one server debit after the denied cleanup');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no full-success claim while cleanup is pending');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail presentation while cleanup is pending');
 const storedPending=await localDraft(p);
 assert.equal(storedPending.draft&&storedPending.draft.id,id,'the draft stays retained while cleanup is pending');
 assert.deepEqual(storedPending.mocks,[]);assert.equal(storedPending.used,0);
 // Released denial + keyboard retry: re-read and complete ONLY the cleanup.
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(bodies.length,1,'the cleanup retry re-reads the acknowledged commit; zero second commit');
 assert.equal(commitCount(rec),1);
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1},{created:true,id,used:1}],'r3p: the SAME true-created original ack must be recorded at the apply seam on BOTH the first failed local apply and the final successful retry');
 const usageAfter=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageAfter.json()).cumulativeLogsUsed,1,'still exactly one server debit');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'the released retry clears the unchanged original draft');
 assert.deepEqual(stored.mocks,[]);assert.equal(stored.used,0);assert.deepEqual(stored.savedIds,[]);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the completed cleanup opens the actual saved detail');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'the actual full detail opens after cleanup');
 checkClean(rec,'r3');
 await shot(p,'shot-1440-account-save-recovery-cleanup-detail.png');
});
// ── END ui-cloud-account-save-recovery-append ──
// ── r2 proof-repair: twenty occurrence-counted inverse-verified substitutions
// (S1-S17 receipt uic-account-save-recovery-r2-harness-receipt.json) applied
// to the immutable 1ed20c3a… recovery harness. These are CURRENT-source proof
// RECHECKS on unchanged production pins, never reconstructed historical RED.
// ── END ui-cloud-account-save-recovery-r2-proof-repair ──
// ── BEGIN ui-cloud-account-save-recovery-cleanup-copy-append ──
// Cleanup-copy seam proof (cc1): after an ACKNOWLEDGED cloud commit whose
// browser-local draft-cleanup persist is denied, the app final-save seam must
// NOT stack the generic 'Could not save to browser storage. Your allowance
// was not consumed.' browser-local banner onto the controller-owned
// saved-but-cleanup-pending copy. The debit already happened on the server;
// the generic claim is contradictory (evidence ar2p-r3p shot-1440-account-
// save-recovery-r3p-cleanup-pending-before-retry.png). Derived harness =
// EXACT immutable ui-cloud-account-save-recovery-r2.test.mjs (99d4fdcc…)
// bytes + THIS marked EOF append with ONE new test; truncating here
// reproduces the 99d4fdcc… bytes byte-exact. No new transform script,
// wrapper family, generator, or source-map file. All inherited tests are
// registered unchanged; only this new test is added.
const GENERIC_ALLOWANCE_COPY='Could not save to browser storage. Your allowance was not consumed.';
test('account save recovery c: a cloud-committed cleanup denial shows ONLY the saved-but-cleanup-pending copy with no contradictory generic allowance-not-consumed banner, and the released keyboard retry still completes cleanup with one debit',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const bodies=[];
 p.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/api/mocks/commit'))bodies.push(r.postData());});
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the cleanup-copy journey');
 const id=await saveJourneys(p);
 await wrapSaveApplyObserver(p);
 await armCleanupDenial(p);
 await setCleanupDeny(p,true);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 // Genuine missing-behavior evidence captured BEFORE the new assertion.
 await shot(p,'shot-1440-cleanup-copy-pending-before-retry.png');
 // Actual HTTP proof: the record really exists server-side with one debit
 // while the banner state is pending.
 const usageMid=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal(usageMid.status,200,'usage readback status');
 assert.equal((await usageMid.json()).cumulativeLogsUsed,1,'exactly one server debit after the denied cleanup');
 const gotItem=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal(gotItem.status,200,'actual HTTP item readback after the acknowledged commit');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id&&itemJson.mock.note===SAVE_NOTE,'the actual HTTP record carries the committed content');
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1}],'cc: the failed local cleanup apply must already carry the ORIGINAL true-created ack');
 assert.equal(bodies.length,1,'the pending state must come from exactly one commit POST');
 assert.ok(bodies[0].includes(id),'the committed payload carries the stable ID');
 const storedPending=await localDraft(p);
 assert.equal(storedPending.draft&&storedPending.draft.id,id,'the draft stays retained while cleanup is pending');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no full-success claim while cleanup is pending');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail presentation while cleanup is pending');
 // THE missing-behavior assertion: the whole visible #messages / main must
 // NOT carry the contradictory generic allowance-not-consumed / not-saved
 // banner after an acknowledged cloud debit.
 const messagesText=await p.locator('#messages').textContent();
 const mainText=await p.locator('#main').textContent();
 assert.ok(!messagesText.includes('allowance was not consumed'),'cleanup-pending #messages must not claim the allowance was not consumed after a real debit');
 assert.ok(!messagesText.includes('Could not save to browser storage'),'cleanup-pending #messages must not carry the generic browser-storage failure banner after an acknowledged cloud commit');
 assert.ok(!mainText.includes(GENERIC_ALLOWANCE_COPY),'cleanup-pending visible main must not contain the generic allowance-not-consumed claim');
 // The controller-owned accurate copy must remain, alone.
 assert.equal(await p.locator('[data-account-save="error"]').textContent(),SAVE_ERR_CLEANUP,'the accurate saved-but-cleanup-pending copy remains the only message');
 // Corrected error presentation captures at 1440 and 390 (viewport change only).
 await shot(p,'shot-1440-cleanup-copy-error-before-retry.png');
 await p.setViewportSize({width:390,height:844});
 await shot(p,'shot-390-cleanup-copy-error-before-retry.png');
 await p.setViewportSize({width:1440,height:1000});
 // Repeated keyboard Retry WHILE the denial is still armed: stable identity,
 // exact retained ack, one POST, one debit, draft retained, no generic copy.
 await keyboardRetryConfirm(p);
 await p.waitForFunction(()=>window.__uicAckAcks&&window.__uicAckAcks.length===2,null,{timeout:15000});
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1},{created:true,id,used:1}],'cc: both denied applies carry the SAME true-created original ack');
 assert.equal(bodies.length,1,'a denied cleanup retry never posts another commit');
 const usageDeniedRetry=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageDeniedRetry.json()).cumulativeLogsUsed,1,'still exactly one server debit after the denied retry');
 assert.equal((await localDraft(p)).draft.id,id,'the draft stays retained after a denied retry');
 assert.ok(!(await p.locator('#main').textContent()).includes('allowance was not consumed'),'the denied retry keeps the accurate copy without the generic banner');
 // Release the denial; keyboard Retry (Enter then native dialog confirm)
 // completes ONLY the local cleanup.
 await setCleanupDeny(p,false);
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(bodies.length,1,'the cleanup retry re-reads the acknowledged commit; zero second commit');
 assert.equal(commitCount(rec),1);
 const usageAfter=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageAfter.json()).cumulativeLogsUsed,1,'still exactly one server debit after completion');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'the released retry clears the unchanged original draft');
 assert.deepEqual(stored.mocks,[]);assert.equal(stored.used,0);assert.deepEqual(stored.savedIds,[]);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the completed cleanup opens the actual saved detail');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'the actual full detail opens after cleanup');
 checkClean(rec,'cc');
 await shot(p,'shot-1440-cleanup-copy-detail.png');
});
// ── END ui-cloud-account-save-recovery-cleanup-copy-append ──
// ── BEGIN ui-cloud-account-save-boundaries-atcap-append ──
// b1: LOST ACKNOWLEDGEMENT AT THE CAP — the same truthful-recovery guarantee
// exercised at the final slot of the already-implemented server cap (3). A
// fictional account gets TWO genuine seeded HTTP commits via the accepted
// commit() helper (usage 2, real receipts, no seeded billing and no new
// entitlement policy), then the THIRD draft comes from the real score/review
// UI. The third commit ACTUALLY returns 201 created:true used:3 (proven
// through route.fetch() plus a direct HTTP item+usage readback BEFORE a
// controlled malformed 503 replacement is fulfilled; the ordered event list
// is persisted). The UI is uncertain: cannot-confirm copy, no success, no
// detail, no local clear. The native keyboard Retry re-confirms and re-sends
// the EXACT same POST body; the server answers the actual 200 created:false
// used:3 idempotent receipt replay (mock-store.mjs receipt branch) — no
// fourth debit, no cap rejection, and the completed save shows the actual
// full detail while the unchanged original draft clears. armLostAckCommit is
// NOT reused (it hardcodes the usage-1 expectation); this inline owned
// fixture expects the at-cap acknowledgement instead. This test PROVES
// existing behavior (expected GREEN, not a manufactured RED).
async function armLostAckCommitAtCap(p,proofs,expectId,expectToken){
 let first=true;
 proofs.calls=0;proofs.posts=[];proofs.receipt=null;proofs.fixtureError=null;
 await p.route(base+'/api/mocks/commit',async route=>{
  proofs.calls++;proofs.posts.push(route.request().postData());
  const resp=await route.fetch();
  const text=await resp.text();
  let body=null;try{body=JSON.parse(text);}catch{}
  if(first){
   first=false;
   proofs.upstream={status:resp.status(),body};
   const receipt={events:[],upstreamStatus:resp.status(),upstreamBody:body};
   proofs.receipt=receipt;
   try{
    if(resp.status()!==201)throw new Error('original at-cap commit ack status '+resp.status()+' (expected 201)');
    if(!body||body.id!==expectId)throw new Error('original at-cap commit ack id mismatch: '+JSON.stringify(body&&body.id));
    if(body.created!==true)throw new Error('original at-cap commit ack created not true: '+JSON.stringify(body&&body.created));
    if(body.used!==3)throw new Error('original at-cap commit ack used not 3: '+JSON.stringify(body&&body.used));
    receipt.events.push('original-ack-validated:201:id='+expectId+':created=true:used=3');
    const gotItem=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(expectId),{headers:{'authorization':'Bearer '+expectToken},credentials:'omit'});
    const gotText=await gotItem.text();
    let gotJson=null;try{gotJson=JSON.parse(gotText);}catch{}
    if(gotItem.status!==200)throw new Error('direct HTTP item readback status '+gotItem.status);
    const mock=gotJson&&gotJson.mock;
    if(!mock||mock.id!==expectId)throw new Error('direct HTTP item readback id mismatch');
    if(mock.note!==SAVE_NOTE)throw new Error('direct HTTP item readback note mismatch');
    const reviews=Array.isArray(mock.reviews)?mock.reviews:[];
    if(reviews.length!==1)throw new Error('direct HTTP item readback review count '+reviews.length);
    if(!reviews.some(q=>q.thinking===SAVE_THINKING))throw new Error('direct HTTP item readback missing the original thinking review');
    receipt.itemStatus=gotItem.status;receipt.itemNote=mock.note;
    receipt.itemReviews=reviews.map(q=>({section:q.section,number:q.number,thinking:q.thinking,free:q.free}));
    receipt.events.push('direct-http-item-readback:200:id='+expectId+':note=SAVE_NOTE:reviews=1');
    const gotUsage=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+expectToken},credentials:'omit'});
    const usageJson=await gotUsage.json();
    if(gotUsage.status!==200)throw new Error('direct HTTP usage readback status '+gotUsage.status);
    receipt.usageStatus=gotUsage.status;receipt.usage=usageJson.cumulativeLogsUsed;
    if(usageJson.cumulativeLogsUsed!==3)throw new Error('direct HTTP usage readback shows '+JSON.stringify(usageJson.cumulativeLogsUsed)+' (expected 3)');
    receipt.events.push('direct-http-usage-readback:200:used=3');
    await route.fulfill({status:503,contentType:'text/plain; charset=utf-8',body:'lost-ack-at-cap fixture'});
    receipt.events.push('controlled-503-replacement-fulfilled');
   }catch(e){
    proofs.fixtureError=String(e&&e.message||e);
    receipt.events.push('fixture-error:'+proofs.fixtureError);
    await route.fulfill({status:503,contentType:'text/plain; charset=utf-8',body:'lost-ack-at-cap fixture'}).catch(()=>{});
   }
  }
  else{
   // Retry: pass the REAL response through truthfully. At the cap the stable
   // ID hits the receipt-replay branch: actual 200 created:false used:3.
   proofs.retry={status:resp.status(),body};
   proofs.receipt.events.push('retry-upstream-observed:status='+resp.status()+':created='+JSON.stringify(body&&body.created)+':used='+JSON.stringify(body&&body.used));
   await route.fulfill({status:resp.status(),contentType:'application/json',body:text});
  }
 });
}
test('account save recovery b1: a lost acknowledgement after the real at-cap upstream commit used:3 shows truthful cannot-confirm copy and the keyboard retry re-sends the identical commit answered created:false used:3 with no fourth debit and the unchanged original draft cleared only at the actual detail',async()=>{
 const acct=await account();
 // TWO genuine seeded HTTP commits over the accepted API (usage 2).
 const seed1=await commit(acct.token);
 const seed2=await commit(acct.token);
 assert.equal(seed1.used,1,'seed commit 1 ack used');
 assert.equal(seed2.used,2,'seed commit 2 ack used');
 const usagePre=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usagePre.json()).cumulativeLogsUsed,2,'two real seeds debit the server counter to 2 before the UI journey');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the at-cap lost-ack journey');
 await wrapSaveApplyObserver(p);
 const id=await saveJourneys(p);
 const proofs={};
 await armLostAckCommitAtCap(p,proofs,id,acct.token);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 // Fixture proof: the THIRD commit ACTUALLY committed at the cap.
 assert.equal(proofs.fixtureError,null,'lost-ack-at-cap fixture readback must succeed: '+proofs.fixtureError);
 assert.equal(proofs.upstream&&proofs.upstream.status,201,'fixture: the at-cap commit actually reached the server and returned 201');
 assert.equal(proofs.upstream.body.id,id,'fixture: the upstream ack carries the expected stable ID');
 assert.equal(proofs.upstream.body.created,true,'fixture: the upstream ack reports created:true');
 assert.equal(proofs.upstream.body.used,3,'fixture: the upstream ack reports the third and final slot used');
 const receiptEvents=proofs.receipt.events;
 const idxReadItem=receiptEvents.indexOf('direct-http-item-readback:200:id='+id+':note=SAVE_NOTE:reviews=1');
 const idxReadUsage=receiptEvents.indexOf('direct-http-usage-readback:200:used=3');
 const idxReplaced=receiptEvents.indexOf('controlled-503-replacement-fulfilled');
 assert.ok(idxReadItem>=0&&idxReadUsage>=0&&idxReplaced>=0,'ordered receipt records both readbacks and the replacement: '+JSON.stringify(receiptEvents));
 assert.ok(idxReadItem<idxReplaced,'the actual HTTP item readback precedes the controlled 503 replacement');
 assert.ok(idxReadUsage<idxReplaced,'the actual HTTP usage readback precedes the controlled 503 replacement');
 assert.deepEqual(proofs.receipt.itemReviews,[{section:'VR',number:'1',thinking:SAVE_THINKING,free:''}],'the receipt carries the actual stored review content');
 assert.equal(proofs.receipt.usage,3,'the receipt carries the actual at-cap usage readback');
 await fs.writeFile(new URL('b1-atcap-receipt.json',out),JSON.stringify({stableId:id,seedAcks:[seed1,seed2],receipt:proofs.receipt,upstreamAck:proofs.upstream,retryAck:proofs.retry},null,2));
 // Truthful uncertain UI: cannot-confirm copy, no success, no detail, no clear.
 const err=await p.locator('[data-account-save="error"]').textContent();
 assert.equal(err,SAVE_RECOVERY_ERR_UNCERTAIN,'the at-cap uncertain outcome states the truthful cannot-confirm copy');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success claim before a validated receipt');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no completed result before a validated receipt');
 const storedUncertain=await localDraft(p);
 assert.equal(storedUncertain.draft&&storedUncertain.draft.id,id,'the exact stable ID draft is retained at the cap');
 assert.equal(storedUncertain.draft.note,SAVE_NOTE,'the retained draft is the exact original third-draft content');
 assert.deepEqual(storedUncertain.mocks,[]);assert.equal(storedUncertain.used,0);
 const usageUncertain=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageUncertain.json()).cumulativeLogsUsed,3,'the actual at-cap commit debited exactly to the cap despite the lost ack');
 await shot(p,'shot-1440-account-save-boundaries-b1-error-before-retry.png');
 // Native keyboard Retry: same dialog, EXACT same POST body, no new content.
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(proofs.calls,2,'uncertain attempt plus retry: exactly two intercepted commit POSTs');
 assert.equal(proofs.posts[0],proofs.posts[1],'the retry transmits the EXACT same stable ID and payload at the cap');
 assert.ok(proofs.posts[0].includes(id)&&proofs.posts[0].includes(SAVE_NOTE)&&proofs.posts[0].includes(SAVE_THINKING),'the retained snapshot carries the original content');
 assert.equal(proofs.retry&&proofs.retry.status,200,'the retry reaches the server and is answered 200 (receipt replay)');
 assert.equal(proofs.retry.body.created,false,'the retry ack is the actual created:false idempotent acknowledgement');
 assert.equal(proofs.retry.body.used,3,'the retry reuses the at-cap usage, never a fourth debit');
 const usageAfter=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageAfter.json()).cumulativeLogsUsed,3,'exactly three server debits total — the lost-ack retry consumed no further allowance');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'the retained original draft clears only on the successful receipt');
 assert.deepEqual(stored.mocks,[]);assert.equal(stored.used,0);assert.deepEqual(stored.savedIds,[]);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the retry shows the actual saved at-cap detail');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'the full detail shows the unchanged stored content');
 assert.deepEqual((await readAckAcks(p)),[{created:false,id,used:3}],'b1: exactly ONE application carrying the retry\'s actual created:false used:3 ack (the original ack was LOST to the browser and must not be fabricated)');
 checkClean(rec,'b1');
 await shot(p,'shot-1440-account-save-boundaries-b1-detail.png');
});
// ── END ui-cloud-account-save-boundaries-atcap-append ──
// ── BEGIN ui-cloud-account-save-pending-typing-append ──
// b2: PENDING SAVE vs NEWER TYPING OWNERSHIP — a fresh fictional account
// (usage 0) creates the original draft through the real score/review UI. The
// connected controller and the test-only apply observer are attached BEFORE
// the journey. After the commit is ACTUALLY acknowledged (armCommitObserver
// passes the real 201 through unchanged), the post-commit detail GET for the
// original record is intercepted with route.fetch() and HELD. Before holding,
// the harness captures+asserts the actual upstream response (200, the
// original stored ID, note=SAVE_NOTE, the original thinking review) and waits
// on a bounded readiness promise so the release can only happen after the
// receipt exists (never release a hold that captured nothing). WHILE the
// original GET receipt is still held, the #note field is mutated to a NEWER
// text through the genuine UI input event path, and the durable draft is
// re-read: same stable ID carrying the NEWER note. The held GET is released
// LAST. The late completion must NOT clear the newer draft, must NOT mark
// newer typing saved (zero apply-seam calls), must NOT show done and must
// NOT open the account full detail. Cloud HTTP readback records the ORIGINAL
// committed content unchanged (note=SAVE_NOTE, usage 1); exactly one commit
// POST; local mocks/used/savedIds unchanged. This test PROVES existing
// behavior (expected GREEN, not a manufactured RED). It does NOT press a
// fresh Save with the changed same-ID payload: whether that later
// commit_conflict is the intended same-ID fork decision is a product
// question left for architecture review, reported, not asserted here.
async function holdFirstDetailGet(p,hold){
 hold.calls=[];hold.receipt=null;hold.ready=null;hold.error=null;
 let resolveReady;
 hold.ready=new Promise(r=>{resolveReady=r;});
 await p.route(REC_ITEM,async route=>{
  const url=route.request().url();
  hold.calls.push(url);
  if(hold.receipt===null){
   // Hold ONLY the first GET; capture the actual response before holding.
   try{
    const resp=await route.fetch();
    const text=await resp.text();
    let body=null;try{body=JSON.parse(text);}catch{}
    hold.receipt={status:resp.status(),body,text,headers:resp.headers()};
    resolveReady();
   }catch(e){hold.error=String(e&&e.message||e);resolveReady();}
   await new Promise(r=>{hold.release=()=>r();});
   if(hold.error)await route.abort().catch(()=>{});
   else await route.fulfill({status:hold.receipt.status,headers:{'content-type':'application/json; charset=utf-8','etag':hold.receipt.headers.etag},body:hold.receipt.text}).catch(()=>{});
   return;
  }
  // Subsequent GETs pass through truthfully and quickly.
  const resp=await route.fetch();
  const text=await resp.text();
  await route.fulfill({status:resp.status(),contentType:'application/json; charset=utf-8',body:text});
 });
}
const clearHeldDetailGet=p=>p.unroute(REC_ITEM);
test('account save recovery b2: a held first detail read after an acknowledged commit cannot clear newer genuine-UI typing — the late receipt applies zero times, the newer same-ID draft is retained, and the original cloud record and single debit stay unchanged',async()=>{
 const acct=await account();
 const usagePre=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usagePre.json()).cumulativeLogsUsed,0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the pending-save/newer-typing journey');
 // r2-era proven pattern: wrap the apply seam BEFORE the actual journey.
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 const NEWER_NOTE='Newer typing during pending save 7q4 must never be cleared by a late original receipt';
 const hold={};
 await holdFirstDetailGet(p,hold);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 // The commit is genuinely acknowledged first (the observer passes the real
// 201 through unchanged); the controller then issues the post-commit detail
// GET, which the fixture intercepts, captures and holds. Bounded readiness:
// proceed only after the first GET receipt exists — never release a hold
// that captured nothing.
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'held-GET capture must succeed: '+hold.error);
 assert.equal(obs.commits.length,1,'the acknowledged commit issued exactly one POST');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'the observer must record the ACTUAL upstream 201 created:true used:1 acknowledgement');
 // Assert the EXPECTED original stored content from the captured receipt
 // BEFORE anything is released.
 assert.equal(hold.receipt.status,200,'the first detail GET actually returned 200 upstream');
 const heldMock=hold.receipt.body&&hold.receipt.body.mock;
 assert.ok(heldMock&&heldMock.id===id,'the held receipt carries the original stored ID');
 assert.equal(heldMock.note,SAVE_NOTE,'the held receipt carries the original committed note');
 assert.ok((heldMock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the held receipt carries the original thinking review');
 await fs.writeFile(new URL('b2-held-get-receipt.json',out),JSON.stringify({stableId:id,detailReceipt:{status:hold.receipt.status,body:hold.receipt.body},commitAcks:obs.commits},null,2));
 // WHILE the original GET receipt is still held: mutate #note through the
 // genuine UI (real typing into the field fires the app input handler).
 const noteField=p.locator('#note');
 assert.ok((await noteField.inputValue()).includes(SAVE_NOTE),'the visible field carries the original note before editing');
 await noteField.fill(NEWER_NOTE);
 await settle(500);
 const storedDuring=await localDraft(p);
 assert.equal(storedDuring.draft&&storedDuring.draft.id,id,'the durable draft keeps the SAME stable ID while the save is pending');
 assert.equal(storedDuring.draft.note,NEWER_NOTE,'the durable draft carries the NEWER genuine-UI typing');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success while the original detail read is still held');
 await shot(p,'shot-1440-account-save-boundaries-b2-newer-typing-pending.png');
 // Release the original GET LAST; then give the late continuation time to run.
 await hold.release();
 await settle(1500);
 // The late VALID success receipt (exact status/content-type/etag preserved)
// meets the app's changed-draft guard: seam.apply returns null, the
// controller invalidates the queue and re-renders. Existing behaviour: no
// success claim, no detail, no clear and no apply — the save session is
// dropped SILENTLY (no error line either), which the final assertions record
// truthfully; whether a changed-draft drop needs its own already-saved
// notice is a reported policy question, not asserted policy here.
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'a late original receipt must never claim success over newer typing');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'a late original receipt must never open the account full detail');
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'the changed-draft drop clears the save feedback region (no stale pending/error line)');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'the pending line must not survive the drop');
 assert.deepEqual((await readAckAcks(p)),[],'the dropped late receipt must apply zero times at the seam (newer typing never marked saved)');
 const storedLate=await localDraft(p);
 assert.equal(storedLate.draft&&storedLate.draft.id,id,'the newer draft survives the late original receipt');
 assert.equal(storedLate.draft.note,NEWER_NOTE,'the newer typed content survives unchanged');
 assert.deepEqual(storedLate.mocks,[]);assert.equal(storedLate.used,0);assert.deepEqual(storedLate.savedIds,[]);
 // Cloud readback: the ORIGINAL commit stands with its original content and
 // exactly one debit; nothing was re-saved and nothing was cancelled.
 await clearHeldDetailGet(p);
 await clearCommitObserver(p);
 const gotItem=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal(gotItem.status,200,'the original account commit remains in the emulator store (never cancelled by the dropped receipt)');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id,'the cloud record keeps the original stable ID');
 assert.equal(itemJson.mock.note,SAVE_NOTE,'the cloud record keeps the ORIGINAL committed note, not the newer local typing');
 assert.ok((itemJson.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the cloud record keeps the original thinking review');
 const usageAfter=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageAfter.json()).cumulativeLogsUsed,1,'exactly one server debit across the whole journey');
 assert.equal(obs.commits.length,1,'exactly one actual POST reached the commit route');
 assert.equal(hold.calls.length,1,'the first detail GET was intercepted and held exactly once; the late release is that same delivery');
 checkClean(rec,'b2');
 await shot(p,'shot-1440-account-save-boundaries-b2-newer-typing-retained.png');
});
// ── END ui-cloud-account-save-pending-typing-append ──
// ── BEGIN ui-cloud-account-save-readonly-append ──
// Submitted-draft read-only lock (Joseph-approved: "temporarily lock editing
// until the save outcome is resolved"). Derived harness = EXACT immutable
// ui-cloud-account-save-boundaries.test.mjs (878e696c…) bytes + THIS marked
// EOF append; truncating here reproduces the 878e696c… bytes byte-exact. No
// generator/transform/wrapper/source-map file; historical harnesses untouched.
// Lock phases (the controller's explicit locked-draft predicate): pending /
// failed uncertain / acknowledged-result-unavailable / committed-cleanup-
// pending. NOT the queued unconfirmed dialog and NOT any unrelated draft;
// the anonymous/default path and saved-review never lock. The confirmed-but-
// unresolved draft stays READABLE, draft-mutating controls are disabled and
// their handlers refuse at the entry, Retry (outside the editor) stays
// active, and navigation remains the separately-sequenced ABA risk.
const COPY_RO_READONLY='This submitted draft is read-only while its account save is being resolved. Use Retry if needed.';
// holdFirstCommitForReadonly: intercepts the FIRST commit with route.fetch()
// so it ACTUALLY reaches the server (proven: real 201 ack plus direct HTTP
// item+usage readbacks recorded in an ordered event list, all strictly BEFORE
// any release), then HOLDS the delivery so the pending lock phase is
// observable. The test releases only after the pending assertions; release
// delivers the controlled 503 replacement (a lost ack AFTER a true commit —
// a labelled browser-layer fixture, never a backend outage claim). The
// second POST (the retry) is passed through truthfully and recorded.
async function holdFirstCommitForReadonly(p,hold,expectId,expectToken){
 hold.calls=0;hold.posts=[];hold.events=[];hold.error=null;hold.released=false;hold.retry=null;
 let resolveReady;hold.ready=new Promise(r=>{resolveReady=r;});
 await p.route(base+'/api/mocks/commit',async route=>{
  hold.calls++;hold.posts.push(route.request().postData());
  const resp=await route.fetch();
  const text=await resp.text();
  let body=null;try{body=JSON.parse(text);}catch{}
  if(hold.calls===1){
   hold.upstream={status:resp.status(),body};
   try{
    if(resp.status()!==201)throw new Error('original commit ack status '+resp.status()+' (expected 201)');
    if(!body||body.id!==expectId)throw new Error('original commit ack id mismatch: '+JSON.stringify(body&&body.id));
    if(body.created!==true)throw new Error('original commit ack created not true: '+JSON.stringify(body&&body.created));
    if(body.used!==1)throw new Error('original commit ack used not 1: '+JSON.stringify(body&&body.used));
    hold.events.push('original-ack-validated:201:id='+expectId+':created=true:used=1');
    const gotItem=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(expectId),{headers:{'authorization':'Bearer '+expectToken},credentials:'omit'});
    const gotJson=await gotItem.json().catch(()=>null);
    if(gotItem.status!==200)throw new Error('direct HTTP item readback status '+gotItem.status);
    const mock=gotJson&&gotJson.mock;
    if(!mock||mock.id!==expectId)throw new Error('direct HTTP item readback id mismatch');
    if(mock.note!==SAVE_NOTE)throw new Error('direct HTTP item readback note mismatch');
    hold.events.push('direct-http-item-readback:200:id='+expectId+':note=SAVE_NOTE');
    const gotUsage=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+expectToken},credentials:'omit'});
    if(gotUsage.status!==200)throw new Error('direct HTTP usage readback status '+gotUsage.status);
    const usageJson=await gotUsage.json();
    if(usageJson.cumulativeLogsUsed!==1)throw new Error('direct HTTP usage readback shows '+JSON.stringify(usageJson.cumulativeLogsUsed)+' (expected 1)');
    hold.events.push('direct-http-usage-readback:200:used=1');
   }catch(e){hold.error=String(e&&e.message||e);hold.events.push('fixture-error:'+hold.error);}
   resolveReady();
   // Bounded hold: the delivery is released ONLY when the test explicitly
   // releases (never release a hold that captured nothing).
   await new Promise(r=>{hold.release=async()=>{hold.released=true;hold.events.push('controlled-503-replacement-fulfilled');r();};});
   await route.fulfill({status:503,contentType:'text/plain; charset=utf-8',body:'readonly held-ack fixture'});
   return;
  }
  hold.retry={status:resp.status(),body};
  hold.events.push('retry-upstream-observed:status='+resp.status()+':created='+JSON.stringify(body&&body.created)+':used='+JSON.stringify(body&&body.used));
  await route.fulfill({status:resp.status(),contentType:'application/json',body:text});
 });
 hold.waitHeld=async()=>{await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: first commit was never intercepted within the window (calls='+hold.calls+')')),20000))]);};
}
const clearHeldCommit=p=>p.unroute(base+'/api/mocks/commit');

// ── ro1: pending + uncertain exact-retry lock. ONE real-browser test:
// cancel BEFORE confirmation retains editing with zero POST; confirming the
// Save whose first real commit is intercepted and held (201 proven with
// ordered item+usage readbacks before any release) locks the submitted draft
// read-only with the concise explanation; the released ack as a controlled
// 503 keeps the lock through the uncertain phase with the exact ID+payload;
// a Cancel of the native keyboard retry confirmation leaves recovery+lock
// intact with no extra POST; the confirmed retry transmits the EXACT original
// body, gets the actual 200 created:false at unchanged usage, opens the real
// account detail, clears the draft and releases the lock. PRIMARY missing-
// behavior assertion (read-only lock presentation) fails RED first.
test('account save readonly: ro1 a confirmed save whose real first commit is intercepted and held locks the submitted draft read-only through the uncertain outcome, retry cancel keeps the lock, and the confirmed keyboard retry re-sends the exact original body answered created:false while the released lock clears only the unchanged draft',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the read-only lock journey');
 const id=await saveJourneys(p);
 // (a) Cancel BEFORE confirmation: settled existing behaviour — the draft
 // stays fully editable and zero commit requests happen. The unconfirmed
 // queued dialog must NOT lock (lock phases start only after confirmation).
 await p.locator('[data-act="save"]').click();
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),false,'the queued confirmation dialog must not lock editing');
 await p.getByRole('dialog').getByRole('button',{name:'Keep reviewing'}).click();
 await settle(300);
 assert.equal(commitCount(rec),0,'cancel before confirmation must make zero commit requests');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),false,'a cancelled save must leave the draft editable');
 assert.equal(await p.locator('[data-act="save"]').isDisabled(),false,'a cancelled save must leave Save enabled');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'no read-only lock before a confirmed submission');
 // (b) Confirmed save with the first REAL commit intercepted and held.
 const hold={};
 await holdFirstCommitForReadonly(p,hold,id,acct.token);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await hold.waitHeld();
 // Bounded readiness proof BEFORE any release: the commit ACTUALLY returned
 // 201 and the direct HTTP item+usage readbacks precede the replacement.
 assert.equal(hold.error,null,'held-commit fixture readback must succeed: '+hold.error);
 assert.equal(hold.upstream.status,201,'fixture: the original commit actually reached the server and returned 201');
 assert.equal(hold.upstream.body.id,id,'fixture: the upstream ack carries the expected stable ID');
 assert.equal(hold.upstream.body.created,true,'fixture: the upstream ack reports created:true');
 assert.equal(hold.upstream.body.used,1,'fixture: the upstream ack reports the first usage');
 assert.ok(hold.events.includes('direct-http-item-readback:200:id='+id+':note=SAVE_NOTE'),'ordered receipt records the actual item readback');
 assert.ok(hold.events.includes('direct-http-usage-readback:200:used=1'),'ordered receipt records the actual usage readback');
 assert.ok(!hold.events.includes('controlled-503-replacement-fulfilled'),'the controlled replacement has not been released yet');
 await fs.writeFile(new URL('ro1-held-commit-receipt.json',out),JSON.stringify({stableId:id,events:hold.events,upstreamAck:hold.upstream,retryAck:hold.retry},null,2));
 // Pending phase is live in the UI.
 await p.waitForSelector('[data-account-save="status"]',{timeout:15000});
 // PRIMARY read-only assertions (missing behavior: today the submitted draft
 // stays editable while the save is pending).
 await shot(p,'shot-1440-account-save-readonly-red-pending.png');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the pending phase must explain the read-only submitted draft');
 assert.equal(await p.locator('[data-account-save-lock="note"]').textContent(),COPY_RO_READONLY,'the read-only explanation uses the approved concise neutral copy');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'pending: the submitted reflection note must be readable but not editable');
 assert.ok((await p.locator('#note').inputValue()).includes(SAVE_NOTE),'pending: the retained draft text stays readable');
 assert.equal(await p.locator('#questionNumber').evaluate(el=>el.readOnly),true,'pending: the add-question number field must not be editable');
 assert.equal(await p.locator('#section').evaluate(el=>el.disabled),true,'pending: the add-question section select must be disabled');
 assert.equal(await p.locator('[data-act="add-question"]').isDisabled(),true,'pending: Add selected question must be disabled');
 assert.equal(await p.locator('[data-act="save"]').isDisabled(),true,'pending: a repeated Save cannot replace the submitted intent');
 // Keyboard typing cannot change the retained content (real key events;
 // readOnly blocks native insertion and the app input handler refuses too).
 await p.evaluate(()=>document.getElementById('note')?.focus());
 await p.keyboard.press('End');
 for(const k of ['Space','l','o','c','k','e','d','-','9','f','2'])await p.keyboard.press(k);
 const visibleNote=await p.locator('#note').inputValue();
 assert.ok(!visibleNote.includes('locked-9f2'),'browser keyboard typing cannot change the locked submitted note: '+visibleNote);
 const storedPending=await localDraft(p);
 assert.equal(storedPending.draft.id,id,'the exact submitted draft ID is retained while pending');
 assert.equal(storedPending.draft.note,SAVE_NOTE,'the durable draft content is unchanged by locked typing');
 // A forced action on the (possibly stale) Save control must still refuse
 // at the handler entry and send nothing extra.
 await p.evaluate(()=>{const b=document.querySelector('[data-act="save"]');b.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 await settle(400);
 assert.equal(hold.calls,1,'a forced repeated Save dispatch cannot issue a second commit or replace the submitted intent');
 assert.equal(await p.locator('[data-account-save="status"]').count(),1,'the pending line remains: still the same submitted session');
 // Mobile capture of the pending lock (cheap viewport change while held).
 await p.setViewportSize({width:390,height:844});
 await shot(p,'shot-390-account-save-readonly-pending.png');
 await p.setViewportSize({width:1440,height:1000});
 // Release the held acknowledgement as the controlled 503 (lost ack AFTER
 // the true commit) so the browser enters the uncertain phase.
 await hold.release();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-save="error"]').textContent(),SAVE_RECOVERY_ERR_UNCERTAIN,'the released lost ack keeps the truthful cannot-confirm copy');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the uncertain phase stays read-only: the outcome is not resolved yet');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'uncertain: the note remains noneditable');
 assert.equal(await p.locator('[data-act="save"]').isDisabled(),true,'uncertain: repeated Save still cannot replace the exact submitted intent');
 assert.equal((await localDraft(p)).draft.note,SAVE_NOTE,'uncertain: the exact payload is retained unchanged');
 const retryBtn=p.locator('[data-act="account-save-retry"]');
 assert.equal(await retryBtn.count(),1,'Retry is offered in the uncertain phase');
 assert.equal(await retryBtn.isDisabled(),false,'Retry must stay enabled and reachable (not trapped behind the lock)');
 const usageMid=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageMid.json()).cumulativeLogsUsed,1,'the true commit debited exactly once despite the lost ack');
 await shot(p,'shot-1440-account-save-readonly-uncertain-before-retry.png');
 // Cancel of the native keyboard retry confirmation: recovery + lock intact,
 // no extra POST.
 await retryBtn.focus();
 assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.act),'account-save-retry','retry is keyboard focusable while the editor is locked');
 await p.keyboard.press('Enter');
 await p.getByRole('dialog').waitFor({state:'visible',timeout:5000});
 await p.getByRole('dialog').getByRole('button',{name:'Keep reviewing'}).click();
 await settle(400);
 assert.equal(hold.calls,1,'cancelling the retry confirmation sends no extra POST');
 assert.equal(await p.locator('[data-account-save="error"]').count(),1,'cancelling the retry keeps the recovery copy');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'cancelling the retry keeps the read-only lock');
 assert.equal(await retryBtn.count(),1,'Retry is still available after the cancelled retry');
 // Confirmed keyboard retry: exact original body, actual 200 created:false,
 // same usage, then get/cleanup complete and the real detail opens.
 await p.keyboard.press('Enter');
 await p.getByRole('dialog').waitFor({state:'visible',timeout:5000});
 assert.equal(await p.locator('#mock-save-description').textContent(),'You can return to edit your question reviews later.','the retry re-confirms through the same cancel-safe dialog');
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(hold.calls,2,'uncertain attempt plus retry: exactly two intercepted commit POSTs');
 assert.equal(hold.posts[0],hold.posts[1],'the confirmed retry transmits the EXACT original body');
 assert.ok(hold.posts[0].includes(id)&&hold.posts[0].includes(SAVE_NOTE)&&hold.posts[0].includes(SAVE_THINKING),'the retained snapshot carries the original content');
 assert.equal(hold.retry.status,200,'the retry reaches the server and is answered 200 (already committed)');
 assert.equal(hold.retry.body.created,false,'the retry ack is the actual created:false idempotent acknowledgement');
 assert.equal(hold.retry.body.used,1,'the retry reuses the same usage, never a second debit');
 await clearHeldCommit(p);
 const usageAfter=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageAfter.json()).cumulativeLogsUsed,1,'exactly one server debit total across the held attempt and the retry');
 // Lock released only at the resolved outcome: draft cleared, real detail.
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'a resolved save releases the read-only lock');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'the unchanged submitted draft clears only on the successful receipt');
 assert.deepEqual(stored.mocks,[]);assert.equal(stored.used,0);assert.deepEqual(stored.savedIds,[]);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the retry shows the actual saved account full detail');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'the full detail carries the unchanged stored content');
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'no stale recovery line after resolution');
 checkClean(rec,'ro1');
 await shot(p,'shot-1440-account-save-readonly-detail.png');
});
// ── END ui-cloud-account-save-readonly-append ──
// ── BEGIN ui-cloud-account-save-readonly-cleanup-append ──
// ro2: KNOWN-ACK CLEANUP-DENIAL LOCK/RECOVERY on the locked UI, reusing the
// existing helpers unchanged (armCleanupDenial/setCleanupDeny +
// wrapSaveApplyObserver/readAckAcks + keyboardRetryConfirm). After the REAL
// commit + get, the key-scoped cleanup denial puts the controller in
// committed-cleanup-pending: the submitted draft stays locked read-only with
// the concise explanation; a native keyboard Retry re-applies with the SAME
// true-created ack (no second POST, no second debit) and stays locked;
// releasing the denial and retrying completes ONLY the local cleanup, the
// lock releases, the unchanged draft clears and the actual full detail opens.
// (acknowledged-result-unavailable shares the identical lockedId predicate
// branch proven by ro1/ro2 endpoints; its own live lock observation stays a
// disclosed derivation, per the no-blanket rule.)
test('account save readonly: ro2 a cleanup denial after the acknowledged commit keeps the submitted draft locked read-only through denied retries with the same true-created ack and zero extra POST, and the released keyboard retry alone completes cleanup, releases the lock and opens the actual detail',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const bodies=[];
 p.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/api/mocks/commit'))bodies.push(r.postData());});
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the cleanup-lock journey');
 const id=await saveJourneys(p);
 await wrapSaveApplyObserver(p);
 await armCleanupDenial(p);
 await setCleanupDeny(p,true);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 await setCleanupDeny(p,false);
 // Cleanup pending AFTER a real commit+get: locked phase.
 assert.equal(await p.locator('[data-account-save="error"]').textContent(),SAVE_ERR_CLEANUP,'the denial after the acknowledged commit shows saved-but-cleanup-pending');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'committed-cleanup-pending keeps the read-only lock explanation');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'cleanup-pending: the submitted note stays readable but noneditable');
 assert.ok((await p.locator('#note').inputValue()).includes(SAVE_NOTE),'cleanup-pending: the retained draft text stays readable');
 assert.equal(await p.locator('[data-act="save"]').isDisabled(),true,'cleanup-pending: repeated Save cannot replace the submitted intent');
 assert.equal(await p.locator('[data-act="add-question"]').isDisabled(),true,'cleanup-pending: add-question is disabled');
 const retryBtn=p.locator('[data-act="account-save-retry"]');
 assert.equal(await retryBtn.isDisabled(),false,'cleanup-pending: Retry stays enabled outside the locked editor');
 await p.evaluate(()=>{const b=document.querySelector('[data-act="save"]');b.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 await settle(300);
 assert.equal(bodies.length,1,'a forced repeated Save dispatch during the cleanup lock sends no extra POST');
 assert.equal(commitCount(rec),1,'the cleanup-pending lock keeps exactly one commit request');
 await shot(p,'shot-1440-account-save-readonly-cleanup-pending.png');
 // Denied retry (deny re-armed): same true-created ack re-applies, still locked.
 await setCleanupDeny(p,true);
 await keyboardRetryConfirm(p);
 await p.waitForFunction(()=>window.__uicAckAcks&&window.__uicAckAcks.length===2,null,{timeout:15000});
 await setCleanupDeny(p,false);
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1},{created:true,id,used:1}],'ro2: both applies carry the SAME original true-created ack through the locked denied retry');
 assert.equal(bodies.length,1,'the denied cleanup retry never posts another commit');
 const usageMid=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageMid.json()).cumulativeLogsUsed,1,'still exactly one server debit after the denied retry');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the denied retry keeps the lock and recovery intact');
 assert.equal((await localDraft(p)).draft.id,id,'the draft stays retained after the denied retry');
 // Release: keyboard retry completes ONLY the cleanup and releases the lock.
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'the resolved cleanup releases the read-only lock');
 assert.equal(bodies.length,1,'the released retry completes cleanup with zero second commit');
 assert.equal(commitCount(rec),1);
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1},{created:true,id,used:1},{created:true,id,used:1}],'ro2: the SAME true-created ack rides every locked apply to the final one');
 const usageAfter=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageAfter.json()).cumulativeLogsUsed,1,'still exactly one server debit');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'the released retry clears the unchanged original draft');
 assert.deepEqual(stored.mocks,[]);assert.equal(stored.used,0);assert.deepEqual(stored.savedIds,[]);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the completed cleanup opens the actual saved detail');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'the actual full detail opens after cleanup');
 // Draft editing is available again only because the draft itself cleared;
 // the history surface is the account detail (never a locked editor).
 assert.equal(await p.locator('#note').count(),0,'the cleared draft leaves no editor to lock');
 checkClean(rec,'ro2');
 await shot(p,'shot-1440-account-save-readonly-cleanup-detail.png');
});
// ── END ui-cloud-account-save-readonly-cleanup-append ──
// ── BEGIN ui-cloud-account-save-readonly-detail-append ──
// ro3: ONE focused inheritance of the proven acknowledged-detail-read
// recovery (r2p journey: real commit observer + controlled 503 on the GET
// route), ADAPTED ONLY by appending read-only lock assertions at the
// acknowledged-result-unavailable phase — the last lock branch not yet
// directly observed (ro1 proves pending+uncertain, ro2 proves
// committed-cleanup-pending). No new production semantics, no blanket
// re-run: same helpers, same journey, extra lock checks before Retry.
test('account save readonly: ro3 an acknowledged commit whose detail read is refused keeps the submitted draft locked read-only through the acknowledged-result-unavailable phase and the re-read retry alone releases the lock',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const bodies=[];
 p.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/api/mocks/commit'))bodies.push(r.postData());});
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the acknowledged-read lock journey');
 await wrapSaveApplyObserver(p);
 const id=await saveJourneys(p);
 await arm503DetailRead(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 // Proven real commit + acknowledged ack, then the GET refused.
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'the commit observer must record the ACTUAL upstream 201 acknowledgement');
 assert.equal(await p.locator('[data-account-save="error"]').textContent(),SAVE_RECOVERY_ERR_SAVED_UNAVAILABLE,'an acknowledged commit with a refused detail read keeps the already-saved copy');
 // LOCKED PHASE (the appended lock assertions): acknowledged-result-unavailable.
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'acknowledged-result-unavailable keeps the read-only lock explanation');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'acknowledged-result-unavailable: the submitted note stays readable but noneditable');
 assert.ok((await p.locator('#note').inputValue()).includes(SAVE_NOTE),'acknowledged-result-unavailable: the retained draft text stays readable');
 assert.equal(await p.locator('[data-act="save"]').isDisabled(),true,'acknowledged-result-unavailable: repeated Save cannot replace the submitted intent');
 assert.equal(await p.locator('[data-act="add-question"]').isDisabled(),true,'acknowledged-result-unavailable: add-question is disabled');
 const retryBtn=p.locator('[data-act="account-save-retry"]');
 assert.equal(await retryBtn.isDisabled(),false,'acknowledged-result-unavailable: Retry stays enabled and reachable');
 await p.evaluate(()=>{const b=document.querySelector('[data-act="save"]');b.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 await settle(300);
 assert.equal(bodies.length,1,'a forced repeated Save during the locked re-read phase sends no extra commit');
 assert.equal((await localDraft(p)).draft.note,SAVE_NOTE,'acknowledged-result-unavailable: the exact payload is retained unchanged');
 await shot(p,'shot-1440-account-save-readonly-detail-unavailable.png');
 // Release the fixture and retry: re-read only, then the lock releases.
 await clear503DetailRead(p);
 await clearCommitObserver(p);
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(new Set(bodies).size,1,'the re-read retry posts no second commit');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'the re-read outcome releases the read-only lock');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'the retained draft clears on the completed re-read receipt');
 assert.deepEqual(stored.mocks,[]);assert.equal(stored.used,0);assert.deepEqual(stored.savedIds,[]);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the retry re-read shows the ACTUAL saved detail');
 checkClean(rec,'ro3');
});
// ── END ui-cloud-account-save-readonly-detail-append ──
// ── BEGIN ui-cloud-account-save-readonly-review-retry-append ──
// rr1: the approved read-only lock's missed legacy review Retry mutation
// path. ACCOUNT_SAVE_LOCK_BLOCKED_ACTS omitted 'retry-review', and the
// review-persistence Retry buttons live in #messages outside the
// [data-account-save] controller region, so reviewAction('retry-review')
// could invoke a captured reviewFailures retry and mutate the locked
// submitted draft even while normal edit controls were locked. ONE genuine
// real-browser test: reach the REVIEW route via the actual review-question
// action after saveJourneys, establish a FAILED mark review intent with the
// key-scoped Storage denial, release the denial, confirm the actual Save
// from the review route, intercept the real first commit (route.fetch, 201
// proven with ordered item+usage HTTP readbacks BEFORE any release) and
// hold it. During the pending phase the pre-existing legacy review Retry
// MUST be disabled (the RED assertion on the current app) and a stale
// dispatched click must not mutate or write the owned draft. The released
// controlled-503 keeps the lock; the legacy review Retry stays blocked while
// the ACCOUNT-save Retry stays enabled; the keyboard account Retry re-sends
// the exact original body (200 created:false, same usage) and the pending
// review intent is never silently executed. The captured review failure is
// retained (existing review policy and confirmations unchanged); only the
// locked-draft actset grows by 'retry-review'.
test('account save readonly review-retry: rr1 a failed mark review intent established before the confirmed account Save keeps its legacy review Retry disabled through the whole locked phase, a stale dispatched click cannot mutate or write the owned draft, the account Save Retry stays enabled and completes with the exact original body, and the pending review intent is never silently executed',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the review-retry lock journey');
 const id=await saveJourneys(p);
 // (a) Reach the REVIEW route via the actual review-question action.
 await p.locator('[data-act="review-question"]').first().click();
 await p.waitForSelector('#thinking');
 // (b) Establish a FAILED mark review intent through the key-scoped
// browser-storage denial (existing armCleanupDenial/setCleanupDeny shim).
 await armCleanupDenial(p);
 await setCleanupDeny(p,true);
 await p.locator('[data-act="mark"]').click();
 await settle(200);
 const retryKey=`draft:${id}:mark:VR:1`;
 const staleSel=`[data-act="retry-review"][data-review-retry="${retryKey}"]`;
 const stale=p.locator(staleSel);
 assert.equal(await stale.count(),1,'the failed mark must offer its native review Retry with the exact draft-owned target key');
 assert.equal(await stale.textContent(),'Retry mark needing review for VR · Question 1','the review Retry names the exact target and reviewed precondition');
 assert.ok((await p.locator('#review-persistence').textContent()).includes('Could not save review to this browser.'),'the failed review intent is established through the real review-persistence error');
 const snap=await localDraft(p);
 assert.equal(snap.draft.reviews[0].reviewed,true,'the denied mark left the draft honestly reviewed (the intent was NOT applied)');
 assert.equal(snap.draft.id,id,'the failed review intent belongs to the owning draft');
 // (c) Release the denial and confirm the actual Save from the REVIEW route
// with the same cancel-safe confirmation, intercepting and HOLDING the real
// first commit (201 plus direct item+usage readbacks proven before release).
 await setCleanupDeny(p,false);
 const hold={};
 await holdFirstCommitForReadonly(p,hold,id,acct.token);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await hold.waitHeld();
 assert.equal(hold.error,null,'held-commit fixture readback must succeed: '+hold.error);
 assert.equal(hold.upstream.status,201,'fixture: the original commit actually reached the server and returned 201');
 assert.ok(hold.events.includes('direct-http-item-readback:200:id='+id+':note=SAVE_NOTE'),'ordered receipt records the actual item readback before any release');
 assert.ok(hold.events.includes('direct-http-usage-readback:200:used=1'),'ordered receipt records the actual usage readback before any release');
 assert.ok(!hold.events.includes('controlled-503-replacement-fulfilled'),'the controlled replacement has not been released yet');
 await fs.writeFile(new URL('rr1-held-commit-receipt.json',out),JSON.stringify({stableId:id,events:hold.events,upstreamAck:hold.upstream,retryAck:hold.retry},null,2));
 await p.waitForSelector('[data-account-save="status"]',{timeout:15000});
 // Pending lock on the review route: ordinary edits locked, account
// feedback available, at most one commit.
 assert.equal(await p.locator('[data-account-save="status"]').count(),1,'the pending account-save feedback stays available on the locked review route');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the pending submission still explains the read-only lock on the review route');
 assert.equal(await p.locator('#thinking').evaluate(el=>el.readOnly),true,'ordinary review editing is locked while the account save is unresolved');
 assert.equal(await p.locator('[data-act="mark"]').isDisabled(),true,'ordinary mark editing is disabled while locked');
 assert.equal(await p.locator('[data-act="save"]').isDisabled(),true,'ordinary Save cannot replace the submitted intent');
 assert.equal(await p.locator('[data-act="account-save-retry"]').count(),0,'no account Retry is offered while the submission is still pending');
 // PRIMARY missing-behavior assertion (fails RED on the current app: the
// pre-existing legacy review Retry is enabled because 'retry-review' is
// absent from ACCOUNT_SAVE_LOCK_BLOCKED_ACTS). Screenshot BEFORE it.
 await shot(p,'shot-1440-account-save-readonly-review-retry-pending.png');
 assert.equal(await stale.isDisabled(),true,'the pending phase must disable the stale legacy review Retry on the locked submitted draft');
 // A stale dispatch (bypassing the disabled appearance) must refuse at the
// handler entry: no draft mutation, no browser-local write, no extra POST,
// and the captured review intent is neither consumed nor executed.
 await p.evaluate(sel=>{const b=document.querySelector(sel);if(!b)throw new Error('harness: legacy review Retry button vanished');b.dispatchEvent(new MouseEvent('click',{bubbles:true}));},staleSel);
 await settle(400);
 assert.equal(hold.calls,1,'a stale dispatched review Retry cannot trigger any extra commit while pending');
 const during=await localDraft(p);
 assert.deepEqual(during,snap,'a stale dispatched review Retry cannot mutate or write the locked submitted draft');
 assert.equal(await p.locator(staleSel).count(),1,'the captured review intent stays retained, not silently consumed by the refused attempt');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the refused stale attempt keeps the read-only lock explanation');
 // (d) Release as the controlled 503 (lost ack AFTER the true commit):
// uncertain keeps the lock; the legacy review Retry stays blocked while the
// ACCOUNT-save Retry stays enabled.
 await hold.release();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-save="error"]').textContent(),SAVE_RECOVERY_ERR_UNCERTAIN,'the released lost ack keeps the truthful cannot-confirm copy');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the uncertain phase stays read-only');
 assert.equal(await p.locator(staleSel).isDisabled(),true,'the legacy review Retry stays blocked through the uncertain outcome');
 const accRetry=p.locator('[data-act="account-save-retry"]');
 assert.equal(await accRetry.count(),1,'the account Save Retry is offered in the uncertain phase');
 assert.equal(await accRetry.isDisabled(),false,'the ACCOUNT-save Retry stays enabled and reachable while the legacy review Retry is blocked');
 await shot(p,'shot-1440-account-save-readonly-review-retry-uncertain.png');
 // (e) Confirmed keyboard account Retry: EXACT original body, actual 200
// created:false at unchanged usage, real detail, draft cleared, lock gone —
// and the pending review intent was never silently executed into anything.
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(hold.calls,2,'uncertain attempt plus confirmed retry: exactly two intercepted commit POSTs');
 assert.equal(hold.posts[0],hold.posts[1],'the account retry re-sends the EXACT original body');
 assert.ok(hold.posts[1].includes(id)&&hold.posts[1].includes(SAVE_NOTE)&&hold.posts[1].includes(SAVE_THINKING),'the retained snapshot carries the original content');
 assert.equal(JSON.parse(hold.posts[1]).reviews[0].reviewed,true,'the retried commit is the ORIGINAL owned draft — the pending mark toggle was never executed into it');
 assert.equal(hold.retry.status,200,'the retry reaches the server and is answered 200 (already committed)');
 assert.equal(hold.retry.body.created,false,'the retry ack is the actual created:false idempotent acknowledgement');
 assert.equal(hold.retry.body.used,1,'the retry reuses the same usage, never a second debit');
 await clearHeldCommit(p);
 const usageAfter=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageAfter.json()).cumulativeLogsUsed,1,'exactly one server debit total across the held attempt and the retry');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'the resolved account save releases the read-only lock');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'the unchanged submitted draft clears only on the successful receipt');
 assert.deepEqual(stored.mocks,[]);assert.equal(stored.used,0);assert.deepEqual(stored.savedIds,[]);
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the retry shows the actual saved account full detail');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'the full detail carries the unchanged stored content');
 assert.equal(await p.locator(staleSel).count(),0,'the cleared draft leaves no stale legacy review Retry');
 checkClean(rec,'rr1');
 await shot(p,'shot-1440-account-save-readonly-review-retry-detail.png');
});
// ── END ui-cloud-account-save-readonly-review-retry-append ──
// ── BEGIN ui-cloud-account-save-lifecycle-append ──
// lc1: ACCOUNT-SAVE LIFECYCLE across a genuine Home departure. ONE real
// browser test on unchanged production. The confirmed Save's commit is
// genuinely acknowledged (armCommitObserver passes the real 201 through
// unchanged: created:true, id, used:1) and the FIRST post-commit detail GET
// is intercepted with route.fetch(), captured (actual HTTP 200, stored ID,
// note=SAVE_NOTE, original thinking review, server-owned review ETag) and
// HELD (bounded readiness; never release a hold that captured nothing).
// BEFORE any navigation the submitted UI is proven read-only on its
// selection route (pending line, lock note, readOnly field, disabled Save,
// controller phase 'pending' with the opaque lockedId). The user then leaves
// through the actual workspace Home nav (navigation is deliberately NOT
// locked). WHILE AWAY the exact valid original 200 — status, body and the
// original ETag — is released. Completion is awaited with a bounded
// controller-phase predicate (phase !== 'pending'), not a blind sleep. The
// released receipt must force no navigation, claim no success, open no
// detail, and must leave Home unchanged: the durable draft keeps the exact
// original content, the cloud record exists, usage stays 1 and commit POSTs
// stay at exactly 1. Then the SAME draft is resumed from Home through the
// real 'Resume logging' action. FIRST MISSING-BEHAVIOR ASSERTION (expected
// RED on the current controller): the acknowledged save's outcome is still
// locally unresolved after the route-mismatch drop — the resumed matching
// draft must stay READ-ONLY with a visible truthful saved/recovery notice and
// an explicit enabled account Retry, not silently unlocked with the true-
// created ack discarded. The approved-policy tail (Retry = GET-only, no
// second POST/debit, draft clears only at the actual detail) is asserted
// after it and cannot be reached until that recovery behavior exists.
// Controller state is only READ through the existing test seam (opaque
// phase/lockedId/retained identity; the retained version is hashed, never
// emitted). Screenshot captured BEFORE the first missing assertion so the
// current post-resume phase/lock state is preserved as RED evidence.
const saveState=p=>p.evaluate(()=>{const h=window.__uicSaveHarness;if(!h||!h.saveController)return null;const s=h.saveController.getState();const q=h.saveController.retained();return {phase:s.phase??null,failure:s.failure??null,lockedId:s.lockedId??null,retainedId:q&&q.id||null,retainedRoute:q&&q.route||null,retainedVersion:q&&q.version||null};});
const currentRoute=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)).route,KEY);
const waitPhaseNotPending=async p=>{await p.waitForFunction(()=>window.__uicSaveHarness&&window.__uicSaveHarness.saveController&&window.__uicSaveHarness.saveController.getState().phase!=='pending',undefined,{timeout:15000}).catch(e=>harness('lifecycle: save phase never left pending after the released detail receipt: '+e.message));};
// holdFirstDetailForLifecycle: intercepts the FIRST /api/mocks/item GET with
// route.fetch() so the real request ACTUALLY reaches the real server; the
// captured ORIGINAL response (status/body/ETag) is held until the test
// explicitly releases it, and the release re-delivers that EXACT original
// status, body and original ETag header (a valid late success receipt, not a
// controlled failure). Subsequent detail GETs pass through truthfully with
// their own fresh ETags.
async function holdFirstDetailForLifecycle(p,hold){
 hold.calls=0;hold.receipt=null;hold.error=null;hold.released=false;hold.events=[];
 let resolveReady;hold.ready=new Promise(r=>{resolveReady=r;});
 await p.route(REC_ITEM,async route=>{
  hold.calls++;
  if(hold.receipt===null){
   try{
    const resp=await route.fetch();
    const text=await resp.text();
    let body=null;try{body=JSON.parse(text);}catch{}
    hold.receipt={status:resp.status(),body,text,etag:resp.headers()['etag']??null};
    hold.events.push('first-detail-fetched:status='+resp.status());
   }catch(e){hold.error=String(e&&e.message||e);hold.events.push('fixture-error:'+hold.error);}
   resolveReady();
   // Bounded hold: released ONLY by an explicit test call, never empty.
   await new Promise(r=>{hold.release=async()=>{if(hold.released)return;hold.released=true;hold.events.push('original-receipt-released:status='+hold.receipt.status+':etag='+String(hold.receipt.etag));r();};});
   if(hold.error||!hold.receipt)await route.abort().catch(()=>{});
   else await route.fulfill({status:hold.receipt.status,headers:{'content-type':'application/json; charset=utf-8','etag':hold.receipt.etag??''},body:hold.receipt.text}).catch(()=>{});
   return;
  }
  const resp=await route.fetch();
  const text=await resp.text();
  const et=resp.headers()['etag'];
  hold.events.push('subsequent-detail-fetched:status='+resp.status());
  await route.fulfill({status:resp.status(),contentType:'application/json',...(et?{headers:{etag:et}}:{}),body:text});
 });
}
const clearHeldLifecycleDetail=p=>p.unroute(REC_ITEM);
test('account save lifecycle: lc1 a detail receipt released while away on Home forces no navigation and clears no draft; resuming the same acknowledged draft must keep it read-only with a truthful saved/recovery notice and an enabled account Retry whose confirmation only re-reads (no second POST or debit) and clears only at the actual detail',async()=>{
 const acct=await account();
 const usagePre=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usagePre.json()).cumulativeLogsUsed,0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the lifecycle journey');
 // The real commit acknowledgement is OBSERVED, not replaced (existing
// accepted armCommitObserver pattern: actual 201 passes through unchanged).
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 assert.equal(await currentRoute(p),'selection','the confirmed Save is issued from the selection route');
 const hold={};
 await holdFirstDetailForLifecycle(p,hold);
 // (a) Confirm the actual account Save from the selection UI.
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 // Bounded readiness: proceed only after the first detail receipt exists.
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: the first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'lifecycle held-detail capture must succeed: '+hold.error);
 assert.equal(obs.commits.length,1,'exactly one real commit POST issued before any navigation');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'the original commit is ACTUALLY acknowledged with the real 201 created:true used:1 acknowledgement');
 // FIRST actual detail proof BEFORE navigation: real 200 + ID + note +
// review + the server-owned ETag.
 assert.equal(hold.receipt.status,200,'the first actual detail read returned a real HTTP 200 from the server');
 const dm=hold.receipt.body&&hold.receipt.body.mock;
 assert.ok(dm&&dm.id===id,'the first detail receipt carries the original stored ID');
 assert.equal(dm.note,SAVE_NOTE,'the first detail receipt carries the original committed note');
 assert.ok((dm.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the first detail receipt carries the original thinking review');
 assert.equal(typeof hold.receipt.etag,'string','the first detail receipt carries the server-owned review ETag');
 assert.match(hold.receipt.etag,/^"review-\d+"$/,'the detail ETag is the opaque review revision token: '+String(hold.receipt.etag));
 hold.events.push('first-detail-proved:200:id='+id+':note=SAVE_NOTE:etag='+hold.receipt.etag);
 // (b) Confirm the submitted UI is read-only while the detail read is held.
 await p.waitForSelector('[data-account-save="status"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the pending submission locks the draft read-only with its explanation');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'the retained draft stays readable but locked while the outcome is unresolved');
 assert.equal(await p.locator('[data-act="save"]').isDisabled(),true,'Save cannot replace the submitted intent while pending');
 const stateBefore=await saveState(p);
 assert.equal(stateBefore.phase,'pending','fixture: the controller is still pending on the held detail read');
 assert.equal(stateBefore.lockedId,id,'fixture: the controller locks exactly the owned draft');
 await fs.writeFile(new URL('lc1-held-proof-receipt.json',out),JSON.stringify({stableId:id,commitAcks:obs.commits,detailReceipt:{status:hold.receipt.status,etag:hold.receipt.etag,mock:{id:dm.id,note:dm.note,reviews:(dm.reviews||[]).map(q=>({section:q.section,number:q.number,thinking:q.thinking,free:q.free}))}},events:hold.events.slice()},null,2));
 // (c) Leave using the ACTUAL workspace Home (navigation is deliberately
// not locked; this is the approved departure path, not a blocked form act).
 await p.locator('nav [data-act="home"]').click();
 await p.waitForSelector('.hp-tasks-panel,[data-act="log"]',{timeout:15000});
 assert.equal(await currentRoute(p),'home','the workspace Home nav renders Home while the save outcome is still unresolved');
 // (d) WHILE AWAY: release the EXACT valid original 200 with the original
// ETag, then await completion with a bounded controller-phase predicate.
 await hold.release();
 await waitPhaseNotPending(p);
 await settle(500);
 const stateAfter=await saveState(p);
 await fs.writeFile(new URL('lc1-lifecycle-receipt.json',out),JSON.stringify({stableId:id,events:hold.events.slice(),stateBeforeDeparture:{...stateBefore,retainedVersion:sha(Buffer.from(String(stateBefore.retainedVersion)))},stateAfterRelease:{...stateAfter,retainedVersion:stateAfter&&stateAfter.retainedVersion?sha(Buffer.from(String(stateAfter.retainedVersion))):null},commitCount:obs.commits.length,detailCalls:hold.calls},null,2));
 // Truthful away-phase outcomes: no forced navigation, no success/detail on
// Home, no stale pending line, the durable draft unchanged.
 assert.equal(await currentRoute(p),'home','the released original receipt must not force any navigation');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success claim appears on Home');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no account detail opens on Home');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'the resolved phase leaves no stale pending line on Home');
 const storedAway=await localDraft(p);
 assert.equal(storedAway.draft&&storedAway.draft.id,id,'the original durable draft is retained unchanged while away');
 assert.equal(storedAway.draft.note,SAVE_NOTE,'the retained draft is the exact original committed content');
 assert.deepEqual(storedAway.mocks,[]);assert.equal(storedAway.used,0);assert.deepEqual(storedAway.savedIds,[]);
 // Actual cloud proof: the original record durably exists and usage is 1.
 const gotItem=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal(gotItem.status,200,'the acknowledged original commit durably exists in the emulator store');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id,'the cloud record keeps the original stable ID');
 assert.equal(itemJson.mock.note,SAVE_NOTE,'the cloud record keeps the ORIGINAL committed note');
 assert.ok((itemJson.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the cloud record keeps the original thinking review');
 const usageAway=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageAway.json()).cumulativeLogsUsed,1,'exactly one server debit after the released receipt');
 assert.equal(obs.commits.length,1,'the released route-mismatched receipt triggers no second commit POST');
 assert.equal(hold.calls,1,'the held first detail GET was intercepted exactly once; the release is that same delivery');
 // (e) Log/resume the SAME draft through the real Home CTA.
 const resume=p.getByRole('button',{name:'Resume logging'});
 assert.equal(await resume.count(),1,'the acknowledged draft remains resumable from Home');
 await resume.click();
 await p.waitForSelector('#questionNumber',{timeout:15000});
 assert.equal(await currentRoute(p),'selection','the real Resume action returns the same draft to its owned selection route');
 const resumed=await localDraft(p);
 assert.equal(resumed.draft.id,id,'the resumed draft is the same stable ID');
 assert.equal(resumed.draft.note,SAVE_NOTE,'the resumed draft still carries the exact acknowledged content');
 const stateResumed=await saveState(p);
 await shot(p,'shot-1440-account-save-lifecycle-resumed-red.png');
 // FIRST MISSING-BEHAVIOR assertion (RED on the current app/controller):
// the route-mismatch drop left the acknowledged true-created outcome locally
// unresolved, so the matching resumed draft must STILL be read-only. Current
// code invalidates the queue silently: the draft resumes fully editable with
// no lock note, no recovery notice and no Retry — the ack is discarded.
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the acknowledged save outcome is unresolved locally: the resumed matching draft must stay read-only with its explanation');
 // Truthful saved/recovery notice and the explicit account Retry.
 assert.equal(await p.locator('[data-account-save="error"]').count(),1,'the resumed draft shows a visible truthful saved/recovery notice');
 assert.ok((await p.locator('[data-account-save="error"]').textContent()).includes('saved to your account'),'the notice truthfully reflects the acknowledged commit, never a silent drop');
 const accRetry=p.locator('[data-act="account-save-retry"]');
 assert.equal(await accRetry.count(),1,'the resumed draft offers the explicit account Retry');
 assert.equal(await accRetry.isDisabled(),false,'the account Retry is enabled');
 const finalState=await saveState(p);
 assert.equal(finalState.lockedId,id,'the controller retains the owned acknowledged queue across the departure and resume');
 await shot(p,'shot-1440-account-save-lifecycle-retry-offered.png');
 // Approved-policy tail: account Retry confirmation ONLY re-reads — zero
// additional POSTs/debits — then shows the actual detail and clears exactly
// this draft. Unreachable on the current controller (fails above first).
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(obs.commits.length,1,'the recovery Retry issued no second commit POST (GET-only recovery)');
 assert.equal(hold.calls>=2,true,'the Retry re-read the actual saved detail');
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the recovery shows the actual saved account full detail');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'the full detail carries the unchanged stored content');
 const storedFinal=await localDraft(p);
 assert.equal(storedFinal.draft,null,'only the completed recovery receipt clears the draft');
 assert.deepEqual(storedFinal.mocks,[]);assert.equal(storedFinal.used,0);assert.deepEqual(storedFinal.savedIds,[]);
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'the resolved recovery releases the read-only lock');
 const usageFinal=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageFinal.json()).cumulativeLogsUsed,1,'still exactly one server debit after the GET-only recovery');
 await clearHeldLifecycleDetail(p);
 checkClean(rec,'lc1');
 await shot(p,'shot-1440-account-save-lifecycle-detail.png');
});
// ── END ui-cloud-account-save-lifecycle-append ──
// ── BEGIN ui-cloud-account-save-lifecycle-ack-append ──
// lc2ack: SEPARATELY-NAMED focused proof (authored AFTER the immutable lc1
// GREEN, reusing the EXACT lc1 harness prefix bytes and the ACTUAL journey
// helpers — no production wrapping tricks, no weakened assertions). It
// mounts the existing supported harness observer (wrapSaveApplyObserver, an
// accepted r2 pattern that injects through the real app/controller MOUNT
// SEAM and delegates the unchanged synchronous call), runs the same genuine
// Home-departure / late-release / resume / Retry recovery journey, and
// asserts the original true-created 201 acknowledgement is RETAINED through
// the deferred acknowledged-resume-pending phase and is the exact ack object
// delivered to the app seam.apply on the completed recovery — observed
// as apply-argument {created:true,id,used:1}, with exactly one commit POST
// and one server debit across the whole lifecycle.
test('account save lifecycle ack: lc2ack the same genuine Home-departure recovery journey delivers the retained original true-created 201 acknowledgement to the recovered seam.apply exactly once, observed through the existing mount-seam wrapper with one POST and one debit',async()=>{
 const acct=await account();
 const usagePre=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usagePre.json()).cumulativeLogsUsed,0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the ack-retention journey');
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 assert.equal(await currentRoute(p),'selection','the confirmed Save is issued from the selection route');
 const hold={};
 await holdFirstDetailForLifecycle(p,hold);
 await p.locator('[data-act=\"save\"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: the first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'ack journey held-detail capture must succeed: '+hold.error);
 assert.equal(obs.commits.length,1,'exactly one real commit POST before any navigation');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'the original commit is ACTUALLY acknowledged 201 created:true used:1');
 let acksDuringPending=await readAckAcks(p);
 assert.deepEqual(acksDuringPending,[],'nothing is applied to the app seam while the first detail read is still held');
 await p.locator('nav [data-act=\"home\"]').click();
 await p.waitForSelector('.hp-tasks-panel,[data-act=\"log\"]',{timeout:15000});
 assert.equal(await currentRoute(p),'home','the actual Home nav departs while the outcome is unresolved');
 await hold.release();
 await waitPhaseNotPending(p);
 await settle(500);
 const stateAway=await saveState(p);
 assert.equal(stateAway.phase,'acknowledged-resume-pending','the committed route-mismatch receipt defers to the explicit pending phase instead of dropping');
 const acksAway=await readAckAcks(p);
 assert.deepEqual(acksAway,[],'the deferred receipt applied NOTHING to the app seam while away (no cleanup, no navigation)');
 const resume=p.getByRole('button',{name:'Resume logging'});
 assert.equal(await resume.count(),1,'the acknowledged draft remains resumable from Home');
 await resume.click();
 await p.waitForSelector('#questionNumber',{timeout:15000});
 assert.equal(await currentRoute(p),'selection','Resume returns the same draft to its owned selection route');
 assert.equal(await p.locator('[data-account-save-lock=\"note\"]').count(),1,'the resumed matching draft stays read-only with its explanation');
 assert.equal(await p.locator('[data-account-save=\"error\"]').count(),1,'the resumed draft shows the truthful saved/recovery notice');
 const accRetry=p.locator('[data-act=\"account-save-retry\"]');
 assert.equal(await accRetry.count(),1,'the resumed draft offers the explicit account Retry');
 assert.equal(await accRetry.isDisabled(),false,'the account Retry is enabled');
 await shot(p,'shot-1440-account-save-lifecycle-ack-retry-offered.png');
 // Cheap narrow-viewport capture of the SAME new notice/read-only resumed UI
 // (capture-only viewport resize inside this focused test; no production or
 // journey change; back to 1440 before Retry).
 await p.setViewportSize({width:390,height:844});
 await settle(300);
 await shot(p,'shot-390-account-save-lifecycle-ack-retry-offered.png');
 await p.setViewportSize({width:1440,height:1000});
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save=\"done\"]',{timeout:15000});
 assert.equal(obs.commits.length,1,'the recovery Retry issued no second commit POST (GET-only recovery)');
 const acksFinal=await readAckAcks(p);
 assert.equal(acksFinal.length,1,'the completed recovery applies exactly once through the app seam');
 assert.deepEqual(acksFinal[0],{created:true,id,used:1},'the delivered acknowledgement IS the retained original true-created 201 ack (created:true, stable id, used:1) — it survived the deferred departure phase unchanged');
 await p.waitForSelector('[data-account-history=\"detail\"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history=\"detail\"]').getAttribute('data-account-history-id'),id,'the recovery shows the actual saved account full detail');
 const storedFinal=await localDraft(p);
 assert.equal(storedFinal.draft,null,'only the completed recovery receipt clears the draft');
 const usageFinal=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageFinal.json()).cumulativeLogsUsed,1,'still exactly one server debit after the GET-only recovery');
 await fs.writeFile(new URL('lc2ack-observer-receipt.json',out),JSON.stringify({stableId:id,commitAcks:obs.commits,acksDuringPending,acksAway,acksFinal,stateAwayPhase:stateAway.phase},null,2));
 await clearHeldLifecycleDetail(p);
 checkClean(rec,'lc2ack');
 await shot(p,'shot-1440-account-save-lifecycle-ack-detail.png');
});
// ── END ui-cloud-account-save-lifecycle-ack-append ──
// ── BEGIN ui-cloud-account-save-lifecycle-ack-copy-append ──
// lc3copy: SEPARATELY-NAMED focused copy case (authored AFTER the immutable
// lc2ack GREEN, reusing its EXACT 235873-byte prefix and the ACTUAL journey
// helpers — no production wrapping tricks, no weakened or edited existing
// assertions). Observed presentation defect: while the submitted draft is
// locked (pending and resumed acknowledged-resume-pending), the accurate
// lock notice is shown, but the LOWER pre-existing helper paragraph still
// promises "Question reviews stay editable." — a false editable promise
// DURING pending recovery. This test proves the contradiction is a genuine
// product-copy defect: unlocked selection keeps the legacy helper copy;
// the RESUMED LOCKED helper must NOT contain the legacy editable promise
// and must state the accurate read-only copy. ONE first missing assertion
// sits at the resumed locked state (expected RED against the unchanged
// app). The approved existing tail (Retry is GET-only: exactly one commit
// POST across the lifecycle, one server debit, actual full detail, draft
// clears only at completion) is re-asserted unchanged as regression
// coverage. Screenshot captured BEFORE the first missing assertion.
const selectionHelperCopy=p=>p.evaluate(()=>{const el=[...document.querySelectorAll('#main p.small')].find(t=>t.textContent.includes('Saving locks identity'));return el?el.textContent:null;});
test('account save lifecycle ack copy: lc3copy the resumed locked submitted draft replaces the false legacy editable helper promise with an accurate read-only helper while the unlocked selection keeps the legacy copy, and the GET-only Retry recovery stays unchanged',async()=>{
 const acct=await account();
 const usagePre=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usagePre.json()).cumulativeLogsUsed,0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the copy journey');
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 assert.equal(await currentRoute(p),'selection','the confirmed Save is issued from the selection route');
 // Existing behavior coverage: the UNLOCKED selection keeps the legacy helper.
 const unlockedCopy=await selectionHelperCopy(p);
 assert.equal(unlockedCopy,'Saving locks identity, scores and DM mode. Question reviews stay editable.','unlocked selection keeps the legacy helper copy unchanged');
 const hold={};
 await holdFirstDetailForLifecycle(p,hold);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: the first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'copy journey held-detail capture must succeed: '+hold.error);
 assert.equal(obs.commits.length,1,'exactly one real commit POST before any navigation');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'the original commit is ACTUALLY acknowledged 201 created:true used:1');
 await p.waitForSelector('[data-account-save="status"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'fixture: the pending submission shows the accurate lock note');
 const statePending=await saveState(p);
 assert.equal(statePending.phase,'pending','fixture: the controller is pending on the held detail read');
 // Existing approved departure path: Home nav is deliberately not locked.
 await p.locator('nav [data-act="home"]').click();
 await p.waitForSelector('.hp-tasks-panel,[data-act="log"]',{timeout:15000});
 assert.equal(await currentRoute(p),'home','the actual Home nav departs while the outcome is unresolved');
 await hold.release();
 await waitPhaseNotPending(p);
 await settle(500);
 const stateAway=await saveState(p);
 assert.equal(stateAway.phase,'acknowledged-resume-pending','fixture: the existing acknowledged-resume-pending deferral is intact');
 const resume=p.getByRole('button',{name:'Resume logging'});
 assert.equal(await resume.count(),1,'the acknowledged draft remains resumable from Home');
 await resume.click();
 await p.waitForSelector('#questionNumber',{timeout:15000});
 assert.equal(await currentRoute(p),'selection','Resume returns the same draft to its owned selection route');
 const stateResumed=await saveState(p);
 assert.equal(stateResumed.lockedId,id,'fixture: the resumed matching draft is locked');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the resumed lock note stays accurate');
 await shot(p,'shot-1440-account-save-lockcopy-resumed-red.png');
 // ONE FIRST MISSING ASSERTION (RED on the unchanged app): while resumed
// and locked, the lower helper must not falsely promise editability.
 const lockedCopy=await selectionHelperCopy(p);
 assert.ok(lockedCopy!==null,'the selection helper paragraph is present while locked');
 assert.ok(!lockedCopy.includes('Question reviews stay editable.'),'THE LOCKED HELPER MUST NOT PROMISE EDITABILITY: the locked submission still shows the false legacy copy: '+String(lockedCopy));
 assert.ok(lockedCopy.includes('read-only until the account save is resolved'),'the locked helper states the accurate read-only copy: '+String(lockedCopy));
 await shot(p,'shot-1440-account-save-lockcopy-resumed.png');
 const accRetry=p.locator('[data-act="account-save-retry"]');
 assert.equal(await accRetry.count(),1,'the resumed draft offers the explicit account Retry');
 assert.equal(await accRetry.isDisabled(),false,'the account Retry is enabled');
 // Existing approved tail, unchanged: Retry is GET-only — no second POST,
// one debit, actual full detail, and only the completed receipt clears.
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(obs.commits.length,1,'the recovery Retry issued no second commit POST (GET-only recovery)');
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'the recovery shows the actual saved account full detail');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'the full detail carries the unchanged stored content');
 const storedFinal=await localDraft(p);
 assert.equal(storedFinal.draft,null,'only the completed recovery receipt clears the draft');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'the resolved recovery releases the read-only lock');
 const usageFinal=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageFinal.json()).cumulativeLogsUsed,1,'still exactly one server debit after the GET-only recovery');
 const lockedCopyAfter=await selectionHelperCopy(p);
 await fs.writeFile(new URL('lc3copy-receipt.json',out),JSON.stringify({stableId:id,unlockedCopy,pendingPhase:statePending.phase,awayPhase:stateAway.phase,resumedLockedCopy:lockedCopy,lockedCopyAfterResolution:lockedCopyAfter,commitCount:obs.commits.length},null,2));
 await clearHeldLifecycleDetail(p);
 checkClean(rec,'lc3copy');
 await shot(p,'shot-1440-account-save-lockcopy-detail.png');
});
// ── END ui-cloud-account-save-lifecycle-ack-copy-append ──
// ── BEGIN ui-cloud-account-save-lifecycle-ack-copy-session-boundary-append ──
// lc4sessb: SEPARATELY-NAMED focused safety-boundary proof (authored AFTER the
// immutable lc3copy b054bbe9… harness, reusing its EXACT prefix bytes and the
// ACTUAL journey helpers — no generator/wrapper/map family, no existing
// assertion edited or weakened). We are PROVING SUPPRESSION at the real account
// session boundary, NOT designing how a future explicit Save reconciles: no new
// Save is performed and nothing here claims or attempts to undo the original
// commit. Journey: real Auth emulator accountA over the existing explicit
// harness connection; the accepted mount-seam apply observer
// (wrapSaveApplyObserver) plus a minimal test-only TRANSPARENT forwarder
// around the ACTUAL client getMock promise are mounted BEFORE the journey.
// The real UI Save is confirmed: the actual commit is acknowledged 201
// created:true used:1 (armCommitObserver passthrough) and the first detail
// GET returns a real 200 carrying the original ID/note/thinking/ETag
// (holdFirstDetailForLifecycle route.fetch passthrough) which stays HELD.
// Sign out goes through the supported real account-session API (logout:
// session.setAccount(null) — no session replacement, no fake signed-in
// state): the queue must be invalidated immediately, saved private feedback
// must clear immediately, the draft stays unchanged. The SAME actual accountA
// is re-entered through the SAME session BEFORE releasing the held receipt
// (ABA). The release then delivers the EXACT original 200 with the original
// ETag. Settlement is awaited through bounded transparent-forwarder evidence,
// NOT via waitPhaseNotPending (vacuously true the moment sign-out clears the
// phase). Expected settled outcomes under the EXISTING policy: no stale
// seam.apply, no auto navigation/detail/done, no revived lock/retained
// queue/recovery feedback, durable local draft fully unchanged, local
// mocks/counter/savedIds unchanged, exactly ONE commit POST across the whole
// lifecycle, and zero NEW browser requests caused by the stale release. Real
// HTTP readback shows the original cloud record with unchanged content and
// usage exactly 1. Receipts carry opaque IDs, phases, counters, hashes and
// status/etag events only — never credentials or raw private text.
// mountGetMockTransparentForwarder: test-only, injected through the existing
// explicit harness handle BEFORE the journey. It replaces only the getMock
// property on the SHARED client object with a function that delegates to the
// untouched ORIGINAL client method and records that actual Promise's
// settlement (phase + sanitized typed code + opaque meta). No result is
// synthesized, no reply is hand-built, and every production session/intent/
// network guard stays in force: the original method's own account-generation
// checks are what reject the stale delivery, and the forwarder re-throws the
// EXACT original error object. Only the account-save journey issues getMock
// here (the History controller loads only on the history route, which this
// journey never visits), so settle events map 1:1 to save receipt attempts.
const mountGetMockTransparentForwarder=p=>p.evaluate(()=>{
 const h=window.__uicSaveHarness;
 if(!h||!h.client||typeof h.client.getMock!=='function')throw new Error('client.getMock missing before forwarder mount');
 const orig=h.client.getMock.bind(h.client);
 window.__uicGetMockSettles=[];
 window.__uicGetMockErrors=[];
 h.client.getMock=async(...args)=>{
  const index=window.__uicGetMockSettles.length;
  window.__uicGetMockSettles.push({index,startedAt:Date.now(),phase:'dispatched',id:String(args[0])});
  window.__uicGetMockErrors.push(null);
  try{
   const reply=await orig(...args);
   window.__uicGetMockSettles[index]={...window.__uicGetMockSettles[index],phase:'fulfilled',mockId:(reply&&reply.data&&reply.data.mock&&reply.data.mock.id)||null,etag:(reply&&reply.data&&reply.data.etag)||null,settledAt:Date.now()};
   return reply; // the EXACT original reply object
  }catch(error){
   window.__uicGetMockErrors[index]=error;
   const code=error&&typeof error.code==='string'?error.code:null;
   window.__uicGetMockSettles[index]={...window.__uicGetMockSettles[index],phase:'rejected',code,settledAt:Date.now()};
   throw error; // re-throw the ORIGINAL rejection untouched
  }
 };
 return {mounted:true};
});
const readGetMockSettles=p=>p.evaluate(()=>window.__uicGetMockSettles.slice());
// Bounded transparent-forwarder settlement wait — the actual receipt attempt,
// not the already-vacuous phase!=pending predicate.
const waitSettledCount=async(p,count,ms=15000)=>{await p.waitForFunction(n=>window.__uicGetMockSettles&&window.__uicGetMockSettles.length>=n&&window.__uicGetMockSettles.every(x=>x.phase!=='dispatched'),count,{timeout:ms}).catch(()=>harness('lc4sessb: the held getMock receipt attempt never settled through the transparent forwarder within '+ms+'ms'));};
test('account save session boundary: lc4sessb signing out through the real session API immediately invalidates the acknowledged queue and clears saved private feedback with the draft unchanged, and re-entering the SAME account before releasing the exact held original detail receipt revives no lock, applies nothing at the seam, performs no navigation, causes no new requests and triggers no second commit',async()=>{
 const acct=await account();
 const usagePre=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usagePre.json()).cumulativeLogsUsed,0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the session-boundary journey');
 await wrapSaveApplyObserver(p);
 await mountGetMockTransparentForwarder(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 assert.equal(await currentRoute(p),'selection','the confirmed Save is issued from the selection route');
 const draftBefore=await localDraft(p);
 const draftHashBefore=sha(Buffer.from(JSON.stringify(draftBefore)));
 const hold={};
 await holdFirstDetailForLifecycle(p,hold);
 // (a) The actual UI Save: exactly one real commit, acknowledged 201.
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: the first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'session-boundary held-detail capture must succeed: '+hold.error);
 assert.equal(obs.commits.length,1,'exactly one real commit POST before the session boundary');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'the original commit is ACTUALLY acknowledged 201 created:true used:1');
 // Held original detail proof BEFORE the boundary: real 200 with the
// original ID and the opaque server ETag; private text proven by hash only.
 assert.equal(hold.receipt.status,200,'the first actual detail read returned a real HTTP 200');
 const dm=hold.receipt.body&&hold.receipt.body.mock;
 assert.ok(dm&&dm.id===id,'the held receipt carries the original stored ID');
 assert.equal(sha(Buffer.from(String(dm.note))),sha(Buffer.from(SAVE_NOTE)),'the held receipt carries the original committed note');
 assert.ok((dm.reviews||[]).some(q=>sha(Buffer.from(String(q.thinking)))===sha(Buffer.from(SAVE_THINKING))),'the held receipt carries the original thinking review');
 assert.equal(typeof hold.receipt.etag,'string','the held receipt carries the server-owned review ETag');
 assert.match(hold.receipt.etag,/^"review-\d+"$/,'the detail ETag is the opaque review revision token: '+String(hold.receipt.etag));
 assert.equal((await readGetMockSettles(p)).filter(x=>x.phase==='dispatched').length,1,'fixture: exactly one getMock receipt attempt is in flight and unsettled');
 await p.waitForSelector('[data-account-save="status"]',{timeout:15000});
 const stateBefore=await saveState(p);
 assert.equal(stateBefore.phase,'pending','fixture: the controller is pending on the held detail read');
 assert.deepEqual(await readAckAcks(p),[],'nothing has applied to the app seam while the first detail read is held');
 const apiBeforeBoundary=rec.api.length,commitBeforeBoundary=commitCount(rec);
 // (b) Sign out through the SUPPORTED real account-session API over the
// existing explicit harness connection (no session replacement, no fake
// signed-in state). The already-committed original write is NOT undone.
 const signedOut=await p.evaluate(async()=>{await window.__uicSaveHarness.session.setAccount(null);return window.__uicSaveHarness.session.getState();});
 assert.equal(signedOut.status,'signed-out','the supported session API published a real signed-out state');
 await settle(500);
 const stateOut=await saveState(p);
 assert.equal(stateOut.phase,null,'sign-out immediately invalidates the owned queue (phase cleared)');
 assert.equal(stateOut.lockedId,null,'sign-out clears the submitted-draft lock identity');
 assert.equal(stateOut.retainedId,null,'sign-out drops the retained queue');
 // RED-evidence capture BEFORE the feedback-clearing assertions: if stale
// private feedback survives the immediate-invalidation expectation, the
// retained screen state is preserved as visual evidence (screenshot +
// sanitized #messages text excerpt) rather than an unexplained log line.
 await shot(p,'shot-1440-account-save-session-boundary-signout-red.png');
 const messagesTextOut=await p.locator('#messages').innerText();
 // FIRST MISSING-BEHAVIOR assertion zone: saved private feedback must clear
// immediately on sign-out (the sibling access/history controllers clear
// their private display in handleSessionChange; the queue here is already
// proven invalidated above, so any surviving line is stale private UI).
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'saved/recovery private feedback is cleared immediately on sign-out');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'the pending private status line is cleared immediately on sign-out: '+messagesTextOut.slice(0,160));
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'no lock note survives sign-out');
 assert.equal(await p.locator('[data-act="account-save-retry"]').count(),0,'no Retry control survives sign-out');
 const draftOut=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftOut))),draftHashBefore,'the durable draft is FULLY unchanged across sign-out');
 assert.equal(draftOut.draft.id,id,'the unchanged draft keeps the original stable ID');
 assert.equal(await currentRoute(p),'selection','fixture: sign-out itself forced no navigation');
 const sessionEventsMid=await p.evaluate(()=>window.__uicSaveHarness.events.slice());
 assert.ok(sessionEventsMid.includes('signed-out:'+acct.uid)||sessionEventsMid.some(e=>e.startsWith('signed-out')),'the real session published a signed-out state through the existing connection');
 // (c) Re-enter the SAME actual accountA through the SAME session BEFORE the
// held receipt is released (same-UID ABA). Fresh verification over the real
// /api/session; the held stale receipt must not be revived by the return.
 const reentry=await p.evaluate(async({uid})=>{
  const h=window.__uicSaveHarness;
  await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});
  const s=h.session.getState();
  return {status:s.status,uid:s.uid};
 },{uid:acct.uid});
 assert.equal(reentry.status,'signed-in','same-UID re-entry restores a verified signed-in state over the same session');
 assert.equal(reentry.uid,acct.uid,'re-entry is the SAME actual account');
 await settle(500);
 const stateReentry=await saveState(p);
 assert.equal(stateReentry.phase,null,'the still-held receipt revives no queue on same-UID re-entry');
 assert.equal(stateReentry.lockedId,null,'same-UID re-entry revives no read-only lock');
 assert.deepEqual(await readAckAcks(p),[],'nothing applied to the app seam while the receipt is still held after re-entry');
 assert.equal((await readGetMockSettles(p)).filter(x=>x.phase==='dispatched').length,1,'the receipt attempt is still unsettled at the release point');
 // Post-reentry request baseline captured BEFORE the release: the held GET
// itself already counted as a dispatch and the /api/session re-verification
// is accounted, so the delta after release isolates NEW requests caused by
// the stale receipt landing.
 const apiBeforeRelease=rec.api.length;
 const settlesPre=await readGetMockSettles(p);
 assert.equal(settlesPre.length,1,'fixture: exactly one detail receipt attempt has been dispatched across the boundary');
 const dispatchToReleaseMs=Date.now()-settlesPre[0].startedAt;
 assert.equal(dispatchToReleaseMs<14000,true,'fixture: the held receipt is released inside the real 15s client request timeout (in-flight window '+dispatchToReleaseMs+'ms) so the settlement is a real network delivery, not an abort');
 // (d) Release: the delivery is the EXACT original 200 with the original
// ETag (the accepted hold re-delivers its own captured receipt).
 await hold.release();
 await waitSettledCount(p,1);
 const settles=await readGetMockSettles(p);
 assert.equal(settles.length,1,'release caused no additional getMock attempt');
 assert.equal(settles[0].phase,'rejected','the stale same-UID receipt attempt settles through the real guards (the untouched client/intent rejection is the actual outcome)');
 assert.equal(settles[0].code,'stale_account','the settlement is the real account-generation staleness over the original delivered 200, not a harness error');
 assert.ok(hold.events.some(e=>e==='original-receipt-released:status=200:etag='+hold.receipt.etag),'the release delivered the EXACT original 200 with the original ETag: '+JSON.stringify(hold.events));
 await settle(600);
 // (e) Settled suppression outcomes (existing safety policy, proven not
// designed): nothing applied, nothing revived, nothing presented.
 const stateFinal=await saveState(p);
 assert.equal(stateFinal.phase,null,'the stale settled receipt revives no phase (no apply, no recovery feedback)');
 assert.equal(stateFinal.lockedId,null,'the stale settled receipt revives no lock');
 assert.equal(stateFinal.retainedId,null,'the stale settled receipt revives no retained queue');
 assert.deepEqual(await readAckAcks(p),[],'the released stale receipt applied NOTHING to the app seam (no stale seam.apply)');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success claim appears');
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'no recovery feedback appears after the settled stale receipt');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'no pending line appears after the settled stale receipt');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail opens automatically');
 assert.equal(await currentRoute(p),'selection','the stale receipt forces no navigation');
 const draftFinal=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftFinal))),draftHashBefore,'the durable draft stays FULLY unchanged through sign-out, same-UID re-entry and the stale release');
 assert.deepEqual(draftFinal.mocks,[],'cloud work never merges into local mocks');
 assert.equal(draftFinal.used,0,'the local counter stays untouched');
 assert.deepEqual(draftFinal.savedIds,[],'savedIds stays untouched');
 assert.equal(commitCount(rec),commitBeforeBoundary,'the stale receipt triggers no new commit request');
 assert.equal(obs.commits.length,1,'exactly one commit POST across the whole session-boundary lifecycle');
 assert.equal(rec.api.length,apiBeforeRelease,'zero NEW browser requests were caused by the stale release after the post-reentry baseline');
 assert.equal(rec.api.length-apiBeforeBoundary>=1,true,'fixture: the same-UID re-entry /api/session verification itself is accounted for (boundary window recorded)');
 // (f) Real HTTP readback: the acknowledged original record durably exists
// with unchanged content and exactly one server debit. Suppression never
// claims or performs an undo of the committed write.
 const gotItem=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal(gotItem.status,200,'the acknowledged original commit durably exists in the emulator store');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id,'the cloud record keeps the original stable ID');
 assert.equal(itemJson.mock.note,SAVE_NOTE,'the cloud record keeps the ORIGINAL committed note');
 assert.ok((itemJson.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the cloud record keeps the original thinking review');
 const usageFinal=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal((await usageFinal.json()).cumulativeLogsUsed,1,'exactly one server debit after the session boundary');
 await shot(p,'shot-1440-account-save-session-boundary-final.png');
 await fs.writeFile(new URL('lc4sessb-receipt.json',out),JSON.stringify({stableId:id,commitAcks:obs.commits.map(c=>({status:c.status,created:c.body&&c.body.created,id:c.body&&c.body.id,used:c.body&&c.body.used})),detailHeld:{status:hold.receipt.status,etag:hold.receipt.etag},events:hold.events.slice(),settles:(await readGetMockSettles(p)).map(x=>({index:x.index,phase:x.phase,code:x.code||null})),draftHashBefore,draftHashFinal:sha(Buffer.from(JSON.stringify(draftFinal))),sessionEvents:await p.evaluate(()=>window.__uicSaveHarness.events.slice()),reentryStatus:reentry.status,acksAtEnd:await readAckAcks(p),commitCount:obs.commits.length,requestsBeforeBoundary:apiBeforeBoundary,requestsBeforeRelease:apiBeforeRelease,requestsFinal:rec.api.length,inFlightMs:dispatchToReleaseMs},null,2));
 await clearHeldLifecycleDetail(p);
 checkClean(rec,'lc4sessb');
});
// ── END ui-cloud-account-save-lifecycle-ack-copy-session-boundary-append ──
// ── BEGIN ui-cloud-account-save-cross-account-boundary-append ──
// lc5crossacct: SEPARATELY-NAMED focused cross-account safety-boundary proof
// (authored AFTER the immutable d0cb9655… session-boundary harness, reusing its
// EXACT prefix bytes and the ACTUAL journey helpers — no generator/wrapper/map
// family, no existing assertion edited or weakened). We are PROVING
// SUPPRESSION at a real account SWITCH — same live session, no intermediate
// logout — NOT designing how a future Save reconciles cross-account drafts:
// no Save is performed under accountB, the browser-local draft is not removed,
// no cross-account draft policy is claimed, and nothing here undoes the
// original accountA commit. Journey: fresh REAL Auth-emulator accountA saves
// through the existing explicit harness connection over the existing apply
// observer + transparent getMock settlement forwarder (both mounted BEFORE the
// journey): the actual commit is acknowledged 201 created:true used:1 and the
// first detail GET returns a real 200 carrying accountA's original
// ID/note/thinking/ETag, held until an explicit release. The SAME session is
// then switched DIRECTLY to a fresh REAL accountB through the supported
// session.setAccount API (no fake signed-in state; the real /api/session
// verifies B, and the switch only publishes signed-in for a verified uid
// match). BEFORE the release: queue/lock/status/recovery-Retry are cleared,
// the original browser-local draft full hash is unchanged, and no navigation
// was forced. The release then delivers the EXACT accountA original 200 with
// the original ETag WHILE accountB is the verified account. Bounded
// transparent-forwarder wait: the actual receipt attempt settles as a REJECT
// with the real stale_account generation error — no counterfeit response or
// guard was synthesized. After settling: no stale seam.apply, no detail/done/
// recovery presentation, no revived queue/lock, no navigation, zero NEW
// browser requests caused by the stale receipt, and browser-local draft/mocks/
// used/savedIds fully unchanged. Real HTTP readback: the accountA record
// durably exists under accountA with original content and cumulative usage
// exactly 1; the fresh accountB shows usage 0, an empty item list, and the
// accountA record ID 404s under B through the EXISTING private 404 contract —
// so the stale receipt caused no accidental debit or commit under B.
// Receipts carry opaque IDs, phases, counters, hashes and status/etag events
// only — never credentials or raw private text.
test('account save cross-account boundary: lc5crossacct switching the SAME live session directly from acknowledged real accountA to fresh verified real accountB before releasing accountA exact held original detail receipt settles the stale receipt as the real stale_account rejection, applies nothing at the seam, revives no queue lock or recovery feedback, forces no navigation, causes no new requests, commits and debits exactly once under accountA only, and leaves accountB usage at zero under the existing private 404 contract with the browser-local draft unchanged',async()=>{
 const acctA=await account();
 const acctB=await account();
 const usageAPre=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acctA.token},credentials:'omit'});
 assert.equal((await usageAPre.json()).cumulativeLogsUsed,0,'fresh accountA starts at usage 0');
 const usageBPre=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acctB.token},credentials:'omit'});
 assert.equal((await usageBPre.json()).cumulativeLogsUsed,0,'fresh accountB starts at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acctA);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the cross-account journey');
 await wrapSaveApplyObserver(p);
 await mountGetMockTransparentForwarder(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 assert.equal(await currentRoute(p),'selection','the confirmed Save is issued from the selection route under accountA');
 const draftBefore=await localDraft(p);
 const draftHashBefore=sha(Buffer.from(JSON.stringify(draftBefore)));
 const hold={};
 await holdFirstDetailForLifecycle(p,hold);
 // (a) The actual accountA UI Save: exactly one real commit, acknowledged 201.
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: the first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'cross-account held-detail capture must succeed: '+hold.error);
 assert.equal(obs.commits.length,1,'exactly one real commit POST before the account switch');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'the accountA commit is ACTUALLY acknowledged 201 created:true used:1');
 // Held accountA original detail proof BEFORE the switch: real 200 with the
// original ID and the opaque server ETag; private text proven by hash only.
 assert.equal(hold.receipt.status,200,'the first actual detail read returned a real HTTP 200');
 const dm=hold.receipt.body&&hold.receipt.body.mock;
 assert.ok(dm&&dm.id===id,'the held receipt carries accountA original stored ID');
 assert.equal(sha(Buffer.from(String(dm.note))),sha(Buffer.from(SAVE_NOTE)),'the held receipt carries the original committed note');
 assert.ok((dm.reviews||[]).some(q=>sha(Buffer.from(String(q.thinking)))===sha(Buffer.from(SAVE_THINKING))),'the held receipt carries the original thinking review');
 assert.equal(typeof hold.receipt.etag,'string','the held receipt carries the server-owned review ETag');
 assert.match(hold.receipt.etag,/^"review-\d+"$/,'the detail ETag is the opaque review revision token: '+String(hold.receipt.etag));
 assert.equal((await readGetMockSettles(p)).filter(x=>x.phase==='dispatched').length,1,'fixture: exactly one getMock receipt attempt is in flight and unsettled under accountA');
 await p.waitForSelector('[data-account-save="status"]',{timeout:15000});
 const stateBefore=await saveState(p);
 assert.equal(stateBefore.phase,'pending','fixture: the controller is pending on the held detail read');
 assert.deepEqual(await readAckAcks(p),[],'nothing has applied to the app seam while the first detail read is held');
 const apiBeforeBoundary=rec.api.length,commitBeforeBoundary=commitCount(rec);
 // (b) DIRECT switch of the SAME live session from accountA to fresh real
// accountB through the SUPPORTED session.setAccount API — no intermediate
// explicit logout, no session replacement, no fake signed-in state. The
// supported path performs the REAL /api/session verification and only
// publishes signed-in on a verified uid match; the already-committed
// accountA write is NOT undone.
 const switched=await p.evaluate(async({uid,token})=>{
  const h=window.__uicSaveHarness;
  h.accounts[uid]=token;
  await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});
  const s=h.session.getState();
  return {status:s.status,uid:s.uid};
 },{uid:acctB.uid,token:acctB.token});
 assert.equal(switched.status,'signed-in','the direct A→B switch ends in a verified signed-in state (a verification or uid mismatch would have published error, never signed-in)');
 assert.equal(switched.uid,acctB.uid,'the SAME session now verifies the fresh REAL accountB over the real /api/session');
 const sessionEventsSwitch=await p.evaluate(()=>window.__uicSaveHarness.events.slice());
 assert.ok(sessionEventsSwitch.some(e=>e==='signed-in:'+acctB.uid),'the real session published signed-in for accountB through the existing connection: '+JSON.stringify(sessionEventsSwitch));
 assert.ok(!sessionEventsSwitch.includes('signed-out'),'the switch used NO intermediate explicit logout');
 // BEFORE the release: the accountA-owned queue/lock/status/recovery-Retry
// must be cleared by the switch, with the original draft fully unchanged and
// no forced navigation.
 const stateSwitch=await saveState(p);
 assert.equal(stateSwitch.phase,null,'the account switch immediately invalidates the accountA-owned queue (phase cleared before release)');
 assert.equal(stateSwitch.lockedId,null,'the account switch clears the submitted-draft lock identity');
 assert.equal(stateSwitch.retainedId,null,'the account switch drops the retained accountA queue');
 await shot(p,'shot-1440-account-save-cross-account-switch-red.png');
 const messagesTextSwitch=await p.locator('#messages').innerText();
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'the pending private status line is cleared before the release: '+messagesTextSwitch.slice(0,160));
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'no saved/recovery private feedback survives the switch');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'no lock note survives the switch');
 assert.equal(await p.locator('[data-act="account-save-retry"]').count(),0,'no Retry control survives the switch');
 const draftSwitch=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftSwitch))),draftHashBefore,'the original browser-local draft full hash is unchanged by the direct switch (intentionally tab-local; no cross-account draft policy is claimed or enforced here)');
 assert.equal(draftSwitch.draft.id,id,'the unchanged draft keeps the original stable ID');
 assert.equal(await currentRoute(p),'selection','fixture: the switch itself forced no navigation');
 assert.equal(commitCount(rec),commitBeforeBoundary,'the account switch itself issued no commit request');
 // Settle any legitimate B-side controller refresh, THEN take the
// post-switch request baseline so the delta after release isolates NEW
// requests caused by the stale accountA receipt landing under accountB.
 await settle(500);
 const apiBeforeRelease=rec.api.length;
 const settlesPre=await readGetMockSettles(p);
 assert.equal(settlesPre.length,1,'fixture: exactly one detail receipt attempt has been dispatched across the switch');
 assert.equal(settlesPre[0].phase,'dispatched','the accountA receipt attempt is still unsettled at the release point');
 const dispatchToReleaseMs=Date.now()-settlesPre[0].startedAt;
 assert.equal(dispatchToReleaseMs<14000,true,'fixture: the held receipt is released inside the real 15s client request timeout (in-flight window '+dispatchToReleaseMs+'ms) so the settlement is a real network delivery, not an abort');
 assert.equal(await currentRoute(p),'selection','the settled B-side refresh forced no navigation before release');
 // (c) Release: the delivery is the EXACT accountA original 200 with the
// original ETag while accountB is the verified account (the accepted hold
// re-delivers its own captured receipt — no counterfeit response).
 await hold.release();
 await waitSettledCount(p,1);
 const settles=await readGetMockSettles(p);
 assert.equal(settles.length,1,'release caused no additional getMock attempt');
 assert.equal(settles[0].phase,'rejected','the stale accountA receipt settles through the REAL client/session generation guards while accountB is active (the untouched rejection is the actual outcome)');
 assert.equal(settles[0].code,'stale_account','the settlement is the real account-generation staleness over the original delivered 200, not a harness error');
 assert.ok(hold.events.some(e=>e==='original-receipt-released:status=200:etag='+hold.receipt.etag),'the release delivered the EXACT accountA original 200 with the original ETag: '+JSON.stringify(hold.events));
 await settle(600);
 // (d) Settled suppression outcomes under accountB (existing safety policy,
// proven not designed): nothing applied, nothing revived, nothing presented.
 const stateFinal=await saveState(p);
 assert.equal(stateFinal.phase,null,'the stale settled accountA receipt revives no phase under accountB (no apply, no recovery feedback)');
 assert.equal(stateFinal.lockedId,null,'the stale settled receipt revives no lock');
 assert.equal(stateFinal.retainedId,null,'the stale settled receipt revives no retained accountA queue');
 assert.deepEqual(await readAckAcks(p),[],'the released stale receipt applied NOTHING to the app seam (no stale seam.apply)');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success claim appears');
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'no recovery feedback appears after the settled stale receipt');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'no pending line appears after the settled stale receipt');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no accountA detail opens automatically under accountB');
 assert.equal(await currentRoute(p),'selection','the stale receipt forces no navigation');
 const draftFinal=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftFinal))),draftHashBefore,'the durable browser-local draft stays FULLY unchanged through the direct switch and the stale release (no removal, no cross-account reconciliation was added or claimed)');
 assert.deepEqual(draftFinal.mocks,[],'cloud work never merges into local mocks');
 assert.equal(draftFinal.used,0,'the local counter stays untouched');
 assert.deepEqual(draftFinal.savedIds,[],'savedIds stays untouched');
 assert.equal(commitCount(rec),commitBeforeBoundary,'the stale receipt causes no new commit request');
 assert.equal(obs.commits.length,1,'exactly one commit POST (accountA only) across the whole cross-account lifecycle');
 assert.equal(rec.api.length,apiBeforeRelease,'zero NEW browser requests were caused by the stale release under accountB after the post-switch baseline');
 assert.equal(rec.api.length-apiBeforeBoundary>=1,true,'fixture: the direct-switch /api/session verification itself is accounted for (switch window recorded)');
 const stateEnd=await saveState(p);
 const bState=switched;
 // (e) Real HTTP isolation readbacks: accountA durable with ONE debit;
// fresh accountB at ZERO usage, an empty item list, and the accountA ID
// 404s under B through the EXISTING private 404 contract — no accidental
// debit or commit under B.
 const itemUnderB=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{'authorization':'Bearer '+acctB.token},credentials:'omit'});
 assert.equal(itemUnderB.status,404,'the accountA record ID must 404 under the fresh accountB (existing private 404 contract)');
 const itemErrB=await itemUnderB.json().catch(()=>null);
 assert.equal(itemErrB&&itemErrB.error,'mock_not_found','the B-side 404 is the existing mock_not_found contract: '+JSON.stringify(itemErrB));
 const listUnderB=await fetch(base+'/api/mocks?limit=10',{headers:{'authorization':'Bearer '+acctB.token},credentials:'omit'});
 assert.equal(listUnderB.status,200,'the B-side list read is a real HTTP 200');
 const listB=await listUnderB.json();
 assert.deepEqual(listB.items.map(i=>i.summary.id),[],'accountB owns NO saved records (no accidental B commit)');
 const usageBPost=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acctB.token},credentials:'omit'});
 const usageBVal=(await usageBPost.json()).cumulativeLogsUsed;
 assert.equal(usageBVal,0,'accountB usage stays 0 — the stale accountA receipt caused no debit under B');
 const usageAPost=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+acctA.token},credentials:'omit'});
 const usageAVal=(await usageAPost.json()).cumulativeLogsUsed;
 assert.equal(usageAVal,1,'accountA keeps EXACTLY one server debit (the original acknowledged commit, never undone or repeated)');
 const gotItem=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{'authorization':'Bearer '+acctA.token},credentials:'omit'});
 assert.equal(gotItem.status,200,'the acknowledged accountA original commit durably exists in the emulator store');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id,'the cloud record keeps the original stable ID');
 assert.equal(itemJson.mock.note,SAVE_NOTE,'the cloud record keeps the ORIGINAL committed note');
 assert.ok((itemJson.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the cloud record keeps the original thinking review');
 await shot(p,'shot-1440-account-save-cross-account-final.png');
 await fs.writeFile(new URL('lc5crossacct-receipt.json',out),JSON.stringify({stableId:id,commitAcks:obs.commits.map(c=>({status:c.status,created:c.body&&c.body.created,id:c.body&&c.body.id,used:c.body&&c.body.used})),detailHeld:{status:hold.receipt.status,etag:hold.receipt.etag},events:hold.events.slice(),settles:(await readGetMockSettles(p)).map(x=>({index:x.index,phase:x.phase,code:x.code||null})),switchedStatus:bState.status,switchedUidMatchesTarget:switched.uid===acctB.uid,sessionEvents:sessionEventsSwitch.slice(),draftHashBefore,draftHashFinal:sha(Buffer.from(JSON.stringify(draftFinal))),finalPhase:stateFinal.phase,finalLockedId:stateFinal.lockedId,finalRetainedId:stateFinal.retainedId,acksAtEnd:await readAckAcks(p),commitCount:obs.commits.length,requestsBeforeBoundary:apiBeforeBoundary,requestsBeforeRelease:apiBeforeRelease,requestsFinal:rec.api.length,inFlightMs:dispatchToReleaseMs,itemUnderBStatus:itemUnderB.status,itemUnderBError:itemErrB&&itemErrB.error,listUnderBCount:listB.items.length,usageAPost:usageAVal,usageBPost:usageBVal},null,2));
 await clearHeldLifecycleDetail(p);
 checkClean(rec,'lc5crossacct');
});
// ── END ui-cloud-account-save-cross-account-boundary-append ──
// ── BEGIN ui-cloud-account-save-missing-record-recovery-append ──
// lc6missing: SEPARATELY-NAMED focused deleted-after-ack recovery safety
// proof (authored AFTER the immutable 642787e8… cross-account harness bytes,
// reusing its EXACT prefix and the ACTUAL journey helpers — no generator,
// no wrapper/map/source-map family, no existing assertion edited, NO
// production change). Scenario: a real acknowledged 201 commit whose cloud
// record is ACTUALLY removed over the EXISTING accepted backend delete
// operation (DELETE /api/mocks/item with If-Match, pinned auth-boundary.mjs
// -> mockStore.remove on the loopback Firestore emulator, fictional account
// only — no new server fixture, no live Firebase touch) BEFORE the FIRST
// held browser detail GET is released. Unlike holdFirstDetailForLifecycle
// (which route.fetch()es the real 200 up-front), this hold intercepts and
// pauses BEFORE any fetch reaches the server through the browser path: the
// release is route.continue(), so the browser receives the REAL same-origin
// 404 that the now-empty store truthfully produces — the 404 is never
// fabricated. Existence is proven first via Node-side direct HTTP with the
// real emulator token (item 200 + usage 1), then the real DELETE receipt
// {deleted:true,id}, then direct item 404 + usage still 1. Expected
// EXISTING safety guardrails (proven, not designed): zero seam.apply, no
// done/detail/navigation, the truthful historically-saved + result-
// temporarily-unavailable notice retained with the original stable ID and
// payload, the submitted draft stays read-only, account Retry enabled.
// Native Retry then performs a GET-ONLY re-read through a SECOND real 404:
// exactly one commit POST and one server debit across BOTH attempts, the
// draft never clears, no phantom success, no recreated record, no invented
// refund/unlock/policy. Residual product decision recorded as observation:
// how a permanently-missing acknowledged record should be RESOLVED is not
// established here — the notice says the saved result is temporarily
// unavailable; this test proves safe retention, not a deletion repair.
// Hold helper: intercepts the FIRST /api/mocks/item browser request WITHOUT
// touching the server (no route.fetch), signals bounded readiness, and only
// on explicit release forwards via route.continue() so the response the
// page sees is exactly the real server's. Subsequent detail requests
// pass through truthfully the same way (the Retry re-read is real too).
const holdFirstDetailBeforeDelete=async(p,hold)=>{
 hold.calls=0;hold.error=null;hold.released=false;hold.events=[];hold.dispatchedAt=0;
 let resolveReady;hold.ready=new Promise(r=>{resolveReady=r;});
 await p.route(REC_ITEM,async route=>{
  hold.calls++;
  if(hold.calls===1){
   hold.dispatchedAt=Date.now();
   hold.events.push('first-detail-held-before-any-browser-forward');
   resolveReady();
   // Bounded hold: released ONLY by an explicit test call, never empty.
   await new Promise(r=>{hold.release=async()=>{if(hold.released)return;hold.released=true;hold.events.push('held-detail-released-via-route-continue');r();};});
   try{await route.continue();hold.events.push('first-detail-forwarded-to-real-server');}
   catch(e){hold.error=String(e&&e.message||e);hold.events.push('continue-error:'+hold.error);await route.abort().catch(()=>{});}
   return;
  }
  try{await route.continue();hold.events.push('subsequent-detail-forwarded-to-real-server');}
  catch(e){hold.error=String(e&&e.message||e);hold.events.push('continue-error:'+hold.error);await route.abort().catch(()=>{});}
 });
};
const directItem=async(tok,id)=>{const r=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{'authorization':'Bearer '+tok},credentials:'omit'});return r;};
const directUsage=async tok=>{const r=await fetch(base+'/api/account/mock-usage',{headers:{'authorization':'Bearer '+tok},credentials:'omit'});if(r.status!==200)harness('lc6missing: direct usage readback failed '+r.status);return (await r.json()).cumulativeLogsUsed;};
test('account save missing record recovery: lc6missing an acknowledged real 201 commit whose cloud record is ACTUALLY deleted over the existing accepted backend DELETE seam before the first held browser detail GET is released settles that GET as the REAL same-origin 404, keeps the draft read-only with the truthful saved/result-unavailable notice and an enabled Retry while applying nothing at the mount seam, and a GET-only native Retry re-reads through a second real 404 with still exactly one POST and one server debit across both attempts',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the missing-record journey');
 // Observers mounted BEFORE the journey (accepted patterns, unchanged):
 // zero-apply baseline + transparent settlement forwarder.
 await wrapSaveApplyObserver(p);
 await mountGetMockTransparentForwarder(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 assert.equal(await currentRoute(p),'selection','the confirmed Save is issued from the selection route');
 const hold={};
 await holdFirstDetailBeforeDelete(p,hold);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 // Bounded readiness: proceed only once the FIRST detail GET is actually
// intercepted (held BEFORE reaching the server through the browser path).
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: the first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'lc6missing hold must succeed: '+hold.error);
 assert.equal(hold.calls,1,'fixture: exactly one browser detail GET is held before release');
 // The browser has the VALID acknowledgement before the 404 ever exists:
// the actual commit is really acknowledged 201 created:true used:1.
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'the original commit is ACTUALLY acknowledged 201 created:true used:1 before any deletion');
 const apiBeforeRelease=rec.api.length;
 const draftBefore=await localDraft(p);
 const draftHashBefore=sha(Buffer.from(JSON.stringify(draftBefore)));
 await p.waitForSelector('[data-account-save="status"]',{timeout:15000});
 const stateHeld=await saveState(p);
 assert.equal(stateHeld.phase,'pending','fixture: the controller is pending on the held detail read');
 assert.deepEqual(await readAckAcks(p),[],'observer BEFORE the journey: nothing has applied to the app seam while the first detail read is held');
 assert.equal((await readGetMockSettles(p)).filter(x=>x.phase==='dispatched').length,1,'fixture: exactly one getMock receipt attempt is in flight and unsettled');
 // (a) Existence proven by DIRECT HTTP (real same-origin server, outside
// the held browser path) BEFORE deletion: real 200 + original ETag + usage 1.
 const gotPre=await directItem(acct.token,id);
 assert.equal(gotPre.status,200,'direct HTTP proof: the acknowledged record actually exists in the emulator store before deletion');
 const preJson=await gotPre.json();
 assert.ok(preJson.mock&&preJson.mock.id===id,'the direct pre-delete receipt carries the original stable ID');
 assert.equal(sha(Buffer.from(String(preJson.mock.note))),sha(Buffer.from(SAVE_NOTE)),'the direct pre-delete receipt carries the committed note (hashed)');
 const preETag=gotPre.headers.get('etag');
 assert.ok(/^"review-\d+"$/.test(String(preETag)),'the direct pre-delete receipt carries the opaque server ETag: '+String(preETag));
 const usagePreDelete=await directUsage(acct.token);
 assert.equal(usagePreDelete,1,'direct HTTP proof: exactly one server debit before deletion');
 // (b) ACTUAL deletion over the EXISTING accepted backend delete operation
// (pinned auth-boundary DELETE -> mockStore.remove; fictional emulator
// account; no new fixture, no production change, no live Firebase).
 const del=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{method:'DELETE',headers:{'authorization':'Bearer '+acct.token,'if-match':preETag},credentials:'omit'});
 const delBody=await del.json().catch(()=>null);
 assert.equal(del.status,200,'the existing accepted DELETE operation must actually succeed: '+JSON.stringify(delBody));
 assert.deepEqual(delBody,{deleted:true,id},'the deletion receipt is the real backend acknowledgement for the original ID');
 // Direct readback AFTER deletion: real 404, usage still exactly 1.
 const gotPost=await directItem(acct.token,id);
 assert.equal(gotPost.status,404,'direct HTTP proof: the record is ACTUALLY gone from the emulator store');
 const postErr=await gotPost.json().catch(()=>null);
 assert.equal(postErr&&postErr.error,'mock_not_found','the post-delete 404 is the existing mock_not_found contract: '+JSON.stringify(postErr));
 assert.equal(await directUsage(acct.token),usagePreDelete,'deletion never refunds the cumulative debit (still 1)');
 const dispatchToReleaseMs=Date.now()-hold.dispatchedAt;
 assert.equal(dispatchToReleaseMs<13000,true,'fixture: the held browser GET is released inside the real 15s client timeout (in-flight window '+dispatchToReleaseMs+'ms) so the 404 is a real network delivery, not an abort');
 // (c) Release: route.continue() forwards the ORIGINAL browser GET to the
// real server — the page receives the REAL same-origin 404, never fabricated.
 await hold.release();
 await waitSettledCount(p,1);
 const settles1=await readGetMockSettles(p);
 assert.equal(settles1.length,1,'the release caused no additional getMock attempt');
 assert.equal(settles1[0].phase,'rejected','the held browser GET settles as the real rejection over the delivered real 404');
 assert.equal(settles1[0].code,'mock_not_found','the settlement is the REAL mock_not_found 404 contract through the untouched client, not a harness error');
 await settle(600);
 // (d) Existing minimum guardrails at the acknowledged-record-missing seam.
 const acksAfterFirst=await readAckAcks(p);
 assert.deepEqual(acksAfterFirst,[],'zero seam.apply across the real 404 — no phantom success is delivered to the app');
 const stateFirst=await saveState(p);
 assert.equal(stateFirst.phase,'acknowledged-result-unavailable','the valid ack is retained: a committed record failing its re-read is the acknowledged-result-unavailable phase, never a relabelled failed transaction');
 assert.equal(stateFirst.lockedId,id,'the controller keeps the read-only lock on the exact owned draft');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success claim appears for the missing record');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail opens for the missing record');
 assert.equal(await currentRoute(p),'selection','the real 404 forces no navigation');
 const errFirst=p.locator('[data-account-save="error"]');
 assert.equal(await errFirst.count(),1,'a truthful error notice is shown at the owned route');
 const errText=await errFirst.textContent();
 assert.ok(errText.includes('saved to your account'),'the notice truthfully states the record WAS saved to your account (historical): '+errText.slice(0,200));
 assert.ok(errText.includes('temporarily unavailable'),'the notice reports the saved result as temporarily unavailable (exact existing copy recorded in the receipt; no permanent-deletion policy is asserted here): '+errText.slice(0,240));
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the submitted-draft lock explanation stays visible');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'the submitted draft stays read-only through the missing-record outcome');
 assert.equal(await p.locator('[data-act="save"]').isDisabled(),true,'Save stays disabled — the draft cannot be re-submitted as a new save');
 const accRetry=p.locator('[data-act="account-save-retry"]');
 assert.equal(await accRetry.count(),1,'the explicit account Retry is offered');
 assert.equal(await accRetry.isDisabled(),false,'the Retry is enabled');
 const draftAfter404=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftAfter404))),draftHashBefore,'the original payload and draft are retained byte-for-byte through the real 404');
 assert.equal(draftAfter404.draft.id,id,'the retained draft keeps the original stable ID');
 assert.deepEqual(draftAfter404.mocks,[],'cloud work never merges into browser-local mocks');
 assert.equal(draftAfter404.used,0,'the local counter stays untouched');
 assert.deepEqual(draftAfter404.savedIds,[],'savedIds stays untouched');
 await shot(p,'shot-1440-account-save-missing-record-error.png');
 // (e) Native Retry: GET-ONLY re-read, landing on a SECOND real 404.
 const apiBeforeRetry=rec.api.length;
 await keyboardRetryConfirm(p);
 await waitSettledCount(p,2);
 const settles2=await readGetMockSettles(p);
 assert.equal(settles2.length,2,'the Retry performed exactly one additional re-read attempt');
 assert.equal(settles2[1].phase,'rejected','the Retry re-read is GET-only and lands on the same real missing outcome');
 assert.equal(settles2[1].code,'mock_not_found','the Retry 404 is the same real mock_not_found contract');
 await settle(600);
 const stateRetry=await saveState(p);
 assert.equal(stateRetry.phase,'acknowledged-result-unavailable','the second real 404 keeps the truthful acknowledged-result-unavailable phase');
 assert.deepEqual(await readAckAcks(p),[],'the Retry re-read applies nothing at the seam (no done/detail/clear, no claim the record currently exists)');
 assert.equal(obs.commits.length,1,'exactly one commit POST across BOTH attempts — Retry never re-debits');
 assert.equal(commitCount(rec),1,'the browser request log also shows exactly one commit POST across the whole journey');
 assert.equal(await directUsage(acct.token),1,'still exactly one server debit after the Retry attempt');
 const gotRetry=await directItem(acct.token,id);
 assert.equal(gotRetry.status,404,'the Retry never recreated the record (direct proof: still 404)');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no phantom success after the Retry');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail opens after the Retry');
 assert.equal(await currentRoute(p),'selection','the Retry 404 forces no navigation');
 const draftFinal=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftFinal))),draftHashBefore,'the draft stays retained and read-only after the Retry 404 — nothing was cleared or re-submitted');
 assert.equal(await accRetry.count(),1,'the Retry stays available after the second real 404');
 assert.equal(await accRetry.isDisabled(),false,'the Retry stays enabled');
 assert.equal(rec.api.length-apiBeforeRetry,1,'the Retry caused exactly one additional browser request (the GET re-read only)');
 await shot(p,'shot-1440-account-save-missing-record-after-retry.png');
 await fs.writeFile(new URL('lc6missing-receipt.json',out),JSON.stringify({stableId:id,commitAcks:obs.commits.map(c=>({status:c.status,created:c.body&&c.body.created,id:c.body&&c.body.id,used:c.body&&c.body.used})),directPreDelete:{status:gotPre.status,etag:preETag,noteHash:sha(Buffer.from(String(preJson.mock.note)))},usagePreDelete,deleteReceipt:{status:del.status,body:delBody},directPostDelete:{status:gotPost.status,error:postErr&&postErr.error},usageAfterDelete:await directUsage(acct.token),heldDetailEvents:hold.events.slice(),inFlightMs:dispatchToReleaseMs,settles:(await readGetMockSettles(p)).map(x=>({index:x.index,phase:x.phase,code:x.code||null})),firstPhase:stateFirst.phase,firstLockedId:stateFirst.lockedId,finalPhase:stateRetry.phase,errorCopyText:errText,draftHashBefore,draftHashFinal:sha(Buffer.from(JSON.stringify(draftFinal))),acksAtEnd:await readAckAcks(p),commitCount:obs.commits.length,requestsBeforeRelease:apiBeforeRelease,requestsBeforeRetry:apiBeforeRetry,requestsFinal:rec.api.length,residualProductDecision:'permanently-missing acknowledged record RESOLUTION is not established by either 404 attempt; the retained notice reports the result as temporarily unavailable (observation, not a repair claim)'},null,2));
 await clearHeldLifecycleDetail(p);
 checkClean(rec,'lc6missing');
});
// ── END ui-cloud-account-save-missing-record-recovery-append ──
// ── BEGIN ui-cloud-account-save-missing-record-resolution-append ──
// rd1missing: SEPARATELY-NAMED first missing-record RESOLUTION journey
// (authored AFTER the immutable c2ec8fcb… missing-record recovery bytes,
// reusing their EXACT prefix and the ACTUAL journey helpers — no generator,
// no wrapper/map/source-map family, no existing assertion edited or weakened,
// no new runner). Approved policy (Joseph yes1563578781183254579): a real
// typed mock_not_found AFTER q.committed enters an explicit acknowledged-
// record-missing phase with a truthful above-notice and local-draft guidance;
// the draft stays retained READABLE and read-only; Retry stays as the
// existing optional GET-only re-check (never a recreate); an explicit
// cancel-first confirmed DISCARD LOCAL DRAFT clears ONLY the local draft
// (synchronous persist to Home) with its own seam — it never calls the
// saved apply/openSaved/done path, never recreates the record, never re-saves
// or debits, and shows only the local-draft-discard message. A dedicated
// discard dialog (NOT the 'Log this mock' save dialog) captures the ORIGINAL
// queued ref, controller identity and session owner synchronously at
// activation and rechecks everything on ACCEPT with no await before the
// local write. Cancel/Escape: zero mutation, zero network, focus restored.
// Behavioral RED convention: run PHASE=GREEN against the UNCHANGED current
// app/save pins — the acknowledged-record-missing phase assertions and the
// Discard-local-draft control fail against the untouched production, not an
// import error.
const DISCARD_ERR_MISSING='This mock was saved to your account, but the saved record can no longer be found. Nothing was saved again and no second save was counted. Your browser draft is still here, unchanged and readable. Retry only re-reads the actual saved record. You can also discard the local draft, which clears only this browser draft and never recreates a saved record.';
const DISCARD_DONE_MSG='Discarded the local draft for the missing saved record in this browser. Nothing was saved again and no new save was counted; your local mock records, counter and saved history are untouched.';
// Discard-aware apply observer: the SAME accepted wrapSaveApplyObserver
// pattern (records the serialised ack argument, delegates the unchanged
// synchronous call) plus forwarding of the new discardMissing controller
// method, so the wrapped controller never crashes on the discard path.
const wrapSaveDiscardObserver=p=>p.evaluate(()=>{
 const h=window.__uicSaveHarness;
 if(!h||!h.saveController||typeof h.saveController.mount!=='function')throw new Error('save controller must be mounted to wrap the apply seam for discard');
 const inner=h.saveController;
 window.__uicAckAcks=[];
 const recorder=window.__uicAckAcks;
 const wrapper=Object.freeze({
  mount(app){
   if(!app||typeof app.apply!=='function'||typeof app.guard!=='function')throw new Error('mount seam missing apply/guard');
   const origApply=app.apply;
   const wrapped=Object.freeze({...app,
    guard:(...a)=>app.guard(...a),
    apply:(...a)=>{if(a.length>=3&&a[2]!==undefined)recorder.push(JSON.parse(JSON.stringify(a[2])));return origApply(...a);}});
   inner.mount(wrapped);
  },
  unmount(){inner.unmount();},
  handleSessionChange(s){inner.handleSessionChange(s);},
  beginConfirmation(q){return inner.beginConfirmation(q);},
  confirmSave(q){return inner.confirmSave(q);},
  retained(){return inner.retained();},
  retry(){return inner.retry();},
  discardMissing(q){return typeof inner.discardMissing==='function'?inner.discardMissing(q):false;},
  getState(){return inner.getState();},
  renderFeedback(c,r){inner.renderFeedback(c,r);},
 });
 return import('/app.js').then(app=>{if(h.detachSave)h.detachSave();h.detachSave=app.attachAccountSave(wrapper);return {wrapped:true};});
});
// Reach the acknowledged-record-missing state through the REAL chain: actual
// 201 commit, actual accepted-seam DELETE before the first browser detail GET
// is released (route.continue → REAL same-origin 404, never fabricated).
// Returns {id,hold,obs,draftHashBefore,apiBeforeRelease}.
async function reachMissingRecord(p,acct,obs){
 const id=await saveJourneys(p);
 assert.equal(await currentRoute(p),'selection','the confirmed Save is issued from the selection route');
 const hold={};
 await holdFirstDetailBeforeDelete(p,hold);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: the first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'rd1 hold must succeed: '+hold.error);
 assert.equal(hold.calls,1,'fixture: exactly one browser detail GET is held before release');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'the original commit is ACTUALLY acknowledged 201 created:true used:1 before any deletion');
 const draftHashBefore=sha(Buffer.from(JSON.stringify(await localDraft(p))));
 await p.waitForSelector('[data-account-save="status"]',{timeout:15000});
 assert.equal((await saveState(p)).phase,'pending','fixture: the controller is pending on the held detail read');
 // Existence proven by DIRECT HTTP before deletion, then the ACTUAL accepted
// DELETE over the existing backend seam, then the direct 404 readback.
 const gotPre=await directItem(acct.token,id);
 assert.equal(gotPre.status,200,'direct HTTP proof: the acknowledged record actually exists before deletion');
 const preETag=gotPre.headers.get('etag');
 assert.ok(/^"review-\d+"$/.test(String(preETag)),'the direct pre-delete receipt carries the opaque server ETag: '+String(preETag));
 assert.equal(await directUsage(acct.token),1,'direct HTTP proof: exactly one server debit before deletion');
 const del=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{method:'DELETE',headers:{'authorization':'Bearer '+acct.token,'if-match':preETag},credentials:'omit'});
 const delBody=await del.json().catch(()=>null);
 assert.equal(del.status,200,'the existing accepted DELETE operation must actually succeed: '+JSON.stringify(delBody));
 assert.deepEqual(delBody,{deleted:true,id},'the deletion receipt is the real backend acknowledgement for the original ID');
 const gotPost=await directItem(acct.token,id);
 assert.equal(gotPost.status,404,'direct HTTP proof: the record is ACTUALLY gone from the emulator store');
 const postErr=await gotPost.json().catch(()=>null);
 assert.equal(postErr&&postErr.error,'mock_not_found','the post-delete 404 is the existing mock_not_found contract: '+JSON.stringify(postErr));
 const dispatchToReleaseMs=Date.now()-hold.dispatchedAt;
 assert.equal(dispatchToReleaseMs<13000,true,'fixture: the held browser GET is released inside the real 15s client timeout (in-flight window '+dispatchToReleaseMs+'ms)');
 await hold.release();
 await waitSettledCount(p,1);
 const settles1=await readGetMockSettles(p);
 assert.equal(settles1.length,1,'the release caused no additional getMock attempt');
 assert.equal(settles1[0].phase,'rejected','the held browser GET settles as the real rejection over the delivered real 404');
 assert.equal(settles1[0].code,'mock_not_found','the settlement is the REAL mock_not_found 404 contract through the untouched client');
 await settle(600);
 return {id,hold,draftHashBefore};
}
test('account save missing record resolution: rd1missing a real acknowledged 201 whose cloud record is ACTUALLY deleted before the first held detail read settles the real 404 as the acknowledged-record-missing phase with a truthful above-notice local-draft guidance, a retained readable read-only draft, an enabled GET-only Retry and an explicit Discard local draft control whose cancel-first dialog is safe on Cancel and Escape with zero mutation or network, and whose native-keyboard confirmed accept clears only the local draft to Home with only the local-draft-discard message (never a saved-to-account success), leaving the cloud record still 404 with exactly one POST and one debit and the local slices unchanged',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the missing-record resolution journey');
 await wrapSaveDiscardObserver(p);
 await mountGetMockTransparentForwarder(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const {id,draftHashBefore}=await reachMissingRecord(p,acct,obs);
 // (a) The NEW acknowledged-record-missing phase under the untouched client.
 const stateMissing=await saveState(p);
 assert.equal(stateMissing.phase,'acknowledged-record-missing','a real typed mock_not_found AFTER a valid commit ack enters the explicit acknowledged-record-missing phase (the ack/queue/intent are retained; nothing else is relabelled): '+JSON.stringify(stateMissing));
 assert.equal(stateMissing.lockedId,id,'the controller keeps the read-only lock on the exact owned draft through the missing-record outcome');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success claim appears for the missing record');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail opens for the missing record');
 assert.equal(await currentRoute(p),'selection','the real 404 forces no navigation');
 const errFirst=p.locator('[data-account-save="error"]');
 assert.equal(await errFirst.count(),1,'a truthful error notice is shown at the owned route');
 assert.equal(await errFirst.textContent(),DISCARD_ERR_MISSING,'the notice is the approved truthful above-notice with local-copy guidance, recorded byte-exact');
 assert.ok(!(await errFirst.textContent()).includes('temporarily unavailable'),'the approved resolution copy replaces the optimistic temporarily-unavailable wording for an actually-missing record');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the submitted-draft lock explanation stays visible');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'the retained draft stays readable/read-only');
 const retryBtn=p.locator('[data-act="account-save-retry"]');
 assert.equal(await retryBtn.count(),1,'Retry stays available as the existing optional GET-only re-check');
 assert.equal(await retryBtn.isDisabled(),false,'the Retry stays enabled');
 const discardBtn=p.locator('[data-act="account-save-discard"]');
 assert.equal(await discardBtn.count(),1,'the explicit Discard local draft control is rendered inside the controller region (not trapped by the editor lock)');
 assert.equal(await discardBtn.isDisabled(),false,'the Discard control is enabled');
 assert.equal(await discardBtn.evaluate(el=>!!el.closest('[data-account-save="region"]')),true,'the Discard control lives in the controller feedback region, outside the locked editor');
 const draftAtMissing=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftAtMissing))),draftHashBefore,'the original draft is retained byte-for-byte through the real 404');
 assert.deepEqual(draftAtMissing.mocks,[],'cloud work never merges into browser-local mocks');
 assert.equal(draftAtMissing.used,0,'the local counter stays untouched');
 assert.deepEqual(draftAtMissing.savedIds,[],'savedIds stays untouched');
 assert.deepEqual(await readAckAcks(p),[],'zero seam.apply through the whole missing-record presentation — the missing record is never treated as extant');
 await shot(p,'shot-1440-missing-resolution-notice.png');
 // (b) Cancel-safe dialog: opened by keyboard, dismissed by Escape.
 const apiBeforeDialog=rec.api.length;
 await discardBtn.focus();
 assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.act),'account-save-discard','the Discard control is keyboard focusable');
 await p.keyboard.press('Enter');
 const dlg=p.getByRole('dialog',{name:'Discard this browser draft?'});
 await dlg.waitFor({state:'visible',timeout:5000});
 assert.equal(await dlg.locator('h2').textContent(),'Discard this browser draft?','the dedicated dialog never reuses the Log this mock save dialog copy');
 assert.equal(await dlg.locator('p').first().evaluate(t=>t.textContent.includes('never recreates')),true,'the dialog truthfully states a discard will not recreate the saved record');
 assert.equal(await p.evaluate(()=>document.activeElement?.id),'missing-draft-discard-cancel','the cancel action receives initial focus (cancel-first)');
 assert.equal(await p.locator('[data-act="account-save-discard"]').count(),1,'the discard attempt has not yet changed the controller region');
 await shot(p,'shot-1440-missing-resolution-dialog.png');
 await p.keyboard.press('Escape');
 await dlg.waitFor({state:'hidden',timeout:5000});
 assert.equal(await currentRoute(p),'selection','Escape cancels with zero navigation');
 assert.equal((await saveState(p)).phase,'acknowledged-record-missing','Escape cancels with zero queue/phase mutation');
 assert.equal(sha(Buffer.from(JSON.stringify(await localDraft(p)))),draftHashBefore,'Escape cancels with zero draft mutation');
 assert.equal(rec.api.length,apiBeforeDialog,'opening and escaping the discard dialog caused zero network requests');
 assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.act),'account-save-discard','focus returns to the initiating Discard control after Escape');
 // (c) Native keyboard confirmed discard: Tab to the destructive action,
// Enter accepts. Synchronous local-only persist; zero backend requests.
 const apiBeforeAccept=rec.api.length;
 await p.keyboard.press('Enter');
 await dlg.waitFor({state:'visible',timeout:5000});
 await p.keyboard.press('Tab');
 assert.equal(await p.evaluate(()=>document.activeElement?.id),'missing-draft-discard-confirm','Tab moves to the destructive confirm inside the dialog');
 await p.keyboard.press('Enter');
 await dlg.waitFor({state:'hidden',timeout:5000});
 await settle(600);
 const after=await localDraft(p);
 assert.equal(after.draft,null,'the confirmed discard clears ONLY the local draft');
 assert.equal(after.current,null,'the discard lands with no dangling current record');
 assert.equal(after.route,'home','the confirmed discard returns to Home');
 assert.equal(rec.api.length,apiBeforeAccept,'the discard is local-only: zero backend requests on the accepted path');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'the discard never shows the saved-to-account/done success');
 const discarded=p.locator('[data-account-save="local-draft-discarded"]');
 assert.equal(await discarded.count(),1,'only the local-draft-discard message is shown');
 assert.equal(await discarded.textContent(),DISCARD_DONE_MSG,'the discard acknowledgement is the approved local-only copy, recorded byte-exact');
 assert.equal((await saveState(p)).phase,null,'the owned queue is invalidated after a successful discard');
 assert.equal(await p.locator('[data-account-save="region"]').count(),0,'the controller feedback region (Retry + Discard) is gone once discarded');
 assert.equal(await p.locator('[data-act="account-save-retry"]').count(),0,'no Retry remains for the invalidated queue');
 assert.deepEqual(after.mocks,[],'local mocks stay unchanged');
 assert.equal(after.used,0,'the local counter stays unchanged');
 assert.deepEqual(after.savedIds,[],'savedIds stay unchanged');
 const gotStill=await directItem(acct.token,id);
 assert.equal(gotStill.status,404,'the discard never recreated the cloud record (direct proof: still 404)');
 assert.equal(await directUsage(acct.token),1,'still exactly one server debit — no refund, no second save');
 assert.equal(obs.commits.length,1,'exactly one commit POST across the whole journey');
 assert.equal(commitCount(rec),1,'the browser request log also shows exactly one commit POST');
 assert.deepEqual(await readAckAcks(p),[],'seam.apply was never called across the entire journey — a missing record is never treated as extant');
 await shot(p,'shot-1440-missing-resolution-after-discard.png');
 // (d) Mobile 390 recheck of the resolution presentation and the cancel-safe
// dialog (pointer path), proving the control is reachable on narrow layout.
 const acctM=await account();
 const {p:pm,rec:recm}=await openPage(390);
 const connectedM=await connectSaveHarness(pm,acctM);
 assert.ok(connectedM.attachSaveAvailable&&connectedM.moduleAvailable,'save seam and module must be live for the mobile resolution journey');
 await wrapSaveDiscardObserver(pm);
 await mountGetMockTransparentForwarder(pm);
 const obsM={commits:[]};
 await armCommitObserver(pm,obsM);
 const rM=await reachMissingRecord(pm,acctM,obsM);
 assert.equal((await saveState(pm)).phase,'acknowledged-record-missing','mobile: the missing-record resolution phase renders on the narrow layout');
 assert.equal(await pm.locator('#note').evaluate(el=>el.readOnly),true,'mobile: the retained draft stays readable/read-only');
 const dlgM=pm.getByRole('dialog',{name:'Discard this browser draft?'});
 assert.equal(await dlgM.count(),0,'mobile: no discard dialog before activation');
 await pm.locator('[data-act="account-save-discard"]').click();
 await dlgM.waitFor({state:'visible',timeout:5000});
 await shot(pm,'shot-390-missing-resolution-dialog.png');
 const apiBeforeCancel=recm.api.length;
 await pm.getByRole('button',{name:'Keep this draft'}).click();
 await dlgM.waitFor({state:'hidden',timeout:5000});
 assert.equal(await currentRoute(pm),'selection','mobile: Cancel makes no mutation or navigation');
 assert.equal(sha(Buffer.from(JSON.stringify(await localDraft(pm)))),rM.draftHashBefore,'mobile: Cancel keeps the original draft byte-for-byte');
 assert.equal((await saveState(pm)).phase,'acknowledged-record-missing','mobile: Cancel keeps the missing-record phase');
 assert.equal(recm.api.length,apiBeforeCancel,'mobile: Cancel caused zero network requests');
 await shot(pm,'shot-390-missing-resolution-notice.png');
 checkClean(rec,'rd1missing');
 checkClean(recm,'rd1missing-mobile');
 await fs.writeFile(new URL('rd1missing-receipt.json',out),JSON.stringify({stableId:id,commitAcks:obs.commits.map(c=>({status:c.status,created:c.body&&c.body.created,id:c.body&&c.body.id,used:c.body&&c.body.used})),missingPhase:(await saveState(p)).phase,noticeCopy:DISCARD_ERR_MISSING,ackAcksAtEnd:await readAckAcks(p),draftHashBefore,routeAfterDiscard:(await localDraft(p)).route,discardMessage:DISCARD_DONE_MSG,cloudStill404:gotStill.status,usageAfter:await directUsage(acct.token),browserRequests:rec.api.length,commitPosts:commitCount(rec),mobileStableId:rM.id,mobileMissingPhase:(await saveState(pm)).phase},null,2));
 await clearHeldLifecycleDetail(p);
 await clearHeldLifecycleDetail(pm);
});
// rd2discarddenied: SEPARATELY-NAMED focused storage-denied discard case
// (authored AFTER the accepted rd1 GREEN, reusing the EXACT 98e1d633… prefix
// and ACTUAL helpers — no generator/wrapper/source-map family, no existing
// assertion edited or weakened, no runner rebuild). Scenario: the real 404
// missing-record state with the EXISTING scoped armCleanupDenial blocks the
// local draft clear. A confirmed discard during the denial must be truthful:
// the accurate 'Could not discard this local draft. It is still here.' line,
// the misleading generic allowance-not-consumed persist message suppressed
// ONLY for this seam, and the original draft, owned queue, missing phase and
// read-only lock all retained. Cancelling after the denial mutates nothing.
// Releasing the denial and explicitly confirming again succeeds locally with
// the local-draft-discard message only; the cloud record is untouched by
// every local attempt (still 404, usage 1, exactly one POST).
test('account save missing record discard denied: rd2discarddenied a confirmed Discard local draft whose synchronous browser write is denied by the existing scoped cleanup-denial shim shows only the truthful could-not-discard line with no misleading allowance message, retains the original draft, queue, missing phase and read-only lock with zero backend requests, cancels safely afterwards, and succeeds only after the denial is released and the discard is explicitly confirmed again, leaving the cloud record still 404 with exactly one POST and one debit',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the denied-discard journey');
 await wrapSaveDiscardObserver(p);
 await mountGetMockTransparentForwarder(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const {id,draftHashBefore}=await reachMissingRecord(p,acct,obs);
 const stateMissing=await saveState(p);
 assert.equal(stateMissing.phase,'acknowledged-record-missing','fixture: the real 404 after the real ack reaches the acknowledged-record-missing phase');
 assert.equal(stateMissing.lockedId,id,'fixture: the read-only lock stays on the exact owned draft');
 await armCleanupDenial(p);
 await setCleanupDeny(p,true);
 // Confirmed discard while the browser write is denied.
 const apiBeforeDenied=rec.api.length;
 await p.locator('[data-act="account-save-discard"]').click();
 const dlg=p.getByRole('dialog',{name:'Discard this browser draft?'});
 await dlg.waitFor({state:'visible',timeout:5000});
 await dlg.getByRole('button',{name:'Discard local draft'}).click();
 await dlg.waitFor({state:'hidden',timeout:5000});
 await settle(600);
 const denied=p.locator('[data-account-save="discard-error"]');
 assert.equal(await denied.count(),1,'the denied local discard shows the truthful could-not-discard line');
 assert.equal(await denied.textContent(),'Could not discard this local draft. It is still here.','the denial copy states the draft is still here, byte-exact');
 assert.ok(!(await p.locator('#messages').textContent()).includes('allowance was not consumed'),'the misleading generic allowance-not-consumed persist message is suppressed for this seam ONLY');
 assert.equal(await p.locator('[data-account-save="local-draft-discarded"]').count(),0,'a denied discard claims nothing was cleared');
 const stateDenied=await saveState(p);
 assert.equal(stateDenied.phase,'acknowledged-record-missing','the owned queue and missing phase are retained after the denied write');
 assert.equal(stateDenied.lockedId,id,'the read-only lock is retained after the denied write');
 assert.equal(await currentRoute(p),'selection','the denied discard forces no navigation');
 assert.equal(sha(Buffer.from(JSON.stringify(await localDraft(p)))),draftHashBefore,'the original draft is retained byte-for-byte after the denied write');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'the retained draft stays readable/read-only after the denial');
 assert.equal(await p.locator('[data-act="account-save-discard"]').count(),1,'the Discard control stays available for an explicit retry');
 assert.equal(rec.api.length,apiBeforeDenied,'a denied discard caused zero backend requests');
 assert.deepEqual(await readAckAcks(p),[],'the denied discard applied nothing at the saved seam');
 await shot(p,'shot-1440-missing-discard-denied.png');
 // Cancelling after the denial mutates nothing.
 const apiBeforeCancel=rec.api.length;
 await p.locator('[data-act="account-save-discard"]').click();
 await dlg.waitFor({state:'visible',timeout:5000});
 await dlg.getByRole('button',{name:'Keep this draft'}).click();
 await dlg.waitFor({state:'hidden',timeout:5000});
 assert.equal(await currentRoute(p),'selection','cancelling after the denial makes no navigation');
 assert.equal(sha(Buffer.from(JSON.stringify(await localDraft(p)))),draftHashBefore,'cancelling after the denial keeps the original draft byte-for-byte');
 assert.equal((await saveState(p)).phase,'acknowledged-record-missing','cancelling after the denial keeps the queue and phase');
 assert.equal(rec.api.length,apiBeforeCancel,'cancelling after the denial caused zero network requests');
 // Release the denial; the explicit confirm now succeeds locally only.
 await setCleanupDeny(p,false);
 const apiBeforeRelease=rec.api.length;
 await p.locator('[data-act="account-save-discard"]').click();
 await dlg.waitFor({state:'visible',timeout:5000});
 await dlg.getByRole('button',{name:'Discard local draft'}).click();
 await dlg.waitFor({state:'hidden',timeout:5000});
 await settle(600);
 const after=await localDraft(p);
 assert.equal(after.draft,null,'the released, re-confirmed discard clears only the local draft');
 assert.equal(after.route,'home','the successful discard lands on Home');
 assert.equal(await currentRoute(p),'home','the live app route is Home');
 assert.equal(rec.api.length,apiBeforeRelease,'the successful discard is local-only: zero backend requests');
 assert.equal(await p.locator('[data-account-save="local-draft-discarded"]').count(),1,'only the local-draft-discard message is shown after success');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no saved-to-account success message for the missing record');
 assert.equal(await p.locator('[data-account-save="discard-error"]').count(),0,'the denied-discard line is gone after the successful discard');
 assert.equal((await saveState(p)).phase,null,'the owned queue is invalidated after the successful discard');
 assert.deepEqual(after.mocks,[],'local mocks stay unchanged');
 assert.equal(after.used,0,'the local counter stays unchanged');
 assert.deepEqual(after.savedIds,[],'savedIds stay unchanged');
 assert.equal((await directItem(acct.token,id)).status,404,'no local discard attempt ever recreated the cloud record');
 assert.equal(await directUsage(acct.token),1,'still exactly one server debit');
 assert.equal(obs.commits.length,1,'exactly one commit POST across the whole denied/released journey');
 assert.equal(commitCount(rec),1,'the browser request log also shows exactly one commit POST');
 assert.deepEqual(await readAckAcks(p),[],'seam.apply was never called across the entire journey');
 await shot(p,'shot-1440-missing-discard-after-release.png');
 checkClean(rec,'rd2discarddenied');
 await fs.writeFile(new URL('rd2discarddenied-receipt.json',out),JSON.stringify({stableId:id,commitAcks:obs.commits.map(c=>({status:c.status,created:c.body&&c.body.created,id:c.body&&c.body.id,used:c.body&&c.body.used})),deniedCopy:'Could not discard this local draft. It is still here.',draftHashBefore,discardedCopy:'Discarded the local draft for the missing saved record in this browser. Nothing was saved again and no new save was counted; your local mock records, counter and saved history are untouched.',routeAfterRelease:after.route,cloudStill404:(await directItem(acct.token,id)).status,usageAfter:await directUsage(acct.token),browserRequests:rec.api.length,commitPosts:commitCount(rec),ackAcksAtEnd:await readAckAcks(p)},null,2));
 await clearHeldLifecycleDetail(p);
});
// rd3staleconfirm: SEPARATELY-NAMED focused stale-confirmation safety case
// (authored AFTER the accepted rd2 GREEN, reusing the EXACT prefix bytes and
// ACTUAL helpers — no generator/wrapper/source-map family, no existing
// assertion edited or weakened, no runner rebuild, no production auth change).
// Scenario: reach the real 404 acknowledged-record-missing state under real
// accountA, OPEN the cancel-first discard dialog, then perform a DIRECT
// verified real session switch A→B and back A→A over the same injected
// createAccountSession while the dialog stays open. The discard attempt must
// refuse: the queue was invalidated at departure, the ORIGINAL local draft
// and every other local slice stay byte-for-byte unchanged, the Home route is
// never taken, no discard/success message appears, and there is no automatic
// POST, DELETE or debit anywhere — proving stale discards are guarded by the
// retained queue/identity rechecks, not by uid equality alone (A→A returns
// the SAME uid string under a NEW frozen session-state object and is still
// refused). The dialog remains safely dismissible throughout.
const saveHarnessSwitch=async(p,acct)=>p.evaluate(async({uid,token})=>{const h=window.__uicSaveHarness;h.accounts[uid]=token;await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});return h.session.getState();},{uid:acct.uid,token:acct.token});
test('account save missing record stale confirmation: rd3staleconfirm opening the cancel-first discard dialog at the real 404 missing state and then directly switching the SAME live real session from accountA to fresh verified accountB and back A→A while the dialog stays open, refuses the native confirm attempt with the original local draft and every other slice unchanged and the Home route never taken, shows no discard or success message, performs no automatic POST DELETE or second debit across the whole journey, leaves the cloud record still 404 with usage unchanged, revives no queue phase or lock after the same-uid return, and dismisses the stale dialog safely',async()=>{
 const acct=await account();
 const acctB=await account();
 assert.equal(await directUsage(acct.token),0,'accountA fresh start at usage 0');
 assert.equal(await directUsage(acctB.token),0,'accountB fresh start at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the stale-confirmation journey');
 await wrapSaveDiscardObserver(p);
 await mountGetMockTransparentForwarder(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const {id,draftHashBefore}=await reachMissingRecord(p,acct,obs);
 const stateMissing=await saveState(p);
 assert.equal(stateMissing.phase,'acknowledged-record-missing','fixture: the real 404 after the real ack reaches the acknowledged-record-missing phase under accountA');
 assert.equal(stateMissing.lockedId,id,'fixture: the read-only lock stays on the exact owned draft');
 // Open the cancel-first discard dialog; it stays open across the switch.
 const apiBeforeOpen=rec.api.length;
 await p.locator('[data-act="account-save-discard"]').click();
 const dlg=p.getByRole('dialog',{name:'Discard this browser draft?'});
 await dlg.waitFor({state:'visible',timeout:5000});
 assert.equal(rec.api.length,apiBeforeOpen,'opening the discard dialog caused zero network requests');
 // DIRECT real session switch A→B over the SAME injected session while the
// dialog is open (real /api/session verification; loading then signed-in B).
 const bState=await saveHarnessSwitch(p,acctB);
 assert.equal(bState.status,'signed-in','fixture: the direct A→B switch really verified accountB');
 assert.equal(bState.uid,acctB.uid,'fixture: the live session is now accountB');
 await settle(600);
 assert.equal(await dlg.isVisible(),true,'the discard dialog stays open and safely dismissible across the switch');
 assert.equal((await saveState(p)).phase,null,'departure invalidated the owned queue immediately');
 // Attempt the NATIVE confirm inside the still-open stale dialog.
 const apiBeforeConfirm=rec.api.length;
 await dlg.getByRole('button',{name:'Discard local draft'}).click();
 await dlg.waitFor({state:'hidden',timeout:5000});
 await settle(600);
 assert.equal(await p.locator('#messages').textContent().then(t=>t.includes('This draft or account changed')),true,'the stale confirm is refused with the change notice and no discard claim');
 assert.equal(await p.locator('[data-account-save="local-draft-discarded"]').count(),0,'a stale discard never claims the draft was cleared');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no saved-to-account success appears');
 assert.equal(await currentRoute(p),'selection','the stale discard never navigates to Home');
 const afterStale=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(afterStale))),draftHashBefore,'the ORIGINAL local draft and every other local slice stay byte-for-byte unchanged after the refused stale confirm');
 assert.equal(afterStale.draft&&afterStale.draft.id,id,'the retained draft keeps the original stable ID');
 assert.equal(rec.api.length,apiBeforeConfirm,'the refused stale confirm caused ZERO backend requests — no POST, no DELETE, no re-read');
 assert.equal(rec.api.filter(u=>u.includes('/api/mocks/commit')).length,1,'the browser log confirms exactly one commit POST at the refusal point');
 // Same-uid return A→A over the real session API: a NEW frozen state object
// with the SAME uid string must revive no queue, lock, phase or dialog path.
 const aState=await saveHarnessSwitch(p,acct);
 assert.equal(aState.status,'signed-in','fixture: the direct B→A return really verified accountA again');
 assert.equal(aState.uid,acct.uid,'fixture: the live session uid string is the SAME as the original owner');
 await settle(600);
 const stateReturn=await saveState(p);
 assert.equal(stateReturn.phase,null,'the same-uid return revives no queue phase — the guard never relies on the uid string alone');
 assert.equal(stateReturn.lockedId,null,'the same-uid return revives no read-only lock');
 assert.equal(await p.locator('[data-act="account-save-discard"]').count(),0,'the controller region offers no stale Discard retry for the invalidated queue');
 assert.equal(await p.locator('[data-account-save="region"]').count(),0,'no recovery region appears after the A→A return');
 assert.equal(sha(Buffer.from(JSON.stringify(await localDraft(p)))),draftHashBefore,'the durable draft is still unchanged after A→A');
 // Direct cloud proofs: accountA's record is STILL missing, usage untouched,
// accountB never debited, and no request ever recreated or deleted anything.
 const gotStill=await directItem(acct.token,id);
 assert.equal(gotStill.status,404,'the missing cloud record was never recreated by the stale discard attempts');
 assert.equal(await directUsage(acct.token),1,'accountA still shows exactly one debit — no refund and no second save');
 assert.equal(await directUsage(acctB.token),0,'accountB stayed at zero — the stale queue never touched the new account');
 assert.equal(obs.commits.length,1,'exactly one commit POST across the whole journey');
 assert.equal(commitCount(rec),1,'the browser request log also shows exactly one commit POST');
 assert.equal(rec.api.filter(u=>u.includes('/api/mocks/commit')).length,1,'no automatic POST at confirmation, refusal or return');
 assert.equal(rec.api.filter(u=>u.includes('/api/mocks/item')).length,1,'no automatic GET or re-read at confirmation, refusal or return');
 assert.deepEqual(await readAckAcks(p),[],'seam.apply was never called — the missing record was never treated as extant');
 await shot(p,'shot-1440-missing-stale-confirm-refused.png');
 checkClean(rec,'rd3staleconfirm');
 await fs.writeFile(new URL('rd3staleconfirm-receipt.json',out),JSON.stringify({stableId:id,uidAAgain:aState.uid===acct.uid,bStateStatus:bState.status,refusalNotice:'This draft or account changed. Check your draft before discarding again.',draftHashBefore,draftHashAfterStale:sha(Buffer.from(JSON.stringify(afterStale))),routeAfterStale:afterStale.route,phaseAfterReturn:stateReturn.phase,lockedIdAfterReturn:stateReturn.lockedId,cloudStill404:gotStill.status,usageAPost:await directUsage(acct.token),usageBPost:await directUsage(acctB.token),commitPosts:obs.commits.length,itemGets:rec.api.filter(u=>u.includes('/api/mocks/item')).length,browserRequests:rec.api.length,ackAcksAtEnd:await readAckAcks(p)},null,2));
 await clearHeldLifecycleDetail(p);
});
// ── END ui-cloud-account-save-missing-record-resolution-append ──

// ── BEGIN ui-cloud-account-save-allowance-denial-append ──
// ad1allowancedenied: SEPARATELY-NAMED TEST-ONLY genuine quota-denial journey
// (authored on the exact immutable 2fd5f2c2… resolution-harness prefix + this
// ONE marked EOF append; no generator/wrapper/map family, no existing
// assertion edited or weakened, no production change). Scenario: a fresh
// fictional emulator account is seeded to the EXISTING accepted policy value
// of three server debits via the existing commitTitled helper (three
// DISTINCT direct-HTTP commits), then the real UI composes a FOURTH distinct
// draft (score → review → selection → confirmed Save). The browser's original
// commit request passes through the existing armCommitObserver route.fetch
// passthrough — the reply is NEVER replaced — so the page receives the ACTUAL
// server 403 initial_allowance_exhausted (already-accepted backend policy in
// mock-store/mock-api/mock-client tests). Direct HTTP proofs BEFORE any
// missing-behavior assertion: the fourth ID is 404, cumulative usage is still
// 3, and the account catalogue contains exactly the three seeds and NOT the
// fourth. UI proofs: exactly one commit POST for the fourth draft, no ghost
// success, no seam.apply, no detail, no navigation, the durable local draft
// and every browser-local slice unchanged. The first CONCRETE missing
// behavior asserted LAST (after the evidence capture so a genuine RED is
// useful): the visible denial must truthfully explain that the ACCOUNT
// ALLOWANCE IS EXHAUSTED — not the generic uncertain 'result cannot yet be
// confirmed' framing for this KNOWN server refusal — with no invented
// upgrade/purchase/new-grant/refund/new-quota copy. This slice does NOT
// implement or claim any unlock/retry/future-entitlement policy.
const ALLOWANCE_DENIAL_GENERIC_UNCERTAIN='The save result cannot yet be confirmed.';
test('account save allowance denial: ad1allowancedenied a fourth confirmed UI save on an account at the existing initial allowance of three receives the ACTUAL passthrough 403 initial_allowance_exhausted over the real browser commit route — proven by direct HTTP (fourth record absent 404, cumulative usage still three, catalogue holds exactly the three distinct seeds and not the fourth) and by the UI layer (one commit POST, no ghost success, zero seam.apply, no detail or navigation, the durable draft and every local slice unchanged) — and the visible denial must truthfully explain the exhausted account allowance instead of the generic uncertain result wording, with no invented upgrade, purchase, new-grant, refund, or new-quota promise',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fresh fictional account starts at usage 0');
 // Seed EXACTLY three distinct commits through the existing helper.
 const seed1=await commitTitled(acct.token,'Allowance denial seed one','Fictional seed provider');
 const seed2=await commitTitled(acct.token,'Allowance denial seed two','Fictional seed provider');
 const seed3=await commitTitled(acct.token,'Allowance denial seed three','Fictional seed provider');
 assert.deepEqual([seed1.created,seed2.created,seed3.created],[true,true,true],'the three seeds are genuinely distinct new creations');
 assert.equal(await directUsage(acct.token),3,'direct HTTP proof: the existing initial allowance is fully used (3) before any UI attempt');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the allowance-denial journey');
 // Apply observer mounted BEFORE the journey (existing accepted wrapper).
 await wrapSaveApplyObserver(p);
 // Passthrough commit observer: the ORIGINAL response reaches the page
 // UNCHANGED; only the actual status/body are recorded.
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id4=await saveJourneys(p);
 const draftHashBefore=sha(Buffer.from(JSON.stringify(await localDraft(p))));
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 await settle(600);
 // (a) The ACTUAL denial observed at the passthrough route — never replaced.
 assert.equal(obs.commits.length,1,'the fourth confirmed save issued exactly one browser commit POST');
 assert.equal(obs.commits[0].status,403,'the passthrough observed the ACTUAL server 403 for the fourth commit: '+JSON.stringify(obs.commits[0]));
 assert.ok(obs.commits[0].body&&obs.commits[0].body.error==='initial_allowance_exhausted','the actual denial is the accepted typed initial_allowance_exhausted contract: '+JSON.stringify(obs.commits[0].body));
 assert.equal(commitCount(rec),1,'the browser request log confirms exactly one commit POST across the whole journey');
 // (b) DIRECT HTTP backend proofs BEFORE any UI missing-behavior assertion.
 const got4=await directItem(acct.token,id4);
 assert.equal(got4.status,404,'direct HTTP proof: the fourth record was NEVER created: '+got4.status);
 const got4Err=await got4.json().catch(()=>null);
 assert.equal(got4Err&&got4Err.error,'mock_not_found','the fourth-item 404 is the real typed contract: '+JSON.stringify(got4Err));
 assert.equal(await directUsage(acct.token),3,'direct HTTP proof: the denial caused NO additional debit — cumulative usage stays exactly 3');
 const listResp=await fetch(base+'/api/mocks?limit=20',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 assert.equal(listResp.status,200,'the catalogue read is a real HTTP 200');
 const listBody=await listResp.json();
 const listedIds=listBody.items.map(i=>i.summary.id);
 assert.deepEqual(new Set(listedIds),new Set([seed1.id,seed2.id,seed3.id]),'the account catalogue contains exactly the three distinct seeds');
 assert.ok(!listedIds.includes(id4),'the catalogue does NOT contain the fourth (denied) draft id');
 // (c) UI-layer negative proofs: no ghost success, no apply, no navigation.
 const stateAtDenial=await saveState(p);
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'a known server denial must never present a saved-to-account success');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail opens for a record the server refused to create');
 assert.equal(await currentRoute(p),'selection','the denial forces no navigation');
 const draftAfter=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftAfter))),draftHashBefore,'the durable local draft is retained byte-for-byte through the denial');
 assert.equal(draftAfter.draft&&draftAfter.draft.id,id4,'the retained draft is the exact fourth draft');
 assert.deepEqual(draftAfter.mocks,[],'browser-local mocks stay unchanged through the denial');
 assert.equal(draftAfter.used,0,'the browser-local counter stays untouched');
 assert.deepEqual(draftAfter.savedIds,[],'savedIds stay untouched');
 assert.deepEqual(await readAckAcks(p),[],'seam.apply was never called — a refused save is never treated as a saved record');
 checkClean(rec,'ad1allowancedenied');
 // Evidence FIRST: screenshot + sanitized receipt before the RED assertion.
 await shot(p,'shot-1440-allowance-denial-observed.png');
 const denialCopyText=await p.locator('[data-account-save="error"]').textContent();
 await fs.writeFile(new URL('ad1allowancedenied-receipt.json',out),JSON.stringify({fourthId:id4,seedIds:[seed1.id,seed2.id,seed3.id],commitObserved:{status:obs.commits[0].status,error:obs.commits[0].body&&obs.commits[0].body.error},item4Status:got4.status,usageAtDenial:await directUsage(acct.token),catalogueCount:listedIds.length,phaseObserved:stateAtDenial.phase,lockedIdObserved:stateAtDenial.lockedId,currentVisibleCopy:denialCopyText,isGenericUncertainCopy:denialCopyText.includes(ALLOWANCE_DENIAL_GENERIC_UNCERTAIN),draftHashBefore,commitPosts:commitCount(rec),browserRequests:rec.api.length,ackAcksAtEnd:await readAckAcks(p)},null,2));
 // (d) THE FIRST CONCRETE MISSING BEHAVIOR (asserted last so the genuine RED
 // is useful): the visible denial must explicitly explain the exhausted
 // ACCOUNT ALLOWANCE for this KNOWN typed server refusal.
 const errText=denialCopyText;
 assert.ok(/allowance/i.test(errText)&&/exhaust|used up|limit of 3|three mock logs/i.test(errText),'the visible denial explicitly explains the exhausted initial account allowance for the known initial_allowance_exhausted refusal (observed copy: '+JSON.stringify(errText)+')');
 assert.ok(!errText.includes(ALLOWANCE_DENIAL_GENERIC_UNCERTAIN),'this known server refusal must NOT be framed with the generic uncertain result-cannot-be-confirmed wording');
 assert.ok(!/upgrade|purchase|buy|new grant|refund|new quota|extra logs/i.test(errText),'the denial invents no upgrade, purchase, new-grant, refund or new-quota promise');
 await clearCommitObserver(p);
});
// ── END ui-cloud-account-save-allowance-denial-append ──
// ── BEGIN ui-cloud-account-save-allowance-denied-editable-append ──
// ad2deniededitable: SEPARATELY-NAMED focused case authored ONLY after the
// accepted ad1allowancedenied GREEN (exact a006fb28… prefix + this ONE marked
// EOF append; no generator/wrapper/map family; no existing assertion edited
// or weakened). This is an existing-correct proof of the parent-approved
// allowance-denied architecture, not a manufactured RED: after the KNOWN
// typed 403 initial_allowance_exhausted definite refusal, the retained draft
// must be genuinely EDITABLE — the definite refusal is a resolved outcome, so
// no read-only lock applies (accountSaveLockActive() is false and the native
// note textarea reports readOnly false), a real keyboard edit persists to the
// durable browser-local draft, and NO recovery Retry control is rendered for
// a refusal the server already answered. The denial triggers zero automatic
// POSTs: the whole journey ends with exactly ONE commit POST (the refused
// original), usage stays at the accepted cap of 3, no done/detail/
// navigation/apply appears, and re-clicking the ordinary Save keeps the
// existing manual confirmation dialog behavior (closing with Cancel makes
// zero further requests). No new quota/grant/upgrade/purchase/billing copy
// and no discard policy is asserted or implemented here.
const ERR_ALLOWANCE_DENIED_COPY='Your initial account-save allowance is used up. This save was refused. Your draft is still in this browser, and no additional save was counted.';
test('account save allowance denial editable: ad2deniededitable after the ACTUAL passthrough 403 initial_allowance_exhausted definite refusal the retained draft is genuinely editable (lock inactive, native note readOnly false), a real keyboard edit persists to the durable local draft with zero extra commit POST, no recovery Retry renders, usage stays exactly three, and the ordinary Save keeps its cancel-safe manual confirmation with zero requests on Cancel',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fresh fictional account starts at usage 0');
 const seed1=await commitTitled(acct.token,'Denied-editable seed one','Fictional seed provider');
 const seed2=await commitTitled(acct.token,'Denied-editable seed two','Fictional seed provider');
 const seed3=await commitTitled(acct.token,'Denied-editable seed three','Fictional seed provider');
 assert.deepEqual([seed1.created,seed2.created,seed3.created],[true,true,true],'the three seeds are genuinely distinct new creations');
 assert.equal(await directUsage(acct.token),3,'direct HTTP proof: the existing initial allowance is fully used (3) before any UI attempt');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the editable-denial journey');
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 const draftHashBefore=sha(Buffer.from(JSON.stringify(await localDraft(p))));
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 await settle(600);
 // (a) The definite refusal is observed unchanged through the passthrough.
 assert.equal(obs.commits.length,1,'the denied save issued exactly one browser commit POST');
 assert.equal(obs.commits[0].status,403,'the passthrough observed the ACTUAL server 403: '+JSON.stringify(obs.commits[0]));
 assert.ok(obs.commits[0].body&&obs.commits[0].body.error==='initial_allowance_exhausted','the actual denial is the accepted typed contract: '+JSON.stringify(obs.commits[0].body));
 // (b) The accepted denial phase/copy (the ad1 GREEN state, re-proven here).
 const state=await saveState(p);
 assert.equal(state.phase,'allowance-denied','a known first-attempt refusal enters the dedicated allowance-denied phase: '+JSON.stringify(state));
 assert.equal(state.lockedId,null,'the definite refusal resolves the outcome — nothing stays locked: '+JSON.stringify(state));
 const errNode=p.locator('[data-account-save="error"]');
 assert.equal(await errNode.textContent(),ERR_ALLOWANCE_DENIED_COPY,'the denial shows the approved definite-refusal copy byte-exact');
 assert.equal(await p.locator('[data-act="account-save-retry"]').count(),0,'no recovery Retry renders for a refusal the server definitively answered');
 assert.equal(await p.locator('[data-act="account-save-discard"]').count(),0,'the missing-record Discard control does not leak into this phase');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'no read-only lock note is shown at the definite refusal');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'a refused save never presents success');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail for the refused record');
 assert.equal(await currentRoute(p),'selection','the denial forces no navigation');
 assert.ok(!(await p.locator('#messages').textContent()).match(/upgrade|purchase|buy|new grant|refund|new quota|extra logs/i),'the denial invents no upgrade/purchase/new-grant/refund/new-quota copy');
 assert.equal(await directUsage(acct.token),3,'direct HTTP proof: the refusal caused no additional debit');
 assert.equal((await directItem(acct.token,id)).status,404,'direct HTTP proof: the refused record was never created');
 // (c) EDITABILITY: the app-level lock predicate is false and the native
// note control reports readOnly false (the lock helper excludes the
// allowance-denied phase, so a stale control cannot be blocked here).
 assert.equal(await p.evaluate(()=>{const s=window.__uicSaveHarness.saveController.getState();return !!s.lockedId&&s.lockedId===JSON.parse(localStorage.getItem('deltascore-remake-v1')).draft?.id;}),false,'accountSaveLockActive equivalent: no lockedId matches the owned draft at the definite refusal');
 const noteEl=p.locator('#note');
 assert.equal(await noteEl.evaluate(el=>el.readOnly),false,'the retained draft textarea is genuinely NOT read-only after the definite refusal');
 assert.equal(await noteEl.evaluate(el=>el.disabled),false,'the retained draft textarea is not disabled');
 assert.ok((await noteEl.inputValue()).includes(SAVE_NOTE),'the retained draft text is still present before editing');
 // (d) A REAL keyboard edit persists to the durable browser-local draft.
 await noteEl.click();
 const apiBeforeEdit=rec.api.length;
 const EDIT_TEXT=' Edited after the allowance denial at cap.';
 await p.keyboard.press('End');
 await p.keyboard.type(EDIT_TEXT);
 await settle(400);
 const draftAfterEdit=await localDraft(p);
 assert.equal(draftAfterEdit.draft&&draftAfterEdit.draft.id,id,'the edited draft keeps the exact stable ID');
 assert.ok(draftAfterEdit.draft.note.includes(SAVE_NOTE)&&draftAfterEdit.draft.note.endsWith(EDIT_TEXT),'the actual native typing persists into the durable local draft: '+JSON.stringify(draftAfterEdit.draft.note));
 assert.notEqual(sha(Buffer.from(JSON.stringify(draftAfterEdit))),draftHashBefore,'the durable draft genuinely changed through the local edit');
 assert.equal(obs.commits.length,1,'the denial itself and the subsequent edit trigger zero automatic commit POSTs');
 assert.equal(commitCount(rec),1,'the browser request log confirms still exactly one commit POST after editing');
 assert.equal(rec.api.length,apiBeforeEdit,'the local edit caused zero network requests (browser-local persistence only)');
 assert.equal(await directUsage(acct.token),3,'usage stays exactly 3 after the local edit');
 assert.equal((await saveState(p)).phase,'allowance-denied','ordinary editing does not mutate the controller phase');
 assert.equal(await p.locator('[data-account-save="error"]').textContent(),ERR_ALLOWANCE_DENIED_COPY,'the denial notice stays while the draft is being edited (no auto-clear request)');
 await shot(p,'shot-1440-allowance-denial-after-edit.png');
 // (e) The existing manual Save confirmation behavior is preserved:
// clicking Save again opens the same cancel-safe dialog; Cancel makes zero
// requests and mutates nothing. No new policy is asserted beyond that.
 await p.locator('[data-act="save"]').click();
 const dlg=p.getByRole('dialog');
 await dlg.waitFor({state:'visible',timeout:5000});
 assert.equal(await dlg.locator('#mock-save-description').textContent(),'You can return to edit your question reviews later.','the re-clicked Save keeps the existing manual confirmation dialog');
 const apiBeforeCancel=rec.api.length;
 const draftHashEdited=sha(Buffer.from(JSON.stringify(await localDraft(p))));
 await dlg.getByRole('button',{name:'Keep reviewing'}).click();
 await settle(300);
 assert.equal(rec.api.length,apiBeforeCancel,'cancelling the manual confirmation makes zero requests');
 assert.equal(obs.commits.length,1,'cancelling the manual confirmation sends zero commit POSTs');
 assert.equal(sha(Buffer.from(JSON.stringify(await localDraft(p)))),draftHashEdited,'the cancelled re-confirmation leaves the edited draft unchanged');
 assert.deepEqual(await readAckAcks(p),[],'seam.apply was never called across the whole editable-denial journey');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),false,'after the cancelled re-confirmation the draft remains editable');
 checkClean(rec,'ad2deniededitable');
 await fs.writeFile(new URL('ad2deniededitable-receipt.json',out),JSON.stringify({deniedId:id,seedIds:[seed1.id,seed2.id,seed3.id],commitObserved:{status:obs.commits[0].status,error:obs.commits[0].body&&obs.commits[0].body.error},phase:state.phase,lockedId:state.lockedId,denialCopy:ERR_ALLOWANCE_DENIED_COPY,noteReadOnlyAfterDenial:false,draftHashBefore,draftHashAfterEdit:sha(Buffer.from(JSON.stringify(draftAfterEdit))),editPersisted:draftAfterEdit.draft.note.endsWith(EDIT_TEXT),commitPosts:obs.commits.length,usageAtEnd:await directUsage(acct.token),refusedItem404:(await directItem(acct.token,id)).status,ackAcksAtEnd:await readAckAcks(p)},null,2));
 await clearCommitObserver(p);
});
// ── END ui-cloud-account-save-allowance-denied-editable-append ──
// ── BEGIN ui-cloud-account-save-uncertain-at-cap-append ──
// ad3uncertainatcap: SEPARATELY-NAMED adversarial real-uncertainty-at-cap
// safeguard, authored ONLY after the accepted ad2deniededitable GREEN (exact
// e8b11a75… prefix + this ONE marked EOF append; no generator/wrapper/map
// family; no existing assertion edited or weakened; no manufactured reply
// beyond the explicitly labelled controlled lost-ack replacement AFTER the
// real commit proof — the accepted b1 pattern, reused via the existing
// armLostAckCommitAtCap fixture). Purpose: prove the priorUncertain guard.
// Sequence with REAL backend truth: two direct-HTTP seeds (usage 2), then the
// REAL UI third commit ACTUALLY returns 201 created:true used:3 (proven by
// direct item + usage readback INSIDE the fixture BEFORE the labelled lost-ack
// 503 replacement; ordered events persisted). The UI must then stay TRUTHFULLY
// UNCERTAIN and locked: generic cannot-confirm copy, lockedId set, note
// read-only true, Retry present — and NEVER the definite allowance-denied
// copy, because a 403 on a LATER attempt could not establish that this
// transport-uncertain original never committed. While the ack is still lost,
// the harness deletes the third record through the EXISTING accepted DELETE
// seam (same emulator token + confirmed ETag): real 200 deleted, direct item
// 404, usage stays exactly 3 (the pinned mock-store remove() preserves the
// ledger AND the receipt). The native keyboard Retry then re-sends the EXACT
// original POST body. Per the PINNED backend contract (mock-store.commit
// checks receipt.exists BEFORE the used>3 allowance gate), the real server
// answer is the idempotent replay 200 created:false used:3 — NOT the 403
// initial_allowance_exhausted a planning note assumed; deletion preserves the
// receipt, so a same-payload retry can never re-enter the allowance branch.
// That real replay is a VALID acknowledgement: the queue moves to the ALREADY
// ACCEPTED acknowledged-record-missing phase (the record genuinely was saved,
// then genuinely was deleted by this harness) — truthful saved-then-missing
// wording, retained locked draft with the SAME id and payload, no claim the
// original never saved, no additional debit, no apply/clear/success/detail,
// GET-only Retry + Discard preserved, exactly two browser POSTs total.
const ERR_ALLOWANCE_DENIED_UI_PROBE='Your initial account-save allowance is used up.';
test('account save uncertainty at cap: ad3uncertainatcap a REAL at-cap 201 lost to a labelled controlled replacement keeps the queue truthfully uncertain and locked with zero definite-denial copy, the accepted DELETE while the ack is unknown leaves cloud 404 usage 3, and the native keyboard retry of the exact original body receives the REAL receipt-replay 200 created:false used:3 (never a false not-saved claim), settling only into the accepted acknowledged-record-missing phase with the retained same-ID draft, GET-only Retry, zero apply and two POSTs total',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fresh fictional account starts at usage 0');
 // Two direct seeds OUTSIDE the browser (usage 2), existing helper.
 const seed1=await commitTitled(acct.token,'Uncertain-at-cap seed one','Fictional seed provider');
 const seed2=await commitTitled(acct.token,'Uncertain-at-cap seed two','Fictional seed provider');
 assert.deepEqual([seed1.created,seed2.created],[true,true],'the two seeds are genuine new creations');
 assert.equal(await directUsage(acct.token),2,'direct HTTP proof: usage is exactly 2 before the UI third');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the uncertainty-at-cap journey');
 await wrapSaveApplyObserver(p);
 const id=await saveJourneys(p);
 const proofs={};
 await armLostAckCommitAtCap(p,proofs,id,acct.token);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 await settle(600);
 // (a) The ORIGINAL third commit really committed at the cap BEFORE the
// labelled lost-ack replacement (existing accepted b1 fixture proof).
 assert.equal(proofs.fixtureError,null,'lost-ack-at-cap fixture readback must succeed: '+proofs.fixtureError);
 assert.equal(proofs.upstream&&proofs.upstream.status,201,'fixture: the third commit ACTUALLY reached the server and returned 201');
 assert.equal(proofs.upstream.body.created,true,'fixture: the upstream ack reports created:true');
 assert.equal(proofs.upstream.body.used,3,'fixture: the upstream ack reports the third and final slot used');
 const ev=proofs.receipt.events;
 const idxItem=ev.indexOf('direct-http-item-readback:200:id='+id+':note=SAVE_NOTE:reviews=1');
 const idxUsage=ev.indexOf('direct-http-usage-readback:200:used=3');
 const idxRepl=ev.indexOf('controlled-503-replacement-fulfilled');
 assert.ok(idxItem>=0&&idxUsage>=0&&idxRepl>=0,'ordered receipt records both direct proofs and the replacement: '+JSON.stringify(ev));
 assert.ok(idxItem<idxRepl&&idxUsage<idxRepl,'the direct item/usage proofs precede the controlled lost-ack replacement');
 // (b) UNCERTAIN at the cap: the lost original ack must NOT be presented as a
// definite refusal. phase failed + lock active + cannot-confirm copy, and the
// definite allowance-denied line must be absent even though usage is now 3.
 const stUnc=await saveState(p);
 assert.equal(stUnc.phase,'failed','a pre-ack transport-uncertain failure stays in the uncertain failed phase: '+JSON.stringify(stUnc));
 assert.equal(stUnc.lockedId,id,'the uncertain original keeps the read-only lock on the exact owned draft');
 const errUnc=await p.locator('[data-account-save="error"]').textContent();
 assert.equal(errUnc,SAVE_RECOVERY_ERR_UNCERTAIN,'the uncertain outcome states the truthful cannot-confirm copy, not a definite refusal');
 assert.ok(!errUnc.includes(ERR_ALLOWANCE_DENIED_UI_PROBE),'the definite allowance-denied copy must NEVER appear for a transport-uncertain original: '+JSON.stringify(errUnc));
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'the uncertain draft stays locked read-only until the outcome resolves');
 assert.equal(await p.locator('[data-act="account-save-retry"]').count(),1,'the uncertain phase keeps its existing Retry path');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success before a validated receipt');
 assert.equal((await directItem(acct.token,id)).status,200,'direct HTTP proof: despite the lost ack the record ACTUALLY exists (a 403 now could not prove the original never committed)');
 await shot(p,'shot-1440-uncertain-at-cap-before-retry.png');
 // (c) WHILE the ack is unknown, delete the committed record through the
// EXISTING accepted DELETE seam with the confirmed ETag (rd1 pattern).
 const gotPre=await directItem(acct.token,id);
 assert.equal(gotPre.status,200,'the acknowledged-existence record exists before deletion');
 const preETag=gotPre.headers.get('etag');
 assert.ok(/^"review-\d+"$/.test(String(preETag)),'the direct pre-delete receipt carries the opaque server ETag: '+String(preETag));
 const del=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{method:'DELETE',headers:{'authorization':'Bearer '+acct.token,'if-match':preETag},credentials:'omit'});
 const delBody=await del.json().catch(()=>null);
 assert.equal(del.status,200,'the existing accepted DELETE must actually succeed: '+JSON.stringify(delBody));
 assert.deepEqual(delBody,{deleted:true,id},'the deletion receipt is the real backend acknowledgement for the original ID');
 assert.equal((await directItem(acct.token,id)).status,404,'direct HTTP proof: the record is ACTUALLY gone');
 assert.equal(await directUsage(acct.token),3,'direct HTTP proof: deletion preserves cumulative usage at exactly 3 (pinned contract, no refund)');
 const draftBeforeRetry=await localDraft(p);
 const hashBeforeRetry=sha(Buffer.from(JSON.stringify(draftBeforeRetry)));
 // (d) Native keyboard Retry sends the EXACT original POST body. The REAL
// backend answer is the receipt replay 200 created:false used:3 (the pinned
// mock-store checks receipt.exists before the allowance gate — a real 403 is
// contractually impossible for an already-committed stable ID at usage 3).
 await keyboardRetryConfirm(p);
 await p.waitForFunction(()=>{const h=window.__uicSaveHarness;return h&&h.saveController&&h.saveController.getState().phase==='acknowledged-record-missing';},null,{timeout:15000}).catch(()=>harness('ad3uncertainatcap: the retry never settled into the acknowledged-record-missing phase within 15s'));
 assert.equal(proofs.calls,2,'uncertain original plus retry: exactly two intercepted browser commit POSTs');
 assert.equal(proofs.posts[0],proofs.posts[1],'the retry transmits the EXACT original stable ID and payload');
 assert.equal(proofs.retry&&proofs.retry.status,200,'REAL backend truth: the same-payload retry at usage 3 is the receipt replay 200, NOT 403 (deviation from the planning note recorded in the receipt)');
 assert.equal(proofs.retry.body.created,false,'the replay ack is the real created:false idempotent acknowledgement');
 assert.equal(proofs.retry.body.used,3,'the replay reuses the at-cap usage with zero additional debit');
 assert.equal(await directUsage(acct.token),3,'direct HTTP proof: still exactly 3 server debits after the retry');
 // (e) The valid replay ack + the real deleted record land on the ALREADY
// ACCEPTED acknowledged-record-missing phase: truthful saved-then-missing,
// retained locked draft with the SAME id and payload, GET-only Retry + Discard,
// no apply/clear/success/detail and no definite-denied or false not-saved copy.
 const stMissing=await saveState(p);
 assert.equal(stMissing.phase,'acknowledged-record-missing','the retry establishes commit truth; the actually-deleted record enters the accepted missing phase: '+JSON.stringify(stMissing));
 assert.equal(stMissing.lockedId,id,'the queue remains locked with the same retained ID through the resolved uncertainty');
 const errMissing=await p.locator('[data-account-save="error"]').textContent();
 assert.equal(errMissing,DISCARD_ERR_MISSING,'the accepted truthful saved-then-missing copy renders byte-exact');
 assert.ok(!errMissing.includes('not saved')&&!errMissing.includes(ERR_ALLOWANCE_DENIED_UI_PROBE),'the UI never claims the original was never saved and never falsely asserts the definite denial: '+JSON.stringify(errMissing));
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success for the deleted record');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail for the deleted record');
 assert.equal(await currentRoute(p),'selection','the resolution forces no navigation');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'the retained draft stays read-only while unresolved ownership persists');
 assert.equal((await localDraft(p)).draft.id,id,'the retained draft keeps the SAME stable ID and payload');
 assert.equal(sha(Buffer.from(JSON.stringify(await localDraft(p)))),hashBeforeRetry,'the retry with the unchanged original payload mutates nothing locally');
 assert.deepEqual(await readAckAcks(p),[],'seam.apply was never called — the deleted record is never treated as extant');
 assert.equal(await p.locator('[data-act="account-save-discard"]').count(),1,'the accepted missing-phase Discard control is present (GET-only semantics unchanged)');
 assert.equal(commitCount(rec),2,'exactly two browser commit POSTs across the whole journey (the two seeds were direct HTTP outside the browser)');
 checkClean(rec,'ad3uncertainatcap');
 await shot(p,'shot-1440-uncertain-at-cap-tail-state.png');
 await fs.writeFile(new URL('ad3uncertainatcap-receipt.json',out),JSON.stringify({stableId:id,seedIds:[seed1.id,seed2.id],realOriginalAck:proofs.upstream,orderedFixtureEvents:ev,lostAckReplacement:'controlled malformed 503 AFTER real commit proof (labelled fixture, not an outage claim)',uncertainPhase:{phase:stUnc.phase,lockedId:stUnc.lockedId,copy:errUnc},deleteReceipt:{status:del.status,body:delBody,etag:preETag},retryAck:proofs.retry,retryPostIdentical:proofs.posts[0]===proofs.posts[1],tailPhase:{phase:stMissing.phase,lockedId:stMissing.lockedId,copy:errMissing},usageAtEnd:await directUsage(acct.token),itemStatus:await (async()=>(await directItem(acct.token,id)).status)(),commitPosts:commitCount(rec),ackAcksAtEnd:await readAckAcks(p),draftHashBeforeRetry:hashBeforeRetry,draftHashAfterRetry:sha(Buffer.from(JSON.stringify(await localDraft(p)))),planningNoteDeviation:'the planning note expected a REAL 403 initial_allowance_exhausted on the same-payload retry; the PINNED mock-store contract checks receipt.exists BEFORE the used>3 allowance gate and the accepted DELETE preserves the ledger AND the receipt, so the real answer is the 200 created:false used:3 replay. The priorUncertain guard is proven by (b): a transport-uncertain original never presents the definite allowance-denied copy; the 403-with-priorUncertain branch is unreachable through any honest real-backend journey.'},null,2));
 // Release the owned at-cap fixture route (same unroute as clearCommitObserver).
 await p.unroute(base+'/api/mocks/commit').catch(()=>{});
});
// ── END ui-cloud-account-save-uncertain-at-cap-append ──
// ── BEGIN ui-cloud-account-save-injected-403-append ──
// ad4injected403: SEPARATELY-NAMED coverage case closing the ad3 gap — ad3
// proved the priorUncertain guard was NECESSARY but never exercised a typed
// 403 arriving AFTER a prior-uncertain attempt, because the pinned real
// backend cannot 403 a receipt-preserving same-payload replay retry. That
// branch is reached here ONLY via an explicitly labelled CONTROLLED
// ADVERSARIAL 403 RESPONSE substituted by this harness AFTER the ACTUAL 200
// replay was proven via route.fetch() — never presented as backend behaviour.
// Authored ONLY after the accepted ad3uncertainatcap GREEN: exact 20039bf3…
// immutable prefix + this ONE marked EOF append; no generator/wrapper/
// source-map family; no existing assertion edited or weakened; base file
// bytes untouched; app.js/account-save.js/integration-server.js unchanged —
// this is TEST-ONLY coverage, and per the skill rule no RED is manufactured:
// the existing controller guard is expected to hold GREEN on first run.
// Journey: two direct-HTTP seeds (usage 2); the REAL at-cap third UI commit
// ACTUALLY returns 201 created:true used:3 proven by direct item+usage
// readback INSIDE the existing labelled armLostAckCommitAtCap fixture BEFORE
// the controlled lost-ack 503 replacement (proof ordering persisted);
// truthful uncertain-locked state; accepted DELETE with the confirmed ETag
// (real 200, cloud 404, usage 3); then the untouched real client/session/UI
// with native keyboard Retry. Expected truths asserted: injected-403-after-
// uncertainty stays phase failed (NOT allowance-denied) with the exact
// cannot-confirm copy, same lockedId, readOnly lock, Retry present, no
// editable/unlocked/done/detail/discard presentation, unchanged draft and
// slices, zero seam.apply/navigation/new-ID/debit; after releasing the
// injection, the next Retry gets the REAL replay 200 again and the genuinely
// missing GET 404 lands on the accepted acknowledged-record-missing tail with
// three IDENTICAL POSTs, cloud 404, usage 3, no resurrection and no debit.
async function armObservedRetryThenInject403(p,inj){
 inj.calls=0;inj.posts=[];inj.events=[];inj.actual=null;inj.substituted=false;
 await p.route(base+'/api/mocks/commit',async route=>{
  inj.calls++;const pd=route.request().postData();inj.posts.push(pd);
  const resp=await route.fetch();
  const text=await resp.text();
  let body=null;try{body=JSON.parse(text);}catch{}
  inj.actual={status:resp.status(),body};
  inj.events.push('retry-upstream-ACTUAL-observed:status='+resp.status()+':created='+JSON.stringify(body&&body.created)+':used='+JSON.stringify(body&&body.used));
  // CONTROLLED ADVERSARIAL SUBSTITUTION authored by THIS harness — the
  // backend's own answer above was already observed and recorded BEFORE the
  // replacement is fulfilled. It is NOT a claim about backend behaviour.
  await route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'initial_allowance_exhausted'})});
  inj.events.push('controlled-403-substitution-fulfilled:status=403:error=initial_allowance_exhausted');
  inj.substituted=true;
 });
}
test('account save prior-uncertain injected denial: ad4injected403 after a REAL at-cap 201 lost to the labelled controlled 503 (direct item/usage proofs BEFORE replacement) and the accepted DELETE (real 404, usage 3), the native keyboard Retry first receives the REAL receipt-replay 200 created:false used:3 proven via route.fetch and ONLY THEN the harness substitutes a typed JSON 403 initial_allowance_exhausted as an explicitly labelled CONTROLLED ADVERSARIAL RESPONSE — the queue must stay phase failed (never allowance-denied) with the exact cannot-confirm copy, the same lockedId, the read-only lock, the Retry, zero editable/unlocked/done/detail/discard presentation, unchanged draft and local slices, zero seam.apply, no navigation, no new ID and no debit — and after releasing the injection the next explicit Retry receives the REAL replay again and settles on the accepted acknowledged-record-missing tail with three identical POSTs, cloud 404 and usage 3',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fresh fictional account starts at usage 0');
 const seed1=await commitTitled(acct.token,'Injected-403 seed one','Fictional seed provider');
 const seed2=await commitTitled(acct.token,'Injected-403 seed two','Fictional seed provider');
 assert.deepEqual([seed1.created,seed2.created],[true,true],'the two seeds are genuine new creations');
 assert.equal(await directUsage(acct.token),2,'direct HTTP proof: usage is exactly 2 before the UI third');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the injected-denial journey');
 await wrapSaveApplyObserver(p);
 const id=await saveJourneys(p);
 const proofs={};
 await armLostAckCommitAtCap(p,proofs,id,acct.token);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 await settle(600);
 // (a) REAL at-cap commit proven BEFORE the labelled lost-ack replacement
//     (existing accepted b1/ad3 fixture — reused untouched).
 assert.equal(proofs.fixtureError,null,'lost-ack-at-cap fixture readback must succeed: '+proofs.fixtureError);
 assert.equal(proofs.upstream&&proofs.upstream.status,201,'fixture: the third commit ACTUALLY reached the server and returned 201');
 assert.equal(proofs.upstream.body.created,true,'fixture: the upstream ack reports created:true');
 assert.equal(proofs.upstream.body.used,3,'fixture: the upstream ack reports the third and final slot used');
 const ev=proofs.receipt.events;
 const idxItem=ev.indexOf('direct-http-item-readback:200:id='+id+':note=SAVE_NOTE:reviews=1');
 const idxUsage=ev.indexOf('direct-http-usage-readback:200:used=3');
 const idxRepl=ev.indexOf('controlled-503-replacement-fulfilled');
 assert.ok(idxItem>=0&&idxUsage>=0&&idxRepl>=0,'ordered receipt records both direct proofs and the replacement: '+JSON.stringify(ev));
 assert.ok(idxItem<idxRepl&&idxUsage<idxRepl,'the direct item/usage proofs precede the controlled lost-ack replacement');
 // (b) prior UNCERTAIN established on this queue: phase failed, locked,
//     cannot-confirm copy. (No argument is made here that this pre-.retry
//     state alone proves any later 403 branch — the branch itself is the
//     controlled injection below.)
 const stUnc=await saveState(p);
 assert.equal(stUnc.phase,'failed','the pre-ack transport-uncertain failure sits in the uncertain failed phase: '+JSON.stringify(stUnc));
 assert.equal(stUnc.lockedId,id,'the uncertain original keeps the read-only lock on the exact owned draft');
 assert.equal(await p.locator('[data-account-save="error"]').textContent(),SAVE_RECOVERY_ERR_UNCERTAIN,'the queue states the truthful cannot-confirm copy before the later injected denial');
 // (c) accepted DELETE while the ack is unknown (real seam + confirmed ETag).
 const gotPre=await directItem(acct.token,id);
 assert.equal(gotPre.status,200,'the committed record exists before deletion');
 const preETag=gotPre.headers.get('etag');
 assert.ok(/^"review-\d+"$/.test(String(preETag)),'the pre-delete receipt carries the opaque server ETag: '+String(preETag));
 const del=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{method:'DELETE',headers:{'authorization':'Bearer '+acct.token,'if-match':preETag},credentials:'omit'});
 const delBody=await del.json().catch(()=>null);
 assert.equal(del.status,200,'the existing accepted DELETE must actually succeed: '+JSON.stringify(delBody));
 assert.deepEqual(delBody,{deleted:true,id},'the deletion receipt is the real backend acknowledgement for the original ID');
 assert.equal((await directItem(acct.token,id)).status,404,'direct HTTP proof: the record is ACTUALLY gone');
 assert.equal(await directUsage(acct.token),3,'direct HTTP proof: deletion preserves cumulative usage at exactly 3 (pinned contract, no refund)');
 const draftHashBefore=sha(Buffer.from(JSON.stringify(await localDraft(p))));
 // (d) Release the at-cap lost-ack fixture, then intercept the EXACT next
//     retry: prove the ACTUAL replay 200 via route.fetch FIRST, and only
//     THEN substitute the typed 403 as the controlled adversarial response.
 await p.unroute(base+'/api/mocks/commit').catch(()=>{});
 const inj={};
 await armObservedRetryThenInject403(p,inj);
 await keyboardRetryConfirm(p);
 for(let i=0;i<150&&!inj.substituted;i++)await settle(100);
 assert.ok(inj.substituted,'the controlled 403 substitution never fired within 15s');
 await settle(600);
 assert.equal(inj.calls,1,'exactly one intercepted retry POST under the injection');
 assert.equal(inj.posts[0],proofs.posts[0],'the retry transmits the EXACT original stable ID and payload');
 assert.equal(inj.actual&&inj.actual.status,200,'ACTUAL backend truth observed BEFORE any substitution: the same-payload replay at usage 3 is 200, not 403');
 assert.equal(inj.actual.body.created,false,'the actual replay ack is the real created:false idempotent acknowledgement');
 assert.equal(inj.actual.body.used,3,'the actual replay carries unchanged usage 3');
 assert.ok(inj.events[0].startsWith('retry-upstream-ACTUAL-observed')&&inj.events[1].startsWith('controlled-403-substitution-fulfilled'),'proof ordering: the actual 200 replay was observed BEFORE the controlled 403 substitution: '+JSON.stringify(inj.events));
 // (e) THE GUARD: a typed 403 arriving AFTER prior uncertainty must NOT flip
//     the queue to the definite allowance-denied phase or definite copy.
 const stInj=await saveState(p);
 assert.equal(stInj.phase,'failed','the injected later-403 on a prior-uncertain queue stays in the truthful uncertain failed phase (NOT allowance-denied): '+JSON.stringify(stInj));
 assert.equal(stInj.lockedId,id,'the same lockedId survives the injected denial');
 const errInj=await p.locator('[data-account-save="error"]').textContent();
 assert.equal(errInj,SAVE_RECOVERY_ERR_UNCERTAIN,'the cannot-confirm copy stays byte-exact through the injected denial');
 assert.ok(!errInj.includes(ERR_ALLOWANCE_DENIED_UI_PROBE),'the definite allowance-denied copy must NEVER appear for a prior-uncertain queue: '+JSON.stringify(errInj));
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'the draft stays locked read-only through the injected denial');
 assert.equal(await p.locator('[data-act="account-save-retry"]').count(),1,'the uncertain Retry stays present');
 assert.equal(await p.locator('[data-act="account-save-discard"]').count(),0,'no Discard control appears at the injected-403 uncertain state');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success presentation');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail presentation');
 const bodyTxt=await p.evaluate(()=>document.body.textContent);
 assert.ok(!bodyTxt.includes('Question reviews stay editable'),'no unlocked/editable selection note renders at the injected-403 state');
 assert.ok(bodyTxt.includes('read-only until the account save is resolved'),'the locked read-only note stays present at the injected-403 state');
 assert.equal(await currentRoute(p),'selection','the injected denial forces no navigation');
 const draftInj=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftInj))),draftHashBefore,'the durable draft is unchanged byte-for-byte through the injected denial');
 assert.equal(draftInj.draft.id,id,'no new draft ID was minted');
 assert.deepEqual(draftInj.mocks,[],'browser-local mocks slice unchanged');
 assert.equal(draftInj.used,0,'browser-local counter slice unchanged');
 assert.deepEqual(draftInj.savedIds,[],'savedIds slice unchanged');
 assert.deepEqual(await readAckAcks(p),[],'seam.apply was never called — the injected denial neither saves nor resurrects');
 assert.equal(await directUsage(acct.token),3,'direct HTTP proof: zero additional debit across the injected denial');
 assert.equal((await directItem(acct.token,id)).status,404,'direct HTTP proof: the deleted record stays missing — no resurrection');
 checkClean(rec,'ad4injected403-injected-state');
 await shot(p,'shot-1440-injected-403-uncertain-locked.png');
 // (f) Release the injection: the NEXT explicit keyboard Retry receives the
//     REAL replay again and the genuinely-missing GET 404 lands the queue on
//     the already-accepted acknowledged-record-missing tail.
 await p.unroute(base+'/api/mocks/commit').catch(()=>{});
 const obs2={posts:[],commits:[]};
 await p.route(base+'/api/mocks/commit',async route=>{
  obs2.posts.push(route.request().postData());
  const resp=await route.fetch();const text=await resp.text();
  let body=null;try{body=JSON.parse(text);}catch{}
  obs2.commits.push({status:resp.status(),body});
  await route.fulfill({status:resp.status(),contentType:'application/json',body:text});
 });
 await keyboardRetryConfirm(p);
 await p.waitForFunction(()=>{const h=window.__uicSaveHarness;return h&&h.saveController&&h.saveController.getState().phase==='acknowledged-record-missing';},null,{timeout:15000}).catch(()=>harness('ad4injected403: the released retry never settled into the acknowledged-record-missing phase within 15s'));
 assert.equal(obs2.commits.length,1,'exactly one released retry POST');
 assert.equal(obs2.posts[0],proofs.posts[0],'the released retry re-sends the SAME exact original body');
 assert.equal(obs2.commits[0].status,200,'REAL backend truth again once the injection is released: the replay is the genuine 200');
 assert.equal(obs2.commits[0].body.created,false,'the released ack is created:false');
 assert.equal(obs2.commits[0].body.used,3,'the released ack carries unchanged usage 3');
 const stMissing=await saveState(p);
 assert.equal(stMissing.phase,'acknowledged-record-missing','the real replay plus the real missing 404 land on the accepted missing phase: '+JSON.stringify(stMissing));
 assert.equal(stMissing.lockedId,id,'the queue stays locked on the same retained ID');
 const errMissing=await p.locator('[data-account-save="error"]').textContent();
 assert.equal(errMissing,DISCARD_ERR_MISSING,'the accepted truthful saved-then-missing copy renders byte-exact after release');
 assert.equal(await p.locator('[data-act="account-save-discard"]').count(),1,'the missing-phase Discard control appears');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success for the deleted record');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'no detail for the deleted record');
 assert.equal(await currentRoute(p),'selection','the resolution forces no navigation');
 assert.equal(sha(Buffer.from(JSON.stringify(await localDraft(p)))),draftHashBefore,'the draft is unchanged across all three identical POSTs');
 assert.deepEqual(await readAckAcks(p),[],'seam.apply STILL never called at the tail');
 assert.equal(await directUsage(acct.token),3,'direct HTTP proof: three identical POSTs cause no fourth debit');
 assert.equal((await directItem(acct.token,id)).status,404,'direct HTTP proof: still missing, no resurrection');
 assert.equal(proofs.calls+inj.calls+obs2.posts.length,3,'three intercepted commit POSTs total');
 assert.equal(commitCount(rec),3,'the browser request log confirms exactly three commit POSTs across the whole journey');
 checkClean(rec,'ad4injected403');
 await shot(p,'shot-1440-injected-403-released-missing-tail.png');
 await fs.writeFile(new URL('ad4injected403-receipt.json',out),JSON.stringify({stableId:id,seedIds:[seed1.id,seed2.id],realOriginalAck:proofs.upstream,orderedFixtureEvents:ev,lostAckReplacement:'controlled malformed 503 AFTER real commit proof (labelled fixture, not an outage claim)',deleteReceipt:{status:del.status,body:delBody,etag:preETag},retryIntercept:{actualObservedViaRouteFetch:inj.actual,controlledSubstitution:{status:403,body:{error:'initial_allowance_exhausted'},label:'CONTROLLED ADVERSARIAL RESPONSE injected by this harness, NOT backend behaviour'},orderingEvents:inj.events,postIdentical:proofs.posts[0]===inj.posts[0]},uncertainPhaseAtInjectedDenial:{phase:stInj.phase,lockedId:stInj.lockedId,copy:errInj},releasedRetry:{actualAck:obs2.commits[0],postIdentical:inj.posts[0]===obs2.posts[0]},tailPhase:{phase:stMissing.phase,lockedId:stMissing.lockedId,copy:errMissing},usageAtEnd:await directUsage(acct.token),itemStatusAtEnd:(await directItem(acct.token,id)).status,commitPosts:commitCount(rec),ackAcksAtEnd:await readAckAcks(p),draftHashBefore,draftHashAtEnd:sha(Buffer.from(JSON.stringify(await localDraft(p)))),coverageNote:'closes the ad3 gap: ad3 never exercised the priorUncertain + later-403 branch because the real backend cannot 403 a receipt-preserving replay retry; this case reaches the branch ONLY via an explicitly labelled controlled adversarial 403 substitution, asserted AFTER the real 200 replay was proven via route.fetch. The injection proves the controller guard presentation, not backend behaviour.'},null,2));
 await p.unroute(base+'/api/mocks/commit').catch(()=>{});
});
// ── END ui-cloud-account-save-injected-403-append ──
// ── BEGIN ui-cloud-account-save-late-receipt-draft-replacement-append ──
// dr1draftrepl: LATE VALID RECEIPT vs A TEST-ONLY REPLACED DRAFT — the
// ownership seam b2 cannot reach. b2 proves the guard against NEWER GENUINE-UI
// typing; under the CURRENT pinned production bytes (account-save.js 7e6138bb
// + app.js read-only lock aca3cb4c) ordinary typing into the pending owned
// draft is INTENTIONALLY blocked, so that exact replacement path is no longer
// reachable through the supported UI. This case reaches the SAME guard through
// an explicitly labelled TEST-ONLY append-only lifecycle hook on a separately
// served, prefix-verified instrumented app.js response: while the acknowledged
// original detail receipt is still held, the hook replaces the owned draft with
// a DISTINCT VALID FICTIONAL DRAFT (same stable ID, different note — exact
// JSON version no longer matches the queued snapshot, so ownsDraft/guard are
// false). The hook is NOT a user-UI capability and is recorded as a test-only
// manipulation. The original held response (exact 200 status, body and ETag)
// is released LAST over the replaced draft: the late valid receipt must clear
// nothing, apply zero times, show no success/detail/navigation and perform no
// local write; the original queue is DROPPED per the existing changed-draft
// null-branch semantics (guard false, ownsDraft false — not the committed+
// ownsDraft RESUME_PENDING branch). Cloud readback proves the ORIGINAL record
// stands with its original content and exactly one debit. Existing-correct
// proof of the pinned controller guard (account-save.js lines ~103/111/116-136
// `queue!==q` + `seam.guard(queued)` changed-draft drop): expected GREEN first
// attempt, no manufactured RED, no new reconciliation UX or product policy.
// Derived harness = EXACT immutable injected-denial harness (5a64f6219cd7f2a6
// …) bytes as the FULL prefix + THIS ONE marked EOF append; deleting from the
// BEGIN marker to EOF reproduces the prefix byte-exact. No generator/wrapper/
// source-map family; base harness untouched; runner registration is filename-
// only. Production app.js/account-save.js bytes are NEVER modified: the hook
// exists only in this journey's instrumented page response, with the original
// served prefix verified equal to the pinned production bytes at serve time.
test('account save late receipt draft replacement: dr1draftrepl a TEST-ONLY hook replacement of the owned draft with a distinct valid fictional draft while the acknowledged original detail receipt is held is never cleared or applied by the late valid receipt - the replaced draft bytes are exact, the seam applies zero times, the original queue drops per existing changed-draft semantics with no success/detail/navigation/local write, and the original cloud record and single debit stay unchanged',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 // TEST-ONLY append-only lifecycle hook (P4-notes-proven pattern): a verified
 // production-prefix app.js response with THIS suffix appended in the page
 // route only. It exposes one synchronous fixture function that replaces the
 // live module state's draft through the app's own persist/render seams. This
 // manipulation is explicitly NOT supported by the user UI: ordinary typing
 // into a locked pending draft is blocked by design; the hook exists solely
 // to stage a replaced-draft ownership state before the held receipt.
 const hook='\n// TEST ONLY: lifecycle fixture, never written to production app.js\nwindow.__uicDraftReplacementTestHook=true;\nwindow.__uicReplaceDraftWithFictionalDraft=(d)=>{if(!state.draft)throw Error(\'fixture: no draft under test\');if(!d||typeof d!==\'object\'||d.id!==state.draft.id)throw Error(\'fixture: replacement must keep the stable draft id\');const next={...state,draft:d};if(!persist(next))throw Error(\'fixture persist denied\');render();};\n';
 await fs.writeFile(new URL('dr1-test-only-hook.js.txt',out),hook);
 const originalServed=await (await fetch(base+'/app.js')).text();
 const prefixSha=sha(Buffer.from(originalServed));
 assert.equal(prefixSha,APP_PIN,'instrumented serving requires the verified production app.js prefix');
 await p.route('**/app.js',async route=>{
  const response=await route.fetch();
  const text=await response.text();
  assert.equal(sha(Buffer.from(text)),APP_PIN,'the instrumented response prefix must equal the pinned production app.js bytes');
  await route.fulfill({response,body:text+hook});
 });
 await p.reload();
 assert.equal(await p.evaluate(()=>window.__uicDraftReplacementTestHook===true),true,'the test-only hook must be live in the instrumented page');
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the replaced-draft journey');
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 const REPLACED_NOTE='Replaced fictional draft 3k8 staged by the TEST-ONLY hook while the original receipt is held; not reachable through the supported UI';
 const hold={};
 await holdFirstDetailGet(p,hold);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'held-GET capture must succeed: '+hold.error);
 // Original response PROVEN before any replacement (never release a hold that
// captured nothing): actual 200 carrying the original committed content.
 assert.equal(hold.receipt.status,200,'the held original detail GET actually returned 200 upstream');
 const heldMock=hold.receipt.body&&hold.receipt.body.mock;
 assert.ok(heldMock&&heldMock.id===id&&heldMock.note===SAVE_NOTE,'the held receipt carries the original stable ID and committed note');
 assert.ok((heldMock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the held receipt carries the original thinking review');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'exactly one acknowledged real 201 created:true used:1 POST');
 // The pending lock makes the ordinary mutation path INTENTIONALLY unavailable:
 // readOnly field + lock note present. This is why the replacement below is a
 // labelled TEST-ONLY hook manipulation, not a user-UI journey.
 const stPending=await saveState(p);
 assert.equal(stPending.phase,'pending','the queue is pending while the detail receipt is held');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'ordinary typing is intentionally blocked on the locked submitted draft (b2-era genuine-UI typing is superseded under the current pinned bytes)');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the read-only lock note is present at replacement time');
 const draftPre=await localDraft(p);
 assert.equal(draftPre.draft.id,id);assert.equal(draftPre.draft.note,SAVE_NOTE,'the owned draft still carries the original bytes before the hook replacement');
 const replacedDraft={...draftPre.draft,note:REPLACED_NOTE};
 const replacedBytes=JSON.stringify(replacedDraft);
 await p.evaluate(d=>window.__uicReplaceDraftWithFictionalDraft(d),replacedDraft);
 await settle(500);
 const duringHook=await localDraft(p);
 assert.equal(JSON.stringify(duringHook.draft),replacedBytes,'the durable draft carries the TEST-ONLY replaced distinct fictional draft while the original receipt is still held');
 assert.equal(stPending.lockedId,id,'the queue still owns the original submission identity');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success at the replacement moment');
 await fs.writeFile(new URL('dr1-held-get-receipt.json',out),JSON.stringify({stableId:id,detailReceipt:{status:hold.receipt.status,body:hold.receipt.body},commitAcks:obs.commits,replacedDraftBytes:replacedBytes,hookNote:'TEST-ONLY replacement via verified-prefix instrumented app.js suffix; not supported by the user UI'},null,2));
 await shot(p,'shot-1440-account-save-dr1-replaced-draft-held.png');
 // Release the EXACT original response LAST; the late continuation runs now.
 await hold.release();
 await settle(1500);
 // Existing changed-draft drop semantics: guard(queued) false (version
 // changed) AND ownsDraft false (the RESUME_PENDING branch does not apply),
 // seam.apply is never called, the queue is invalidated and re-rendered
// silently — no success claim, no detail, no navigation, no local write
// touching the replaced draft, no error/status line (recorded truthfully).
 const late=await localDraft(p);
 assert.equal(JSON.stringify(late.draft),replacedBytes,'the late valid original receipt must not change a single byte of the replaced newer draft');
 assert.deepEqual((await readAckAcks(p)),[],'the dropped late receipt applies zero times at the seam (the replaced draft is never marked saved)');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'a late original receipt must never claim success over the replaced draft');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'a late original receipt must never open the account full detail');
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'the changed-draft drop clears the save feedback region (no stale pending/error line)');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'the pending line must not survive the drop');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'the read-only lock note is gone once the replaced-draft drop resolves');
 const stAfter=await saveState(p);
 assert.equal(stAfter.phase,null,'the original queue is dropped per existing changed-draft semantics (guard false, ownsDraft false, committed RESUME_PENDING branch not taken)');
 assert.equal(stAfter.lockedId,null,'no locked submission survives the drop');
 assert.equal(await currentRoute(p),'selection','the drop navigates nowhere: the view stays on the original selection route');
 assert.deepEqual(late.mocks,[]);assert.equal(late.used,0);assert.deepEqual(late.savedIds,[]);
 // Cloud readback: the ORIGINAL commit stands with its original content and
 // exactly one debit; nothing was re-saved and nothing was cancelled.
 await clearHeldDetailGet(p);
 await clearCommitObserver(p);
 const gotItem=await directItem(acct.token,id);
 assert.equal(gotItem.status,200,'the original account commit remains in the emulator store (never cancelled by the dropped receipt)');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id,'the cloud record keeps the original stable ID');
 assert.equal(itemJson.mock.note,SAVE_NOTE,'the cloud record keeps the ORIGINAL committed note, not the replaced local draft');
 assert.ok((itemJson.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the cloud record keeps the original thinking review');
 assert.equal(await directUsage(acct.token),1,'exactly one server debit across the whole journey');
 assert.equal(obs.commits.length,1,'exactly one actual POST reached the commit route');
 assert.equal(hold.calls.length,1,'the first detail GET was intercepted and held exactly once; the late release is that same delivery');
 checkClean(rec,'dr1');
 await fs.writeFile(new URL('dr1-late-receipt-draft-replacement-receipt.json',out),JSON.stringify({stableId:id,productionPrefixAppSha:prefixSha,hookSuffixSha:sha(Buffer.from(hook)),instrumentedResponseSha:sha(Buffer.from(originalServed+hook)),ordinaryTypingBlockedAtReplacement:true,replacedDraftBytesSha:sha(Buffer.from(replacedBytes)),draftBytesShaAfterRelease:sha(Buffer.from(JSON.stringify(late.draft))),ackAcksAtEnd:await readAckAcks(p),phaseAfterDrop:stAfter.phase,commitAcks:obs.commits,usageAtEnd:await directUsage(acct.token),itemNoteAtEnd:itemJson.mock.note,coverageNote:'dr1 reaches the late-valid-receipt vs REPLACED-draft ownership seam that genuine-UI typing b2 can no longer exercise under the pinned read-only lock; the replacement is an explicitly labelled TEST-ONLY hook manipulation, not a supported UI journey; existing drop semantics verified, no new product policy'},null,2));
 await shot(p,'shot-1440-account-save-dr1-replaced-draft-retained.png');
});
// ── END ui-cloud-account-save-late-receipt-draft-replacement-append ──
// ── BEGIN ui-cloud-account-save-late-receipt-deleted-draft-append ──
// dd1deleteddraft: LATE VALID RECEIPT vs A TEST-ONLY DELETED LOCAL DRAFT — the
// deleted-draft half of the ownership seam that dr1 (same-ID changed-version
// replacement) does not cover. The pinned controller guard branch for a receipt
// that returns after the local draft is GONE (account-save.js ~111 queue!==q
// stays true; line ~118 seam.guard → accountSaveGuard → accountSaveOwnsDraft
// false because state.draft is null → committed+ownsDraft RESUME_PENDING not
// taken → null drop) is existing semantics; nothing here reconciles a deleted
// draft with the acknowledged cloud record, invents copy, or adds UX.
// Deletion staging mirrors the ONLY production draft-removal shape (app.js
// accountSaveDiscard, line ~339): {...state,draft:null,current:null,route:
// 'home',reviewIndex:-1} through the app's own synchronous persist seam. The
// selection screen REQUIRES a draft object to render, so a null-draft state
// kept on 'selection' would be an unsupported broken screen; staging the
// deletion through the proven home shape keeps every ordinary render legal.
// mocks/used/savedIds/tasks/notes slices are untouched by the fixture. This
// manipulation is explicitly TEST-ONLY and NOT a supported user-UI capability
// (the pending editor is intentionally read-only under the pinned lock); it
// exists solely to reach a deleted-draft ownership state while the
// acknowledged original detail receipt is still held. The exact original 200
// response (captured via route.fetch with its real status/body/ETag, asserted
// to carry the original ID + SAVE_NOTE + SAVE_THINKING BEFORE any mutation)
// is released LAST. Existing-correct proof of the pinned controller guard:
// expected GREEN first attempt, no manufactured RED.
// Derived harness = EXACT immutable draft-replacement harness (48a17e5a…)
// bytes as the FULL prefix + THIS ONE marked EOF append; deleting from the
// BEGIN marker to EOF reproduces the prefix byte-exact. No generator/wrapper/
// source-map family; base harness untouched; runner registration is filename-
// only. Production app.js/account-save.js bytes are NEVER modified: the hook
// exists only in this journey's instrumented page response, with the served
// prefix verified equal to the pinned production bytes at serve time.
test('account save late receipt deleted draft: dd1deleteddraft a TEST-ONLY hook deletion of the owned local draft (null draft, discard-shaped state, other local slices untouched) while the acknowledged original detail receipt is held is never resurrected, recreated, applied, claimed as success, opened as detail or navigated to by the late valid receipt - the queue drops with no stale lock per existing deleted-draft semantics and the original cloud record and single debit stay unchanged',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 // TEST-ONLY append-only lifecycle hook (dr1-proven pattern): a verified
 // production-prefix app.js response with THIS suffix appended in the page
 // route only. One synchronous fixture function deletes the live draft through
 // the app's own persist/render seams using the proven accountSaveDiscard
 // state shape. NOT a user-UI capability: the pending editor is intentionally
 // read-only; the draft cannot be discarded through the supported UI while a
 // save is unresolved (discard exists only in the acknowledged-missing phase).
 const hook='\n// TEST ONLY: lifecycle fixture, never written to production app.js\nwindow.__uicDraftDeletionTestHook=true;\nwindow.__uicDeleteLocalDraftWithDiscardShapedState=(id)=>{if(!state.draft||state.draft.id!==id)throw Error(\'fixture: no draft under test\');const next={...state,draft:null,current:null,route:\'home\',reviewIndex:-1};if(!persist(next))throw Error(\'fixture persist denied\');render();return true;};\n';
 await fs.writeFile(new URL('dd1-test-only-hook.js.txt',out),hook);
 const originalServed=await (await fetch(base+'/app.js')).text();
 const prefixSha=sha(Buffer.from(originalServed));
 assert.equal(prefixSha,APP_PIN,'instrumented serving requires the verified production app.js prefix');
 await p.route('**/app.js',async route=>{
  const response=await route.fetch();
  const text=await response.text();
  assert.equal(sha(Buffer.from(text)),APP_PIN,'the instrumented response prefix must equal the pinned production app.js bytes');
  await route.fulfill({response,body:text+hook});
 });
 await p.reload();
 assert.equal(await p.evaluate(()=>window.__uicDraftDeletionTestHook===true),true,'the test-only hook must be live in the instrumented page');
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the deleted-draft journey');
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 const hold={};
 await holdFirstDetailGet(p,hold);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'held-GET capture must succeed: '+hold.error);
 // Original response PROVEN before any mutation (never release a hold that
 // captured nothing): actual 200 carrying the original committed content.
 assert.equal(hold.receipt.status,200,'the held original detail GET actually returned 200 upstream');
 const heldMock=hold.receipt.body&&hold.receipt.body.mock;
 assert.ok(heldMock&&heldMock.id===id&&heldMock.note===SAVE_NOTE,'the held receipt carries the original stable ID and committed note');
 assert.ok((heldMock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the held receipt carries the original thinking review');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'exactly one acknowledged real 201 created:true used:1 POST');
 const stPending=await saveState(p);
 assert.equal(stPending.phase,'pending','the queue is pending while the detail receipt is held');
 assert.equal(stPending.lockedId,id,'the pending queue owns the submitted draft identity');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'ordinary editing is intentionally blocked on the locked submitted draft before the TEST-ONLY deletion');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the read-only lock note is present before the TEST-ONLY deletion');
 const preDelete=await localDraft(p);
 assert.equal(preDelete.draft.id,id);assert.equal(preDelete.draft.note,SAVE_NOTE,'the owned draft still carries the original bytes before the hook deletion');
 // TEST-ONLY mutation: delete the local draft (null) through the app's own
 // persist/render seams in the proven discard-shaped state; every other local
 // slice (mocks/used/savedIds/tasks/notes) is spread through unchanged.
 await p.evaluate(delId=>window.__uicDeleteLocalDraftWithDiscardShapedState(delId),id);
 await settle(500);
 const duringHold=await localDraft(p);
 assert.equal(duringHold.draft,null,'the TEST-ONLY hook deleted the local draft while the original receipt is still held');
 assert.deepEqual(duringHold.mocks,preDelete.mocks,'the deletion touched no other local slice: mocks');
 assert.equal(duringHold.used,preDelete.used,'the deletion touched no other local slice: used');
 assert.deepEqual(duringHold.savedIds,preDelete.savedIds,'the deletion touched no other local slice: savedIds');
 assert.deepEqual(duringHold.tasks,preDelete.tasks,'the deletion touched no other local slice: tasks');
 assert.deepEqual(duringHold.notes,preDelete.notes,'the deletion touched no other local slice: notes');
 assert.equal(duringHold.route,'home','the deletion staged through the proven discard-shaped home state (selection cannot render a null draft)');
 const stDuring=await saveState(p);
 assert.equal(stDuring.phase,'pending','the queue stays pending with the receipt held while the draft is gone');
 assert.equal(stDuring.lockedId,id,'the queue still owns the original submission identity while the draft is deleted');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'no lock note can survive on a deleted draft (accountSaveLockActive requires state.draft — existing semantics)');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success at the deletion moment');
 await fs.writeFile(new URL('dd1-held-get-receipt.json',out),JSON.stringify({stableId:id,detailReceipt:{status:hold.receipt.status,body:hold.receipt.body},commitAcks:obs.commits,deletedDraftId:id,preDeleteSlices:{mocks:preDelete.mocks,used:preDelete.used,savedIds:preDelete.savedIds},hookNote:'TEST-ONLY draft deletion via verified-prefix instrumented app.js suffix using the accountSaveDiscard state shape; not supported by the user UI'},null,2));
 await shot(p,'shot-1440-account-save-dd1-deleted-draft-held.png');
 // Release the EXACT original response LAST; the late continuation runs now.
 await hold.release();
 await settle(1500);
 // Existing deleted-draft drop semantics: guard(queued) false (no draft),
 // ownsDraft false so the committed RESUME_PENDING branch is NOT taken,
// seam.apply is never called, the queue is invalidated and re-rendered
// silently — no resurrection, no draft recreation, no success claim, no
// detail, no navigation away from the staged home, no stale lock, no local
// write touching any slice (recorded truthfully).
 const late=await localDraft(p);
 assert.equal(late.draft,null,'the late valid original receipt must not resurrect or recreate any local draft');
 assert.equal(late.current,null,'the dropped receipt opens no current record');
 assert.equal(late.route,'home','the drop navigates nowhere: the state keeps the staged home route (no history hand-off by the dropped receipt)');
 assert.deepEqual(late.mocks,preDelete.mocks,'the dropped receipt wrote no local mock');
 assert.equal(late.used,preDelete.used,'the dropped receipt changed no local counter');
 assert.deepEqual(late.savedIds,preDelete.savedIds,'the dropped receipt marked nothing saved locally');
 assert.deepEqual((await readAckAcks(p)),[],'the dropped late receipt applies zero times at the seam');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'a late original receipt must never claim success over a deleted draft');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'a late original receipt must never open the account full detail');
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'the deleted-draft drop clears the save feedback region (no stale pending/error line)');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'the pending line must not survive the drop');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'no stale read-only lock survives the drop');
 const stAfter=await saveState(p);
 assert.equal(stAfter.phase,null,'the original queue is dropped per existing deleted-draft semantics (guard false, ownsDraft false, committed RESUME_PENDING branch not taken)');
 assert.equal(stAfter.lockedId,null,'no locked submission survives the drop');
 assert.equal(await currentRoute(p),'home','the view route is unchanged by the dropped receipt');
 // Cloud readback: the ORIGINAL commit stands with its original content and
 // exactly one debit; nothing was re-saved, deleted or cancelled.
 await clearHeldDetailGet(p);
 await clearCommitObserver(p);
 const gotItem=await directItem(acct.token,id);
 assert.equal(gotItem.status,200,'the original account commit remains in the emulator store (never cancelled by the dropped receipt)');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id,'the cloud record keeps the original stable ID');
 assert.equal(itemJson.mock.note,SAVE_NOTE,'the cloud record keeps the ORIGINAL committed note');
 assert.ok((itemJson.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the cloud record keeps the original thinking review');
 assert.equal(await directUsage(acct.token),1,'exactly one server debit across the whole journey');
 assert.equal(obs.commits.length,1,'exactly one actual POST reached the commit route');
 assert.equal(hold.calls.length,1,'the first detail GET was intercepted and held exactly once; the late release is that same delivery');
 checkClean(rec,'dd1');
 await fs.writeFile(new URL('dd1-late-receipt-deleted-draft-receipt.json',out),JSON.stringify({stableId:id,productionPrefixAppSha:prefixSha,hookSuffixSha:sha(Buffer.from(hook)),instrumentedResponseSha:sha(Buffer.from(originalServed+hook)),deletedDraftId:id,draftNullBeforeRelease:true,draftNullAfterRelease:late.draft===null,otherSlicesUnchanged:true,ackAcksAtEnd:await readAckAcks(p),phaseAfterDrop:stAfter.phase,lockedIdAfterDrop:stAfter.lockedId,commitAcks:obs.commits,usageAtEnd:await directUsage(acct.token),itemNoteAtEnd:itemJson.mock.note,routeBeforeRelease:'home',routeAfterRelease:late.route,coverageNote:'dd1 reaches the late-valid-receipt vs DELETED-draft ownership seam with an explicitly labelled TEST-ONLY hook deletion staged through the proven accountSaveDiscard state shape (the supported UI cannot delete a draft while a save is unresolved; the pending editor is intentionally read-only); existing drop semantics verified — no resurrection, recreation, apply, success, detail, navigation, stale lock or extra debit; no new product policy or reconciliation UX'},null,2));
 await shot(p,'shot-1440-account-save-dd1-deleted-draft-retained.png');
});
// ── END ui-cloud-account-save-late-receipt-deleted-draft-append ──
// ── BEGIN ui-cloud-account-save-late-receipt-new-id-draft-append ──
// dr2newiddraft: LATE VALID RECEIPT vs A TEST-ONLY DIFFERENT-ID REPLACEMENT
// DRAFT — the new-ID half of the ownership seam. dr1 covers a same-ID
// changed-VERSION replacement (the retained `queued.version` JSON no longer
// matches); dd1 covers a deleted draft. Nothing yet covered the queue meeting
// a late valid receipt when the local draft has been replaced by a valid
// fictional draft carrying a DISTINCT NEW ID (a genuinely different draft
// object, not one field changed). This reaches the SAME pinned null-drop
// branch (account-save.js ~111/~116–136: queue!==q stays true for this queue,
// seam.guard → accountSaveOwnsDraft false because state.draft.id!==queued.id
// — the committed+ownsDraft RESUME_PENDING branch is not taken → null →
// invalidate+refresh) and proves the controller neither adopts nor marks the
// replacement draft saved, and never locks it.
// Staging uses a NEW, separately named TEST-ONLY hook with the OPPOSITE id
// requirement of the dr1 same-ID hook (it REFUSES a replacement keeping the
// stable id); the dr1 hook bytes are untouched. The replacement draft is a
// full valid fictional draft object (all original scores/reviews carried, new
// UUID id, changed note) written through the app's own synchronous
// persist/render seams. This is explicitly NOT a user-UI capability: the
// pending editor is intentionally read-only under the pinned lock and no
// supported control replaces the draft with a different-ID one mid-save. The
// exact original 200 response (route.fetch-captured real status/body/ETag,
// asserted to carry the original ID + SAVE_NOTE + SAVE_THINKING BEFORE any
// mutation, per the cloud-remediation rule that a loading indicator is not
// proof of capture) is released LAST.
// Asserted AFTER release: new draft survives byte-exact; old queue DROPPED
// (phase null, lockedId null) with NO lock on the new draft (editable again —
// existing semantics); seam.apply zero times; no done/detail/error/status
// copy; no navigation (route stays 'selection'); no local mock/counter/
// savedIds write; no new POST beyond the original single commit; original
// cloud record unchanged (200, original note, usage 1); the NEW draft ID is
// 404 in the emulator store — the replacement draft was never uploaded.
// Existing-correct proof of the pinned controller guard: expected GREEN first
// attempt, no manufactured RED, no new reconciliation UX or product policy.
// Derived harness = EXACT immutable two-append harness (246e5094… = dr1+dd1
// bytes) as the FULL prefix + THIS ONE marked EOF append; deleting from this
// BEGIN marker to EOF reproduces that prefix byte-exact. No generator/wrapper/
// source-map family; base harness untouched; runner registration filename-only
// (unchanged). Production app.js/account-save.js bytes are NEVER modified:
// the hook lives only in this journey's instrumented page response with the
// served prefix verified equal to the pinned production bytes at serve time.
test('account save late receipt new id draft: dr2newiddraft a TEST-ONLY hook replacement of the owned draft with a valid fictional draft under a DISTINCT NEW ID and changed note, staged while the acknowledged original detail receipt is held, is never adopted, marked saved, locked, uploaded or altered by the late valid receipt - the new draft bytes survive exactly, the old queue drops with no lock on the new draft per existing different-draft semantics, no success/detail/navigation/debit occurs, the original cloud record keeps its original note with one debit, and the new draft id is a real 404 in the emulator store',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fresh account starts at usage 0');
 const {p,rec}=await openPage(1440);
 // TEST-ONLY append-only lifecycle hook (dr1-proven pattern, adapted as a NEW
 // separately named function): a verified production-prefix app.js response
 // with THIS suffix appended in the page route only. Unlike the dr1 same-ID
 // hook, this fixture REQUIRES a distinct new id — a replacement keeping the
 // stable id is refused, so the two hooks cannot be confused. NOT a user-UI
 // capability; the pending editor is intentionally read-only.
 const hook='\n// TEST ONLY: lifecycle fixture, never written to production app.js\nwindow.__uicNewIdDraftReplacementTestHook=true;\nwindow.__uicReplaceDraftWithDifferentIdFictionalDraft=(d)=>{if(!state.draft)throw Error(\'fixture: no draft under test\');if(!d||typeof d!==\'object\'||typeof d.id!==\'string\'||!d.id)throw Error(\'fixture: replacement draft needs an id\');if(d.id===state.draft.id)throw Error(\'fixture: replacement must use a distinct NEW id (the same-ID hook is a different fixture)\');const next={...state,draft:d};if(!persist(next))throw Error(\'fixture persist denied\');render();};\n';
 await fs.writeFile(new URL('dr2-test-only-hook.js.txt',out),hook);
 const originalServed=await (await fetch(base+'/app.js')).text();
 const prefixSha=sha(Buffer.from(originalServed));
 assert.equal(prefixSha,APP_PIN,'instrumented serving requires the verified production app.js prefix');
 await p.route('**/app.js',async route=>{
  const response=await route.fetch();
  const text=await response.text();
  assert.equal(sha(Buffer.from(text)),APP_PIN,'the instrumented response prefix must equal the pinned production app.js bytes');
  await route.fulfill({response,body:text+hook});
 });
 await p.reload();
 assert.equal(await p.evaluate(()=>window.__uicNewIdDraftReplacementTestHook===true),true,'the test-only hook must be live in the instrumented page');
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'save seam and module must be live for the different-ID replacement journey');
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 const NEW_DRAFT_ID=randomUUID();
 assert.notEqual(NEW_DRAFT_ID,id,'the fixture replacement ID is distinct from the submitted stable ID');
 const NEW_NOTE='Different-ID fictional draft 9q4 staged by the TEST-ONLY hook while the original receipt is held; not reachable through the supported UI';
 const hold={};
 await holdFirstDetailGet(p,hold);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'held-GET capture must succeed: '+hold.error);
 // Original response PROVEN before any replacement (never release a hold that
 // captured nothing): actual 200 carrying the original committed content.
 assert.equal(hold.receipt.status,200,'the held original detail GET actually returned 200 upstream');
 const heldMock=hold.receipt.body&&hold.receipt.body.mock;
 assert.ok(heldMock&&heldMock.id===id&&heldMock.note===SAVE_NOTE,'the held receipt carries the original stable ID and committed note');
 assert.ok((heldMock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the held receipt carries the original thinking review');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'exactly one acknowledged real 201 created:true used:1 POST');
 // The pending lock makes ordinary mutation INTENTIONALLY unavailable:
 // readOnly field + lock note present. The replacement below is therefore a
 // labelled TEST-ONLY hook manipulation, not a user-UI journey.
 const stPending=await saveState(p);
 assert.equal(stPending.phase,'pending','the queue is pending while the detail receipt is held');
 assert.equal(stPending.lockedId,id,'the queue owns the original submitted identity before replacement');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),true,'ordinary typing is intentionally blocked on the locked submitted draft before the TEST-ONLY replacement');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),1,'the read-only lock note is present before the TEST-ONLY replacement');
 const draftPre=await localDraft(p);
 assert.equal(draftPre.draft.id,id);assert.equal(draftPre.draft.note,SAVE_NOTE,'the owned draft still carries the original bytes before the hook replacement');
 const newDraft={...draftPre.draft,id:NEW_DRAFT_ID,note:NEW_NOTE};
 assert.notEqual(JSON.stringify(newDraft).length,0,'the replacement is a full valid fictional draft object');
 const newBytes=JSON.stringify(newDraft);
 await p.evaluate(d=>window.__uicReplaceDraftWithDifferentIdFictionalDraft(d),newDraft);
 await settle(500);
 const duringHook=await localDraft(p);
 assert.equal(JSON.stringify(duringHook.draft),newBytes,'the durable draft carries the TEST-ONLY different-ID replacement while the original receipt is still held');
 assert.equal(duringHook.draft.id,NEW_DRAFT_ID);assert.notEqual(duringHook.draft.id,id,'the live draft ID differs from the queued submission ID');
 const stDuring=await saveState(p);
 assert.equal(stDuring.phase,'pending','the queue stays pending with the receipt held while a different-ID draft is live');
 assert.equal(stDuring.lockedId,id,'the queue still owns the ORIGINAL submission identity, not the replacement ID');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'no success at the replacement moment');
 await fs.writeFile(new URL('dr2-held-get-receipt.json',out),JSON.stringify({stableId:id,newDraftId:NEW_DRAFT_ID,detailReceipt:{status:hold.receipt.status,body:hold.receipt.body},commitAcks:obs.commits,replacedDraftBytes:newBytes,hookNote:'TEST-ONLY different-ID replacement via verified-prefix instrumented app.js suffix; refuses same-ID payloads; not supported by the user UI'},null,2));
 await shot(p,'shot-1440-account-save-dr2-new-id-draft-held.png');
 // Release the EXACT original response LAST; the late continuation runs now.
 await hold.release();
 await settle(1500);
 // Existing different-draft drop semantics: guard(queued) false (ID mismatch),
 // ownsDraft false so the committed RESUME_PENDING branch is NOT taken,
// seam.apply never called, queue invalidated + re-rendered silently. The new
// draft is never adopted by the old queue: it survives byte-exact, editable
// again (no stale lock keyed to the new ID), with zero application effects.
 const late=await localDraft(p);
 assert.equal(JSON.stringify(late.draft),newBytes,'the late valid original receipt must not change a single byte of the different-ID replacement draft');
 assert.equal(late.draft.id,NEW_DRAFT_ID,'the replacement draft keeps its distinct new ID');
 assert.equal(late.draft.note,NEW_NOTE,'the replacement draft keeps its changed note');
 assert.equal(late.route,'selection','the drop navigates nowhere: the view stays on the original selection route');
 assert.deepEqual((await readAckAcks(p)),[],'the dropped late receipt applies zero times at the seam (the replacement draft is never marked saved)');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'a late original receipt must never claim success over the different-ID draft');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'a late original receipt must never open the account full detail');
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'the different-draft drop clears the save feedback region (no stale pending/error line)');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'the pending line must not survive the drop');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'no read-only lock note survives the drop');
 const stAfter=await saveState(p);
 assert.equal(stAfter.phase,null,'the original queue is dropped per existing different-draft semantics (guard false, ownsDraft false, committed RESUME_PENDING branch not taken)');
 assert.equal(stAfter.lockedId,null,'no locked submission survives the drop and no lock attaches to the new draft ID');
 assert.equal(await p.locator('#note').evaluate(el=>el.readOnly),false,'the replacement draft is editable again: the dropped receipt left no lock on the different-ID draft');
 assert.deepEqual(late.mocks,[]);assert.equal(late.used,0);assert.deepEqual(late.savedIds,[]);
 // Cloud readback: the ORIGINAL commit stands unchanged with its original
 // content and exactly one debit; the NEW-ID draft was never uploaded (404).
 await clearHeldDetailGet(p);
 await clearCommitObserver(p);
 const gotItem=await directItem(acct.token,id);
 assert.equal(gotItem.status,200,'the original account commit remains in the emulator store (never cancelled by the dropped receipt)');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id,'the cloud record keeps the original stable ID');
 assert.equal(itemJson.mock.note,SAVE_NOTE,'the cloud record keeps the ORIGINAL committed note, not the replacement draft');
 assert.ok((itemJson.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'the cloud record keeps the original thinking review');
 const newItem=await directItem(acct.token,NEW_DRAFT_ID);
 assert.equal(newItem.status,404,'direct HTTP proof: the different-ID replacement draft was never committed to the cloud');
 assert.equal(await directUsage(acct.token),1,'exactly one server debit across the whole journey');
 assert.equal(obs.commits.length,1,'exactly one actual POST reached the commit route');
 assert.equal(hold.calls.length,1,'the first detail GET was intercepted and held exactly once; the late release is that same delivery');
 checkClean(rec,'dr2');
 await fs.writeFile(new URL('dr2-late-receipt-new-id-draft-receipt.json',out),JSON.stringify({stableId:id,newDraftId:NEW_DRAFT_ID,productionPrefixAppSha:prefixSha,hookSuffixSha:sha(Buffer.from(hook)),instrumentedResponseSha:sha(Buffer.from(originalServed+hook)),ordinaryTypingBlockedAtReplacement:true,replacedDraftBytesSha:sha(Buffer.from(newBytes)),draftBytesShaAfterRelease:sha(Buffer.from(JSON.stringify(late.draft))),newIdDirectItemStatus:newItem.status,ackAcksAtEnd:await readAckAcks(p),phaseAfterDrop:stAfter.phase,lockedIdAfterDrop:stAfter.lockedId,commitAcks:obs.commits,usageAtEnd:await directUsage(acct.token),itemNoteAtEnd:itemJson.mock.note,coverageNote:'dr2 reaches the late-valid-receipt vs DIFFERENT-ID replacement-draft ownership seam with an explicitly labelled TEST-ONLY hook (new function that refuses same-ID payloads; the dr1 same-ID hook is untouched); existing drop semantics verified — replacement bytes exact, old queue dropped with no lock on the new draft, zero apply/success/detail/navigation/debit, original cloud record unchanged, new ID real 404; no new product policy or reconciliation UX'},null,2));
 await shot(p,'shot-1440-account-save-dr2-new-id-draft-retained.png');
});
// ── END ui-cloud-account-save-late-receipt-new-id-draft-append ──
// ── BEGIN ui-cloud-account-save-first-milestone-feedback-append ──
// fm1firstmilestone: FIRST account-save milestone acknowledgement under the
// EXISTING unchanged estimated-score.js mockSaveFeedback helper policy
// (account-save-first-vertical-contract.md item 16). The helper is the
// authoritative feedback policy: server ack.used drives first/second
// milestones (never browser counters), true-created is presented only after a
// successful commit+detail+cleanup apply, prior summaries stay transient
// account-only inputs, no cloud/local mixing, replay or foreign feedback. The
// current account path (app.js accountSaveApply ~316) shows only the generic
// transient data-account-save="done" line and NEVER records the ack through
// recordMockAcknowledgement, so no milestone feedback renders. This is a
// genuine behavioral RED against the UNCHANGED production bytes: a fresh
// fictional emulator account, the proven real-UI saveJourneys draft, real
// native 'Log mock' confirmation, the ACTUAL 201 created:true used:1 passed
// through unmodified by the commit observer, the real detail receipt carrying
// the ORIGINAL note/review, draft cleared only after the released receipt, and
// the exact expected first-save copy DERIVED at test time by invoking the
// unchanged helper on transient account-only inputs (before: fresh account
// usage 0 proven by direct HTTP; next: the ONE acknowledged commit) — never a
// hand-written new string. The no-milestone state is observed while the actual
// detail response is held, the retained receipt and screenshots are written
// BEFORE the final missing-feedback assertion, and the target is the existing
// renderer's LEAF (#mock-acknowledgement with data-feedback-kind="first"),
// not the aggregated #messages container. No production, backend, helper or
// domain edits; second-save and PB comparison are later sequential phases.
// Derived harness = the immutable ui-cloud-account-save-late-receipt-owner
// ship-variants bytes (37d3e972207d0c2a35c3a10a9d6c85d0042a3c7bb33f2fef76cf
// 1aeed199c7de) as the FULL prefix plus THIS ONE marked EOF append: deleting
// everything from this BEGIN marker to EOF reproduces that prefix byte-exact
// (inverse proof in the run evidence). Runner change is filename-only
// allowlist registration (byte-exact inverse proven). No generator/wrapper/
// source-map family; base harnesses untouched.
test('account save first milestone feedback: fm1firstmilestone a fresh confirmed account save whose real 201 created:true used:1 acknowledgement commits through the unchanged observer shows NO mockSaveFeedback first-milestone leaf while the real detail receipt is held, then clears the draft only after the released receipt, opens the ACTUAL detail with the original note and review, keeps the generic done line, leaves every browser-local slice untouched and applies exactly once - and the missing-product assertion: the unchanged estimated-score.js helper-derived FIRST-SAVE acknowledgement must render exactly once on its own accessible leaf with the exact derived copy',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fm1 fixture: fresh fictional emulator account starts at usage 0');
 // Unchanged feedback POLICY module, imported READ-ONLY for derivation. No
 // production byte is modified by this import.
 const {mockSaveFeedback:helperFeedback}=await import('./estimated-score.js');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm1: save seam and module must be live for the first-milestone journey');
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs); // passthrough: the ACTUAL 201 reply is delivered unchanged
 const id=await saveJourneys(p); // proven real score -> selection -> review journey
 const hold={};
 // Own labelled hold (the immutable prefix holdFirstDetailGet pass-through
 // branch drops the server ETag, which the unchanged mock client's
 // validVersion(etag) rejects on the follow-up openSaved detail GET - attempt-1
 // harness artifact, raw output preserved). Semantics are identical to the
 // prefix helper EXCEPT every branch preserves status AND etag.
 {let resolveReady;hold.calls=[];hold.receipt=null;hold.ready=new Promise(r=>{resolveReady=r;});hold.error=null;
 await p.route(REC_ITEM,async route=>{
  const url=route.request().url();
  hold.calls.push(url);
  if(hold.receipt===null){
   try{
    const resp=await route.fetch();
    const text=await resp.text();
    let body=null;try{body=JSON.parse(text);}catch{}
    hold.receipt={status:resp.status(),body,text,headers:resp.headers()};
    resolveReady();
   }catch(e){hold.error=String(e&&e.message||e);resolveReady();}
   await new Promise(r=>{hold.release=()=>r();});
   if(hold.error)await route.abort().catch(()=>{});
   else await route.fulfill({status:hold.receipt.status,headers:{'content-type':'application/json; charset=utf-8','etag':hold.receipt.headers.etag},body:hold.receipt.text}).catch(()=>{});
   return;
  }
  const resp=await route.fetch();
  const text=await resp.text();
  const h2={'content-type':'application/json; charset=utf-8'};
  if(resp.headers().etag)h2.etag=resp.headers().etag;
  await route.fulfill({status:resp.status(),headers:h2,body:text});
 });}
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click(); // real native confirmation
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('fm1 harness: first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'fm1: held-GET capture must succeed: '+hold.error);
 // The ACTUAL acknowledged commit, observed unmodified by the observer.
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'fm1: exactly one real 201 created:true used:1 POST (server-authoritative first usage)');
 // The real detail receipt carries the ORIGINAL content before anything applies.
 assert.equal(hold.receipt.status,200,'fm1: the held original detail GET actually returned 200 upstream');
 const heldMock=hold.receipt.body&&hold.receipt.body.mock;
 assert.ok(heldMock&&heldMock.id===id&&heldMock.note===SAVE_NOTE,'fm1: the held receipt carries the original stable ID and committed note');
 assert.ok((heldMock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'fm1: the held receipt carries the original thinking review');
 // DERIVE the exact expected first-save feedback from the UNCHANGED helper on
 // transient account-only inputs (never merged into local state): before = the
 // proven fresh-account zero ledger; next = the ONE acknowledged commit at the
 // ACTUAL server used value.
 const beforeLedger={mocks:[],used:0,savedIds:[]};
 const nextLedger={mocks:[heldMock],used:obs.commits[0].body.used,savedIds:[id]};
 const expected=helperFeedback(beforeLedger,nextLedger,id);
 assert.ok(expected&&expected.kind==='first'&&typeof expected.text==='string'&&expected.text.length>0,'fm1 fixture: the unchanged mockSaveFeedback helper derives a first-milestone acknowledgement for this exact acknowledged transition (server used:1 on a fresh account)');
 // WHILE THE ACTUAL RESPONSE IS HELD: no milestone leaf and no completed
 // feedback at all (nothing has applied yet).
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm1: no acknowledgement leaf may render while the actual detail receipt is still held');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm1: no completed-save feedback before the released receipt');
 const heldStored=await localDraft(p);
 assert.ok(heldStored.draft,'fm1: the draft is still present while the receipt is held');
 assert.equal(heldStored.used,0,'fm1: the browser-local counter is untouched during the hold');
 await shot(p,'shot-1440-account-save-fm1-held-pending.png');
 // Release the exact original response LAST.
 await hold.release();
 // Release complete: the route is removed so no interception affects the
 // follow-up openSaved reads; the held exact response was already delivered.
 await clearHeldDetailGet(p);
 await settle(1500);
 // Existing completed-save behavior (accepted, unchanged): done line + ACTUAL
 // detail + draft cleared only after the receipt + zero local mixing.
 const done=p.locator('[data-account-save="done"]');
 assert.equal(await done.count(),1,'fm1: the existing generic done acknowledgement renders exactly once');
 assert.equal((await done.textContent()),SAVE_DONE,'fm1: the done line keeps the accepted existing copy');
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'fm1: the detail is the actual saved record by literal id');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'fm1: full detail shows the original note and review text');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'fm1: the unchanged original draft is cleared only after the successful receipt');
 assert.deepEqual(stored.mocks,[],'fm1: no cloud record may merge into state.mocks');
 assert.equal(stored.used,0,'fm1: the browser-local counter must stay untouched');
 assert.deepEqual(stored.savedIds,[],'fm1: savedIds must stay untouched');
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1}],'fm1: the true-created ack arrives at the apply seam exactly once (no replay)');
 const st=await saveState(p);
 assert.equal(st.phase,null,'fm1: the queue completed and cleared');
 checkClean(rec,'fm1');
 // Cloud readback over real HTTP: one debit, original content retained.
 await clearHeldDetailGet(p);
 await clearCommitObserver(p);
 const gotItem=await directItem(acct.token,id);
 assert.equal(gotItem.status,200,'fm1: the committed record actually exists in the emulator store');
 const itemJson=await gotItem.json();
 assert.equal(itemJson.mock.note,SAVE_NOTE,'fm1: the cloud record keeps the ORIGINAL note');
 assert.ok((itemJson.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'fm1: the cloud record keeps the original thinking review');
 assert.equal(await directUsage(acct.token),1,'fm1: exactly one server debit across the whole journey');
 // RETAIN the evidence BEFORE the missing-feedback assertion.
 const milestone=p.locator('#mock-acknowledgement[data-feedback-kind="first"]');
 const firstCount=await milestone.count();
 const firstText=firstCount>0?(await milestone.first().innerText()).replace(/\s+/g,' ').trim():null;
 const ackLeafTotal=await p.locator('#mock-acknowledgement').count();
 await fs.writeFile(new URL('fm1-first-milestone-feedback-receipt.json',out),JSON.stringify({stableId:id,actualCommitAck:obs.commits,heldDetailStatus:hold.receipt.status,derivedExpectedFeedback:{kind:expected.kind,text:expected.text,record:expected.record},doneLinePresent:true,doneText:await done.textContent(),detailId:id,ackAcksAtEnd:await readAckAcks(p),phaseAfterCompletion:st.phase,localSlices:{mocks:stored.mocks.length,used:stored.used,savedIds:stored.savedIds.length},firstLeafCount:firstCount,firstLeafText:firstText,ackLeafTotal,usageAtEnd:await directUsage(acct.token),itemNoteAtEnd:itemJson.mock.note,coverageNote:'fm1 reaches the successful first account-save acknowledgement seam with the ACTUAL 201 created:true used:1 through the unchanged passthrough observer; all existing completed-save guarantees re-proven (done line, ACTUAL detail with original note/review, draft cleared only after the released receipt, zero local mixing/replay, one debit); the expected first-milestone copy is DERIVED from the unchanged estimated-score.js helper on transient account-only inputs, never hand-written; the assertion below is the MISSING-PRODUCT feedback, not a parser/selector/setup fault'},null,2));
 await shot(p,'shot-1440-account-save-fm1-completed-no-milestone.png');
 // ── THE MISSING-PRODUCT ASSERTION (expected genuine RED): the existing
 // helper's first-save acknowledgement is never recorded or rendered by the
 // account-save path; the unchanged app.js records it only through the
 // browser-local persistScore seam, so this leaf is absent after an ACCOUNT
 // save. Asserted on the existing renderer's OWN LEAF (never the aggregated
 // #messages container), exactly once, with the exact derived copy.
 assert.equal(ackLeafTotal,1,'fm1 RED: exactly one acknowledgement leaf must exist after the first successful account save (no missing, duplicated or foreign feedback)');
 assert.equal(firstCount,1,`fm1 RED: the successful first account save must show the existing mockSaveFeedback FIRST-MILESTONE acknowledgement on its accessible leaf data-feedback-kind="first"; derived expected copy: ${JSON.stringify(expected.text)}`);
 assert.equal(firstText,expected.text.replace(/\s+/g,' ').trim(),'fm1 RED: the first-milestone leaf must carry the exact helper-derived copy (unchanged policy, no new strings)');
});
// ── END ui-cloud-account-save-first-milestone-feedback-append ──
// ── BEGIN ui-cloud-account-save-first-milestone-no-replay-append ──
// fm2firstacknoreplay: the ONE focused first-ack no-replay safeguard, appended
// AFTER the fm1 GREEN on the repaired production bytes. The fm1 slice proved
// the FIRST account-save milestone leaf renders exactly once with the exact
// unchanged-helper-derived copy after the actual 201 created:true used:1
// receipt. This slice proves the reference is CONSUMED, never replayed: after
// the render, the supported Home departure (a full app rerender), the
// supported History re-entry (fresh list load + rerender), and the supported
// Open reopen of the same saved record (fresh actual 200 detail, same literal
// id, server usage still exactly 1) must all show NO first leaf again, while a
// SECOND real save (created:true used:2) shows NO first leaf either — the
// milestone is bound to the first save only, never replayed or reused for a
// foreign/later record. Second/PB positive feedback is deliberately NOT
// implemented in this slice; asserting its absence is truthful scope, not
// overclaim. All checks are meaningful-state/counter deltas, never vacuous
// no-ops: the first leaf count moves 1 → 0 while the record demonstrably
// stays live (reopen 200 with the original content at usage 1; direct server
// usage 1 before and exactly 2 after the second save). Inputs stay transient
// account-only; browser-local mock/usage/savedIds slices stay provably
// untouched. Derived harness = the GREEN fm1 harness bytes
// (fd582e2c7fd859e02326b9507ffd256f89250c67d143569543cf90aa4f7a0ae9) as the
// FULL prefix plus THIS ONE marked EOF append; deleting from this BEGIN marker
// to EOF reproduces that prefix byte-exact (proof in the run evidence). No
// generator/wrapper/source-map family, base harnesses untouched. Runner change
// is filename-only allowlist registration with byte-exact inverse proof.
test('account save fm2 no replay: fm2firstacknoreplay after the fm1-proven single first-milestone render, the supported Home departure rerender, History re-entry and the supported Open reopen of the same literal record (actual 200 detail, original content, unchanged usage 1) show NO first leaf again, the first ack applied exactly once at the seam, browser-local slices stay untouched, and a second real account save (201 created:true used:2, usage 1 to 2) shows NO first leaf either - no replay, no foreign reuse, no indefinite feedback state',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fm2 fixture: fresh fictional emulator account starts at usage 0');
 const {mockSaveFeedback:helperFeedback}=await import('./estimated-score.js');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm2: save seam and module must be live for the no-replay journey');
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p);
 // Own labelled hold (same GREEN-proven semantics as the fm1 append: every
 // branch preserves status AND etag; the immutable prefix pass-through branch
 // drops the server ETag — a known harness artifact, not a product defect).
 // First item GET is held and captured; later GETs pass the actual bytes
 // through unchanged.
 const hold={};
 {let resolveReady;hold.calls=[];hold.receipt=null;hold.ready=new Promise(r=>{resolveReady=r;});hold.error=null;
 await p.route(REC_ITEM,async route=>{
  const url=route.request().url();
  hold.calls.push(url);
  if(hold.receipt===null){
   try{
    const resp=await route.fetch();
    const text=await resp.text();
    let body=null;try{body=JSON.parse(text);}catch{}
    hold.receipt={status:resp.status(),body,text,headers:resp.headers()};
    resolveReady();
   }catch(e){hold.error=String(e&&e.message||e);resolveReady();}
   await new Promise(r=>{hold.release=()=>r();});
   if(hold.error)await route.abort().catch(()=>{});
   else await route.fulfill({status:hold.receipt.status,headers:{'content-type':'application/json; charset=utf-8','etag':hold.receipt.headers.etag},body:hold.receipt.text}).catch(()=>{});
   return;
  }
  const resp=await route.fetch();
  const text=await resp.text();
  const h2={'content-type':'application/json; charset=utf-8'};
  if(resp.headers().etag)h2.etag=resp.headers().etag;
  await route.fulfill({status:resp.status(),headers:h2,body:text});
 });}
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('fm2 harness: first detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'fm2: held-GET capture must succeed: '+hold.error);
 await hold.release();
 await clearHeldDetailGet(p);
 await settle(1500);
 // THE PROVEN GREEN STATE (fm1 re-established as the precondition here, so
 // the no-replay assertions are anchored on the milestone ACTUALLY having
 // rendered, not on an always-absent leaf):
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'fm2: exactly one real 201 created:true used:1 POST for the first save');
 assert.equal(hold.receipt.status,200,'fm2: the first detail receipt is a real 200');
 const heldMock=hold.receipt.body&&hold.receipt.body.mock;
 assert.ok(heldMock&&heldMock.id===id&&heldMock.note===SAVE_NOTE,'fm2: the first detail receipt carries the original stable ID and note');
 const expected=helperFeedback({mocks:[],used:0,savedIds:[]},{mocks:[heldMock],savedIds:[id],used:1},id);
 assert.ok(expected&&expected.kind==='first'&&expected.record===false,'fm2 fixture: the unchanged helper derives the first-milestone acknowledgement (record:false) for this exact transition');
 const milestone=p.locator('#mock-acknowledgement[data-feedback-kind="first"]');
 assert.equal(await milestone.count(),1,'fm2 precondition: the FIRST milestone leaf rendered exactly once after the first save');
 assert.equal((await milestone.first().innerText()).replace(/\s+/g,' ').trim(),expected.text.replace(/\s+/g,' ').trim(),'fm2 precondition: the leaf carries the exact derived copy');
 assert.equal(await directUsage(acct.token),1,'fm2 precondition: server usage is exactly 1 before the re-read checks');
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1}],'fm2: the first ack reached the seam exactly once after the render');
 // SUPPORTED PATH 1: Home departure — a full app rerender on a non-history
 // route. The consumed leaf must not exist; nothing may carry it over.
 await p.locator('nav [data-act="home"]').click();
 await p.waitForSelector('[data-act="log"]',{timeout:15000});
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm2 NO-REPLAY: the Home rerender shows no first leaf (consumed reference never re-renders)');
 // SUPPORTED PATH 2: History re-entry — fresh app rerender on the history
 // route plus a fresh account list load. No first leaf, no done-line replay.
 await p.locator('nav [data-act="history"]').click();
 await p.waitForSelector('[data-account-history="row"]',{timeout:15000});
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm2 NO-REPLAY: History re-entry never re-renders the consumed first acknowledgement');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm2: the consumed done line never replays on re-entry (existing one-shot semantics retained)');
 // SUPPORTED PATH 3: Open the SAME saved record — a fresh actual 200 detail
 // GET for the same literal id at unchanged server usage 1 (proves the record
 // is live; the absence below is meaningful, not vacuous).
 await p.locator('[data-account-history="open"]').first().click();
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'fm2: the reopen shows the same literal saved record');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'fm2: the reopened detail keeps the original note and review content');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm2 NO-REPLAY: reopening the same record never re-renders the first acknowledgement');
 assert.equal(await directUsage(acct.token),1,'fm2: reopen performed no server debit — usage is still exactly 1');
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1}],'fm2: across every supported re-read the first ack still applied at the seam exactly once');
 const st=await saveState(p);
 assert.equal(st.phase,null,'fm2: the first queue stayed completed and cleared through the re-reads');
 // Browser-local slices remain untouched through all of it:
 const stored=await localDraft(p);
 assert.deepEqual(stored.mocks,[],'fm2: no cloud record may merge into state.mocks');
 assert.equal(stored.used,0,'fm2: the browser-local counter must stay untouched');
 assert.deepEqual(stored.savedIds,[],'fm2: savedIds must stay untouched');
 // A SECOND real save from the supported Home entry: no first leaf for a
 // later record — the milestone belongs to the first save only.
 await p.locator('nav [data-act="home"]').click();
 await p.waitForSelector('[data-act="log"]',{timeout:15000});
 const id2=await saveJourneys(p);
 assert.notEqual(id2,id,'fm2 fixture: the second save is a new draft identity');
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 // Wait for the second save to FULLY apply (done line + actual detail of the
 // NEW record) before asserting leaf absence, so the no-replay check is
 // against a settled state, not a race with a still-pending apply.
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id2,'fm2: the second detail is the new literal record');
 assert.equal(obs.commits.length,2,'fm2: the second save performed exactly one additional real commit POST');
 assert.deepEqual(obs.commits[1],{status:201,body:{created:true,id:id2,used:2}},'fm2: the second ack is a real 201 created:true used:2 (NOT a first-milestone receipt)');
 assert.equal(await milestone.count(),0,'fm2 NO-REPLAY (kind-first supersession, authorized by the accepted second-milestone feedback + fm10/fm11 acceptance): the second save never replays the first-save acknowledgement leaf');
 assert.equal(await directUsage(acct.token),2,'fm2: server usage moved exactly 1 → 2 with the second save (meaningful counter delta)');
 assert.equal((await p.locator('[data-account-history="detail"]').count()),1,'fm2: the second save still completes the existing journey (its actual detail opened)');
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id2,'fm2: the second detail is the new literal record');
 const stored2=await localDraft(p);
 assert.deepEqual(stored2.mocks,[],'fm2: browser mocks remain untouched after the second save');
 assert.equal(stored2.used,0,'fm2: browser counter remains untouched after the second save');
 assert.deepEqual(stored2.savedIds,[],'fm2: browser savedIds remain untouched after the second save');
 await clearCommitObserver(p);
 checkClean(rec,'fm2');
 // Truthful coverage limit: controlled-loss created:false silence, the
// cleanup-failure retained-ack presentation, and second/PB positive feedback
// are a FURTHER separately sequenced slice, NOT tested or claimed here.
 await fs.writeFile(new URL('fm2-first-ack-noreplay-receipt.json',out),JSON.stringify({stableId:id,secondStableId:id2,actualCommits:obs.commits,reopenDetailId:id,reopenUsageBetween:1,derivedExpectedFirst:{kind:expected.kind,text:expected.text,record:expected.record},firstLeafAfterRender:1,firstLeafAfterHome:0,firstLeafAfterHistoryReentry:0,firstLeafAfterReopen:0,firstLeafAfterSecondSave:0,ackAppliesAfterReopens:1,secondDetailId:id2,localSlicesAfterSecond:{mocks:stored2.mocks.length,used:stored2.used,savedIds:stored2.savedIds.length},usageAtEnd:await directUsage(acct.token),coverageNote:'fm2 re-proves the fm1 single first render as a precondition, then asserts no replay through the supported Home departure rerender, History re-entry, the supported Open reopen (actual 200, same literal id, original content, usage still exactly 1), and a second real created:true used:2 save with leaf 1 to 0 and usage 1 to 2; browser-local slices untouched; second/PB positive feedback, controlled created:false silence and cleanup-failure retained-ack presentation are explicitly UNTESTED later slices'},null,2));
 await shot(p,'shot-1440-account-save-fm2-no-replay.png');
});
// ── END ui-cloud-account-save-first-milestone-no-replay-append ──
// ── BEGIN ui-cloud-account-save-first-milestone-lost-ack-append ──
// fm3lostackfirstsilence: the ONE focused lost-acknowledgement FIRST-safeguard
// slice, appended AFTER the accepted fm1/fm2 GREEN on the unchanged production
// bytes. Derived harness = the immutable 6c25f44a… first-milestone-no-replay
// bytes as the FULL prefix plus THIS ONE marked EOF append; deleting everything
// from this BEGIN marker to EOF reproduces that prefix byte-exact (inverse
// proof in the run evidence). Runner change is filename-only allowlist
// registration with byte-exact inverse proof. All inherited assertions preserved
// unchanged; no generator/wrapper/source-map family; no production, backend,
// helper or domain edit. Second/PB positive feedback remains a later slice.
// Fixture labelling (explicit, never a backend-outage claim): the existing
// armLostAckCommit helper intercepts with route.fetch() so the ORIGINAL commit
// ACTUALLY reaches the server; the harness asserts the real 201 created:true
// used:1 acknowledgement AND direct actual-HTTP item+usage readbacks (recorded
// strictly BEFORE any replacement fulfilment in proofs.receipt.events), then a
// controlled malformed 503 replaces only the browser-visible acknowledgement.
// Purpose: prove a proven-but-UNSEEN upstream first-save ack must NEVER
// fabricate a FIRST-milestone celebration — not while the outcome is uncertain,
// not after the real stable-ID keyboard Retry is answered created:false. The
// leaf absence is MEANINGFUL: the unchanged estimated-score.js helper is invoked
// read-only at test time on the proven readback store content and still derives
// kind:'first' for that exact transition, so silence is product behavior, not a
// vacuous no-leaf fixture state.
test('account save fm3 lost ack: fm3lostackfirstsilence when a real 201 created:true used:1 first commit is followed by a lost acknowledgement the UI shows the truthful cannot-confirm uncertainty with NO first-milestone leaf while the actual upstream ack and direct HTTP readbacks are proven before the controlled replacement, retains the exact stable ID and payload, then the real keyboard Retry through the same cancel-safe dialog re-sends the identical commit answered by the actual 200 created:false used:1, completes the actual detail and draft cleanup with the generic done line intact, and STILL shows NO first-milestone leaf - no replay, no false celebration from the unseen upstream ack, no extra debit, browser-local slices untouched, clean page errors',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fm3 fixture: fresh fictional emulator account starts at usage 0');
 const {mockSaveFeedback:helperFeedback}=await import('./estimated-score.js');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm3: save seam and module must be live for the lost-ack first-silence journey');
 await wrapSaveApplyObserver(p);
 const id=await saveJourneys(p);
 const proofs={};
 await armLostAckCommit(p,proofs,id,acct.token);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 // Fixture proof BEFORE any UI claim: the original commit ACTUALLY committed
 // upstream with the real first-save acknowledgement, and the existing helper
 // completed its direct item+usage HTTP readbacks strictly BEFORE the
 // controlled 503 replacement was fulfilled.
 assert.equal(proofs.fixtureError,null,'fm3: lost-ack fixture readback must succeed: '+proofs.fixtureError);
 assert.equal(proofs.upstream&&proofs.upstream.status,201,'fm3 fixture: the ORIGINAL commit request must have actually reached the server and returned 201');
 assert.equal(proofs.upstream.body&&proofs.upstream.body.id,id,'fm3 fixture: the upstream ack carries the expected stable ID');
 assert.equal(proofs.upstream.body&&proofs.upstream.body.created,true,'fm3 fixture: the upstream ack reports created:true');
 assert.equal(proofs.upstream.body&&proofs.upstream.body.used,1,'fm3 fixture: the upstream ack reports the first usage');
 const receiptEvents=(proofs.receipt&&proofs.receipt.events)||[];
 const idxReadItem=receiptEvents.indexOf('direct-http-item-readback:200:id='+id+':note=SAVE_NOTE:reviews=1');
 const idxReadUsage=receiptEvents.indexOf('direct-http-usage-readback:200:used=1');
 const idxReplaced=receiptEvents.indexOf('controlled-503-replacement-fulfilled');
 assert.ok(idxReadItem>=0&&idxReadUsage>=0&&idxReplaced>=0,'fm3: ordered receipt must record both actual readbacks and the replacement: '+JSON.stringify(receiptEvents));
 assert.ok(idxReadItem<idxReplaced&&idxReadUsage<idxReplaced,'fm3: the actual HTTP readbacks must precede the controlled 503 replacement event');
 // UNCERTAIN state: truthful cannot-confirm copy, and NO first-milestone leaf
 // may render while the acknowledgement is unverified — no false celebration.
 const err=await p.locator('[data-account-save="error"]').textContent();
 assert.equal(err,SAVE_RECOVERY_ERR_UNCERTAIN,'fm3: the uncertain outcome states truthfully that the result cannot yet be confirmed');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm3: no acknowledgement leaf of any kind renders while the outcome is uncertain');
 assert.equal(await p.locator('#mock-acknowledgement[data-feedback-kind="first"]').count(),0,'fm3 NO FALSE CELEBRATION: the proven-but-unseen upstream first-save ack must never fabricate the FIRST milestone leaf during uncertainty');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm3: no completed-save feedback before a validated receipt');
 // Meaningful silence: the UNCHANGED helper, invoked read-only on the actual
 // readback store content for this exact fresh-account transition, still
 // derives kind:'first' — the product withholds it, the fixture cannot emit it.
 const gotItem=await directItem(acct.token,id);
 assert.equal(gotItem.status,200,'fm3 fixture: the record actually exists in the emulator store despite the lost ack');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id&&itemJson.mock.note===SAVE_NOTE,'fm3 fixture: the committed store record carries the original stable ID and note');
 assert.ok((itemJson.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'fm3 fixture: the committed store record carries the original thinking review');
 const expected=helperFeedback({mocks:[],used:0,savedIds:[]},{mocks:[itemJson.mock],savedIds:[id],used:1},id);
 assert.ok(expected&&expected.kind==='first'&&expected.record===false,'fm3 fixture: the unchanged helper derives the first-milestone acknowledgement (record:false) for this exact proven transition, so the leaf absence is meaningful silence');
 // Exact stable ID and original payload retained for the re-check.
 const storedUncertain=await localDraft(p);
 assert.equal(storedUncertain.draft&&storedUncertain.draft.id,id,'fm3: the exact stable ID and draft are retained for the re-check');
 assert.deepEqual(storedUncertain.mocks,[]);assert.equal(storedUncertain.used,0);
 assert.equal(await directUsage(acct.token),1,'fm3: the real upstream commit debited exactly once despite the lost ack');
 await shot(p,'shot-1440-account-save-fm3-lost-ack-error-before-retry.png');
 await fs.writeFile(new URL('fm3-lost-ack-uncertainty-receipt.json',out),JSON.stringify({stableId:id,upstreamAck:proofs.upstream,orderedReceiptEvents:receiptEvents,errorCopy:err,firstLeafDuringUncertainty:0,derivedExpectedFirst:{kind:expected.kind,text:expected.text,record:expected.record},usageDuringUncertainty:1,fixtureLabel:'controlled 503 acknowledgement replacement after a REAL route.fetch commit - fault injection, not an observed backend outage'},null,2));
 // REAL keyboard Retry through the same cancel-safe dialog: re-sends the
// identical retained payload; the server actually answers 200 created:false.
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(proofs.calls,2,'fm3: uncertain attempt plus retry — exactly two intercepted commit POSTs');
 assert.equal(proofs.posts[0],proofs.posts[1],'fm3: the retry transmitted the EXACT same stable ID and payload, not newly typed content');
 assert.ok(proofs.posts[0].includes(id)&&proofs.posts[0].includes(SAVE_NOTE)&&proofs.posts[0].includes(SAVE_THINKING),'fm3: the retained snapshot carries the original content');
 assert.equal(proofs.retry&&proofs.retry.status,200,'fm3: the retry reached the server and was actually answered 200 (already committed)');
 assert.equal(proofs.retry.body&&proofs.retry.body.created,false,'fm3: the retry ack is the actual created:false idempotent acknowledgement');
 assert.equal(proofs.retry.body&&proofs.retry.body.used,1,'fm3: the retry reused the same usage, never a second debit');
 // Generic done line intact (accepted existing copy); NO first leaf after the
// created:false recovery either — the consumed-never-replayed safeguard holds
// against a proven-but-unseen upstream ack as well.
 const done=p.locator('[data-account-save="done"]');
 assert.equal(await done.count(),1,'fm3: the existing generic done acknowledgement renders exactly once after the recovery');
 assert.equal((await done.textContent()),SAVE_DONE,'fm3: the done line keeps the accepted existing copy');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm3 NO REPLAY / NO FALSE CELEBRATION: the created:false recovery never renders a first-milestone leaf from the lost original ack');
 assert.equal(await p.locator('#mock-acknowledgement[data-feedback-kind="first"]').count(),0,'fm3 NO REPLAY / NO FALSE CELEBRATION: specifically no data-feedback-kind="first" leaf after the created:false recovery');
 // Actual detail + successful cleanup.
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'fm3: the retry shows the actual saved account detail for the same literal record');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'fm3: the full detail shows the unchanged stored content');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'fm3: the retained draft is cleared only on the successful receipt');
 assert.deepEqual(stored.mocks,[],'fm3: no cloud record may merge into state.mocks');
 assert.equal(stored.used,0,'fm3: the browser-local counter must stay untouched');
 assert.deepEqual(stored.savedIds,[],'fm3: savedIds must stay untouched');
 assert.equal(await directUsage(acct.token),1,'fm3: exactly one server debit total across the lost-ack attempt and the created:false retry — no extra debit');
 assert.deepEqual((await readAckAcks(p)),[{created:false,id,used:1}],'fm3: exactly ONE apply-seam application, carrying the retry\'s actual created:false ack - the lost original ack was never fabricated at the UI');
 const st=await saveState(p);
 assert.equal(st.phase,null,'fm3: the queue completed and cleared');
 checkClean(rec,'fm3');
 await shot(p,'shot-1440-account-save-fm3-lost-ack-retry-no-first.png');
 await fs.writeFile(new URL('fm3-lost-ack-final-receipt.json',out),JSON.stringify({stableId:id,upstreamAck:proofs.upstream,retryAck:proofs.retry,identicalPayloads:proofs.posts[0]===proofs.posts[1],interceptedCommitCalls:proofs.calls,firstLeafDuringUncertainty:0,firstLeafAfterRetry:0,ackAppliesAtSeam:[{created:false,id,used:1}],usageAtEnd:await directUsage(acct.token),localSlices:{mocks:stored.mocks.length,used:stored.used,savedIds:stored.savedIds.length},derivedExpectedFirstForProvenTransition:{kind:expected.kind,record:expected.record},coverageNote:'fm3 proves no FIRST-milestone leaf during the uncertainty or after the real created:false keyboard-retry recovery, with actual 201-ack and direct HTTP readbacks asserted before the controlled 503 replacement; cleanup/reload-specific and second/PB positive feedback remain later separately sequenced slices'},null,2));
});
// ── END ui-cloud-account-save-first-milestone-lost-ack-append ──
// ── BEGIN ui-cloud-account-save-first-milestone-denied-cleanup-append ──
// fm4cleanupdeniedfirstleaf: the ONE focused denied-cleanup retained-ack
// FIRST-feedback safeguard, appended AFTER the accepted fm1/fm2/fm3 GREEN on
// the unchanged accepted production bytes. Derived harness = the immutable
// bc99d5d1ce78b19a9a48abe3b9632f35c676bfc0d43a824e04d377faa2dfa9fa
// first-milestone-lost-ack bytes as the FULL prefix plus THIS ONE marked EOF
// append; deleting everything from this BEGIN marker to EOF reproduces that
// prefix byte-exact (inverse proof in the run evidence). Runner change is
// filename-only allowlist registration with byte-exact inverse proof. All
// inherited assertions preserved unchanged; no generator/wrapper/source-map
// family; no production, backend, helper or domain edit.
// Purpose (existing-correct proof convention — an implemented-behavior
// coverage on the accepted bytes, NOT a manufactured RED): when a REAL first
// commit returns 201 created:true used:1 AND the detail read is a real 200,
// but the browser-local draft-cleanup persist is denied via the EXISTING
// accepted key-scoped Storage shim (armCleanupDenial, reused verbatim):
// 1. the UI shows ONLY the true saved-but-cleanup-pending copy
//    (SAVE_ERR_CLEANUP), with NO acknowledgement leaf of any kind and NO
//    generic done line while cleanup fails — including after a repeated
//    keyboard Retry with the denial still armed (the deny path returns before
//    the cleanup-success-only FIRST derivation, so the leaf absence is
//    product behavior proven by the unchanged helper deriving kind:'first'
//    read-only on the actual store content);
// 2. the ORIGINAL true-created acknowledgement is retained at the seam
//    (readAckAcks), the exact stable-ID draft is retained, browser-local
//    mocks/used/savedIds slices are untouched, and there is EXACTLY ONE POST
//    and ONE server debit across every denied attempt;
// 3. after releasing the local denial, an explicit keyboard Retry completes
//    ONLY the cleanup while carrying the SAME retained true-created ack, and
//    THEN the unchanged-helper-derived FIRST leaf renders exactly once beside
//    the generic done line, the actual detail shows the original text, the
//    draft is cleared, and zero new POST/debit occurs.
// The error presentation is screenshotted BEFORE Retry; the successful leaf
// is screenshotted after recovery. This slice makes no reload claim — an
// actual page.reload safeguard is a later separately sequenced slice (fm5).
test('account save fm4 denied cleanup: fm4cleanupdeniedfirstleaf when a real 201 created:true used:1 first commit with an actual 200 detail is followed by a denied browser-local draft-cleanup persist the UI shows ONLY the saved-but-cleanup-pending copy with NO acknowledgement leaf and NO generic done line (including after a repeated keyboard Retry while still denied), retains the original true-created ack at the seam and the exact stable-ID draft with zero new POST and one debit, then releasing the denial and an explicit keyboard Retry completes only the cleanup with the SAME retained ack, renders the unchanged-helper-derived FIRST leaf exactly once plus the generic done line, opens the actual detail with the original text, clears the draft, and performs no new commit',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fm4 fixture: fresh fictional emulator account starts at usage 0');
 const {mockSaveFeedback:helperFeedback}=await import('./estimated-score.js');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm4: save seam and module must be live for the denied-cleanup first-feedback journey');
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs); // passthrough: the ACTUAL 201 reply is delivered unchanged
 const id=await saveJourneys(p); // proven real score -> selection -> review journey
 await armCleanupDenial(p);      // EXISTING accepted key-scoped Storage shim, reused verbatim
 await setCleanupDeny(p,true);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 // Real commit proven: actual 201 created:true used:1 through the unchanged
 // passthrough observer, exactly one POST.
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'fm4: exactly one real 201 created:true used:1 POST for the first save');
 assert.equal(commitCount(rec),1,'fm4: exactly one commit request reached the API');
 // ERROR PRESENTATION SCREENSHOT BEFORE ANY RETRY.
 await shot(p,'shot-1440-account-save-fm4-cleanup-denied-before-retry.png');
 // While cleanup fails: ONLY the true saved-but-cleanup-pending copy; NO
 // acknowledgement leaf of any kind, no generic done, no detail presentation.
 const err=await p.locator('[data-account-save="error"]').textContent();
 assert.equal(err,SAVE_ERR_CLEANUP,'fm4: a cleanup denial after an acknowledged commit states the true saved-but-cleanup-pending copy');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm4 NO FALSE DONE: no generic done line while the cleanup persist fails');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm4: no acknowledgement leaf of any kind while cleanup is pending');
 assert.equal(await p.locator('#mock-acknowledgement[data-feedback-kind="first"]').count(),0,'fm4 NO FALSE CELEBRATION: the FIRST milestone leaf derives only after a SUCCESSFUL cleanup persist and must be absent while cleanup fails');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'fm4: no detail presentation while cleanup is pending');
 // Original true-created ack RETAINED at the seam; exact draft retained;
 // local slices untouched; one server debit.
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1}],'fm4: the denied cleanup apply already carries the ORIGINAL true-created ack');
 const storedPending=await localDraft(p);
 assert.equal(storedPending.draft&&storedPending.draft.id,id,'fm4: the exact stable-ID draft is retained while cleanup is pending');
 assert.deepEqual(storedPending.mocks,[],'fm4: no cloud record may merge into state.mocks while cleanup is pending');
 assert.equal(storedPending.used,0,'fm4: the browser-local counter stays untouched while cleanup is pending');
 assert.deepEqual(storedPending.savedIds,[],'fm4: savedIds stay untouched while cleanup is pending');
 assert.equal(await directUsage(acct.token),1,'fm4: exactly one server debit after the denied cleanup');
 // Meaningful silence: the UNCHANGED helper, invoked read-only on the ACTUAL
 // store content for this exact fresh-account transition, still derives
 // kind:'first' — the pending leaf absence is product withholding, not a
 // vacuous fixture state.
 const gotItem=await directItem(acct.token,id);
 assert.equal(gotItem.status,200,'fm4 fixture: the record actually exists in the emulator store despite the denied cleanup');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id&&itemJson.mock.note===SAVE_NOTE,'fm4 fixture: the committed store record carries the original stable ID and note');
 assert.ok((itemJson.mock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'fm4 fixture: the committed store record carries the original thinking review');
 const expected=helperFeedback({mocks:[],used:0,savedIds:[]},{mocks:[itemJson.mock],savedIds:[id],used:1},id);
 assert.ok(expected&&expected.kind==='first'&&expected.record===false,'fm4 fixture: the unchanged helper derives the first-milestone acknowledgement (record:false) for this exact proven transition, so the pending leaf absence is meaningful silence');
 await fs.writeFile(new URL('fm4-cleanup-denied-receipt.json',out),JSON.stringify({stableId:id,actualCommitAck:obs.commits,errorCopy:err,firstLeafDuringCleanupDenial:0,ackLeafTotalDuringDenial:0,doneLineDuringDenial:0,derivedExpectedFirst:{kind:expected.kind,text:expected.text,record:expected.record},retainedAckApplies:[{created:true,id,used:1}],usageDuringDenial:1,interceptedCommitPosts:obs.commits.length,coverageNote:'fm4 proves the denied-cleanup pending state: true saved-but-cleanup-pending copy only, no acknowledgement leaf of any kind, no generic done, retained true-created ack at the seam, exact draft retained, local slices untouched, one POST and one debit; fixture labelling: key-scoped Storage.prototype.setItem denial via the EXISTING accepted armCleanupDenial shim — browser-layer control, never a backend claim'},null,2));
 // REPEATED keyboard Retry with the denial STILL armed: nothing may leak a
 // leaf or a done line; still one POST, one debit, same retained ack.
 await keyboardRetryConfirm(p);
 await p.waitForFunction(()=>window.__uicAckAcks&&window.__uicAckAcks.length===2,null,{timeout:15000});
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1},{created:true,id,used:1}],'fm4: both denied applies carry the SAME retained true-created original ack');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'fm4: a denied cleanup retry never posts another commit');
 assert.equal(commitCount(rec),1,'fm4: still exactly one commit request after the denied retry');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm4 NO FALSE DONE: the repeated denied retry still shows no generic done line');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm4: the repeated denied retry still shows no acknowledgement leaf of any kind');
 assert.equal(await p.locator('[data-account-save="error"]').textContent(),SAVE_ERR_CLEANUP,'fm4: the repeated denied retry keeps the accurate saved-but-cleanup-pending copy');
 assert.equal((await localDraft(p)).draft.id,id,'fm4: the draft stays retained after the denied retry');
 assert.equal(await directUsage(acct.token),1,'fm4: still exactly one server debit after the denied retry');
 // RELEASE the local denial; an explicit keyboard Retry completes ONLY the
// local cleanup with the retained true-created ack.
 await setCleanupDeny(p,false);
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 await settle(1500);
 // THE SUCCESSFUL CLEANUP EMITS THE FIRST LEAF EXACTLY ONCE, derived by the
 // unchanged helper (accepted copy), beside the existing generic done line.
 const milestone=p.locator('#mock-acknowledgement[data-feedback-kind="first"]');
 assert.equal(await milestone.count(),1,'fm4: the released keyboard Retry completing cleanup renders the FIRST milestone leaf exactly once');
 assert.equal((await milestone.first().innerText()).replace(/\s+/g,' ').trim(),expected.text.replace(/\s+/g,' ').trim(),'fm4: the leaf carries the exact unchanged-helper-derived FIRST copy (no new strings)');
 assert.equal(await p.locator('#mock-acknowledgement').count(),1,'fm4: exactly one acknowledgement leaf exists after recovery');
 const done=p.locator('[data-account-save="done"]');
 assert.equal(await done.count(),1,'fm4: the generic done line renders alongside the first leaf');
 assert.equal((await done.textContent()),SAVE_DONE,'fm4: the done line keeps the accepted existing copy');
 // Actual detail, original text, draft cleared, zero new POST/debit, retained
// ack applied three times (two denied + one successful), slices untouched.
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id,'fm4: the completed cleanup opens the actual saved detail for the same literal record');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'fm4: the actual detail shows the original stored text');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'fm4: the retained draft is cleared only when the cleanup persist succeeds');
 assert.deepEqual(stored.mocks,[],'fm4: no cloud record may merge into state.mocks');
 assert.equal(stored.used,0,'fm4: the browser-local counter must stay untouched');
 assert.deepEqual(stored.savedIds,[],'fm4: savedIds must stay untouched');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'fm4: the released cleanup retry re-reads the acknowledged commit — ZERO new commit POSTs');
 assert.equal(commitCount(rec),1,'fm4: exactly one commit request across the whole denied-cleanup journey');
 assert.equal(await directUsage(acct.token),1,'fm4: exactly one server debit across the whole journey — no extra debit from cleanup retries');
 assert.deepEqual((await readAckAcks(p)),[{created:true,id,used:1},{created:true,id,used:1},{created:true,id,used:1}],'fm4: all three seam applies (two denied, one successful) carry the SAME retained original true-created ack — the never-fabricated acknowledgement is what unlocks the FIRST leaf only after the successful cleanup');
 const st=await saveState(p);
 assert.equal(st.phase,null,'fm4: the queue completed and cleared');
 // SUCCESSFUL LEAF SCREENSHOT AFTER RECOVERY.
 await shot(p,'shot-1440-account-save-fm4-first-leaf-after-cleanup-retry.png');
 await fs.writeFile(new URL('fm4-cleanup-recovered-receipt.json',out),JSON.stringify({stableId:id,actualCommitAck:obs.commits,derivedExpectedFirst:{kind:expected.kind,text:expected.text,record:expected.record},firstLeafAfterSuccessfulCleanup:1,ackLeafTotalAfterRecovery:1,doneLineAfterRecovery:1,detailId:id,ackAppliesAtSeam:[{created:true,id,used:1},{created:true,id,used:1},{created:true,id,used:1}],interceptedCommitPosts:obs.commits.length,usageAtEnd:await directUsage(acct.token),localSlices:{mocks:stored.mocks.length,used:stored.used,savedIds:stored.savedIds.length},coverageNote:'fm4 proves the released-denial recovery: the explicit keyboard Retry completes only the cleanup with the retained true-created ack and emits the exact unchanged-helper-derived FIRST leaf ONCE plus the generic done line, actual detail with original text, draft cleared, zero new POST/debit; a reload/no-replay-after-reload safeguard is a later separately sequenced slice, not claimed here'},null,2));
 await clearCommitObserver(p);
 checkClean(rec,'fm4');
});
// ── END ui-cloud-account-save-first-milestone-denied-cleanup-append ──
// ── BEGIN ui-cloud-account-save-first-milestone-reload-no-carryover-append ──
// fm5reloadnocarryover: the ONE focused ACTUAL page.reload FIRST-safeguard
// slice, appended AFTER the fm4 GREEN on the unchanged accepted production
// bytes. Derived harness = the immutable d3dde7e146344fb9d5850a107d9e6a9165a810c7aed83e705a98c5c91f255ebf
// first-milestone-denied-cleanup bytes as the FULL prefix plus THIS ONE marked
// EOF append; deleting everything from this BEGIN marker to EOF reproduces that
// prefix byte-exact (inverse proof in the run evidence). Runner change is ONE
// further filename-only allowlist registration with byte-exact inverse proof.
// All inherited assertions preserved unchanged; no generator/wrapper/source-map
// family; no production, backend, helper or domain edit.
// Boot/session facts inspected from the accepted helpers BEFORE authoring this
// slice: the app keeps the first-milestone acknowledgement in tab-local module
// state (app.js `let accountSaveFirstAck`, cleared on owner-invalidation and
// consumed at render), the controller/session wiring lives on window
// (__uicSaveHarness) which a real page.reload destroys, and the durable
// localStorage slice carries the draft/cleared state but NO acknowledgement.
// So an ACTUAL reload is a genuine tab-local-reset test: after reload there
// must be NO first leaf and NO stale done line; the same fictional account is
// then RE-ATTACHED EXPLICITLY through the accepted connectSaveHarness helper —
// this fixture reattachment is deliberately NOT presented as live auth/session
// persistence — and the supported History journey reopens the same literal ID
// over a REAL 200 detail. The leaf must stay absent, no new commit POST may
// occur, server usage stays exactly 1, browser-local mocks/used/savedIds stay
// untouched, and the served app.js bytes are re-verified against the accepted
// pin. No second save is needed or performed.
test('account save fm5 reload: fm5reloadnocarryover after the proven single FIRST-milestone leaf renders once following a real 201 created:true used:1 save, an ACTUAL page.reload resets the tab-local state so NO first leaf and NO stale done line exist, the explicit reattachment of the same fictional account through the accepted connectSaveHarness helper (fixture reattachment, not live auth persistence) and the supported History reopen of the same literal ID over a real 200 detail with the original content keep the first leaf permanently absent, make zero new commit POSTs, leave server usage at exactly 1 and browser-local mocks/used/savedIds untouched, and the served app.js bytes still match the accepted production pin',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fm5 fixture: fresh fictional emulator account starts at usage 0');
 const {mockSaveFeedback:helperFeedback}=await import('./estimated-score.js');
 const {p,rec}=await openPage(1440);
 // Served-byte re-verification against the accepted production pin (the
// production bytes are unchanged by this slice; this single in-test check
// binds the reload journey to the exact served app.js, no new served-byte
// test family is added).
 {const servedApp=await (await fetch(base+'/app.js')).text();
  assert.equal(sha(Buffer.from(servedApp)),APP_PIN,'fm5: served app.js bytes must equal the accepted production pin');}
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm5: save seam and module must be live for the reload no-carryover journey');
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs); // passthrough: the ACTUAL 201 reply is delivered unchanged
 const id=await saveJourneys(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 await settle(1500);
 // THE PROVEN SUCCESSFUL FIRST LEAF (accepted fm1/fm4 semantics) as the
 // mandatory pre-reload precondition: the leaf rendered exactly once with the
 // exact unchanged-helper-derived copy.
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'fm5: exactly one real 201 created:true used:1 POST for the first save');
 const gotItem=await directItem(acct.token,id);
 assert.equal(gotItem.status,200,'fm5 fixture: the committed record exists in the emulator store');
 const itemJson=await gotItem.json();
 assert.ok(itemJson.mock&&itemJson.mock.id===id&&itemJson.mock.note===SAVE_NOTE,'fm5 fixture: the store record carries the original stable ID and note');
 const expected=helperFeedback({mocks:[],used:0,savedIds:[]},{mocks:[itemJson.mock],savedIds:[id],used:1},id);
 assert.ok(expected&&expected.kind==='first'&&expected.record===false,'fm5 fixture: the unchanged helper derives the first-milestone acknowledgement for this exact transition');
 const milestone=p.locator('#mock-acknowledgement[data-feedback-kind="first"]');
 assert.equal(await milestone.count(),1,'fm5 precondition: the FIRST milestone leaf rendered exactly once before the reload');
 assert.equal((await milestone.first().innerText()).replace(/\s+/g,' ').trim(),expected.text.replace(/\s+/g,' ').trim(),'fm5 precondition: the leaf carries the exact derived copy');
 await shot(p,'shot-1440-account-save-fm5-first-leaf-before-reload.png');
 // THE ACTUAL RELOAD: a real page navigation, not a rerender simulation.
 await p.reload();
 // Tab-local state is gone: the freshly served app (module state reset, no
 // controllers attached yet) may show NO first leaf and NO stale done line.
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm5 NO CARRYOVER: the actual reload leaves no first-milestone leaf of any kind (tab-local acknowledgement state reset)');
 assert.equal(await p.locator('#mock-acknowledgement[data-feedback-kind="first"]').count(),0,'fm5 NO CARRYOVER: specifically no data-feedback-kind=\"first\" leaf after the actual reload');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm5 NO STALE DONE: the generic done line is tab-local and never survives an actual reload');
 await shot(p,'shot-1440-account-save-fm5-after-reload-no-leaf.png');
 // EXPLICIT fixture reattachment of the SAME fictional account through the
 // accepted connectSaveHarness helper — deliberately NOT presented as live
 // auth persistence: the harness re-supplies the emulator token in-process.
 const reconnected=await connectSaveHarness(p,acct);
 assert.ok(reconnected.attachSaveAvailable&&reconnected.moduleAvailable,'fm5: the save seam and module must re-attach for the same fictional account');
 assert.equal(reconnected.signedInUid,acct.uid,'fm5: the reattached session is the same fictional account');
 // Supported navigation: Home departure, then History re-entry.
 await p.locator('nav [data-act=\"home\"]').click();
 await p.waitForSelector('[data-act=\"log\"]',{timeout:15000});
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm5 NO REPLAY: the post-reload Home rerender shows no first leaf');
 await p.locator('nav [data-act=\"history\"]').click();
 await p.waitForSelector('[data-account-history=\"row\"]',{timeout:15000});
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm5 NO REPLAY: post-reload History re-entry shows no first leaf');
 // Supported Open of the SAME literal record: a REAL 200 detail with the
// original content (meaningful absence — the record demonstrably loads).
 await p.locator('[data-account-history=\"open\"]').first().click();
 await p.waitForSelector('[data-account-history=\"detail\"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history=\"detail\"]').getAttribute('data-account-history-id'),id,'fm5: the post-reload reopen shows the same literal saved record');
 const detailText=await p.locator('[data-account-history=\"detail\"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'fm5: the post-reload detail keeps the original note and review content');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm5 NO REPLAY: the post-reload reopen of the same record never re-renders the consumed first acknowledgement');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm5 NO STALE DONE: the done line never reappears on any post-reload supported view');
 // Zero new commits: the observer route and request recorder survive the
// reload (bound to the page/context), so this delta is measured across it.
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id,used:1}}],'fm5: the reload, reattachment and reopen performed ZERO new commit POSTs');
 assert.equal(commitCount(rec),1,'fm5: exactly one commit request across the whole reload journey');
 assert.equal(await directUsage(acct.token),1,'fm5: server usage is still exactly 1 — no re-save, no second debit');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'fm5: the cleared draft stays cleared through the reload');
 assert.deepEqual(stored.mocks,[],'fm5: no cloud record may merge into state.mocks');
 assert.equal(stored.used,0,'fm5: the browser-local counter must stay untouched');
 assert.deepEqual(stored.savedIds,[],'fm5: savedIds must stay untouched');
 checkClean(rec,'fm5');
 await shot(p,'shot-1440-account-save-fm5-reopened-no-leaf.png');
 await fs.writeFile(new URL('fm5-reload-no-carryover-receipt.json',out),JSON.stringify({stableId:id,actualCommitAck:obs.commits,derivedExpectedFirst:{kind:expected.kind,text:expected.text,record:expected.record},firstLeafBeforeReload:1,ackLeafCountAfterReload:0,doneAfterReload:0,firstLeafAfterReattachHome:0,firstLeafAfterHistoryReentry:0,firstLeafAfterReopen:0,reopenDetailId:id,reopenContentNotePresent:detailText.includes(SAVE_NOTE),commitPostsAcrossReload:obs.commits.length,commitRequestsRecorded:commitCount(rec),usageAtEnd:await directUsage(acct.token),localSlices:{mocks:stored.mocks.length,used:stored.used,savedIds:stored.savedIds.length},reattachmentLabel:'explicit fixture reattachment through the accepted connectSaveHarness helper — NOT live auth/session persistence',servedAppByteCheck:'sha of served app.js equals the accepted 2387e0d2 pin (single in-journey check; production bytes unchanged by this slice)',coverageNote:'fm5 proves tab-local first-leaf state never carries across an ACTUAL page.reload: leaf and done absent after reload, absent again through reattach, Home rerender, History re-entry and the real 200 reopen of the same literal ID at unchanged usage 1, zero new POSTs, local slices untouched; no second save performed or required'},null,2));
});
// ── END ui-cloud-account-save-first-milestone-reload-no-carryover-append ──
// ── BEGIN ui-cloud-account-save-second-milestone-feedback-append ──
// fm6secondmilestone: SECOND account-save milestone encouragement under the
// EXISTING, UNCHANGED estimated-score.js mockSaveFeedback helper policy
// (account-save-first-vertical-contract.md item 16; the fm1..fm5 first-milestone
// slices are accepted on the current bytes). The helper is the authoritative
// policy: server ack.used drives first/second milestones (never browser
// counters), kind 'second' with headline "Two mocks logged - keep building."
// derives ONLY when the unchanged helper sees no personal best for the new
// record - so the second save here reuses the EXACT same supported scores as
// the proven first save (estimated totals equal, personalBests needs strictly
// greater), and the helper (imported read-only) derives kind 'second',
// record:false. Nothing is hand-written and no PB policy is invented.
// The current app.js first-only gate (accountSaveApply records the derived
// feedback ONLY when ack.used===1, and the renderer consumes only a stored
// kind:'first' reference) therefore shows NO acknowledgement leaf at all after
// a real second commit: genuine behavioral RED against the UNCHANGED accepted
// production bytes (app 2387e0d2..., save 7e6138bb..., helper dc772266...).
// Journey guarantees BEFORE the final missing-feedback assertion: the FIRST
// save is a REAL account commit proven over direct HTTP (201 created:true
// used:1 passthrough observer, item 200, usage 1, fresh list row, the accepted
// first leaf rendered exactly once as precondition); the SECOND save is a real
// native-confirmed save with its own saveJourneys draft, its 201 created:true
// used:2 acknowledgement observed UNMODIFIED by the existing armCommitObserver,
// and its ACTUAL 200 detail captured with the original note/review and status
// AND ETag preserved (the fm1/fm2 labelled ETag-preserving hold - the older
// immutable prefix holdFirstDetailGet pass-through branch drops the server
// ETag, a known harness artifact inherited from before fm1, never reused here)
// asserted BEFORE any release. While the receipt is held: no leaf of any kind,
// no done line, draft still present, nothing applied. After release: the
// existing done line once, the ACTUAL detail of the NEW literal id, the draft
// cleared only after the receipt, browser mocks/used/savedIds never merged,
// the apply seam carries exactly the two true-created acks (one per save, no
// replay), phase null, and the cumulative server debit moved exactly 1 -> 2
// with exactly two commit POSTs. Receipt JSON and BOTH screenshots are written
// BEFORE the final missing-second-leaf assertion. No production, backend,
// helper or domain edit; no implementation authored before this RED.
// Derived harness = the immutable fm5 reload harness bytes
// (8511710c60cb11bdeb3fa32f093a73747950beea7ed22faa89191bd258be4714) as the
// FULL prefix plus THIS ONE marked EOF append: deleting everything from this
// BEGIN marker to EOF reproduces that prefix byte-exact (inverse proof in the
// build/receipt evidence). Runner change is filename-only allowlist
// registration with byte-exact block-delete inverse proof. No new
// generator/wrapper/source-map family; base harnesses untouched.
test('account save fm6 second milestone: fm6secondmilestone after a proven real first account commit with the accepted first leaf, a second real native-confirmed save whose actual 201 created:true used:2 passthrough ack and 200 detail receipt with original note/review and preserved ETag are captured before release, with no leaf no done line and no cleanup while held and the existing done detail cleared-draft untouched-local-slices two-applies and one-additional-debit guarantees after release, shows NO mockSaveFeedback SECOND-milestone acknowledgement at all - and the missing-product assertion: the unchanged-helper-derived second-milestone acknowledgement must render exactly once on its own accessible leaf data-feedback-kind="second" with the exact derived copy',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fm6 fixture: fresh fictional emulator account starts at usage 0');
 // Unchanged feedback POLICY module, imported READ-ONLY for derivation.
 const {mockSaveFeedback:helperFeedback}=await import('./estimated-score.js');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm6: save seam and module must be live for the second-milestone journey');
 await wrapSaveApplyObserver(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs); // passthrough: the ACTUAL 201 replies are delivered unchanged
 // ── PHASE 1: the accepted FIRST save, real account commit, no hold needed.
 const id1=await saveJourneys(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id:id1,used:1}}],'fm6 precondition: the first save is one real 201 created:true used:1 account commit');
 assert.equal(await directUsage(acct.token),1,'fm6 precondition: the first commit debited the server exactly once');
 // Accepted first-milestone behaviour present (fm1 GREEN as the live precondition).
 const firstLeaf=p.locator('#mock-acknowledgement[data-feedback-kind="first"]');
 assert.equal(await firstLeaf.count(),1,'fm6 precondition: the FIRST milestone leaf rendered exactly once after the first save');
 // The prior record proven in the ACTUAL store over direct HTTP (full record,
 // not a browser copy) - the authoritative prior-server-record input later.
 const got1=await directItem(acct.token,id1);
 assert.equal(got1.status,200,'fm6 precondition: the first record actually exists in the emulator store');
 const priorMock=(await got1.json()).mock;
 assert.equal(priorMock.id,id1,'fm6: prior server record carries the literal first stable ID');
 assert.equal(priorMock.note,SAVE_NOTE,'fm6: prior server record carries the committed note');
 // The real History list proves the same account owns the record.
 await p.locator('[data-account-history="back"]').click();
 await waitHistRows(p,1);
 assert.ok((await histRowIds(p)).includes(id1),'fm6: the actual list row carries the literal saved id');
 // ── PHASE 2: SECOND save from the supported Home entry with the EXACT same
 // supported scores (equal estimated totals - the unchanged personalBests needs
 // strictly greater, so the helper derives kind 'second', NOT a PB).
 await p.locator('nav [data-act="home"]').click();
 await p.waitForSelector('[data-act="log"]',{timeout:15000});
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm6: the consumed first leaf never replays across the Home departure before the second save');
 const id2=await saveJourneys(p);
 assert.notEqual(id2,id1,'fm6 fixture: the second save is a new draft identity');
 // fm1/fm2 ETag-preserving labelled hold (every branch keeps status AND etag):
 // armed NOW, so the first item GET it sees is the SECOND save detail receipt.
 const hold={};
 {let resolveReady;hold.calls=[];hold.receipt=null;hold.ready=new Promise(r=>{resolveReady=r;});hold.error=null;
 await p.route(REC_ITEM,async route=>{
  const url=route.request().url();
  hold.calls.push(url);
  if(hold.receipt===null){
   try{
    const resp=await route.fetch();
    const text=await resp.text();
    let body=null;try{body=JSON.parse(text);}catch{}
    hold.receipt={status:resp.status(),body,text,headers:resp.headers()};
    resolveReady();
   }catch(e){hold.error=String(e&&e.message||e);resolveReady();}
   await new Promise(r=>{hold.release=()=>r();});
   if(hold.error)await route.abort().catch(()=>{});
   else await route.fulfill({status:hold.receipt.status,headers:{'content-type':'application/json; charset=utf-8','etag':hold.receipt.headers.etag},body:hold.receipt.text}).catch(()=>{});
   return;
  }
  const resp=await route.fetch();
  const text=await resp.text();
  const h2={'content-type':'application/json; charset=utf-8'};
  if(resp.headers().etag)h2.etag=resp.headers().etag;
  await route.fulfill({status:resp.status(),headers:h2,body:text});
 });}
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click(); // real native cancellation-safe confirmation
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('fm6 harness: second detail GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'fm6: held-GET capture must succeed: '+hold.error);
 // The ACTUAL second acknowledged commit, observed unmodified by the observer.
 assert.equal(obs.commits.length,2,'fm6: exactly two real commit POSTs across both saves');
 assert.deepEqual(obs.commits[1],{status:201,body:{created:true,id:id2,used:2}},'fm6: the second ack is a real 201 created:true used:2 PASSED THROUGH unchanged (server-authoritative cumulative usage)');
 // The ACTUAL second detail receipt proven BEFORE any release.
 assert.equal(hold.receipt.status,200,'fm6: the held second detail GET actually returned 200 upstream');
 const heldMock=hold.receipt.body&&hold.receipt.body.mock;
 assert.ok(heldMock&&heldMock.id===id2&&heldMock.note===SAVE_NOTE,'fm6: the held receipt carries the second literal stable ID and committed note');
 assert.ok((heldMock.reviews||[]).some(q=>q.thinking===SAVE_THINKING),'fm6: the held receipt carries the original thinking review');
 // DERIVE the expected second-milestone feedback READ-ONLY from the UNCHANGED
 // helper on transient account-only inputs: before = the ACTUAL prior server
 // full record + proven usage 1; next = before plus the ACTUAL newly
 // acknowledged detail at the server used:2. Never persisted, never merged.
 const beforeLedger={mocks:[priorMock],used:1,savedIds:[id1]};
 const nextLedger={mocks:[priorMock,heldMock],used:obs.commits[1].body.used,savedIds:[id1,id2]};
 const expected=helperFeedback(beforeLedger,nextLedger,id2);
 assert.ok(expected&&expected.kind==='second'&&expected.record===false&&typeof expected.text==='string'&&expected.text.length>0,`fm6 fixture: the UNCHANGED helper derives kind "second" (NOT a PB, NOT an invented copy) for this exact acknowledged transition with equal scores; got ${JSON.stringify(expected)}`);
 // WHILE THE ACTUAL RESPONSE IS HELD: nothing applied - no leaf of any kind,
 // no done line, the second draft still present, local counter untouched.
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm6: no acknowledgement leaf of ANY kind may render while the second detail receipt is still held');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm6: no completed-save done line before the released second receipt');
 const heldStored=await localDraft(p);
 assert.ok(heldStored.draft&&heldStored.draft.id===id2,'fm6: the second draft is still present and owned while the receipt is held');
 assert.equal(heldStored.used,0,'fm6: the browser-local counter is untouched during the hold');
 await shot(p,'shot-1440-account-save-fm6-held-no-leaf.png');
 // Release the exact original response LAST (status AND etag preserved).
 await hold.release();
 await clearHeldDetailGet(p);
 await settle(1500);
 // Existing completed-save guarantees after release (accepted, unchanged).
 const done=p.locator('[data-account-save="done"]');
 assert.equal(await done.count(),1,'fm6: the existing generic done acknowledgement renders exactly once for the second save');
 assert.equal((await done.textContent()),SAVE_DONE,'fm6: the done line keeps the accepted existing copy');
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id2,'fm6: the detail is the ACTUAL second record by literal id');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'fm6: the second detail shows the original note and review text');
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'fm6: the unchanged second draft is cleared only after the successful receipt');
 assert.deepEqual(stored.mocks,[],'fm6: no cloud record may merge into state.mocks');
 assert.equal(stored.used,0,'fm6: the browser-local counter must stay untouched');
 assert.deepEqual(stored.savedIds,[],'fm6: savedIds must stay untouched (no local history merge)');
 assert.deepEqual((await readAckAcks(p)),[{created:true,id:id1,used:1},{created:true,id:id2,used:2}],'fm6: exactly TWO true-created acks applied at the seam, one per real commit, no replay');
 const st=await saveState(p);
 assert.equal(st.phase,null,'fm6: the second queue completed and cleared');
 await clearCommitObserver(p);
 const got2=await directItem(acct.token,id2);
 assert.equal(got2.status,200,'fm6: the second committed record actually exists in the emulator store');
 assert.equal((await got2.json()).mock.note,SAVE_NOTE,'fm6: the second cloud record keeps the ORIGINAL note');
 assert.equal(await directUsage(acct.token),2,'fm6: exactly one ADDITIONAL server debit (cumulative 1 -> 2)');
 checkClean(rec,'fm6');
 // RETAIN the evidence BEFORE the missing-feedback assertion.
 const secondLeaf=p.locator('#mock-acknowledgement[data-feedback-kind="second"]');
 const secondCount=await secondLeaf.count();
 const secondText=secondCount>0?(await secondLeaf.first().innerText()).replace(/\s+/g,' ').trim():null;
 const ackLeafTotal=await p.locator('#mock-acknowledgement').count();
 await fs.writeFile(new URL('fm6-second-milestone-feedback-receipt.json',out),JSON.stringify({firstStableId:id1,secondStableId:id2,actualCommitAcks:obs.commits,heldSecondDetailStatus:hold.receipt.status,secondDetailEtagPreserved:!!hold.receipt.headers.etag,priorServerRecordProved:{status:got1.status,id:priorMock.id,noteMatches:priorMock.note===SAVE_NOTE},derivedExpectedFeedback:{kind:expected.kind,text:expected.text,record:expected.record},doneText:await done.textContent(),detailId:id2,ackAcksAtEnd:await readAckAcks(p),phaseAfterCompletion:st.phase,localSlices:{mocks:stored.mocks.length,used:stored.used,savedIds:stored.savedIds.length},secondLeafCount:secondCount,secondLeafText:secondText,ackLeafTotal,usageAtEnd:await directUsage(acct.token),coverageNote:'fm6 reaches the successful SECOND account-save acknowledgement seam with the ACTUAL 201 created:true used:2 through the unchanged passthrough observer and the held REAL 200 detail with original note/review and preserved ETag; all existing guarantees re-proven in order (first save real commit + accepted first leaf precondition, while-held silence, done line, ACTUAL detail, draft cleared only after receipt, zero local mixing, two seam applies one per commit, one additional debit); the expected second-milestone copy is DERIVED from the unchanged estimated-score.js helper on transient account-only inputs from the ACTUAL prior server full record and the ACTUAL newly acknowledged detail, equal supported scores so no PB is involved, never hand-written; the assertion below is the MISSING-PRODUCT feedback, not a parser/selector/setup fault'},null,2));
 await shot(p,'shot-1440-account-save-fm6-completed-no-second-leaf.png');
 // ── THE MISSING-PRODUCT ASSERTION (expected genuine RED): the unchanged
 // helper's second-milestone acknowledgement is never recorded or rendered by
 // the account-save path - the current app gates first-ack storage at
 // ack.used===1 ONLY (app.js accountSaveApply first-only slice), so this leaf
 // is absent after an ACCOUNT second save. Asserted on the existing renderer's
 // OWN LEAF (never the aggregated #messages container), exactly once, with the
 // exact helper-derived copy.
 assert.equal(ackLeafTotal,1,'fm6 RED: exactly one acknowledgement leaf must exist after the second successful account save (no missing, duplicated or foreign feedback)');
 assert.equal(secondCount,1,`fm6 RED: the successful second account save must show the existing mockSaveFeedback SECOND-MILESTONE acknowledgement on its accessible leaf data-feedback-kind="second"; derived expected copy: ${JSON.stringify(expected.text)}`);
 assert.equal(secondText,expected.text.replace(/\s+/g,' ').trim(),'fm6 RED: the second-milestone leaf must carry the exact helper-derived copy (unchanged policy, no new strings)');
});
// ── END ui-cloud-account-save-second-milestone-feedback-append ──
// ── BEGIN ui-cloud-account-save-prior-collector-hardening-append ──
// fm7: PRECOMMIT PRIOR-CATALOGUE COLLECTOR hardening (GPT review findings on
// collectPrior in account-save.js ce5cb4c0…): (1) the repeated-cursor guard
// only compared the IMMEDIATELY previous cursor and missed multi-step
// A→B→A-style cycles, (2) duplicate summary IDs across pages were SILENTLY
// DEDUPLICATED instead of conservatively refused, (3) the returned snapshot
// OBJECT itself was mutable although the design claims a COMPLETE IMMUTABLE
// snapshot. The collector-level cycle/duplicate proofs run in the authorized
// bounded PURE controller harness reusing the actual createAccountSave with a
// scripted page client (evidence/…/pc-pure: RED 1/4→GREEN 4/4 on final
// bytes), because the ACCEPTED browser client's own strict ascending-cursor
// validation refuses any replayed/duplicate page BEFORE collectPrior can see
// it — the browser journeys below therefore prove the same safe outcome
// through the full accepted I/O path (bounded dispatch count, zero commit
// POST, sanitized copy, retained draft, nothing applied) using EXPLICITLY
// LABELLED TEST-ONLY browser page fixtures at the LIST route
// (route.fulfill replacements on /api/mocks?* — never backend-outage claims,
// never a production/client/backend edit), plus REAL-success immutability
// journeys. pc5 preserves the essential precommit gate on the REAL store: a
// genuine list 503 → ZERO commit POSTs → truthful prior-unavailable copy →
// clear → native keyboard Retry completes with exactly one POST/debit and
// one COMPLETE frozen applied snapshot.
// Runner change is filename-allowlist registration ONLY (derived runner,
// canonical 602f… byte-unchanged). Derived harness = the immutable fm6
// harness bytes (a7b9258cf7cfccb7ad7e2f97eeaa9e22c0d92b59ceb03e05188570ee311
// 7ba0d) as the FULL prefix plus THIS ONE marked EOF append; deleting
// everything from this BEGIN marker to EOF reproduces that prefix byte-exact.
const PC_PRIOR_ERR='Your saved mocks could not be read before this save. Nothing was saved to your account, no save was counted, and your draft is unchanged. Keep this page open and retry.';
// PC_LIST: the inherited glob pattern (proven at route503 in the base
// harness) — with the in-handler exact-pathname guard it intercepts ONLY
// list requests; the commit/detail paths never match.
const PC_LIST=base+'/api/mocks?*';
const pcId=t=>'pc7'+t;
const pcPos=id=>Buffer.from(id).toString('base64url');
const pcRow=(id,n)=>({summary:{id,title:'PC fixture mock '+n,provider:'PC fixture provider',dmMode:'questions',scores:{VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}},sjt:null,loggedAt:'2026-10-20T00:00:00.000Z'},etag:'"review-1"'});
const pcPage=(ids,next)=>({items:ids.map((id,i)=>pcRow(id,i+1)),nextCursor:next});
// LABELLED TEST-ONLY page fixture: replaces the ACTUAL list responses with
// schema-valid (validateScores-clean, b64url-cursor-consistent) sequential
// pages, recorded per-request. Bound: once the plan is exhausted every
// further list request returns a typed 503, so any hypothetical unbounded
// dispatch FAILS FAST and the recorded request count pinpoints the defect
// instead of hanging the suite.
async function armPcListFixture(p,plan){
 const trips=[];
 await p.route(PC_LIST,async route=>{
  const u=new URL(route.request().url());
  if(u.pathname!=='/api/mocks')return route.continue();
  // Collector dispatches always carry limit=20 (PRIOR_PAGE_LIMIT); anything
  // else (the History controller's default-limit reloads) passes through to
  // the REAL server untouched and is never planned/rejected here.
  if(u.searchParams.get('limit')!=='20')return route.continue();
  trips.push({after:u.searchParams.get('after')??'(null)',limit:u.searchParams.get('limit')});
  const n=trips.length;
  if(n>plan.length)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})});
  const page=plan[n-1](u.searchParams.get('after'));
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(page)});
 });
 return trips;
}
const pcTrips=trips=>trips.filter(t=>t.limit==='20').map(t=>t.after);
const clearPcListFixture=p=>p.unroute(PC_LIST);
// TEST-ONLY apply-arg observer through the EXISTING mount seam (same pattern
// as the accepted wrapSaveApplyObserver): retains the ACTUAL fourth seam.apply
// ARGUMENT OBJECT reference (the pre-commit prior snapshot) for in-page
// immutability inspection plus a serialised copy for content assertions.
const wrapPriorApplyObserver=p=>p.evaluate(()=>{
 const h=window.__uicSaveHarness;
 if(!h||!h.saveController||typeof h.saveController.mount!=='function')throw new Error('save controller must be mounted to wrap the apply seam');
 const inner=h.saveController;
 window.__uicPriorAcks=[];
 const recorder=window.__uicPriorAcks;
 const wrapper=Object.freeze({
  mount(app){
   if(!app||typeof app.apply!=='function'||typeof app.guard!=='function')throw new Error('mount seam missing apply/guard');
   const origApply=app.apply,origGuard=app.guard;
   const wrapped=Object.freeze({...app,
    guard:(...a)=>origGuard(...a),
    apply:(...a)=>{if(a.length>=4)recorder.push({ref:a[3],json:a[3]===undefined?undefined:JSON.parse(JSON.stringify(a[3]))});return origApply(...a);}});
   inner.mount(wrapped);
  },
  unmount(){inner.unmount();},
  handleSessionChange(s){inner.handleSessionChange(s);},
  beginConfirmation(q){return inner.beginConfirmation(q);},
  confirmSave(q){return inner.confirmSave(q);},
  retained(){return inner.retained();},
  retry(){return inner.retry();},
  getState(){return inner.getState();},
  renderFeedback(c,r){inner.renderFeedback(c,r);},
 });
 return import('/app.js').then(app=>{if(h.detachSave)h.detachSave();h.detachSave=app.attachAccountSave(wrapper);return {wrapped:true};});
});
const readPriorAcks=p=>p.evaluate(()=>window.__uicPriorAcks.map(e=>({json:e.json})));
const inspectPriorImmutability=p=>p.evaluate(()=>{
 const last=window.__uicPriorAcks[window.__uicPriorAcks.length-1];
 if(!last||!last.ref)return {present:false};
 const prior=last.ref,first=prior.summaries[0]||null,scores=first?first.scores.VR:null;
 let outerTamperThrew=false;
 try{Object.defineProperty(prior,'tampered',{value:1});}catch{outerTamperThrew=true;}
 return {present:true,outerFrozen:Object.isFrozen(prior),
  summariesFrozen:Object.isFrozen(prior.summaries),savedIdsFrozen:Object.isFrozen(prior.savedIds),
  summaryFrozen:first===null?null:Object.isFrozen(first),
  scoresFrozen:scores===null?null:Object.isFrozen(scores),
  scoreLeafFrozen:scores===null?null:Object.isFrozen(scores),
  outerTamperThrew,tamperedAbsent:prior.tampered===undefined};
});

// ── pc1: MULTI-STEP REPEATED CURSOR (A→B→A). Schema-valid pages advance,
// then the fixture REPLAYS the page-one cursor. The accepted client's strict
// ascending cursor validation refuses the replay before the collector sees
// it; the hardened collector additionally holds a seen-set of EVERY returned
// cursor (proved at collector level in the pure pc-pure harness RED→GREEN).
// Bounded proof here: exactly 3 dispatched pages — the replay refused with NO
// fourth request, ZERO commit POSTs, ZERO debit, exact sanitized prior-
// unavailable copy, draft retained, nothing applied. The request-count bound
// makes any infinite loop fail fast.
test('account save fm7pc collector: pc1 a multi-step replayed cursor (A-B-A page fixture) is refused within a bounded dispatch count with zero commit POSTs, zero debit, the sanitized prior-unavailable copy and the retained draft',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm7 pc1: save seam and module must be live');
 await wrapPriorApplyObserver(p);
 const a=pcId('a'),b=pcId('b'),c=pcId('c');
 const trips=await armPcListFixture(p,[
  ()=>pcPage([a,b],pcPos(b)),
  after=>after===pcPos(b)?pcPage([c],pcPos(c)):harness('fm7 pc1 fixture: unexpected after '+after),
  after=>after===pcPos(c)?pcPage([a,b],pcPos(b)):harness('fm7 pc1 fixture: unexpected after '+after)]);
 const id=await saveJourneys(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 assert.deepEqual(pcTrips(trips).slice(0,4),['(null)',pcPos(b),pcPos(c)],'fm7 pc1: exactly the three bounded page dispatches, the replayed cursor refused with NO fourth request (infinite-loop guard)');
 assert.equal(pcTrips(trips).length,3,'fm7 pc1: request count stays at the bound — got '+pcTrips(trips).length);
 assert.equal(commitCount(rec),0,'fm7 pc1: a prior-list refusal must NEVER start the commit POST');
 assert.equal(await directUsage(acct.token),0,'fm7 pc1: zero server debit');
 assert.equal((await p.locator('[data-account-save="error"]').textContent()),PC_PRIOR_ERR,'fm7 pc1: the sanitized prior-unavailable copy, never a raw error');
 const st=await saveState(p);
 assert.equal(st.phase,'failed','fm7 pc1: existing failed phase');
 assert.equal(st.retainedId,id,'fm7 pc1: the draft capture is retained for Retry');
 assert.deepEqual(await readPriorAcks(p),[],'fm7 pc1: a rejected partial snapshot is never applied');
 checkClean(rec,'fm7 pc1');
 await shot(p,'shot-1440-account-save-fm7-pc1-cycle-refused.png');
});

// ── pc2: CROSS-PAGE DUPLICATE ID. Page two repeats a page-one summary ID.
// The accepted client's strict ordering validation refuses the duplicate row
// before the collector sees it; the hardened collector additionally refuses
// any duplicate ID within AND across pages conservatively (proved RED→GREEN
// at collector level in the pure pc-pure harness). Same bounded guarantees:
// exactly two dispatched pages, zero POSTs, zero debit, sanitized copy,
// retained draft, nothing applied.
test('account save fm7pc collector: pc2 a cross-page duplicate summary ID (page fixture) is conservatively refused — never silently deduplicated into a commit — with zero POSTs and the retained draft',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm7 pc2: save seam and module must be live');
 await wrapPriorApplyObserver(p);
 const a=pcId('a'),b=pcId('b');
 const trips=await armPcListFixture(p,[
  ()=>pcPage([a,b],pcPos(b)),
  after=>after===pcPos(b)?pcPage([a],pcPos(a)):harness('fm7 pc2 fixture: unexpected after '+after)]);
 const id=await saveJourneys(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 assert.equal(pcTrips(trips).length,2,'fm7 pc2: exactly one legitimate page plus the duplicate page, refused — no further dispatch');
 assert.equal(commitCount(rec),0,'fm7 pc2: a duplicate-ID page must NEVER start the commit POST (no silent dedup commit)');
 assert.equal(await directUsage(acct.token),0,'fm7 pc2: zero server debit');
 assert.equal((await p.locator('[data-account-save="error"]').textContent()),PC_PRIOR_ERR,'fm7 pc2: the sanitized prior-unavailable copy');
 assert.equal((await saveState(p)).retainedId,id,'fm7 pc2: the draft is retained');
 assert.deepEqual(await readPriorAcks(p),[],'fm7 pc2: nothing is applied');
 checkClean(rec,'fm7 pc2');
 await shot(p,'shot-1440-account-save-fm7-pc2-dup-refused.png');
});

// ── pc3: COMPLETE SNAPSHOT IS DEEPLY IMMUTABLE. A REAL successful save over
// a REAL seeded prior record (direct HTTP commit first) so the pre-commit
// snapshot legitimately contains one actual summary. The applied COMPLETE
// snapshot must expose frozen outer object, frozen arrays, frozen summary/
// scores objects — the GPT finding: the outer snapshot object was mutable
// although the design claims an immutable complete snapshot.
test('account save fm7pc collector: pc3 after a REAL successful save over a REAL seeded prior record the applied complete prior snapshot is deep-frozen end to end (outer object, arrays, summaries, scores) and tamper-proof',async()=>{
 const acct=await account();
 const seeded=await commit(acct.token);
 assert.equal(seeded.created,true,'fm7 pc3 fixture: the seeded prior record is a real 201 commit');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm7 pc3: save seam and module must be live');
 await wrapPriorApplyObserver(p);
 const id=await saveJourneys(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(commitCount(rec),1,'fm7 pc3: exactly one real commit POST after a COMPLETE successful list');
 const acks=await readPriorAcks(p);
 assert.equal(acks.length,1,'fm7 pc3: the apply seam received exactly one prior snapshot');
 assert.ok(acks[0].json&&Array.isArray(acks[0].json.summaries)&&Array.isArray(acks[0].json.savedIds),'fm7 pc3: the snapshot carries the summaries+savedIds shape');
 assert.deepEqual(acks[0].json.savedIds,[seeded.id],'fm7 pc3: the COMPLETE prior catalogue snapshot carries the literal seeded stable ID');
 const im=await inspectPriorImmutability(p);
 assert.equal(im.present,true,'fm7 pc3: snapshot reference retained for inspection');
 assert.equal(im.outerFrozen,true,'fm7 pc3: the outer snapshot OBJECT must be frozen (GPT finding: outer object mutable)');
 assert.equal(im.summariesFrozen,true,'fm7 pc3: summaries array frozen');
 assert.equal(im.savedIdsFrozen,true,'fm7 pc3: savedIds array frozen');
 assert.equal(im.summaryFrozen,true,'fm7 pc3: the summary object frozen');
 assert.equal(im.scoresFrozen,true,'fm7 pc3: the scores object frozen');
 assert.equal(im.outerTamperThrew,true,'fm7 pc3: defineProperty on the outer snapshot must throw (frozen)');
 assert.equal(im.tamperedAbsent,true,'fm7 pc3: the tamper attempt left no property');
 assert.equal((await saveState(p)).phase,null,'fm7 pc3: the queue completed and cleared');
 assert.equal(await directUsage(acct.token),2,'fm7 pc3: exactly one additional debit beyond the seeded record');
 checkClean(rec,'fm7 pc3');
 await shot(p,'shot-1440-account-save-fm7-pc3-immutable.png');
});

// ── pc4: SUCCESSFUL MULTI-PAGE COLLECTION (bounded small fixture). Two
// legitimate schema-valid pages end with nextCursor null; the collector must
// gather BOTH pages into one COMPLETE snapshot, dispatch exactly two list
// requests, and only then start the single commit. No partial snapshot may
// be applied, and the applied snapshot is deep-frozen.
test('account save fm7pc collector: pc4 a successful bounded multi-page prior collection gathers every page into one complete frozen snapshot and commits exactly once only after the list completes',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm7 pc4: save seam and module must be live');
 await wrapPriorApplyObserver(p);
 const a=pcId('a'),b=pcId('b'),c=pcId('c');
 const trips=await armPcListFixture(p,[
  ()=>pcPage([a,b],pcPos(b)),
  after=>after===pcPos(b)?pcPage([c],null):harness('fm7 pc4 fixture: unexpected after '+after)]);
 const id=await saveJourneys(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.deepEqual(pcTrips(trips),['(null)',pcPos(b)],'fm7 pc4: exactly the two legitimate page dispatches and no third');
 assert.equal(commitCount(rec),1,'fm7 pc4: one commit POST, started only after the COMPLETE list');
 assert.equal(await directUsage(acct.token),1,'fm7 pc4: exactly one server debit');
 const acks=await readPriorAcks(p);
 assert.equal(acks.length,1,'fm7 pc4: exactly one snapshot applied');
 assert.deepEqual(acks[0].json.savedIds,[a,b,c],'fm7 pc4: the COMPLETE multi-page snapshot in server order');
 assert.equal(acks[0].json.summaries.length,3,'fm7 pc4: three summary rows gathered');
 const im=await inspectPriorImmutability(p);
 assert.equal(im.outerFrozen&&im.summariesFrozen&&im.savedIdsFrozen&&im.summaryFrozen&&im.scoresFrozen,true,'fm7 pc4: the complete multi-page snapshot is deep-frozen');
 checkClean(rec,'fm7 pc4');
 await shot(p,'shot-1440-account-save-fm7-pc4-multipage.png');
});

// ── pc5: LIST FAILURE SENDS NO COMMIT + RETRY RECOVERY on the REAL store.
// A labelled browser 503 on the prior LIST route only (never the commit
// route): the first confirmed save must show the sanitized prior-unavailable
// copy with ZERO commit POSTs and ZERO debit, retain the draft, and apply
// nothing. Clearing the fixture and using the existing native keyboard Retry
// completes with exactly one POST, one debit and one complete frozen applied
// snapshot — no partial snapshot from the failed attempt is ever reused.
test('account save fm7pc collector: pc5 a real prior-list 503 (labelled browser fixture) prevents any commit POST, keeps truthful prior-unavailable feedback and the retained draft, and the native keyboard Retry after clearing completes with exactly one POST one debit one complete snapshot',async()=>{
 const acct=await account();
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm7 pc5: save seam and module must be live');
 await wrapPriorApplyObserver(p);
 const id=await saveJourneys(p);
 await p.route(PC_LIST,async route=>{const u=new URL(route.request().url());if(u.pathname!=='/api/mocks')return route.continue();return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})});}); // LABELLED browser-layer 503 fixture on the list path ONLY — never a backend outage claim; the commit/detail paths keep the real server
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 assert.equal(commitCount(rec),0,'fm7 pc5: a prior-list failure must NEVER start the commit POST');
 assert.equal(await directUsage(acct.token),0,'fm7 pc5: zero server debit on the failed attempt');
 assert.equal((await p.locator('[data-account-save="error"]').textContent()),PC_PRIOR_ERR,'fm7 pc5: the sanitized prior-unavailable copy');
 const st1=await saveState(p);
 assert.equal(st1.phase,'failed','fm7 pc5: failed phase');
 assert.equal(st1.retainedId,id,'fm7 pc5: the exact draft capture retained');
 assert.deepEqual(await readPriorAcks(p),[],'fm7 pc5: no partial snapshot applied on the failed attempt');
 const stored=await localDraft(p);
 assert.ok(stored.draft&&stored.draft.id===id,'fm7 pc5: the draft is unchanged in the browser');
 await shot(p,'shot-1440-account-save-fm7-pc5-list-503.png');
 await clearPcListFixture(p);
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 assert.equal(commitCount(rec),1,'fm7 pc5: Retry makes exactly ONE commit POST total across both attempts');
 assert.equal(await directUsage(acct.token),1,'fm7 pc5: exactly one server debit after recovery');
 const acks=await readPriorAcks(p);
 assert.equal(acks.length,1,'fm7 pc5: exactly one complete snapshot applied, only on success');
 assert.ok(Array.isArray(acks[0].json.savedIds),'fm7 pc5: the applied snapshot is the complete account-only list');
 const im=await inspectPriorImmutability(p);
 assert.equal(im.outerFrozen&&im.summariesFrozen&&im.savedIdsFrozen,true,'fm7 pc5: the recovered snapshot is frozen');
 assert.equal((await saveState(p)).phase,null,'fm7 pc5: queue completed and cleared');
 checkClean(rec,'fm7 pc5');
 await shot(p,'shot-1440-account-save-fm7-pc5-retry-done.png');
});
// ── END ui-cloud-account-save-prior-collector-hardening-append ──
// ── BEGIN ui-cloud-account-save-prior-collector-stale-account-append ──
// fm9: STALE-ACCOUNT INTERRUPTION DURING THE PRECOMMIT PRIOR-LIST READ
// (the gap explicitly deferred by the fm7pc checkpoint). The fm7pc runs proved
// the collector's own cycle/duplicate/immutability guards; the runSave
// q.owner guard review there noted that a dedicated precommit-LIST-INTERRUPTION
// browser test (held page + account switch, A→B then A→B→A) was the deliberate
// next dispatch. These are EXISTING-CORRECT PROOFS on the accepted hardened
// production bytes (no manufactured product RED): the guards were reviewed as
// correct, and if the first run passes the journeys are labelled coverage.
// The interruption is tested at the collector's FIRST await boundary: the
// confirmed Save dispatches the real limit=20 prior-page GET through the
// accepted intent (armCommitObserver-style route.fetch passthrough HOLD —
// LABELLED browser-layer capture, never a backend-outage claim), the ACTUAL
// upstream 200 with the literal seeded accountA record content is proved
// BEFORE any boundary crossing (held-response readiness lesson), then the
// SUPPORTED session API switches accounts while the exact original page
// response is still held. Expected outcomes under the EXISTING policy:
// handleSessionChange (loading/signed-in: skip) invalidates the owned queue
// immediately; the late delivered original 200 settles through the REAL
// session-generation + intent guards as stale_account; the collector returns
// OWNER_LOST and runSave drops silently — NO commit POST ever starts, NO
// stale failure or success line appears, NO revival of the queue/lock/retained
// capture, the uncommitted queued draft stays browser-local and byte-unchanged
// (account session switch is INDEPENDENT of browser local-draft semantics —
// nothing here makes a local draft account-private), and real HTTP readbacks
// show accountA usage unchanged at exactly its ONE seeded record, the queued
// draft id 404 under BOTH accounts, accountB usage 0 with its own list
// excluding everything. Request assertions are scoped to COMMIT POSTS and the
// collector's own limit=20 dispatches — an explicit account switch may
// legitimately dispatch its own /api/session verification (recorded, not
// overclaimed as zero network). Fictional emulator accounts via the accepted
// account()/commit()/directUsage helpers; receipts carry opaque ids, statuses,
// counts, hashes and events only — never credentials or raw private text.
// Runner change is filename-allowlist registration ONLY (derived fm9 runner,
// fm7 792fa815… bytes untouched as its exact prefix, canonical 602f… untouched).
// Derived harness = immutable 0fe1c151… fm7pc harness bytes as FULL prefix +
// marked EOF append(s); deleting from the first BEGIN marker to EOF reproduces
// the prefix byte-exact.
// mountListMocksTransparentForwarder: TEST-ONLY, injected through the existing
// explicit harness handle BEFORE the journey (exact accepted
// mountGetMockTransparentForwarder pattern for client.listMocks). It replaces
// only the listMocks property on the SHARED client object with a function that
// delegates to the untouched ORIGINAL client method and records that actual
// Promise's settlement (phase + sanitized typed code). No result is
// synthesized, every production session/intent/network guard stays in force,
// and the forwarder re-throws the EXACT original error object. The History
// controller only loads on the history route (never visited here) and
// account-access is not attached in this connection, so listMocks settle
// events map 1:1 to save-collector page attempts.
const mountListMocksTransparentForwarder=p=>p.evaluate(()=>{
 const h=window.__uicSaveHarness;
 if(!h||!h.client||typeof h.client.listMocks!=='function')throw new Error('client.listMocks missing before forwarder mount');
 const orig=h.client.listMocks.bind(h.client);
 window.__uicListSettles=[];
 h.client.listMocks=async(...args)=>{
  const index=window.__uicListSettles.length;
  window.__uicListSettles.push({index,startedAt:Date.now(),phase:'dispatched',limit:(args[0]&&args[0].limit)||null,after:(args[0]&&args[0].after)===null?'(null)':String((args[0]&&args[0].after)||'')});
  try{
   const reply=await orig(...args);
   window.__uicListSettles[index]={...window.__uicListSettles[index],phase:'fulfilled',settledAt:Date.now()};
   return reply; // the EXACT original reply object
  }catch(error){
   const code=error&&typeof error.code==='string'?error.code:null;
   window.__uicListSettles[index]={...window.__uicListSettles[index],phase:'rejected',code,settledAt:Date.now()};
   throw error; // re-throw the ORIGINAL rejection untouched
  }
 };
 return {mounted:true};
});
const readListSettles=p=>p.evaluate(()=>window.__uicListSettles.slice());
const waitListSettled=async(p,count,ms=15000)=>{await p.waitForFunction(n=>window.__uicListSettles&&window.__uicListSettles.length>=n&&window.__uicListSettles.every(x=>x.phase!=='dispatched'),count,{timeout:ms}).catch(()=>harness('fm9: the held prior-page receipt attempt never settled through the transparent forwarder within '+ms+'ms'));};
// holdFirstCollectorList: intercepts the FIRST collector-scoped list GET
// (exact pathname /api/mocks with limit=20 ONLY — the collector dispatch;
// every other request passes through UNCHANGED: History's real limit=10
// reloads keep the real server, accepted fm7pc fixture-scoping lesson) with
// route.fetch() so the real request ACTUALLY reaches the real server. The
// captured ORIGINAL response (status/body/ETag if present) is held until the
// test explicitly releases it; the release re-delivers that EXACT original
// status, body and original ETag header when present. Subsequent
// collector-scoped GETs pass through truthfully (they must never happen here;
// a second call is recorded as fixture evidence, not silently swallowed).
async function holdFirstCollectorList(p,hold){
 hold.calls=0;hold.receipt=null;hold.error=null;hold.released=false;hold.events=[];
 let resolveReady;hold.ready=new Promise(r=>{resolveReady=r;});
 await p.route(PC_LIST,async route=>{
  const u=new URL(route.request().url());
  if(u.pathname!=='/api/mocks'||u.searchParams.get('limit')!=='20')return route.continue();
  hold.calls++;
  if(hold.receipt===null){
   try{
    const resp=await route.fetch();
    const text=await resp.text();
    let body=null;try{body=JSON.parse(text);}catch{}
    hold.receipt={status:resp.status(),body,text,etag:resp.headers()['etag']??null};
    hold.events.push('first-collector-page-fetched:status='+resp.status());
   }catch(e){hold.error=String(e&&e.message||e);hold.events.push('fixture-error:'+hold.error);}
   resolveReady();
   // Bounded hold: released ONLY by an explicit test call, never empty.
   await new Promise(r=>{hold.release=async()=>{if(hold.released)return;hold.released=true;hold.events.push('original-page-released:status='+hold.receipt.status+':etag='+String(hold.receipt.etag));r();};});
   if(hold.error||!hold.receipt)await route.abort().catch(()=>{});
   else await route.fulfill({status:hold.receipt.status,headers:{'content-type':'application/json; charset=utf-8',...(hold.receipt.etag!==null?{etag:hold.receipt.etag}:{})},body:hold.receipt.text}).catch(()=>{});
   return;
  }
  const resp=await route.fetch();
  const text=await resp.text();
  const et=resp.headers()['etag'];
  hold.events.push('subsequent-collector-page-fetched:status='+resp.status());
  await route.fulfill({status:resp.status(),contentType:'application/json',...(et?{headers:{etag:et}}:{}),body:text});
 });
}
const clearStListHold=p=>p.unroute(PC_LIST);

// ── st1switchab: A→B switch while the FIRST precommit prior page is HELD.
// The real limit=20 page (one seeded accountA record, nextCursor null) is
// fetched upstream and proven before the boundary; the supported session API
// then switches to a fresh verified accountB (no intermediate logout) before
// the release. Zero commit POSTs at every stage; the late release settles as
// the real stale_account rejection; silent drop — no stale failure, no
// success, no revived queue/lock/retained capture, nothing applied at the
// seam; the uncommitted draft byte-unchanged; usage/404 isolation readbacks
// over real HTTP.
test('account save fm9 stale collector: st1switchab a confirmed save whose held first precommit prior page (real upstream 200 carrying accountA literal seeded record) is interrupted by a verified direct A-to-B account switch before release starts zero commit POSTs invalidates the owned queue silently with no stale failure or success applies nothing revives no queue lock or retained draft keeps the uncommitted browser-local draft byte-unchanged and leaves accountA usage at exactly one seeded record with the queued draft id 404 under both accounts',async()=>{
 const acctA=await account();
 const acctB=await account();
 const seeded=await commit(acctA.token); // REAL direct commit: one actual record under A
 assert.equal(seeded.created,true,'fm9 st1 fixture: the seeded prior record is a real 201 commit');
 assert.equal(await directUsage(acctA.token),1,'fm9 st1 fixture: accountA starts with exactly one real record');
 assert.equal(await directUsage(acctB.token),0,'fm9 st1 fixture: fresh accountB usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acctA);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm9 st1: save seam and module must be live');
 assert.equal(connected.signedInUid,acctA.uid,'fm9 st1: the journey starts signed in under real accountA');
 await wrapPriorApplyObserver(p);
 await mountListMocksTransparentForwarder(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p); // the queued new draft stays browser-local/UNCOMMITTED
 assert.equal(await currentRoute(p),'selection','fm9 st1: the confirmed Save is issued from the selection route');
 const draftBefore=await localDraft(p);
 const draftHashBefore=sha(Buffer.from(JSON.stringify(draftBefore)));
 const hold={};
 await holdFirstCollectorList(p,hold);
 // Commit-POST baseline recorded IMMEDIATELY BEFORE Confirm.
 const commitBaseline=commitCount(rec);
 assert.equal(obs.commits.length,0,'fm9 st1: zero observer-recorded commit POSTs before confirmation');
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: the first collector list GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'fm9 st1 held-page capture must succeed: '+hold.error);
 // BEFORE the switch: await the ACTUAL upstream 200 and validate the real
 // accountA page contents/cursor (a loading indicator proves dispatch at
 // most, not capture — held-response readiness lesson).
 assert.equal(hold.receipt.status,200,'fm9 st1: the first collector page is a real upstream HTTP 200');
 assert.ok(Array.isArray(hold.receipt.body.items),'fm9 st1: the held page carries an items array');
 assert.deepEqual(hold.receipt.body.items.map(i=>i.summary.id),[seeded.id],'fm9 st1: the held page contains the literal seeded accountA record and NOTHING else (no accidental queued-draft record)');
 assert.equal(hold.receipt.body.items[0].summary.title,'Fictional usage probe','fm9 st1: the held page carries the actual storage title of the seeded record');
 assert.ok(!hold.receipt.body.items.some(i=>i.summary.id===id),'fm9 st1: the queued uncommitted draft id is absent from real accountA storage');
 assert.equal(hold.receipt.body.nextCursor,null,'fm9 st1: the single-page accountA catalogue cursor is complete (null)');
 assert.equal(hold.calls,1,'fm9 st1: exactly one collector-scoped page dispatch has reached the fixture');
 const settlesHeld=await readListSettles(p);
 assert.equal(settlesHeld.length,1,'fm9 st1: exactly one collector page attempt dispatched');
 assert.equal(settlesHeld[0].phase,'dispatched','fm9 st1: the page attempt is still in flight before the boundary');
 await p.waitForSelector('[data-account-save="status"]',{timeout:15000});
 const stateBefore=await saveState(p);
 assert.equal(stateBefore.phase,'pending','fm9 st1: the controller is pending on the held prior page');
 assert.equal(stateBefore.lockedId,id,'fm9 st1: the held page locks the owned draft');
 assert.deepEqual(await readPriorAcks(p),[],'fm9 st1: no snapshot applied while the page is held');
 assert.equal(obs.commits.length,0,'fm9 st1: zero commit POSTs while the prior page is held');
 assert.equal(commitCount(rec),commitBaseline,'fm9 st1: no commit request reached the browser layer while held');
 const apiBeforeBoundary=rec.api.length;
 // The supported real-session DIRECT switch A→B (no intermediate explicit
 // logout, no session replacement, no fake state), exactly the accepted
 // lc5crossacct boundary pattern. The page response stays HELD across it.
 const switched=await p.evaluate(async({uid,token})=>{
  const h=window.__uicSaveHarness;
  window.__uicStateRefA=h.session.getState(); // frozen accountA state object identity
  h.accounts[uid]=token;
  await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});
  const s=h.session.getState();
  return {status:s.status,uid:s.uid};
 },{uid:acctB.uid,token:acctB.token});
 assert.equal(switched.status,'signed-in','fm9 st1: the direct A→B switch ends verified signed-in as accountB');
 assert.equal(switched.uid,acctB.uid,'fm9 st1: the SAME session now verifies the fresh REAL accountB');
 const sessionEventsSwitch=await p.evaluate(()=>window.__uicSaveHarness.events.slice());
 assert.ok(sessionEventsSwitch.some(e=>e==='signed-in:'+acctB.uid),'fm9 st1: the real session published signed-in for accountB: '+JSON.stringify(sessionEventsSwitch));
 assert.ok(!sessionEventsSwitch.includes('signed-out'),'fm9 st1: the switch used NO intermediate explicit logout');
 // WHILE SWITCHED (before any release): the owned queue dropped immediately
 // at the loading publish — silent invalidation, NOT a stale failure copy.
 const stateSwitch=await saveState(p);
 assert.equal(stateSwitch.phase,null,'fm9 st1: the account switch immediately invalidates the accountA-owned queue (phase cleared, silent drop — no stale failure line)');
 assert.equal(stateSwitch.lockedId,null,'fm9 st1: the switch clears the submitted-draft lock identity');
 assert.equal(stateSwitch.retainedId,null,'fm9 st1: the switch drops the retained accountA queue (no stale queue revival)');
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'fm9 st1: no stale failure/success private feedback survives the switch');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'fm9 st1: no pending private line survives the switch');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm9 st1: no success claim appears');
 assert.equal(await p.locator('[data-account-save-lock="note"]').count(),0,'fm9 st1: no lock note survives the switch');
 assert.equal(await p.locator('[data-act="account-save-retry"]').count(),0,'fm9 st1: no Retry control survives the switch');
 assert.deepEqual(await readPriorAcks(p),[],'fm9 st1: nothing has applied at the seam across the switch');
 assert.equal(obs.commits.length,0,'fm9 st1: still zero commit POSTs while switched under accountB');
 assert.equal(commitCount(rec),commitBaseline,'fm9 st1: the switch itself issued no commit request');
 assert.equal(await currentRoute(p),'selection','fm9 st1: the switch forced no navigation');
 const draftSwitch=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftSwitch))),draftHashBefore,'fm9 st1: the browser-local draft is byte-unchanged by the switch (tab-local semantics; the switch makes no account-private claim)');
 // Settle any legitimate B-side refresh, THEN baseline so the post-release
 // delta isolates requests caused by the late page landing.
 await settle(500);
 const apiBeforeRelease=rec.api.length;
 const settlesPre=await readListSettles(p);
 assert.equal(settlesPre.length,1,'fm9 st1: exactly one page attempt dispatched across the boundary');
 assert.equal(settlesPre[0].phase,'dispatched','fm9 st1: the held page attempt is still unsettled at the release point');
 const dispatchToReleaseMs=Date.now()-settlesPre[0].startedAt;
 assert.equal(dispatchToReleaseMs<14000,true,'fm9 st1: the held page is released inside the real 15s client request timeout (in-flight window '+dispatchToReleaseMs+'ms) so the settlement is a real network delivery, not an abort');
 await shot(p,'shot-1440-account-save-fm9-st1-switched-before-release.png');
 // Release: the EXACT original accountA 200 page lands while accountB is the
 // verified account (the accepted hold re-delivers its own captured receipt).
 await hold.release();
 await waitListSettled(p,1);
 const settles=await readListSettles(p);
 assert.equal(settles.length,1,'fm9 st1: the release caused no additional collector page attempt');
 assert.equal(settles[0].phase,'rejected','fm9 st1: the stale page attempt settles through the REAL session/intent generation guards while accountB is active');
 assert.equal(settles[0].code,'stale_account','fm9 st1: the settlement is the real account-generation staleness over the original delivered 200, not a harness error');
 assert.ok(hold.events.some(e=>e==='original-page-released:status=200:etag='+(hold.receipt.etag??null)),'fm9 st1: the release delivered the EXACT original 200 page with the original ETag when present: '+JSON.stringify(hold.events));
 assert.equal(hold.calls,1,'fm9 st1: the interrupted collector never dispatched a second page under accountB');
 await settle(600);
 // Settled suppression outcomes under accountB: nothing applied, nothing
 // revived, nothing presented.
 const stateFinal=await saveState(p);
 assert.equal(stateFinal.phase,null,'fm9 st1: the settled stale page revives no phase');
 assert.equal(stateFinal.lockedId,null,'fm9 st1: the settled stale page revives no lock');
 assert.equal(stateFinal.retainedId,null,'fm9 st1: the settled stale page revives no retained queue');
 assert.deepEqual(await readPriorAcks(p),[],'fm9 st1: the released stale page applied NOTHING to the app seam');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm9 st1: no success claim after the settled stale release');
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'fm9 st1: no stale failure line after the settled stale release');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'fm9 st1: no pending line after the settled stale release');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'fm9 st1: no detail or record opens automatically');
 assert.equal(await currentRoute(p),'selection','fm9 st1: the stale release forces no navigation');
 const draftFinal=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftFinal))),draftHashBefore,'fm9 st1: the durable browser-local draft stays FULLY unchanged through the switch and the stale release');
 assert.equal(draftFinal.draft.id,id,'fm9 st1: the unchanged draft keeps the original queued stable ID');
 assert.deepEqual(draftFinal.mocks,[],'fm9 st1: cloud work never merges into local mocks');
 assert.equal(draftFinal.used,0,'fm9 st1: the local counter stays untouched');
 assert.deepEqual(draftFinal.savedIds,[],'fm9 st1: savedIds stays untouched');
 assert.equal(obs.commits.length,0,'fm9 st1: ZERO commit POSTs across the whole held-switch-release lifecycle');
 assert.equal(commitCount(rec),commitBaseline,'fm9 st1: zero new commit requests at every stage (held, switched, released)');
 assert.equal(rec.api.length,apiBeforeRelease,'fm9 st1: zero NEW browser requests were caused by the stale release after the post-switch baseline (the switch /api/session verification itself is accounted separately: '+apiBeforeRelease+'/'+apiBeforeBoundary+')');
 // Real HTTP isolation: accountA keeps EXACTLY the one seeded record, the
// queued draft durably 404s under BOTH accounts, accountB stays at zero.
 assert.equal(await directUsage(acctA.token),1,'fm9 st1: accountA usage unchanged at exactly 1 (one seed, zero save debits)');
 const itemA=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{'authorization':'Bearer '+acctA.token},credentials:'omit'});
 assert.equal(itemA.status,404,'fm9 st1: the queued draft id never committed — real 404 under accountA');
 const itemB=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{'authorization':'Bearer '+acctB.token},credentials:'omit'});
 assert.equal(itemB.status,404,'fm9 st1: the queued draft id 404s under accountB too (existing private 404 contract)');
 const itemBErr=await itemB.json().catch(()=>null);
 assert.equal(itemBErr&&itemBErr.error,'mock_not_found','fm9 st1: the B-side 404 is the existing mock_not_found contract: '+JSON.stringify(itemBErr));
 assert.equal(await directUsage(acctB.token),0,'fm9 st1: accountB usage stays 0 — the stale release caused no debit under B');
 const listB=await fetch(base+'/api/mocks?limit=10',{headers:{'authorization':'Bearer '+acctB.token},credentials:'omit'});
 assert.equal(listB.status,200,'fm9 st1: the B-side real-server list reads 200');
 const listBJ=await listB.json();
 assert.deepEqual(listBJ.items.map(i=>i.summary.id),[],'fm9 st1: accountB owns NO saved records');
 const listA=await fetch(base+'/api/mocks?limit=10',{headers:{'authorization':'Bearer '+acctA.token},credentials:'omit'});
 const listAJ=await listA.json();
 assert.deepEqual(listAJ.items.map(i=>i.summary.id),[seeded.id],'fm9 st1: accountA storage is EXACTLY the one seeded record — no ghost commit landed');
 await shot(p,'shot-1440-account-save-fm9-st1-final.png');
 await fs.writeFile(new URL('st1switchab-receipt.json',out),JSON.stringify({seededId:seeded.id,queuedDraftId:id,switchStatus:switched.status,sessionEvents:sessionEventsSwitch.slice(),listEvents:hold.events.slice(),settles:(await readListSettles(p)).map(x=>({index:x.index,limit:x.limit,after:x.after,phase:x.phase,code:x.code||null})),draftHashBefore,draftHashFinal:sha(Buffer.from(JSON.stringify(draftFinal))),finalPhase:stateFinal.phase,finalLockedId:stateFinal.lockedId,finalRetainedId:stateFinal.retainedId,acksAtEnd:await readPriorAcks(p),commitCount:obs.commits.length,requestsBeforeBoundary:apiBeforeBoundary,requestsBeforeRelease:apiBeforeRelease,requestsFinal:rec.api.length,inFlightMs:dispatchToReleaseMs,pageHeld:{status:hold.receipt.status,etag:hold.receipt.etag,ids:hold.receipt.body.items.map(i=>i.summary.id),nextCursor:hold.receipt.body.nextCursor},usageAPost:await directUsage(acctA.token),usageBPost:await directUsage(acctB.token),itemAStatus:itemA.status,itemBStatus:itemB.status},null,2));
 await clearStListHold(p);
 await clearCommitObserver(p);
 checkClean(rec,'fm9 st1switchab');
});
// ── END ui-cloud-account-save-prior-collector-stale-account-append ──
// ── BEGIN ui-cloud-account-save-prior-collector-stale-account-aba-append ──
// fm9 append 2 (authored and run ONLY AFTER the st1switchab A→B GREEN above —
// sequential vertical slices; the immutable 0fe1c151… prefix and the exact
// st1 append bytes remain the FULL prefix; helpers mountListMocksTransparent-
// Forwarder/holdFirstCollectorList/readListSettles/waitListSettled/
// clearStListHold defined in append 1 are reused unchanged at module scope).
// st2switchaba: the A→B→A case. The held first precommit page belongs to the
// ORIGINAL signed-in accountA; the switch goes to verified accountB and then
// BACK to the SAME accountA (restored, verified signed-in, and explicitly
// proven to be a NEW frozen session-state object — same UID is NOT identity;
// the generation guard keys on object identity/generation counter). The
// ORIGINAL held accountA 200 page is released ONLY AFTER the same-UID
// restoration, so this exercises the accepted same-UID late-delivery case at
// the precommit LIST await boundary (the lc4sessb lesson, one await earlier):
// both setAccount legs publish through the real session; the late original
// page must still settle as the real stale_account rejection through the
// untouched session/intent guards (generation moved twice), the collector
// must return OWNER_LOST and runSave must drop SILENTLY — no stale failure,
// no success, no revived queue/lock/retained capture under the restored
// generation, nothing applied at the seam, the uncommitted browser-local
// draft byte-unchanged (session switch and browser draft semantics remain
// independent — no account-private draft claim), zero commit POSTs at every
// stage, and real-HTTP readbacks: accountA usage stays exactly its ONE
// seeded record, the queued draft id 404s under BOTH A and B, accountB usage
// 0 and its own list empty/excluding everything. Requests are scoped to
// commit POSTs + the collector's own limit=20 dispatch count; the two switch
// legs' own /api/session verifications are recorded, never overclaimed as
// zero all-network. LABELLED browser-layer page capture, not a backend
// outage. Existing-correct proof convention: no manufactured product RED —
// a first-run pass is labelled coverage of the reviewed owner/generation
// guards at the precommit LIST boundary.
test('account save fm9 stale collector: st2switchaba a confirmed save whose held first precommit prior page is interrupted by a verified A-to-B switch and a same-UID A restoration to a new frozen state generation before the exact original accountA page is released starts zero commit POSTs settles the late page as the real stale_account rejection drops silently with no stale failure or success applies nothing revives no queue lock or retained draft keeps the uncommitted browser-local draft byte-unchanged and leaves accountA usage at exactly one seeded record with the queued draft id 404 under both accounts',async()=>{
 const acctA=await account();
 const acctB=await account();
 const seeded=await commit(acctA.token); // REAL direct commit: one actual record under A
 assert.equal(seeded.created,true,'fm9 st2 fixture: the seeded prior record is a real 201 commit');
 assert.equal(await directUsage(acctA.token),1,'fm9 st2 fixture: accountA starts with exactly one real record');
 assert.equal(await directUsage(acctB.token),0,'fm9 st2 fixture: fresh accountB usage 0 (B seeded with 0 records)');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acctA);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm9 st2: save seam and module must be live');
 assert.equal(connected.signedInUid,acctA.uid,'fm9 st2: the journey STARTS held while signed in under real accountA');
 await wrapPriorApplyObserver(p);
 await mountListMocksTransparentForwarder(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 const id=await saveJourneys(p); // queued new draft: UNCOMMITTED, stays browser-local
 assert.equal(await currentRoute(p),'selection','fm9 st2: the confirmed Save is issued from the selection route');
 const draftBefore=await localDraft(p);
 const draftHashBefore=sha(Buffer.from(JSON.stringify(draftBefore)));
 const hold={};
 await holdFirstCollectorList(p,hold);
 const commitBaseline=commitCount(rec);
 assert.equal(obs.commits.length,0,'fm9 st2: zero observer-recorded commit POSTs before confirmation');
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await Promise.race([hold.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('harness: the first collector list GET was never intercepted within the window')),20000))]);
 assert.equal(hold.error,null,'fm9 st2 held-page capture must succeed: '+hold.error);
 // BEFORE any boundary: await + validate the ACTUAL upstream 200 accountA
// page (literal seeded record, cursor) — held-response readiness lesson.
 assert.equal(hold.receipt.status,200,'fm9 st2: the first collector page is a real upstream HTTP 200');
 assert.deepEqual(hold.receipt.body.items.map(i=>i.summary.id),[seeded.id],'fm9 st2: the held page contains the literal seeded accountA record and NOTHING else');
 assert.ok(!hold.receipt.body.items.some(i=>i.summary.id===id),'fm9 st2: the queued uncommitted draft id is absent from real accountA storage before the ABA');
 assert.equal(hold.receipt.body.nextCursor,null,'fm9 st2: the single-page accountA catalogue cursor is complete (null)');
 await p.waitForSelector('[data-account-save="status"]',{timeout:15000});
 assert.equal((await saveState(p)).phase,'pending','fm9 st2: the controller is pending on the held prior page under accountA');
 assert.equal(obs.commits.length,0,'fm9 st2: zero commit POSTs while the prior page is held under accountA');
 const apiBeforeBoundary=rec.api.length;
 // (b) First leg: DIRECT verified switch accountA → accountB while held.
 const leg1=await p.evaluate(async({uid,token})=>{
  const h=window.__uicSaveHarness;
  window.__uicStateRefA1=h.session.getState(); // frozen ORIGINAL accountA state object
  h.accounts[uid]=token;
  await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});
  const s=h.session.getState();
  return {status:s.status,uid:s.uid};
 },{uid:acctB.uid,token:acctB.token});
 assert.equal(leg1.status,'signed-in','fm9 st2: leg 1 ends verified signed-in as accountB');
 assert.equal(leg1.uid,acctB.uid,'fm9 st2: the SAME session now verifies accountB');
 const stateMid=await saveState(p);
 assert.equal(stateMid.phase,null,'fm9 st2: leg 1 immediately invalidates the accountA-owned queue');
 assert.equal(stateMid.lockedId,null,'fm9 st2: leg 1 clears the submitted-draft lock');
 assert.equal(stateMid.retainedId,null,'fm9 st2: leg 1 drops the retained queue (no revival on B)');
 assert.equal(obs.commits.length,0,'fm9 st2: zero commit POSTs under accountB before restoration');
 // (c) Second leg: restore the SAME accountA through the SAME session while
// the ORIGINAL held page is still unsettled — the ABA restoration must mint
// a NEW frozen state object (new generation), not reuse the old identity.
 const leg2=await p.evaluate(async({uid})=>{
  const h=window.__uicSaveHarness;
  await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});
  const s=h.session.getState();
  return {status:s.status,uid:s.uid,sameRefAsOriginal:window.__uicStateRefA1===h.session.getState()};
 },{uid:acctA.uid});
 assert.equal(leg2.status,'signed-in','fm9 st2: same-UID restoration restores a VERIFIED signed-in state over the real /api/session');
 assert.equal(leg2.uid,acctA.uid,'fm9 st2: restoration is the SAME actual accountA (uid)');
 assert.equal(leg2.sameRefAsOriginal,false,'fm9 st2: the restored state is a NEW frozen session-state object — same UID is NOT the guard identity (generation moved)');
 const sessionEventsSwitch=await p.evaluate(()=>window.__uicSaveHarness.events.slice());
 assert.ok(sessionEventsSwitch.some(e=>e==='signed-in:'+acctB.uid)&&sessionEventsSwitch.filter(e=>e==='signed-in:'+acctA.uid).length>=2,'fm9 st2: both switch legs published real signed-in states through the existing connection: '+JSON.stringify(sessionEventsSwitch));
 // UNDER THE RESTORED GENERATION, BEFORE the release: the obsolete queue
// must stay dropped — restoration revives nothing, and a fresh signed-in
// never re-runs an old collector.
 const stateRestored=await saveState(p);
 assert.equal(stateRestored.phase,null,'fm9 st2: the still-held page revives no queue under the restored accountA generation');
 assert.equal(stateRestored.lockedId,null,'fm9 st2: same-UID restoration revives no read-only lock');
 assert.equal(stateRestored.retainedId,null,'fm9 st2: same-UID restoration revives no retained queue');
 assert.deepEqual(await readPriorAcks(p),[],'fm9 st2: nothing applied at the seam before the release');
 assert.equal(obs.commits.length,0,'fm9 st2: still zero commit POSTs under the restored generation before release');
 assert.equal(commitCount(rec),commitBaseline,'fm9 st2: the ABA switch legs issued no commit request');
 assert.equal(await currentRoute(p),'selection','fm9 st2: the ABA switch forced no navigation');
 const draftMid=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftMid))),draftHashBefore,'fm9 st2: the browser-local draft is byte-unchanged across the ABA switch (tab-local semantics independent of account session; no account-private draft claim)');
 // Settle any legitimate restored-A refresh, THEN baseline the release delta.
 await settle(500);
 const apiBeforeRelease=rec.api.length;
 const settlesPre=await readListSettles(p);
 assert.equal(settlesPre.length,1,'fm9 st2: exactly one collector page attempt dispatched across the ABA');
 assert.equal(settlesPre[0].phase,'dispatched','fm9 st2: the ORIGINAL accountA page attempt is still unsettled at the release point');
 const dispatchToReleaseMs=Date.now()-settlesPre[0].startedAt;
 assert.equal(dispatchToReleaseMs<14000,true,'fm9 st2: the held page is released inside the real 15s client request timeout (in-flight window '+dispatchToReleaseMs+'ms across both switch legs) so the settlement is a real network delivery, not an abort');
 assert.equal(await currentRoute(p),'selection','fm9 st2: the settled restored-A refresh forced no navigation before release');
 await shot(p,'shot-1440-account-save-fm9-st2-restored-before-release.png');
 // (d) Release LAST: the EXACT original accountA 200 page lands under the
// RESTORED same-UID generation (the accepted hold re-delivers its capture).
 await hold.release();
 await waitListSettled(p,1);
 const settles=await readListSettles(p);
 assert.equal(settles.length,1,'fm9 st2: the release caused no additional collector page attempt');
 assert.equal(settles[0].phase,'rejected','fm9 st2: the obsolete original-accountA page attempt settles through the REAL session/intent generation guards even under the restored same UID');
 assert.equal(settles[0].code,'stale_account','fm9 st2: the settlement is the real account-generation staleness over the original delivered 200 — same UID does NOT equal same generation — not a harness error');
 assert.ok(hold.events.some(e=>e==='original-page-released:status=200:etag='+(hold.receipt.etag??null)),'fm9 st2: the release delivered the EXACT original 200 page with the original ETag when present: '+JSON.stringify(hold.events));
 assert.equal(hold.calls,1,'fm9 st2: the interrupted collector never dispatched a second page across the whole ABA');
 await settle(600);
 // (e) Settled suppression outcomes under the RESTORED accountA generation.
 const stateFinal=await saveState(p);
 assert.equal(stateFinal.phase,null,'fm9 st2: the settled stale page revives no phase under restored A (silent drop — no stale failure line)');
 assert.equal(stateFinal.lockedId,null,'fm9 st2: the settled stale page revives no lock under restored A');
 assert.equal(stateFinal.retainedId,null,'fm9 st2: the settled stale page revives no retained queue under restored A');
 assert.deepEqual(await readPriorAcks(p),[],'fm9 st2: the released stale page applied NOTHING to the app seam');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm9 st2: no success claim appears');
 assert.equal(await p.locator('[data-account-save="error"]').count(),0,'fm9 st2: no stale failure line appears after the settled stale release');
 assert.equal(await p.locator('[data-account-save="status"]').count(),0,'fm9 st2: no pending line appears after the settled stale release');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'fm9 st2: no detail or record opens automatically');
 assert.equal(await currentRoute(p),'selection','fm9 st2: the stale release forces no navigation');
 const draftFinal=await localDraft(p);
 assert.equal(sha(Buffer.from(JSON.stringify(draftFinal))),draftHashBefore,'fm9 st2: the durable browser-local draft stays FULLY unchanged through the ABA switch and the stale release');
 assert.equal(draftFinal.draft.id,id,'fm9 st2: the unchanged draft keeps the original queued stable ID');
 assert.deepEqual(draftFinal.mocks,[],'fm9 st2: cloud work never merges into local mocks');
 assert.equal(draftFinal.used,0,'fm9 st2: the local counter stays untouched');
 assert.deepEqual(draftFinal.savedIds,[],'fm9 st2: savedIds stays untouched');
 assert.equal(obs.commits.length,0,'fm9 st2: ZERO commit POSTs across the whole held-switch-restore-release lifecycle');
 assert.equal(commitCount(rec),commitBaseline,'fm9 st2: zero new commit requests at every stage (held, switched, restored, released)');
 assert.equal(rec.api.length,apiBeforeRelease,'fm9 st2: zero NEW browser requests were caused by the stale release after the post-restoration baseline (the two switch /api/session verifications are accounted separately: '+apiBeforeRelease+'/'+apiBeforeBoundary+')');
 // (f) Real HTTP isolation readbacks after the ABA.
 assert.equal(await directUsage(acctA.token),1,'fm9 st2: accountA usage unchanged at exactly 1 (one seed, zero save debits across the ABA)');
 const itemA=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{'authorization':'Bearer '+acctA.token},credentials:'omit'});
 assert.equal(itemA.status,404,'fm9 st2: the queued draft id never committed — real 404 under accountA after the ABA');
 const itemB=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{'authorization':'Bearer '+acctB.token},credentials:'omit'});
 assert.equal(itemB.status,404,'fm9 st2: the queued draft id 404s under accountB too (existing private 404 contract)');
 const itemBErr=await itemB.json().catch(()=>null);
 assert.equal(itemBErr&&itemBErr.error,'mock_not_found','fm9 st2: the B-side 404 is the existing mock_not_found contract: '+JSON.stringify(itemBErr));
 assert.equal(await directUsage(acctB.token),0,'fm9 st2: accountB usage stays 0 — the stale release caused no debit under B');
 const listB=await fetch(base+'/api/mocks?limit=10',{headers:{'authorization':'Bearer '+acctB.token},credentials:'omit'});
 const listBJ=await listB.json();
 assert.equal(listB.status,200,'fm9 st2: the B-side real-server list reads 200');
 assert.deepEqual(listBJ.items.map(i=>i.summary.id),[],'fm9 st2: accountB owns NO saved records');
 const listA=await fetch(base+'/api/mocks?limit=10',{headers:{'authorization':'Bearer '+acctA.token},credentials:'omit'});
 const listAJ=await listA.json();
 assert.deepEqual(listAJ.items.map(i=>i.summary.id),[seeded.id],'fm9 st2: accountA storage is EXACTLY the one seeded record — no ghost commit landed and the queued draft never surfaced');
 await shot(p,'shot-1440-account-save-fm9-st2-final.png');
 await fs.writeFile(new URL('st2switchaba-receipt.json',out),JSON.stringify({seededId:seeded.id,queuedDraftId:id,leg1Status:leg1.status,leg2Status:leg2.status,restoredSameRefAsOriginal:leg2.sameRefAsOriginal,sessionEvents:sessionEventsSwitch.slice(),listEvents:hold.events.slice(),settles:(await readListSettles(p)).map(x=>({index:x.index,limit:x.limit,after:x.after,phase:x.phase,code:x.code||null})),draftHashBefore,draftHashFinal:sha(Buffer.from(JSON.stringify(draftFinal))),finalPhase:stateFinal.phase,finalLockedId:stateFinal.lockedId,finalRetainedId:stateFinal.retainedId,acksAtEnd:await readPriorAcks(p),commitCount:obs.commits.length,requestsBeforeBoundary:apiBeforeBoundary,requestsBeforeRelease:apiBeforeRelease,requestsFinal:rec.api.length,inFlightMs:dispatchToReleaseMs,pageHeld:{status:hold.receipt.status,etag:hold.receipt.etag,ids:hold.receipt.body.items.map(i=>i.summary.id),nextCursor:hold.receipt.body.nextCursor},usageAPost:await directUsage(acctA.token),usageBPost:await directUsage(acctB.token),itemAStatus:itemA.status,itemBStatus:itemB.status},null,2));
 await clearStListHold(p);
 await clearCommitObserver(p);
 checkClean(rec,'fm9 st2switchaba');
});
// ── END ui-cloud-account-save-prior-collector-stale-account-aba-append ──
// ── BEGIN ui-cloud-account-save-second-recovery-safeguards-append ──
// fm10: SECOND-SAVE RECOVERY SAFEGUARDS (the gap explicitly deferred by the
// fm6 second-milestone checkpoint, lines 119+, after the fm9 stale-account
// await-boundary proofs). Derived harness = the immutable 933ff6c0e31315f9
// dd28707de2687c9b3dee5feadc1be860aebe971550061c5d fm9 harness bytes (itself
// the 0fe1c151… fm7pc prefix + st1 + st2 appends) as the FULL prefix plus
// THIS ONE marked EOF append; deleting everything from this BEGIN marker to
// EOF reproduces that prefix byte-exact (inverse proof in the build/receipt
// evidence). Runner change is filename-allowlist registration ONLY (derived
// fm10 runner; fm9 097db189… bytes untouched as its exact prefix, canonical
// 602f… untouched). No wrapper/generator/source-map family; base harnesses
// untouched; no production, backend, helper or domain edit.
// fm10secondcleanupdenied: EXISTING-CORRECT PROOF convention on the accepted
// hardened second-milestone bytes (app ccb031af…, save 2bf5801b…): the
// behaviour was reviewed as implemented (fm6 GREEN), so a first-run pass is
// labelled coverage — NO manufactured product RED. Journey: a REAL first
// account commit earns the accepted first leaf; a SECOND real native-confirmed
// save uses the EXACT same supported scores (equal estimated totals — the
// unchanged personalBests needs strictly greater, so the unchanged helper
// derives kind 'second', NOT a PB). The browser-local draft-cleanup persist is
// denied via the EXISTING accepted key-scoped Storage shim (armCleanupDenial,
// reused verbatim — a labelled browser-layer control, never a backend claim),
// armed only AFTER the review-filled draft and BEFORE the final save. Under
// denial: ONLY the truthful saved-but-cleanup-pending warning (SAVE_ERR_
// CLEANUP), NO feedback leaf of ANY kind (the fm6 second gate runs only after
// a SUCCESSFUL cleanup persist, so the second save earns nothing while the
// draft-clear fails), NO generic done line, the exact submitted draft
// retained, server usage exactly 2 (two real commits). Two repeated FAILED
// keyboard Retries (Enter then real Space activation, each re-confirmed
// through the same cancel-safe dialog) must keep focus usable on the Retry
// control across the re-renders, start ZERO new commit POSTs, recollect the
// prior list ZERO extra times (transparent listMocks forwarder counts the
// limit=20 collector dispatches), debit ZERO further (q.committed skip), and
// retain the SAME original true-created acknowledgement and the SAME prior
// snapshot OBJECT reference at the seam (the wrapPriorApplyObserver fourth-arg
// ref identity — no production mutation; the existing observer may inspect
// identity only). Releasing the denial then one explicit keyboard Retry
// completes ONLY the cleanup: the exact unchanged-helper-derived second leaf
// renders once beside the done line, the actual second detail shows the
// original text, the draft clears, local mocks/used/savedIds stay untouched
// (no browser history merge) and the whole journey holds exactly TWO commit
// POSTs. The consumed second leaf then never replays across Home, History
// re-entry, a supported reopen, or an ACTUAL page.reload with explicit
// fixture reattachment (fm5 convention: tab-local state reset, NOT live auth
// persistence). Receipts carry ids, statuses, counts and hashes only — never
// credentials or raw private text.
test('account save fm10 second recovery: fm10secondcleanupdenied after a real first account commit earning the accepted first leaf, a second real native-confirmed save over the exact same supported scores whose committed-cleanup persist is denied by the proven key-scoped storage fixture shows ONLY the truthful saved-but-cleanup-pending warning with NO feedback leaf of any kind and the exact submitted draft retained at usage 2, survives two repeated failed keyboard Retries (Enter then Space with real dialog confirmations) keeping focus usable on Retry with zero new commit POSTs zero prior-list recollection and zero further debit while retaining the same original true-created acknowledgement and the same prior snapshot object reference at the seam, then releasing the denial and one explicit keyboard Retry renders the unchanged-helper-derived SECOND leaf exactly once with the actual second detail and cleared draft, exactly two total commit POSTs across the whole journey and no browser history merge, and the consumed second leaf never replays across Home History re-entry a supported reopen or an actual page.reload',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fm10 fixture: fresh fictional emulator account starts at usage 0');
 const {mockSaveFeedback:helperFeedback}=await import('./estimated-score.js'); // UNCHANGED policy, read-only
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm10: save seam and module must be live for the second-save denied-cleanup journey');
 await wrapPriorApplyObserver(p); // records the ACTUAL fourth-arg prior reference + serialised copy
 await mountListMocksTransparentForwarder(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs); // passthrough: the ACTUAL 201 replies are delivered unchanged
 // ── PHASE 1: real first commit, accepted first leaf (precondition).
 const id1=await saveJourneys(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id:id1,used:1}}],'fm10 precondition: the first save is one real 201 created:true used:1 account commit');
 assert.equal(await directUsage(acct.token),1,'fm10 precondition: the first commit debited exactly once');
 const firstLeaf=p.locator('#mock-acknowledgement[data-feedback-kind="first"]');
 assert.equal(await firstLeaf.count(),1,'fm10 precondition: the FIRST leaf rendered exactly once after the first save');
 const priorResp=await directItem(acct.token,id1);
 assert.equal(priorResp.status,200,'fm10 fixture: the first record actually exists in the emulator store');
 const priorMock=(await priorResp.json()).mock;
 // ── PHASE 2: second save with the EXACT same supported scores.
 await p.locator('nav [data-act="home"]').click();
 await p.waitForSelector('[data-act="log"]',{timeout:15000});
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm10: the consumed first leaf never replays across the Home departure');
 const id2=await saveJourneys(p);
 assert.notEqual(id2,id1,'fm10 fixture: the second save is a new draft identity');
 // Denial armed AFTER the review-filled draft, BEFORE the final save (the
 // EXISTING accepted key-scoped Storage shim, reused verbatim).
 await armCleanupDenial(p);
 await setCleanupDeny(p,true);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 assert.equal(obs.commits.length,2,'fm10: the second save is a real second commit POST');
 assert.deepEqual(obs.commits[1],{status:201,body:{created:true,id:id2,used:2}},'fm10: the second ack is a real 201 created:true used:2');
 assert.equal(commitCount(rec),2,'fm10: exactly two commit requests reached the API so far');
 assert.equal(await directUsage(acct.token),2,'fm10: server usage exactly 2 after the second commit');
 // WHILE cleanup fails: ONLY the truthful saved-but-cleanup-pending warning;
 // NO feedback leaf of ANY kind (no second celebration, no first replay); no
 // done line; no detail; the exact submitted draft retained.
 assert.equal((await p.locator('[data-account-save="error"]').textContent()),SAVE_ERR_CLEANUP,'fm10: the denial states the truthful saved-but-cleanup-pending warning');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm10 NO FALSE CELEBRATION: no acknowledgement leaf of ANY kind while cleanup is pending');
 assert.equal(await p.locator('#mock-acknowledgement[data-feedback-kind="second"]').count(),0,'fm10: specifically no second leaf while cleanup is pending');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm10: no generic done line while cleanup is pending');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'fm10: no detail presentation while cleanup is pending');
 const storedDenied=await localDraft(p);
 assert.equal(storedDenied.draft&&storedDenied.draft.id,id2,'fm10: the exact submitted second draft is retained');
 const deniedPayload=JSON.stringify(storedDenied.draft);
 const stDenied=await saveState(p);
 assert.equal(stDenied.phase,'committed-cleanup-pending','fm10: committed-cleanup-pending phase');
 assert.equal(stDenied.lockedId,id2,'fm10: the submitted draft stays locked read-only');
 assert.equal(stDenied.retainedId,id2,'fm10: the retained capture is the second draft');
 const acksDenied=await readPriorAcks(p);
 assert.equal(acksDenied.length,2,'fm10: one apply at the first save plus one denied cleanup apply');
 assert.deepEqual(acksDenied[1].json.savedIds,[id1],'fm10: the denied apply carries the COMPLETE precommit prior snapshot (the first record only, never the queued second id)');
 // ERROR PRESENTATION SCREENSHOT BEFORE ANY RETRY.
 await shot(p,'shot-1440-account-save-fm10-cleanup-denied-before-retry.png');
 // ── REPEATED FAILED KEYBOARD RETRY #1 (Enter path, real confirmation).
 await keyboardRetryConfirm(p);
 await p.waitForFunction(()=>window.__uicPriorAcks&&window.__uicPriorAcks.length===3,null,{timeout:15000}).catch(()=>harness('fm10: the first denied retry never reached the seam apply'));
 assert.equal((await p.locator('[data-account-save="error"]').textContent()),SAVE_ERR_CLEANUP,'fm10: retry #1 while still denied keeps the truthful warning');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm10: retry #1 leaks no leaf of any kind');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm10: retry #1 leaks no done line');
 assert.deepEqual(obs.commits.slice(2),[],'fm10 NO RECURRENCE: the retained q.committed makes retry #1 start ZERO new commit POSTs');
 assert.equal(commitCount(rec),2,'fm10: still exactly two commit requests after retry #1');
 assert.equal(await directUsage(acct.token),2,'fm10: still exactly two server debits after retry #1');
 const settlesAfterRetry1=await readListSettles(p);
 assert.equal(settlesAfterRetry1.filter(s=>s.limit===20).length,2,'fm10 NO RECOLLECTION: one limit=20 collector dispatch per save — retry #1 never recollects the cached prior');
 assert.equal(JSON.stringify((await localDraft(p)).draft),deniedPayload,'fm10: the exact submitted draft is byte-unchanged by retry #1');
 // ── REPEATED FAILED KEYBOARD RETRY #2 (real Space activation, same dialog).
 const rb=p.locator('[data-act="account-save-retry"]');
 await rb.focus();
 assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.act),'account-save-retry','fm10 FOCUS USABLE: the Retry control keeps keyboard focus after the denied re-render before retry #2');
 await p.keyboard.press(' ');
 await p.getByRole('dialog').waitFor({state:'visible',timeout:5000});
 await confirmLogDialog(p).click();
 await p.waitForFunction(()=>window.__uicPriorAcks&&window.__uicPriorAcks.length===4,null,{timeout:15000}).catch(()=>harness('fm10: the second denied retry never reached the seam apply'));
 assert.equal((await p.locator('[data-account-save="error"]').textContent()),SAVE_ERR_CLEANUP,'fm10: retry #2 while still denied keeps the truthful warning');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm10: retry #2 leaks no leaf of any kind');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm10: retry #2 leaks no done line');
 assert.equal(obs.commits.length,2,'fm10 NO RECURRENCE: retry #2 still starts ZERO new commit POSTs');
 assert.equal(commitCount(rec),2,'fm10: still exactly two commit requests after retry #2');
 assert.equal(await directUsage(acct.token),2,'fm10: still exactly two server debits after retry #2');
 assert.equal((await readListSettles(p)).filter(s=>s.limit===20).length,2,'fm10 NO RECOLLECTION: retry #2 never recollects the cached prior either');
 assert.equal(JSON.stringify((await localDraft(p)).draft),deniedPayload,'fm10: the exact submitted draft is byte-unchanged by retry #2');
 // THE SAME original true-created ack AND the SAME prior snapshot OBJECT
 // reference are retained across every denied apply (observer identity, not
 // copies; production unmutated).
 const deniedIdentity=await p.evaluate(()=>{const r=window.__uicPriorAcks;const second=r.slice(1);return {secondApplyCount:second.length,allSameRef:second.every(e=>e.ref===second[0].ref),refFrozen:Object.isFrozen(second[0].ref)};});
 assert.deepEqual(deniedIdentity,{secondApplyCount:3,allSameRef:true,refFrozen:true},'fm10: the three denied second-save applies carry the SAME frozen prior snapshot object reference: '+JSON.stringify(deniedIdentity));
 // ── RELEASE the denial; one explicit keyboard Retry completes ONLY cleanup.
 await setCleanupDeny(p,false);
 await keyboardRetryConfirm(p);
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 await settle(1500);
 // The EXACT unchanged-helper-derived second leaf renders ONCE beside the
 // done line (fm6 GREEN behaviour; here proven on the retained snapshot path).
 const secondLeaf=p.locator('#mock-acknowledgement[data-feedback-kind="second"]');
 assert.equal(await secondLeaf.count(),1,'fm10: the released keyboard Retry renders the SECOND leaf exactly once');
 const detailResp=await directItem(acct.token,id2);
 assert.equal(detailResp.status,200,'fm10 fixture: the second record exists in the store after recovery');
 const mock2=(await detailResp.json()).mock;
 const expectedSecond=helperFeedback({mocks:[priorMock],used:1,savedIds:[id1]},{mocks:[priorMock,mock2],savedIds:[id1,id2],used:2},id2);
 assert.ok(expectedSecond&&expectedSecond.kind==='second','fm10 fixture: the unchanged helper derives the second acknowledgement for the ACTUAL store transition');
 assert.equal((await secondLeaf.first().innerText()).replace(/\s+/g,' ').trim(),expectedSecond.text.replace(/\s+/g,' ').trim(),'fm10: the second leaf carries the exact helper-derived copy (no new strings)');
 assert.equal(await p.locator('#mock-acknowledgement').count(),1,'fm10: exactly one acknowledgement leaf after recovery (the consumed first never replays)');
 const done=p.locator('[data-account-save="done"]');
 assert.equal(await done.count(),1,'fm10: the generic done line renders alongside');
 assert.equal((await done.textContent()),SAVE_DONE,'fm10: the done line keeps the accepted copy');
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id2,'fm10: the detail is the ACTUAL second record by literal id');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'fm10: the detail shows the original note and review text');
 // Completion guarantees: draft cleared only now, NO local merge, exactly two
// commit POSTs across the WHOLE journey, usage 2, cached prior still never
// recollected, and the FOUR second-save applies all carried the same ref.
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'fm10: the retained draft is cleared only when the cleanup persist succeeds');
 assert.deepEqual(stored.mocks,[],'fm10: no cloud record may merge into state.mocks');
 assert.equal(stored.used,0,'fm10: the browser-local counter stays untouched');
 assert.deepEqual(stored.savedIds,[],'fm10: savedIds stay untouched (no browser history merge)');
 assert.equal(obs.commits.length,2,'fm10: exactly TWO commit POSTs total (first + second) across the whole journey');
 assert.equal(commitCount(rec),2,'fm10: exactly two commit requests recorded at the browser layer');
 assert.equal(await directUsage(acct.token),2,'fm10: exactly two server debits total — the denied cleanups and the successful retry never re-commit');
 assert.equal((await readListSettles(p)).filter(s=>s.limit===20).length,2,'fm10 NO RECOLLECTION: the recovery retry reuses the cached prior snapshot');
 const listDispatchesBeforeReload=(await readListSettles(p)).filter(s=>s.limit===20).length; // captured BEFORE the actual reload (window state is destroyed by it)
 const finalIdentity=await p.evaluate(()=>{const r=window.__uicPriorAcks;const second=r.slice(1);return {secondApplyCount:second.length,allSameRef:second.every(e=>e.ref===second[0].ref),savedIdsPriorOnly:second.every(e=>e.json.savedIds.length===1&&e.json.savedIds[0]===second[0].json.savedIds[0])};});
 assert.equal(finalIdentity.secondApplyCount,4,'fm10: four second-save seam applies (three denied + one successful cleanup completion)');
 assert.equal(finalIdentity.allSameRef,true,'fm10: the retained prior snapshot OBJECT reference is identical across every denied apply AND the successful completion');
 assert.equal(finalIdentity.savedIdsPriorOnly,true,'fm10: every retained prior snapshot carries exactly the first literal ID (the cached snapshot is never rebuilt post-commit)');
 assert.equal((await saveState(p)).phase,null,'fm10: the queue completed and cleared');
 await shot(p,'shot-1440-account-save-fm10-second-leaf-after-cleanup-retry.png');
 // ── NO REPLAY across supported navigation, reopen, and an ACTUAL reload.
 await p.locator('nav [data-act="home"]').click();
 await p.waitForSelector('[data-act="log"]',{timeout:15000});
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm10 NO REPLAY: the consumed second leaf never re-renders on the Home departure');
 await p.locator('nav [data-act="history"]').click();
 await waitHistRows(p,2);
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm10 NO REPLAY: History re-entry shows no leaf');
 assert.deepEqual((await histRowIds(p)).sort(),[id1,id2].sort(),'fm10: the real store owns exactly the two committed records');
 await p.locator('[data-account-history="open"]').first().click();
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm10 NO REPLAY: reopening a saved record never re-renders the consumed second acknowledgement');
 // An ACTUAL page.reload resets tab-local state (fm5 convention; the reattach
 // below is an explicit fixture reattachment, NOT live auth persistence).
 await p.reload();
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm10 NO CARRYOVER: the reload leaves no leaf of any kind');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm10 NO STALE DONE: the done line never survives an actual reload');
 const reconnected=await connectSaveHarness(p,acct);
 assert.ok(reconnected.attachSaveAvailable&&reconnected.moduleAvailable,'fm10: the save seam re-attaches after the reload (fixture reattachment, not live persistence)');
 await p.locator('nav [data-act="home"]').click();
 await p.waitForSelector('[data-act="log"]',{timeout:15000});
 await p.locator('nav [data-act="history"]').click();
 await waitHistRows(p,2);
 await p.locator('[data-account-history="open"]').first().click();
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm10 NO REPLAY after reload: the post-reload reopen never re-renders the consumed second leaf');
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id:id1,used:1}},{status:201,body:{created:true,id:id2,used:2}}],'fm10: the reload and reopens performed ZERO new commit POSTs');
 assert.equal(await directUsage(acct.token),2,'fm10: server usage is still exactly 2 after the reload journey');
 const storedFinal=await localDraft(p);
 assert.equal(storedFinal.draft,null,'fm10: the cleared drafts stay cleared through the reload');
 assert.deepEqual(storedFinal.mocks,[],'fm10: local mocks stay empty after the reload');
 assert.equal(storedFinal.used,0,'fm10: the local counter stays untouched after the reload');
 assert.deepEqual(storedFinal.savedIds,[],'fm10: savedIds stay untouched after the reload');
 await fs.writeFile(new URL('fm10-second-cleanup-denied-receipt.json',out),JSON.stringify({firstStableId:id1,secondStableId:id2,actualCommitAcks:obs.commits,commitRequestsRecorded:commitCount(rec),derivedExpectedSecond:{kind:expectedSecond.kind,text:expectedSecond.text,record:expectedSecond.record},deniedRetryCount:2,listCollectorDispatches:listDispatchesBeforeReload,secondSaveApplies:finalIdentity,usageDuringDenial:2,usageAtEnd:await directUsage(acct.token),localSlices:{mocks:stored.mocks.length,used:stored.used,savedIds:stored.savedIds.length},draftDeniedBytesSha:sha(Buffer.from(deniedPayload)),draftDeniedByteUnchangedThroughRetries:true,draftClearedAfterSuccess:stored.draft===null,secondLeafCountAfterSuccess:1,ackLeafTotalAfterSuccess:1,doneLineAfterSuccess:1,reloadLeafCount:0,reopenLeafCount:0,coverageNote:'fm10secondcleanupdenied proves the SECOND-save recovery safeguards on the accepted fm6/fm9 bytes (existing-correct labelled coverage, no manufactured RED): denied key-scoped cleanup after the real second 201 created:true used:2 leaves ONLY the truthful saved-but-cleanup-pending warning with NO feedback leaf of any kind and the exact submitted draft retained at usage 2; two repeated failed keyboard Retries (Enter then Space, real dialog confirmations) keep focus usable on Retry, start zero new commit POSTs, never recollect the limit=20 prior list, never debit again, and retain the SAME frozen prior snapshot object reference at the seam; the released explicit Retry completes only the cleanup and renders the exact unchanged-helper-derived second leaf ONCE with the actual detail, cleared draft, zero local merge and exactly two total commit POSTs; the consumed leaf never replays across Home, History, reopen or an actual reload (fixture reattachment, not live auth persistence). Fixture labelling: key-scoped Storage.prototype.setItem denial via the EXISTING accepted armCleanupDenial shim — browser-layer control, never a backend claim'},null,2));
 await clearCommitObserver(p);
 checkClean(rec,'fm10secondcleanupdenied');
 await shot(p,'shot-1440-account-save-fm10-final.png');
});
// ── END ui-cloud-account-save-second-recovery-safeguards-append ──
// ── BEGIN ui-cloud-account-save-second-lost-ack-append ──
// fm11: LOST ACKNOWLEDGEMENT AFTER THE ACTUAL SECOND COMMIT — the second
// gap explicitly deferred by the fm6 checkpoint (line 127: 'Lost-ack
// created:false second-silence (existing-correct proof)'). Derived harness =
// the immutable fm10 harness bytes as the FULL prefix plus THIS ONE marked
// EOF append; deleting everything from this BEGIN marker to EOF reproduces
// that prefix byte-exact (inverse proof in the build evidence). Runner change
// is filename-allowlist registration ONLY (derived fm11 runner; fm10 bytes
// untouched as its exact prefix; canonical 602f… untouched). No wrapper/
// generator/source-map family; no production, backend, helper or domain edit.
// EXISTING-CORRECT PROOF convention on the accepted second-milestone bytes
// (app ccb031af…, save 2bf5801b…): no manufactured RED — a first-run pass is
// labelled coverage of the reviewed gates. Journey: after a REAL first 201
// commit earns the accepted first leaf, a SECOND real native-confirmed save
// over the EXACT same supported scores actually reaches the server (route.
// fetch passthrough) and the harness awaits and validates the ORIGINAL
// upstream 201 created:true used:2 AND the actual HTTP storage readbacks
// (item 200 with the original note/review, usage exactly 2) BEFORE the
// controlled malformed 503 replaces the acknowledgement in place — a lost
// acknowledgement after a REAL commit, explicitly labelled as a browser-layer
// fixture, never a backend-outage claim and never a rewrite of server
// behavior. WHILE UNCERTAIN: NO milestone or PB leaf of any kind, NO done
// line, the truthful cannot-yet-be-confirmed copy on the dedicated error
// leaf, the exact stable ID and retained submitted payload locked for Retry,
// zero further collector dispatch. The error state is SCREENSHOTTED BEFORE
// Retry. An explicit keyboard Retry (real cancel-safe dialog re-confirmation)
// re-sends the BYTE-IDENTICAL POST and the REAL backend answers with its
// existing idempotent replay acknowledgement (200 created:false used:2 —
// the accepted backend contract, recorded truthfully, not invented); the
// detail read and cleanup complete, the generic done line and actual second
// detail appear — and the second-milestone leaf stays ABSENT: a created:false
// replay must never earn a celebration (never-celebrate-retry-uncertainty).
// Counters distinguish the fixture's two intercepted commit requests from
// the upstream RESPONSES (one real 201 created:true + one real 200
// created:false) and from the browser-layer request count; server usage stays
// exactly 2 with NO duplicate record (real list owns exactly the two distinct
// IDs). The pre-commit prior snapshot stays cached (limit=20 collector
// dispatches stay 2 across the retry) and its retained reference carries only
// the first literal ID. Local mocks/used/savedIds stay untouched; receipts
// carry ids, statuses, counts, ordered event lists and hashes only.
// The historical armLostAckCommit helper hardcodes the used:1 first-save
// expectation and is reused for NOTHING here; the NEW
// armLostAckSecondCommit helper below is scoped to the SECOND-commit case
// (used:2) and follows the same r2 readback-before-replacement pattern with
// raw ordered event capture. No historical helper or test is modified.
async function armLostAckSecondCommit(p,proofs,expectId,expectToken){
 let first=true;
 proofs.calls=0;proofs.posts=[];proofs.receipt=null;proofs.fixtureError=null;proofs.retry=null;
 const events=[]; // RAW ordered fixture events, preserved BEFORE any replacement and across the retry
 await p.route(base+'/api/mocks/commit',async route=>{
  proofs.calls++;proofs.posts.push(route.request().postData());
  const resp=await route.fetch();
  const text=await resp.text();
  let body=null;try{body=JSON.parse(text);}catch{}
  if(first){
   first=false;
   proofs.upstream={status:resp.status(),body};
   const receipt={events,upstreamStatus:resp.status(),upstreamBody:body};
   proofs.receipt=receipt;
   try{
    if(resp.status()!==201)throw new Error('second commit ack status '+resp.status()+' (expected 201)');
    if(!body||body.id!==expectId)throw new Error('second commit ack id mismatch: '+JSON.stringify(body&&body.id));
    if(body.created!==true)throw new Error('second commit ack created not true: '+JSON.stringify(body&&body.created));
    if(body.used!==2)throw new Error('second commit ack used not 2: '+JSON.stringify(body&&body.used));
    receipt.events.push('original-ack-validated:201:id='+expectId+':created=true:used=2');
    const gotItem=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(expectId),{headers:{authorization:'Bearer '+expectToken},credentials:'omit'});
    const gotText=await gotItem.text();
    let gotJson=null;try{gotJson=JSON.parse(gotText);}catch{}
    if(gotItem.status!==200)throw new Error('direct HTTP item readback status '+gotItem.status);
    const mock=gotJson&&gotJson.mock;
    if(!mock||mock.id!==expectId)throw new Error('direct HTTP item readback id mismatch');
    if(mock.note!==SAVE_NOTE)throw new Error('direct HTTP item readback note mismatch');
    const reviews=Array.isArray(mock.reviews)?mock.reviews:[];
    if(reviews.length!==1)throw new Error('direct HTTP item readback review count '+reviews.length);
    if(!reviews.some(q=>q.thinking===SAVE_THINKING))throw new Error('direct HTTP item readback missing the second thinking review');
    receipt.itemStatus=gotItem.status;receipt.itemNote=mock.note;
    receipt.events.push('direct-http-item-readback:200:id='+expectId+':note=SAVE_NOTE:reviews=1');
    const gotUsage=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+expectToken},credentials:'omit'});
    const usageJson=await gotUsage.json();
    if(gotUsage.status!==200)throw new Error('direct HTTP usage readback status '+gotUsage.status);
    receipt.usageStatus=gotUsage.status;receipt.usage=usageJson.cumulativeLogsUsed;
    if(usageJson.cumulativeLogsUsed!==2)throw new Error('direct HTTP usage readback shows '+JSON.stringify(usageJson.cumulativeLogsUsed)+' (expected 2)');
    receipt.events.push('direct-http-usage-readback:200:used=2');
    await route.fulfill({status:503,contentType:'text/plain; charset=utf-8',body:'lost-ack second fixture'});
    receipt.events.push('controlled-503-replacement-fulfilled');
   }catch(e){
    proofs.fixtureError=String(e&&e.message||e);
    receipt.events.push('fixture-error:'+proofs.fixtureError);
    await route.fulfill({status:503,contentType:'text/plain; charset=utf-8',body:'lost-ack second fixture'}).catch(()=>{});
   }
  }
  else{proofs.retry={status:resp.status(),body};events.push('retry-passthrough:status='+resp.status()+':created='+String(body&&body.created)+':used='+String(body&&body.used));await route.fulfill({status:resp.status(),contentType:'application/json',body:text});}
 });
}
test('account save fm11 second lost ack: fm11secondlostack after an actual second account commit whose original 201 created:true used:2 acknowledgement AND direct HTTP storage plus usage readbacks are awaited and validated BEFORE a controlled malformed 503 replaces the response, while uncertain the UI shows NO milestone or PB leaf no done line only the truthful cannot-yet-be-confirmed copy with the exact stable ID and retained payload locked, the error state is captured before Retry, and an explicit keyboard Retry re-sending the byte-identical POST receives the REAL existing idempotent 200 created:false used:2 replay and completes the detail and cleanup, yet the second-milestone leaf stays absent because a created:false replay never earns a celebration, usage remains exactly 2 with no duplicate record, the cached prior snapshot is never recollected, and browser-local slices stay untouched',async()=>{
 const acct=await account();
 assert.equal(await directUsage(acct.token),0,'fm11 fixture: fresh fictional emulator account starts at usage 0');
 const {p,rec}=await openPage(1440);
 const connected=await connectSaveHarness(p,acct);
 assert.ok(connected.attachSaveAvailable&&connected.moduleAvailable,'fm11: save seam and module must be live for the second lost-ack journey');
 await wrapPriorApplyObserver(p);
 await mountListMocksTransparentForwarder(p);
 const obs={commits:[]};
 await armCommitObserver(p,obs);
 // ── PHASE 1: real first commit, accepted first leaf (precondition).
 const id1=await saveJourneys(p);
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.deepEqual(obs.commits,[{status:201,body:{created:true,id:id1,used:1}}],'fm11 precondition: the first save is one real 201 created:true used:1 commit');
 const firstLeaf=p.locator('#mock-acknowledgement[data-feedback-kind="first"]');
 assert.equal(await firstLeaf.count(),1,'fm11 precondition: the FIRST leaf rendered exactly once after the first save');
 // ── PHASE 2: second real save whose ACTUAL commit succeeds but whose
 // acknowledgement is lost (labelled controlled 503 replacement AFTER the
 // real upstream 201 and real readbacks are proven inside the fixture).
 await p.locator('nav [data-act="home"]').click();
 await p.waitForSelector('[data-act="log"]',{timeout:15000});
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm11: the consumed first leaf never replays across the Home departure');
 const id2=await saveJourneys(p);
 assert.notEqual(id2,id1,'fm11 fixture: the second save is a new draft identity');
 const proofs={};
 await armLostAckSecondCommit(p,proofs,id2,acct.token); // overrides the passthrough for the commit route from here
 await p.locator('[data-act="save"]').click();
 await confirmLogDialog(p).click();
 await p.waitForSelector('[data-account-save="error"]',{timeout:15000});
 assert.equal(proofs.fixtureError,null,'fm11: the second-commit lost-ack fixture must have validated the real upstream ack and readbacks cleanly: '+proofs.fixtureError);
 assert.equal(proofs.upstream.status,201,'fm11: the original second commit actually reached the server with a real 201');
 assert.deepEqual(proofs.upstream.body,{created:true,id:id2,used:2},'fm11: the ORIGINAL acknowledgement was the real 201 created:true used:2 (recorded before replacement)');
 const evs=proofs.receipt.events;
 assert.ok(evs[0]==='original-ack-validated:201:id='+id2+':created=true:used=2','fm11: raw ordered events start with the validated original ack: '+JSON.stringify(evs));
 assert.ok(evs.includes('direct-http-item-readback:200:id='+id2+':note=SAVE_NOTE:reviews=1'),'fm11: the ACTUAL storage readback (original note + thinking review) was proven over real HTTP BEFORE the controlled replacement: '+JSON.stringify(evs));
 assert.ok(evs.includes('direct-http-usage-readback:200:used=2'),'fm11: the real usage readback showed exactly 2 BEFORE the controlled replacement');
 assert.ok(evs.indexOf('controlled-503-replacement-fulfilled')>evs.indexOf('direct-http-usage-readback:200:used=2'),'fm11: the 503 replacement was fulfilled only AFTER the raw fixture events and readbacks were captured and recorded');
 // WHILE UNCERTAIN: truthful cannot-confirm copy on the dedicated error leaf,
 // NO leaf of ANY kind, no done line, exact stable ID + payload retained.
 assert.equal((await p.locator('[data-account-save="error"]').textContent()),SAVE_RECOVERY_ERR_UNCERTAIN,'fm11: the uncertain outcome shows the truthful cannot-yet-be-confirmed copy');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm11 NO CELEBRATION WHILE UNCERTAIN: no milestone or PB leaf of any kind');
 assert.equal(await p.locator('[data-account-save="done"]').count(),0,'fm11: no done line while the second ack is uncertain');
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'fm11: no detail presentation while uncertain');
 const stUnc=await saveState(p);
 assert.equal(stUnc.phase,'failed','fm11: uncertain failed phase');
 assert.equal(stUnc.lockedId,id2,'fm11: the second submitted draft stays locked read-only');
 assert.equal(stUnc.retainedId,id2,'fm11: the exact stable second ID is retained for Retry');
 const draftUnc=await localDraft(p);
 assert.equal(draftUnc.draft&&draftUnc.draft.id,id2,'fm11: the retained draft carries the exact stable ID');
 const uncPayload=JSON.stringify(draftUnc.draft);
 assert.equal(obs.commits.length,1,'fm11: the passthrough observer recorded only the first save (the second ack was replaced inside the fixture)');
 assert.equal(proofs.calls,1,'fm11: exactly one intercepted second-attempt commit request so far');
 assert.equal(commitCount(rec),2,'fm11: two commit requests reached the browser layer (first + second)');
 assert.equal((await readListSettles(p)).filter(s=>s.limit===20).length,2,'fm11: two prior-list dispatches (one per save) before the retry');
 const acksUnc=await readPriorAcks(p);
 assert.equal(acksUnc.length,1,'fm11: only the first save has applied at the seam while the second is uncertain');
 // ERROR STATE SCREENSHOT BEFORE RETRY.
 await shot(p,'shot-1440-account-save-fm11-error-before-retry.png');
 // ── Explicit keyboard Retry re-sends the exact same record; the REAL
 // backend answers with its existing idempotent replay (200 created:false).
 await keyboardRetryConfirm(p);
 // The retry POST is dispatched asynchronously from the dialog confirmation:
 // await its REAL completion boundary (the done line renders only after the
 // fixture passthrough fulfilled the actual replay response, the controller
 // re-read the detail and the cleanup persist succeeded) before inspecting
 // the fixture's recorded retry acknowledgement — no race against the
 // in-flight route.fetch proxy.
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 assert.equal(proofs.calls,2,'fm11: the retry issued the second intercepted commit request (request count, distinct from upstream responses)');
 assert.equal(proofs.posts[0],proofs.posts[1],'fm11 NO REWRITE: the retry re-sent the byte-identical payload');
 assert.equal(proofs.retry.status,200,'fm11: the real backend answered the identical replay with its existing 200 idempotent acknowledgement');
 assert.deepEqual(proofs.retry.body,{created:false,id:id2,used:2},'fm11: the real replay acknowledgement is created:false used:2 (accepted backend contract, passed through truthfully — no invented detail contract)');
 assert.equal(evs[evs.length-1],'retry-passthrough:status=200:created=false:used=2','fm11: the ordered raw events end with the real idempotent replay passthrough: '+JSON.stringify(evs));
 await p.waitForSelector('[data-account-save="done"]',{timeout:15000});
 await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
 await settle(1500);
 // Completion via the REAL replay: done line + actual detail, and the
 // second-milestone leaf stays ABSENT — created:false never celebrates.
 const done=p.locator('[data-account-save="done"]');
 assert.equal(await done.count(),1,'fm11: the generic done line renders once after the completed replay apply');
 assert.equal((await done.textContent()),SAVE_DONE,'fm11: the done line keeps the accepted copy');
 assert.equal(await p.locator('[data-account-history="detail"]').getAttribute('data-account-history-id'),id2,'fm11: the detail is the ACTUAL second record by literal id');
 const detailText=await p.locator('[data-account-history="detail"]').textContent();
 assert.ok(detailText.includes(SAVE_NOTE)&&detailText.includes(SAVE_THINKING),'fm11: the detail shows the original second note and review text');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'fm11 SECOND SILENCE: a created:false replay must render NO acknowledgement leaf of any kind — retry uncertainty is never celebrated');
 assert.equal(await p.locator('#mock-acknowledgement[data-feedback-kind="second"]').count(),0,'fm11: specifically no second leaf on the idempotent replay path');
 // No duplicate debit or record; counters distinguish requests/responses.
 assert.equal(obs.commits.length,1,'fm11: the passthrough observer still saw only the first save (its route was overridden for the second case)');
 assert.equal(commitCount(rec),3,'fm11: exactly three browser-layer commit requests total (first + second + retry) — the request count is NOT a commit count');
 assert.equal(await directUsage(acct.token),2,'fm11: usage stays exactly 2 — the created:false replay added no debit');
 const listFinal=await fetch(base+'/api/mocks?limit=10',{headers:{'authorization':'Bearer '+acct.token},credentials:'omit'});
 const listJ=await listFinal.json();
 assert.deepEqual(listJ.items.map(i=>i.summary.id).sort(),[id1,id2].sort(),'fm11: the real store owns exactly the two distinct committed records — no duplicate third record');
 // The cached prior snapshot survived the uncertainty untouched and was
 // NEVER recollected across the retry.
 assert.equal((await readListSettles(p)).filter(s=>s.limit===20).length,2,'fm11 NO RECOLLECTION: the retry reused the cached prior snapshot (still two limit=20 dispatches)');
 const acksEnd=await readPriorAcks(p);
 assert.equal(acksEnd.length,2,'fm11: two successful applies at the seam (first save + completed replay)');
 assert.deepEqual(acksEnd[1].json.savedIds,[id1],'fm11: the retained pre-commit prior snapshot carries exactly the first literal ID and never the queued second id');
 const im=await inspectPriorImmutability(p);
 assert.equal(im.outerFrozen&&im.summariesFrozen&&im.savedIdsFrozen,true,'fm11: the retained snapshot is the same deep-frozen complete prior catalogue');
 // Draft cleared only now; local slices never merged.
 const stored=await localDraft(p);
 assert.equal(stored.draft,null,'fm11: the retained draft is cleared only after the completed apply');
 assert.deepEqual(stored.mocks,[],'fm11: no cloud record may merge into state.mocks');
 assert.equal(stored.used,0,'fm11: the browser-local counter stays untouched');
 assert.deepEqual(stored.savedIds,[],'fm11: savedIds stay untouched (no browser history merge)');
 assert.equal((await saveState(p)).phase,null,'fm11: the queue completed and cleared');
 await fs.writeFile(new URL('fm11-second-lost-ack-receipt.json',out),JSON.stringify({firstStableId:id1,secondStableId:id2,upstreamOriginalAck:{status:proofs.upstream.status,body:proofs.upstream.body},rawFixtureEvents:evs,retryAck:{status:proofs.retry.status,body:proofs.retry.body},retryPayloadIdentical:proofs.posts[0]===proofs.posts[1],interceptedCommitRequests:proofs.calls,browserLayerCommitRequests:commitCount(rec),observerRecordedAcks:obs.commits,uncertainErrorCopyShown:'SAVE_RECOVERY_ERR_UNCERTAIN',leafCountWhileUncertain:0,leafCountAfterReplayCompletion:0,doneLineAfterCompletion:1,detailId:id2,usageAtEnd:await directUsage(acct.token),storedIds:listJ.items.map(i=>i.summary.id),priorListDispatches:(await readListSettles(p)).filter(s=>s.limit===20).length,priorSavedIdsApplied:acksEnd[1].json.savedIds,uncertainDraftRetained:true,draftClearedAfterSuccess:stored.draft===null,localSlices:{mocks:stored.mocks.length,used:stored.used,savedIds:stored.savedIds.length},coverageNote:'fm11secondlostack proves the second-save lost-acknowledgement path on the accepted bytes (existing-correct labelled coverage, no manufactured RED): the ACTUAL second 201 created:true used:2 with direct item+usage HTTP readbacks is awaited and validated BEFORE the controlled malformed 503 replacement (labelled browser-layer fixture, never a backend-outage claim); while uncertain NO leaf of any kind and only the truthful cannot-confirm copy with the exact stable ID retained; the explicit keyboard Retry re-sends the byte-identical POST, the REAL backend answers its existing idempotent 200 created:false used:2 (recorded truthfully), completion shows the done line and actual second detail while the second-milestone leaf stays absent (created:false never earns a celebration), usage stays exactly 2 with exactly two distinct stored records, the cached prior snapshot is never recollected, and local slices never merge'},null,2));
 await clearCommitObserver(p); // unroutes the shared commit pattern (the lost-ack fixture handler registered on the same URL is removed with it)
 checkClean(rec,'fm11secondlostack');
 await shot(p,'shot-1440-account-save-fm11-final-second-silent.png');
});
// ── END ui-cloud-account-save-second-lost-ack-append ──
// ── BEGIN ui-cloud-history-empty-caption-append ──
// hc1/hc2: copy-scope repair of the browser-local History empty footer.
// The app.js historyRows() empty branch sat beneath populated account
// records reading the generic 'No mocks logged yet.', which is misleading:
// it is only true for browser-local records. The repair makes the existing
// empty state explicitly scoped ('No mocks saved in this browser yet.')
// without changing data, storage, models or policy. hc1 is the behavioral
// RED against the unchanged production bytes; hc2 is an existing-correct
// boundary proof (populated browser-local rows render with no empty footer
// at all). Both reuse the inherited helpers byte-unchanged.
const LOCAL_EMPTY_SCOPED='No mocks saved in this browser yet.';
const LOCAL_EMPTY_UNSCOPED='No mocks logged yet.';
const localEmptyFooter=p=>p.locator('main .empty');

// ── hc1: scoped footer beside POPULATED account rows; local ledger stays
// empty and unmerged; the unscoped generic copy no longer renders on History.
test('history empty caption: hc1 the browser-local History footer is explicitly scoped to this browser beside populated account rows',async()=>{
 const acct=await account();
 const titles=['Fictional caption mock A','Fictional caption mock B'];
 for(const t of titles)await commitTitled(acct.token,t,'Fictional provider');
 const {p,rec}=await openPage(1440);
 const connected=await connectHistoryHarness(p,acct);
 await goHistory(p);
 assert.ok(connected.attachAvailable&&connected.moduleAvailable,`history seams must exist under the explicit harness connection (attach=${connected.attachAvailable}, module=${connected.moduleAvailable})`);
 await waitHistRows(p,2);
 assert.deepEqual((await histRowTitles(p)).slice().sort(),titles.slice().sort(),'account rows above the footer must be the ACTUAL committed titles');
 // Evidence first (RED run must also capture the visible defect state).
 await shot(p,'shot-1440-account-list-scoped-local-empty.png');
 const stored=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.deepEqual(stored.mocks,[],'account rows must still never merge into browser-local mocks');
 const footer=localEmptyFooter(p);
 assert.equal(await footer.count(),1,'exactly one browser-local empty footer remains visible while the local ledger is empty');
 const footerText=(await footer.textContent()).trim();
 // Primary missing-behavior assertion (fails on the unchanged generic copy):
 assert.equal(footerText,LOCAL_EMPTY_SCOPED,'the browser-local empty footer must be explicitly scoped to this browser');
 assert.ok(!(await p.locator('main').innerText()).includes(LOCAL_EMPTY_UNSCOPED),'the unscoped generic copy must no longer render anywhere on History');
 assert.ok(listCount(rec)>=1,'the list must be fetched over real same-origin HTTP');
 checkClean(rec,'hc1-scoped-footer');
});

// ── hc2: with POPULATED browser-local rows the empty footer renders not at
// all (existing-correct boundary proof on both source generations).
test('history empty caption: hc2 populated browser-local rows render with no empty footer and neither caption copy',async()=>{
 const {p}=await openPage(1440);
 await p.evaluate(({k,localMock})=>{const s=JSON.parse(localStorage.getItem(k));s.mocks=[localMock];s.used=1;localStorage.setItem(k,JSON.stringify(s));},
  {k:KEY,localMock:{id:'local-fictional-hc2',title:'Fictional browser-local mock',provider:'',loggedAt:'2026-10-01T09:00:00.000Z',dmMode:'questions',scores:{VR:{earned:'30',max:'44'},DM:{earned:'25',max:'35'},QR:{earned:'25',max:'36'}},sjt:null,reviews:[],note:''}});
 await p.reload();
 await goHistory(p);
 const rows=p.locator('main .saved-mock-row');
 assert.equal(await rows.count(),1,'the populated browser-local record renders its actual row');
 assert.ok((await rows.first().innerText()).includes('Fictional browser-local mock'),'the row shows the literal local title');
 assert.equal(await localEmptyFooter(p).count(),0,'no empty footer may render while local rows exist');
 const main=await p.locator('main').innerText();
 assert.ok(!main.includes(LOCAL_EMPTY_SCOPED)&&!main.includes(LOCAL_EMPTY_UNSCOPED),'neither empty caption copy renders when the local ledger is populated');
 await shot(p,'shot-1440-local-rows-no-empty-footer.png');
});
// ── END ui-cloud-history-empty-caption-append ──
// ── BEGIN ui-cloud-account-review-edit-append ──
// re1/re2: account-saved QUESTION-REVIEW editing FIRST VERTICAL
// (account-review-edit-extension-contract.md §Vertical sequence 1). The
// accepted History detail was read-only; this slice connects existing-
// question thinking/instead/free text editing to the SAME account-owned
// detail through the ALREADY accepted client.getMock {mock,etag} receipt and
// createMockIntent.updateReviews(id, etag, reviews) real versioned PATCH.
// re1 is the behavioral RED against the unchanged account-history.js (no
// Edit question reviews control exists): explicit edit -> exactly one PATCH
// with the exact If-Match version -> reopen actual saved content, with saved
// scores/note/identity/mode, cumulative usage, browser-local storage and the
// celebration/acknowledgement seams all proven unchanged; desktop AND mobile
// over the real emulator chain; the served account-history.js and app.js
// bytes are asserted against the exact pins over real HTTP responses.
// re2 is cancel-safety: Cancel before dispatch sends zero PATCHes, the saved
// detail is verbatim, the discarded typed draft never repopulates, and the
// durable browser-local blob/counter/usage are untouched.
// Every other review key is preserved verbatim (structural deep-equality
// against the ORIGINAL direct-HTTP readback with ONLY the two edited fields
// replaced). No new API or schema is invented; the backend stays read-only.
const EDIT_THINKING='Edited account thinking 5k2 persisted via versioned PATCH';
const EDIT_FREE='Edited reflection 8m4 persisted on desktop';
const EDIT_MOBILE='Edited reflection 6q1 typed on mobile';
const EDIT_DISCARD='Discarded typing 4t7 never sent to the account';
const editFieldSel=(section,number,field)=>`[data-account-history="edit-field"][data-section="${section}"][data-number="${number}"][data-field="${field}"]`;
const editField=(p,section,number,field)=>p.locator(editFieldSel(section,number,field));
const patchCount=rec=>(rec.patch||[]).length;
async function readItem(id,token){
 const r=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(id),{headers:{authorization:'Bearer '+token},credentials:'omit',cache:'no-store'});
 const etag=r.headers.get('etag');
 const body=await r.json().catch(()=>null);
 if(r.status!==200||!body||!body.mock||!etag)harness(`direct item readback failed ${r.status}`);
 return {mock:body.mock,etag};
}
async function readUsage(token){
 const r=await fetch(base+'/api/account/mock-usage',{headers:{authorization:'Bearer '+token},credentials:'omit',cache:'no-store'});
 const b=await r.json().catch(()=>null);
 if(r.status!==200||!b||!Number.isSafeInteger(b.cumulativeLogsUsed))harness('direct usage readback failed '+r.status);
 return b;
}
function attachPatchObserver(rec){rec.patch=[];return r=>{if(r.method()==='PATCH')rec.patch.push({url:r.url(),headers:r.headers()});};}
async function keyboardEdit(p,section,number,field,text){
 const f=editField(p,section,number,field);
 await f.click();
 await p.keyboard.press('Control+a');
 await p.keyboard.type(text);
 assert.equal(await f.inputValue(),text,'the editor field holds the genuinely typed text');
}

// ── re1: PRIMARY vertical regression — explicit Save issues exactly one
// versioned PATCH, the detail reopens the ACTUAL saved content, and
// everything outside the two edited question-text fields is provably frozen.
test('review edit: re1 an explicit review edit sends exactly one versioned PATCH, reopens the actual saved text, and leaves scores, note, identity, mode, usage, browser-local state and celebration unchanged',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 const connected=await connectHistoryHarness(p,acct);
 assert.ok(connected.attachAvailable&&connected.moduleAvailable,`history seams must exist under the explicit harness connection (attach=${connected.attachAvailable}, module=${connected.moduleAvailable})`);
 await goHistory(p);
 // Write-counting shim installed AFTER the legitimate navigation write
 // (accepted h1/d1 convention): review-edit operations add zero writes.
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  // Actual served-byte binding over the SAME real HTTP origin on final pins.
  const srvHist=await fetch(base+'/account-history.js');const histBytes=Buffer.from(await srvHist.arrayBuffer());
  assert.equal(srvHist.status,200,'served account-history.js must be 200');
  assert.equal(sha(histBytes),stagePins['account-history.js'],'served account-history.js bytes must equal the pinned source');
  const srvApp=await fetch(base+'/app.js');const appBytes=Buffer.from(await srvApp.arrayBuffer());
  assert.equal(srvApp.status,200,'served app.js must be 200');
  assert.equal(sha(appBytes),APP_PIN,'served app.js bytes must equal the pinned app');
  await shot(p,'shot-1440-review-edit-detail.png');
  // The detail must clarify that saved scores stay fixed (extension contract).
  const readonlyCopy=await p.locator('[data-account-history="detail-readonly"]').textContent();
  assert.ok(readonlyCopy.includes('Saved scores stay fixed'),'the detail must clarify that saved scores stay fixed: '+readonlyCopy);
  // PRIMARY missing-behavior assertion (fails on the unchanged read-only account-history.js).
  const edit=p.locator('[data-account-history="edit-reviews"]');
  assert.equal(await edit.count(),1,'the actual saved detail must offer the native Edit question reviews control');
  await edit.focus();
  assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.accountHistory),'edit-reviews','the edit control must be keyboard focusable');
  await p.keyboard.press('Enter');
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await p.locator('[data-account-history="edit-save"]').textContent(),'Save question reviews');
  assert.equal(await p.locator('[data-account-history="edit-cancel"]').textContent(),'Cancel');
  const editNote=await p.locator('[data-account-history="edit-note"]').textContent();
  assert.ok(editNote.includes('Saved scores stay fixed'),'the editor must clarify scores stay fixed: '+editNote);
  // The editor is seeded from the ACTUAL saved review snapshot, not summaries.
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),DETAIL_THINKING,'the editor prefills the actual saved thinking text');
  assert.equal(await editField(p,'QR','2','free').inputValue(),DETAIL_FREE,'the editor prefills the actual saved reflection text');
  await keyboardEdit(p,'VR','1','thinking',EDIT_THINKING);
  await keyboardEdit(p,'QR','2','free',EDIT_FREE);
  await shot(p,'shot-1440-review-edit-editor.png');
  const itemsBeforeReopen=itemCount(rec);
  await p.locator('[data-account-history="edit-save"]').click();
  await waitDetail(p);
  assert.equal(patchCount(rec),1,'explicit Save must send exactly one PATCH request');
  assert.ok(rec.patch[0].url.includes('/api/mocks/reviews?id='+encodeURIComponent(ack.id)),'the PATCH must target the literal record id over the accepted route: '+rec.patch[0].url);
  assert.equal(rec.patch[0].headers['if-match'],pre.etag,'the PATCH must carry the exact current version in If-Match');
  const saved1=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(saved1[0].includes(EDIT_THINKING),'the reopened detail shows the actual saved thinking edit: '+saved1[0]);
  assert.ok(saved1[1].includes(EDIT_FREE),'the reopened detail shows the actual saved reflection edit: '+saved1[1]);
  // Reopen through Back -> fresh list load -> Open (a real getMock read).
  await p.locator('[data-account-history="back"]').click();
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  assert.ok(itemCount(rec)>itemsBeforeReopen,'the reopen must fetch the actual record again over real HTTP');
  const saved2=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(saved2[0].includes(EDIT_THINKING)&&saved2[1].includes(EDIT_FREE),'a fresh reopen shows the persisted edits');
  // Actual store readback over direct HTTP: ONLY the two edited fields differ.
  const post=await readItem(ack.id,acct.token);
  const expected=structuredClone(pre.mock);
  expected.reviews[0].thinking=EDIT_THINKING;
  expected.reviews[1].free=EDIT_FREE;
  assert.deepEqual(post.mock,expected,'every immutable field and every other review property must survive verbatim');
  assert.notEqual(post.etag,pre.etag,'the server-owned revision advanced after the accepted PATCH');
  // Cumulative usage unchanged: the review PATCH consumes no allowance.
  assert.deepEqual(await readUsage(acct.token),usage0,'review editing must not change cumulative usage');
  // No celebration/acknowledgement seam for review-only saves.
  assert.equal(await p.locator('.mock-confetti').count(),0,'review saves must never attach confetti');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'review saves must render no acknowledgement leaf');
  // Browser-local state untouched.
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'review editing must add zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob must be byte-identical');
  checkClean(rec,'re1-desktop');
  await shot(p,'shot-1440-review-edit-saved.png');
  // Mobile journey: edit on 390 and persist over real HTTP.
  const {p:pm,rec:recm}=await openPage(390);
  pm.on('request',attachPatchObserver(recm));
  await connectHistoryHarness(pm,acct);
  await goHistory(pm);
  await waitHistRows(pm,1);
  await pm.locator('[data-account-history="open"]').click();
  await waitDetail(pm);
  assert.equal(await pm.locator('[data-account-history="edit-reviews"]').count(),1,'the mobile detail offers the same edit control');
  await pm.locator('[data-account-history="edit-reviews"]').click();
  await pm.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await editField(pm,'QR','2','free').inputValue(),EDIT_FREE,'the mobile editor prefills the persisted desktop edit');
  await editField(pm,'QR','2','free').fill(EDIT_MOBILE);
  await shot(pm,'shot-390-review-edit-editor.png');
  await pm.locator('[data-account-history="edit-save"]').click();
  await waitDetail(pm);
  assert.equal(patchCount(recm),1,'the mobile save is exactly one PATCH');
  const savedM=await pm.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(savedM[1].includes(EDIT_MOBILE),'the mobile reopen shows the actual persisted mobile edit: '+savedM[1]);
  const postm=await readItem(ack.id,acct.token);
  assert.equal(postm.mock.reviews[1].free,EDIT_MOBILE,'direct readback carries the mobile edit');
  assert.equal(postm.mock.reviews[0].thinking,EDIT_THINKING,'the desktop edit survives the later mobile save');
  checkClean(recm,'re1-mobile');
  await shot(pm,'shot-390-review-edit-saved.png');
 }catch(e){await captureFailure(p,'re1');throw e;}
});

// ── re2: Cancel before dispatch sends zero writes; nothing leaks anywhere.
test('review edit: re2 cancelling the editor sends zero PATCH, keeps the saved detail verbatim, and a reopened editor starts from saved content with no discarded draft',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 // Shim installed AFTER the legitimate navigation write (accepted convention).
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await keyboardEdit(p,'VR','1','thinking',EDIT_DISCARD);
  await shot(p,'shot-1440-review-edit-cancel-pending.png');
  await p.locator('[data-account-history="edit-cancel"]').click();
  assert.equal(await p.locator('[data-account-history="edit-save"]').count(),0,'Cancel leaves the editor');
  assert.equal(await p.locator('[data-account-history="edit-field"]').count(),0,'Cancel removes every editor field');
  await waitDetail(p);
  const reviews=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(reviews[0].includes(DETAIL_THINKING)&&!reviews[0].includes(EDIT_DISCARD),'the saved detail stays verbatim after Cancel: '+reviews[0]);
  assert.equal(patchCount(rec),0,'Cancel before dispatch must send zero PATCH requests');
  assert.equal(rec.api.filter(u=>u.includes('/api/mocks/reviews')).length,0,'no review route request may reach the server after Cancel');
  // The discarded tab-local draft is not cached: a reopened editor prefills
  // the ACTUAL saved content again.
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),DETAIL_THINKING,'a reopened editor starts from saved content, never the discarded draft');
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the cancel journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob must be byte-identical');
  assert.deepEqual(await readUsage(acct.token),usage0,'a cancelled edit must not change usage');
  assert.equal(await p.locator('.mock-confetti').count(),0,'a cancelled edit renders no celebration');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'a cancelled edit renders no acknowledgement');
  checkClean(rec,'re2');
  await shot(p,'shot-1440-review-edit-cancelled.png');
 }catch(e){await captureFailure(p,'re2');throw e;}
});
// ── END ui-cloud-account-review-edit-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-re3-append ──
// re3: retained STALE DETACHED editor controls must not act
// (account-review-edit-first-parent-review.md §Concrete remaining safety
// defect). Save/Cancel previously checked only selection/view + pending, so
// within the SAME live selection a detached old form's Save closure can
// dispatch after Cancel/success — after a newer save it can even combine the
// old textarea text with the selection's newer etag — and retained Edit/
// Cancel closures can replace a newer editor. This test activates the
// deliberately retained detached nodes only through JavaScript click() on
// references captured BEFORE detach: a LABELLED TEST BOUNDARY manipulation,
// not an ordinary visible click (the detached nodes are not rendered).
// Requirements proved: zero extra PATCH and zero review-route requests from
// stale Save/Cancel/Edit after close, reopen and a successful later save;
// newer typing stays visible and the actual stored reviews plus current
// etag are byte-unchanged by the stale actions; legitimate keyboard Edit/
// Cancel journeys remain usable.
const STALE_RE3='Stale detached editor text 2x9 must never be re-sent';
const NEWER_RE3='Newer retained typing 7w3 must survive stale controls';
const NEWER_RE3B='Newer typing 5p1 from the second editor stays';

test('review edit: re3 retained stale detached Save, Cancel and Edit controls act within the same live selection: zero extra PATCH, newer typing preserved, stored reviews and current version unchanged',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 // Shim installed AFTER the legitimate navigation write (accepted convention).
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  const reviewsRoute=()=>rec.api.filter(u=>u.includes('/api/mocks/reviews')).length;
  // First editor: capture the live detail Edit control BEFORE opening
  // (opening unmounts the detail), then type text that must NEVER be
  // re-sent and capture the live Save/Cancel while the editor is mounted
  // (LABELLED TEST BOUNDARY: the product never renders detached controls).
  await p.evaluate(()=>{window.__re3Held={edit:document.querySelector('[data-account-history="edit-reviews"]')};});
  assert.ok(await p.evaluate(()=>!!window.__re3Held.edit),'the harness must capture the live detail Edit control before opening the editor');
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await keyboardEdit(p,'VR','1','thinking',STALE_RE3);
  await p.evaluate(()=>{window.__re3Held.save=document.querySelector('[data-account-history="edit-save"]');window.__re3Held.cancel=document.querySelector('[data-account-history="edit-cancel"]');});
  assert.ok(await p.evaluate(()=>!!(window.__re3Held.save&&window.__re3Held.cancel)),'the harness must capture the live Save/Cancel controls before Cancel');
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  assert.equal(await p.evaluate(()=>document.contains(window.__re3Held.save)),false,'the retained Save reference is deliberately detached (test-boundary precondition)');
  const patchAfterCancel=patchCount(rec);
  // Newer journey over the SAME live selection: reopen, type newer text,
  // Save explicitly (one real versioned PATCH).
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await keyboardEdit(p,'VR','1','thinking',NEWER_RE3);
  await p.locator('[data-account-history="edit-save"]').click();
  await waitDetail(p);
  assert.equal(patchCount(rec),patchAfterCancel+1,'the newer explicit Save sends exactly one PATCH');
  const saved1=await readItem(ack.id,acct.token);
  assert.equal(saved1.mock.reviews[0].thinking,NEWER_RE3,'the newer typing is what actually persisted');
  // TEST-BOUNDARY activation of the deliberately retained detached controls
  // after the selection stayed current across Cancel AND a successful Save:
  // none may send a request, replace the newer detail, or re-render a form.
  await p.evaluate(()=>{window.__re3Held.save.click();window.__re3Held.cancel.click();window.__re3Held.edit.click();});
  await settle(400);
  assert.equal(patchCount(rec),patchAfterCancel+1,'a stale detached Save/Cancel/Edit may never add a PATCH');
  assert.equal(reviewsRoute(),patchAfterCancel+1,'no stale review-route request may reach the server');
  assert.equal(await p.locator('[data-account-history="edit-save"]').count(),0,'stale controls must not re-open an editor');
  const live1=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(live1[0].includes(NEWER_RE3)&&!live1[0].includes(STALE_RE3),'the newer typed content must remain visible; stale text never combines with the newer version: '+live1[0]);
  // Actual stored reviews AND the current server version are unchanged by
  // the stale actions (direct HTTP readback, not UI text alone).
  const afterStale=await readItem(ack.id,acct.token);
  assert.deepEqual(afterStale.mock,saved1.mock,'the stored reviews are byte-unchanged by the stale detached actions');
  assert.equal(afterStale.etag,saved1.etag,'the current etag is unchanged by the stale detached actions');
  // Same ownership requirement after a SECOND successful save: the second
  // editor's retained controls must also be inert.
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await keyboardEdit(p,'VR','1','thinking',NEWER_RE3B);
  await p.evaluate(()=>{window.__re3Held2={save:document.querySelector('[data-account-history="edit-save"]'),cancel:document.querySelector('[data-account-history="edit-cancel"]')};});
  await p.locator('[data-account-history="edit-save"]').click();
  await waitDetail(p);
  const patchAfterSave2=patchCount(rec);
  assert.equal(patchAfterSave2,patchAfterCancel+2,'the second explicit Save is exactly one more PATCH');
  const saved2=await readItem(ack.id,acct.token);
  assert.notEqual(saved2.etag,saved1.etag,'the version advanced across the second save');
  await p.evaluate(()=>{window.__re3Held2.save.click();window.__re3Held2.cancel.click();});
  await settle(400);
  assert.equal(patchCount(rec),patchAfterSave2,'a retained detached Save/Cancel from a successful editor sends zero extra PATCH');
  assert.deepEqual((await readItem(ack.id,acct.token)).mock,saved2.mock,'the newest stored reviews remain unchanged');
  // Legitimate journeys remain fully usable: keyboard Edit opens the editor,
  // Cancel leaves it with zero writes.
  const editNow=p.locator('[data-account-history="edit-reviews"]');
  await editNow.focus();
  assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.accountHistory),'edit-reviews','the live detail Edit control remains keyboard focusable');
  await p.keyboard.press('Enter');
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),NEWER_RE3B,'the legitimate reopened editor prefills the newest saved content');
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  assert.equal(patchCount(rec),patchAfterSave2,'the legitimate Cancel journey added zero PATCH');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the stale-control journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob must be byte-identical');
  assert.deepEqual(await readUsage(acct.token),usage0,'a stale detached action must not change usage');
  assert.equal(await p.locator('.mock-confetti').count(),0,'stale editor actions render no celebration');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'stale editor actions render no acknowledgement');
  checkClean(rec,'re3');
  await shot(p,'shot-1440-review-edit-re3-stale-inert.png');
 }catch(e){await captureFailure(p,'re3');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-re3-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-re4-append ──
// re4: real competing writer advancing the server revision, the original
// editor Save hitting the ACTUAL 412 review_conflict over real HTTP, and the
// explicit cancel-safe reload of saved reviews. The competing write is a
// genuine accepted direct HTTP PATCH by a second writer (Node-side fetch over
// the SAME real backend), NOT a browser-layer fixture: the browser editor
// still holds the older captured version when its Save dispatches, so the
// server really answers 412. Requirements proved: the 412 retains the exact
// typed values with sanitized CONFLICT-specific copy (no raw error tokens,
// no 'saved' claim, no automatic resend/version refresh/server overwrite);
// Reload demands a native confirmation BEFORE discarding typing — dismissing
// keeps the typing and sends zero reload/PATCH requests; confirming GETs the
// ACTUAL current version, reopens the editor from it, and the next Save uses
// that exact new ETag (If-Match equals the competitor etag).
const STALE_CONFLICT='Conflicting original typing 3v8 retained after 412';
const COMPETITOR='Competing newer saved text 9k2 from the second writer';
const FINAL_AFTER_RELOAD='Final 4n6 typed after explicit reload';

test('review edit: re4 a real competing-writer revision advance makes the original Save a genuine 412 that retains typed values with sanitized conflict copy, and the explicit reload is native-confirm cancel-safe, fetches the actual current version, and the next save uses its exact ETag',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 // Native confirmation is product behaviour for the reload path: replace
 // the inherited dismiss-and-record handler with one that RECORDS each
 // dialog's type+message and applies the scripted response per phase.
 p.removeAllListeners('dialog');
 const dialogs=[];
 let dialogResponse='dismiss';
 p.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});if(dialogResponse==='accept')await d.accept();else await d.dismiss();});
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 // Shim installed AFTER the legitimate navigation write (accepted convention).
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await keyboardEdit(p,'QR','2','free',STALE_CONFLICT);
  // REAL competing writer: an actual accepted HTTP PATCH from a second
  // client advances the server-owned revision while the editor is open.
  const wreviews=structuredClone(pre.mock.reviews);
  wreviews[1].free=COMPETITOR;
  const wres=await fetch(base+'/api/mocks/reviews?id='+encodeURIComponent(ack.id),{method:'PATCH',headers:{'content-type':'application/json',authorization:'Bearer '+acct.token,'if-match':pre.etag},body:JSON.stringify({reviews:wreviews}),credentials:'omit',cache:'no-store'});
  assert.equal(wres.status,200,'the competing writer PATCH must genuinely succeed: '+wres.status);
  const compEtag=wres.headers.get('etag');
  assert.ok(compEtag&&compEtag!==pre.etag,'the competing write advanced the strong version');
  const itemsBeforeConflict=rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length;
  // Original editor Save against the now-stale captured version: the real
  // backend answers 412 review_conflict.
  await p.locator('[data-account-history="edit-save"]').click();
  await p.waitForSelector('[data-account-history="edit-conflict"]',{timeout:15000});
  assert.equal(patchCount(rec),1,'the browser editor Save is the ONLY browser PATCH (the competing write was Node-side direct HTTP)');
  const conflictCopy=await p.locator('[data-account-history="edit-conflict"]').textContent();
  assert.ok(conflictCopy.includes('changed'),'the conflict copy must state the newer revision changed elsewhere: '+conflictCopy);
  assert.ok(conflictCopy.includes('kept'),'the conflict copy must promise the typing is kept: '+conflictCopy);
  for(const raw of ['412','review_conflict','Error','error'])assert.ok(!conflictCopy.includes(raw),'the conflict copy must be sanitized with no raw error detail: '+conflictCopy);
  assert.ok(!conflictCopy.toLowerCase().includes('saved'),'the conflict state must never claim saved: '+conflictCopy);
  // Typed values retained verbatim; NO automatic resend, refresh or overwrite.
  assert.equal(await editField(p,'QR','2','free').inputValue(),STALE_CONFLICT,'the 412 retains the exact typed value');
  assert.equal(patchCount(rec),1,'no automatic resend after the 412');
  assert.equal(rec.api.filter(u=>u.includes('/api/mocks/reviews')).length,1,'no automatic review-route request after the 412');
  assert.equal(rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length,itemsBeforeConflict,'no automatic version refresh after the 412');
  const compStore=await readItem(ack.id,acct.token);
  assert.equal(compStore.mock.reviews[1].free,COMPETITOR,'the server reviews remain the competing writer content (no silent overwrite)');
  assert.equal(compStore.etag,compEtag,'the current version stays the competitor etag until an explicit reload save');
  assert.equal(await p.locator('[data-account-history="edit-reload"]').count(),1,'the conflict editor exposes an explicit Reload saved reviews control');
  const reloadCopy=await p.locator('[data-account-history="edit-reload"]').textContent();
  assert.ok(/reload/i.test(reloadCopy),'the reload control is explicitly labelled: '+reloadCopy);
  await shot(p,'shot-1440-review-edit-re4-conflict.png');
  // Cancel-safe: DISMISSING the native confirmation discards nothing, sends
  // zero reload requests and keeps the typing.
  dialogResponse='dismiss';
  await p.locator('[data-account-history="edit-reload"]').click();
  await settle(400);
  assert.equal(dialogs.length,1,'a native confirmation is demanded BEFORE discarding typing');
  assert.equal(dialogs[0].type,'confirm','the confirmation is a native confirm dialog');
  assert.ok(/typing/i.test(dialogs[0].message),'the confirmation discloses that typing would be discarded: '+dialogs[0].message);
  for(const raw of ['412','review_conflict'])assert.ok(!dialogs[0].message.includes(raw),'the native confirmation text is sanitized: '+dialogs[0].message);
  assert.equal(await editField(p,'QR','2','free').inputValue(),STALE_CONFLICT,'cancelling the reload keeps the current typed edits');
  assert.equal(patchCount(rec),1,'cancelling the reload sends zero PATCH');
  assert.equal(rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length,itemsBeforeConflict,'cancelling the reload sends zero reload GET');
  assert.deepEqual((await readItem(ack.id,acct.token)).mock,compStore.mock,'the stored reviews are unchanged by the cancelled reload');
  // Explicit confirmation: fetch the ACTUAL current version, reopen from it.
  dialogResponse='accept';
  await p.locator('[data-account-history="edit-reload"]').click();
  await p.waitForFunction(()=>{const t=document.querySelector('[data-account-history="edit-field"][data-section="QR"][data-number="2"][data-field="free"]');return !!t&&t.value.includes('Competing newer saved text 9k2');},{timeout:15000});
  assert.equal(dialogs.length,2,'the second reload produced its own native confirmation');
  assert.equal(rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length,itemsBeforeConflict+1,'the confirmed reload performs exactly one current-version GET');
  assert.equal(patchCount(rec),1,'the reload itself sends no PATCH');
  assert.equal(await editField(p,'QR','2','free').inputValue(),COMPETITOR,'the reloaded editor is seeded from the actual newest saved content');
  await shot(p,'shot-1440-review-edit-re4-reloaded.png');
  // Typing on the reloaded version, then an explicit Save uses the EXACT
  // current ETag (not the stale one) and genuinely succeeds.
  await keyboardEdit(p,'QR','2','free',FINAL_AFTER_RELOAD);
  await p.locator('[data-account-history="edit-save"]').click();
  await waitDetail(p);
  assert.equal(patchCount(rec),2,'the post-reload Save is exactly one further PATCH');
  assert.equal(rec.patch[1].headers['if-match'],compEtag,'the post-reload PATCH carries the reloaded exact current ETag');
  const finalStore=await readItem(ack.id,acct.token);
  const expectedFinal=structuredClone(compStore.mock);
  expectedFinal.reviews[1].free=FINAL_AFTER_RELOAD;
  assert.deepEqual(finalStore.mock,expectedFinal,'the newest write wins: competitor content preserved except the explicit reload-typed edit');
  assert.notEqual(finalStore.etag,compEtag,'the version advanced on the post-reload save');
  const live=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(live[1].includes(FINAL_AFTER_RELOAD),'the reopened detail shows the final edit');
  assert.deepEqual(await readUsage(acct.token),usage0,'conflict handling adds no allowance use');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the conflict journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob must be byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'conflict handling renders no celebration');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'conflict handling renders no acknowledgement');
  assert.deepEqual(dialogs.map(d=>d.type),['confirm','confirm'],'only the two reload confirmations appeared; no other dialog');
  checkClean(rec,'re4');
  await shot(p,'shot-1440-review-edit-re4-final.png');
 }catch(e){await captureFailure(p,'re4');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-re4-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-re5-append ──
// re5: serialize the pending conflict reload
// (account-review-edit-safety-parent-review.md §Next uncovered race). The
// confirmed reload awaited getMock WITHOUT setting the selection's pending
// state: textareas, Save, Cancel and Reload stayed enabled while the ACTUAL
// GET was in flight, so typing done after accepting the discard confirmation
// could be silently replaced by the arriving receipt, a second activation
// dispatched a parallel GET, and a failed reload dropped the conflict state
// and its explicit recovery control. Requirements proved over the real held
// HTTP path: the cancel-safe dismiss still sends zero requests; while the
// actual GET is held (its real 200 status, body and ETag captured and
// validated BEFORE release, the EXACT original response delivered last) the
// editor is busy-serialized: textareas, Save, Cancel and Reload disabled,
// later typing cannot enter the editor, a second activation adds zero extra
// GET, Back stays available; the released reseed shows the ACTUAL newest
// stored content; and a labelled browser-layer 503 GET failure retains the
// typing plus the conflict recovery state and control with no misleading
// success.
const STALE_RE5='Original conflict typing 6h2 kept through reload serialization';
const COMPETITOR_RE5='Competing saved text 8f4 reloaded under busy state';
const LATER_RE5='Later typing 3z7 during held reload never entered';
const RETAINED_RE5='Conflict typing 5j9 retained after reload failure';
const RIVAL_RE5='Second competing text 1d6 after reload failure';

const fieldState=p=>p.evaluate(()=>({taDisabled:Array.from(document.querySelectorAll('[data-account-history="edit-field"]')).every(t=>t.disabled),save:document.querySelector('[data-account-history="edit-save"]')?.disabled,cancel:document.querySelector('[data-account-history="edit-cancel"]')?.disabled,reload:document.querySelector('[data-account-history="edit-reload"]')?.disabled,reloadCount:document.querySelectorAll('[data-account-history="edit-reload"]').length,backDisabled:document.querySelector('[data-account-history="back"]')?.disabled}));

test('review edit: re5 a held conflict reload serializes the editor: busy controls disabled, later typing never overwritten, a second activation adds zero extra GET, Back stays available, and a failed reload retains typing plus conflict recovery',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 // Native confirmation is product behaviour for the reload path: RECORD each
 // dialog and apply the scripted response per phase (accepted re4 pattern).
 p.removeAllListeners('dialog');
 const dialogs=[];
 let dialogResponse='dismiss';
 p.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});if(dialogResponse==='accept')await d.accept();else await d.dismiss();});
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 // LABELLED browser-layer hold/fault fixture on this record's item GET only:
 // the hold forwards the REAL same-origin request through route.fetch and
 // re-delivers the EXACT captured response; the 503 is an explicitly
 // controlled browser-layer fault, never a backend outage claim.
 const itemUrl=base+'/api/mocks/item?id='+encodeURIComponent(ack.id);
 let itemMode='off',itemHold=null,holdResolve=null;const itemCalls=[];
 await p.route(url=>url.href.startsWith(itemUrl),async route=>{
  itemCalls.push(route.request().url());
  if(itemMode==='hold'){const resp=await route.fetch();const body=await resp.text();itemHold={status:resp.status(),body,etag:resp.headers()['etag']};await new Promise(r=>{holdResolve=r;});itemMode='off';await route.fulfill({status:itemHold.status,headers:{'content-type':'application/json; charset=utf-8','etag':itemHold.etag},body:itemHold.body});return;}
  if(itemMode==='fault503'){itemMode='off';await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})});return;}
  await route.continue();
 });
 const waitHold=async()=>{const t0=Date.now();while(!itemHold){if(Date.now()-t0>15000)harness('the held reload GET was never captured — never release a hold that caught nothing');await new Promise(r=>setTimeout(r,50));}};
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  const getsBase=itemCalls.length;
  assert.equal(getsBase,1,'the detail open performed exactly one item GET (fixture baseline)');
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await keyboardEdit(p,'QR','2','free',STALE_RE5);
  // REAL competing writer (accepted direct HTTP PATCH) makes the next Save
  // a genuine 412 — the conflict state that owns the reload control.
  const wr1=structuredClone(pre.mock.reviews);wr1[1].free=COMPETITOR_RE5;
  const r1=await fetch(base+'/api/mocks/reviews?id='+encodeURIComponent(ack.id),{method:'PATCH',headers:{'content-type':'application/json',authorization:'Bearer '+acct.token,'if-match':pre.etag},body:JSON.stringify({reviews:wr1}),credentials:'omit',cache:'no-store'});
  assert.equal(r1.status,200,'the competing writer PATCH genuinely succeeds: '+r1.status);
  const compEtag=r1.headers.get('etag');
  await p.locator('[data-account-history="edit-save"]').click();
  await p.waitForSelector('[data-account-history="edit-conflict"]',{timeout:15000});
  assert.equal(patchCount(rec),1,'the conflict Save is the only browser PATCH so far');
  // Pre-existing cancel-safe guard (accepted re4 behavior, retained):
  // dismissing the confirmation sends ZERO requests and keeps the typing.
  dialogResponse='dismiss';
  await p.locator('[data-account-history="edit-reload"]').click();
  await settle(400);
  assert.equal(dialogs.length,1,'the reload demands its native confirmation first');
  assert.equal(itemCalls.length,getsBase,'a dismissed reload sends zero GET');
  assert.equal(await editField(p,'QR','2','free').inputValue(),STALE_RE5,'dismissing keeps the typing');
  // Serialize proof: accept and HOLD the actual GET.
  itemHold=null;itemMode='hold';dialogResponse='accept';
  await p.locator('[data-account-history="edit-reload"]').click();
  await waitHold();
  assert.equal(itemHold.status,200,'the held reload GET is a real upstream 200');
  const heldBody=JSON.parse(itemHold.body);
  assert.equal(heldBody.mock.id,ack.id,'the held receipt carries the literal record id');
  assert.equal(heldBody.mock.reviews[1].free,COMPETITOR_RE5,'the held receipt carries the ACTUAL newest stored content');
  assert.equal(itemHold.etag,compEtag,'the held receipt carries the current strong ETag');
  assert.equal(itemCalls.length,getsBase+1,'the accepted reload dispatched exactly one GET');
  await fs.writeFile(new URL('re5-held-get-receipt.json',out),JSON.stringify({stableId:ack.id,heldStatus:itemHold.status,heldEtag:itemHold.etag,heldReviews:heldBody.mock.reviews.map(q=>({section:q.section,number:q.number,free:q.free}))},null,2));
  // EVIDENCE FIRST: the visible state during the held GET.
  await shot(p,'shot-1440-re5-reload-busy.png');
  // THE MISSING BEHAVIOR (genuine old-source RED): nothing editable may stay
  // usable while the confirmed reload is in flight; Back stays available.
  {const s=await fieldState(p);
  assert.ok(s.taDisabled,'all editor textareas must be disabled while the reload GET is pending');
  assert.equal(s.save,true,'Save must be disabled while the reload GET is pending');
  assert.equal(s.cancel,true,'Cancel must be disabled while the reload GET is pending');
  assert.equal(s.reload,true,'Reload must be disabled while the reload GET is pending');
  assert.equal(s.backDisabled,false,'Back/departure invalidation stays available during the pending reload');}
  // Later typing must NOT enter the serialized editor (old source let the
  // in-flight receipt silently replace it).
  await p.evaluate(()=>{const t=document.querySelector('[data-account-history="edit-field"][data-section="QR"][data-number="2"][data-field="free"]');if(t)t.focus();});
  await p.keyboard.type(LATER_RE5);
  assert.equal(await editField(p,'QR','2','free').inputValue(),STALE_RE5,'later typing during the held reload can neither enter the locked editor nor be silently replaced before the actual receipt lands: '+await editField(p,'QR','2','free').inputValue());
  // A second activation dispatches ZERO extra GET and demands no new
  // confirmation (LABELLED TEST BOUNDARY: programmatic click on the
  // still-rendered but disabled control; Playwright refuses a real pointer
  // click on a disabled button).
  await p.evaluate(()=>{document.querySelector('[data-account-history="edit-reload"]').click();});
  await settle(400);
  assert.equal(itemCalls.length,getsBase+1,'a second Reload activation while pending adds zero extra GET');
  assert.equal(dialogs.length,2,'no additional confirmation is demanded while the reload is pending');
  // Release the EXACT captured original response LAST.
  {const rh=holdResolve;holdResolve=null;if(!rh)harness('no held reload GET to release');rh();}
  await p.waitForFunction(()=>{const t=document.querySelector('[data-account-history="edit-field"][data-section="QR"][data-number="2"][data-field="free"]');return !!t&&t.value==='Competing saved text 8f4 reloaded under busy state';},{timeout:15000});
  {const s=await fieldState(p);
  assert.equal(s.save,false,'Save is usable again after the released reload');
  assert.equal(s.cancel,false,'Cancel is usable again after the released reload');}
  assert.equal(await p.locator('[data-account-history="edit-conflict"]').count(),0,'the successful reload clears the conflict state');
  assert.equal(await p.locator('[data-account-history="edit-reload"]').count(),0,'the reloaded editor no longer offers reload');
  // A SECOND genuine conflict (new real competitor write + real 412), then a
  // FAILED reload (labelled browser-layer 503) must retain typing AND the
  // conflict recovery state — never a misleading success.
  const mid=await readItem(ack.id,acct.token);
  assert.equal(mid.etag,compEtag,'the released reload adopted the current version');
  const wr2=structuredClone(mid.mock.reviews);wr2[1].free=RIVAL_RE5;
  const r2=await fetch(base+'/api/mocks/reviews?id='+encodeURIComponent(ack.id),{method:'PATCH',headers:{'content-type':'application/json',authorization:'Bearer '+acct.token,'if-match':mid.etag},body:JSON.stringify({reviews:wr2}),credentials:'omit',cache:'no-store'});
  assert.equal(r2.status,200,'the second competing PATCH genuinely succeeds: '+r2.status);
  await keyboardEdit(p,'QR','2','free',RETAINED_RE5);
  await p.locator('[data-account-history="edit-save"]').click();
  await p.waitForSelector('[data-account-history="edit-conflict"]',{timeout:15000});
  assert.equal(patchCount(rec),2,'the second conflict Save is exactly one further PATCH');
  itemMode='fault503';dialogResponse='accept';
  await p.locator('[data-account-history="edit-reload"]').click();
  {const t0=Date.now();while(itemCalls.length<getsBase+2){if(Date.now()-t0>15000)harness('the failed-reload GET was never dispatched');await new Promise(r=>setTimeout(r,50));}}
  await p.waitForSelector('[data-account-history="edit-conflict"]',{timeout:15000});
  assert.equal(await editField(p,'QR','2','free').inputValue(),RETAINED_RE5,'a failed reload keeps the exact typed content');
  {const s=await fieldState(p);
  assert.equal(s.reload,false,'the failed reload retains the explicit recovery control, enabled');
  assert.equal(s.save,false,'Save is usable again after the failed reload');
  assert.equal(s.backDisabled,false,'Back stays available after the failed reload');}
  const errCopy=await p.locator('[data-account-history="edit-conflict"]').textContent();
  assert.ok(!/success/i.test(errCopy),'a failed reload must never claim success: '+errCopy);
  await shot(p,'shot-1440-re5-reload-failure-recovery.png');
  // Explicit recovery completes: accept and the real reload succeeds.
  itemMode='off';
  await p.locator('[data-account-history="edit-reload"]').click();
  await p.waitForFunction(()=>{const t=document.querySelector('[data-account-history="edit-field"][data-section="QR"][data-number="2"][data-field="free"]');return !!t&&t.value.includes('Second competing text 1d6');},{timeout:15000});
  assert.equal(await p.locator('[data-account-history="edit-reload"]').count(),0,'the completed recovery clears the conflict editor');
  assert.equal(patchCount(rec),2,'the reload journey adds zero PATCH overall');
  assert.equal(itemCalls.length,getsBase+3,'exactly the three scripted reload GETs occurred');
  assert.deepEqual(dialogs.map(d=>d.type),['confirm','confirm','confirm','confirm'],'only reload confirmations appeared as dialogs');
  const finalStore=await readItem(ack.id,acct.token);
  assert.equal(finalStore.mock.reviews[1].free,RIVAL_RE5,'the stored reviews remain the second competitor content (no silent overwrite)');
  assert.equal((await readUsage(acct.token)).cumulativeLogsUsed,usage0.cumulativeLogsUsed,'the reload journey consumes no allowance');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the reload journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'the reload journey renders no celebration');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'the reload journey renders no acknowledgement');
  checkClean(rec,'re5');
  await shot(p,'shot-1440-re5-final.png');
 }catch(e){await captureFailure(p,'re5');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-re5-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-re6-append ──
// re6: acknowledgement-loss UNCERTAINTY after a REAL committed PATCH plus the
// explicit captured-version/captured-payload retry and reload reconciliation
// (extension contract §failure-uncertainty; parent review §Next uncovered
// race ¶2). The browser PATCH genuinely COMMITS on the real backend: the
// route forwards it through route.fetch, and the actual 200 acknowledgement,
// stored reviews and returned ETag are validated through direct HTTP readback
// BEFORE the LABELLED CONTROLLED 503 replaces the acknowledgement in flight —
// fault injection at the browser layer, never a backend outage claim. The old
// editor claimed 'This review edit could not be saved' — a definite-failure
// claim that is FALSE once the commit landed — kept the fields editable so
// newer typing could be conflated with the submitted attempt, and offered no
// reconciliation. Requirements proved: an ambiguous outcome stays truthfully
// uncertain (no saved / definitely-not-saved claim, sanitized copy); the
// frozen submitted attempt is separate from any newer typing (fields locked,
// memory-only); no automatic resend; the explicit Retry re-sends the EXACT
// captured If-Match version and byte-identical payload through the accepted
// mock-store verified-content identical-retry branch (real 200, revision NOT
// bumped, no allowance movement); a genuine 412 on a retry CANNOT settle the
// original outcome, so uncertainty is retained with no misleading
// definite-failure claim; the cancel-safe explicit reload reconciles against
// the ACTUAL stored state; the reconciled save uses the reloaded exact
// version; immutable fields, usage, browser-local blob and celebration /
// acknowledgement seams unchanged.
const UNCERT1='Uncertainty typing 7c1 committed with acknowledgement lost';
const UNCERT2='Second uncertainty typing 2m9 commit unconfirmed';
const RIVAL_RE6='Rival newer text 5t3 during uncertainty';
const FINAL_RE6='Final reconciled edit 8b7 after explicit reload';

test('review edit: re6 a real committed PATCH whose acknowledgement is lost stays truthfully uncertain with locked captured typing, the explicit retry re-sends the exact captured version and byte-identical payload which the real identical-retry branch settles without a revision bump, a later competing 412 retains the uncertainty, and the cancel-safe reload reconciles with the actual stored state',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 p.removeAllListeners('dialog');
 const dialogs=[];
 let dialogResponse='accept';
 p.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});if(dialogResponse==='accept')await d.accept();else await d.dismiss();});
 const bodies=[];
 p.on('request',r=>{if(r.method()==='PATCH')bodies.push(r.postData());});
 const respSeen=[];
 p.on('response',r=>{if(r.url().startsWith(base+'/api/mocks/reviews'))respSeen.push({status:r.status(),etag:r.headers()['etag']});});
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 // LABELLED fault injection ONLY in 'inject' mode: the REAL PATCH is
 // forwarded upstream and its actual acknowledgement plus the direct store
 // readback are validated BEFORE the controlled 503 replaces the response in
 // flight. Every other PATCH passes through untouched to the real backend.
 let patchMode='off';const injects=[];
 await p.route(base+'/api/mocks/reviews?*',async route=>{
  const req=route.request();
  if(patchMode==='inject'){
   patchMode='off';
   const resp=await route.fetch();
   const text=await resp.text();
   const ev={label:'controlled-503-fault-injection-after-real-commit (browser-layer fixture, NOT a backend outage)',ifMatch:req.headers()['if-match'],postData:req.postData(),upstreamStatus:resp.status(),upstreamBody:text,upstreamEtag:resp.headers()['etag']};
   if(resp.status()!==200){injects.push(ev);await route.fulfill({status:resp.status(),headers:{'content-type':'application/json; charset=utf-8','etag':resp.headers()['etag']??''},body:text});return;}
   const storeBefore=await readItem(ack.id,acct.token);
   ev.storeReadbackBeforeReplacement={etag:storeBefore.etag,reviews:storeBefore.mock.reviews.map(q=>({section:q.section,number:q.number,thinking:q.thinking,instead:q.instead,free:q.free}))};
   injects.push(ev);
   await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})});
   return;
  }
  await route.continue();
 });
 const uncertainCopy=async()=>p.locator('[data-account-history="edit-uncertain"]').textContent();
 const assertUncertain=async()=>{
  await p.waitForSelector('[data-account-history="edit-uncertain"]',{timeout:15000});
  const copy=await uncertainCopy();
  assert.ok(/confirm/i.test(copy),'the uncertain copy states the outcome could not be confirmed: '+copy);
  assert.ok(!/could not be saved|was not saved|not saved|no changes were saved/i.test(copy),'the uncertain copy makes NO definite not-saved claim: '+copy);
  assert.ok(!/has been saved|successfully/i.test(copy),'the uncertain copy makes NO saved claim: '+copy);
  for(const raw of ['503','storage_unavailable','Error','error'])assert.ok(!copy.includes(raw),'the uncertain copy is sanitized with no raw transport detail: '+copy);
  assert.ok(await p.evaluate(()=>Array.from(document.querySelectorAll('[data-account-history="edit-field"]')).every(t=>t.disabled)),'the frozen submitted attempt locks every textarea');
  assert.equal(await p.locator('[data-account-history="edit-retry-uncertain"]').count(),1,'an explicit captured-attempt Retry control is offered');
  assert.equal(await p.locator('[data-account-history="edit-reload"]').count(),1,'an explicit reload reconciliation control is offered');
  {const s=await p.evaluate(()=>({save:document.querySelector('[data-account-history="edit-save"]')?.disabled,cancel:document.querySelector('[data-account-history="edit-cancel"]')?.disabled,back:document.querySelector('[data-account-history="back"]')?.disabled}));
  assert.equal(s.save,true,'Save is disabled while the outcome is uncertain');
  assert.equal(s.cancel,true,'Cancel is disabled while the outcome is uncertain');
  assert.equal(s.back,false,'Back/departure invalidation stays available while uncertain');}
 };
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  // ── Phase 1: real commit, lost acknowledgement, identical retry settles.
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await keyboardEdit(p,'QR','2','free',UNCERT1);
  patchMode='inject';
  await p.locator('[data-account-history="edit-save"]').click();
  {const t0=Date.now();while(!injects.length){if(Date.now()-t0>15000)harness('the injected PATCH never reached the browser route');await new Promise(r=>setTimeout(r,50));}}
  assert.equal(injects[0].upstreamStatus,200,'the original PATCH genuinely committed on the real backend: '+injects[0].upstreamStatus);
  assert.ok(/^"review-\d+"$/.test(String(injects[0].upstreamEtag)),'the real commit returned a strong version');
  const rb0=injects[0].storeReadbackBeforeReplacement;
  assert.equal(rb0.reviews[1].free,UNCERT1,'the ACTUAL store already carries the submitted review BEFORE the controlled replacement');
  assert.equal(rb0.etag,injects[0].upstreamEtag,'the direct readback version equals the real acknowledgement version');
  await assertUncertain();
  assert.equal(await editField(p,'QR','2','free').inputValue(),UNCERT1,'the uncertain editor shows the exact submitted typing locked');
  assert.equal(patchCount(rec),1,'no automatic resend while uncertain');
  await shot(p,'shot-1440-re6-uncertain.png');
  // Cancel-safe reload dismissal in uncertain mode: zero GET, kept uncertain.
  const itemGetCount=()=>rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length;
  const getsBeforeDismiss=itemGetCount();
  dialogResponse='dismiss';
  await p.locator('[data-account-history="edit-reload"]').click();
  await settle(400);
  assert.equal(itemGetCount(),getsBeforeDismiss,'a dismissed reconciliation reload sends zero GET');
  assert.equal(await p.locator('[data-account-history="edit-uncertain"]').count(),1,'the dismissed reload keeps the uncertainty state');
  await fs.writeFile(new URL('re6-inject-receipt.json',out),JSON.stringify({stableId:ack.id,phase1:injects[0]},null,2));
  // Explicit Retry of the SAME captured version and payload over the real
  // accepted identical-content retry branch (verified store replay).
  dialogResponse='accept';
  await p.locator('[data-account-history="edit-retry-uncertain"]').click();
  await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
  assert.equal(patchCount(rec),2,'the explicit Retry sent exactly one further PATCH');
  assert.equal(rec.patch[1].headers['if-match'],pre.etag,'the retry carries the EXACT captured version, never a refreshed one');
  assert.equal(bodies[1],bodies[0],'the retry payload is byte-identical to the original submitted payload');
  assert.equal(respSeen[1].status,200,'the real backend settles the identical retry with a genuine 200: '+respSeen[1].status);
  assert.equal(respSeen[1].etag,injects[0].upstreamEtag,'the identical retry does NOT bump the revision (accepted verified-content replay branch)');
  const afterRetry=await readItem(ack.id,acct.token);
  const expected1=structuredClone(pre.mock);expected1.reviews[1].free=UNCERT1;
  assert.deepEqual(afterRetry.mock,expected1,'the stored record equals the submitted attempt with every immutable field verbatim');
  assert.equal(afterRetry.etag,injects[0].upstreamEtag,'the confirmed version stays the one the real commit returned');
  assert.deepEqual(await readUsage(acct.token),usage0,'uncertainty and retry consume no allowance');
  const live1=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(live1[1].includes(UNCERT1),'the detail confirms the actual persisted content after settlement');
  // ── Phase 2: lost acknowledgement, then a real competitor write — the
  // retry conflict cannot settle the original outcome, so uncertainty is
  // retained; only the explicit reload reconciles with the ACTUAL state.
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await keyboardEdit(p,'VR','1','thinking',UNCERT2);
  patchMode='inject';
  await p.locator('[data-account-history="edit-save"]').click();
  {const t0=Date.now();while(injects.length<2){if(Date.now()-t0>15000)harness('the second injected PATCH never reached the browser route');await new Promise(r=>setTimeout(r,50));}}
  assert.equal(injects[1].upstreamStatus,200,'the second PATCH genuinely committed too: '+injects[1].upstreamStatus);
  assert.equal(injects[1].storeReadbackBeforeReplacement.reviews[0].thinking,UNCERT2,'the store really holds the second submission before the controlled replacement');
  await assertUncertain();
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),UNCERT2,'the frozen second attempt stays visible and locked');
  // REAL competing writer moves the version during the uncertainty.
  const mid=await readItem(ack.id,acct.token);
  const wr=structuredClone(mid.mock.reviews);wr[1].instead=RIVAL_RE6;
  const cr=await fetch(base+'/api/mocks/reviews?id='+encodeURIComponent(ack.id),{method:'PATCH',headers:{'content-type':'application/json',authorization:'Bearer '+acct.token,'if-match':mid.etag},body:JSON.stringify({reviews:wr}),credentials:'omit',cache:'no-store'});
  assert.equal(cr.status,200,'the competing writer PATCH genuinely succeeds: '+cr.status);
  const rivalEtag=cr.headers.get('etag');
  // The retry now meets the REAL 412: it proves nothing either way about the
  // original submission, so the editor must stay uncertain — no
  // definite-failure claim, no saved claim, nothing overwritten.
  assert.equal(patchCount(rec),3,'the injected second Save is the third browser PATCH');
  await p.locator('[data-account-history="edit-retry-uncertain"]').click();
  {const t0=Date.now();while(!(respSeen.length>=4&&respSeen[respSeen.length-1].status===412)){if(Date.now()-t0>15000)harness('the conflicting retry never received a real 412; saw '+JSON.stringify(respSeen));await new Promise(r=>setTimeout(r,50));}}
  assert.equal(patchCount(rec),4,'the conflict retry sent exactly one PATCH (third browser PATCH overall is the injected second Save)');
  await assertUncertain();
  assert.ok(/confirm/i.test(await uncertainCopy()),'the retained uncertainty copy still refuses any definite claim');
  const midStore=await readItem(ack.id,acct.token);
  assert.equal(midStore.etag,rivalEtag,'the conflicting retry overwrote nothing: the rival version stays current');
  assert.equal(midStore.mock.reviews[1].instead,RIVAL_RE6,'the stored reviews remain the competitor content');
  assert.equal(patchCount(rec),4,'no automatic resend after the conflicting retry');
  await shot(p,'shot-1440-re6-uncertain-retained.png');
  // Cancel-safe explicit reload: dismiss keeps everything (zero GET), then
  // accept reconciles the editor with the ACTUAL newest stored content.
  const getsBefore=itemGetCount();
  dialogResponse='dismiss';
  await p.locator('[data-account-history="edit-reload"]').click();
  await settle(400);
  assert.equal(itemGetCount(),getsBefore,'the dismissed reconciliation reload sent zero GET');
  assert.equal(await p.locator('[data-account-history="edit-uncertain"]').count(),1,'the dismissed reload keeps the uncertainty until reconciled');
  dialogResponse='accept';
  await p.locator('[data-account-history="edit-reload"]').click();
  await p.waitForFunction(()=>{const t=document.querySelector('[data-account-history="edit-field"][data-section="QR"][data-number="2"][data-field="instead"]');return !!t&&t.value.includes('Rival newer text 5t3');},{timeout:15000});
  assert.equal(itemGetCount(),getsBefore+1,'exactly one reconciliation GET after the accepted reload');
  assert.deepEqual(dialogs.map(d=>d.type),['confirm','confirm','confirm'],'only the three reload confirmations appeared as dialogs');
  assert.equal(await p.locator('[data-account-history="edit-uncertain"]').count(),0,'the reconciled editor leaves the uncertain state');
  assert.equal(await p.locator('[data-account-history="edit-retry-uncertain"]').count(),0,'the reconciled editor no longer offers the frozen retry');
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),UNCERT2,'the reloaded editor carries the ACTUAL stored content including the committed second attempt');
  // The reconciled save uses the reloaded exact version and really succeeds.
  await keyboardEdit(p,'QR','2','free',FINAL_RE6);
  await p.locator('[data-account-history="edit-save"]').click();
  await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
  assert.equal(patchCount(rec),5,'the reconciled save is exactly one further PATCH');
  assert.equal(rec.patch[4].headers['if-match'],rivalEtag,'the reconciled PATCH carries the reloaded exact current ETag');
  const finalStore=await readItem(ack.id,acct.token);
  const expectedFinal=structuredClone(midStore.mock);
  expectedFinal.reviews[1].free=FINAL_RE6;
  assert.deepEqual(finalStore.mock,expectedFinal,'the newest explicit write wins on top of the actual stored state');
  assert.notEqual(finalStore.etag,rivalEtag,'the version advanced only on the reconciled success');
  await fs.writeFile(new URL('re6-settled-receipt.json',out),JSON.stringify({stableId:ack.id,phase1Ack:injects[0].upstreamEtag,phase2Ack:injects[1].upstreamEtag,retrySettle:{status:respSeen[1].status,etag:respSeen[1].etag},retryConflict:{status:respSeen[3].status,rivalEtag},finalEtag:finalStore.etag,injectedFaults:injects.map(ev=>ev.label)},null,2));
  assert.deepEqual((await readUsage(acct.token)).cumulativeLogsUsed,usage0.cumulativeLogsUsed,'the uncertainty journey consumes no allowance end to end');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the uncertainty journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'the uncertainty journey renders no celebration');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'the uncertainty journey renders no acknowledgement');
  checkClean(rec,'re6');
  await shot(p,'shot-1440-re6-final.png');
 }catch(e){await captureFailure(p,'re6');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-re6-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-u1-append ──
// U1 (resume contract §1, lifecycle-plan §Journey U1): the ORIGINAL
// uncertain PATCH outcome must remain uncertain after ANY later typed retry
// refusal, not only 412/ambiguous codes. Fixture honesty: the original
// commit and every retry reach the REAL backend through route.fetch; the
// 503 acknowledgement-loss and the typed 422/403 retry refusals are
// LABELLED CONTROLLED browser-layer response substitutions made AFTER the
// actual upstream response and direct store readback are proven — never
// presented as backend results, and the backend is never touched.
// Already-correct coverage retained honestly: the 422
// operation_work_limit_exceeded refusal is inside UNCERTAIN_CODES, so the
// current source already preserves uncertainty for it; the genuine
// missing behavior (old-source RED) is that a typed refusal OUTSIDE that
// set (here 403 initial_allowance_exhausted) falls to the definite-failure
// renderer and drops the frozen captured attempt.
const U1_TEXT='U1 frozen submitted typing 4r8 must stay uncertain after typed refusals';

test('review edit: u1 an uncertain captured review PATCH stays truthfully uncertain after ANY typed retry refusal, including controlled 422 operation_work_limit_exceeded and 403 initial_allowance_exhausted substitutions over a proven real upstream state, keeps the frozen version and byte-identical payload with zero automatic requests, and settles only through a real acknowledgement or readback',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 p.removeAllListeners('dialog');
 const dialogs=[];let dialogResponse='accept';
 p.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});if(dialogResponse==='accept')await d.accept();else await d.dismiss();});
 const bodies=[];
 p.on('request',r=>{if(r.method()==='PATCH')bodies.push(r.postData());});
 const respSeen=[];
 p.on('response',r=>{if(r.url().startsWith(base+'/api/mocks/reviews'))respSeen.push({status:r.status()});});
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 // LABELLED controlled substitutions ONLY: every mode first forwards the
 // REAL request upstream via route.fetch and proves the actual response
// plus a direct store readback BEFORE replacing the reply the browser sees.
 let mode='off';let refuseKey='';const events=[];
 await p.route(base+'/api/mocks/reviews?*',async route=>{
  const req=route.request();
  if(mode==='inject503'){
   mode='off';
   const resp=await route.fetch();const text=await resp.text();
   const ev={label:'controlled-503-ack-loss-after-real-commit (browser-layer fixture, NOT a backend outage)',ifMatch:req.headers()['if-match'],postData:req.postData(),upstreamStatus:resp.status(),upstreamEtag:resp.headers()['etag'],upstreamBody:text};
   if(resp.status()!==200){events.push(ev);await route.fulfill({status:resp.status(),headers:{'content-type':'application/json; charset=utf-8','etag':resp.headers()['etag']??''},body:text});return;}
   const rb=await readItem(ack.id,acct.token);
   ev.storeReadbackBeforeReplacement={etag:rb.etag,containsSubmitted:JSON.stringify(rb.mock.reviews).includes(U1_TEXT)};
   events.push(ev);
   await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})});
   return;
  }
  if(mode==='refuse'){
   const spec=refuseKey==='workLimit'?{status:422,code:'operation_work_limit_exceeded'}:{status:403,code:'initial_allowance_exhausted'};
   mode='off';
   const resp=await route.fetch();const text=await resp.text();
   const rb=await readItem(ack.id,acct.token);
   events.push({label:'controlled-typed-refusal-substitution (adversarial browser-layer fixture AFTER the real upstream state is proven; NOT the backend result for this request)',refusal:refuseKey,substitution:spec,ifMatch:req.headers()['if-match'],postData:req.postData(),upstreamStatus:resp.status(),upstreamEtag:resp.headers()['etag'],upstreamBody:text,storeReadbackBeforeSubstitution:{etag:rb.etag,containsSubmitted:JSON.stringify(rb.mock.reviews).includes(U1_TEXT)}});
   await route.fulfill({status:spec.status,contentType:'application/json',body:JSON.stringify({error:spec.code})});
   return;
  }
  await route.continue();
 });
 const waitEvent=async(n,ms=15000)=>{const t0=Date.now();while(events.length<n){if(Date.now()-t0>ms)harness(`controlled event ${n} never reached the browser route (have ${events.length})`);await new Promise(r=>setTimeout(r,50));}return events.length;};
 const waitResponse=async(status,ms=15000)=>{const t0=Date.now();while(!(respSeen.length&&(respSeen[respSeen.length-1].status===status))){if(Date.now()-t0>ms)harness(`the browser never observed status ${status} on the review route; saw `+JSON.stringify(respSeen.map(x=>x.status)));await new Promise(r=>setTimeout(r,50));}};
 const uncertainCopy=async()=>p.locator('[data-account-history="edit-uncertain"]').textContent();
 const assertUncertain=async where=>{
  await p.waitForSelector('[data-account-history="edit-uncertain"]',{timeout:15000});
  const copy=await uncertainCopy();
  assert.ok(/confirm/i.test(copy),'the '+where+' refusal keeps the cannot-confirm copy: '+copy);
  assert.ok(!/could not be saved|was not saved|not saved|no changes were saved/i.test(copy),'the '+where+' refusal makes NO definite not-saved claim: '+copy);
  assert.ok(!/has been saved|successfully/i.test(copy),'the '+where+' refusal makes NO saved claim: '+copy);
  for(const raw of ['503','422','403','storage_unavailable','operation_work_limit_exceeded','initial_allowance_exhausted','Error','error'])assert.ok(!copy.includes(raw),'the retained uncertainty copy is sanitized with no raw refusal detail at '+where+': '+copy);
  assert.ok(await p.evaluate(()=>Array.from(document.querySelectorAll('[data-account-history="edit-field"]')).every(t=>t.disabled)),'the frozen attempt stays locked after the '+where+' refusal');
  assert.equal(await p.locator('[data-account-history="edit-retry-uncertain"]').count(),1,'the explicit Retry control stays available after the '+where+' refusal');
  assert.equal(await p.locator('[data-account-history="edit-reload"]').count(),1,'the explicit reconciliation control stays available after the '+where+' refusal');
  assert.equal(await p.locator('[data-account-history="edit-error"]').count(),0,'no definite-failure copy may appear after the '+where+' refusal');
  {const s=await p.evaluate(()=>({save:document.querySelector('[data-account-history="edit-save"]')?.disabled,cancel:document.querySelector('[data-account-history="edit-cancel"]')?.disabled}));
  assert.equal(s.save,true,'Save stays disabled while the outcome is uncertain after '+where);
  assert.equal(s.cancel,true,'Cancel stays disabled while the outcome is uncertain after '+where);}
 };
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  // Uncertain state through the accepted re6 fixture: REAL commit + lost ack.
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await keyboardEdit(p,'QR','2','free',U1_TEXT);
  mode='inject503';
  await p.locator('[data-account-history="edit-save"]').click();
  await waitEvent(1);
  assert.equal(events[0].upstreamStatus,200,'the original PATCH genuinely committed on the real backend: '+events[0].upstreamStatus);
  assert.ok(/^"review-\d+"$/.test(String(events[0].upstreamEtag)),'the real commit returned a strong version');
  assert.equal(events[0].storeReadbackBeforeReplacement.containsSubmitted,true,'the ACTUAL store carries the submitted review BEFORE the controlled replacement');
  await assertUncertain('setup');
  assert.equal(await editField(p,'QR','2','free').inputValue(),U1_TEXT,'the uncertain editor shows the exact submitted typing locked');
  assert.equal(patchCount(rec),1,'no automatic resend while uncertain');
  // Refusal A: controlled typed 422 operation_work_limit_exceeded (already
  // an UNCERTAIN_CODES member — this path must keep uncertainty).
  refuseKey='workLimit';mode='refuse';
  await p.locator('[data-account-history="edit-retry-uncertain"]').click();
  await waitEvent(2);
  assert.equal(events[1].upstreamStatus,200,'the retry genuinely reached the real identical-replay branch before the substitution');
  assert.equal(events[1].storeReadbackBeforeSubstitution.containsSubmitted,true,'the proven real upstream commit stays intact during the substitution');
  await waitResponse(422);
  await assertUncertain('422 work-limit');
  assert.equal(await editField(p,'QR','2','free').inputValue(),U1_TEXT,'the 422 refusal cannot unlock or replace the frozen typing');
  assert.equal(patchCount(rec),2,'the explicit 422 retry sent exactly one PATCH');
  assert.equal(bodies[1],bodies[0],'the 422 retry payload is byte-identical to the captured payload');
  assert.equal(rec.patch[1].headers['if-match'],pre.etag,'the 422 retry carried the exact captured version, never a refreshed one');
  const itemGetCount=()=>rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length;
  const getsA=itemGetCount();
  dialogResponse='dismiss';
  await p.locator('[data-account-history="edit-reload"]').click();
  await settle(400);
  assert.equal(itemGetCount(),getsA,'a dismissed reconciliation reload still sends zero GET after a typed refusal');
  assert.equal(await p.locator('[data-account-history="edit-uncertain"]').count(),1,'the dismissed reload keeps uncertainty');
  dialogResponse='accept';
  // Refusal B (genuine missing behavior on old source): a typed refusal OUTSIDE
  // the ambiguous set cannot settle the original attempt either.
  refuseKey='allowance';mode='refuse';
  await p.locator('[data-account-history="edit-retry-uncertain"]').click();
  await waitEvent(3);
  assert.equal(events[2].upstreamStatus,200,'the second retry genuinely reached the real backend before the substitution');
  await waitResponse(403);
  await fs.writeFile(new URL('u1-refusals-receipt.json',out),JSON.stringify({stableId:ack.id,capturedVersion:pre.etag,events},null,2));
  await assertUncertain('403 allowance');
  await shot(p,'shot-1440-u1-uncertain-after-typed-refusals.png');
  assert.equal(patchCount(rec),3,'the explicit 403 retry sent exactly one PATCH');
  assert.equal(bodies[2],bodies[0],'the 403 refusal retry payload stayed byte-identical');
  await settle(1200);
  assert.equal(patchCount(rec),3,'no automatic request follows any typed refusal');
  // Settlement remains possible ONLY through a real acknowledgement: the
  // final explicit retry passes straight through to the real backend.
  mode='off';
  await p.locator('[data-account-history="edit-retry-uncertain"]').click();
  await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
  assert.equal(patchCount(rec),4,'the final explicit retry sent exactly one further PATCH');
  assert.equal(bodies[3],bodies[0],'the settling retry re-sent the byte-identical captured payload');
  const rbF=await readItem(ack.id,acct.token);
  const expectedF=structuredClone(pre.mock);expectedF.reviews[1].free=U1_TEXT;
  assert.deepEqual(rbF.mock,expectedF,'the settled record equals the captured attempt with every immutable field verbatim');
  assert.equal(rbF.etag,events[0].upstreamEtag,'the settled version is the one the real commit returned');
  assert.equal(await p.locator('[data-account-history="edit-uncertain"]').count(),0,'a real acknowledgement ends the uncertainty');
  const live=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(live[1].includes(U1_TEXT),'the detail confirms the actual persisted content after settlement');
  assert.deepEqual(await readUsage(acct.token),usage0,'typed refusals and retries consume no allowance');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the refusal journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'no celebration from the refusal journey');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'no acknowledgement from the refusal journey');
  await fs.writeFile(new URL('u1-settled-receipt.json',out),JSON.stringify({stableId:ack.id,finalEtag:rbF.etag,refusalLabels:events.map(e=>e.label),browserResponses:respSeen},null,2));
  checkClean(rec,'u1');
  await shot(p,'shot-1440-u1-final.png');
 }catch(e){await captureFailure(p,'u1');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-u1-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-l1-append ──
// L1 first lifecycle vertical (resume contract §2, lifecycle-plan §Journey L1):
// a REAL original-owner review PATCH is held in flight (captured at the
// browser route BEFORE reaching upstream; request id/If-Match/body validated
// and the store proven NOT yet landed) and the session then switches account,
// logs out, or restores the SAME UID. Releases are REAL upstream outcomes:
// a genuine 200 (held request dispatched at release) and a genuine 412
// produced by a REAL competing Node-side writer during the hold — no
// controlled status substitution is needed or used in this journey.
// Proved per phase: zero late presentation of the original owner's text or
// error state, no editor/detail/uncertain revival, no duplicate or automatic
// requests, the committed original-owner write is NOT undone (direct HTTP
// store truth), while a FRESH authorised re-entry read legitimately shows the
// now-current content — distinct from stale receipt application. Same-UID
// restoration mints a new session generation and a new view/selection/surface
// identity: identity equality by UID alone is explicitly refused.
const L1_HOLD='Held PATCH marker 3v6 must never present under another account';
const L1_RIVAL='Rival newer text 8n2 written during the held logout phase';
const L1_A2='Second held edit 5w4 lost at logout';
const L1_A3='Same-UID restore edit 9j7 committed silently';

test('review edit: l1 a held real original-owner review PATCH released after account switch, logout or same-UID restoration applies nothing to a replaced surface: zero late private presentation, zero duplicate requests, the real upstream outcome proven by direct HTTP (200 landed, genuine 412 overwritten nothing), and only a fresh authorised read shows the stored content',async()=>{
 const a=await account();
 const b=await account();
 await commitTitled(b.token,'B-owned lifecycle mock');
 const ack=await commitDetailed(a.token);
 const pre=await readItem(ack.id,a.token);
 const usage0=await readUsage(a.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 p.removeAllListeners('dialog');
 const dialogs=[];
 p.on('dialog',async d=>{dialogs.push({type:d.type()});await d.accept();});
 await connectHistoryHarness(p,a);
 await goHistory(p);
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 // Hold the review PATCH BEFORE it reaches upstream: the route handler keeps
 // the request in flight; release dispatches the REAL request and delivers
 // the REAL response unchanged (status/body/ETag preserved).
 const holds=[];let holdMode='off';
 await p.route(base+'/api/mocks/reviews?*',async route=>{
  if(holdMode==='hold'){holdMode='off';const req=route.request();holds.push({route,url:req.url(),ifMatch:req.headers()['if-match'],body:req.postData()});return;}
  await route.continue();
 });
 const waitHeld=async(n,ms=15000)=>{const t0=Date.now();while(holds.length<n){if(Date.now()-t0>ms)harness(`held PATCH ${n} never reached the browser route (have ${holds.length})`);await new Promise(r=>setTimeout(r,50));}};
 const releaseHeld=async i=>{const h=holds[i];const resp=await h.route.fetch();const text=await resp.text();h.upstreamStatus=resp.status();h.upstreamEtag=resp.headers()['etag']??null;h.upstreamBody=text;await h.route.fulfill({response:resp,body:text});return h;};
 const bodyText=async()=>p.evaluate(()=>document.body.innerText);
 const assertNoPrivate=async(where,...markers)=>{
  const t=await bodyText();
  for(const m of markers)assert.ok(!t.includes(m),'no text from the '+where+' journey may surface: '+JSON.stringify(m));
  for(const sel of ['edit-uncertain','edit-conflict','edit-error','edit-save','edit-retry-uncertain','detail-error'])assert.equal(await p.locator(`[data-account-history="${sel}"]`).count(),0,'no '+sel+' control may appear after the '+where+' invalidation');
 };
 const openEditor=async marker=>{
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await keyboardEdit(p,'QR','2','free',marker);
  holdMode='hold';
  await p.locator('[data-account-history="edit-save"]').click();
 };
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  // ── Phase 1: switch A→B while held, release with a REAL 200.
  await openEditor(L1_HOLD);
  await waitHeld(1);
  // Anti-vacuity: the held ORIGINAL request existed with exact owner facts
  // BEFORE the lifecycle action, and the store proves it had NOT landed.
  assert.ok(holds[0].url.includes('/api/mocks/reviews?id='+encodeURIComponent(ack.id)),'the held request targets the literal owned record id: '+holds[0].url);
  assert.equal(holds[0].ifMatch,pre.etag,'the held request carries the exact captured If-Match version');
  assert.ok(holds[0].body.includes(L1_HOLD),'the held request body carries the distinct typed marker');
  const storeHeld1=await readItem(ack.id,a.token);
  assert.ok(!JSON.stringify(storeHeld1.mock.reviews).includes(L1_HOLD),'direct HTTP proves the held PATCH had NOT reached the store before release');
  assert.equal(storeHeld1.etag,pre.etag,'the version was untouched while held');
  await shot(p,'shot-1440-l1-phase1-held.png');
  await histSwitch(p,b);
  await waitHistRows(p,1);
  assert.equal((await histRowTitles(p))[0],'B-owned lifecycle mock','account B shows ONLY its own state after the switch');
  const foreign=await fetch(base+'/api/mocks/item?id='+encodeURIComponent(ack.id),{headers:{authorization:'Bearer '+b.token},credentials:'omit',cache:'no-store'});
  assert.equal(foreign.status,404,'A-owned record stays 404 under account B (owner isolation, not a blank page)');
  await assertNoPrivate('A→B switch',L1_HOLD,L1_RIVAL,L1_A2,L1_A3,DETAIL_NOTE);
  const patchesBeforeRelease1=patchCount(rec);const apiBeforeRelease1=rec.api.length;
  const rel1=await releaseHeld(0);
  await settle(800);
  assert.equal(rel1.upstreamStatus,200,'the released request genuinely committed upstream with a real 200');
  await assertNoPrivate('released late success',L1_HOLD,L1_RIVAL,L1_A2,L1_A3,DETAIL_NOTE);
  assert.equal((await histRowTitles(p))[0],'B-owned lifecycle mock','the late success cannot replace the current list view of B');
  assert.equal(patchCount(rec),1,'the held original-owner PATCH is the only browser PATCH; no duplicate or retry was sent');
  assert.equal(rec.api.length,apiBeforeRelease1,'the release caused zero additional browser requests beyond completing the held one');
  const truth1=await readItem(ack.id,a.token);
  const expected1=structuredClone(pre.mock);expected1.reviews[1].free=L1_HOLD;
  assert.deepEqual(truth1.mock,expected1,'the released original-owner write landed exactly once with immutables verbatim');
  assert.deepEqual(await readUsage(a.token),usage0,'held lifecycle PATCH traffic consumes no allowance');
  await shot(p,'shot-1440-l1-phase1-b-view.png');
  // ── Phase 2: switch back to A, hold a second PATCH, a REAL competing
  // writer advances the version, logout, then release a GENUINE 412.
  await histSwitch(p,a);
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  const pre2=await readItem(ack.id,a.token);
  assert.equal(pre2.etag,rel1.upstreamEtag,'the reopened detail re-seeded from the actual committed version');
  await openEditor(L1_A2);
  await waitHeld(2);
  assert.equal(holds[1].ifMatch,pre2.etag,'the second held request carries the exact current version');
  const wr=structuredClone(pre2.mock.reviews);wr[0].thinking=L1_RIVAL;
  const cr=await fetch(base+'/api/mocks/reviews?id='+encodeURIComponent(ack.id),{method:'PATCH',headers:{'content-type':'application/json',authorization:'Bearer '+a.token,'if-match':pre2.etag},body:JSON.stringify({reviews:wr}),credentials:'omit',cache:'no-store'});
  assert.equal(cr.status,200,'the competing Node-side writer genuinely advanced the version: '+cr.status);
  const rivalEtag=cr.headers.get('etag');
  await histLogout(p);
  for(let i=0;i<20;i++){const t=await p.evaluate(()=>document.getElementById('account-history-slot')?.textContent??'');assert.equal(t,'','logout must clear the private display immediately');await settle(25);}
  await assertNoPrivate('logout',L1_HOLD,L1_A2,L1_RIVAL,DETAIL_NOTE);
  const rel2=await releaseHeld(1);
  await settle(800);
  assert.equal(rel2.upstreamStatus,412,'the held second PATCH really met the genuine competing 412 at release');
  await assertNoPrivate('released genuine 412',L1_HOLD,L1_A2,L1_RIVAL,DETAIL_NOTE);
  const afterErr=await p.evaluate(()=>document.getElementById('account-history-slot')?.textContent??'');
  assert.equal(afterErr,'','a signed-out surface renders nothing from the late failure');
  assert.equal(patchCount(rec),2,'the 412 triggered no automatic resend or retry');
  const truth2=await readItem(ack.id,a.token);
  assert.equal(truth2.etag,rivalEtag,'the rejected held PATCH overwrote nothing: the rival version stays current');
  assert.ok(!JSON.stringify(truth2.mock.reviews).includes(L1_A2),'the lost phase-2 typing never reached the store');
  // ── Phase 3: same-UID restoration around a held PATCH, release REAL 200:
  // restoration is a NEW session generation, view and selection — identity
  // equality by UID alone must not revive the obsolete receipt.
  await histRestore(p,a);
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  const pre3=await readItem(ack.id,a.token);
  assert.equal(pre3.etag,rivalEtag,'the fresh authorised read shows the actual rival content (restored state, not a stale receipt)');
  const tRestored=await bodyText();
  assert.ok(tRestored.includes(L1_RIVAL)&&!tRestored.includes(L1_A2),'the restored detail legitimately presents the stored truth');
  await openEditor(L1_A3);
  await waitHeld(3);
  assert.equal(holds[2].ifMatch,pre3.etag,'the third held request carries the restored exact version');
  const preLogoutApi=rec.api.length;
  await histLogout(p);
  const midText=await p.evaluate(()=>document.getElementById('account-history-slot')?.textContent??'');
  assert.equal(midText,'','logout clears immediately before restoration');
  await histRestore(p,a);
  await waitHistRows(p,1);
  await assertNoPrivate('same-UID restoration (before release)',L1_A3,DETAIL_NOTE);
  assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'restoration shows the fresh list, not a revived editor/detail surface');
  const rel3=await releaseHeld(2);
  await settle(800);
  assert.equal(rel3.upstreamStatus,200,'the released third PATCH genuinely committed upstream');
  await assertNoPrivate('released same-UID late success',L1_A3,DETAIL_NOTE);
  assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'the late receipt never auto-navigates or revives a detail');
  assert.equal(patchCount(rec),3,'the same-UID release sent no duplicate PATCH');
  assert.equal(rec.api.length,preLogoutApi+2,'only the restoration session-verification GET and fresh list GET ran after the hold; the release itself added zero new browser requests');
  const truth3=await readItem(ack.id,a.token);
  assert.ok(JSON.stringify(truth3.mock.reviews).includes(L1_A3),'direct HTTP proves the original-owner commit landed without any presentation');
  assert.notEqual(truth3.etag,rivalEtag,'the committed release advanced the version exactly once');
  // Fresh authorised re-entry read: the student now legitimately sees the
  // stored content — SAME-UID truth presentation, explicitly distinct from
  // the suppressed stale receipt application asserted above.
  await openRowById(p,ack.id);
  await waitDetail(p);
  const fresh=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(fresh.some(t=>t.includes(L1_A3)),'a fresh explicit getMock read shows the actually stored same-UID content: '+JSON.stringify(fresh));
  assert.deepEqual(await readUsage(a.token),usage0,'the whole lifecycle journey consumed no allowance');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the lifecycle journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
  assert.deepEqual(dialogs,[],'no native dialog belongs to this journey');
  assert.equal(await p.locator('.mock-confetti').count(),0,'no celebration from held lifecycle traffic');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'no acknowledgement from held lifecycle traffic');
  await fs.writeFile(new URL('l1-held-release-receipt.json',out),JSON.stringify({stableId:ack.id,phases:holds.map(h=>({url:h.url,ifMatch:h.ifMatch,upstreamStatus:h.upstreamStatus,upstreamEtag:h.upstreamEtag})),rivalEtag,finalStoreEtag:(await readItem(ack.id,a.token)).etag},null,2));
  checkClean(rec,'l1');
  await shot(p,'shot-1440-l1-final-fresh-read.png');
 }catch(e){await captureFailure(p,'l1');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-l1-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-l2-append ──
// l2: detached-review-control privacy census on REAL retained controls.
// All four control kinds (Save, Cancel, Retry, Reload) are captured from a
// genuinely mounted, non-empty owned editor — Save/Cancel from the plain
// editor, Retry/Reload from a REAL committed-PATCH uncertainty state whose
// upstream 200 and independent store readback are verified BEFORE the
// labelled controlled-503 acknowledgement replacement (browser-layer
// fixture, never a backend-outage claim). Invalidation transitions: A→B
// switch, logout + same-UID restoration, and an explicit controller detach
// while the owner's PATCH is in flight. The REAL updateReviews promise
// settlement is observed TRANSPARENTLY at test-controller construction: the
// frozen mock client is wrapped (never mutated) when createAccountHistory is
// built, each call's arguments, receiver identity, settle outcome and typed
// error code are recorded, and the ORIGINAL promise is returned unchanged so
// the production ownership guards stay byte-for-byte in force. Absence and
// zero-request assertions are made only AFTER awaiting the actual obsolete
// invocation settlement — timer/phase-not-pending alone proves nothing.
// Repeated dispatch of every retained detached control must add zero
// browser API requests, zero client invocations, zero review PATCH/GET,
// zero replacement-surface mutation and zero private marker leakage.
const L2_HELD='L2 held detached owner marker 8p5 never presented late';
const L2_UNCERT='L2 uncertain commit marker 2s6 landed but ack lost';
const L2_DET='L2 detach commit marker 7v9 landed but detached';
async function l2Connect(p,acct){
 return p.evaluate(async({uid,token})=>{
  const sessionMod=await import('/backend/account-session.mjs');
  const clientMod=await import('/backend/mock-client.mjs');
  const app=await import('/app.js');
  const verifySession=async t=>{const r=await fetch('/api/session',{headers:{authorization:'Bearer '+t},credentials:'omit',cache:'no-store'});if(!r.ok)throw new Error('session verification failed: '+r.status);const b=await r.json();return {uid:b.uid};};
  const h={obs:[],events:[]};
  h.session=sessionMod.createAccountSession({verifySession,onChange:s=>{h.events.push(s.status+(s.uid?':'+s.uid:''));if(h.controller)h.controller.handleSessionChange(s);}});
  // The accepted client is frozen product code: it is WRAPPED transparently
  // at this TEST controller construction only — nothing is assigned over
  // its methods and no production response byte changes.
  const realClient=clientMod.createMockClient({session:h.session});
  const wrapped=Object.create(realClient);
  wrapped.updateReviews=function(...args){
   const entry={n:h.obs.length+1,id:args[0],version:args[1],reviewCount:Array.isArray(args[2])?args[2].length:-1,receiverIsWrapped:this===wrapped,settled:'pending',errorCode:null,replyHasApply:false,replyFrozen:false};
   h.obs.push(entry);
   const pr=Reflect.apply(realClient.updateReviews,realClient,args);
   pr.then(r=>{entry.settled='resolved';try{entry.replyHasApply=typeof r.apply==='function';entry.replyFrozen=Object.isFrozen(r);}catch{}},e=>{entry.settled='rejected';entry.errorCode=e&&typeof e.code==='string'?e.code:String(e&&e.code);});
   return pr; // ORIGINAL promise returned unchanged — full transparency
  };
  h.client=wrapped;
  h.moduleAvailable=false;
  try{h.historyMod=await import('/account-history.js');h.moduleAvailable=true;}catch{}
  if(!h.moduleAvailable)throw new Error('l2: account-history module unavailable');
  h.controller=h.historyMod.createAccountHistory({session:h.session,client:wrapped});
  h.accounts={};h.accounts[uid]=token;
  h.detach=app.attachAccountHistory(h.controller);
  await h.session.setAccount({uid,getIdToken:async()=>h.accounts[uid]});
  window.__uicHistoryHarness=h;
  return {connected:true,moduleAvailable:true,attachAvailable:true,status:h.session.getState().status,signedInUid:h.session.getState().uid};
 },{uid:acct.uid,token:acct.token});
}
test('review edit: l2 every actually retained review control (Save, Cancel, and the uncertainty Retry/Reload) captured from a real nonempty owned editor and a real committed-PATCH uncertainty state whose store truth was verified before the labelled ack replacement stays completely inert across account switch, logout plus same-UID restoration and controller detach: the REAL updateReviews promise settlement is transparently observed at the test controller via a wrapping of the frozen client with exact argument and receiver forwarding, absence is asserted only after the actual obsolete invocation settled, and repeated detached dispatch sends zero browser requests, zero client invocations, mutates no replacement surface, leaks no private marker and revives no draft ownership',async()=>{
 const a=await account();
 const b=await account();
 await commitTitled(b.token,'B-owned L2 mock 2090/2700');
 const ack=await commitDetailed(a.token,{title:'A-owned L2 lifecycle mock'});
 const pre=await readItem(ack.id,a.token);
 const usage0=await readUsage(a.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 p.removeAllListeners('dialog');
 const dialogs=[];
 p.on('dialog',async d=>{dialogs.push({type:d.type()});await d.accept();});
 const connected=await l2Connect(p,a);
 assert.ok(connected.connected&&connected.signedInUid===a.uid,'the l2 wrapped-client controller must be connected under owner A');
 await goHistory(p);
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 let patchMode='off';const holds=[];const injects=[];
 await p.route(base+'/api/mocks/reviews?*',async route=>{
  const req=route.request();
  if(patchMode==='hold'){patchMode='off';holds.push({route,url:req.url(),ifMatch:req.headers()['if-match'],body:req.postData()});return;}
  if(patchMode==='inject'){
   patchMode='off';
   const resp=await route.fetch();
   const text=await resp.text();
   const ev={label:'controlled-503-fault-injection-after-real-commit (browser-layer fixture, NOT a backend outage)',ifMatch:req.headers()['if-match'],postData:req.postData(),upstreamStatus:resp.status(),upstreamEtag:resp.headers()['etag']};
   if(resp.status()===200){const sb=await readItem(ack.id,a.token);ev.storeReadbackBeforeReplacement={etag:sb.etag,storeContainsSubmittedMarker:JSON.stringify(sb.mock.reviews).includes(L2_UNCERT)};}
   injects.push(ev);
   if(resp.status()!==200){await route.fulfill({status:resp.status(),headers:{'content-type':'application/json; charset=utf-8','etag':resp.headers()['etag']??''},body:text});return;}
   await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})});
   return;
  }
  await route.continue();
 });
 const waitHeld=async(n,ms=15000)=>{const t0=Date.now();while(holds.length<n){if(Date.now()-t0>ms)harness(`held PATCH ${n} never reached the browser route (have ${holds.length})`);await new Promise(r=>setTimeout(r,50));}};
 const releaseHeld=async i=>{const h=holds[i];const resp=await h.route.fetch();const text=await resp.text();h.upstreamStatus=resp.status();h.upstreamEtag=resp.headers()['etag']??null;h.upstreamBody=text;await h.route.fulfill({response:resp,body:text});return h;};
 const bodyText=async()=>p.evaluate(()=>document.body.innerText);
 const obs=async()=>p.evaluate(()=>window.__uicHistoryHarness.obs.map(e=>({...e})));
 const awaitSettled=async(n,ms=15000)=>{const t0=Date.now();while(true){const e=await p.evaluate(k=>({...window.__uicHistoryHarness.obs[k]}),n-1);if(e&&e.settled!=='pending')return e;if(Date.now()-t0>ms)harness(`the REAL updateReviews invocation ${n} never settled (timer-only proof is not accepted)`);await settle(50);}};
 const detGet=async key=>p.evaluate(k=>!!window.__l2Detached&&!!window.__l2Detached[k],key);
 // LABELLED TEST BOUNDARY: detached Save/Cancel may be disabled at capture
 // (pending/uncertain), and click() on a disabled button never reaches the
 // handler — that would be a vacuous dispatch. Clearing disabled FIRST forces
 // every retained handler to genuinely ENTER and be rejected by the real
 // ownership guards; zero-request/zero-invocation census then proves it.
 const clickDetached=async(names)=>p.evaluate(list=>{for(let round=0;round<2;round++)for(const n of list){const el=window.__l2Detached[n];if(el){el.disabled=false;el.click();}}},names);
 const census=async()=>{const o=await obs();return{api:rec.api.length,patch:patchCount(rec),itemGets:rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length,clientCalls:o.length};};
 const assertNoLate=async(where,...markers)=>{
  const t=await bodyText();
  for(const m of markers)assert.ok(!t.includes(m),'no text from the '+where+' journey may surface late: '+JSON.stringify(m));
  for(const sel of ['edit-uncertain','edit-conflict','edit-error','edit-save','edit-cancel','edit-retry-uncertain','edit-reload','detail','detail-error'])assert.equal(await p.locator(`[data-account-history="${sel}"]`).count(),0,'no '+sel+' surface may appear after the '+where+' invalidation');
 };
 const ledgerExercised=[];const ledgerUntested=[];
try{
 await waitHistRows(p,1);
 await openRowById(p,ack.id);
 await waitDetail(p);
 // ── Phase 1: real nonempty owned editor; retain the ACTUAL Save/Cancel
 // nodes; dispatch a genuine PATCH and hold it in flight.
 await p.locator('[data-account-history="edit-reviews"]').click();
 await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
 assert.equal(await editField(p,'VR','1','thinking').inputValue(),DETAIL_THINKING,'the owned editor is seeded from the actual saved getMock receipt (nonempty)');
 assert.equal(await editField(p,'QR','2','free').inputValue(),DETAIL_FREE,'the owned editor prefills the actual saved reflection (nonempty)');
 await p.evaluate(()=>{window.__l2Detached={save:document.querySelector('[data-account-history="edit-save"]'),cancel:document.querySelector('[data-account-history="edit-cancel"]')};});
 assert.ok(await detGet('save')&&await detGet('cancel'),'the harness retained the ACTUAL mounted Save/Cancel nodes (no fabricated controls)');
 await keyboardEdit(p,'QR','2','free',L2_HELD);
 patchMode='hold';
 await p.locator('[data-account-history="edit-save"]').click();
 await waitHeld(1);
 // Prove real request/owner/version/marker BEFORE the lifecycle change.
 const o1=(await obs())[0];
 assert.ok(holds[0].url.includes('/api/mocks/reviews?id='+encodeURIComponent(ack.id)),'the held request targets the literal owned record id: '+holds[0].url);
 assert.equal(holds[0].ifMatch,pre.etag,'the held request carries the exact captured If-Match version');
 assert.ok(holds[0].body.includes(L2_HELD),'the held request body carries the distinct typed marker');
 assert.equal(o1.id,ack.id,'the transparent client wrapper saw the exact literal id argument');
 assert.equal(o1.version,pre.etag,'the wrapper saw the exact captured version argument');
 assert.equal(o1.receiverIsWrapped,true,'the real client method was invoked through the transparent test wrapper');
 assert.equal(o1.settled,'pending','the real invocation was genuinely in flight before the lifecycle change');
 const storeHeld=await readItem(ack.id,a.token);
 assert.ok(!JSON.stringify(storeHeld.mock.reviews).includes(L2_HELD),'direct HTTP proves the held PATCH had NOT landed before release');
 await shot(p,'shot-1440-l2-phase1-held.png');
 // A→B switch invalidates; release LAST so the real 200 lands upstream.
 await histSwitch(p,b);
 await waitHistRows(p,1);
 assert.equal((await histRowTitles(p))[0],'B-owned L2 mock 2090/2700','account B shows ONLY its own state after the switch');
 const rel1=await releaseHeld(0);
 assert.equal(rel1.upstreamStatus,200,'the released request genuinely committed upstream with a real 200');
 const s1=await awaitSettled(1); // ACTUAL obsolete invocation settlement — awaited, not timed
 assert.equal(s1.settled,'rejected','under the replaced owner the real client call settled REJECTED with the genuine stale-account guard: '+JSON.stringify(s1));
 assert.equal(s1.errorCode,'stale_account','the settlement carried the real typed stale_account error through the untouched guard chain');
 await settle(300);
 await assertNoLate('A→B switch + settled late result',L2_HELD,DETAIL_NOTE);
 const c1=await census();
 await clickDetached(['save','cancel']); // repeated dispatch, two rounds each
 await settle(400);
 const c1b=await census();
 assert.equal(c1b.clientCalls,c1.clientCalls,'repeated detached Save/Cancel after the switch added ZERO client invocations');
 assert.equal(c1b.api,c1.api,'repeated detached Save/Cancel added zero browser API requests');
 assert.equal(c1b.patch,c1.patch,'no detached dispatch may add a PATCH');
 assert.equal((await histRowTitles(p))[0],'B-owned L2 mock 2090/2700','the replacement B surface is byte-stable across the detached dispatch');
 assert.ok(!(await bodyText()).includes(L2_HELD),'no private marker leaked into the replacement surface');
 ledgerExercised.push({transition:'A→B switch',controls:['Save (detached x2)','Cancel (detached x2)'],settlement:'real client-level rejection settled BEFORE absence assertions'});
 ledgerUntested.push({transition:'A→B switch',controls:['Retry','Reload'],reason:'plain (non-uncertain) editor: Retry/Reload are not mounted on this surface — not fabricated'});
 await shot(p,'shot-1440-l2-phase1-b-stable.png');
 // ── Phase 2: REAL committed PATCH with a verified store readback before
 // the labelled ack replacement; retain Save, Cancel, Retry AND Reload from
 // the genuine uncertainty editor; invalidate via logout + same-UID restore.
 await histSwitch(p,a);
 await waitHistRows(p,1);
 await openRowById(p,ack.id);
 await waitDetail(p);
 const pre2=await readItem(ack.id,a.token);
 assert.ok(JSON.stringify(pre2.mock.reviews).includes(L2_HELD)&&pre2.etag===rel1.upstreamEtag,'fresh re-entry under A legitimately shows the settled truth (distinct from stale receipt application)');
 await p.locator('[data-account-history="edit-reviews"]').click();
 await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
 await keyboardEdit(p,'VR','1','thinking',L2_UNCERT);
 patchMode='inject';
 await p.locator('[data-account-history="edit-save"]').click();
 {const t0=Date.now();while(!injects.length){if(Date.now()-t0>15000)harness('the injected PATCH never reached the browser route');await new Promise(r=>setTimeout(r,50));}}
 assert.equal(injects[0].upstreamStatus,200,'the uncertainty attempt genuinely committed on the real backend first');
 assert.equal(injects[0].storeReadbackBeforeReplacement.storeContainsSubmittedMarker,true,'independent store readback verified the commit BEFORE the labelled replacement');
 assert.equal(injects[0].storeReadbackBeforeReplacement.etag,injects[0].upstreamEtag,'the readback version equals the real acknowledgement version');
 await p.waitForSelector('[data-account-history="edit-uncertain"]',{timeout:15000});
 const s2=await awaitSettled(2); // the rejected 503 settlement really happened
 assert.equal(s2.settled,'rejected','the real second updateReviews promise settled rejected under the controlled 503');
 assert.equal(s2.errorCode,'storage_unavailable','the typed error code came from the real client error path');
 // Retry/Reload only mount in the uncertainty editor: capture them NOW.
 assert.ok(await p.evaluate(()=>{window.__l2Detached.save=document.querySelector('[data-account-history="edit-save"]');window.__l2Detached.cancel=document.querySelector('[data-account-history="edit-cancel"]');window.__l2Detached.retry=document.querySelector('[data-account-history="edit-retry-uncertain"]');window.__l2Detached.reload=document.querySelector('[data-account-history="edit-reload"]');return !!(window.__l2Detached.save&&window.__l2Detached.cancel&&window.__l2Detached.retry&&window.__l2Detached.reload);}),'ALL FOUR real control kinds are mounted together in the uncertainty editor and retained');
 await shot(p,'shot-1440-l2-phase2-uncertain.png');
 await histLogout(p);
 for(let i=0;i<20;i++){assert.equal(await slotText(p),'','logout must clear the private display immediately');await settle(25);}
 await histRestore(p,a);
 await waitHistRows(p,1);
 await assertNoLate('same-UID restoration',L2_UNCERT,L2_HELD,DETAIL_NOTE);
 assert.equal(await p.locator('[data-account-history="detail"]').count(),0,'restoration shows the fresh list, never a revived editor/detail');
 const c2=await census();
 await clickDetached(['save','cancel','retry','reload']); // every retained kind, twice
 await settle(400);
 const c2b=await census();
 assert.equal(c2b.clientCalls,c2.clientCalls,'repeated dispatch of every retained detached control after logout + same-UID restoration added ZERO client invocations');
 assert.equal(c2b.api,c2.api,'detached dispatch after restoration added zero browser API requests');
 assert.equal(c2b.patch,c2.patch,'no detached Retry/Save may re-send a PATCH after invalidation');
 assert.ok(!(await bodyText()).includes(L2_UNCERT),'no uncertain draft marker leaked after same-UID re-entry');
 ledgerExercised.push({transition:'logout + same-UID restoration',controls:['Save (detached x2)','Cancel (detached x2)','Retry (detached x2)','Reload (detached x2)'],settlement:'real rejected-503 settlement observed BEFORE invalidation and absence'});
 // Fresh authorised re-entry must build a NEW editor, never reown the old draft.
 await openRowById(p,ack.id);
 await waitDetail(p);
 await p.locator('[data-account-history="edit-reviews"]').click();
 await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
 assert.equal(await p.evaluate(()=>document.querySelector('[data-account-history="edit-save"]')===window.__l2Detached.save),false,'the reopened editor Save is a NEW node; the retained detached one is not restored to ownership');
 assert.equal(await editField(p,'VR','1','thinking').inputValue(),L2_UNCERT,'the re-entry editor re-seeds from the ACTUAL stored receipt');
 await p.locator('[data-account-history="edit-cancel"]').click();
 await waitDetail(p);
 // ── Phase 3: explicit controller DETACH while the owner PATCH is in flight.
 const pre3=await readItem(ack.id,a.token);
 await p.locator('[data-account-history="edit-reviews"]').click();
 await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
 await keyboardEdit(p,'QR','2','free',L2_DET);
 await p.evaluate(()=>{window.__l2Detached={save:document.querySelector('[data-account-history="edit-save"]'),cancel:document.querySelector('[data-account-history="edit-cancel"]')};});
 patchMode='hold';
 await p.locator('[data-account-history="edit-save"]').click();
 await waitHeld(2);
 assert.equal(holds[1].ifMatch,pre3.etag,'the detach-phase held request carries the exact current version');
 assert.equal((await obs())[2].settled,'pending','the third real invocation is genuinely in flight');
 await p.evaluate(()=>{window.__uicHistoryHarness.detach();});
 assert.equal(await slotText(p),'','detach clears the owned slot immediately');
 const rel3=await releaseHeld(1);
 assert.equal(rel3.upstreamStatus,200,'the released owner PATCH genuinely committed upstream');
 const s3=await awaitSettled(3); // await the ACTUAL settlement before absence claims
 assert.equal(s3.settled,'resolved','the detached-generation invocation itself settled resolved with the real reply: '+JSON.stringify(s3));
 assert.equal(s3.replyHasApply,true,'the settled value is the real frozen intent reply carrying apply()');
 await settle(300);
 assert.equal(await slotText(p),'','a settled late receipt on a detached controller presents NOTHING');
 const c3=await census();
 await clickDetached(['save','cancel']);
 await settle(400);
 const c3b=await census();
 assert.equal(c3b.clientCalls,c3.clientCalls,'repeated detached Save/Cancel after the settled detach added ZERO client invocations');
 assert.equal(c3b.api,c3.api,'detached dispatch after detach added zero browser API requests');
 assert.equal(c3b.patch,c3.patch,'no detached dispatch may add a PATCH after detach');
 ledgerExercised.push({transition:'controller detach with in-flight PATCH',controls:['Save (detached x2)','Cancel (detached x2)'],settlement:'real resolved settlement awaited BEFORE absence/detached-dispatch assertions'});
 ledgerUntested.push({transition:'controller detach',controls:['Retry','Reload'],reason:'uncertainty was not held again across detach — labelled untested, not claimed'});
 const truth3=await readItem(ack.id,a.token);
 assert.ok(JSON.stringify(truth3.mock.reviews).includes(L2_DET),'direct HTTP: suppression is not rollback — the original-owner commit landed');
 assert.notEqual(truth3.etag,pre3.etag,'the committed release advanced the version exactly once');
 assert.equal(patchCount(rec),3,'exactly three PATCHes for the whole journey: no duplicate from any detached dispatch');
 // Re-mount under a fresh generation: the ONLY way to see the truth.
 await p.evaluate(()=>{window.__uicHistoryHarness.controller.mount(document.getElementById('account-history-slot'));});
 await waitHistRows(p,1);
 await openRowById(p,ack.id);
 await waitDetail(p);
 const fresh=await p.locator('[data-account-history="detail-review"]').allTextContents();
 assert.ok(fresh.some(t=>t.includes(L2_DET)),'a fresh authorised read after remount shows the actually stored content');
 assert.deepEqual(await readUsage(a.token),usage0,'the whole lifecycle census consumed no allowance');
 assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'detached-control census adds zero browser-local storage writes');
 assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
 assert.deepEqual(dialogs,[],'no native dialog belongs to this journey');
 assert.equal(await p.locator('.mock-confetti').count(),0,'no celebration from detached-control traffic');
 assert.equal(await p.locator('#mock-acknowledgement').count(),0,'no acknowledgement from detached-control traffic');
 const obsFinal=await obs();
 await fs.writeFile(new URL('l2-settlement-observer-receipt.json',out),JSON.stringify({stableId:ack.id,observations:obsFinal,holds:holds.map(h=>({url:h.url,ifMatch:h.ifMatch,upstreamStatus:h.upstreamStatus,upstreamEtag:h.upstreamEtag})),injects},null,2));
 await fs.writeFile(new URL('l2-detached-control-ledger.json',out),JSON.stringify({stableId:ack.id,exercised:ledgerExercised,untested:ledgerUntested,controlKindsCovered:['Save','Cancel','Retry','Reload'],transitionsCovered:['A→B switch','logout + same-UID restoration','controller detach'],uncertainStateExercised:true,sameUidInvalidationExercised:true,finalEtag:truth3.etag},null,2));
 checkClean(rec,'l2');
 await shot(p,'shot-1440-l2-final-fresh-read.png');
}catch(e){await captureFailure(p,'l2');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-l2-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-l3-append ──
// l3: same literal record ID under fictional accounts A and B with distinct
// ACTUAL saved review content and distinct server-owned versions. Both
// editors must seed from their OWN real getMock receipt (never the other
// account's snapshot at the shared id). Unsubmitted A typing never appears
// in B and vice versa — including late held owner-A work whose real PATCH is
// released only after the surface was replaced by B — settlement observed
// through the accepted l2Connect wrapper, awaited BEFORE late-DOM
// assertions — and a subsequent fresh authorised re-entry. Per-owner store isolation and etags are verified over
// direct HTTP, drafts are tab-memory-only (zero storage writes, byte-stable
// durable blob), immutable score metadata per owner, cumulative usage
// unchanged. The accepted same-ID detail fixture pattern (d4: commitDetailed
// with an explicit shared id plus qReview bodies) is reused; existing
// correct behaviour is labelled coverage, not a manufactured RED. Exercised
// transitions are labelled exactly; logout/detach for same-ID drafts is not
// claimed here (covered for controls under l2).
const L3_NOTE_A='A-owned same-ID note 6t1 never crosses to B';
const L3_THINK_A='A-owned same-ID thinking 2m8 never crosses to B';
const L3_FREE_A='A-owned same-ID reflection 5r3 baseline';
const L3_NOTE_B='B-owned same-ID note 9w4 never crosses to A';
const L3_INSTEAD_B='B-owned same-ID instead 3k6 baseline';
const L3_A_UNSUB='A unsubmitted draft 4h8 must never appear under B';
const L3_B_UNSUB='B unsubmitted draft 1y5 must never appear under A';
const L3_A_SENT='A late held commit 6d3 lands under A only';
test('review edit: l3 the same literal record id under fictional accounts A and B keeps independent actual saved reviews, per-owner getMock editor seeding and distinct etags: unsubmitted A typing never appears in B or vice versa, a held owner-A PATCH released under replaced account B lands only in the A-owned store with zero late presentation or duplicate traffic under B, and only a fresh authorised per-owner re-entry reads each account actual stored content',async()=>{
 const a=await account();
 const b=await account();
 const sharedId=randomUUID();
 await commitDetailed(a.token,{id:sharedId,title:'A-owned same-ID L3 mock',note:L3_NOTE_A,reviews:[qReview('VR',1,{thinking:L3_THINK_A}),qReview('QR',2,{free:L3_FREE_A,format:'free',reviewed:true,confirmed:true})]});
 await commitDetailed(b.token,{id:sharedId,title:'B-owned same-ID L3 mock',note:L3_NOTE_B,reviews:[{...qReview('DM',3),instead:L3_INSTEAD_B}]});
 const preA=await readItem(sharedId,a.token);
 const preB=await readItem(sharedId,b.token);
 assert.equal(preA.mock.id,sharedId,'A owns the literal shared id');
 assert.equal(preB.mock.id,sharedId,'B owns the SAME literal shared id');
 assert.notEqual(JSON.stringify(preA.mock.reviews),JSON.stringify(preB.mock.reviews),'the same literal id carries distinct actual review content per owner');
 assert.notEqual(preA.mock.note,L3_NOTE_B,'distinct notes per owner at the shared id');
 const usageA0=await readUsage(a.token);
 const usageB0=await readUsage(b.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 p.removeAllListeners('dialog');
 const dialogs=[];
 p.on('dialog',async d=>{dialogs.push({type:d.type()});await d.accept();});
 const connected=await l2Connect(p,a);
 assert.ok(connected.connected&&connected.signedInUid===a.uid,'the l3 wrapped-client controller must be connected under owner A at the shared literal id');
 await goHistory(p);
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 let patchMode='off';const holds=[];
 await p.route(base+'/api/mocks/reviews?*',async route=>{
  const req=route.request();
  if(patchMode==='hold'){patchMode='off';const h0={route,url:req.url(),ifMatch:req.headers()['if-match'],body:req.postData()};holds.push(h0);return;}
  await route.continue();
 });
 const releaseHeld=async i=>{const h=holds[i];const resp=await h.route.fetch();const text=await resp.text();h.upstreamStatus=resp.status();h.upstreamEtag=resp.headers()['etag']??null;await h.route.fulfill({response:resp,body:text});return h;};
 const bodyText=async()=>p.evaluate(()=>document.body.innerText);
 const itemGetCount=()=>rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length;
 const obs=async()=>p.evaluate(()=>window.__uicHistoryHarness.obs.map(e=>({...e})));
 const awaitSettled=async(n,ms=15000)=>{const t0=Date.now();while(true){const e=await p.evaluate(k=>({...window.__uicHistoryHarness.obs[k]}),n-1);if(e&&e.settled!=='pending')return e;if(Date.now()-t0>ms)harness(`the REAL updateReviews invocation ${n} never settled (timer-only proof is not accepted)`);await settle(50);}};
 try{
  await waitHistRows(p,1);
  // A editor seeds from A OWN getMock receipt at the shared literal id.
  await openRowById(p,sharedId);
  await waitDetail(p);
  assert.equal(await p.locator(detailSel).getAttribute('data-account-history-id'),sharedId,'the literal shared id is preserved under A');
  assert.ok((await bodyText()).includes(L3_THINK_A)&&!(await bodyText()).includes(L3_INSTEAD_B),'A detail at the shared id shows ONLY A actual content');
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),L3_THINK_A,'A editor prefill equals the A OWN getMock receipt');
  assert.equal(await editField(p,'QR','2','free').inputValue(),L3_FREE_A,'A editor prefill carries A own reflection');
  await keyboardEdit(p,'QR','2','free',L3_A_UNSUB);
  await shot(p,'shot-1440-l3-a-editor.png');
  // Unsubmitted A draft: switch to the SAME literal id under B.
  await histSwitch(p,b);
  await waitHistRows(p,1);
  assert.equal((await histRowTitles(p))[0],'B-owned same-ID L3 mock','B list shows only its own row at the shared id');
  await openRowById(p,sharedId);
  await waitDetail(p);
  const tB1=await bodyText();
  assert.ok(tB1.includes(L3_INSTEAD_B)&&tB1.includes(L3_NOTE_B),'B detail shows B actual stored content');
  for(const m of [L3_A_UNSUB,L3_THINK_A,L3_NOTE_A,L3_FREE_A])assert.ok(!tB1.includes(m),'unsubmitted A typing 4h8 and A stored content never appear under B: '+m);
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await editField(p,'DM','3','instead').inputValue(),L3_INSTEAD_B,'B editor seeds from the B OWN getMock receipt, not A snapshot at the same literal id');
  assert.equal(await editField(p,'QR','2','free').count(),0,'A-only review fields are absent from the B editor entirely');
  await keyboardEdit(p,'DM','3','instead',L3_B_UNSUB);
  await shot(p,'shot-1440-l3-b-editor.png');
  // Unsubmitted B draft must vanish for A and never leak back.
  await histSwitch(p,a);
  await waitHistRows(p,1);
  await openRowById(p,sharedId);
  await waitDetail(p);
  const tA1=await bodyText();
  for(const m of [L3_B_UNSUB,L3_INSTEAD_B,L3_NOTE_B])assert.ok(!tA1.includes(m),'unsubmitted B typing and B stored content never appear under A: '+m);
  // Late held owner-A work: genuine PATCH captured, in flight across the
  // replacement by B, released LAST so the real commit lands under A only.
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await editField(p,'QR','2','free').inputValue(),L3_FREE_A,'A editor reopened fresh from the actual store: the abandoned A draft 4h8 was never retained as a submission');
  await keyboardEdit(p,'QR','2','free',L3_A_SENT);
  patchMode='hold';
  await p.locator('[data-account-history="edit-save"]').click();
  {const t0=Date.now();while(!holds.length){if(Date.now()-t0>15000)harness('the held owner-A PATCH never reached the browser route');await new Promise(r=>setTimeout(r,50));}}
  assert.ok(holds[0].url.includes('/api/mocks/reviews?id='+encodeURIComponent(sharedId)),'the held request carries the literal shared id');
  assert.equal(holds[0].ifMatch,preA.etag,'the held request carries the A-owned captured version');
  {const o1=(await obs())[0];
  assert.equal(o1.id,sharedId,'the transparent client wrapper saw the exact literal shared id argument');
  assert.equal(o1.version,preA.etag,'the wrapper saw the exact captured A-owned version argument');
  assert.equal(o1.receiverIsWrapped,true,'the real client method was invoked through the transparent test wrapper');
  assert.ok(holds[0].body.includes(L3_A_SENT),'the held request body carries the A submission marker');
  assert.equal(o1.settled,'pending','the real owner-A invocation was genuinely in flight before the replacement switch');
  }
  const heldStore=await readItem(sharedId,a.token);
  assert.ok(!JSON.stringify(heldStore.mock.reviews).includes(L3_A_SENT),'direct HTTP proves the held owner-A PATCH had not landed before release');
  await histSwitch(p,b);
  await waitHistRows(p,1);
  await openRowById(p,sharedId);
  await waitDetail(p);
  const tB2=await bodyText();
  assert.ok(tB2.includes(L3_INSTEAD_B),'B detail stays legitimately B-owned before release');
  const getsBeforeRelease=itemGetCount();
  const patchBefore=patchCount(rec);
  assert.equal(patchBefore,1,'the held owner-A dispatch is the only browser PATCH so far');
  const rel=await releaseHeld(0);
  assert.equal(rel.upstreamStatus,200,'the released owner-A PATCH genuinely committed under A upstream');
  const s1=await awaitSettled(1);
  assert.equal(s1.settled,'rejected','under replaced owner B the real client call settled REJECTED with the genuine stale-account guard: '+JSON.stringify(s1));
  assert.equal(s1.errorCode,'stale_account','the settlement carried the real typed stale_account error through the untouched guard chain');
  await settle(300);
  const tB3=await bodyText();
  assert.ok(!tB3.includes(L3_A_SENT)&&!tB3.includes(L3_A_UNSUB),'the late held owner-A work presents NOTHING under B');
  assert.equal(itemGetCount(),getsBeforeRelease,'the release added zero B-side GET traffic');
  assert.equal(patchCount(rec),patchBefore,'exactly one browser PATCH for the whole journey: the release dispatched no duplicate under the replacement owner');
  assert.equal(await detailTitle(p),'B-owned same-ID L3 mock','the open B detail stays B-owned across the settled late release (inspection-proven correction: list rows are absent while the detail is open; the timer-only800ms proof is superseded by the observed rejected settlement above)');
  // Direct-HTTP per-owner truth: distinct etags and verbatim immutables.
  const postA=await readItem(sharedId,a.token);
  const postB=await readItem(sharedId,b.token);
  assert.notEqual(postA.etag,postB.etag,'per-owner versions are DISTINCT at the shared literal id: '+postA.etag+' vs '+postB.etag);
  const expectedA=structuredClone(preA.mock);expectedA.reviews[1].free=L3_A_SENT;
  assert.deepEqual(postA.mock,expectedA,'A store equals ONLY its own submitted edit with every immutable field verbatim');
  assert.deepEqual(postB.mock,preB.mock,'B store is byte-unchanged: the unsubmitted B draft 1y5 and the A PATCH never touched it');
  assert.deepEqual(await readUsage(a.token),usageA0,'A cumulative usage unchanged');
  assert.deepEqual(await readUsage(b.token),usageB0,'B cumulative usage unchanged');
  // Fresh authorised re-entry per owner shows each actual stored truth only.
  await histSwitch(p,a);
  await waitHistRows(p,1);
  await openRowById(p,sharedId);
  await waitDetail(p);
  const freshA=(await p.locator('[data-account-history="detail-review"]').allTextContents()).join(' | ');
  assert.ok(freshA.includes(L3_A_SENT)&&freshA.includes(L3_THINK_A),'a fresh authorised A re-entry reads the A-owned stored truth');
  assert.ok(!freshA.includes(L3_A_UNSUB)&&!freshA.includes(L3_B_UNSUB),'neither abandoned draft ever resurfaces on fresh re-entry');
  await histSwitch(p,b);
  await waitHistRows(p,1);
  await openRowById(p,sharedId);
  await waitDetail(p);
  const freshB=(await p.locator('[data-account-history="detail-review"]').allTextContents()).join(' | ');
  assert.ok(freshB.includes(L3_INSTEAD_B)&&!freshB.includes(L3_A_SENT),'a fresh authorised B re-entry reads the B-owned stored truth only');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'independent same-id drafts add zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical: drafts are tab-memory only');
  assert.deepEqual(dialogs,[],'no native dialog belongs to this journey');
  assert.equal(await p.locator('.mock-confetti').count(),0,'no celebration from review editing');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'no acknowledgement from review editing');
  const obsFinal=await obs();
  await fs.writeFile(new URL('l3-same-id-receipt.json',out),JSON.stringify({sharedId,transitionsExercised:['A editor seed from own getMock','A→B switch with unsubmitted A draft','B editor seed from own getMock at same literal id','B→A switch with unsubmitted B draft','held owner-A PATCH released under replaced B','settled-late non-presentation census under B','fresh authorised re-entry reads for A and for B'],transitionsNotExercised:['logout/detach for same-id drafts (l2 covers control invalidation)','B-side PATCH attempt (none was made: B typing stayed unsubmitted by design)'],perOwner:{A:{etag:postA.etag,hasSent:JSON.stringify(postA.mock.reviews).includes(L3_A_SENT)},B:{etag:postB.etag,verbatim:JSON.stringify(postB.mock)===JSON.stringify(preB.mock)}},held:{ifMatch:holds[0].ifMatch,upstreamStatus:rel.upstreamStatus,upstreamEtag:rel.upstreamEtag},settlement:s1,observer:obsFinal,fixtureCorrections:['detail-title instead of histRowTitles while B detail open (inspection-proven, parent-identified)','observed real updateReviews settlement (l2Connect wrapper reuse) replaces the timer-only800ms proof (parent-identified)'],usageA:usageA0,usageB:usageB0},null,2));
  checkClean(rec,'l3');
  await shot(p,'shot-1440-l3-final-b-fresh-read.png');
 }catch(e){await captureFailure(p,'l3');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-l3-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-ad1-append ──
// ad1 (extension contract §Vertical 3; account-review-add1-direction.md):
// LATER QUESTION ADDITION in the account-saved review editor. From the ACTUAL
// getMock detail: Edit question reviews → native labelled incorrect-question
// section select + positive whole question-number input → Add question → type
// text into the added draft rows → explicit Save question reviews → exactly
// one full-array versioned PATCH → fresh authorised reopen reads the new
// review back. Requirements proved by this ONE case:
//  - Adding/typing sends NO write and marks NOTHING reviewed: zero PATCH and
//    a byte-verbatim direct-HTTP store until the explicit Save.
//  - Reused validation with the EXACT existing messages: a non-positive
//    number is refused ('Enter a positive whole question number.') and a
//    NORMALIZED identity duplicate is refused ('That question is already
//    selected.' for VR/'01' against the saved VR/'1', identity
//    section+':'+Number(number)). No upper bounds derived from weighted
//    marks; SJT is offered only when the saved mock recorded SJT (this seed
//    has sjt:null, so exactly VR/DM/QR).
//  - Canonical new review object {section,number,format:'guided',thinking,
//    instead:'',free:'',type:'',reasons:[],other:'',reviewed:false,
//    confirmed:false}; guided is the direction's engineering default for this
//    first account-add vertical and the existing editor renderer exposes all
//    three text fields. No mark/label/format-preference control exists in
//    AD1 and none may appear.
//  - Editor-owned draft, never a saved-snapshot mutation: a real owned error
//    rerender (the duplicate refusal) keeps both the typed draft text and
//    the added row; the addition lives only in the editor until Save.
//  - Every ORIGINAL review object survives verbatim in the stored full-array
//    replacement, all immutable mock fields unchanged, the etag advanced
//    exactly once by ONE PATCH with the exact captured If-Match, cumulative
//    usage unchanged, zero browser-local storage writes, the durable blob
//    byte-identical, no celebration/acknowledgement.
//  - Keyboard-operable native controls (focus + Enter on Add) and a DESKTOP
//    (1440) plus MOBILE (390) journey each persist one addition over real
//    HTTP; fresh Back→list→Open reopens show the actual saved content.
// The FIRST adder assertion below the editor opens is the primary missing-
// behavior RED against the unchanged old source (no adder exists there): it
// must fail as a missing control, not an import/selector/fixture error.
const AD1_THINK_D='Added DM thinking 4v2 draft-only until explicit Save';
const AD1_MOBILE='Added QR reflection 6t8 typed on mobile';
const AD1_CANON_D={section:'DM',number:'3',format:'guided',thinking:AD1_THINK_D,instead:'',free:'',type:'',reasons:[],other:'',reviewed:false,confirmed:false};
const AD1_CANON_M={section:'QR',number:'7',format:'guided',thinking:'',instead:'',free:AD1_MOBILE,type:'',reasons:[],other:'',reviewed:false,confirmed:false};

test('review edit: ad1 adding a later question review in the account editor keeps the draft private until an explicit Save, refuses non-positive and normalized-duplicate numbers with the existing messages, sends exactly one full-array PATCH with the exact captured version, stores the canonical added review with every original review verbatim, and fresh desktop plus mobile reopens read the new review back',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 assert.equal(pre.mock.reviews.length,2,'seed has two saved reviews');
 assert.equal(pre.mock.sjt,null,'the seed mock recorded no SJT, so the adder must not offer SJT');
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 const bodies=[];
 p.on('request',r=>{if(r.method()==='PATCH')bodies.push(r.postData());});
 const connected=await connectHistoryHarness(p,acct);
 assert.ok(connected.attachAvailable&&connected.moduleAvailable,'history seams must exist under the explicit harness connection');
 await goHistory(p);
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 const addSec=p.locator('[data-account-history="add-section"]');
 const addNum=p.locator('[data-account-history="add-number"]');
 const addBtn=p.locator('[data-account-history="edit-add"]');
 const addErr=async()=>((await p.locator('[data-account-history="add-error"]').count())?await p.locator('[data-account-history="add-error"]').textContent():'');
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  // PRIMARY MISSING-BEHAVIOR RED: the account editor must offer the native
  // labelled incorrect-question addition controls. The unchanged old source
  // has none: this count assertion fails as missing behavior, not setup.
  assert.equal(await addSec.count(),1,'the editor must offer a native labelled question-section control');
  assert.equal(await addNum.count(),1,'the editor must offer a question-number input');
  assert.equal(await addBtn.count(),1,'the editor must offer a native Add question control');
  assert.equal(await addBtn.textContent(),'Add question','the add control is the explicit Add question button');
  const addNote=await p.locator('[data-account-history="add-note"]').textContent();
  assert.ok(addNote.includes('incorrect')&&addNote.includes('marks nothing'),'the adder labels additions as incorrect-question reviews that mark nothing until Save: '+addNote);
  assert.ok(addNote.includes('Save question reviews'),'the adder clarifies nothing saves before the explicit Save: '+addNote);
  const secs=await addSec.locator('option').allTextContents();
  assert.deepEqual(secs,['VR','DM','QR'],'SJT must be offered only when the saved mock recorded SJT');
  assert.ok(await p.locator('label[data-account-history="add-label"]').count()>=2,'the section and number controls must carry native labels');
  // Positive-whole-number refusal with the EXISTING message.
  await addSec.selectOption('DM');
  await addNum.fill('0');
  await addBtn.click();
  assert.equal(await addErr(),'Enter a positive whole question number.','non-positive numbers reuse the existing refusal message');
  assert.equal(await addNum.getAttribute('aria-invalid'),'true','the number input is aria-invalid on refusal');
  assert.equal(await p.locator('[data-account-history="edit-field"][data-section="DM"][data-number="0"]').count(),0,'a refused number adds no draft rows');
  assert.equal(patchCount(rec),0,'a refusal dispatches zero requests');
  // Genuine keyboard-operable add: DM question 3 through focus + Enter.
  await addSec.selectOption('DM');
  await addNum.fill('3');
  await addBtn.focus();
  assert.equal(await p.evaluate(()=>document.activeElement?.dataset?.accountHistory),'edit-add','the Add control must be keyboard focusable');
  await p.keyboard.press('Enter');
  await p.waitForSelector('[data-account-history="edit-field"][data-section="DM"][data-number="3"][data-field="thinking"]',{timeout:15000});
  assert.equal(await addErr(),'','a successful add clears the refusal message');
  assert.equal(await addNum.getAttribute('aria-invalid'),null,'a successful add removes aria-invalid');
  assert.equal(await p.locator('[data-account-history="edit-field"][data-section="DM"][data-number="3"]').count(),3,'the added guided row exposes the three existing review text fields');
  // Existing saved prefills stay visible next to the new draft row.
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),DETAIL_THINKING,'the original saved prefill survives the add rerender');
  assert.equal(await editField(p,'QR','2','free').inputValue(),DETAIL_FREE,'the second original saved prefill survives the add rerender');
  assert.equal(await editField(p,'DM','3','thinking').inputValue(),'','the new draft row starts blank');
  // Type into the ADDED draft row only.
  await keyboardEdit(p,'DM','3','thinking',AD1_THINK_D);
  // Normalized identity duplicate refusal with the EXISTING message:
  // VR '01' normalizes to the saved VR '1' (section+':'+Number(number)).
  await addSec.selectOption('VR');
  await addNum.fill('01');
  await addBtn.click();
  assert.equal(await addErr(),'That question is already selected.','normalized duplicates reuse the existing refusal message');
  // Owned error rerender: both the added row and the typed draft survive.
  assert.equal(await p.locator('[data-account-history="edit-field"][data-section="DM"][data-number="3"]').count(),3,'the duplicate refusal adds no extra draft rows');
  assert.equal(await editField(p,'DM','3','thinking').inputValue(),AD1_THINK_D,'the typed draft text survives the owned error rerender exactly like ordinary text');
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),DETAIL_THINKING,'the saved prefill is unaffected by the refusal');
  assert.equal(await p.locator('[data-account-history="mark-reviewed"]').count(),0,'AD1 offers no mark-reviewed control');
  await shot(p,'shot-1440-ad1-editor-added.png');
  // NO PRE-SAVE WRITE: zero PATCHes and the direct-HTTP store still equals
  // the original snapshot (the saved snapshot is never mutated pre-ack).
  assert.equal(patchCount(rec),0,'adding and typing send zero requests before the explicit Save');
  const mid=await readItem(ack.id,acct.token);
  assert.deepEqual(mid.mock,pre.mock,'the unsubmitted addition never touches the actual store');
  assert.equal(mid.etag,pre.etag,'the version is unchanged by an unsubmitted draft');
  // Explicit Save: one full-array versioned PATCH.
  const itemsBeforeSave=itemCount(rec);
  await p.locator('[data-account-history="edit-save"]').click();
  await waitDetail(p);
  assert.equal(patchCount(rec),1,'the explicit Save sends exactly one PATCH');
  assert.ok(rec.patch[0].url.includes('/api/mocks/reviews?id='+encodeURIComponent(ack.id)),'the PATCH targets the literal record id over the accepted route: '+rec.patch[0].url);
  assert.equal(rec.patch[0].headers['if-match'],pre.etag,'the PATCH carries the exact captured version in If-Match');
  assert.equal(bodies.length,1,'the PATCH body was genuinely observed');
  const parsed=JSON.parse(bodies[0]);
  assert.deepEqual(Object.keys(parsed).sort(),['reviews'],'the PATCH carries ONLY reviews');
  assert.ok(Array.isArray(parsed.reviews)&&parsed.reviews.length===3,'the PATCH is a full-array replacement including the addition');
  const live=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.equal(live.length,3,'the reopened detail shows the new review row');
  assert.ok(live[2].includes('DM')&&live[2].includes('Question 3')&&live[2].includes(AD1_THINK_D),'the detail renders the added review content: '+live[2]);
  const post=await readItem(ack.id,acct.token);
  assert.notEqual(post.etag,pre.etag,'the server-owned revision advanced by the single PATCH');
  assert.equal(post.mock.reviews.length,3,'the stored full array carries the addition appended');
  assert.deepEqual(post.mock.reviews[2],AD1_CANON_D,'the added review is exactly the canonical object with typed text, reviewed:false and confirmed:false');
  const expectedD=structuredClone(pre.mock);expectedD.reviews.push(AD1_CANON_D);
  assert.deepEqual(post.mock,expectedD,'every original review object and every immutable mock field survives verbatim in the replacement');
  assert.deepEqual(await readUsage(acct.token),usage0,'review additions must not change cumulative usage');
  await shot(p,'shot-1440-ad1-saved.png');
  // Fresh reopen through Back -> list -> Open reads the ACTUAL saved content.
  await p.locator('[data-account-history="back"]').click();
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  assert.ok(itemCount(rec)>itemsBeforeSave,'the reopen fetches the actual record again over real HTTP');
  const fresh=await p.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(fresh.length===3&&fresh[2].includes(AD1_THINK_D),'a fresh authorised desktop reopen displays the new review');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the addition journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob must be byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'review additions render no celebration');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'review additions render no acknowledgement leaf');
  checkClean(rec,'ad1-desktop');
  // Mobile 390 journey: one further addition persisted over real HTTP.
  const {p:pm,rec:recm}=await openPage(390);
  pm.on('request',attachPatchObserver(recm));
  await connectHistoryHarness(pm,acct);
  await goHistory(pm);
  await pm.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
  await waitHistRows(pm,1);
  await openRowById(pm,ack.id);
  await waitDetail(pm);
  assert.equal((await pm.locator('[data-account-history="detail-review"]').allTextContents()).length,3,'the mobile detail seeds from the actual store including the desktop-persisted addition');
  await pm.locator('[data-account-history="edit-reviews"]').click();
  await pm.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await pm.locator('[data-account-history="edit-add"]').count(),1,'the mobile editor offers the same add controls');
  assert.equal(await editField(pm,'DM','3','thinking').inputValue(),AD1_THINK_D,'the mobile editor prefills the desktop-added review from the actual store');
  await pm.locator('[data-account-history="add-section"]').selectOption('QR');
  await pm.locator('[data-account-history="add-number"]').fill('7');
  await pm.locator('[data-account-history="edit-add"]').click();
  await pm.waitForSelector('[data-account-history="edit-field"][data-section="QR"][data-number="7"][data-field="free"]',{timeout:15000});
  await keyboardEdit(pm,'QR','7','free',AD1_MOBILE);
  await shot(pm,'shot-390-ad1-editor-added.png');
  assert.equal(patchCount(recm),0,'the mobile add/type journey sends zero requests before Save');
  await pm.locator('[data-account-history="edit-save"]').click();
  await waitDetail(pm);
  assert.equal(patchCount(recm),1,'the mobile explicit Save sends exactly one PATCH');
  assert.equal(recm.patch[0].headers['if-match'],post.etag,'the mobile PATCH carries the exact CURRENT version after the desktop save');
  const postM=await readItem(ack.id,acct.token);
  const expectedM=structuredClone(post.mock);expectedM.reviews.push(AD1_CANON_M);
  assert.deepEqual(postM.mock,expectedM,'the mobile addition stores canonically with every earlier review and immutable field verbatim');
  const liveM=await pm.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(liveM.length===4&&liveM[3].includes('QR')&&liveM[3].includes('Question 7')&&liveM[3].includes(AD1_MOBILE),'the mobile reopened detail shows the new review: '+liveM[3]);
  await pm.locator('[data-account-history="back"]').click();
  await waitHistRows(pm,1);
  await openRowById(pm,ack.id);
  await waitDetail(pm);
  const freshM=await pm.locator('[data-account-history="detail-review"]').allTextContents();
  assert.ok(freshM.length===4&&freshM[3].includes(AD1_MOBILE),'a fresh authorised mobile reopen displays the new review');
  assert.deepEqual(await readUsage(acct.token),usage0,'the mobile addition does not change cumulative usage either');
  assert.equal(await pm.evaluate(()=>window.__uicHistWrites),0,'the mobile journey adds zero browser-local storage writes');
  assert.equal(await pm.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical after the mobile journey');
  assert.equal(await pm.locator('.mock-confetti').count(),0,'mobile review additions render no celebration');
  checkClean(recm,'ad1-mobile');
  await shot(pm,'shot-390-ad1-saved.png');
  await fs.writeFile(new URL('ad1-receipt.json',out),JSON.stringify({record:ack.id,preEtag:pre.etag,postEtag:post.etag,finalEtag:postM.etag,patchBodies:{desktopReviews:JSON.parse(bodies[0]).reviews.length,mobileIfMatch:recm.patch[0].headers['if-match']},added:[AD1_CANON_D,AD1_CANON_M],originalsVerbatimDesktop:JSON.stringify(post.mock.reviews.slice(0,2))===JSON.stringify(pre.mock.reviews),originalsVerbatimMobile:JSON.stringify(postM.mock.reviews.slice(0,3))===JSON.stringify(post.mock.reviews),usage:usage0,storageWrites:0,refusals:['Enter a positive whole question number.','That question is already selected.']},null,2));
 }catch(e){await captureFailure(p,'ad1');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-ad1-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-ar1-append ──
// ar1 (structural-draft retention on failed conflict reload): the parent
// review finding account-review-add1-parent-review.md §New source-review
// finding — account-history.js:468 non-uncertain failed conflict-reload
// rerender calls showEditor with collected text values but NO draftArr, and
// showEditor:258 falls back to the SAVED snapshot review array, dropping
// unsaved AD1 additions while existing rows survive and mask the loss.
// Journey: saved record → Edit → Add question (accepted AD1 adder) → type
// meaningful text into the ADDED row → Save meets a GENUINE 412 (real
// competing Node-side accepted PATCH through the existing seam, re4/re5
// convention) → native-confirmed Reload whose item GET fails through the
// LABELLED CONTROLLED browser-layer 503 (an explicit controlled response,
// never a backend-outage claim; the re5 failed-reload fixture pattern).
// Requirements proved: the recovered conflict editor retains the added
// draft row (all three fields) and its typed text verbatim alongside the
// existing rows; zero accidental PATCH, no automatic resend; the actual
// store, etag, usage, celebration/acknowledgement seams and the durable
// browser-local blob stay byte-unchanged; a later successful confirmed
// reload STILL re-seeds from the actual store and discards the draft
// (existing re4/re5 confirmed-discard semantics unchanged on both sources).
const AR1_ADDED='Added draft row 5y7 must survive a failed reload';
const AR1_COMPETITOR='Competing saved text 2q4 that forces the ar1 conflict';

test('review edit: ar1 an unsaved question addition surviving a genuine conflict keeps its row and its typed text through a failed confirmed reload, with zero accidental PATCH and the store, usage and browser-local blob unchanged',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 p.removeAllListeners('dialog');
 const dialogs=[];
 let dialogResponse='dismiss';
 p.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});if(dialogResponse==='accept')await d.accept();else await d.dismiss();});
 const itemUrl=base+'/api/mocks/item?id='+encodeURIComponent(ack.id);
 let itemMode='off';const itemCalls=[];
 await p.route(url=>url.href.startsWith(itemUrl),async route=>{
  itemCalls.push(route.request().url());
  if(itemMode==='fault503'){itemMode='off';await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})});return;}
  await route.continue();
 });
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  const getsBase=itemCalls.length;
  assert.equal(getsBase,1,'the detail open performed exactly one item GET (fixture baseline)');
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  // AD1 add flow (accepted adder): add DM question 3 and type into the
  // ADDED row only. This part must pass on BOTH sources — it is setup.
  await p.locator('[data-account-history="add-section"]').selectOption('DM');
  await p.locator('[data-account-history="add-number"]').fill('3');
  await p.locator('[data-account-history="edit-add"]').click();
  await p.waitForSelector('[data-account-history="edit-field"][data-section="DM"][data-number="3"][data-field="thinking"]',{timeout:15000});
  await keyboardEdit(p,'DM','3','thinking',AR1_ADDED);
  assert.equal(patchCount(rec),0,'adding and typing send zero requests before Save');
  // GENUINE conflict through the accepted seam: a real competing Node-side
  // PATCH advances the server revision while the editor holds the older
  // captured version, so the browser Save really meets 412.
  const wr=structuredClone(pre.mock.reviews);wr[1].free=AR1_COMPETITOR;
  const cr=await fetch(base+'/api/mocks/reviews?id='+encodeURIComponent(ack.id),{method:'PATCH',headers:{'content-type':'application/json',authorization:'Bearer '+acct.token,'if-match':pre.etag},body:JSON.stringify({reviews:wr}),credentials:'omit',cache:'no-store'});
  assert.equal(cr.status,200,'the competing writer PATCH genuinely succeeds: '+cr.status);
  const compEtag=cr.headers.get('etag');
  assert.ok(compEtag&&compEtag!==pre.etag,'the competing write advanced the strong version');
  await p.locator('[data-account-history="edit-save"]').click();
  await p.waitForSelector('[data-account-history="edit-conflict"]',{timeout:15000});
  assert.equal(patchCount(rec),1,'the browser editor Save is the only browser PATCH (the competing write was Node-side direct HTTP)');
  assert.equal(await editField(p,'DM','3','thinking').inputValue(),AR1_ADDED,'the conflict editor retains the added row text (accepted settleFailure draftArr path)');
  await shot(p,'shot-1440-ar1-added-conflict.png');
  // Native-confirmed Reload whose GET fails through the labelled 503.
  itemMode='fault503';dialogResponse='accept';
  await p.locator('[data-account-history="edit-reload"]').click();
  {const t0=Date.now();while(itemCalls.length<getsBase+1){if(Date.now()-t0>15000)harness('the failed-reload GET was never dispatched');await new Promise(r=>setTimeout(r,50));}}
  await p.waitForSelector('[data-account-history="edit-conflict"]',{timeout:15000});
  await settle(400);
  assert.equal(dialogs.length,1,'the reload demanded its native confirmation before discarding');
  // EVIDENCE FIRST (before the missing-behavior assertion): the recovered
  // state exactly as rendered by the unchanged/fixed production bytes.
  await fs.writeFile(new URL('ar1-failed-reload-receipt.json',out),JSON.stringify({stableId:ack.id,faultLabel:'controlled-503-item-GET (browser-layer fixture, NOT a backend outage)',addedRow:{section:'DM',number:'3',thinking:AR1_ADDED},browserPatchCount:patchCount(rec),itemCalls:itemCalls.length,competitorEtag:compEtag,dialogTypes:dialogs.map(d=>d.type)},null,2));
  await shot(p,'shot-1440-ar1-failed-reload-recovered.png');
  // PRIMARY MISSING-BEHAVIOR RED: the recovered conflict editor must retain
  // the editor-owned ADDED ROW STRUCTURE (all three fields) and its typed
  // text. The unchanged source falls back to the saved snapshot here and
  // drops the added row while preserving existing rows.
  assert.equal(await editField(p,'DM','3','thinking').count(),1,'the failed reload must retain the added draft row (thinking field) — structural-draft retention');
  assert.equal(await editField(p,'DM','3','instead').count(),1,'the retained added row exposes its instead field after the failed reload');
  assert.equal(await editField(p,'DM','3','free').count(),1,'the retained added row exposes its free field after the failed reload');
  assert.equal(await editField(p,'DM','3','thinking').inputValue(),AR1_ADDED,'the added row text survives the failed reload verbatim');
  // Existing rows and their text are retained alongside (both sources).
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),DETAIL_THINKING,'an existing saved row keeps its text through the failed reload');
  assert.equal(await editField(p,'QR','2','free').inputValue(),DETAIL_FREE,'the second existing row keeps its text through the failed reload');
  {const s=await p.evaluate(()=>({save:document.querySelector('[data-account-history="edit-save"]')?.disabled,reload:document.querySelector('[data-account-history="edit-reload"]')?.disabled}));
  assert.equal(s.save,false,'Save is usable again after the failed reload');
  assert.equal(s.reload,false,'the explicit reload recovery control stays available and enabled');}
  const errCopy=await p.locator('[data-account-history="edit-conflict"]').textContent();
  assert.ok(!/success/i.test(errCopy),'a failed reload must never claim success: '+errCopy);
  // No accidental writes and unchanged durable truth.
  assert.equal(patchCount(rec),1,'the failed reload triggers no automatic PATCH or resend');
  assert.equal(itemCalls.length,getsBase+1,'exactly one scripted failed reload GET occurred so far');
  const store=await readItem(ack.id,acct.token);
  assert.equal(store.etag,compEtag,'the current version is still the competing write');
  assert.equal(store.mock.reviews[1].free,AR1_COMPETITOR,'the stored reviews remain the competitor content (no silent overwrite)');
  assert.equal(store.mock.reviews.length,2,'the unsaved added row was never persisted');
  assert.deepEqual(await readUsage(acct.token),usage0,'the failed reload journey consumes no allowance');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the failed reload journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'the failed reload journey renders no celebration');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'the failed reload journey renders no acknowledgement');
  // UNCHANGED success-reload semantics (both sources): the later confirmed
  // real GET still re-seeds from the ACTUAL store and the confirmed discard
  // still drops the draft — the repair must not resurrect it after a
  // SUCCESSFUL reconciliation.
  await p.locator('[data-account-history="edit-reload"]').click();
  await p.waitForFunction(()=>{const t=document.querySelector('[data-account-history="edit-field"][data-section="QR"][data-number="2"][data-field="free"]');return !!t&&t.value==='Competing saved text 2q4 that forces the ar1 conflict';},{timeout:15000});
  assert.equal(itemCalls.length,getsBase+2,'the confirmed recovery reload performed exactly one further real GET');
  assert.equal(await editField(p,'DM','3','thinking').count(),0,'a SUCCESSFUL confirmed reload still reconciles to the actual store and discards the unconfirmed addition (existing re4/re5 semantics)');
  assert.equal(patchCount(rec),1,'the whole ar1 journey sends exactly one browser PATCH');
  assert.deepEqual(dialogs.map(d=>d.type),['confirm','confirm'],'only the two reload confirmations appeared as dialogs');
  checkClean(rec,'ar1');
  await shot(p,'shot-1440-ar1-final.png');
 }catch(e){await captureFailure(p,'ar1');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-ar1-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-mk1-append ──
// mk1 (extension contract §Vertical 3 marks step; addition semantics note
// §5.3): an EXPLICIT per-question reviewed mark/unmark affordance in the
// account-saved review editor, on EXISTING and newly ADDED rows, using
// reviewed===true. Approved exact semantics: the toggle mirrors
// {reviewed:checked, confirmed:checked} (the accepted browser-local 'mark'
// semantics, app.js:692 reviewAction 'mark'); typing, adding and opening
// never mark anything; zero reviews stays legal; NO separate confirmed
// control; labels stay the next settled task (this uses the single new
// [data-account-history="edit-mark"] checkbox per row and changes no
// detail/copy projection). Journey: saved record → Edit → evidence-first
// receipt+screenshot → ONE explicit mark control per existing row seeded
// from the saved flags (PRIMARY MISSING-BEHAVIOR RED against the unchanged
// source: no such control exists there, so this fails as a missing control,
// never an import/selector/fixture error) → typing keeps marks off, zero
// PATCH, store verbatim → accepted AD1 adder row exposes its own unchecked
// mark → the duplicate-refusal rerender retains typing, the added row and
// every mark state → mark VR1 + unmark QR2 (zero writes before Save) →
// Cancel discards the whole mark draft → a REAL competing Node-side PATCH
// makes the next Save a genuine 412 whose conflict editor RETAINS marks +
// typing + the added row → the native-confirmed real reload re-seeds from
// the ACTUAL store and discards the draft (existing re4/re5 confirmed-
// discard semantics) → re-mark/re-add/re-type, explicit Save: exactly one
// further full-array PATCH with the exact captured If-Match, the direct
// HTTP store readback shows the canonical mirrored flags (VR1 reviewed+
// confirmed true, QR2 both false, added DM3 both true) with every other
// field and opaque key verbatim → a fresh Back→list→Open→Edit reopen shows
// the saved flags on the controls → cumulative usage, immutable mock data,
// browser-local writes/durable blob and celebration/acknowledgement seams
// unchanged → the mobile 390 editor exposes the same per-row marks seeded
// from the actual saved flags.
const MK1_TYPE='Edited VR thinking 4t6 typed without marking';
const MK1_ADD_TXT='Added DM3 text 8m2 marked on its own row';
const MK1_COMP='Competing saved text 6r9 that refuses the mk1 save';
const MK1_CANON_D={section:'DM',number:'3',format:'guided',thinking:MK1_ADD_TXT,instead:'',free:'',type:'',reasons:[],other:'',reviewed:true,confirmed:true};
const mk1Mark=(p,section,number)=>p.locator(`[data-account-history="edit-mark"][data-section="${section}"][data-number="${number}"]`);
const mk1Marks=async p=>{
 const rows=await p.evaluate(()=>Array.from(document.querySelectorAll('[data-account-history="edit-mark"]')).map(c=>({key:`${c.dataset.section}:${Number(c.dataset.number)}`,checked:c.checked})));
 return Object.fromEntries(rows.map(r=>[r.key,r.checked]));};

test('review edit: mk1 an explicit per-question mark toggle mirrors reviewed/confirmed for existing and added rows, typing adding and opening never mark, Cancel discards the mark draft, a genuine 412 save refusal retains marks plus typing plus the added row, and one versioned Save after the confirmed reload persists the canonical flags that a fresh reopen reads back with immutable data, usage, browser-local state and celebration unchanged',async()=>{
 const acct=await account();
 const ack=await commitDetailed(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 const bodies=[];
 p.on('request',r=>{if(r.method()==='PATCH')bodies.push(r.postData());});
 p.removeAllListeners('dialog');
 const dialogs=[];
 let dialogResponse='dismiss';
 p.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});if(dialogResponse==='accept')await d.accept();else await d.dismiss();});
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 // Shim installed AFTER the legitimate navigation write (accepted convention).
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  // EVIDENCE FIRST: the editor exactly as the unchanged source renders it,
  // captured BEFORE the missing-behavior assertion.
  await fs.writeFile(new URL('mk1-editor-open-receipt.json',out),JSON.stringify({record:ack.id,preEtag:pre.etag,savedFlags:pre.mock.reviews.map(q=>({key:`${q.section}:${Number(q.number)}`,reviewed:q.reviewed,confirmed:q.confirmed}))},null,2));
  await shot(p,'shot-1440-mk1-editor-open.png');
  // PRIMARY MISSING-BEHAVIOR RED against the unchanged product source: one
  // explicit per-question mark control for each existing saved row.
  assert.equal(await p.locator('[data-account-history="edit-mark"]').count(),2,'the editor must expose one explicit per-question mark control for each existing row');
  assert.equal(await p.locator('[data-account-history="mark-reviewed"]').count(),0,'the affordance uses the new per-row edit-mark vocabulary, keeping the AD1-absent selector inert');
  assert.equal(await p.locator('[data-account-history="edit-mark"]').first().evaluate(c=>c.type),'checkbox','the mark is a native checkbox control');
  assert.deepEqual(await mk1Marks(p),{'VR:1':false,'QR:2':true},'initial mark states mirror the saved reviewed===true flags (QR2 saved reviewed, VR1 saved unreviewed)');
  // Typing is NOT a mark (approved exact semantics).
  await keyboardEdit(p,'VR','1','thinking',MK1_TYPE);
  assert.equal(await mk1Mark(p,'VR','1').isChecked(),false,'typing never marks a question reviewed');
  assert.equal(patchCount(rec),0,'typing sends zero requests');
  // The accepted AD1 adder row carries its own UNCHECKED mark (adding ≠ mark).
  await p.locator('[data-account-history="add-section"]').selectOption('DM');
  await p.locator('[data-account-history="add-number"]').fill('3');
  await p.locator('[data-account-history="edit-add"]').click();
  await p.waitForSelector('[data-account-history="edit-field"][data-section="DM"][data-number="3"][data-field="thinking"]',{timeout:15000});
  assert.equal(await p.locator('[data-account-history="edit-mark"]').count(),3,'a newly added row exposes the same explicit mark control');
  assert.equal(await mk1Mark(p,'DM','3').isChecked(),false,'adding a question starts unmarked');
  await keyboardEdit(p,'DM','3','thinking',MK1_ADD_TXT);
  // Owned editor refusal rerender retains typing, the added row AND marks.
  await p.locator('[data-account-history="add-section"]').selectOption('VR');
  await p.locator('[data-account-history="add-number"]').fill('01');
  await p.locator('[data-account-history="edit-add"]').click();
  assert.equal(await p.locator('[data-account-history="add-error"]').textContent(),'That question is already selected.','the existing normalized-duplicate refusal message is reused');
  assert.deepEqual(await mk1Marks(p),{'VR:1':false,'QR:2':true,'DM:3':false},'the refusal rerender retains every mark state');
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),MK1_TYPE,'the refusal rerender retains the typed text');
  assert.equal(await editField(p,'DM','3','thinking').inputValue(),MK1_ADD_TXT,'the refusal rerender retains the added row and its text');
  // Explicit mark/unmark with ZERO writes before the Save (canonical
  // {reviewed,confirmed} mirroring is proven on the STORED object after
  // Save; here the controls flip immediately).
  await mk1Mark(p,'VR','1').click();
  await mk1Mark(p,'QR','2').click();
  assert.deepEqual(await mk1Marks(p),{'VR:1':true,'QR:2':false,'DM:3':false},'the toggle reflects the explicit mark/unmark immediately');
  assert.equal(patchCount(rec),0,'marking sends zero PATCH before the explicit Save');
  const mid=await readItem(ack.id,acct.token);
  assert.deepEqual(mid.mock,pre.mock,'unsubmitted marks never touch the actual store');
  assert.equal(mid.etag,pre.etag,'the version is unchanged by an unsubmitted mark draft');
  await shot(p,'shot-1440-mk1-marked-draft.png');
  // Cancel discards the whole mark draft: the reopened editor mirrors the
  // SAVED flags and text with the addition gone.
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  assert.equal(patchCount(rec),0,'Cancel before dispatch sends zero PATCH');
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await p.locator('[data-account-history="edit-mark"]').count(),2,'Cancel discards the added row (no third mark control on reopen)');
  assert.deepEqual(await mk1Marks(p),{'VR:1':false,'QR:2':true},'the reopened editor reseeds marks from the saved flags — Cancel discarded the mark draft');
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),DETAIL_THINKING,'Cancel discards the typing too');
  // REAL competing writer over the accepted direct-HTTP seam (re4/re5
  // convention: Node-side, so the browser PATCH count stays comparable):
  // the next browser Save meets a GENUINE 412.
  const wr=structuredClone(pre.mock.reviews);wr[1].free=MK1_COMP;
  const r1=await fetch(base+'/api/mocks/reviews?id='+encodeURIComponent(ack.id),{method:'PATCH',headers:{'content-type':'application/json',authorization:'Bearer '+acct.token,'if-match':pre.etag},body:JSON.stringify({reviews:wr}),credentials:'omit',cache:'no-store'});
  assert.equal(r1.status,200,'the competing writer PATCH genuinely succeeds: '+r1.status);
  const compEtag=r1.headers.get('etag');
  assert.ok(compEtag&&compEtag!==pre.etag,'the competing write advanced the strong version');
  // Re-apply the mark draft on the reopened editor (typing + marks + add).
  await keyboardEdit(p,'VR','1','thinking',MK1_TYPE);
  await p.locator('[data-account-history="add-section"]').selectOption('DM');
  await p.locator('[data-account-history="add-number"]').fill('3');
  await p.locator('[data-account-history="edit-add"]').click();
  await p.waitForSelector('[data-account-history="edit-field"][data-section="DM"][data-number="3"][data-field="thinking"]',{timeout:15000});
  await keyboardEdit(p,'DM','3','thinking',MK1_ADD_TXT);
  await mk1Mark(p,'VR','1').click();
  await mk1Mark(p,'DM','3').click();
  await mk1Mark(p,'QR','2').click();
  assert.deepEqual(await mk1Marks(p),{'VR:1':true,'QR:2':false,'DM:3':true},'the re-applied mark draft shows explicitly');
  // SAVED-rejection: the Save meets the genuine 412; the conflict editor
  // RETAINS marks + typing + the added row (owned save-refusal).
  await p.locator('[data-account-history="edit-save"]').click();
  await p.waitForSelector('[data-account-history="edit-conflict"]',{timeout:15000});
  assert.equal(patchCount(rec),1,'the conflict Save is the only browser PATCH so far (the competing write was Node-side direct HTTP)');
  await shot(p,'shot-1440-mk1-conflict-retained.png');
  assert.deepEqual(await mk1Marks(p),{'VR:1':true,'QR:2':false,'DM:3':true},'the genuine 412 save refusal retains the explicit mark draft verbatim');
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),MK1_TYPE,'the 412 retains the typed text on existing rows');
  assert.equal(await editField(p,'DM','3','thinking').inputValue(),MK1_ADD_TXT,'the 412 retains the added row and its text');
  assert.equal(patchCount(rec),1,'no automatic resend after the 412');
  const compStore=await readItem(ack.id,acct.token);
  assert.equal(compStore.etag,compEtag,'the current version stays the competing write until an explicit reload save');
  assert.equal(compStore.mock.reviews.length,2,'the unsaved mark draft persisted nothing');
  assert.equal(compStore.mock.reviews[1].free,MK1_COMP,'the stored reviews remain the competitor content (no silent overwrite)');
  // Native-confirmed reload re-seeds from the ACTUAL store and discards the
  // draft (existing re4/re5/ar1 confirmed-discard semantics unchanged).
  dialogResponse='accept';
  await p.locator('[data-account-history="edit-reload"]').click();
  // Page-context predicate: the literal is inlined (re4 convention) — Node
  // constants are not visible inside evaluate.
  await p.waitForFunction(()=>{const t=document.querySelector('[data-account-history="edit-field"][data-section="QR"][data-number="2"][data-field="free"]');return !!t&&t.value==='Competing saved text 6r9 that refuses the mk1 save';},{timeout:15000});
  assert.equal(await p.locator('[data-account-history="edit-mark"]').count(),2,'the successful confirmed reload discards the added row');
  assert.deepEqual(await mk1Marks(p),{'VR:1':false,'QR:2':true},'the reloaded editor reseeds marks from the ACTUAL saved flags, not the discarded draft');
  // Re-mark on the current version, re-add DM3 marked, and Save: exactly
  // one further full-array PATCH with the reloaded exact ETag.
  await keyboardEdit(p,'VR','1','thinking',MK1_TYPE);
  await p.locator('[data-account-history="add-section"]').selectOption('DM');
  await p.locator('[data-account-history="add-number"]').fill('3');
  await p.locator('[data-account-history="edit-add"]').click();
  await p.waitForSelector('[data-account-history="edit-field"][data-section="DM"][data-number="3"][data-field="thinking"]',{timeout:15000});
  await keyboardEdit(p,'DM','3','thinking',MK1_ADD_TXT);
  await mk1Mark(p,'VR','1').click();
  await mk1Mark(p,'DM','3').click();
  await mk1Mark(p,'QR','2').click();
  await p.locator('[data-account-history="edit-save"]').click();
  await waitDetail(p);
  assert.equal(patchCount(rec),2,'the post-reload Save is exactly one further PATCH');
  assert.equal(rec.patch[1].headers['if-match'],compEtag,'the final PATCH carries the reloaded exact current ETag');
  assert.equal(bodies.length,2,'both browser PATCH bodies were genuinely observed');
  const parsed=JSON.parse(bodies[1]);
  assert.deepEqual(Object.keys(parsed).sort(),['reviews'],'the PATCH body carries ONLY reviews');
  assert.ok(Array.isArray(parsed.reviews)&&parsed.reviews.length===3,'the PATCH is a full-array replacement including the added row');
  const post=await readItem(ack.id,acct.token);
  assert.notEqual(post.etag,compEtag,'the server-owned revision advanced exactly once more by the single final PATCH');
  // Canonical stored flags: mirrored {reviewed,confirmed} per the toggle,
  // every untouched field and opaque key verbatim.
  const expected=structuredClone(compStore.mock);
  expected.reviews[0].thinking=MK1_TYPE;expected.reviews[0].reviewed=true;expected.reviews[0].confirmed=true;
  expected.reviews[1].reviewed=false;expected.reviews[1].confirmed=false;
  expected.reviews.push(MK1_CANON_D);
  assert.deepEqual(post.mock,expected,'the stored array carries the canonical mirrored marks on VR1/DM3 and cleared marks on QR2 with competitor text, all other fields and every immutable mock field verbatim');
  // A fresh authorised reopen shows the saved flags on the controls.
  await p.locator('[data-account-history="back"]').click();
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.deepEqual(await mk1Marks(p),{'VR:1':true,'QR:2':false,'DM:3':true},'a fresh reopen reads the saved mark flags back onto the controls');
  assert.equal(await editField(p,'DM','3','thinking').inputValue(),MK1_ADD_TXT,'the added row persists and reseeds its text');
  await shot(p,'shot-1440-mk1-reopened-marks.png');
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  // Durable invariants across the whole mark journey.
  assert.deepEqual(await readUsage(acct.token),usage0,'marking and saving reviews changes no cumulative usage');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the mark journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'review marks render no celebration');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'review marks render no acknowledgement leaf');
  assert.deepEqual(dialogs.map(d=>d.type),['confirm'],'only the one reload confirmation appeared as a dialog');
  await fs.writeFile(new URL('mk1-receipt.json',out),JSON.stringify({record:ack.id,preEtag:pre.etag,compEtag,finalEtag:post.etag,browserPatches:patchCount(rec),finalIfMatch:rec.patch[1].headers['if-match'],savedFlags:post.mock.reviews.map(q=>({key:`${q.section}:${Number(q.number)}`,reviewed:q.reviewed,confirmed:q.confirmed})),usage:usage0,storageWrites:0},null,2));
  checkClean(rec,'mk1-desktop');
  // Mobile 390: the same per-row marks exist and seed from the actual
  // saved flags (no second save from mobile; presentation-only check).
  const {p:pm,rec:recm}=await openPage(390);
  pm.on('request',attachPatchObserver(recm));
  await connectHistoryHarness(pm,acct);
  await goHistory(pm);
  await pm.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
  await waitHistRows(pm,1);
  await openRowById(pm,ack.id);
  await waitDetail(pm);
  await pm.locator('[data-account-history="edit-reviews"]').click();
  await pm.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await pm.locator('[data-account-history="edit-mark"]').count(),3,'the mobile editor exposes the same explicit per-question marks');
  assert.deepEqual(await mk1Marks(pm),{'VR:1':true,'QR:2':false,'DM:3':true},'the mobile controls seed from the actual saved flags');
  assert.equal(patchCount(recm),0,'the mobile mark-view journey sends zero PATCH');
  await shot(pm,'shot-390-mk1-marks.png');
  assert.equal(await pm.evaluate(()=>window.__uicHistWrites),0,'the mobile journey adds zero browser-local storage writes');
  checkClean(recm,'mk1-mobile');
 }catch(e){await captureFailure(p,'mk1');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-mk1-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-lb1-append ──
// lb1 (extension contract §Vertical 3 labels step; addition semantics note
// §§1/4/6): native per-question Question type select (blank legal, catalogue
// values verbatim from /catalogue.js types[q.section]) and existing
// section-catalogue Error reasons checkboxes (reasons[q.section], SJT renders
// none) plus the conditional Other free text, with the EXACT existing
// browser-local semantics (app.js reviewChange ≈694–700): type change never
// re-renders and mirrors confirmed=!!reviewed; reason toggle dedups via
// [...new Set([...q.reasons,value])] / filter, mirrors confirmed and
// re-renders; the Other field shows only when a reason lowercases to 'other'
// and its stored text is never erased by hiding; editing/typing labels NEVER
// marks reviewed. All edits ride the editor-owned clone until the explicit
// Save; zero writes before it; Cancel discards; a genuine 412 retains the
// whole label draft; the confirmed reload reseeds from the ACTUAL store; the
// single final full-array PATCH persists exact type/reasons/other with every
// untouched field, legacy reason value and opaque property verbatim; a fresh
// reopen reads them back. The newly imported /catalogue.js is proven served
// with its pinned bytes by a narrow response/hash receipt (the inherited t9
// binding omits it).
const LB1_TYPE='LB1 typed thinking 4t6 never marks';
const LB1_OTHER_SAVED='LB1 saved other reason 1p9';
const LB1_OTHER_DRAFT='LB1 other draft 3s7';
const LB1_COMP='LB1 competing saved text 6r9 that refuses the lb1 save';
const LB1_VR_KB='Incomplete Statements';
const LB1_CATALOGUE_SHA='72fac8c9a16d4ae5c1d1f2b03fdf2ba8fc71fa8dfae5b3ce3c10c3ef7ced57b5';
const LB1_CANON_D={section:'DM',number:'3',format:'guided',thinking:'',instead:'',free:'',type:'Syllogisms',reasons:['Guess'],other:'',reviewed:false,confirmed:false};
// The label journey's fixture: a SJT-recorded mock with a saved labelled
// reviewed QR free row (including a legacy non-catalogue reason value that
// must survive untouched), an unlabelled guided VR row carrying an opaque
// extra property, and a reviewed SJT row that must render NO reason controls.
async function commitLabelled(token){
 const d=draft();d.title='Fictional label mock';d.provider='Fictional label provider';d.note=DETAIL_NOTE;
 d.sjt={earned:'10',max:'20'};
 d.reviews=[
  {section:'VR',number:'1',format:'guided',thinking:DETAIL_THINKING,instead:'',free:'',type:'',reasons:[],other:'',reviewed:false,confirmed:false,extra:'legacy opaque key 7k1'},
  {section:'QR',number:'2',format:'free',thinking:'',instead:'',free:DETAIL_FREE,type:'Data Interpretation',reasons:['Misread Question','other','Legacy reason 9z2'],other:LB1_OTHER_SAVED,reviewed:true,confirmed:true},
  {section:'SJT',number:'3',format:'guided',thinking:'',instead:'',free:'',type:'Appropriateness',reasons:[],other:'',reviewed:true,confirmed:true}];
 const r=await fetch(base+'/api/mocks/commit',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify(d)});
 const b=await r.json();if(![200,201].includes(r.status))harness(`labelled commit failed ${r.status} ${JSON.stringify(b)}`);return b;
}
const lb1Type=(p,section,number)=>p.locator(`[data-account-history="edit-type"][data-section="${section}"][data-number="${number}"]`);
const lb1Types=async p=>{const rows=await p.evaluate(()=>Array.from(document.querySelectorAll('[data-account-history="edit-type"]')).map(s=>[`${s.dataset.section}:${Number(s.dataset.number)}`,s.value]));return Object.fromEntries(rows);};
const lb1ReasonSel=(p,section,number,reason)=>p.locator(`[data-account-history="edit-reason"][data-section="${section}"][data-number="${number}"][data-reason="${reason}"]`);
const lb1Reasons=async p=>{
 const rows=await p.evaluate(()=>Array.from(document.querySelectorAll('[data-account-history="edit-reason"]')).map(c=>[`${c.dataset.section}:${Number(c.dataset.number)}`,{reason:c.dataset.reason,checked:c.checked}]));
 const o={};for(const [k,v] of rows){if(v.checked)(o[k]??=[]).push(v.reason);}
 return o;};
const lb1Other=(p,section,number)=>p.locator(`[data-account-history="edit-other"][data-section="${section}"][data-number="${number}"]`);
const lb1Marks=async p=>{const rows=await p.evaluate(()=>Array.from(document.querySelectorAll('[data-account-history="edit-mark"]')).map(c=>[`${c.dataset.section}:${Number(c.dataset.number)}`,c.checked]));return Object.fromEntries(rows);};
async function lb1DraftJourney(p,keyboard){
 // VR type through real keyboard arrows on the focused native select.
 if(keyboard){
  await lb1Type(p,'VR','1').press('ArrowDown');
  await lb1Type(p,'VR','1').press('ArrowDown');
 }else await lb1Type(p,'VR','1').selectOption(LB1_VR_KB);
 // VR catalogue reason 'Other' shows the conditional Other text field.
 await lb1ReasonSel(p,'VR','1','Other').click();
 await lb1Other(p,'VR','1').click();
 await p.keyboard.press('Control+a');
 await p.keyboard.type(LB1_OTHER_DRAFT);
 // QR toggles ride the native label click: add Guess, hide the stored Other,
 // re-show it with its stored text intact (hiding never erases).
 await p.locator('label[data-account-history="edit-reason-label"][data-section="QR"][data-number="2"]').filter({hasText:'Guess'}).click();
 await lb1ReasonSel(p,'QR','2','other').click();
 assert.equal(await lb1Other(p,'QR','2').count(),0,'unchecking a lowercase-other reason hides the Other field');
 await lb1ReasonSel(p,'QR','2','other').click();
 assert.equal(await lb1Other(p,'QR','2').inputValue(),LB1_OTHER_SAVED,'re-showing the Other field restores the stored text verbatim');
 await keyboardEdit(p,'VR','1','thinking',LB1_TYPE);
 // AD1 adder row rides the same draft with its own label controls.
 await p.locator('[data-account-history="add-section"]').selectOption('DM');
 await p.locator('[data-account-history="add-number"]').fill('3');
 await p.locator('[data-account-history="edit-add"]').click();
 await p.waitForSelector('[data-account-history="edit-type"][data-section="DM"][data-number="3"]',{timeout:15000});
 await lb1Type(p,'DM','3').selectOption('Syllogisms');
 await lb1ReasonSel(p,'DM','3','Guess').click();
}

test('review edit: lb1 the saved editor exposes native per-question type selects and catalogue reason checkboxes with the conditional Other text mirroring the existing browser-local semantics, typing toggling and label edits never mark or write, Cancel discards the label draft, a genuine 412 retains labels plus typed text plus marks plus the added row, and one versioned Save after the confirmed reload persists exact type/reasons/other with legacy reasons and opaque keys verbatim that a fresh desktop and mobile reopen reads back while the newly imported catalogue module is proven served with its pinned bytes',async()=>{
 const acct=await account();
 const ack=await commitLabelled(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 const bodies=[];
 p.on('request',r=>{if(r.method()==='PATCH')bodies.push(r.postData());});
 p.removeAllListeners('dialog');
 const dialogs=[];
 let dialogResponse='dismiss';
 p.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});if(dialogResponse==='accept')await d.accept();else await d.dismiss();});
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 // Shim installed AFTER the legitimate navigation write (accepted convention).
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  // EVIDENCE FIRST: the editor exactly as the unchanged source renders it,
  // captured BEFORE the missing-behavior assertion.
  await fs.writeFile(new URL('lb1-editor-open-receipt.json',out),JSON.stringify({record:ack.id,preEtag:pre.etag,savedLabels:pre.mock.reviews.map(q=>({key:`${q.section}:${Number(q.number)}`,type:q.type,reasons:q.reasons,other:q.other,reviewed:q.reviewed}))},null,2));
  await shot(p,'shot-1440-lb1-editor-open.png');
  // PRIMARY MISSING-BEHAVIOR RED against the unchanged product source: one
  // native question-type select per existing saved row.
  assert.equal(await p.locator('[data-account-history="edit-type"]').count(),3,'the editor must expose one native question-type select for each existing row');
  assert.equal(await p.locator('[data-account-history="edit-reason"]').count(),15,'existing rows carry the catalogue reason checkboxes (VR 7 + QR 8, SJT none)');
  // Narrow served-bytes receipt for the newly imported catalogue module (the
  // inherited t9 binding omits /catalogue.js; this is the required receipt).
  const catR=await fetch(base+'/catalogue.js');
  const catB=Buffer.from(await catR.arrayBuffer());
  assert.equal(catR.status,200,'the newly imported catalogue module must actually be served');
  assert.equal(sha(catB),LB1_CATALOGUE_SHA,'served /catalogue.js bytes must equal the pinned catalogue source');
  await fs.writeFile(new URL('lb1-catalogue-served-receipt.json',out),JSON.stringify({url:'/catalogue.js',status:catR.status,sha256:sha(catB),expected:LB1_CATALOGUE_SHA},null,2));
  // Native labels: the type select and the Other field carry real for=
  // associations; reason checkboxes are wrapped by native labels.
  assert.ok(await p.evaluate(()=>{const l=document.querySelector('label[for="uic-type-VR-1"]');const s=document.getElementById(l?.htmlFor);return s?.dataset.accountHistory==='edit-type';}),'the question-type select carries a native for= label');
  assert.equal(await lb1ReasonSel(p,'QR','2','other').evaluate(c=>c.type),'checkbox','reason controls are native checkboxes');
  // Seed from the ACTUAL saved record: blank is legal and shown for the
  // unlabelled VR row, the saved QR/SJT types are selected, and only
  // catalogue-matching saved reasons are checked.
  assert.deepEqual(await lb1Types(p),{'VR:1':'','QR:2':'Data Interpretation','SJT:3':'Appropriateness'},'type selects seed from the saved type with blank legal');
  assert.deepEqual(await lb1Reasons(p),{'QR:2':['Misread Question','other']},'reason checkboxes seed from the saved catalogue reasons; the legacy non-catalogue value stays an untouched stored value');
  assert.equal(await p.locator('label[data-account-history="edit-reason-label"][data-section="SJT"]').count(),0,'the SJT row renders no error-reason controls');
  assert.match(await p.locator('[data-account-history="edit-no-reasons"]').textContent(),/SJT has no error-reason labels/,'the existing SJT no-reasons copy is reused');
  assert.equal(await lb1Other(p,'QR','2').count(),1,'the lowercase-other saved reason shows the conditional Other field');
  assert.equal(await lb1Other(p,'QR','2').inputValue(),LB1_OTHER_SAVED,'the Other field seeds its stored text');
  // Full draft journey on the unchanged-after-RED surface path.
  await lb1DraftJourney(p,true);
  assert.equal(await lb1Type(p,'VR','1').inputValue(),LB1_VR_KB,'the keyboard-driven native select shows the chosen catalogue type');
  assert.deepEqual(await lb1Types(p),{'VR:1':LB1_VR_KB,'QR:2':'Data Interpretation','SJT:3':'Appropriateness','DM:3':'Syllogisms'},'the type state survives every reason-toggle rerender');
  assert.deepEqual(await lb1Reasons(p),{'VR:1':['Other'],'QR:2':['Misread Question','Guess','other'],'DM:3':['Guess']},'the deduped reason toggles show on the controls across rerenders');
  assert.equal(await lb1Other(p,'VR','1').inputValue(),LB1_OTHER_DRAFT,'the conditional Other text field holds the typed draft');
  assert.equal(await lb1Other(p,'DM','3').count(),0,'a row without an other reason shows no Other field');
  // Labels are not marks (approved exact semantics) and nothing writes early.
  assert.deepEqual(await lb1Marks(p),{'VR:1':false,'QR:2':true,'SJT:3':true,'DM:3':false},'type/reason/other edits never mark or unmark a question');
  assert.equal(patchCount(rec),0,'label editing sends zero requests before the explicit Save');
  const mid=await readItem(ack.id,acct.token);
  assert.deepEqual(mid.mock,pre.mock,'unsubmitted label edits never touch the actual store');
  assert.equal(mid.etag,pre.etag,'the version is unchanged by an unsubmitted label draft');
  await shot(p,'shot-1440-lb1-labelled-draft.png');
  // Cancel discards the whole label draft: the reopened editor reseeds from
  // the saved record with the addition gone.
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  assert.equal(patchCount(rec),0,'Cancel before dispatch sends zero PATCH');
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await p.locator('[data-account-history="edit-type"]').count(),3,'Cancel discards the added row (no fourth type select on reopen)');
  assert.deepEqual(await lb1Types(p),{'VR:1':'','QR:2':'Data Interpretation','SJT:3':'Appropriateness'},'the reopened editor reseeds types from the saved record');
  assert.deepEqual(await lb1Reasons(p),{'QR:2':['Misread Question','other']},'the reopened editor reseeds reasons from the saved record');
  assert.equal(await p.locator('[data-account-history="edit-field"][data-section="VR"][data-number="1"][data-field="thinking"]').inputValue(),DETAIL_THINKING,'Cancel discards the typing too');
  // REAL competing writer over the accepted direct-HTTP seam: the next
  // browser Save meets a genuine 412.
  const wr=structuredClone(pre.mock.reviews);wr[1].thinking='';wr[1].free=LB1_COMP;
  const r1=await fetch(base+'/api/mocks/reviews?id='+encodeURIComponent(ack.id),{method:'PATCH',headers:{'content-type':'application/json',authorization:'Bearer '+acct.token,'if-match':pre.etag},body:JSON.stringify({reviews:wr}),credentials:'omit',cache:'no-store'});
  assert.equal(r1.status,200,'the competing writer PATCH genuinely succeeds: '+r1.status);
  const compEtag=r1.headers.get('etag');
  assert.ok(compEtag&&compEtag!==pre.etag,'the competing write advanced the strong version');
  // Re-apply the label draft on the reopened editor, then Save into the 412.
  await lb1DraftJourney(p,false);
  await p.locator('[data-account-history="edit-save"]').click();
  await p.waitForSelector('[data-account-history="edit-conflict"]',{timeout:15000});
  assert.equal(patchCount(rec),1,'the conflict Save is the only browser PATCH so far (the competing write was Node-side direct HTTP)');
  // The owned save-refusal retains labels + typed text + marks + the add.
  assert.deepEqual(await lb1Types(p),{'VR:1':LB1_VR_KB,'QR:2':'Data Interpretation','SJT:3':'Appropriateness','DM:3':'Syllogisms'},'the genuine 412 retains every type selection verbatim');
  assert.deepEqual(await lb1Reasons(p),{'VR:1':['Other'],'QR:2':['Misread Question','Guess','other'],'DM:3':['Guess']},'the 412 retains every reason checkbox state');
  assert.equal(await lb1Other(p,'VR','1').inputValue(),LB1_OTHER_DRAFT,'the 412 retains the typed Other draft');
  assert.equal(await lb1Other(p,'QR','2').inputValue(),LB1_OTHER_SAVED,'the 412 retains the stored Other text');
  assert.equal(await p.locator('[data-account-history="edit-field"][data-section="VR"][data-number="1"][data-field="thinking"]').inputValue(),LB1_TYPE,'the 412 retains the typed thinking text');
  assert.deepEqual(await lb1Marks(p),{'VR:1':false,'QR:2':true,'SJT:3':true,'DM:3':false},'the 412 retains every mark state');
  assert.equal(patchCount(rec),1,'no automatic resend after the 412');
  const compStore=await readItem(ack.id,acct.token);
  assert.equal(compStore.etag,compEtag,'the current version stays the competing write until an explicit reload save');
  assert.equal(compStore.mock.reviews.length,3,'the unsaved label draft persisted nothing');
  assert.equal(compStore.mock.reviews[1].free,LB1_COMP,'the stored reviews remain the competitor content (no silent overwrite)');
  await shot(p,'shot-1440-lb1-conflict-retained.png');
  // Native-confirmed reload reseeds from the ACTUAL store and discards the
  // draft (existing re4/re5 confirmed-discard semantics unchanged).
  dialogResponse='accept';
  await p.locator('[data-account-history="edit-reload"]').click();
  // Page-context predicate: the literal is inlined (re4 convention) — Node
  // constants are not visible inside evaluate.
  await p.waitForFunction(()=>{const t=document.querySelector('[data-account-history="edit-field"][data-section="QR"][data-number="2"][data-field="free"]');return !!t&&t.value==='LB1 competing saved text 6r9 that refuses the lb1 save';},{timeout:15000});
  assert.equal(await p.locator('[data-account-history="edit-type"]').count(),3,'the successful confirmed reload discards the added row');
  assert.deepEqual(await lb1Types(p),{'VR:1':'','QR:2':'Data Interpretation','SJT:3':'Appropriateness'},'the reloaded editor reseeds types from the ACTUAL saved record');
  // Re-apply the full label draft on the current version and Save: exactly
  // one further full-array PATCH with the reloaded exact ETag.
  await lb1DraftJourney(p,false);
  await p.locator('[data-account-history="edit-save"]').click();
  await waitDetail(p);
  assert.equal(patchCount(rec),2,'the post-reload Save is exactly one further PATCH');
  assert.equal(rec.patch[1].headers['if-match'],compEtag,'the final PATCH carries the reloaded exact current ETag');
  assert.equal(bodies.length,2,'both browser PATCH bodies were genuinely observed');
  const parsed=JSON.parse(bodies[1]);
  assert.deepEqual(Object.keys(parsed).sort(),['reviews'],'the PATCH body carries ONLY reviews');
  assert.ok(Array.isArray(parsed.reviews)&&parsed.reviews.length===4,'the PATCH is a full-array replacement including the added row');
  const post=await readItem(ack.id,acct.token);
  assert.notEqual(post.etag,compEtag,'the server-owned revision advanced exactly once more by the single final PATCH');
  // Stored labels: exact type/reasons/other, confirmed mirrored ONLY where
  // already reviewed, legacy reason value and opaque key verbatim.
  const expected=structuredClone(compStore.mock);
  expected.reviews[0].thinking=LB1_TYPE;expected.reviews[0].type=LB1_VR_KB;expected.reviews[0].reasons=['Other'];expected.reviews[0].other=LB1_OTHER_DRAFT;
  expected.reviews[0].reviewed=false;expected.reviews[0].confirmed=false;
  expected.reviews[1].reasons=['Misread Question','Legacy reason 9z2','Guess','other'];
  expected.reviews[1].reviewed=true;expected.reviews[1].confirmed=true;
  expected.reviews.push(LB1_CANON_D);
  assert.deepEqual(post.mock,expected,'the stored array carries the exact edited labels with the competitor text, legacy reason value, opaque key, unchanged SJT row and every immutable mock field verbatim');
  // A fresh authorised reopen reads the saved labels back onto the controls.
  await p.locator('[data-account-history="back"]').click();
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.deepEqual(await lb1Types(p),{'VR:1':LB1_VR_KB,'QR:2':'Data Interpretation','SJT:3':'Appropriateness','DM:3':'Syllogisms'},'a fresh reopen reads the saved types back onto the controls');
  assert.deepEqual(await lb1Reasons(p),{'VR:1':['Other'],'QR:2':['Misread Question','Guess','other'],'DM:3':['Guess']},'a fresh reopen reads the saved reasons back in catalogue order');
  assert.equal(await lb1Other(p,'VR','1').inputValue(),LB1_OTHER_DRAFT,'a fresh reopen reads the typed Other text back');
  assert.equal(await p.locator('label[data-account-history="edit-reason-label"][data-section="SJT"]').count(),0,'the reopened SJT row still renders no reason controls');
  await shot(p,'shot-1440-lb1-reopened-labels.png');
  assert.equal(patchCount(rec),2,'viewing the reopened labels sends zero further PATCH');
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  // Durable invariants across the whole label journey.
  assert.deepEqual(await readUsage(acct.token),usage0,'label editing and saving reviews changes no cumulative usage');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the label journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'review labels render no celebration');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'review labels render no acknowledgement leaf');
  assert.deepEqual(dialogs.map(d=>d.type),['confirm'],'only the one reload confirmation appeared as a dialog');
  await fs.writeFile(new URL('lb1-receipt.json',out),JSON.stringify({record:ack.id,preEtag:pre.etag,compEtag,finalEtag:post.etag,browserPatches:patchCount(rec),finalIfMatch:rec.patch[1].headers['if-match'],savedLabels:post.mock.reviews.map(q=>({key:`${q.section}:${Number(q.number)}`,type:q.type,reasons:q.reasons,other:q.other,reviewed:q.reviewed,confirmed:q.confirmed})),catalogueServedSha:sha(catB),usage:usage0,storageWrites:0},null,2));
  checkClean(rec,'lb1-desktop');
  // Mobile 390: the same controls exist and seed from the actual saved
  // labels (no second save from mobile; presentation-only check).
  const {p:pm,rec:recm}=await openPage(390);
  pm.on('request',attachPatchObserver(recm));
  await connectHistoryHarness(pm,acct);
  await goHistory(pm);
  await pm.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
  await waitHistRows(pm,1);
  await openRowById(pm,ack.id);
  await waitDetail(pm);
  await pm.locator('[data-account-history="edit-reviews"]').click();
  await pm.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await pm.locator('[data-account-history="edit-type"]').count(),4,'the mobile editor exposes the same per-row type selects');
  assert.deepEqual(await lb1Types(pm),{'VR:1':LB1_VR_KB,'QR:2':'Data Interpretation','SJT:3':'Appropriateness','DM:3':'Syllogisms'},'the mobile type selects seed from the actual saved types');
  assert.deepEqual(await lb1Reasons(pm),{'VR:1':['Other'],'QR:2':['Misread Question','Guess','other'],'DM:3':['Guess']},'the mobile reason checkboxes seed from the actual saved reasons');
  assert.equal(await pm.locator('label[data-account-history="edit-reason-label"][data-section="SJT"]').count(),0,'the mobile SJT row renders no reason controls');
  assert.equal(await lb1Other(pm,'QR','2').inputValue(),LB1_OTHER_SAVED,'the mobile editor shows the stored Other text');
  assert.equal(patchCount(recm),0,'the mobile label-view journey sends zero PATCH');
  await shot(pm,'shot-390-lb1-labels.png');
  assert.equal(await pm.evaluate(()=>window.__uicHistWrites),0,'the mobile journey adds zero browser-local storage writes');
  checkClean(recm,'lb1-mobile');
 }catch(e){await captureFailure(p,'lb1');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-lb1-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-lb2-append ──
// lb2 (labels extension §uncertainty seam; re6/l2 existing-correct semantics
// REUSED, no product change): a saved labelled mock edited through the REAL
// type select, catalogue reason checkboxes, conditional Other text and the
// reflection fields, then explicitly Saved. The PATCH genuinely COMMITS on
// the real backend: the route forwards it through route.fetch and the actual
// 200 acknowledgement plus a FULL direct store readback carrying the expected
// edited content AND the advanced ETag are validated BEFORE the LABELLED
// CONTROLLED malformed 503 replaces the acknowledgement in flight —
// browser-layer fault injection, never a backend-outage claim. Requirements
// proved: the uncertain editor renders truthful cannot-confirm copy and every
// label control (type select, reason checkbox, Other textarea, mark checkbox,
// review text fields) plus Save and Cancel is disabled; LABELLED TEST-BOUNDARY
// synthetic change/input events dispatched directly on the disabled label
// controls force genuine handler entry and cannot mutate the frozen submitted
// attempt (a plain click()/typing on a disabled control would be vacuous); no
// automatic resend; the explicit Retry re-sends the EXACT captured If-Match
// and byte-identical payload and the REAL identical-replay branch settles with
// a genuine 200 WITHOUT a revision bump; the full store equals the
// pre-replacement readback exactly; a fresh reopen reads the submitted labels
// back onto the controls; cumulative usage and the durable browser-local blob
// stay byte-unchanged with no celebration or acknowledgement leaf.
const LB2_TYPE='LB2 frozen thinking 8q2 stays locked';
const LB2_OTHER='LB2 other draft 6x4 frozen with the attempt';
const LB2_FREE='LB2 frozen reflection 5v1 submitted under 503';

test('review edit: lb2 saved type, reasons, Other and reflection edits stay frozen after a real committed PATCH loses its acknowledgement: the uncertain editor disables every label, mark, text, Save and Cancel control, labelled synthetic events dispatched on the disabled label controls cannot mutate the frozen attempt, and the explicit Retry re-sends the byte-identical payload with the exact original If-Match which the real replay branch settles with a 200 without another revision bump or debit, leaving the full store unchanged and a fresh reopen showing the submitted labels',async()=>{
 const acct=await account();
 const ack=await commitLabelled(acct.token);
 const pre=await readItem(ack.id,acct.token);
 const usage0=await readUsage(acct.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 const bodies=[];
 p.on('request',r=>{if(r.method()==='PATCH')bodies.push(r.postData());});
 const respSeen=[];
 p.on('response',r=>{if(r.url().startsWith(base+'/api/mocks/reviews'))respSeen.push({status:r.status(),etag:r.headers()['etag']});});
 p.removeAllListeners('dialog');
 const dialogs=[];
 let dialogResponse='accept';
 p.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});if(dialogResponse==='accept')await d.accept();else await d.dismiss();});
 await connectHistoryHarness(p,acct);
 await goHistory(p);
 // Shim installed AFTER the legitimate navigation write (accepted convention).
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 // LABELLED fault injection ONLY in 'inject' mode: the REAL PATCH is
 // forwarded upstream via route.fetch and its actual acknowledgement plus a
 // FULL direct store readback (complete mock AND advanced ETag) are validated
 // BEFORE the controlled malformed 503 replaces the response in flight.
 // Every other PATCH passes untouched to the real backend.
 let patchMode='off';const injects=[];
 await p.route(base+'/api/mocks/reviews?*',async route=>{
  const req=route.request();
  if(patchMode==='inject'){
   patchMode='off';
   const resp=await route.fetch();
   const text=await resp.text();
   const ev={label:'controlled-503-fault-injection-after-real-commit (browser-layer fixture, NOT a backend outage)',ifMatch:req.headers()['if-match'],postData:req.postData(),upstreamStatus:resp.status(),upstreamBody:text,upstreamEtag:resp.headers()['etag']};
   if(resp.status()!==200){injects.push(ev);await route.fulfill({status:resp.status(),headers:{'content-type':'application/json; charset=utf-8','etag':resp.headers()['etag']??''},body:text});return;}
   const storeBefore=await readItem(ack.id,acct.token);
   ev.storeReadbackBeforeReplacement={etag:storeBefore.etag,mock:storeBefore.mock};
   injects.push(ev);
   await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'storage_unavailable'})});
   return;
  }
  await route.continue();
 });
 const uncertainCopy=async()=>p.locator('[data-account-history="edit-uncertain"]').textContent();
 const labelState=async()=>({types:await lb1Types(p),reasons:await lb1Reasons(p),marks:await lb1Marks(p),vrOther:await lb1Other(p,'VR','1').inputValue(),vrThinking:await editField(p,'VR','1','thinking').inputValue(),qrFree:await editField(p,'QR','2','free').inputValue()});
 const expectedLabelState={types:{'VR:1':LB1_VR_KB,'QR:2':'Data Interpretation','SJT:3':'Appropriateness'},reasons:{'VR:1':['Other'],'QR:2':['Misread Question','Guess','other']},marks:{'VR:1':false,'QR:2':true,'SJT:3':true},vrOther:LB2_OTHER,vrThinking:LB2_TYPE,qrFree:LB2_FREE};
 try{
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  // ── Phase 1: real label edits through the real controls, then Save.
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await lb1Type(p,'VR','1').selectOption(LB1_VR_KB);
  await lb1ReasonSel(p,'VR','1','Other').click();
  await lb1Other(p,'VR','1').click();
  await p.keyboard.press('Control+a');
  await p.keyboard.type(LB2_OTHER);
  await p.locator('label[data-account-history="edit-reason-label"][data-section="QR"][data-number="2"]').filter({hasText:'Guess'}).click();
  await keyboardEdit(p,'VR','1','thinking',LB2_TYPE);
  await keyboardEdit(p,'QR','2','free',LB2_FREE);
  assert.deepEqual(await labelState(),expectedLabelState,'the draft label state is staged on the real controls before Save');
  patchMode='inject';
  await p.locator('[data-account-history="edit-save"]').click();
  {const t0=Date.now();while(!injects.length){if(Date.now()-t0>15000)harness('the injected PATCH never reached the browser route');await new Promise(r=>setTimeout(r,50));}}
  assert.equal(injects[0].upstreamStatus,200,'the original PATCH genuinely committed on the real backend: '+injects[0].upstreamStatus);
  assert.ok(/^"review-\d+"$/.test(String(injects[0].upstreamEtag)),'the real commit returned a strong version');
  assert.notEqual(injects[0].upstreamEtag,pre.etag,'the real commit advanced the server revision');
  assert.equal(injects[0].ifMatch,pre.etag,'the submitted PATCH carried the exact captured original version');
  const rb=injects[0].storeReadbackBeforeReplacement;
  assert.equal(rb.etag,injects[0].upstreamEtag,'the direct readback version equals the real acknowledgement version BEFORE the controlled replacement');
  const savedVR=rb.mock.reviews.find(q=>q.section==='VR');
  const savedQR=rb.mock.reviews.find(q=>q.section==='QR');
  const savedSJT=rb.mock.reviews.find(q=>q.section==='SJT');
  assert.equal(savedVR.type,LB1_VR_KB,'the ACTUAL store already carries the submitted VR type');
  assert.deepEqual(savedVR.reasons,['Other'],'the ACTUAL store carries the submitted VR reasons');
  assert.equal(savedVR.other,LB2_OTHER,'the ACTUAL store carries the submitted Other text');
  assert.equal(savedVR.thinking,LB2_TYPE,'the ACTUAL store carries the submitted thinking');
  assert.equal(savedVR.reviewed,false,'a label edit never marked the VR row');
  assert.equal(savedVR.confirmed,false,'confirmed mirrors the unreviewed VR row');
  assert.equal(savedVR.extra,'legacy opaque key 7k1','the VR row keeps its opaque property verbatim');
  assert.deepEqual(savedQR.reasons,['Misread Question','other','Legacy reason 9z2','Guess'],'the ACTUAL store carries the deduped submitted QR reasons with the legacy value verbatim');
  assert.equal(savedQR.free,LB2_FREE,'the ACTUAL store carries the submitted reflection');
  assert.equal(savedQR.other,LB1_OTHER_SAVED,'the QR Other text stays its stored value');
  assert.equal(savedQR.reviewed,true,'the previously reviewed QR row stays reviewed');
  assert.equal(savedQR.confirmed,true,'confirmed mirrors the reviewed QR row');
  assert.equal(savedSJT.type,'Appropriateness','the SJT row is untouched');
  assert.equal(savedSJT.reviewed,true,'the SJT mark is untouched');
  // ── Phase 2: uncertainty freezes the whole attempt, every control.
  await p.waitForSelector('[data-account-history="edit-uncertain"]',{timeout:15000});
  const copy=await uncertainCopy();
  assert.ok(/confirm/i.test(copy),'the uncertain copy states the outcome could not be confirmed: '+copy);
  assert.ok(!/could not be saved|was not saved|not saved|no changes were saved/i.test(copy),'the uncertain copy makes NO definite not-saved claim: '+copy);
  assert.ok(!/has been saved|successfully/i.test(copy),'the uncertain copy makes NO saved claim: '+copy);
  for(const raw of ['503','storage_unavailable','Error','error'])assert.ok(!copy.includes(raw),'the uncertain copy is sanitized with no raw transport detail: '+copy);
  assert.equal(await editField(p,'VR','1','thinking').inputValue(),LB2_TYPE,'the frozen submitted thinking stays visible and locked');
  assert.equal(await editField(p,'QR','2','free').inputValue(),LB2_FREE,'the frozen submitted reflection stays visible and locked');
  assert.equal(await lb1Other(p,'VR','1').inputValue(),LB2_OTHER,'the frozen submitted Other text stays visible and locked');
  {const s=await p.evaluate(()=>({types:Array.from(document.querySelectorAll('[data-account-history="edit-type"]')).every(c=>c.disabled),typeCount:document.querySelectorAll('[data-account-history="edit-type"]').length,reasons:Array.from(document.querySelectorAll('[data-account-history="edit-reason"]')).every(c=>c.disabled),reasonCount:document.querySelectorAll('[data-account-history="edit-reason"]').length,others:Array.from(document.querySelectorAll('[data-account-history="edit-other"]')).every(c=>c.disabled),otherCount:document.querySelectorAll('[data-account-history="edit-other"]').length,marks:Array.from(document.querySelectorAll('[data-account-history="edit-mark"]')).every(c=>c.disabled),markCount:document.querySelectorAll('[data-account-history="edit-mark"]').length,fields:Array.from(document.querySelectorAll('[data-account-history="edit-field"]')).every(c=>c.disabled),fieldCount:document.querySelectorAll('[data-account-history="edit-field"]').length,save:document.querySelector('[data-account-history="edit-save"]')?.disabled,cancel:document.querySelector('[data-account-history="edit-cancel"]')?.disabled,back:document.querySelector('[data-account-history="back"]')?.disabled}));
  assert.equal(s.typeCount,3,'three type selects are rendered on the frozen attempt');
  assert.ok(s.types,'every type select is disabled while the outcome is uncertain');
  assert.equal(s.reasonCount,15,'every catalogue reason checkbox is rendered on the frozen attempt');
  assert.ok(s.reasons,'every reason checkbox is disabled while the outcome is uncertain');
  assert.equal(s.otherCount,2,'both conditional Other textareas are rendered (VR draft + QR stored)');
  assert.ok(s.others,'every Other text field is disabled while the outcome is uncertain');
  assert.equal(s.markCount,3,'every mark checkbox is rendered on the frozen attempt');
  assert.ok(s.marks,'every mark checkbox is disabled while the outcome is uncertain');
  assert.equal(s.fieldCount,9,'every review text field is rendered on the frozen attempt');
  assert.ok(s.fields,'every review text field is disabled while the outcome is uncertain');
  assert.equal(s.save,true,'Save is disabled while the outcome is uncertain');
  assert.equal(s.cancel,true,'Cancel is disabled while the outcome is uncertain');
  assert.equal(s.back,false,'Back/departure invalidation stays available while uncertain');}
  assert.equal(await p.locator('[data-account-history="edit-retry-uncertain"]').count(),1,'the explicit captured-attempt Retry control is offered');
  const frozenState=await labelState();
  const itemGetCount=()=>rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length;
  const getsAtFreeze=itemGetCount();
  // ── Phase 3: LABELLED TEST-BOUNDARY synthetic event dispatch on the
  // DISABLED label controls. A disabled control never receives user events,
  // so click()/typing would be vacuous: input/change events are dispatched
  // EXPLICITLY, forcing genuine handler entry. The product uncertainty guard
  // must refuse, so the frozen submitted attempt cannot be mutated: visible
  // values, the later retry payload and the store stay byte-identical.
  await p.evaluate(()=>{
   window.__lb2Synthetic={types:0,reasons:0,others:0,marks:0,fields:0};
   const fire=(sel,key)=>{for(const el of document.querySelectorAll(sel)){window.__lb2Synthetic[key]++;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}};
   fire('[data-account-history="edit-type"]','types');
   fire('[data-account-history="edit-reason"]','reasons');
   fire('[data-account-history="edit-other"]','others');
   fire('[data-account-history="edit-mark"]','marks');
   fire('[data-account-history="edit-field"]','fields');
  });
  assert.ok(await p.evaluate(()=>window.__lb2Synthetic.types===3&&window.__lb2Synthetic.reasons===15&&window.__lb2Synthetic.others===2&&window.__lb2Synthetic.marks===3&&window.__lb2Synthetic.fields===9),'the labelled synthetic dispatch genuinely entered every disabled label control kind (non-vacuous precondition)');
  await p.evaluate(()=>{for(const n of ['edit-save','edit-cancel']){const el=document.querySelector(`[data-account-history="${n}"]`);el?.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
  await settle(400);
  assert.deepEqual(await labelState(),frozenState,'synthetic events on the disabled label controls cannot mutate the frozen submitted attempt');
  assert.equal(await p.locator('[data-account-history="edit-uncertain"]').count(),1,'the uncertainty state survives the synthetic dispatch');
  assert.equal(patchCount(rec),1,'the synthetic dispatch sends zero automatic PATCH');
  assert.equal(rec.api.filter(u=>u.includes('/api/mocks/reviews')).length,1,'the synthetic dispatch adds zero review-route requests');
  assert.equal(itemGetCount(),getsAtFreeze,'the synthetic dispatch adds zero GET traffic');
  const duringFreeze=await readItem(ack.id,acct.token);
  assert.deepEqual(duringFreeze.mock,rb.mock,'the full store is unchanged by the synthetic dispatch on the disabled controls');
  assert.equal(duringFreeze.etag,rb.etag,'the version is unchanged by the synthetic dispatch');
  // EVIDENCE: the error/uncertain state is captured BEFORE the Retry.
  await shot(p,'shot-1440-lb2-uncertain-labels-locked.png');
  await fs.writeFile(new URL('lb2-frozen-attempt-receipt.json',out),JSON.stringify({stableId:ack.id,capturedVersion:pre.etag,upstreamCommitEtag:injects[0].upstreamEtag,injectEvent:injects[0],frozenState,synthetic:await p.evaluate(()=>window.__lb2Synthetic),browserPatchesAtFreeze:patchCount(rec)},null,2));
  // ── Phase 4: explicit Retry — real identical replay, no revision bump.
  await p.locator('[data-account-history="edit-retry-uncertain"]').click();
  await p.waitForSelector('[data-account-history="detail"]',{timeout:15000});
  assert.equal(patchCount(rec),2,'the explicit Retry sent exactly one further PATCH');
  assert.equal(rec.patch[1].headers['if-match'],pre.etag,'the retry carries the EXACT original captured version, never a refreshed one');
  assert.equal(bodies[1],bodies[0],'the retry payload is byte-identical to the original submitted payload');
  assert.ok(bodies[0].includes(LB2_FREE)&&bodies[0].includes(LB2_OTHER)&&bodies[0].includes(LB2_TYPE),'the original payload carried the full frozen label attempt');
  const settledResp=respSeen[respSeen.length-1];
  assert.equal(settledResp.status,200,'the real backend settles the identical retry with a genuine 200: '+settledResp.status);
  assert.equal(settledResp.etag,injects[0].upstreamEtag,'the identical retry does NOT bump the revision (accepted verified-content replay branch)');
  const afterRetry=await readItem(ack.id,acct.token);
  assert.deepEqual(afterRetry.mock,duringFreeze.mock,'the full store is unchanged by the settling replay');
  assert.deepEqual(afterRetry.mock,rb.mock,'the settled store equals the pre-replacement proof readback exactly');
  assert.equal(afterRetry.etag,injects[0].upstreamEtag,'the confirmed version stays the one the real commit returned — no second revision');
  assert.equal(await p.locator('[data-account-history="edit-uncertain"]').count(),0,'a real acknowledgement ends the uncertainty');
  // ── Phase 5: fresh reopen shows the submitted labels on the controls.
  await p.locator('[data-account-history="back"]').click();
  await waitHistRows(p,1);
  await openRowById(p,ack.id);
  await waitDetail(p);
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.deepEqual(await labelState(),expectedLabelState,'a fresh reopen reads the submitted type, reasons, Other and reflection back onto the controls');
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  assert.equal(patchCount(rec),2,'the reopen journey adds zero further PATCH');
  // Durable invariants across the whole uncertainty journey.
  assert.deepEqual(await readUsage(acct.token),usage0,'a frozen label attempt and its replay consume no allowance and no debit');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'no celebration from the frozen label attempt');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'no acknowledgement leaf from the frozen label attempt');
  assert.deepEqual(dialogs,[],'no native dialog belongs to this journey (no reload was needed once the replay settled)');
  await fs.writeFile(new URL('lb2-retry-settlement-receipt.json',out),JSON.stringify({stableId:ack.id,capturedVersion:pre.etag,upstreamCommitVersion:injects[0].upstreamEtag,retryIfMatch:rec.patch[1].headers['if-match'],retryBodyIdentical:bodies[1]===bodies[0],retrySettleStatus:settledResp.status,retrySettleEtag:settledResp.etag,storeEtagAfterRetry:afterRetry.etag,storeMatchesPreReplacementProof:JSON.stringify(afterRetry.mock)===JSON.stringify(rb.mock),browserPatches:patchCount(rec),usage:usage0,storageWrites:0},null,2));
  checkClean(rec,'lb2');
  await shot(p,'shot-1440-lb2-reopened-submitted-labels.png');
 }catch(e){await captureFailure(p,'lb2');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-lb2-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-lb3-append ──
// lb3 (labels extension §stale-owner isolation; re3/l2/lb1 existing-correct
// semantics REUSED, no product change): a saved labelled mock under fictional
// account A builds a first real editor draft using the ACTUAL type select,
// catalogue reason checkboxes (the conditional Other must exist), the mark
// checkbox and the thinking field; the live label control ELEMENT references
// are captured; a real Cancel detaches them; a fresh Edit over the SAME record
// proves the cancelled unsubmitted draft is NOT revived, then stages
// DIFFERENT current draft values on the current controls. LABELLED
// TEST-BOUNDARY changed-value dispatch: each retained DISCONNECTED control is
// first set to a DIFFERENT valid catalogue/text/boolean value (before/
// attempted/after values, attempted read-back and isConnected are recorded per
// kind for non-vacuity evidence), then real bubbling input/change events fire,
// plus click() dispatches on the retained old Save/Cancel. Dispatch counts
// evidence attempted event dispatch on genuine listener targets, not
// independent instrumentation of product-handler internals. Requirements
// proved under the current A surface: the current editor and every current
// control are the SAME connected element instances, the staged current draft
// is byte-identical, and the census adds zero browser API requests, zero
// client updateReviews invocations (transparent l2Connect wrapper), zero PATCH,
// zero store/ETag movement. Then a REAL session A→B replacement through the
// supported setAccount API while B owns its OWN labelled record (distinct
// literal id — commitLabelled allocates a fresh id per call; no shared-id
// claim): B's editor opens with a distinct B draft; the retained A controls
// dispatch changed values AGAIN under B; B's current owner id/surface/draft
// stay real and intact, no A draft, stale value or A-derived marker renders,
// zero additional requests, both direct stores/ETags and both usages unchanged.
// Finally a fresh A re-entry proves the cancelled AND abandoned unsubmitted A
// drafts never revive — the editor re-seeds only from the actual store.
// Existing correct isolation is labelled coverage, not a manufactured RED.
const LB3_A1_THINK='LB3 A first-draft thinking 4k8 discarded by Cancel';
const LB3_A1_OTHER='LB3 A first-draft other 9p2 discarded by Cancel';
const LB3_A2_THINK='LB3 A current draft thinking 6t3 must survive stale controls';
const LB3_A2_OTHER='LB3 A current draft other 1w7 must survive stale controls';
const LB3_B_THINK='LB3 B current draft thinking 5r9 must survive stale A controls';
const LB3_B_OTHER='LB3 B current draft other 2h6 must survive stale A controls';
const LB3_STALE='LB3 stale detached control value 3d5 must never reach the product or the other account';
const LB3_TYPE_STALE_A='Reading Comprehension';
const LB3_TYPE_STALE_B="True / False / Can't Tell";
test('review edit: lb3 retained disconnected type, reason, Other, mark and text controls captured from a cancelled first editor and activated with changed-value labelled dispatches plus old Save/Cancel clicks cannot mutate or replace the reopened current A draft, a replaced owner B editor with its own labelled record, or either account store: current control identity and staged draft content stay byte-intact with zero browser requests, zero client invocations and zero PATCH, the cancelled and abandoned unsubmitted A drafts never revive on fresh A re-entry, and both accounts direct stores, ETags and usage stay unchanged',async()=>{
 const a=await account();
 const b=await account();
 const ackA=await commitLabelled(a.token);
 const ackB=await commitLabelled(b.token);
 assert.notEqual(ackA.id,ackB.id,'B owns its OWN labelled record (distinct literal id explicitly)');
 const preA=await readItem(ackA.id,a.token);
 const preB=await readItem(ackB.id,b.token);
 const usageA0=await readUsage(a.token);
 const usageB0=await readUsage(b.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 p.removeAllListeners('dialog');
 const dialogs=[];
 p.on('dialog',async d=>{dialogs.push({type:d.type()});await d.accept();});
 const connected=await l2Connect(p,a);
 assert.ok(connected.connected&&connected.signedInUid===a.uid,'the lb3 wrapped-client controller must be connected under owner A');
 await goHistory(p);
 // Shim installed AFTER the legitimate navigation write (accepted convention).
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 await p.evaluate(()=>{window.__lb3Stale=[];});
 const lb3State=async()=>({types:await lb1Types(p),reasons:await lb1Reasons(p),marks:await lb1Marks(p),vrOther:await lb1Other(p,'VR','1').inputValue(),vrThinking:await editField(p,'VR','1','thinking').inputValue(),qrFree:await editField(p,'QR','2','free').inputValue()});
 const census=async()=>{const o=await p.evaluate(()=>window.__uicHistoryHarness.obs.map(e=>({...e})));return{api:rec.api.length,patch:patchCount(rec),itemGets:rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length,reviewRoute:rec.api.filter(u=>u.includes('/api/mocks/reviews')).length,clientCalls:o.length};};
 // LABELLED TEST-BOUNDARY: set every retained DISCONNECTED A control to a
 // DIFFERENT valid value (test-only detached-DOM manipulation; production code
 // and current surfaces are never touched), then fire real bubbling input/
 // change events, plus click() dispatches on the retained old Save/Cancel.
 const staleDispatch=(label,attempts)=>p.evaluate(({label,attempts})=>{
  const el=window.__lb3A;const out={label,attempts,controls:{}};
  const step=(key,node,prop,attempted)=>{const c={isConnected:node.isConnected,before:node[prop]};node[prop]=attempted;c.attemptedReadBack=node[prop];node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));out.controls[key]=c;};
  step('type',el.type,'value',attempts.type);
  step('reason',el.reason,'checked',attempts.reasonChecked);
  step('other',el.other,'value',attempts.other);
  step('mark',el.mark,'checked',attempts.markChecked);
  step('field',el.field,'value',attempts.thinking);
  for(const k of ['save','cancel']){const c={isConnected:el[k].isConnected,beforeDisabled:el[k].disabled};el[k].dispatchEvent(new MouseEvent('click',{bubbles:true}));out.controls[k]=c;}
  window.__lb3Stale.push(out);return out;
 },{label,attempts});
 const captureCurrent=()=>p.evaluate(()=>{const q=s=>document.querySelector(s);const c={editor:q('[data-account-history="editor"]'),type:q('[data-account-history="edit-type"][data-section="VR"][data-number="1"]'),reason:q('[data-account-history="edit-reason"][data-section="VR"][data-number="1"][data-reason="Missed Qualifier"]'),other:q('[data-account-history="edit-other"][data-section="VR"][data-number="1"]'),mark:q('[data-account-history="edit-mark"][data-section="VR"][data-number="1"]'),field:q('[data-account-history="edit-field"][data-section="VR"][data-number="1"][data-field="thinking"]'),save:q('[data-account-history="edit-save"]'),cancel:q('[data-account-history="edit-cancel"]')};for(const k of Object.keys(c)){if(!c[k])throw new Error('lb3 harness: missing current control '+k);if(!c[k].isConnected)throw new Error('lb3 harness: current control '+k+' not connected');}window.__lb3Cur=c;});
 const currentIdentity=()=>p.evaluate(()=>{const out={};for(const k of Object.keys(window.__lb3Cur)){out[k]=window.__lb3Cur[k].isConnected&&document.querySelector('[data-account-history="editor"]')===window.__lb3Cur.editor&&((k==='editor')||window.__lb3Cur[k].closest('[data-account-history="editor"]')!==null);}return out;});
 try{
  await waitHistRows(p,1);
  await openRowById(p,ackA.id);
  await waitDetail(p);
  // ── Phase 1: A first draft through the REAL label controls; retain the
  // ACTUAL mounted element references; a real Cancel detaches them.
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await lb1Type(p,'VR','1').selectOption(LB1_VR_KB);
  await lb1ReasonSel(p,'VR','1','Other').click();
  assert.equal(await lb1Other(p,'VR','1').count(),1,'the conditional Other control exists on the first A draft');
  await lb1Other(p,'VR','1').click();
  await p.keyboard.press('Control+a');
  await p.keyboard.type(LB3_A1_OTHER);
  await lb1ReasonSel(p,'VR','1','Guess').click();
  await p.locator('[data-account-history="edit-mark"][data-section="VR"][data-number="1"]').click();
  await keyboardEdit(p,'VR','1','thinking',LB3_A1_THINK);
  await p.evaluate(()=>{const q=s=>document.querySelector(s);const c={type:q('[data-account-history="edit-type"][data-section="VR"][data-number="1"]'),reason:q('[data-account-history="edit-reason"][data-section="VR"][data-number="1"][data-reason="Guess"]'),other:q('[data-account-history="edit-other"][data-section="VR"][data-number="1"]'),mark:q('[data-account-history="edit-mark"][data-section="VR"][data-number="1"]'),field:q('[data-account-history="edit-field"][data-section="VR"][data-number="1"][data-field="thinking"]'),save:q('[data-account-history="edit-save"]'),cancel:q('[data-account-history="edit-cancel"]')};for(const k of Object.keys(c)){if(!c[k])throw new Error('lb3 harness: missing live first-draft control '+k);if(!c[k].isConnected)throw new Error('lb3 harness: first-draft control '+k+' not connected at capture');}window.__lb3A=c;window.__lb3A.beforeCancel={type:c.type.value,reason:c.reason.checked,other:c.other.value,mark:c.mark.checked,field:c.field.value};});
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  const detached=await p.evaluate(()=>{const o={};for(const[k,el]of Object.entries(window.__lb3A)){if(el instanceof Element)o[k]=document.contains(el)===false;}return o;});
  assert.deepEqual(detached,{type:true,reason:true,other:true,mark:true,field:true,save:true,cancel:true},'every retained A control is genuinely DISCONNECTED after the real Cancel (test-boundary precondition)');
  assert.equal(patchCount(rec),0,'Cancel sends zero PATCH');
  // ── Phase 2: fresh Edit over the SAME record — the cancelled unsubmitted
  // draft is NOT revived; then DIFFERENT current draft values are staged.
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  const reseed=await p.evaluate(()=>({type:document.querySelector('[data-account-history="edit-type"][data-section="VR"][data-number="1"]').value,thinking:document.querySelector('[data-account-history="edit-field"][data-section="VR"][data-number="1"][data-field="thinking"]').value}));
  assert.equal(reseed.type,'','the reopened VR type re-seeds blank from the actual store, never the cancelled draft');
  assert.equal(reseed.thinking,DETAIL_THINKING,'the reopened thinking re-seeds the actual stored text');
  await lb1Type(p,'VR','1').selectOption(LB1_VR_KB);
  await lb1ReasonSel(p,'VR','1','Other').click();
  await lb1Other(p,'VR','1').click();
  await p.keyboard.press('Control+a');
  await p.keyboard.type(LB3_A2_OTHER);
  await lb1ReasonSel(p,'VR','1','Missed Qualifier').click();
  await p.locator('[data-account-history="edit-mark"][data-section="VR"][data-number="1"]').click();
  await keyboardEdit(p,'VR','1','thinking',LB3_A2_THINK);
  const stagedA2=await lb3State();
  assert.equal(stagedA2.vrThinking,LB3_A2_THINK,'distinct current A draft thinking staged on the current control');
  assert.equal(stagedA2.vrOther,LB3_A2_OTHER,'distinct current A draft Other staged on the current control');
  assert.equal(stagedA2.types['VR:1'],LB1_VR_KB,'distinct current A draft type staged on the current control');
  assert.deepEqual(stagedA2.reasons['VR:1'],['Missed Qualifier','Other'],'distinct current A draft reasons staged on the current controls (catalogue DOM order)');
  assert.equal(stagedA2.marks['VR:1'],true,'distinct current A draft mark staged on the current control');
  assert.notEqual(stagedA2.vrThinking,LB3_A1_THINK,'the staged current draft differs from the cancelled first draft');
  await captureCurrent();
  const beforeA=await census();
  const recA=await staleDispatch('under current A editor after Cancel+reopen',{type:LB3_TYPE_STALE_A,reasonChecked:false,other:LB3_STALE+' (A)',markChecked:false,thinking:LB3_STALE+'-think-A'});
  await settle(400);
  const afterA=await census();
  assert.deepEqual(await currentIdentity(),{editor:true,type:true,reason:true,other:true,mark:true,field:true,save:true,cancel:true},'the current A editor and every current control are the SAME connected element instances after the stale changed-value dispatch (a guard failure that re-rendered or replaced the surface would fail here)');
  assert.deepEqual(await lb3State(),stagedA2,'the staged current A draft content is byte-identical after the stale changed-value dispatch');
  assert.ok(!(await p.evaluate(()=>document.body.innerText)).includes(LB3_STALE),'the stale detached-control values never render');
  assert.deepEqual(afterA,beforeA,'the stale dispatch under A added zero API requests, zero PATCH, zero review-route GETs and zero client invocations');
  const storeA1=await readItem(ackA.id,a.token);
  assert.deepEqual(storeA1.mock,preA.mock,'the A store is byte-unchanged by the stale dispatch');
  assert.equal(storeA1.etag,preA.etag,'the A version is unchanged by the stale dispatch');
  assert.equal(recA.controls.type.isConnected,false,'non-vacuity: the changed-value dispatch genuinely targeted a DISCONNECTED old type control');
  assert.notEqual(recA.controls.type.before,LB3_TYPE_STALE_A,'non-vacuity: the attempted stale type value differs from the captured before value');
  await shot(p,'shot-1440-lb3-a-current-draft-intact.png');
  // ── Phase 3: REAL session replacement A→B while B owns its own labelled
  // record; stage B\u2019s distinct draft; dispatch the retained A controls again.
  await histSwitch(p,b);
  await waitHistRows(p,1);
  const bState=await p.evaluate(()=>window.__uicHistoryHarness.session.getState());
  assert.equal(bState.uid,b.uid,'the SAME live session now verifies the fresh REAL account B');
  assert.ok((await p.evaluate(()=>window.__uicHistoryHarness.events.slice())).includes('signed-in:'+b.uid),'the real session published signed-in for B through the existing connection');
  await openRowById(p,ackB.id);
  await waitDetail(p);
  assert.equal(await p.locator(detailSel).getAttribute('data-account-history-id'),ackB.id,'B detail carries B\u2019s own literal record id');
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await p.locator('[data-account-history="editor"]').getAttribute('data-account-history-id'),ackB.id,'the B editor surface carries B\u2019s own literal record id');
  await lb1Type(p,'VR','1').selectOption(LB1_VR_KB);
  await lb1ReasonSel(p,'VR','1','Other').click();
  await lb1Other(p,'VR','1').click();
  await p.keyboard.press('Control+a');
  await p.keyboard.type(LB3_B_OTHER);
  await keyboardEdit(p,'VR','1','thinking',LB3_B_THINK);
  const stagedB=await lb3State();
  assert.equal(stagedB.vrThinking,LB3_B_THINK,'distinct B draft thinking staged on B\u2019s current controls');
  assert.notEqual(stagedB.vrOther,stagedA2.vrOther,'B\u2019s staged draft differs from A\u2019s staged draft');
  await captureCurrent();
  const beforeB=await census();
  // Non-vacuity across BOTH phases: the phase-B attempted booleans differ
  // from the values the phase-A dispatch left on the detached controls
  // (reasonChecked/markChecked were set false under A, now attempted true;
  // the receipt records before/attempted per kind per phase).
  const recB=await staleDispatch('under replaced owner B',{type:LB3_TYPE_STALE_B,reasonChecked:true,other:LB3_STALE+' (B)',markChecked:true,thinking:LB3_STALE+'-think-B'});
  await settle(400);
  const afterB=await census();
  const identB=await p.evaluate(()=>({editor:window.__lb3Cur.editor.isConnected&&document.querySelector('[data-account-history="editor"]')===window.__lb3Cur.editor}));
  assert.equal(identB.editor,true,'B\u2019s current editor is still the connected mounted surface after the A-control dispatch under B');
  assert.equal(await p.locator('[data-account-history="editor"]').getAttribute('data-account-history-id'),ackB.id,'the current owner surface still carries B\u2019s literal id (retained A controls cannot hijack ownership)');
  assert.deepEqual(await lb3State(),stagedB,'B\u2019s distinct current draft is byte-intact after the retained A controls dispatched changed values under B');
  const bodyText=await p.evaluate(()=>document.body.innerText);
  for(const m of [LB3_A1_THINK,LB3_A1_OTHER,LB3_A2_THINK,LB3_A2_OTHER,LB3_STALE])assert.ok(!bodyText.includes(m),'no A draft or stale dispatch value may surface under B: '+JSON.stringify(m));
  assert.deepEqual(afterB,beforeB,'the stale dispatch under B added zero API requests, zero PATCH, zero review-route GETs and zero client invocations');
  const storeA2=await readItem(ackA.id,a.token);
  assert.deepEqual(storeA2.mock,preA.mock,'A\u2019s direct store is byte-unchanged across the B phase');
  assert.equal(storeA2.etag,preA.etag,'A\u2019s ETag is unchanged across the B phase');
  const storeB2=await readItem(ackB.id,b.token);
  assert.deepEqual(storeB2.mock,preB.mock,'B\u2019s direct store is byte-unchanged by the stale dispatch');
  assert.equal(storeB2.etag,preB.etag,'B\u2019s ETag is unchanged by the stale dispatch');
  assert.equal(patchCount(rec),0,'the whole journey sends zero PATCH');
  await shot(p,'shot-1440-lb3-under-b-stale-dispatch-intact.png');
  // ── Phase 4: fresh A re-entry — cancelled AND abandoned unsubmitted A
  // drafts never revive; the editor re-seeds only from the actual store.
  await histSwitch(p,a);
  await waitHistRows(p,1);
  await openRowById(p,ackA.id);
  await waitDetail(p);
  const aDetail=await p.locator('[data-account-history="detail-review"]').allTextContents();
  for(const m of [LB3_A1_THINK,LB3_A1_OTHER,LB3_A2_THINK,LB3_A2_OTHER,LB3_STALE,LB3_B_THINK,LB3_B_OTHER])assert.ok(!aDetail.some(t=>t.includes(m)),'no unsubmitted or foreign draft may appear in A\u2019s fresh detail: '+JSON.stringify(m));
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  const reseedFinal=await p.evaluate(()=>({id:document.querySelector('[data-account-history="editor"]').dataset.accountHistoryId,type:document.querySelector('[data-account-history="edit-type"][data-section="VR"][data-number="1"]').value,thinking:document.querySelector('[data-account-history="edit-field"][data-section="VR"][data-number="1"][data-field="thinking"]').value,reasonsChecked:Array.from(document.querySelectorAll('[data-account-history="edit-reason"]')).filter(c=>c.checked&&c.dataset.section==='VR').length,mark:document.querySelector('[data-account-history="edit-mark"][data-section="VR"][data-number="1"]').checked}));
  assert.equal(reseedFinal.id,ackA.id,'the fresh A editor owns A\u2019s literal id');
  assert.equal(reseedFinal.type,'','the fresh A editor re-seeds the blank stored VR type; cancelled/abandoned draft values never revive');
  assert.equal(reseedFinal.thinking,DETAIL_THINKING,'the fresh A editor re-seeds the actual stored thinking');
  assert.equal(reseedFinal.reasonsChecked,0,'the cancelled and abandoned A reason toggles never revive');
  assert.equal(reseedFinal.mark,false,'the abandoned A mark toggle never revives');
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  // Durable invariants across the whole isolation journey.
  assert.deepEqual(await readUsage(a.token),usageA0,'account A usage is unchanged (no debit from stale controls)');
  assert.deepEqual(await readUsage(b.token),usageB0,'account B usage is unchanged');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'no celebration from stale control dispatch');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'no acknowledgement leaf from stale control dispatch');
  assert.deepEqual(dialogs,[],'no native dialog belongs to this journey');
  await fs.writeFile(new URL('lb3-stale-label-control-receipt.json',out),JSON.stringify({stableIdA:ackA.id,stableIdB:ackB.id,controlKindsCovered:['type','reason','other','mark','field','save','cancel'],dispatchNote:'counted changed-value dispatches evidence attempted event dispatch on genuine listener targets, not independent instrumentation of product-handler internals',staleDispatches:await p.evaluate(()=>window.__lb3Stale),capturedBeforeCancel:await p.evaluate(()=>window.__lb3A.beforeCancel),stagedA2,stagedB,census:{beforeA,afterA,beforeB,afterB},storeEtagsA:[preA.etag,storeA1.etag,storeA2.etag],storeEtagsB:[preB.etag,storeB2.etag],usageA:usageA0,usageB:usageB0,finalPatchCount:patchCount(rec)},null,2));
  checkClean(rec,'lb3');
  await shot(p,'shot-1440-lb3-a-reentered-seeded-from-store.png');
 }catch(e){await captureFailure(p,'lb3');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-lb3-append ──
// ── BEGIN ui-cloud-account-review-edit-safety-lb4-append ──
// lb4 (labels extension §stale-owner isolation, DIRECT active-editor switch
// origin; lb3/re3/l2 existing-correct semantics REUSED, no product change):
// the accepted lb3 evidence challenged controls that an explicit Cancel had
// ALREADY detached before the A→B replacement. This case proves the other
// invalidation origin: type/reason/Other/mark/thinking/Save/Cancel control
// ELEMENT references captured while the A editor is STILL MOUNTED and
// CONNECTED (proven connected at capture and immediately before the switch),
// then a REAL session A→B replacement through the supported setAccount API
// with NO Cancel click at all. Requirements proved: the switch itself
// disconnects every retained A reference; the SAME live session verifiably
// publishes signed-in for B (positive replacement-owner identity); B owns its
// OWN distinct-literal-id labelled record and its editor mounts with a
// distinct current draft; changed-value labelled dispatches (real bubbling
// input/change events plus Save/Cancel click dispatches, each control first
// set to a value DIFFERENT from the one the disconnected node still carries)
// on the retained A controls add ZERO client updateReviews invocations
// (transparent l2Connect wrapper), ZERO PATCH, ZERO API requests and move
// ZERO store bytes: B current editor element identity and staged draft stay
// byte-intact, both accounts' direct stores, ETags and usage stay unchanged,
// no browser-local storage write and no durable blob movement happens, and a
// fresh A re-entry re-seeds only the ACTUAL saved truth — the abandoned
// unsubmitted A draft never revives. Dispatch counts evidence attempted event
// delivery on genuine listener targets, not instrumented product-handler
// entry. Existing correct isolation is labelled coverage, not a manufactured
// RED.
const LB4_A_THINK='LB4 A active-editor thinking 8m2 abandoned by the direct switch';
const LB4_A_OTHER='LB4 A active-editor other 5j4 abandoned by the direct switch';
const LB4_B_THINK='LB4 B current draft thinking 3v6 must survive stale A controls';
const LB4_B_OTHER='LB4 B current draft other 7q1 must survive stale A controls';
const LB4_STALE='LB4 stale retained-control value 2n8 must never reach the product or account B';
const LB4_TYPE_STALE='Reading Comprehension';
test('review edit: lb4 connected type, reason, Other, mark, thinking and Save/Cancel control references captured from a still-mounted active A editor, invalidated only by a direct account switch with no Cancel, cannot mutate or replace the B owner: the switch positively disconnects every retained reference, B signs in with its own distinct-id labelled record and staged draft, changed-value labelled dispatches against the retained A controls add zero client invocations, zero PATCH and zero API requests while both accounts direct stores, ETags and usage, the current B element identity and live draft, and all browser-local state stay byte-unchanged, and a fresh A re-entry reseeds only the saved truth with the abandoned A draft never reviving',async()=>{
 const a=await account();
 const b=await account();
 const ackA=await commitLabelled(a.token);
 const ackB=await commitLabelled(b.token);
 assert.notEqual(ackA.id,ackB.id,'B owns its OWN labelled record (distinct literal id explicitly)');
 const preA=await readItem(ackA.id,a.token);
 const preB=await readItem(ackB.id,b.token);
 const usageA0=await readUsage(a.token);
 const usageB0=await readUsage(b.token);
 const {p,rec}=await openPage(1440);
 p.on('request',attachPatchObserver(rec));
 p.removeAllListeners('dialog');
 const dialogs=[];
 p.on('dialog',async d=>{dialogs.push({type:d.type()});await d.accept();});
 const connected=await l2Connect(p,a);
 assert.ok(connected.connected&&connected.signedInUid===a.uid,'the lb4 wrapped-client controller must be connected under owner A');
 await goHistory(p);
 // Shim installed AFTER the legitimate navigation write (accepted convention).
 await p.evaluate(()=>{window.__uicHistWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(...a){window.__uicHistWrites++;return set.apply(this,a)}});
 const origStored=await p.evaluate(k=>localStorage.getItem(k),KEY);
 await p.evaluate(()=>{window.__lb4Stale=[];});
 const lb4State=async()=>({types:await lb1Types(p),reasons:await lb1Reasons(p),marks:await lb1Marks(p),vrOther:await lb1Other(p,'VR','1').inputValue(),vrThinking:await editField(p,'VR','1','thinking').inputValue(),qrFree:await editField(p,'QR','2','free').inputValue()});
 const census=async()=>{const o=await p.evaluate(()=>window.__uicHistoryHarness.obs.map(e=>({...e})));return{api:rec.api.length,patch:patchCount(rec),itemGets:rec.api.filter(u=>u.includes('/api/mocks/item?id=')).length,reviewRoute:rec.api.filter(u=>u.includes('/api/mocks/reviews')).length,clientCalls:o.length};};
 // LABELLED TEST-BOUNDARY: set every retained control (now disconnected by
 // the direct switch) to a value DIFFERENT from the one it still carries,
 // fire real bubbling input/change events, then click-dispatch the retained
 // old Save/Cancel. before/attempted read-back and isConnected are recorded
 // per kind for non-vacuity evidence.
 const staleDispatch=(label,attempts)=>p.evaluate(({label,attempts})=>{
  const el=window.__lb4A;const out={label,attempts,controls:{}};
  const step=(key,node,prop,attempted)=>{const c={isConnected:node.isConnected,before:node[prop]};node[prop]=attempted;c.attemptedReadBack=node[prop];node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));out.controls[key]=c;};
  step('type',el.type,'value',attempts.type);
  step('reason',el.reason,'checked',attempts.reasonChecked);
  step('other',el.other,'value',attempts.other);
  step('mark',el.mark,'checked',attempts.markChecked);
  step('field',el.field,'value',attempts.thinking);
  for(const k of ['save','cancel']){const c={isConnected:el[k].isConnected,beforeDisabled:el[k].disabled};el[k].dispatchEvent(new MouseEvent('click',{bubbles:true}));out.controls[k]=c;}
  window.__lb4Stale.push(out);return out;
 },{label,attempts});
 const captureCurrent=()=>p.evaluate(()=>{const q=s=>document.querySelector(s);const c={editor:q('[data-account-history="editor"]'),type:q('[data-account-history="edit-type"][data-section="VR"][data-number="1"]'),reason:q('[data-account-history="edit-reason"][data-section="VR"][data-number="1"][data-reason="Other"]'),other:q('[data-account-history="edit-other"][data-section="VR"][data-number="1"]'),mark:q('[data-account-history="edit-mark"][data-section="VR"][data-number="1"]'),field:q('[data-account-history="edit-field"][data-section="VR"][data-number="1"][data-field="thinking"]'),save:q('[data-account-history="edit-save"]'),cancel:q('[data-account-history="edit-cancel"]')};for(const k of Object.keys(c)){if(!c[k])throw new Error('lb4 harness: missing current control '+k);if(!c[k].isConnected)throw new Error('lb4 harness: current control '+k+' not connected');}window.__lb4Cur=c;});
 const currentIdentity=()=>p.evaluate(()=>{const out={};for(const k of Object.keys(window.__lb4Cur)){out[k]=window.__lb4Cur[k].isConnected&&document.querySelector('[data-account-history="editor"]')===window.__lb4Cur.editor&&((k==='editor')||window.__lb4Cur[k].closest('[data-account-history="editor"]')!==null);}return out;});
 try{
  await waitHistRows(p,1);
  await openRowById(p,ackA.id);
  await waitDetail(p);
  // ── Phase 1: A editor mounted with a live draft; capture the ACTUAL
  // CONNECTED control references (the lb3 gap: no Cancel happens here).
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  await lb1Type(p,'VR','1').selectOption(LB1_VR_KB);
  await lb1ReasonSel(p,'VR','1','Other').click();
  assert.equal(await lb1Other(p,'VR','1').count(),1,'the conditional Other control exists on the active A draft');
  await lb1Other(p,'VR','1').click();
  await p.keyboard.press('Control+a');
  await p.keyboard.type(LB4_A_OTHER);
  await lb1ReasonSel(p,'VR','1','Guess').click();
  await p.locator('[data-account-history="edit-mark"][data-section="VR"][data-number="1"]').click();
  await keyboardEdit(p,'VR','1','thinking',LB4_A_THINK);
  const stagedA=await lb4State();
  assert.equal(stagedA.vrThinking,LB4_A_THINK,'distinct active A draft thinking staged on the live controls');
  assert.deepEqual(stagedA.reasons['VR:1'],['Guess','Other'],'distinct active A draft reasons staged on the live controls (catalogue DOM order)');
  await p.evaluate(()=>{const q=s=>document.querySelector(s);const c={editor:q('[data-account-history="editor"]'),type:q('[data-account-history="edit-type"][data-section="VR"][data-number="1"]'),reason:q('[data-account-history="edit-reason"][data-section="VR"][data-number="1"][data-reason="Other"]'),other:q('[data-account-history="edit-other"][data-section="VR"][data-number="1"]'),mark:q('[data-account-history="edit-mark"][data-section="VR"][data-number="1"]'),field:q('[data-account-history="edit-field"][data-section="VR"][data-number="1"][data-field="thinking"]'),save:q('[data-account-history="edit-save"]'),cancel:q('[data-account-history="edit-cancel"]')};const conn={};for(const k of Object.keys(c)){if(!c[k])throw new Error('lb4 harness: missing live active-editor control '+k);conn[k]=c[k].isConnected;}if(Object.values(conn).some(v=>!v))throw new Error('lb4 harness: active-editor control not connected at capture: '+JSON.stringify(conn));window.__lb4A=c;window.__lb4A.connectedAtCapture=conn;window.__lb4A.atCapture={type:c.type.value,reason:c.reason.checked,other:c.other.value,mark:c.mark.checked,field:c.field.value};});
  const preSwitch=await p.evaluate(()=>{const o={};for(const[k,el]of Object.entries(window.__lb4A)){if(el instanceof Element)o[k]=document.contains(el);}return o;});
  assert.deepEqual(preSwitch,{editor:true,type:true,reason:true,other:true,mark:true,field:true,save:true,cancel:true},'non-vacuity: EVERY retained reference is genuinely connected inside the still-active A editor immediately before the direct switch');
  // ── Phase 2: DIRECT A→B replacement through the supported session API.
  // No Cancel click anywhere: the switch alone must invalidate.
  await histSwitch(p,b);
  await waitHistRows(p,1);
  const disconnected=await p.evaluate(()=>{const o={};for(const[k,el]of Object.entries(window.__lb4A)){if(el instanceof Element)o[k]=document.contains(el)===false;}return o;});
  assert.deepEqual(disconnected,{editor:true,type:true,reason:true,other:true,mark:true,field:true,save:true,cancel:true},'the direct account switch itself disconnected every retained A control reference (the second invalidation origin, with no Cancel)');
  const bState=await p.evaluate(()=>window.__uicHistoryHarness.session.getState());
  assert.equal(bState.uid,b.uid,'the SAME live session now verifies the fresh REAL account B');
  assert.ok((await p.evaluate(()=>window.__uicHistoryHarness.events.slice())).includes('signed-in:'+b.uid),'the real session published signed-in for B through the existing connection');
  // ── Phase 3: B owns its own record; open and stage the B editor; then
  // challenge the retained CONNECTED-AT-CAPTURE A controls with DIFFERENT
  // valid values under B.
  await openRowById(p,ackB.id);
  await waitDetail(p);
  assert.equal(await p.locator(detailSel).getAttribute('data-account-history-id'),ackB.id,'B detail carries B own literal record id');
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  assert.equal(await p.locator('[data-account-history="editor"]').getAttribute('data-account-history-id'),ackB.id,'the B editor surface carries B own literal record id');
  await lb1Type(p,'VR','1').selectOption(LB1_VR_KB);
  await lb1ReasonSel(p,'VR','1','Other').click();
  await lb1Other(p,'VR','1').click();
  await p.keyboard.press('Control+a');
  await p.keyboard.type(LB4_B_OTHER);
  await keyboardEdit(p,'VR','1','thinking',LB4_B_THINK);
  const stagedB=await lb4State();
  assert.equal(stagedB.vrThinking,LB4_B_THINK,'distinct B draft thinking staged on B current controls');
  assert.notEqual(stagedB.vrOther,stagedA.vrOther,'B staged draft Other differs from the abandoned A draft');
  assert.notEqual(stagedB.vrThinking,stagedA.vrThinking,'B staged draft thinking differs from the abandoned A draft');
  await captureCurrent();
  const beforeB=await census();
  // Non-vacuity: every attempted value differs from the value the
  // disconnected node still carries from the active A session (recorded in
  // __lb4A.atCapture and re-read as controls.*.before below).
  const recB=await staleDispatch('retained active-editor A controls under replaced owner B',{type:LB4_TYPE_STALE,reasonChecked:false,other:LB4_STALE,markChecked:false,thinking:LB4_STALE+'-think'});
  await settle(400);
  const afterB=await census();
  assert.deepEqual(afterB,beforeB,'the stale dispatch under B added zero API requests, zero PATCH, zero review-route GETs and zero client invocations');
  assert.deepEqual(await currentIdentity(),{editor:true,type:true,reason:true,other:true,mark:true,field:true,save:true,cancel:true},'the current B editor and every current control are the SAME connected element instances after the stale changed-value dispatch');
  assert.equal(await p.locator('[data-account-history="editor"]').getAttribute('data-account-history-id'),ackB.id,'the current owner surface still carries B literal id (retained A controls cannot hijack ownership)');
  assert.deepEqual(await lb4State(),stagedB,'the staged B draft content is byte-identical after the stale changed-value dispatch');
  const bodyText=await p.evaluate(()=>document.body.innerText);
  // CORRECTION 1 (parent-reviewed harness-only fix, assertion-preserving):
  // LB4_TYPE_STALE is a VALID catalogue label: the native select OPTION text
  // contributes to innerText even when unselected, so whole-body absence of a
  // catalogue label is an invalid privacy assertion. Removed from this broad
  // marker list ONLY. The selection-unchanged guarantee stays positively
  // proven by the exact selected-value equality above (lb4State deepEqual
  // stagedB) and the per-kind attemptedReadBack equality below; the unique
  // private marker checks (LB4_A_THINK/LB4_A_OTHER/LB4_STALE) are retained.
  for(const m of [LB4_A_THINK,LB4_A_OTHER,LB4_STALE])assert.ok(!bodyText.includes(m),'no abandoned A value or stale dispatch value may surface under B: '+JSON.stringify(m));
  // CORRECTION 2 (parent-reviewed harness-only fix, assertion-preserving):
  // the staleDispatch attempts payload keys are type/reasonChecked/other/
  // markChecked/thinking; the control-kind keys are type/reason/other/mark/
  // field. Compare before against the ACTUAL attemptedReadBack and verify
  // the read-back equals the explicitly mapped attempted value, so no kind
  // can pass vacuously against undefined.
  const lb4AttemptKey={type:'type',reason:'reasonChecked',other:'other',mark:'markChecked',field:'thinking'};
  for(const k of ['type','reason','other','mark','field']){
   assert.equal(recB.controls[k].isConnected,false,'non-vacuity: the changed-value dispatch targeted a control DISCONNECTED BY THE SWITCH: '+k);
   assert.equal(String(recB.controls[k].attemptedReadBack),String(recB.attempts[lb4AttemptKey[k]]),'non-vacuity: the '+k+' control genuinely took the attempted stale value through the explicit kind-to-payload-key mapping: '+k);
   assert.notEqual(String(recB.controls[k].before),String(recB.controls[k].attemptedReadBack),'non-vacuity: the attempted stale value differs from the value the retained node carried: '+k);
  }
  const storeB1=await readItem(ackB.id,b.token);
  assert.deepEqual(storeB1.mock,preB.mock,'the B store is byte-unchanged by the stale dispatch');
  assert.equal(storeB1.etag,preB.etag,'the B version is unchanged by the stale dispatch');
  const storeA1=await readItem(ackA.id,a.token);
  assert.deepEqual(storeA1.mock,preA.mock,'the A store is byte-unchanged across the direct switch and stale dispatch');
  assert.equal(storeA1.etag,preA.etag,'the A version is unchanged across the direct switch and stale dispatch');
  assert.equal(patchCount(rec),0,'the whole journey sends zero PATCH');
  await shot(p,'shot-1440-lb4-direct-switch-retained-controls-intact-under-b.png');
  // ── Phase 4: fresh A re-entry — the abandoned (never-cancelled) A draft
  // never revives; the editor re-seeds only from the actual store.
  await histSwitch(p,a);
  await waitHistRows(p,1);
  await openRowById(p,ackA.id);
  await waitDetail(p);
  const aDetail=await p.locator('[data-account-history="detail-review"]').allTextContents();
  for(const m of [LB4_A_THINK,LB4_A_OTHER,LB4_STALE,LB4_TYPE_STALE,LB4_B_THINK,LB4_B_OTHER])assert.ok(!aDetail.some(t=>t.includes(m)),'no abandoned or foreign draft text may appear in A fresh detail: '+JSON.stringify(m));
  await p.locator('[data-account-history="edit-reviews"]').click();
  await p.waitForSelector('[data-account-history="edit-save"]',{timeout:15000});
  const reseedFinal=await p.evaluate(()=>({id:document.querySelector('[data-account-history="editor"]').dataset.accountHistoryId,type:document.querySelector('[data-account-history="edit-type"][data-section="VR"][data-number="1"]').value,thinking:document.querySelector('[data-account-history="edit-field"][data-section="VR"][data-number="1"][data-field="thinking"]').value,reasonsChecked:Array.from(document.querySelectorAll('[data-account-history="edit-reason"]')).filter(c=>c.checked&&c.dataset.section==='VR').length,mark:document.querySelector('[data-account-history="edit-mark"][data-section="VR"][data-number="1"]').checked}));
  assert.equal(reseedFinal.id,ackA.id,'the fresh A editor owns A literal id');
  assert.equal(reseedFinal.type,'','the fresh A editor re-seeds the blank stored VR type; the abandoned draft value never revives');
  assert.equal(reseedFinal.thinking,DETAIL_THINKING,'the fresh A editor re-seeds the actual stored thinking');
  assert.equal(reseedFinal.reasonsChecked,0,'the abandoned A reason toggles never revive');
  assert.equal(reseedFinal.mark,false,'the abandoned A mark toggle never revives');
  await p.locator('[data-account-history="edit-cancel"]').click();
  await waitDetail(p);
  // Durable invariants across the whole direct-switch isolation journey.
  assert.deepEqual(await readUsage(a.token),usageA0,'account A usage is unchanged (no debit from stale controls)');
  assert.deepEqual(await readUsage(b.token),usageB0,'account B usage is unchanged');
  assert.equal(await p.evaluate(()=>window.__uicHistWrites),0,'the journey adds zero browser-local storage writes');
  assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),origStored,'the durable browser-local blob stays byte-identical');
  assert.equal(await p.locator('.mock-confetti').count(),0,'no celebration from stale control dispatch');
  assert.equal(await p.locator('#mock-acknowledgement').count(),0,'no acknowledgement leaf from stale control dispatch');
  assert.deepEqual(dialogs,[],'no native dialog belongs to this journey');
  await fs.writeFile(new URL('lb4-stale-active-label-control-receipt.json',out),JSON.stringify({stableIdA:ackA.id,stableIdB:ackB.id,invalidationOrigin:'direct A→B session switch with NO Cancel (the controls were connected at capture; the switch itself disconnected them)',controlKindsCovered:['type','reason','other','mark','field','save','cancel'],dispatchNote:'counted changed-value dispatches evidence attempted event delivery on genuine listener targets, not independent instrumentation of product-handler internals',connectedAtCapture:await p.evaluate(()=>window.__lb4A.connectedAtCapture),atCapture:await p.evaluate(()=>window.__lb4A.atCapture),staleDispatches:await p.evaluate(()=>window.__lb4Stale),stagedA,stagedB,census:{beforeB,afterB},storeEtagsA:[preA.etag,storeA1.etag],storeEtagsB:[preB.etag,storeB1.etag],usageA:usageA0,usageB:usageB0,finalPatchCount:patchCount(rec)},null,2));
  checkClean(rec,'lb4');
  await shot(p,'shot-1440-lb4-a-reentered-seeded-from-store.png');
 }catch(e){await captureFailure(p,'lb4');throw e;}
});
// ── END ui-cloud-account-review-edit-safety-lb4-append ──
