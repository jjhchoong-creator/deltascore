import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {randomUUID} from 'node:crypto';

export function createFirebaseVerifier({mode,projectId}={}) {
 if(!['emulator','production'].includes(mode))throw new Error('Explicit backend mode is required');
 if(typeof projectId!=='string'||!projectId)throw new Error('Explicit Firebase projectId is required');
 const host=process.env.FIREBASE_AUTH_EMULATOR_HOST;
 if(mode==='production'&&host!==undefined)throw new Error('Emulator configuration is forbidden in production');
 if(mode==='production'&&projectId.startsWith('demo-'))throw new Error('Demo projects cannot be used in production');
 if(mode==='emulator'){
  if(process.env.NODE_ENV==='production')throw new Error('Emulator mode is forbidden in a production environment');
  if(!projectId.startsWith('demo-'))throw new Error('Emulator requires a demo- project, never a live project');
  if(!/^127\.0\.0\.1:[1-9][0-9]{0,4}$/.test(host||'')||Number(host.split(':')[1])>65535)throw new Error('Emulator requires an explicit loopback host and valid port');
 }
 const app=initializeApp({projectId},`deltascore-${randomUUID()}`);
 const auth=getAuth(app);
 return {verifyIdToken:token=>auth.verifyIdToken(token,true),close:()=>deleteApp(app)};
}
