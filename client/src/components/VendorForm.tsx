import React, { useState } from 'react';
import { Building, FileText, Calendar, DollarSign, Check, Copy, Link } from 'lucide-react';

interface ContractData {
  nomeEmpresa: string;
  cnpj: string;
  planoContratado: string;
  odontoConjugado: boolean;
  valor: string;
  periodoVigencia: string;
  compulsorio: boolean;
  inicioVigencia: string;
  aproveitamentoCongenere: boolean;
}

const VendorForm: React.FC = () => {
  const [contractData, setContractData] = useState<ContractData>({
    nomeEmpresa: '',
    cnpj: '',
    planoContratado: '',
    odontoConjugado: false,
    valor: '',
    periodoVigencia: '',
    compulsorio: false,
    inicioVigencia: '',
    aproveitamentoCongenere: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const planOptions = [
    'Plano Individual',
    'Plano Família Básico',
    'Plano Família Premium',
    'Plano Empresarial',
    'Plano Empresarial Premium',
  ];

  const handleInputChange = (field: keyof ContractData, value: string | boolean) => {
    setContractData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gerar ID único para a proposta
    const proposalId = `VEND${Math.floor(Math.random() * 1000)}-PROP${Math.floor(Math.random() * 10000)}`;
    const link = `${window.location.origin}/cliente/${proposalId}`;
    
    setGeneratedLink(link);
    setIsSubmitted(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
  };

  const resetForm = () => {
    setContractData({
      nomeEmpresa: '',
      cnpj: '',
      planoContratado: '',
      odontoConjugado: false,
      valor: '',
      periodoVigencia: '',
      compulsorio: false,
      inicioVigencia: '',
      aproveitamentoCongenere: false,
    });
    setIsSubmitted(false);
    setGeneratedLink('');
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Proposta Criada com Sucesso!</h2>
          <p className="text-gray-600 mb-6">
            Link único gerado para o cliente preencher os dados pessoais.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Empresa:</strong> {contractData.nomeEmpresa}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Plano:</strong> {contractData.planoContratado}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Valor:</strong> {contractData.valor}
            </p>
          </div>

          <div className="bg-teal-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-teal-700 mb-2">
              <strong>Link para o Cliente:</strong>
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 border border-teal-300 rounded-md text-sm bg-white"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={resetForm}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Nova Proposta
            </button>
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Segue o link para preenchimento da proposta de plano de saúde: ${generatedLink}`)}`)}
              className="bg-green-600 text-white dark:bg-green-50 dark:bg-green-9000 dark:text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Enviar WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-2">Nova Proposta de Plano de Saúde</h1>
        <p className="text-teal-100">Preencha os dados do contrato que serão fixos para o cliente</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm dark:shadow-gray-900/30 border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <Building className="w-6 h-6 text-teal-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Dados da Empresa</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa *</label>
              <input
                type="text"
                required
                value={contractData.nomeEmpresa}
                onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Ex: Empresa ABC Ltda"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ *</label>
              <input
                type="text"
                required
                value={contractData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="flex items-center mb-6 pt-6 border-t border-gray-200">
            <FileText className="w-6 h-6 text-teal-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Detalhes do Plano</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plano Contratado *</label>
              <select
                required
                value={contractData.planoContratado}
                onChange={(e) => handleInputChange('planoContratado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Selecione o plano</option>
                {planOptions.map((plan) => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor Mensal *</label>
              <input
                type="text"
                required
                value={contractData.valor}
                onChange={(e) => handleInputChange('valor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período de Vigência *</label>
              <input
                type="text"
                required
                value={contractData.periodoVigencia}
                onChange={(e) => handleInputChange('periodoVigencia', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Ex: 12 meses"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Início da Vigência *</label>
              <input
                type="date"
                required
                value={contractData.inicioVigencia}
                onChange={(e) => handleInputChange('inicioVigencia', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center mb-6 pt-6 border-t border-gray-200">
            <DollarSign className="w-6 h-6 text-teal-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Configurações Adicionais</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="odontoConjugado"
                checked={contractData.odontoConjugado}
                onChange={(e) => handleInputChange('odontoConjugado', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="odontoConjugado" className="ml-2 text-sm font-medium text-gray-700">
                Odonto Conjugado
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="compulsorio"
                checked={contractData.compulsorio}
                onChange={(e) => handleInputChange('compulsorio', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="compulsorio" className="ml-2 text-sm font-medium text-gray-700">
                Compulsório
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="aproveitamentoCongenere"
                checked={contractData.aproveitamentoCongenere}
                onChange={(e) => handleInputChange('aproveitamentoCongenere', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="aproveitamentoCongenere" className="ml-2 text-sm font-medium text-gray-700">
                Aproveitamento Congênere
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
          <button
            type="submit"
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors"
          >
            <Link className="w-4 h-4 mr-2" />
            Gerar Link para Cliente
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorForm;