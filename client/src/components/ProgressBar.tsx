import React from 'react';
import { calculateProposalProgress, getProgressColor, getProgressText, getProgressDetails } from '@shared/progressCalculator';

interface ProgressBarProps {
  proposal: any;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  animated?: boolean; // Nova prop para controlar animação
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  proposal, 
  showDetails = false, 
  size = 'md',
  orientation = 'horizontal',
  className = '',
  animated = false 
}) => {
  // Calcula o progresso baseado nos dados da proposta
  const proposalData = {
    contractData: proposal.contractData || {},
    titulares: proposal.titulares || [],
    dependentes: proposal.dependentes || [],
    clientAttachments: proposal.clientAttachments || [],
    clientCompleted: proposal.clientCompleted || false,
    status: proposal.status
  };

  const progressResult = calculateProposalProgress(proposalData);
  const progress = progressResult.overallProgress;
  const progressColor = getProgressColor(progress);
  const progressText = getProgressText(progress);
  const details = showDetails ? getProgressDetails(proposalData) : null;

  // Configurações de tamanho
  const sizeConfig = {
    sm: orientation === 'horizontal' ? 'h-2' : 'w-2 h-16',
    md: orientation === 'horizontal' ? 'h-3' : 'w-3 h-20', 
    lg: orientation === 'horizontal' ? 'h-4' : 'w-4 h-24'
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <div className={`bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 rounded-full ${sizeConfig[size]} relative overflow-hidden`}>
          <div 
            className={`${progressColor} transition-all duration-300 ease-in-out rounded-full absolute bottom-0 left-0 right-0`}
            style={{ height: `${progress}%` }}
          />
        </div>
        <div className={`${textSize[size]} font-medium text-center text-gray-700`}>
          {progress}%
        </div>
        {showDetails && (
          <div className={`${textSize[size]} text-center text-gray-500 dark:text-white`}>
            {progressText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className={`${textSize[size]} font-medium text-gray-700`}>
          {progress}%
        </span>
        <span className={`${textSize[size]} text-gray-500 dark:text-white`}>
          {progressText}
        </span>
      </div>
      
      <div className={`bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 rounded-full ${sizeConfig[size]} overflow-hidden`}>
        <div 
          className={`${progressColor} transition-all duration-700 ease-out rounded-full h-full relative ${animated ? 'vendor-progress-bar' : ''} overflow-hidden`}
          style={{ width: `${progress}%` }}
        >
          {/* Animação de onda sutil - apenas quando animated=true */}
          {animated && <div className="absolute inset-0 progress-wave"></div>}
        </div>
      </div>

      {showDetails && details && (
        <div className="mt-3 space-y-2">
          <div className={`${textSize[size]} text-gray-600 dark:text-gray-300`}>
            <strong>Detalhes do Progresso:</strong>
          </div>
          
          <div className={`${textSize[size]} text-gray-600 dark:text-gray-300`}>
            Progresso: {details.progress}% ({details.text})
          </div>
          
          {details.missingFieldsCount > 0 && (
            <div className={`${textSize[size]} text-orange-600 dark:text-orange-400`}>
              Campos pendentes: {details.missingFieldsCount} de {details.totalRequiredFields}
            </div>
          )}

          {details.missingFieldsCount === 0 && (
            <div className={`${textSize[size]} text-green-600 dark:text-green-400 font-medium`}>
              ✓ Todos os campos obrigatórios preenchidos
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;