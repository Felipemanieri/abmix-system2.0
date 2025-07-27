import React, { useState, useEffect } from 'react';
import { CheckCircle, Trophy } from 'lucide-react';

interface ProposalProgressTrackerProps {
  contractData?: any;
  titulares?: any[];
  dependentes?: any[];
  attachments?: File[];
  className?: string;
  onProgressChange?: (progress: number) => void;
}

const ProposalProgressTracker: React.FC<ProposalProgressTrackerProps> = ({
  contractData,
  titulares = [],
  dependentes = [],
  attachments = [],
  className = '',
  onProgressChange
}) => {
  const [progress, setProgress] = useState(0);

  // Campos obrigatórios do contrato
  const requiredContractFields = [
    'nomeEmpresa',
    'cnpj',
    'planoContratado',
    'valor',
    'inicioVigencia'
  ];

  // Campos obrigatórios para pessoa (titular/dependente)
  const requiredPersonFields = [
    'nomeCompleto',
    'cpf',
    'rg',
    'dataNascimento',
    'nomeMae',
    'sexo',
    'estadoCivil',
    'emailPessoal',
    'telefonePessoal',
    'cep',
    'enderecoCompleto'
  ];

  const calculateProgress = () => {
    let totalRequiredFields = 0;
    let filledFields = 0;

    // Verificar campos do contrato
    totalRequiredFields += requiredContractFields.length;
    if (contractData) {
      filledFields += requiredContractFields.filter(field => 
        contractData[field] && contractData[field].toString().trim() !== ''
      ).length;
    }

    // Verificar pelo menos 1 titular
    if (titulares.length > 0) {
      totalRequiredFields += requiredPersonFields.length;
      const firstTitular = titulares[0];
      if (firstTitular) {
        filledFields += requiredPersonFields.filter(field => 
          firstTitular[field] && firstTitular[field].toString().trim() !== ''
        ).length;
      }
    } else {
      totalRequiredFields += requiredPersonFields.length;
    }

    // Verificar outros titulares (opcional)
    for (let i = 1; i < titulares.length; i++) {
      totalRequiredFields += requiredPersonFields.length;
      const titular = titulares[i];
      if (titular) {
        filledFields += requiredPersonFields.filter(field => 
          titular[field] && titular[field].toString().trim() !== ''
        ).length;
      }
    }

    // Verificar dependentes (opcional)
    dependentes.forEach(dependente => {
      if (dependente) {
        const dependenteFields = [...requiredPersonFields, 'parentesco'];
        totalRequiredFields += dependenteFields.length;
        filledFields += dependenteFields.filter(field => 
          dependente[field] && dependente[field].toString().trim() !== ''
        ).length;
      }
    });

    // Calcular porcentagem
    const calculatedProgress = totalRequiredFields > 0 
      ? Math.round((filledFields / totalRequiredFields) * 100) 
      : 0;

    return Math.min(calculatedProgress, 100);
  };

  useEffect(() => {
    const newProgress = calculateProgress();
    setProgress(newProgress);
    
    if (onProgressChange) {
      onProgressChange(newProgress);
    }
  }, [contractData, titulares, dependentes, attachments]);

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

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">Progresso do Preenchimento</h3>
        <span className={`text-sm font-semibold ${getProgressTextColor()}`}>
          {progress}%
        </span>
      </div>
      
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full transition-all duration-700 ease-in-out ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status textual discreto */}
      <div className="mt-2 text-xs text-gray-500 dark:text-white">
        {progress === 0 && 'Dados pendentes de preenchimento'}
        {progress > 0 && progress <= 30 && 'Iniciando preenchimento'}
        {progress > 30 && progress <= 70 && 'Progresso em andamento'}
        {progress > 70 && progress < 100 && 'Finalização pendente'}
        {progress === 100 && 'Preenchimento concluído'}
      </div>
    </div>
  );
};

export default ProposalProgressTracker;