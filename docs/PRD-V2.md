# PRD S-K-O-O-L V2 - Reconstrução Completa
## Product Requirements Document - Versão 2.0

**Data:** Dezembro 2024  
**Status:** MVP - Reconstrução  
**Versão:** 2.0

---

## 1. Visão Geral

### 1.1 Objetivo
Reconstruir a plataforma S-K-O-O-L do zero com foco em **simplicidade, robustez e manutenibilidade**. Esta versão prioriza estabilidade sobre features complexas.

### 1.2 Princípios de Design
- **Simplicidade primeiro**: Features essenciais apenas
- **Zero bugs**: Código testável e robusto
- **UX intuitiva**: Interface limpa e direta
- **Performance**: Carregamento rápido e responsivo

### 1.3 Escopo MVP V2
- ✅ Autenticação simples (email/senha)
- ✅ Gestão de cursos (Admin)
- ✅ Consumo de cursos (Aluno)
- ✅ Comunidade/Fórum básico
- ❌ Pagamentos (Fase 2)
- ❌ Certificados (Fase 2)
- ❌ Analytics avançados (Fase 2)

---

## 2. Stack Tecnológica

### 2.1 Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Routing:** Wouter (simples e leve)
- **State Management:** React Query (TanStack Query)
- **UI Components:** Radix UI + Tailwind CSS
- **Styling:** Tailwind CSS 4 (light mode primeiro)

### 2.2 Backend
- **Runtime:** Node.js + Express
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (apenas para imagens/PDFs)
- **API:** RESTful (Express routes)

### 2.3 Infraestrutura
- **Hosting:** A definir (Vercel/Railway/Replit)
- **CDN:** Supabase Storage CDN
- **Monitoring:** Console logs + Supabase logs

---

## 3. Modelo de Dados

### 3.1 Entidades Principais

#### 3.1.1 Users (Simplificado)
```sql
users (
  id UUID PRIMARY KEY (referencia auth.users.id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'student')) DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Nota:** Apenas 2 roles no MVP V2 (admin e student). Instrutor será adicionado na Fase 2.

#### 3.1.2 Courses
```sql
courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  video_embed_url TEXT, -- YouTube/Vimeo embed URL
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### 3.1.3 Modules
```sql
modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### 3.1.4 Lessons
```sql
lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_embed_url TEXT, -- YouTube/Vimeo embed URL
  description TEXT,
  order INTEGER DEFAULT 0,
  duration INTEGER, -- em minutos (opcional)
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### 3.1.5 Enrollments
```sql
enrollments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
)
```

#### 3.1.6 Lesson Progress
```sql
lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
)
```

#### 3.1.7 Posts (Fórum)
```sql
posts (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### 3.1.8 Comments
```sql
comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### 3.2 Relacionamentos
- User → Enrollment → Course (N:N)
- Course → Module → Lesson (1:N:N)
- User → Lesson Progress → Lesson (N:N)
- Course → Post → Comment (1:N:N)

---

## 4. Funcionalidades MVP V2

### 4.1 Autenticação e Autorização

#### RF001: Registro de Usuário
- **Como:** Usuário não autenticado
- **Quero:** Criar uma conta com email e senha
- **Para:** Acessar a plataforma
- **Critérios de Aceite:**
  - Formulário com email e senha
  - Validação de email válido
  - Senha mínima de 8 caracteres
  - Mensagem de erro clara em caso de falha
  - Redirecionamento para login após registro

#### RF002: Login
- **Como:** Usuário registrado
- **Quero:** Fazer login com email e senha
- **Para:** Acessar minha conta
- **Critérios de Aceite:**
  - Formulário de login simples
  - Validação de credenciais
  - Manter sessão ativa
  - Redirecionamento para dashboard após login

#### RF003: Logout
- **Como:** Usuário autenticado
- **Quero:** Fazer logout
- **Para:** Encerrar minha sessão
- **Critérios de Aceite:**
  - Botão de logout visível
  - Limpar sessão
  - Redirecionar para login

#### RF004: Controle de Acesso
- **Como:** Sistema
- **Quero:** Controlar acesso por role
- **Para:** Garantir segurança
- **Critérios de Aceite:**
  - Rotas protegidas por autenticação
  - Rotas admin protegidas por role
  - Redirecionamento automático se não autorizado

### 4.2 Gestão de Cursos (Admin)

#### RF005: Criar Curso
- **Como:** Admin
- **Quero:** Criar um novo curso
- **Para:** Disponibilizar conteúdo
- **Critérios de Aceite:**
  - Formulário com título, descrição
  - Upload de imagem de capa (opcional)
  - Campo para URL de vídeo embed (YouTube/Vimeo)
  - Salvar e redirecionar para edição

#### RF006: Editar Curso
- **Como:** Admin
- **Quero:** Editar informações do curso
- **Para:** Atualizar conteúdo
- **Critérios de Aceite:**
  - Formulário pré-preenchido
  - Atualizar dados
  - Validação de campos obrigatórios

#### RF007: Deletar Curso
- **Como:** Admin
- **Quero:** Deletar um curso
- **Para:** Remover conteúdo obsoleto
- **Critérios de Aceite:**
  - Confirmação antes de deletar
  - Deletar em cascata (módulos, aulas, posts)
  - Feedback visual de sucesso

#### RF008: Criar Módulo
- **Como:** Admin
- **Quero:** Adicionar módulos ao curso
- **Para:** Organizar conteúdo
- **Critérios de Aceite:**
  - Formulário simples (título)
  - Ordenação automática
  - Lista de módulos visível

#### RF009: Criar Aula
- **Como:** Admin
- **Quero:** Adicionar aulas aos módulos
- **Para:** Disponibilizar conteúdo
- **Critérios de Aceite:**
  - Formulário com título, descrição
  - Campo para URL de vídeo embed
  - Duração opcional
  - Ordenação dentro do módulo

### 4.3 Consumo de Cursos (Aluno)

#### RF010: Listar Cursos Disponíveis
- **Como:** Aluno
- **Quero:** Ver todos os cursos disponíveis
- **Para:** Escolher em qual me inscrever
- **Critérios de Aceite:**
  - Grid de cards com cursos
  - Imagem de capa, título, descrição
  - Botão "Inscrever-se"
  - Indicador se já está inscrito

#### RF011: Inscrever-se em Curso
- **Como:** Aluno
- **Quero:** Me inscrever em um curso
- **Para:** Ter acesso ao conteúdo
- **Critérios de Aceite:**
  - Um clique para inscrever
  - Feedback visual imediato
  - Redirecionar para o curso

#### RF012: Visualizar Curso
- **Como:** Aluno inscrito
- **Quero:** Ver o conteúdo do curso
- **Para:** Estudar
- **Critérios de Aceite:**
  - Sidebar com módulos e aulas
  - Player de vídeo (embed)
  - Indicador de progresso
  - Marcar aula como concluída

#### RF013: Marcar Aula como Concluída
- **Como:** Aluno
- **Quero:** Marcar aula como concluída
- **Para:** Acompanhar meu progresso
- **Critérios de Aceite:**
  - Botão "Marcar como concluída"
  - Atualização visual imediata
  - Cálculo de progresso do curso

#### RF014: Ver Progresso
- **Como:** Aluno
- **Quero:** Ver meu progresso nos cursos
- **Para:** Acompanhar aprendizado
- **Critérios de Aceite:**
  - Barra de progresso por curso
  - Percentual de conclusão
  - Lista de cursos com progresso

### 4.4 Comunidade/Fórum

#### RF015: Ver Posts do Curso
- **Como:** Aluno/Admin
- **Quero:** Ver posts do fórum do curso
- **Para:** Participar de discussões
- **Critérios de Aceite:**
  - Lista de posts ordenados por data
  - Posts fixados no topo
  - Informações do autor
  - Contador de comentários

#### RF016: Criar Post
- **Como:** Aluno inscrito
- **Quero:** Criar um post no fórum
- **Para:** Fazer perguntas ou compartilhar
- **Critérios de Aceite:**
  - Formulário com título e conteúdo
  - Validação de campos
  - Post aparece imediatamente na lista

#### RF017: Comentar em Post
- **Como:** Aluno inscrito
- **Quero:** Comentar em um post
- **Para:** Participar da discussão
- **Critérios de Aceite:**
  - Campo de comentário abaixo do post
  - Comentários ordenados por data
  - Informações do autor

#### RF018: Fixar Post (Admin)
- **Como:** Admin
- **Quero:** Fixar um post importante
- **Para:** Destacar informações
- **Critérios de Aceite:**
  - Botão "Fixar" visível apenas para admin
  - Post fixado aparece no topo
  - Indicador visual de post fixado

### 4.5 Dashboard

#### RF019: Dashboard do Aluno
- **Como:** Aluno
- **Quero:** Ver meu dashboard
- **Para:** Acompanhar meus cursos
- **Critérios de Aceite:**
  - Cursos em andamento (com progresso)
  - Cursos disponíveis para inscrever
  - Estatísticas básicas (cursos inscritos, aulas concluídas)

#### RF020: Dashboard do Admin
- **Como:** Admin
- **Quero:** Ver dashboard administrativo
- **Para:** Gerenciar a plataforma
- **Critérios de Aceite:**
  - Estatísticas (total de cursos, alunos, posts)
  - Ações rápidas (criar curso, ver cursos)
  - Lista de cursos recentes

---

## 5. User Stories Priorizadas

### 5.1 Must Have (MVP V2)

1. **Como** usuário, **quero** me registrar e fazer login **para** acessar a plataforma
2. **Como** admin, **quero** criar cursos com módulos e aulas **para** disponibilizar conteúdo
3. **Como** aluno, **quero** ver cursos disponíveis **para** escolher em qual me inscrever
4. **Como** aluno, **quero** me inscrever em cursos **para** ter acesso ao conteúdo
5. **Como** aluno, **quero** assistir aulas **para** aprender
6. **Como** aluno, **quero** marcar aulas como concluídas **para** acompanhar progresso
7. **Como** aluno, **quero** criar posts no fórum **para** fazer perguntas
8. **Como** aluno, **quero** comentar em posts **para** participar de discussões
9. **Como** admin, **quero** ver dashboard com estatísticas **para** gerenciar a plataforma

### 5.2 Nice to Have (Fase 2)

10. **Como** aluno, **quero** buscar cursos **para** encontrar conteúdo específico
11. **Como** admin, **quero** editar/deletar posts **para** moderar o fórum
12. **Como** aluno, **quero** ver certificado de conclusão **para** comprovar aprendizado
13. **Como** admin, **quero** ver analytics detalhados **para** entender engajamento

---

## 6. Design e UX

### 6.1 Princípios de Design
- **Light mode primeiro**: Interface clara e limpa
- **Espaçamento generoso**: Respiração visual
- **Tipografia clara**: Hierarquia bem definida
- **Cores sutis**: Paleta profissional
- **Feedback visual**: Estados claros (hover, active, loading)

### 6.2 Componentes Base
- **Botões**: Primário, secundário, ghost
- **Inputs**: Texto, textarea, select
- **Cards**: Para cursos, posts, estatísticas
- **Modais**: Para confirmações e formulários
- **Sidebar**: Navegação fixa
- **Topbar**: Busca e perfil

### 6.3 Responsividade
- **Desktop**: Layout completo (sidebar + conteúdo)
- **Tablet**: Sidebar colapsável
- **Mobile**: Menu hambúrguer

---

## 7. Critérios de Aceite Gerais

### 7.1 Performance
- ✅ Carregamento inicial < 2s
- ✅ Navegação entre páginas < 500ms
- ✅ Imagens otimizadas (lazy loading)

### 7.2 Acessibilidade
- ✅ Contraste adequado (WCAG AA)
- ✅ Navegação por teclado
- ✅ Labels descritivos
- ✅ Alt text em imagens

### 7.3 Segurança
- ✅ Autenticação segura (Supabase Auth)
- ✅ RLS habilitado em todas as tabelas
- ✅ Validação de inputs (frontend + backend)
- ✅ Sanitização de dados

### 7.4 Qualidade de Código
- ✅ TypeScript strict mode
- ✅ Componentes reutilizáveis
- ✅ Código limpo e documentado
- ✅ Tratamento de erros robusto

---

## 8. Roadmap

### Fase 1: MVP V2 (Atual)
- Autenticação
- CRUD de cursos (admin)
- Consumo de cursos (aluno)
- Fórum básico
- Dashboard

### Fase 2: Melhorias
- Busca e filtros
- Certificados
- Analytics básicos
- Notificações

### Fase 3: Expansão
- Role de Instrutor
- Pagamentos
- Cursos pagos
- Assinaturas

---

## 9. Métricas de Sucesso

### 9.1 Técnicas
- Zero bugs críticos
- 100% de uptime
- Tempo de resposta < 200ms (API)

### 9.2 Negócio
- Taxa de conversão (visitante → registro) > 20%
- Taxa de inscrição em cursos > 50%
- Engajamento no fórum (posts por curso) > 5

---

## 10. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Bugs na autenticação | Alto | Testes rigorosos + Supabase Auth |
| Performance ruim | Médio | Otimização de queries + cache |
| UX confusa | Médio | Wireframes detalhados + testes de usuário |
| Escalabilidade | Baixo | Arquitetura preparada para crescimento |

---

**Documento criado em:** Dezembro 2024  
**Última atualização:** Dezembro 2024  
**Versão:** 2.0

