# Sistema de Monitoramento de Erros

## Visão Geral

Sistema completo de captura, sanitização e armazenamento de erros do frontend em uma tabela Supabase para análise e debugging.

## Arquitetura

### Componentes Principais

1. **Tabela `error_reports`** (`supabase/migrations/002_error_reports.sql`)
   - Armazena todos os erros reportados
   - Campos: type, message, stack, route, user_id, context, api_endpoint, etc.
   - RLS: apenas admins podem ler, qualquer autenticado pode inserir

2. **Error Reporter** (`client/src/lib/error-reporter.ts`)
   - Função `reportError()`: sanitiza e envia erros
   - Função `sanitizePayload()`: remove dados sensíveis
   - Função `initializeErrorReporting()`: configura listeners globais
   - Spam guard: cooldown de 10s por hash de erro

3. **Error Boundary** (`client/src/components/error-boundary.tsx`)
   - Captura erros de renderização React
   - UI de fallback amigável
   - Reporta automaticamente erros capturados

4. **API Error Interceptor** (`client/src/lib/api-error-interceptor.ts`)
   - Wrapper `fetchWithErrorReporting()` para interceptar erros HTTP
   - Captura status >= 400 automaticamente

5. **Supabase Error Handler** (`client/src/lib/supabase-error-handler.ts`)
   - `handleSupabaseError()`: reporta erros do Supabase
   - `safeSupabaseCall()`: wrapper para operações Supabase

## Tipos de Erros Capturados

### 1. Runtime Errors
- Erros JavaScript não capturados (`window.onerror`)
- Promises rejeitadas não tratadas (`unhandledrejection`)
- Erros de renderização React (ErrorBoundary)

### 2. API Errors
- Falhas HTTP (status >= 400)
- Erros de rede
- Erros do Supabase (PostgrestError)

## Sanitização de Dados

### Dados Removidos/Mascarados:
- Tokens, senhas, secrets, keys
- Headers de autorização
- Cookies
- Emails completos (mascarados)
- Strings muito longas (truncadas em 1000 chars)
- Objetos profundos (limitados a 5 níveis)
- Arrays grandes (limitados a 10 itens)
- Objetos grandes (limitados a 20 chaves)

### Padrões Sensíveis Detectados:
- `password: ...`
- `token: ...`
- `authorization: Bearer ...`
- Emails (`user@domain.com`)

## Prevenção de Spam

- **Cooldown**: 10 segundos entre reportes do mesmo erro (mesmo hash)
- **Hash de deduplicação**: baseado em message + stack
- **Cache limitado**: mantém apenas últimos 100 erros reportados

## Integração

### App.tsx
```typescript
<ErrorBoundary>
  <QueryClientProvider>
    {/* ... */}
  </QueryClientProvider>
</ErrorBoundary>
```

### Inicialização
```typescript
useEffect(() => {
  initializeErrorReporting(); // Configura listeners globais
}, []);
```

### Uso Manual
```typescript
import { reportError } from '@/lib/error-reporter';

try {
  // código que pode falhar
} catch (error) {
  reportError({
    type: 'runtime',
    message: error.message,
    stack: error.stack,
    context: { /* contexto adicional */ }
  });
}
```

### Interceptação Automática
- `fetchWithErrorReporting()`: substitui `fetch()` para captura automática
- `handleSupabaseError()`: reporta erros do Supabase
- ErrorBoundary: captura erros de renderização automaticamente

## Estrutura do Relatório

```typescript
{
  type: 'runtime' | 'api' | 'boundary',
  message: string,           // Sanitizado
  stack?: string,            // Sanitizado
  route?: string,            // URL atual
  user_id?: string,         // ID do usuário (se autenticado)
  user_role?: string,        // Role do usuário
  user_agent?: string,       // User agent do navegador
  context?: object,          // Contexto adicional sanitizado
  api_endpoint?: string,     // Para erros de API
  api_method?: string,       // GET, POST, etc.
  api_status?: number,       // Status HTTP
  error_hash?: string        // Hash para deduplicação
}
```

## Consultando Relatórios

### Via Supabase SQL Editor:
```sql
-- Últimos 10 erros
SELECT * FROM error_reports 
ORDER BY created_at DESC 
LIMIT 10;

-- Erros por tipo
SELECT type, COUNT(*) 
FROM error_reports 
GROUP BY type;

-- Erros de um usuário específico
SELECT * FROM error_reports 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;

-- Erros de uma rota específica
SELECT * FROM error_reports 
WHERE route LIKE '/admin%'
ORDER BY created_at DESC;
```

### Via Dashboard Admin (Futuro)
- Criar página admin para visualizar erros
- Filtros por tipo, rota, usuário, data
- Detalhes completos do erro e contexto

## Segurança

- ✅ Dados sensíveis são sanitizados antes de enviar
- ✅ RLS garante que apenas admins vejam relatórios
- ✅ Erros no reportador não causam loops infinitos
- ✅ Cooldown previne spam de erros repetidos
- ✅ Limites de tamanho previnem payloads enormes

## Próximos Passos

1. Criar dashboard admin para visualizar erros
2. Adicionar alertas/notificações para erros críticos
3. Agregar estatísticas de erros (gráficos, tendências)
4. Adicionar filtros avançados na interface admin
5. Exportar relatórios em CSV/JSON

