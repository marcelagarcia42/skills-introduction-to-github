"use strict";

/* ---------- Constants / storage ---------- */

const PROJECTS_KEY = "bookStudio.projects";
const AI_CONFIG_KEY = "bookStudio.aiConfig";
const REFERENCE_MAX_CHARS = 20000;
const REFERENCE_CONTEXT_CHARS = 12000;

const THEMES = [
  { id: "ficcao", label: "Ficção literária", kind: "narrativa", emoji: "📖" },
  { id: "fantasia", label: "Fantasia", kind: "narrativa", emoji: "🐉" },
  { id: "romance", label: "Romance", kind: "narrativa", emoji: "💞" },
  { id: "suspense", label: "Suspense / Mistério", kind: "narrativa", emoji: "🔎" },
  { id: "infantil", label: "Infantil / Juvenil", kind: "narrativa", emoji: "🧸" },
  { id: "biografia", label: "Biografia / Memórias", kind: "narrativa", emoji: "🕰️" },
  { id: "mindset", label: "Mindset / Desenvolvimento pessoal", kind: "conteudo", emoji: "🧠" },
  { id: "negocios", label: "Negócios / Carreira", kind: "conteudo", emoji: "💼" },
  { id: "autoajuda", label: "Autoajuda / Espiritualidade", kind: "conteudo", emoji: "✨" },
  { id: "outro", label: "Outro / Não-ficção geral", kind: "conteudo", emoji: "📝" },
];

const QUICK_ACTIONS_NARRATIVA = [
  { label: "Sugerir personagens que faltam", prompt: "Com base no que já defini sobre a história, sugira 2 ou 3 personagens que ainda podem estar faltando, explicando o papel de cada um e o que ele representaria na trama." },
  { label: "Desenvolver arco de um personagem", prompt: "Escolha o personagem mais central que eu já cadastrei e proponha um arco de transformação completo para ele, do início ao fim da história." },
  { label: "Sugerir o conflito central", prompt: "Com base no que já escrevi, sugira possíveis versões para o conflito central da história e explique os prós e contras de cada uma." },
  { label: "Criar um esboço de capítulos", prompt: "Crie um esboço de capítulos para este livro, considerando o tipo de narrativa e o tipo de escrita que escolhi." },
  { label: "Analisar o livro anterior", prompt: "Analise o trecho do meu livro anterior que enviei como referência e me diga quais elementos de estilo, tom e vocabulário eu deveria manter neste novo livro." },
];

const QUICK_ACTIONS_CONTEUDO = [
  { label: "Sugerir estrutura de capítulos", prompt: "Com base nas respostas que já dei, sugira uma estrutura completa de capítulos (pilares) para este livro, na ordem ideal de leitura." },
  { label: "Aprofundar um pilar", prompt: "Escolha o pilar mais importante que já cadastrei e desenvolva os pontos principais, exemplos e um possível exercício prático para ele." },
  { label: "Sugerir exercícios práticos", prompt: "Sugira exercícios práticos e reflexões que o leitor pode fazer ao longo do livro, conectados à transformação que quero proporcionar." },
  { label: "Analisar o livro anterior", prompt: "Analise o trecho do meu livro anterior que enviei como referência e me diga quais elementos de estilo, tom e estrutura eu deveria manter neste novo livro." },
];

let state = {
  projects: [],
  currentProjectId: null,
};

/* ---------- Utilities ---------- */

function uuid() {
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch (e) {
    return "";
  }
}

function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[THEMES.length - 1];
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2500);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const screen = document.getElementById(id);
  screen.classList.add("active");

  const tabBar = document.getElementById("tab-bar");
  const tab = screen.dataset.tab;
  tabBar.hidden = !tab;
  document.querySelectorAll(".tab-bar-btn").forEach((btn) => {
    const target = document.getElementById(btn.dataset.target);
    btn.classList.toggle("active", !!tab && target && target.dataset.tab === tab);
  });
}

function navigateTab(target) {
  if (target === "screen-home") renderHomeList();
  if (target === "screen-settings") renderSettingsScreen();
  showScreen(target);
}

document.querySelectorAll(".tab-bar-btn").forEach((btn) => {
  btn.addEventListener("click", () => navigateTab(btn.dataset.target));
});

document.querySelectorAll(".btn-back").forEach((btn) => {
  btn.addEventListener("click", () => navigateTab(btn.dataset.backTo));
});

/* ---------- Storage: projects ---------- */

function loadProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    state.projects = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.projects = [];
  }
}

function saveProjects() {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(state.projects));
    return true;
  } catch (e) {
    showToast("Armazenamento cheio! Remova alguma referência grande para liberar espaço.");
    return false;
  }
}

function getCurrentProject() {
  return state.projects.find((p) => p.id === state.currentProjectId);
}

function touch(project) {
  project.updatedAt = Date.now();
}

function createProject(title, themeId, synopsis) {
  return {
    id: uuid(),
    title: title.trim(),
    themeId,
    synopsis: (synopsis || "").trim(),
    audience: "",
    tone: "",
    writingType: "Primeira pessoa",
    narrativeType: "Linear / cronológica",
    storyGuide: { conflict: "", setting: "", theme: "", turningPoint: "", ending: "" },
    characters: [],
    structure: { transformation: "", pain: "", beliefs: "", exercises: "", cases: "", beforeAfter: "", idealReader: "" },
    pillars: [],
    reference: null,
    chat: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/* ---------- Home: book list ---------- */

function renderHomeList() {
  const list = document.getElementById("book-list");
  const empty = document.getElementById("empty-state");
  const term = (document.getElementById("search-input").value || "").toLowerCase();

  const projects = state.projects
    .filter((p) => p.title.toLowerCase().includes(term))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  list.innerHTML = "";
  empty.hidden = state.projects.length > 0;

  projects.forEach((p) => {
    const theme = getTheme(p.themeId);
    const count = theme.kind === "narrativa"
      ? `${p.characters.length} personagem(ns)`
      : `${p.pillars.length} pilar(es)`;

    const card = document.createElement("div");
    card.className = "house-card";
    card.innerHTML = `
      <div class="avatar">${theme.emoji}</div>
      <div class="house-info">
        <p class="house-name">${escapeHtml(p.title)}</p>
        <p class="house-address">${escapeHtml(theme.label)}</p>
      </div>
      <div class="house-meta">
        <p class="meta-top">${count}</p>
        <p class="meta-bottom">${formatDate(p.updatedAt)}</p>
      </div>`;
    card.addEventListener("click", () => openBookDetail(p.id));
    list.appendChild(card);
  });
}

document.getElementById("search-input").addEventListener("input", renderHomeList);

/* ---------- New book ---------- */

function populateThemeSelect() {
  const sel = document.getElementById("select-book-theme");
  sel.innerHTML = "";
  const narrGroup = document.createElement("optgroup");
  narrGroup.label = "Narrativa (ficção)";
  const contGroup = document.createElement("optgroup");
  contGroup.label = "Conteúdo (não-ficção / mindset)";
  THEMES.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${t.emoji} ${t.label}`;
    (t.kind === "narrativa" ? narrGroup : contGroup).appendChild(opt);
  });
  sel.appendChild(narrGroup);
  sel.appendChild(contGroup);
  updateThemeHint();
}

function updateThemeHint() {
  const theme = getTheme(document.getElementById("select-book-theme").value);
  document.getElementById("theme-hint").textContent = theme.kind === "narrativa"
    ? "Esse tipo de livro terá uma aba de Personagens: nome, papel na história e o que cada um representa."
    : "Esse tipo de livro terá uma aba de Estrutura: perguntas para organizar a transformação do leitor, as dores dele e os pilares/capítulos do método.";
}

document.getElementById("select-book-theme").addEventListener("change", updateThemeHint);

document.getElementById("btn-add-book").addEventListener("click", () => {
  document.getElementById("book-setup-form").reset();
  populateThemeSelect();
  showScreen("screen-book-setup");
});

document.getElementById("book-setup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("input-book-title").value.trim();
  if (!title) return;
  const themeId = document.getElementById("select-book-theme").value;
  const synopsis = document.getElementById("input-book-synopsis").value;
  const project = createProject(title, themeId, synopsis);
  state.projects.push(project);
  saveProjects();
  openBookDetail(project.id);
});

/* ---------- Book detail: navigation + rendering ---------- */

function openBookDetail(id) {
  state.currentProjectId = id;
  selectDetailTab("tab-overview");
  renderBookDetail();
  showScreen("screen-book-detail");
}

function selectDetailTab(tabId) {
  document.querySelectorAll("#screen-book-detail .tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));
  document.querySelectorAll("#screen-book-detail .tab-content").forEach((c) => c.classList.toggle("active", c.id === tabId));
}

document.querySelectorAll("#screen-book-detail .tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => selectDetailTab(btn.dataset.tab));
});

document.getElementById("btn-delete-book").addEventListener("click", () => {
  const p = getCurrentProject();
  if (!p) return;
  if (confirm(`Excluir "${p.title}"? Isso apaga personagens/estrutura, referência e conversas com a IA deste livro. Essa ação não pode ser desfeita.`)) {
    state.projects = state.projects.filter((x) => x.id !== p.id);
    saveProjects();
    navigateTab("screen-home");
  }
});

function renderBookDetail() {
  const p = getCurrentProject();
  if (!p) return;
  const theme = getTheme(p.themeId);

  document.getElementById("detail-title").textContent = p.title;
  document.getElementById("detail-theme-label").textContent = `${theme.emoji} ${theme.label}`;

  const charTabBtn = document.querySelector('.tab-btn[data-tab="tab-characters"]');
  const structTabBtn = document.querySelector('.tab-btn[data-tab="tab-structure"]');
  const isNarrativa = theme.kind === "narrativa";
  charTabBtn.hidden = !isNarrativa;
  structTabBtn.hidden = isNarrativa;

  const activeBtn = document.querySelector("#screen-book-detail .tab-btn.active");
  if (activeBtn && activeBtn.hidden) selectDetailTab("tab-overview");

  // Overview
  document.getElementById("input-overview-synopsis").value = p.synopsis;
  document.getElementById("input-overview-audience").value = p.audience;
  document.getElementById("input-overview-tone").value = p.tone;
  updateOverviewStats();

  // Story guide + characters
  document.getElementById("input-story-conflict").value = p.storyGuide.conflict;
  document.getElementById("input-story-setting").value = p.storyGuide.setting;
  document.getElementById("input-story-theme").value = p.storyGuide.theme;
  document.getElementById("input-story-turningpoint").value = p.storyGuide.turningPoint;
  document.getElementById("input-story-ending").value = p.storyGuide.ending;
  hideCharacterForm();
  renderCharacterList();

  // Structure + pillars
  document.getElementById("input-struct-transformation").value = p.structure.transformation;
  document.getElementById("input-struct-pain").value = p.structure.pain;
  document.getElementById("input-struct-beliefs").value = p.structure.beliefs;
  document.getElementById("input-struct-exercises").value = p.structure.exercises;
  document.getElementById("input-struct-cases").value = p.structure.cases;
  document.getElementById("input-struct-beforeafter").value = p.structure.beforeAfter;
  document.getElementById("input-struct-idealreader").value = p.structure.idealReader;
  hidePillarForm();
  renderPillarList();

  // Style
  document.getElementById("input-writing-type").value = p.writingType;
  document.getElementById("input-narrative-type").value = p.narrativeType;

  // Reference
  renderReference();

  // AI
  renderQuickActions();
  renderChat();
  updateAIKeyWarning();
}

function updateOverviewStats() {
  const p = getCurrentProject();
  const theme = getTheme(p.themeId);
  const count = theme.kind === "narrativa"
    ? `${p.characters.length} personagem(ns) cadastrados.`
    : `${p.pillars.length} pilar(es) cadastrados.`;
  document.getElementById("overview-stats").textContent = `Criado em ${formatDate(p.createdAt)}. ${count}`;
}

document.getElementById("form-overview").addEventListener("submit", (e) => {
  e.preventDefault();
  const p = getCurrentProject();
  p.synopsis = document.getElementById("input-overview-synopsis").value;
  p.audience = document.getElementById("input-overview-audience").value;
  p.tone = document.getElementById("input-overview-tone").value;
  touch(p);
  saveProjects();
  showToast("Visão geral salva.");
});

document.getElementById("form-story-guide").addEventListener("submit", (e) => {
  e.preventDefault();
  const p = getCurrentProject();
  p.storyGuide = {
    conflict: document.getElementById("input-story-conflict").value,
    setting: document.getElementById("input-story-setting").value,
    theme: document.getElementById("input-story-theme").value,
    turningPoint: document.getElementById("input-story-turningpoint").value,
    ending: document.getElementById("input-story-ending").value,
  };
  touch(p);
  saveProjects();
  showToast("Perguntas guia salvas.");
});

document.getElementById("form-structure").addEventListener("submit", (e) => {
  e.preventDefault();
  const p = getCurrentProject();
  p.structure = {
    transformation: document.getElementById("input-struct-transformation").value,
    pain: document.getElementById("input-struct-pain").value,
    beliefs: document.getElementById("input-struct-beliefs").value,
    exercises: document.getElementById("input-struct-exercises").value,
    cases: document.getElementById("input-struct-cases").value,
    beforeAfter: document.getElementById("input-struct-beforeafter").value,
    idealReader: document.getElementById("input-struct-idealreader").value,
  };
  touch(p);
  saveProjects();
  showToast("Estrutura salva.");
});

document.getElementById("form-style").addEventListener("submit", (e) => {
  e.preventDefault();
  const p = getCurrentProject();
  p.writingType = document.getElementById("input-writing-type").value;
  p.narrativeType = document.getElementById("input-narrative-type").value;
  touch(p);
  saveProjects();
  showToast("Estilo salvo.");
});

/* ---------- Characters ---------- */

function renderCharacterList() {
  const p = getCurrentProject();
  const list = document.getElementById("character-list");
  const empty = document.getElementById("characters-empty");
  list.innerHTML = "";
  empty.hidden = p.characters.length > 0;

  p.characters.forEach((c) => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <div class="item-main">
        <span class="role-badge">${escapeHtml(c.role)}</span>
        <div class="item-title">${escapeHtml(c.name)}</div>
        ${c.represents ? `<div class="item-value">Representa: ${escapeHtml(c.represents)}</div>` : ""}
      </div>
      <button type="button" title="Excluir">🗑</button>`;
    row.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      openCharacterForm(c.id);
    });
    row.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteCharacter(c.id);
    });
    list.appendChild(row);
  });
}

function hideCharacterForm() {
  const form = document.getElementById("character-form");
  form.hidden = true;
  form.reset();
  document.getElementById("input-char-id").value = "";
}

function openCharacterForm(id) {
  const form = document.getElementById("character-form");
  if (id) {
    const p = getCurrentProject();
    const c = p.characters.find((x) => x.id === id);
    document.getElementById("input-char-id").value = c.id;
    document.getElementById("input-char-name").value = c.name;
    document.getElementById("input-char-role").value = c.role;
    document.getElementById("input-char-represents").value = c.represents;
    document.getElementById("input-char-description").value = c.description;
    document.getElementById("input-char-goal").value = c.goal;
    document.getElementById("input-char-conflict").value = c.conflict;
    document.getElementById("input-char-arc").value = c.arc;
  } else {
    form.reset();
    document.getElementById("input-char-id").value = "";
  }
  form.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.getElementById("btn-add-character").addEventListener("click", () => openCharacterForm(null));
document.getElementById("btn-cancel-character").addEventListener("click", hideCharacterForm);

document.getElementById("character-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const p = getCurrentProject();
  const id = document.getElementById("input-char-id").value;
  const data = {
    name: document.getElementById("input-char-name").value.trim(),
    role: document.getElementById("input-char-role").value,
    represents: document.getElementById("input-char-represents").value.trim(),
    description: document.getElementById("input-char-description").value,
    goal: document.getElementById("input-char-goal").value,
    conflict: document.getElementById("input-char-conflict").value,
    arc: document.getElementById("input-char-arc").value,
  };
  if (!data.name) return;
  if (id) {
    Object.assign(p.characters.find((c) => c.id === id), data);
  } else {
    data.id = uuid();
    p.characters.push(data);
  }
  touch(p);
  saveProjects();
  hideCharacterForm();
  renderCharacterList();
  updateOverviewStats();
  showToast("Personagem salvo.");
});

function deleteCharacter(id) {
  const p = getCurrentProject();
  const c = p.characters.find((x) => x.id === id);
  if (!c) return;
  if (!confirm(`Remover o personagem "${c.name}"?`)) return;
  p.characters = p.characters.filter((x) => x.id !== id);
  touch(p);
  saveProjects();
  hideCharacterForm();
  renderCharacterList();
  updateOverviewStats();
}

/* ---------- Pillars ---------- */

function renderPillarList() {
  const p = getCurrentProject();
  const list = document.getElementById("pillar-list");
  const empty = document.getElementById("pillars-empty");
  list.innerHTML = "";
  empty.hidden = p.pillars.length > 0;

  p.pillars.forEach((pl) => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <div class="item-main">
        <div class="item-title">${escapeHtml(pl.title)}</div>
        ${pl.description ? `<div class="item-value">${escapeHtml(pl.description)}</div>` : ""}
      </div>
      <button type="button" title="Excluir">🗑</button>`;
    row.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      openPillarForm(pl.id);
    });
    row.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      deletePillar(pl.id);
    });
    list.appendChild(row);
  });
}

function hidePillarForm() {
  const form = document.getElementById("pillar-form");
  form.hidden = true;
  form.reset();
  document.getElementById("input-pillar-id").value = "";
}

function openPillarForm(id) {
  const form = document.getElementById("pillar-form");
  if (id) {
    const p = getCurrentProject();
    const pl = p.pillars.find((x) => x.id === id);
    document.getElementById("input-pillar-id").value = pl.id;
    document.getElementById("input-pillar-title").value = pl.title;
    document.getElementById("input-pillar-description").value = pl.description;
  } else {
    form.reset();
    document.getElementById("input-pillar-id").value = "";
  }
  form.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.getElementById("btn-add-pillar").addEventListener("click", () => openPillarForm(null));
document.getElementById("btn-cancel-pillar").addEventListener("click", hidePillarForm);

document.getElementById("pillar-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const p = getCurrentProject();
  const id = document.getElementById("input-pillar-id").value;
  const data = {
    title: document.getElementById("input-pillar-title").value.trim(),
    description: document.getElementById("input-pillar-description").value,
  };
  if (!data.title) return;
  if (id) {
    Object.assign(p.pillars.find((x) => x.id === id), data);
  } else {
    data.id = uuid();
    p.pillars.push(data);
  }
  touch(p);
  saveProjects();
  hidePillarForm();
  renderPillarList();
  updateOverviewStats();
  showToast("Pilar salvo.");
});

function deletePillar(id) {
  const p = getCurrentProject();
  const pl = p.pillars.find((x) => x.id === id);
  if (!pl) return;
  if (!confirm(`Remover o pilar "${pl.title}"?`)) return;
  p.pillars = p.pillars.filter((x) => x.id !== id);
  touch(p);
  saveProjects();
  hidePillarForm();
  renderPillarList();
  updateOverviewStats();
}

/* ---------- Reference (previous book) ---------- */

let pdfjsLoadPromise = null;
let mammothLoadPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar biblioteca externa"));
    document.head.appendChild(s);
  });
}

async function ensurePdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  if (!pdfjsLoadPromise) {
    pdfjsLoadPromise = loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js").then(() => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    });
  }
  await pdfjsLoadPromise;
  return window.pdfjsLib;
}

async function ensureMammoth() {
  if (window.mammoth) return window.mammoth;
  if (!mammothLoadPromise) {
    mammothLoadPromise = loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");
  }
  await mammothLoadPromise;
  return window.mammoth;
}

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || file.type === "text/plain") {
    return await file.text();
  }
  if (name.endsWith(".pdf")) {
    const pdfjsLib = await ensurePdfJs();
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    const maxPages = Math.min(pdf.numPages, 80);
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(" ") + "\n\n";
      if (text.length > REFERENCE_MAX_CHARS * 2) break;
    }
    return text;
  }
  if (name.endsWith(".docx")) {
    const mammoth = await ensureMammoth();
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  }
  throw new Error("Formato não suportado — use .txt, .pdf ou .docx");
}

function saveReference(source, fileName, text) {
  const p = getCurrentProject();
  const truncated = text.length > REFERENCE_MAX_CHARS;
  p.reference = {
    source,
    fileName: fileName || null,
    text: text.slice(0, REFERENCE_MAX_CHARS),
    truncated,
    addedAt: Date.now(),
  };
  touch(p);
  saveProjects();
  renderReference();
}

function renderReference() {
  const p = getCurrentProject();
  const card = document.getElementById("reference-current");
  const preview = document.getElementById("reference-preview");
  document.getElementById("reference-file-status").hidden = true;

  if (p.reference && p.reference.text) {
    card.hidden = false;
    const label = p.reference.fileName ? `Arquivo: ${p.reference.fileName}` : "Texto colado manualmente";
    const snippet = p.reference.text.slice(0, 600);
    preview.textContent = `${label} — ${p.reference.text.length.toLocaleString("pt-BR")} caracteres salvos\n\n${snippet}${p.reference.text.length > 600 ? "…" : ""}`;
  } else {
    card.hidden = true;
  }
}

document.getElementById("input-reference-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const status = document.getElementById("reference-file-status");
  status.hidden = false;
  status.textContent = `Lendo "${file.name}"...`;
  try {
    const text = await extractTextFromFile(file);
    if (!text || !text.trim()) throw new Error("Não encontramos texto nesse arquivo.");
    saveReference("file", file.name, text);
    status.hidden = true;
    showToast(`"${file.name}" processado com sucesso.`);
  } catch (err) {
    status.textContent = `Não foi possível ler esse arquivo automaticamente (${err.message || err}). Use a opção de colar texto abaixo.`;
  }
  e.target.value = "";
});

document.getElementById("btn-save-reference-paste").addEventListener("click", () => {
  const textarea = document.getElementById("input-reference-paste");
  const text = textarea.value.trim();
  if (!text) return;
  saveReference("paste", null, text);
  textarea.value = "";
  showToast("Texto de referência salvo.");
});

document.getElementById("btn-remove-reference").addEventListener("click", () => {
  const p = getCurrentProject();
  if (!confirm("Remover o material de referência deste livro?")) return;
  p.reference = null;
  touch(p);
  saveProjects();
  renderReference();
});

/* ---------- AI assistant ---------- */

function getAIConfig() {
  try {
    const cfg = JSON.parse(localStorage.getItem(AI_CONFIG_KEY));
    return cfg && typeof cfg === "object" ? cfg : { model: "claude-sonnet-5", apiKey: "" };
  } catch (e) {
    return { model: "claude-sonnet-5", apiKey: "" };
  }
}

function saveAIConfig(cfg) {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg));
}

function updateAIKeyWarning() {
  const cfg = getAIConfig();
  document.getElementById("ai-key-warning").hidden = !!cfg.apiKey;
}

document.getElementById("btn-goto-settings-from-ai").addEventListener("click", () => navigateTab("screen-settings"));

document.getElementById("form-ai-config").addEventListener("submit", (e) => {
  e.preventDefault();
  const model = document.getElementById("input-ai-model").value.trim() || "claude-sonnet-5";
  const apiKey = document.getElementById("input-ai-key").value.trim();
  saveAIConfig({ model, apiKey });
  updateAIKeyWarning();
  showToast("Configuração de IA salva.");
});

function renderQuickActions() {
  const p = getCurrentProject();
  const theme = getTheme(p.themeId);
  const container = document.getElementById("ai-quick-actions");
  container.innerHTML = "";
  const actions = theme.kind === "narrativa" ? QUICK_ACTIONS_NARRATIVA : QUICK_ACTIONS_CONTEUDO;
  actions.forEach((a) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = a.label;
    btn.addEventListener("click", () => sendChatMessage(a.prompt));
    container.appendChild(btn);
  });
}

function renderChat() {
  const p = getCurrentProject();
  const container = document.getElementById("chat-messages");
  container.innerHTML = "";
  if (!p.chat.length) {
    const hint = document.createElement("p");
    hint.className = "empty-state";
    hint.style.padding = "24px 8px";
    hint.textContent = "Use os botões acima ou escreva sua pergunta para começar a conversar com o assistente.";
    container.appendChild(hint);
    return;
  }
  p.chat.forEach((m) => {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${m.role}`;
    bubble.textContent = m.content;
    container.appendChild(bubble);
  });
  container.scrollTop = container.scrollHeight;
}

function buildSystemPrompt(p) {
  const theme = getTheme(p.themeId);
  const lines = [];
  lines.push("Você é um assistente de escrita que responde sempre em português do Brasil, ajudando o autor a desenvolver e estruturar o livro descrito abaixo.");
  lines.push("Seja específico e prático. Baseie-se no que já foi definido; quando faltar informação, faça perguntas objetivas em vez de inventar detalhes que possam contradizer decisões do autor.");
  lines.push("");
  lines.push("## Dados do livro");
  lines.push(`Título: ${p.title}`);
  lines.push(`Gênero/tema: ${theme.label}`);
  if (p.synopsis) lines.push(`Sinopse: ${p.synopsis}`);
  if (p.audience) lines.push(`Público-alvo: ${p.audience}`);
  if (p.tone) lines.push(`Tom de voz: ${p.tone}`);
  lines.push(`Tipo de escrita (ponto de vista): ${p.writingType}`);
  lines.push(`Tipo de narrativa (estrutura): ${p.narrativeType}`);

  if (theme.kind === "narrativa") {
    const g = p.storyGuide;
    if (g.conflict || g.setting || g.theme || g.turningPoint || g.ending) {
      lines.push("");
      lines.push("## Perguntas guia da narrativa");
      if (g.conflict) lines.push(`Conflito central: ${g.conflict}`);
      if (g.setting) lines.push(`Cenário: ${g.setting}`);
      if (g.theme) lines.push(`Tema/mensagem central: ${g.theme}`);
      if (g.turningPoint) lines.push(`Ponto de virada: ${g.turningPoint}`);
      if (g.ending) lines.push(`Desfecho: ${g.ending}`);
    }
    if (p.characters.length) {
      lines.push("");
      lines.push("## Personagens");
      p.characters.forEach((c) => {
        lines.push(`- ${c.name} (${c.role})${c.represents ? " — representa: " + c.represents : ""}`);
        if (c.description) lines.push(`  Descrição: ${c.description}`);
        if (c.goal) lines.push(`  Objetivo/motivação: ${c.goal}`);
        if (c.conflict) lines.push(`  Conflito interno: ${c.conflict}`);
        if (c.arc) lines.push(`  Arco de transformação: ${c.arc}`);
      });
    }
  } else {
    const s = p.structure;
    lines.push("");
    lines.push("## Estrutura de conteúdo");
    if (s.transformation) lines.push(`Transformação prometida ao leitor: ${s.transformation}`);
    if (s.pain) lines.push(`Dor/problema do leitor hoje: ${s.pain}`);
    if (s.beliefs) lines.push(`Crenças limitantes a desconstruir: ${s.beliefs}`);
    if (s.exercises) lines.push(`Exercícios práticos previstos: ${s.exercises}`);
    if (s.cases) lines.push(`Histórias/estudos de caso previstos: ${s.cases}`);
    if (s.beforeAfter) lines.push(`Resumo "antes e depois": ${s.beforeAfter}`);
    if (s.idealReader) lines.push(`Leitor ideal: ${s.idealReader}`);
    if (p.pillars.length) {
      lines.push("");
      lines.push("## Pilares / capítulos centrais");
      p.pillars.forEach((pl) => {
        lines.push(`- ${pl.title}${pl.description ? ": " + pl.description : ""}`);
      });
    }
  }

  if (p.reference && p.reference.text) {
    lines.push("");
    lines.push("## Trecho de referência (livro anterior do autor, use para entender assunto/estilo)");
    lines.push(p.reference.text.slice(0, REFERENCE_CONTEXT_CHARS));
  }

  return lines.join("\n");
}

async function callClaude(systemPrompt, messages, cfg) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": cfg.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: cfg.model || "claude-sonnet-5",
      max_tokens: 1200,
      system: systemPrompt,
      messages: messages.length ? messages : [{ role: "user", content: "Olá" }],
    }),
  });

  if (!resp.ok) {
    let detail = "";
    try {
      const j = await resp.json();
      detail = (j.error && j.error.message) || JSON.stringify(j);
    } catch (e) {
      detail = await resp.text();
    }
    throw new Error(`Erro da API (${resp.status}): ${detail.slice(0, 300)}`);
  }

  const data = await resp.json();
  const block = (data.content || []).find((b) => b.type === "text");
  return block ? block.text : "(resposta vazia)";
}

async function sendChatMessage(userText) {
  const p = getCurrentProject();
  const cfg = getAIConfig();
  if (!cfg.apiKey) {
    updateAIKeyWarning();
    showToast("Configure sua chave de API em Ajustes primeiro.");
    return;
  }

  p.chat.push({ role: "user", content: userText, ts: Date.now() });
  touch(p);
  saveProjects();
  renderChat();

  const container = document.getElementById("chat-messages");
  const loadingBubble = document.createElement("div");
  loadingBubble.className = "chat-bubble assistant";
  loadingBubble.textContent = "Pensando...";
  container.appendChild(loadingBubble);
  container.scrollTop = container.scrollHeight;

  try {
    const systemPrompt = buildSystemPrompt(p);
    const history = p.chat
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-16)
      .map((m) => ({ role: m.role, content: m.content }));
    const reply = await callClaude(systemPrompt, history, cfg);
    p.chat.push({ role: "assistant", content: reply, ts: Date.now() });
  } catch (err) {
    p.chat.push({ role: "system", content: `⚠️ ${err.message || "Erro ao falar com a IA."}`, ts: Date.now() });
  }
  touch(p);
  saveProjects();
  renderChat();
}

document.getElementById("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const textarea = document.getElementById("input-chat-message");
  const msg = textarea.value.trim();
  if (!msg) return;
  textarea.value = "";
  sendChatMessage(msg);
});

document.getElementById("btn-clear-chat").addEventListener("click", () => {
  const p = getCurrentProject();
  if (!p.chat.length) return;
  if (!confirm("Limpar toda a conversa com a IA deste livro?")) return;
  p.chat = [];
  touch(p);
  saveProjects();
  renderChat();
});

/* ---------- Settings ---------- */

function renderSettingsScreen() {
  const cfg = getAIConfig();
  document.getElementById("input-ai-model").value = cfg.model || "";
  document.getElementById("input-ai-key").value = cfg.apiKey || "";
  renderStorageInfo();
}

document.getElementById("btn-export").onclick = () => {
  const data = JSON.stringify({ projects: state.projects }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `estudio-do-livro-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

document.getElementById("input-import").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      const importedProjects = Array.isArray(imported) ? imported : imported.projects;
      if (!Array.isArray(importedProjects)) throw new Error("Formato inválido");
      const merge = confirm(
        "MESCLAR este backup com seus livros atuais?\n\nOK = mesclar (adiciona os livros do backup)\nCancelar = SUBSTITUIR tudo pelo backup"
      );
      state.projects = merge ? state.projects.concat(importedProjects) : importedProjects;
      saveProjects();
      renderHomeList();
      renderStorageInfo();
      showToast("Backup importado com sucesso!");
    } catch (err) {
      alert("Não foi possível ler esse arquivo de backup.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById("btn-reset-all").onclick = () => {
  if (confirm("Isso vai apagar TODOS os livros, personagens, estrutura e a chave de IA salva. Essa ação não pode ser desfeita. Continuar?")) {
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(AI_CONFIG_KEY);
    location.reload();
  }
};

function renderStorageInfo() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY) || "";
    const kb = Math.round((raw.length * 2) / 1024);
    document.getElementById("storage-info").textContent = `${state.projects.length} livro(s) salvos neste navegador · ~${kb} KB usados`;
  } catch (e) {
    document.getElementById("storage-info").textContent = "";
  }
}

/* ---------- Init ---------- */

loadProjects();
populateThemeSelect();
renderHomeList();
updateAIKeyWarning();
showScreen("screen-home");
