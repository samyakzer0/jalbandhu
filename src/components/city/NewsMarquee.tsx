import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { AlertTriangle } from 'lucide-react';
import { NewsItem } from '../../hooks/useCityNews';

interface NewsMarqueeProps {
  news: NewsItem[];
  speed?: number; // pixels per second
}

const NewsMarquee: React.FC<NewsMarqueeProps> = ({ news, speed = 25 }) => {
  const { theme } = useTheme();

  if (!news || news.length === 0) return null;

  // Create a continuous string of news items for scrolling
  const newsText = news
    .filter(item => item.isBreaking || item.urgency === 'urgent')
    .map(item => `🚨 ${item.title}`)
    .join(' • ');

  if (!newsText) return null;

  const animationDuration = `${newsText.length / speed}s`;

  return (
    <div className={`${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} border-y ${theme === 'dark' ? 'border-red-800' : 'border-red-200'} py-2 overflow-hidden relative`}>
      <div className="flex items-center">
        <div className={`${theme === 'dark' ? 'bg-red-800' : 'bg-red-600'} text-white px-4 py-1 text-sm font-bold flex items-center space-x-1 z-10`}>
          <AlertTriangle className="w-4 h-4" />
          <span>BREAKING</span>
        </div>
        
        <div className="flex-1 relative">
          <div 
            className={`whitespace-nowrap ${theme === 'dark' ? 'text-red-200' : 'text-red-800'} font-medium`}
            style={{
              animation: `marquee ${animationDuration} linear infinite`
            }}
          >
            {newsText} • {newsText} • {newsText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsMarquee;