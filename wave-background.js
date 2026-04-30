// ============================================================
// wave-background.js — Unified Pinovio Three.js scene.
// One particle system, three phases:
//   showingWord    → particles converge onto each word in WORDS, one by one
//                    (form → hold → advance). Reuses same particles across words.
//   morphingToWave → same particles lerp to wave-grid positions while camera lifts
//   wave           → continuous sine wave animation, scroll-reactive
//
// On return visits the intro phases are skipped and we start directly in "wave".
// Exposed globally as window.PinovioScene.
// ============================================================

(function () {
  'use strict'

  class PinovioScene {
    constructor(container, options) {
      this.container = container
      options = options || {}
      this.skipIntro = options.skipIntro || false
      this.onIntroComplete = options.onIntroComplete || (() => {})

      // Grid (must produce exactly NUM particles)
      this.AMOUNTX = 40
      this.AMOUNTY = 60
      this.SEPARATION = 150
      this.NUM = this.AMOUNTX * this.AMOUNTY // 2400

      // Intro words + per-word timing
      this.WORDS = ['Welcome', 'to', 'Pinovio']
      this.WORD_FORM_MS = 350   // 0.35s to snap into letters
      this.WORD_HOLD_MS = 700   // 0.7s holding each word (~1s per word total)
      this.MORPH_MS = 2500      // 2.5s text → wave + camera lift

      // Cameras
      this.FOV = 50
      this.CAM_INTRO = { x: 0, y: 0, z: 1000 }
      this.CAM_WAVE  = { x: 0, y: 355, z: 1220 }

      // Colors
      this.COLOR = 0x60a5fa
      this.BG = 0x0b1220

      // Visual sizing
      this.INTRO_SCALE = 15 // roughly matches avg wave dot

      // State
      this.phase = null
      this.phaseStart = 0
      this.currentWordIndex = 0
      this.waveCount = 0
      this.scrollFactor = 0

      this.positions = null
      this.scales = null
      this.waveHome = null
      this.textTargets = null
      this.morphStartPositions = null
      this.morphStartScales = null
      this.morphStartCamera = null

      this.animationId = null
      this.resizeHandler = null
      this.scrollHandler = null

      // Motion pause state (toggled by the UI switch)
      this.motionPaused = false
    }

    // ---------------------------------------------------------
    // init: build Three.js scene
    // ---------------------------------------------------------
    init() {
      if (typeof THREE === 'undefined') {
        console.warn('[PinovioScene] THREE.js not loaded')
        return false
      }

      const w = window.innerWidth
      const h = window.innerHeight

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(this.BG)
      this.scene.fog = new THREE.Fog(this.BG, 2000, 5500)

      this.camera = new THREE.PerspectiveCamera(this.FOV, w / h, 1, 10000)
      if (this.skipIntro) {
        this.camera.position.set(this.CAM_WAVE.x, this.CAM_WAVE.y, this.CAM_WAVE.z)
      } else {
        this.camera.position.set(this.CAM_INTRO.x, this.CAM_INTRO.y, this.CAM_INTRO.z)
      }
      this.camera.lookAt(0, 0, 0)

      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(w, h)
      this.renderer.setClearColor(this.BG, 1)
      this.container.appendChild(this.renderer.domElement)

      this.positions = new Float32Array(this.NUM * 3)
      this.scales = new Float32Array(this.NUM)

      this.generateWaveHome()

      if (this.skipIntro) {
        // Place particles at wave home (wave animation will take over immediately)
        for (let i = 0; i < this.NUM; i++) {
          this.positions[i * 3]     = this.waveHome[i].x
          this.positions[i * 3 + 1] = 0
          this.positions[i * 3 + 2] = this.waveHome[i].z
          this.scales[i] = 1
        }
      } else {
        // Scatter particles, compute first word's targets
        this.currentWordIndex = 0
        this.computeTextTargets(this.WORDS[0])
        for (let i = 0; i < this.NUM; i++) {
          // Large sphere around origin, a bit biased in front of camera
          const theta = Math.random() * Math.PI * 2
          const r = 1400 + Math.random() * 1200
          const elev = (Math.random() - 0.5) * Math.PI
          this.positions[i * 3]     = r * Math.cos(elev) * Math.cos(theta)
          this.positions[i * 3 + 1] = r * Math.cos(elev) * Math.sin(theta)
          this.positions[i * 3 + 2] = r * Math.sin(elev) * 0.3
          this.scales[i] = this.INTRO_SCALE
        }
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
      geometry.setAttribute('scale', new THREE.BufferAttribute(this.scales, 1))

      this.material = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(this.COLOR) },
          opacity: { value: 1 },
        },
        vertexShader: `
          attribute float scale;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = scale * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float opacity;
          void main() {
            if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
            gl_FragColor = vec4(color, opacity);
          }
        `,
        transparent: true,
      })

      this.particles = new THREE.Points(geometry, this.material)
      this.scene.add(this.particles)

      this.resizeHandler = () => this.onResize()
      this.scrollHandler = () => {
        this.scrollFactor = Math.min(window.scrollY / 5000, 0.2)
      }
      // If the user opens the page in a background tab, rAF may pause.
      // On focus: cancel any stale pending rAF, reset phase timer so we
      // don't instantly skip forward, then restart the loop cleanly.
      this.visibilityHandler = () => {
        if (document.visibilityState === 'visible' && this.renderer) {
          cancelAnimationFrame(this.animationId)
          // Only reset the timer for intro phases; wave can resume wherever it left off.
          if (this.phase !== 'wave') this.phaseStart = Date.now()
          this.animate()
        }
      }
      window.addEventListener('resize', this.resizeHandler)
      window.addEventListener('scroll', this.scrollHandler, { passive: true })
      document.addEventListener('visibilitychange', this.visibilityHandler)

      this.phase = this.skipIntro ? 'wave' : 'showingWord'
      this.phaseStart = Date.now()

      return true
    }

    // ---------------------------------------------------------
    // Wave grid home positions (x, 0, z)
    // ---------------------------------------------------------
    generateWaveHome() {
      this.waveHome = new Array(this.NUM)
      let idx = 0
      for (let ix = 0; ix < this.AMOUNTX; ix++) {
        for (let iy = 0; iy < this.AMOUNTY; iy++) {
          this.waveHome[idx++] = {
            x: ix * this.SEPARATION - (this.AMOUNTX * this.SEPARATION) / 2,
            y: 0,
            z: iy * this.SEPARATION - (this.AMOUNTY * this.SEPARATION) / 2,
          }
        }
      }
    }

    // ---------------------------------------------------------
    // Rasterize text → world-space target positions (z = 0 plane)
    // Camera CAM_INTRO looks at (0,0,0) along -Z, so 1 canvas px = 1 world unit
    // ---------------------------------------------------------
    computeTextTargets(text) {
      const aspect = window.innerWidth / window.innerHeight
      const fov = this.FOV
      const camDist = this.CAM_INTRO.z
      const visH = 2 * camDist * Math.tan((fov / 2) * Math.PI / 180)
      const visW = visH * aspect

      const CW = Math.max(800, Math.round(visW))
      const CH = Math.max(200, Math.round(visH))

      const canvas = document.createElement('canvas')
      canvas.width = CW
      canvas.height = CH
      const ctx = canvas.getContext('2d')

      // Pick a font size that fits ~72% of canvas width
      let fontSize = 200
      const targetW = CW * 0.72
      while (fontSize > 40) {
        ctx.font = `bold ${fontSize}px Arial, sans-serif`
        if (ctx.measureText(text).width <= targetW) break
        fontSize -= 8
      }

      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, CW / 2, CH / 2)

      const imageData = ctx.getImageData(0, 0, CW, CH).data
      const points = []
      const step = 3 // every 3rd pixel along each axis
      for (let y = 0; y < CH; y += step) {
        for (let x = 0; x < CW; x += step) {
          const a = imageData[(y * CW + x) * 4 + 3]
          if (a > 128) points.push({ px: x, py: y })
        }
      }

      // Shuffle so particles don't move in reading order
      for (let i = points.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = points[i]; points[i] = points[j]; points[j] = tmp
      }

      this.textTargets = new Array(this.NUM)
      if (points.length === 0) {
        for (let i = 0; i < this.NUM; i++) {
          this.textTargets[i] = { x: 0, y: 0, z: 0 }
        }
        return
      }
      // Wrap points if fewer than particles (rare on big screens)
      for (let i = 0; i < this.NUM; i++) {
        const p = points[i % points.length]
        this.textTargets[i] = {
          x: p.px - CW / 2,
          y: -(p.py - CH / 2), // flip y (canvas y grows down, world y grows up)
          z: 0,
        }
      }
    }

    // ---------------------------------------------------------
    // Resize: update camera aspect + renderer
    // (we intentionally do NOT recompute text targets mid-intro)
    // ---------------------------------------------------------
    onResize() {
      const w = window.innerWidth
      const h = window.innerHeight
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h)
    }

    // ---------------------------------------------------------
    // Animation loop
    // ---------------------------------------------------------
    animate() {
      if (!this.renderer) return
      const now = Date.now()

      if (this.phase === 'showingWord') {
        const elapsed = now - this.phaseStart
        const TOTAL = this.WORD_FORM_MS + this.WORD_HOLD_MS

        // Seek speed ramps up during form, then stays high during hold
        let seekSpeed
        if (elapsed < this.WORD_FORM_MS) {
          const p = elapsed / this.WORD_FORM_MS
          seekSpeed = 0.2 + p * 0.2 // 0.2 → 0.4
        } else {
          seekSpeed = 0.45
        }

        for (let i = 0; i < this.NUM; i++) {
          const t = this.textTargets[i]
          this.positions[i * 3]     += (t.x - this.positions[i * 3])     * seekSpeed
          this.positions[i * 3 + 1] += (t.y - this.positions[i * 3 + 1]) * seekSpeed
          this.positions[i * 3 + 2] += (t.z - this.positions[i * 3 + 2]) * seekSpeed
          this.scales[i] = this.INTRO_SCALE
        }

        if (elapsed >= TOTAL) {
          this.currentWordIndex++
          if (this.currentWordIndex < this.WORDS.length) {
            // Next word: recompute targets, reset phase timer (same phase)
            this.computeTextTargets(this.WORDS[this.currentWordIndex])
            this.phaseStart = now
          } else {
            // Done with words → snapshot for morph
            this.morphStartPositions = new Float32Array(this.positions)
            this.morphStartScales = new Float32Array(this.scales)
            this.morphStartCamera = {
              x: this.camera.position.x,
              y: this.camera.position.y,
              z: this.camera.position.z,
            }
            this.phase = 'morphingToWave'
            this.phaseStart = now
          }
        }
      }

      else if (this.phase === 'morphingToWave') {
        const elapsed = now - this.phaseStart
        const p = Math.min(elapsed / this.MORPH_MS, 1.0)
        // Ease in-out cubic
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2

        // Advance the wave clock during the morph so by the time we hand off
        // to the wave phase, particles are already oscillating — no "stop
        // and start" pause between morph end and wave begin.
        this.waveCount += 0.05 + this.scrollFactor * 0.15

        let idx = 0
        for (let ix = 0; ix < this.AMOUNTX; ix++) {
          for (let iy = 0; iy < this.AMOUNTY; iy++) {
            const home = this.waveHome[idx]
            // Live wave target (where this particle would be in pure wave phase)
            const waveY = Math.sin((ix + this.waveCount) * 0.3) * 50 +
                          Math.sin((iy + this.waveCount) * 0.5) * 50
            const waveScale = (Math.sin((ix + this.waveCount) * 0.3) + 1) * 8 +
                              (Math.sin((iy + this.waveCount) * 0.5) + 1) * 8

            // Lerp from frozen text snapshot → live wave position.
            // Because waveY/waveScale advance every frame, the particles flow
            // straight into wave motion instead of pausing at y=0 first.
            this.positions[idx * 3]     = this.morphStartPositions[idx * 3]     + (home.x - this.morphStartPositions[idx * 3])     * e
            this.positions[idx * 3 + 1] = this.morphStartPositions[idx * 3 + 1] + (waveY  - this.morphStartPositions[idx * 3 + 1]) * e
            this.positions[idx * 3 + 2] = this.morphStartPositions[idx * 3 + 2] + (home.z - this.morphStartPositions[idx * 3 + 2]) * e
            this.scales[idx] = this.morphStartScales[idx] + (waveScale - this.morphStartScales[idx]) * e
            idx++
          }
        }

        // Camera lerp
        this.camera.position.x = this.morphStartCamera.x + (this.CAM_WAVE.x - this.morphStartCamera.x) * e
        this.camera.position.y = this.morphStartCamera.y + (this.CAM_WAVE.y - this.morphStartCamera.y) * e
        this.camera.position.z = this.morphStartCamera.z + (this.CAM_WAVE.z - this.morphStartCamera.z) * e
        this.camera.lookAt(0, 0, 0)

        if (p >= 1.0) {
          this.phase = 'wave'
          this.phaseStart = now
          // Page hand-off (caller drops container z-index, etc.)
          try { this.onIntroComplete() } catch (err) { console.warn(err) }
        }
      }

      else if (this.phase === 'wave') {
        if (!this.motionPaused) {
          let idx = 0
          for (let ix = 0; ix < this.AMOUNTX; ix++) {
            for (let iy = 0; iy < this.AMOUNTY; iy++) {
              const home = this.waveHome[idx]
              this.positions[idx * 3]     = home.x
              this.positions[idx * 3 + 1] =
                Math.sin((ix + this.waveCount) * 0.3) * 50 +
                Math.sin((iy + this.waveCount) * 0.5) * 50
              this.positions[idx * 3 + 2] = home.z
              this.scales[idx] =
                (Math.sin((ix + this.waveCount) * 0.3) + 1) * 8 +
                (Math.sin((iy + this.waveCount) * 0.5) + 1) * 8
              idx++
            }
          }
          this.waveCount += 0.05 + this.scrollFactor * 0.15
        }
        // If motionPaused: skip position updates so particles stay frozen.
        // We still fall through to render so the canvas stays visible.
      }

      this.particles.geometry.attributes.position.needsUpdate = true
      this.particles.geometry.attributes.scale.needsUpdate = true

      this.renderer.render(this.scene, this.camera)
      this.animationId = requestAnimationFrame(() => this.animate())
    }

    // Toggle particle motion on/off (called by the UI switch)
    setMotionPaused(paused) {
      this.motionPaused = paused
      // When resuming, advance phaseStart by however long we were paused so
      // the wave-ease-in doesn't restart from 0.
      if (!paused && this.phase === 'wave') {
        this.phaseStart = Date.now() - 9999 // skip straight past ease-in
      }
    }

    start() {
      if (!this.init()) return
      // Fix: if the page loaded while hidden (e.g. Safari URL-bar preload),
      // don't start the rAF loop yet. The visibilitychange handler will start
      // it with a fresh phaseStart once the page becomes visible, so the
      // "Welcome" word isn't missed.
      if (document.visibilityState !== 'hidden') {
        this.animate()
      }
    }

    destroy() {
      if (this.animationId) cancelAnimationFrame(this.animationId)
      if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler)
      if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler)
      if (this.visibilityHandler) document.removeEventListener('visibilitychange', this.visibilityHandler)
      if (this.renderer) {
        this.renderer.dispose()
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
        }
      }
    }
  }

  window.PinovioScene = PinovioScene
})()
