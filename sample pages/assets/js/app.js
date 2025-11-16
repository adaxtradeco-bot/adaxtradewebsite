// Mega menu hover-intent (delay open/close for a smoother feel)
(() => {
  const items = document.querySelectorAll('.nav-item');
  const IN = 200, OUT = 240;
  items.forEach(item => {
    let ti=null, to=null;
    const open=()=>{ clearTimeout(to); ti=setTimeout(()=>item.classList.add('open'), IN); };
    const close=()=>{ clearTimeout(ti); to=setTimeout(()=>item.classList.remove('open'), OUT); };
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
  });
})();

// Tabs logic
(() => {
  const tabs = document.querySelectorAll('#capTabs .tab-button');
  const panels = document.querySelectorAll('.tab-content');
  function activate(key){
    tabs.forEach(t=>t.classList.toggle('active', t.dataset.tab===key));
    panels.forEach(p=>p.classList.toggle('active', p.dataset.panel===key));
  }
  tabs.forEach(t=>t.addEventListener('click', ()=>activate(t.dataset.tab)));
})();
