/* NewZK V11 — three-minute decision-thinking experience.
   No economic predictions. Each graph result is computed from existing ZK.NO/LK and one hypothetical change;
   this does not modify the professional V5 lab's B state or the source model. */
(function(){
'use strict';
if(typeof ZK==='undefined'||!document.getElementById('v11Experience'))return;
const $=id=>document.getElementById(id);
const sel=(css)=>[...document.querySelectorAll(css)];
const text=(id,value)=>{if($(id))$(id).textContent=String(value);};
const edgeKey=(a,b)=>[a,b].sort().join('|');
const dataNodes=ZK.NO.map(x=>x[0]);
const links=ZK.LK.map(x=>({a:x[0],b:x[1],uncertain:!!x[3],key:edgeKey(x[0],x[1])}));
const names=new Map(ZK.NO.map(n=>[n[0],n[1]]));
const name=id=>names.get(id)||id;
const scenes={
 supplier:{
   title:'亿纬锂能与本地生产性服务业之间，有多牢靠？',
   edge:['n4','n53'],
   intro:'模型记录了“亿纬锂能—生产性服务业”这条待核实关系。它可能存在，但我们缺乏实际交易与服务使用的充分资料。',
   claim:'产业链主能否有效带动本地服务业',
   evidence:[
    ['实际交易或采购记录','核实链主是否与本地服务机构有持续合作、采购规模和替代渠道。','direct'],
    ['相关新闻报道','新闻可以提示线索和时间点，但不足以证明实际交易关系。','context'],
    ['全区GDP变化','GDP是重要总体指标，不能直接证实这两类主体之间的具体联系。','indirect']
   ]
 },
 consumer:{
   title:'服务业真的承接住了本地消费吗？',
   edge:['n53','n52'],
   intro:'模型存在“生产性服务业—消费承接”这一待核实连接，但还不能从模型关系认定资金实际留存比例。',
   claim:'产业产生的收入能否通过本地服务转成消费',
   evidence:[
    ['本地消费去向与服务采购样本','优先核实本地采购、职工消费地点及其统计口径，区分事实与外推。','direct'],
    ['商圈人流照片','热闹的场景能带来假设，却不能独立证明消费留存率。','context'],
    ['产业总产值','产值规模无法单独推断服务购买地点或居民消费流向。','indirect']
   ]
 },
 talent:{
   title:'人才公寓和城市消费之间的联系有多强？',
   edge:['n54','n52'],
   intro:'模型把“人才公寓—消费承接”标为待核实连接。住房的存在不等于居住者一定在本地消费。',
   claim:'人才生活需求能否在本地得到有效承接',
   evidence:[
    ['居住与实际消费行为的关联样本','查看人才住房入住、通勤和消费地点的同口径样本，注意个人隐私。','direct'],
    ['新区夜景热闹程度','夜景可以呈现城市活力，不能验证人才公寓住户的消费流向。','context'],
    ['工业总产值增长','工业增长并不能直接说明住房住户的生活消费路径。','indirect']
   ]
 }
};
for(const [id,c] of Object.entries(scenes)){
 if(!links.some(e=>e.key===edgeKey(...c.edge)))throw Error('Missing recorded model relation for '+id);
}
const baseMetrics=metrics(null);
let currentCase='supplier',judgment=null,evidenceIndex=null,step=1,result=baseMetrics,copyText='';
function metrics(cut){
 const adj=new Map(dataNodes.map(id=>[id,[]]));
 let count=0;
 links.forEach(e=>{
  if(cut===e.key)return;
  adj.get(e.a).push(e.b);adj.get(e.b).push(e.a);count++;
 });
 const visited=new Set();let components=0,largest=0;
 for(const id of dataNodes){
  if(visited.has(id))continue;
  components++;let todo=[id],sz=0;visited.add(id);
  while(todo.length){
   const p=todo.pop();sz++;
   for(const nb of adj.get(p))if(!visited.has(nb)){visited.add(nb);todo.push(nb);}
  }
  largest=Math.max(largest,sz);
 }
 return {nodes:dataNodes.length,edges:count,components,largest};
}
function go(number){
 step=number;
 for(let k=1;k<=5;k++)$('v11Step'+k).hidden=k!==number;
 sel('.v11-steps [data-step-index]').forEach(item=>{
  const n=Number(item.dataset.stepIndex);
  item.classList.toggle('is-done',n<=number);
  item.classList.toggle('is-active',n===number);
 });
 const experience=$('v11Experience');
 experience.dataset.step=String(number);
 if(number>1&&window.matchMedia&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const rect=experience.getBoundingClientRect();
  if(rect.top<0||rect.top>window.innerHeight*.8)experience.scrollIntoView({behavior:'smooth',block:'start'});
 }
}
function chooseCase(next){
 if(!scenes[next])return;
 currentCase=next;judgment=null;evidenceIndex=null;
 sel('.v11-case').forEach(b=>{const active=b.dataset.case===next;b.classList.toggle('is-selected',active);b.setAttribute('aria-pressed',String(active));});
 const x=scenes[next];
 text('v11HypothesisTitle',x.title);
 text('v11HypothesisCopy',x.intro);
 const edge=links.find(l=>l.key===edgeKey(...x.edge));
 text('v11Premise',name(x.edge[0])+'  ↔  '+name(x.edge[1])+' · '+(edge.uncertain?'现有模型标记为「待核实」':'模型记录关系'));
 text('v11TensionLeft',name(x.edge[0]));text('v11TensionRight',name(x.edge[1]));
 $('v11Tension').dataset.action='keep';text('v11TensionStatus','原模型记录 · 待核实');
 sel('.v11-judge').forEach(b=>b.classList.remove('is-selected'));
 $('v11Run').disabled=true;$('v11Finish').disabled=true;
 if(next==='supplier')document.querySelector('.v10-stage-actions button[data-focus="hub"]')?.click();
 if(next==='consumer')document.querySelector('.v10-stage-actions button[data-focus="uncertain"]')?.click();
 if(next==='talent')document.querySelector('.v10-stage-actions button[data-focus="life"]')?.click();
}
function chooseJudgment(kind){
 if(kind!=='keep'&&kind!=='remove')return;
 judgment=kind;
 sel('.v11-judge').forEach(b=>b.classList.toggle('is-selected',b.dataset.judgment===kind));
 $('v11Run').disabled=false;
}
function showResult(){
 if(!judgment)return;
 const x=scenes[currentCase];
 result=metrics(judgment==='remove'?edgeKey(...x.edge):null);
 const diffC=result.components-baseMetrics.components,diffL=result.largest-baseMetrics.largest;
 $('v11Tension').dataset.action=judgment;
 text('v11TensionStatus',judgment==='remove'?'你的假设 / 连接暂时失效':'你的假设 / 关系保持不变');
 text('v11ResultA',baseMetrics.edges);text('v11ResultB',result.edges);
 text('v11ResultGlyph',judgment==='remove'?'⟟':'↔');
 text('v11ResultComponents','连通组：'+baseMetrics.components+' → '+result.components);
 text('v11ResultLargest','最大连通群：'+baseMetrics.largest+' → '+result.largest);
 let meaning;
 if(judgment==='keep'){
  text('v11ResultTitle','你暂时相信了模型的这条关系。');
  meaning='A和B相同，是因为你选择不改变图的结构。但“模型有记录”不等于“现实已经核实”。下一步仍应确认交易或实际联系。';
 }else if(diffC===0&&diffL===0){
  text('v11ResultTitle','少了一条线，大网却没有碎。');
  meaning='假设这条关系失效：关系数 '+baseMetrics.edges+' → '+result.edges+'，但最大连通群和连通组都没变。网络可能有替代路径；这并不能证明实际经济损失为零。';
 }else{
  text('v11ResultTitle','一条关系，让结构出现不同。');
  meaning='假设关系失效：连通组 '+baseMetrics.components+' → '+result.components+'，最大连通群 '+baseMetrics.largest+' → '+result.largest+'。这是图论意义上的变化，不代表真实企业倒闭或经济损失。';
 }
 text('v11ResultMeaning',meaning);
 go(3);
}
function prepareEvidence(){
 const parent=$('v11EvidenceOptions');parent.replaceChildren();
 evidenceIndex=null;$('v11Finish').disabled=true;
 scenes[currentCase].evidence.forEach((e,i)=>{
  const btn=document.createElement('button');btn.className='v11-evidence';btn.type='button';btn.dataset.evidence=String(i);
  const label=document.createElement('span');label.textContent='证据 '+String(i+1).padStart(2,'0');
  const head=document.createElement('strong');head.textContent=e[0];
  const arrow=document.createElement('i');arrow.textContent='↗';
  btn.append(label,head,arrow);
  btn.addEventListener('click',()=>chooseEvidence(i));parent.append(btn);
 });
 text('v11EvidenceFeedback','真正的决策，从知道自己还不知道什么开始。');
 go(4);
}
function chooseEvidence(i){
 evidenceIndex=i;
 const e=scenes[currentCase].evidence[i];
 sel('.v11-evidence').forEach(b=>b.classList.toggle('is-selected',Number(b.dataset.evidence)===i));
 text('v11EvidenceFeedback',(e[2]==='direct'?'这是一条直接相关的核验路径。':'可以参考，但证据距离这个具体问题还有距离。')+' '+e[1]);
 $('v11Finish').disabled=false;
}
function finish(){
 if(evidenceIndex===null)return;
 const x=scenes[currentCase],e=x.evidence[evidenceIndex],changed=judgment==='remove',base=baseMetrics,b=result;
 const payload={
  schema:'newzk-decision-experience-v11',date:new Date().toISOString(),
  question:x.title,recordedLink:x.edge.map(name),
  originalStatus:'ZK.LK model record; evidence flag: '+(links.find(l=>l.key===edgeKey(...x.edge)).uncertain?'unverified':'recorded'),
  hypotheticalAction:changed?'assume this one link is absent':'retain this model link',
  graphBaseline:base,graphScenario:b,evidenceToCheck:e[0],evidenceReason:e[1],
  note:'This is a local learning exercise. Topology metrics are not GDP, company outcomes or verified causal effects.'
 };
 const lines=[
  '【我的仲恺结构判断卡】',
  '问题：'+x.title,
  '已知：公开模型列有 '+x.edge.map(name).join(' — ')+' 的待核实关联。',
  '我的假设：'+(changed?'暂时移除这条关系，测试结构韧性':'先保留这条模型关系，不提前断言其可靠性'),
  'A/B结构：关系 '+base.edges+' → '+b.edges+'；连通组 '+base.components+' → '+b.components+'；最大连通群 '+base.largest+' → '+b.largest+'。',
  '必须警惕：结构连通性≠现实交易强度，不能由此得出产值损失或因果结论。',
  '优先查证：'+e[0]+'。',
  '核验理由：'+e[1],
  '下一步：获取可核实、合规来源的事实，回来修正假设，而不是急着下结论。',
  '方法：提出问题 → 明确假设 → 观察有限结果 → 承认证据缺口 → 决定下一步。'
 ];
 copyText=lines.join('\n');
 const holder=$('v11Takeaway');holder.replaceChildren();
 lines.slice(1,8).forEach((line,i)=>{
  const row=document.createElement('div');row.className='v11-takeaway-row'+(i===6?' is-final':'');
  const marker=document.createElement('span');marker.textContent=String(i+1).padStart(2,'0');
  const body=document.createElement('p');body.textContent=line;row.append(marker,body);holder.append(row);
 });
 try{localStorage.setItem('newzk-v11-thinking-card',JSON.stringify(payload));text('v11SaveStatus','已存入当前浏览器，可复制保存这张思考卡。');}
 catch(err){text('v11SaveStatus','当前浏览器不支持本地保存。可以复制思考卡文本。');}
 go(5);
}
function buildMoney(){
 const list=$('v11MoneyStream');if(!list)return;
 list.replaceChildren();
 const input=ZK.MULT_LAYERS.slice(0,4);
 const sum=input.reduce((a,r)=>a+parseFloat(r[1]),0);
 const rows=[...input,['示例外流',(Math.max(0,1-sum)).toFixed(2)+' 亿','1亿元与本地留存示例之差，不代表真实追踪到外流资金。']];
 rows.forEach((r,i)=>{
  const value=parseFloat(r[1]);
  const button=document.createElement('button');button.type='button';button.className='v11-money-item';
  if(i===4)button.classList.add('is-outflow');
  const label=document.createElement('span');label.className='v11-money-name';label.textContent=r[0].replace(/^[①②③④]\s*/,'');
  const track=document.createElement('span');track.className='v11-money-track';
  const bar=document.createElement('i');bar.style.width=(value*100)+'%';track.append(bar);
  const amount=document.createElement('strong');amount.textContent=r[1];
  button.append(label,track,amount);
  button.addEventListener('click',()=>{
    sel('.v11-money-item').forEach(x=>x.classList.remove('is-selected'));button.classList.add('is-selected');
    text('v11MoneyNote',r[0]+'：'+r[2]+'（模型静态示例，不是实测资金流。）');
  });
  list.append(button);
 });
}
function buildSem(){
 const el=$('v11SemJourney');if(!el)return;el.replaceChildren();
 ZK.SEM.forEach((r,i)=>{
  const button=document.createElement('button');button.type='button';button.className='v11-sem-link'+(r[2]===Math.min(...ZK.SEM.map(x=>x[2]))?' is-weak':'');
  const num=document.createElement('span');num.textContent=String(i+1).padStart(2,'0');
  const label=document.createElement('strong');label.textContent=r[0]+' → '+r[1];
  const val=document.createElement('b');val.textContent=Number(r[2]).toFixed(2);
  button.append(num,label,val);button.addEventListener('click',()=>{
   sel('.v11-sem-link').forEach(b=>b.classList.remove('is-selected'));button.classList.add('is-selected');
   text('v11SemDetail',r[0]+' → '+r[1]+' · 模型系数 '+r[2].toFixed(2)+'。'+r[3]+'。此系数是D级待校准假设，并非验证过的因果效应。');
  });el.append(button);
 });
 el.querySelector('.v11-sem-link.is-weak')?.click();
}
function buildLoop(){
 const el=$('v11LoopStage');if(!el)return;el.replaceChildren();
 const stages=['投入','配套','订单','企业','税收','设施','人才','创新'];
 stages.forEach((name,i)=>{
  const label=document.createElement('span');label.className='v11-loop-node';label.textContent=name;label.style.animationDelay=(i*.16)+'s';
  el.append(label);
  if(i<stages.length-1){const arrow=document.createElement('i');arrow.className='v11-loop-arrow';arrow.textContent='→';el.append(arrow);}
 });
 const end=document.createElement('small');end.textContent='↶ 可能形成反馈 · 这是待验证的机制框架，不是现实已发生的逐级传导';el.append(end);
}
function onToggleRaw(){
 sel('.v11-raw').forEach(el=>el.addEventListener('toggle',()=>{if(el.open)window.dispatchEvent(new Event('resize'));}));
 $('v11Expert')?.addEventListener('toggle',()=>{if($('v11Expert').open)window.dispatchEvent(new Event('resize'));});
}
$('v11Start').addEventListener('click',()=>{chooseCase(currentCase);go(2);});
sel('.v11-case').forEach(b=>b.addEventListener('click',()=>chooseCase(b.dataset.case)));
sel('.v11-judge').forEach(b=>b.addEventListener('click',()=>chooseJudgment(b.dataset.judgment)));
$('v11Run').addEventListener('click',showResult);
$('v11EvidenceNext').addEventListener('click',prepareEvidence);
$('v11Finish').addEventListener('click',finish);
sel('[data-back]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.back))));
$('v11Again').addEventListener('click',()=>{chooseCase('supplier');go(1);});
$('v11Copy').addEventListener('click',async()=>{
 if(!copyText)return;
 try{await navigator.clipboard.writeText(copyText);text('v11SaveStatus','已复制思考卡。分享的是你的推理过程，不是模型对现实的预测。');}
 catch(err){
  const ta=document.createElement('textarea');ta.value=copyText;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();
  try{if(document.execCommand('copy'))text('v11SaveStatus','已复制思考卡。');else text('v11SaveStatus','复制被浏览器限制，请使用支持复制的浏览器。');}
  finally{ta.remove();}
 }
});
buildMoney();buildSem();buildLoop();onToggleRaw();chooseCase('supplier');go(1);
})();