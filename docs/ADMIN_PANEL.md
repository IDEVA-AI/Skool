# 🎛️ Painel Administrativo - Guia Completo

## Visão Geral

O Painel Administrativo é uma interface completa para gerenciar todos os aspectos da plataforma S-K-O-O-L MVP. Acesse em `/admin` após fazer login como administrador.

## Acesso

### Requisitos
- Conta de usuário com `role = 'admin'` na tabela `users`
- Estar autenticado na aplicação

### Como Promover um Usuário a Admin
```sql
-- Por email
SELECT * FROM promote_to_admin('seu-email@exemplo.com');

-- Ou promover primeiro usuário (fallback)
SELECT * FROM promote_first_user_to_admin();
```

## Estrutura do Painel

### 1. Dashboard (`/admin`)
Visão geral da plataforma com:
- Estatísticas gerais (total de cursos, inscrições, aulas)
- Ações rápidas
- Lista de cursos recentes

### 2. Cursos (`/admin/courses`)
Gerenciamento completo de cursos:
- **Listar**: Ver todos os cursos em uma tabela
- **Criar**: Botão "Novo Curso" abre formulário
- **Editar**: Clique no ícone de edição
- **Deletar**: Clique no ícone de lixeira (confirmação necessária)
- **Buscar**: Campo de busca para filtrar cursos

**Campos do Formulário de Curso:**
- Título * (obrigatório)
- Descrição
- Comunidade (dropdown)
- Texto da Capa
- URL da Imagem de Capa

### 3. Módulos e Aulas (`/admin/courses/:id`)
Gerenciamento de conteúdo do curso:
- **Módulos**: Criar, editar, deletar módulos
- **Aulas**: Criar, editar, deletar aulas dentro de cada módulo
- **Ordenação**: Campo "Ordem" para controlar sequência
- **Upload**: Upload de vídeos/PDFs ou URL externa

**Campos do Formulário de Módulo:**
- Título * (obrigatório)
- Ordem (número para sequência)

**Campos do Formulário de Aula:**
- Título * (obrigatório)
- Tipo de Conteúdo (vídeo/pdf/texto)
- Upload de Arquivo OU URL Externa
- Duração (em segundos)
- Ordem (número para sequência)

### 4. Media Library (`/admin/media`)
Gerenciamento de arquivos de mídia:
- **Upload**: Enviar vídeos e PDFs para o Supabase Storage
- **Listar**: Ver todos os arquivos enviados
- **Copiar URL**: Copiar URL pública do arquivo
- **Deletar**: Remover arquivos do storage

## Configuração do Storage

### Criar Bucket no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **Storage** → **Buckets**
3. Clique em **New Bucket**
4. Configure:
   - **Name**: `course-media`
   - **Public bucket**: ✅ (marcado)
   - **File size limit**: 52428800 (50MB)
   - **Allowed MIME types**: `video/*,application/pdf` (opcional)

### Políticas RLS do Storage

Execute no SQL Editor do Supabase:

```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-media');

-- Permitir leitura pública
CREATE POLICY "Public can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-media');

-- Permitir delete para usuários autenticados
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-media');
```

## Fluxo de Trabalho Recomendado

### Criar um Curso Completo

1. **Criar Curso**
   - Vá em `/admin/courses`
   - Clique em "Novo Curso"
   - Preencha título, descrição, comunidade
   - Salve

2. **Adicionar Módulos**
   - Clique no curso criado ou em "Ver" (ícone de olho)
   - Clique em "Novo Módulo"
   - Preencha título e ordem
   - Salve

3. **Adicionar Aulas**
   - Expanda o módulo criado
   - Clique em "Nova Aula"
   - Preencha título e tipo
   - **Opção A**: Faça upload do arquivo
   - **Opção B**: Cole URL externa (YouTube, Vimeo, etc.)
   - Defina duração e ordem
   - Salve

4. **Verificar**
   - Volte para `/courses` (página pública)
   - Veja o curso listado
   - Inscreva-se e teste a visualização

## Upload de Arquivos

### Opções Disponíveis

1. **Upload Direto (Supabase Storage)**
   - Suporta vídeos (MP4, MOV, WebM) e PDFs
   - Limite: 50MB por arquivo
   - URL pública gerada automaticamente
   - Requer bucket `course-media` configurado

2. **URL Externa**
   - Use para vídeos hospedados em YouTube, Vimeo, etc.
   - Cole a URL completa no campo "URL Externa"
   - Não requer configuração de storage

### Recomendações

- **Vídeos**: Use URLs externas (YouTube/Vimeo) para economizar storage
- **PDFs**: Use upload direto para controle total
- **Arquivos grandes**: Considere usar serviços externos (Cloudflare R2, AWS S3)

## Troubleshooting

### "Bucket not found"
- Crie o bucket `course-media` no Supabase Dashboard
- Verifique se o nome está correto (case-sensitive)

### "Permission denied" no upload
- Verifique as políticas RLS do storage
- Certifique-se de estar autenticado
- Verifique se o bucket está público

### "Arquivo muito grande"
- Limite atual: 50MB
- Para arquivos maiores, use URLs externas
- Ou aumente o limite no bucket (máx. 5GB no Supabase)

### Cursos não aparecem na página pública
- Verifique se o curso foi salvo corretamente
- Verifique se há um `instructor_id` válido
- Verifique as políticas RLS da tabela `courses`

## Permissões e Segurança

- Apenas usuários com `role = 'admin'` podem acessar `/admin/*`
- Todas as rotas admin são protegidas por `AdminGuard`
- Operações de delete requerem confirmação
- Uploads são validados (tipo e tamanho)

## Próximos Passos

Após criar cursos:
1. Teste o fluxo completo como aluno
2. Verifique se os módulos/aulas aparecem corretamente
3. Teste o upload e visualização de conteúdo
4. Ajuste ordem e organização conforme necessário

## Dicas

- Use a ordenação numérica para organizar módulos e aulas
- Mantenha descrições claras e objetivas
- Use URLs externas para vídeos longos
- Faça backup regular dos dados importantes
- Teste sempre após criar/editar conteúdo

