// Kiln Dental Laboratory · concept site

(function () {
  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  // One selector: the radio cards. The submit button's wording follows the choice.
  var form = document.querySelector('[data-form]');
  if (!form) return;
  var radios = form.querySelectorAll('input[name="intent"]');
  var submit = form.querySelector('[data-submit]');
  function syncLabel() {
    var on = form.querySelector('input[name="intent"]:checked');
    if (on && submit) submit.textContent = on.getAttribute('data-label');
  }
  Array.prototype.forEach.call(radios, function (r) { r.addEventListener('change', syncLabel); });
  syncLabel();

  // Links elsewhere on the page (data-intent) preselect the matching option
  Array.prototype.forEach.call(document.querySelectorAll('a[data-intent]'), function (a) {
    a.addEventListener('click', function () {
      Array.prototype.forEach.call(radios, function (r) { r.checked = r.value === a.getAttribute('data-intent'); });
      syncLabel();
    });
  });

  // Validation, then a demo message (this concept form isn't connected to anything)
  var note = form.querySelector('[data-form-note]');
  var original = note.innerHTML;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (field) {
      var ok = field.checkValidity() && field.value.trim() !== '';
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !firstBad) firstBad = field;
    });
    if (firstBad) {
      note.textContent = 'Please add your name, practice and a valid email.';
      firstBad.focus();
      return;
    }
    note.textContent = 'Thanks. This is a concept site, so nothing has been sent.';
    form.reset();
    syncLabel();
    setTimeout(function () { note.innerHTML = original; }, 6000);
  });
})();
