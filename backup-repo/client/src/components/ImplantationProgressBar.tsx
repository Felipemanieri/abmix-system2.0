import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, FileText, DollarSign, Settings } from 'lucide-react';

interface ImplantationProgressBarProps {
  proposal: any;
  className?: string;
}

const ImplantationProgressBar: React.FC<ImplantationProgressBarProps> = ({ proposal, className = '' }) => {
  const [progress, setProgress] = useState(0);

  // Etapas do processo completo de implantação
  const processStages = [
    {
      id: 'commercial',
      name: 'Comercial',
      icon: FileText,
      fields: ['client', 'plan', 'value', 'empresa', 'cnpj', 'vendedor'],
      weight: 25
    },
    {
      id: 'documentation',
      name: 'Documentação',
      icon: FileText,
      fields: ['documents', 'email', 'phone'],
      weight: 25
    },
    {
      id: 'financial',
      name: 'Financeiro',
      icon: DollarSign,
      fields: ['status', 'date'],
      weight: 25
    },
    {
      id: 'implementation',
      name: 'Implantação',
      icon: Settings,
      fields: ['observations', 'estimatedCompletion'],
      weight: 25
    }
  ];

  const calculateStageProgress = (stage: any) => {
    let filledFields = 0;
    const requiredFields = stage.fields;

    requiredFields.forEach((field: string) => {
      if (proposal[field] && proposal[field].toString().trim() !== '') {
        filledFields++;
      }
    });

    // Lógica especial baseada no status
    if (stage.id === 'commercial' && proposal.status) {
      filledFields = requiredFields.length; // Comercial sempre completo se tem status
    }
    
    if (stage.id === 'documentation' && proposal.documents > 0) {
      filledFields = Math.max(filledFields, requiredFields.length - 1);
    }
    
    if (stage.id === 'financial' && ['validated', 'sent_to_automation', 'processing', 'completed'].includes(proposal.status)) {
      filledFields = requiredFields.length; // Financeiro completo se validado
    }
    
    if (stage.id === 'implementation' && ['processing', 'completed'].includes(proposal.status)) {
      filledFields = Math.max(filledFields, Math.floor(requiredFields.length * 0.8));
    }

    return Math.round((filledFields / requiredFields.length) * 100);
  };

  const calculateOverallProgress = () => {
    let totalProgress = 0;
    
    processStages.forEach(stage => {
      const stageProgress = calculateStageProgress(stage);
      totalProgress += (stageProgress * stage.weight) / 100;
    });
    
    return Math.round(totalProgress);
  };

  useEffect(() => {
    const newProgress = calculateOverallProgress();
    setProgress(newProgress);
  }, [proposal]);

  const getProgressColor = () => {
    if (progress <= 30) return 'bg-gradient-to-r from-red-400 to-red-500';
    if (progress <= 70) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
  };

  const getProgressTextColor = () => {
    if (progress <= 30) return 'text-red-500';
    if (progress <= 70) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getStageStatus = (stage: any) => {
    const stageProgress = calculateStageProgress(stage);
    if (stageProgress === 100) return 'completed';
    if (stageProgress > 0) return 'in-progress';
    return 'pending';
  };

  return (
    <div className={className}>
      {/* Progresso geral */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">Progresso Geral</span>
        <span className={`text-xs font-semibold ${getProgressTextColor()}`}>
          {progress}%
        </span>
      </div>
      
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-3">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ease-in-out ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Detalhamento por etapas */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600 mb-1">Etapas do Processo:</div>
        {processStages.map((stage) => {
          const stageProgress = calculateStageProgress(stage);
          const status = getStageStatus(stage);
          const Icon = stage.icon;
          
          return (
            <div key={stage.id} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                status === 'completed' 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : status === 'in-progress'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 dark:text-white'
              }`}>
                {status === 'completed' ? (
                  <CheckCircle className="w-3 h-3" />
                ) : status === 'in-progress' ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-medium">{stage.name}</span>
                  <span className="text-xs text-gray-500 dark:text-white">{stageProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 mt-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      status === 'completed' 
                        ? 'bg-emerald-400' 
                        : status === 'in-progress'
                        ? 'bg-amber-400'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    style={{ width: `${stageProgress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status textual */}
      <div className="mt-2 text-xs text-gray-500 dark:text-white">
        {progress === 100 ? 'Processo totalmente concluído' :
         progress >= 75 ? 'Implantação em fase final' :
         progress >= 50 ? 'Processo em andamento' :
         progress >= 25 ? 'Etapas iniciais concluídas' :
         'Processo iniciado'}
      </div>
    </div>
  );
};

export default ImplantationProgressBar;