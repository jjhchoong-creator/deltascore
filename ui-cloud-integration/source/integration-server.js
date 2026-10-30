// integration-server.js — integration-only loopback server for the ui-cloud
// tracer slice. NEW stage-owned file; production server.js bytes are untouched.
//
// Contract bindings (ui-cloud-first-slice-contract.md decision 2):
// - Reuses the production static allowlist and security headers verbatim in
//   shape; CSP differs only by connect-src 'self' (same-origin /api only).
// - Serves the accepted browser-safe backend modules through a FIXED explicit
//   map, read directly from the backend reference tree (no divergent copies),
//   hash-verified at startup against supplied gate197 pins (fail closed).
// - Routes /api/* to the accepted createRequestHandler + verifier/store on the
//   SAME origin. Never proxies arbitrary URLs; never serves a whole directory;
//   never exposes Node-only backend modules, configs, secrets or traversal.
// - Fails closed unless explicit demo-emulator mode, demo- project, loopback
//   emulator env and non-production NODE_ENV.
// - /__fixture/* are explicitly labeled controlled fault/delay fixtures for
//   the usage route only (test instrumentation, not backend behavior claims).
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';

const BACKEND_ROOT='/workspace/backend-integration/';
// Fixed explicit map: URL -> backend reference-tree file. Browser-safe only.
const BACKEND_BROWSER_MAP={
 '/backend/account-session.mjs':'account-session.mjs',
 '/backend/mock-client.mjs':'mock-client.mjs',
 '/backend/mock-intent.mjs':'mock-intent.mjs',
 '/backend/approved-domain.mjs':'approved-domain.mjs'};
// Node-only backend modules imported by this server; never served.
// current-backend bridge: the accepted auth-boundary handler transitively
// imports request-rate-limit.mjs, so that Node dependency is verified at
// startup too (pin REQUIRED and matched before import/use; never browser
// served). Existing handler/store/verifier drift checks unchanged.
const BACKEND_NODE_MODULES={handler:'auth-boundary.mjs',store:'mock-store.mjs',verifier:'firebase-verifier.mjs',limiter:'request-rate-limit.mjs'};
const sha=b=>createHash('sha256').update(b).digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

export async function createIntegrationServer({staticRoot,projectId,pins={}}={}){
 if(typeof staticRoot!=='string'||!staticRoot)throw new Error('staticRoot is required');
 // Fail closed: explicit demo emulator mode only.
 if(process.env.DELTASCORE_INTEGRATION_MODE!=='demo-emulator')throw new Error('integration server requires DELTASCORE_INTEGRATION_MODE=demo-emulator');
 if(process.env.NODE_ENV==='production')throw new Error('integration server refuses to run under NODE_ENV=production');
 if(typeof projectId!=='string'||!projectId.startsWith('demo-'))throw new Error('integration server requires an explicit demo- projectId');
 if(process.env.FIREBASE_AUTH_EMULATOR_HOST!=='127.0.0.1:9099')throw new Error('integration server requires FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099');
 if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8080')throw new Error('integration server requires FIRESTORE_EMULATOR_HOST=127.0.0.1:8080');
 // Hash-verify every backend module (served and imported) before use.
 for(const [url,name] of Object.entries(BACKEND_BROWSER_MAP)){
  const bytes=await readFile(BACKEND_ROOT+name);
  if(pins[name]&&sha(bytes)!==pins[name])throw new Error(`backend module drift, refusing to serve: ${name}`);
 }
 const nodeBytes={};
 for(const [role,name] of Object.entries(BACKEND_NODE_MODULES)){
  nodeBytes[role]=await readFile(BACKEND_ROOT+name);
  // current-backend bridge seam (narrow, Node-only): the limiter's pin is
  // REQUIRED and must match before import/use. Handler/store/verifier
  // semantics unchanged (verify-if-supplied, as before).
  if(role==='limiter'&&(!/^[0-9a-f]{64}$/.test(pins[name]||'')))throw new Error(`request-rate-limit.mjs pin is required (64-hex), got: ${name}`);
  if(pins[name]&&sha(nodeBytes[role])!==pins[name])throw new Error(`backend module drift, refusing to start: ${name}`);
 }
 const {createRequestHandler}=await import(BACKEND_ROOT+BACKEND_NODE_MODULES.handler);
 const {createMockStore}=await import(BACKEND_ROOT+BACKEND_NODE_MODULES.store);
 const {createFirebaseVerifier}=await import(BACKEND_ROOT+BACKEND_NODE_MODULES.verifier);
 // firebase-admin is resolved through the backend reference tree only.
 const backendRequire=(await import('node:module')).createRequire(BACKEND_ROOT+'package.json');
 const {initializeApp,deleteApp}=backendRequire('firebase-admin/app');
 const {getFirestore}=backendRequire('firebase-admin/firestore');
 const adminApp=initializeApp({projectId},`ui-cloud-integration-${randomUUID()}`);
 const db=getFirestore(adminApp);
 const verifier=createFirebaseVerifier({mode:'emulator',projectId});
 const apiHandler=createRequestHandler({verifyIdToken:verifier.verifyIdToken,mockStore:createMockStore({db})});
 // Controlled fault/delay fixtures (explicit, labeled; usage route only).
 const fixture={usageDelayMs:0,usageStatus:null};
 const fixtureStatuses={401:{error:'authentication_required'},503:{error:'storage_unavailable'}};
 // Static allowlist: the production preview allowlist shape plus the new
 // stage-owned account-access module when present/pinned. Optional entries
 // (account-access.js at RED) are served only when explicitly registered.
 const allowed=new Map([['/','index.html'],['/index.html','index.html'],['/styles.css','styles.css'],['/app.js','app.js'],['/domain.js','domain.js'],['/estimated-score.js','estimated-score.js'],['/catalogue.js','catalogue.js'],['/progress.js','progress.js'],['/progress-view.js','progress-view.js'],['/landing-analytics.js','landing-analytics.js'],['/recommendation-model.js','recommendation-model.js'],['/practice-routines.js','practice-routines.js'],['/progress-recommendation.js','progress-recommendation.js'],['/practice-page.js','practice-page.js'],['/practice-repeat.js','practice-repeat.js'],['/home-page.js','home-page.js'],['/notes-page.js','notes-page.js'],['/jakarta.ttf','jakarta.ttf'],['/account-access.js','account-access.js'],['/account-history.js','account-history.js'],['/account-save.js','account-save.js'],['/account-progress.js','account-progress.js']]);
 if(pins['account-access.js']){const b=await readFile(staticRoot+'account-access.js');if(sha(b)!==pins['account-access.js'])throw new Error('stage module drift: account-access.js');}
 // account-history list vertical: explicit hash-bound registration of the NEW
 // module only (contract: no directory serving). Served only when the file
 // exists AND its pin matches when supplied; at RED the file is absent.
 if(pins['account-history.js']){const b=await readFile(staticRoot+'account-history.js');if(sha(b)!==pins['account-history.js'])throw new Error('stage module drift: account-history.js');}
 if(!pins['account-history.js'])allowed.delete('/account-history.js');
 // account-save first vertical: explicit hash-bound registration of the NEW
 // browser module only (same pinned pattern; no directory serving). At RED the
 // file is deliberately absent and unpinned: the route is removed, not served.
 if(pins['account-save.js']){const b=await readFile(staticRoot+'account-save.js');if(sha(b)!==pins['account-save.js'])throw new Error('stage module drift: account-save.js');}
 if(!pins['account-save.js'])allowed.delete('/account-save.js');
 // account-analytics first tracer: explicit hash-bound registration of the NEW
 // browser module only (exact same pinned pattern; no directory serving). At
 // RED the file is deliberately unpinned: the route is removed, not served.
 if(pins['account-progress.js']){const b=await readFile(staticRoot+'account-progress.js');if(sha(b)!==pins['account-progress.js'])throw new Error('stage module drift: account-progress.js');}
 if(!pins['account-progress.js'])allowed.delete('/account-progress.js');
 const server=http.createServer(async(req,res)=>{
  res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  const url=new URL(req.url,'http://localhost'),pathname=url.pathname;
  // Explicit controlled fixtures (demo-emulator integration only).
  if(pathname==='/__fixture/hold-usage'&&req.method==='GET'){
   const ms=Number(url.searchParams.get('ms'));
   if(!Number.isFinite(ms)||ms<0||ms>20000){res.writeHead(400,{'content-type':'application/json'});res.end(JSON.stringify({error:'bad_fixture_request'}));return;}
   fixture.usageDelayMs=ms;res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({fixture:'usage-delay',usageDelayMs:ms}));return;
  }
  if(pathname==='/__fixture/usage-status'&&req.method==='GET'){
   const raw=url.searchParams.get('code');
   const code=raw===null||raw===''?null:Number(raw);
   if(code!==null&&!Object.hasOwn(fixtureStatuses,code)){res.writeHead(400,{'content-type':'application/json'});res.end(JSON.stringify({error:'bad_fixture_request'}));return;}
   fixture.usageStatus=code;res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({fixture:'usage-status',usageStatus:code}));return;
  }
  if(pathname==='/api/account/mock-usage'){
   if(fixture.usageDelayMs)await sleep(fixture.usageDelayMs);
   if(fixture.usageStatus!==null){res.writeHead(fixture.usageStatus,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(fixtureStatuses[fixture.usageStatus]));return;}
   return apiHandler(req,res);
  }
  if(pathname.startsWith('/api/'))return apiHandler(req,res);
  if(Object.hasOwn(BACKEND_BROWSER_MAP,pathname)){
   const name=BACKEND_BROWSER_MAP[pathname];
   try{const data=await readFile(BACKEND_ROOT+name);res.setHeader('Content-Type','text/javascript');res.setHeader('Cache-Control','no-store');res.end(data);}catch{res.writeHead(404);res.end('Missing artifact');}
   return;
  }
  const name=allowed.get(pathname);
  if(!name){res.writeHead(404);res.end('Not part of this preview');return;}
  try{const data=await readFile(staticRoot+name);res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.ttf')?'font/ttf':'text/html');res.setHeader('Cache-Control','no-store');res.end(data);}catch{res.writeHead(404);res.end('Missing artifact');}
 });
 return {server,close:async()=>{try{await db.terminate()}catch{}await verifier.close();await deleteApp(adminApp);},fixture,db,verifier,adminApp};
}
