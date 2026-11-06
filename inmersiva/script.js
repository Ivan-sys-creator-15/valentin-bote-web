/* =====================================================================
   Versión inmersiva · menú, carrusel y sistema de animación
   Sin librerías. Todo se desactiva con prefers-reduced-motion.
   ===================================================================== */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const html = document.documentElement;

  /* ---------- menú móvil ---------- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  let menuOpen = false;
  function setOpen(open) {
    menuOpen = open;
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  if (toggle && links) {
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 1120) setOpen(false); });
  }

  /* ---------- carrusel de testimonios ---------- */
  (function () {
    const carousel = document.getElementById('reviews');
    if (!carousel) return;
    const track = document.getElementById('reviewsTrack');
    const cards = Array.from(track.children);
    const prevBtn = carousel.querySelector('.carousel__arrow--prev');
    const nextBtn = carousel.querySelector('.carousel__arrow--next');
    const dotsWrap = document.getElementById('reviewsDots');
    const GAP = 26;
    let index = 0;
    function perView() { const w = window.innerWidth; if (w <= 620) return 1; if (w <= 980) return 2; return 3; }
    function maxIndex() { return Math.max(0, cards.length - perView()); }
    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIndex(); i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Ir a la reseña ' + (i + 1));
        b.addEventListener('click', () => { index = i; update(); });
        dotsWrap.appendChild(b);
      }
    }
    function update() {
      index = Math.max(0, Math.min(index, maxIndex()));
      const cardW = cards[0].getBoundingClientRect().width;
      track.style.transform = 'translateX(' + -(index * (cardW + GAP)) + 'px)';
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('is-active', i === index));
    }
    prevBtn.addEventListener('click', () => { index = index <= 0 ? maxIndex() : index - 1; update(); });
    nextBtn.addEventListener('click', () => { index = index >= maxIndex() ? 0 : index + 1; update(); });
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { buildDots(); update(); }, 150); });
    buildDots(); update();
  })();

  /* ---------- utilidades ---------- */
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Divide el texto en palabras enmascaradas, respetando <em> y demás etiquetas.
  function splitWords(el) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = p;
            w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.classList.add('split');
    $$('.w > span', el).forEach((s, i) => s.style.setProperty('--d', (i * 0.06) + 's'));
  }

  /* ---------- preparación de elementos ---------- */
  if (!reduce) {
    $$('[data-split]').forEach(splitWords);
    $$('.section__num').forEach((n) => { n.innerHTML = '<span>' + n.textContent + '</span>'; n.classList.add('mask'); });
    // grupos con escalonado
    const groups = [
      '.values__intro .label', '.value', '.about__text > *', '.about__creds li',
      '.card', '.step', '.quote-card', '.carousel__nav', '.partner__body > *',
      '.faq__item', '.location__row', '.location__info .btn', '.location__map',
      '.contact__text > *', '.contact__list li', '.contact__form > *',
      '.footer__top > *', '.footer__copy', '.section__sub', '.logos__inner > *', '.process__aside p',
    ];
    groups.forEach((sel) => $$(sel).forEach((el, i) => {
      if (el.classList.contains('split') || el.classList.contains('img-reveal')) return;
      el.classList.add('rv');
      el.style.setProperty('--d', Math.min(i * 0.09, 0.6) + 's');
    }));
    $$('.hero__text .rv').forEach((el, i) => el.style.setProperty('--d', (0.55 + i * 0.12) + 's'));
    $$('.value').forEach((el, i) => el.style.setProperty('--d', (i * 0.15) + 's'));
  }

  /* ---------- observador de entrada ---------- */
  function startObservers() {
    if (reduce || !('IntersectionObserver' in window)) {
      $$('.split, .mask, .rv, .img-reveal, .section__head, .hero__meta, .value').forEach((el) => el.classList.add('is-in'));
      $$('.step').forEach((s) => s.classList.add('is-on'));
      $$('.steps').forEach((s) => s.style.setProperty('--p', 1));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('is-in');
        if (el.classList.contains('section__head')) {
          $$('.mask, .split', el).forEach((x) => x.classList.add('is-in'));
        }
        // Las fotos recortadas no tienen área visible: se revelan desde su contenedor.
        if (el.dataset.revealsImg) {
          $$('.img-reveal', el).forEach((x) => x.classList.add('is-in'));
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    $$('.split, .mask, .rv, .section__head, .hero__meta, .value').forEach((el) => io.observe(el));
    $$('.img-reveal').forEach((img) => { const p = img.parentElement; p.dataset.revealsImg = '1'; io.observe(p); });
  }

  /* ---------- intro ---------- */
  const intro = document.getElementById('intro');
  const seen = (() => { try { return sessionStorage.getItem('vb-intro'); } catch (e) { return null; } })();
  if (intro && !reduce && !seen) {
    html.classList.add('has-intro');
    try { sessionStorage.setItem('vb-intro', '1'); } catch (e) {}
    setTimeout(() => {
      intro.classList.add('is-done');
      html.classList.remove('has-intro');
      setTimeout(startObservers, 250);
      setTimeout(() => intro.classList.add('is-off'), 1100);
    }, 2100);
  } else {
    if (intro) intro.classList.add('is-off');
    startObservers();
  }

  if (reduce) return;

  /* ---------- barra de progreso + nav que se esconde ---------- */
  const progress = document.getElementById('progress');
  const nav = document.querySelector('.nav');
  let lastY = window.scrollY;
  function onScrollUI() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (nav && !menuOpen) nav.classList.toggle('is-hidden', y > lastY && y > 160);
    lastY = y;
  }

  /* ---------- parallax e inclinación del hero ---------- */
  const heroPhoto = document.querySelector('.hero__photo');
  const hero = document.querySelector('.hero');
  let tiltX = 0, tiltY = 0, scrollShift = 0;
  function applyHero() {
    if (!heroPhoto) return;
    heroPhoto.style.transform = 'translateY(' + scrollShift + 'px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
  }
  if (hero && heroPhoto && finePointer) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      tiltY = dx * 5; tiltX = -dy * 4; applyHero();
    });
    hero.addEventListener('mouseleave', () => { tiltX = 0; tiltY = 0; applyHero(); });
  }

  /* ---------- línea de tiempo según el scroll ---------- */
  const steps = document.querySelector('.steps');
  const stepEls = $$('.step');
  function onScrollTimeline() {
    if (!steps) return;
    const r = steps.getBoundingClientRect();
    const trigger = window.innerHeight * 0.72;
    const p = clamp((trigger - r.top) / r.height, 0, 1);
    steps.style.setProperty('--p', p.toFixed(3));
    stepEls.forEach((s) => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle('is-on', sr.top + 22 <= trigger);
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollUI();
      scrollShift = window.scrollY * 0.08; applyHero();
      onScrollTimeline();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- cursor y botones magnéticos (solo ratón) ---------- */
  if (finePointer) {
    const cursor = document.getElementById('cursor');
    if (cursor) {
      html.classList.add('has-cursor');
      let cx = -100, cy = -100, tx = -100, ty = -100, shown = false;
      document.addEventListener('mousemove', (e) => {
        tx = e.clientX; ty = e.clientY;
        if (!shown) { shown = true; cursor.classList.add('is-active'); cx = tx; cy = ty; }
        const t = e.target;
        const hot = t.closest && t.closest('a, button, summary, .faq__item summary, .carousel__dots button');
        cursor.classList.toggle('is-hover', !!hot);
        cursor.classList.toggle('is-light', !!(t.closest && t.closest('.contact')));
      });
      document.addEventListener('mouseleave', () => { cursor.classList.remove('is-active'); shown = false; });
      (function loop() {
        cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
        cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
        requestAnimationFrame(loop);
      })();
    }

    $$('.btn, .carousel__arrow, .nav__cta').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + (dx * 0.22) + 'px,' + (dy * 0.22) + 'px)';
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }
})();
