$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Configurar Supabase - Liga Nibiru FC" -ForegroundColor Cyan
Write-Host ""

$url = "https://vicuzevkukiffuwxrnsa.supabase.co"

Write-Host "URL do Supabase ja preenchida:" -ForegroundColor Yellow
Write-Host $url
Write-Host ""

$key = Read-Host "Cole aqui a Publishable Key do Supabase, aquela que começa com sb_publishable_"

if ([string]::IsNullOrWhiteSpace($key)) {
    Write-Host "Chave vazia. Operacao cancelada." -ForegroundColor Red
    exit 1
}

if ($key -notlike "sb_publishable_*") {
    Write-Host "Atencao: essa chave nao parece comecar com sb_publishable_." -ForegroundColor Yellow
    $confirm = Read-Host "Deseja continuar mesmo assim? Digite S para sim"
    if ($confirm -ne "S" -and $confirm -ne "s") {
        Write-Host "Operacao cancelada." -ForegroundColor Red
        exit 1
    }
}

@"
VITE_SUPABASE_URL=$url
VITE_SUPABASE_ANON_KEY=$key
"@ | Set-Content ".env" -Encoding UTF8

Write-Host ""
Write-Host ".env criado com sucesso." -ForegroundColor Green
Write-Host "Agora rode:" -ForegroundColor Yellow
Write-Host "npm.cmd install"
Write-Host "npm.cmd run dev"
