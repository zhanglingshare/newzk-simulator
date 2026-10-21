/* NewZK V5 structural sandbox: compares graph topology only; does not modify ZK or infer economic losses. */
(function(){
'use strict';
const svg=document.getElementById('net'), search=document.getElementById('lab5Find');
if(!svg || !window.ZK)return;
const $=id=>document.getElementById(id);
const ids=ZK.NO.map(n=>n[0]);
const idSet=new Set(ids);
const key=(a,b)=>[a,b].sort().join('|');
const edges=ZK.LK.map(l=>({a:l[0],b:l[1],id:key(l[0],l[1]),uncertain:!!l[3]}));
let removedNodes=new Set(),removedLinks=new Set(),history=[],selected=null,mode='base';
const DEFAULT={x:0,y:0,w:1240,h:920};let viewport={...DEFAULT};
function cloneState(){return {nodes:[...removedNodes],links:[...removedLinks]};}
function graphMetrics(nodesOff,linksOff){
  const nodes=ids.filter(n=>!nodesOff.has(n)),active=new Set(nodes);
  const adj=new Map(nodes.map(n=>[n,[]]));
  let nEdges=0;
  edges.forEach(e=>{
    if(!active.has(e.a)||!active.has(e.b)||linksOff.has(e.id))return;
    adj.get(e.a).push(e.b);adj.get(e.b).push(e.a);nEdges++;
  });
  const seen=new Set();let components=0,largest=0,isolated=0;
  nodes.forEach(id=>{
    if(!adj.get(id).length)isolated++;
    if(seen.has(id))return;components++;
    const stack=[id];seen.add(id);let size=0;
    while(stack.length){
      const u=stack.pop();size++;
      adj.get(u).forEach(v=>{if(!seen.has(v)){seen.add(v);stack.push(v);}});
    }
    largest=Math.max(largest,size);
  });
  return {nodes:nodes.length,edges:nEdges,components,largest,isolated};
}
const base=graphMetrics(new Set(),new Set());
function setViewport(){
  const minW=1240/3.2;
  viewport.w=Math.max(minW,Math.min(DEFAULT.w,viewport.w));
  viewport.h=viewport.w*920/1240;
  viewport.x=Math.max(0,Math.min(1240-viewport.w,viewport.x));
  viewport.y=Math.max(0,Math.min(920-viewport.h,viewport.y));
  svg.setAttribute('viewBox',[viewport.x,viewport.y,viewport.w,viewport.h].join(' '));
  $('lab5ZoomState').textContent=Math.round(124000/viewport.w)+'%';
  refreshPaint();
}
function zoom(factor,x=viewport.x+viewport.w/2,y=viewport.y+viewport.h/2){
  const oldW=viewport.w,oldH=viewport.h;
  const newW=Math.max(1240/3.2,Math.min(1240,oldW/factor));
  const newH=newW*920/1240;
  viewport.x=x-(x-viewport.x)*newW/oldW;
  viewport.y=y-(y-viewport.y)*newH/oldH;
  viewport.w=newW;viewport.h=newH;setViewport();
}
function locateClient(e){
  const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;
  const m=svg.getScreenCTM();return m?p.matrixTransform(m.inverse()):{x:620,y:460};
}
function centerAt(x,y){zoom(1.9);viewport.x=x-viewport.w/2;viewport.y=y-viewport.h/2;setViewport();}
function select(entity){
  selected=entity;
  $('lab5SearchStatus').hidden=true;
  $('lab5Selection').textContent=!entity?'点击任一主体或连线，开始结构假设实验。':entity.type==='node'
    ?'当前主体：'+ZK.nm(entity.id)+' · '+(removedNodes.has(entity.id)?'B方案已移除':'B方案仍保留')
    :'当前关系：'+ZK.nm(entity.a)+' — '+ZK.nm(entity.b)+' · '+(removedLinks.has(entity.id)?'B方案已断开':'B方案仍保留');
  $('lab5Toggle').textContent=!entity?'先选择主体或连线':entity.type==='node'
    ?(removedNodes.has(entity.id)?'恢复此主体':'在B方案移除此主体')
    :(removedLinks.has(entity.id)?'恢复此关系':'在B方案断开此关系');
  $('lab5Toggle').disabled=!entity;
  refreshPaint();
}
function refreshPaint(){
  const test=mode==='test',scale=1240/viewport.w;
  svg.querySelectorAll('.node').forEach(g=>{
    const id=g.dataset.n;
    const off=test&&removedNodes.has(id);
    g.classList.toggle('lab5-off',off);
    g.classList.toggle('lab5-picked',!!selected&&selected.type==='node'&&selected.id===id);
    const label=g.querySelector('text');
    const ly=ZK.layerOf(id);
    const important=ly==='chain'||ly==='oem'||ly==='park';
    const related=selected?.type==='node'&&edges.some(e=>(e.a===selected.id&&e.b===id)||(e.b===selected.id&&e.a===id));
    if(label)label.classList.toggle('lab5-hide-label',scale<1.35&&!important&&!related&&selected?.id!==id);
  });
  svg.querySelectorAll('.link').forEach(l=>{
    const ekey=key(l.dataset.a,l.dataset.b);
    const gone=test&&(removedLinks.has(ekey)||removedNodes.has(l.dataset.a)||removedNodes.has(l.dataset.b));
    l.classList.toggle('lab5-cut',gone);
    l.classList.toggle('lab5-picked',!!selected&&selected.type==='edge'&&selected.id===ekey);
  });
}
function renderStats(){
  const m=graphMetrics(removedNodes,removedLinks);
  const pair=[
    ['主体',base.nodes,m.nodes],['关系',base.edges,m.edges],
    ['最大连通群',base.largest,m.largest],['连通分组',base.components,m.components]
  ];
  $('lab5Stats').innerHTML=pair.map(([label,a,b])=>'<div><span>'+label+'</span><b>'+a+' → '+b+'</b><small>'+(a===b?'未变化':(b-a>0?'+':'')+(b-a))+'</small></div>').join('');
  $('lab5Note').textContent=(removedNodes.size+removedLinks.size===0)
    ?'当前与原始结构相同。请选择主体或连线，在B方案暂时关闭；原数据始终保留。'
    :'当前假设中移除'+removedNodes.size+'个主体、断开'+removedLinks.size+'条关系。这里比较的是网络连通性，不代表真实企业退出、产值损失或因果传导。';
  $('lab5Undo').disabled=history.length===0;
  $('lab5Reset').disabled=removedNodes.size+removedLinks.size===0;
  refreshPaint();
}
function chooseMode(next){
  mode=next;
  $('lab5ModeBase').classList.toggle('active',next==='base');
  $('lab5ModeTest').classList.toggle('active',next==='test');
  $('lab5ModeBase').setAttribute('aria-pressed',String(next==='base'));
  $('lab5ModeTest').setAttribute('aria-pressed',String(next==='test'));
  refreshPaint();
}
$('lab5ModeBase').onclick=()=>chooseMode('base');
$('lab5ModeTest').onclick=()=>chooseMode('test');
$('lab5Toggle').onclick=()=>{
  if(!selected)return;history.push(cloneState());
  const set=selected.type==='node'?removedNodes:removedLinks;const id=selected.id;
  set.has(id)?set.delete(id):set.add(id);
  chooseMode('test');select(selected);renderStats();
};
$('lab5Undo').onclick=()=>{
  const prev=history.pop();if(!prev)return;
  removedNodes=new Set(prev.nodes);removedLinks=new Set(prev.links);
  select(selected);renderStats();
};
$('lab5Reset').onclick=()=>{
  history=[];removedNodes.clear();removedLinks.clear();chooseMode('base');select(selected);renderStats();
};
$('lab5Save').onclick=()=>{
  const state={type:'network-topology',version:1,removedNodes:[...removedNodes],removedLinks:[...removedLinks],base,experiment:graphMetrics(removedNodes,removedLinks),savedAt:new Date().toISOString(),note:'Topology scenario only; not an output of the economic simulation'};
  try{localStorage.setItem('newzk-lab-network-v1',JSON.stringify(state));$('lab5Note').textContent='已保存到当前浏览器。原模型和原始网络未修改；此记录不是全站共享。';}
  catch(e){$('lab5Note').textContent='本机存储不可用，未保存本次实验。';}
};
function find(){
  const q=search.value.trim().toLowerCase();
  const n=ZK.NO.find(n=>n[1].toLowerCase().includes(q));
  if(!q)return;
  if(!n){$('lab5SearchStatus').hidden=false;$('lab5SearchStatus').textContent='没有找到匹配主体。请换一个名称。';return;}
  select({type:'node',id:n[0]});
  const p=typeof pos!=='undefined'?pos[n[0]]:[n[3],n[4]];
  centerAt(p[0],p[1]);
}
$('lab5FindBtn').onclick=find;
search.addEventListener('keydown',e=>{if(e.key==='Enter')find();});
$('lab5ZoomIn').onclick=()=>zoom(1.35);
$('lab5ZoomOut').onclick=()=>zoom(1/1.35);
$('lab5ZoomReset').onclick=()=>{viewport={...DEFAULT};setViewport();};
svg.addEventListener('click',e=>{
  const node=e.target.closest('.node');
  if(node){select({type:'node',id:node.dataset.n});return;}
  const line=e.target.closest('.link');
  if(line){select({type:'edge',a:line.dataset.a,b:line.dataset.b,id:key(line.dataset.a,line.dataset.b)});}
});
svg.addEventListener('wheel',e=>{
  e.preventDefault();const p=locateClient(e);zoom(e.deltaY<0?1.16:1/1.16,p.x,p.y);
},{passive:false});
const pointers=new Map();let dragView=null,pinchDist=null;
svg.addEventListener('pointerdown',e=>{
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){
    const ps=[...pointers.values()];pinchDist=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);
    dragView=null;
  }else if(pointers.size===1&&!e.target.closest('.node')){
    dragView={x:e.clientX,y:e.clientY,view:{...viewport}};
    try{svg.setPointerCapture(e.pointerId);}catch(err){}
  }
});
svg.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2&&pinchDist){
    const ps=[...pointers.values()],d=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);
    if(d&&pinchDist){zoom(d/pinchDist);pinchDist=d;}
  }else if(dragView&&pointers.size===1){
    const rect=svg.getBoundingClientRect();
    viewport.x=dragView.view.x-(e.clientX-dragView.x)*dragView.view.w/rect.width;
    viewport.y=dragView.view.y-(e.clientY-dragView.y)*dragView.view.h/rect.height;
    setViewport();
  }
});
function release(e){pointers.delete(e.pointerId);dragView=null;if(pointers.size<2)pinchDist=null;}
svg.addEventListener('pointerup',release);svg.addEventListener('pointercancel',release);
svg.addEventListener('pointerleave',e=>{if(!pointers.size)dragView=null;});
new MutationObserver(refreshPaint).observe(svg,{childList:true});
const stored=(()=>{try{return JSON.parse(localStorage.getItem('newzk-lab-network-v1')||'null');}catch(e){return null;}})();
if(stored&&stored.type==='network-topology'){
  removedNodes=new Set((stored.removedNodes||[]).filter(id=>idSet.has(id)));
  const validEdges=new Set(edges.map(e=>e.id));
  removedLinks=new Set((stored.removedLinks||[]).filter(id=>validEdges.has(id)));
}
$('lab5Toggle').disabled=true;
renderStats();setViewport();chooseMode('base');
})();