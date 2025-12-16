import { PostgrestError } from '@supabase/supabase-js';
import { reportError } from './error-reporter';

/**
 * Intercepta erros do Supabase e os reporta
 * 
 * Use esta função para envolver chamadas do Supabase:
 * 
 * const { data, error } = await supabase.from('table').select();
 * if (error) {
 *   handleSupabaseError(error, { endpoint: 'table.select', operation: 'select' });
 *   throw error;
 * }
 */
export function handleSupabaseError(
  error: PostgrestError | Error | null | undefined,
  context?: {
    endpoint?: string;
    operation?: string;
    table?: string;
    [key: string]: any;
  }
): void {
  if (!error) {
    return;
  }

  const isPostgrestError = 'code' in error && 'details' in error;
  const message = error.message || 'Supabase error';
  const code = isPostgrestError ? (error as PostgrestError).code : undefined;
  const details = isPostgrestError ? (error as PostgrestError).details : undefined;
  const hint = isPostgrestError ? (error as PostgrestError).hint : undefined;

  // Determinar status HTTP aproximado baseado no código do Postgres
  let apiStatus: number | undefined;
  if (code) {
    // Códigos comuns do Postgres/Supabase
    if (code === 'PGRST116') apiStatus = 404; // Not found
    else if (code === '23505') apiStatus = 409; // Unique violation
    else if (code === '23503') apiStatus = 400; // Foreign key violation
    else if (code === '42501') apiStatus = 403; // Insufficient privilege
    else if (code === 'PGRST301') apiStatus = 400; // Invalid request
    else apiStatus = 500;
  }

  reportError({
    type: 'api',
    message: `Supabase Error: ${message}`,
    stack: error.stack,
    api_endpoint: context?.endpoint || context?.table,
    api_method: context?.operation || 'unknown',
    api_status: apiStatus,
    context: {
      code,
      details,
      hint,
      ...context,
    },
  });
}

/**
 * Wrapper para operações do Supabase que automaticamente reporta erros
 * 
 * Exemplo:
 * const result = await safeSupabaseCall(
 *   () => supabase.from('posts').select(),
 *   { endpoint: 'posts.select', operation: 'select' }
 * );
 */
export async function safeSupabaseCall<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  context?: {
    endpoint?: string;
    operation?: string;
    table?: string;
    [key: string]: any;
  }
): Promise<{ data: T | null; error: PostgrestError | null }> {
  const result = await operation();
  
  if (result.error) {
    handleSupabaseError(result.error, context);
  }
  
  return result;
}

