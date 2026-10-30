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
const BASELINE_APP='7c311a811110d3743aa8b2d630a2608e36947a2215068f12db7314522f05b2f0';
const GATE197={
 'account-session.mjs':'ce83695093db59a485ebbcde39e83fd55a0dc88fd85f407e635d46411819f597',
 'mock-client.mjs':'2a6535aca73a8ddb3e27a79bb1c752b0bdaa0518c28dc1ac47b91ff7e3097401',
 'mock-intent.mjs':'ac6d47af52671ddd5fe3cc7e3e250358bc7c5628062b2f48304439c0bcf9760f',
 'approved-domain.mjs':'d9f59b7a5be80624fdede072b6155713928103439e95c950483d26680681e8f7',
 'auth-boundary.mjs':'f7d06e1ddee02c62478abce8569916103bffbf9f7646505d240376dfc2a1ceff',
 'mock-store.mjs':'f6762bfcd97356d852677631eee09f4da95165c8acc82601370184c84adf7955',
 'firebase-verifier.mjs':'43a45889a6bd885d6f59c9dd30bce3935b9b24625c2446e61879e6c99fac238f'};
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
const STAGE_FILES=PHASE==='RED'?['integration-server.js','ui-cloud-account-usage.test.mjs']:['account-access.js','integration-server.js','ui-cloud-account-usage.test.mjs'];
for(const n of STAGE_FILES)
 if(!/^[0-9a-f]{64}$/.test(stagePins[n]||''))harness('missing stage pin for '+n);

// --- Source binding: protected UI baseline (46) + stage-owned new modules.
const uiBaselineBytes=await fs.readFile(BACKEND+'ui-baseline.json');
assert.equal(sha(uiBaselineBytes),UI_BASELINE_FILE_HASH,'backend ui-baseline.json must be the protected 46-entry file');
const uiBaseline=JSON.parse(uiBaselineBytes.toString());
assert.equal(Object.keys(uiBaseline).length,46);
assert.equal(uiBaseline['app.js'],BASELINE_APP,'baseline app pin must be the accepted current app bytes');
const snapshot=async()=>{const o={};for(const n of Object.keys(uiBaseline))o[n]=sha(await fs.readFile(STAGE+n));for(const n of STAGE_FILES)o[n]=sha(await fs.readFile(STAGE+n));return o;};
const expectedSnapshot=()=>Object.fromEntries(Object.entries({...uiBaseline,...Object.fromEntries(STAGE_FILES.map(n=>[n,stagePins[n]])),'app.js':APP_PIN}));
{const s=await snapshot(),e=expectedSnapshot();for(const n of Object.keys(e))assert.equal(s[n],e[n],`pre-run source drift: ${n}`);}
for(const [name,digest] of Object.entries(GATE197))assert.equal(sha(await fs.readFile(BACKEND+name)),digest,`backend reference module drift: ${name}`);

process.env.DELTASCORE_INTEGRATION_MODE='demo-emulator';
const {createIntegrationServer}=await import('./integration-server.js');
const integ=await createIntegrationServer({staticRoot:STAGE,projectId:PROJECT,pins:{...GATE197,...(PHASE==='RED'?{}:{'account-access.js':stagePins['account-access.js']})}}).catch(e=>harness('integration server refused to start: '+e.message));
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
 assert.ok((await p.locator('section.settings-section').filter({hasText:'Access'}).locator('p').first().textContent()).includes(LOCAL_ROW),'browser-local usage line must remain unchanged');
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
 assert.ok((await p.locator('section.settings-section').filter({hasText:'Access'}).locator('p').first().textContent()).includes(LOCAL_ROW),'browser-local counter must stay unchanged by account reads');
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
 assert.ok((await p.locator('section.settings-section').filter({hasText:'Access'}).locator('p').first().textContent()).includes(LOCAL_ROW));
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
 const targets={'/index.html':uiBaseline['index.html'],'/styles.css':uiBaseline['styles.css'],'/app.js':APP_PIN,'/backend/account-session.mjs':GATE197['account-session.mjs'],'/backend/mock-client.mjs':GATE197['mock-client.mjs'],'/backend/mock-intent.mjs':GATE197['mock-intent.mjs'],'/backend/approved-domain.mjs':GATE197['approved-domain.mjs'],...(PHASE==='GREEN'?{'/account-access.js':stagePins['account-access.js']}:{})};
 for(const [url,digest] of Object.entries(targets)){
  const r=await fetch(base+url);const b=Buffer.from(await r.arrayBuffer());
  served[url]={status:r.status,sha256:sha(b),expected:digest};
  assert.equal(r.status,200,`served ${url} must be 200`);
  assert.equal(sha(b),digest,`served ${url} bytes must equal the pinned source`);
 }
 // Node-only backend modules, configs and traversal must never be exposed.
 // At RED /account-access.js is also part of the not-served inventory.
 for(const url of ['/auth-boundary.mjs','/mock-store.mjs','/firebase-verifier.mjs','/integration-server.js','/ui-cloud-account-usage.test.mjs','/firebase-all.json','/backend/auth-boundary.mjs','/backend/mock-store.mjs','/backend/firebase-verifier.mjs','/../backend-integration/firebase.json','/..%2fbackend-integration/firebase.json','/SOURCE-MANIFEST.json',...(PHASE==='RED'?['/account-access.js']:[])]){
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
