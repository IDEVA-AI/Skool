# Testes de Persistência - S-K-O-O-L

Este diretório contém toda a documentação e scripts para testes de persistência do sistema.

## Estrutura

```
tests/persistence/
├── README.md                    # Este arquivo
├── checklist.md                 # Checklist executável para testes manuais
├── RLS_TESTS.md                # Testes específicos de políticas RLS
├── sql/                        # Scripts SQL de validação
│   ├── verify_posts.sql
│   ├── verify_comments.sql
│   ├── verify_courses.sql
│   └── verify_integrity.sql
└── scenarios/                  # Cenários de teste detalhados
    ├── posts.md
    ├── comments.md
    └── courses.md
```

## Documentação Principal

- **[docs/TESTES_PERSISTENCIA.md](../../docs/TESTES_PERSISTENCIA.md)** - Documento principal com especificações completas de todos os testes

## Como Usar

### 1. Para Testes Manuais Sistemáticos

Use o **[checklist.md](./checklist.md)** para executar testes de forma organizada:

1. Abra o checklist
2. Execute cada teste na ordem
3. Marque como concluído após validar
4. Anote problemas encontrados

### 2. Para Validação SQL

Execute os scripts SQL no Supabase SQL Editor:

- `sql/verify_posts.sql` - Valida integridade de posts
- `sql/verify_comments.sql` - Valida integridade de comentários
- `sql/verify_courses.sql` - Valida integridade de cursos
- `sql/verify_integrity.sql` - Valida integridade geral do banco

### 3. Para Cenários Detalhados

Consulte os arquivos em `scenarios/` para testes passo a passo:

- `scenarios/posts.md` - Cenários completos para posts
- `scenarios/comments.md` - Cenários completos para comentários
- `scenarios/courses.md` - Cenários completos para cursos

### 4. Para Testes RLS

Consulte **[RLS_TESTS.md](./RLS_TESTS.md)** para testes específicos de políticas de segurança:

- Testes de permissões por role
- Testes de acesso negado
- Validação de políticas INSERT/UPDATE/DELETE

## Entidades Testadas

### Alta Prioridade (Core Features)
- ✅ Posts
- ✅ Comments
- ✅ Courses
- ✅ Enrollments
- ✅ Communities

### Média Prioridade
- ✅ Modules
- ✅ Lessons
- ✅ Announcements
- ✅ Saved Posts
- ✅ Notifications

### Baixa Prioridade
- Conversations & Messages
- Course Invites
- Community Invites
- Course Communities
- Course Unlock Pages
- Hotmart Products & Purchases

## Tipos de Testes

### 1. Testes CRUD
- **CREATE**: Verificar criação e persistência
- **READ**: Verificar busca e filtros
- **UPDATE**: Verificar atualização e persistência
- **DELETE**: Verificar deleção e integridade

### 2. Testes de Integridade
- Foreign keys e relacionamentos
- Cascade deletes
- Constraints de unicidade
- Validações de dados

### 3. Testes RLS
- Políticas de segurança por role
- Acesso negado quando apropriado
- Permissões de admin vs usuário regular

## Executando Testes

### Ambiente Recomendado
- Ambiente de desenvolvimento/teste
- Dados de teste isolados
- Backup antes de testes destrutivos

### Ordem Recomendada
1. Executar testes CRUD básicos
2. Executar scripts SQL de validação
3. Executar testes RLS
4. Executar testes de integridade
5. Executar testes de cascade delete

## Reportando Problemas

Ao encontrar problemas durante os testes:

1. Documente no checklist na seção "Observações"
2. Anote o cenário específico que falhou
3. Capture logs de erro do Supabase
4. Documente comportamento esperado vs atual
5. Inclua queries SQL que reproduzem o problema

## Manutenção

Este conjunto de testes deve ser atualizado quando:
- Novas entidades são adicionadas
- Novas operações CRUD são implementadas
- Políticas RLS são modificadas
- Relacionamentos entre entidades mudam

## Recursos Adicionais

- [Documentação Principal](../../docs/TESTES_PERSISTENCIA.md)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)

