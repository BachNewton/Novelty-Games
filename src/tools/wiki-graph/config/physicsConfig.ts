export const PHYSICS_CONFIG = {
  springStrength: 1,
  repulsionStrength: 18,
  damping: 0.98,
  maxVelocity: 10,
  maxDeltaTimeMs: 50,
  spawnOffsetRange: 5,
  barnesHutTheta: 0.7
};

export const PHYSICS_CONTROLS = {
  springStrength: {
    default: 1,
    min: 0,
    max: 1,
    step: 0.001,
    description: 'How strongly connected nodes pull toward each other'
  },
  repulsionStrength: {
    default: 18,
    min: 0,
    max: 200,
    step: 1,
    description: 'How strongly all nodes push away from each other'
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
  barnesHutTheta: {
    default: 0.7,
    min: 0.1,
    max: 1.5,
    step: 0.05,
    description: 'Barnes-Hut approximation threshold (lower=accurate, higher=fast)'
  }
};
