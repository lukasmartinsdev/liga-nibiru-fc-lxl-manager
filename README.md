# Liga Nibiru FC | LXL Manager

App web/PWA da Liga Nibiru FC / LXL Manager.

## Versão final

Esta versão está preparada para:

- Vercel
- Supabase
- PC
- Tablet
- Celular
- PWA
- Menu mobile
- Cards no mobile
- Ranking com dados do Supabase
- Jogadores com dados do Supabase
- Partidas LXL com dados do Supabase

## Banco online

Configure na Vercel:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Rodar localmente

```bash
npm install
npm run dev
```

## Deploy

A Vercel faz deploy automático ao dar push no GitHub.

## Login local

```txt
ADM MASTER
ADM123
```

```txt
Lukas
Lukas123
```

## Observação

Jogadores, partidas e ranking usam Supabase.
Login administrativo e configurações visuais ainda ficam locais nesta etapa.


## Configurar Supabase localmente no VS Code

Este pacote já vem com a URL do Supabase preenchida no `.env`:

```txt
VITE_SUPABASE_URL=https://vicuzevkukiffuwxrnsa.supabase.co
```

Falta apenas colocar a sua `Publishable key`.

Jeito fácil:

```powershell
powershell -ExecutionPolicy Bypass -File .\CONFIGURAR_SUPABASE_LOCAL.ps1
```

Depois rode:

```powershell
npm.cmd install
npm.cmd run dev
```

Atenção: não cole a URL do Supabase direto no terminal. URL não é comando.
