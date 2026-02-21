import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Lottie from 'lottie-react';

interface AnimationContainerProps {
  animationPath?: string;
  fallbackImageUrl?: string;
  altText: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

/**
 * A container component that can display either Lottie animations or fallback images
 * if the animation fails to load or is not provided
 */
const AnimationContainer: React.FC<AnimationContainerProps> = ({
  animationPath,
  fallbackImageUrl = "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800",
  altText,
  className = "w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg",
  loop = true,
  autoplay = true
}) => {
  const { theme } = useTheme();
  const [animationData, setAnimationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Load the animation data
  useEffect(() => {
    // Check if animation path is provided
    if (!animationPath) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const fetchAnimation = async () => {
      try {
        setIsLoading(true);
        // Fetch the animation JSON file
        const response = await fetch(animationPath);
        if (!response.ok) {
          throw new Error(`Failed to load animation: ${response.statusText}`);
        }
        const data = await response.json();
        setAnimationData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading animation:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    fetchAnimation();
  }, [animationPath]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`${className} overflow-hidden relative flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading animation...</p>
        </div>
      </div>
    );
  }

  // Show animation if loaded successfully
  if (animationData && !hasError) {
    return (
      <div className={`${className} overflow-hidden relative rounded-2xl`}>
        <Lottie
          animationData={animationData}
          loop={loop}
          autoplay={autoplay}
          style={{ width: '100%', height: '100%' }}
          aria-label={altText}
        />
      </div>
    );
  }

  // Show fallback image or placeholder if animation failed or is not provided
  return (
    <div className={`${className} overflow-hidden relative`}>
      {fallbackImageUrl ? (
        <img 
          src={fallbackImageUrl} 
          alt={altText} 
          className="w-full h-full object-cover rounded-2xl"
        />
      ) : (
        <div 
          className={`w-full h-full flex items-center justify-center bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-gray-800 to-gray-700' 
              : 'from-gray-100 to-gray-200'
          }`}
        >
          <div className="text-center p-4">
            <div 
              className={`w-16 h-16 mx-auto mb-4 rounded-full animate-pulse ${
                theme === 'dark' ? 'bg-blue-700' : 'bg-blue-500'
              }`}
            ></div>
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {altText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationContainer;
