import { supabase } from './supabase';

/**
 * Tipos de erro suportados
 */
export type ErrorType = 'runtime' | 'api' | 'boundary';

/**
 * Interface para contexto de erro
 */
export interface ErrorContext {
  [key: string]: any;
}

/**
 * Interface para relatório de erro
 */
export interface ErrorReport {
  type: ErrorType;
  message: string;
  stack?: string;
  route?: string;
  user_id?: string;
  user_role?: string;
  user_agent?: string;
  context?: ErrorContext;
  api_endpoint?: string;
  api_method?: string;
  api_status?: number;
  error_hash?: string;
}

/**
 * Palavras-chave sensíveis que devem ser removidas ou mascaradas
 */
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'auth',
  'cookie',
  'session',
  'credential',
  'apikey',
  'api_key',
  'access_token',
  'refresh_token',
];

/**
 * Regex para detectar padrões sensíveis
 */
const SENSITIVE_PATTERNS = [
  /password\s*[:=]\s*['"]?[^'"]+['"]?/gi,
  /token\s*[:=]\s*['"]?[^'"]+['"]?/gi,
  /secret\s*[:=]\s*['"]?[^'"]+['"]?/gi,
  /authorization\s*[:=]\s*['"]?[^'"]+['"]?/gi,
  /bearer\s+[\w-]+/gi,
  /[\w-]+@[\w-]+\.[\w-]+/g, // Emails
];

/**
 * Sanitiza um valor, removendo ou mascarando dados sensíveis
 */
function sanitizeValue(value: any, depth = 0): any {
  // Limitar profundidade de recursão
  if (depth > 5) {
    return '[Max Depth Reached]';
  }

  // Valores primitivos
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }

  // Strings: verificar padrões sensíveis
  if (typeof value === 'string') {
    let sanitized = value;
    
    // Truncar strings muito longas
    if (sanitized.length > 1000) {
      sanitized = sanitized.substring(0, 1000) + '...[truncated]';
    }

    // Mascarar padrões sensíveis
    SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  // Arrays
  if (Array.isArray(value)) {
    return value.slice(0, 10).map(item => sanitizeValue(item, depth + 1));
  }

  // Objetos
  if (typeof value === 'object') {
    const sanitized: any = {};
    const keys = Object.keys(value).slice(0, 20); // Limitar número de chaves
    
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      
      // Pular chaves sensíveis
      if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      sanitized[key] = sanitizeValue(value[key], depth + 1);
    }

    return sanitized;
  }

  return '[Unknown Type]';
}

/**
 * Sanitiza o payload completo do erro
 */
export function sanitizePayload(payload: any): ErrorContext {
  return sanitizeValue(payload) as ErrorContext;
}

/**
 * Gera hash simples para deduplicação
 */
function generateErrorHash(message: string, stack?: string): string {
  const content = `${message}|${stack || ''}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Cache de erros reportados recentemente (para evitar spam)
 */
const reportedErrors = new Map<string, number>();
const COOLDOWN_MS = 10 * 1000; // 10 segundos

/**
 * Verifica se um erro já foi reportado recentemente
 */
function shouldReportError(errorHash: string): boolean {
  const lastReported = reportedErrors.get(errorHash);
  const now = Date.now();

  if (lastReported === undefined) {
    return true;
  }

  // Se passou o cooldown, pode reportar novamente
  if (now - lastReported > COOLDOWN_MS) {
    return true;
  }

  return false;
}

/**
 * Registra que um erro foi reportado
 */
function markErrorReported(errorHash: string): void {
  reportedErrors.set(errorHash, Date.now());

  // Limpar cache antigo (manter apenas últimos 100)
  if (reportedErrors.size > 100) {
    const oldest = Array.from(reportedErrors.entries())
      .sort((a, b) => a[1] - b[1])[0];
    reportedErrors.delete(oldest[0]);
  }
}

/**
 * Obtém informações do contexto atual
 */
async function getCurrentContext(): Promise<{
  route?: string;
  user_id?: string;
  user_role?: string;
  user_agent?: string;
}> {
  const context: any = {};

  // Rota atual
  if (typeof window !== 'undefined') {
    context.route = window.location.pathname + window.location.search;
    context.user_agent = navigator.userAgent;
  }

  // Informações do usuário (com proteção contra erros)
  try {
    // Usar getSession ao invés de getUser para evitar chamadas desnecessárias
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      context.user_id = session.user.id;

      // Buscar role do usuário (com timeout)
      try {
        const rolePromise = supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 1000)
        );

        const { data: userData } = await Promise.race([rolePromise, timeoutPromise]) as any;
        
        if (userData?.role) {
          context.user_role = userData.role;
        }
      } catch (e) {
        // Ignorar erro ao buscar role (timeout ou outro erro)
      }
    }
  } catch (e) {
    // Ignorar erro ao buscar usuário
  }

  return context;
}

/**
 * Flag para evitar loops infinitos - se estamos reportando um erro,
 * não devemos reportar erros que ocorrem durante o reporte
 */
let isReportingError = false;

/**
 * Reporta um erro para o Supabase
 */
export async function reportError(report: Partial<ErrorReport>): Promise<void> {
  // Proteção contra loops: se já estamos reportando um erro, não reportar novamente
  if (isReportingError) {
    return;
  }

  // Ignorar erros relacionados ao próprio error_reports para evitar loops
  if (report.api_endpoint?.includes('error_reports')) {
    return;
  }

  try {
    isReportingError = true;

    // Sanitizar mensagem e stack
    const sanitizedMessage = sanitizeValue(report.message || 'Unknown error') as string;
    const sanitizedStack = report.stack ? sanitizeValue(report.stack) as string : undefined;
    const sanitizedContext = report.context ? sanitizePayload(report.context) : {};

    // Gerar hash para deduplicação
    const errorHash = generateErrorHash(sanitizedMessage, sanitizedStack);

    // Verificar se deve reportar (cooldown)
    if (!shouldReportError(errorHash)) {
      return;
    }

    // Obter contexto atual (com timeout para não travar)
    let currentContext: any = {};
    try {
      const contextPromise = getCurrentContext();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );
      currentContext = await Promise.race([contextPromise, timeoutPromise]);
    } catch (e) {
      // Se falhar ao obter contexto, usar valores padrão
      if (typeof window !== 'undefined') {
        currentContext = {
          route: window.location.pathname + window.location.search,
          user_agent: navigator.userAgent,
        };
      }
    }

    // Preparar payload final
    const payload: any = {
      type: report.type || 'runtime',
      message: sanitizedMessage,
      stack: sanitizedStack,
      route: report.route || currentContext.route,
      user_id: report.user_id || currentContext.user_id,
      user_role: report.user_role || currentContext.user_role,
      user_agent: report.user_agent || currentContext.user_agent,
      context: sanitizedContext,
      error_hash: errorHash,
    };

    // Adicionar campos específicos de API se disponíveis
    if (report.api_endpoint) {
      payload.api_endpoint = sanitizeValue(report.api_endpoint) as string;
    }
    if (report.api_method) {
      payload.api_method = report.api_method;
    }
    if (report.api_status) {
      payload.api_status = report.api_status;
    }

    // Enviar para Supabase (sem usar fetch wrapper para evitar loops)
    const { error } = await supabase
      .from('error_reports')
      .insert(payload);

    if (error) {
      // Não queremos que erros no reportador causem loops infinitos
      // Então apenas logamos no console em desenvolvimento
      if (import.meta.env.DEV) {
        console.error('Failed to report error:', error);
      }
      return;
    }

    // Marcar como reportado
    markErrorReported(errorHash);
  } catch (error) {
    // Silenciosamente ignorar erros no reportador
    // para evitar loops infinitos
    if (import.meta.env.DEV) {
      console.error('Error reporter failed:', error);
    }
  } finally {
    isReportingError = false;
  }
}

/**
 * Inicializa os listeners globais de erro
 */
export function initializeErrorReporting(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Listener para erros não capturados
  window.addEventListener('error', (event) => {
    // Ignorar erros de recursos (imagens, scripts, etc.) que não são críticos
    if (event.target && event.target !== window) {
      return;
    }

    // Ignorar erros de CORS ou de recursos externos
    if (event.message?.includes('CORS') || event.message?.includes('Failed to fetch')) {
      return;
    }

    reportError({
      type: 'runtime',
      message: event.message || 'Unknown error',
      stack: event.error?.stack,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Listener para promises rejeitadas não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const message = error?.message || String(error) || 'Unhandled promise rejection';
    
    // Ignorar alguns erros conhecidos que não são críticos
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return;
    }

    const stack = error?.stack;

    reportError({
      type: 'runtime',
      message: `Unhandled Promise Rejection: ${message}`,
      stack,
      context: {
        reason: typeof error === 'object' ? sanitizePayload(error) : String(error),
      },
    });
  });
}

