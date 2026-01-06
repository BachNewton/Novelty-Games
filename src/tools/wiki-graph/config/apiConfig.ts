export const API_CONFIG = {
  wikipedia: {
    baseUrl: 'https://en.wikipedia.org/w/api.php',
    rateLimitMs: 1000,
    batchSize: 20
  },

  queuePollIntervalMs: 100,

  crawling: {
    linkLimit: {
      default: 4,
      min: 1,
      max: 50
    },
    maxDepth: {
      default: 1,
      min: 1,
      max: 10
    },
    startArticle: 'Finland'
  },

  markers: {
    pagination: '__pagination__',
    categoryPrefix: 'Category:'
  }
} as const;
