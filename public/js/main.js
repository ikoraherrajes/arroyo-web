/* ===== Arroyo Suite House — interacciones ===== */
(function () {
  'use strict';

  // ---- Galería curada (stem de archivo + clase de grilla opcional) ----
  var PHOTOS = [
    { f: 'gal-ext-01', a: 'Frente de la suite con deck y sombrilla' },
    { f: 'gal-pileta-04', a: 'Pileta con pérgola y las sierras de fondo' },
    { f: 'gal-dorm-02', a: 'Dormitorio cálido para parejas' },
    { f: 'gal-deck-01', a: 'Deck con vista a la pileta y las sierras' },
    { f: 'gal-ext-05', a: 'Las suites con sus decks privados' },
    { f: 'gal-dorm-04', a: 'Suite con cabecera y pared de color' },
    { f: 'gal-pileta-01', a: 'Pileta y reposeras' },
    { f: 'gal-ext-03', a: 'La suite al amanecer' },
    { f: 'gal-dorm-05', a: 'Dormitorio con Smart TV y estar' },
    { f: 'gal-deck-02', a: 'Deck con vista a la pileta y el valle' },
    { f: 'gal-pileta-03', a: 'Pileta con vista al valle' },
    { f: 'gal-ext-04', a: 'El predio entre los árboles' },
    { f: 'gal-dorm-06', a: 'Suite luminosa con cama King' },
    { f: 'gal-pileta-06', a: 'La pileta y el solárium del predio' },
    { f: 'gal-ext-06', a: 'Exterior de la suite y el jardín' },
    { f: 'gal-dorm-07', a: 'Dormitorio con cortinados y climatización' }
  ];

  var grid = document.getElementById('grid');
  PHOTOS.forEach(function (p, i) {
    var fig = document.createElement('figure');
    if (p.c) fig.className = p.c;
    fig.dataset.i = i;
    var img = document.createElement('img');
    img.src = 'assets/thumb/' + p.f + '.jpg';
    img.alt = p.a;
    img.loading = 'lazy';
    fig.appendChild(img);
    var cap = document.createElement('figcaption');
    cap.textContent = p.a;
    fig.appendChild(cap);
    grid.appendChild(fig);
  });

  // ---- Lightbox ----
  var lb = document.getElementById('lb'),
    lbImg = document.getElementById('lbImg'),
    cur = 0;

  function show(i) {
    cur = (i + PHOTOS.length) % PHOTOS.length;
    lbImg.src = 'assets/web/' + PHOTOS[cur].f + '.jpg';
    lbImg.alt = PHOTOS[cur].a;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
  }
  function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); }

  grid.addEventListener('click', function (e) {
    var fig = e.target.closest('figure');
    if (fig) show(+fig.dataset.i);
  });
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbNext').addEventListener('click', function () { show(cur + 1); });
  document.getElementById('lbPrev').addEventListener('click', function () { show(cur - 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });

  // ---- Nav: scroll state + burger ----
  var nav = document.getElementById('nav'),
    burger = document.getElementById('burger'),
    links = document.getElementById('navLinks');

  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 60); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger.addEventListener('click', function () { links.classList.toggle('open'); });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') links.classList.remove('open');
  });
  var navClose = document.getElementById('navClose');
  if (navClose) navClose.addEventListener('click', function () { links.classList.remove('open'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') links.classList.remove('open');
  });

  // ---- Reveal on scroll ----
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // ---- Parallax suave en imagen de experiencia ----
  var px = document.querySelector('[data-parallax] img');
  if (px && matchMedia('(min-width:901px)').matches) {
    window.addEventListener('scroll', function () {
      var r = px.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        var off = (r.top - innerHeight / 2) * -0.06;
        px.style.transform = 'translateY(' + off + 'px) scale(1.08)';
      }
    }, { passive: true });
  }

  // ---- Videos: autoplay nativo + reproducir/pausar según visibilidad (robusto en mobile) ----
  var bandVideos = document.querySelectorAll('section.video video');
  function ensurePlay(v) {
    v.muted = true; v.playsInline = true; v.setAttribute('muted', '');   // iOS exige muted real
    if (!v.currentSrc && !v.src && v.dataset.src) {                      // lazy: asignar fuente
      v.src = v.dataset.src;
      v.load();
      v.addEventListener('canplay', function () { var q = v.play(); if (q && q.catch) q.catch(function () {}); }, { once: true });
    }
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting) ensurePlay(v);
      else if (!v.paused) v.pause();
    });
  }, { threshold: 0.25 });
  bandVideos.forEach(function (v) { v.muted = true; v.playsInline = true; vio.observe(v); });

  // Fallback: si el navegador bloquea el autoplay sin interacción, reintentar al primer toque
  function kickVideos() {
    bandVideos.forEach(function (v) {
      var r = v.getBoundingClientRect();
      if (v.paused && r.bottom > 0 && r.top < innerHeight) ensurePlay(v);
    });
  }
  ['touchstart', 'pointerdown', 'click'].forEach(function (ev) {
    document.addEventListener(ev, kickVideos, { passive: true });
  });

  // ---- Slideshows con crossfade automático (exteriores + features) ----
  document.querySelectorAll('.slideshow').forEach(function (ss, k) {
    var slides = ss.querySelectorAll('.slide'), si = 0;
    if (slides.length < 2) return;
    if (!slides[0].classList.contains('is-active')) slides[0].classList.add('is-active');
    setInterval(function () {
      slides[si].classList.remove('is-active');
      si = (si + 1) % slides.length;
      slides[si].classList.add('is-active');
    }, 4500 + k * 700); // desfasar para que no cambien todas al mismo tiempo
  });

  // ---- Botón subir ----
  var toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Año footer ----
  document.getElementById('year').textContent = new Date().getFullYear();
})();
