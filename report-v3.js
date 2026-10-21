/* Enlarged report charts: presentation only, no recomputation. */
(function(){
  'use strict';
  if(!window.echarts)return;
  const ids=['tornado','mxbar','radar2'];
  const dialog=document.createElement('dialog');
  dialog.className='report-chart-dialog';
  dialog.setAttribute('aria-label','放大查看图表');
  dialog.innerHTML='<div class="report-chart-top"><strong>放大查看图表</strong><button type="button">关闭</button></div><div class="report-chart-expanded"></div>';
  document.body.appendChild(dialog);
  const expanded=dialog.querySelector('.report-chart-expanded');
  let clone=null;
  function close(){if(dialog.open)dialog.close();else dialog.removeAttribute('open');}
  dialog.querySelector('button').onclick=close;
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  dialog.addEventListener('close',()=>{if(clone){clone.dispose();clone=null;}expanded.replaceChildren();});
  ids.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    const button=document.createElement('button');button.type='button';
    button.className='report-expand';button.textContent='放大图表';
    button.setAttribute('aria-label','放大查看当前图表');
    el.insertAdjacentElement('beforebegin',button);
    button.onclick=()=>{
      const source=echarts.getInstanceByDom(el);
      if(!source)return;
      if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
      expanded.replaceChildren();
      clone=echarts.init(expanded);
      clone.setOption(source.getOption(),true);
      requestAnimationFrame(()=>clone&&clone.resize());
    };
  });
  window.addEventListener('resize',()=>{if(clone)clone.resize();});
})();