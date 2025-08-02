import React from 'react';

interface SimpleProgressBarProps {
  progress?: number;
  percentage?: number;
  className?: string;
  showLabel?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
}

const SimpleProgressBar: React.FC<SimpleProgressBarProps> = ({ 
  progress,
  percentage,
  className = '', 
  showLabel = true,
  showPercentage = true,
  animated = false
}) => {
  // Use progress prop if available, fallback to percentage
  const value = progress !== undefined ? progress : (percentage || 0);
  const safePercentage = Math.min(Math.max(isNaN(value) ? 0 : value, 0), 100);

  // Color logic: vermelho < 50%, laranja 50-69%, amarelo 70-99%, verde 100%
  const getProgressColor = () => {
    if (safePercentage < 50) {
      return 'bg-red-500 dark:bg-red-600';
    } else if (safePercentage < 70) {
      return 'bg-orange-500 dark:bg-orange-600';
    } else if (safePercentage < 100) {
      return 'bg-yellow-500 dark:bg-yellow-600';
    } else {
      return 'bg-green-500 dark:bg-green-600';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()} ${
              animated ? 'shimmer-effect' : ''
            } ${safePercentage >= 100 ? 'pulse-completed' : ''}`}
            style={{ width: `${safePercentage}%` }}
          >
            {safePercentage >= 100 && (
              <span className="confetti-emoji">🎉</span>
            )}
          </div>
        </div>
        {(showLabel || showPercentage) && (
          <span className="text-xs text-gray-600 dark:text-gray-300 font-medium min-w-[35px]">
            {safePercentage.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default SimpleProgressBar;