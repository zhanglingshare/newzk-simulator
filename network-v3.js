/* NewZK network workbench V3 — view controls only; ZK model untouched. */
(function(){
  'use strict';
  const svg=document.getElementById('net'),canvas=document.querySelector('.network-canvas');
  if(!svg||!canvas||!window.ZK)return;
  const full={x:0,y:0,w:1240,h:920};
  let view={...full},selected=null;
  const isMobile=()=>matchMedia('(max-width:760px)').matches;
  const status=document.getElementById('netZoomStatus');
  const drawer=document.querySelector('.network-side');
  const search=document.getElementById('netSearch');
  const empty=document.getElementById('netEmpty');
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function showView(){
    const minW=full.w/3.5;
    view.w=clamp(view.w,minW,full.w);
    view.h=view.w*full.h/full.w;
    view.x=clamp(view.x,full.x,full.w-view.w);
    view.y=clamp(view.y,full.y,full.h-view.h);
    svg.setAttribute('viewBox',[view.x,view.y,view.w,view.h].join(' '));
    const scale=full.w/view.w;
    status.textContent=Math.round(scale*100)+'%';
    updateDensity();
  }
  function updateDensity(){
    const scale=full.w/view.w;
    const selectedNeighbors=new Set(selected?ZK.LK.filter(l=>l[0]===selected||l[1]===selected).map(l=>l[0]===selected?l[1]:l[0]):[]);
    svg.querySelectorAll('.node').forEach(node=>{
      const id=node.dataset.n;
      const ly=ZK.layerOf(id);
      const priority=ly==='chain'||ly==='oem'||ly==='park';
      const visible=scale>=1.65||priority||id===selected||selectedNeighbors.has(id);
      const labels=node.querySelectorAll('text');
      if(labels[0])labels[0].classList.toggle('net-node-label-hidden',!visible);
      if(labels[1])labels[1].classList.toggle('net-node-label-hidden',scale<2.2&&id!==selected);
    });
  }
  function zoom(factor,cx=view.x+view.w/2,cy=view.y+view.h/2){
    const oldW=view.w,oldH=view.h;
    const w=clamp(oldW/factor,full.w/3.5,full.w),h=w*full.h/full.w;
    view.x=cx-(cx-view.x)*w/oldW;
    view.y=cy-(cy-view.y)*h/oldH;
    view.w=w;view.h=h;showView();
  }
  function point(e){
    const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  function fit(){view={...full};showView();}
  document.getElementById('netZoomIn').onclick=()=>zoom(1.35);
  document.getElementById('netZoomOut').onclick=()=>zoom(1/1.35);
  document.getElementById('netFit').onclick=fit;
  document.getElementById('netOverview').onclick=()=>openDrawer();
  function openDrawer(){
    if(isMobile()){drawer.classList.add('drawer-open');document.getElementById('netDrawerClose').focus();}
  }
  function closeDrawer(){drawer.classList.remove('drawer-open');}
  document.getElementById('netDrawerClose').onclick=closeDrawer;
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});
  function focusNode(id){
    const node=Array.from(svg.querySelectorAll('.node')).find(g=>g.dataset.n===id);
    if(!node){empty.textContent='该主体被当前筛选隐藏，请切换到“全部”后重试。';empty.classList.add('visible');return;}
    empty.classList.remove('visible');
    selected=id;
    const n=ZK.NO.find(n=>n[0]===id);
    if(!n)return;
    const w=Math.min(view.w,650),h=w*full.h/full.w;
    view={x:n[3]-w/2,y:n[4]-h/2,w,h};showView();
    node.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:0,clientY:0}));
    selected=id;updateDensity();
    openDrawer();
  }
  function findNode(){
    const q=search.value.trim().toLowerCase();
    if(!q){empty.classList.remove('visible');return;}
    const found=ZK.NO.find(n=>ZK.nm(n[0]).toLowerCase().includes(q));
    if(!found){empty.textContent='没有找到匹配的主体。请换一个名称或清空搜索。';empty.classList.add('visible');return;}
    focusNode(found[0]);
  }
  document.getElementById('netFind').onclick=findNode;
  search.addEventListener('keydown',e=>{if(e.key==='Enter')findNode();});
  svg.addEventListener('click',e=>{
    const node=e.target.closest('.node');
    if(!node)return;
    selected=node.dataset.n;
    updateDensity();
    openDrawer();
  });
  svg.addEventListener('wheel',e=>{
    e.preventDefault();
    const p=point(e);
    zoom(e.deltaY<0?1.16:1/1.16,p.x,p.y);
  },{passive:false});
  const pointers=new Map();
  let pan=null,pinch=null;
  svg.addEventListener('pointerdown',e=>{
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){
      const ps=[...pointers.values()];
      pinch={distance:Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y)};
      pan=null;
    }else if(pointers.size===1&&!e.target.closest('.node')){
      pan={x:e.clientX,y:e.clientY,view:{...view}};
      svg.setPointerCapture(e.pointerId);
    }
  });
  svg.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId))return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2&&pinch){
      const ps=[...pointers.values()];
      const distance=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);
      if(pinch.distance>0&&distance>0){
        zoom(distance/pinch.distance);
        pinch.distance=distance;
      }
    }else if(pan&&pointers.size===1){
      const rect=svg.getBoundingClientRect();
      view.x=pan.view.x-(e.clientX-pan.x)*pan.view.w/rect.width;
      view.y=pan.view.y-(e.clientY-pan.y)*pan.view.h/rect.height;
      showView();
    }
  });
  function release(e){pointers.delete(e.pointerId);pan=null;pinch=null;}
  svg.addEventListener('pointerup',release);svg.addEventListener('pointercancel',release);
  const tabs=[...document.querySelectorAll('.net-panels-nav [role="tab"]')];
  function showPanel(which){
    tabs.forEach(t=>t.setAttribute('aria-selected',String(t.dataset.panel===which)));
    document.querySelectorAll('.net-analysis-panel').forEach(p=>p.hidden=p.id!=='net-panel-'+which);
    if(which!=='overview')requestAnimationFrame(()=>document.querySelectorAll('.net-analysis-panel:not([hidden]) .chart').forEach(el=>{
      const c=window.echarts&&echarts.getInstanceByDom(el);if(c)c.resize();
    }));
  }
  tabs.forEach(t=>t.onclick=()=>showPanel(t.dataset.panel));
  showPanel('overview');
  new MutationObserver(()=>updateDensity()).observe(svg,{childList:true});
  window.addEventListener('resize',()=>{if(!isMobile())closeDrawer();});
  showView();
  if(isMobile())zoom(3);
})();