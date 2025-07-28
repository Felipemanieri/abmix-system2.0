import { useState } from 'react';
import { 
  Book, 
  ChevronRight, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  AlertTriangle,
  Info,
  Globe,
  Database,
  Mail,
  MessageSquare,
  Cloud,
  FileText,
  Calendar,
  Bot,
  Shield,
  Zap,
  DollarSign,
  Phone,
  Users,
  Search,
  BarChart3
} from 'lucide-react';

interface IntegrationStep {
  step: number;
  title: string;
  description: string;
  code?: string;
  important?: boolean;
}

interface Integration {
  id: string;
  name: string;
  icon: any;
  description: string;
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
  category: string;
  steps: IntegrationStep[];
  requirements: string[];
  documentation?: string;
}

export default function IntegrationManual() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const integrations: Integration[] = [
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: FileText,
      description: 'Sincronize dados de propostas e vendedores automaticamente com planilhas Google',
      difficulty: 'Fácil',
      category: 'Produtividade',
      requirements: ['Conta Google', 'API Key do Google', 'Planilha criada'],
      documentation: 'https://developers.google.com/sheets/api',
      steps: [
        {
          step: 1,
          title: 'Ativar Google Sheets API',
          description: 'Acesse o Google Cloud Console e ative a API do Google Sheets para seu projeto.'
        },
        {
          step: 2,
          title: 'Criar Credenciais',
          description: 'Gere uma chave de API ou configure OAuth2 para autenticação.',
          code: 'GOOGLE_API_KEY=sua_chave_aqui'
        },
        {
          step: 3,
          title: 'Configurar Planilha',
          description: 'Crie uma planilha e defina as colunas para receber os dados do sistema.',
          important: true
        },
        {
          step: 4,
          title: 'Testar Conexão',
          description: 'Use a função de teste no sistema para verificar se a integração está funcionando.'
        }
      ]
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: Cloud,
      description: 'Backup automático de documentos e anexos de propostas no Google Drive',
      difficulty: 'Fácil',
      category: 'Backup',
      requirements: ['Conta Google', 'Google Drive API habilitada', 'Pasta de backup'],
      steps: [
        {
          step: 1,
          title: 'Configurar Google Drive API',
          description: 'Ative a API do Google Drive no Console do Google Cloud.'
        },
        {
          step: 2,
          title: 'Autenticação',
          description: 'Configure as credenciais de service account para acesso automático.',
          code: 'GOOGLE_DRIVE_CREDENTIALS=caminho/para/credenciais.json'
        },
        {
          step: 3,
          title: 'Criar Estrutura de Pastas',
          description: 'O sistema criará automaticamente pastas organizadas por data e tipo de documento.',
          important: true
        }
      ]
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      icon: Mail,
      description: 'Envio automático de emails para clientes e notificações do sistema',
      difficulty: 'Fácil',
      category: 'Comunicação',
      requirements: ['Conta SendGrid', 'API Key', 'Domínio verificado'],
      documentation: 'https://docs.sendgrid.com/',
      steps: [
        {
          step: 1,
          title: 'Criar Conta SendGrid',
          description: 'Registre-se no SendGrid e verifique seu email.'
        },
        {
          step: 2,
          title: 'Gerar API Key',
          description: 'Crie uma API Key com permissões de envio de email.',
          code: 'SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx'
        },
        {
          step: 3,
          title: 'Verificar Domínio',
          description: 'Configure SPF, DKIM e DMARC para melhor entregabilidade.',
          important: true
        },
        {
          step: 4,
          title: 'Configurar Templates',
          description: 'Crie templates personalizados para diferentes tipos de email.'
        }
      ]
    },
    {
      id: 'whatsapp-api',
      name: 'WhatsApp Business API',
      icon: MessageSquare,
      description: 'Envio de mensagens automáticas via WhatsApp para clientes',
      difficulty: 'Avançado',
      category: 'Comunicação',
      requirements: ['WhatsApp Business Account', 'Meta Developer Account', 'Webhook configurado'],
      steps: [
        {
          step: 1,
          title: 'Configurar Meta Developer',
          description: 'Crie um app no Meta for Developers e configure WhatsApp Business API.'
        },
        {
          step: 2,
          title: 'Obter Token de Acesso',
          description: 'Configure o token de acesso permanente para sua aplicação.',
          code: 'WHATSAPP_ACCESS_TOKEN=seu_token_aqui'
        },
        {
          step: 3,
          title: 'Verificar Webhook',
          description: 'Configure o webhook para receber respostas e status de mensagens.',
          important: true
        },
        {
          step: 4,
          title: 'Testar Envio',
          description: 'Faça um teste de envio para verificar se tudo está funcionando.'
        }
      ]
    },
    {
      id: 'make-com',
      name: 'Make.com',
      icon: Bot,
      description: 'Automação avançada de fluxos de trabalho com integração visual',
      difficulty: 'Médio',
      category: 'Automação',
      requirements: ['Conta Make.com', 'API Key', 'Cenários configurados'],
      documentation: 'https://www.make.com/en/api-documentation',
      steps: [
        {
          step: 1,
          title: 'Criar Conta Make.com',
          description: 'Registre-se no Make.com e escolha um plano adequado.'
        },
        {
          step: 2,
          title: 'Configurar API',
          description: 'Obtenha sua API Key nas configurações da conta.',
          code: 'MAKE_API_KEY=sua_chave_make'
        },
        {
          step: 3,
          title: 'Criar Cenários',
          description: 'Configure cenários visuais para automatizar processos específicos.',
          important: true
        },
        {
          step: 4,
          title: 'Configurar Webhooks',
          description: 'Configure webhooks para comunicação bidirecional entre sistemas.'
        }
      ]
    },
    {
      id: 'zapier',
      name: 'Zapier',
      icon: Zap,
      description: 'Conecte o sistema com mais de 3000 aplicativos diferentes',
      difficulty: 'Médio',
      category: 'Automação',
      requirements: ['Conta Zapier', 'Webhook configurado', 'Zaps ativos'],
      steps: [
        {
          step: 1,
          title: 'Criar Conta Zapier',
          description: 'Registre-se no Zapier e verifique sua conta.'
        },
        {
          step: 2,
          title: 'Configurar Webhook',
          description: 'Use webhooks para conectar o sistema aos seus Zaps.',
          code: 'ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...'
        },
        {
          step: 3,
          title: 'Criar Zaps',
          description: 'Configure automações específicas baseadas em eventos do sistema.',
          important: true
        }
      ]
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: MessageSquare,
      description: 'Notificações em tempo real para equipes via Slack',
      difficulty: 'Fácil',
      category: 'Comunicação',
      requirements: ['Workspace Slack', 'Bot Token', 'Canais configurados'],
      steps: [
        {
          step: 1,
          title: 'Criar App Slack',
          description: 'Crie um novo app no Slack API dashboard.'
        },
        {
          step: 2,
          title: 'Configurar Bot Token',
          description: 'Gere um bot token com as permissões necessárias.',
          code: 'SLACK_BOT_TOKEN=xoxb-seu-token'
        },
        {
          step: 3,
          title: 'Definir Canais',
          description: 'Configure quais canais receberão cada tipo de notificação.',
          important: true
        }
      ]
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: DollarSign,
      description: 'Processamento de pagamentos e cobranças automáticas',
      difficulty: 'Médio',
      category: 'Pagamentos',
      requirements: ['Conta Stripe', 'API Keys', 'Webhooks configurados'],
      documentation: 'https://stripe.com/docs/api',
      steps: [
        {
          step: 1,
          title: 'Configurar Conta Stripe',
          description: 'Complete o processo de verificação da conta Stripe.'
        },
        {
          step: 2,
          title: 'Obter API Keys',
          description: 'Configure as chaves de teste e produção.',
          code: 'STRIPE_SECRET_KEY=sk_test_...\nSTRIPE_PUBLISHABLE_KEY=pk_test_...'
        },
        {
          step: 3,
          title: 'Configurar Webhooks',
          description: 'Configure endpoints para receber eventos de pagamento.',
          important: true
        }
      ]
    },
    {
      id: 'twilio',
      name: 'Twilio',
      icon: Phone,
      description: 'Envio de SMS e chamadas automáticas para clientes',
      difficulty: 'Médio',
      category: 'Comunicação',
      requirements: ['Conta Twilio', 'Account SID', 'Auth Token', 'Número verificado'],
      steps: [
        {
          step: 1,
          title: 'Criar Conta Twilio',
          description: 'Registre-se no Twilio e verifique seu número de telefone.'
        },
        {
          step: 2,
          title: 'Obter Credenciais',
          description: 'Copie seu Account SID e Auth Token do dashboard.',
          code: 'TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx\nTWILIO_AUTH_TOKEN=seu_auth_token'
        },
        {
          step: 3,
          title: 'Configurar Número',
          description: 'Adquira um número Twilio ou configure um número existente.',
          important: true
        }
      ]
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      icon: Users,
      description: 'Sincronização de leads e clientes com CRM HubSpot',
      difficulty: 'Médio',
      category: 'CRM',
      requirements: ['Conta HubSpot', 'API Key', 'Propriedades configuradas'],
      steps: [
        {
          step: 1,
          title: 'Configurar HubSpot',
          description: 'Ative a API do HubSpot nas configurações da conta.'
        },
        {
          step: 2,
          title: 'Gerar API Key',
          description: 'Crie uma chave de API com as permissões necessárias.',
          code: 'HUBSPOT_API_KEY=pat-na1-xxxxxxxx'
        },
        {
          step: 3,
          title: 'Mapear Campos',
          description: 'Configure o mapeamento entre campos do sistema e propriedades do HubSpot.',
          important: true
        }
      ]
    },
    {
      id: 'elasticsearch',
      name: 'Elasticsearch',
      icon: Search,
      description: 'Busca avançada e analytics de dados do sistema',
      difficulty: 'Avançado',
      category: 'Analytics',
      requirements: ['Cluster Elasticsearch', 'Índices configurados', 'Kibana (opcional)'],
      steps: [
        {
          step: 1,
          title: 'Instalar Elasticsearch',
          description: 'Configure um cluster Elasticsearch local ou na nuvem.'
        },
        {
          step: 2,
          title: 'Configurar Conexão',
          description: 'Configure a URL e credenciais de acesso.',
          code: 'ELASTICSEARCH_URL=https://localhost:9200\nELASTICSEARCH_USERNAME=elastic\nELASTICSEARCH_PASSWORD=senha'
        },
        {
          step: 3,
          title: 'Criar Índices',
          description: 'Configure índices específicos para diferentes tipos de dados.',
          important: true
        }
      ]
    },
    {
      id: 'metabase',
      name: 'Metabase',
      icon: BarChart3,
      description: 'Dashboards e relatórios visuais avançados',
      difficulty: 'Médio',
      category: 'Analytics',
      requirements: ['Metabase instalado', 'Conexão com banco', 'Dashboards criados'],
      steps: [
        {
          step: 1,
          title: 'Instalar Metabase',
          description: 'Configure o Metabase conectado ao banco de dados do sistema.'
        },
        {
          step: 2,
          title: 'Configurar Conexão',
          description: 'Conecte o Metabase ao PostgreSQL do sistema.',
          code: 'MB_DB_TYPE=postgres\nMB_DB_CONNECTION_URI=postgresql://...'
        },
        {
          step: 3,
          title: 'Criar Dashboards',
          description: 'Configure dashboards personalizados para diferentes métricas.',
          important: true
        }
      ]
    },
    {
      id: 'docker',
      name: 'Docker',
      icon: Cloud,
      description: 'Containerização e deploy automatizado do sistema',
      difficulty: 'Avançado',
      category: 'DevOps',
      requirements: ['Docker instalado', 'Docker Compose', 'Registry configurado'],
      steps: [
        {
          step: 1,
          title: 'Criar Dockerfile',
          description: 'Configure o Dockerfile para containerizar a aplicação.'
        },
        {
          step: 2,
          title: 'Docker Compose',
          description: 'Configure docker-compose.yml com todos os serviços necessários.',
          code: 'version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "5000:5000"'
        },
        {
          step: 3,
          title: 'Deploy Automatizado',
          description: 'Configure CI/CD para deploy automático usando Docker.',
          important: true
        }
      ]
    },
    {
      id: 'aws-s3',
      name: 'AWS S3',
      icon: Cloud,
      description: 'Armazenamento seguro de arquivos na nuvem AWS',
      difficulty: 'Médio',
      category: 'Backup',
      requirements: ['Conta AWS', 'Bucket S3', 'IAM User', 'Access Keys'],
      steps: [
        {
          step: 1,
          title: 'Criar Bucket S3',
          description: 'Configure um bucket S3 com as permissões adequadas.'
        },
        {
          step: 2,
          title: 'Configurar IAM',
          description: 'Crie um usuário IAM com permissões específicas para o bucket.',
          code: 'AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX\nAWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxx\nAWS_REGION=us-east-1'
        },
        {
          step: 3,
          title: 'Configurar Backup',
          description: 'Configure backup automático de arquivos para o S3.',
          important: true
        }
      ]
    },
    {
      id: 'oauth2',
      name: 'OAuth2 SSO',
      icon: Shield,
      description: 'Login único com Google, Microsoft, GitHub e outros provedores',
      difficulty: 'Avançado',
      category: 'Autenticação',
      requirements: ['Provider OAuth2', 'Client ID', 'Client Secret', 'Redirect URLs'],
      steps: [
        {
          step: 1,
          title: 'Configurar Provider',
          description: 'Registre sua aplicação no provedor OAuth2 escolhido.'
        },
        {
          step: 2,
          title: 'Obter Credenciais',
          description: 'Configure Client ID e Client Secret.',
          code: 'OAUTH_CLIENT_ID=seu_client_id\nOAUTH_CLIENT_SECRET=seu_client_secret'
        },
        {
          step: 3,
          title: 'Configurar Fluxo',
          description: 'Implemente o fluxo de autorização OAuth2 no sistema.',
          important: true
        }
      ]
    }
  ];

  const categories = ['Todas', ...Array.from(new Set(integrations.map(i => i.category)))];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedIntegration) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setSelectedIntegration(null)}
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            ← Voltar
          </button>
          <selectedIntegration.icon className="w-6 h-6 mr-3 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{selectedIntegration.name}</h1>
          <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedIntegration.difficulty)}`}>
            {selectedIntegration.difficulty}
          </span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">{selectedIntegration.description}</p>
        </div>

        {selectedIntegration.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Pré-requisitos</h3>
            <ul className="space-y-2">
              {selectedIntegration.requirements.map((req, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Passo a Passo</h3>
          <div className="space-y-6">
            {selectedIntegration.steps.map((step) => (
              <div key={step.step} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    {step.step}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-gray-700 mb-3">{step.description}</p>
                    
                    {step.code && (
                      <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Configuração:</span>
                          <button
                            onClick={() => copyToClipboard(step.code)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar
                          </button>
                        </div>
                        <pre className="text-gray-800">{step.code}</pre>
                      </div>
                    )}

                    {step.important && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-yellow-800 text-sm font-medium">Passo crítico - atenção especial necessária</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedIntegration.documentation && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-gray-700 mr-2">Documentação oficial:</span>
              <a
                href={selectedIntegration.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                {selectedIntegration.documentation}
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Book className="inline-block w-8 h-8 mr-3 text-blue-600" />
            Manual de Integrações
          </h1>
          <p className="text-gray-600">
            Guia completo para integrar o sistema com serviços externos
          </p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar integração..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Integrações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedIntegration(integration)}
          >
            <div className="flex items-center justify-between mb-4">
              <integration.icon className="w-8 h-8 text-blue-600" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(integration.difficulty)}`}>
                {integration.difficulty}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{integration.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{integration.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {integration.category}
              </span>
              <div className="flex items-center text-blue-600">
                <span className="text-sm font-medium mr-1">Ver guia</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma integração encontrada</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou termo de busca.</p>
        </div>
      )}
    </div>
  );
}