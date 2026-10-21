/* NewZK Cloud Lab: presentation-only navigation and chart contrast. */
(function(){
  'use strict';
  const groups=[
    {label:'发现仲恺',pages:[['index.html','今日仲恺'],['who.html','仲恺是什么'],['town.html','生活地图'],['mylife.html','跟我的关系']]},
    {label:'探索关系',pages:[['network.html','产业链地图']]},
    {label:'模拟未来',pages:[['choices.html','五条路'],['future.html','未来2030'],['windtunnel.html','风洞']]},
    {label:'研究与报告',pages:[['blindspot.html','忽略了什么'],['report.html','分析报告'],['ending.html','结语'],['guide.html','使用指南']]}
  ];
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const original=document.querySelector('.nav');
  if(original){
    const header=document.createElement('header');
    header.className='site-header';
    const brand=document.createElement('a');
    brand.className='site-brand';brand.href='index.html';
    brand.innerHTML='<span class="site-brand-mark">N</span><span><strong>NewZK</strong><small>城市经济实验室</small></span>';
    header.appendChild(brand);
    const nav=document.createElement('nav');nav.className='site-navigation';nav.setAttribute('aria-label','全站导航');
    groups.forEach(g=>{
      const details=document.createElement('details');details.className='site-group';
      const active=g.pages.some(p=>p[0]===page);
      if(active)details.classList.add('site-group-active');
      const summary=document.createElement('summary');summary.textContent=g.label;
      details.appendChild(summary);
      const menu=document.createElement('div');menu.className='site-menu';
      g.pages.forEach(p=>{
        const a=document.createElement('a');a.href=p[0];a.textContent=p[1];
        if(p[0]===page){a.className='current';a.setAttribute('aria-current','page');}
        menu.appendChild(a);
      });
      details.appendChild(menu);nav.appendChild(details);
      details.addEventListener('toggle',()=>{if(details.open)nav.querySelectorAll('.site-group').forEach(other=>{if(other!==details)other.open=false;});});
    });
    header.appendChild(nav);
    const mobileMenu=document.createElement('button');
    mobileMenu.type='button';mobileMenu.className='mobile-menu-toggle';
    mobileMenu.textContent='全部页面';mobileMenu.setAttribute('aria-label','展开全部页面');mobileMenu.setAttribute('aria-expanded','false');
    header.appendChild(mobileMenu);
    const mobileNav=document.createElement('nav');mobileNav.className='mobile-bottom-nav';mobileNav.setAttribute('aria-label','手机主导航');
    const mobileOverlay=document.createElement('div');mobileOverlay.className='mobile-nav-overlay';mobileOverlay.hidden=true;
    mobileOverlay.innerHTML='<div class="mobile-nav-head"><strong>选择页面</strong><button type="button" aria-label="关闭菜单">关闭</button></div>';
    groups.forEach((g,i)=>{
      const a=document.createElement('button');a.type='button';a.textContent=g.label;
      a.className='mobile-bottom-item'+(g.pages.some(p=>p[0]===page)?' active':'');
      a.addEventListener('click',()=>openMobileMenu(i));
      mobileNav.appendChild(a);
      const section=document.createElement('section');section.className='mobile-nav-section';
      const h=document.createElement('h3');h.textContent=g.label;section.appendChild(h);
      g.pages.forEach(p=>{const link=document.createElement('a');link.href=p[0];link.textContent=p[1];if(p[0]===page)link.setAttribute('aria-current','page');section.appendChild(link);});
      mobileOverlay.appendChild(section);
    });
    function openMobileMenu(i){
      mobileOverlay.hidden=false;document.body.classList.add('mobile-nav-open');
      mobileMenu.setAttribute('aria-expanded','true');
      mobileOverlay.querySelectorAll('.mobile-nav-section').forEach((section,index)=>section.classList.toggle('selected',i===undefined||i===index));
      mobileOverlay.querySelector('.mobile-nav-head button').focus();
    }
    function closeMobileMenu(){
      mobileOverlay.hidden=true;document.body.classList.remove('mobile-nav-open');mobileMenu.setAttribute('aria-expanded','false');
    }
    mobileMenu.addEventListener('click',()=>mobileOverlay.hidden?openMobileMenu():closeMobileMenu());
    mobileOverlay.querySelector('.mobile-nav-head button').addEventListener('click',closeMobileMenu);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileOverlay.hidden)closeMobileMenu();});
    document.body.append(mobileNav,mobileOverlay);
    original.replaceWith(header);
    document.addEventListener('click',e=>{if(!header.contains(e.target))nav.querySelectorAll('details').forEach(d=>d.open=false);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')nav.querySelectorAll('details').forEach(d=>d.open=false);});
  }
  function updateChartContrast(){
    if(!window.echarts||!echarts.getInstanceByDom)return;
    document.querySelectorAll('.chart,.chart2').forEach(el=>{
      const inst=echarts.getInstanceByDom(el);
      if(!inst)return;
      const opts=inst.getOption();
      if(!opts)return;
      const patch={};
      ['xAxis','yAxis'].forEach(k=>{
        if(Array.isArray(opts[k])&&opts[k].length){
          patch[k]=opts[k].map(()=>({
            axisLabel:{color:'#536782'},
            axisLine:{lineStyle:{color:'#c9d7e8'}},
            axisTick:{lineStyle:{color:'#c9d7e8'}},
            splitLine:{lineStyle:{color:'#e8eef6'}},
            nameTextStyle:{color:'#536782'}
          }));
        }
      });
      if(Array.isArray(opts.legend)&&opts.legend.length){
        patch.legend=opts.legend.map(()=>({textStyle:{color:'#425c78'}}));
      }
      if(Array.isArray(opts.tooltip)&&opts.tooltip.length){
        patch.tooltip=opts.tooltip.map(()=>({backgroundColor:'#ffffff',borderColor:'#d7e3f2',textStyle:{color:'#243b59'}}));
      }
      if(Object.keys(patch).length)inst.setOption(patch,{lazyUpdate:true});
    });
  }
  updateChartContrast();
  window.addEventListener('load',updateChartContrast,{once:true});
  let repaint;
  document.addEventListener('click',()=>{clearTimeout(repaint);repaint=setTimeout(updateChartContrast,150);},{passive:true});
  document.addEventListener('change',()=>{clearTimeout(repaint);repaint=setTimeout(updateChartContrast,150);},{passive:true});
})();