// ============================================================
// three-intro.js — Session-state orchestrator.
// Creates a single Three.js canvas container and hands it to PinovioScene.
// First visit: canvas sits at z-index 15 so it covers the page during
// the text → wave transition. When intro completes:
//   - canvas drops to z-index 0
//   - a centered "Scroll to begin" cue appears over the wave
//   - body stays in pinovio-intro-active until the user scrolls/keys
//   - first scroll intent reveals page content with a soft slide-in
// Return visits / reduced-motion: skip intro, canvas starts at z-index 0,
// content is visible immediately.
// ============================================================

(function () {
  'use strict'

  const SHOW_INTRO = !sessionStorage.getItem('pinovio-intro-shown')
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const doIntro = SHOW_INTRO && !REDUCED_MOTION

  let container = null
  let scene = null
  let cueEl = null
  let revealed = false
  let touchStartY = 0

  function createContainer(zIndex) {
    container = document.createElement('div')
    container.id = 'pinovio-wave-background'
    container.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: ${zIndex};
      pointer-events: none;
      overflow: hidden;
    `
    if (document.body.firstChild) {
      document.body.insertBefore(container, document.body.firstChild)
    } else {
      document.body.appendChild(container)
    }
  }

  function showScrollCue() {
    cueEl = document.createElement('div')
    cueEl.id = 'pinovio-scroll-cue'
    cueEl.innerHTML = `
      <span class="pinovio-scroll-cue__label">Scroll to begin</span>
      <svg class="pinovio-scroll-cue__arrow" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
    document.body.appendChild(cueEl)
    // Trigger fade-in on next frame
    requestAnimationFrame(() => {
      if (cueEl) cueEl.classList.add('pinovio-scroll-cue--visible')
    })
  }

  function revealContent() {
    if (revealed) return
    revealed = true

    // Fade out the cue
    if (cueEl) {
      cueEl.classList.remove('pinovio-scroll-cue--visible')
      setTimeout(() => {
        if (cueEl && cueEl.parentNode) cueEl.parentNode.removeChild(cueEl)
        cueEl = null
      }, 450)
    }

    // Unlock scroll + trigger content fade-in
    document.body.classList.remove('pinovio-intro-active')

    removeRevealListeners()
  }

  // Any of these gestures (scrolling DOWN) count as "the user wants in"
  function onWheel(e) {
    if (e.deltaY > 0) revealContent()
  }
  function onTouchStart(e) {
    touchStartY = e.touches[0].clientY
  }
  function onTouchMove(e) {
    // Downward swipe = finger moving up (startY > currentY)
    if (touchStartY - e.touches[0].clientY > 10) revealContent()
  }
  function onKey(e) {
    const scrollKeys = [' ', 'ArrowDown', 'PageDown', 'End', 'Enter']
    if (scrollKeys.indexOf(e.key) !== -1) revealContent()
  }
  function onCueClick() { revealContent() }

  function addRevealListeners() {
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)
    if (cueEl) cueEl.addEventListener('click', onCueClick)
  }

  function removeRevealListeners() {
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('keydown', onKey)
  }

  function handoffToBackground() {
    sessionStorage.setItem('pinovio-intro-shown', 'true')
    if (container) {
      container.style.zIndex = '0'
    }
    // Keep body.pinovio-intro-active so content stays hidden until scroll.
    showScrollCue()
    addRevealListeners()
  }

  function init() {
    if (typeof window.PinovioScene === 'undefined') {
      console.warn('[three-intro] PinovioScene not loaded')
      return
    }

    if (doIntro) {
      createContainer(15)
      document.body.classList.add('pinovio-intro-active')
    } else {
      createContainer(0)
      sessionStorage.setItem('pinovio-intro-shown', 'true')
    }

    scene = new window.PinovioScene(container, {
      skipIntro: !doIntro,
      onIntroComplete: handoffToBackground,
    })
    scene.start()

    window.addEventListener('beforeunload', () => {
      if (scene) scene.destroy()
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
