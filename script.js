/* ===== Menú móvil (hamburguesa) ===== */
(function () {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  function setOpen(open) {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Cerrar al pulsar cualquier enlace del menú
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => setOpen(false))
  );

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // Si se agranda la ventana a escritorio, asegurar que quede cerrado
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) setOpen(false);
  });
})();


/* ===== Animaciones de aparición al hacer scroll ===== */
/* Ligero: usa IntersectionObserver, sin librerías externas. */

(function () {
  // Elementos que queremos animar al entrar en pantalla.
  // Se agrupan por sección para aplicar un retardo escalonado bonito.
  const groups = [
    ['.hero__text > *'],                 // hero: título, texto, botones...
    ['.logos'],
    ['.value'],
    ['.about__media', '.about__text'],
    ['.section__head'],
    ['.card'],
    ['.step'],
    ['.carousel'],
    ['.faq__item'],
    ['.location__info', '.location__map'],
    ['.contact__text', '.contact__form'],
  ];

  // Marca los elementos con la clase base y un retardo escalonado.
  groups.forEach((selectors) => {
    const els = document.querySelectorAll(selectors.join(', '));
    els.forEach((el, i) => {
      el.classList.add('reveal');
      // Escalonado suave (máx. ~0.4s) dentro de cada grupo.
      el.style.transitionDelay = Math.min(i * 90, 400) + 'ms';
    });
  });

  const revealEls = document.querySelectorAll('.reveal');

  // Si el navegador no soporta el observer, mostramos todo directamente.
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // se anima una sola vez
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
})();


/* ===== Carrusel de testimonios ===== */
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

  // Cuántas tarjetas se ven según el ancho (coincide con el CSS)
  function perView() {
    const w = window.innerWidth;
    if (w <= 620) return 1;
    if (w <= 940) return 2;
    return 3;
  }
  function maxIndex() {
    return Math.max(0, cards.length - perView());
  }

  // Crear los puntos (uno por posición posible)
  function buildDots() {
    dotsWrap.innerHTML = '';
    const total = maxIndex() + 1;
    for (let i = 0; i < total; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Ir a la reseña ' + (i + 1));
      b.addEventListener('click', () => { index = i; update(); });
      dotsWrap.appendChild(b);
    }
  }

  function update() {
    if (index > maxIndex()) index = maxIndex();
    if (index < 0) index = 0;
    const cardW = cards[0].getBoundingClientRect().width;
    const offset = index * (cardW + GAP);
    track.style.transform = 'translateX(' + -offset + 'px)';

    Array.from(dotsWrap.children).forEach((d, i) =>
      d.classList.toggle('is-active', i === index)
    );
  }

  function next() {
    index = index >= maxIndex() ? 0 : index + 1; // vuelve al principio al final
    update();
  }
  function prev() {
    index = index <= 0 ? maxIndex() : index - 1;
    update();
  }

  // Solo se mueve cuando el usuario pulsa las flechas o los puntos.
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Recalcular al cambiar el tamaño de la ventana
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { buildDots(); update(); }, 150);
  });

  buildDots();
  update();
})();
