/* NewZK V10. Live model-backed editorial close-up and direct bridge into V5 structural A/B lab.
   Optical flow ≠ measured logistics or capital flow; broken links ≠ real disruptions. */
(function(){
'use strict';
if(typeof ZK==='undefined')return;
const $=id=>document.getElementById(id);
if(!$('v10Graph'))return;
const NS='http://www.w3.org/2000/svg';
const key=(a,b)=>[a,b].sort().join('|');
const nodes=new Map(ZK.NO.map(n=>[n[0],n]));
const degrees=new Map(ZK.NO.map(n=>[n[0],0]));
const edges=ZK.LK.map(l=>({a:l[0],b:l[1],id:key(l[0],l[1]),uncertain:!!l[3]}));
const keys=new Set(edges.map(e=>e.id));
const neighbors=new Map(ZK.NO.map(n=>[n[0],[]]));
edges.forEach(e=>{degrees.set(e.a,degrees.get(e.a)+1);degrees.set(e.b,degrees.get(e.b)+1);
 neighbors.get(e.a).push(e);neighbors.get(e.b).push(e);});
const sorted=[...ZK.NO].sort((a,b)=>degrees.get(b[0])-degrees.get(a[0]));
const best=sorted[0][0];
const cuts={
 hub:{focus:best,edge:['n4','n53'],label:'最大枢纽',title:'真正重要的是：它连向了谁？',
  desc:'这些是真实列在模型中的连接。光点不表示实测流向，也不代表链主的因果控制力。'},
 uncertain:{focus:'n53',edge:['n53','n52'],label:'待核实关系',title:'一根虚线，意味着证据还不够。',
  desc:'生产性服务业与消费承接这条联系，在当前模型中被标为待核实。你可以在B方案暂时断开，观察拓扑如何变化。'},
 life:{focus:'n52',edge:['n52','n54'],label:'消费承接',title:'一个城市能留住多少生活需求？',
  desc:'人才公寓与消费承接之间是待核实连接；图形只能呈现结构假设，不回答真实消费留存率。'}
};
for(const cut of Object.values(cuts)){
 if(!nodes.has(cut.focus)||!keys.has(key(...cut.edge)))throw Error('V10 references unknown model relation');
}
let current='hub',focusId=best,focusEdge=[...cuts.hub.edge],mode='base',flow=true;
let state={nodes:[],links:[],mode:'base',base:{nodes:ZK.NO.length,edges:ZK.LK.length,largest:0,components:0},experiment:{nodes:ZK.NO.length,edges:ZK.LK.length,largest:0,components:0}};
let lastRemovalKey='',ready=false;
const element=(tag,attrs={},txt)=>{
 const el=document.createElementNS(NS,tag);
 for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));
 if(txt!=null)el.textContent=txt;
 return el;
};
const name=id=>nodes.get(id)?.[1]||id;
const write=(id,txt)=>{const n=$(id);if(n)n.textContent=String(txt);};
const center={x:420,y:263},swing=[-1,1],positions=[
 [99,130],[267,72],[531,72],[723,143],[713,377],[523,452],[294,460],[103,369],[415,54]
];
function edgeActive(e,scenario){
 if(scenario==='base')return true;
 return !state.nodes.includes(e.a)&&!state.nodes.includes(e.b)&&!state.links.includes(e.id);
}
function nodeActive(id,scenario){return scenario==='base'||!state.nodes.includes(id);}
function svgGraph(){
 const wires=$('v10Wires'),particles=$('v10Particles'),nodeGroup=$('v10NodeGroup'),fx=$('v10Fx');
 wires.replaceChildren();particles.replaceChildren();nodeGroup.replaceChildren();fx.replaceChildren();
 let selected=neighbors.get(focusId)||[];
 selected=[...selected].sort((x,y)=>{
   const keyHit=e=>e.id===key(...focusEdge)?9999:degrees.get(e.a===focusId?e.b:e.a);
   return keyHit(y)-keyHit(x);
 }).slice(0,8);
 const viewed=new Set([focusId]);
 const broken=mode==='test';
 selected.forEach((e,i)=>{
   const neighbor=e.a===focusId?e.b:e.a;
   viewed.add(neighbor);
   const [x,y]=positions[i];
   const controlX=(center.x+x)/2+(i%2?16:-16),controlY=(center.y+y)/2+(i%2?-28:28);
   const path='M'+center.x+' '+center.y+' Q'+controlX+' '+controlY+' '+x+' '+y;
   const featured=e.id===key(...focusEdge),active=edgeActive(e,mode);
   const l=element('path',{d:path,class:'v10-wire'+(e.uncertain?' uncertain':'')+(featured?' is-featured':'')+(!active?' is-removed':''),'data-key':e.id});
   wires.append(l);
   if(active&&flow){
     const p=element('circle',{r:featured?5:3.1,class:'v10-light'+(e.uncertain?' uncertain':'')});
     const m=element('animateMotion',{path,dur:(2+(i%4)*.55)+'s',begin:'-'+(i*.37).toFixed(2)+'s',repeatCount:'indefinite'});
     p.append(m);particles.append(p);
   }
   const isDisabled=!nodeActive(neighbor,mode);
   const g=element('g',{class:'v10-node'+(isDisabled?' is-disabled':'')+(featured?' is-selected':''),
    transform:'translate('+x+' '+y+')',role:'button',tabindex:'0','aria-label':name(neighbor)+'，模型关系，可切换到此主体'});
   g.append(element('circle',{class:'v10-node-aura',r:22}),element('circle',{class:'v10-node-core',r:8}));
   const label=element('text',{x:0,y:i<=3?-24:33,'text-anchor':'middle'},name(neighbor).slice(0,10)+(name(neighbor).length>10?'…':''));
   g.append(label,element('circle',{class:'v10-hitbox',r:38}));
   g.addEventListener('click',()=>pickCustom(neighbor));
   g.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();pickCustom(neighbor);}});
   nodeGroup.append(g);
   if(featured&&!active){
     // Model-backed scenario cut: keep two fragments visibly separated at the middle of this specific link.
     const start={x:center.x,y:center.y},end={x,y},control={x:controlX,y:controlY};
     const curve=t=>({x:(1-t)*(1-t)*start.x+2*(1-t)*t*control.x+t*t*end.x,
       y:(1-t)*(1-t)*start.y+2*(1-t)*t*control.y+t*t*end.y});
     for(const [a,b] of [[0,.38],[.62,1]]){
       const points=Array.from({length:10},(_,j)=>curve(a+(b-a)*j/9));
       const d='M'+points.map(p=>p.x.toFixed(1)+' '+p.y.toFixed(1)).join('L');
       fx.append(element('path',{d,class:'v10-trace'}));
     }
     const mid=curve(.5);
     for(let j=0;j<3;j++)fx.append(element('circle',{cx:mid.x,cy:mid.y,r:12+j*9,class:'v10-orbit-pulse'}));
     for(let j=0;j<9;j++){
       const angle=j*Math.PI*2/9,r=22;
       fx.append(element('circle',{cx:mid.x+Math.cos(angle)*r,cy:mid.y+Math.sin(angle)*r,r:2.2+j%2,class:'v10-dust'}));
     }
   }
 });
 const hub=element('g',{class:'v10-node is-center'+(nodeActive(focusId,mode)?'':' is-disabled'),
   transform:'translate('+center.x+' '+center.y+')',role:'button',tabindex:0,'aria-label':'当前焦点：'+name(focusId)});
 hub.append(element('circle',{class:'v10-node-aura',r:43}),element('circle',{class:'v10-node-core',r:17}));
 hub.append(element('text',{x:0,y:58,'text-anchor':'middle'},name(focusId).slice(0,12)));
 hub.append(element('text',{x:0,y:78,'text-anchor':'middle',class:'v10-node-meta'},degrees.get(focusId)+'条模型关系'));
 nodeGroup.append(hub);
 write('v10FocusName',name(focusId));
 write('v10EdgeLabel',name(focusEdge[0])+' —— '+name(focusEdge[1]));
 const e=edges.find(x=>x.id===key(...focusEdge)),isOff=state.nodes.includes(e.a)||state.nodes.includes(e.b)||state.links.includes(e.id);
 write('v10EdgeStatus',e.uncertain?'证据状态：待核实'+(isOff?' · B已断开':''):'证据状态：模型已记录'+(isOff?' · B已断开':''));
 write('v10HeadNodes',ZK.NO.length);write('v10HeadEdges',ZK.LK.length);
 write('v10HeadUnknown',edges.filter(x=>x.uncertain).length);
 $('v10Stage').dataset.networkMode=mode;
 $('v10Stage').classList.toggle('flow-paused',!flow);
 const button=$('v10FlowToggle');button.textContent=flow?'Ⅱ 暂停光流':'▶ 继续光流';button.setAttribute('aria-pressed',String(flow));
}
function metrics(){
 const b=state.base,m=state.experiment,linksOff=state.links.length,nodesOff=state.nodes.length;
 write('v10AEdges',b.edges);write('v10BEdges',m.edges);
 write('v10Largest',b.largest+' → '+m.largest);
 write('v10Components',b.components+' → '+m.components);
 const uncertainty=edges.filter(e=>e.uncertain&&edgeActive(e,'test')).length;
 write('v10Uncertain',uncertainty+' / '+edges.filter(e=>e.uncertain).length+'（B/A）');
 write('v10Difference',linksOff+nodesOff===0?'A、B目前一致。选择一条关系，从实验开始。':
   'B少了 '+(b.edges-m.edges)+' 条关系 · 最大连通群 '+(m.largest-b.largest>=0?'+':'')+(m.largest-b.largest)+
   ' · 连通组 '+(m.components-b.components>=0?'+':'')+(m.components-b.components));
 const e=edges.find(x=>x.id===key(...focusEdge));
 if(e){
   const off=state.links.includes(e.id)||state.nodes.includes(e.a)||state.nodes.includes(e.b);
   $('v10Cut').disabled=false;
   $('v10Cut').innerHTML=off?'在 B 方案恢复这条关系 <span>↶</span>':'在 B 方案断开这条关系 <span>✕</span>';
 }
 $('v10Undo').disabled=!!document.getElementById('lab5Undo')?.disabled;
 $('v10Reset').disabled=nodesOff+linksOff===0;
 $('v10ModeBase').classList.toggle('active',mode==='base');
 $('v10ModeTest').classList.toggle('active',mode==='test');
 $('v10ModeBase').setAttribute('aria-pressed',String(mode==='base'));
 $('v10ModeTest').setAttribute('aria-pressed',String(mode==='test'));
}
function focusScene(which){
 current=which;
 const cut=cuts[which];
 focusId=cut.focus;focusEdge=[...cut.edge];
 document.querySelectorAll('.v10-stage-actions button').forEach(b=>{
  const yes=b.dataset.focus===which;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));
 });
 write('v10LineKind','当前视角：'+cut.label);
 write('v10FocusHeadline',cut.title);
 write('v10FocusDescription',cut.desc);
 svgGraph();metrics();
}
function pickCustom(id){
 if(!nodes.has(id))return;
 focusId=id;current='custom';
 const related=[...neighbors.get(id)].sort((a,b)=>(Number(b.uncertain)-Number(a.uncertain))||(degrees.get(b.a===id?b.b:b.a)-degrees.get(a.a===id?a.b:a.a)));
 focusEdge=related[0]?[related[0].a,related[0].b]:[...cuts.hub.edge];
 document.querySelectorAll('.v10-stage-actions button').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});
 write('v10LineKind','当前视角：自选主体');
 write('v10FocusHeadline',name(id)+' · '+degrees.get(id)+' 条记录关联');
 write('v10FocusDescription','近景只显示此主体最多8条关联。点击“进入完整68主体实验台”进行全图筛选与其他实验。');
 window.NewZKNetworkLab?.focusNode(id);
 svgGraph();metrics();
}
function updateFromLab(next){
 if(!next)return;
 const old=lastRemovalKey;
 state={...next,nodes:[...(next.nodes||[])],links:[...(next.links||[])]};
 mode=state.mode==='test'?'test':'base';
 lastRemovalKey=state.nodes.join(',')+'|'+state.links.join(',');
 metrics();svgGraph();
 if(old&&lastRemovalKey!==old&&mode==='test')$('v10Stage').classList.add('v10-changed');
}
window.addEventListener('newzk:topology',event=>updateFromLab(event.detail));
document.querySelectorAll('.v10-stage-actions button').forEach(b=>b.addEventListener('click',()=>focusScene(b.dataset.focus)));
$('v10ModeBase').addEventListener('click',()=>window.NewZKNetworkLab?.view('base'));
$('v10ModeTest').addEventListener('click',()=>window.NewZKNetworkLab?.view('test'));
$('v10Cut').addEventListener('click',()=>{
 if(!keys.has(key(...focusEdge)))return;
 window.NewZKNetworkLab?.toggleLink(...focusEdge);
});
$('v10Undo').addEventListener('click',()=>window.NewZKNetworkLab?.undo());
$('v10Reset').addEventListener('click',()=>window.NewZKNetworkLab?.reset());
$('v10FlowToggle').addEventListener('click',()=>{flow=!flow;svgGraph();});
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)flow=false;
const initial=window.NewZKNetworkLab?.snapshot();if(initial)updateFromLab(initial);
focusScene('hub');
})();