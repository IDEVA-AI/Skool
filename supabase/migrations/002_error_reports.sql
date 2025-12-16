-- ============================================
-- MIGRATION: Error Reports Table
-- Tabela para armazenar relatórios de erros do frontend
-- ============================================

-- Criar tabela error_reports
CREATE TABLE IF NOT EXISTS error_reports (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Tipo de erro
  type TEXT NOT NULL CHECK (type IN ('runtime', 'api', 'boundary')),
  
  -- Informações do erro
  message TEXT NOT NULL,
  stack TEXT,
  
  -- Contexto
  route TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role TEXT,
  user_agent TEXT,
  
  -- Contexto adicional em JSON
  context JSONB DEFAULT '{}'::jsonb,
  
  -- Metadados da requisição (para erros de API)
  api_endpoint TEXT,
  api_method TEXT,
  api_status INTEGER,
  
  -- Hash para deduplicação
  error_hash TEXT
);

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_error_reports_created_at ON error_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_reports_type ON error_reports(type);
CREATE INDEX IF NOT EXISTS idx_error_reports_user_id ON error_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_error_hash ON error_reports(error_hash);
CREATE INDEX IF NOT EXISTS idx_error_reports_route ON error_reports(route);

-- RLS Policies
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ler os relatórios de erro
CREATE POLICY "Admins can view error reports"
  ON error_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Qualquer usuário autenticado pode inserir erros (para reportar)
CREATE POLICY "Authenticated users can insert error reports"
  ON error_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE error_reports IS 'Armazena relatórios de erros capturados no frontend';
COMMENT ON COLUMN error_reports.type IS 'Tipo de erro: runtime, api, ou boundary';
COMMENT ON COLUMN error_reports.error_hash IS 'Hash do erro para deduplicação e prevenção de spam';
COMMENT ON COLUMN error_reports.context IS 'Contexto adicional do erro em formato JSON';

