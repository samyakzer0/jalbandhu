import React from 'react';
import NotificationCenter from '../NotificationCenter';

interface NotificationIconProps {
  userId: string;
  onNavigate?: (page: string) => void;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ userId, onNavigate }) => {
  // Now we just render the enhanced notification center component
  return (
    <NotificationCenter 
      userId={userId} 
      onNavigate={onNavigate || (() => {})} 
    />
  );
};

export default NotificationIcon;
