/* NewZK V8: cinematic structural impact micro-story, strictly a visual metaphor.
   Reads the same visible nine-node vignette; never calls ZK.run or mutates any model links.
   Three variants (rupture, congestion, extraction) share an ~8 second visual timeline.
*/
(function(){
'use strict';
const root=document.querySelector('.portal-core');
const svg=document.getElementById('portalGraph');
if(!root||!svg)return;
const wires=Array.from(document.querySelectorAll('#portalLinks .portal-wire'));
const nodes=Array.from(document.querySelectorAll('#portalNodes .portal-node'));
if(wires.length<2||nodes.length<3)return;
const $=id=>document.getElementById(id);
const ns='http://www.w3.org/2000/svg';
const scenes={
 rupture:{
   title:'一条待核实的关系，突然失去连接。',
   desc:'演示“流动→中断→周边响应”；真实关系是否中断，现有数据并未证实。',
   phases:['光流稳定 / FLOW','异常警报 / WARNING','关系裂变 / FRACTURE','冲击可视化 / ECHO','断点残影 / AFTERMATH']
 },
 congestion:{
   title:'不是没有流量，而是被卡在一处。',
   desc:'用光点堆积表达“承接瓶颈”的概念；这里不计算真实运输量或堵塞位置。',
   phases:['光流稳定 / FLOW','局部变慢 / SLOWDOWN','流动堆积 / BOTTLENECK','拥堵涟漪 / PRESSURE','流量滞留 / REMAINS']
 },
 extraction:{
   title:'一个强节点退场，光流还会一样吗？',
   desc:'只是节点抽离的视觉比喻，不代表任何企业已退出或模型推演结果。',
   phases:['网络运转 / FLOW','信号变弱 / WARNING','节点抽离 / WITHDRAW','连接暗淡 / FADE','留下空位 / TRACE']
 }
};
const stages=[
 {at:0,name:'flow',label:0},
 {at:1820,name:'warning',label:1},
 {at:2700,name:'break',label:2},
 {at:3400,name:'wave',label:3},
 {at:5360,name:'aftermath',label:4}
];
const cycleMs=8000;
let scene='rupture',phase='flow',paused=false,elapsed=0,startedAt=0,timeouts=[],ticker=null,hasReducedMotion=false;
try{hasReducedMotion=!!window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(err){}
const criticalIndex=Math.max(0,wires.findIndex(w=>w.classList.contains('uncertain')));
const keyWire=wires[criticalIndex];
const keyPath=keyWire.getAttribute('d')||'';
const coord=(keyPath.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
if(coord.length!==6)return;
const P0={x:coord[0],y:coord[1]},C={x:coord[2],y:coord[3]},P1={x:coord[4],y:coord[5]};
const point=t=>({x:(1-t)*(1-t)*P0.x+2*(1-t)*t*C.x+t*t*P1.x,
 y:(1-t)*(1-t)*P0.y+2*(1-t)*t*C.y+t*t*P1.y});
const mid=point(.5);
const svgEl=(tag,attrs={})=>{
 const el=document.createElementNS(ns,tag);
 for(const [key,val] of Object.entries(attrs))el.setAttribute(key,String(val));
 return el;
};
const energy=$('portalEnergy'),fx=$('portalImpactFX');
if(!energy||!fx)return;
const paths=[];
wires.forEach((line,i)=>{
 const path=svgEl('path',{d:line.getAttribute('d'),class:'portal-energy-line'+(i===criticalIndex?' is-critical':''),
  'data-flow-edge':String(i)});
 energy.appendChild(path);paths.push(path);
 if(i%2===0||i===criticalIndex){
   const particle=svgEl('circle',{r:i===criticalIndex?4.8:3.4,class:'portal-energy-particle'+(i===criticalIndex?' is-critical':'')});
   const motion=svgEl('animateMotion',{dur:(i===criticalIndex?1.8:2.5)+'s',begin:'-'+(i*.31).toFixed(2)+'s',
    repeatCount:'indefinite',path:line.getAttribute('d')});
   particle.appendChild(motion);energy.appendChild(particle);
 }
});
keyWire.classList.add('portal-critical-wire');
const frag=tRange=>{
 const pts=Array.from({length:17},(_,i)=>point(tRange[0]+(tRange[1]-tRange[0])*i/16));
 return 'M'+pts.map(p=>p.x.toFixed(1)+' '+p.y.toFixed(1)).join('L');
};
fx.appendChild(svgEl('path',{d:frag([0,.42]),class:'portal-cut-piece cut-from-center'}));
fx.appendChild(svgEl('path',{d:frag([.58,1]),class:'portal-cut-piece cut-to-neighbor'}));
fx.appendChild(svgEl('circle',{cx:mid.x,cy:mid.y,r:18,class:'portal-impact-flash'}));
fx.appendChild(svgEl('circle',{cx:mid.x,cy:mid.y,r:8,class:'portal-impact-flash-core'}));
for(let i=0;i<3;i++){
 const ripple=svgEl('circle',{cx:mid.x,cy:mid.y,r:20+i*10,class:'portal-impact-ripple'});
 ripple.style.setProperty('--ring-delay',(i*.22)+'s');
 fx.appendChild(ripple);
}
for(let i=0;i<12;i++){
 const angle=i*Math.PI/6,inner=11,outer=24+(i%3)*7;
 const x1=mid.x+Math.cos(angle)*inner,y1=mid.y+Math.sin(angle)*inner;
 const x2=mid.x+Math.cos(angle)*outer,y2=mid.y+Math.sin(angle)*outer;
 const shard=svgEl('line',{x1,y1,x2,y2,class:'portal-impact-shard'});
 shard.style.setProperty('--shard-delay',(i%4*.025)+'s');fx.appendChild(shard);
}
for(let i=0;i<7;i++){
 const t=.30+(i%5)*.034;
 const p=point(t);
 const bubble=svgEl('circle',{cx:p.x,cy:p.y,r:3.4+i%3*1.5,class:'portal-impact-backpressure'});
 bubble.style.setProperty('--pulse-delay',(i*.11)+'s');fx.appendChild(bubble);
}
const target=nodes[criticalIndex];
if(target)target.classList.add('portal-impact-primary');
for(const i of [(criticalIndex+1)%8,(criticalIndex+6)%8]){
 nodes[i]?.classList.add('portal-impact-secondary');
}
nodes[nodes.length-1]?.classList.add('portal-impact-center');
function updateNarrative(){
 const cfg=scenes[scene];
 $('portalImpactTitle').textContent=cfg.title;
 $('portalImpactDescription').textContent=cfg.desc;
 $('portalImpactCount').textContent=String(['rupture','congestion','extraction'].indexOf(scene)+1).padStart(2,'0')+' / 03';
 const index=Math.max(0,stages.findLastIndex?stages.findLastIndex(s=>s.name===phase):stages.reduce((a,s,i)=>s.name===phase?i:a,0));
 $('portalImpactPhase').textContent=cfg.phases[index];
}
function setPhase(name){
 phase=name;root.dataset.phase=name;updateNarrative();
}
function updateClock(value){
 $('portalImpactRuntime').textContent='00:'+String(Math.floor(value/1000)).padStart(2,'0')+' / 00:08';
}
function clearTimers(){
 for(const id of timeouts)clearTimeout(id);timeouts=[];
 if(ticker!==null){clearInterval(ticker);ticker=null;}
}
function timelineFrom(offset){
 clearTimers();
 startedAt=Date.now();
 const current=stages.reduce((now,s)=>s.at<=offset?s.name:now,'flow');
 setPhase(current);updateClock(offset);
 for(const s of stages){
   if(s.at>offset){timeouts.push(setTimeout(()=>setPhase(s.name),s.at-offset));}
 }
 timeouts.push(setTimeout(()=>beginCycle(),cycleMs-offset));
 ticker=setInterval(()=>{
   const now=Math.min(cycleMs,offset+(Date.now()-startedAt));
   elapsed=now;updateClock(now);
 },150);
}
function repaintProgress(offset=0){
 const bar=root.querySelector('.portal-impact-progress > i');
 if(!bar)return;
 bar.style.animation='none';
 // Force a timeline reset so manual replay always visibly restarts.
 void bar.offsetWidth;
 bar.style.animation='';
 bar.style.animationDelay='-'+(offset/1000)+'s';
}
function beginCycle(){
 clearTimers();elapsed=0;paused=false;
 root.classList.remove('is-paused');root.classList.add('is-running');
 repaintProgress(0);timelineFrom(0);setPauseLabel();
}
function pause(){
 if(paused)return;
 elapsed=Math.min(cycleMs,elapsed+(Date.now()-startedAt));
 clearTimers();paused=true;root.classList.add('is-paused');setPauseLabel();updateClock(elapsed);
}
function resume(){
 if(!paused)return;
 paused=false;root.classList.remove('is-paused');setPauseLabel();timelineFrom(elapsed);
}
function setPauseLabel(){
 const button=$('portalImpactPause');
 button.textContent=paused?'▶ 播放':'Ⅱ 暂停';
 button.setAttribute('aria-pressed',String(paused));
 button.setAttribute('aria-label',paused?'继续播放当前结构短片':'暂停当前结构短片');
}
function switchScene(next){
 if(!scenes[next])return;
 scene=next;root.dataset.scene=scene;
 document.querySelectorAll('.portal-impact-tab').forEach(button=>{
   const active=button.dataset.scene===scene;
   button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));
 });
 if(hasReducedMotion){clearTimers();paused=true;root.classList.remove('is-running');root.classList.add('is-paused');elapsed=5360;setPhase('aftermath');updateClock(elapsed);setPauseLabel();}
 else{beginCycle();}
}
document.querySelectorAll('.portal-impact-tab').forEach(button=>button.addEventListener('click',()=>switchScene(button.dataset.scene)));
$('portalImpactReplay').addEventListener('click',()=>{if(hasReducedMotion)root.classList.remove('is-paused');beginCycle();});
$('portalImpactPause').addEventListener('click',()=>paused?resume():pause());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused)pause();});
root.dataset.scene=scene;
if(hasReducedMotion){paused=true;root.classList.add('is-paused');setPhase('aftermath');updateClock(5360);setPauseLabel();}
else beginCycle();
})();