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

  /* Exit early for reduced-motion users (all other animations) */
  if (reducedMotion) return;

  /* ── 2. Background floating orbs ── */

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

  /* ── 3. Canvas particle network ── */

  var netCanvas = document.createElement('canvas');
  netCanvas.id = 'net-canvas';
  netCanvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(netCanvas);

  var netCtx = netCanvas.getContext('2d');
  var netMouse = { x: null, y: null };
  var netParticles = [];
  var NET_COUNT = 70;
  var NET_CONNECT = 150;
  var NET_REPEL = 120;

  function netResize() {
    netCanvas.width  = window.innerWidth;
    netCanvas.height = window.innerHeight;
  }
  netResize();
  window.addEventListener('resize', function () {
    netResize();
    netParticles.forEach(function (p) {
      p.x = Math.min(p.x, netCanvas.width);
      p.y = Math.min(p.y, netCanvas.height);
    });
  }, { passive: true });

  window.addEventListener('mousemove', function (e) {
    netMouse.x = e.clientX;
    netMouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', function () {
    netMouse.x = null;
    netMouse.y = null;
  }, { passive: true });

  for (var pi = 0; pi < NET_COUNT; pi++) {
    netParticles.push({
      x: Math.random() * netCanvas.width,
      y: Math.random() * netCanvas.height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r: Math.random() * 1.4 + 0.8
    });
  }

  function drawNet() {
    netCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);

    netParticles.forEach(function (p) {
      if (netMouse.x !== null) {
        var mdx = p.x - netMouse.x;
        var mdy = p.y - netMouse.y;
        var md  = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < NET_REPEL && md > 0) {
          var f = (NET_REPEL - md) / NET_REPEL;
          p.vx += (mdx / md) * f * 0.5;
          p.vy += (mdy / md) * f * 0.5;
        }
      }

      p.vx *= 0.97;
      p.vy *= 0.97;
      p.vx = Math.max(-1.8, Math.min(1.8, p.vx));
      p.vy = Math.max(-1.8, Math.min(1.8, p.vy));
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = netCanvas.width;
      if (p.x > netCanvas.width)  p.x = 0;
      if (p.y < 0) p.y = netCanvas.height;
      if (p.y > netCanvas.height) p.y = 0;
    });

    for (var i = 0; i < netParticles.length; i++) {
      for (var j = i + 1; j < netParticles.length; j++) {
        var cdx = netParticles[i].x - netParticles[j].x;
        var cdy = netParticles[i].y - netParticles[j].y;
        var cd  = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cd < NET_CONNECT) {
          var alpha = (1 - cd / NET_CONNECT) * 0.28;
          netCtx.strokeStyle = 'rgba(59,130,246,' + alpha + ')';
          netCtx.lineWidth = 0.8;
          netCtx.beginPath();
          netCtx.moveTo(netParticles[i].x, netParticles[i].y);
          netCtx.lineTo(netParticles[j].x, netParticles[j].y);
          netCtx.stroke();
        }
      }
    }

    netParticles.forEach(function (p) {
      netCtx.beginPath();
      netCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      netCtx.fillStyle = 'rgba(96,165,250,0.6)';
      netCtx.fill();
    });

    requestAnimationFrame(drawNet);
  }

  drawNet();

  /* ── 5. Intersection Observer ── */

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-visible');
      } else {
        entry.target.classList.remove('anim-visible');
        var aboveViewport = entry.boundingClientRect.top < 0;
        entry.target.classList.toggle('anim-from-above', aboveViewport);
        entry.target.classList.toggle('anim-from-below', !aboveViewport);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observe(el) {
    if (el) observer.observe(el);
  }

  /* ── 6. Apply animation classes to DOM elements ── */

  // Section h2 headers — fade up + accent line
  document.querySelectorAll('.section h2').forEach(function (el) {
    el.classList.add('anim-ready', 'anim-from-below');
    observe(el);
  });

  // Section intro paragraphs — fade up with slight delay
  document.querySelectorAll('.section-intro').forEach(function (el) {
    el.classList.add('anim-ready', 'anim-from-below');
    el.style.transitionDelay = '80ms';
    observe(el);
  });

  // Stat bars — fade up, also triggers count-up
  document.querySelectorAll('.stat-bar').forEach(function (el) {
    el.classList.add('anim-ready', 'anim-from-below');
    observe(el);
  });

  // Callout boxes — fade up
  document.querySelectorAll('.callout').forEach(function (el) {
    el.classList.add('anim-ready', 'anim-from-below');
    observe(el);
  });

  // Article body h2s — subtle rise
  document.querySelectorAll('.article-body h2').forEach(function (el) {
    el.classList.add('anim-article-h2', 'anim-from-below');
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
      grid.classList.add('anim-stagger', 'anim-from-below');
      Array.from(grid.children).forEach(function (child, i) {
        child.style.setProperty('--delay', (i * cfg.delay) + 'ms');
      });
      observe(grid);
    });
  });

  /* ── 7. Stat count-up ── */

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

  /* ── 8. Modal close animation ── */

  var modal = document.querySelector('.email-modal');
  var closeBtn = document.querySelector('.modal-close');

  if (modal && closeBtn) {
    // Intercept close to play exit animation first
    var originalClose = null;

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

    // Patch the close triggers to use animated close
    document.querySelectorAll('.modal-close').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (modal.classList.contains('show')) {
          e.stopImmediatePropagation();
          animatedClose();
        }
      }, true); // capture phase to run before inline handler
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal && modal.classList.contains('show')) {
        e.stopImmediatePropagation();
        animatedClose();
      }
    }, true);
  }

})();
