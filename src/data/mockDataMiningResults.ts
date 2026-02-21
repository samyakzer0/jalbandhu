// Pre-computed mock data from offline Weka/Python training
// In production, this would be fetched from your database or API

export const mockHotspots = [
  {
    clusterId: 1,
    center: [72.8777, 19.0760] as [number, number], // Mumbai
    reportCount: 15,
    riskScore: 0.85,
    riskLevel: 'high' as const,
    avgSeverity: 4.2
  },
  {
    clusterId: 2,
    center: [88.3639, 22.5726] as [number, number], // Kolkata
    reportCount: 12,
    riskScore: 0.72,
    riskLevel: 'high' as const,
    avgSeverity: 3.8
  },
  {
    clusterId: 3,
    center: [80.2707, 13.0827] as [number, number], // Chennai
    reportCount: 8,
    riskScore: 0.58,
    riskLevel: 'medium' as const,
    avgSeverity: 3.2
  },
  {
    clusterId: 4,
    center: [77.5946, 12.9716] as [number, number], // Bangalore
    reportCount: 5,
    riskScore: 0.35,
    riskLevel: 'low' as const,
    avgSeverity: 2.5
  },
  {
    clusterId: 5,
    center: [73.8567, 18.5204] as [number, number], // Pune
    reportCount: 18,
    riskScore: 0.92,
    riskLevel: 'critical' as const,
    avgSeverity: 4.7
  }
];

export const mockKeywords = [
  { term: 'tsunami', tfidf: 0.85, frequency: 25 },
  { term: 'cyclone', tfidf: 0.78, frequency: 22 },
  { term: 'warning', tfidf: 0.72, frequency: 18 },
  { term: 'evacuation', tfidf: 0.68, frequency: 15 },
  { term: 'emergency', tfidf: 0.65, frequency: 14 },
  { term: 'storm surge', tfidf: 0.62, frequency: 12 },
  { term: 'high waves', tfidf: 0.58, frequency: 11 },
  { term: 'coastal flooding', tfidf: 0.55, frequency: 10 },
  { term: 'alert', tfidf: 0.52, frequency: 9 },
  { term: 'danger', tfidf: 0.48, frequency: 8 },
  { term: 'rescue', tfidf: 0.45, frequency: 7 },
  { term: 'safety', tfidf: 0.42, frequency: 6 },
  { term: 'weather', tfidf: 0.38, frequency: 5 },
  { term: 'wind speed', tfidf: 0.35, frequency: 5 },
  { term: 'tide level', tfidf: 0.32, frequency: 4 },
  { term: 'maritime', tfidf: 0.28, frequency: 4 },
  { term: 'ocean', tfidf: 0.25, frequency: 3 },
  { term: 'coastal', tfidf: 0.22, frequency: 3 },
  { term: 'harbor', tfidf: 0.18, frequency: 2 },
  { term: 'vessel', tfidf: 0.15, frequency: 2 }
];

export const mockPredictions = [
  {
    timestamp: new Date(Date.now() + 1 * 60 * 60 * 1000),
    predictedReportCount: 8,
    confidence: 0.82,
    riskLevel: 'low' as const
  },
  {
    timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000),
    predictedReportCount: 12,
    confidence: 0.79,
    riskLevel: 'medium' as const
  },
  {
    timestamp: new Date(Date.now() + 3 * 60 * 60 * 1000),
    predictedReportCount: 15,
    confidence: 0.81,
    riskLevel: 'medium' as const
  },
  {
    timestamp: new Date(Date.now() + 4 * 60 * 60 * 1000),
    predictedReportCount: 18,
    confidence: 0.78,
    riskLevel: 'high' as const
  },
  {
    timestamp: new Date(Date.now() + 5 * 60 * 60 * 1000),
    predictedReportCount: 22,
    confidence: 0.85,
    riskLevel: 'high' as const
  },
  {
    timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000),
    predictedReportCount: 28,
    confidence: 0.83,
    riskLevel: 'high' as const
  },
  {
    timestamp: new Date(Date.now() + 7 * 60 * 60 * 1000),
    predictedReportCount: 32,
    confidence: 0.88,
    riskLevel: 'critical' as const
  },
  {
    timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000),
    predictedReportCount: 35,
    confidence: 0.86,
    riskLevel: 'critical' as const
  },
  {
    timestamp: new Date(Date.now() + 9 * 60 * 60 * 1000),
    predictedReportCount: 30,
    confidence: 0.80,
    riskLevel: 'high' as const
  },
  {
    timestamp: new Date(Date.now() + 10 * 60 * 60 * 1000),
    predictedReportCount: 25,
    confidence: 0.77,
    riskLevel: 'high' as const
  },
  {
    timestamp: new Date(Date.now() + 11 * 60 * 60 * 1000),
    predictedReportCount: 20,
    confidence: 0.75,
    riskLevel: 'high' as const
  },
  {
    timestamp: new Date(Date.now() + 12 * 60 * 60 * 1000),
    predictedReportCount: 15,
    confidence: 0.73,
    riskLevel: 'medium' as const
  }
];

// Mock model metrics (from offline training)
export const mockModelMetrics = {
  modelAccuracy: 0.84,
  trainingMetrics: {
    loss: 0.045,
    mae: 0.11,
    rmse: 0.14
  }
};
