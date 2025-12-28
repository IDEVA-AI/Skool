# Configuração de CI/CD - Deploy Automático

Este projeto está configurado com deploy automático na Vercel sempre que houver um commit na branch principal.

## 🚀 Opção 1: Integração Nativa Vercel + GitHub (Recomendado)

Esta é a forma mais simples e recomendada pela Vercel:

### Passos:

1. **Acesse o Dashboard da Vercel**
   - Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecione seu projeto ou crie um novo

2. **Conecte o Repositório GitHub**
   - Vá em **Settings** > **Git**
   - Clique em **Connect Git Repository**
   - Selecione seu repositório GitHub
   - Autorize a Vercel a acessar seu repositório

3. **Configure o Build**
   - **Framework Preset**: Other
   - **Root Directory**: `.` (raiz do projeto)
   - **Build Command**: `npm run build:client`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm ci`

4. **Configure Variáveis de Ambiente**
   - Vá em **Settings** > **Environment Variables**
   - Adicione:
     - `VITE_SUPABASE_URL` (Production, Preview, Development)
     - `VITE_SUPABASE_ANON_KEY` (Production, Preview, Development)

5. **Configure a Branch de Produção**
   - Vá em **Settings** > **Git**
   - Defina **Production Branch** como `main` ou `master`

✅ **Pronto!** Agora cada push na branch `main`/`master` fará deploy automático na produção.

---

## 🔧 Opção 2: GitHub Actions com Vercel CLI

Se preferir ter controle total via GitHub Actions:

### Pré-requisitos:

1. **Instale a Vercel CLI localmente**:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Link seu projeto**:
   ```bash
   vercel link
   ```
   
   Isso criará um arquivo `.vercel/project.json` com suas credenciais.

3. **Obtenha o Vercel Token**:
   - Acesse [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Crie um novo token
   - Copie o token gerado

### Configurar Secrets no GitHub:

1. Vá para seu repositório no GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Adicione os seguintes secrets:

   | Secret | Descrição | Onde encontrar |
   |--------|-----------|----------------|
   | `VERCEL_TOKEN` | Token de autenticação da Vercel | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
   | `VERCEL_ORG_ID` | ID da organização | Arquivo `.vercel/project.json` após `vercel link` |
   | `VERCEL_PROJECT_ID` | ID do projeto | Arquivo `.vercel/project.json` após `vercel link` |
   | `VITE_SUPABASE_URL` | URL do Supabase | Dashboard do Supabase |
   | `VITE_SUPABASE_ANON_KEY` | Chave anon do Supabase | Dashboard do Supabase |

### Como encontrar VERCEL_ORG_ID e VERCEL_PROJECT_ID:

Após executar `vercel link`, você encontrará essas informações no arquivo `.vercel/project.json`:

```json
{
  "orgId": "team_xxxxx",  // Este é o VERCEL_ORG_ID
  "projectId": "prj_xxxxx" // Este é o VERCEL_PROJECT_ID
}
```

⚠️ **Importante**: O arquivo `.vercel/` já está no `.gitignore`, então não será commitado.

---

## 📋 Workflows Disponíveis

### `.github/workflows/deploy.yml`
- **Quando executa**: Push na `main`/`master` ou Pull Requests
- **O que faz**: 
  - Instala dependências
  - Verifica tipos TypeScript
  - Faz build do cliente
  - Deploy na Vercel (produção para main/master, preview para PRs)
- **Requer**: Secrets configurados (Opção 2)

### `.github/workflows/ci.yml`
- **Quando executa**: Push em qualquer branch ou Pull Requests
- **O que faz**:
  - Instala dependências
  - Verifica tipos TypeScript
  - Faz build do cliente
  - Upload dos artefatos de build
- **Requer**: Nenhum secret (apenas validação)

---

## 🧪 Testando o Deploy

1. **Faça um commit na branch `main`**:
   ```bash
   git add .
   git commit -m "test: deploy automático"
   git push origin main
   ```

2. **Verifique o status**:
   - **Opção 1**: Acesse o dashboard da Vercel e veja os deploys
   - **Opção 2**: Vá em **Actions** no GitHub e veja o workflow rodando

3. **Acesse a aplicação**:
   - URL de produção: https://skool-sable.vercel.app/

---

## 🔍 Troubleshooting

### Deploy não está acontecendo automaticamente

1. Verifique se a integração GitHub está conectada na Vercel
2. Verifique se os secrets estão configurados corretamente
3. Verifique os logs em **Actions** no GitHub

### Erro de build

1. Verifique se as variáveis de ambiente estão configuradas
2. Verifique os logs do build na Vercel ou GitHub Actions
3. Teste o build localmente: `npm run build:client`

### Erro de autenticação Vercel

1. Verifique se o `VERCEL_TOKEN` está correto e não expirou
2. Regere o token se necessário em [vercel.com/account/tokens](https://vercel.com/account/tokens)

---

## 📚 Recursos

- [Documentação Vercel - Git Integration](https://vercel.com/docs/concepts/git)
- [Documentação GitHub Actions](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

