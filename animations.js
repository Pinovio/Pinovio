(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Scroll progress bar ── */

  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  if (!reducedMotion) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      progressBar.style.transform = 'scaleX(' + progress + ')';
    }, { passive: true });
  }

  /* Exit early for reduced-motion users */
  if (reducedMotion) return;

  /* ── 2. Cursor spotlight ── */

  var spotlight = document.createElement('div');
  spotlight.className = 'cursor-spotlight';
  spotlight.setAttribute('aria-hidden', 'true');
  document.body.prepend(spotlight);

  window.addEventListener('mousemove', function (e) {
    spotlight.style.setProperty('--cx', e.clientX + 'px');
    spotlight.style.setProperty('--cy', e.clientY + 'px');
  }, { passive: true });

  window.addEventListener('mouseleave', function () {
    spotlight.style.setProperty('--cx', '-9999px');
    spotlight.style.setProperty('--cy', '-9999px');
  }, { passive: true });

  /* ── 3. Card spotlight border ── */

  document.querySelectorAll('.card, .tool-card, .publication-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    }, { passive: true });
  });

  /* ── 4. Magnetic buttons ── */

  document.querySelectorAll('.button-primary, .button-secondary').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) * 0.07;
      var dy = (e.clientY - cy) * 0.07;
      btn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    }, { passive: true });

    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });

  /* ── 5. Stat count-up ── */

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCount(el, target, suffix, duration) {
    var start = null;
    el.classList.add('counting');

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var current = Math.round(easeOut(progress) * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
        el.classList.remove('counting');
      }
    }

    requestAnimationFrame(step);
  }

  function initCountUps(statBar) {
    statBar.querySelectorAll('.stat-number').forEach(function (el) {
      var raw = el.textContent.trim();
      var suffix = '';

      if (raw.endsWith('+')) {
        suffix = '+';
        raw = raw.slice(0, -1);
      }

      var num = parseInt(raw, 10);
      if (isNaN(num)) return;
      if (num >= 1000) return;

      el.textContent = '0' + suffix;

      setTimeout(function () {
        animateCount(el, num, suffix, 1200);
      }, 300);
    });
  }

  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        initCountUps(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-bar').forEach(function (el) {
    countObserver.observe(el);
  });

  /* ── 6. Modal close animation ── */

  var modal = document.querySelector('.email-modal');
  var closeBtn = document.querySelector('.modal-close');

  if (modal && closeBtn) {
    function animatedClose() {
      modal.classList.add('modal-closing');
      modal.querySelector('.modal-card').addEventListener('animationend', function onEnd() {
        modal.classList.remove('modal-closing');
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        modal.querySelector('.modal-card').removeEventListener('animationend', onEnd);
      }, { once: true });
    }

    document.querySelectorAll('.modal-close').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (modal.classList.contains('show')) {
          e.stopImmediatePropagation();
          animatedClose();
        }
      }, true);
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal && modal.classList.contains('show')) {
        e.stopImmediatePropagation();
        animatedClose();
      }
    }, true);
  }

})();
