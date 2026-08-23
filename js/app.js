"use strict";

/* ---------- Constantes / armazenamento ---------- */

const STORAGE_KEY = "cleaningOrganizer.houses";
const PIN_KEY = "cleaningOrganizer.pin";
const MAX_PHOTO_DIMENSION = 1000; // px - fotos são redimensionadas antes de salvar
const PHOTO_QUALITY = 0.7;

let state = {
  houses: [],
  currentHouseId: null,
  currentTab: "tab-info",
  revealedCodes: new Set(),
};

/* ---------- Utilidades ---------- */

function uuid() {
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

function loadHouses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.houses = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.houses = [];
  }
}

function saveHouses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.houses));
    return true;
  } catch (e) {
    showToast("Armazenamento cheio! Apague fotos antigas para liberar espaço.");
    return false;
  }
}

function getHouse(id) {
  return state.houses.find((h) => h.id === id);
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
  document.getElementById(id).classList.add("active");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* ---------- PIN / Bloqueio ---------- */

function initLockScreen() {
  const savedPin = localStorage.getItem(PIN_KEY);
  const instructions = document.getElementById("lock-instructions");
  const input = document.getElementById("lock-input");
  const errorEl = document.getElementById("lock-error");
  const forgotBtn = document.getElementById("lock-forgot");

  let mode = savedPin ? "unlock" : "create";
  instructions.textContent = mode === "create"
    ? "Crie um PIN para proteger suas senhas (4 a 8 dígitos)"
    : "Digite seu PIN para entrar";
  forgotBtn.hidden = mode === "create";

  let pendingFirstPin = null;

  function attempt() {
    const value = input.value.trim();
    errorEl.textContent = "";

    if (mode === "create") {
      if (value.length < 4) {
        errorEl.textContent = "O PIN deve ter pelo menos 4 dígitos.";
        return;
      }
      if (!pendingFirstPin) {
        pendingFirstPin = value;
        input.value = "";
        instructions.textContent = "Digite o PIN novamente para confirmar";
        return;
      }
      if (pendingFirstPin !== value) {
        errorEl.textContent = "Os PINs não coincidem. Tente de novo.";
        pendingFirstPin = null;
        input.value = "";
        instructions.textContent = "Crie um PIN para proteger suas senhas (4 a 8 dígitos)";
        return;
      }
      localStorage.setItem(PIN_KEY, value);
      unlockApp();
      return;
    }

    // mode === unlock
    if (value === savedPin) {
      unlockApp();
    } else {
      errorEl.textContent = "PIN incorreto.";
      input.value = "";
    }
  }

  document.getElementById("lock-submit").onclick = attempt;
  input.onkeydown = (e) => { if (e.key === "Enter") attempt(); };

  forgotBtn.onclick = () => {
    if (confirm("Isso vai apagar o PIN atual (seus dados de casas continuam salvos). Deseja continuar?")) {
      localStorage.removeItem(PIN_KEY);
      initLockScreen();
    }
  };

  showScreen("screen-lock");
  setTimeout(() => input.focus(), 100);
}

function unlockApp() {
  loadHouses();
  renderHomeList();
  showScreen("screen-home");
}

/* ---------- Navegação genérica ---------- */

document.addEventListener("click", (e) => {
  const backBtn = e.target.closest(".btn-back");
  if (backBtn) {
    showScreen(backBtn.dataset.backTo);
    if (backBtn.dataset.backTo === "screen-home") renderHomeList();
  }
});

/* ---------- Tela inicial: lista de casas ---------- */

function renderHomeList(filterText) {
  const list = document.getElementById("house-list");
  const empty = document.getElementById("empty-state");
  const filter = (filterText ?? document.getElementById("search-input").value ?? "").toLowerCase().trim();

  const houses = state.houses.filter((h) => {
    if (!filter) return true;
    return h.name.toLowerCase().includes(filter) || (h.address || "").toLowerCase().includes(filter);
  });

  list.innerHTML = "";
  empty.hidden = state.houses.length > 0;

  houses.forEach((h) => {
    const card = document.createElement("div");
    card.className = "house-card";
    const thumb = h.photos && h.photos[0]
      ? `<img class="thumb" src="${h.photos[0].dataUrl}" alt="">`
      : `<div class="thumb-placeholder">🏠</div>`;
    card.innerHTML = `
      ${thumb}
      <div class="house-info">
        <p class="house-name">${escapeHtml(h.name)}</p>
        <p class="house-address">${escapeHtml(h.address || "Sem endereço")}</p>
      </div>
    `;
    card.onclick = () => openHouseDetail(h.id);
    list.appendChild(card);
  });
}

document.getElementById("search-input").addEventListener("input", (e) => renderHomeList(e.target.value));

document.getElementById("btn-settings").onclick = () => {
  renderStorageInfo();
  showScreen("screen-settings");
};

/* ---------- Formulário: adicionar / editar casa ---------- */

let editingHouseId = null;

document.getElementById("btn-add-house").onclick = () => {
  editingHouseId = null;
  document.getElementById("house-form-title").textContent = "Nova Casa";
  document.getElementById("input-name").value = "";
  document.getElementById("input-address").value = "";
  document.getElementById("input-notes").value = "";
  showScreen("screen-house-form");
};

document.getElementById("btn-edit-house").onclick = () => {
  const h = getHouse(state.currentHouseId);
  if (!h) return;
  editingHouseId = h.id;
  document.getElementById("house-form-title").textContent = "Editar Casa";
  document.getElementById("input-name").value = h.name;
  document.getElementById("input-address").value = h.address || "";
  document.getElementById("input-notes").value = h.notes || "";
  showScreen("screen-house-form");
};

document.getElementById("house-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("input-name").value.trim();
  const address = document.getElementById("input-address").value.trim();
  const notes = document.getElementById("input-notes").value.trim();
  if (!name) return;

  if (editingHouseId) {
    const h = getHouse(editingHouseId);
    h.name = name;
    h.address = address;
    h.notes = notes;
  } else {
    state.houses.push({
      id: uuid(),
      name, address, notes,
      doorCodes: [],
      checklist: [],
      photos: [],
    });
  }
  saveHouses();

  if (editingHouseId) {
    openHouseDetail(editingHouseId);
  } else {
    renderHomeList();
    showScreen("screen-home");
  }
});

/* ---------- Detalhe da casa ---------- */

function openHouseDetail(id) {
  state.currentHouseId = id;
  const h = getHouse(id);
  if (!h) return;

  document.getElementById("detail-name").textContent = h.name;
  document.getElementById("detail-address").textContent = h.address || "Sem endereço cadastrado";
  document.getElementById("detail-notes").textContent = h.notes || "Sem observações";

  const mapLink = document.getElementById("detail-map-link");
  if (h.address) {
    mapLink.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(h.address);
    mapLink.style.display = "inline-block";
  } else {
    mapLink.style.display = "none";
  }

  switchTab("tab-info");
  renderDoorCodes(h);
  renderChecklist(h);
  renderPhotos(h);

  showScreen("screen-house-detail");
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

function switchTab(tabId) {
  state.currentTab = tabId;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));
  document.querySelectorAll(".tab-content").forEach((c) => c.classList.toggle("active", c.id === tabId));
}

document.getElementById("btn-delete-house").onclick = () => {
  const h = getHouse(state.currentHouseId);
  if (!h) return;
  if (confirm(`Excluir "${h.name}"? Isso vai apagar endereço, senhas, faxina e fotos dessa casa.`)) {
    state.houses = state.houses.filter((x) => x.id !== h.id);
    saveHouses();
    renderHomeList();
    showScreen("screen-home");
  }
};

/* ---------- Senhas das portas ---------- */

function renderDoorCodes(house) {
  const list = document.getElementById("door-codes-list");
  list.innerHTML = "";
  (house.doorCodes || []).forEach((code) => {
    const revealed = state.revealedCodes.has(code.id);
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <div class="item-main">
        <div class="item-title">${escapeHtml(code.label)}</div>
        <div class="item-value ${revealed ? "" : "hidden-value"}">${revealed ? escapeHtml(code.value) : "••••••"}</div>
      </div>
      <button class="btn-reveal" title="Mostrar/ocultar">${revealed ? "🙈" : "👁️"}</button>
      <button class="btn-delete-code" title="Excluir">🗑️</button>
    `;
    row.querySelector(".btn-reveal").onclick = () => {
      if (revealed) state.revealedCodes.delete(code.id);
      else state.revealedCodes.add(code.id);
      renderDoorCodes(house);
    };
    row.querySelector(".btn-delete-code").onclick = () => {
      house.doorCodes = house.doorCodes.filter((c) => c.id !== code.id);
      saveHouses();
      renderDoorCodes(house);
    };
    list.appendChild(row);
  });
}

document.getElementById("door-code-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const h = getHouse(state.currentHouseId);
  if (!h) return;
  const labelInput = document.getElementById("input-code-label");
  const valueInput = document.getElementById("input-code-value");
  const label = labelInput.value.trim();
  const value = valueInput.value.trim();
  if (!label || !value) return;
  h.doorCodes = h.doorCodes || [];
  h.doorCodes.push({ id: uuid(), label, value });
  saveHouses();
  labelInput.value = "";
  valueInput.value = "";
  renderDoorCodes(h);
});

/* ---------- Checklist / processo de faxina ---------- */

function renderChecklist(house) {
  const list = document.getElementById("checklist-list");
  list.innerHTML = "";
  (house.checklist || []).forEach((item) => {
    const row = document.createElement("div");
    row.className = "item-row" + (item.done ? " checked" : "");
    row.innerHTML = `
      <input type="checkbox" ${item.done ? "checked" : ""}>
      <div class="item-main">
        <div class="item-title">${escapeHtml(item.text)}</div>
      </div>
      <button class="btn-delete-item" title="Excluir">🗑️</button>
    `;
    row.querySelector('input[type="checkbox"]').onchange = (e) => {
      item.done = e.target.checked;
      saveHouses();
      renderChecklist(house);
    };
    row.querySelector(".btn-delete-item").onclick = () => {
      house.checklist = house.checklist.filter((c) => c.id !== item.id);
      saveHouses();
      renderChecklist(house);
    };
    list.appendChild(row);
  });
}

document.getElementById("checklist-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const h = getHouse(state.currentHouseId);
  if (!h) return;
  const input = document.getElementById("input-checklist-text");
  const text = input.value.trim();
  if (!text) return;
  h.checklist = h.checklist || [];
  h.checklist.push({ id: uuid(), text, done: false });
  saveHouses();
  input.value = "";
  renderChecklist(h);
});

document.getElementById("btn-reset-checklist").onclick = () => {
  const h = getHouse(state.currentHouseId);
  if (!h) return;
  (h.checklist || []).forEach((item) => { item.done = false; });
  saveHouses();
  renderChecklist(h);
  showToast("Lista reiniciada para a próxima faxina!");
};

/* ---------- Fotos ---------- */

function renderPhotos(house) {
  const grid = document.getElementById("photos-grid");
  grid.innerHTML = "";
  (house.photos || []).forEach((photo) => {
    const img = document.createElement("img");
    img.src = photo.dataUrl;
    img.alt = "";
    img.onclick = () => openPhotoViewer(house, photo.id);
    grid.appendChild(img);
  });
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_PHOTO_DIMENSION) {
          height = Math.round((height * MAX_PHOTO_DIMENSION) / width);
          width = MAX_PHOTO_DIMENSION;
        } else if (height > MAX_PHOTO_DIMENSION) {
          width = Math.round((width * MAX_PHOTO_DIMENSION) / height);
          height = MAX_PHOTO_DIMENSION;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

document.getElementById("input-photo").addEventListener("change", async (e) => {
  const h = getHouse(state.currentHouseId);
  if (!h) return;
  const files = Array.from(e.target.files || []);
  h.photos = h.photos || [];
  for (const file of files) {
    try {
      const dataUrl = await resizeImage(file);
      h.photos.push({ id: uuid(), dataUrl });
    } catch (err) {
      showToast("Não foi possível processar uma das fotos.");
    }
  }
  const ok = saveHouses();
  renderPhotos(h);
  renderHomeList();
  e.target.value = "";
  if (!ok) {
    // Se falhou ao salvar (estouro de cota), desfaz a última adição em memória.
    loadHouses();
  }
});

function openPhotoViewer(house, photoId) {
  const photo = house.photos.find((p) => p.id === photoId);
  if (!photo) return;
  const viewer = document.getElementById("photo-viewer");
  document.getElementById("photo-viewer-img").src = photo.dataUrl;
  viewer.hidden = false;
  document.getElementById("photo-viewer-delete").onclick = () => {
    house.photos = house.photos.filter((p) => p.id !== photoId);
    saveHouses();
    renderPhotos(house);
    renderHomeList();
    viewer.hidden = true;
  };
}

document.getElementById("photo-viewer-close").onclick = () => {
  document.getElementById("photo-viewer").hidden = true;
};

/* ---------- Configurações ---------- */

document.getElementById("btn-change-pin").onclick = () => {
  if (confirm("Deseja apagar o PIN atual e criar um novo agora?")) {
    localStorage.removeItem(PIN_KEY);
    initLockScreen();
  }
};

document.getElementById("btn-export").onclick = () => {
  const data = JSON.stringify(state.houses, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `backup-faxinas-${date}.json`;
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
      if (!Array.isArray(imported)) throw new Error("Formato inválido");
      const merge = confirm(
        "Deseja MESCLAR este backup com as casas atuais?\n\nOK = mesclar (adiciona as casas do backup)\nCancelar = SUBSTITUIR tudo pelo backup"
      );
      if (merge) {
        state.houses = state.houses.concat(imported);
      } else {
        state.houses = imported;
      }
      saveHouses();
      renderHomeList();
      renderStorageInfo();
      showToast("Backup importado com sucesso!");
    } catch (err) {
      alert("Não foi possível ler este arquivo de backup.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById("btn-reset-all").onclick = () => {
  if (confirm("Isso vai apagar TODAS as casas, senhas, fotos e o PIN. Essa ação não pode ser desfeita. Continuar?")) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PIN_KEY);
    location.reload();
  }
};

function renderStorageInfo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || "";
    const kb = Math.round((raw.length * 2) / 1024);
    document.getElementById("storage-info").textContent =
      `Uso de armazenamento neste aparelho: ~${kb} KB · ${state.houses.length} casa(s) cadastrada(s)`;
  } catch (e) {
    document.getElementById("storage-info").textContent = "";
  }
}

/* ---------- Inicialização ---------- */

initLockScreen();
