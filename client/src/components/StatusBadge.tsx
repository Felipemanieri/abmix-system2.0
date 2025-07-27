import React from 'react';
import { ProposalStatus, STATUS_CONFIG } from '@shared/statusSystem';

interface StatusBadgeProps {
  status: ProposalStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['observacao']; // Fallback para observacao se status não existir
  
  if (!config) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 dark:text-white border-gray-300 dark:border-gray-600 ${className}`}>
        {status || 'N/A'}
      </span>
    );
  }
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${config.bgColor} ${config.textColor} ${className}`}
      title={config.description}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;