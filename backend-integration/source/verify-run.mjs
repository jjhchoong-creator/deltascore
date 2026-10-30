import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const [phase,expected,expectedTests,expectedFailure='',...files]=process.argv.slice(2);
assert.match(phase,/^[a-z0-9-]{1,70}$/);assert.ok(['red','green'].includes(expected));assert.match(expectedTests,/^[1-9][0-9]*$/);
const tests=files.length?files:['auth-boundary.test.mjs'];assert.ok(tests.every(x=>/^[a-z0-9-]+[.]test[.]mjs$/.test(x)));
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const ui=JSON.parse(fs.readFileSync('ui-baseline.json','utf8'));
const verifyUi=()=>{for(const [name,value] of Object.entries(ui))assert.equal(hash(path.join('/workspace/practice-integration-p1',name)),value,`UI source drift: ${name}`)};
const snapshot=()=>Object.fromEntries(fs.readdirSync('.').filter(x=>/\.(mjs|json|rules)$/.test(x)).sort().map(x=>[x,hash(x)]));
const lock='.backend-integration-test.lock';const lockfd=fs.openSync(lock,'wx');let dir;
try{
 fs.writeFileSync(lockfd,JSON.stringify({pid:process.pid,phase}));verifyUi();const before=snapshot();
 fs.mkdirSync('evidence',{recursive:true});dir=path.join('evidence',phase);fs.mkdirSync(dir);
 const child=spawnSync(process.execPath,['--test','--test-reporter=tap',...tests],{encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024});
 const raw=(child.stdout||'')+(child.stderr||'');fs.writeFileSync(path.join(dir,'raw.tap'),raw,{flag:'wx'});
 verifyUi();const after=snapshot();assert.deepEqual(after,before,'Backend source changed during test');
 const number=key=>Number(raw.match(new RegExp('^# '+key+' (\\d+)$','m'))?.[1]??NaN);
 const count=number('tests'),pass=number('pass'),fail=number('fail');
 const complete=count===Number(expectedTests)&&count===pass+fail&&number('cancelled')===0&&number('skipped')===0&&number('todo')===0;
 const accepted=complete&&(expected==='green'?child.status===0&&fail===0&&!/^not ok /m.test(raw):child.status===1&&fail===1&&Boolean(expectedFailure)&&raw.includes(expectedFailure));
 const verdict={phase,expected,accepted,childExit:child.status,tests:count,pass,fail,sourceBefore:before,sourceAfter:after,uiFilesVerified:Object.keys(ui).length,rawSha256:createHash('sha256').update(raw).digest('hex'),evidence:path.resolve(dir)};
 fs.writeFileSync(path.join(dir,'verdict.json'),JSON.stringify(verdict,null,2),{flag:'wx'});
 console.log(JSON.stringify({phase,expected,accepted,childExit:child.status,tests:count,pass,fail,uiFilesVerified:Object.keys(ui).length,evidence:path.resolve(dir)}));
 if(!accepted){console.error(raw);process.exitCode=1}
}finally{fs.closeSync(lockfd);fs.unlinkSync(lock)}
