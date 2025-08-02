import { useState } from 'react';
import { X, Send } from 'lucide-react';

interface InternalMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InternalMessageModal = ({ isOpen, onClose }: InternalMessageModalProps) => {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (message.trim()) {
      // Aqui seria implementado o envio da mensagem
      console.log('Enviando mensagem:', message);
      setMessage('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Mensagem Interna</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 flex items-center space-x-1"
            >
              <Send size={16} />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternalMessageModal;