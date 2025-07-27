import React, { useState } from 'react';
import { Copy, Mail, MessageCircle, Share2, Check, Shield, Lock, CheckCircle, RefreshCw } from 'lucide-react';
import { showNotification } from '@/utils/notifications';
import abmixLogoPath from '@assets/6078b216-6252-4ede-8d9b-4c2164c3ed8f copy copy_1752598762645.png';

interface ProfessionalLinkShareProps {
  clientLink: string;
  clientName?: string;
  onClose: () => void;
  onGenerateNewProposal?: () => void;
}

export default function ProfessionalLinkShare({ clientLink, clientName, onClose, onGenerateNewProposal }: ProfessionalLinkShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clientLink);
      setCopied(true);
      showNotification('Link copiado com sucesso!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showNotification('Erro ao copiar link', 'error');
    }
  };

  const handleWhatsApp = () => {
    const message = `Olá${clientName ? ` ${clientName}` : ''}! 

🏥 *Abmix Consultoria em Benefícios*

Segue o link do formulário para completar sua proposta:
${clientLink}

🔒 Seus dados estão protegidos com criptografia de ponta a ponta e armazenamento seguro.

📋 Preencha todas as informações solicitadas e anexe os documentos necessários.

Qualquer dúvida, estou à disposição!`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = () => {
    const subject = 'Formulário de Proposta - Abmix Consultoria em Benefícios';
    const body = `Olá${clientName ? ` ${clientName}` : ''},

Segue o link do formulário para completar sua proposta:

${clientLink}

🔒 Seus dados estão protegidos com criptografia de ponta a ponta e armazenamento seguro.

Preencha todas as informações solicitadas e anexe os documentos necessários.

Atenciosamente,
Abmix Consultoria em Benefícios`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-hidden">
        {/* Background com logo em marca d'água */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div 
            className="w-full h-full bg-center bg-no-repeat bg-contain"
            style={{ 
              backgroundImage: `url(${abmixLogoPath})`,
              backgroundSize: '300px 300px',
              backgroundPosition: 'center center'
            }}
          />
        </div>

        {/* Conteúdo principal */}
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <img 
                  src={abmixLogoPath} 
                  alt="Abmix Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-white">Abmix Consultoria em Benefícios</h2>
                <p className="text-gray-600">Formulário de Proposta</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 dark:text-white hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 dark:bg-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Mensagem principal */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6 border border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 dark:text-white mb-2">
                  Segue o link do formulário para completar sua proposta
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {clientName && (
                    <span className="font-medium">Olá {clientName}! </span>
                  )}
                  Clique no link abaixo para acessar o formulário seguro e completar sua proposta de benefícios.
                </p>
              </div>
            </div>
          </div>

          {/* Informações de segurança */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 dark:text-white">Segurança Garantida</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              🔒 <strong>Seus dados estão protegidos</strong> com criptografia de ponta a ponta e armazenamento seguro.
              <br />
              🛡️ Formulário oficial da Abmix com certificado de segurança SSL.
            </p>
          </div>

          {/* Link do formulário */}
          <div className="bg-white border-2 border-blue-200 rounded-xl p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do Formulário:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={clientLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-md ${
                  copied 
                    ? 'bg-emerald-400 text-white hover:bg-emerald-500' 
                    : 'bg-sky-400 text-white hover:bg-sky-500'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Botões de compartilhamento */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-slate-400 text-white rounded-xl hover:bg-slate-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Copy size={20} />
              <span className="font-medium text-sm">Copiar Link</span>
            </button>
            
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-400 text-white rounded-xl hover:bg-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <MessageCircle size={20} />
              <span className="font-medium text-sm">WhatsApp</span>
            </button>
            
            <button
              onClick={handleEmail}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-sky-400 text-white rounded-xl hover:bg-sky-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Mail size={20} />
              <span className="font-medium text-sm">Email</span>
            </button>
          </div>

          {/* Botões Nova Proposta e Retornar ao Dashboard */}
          {onGenerateNewProposal && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    onGenerateNewProposal();
                    onClose();
                  }}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-amber-400 text-white rounded-xl hover:bg-amber-500 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                >
                  <RefreshCw size={20} />
                  <span className="text-sm">Gerar Proposta para o Mesmo Link</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-violet-400 text-white rounded-xl hover:bg-violet-500 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                >
                  <CheckCircle size={20} />
                  <span className="text-sm">Retornar ao Dashboard</span>
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                Mantém os dados da empresa e cria nova proposta com dados pessoais em branco
              </p>
            </div>
          )}

          {/* Instruções adicionais */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              💡 <strong>Dica:</strong> Salve este link para enviar ao cliente de forma profissional e segura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}