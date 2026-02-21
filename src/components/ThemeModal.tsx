import React from 'react';
import { X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
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
          <h3 className="text-lg font-semibold">Select Theme</h3>
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
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-6 rounded-xl flex flex-col items-center justify-center border ${
                theme === 'light' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sun size={32} className="mb-3" />
              <span className="font-medium">Light</span>
            </button>
            
            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-6 rounded-xl flex flex-col items-center justify-center border ${
                theme === 'dark' 
                  ? 'border-blue-500 bg-gray-800 text-blue-400' 
                  : 'border-gray-200 bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Moon size={32} className="mb-3" />
              <span className="font-medium">Dark</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeModal;
