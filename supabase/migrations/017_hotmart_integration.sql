-- ============================================
-- MIGRATION 017: Integração com Hotmart
-- Cria tabelas para vincular produtos Hotmart aos cursos e registrar compras
-- ============================================

-- Tabela para vincular product_id da Hotmart ao curso
CREATE TABLE IF NOT EXISTS hotmart_products (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  hotmart_product_id TEXT NOT NULL UNIQUE,
  hotmart_product_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para log de todas as compras recebidas via webhook
CREATE TABLE IF NOT EXISTS hotmart_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotmart_transaction_id TEXT UNIQUE NOT NULL,
  hotmart_product_id TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'refunded', 'cancelled', 'pending')),
  raw_payload JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_hotmart_products_course_id ON hotmart_products(course_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_products_product_id ON hotmart_products(hotmart_product_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_purchases_transaction_id ON hotmart_purchases(hotmart_transaction_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_purchases_user_id ON hotmart_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_purchases_course_id ON hotmart_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_purchases_status ON hotmart_purchases(status);
CREATE INDEX IF NOT EXISTS idx_hotmart_purchases_buyer_email ON hotmart_purchases(buyer_email);

-- Habilitar RLS nas tabelas
ALTER TABLE hotmart_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotmart_purchases ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES para hotmart_products
-- ============================================

-- Todos autenticados podem ver produtos vinculados
DROP POLICY IF EXISTS "Users can view hotmart products" ON hotmart_products;
CREATE POLICY "Users can view hotmart products"
  ON hotmart_products FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem criar/editar/deletar produtos vinculados
DROP POLICY IF EXISTS "Admins can manage hotmart products" ON hotmart_products;
CREATE POLICY "Admins can manage hotmart products"
  ON hotmart_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES para hotmart_purchases
-- ============================================

-- Usuários podem ver suas próprias compras
DROP POLICY IF EXISTS "Users can view own purchases" ON hotmart_purchases;
CREATE POLICY "Users can view own purchases"
  ON hotmart_purchases FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Apenas admins podem inserir/atualizar compras (via webhook com service role)
-- Nota: Webhooks usarão service role key, então não precisam de policy aqui
-- Mas adicionamos para segurança
DROP POLICY IF EXISTS "Admins can manage purchases" ON hotmart_purchases;
CREATE POLICY "Admins can manage purchases"
  ON hotmart_purchases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Trigger para atualizar updated_at em hotmart_products
CREATE OR REPLACE FUNCTION update_hotmart_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_hotmart_products_updated_at ON hotmart_products;
CREATE TRIGGER trigger_update_hotmart_products_updated_at
  BEFORE UPDATE ON hotmart_products
  FOR EACH ROW
  EXECUTE FUNCTION update_hotmart_products_updated_at();

