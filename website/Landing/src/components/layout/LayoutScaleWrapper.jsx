import { useEffect, useRef, useState } from 'react'

const BASE_WIDTH = 1440
const DESKTOP_SCALE_BREAKPOINT = 1200
const MIN_SCALE = 0.86
const MAX_SCALE = 1

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function LayoutScaleWrapper({ children }) {
  const canvasRef = useRef(null)
  const [scaleState, setScaleState] = useState({
    enabled: false,
    scale: 1,
    canvasHeight: 0,
  })

  useEffect(() => {
    function measureCanvas() {
      if (!canvasRef.current) {
        return
      }

      const canvasHeight = canvasRef.current.offsetHeight
      setScaleState((currentState) => {
        if (currentState.canvasHeight === canvasHeight) {
          return currentState
        }

        return {
          ...currentState,
          canvasHeight,
        }
      })
    }

    function updateScale() {
      const viewportWidth = window.innerWidth
      const shouldScale = viewportWidth >= DESKTOP_SCALE_BREAKPOINT && viewportWidth < BASE_WIDTH
      const nextScale = shouldScale ? clamp(viewportWidth / BASE_WIDTH, MIN_SCALE, MAX_SCALE) : 1

      setScaleState((currentState) => {
        if (currentState.enabled === shouldScale && currentState.scale === nextScale) {
          return currentState
        }

        return {
          ...currentState,
          enabled: shouldScale,
          scale: nextScale,
        }
      })
    }

    updateScale()
    measureCanvas()

    const resizeObserver =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => {
            measureCanvas()
          })
        : null

    if (resizeObserver && canvasRef.current) {
      resizeObserver.observe(canvasRef.current)
    }

    window.addEventListener('resize', updateScale)
    window.addEventListener('resize', measureCanvas)

    return () => {
      window.removeEventListener('resize', updateScale)
      window.removeEventListener('resize', measureCanvas)

      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [])

  const { enabled, scale, canvasHeight } = scaleState

  const shellStyle = enabled
    ? {
        width: `${BASE_WIDTH * scale}px`,
        minHeight: canvasHeight ? `${canvasHeight * scale}px` : '100vh',
      }
    : undefined

  const canvasStyle = enabled
    ? {
        width: `${BASE_WIDTH}px`,
        transform: `scale(${scale})`,
      }
    : undefined

  return (
    <div className="layout-scale-shell" style={shellStyle}>
      <div
        ref={canvasRef}
        className={`layout-scale-shell__canvas ${enabled ? 'layout-scale-shell__canvas--scaled' : ''}`.trim()}
        style={canvasStyle}
      >
        {children}
      </div>
    </div>
  )
}

export default LayoutScaleWrapper
