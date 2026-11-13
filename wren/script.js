(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var embedded = document.documentElement.classList.contains('is-embedded');

  /* Header shadow */
  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('is-stuck', window.scrollY > 6); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  function setMenu(open) { btn.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); btn.focus(); } });

  /* Reveal on scroll */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce && !embedded) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 70 + 'ms';
        el.classList.add('is-in'); io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('is-in'); }); }

  /* Accordion: smooth open/close */
  document.querySelectorAll('.accordion details').forEach(function (d) {
    var s = d.querySelector('summary'), b = d.querySelector('.acc__body');
    s.addEventListener('click', function (e) {
      if (reduce || !b.animate) return;
      e.preventDefault();
      if (d.open) { var a = b.animate([{ height: b.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: 'ease-out' }); a.onfinish = function () { d.open = false; }; }
      else { d.open = true; var h = b.offsetHeight; b.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 340, easing: 'ease-out' }); }
    });
  });

  /* Booking form (concept: nothing is sent) */
  var form = document.getElementById('booking');
  if (form) {
    var err = form.querySelector('.form__error'), done = form.querySelector('.form__done');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (i) {
        var ok = i.type === 'checkbox' ? i.checked : (i.checkValidity() && i.value.trim() !== '');
        i.closest('.field, .check').classList.toggle('is-invalid', !ok);
        i.setAttribute('aria-invalid', String(!ok));
        if (!ok && !bad) bad = i;
      });
      if (bad) { err.hidden = false; bad.focus(); return; }
      err.hidden = true;
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
