# Sistema de Controle de Acesso Baseado em Roles (RBAC) para Posts

## Visão Geral

Este documento descreve o sistema de controle de acesso implementado para gerenciar permissões de CRUD em posts, onde usuários ADMIN têm acesso total e usuários regulares podem apenas editar/deletar seus próprios posts.

## Arquitetura

### 1. Função de Permissões Centralizada

A função `can()` está localizada em `client/src/lib/permissions.ts` e centraliza toda a lógica de verificação de permissões.

```typescript
can(user, userRole, action, post?)
```

**Parâmetros:**
- `user`: Usuário autenticado do Supabase Auth
- `userRole`: Role do usuário ('admin' | 'student' | null)
- `action`: Ação a ser verificada ('create' | 'read' | 'update' | 'delete' | 'moderate')
- `post`: Post alvo (opcional, necessário para update/delete)

**Regras de Permissão:**

| Ação | Admin | Usuário Regular |
|------|-------|-----------------|
| `create` | ✅ | ✅ |
| `read` | ✅ | ✅ |
| `update` | ✅ (qualquer post) | ✅ (apenas próprio post) |
| `delete` | ✅ (qualquer post) | ✅ (apenas próprio post) |
| `moderate` | ✅ | ❌ |

### 2. Hooks de Mutação

Localizados em `client/src/hooks/use-posts.ts`:

- **`useCreatePost()`**: Cria um novo post
- **`useUpdatePost()`**: Atualiza um post existente
- **`useDeletePost()`**: Deleta um post

Todos os hooks invalidam automaticamente as queries relacionadas após sucesso.

### 3. Componente de Menu de Ações

O componente `PostActionsMenu` (`client/src/components/social/post-actions-menu.tsx`) renderiza um dropdown menu com ações baseadas em permissões.

**Características:**
- Usa a função `can()` para verificar permissões
- Renderiza apenas ações permitidas
- Agrupa visualmente ações de admin com label "Moderação"
- Inclui confirmação antes de deletar
- Previne propagação de eventos de clique

## Fluxo de Controle de Acesso

### 1. Verificação de Permissões

```typescript
// No componente PostActionsMenu
const canUpdate = can(user, userRole || null, 'update', post);
const canDelete = can(user, userRole || null, 'delete', post);
const isAdmin = userRole === 'admin';
```

### 2. Renderização Condicional

```typescript
// Se não há permissões, não renderiza o menu
if (!canUpdate && !canDelete && !canModerate) {
  return null;
}
```

### 3. Agrupamento Visual

- **Usuários regulares**: Ações simples (Editar, Deletar)
- **Admins**: Ações agrupadas sob label "Moderação" com ícone Shield

### 4. Execução de Ações

```typescript
// Deletar com confirmação
const handleDelete = async () => {
  await deletePostMutation.mutateAsync({ postId: post.id });
  // Toast de sucesso/erro
};
```

## Integração nos Componentes

### PostModal

O `PostModal` inclui o `PostActionsMenu` no header:

```typescript
<PostActionsMenu post={post} />
```

### Home Page

A página home inclui o menu em cada card de post:

```typescript
<div onClick={(e) => e.stopPropagation()}>
  <PostActionsMenu post={post} />
</div>
```

## Segurança

### Frontend (UI)
- Verificações de permissão usando `can()`
- Renderização condicional de ações
- Confirmação antes de ações destrutivas

### Backend (Recomendado)
⚠️ **IMPORTANTE**: As verificações de permissão no frontend são apenas para UX. Você DEVE implementar verificações no backend também usando Row Level Security (RLS) do Supabase.

**Exemplo de Policy RLS:**

```sql
-- Usuários podem atualizar apenas seus próprios posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins podem atualizar qualquer post
CREATE POLICY "Admins can update any post"
ON posts FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

## Uso

### Verificar Permissões em Componentes

```typescript
import { can } from '@/lib/permissions';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';

function MyComponent({ post }) {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  
  const canEdit = can(user, userRole || null, 'update', post);
  const canDelete = can(user, userRole || null, 'delete', post);
  
  return (
    <>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </>
  );
}
```

### Usar Hook de Permissões

```typescript
import { usePermissions } from '@/lib/permissions';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';

function MyComponent({ post }) {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const { canUpdate, canDelete, isAdmin } = usePermissions(user, userRole || null);
  
  return (
    <>
      {canUpdate(post) && <EditButton />}
      {canDelete(post) && <DeleteButton />}
    </>
  );
}
```

## Estrutura de Arquivos

```
client/src/
├── lib/
│   └── permissions.ts          # Função can() e tipos
├── hooks/
│   └── use-posts.ts            # Hooks de CRUD (create, update, delete)
└── components/
    └── social/
        ├── post-actions-menu.tsx  # Componente de menu de ações
        └── index.ts                # Exportações
```

## Próximos Passos

1. ✅ Implementar função `can()` centralizada
2. ✅ Criar hooks de mutação (update, delete)
3. ✅ Criar componente PostActionsMenu
4. ✅ Integrar em PostModal e Home
5. ⚠️ **Pendente**: Implementar RLS policies no Supabase
6. ⚠️ **Pendente**: Adicionar funcionalidade de edição de posts (modal/formulário)

## Notas

- Todas as verificações de permissão devem usar a função `can()` - nunca implementar lógica de permissão diretamente no JSX
- O componente PostActionsMenu não renderiza nada se não houver permissões
- Ações de admin são visualmente agrupadas para melhor UX
- Confirmação é necessária antes de deletar posts

