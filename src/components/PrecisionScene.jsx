import { useEffect, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
} from 'three'

const POINT_COUNT = 1600

function createPointCloud(isDark) {
  const positions = new Float32Array(POINT_COUNT * 3)
  const colors = new Float32Array(POINT_COUNT * 3)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < POINT_COUNT; i += 1) {
    const t = i / (POINT_COUNT - 1)
    const y = 1 - t * 2
    const radius = Math.sqrt(1 - y * y)
    const theta = goldenAngle * i
    const ripple = 1 + 0.075 * Math.sin(theta * 5 + y * 9)

    positions[i * 3] = Math.cos(theta) * radius * ripple
    positions[i * 3 + 1] = y * ripple
    positions[i * 3 + 2] = Math.sin(theta) * radius * ripple

    const intensity = 0.32 + 0.45 * (1 - Math.abs(y))
    const brightness = isDark ? intensity + 0.2 : intensity
    colors[i * 3] = brightness
    colors[i * 3 + 1] = brightness * (isDark ? 0.98 : 0.96)
    colors[i * 3 + 2] = brightness * (isDark ? 0.88 : 0.82)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  return geometry
}

function makeRing(radius, rotation, color, opacity) {
  const geometry = new TorusGeometry(radius, 0.0035, 4, 180)
  const material = new MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
  })
  const ring = new Mesh(geometry, material)
  ring.rotation.set(rotation[0], rotation[1], rotation[2])
  ring.userData.baseOpacity = opacity
  return ring
}

/**
 * A lightweight WebGL precision field. The object has no textures, shadows or
 * post-processing; DPR is capped and it stops while hidden.
 */
export default function PrecisionScene({ appearance }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const scene = new Scene()
    const camera = new PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0, 4.1)

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: Math.min(window.devicePixelRatio || 1, 1.5) <= 1.5,
      powerPreference: 'high-performance',
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const field = new Group()
    field.rotation.set(-0.28, 0.38, 0)
    scene.add(field)

    const isDark = appearance === 'dark'
    const cloud = new Points(
      createPointCloud(isDark),
      new PointsMaterial({
        size: 0.012,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    )
    field.add(cloud)

    const ringGroup = new Group()
    ringGroup.add(makeRing(1.16, [0, 0.22, 0.12], isDark ? 0xe2c83f : 0xd6b92c, 0.88))
    ringGroup.add(makeRing(0.84, [1.04, 0.3, 0.2], isDark ? 0xf1f0e8 : 0x1d1c18, 0.37))
    ringGroup.add(makeRing(1.42, [0.5, 0.08, 0.9], isDark ? 0xf1f0e8 : 0x1d1c18, 0.19))
    field.add(ringGroup)

    const rotation = {
      pitch: 0,
      yaw: 0,
      targetPitch: 0,
      targetYaw: 0,
      lastX: 0,
      lastY: 0,
      dragging: false,
    }
    let frame = 0
    let active = false
    let sceneElapsed = 0
    let lastFrame = performance.now()

    function resize() {
      const { width, height } = mount.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    function render(now) {
      if (!active) return
      const delta = Math.min((now - lastFrame) / 1000, 0.05)
      lastFrame = now
      sceneElapsed += delta
      const entry = Math.min(1, sceneElapsed / 1.65)
      const easedEntry = 1 - (1 - entry) ** 3
      rotation.yaw += (rotation.targetYaw - rotation.yaw) * 0.1
      rotation.pitch += (rotation.targetPitch - rotation.pitch) * 0.1

      field.scale.setScalar(0.38 + easedEntry * 0.62)
      field.rotation.y = 0.38 + rotation.yaw + sceneElapsed * 0.055 + (1 - easedEntry) * 1.1
      field.rotation.x = -0.28 + rotation.pitch + Math.sin(sceneElapsed * 0.3) * 0.035
      ringGroup.rotation.z = sceneElapsed * 0.08 + (1 - easedEntry) * -0.75
      cloud.rotation.y = sceneElapsed * 0.022
      cloud.material.opacity = 0.92 * easedEntry
      ringGroup.children.forEach((ring) => {
        ring.material.opacity = ring.userData.baseOpacity * easedEntry
      })

      renderer.render(scene, camera)
      frame = requestAnimationFrame(render)
    }

    function startAnimation() {
      if (active || document.hidden) return
      active = true
      lastFrame = performance.now()
      frame = requestAnimationFrame(render)
    }

    function stopAnimation() {
      active = false
      cancelAnimationFrame(frame)
    }

    function onPointerDown(event) {
      rotation.dragging = true
      rotation.lastX = event.clientX
      rotation.lastY = event.clientY
      mount.setPointerCapture(event.pointerId)
    }

    function onPointerMove(event) {
      if (!rotation.dragging) return
      const movementX = event.clientX - rotation.lastX
      const movementY = event.clientY - rotation.lastY
      rotation.lastX = event.clientX
      rotation.lastY = event.clientY
      rotation.targetYaw += movementX * 0.008
      rotation.targetPitch = Math.max(-0.7, Math.min(0.7, rotation.targetPitch + movementY * 0.006))
    }

    function onPointerUp(event) {
      rotation.dragging = false
      if (mount.hasPointerCapture(event.pointerId)) mount.releasePointerCapture(event.pointerId)
    }

    function onVisibilityChange() {
      if (document.hidden) stopAnimation()
      else startAnimation()
    }

    resize()
    startAnimation()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    mount.addEventListener('pointerdown', onPointerDown)
    mount.addEventListener('pointermove', onPointerMove, { passive: true })
    mount.addEventListener('pointerup', onPointerUp)
    mount.addEventListener('pointercancel', onPointerUp)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      stopAnimation()
      resizeObserver.disconnect()
      mount.removeEventListener('pointerdown', onPointerDown)
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerup', onPointerUp)
      mount.removeEventListener('pointercancel', onPointerUp)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      cloud.geometry.dispose()
      cloud.material.dispose()
      ringGroup.children.forEach((ring) => {
        ring.geometry.dispose()
        ring.material.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [appearance])

  return <div ref={mountRef} className="precision-scene" aria-hidden="true" />
}
