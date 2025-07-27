// Sistema centralizado de status para propostas
export type ProposalStatus = 
  | 'observacao'               // OBSERVAÇÃO (azul claro)
  | 'analise'                  // ANALISE (verde claro)
  | 'assinatura_ds'            // ASSINATURA DS (amarelo escuro)
  | 'expirado'                 // EXPIRADO (azul forte)
  | 'implantado'               // IMPLANTADO (verde forte)
  | 'aguar_pagamento'          // AGUAR PAGAMENTO (rosa)
  | 'assinatura_proposta'      // ASSINATURA PROPOSTA (amarelo claro)
  | 'aguar_selecao_vigencia'   // AGUAR SELEÇÃO DE VIGENCIA (laranja)
  | 'pendencia'                // PENDÊNCIA (vermelho)
  | 'declinado'                // DECLINADO (roxo)
  | 'aguar_vigencia'           // AGUAR VIGÊNCIA (azul claro)

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}

export const STATUS_CONFIG: Record<ProposalStatus, StatusConfig> = {
  observacao: {
    label: 'OBSERVAÇÃO',
    color: 'border-sky-400',
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-700',
    description: 'Proposta com observações pendentes'
  },
  analise: {
    label: 'ANALISE',
    color: 'border-emerald-400',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    description: 'Proposta em análise técnica'
  },
  assinatura_ds: {
    label: 'ASSINATURA DS',
    color: 'border-amber-600',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    description: 'Aguardando assinatura digital'
  },
  expirado: {
    label: 'EXPIRADO',
    color: 'border-blue-700',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    description: 'Proposta expirada'
  },
  implantado: {
    label: 'IMPLANTADO',
    color: 'border-green-600',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    description: 'Processo completamente implantado'
  },
  aguar_pagamento: {
    label: 'AGUAR PAGAMENTO',
    color: 'border-pink-500',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    description: 'Aguardando confirmação de pagamento'
  },
  assinatura_proposta: {
    label: 'ASSINATURA PROPOSTA',
    color: 'border-yellow-400',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    description: 'Aguardando assinatura da proposta'
  },
  aguar_selecao_vigencia: {
    label: 'AGUAR SELEÇÃO DE VIGENCIA',
    color: 'border-orange-500',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    description: 'Aguardando seleção de vigência'
  },
  pendencia: {
    label: 'PENDÊNCIA',
    color: 'border-red-500',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    description: 'Proposta com pendências a resolver'
  },
  declinado: {
    label: 'DECLINADO',
    color: 'border-purple-500',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    description: 'Proposta declinada'
  },
  aguar_vigencia: {
    label: 'AGUAR VIGÊNCIA',
    color: 'border-cyan-400',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    description: 'Aguardando definição de vigência'
  }
};

// Dark mode configurations
export const DARK_STATUS_CONFIG: Record<ProposalStatus, StatusConfig> = {
  observacao: {
    label: 'OBSERVAÇÃO',
    color: 'dark:border-sky-500',
    bgColor: 'dark:bg-sky-900/30',
    textColor: 'dark:text-sky-300',
    description: 'Proposta com observações pendentes'
  },
  analise: {
    label: 'ANALISE',
    color: 'dark:border-emerald-500',
    bgColor: 'dark:bg-emerald-900/30',
    textColor: 'dark:text-emerald-300',
    description: 'Proposta em análise técnica'
  },
  assinatura_ds: {
    label: 'ASSINATURA DS',
    color: 'dark:border-amber-500',
    bgColor: 'dark:bg-amber-900/30',
    textColor: 'dark:text-amber-300',
    description: 'Aguardando assinatura digital'
  },
  expirado: {
    label: 'EXPIRADO',
    color: 'dark:border-blue-500',
    bgColor: 'dark:bg-blue-900/30',
    textColor: 'dark:text-blue-300',
    description: 'Proposta expirada'
  },
  implantado: {
    label: 'IMPLANTADO',
    color: 'dark:border-green-500',
    bgColor: 'dark:bg-green-900/30',
    textColor: 'dark:text-green-300',
    description: 'Processo completamente implantado'
  },
  aguar_pagamento: {
    label: 'AGUAR PAGAMENTO',
    color: 'dark:border-pink-500',
    bgColor: 'dark:bg-pink-900/30',
    textColor: 'dark:text-pink-300',
    description: 'Aguardando confirmação de pagamento'
  },
  assinatura_proposta: {
    label: 'ASSINATURA PROPOSTA',
    color: 'dark:border-yellow-500',
    bgColor: 'dark:bg-yellow-900/30',
    textColor: 'dark:text-yellow-300',
    description: 'Aguardando assinatura da proposta'
  },
  aguar_selecao_vigencia: {
    label: 'AGUAR SELEÇÃO DE VIGENCIA',
    color: 'dark:border-orange-500',
    bgColor: 'dark:bg-orange-900/30',
    textColor: 'dark:text-orange-300',
    description: 'Aguardando seleção de vigência'
  },
  pendencia: {
    label: 'PENDÊNCIA',
    color: 'dark:border-red-500',
    bgColor: 'dark:bg-red-900/30',
    textColor: 'dark:text-red-300',
    description: 'Proposta com pendências a resolver'
  },
  declinado: {
    label: 'DECLINADO',
    color: 'dark:border-purple-500',
    bgColor: 'dark:bg-purple-900/30',
    textColor: 'dark:text-purple-300',
    description: 'Proposta declinada'
  },
  aguar_vigencia: {
    label: 'AGUAR VIGÊNCIA',
    color: 'dark:border-cyan-500',
    bgColor: 'dark:bg-cyan-900/30',
    textColor: 'dark:text-cyan-300',
    description: 'Aguardando definição de vigência'
  }
};

/**
 * Obtém a configuração de status (com suporte a dark mode)
 */
export function getStatusConfig(status: ProposalStatus, darkMode: boolean = false): StatusConfig {
  const baseConfig = STATUS_CONFIG[status];
  const darkConfig = DARK_STATUS_CONFIG[status];
  
  if (darkMode) {
    return {
      ...baseConfig,
      color: `${baseConfig.color} ${darkConfig.color}`,
      bgColor: `${baseConfig.bgColor} ${darkConfig.bgColor}`,
      textColor: `${baseConfig.textColor} ${darkConfig.textColor}`
    };
  }
  
  return baseConfig;
}

/**
 * Converte string para status válido
 */
export function parseProposalStatus(status: string): ProposalStatus {
  const validStatuses = Object.keys(STATUS_CONFIG) as ProposalStatus[];
  
  if (validStatuses.includes(status as ProposalStatus)) {
    return status as ProposalStatus;
  }
  
  return 'observacao'; // default
}

/**
 * Obtém todos os status disponíveis
 */
export function getAllStatuses(): ProposalStatus[] {
  return Object.keys(STATUS_CONFIG) as ProposalStatus[];
}

/**
 * Verifica se um status é final (não permite mais alterações)
 */
export function isFinalStatus(status: ProposalStatus): boolean {
  return ['implantado', 'expirado', 'declinado'].includes(status);
}

/**
 * Obtém os próximos status possíveis baseado no status atual
 */
export function getNextPossibleStatuses(currentStatus: ProposalStatus): ProposalStatus[] {
  const statusFlow: Record<ProposalStatus, ProposalStatus[]> = {
    observacao: ['analise', 'pendencia', 'declinado'],
    analise: ['assinatura_proposta', 'pendencia', 'declinado'],
    assinatura_proposta: ['aguar_selecao_vigencia', 'pendencia', 'declinado'],
    aguar_selecao_vigencia: ['aguar_vigencia', 'pendencia', 'declinado'],
    aguar_vigencia: ['assinatura_ds', 'pendencia', 'declinado'],
    assinatura_ds: ['aguar_pagamento', 'pendencia', 'declinado'],
    aguar_pagamento: ['implantado', 'pendencia', 'declinado'],
    pendencia: ['observacao', 'analise', 'declinado'],
    declinado: [], // Status final
    expirado: [], // Status final
    implantado: [] // Status final
  };
  
  return statusFlow[currentStatus] || [];
}

/**
 * StatusManager - Singleton para gerenciar status de propostas
 */
class StatusManager {
  private static instance: StatusManager;
  private statuses: Map<string, ProposalStatus> = new Map();
  private listeners: Array<(proposalId: string, newStatus: ProposalStatus) => void> = [];
  
  private constructor() {}
  
  public static getInstance(): StatusManager {
    if (!StatusManager.instance) {
      StatusManager.instance = new StatusManager();
    }
    return StatusManager.instance;
  }
  
  getConfig(status: ProposalStatus, darkMode: boolean = false): StatusConfig {
    return getStatusConfig(status, darkMode);
  }
  
  parse(status: string): ProposalStatus {
    return parseProposalStatus(status);
  }
  
  getAll(): ProposalStatus[] {
    return getAllStatuses();
  }
  
  isFinal(status: ProposalStatus): boolean {
    return isFinalStatus(status);
  }
  
  getNextPossible(currentStatus: ProposalStatus): ProposalStatus[] {
    return getNextPossibleStatuses(currentStatus);
  }

  public getStatus(proposalId: string): ProposalStatus {
    return this.statuses.get(proposalId) || 'observacao';
  }

  public setStatus(proposalId: string, status: ProposalStatus): void {
    this.statuses.set(proposalId, status);
    this.notifyListeners(proposalId, status);
  }

  public subscribe(callback: (proposalId: string, newStatus: ProposalStatus) => void): void {
    this.listeners.push(callback);
  }

  public unsubscribe(callback: (proposalId: string, newStatus: ProposalStatus) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(proposalId: string, newStatus: ProposalStatus): void {
    this.listeners.forEach(listener => listener(proposalId, newStatus));
  }
}

// Export default StatusManager instance
const statusManager = StatusManager.getInstance();
export default statusManager;