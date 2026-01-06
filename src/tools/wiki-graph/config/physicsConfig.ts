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
} as const;
