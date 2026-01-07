export const NODE_CONFIG = {
  geometry: {
    sphere: {
      radius: 0.4,
      segments: 16
    },
    box: {
      size: 0.5
    },
    cone: {
      radius: 0.3,
      height: 0.6,
      segments: 4
    }
  },

  colors: {
    missing: 0x666666,
    leaf: 0xffffff,
    default: 0x888888
  },

  materials: {
    roughness: 0.5,
    metalness: 0.3
  },

  highlight: {
    color: 0xffffff,
    emissive: 0x333333,
    opacity: 0.3,
    sphereRadius: 0.55,
    coneScale: 0.8,
    nodeScale: 1.3
  },

  capacity: {
    initial: 5000
  }
};
