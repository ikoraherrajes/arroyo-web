/* ===== Arroyo Suite House — interacciones ===== */
(function () {
  'use strict';

  // ---- Galería curada (stem de archivo + clase de grilla opcional) ----
  var PHOTOS = [
    { f: 'e8ef7d_00caa26d94aa4844b218d52932a98368', c: 'wide', a: 'Suite al atardecer' },
    { f: 'e8ef7d_3d9b89a618ba47128116596cc4012558', c: 'tall', a: 'Dormitorio King' },
    { f: 'e8ef7d_588c6182f7244713a9d47ffd9c016307_d_3000_1987_s_2', a: 'Pileta y solárium' },
    { f: 'e8ef7d_219d386e377e4600bba8bfea6cc7797b', a: 'Deck privado al atardecer' },
    { f: 'e8ef7d_1dc827110fd845e28948cd55bedd82c7', a: 'Suite con vista a la sierra' },
    { f: 'e8ef7d_5137fee698204dd59bda0ffe79e30dc6_d_3000_2250_s_2', c: 'tall', a: 'Vista aérea del predio' },
    { f: 'e8ef7d_af95c67ebf3b43d5af3b94ad72bf69b1', a: 'Baño de la suite' },
    { f: 'e8ef7d_4c7e7999f10344a496f166a2f59e0861_d_4928_3264_s_4_2', c: 'wide', a: 'Atardecer serrano' },
    { f: 'e8ef7d_56cabe4a45204e1eae80ba4b06e32a86', a: 'Kitchenette equipada' },
    { f: 'e8ef7d_a4dc9979fbfd43dea928bb7726549a11', a: 'Dormitorio' },
    { f: 'e8ef7d_5af4ffde1e5c462cbc863bcb72eff92a', a: 'Suite preparada' },
    { f: 'e8ef7d_35a31051ec5e4d10b3f63ae49ddd2873', c: 'tall', a: 'Las sierras' },
    { f: 'e8ef7d_fd52004d01f046cdbbd823a2ecfc6da1_d_3000_1987_s_2', c: 'wide', a: 'Pileta con vista al valle' },
    { f: 'e8ef7d_908ad1448b3f49cba612ac731dd2e2e8', a: 'Exterior de la suite' },
    { f: 'e8ef7d_c89588c2eaa54c75957b82b3ca10f21c', a: 'Dormitorio' },
    { f: 'e8ef7d_e7e52ebf71ae445ca300b50e035621e5_d_4928_3264_s_4_2', a: 'Paisaje al amanecer' },
    { f: 'e8ef7d_fd7fbe17a9fc4c34bd364b8332fc6c5c_d_3000_2250_s_2', c: 'tall', a: 'Vista aérea' },
    { f: 'e8ef7d_e343dc6240db435aa52365bb2400c1df', a: 'Living de la suite' }
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

  // ---- Año footer ----
  document.getElementById('year').textContent = new Date().getFullYear();
})();
