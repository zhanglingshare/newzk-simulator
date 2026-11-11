/* NewZK V13: neon two-click arcade. Source graph is real; game experience leads.
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
 {name:'ROUND 1 · 绕路奇迹 ✨',
  intro:'三位主角在线。猜猜，一刀下去，它们会不会散伙？',
  nodes:[{id:'n4',x:153,y:278,role:'left'},{id:'n13',x:743,y:278,role:'right'},{id:'n21',x:449,y:88,role:'above'}],
  edges:[['n4','n13',450,346],['n4','n21',278,119],['n21','n13',617,113]],
  target:['n4','n13'],
  start:'三个小伙伴，正连得好好的。',kicker:'第一刀 / 亿纬锂能 ⚡ 储能系统',
  reveal:'竟然绕过去了！ ✨',revealCopy:'快看上面！还有一条经过「锂电正极」的小路，惊不惊喜？',
  nextAction:'下一关 · 更刺激的来了'},
 {name:'ROUND 2 · 谁掉队了？ ⚡',
  intro:'这里有个小伙伴，只拉着一根线。敢不敢再剪？',
  nodes:[{id:'n48',x:133,y:91,role:'above'},{id:'n54',x:198,y:266,role:'left'},{id:'n38',x:472,y:266,role:'center'},{id:'n55',x:765,y:266,role:'right'}],
  edges:[['n48','n54',111,186],['n54','n38',328,322],['n38','n55',619,325]],
  target:['n38','n55'],
  start:'小心！这根线看起来有点特别。',kicker:'第二刀 / 深惠城际 ⚡ 跨区通勤',
  reveal:'哎呀！一个小伙伴掉队了！',revealCopy:'模型里它暂时没有第二条路。放心，这是游戏里的断线，不是现实交通事故。',
  nextAction:'收下我的通关徽章'}
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
let chapter=0,cut=false,soundOn=false,audio=null;
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
 $('v12Action').innerHTML=cut?scene.nextAction+' <span aria-hidden="true">↗</span>':'✂ 剪！ <span aria-hidden="true">⚡</span>';
 $('v12Hint').querySelector('span:last-child').textContent=cut?(chapter===0?'隐藏路线被你发现啦！':'有个小伙伴落单啦！'):'盯紧那根发光线，准备剪！';
 const dots=$('v12Game').querySelectorAll('.v12-game-dots span');
 dots.forEach((node,i)=>{node.classList.toggle('active',i===chapter+(cut?1:0));node.classList.toggle('done',i<chapter+(cut?1:0));});
}
function tone(notes){
 if(!soundOn)return;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return;
  if(!audio)audio=new Audio();
  if(audio.state==='suspended')audio.resume();
  const now=audio.currentTime;
  notes.forEach(([hz,at,duration],i)=>{
   const osc=audio.createOscillator(),gain=audio.createGain();
   osc.type=i===0?'triangle':'sine';
   osc.frequency.setValueAtTime(hz,now+at);
   gain.gain.setValueAtTime(.0001,now+at);
   gain.gain.exponentialRampToValueAtTime(.085,now+at+.025);
   gain.gain.exponentialRampToValueAtTime(.0001,now+at+duration);
   osc.connect(gain);gain.connect(audio.destination);
   osc.start(now+at);osc.stop(now+at+duration+.03);
  });
 }catch(err){ /* audio is optional and never blocks play */ }
}
function celebrate(which){
 const burst=$('v13Burst');
 burst.classList.remove('is-firing','is-winning');
 burst.replaceChildren();
 const label=document.createElement('strong');
 label.id='v13BurstText';
 label.textContent=which==='first'?'绕路成功！ ✨':which==='second'?'发现落单者！ ⚡':'双刀通关！ 🏆';
 burst.append(label);
 const colors=['#8dfde5','#ffd593','#84baff','#f89db9','#bb9dff'];
 for(let i=0;i<21;i++){
  const spark=document.createElement('i');
  spark.className='v13-confetti';
  const angle=i*Math.PI*2/21,dist=85+(i%5)*28;
  spark.style.setProperty('--dx',(Math.cos(angle)*dist).toFixed(1)+'px');
  spark.style.setProperty('--dy',(Math.sin(angle)*dist).toFixed(1)+'px');
  spark.style.setProperty('--c',colors[i%colors.length]);
  spark.style.setProperty('--delay',(i%6*.024)+'s');
  burst.append(spark);
 }
 void burst.offsetWidth;
 burst.classList.add(which==='second'?'is-winning':'is-firing');
}
function advance(){
 if(!cut){
  cut=true;render();
  celebrate(chapter===0?'first':'second');
  tone(chapter===0?[[330,0,.14],[520,.11,.19],[660,.23,.20]]:[[255,0,.22],[185,.14,.25],[100,.30,.25]]);
  return;
 }
 if(chapter===0){chapter=1;cut=false;render();$('v13Burst').classList.remove('is-firing','is-winning');tone([[440,0,.12],[570,.13,.16]]);return;}
 $('v12Game').dataset.finished='yes';
 $('v13Burst').classList.remove('is-firing','is-winning');tone([[392,0,.16],[493,.16,.16],[587,.32,.18],[784,.52,.36]]);
 $('v12Game').querySelector('.v12-game-arena').hidden=true;
 $('v12Game').querySelector('.v12-game-heading').hidden=true;
 $('v12Final').hidden=false;
 $('v12Final').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
}
function restart(){
 chapter=0;cut=false;
 $('v13Burst').classList.remove('is-firing','is-winning');
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

function drawPoster(){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas not supported');
 const gradient=ctx.createLinearGradient(0,0,1080,1350);
 gradient.addColorStop(0,'#0a1532');gradient.addColorStop(.5,'#163a5d');gradient.addColorStop(1,'#121632');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1350);
 for(let i=0;i<50;i++){
  const x=(i*277+81)%1080,y=(i*193+68)%1350;
  ctx.fillStyle='rgba(127,224,250,'+(0.08+(i%5)*.04)+')';
  ctx.fillRect(x,y,2+(i%3),2+(i%3));
 }
 // Neon ornamental rings and lines.
 ctx.save();ctx.shadowColor='#68e5f5';ctx.shadowBlur=32;
 ctx.strokeStyle='#70dced';ctx.lineWidth=9;
 ctx.beginPath();ctx.arc(540,555,225,-Math.PI*.9,Math.PI*.65);ctx.stroke();
 ctx.shadowColor='#ffbd89';ctx.strokeStyle='#ffbd89';ctx.lineWidth=18;
 ctx.beginPath();ctx.moveTo(356,695);ctx.lineTo(453,598);ctx.moveTo(630,482);ctx.lineTo(731,382);ctx.stroke();
 ctx.restore();
 ctx.textAlign='center';
 const font=(size,weight=800)=>weight+' '+size+'px "PingFang SC","Microsoft YaHei",sans-serif';
 ctx.font=font(27,700);ctx.fillStyle='#9fddec';ctx.fillText('NEWZK   /   剪线俱乐部',540,108);
 ctx.font=font(77,900);ctx.fillStyle='#f3fbff';ctx.fillText('两刀通关！',540,265);
 ctx.font=font(37,750);ctx.fillStyle='#ffcd96';ctx.fillText('恭喜解锁：剪线双冠王 ⚡',540,334);
 ctx.font=font(37,800);ctx.fillStyle='#c9f8ff';ctx.fillText('🛣️  隐藏路线猎人',540,902);
 ctx.fillText('🏝️  孤岛发现者',540,973);
 ctx.font=font(26,600);ctx.fillStyle='#b7cbe0';ctx.fillText('第一刀绕路成功 · 第二刀找出落单者',540,1050);
 ctx.fillStyle='rgba(188,211,226,.76)';ctx.font=font(21,500);
 ctx.fillText('公开资料模型里的小游戏 · 不代表现实发生断线',540,1215);
 ctx.fillText('来试一试：zhanglingshare.github.io/newzk-simulator/',540,1262);
 return canvas;
}
async function savePoster(){
 const status=$('v13PosterStatus');
 try{
  const canvas=drawPoster();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw Error('png export unsupported');
  const fileName='NEWZK-剪线双冠王.png';
  if(navigator.share&&navigator.canShare&&window.File){
   const file=new File([blob],fileName,{type:'image/png'});
   if(navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:'我在仲恺剪线俱乐部通关了！'});
     status.textContent='海报已发送到系统分享面板。';return;}
    catch(err){if(err.name==='AbortError'){status.textContent='已取消分享。';return;}}
   }
  }
  const u=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=u;link.download=fileName;
  document.body.append(link);link.click();link.remove();
  status.textContent='通关海报已生成；请在下载内容中查看。';
  window.setTimeout(()=>URL.revokeObjectURL(u),1200);
 }catch(err){status.textContent='这台设备暂时不能保存图片，可以直接截图分享通关页面。';}
}

function showMath(){
 const area=$('v12Math');const next=area.hidden;area.hidden=!next;
 $('v12ShowMath').setAttribute('aria-expanded',String(next));
 $('v12ShowMath').querySelector('span').textContent=next?'⌃':'⌄';
 if(next)area.scrollIntoView({behavior:'smooth',block:'nearest'});
}
$('v13Sound').addEventListener('click',()=>{
 soundOn=!soundOn;
 $('v13Sound').setAttribute('aria-pressed',String(soundOn));
 $('v13Sound').setAttribute('aria-label',soundOn?'关闭游戏音效':'开启游戏音效');
 $('v13Sound').textContent=soundOn?'♫ 音效：开':'♪ 音效：关';
 if(soundOn)tone([[650,0,.12],[880,.12,.14]]);
});
$('v13Poster').addEventListener('click',savePoster);
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