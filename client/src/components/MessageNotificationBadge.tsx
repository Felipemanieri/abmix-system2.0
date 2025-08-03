import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

interface MessageNotificationBadgeProps {
  userEmail: string;
  onMessagesView?: () => void;
}

export default function MessageNotificationBadge({ userEmail, onMessagesView }: MessageNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);

  // Buscar mensagens não lidas
  useEffect(() => {
    const checkUnreadMessages = async () => {
      try {
        // Buscar mensagens do inbox
        const inboxResponse = await fetch(`/api/messages/inbox/${userEmail}`);
        if (inboxResponse.ok) {
          const messagesData = await inboxResponse.json();
          const unreadCount = messagesData.filter(msg => !msg.read).length;
          
          setMessages(messagesData);
          setUnreadCount(unreadCount);
        }
      } catch (error) {
        console.error('❌ BADGE: Erro ao buscar notificações:', error);
      }
    };

    checkUnreadMessages();
    
    // Polling a cada 10 segundos para notificações rápidas
    const interval = setInterval(checkUnreadMessages, 10000);
    
    return () => clearInterval(interval);
  }, [userEmail]);

  const handleClick = () => {
    // Apenas chama onMessagesView para abrir a interface unificada
    if (onMessagesView) {
      onMessagesView();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      title={`${unreadCount} mensagens não lidas`}
    >
      <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      
      {/* Badge de notificação vermelho - mostra quantidade de mensagens não lidas */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}