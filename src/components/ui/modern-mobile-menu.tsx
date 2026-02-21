import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Home, Plus, FileText, User, ShieldAlert, Share2 } from 'lucide-react';

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  page: string;
  adminOnly?: boolean;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  onNavigate?: (page: string) => void;
  currentPage?: string;
  isAdmin?: boolean;
}

const defaultItems: InteractiveMenuItem[] = [
  { label: 'Home', icon: Home, page: 'home' },
  { label: 'Report', icon: Plus, page: 'report' },
  { label: 'Status', icon: FileText, page: 'status' },
  { label: 'Social Media', icon: Share2, page: 'social-media' },
  { label: 'Profile', icon: User, page: 'profile' },
];

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
  items,
  accentColor,
  onNavigate,
  currentPage = 'home',
  isAdmin = false
}) => {
  const baseItems = items || defaultItems;

  const finalItems = useMemo(() => {
    let menuItems = [...baseItems];

    // Add admin button for all users
    menuItems.push({
      label: 'Admin',
      icon: ShieldAlert,
      page: 'admin',
      adminOnly: false
    });

    const isValid = menuItems && Array.isArray(menuItems) && menuItems.length >= 2 && menuItems.length <= 6;
    if (!isValid) {
      console.warn("InteractiveMenu: 'items' prop is invalid or missing. Using default items.", menuItems);
      return defaultItems;
    }
    return menuItems;
  }, [baseItems]);

  // Find active index based on current page
  const activeIndex = useMemo(() => {
    const index = finalItems.findIndex(item => item.page === currentPage);
    return index >= 0 ? index : 0;
  }, [finalItems, currentPage]);

  const [activeIndexState, setActiveIndexState] = useState(activeIndex);

  useEffect(() => {
    setActiveIndexState(activeIndex);
  }, [activeIndex]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndexState];
      const activeTextElement = textRefs.current[activeIndexState];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();

    window.addEventListener('resize', setLineWidth);
    return () => {
      window.removeEventListener('resize', setLineWidth);
    };
  }, [activeIndexState, finalItems]);

  const handleItemClick = (index: number) => {
    setActiveIndexState(index);
    const item = finalItems[index];
    if (onNavigate && item) {
      onNavigate(item.page);
    }
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || '#3b82f6'; // Default blue color
    
    // Extract RGB values from rgb() format or use hex
    let rgbValues: string;
    if (activeColor.startsWith('rgb(')) {
      // Extract values from rgb(59 130 246) format
      const match = activeColor.match(/rgb\(([^)]+)\)/);
      rgbValues = match ? match[1] : '59 130 246';
    } else if (activeColor.startsWith('#')) {
      // Convert hex to RGB space-separated format
      const hex = activeColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      rgbValues = `${r} ${g} ${b}`;
    } else {
      rgbValues = '59 130 246'; // Default blue
    }
    
    return { 
      '--component-active-color': rgbValues,
      '--component-active-color-rgb': rgbValues
    } as React.CSSProperties;
  }, [accentColor]);

  return (
    <nav
      className="menu"
      role="navigation"
      style={navStyle}
    >
      {finalItems.map((item, index) => {
        const isActive = index === activeIndexState;
        const isTextActive = isActive;

        const IconComponent = item.icon;

        return (
          <button
            key={item.page}
            className={`menu__item ${isActive ? 'active' : ''}`}
            onClick={() => handleItemClick(index)}
            ref={(el) => (itemRefs.current[index] = el)}
            style={{ '--lineWidth': '0px' } as React.CSSProperties}
          >
            <div className="menu__icon">
              <IconComponent className="icon" />
            </div>
            <strong
              className={`menu__text ${isTextActive ? 'active' : ''}`}
              ref={(el) => (textRefs.current[index] = el)}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
};

export { InteractiveMenu };