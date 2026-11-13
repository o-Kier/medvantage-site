(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // When shown as a live preview inside another page (e.g. a case study), skip scroll animations
  var embedded = false;
  try { embedded = window.self !== window.top; } catch (e) { embedded = true; }

  /* Hero image settle */
  window.requestAnimationFrame(function () { document.body.classList.add('is-loaded'); });

  /* Sticky header shadow */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-stuck', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });

  /* Reveal on scroll, staggered within each group */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion && !embedded) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 80 + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Treatment list: floating image preview that follows the pointer */
  var preview = document.querySelector('.t-preview');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (preview && finePointer && !reduceMotion) {
    var img = preview.querySelector('img');
    var x = 0, y = 0, cx = 0, cy = 0, raf = null, active = false;
    function loop() {
      cx += (x - cx) * 0.16; cy += (y - cy) * 0.16;
      preview.style.transform = 'translate3d(' + (cx + 40) + 'px,' + (cy - 150) + 'px,0) scale(' + (active ? 1 : 0.92) + ')';
      raf = active || Math.abs(x - cx) > 0.5 ? requestAnimationFrame(loop) : null;
    }
    document.querySelectorAll('.t-item').forEach(function (row) {
      row.addEventListener('mouseenter', function (e) {
        if (img.getAttribute('src') !== row.dataset.img) img.src = row.dataset.img;
        if (!active) { cx = e.clientX; cy = e.clientY; }
        active = true; preview.classList.add('is-visible');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; });
      row.addEventListener('mouseleave', function () { active = false; preview.classList.remove('is-visible'); });
    });
  }

  /* Accordion: smooth open/close */
  document.querySelectorAll('.accordion details').forEach(function (d) {
    var summary = d.querySelector('summary');
    var body = d.querySelector('.accordion__body');
    summary.addEventListener('click', function (e) {
      if (reduceMotion || !body.animate) return;
      e.preventDefault();
      if (d.open) {
        var a = body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease-out' });
        a.onfinish = function () { d.open = false; };
      } else {
        d.open = true;
        var h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 380, easing: 'ease-out' });
      }
    });
  });

  /* Enquiry form (concept: no data is sent anywhere) */
  var form = document.getElementById('enquiry');
  if (form) {
    var error = form.querySelector('.form__error');
    var done = form.querySelector('.form__done');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('[required]').forEach(function (input) {
        var ok = input.type === 'checkbox' ? input.checked : input.checkValidity() && input.value.trim() !== '';
        var wrap = input.closest('.field, .check');
        wrap.classList.toggle('is-invalid', !ok);
        input.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) { error.hidden = false; firstBad.focus(); return; }
      error.hidden = true;
      form.querySelectorAll('.form__row, .field, .check, button[type="submit"]').forEach(function (el) { el.hidden = true; });
      done.hidden = false;
    });
  }
  /* Live previews: open at a section (?view=id) by scrolling this frame only.
     A #hash link would also scroll the page the preview sits in. */
  (function () {
    var m = /[?&]view=([a-z-]+)/.exec(location.search);
    if (!m) return;
    function go() {
      var el = document.getElementById(m[1]); if (!el) return;
      var head = document.querySelector('header');
      var off = head ? head.offsetHeight : 0;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off, behavior: 'instant' });
    }
    go(); window.addEventListener('load', go);
  })();
})();
