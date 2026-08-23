import { useEffect, useRef } from 'react'

/**
 * CortexScene — a living picture of manual work becoming automated.
 *
 * Slightly disordered "task rows" drift in from the left and are absorbed by
 * the input layer of a neural lattice. Each absorbed task fires a signal that
 * travels the network's connections, lighting edges and nodes as it passes,
 * and every completed signal emits a crisp, perfectly aligned row on the
 * right: the same work, returned ordered and done.
 *
 * Canvas 2D, no dependencies. DPR is capped and the loop pauses while hidden.
 */

const LAYERS = [5, 7, 7, 4]
const INK = [230, 236, 244]
const ACCENT = [63, 210, 192]

function hash(n) {
  const h = Math.sin(n * 127.1 + 311.7) * 43758.5453123
  return h - Math.floor(h)
}

function easeInOut(t) {
  return t * t * (3 - 2 * t)
}

function constrainDistribution(distribution, min = 0.05, max = 0.7) {
  const entries = [...distribution.entries()]
  const constrained = new Map(entries.map(([node]) => [node, min]))
  const available = new Set(entries.map(([node]) => node))
  let remaining = 1 - entries.length * min

  while (available.size > 0 && remaining > 0.000001) {
    const totalWeight = entries.reduce(
      (sum, [node, weight]) => sum + (available.has(node) ? weight : 0),
      0,
    )
    const capped = []

    for (const [node, weight] of entries) {
      if (!available.has(node)) continue
      const allocation = totalWeight > 0 ? remaining * (weight / totalWeight) : remaining / available.size
      if (constrained.get(node) + allocation > max) capped.push(node)
    }

    if (capped.length === 0) {
      for (const [node, weight] of entries) {
        if (!available.has(node)) continue
        const allocation = totalWeight > 0 ? remaining * (weight / totalWeight) : remaining / available.size
        constrained.set(node, constrained.get(node) + allocation)
      }
      break
    }

    for (const node of capped) {
      remaining -= max - constrained.get(node)
      constrained.set(node, max)
      available.delete(node)
    }
  }

  return constrained
}

/* Pre-rendered radial sprite so glows are cheap blits, not shadowBlur. */
function makeSprite(size, [r, g, b]) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  const half = size / 2
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`)
  grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.4)`)
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return c
}

function buildNetwork(w, h) {
  const narrow = w < 720
  const left = w * (narrow ? 0.21 : 0.47)
  const right = w * (narrow ? 0.73 : 0.88)
  const layers = LAYERS.map((count, li) => {
    const x = left + ((right - left) * li) / (LAYERS.length - 1)
    const span = Math.min(h * 0.82, count * (narrow ? 58 : 78))
    const top = h / 2 - span / 2
    return Array.from({ length: count }, (_, i) => ({
      x,
      y: count === 1 ? h / 2 : top + (span * i) / (count - 1),
      layer: li,
      glow: 0,
      activation: 0,
      targetActivation: 0,
      gain: 0.2 + hash(li * 97 + i * 43 + 11) ** 3 * 2.8,
      phase: hash(li * 31 + i * 7) * Math.PI * 2,
      out: [],
    }))
  })

  const edges = []
  for (let li = 0; li < layers.length - 1; li++) {
    for (const a of layers[li]) {
      for (const b of layers[li + 1]) {
        const edge = {
          a,
          b,
          glow: 0,
          rawWeight: 0.01 + hash(a.y * 4.3 + b.y * 7.1) ** 5 * 2,
        }
        edges.push(edge)
        a.out.push(edge)
      }
      const totalWeight = a.out.reduce((sum, edge) => sum + edge.rawWeight, 0)
      for (const edge of a.out) edge.weight = edge.rawWeight / totalWeight
    }
  }
  return { layers, edges }
}

function propagationFrom(node) {
  const segments = []
  let activations = new Map([[node, 1]])
  const layerActivations = [activations]

  for (let layer = 0; layer < LAYERS.length - 1; layer += 1) {
    const nextActivations = new Map()
    for (const [source, activation] of activations) {
      for (const edge of source.out) {
        const weight = activation * edge.weight
        segments.push({ edge, weight, start: layer * 0.68 })
        nextActivations.set(edge.b, (nextActivations.get(edge.b) || 0) + weight)
      }
    }
    let total = 0
    for (const [target, activation] of nextActivations) {
      const variedActivation = (activation * target.gain) ** 1.45
      nextActivations.set(target, variedActivation)
      total += variedActivation
    }
    for (const [target, activation] of nextActivations) {
      nextActivations.set(target, activation / total)
    }
    if (layer === LAYERS.length - 2) {
      activations = constrainDistribution(nextActivations)
    } else {
      activations = nextActivations
    }
    layerActivations.push(activations)
  }

  return {
    segments,
    outputs: activations,
    layerActivations,
    revealedLayers: new Set(),
    elapsed: 0,
    duration: (LAYERS.length - 1) * 0.68,
  }
}

function edgePoint(edge, u) {
  return {
    x: edge.a.x + (edge.b.x - edge.a.x) * u,
    y: edge.a.y + (edge.b.y - edge.a.y) * u,
  }
}

export default function CortexScene() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const accentSprite = makeSprite(48, ACCENT)

    let width = 0
    let height = 0
    let dpr = 1
    let network = { layers: [], edges: [] }
    let tasks = []
    let pulses = []
    let outputWeights = new Map()
    let nextTaskAt = 0.6
    let time = 0
    let lastFrame = 0
    let rafId = 0
    let running = false
    const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, width < 720 ? 1.5 : 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      network = buildNetwork(width, height)
      tasks = []
      pulses = []
      nextTaskAt = time + 0.4
      outputWeights = new Map()
      for (const node of network.layers[network.layers.length - 1]) {
        outputWeights.set(node, { value: 0, target: 0 })
      }
    }

    function spawnTask() {
      const narrow = width < 720
      const inputs = network.layers[0]
      const node = inputs[Math.floor(Math.random() * inputs.length)]
      tasks.push({
        node,
        fromX: narrow ? -32 : width * 0.34 + Math.random() * width * 0.07,
        fromY: height * 0.16 + Math.random() * height * 0.68,
        tilt: (Math.random() - 0.5) * 0.24,
        widths: narrow
          ? [22 + Math.random() * 16, 15 + Math.random() * 12]
          : [12 + Math.random() * 14, 9 + Math.random() * 10],
        t: 0,
        duration: 1.7 + Math.random() * 0.9,
      })
    }

    function drawTask(task) {
      const eased = easeInOut(task.t)
      const x = task.fromX + (task.node.x - task.fromX) * eased
      const y = task.fromY + (task.node.y - task.fromY) * eased
      const alpha = Math.min(1, task.t * 5) * (1 - Math.max(0, (task.t - 0.86) / 0.14))
      const scale = (width < 720 ? 1.2 : 1) * (1 - 0.4 * eased)

      ctx.save()
      ctx.translate(x, y)
      // Disorder straightens out as the row is drawn into the machine.
      ctx.rotate(task.tilt * (1 - eased))
      ctx.scale(scale, scale)
      ctx.globalAlpha = alpha * (width < 720 ? 0.58 : 0.28)
      ctx.fillStyle = `rgb(${ACCENT.join(',')})`
      ctx.fillRect(-4, -1.5, 3, 3)
      ctx.fillStyle = `rgb(${INK.join(',')})`
      ctx.globalAlpha = alpha * (width < 720 ? 0.68 : 0.4)
      ctx.fillRect(3, -4, task.widths[0], 1.5)
      ctx.globalAlpha = alpha * (width < 720 ? 0.46 : 0.26)
      ctx.fillRect(3, 2, task.widths[1], 1.5)
      ctx.restore()
    }

    function drawOutputBars() {
      const narrow = width < 720
      const barWidth = narrow ? 45 : 72
      const barHeight = narrow ? 3 : 4
      const gap = narrow ? 12 : 18

      for (const [node, weight] of outputWeights) {
        weight.value += (weight.target - weight.value) * 0.08
        const x = node.x + gap
        const y = node.y - barHeight / 2

        ctx.globalAlpha = 0.16
        ctx.fillStyle = `rgb(${INK.join(',')})`
        ctx.fillRect(x, y, barWidth, barHeight)
        ctx.globalAlpha = 0.82
        ctx.fillStyle = `rgb(${ACCENT.join(',')})`
        ctx.fillRect(x, y, barWidth * weight.value, barHeight)

        ctx.globalAlpha = 0.62
        ctx.fillStyle = `rgb(${INK.join(',')})`
        ctx.font = `${narrow ? 5 : 7}px ui-monospace, monospace`
        ctx.fillText(`${Math.round(weight.value * 100)}%`, x + barWidth + (narrow ? 3 : 5), y + barHeight)
      }
    }

    function frame(now) {
      const dt = Math.min((now - lastFrame) / 1000, 0.05)
      lastFrame = now
      time += dt

      parallax.x += (parallax.targetX - parallax.x) * 0.05
      parallax.y += (parallax.targetY - parallax.y) * 0.05

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.translate(parallax.x, parallax.y)

      const entry = easeInOut(Math.min(1, time / 1.6))

      // Intake stays deliberately sequential: a new piece of work only enters
      // after the previous signal has reached and updated the output layer.
      if (time >= nextTaskAt && tasks.length === 0 && pulses.length === 0) {
        spawnTask()
        nextTaskAt = Number.POSITIVE_INFINITY
      }
      for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i]
        task.t += dt / task.duration
        if (task.t >= 1) {
          task.node.glow = 1
          pulses.push(propagationFrom(task.node))
          tasks.splice(i, 1)
          continue
        }
        drawTask(task)
      }

      // Lattice edges, breathing faintly beneath the traffic.
      const breath = 0.5 + 0.5 * Math.sin(time * 0.45)
      for (const edge of network.edges) {
        ctx.beginPath()
        ctx.moveTo(edge.a.x, edge.a.y)
        ctx.lineTo(edge.b.x, edge.b.y)
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(${INK.join(',')}, ${(0.13 + breath * 0.035) * entry})`
        ctx.stroke()
        if (edge.glow > 0.02) {
          ctx.strokeStyle = `rgba(${ACCENT.join(',')}, ${edge.glow * 0.4 * entry})`
          ctx.stroke()
        }
        edge.glow *= Math.exp(-dt * 9)
      }

      // Weighted signals split across every available route, then recombine
      // at the next layer while preserving the total activation.
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i]
        pulse.elapsed += dt
        for (let layer = 0; layer < pulse.layerActivations.length; layer += 1) {
          if (pulse.elapsed < layer * 0.68 || pulse.revealedLayers.has(layer)) continue
          const activations = pulse.layerActivations[layer]
          for (const node of network.layers[layer]) {
            node.targetActivation = activations.get(node) || 0
          }
          pulse.revealedLayers.add(layer)
        }
        if (pulse.elapsed >= pulse.duration) {
          for (const [node, value] of pulse.outputs) {
            node.glow = Math.max(node.glow, value)
            outputWeights.get(node).target = value
          }
          pulses.splice(i, 1)
          nextTaskAt = time + 0.7
          continue
        }
        for (const segment of pulse.segments) {
          const local = (pulse.elapsed - segment.start) / 0.68
          if (local < 0 || local > 1) continue
          const strength = Math.min(1, segment.weight * 3.2)
          segment.edge.glow = Math.max(segment.edge.glow, strength)
          if (local < 0.12) {
            segment.edge.a.glow = Math.max(segment.edge.a.glow, strength)
          }
          if (local > 0.88) {
            segment.edge.b.glow = Math.max(segment.edge.b.glow, strength)
          }
          const p = edgePoint(segment.edge, easeInOut(local))
          const radius = 4 + strength * 5
          ctx.globalAlpha = (0.25 + strength * 0.65) * entry
          ctx.drawImage(accentSprite, p.x - radius, p.y - radius, radius * 2, radius * 2)
          ctx.globalAlpha = (0.35 + strength * 0.65) * entry
          ctx.fillStyle = `rgb(${ACCENT.join(',')})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 0.7 + strength * 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Nodes: quiet circles that breathe, brightening as signals pass.
      for (const layer of network.layers) {
        for (const node of layer) {
          node.activation += (node.targetActivation - node.activation) * Math.min(1, dt * 12)
          node.targetActivation *= Math.exp(-dt * 5)
          const pulseBreath = 0.5 + 0.5 * Math.sin(time * 0.9 + node.phase)
          const intensity = Math.max(node.activation, node.glow * 0.45)
          const r = (2 + pulseBreath * 0.6 + intensity * 4.6) * entry
          if (intensity > 0.025) {
            ctx.globalAlpha = Math.min(0.68, intensity * 1.2) * entry
            const gr = 8 + intensity * 16
            ctx.drawImage(accentSprite, node.x - gr, node.y - gr, gr * 2, gr * 2)
          }
          ctx.globalAlpha = Math.min(
            1,
            0.22 + pulseBreath * 0.1 + node.activation * 1.45 + node.glow * 0.28,
          ) * entry
          ctx.fillStyle =
            intensity > 0.06 ? `rgb(${ACCENT.join(',')})` : `rgb(${INK.join(',')})`
          ctx.beginPath()
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
          ctx.fill()
          node.glow *= Math.exp(-dt * 9)
        }
      }

      // The four output bars show the latest classification distribution.
      drawOutputBars()

      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(frame)
    }

    function start() {
      if (running || document.hidden) return
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

    function onPointerMove(event) {
      const rect = canvas.getBoundingClientRect()
      parallax.targetX = (0.5 - (event.clientX - rect.left) / rect.width) * 10
      parallax.targetY = (0.5 - (event.clientY - rect.top) / rect.height) * 6
      // Wake nearby nodes so the lattice acknowledges the visitor.
      const px = event.clientX - rect.left - parallax.x
      const py = event.clientY - rect.top - parallax.y
      for (const layer of network.layers) {
        for (const node of layer) {
          const d = Math.hypot(node.x - px, node.y - py)
          if (d < 90) node.glow = Math.max(node.glow, (1 - d / 90) * 0.7)
        }
      }
    }

    resize()
    start()

    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(canvas.parentElement)
    canvas.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      resizeObserver.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div className="cortex-scene" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
