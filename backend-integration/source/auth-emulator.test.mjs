import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {setTimeout as wait} from 'node:timers/promises';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {createRequestHandler} from './auth-boundary.mjs';
import {createFirebaseVerifier} from './firebase-verifier.mjs';
import {createAccountSession} from './account-session.mjs';
const projectId='demo-deltascore-fresh';
let verifier,fixtureApp,admin,server,base,authBase;
before(async()=>{
 assert.match(process.env.FIREBASE_AUTH_EMULATOR_HOST||'',/^127\.0\.0\.1:9099$/,'Run only with the isolated local Authentication emulator');
 authBase='http://'+process.env.FIREBASE_AUTH_EMULATOR_HOST;
 verifier=createFirebaseVerifier({mode:'emulator',projectId});
 fixtureApp=initializeApp({projectId},'fixtures-'+randomUUID());admin=getAuth(fixtureApp);
 server=createServer(createRequestHandler(verifier));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
after(async()=>{if(server)await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));if(verifier)await verifier.close();if(fixtureApp)await deleteApp(fixtureApp)});
async function rest(action,body){const response=await fetch(`${authBase}/identitytoolkit.googleapis.com/v1/${action}?key=fake-api-key`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const data=await response.json();assert.equal(response.status,200,`Local auth fixture action ${action} failed: ${JSON.stringify(data)}`);return data}
async function account(verified=true){const email=`fictional-${randomUUID()}@example.test`;const password='FictionalEmulatorOnly-42!';const created=await admin.createUser({email,password,emailVerified:verified});const login=()=>rest('accounts:signInWithPassword',{email,password,returnSecureToken:true});return {uid:created.uid,login,token:(await login()).idToken}}
async function privateSession(token,suffix=''){const response=await fetch(base+'/api/session'+suffix,{headers:{authorization:'Bearer '+token,'x-user-id':'forged-other-user'}});return {status:response.status,body:await response.json(),cache:response.headers.get('cache-control')}}
function replaceClaims(token,patch){const parts=token.split('.');const claims=JSON.parse(Buffer.from(parts[1],'base64url').toString());return [parts[0],Buffer.from(JSON.stringify({...claims,...patch})).toString('base64url'),parts[2]].join('.')}
test('actual emulator account remains blocked until a verified-email token is refreshed',async()=>{
 const user=await account(false);assert.deepEqual(await privateSession(user.token),{status:403,body:{error:'email_verification_required'},cache:'no-store'});
 await admin.updateUser(user.uid,{emailVerified:true});assert.equal((await privateSession(user.token)).status,403,'Old unverified token must not gain access merely from account update');
 const fresh=(await user.login()).idToken;assert.deepEqual(await privateSession(fresh),{status:200,body:{uid:user.uid},cache:'no-store'});
});
test('actual SDK identity wins over submitted IDs for two different accounts',async()=>{
 const a=await account(),b=await account();assert.notEqual(a.uid,b.uid);
 assert.deepEqual((await privateSession(a.token,`?uid=${b.uid}&role=educator`)).body,{uid:a.uid});
 assert.deepEqual((await privateSession(b.token,`?uid=${a.uid}`)).body,{uid:b.uid});
});
test('actual disabled and revoked credentials are refused while fresh sign-in recovers',async()=>{
 const user=await account();await admin.updateUser(user.uid,{disabled:true});assert.equal((await privateSession(user.token)).status,401);
 await admin.updateUser(user.uid,{disabled:false});const beforeRevoke=(await user.login()).idToken;assert.equal((await privateSession(beforeRevoke)).status,200);
 await wait(1100);await admin.revokeRefreshTokens(user.uid);assert.deepEqual((await privateSession(beforeRevoke)).body,{error:'invalid_authentication'});assert.equal((await privateSession(beforeRevoke)).status,401);
 assert.equal((await privateSession((await user.login()).idToken)).status,200);
});
test('SDK rejects tokens from a different project audience',async()=>{const user=await account();const forged=replaceClaims(user.token,{aud:'demo-different-project',iss:'https://securetoken.google.com/demo-different-project'});assert.equal((await privateSession(forged)).status,401)});
test('production-mode SDK rejects an unsigned emulator token even with matching audience',async()=>{
 const user=await account();const saved=process.env.FIREBASE_AUTH_EMULATOR_HOST;let production;
 try{delete process.env.FIREBASE_AUTH_EMULATOR_HOST;production=createFirebaseVerifier({mode:'production',projectId:'not-a-live-project'});const forged=replaceClaims(user.token,{aud:'not-a-live-project',iss:'https://securetoken.google.com/not-a-live-project'});await assert.rejects(production.verifyIdToken(forged),/no "kid" claim/i);const parts=forged.split('.');const header=JSON.parse(Buffer.from(parts[0],'base64url').toString());parts[0]=Buffer.from(JSON.stringify({...header,kid:'fictional-not-a-real-signing-key'})).toString('base64url');await assert.rejects(production.verifyIdToken(parts.join('.')),/algorithm|RS256/i)}finally{process.env.FIREBASE_AUTH_EMULATOR_HOST=saved;if(production)await production.close()}
});
test('session generation discards delayed actual SDK/HTTP account-A completion after B signs in',async()=>{
 const a=await account(),b=await account();let release,entered;const held=new Promise(resolve=>release=resolve),started=new Promise(resolve=>entered=resolve);
 const session=createAccountSession({verifySession:async token=>{const result=await privateSession(token);assert.equal(result.status,200);if(token===a.token){entered();await held}return result.body}});
 const pending=session.setAccount({uid:a.uid,getIdToken:async()=>a.token});await started;
 assert.deepEqual(session.getState(),{status:'loading',uid:null,error:null});
 await session.setAccount({uid:b.uid,getIdToken:async()=>b.token});const stable=session.getState();assert.deepEqual(stable,{status:'signed-in',uid:b.uid,error:null});
 release();await pending;assert.equal(session.getState(),stable);await session.setAccount(null);assert.deepEqual(session.getState(),{status:'signed-out',uid:null,error:null});
});
