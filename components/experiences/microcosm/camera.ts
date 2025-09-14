export interface Camera {
  x: number
  y: number
  zoom: number
  targetZoom: number
}

export const createCamera = (): Camera => ({
  x: 0,
  y: 0,
  zoom: 1,
  targetZoom: 1,
})

export const updateCamera = (camera: Camera, dt = 1) => {
  // Smooth zoom interpolation
  const zoomSpeed = 0.1
  camera.zoom += (camera.targetZoom - camera.zoom) * zoomSpeed * dt
}

export const screenToWorld = (
  camera: Camera,
  screenX: number,
  screenY: number,
  canvasWidth: number,
  canvasHeight: number,
) => {
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  return {
    x: (screenX - centerX) / camera.zoom + camera.x,
    y: (screenY - centerY) / camera.zoom + camera.y,
  }
}

export const worldToScreen = (
  camera: Camera,
  worldX: number,
  worldY: number,
  canvasWidth: number,
  canvasHeight: number,
) => {
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  return {
    x: (worldX - camera.x) * camera.zoom + centerX,
    y: (worldY - camera.y) * camera.zoom + centerY,
  }
}

export const isInViewport = (
  camera: Camera,
  worldX: number,
  worldY: number,
  radius: number,
  canvasWidth: number,
  canvasHeight: number,
) => {
  const screen = worldToScreen(camera, worldX, worldY, canvasWidth, canvasHeight)
  const scaledRadius = radius * camera.zoom

  return (
    screen.x + scaledRadius >= 0 &&
    screen.x - scaledRadius <= canvasWidth &&
    screen.y + scaledRadius >= 0 &&
    screen.y - scaledRadius <= canvasHeight
  )
}
