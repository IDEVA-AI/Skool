# Integração com Hotmart

Este documento descreve como configurar e usar a integração com a Hotmart para liberar automaticamente acesso aos cursos quando um aluno realiza uma compra.

## Visão Geral

Quando um aluno compra um produto na Hotmart, a plataforma recebe um webhook com os dados da compra. O sistema automaticamente:

1. Identifica o curso correspondente ao produto Hotmart
2. Cria a conta do usuário (se ainda não existir)
3. Libera o acesso ao curso criando um enrollment
4. Envia email de boas-vindas com credenciais (se usuário novo)

## Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env.local`:

```bash
# Token de segurança do webhook da Hotmart
HOTMART_HOTTOK=seu_token_secreto_aqui

# Chave de serviço do Supabase (necessária para criar usuários)
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

### 2. Configurar Webhook na Hotmart

1. Acesse o painel da Hotmart
2. Vá em **Configurações** > **Webhooks**
3. Adicione uma nova URL de webhook:
   ```
   https://seu-dominio.com/api/webhooks/hotmart
   ```
4. Configure o token de segurança (`HOTMART_HOTTOK`) no painel
5. Selecione os eventos que deseja receber:
   - `PURCHASE_APPROVED` (obrigatório)
   - `PURCHASE_REFUNDED` (opcional)
   - `PURCHASE_CANCELED` (opcional)

### 3. Vincular Produtos aos Cursos

1. Acesse o painel admin: `/admin/hotmart`
2. Clique em **Vincular Produto**
3. Selecione o curso correspondente
4. Informe o **Product ID** da Hotmart (encontrado no painel da Hotmart)
5. Opcionalmente, informe o nome do produto
6. Salve

## Como Funciona

### Fluxo de Compra

```
1. Aluno compra na Hotmart
   ↓
2. Hotmart envia webhook para /api/webhooks/hotmart
   ↓
3. Sistema valida assinatura do webhook
   ↓
4. Sistema busca curso vinculado ao product_id
   ↓
5. Sistema verifica se usuário existe pelo email
   ↓
6a. Se não existe: cria usuário com senha temporária
   ↓
6b. Envia email de boas-vindas
   ↓
7. Sistema cria enrollment (inscrição no curso)
   ↓
8. Sistema registra compra na tabela hotmart_purchases
```

### Eventos Tratados

- **PURCHASE_APPROVED**: Libera acesso ao curso
- **PURCHASE_REFUNDED**: Atualiza status (não remove acesso por padrão)
- **PURCHASE_CANCELED**: Atualiza status (não remove acesso por padrão)

## Estrutura do Banco de Dados

### Tabela `hotmart_products`

Armazena a vinculação entre produtos Hotmart e cursos:

```sql
- id: ID único
- course_id: ID do curso vinculado
- hotmart_product_id: Product ID da Hotmart
- hotmart_product_name: Nome do produto (opcional)
- created_at: Data de criação
- updated_at: Data de atualização
```

### Tabela `hotmart_purchases`

Registra todas as compras recebidas:

```sql
- id: ID único
- hotmart_transaction_id: ID da transação Hotmart
- hotmart_product_id: Product ID
- buyer_email: Email do comprador
- buyer_name: Nome do comprador
- user_id: ID do usuário (se criado)
- course_id: ID do curso
- status: approved, refunded, cancelled, pending
- raw_payload: Payload completo do webhook (JSONB)
- processed_at: Data de processamento
- created_at: Data de recebimento
```

## Segurança

### Validação do Webhook

O sistema valida o header `X-Hotmart-Hottok` em todas as requisições. Certifique-se de:

1. Usar um token forte e único
2. Não compartilhar o token publicamente
3. Manter o token sincronizado entre Hotmart e `.env.local`

### Idempotência

O sistema verifica se uma transação já foi processada antes de criar enrollments, evitando duplicações.

## Monitoramento

### Visualizar Compras

Acesse `/admin/hotmart` e vá na aba **Histórico de Compras** para ver:

- Todas as compras recebidas
- Status de cada compra
- Usuário vinculado
- Curso liberado

### Logs

O sistema registra erros no console. Em produção, configure logs adequados para monitorar:

- Webhooks recebidos
- Erros de processamento
- Usuários criados
- Enrollments criados

## Troubleshooting

### Webhook não está sendo recebido

1. Verifique se a URL está correta e acessível
2. Verifique se o token está configurado corretamente
3. Verifique os logs do servidor
4. Teste a URL manualmente (deve retornar erro de autenticação se funcionando)

### Produto não vinculado

1. Verifique se o Product ID está correto
2. Certifique-se de que o produto foi vinculado no painel admin
3. Verifique se o Product ID no webhook corresponde ao cadastrado

### Usuário não recebe acesso

1. Verifique se a compra foi processada (aba Histórico de Compras)
2. Verifique se o enrollment foi criado
3. Verifique os logs para erros específicos

### Email não enviado

Atualmente, o envio de email está implementado apenas como log. Para implementar envio real:

1. Configure um serviço de email (SendGrid, Resend, etc.)
2. Ou use Supabase Edge Function para envio
3. Atualize a função `sendWelcomeEmail` em `server/hotmart-webhook.ts`

## Próximos Passos

- [ ] Implementar envio real de emails
- [ ] Adicionar opção para remover acesso em caso de reembolso
- [ ] Adicionar notificações para admin quando compra é processada
- [ ] Adicionar analytics de conversão
- [ ] Suporte a múltiplos produtos por curso

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação da Hotmart: https://developers.hotmart.com/
- Logs do servidor
- Tabela `hotmart_purchases` para histórico completo

