# Integração Supabase

Esta versão conecta o app ao Supabase usando as variáveis da Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## O que já usa Supabase

- Jogadores
- Partidas LXL
- Ranking calculado a partir dos jogadores do banco

## O que ainda fica local

- Login administrativo local
- Configurações visuais/imagens personalizadas via navegador
- Upload de imagens por tema

## Observação de segurança

As policies atuais permitem leitura e escrita pública para o app funcionar agora.
Depois é recomendado evoluir para Supabase Auth + RLS mais restrito.
