/* NewZK V14 — unlockable free-play arcade.
 * Uses recorded ZK.NO/LK links to generate three eight-character neighborhoods.
 * Only the visible subgraph is used to judge alternate paths. Clicking a line
 * changes this ephemeral toy scene, NEVER ZK, V5 network experiment, or saved data.
 */
(function(){
'use strict';
if(typeof ZK==='undefined'||!document.getElementById('v14Secret'))return;
const $=id=>document.getElementById(id);
const svgNS='http://www.w3.org/2000/svg';
const names=new Map(ZK.NO.map(n=>[n[0],n[1]]));
const key=(a,b)=>[a,b].sort().join('|');
const master=ZK.LK.map(e=>({a:e[0],b:e[1],key:key(e[0],e[1]),uncertain:!!e[3]}));
const sites={
 battery:{label:'⚡ 电池城',theme:'battery',ids:['n4','n13','n21','n22','n23','n24','n33','n39']},
 mobile:{label:'📱 手机城',theme:'mobile',ids:['n9','n1','n15','n16','n17','n18','n34','n45']},
 life:{label:'🌙 夜生活',theme:'life',ids:['n52','n53','n54','n56','n57','n58','n59','n60']}
};
const positions=[[450,267],[182,119],[425,67],[688,116],[767,303],[638,474],[373,487],[136,349]];
let activeArea='battery',cuts=new Set(),totalCuts=0;
const byName=id=>names.get(id)||id;
function elem(tag,props={},value){
 const el=document.createElementNS(svgNS,tag);
 for(const [k,v] of Object.entries(props))el.setAttribute(k,String(v));
 if(value!==undefined)el.textContent=value;
 return el;
}
const graphData={};
for(const [slug,site] of Object.entries(sites)){
 const ids=new Set(site.ids);
 if(site.ids.some(id=>!names.has(id)))throw Error('Unknown model node in '+slug);
 const links=master.filter(e=>ids.has(e.a)&&ids.has(e.b));
 if(links.length<6)throw Error('Secret stage lacks meaningful grounded links: '+slug);
 graphData[slug]={...site,edges:links};
}
function bfs(a,b,edges,blocked){
 const adj=new Map(sites[activeArea].ids.map(id=>[id,[]]));
 for(const e of edges){
  if(blocked.has(e.key))continue;
  adj.get(e.a).push(e.b);adj.get(e.b).push(e.a);
 }
 const queue=[a],seen=new Set([a]),parents=new Map();
 for(let i=0;i<queue.length;i++){
  const at=queue[i];
  if(at===b){
   const path=[b];let cur=b;
   while(parents.has(cur)){cur=parents.get(cur);path.unshift(cur);}
   return path;
  }
  for(const n of adj.get(at))if(!seen.has(n)){seen.add(n);parents.set(n,at);queue.push(n);}
 }
 return null;
}
function disconnected(edges){
 const root=sites[activeArea].ids[0],out=[];
 for(const id of sites[activeArea].ids)if(!bfs(root,id,edges,cuts))out.push(id);
 return out;
}
const points=new Map();
function makePath(a,b,i){
 const p=points.get(a),q=points.get(b);
 const cx=(p.x+q.x)/2+(i%3-1)*18,cy=(p.y+q.y)/2+(i%4-1.5)*14;
 return {d:'M'+p.x+' '+p.y+' Q'+cx+' '+cy+' '+q.x+' '+q.y,middle:{x:(p.x+2*cx+q.x)/4,y:(p.y+2*cy+q.y)/4}};
}
function scene(){
 const site=graphData[activeArea],edgeLayer=$('v14Edges'),nodes=$('v14Nodes'),light=$('v14Lights'),fx=$('v14Sparks');
 edgeLayer.replaceChildren();nodes.replaceChildren();light.replaceChildren();fx.replaceChildren();
 points.clear();site.ids.forEach((id,i)=>points.set(id,{x:positions[i][0],y:positions[i][1]}));
 const orphaned=new Set(disconnected(site.edges));
 $('v14Secret').dataset.area=activeArea;
 site.edges.forEach((e,i)=>{
  const isCut=cuts.has(e.key),shape=makePath(e.a,e.b,i);
  const line=elem('path',{d:shape.d,class:'v14-link'+(isCut?' is-cut':'')+(e.uncertain?' is-uncertain':''),
    'data-edge':e.key});
  edgeLayer.append(line);
  const touch=elem('path',{d:shape.d,class:'v14-edge-hit',tabindex:0,role:'button',
    'aria-label':(isCut?'恢复':'剪断')+' '+byName(e.a)+' 与 '+byName(e.b)+' 的游戏连接'});
  touch.addEventListener('click',()=>toggle(e));
  touch.addEventListener('keydown',event=>{
   if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle(e);}
  });
  edgeLayer.append(touch);
  if(!isCut){
   // Optical shimmer is visual-only; it does not signify measured directional flow.
   const dot=elem('circle',{r:e.uncertain?3.7:3.2,class:'v14-glimmer'+(e.uncertain?' is-uncertain':'')});
   dot.append(elem('animateMotion',{path:shape.d,dur:(2.1+(i%4)*.41).toFixed(2)+'s',
    begin:(-i*.21).toFixed(2)+'s',repeatCount:'indefinite'}));
   light.append(dot);
  }else{
   const mid=shape.middle;
   fx.append(elem('circle',{cx:mid.x,cy:mid.y,r:7,class:'v14-cut-dot'}));
  }
 });
 site.ids.forEach((id,i)=>{
  const p=points.get(id);
  const g=elem('g',{class:'v14-character'+(i===0?' is-hero':'')+(orphaned.has(id)?' is-stranded':''),
   transform:'translate('+p.x+' '+p.y+')'});
  g.append(elem('circle',{r:i===0?42:34,class:'v14-character-halo'}));
  g.append(elem('circle',{r:i===0?34:28,class:'v14-character-core'}));
  const n=byName(id),short=n.length>7?n.slice(0,7)+'…':n;
  g.append(elem('text',{'text-anchor':'middle',y:i===0?62:51,class:'v14-character-name'},short));
  g.append(elem('circle',{r:i===0?12:9,class:'v14-character-dot'}));
  nodes.append(g);
 });
 $('v14AreaLabel').textContent=site.label;
 $('v14Combo').textContent=cuts.size+' 刀连击';
 document.querySelectorAll('.v14-place').forEach(b=>{
  const selected=b.dataset.area===activeArea;
  b.classList.toggle('is-active',selected);b.setAttribute('aria-pressed',String(selected));
 });
}
function toggle(e){
 const site=graphData[activeArea],removed=cuts.has(e.key);
 if(removed)cuts.delete(e.key);
 else{cuts.add(e.key);totalCuts++;}
 const alternate=removed?null:bfs(e.a,e.b,site.edges,cuts);
 const isolated=disconnected(site.edges);
 scene();
 $('v14Secret').classList.remove('v14-impact');
 void $('v14Secret').offsetWidth;
 $('v14Secret').classList.add('v14-impact');
 if(removed){
  $('v14ResultType').textContent='♻️ 线路恢复';
  $('v14Result').textContent='接上啦，马上继续闪耀！';
 }else if(alternate){
  $('v14ResultType').textContent='✨ 绕路彩蛋';
  $('v14Result').textContent='剪了也没散！还有 '+(alternate.length-1)+' 段小路能绕过去！';
 }else if(isolated.length){
  $('v14ResultType').textContent='💥 这下真的有人落单';
  $('v14Result').textContent='哎呀！'+byName(isolated[0])+' 暂时掉队了！';
 }else{
  $('v14ResultType').textContent='⚡ 连线被剪开';
  $('v14Result').textContent='这两个小伙伴在此街区暂时连不上啦！';
 }
 if(!removed&&cuts.size===3){
  $('v14ResultType').textContent='🏆 三刀连击达成';
  $('v14Result').textContent='三连斩！这个街区由你掌控！';
 }
}
function selectArea(next){
 if(!graphData[next])return;
 activeArea=next;cuts=new Set();
 $('v14ResultType').textContent='新街区解锁';
 $('v14Result').textContent='挑一条你想剪的线，试试看！';
 scene();
}
function open(){
 const section=$('v14Secret');section.hidden=false;
 selectArea('battery');
 section.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}
function close(){
 $('v14Secret').hidden=true;
 $('v12Final').scrollIntoView({behavior:'smooth',block:'start'});
}
document.querySelectorAll('.v14-place').forEach(button=>button.addEventListener('click',()=>selectArea(button.dataset.area)));
$('v14Reset').addEventListener('click',()=>selectArea(activeArea));
$('v14SecretOpen').addEventListener('click',open);
$('v14SecretClose').addEventListener('click',close);
scene();
})();