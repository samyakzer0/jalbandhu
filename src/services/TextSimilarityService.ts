/**
 * Text Similarity Service for JalBandhu Report Grouping
 * 
 * Provides lightweight NLP capabilities for detecting textually similar reports
 * using vector embeddings and cosine similarity. This service is designed to be
 * efficient and work in browser environments without heavy ML dependencies.
 */

// Simple stopwords for English (can be expanded)
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'would', 'could', 'should', 'have',
  'had', 'been', 'being', 'do', 'does', 'did', 'done', 'can', 'may',
  'must', 'shall', 'this', 'these', 'those', 'they', 'them', 'their',
  'there', 'where', 'when', 'why', 'how', 'what', 'which', 'who',
  'but', 'or', 'if', 'then', 'than', 'so', 'very', 'just', 'now',
  'also', 'only', 'more', 'most', 'much', 'many', 'some', 'any',
  'all', 'each', 'every', 'few', 'little', 'less', 'least', 'own'
]);

// Common ocean hazard and marine safety terms that should have higher weight
const OCEAN_HAZARD_KEYWORDS = new Set([
  'tsunami', 'wave', 'surge', 'current', 'tide', 'swell', 'erosion',
  'debris', 'sea', 'ocean', 'coastal', 'marine', 'flood', 'storm',
  'cyclone', 'weather', 'wind', 'water', 'shore', 'beach', 'cliff',
  'port', 'harbor', 'fishing', 'boat', 'ship', 'danger', 'warning',
  'rescue', 'safety', 'emergency', 'urgent', 'park', 'playground', 'fence', 'gate', 'parking',
  'alert', 'hazard', 'risk', 'rough', 'calm', 'high', 'low', 'strong',
  'moderate', 'weak', 'rip', 'undertow', 'coral', 'reef', 'sand'
]);

/**
 * Interface for text similarity results
 */
export interface TextSimilarityResult {
  similarity: number; // Cosine similarity score (0-1)
  confidence: number; // Confidence in the result (0-1)
  matchingTerms: string[]; // Common important terms found
  weightedScore: number; // Similarity score adjusted for civic relevance
}

/**
 * Interface for document vectors
 */
interface DocumentVector {
  terms: Map<string, number>; // Term frequency map
  magnitude: number; // Vector magnitude for normalization
  importantTerms: string[]; // High-weight civic terms found
}

/**
 * Text preprocessing and normalization utilities
 */
class TextProcessor {
  /**
   * Clean and normalize text for analysis
   */
  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Tokenize text into words
   */
  static tokenize(text: string): string[] {
    return this.normalizeText(text)
      .split(' ')
      .filter(word => word.length > 2 && !STOPWORDS.has(word));
  }

  /**
   * Apply stemming (simple suffix removal)
   */
  static stem(word: string): string {
    // Simple suffix removal for common English endings
    const suffixes = ['ing', 'ly', 'ed', 'ies', 'ied', 'ies', 'ied', 's'];
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    return word;
  }

  /**
   * Calculate term weights based on civic relevance
   */
  static getTermWeight(term: string): number {
    if (OCEAN_HAZARD_KEYWORDS.has(term)) {
      return 2.0; // Higher weight for civic terms
    }
    return 1.0; // Standard weight
  }
}

/**
 * Vector-based text similarity service
 */
export class TextSimilarityService {
  private static instance: TextSimilarityService;

  /**
   * Singleton pattern for service instance
   */
  static getInstance(): TextSimilarityService {
    if (!this.instance) {
      this.instance = new TextSimilarityService();
    }
    return this.instance;
  }

  /**
   * Create a document vector from text
   */
  private createDocumentVector(text: string): DocumentVector {
    const tokens = TextProcessor.tokenize(text);
    const stemmedTokens = tokens.map(token => TextProcessor.stem(token));
    
    const termFrequency = new Map<string, number>();
    const importantTerms: string[] = [];
    let magnitudeSquared = 0;

    // Calculate term frequencies with weights
    for (const token of stemmedTokens) {
      const weight = TextProcessor.getTermWeight(token);
      const weightedCount = (termFrequency.get(token) || 0) + weight;
      
      termFrequency.set(token, weightedCount);
      magnitudeSquared += weightedCount * weightedCount;

      // Track important civic terms
      if (OCEAN_HAZARD_KEYWORDS.has(token) && !importantTerms.includes(token)) {
        importantTerms.push(token);
      }
    }

    return {
      terms: termFrequency,
      magnitude: Math.sqrt(magnitudeSquared),
      importantTerms
    };
  }

  /**
   * Calculate cosine similarity between two document vectors
   */
  private calculateCosineSimilarity(vec1: DocumentVector, vec2: DocumentVector): number {
    if (vec1.magnitude === 0 || vec2.magnitude === 0) {
      return 0;
    }

    let dotProduct = 0;
    const allTerms = new Set([...vec1.terms.keys(), ...vec2.terms.keys()]);

    for (const term of allTerms) {
      const freq1 = vec1.terms.get(term) || 0;
      const freq2 = vec2.terms.get(term) || 0;
      dotProduct += freq1 * freq2;
    }

    return dotProduct / (vec1.magnitude * vec2.magnitude);
  }

  /**
   * Find common important terms between two vectors
   */
  private findMatchingTerms(vec1: DocumentVector, vec2: DocumentVector): string[] {
    const matching: string[] = [];
    
    for (const term of vec1.importantTerms) {
      if (vec2.terms.has(term)) {
        matching.push(term);
      }
    }

    return matching;
  }

  /**
   * Calculate confidence score based on text length and term overlap
   */
  private calculateConfidence(
    text1: string, 
    text2: string, 
    similarity: number, 
    matchingTerms: string[]
  ): number {
    const minLength = Math.min(text1.length, text2.length);
    const maxLength = Math.max(text1.length, text2.length);
    
    // Length ratio factor (prefer similar-length texts)
    const lengthRatio = minLength / maxLength;
    
    // Term overlap factor
    const termOverlapFactor = Math.min(matchingTerms.length / 3, 1); // Cap at 3 terms
    
    // Base confidence from similarity score
    const baseConfidence = similarity;
    
    // Combined confidence
    return Math.min(
      baseConfidence * 0.6 + lengthRatio * 0.2 + termOverlapFactor * 0.2,
      1.0
    );
  }

  /**
   * Compare two text strings and return similarity metrics
   */
  public compareTexts(text1: string, text2: string): TextSimilarityResult {
    try {
      // Handle edge cases
      if (!text1 || !text2) {
        return {
          similarity: 0,
          confidence: 0,
          matchingTerms: [],
          weightedScore: 0
        };
      }

      if (text1.trim() === text2.trim()) {
        return {
          similarity: 1.0,
          confidence: 1.0,
          matchingTerms: [],
          weightedScore: 1.0
        };
      }

      // Create document vectors
      const vec1 = this.createDocumentVector(text1);
      const vec2 = this.createDocumentVector(text2);

      // Calculate similarity
      const similarity = this.calculateCosineSimilarity(vec1, vec2);
      
      // Find matching terms
      const matchingTerms = this.findMatchingTerms(vec1, vec2);
      
      // Calculate confidence
      const confidence = this.calculateConfidence(text1, text2, similarity, matchingTerms);
      
      // Calculate weighted score (boost for civic term matches)
      const civicBoost = Math.min(matchingTerms.length * 0.1, 0.3);
      const weightedScore = Math.min(similarity + civicBoost, 1.0);

      return {
        similarity,
        confidence,
        matchingTerms,
        weightedScore
      };

    } catch (error) {
      console.error('Error in text similarity comparison:', error);
      return {
        similarity: 0,
        confidence: 0,
        matchingTerms: [],
        weightedScore: 0
      };
    }
  }

  /**
   * Batch compare a text against multiple candidates
   */
  public findSimilarTexts(
    targetText: string, 
    candidates: string[], 
    threshold: number = 0.7
  ): Array<{ index: number; text: string; result: TextSimilarityResult }> {
    const results: Array<{ index: number; text: string; result: TextSimilarityResult }> = [];

    for (let i = 0; i < candidates.length; i++) {
      const result = this.compareTexts(targetText, candidates[i]);
      
      if (result.weightedScore >= threshold) {
        results.push({
          index: i,
          text: candidates[i],
          result
        });
      }
    }

    // Sort by weighted score (best matches first)
    return results.sort((a, b) => b.result.weightedScore - a.result.weightedScore);
  }

  /**
   * Analyze text and extract key civic terms
   */
  public extractCivicTerms(text: string): string[] {
    const tokens = TextProcessor.tokenize(text);
    const civicTerms: string[] = [];

    for (const token of tokens) {
      if (OCEAN_HAZARD_KEYWORDS.has(token) && !civicTerms.includes(token)) {
        civicTerms.push(token);
      }
    }

    return civicTerms;
  }

  /**
   * Get text complexity score (for confidence adjustments)
   */
  public getTextComplexity(text: string): number {
    const tokens = TextProcessor.tokenize(text);
    const uniqueTerms = new Set(tokens);
    
    if (tokens.length === 0) return 0;
    
    // Complexity based on vocabulary diversity and length
    const vocabularyDiversity = uniqueTerms.size / tokens.length;
    const lengthFactor = Math.min(tokens.length / 50, 1); // Normalize to 50 words
    
    return vocabularyDiversity * 0.6 + lengthFactor * 0.4;
  }

  /**
   * Preprocess and cache document vectors for batch operations
   */
  public createVectorCache(texts: string[]): Map<string, DocumentVector> {
    const cache = new Map<string, DocumentVector>();
    
    for (const text of texts) {
      if (!cache.has(text)) {
        cache.set(text, this.createDocumentVector(text));
      }
    }
    
    return cache;
  }

  /**
   * Fast similarity comparison using cached vectors
   */
  public compareWithCache(
    text1: string, 
    text2: string, 
    cache: Map<string, DocumentVector>
  ): TextSimilarityResult {
    let vec1 = cache.get(text1);
    let vec2 = cache.get(text2);

    if (!vec1) {
      vec1 = this.createDocumentVector(text1);
      cache.set(text1, vec1);
    }

    if (!vec2) {
      vec2 = this.createDocumentVector(text2);
      cache.set(text2, vec2);
    }

    const similarity = this.calculateCosineSimilarity(vec1, vec2);
    const matchingTerms = this.findMatchingTerms(vec1, vec2);
    const confidence = this.calculateConfidence(text1, text2, similarity, matchingTerms);
    const civicBoost = Math.min(matchingTerms.length * 0.1, 0.3);
    const weightedScore = Math.min(similarity + civicBoost, 1.0);

    return {
      similarity,
      confidence,
      matchingTerms,
      weightedScore
    };
  }
}

/**
 * Export singleton instance
 */
export const textSimilarityService = TextSimilarityService.getInstance();

/**
 * Utility function for quick similarity checks
 */
export function quickSimilarityCheck(
  text1: string, 
  text2: string, 
  threshold: number = 0.7
): boolean {
  const result = textSimilarityService.compareTexts(text1, text2);
  return result.weightedScore >= threshold;
}

/**
 * Utility function for finding the most similar text from a list
 */
export function findMostSimilar(
  target: string, 
  candidates: string[], 
  minThreshold: number = 0.5
): { text: string; similarity: number; index: number } | null {
  let bestMatch: { text: string; similarity: number; index: number } | null = null;
  let highestScore = minThreshold;

  for (let i = 0; i < candidates.length; i++) {
    const result = textSimilarityService.compareTexts(target, candidates[i]);
    
    if (result.weightedScore > highestScore) {
      highestScore = result.weightedScore;
      bestMatch = {
        text: candidates[i],
        similarity: result.weightedScore,
        index: i
      };
    }
  }

  return bestMatch;
}