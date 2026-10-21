/* NewZK V9: economic X-ray lenses. Data from unchanged model.js.
 * Unlike a simulation page, this view never runs ZK.run or infers geographical positions.
 */
(function(){
'use strict';
if(typeof ZK==='undefined')return;
const $=id=>document.getElementById(id);
if(!$('whoWorld'))return;
const find=name=>ZK.A.find(item=>item[0]===name);
const text=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
const formatNumber=(n)=>Number(n).toLocaleString('zh-CN',{maximumFractionDigits:1});
const allowed=new Set(['industry','city','compare']);
const charts={};
let lens='industry',selectedPillar=0,area='仲恺';
const areaScores={
  '仲恺':{scores:[95,45,40,70,60],color:'#69d8ee',title:'工业强，城市承接仍要补。',
    copy:'原设计给仲恺较高的工业强度评价，同时把三产水平和城市配套列为相对短板。这些属于研究性的D级判断。'},
  '大亚湾':{scores:[90,50,50,65,85],color:'#a7a0f1',title:'优势集中，也意味着风险集中。',
    copy:'原设计认为大亚湾产业专业化程度较高，集中度风险也较突出。这不是经统一实测确认的城市排名。'},
  '惠城':{scores:[45,85,80,75,35],color:'#f5bd81',title:'服务和城市功能，是另一种优势。',
    copy:'原设计用较高的三产和城市配套分数表达惠城的中心城区特征。评分为定性假设，而非统计公报指标。'}
};
const axes=['工业强度','三产水平','城市配套','人口活力','风险集中'];
const panels=[...document.querySelectorAll('[data-panel]')];
const allLensButtons=[...document.querySelectorAll('button[data-lens]')];
const currentStats={
  industry:{
    layer:'产业层 / INDUSTRIAL SYSTEM',
    kicker:'当前聚焦 / 工业',
    head:'产业机器高速运转',
    sub:'2025 年规上工业总产值增长 +12.2%，但这不是 GDP 增速。',
    aLabel:'2025规上工业总产值',a:find('规上工业总产值')[1],aNote:'官方统计 · 工业总产值',
    bLabel:'2025地区生产总值',b:find('地区生产总值 GDP')[1],bNote:'官方统计 · GDP口径不同，不能直接相减'
  },
  city:{
    layer:'承接层 / CITY & LIFE',
    kicker:'当前聚焦 / 城市',
    head:'生产快，生活服务追得上吗？',
    sub:'2025 年工业产值增长 +12.2%，第三产业增加值增长 +2.2%。增速分属不同指标。',
    aLabel:'规上工业总产值增速',a:find('规上工业总产值')[2],aNote:'2025年官方口径',
    bLabel:'第三产业增加值增速',b:find('三产增加值')[2],bNote:'2025年官方口径 · 不同统计指标'
  },
  compare:{
    layer:'对照层 / RELATIVE PATTERNS',
    kicker:'当前聚焦 / 定性比较',
    head:'同在惠州，经济骨架却不同',
    sub:'三地雷达沿用原页面的D级主观评分，只用于形成问题，不代表真实排名。',
    aLabel:'仲恺工业强度设定',a:'95 / 100',aNote:'D级定性估计 · 非统计指标',
    bLabel:'仲恺城市配套设定',b:'40 / 100',bNote:'D级定性估计 · 非实测排名'
  }
};
function showLens(next){
 if(!allowed.has(next))return;
 lens=next;
 const cfg=currentStats[lens];
 allLensButtons.forEach(button=>{
   const active=button.dataset.lens===lens;
   button.classList.toggle('active',active);
   button.setAttribute('aria-pressed',String(active));
 });
 panels.forEach(panel=>{panel.hidden=panel.dataset.panel!==lens;});
 document.querySelector('.who-world-frame').dataset.lens=lens;
 text('who-scan-layer',cfg.layer);
 text('who-live-kicker',cfg.kicker);
 text('who-live-head',cfg.head);
 text('who-live-sub',cfg.sub);
 for(const key of ['a','b']){
  text('who-stat-'+key+'-label',cfg[key+'Label']);
  text('who-stat-'+key,cfg[key]);
  text('who-stat-'+key+'-note',cfg[key+'Note']);
 }
 if(lens==='city')initStructure();
 if(lens==='compare')initRadar();
 if(charts[lens])setTimeout(()=>charts[lens].resize(),70);
}
function buildPillars(){
 const list=$('whoPillars');list.replaceChildren();
 const total=Number(ZK.BASE);
 ZK.CL.forEach((c,i)=>{
  const raw=String(c[1]),value=parseFloat(raw.replace(/[^\d.]/g,'')),pct=Math.min(100,value/total*100);
  const btn=document.createElement('button');btn.type='button';btn.className='who-pillar-item';btn.setAttribute('role','listitem');
  btn.style.setProperty('--pillar-color',c[3]);
  btn.dataset.index=String(i);
  const row=document.createElement('span');row.className='who-pillar-header';
  const name=document.createElement('strong');name.textContent=c[0];
  const amt=document.createElement('span');amt.textContent=raw;row.append(name,amt);
  const track=document.createElement('span');track.className='who-pillar-bar';
  const bar=document.createElement('i');track.append(bar);btn.append(row,track);
  btn.addEventListener('click',()=>selectPillar(i));
  list.append(btn);
  requestAnimationFrame(()=>{bar.style.width=pct+'%';});
 });
 selectPillar(0);
}
function selectPillar(i){
 selectedPillar=i;
 const c=ZK.CL[i],value=parseFloat(String(c[1]).replace(/[^\d.]/g,'')),share=(value/ZK.BASE*100).toFixed(1);
 document.querySelectorAll('.who-pillar-item').forEach((b,k)=>b.classList.toggle('active',k===i));
 text('whoPillarDetail',c[0]+' · '+c[1]+' · 约占规上工业总产值的 '+share+'%（按当前模型数据估算），资料备注：'+c[2]+'。');
}
function buildKpis(){
 const labels=[
  ['地区生产总值 GDP','GDP'],
  ['规上工业总产值','规上工业总产值'],
  ['规上工业企业','规上工业企业数'],
  ['电子产业占规上工业增加值','电子产业占比'],
  ['高新技术企业','高新技术企业数'],
  ['高技术制造业占比','高技术制造业占比']
 ];
 const parent=$('whoKpis');parent.replaceChildren();
 labels.forEach(([key,label])=>{
  const a=find(key);if(!a)return;
  const cell=document.createElement('div');cell.className='who-kpi';
  const value=document.createElement('strong');value.textContent=a[1];
  const name=document.createElement('span');name.textContent=label;
  const note=document.createElement('small');note.textContent=a[2]||'2025 官方数据';
  cell.append(value,name,note);parent.append(cell);
 });
}
function buildNew(){
 const holder=$('whoNew');holder.replaceChildren();
 ZK.NEW.forEach((n,i)=>{
  const item=document.createElement('article');item.className='who-new-item';
  const index=document.createElement('span');index.textContent='NEXT '+String(i+1).padStart(2,'0');
  const title=document.createElement('strong');title.textContent=n[0];
  const p=document.createElement('p');p.textContent=n[1];
  item.append(index,title,p);holder.append(item);
 });
}
function buildParks(){
 const holder=$('whoParks');holder.replaceChildren();
 ZK.PARKS.forEach(p=>{
  const item=document.createElement('article');item.className='who-park-item';
  for(let i=0;i<3;i++){
   const child=document.createElement(i===0?'strong':i===1?'span':'p');
   child.textContent=p[i];
   item.append(child);
  }
  holder.append(item);
 });
 const extra=document.createElement('article');extra.className='who-park-item';
 const title=document.createElement('strong');title.textContent='仲恺高端产业合作区';
 const extent=document.createElement('span');extent.textContent='仲恺片区合计约55.9平方公里';
 const desc=document.createElement('p');desc.textContent='“1+1+2”布局描述，沿用原页面口径。';
 extra.append(title,extent,desc);holder.append(extra);
}
function buildGrowth(){
 const holder=$('whoGrowth');holder.replaceChildren();
 const keys=[
  ['规上工业总产值','#79e9f1'],
  ['三产增加值','#ffd09a'],
  ['社会消费品零售','#91dfc7']
 ];
 keys.forEach(([key,color])=>{
  const row=find(key),val=parseFloat(row[2].replace(/[^\d.]/g,'')),percent=Math.max(0,Math.min(100,val/15*100));
  const item=document.createElement('div');item.className='who-growth-item';item.style.setProperty('--grow-color',color);
  const head=document.createElement('div');head.className='who-growth-title';
  const name=document.createElement('span');name.textContent=key==='三产增加值'?'第三产业增加值':key;
  const number=document.createElement('strong');number.textContent=row[2];
  head.append(name,number);
  const rail=document.createElement('div');rail.className='who-growth-rail';
  const bar=document.createElement('i');rail.append(bar);
  item.append(head,rail);holder.append(item);
  requestAnimationFrame(()=>{bar.style.width=percent+'%';});
 });
}
function initStructure(){
 if(charts.city||typeof echarts==='undefined')return;
 const el=$('whoStructureChart');if(!el)return;
 const chart=echarts.init(el);charts.city=chart;
 chart.setOption({
  backgroundColor:'transparent',textStyle:{fontFamily:'-apple-system,"PingFang SC",sans-serif'},
  color:['#7fb9cc','#65dded','#ffb982'],
  tooltip:{trigger:'item',formatter:'{b}: {c}%'},
  legend:{bottom:0,textStyle:{color:'#bbcee4',fontSize:11},itemGap:15},
  graphic:[{type:'text',left:'center',top:'42%',style:{text:'67.6%',fill:'#a7f2ff',fontSize:35,fontWeight:'bold',textAlign:'center'}},{type:'text',left:'center',top:'57%',style:{text:'第二产业 · 2024',fill:'#91aac5',fontSize:11,textAlign:'center'}}],
  series:[{type:'pie',radius:['62%','79%'],center:['50%','46%'],avoidLabelOverlap:true,label:{show:false},
   itemStyle:{borderWidth:3,borderColor:'#0c1d33'},data:[{name:'第一产业',value:1.0},{name:'第二产业',value:67.6},{name:'第三产业',value:31.4}]
  }]
 });
}
function initRadar(){
 if(charts.compare||typeof echarts==='undefined')return;
 const chart=echarts.init($('whoRadarChart'));charts.compare=chart;
 drawRadar();
}
function drawRadar(){
 const chart=charts.compare;if(!chart)return;
 const entries=Object.entries(areaScores);
 chart.setOption({
  backgroundColor:'transparent',
  textStyle:{fontFamily:'-apple-system,"PingFang SC",sans-serif'},
  tooltip:{trigger:'item',formatter:(params)=>params.name+'<br>'+axes.map((n,i)=>n+'：'+params.value[i]+'（D级）').join('<br>')},
  legend:{data:entries.map(x=>x[0]),top:0,textStyle:{color:'#adcae3',fontSize:11}},
  radar:{indicator:axes.map(name=>({name,max:100})),radius:'56%',center:['50%','56%'],
   axisName:{color:'#abc7de',fontSize:11},splitLine:{lineStyle:{color:'rgba(168,211,241,.2)'}},
   axisLine:{lineStyle:{color:'rgba(168,211,241,.23)'}},splitArea:{areaStyle:{color:['rgba(37,78,116,.11)','rgba(16,44,75,.19)']}}},
  series:[{type:'radar',symbolSize:4,
   data:entries.map(([name,v])=>({name,value:v.scores,lineStyle:{color:v.color,width:name===area?3:1.4,opacity:name===area?1:.38},
    itemStyle:{color:v.color,opacity:name===area?1:.37},areaStyle:{color:v.color,opacity:name===area?.18:.035}}))}]
 },true);
 chart.resize();
}
function chooseArea(name){
 if(!areaScores[name])return;
 area=name;const info=areaScores[name];
 document.querySelectorAll('.who-compare-switch button').forEach(b=>{
  const current=b.dataset.area===name;b.classList.toggle('active',current);b.setAttribute('aria-pressed',String(current));
 });
 text('whoAreaName',name);text('whoAreaTitle',info.title);text('whoAreaCopy',info.copy);
 const holder=$('whoAreaBars');holder.replaceChildren();
 axes.forEach((axis,i)=>{
  const row=document.createElement('div');row.className='who-area-row';
  const label=document.createElement('span');label.textContent=axis;
  const track=document.createElement('div');track.className='who-area-rail';
  const bar=document.createElement('i');bar.style.background=info.color;bar.style.width=info.scores[i]+'%';
  track.append(bar);
  const val=document.createElement('strong');val.textContent=String(info.scores[i]);
  row.append(label,track,val);holder.append(row);
 });
 drawRadar();
}
function resize(){Object.values(charts).forEach(c=>c.resize());}
document.querySelectorAll('button[data-lens]').forEach(button=>button.addEventListener('click',()=>showLens(button.dataset.lens)));
document.querySelectorAll('.who-compare-switch button').forEach(button=>button.addEventListener('click',()=>chooseArea(button.dataset.area)));
window.addEventListener('resize',resize,{passive:true});
buildPillars();buildKpis();buildNew();buildParks();buildGrowth();showLens('industry');chooseArea('仲恺');
})();