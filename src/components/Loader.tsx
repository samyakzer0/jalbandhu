import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
  showMessage?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'medium',
  message = 'Loading...',
  className = '',
  showMessage = true
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return { width: '60px', height: '60px' };
      case 'medium': return { width: '100px', height: '100px' };
      case 'large': return { width: '150px', height: '150px' };
      default: return { width: '100px', height: '100px' };
    }
  };

  const sizeStyle = getSize();

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <DotLottieReact
        src="https://lottie.host/a509ed5c-742d-403a-8dd1-5611f263a780/k2MAhuywVf.lottie"
        loop
        autoplay
        style={{
          width: sizeStyle.width,
          height: sizeStyle.height,
          opacity: 0.8
        }}
      />
      {showMessage && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
