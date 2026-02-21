import { Moon, SunDim } from 'lucide-react';
import { useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

interface AnimatedThemeTogglerProps {
  className?: string;
}

export const AnimatedThemeToggler = ({ className }: AnimatedThemeTogglerProps) => {
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  
  const isDarkMode = theme === 'dark';
  
  const changeTheme = async () => {
    if (!buttonRef.current) return;

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    try {
      if (document.startViewTransition) {
        await document.startViewTransition(async () => {
          setTheme(isDarkMode ? 'light' : 'dark');
        }).ready;

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRad}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 700,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      } else {
        // Fallback for browsers that don't support View Transitions
        setTheme(isDarkMode ? 'light' : 'dark');
      }
    } catch (e) {
      // Fallback in case of any errors
      setTheme(isDarkMode ? 'light' : 'dark');
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={changeTheme}
      className={`p-2 ${
        isDarkMode
          ? 'text-gray-300 hover:text-white'
          : 'text-gray-600 hover:text-gray-800'
      } transition-colors ${className || ''}`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
    >
      {isDarkMode ? <SunDim size={24} /> : <Moon size={24} />}
    </motion.button>
  );
};
