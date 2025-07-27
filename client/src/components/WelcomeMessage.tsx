
import React from 'react';
import { getDynamicGreeting } from '../utils/greetingHelper';

interface WelcomeMessageProps {
  userEmail?: string;
  userName?: string;
  portalName?: string;
  className?: string;
}

export function WelcomeMessage({ userEmail, userName, portalName, className = "" }: WelcomeMessageProps) {
  // Nome completo do usuário (prioritário) ou extraído do email
  const displayName = userName || userEmail?.split('@')[0] || 'Usuário';
  
  // Saudação dinâmica AUTOMÁTICA para QUALQUER usuário cadastrado
  const dynamicGreeting = getDynamicGreeting(displayName);

  return (
    <div className={`${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {dynamicGreeting}!
      </h2>
      {portalName && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Bem-vindo ao {portalName}
        </p>
      )}
    </div>
  );
}

export default WelcomeMessage;
