/* V5 paths workbench: compare two inputs to the unchanged ZK.run model. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
if(typeof ZK==='undefined'||!$('lab5PathInputs')||!window.echarts)return;
const DEFAULTS=ZK.DEFAULT_PATHS.map(p=>({...p}));
const seed=20261020,N=1000;
const baseline=ZK.run(seed,N,DEFAULTS);
let current=DEFAULTS.map(p=>p.mu),timer=null,chart=null;
const fmt=n=>Math.round(n).toLocaleString('zh-CN');
function currentPaths(){return DEFAULTS.map((p,i)=>({...p,mu:current[i]}));}
function drawInputs(){
  $('lab5PathInputs').innerHTML=DEFAULTS.map((p,i)=>'<label class="lab5-path-row"><span class="lab5-path-title"><span class="lab5-path-dot" style="background:'+p.color+'"></span>'+p.name+'</span><span class="lab5-path-value" id="lab5PV'+i+'">'+fmt(current[i])+' 亿</span><input type="range" min="0" max="'+(p.mu*2)+'" step="10" value="'+current[i]+'" data-i="'+i+'" aria-label="'+p.name+'假设贡献（亿元）"><small>默认 '+fmt(p.mu)+' 亿 · 当前只改变假设贡献</small></label>').join('');
  $('lab5PathInputs').querySelectorAll('input[type=range]').forEach(input=>{
    input.addEventListener('input',()=>{
      const i=+input.dataset.i;
      current[i]=+input.value;
      $('lab5PV'+i).textContent=fmt(current[i])+' 亿';
      $('lab5PathStatus').textContent='正在重新计算…';
      clearTimeout(timer);timer=setTimeout(render,90);
    });
  });
}
function hist(vals,min,max,bins){
  const ret=new Array(bins).fill(0),step=(max-min)/bins;
  for(const v of vals){
    const idx=Math.min(bins-1,Math.max(0,Math.floor((v-min)/step)));
    ret[idx]++;
  }
  return ret.map(x=>x/vals.length*100);
}
function delta(a,b,digits=0){
  const d=b-a,sign=d>0?'+':'';
  return sign+d.toFixed(digits);
}
function cards(a,b){
  const values=[
    ['中位数',fmt(a.p50)+' 亿',fmt(b.p50)+' 亿',delta(a.p50,b.p50)+' 亿'],
    ['目标达成概率',a.hit.toFixed(1)+'%',b.hit.toFixed(1)+'%',delta(a.hit,b.hit,1)+' 个百分点'],
    ['10%～90%区间',fmt(a.p10)+'～'+fmt(a.p90),fmt(b.p10)+'～'+fmt(b.p90),'下沿 '+delta(a.p10,b.p10)+' / 上沿 '+delta(a.p90,b.p90)]
  ];
  $('lab5PathKpis').innerHTML=values.map(([name,oldVal,newVal,change])=>'<div class="lab5-path-stat"><span>'+name+'</span><div><small>A 基准</small><b>'+oldVal+'</b></div><div><small>B 假设</small><b>'+newVal+'</b></div><em>变化 '+change+'</em></div>').join('');
}
function drawDist(a,b){
  const bins=45,low=Math.floor(Math.min(a.p10,b.p10,Math.min(...a.results),Math.min(...b.results))/200)*200;
  const high=Math.ceil(Math.max(a.p90,b.p90,Math.max(...a.results),Math.max(...b.results))/200)*200;
  const xs=Array.from({length:bins},(_,i)=>Math.round(low+(i+.5)*(high-low)/bins));
  const av=hist(a.results,low,high,bins),bv=hist(b.results,low,high,bins);
  const ele=$('lab5PathChart');
  if(!chart)chart=echarts.init(ele);
  chart.setOption({
    backgroundColor:'transparent',
    animationDurationUpdate:400,
    textStyle:{fontFamily:'-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'},
    legend:{data:['A 基准','B 假设'],top:0,textStyle:{color:'#516682',fontSize:12}},
    grid:{left:54,right:24,top:35,bottom:42,containLabel:false},
    tooltip:{trigger:'axis',formatter:params=>params.map(p=>p.seriesName+' · '+fmt(+p.axisValue)+' 亿附近：'+p.value.toFixed(1)+'%').join('<br>')},
    xAxis:{type:'category',boundaryGap:false,data:xs,axisLabel:{color:'#536782',fontSize:11,interval:8,formatter:v=>fmt(+v)},axisLine:{lineStyle:{color:'#d9e4f2'}},axisTick:{show:false},name:'2030模型产值（亿元）',nameLocation:'middle',nameGap:28,nameTextStyle:{color:'#536782'}},
    yAxis:{type:'value',name:'样本占比',axisLabel:{color:'#536782',formatter:'{value}%'},splitLine:{lineStyle:{color:'#e8eef6'}}},
    series:[
      {name:'A 基准',type:'line',data:av,smooth:.3,showSymbol:false,lineStyle:{width:2.5,color:'#8094b2'},itemStyle:{color:'#8094b2'},areaStyle:{color:'rgba(128,148,178,.12)'},emphasis:{focus:'series'}},
      {name:'B 假设',type:'line',data:bv,smooth:.3,showSymbol:false,lineStyle:{width:3,color:'#245bdb'},itemStyle:{color:'#245bdb'},areaStyle:{color:'rgba(36,91,219,.10)'},emphasis:{focus:'series'}}
    ]
  },true);
  chart.resize();
}
function render(){
  const result=ZK.run(seed,N,currentPaths());
  cards(baseline,result);drawDist(baseline,result);
  $('lab5PathStatus').textContent='按原模型完成 '+N+' 次抽样 · 基准与假设使用相同随机种子';
}
$('lab5PathsReset').addEventListener('click',()=>{
  clearTimeout(timer);current=DEFAULTS.map(p=>p.mu);
  drawInputs();render();
});
$('lab5PathsSave').addEventListener('click',()=>{
  const state={type:'paths-contribution-scenario',version:1,seed,N,
    baseline:DEFAULTS.map(p=>({name:p.name,mu:p.mu,sd:p.sd})),
    experiment:currentPaths().map(p=>({name:p.name,mu:p.mu,sd:p.sd})),
    results:{base:{p10:baseline.p10,p50:baseline.p50,p90:baseline.p90,hit:baseline.hit}},
    savedAt:new Date().toISOString()};
  const r=ZK.run(seed,N,currentPaths());
  state.results.experiment={p10:r.p10,p50:r.p50,p90:r.p90,hit:r.hit};
  try{localStorage.setItem('newzk-lab-paths-v1',JSON.stringify(state));$('lab5PathStatus').textContent='已保存到当前浏览器 · 仅保存假设和计算结果，未修改原模型';}
  catch(err){$('lab5PathStatus').textContent='浏览器存储不可用，尚未保存。';}
});
let saved=null;try{saved=JSON.parse(localStorage.getItem('newzk-lab-paths-v1')||'null');}catch(err){}
if(saved?.type==='paths-contribution-scenario'&&Array.isArray(saved.experiment)&&saved.experiment.length===DEFAULTS.length){
  current=saved.experiment.map((p,i)=>Math.max(0,Math.min(DEFAULTS[i].mu*2,Number.isFinite(+p.mu)?+p.mu:DEFAULTS[i].mu)));
}
drawInputs();render();
window.addEventListener('resize',()=>{if(chart)chart.resize();});
})();