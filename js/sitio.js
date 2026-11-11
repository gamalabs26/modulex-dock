/* ModuleX Dock — motor de scroll y puntero. Vanilla, sin librerías.
   html.js = hay JS · html.mov = hay JS y no se pidió movimiento reducido · html.fino = mouse.
   Sin .mov no hay pins: el sitio se lee como una página normal. */
(() => {
const D = document, R = D.documentElement;
const mov = R.classList.contains('mov'), fino = R.classList.contains('fino');
const $ = (s, c = D) => c.querySelector(s), $$ = (s, c = D) => [...c.querySelectorAll(s)];
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => cl((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => 1 - Math.pow(1 - t, 3);
const suave = t => t * t * (3 - 2 * t);
let vh = innerHeight, vw = innerWidth;

/* ---- pins: la escena se pega al techo mientras su sección se recorre ---- */
if (mov) $$('.pin>.stage').forEach(st => { st.style.cssText = 'position: sticky; top: 0'; });
const prog = el => { const r = el.getBoundingClientRect(); return cl(-r.top / Math.max(1, r.height - vh)); };

/* ---- 02 PIEZAS · pinned-saga: la pieza muta por capítulos ligados al scroll ----
   Cada capítulo se detiene un momento en el centro (meseta) antes de girar al siguiente. */
const saga = $('#piezas'), caps = $$('.cap', saga);
function fSaga() {
  const r = saga.getBoundingClientRect(), p = cl(-r.top / Math.max(1, r.height - vh));
  const raw = p * (caps.length - 1), k = Math.min(Math.floor(raw), caps.length - 2);
  const f = k + suave(seg(raw - k, .22, .78));
  caps.forEach((cap, i) => {
    const d = i - f, a = Math.abs(d);
    cap.style.transform = `translate3d(${(d * 56).toFixed(2)}%,0,0) rotateY(${(-d * 34).toFixed(2)}deg) scale(${(1 - Math.min(a, 1.5) * .12).toFixed(3)})`;
    cap.style.opacity = cl(1 - a * 1.15).toFixed(3);
    cap.style.zIndex = 10 - Math.round(a);
  });
}

/* ---- 05 OBRAS · train-doors + curtain-palette-swap ----
   Cuatro puertas triangulares cuyas costuras forman una X se abren con el scroll (scrub);
   detrás ya cambió la paleta a laguna. Luego la galería corre en horizontal. */
const obras = $('#obras'), pista = $('.pista', obras), cortina = $('.cortina', obras), puertas = $$('i', cortina);
let recorrido = 0, abiertas = 1;
function medirObras() {
  if (!mov) return;
  recorrido = Math.max(0, pista.scrollWidth - vw);
  obras.style.setProperty('--h', Math.round(vh * 1.7 + recorrido) + 'px');
}
function fObras() {
  const px = prog(obras) * (vh * .7 + recorrido);
  const scrub = ease(cl(px / (vh * .6)));
  abiertas = scrub;
  const m = (scrub * 101).toFixed(2);
  puertas[0].style.transform = `translate3d(0,-${m}%,0)`;
  puertas[1].style.transform = `translateX(${m}%)`;
  puertas[2].style.transform = `translate3d(0,${m}%,0)`;
  puertas[3].style.transform = `translateX(-${m}%)`;
  cortina.style.setProperty('--costura', cl(1 - scrub * 2.5).toFixed(3));
  const tx = cl((px - vh * .7) / Math.max(1, recorrido)) * recorrido;
  pista.style.transform = `translate3d(${(-tx).toFixed(1)}px,0,0)`;
}
// teclado: Tab dentro de la galería lleva el scroll a la tarjeta; las flechas avanzan
pista.addEventListener('focusin', e => {
  if (!mov) return;
  const el = e.target.closest('.obra') || e.target;
  const tx = cl(el.offsetLeft - vw * .1, 0, recorrido);
  scrollTo({ top: obras.offsetTop + vh * .7 + tx, behavior: 'instant' });
});
pista.addEventListener('keydown', e => {
  const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!d || !mov) return;
  e.preventDefault(); scrollBy({ top: d * Math.round(vw * .4) });
});

/* ---- paleta por capítulo: la sección que cruza la mitad de la pantalla manda ---- */
const secs = $$('main>section');
const temas = { tinta: ['--tinta', '--concreto', '--agua'], concreto: ['--concreto', '--tinta', '--laguna'], laguna: ['--laguna', '--concreto', '--agua'] };
let temaActual = '';
function fTema() {
  let t = 'tinta';
  for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top <= vh * .5 && r.bottom > vh * .5) { t = s.dataset.tema; break; } }
  if (t === 'laguna' && mov && abiertas < .5) t = 'tinta'; // con las puertas cerradas, la paleta sigue siendo la de afuera
  if (t === temaActual) return;
  temaActual = t;
  const [bg, fg, ac] = temas[t];
  R.style.setProperty('--bg', `var(${bg})`); R.style.setProperty('--fg', `var(${fg})`); R.style.setProperty('--acento', `var(${ac})`);
}

/* ---- 06 FICHA · parallax-layers: foto, X y rótulo a tres profundidades (data-depth:
   0.2 lejos, se queda atrás · 0.9 cerca, corre contra el scroll) ---- */
const pars = $$('[data-depth]');
function fPar() {
  pars.forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const c = r.top + r.height / 2 - vh / 2;
    el.style.transform = `translate3d(0,${(c * (.45 - parseFloat(el.dataset.depth)) * .5).toFixed(1)}px,0)`;
  });
}

/* ---- 06 FICHA · char-reveal-scroll: el manifiesto se enciende letra por letra ---- */
const man = $('[data-letras]'); const letras = [];
if (man && mov) {
  const txt = man.textContent.trim(); man.textContent = '';
  const sr = D.createElement('span'); sr.className = 'sr'; sr.textContent = txt;
  const vis = D.createElement('span'); vis.setAttribute('aria-hidden', 'true');
  txt.split(/(\s+)/).forEach(w => {
    if (/^\s+$/.test(w)) { vis.append(' '); return; }
    const pal = D.createElement('span'); pal.style.display = 'inline-block';
    [...w].forEach(ch => { const l = D.createElement('span'); l.className = 'l'; l.textContent = ch; pal.append(l); letras.push(l); });
    vis.append(pal);
  });
  man.append(sr, vis);
}
function fLetras() {
  const r = man.getBoundingClientRect(), n = letras.length;
  const p = cl((vh * .88 - r.top) / (vh * .62));
  letras.forEach((l, i) => { l.style.opacity = (.14 + .86 * cl((p * (n + 10) - i) / 10)).toFixed(2); });
}

/* ---- 01 HERO: el video de las uniones se cierra en una X al salir ---- */
const hero = $('#inicio'), hv = $('.hero-vid'), hc = $('.hero-copy'), htag = $('.hero .tag');
function fHero() {
  const p = prog(hero), t = ease(seg(p, .05, .9));
  const big = Math.max(vw, vh) * 6, small = Math.min(vw, vh) * .3;
  hv.classList.toggle('abierto', p <= .05);
  hv.style.setProperty('--xs', (big * Math.pow(small / big, t)).toFixed(1) + 'px');
  hv.style.transform = `rotate(${(t * 90).toFixed(2)}deg) scale(${(1 + t * .1).toFixed(3)})`;
  const c = seg(p, 0, .3);
  hc.style.opacity = (1 - c).toFixed(3); hc.style.transform = `translate3d(0,${(-c * 70).toFixed(1)}px,0)`;
  hc.style.pointerEvents = c > .9 ? 'none' : '';
  htag.style.opacity = (.8 * (1 - c)).toFixed(3);
}

/* ---- 03 CONFIGURA (momento distintivo): 64 módulos sueltos se unen en X,
   forman una cruz y la cruz se abre al agua ---- */
const malla = $('#configura'), mStage = $('.stage', malla), grid = $('.grid', malla), lag = $('.laguna', malla);
const mTxt = $('.malla-txt', malla), pasos = $$('.pasos li', malla), celdas = [], nudos = [];
if (mov) {
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; // desorden con semilla: siempre el mismo
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const el = D.createElement('i'), cruz = r === 3 || r === 4 || c === 3 || c === 4;
    el.className = 'celda' + (cruz ? ' c' : ''); grid.append(el);
    const ang = rnd() * Math.PI * 2, dist = 160 + rnd() * 360;
    celdas.push({ el, cruz, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist, rot: (rnd() - .5) * 80, del: rnd() * .35 });
  }
  /* Los módulos se unen por el CENTRO de cada lado compartido (ahí va la X), nunca por las esquinas */
  const ok = (r, c) => r === 3 || r === 4 || c === 3 || c === 4, put = (x, y) => {
    const n = D.createElement('b'); n.className = 'nudo'; n.style.left = x + '%'; n.style.top = y + '%';
    grid.append(n); nudos.push({ el: n, d: (Math.abs(x - 50) + Math.abs(y - 50)) / 44 });
  };
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (ok(r, c)) {
    if (c < 7 && ok(r, c + 1)) put((c + 1) * 12.5, (r + .5) * 12.5);
    if (r < 7 && ok(r + 1, c)) put((c + .5) * 12.5, (r + 1) * 12.5);
  }
}
function fMalla() {
  const p = prog(malla);
  const a = seg(p, 0, .38), b = seg(p, .38, .55), c = seg(p, .55, .72), e = seg(p, .74, 1);
  celdas.forEach(o => {
    const t = ease(seg(a, o.del, o.del + .65)), k = 1 - t;
    o.el.style.transform = `translate3d(${(o.dx * k).toFixed(1)}%,${(o.dy * k).toFixed(1)}%,0) rotate(${(o.rot * k).toFixed(1)}deg)`;
    o.el.style.opacity = ((.15 + .85 * t) * (o.cruz ? 1 : 1 - c * .9) * (1 - e)).toFixed(3);
  });
  nudos.forEach(o => {
    const t = ease(seg(b, o.d * .5, o.d * .5 + .5));
    o.el.style.opacity = (t * (1 - e)).toFixed(3);
    o.el.style.transform = `scale(${(.4 + .6 * t).toFixed(3)}) rotate(${((1 - t) * -90).toFixed(1)}deg)`;
  });
  const g = grid.getBoundingClientRect(), st = mStage.getBoundingClientRect();
  const cs = g.width * Math.pow(30, ease(e));
  lag.style.opacity = e > 0 ? 1 : 0;
  lag.style.setProperty('--cs', cs.toFixed(1) + 'px');
  lag.style.setProperty('--mpx', (g.left - st.left + g.width / 2 - cs / 2).toFixed(1) + 'px');
  lag.style.setProperty('--mpy', (g.top - st.top + g.height / 2 - cs / 2).toFixed(1) + 'px');
  mTxt.style.opacity = (1 - seg(e, 0, .3)).toFixed(3);
  const paso = p < .38 ? 0 : p < .55 ? 1 : p < .74 ? 2 : 3;
  pasos.forEach((li, i) => li.classList.toggle('on', i === paso));
}

/* ---- rail de capítulos y barra de progreso ---- */
const rail = $$('.rail a'), barra = $('.barra'), fab = $('.fab'), cotiza = $('#cotiza');
function fRail() {
  barra.style.transform = `scaleX(${cl(scrollY / Math.max(1, R.scrollHeight - vh)).toFixed(4)})`;
  let k = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= vh * .5) k = i; });
  rail.forEach((a, i) => i === k ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current'));
  if (fab) fab.classList.toggle('fuera', scrollY < vh * .5 || cotiza.getBoundingClientRect().top < vh * .9);
}

/* ---- video-loop-seamless: loopSuave salta al inicio antes del último cuadro
   (sinCostura) para que el loop no parpadee; fuera de pantalla, el video se pausa ---- */
const vids = $$('video.loopSuave');
const sinCostura = v => { if (!v.paused && v.duration && v.currentTime > v.duration - .06) v.currentTime = .001; };
const ioV = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting) {
    if (mov) v.play().catch(() => {});
  } else v.pause();
}), { rootMargin: '200px 0px' });
vids.forEach(v => { if (!mov) { v.removeAttribute('autoplay'); v.pause(); } ioV.observe(v); });

/* ---- cursor-follow: una X que sigue al mouse con retraso (lerp) ---- */
const cur = $('.cursor'); let mx = -99, my = -99, cx = -99, cy = -99, sobre = false;
if (fino && mov) addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.classList.add('vivo'); }, { passive: true });
function fCursor() {
  cx = lerp(cx, mx, .22); cy = lerp(cy, my, .22);
  cur.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0) scale(${sobre ? 1.6 : 1})`;
}
if (fino && mov) {
  D.addEventListener('mouseover', e => { sobre = !!e.target.closest('a,button,input,label'); });
  R.addEventListener('mouseleave', () => cur.classList.remove('vivo'));
}

/* ---- 04 SE ARMA · spotlight: el puntero (o el dedo) abre un círculo al muelle terminado;
   el control deslizante hace un barrido para teclado y para quien no puede arrastrar ---- */
const foco = $('.foco'), agua = $('.foco-agua'), rango = $('.foco-ctl input');
let fx = 0, fy = 0, fr = 0, fxT = 0, fyT = 0, frT = 0;
const mover = e => {
  const r = agua.getBoundingClientRect();
  fxT = e.clientX - r.left; fyT = e.clientY - r.top;
  frT = Math.min(r.width, r.height) * (e.pointerType === 'touch' ? .3 : .24);
  if (fr < 2) { fx = fxT; fy = fyT; }
};
foco.addEventListener('pointermove', mover);
foco.addEventListener('pointerdown', mover);
['pointerleave', 'pointercancel'].forEach(t => foco.addEventListener(t, () => { frT = 0; }));
foco.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') frT = 0; });
rango.addEventListener('input', () => agua.style.setProperty('--b', rango.value + '%'));
function fFoco() {
  const k = mov ? .2 : 1;
  fx = lerp(fx, fxT, k); fy = lerp(fy, fyT, k); fr = lerp(fr, frT, mov ? .14 : 1);
  agua.style.setProperty('--mx', fx.toFixed(1) + 'px'); agua.style.setProperty('--my', fy.toFixed(1) + 'px');
  agua.style.setProperty('--r', fr.toFixed(1) + 'px');
}

/* ---- magnetic: los CTA se inclinan hacia el puntero (solo mouse) ---- */
if (fino && mov) $$('.magnetic').forEach(b => {
  b.addEventListener('pointermove', e => {
    const r = b.getBoundingClientRect();
    b.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * .28).toFixed(1) + 'px');
    b.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * .38).toFixed(1) + 'px');
  });
  b.addEventListener('pointerleave', () => { b.style.setProperty('--tx', '0px'); b.style.setProperty('--ty', '0px'); });
});

/* ---- revelados de títulos ---- */
if (mov) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rv').forEach(el => io.observe(el));
}

/* ---- formulario honesto: arma el mensaje y abre WhatsApp o el correo; no guarda nada ---- */
const form = $('#cot'), aviso = $('.aviso', form);
form.addEventListener('submit', e => {
  e.preventDefault();
  const via = e.submitter && e.submitter.value === 'mail' ? 'mail' : 'wa';
  const val = n => (form.elements[n].value || '').trim();
  const nombre = val('nombre'), lugar = val('lugar'), medida = val('medida');
  const faltan = ['nombre', 'lugar'].filter(n => { const ok = !!val(n); form.elements[n].setAttribute('aria-invalid', ok ? 'false' : 'true'); return !ok; });
  if (faltan.length) { aviso.textContent = 'Falta tu nombre o dónde va el muelle.'; form.elements[faltan[0]].focus(); return; }
  const msg = `Hola, soy ${nombre}. Quiero cotizar un muelle ModuleX para ${lugar}.` + (medida ? ` Medida aproximada: ${medida}.` : '');
  if (via === 'mail') {
    aviso.textContent = 'Abriendo tu correo con el mensaje listo…';
    location.href = 'mailto:contacto@mayanseas.com?subject=' + encodeURIComponent('Cotización de muelle ModuleX') + '&body=' + encodeURIComponent(msg);
  } else {
    aviso.textContent = 'Abriendo WhatsApp con el mensaje listo…';
    open('https://wa.me/524421247481?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }
});

/* ---- bucle: el scroll pide un cuadro; el puntero, el foco y los videos corren cada cuadro ---- */
let pend = false;
function cuadro() {
  pend = false;
  fTema(); fRail();
  if (mov) { fHero(); fSaga(); fMalla(); fObras(); fPar(); if (man) fLetras(); }
}
const pedir = () => { if (!pend) { pend = true; requestAnimationFrame(cuadro); } };
function tic() {
  vids.forEach(sinCostura);
  if (fino && mov) fCursor();
  fFoco();
  requestAnimationFrame(tic);
}
addEventListener('scroll', pedir, { passive: true });
addEventListener('resize', () => { vh = innerHeight; vw = innerWidth; medirObras(); pedir(); });
addEventListener('load', () => { medirObras(); pedir(); });
medirObras(); cuadro(); requestAnimationFrame(tic);
})();
