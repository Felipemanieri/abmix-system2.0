import { useState } from 'react';
import { MessageSquare, Send, Paperclip, Users } from 'lucide-react';

export default function InternalMessage() {
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  const sendMessage = () => {
    if (!message || !recipient) {
      alert('Preencha todos os campos');
      return;
    }
    
    alert(`Mensagem enviada para ${recipient}!`);
    setMessage('');
    setRecipient('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mensagem Interna
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Destinatário
            </label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um usuário</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Implantação">Implantação</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Vendedores">Todos os Vendedores</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Digite sua mensagem..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={sendMessage}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}