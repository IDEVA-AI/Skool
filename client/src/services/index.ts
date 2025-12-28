/**
 * Camada de serviços para acesso a dados
 * 
 * Esta camada centraliza toda a lógica de acesso ao Supabase,
 * separando-a dos componentes e hooks. Isso facilita:
 * - Manutenção e testes
 * - Migração futura para API backend
 * - Reutilização de código
 * - Validação centralizada
 */

export * from './posts';
export * from './courses';
export * from './comments';

