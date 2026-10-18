// 03 · The system: the player (as the method's, src/site.js). Three beats, one per verb: a beat lights keys ([data-k]
// parts fade in, [data-x] parts get .lit and move, legends with data-k get .on, names with data-c get .lit).
// The heading's verbs are the timeline: the current one in its colour with a bar filling over its step; a click replays
// that step from its start and the cycle goes on. No pause key: off screen the cycle waits and the motion holds;
// reduced motion shows the last step, static (no cycling; a verb click still shows its step).
(() => {
  const w = document.querySelector('#guarantee'), C = ['c1', 'c2', 'c3', 'c4'], B = [
    { s: 1, d: 3000, on: ['work', 'r1'] },
    { s: 2, d: 3000, on: [...C, 'r2'] },
    { s: 3, d: 4600, on: [...C, 'v', 'r3'] },
  ];
  if (!w) return;
  const verbs = [...w.querySelectorAll('.gv')];
  const els = [...w.querySelectorAll('[data-k],[data-x],[data-c]')];
  const shots = els.filter(e => e.matches('.mp-1s'));
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let hold = false;
  let i = 0, timer = 0, left = 0, t0 = 0, paused = still.matches, seen = false;
  const running = () => !paused && seen && !hold;
  const light = on => {
    shots.filter(e => on.has(e.dataset.x) && e.classList.contains('lit')).forEach(e => { e.classList.remove('lit'); void e.getBoundingClientRect(); });
    for (const e of els) {
      const k = e.dataset.k || e.dataset.x || e.dataset.c;
      e.classList.toggle(e.dataset.k && e.classList.contains('lg') ? 'on' : 'lit', on.has(k));
    }
  };
  const show = n => {
    i = n; const b = B[i];
    w.dataset.gs = b.s; // the step, for motions that belong to it only (the checks run in step 2)
    light(new Set(b.on));
    verbs.forEach((v, j) => {
      const s = j + 1;
      v.toggleAttribute('data-past', s < b.s);
      if (s === b.s) v.setAttribute('aria-current', 'step'); else v.removeAttribute('aria-current');
      const bar = v.querySelector('.gv-bar i');
      bar.style.animation = 'none'; void bar.offsetWidth;
      bar.style.animation = s === b.s ? `gvfill ${b.d}ms linear forwards` : '';
      bar.style.animationPlayState = running() ? 'running' : 'paused';
      bar.style.transform = s === b.s && (paused || hold) ? 'none' : '';
    });
    left = b.d;
  };
  // a click replays its step: every part goes out at once (no fade), then the step lights from its start
  const replay = n => { w.classList.add('gp-cut'); light(new Set()); void w.offsetWidth; w.classList.remove('gp-cut'); show(n); };
  const stop = () => { if (timer) { clearTimeout(timer); timer = 0; left = Math.max(0, left - (performance.now() - t0)); } };
  const run = () => {
    stop();
    const go = running();
    verbs.forEach(v => v.querySelector('.gv-bar i').style.animationPlayState = go ? 'running' : 'paused');
    w.classList.toggle('gp-frozen', !hold && (paused || !seen));
    if (!go) return;
    t0 = performance.now();
    timer = setTimeout(() => { timer = 0; show((i + 1) % B.length); run(); }, left);
  };
  show(paused ? B.length - 1 : 0);
  verbs.forEach(v => v.addEventListener('click', () => { stop(); replay(+v.dataset.step - 1); run(); }));
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; run(); }, { threshold: 0.25 }).observe(w.querySelector('.gp-w'));
  run();
})();
