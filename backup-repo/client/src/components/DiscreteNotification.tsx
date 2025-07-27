import React, { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface DiscreteNotificationProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

const DiscreteNotification: React.FC<DiscreteNotificationProps> = ({
  message,
  type = 'success',
  duration = 4000,
  onClose,
  show = false
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      console.log('DiscreteNotification ATIVADA:', message);
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [show, duration, onClose, message]);

  if (!isVisible || !show) {
    console.log('DiscreteNotification NÃO VISÍVEL:', { isVisible, show, message });
    return null;
  }
  
  console.log('DiscreteNotification RENDERIZANDO:', message);

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  return (
    <div 
      className="fixed top-20 right-4 z-[99999] max-w-sm"
      style={{ position: 'fixed', top: '80px', right: '16px', zIndex: 99999 }}
    >
      <div className="bg-green-100 border-2 border-green-300 text-green-800 rounded-lg p-4 shadow-2xl flex items-center space-x-3">
        <CheckCircle className="w-6 h-6 flex-shrink-0 text-green-600" />
        <span className="text-base font-bold flex-1">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="text-green-600 hover:text-green-800 transition-colors ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DiscreteNotification;