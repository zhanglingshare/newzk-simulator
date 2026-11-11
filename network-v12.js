/* NewZK V12: one-button, two-scene structural learning game.
  Actual edges and all graph metrics from ZK.NO/LK. This ONLY illustrates topology.
  Neither user scenarios nor the original model are modified by this educational animation. */
(function(){
'use strict';
if(typeof ZK==='undefined'||!document.getElementById('v12Graph'))return;
const $=id=>document.getElementById(id);
const ns='http://www.w3.org/2000/svg';
const titleOf=new Map(ZK.NO.map(n=>[n[0],n[1]]));
const name=id=>titleOf.get(id)||id;
const key=(a,b)=>[a,b].sort().join('|');
const links=ZK.LK.map(l=>({a:l[0],b:l[1],key:key(l[0],l[1]),uncertain:!!l[3]}));
const present=new Set(links.map(l=>l.key));
const scenes=[
 {name:'第一关 · 还有另一条联系吗？',
  intro:'这三个主体彼此相连。试试拿掉一条，看它们还有没有别的联系。',
  nodes:[{id:'n4',x:153,y:278,role:'left'},{id:'n13',x:743,y:278,role:'right'},{id:'n21',x:449,y:88,role:'above'}],
  edges:[['n4','n13',450,346],['n4','n21',278,119],['n21','n13',617,113]],
  target:['n4','n13'],
  start:'这条关系暂时连着。',kicker:'第一根 / 亿纬锂能 ↔ 储能系统集成',
  reveal:'断了，但还连得上！',revealCopy:'看上面：它们还能通过「锂电正极」形成另一条模型关联路径。',
  nextAction:'→ 再断另一条'},
 {name:'第二关 · 如果只有这一根联系？',
  intro:'这一次，跨区通勤在当前模型中，只通过一条关系连接其他主体。再试一次。',
  nodes:[{id:'n48',x:133,y:91,role:'above'},{id:'n54',x:198,y:266,role:'left'},{id:'n38',x:472,y:266,role:'center'},{id:'n55',x:765,y:266,role:'right'}],
  edges:[['n48','n54',111,186],['n54','n38',328,322],['n38','n55',619,325]],
  target:['n38','n55'],
  start:'这里只有一条记录关联。',kicker:'第二根 / 深惠城际 ↔ 跨区通勤',
  reveal:'这次，它被隔开了。',revealCopy:'在目前这张模型网里，「跨区通勤」暂时没有其他连接；不代表现实城际交通发生中断。',
  nextAction:'→ 我懂了'}
];
for(const scene of scenes){
 for(const [a,b] of scene.edges)if(!present.has(key(a,b)))throw Error('Scene must use an existing ZK edge: '+key(a,b));
}
function metrics(without){
 const adj=new Map(ZK.NO.map(n=>[n[0],[]]));
 let ecount=0;
 for(const e of links){if(e.key===without)continue;adj.get(e.a).push(e.b);adj.get(e.b).push(e.a);ecount++;}
 let components=0,largest=0,seen=new Set();
 for(const id of adj.keys()){
  if(seen.has(id))continue;components++;let stack=[id],size=0;seen.add(id);
  while(stack.length){const n=stack.pop();size++;for(const v of adj.get(n))if(!seen.has(v)){seen.add(v);stack.push(v);}}
  largest=Math.max(largest,size);
 }
 return {edges:ecount,components,largest};
}
const original=metrics(null);
const changed=scenes.map(s=>metrics(key(...s.target)));
if(!(original.edges===104&&original.components===3&&original.largest===66))throw Error('Expected source graph changed, inspect game story metrics');
if(!(changed[0].edges===103&&changed[0].components===3&&changed[0].largest===66))throw Error('First storyline topology changed');
if(!(changed[1].edges===103&&changed[1].components===4&&changed[1].largest===65))throw Error('Second storyline topology changed');
function el(tag,attrs={},content){
 const e=document.createElementNS(ns,tag);
 for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));
 if(content!=null)e.textContent=content;
 return e;
}
const point=(s,c,t)=>({x:(1-t)*(1-t)*s.x+2*(1-t)*t*c.x+t*t*s.ex,y:(1-t)*(1-t)*s.y+2*(1-t)*t*c.y+t*t*s.ey});
let chapter=0,cut=false;
function render(){
 const game=$('v12Game'),scene=scenes[chapter];
 game.dataset.chapter=String(chapter+1);game.dataset.cut=cut?'yes':'no';
 const edges=$('v12GraphEdges'),signals=$('v12GraphSignals'),nodes=$('v12GraphNodes'),impact=$('v12GraphImpact');
 edges.replaceChildren();signals.replaceChildren();nodes.replaceChildren();impact.replaceChildren();
 const positions=new Map(scene.nodes.map(n=>[n.id,{x:n.x,y:n.y}]));
 for(let i=0;i<scene.edges.length;i++){
  const [a,b,cx,cy]=scene.edges[i];
  const from=positions.get(a),to=positions.get(b);
  const d='M'+from.x+' '+from.y+' Q'+cx+' '+cy+' '+to.x+' '+to.y;
  const active=key(a,b)===key(...scene.target);
  const wire=el('path',{d,class:'v12-link'+(active?' is-target':chapter===0&&cut?' is-bypass':''),
    'data-edge':key(a,b)});
  edges.append(wire);
  if(active){
   const touch=el('path',{d,class:'v12-hit-target',role:'button',tabindex:'0','aria-label':'断开当前高亮的模型关系'});
   touch.addEventListener('click',()=>{$('v12Action').click();});
   touch.addEventListener('keydown',evt=>{if(evt.key==='Enter'||evt.key===' '){evt.preventDefault();$('v12Action').click();}});
   edges.append(touch);
   if(cut){
    const q=t=>{const u=1-t;return{x:u*u*from.x+2*u*t*cx+t*t*to.x,y:u*u*from.y+2*u*t*cy+t*t*to.y}};
    for(const [start,end,index] of [[0,.37,0],[.63,1,1]]){
     const pts=Array.from({length:16},(_,j)=>q(start+(end-start)*j/15));
     impact.append(el('path',{d:'M'+pts.map(p=>p.x.toFixed(1)+' '+p.y.toFixed(1)).join('L'),class:'v12-fragment fragment-'+index}));
    }
    const middle=q(.5);
    impact.append(el('circle',{cx:middle.x,cy:middle.y,r:15,class:'v12-shock-wave'}));
    impact.append(el('circle',{cx:middle.x,cy:middle.y,r:7,class:'v12-impact-core'}));
    for(let j=0;j<8;j++){
     const ang=j*Math.PI/4,rad=20+j%3*6;
     impact.append(el('path',{d:'M'+(middle.x+Math.cos(ang)*9)+' '+(middle.y+Math.sin(ang)*9)+'L'+(middle.x+Math.cos(ang)*rad)+' '+(middle.y+Math.sin(ang)*rad),class:'v12-spark'}));
    }
   } else {
    const dot=el('circle',{r:6,class:'v12-flow-dot is-hero'});
    dot.append(el('animateMotion',{dur:'2s',path:d,repeatCount:'indefinite'}));signals.append(dot);
   }
  } else {
   const dot=el('circle',{r:4,class:'v12-flow-dot'});
   dot.append(el('animateMotion',{dur:(2.7+i*.4).toFixed(1)+'s',path:d,begin:(-i*.8).toFixed(1)+'s',repeatCount:'indefinite'}));
   signals.append(dot);
  }
 }
 for(const item of scene.nodes){
  const isIsolated=chapter===1&&cut&&item.id==='n55';
  const g=el('g',{class:'v12-node'+(isIsolated?' is-isolated':'')+(item.role==='above'?' is-top':''),
    transform:'translate('+item.x+' '+item.y+')'});
  g.append(el('circle',{r:58,class:'v12-node-glow'}),el('circle',{r:43,class:'v12-node-ring'}),el('circle',{r:34,class:'v12-node-core'}));
  const label=el('text',{'text-anchor':'middle',y:7,class:'v12-node-name'},name(item.id));
  if(name(item.id).length>6)label.setAttribute('font-size','17');
  g.append(label);
  nodes.append(g);
 }
 $('v12SceneName').textContent=scene.name;
 $('v12Progress').textContent=String(chapter+1).padStart(2,'0')+' / 02';
 $('v12Lead').textContent=scene.intro;
 $('v12MomentKicker').textContent=scene.kicker;
 $('v12MomentTitle').textContent=cut?scene.reveal:scene.start;
 $('v12MomentCaption').textContent=cut?scene.revealCopy:'高亮线是现有模型中的一条关联；线条流动只是便于理解的视觉效果。';
 $('v12Action').innerHTML=cut?scene.nextAction+' <span aria-hidden="true">→</span>':'✦ 试着断开高亮的线 <span aria-hidden="true">→</span>';
 $('v12Hint').querySelector('span:last-child').textContent=cut?(chapter===0?'没有被隔开：还有其他模型路径。':'被隔开：在当前底图里没有替代路径。'):'只需要按一次按钮，看看会发生什么。';
 const dots=$('v12Game').querySelectorAll('.v12-game-dots span');
 dots.forEach((node,i)=>{node.classList.toggle('active',i===chapter+(cut?1:0));node.classList.toggle('done',i<chapter+(cut?1:0));});
}
function advance(){
 if(!cut){cut=true;render();return;}
 if(chapter===0){chapter=1;cut=false;render();return;}
 $('v12Game').dataset.finished='yes';
 $('v12Game').querySelector('.v12-game-arena').hidden=true;
 $('v12Game').querySelector('.v12-game-heading').hidden=true;
 $('v12Final').hidden=false;
 $('v12Final').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
}
function restart(){
 chapter=0;cut=false;
 $('v12Game').dataset.finished='no';
 $('v12Game').querySelector('.v12-game-arena').hidden=false;
 $('v12Game').querySelector('.v12-game-heading').hidden=false;
 $('v12Final').hidden=true;render();
 $('v12Game').scrollIntoView({behavior:'smooth',block:'start'});
}
function deep(){
 const d=$('v12NextLevel');d.open=true;
 window.dispatchEvent(new Event('resize'));
 $('v11Experience')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function showMath(){
 const area=$('v12Math');const next=area.hidden;area.hidden=!next;
 $('v12ShowMath').setAttribute('aria-expanded',String(next));
 $('v12ShowMath').querySelector('span').textContent=next?'⌃':'⌄';
 if(next)area.scrollIntoView({behavior:'smooth',block:'nearest'});
}
$('v12Action').addEventListener('click',advance);
$('v12Again').addEventListener('click',restart);
$('v12GoDeep').addEventListener('click',deep);
$('v12ShowMath').addEventListener('click',showMath);
const deepSection=$('v12NextLevel');
deepSection.addEventListener('toggle',()=>{if(deepSection.open)window.dispatchEvent(new Event('resize'));});
function hashOpen(){
 if(['#v10Editor','#v11Expert','#v11Experience','#v12NextLevel'].includes(window.location.hash)){
  deepSection.open=true;
  if(['#v10Editor','#v11Expert'].includes(window.location.hash))$('v11Expert').open=true;
  window.dispatchEvent(new Event('resize'));
 }
}
window.addEventListener('hashchange',hashOpen);
$('v12MathA').textContent=original.edges+' → '+changed[0].edges;
$('v12MathB').textContent=original.edges+' → '+changed[1].edges;
render();hashOpen();
})();