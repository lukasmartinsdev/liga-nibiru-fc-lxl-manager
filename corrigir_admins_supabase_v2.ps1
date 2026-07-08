param(
    [string]$CommitMessage = "Conecta administradores ao Supabase"
)

$ErrorActionPreference = "Stop"

function Step($msg) {
    Write-Host ""
    Write-Host ">>> $msg" -ForegroundColor Cyan
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

Step "Criando SQL da tabela admins"

$sql = @'
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password text not null default '',
  role text not null default 'operational',
  active boolean not null default true,
  fixed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_admins_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_admins_updated_at on public.admins;

create trigger trg_admins_updated_at
before update on public.admins
for each row
execute function public.set_admins_updated_at();

alter table public.admins enable row level security;

drop policy if exists "admins_select_public" on public.admins;
drop policy if exists "admins_insert_public" on public.admins;
drop policy if exists "admins_update_public" on public.admins;
drop policy if exists "admins_delete_public" on public.admins;

create policy "admins_select_public"
on public.admins for select
to anon, authenticated
using (true);

create policy "admins_insert_public"
on public.admins for insert
to anon, authenticated
with check (true);

create policy "admins_update_public"
on public.admins for update
to anon, authenticated
using (true)
with check (true);

create policy "admins_delete_public"
on public.admins for delete
to anon, authenticated
using (true);

insert into public.admins (name, password, role, active, fixed)
values
  ('ADM MASTER', 'ADM123', 'master', true, true),
  ('Lukas', 'Lukas123', 'master', true, true),
  ('Pedro', '', 'visual', true, true),
  ('Wanderson', '', 'operational', true, true),
  ('Enrico', '', 'operational', true, true),
  ('Henrique', '', 'operational', true, true)
on conflict (name) do update set
  role = excluded.role,
  active = excluded.active,
  fixed = excluded.fixed,
  updated_at = now();
'@

Set-Content "supabase_admins.sql" $sql -Encoding UTF8

Step "Lendo app.js"

$appPath = "app.js"
$app = Get-Content $appPath -Raw -Encoding UTF8

Step "Inserindo funções de admins online"

if ($app -notmatch "function fromSupabaseAdmin") {
    $block = @'

function fromSupabaseAdmin(row){
  return {
    id: row.id,
    name: row.name || "",
    password: row.password || "",
    role: row.role || "operational",
    active: row.active !== false,
    fixed: row.fixed === true
  };
}

function toSupabaseAdmin(admin){
  return {
    name: admin.name || "",
    password: admin.password || "",
    role: admin.role || "operational",
    active: admin.active !== false,
    fixed: admin.fixed === true
  };
}

async function loadAdminsFromSupabase(){
  if (!supabaseAvailable()) return false;
  try {
    const rows = await supabaseRequest("/admins?select=*&order=name.asc");
    if (Array.isArray(rows) && rows.length) {
      state.admins = rows.map(fromSupabaseAdmin);
      writeJSON(LS.admins, state.admins);
      return true;
    }
    return false;
  } catch (error) {
    console.warn("Falha ao carregar administradores online", error);
    return false;
  }
}


async function saveAdminOnline(admin, oldName){
  const localAdmin = {...admin};

  if (!supabaseAvailable()) {
    saveAdmins();
    return localAdmin;
  }

  try {
    let saved;

    if (localAdmin.id) {
      const rows = await supabaseRequest(`/admins?id=eq.${encodeURIComponent(localAdmin.id)}&select=*`, {
        method: "PATCH",
        body: JSON.stringify(toSupabaseAdmin(localAdmin))
      });
      saved = Array.isArray(rows) ? rows[0] : rows;
    } else if (oldName) {
      const rows = await supabaseRequest(`/admins?name=eq.${encodeURIComponent(oldName)}&select=*`, {
        method: "PATCH",
        body: JSON.stringify(toSupabaseAdmin(localAdmin))
      });
      saved = Array.isArray(rows) ? rows[0] : rows;
    } else {
      const rows = await supabaseRequest("/admins?select=*", {
        method: "POST",
        body: JSON.stringify(toSupabaseAdmin(localAdmin))
      });
      saved = Array.isArray(rows) ? rows[0] : rows;
    }

    const normalized = saved ? fromSupabaseAdmin(saved) : localAdmin;
    state.admins = state.admins.filter(a => norm(a.name) !== norm(oldName || localAdmin.name) && (!normalized.id || a.id !== normalized.id));
    state.admins.push(normalized);
    state.admins.sort((a,b)=>a.name.localeCompare(b.name));
    saveAdmins();
    return normalized;
  } catch (error) {
    console.warn("Falha ao salvar administrador online", error);
    toast("Não consegui salvar o administrador na base online.");
    throw error;
  }
}

async function deleteAdminOnline(admin){
  if (!admin) return;

  if (!supabaseAvailable() || !admin.id) {
    state.admins = state.admins.filter(a => norm(a.name) !== norm(admin.name));
    saveAdmins();
    return;
  }

  try {
    await supabaseRequest(`/admins?id=eq.${encodeURIComponent(admin.id)}`, { method: "DELETE" });
    state.admins = state.admins.filter(a => a.id !== admin.id);
    saveAdmins();
  } catch (error) {
    console.warn("Falha ao remover administrador online", error);
    toast("Não consegui remover o administrador na base online.");
    throw error;
  }
}

'@
    if ($app.Contains("async function loadPlayersFromSupabase")) {
        $app = $app.Replace("async function loadPlayersFromSupabase", $block + "`r`nasync function loadPlayersFromSupabase")
    } else {
        $app = $block + "`r`n" + $app
    }
}

Step "Garantindo Henrique na lista base"

if ($app -match "function baseAdmins\(\)" -and $app -notmatch '\{name:"Henrique"') {
    $app = $app.Replace('{name:"Enrico", password:"", role:"operational", active:true, fixed:true}', '{name:"Enrico", password:"", role:"operational", active:true, fixed:true},' + "`r`n" + '    {name:"Henrique", password:"", role:"operational", active:true, fixed:true}')
}

Step "Fazendo carregamento buscar admins no Supabase"

if ($app -match "async function loadCloudData\(\)" -and $app -notmatch "await loadAdminsFromSupabase\(\);") {
    $app = [regex]::Replace($app, "async function loadCloudData\(\)\s*\{", "async function loadCloudData(){`r`n  await loadAdminsFromSupabase();", 1)
}


Step "Atualizando login para consultar a base antes de entrar"

$oldLogin = '$("#loginForm").addEventListener("submit", e=>{ e.preventDefault(); loginAdmin($("#loginName").value, $("#loginPassword").value); });'
$newLogin = @'
$("#loginForm").addEventListener("submit", async e=>{
    e.preventDefault();
    await loadAdminsFromSupabase();
    loginAdmin($("#loginName").value, $("#loginPassword").value);
  });
'@

if ($app.Contains($oldLogin)) {
    $app = $app.Replace($oldLogin, $newLogin)
}

Step "Atualizando cadastro/edição de administradores"

$patternAdminSubmit = '\$\("#adminForm"\)\.addEventListener\("submit", e=>\{[\s\S]*?toast\("Administrador salvo\."\);\s*\}\);'

if ($app -match $patternAdminSubmit -and $app -notmatch "saveAdminOnline\(obj, old\)") {
    $newSubmit = @'
$("#adminForm").addEventListener("submit", async e=>{
    e.preventDefault();
    if (!isMaster()) return toast("Apenas ADM Master pode alterar administradores.");

    const old = $("#adminEditName").value;
    const name = $("#adminName").value.trim();
    const password = $("#adminPassword").value.trim();
    const role = $("#adminRole").value;
    const active = $("#adminActive").value === "true";

    if (!name || !password) return toast("Informe nome e senha.");
    if (["adm master","lukas"].includes(norm(name))) return toast("Admin Master é protegido.");

    const previous = state.admins.find(a => norm(a.name) === norm(old || name));
    const obj = {id: previous?.id, name, password, role, active, fixed:false};

    if (!old && state.admins.some(a=>norm(a.name)===norm(name))) {
      return toast("Administrador já existe.");
    }

    try {
      await saveAdminOnline(obj, old);
      await loadAdminsFromSupabase();
      clearAdminForm();
      renderAll();
      toast("Administrador salvo na base online.");
    } catch (error) {
      console.error(error);
    }
  });
'@
    $app = [regex]::Replace($app, $patternAdminSubmit, $newSubmit, 1)
}

Step "Atualizando remoção de administradores"

$oldDelete = 'state.admins = state.admins.filter(x=>x.name!==delA.dataset.deleteAdmin);
        saveAdmins(); renderAll(); toast("Administrador removido.");'
$newDelete = 'deleteAdminOnline(a).then(()=>{ renderAll(); toast("Administrador removido da base online."); });'

if ($app.Contains($oldDelete)) {
    $app = $app.Replace($oldDelete, $newDelete)
}

Set-Content $appPath $app -Encoding UTF8

Step "Atualizando cache no index.html"

$index = Get-Content "index.html" -Raw -Encoding UTF8

if ($index -match '<script type="module" src="[^"]*app\.js[^"]*"></script>') {
    $index = [regex]::Replace($index, '<script type="module" src="[^"]*app\.js[^"]*"></script>', '<script type="module" src="/app.js?v=admins-online-2"></script>', 1)
}

if ($index -match '<link rel="stylesheet" href="[^"]*style\.css[^"]*">') {
    $index = [regex]::Replace($index, '<link rel="stylesheet" href="[^"]*style\.css[^"]*">', '<link rel="stylesheet" href="/style.css?v=admins-online-2">', 1)
}

Set-Content "index.html" $index -Encoding UTF8

Step "Atualizando service worker e public"

New-Item -ItemType Directory -Force -Path "public" | Out-Null

if (Test-Path "style.css") {
    Copy-Item "style.css" "public\style.css" -Force
}

if (Test-Path "service-worker.js") {
    $sw = Get-Content "service-worker.js" -Raw -Encoding UTF8

    if ($sw -match 'const CACHE_NAME = ".*?";') {
        $sw = [regex]::Replace($sw, 'const CACHE_NAME = ".*?";', 'const CACHE_NAME = "nibiru-admins-online-v2";', 1)
    }

    Set-Content "service-worker.js" $sw -Encoding UTF8
    Copy-Item "service-worker.js" "public\service-worker.js" -Force
}

Step "Testando build"

npm.cmd run build

if ($LASTEXITCODE -ne 0) {
    Fail "Build falhou. Não publique ainda."
}

Step "Finalizado"

Write-Host ""
Write-Host "Agora falta executar o SQL no Supabase:" -ForegroundColor Yellow
Write-Host "Arquivo criado: supabase_admins.sql"
Write-Host ""
Write-Host "Depois rode:" -ForegroundColor Yellow
Write-Host "git add -A"
Write-Host "git commit -m `"$CommitMessage`""
Write-Host "git push"
Write-Host ""
Write-Host "Pronto: ADMs, senhas e permissões passam a funcionar online." -ForegroundColor Green
