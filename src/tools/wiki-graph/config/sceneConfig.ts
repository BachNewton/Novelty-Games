export const SCENE_CONFIG = {
  camera: {
    defaultDistance: 30,
    fov: 75,
    nearPlane: 0.1,
    farPlane: 10000
  },

  lighting: {
    ambient: {
      color: 0xFFFFFF,
      intensity: 0.6
    },
    directional: {
      color: 0xFFFFFF,
      intensity: 0.8,
      position: { x: 10, y: 10, z: 10 }
    }
  },

  controls: {
    dampingFactor: 0.05,
    minDistance: 5,
    maxDistance: 200
  },

  background: {
    color: 0x1a1a2e
  },

  fog: {
    density: 0.1
  }
};
