
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Correção universal do topo mobile - iPhone e Android" -ForegroundColor Cyan
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

Write-Host "1/4 Ajustando index.html para iPhone/Android..." -ForegroundColor Cyan

$index = Get-Content "index.html" -Raw -Encoding UTF8

if ($index -match '<meta name="viewport"[^>]*>') {
    $index = $index -replace '<meta name="viewport"[^>]*>', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
} else {
    $index = $index -replace '</head>', '  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' + "`n</head>"
}

if ($index -match '<meta name="apple-mobile-web-app-status-bar-style"[^>]*>') {
    $index = $index -replace '<meta name="apple-mobile-web-app-status-bar-style"[^>]*>', '<meta name="apple-mobile-web-app-status-bar-style" content="black">'
} else {
    $index = $index -replace '</head>', '  <meta name="apple-mobile-web-app-status-bar-style" content="black">' + "`n</head>"
}

if ($index -match '<link rel="stylesheet"[^>]*>') {
    $index = $index -replace '<link rel="stylesheet"[^>]*>', '<link rel="stylesheet" href="/style.css?v=10">'
} else {
    $index = $index -replace '</head>', '  <link rel="stylesheet" href="/style.css?v=10">' + "`n</head>"
}

Set-Content "index.html" $index -Encoding UTF8

Write-Host "2/4 Aplicando CSS de correção mobile..." -ForegroundColor Cyan

$cssPath = "style.css"
$css = Get-Content $cssPath -Raw -Encoding UTF8

$start = "/* === FIX MOBILE HEADER IOS ANDROID V10 START === */"
$end = "/* === FIX MOBILE HEADER IOS ANDROID V10 END === */"
$pattern = [regex]::Escape($start) + "(.|\s)*?" + [regex]::Escape($end)
$css = [regex]::Replace($css, $pattern, "")

$fix = @'
/* === FIX MOBILE HEADER IOS ANDROID V10 START === */

html,
body {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
}

body {
  min-width: 0 !important;
}

.topbar,
.brand,
.top-actions,
.nav,
.content,
.hero,
.hero-art-wrap,
.hero-art-frame {
  max-width: 100% !important;
}

.brand,
.brand > div {
  min-width: 0 !important;
  overflow: hidden !important;
}

@media (max-width: 820px) {
  .topbar {
    position: sticky !important;
    top: 0 !important;
    z-index: 100 !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas:
      "brand actions"
      "nav nav" !important;
    align-items: center !important;
    gap: 8px !important;
    width: 100% !important;
    overflow: visible !important;
    padding-top: max(10px, env(safe-area-inset-top)) !important;
    padding-right: max(10px, env(safe-area-inset-right)) !important;
    padding-left: max(10px, env(safe-area-inset-left)) !important;
    padding-bottom: 10px !important;
    background: rgba(7, 7, 11, .96) !important;
    backdrop-filter: blur(16px) !important;
  }

  .theme-light .topbar {
    background: rgba(255, 255, 255, .96) !important;
  }

  .brand {
    grid-area: brand !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    width: 100% !important;
    max-width: calc(100vw - 176px) !important;
    overflow: hidden !important;
  }

  .logo-img {
    width: 34px !important;
    height: 34px !important;
    min-width: 34px !important;
    max-width: 34px !important;
    object-fit: contain !important;
    flex: 0 0 auto !important;
  }

  .brand strong {
    display: block !important;
    max-width: 150px !important;
    font-size: .78rem !important;
    line-height: 1.05 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    letter-spacing: 0 !important;
  }

  .brand span {
    display: block !important;
    max-width: 120px !important;
    font-size: .58rem !important;
    line-height: 1.05 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .top-actions {
    grid-area: actions !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 6px !important;
    min-width: 0 !important;
    margin-left: 0 !important;
    flex: 0 0 auto !important;
  }

  .install-btn {
    display: none !important;
  }

  .theme-toggle,
  .mobile-menu-btn {
    display: grid !important;
    place-items: center !important;
    width: 40px !important;
    min-width: 40px !important;
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 !important;
    border-radius: 14px !important;
    font-size: 1rem !important;
  }

  .access-btn {
    display: grid !important;
    place-items: center !important;
    width: 50px !important;
    min-width: 50px !important;
    max-width: 50px !important;
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 !important;
    border-radius: 14px !important;
    font-size: 0 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
  }

  .access-btn.member::after {
    content: "MEM" !important;
    font-size: .68rem !important;
    font-weight: 950 !important;
  }

  .access-btn.admin::after,
  .access-btn.master::after {
    content: "ADM" !important;
    font-size: .68rem !important;
    font-weight: 950 !important;
  }

  .nav {
    grid-area: nav !important;
    display: none !important;
    position: fixed !important;
    top: calc(62px + env(safe-area-inset-top)) !important;
    left: max(10px, env(safe-area-inset-left)) !important;
    right: max(10px, env(safe-area-inset-right)) !important;
    width: auto !important;
    max-height: calc(100dvh - 86px - env(safe-area-inset-top)) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 12px !important;
    background: var(--surface) !important;
    border: 1px solid var(--border) !important;
    border-radius: 20px !important;
    box-shadow: 0 24px 70px rgba(0,0,0,.55) !important;
    z-index: 150 !important;
    backdrop-filter: blur(18px) !important;
  }

  .theme-light .nav {
    background: rgba(255,255,255,.98) !important;
  }

  .nav.open {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 8px !important;
  }

  .nav-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    text-align: left !important;
    padding: 13px 14px !important;
    border-radius: 14px !important;
    background: var(--surface-soft) !important;
    border: 1px solid var(--border) !important;
    color: var(--text-main) !important;
  }

  .nav-btn.active {
    background: var(--primary) !important;
    color: #fff !important;
  }

  .content {
    width: 100% !important;
    padding-left: max(14px, env(safe-area-inset-left)) !important;
    padding-right: max(14px, env(safe-area-inset-right)) !important;
    padding-top: 20px !important;
  }

  .hero {
    display: flex !important;
    flex-direction: column !important;
    gap: 20px !important;
  }

  .hero-art-wrap {
    order: -1 !important;
    width: 100% !important;
  }

  .hero-art-frame {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 22px !important;
  }

  .hero-art-img {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
    object-fit: contain !important;
  }

  .hero h1 {
    font-size: clamp(3.2rem, 16vw, 5.3rem) !important;
    line-height: .92 !important;
    letter-spacing: -.065em !important;
    max-width: 100% !important;
    overflow-wrap: break-word !important;
  }

  .hero p {
    font-size: 1rem !important;
    line-height: 1.52 !important;
  }

  .hero-actions {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  .hero-actions .btn {
    width: 100% !important;
    justify-content: center !important;
    text-align: center !important;
  }
}

@media (max-width: 430px) {
  .topbar {
    padding-left: max(8px, env(safe-area-inset-left)) !important;
    padding-right: max(8px, env(safe-area-inset-right)) !important;
    gap: 6px !important;
  }

  .brand {
    max-width: calc(100vw - 158px) !important;
    gap: 6px !important;
  }

  .logo-img {
    width: 30px !important;
    height: 30px !important;
    min-width: 30px !important;
    max-width: 30px !important;
  }

  .brand strong {
    max-width: 126px !important;
    font-size: .70rem !important;
  }

  .brand span {
    display: none !important;
  }

  .top-actions {
    gap: 5px !important;
  }

  .theme-toggle,
  .mobile-menu-btn {
    width: 38px !important;
    min-width: 38px !important;
    height: 38px !important;
    min-height: 38px !important;
  }

  .access-btn {
    width: 46px !important;
    min-width: 46px !important;
    max-width: 46px !important;
    height: 38px !important;
    min-height: 38px !important;
  }

  .access-btn.member::after,
  .access-btn.admin::after,
  .access-btn.master::after {
    font-size: .62rem !important;
  }

  .hero h1 {
    font-size: clamp(3rem, 18vw, 4.8rem) !important;
  }
}

/* === FIX MOBILE HEADER IOS ANDROID V10 END === */
'@

$css = $css.TrimEnd() + "`n`n" + $fix + "`n"
Set-Content $cssPath $css -Encoding UTF8

Write-Host "3/4 Atualizando CSS público e cache..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "public" | Out-Null
Copy-Item "style.css" "public\style.css" -Force

if (Test-Path "service-worker.js") {
    $sw = Get-Content "service-worker.js" -Raw -Encoding UTF8
    $sw = $sw -replace 'const CACHE_NAME = ".*?";', 'const CACHE_NAME = "nibiru-mobile-header-v10";'
    Set-Content "service-worker.js" $sw -Encoding UTF8
    Copy-Item "service-worker.js" "public\service-worker.js" -Force
}

Write-Host "4/4 Correção concluída." -ForegroundColor Green
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Yellow
Write-Host "npm.cmd run build"
Write-Host "npm.cmd run dev"
Write-Host ""
Write-Host "Se estiver certo, publique:" -ForegroundColor Yellow
Write-Host "git add -A"
Write-Host 'git commit -m "Corrige topo mobile iPhone Android"'
Write-Host "git push"
Write-Host ""
