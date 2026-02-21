import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useRef } from 'react';

interface CameraButtonProps {
  className?: string;
  onNavigate: (page: string) => void;
}

const CameraButton = ({ className, onNavigate }: CameraButtonProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    // Check if user is on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && fileInputRef.current) {
      // On mobile, trigger native camera app
      fileInputRef.current.click();
    } else {
      // On desktop, navigate to report page (camera will be handled by the in-page camera)
      onNavigate('report');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Convert file to base64 and store temporarily
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        // Store the captured image in localStorage for the report page
        localStorage.setItem('capturedImage', imageData);
        // Navigate to report page
        onNavigate('report');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <motion.button
        onClick={handleCameraClick}
        className={`p-2 ${
          isDarkMode
            ? 'text-gray-300 hover:text-white'
            : 'text-gray-600 hover:text-gray-800'
        } transition-colors ${className || ''}`}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        aria-label="Open camera"
      >
        <Camera size={24} />
      </motion.button>

      {/* Hidden file input for native camera on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        style={{ display: 'none' }}
      />
    </>
  );
};

export default CameraButton;
