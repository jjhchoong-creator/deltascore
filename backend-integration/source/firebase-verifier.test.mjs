import {test} from 'node:test';
import assert from 'node:assert/strict';
const module=await import('./firebase-verifier.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND'&&error.message.includes('firebase-verifier.mjs'))return {};throw error});
test('Firebase verifier requires explicit safe mode and forbids emulator in production',()=>{
 assert.equal(typeof module.createFirebaseVerifier,'function','Missing Firebase SDK verifier');
 const saved=process.env.FIREBASE_AUTH_EMULATOR_HOST;
 try{
  assert.throws(()=>module.createFirebaseVerifier({projectId:'demo-deltascore-fresh'}),/explicit.*mode/i);
  process.env.FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099';
  assert.throws(()=>module.createFirebaseVerifier({mode:'production',projectId:'not-a-live-project'}),/emulator.*production/i);
  assert.throws(()=>module.createFirebaseVerifier({mode:'emulator',projectId:'real-project'}),/demo-/i);
  process.env.FIREBASE_AUTH_EMULATOR_HOST='example.invalid:9099';
  assert.throws(()=>module.createFirebaseVerifier({mode:'emulator',projectId:'demo-deltascore-fresh'}),/loopback/i);
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
  assert.throws(()=>module.createFirebaseVerifier({mode:'emulator',projectId:'demo-deltascore-fresh'}),/loopback/i);
 }finally{if(saved===undefined)delete process.env.FIREBASE_AUTH_EMULATOR_HOST;else process.env.FIREBASE_AUTH_EMULATOR_HOST=saved}
});
test('a production Node environment cannot start an emulator-mode verifier',async()=>{const host=process.env.FIREBASE_AUTH_EMULATOR_HOST,mode=process.env.NODE_ENV;let created;try{process.env.NODE_ENV='production';process.env.FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099';assert.throws(()=>{created=module.createFirebaseVerifier({mode:'emulator',projectId:'demo-deltascore-fresh'})},/production/i,'Emulator mode must be forbidden when NODE_ENV is production')}finally{if(host===undefined)delete process.env.FIREBASE_AUTH_EMULATOR_HOST;else process.env.FIREBASE_AUTH_EMULATOR_HOST=host;if(mode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=mode;if(created)await created.close()}});
