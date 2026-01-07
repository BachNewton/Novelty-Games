export const PHYSICS_CONFIG = {
  springStrength: 0.02,
  springLength: 8,
  repulsionStrength: 200,
  centeringStrength: 0.001,
  damping: 0.85,
  maxVelocity: 2,
  stabilityThreshold: 0.01,
  nodeLimit: 500,
  maxDeltaTimeMs: 50,
  initialSpawnRange: 20
};

export const PHYSICS_CONTROLS = {
  springStrength: {
    default: 0.02,
    min: 0,
    max: 1,
    step: 0.001,
    description: 'How strongly connected nodes pull toward each other'
  },
  springLength: {
    default: 8,
    min: 0,
    max: 200,
    step: 1,
    description: 'Target distance between connected nodes'
  },
  repulsionStrength: {
    default: 200,
    min: 0,
    max: 10000,
    step: 10,
    description: 'How strongly all nodes push away from each other'
  },
  centeringStrength: {
    default: 0.001,
    min: 0,
    max: 0.1,
    step: 0.0001,
    description: 'How strongly nodes are pulled toward the origin'
  },
  damping: {
    default: 0.85,
    min: 0,
    max: 1,
    step: 0.01,
    description: 'Friction that slows movement (0=instant stop, 1=no friction)'
  },
  maxVelocity: {
    default: 2,
    min: 0,
    max: 100,
    step: 0.1,
    description: 'Maximum speed nodes can move per frame'
  },
  nodeLimit: {
    default: 500,
    min: 10,
    max: 5000,
    step: 10,
    description: 'Max nodes for physics simulation (performance cap)'
  }
};
