# Guia de Deploy na Vercel

## Deploy Automático com GitHub Actions

O projeto está configurado com CI/CD automático que faz deploy na Vercel sempre que houver um commit na branch `main` ou `master`.

### Configuração Inicial

#### Opção 1: Integração Nativa Vercel + GitHub (Recomendado - Mais Simples)

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Vá em **Settings** > **Git** do seu projeto
3. Conecte seu repositório GitHub
4. Configure:
   - **Production Branch**: `main` ou `master`
   - **Build Command**: `npm run build:client`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm ci`
5. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

A Vercel fará deploy automático a cada push na branch de produção.

#### Opção 2: GitHub Actions com Vercel CLI

Se preferir usar GitHub Actions diretamente:

1. Obtenha suas credenciais da Vercel:
   ```bash
   # Instale a Vercel CLI localmente
   npm i -g vercel
   
   # Faça login
   vercel login
   
   # Link seu projeto
   vercel link
   ```

2. Configure os secrets no GitHub:
   - Vá em **Settings** > **Secrets and variables** > **Actions** do seu repositório
   - Adicione os seguintes secrets:
     - `VERCEL_TOKEN`: Obtenha em [Vercel Tokens](https://vercel.com/account/tokens)
     - `VERCEL_ORG_ID`: Encontre no arquivo `.vercel/project.json` após `vercel link`
     - `VERCEL_PROJECT_ID`: Encontre no arquivo `.vercel/project.json` após `vercel link`
     - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
     - `VITE_SUPABASE_ANON_KEY`: Chave anon do Supabase

3. O workflow `.github/workflows/deploy.yml` fará deploy automático a cada commit.

### Workflows Disponíveis

- **`.github/workflows/deploy.yml`**: Deploy completo na Vercel (requer secrets configurados)
- **`.github/workflows/ci.yml`**: CI básico com build e testes (não requer secrets)

## Problema: Subdomínios não funcionam

Quando você tenta acessar URLs como `ponto-zero.vercel.app` ou `teste.vercel.app`, a Vercel retorna erro 404 porque está tentando criar subdomínios separados ao invés de rotear para a aplicação principal.

## Por que isso acontece?

A Vercel trata cada subdomínio como um projeto separado. Quando você acessa `ponto-zero.vercel.app`, ela procura por um projeto chamado "ponto-zero", não encontra, e retorna 404.

## Solução

### Opção 1: Usar apenas o domínio principal (Recomendado)

Use apenas o domínio padrão gerado pela Vercel (ex: `skool-xyz123.vercel.app`) e acesse as comunidades através de rotas:

- `https://seu-projeto.vercel.app/` - Dashboard principal
- `https://seu-projeto.vercel.app/community` - Comunidade atual
- `https://seu-projeto.vercel.app/admin/communities` - Gerenciar comunidades

### Opção 2: Configurar domínio customizado

Se você tem um domínio próprio (ex: `skool.com`):

1. Vá em **Settings** > **Domains** no painel da Vercel
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções da Vercel
4. Todas as rotas funcionarão normalmente no seu domínio

### Opção 3: Usar Wildcard Domain (Avançado)

Se você realmente precisa de subdomínios dinâmicos (ex: `ponto-zero.skool.com`):

1. Configure um domínio wildcard (`*.skool.com`) na Vercel
2. Isso requer configurar nameservers da Vercel no seu provedor de DNS
3. Implemente lógica no código para detectar o subdomínio e rotear adequadamente

**Nota**: A aplicação atual não tem roteamento por subdomínio implementado. Se você precisar dessa funcionalidade, será necessário adicionar código para detectar o subdomínio e selecionar a comunidade correspondente.

## Configuração Atual

O `vercel.json` está configurado para:
- Build do cliente React
- Rewrites para SPA (todas as rotas vão para `/index.html`)
- Headers de segurança
- Clean URLs (sem trailing slash)

## Variáveis de Ambiente Necessárias

Configure estas variáveis no painel da Vercel:

- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anon do Supabase

## Testando o Deploy

Após fazer o deploy:

1. Acesse o domínio principal da Vercel
2. Verifique se todas as rotas funcionam (`/`, `/courses`, `/community`, etc.)
3. Teste navegação entre páginas
4. Verifique se o login funciona corretamente

## Status do Deploy

O projeto está em produção em: **https://skool-sable.vercel.app/**

Cada commit na branch `main` ou `master` acionará automaticamente um novo deploy.

