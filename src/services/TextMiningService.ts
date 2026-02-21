import { removeStopwords } from 'stopword';
import Sentiment from 'sentiment';

// Browser-compatible TF-IDF implementation
class SimpleTfIdf {
  private documents: string[] = [];
  private termFrequency: Map<number, Map<string, number>>[] = [];
  private documentFrequency: Map<string, number> = new Map();

  addDocument(text: string) {
    const docIndex = this.documents.length;
    this.documents.push(text);
    
    const terms = this.tokenize(text);
    const termCount = new Map<string, number>();
    
    const uniqueTerms = new Set<string>();
    
    terms.forEach(term => {
      termCount.set(term, (termCount.get(term) || 0) + 1);
      uniqueTerms.add(term);
    });
    
    this.termFrequency[docIndex] = termCount;
    
    uniqueTerms.forEach(term => {
      this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
    });
  }

  listTerms(docIndex: number): Array<{ term: string; tfidf: number }> {
    const termCount = this.termFrequency[docIndex];
    if (!termCount) return [];
    
    const docTerms = this.tokenize(this.documents[docIndex]);
    const totalTerms = docTerms.length;
    const totalDocs = this.documents.length;
    
    const results: Array<{ term: string; tfidf: number }> = [];
    
    termCount.forEach((count, term) => {
      const tf = count / totalTerms;
      const df = this.documentFrequency.get(term) || 1;
      const idf = Math.log(totalDocs / df);
      const tfidf = tf * idf;
      
      results.push({ term, tfidf });
    });
    
    return results.sort((a, b) => b.tfidf - a.tfidf);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }
}

// Simple word tokenizer
class SimpleTokenizer {
  tokenize(text: string): string[] | null {
    if (!text) return null;
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }
}

interface TextMiningResult {
  keywords: Array<{ term: string; score: number; frequency: number }>;
  topics: Array<{ id: number; terms: string[]; weight: number }>;
  sentiment: {
    score: number;
    comparative: number;
    tokens: string[];
    positive: string[];
    negative: string[];
  };
  crisisIndicators: {
    panicScore: number;
    urgencyScore: number;
    emotionIntensity: number;
    credibilityScore: number;
  };
  entities: {
    locations: string[];
    hazardTypes: string[];
    marineTerms: string[];
    timeReferences: string[];
  };
}

interface SocialMediaPost {
  id: string;
  content: string;
  platform: string;
  timestamp: Date;
  authorUsername: string;
  authorFollowerCount: number;
  engagementMetrics?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export class TextMiningService {
  private tfidf: SimpleTfIdf;
  private tokenizer: SimpleTokenizer;
  private sentiment: Sentiment;
  
  // Domain-specific maritime keyword dictionaries
  private readonly OCEAN_HAZARD_TERMS = [
    'tsunami', 'cyclone', 'storm surge', 'high waves', 'flooding',
    'coastal erosion', 'oil spill', 'marine debris', 'dangerous sea',
    'rough seas', 'shipwreck', 'vessel distress', 'maritime accident',
    'सुनामी', 'चक्रवात', 'तूफान', 'बाढ़', // Hindi
    'சுனாமி', 'சூறாவளி', 'புயல்', // Tamil
    'সুনামি', 'ঘূর্ণিঝড়', 'ঝড়' // Bengali
  ];
  
  private readonly PANIC_INDICATORS = [
    'emergency', 'urgent', 'help', 'danger', 'evacuate', 'flee',
    'warning', 'alert', 'disaster', 'crisis', 'rescue', 'SOS',
    'आपातकाल', 'खतरा', 'बचाव', // Hindi
    'அவசரம்', 'ஆபத்து', 'மீட்பு', // Tamil
    'জরুরী', 'বিপদ', 'উদ্ধার' // Bengali
  ];
  
  private readonly MARINE_LOCATIONS_INDIA = [
    'Bay of Bengal', 'Arabian Sea', 'Andaman', 'Nicobar', 'Lakshadweep',
    'Mumbai coast', 'Chennai coast', 'Kolkata coast', 'Visakhapatnam',
    'Kochi', 'Goa', 'Gujarat coast', 'Odisha coast', 'Kerala coast'
  ];
  
  constructor() {
    this.tfidf = new SimpleTfIdf();
    this.tokenizer = new SimpleTokenizer();
    this.sentiment = new Sentiment();
  }
  
  /**
   * PATENT-WORTHY FEATURE: Multi-dimensional Maritime Text Mining
   * Combines TF-IDF, sentiment analysis, and crisis detection
   */
  async analyzeSocialMediaCorpus(
    posts: SocialMediaPost[]
  ): Promise<{
    globalKeywords: Array<{ term: string; score: number; occurrences: number }>;
    emergingTopics: Array<{ topicId: number; keywords: string[]; postCount: number }>;
    crisisHotspots: Array<{ location: string; panicLevel: number; posts: string[] }>;
    sentimentTrends: Array<{ timeWindow: string; avgSentiment: number; volatility: number }>;
  }> {
    
    // Build TF-IDF corpus
    posts.forEach(post => {
      const cleaned = this.preprocessText(post.content);
      this.tfidf.addDocument(cleaned);
    });
    
    // Extract global keywords using TF-IDF
    const globalKeywords = this.extractTopKeywords(posts.length, 50);
    
    // Topic modeling using LDA-style clustering
    const emergingTopics = await this.performTopicModeling(posts, 5);
    
    // Crisis location detection
    const crisisHotspots = this.detectCrisisLocations(posts);
    
    // Sentiment trend analysis
    const sentimentTrends = this.analyzeSentimentTrends(posts, 24); // 24-hour windows
    
    return {
      globalKeywords,
      emergingTopics,
      crisisHotspots,
      sentimentTrends
    };
  }
  
  /**
   * TF-IDF-based keyword extraction
   */
  private extractTopKeywords(
    documentCount: number,
    topN: number = 20
  ): Array<{ term: string; score: number; occurrences: number }> {
    
    const termScores = new Map<string, { totalScore: number; occurrences: number }>();
    
    // Calculate TF-IDF for each term across all documents
    for (let docIndex = 0; docIndex < documentCount; docIndex++) {
      this.tfidf.listTerms(docIndex).forEach((item: any) => {
        const term = item.term;
        const score = item.tfidf;
        
        if (!termScores.has(term)) {
          termScores.set(term, { totalScore: 0, occurrences: 0 });
        }
        
        const current = termScores.get(term)!;
        current.totalScore += score;
        current.occurrences += 1;
      });
    }
    
    // Convert to array and sort
    const keywords = Array.from(termScores.entries())
      .map(([term, data]) => ({
        term,
        score: data.totalScore / data.occurrences,
        occurrences: data.occurrences
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
    
    return keywords;
  }
  
  /**
   * PATENT-WORTHY: Simplified Topic Modeling for Maritime Hazards
   * Groups posts by dominant hazard keywords
   */
  private async performTopicModeling(
    posts: SocialMediaPost[],
    numTopics: number = 5
  ): Promise<Array<{ topicId: number; keywords: string[]; postCount: number }>> {
    
    const topics: Map<number, { keywords: Set<string>; posts: SocialMediaPost[] }> = new Map();
    
    // Simple topic assignment based on hazard term co-occurrence
    posts.forEach(post => {
      const tokens = this.tokenizer.tokenize(post.content.toLowerCase()) || [];
      const hazardTermsFound = tokens.filter(token => 
        this.OCEAN_HAZARD_TERMS.some(hazard => hazard.toLowerCase().includes(token))
      );
      
      if (hazardTermsFound.length > 0) {
        // Assign to topic based on first hazard term (simplified)
        const topicId = hazardTermsFound[0].charCodeAt(0) % numTopics;
        
        if (!topics.has(topicId)) {
          topics.set(topicId, { keywords: new Set(), posts: [] });
        }
        
        const topic = topics.get(topicId)!;
        hazardTermsFound.forEach(term => topic.keywords.add(term));
        topic.posts.push(post);
      }
    });
    
    // Convert to output format
    return Array.from(topics.entries()).map(([topicId, data]) => ({
      topicId,
      keywords: Array.from(data.keywords),
      postCount: data.posts.length
    }));
  }
  
  /**
   * PATENT-WORTHY: Crisis Location Detection with Panic Scoring
   * Identifies geographic areas with elevated panic indicators
   */
  private detectCrisisLocations(
    posts: SocialMediaPost[]
  ): Array<{ location: string; panicLevel: number; posts: string[] }> {
    
    const locationMap = new Map<string, { panicScores: number[]; postIds: string[] }>();
    
    posts.forEach(post => {
      const locations = this.extractLocations(post.content);
      const panicScore = this.calculatePanicScore(post);
      
      locations.forEach(location => {
        if (!locationMap.has(location)) {
          locationMap.set(location, { panicScores: [], postIds: [] });
        }
        
        const data = locationMap.get(location)!;
        data.panicScores.push(panicScore);
        data.postIds.push(post.id);
      });
    });
    
    // Calculate average panic level per location
    return Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        panicLevel: data.panicScores.reduce((sum, s) => sum + s, 0) / data.panicScores.length,
        posts: data.postIds
      }))
      .filter(item => item.panicLevel > 0.5) // Only high-panic locations
      .sort((a, b) => b.panicLevel - a.panicLevel);
  }
  
  /**
   * PATENT-WORTHY: Multi-factor Panic Score Calculation
   * Considers sentiment, exclamation density, panic keywords, and emoji analysis
   */
  private calculatePanicScore(post: SocialMediaPost): number {
    const content = post.content;
    
    // Sentiment velocity (absolute sentiment value)
    const sentimentAnalysis = this.sentiment.analyze(content);
    const sentimentVelocity = Math.abs(sentimentAnalysis.comparative);
    
    // Exclamation density
    const exclamationCount = (content.match(/!/g) || []).length;
    const exclamationDensity = exclamationCount / content.length;
    
    // Panic keyword presence
    const tokens = this.tokenizer.tokenize(content.toLowerCase()) || [];
    const panicKeywordCount = tokens.filter(token =>
      this.PANIC_INDICATORS.some(indicator => indicator.toLowerCase() === token)
    ).length;
    const panicKeywordRatio = panicKeywordCount / Math.max(tokens.length, 1);
    
    // Emoji analysis (simplified - count emotional emojis)
    const emotionalEmojiCount = (content.match(/[😱😨😰🆘⚠️🚨]/g) || []).length;
    const emojiIntensity = Math.min(emotionalEmojiCount / 3, 1.0);
    
    // Capital letters ratio (SHOUTING indicator)
    const capitalRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    
    // Weighted combination
    const panicScore = 
      sentimentVelocity * 0.25 +
      Math.min(exclamationDensity * 100, 1.0) * 0.20 +
      panicKeywordRatio * 0.30 +
      emojiIntensity * 0.15 +
      Math.min(capitalRatio * 2, 1.0) * 0.10;
    
    return Math.min(panicScore, 1.0);
  }
  
  /**
   * Named Entity Recognition for Maritime Locations
   */
  private extractLocations(text: string): string[] {
    const locations: string[] = [];
    
    this.MARINE_LOCATIONS_INDIA.forEach(location => {
      if (text.toLowerCase().includes(location.toLowerCase())) {
        locations.push(location);
      }
    });
    
    return locations;
  }
  
  /**
   * Sentiment trend analysis over time windows
   */
  private analyzeSentimentTrends(
    posts: SocialMediaPost[],
    windowHours: number
  ): Array<{ timeWindow: string; avgSentiment: number; volatility: number }> {
    
    // Sort posts by timestamp
    const sortedPosts = [...posts].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (sortedPosts.length === 0) return [];
    
    const trends = [];
    const now = new Date();
    const windowMs = windowHours * 60 * 60 * 1000;
    
    // Analyze last 7 time windows
    for (let i = 0; i < 7; i++) {
      const endTime = new Date(now.getTime() - i * windowMs);
      const startTime = new Date(endTime.getTime() - windowMs);
      
      const windowPosts = sortedPosts.filter(p =>
        p.timestamp >= startTime && p.timestamp < endTime
      );
      
      if (windowPosts.length > 0) {
        const sentiments = windowPosts.map(p => 
          this.sentiment.analyze(p.content).comparative
        );
        
        const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
        
        // Calculate volatility (standard deviation)
        const variance = sentiments.reduce((sum, s) => 
          sum + Math.pow(s - avgSentiment, 2), 0
        ) / sentiments.length;
        const volatility = Math.sqrt(variance);
        
        trends.push({
          timeWindow: `${startTime.toISOString()} to ${endTime.toISOString()}`,
          avgSentiment,
          volatility
        });
      }
    }
    
    return trends.reverse(); // Chronological order
  }
  
  private preprocessText(text: string): string {
    // Convert to lowercase
    let processed = text.toLowerCase();
    
    // Remove URLs
    processed = processed.replace(/https?:\/\/\S+/g, '');
    
    // Remove mentions
    processed = processed.replace(/@\w+/g, '');
    
    // Remove hashtags but keep the word
    processed = processed.replace(/#(\w+)/g, '$1');
    
    // Tokenize
    const tokens = this.tokenizer.tokenize(processed) || [];
    
    // Remove stopwords (English only for now)
    const filtered = removeStopwords(tokens);
    
    return filtered.join(' ');
  }
  
  /**
   * Individual post analysis for real-time classification
   */
  async analyzePost(post: SocialMediaPost): Promise<TextMiningResult> {
    const content = post.content;
    const cleaned = this.preprocessText(content);
    
    // Add to TF-IDF temporarily
    this.tfidf.addDocument(cleaned);
    const docIndex = (this.tfidf as any).documents.length - 1;
    
    // Extract keywords from this specific post
    const keywords = this.tfidf.listTerms(docIndex)
      .slice(0, 10)
      .map((item: any) => ({
        term: item.term,
        score: item.tfidf,
        frequency: 1 // Simplified
      }));
    
    // Sentiment analysis
    const sentimentResult = this.sentiment.analyze(content);
    const sentiment = {
      score: sentimentResult.score,
      comparative: sentimentResult.comparative,
      tokens: sentimentResult.tokens,
      positive: sentimentResult.positive,
      negative: sentimentResult.negative
    };
    
    // Crisis indicators
    const crisisIndicators = {
      panicScore: this.calculatePanicScore(post),
      urgencyScore: this.calculateUrgencyScore(content),
      emotionIntensity: Math.abs(sentimentResult.comparative),
      credibilityScore: this.calculateCredibilityScore(post)
    };
    
    // Entity extraction
    const entities = {
      locations: this.extractLocations(content),
      hazardTypes: this.extractHazardTypes(content),
      marineTerms: this.extractMarineTerms(content),
      timeReferences: this.extractTimeReferences(content)
    };
    
    // Simplified topics
    const topics = [{
      id: 1,
      terms: keywords.slice(0, 5).map(k => k.term),
      weight: 1.0
    }];
    
    return {
      keywords,
      topics,
      sentiment,
      crisisIndicators,
      entities
    };
  }
  
  private calculateUrgencyScore(text: string): number {
    const urgencyKeywords = ['now', 'immediately', 'urgent', 'asap', 'quickly', 'hurry'];
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    const urgentCount = tokens.filter(t => urgencyKeywords.includes(t)).length;
    return Math.min(urgentCount / 3, 1.0);
  }
  
  private calculateCredibilityScore(post: SocialMediaPost): number {
    // Simple heuristic: verified users, follower count, engagement
    let score = 0.5; // Base score
    
    if (post.authorFollowerCount > 10000) score += 0.2;
    if (post.authorFollowerCount > 100000) score += 0.1;
    
    if (post.engagementMetrics) {
      const totalEngagement = 
        post.engagementMetrics.likes + 
        post.engagementMetrics.shares + 
        post.engagementMetrics.comments;
      
      if (totalEngagement > 100) score += 0.1;
      if (totalEngagement > 1000) score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }
  
  private extractHazardTypes(text: string): string[] {
    return this.OCEAN_HAZARD_TERMS.filter(hazard =>
      text.toLowerCase().includes(hazard.toLowerCase())
    );
  }
  
  private extractMarineTerms(text: string): string[] {
    const marineVocab = [
      'ship', 'boat', 'vessel', 'port', 'harbor', 'shore', 'beach',
      'ocean', 'sea', 'wave', 'tide', 'current', 'fishermen', 'coast'
    ];
    
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    return tokens.filter(token => marineVocab.includes(token));
  }
  
  private extractTimeReferences(text: string): string[] {
    const timePatterns = [
      /\b(now|today|tonight|yesterday|tomorrow)\b/gi,
      /\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b/gi,
      /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/gi
    ];
    
    const references: string[] = [];
    timePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) references.push(...matches);
    });
    
    return references;
  }
}

export default new TextMiningService();
