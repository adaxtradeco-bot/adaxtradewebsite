/* IVAFlow — نسخه: خدای ساسان — Baseline v1.2 (synced mega + light/dark + tabs) */

// Mega menu hover-intent (single block, synced with .nav-item)
(() => {
  const items = document.querySelectorAll('.nav-item');
  const IN = 220, OUT = 260;
  items.forEach(item => {
    let ti=null, to=null;
    const open=()=>{ clearTimeout(to); ti=setTimeout(()=>item.classList.add('open'), IN); };
    const close=()=>{ clearTimeout(ti); to=setTimeout(()=>item.classList.remove('open'), OUT); };
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    // Touch/click support
    const btn = item.querySelector('.nav-btn');
    if(btn){
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.nav-item.open').forEach(x=>x.classList.remove('open'));
        if(!isOpen) item.classList.add('open');
      });
    }
  });
  document.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-item.open').forEach(x=>x.classList.remove('open'));
  });
})();

// Solutions Tabs (5)
(function(){
  const root = document.getElementById('solutions-tabs');
  if(!root) return;

  const btns = root.querySelectorAll('.tab-btn');
  const panels = {
    forms: root.querySelector('#panel-forms'),
    workflow: root.querySelector('#panel-workflow'),
    analytics: root.querySelector('#panel-analytics'),
    appbuilder: root.querySelector('#panel-appbuilder'),
    integrations: root.querySelector('#panel-integrations'),
  };

  btns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      btns.forEach(b=>{
        const on = (b===btn);
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', String(on));
      });
      const key = btn.dataset.tab;
      Object.entries(panels).forEach(([k,el])=>{
        if(!el) return;
        const on = (k===key);
        el.hidden = !on;
        el.classList.toggle('active', on);
      });
    });
  });
})();

// USP tabbed images
(function(){
  const tabs = document.querySelectorAll('.usp-tab');
  const panes = document.querySelectorAll('.usp-pane');
  if(!tabs.length) return;
  function activate(id){
    tabs.forEach(t=>{
      const on = t.dataset.target === id;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
    panes.forEach(p=>{
      const on = p.id === id;
      p.classList.toggle('active', on);
      p.hidden = !on;
    });
  }
  tabs.forEach(t=>{
    t.addEventListener('click', ()=> activate(t.dataset.target));
    t.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); activate(t.dataset.target); }
    });
  });
})();

// Orbit tag subtle pulse on hover
(() => {
  const tags = document.querySelectorAll('.orbit-tag');
  tags.forEach(t => {
    t.addEventListener('mouseenter', () => t.classList.add('pulse'));
    t.addEventListener('mouseleave', () => t.classList.remove('pulse'));
  });
})();

/* ========== Theme Manager ========== */
(function() {
  const KEY = 'ivaflow-theme';     // 'light' | 'dark' | 'auto'
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeText');
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function apply(theme) {
    const resolved = (theme === 'auto') ? (media.matches ? 'dark' : 'light') : theme;
    if (resolved === 'dark') root.setAttribute('data-theme','dark');
    else root.removeAttribute('data-theme');

    label && (label.textContent = theme[0].toUpperCase() + theme.slice(1));
    if (icon) {
      icon.innerHTML = (resolved === 'dark')
        ? '<svg viewBox="0 0 24 24" fill="none"><path d="M20 12.6a8 8 0 1 1-8.6-8 7 7 0 1 0 8.6 8Z" stroke="currentColor" stroke-width="1.6"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6 6.4 6.4M17.6 17.6l1.8 1.8M17.6 6.4l1.8-1.8M4.6 19.4l1.8-1.8" stroke="currentColor" stroke-width="1.6"/></svg>';
    }
  }

  function current() { return localStorage.getItem(KEY) || 'auto'; }
  function cycle(theme) { return theme==='auto' ? 'dark' : theme==='dark' ? 'light' : 'auto'; }

  apply(current());
  media.addEventListener?.('change', () => { if (current() === 'auto') apply('auto'); });

  btn && btn.addEventListener('click', () => {
    const next = cycle(current());
    localStorage.setItem(KEY, next);
    apply(next);
  });

  btn && btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
  });
})();
/* === PATCH v1.3.1 — scoped tabs for Solutions (sol2) === */
(() => {
  const root = document.getElementById('solutions-v2');
  if(!root) return;
  const tabs = root.querySelectorAll('.sol2 .tab');
  const panels = root.querySelectorAll('.sol2 .panel');
  function set(k){
    tabs.forEach(t=>t.classList.toggle('active', t.dataset.tab===k));
    panels.forEach(p=>p.classList.toggle('active', p.dataset.panel===k));
  }
  tabs.forEach(t=>t.addEventListener('click', ()=>set(t.dataset.tab)));
  set('industry'); // پیش‌فرض
})();
