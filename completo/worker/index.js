import {database,unpack} from './database.js';
import {canEdit,getChatGPTUser,chatGPTSignInPath} from './auth.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const idPattern=/^[a-zA-Z0-9_-]{1,80}$/;
export function validateTournament(t) {
  if(!t || !idPattern.test(t.id||'') || ![8,10,12,14,16].includes(t.players?.length) || ![5,6,7,8,9].includes(t.total)) return false;
  if(!t.players.every(p=>typeof p==='string'&&p.trim().length>0&&p.length<=35) || new Set(t.players.map(p=>p.trim().toLocaleLowerCase('pt-BR'))).size!==t.players.length) return false;
  if(!['Iniciantes','Sétima','Sexta','Quinta','Quarta','Terceira','Segunda','Primeira','Livre'].includes(t.category) || !['Masculino','Feminino','Misto'].includes(t.modality))return false;
  if(!Number.isFinite(Date.parse(t.createdAt)) || !Array.isArray(t.matches) || !t.matches.length || t.matches.length>256)return false;
  if(!t.matches.every(m=>Array.isArray(m.a)&&Array.isArray(m.b)&&m.a.length===2&&m.b.length===2&&new Set([...m.a,...m.b]).size===4&&[...m.a,...m.b].every(i=>Number.isInteger(i)&&i>=0&&i<t.players.length)&&typeof m.saved==='boolean'&&(!m.saved || [m.scoreA,m.scoreB].every(s=>s!==''&&s!==null&&s!==undefined&&Number.isInteger(Number(s))&&Number(s)>=0&&Number(s)<=t.total)&&Number(m.scoreA)+Number(m.scoreB)===t.total)))return false;
  if(t.published && (!t.matches.every(m=>m.saved) || !Array.isArray(t.published.rows)||t.published.rows.length!==t.players.length||!Number.isFinite(Date.parse(t.published.at))||!t.published.rows.every(r=>(t.publicationStale ? typeof r.name==='string'&&r.name.length<=35 : t.players.includes(r.name))&&['position','j','g','v','against'].every(k=>Number.isInteger(r[k])&&r[k]>=0))))return false;
  return true;
}
export async function api(request,env) {
  const url=new URL(request.url),path=url.pathname;
  if(path==='/api/session'&&request.method==='GET') {
    const user=getChatGPTUser(request);
    return json({canEdit:canEdit(request,env),signedIn:!!user,signInPath:chatGPTSignInPath('/'),signOutPath:'/signout-with-chatgpt?return_to=%2F'});
  }
  if(request.method==='GET'&&path==='/api/tournaments') {
    const result=await database(env).prepare('SELECT data, revision FROM tournaments ORDER BY created_at DESC').all();
    return json({items:result.results.map(unpack)});
  }
  const match=path.match(/^\/api\/tournaments\/([a-zA-Z0-9_-]{1,80})$/);
  if(!match)return json({error:'Página não encontrada.'},404);
  if(request.method==='GET'){
    const row=await database(env).prepare('SELECT data, revision FROM tournaments WHERE id = ?').bind(match[1]).first();
    return row?json(unpack(row)):json({error:'Disputa não encontrada.'},404);
  }
  if(request.method!=='PUT')return json({error:'Método não permitido.'},405);
  if(!canEdit(request,env))return json({error:'Entre com a conta de administrador para salvar resultados.'},403);
  if(request.headers.get('Origin')!==url.origin)return json({error:'Origem não autorizada.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Formato não permitido.'},415);
  if(Number(request.headers.get('Content-Length')||0)>150000)return json({error:'Disputa muito grande.'},413);
  const body=await request.text();if(body.length>150000)return json({error:'Disputa muito grande.'},413);
  let t;try{t=JSON.parse(body)}catch{return json({error:'Dados inválidos.'},400)}
  if(t.id!==match[1]||!validateTournament(t))return json({error:'Confira os jogadores e os placares antes de salvar.'},400);
  const revision=t.revision??0;if(!Number.isInteger(revision)||revision<0)return json({error:'Versão inválida.'},400);
  const value={...t,updatedAt:new Date().toISOString()};delete value.revision;
  let result;
  if(revision===0){
    result=await database(env).prepare('INSERT INTO tournaments (id, data, revision, created_at, updated_at) VALUES (?, ?, 1, ?, ?) ON CONFLICT(id) DO NOTHING').bind(t.id,JSON.stringify(value),t.createdAt,value.updatedAt).run();
  }else{
    result=await database(env).prepare('UPDATE tournaments SET data = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND revision = ?').bind(JSON.stringify(value),value.updatedAt,t.id,revision).run();
  }
  if(!result.meta.changes)return json({error:'Esta disputa mudou em outro celular. Reabra a disputa antes de salvar novamente.'},409);
  return json({...value,revision:revision+1});
}
export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url);
    if(url.pathname.startsWith('/api/')){
      try{return await api(request,env)}catch(error){console.error('Super8 API failed',error);return json({error:'Não foi possível acessar o banco. Tente novamente; suas edições continuam na tela.'},503)}
    }
    if(!['GET','HEAD'].includes(request.method))return new Response('Método não permitido',{status:405});
    const path=url.pathname==='/'?'/index.html':url.pathname;
    const asset=env.__assets?.[path];
    if(!asset)return new Response('Página não encontrada',{status:404});
    const bytes=Uint8Array.from(atob(asset.content),c=>c.charCodeAt(0));
    return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
  }
};
