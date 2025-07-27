import { useState } from 'react';

// HOOK SIMPLIFICADO SEM PERSISTÊNCIA PARA EVITAR QUEBRAR FUNCIONALIDADES EXISTENTES
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
    isLoading: false,
    error: null
  };
};