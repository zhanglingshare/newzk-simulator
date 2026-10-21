/* NewZK V6 interactive city home.
 * Scenic backdrop is illustrative. Every node/edge is derived from ZK.NO / ZK.LK.
 * The economic scenario calls the unchanged ZK.run and never interprets shockHits as causal losses.
 */
(function(){
'use strict';
if(typeof ZK==='undefined')return;
const $=id=>document.getElementById(id);
if(!$('whWorld'))return;
const SVG_NS='http://www.w3.org/2000/svg';
const SEED=20261020,SAMPLES=1000;
const baseline=ZK.run(SEED,SAMPLES,ZK.DEFAULT_PATHS);
const fmt=n=>Number(n).toLocaleString('zh-CN',{maximumFractionDigits:1});
const names=new Map(ZK.NO.map(n=>[n[0],n]));
const adj=new Map(ZK.NO.map(n=>[n[0],[]]));
const edges=ZK.LK.map(l=>({a:l[0],b:l[1],strength:l[2],unverified:!!l[3]}));
edges.forEach(e=>{adj.get(e.a)?.push(e.b);adj.get(e.b)?.push(e.a);});
const mainNames=new Set([...ZK.NO].sort((a,b)=>adj.get(b[0]).length-adj.get(a[0]).length).slice(0,9).map(n=>n[0]).concat(['n52','n55','n56']));
const elNodes=new Map(),elLinks=[];
let mode='explore',selected=null,shock='chain',mu=ZK.DEFAULT_PATHS[0].mu,chart=null,timer=null;
const setText=(id,value)=>{const element=$(id);if(element)element.textContent=value;};
function dom(tag,cls,text){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!=null)node.textContent=text;
  return node;
}
function svgEl(tag,attrs){
  const e=document.createElementNS(SVG_NS,tag);
  Object.entries(attrs||{}).forEach(([name,value])=>e.setAttribute(name,String(value)));
  return e;
}
function buildCity(){
  const heights=[39,66,48,79,52,91,58,69,97,50,85,64,78,56,103,72,55,95,64,81,54,102,74,57,88,67,108,49,72,98,57,75,92,56,81,63];
  ['whBuildingsBack','whBuildingsFront'].forEach((id,k)=>{
    const parent=$(id);if(!parent)return;
    const seq=k?heights:heights.slice().reverse();
    seq.forEach((h,i)=>{
      const e=dom('span','wh-building');
      e.style.height=(k?Math.max(19,h*.84):Math.max(20,h*.67))+'%';
      if(i%7===0)e.style.flexGrow='1.5';
      if(i%9===0)e.style.flexGrow='1.8';
      parent.appendChild(e);
    });
  });
}
function buildNetwork(){
  const links=$('whLinks'),nodes=$('whNodes');
  edges.forEach(edge=>{
    const a=names.get(edge.a),b=names.get(edge.b);
    if(!a||!b)return;
    const line=svgEl('line',{x1:a[3],y1:a[4],x2:b[3],y2:b[4]});
    line.setAttribute('class','wh-edge'+(edge.unverified?' wh-uncertain':''));
    links.appendChild(line);elLinks.push({el:line,edge});
  });
  ZK.NO.forEach(n=>{
    const id=n[0],degree=adj.get(id).length,major=mainNames.has(id);
    const group=svgEl('g',{'class':'wh-node'+(major?' wh-major':' wh-quiet'),tabindex:0,role:'button','aria-label':n[1]+'，'+degree+'条模型关系'});
    group.setAttribute('transform','translate('+n[3]+' '+n[4]+')');
    const aura=svgEl('circle',{class:'wh-aura',r:major?23:17});
    const dot=svgEl('circle',{class:'wh-dot',r:major?10.5:6.5});
    const label=svgEl('text',{x:0,y:major?-25:-20,'text-anchor':'middle'});
    label.textContent=n[1].length>11?n[1].slice(0,11)+'…':n[1];
    const tap=svgEl('circle',{class:'wh-tap',r:35});
    group.append(aura,dot,label,tap);
    const title=svgEl('title');title.textContent=n[1]+' · '+degree+'条模型关系';group.appendChild(title);
    group.addEventListener('click',()=>focus(id));
    group.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();focus(id);}
    });
    group.addEventListener('mouseenter',()=>{if(mode==='explore'&&!selected)paint(id);});
    group.addEventListener('mouseleave',()=>{if(mode==='explore'&&!selected)paint(null);});
    nodes.appendChild(group);elNodes.set(id,group);
  });
}
function paint(hover=null){
  const picked=mode==='explore'?(hover||selected):null;
  const neighbors=new Set(picked?[picked,...(adj.get(picked)||[])]:[]);
  const hits=new Set(mode==='shock'?ZK.shockHits(shock):[]);
  const spotlight=mode==='simulate'?new Set(ZK.NO.filter(n=>n[2]==='chain').map(n=>n[0])):new Set();
  elNodes.forEach((g,id)=>{
    const isRelated=neighbors.has(id),isHit=hits.has(id),isPicked=id===picked,isLead=spotlight.has(id);
    const dim=(mode==='explore'&&picked&&!isRelated)||(mode==='shock'&&!isHit)||(mode==='simulate'&&!isLead);
    g.classList.toggle('is-muted',!!dim);
    g.classList.toggle('is-hit',isHit);
    g.classList.toggle('is-picked',isPicked||isLead);
  });
  elLinks.forEach(({el,edge})=>{
    const a=edge.a,b=edge.b;
    const emphasize=(mode==='explore'&&picked&&(a===picked||b===picked))
      ||(mode==='shock'&&(hits.has(a)||hits.has(b)))
      ||(mode==='simulate'&&spotlight.has(a)&&spotlight.has(b));
    el.classList.toggle('is-muted',(mode==='explore'&&!!picked&&!emphasize)||(mode==='shock'&&!emphasize)||(mode==='simulate'&&!emphasize));
    el.classList.toggle('is-lit',!!emphasize);
  });
}
function focus(id){
  const n=names.get(id);if(!n)return;
  selected=id;
  const linked=[...new Set(adj.get(id))].map(key=>ZK.nm(key));
  const uncert=n[5]?' · 待核实主体':'';
  setText('whNodeInfo',n[1]+' · '+adj.get(id).length+'条模型关系'+uncert+' · 相连：'+(linked.slice(0,5).join('、')||'无')+(linked.length>5?' 等':''));
  if(mode==='explore'){
    setText('whDelta',n[1]+' · '+adj.get(id).length+' 条关系');
    setText('whOutcome','关联主体：'+(linked.slice(0,5).join('、')||'暂无')+'。连接数量不代表经济影响力或因果贡献。');
  }
  paint();
}
function showStructural(){
  const panel=$('whResults');panel.classList.add('is-structural');
  if(mode==='explore'){
    setText('whResultTitle','结构探索');
    setText('whDelta',selected?ZK.nm(selected)+' · '+adj.get(selected).length+' 条关系':'68个模型主体 · '+edges.length+'条关系');
    setText('whOutcome','请选择场景中的主体，观察现有业务与要素联系。完整结构实验可进入产业链地图。');
    paint();
  }else if(mode==='shock'){
    const ids=ZK.shockHits(shock);
    setText('whResultTitle','冲击波及范围');
    setText('whDelta',ids.length+' 个主体被模型预设为直接波及');
    setText('whOutcome','高亮主体是 shockHits 的预设集合，不是逐级传播结果；无法据此计算实际企业退出数或产值损失。');
    setText('whShockResult',ZK.SHOCKS.find(s=>s[2]===shock)?.[0]+' · 高亮 '+ids.length+' / '+ZK.NO.length+' 个主体');
    setText('whNodeInfo','橙红色表示该冲击预设波及范围。切换冲击，观察受影响区域的差别。');
    paint();
  }
}
function setMode(next){
  mode=next;
   $('whExploreControls').hidden=next!=='explore';
  $('whShockControls').hidden=next!=='shock';
  $('whSimControls').hidden=next!=='simulate';
  document.querySelectorAll('.wh-scene-tab').forEach(button=>{
    const active=button.dataset.whMode===mode;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  if(next==='simulate'){
    $('whResults').classList.remove('is-structural');
    setText('whResultTitle','两种未来 · 一眼比较');
    setText('whNodeInfo','已突出模型中的链主主体。拖动右侧滑块，重跑情景并与原基准比较。');
    paint();renderScenario();
  }else{showStructural();}
}
function histogram(data,low,high,bins){
  const values=Array.from({length:bins},()=>0);
  for(const v of data)values[Math.max(0,Math.min(bins-1,Math.floor((v-low)/(high-low)*bins)))]++;
  return values.map(n=>+(n/data.length*100).toFixed(2));
}
function renderScenario(){
  const paths=ZK.DEFAULT_PATHS.map((p,i)=>({...p,mu:i===0?mu:p.mu}));
  const result=ZK.run(SEED,SAMPLES,paths);
  setText('whMuValue',fmt(mu)+'亿元');
  setText('whHitA',baseline.hit.toFixed(1)+'%');
  setText('whHitB',result.hit.toFixed(1)+'%');
  setText('whBaselineHit',baseline.hit.toFixed(1)+'%');
  const diff=result.hit-baseline.hit,midDiff=result.p50-baseline.p50;
  setText('whDelta','达标概率 '+(diff>=0?'+':'')+diff.toFixed(1)+' 个百分点 · 中位数 '+(midDiff>=0?'+':'')+fmt(midDiff)+'亿元');
  setText('whOutcome','A '+fmt(baseline.p50)+'亿 / B '+fmt(result.p50)+'亿（中位数）。固定种子 '+SEED+'，各 '+SAMPLES+' 次抽样。');
  if(typeof echarts==='undefined')return;
  if(!chart)chart=echarts.init($('whDistribution'));
  const low=3000,high=9500,bins=44,x=Array.from({length:bins},(_,i)=>Math.round(low+(i+.5)*(high-low)/bins));
  const a=histogram(baseline.results,low,high,bins),b=histogram(result.results,low,high,bins);
  chart.setOption({
    backgroundColor:'transparent',animationDurationUpdate:320,
    textStyle:{fontFamily:'-apple-system, BlinkMacSystemFont, "PingFang SC",sans-serif'},
    legend:{data:['A 基准','B 假设'],top:0,right:5,textStyle:{fontSize:10,color:'#c4d9f4'},itemWidth:12,itemHeight:5},
    tooltip:{trigger:'axis',backgroundColor:'#142441',borderColor:'#3d638b',textStyle:{color:'#eaf4ff',fontSize:11},
      formatter:params=>params.map(p=>p.seriesName+' · '+Number(p.axisValue).toLocaleString('zh-CN')+'亿元：'+Number(p.value).toFixed(1)+'%').join('<br>')},
    grid:{left:33,right:12,top:25,bottom:24},
    xAxis:{type:'category',data:x,boundaryGap:false,axisTick:{show:false},axisLine:{lineStyle:{color:'#4b6384'}},axisLabel:{fontSize:9,color:'#98afd0',interval:10}},
    yAxis:{type:'value',axisLine:{show:false},axisTick:{show:false},axisLabel:{color:'#98afd0',fontSize:9,formatter:'{value}%'},splitLine:{lineStyle:{color:'rgba(170,202,239,.13)'}}},
    series:[
      {name:'A 基准',type:'line',smooth:.3,showSymbol:false,data:a,lineStyle:{width:2.3,color:'#9faec6'},itemStyle:{color:'#9faec6'},areaStyle:{color:'rgba(164,182,209,.10)'},markLine:{silent:true,symbol:'none',label:{show:true,position:'insideEndTop',color:'#ffcc8f',fontSize:9,formatter:'6500目标'},lineStyle:{color:'#eab877',type:'dashed',width:1},data:[{xAxis:x.reduce((best,v,i)=>Math.abs(v-6500)<Math.abs(x[best]-6500)?i:best,0)}]}},
      {name:'B 假设',type:'line',smooth:.3,showSymbol:false,data:b,lineStyle:{width:3,color:'#61d6ee'},itemStyle:{color:'#61d6ee'},areaStyle:{color:'rgba(78,195,243,.12)'}}
    ]
  },true);
  chart.resize();
}
function loadNews(){
  fetch('hot.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error('fetch');return response.json();}).then(data=>{
    const items=(data.items||[]).slice(0,3);
    setText('whSourceUpdated','资讯：'+(data.updated||'更新时间待核实'));
    const box=$('whNewsItems');box.replaceChildren();
    if(!items.length){box.appendChild(dom('p','wh-help','今日暂无可显示的公开话题。'));return;}
    for(const item of items){
      let href=null;
      if(item.url){try{const u=new URL(item.url,location.href);if(['https:','http:'].includes(u.protocol))href=u.href;}catch(e){}}
      const holder=href?dom('a','wh-news-item'):dom('div','wh-news-item');
      if(href){holder.href=href;holder.target='_blank';holder.rel='noopener noreferrer';}
      holder.appendChild(dom('span','wh-news-bullet'));
      const body=dom('span');
      body.appendChild(dom('strong',null,item.title||'未命名话题'));
      body.appendChild(dom('small',null,[item.srcLevel||item.source||'公开渠道','关注档：'+(item.tier||'待核实')].join(' · ')));
      holder.appendChild(body);box.appendChild(holder);
    }
    setText('whNewsFoot','最近抓取：'+(data.updated||'待核实')+' · '+(data.note?'按编辑关注档排序，不展示平台真实阅读/转发/点赞':'关注档为编辑分级，并非实际阅读量'));
  }).catch(()=>{
    $('whNewsItems').replaceChildren(dom('p','wh-help','暂时无法读取今日资讯。请到下方“完整今日仲恺”查看历史内容及数据说明。'));
    setText('whSourceUpdated','资讯暂不可用');setText('whNewsFoot','此处不以虚构新闻填补数据空缺。');
  });
}
function bind(){
  document.querySelectorAll('.wh-scene-tab').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.whMode)));
  $('whFindAction').addEventListener('click',find);
  $('whFind').addEventListener('keydown',e=>{if(e.key==='Enter')find();});
  const sel=$('whShockSelect');
  ZK.SHOCKS.forEach(([label,,key])=>{
    const option=dom('option');option.value=key;option.textContent=label;sel.appendChild(option);
  });
  sel.value=shock;
  sel.addEventListener('change',()=>{shock=sel.value;showStructural();});
  $('whMu').min='0';$('whMu').max=String(ZK.DEFAULT_PATHS[0].mu*2);$('whMu').step='10';
  $('whMu').addEventListener('input',()=>{
    mu=+$('whMu').value;setText('whMuValue',fmt(mu)+'亿元');
    clearTimeout(timer);timer=setTimeout(renderScenario,70);
  });
  $('whReset').addEventListener('click',()=>{mu=ZK.DEFAULT_PATHS[0].mu;$('whMu').value=mu;clearTimeout(timer);renderScenario();});
  $('whSave').addEventListener('click',()=>{
    const results=ZK.run(SEED,SAMPLES,ZK.DEFAULT_PATHS.map((p,i)=>({...p,mu:i===0?mu:p.mu})));
    const state={type:'newzk-home-v6',version:1,seed:SEED,samples:SAMPLES,changed:'chain-contribution',input:mu,defaultInput:ZK.DEFAULT_PATHS[0].mu,baseline:{p10:baseline.p10,p50:baseline.p50,p90:baseline.p90,hit:baseline.hit},experiment:{p10:results.p10,p50:results.p50,p90:results.p90,hit:results.hit},savedAt:new Date().toISOString()};
    try{localStorage.setItem('newzk-home-v6-scenario',JSON.stringify(state));setText('whOutcome','本次A/B方案已保存在当前浏览器 · '+new Date().toLocaleString('zh-CN')+'。不修改任何正式数据。');}
    catch(err){setText('whOutcome','浏览器存储不可用，保存失败。当前实验仍可操作。');}
  });
  window.addEventListener('resize',()=>{if(chart)chart.resize();});
}
function find(){
  const query=$('whFind').value.trim().toLowerCase();
  if(!query)return;
  const node=ZK.NO.find(n=>n[1].toLowerCase().includes(query));
  if(!node){setText('whNodeInfo','没有找到“'+query+'”。请尝试企业、园区或设施名称。');return;}
  if(mode!=='explore')setMode('explore');
  focus(node[0]);
  const g=elNodes.get(node[0]);
  if(g&&typeof g.focus==='function')g.focus({preventScroll:true});
}
function restore(){
  try{
    const state=JSON.parse(localStorage.getItem('newzk-home-v6-scenario')||'null');
    if(state?.type==='newzk-home-v6'&&Number.isFinite(state.input)&&state.input>=0&&state.input<=ZK.DEFAULT_PATHS[0].mu*2){
      mu=state.input;$('whMu').value=mu;
    }
  }catch(e){}
}
buildCity();buildNetwork();
if(window.matchMedia&&window.matchMedia('(max-width:600px)').matches){
  $('whNetwork').setAttribute('viewBox','165 70 920 770');
  elNodes.forEach(g=>g.querySelector('.wh-tap')?.setAttribute('r','49'));
}
setText('whBase',ZK.BASE.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}));
setText('whTarget',fmt(ZK.TARGET));
setText('whRelationCount',ZK.NO.length+' / '+ZK.LK.length);
setText('whNetworkCount',ZK.NO.length+'个主体、'+ZK.LK.length+'条关系');
setText('whBaselineHit',baseline.hit.toFixed(1)+'%');
setText('whHitA',baseline.hit.toFixed(1)+'%');
setText('whHitB',baseline.hit.toFixed(1)+'%');
restore();bind();setMode('explore');loadNews();
})();