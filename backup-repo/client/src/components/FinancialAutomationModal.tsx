import React, { useState } from 'react';
import { FileSpreadsheet, Zap, Check, X, AlertCircle, Info, Send, Download } from 'lucide-react';

interface FinancialAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  clientName: string;
}

const FinancialAutomationModal: React.FC<FinancialAutomationModalProps> = ({
  isOpen,
  onClose,
  proposalId,
  clientName
}) => {
  const [step, setStep] = useState<'review' | 'processing' | 'complete'>('review');
  const [progress, setProgress] = useState(0);
  const [includeOptions, setIncludeOptions] = useState({
    clientData: true,
    vendorData: true,
    financialData: true,
    documents: true,
    implantationData: true
  });

  if (!isOpen) return null;

  const handleSendToAutomation = () => {
    setStep('processing');
    
    // Simulate processing with progress updates
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setStep('complete');
      }
    }, 200);
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Enviar para Automação
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 dark:text-gray-500 dark:text-white hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700 font-medium">Você está prestes a enviar esta proposta para automação</p>
            <p className="text-sm text-blue-700 mt-1">
              Isso irá consolidar todos os dados coletados em uma planilha final e enviá-la para o sistema de automação Make/Zapier.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Detalhes da Proposta</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ID da Proposta:</span>
            <span className="font-medium text-gray-900">{proposalId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cliente:</span>
            <span className="font-medium text-gray-900">{clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium text-green-600">Validado</span>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Dados a Incluir na Automação</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="clientData"
              checked={includeOptions.clientData}
              onChange={(e) => setIncludeOptions({...includeOptions, clientData: e.target.checked})}
              className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="clientData" className="ml-2 text-sm text-gray-700">
              Dados do Cliente (formulários, contatos, dependentes)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="vendorData"
              checked={includeOptions.vendorData}
              onChange={(e) => setIncludeOptions({...includeOptions, vendorData: e.target.checked})}
              className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="vendorData" className="ml-2 text-sm text-gray-700">
              Dados do Vendedor (comissões, observações)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="financialData"
              checked={includeOptions.financialData}
              onChange={(e) => setIncludeOptions({...includeOptions, financialData: e.target.checked})}
              className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="financialData" className="ml-2 text-sm text-gray-700">
              Dados Financeiros (valores, descontos, observações)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="documents"
              checked={includeOptions.documents}
              onChange={(e) => setIncludeOptions({...includeOptions, documents: e.target.checked})}
              className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="documents" className="ml-2 text-sm text-gray-700">
              Links para Documentos (Google Drive)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="implantationData"
              checked={includeOptions.implantationData}
              onChange={(e) => setIncludeOptions({...includeOptions, implantationData: e.target.checked})}
              className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="implantationData" className="ml-2 text-sm text-gray-700">
              Dados de Implantação (status, observações)
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:bg-gray-600"
        >
          Cancelar
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={() => window.open('https://docs.google.com/spreadsheets/preview', '_blank')}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Visualizar Planilha
          </button>
          
          <button
            onClick={handleSendToAutomation}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Enviar para Make/Zapier
          </button>
        </div>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <Zap className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Enviando para Automação</h3>
        <p className="text-gray-600 mb-6">
          Consolidando dados e enviando para o sistema de automação Make/Zapier...
        </p>
      </div>
      
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-600 dark:bg-gray-600 rounded-full h-3">
          <div 
            className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">{progress}% concluído</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Etapas do Processo</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Check className={`w-4 h-4 ${progress >= 20 ? 'text-green-500' : 'text-gray-300'} mr-2`} />
            <span className={progress >= 20 ? 'text-gray-900' : 'text-gray-500 dark:text-white'}>Consolidando dados do cliente</span>
          </div>
          <div className="flex items-center">
            <Check className={`w-4 h-4 ${progress >= 40 ? 'text-green-500' : 'text-gray-300'} mr-2`} />
            <span className={progress >= 40 ? 'text-gray-900' : 'text-gray-500 dark:text-white'}>Atualizando planilha principal</span>
          </div>
          <div className="flex items-center">
            <Check className={`w-4 h-4 ${progress >= 60 ? 'text-green-500' : 'text-gray-300'} mr-2`} />
            <span className={progress >= 60 ? 'text-gray-900' : 'text-gray-500 dark:text-white'}>Organizando links de documentos</span>
          </div>
          <div className="flex items-center">
            <Check className={`w-4 h-4 ${progress >= 80 ? 'text-green-500' : 'text-gray-300'} mr-2`} />
            <span className={progress >= 80 ? 'text-gray-900' : 'text-gray-500 dark:text-white'}>Enviando para Make/Zapier</span>
          </div>
          <div className="flex items-center">
            <Check className={`w-4 h-4 ${progress >= 100 ? 'text-green-500' : 'text-gray-300'} mr-2`} />
            <span className={progress >= 100 ? 'text-gray-900' : 'text-gray-500 dark:text-white'}>Confirmando recebimento</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Enviado com Sucesso!</h3>
        <p className="text-gray-600 mb-6">
          A proposta foi enviada com sucesso para o sistema de automação Make/Zapier.
        </p>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
        <div className="flex items-start">
          <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-700 font-medium">Automação iniciada com sucesso</p>
            <p className="text-sm text-green-700 mt-1">
              O Make/Zapier está processando os dados e executando as automações configuradas.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Resumo</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ID da Proposta:</span>
            <span className="font-medium text-gray-900">{proposalId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cliente:</span>
            <span className="font-medium text-gray-900">{clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data de Envio:</span>
            <span className="font-medium text-gray-900">{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ID da Automação:</span>
            <span className="font-medium text-gray-900">AUTO-{Math.floor(Math.random() * 10000)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => window.open('https://make.com/scenarios', '_blank')}
          className="flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
        >
          <Zap className="w-4 h-4 mr-2" />
          Ver no Make
        </button>
        
        <button
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          <Check className="w-4 h-4 mr-2" />
          Concluir
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="p-6">
          {step === 'review' && renderReviewStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </div>
  );
};

export default FinancialAutomationModal;