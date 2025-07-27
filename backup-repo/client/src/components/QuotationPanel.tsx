import React, { useState } from 'react';
import { Plus, Minus, Upload, FileText, Trash2, Phone, Calculator, Users, Calendar, DollarSign, Building, X } from 'lucide-react';
import { showNotification } from '../utils/notifications';

interface QuotationData {
  id: string;
  operadora: string;
  tipoPlano: string;
  numeroVidas: number;
  valor: string;
  validade: string;
  dataEnvio: string;
  arquivos: File[];
  distribuicaoVidas: {
    [key: string]: number;
  };
}

const QuotationPanel: React.FC = () => {
  const [quotationData, setQuotationData] = useState({
    operadora: '',
    tipoPlano: '',
    numeroVidas: 1,
    valor: '',
    validade: '',
    dataEnvio: new Date().toISOString().split('T')[0],
  });

  const [arquivos, setArquivos] = useState<File[]>([]);
  const [cotacoesCadastradas, setCotacoesCadastradas] = useState<QuotationData[]>([]);
  const [showDistribuicaoModal, setShowDistribuicaoModal] = useState(false);
  
  const [distribuicaoVidas, setDistribuicaoVidas] = useState({
    '00-18': 0,
    '19-23': 0,
    '24-28': 0,
    '29-33': 0,
    '34-38': 0,
    '39-43': 0,
    '44-48': 0,
    '49-53': 0,
    '54-58': 0,
    '59+': 0,
  });

  const operadoras = [
    'Amil',
    'Bradesco Saúde',
    'Sulamérica',
    'Porto Seguro',
    'Omint',
    'Careplus',
    'Hapvida',
    'Alice',
    'Seguros Unimed',
    'NotreDame Intermédica',
    'Prevent Senior',
    'SulAmérica Saúde'
  ];

  const tiposPlano = [
    'Empresarial',
    'Individual',
    'Familiar',
    'Adesão',
    'MEI',
    'Coletivo por Adesão',
    'Coletivo Empresarial'
  ];

  const faixasEtarias = [
    { key: '00-18', label: '00 a 18' },
    { key: '19-23', label: '19 a 23' },
    { key: '24-28', label: '24 a 28' },
    { key: '29-33', label: '29 a 33' },
    { key: '34-38', label: '34 a 38' },
    { key: '39-43', label: '39 a 43' },
    { key: '44-48', label: '44 a 48' },
    { key: '49-53', label: '49 a 53' },
    { key: '54-58', label: '54 a 58' },
    { key: '59+', label: '59 ou mais' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const novosArquivos = Array.from(files);
      setArquivos(prev => [...prev, ...novosArquivos]);
      showNotification(`${novosArquivos.length} arquivo(s) anexado(s)!`, 'success');
    }
  };

  const removerArquivo = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
    showNotification('Arquivo removido!', 'success');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const ajustarDistribuicao = (faixa: string, delta: number) => {
    setDistribuicaoVidas(prev => ({
      ...prev,
      [faixa]: Math.max(0, prev[faixa] + delta)
    }));
  };

  const calcularTotalVidas = () => {
    return Object.values(distribuicaoVidas).reduce((sum, count) => sum + count, 0);
  };

  const aplicarDistribuicao = () => {
    const total = calcularTotalVidas();
    setQuotationData(prev => ({ ...prev, numeroVidas: total }));
    setShowDistribuicaoModal(false);
    showNotification(`Distribuição aplicada: ${total} vidas`, 'success');
  };

  const limparDistribuicao = () => {
    setDistribuicaoVidas({
      '00-18': 0,
      '19-23': 0,
      '24-28': 0,
      '29-33': 0,
      '34-38': 0,
      '39-43': 0,
      '44-48': 0,
      '49-53': 0,
      '54-58': 0,
      '59+': 0,
    });
  };

  const adicionarCotacao = () => {
    if (!quotationData.operadora || !quotationData.tipoPlano || !quotationData.valor) {
      showNotification('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const novaCotacao: QuotationData = {
      id: Date.now().toString(),
      operadora: quotationData.operadora,
      tipoPlano: quotationData.tipoPlano,
      numeroVidas: quotationData.numeroVidas,
      valor: quotationData.valor,
      validade: quotationData.validade,
      dataEnvio: quotationData.dataEnvio,
      arquivos: [...arquivos],
      distribuicaoVidas: { ...distribuicaoVidas }
    };

    setCotacoesCadastradas(prev => [...prev, novaCotacao]);
    
    // Limpar formulário
    setQuotationData({
      operadora: '',
      tipoPlano: '',
      numeroVidas: 1,
      valor: '',
      validade: '',
      dataEnvio: new Date().toISOString().split('T')[0],
    });
    setArquivos([]);
    limparDistribuicao();
    
    showNotification('Cotação adicionada com sucesso!', 'success');
  };

  const removerCotacao = (id: string) => {
    setCotacoesCadastradas(prev => prev.filter(cotacao => cotacao.id !== id));
    showNotification('Cotação removida!', 'success');
  };

  const enviarWhatsApp = (cotacao: QuotationData) => {
    const mensagem = `Olá! Segue cotação:\n\nOperadora: ${cotacao.operadora}\nTipo: ${cotacao.tipoPlano}\nNº de vidas: ${cotacao.numeroVidas}\nValor: R$ ${cotacao.valor}\nValidade: ${cotacao.validade}\nData de Envio: ${cotacao.dataEnvio}\nArquivos: ${cotacao.arquivos.length} anexo(s)\n\nQualquer dúvida, estou à disposição!`;
    
    const numeroWhatsApp = '5511999999999';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    showNotification('Redirecionando para WhatsApp...', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Formulário de Nova Cotação */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calculator className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Painel de Cotações</h2>
          </div>
          <button
            onClick={adicionarCotacao}
            className="flex items-center px-6 py-3 bg-blue-600 text-white dark:bg-blue-50 dark:bg-blue-9000 dark:text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Cotação
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Operadora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Operadora *
            </label>
            <select
              value={quotationData.operadora}
              onChange={(e) => setQuotationData(prev => ({ ...prev, operadora: e.target.value }))}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="">Selecione a operadora</option>
              {operadoras.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          {/* Tipo do Plano */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Tipo de Plano *
            </label>
            <select
              value={quotationData.tipoPlano}
              onChange={(e) => setQuotationData(prev => ({ ...prev, tipoPlano: e.target.value }))}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="">Selecione o tipo</option>
              {tiposPlano.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Número de Vidas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Número de Vidas *
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="1"
                value={quotationData.numeroVidas}
                onChange={(e) => setQuotationData(prev => ({ ...prev, numeroVidas: parseInt(e.target.value) || 1 }))}
                className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="1"
              />
              <button
                onClick={() => setShowDistribuicaoModal(true)}
                className="px-4 py-3 bg-purple-600 text-white dark:bg-purple-50 dark:bg-purple-9000 dark:text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Distribuição de Vidas"
              >
                <Users className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Valor (R$) *
            </label>
            <input
              type="text"
              value={quotationData.valor}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.,]/g, '');
                setQuotationData(prev => ({ ...prev, valor: value }));
              }}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Ex: 1.250,00"
            />
          </div>

          {/* Validade da Cotação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Validade da Cotação *
            </label>
            <input
              type="date"
              value={quotationData.validade}
              onChange={(e) => setQuotationData(prev => ({ ...prev, validade: e.target.value }))}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {/* Data de Envio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data de Envio *
            </label>
            <input
              type="date"
              value={quotationData.dataEnvio}
              onChange={(e) => setQuotationData(prev => ({ ...prev, dataEnvio: e.target.value }))}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Anexar Arquivos */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <FileText className="w-4 h-4 inline mr-1" />
            Anexar Arquivos
          </label>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg p-6 text-center mb-4">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 dark:text-white mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Clique para anexar arquivos ou arraste aqui
              </p>
              <p className="text-xs text-gray-500 dark:text-white mt-1">
                PDF, DOC, DOCX, JPG, PNG - Quantidade ilimitada
              </p>
            </label>
          </div>

          {arquivos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Arquivos Anexados ({arquivos.length})
              </p>
              <div className="space-y-2">
                {arquivos.map((arquivo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-500 dark:text-white mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{arquivo.name}</span>
                      <span className="text-xs text-gray-500 dark:text-white ml-2">({formatFileSize(arquivo.size)})</span>
                    </div>
                    <button
                      onClick={() => removerArquivo(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Cotações Cadastradas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Cotações Cadastradas ({cotacoesCadastradas.length})
          </h3>
          {cotacoesCadastradas.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              {cotacoesCadastradas.length} cotação{cotacoesCadastradas.length > 1 ? 'ões' : ''}
            </span>
          )}
        </div>

        {cotacoesCadastradas.length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 text-gray-400 dark:text-gray-500 dark:text-white mx-auto mb-4" />
            <p className="text-gray-500 dark:text-white text-lg">Nenhuma cotação cadastrada ainda.</p>
            <p className="text-gray-400 dark:text-gray-500 dark:text-white text-sm mt-1">
              Use o formulário acima para adicionar sua primeira cotação.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cotacoesCadastradas.map((cotacao, index) => (
              <div key={cotacao.id} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-600 text-white dark:bg-blue-50 dark:bg-blue-9000 dark:text-white text-xs px-3 py-1 rounded-full font-medium">
                    #{index + 1}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Operadora</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{cotacao.operadora}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Tipo do Plano</span>
                    <p className="text-sm text-gray-900 dark:text-white">{cotacao.tipoPlano}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Nº de Vidas</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{cotacao.numeroVidas}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Valor</span>
                    <p className="text-lg font-bold text-green-600">R$ {cotacao.valor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Validade</span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {cotacao.validade ? new Date(cotacao.validade).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Data de Envio</span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(cotacao.dataEnvio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Arquivos Anexados</span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium">
                        <FileText className="w-3 h-3 mr-1" />
                        {cotacao.arquivos.length} arquivo(s)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => enviarWhatsApp(cotacao)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white dark:bg-green-50 dark:bg-green-9000 dark:text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => removerCotacao(cotacao.id)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white dark:bg-red-50 dark:bg-red-9000 dark:text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Distribuição de Vidas */}
      {showDistribuicaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Distribuição de Vidas</h3>
                <button
                  onClick={() => setShowDistribuicaoModal(false)}
                  className="text-gray-400 dark:text-gray-500 dark:text-white hover:text-gray-600 dark:text-gray-400 dark:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">
                Distribua o número de vidas por faixa etária
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                {faixasEtarias.map((faixa) => (
                  <div key={faixa.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                      {faixa.label}
                    </span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => ajustarDistribuicao(faixa.key, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={distribuicaoVidas[faixa.key]}
                        onChange={(e) => {
                          const value = Math.max(0, parseInt(e.target.value) || 0);
                          setDistribuicaoVidas(prev => ({ ...prev, [faixa.key]: value }));
                        }}
                        className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <button
                        onClick={() => ajustarDistribuicao(faixa.key, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900">Total de Vidas:</span>
                  <span className="text-2xl font-bold text-blue-600">{calcularTotalVidas()}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={limparDistribuicao}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors"
                >
                  Limpar Tudo
                </button>
                <div className="space-x-3">
                  <button
                    onClick={() => setShowDistribuicaoModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={aplicarDistribuicao}
                    className="px-6 py-2 bg-blue-600 text-white dark:bg-blue-50 dark:bg-blue-9000 dark:text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationPanel;