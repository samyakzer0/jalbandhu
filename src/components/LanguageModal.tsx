import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { languages, Language } from '../utils/translations';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { language, setLanguage, theme } = useTheme();

  if (!isOpen) return null;

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        } rounded-xl w-full max-w-md shadow-lg overflow-hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Select Language</h3>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full ${
              theme === 'dark' 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            {Object.entries(languages).map(([code, name]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as Language)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                  language === code 
                    ? theme === 'dark'
                      ? 'bg-blue-900 text-blue-100'
                      : 'bg-blue-100 text-blue-800'
                    : theme === 'dark'
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span>{name}</span>
                {language === code && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LanguageModal;
