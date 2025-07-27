#!/bin/bash

# Substituir todos os alerts por showNotification
sed -i "s/alert('Todas as atualizações foram desabilitadas temporariamente!')/showNotification('Sistema', 'Todas as atualizações foram desabilitadas temporariamente!', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Todas as atualizações foram habilitadas!')/showNotification('Sistema', 'Todas as atualizações foram habilitadas!', 'success')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Configurações aplicadas com sucesso!')/showNotification('Configurações', 'Configurações aplicadas com sucesso!', 'success')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Sistema otimizado para produção!')/showNotification('Sistema', 'Sistema otimizado para produção!', 'success')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Modo de desenvolvimento ativado!')/showNotification('Sistema', 'Modo de desenvolvimento ativado!', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Configurações padrão restauradas!')/showNotification('Sistema', 'Configurações padrão restauradas!', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Abrindo configuração Make.com...')/showNotification('Make.com', 'Abrindo configuração...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Adicionando novo Zap...')/showNotification('Zapier', 'Adicionando novo Zap...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Abrindo configuração Zapier...')/showNotification('Zapier', 'Abrindo configuração...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Adicionando nova instância WhatsApp...')/showNotification('WhatsApp', 'Adicionando nova instância...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Configurando WhatsApp...')/showNotification('WhatsApp', 'Configurando...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Adicionando nova instância SendGrid...')/showNotification('SendGrid', 'Adicionando nova instância...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Configurando SendGrid...')/showNotification('SendGrid', 'Configurando...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Adicionando nova instância Twilio...')/showNotification('Twilio', 'Adicionando nova instância...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Configurando Twilio...')/showNotification('Twilio', 'Configurando...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Adicionando nova instância Slack...')/showNotification('Slack', 'Adicionando nova instância...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('Configurando Slack...')/showNotification('Slack', 'Configurando...', 'info')/g" client/src/components/RestrictedAreaPortal.tsx

# Substituir alerts dinâmicos
sed -i "s/alert(\`✅ \${result.message}\\\\n\\\\nÚltima atualização: \${new Date(result.timestamp).toLocaleString('pt-BR')}\`)/showNotification('Sucesso', result.message + ' - Última atualização: ' + new Date(result.timestamp).toLocaleString('pt-BR'), 'success')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert(\`❌ Erro na sincronização: \${result.error}\`)/showNotification('Erro', 'Erro na sincronização: ' + result.error, 'error')/g" client/src/components/RestrictedAreaPortal.tsx
sed -i "s/alert('❌ Erro de conexão. Verifique sua internet e tente novamente.')/showNotification('Erro', 'Erro de conexão. Verifique sua internet e tente novamente.', 'error')/g" client/src/components/RestrictedAreaPortal.tsx

# Mais substituições genéricas
sed -i "s/alert(/showNotification('Notificação', /g" client/src/components/RestrictedAreaPortal.tsx

echo "Substituições concluídas!"