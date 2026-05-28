import { useEffect, useRef, useState, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react'

/**
 * ImageCropper — zero-dependency canvas-based image cropper
 *
 * Props:
 *  src        — image src (URL or base64)
 *  aspectRatio — e.g. 3/4
 *  onCrop     — callback(croppedBase64: string)
 *  onCancel   — callback()
 *  label      — title shown in modal header
 */
export default function ImageCropper({ src, aspectRatio = 3 / 4, onCrop, onCancel, label = 'Crop Photo' }) {
  const canvasRef   = useRef(null)
  const imgRef      = useRef(null)
  const stateRef    = useRef({
    scale:    1,
    minScale: 1,
    offsetX:  0,
    offsetY:  0,
    dragging: false,
    lastX:    0,
    lastY:    0,
  })
  const [scale, setScale]     = useState(1)
  const [loaded, setLoaded]   = useState(false)
  const rafRef                = useRef(null)

  // ── Canvas dimensions ──────────────────────────────────────────
  const CANVAS_W = 360
  const CANVAS_H = Math.round(CANVAS_W / aspectRatio)

  // ── Draw frame ─────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img    = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    const s   = stateRef.current

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    // Draw image
    const drawW = img.naturalWidth  * s.scale
    const drawH = img.naturalHeight * s.scale
    ctx.drawImage(img, s.offsetX, s.offsetY, drawW, drawH)

    // Overlay: darken outside crop area (full canvas IS the crop area here)
    // Draw a subtle grid overlay
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth   = 0.5
    for (let x = CANVAS_W / 3; x < CANVAS_W; x += CANVAS_W / 3) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke()
    }
    for (let y = CANVAS_H / 3; y < CANVAS_H; y += CANVAS_H / 3) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke()
    }

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth   = 1
    ctx.strokeRect(0, 0, CANVAS_W, CANVAS_H)
  }, [CANVAS_W, CANVAS_H])

  // ── Clamp offset so image always covers canvas ─────────────────
  const clamp = useCallback(() => {
    const img = imgRef.current
    if (!img) return
    const s    = stateRef.current
    const drawW = img.naturalWidth  * s.scale
    const drawH = img.naturalHeight * s.scale

    const maxX = 0
    const minX = CANVAS_W - drawW
    const maxY = 0
    const minY = CANVAS_H - drawH

    s.offsetX = Math.min(maxX, Math.max(minX, s.offsetX))
    s.offsetY = Math.min(maxY, Math.max(minY, s.offsetY))
  }, [CANVAS_W, CANVAS_H])

  // ── Init image ─────────────────────────────────────────────────
  useEffect(() => {
    const img  = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img

      // Compute minScale so image fills canvas
      const scaleX   = CANVAS_W / img.naturalWidth
      const scaleY   = CANVAS_H / img.naturalHeight
      const minScale = Math.max(scaleX, scaleY)

      stateRef.current.scale    = minScale
      stateRef.current.minScale = minScale

      // Center
      stateRef.current.offsetX = (CANVAS_W - img.naturalWidth  * minScale) / 2
      stateRef.current.offsetY = (CANVAS_H - img.naturalHeight * minScale) / 2

      setScale(minScale)
      setLoaded(true)
      draw()
    }
    img.src = src
  }, [src, CANVAS_W, CANVAS_H, draw])

  // ── Redraw when loaded ─────────────────────────────────────────
  useEffect(() => {
    if (loaded) draw()
  }, [loaded, draw])

  // ── Pointer events ─────────────────────────────────────────────
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e) => {
    e.preventDefault()
    const pos = getPos(e)
    stateRef.current.dragging = true
    stateRef.current.lastX    = pos.x
    stateRef.current.lastY    = pos.y
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
  }

  const onPointerMove = (e) => {
    e.preventDefault()
    const s = stateRef.current
    if (!s.dragging) return
    const pos = getPos(e)
    s.offsetX += pos.x - s.lastX
    s.offsetY += pos.y - s.lastY
    s.lastX    = pos.x
    s.lastY    = pos.y
    clamp()
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }

  const onPointerUp = () => {
    stateRef.current.dragging = false
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
  }

  // ── Wheel zoom ─────────────────────────────────────────────────
  const onWheel = (e) => {
    e.preventDefault()
    const s       = stateRef.current
    const img     = imgRef.current
    if (!img) return

    const rect    = canvasRef.current.getBoundingClientRect()
    const mouseX  = e.clientX - rect.left
    const mouseY  = e.clientY - rect.top

    const delta   = e.deltaY < 0 ? 1.08 : 0.93
    const newScale = Math.max(s.minScale, Math.min(s.scale * delta, s.minScale * 5))

    // Zoom toward mouse position
    const ratio   = newScale / s.scale
    s.offsetX     = mouseX - ratio * (mouseX - s.offsetX)
    s.offsetY     = mouseY - ratio * (mouseY - s.offsetY)
    s.scale       = newScale

    clamp()
    setScale(newScale)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }

  // ── Zoom buttons ───────────────────────────────────────────────
  const zoom = (factor) => {
    const s   = stateRef.current
    const img = imgRef.current
    if (!img) return

    const newScale = Math.max(s.minScale, Math.min(s.scale * factor, s.minScale * 5))
    const ratio    = newScale / s.scale
    s.offsetX      = CANVAS_W / 2 - ratio * (CANVAS_W / 2 - s.offsetX)
    s.offsetY      = CANVAS_H / 2 - ratio * (CANVAS_H / 2 - s.offsetY)
    s.scale        = newScale

    clamp()
    setScale(newScale)
    requestAnimationFrame(draw)
  }

  // ── Reset ──────────────────────────────────────────────────────
  const reset = () => {
    const s   = stateRef.current
    const img = imgRef.current
    if (!img) return

    s.scale   = s.minScale
    s.offsetX = (CANVAS_W - img.naturalWidth  * s.minScale) / 2
    s.offsetY = (CANVAS_H - img.naturalHeight * s.minScale) / 2

    setScale(s.minScale)
    requestAnimationFrame(draw)
  }

  // ── Export cropped image ───────────────────────────────────────
  const handleCrop = () => {
    const canvas  = canvasRef.current
    if (!canvas) return
    // Export at 2x for retina quality
    const out     = document.createElement('canvas')
    out.width     = CANVAS_W * 2
    out.height    = CANVAS_H * 2
    const ctx     = out.getContext('2d')
    const s       = stateRef.current
    const img     = imgRef.current

    ctx.drawImage(
      img,
      s.offsetX * 2,
      s.offsetY * 2,
      img.naturalWidth  * s.scale * 2,
      img.naturalHeight * s.scale * 2,
    )
    onCrop(out.toDataURL('image/jpeg', 0.92))
  }

  const zoomPct = loaded
    ? Math.round((stateRef.current.scale / stateRef.current.minScale - 1) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>

      <div className="bg-[#0e0e0e] border border-[#222] w-full max-w-md flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div>
            <div className="font-display text-sm uppercase tracking-widest text-white">{label}</div>
            <div className="font-mono text-[9px] text-gray-600 mt-0.5 uppercase tracking-wider">
              Drag to reposition · Scroll to zoom
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-600 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex items-center justify-center p-6 bg-[#080808]">
          {!loaded && (
            <div className="flex items-center justify-center" style={{ width: CANVAS_W, height: CANVAS_H }}>
              <div className="font-mono text-xs text-gray-700">Loading...</div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              display: loaded ? 'block' : 'none',
              cursor: 'grab',
              touchAction: 'none',
              maxWidth: '100%',
            }}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
            onWheel={onWheel}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-t border-[#1a1a1a] flex items-center justify-between gap-4">
          {/* Zoom controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => zoom(0.9)}
              className="w-8 h-8 border border-[#222] flex items-center justify-center text-gray-500 hover:text-white hover:border-[#444] transition-colors"
            >
              <ZoomOut size={13} />
            </button>
            <span className="font-mono text-[10px] text-gray-600 w-12 text-center tabular-nums">
              +{zoomPct}%
            </span>
            <button
              onClick={() => zoom(1.1)}
              className="w-8 h-8 border border-[#222] flex items-center justify-center text-gray-500 hover:text-white hover:border-[#444] transition-colors"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={reset}
              className="w-8 h-8 border border-[#222] flex items-center justify-center text-gray-500 hover:text-white hover:border-[#444] transition-colors ml-1"
              title="Reset"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="font-mono text-[10px] uppercase tracking-wider text-gray-600 hover:text-white px-4 py-2 border border-[#222] hover:border-[#444] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="font-mono text-[10px] uppercase tracking-wider bg-white text-black px-4 py-2 flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <Check size={12} /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
