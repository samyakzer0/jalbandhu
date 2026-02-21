import React from 'react';
import { clsx } from 'clsx';
import { AlertTriangle, Clock, CheckCircle, Send, Zap, AlertCircle, Info } from 'lucide-react';

// Badge variants for different types of indicators
const badgeVariants = {
  // Status variants
  submitted: {
    light: 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100/50',
    dark: 'bg-blue-900/20 text-blue-300 border-blue-800 shadow-blue-900/20',
    icon: Send
  },
  reviewed: {
    light: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100/50',
    dark: 'bg-amber-900/20 text-amber-300 border-amber-800 shadow-amber-900/20',
    icon: Clock
  },
  verified: {
    light: 'bg-green-50 text-green-700 border-green-200 shadow-green-100/50',
    dark: 'bg-green-900/20 text-green-300 border-green-800 shadow-green-900/20',
    icon: CheckCircle
  },

  // Priority variants
  low: {
    light: 'bg-slate-50 text-slate-600 border-slate-200 shadow-slate-100/50',
    dark: 'bg-slate-800/20 text-slate-400 border-slate-700 shadow-slate-800/20',
    icon: Info
  },
  medium: {
    light: 'bg-yellow-50 text-yellow-700 border-yellow-200 shadow-yellow-100/50',
    dark: 'bg-yellow-900/20 text-yellow-300 border-yellow-800 shadow-yellow-900/20',
    icon: AlertCircle
  },
  high: {
    light: 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100/50',
    dark: 'bg-orange-900/20 text-orange-300 border-orange-800 shadow-orange-900/20',
    icon: AlertTriangle
  },
  urgent: {
    light: 'bg-red-50 text-red-700 border-red-200 shadow-red-100/50',
    dark: 'bg-red-900/20 text-red-300 border-red-800 shadow-red-900/20',
    icon: Zap
  },

  // Special variants
  smart_camera: {
    light: 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 shadow-blue-100/50',
    dark: 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 text-blue-300 border-blue-800 shadow-blue-900/20',
    icon: null
  },
  review: {
    light: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100/50',
    dark: 'bg-amber-900/20 text-amber-300 border-amber-800 shadow-amber-900/20',
    icon: Clock
  }
};

// Size variants
const sizeVariants = {
  sm: 'text-xs px-2 py-1 gap-1.5',
  md: 'text-sm px-3 py-1.5 gap-2',
  lg: 'text-base px-4 py-2 gap-2.5'
};

interface BadgeProps {
  children: React.ReactNode;
  variant: keyof typeof badgeVariants;
  size?: keyof typeof sizeVariants;
  showIcon?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  size = 'md',
  showIcon = true,
  className,
  theme = 'light'
}) => {
  const variantConfig = badgeVariants[variant];

  // Fallback for unknown variants
  if (!variantConfig) {
    console.warn(`Badge: Unknown variant "${variant}". Using fallback.`);
    return (
      <span
        className={clsx(
          // Base styles with fallback
          'inline-flex items-center font-semibold rounded-full border shadow-sm',
          'transition-all duration-200 ease-in-out',
          'backdrop-blur-sm',
          'bg-gray-100 text-gray-800 border-gray-300',
          // Size styles
          sizeVariants[size],
          // Custom className
          className
        )}
      >
        <span className="leading-none">{children}</span>
      </span>
    );
  }

  const IconComponent = variantConfig.icon;

  return (
    <span
      className={clsx(
        // Base styles
        'inline-flex items-center font-semibold rounded-full border shadow-sm',
        'transition-all duration-200 ease-in-out',
        'backdrop-blur-sm',
        // Size styles
        sizeVariants[size],
        // Variant styles
        theme === 'light' ? variantConfig.light : variantConfig.dark,
        // Custom className
        className
      )}
    >
      {showIcon && IconComponent && (
        <IconComponent
          size={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
          className="flex-shrink-0"
        />
      )}
      <span className="leading-none">{children}</span>
    </span>
  );
};

// Specialized badge components for common use cases
export const StatusBadge: React.FC<{
  status: 'Submitted' | 'Reviewed' | 'Verified';
  size?: keyof typeof sizeVariants;
  showIcon?: boolean;
  theme?: 'light' | 'dark';
}> = ({ status, ...props }) => {
  const variantMap = {
    'Submitted': 'submitted' as const,
    'Reviewed': 'reviewed' as const,
    'Verified': 'verified' as const
  };

  return (
    <Badge
      variant={variantMap[status]}
      {...props}
    >
      {status}
    </Badge>
  );
};

export const PriorityBadge: React.FC<{
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  size?: keyof typeof sizeVariants;
  showIcon?: boolean;
  theme?: 'light' | 'dark';
}> = ({ priority, ...props }) => {
  const variantMap = {
    'Low': 'low' as const,
    'Medium': 'medium' as const,
    'High': 'high' as const,
    'Urgent': 'urgent' as const
  };

  return (
    <Badge
      variant={variantMap[priority]}
      {...props}
    >
      {priority}
    </Badge>
  );
};

export const SmartCameraBadge: React.FC<{
  size?: keyof typeof sizeVariants;
  theme?: 'light' | 'dark';
}> = (props) => (
  <Badge
    variant="smart_camera"
    showIcon={false}
    {...props}
  >
    📸 Smart Camera
  </Badge>
);

export const ReviewBadge: React.FC<{
  size?: keyof typeof sizeVariants;
  theme?: 'light' | 'dark';
}> = (props) => (
  <Badge
    variant="review"
    {...props}
  >
    Review
  </Badge>
);