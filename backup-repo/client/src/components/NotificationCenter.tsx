import React, { useState } from 'react';
import { Bell, X, MessageSquare, FileText, CheckCircle, AlertCircle, Clock, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'document' | 'approval' | 'alert' | 'reminder';
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationCenterProps {
  isOpen?: boolean;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification?: (id: string) => void;
  onClose: () => void;
  userRole?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen = true,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClose,
  userRole
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // FORÇAR LIMPEZA E FILTRO CORRETO
  const filteredNotifications = (notifications || []).filter(notification => {
    if (filter === 'unread') return !notification.read;
    return true;
  });

  // Log para debug
  console.log('NotificationCenter - Total notificações:', notifications?.length || 0);
  console.log('NotificationCenter - Filtradas:', filteredNotifications.length);
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      case 'document':
        return <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      case 'approval':
        return <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };
  
  const formatTimeDifference = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays < 7) {
      return `${diffDays}d atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute top-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-600 z-50 max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex border-b border-gray-200 dark:border-gray-600">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 text-sm font-medium ${
            filter === 'all'
              ? 'text-gray-600 dark:text-gray-300 border-b-2 border-gray-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 py-2 text-sm font-medium ${
            filter === 'unread'
              ? 'text-gray-600 dark:text-gray-300 border-b-2 border-gray-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Não lidas
        </button>
      </div>
      
      {/* Notification List */}
      <div className="overflow-y-auto flex-1">
        {filteredNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Nenhuma notificação encontrada
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 group ${
                !notification.read ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-500' : ''
              }`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-1">
                  <div className="flex-shrink-0 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTimeDifference(notification.timestamp)}</p>
                  </div>
                </div>
                {onDeleteNotification && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(notification.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    title="Apagar notificação"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={onMarkAllAsRead}
          className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
        >
          Marcar todas como lidas
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;