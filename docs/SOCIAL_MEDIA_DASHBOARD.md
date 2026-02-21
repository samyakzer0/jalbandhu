# Social Media Monitoring Dashboard

## Overview

The Social Media Monitoring Dashboard is a real-time system for tracking and analyzing ocean hazard discussions across Twitter, Facebook, and YouTube. It provides comprehensive monitoring, analytics, and alerting capabilities for maritime safety authorities.

## Features

### 🔄 Real-time Data Collection
- **Twitter Integration**: Monitors tweets using Twitter API v2 with advanced search capabilities
- **Facebook Integration**: Tracks public posts via Facebook Graph API
- **YouTube Integration**: Monitors video content using YouTube Data API v3
- **Auto-refresh**: Configurable refresh intervals (default: 30 seconds)
- **Background sync**: Continues monitoring even when browser tab is inactive

### 📊 Advanced Analytics
- **Trending Keywords**: Real-time trending analysis with growth metrics
- **Sentiment Analysis**: AI-powered sentiment classification (positive/negative/neutral)
- **Platform Distribution**: Comparative analytics across social platforms
- **Urgency Classification**: Automatic priority assignment (Low/Medium/High/Urgent)
- **Engagement Metrics**: Likes, shares, comments, and views tracking

### 🎯 Smart Filtering & Search
- **Platform Filtering**: Filter by Twitter, Facebook, or YouTube
- **Hazard Type Filtering**: Tsunami, Storm Surge, High Waves, Coastal Erosion, etc.
- **Urgency Filtering**: Filter by priority level
- **Full-text Search**: Search across post content with debounced input
- **Real-time Filtering**: Instant results without API calls

### 🌍 Geographic Intelligence
- **Location Extraction**: Automatic location detection from posts
- **Geospatial Filtering**: Filter posts by geographic proximity
- **Address Resolution**: Convert coordinates to human-readable addresses

### 🚨 Hazard Detection
Monitors for the following ocean hazards:
- Tsunami and tsunami alerts
- Storm surge and coastal flooding
- High waves and rogue waves
- Coastal erosion and infrastructure damage
- Cyclones, hurricanes, and typhoons
- Sea level rise and king tides
- Marine flooding and saltwater intrusion

## Technical Architecture

### Frontend Components

#### SocialMediaDashboard.tsx
Main dashboard component with:
- Responsive grid layout (1/2/3 columns based on screen size)
- Real-time stats cards with animated counters
- Advanced filter panel with multiple criteria
- Infinite scroll posts list with engagement metrics
- Sidebar with trending keywords and platform distribution

#### useSocialMediaData Hook
Custom React hook providing:
- Automatic data fetching and caching
- Error handling with exponential backoff retry
- Real-time updates via WebSocket/SSE simulation
- Optimistic UI updates
- Background refresh on tab visibility change

### Backend Services

#### SocialMediaService.ts
Core service handling:
- **API Integration**: Direct calls to social media APIs
- **Data Processing**: NLP analysis, sentiment detection, keyword extraction
- **Data Storage**: Automatic persistence to Supabase database
- **Duplicate Prevention**: Prevents storing duplicate posts
- **Error Handling**: Robust error handling with fallbacks

#### SocialMediaAPI.ts
RESTful API layer providing:
- CRUD operations for social media posts
- Advanced search and filtering endpoints
- Analytics and statistics computation
- Batch operations for admin tasks
- Geospatial queries for location-based filtering

### Database Schema

#### social_media_posts
```sql
- id: UUID (Primary Key)
- original_id: TEXT (Unique identifier from source platform)
- platform: TEXT (twitter/facebook/youtube)
- content: TEXT (Post content)
- author: TEXT (Author name)
- author_handle: TEXT (Username/handle)
- timestamp: TIMESTAMP (Post creation time)
- location: JSONB (Geographic data)
- engagement: JSONB (Likes, shares, comments, views)
- hazard_type: TEXT (Detected hazard category)
- urgency_level: TEXT (Low/Medium/High/Urgent)
- sentiment: TEXT (Positive/Negative/Neutral)
- verified: BOOLEAN (Author verification status)
- nlp_analysis: JSONB (Keywords, confidence, entities)
- media_urls: TEXT[] (Associated images/videos)
```

#### social_media_keywords
```sql
- id: UUID (Primary Key)
- keyword: TEXT (Trending keyword)
- count: INTEGER (Mention count)
- sentiment: TEXT (Dominant sentiment)
- platforms: TEXT[] (Which platforms mentioned it)
- date: DATE (Tracking date)
```

#### social_media_analytics
```sql
- id: UUID (Primary Key)
- date: DATE (Analytics date)
- total_posts: INTEGER
- high_priority_posts: INTEGER
- verified_posts: INTEGER
- platform_distribution: JSONB
- sentiment_distribution: JSONB
- hazard_types: JSONB
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file with the following API keys:

```bash
# Social Media API Keys
VITE_TWITTER_BEARER_TOKEN=your_twitter_bearer_token
VITE_TWITTER_CONSUMER_KEY=your_twitter_consumer_key
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
VITE_YOUTUBE_API_KEY=your_youtube_api_key

# Configuration
VITE_SOCIAL_MEDIA_REFRESH_INTERVAL=30000
VITE_SOCIAL_MEDIA_MAX_POSTS=50
VITE_ENABLE_REAL_TIME_MONITORING=true

# Database
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. API Setup

#### Twitter API v2
1. Create a developer account at https://developer.twitter.com
2. Create a new app and generate Bearer Token
3. Configure API access levels for search capabilities

#### Facebook Graph API
1. Create a Facebook App at https://developers.facebook.com
2. Generate App ID and Access Token
3. Configure permissions for public post access

#### YouTube Data API v3
1. Create a project in Google Cloud Console
2. Enable YouTube Data API v3
3. Generate API key with appropriate quotas

### 3. Database Setup

Run the provided SQL migration:
```bash
psql -d your_database < database/social_media_schema.sql
```

### 4. Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

## Usage Guide

### Dashboard Navigation

1. **Access Dashboard**: Navigate to `/social-media` route or use menu navigation
2. **Real-time Monitoring**: Dashboard automatically refreshes every 30 seconds
3. **Manual Refresh**: Click the refresh button for immediate updates

### Filtering Posts

1. **Platform Filter**: Select Twitter, Facebook, YouTube, or All Platforms
2. **Hazard Type Filter**: Choose specific ocean hazards or All Hazards
3. **Urgency Filter**: Filter by priority level (Urgent/High/Medium/Low/All)
4. **Search**: Enter keywords to search post content
5. **Clear Filters**: Reset all filters to default state

### Understanding Metrics

#### Stats Cards
- **Total Posts**: All monitored posts in current view
- **High Priority**: Posts marked as High or Urgent priority
- **Verified Posts**: Posts from verified/authenticated accounts
- **Trending Keywords**: Number of currently trending hazard-related terms

#### Post Information
- **Platform Icon**: Visual indicator (🐦 Twitter, 📘 Facebook, 📺 YouTube)
- **Author Verification**: Blue checkmark for verified accounts
- **Urgency Level**: Color-coded indicators (Red=Urgent, Orange=High, Yellow=Medium, Green=Low)
- **Engagement**: Likes, shares/retweets, comments, and views
- **Sentiment**: AI-determined positive/negative/neutral classification
- **Confidence**: NLP analysis confidence score

### Trending Analysis

#### Keywords Section
- **Trending Terms**: Most mentioned ocean hazard keywords
- **Mention Count**: Number of times keyword appeared
- **Growth Percentage**: Trending direction (positive/negative)
- **Sentiment Indicator**: Color-coded sentiment dot

#### Platform Distribution
- **Visual Breakdown**: Horizontal bars showing post distribution
- **Real-time Updates**: Automatic recalculation as new posts arrive
- **Proportional Display**: Percentage-based visualization

## API Endpoints

### Posts
- `GET /api/social-media/posts` - Get filtered posts
- `GET /api/social-media/posts/:id` - Get specific post
- `POST /api/social-media/posts/search` - Search posts
- `PUT /api/social-media/posts/batch` - Batch update posts

### Analytics
- `GET /api/social-media/analytics` - Get dashboard statistics
- `GET /api/social-media/keywords/trending` - Get trending keywords
- `GET /api/social-media/stats/platform` - Platform distribution stats

### Admin Operations
- `POST /api/social-media/refresh` - Force data refresh
- `DELETE /api/social-media/cleanup` - Remove old posts
- `PUT /api/social-media/posts/:id/verify` - Mark post as verified

## Performance Optimization

### Client-side Optimizations
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Optimize expensive calculations
- **Virtual Scrolling**: Handle large post lists efficiently
- **Debounced Search**: Reduce API calls during typing
- **Image Lazy Loading**: Load post images on demand

### Server-side Optimizations
- **Database Indexing**: Optimized queries for fast filtering
- **Caching**: Redis layer for frequently accessed data
- **Rate Limiting**: API quota management
- **Batch Processing**: Efficient bulk operations
- **Connection Pooling**: Optimized database connections

## Security Features

### API Security
- **Rate Limiting**: Prevent API abuse
- **Authentication**: Secure API key management
- **Input Validation**: Sanitize all user inputs
- **CORS Configuration**: Proper cross-origin settings

### Data Privacy
- **Data Retention**: Automatic cleanup of old posts
- **PII Filtering**: Remove personally identifiable information
- **Consent Management**: Handle user privacy preferences
- **Audit Logging**: Track all data access and modifications

## Monitoring & Alerts

### System Health
- **API Status**: Monitor social media API availability
- **Database Performance**: Track query response times
- **Error Rates**: Alert on high error frequencies
- **Storage Usage**: Monitor database growth

### Content Monitoring
- **High Priority Alerts**: Immediate notifications for urgent posts
- **Trend Alerts**: Notifications when keywords spike
- **Geographic Alerts**: Location-based emergency notifications
- **Volume Alerts**: Unusual posting activity detection

## Troubleshooting

### Common Issues

#### "Failed to load social media data"
- Check API keys in `.env` file
- Verify API rate limits not exceeded
- Confirm internet connectivity
- Check browser console for detailed errors

#### "No posts found"
- Verify filters aren't too restrictive
- Check if APIs are returning data
- Confirm database connection
- Review search terms for typos

#### Slow Performance
- Check network connection
- Review API rate limits
- Monitor database performance
- Clear browser cache

### Debug Mode
Enable debug logging by setting:
```bash
VITE_DEBUG_SOCIAL_MEDIA=true
```

## Future Enhancements

### Planned Features
- **AI-Powered Classification**: Advanced ML models for hazard detection
- **Multi-language Support**: Support for regional languages
- **Mobile App**: Native iOS/Android applications
- **WebSocket Real-time**: True real-time updates
- **Advanced Analytics**: Predictive modeling and trend analysis
- **Integration APIs**: Connect with emergency response systems

### Scalability Improvements
- **Microservices Architecture**: Separate services for each platform
- **Message Queues**: Asynchronous processing with Redis/RabbitMQ
- **CDN Integration**: Global content delivery for better performance
- **Auto-scaling**: Kubernetes-based container orchestration

## Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Implement comprehensive error handling
3. Add unit tests for new features
4. Update documentation for API changes
5. Test across different browsers and devices

### Code Style
- Use Prettier for code formatting
- Follow ESLint rules
- Add JSDoc comments for functions
- Use meaningful variable names
- Implement proper error boundaries

## License

This social media monitoring dashboard is part of the SagarSetu ocean hazard reporting platform. All rights reserved.

---

For support or questions, please contact the development team or refer to the main project documentation.