(function () {
  'use strict';

  // Exit early for users who prefer reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── 1. Background floating orbs ── */

  var orbWrapper = document.createElement('div');
  orbWrapper.className = 'bg-orbs';

  var orbDefs = [
    { w: 600, h: 600, top: '-10%',  left: '-8%',  color: '#3b82f6', dur: '22s', dx: '60px',  dy: '40px',  op: '0.06', delay: '0s'  },
    { w: 480, h: 480, top: '40%',   right: '-5%', color: '#60a5fa', dur: '28s', dx: '-50px', dy: '60px',  op: '0.05', delay: '-9s' },
    { w: 360, h: 360, bottom: '10%',left: '30%',  color: '#2563eb', dur: '19s', dx: '30px',  dy: '-50px', op: '0.04', delay: '-5s' }
  ];

  orbDefs.forEach(function (def) {
    var orb = document.createElement('div');
    orb.className = 'bg-orb';
    orb.style.cssText = [
      'width:'  + def.w + 'px',
      'height:' + def.h + 'px',
      def.top    ? 'top:'    + def.top    : '',
      def.bottom ? 'bottom:' + def.bottom : '',
      def.left   ? 'left:'   + def.left   : '',
      def.right  ? 'right:'  + def.right  : '',
      'background:' + def.color
    ].filter(Boolean).join(';');
    orb.style.setProperty('--orb-duration', def.dur);
    orb.style.setProperty('--orb-dx',       def.dx);
    orb.style.setProperty('--orb-dy',       def.dy);
    orb.style.setProperty('--orb-opacity',  def.op);
    orb.style.setProperty('--orb-delay',    def.delay);
    orbWrapper.appendChild(orb);
  });

  document.body.prepend(orbWrapper);

  /* ── 2. Intersection Observer ── */

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observe(el) {
    if (el) observer.observe(el);
  }

  /* ── 3. Add animation classes to DOM elements ── */

  // Section h2 headers — fade up
  document.querySelectorAll('.section h2').forEach(function (el) {
    el.classList.add('anim-ready');
    observe(el);
  });

  // Section intro paragraphs — fade up with slight delay
  document.querySelectorAll('.section-intro').forEach(function (el) {
    el.classList.add('anim-ready');
    el.style.transitionDelay = '80ms';
    observe(el);
  });

  // Stat bars — fade up, also triggers count-up
  document.querySelectorAll('.stat-bar').forEach(function (el) {
    el.classList.add('anim-ready');
    observe(el);
  });

  // Callout boxes — fade up
  document.querySelectorAll('.callout').forEach(function (el) {
    el.classList.add('anim-ready');
    observe(el);
  });

  // Article body h2s — subtle rise
  document.querySelectorAll('.article-body h2').forEach(function (el) {
    el.classList.add('anim-article-h2');
    observe(el);
  });

  // Staggered grids — apply per-child delays
  var staggerSelectors = [
    { sel: '.decision-grid',    delay: 90  },
    { sel: '.tool-grid',        delay: 80  },
    { sel: '.publication-grid', delay: 100 },
    { sel: '.grid.grid-3',      delay: 90  },
    { sel: '.grid.grid-2',      delay: 110 }
  ];

  staggerSelectors.forEach(function (cfg) {
    document.querySelectorAll(cfg.sel).forEach(function (grid) {
      grid.classList.add('anim-stagger');
      Array.from(grid.children).forEach(function (child, i) {
        child.style.setProperty('--delay', (i * cfg.delay) + 'ms');
      });
      observe(grid);
    });
  });

  /* ── 4. Stat count-up ── */

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

      // Check for trailing +
      if (raw.endsWith('+')) {
        suffix = '+';
        raw = raw.slice(0, -1);
      }

      var num = parseInt(raw, 10);

      // Only count-up pure integers — skip things like "April 2026" or "2026"
      if (isNaN(num)) return;
      // Skip large year-like values (>= 1000) — not meant to animate
      if (num >= 1000) return;

      var original = el.textContent;
      el.textContent = '0' + suffix;

      // Small delay so the fade-in and count-up feel coordinated
      setTimeout(function () {
        animateCount(el, num, suffix, 1200);
      }, 300);
    });
  }

  // Wire count-up to stat bars entering the viewport
  // We need a separate observer for this since the general one fires anim-visible
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

})();
