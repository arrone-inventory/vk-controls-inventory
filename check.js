

(function(){
'use strict';
const SUPABASE_URL='https://pvhzjvowztrazsbxzcok.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_Y_U1fcYVOTYGD55ihuMbng_DZ2FUyVZ';
const supabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const KEY='coffee_retials_inventory_v2';
const $=id=>document.getElementById(id);
const qsa=sel=>Array.from(document.querySelectorAll(sel));
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const money=v=>'₹'+num(v).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const qty=v=>num(v).toLocaleString('en-IN',{minimumFractionDigits:1,maximumFractionDigits:1});
const now=()=>new Date().toISOString();
const todayISO=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function validTxnDate(value,label='Transaction Date'){if(!value)throw Error(label+' is required');const chosen=String(value);if(!/^\d{4}-\d{2}-\d{2}$/.test(chosen))throw Error('Invalid '+label);if(chosen>todayISO())throw Error(label+' cannot be a future date');return chosen}
function dateToISO(date){return date+'T12:00:00'}
function setTxnDateDefaults(){qsa('.txn-date').forEach(el=>{el.max=todayISO();if(!el.value)el.value=todayISO()})}
let state=load();state=sanitizeCloudState(state);
function uid(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6)}
function demo(){
 const items=[
 {id:'i1',sku:'GC-KEN-AA',name:'Kenya Nyeri AA Washed',category:'Green Coffee',uom:'kg',loss:15,cost:620,price:0,reorder:100,origin:'Nyeri, SL28/SL34'},
 {id:'i2',sku:'GC-ETH-YRG',name:'Ethiopia Yirgacheffe Natural',category:'Green Coffee',uom:'kg',loss:16,cost:720,price:0,reorder:80,origin:'Yirgacheffe, Heirloom'},
 {id:'i3',sku:'RC-KEN-FLT',name:'Kenya Filter Roast',category:'Roasted Coffee',uom:'kg',loss:15,cost:1050,price:1450,reorder:30,origin:'Kenya Nyeri'},
 {id:'i4',sku:'PK-ESP-250',name:'Espresso Roast 250g Pouch',category:'Packaged Coffee',uom:'units',loss:15,cost:280,price:520,reorder:50,origin:'House Blend'},
 {id:'i5',sku:'PM-POUCH-250',name:'250g Coffee Pouch',category:'Packaging Material',uom:'units',loss:0,cost:18,price:0,reorder:200,origin:'Valve pouch'},
 {id:'i6',sku:'RM-DRIP-01',name:'Ceramic Coffee Dripper',category:'Retail Merchandise',uom:'units',loss:0,cost:420,price:699,reorder:10,origin:'Retail'}
 ];
 return {items,greenLots:[
 {id:'g1',sku:'GC-KEN-AA',lot:'LOT-KEN-2609',supplier:'Attikan Estate',opening:120,purchases:500,issued:210,physical:404,cost:620},
 {id:'g2',sku:'GC-ETH-YRG',lot:'LOT-ETH-2608',supplier:'Coorg Importers',opening:80,purchases:300,issued:170,physical:208,cost:720}],
 roasts:[{id:'r1',batch:'RB-2609-001',date:now(),greenSku:'GC-KEN-AA',roastedSku:'RC-KEN-FLT',greenIn:30,roastedOut:25.5,machine:'Giesen W15',profile:'Filter Light',notes:'Demo batch'}],
 packing:{'PK-ESP-250':{opening:120,receiving:80,issued:100,physical:96},'RC-KEN-FLT':{opening:20,receiving:25.5,issued:10,physical:35.2}},
 retail:{'PM-POUCH-250':{opening:500,receiving:1000,issued:700,physical:780},'RM-DRIP-01':{opening:20,receiving:10,issued:8,physical:22}},
 departments:[{id:'d1',code:'OUT-BLR-IND',name:'Indiranagar Cafe',type:'Outlet',role:'Cafe Outlet'},{id:'d2',code:'OUT-BOM-BND',name:'Bandra Outlet',type:'Outlet',role:'Cafe Outlet'},{id:'d3',code:'WEB-D2C',name:'Website Sales (D2C)',type:'Website',role:'E-Commerce'},{id:'d4',code:'B2B-WHOLE',name:'B2B Wholesale',type:'B2B',role:'Wholesale'},{id:'d5',code:'WASTE',name:'Wastage',type:'Wastage',role:'Loss'},{id:'d6',code:'GRIND-LOSS',name:'Grinder Loss',type:'Grinder Loss',role:'Loss'},{id:'d7',code:'QA-LAB',name:'Lab Testing',type:'Lab',role:'Quality Assurance'}],
 outlets:[{id:'o1',code:'OUT-BLR-IND',name:'Indiranagar Cafe',city:'Bengaluru',format:'Dine-in Cafe & Roastery',manager:'Store Manager',address:'Indiranagar'}],
 txns:[{id:uid('TXN'),date:now(),module:'Green Coffee',type:'PURCHASE',sku:'GC-KEN-AA',qty:500,ref:'LOT-KEN-2609',notes:'Demo purchase'}],ownerSettings:{orgName:'Coffee & Retails',ownerName:'Main Owner',email:'',phone:'',address:''},users:[{id:'u-owner',name:'Main Owner',email:'owner@local',role:'Owner',status:'Active',outlets:'ALL',permissions:['Dashboard','Inventory','Purchasing','Roastery','Reports','Import/Export','User Access']}]};
}
function load(){try{const raw=localStorage.getItem(KEY);if(raw){const x=JSON.parse(raw);const cleaned=sanitizeCloudState(Object.assign(demo(),x));localStorage.setItem(KEY,JSON.stringify(cleaned));return cleaned}}catch(e){} const fresh=sanitizeCloudState(demo());localStorage.setItem(KEY,JSON.stringify(fresh));return fresh}
function save(){state=sanitizeCloudState(state);localStorage.setItem(KEY,JSON.stringify(state));renderAll(); if(window.__vkCloudReady) syncCloudState()}
async function syncCloudState(){
  try{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session) return;
    await supabase.from('app_state').upsert({id:1,state:sanitizeCloudState(state),updated_by:session.user.id,updated_at:new Date().toISOString()});
  }catch(err){console.warn('Cloud sync failed',err)}
}
function sanitizeCloudState(input){
  const x=JSON.parse(JSON.stringify(input||{}));
  if(x.ownerSettings) delete x.ownerSettings.resetOtp;
  if(Array.isArray(x.users)) x.users=x.users.map(u=>{const y={...u};delete y.password;delete y.loginOtp;return y});
  return x;
}
async function sha256Hex(value){
  const data=new TextEncoder().encode(String(value));
  const hash=await crypto.subtle.digest('SHA-256',data);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function loadOwnerSecurity(){
  try{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session) return false;
    const {data,error}=await supabase.from('owner_settings').select('reset_otp_hash').eq('id',1).maybeSingle();
    if(error) throw error;
    window.__ownerResetConfigured=!!data?.reset_otp_hash;
    return window.__ownerResetConfigured;
  }catch(e){console.warn('Owner security metadata unavailable',e);window.__ownerResetConfigured=false;return false}
}
function isOwnerClient(){return window.__vkProfileRole==='Owner'}
async function syncAuthenticatedProfile(session){
  if(!session?.user?.id) return null;
  try{
    const {data,error}=await supabase.from('profiles').select('id,name,email,role,status').eq('id',session.user.id).maybeSingle();
    if(error) throw error;
    if(!data || data.status!=='Active'){window.__vkProfileRole=null;return null}
    const profile={id:data.id,name:data.name||session.user.user_metadata?.name||session.user.email?.split('@')[0]||'User',email:data.email||session.user.email||'',role:data.role||'Viewer',status:data.status};
    window.__vkProfileRole=profile.role;
    let local=state.users.find(u=>u.id===profile.id)||state.users.find(u=>String(u.email||'').toLowerCase()===String(profile.email||'').toLowerCase());
    if(local){local.name=profile.name;local.email=profile.email;local.role=profile.role;local.status=profile.status;}
    else state.users.push({...profile,outlets:'ALL',permissions:profile.role==='Owner'?['Dashboard','Inventory','Purchasing','Roastery','Reports','Import/Export','User Access']:['Dashboard']});
    const auth={id:profile.id,name:profile.name,role:profile.role};
    sessionStorage.setItem('vkCoffeeAuth',JSON.stringify(auth));
    if(localStorage.getItem('vkCoffeeRemember')) localStorage.setItem('vkCoffeeRemember',JSON.stringify(auth));
    else localStorage.removeItem('vkCoffeeRemember');
    return profile;
  }catch(e){window.__vkProfileRole=null;console.warn('Authenticated profile load failed',e);return null}
}
async function loadCloudState(){
  try{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session) return false;
    const {data,error}=await supabase.from('app_state').select('state').eq('id',1).maybeSingle();
    if(error) throw error;
    if(data?.state && typeof data.state==='object'){state=Object.assign(demo(),sanitizeCloudState(data.state));localStorage.setItem(KEY,JSON.stringify(state));}
    else {await supabase.from('app_state').upsert({id:1,state:sanitizeCloudState(state),updated_by:session.user.id,updated_at:new Date().toISOString()});}
    window.__vkCloudReady=true;
    return true;
  }catch(err){console.warn('Cloud load failed',err);toast('Supabase connected, but cloud data could not be loaded','error');return false}
}
function toast(msg,type='success'){const old=$('toastNotification');old.className='toast '+type;old.textContent=msg;old.style.display='block';clearTimeout(window.__toast);window.__toast=setTimeout(()=>old.style.display='none',2600)}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function openModal(id){$(id)?.classList.add('open');if(id==='modal-packing-issue')setTxnDateDefaults()}
function closeModal(id){$(id)?.classList.remove('open')}
function resetForm(id){$(id)?.reset();const h=$(id)?.querySelector('input[type=hidden]');if(h)h.value=''}
function log(type,module,sku,quantity,ref,notes,businessDate){const bd=validTxnDate(businessDate||todayISO());state.txns.unshift({id:uid('TXN'),date:dateToISO(bd),entryAt:now(),module,type,sku:sku||'',qty:num(quantity),ref:ref||'',notes:notes||'',businessDate:bd})}
function item(sku){return state.items.find(x=>x.sku===sku)}
function greenBalance(g){return num(g.opening)+num(g.purchases)-num(g.issued)}
function packingBalance(x){return num(x.opening)+num(x.receiving)-num(x.issued)}
function retailBalance(x){return num(x.opening)+num(x.receiving)-num(x.issued)}
function departmentsWithTotals(){return state.departments.map(d=>{let issued=state.txns.filter(t=>t.type==='DEPT_ISSUE'&&t.ref===d.code).reduce((a,t)=>a+num(t.qty),0);return {...d,issued}})}
function populateSelects(){
 qsa('.select-green-sku').forEach(sel=>{let v=sel.value;sel.innerHTML=state.items.filter(i=>i.category==='Green Coffee').map(i=>`<option value="${esc(i.sku)}">${esc(i.sku)} — ${esc(i.name)}</option>`).join('');if(v&&[...sel.options].some(o=>o.value===v))sel.value=v});
 qsa('.select-roasted-sku').forEach(sel=>{let v=sel.value;sel.innerHTML=state.items.filter(i=>i.category==='Roasted Coffee'||i.category==='Packaged Coffee').map(i=>`<option value="${esc(i.sku)}">${esc(i.sku)} — ${esc(i.name)}</option>`).join('');if(v&&[...sel.options].some(o=>o.value===v))sel.value=v});
 qsa('.select-packing-sku').forEach(sel=>{let v=sel.value;sel.innerHTML=state.items.filter(i=>i.category==='Roasted Coffee'||i.category==='Packaged Coffee').map(i=>`<option value="${esc(i.sku)}">${esc(i.sku)} — ${esc(i.name)}</option>`).join('');if(v&&[...sel.options].some(o=>o.value===v))sel.value=v});
 qsa('.select-retail-sku').forEach(sel=>{let v=sel.value;sel.innerHTML=state.items.filter(i=>i.category==='Packaging Material'||i.category==='Retail Merchandise').map(i=>`<option value="${esc(i.sku)}">${esc(i.sku)} — ${esc(i.name)}</option>`).join('');if(v&&[...sel.options].some(o=>o.value===v))sel.value=v});
 qsa('.select-department').forEach(sel=>{let v=sel.value;sel.innerHTML=departmentsWithTotals().map(d=>`<option value="${esc(d.code)}">${esc(d.code)} — ${esc(d.name)}</option>`).join('');if(v&&[...sel.options].some(o=>o.value===v))sel.value=v});
}
function renderGreen(){let term=($('green-search-input')?.value||'').toLowerCase();let rows=state.greenLots.filter(g=>(g.sku+' '+g.lot+' '+g.supplier).toLowerCase().includes(term));$('green-coffee-count-badge').textContent=state.greenLots.length+' Lots';$('green-coffee-table-body').innerHTML=rows.length?rows.map(g=>{let bal=greenBalance(g),variance=num(g.physical)-bal;return `<tr><td><b>${esc(g.sku)}</b><br><small>${esc(g.lot)}</small></td><td>${esc(item(g.sku)?.name||'')}<br><small>${esc(g.supplier)}</small></td><td>${qty(g.opening)}</td><td>${qty(g.purchases)}</td><td>${qty(g.issued)}</td><td><b>${qty(bal)}</b></td><td>${qty(g.physical)}</td><td class="${Math.abs(variance)>.05?'status-danger':'status-ok'}">${qty(variance)}</td><td>${money(bal*num(g.cost))}</td><td><button class="action-btn" onclick="CoffeeApp.setGreenPhysical('${g.id}')">Count</button><button class="action-btn danger" onclick="CoffeeApp.deleteGreen('${g.id}')">Delete</button></td></tr>`}).join(''):`<tr><td colspan="10" class="empty-state">No green coffee lots found.</td></tr>`}
function renderRoastery(){let term=($('roastery-search-input')?.value||'').toLowerCase();let rows=state.roasts.filter(r=>(r.batch+' '+r.greenSku+' '+r.roastedSku+' '+r.profile).toLowerCase().includes(term));let totalIn=state.roasts.reduce((a,r)=>a+num(r.greenIn),0),totalOut=state.roasts.reduce((a,r)=>a+num(r.roastedOut),0);$('roast-kpi-total-in').textContent=qty(totalIn)+' kg';$('roast-kpi-total-out').textContent=qty(totalOut)+' kg';$('roast-kpi-avg-loss').textContent=(totalIn?((totalIn-totalOut)/totalIn*100):0).toFixed(1)+'%';$('roastery-count-badge').textContent=state.roasts.length+' Batches';$('roastery-table-body').innerHTML=rows.length?rows.map(r=>{let loss=num(r.greenIn)-num(r.roastedOut),pct=r.greenIn?loss/r.greenIn*100:0;return `<tr><td><b>${esc(r.batch)}</b></td><td>${new Date(r.date).toLocaleString('en-IN')}</td><td>${esc(r.greenSku)}</td><td>${esc(r.roastedSku)}<br><small>${esc(r.machine)}</small></td><td>${qty(r.greenIn)} kg</td><td>${qty(r.roastedOut)} kg</td><td>${qty(loss)} kg</td><td class="${pct>18?'status-danger':pct>17.5?'status-warn':'status-ok'}">${pct.toFixed(1)}%</td><td>${pct<=18?'Recorded':'Review'}</td></tr>`}).join(''):`<tr><td colspan="9" class="empty-state">No roast batches found.</td></tr>`}
function renderPacking(){let term=($('packing-search-input')?.value||'').toLowerCase();let skus=Object.keys(state.packing).filter(s=>(s+' '+(item(s)?.name||'')).toLowerCase().includes(term));$('packing-count-badge').textContent=skus.length+' SKUs';$('packing-table-body').innerHTML=skus.length?skus.map(s=>{let x=state.packing[s],bal=packingBalance(x),v=num(x.physical)-bal;return `<tr><td><b>${esc(s)}</b> · ${esc(item(s)?.uom||'')}</td><td>${esc(item(s)?.name||'')}</td><td>${qty(x.opening)}</td><td>${qty(x.receiving)}</td><td>${qty(x.issued)}</td><td><b>${qty(bal)}</b></td><td>${qty(x.physical)}</td><td class="${Math.abs(v)>.05?'status-danger':'status-ok'}">${qty(v)}</td><td><button class="action-btn" onclick="CoffeeApp.setPackingPhysical('${s}')">Count</button></td></tr>`}).join(''):`<tr><td colspan="9" class="empty-state">No packing stock records yet.</td></tr>`}
function renderRetail(){let term=($('retail-search-input')?.value||'').toLowerCase();let skus=Object.keys(state.retail).filter(s=>(s+' '+(item(s)?.name||'')).toLowerCase().includes(term));$('retail-count-badge').textContent=skus.length+' Items';$('retail-table-body').innerHTML=skus.length?skus.map(s=>{let x=state.retail[s],bal=retailBalance(x),v=num(x.physical)-bal,it=item(s);return `<tr><td><b>${esc(s)}</b> · ${esc(it?.uom||'')}</td><td>${esc(it?.name||'')}<br><small>${esc(it?.category||'')}</small></td><td>${qty(x.opening)}</td><td>${qty(x.receiving)}</td><td>${qty(x.issued)}</td><td><b>${qty(bal)}</b></td><td>${qty(x.physical)}</td><td class="${Math.abs(v)>.05?'status-danger':'status-ok'}">${qty(v)}</td><td>${money(bal*num(it?.cost))}</td><td><button class="action-btn" onclick="CoffeeApp.setRetailPhysical('${s}')">Count</button></td></tr>`}).join(''):`<tr><td colspan="10" class="empty-state">No retail/packaging stock records yet.</td></tr>`}
function renderItems(){let term=($('item-master-search-input')?.value||'').toLowerCase(),cat=$('item-master-category-filter')?.value||'ALL';let rows=state.items.filter(i=>(cat==='ALL'||i.category===cat)&&(i.sku+' '+i.name+' '+i.origin).toLowerCase().includes(term));$('item-master-count-badge').textContent=state.items.length+' SKUs';$('item-master-table-body').innerHTML=rows.length?rows.map(i=>`<tr><td><b>${esc(i.sku)}</b></td><td>${esc(i.name)}<br><small>${esc(i.origin||'')}</small></td><td>${esc(i.category)}</td><td>${esc(i.uom)}</td><td>${num(i.loss).toFixed(1)}%</td><td>${money(i.cost)}</td><td>${money(i.price)}</td><td>${qty(i.reorder)}</td><td><button class="action-btn" onclick="CoffeeApp.editItem('${i.id}')">Edit</button><button class="action-btn danger" onclick="CoffeeApp.deleteItem('${i.id}')">Delete</button></td></tr>`).join(''):`<tr><td colspan="9" class="empty-state">No items found.</td></tr>`}
function renderDepartments(){let ds=departmentsWithTotals();$('outlets-count-badge').textContent=state.outlets.length+' Cafes';$('outlets-table-body').innerHTML=state.outlets.length?state.outlets.map(o=>`<tr><td><b>${esc(o.code)}</b></td><td>${esc(o.name)}<br><small>${esc(o.city)} · ${esc(o.address||'')}</small></td><td>${esc(o.format)}</td><td>${esc(o.manager||'—')}</td><td>${qty(ds.find(d=>d.code===o.code)?.issued||0)} kg</td><td><button class="action-btn danger" onclick="CoffeeApp.deleteOutlet('${o.id}')">Delete</button></td></tr>`).join(''):`<tr><td colspan="6" class="empty-state">No cafe outlets registered.</td></tr>`;$('departments-table-body').innerHTML=ds.length?ds.map(d=>`<tr><td><b>${esc(d.code)}</b></td><td>${esc(d.name)}</td><td>${esc(d.type)}</td><td>${qty(d.issued)} kg</td><td>${esc(d.role)}</td><td>${d.type==='System'?'':'<button class="action-btn danger" onclick="CoffeeApp.deleteDepartment(\''+d.id+'\')">Delete</button>'}</td></tr>`).join(''):`<tr><td colspan="6" class="empty-state">No departments.</td></tr>`}
function renderLedger(){let rows=state.txns.slice(0,300);$('ledger-count-badge').textContent=state.txns.length+' Logs';$('ledger-table-body').innerHTML=rows.length?rows.map(t=>`<tr><td><b>${esc(t.id)}</b></td><td>${esc(t.businessDate||String(t.date||'').slice(0,10))}</td><td>${t.entryAt?new Date(t.entryAt).toLocaleString('en-IN'):new Date(t.date).toLocaleString('en-IN')}</td><td>${esc(t.module)}</td><td>${esc(t.type)}</td><td>${esc(t.sku)}</td><td>${qty(t.qty)}</td><td>${esc(t.ref)}</td><td>${esc(t.notes)}</td></tr>`).join(''):`<tr><td colspan="9" class="empty-state">No transactions logged.</td></tr>`}
function renderDashboard(){let greenKg=state.greenLots.reduce((a,g)=>a+greenBalance(g),0),greenVal=state.greenLots.reduce((a,g)=>a+greenBalance(g)*num(g.cost),0),roastIn=state.roasts.reduce((a,r)=>a+num(r.greenIn),0),roastOut=state.roasts.reduce((a,r)=>a+num(r.roastedOut),0),packKg=Object.entries(state.packing).reduce((a,[s,x])=>a+(item(s)?.uom==='kg'?packingBalance(x):0),0),packUnits=Object.entries(state.packing).reduce((a,[s,x])=>a+(item(s)?.uom==='kg'?0:packingBalance(x)),0),retailVal=Object.entries(state.retail).reduce((a,[s,x])=>a+retailBalance(x)*num(item(s)?.cost),0);let variance=state.greenLots.filter(g=>Math.abs(num(g.physical)-greenBalance(g))>.05).length+Object.values(state.packing).filter(x=>Math.abs(num(x.physical)-packingBalance(x))>.05).length+Object.values(state.retail).filter(x=>Math.abs(num(x.physical)-retailBalance(x))>.05).length;$('dash-green-kg').textContent=qty(greenKg)+' kg';$('dash-green-val').textContent='Asset: '+money(greenVal);$('dash-roast-out').textContent=qty(roastOut)+' kg';$('dash-roast-loss').textContent=(roastIn?((roastIn-roastOut)/roastIn*100):0).toFixed(1)+'%';$('dash-pack-stock').textContent=qty(packKg)+' kg / '+qty(packUnits)+' u';$('dash-retail-val').textContent=money(retailVal);$('dash-variance-alerts').textContent=variance;let totalDept=departmentsWithTotals().reduce((a,d)=>a+d.issued,0);let colors=['#3a86ff','#8338ec','#ff006e','#e63946','#fb5607','#ffbe0b','#06d6a0'];let ds=departmentsWithTotals();$('dept-breakdown-grid').innerHTML=ds.map((d,i)=>`<div class="dept-pill"><span>${esc(d.name)}</span><strong>${qty(d.issued)} kg</strong><small>${totalDept?(d.issued/totalDept*100).toFixed(1):'0.0'}% of dispatches</small></div>`).join('');$('dept-distribution-bar').innerHTML=ds.map((d,i)=>`<span class="dist-segment" style="width:${totalDept?d.issued/totalDept*100:0}%;background:${colors[i%colors.length]}" title="${esc(d.name)}"></span>`).join('');$('dept-summary-table-body').innerHTML=ds.map(d=>`<tr><td>${esc(d.name)}</td><td>${esc(d.type)}</td><td>${esc(d.code)}</td><td>${qty(d.issued)}</td><td>${totalDept?(d.issued/totalDept*100).toFixed(1):'0.0'}%</td></tr>`).join('');$('dash-recent-activity').innerHTML=state.txns.slice(0,8).map(t=>`<div class="list-row"><span>${esc(t.type)} · ${esc(t.sku||'—')}</span><span>${qty(t.qty)} ${esc(item(t.sku)?.uom||'')}</span></div>`).join('')||'<div class="empty-state">No recent movements.</div>';let low=state.items.filter(i=>{let b=0;if(i.category==='Green Coffee')b=state.greenLots.filter(g=>g.sku===i.sku).reduce((a,g)=>a+greenBalance(g),0);else if(i.category==='Roasted Coffee'||i.category==='Packaged Coffee')b=state.packing[i.sku]?packingBalance(state.packing[i.sku]):0;else b=state.retail[i.sku]?retailBalance(state.retail[i.sku]):0;return b<=num(i.reorder)&&num(i.reorder)>0});$('exec-active-skus').textContent=state.items.length;$('exec-locations').textContent=state.outlets.length+state.departments.length;$('exec-transactions').textContent=state.txns.length;$('exec-priority-alerts').textContent=low.length+variance;$('sidebar-badge-priority').textContent=low.length+variance;$('sidebar-badge-green').textContent=qty(greenKg)+' kg';$('exec-reorder-list').innerHTML=low.map(i=>`<div class="list-row"><span>${esc(i.sku)} — ${esc(i.name)}</span><span class="badge badge-danger">Reorder</span></div>`).join('')||'<div class="empty-state">No reorder priorities.</div>';$('exec-priority-list').innerHTML=variance?'<div class="list-row"><span>Physical/system variances detected</span><span class="badge badge-danger">'+variance+'</span></div>':'<div class="list-row"><span>No material variances</span><span class="badge badge-ok">Clear</span></div>'}
function ownerOutlets(){return state.outlets||[]}
function renderOwner(){
 const os=state.ownerSettings||{};
 $('owner-org-name').value=os.orgName||''; $('owner-name').value=os.ownerName||''; $('owner-email').value=os.email||''; $('owner-phone').value=os.phone||''; $('owner-address').value=os.address||'';
 const otpConfigured=!!window.__ownerResetConfigured;
 if($('owner-reset-otp-status')){ $('owner-reset-otp-status').textContent=otpConfigured?'OTP Configured':'Not Configured'; $('owner-reset-otp-status').style.color=otpConfigured?'var(--green-coffee)':'var(--danger-crimson)'; }
 const users=state.users||[]; $('owner-user-count').textContent=users.length; $('owner-active-count').textContent=users.filter(u=>u.status==='Active').length; $('owner-outlet-count').textContent=ownerOutlets().length; $('owner-role-count').textContent=new Set(users.map(u=>u.role)).size;
 $('owner-users-table-body').innerHTML=users.length?users.map(u=>{let assigned=u.outlets==='ALL'?'All outlets':(u.outlets||[]).map(id=>ownerOutlets().find(o=>o.id===id)?.name||id).join(', ')||'None';return `<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.email)}</td><td>${esc(u.role)}</td><td>${esc(assigned)}</td><td>${esc((u.permissions||[]).join(', '))}</td><td><span class="badge ${u.status==='Active'?'badge-ok':'badge-danger'}">${esc(u.status)}</span></td><td><button class="action-btn" onclick="CoffeeApp.editOwnerUser('${u.id}')">Edit</button>${u.id!=='u-owner'?`<button class="action-btn danger" onclick="CoffeeApp.deleteOwnerUser('${u.id}')">Delete</button>`:''}</td></tr>`}).join(''):`<tr><td colspan="7" class="empty-state">No users configured.</td></tr>`;
 $('owner-outlet-matrix-body').innerHTML=ownerOutlets().length?ownerOutlets().map(o=>{let us=users.filter(u=>u.outlets==='ALL'||(u.outlets||[]).includes(o.id));return `<tr><td><b>${esc(o.name)}</b></td><td>${esc(o.code)}</td><td>${esc(o.city||'')}</td><td>${us.length?esc(us.map(u=>u.name).join(', ')):'<span class="owner-muted">No users assigned</span>'}</td><td>${us.filter(u=>u.status==='Active').length}</td></tr>`}).join(''):`<tr><td colspan="5" class="empty-state">No outlets registered.</td></tr>`;
}
async function saveOwnerSettings(){if(!isOwnerClient()){toast('Owner access required','error');return}const vals={orgName:$('owner-org-name').value.trim(),ownerName:$('owner-name').value.trim(),email:$('owner-email').value.trim(),phone:$('owner-phone').value.trim(),address:$('owner-address').value.trim()};state.ownerSettings=Object.assign({},state.ownerSettings,vals);save();const {error}=await supabase.from('owner_settings').update({org_name:vals.orgName,owner_name:vals.ownerName,email:vals.email,phone:vals.phone,address:vals.address,updated_at:new Date().toISOString()}).eq('id',1);if(error){toast(error.message||'Owner settings cloud save failed','error');return}toast('Organisation settings saved')}
function openOwnerUserModal(){if(!isOwnerClient()){toast('Owner access required','error');return}resetForm('form-owner-user');$('owner-user-id').value='';$('owner-user-modal-title').innerHTML='<span>👤</span> Add Organisation User';renderOwnerUserFields();openModal('modal-owner-user')}
function renderOwnerUserFields(user){const boxes=$('owner-outlet-checkboxes');boxes.innerHTML=ownerOutlets().length?ownerOutlets().map(o=>`<label><input type="checkbox" value="${esc(o.id)}" ${user&&user.outlets!=='ALL'&&(user.outlets||[]).includes(o.id)?'checked':''}> ${esc(o.name)}</label>`).join(''):'<span class="owner-muted">Add an outlet first.</span>';if(user?.outlets==='ALL')boxes.querySelectorAll('input').forEach(x=>x.checked=true);let ps=new Set(user?.permissions||[]);qsa('#owner-permission-checkboxes input').forEach(x=>x.checked=ps.has(x.value));}
function editOwnerUser(id){if(!isOwnerClient()){toast('Owner access required','error');return}let u=state.users.find(x=>x.id===id);if(!u)return;$('owner-user-id').value=u.id;$('owner-user-modal-title').innerHTML='<span>👤</span> Edit Organisation User';$('ou-name').value=u.name;$('ou-email').value=u.email;$('ou-role').value=u.role;$('ou-status').value=u.status;renderOwnerUserFields(u);openModal('modal-owner-user')}
function deleteOwnerUser(id){if(!isOwnerClient()){toast('Owner access required','error');return}if(id==='u-owner')return;if(!confirm('Delete this organisation user?'))return;state.users=state.users.filter(u=>u.id!==id);save();toast('User removed')}
function exportUsersCSV(){if(!isOwnerClient()){toast('Owner access required','error');return}exportCSV([['Name','Email','Role','Status','Assigned Outlets','Permissions'],...(state.users||[]).map(u=>[u.name,u.email,u.role,u.status,u.outlets==='ALL'?'All outlets':(u.outlets||[]).map(id=>ownerOutlets().find(o=>o.id===id)?.name||id).join(' | '),(u.permissions||[]).join(' | ')])],'owner-users.csv')}

function ensureLoginUsers(){
  state.users=Array.isArray(state.users)?state.users:[];
  let owner=state.users.find(u=>u.role==='Owner')||state.users[0];
  if(!owner){owner={id:'u-owner',name:'Main Owner',email:'',role:'Owner',status:'Active',outlets:'ALL',permissions:['Dashboard','Inventory','Purchasing','Roastery','Reports','Import/Export','User Access']};state.users.push(owner);}
}
function securityRateLimit(key,limit=5,windowMs=10*60*1000){
  try{
    const now=Date.now(), raw=localStorage.getItem('vkSecRL:'+key);
    let a=raw?JSON.parse(raw):[]; a=a.filter(t=>now-t<windowMs);
    if(a.length>=limit){const wait=Math.ceil((windowMs-(now-a[0]))/60000);toast('Too many attempts. Try again in about '+wait+' minute(s).','error');return false}
    a.push(now);localStorage.setItem('vkSecRL:'+key,JSON.stringify(a));return true;
  }catch(e){return true}
}
function securityRateClear(key){try{localStorage.removeItem('vkSecRL:'+key)}catch(e){}}
function currentAuth(){try{return sessionStorage.getItem('vkCoffeeAuth')||localStorage.getItem('vkCoffeeRemember')||''}catch(e){return ''}}
function showLogin(){document.getElementById('vk-login-screen')?.classList.remove('vk-hidden');document.querySelector('.app-layout')?.setAttribute('aria-hidden','true')}
function hideLogin(){document.getElementById('vk-login-screen')?.classList.add('vk-hidden');document.querySelector('.app-layout')?.removeAttribute('aria-hidden')}
async function loginUser(email,password,remember){
  const e=String(email||'').trim().toLowerCase(); const pw=String(password||'');
  if(!e||!pw){toast('Email and password are required','error');return false}
  if(!securityRateLimit('login:'+e,5,10*60*1000)) return false;
  const {data,error}=await supabase.auth.signInWithPassword({email:e,password:pw});
  if(error){toast(error.message||'Invalid username or password','error');return false}
  securityRateClear('login:'+e);
  const user=data.user;
  const profile=await syncAuthenticatedProfile({user});
  if(!profile){await supabase.auth.signOut();toast('Your account profile could not be verified. Contact the Owner.','error');return false}
  if(!profile){
    profile={id:user.id,name:user.user_metadata?.name||e.split('@')[0],email:e,role:'Viewer',status:'Active',outlets:'ALL',permissions:['Dashboard']};
    state.users.push(profile);
  }
  if(profile.status==='Inactive'){await supabase.auth.signOut();toast('Your account is inactive. Contact the Owner.','error');return false}
  const auth={id:user.id,name:profile.name,role:profile.role};
  try{sessionStorage.setItem('vkCoffeeAuth',JSON.stringify(auth));if(remember)localStorage.setItem('vkCoffeeRemember',JSON.stringify(auth));else localStorage.removeItem('vkCoffeeRemember')}catch(e){}
  await loadCloudState(); renderAll(); hideLogin(); toast('Welcome back, '+profile.name); return true;
}
async function logout(){try{await supabase.auth.signOut();sessionStorage.removeItem('vkCoffeeAuth');localStorage.removeItem('vkCoffeeRemember')}catch(e){}showLogin();let f=document.getElementById('vk-login-form');if(f)f.reset()}
function findLoginUser(email){return (state.users||[]).find(u=>String(u.email||'').toLowerCase()===String(email||'').trim().toLowerCase() && u.status!=='Inactive')}
async function handleForgotPassword(){
  const email=prompt('Enter your organisation email:'); if(email===null)return;
  const e=String(email).trim().toLowerCase(); if(!e)return;
  if(!securityRateLimit('forgot:'+e,3,10*60*1000)) return;
  const {error}=await supabase.auth.resetPasswordForEmail(e,{redirectTo:window.location.href});
  if(error){toast(error.message||'Unable to send password reset email','error');return}
  toast('Password reset email sent. Check your inbox.');
}
async function handleOtpLogin(){
  const email=prompt('Enter your organisation email:'); if(email===null)return;
  const e=String(email).trim().toLowerCase();
  if(!e)return;
  if(!securityRateLimit('otp:'+e,3,10*60*1000)) return;
  const {error:sendError}=await supabase.auth.signInWithOtp({email:e,options:{shouldCreateUser:false}});
  if(sendError){toast(sendError.message||'Unable to send login OTP','error');return}
  const otp=prompt('Enter the 6-digit code sent to your email:'); if(otp===null)return;
  const {data,error}=await supabase.auth.verifyOtp({email:e,token:String(otp).trim(),type:'email'});
  if(error){toast(error.message||'Invalid OTP','error');return}
  const u=data.user; const profile=await syncAuthenticatedProfile({user:u}); if(!profile){await supabase.auth.signOut();toast('Your account profile could not be verified. Contact the Owner.','error');return}
  if(profile.status==='Inactive'){await supabase.auth.signOut();toast('Your account is inactive. Contact the Owner.','error');return}
  try{sessionStorage.setItem('vkCoffeeAuth',JSON.stringify({id:u.id,name:profile.name,role:profile.role}));localStorage.removeItem('vkCoffeeRemember')}catch(e){}
  await loadCloudState(); renderAll(); hideLogin(); toast('OTP login successful');
}
function renderAll(){populateSelects();renderGreen();renderRoastery();renderPacking();renderRetail();renderItems();renderDepartments();renderLedger();renderDashboard();renderOwner();const b=document.querySelector('#nav-owner .nav-badge');if(b)b.textContent=window.__vkProfileRole==='Owner'?'Owner':'Restricted';}
function switchTab(tab){if(tab==='owner'&&!isOwnerClient()){toast('Owner Controls are restricted to the Owner','error');tab='dashboard'}qsa('.tab-pane').forEach(x=>x.classList.remove('active'));$('tab-'+tab)?.classList.add('active');qsa('.nav-btn,.nav-sub-btn').forEach(x=>x.classList.remove('active'));$('nav-'+tab)?.classList.add('active');let labels={dashboard:'Smart Dashboard',executive:'Executive Dashboard',green:'Green Coffee',roastery:'Roastery Unit',packing:'Packing Dept',retail:'Retail & Materials',itemmaster:'Item Master',departments:'Outlets & Depts',ledger:'Audit Ledger',impexp:'Import / Export',owner:'Owner Controls'};$('topbar-page-title').textContent=labels[tab]||tab;}
function openAddItemModal(){resetForm('form-item-master');$('im-modal-title').innerHTML='<span>🏷️</span> Add Master SKU Item';openModal('modal-item-master')}
function editItem(id){let i=state.items.find(x=>x.id===id);if(!i)return;openModal('modal-item-master');$('im-modal-title').innerHTML='<span>🏷️</span> Edit Master SKU Item';$('im-edit-id').value=i.id;$('im-sku').value=i.sku;$('im-category').value=i.category;$('im-name').value=i.name;$('im-uom').value=i.uom;$('im-loss').value=i.loss;$('im-cost').value=i.cost;$('im-price').value=i.price;$('im-reorder').value=i.reorder;$('im-origin').value=i.origin||''}
function deleteItem(id){if(!confirm('Delete this item from the master? Existing transactions will remain.'))return;state.items=state.items.filter(i=>i.id!==id);save();toast('Item deleted')}
function deleteGreen(id){if(!confirm('Delete this green coffee lot?'))return;state.greenLots=state.greenLots.filter(x=>x.id!==id);save();toast('Lot deleted')}
function deleteDepartment(id){if(!confirm('Delete this department? Existing ledger entries remain.'))return;state.departments=state.departments.filter(x=>x.id!==id);save();toast('Department deleted')}
function deleteOutlet(id){if(!confirm('Delete this outlet?'))return;let o=state.outlets.find(x=>x.id===id);state.outlets=state.outlets.filter(x=>x.id!==id);if(o)state.departments=state.departments.filter(d=>d.code!==o.code);save();toast('Outlet deleted')}
function setGreenPhysical(id){let g=state.greenLots.find(x=>x.id===id);if(!g)return;let v=prompt('Enter physical count (kg):',g.physical);if(v===null)return;g.physical=num(v);log('PHYSICAL_COUNT','Green Coffee',g.sku,v,g.lot,'Physical count updated');save();toast('Physical count updated')}
function setPackingPhysical(sku){let x=state.packing[sku];let v=prompt('Enter physical count:',x.physical);if(v===null)return;x.physical=num(v);log('PHYSICAL_COUNT','Packing',sku,v,'','Physical count updated');save();toast('Physical count updated')}
function setRetailPhysical(sku){let x=state.retail[sku];let v=prompt('Enter physical count:',x.physical);if(v===null)return;x.physical=num(v);log('PHYSICAL_COUNT','Retail',sku,v,'','Physical count updated');save();toast('Physical count updated')}
function openNewRoastModal(){resetForm('form-roast-batch');setTxnDateDefaults();openModal('modal-new-roast')}
function openGreenPurchaseModal(){resetForm('form-green-purchase');setTxnDateDefaults();openModal('modal-green-purchase')}
function openIssueToRoasteryModal(){resetForm('form-issue-roastery');setTxnDateDefaults();openModal('modal-issue-roastery')}
function openRetailPurchaseModal(){resetForm('form-retail-purchase');setTxnDateDefaults();openModal('modal-retail-purchase')}
function openRetailIssueModal(){resetForm('form-retail-issue');setTxnDateDefaults();openModal('modal-retail-issue')}
function exportCSV(rows,name){const safe=v=>{let x=String(v??'');return /^[=+\-@]/.test(x)?'\t'+x:x};let csv=rows.map(r=>r.map(v=>`"${safe(v).replace(/"/g,'""')}"`).join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
function exportGreenCoffeeCSV(){exportCSV([['SKU','Lot','Supplier','Opening kg','Purchases kg','Issued kg','Closing kg','Physical kg','Variance kg','Cost/kg','Asset'],...state.greenLots.map(g=>[g.sku,g.lot,g.supplier,g.opening,g.purchases,g.issued,greenBalance(g),g.physical,g.physical-greenBalance(g),g.cost,greenBalance(g)*g.cost])],'green-coffee-inventory.csv')}
function exportRoasteryCSV(){exportCSV([['Batch','Date','Green SKU','Roasted SKU','Green In kg','Roasted Out kg','Loss kg','Loss %','Machine','Profile'],...state.roasts.map(r=>[r.batch,r.date,r.greenSku,r.roastedSku,r.greenIn,r.roastedOut,r.greenIn-r.roastedOut,r.greenIn?(r.greenIn-r.roastedOut)/r.greenIn*100:0,r.machine,r.profile])],'roastery-batches.csv')}
function exportPackingCSV(){exportCSV([['SKU','Item','Opening','Receiving','Issued','Closing','Physical','Variance'],...Object.entries(state.packing).map(([s,x])=>[s,item(s)?.name||'',x.opening,x.receiving,x.issued,packingBalance(x),x.physical,x.physical-packingBalance(x)])],'packing-inventory.csv')}
function exportRetailCSV(){exportCSV([['SKU','Item','Category','Opening','Receiving','Issued','Closing','Physical','Variance','Asset'],...Object.entries(state.retail).map(([s,x])=>[s,item(s)?.name||'',item(s)?.category||'',x.opening,x.receiving,x.issued,retailBalance(x),x.physical,x.physical-retailBalance(x),retailBalance(x)*num(item(s)?.cost)])],'retail-inventory.csv')}
function exportItemMasterCSV(){exportCSV([['SKU_Code','Item_Name','Category','UOM','Target_Roasting_Loss_Pct','Cost_Price','Selling_Price','Reorder_Level','Origin'],...state.items.map(i=>[i.sku,i.name,i.category,i.uom,i.loss,i.cost,i.price,i.reorder,i.origin])],'item-master.csv')}
function exportDatabaseJSON(){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='coffee-inventory-backup.json';a.click();URL.revokeObjectURL(a.href);toast('Database backup downloaded')}
async function updateOwnerResetOTP(){
  if(!isOwnerClient()){toast('Owner access required','error');return}
  let current=String($('owner-current-otp')?.value||'').trim();
  let next=String($('owner-new-otp')?.value||'').trim();
  if(!/^\d{6}$/.test(next)){toast('New reset OTP must be exactly 6 digits','error');return;}
  const {data,error}=await supabase.from('owner_settings').select('reset_otp_hash').eq('id',1).maybeSingle();
  if(error){toast(error.message||'Unable to read Owner security settings','error');return}
  if(data?.reset_otp_hash){
    if(!/^\d{6}$/.test(current) || await sha256Hex(current)!==data.reset_otp_hash){toast('Current OTP is incorrect','error');return}
  }
  const hash=await sha256Hex(next);
  const {error:updateError}=await supabase.from('owner_settings').update({reset_otp_hash:hash,updated_at:new Date().toISOString()}).eq('id',1);
  if(updateError){toast(updateError.message||'Unable to update Owner reset security','error');return}
  window.__ownerResetConfigured=true;
  if($('owner-current-otp'))$('owner-current-otp').value='';
  if($('owner-new-otp'))$('owner-new-otp').value='';
  renderOwner();
  toast(data?.reset_otp_hash?'Owner reset OTP updated securely':'Owner reset OTP configured securely');
}
async function openProtectedReset(){
  if(!isOwnerClient()){toast('Owner access required — reset blocked','error');return}
  const {data,error}=await supabase.from('owner_settings').select('reset_otp_hash').eq('id',1).maybeSingle();
  if(error){toast(error.message||'Unable to verify Owner security','error');return}
  const hash=String(data?.reset_otp_hash||'');
  if(!hash){toast('Set an Owner Reset OTP first in Owner Controls','error');return}
  let entered=prompt('OWNER SECURITY VERIFICATION\n\nEnter the 6-digit Owner Reset OTP:');
  if(entered===null)return;
  if(!/^\d{6}$/.test(String(entered).trim()) || await sha256Hex(String(entered).trim())!==hash){toast('Incorrect Owner Reset OTP — reset blocked','error');return}
  let confirmText=prompt('DANGER: This will replace ALL current local data with the demo dataset.\n\nType RESET to continue:');
  if(confirmText!=='RESET'){if(confirmText!==null)toast('Reset cancelled — confirmation text did not match');return;}
  if(!confirm('Final confirmation: Replace ALL current operational data with the demo dataset?'))return;
  state=demo();
  state.ownerSettings=Object.assign({},state.ownerSettings,{orgName:'Coffee & Retails'});
  save();
  renderAll();
  toast('Demo dataset restored. Owner security settings were preserved.');
}
function resetToDemoData(){openProtectedReset()}
function handleImportJSON(e){let f=e.target.files?.[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.items||!x.txns)throw Error('Invalid backup');state=Object.assign(demo(),x);save();toast('Database restored')}catch(err){toast('Invalid JSON backup','error')}};r.readAsText(f)}
function handleImportItemMasterCSV(e){let f=e.target.files?.[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let lines=r.result.split(/\r?\n/).filter(Boolean);let head=lines.shift().split(',').map(x=>x.replace(/^"|"$/g,''));let idx={};head.forEach((h,i)=>idx[h.trim()]=i);let added=0;for(const line of lines){let cols=line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(x=>x.replace(/^"|"$/g,''));let sku=cols[idx.SKU_Code];if(!sku)continue;let ex=state.items.find(i=>i.sku===sku);let obj={id:ex?.id||uid('ITEM'),sku,name:cols[idx.Item_Name]||sku,category:cols[idx.Category]||'Green Coffee',uom:cols[idx.UOM]||'kg',loss:num(cols[idx.Target_Roasting_Loss_Pct]),cost:num(cols[idx.Cost_Price]),price:num(cols[idx.Selling_Price]),reorder:num(cols[idx.Reorder_Level]),origin:cols[idx.Origin]||''};if(ex)Object.assign(ex,obj);else state.items.push(obj);added++}save();toast(added+' items imported')}catch(err){toast('CSV import failed','error')}};r.readAsText(f)}
function submit(id,fn){$(id)?.addEventListener('submit',e=>{e.preventDefault();try{fn();}catch(err){console.error(err);toast(err.message||'Unable to save','error')}})}
submit('form-owner-user',async()=>{if(!isOwnerClient())throw Error('Owner access required');let id=$('owner-user-id').value.trim(),name=$('ou-name').value.trim(),email=$('ou-email').value.trim().toLowerCase();if(!name||!email)throw Error('Name and email are required');let outlets=Array.from(document.querySelectorAll('#owner-outlet-checkboxes input:checked')).map(x=>x.value);let permissions=Array.from(document.querySelectorAll('#owner-permission-checkboxes input:checked')).map(x=>x.value);if(!permissions.length)throw Error('Select at least one permission');let role=$('ou-role').value,status=$('ou-status').value;let ex=state.users.find(x=>x.id===id);if(ex){ex.name=name;ex.email=email;ex.role=role;ex.status=status;ex.outlets=outlets.length===ownerOutlets().length?'ALL':outlets;ex.permissions=permissions;if(ex.role==='Owner')ex.outlets='ALL';closeModal('modal-owner-user');save();toast('User profile updated');return}let password=$('ou-password').value;if(password.length<8)throw Error('Initial password must be at least 8 characters');const {data,error}=await supabase.auth.signUp({email,password,options:{data:{name,role,status}}});if(error)throw error;if(!data.user)throw Error('User account could not be created');let authUser=data.user;const {error:profileError}=await supabase.from('profiles').upsert({id:authUser.id,name,email,role,status,updated_at:new Date().toISOString()});if(profileError)throw profileError;await supabase.from('user_outlets').delete().eq('user_id',authUser.id);let assigned=role==='Owner'?ownerOutlets().map(o=>o.id):outlets;if(assigned.length)await supabase.from('user_outlets').insert(assigned.map(outlet_id=>({user_id:authUser.id,outlet_id})));await supabase.from('user_permissions').delete().eq('user_id',authUser.id);if(permissions.length)await supabase.from('user_permissions').insert(permissions.map(permission=>({user_id:authUser.id,permission})));let u={id:authUser.id,name,email,role,status,outlets:role==='Owner'?'ALL':(outlets.length===ownerOutlets().length?'ALL':outlets),permissions};state.users.push(u);save();closeModal('modal-owner-user');$('ou-password').value='';if(data.session){await supabase.auth.signOut();toast('User created. The initial password is ready. Please log back in as Owner.')}else{toast('User created. If email confirmation is enabled, the user must confirm their email before first login.')}});
submit('form-green-purchase',()=>{let d=validTxnDate($('gp-date').value,'Purchase Date'),sku=$('gp-sku').value,q=num($('gp-qty').value),g=state.greenLots.find(x=>x.sku===sku&&x.lot===($('gp-lot').value||'NO-LOT'));if(g){g.purchases+=q;g.cost=num($('gp-cost').value)||g.cost}else{g={id:uid('LOT'),sku,lot:$('gp-lot').value||('LOT-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-4)),supplier:$('gp-supplier').value||'',opening:0,purchases:q,issued:0,physical:q,cost:num($('gp-cost').value)||num(item(sku)?.cost)};state.greenLots.push(g)}log('PURCHASE','Green Coffee',sku,q,g.lot,$('gp-supplier').value,d);closeModal('modal-green-purchase');save();toast('Green coffee purchase recorded')});
submit('form-issue-roastery',()=>{let d=validTxnDate($('ir-date').value,'Issue Date'),sku=$('ir-sku').value,q=num($('ir-qty').value),g=state.greenLots.find(x=>x.sku===sku);if(!g||greenBalance(g)<q)throw Error('Insufficient green coffee stock');g.issued+=q;log('ISSUE_TO_ROASTERY','Green Coffee',sku,q,'ROASTERY',$('ir-notes').value,d);closeModal('modal-issue-roastery');save();toast('Green coffee issued to roastery')});
submit('form-roast-batch',()=>{let rd=validTxnDate($('rb-date').value,'Roast Date'),td=validTxnDate($('rb-transfer-date').value,'Transfer to Packing Date');if(td<rd)throw Error('Transfer to Packing Date cannot be before Roast Date');let gs=$('rb-green-sku').value,rs=$('rb-roasted-sku').value,gin=num($('rb-green-in').value),out=num($('rb-roasted-out').value);if(out>gin)throw Error('Roasted output cannot exceed green input');let g=state.greenLots.find(x=>x.sku===gs);if(!g||greenBalance(g)<gin)throw Error('Insufficient staged green coffee');let r={id:uid('ROAST'),batch:'RB-'+rd.replace(/-/g,'')+'-'+String(state.roasts.length+1).padStart(3,'0'),date:dateToISO(rd),transferDate:td,entryAt:now(),greenSku:gs,roastedSku:rs,greenIn:gin,roastedOut:out,machine:$('rb-machine').value,profile:$('rb-profile').value,notes:$('rb-notes').value};state.roasts.push(r);state.packing[rs] ||= {opening:0,receiving:0,issued:0,physical:0};state.packing[rs].receiving+=out;state.packing[rs].physical+=out;log('ROAST_COMPLETE','Roastery',gs,gin,rs,'Roast date '+rd+'; output '+out+' kg; loss '+(gin-out).toFixed(2)+' kg',rd);log('TRANSFER_TO_PACKING','Packing',rs,out,'PACKING','Transferred from Roastery on '+td,td);closeModal('modal-new-roast');save();toast('Roast batch and packing transfer recorded')});
submit('form-packing-issue',()=>{let d=validTxnDate($('pi-date').value,'Issue / Consumption Date'),sku=$('pi-sku').value,dept=$('pi-dept').value,q=num($('pi-qty').value),x=state.packing[sku]||{opening:0,receiving:0,issued:0,physical:0};if(packingBalance(x)<q)throw Error('Insufficient packing stock');x.issued+=q;state.packing[sku]=x;log('DEPT_ISSUE','Packing',sku,q,dept,$('pi-slip').value+' '+$('pi-notes').value,d);closeModal('modal-packing-issue');save();toast('Coffee issue / consumption recorded')});
submit('form-retail-purchase',()=>{let d=validTxnDate($('rp-date').value,'Purchase Date'),sku=$('rp-sku').value,q=num($('rp-qty').value),x=state.retail[sku]||{opening:0,receiving:0,issued:0,physical:0};x.receiving+=q;x.physical+=q;state.retail[sku]=x;log('PURCHASE','Retail',sku,q,$('rp-supplier').value,'Retail/packaging purchase',d);closeModal('modal-retail-purchase');save();toast('Retail purchase recorded')});
submit('form-retail-issue',()=>{let d=validTxnDate($('ri-date').value,'Issue / Consumption Date'),sku=$('ri-sku').value,dept=$('ri-dept').value,q=num($('ri-qty').value),x=state.retail[sku]||{opening:0,receiving:0,issued:0,physical:0};if(retailBalance(x)<q)throw Error('Insufficient retail stock');x.issued+=q;state.retail[sku]=x;log('DEPT_ISSUE','Retail',sku,q,dept,$('ri-notes').value,d);closeModal('modal-retail-issue');save();toast('Retail issue / consumption recorded')});
submit('form-new-dept',()=>{let code=$('dept-new-code').value.trim();if(state.departments.some(d=>d.code===code))throw Error('Department code already exists');state.departments.push({id:uid('DEPT'),code,name:$('dept-new-name').value.trim(),type:$('dept-new-type').value,role:'Custom Department'});closeModal('modal-new-department');save();toast('Department registered')});
submit('form-new-outlet',()=>{let code=$('outlet-new-code').value.trim();if(state.outlets.some(o=>o.code===code))throw Error('Outlet code already exists');let o={id:uid('OUT'),code,name:$('outlet-new-name').value.trim(),city:$('outlet-new-city').value.trim(),format:$('outlet-new-format').value,manager:$('outlet-new-manager').value.trim(),address:$('outlet-new-address').value.trim()};state.outlets.push(o);state.departments.push({id:uid('DEPT'),code:o.code,name:o.name,type:'Outlet',role:'Cafe Outlet'});closeModal('modal-new-outlet');save();toast('Cafe outlet registered')});
submit('form-item-master',()=>{let id=$('im-edit-id').value,sku=$('im-sku').value.trim();if(state.items.some(i=>i.sku===sku&&i.id!==id))throw Error('SKU already exists');let obj={id:id||uid('ITEM'),sku,category:$('im-category').value,name:$('im-name').value.trim(),uom:$('im-uom').value.trim(),loss:num($('im-loss').value),cost:num($('im-cost').value),price:num($('im-price').value),reorder:num($('im-reorder').value),origin:$('im-origin').value.trim()};let ex=state.items.find(i=>i.id===id);if(ex)Object.assign(ex,obj);else state.items.push(obj);closeModal('modal-item-master');save();toast(id?'Item updated':'Item added')});

document.getElementById('vk-login-form')?.addEventListener('submit',e=>{
 e.preventDefault();
 loginUser(document.getElementById('vk-login-user').value,document.getElementById('vk-login-pass').value,document.getElementById('vk-remember').checked);
});
document.getElementById('vk-login-eye')?.addEventListener('click',()=>{
 let p=document.getElementById('vk-login-pass');p.type=p.type==='password'?'text':'password';
});
document.getElementById('vk-forgot')?.addEventListener('click',handleForgotPassword);
document.getElementById('vk-otp-login')?.addEventListener('click',handleOtpLogin);
qsa('.modal-overlay').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));
['green-search-input','roastery-search-input','packing-search-input','retail-search-input','item-master-search-input','item-master-category-filter'].forEach(id=>$(id)?.addEventListener('input',renderAll));
$('mobile-menu-toggle')?.addEventListener('click',()=>document.querySelector('.sidebar')?.classList.toggle('mobile-open'));
window.CoffeeApp={switchTab,openModal,closeModal,openAddItemModal,editItem,deleteItem,deleteGreen,deleteDepartment,deleteOutlet,setGreenPhysical,setPackingPhysical,setRetailPhysical,openNewRoastModal,openGreenPurchaseModal,openIssueToRoasteryModal,openRetailPurchaseModal,openRetailIssueModal,exportGreenCoffeeCSV,exportRoasteryCSV,exportPackingCSV,exportRetailCSV,exportItemMasterCSV,exportDatabaseJSON,resetToDemoData,handleImportJSON,handleImportItemMasterCSV,openOwnerUserModal,editOwnerUser,deleteOwnerUser,saveOwnerSettings,exportUsersCSV,logout};
ensureLoginUsers();renderAll();setTxnDateDefaults();switchTab('dashboard');
(async function initSupabase(){
  try{
    const {data:{session}}=await supabase.auth.getSession();
    if(session){
      const profile=await syncAuthenticatedProfile(session);
      if(!profile){await supabase.auth.signOut();showLogin();return}
      await loadCloudState();
      await loadOwnerSecurity();
      renderAll();
      hideLogin();
    } else {showLogin();}
    supabase.auth.onAuthStateChange((event,session)=>{
      if(event==='SIGNED_OUT'){window.__vkCloudReady=false;showLogin();}
      if(event==='SIGNED_IN' && session){syncAuthenticatedProfile(session).then(profile=>{if(!profile)return supabase.auth.signOut();return loadCloudState()}).then(()=>loadOwnerSecurity()).then(()=>{if(window.__vkProfileRole){renderAll();hideLogin();}}).catch(()=>showLogin());}
    });
  }catch(e){console.error(e);showLogin();toast('Unable to connect to Supabase','error')}
})();
})();
