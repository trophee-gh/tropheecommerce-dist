// iso-legend (pure-moose-h6b6, 10-15): labels as HTML over a drawing, so they keep the site's sizes
// (12 px mono at any width) instead of shrinking with the SVG.
// Markup: inside <figure class="lg-fig"> put the <svg>, and in it invisible anchors
//   <circle data-anchor="ops" cx="…" cy="…" r="0"/>
// then, in the figure, the labels:
//   <span class="lg" data-at="ops" data-side="n|s|e|w|ne|nw|se|sw" data-tone="go|sys|ink">OPERATOR</span>
// A label sits beside its anchor on the given side, with a short leader; tone colours it by the code
// (go = orange, Virgil's yes; sys = blue, the system answering; ink = work). Labels carrying data-on /
// data-lit follow iso-play's steps like the drawing's own groups (the script mirrors those classes).
(() => {
  const place = fig => {
    const svg = fig.querySelector('svg'); if (!svg) return;
    const fr = fig.getBoundingClientRect();
    for (const lg of fig.querySelectorAll('.lg[data-at]')) {
      const a = svg.querySelector(`[data-anchor="${lg.dataset.at}"]`); if (!a) continue;
      const r = a.getBoundingClientRect();
      lg.style.left = (r.left + r.width / 2 - fr.left) + 'px';
      lg.style.top = (r.top + r.height / 2 - fr.top) + 'px';
    }
  };
  const all = () => document.querySelectorAll('.lg-fig').forEach(place);
  addEventListener('resize', all);
  addEventListener('load', all);
  document.fonts && document.fonts.ready.then(all);
  all();
  // mirror iso-play's step state onto HTML labels that carry data-on / data-lit
  document.querySelectorAll('.lg-fig').forEach(fig => {
    const sync = n => {
      fig.querySelectorAll('.lg[data-on]').forEach(l => l.classList.toggle('off', !l.dataset.on.split(/[\s,]+/).map(Number).includes(n)));
      fig.querySelectorAll('.lg[data-lit]').forEach(l => l.classList.toggle('lit', l.dataset.lit.split(/[\s,]+/).map(Number).includes(n)));
    };
    fig.addEventListener('isostep', e => sync(e.detail));
    if (fig.dataset.step) sync(+fig.dataset.step); // iso-play may have run first: apply its current step
  });
})();
