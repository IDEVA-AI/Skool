# PRD - S-K-O-O-L MVP
## Product Requirements Document - Versão MVP (Essencial)

**⚠️ NOTA IMPORTANTE**: Esta versão MVP **NÃO inclui pagamentos**. Todos os cursos são gratuitos. O sistema de pagamentos será implementado na próxima etapa após o lançamento do MVP.

---

## 1. Visão Geral do Produto

### 1.1 Nome do Produto
**S-K-O-O-L** - Plataforma de Gestão de Conteúdo e Comunidade para Cursos

### 1.2 Objetivo MVP
Lançar uma versão mínima funcional que permita:
- Criadores publicarem cursos gratuitos
- Alunos se inscreverem e acessarem cursos
- Comunidade básica de discussão
- Anúncios simples
- **Nota**: Pagamentos serão implementados na próxima etapa

### 1.3 Público-Alvo MVP
- Criadores de conteúdo e instrutores
- Alunos interessados em cursos online

---

## 2. Escopo MVP (Apenas Essencial)

### 2.1 Funcionalidades MVP

#### 2.1.1 Gestão de Conteúdo (Básico)
- ✅ Criação e edição de cursos
- ✅ Organização em módulos e aulas
- ✅ Upload de vídeos e PDFs
- ✅ Sistema básico de progresso
- ❌ Certificados (Fase 2)

#### 2.1.2 Comunidade (Básico)
- ✅ Fórum simples por curso
- ✅ Criação de posts e comentários
- ❌ Chat em tempo real (Fase 2)
- ❌ Grupos avançados (Fase 2)

#### 2.1.3 Sistema de Acesso (Essencial)
- ✅ Cursos gratuitos (todos os cursos são gratuitos no MVP)
- ✅ Controle de acesso por curso (inscrição necessária)
- ✅ Roles básicos (Aluno, Instrutor, Admin)
- ✅ Inscrição em cursos (enrollment)
- ❌ Cursos pagos (Próxima Etapa - Pagamentos)
- ❌ Assinaturas recorrentes (Fase 2)
- ❌ Códigos promocionais (Fase 2)

#### 2.1.5 Anúncios (Simples)
- ✅ Criação de anúncios (texto e imagem)
- ✅ Exibição na plataforma
- ❌ Segmentação avançada (Fase 2)
- ❌ Agendamento (Fase 2)
- ❌ Analytics detalhados (Fase 2)

---

## 3. Requisitos Funcionais MVP

### 3.1 Autenticação e Autorização (Essencial)
- **RF001**: Registro e login com email/senha
- **RF002**: Recuperação de senha básica
- **RF003**: Controle de acesso por roles (Admin, Instrutor, Aluno)
- **RF004**: Sessões com JWT
- ❌ OAuth (Fase 2)
- ❌ Verificação de email obrigatória (Fase 2)

### 3.2 Gestão de Usuários (Mínimo)
- **RF005**: Perfil básico (nome, email, foto)
- **RF006**: Edição de perfil
- **RF007**: Lista de cursos do aluno
- ❌ Histórico detalhado (Fase 2)
- ❌ Notificações avançadas (Fase 2)

### 3.3 Gestão de Cursos (Essencial)
- **RF008**: Criar, editar e deletar cursos
- **RF009**: Criar módulos e aulas
- **RF010**: Upload de vídeos e arquivos
- **RF011**: Organização curso > módulo > aula
- **RF012**: Preview básico do curso (descrição, conteúdo)
- **RF013**: Marcar aula como concluída
- ❌ Avaliações e reviews (Fase 2)
- ❌ Certificados (Fase 2)
- ❌ Cursos pagos (Próxima Etapa - Pagamentos)

### 3.4 Sistema de Acesso (Básico)
- **RF014**: Todos os cursos são gratuitos no MVP
- **RF015**: Validar inscrição antes de visualizar conteúdo
- **RF016**: Controle por role (instrutor pode editar seus cursos)
- **RF017**: Aluno pode se inscrever em cursos gratuitos
- ❌ Cursos pagos (Próxima Etapa - Pagamentos)
- ❌ Códigos promocionais (Fase 2)
- ❌ Acesso por tempo limitado (Fase 2)

### 3.5 Comunidade (Básico)
- **RF018**: Fórum por curso
- **RF019**: Criar posts no fórum
- **RF020**: Comentar em posts
- **RF021**: Visualizar posts e comentários
- ❌ Likes/reactions (Fase 2)
- ❌ Chat em tempo real (Fase 2)
- ❌ Moderação avançada (Fase 2)

### 3.6 Anúncios (Simples)
- **RF022**: Criar anúncio (título, texto, imagem opcional)
- **RF023**: Exibir anúncios na plataforma
- **RF024**: Editar e deletar anúncios (apenas admin)
- ❌ Segmentação (Fase 2)
- ❌ Agendamento (Fase 2)
- ❌ Analytics (Fase 2)

### 3.7 Analytics (Mínimo)
- **RF025**: Dashboard básico para instrutor (número de alunos inscritos)
- ❌ Relatórios detalhados (Fase 2)
- ❌ Analytics de engajamento (Fase 2)
- ❌ Exportação de dados (Fase 2)
- ❌ Métricas de vendas (Próxima Etapa - Pagamentos)

---

## 4. Requisitos Não Funcionais MVP

### 4.1 Performance (Essencial)
- **RNF001**: Tempo de carregamento < 3 segundos
- **RNF002**: Streaming de vídeo funcional (pode usar serviço externo simples)
- **RNF003**: Cache básico de páginas estáticas

### 4.2 Segurança (Crítico)
- **RNF004**: HTTPS obrigatório
- **RNF005**: Criptografia de senhas (bcrypt)
- **RNF006**: Proteção contra SQL Injection
- **RNF007**: Proteção básica contra XSS
- **RNF008**: Validação de inputs

### 4.3 Escalabilidade (Mínimo)
- **RNF009**: Suporte para 100-500 usuários simultâneos
- **RNF010**: Banco de dados relacional obrigatório (SQLite para dev, PostgreSQL para produção)

### 4.4 Usabilidade (Essencial)
- **RNF011**: Interface responsiva (mobile-friendly)
- **RNF012**: Design limpo e intuitivo
- **RNF013**: Navegação clara

### 4.5 Compatibilidade (Básico)
- **RNF014**: Navegadores modernos (Chrome, Firefox, Safari)
- ❌ App mobile nativo (Fase 2)
- ❌ PWA completo (Fase 2)

---

## 5. Arquitetura Técnica MVP

### 5.1 Stack Tecnológico Mínimo
- **Frontend**: React/Next.js (ou Vue.js)
- **Backend**: Node.js/Express (ou Python/Django)
- **Banco de Dados**: **SIM, OBRIGATÓRIO** (ver opções abaixo)
- **Autenticação**: JWT
- **Armazenamento**: AWS S3 ou serviço similar
- **Streaming**: Vimeo API ou YouTube (simples) OU serviço básico de streaming
- **Pagamentos**: ❌ Não incluído no MVP (Próxima Etapa)

### 5.2 Banco de Dados - OBRIGATÓRIO

**Por que precisa de banco de dados?**
- Armazenar usuários e autenticação
- Persistir cursos, módulos e aulas
- Guardar inscrições de alunos em cursos
- Armazenar posts e comentários do fórum
- Salvar anúncios e configurações

**Opções para MVP (do mais simples ao mais robusto):**

#### Opção 1: SQLite (Desenvolvimento/Prototipagem)
- ✅ Zero configuração
- ✅ Arquivo único, fácil de fazer backup
- ✅ Perfeito para desenvolvimento local
- ✅ Gratuito
- ⚠️ Limitações em produção (concorrência)
- **Recomendado para**: Prototipagem rápida e testes iniciais

#### Opção 2: PostgreSQL (Recomendado para MVP)
- ✅ Robusto e escalável
- ✅ Open source e gratuito
- ✅ Suporta relacionamentos complexos
- ✅ Boa performance
- ⚠️ Requer servidor/configuração
- **Recomendado para**: MVP em produção

#### Opção 3: Serviços Gerenciados (Mais fácil)
- **Supabase**: PostgreSQL gerenciado + autenticação + storage
- **Railway**: PostgreSQL com deploy fácil
- **PlanetScale**: MySQL gerenciado
- ✅ Sem configuração de servidor
- ✅ Backup automático
- ✅ Escalável
- ⚠️ Pode ter custos após free tier

**Recomendação MVP:**
1. **Desenvolvimento**: SQLite (rápido para começar)
2. **Produção**: PostgreSQL (Supabase ou Railway para facilitar)

### 5.3 Componentes MVP
- API RESTful básica
- Serviço de autenticação
- Serviço de upload de arquivos
- Sistema de fórum básico
- Sistema de inscrições em cursos
- **Banco de dados relacional** (obrigatório)
- ❌ Serviço de pagamentos (Próxima Etapa)

---

## 6. Integrações MVP

### 6.1 Integrações Externas
- **Streaming de vídeo**: Vimeo API ou YouTube (para hospedar vídeos)
- **Armazenamento de arquivos**: AWS S3 ou Cloudflare R2 (para PDFs, imagens)

### 6.2 Pagamentos (Próxima Etapa)
**Não incluído no MVP. Será implementado na próxima etapa:**
- Integração com Stripe OU Abacaty
- Checkout seguro
- Processamento de pagamentos
- Histórico de transações

---

## 7. Modelo de Dados MVP (Simplificado)

**⚠️ IMPORTANTE**: Este modelo de dados **REQUER** um banco de dados relacional. Não é possível implementar o MVP sem persistência de dados.

### 7.1 Entidades Essenciais
- **User**: id, name, email, password, role, avatar_url, created_at
- **Course**: id, title, description, instructor_id, created_at
- **Module**: id, title, course_id, order
- **Lesson**: id, title, content_url, module_id, order, duration
- **Enrollment**: id, user_id, course_id, enrolled_at
- **Post**: id, title, content, user_id, course_id, created_at
- **Comment**: id, content, user_id, post_id, created_at
- **Announcement**: id, title, content, image_url, created_by, created_at, is_active

**Nota**: Entidade `Payment` será adicionada na próxima etapa quando pagamentos forem implementados.

### 7.2 Relacionamentos MVP
- User → Enrollment → Course (N:N) - Aluno se inscreve em cursos
- Course → Module → Lesson (1:N) - Curso contém módulos que contêm aulas
- User → Post → Course (1:N) - Usuário cria posts em cursos
- Post → Comment (1:N) - Post tem múltiplos comentários

---

## 8. User Stories MVP (Priorizadas)

### 8.1 MVP Essencial (Must Have)
1. **Como** usuário, **quero** me registrar e fazer login **para** acessar a plataforma
2. **Como** instrutor, **quero** criar um curso com módulos e aulas **para** organizar meu conteúdo
3. **Como** aluno, **quero** visualizar cursos disponíveis **para** escolher em qual me inscrever
4. **Como** aluno, **quero** me inscrever em um curso gratuito **para** ter acesso ao conteúdo
5. **Como** aluno, **quero** assistir aulas do curso **para** aprender
6. **Como** aluno, **quero** marcar aulas como concluídas **para** acompanhar meu progresso
7. **Como** aluno, **quero** criar posts no fórum do curso **para** fazer perguntas
8. **Como** aluno, **quero** comentar em posts **para** interagir com outros alunos
9. **Como** admin, **quero** criar anúncios **para** comunicar com a comunidade
10. **Como** instrutor, **quero** ver quantos alunos se inscreveram no meu curso **para** acompanhar engajamento

---

## 9. Métricas de Sucesso MVP

### 9.1 Métricas Mínimas
- Taxa de conversão (visitante → registro)
- Taxa de inscrição em cursos (alunos registrados → inscritos em cursos)
- Número de cursos criados
- Número de alunos ativos
- Número de posts no fórum
- Taxa de conclusão de aulas

---

## 10. Riscos MVP e Mitigações

### 10.1 Riscos Técnicos MVP
- **Risco**: Streaming de vídeo
  - **Mitigação**: Usar serviço externo (Vimeo, YouTube) ou solução simples inicialmente

- **Risco**: Escalabilidade do banco de dados
  - **Mitigação**: Começar com SQLite para dev, migrar para PostgreSQL quando necessário

### 10.2 Riscos de Negócio MVP
- **Risco**: MVP muito simples não atrair usuários
  - **Mitigação**: Focar em UX excelente nas funcionalidades básicas

---

## 11. Roadmap MVP

### 11.1 Fase MVP (2-3 meses)
**Sprint 1-2 (4 semanas):**
- Setup do projeto
- Autenticação e autorização
- CRUD básico de cursos
- Sistema de inscrições (enrollment)

**Sprint 3-4 (4 semanas):**
- Controle de acesso (validar inscrição)
- Visualização de conteúdo
- Sistema de progresso (marcar aulas concluídas)

**Sprint 5-6 (4 semanas):**
- Fórum básico
- Anúncios simples
- Dashboard básico para instrutor
- Testes e ajustes

**Próxima Etapa (após MVP):**
- Sistema de pagamentos (Stripe ou Abacaty)
- Cursos pagos
- Checkout e processamento de pagamentos

---

## 12. O Que Fica de Fora do MVP

### 12.1 Funcionalidades Excluídas do MVP (Para Próximas Etapas)
- ❌ **Pagamentos** (Próxima Etapa - será implementado depois)
- ❌ Cursos pagos
- ❌ Chat em tempo real
- ❌ Assinaturas recorrentes
- ❌ Certificados
- ❌ Sistema de avaliações/reviews
- ❌ Códigos promocionais
- ❌ Moderação avançada
- ❌ Analytics detalhados
- ❌ OAuth (login social)
- ❌ App mobile nativo
- ❌ Multi-idioma

---

## 13. Definições MVP

- **MVP**: Minimum Viable Product - versão mínima funcional do produto
- **JWT**: JSON Web Token - método de autenticação
- **CRUD**: Create, Read, Update, Delete - operações básicas
- **API**: Application Programming Interface
- **Webhook**: Callback HTTP para notificações de eventos externos

---

## 14. Critérios de Sucesso do MVP

### 14.1 Definição de "Pronto"
O MVP está pronto quando:
- ✅ Usuários conseguem se registrar e fazer login
- ✅ Instrutores conseguem criar e publicar cursos gratuitos
- ✅ Alunos conseguem se inscrever em cursos gratuitos
- ✅ Alunos conseguem assistir aulas dos cursos em que estão inscritos
- ✅ Alunos conseguem marcar progresso (aulas concluídas)
- ✅ Alunos conseguem participar do fórum (criar posts e comentar)
- ✅ Admins conseguem criar anúncios
- ✅ Instrutores conseguem ver número de alunos inscritos
- ✅ Sistema funciona em dispositivos móveis (responsivo)

---

## 15. Próximos Passos Após MVP

### 15.1 Próxima Etapa Principal
1. **Implementar Sistema de Pagamentos**
   - Escolher integração (Stripe ou Abacaty)
   - Implementar checkout seguro
   - Adicionar cursos pagos
   - Processar pagamentos únicos
   - Histórico de transações

### 15.2 Outras Melhorias Futuras
2. Coletar feedback dos primeiros usuários
3. Analisar métricas de uso
4. Implementar certificados
5. Adicionar sistema de avaliações/reviews
6. Melhorar analytics e relatórios
7. Implementar chat em tempo real

---

**Versão do Documento**: MVP 1.0  
**Data de Criação**: [Data atual]  
**Última Atualização**: [Data atual]  
**Autor**: [Nome]

**Nota**: Este é o PRD MVP focado apenas no essencial. Para funcionalidades completas, consulte o PRD.md principal.

