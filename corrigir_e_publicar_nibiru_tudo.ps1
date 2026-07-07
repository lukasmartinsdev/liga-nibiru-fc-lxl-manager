param(
    [string]$RepoUrl = "https://github.com/lukasmartinsdev/liga-nibiru-fc-lxl-manager.git",
    [string]$CommitMessage = "Corrige Vite, CSS, imagens e publica versão final"
)

$ErrorActionPreference = "Stop"

function Step($msg) {
    Write-Host ""
    Write-Host ">>> $msg" -ForegroundColor Cyan
}

function Warn($msg) {
    Write-Host "AVISO: $msg" -ForegroundColor Yellow
}

function Fail($msg) {
    Write-Host ""
    Write-Host "ERRO: $msg" -ForegroundColor Red
    exit 1
}

Step "Verificando pasta do projeto"

$required = @("index.html", "style.css", "app.js", "package.json")
foreach ($file in $required) {
    if (!(Test-Path $file)) {
        Fail "Arquivo obrigatório não encontrado: $file. Abra a pasta certa no VS Code antes de rodar."
    }
}

Write-Host "Pasta atual: $(Get-Location)" -ForegroundColor Yellow

Step "Removendo configurações que quebram o build"

Remove-Item postcss.config.js, postcss.config.cjs, postcss.config.mjs, postcss.config.json, .postcssrc, .postcssrc.json, .postcssrc.yml, .postcssrc.yaml -Force -ErrorAction SilentlyContinue
Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .vite -Recurse -Force -ErrorAction SilentlyContinue

Step "Organizando imagens e ícones para Vercel/Vite"

New-Item -ItemType Directory -Force -Path "public" | Out-Null
New-Item -ItemType Directory -Force -Path "public\assets" | Out-Null
New-Item -ItemType Directory -Force -Path "public\icons" | Out-Null

if (Test-Path "assets") {
    Copy-Item "assets\*" "public\assets" -Recurse -Force
}

if (Test-Path "icons") {
    Copy-Item "icons\*" "public\icons" -Recurse -Force
}

Copy-Item "style.css" "public\style.css" -Force

Step "Corrigindo caminhos no HTML, CSS, JS, manifest e service worker"

function Replace-InFile($file) {
    if (!(Test-Path $file)) { return }

    $content = Get-Content $file -Raw -Encoding UTF8

    $content = $content -replace '\./assets/', '/assets/'
    $content = $content -replace '\./icons/', '/icons/'
    $content = $content -replace 'href="\./manifest\.json"', 'href="/manifest.json"'
    $content = $content -replace "href='\./manifest\.json'", "href='/manifest.json'"
    $content = $content -replace 'href="\./icons/', 'href="/icons/'
    $content = $content -replace "href='\./icons/", "href='/icons/"
    $content = $content -replace 'src="\./assets/', 'src="/assets/'
    $content = $content -replace "src='\./assets/", "src='/assets/"
    $content = $content -replace 'register\("\./service-worker\.js"\)', 'register("/service-worker.js")'
    $content = $content -replace "register\('\./service-worker\.js'\)", "register('/service-worker.js')"

    Set-Content $file $content -Encoding UTF8
}

Replace-InFile "index.html"
Replace-InFile "style.css"
Replace-InFile "app.js"
Replace-InFile "manifest.json"
Replace-InFile "service-worker.js"

# Força o HTML a carregar o CSS direto da pasta public no Vite.
$index = Get-Content "index.html" -Raw -Encoding UTF8
if ($index -match '<link rel="stylesheet"[^>]*>') {
    $index = $index -replace '<link rel="stylesheet"[^>]*>', '<link rel="stylesheet" href="/style.css?v=8">'
} else {
    $index = $index -replace '</head>', '  <link rel="stylesheet" href="/style.css?v=8">' + "`n</head>"
}
Set-Content "index.html" $index -Encoding UTF8

# Copia arquivos públicos para o lugar certo do Vite.
if (Test-Path "manifest.json") {
    Copy-Item "manifest.json" "public\manifest.json" -Force
}

if (Test-Path "service-worker.js") {
    Copy-Item "service-worker.js" "public\service-worker.js" -Force
}

Step "Criando configuração correta do Vite"

@"
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  publicDir: 'public'
});
"@ | Set-Content "vite.config.js" -Encoding UTF8

Step "Recriando package.json correto"

node -e "const fs=require('fs'); const pkg={name:'liga-nibiru-fc-lxl-manager',version:'1.0.0',private:true,type:'module',scripts:{dev:'vite --host 0.0.0.0',start:'vite --host 0.0.0.0',build:'vite build',preview:'vite preview --host 0.0.0.0'},dependencies:{vite:'latest'},devDependencies:{}}; fs.writeFileSync('package.json', JSON.stringify(pkg,null,2));"

Step "Limpando gitignore"

@"
node_modules/
dist/
.vite/
.env
.env.local
.DS_Store
Thumbs.db
"@ | Set-Content ".gitignore" -Encoding UTF8

if (!(Test-Path ".nojekyll")) {
    New-Item -ItemType File -Path ".nojekyll" | Out-Null
}

Step "Limpando instalação antiga"

Remove-Item node_modules, package-lock.json -Recurse -Force -ErrorAction SilentlyContinue

Step "Instalando dependências"

npm.cmd install

Step "Testando build"

npm.cmd run build

if ($LASTEXITCODE -ne 0) {
    Fail "Build falhou. Não vou enviar para o GitHub."
}

Step "Build aprovado"

Write-Host "O build funcionou. Agora vou preparar o Git." -ForegroundColor Green

Step "Configurando Git"

if (!(Test-Path ".git")) {
    git init
}

git branch -M main

try {
    git remote get-url origin | Out-Null
    git remote set-url origin $RepoUrl
} catch {
    git remote add origin $RepoUrl
}

Step "Criando commit"

git add -A

$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Warn "Não há alterações para commit."
} else {
    git commit -m $CommitMessage
}

Step "Enviando para o GitHub"

git push -u origin main

Step "Finalizado"

Write-Host ""
Write-Host "Pronto. Agora vá na Vercel > Deployments e espere o deploy ficar verde." -ForegroundColor Green
Write-Host "Depois teste:" -ForegroundColor Yellow
Write-Host "https://liga-nibiru-fc-lxl-manager.vercel.app"
Write-Host ""
Write-Host "Se a Vercel ainda mostrar versão antiga, abra em aba anônima ou limpe cache/service worker." -ForegroundColor Yellow
