/* Compare existing shockHits coverage; no new propagation claims. */
(function(){
'use strict';
const byId=id=>document.getElementById(id);
if(typeof ZK==='undefined'||!byId('lab5ShockA'))return;
const scenarios=ZK.SHOCKS;
const keys=scenarios.map(x=>x[2]);
const names=Object.fromEntries(scenarios.map(x=>[x[2],x[0]]));
let ref='talent';
const select=byId('lab5ShockA');
scenarios.forEach(s=>{
  const option=document.createElement('option');
  option.value=s[2];option.textContent=s[0];select.appendChild(option);
});
select.value=ref;
const bSelect=byId('lab5ShockBSelect');
scenarios.forEach(s=>{
  const option=document.createElement('option');option.value=s[2];option.textContent=s[0];bSelect.appendChild(option);
});
bSelect.value=cur;
bSelect.onchange=()=>{cur=bSelect.value;cards();run();render();};
function mapMarkup(k,other){
  const affected=new Set(ZK.shockHits(k));
  const compare=new Set(ZK.shockHits(other));
  const parts=['<rect width="1240" height="920" rx="18" fill="#f8fbff"/>'];
  for(const link of ZK.LK){
    const a=ZK.NO.find(n=>n[0]===link[0]),b=ZK.NO.find(n=>n[0]===link[1]);
    if(!a||!b)continue;
    const impact=affected.has(a[0])||affected.has(b[0]);
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    const attrs={x1:a[3],y1:a[4],x2:b[3],y2:b[4],stroke:impact?'#d28a43':'#bdcfe5','stroke-width':impact?3:1.6,'stroke-opacity':impact?.72:.32};
    if(link[3])attrs['stroke-dasharray']='6 4';
    for(const [key,value] of Object.entries(attrs))line.setAttribute(key,value);
    parts.push(line.outerHTML);
  }
  ZK.NO.forEach(n=>{
    const hit=affected.has(n[0]),both=hit&&compare.has(n[0]);
    const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
    const attrs={cx:n[3],cy:n[4],r:hit?12:5,fill:hit?(both?'#245bdb':'#d77e31'):'#bdd0e5',opacity:hit?1:.38};
    for(const [key,value] of Object.entries(attrs))circle.setAttribute(key,value);
    parts.push(circle.outerHTML);
    if(hit){
      const label=document.createElementNS('http://www.w3.org/2000/svg','text');
      label.setAttribute('x',n[3]);label.setAttribute('y',n[4]-22);
      label.setAttribute('font-size','16');label.setAttribute('text-anchor','middle');
      label.setAttribute('font-weight','700');label.setAttribute('fill','#233b59');
      label.textContent=n[1].slice(0,9);
      parts.push(label.outerHTML);
    }
  });
  return parts.join('');
}
function render(){
  const b=keys.includes(cur)?cur:'chain',a=ref;
  const A=new Set(ZK.shockHits(a)),B=new Set(ZK.shockHits(b));
  const common=[...A].filter(x=>B.has(x));
  const onlyA=[...A].filter(x=>!B.has(x));
  const onlyB=[...B].filter(x=>!A.has(x));
  bSelect.value=b;
  const nums=[['A 波及主体',A.size],['B 波及主体',B.size],['共同波及',common.length],['仅 B 波及',onlyB.length]];
  byId('lab5ShockNumbers').replaceChildren();
  nums.forEach(([label,value])=>{
    const card=document.createElement('div');
    const title=document.createElement('span');title.textContent=label;
    const number=document.createElement('b');number.textContent=value;
    card.append(title,number);byId('lab5ShockNumbers').append(card);
  });
  byId('lab5ShockMapA').innerHTML=mapMarkup(a,b);
  byId('lab5ShockMapB').innerHTML=mapMarkup(b,a);
  byId('lab5ShockNote').textContent='A独有：'+(onlyA.slice(0,4).map(id=>ZK.nm(id)).join('、')||'无')
    +'；B独有：'+(onlyB.slice(0,4).map(id=>ZK.nm(id)).join('、')||'无')
    +'。蓝色为两种情景共同波及的主体；橙色为本图独有波及主体。不是现实损失预测。';
}
select.onchange=()=>{ref=select.value;render();};
byId('cards').addEventListener('click',e=>{if(e.target.closest('.card'))requestAnimationFrame(render);});
byId('lab5ShockSwap').onclick=()=>{
  const previous=cur;cur=ref;ref=previous;select.value=ref;bSelect.value=cur;
  cards();run();render();
};
byId('lab5ShockSave').onclick=()=>{
  const b=keys.includes(cur)?cur:'chain';
  const A=new Set(ZK.shockHits(ref)),B=new Set(ZK.shockHits(b));
  const snap={type:'shock-coverage-compare',version:1,A:ref,B:b,impactedA:[...A],impactedB:[...B],overlap:[...A].filter(x=>B.has(x)),savedAt:new Date().toISOString()};
  try{localStorage.setItem('newzk-lab-shocks-v1',JSON.stringify(snap));byId('lab5ShockNote').textContent='已保存至当前浏览器，原有模型及数据未修改。';}
  catch(err){byId('lab5ShockNote').textContent='本机无法保存，请检查浏览器权限。';}
};
let saved=null;try{saved=JSON.parse(localStorage.getItem('newzk-lab-shocks-v1')||'null');}catch(err){}
if(saved&&keys.includes(saved.A)){ref=saved.A;select.value=ref;}
render();
})();