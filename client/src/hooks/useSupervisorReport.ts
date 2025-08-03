import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

// HOOK COM PERSISTÊNCIA COMPLETA PARA CONFIGURAÇÕES DE RELATÓRIOS
export const useSupervisorReport = (reportId: string = 'current') => {
  // Estados separados conforme necessário pelo SupervisorPortal  
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportObservations, setReportObservations] = useState<{[key: string]: string}>({});
  const [reportPaymentDates, setReportPaymentDates] = useState<{[key: string]: string}>({});
  const [reportVendaDupla, setReportVendaDupla] = useState<{[key: string]: boolean}>({});
  const [reportVendedor1, setReportVendedor1] = useState<{[key: string]: string}>({});
  const [reportVendedor1Percent, setReportVendedor1Percent] = useState<{[key: string]: string}>({});
  const [reportVendedor2, setReportVendedor2] = useState<{[key: string]: string}>({});
  const [reportVendedor2Percent, setReportVendedor2Percent] = useState<{[key: string]: string}>({});
  const [reportComissaoReuniao, setReportComissaoReuniao] = useState<{[key: string]: string}>({});
  const [reportPremiacao, setReportPremiacao] = useState<{[key: string]: string}>({});
  const [reportComissaoSupervisor, setReportComissaoSupervisor] = useState<{[key: string]: string}>({});
  const [reportSupervisor, setReportSupervisor] = useState<{[key: string]: string}>({});
  const [reportSupervisorPercent, setReportSupervisorPercent] = useState<{[key: string]: string}>({});
  const [reportReuniao, setReportReuniao] = useState<{[key: string]: string}>({});
  const [reportStatusPagamento, setReportStatusPagamento] = useState<{[key: string]: string}>({});
  
  const [isLoading, setIsLoading] = useState(false);

  // Função para salvar configuração de uma proposta específica
  const saveReportConfiguration = useCallback(async (abmId: string) => {
    try {
      setIsLoading(true);
      const config = {
        abmId,
        vendorPercent: reportVendedor1Percent[abmId] || '',
        vendorPercent2: reportVendedor2Percent[abmId] || '',
        reuniaoPercent: reportComissaoReuniao[abmId] || '',
        premiacao: reportPremiacao[abmId] || '',
        metaIndividual: '', // Será implementado conforme necessário
        metaEquipe: '', // Será implementado conforme necessário
        superPremiacao: '', // Será implementado conforme necessário
        supervisor: reportSupervisor[abmId] || '',
        statusPagamentoPremiacao: '', // Será implementado conforme necessário
        statusPagamento: reportStatusPagamento[abmId] || '',
        dataPagamento: reportPaymentDates[abmId] || '',
        observacoes: reportObservations[abmId] || ''
      };

      await apiRequest('/api/report-configurations', {
        method: 'POST',
        body: JSON.stringify(config),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Configuração salva para ${abmId}`);
    } catch (error) {
      console.error(`❌ Erro ao salvar configuração para ${abmId}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [reportVendedor1Percent, reportVendedor2Percent, reportComissaoReuniao, reportPremiacao, reportSupervisor, reportStatusPagamento, reportPaymentDates, reportObservations]);

  // Função para carregar configuração de uma proposta específica
  const loadReportConfiguration = useCallback(async (abmId: string) => {
    try {
      const config = await apiRequest(`/api/report-configurations/${abmId}`);
      
      if (config && Object.keys(config).length > 0) {
        // Atualizar estados com dados salvos
        if (config.vendorPercent) {
          setReportVendedor1Percent(prev => ({...prev, [abmId]: config.vendorPercent}));
        }
        if (config.vendorPercent2) {
          setReportVendedor2Percent(prev => ({...prev, [abmId]: config.vendorPercent2}));
        }
        if (config.reuniaoPercent) {
          setReportComissaoReuniao(prev => ({...prev, [abmId]: config.reuniaoPercent}));
        }
        if (config.premiacao) {
          setReportPremiacao(prev => ({...prev, [abmId]: config.premiacao}));
        }
        if (config.supervisor) {
          setReportSupervisor(prev => ({...prev, [abmId]: config.supervisor}));
        }
        if (config.statusPagamento) {
          setReportStatusPagamento(prev => ({...prev, [abmId]: config.statusPagamento}));
        }
        if (config.dataPagamento) {
          setReportPaymentDates(prev => ({...prev, [abmId]: config.dataPagamento}));
        }
        if (config.observacoes) {
          setReportObservations(prev => ({...prev, [abmId]: config.observacoes}));
        }

        console.log(`✅ Configuração carregada para ${abmId}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao carregar configuração para ${abmId}:`, error);
    }
  }, []);

  // Função para carregar todas as configurações
  const loadAllConfigurations = useCallback(async () => {
    try {
      setIsLoading(true);
      const configs = await apiRequest('/api/report-configurations');
      
      if (configs && configs.length > 0) {
        // Organizar configurações por abmId
        const configsByAbmId: {[key: string]: any} = {};
        configs.forEach((config: any) => {
          configsByAbmId[config.abmId] = config;
        });

        // Atualizar todos os estados de uma vez
        const vendedor1PercentData: {[key: string]: string} = {};
        const vendedor2PercentData: {[key: string]: string} = {};
        const comissaoReuniaoData: {[key: string]: string} = {};
        const premiacaoData: {[key: string]: string} = {};
        const supervisorData: {[key: string]: string} = {};
        const statusPagamentoData: {[key: string]: string} = {};
        const paymentDatesData: {[key: string]: string} = {};
        const observationsData: {[key: string]: string} = {};

        Object.entries(configsByAbmId).forEach(([abmId, config]) => {
          if (config.vendorPercent) vendedor1PercentData[abmId] = config.vendorPercent;
          if (config.vendorPercent2) vendedor2PercentData[abmId] = config.vendorPercent2;
          if (config.reuniaoPercent) comissaoReuniaoData[abmId] = config.reuniaoPercent;
          if (config.premiacao) premiacaoData[abmId] = config.premiacao;
          if (config.supervisor) supervisorData[abmId] = config.supervisor;
          if (config.statusPagamento) statusPagamentoData[abmId] = config.statusPagamento;
          if (config.dataPagamento) paymentDatesData[abmId] = config.dataPagamento;
          if (config.observacoes) observationsData[abmId] = config.observacoes;
        });

        // Atualizar estados
        setReportVendedor1Percent(prev => ({...prev, ...vendedor1PercentData}));
        setReportVendedor2Percent(prev => ({...prev, ...vendedor2PercentData}));
        setReportComissaoReuniao(prev => ({...prev, ...comissaoReuniaoData}));
        setReportPremiacao(prev => ({...prev, ...premiacaoData}));
        setReportSupervisor(prev => ({...prev, ...supervisorData}));
        setReportStatusPagamento(prev => ({...prev, ...statusPagamentoData}));
        setReportPaymentDates(prev => ({...prev, ...paymentDatesData}));
        setReportObservations(prev => ({...prev, ...observationsData}));

        console.log(`✅ ${configs.length} configurações carregadas automaticamente`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar todas as configurações:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar configurações automaticamente na inicialização
  useEffect(() => {
    loadAllConfigurations();
  }, [loadAllConfigurations]);

  // Auto-salvar quando dados editáveis mudam (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Salvar apenas se houver dados editáveis preenchidos
      const allAbmIds = [
        ...Object.keys(reportVendedor1Percent),
        ...Object.keys(reportVendedor2Percent),
        ...Object.keys(reportComissaoReuniao),
        ...Object.keys(reportPremiacao),
        ...Object.keys(reportSupervisor),
        ...Object.keys(reportStatusPagamento),
        ...Object.keys(reportPaymentDates),
        ...Object.keys(reportObservations)
      ];

      const uniqueAbmIds = Array.from(new Set(allAbmIds));
      
      uniqueAbmIds.forEach(abmId => {
        if (abmId) {
          saveReportConfiguration(abmId);
        }
      });
    }, 2000); // Salvar após 2 segundos de inatividade

    return () => clearTimeout(timer);
  }, [reportVendedor1Percent, reportVendedor2Percent, reportComissaoReuniao, reportPremiacao, reportSupervisor, reportStatusPagamento, reportPaymentDates, reportObservations, saveReportConfiguration]);

  return {
    reportData,
    reportObservations,
    reportPaymentDates,
    reportVendaDupla,
    reportVendedor1,
    reportVendedor1Percent,
    reportVendedor2,
    reportVendedor2Percent,
    reportComissaoReuniao,
    reportPremiacao,
    reportComissaoSupervisor,
    reportSupervisor,
    reportSupervisorPercent,
    reportReuniao,
    reportStatusPagamento,
    setReportData,
    setReportObservations,
    setReportPaymentDates,
    setReportVendaDupla,
    setReportVendedor1,
    setReportVendedor1Percent,
    setReportVendedor2,
    setReportVendedor2Percent,
    setReportComissaoReuniao,
    setReportPremiacao,
    setReportComissaoSupervisor,
    setReportSupervisor,
    setReportSupervisorPercent,
    setReportReuniao,
    setReportStatusPagamento,
    saveReportConfiguration,
    loadReportConfiguration,
    loadAllConfigurations,
    isLoading,
    error: null
  };
};