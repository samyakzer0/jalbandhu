# SagarSetu Deployment Guide
## Ocean Hazard Reporting Platform for INCOIS Integration

This comprehensive guide will walk you through setting up SagarSetu from development to production deployment, including all necessary integrations and configurations.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Configuration](#environment-configuration)
5. [INCOIS Integration Setup](#incois-integration-setup)
6. [Social Media API Configuration](#social-media-api-configuration)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: 18.x or later
- **NPM/Yarn**: Latest stable version
- **Git**: For version control
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

### External Services Required
- **Supabase Account**: For backend and database
- **Firebase Account**: For push notifications
- **Perplexity Pro API**: For NLP processing
- **Social Media API Access**: Twitter, Facebook, YouTube
- **INCOIS API Access**: For early warning integration
- **Cloudinary Account**: For image storage (optional)

## Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-organization/sagar-setu.git
cd sagar-setu
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp env.example .env
```

Edit `.env` with your actual configuration values (see [Environment Configuration](#environment-configuration) below).

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Configuration

### Supabase Setup

#### 1. Create Supabase Project
1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key

#### 2. Run Database Schema
Execute the SQL script in Supabase SQL Editor:

```bash
# Navigate to your Supabase project dashboard
# Go to SQL Editor
# Copy and paste the contents of database/sagar-setu-ocean-hazard-schema.sql
# Execute the script
```

#### 3. Configure Row Level Security (RLS)
```sql
-- Enable RLS on main tables
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (examples)
CREATE POLICY "Users can view all reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reports" ON reports FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);
```

#### 4. Set up Storage Buckets
Create the following buckets in Supabase Storage:
- `hazard-images` (Public)
- `social-media-cache` (Private)
- `ai-training-data` (Private)

### Database Performance Optimization

#### Indexes
The schema includes comprehensive indexes, but monitor query performance and add additional indexes as needed:

```sql
-- Example: Add index for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_reports_created_hazard 
ON reports(created_at DESC, hazard_type) 
WHERE status != 'resolved';
```

#### Connection Pooling
Configure connection pooling in Supabase dashboard:
- **Pool Mode**: Transaction
- **Pool Size**: 15
- **Max Client Connections**: 200

## Environment Configuration

### Core Configuration
```env
# Backend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# AI/NLP Services
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
```

### Social Media APIs

#### Twitter API Setup
1. Apply for Twitter Developer Account
2. Create new app and get credentials
3. Configure webhook endpoints

```env
VITE_TWITTER_BEARER_TOKEN=your_bearer_token
VITE_TWITTER_CONSUMER_KEY=your_consumer_key
VITE_TWITTER_CONSUMER_SECRET=your_consumer_secret
```

#### Facebook Graph API
1. Create Facebook Developer App
2. Add permissions for public post access
3. Generate long-lived access token

```env
VITE_FACEBOOK_APP_ID=your_app_id
VITE_FACEBOOK_ACCESS_TOKEN=your_access_token
```

#### YouTube Data API
1. Enable YouTube Data API v3 in Google Cloud Console
2. Create API credentials
3. Set up quota monitoring

```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

### Firebase Configuration
1. Create Firebase project
2. Enable Cloud Messaging
3. Generate service account key

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

### Maps and Location Services
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## INCOIS Integration Setup

### API Access Setup
1. Contact INCOIS for API access credentials
2. Obtain necessary permissions for:
   - Early warning data access
   - Sensor data feeds
   - Coastal zone information

```env
VITE_INCOIS_API_KEY=your_incois_api_key
VITE_INCOIS_ENDPOINT=https://api.incois.gov.in/v1
VITE_IMD_API_KEY=your_imd_weather_api_key
```

### Data Synchronization
Configure scheduled data sync jobs:

```javascript
// Example sync configuration
const INCOIS_SYNC_CONFIG = {
  early_warnings: {
    interval: '5 minutes',
    endpoint: '/early-warnings',
    batch_size: 100
  },
  sensor_data: {
    interval: '1 minute',
    endpoint: '/sensor-data',
    retention_hours: 168 // 1 week
  },
  tide_data: {
    interval: '15 minutes',
    endpoint: '/tide-gauges',
    coastal_zones: ['all']
  }
};
```

### Webhook Configuration
Set up webhooks for real-time updates:

```bash
# Register webhook endpoints with INCOIS
POST https://api.incois.gov.in/v1/webhooks
{
  "url": "https://your-domain.com/api/incois/webhook",
  "events": ["warning.issued", "warning.updated", "sensor.alert"],
  "secret": "your_webhook_secret"
}
```

## Social Media API Configuration

### Real-time Monitoring Setup

#### Twitter Streaming
```javascript
// Configure Twitter streaming rules
const twitterStreamingRules = [
  {
    value: 'tsunami OR "tidal wave" OR "high waves" lang:en',
    tag: 'ocean_hazards_en'
  },
  {
    value: 'तूफान OR लहरें OR समुद्री lang:hi',
    tag: 'ocean_hazards_hi'
  },
  {
    value: 'சுனாமி OR அலை OR கடல் lang:ta',
    tag: 'ocean_hazards_ta'
  }
];
```

#### Facebook Monitoring
```javascript
// Facebook page and group monitoring
const facebookMonitoring = {
  pages: [
    'IndianCoastGuard',
    'INCOISOfficial',
    'DisasterManagementIndia'
  ],
  keywords: [
    'cyclone', 'storm surge', 'high waves',
    'coastal flooding', 'tsunami', 'marine emergency'
  ],
  check_interval: 300000 // 5 minutes
};
```

### NLP Processing Pipeline

#### Perplexity Pro Integration
```javascript
const perplexityConfig = {
  api_key: process.env.VITE_PERPLEXITY_API_KEY,
  model: 'llama-3.1-sonar-large-128k-online',
  max_tokens: 1000,
  temperature: 0.1,
  system_prompt: `You are an ocean hazard detection AI for INCOIS. 
    Analyze social media posts for tsunami, storm surge, high waves, 
    coastal erosion, marine debris, and unusual sea behavior. 
    Return classification, confidence score (0-1), and urgency level (1-5).`
};
```

## Production Deployment

### Hosting Options

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Configure project
vercel

# Deploy to production
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

#### Option 2: Netlify
```bash
# Build for production
npm run build

# Deploy to Netlify
# Upload dist/ folder or connect Git repository
```

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option 3: Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### SSL Certificate Setup
```bash
# For custom domains, set up SSL
# Vercel/Netlify handle this automatically
# For self-hosted, use Let's Encrypt
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### CDN Configuration
Configure CDN for optimal performance:
- **Static Assets**: Images, CSS, JS files
- **API Responses**: Cache frequently accessed data
- **Geographic Distribution**: Serve from locations closest to users

### Environment Variables in Production
Set all environment variables in your hosting platform:

**Vercel**:
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

**Netlify**:
Set in Netlify dashboard under Site settings > Environment variables

## Monitoring & Maintenance

### Application Monitoring

#### Performance Monitoring
```javascript
// Configure application monitoring
const monitoring = {
  performance: {
    core_web_vitals: true,
    api_response_times: true,
    error_tracking: true
  },
  social_media: {
    api_rate_limits: true,
    processing_delays: true,
    classification_accuracy: true
  },
  incois: {
    webhook_health: true,
    data_sync_status: true,
    alert_delivery: true
  }
};
```

#### Error Tracking
Set up error tracking with services like:
- **Sentry**: For client-side and API errors
- **LogRocket**: For user session recording
- **DataDog**: For infrastructure monitoring

### Health Checks
```javascript
// Health check endpoints
const healthChecks = {
  '/api/health': 'Basic service health',
  '/api/health/database': 'Database connectivity',
  '/api/health/social-media': 'Social media API status',
  '/api/health/incois': 'INCOIS integration status',
  '/api/health/nlp': 'NLP service availability'
};
```

### Backup Strategy

#### Database Backups
```bash
# Automated daily backups
# Supabase provides automatic backups, but also set up custom backups
pg_dump -h your-supabase-host -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

#### Configuration Backups
```bash
# Backup environment configurations
# Store securely in version control (encrypted)
git add .env.production.encrypted
git commit -m "Update production environment config"
```

### Performance Optimization

#### Caching Strategy
```javascript
const cacheConfig = {
  redis: {
    host: 'your-redis-host',
    port: 6379,
    ttl: {
      social_media_posts: 3600, // 1 hour
      incois_warnings: 1800,    // 30 minutes
      user_sessions: 86400      // 24 hours
    }
  }
};
```

#### Database Optimization
```sql
-- Regular maintenance queries
ANALYZE reports;
VACUUM social_media_posts;

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## Security Considerations

### API Security
```javascript
// Rate limiting configuration
const rateLimits = {
  api: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
  },
  social_media: {
    window: 60 * 1000, // 1 minute
    max: 10 // requests per minute
  }
};
```

### Data Encryption
- **At Rest**: Supabase provides encryption at rest
- **In Transit**: All API calls use HTTPS/TLS
- **API Keys**: Store securely, rotate regularly

### Access Control
```javascript
// Role-based access control
const permissions = {
  'coastal_citizen': ['read:reports', 'create:reports'],
  'incois_official': ['read:all', 'write:warnings', 'admin:users'],
  'coast_guard_officer': ['read:all', 'write:responses'],
  'system_admin': ['admin:all']
};
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/reports?select=*&limit=1"
```

#### 2. Social Media API Rate Limits
```javascript
// Monitor rate limit headers
const checkRateLimit = (response) => {
  console.log('Rate Limit Remaining:', response.headers['x-rate-limit-remaining']);
  console.log('Rate Limit Reset:', new Date(response.headers['x-rate-limit-reset'] * 1000));
};
```

#### 3. NLP Processing Delays
```javascript
// Implement timeout and retry logic
const nlpWithRetry = async (text, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await perplexityAPI.analyze(text, { timeout: 30000 });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

#### 4. INCOIS Integration Issues
```javascript
// Webhook verification
const verifyINCOISWebhook = (payload, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.INCOIS_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};
```

### Logs and Debugging

#### Application Logs
```javascript
// Structured logging
const log = {
  info: (message, meta = {}) => console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date().toISOString() })),
  error: (message, error = {}) => console.error(JSON.stringify({ level: 'error', message, error: error.message, stack: error.stack, timestamp: new Date().toISOString() })),
  warn: (message, meta = {}) => console.warn(JSON.stringify({ level: 'warn', message, meta, timestamp: new Date().toISOString() }))
};
```

#### Performance Monitoring
```javascript
// Monitor API response times
const performanceMonitor = {
  startTime: process.hrtime(),
  endTime: function() {
    const diff = process.hrtime(this.startTime);
    return diff[0] * 1000 + diff[1] * 1e-6; // Convert to milliseconds
  }
};
```

### Support and Maintenance

#### Regular Maintenance Tasks
- **Weekly**: Review system health metrics and error logs
- **Monthly**: Update dependencies and security patches  
- **Quarterly**: Performance optimization and capacity planning
- **Annually**: Security audit and disaster recovery testing

#### Support Contacts
- **Technical Support**: sagarsetu-support@incois.gov.in
- **INCOIS Integration**: api-support@incois.gov.in
- **Emergency Issues**: +91-40-23895000

## Next Steps

After successful deployment:
1. **User Training**: Conduct training sessions for INCOIS personnel
2. **Pilot Testing**: Run pilot programs with selected coastal communities
3. **Monitoring Setup**: Implement comprehensive monitoring and alerting
4. **Feedback Loop**: Establish feedback mechanisms for continuous improvement
5. **Scale Planning**: Plan for scaling as user base grows

This deployment guide provides a comprehensive roadmap for setting up SagarSetu in production. For additional support or specific integration questions, please refer to the documentation or contact the development team.