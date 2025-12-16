import { reportError, sanitizePayload } from './error-reporter';

/**
 * Wrapper para fetch que intercepta erros HTTP
 */
export async function fetchWithErrorReporting(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const method = init?.method || 'GET';

  // Não interceptar chamadas para error_reports para evitar loops
  if (url.includes('error_reports')) {
    return fetch(input, init);
  }

  // Não interceptar chamadas do Supabase (supabase.co, supabase.io)
  // para evitar loops e problemas com autenticação
  if (url.includes('supabase.co') || url.includes('supabase.io')) {
    return fetch(input, init);
  }

  try {
    const response = await fetch(input, init);

    // Reportar erros HTTP (status >= 400)
    // Mas não reportar erros 401/403 que são esperados em alguns casos
    if (response.status >= 400 && response.status !== 401 && response.status !== 403) {
      // Tentar ler o body para contexto, mas não bloquear se falhar
      let errorBody: any = null;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          errorBody = await response.clone().json();
        } else {
          const text = await response.clone().text();
          if (text) {
            errorBody = { raw: text.substring(0, 500) }; // Limitar tamanho
          }
        }
      } catch (e) {
        // Ignorar erro ao ler body
      }

      reportError({
        type: 'api',
        message: `HTTP ${response.status} ${response.statusText}`,
        api_endpoint: url,
        api_method: method,
        api_status: response.status,
        context: {
          statusText: response.statusText,
          headers: sanitizePayload(Object.fromEntries(response.headers.entries())),
          body: errorBody ? sanitizePayload(errorBody) : null,
          requestInit: init ? sanitizePayload({
            method: init.method,
            headers: init.headers ? sanitizePayload(init.headers) : undefined,
            // Não incluir body completo para evitar dados sensíveis
            hasBody: !!init.body,
            bodyType: init.body ? typeof init.body : undefined,
          }) : undefined,
        },
      });
    }

    return response;
  } catch (error: any) {
    // Erro de rede ou outro erro não-HTTP
    reportError({
      type: 'api',
      message: error?.message || 'Network error or fetch failed',
      stack: error?.stack,
      api_endpoint: url,
      api_method: method,
      context: {
        errorType: error?.name,
        errorMessage: error?.message,
      },
    });

    throw error;
  }
}

/**
 * Intercepta erros do Supabase
 * 
 * Esta função deve ser chamada após criar o cliente Supabase
 * para interceptar erros nas chamadas.
 */
export function interceptSupabaseErrors() {
  // O Supabase usa fetch internamente, então nosso wrapper de fetch já captura
  // a maioria dos erros. Mas podemos adicionar interceptação específica aqui se necessário.
  
  // Por enquanto, o fetchWithErrorReporting já cobre os casos principais
  // Se precisarmos de interceptação mais específica do Supabase, podemos adicionar aqui
}

