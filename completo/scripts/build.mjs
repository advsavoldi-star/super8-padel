import fs from 'node:fs';
import path from 'node:path';
const assets={};const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpeg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json'};
for(const name of fs.readdirSync('public')){const p=path.join('public',name);if(fs.statSync(p).isFile())assets['/'+name]={type:types[path.extname(name)]||'application/octet-stream',content:fs.readFileSync(p).toString('base64')}}
const database=fs.readFileSync('worker/database.js','utf8'),auth=fs.readFileSync('worker/auth.js','utf8');
const source=fs.readFileSync('worker/index.js','utf8').replace(/^import .*;\n/gm,'').replace('export default {','const app = {');
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js',database+'\n'+auth+'\n'+source+'\nconst assets='+JSON.stringify(assets)+';\nexport default {fetch(request,env,ctx){return app.fetch(request,{...env,__assets:assets},ctx)}};\n');
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Worker and public assets built.');
