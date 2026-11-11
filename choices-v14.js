/* NewZK V14: five cinematic future gates.
   This experience uses the existing five path names/notes as its source vocabulary.
   City visuals are artistic metaphors only: not maps, forecasts, project renderings, or simultaneous-feasibility claims. */
(function(){
'use strict';
if(typeof ZK==='undefined'||!document.getElementById('v14World'))return;
const $=id=>document.getElementById(id);
const world=$('v14World');
const roads=[...ZK.ROADS];
const expected=['链主做强','新赛道抢跑','园区扩容','服务补短','城市与人'];
if(expected.some((x,i)=>roads[i]!==x))throw Error('V14 story expects current five ZK.ROADS in original order');
const story={
 '链主做强':{
   code:'GATE 01 / CHAIN LEADER',
   mood:'今晚的城市关键词：轰鸣、扩张、链主',
   head:'工厂灯光一路亮到深夜。',
   copy:'链主做强不是“多一个大企业”的故事，而是一整片配套、技术、标准和品牌都围着它加速。',
   hue:'#74e6f7'
 },
 '新赛道抢跑':{
   code:'GATE 02 / NEW FRONTIER',
   mood:'今晚的城市关键词：机器人、数据、低空',
   head:'天空和厂房，都开始多出新角色。',
   copy:'AI+制造、低空经济和未来产业像一批突然上线的新插件，让这座工业城出现陌生又兴奋的玩法。',
   hue:'#c49cff'
 },
 '园区扩容':{
   code:'GATE 03 / EXPAND THE MAP',
   mood:'今晚的城市关键词：吊塔、新路、空间',
   head:'城市边界像被重新拉开。',
   copy:'园区扩容最直观的不是一张规划表，而是更多空间、厂房、道路和平台一起长出来。',
   hue:'#78e4d0'
 },
 '服务补短':{
   code:'GATE 04 / STAY FOR THE NIGHT',
   mood:'今晚的城市关键词：商圈、服务、烟火气',
   head:'下班以后，这座城还不想睡。',
   copy:'生产性服务、消费和首发经济被点亮后，工业区之外开始出现另一种城市节奏。',
   hue:'#ffd08e'
 },
 '城市与人':{
   code:'GATE 05 / PEOPLE FIRST',
   mood:'今晚的城市关键词：学校、医院、公园、家',
   head:'终于，镜头从厂房转向了人。',
   copy:'教育、医疗、安居和体育空间不会让天际线最高，却可能让一座产业城更像一座真正愿意留下来的城市。',
   hue:'#ff9ea9'
 }
};
let current='链主做强',visited=new Set([current]),allOn=false,randomTimer=null;
function updateButtons(){
 document.querySelectorAll('.v14-gates button[data-road]').forEach(btn=>{
  const active=btn.dataset.road===current&&!allOn;
  btn.classList.toggle('is-active',active);
  btn.classList.toggle('is-visited',visited.has(btn.dataset.road));
  btn.setAttribute('aria-pressed',String(active));
 });
}
function updateCopy(){
 if(allOn){
   $('v14SceneCode').textContent='SECRET GATE / ALL LIGHTS ON';
   $('v14SceneTitle').textContent='全城开灯';
   $('v14Mood').textContent='五种城市气质，一次全部上线';
   $('v14Headline').textContent='这一刻，整座城市同时发光。';
   $('v14Copy').textContent='这是通关后的视觉彩蛋，只表示五种路径可以同时被想象，不代表现实资源允许全部目标同时拉满。';
 }else{
   const s=story[current];
   $('v14SceneCode').textContent=s.code;
   $('v14SceneTitle').textContent=current;
   $('v14Mood').textContent=s.mood;
   $('v14Headline').textContent=s.head;
   $('v14Copy').textContent=s.copy;
   world.style.setProperty('--v14-accent',s.hue);
 }
 $('v14Visited').textContent=allOn?'秘密模式':'已探索 '+visited.size+' / 5';
}
function burst(){
 const city=document.querySelector('.v14-city');
 city.classList.remove('v14-burst');
 void city.offsetWidth;
 city.classList.add('v14-burst');
 window.setTimeout(()=>city.classList.remove('v14-burst'),850);
}
function selectRoad(name,{quiet=false}={}){
 if(!story[name])return;
 allOn=false;current=name;visited.add(name);
 world.dataset.road=name;
 world.dataset.all='no';
 updateButtons();updateCopy();
 if(!quiet)burst();
 if(visited.size===roads.length)$('v14Unlock').hidden=false;
}
function randomTravel(){
 clearInterval(randomTimer);
 let pool=roads.filter(r=>r!==current),index=0;
 const seq=[...pool].sort(()=>.5-Math.random()).slice(0,3);
 $('v14Random').disabled=true;$('v14Random').textContent='穿越中…';
 selectRoad(seq[0]);
 randomTimer=window.setInterval(()=>{
   index++;
   if(index>=seq.length){
     clearInterval(randomTimer);randomTimer=null;
     $('v14Random').disabled=false;$('v14Random').textContent='⟳ 随机穿越';
     return;
   }
   selectRoad(seq[index]);
 },620);
}
function allLights(){
 allOn=true;visited=new Set(roads);
 world.dataset.all='yes';
 world.dataset.road='all';
 updateButtons();updateCopy();$('v14Unlock').hidden=true;burst();
}
function openBackstage(){
 const details=$('v14Backstage');details.open=true;
 window.dispatchEvent(new Event('resize'));
 details.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}
document.querySelectorAll('.v14-gates button[data-road]').forEach(btn=>btn.addEventListener('click',()=>selectRoad(btn.dataset.road)));
$('v14Random').addEventListener('click',randomTravel);
$('v14AllOn').addEventListener('click',allLights);
$('v14BackstageOpen').addEventListener('click',openBackstage);
$('v14Backstage').addEventListener('toggle',()=>{if($('v14Backstage').open)window.dispatchEvent(new Event('resize'));});
window.addEventListener('hashchange',()=>{
 if(['#v14Backstage','#lab5PathInputs','#radar','#rank','#dist'].includes(window.location.hash))openBackstage();
});
if(['#v14Backstage','#lab5PathInputs','#radar','#rank','#dist'].includes(window.location.hash))openBackstage();
selectRoad(current,{quiet:true});
})();