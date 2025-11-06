// Grid configuration (must match your generated frames)
const P_MIN = -15
const P_MAX = 15
const STEP = 3

const GRID_STEPS = Math.round((P_MAX - P_MIN) / STEP)
const GRID_COUNT = GRID_STEPS + 1

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function quantizeToGrid(val) {
  const raw = P_MIN + ((val + 1) * (P_MAX - P_MIN)) / 2 // [-1,1] -> [-15,15]
  const snapped = Math.round(raw / STEP) * STEP
  return clamp(snapped, P_MIN, P_MAX)
}

function toColumn(px) {
  const idx = Math.round((px - P_MIN) / STEP)
  return clamp(idx, 0, GRID_STEPS)
}

function toRow(py) {
  const idx = Math.round((P_MAX - py) / STEP) // invert so positive Y is up
  return clamp(idx, 0, GRID_STEPS)
}

function updateDebug(debugEl, x, y, px, py, col, row) {
  if (!debugEl) return
  debugEl.innerHTML = [
    `Mouse: (${Math.round(x)}, ${Math.round(y)})`,
    `Quantized: px=${px}, py=${py}`,
    `Sprite: col=${col}, row=${row}`,
  ].join('<br/>')
}

function resolveSpritePath(container) {
  const sprite = container.dataset.sprite || ''
  if (sprite) {
    return sprite
  }
  const basePath = container.dataset.basePath || '/faces/'
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`
  return `${normalizedBase}sprite.webp`
}

function initializeFaceTracker(container) {
  const showDebug = String(container.dataset.debug || 'false') === 'true'

  const spriteEl = document.createElement('div')
  spriteEl.className = 'face-sprite'
  spriteEl.setAttribute('aria-hidden', 'true')
  container.appendChild(spriteEl)

  const spritePath = resolveSpritePath(container)
  spriteEl.style.backgroundImage = `url(${spritePath})`
  spriteEl.style.backgroundSize = `${GRID_COUNT * 100}% ${GRID_COUNT * 100}%`

  let debugEl = null
  if (showDebug) {
    debugEl = document.createElement('div')
    debugEl.className = 'face-debug'
    container.appendChild(debugEl)
  }

  let lastCol = -1
  let lastRow = -1
  let pending = false
  let target = null

  function applyFrame(clientX, clientY) {
    const rect = container.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const nx = (clientX - centerX) / (rect.width / 2)
    const ny = (centerY - clientY) / (rect.height / 2)

    const clampedX = clamp(nx, -1, 1)
    const clampedY = clamp(ny, -1, 1)

    const px = quantizeToGrid(clampedX)
    const py = quantizeToGrid(clampedY)

    const col = toColumn(px)
    const row = toRow(py)
    if (col !== lastCol || row !== lastRow) {
      lastCol = col
      lastRow = row
      const colPercent = (col / GRID_STEPS) * 100
      const rowPercent = (row / GRID_STEPS) * 100
      spriteEl.style.backgroundPosition = `${colPercent}% ${rowPercent}%`
    }

    updateDebug(
      debugEl,
      clientX - rect.left,
      clientY - rect.top,
      px,
      py,
      col,
      row
    )
  }

  function flushFrame() {
    pending = false
    if (!target) return
    applyFrame(target.x, target.y)
  }

  function queueFrame(clientX, clientY) {
    target = { x: clientX, y: clientY }
    if (!pending) {
      pending = true
      requestAnimationFrame(flushFrame)
    }
  }

  function handleMouseMove(e) {
    queueFrame(e.clientX, e.clientY)
  }

  function handleTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0]
      queueFrame(t.clientX, t.clientY)
    }
  }

  // Track pointer anywhere on the page
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('touchmove', handleTouchMove, { passive: true })

  // Initialize at center
  const rect = container.getBoundingClientRect()
  target = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
  applyFrame(target.x, target.y)
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll('.face-tracker')
    .forEach((el) => initializeFaceTracker(el))
})
