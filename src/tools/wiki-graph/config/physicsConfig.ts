export const PHYSICS_CONFIG = {
  springStrength: 1,
  springLength: 0,
  repulsionStrength: 18,
  centeringStrength: 0,
  damping: 0.98,
  maxVelocity: 10,
  stabilityThreshold: 0.01,
  nodeLimit: 5000,
  maxDeltaTimeMs: 50,
  spawnOffsetRange: 5
};

export const PHYSICS_CONTROLS = {
  springStrength: {
    default: 1,
    min: 0,
    max: 1,
    step: 0.001,
    description: 'How strongly connected nodes pull toward each other'
  },
  springLength: {
    default: 0,
    min: 0,
    max: 200,
    step: 1,
    description: 'Target distance between connected nodes'
  },
  repulsionStrength: {
    default: 18,
    min: 0,
    max: 200,
    step: 1,
    description: 'How strongly all nodes push away from each other'
  },
  centeringStrength: {
    default: 0,
    min: 0,
    max: 0.1,
    step: 0.0001,
    description: 'How strongly nodes are pulled toward the origin'
  },
  damping: {
    default: 0.98,
    min: 0,
    max: 1,
    step: 0.01,
    description: 'Friction that slows movement (0=instant stop, 1=no friction)'
  },
  maxVelocity: {
    default: 10,
    min: 0,
    max: 100,
    step: 0.1,
    description: 'Maximum speed nodes can move per frame'
  },
  nodeLimit: {
    default: 5000,
    min: 10,
    max: 5000,
    step: 10,
    description: 'Max nodes for physics simulation (performance cap)'
  }
};
