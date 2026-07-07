$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Corrigindo caminhos de imagens para Vercel/Vite..." -ForegroundColor Cyan
Write-Host "Pasta atual: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

$required = @("index.html", "style.css", "app.js", "package.json")
foreach ($file in $required) {
    if (!(Test-Path $file)) {
        Write-Host "ERRO: arquivo obrigatório não encontrado: $file" -ForegroundColor Red
        Write-Host "Abra a pasta certa do projeto no VS Code antes de rodar." -ForegroundColor Red
        exit 1
    }
}

New-Item -ItemType Directory -Force -Path "public" | Out-Null
New-Item -ItemType Directory -Force -Path "public\assets" | Out-Null
New-Item -ItemType Directory -Force -Path "public\icons" | Out-Null

if (Test-Path "assets") {
    Copy-Item "assets\*" "public\assets" -Recurse -Force
    Remove-Item "assets" -Recurse -Force
}

if (Test-Path "icons") {
    Copy-Item "icons\*" "public\icons" -Recurse -Force
    Remove-Item "icons" -Recurse -Force
}

function Replace-InFile($file) {
    if (!(Test-Path $file)) { return }

    $content = Get-Content $file -Raw -Encoding UTF8

    $content = $content -replace "\./assets/", "/assets/"
    $content = $content -replace "\./icons/", "/icons/"
    $content = $content -replace "url\(`"/assets/", "url(`"/assets/"
    $content = $content -replace "url\('/assets/", "url('/assets/"
    $content = $content -replace "href=`"\./manifest\.json`"", "href=`"/manifest.json`""
    $content = $content -replace "href='\./manifest\.json'", "href='/manifest.json'"
    $content = $content -replace "href=`"\./icons/", "href=`"/icons/"
    $content = $content -replace "href='\./icons/", "href='/icons/"
    $content = $content -replace "src=`"\./assets/", "src=`"/assets/"
    $content = $content -replace "src='\./assets/", "src='/assets/"
    $content = $content -replace "register\(`"\./service-worker\.js`"\)", "register(`"/service-worker.js`")"
    $content = $content -replace "register\('\./service-worker\.js'\)", "register('/service-worker.js')"

    Set-Content $file $content -Encoding UTF8
}

Replace-InFile "index.html"
Replace-InFile "style.css"
Replace-InFile "app.js"
Replace-InFile "manifest.json"
Replace-InFile "service-worker.js"

if (Test-Path "manifest.json") {
    Copy-Item "manifest.json" "public\manifest.json" -Force
}

if (Test-Path "service-worker.js") {
    Copy-Item "service-worker.js" "public\service-worker.js" -Force
}

@"
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  publicDir: 'public'
});
"@ | Set-Content "vite.config.js" -Encoding UTF8

if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
    if (-not $pkg.scripts) {
        $pkg | Add-Member -MemberType NoteProperty -Name scripts -Value @{}
    }
    $pkg.scripts.dev = "vite --host 0.0.0.0"
    $pkg.scripts.start = "vite --host 0.0.0.0"
    $pkg.scripts.build = "vite build"
    $pkg.scripts.preview = "vite preview --host 0.0.0.0"
    if (-not $pkg.dependencies) {
        $pkg | Add-Member -MemberType NoteProperty -Name dependencies -Value @{}
    }
    $pkg.dependencies.vite = "latest"
    $pkg.private = $true
    $pkg.type = "module"
    $pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8
}

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

Write-Host ""
Write-Host "Correção concluída." -ForegroundColor Green
Write-Host ""
Write-Host "Agora rode para testar:" -ForegroundColor Yellow
Write-Host "npm.cmd run build"
Write-Host "npm.cmd run dev"
Write-Host ""
Write-Host "Se estiver certo, suba para o GitHub:" -ForegroundColor Yellow
Write-Host "git add -A"
Write-Host 'git commit -m "Corrige assets para deploy na Vercel"'
Write-Host "git push"
Write-Host ""
