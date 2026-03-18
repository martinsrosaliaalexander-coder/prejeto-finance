# Opervio Finance Lite

Sistema financeiro web pronto para deploy com **Next.js + Supabase + Vercel**.

## O que já está pronto

- autenticação real com Supabase Auth
- cadastro de usuário por e-mail e senha
- CRUD de lançamentos financeiros
- dashboard com indicadores
- gráfico de evolução mensal
- gráfico de despesas por categoria
- ranking de clientes por receita
- filtros por texto, tipo e mês
- exportação JSON
- geração de relatório PDF
- layout premium responsivo

## Stack

- Next.js 15
- React 19
- Tailwind CSS
- Supabase Auth + Postgres
- Recharts
- jsPDF

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Configuração do Supabase

1. Crie um projeto no Supabase.
2. Copie a URL do projeto e a anon key para `.env.local`.
3. Abra o SQL Editor do Supabase.
4. Execute o arquivo `supabase/schema.sql`.
5. Em Authentication > Providers, mantenha Email habilitado.
6. Para uso simples, em Authentication > Email, você pode desativar a confirmação por e-mail durante os testes.

## Deploy na Vercel

1. Suba esta pasta para um repositório GitHub.
2. Importe o repositório na Vercel.
3. Em Project Settings > Environment Variables, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Faça o deploy.

## Estrutura principal

- `app/page.tsx` → aplicação principal
- `supabase/schema.sql` → tabela + políticas RLS
- `.env.example` → variáveis de ambiente

## Observação importante

Esta versão já está pronta para funcionar online com Supabase + Vercel. O próximo passo natural é criar a **landing page comercial do produto** e depois evoluir para:

- multiempresa
- planos por assinatura
- centro de custos
- anexos
- edição de lançamentos
- contas a pagar e receber separadas
