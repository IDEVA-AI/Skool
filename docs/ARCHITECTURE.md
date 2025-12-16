# Arquitetura Técnica S-K-O-O-L V2
## Documento de Arquitetura e Estrutura

**Data:** Dezembro 2024  
**Versão:** 2.0

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Schema do Banco de Dados](#schema-do-banco-de-dados)
4. [Fluxos de Autenticação](#fluxos-de-autenticação)
5. [Componentes Reutilizáveis](#componentes-reutilizáveis)
6. [API Routes](#api-routes)
7. [Configurações](#configurações)

---

## Visão Geral

### Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Pages    │  │ Components│ │  Hooks   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│       │              │              │                   │
│       └──────────────┼──────────────┘                   │
│                      │                                   │
│              ┌───────▼───────┐                          │
│              │  React Query  │                          │
│              └───────┬───────┘                          │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────┐
│              SERVER (Express)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Routes   │  │ Storage  │  │  Utils   │            │
│  └────┬─────┘  └────┬─────┘  └──────────┘            │
│       │             │                                  │
│       └──────┬───────┘                                  │
│              │                                          │
└──────────────┼──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│              SUPABASE                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Auth    │  │ Postgres │  │ Storage  │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
```

### Stack Tecnológica

- **Frontend:** React 19 + TypeScript + Vite 7
- **Routing:** Wouter
- **State:** React Query (TanStack Query)
- **UI:** Radix UI + Tailwind CSS 4
- **Backend:** Node.js + Express (apenas para servir frontend)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (100% no frontend)
- **Storage:** Supabase Storage

### Arquitetura Simplificada

**Autenticação:**
- Toda autenticação é feita via Supabase Auth no frontend
- Não há sessões no backend Express
- Não há Passport ou outras bibliotecas de auth no servidor
- O Express serve apenas o frontend (Vite em dev, static em prod)

**Backend:**
- Express é usado apenas para servir o frontend
- Rotas de API podem ser implementadas no futuro usando Supabase RPC ou Edge Functions
- Não há storage em memória ou banco de dados próprio no servidor

---

## Estrutura de Pastas

### Estrutura Completa

```
skool-v2/
├── client/                          # Frontend React
│   ├── public/                      # Assets estáticos
│   │   ├── favicon.png
│   │   └── opengraph.jpg
│   └── src/
│       ├── components/              # Componentes React
│       │   ├── ui/                  # Componentes base (Radix UI)
│       │   │   ├── button.tsx
│       │   │   ├── input.tsx
│       │   │   ├── card.tsx
│       │   │   ├── dialog.tsx
│       │   │   └── ...
│       │   ├── layout.tsx           # Layout principal
│       │   ├── sidebar.tsx           # Sidebar fixa
│       │   ├── topbar.tsx            # Topbar com busca
│       │   ├── auth-guard.tsx        # Proteção de rotas
│       │   └── admin-guard.tsx       # Proteção admin
│       ├── pages/                    # Páginas/Views
│       │   ├── login.tsx
│       │   ├── register.tsx
│       │   ├── dashboard.tsx
│       │   ├── courses/
│       │   │   ├── index.tsx         # Lista de cursos
│       │   │   └── [id].tsx          # Visualização de curso
│       │   ├── community/
│       │   │   ├── index.tsx         # Lista de posts
│       │   │   └── [id].tsx          # Post individual
│       │   └── admin/
│       │       ├── dashboard.tsx
│       │       ├── courses/
│       │       │   ├── index.tsx
│       │       │   ├── [id].tsx
│       │       │   └── new.tsx
│       │       └── modules/
│       │           └── [id].tsx
│       ├── hooks/                    # Custom hooks
│       │   ├── use-auth.tsx
│       │   ├── use-courses.ts
│       │   ├── use-enrollments.ts
│       │   ├── use-posts.ts
│       │   └── use-user-role.ts
│       ├── lib/                      # Utilitários
│       │   ├── supabase.ts           # Cliente Supabase
│       │   ├── query-client.ts       # React Query config
│       │   └── utils.ts              # Funções auxiliares
│       ├── App.tsx                    # Componente raiz
│       ├── main.tsx                   # Entry point
│       └── index.css                  # Estilos globais
│
├── server/                            # Backend Express (apenas para servir frontend)
│   ├── index.ts                      # Entry point
│   ├── routes.ts                     # Definição de rotas (vazio por enquanto)
│   ├── vite.ts                        # Integração Vite em desenvolvimento
│   └── static.ts                      # Servir arquivos estáticos em produção
│
├── shared/                            # Código compartilhado
│   └── schema.ts                     # Tipos TypeScript
│
├── supabase/                          # Scripts SQL
│   ├── migrations/                   # Migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_rls_policies.sql
│   │   └── 003_seed_data.sql
│   ├── functions/                    # Edge Functions (futuro)
│   └── seed.sql                      # Dados iniciais
│
├── docs/                              # Documentação
│   ├── PRD-V2.md
│   ├── WIREFRAMES.md
│   └── ARCHITECTURE.md
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

### Convenções de Nomenclatura

- **Componentes:** PascalCase (`UserCard.tsx`)
- **Hooks:** camelCase com prefixo `use` (`useAuth.tsx`)
- **Utils:** camelCase (`formatDate.ts`)
- **Types:** PascalCase (`User.ts`, `Course.ts`)
- **Routes:** kebab-case (`/admin/courses`)

---

## Schema do Banco de Dados

### Tabelas Principais

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'student')) DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### courses
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  video_embed_url TEXT, -- URL do vídeo principal (opcional)
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);
```

#### modules
```sql
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_modules_order ON modules(course_id, "order");
```

#### lessons
```sql
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_embed_url TEXT, -- YouTube/Vimeo embed URL
  description TEXT,
  "order" INTEGER DEFAULT 0,
  duration INTEGER, -- em minutos (opcional)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_order ON lessons(module_id, "order");
```

#### enrollments
```sql
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
```

#### lesson_progress
```sql
CREATE TABLE lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
```

#### posts
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_course_id ON posts(course_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_pinned ON posts(course_id, pinned DESC, created_at DESC);
CREATE INDEX idx_posts_created_at ON posts(course_id, created_at DESC);
```

#### comments
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(post_id, created_at ASC);
```

### Row Level Security (RLS)

#### Políticas de Acesso

**users:**
```sql
-- Usuários autenticados podem ver todos os usuários
CREATE POLICY "Users are viewable by authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

**courses:**
```sql
-- Todos podem ver cursos
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem criar/editar/deletar
CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

**enrollments:**
```sql
-- Usuários podem ver suas próprias inscrições
CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Usuários podem se inscrever em cursos
CREATE POLICY "Users can enroll in courses"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

**posts:**
```sql
-- Usuários inscritos podem ver posts do curso
CREATE POLICY "Enrolled users can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = posts.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

-- Usuários inscritos podem criar posts
CREATE POLICY "Enrolled users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = posts.course_id
      AND enrollments.user_id = auth.uid()
    )
  );
```

---

## Fluxos de Autenticação

**Importante:** Toda autenticação é feita no frontend via Supabase Auth. O backend Express não participa do processo de autenticação.

### Registro

```
1. Usuário preenche formulário (nome, email, senha)
2. Frontend valida campos com Zod
3. Chama Supabase Auth diretamente: supabase.auth.signUp({ email, password })
4. Supabase cria usuário em auth.users
5. Trigger do Supabase cria registro em public.users automaticamente
6. Frontend redireciona para login ou dashboard
```

### Login

```
1. Usuário preenche email e senha
2. Frontend chama Supabase Auth: supabase.auth.signInWithPassword({ email, password })
3. Supabase valida credenciais e retorna sessão com token JWT
4. Frontend armazena sessão no localStorage (gerenciado pelo Supabase)
5. Hook useAuth() detecta mudança e atualiza estado
6. Redireciona para dashboard
```

### Verificação de Role

```
1. Hook useAuth() obtém usuário atual do Supabase
2. Hook useUserRole() busca role em public.users via Supabase
3. Componente AdminGuard verifica role === 'admin'
4. Se não for admin, redireciona para '/'
```

### Logout

```
1. Frontend chama supabase.auth.signOut()
2. Supabase limpa sessão
3. Hook useAuth() detecta mudança e atualiza estado
4. Redireciona para login
```

---

## Componentes Reutilizáveis

### Layout Components

#### Layout
```typescript
// client/src/components/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

#### Sidebar
```typescript
// client/src/components/sidebar.tsx
export function Sidebar() {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Cursos', href: '/courses', icon: Book },
    { name: 'Comunidade', href: '/community', icon: MessageSquare },
  ];
  
  return (
    <aside className="w-60 border-r">
      {/* Logo, Navigation, User Info */}
    </aside>
  );
}
```

### Guard Components

#### AuthGuard
```typescript
// client/src/components/auth-guard.tsx
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) {
    redirect('/login');
    return null;
  }
  
  return <>{children}</>;
}
```

#### AdminGuard
```typescript
// client/src/components/admin-guard.tsx
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  
  if (isAdmin === undefined) return <LoadingSpinner />;
  if (!isAdmin) {
    redirect('/');
    return null;
  }
  
  return <>{children}</>;
}
```

### UI Components

#### CourseCard
```typescript
// client/src/components/course-card.tsx
export function CourseCard({ course }: { course: Course }) {
  return (
    <Card>
      <CardImage src={course.cover_image_url} />
      <CardContent>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
        <CardFooter>
          <Button>Ver Curso</Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
```

#### VideoPlayer
```typescript
// client/src/components/video-player.tsx
export function VideoPlayer({ embedUrl }: { embedUrl: string }) {
  // Extrai ID do YouTube/Vimeo e renderiza iframe
  return (
    <div className="aspect-video">
      <iframe src={embedUrl} />
    </div>
  );
}
```

---

## API Routes

### Estado Atual

**Não há rotas de API implementadas no backend Express.** Toda comunicação com o banco de dados é feita diretamente do frontend para o Supabase.

### Estrutura Futura (Opcional)

Se necessário no futuro, rotas de API podem ser implementadas de duas formas:

#### Opção 1: Rotas Express com Supabase Client
```typescript
// server/routes.ts
import { createClient } from '@supabase/supabase-js';

app.get('/api/courses', async (req, res) => {
  // Validar token JWT do Supabase
  const token = req.headers.authorization?.replace('Bearer ', '');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data);
});
```

#### Opção 2: Supabase Edge Functions (Recomendado)
- Criar funções serverless no Supabase
- Melhor escalabilidade
- Menos código no servidor Express
- Exemplo: `supabase/functions/get-courses/index.ts`

### Comunicação Atual

Toda comunicação é feita diretamente do frontend para Supabase:

```typescript
// client/src/hooks/use-courses.ts
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}
```

---

## Configurações

### Variáveis de Ambiente

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
```

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./client/src/*"]
    }
  }
}
```

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## Boas Práticas

### Código

1. **TypeScript Strict:** Sempre usar tipos explícitos
2. **Componentes Pequenos:** Máximo 200 linhas por componente
3. **Hooks Customizados:** Lógica reutilizável em hooks
4. **Error Boundaries:** Tratamento de erros em componentes
5. **Loading States:** Sempre mostrar estados de carregamento

### Performance

1. **React Query:** Cache e invalidação inteligente
2. **Code Splitting:** Lazy loading de rotas
3. **Image Optimization:** Lazy loading de imagens
4. **Debounce:** Em buscas e inputs

### Segurança

1. **RLS:** Sempre habilitado em todas as tabelas
2. **Validação:** Frontend + Backend
3. **Sanitização:** Dados de usuário sempre sanitizados
4. **HTTPS:** Sempre em produção

---

## Próximos Passos

1. ✅ Criar estrutura de pastas
2. ✅ Configurar Supabase (schema + RLS)
3. ✅ Implementar autenticação
4. ✅ Criar componentes base
5. ✅ Implementar CRUD de cursos
6. ✅ Implementar consumo de cursos
7. ✅ Implementar fórum
8. ✅ Testes e otimizações

---

**Documento criado em:** Dezembro 2024  
**Última atualização:** Dezembro 2024  
**Versão:** 2.0

