/* NewZK focused cinematic entry: deliberately no predictions, sliders or graph mutations.
   The 8-node vignette uses only existing source-model links; not the complete 68-node graph. */
(function(){
'use strict';
if(typeof ZK==='undefined')return;
const $=id=>document.getElementById(id);
if(!$('portalGraph'))return;
const svgNS='http://www.w3.org/2000/svg';
const lookup=new Map(ZK.NO.map(n=>[n[0],n]));
const degree=new Map(ZK.NO.map(n=>[n[0],0]));
ZK.LK.forEach(e=>{degree.set(e[0],degree.get(e[0])+1);degree.set(e[1],degree.get(e[1])+1);});
const hub=[...ZK.NO].sort((a,b)=>degree.get(b[0])-degree.get(a[0]))[0];
const links=ZK.LK.filter(e=>e[0]===hub[0]||e[1]===hub[0]);
const near=links.map(e=>({id:e[0]===hub[0]?e[1]:e[0],edge:e}))
 .sort((a,b)=>degree.get(b.id)-degree.get(a.id)).slice(0,8);
const setText=(id,v)=>{const el=$(id);if(el)el.textContent=v;};
setText('portalHubName',hub[1]);setText('portalHubDegree',degree.get(hub[0]));
setText('portalFeatureDegree',degree.get(hub[0]));setText('portalFeatureName',hub[1]+' · 模型网络连接数最高的命名主体');
function mk(tag,attrs){
  const e=document.createElementNS(svgNS,tag);
  Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,String(v)));
  return e;
}
function group(text,x,y,r,isHub,label){
  const g=mk('g',{class:'portal-node'+(isHub?' center':''),role:'link',tabindex:0,'aria-label':text+'，点击进入产业世界'});
  g.append(mk('circle',{cx:x,cy:y,r:r+14,class:'portal-node-halo'}),mk('circle',{cx:x,cy:y,r,class:'portal-node-dot'}));
  if(label){
    const t=mk('text',{x,y:y+r+24,'text-anchor':'middle',class:'portal-node-label'});
    t.textContent=text.length>8?text.slice(0,8)+'…':text;g.append(t);
  }
  const tooltip=mk('title');tooltip.textContent=text+' · 来自现有模型关系';
  g.append(tooltip);
  const go=()=>{window.location.href='network.html';};
  g.addEventListener('click',go);
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
  $('portalNodes').append(g);
}
const position=[
 [100,163],[232,90],[432,94],[552,213],
 [540,393],[402,493],[197,487],[66,359]
];
near.forEach((v,i)=>{
  const [x,y]=position[i],e=v.edge;
  const l=mk('path',{d:'M327 282 Q'+((327+x)/2+(i%2?16:-16))+' '+((282+y)/2+(i%2?-16:16))+' '+x+' '+y,
    class:'portal-wire'+(e[3]?' uncertain':'')});
  $('portalLinks').append(l);
});
near.forEach((v,i)=>{
  const n=lookup.get(v.id);if(!n)return;
  group(n[1],...position[i],7.3,false,i<4);
});
group(hub[1],327,282,16.5,true,true);
// Verify the editorial data against the existing core and only show model-backed values.
const growth=ZK.A.find(v=>v[0]==='规上工业总产值')?.[2];
const invest=ZK.BLIND.find(v=>v[0]==='投资仍未止跌回稳')?.[1];
const investPct=String(invest||'').match(/-?\d+(?:\.\d+)?%/)?.[0];
const weak=[...ZK.SEM].sort((a,b)=>a[2]-b[2])[0];
const details=[
  [document.querySelector('.portal-contrast-nums>div:first-child strong'),growth],
  [document.querySelector('.portal-contrast-nums>div:last-child strong'),investPct],
  [document.querySelector('.portal-weak strong'),weak?.[2]?.toFixed(2)]
];
details.forEach(([element,value])=>{if(element&&value)element.textContent=value;});
// City skyline is a visual metaphor, not a geographic dataset.
const heights=[36,58,42,75,94,49,65,77,52,87,67,102,45,72,93,64,82,51,96,76,55,88,109,61,73,47,91,66,98,58,77,48,92,57];
const skyline=$('portalSkyline');
if(skyline)heights.forEach((v,i)=>{
  const s=document.createElement('span');
  s.style.height=v+'%';
  if(i%8===0)s.style.flexGrow='1.5';
  skyline.appendChild(s);
});
const feedTitle=$('portalDailyTitle'),feedDate=$('portalFeedDate'),feedMeta=$('portalDailyMeta');
fetch('hot.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('fetch');return r.json();}).then(data=>{
  const item=(data.items||[]).find(x=>x.verified_status==='已核验')||(data.items||[])[0];
  if(!item){feedTitle.textContent='今日暂时没有可展示的话题';feedMeta.textContent='进入完整今日仲恺查看更多';return;}
  feedTitle.textContent=item.title||'今日仲恺';
  feedDate.textContent='公开信息快照 · 最近抓取 '+(data.updated||'时间待核实');
  feedMeta.textContent=[item.srcLevel||item.source||'公开渠道','关注档 '+(item.tier||'待核实'),item.verified_status||'状态待核实'].join(' · ');
}).catch(()=>{
  feedTitle.textContent='进入今日仲恺，查看最新公开资料';
  feedDate.textContent='当前资讯加载失败';
  feedMeta.textContent='不使用虚构消息填补空白';
});
})();