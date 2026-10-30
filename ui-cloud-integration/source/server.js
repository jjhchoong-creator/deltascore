import http from 'node:http';
import {readFile} from 'node:fs/promises';
const allowed=new Map([['/','index.html'],['/index.html','index.html'],['/styles.css','styles.css'],['/app.js','app.js'],['/domain.js','domain.js'],['/estimated-score.js','estimated-score.js'],['/catalogue.js','catalogue.js'],['/progress.js','progress.js'],['/progress-view.js','progress-view.js'],['/landing-analytics.js','landing-analytics.js'],['/recommendation-model.js','recommendation-model.js'],['/practice-routines.js','practice-routines.js'],['/progress-recommendation.js','progress-recommendation.js'],['/practice-page.js','practice-page.js'],['/practice-repeat.js','practice-repeat.js'],['/home-page.js','home-page.js'],['/notes-page.js','notes-page.js'],['/jakarta.ttf','jakarta.ttf']]);
export const server=http.createServer(async(req,res)=>{
 res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 const name=allowed.get(new URL(req.url,'http://localhost').pathname);if(!name){res.writeHead(404);res.end('Not part of this preview');return;}
 try{const data=await readFile(new URL(name,import.meta.url));res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.ttf')?'font/ttf':'text/html');res.setHeader('Cache-Control','no-store');res.end(data);}catch{res.writeHead(404);res.end('Missing artifact');}
});
if(process.argv[1]?.endsWith('/server.js'))server.listen(0,'127.0.0.1',()=>console.log(`Private loopback preview on 127.0.0.1:${server.address().port} (ephemeral)`));
