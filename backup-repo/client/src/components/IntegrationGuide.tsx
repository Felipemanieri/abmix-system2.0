import React from 'react';
import { FileSpreadsheet, Zap, ArrowRight, CheckCircle, AlertCircle, Info } from 'lucide-react';

const IntegrationGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Guia de Integração</h1>
        <p className="text-teal-100">Conecte o sistema Abmix com Google Sheets e Make</p>
      </div>

      {/* Visão Geral */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Visão Geral das Integrações</h2>
        <p className="text-gray-600 mb-6">
          O sistema Abmix pode ser integrado com ferramentas externas para automatizar fluxos de trabalho e sincronizar dados.
          As duas integrações principais são com Google Sheets e Make (anteriormente Integromat).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Google Sheets</h3>
            </div>
            <p className="text-sm text-gray-600">
              Sincronize dados de propostas, clientes e vendas com planilhas do Google para análise e relatórios personalizados.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Make</h3>
            </div>
            <p className="text-sm text-gray-600">
              Crie automações complexas entre o Abmix e outros sistemas, como CRM, email marketing e sistemas de pagamento.
            </p>
          </div>
        </div>
      </div>

      {/* Google Sheets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Integração com Google Sheets</h2>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                A integração com Google Sheets permite sincronizar dados em tempo real ou programados, criar relatórios automáticos e compartilhar informações com sua equipe.
              </p>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900">Passo a Passo</h3>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-medium">1</span>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium text-gray-900">Configurar API no Abmix</h4>
                <p className="text-sm text-gray-600 mt-1">
                  No portal do Supervisor, acesse "Configurações" → "Integrações" → "Google Sheets" e gere uma chave de API.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-medium">2</span>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium text-gray-900">Criar Planilha no Google Sheets</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Crie uma nova planilha no Google Sheets e configure as colunas de acordo com os dados que deseja sincronizar.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-medium">3</span>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium text-gray-900">Instalar Add-on do Abmix</h4>
                <p className="text-sm text-gray-600 mt-1">
                  No Google Sheets, vá para "Extensões" → "Add-ons" → "Obter add-ons" e busque por "Abmix Connector".
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-medium">4</span>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium text-gray-900">Configurar Sincronização</h4>
                <p className="text-sm text-gray-600 mt-1">
                  No add-on, insira sua chave de API e selecione quais dados deseja sincronizar e com qual frequência.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-medium">Exemplos de uso:</p>
                <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
                  <li>Relatórios de vendas automáticos</li>
                  <li>Dashboard de performance de vendedores</li>
                  <li>Acompanhamento de propostas pendentes</li>
                  <li>Análise financeira de contratos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Make */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Integração com Make</h2>
        
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-700">
                O Make (anteriormente Integromat) é uma plataforma de automação que permite conectar o Abmix com centenas de outros aplicativos e serviços sem necessidade de programação.
              </p>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900">Passo a Passo</h3>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-medium">1</span>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium text-gray-900">Criar conta no Make</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Acesse make.com e crie uma conta ou faça login se já tiver uma.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-medium">2</span>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium text-gray-900">Configurar Webhook no Abmix</h4>
                <p className="text-sm text-gray-600 mt-1">
                  No portal do Supervisor, acesse "Configurações" → "Integrações" → "Make" e gere um webhook URL.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-medium">3</span>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium text-gray-900">Criar Cenário no Make</h4>
                <p className="text-sm text-gray-600 mt-1">
                  No Make, crie um novo cenário e adicione um trigger de webhook. Use o URL gerado no Abmix.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-medium">4</span>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium text-gray-900">Configurar Ações</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Adicione ações ao seu cenário para processar os dados recebidos do Abmix e enviá-los para outros serviços.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-medium">5</span>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium text-gray-900">Ativar o Cenário</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Salve e ative seu cenário. Agora, sempre que um evento ocorrer no Abmix, o Make executará as ações configuradas.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-medium">Exemplos de automações:</p>
                <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
                  <li>Enviar notificações por WhatsApp quando uma proposta for criada</li>
                  <li>Criar tarefas no Trello para acompanhamento de propostas</li>
                  <li>Adicionar clientes ao Mailchimp quando uma proposta for aprovada</li>
                  <li>Gerar documentos PDF automaticamente e enviar por email</li>
                  <li>Sincronizar dados com CRM (Pipedrive, HubSpot, etc.)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suporte */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Suporte para Integrações</h2>
        
        <div className="bg-orange-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-700">
              Para suporte técnico com integrações, entre em contato com nossa equipe de suporte pelo email <span className="font-medium">suporte@abmix.com.br</span> ou pelo WhatsApp <span className="font-medium">(11) 99999-9999</span>.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={() => window.open('https://calendly.com/abmix/integracao', '_blank')}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Agendar Consultoria de Integração
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationGuide;