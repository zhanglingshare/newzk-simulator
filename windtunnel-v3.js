/* Wind tunnel progressive reveal is a visual aid, NOT simulated time. */
(function(){
  'use strict';
  const play=document.getElementById('windPlay'),pause=document.getElementById('windPause');
  const all=document.getElementById('windShowAll'),progress=document.getElementById('windProgress');
  if(!play||!pause||!all)return;
  let timer=null,index=0;
  function nodes(){return [...document.querySelectorAll('#map g')];}
  function labels(){return [...document.querySelectorAll('#impact .p:not(.ok)')];}
  function update(){
    const n=nodes(),p=labels();
    n.forEach((g,i)=>g.classList.toggle('wind-reveal-hidden',i>=index));
    p.forEach((el,i)=>el.classList.toggle('wind-reveal-hidden',i>=index));
    progress.textContent='已展示 '+Math.min(index,n.length)+' / '+n.length+' 个主体（非时间顺序）';
  }
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  function showAll(){stop();index=nodes().length;update();progress.textContent='已显示全部受影响主体';}
  function start(){
    stop();index=0;update();
    timer=setInterval(()=>{
      index=Math.min(index+2,nodes().length);update();
      if(index>=nodes().length){stop();progress.textContent='已显示全部受影响主体';}
    },400);
  }
  play.addEventListener('click',start);
  pause.addEventListener('click',()=>{stop();progress.textContent='已暂停 · 已显示 '+index+' 个主体';});
  all.addEventListener('click',showAll);
  document.getElementById('cards').addEventListener('click',()=>{requestAnimationFrame(showAll);});
  showAll();
})();