import { useEffect, useRef } from 'react'

/**
 * DotField — a "living computational atlas".
 *
 * Dots sit on a precise, orderly grid; the life comes from light rather than
 * position. A slowly drifting noise field flows through the grid as regions
 * of brightness (an abstract, ever-morphing terrain), a long diagonal shimmer
 * wave sweeps across it, and each dot breathes on its own 20–40 second cycle.
 * The cursor illuminates nearby dots in white, leaving a soft residual
 * luminance trail. Occasionally a faint route glows and fades.
 *
 * Pauses whenever the page is hidden. DPR is capped and grid density scales
 * down on small screens.
 */

/* Deterministic hash noise — no dependencies. */
function hash2(x, y) {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return h - Math.floor(h)
}

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function valueNoise(x, y) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  const u = smoothstep(xf)
  const v = smoothstep(yf)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

/* Two octaves — evaluated per dot per frame, so kept deliberately cheap. */
function fbm(x, y) {
  return valueNoise(x, y) * 0.65 + valueNoise(x * 2.31 + 5.2, y * 2.31 + 1.3) * 0.35
}

/* Pre-render a soft circular sprite so per-frame drawing is a cheap blit. */
function makeSprite(size, r, g, b) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  const half = size / 2
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`)
  grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.45)`)
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return c
}

function buildPoints(w, h, coarse) {
  // Dense enough to feel like a computational surface while keeping the
  // per-frame canvas work comfortably below the cost of a particle system.
  const gap = coarse ? 24 : 18
  const margin = 170
  const cx = w / 2
  const cy = h * 0.44
  const points = []

  for (let gy = -margin; gy < h + margin; gy += gap) {
    for (let gx = -margin; gx < w + margin; gx += gap) {
      // Dim (never remove) dots inside the central reading column, so the
      // grid stays continuous while the typography keeps its clarity.
      const dx = (gx - cx) / (w * 0.4)
      const dy = (gy - cy) / (h * 0.42)
      const centerDist = dx * dx + dy * dy
      const mask = centerDist >= 1 ? 1 : 0.14 + 0.86 * smoothstep(centerDist)

      points.push({
        x: gx,
        y: gy,
        mask,
        // A small local offset lets the shared field-wide breath feel organic
        // without breaking the grid's disciplined rhythm.
        phase: hash2(gx, gy) * 0.72,
        glow: 0,
        disorderX: 0,
        disorderY: 0,
      })
    }
  }
  return points
}

function makeRoute(points, w, h, now) {
  if (points.length < 2) return null
  let a = null
  let b = null
  for (let attempt = 0; attempt < 24; attempt++) {
    const p = points[Math.floor(Math.random() * points.length)]
    const q = points[Math.floor(Math.random() * points.length)]
    if (p.mask < 0.85 || q.mask < 0.85) continue
    const d = Math.hypot(p.x - q.x, p.y - q.y)
    const min = Math.min(w, h) * 0.25
    const max = Math.min(w, h) * 0.75
    if (d > min && d < max) {
      a = p
      b = q
      break
    }
  }
  if (!a) return null

  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  // Perpendicular bow so routes arc like great circles, not straight wires.
  const nx = -(b.y - a.y) / dist
  const ny = (b.x - a.x) / dist
  const bow = dist * (Math.random() * 0.36 - 0.18)
  const cx = mx + nx * bow
  const cy = my + ny * bow

  const count = Math.max(14, Math.min(48, Math.round(dist / 16)))
  const samples = []
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const u = 1 - t
    samples.push({
      x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
      y: u * u * a.y + 2 * u * t * cy + t * t * b.y,
    })
  }
  return { samples, born: now, duration: 9 + Math.random() * 4 }
}

export default function DotField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const greySprite = makeSprite(32, 236, 234, 230)
    const whiteSprite = makeSprite(32, 255, 255, 255)
    const yellowSprite = makeSprite(32, 241, 220, 66)

    let points = []
    let routes = []
    let nextRouteAt = 5
    let width = 0
    let height = 0
    let dpr = 1
    let rafId = 0
    let running = false
    let time = 0
    let lastFrame = 0
    let scrollShift = 0

    const pointer = {
      x: -9999,
      y: -9999,
      sx: -9999,
      sy: -9999,
      strength: 0,
      targetStrength: 0,
      motion: 0,
      directionX: 0,
      directionY: 0,
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      const coarse = width < 720
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      points = buildPoints(width, height, coarse)
      routes = []
    }

    function drawFrame(animate) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const lightRadius = 170
      const flowRadius = 340
      // A one-time opening arrival: dots begin at deterministic random
      // positions across the viewport, then resolve into the fixed grid.
      const intro = animate ? smoothstep(Math.min(1, time / 3.8)) : 1
      const introScale = 0.16 + 0.84 * intro
      const introAlpha = 0.2 + 0.8 * intro
      const centerX = width / 2
      const centerY = height / 2
      const introRotation = (1 - intro) * 0.9
      const rotationCos = Math.cos(introRotation)
      const rotationSin = Math.sin(introRotation)
      const px = pointer.sx
      const py = pointer.sy - scrollShift
      const strength = pointer.strength
      const motion = pointer.motion

      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        const offsetX = p.x - centerX
        const offsetY = p.y - centerY
        const rotatedX = offsetX * rotationCos - offsetY * rotationSin
        const rotatedY = offsetX * rotationSin + offsetY * rotationCos
        const orderedX = centerX + rotatedX * introScale
        const orderedY = centerY + rotatedY * introScale
        const randomX = hash2(p.x * 1.73, p.y * 2.19) * width
        const randomY = hash2(p.x * 3.11 + 8.7, p.y * 1.37 + 4.2) * height
        const arrivalX = randomX + (orderedX - randomX) * intro
        const arrivalY = randomY + (orderedY - randomY) * intro
        // Even in equilibrium, the field has a near-imperceptible life.
        const ambientX = animate ? Math.sin(time * 0.14 + p.y * 0.012) * 0.75 : 0
        const ambientY = animate ? Math.cos(time * 0.11 + p.x * 0.01) * 0.75 : 0
        let displayX = arrivalX + ambientX + p.disorderX
        let displayY = arrivalY + ambientY + p.disorderY

        // Terrain of light: the noise field scrolls very slowly, so bright
        // regions flow through the fixed grid like weather systems.
        const elevation = fbm(p.x * 0.0032 + time * 0.013, p.y * 0.0032 + time * 0.005)
        const land = Math.min(1, Math.max(0, (elevation - 0.38) / 0.36))

        // A clearly perceptible, coordinated 18-second inhale/exhale. A
        // restrained local offset retains a natural quality without turning
        // the field into thousands of independently flickering particles.
        const breathe = 0.5 + 0.5 * Math.sin(time * 0.35 + p.phase)
        // A long diagonal shimmer sweeping across the whole field.
        const shimmer = 0.5 + 0.5 * Math.sin(p.x * 0.0055 + p.y * 0.0038 - time * 0.22)

        // Cursor: a pure white-light interaction. Each point stores its own
        // glow, allowing the light to linger after the cursor has passed.
        let targetGlow = 0
        if (animate && strength > 0.01) {
          const ddx = displayX - px
          const ddy = displayY - py
          const d = Math.hypot(ddx, ddy)
          if (d < lightRadius) {
            targetGlow = (1 - d / lightRadius) ** 2 * strength
          }
          // A cursor motion behaves like a paddle moving through water:
          // nearby dots are pulled in its travel direction, strongest at the
          // source and softly attenuated through the surrounding grid.
          if (intro > 0.96 && motion > 0.01 && d < flowRadius) {
            const influence = (1 - d / flowRadius) ** 2 * motion * 10
            p.disorderX += pointer.directionX * influence
            p.disorderY += pointer.directionY * influence
          }
        }
        // Spring-like healing restores the orderly grid after each wake.
        p.disorderX *= 0.95
        p.disorderY *= 0.95
        p.disorderX = Math.max(-52, Math.min(52, p.disorderX))
        p.disorderY = Math.max(-52, Math.min(52, p.disorderY))
        displayX = arrivalX + ambientX + p.disorderX
        displayY = arrivalY + ambientY + p.disorderY
        const glowEase = targetGlow > p.glow ? 0.24 : 0.014
        p.glow += (targetGlow - p.glow) * glowEase
        const highlight = p.glow

        const alpha =
          (0.04 + land * 0.42) * (0.32 + 0.92 * breathe) * (0.72 + 0.28 * shimmer) * p.mask +
          highlight * 0.14 * p.mask

        // The radius grows and contracts with the field-wide breath.
        const size = (0.85 + land * 1.05 + 1.05 * breathe + highlight * 0.65) * (0.55 + 0.45 * intro)
        const x = displayX - size
        const y = displayY + scrollShift - size

        // The atlas remains subordinate to the page's typography.
        ctx.globalAlpha = Math.min(alpha * introAlpha, 0.2)
        ctx.drawImage(greySprite, x, y, size * 2, size * 2)

        if (highlight > 0.02) {
          // A restrained warm-white halo and point, deliberately separate
          // from the yellow route/UI accent and soft enough for readable text.
          ctx.globalAlpha = Math.min(highlight * 0.2, 0.2)
          ctx.drawImage(whiteSprite, x, y, size * 2, size * 2)
          ctx.fillStyle = '#f5f3ee'
          ctx.globalAlpha = Math.min(highlight * 0.26, 0.26)
          ctx.beginPath()
          ctx.arc(displayX, displayY + scrollShift, Math.max(0.5, size * 0.33), 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (animate) {
        for (let i = routes.length - 1; i >= 0; i--) {
          const route = routes[i]
          const progress = (time - route.born) / route.duration
          if (progress >= 1) {
            routes.splice(i, 1)
            continue
          }
          // Overall envelope: fade in, hold softly, fade out.
          const envelope = Math.sin(Math.PI * progress) ** 1.5
          const head = smoothstep(Math.min(1, progress * 1.45))
          const s = route.samples
          for (let j = 0; j < s.length; j++) {
            const st = j / (s.length - 1)
            const lit = head - st
            if (lit <= 0) continue
            const local = Math.min(1, lit * 4) * envelope
            if (local < 0.01) continue
            ctx.globalAlpha = local * 0.68
            const rr = 2.2
            ctx.drawImage(yellowSprite, s[j].x - rr, s[j].y + scrollShift - rr, rr * 2, rr * 2)
          }
        }
      }

      ctx.globalAlpha = 1
    }

    function frame(now) {
      const dt = Math.min((now - lastFrame) / 1000, 0.05)
      lastFrame = now
      time += dt

      pointer.strength += (pointer.targetStrength - pointer.strength) * 0.06
      pointer.motion *= 0.9
      // The light trails the cursor slightly, like a lamp on a gimbal.
      pointer.sx += (pointer.x - pointer.sx) * 0.12
      pointer.sy += (pointer.y - pointer.sy) * 0.12

      if (time >= nextRouteAt && routes.length < 2) {
        const route = makeRoute(points, width, height, time)
        if (route) routes.push(route)
        nextRouteAt = time + 9 + Math.random() * 9
      }

      drawFrame(true)
      rafId = requestAnimationFrame(frame)
    }

    function start() {
      if (running) return
      running = true
      lastFrame = performance.now()
      rafId = requestAnimationFrame(frame)
    }

    function stop() {
      running = false
      cancelAnimationFrame(rafId)
    }

    function onVisibility() {
      if (document.hidden) stop()
      else start()
    }

    function onPointerMove(e) {
      if (pointer.x > -999) {
        const velocityX = e.clientX - pointer.x
        const velocityY = e.clientY - pointer.y
        const velocity = Math.hypot(velocityX, velocityY)
        pointer.motion = Math.min(1, velocity / 36)
        if (velocity > 0.01) {
          pointer.directionX = velocityX / velocity
          pointer.directionY = velocityY / velocity
        }
      }
      pointer.x = e.clientX
      pointer.y = e.clientY
      if (pointer.sx < -999) {
        pointer.sx = e.clientX
        pointer.sy = e.clientY
      }
      pointer.targetStrength = 1
    }

    function onPointerLeave() {
      pointer.targetStrength = 0
    }

    function onScroll() {
      // The atlas answers the scroll at a fraction of its speed — barely
      // perceptible parallax, generous margins prevent exposed edges.
      scrollShift = -window.scrollY * 0.028
    }

    let resizeTimer = 0
    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 160)
    }

    resize()
    start()

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className="dot-field" aria-hidden="true" />
}
