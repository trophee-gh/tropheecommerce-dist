// iso-play (pure-moose-h6b6, 10-15): steps an isometric scene through its story.
// A scene is <figure class="iso-fig" data-steps='[{"k":"ASK","t":"…"},…]'> holding <svg class="iso-art">.
// Inside the svg:
//   data-on="1 3"   shown only at those steps (1-based); others fade out
//   data-lit="2"    gets class "lit" at those steps (CSS shows its .lamp, runs its motion)
//   data-go="3"     a hotspot: click or tap jumps to that step
// The figure gets data-step="n" too, for CSS. Plays when in view, one step every 2.6 s; pauses on
// hover, focus or touch; a click on a dot, a hotspot or prev/next holds the step. Reduced motion:
// no autoplay, the final step shows, the controls still work. el.isoGo(n) lets other code drive it.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  for (const fig of document.querySelectorAll('.iso-fig[data-steps]')) {
    const steps = JSON.parse(fig.dataset.steps), n = steps.length;
    const svg = fig.querySelector('svg');
    const on = [...svg.querySelectorAll('[data-on]')].map(e => [e, e.dataset.on.split(/[\s,]+/).map(Number)]);
    const lit = [...svg.querySelectorAll('[data-lit]')].map(e => [e, e.dataset.lit.split(/[\s,]+/).map(Number)]);
    const bar = document.createElement('figcaption');
    bar.className = 'ip';
    bar.innerHTML = `<button type="button" class="ip-b" data-d="-1" aria-label="Previous step">‹</button>` +
      `<span class="ip-dots">${steps.map((s, i) => `<button type="button" class="ip-dot" data-i="${i + 1}" aria-label="Step ${i + 1}: ${s.k}"></button>`).join('')}</span>` +
      `<button type="button" class="ip-b" data-d="1" aria-label="Next step">›</button>` +
      `<span class="ip-t" aria-live="polite"><b class="ip-k"></b> <span class="ip-x"></span></span>`;
    fig.append(bar);
    let cur = 0, timer = null, held = false, hover = false, seen = false;
    const go = i => {
      cur = ((i - 1 + n) % n) + 1;
      fig.dataset.step = cur;
      for (const [e, s] of on) e.classList.toggle('off', !s.includes(cur));
      for (const [e, s] of lit) e.classList.toggle('lit', s.includes(cur));
      bar.querySelectorAll('.ip-dot').forEach((d, k) => d.setAttribute('aria-current', String(k + 1 === cur)));
      bar.querySelector('.ip-k').textContent = String(cur).padStart(2, '0') + ' ' + steps[cur - 1].k;
      bar.querySelector('.ip-x').textContent = steps[cur - 1].t;
      fig.dispatchEvent(new CustomEvent('isostep', { detail: cur }));
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const play = () => { stop(); if (!held && !hover && seen && !still.matches) timer = setInterval(() => go(cur + 1), 2600); };
    const hold = i => { held = true; stop(); go(i); };
    fig.isoGo = i => { go(i); };
    fig.isoHold = hold;
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      hold(b.dataset.i ? +b.dataset.i : cur + +b.dataset.d);
    });
    svg.querySelectorAll('[data-go]').forEach(h => {
      h.style.cursor = 'pointer';
      h.addEventListener('click', () => hold(+h.dataset.go));
    });
    fig.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; stop(); } });
    fig.addEventListener('pointerleave', () => { hover = false; play(); });
    fig.addEventListener('focusin', () => { hover = true; stop(); });
    fig.addEventListener('focusout', () => { hover = false; play(); });
    new IntersectionObserver(es => { seen = es[0].isIntersecting; seen ? play() : stop(); }, { threshold: .35 }).observe(fig);
    go(still.matches ? n : 1);
  }
})();
