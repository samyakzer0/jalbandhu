import React from 'react';
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import Loader from './Loader';

interface AIAnalysisProps {
  isAnalyzing: boolean;
  result: {
    title: string;
    category: string;
    description: string;
    confidence: number;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  } | null;
  onAccept: () => void;
  onReject: () => void;
}

function AIAnalysis({ isAnalyzing, result, onAccept, onReject }: AIAnalysisProps) {
  const { theme, language } = useTheme();
  const t = translations[language];

  if (isAnalyzing) {
    return (
      <div
        className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 flex items-center justify-center`}
        style={{ minHeight: '100px' }}
      >
        <Loader size="small" message={t.analyzing} showMessage={true} />
      </div>
    );
  }  if (!result) {
    return null;
  }

  // Format confidence as percentage
  const confidencePercent = Math.round(result.confidence * 100);

  // Determine confidence level styling
  const getConfidenceColor = () => {
    if (confidencePercent >= 90) {
      return theme === 'dark' ? 'text-green-400' : 'text-green-600';
    } else if (confidencePercent >= 70) {
      return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
    } else {
      return theme === 'dark' ? 'text-red-400' : 'text-red-600';
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-center mb-3">
        <Sparkles className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} size={18} />
        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {t.aiDetected}
        </p>
      </div>
      
      <div className="space-y-3 mb-4">
        {result.description.includes('[MOCK DATA]') && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded mb-3">
            <p className="text-sm">
              <strong>Using Mock AI Data:</strong> Vision API is not available. 
              See VISION_API_TROUBLESHOOTING.md for setup instructions.
            </p>
          </div>
        )}
        
        <div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.title}:
          </p>
          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {result.title}
          </p>
        </div>
        
        <div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.category}:
          </p>
          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {result.category}
          </p>
        </div>
        
        <div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Priority:
          </p>
          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {result.priority}
          </p>
        </div>
        
        <div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.briefDescription}:
          </p>
          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {result.description.replace('[MOCK DATA] ', '')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <p className={`text-xs ${getConfidenceColor()}`}>
          {confidencePercent}% {t.confidence || 'confidence'}
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={onReject}
            className={`p-2 rounded-full ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            <ThumbsDown size={18} />
          </button>
          
          <button
            onClick={onAccept}
            className={`p-2 rounded-full ${
              theme === 'dark' 
                ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
            }`}
          >
            <ThumbsUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAnalysis;
