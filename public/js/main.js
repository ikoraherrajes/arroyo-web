/* ===== Arroyo Suite House — interacciones ===== */
(function () {
  'use strict';

  // ---- Galería curada (stem de archivo + clase de grilla opcional) ----
  var PHOTOS = [
    { f: 'arroyo-pileta-solarium', c: 'wide', a: 'Pileta y solárium con agua celeste' },
    { f: 'arroyo-pileta-suite', c: 'tall', a: 'La pileta con vista a la suite' },
    { f: 'e8ef7d_219d386e377e4600bba8bfea6cc7797b', a: 'Deck privado al atardecer' },
    { f: 'e8ef7d_af95c67ebf3b43d5af3b94ad72bf69b1', a: 'Baño de la suite' },
    { f: 'e8ef7d_56cabe4a45204e1eae80ba4b06e32a86', a: 'Kitchenette equipada' },
    { f: 'arroyo-bienvenidos', c: 'tall', a: 'Bienvenidos a Arroyo Suite House' },
    { f: 'e8ef7d_a4dc9979fbfd43dea928bb7726549a11', a: 'Dormitorio' },
    { f: 'e8ef7d_5af4ffde1e5c462cbc863bcb72eff92a', a: 'Suite preparada' },
    { f: 'e8ef7d_c89588c2eaa54c75957b82b3ca10f21c', a: 'Dormitorio' },
    { f: 'arroyo-rio-sierras', c: 'tall', a: 'El Río Los Sauces y las sierras de Traslasierra' },
    { f: 'e8ef7d_e7e52ebf71ae445ca300b50e035621e5_d_4928_3264_s_4_2', a: 'Paisaje al amanecer' }
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

  // ---- Videos aéreos: cargar y reproducir solo cuando se ven (ahorra datos) ----
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting) {
        if (!v.src && v.dataset.src) v.src = v.dataset.src;
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('video[data-src]').forEach(function (v) { vio.observe(v); });

  // ---- Slideshow de exteriores (crossfade automático) ----
  var ss = document.getElementById('expSlideshow');
  if (ss) {
    var slides = ss.querySelectorAll('.slide'), si = 0;
    if (slides.length > 1) {
      setInterval(function () {
        slides[si].classList.remove('is-active');
        si = (si + 1) % slides.length;
        slides[si].classList.add('is-active');
      }, 4500);
    }
  }

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
