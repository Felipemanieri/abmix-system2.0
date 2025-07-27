/**
 * SISTEMA DE SAUDAÇÃO DINÂMICA AUTOMÁTICA
 * Aplicável automaticamente a TODOS os usuários cadastrados no sistema
 * Funciona para QUALQUER usuário que fizer login em QUALQUER portal
 */

export function getDynamicGreeting(userName?: string): string {
  const hour = new Date().getHours();
  
  let greeting: string;
  
  // Sistema de horários brasileiros
  if (hour >= 5 && hour < 12) {
    greeting = "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Boa tarde";
  } else {
    greeting = "Boa noite";
  }
  
  // AUTOMÁTICO: Se o nome do usuário foi fornecido, inclui na saudação
  if (userName) {
    return `${greeting}, ${userName}`;
  }
  
  return greeting;
}

/**
 * Gera saudação completa com vírgula
 */
export function getFullGreeting(userName: string): string {
  return getDynamicGreeting(userName);
}

/**
 * Apenas a saudação sem nome (para casos especiais)
 */
export function getGreetingOnly(): string {
  return getDynamicGreeting();
}