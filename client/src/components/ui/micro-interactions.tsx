import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info, Star, Heart, ThumbsUp } from 'lucide-react';

// Toast de notificação com micro-interações
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export const MicroToast: React.FC<ToastProps> = ({ message, type, duration = 4000, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-4 right-4 z-50 ${colors[type]} px-4 py-3 rounded-lg shadow-lg min-w-80 max-w-md`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          {icons[type]}
        </motion.div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Barra de progresso animada */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </motion.div>
  );
};

// Botão com micro-interações avançadas
interface MicroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const MicroButton: React.FC<MicroButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = ''
}) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (disabled || loading) return;
    
    setClicked(true);
    setTimeout(() => setClicked(false), 200);
    onClick?.();
  };

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200 
        ${variants[variant]} ${sizes[size]} ${className}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
      `}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      initial={false}
      animate={clicked ? { scale: 0.95 } : { scale: 1 }}
    >
      <AnimatePresence>
        {clicked && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
      
      {loading ? (
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span>Carregando...</span>
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
};

// Card com hover interativo
interface MicroCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const MicroCard: React.FC<MicroCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = true
}) => {
  return (
    <motion.div
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
        ${onClick ? 'cursor-pointer' : ''} ${className}
      `}
      onClick={onClick}
      whileHover={hoverable ? {
        scale: 1.02,
        y: -2,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Input com animações de foco
interface MicroInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const MicroInput: React.FC<MicroInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <motion.label
        className={`
          absolute left-3 transition-all duration-200 pointer-events-none
          ${focused || value ? 'text-xs -top-2 bg-white dark:bg-gray-800 px-1 text-blue-600' : 'text-sm top-3 text-gray-500'}
        `}
        animate={{
          y: focused || value ? -8 : 0,
          scale: focused || value ? 0.85 : 1,
        }}
      >
        {label} {required && '*'}
      </motion.label>
      
      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={focused ? placeholder : ''}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          w-full px-3 py-3 border rounded-lg bg-white dark:bg-gray-800 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
        `}
        whileFocus={{ scale: 1.01 }}
      />
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-xs mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sistema de reações com animações
interface ReactionButtonProps {
  icon: React.ReactNode;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  icon,
  count,
  active,
  onClick,
  color
}) => {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    onClick();
  };

  return (
    <motion.button
      className={`
        flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all duration-200
        ${active ? `bg-${color}-100 border-${color}-500 text-${color}-600` : 'bg-gray-100 border-gray-300 text-gray-600'}
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${color}-500
      `}
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={animating ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <span className="text-sm font-medium">{count}</span>
    </motion.button>
  );
};

// Loading Skeleton com animação shimmer
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}>
      <motion.div
        className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ x: [-200, 200] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

// Progress Bar animado
interface MicroProgressProps {
  value: number;
  max: number;
  label?: string;
  color?: string;
}

export const MicroProgress: React.FC<MicroProgressProps> = ({
  value,
  max,
  label,
  color = 'blue'
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className="text-sm text-gray-500">{value}/{max}</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full bg-${color}-600 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};