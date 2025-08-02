import { useState } from 'react';
import { X } from 'lucide-react';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
}

const InboxModal = ({ isOpen, onClose, unreadCount }: InboxModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Caixa de Entrada</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          {unreadCount > 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Você tem {unreadCount} mensagem(ns) não lida(s).
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Nenhuma mensagem nova.
            </p>
          )}
          
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Funcionalidade em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxModal;