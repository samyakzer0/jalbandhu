import { useState, useEffect, useCallback } from 'react';
import { LocationData } from './useLocation';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: 'tsunami' | 'cyclone' | 'storm-surge' | 'high-waves' | 'coastal-erosion' | 'marine-flooding' | 'weather' | 'safety' | 'emergency';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  publishedAt: string;
  url?: string;
  imageUrl?: string;
  location?: {
    lat: number;
    lng: number;
    region: string;
  };
  relevanceScore: number; // 0-1 based on location and user preferences
  isBreaking?: boolean;
}

export const useCityNews = (userLocation: LocationData | null) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Mock news data with Indian coastal cities focus
  const generateMockNews = useCallback((): NewsItem[] => {
    if (!userLocation) return [];

    const newsTemplates = {
      tsunami: [
        {
          title: 'Tsunami Advisory Issued for {region} Coast',
          description: 'Maritime authorities have issued a precautionary tsunami advisory following seismic activity in the Indian Ocean. Coastal residents advised to stay alert.',
          urgency: 'high' as const,
          source: 'Indian National Centre for Ocean Information Services'
        },
        {
          title: 'Tsunami Preparedness Drill Scheduled in {region}',
          description: 'Emergency response teams will conduct tsunami evacuation drills across coastal communities to enhance disaster preparedness.',
          urgency: 'medium' as const,
          source: 'Disaster Management Authority'
        }
      ],
      cyclone: [
        {
          title: 'Cyclone Alert: {region} Braces for Severe Weather',
          description: 'Meteorological department forecasts formation of cyclonic circulation over Bay of Bengal. Coastal areas urged to take preventive measures.',
          urgency: 'urgent' as const,
          source: 'India Meteorological Department'
        },
        {
          title: 'Post-Cyclone Recovery Efforts Underway in {region}',
          description: 'Relief operations continue as authorities work to restore normalcy after recent cyclonic weather. Emergency shelters remain operational.',
          urgency: 'medium' as const,
          source: 'State Disaster Response Force'
        }
      ],
      'storm-surge': [
        {
          title: 'Storm Surge Warning for {region} Coastline',
          description: 'High tide combined with strong winds may cause storm surge up to 2-3 meters. Low-lying coastal areas advised to evacuate.',
          urgency: 'high' as const,
          source: 'Coastal Security Group'
        }
      ],
      'high-waves': [
        {
          title: 'High Wave Alert: {region} Beaches Closed to Public',
          description: 'Wave heights reaching 4-5 meters expected along the coast. All water sports and fishing activities suspended until further notice.',
          urgency: 'medium' as const,
          source: 'Coast Guard'
        }
      ],
      'coastal-erosion': [
        {
          title: 'Coastal Erosion Threatens {region} Communities',
          description: 'Accelerated shoreline erosion reported along {region} coast. Government announces new coastal protection measures.',
          urgency: 'medium' as const,
          source: 'Ministry of Earth Sciences'
        }
      ],
      weather: [
        {
          title: 'Monsoon Update: Heavy Rainfall Expected in {region}',
          description: 'Southwest monsoon intensifies over {region}. Heavy to very heavy rainfall likely in next 48 hours.',
          urgency: 'medium' as const,
          source: 'Regional Meteorological Centre'
        },
        {
          title: 'Heat Wave Conditions Prevail in {region}',
          description: 'Maximum temperatures soar above 40°C in {region}. Health advisory issued for vulnerable populations.',
          urgency: 'high' as const,
          source: 'Health Department'
        }
      ],
      safety: [
        {
          title: 'Beach Safety Guidelines Updated for {region}',
          description: 'New safety protocols introduced for beachgoers in {region} following recent incidents. Lifeguard services enhanced.',
          urgency: 'low' as const,
          source: 'Tourism Department'
        },
        {
          title: 'Fishermen Safety Training Program Launched in {region}',
          description: 'Comprehensive safety training initiative for fishing communities includes weather monitoring and emergency response.',
          urgency: 'low' as const,
          source: 'Fisheries Department'
        }
      ]
    };

    const categories = Object.keys(newsTemplates) as Array<keyof typeof newsTemplates>;
    const mockNews: NewsItem[] = [];

    // Generate 15-20 news items
    for (let i = 0; i < 18; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const templates = newsTemplates[category];
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Calculate relevance score based on location and category
      const getRelevanceScore = (category: string, userLocation: LocationData): number => {
        let score = 0.5; // Base score
        
        // Higher relevance for high-risk coastal zones
        if (userLocation.riskLevel === 'critical') score += 0.3;
        if (userLocation.riskLevel === 'high') score += 0.2;
        if (userLocation.riskLevel === 'medium') score += 0.1;
        
        // Category-specific relevance
        if (category === 'cyclone' && userLocation.coastalZone === 'east') score += 0.2;
        if (category === 'tsunami' && ['south', 'east'].includes(userLocation.coastalZone!)) score += 0.15;
        
        return Math.min(score, 1.0);
      };

      const region = userLocation.city === 'Unknown City' ? userLocation.state : userLocation.city;
      const relevanceScore = getRelevanceScore(category, userLocation);
      
      // Generate realistic timestamp (last 24 hours)
      const publishedAt = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      
      const newsItem: NewsItem = {
        id: `news_${i + 1}`,
        title: template.title.replace('{region}', region),
        description: template.description.replace(/{region}/g, region),
        category: category as NewsItem['category'],
        urgency: template.urgency,
        source: template.source,
        publishedAt: publishedAt.toISOString(),
        location: {
          lat: userLocation.lat + (Math.random() - 0.5) * 2, // Nearby location
          lng: userLocation.lng + (Math.random() - 0.5) * 2,
          region: region
        },
        relevanceScore,
        isBreaking: Math.random() < 0.1 && template.urgency === 'urgent' // 10% chance for urgent news
      };

      mockNews.push(newsItem);
    }

    // Sort by relevance score and recency
    return mockNews.sort((a, b) => {
      if (a.isBreaking && !b.isBreaking) return -1;
      if (!a.isBreaking && b.isBreaking) return 1;
      
      const scoreA = a.relevanceScore + (a.urgency === 'urgent' ? 0.3 : a.urgency === 'high' ? 0.2 : 0);
      const scoreB = b.relevanceScore + (b.urgency === 'urgent' ? 0.3 : b.urgency === 'high' ? 0.2 : 0);
      
      if (scoreA !== scoreB) return scoreB - scoreA;
      
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [userLocation]);

  const fetchNews = useCallback(async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    try {
      // For now, use mock data. In production, this would call actual news APIs
      // like Google News API, NewsAPI, or local news sources
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNews = generateMockNews();
      setNews(mockNews);
      setLastFetch(new Date());
      
      // Cache news data for 30 minutes
      localStorage.setItem('jalBandhu_city_news', JSON.stringify({
        news: mockNews,
        timestamp: new Date().toISOString(),
        location: userLocation.city
      }));
      
    } catch (err) {
      console.error('Error fetching city news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, [userLocation, generateMockNews]);

  // Get cached news if available and recent
  const getCachedNews = useCallback((): NewsItem[] | null => {
    try {
      const cached = localStorage.getItem('jalBandhu_city_news');
      if (cached && userLocation) {
        const { news: cachedNews, timestamp, location } = JSON.parse(cached);
        
        // Check if cache is less than 30 minutes old and for same location
        const cacheTime = new Date(timestamp);
        const now = new Date();
        const minutesDiff = (now.getTime() - cacheTime.getTime()) / (1000 * 60);
        
        if (minutesDiff < 30 && location === userLocation.city) {
          return cachedNews;
        }
      }
    } catch (error) {
      console.error('Error reading cached news:', error);
    }
    return null;
  }, [userLocation]);

  // Load cached news on mount, then fetch fresh data
  useEffect(() => {
    const cached = getCachedNews();
    if (cached) {
      setNews(cached);
      setLastFetch(new Date());
    }
    
    // Always fetch fresh data
    fetchNews();
  }, [fetchNews, getCachedNews]);

  const getNewsByCategory = useCallback((category?: string) => {
    if (!category) return news;
    return news.filter(item => item.category === category);
  }, [news]);

  const getBreakingNews = useCallback(() => {
    return news.filter(item => item.isBreaking);
  }, [news]);

  const getUrgentNews = useCallback(() => {
    return news.filter(item => item.urgency === 'urgent' || item.urgency === 'high');
  }, [news]);

  const refreshNews = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    lastFetch,
    refreshNews,
    getNewsByCategory,
    getBreakingNews,
    getUrgentNews
  };
};

export default useCityNews;