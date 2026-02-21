import React from 'react';
import { Check, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';

interface ReportConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  onViewStatus: () => void;
}

function ReportConfirmationModal({
  isOpen,
  onClose,
  reportId,
  onViewStatus
}: ReportConfirmationModalProps) {
  const { theme, language } = useTheme();
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        } rounded-xl w-full max-w-md shadow-lg overflow-hidden animate-fade-in`}
      >
        <div className="p-6 text-center">
          <div 
            className={`mx-auto flex items-center justify-center w-16 h-16 mb-6 rounded-full ${
              theme === 'dark' ? 'bg-green-900' : 'bg-green-100'
            }`}
          >
            <Check 
              size={32} 
              className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} 
            />
          </div>
          
          <h3 className="text-xl font-bold mb-2">
            {t.reportSubmitted || 'Report Submitted Successfully!'}
          </h3>
          
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.yourReferenceNumber || 'Your reference number is:'}
          </p>
          
          <div 
            className={`py-3 px-4 mb-6 rounded-lg font-mono text-lg font-semibold ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            {reportId}
          </div>
          
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.statusUpdateNotification || 'You will receive notifications when your report status changes.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className={`py-3 px-6 rounded-xl font-semibold flex-1 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } transition-colors`}
            >
              {t.close || 'Close'}
            </button>
            
            <button
              onClick={onViewStatus}
              className={`py-3 px-6 rounded-xl font-semibold flex-1 ${
                theme === 'dark' 
                  ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } transition-colors`}
            >
              {t.viewStatus || 'View Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportConfirmationModal;
