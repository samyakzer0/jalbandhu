import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface AnimatedBackgroundProps {
  className?: string;
  lottieSrc?: string;
  intensity?: 'subtle' | 'medium' | 'intense';
  position?: 'center' | 'right' | 'left' | 'top-right' | 'bottom-right';
  size?: 'small' | 'medium' | 'large' | 'full';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className = '',
  lottieSrc = "https://lottie.host/55060920-220a-4d87-b87e-a78fe3d5c4be/8HzZUBUqmQ.lottie",
  intensity = 'intense',
  position = 'center',
  size = 'medium'
}) => {
  const getOpacity = () => {
    switch (intensity) {
      case 'subtle': return 0.3;
      case 'medium': return 0.5;
      case 'intense': return 0.8;
      default: return 0.5;
    }
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      pointerEvents: 'none' as const,
      opacity: getOpacity(),
      objectFit: 'cover' as const,
    };

    switch (position) {
      case 'center':
        return {
          ...baseStyles,
          width: '200%',
          height: '100%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      case 'right':
        return {
          ...baseStyles,
          width: size === 'small' ? '40%' : size === 'large' ? '70%' : '50%',
          height: size === 'small' ? '60%' : size === 'large' ? '90%' : '80%',
          top: '50%',
          right: '5%',
          transform: 'translateY(-50%)',
        };
      case 'left':
        return {
          ...baseStyles,
          width: size === 'small' ? '40%' : size === 'large' ? '70%' : '50%',
          height: size === 'small' ? '60%' : size === 'large' ? '90%' : '80%',
          top: '50%',
          left: '5%',
          transform: 'translateY(-50%)',
        };
      case 'top-right':
        return {
          ...baseStyles,
          width: size === 'small' ? '35%' : size === 'large' ? '60%' : '45%',
          height: size === 'small' ? '50%' : size === 'large' ? '75%' : '65%',
          top: '10%',
          right: '5%',
        };
      case 'bottom-right':
        return {
          ...baseStyles,
          width: size === 'small' ? '35%' : size === 'large' ? '60%' : '45%',
          height: size === 'small' ? '50%' : size === 'large' ? '75%' : '65%',
          bottom: '10%',
          right: '5%',
        };
      default:
        return {
          ...baseStyles,
          width: '100%',
          height: '100%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const positionStyles = getPositionStyles();

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <DotLottieReact
        src={lottieSrc}
        loop
        autoplay
        style={positionStyles}
      />
    </div>
  );
};

export default AnimatedBackground;
