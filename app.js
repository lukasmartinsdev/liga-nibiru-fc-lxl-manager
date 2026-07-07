/* Liga Nibiru FC - versão revisada para Google AI Studio. Não remover CSS/estrutura principal sem necessidade. */

const LS = {
  settings: "nibiru_lxl_settings_v11_revisado",
  currentUser: "nibiru_lxl_current_user_v11_revisado",
  admins: "nibiru_lxl_admins_v11_revisado",
  players: "nibiru_lxl_players_v11_revisado",
  matches: "nibiru_lxl_matches_v11_revisado"
};

const DEFAULT_ASSETS = {
  logoDark: "./assets/logo-nibiru-red.png",
  logoLight: "./assets/logo-nibiru-blue.png",
  homeDark: "./assets/home-art-dark.webp?v=4?v=4",
  homeLight: "./assets/home-art-light.webp",
  bgDark: "./assets/background-dark.webp",
  bgLight: "./assets/background-light.webp"
};

const defaultSettings = {
  themeMode: "dark",
  frameEnabled: true,
  frameColor: "#ff1e2d",
  frameSize: 2,
  frameRadius: 28,
  frameStyle: "solid",
  frameShadow: true,
  hasLogoDark: false,
  hasLogoLight: false,
  hasHomeDark: false,
  hasHomeLight: false,
  hasBgDark: false,
  hasBgLight: false
};

const seedPlayers = [
  {id:"p1", name:"PK7-SPOOK", ger:127, media:33.92, games:12, streak:10, zero:0, status:"Ativo", note:""},
  {id:"p2", name:"AVENKI_wanderson", ger:126, media:34.25, games:12, streak:8, zero:0, status:"Ativo", note:""},
  {id:"p3", name:"Lukas", ger:126, media:33.52, games:12, streak:7, zero:0, status:"Ativo", note:""},
  {id:"p4", name:"JolyJoker", ger:127, media:33.00, games:11, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p5", name:"EnricoNsx", ger:127, media:33.00, games:11, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p6", name:"playerEAFC03", ger:125, media:33.42, games:12, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p7", name:"TIAGOMES NKS", ger:126, media:34.00, games:4, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p8", name:"WMARDUK03", ger:125, media:34.17, games:12, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p9", name:"AVENANSHE", ger:125, media:34.45, games:11, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p10", name:"AVENKI2026", ger:123, media:33.67, games:9, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p11", name:"gijoestalker03", ger:125, media:32.44, games:9, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p12", name:"Bayer", ger:125, media:33.80, games:5, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p13", name:"Nuno123", ger:125, media:32.00, games:6, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p14", name:"GRIFE", ger:124, media:31.00, games:2, streak:0, zero:0, status:"Ativo", note:""},
  {id:"p15", name:"AVENINGISHZIDA", ger:123, media:36.00, games:1, streak:0, zero:0, status:"Ativo", note:"Baixa amostra"},
  {id:"p16", name:"BRZK_Dozero", ger:123, media:36.00, games:2, streak:0, zero:0, status:"Ativo", note:"Baixa amostra"},
  {id:"p17", name:"Cleber1303", ger:125, media:29.89, games:9, streak:0, zero:1, status:"Inativo", note:""},
  {id:"p18", name:"andin", ger:126, media:34.67, games:3, streak:0, zero:0, status:"Inativo", note:""}
];

const state = {
  settings: {...defaultSettings},
  currentUser: null,
  admins: [],
  players: [],
  matches: [],
  cloudEnabled: false,
  cloudMessageShown: false,
  pendingImages: {},
  deferredPrompt: null,
  page: "home"
};

const pages = [
  {id:"home", label:"Início", public:true},
  {id:"history", label:"História", public:true},
  {id:"dashboard", label:"Dashboard", public:true},
  {id:"players", label:"Jogadores", locked:true, type:"data"},
  {id:"matches", label:"Partidas LXL", locked:true, type:"data"},
  {id:"ranking", label:"Ranking", public:true},
  {id:"reports", label:"Relatórios", locked:true, type:"data"},
  {id:"settings", label:"Configurações", locked:true, type:"visual"},
  {id:"tournaments", label:"Torneios", public:true},
  {id:"people", label:"Cadastrar Pessoas", locked:true, type:"people"}
];

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const norm = v => String(v || "").trim().toLowerCase();

function toast(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(()=>el.classList.remove("show"), 2600);
}

function readJSON(key, fallback){
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function writeJSON(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

function supabaseAvailable(){
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.includes(".supabase.co"));
}

async function supabaseRequest(path, options = {}){
  if (!supabaseAvailable()) {
    throw new Error("Supabase não configurado.");
  }

  const { method = "GET", body, prefer, headers = {} } = options;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(prefer ? {"Prefer": prefer} : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Erro Supabase ${response.status}: ${text}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function fromSupabasePlayer(row){
  return {
    id: row.id,
    name: row.name || "",
    ger: Number(row.ger || 0),
    media: Number(row.media || 0),
    games: Number(row.games || 0),
    streak: Number(row.streak || 0),
    zero: Number(row.zero_alerts || 0),
    status: row.status || "Ativo",
    note: row.note || ""
  };
}

function toSupabasePlayer(player){
  return {
    name: player.name,
    ger: Number(player.ger || 0),
    media: Number(player.media || 0),
    games: Number(player.games || 0),
    streak: Number(player.streak || 0),
    zero_alerts: Number(player.zero || 0),
    status: player.status || "Ativo",
    note: player.note || ""
  };
}

function fromSupabaseMatch(row){
  return {
    id: row.id,
    date: row.match_date,
    opponent: row.opponent || "",
    goalsFor: Number(row.goals_for || 0),
    goalsAgainst: Number(row.goals_against || 0),
    notes: row.notes || ""
  };
}

function toSupabaseMatch(match){
  return {
    match_date: match.date,
    opponent: match.opponent,
    goals_for: Number(match.goalsFor || 0),
    goals_against: Number(match.goalsAgainst || 0),
    notes: match.notes || ""
  };
}

async function loadPlayersFromSupabase(){
  const rows = await supabaseRequest("players?select=*&order=created_at.asc");
  return Array.isArray(rows) ? rows.map(fromSupabasePlayer) : [];
}

async function loadMatchesFromSupabase(){
  const rows = await supabaseRequest("matches?select=*&order=created_at.desc");
  return Array.isArray(rows) ? rows.map(fromSupabaseMatch) : [];
}

async function loadCloudData(){
  if (!supabaseAvailable()) {
    state.cloudEnabled = false;
    return;
  }

  try {
    const [players, matches] = await Promise.all([
      loadPlayersFromSupabase(),
      loadMatchesFromSupabase()
    ]);

    if (players.length) {
      state.players = players;
      writeJSON(LS.players, state.players);
    }

    state.matches = matches;
    writeJSON(LS.matches, state.matches);

    state.cloudEnabled = true;
  } catch (error) {
    console.error(error);
    state.cloudEnabled = false;
    if (!state.cloudMessageShown) {
      state.cloudMessageShown = true;
      setTimeout(() => toast("Banco online indisponível. Usando dados locais neste navegador."), 500);
    }
  }
}

async function savePlayerOnline(player, isEditing){
  if (!state.cloudEnabled) return player;

  const payload = toSupabasePlayer(player);

  if (isEditing && player.id && !String(player.id).startsWith("p")) {
    const rows = await supabaseRequest(`players?id=eq.${encodeURIComponent(player.id)}&select=*`, {
      method: "PATCH",
      body: payload,
      prefer: "return=representation"
    });
    return fromSupabasePlayer(rows?.[0] || {...payload, id: player.id});
  }

  const rows = await supabaseRequest("players?select=*", {
    method: "POST",
    body: payload,
    prefer: "return=representation"
  });

  return fromSupabasePlayer(rows?.[0]);
}

async function deletePlayerOnline(id){
  if (!state.cloudEnabled || !id || String(id).startsWith("p")) return;
  await supabaseRequest(`players?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

async function saveMatchOnline(match){
  if (!state.cloudEnabled) return match;

  const rows = await supabaseRequest("matches?select=*", {
    method: "POST",
    body: toSupabaseMatch(match),
    prefer: "return=representation"
  });

  return fromSupabaseMatch(rows?.[0]);
}


function baseAdmins(){
  return [
    {name:"ADM MASTER", password:"ADM123", role:"master", active:true, fixed:true},
    {name:"Lukas", password:"Lukas123", role:"master", active:true, fixed:true},
    {name:"Pedro", password:"", role:"visual", active:true, fixed:true},
    {name:"Wanderson", password:"", role:"operational", active:true, fixed:true},
    {name:"Enrico", password:"", role:"operational", active:true, fixed:true}
  ];
}

function ensureBaseAdmins(){
  const saved = readJSON(LS.admins, []);
  const corrected = saved.map(a => {
    let n = a.name;
    if (norm(n)==="lucas") n = "Lukas";
    if (norm(n)==="vanderson" || norm(n)==="anderson") n = "Wanderson";
    if (["henrico","henrique","enrique"].includes(norm(n))) n = "Enrico";
    return {...a, name:n};
  }).filter(a => !["lucas","vanderson","henrico","henrique","anderson"].includes(norm(a.name)));
  const base = baseAdmins();
  base.forEach(b => {
    const existing = corrected.find(a => norm(a.name) === norm(b.name));
    if (existing) {
      existing.name = b.name;
      existing.role = b.role;
      existing.active = true;
      existing.fixed = true;
      if (!existing.password && b.password) existing.password = b.password;
    } else corrected.push(b);
  });
  state.admins = corrected.filter((a, i, arr)=>arr.findIndex(x=>norm(x.name)===norm(a.name))===i);
  writeJSON(LS.admins, state.admins);
}

function getCurrentUser(){ return state.currentUser; }
function isLoggedIn(){ return !!state.currentUser; }
function isMaster(){ return ["adm master","lukas"].includes(norm(state.currentUser?.name)) && state.currentUser?.role === "master"; }
function canEditData(){ return ["master","visual","operational"].includes(state.currentUser?.role); }
function canEditVisual(){ return ["master","visual"].includes(state.currentUser?.role); }
function canManagePeople(){ return isMaster(); }

function canAccessPage(page){
  const def = pages.find(p=>p.id===page);
  if (!def || def.public) return true;
  if (def.type === "data") return canEditData() || canEditVisual() || isMaster();
  if (def.type === "visual") return canEditVisual() || isMaster();
  if (def.type === "people") return canManagePeople();
  return false;
}

function restrictedMessage(page){
  const def = pages.find(p=>p.id===page);
  if (def?.type === "people") return "Apenas Admin Master pode cadastrar pessoas.";
  if (def?.type === "visual") return "Apenas usuários autorizados podem acessar as configurações visuais.";
  return "Área restrita para administradores.";
}

async function initData(){
  state.settings = {...defaultSettings, ...readJSON(LS.settings, {})};
  ensureBaseAdmins();
  state.players = readJSON(LS.players, null) || seedPlayers;
  writeJSON(LS.players, state.players);
  state.matches = readJSON(LS.matches, []);
  const savedUser = readJSON(LS.currentUser, null);
  if (savedUser) {
    const admin = state.admins.find(a => norm(a.name) === norm(savedUser.name) && a.active);
    if (admin) state.currentUser = {name: admin.name, role: admin.role, active: true};
    else localStorage.removeItem(LS.currentUser);
  }
  await loadCloudData();
}

function saveSettings(){ writeJSON(LS.settings, state.settings); }
function savePlayers(){ writeJSON(LS.players, state.players); }
function saveMatches(){ writeJSON(LS.matches, state.matches); }
function saveAdmins(){ writeJSON(LS.admins, state.admins); }

function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open("NibiruLXLAssets", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("assets");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function saveImageToDB(key, dataUrl){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction("assets","readwrite");
    tx.objectStore("assets").put(dataUrl, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
async function getImageFromDB(key){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction("assets","readonly");
    const req = tx.objectStore("assets").get(key);
    req.onsuccess = () => resolve(req.result || "");
    req.onerror = () => reject(req.error);
  });
}
async function deleteImageFromDB(key){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction("assets","readwrite");
    tx.objectStore("assets").delete(key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

const dbKeyMap = {
  logoDark:"logoDarkImage", logoLight:"logoLightImage",
  homeDark:"homeDarkImage", homeLight:"homeLightImage",
  bgDark:"bgDarkImage", bgLight:"bgLightImage"
};
const settingFlagMap = {
  logoDark:"hasLogoDark", logoLight:"hasLogoLight",
  homeDark:"hasHomeDark", homeLight:"hasHomeLight",
  bgDark:"hasBgDark", bgLight:"hasBgLight"
};

function compressImage(file, maxSize=1600, quality=.86){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        let {width, height} = img;
        const scale = Math.min(1, maxSize / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        const ctx = c.getContext("2d");
        ctx.drawImage(img,0,0,width,height);
        resolve(c.toDataURL("image/png", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function getAsset(kind){
  const flag = settingFlagMap[kind];
  if (state.settings[flag]) {
    const stored = await getImageFromDB(dbKeyMap[kind]).catch(()=> "");
    if (stored) return stored;
  }
  return DEFAULT_ASSETS[kind];
}

async function applyLogoByTheme(){
  const kind = state.settings.themeMode === "light" ? "logoLight" : "logoDark";
  const src = await getAsset(kind);
  $("#mainLogo").src = src;
}
async function applyHomeArt(){
  const kind = state.settings.themeMode === "light" ? "homeLight" : "homeDark";
  const img = $("#homeArtImg");
  if (!img) return;
  const fallback = DEFAULT_ASSETS[kind];
  img.onerror = function(){ this.onerror = null; this.src = fallback; };
  img.src = await getAsset(kind);
}
async function applyBackground(){
  const isLight = state.settings.themeMode === "light";
  const kind = isLight ? "bgLight" : "bgDark";
  const src = await getAsset(kind);
  if (src) {
    if (isLight) document.body.style.setProperty("--app-bg-light", `url("${src}") center/cover no-repeat`);
    else document.body.style.setProperty("--app-bg", `url("${src}") center/cover no-repeat`);
  }
}
function applyFrame(){
  const frame = $("#heroArtFrame");
  if (!frame) return;
  const s = state.settings;
  const color = state.settings.themeMode === "light" ? "#2563eb" : (s.frameColor || "#ff1e2d");
  frame.style.borderWidth = s.frameEnabled ? `${s.frameSize}px` : "0px";
  frame.style.borderStyle = s.frameEnabled ? s.frameStyle : "none";
  frame.style.borderColor = color;
  frame.style.borderRadius = `${s.frameRadius}px`;
  frame.style.boxShadow = s.frameShadow ? `0 0 38px ${state.settings.themeMode === "light" ? "rgba(37,99,235,.38)" : "rgba(255,30,45,.48)"}` : "none";
}
async function applyTheme(mode=state.settings.themeMode){
  state.settings.themeMode = mode === "light" ? "light" : "dark";
  document.body.classList.toggle("theme-light", state.settings.themeMode === "light");
  document.body.classList.toggle("theme-dark", state.settings.themeMode !== "light");
  $("#themeToggle").textContent = state.settings.themeMode === "light" ? "🌙" : "☀️";
  $("#themeColorMeta").setAttribute("content", state.settings.themeMode === "light" ? "#2563eb" : "#0b0b0f");
  saveSettings();
  $$(".segmented [data-theme-choice]").forEach(b=>b.classList.toggle("active", b.dataset.themeChoice === state.settings.themeMode));
  await applyLogoByTheme();
  await applyHomeArt();
  await applyBackground();
  applyFrame();
}
async function applyPreviews(){
  const pairs = [
    ["previewLogoDark","logoDark"],["previewLogoLight","logoLight"],["previewHomeDark","homeDark"],["previewHomeLight","homeLight"]
  ];
  for (const [id, kind] of pairs) {
    const el = $("#"+id);
    if (el) el.src = state.pendingImages[kind] || await getAsset(kind);
  }
}

function requireVisual(){
  if (!canEditVisual()) { toast("Apenas usuários autorizados podem alterar as imagens do app."); return false; }
  return true;
}
function requireData(){
  if (!canEditData()) { toast("Somente administradores podem alterar essas informações."); return false; }
  return true;
}
function requirePeople(){
  if (!canManagePeople()) { toast("Apenas Admin Master pode cadastrar pessoas."); return false; }
  return true;
}

async function selectImage(kind){
  if (!requireVisual()) return;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const isLogo = kind.startsWith("logo");
    const data = await compressImage(file, isLogo ? 700 : 1700, .88);
    state.pendingImages[kind] = data;
    await applyPreviews();
    toast("Imagem selecionada. Clique em salvar para aplicar.");
  };
  input.click();
}
async function saveImage(kind){
  if (!requireVisual()) return;
  const data = state.pendingImages[kind];
  if (!data) { toast("Escolha uma imagem antes de salvar."); return; }
  await saveImageToDB(dbKeyMap[kind], data);
  state.settings[settingFlagMap[kind]] = true;
  delete state.pendingImages[kind];
  saveSettings();
  await applyTheme(state.settings.themeMode);
  await applyPreviews();
  toast("Imagem salva como padrão.");
}
async function restoreImage(kind){
  if (!requireVisual()) return;
  await deleteImageFromDB(dbKeyMap[kind]);
  state.settings[settingFlagMap[kind]] = false;
  delete state.pendingImages[kind];
  saveSettings();
  await applyTheme(state.settings.themeMode);
  await applyPreviews();
  toast("Padrão restaurado.");
}

function renderNav(){
  const nav = $("#mainNav");
  nav.innerHTML = pages.map(p => `<button class="nav-btn ${state.page===p.id?"active":""}" data-page="${p.id}">${p.label}${p.locked?'<span class="lock">🔒</span>':''}</button>`).join("");
}
function navigate(page){
  if (!canAccessPage(page)) { toast(restrictedMessage(page)); return; }
  $("#mainNav")?.classList.remove("open");
  $("#mobileMenuBtn")?.setAttribute("aria-expanded", "false");
  state.page = page;
  $$(".page").forEach(p=>p.classList.remove("active"));
  $("#page-"+page)?.classList.add("active");
  renderNav();
  renderAll();
  window.scrollTo({top:0, behavior:"smooth"});
}
function renderAccess(){
  const btn = $("#accessBtn");
  btn.className = "access-btn";
  if (!state.currentUser) {
    btn.textContent = "Membro";
    btn.classList.add("member");
  } else if (state.currentUser.role === "master") {
    btn.textContent = "Admin Master";
    btn.classList.add("master");
  } else {
    btn.textContent = "Admin";
    btn.classList.add("admin");
  }
}
function openLogin(){
  $("#loginModal").classList.add("show");
  $("#loginModal").setAttribute("aria-hidden","false");
  $("#loginName").focus();
  setLoginMessage("");
}
function closeLogin(){
  $("#loginModal").classList.remove("show");
  $("#loginModal").setAttribute("aria-hidden","true");
  $("#loginForm").reset();
  setLoginMessage("");
}
function setLoginMessage(msg, type="error"){
  const el = $("#loginMessage");
  if (!msg) { el.className="message"; el.textContent=""; return; }
  el.className = "message " + type;
  el.textContent = msg;
}
function loginAdmin(name, password){
  name = String(name||"").trim();
  password = String(password||"").trim();
  if (!name) return setLoginMessage("Digite o nome do administrador.");
  if (!password) return setLoginMessage("Digite a senha.");
  const admin = state.admins.find(a=>norm(a.name)===norm(name));
  if (!admin) return setLoginMessage("Administrador não encontrado.");
  if (!admin.active) return setLoginMessage("Administrador inativo.");
  if (!admin.password) return setLoginMessage("Senha ainda não definida para este administrador.");
  if (String(admin.password).trim() !== password) return setLoginMessage("Senha incorreta.");
  state.currentUser = {name: admin.name, role: admin.role, active: true};
  writeJSON(LS.currentUser, state.currentUser);
  setLoginMessage("Login realizado com sucesso.", "success");
  setTimeout(()=>{ closeLogin(); renderAll(); toast("Modo administrador ativo."); }, 350);
}
function logoutAdmin(){
  if (!state.currentUser) return openLogin();
  if (confirm("Deseja sair do modo administrador?")) {
    state.currentUser = null;
    localStorage.removeItem(LS.currentUser);
    if (!canAccessPage(state.page)) state.page = "home";
    renderAll();
    navigate(state.page);
    toast("Você voltou para Membro.");
  }
}

function ranking(){
  const active = state.players.filter(p=>p.status !== "Inativo");
  const maxMedia = Math.max(...active.map(p=>+p.media||0), 1);
  const maxGer = Math.max(...active.map(p=>+p.ger||0), 1);
  return [...state.players].map(p => ({
    ...p,
    score: (((+p.media||0)/maxMedia)*0.8 + ((+p.ger||0)/maxGer)*0.2)*100
  })).sort((a,b)=> b.score-a.score || b.ger-a.ger || b.media-a.media || b.games-a.games || a.zero-b.zero);
}

function renderDashboard(){
  const r = ranking().filter(p=>p.status!=="Inativo");
  const best = r[0] || {};
  const bestMedia = [...r].sort((a,b)=>b.media-a.media)[0] || {};
  const ger = [...r].sort((a,b)=>b.ger-a.ger)[0] || {};
  const streak = [...r].sort((a,b)=>b.streak-a.streak)[0] || {};
  $("#kpiGrid").innerHTML = [
    ["Melhor índice", best.name || "-", (best.score||0).toFixed(1)],
    ["Maior média", bestMedia.name || "-", (bestMedia.media||0).toFixed(2)],
    ["Maior GER", ger.name || "-", ger.ger || 0],
    ["Maior sequência", streak.name || "-", (streak.streak||0)+" jogos"]
  ].map(k=>`<div class="kpi"><b>${k[0]}</b><h3>${k[1]}</h3><span>${k[2]}</span></div>`).join("");
}

function renderPlayers(){
  const q = norm($("#playerSearch")?.value || "");
  const rows = state.players.filter(p=>norm(p.name).includes(q));
  const table = $("#playersTable");
  if (table) {
    table.className = "data-table players-desktop";
    table.innerHTML = `<thead><tr><th>Jogador</th><th>GER</th><th>Média</th><th>Jogos</th><th>Seq.</th><th>0/3</th><th>Status</th><th>Ações</th></tr></thead><tbody>` + rows.map(p=>`
      <tr>
        <td><b>${p.name}</b><br><small>${p.note||""}</small></td>
        <td>${p.ger}</td><td>${(+p.media).toFixed(2)}</td><td>${p.games}</td><td>${p.streak||0}</td><td>${p.zero||0}</td><td><span class="badge">${p.status}</span></td>
        <td class="actions-cell">${canEditData()?`<button class="icon-btn" data-edit-player="${p.id}">Editar</button><button class="icon-btn" data-delete-player="${p.id}">Excluir</button>`:"-"}</td>
      </tr>`).join("") + `</tbody>`;
  }
  const mobile = $("#playersMobileList");
  if (mobile) {
    mobile.innerHTML = rows.map(p=>`<div class="player-card">
      <h4>${p.name}</h4><small>${p.note||p.status}</small>
      <div class="player-stats">
        <span>GER <b>${p.ger}</b></span><span>Média <b>${(+p.media).toFixed(2)}</b></span>
        <span>Jogos <b>${p.games}</b></span><span>Seq. <b>${p.streak||0}</b></span>
      </div>
      ${canEditData()?`<div class="inline-actions" style="margin-top:12px"><button class="btn secondary" data-edit-player="${p.id}">Editar</button><button class="btn ghost" data-delete-player="${p.id}">Excluir</button></div>`:""}
    </div>`).join("");
  }
}
function fillPlayerForm(p){
  $("#playerId").value=p.id; $("#playerName").value=p.name; $("#playerGer").value=p.ger; $("#playerMedia").value=p.media;
  $("#playerGames").value=p.games; $("#playerStreak").value=p.streak||0; $("#playerZero").value=p.zero||0; $("#playerStatus").value=p.status; $("#playerNote").value=p.note||"";
}
function clearPlayerForm(){ $("#playerForm").reset(); $("#playerId").value=""; }

function renderRanking(){
  const table = $("#rankingTable");
  const rows = ranking();
  if (table) {
    table.innerHTML = `<thead><tr><th>#</th><th>Jogador</th><th>GER</th><th>Média</th><th>Jogos</th><th>Índice</th><th>Status</th></tr></thead><tbody>` +
      rows.map((p,i)=>`<tr><td>${i+1}</td><td><b>${p.name}</b><br><small>${p.note||""}</small></td><td>${p.ger}</td><td>${(+p.media).toFixed(2)}</td><td>${p.games}</td><td><b>${p.score.toFixed(1)}</b></td><td><span class="badge">${p.status}</span></td></tr>`).join("") +
      `</tbody>`;
  }
  const mobile = $("#rankingMobileList");
  if (mobile) {
    mobile.innerHTML = rows.map((p,i)=>`<article class="mobile-card ranking-card">
      <div class="card-top">
        <div>
          <h4>${p.name}</h4>
          <small>${p.note || p.status}</small>
        </div>
        <div class="mobile-rank">#${i+1}</div>
      </div>
      <div class="card-grid">
        <span>Índice <b>${p.score.toFixed(1)}</b></span>
        <span>GER <b>${p.ger}</b></span>
        <span>Média <b>${(+p.media).toFixed(2)}</b></span>
        <span>Jogos <b>${p.games}</b></span>
      </div>
    </article>`).join("");
  }
}

function renderMatches(){
  const table = $("#matchesTable");
  const rows = state.matches;
  if (table) {
    table.innerHTML = `<thead><tr><th>Data</th><th>Adversário</th><th>Placar</th><th>Resultado</th></tr></thead><tbody>` + rows.map(m=>{
      const gf=+m.goalsFor, ga=+m.goalsAgainst;
      const res = gf>ga ? "Vitória" : gf<ga ? "Derrota" : "Empate";
      return `<tr><td>${m.date}</td><td>${m.opponent}</td><td>${gf} x ${ga}</td><td><span class="badge">${res}</span></td></tr>`;
    }).join("") + `</tbody>`;
  }
  const mobile = $("#matchesMobileList");
  if (mobile) {
    if (!rows.length) {
      mobile.innerHTML = `<article class="mobile-card"><h4>Nenhuma partida cadastrada</h4><small>Entre como administrador para registrar partidas LXL.</small></article>`;
      return;
    }
    mobile.innerHTML = rows.map(m=>{
      const gf=+m.goalsFor, ga=+m.goalsAgainst;
      const res = gf>ga ? "Vitória" : gf<ga ? "Derrota" : "Empate";
      const cls = gf>ga ? "result-win" : gf<ga ? "result-loss" : "result-draw";
      return `<article class="mobile-card match-card">
        <div class="card-top">
          <div>
            <h4>Nibiru FC x ${m.opponent}</h4>
            <small>${m.date}</small>
          </div>
          <span class="badge ${cls}">${res}</span>
        </div>
        <div class="card-grid">
          <span>Nibiru FC <b>${gf}</b></span>
          <span>${m.opponent} <b>${ga}</b></span>
        </div>
      </article>`;
    }).join("");
  }
}

function renderReports(){
  const r = ranking();
  const inactive = state.players.filter(p=>p.status==="Inativo").length;
  const zero = state.players.reduce((s,p)=>s+(+p.zero||0),0);
  $("#reportGrid").innerHTML = [
    ["Destaque geral", `${r[0]?.name || "-"} lidera o índice consolidado com ${(r[0]?.score||0).toFixed(1)} pontos.`],
    ["Atenção", `${inactive} jogadores inativos e ${zero} alertas 0/3 registrados.`],
    ["Meta da liga", "Acompanhar constância, média de gols e participação para manter o nível competitivo."],
    ["Próximo passo", "Atualizar dados após cada LXL para o ranking refletir a temporada real."]
  ].map(x=>`<div class="panel"><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join("");
}

function renderAdmins(){
  const table = $("#adminsTable");
  const rows = state.admins;
  if (table) {
    table.innerHTML = `<thead><tr><th>Nome</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead><tbody>` + rows.map(a=>`
      <tr><td><b>${a.name}</b></td><td>${roleLabel(a.role)}</td><td><span class="badge">${a.active?"Ativo":"Inativo"}</span></td><td class="actions-cell">${canManagePeople() && a.role!=="master" ? `<button class="icon-btn" data-edit-admin="${a.name}">Editar</button><button class="icon-btn" data-delete-admin="${a.name}">Remover</button>` : "Protegido"}</td></tr>
    `).join("") + `</tbody>`;
  }
  const mobile = $("#adminsMobileList");
  if (mobile) {
    mobile.innerHTML = rows.map(a=>`<article class="mobile-card admin-card">
      <div class="card-top">
        <div>
          <h4>${a.name}</h4>
          <small>${roleLabel(a.role)}</small>
        </div>
        <span class="badge">${a.active ? "Ativo" : "Inativo"}</span>
      </div>
      ${canManagePeople() && a.role!=="master" ? `<div class="card-actions"><button class="icon-btn" data-edit-admin="${a.name}">Editar</button><button class="icon-btn" data-delete-admin="${a.name}">Remover</button></div>` : `<small>Protegido</small>`}
    </article>`).join("");
  }
}
function roleLabel(r){ return r==="master"?"Admin Master":r==="visual"?"Admin com Visual":"Admin Operacional"; }
function clearAdminForm(){ $("#adminForm").reset(); $("#adminEditName").value=""; }

function renderLockedVisuals(){
  $$(".visual-only button,.visual-only input,.visual-only select").forEach(el => el.disabled = !canEditVisual());
  $$(".admin-panel input,.admin-panel select,.admin-panel button").forEach(el => el.disabled = !canEditData());
}
async function renderSettings(){
  $("#frameEnabled").checked = state.settings.frameEnabled;
  $("#frameColor").value = state.settings.frameColor;
  $("#frameSize").value = state.settings.frameSize;
  $("#frameRadius").value = state.settings.frameRadius;
  $("#frameStyle").value = state.settings.frameStyle;
  $("#frameShadow").checked = state.settings.frameShadow;
  $("#frameSizeValue").textContent = state.settings.frameSize + "px";
  $("#frameRadiusValue").textContent = state.settings.frameRadius + "px";
  await applyPreviews();
}
async function renderAll(){
  renderAccess();
  renderNav();
  renderDashboard();
  renderPlayers();
  renderRanking();
  renderMatches();
  renderReports();
  renderAdmins();
  renderLockedVisuals();
  await renderSettings();
  await applyTheme(state.settings.themeMode);
}

function setupEvents(){
  document.addEventListener("click", async e => {
    const pageBtn = e.target.closest("[data-page]");
    if (pageBtn) navigate(pageBtn.dataset.page);
    const go = e.target.closest("[data-page-go]");
    if (go) navigate(go.dataset.pageGo);
    const sel = e.target.closest("[data-select-image]");
    if (sel) await selectImage(sel.dataset.selectImage);
    const save = e.target.closest("[data-save-image]");
    if (save) await saveImage(save.dataset.saveImage);
    const restore = e.target.closest("[data-restore-image]");
    if (restore) await restoreImage(restore.dataset.restoreImage);
    const th = e.target.closest("[data-theme-choice]");
    if (th) await applyTheme(th.dataset.themeChoice);
    const editP = e.target.closest("[data-edit-player]");
    if (editP) {
      if (!requireData()) return;
      const p = state.players.find(x=>x.id===editP.dataset.editPlayer);
      if (p) fillPlayerForm(p);
    }
    const delP = e.target.closest("[data-delete-player]");
    if (delP) {
      if (!requireData()) return;
      if (confirm("Excluir jogador?")) {
        try {
          await deletePlayerOnline(delP.dataset.deletePlayer);
          state.players = state.players.filter(p=>p.id!==delP.dataset.deletePlayer);
          savePlayers();
          renderAll();
          toast(state.cloudEnabled ? "Jogador excluído do banco online." : "Jogador excluído localmente.");
        } catch (error) {
          console.error(error);
          toast("Erro ao excluir no banco online.");
        }
      }
    }
    const editA = e.target.closest("[data-edit-admin]");
    if (editA) {
      if (!requirePeople()) return;
      const a = state.admins.find(x=>x.name===editA.dataset.editAdmin);
      if (a && a.role !== "master") {
        $("#adminEditName").value = a.name; $("#adminName").value = a.name; $("#adminPassword").value = a.password||""; $("#adminRole").value = a.role; $("#adminActive").value = String(a.active);
      }
    }
    const delA = e.target.closest("[data-delete-admin]");
    if (delA) {
      if (!requirePeople()) return;
      const a = state.admins.find(x=>x.name===delA.dataset.deleteAdmin);
      if (a?.role === "master") return toast("Admin Master é protegido.");
      if (confirm("Remover administrador?")) {
        state.admins = state.admins.filter(x=>x.name!==delA.dataset.deleteAdmin);
        saveAdmins(); renderAll(); toast("Administrador removido.");
      }
    }
  });

  $("#themeToggle").addEventListener("click", ()=>applyTheme(state.settings.themeMode === "light" ? "dark" : "light"));
  $("#accessBtn").addEventListener("click", logoutAdmin);
  $("#cancelLogin").addEventListener("click", closeLogin);
  $("#loginModal").addEventListener("click", e=>{ if(e.target.id==="loginModal") closeLogin(); });
  $("#loginForm").addEventListener("submit", e=>{ e.preventDefault(); loginAdmin($("#loginName").value, $("#loginPassword").value); });
  $("#togglePassword").addEventListener("click", ()=>{
    const input = $("#loginPassword");
    input.type = input.type === "password" ? "text" : "password";
  });
  $("#playerSearch").addEventListener("input", renderPlayers);
  $("#clearPlayerForm").addEventListener("click", clearPlayerForm);
  $("#playerForm").addEventListener("submit", async e=>{
    e.preventDefault();
    if (!requireData()) return;

    const existingId = $("#playerId").value;
    const id = existingId || "p"+Date.now();
    const name = $("#playerName").value.trim();

    if (!name) return toast("Informe o nome do jogador.");

    const dup = state.players.find(p=>norm(p.name)===norm(name) && p.id!==id);
    if (dup) return toast("Já existe jogador com esse nome.");

    let player = {
      id, name,
      ger:+$("#playerGer").value||0,
      media:+$("#playerMedia").value||0,
      games:+$("#playerGames").value||0,
      streak:+$("#playerStreak").value||0,
      zero:+$("#playerZero").value||0,
      status:$("#playerStatus").value,
      note:$("#playerNote").value.trim()
    };

    try {
      player = await savePlayerOnline(player, Boolean(existingId));
      const idx = state.players.findIndex(p=>p.id===id || p.id===player.id);
      if (idx >= 0) state.players[idx] = player; else state.players.push(player);
      savePlayers();
      clearPlayerForm();
      renderAll();
      toast(state.cloudEnabled ? "Jogador salvo no banco online." : "Jogador salvo localmente.");
    } catch (error) {
      console.error(error);
      toast("Erro ao salvar no banco online.");
    }
  });
  $("#matchForm").addEventListener("submit", async e=>{
    e.preventDefault();
    if (!requireData()) return;

    let match = {
      id:"m"+Date.now(),
      date:$("#matchDate").value,
      opponent:$("#matchOpponent").value.trim(),
      goalsFor:+$("#matchGoalsFor").value||0,
      goalsAgainst:+$("#matchGoalsAgainst").value||0
    };

    if (!match.date) return toast("Informe a data da partida.");
    if (!match.opponent) return toast("Informe o adversário.");

    try {
      match = await saveMatchOnline(match);
      state.matches.unshift(match);
      saveMatches();
      e.target.reset();
      renderAll();
      toast(state.cloudEnabled ? "Partida salva no banco online." : "Partida salva localmente.");
    } catch (error) {
      console.error(error);
      toast("Erro ao salvar partida no banco online.");
    }
  });
  $("#adminForm").addEventListener("submit", e=>{
    e.preventDefault();
    if (!requirePeople()) return;
    const old = $("#adminEditName").value;
    const name = $("#adminName").value.trim();
    const password = $("#adminPassword").value.trim();
    const role = $("#adminRole").value;
    const active = $("#adminActive").value === "true";
    if (!name || !password) return toast("Informe nome e senha.");
    if (["adm master","lukas"].includes(norm(name))) return toast("Admin Master é protegido.");
    const obj = {name, password, role, active, fixed:false};
    if (old) state.admins = state.admins.map(a=>a.name===old?obj:a);
    else {
      if (state.admins.some(a=>norm(a.name)===norm(name))) return toast("Administrador já existe.");
      state.admins.push(obj);
    }
    saveAdmins(); clearAdminForm(); renderAll(); toast("Administrador salvo.");
  });
  $("#clearAdminForm").addEventListener("click", clearAdminForm);

  ["frameEnabled","frameColor","frameSize","frameRadius","frameStyle","frameShadow"].forEach(id=>{
    $("#"+id).addEventListener("input", ()=>{
      if (!requireVisual()) { renderSettings(); return; }
      state.settings.frameEnabled = $("#frameEnabled").checked;
      state.settings.frameColor = $("#frameColor").value;
      state.settings.frameSize = +$("#frameSize").value;
      state.settings.frameRadius = +$("#frameRadius").value;
      state.settings.frameStyle = $("#frameStyle").value;
      state.settings.frameShadow = $("#frameShadow").checked;
      saveSettings(); applyFrame(); renderSettings();
    });
  });
  $("#restoreFrameDefault").addEventListener("click", ()=>{
    if (!requireVisual()) return;
    Object.assign(state.settings, {frameEnabled:true, frameColor:"#ff1e2d", frameSize:2, frameRadius:28, frameStyle:"solid", frameShadow:true});
    saveSettings(); applyFrame(); renderSettings(); toast("Moldura padrão restaurada.");
  });

  window.addEventListener("beforeinstallprompt", e=>{
    e.preventDefault();
    state.deferredPrompt = e;
    if ($("#installBtn")) $("#installBtn").style.display = "";
  });
  async function runInstallFlow(){
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) return toast("App já instalado.");
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
    } else {
      $("#installModal").classList.add("show");
    }
  }

  $("#installBtn")?.addEventListener("click", runInstallFlow);
  $("#installHomeBtn")?.addEventListener("click", runInstallFlow);

  $("#mobileMenuBtn")?.addEventListener("click", (event)=>{
    event.stopPropagation();
    const nav = $("#mainNav");
    const opened = nav.classList.toggle("open");
    $("#mobileMenuBtn").setAttribute("aria-expanded", opened ? "true" : "false");
  });

  document.addEventListener("click", (event)=>{
    const nav = $("#mainNav");
    const btn = $("#mobileMenuBtn");
    if (!nav || !btn) return;
    if (nav.classList.contains("open") && !nav.contains(event.target) && !btn.contains(event.target)) {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
  $("#closeInstallModal").addEventListener("click", ()=>$("#installModal").classList.remove("show"));
}

function registerSW(){
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", ()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
  }
}

async function start(){
  await initData();
  setupEvents();
  registerSW();
  await renderAll();
  navigate(state.page);
}
start();
