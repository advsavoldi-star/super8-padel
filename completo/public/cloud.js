export const cloud={items:new Map(),session:{canEdit:false},loaded:false,onchange:null};
let saving=false;
async function request(path,options={}){
 const response=await fetch(path,{...options,credentials:'same-origin',cache:'no-store'});
 let body;try{body=await response.json()}catch{throw Error('Não foi possível acessar o banco. Tente novamente.')}
 if(!response.ok)throw Error(body.error||'Não foi possível salvar.');return body;
}
function status(message){document.getElementById('cloudStatus').textContent=message;}
cloud.init=async()=>{
 const panel=document.createElement('section');panel.className='cloud-panel';panel.setAttribute('aria-label','Armazenamento online');
 panel.innerHTML='<p id="cloudStatus" role="status">Carregando jogos online…</p><div><a id="cloudLogin" target="_top">Entrar como administrador</a><button id="cloudImport" type="button" hidden>Importar jogos deste aparelho</button></div>';
 document.querySelector('main').prepend(panel);
 try{
  cloud.session=await request('/api/session');
  const link=document.getElementById('cloudLogin');link.href=cloud.session.signedIn?cloud.session.signOutPath:cloud.session.signInPath;
  link.textContent=cloud.session.signedIn?'Sair da conta': 'Entrar como administrador';
  await cloud.refresh();
 }catch(e){status(e.message+' Seus jogos locais continuam preservados.');}
 return cloud;
};
cloud.refresh=async()=>{
 if(saving)return;
 const body=await request('/api/tournaments');if(saving)return;
 const changed=JSON.stringify([...cloud.items.values()])!==JSON.stringify(body.items);
 cloud.items=new Map(body.items.map(t=>[t.id,t]));cloud.loaded=true;
 status(cloud.session.canEdit?'Jogos salvos online · administrador conectado.':'Jogos salvos online · entre como administrador para criar jogos e salvar placares.');
 let old=[];try{old=Object.keys(localStorage).filter(k=>k.startsWith('super8.tournament.v1.')).map(k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}}).filter(t=>t?.id&&!cloud.items.has(t.id))}catch{}
 const button=document.getElementById('cloudImport');button.hidden=!cloud.session.canEdit||!old.length;
 button.textContent=`Importar ${old.length} disputa${old.length===1?'':'s'} deste aparelho`;
 button.onclick=async()=>{
  button.disabled=true;let count=0;
  try{for(const t of old){await cloud.save({...t,revision:0});count++}status(`${count} disputas importadas. Os arquivos deste aparelho foram preservados.`);button.hidden=true;cloud.onchange?.();}
  catch(e){status(`${count} disputas importadas. ${e.message}`)}finally{button.disabled=false}
 };
 if(changed)cloud.onchange?.();
};
cloud.save=async t=>{
 if(!cloud.session.canEdit)throw Error('Entre com a conta de administrador para salvar.');
 if(saving)throw Error('Aguarde o resultado anterior terminar de salvar.');
 saving=true;status('Salvando no banco…');
 try{
  const saved=await request('/api/tournaments/'+encodeURIComponent(t.id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(t)});
  cloud.items.set(saved.id,saved);status('Salvo online. Disponível nos outros celulares.');return saved;
 }catch(e){status(e.message+' Suas edições não foram apagadas.');throw e}finally{saving=false}
};
cloud.notice=status;
setInterval(()=>{if(!document.hidden)cloud.refresh().catch(e=>status('Sem conexão com o banco. Não feche a tela com alterações pendentes.'))},8000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)cloud.refresh().catch(()=>status('Não foi possível atualizar. Tente novamente.'))});
