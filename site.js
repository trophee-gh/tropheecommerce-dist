// 01 · Method: the panel player (panel/player.js) runs the beats (window.MBEATS from the build: {s: step, d: ms, on: [keys]}).
(() => {
  const w = document.querySelector('#how'), B = window.MBEATS;
  if (!w || !B || !window.PanelPlayer) return;
  const M = PanelPlayer(w, { id: 'method', beats: B, alt: [[2, 'c3r', 'bad']] });
  const { run, stop, show, light } = M;
  // a case card lights its part of the panel while hovered: judgement → the V key, partner → the agents on the copy,
  // bespoke → the store shipping
  const lights = { judgement: ['v'], partner: ['sscr', 'work'], bespoke: ['live', 'grow', 'Lnew'] };
  document.querySelectorAll('.cart[data-lights]').forEach(c => {
    const k = lights[(c.querySelector('.cart-l .lbl') || {}).textContent?.trim().toLowerCase()]; if (!k) return;
    c.addEventListener('pointerenter', () => { M.hover = true; run(); light(new Set(k)); });
    c.addEventListener('pointerleave', () => { M.hover = false; stop(); show(M.i); run(); });
  });
})();
// 04 · Working together: the timeline's LEDs light in turn once, when the timeline comes into view (not on load); off
// screen the sequence holds. Without JS, and with reduced motion, they show lit, static (sections/working/w.css).
(() => {
  const s = document.querySelector('#working'), line = s && s.querySelector('.wc-line');
  if (!line || !window.IntersectionObserver || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  s.classList.add('wc-js');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && e.intersectionRatio >= .6) s.classList.add('wc-go');
    s.classList.toggle('wc-off', !e.isIntersecting);
  }, { threshold: [0, .6] }).observe(line);
})();
// the badge tilts with the pointer over the hero; reduced motion keeps it still
(() => {
  const card = document.querySelector('[data-tilt]'); if (!card) return;
  const hero = card.closest('.hero'); const still = matchMedia('(prefers-reduced-motion: reduce)');
  // grab (Virgil 10-15): dragging the card rotates it further; on release it springs back to rest
  let grab = null;
  const rest = () => { card.classList.remove('live', 'grab'); card.style.removeProperty('--ry'); card.style.removeProperty('--rx'); };
  card.addEventListener('pointerdown', (e) => {
    if (still.matches || e.pointerType === 'touch') return;
    e.preventDefault();
    const cs = getComputedStyle(card);
    grab = { x: e.clientX, y: e.clientY, ry: parseFloat(cs.getPropertyValue('--ry')) || -12, rx: parseFloat(cs.getPropertyValue('--rx')) || 4 };
    card.setPointerCapture(e.pointerId); card.classList.add('grab');
  });
  card.addEventListener('pointermove', (e) => {
    if (!grab) return;
    const ry = Math.max(-55, Math.min(55, grab.ry + (e.clientX - grab.x) * 0.35));
    const rx = Math.max(-40, Math.min(40, grab.rx - (e.clientY - grab.y) * 0.35));
    card.style.setProperty('--ry', `${ry.toFixed(2)}deg`); card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
  });
  const drop = () => { if (!grab) return; grab = null; rest(); };
  card.addEventListener('pointerup', drop); card.addEventListener('pointercancel', drop);
  hero.addEventListener('pointermove', (e) => {
    if (still.matches || e.pointerType !== 'mouse' || grab) return;
    const r = card.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 1.5)));
    const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 1.5)));
    card.classList.add('live'); card.style.setProperty('--ry', `${(-12 + x * 14).toFixed(2)}deg`); card.style.setProperty('--rx', `${(4 - y * 10).toFixed(2)}deg`);
  });
  hero.addEventListener('pointerleave', () => { if (!grab) rest(); });
})();
