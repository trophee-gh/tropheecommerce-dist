// The panel player (pure-moose-h6b6, 10-15): the timeline hook of the homepage method section, for any panel built on
// the kit (panel/kit.mjs, markup from its section()). Several panels can share a page; each has its own player.
// Beats: [{s: step (1-based), d: ms, on: [keys]}]; a step's sub-beats are its beats in order (n.k = step n, beat k).
// A beat lights keys: [data-k] parts fade in (each after its own --dl, the pulse's travel), [data-x] parts get .lit
// and move; legends (.lg) with data-k get .on. One-shot motions (a pulse, a key press, a flash, a shipped card) restart
// when the same key is lit again.
// The timeline's items are the progress: the current item's bar fills over its step, ticked at each sub-beat; past
// items stay half-tinted. A click on an item jumps to its first beat and the cycle goes on (paused stays paused). No pause
// key (Virgil 10-15): off screen the cycle waits and the motion holds (.mt-frozen); reduced motion shows the last beat,
// static, with no cycling (an item click still jumps there). Phones: the current item opens its
// caption; every caption takes the height of the longest, so the drawing below never moves.
// Use: PanelPlayer(sectionEl, {id, beats, alt}) → {show, run, stop, light, i, hover}; or mark the section
// data-panel="<id>" and set window.PANELS = {<id>: {beats, alt}} before this script: it starts it on load.
// alt: [[step, key, tone]]: while <key> is lit, the item of <step> takes <tone> (the method's Work turns red on a fail).
(() => {
  const ONE_SHOTS = '.mp-1s,.mp-pz,.mp-glow,.mp-flash,.mp-tnew';
  function PanelPlayer(w, o = {}) {
    const B = o.beats;
    if (!w || !B) return null;
    const id = o.id || w.dataset.panel || w.id, alt = o.alt || [];
    const items = [...w.querySelectorAll('.mt-i')], list = w.querySelector('.mt');
    const els = [...w.querySelectorAll('[data-k],[data-x]')];
    const shots = els.filter(e => e.matches(o.oneShots || ONE_SHOTS));
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const stepDur = s => B.filter(b => b.s === s).reduce((a, b) => a + b.d, 0);
    const first = s => B.findIndex(b => b.s === s);
    let held = null, hold = false, freeze = null;
    let i = 0, timer = 0, left = 0, t0 = 0, paused = still.matches, seen = false, hover = false;
    const running = () => !paused && seen && !hover && !hold;
    const light = on => {
      const again = shots.filter(e => on.has(e.dataset.x) && e.classList.contains('lit'));
      again.forEach(e => e.classList.remove('lit'));
      if (again.length) void w.getBoundingClientRect();
      for (const e of els) e.classList.toggle(e.classList.contains('lg') ? 'on' : 'lit', on.has(e.dataset.k || e.dataset.x));
    };
    const show = n => {
      i = n; const b = B[i], on = new Set(b.on);
      light(on);
      const into = B.slice(first(b.s), i).reduce((a, x) => a + x.d, 0);
      items.forEach((it, j) => {
        const s = j + 1;
        it.toggleAttribute('data-past', s < b.s);
        for (const [as, k, tone] of alt) if (as === s) {
          it.dataset.tone0 ??= it.dataset.tone;
          it.dataset.tone = on.has(k) ? tone : it.dataset.tone0;
        }
        if (s === b.s) it.setAttribute('aria-current', 'step'); else it.removeAttribute('aria-current');
        const bar = it.querySelector('.mt-bar i');
        bar.style.animation = 'none'; void bar.offsetWidth;
        bar.style.animation = s === b.s ? `mtfill ${stepDur(s)}ms linear -${into}ms forwards` : '';
        bar.style.animationPlayState = running() ? 'running' : 'paused';
      });
      left = b.d;
    };
    const stop = () => { if (timer) { clearTimeout(timer); timer = 0; left = Math.max(0, left - (performance.now() - t0)); } };
    const run = () => {
      stop();
      const go = running();
      w.querySelectorAll('.mt-bar i').forEach(b => b.style.animationPlayState = go ? 'running' : 'paused');
      w.classList.toggle('mt-frozen', !hold && (paused || !seen)); // a pause freezes the motion too
      if (!go) return;
      t0 = performance.now();
      timer = setTimeout(() => { timer = 0; show((i + 1) % B.length); run(); }, left);
    };
    // phones: every caption opens to the height of the longest one at this width
    const capH = () => list && list.style.setProperty('--capH', Math.max(...[...w.querySelectorAll('.mt-ci')].map(c => c.scrollHeight)) + 'px');
    capH(); addEventListener('resize', capH); document.fonts && document.fonts.ready.then(capH);

    show(paused ? B.length - 1 : 0);
    items.forEach(it => it.addEventListener('click', () => { stop(); show(first(+it.dataset.step)); run(); }));
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; run(); }, { threshold: 0.25 }).observe(w.querySelector('.mt-w') || w);
    run();
    // the handle: a hover elsewhere on the page can hold the cycle and light parts (set hover, run, light; then
    // clear hover, stop, show(i), run)
    return { show, run, stop, light, get i() { return i; }, get hover() { return hover; }, set hover(v) { hover = v; } };
  }
  window.PanelPlayer = PanelPlayer;
  const start = () => document.querySelectorAll('[data-panel]').forEach(el => {
    const c = (window.PANELS || {})[el.dataset.panel];
    if (c && !el.panelPlayer) el.panelPlayer = PanelPlayer(el, { id: el.dataset.panel, ...c });
  });
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start); else start();
})();
