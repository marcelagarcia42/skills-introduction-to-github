"use strict";

/* ---------- Constants / storage ---------- */

const STORAGE_KEY = "cleaningOrganizer.houses";
const PIN_KEY = "cleaningOrganizer.pin";
const MAX_PHOTO_DIMENSION = 1000; // px - photos are resized before saving
const PHOTO_QUALITY = 0.7;

let state = {
  houses: [],
  currentHouseId: null,
  currentTab: "tab-info",
  revealedCodes: new Set(),
};

/* ---------- Utilities ---------- */

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
    showToast("Storage is full! Delete old photos to free up space.");
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

/* ---------- PIN / Lock screen ---------- */

function initLockScreen() {
  const savedPin = localStorage.getItem(PIN_KEY);
  const instructions = document.getElementById("lock-instructions");
  const input = document.getElementById("lock-input");
  const errorEl = document.getElementById("lock-error");
  const forgotBtn = document.getElementById("lock-forgot");

  let mode = savedPin ? "unlock" : "create";
  instructions.textContent = mode === "create"
    ? "Create a PIN to protect your passwords (4 to 8 digits)"
    : "Enter your PIN to continue";
  forgotBtn.hidden = mode === "create";

  let pendingFirstPin = null;

  function attempt() {
    const value = input.value.trim();
    errorEl.textContent = "";

    if (mode === "create") {
      if (value.length < 4) {
        errorEl.textContent = "PIN must be at least 4 digits.";
        return;
      }
      if (!pendingFirstPin) {
        pendingFirstPin = value;
        input.value = "";
        instructions.textContent = "Enter the PIN again to confirm";
        return;
      }
      if (pendingFirstPin !== value) {
        errorEl.textContent = "PINs don't match. Try again.";
        pendingFirstPin = null;
        input.value = "";
        instructions.textContent = "Create a PIN to protect your passwords (4 to 8 digits)";
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
      errorEl.textContent = "Incorrect PIN.";
      input.value = "";
    }
  }

  document.getElementById("lock-submit").onclick = attempt;
  input.onkeydown = (e) => { if (e.key === "Enter") attempt(); };

  forgotBtn.onclick = () => {
    if (confirm("This will erase the current PIN (your house data stays saved). Continue?")) {
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

/* ---------- Generic navigation ---------- */

document.addEventListener("click", (e) => {
  const backBtn = e.target.closest(".btn-back");
  if (backBtn) {
    showScreen(backBtn.dataset.backTo);
    if (backBtn.dataset.backTo === "screen-home") renderHomeList();
  }
});

/* ---------- Home screen: house list ---------- */

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
        <p class="house-address">${escapeHtml(h.address || "No address")}</p>
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

/* ---------- House form: add / edit ---------- */

let editingHouseId = null;

document.getElementById("btn-add-house").onclick = () => {
  editingHouseId = null;
  document.getElementById("house-form-title").textContent = "New House";
  document.getElementById("input-name").value = "";
  document.getElementById("input-address").value = "";
  document.getElementById("input-notes").value = "";
  showScreen("screen-house-form");
};

document.getElementById("btn-edit-house").onclick = () => {
  const h = getHouse(state.currentHouseId);
  if (!h) return;
  editingHouseId = h.id;
  document.getElementById("house-form-title").textContent = "Edit House";
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

/* ---------- House detail ---------- */

function openHouseDetail(id) {
  state.currentHouseId = id;
  const h = getHouse(id);
  if (!h) return;

  document.getElementById("detail-name").textContent = h.name;
  document.getElementById("detail-address").textContent = h.address || "No address on file";
  document.getElementById("detail-notes").textContent = h.notes || "No notes";

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
  if (confirm(`Delete "${h.name}"? This will erase its address, codes, checklist and photos.`)) {
    state.houses = state.houses.filter((x) => x.id !== h.id);
    saveHouses();
    renderHomeList();
    showScreen("screen-home");
  }
};

/* ---------- Share as PDF ---------- */

document.getElementById("btn-share-pdf").onclick = () => {
  const h = getHouse(state.currentHouseId);
  if (!h) return;

  document.getElementById("print-name").textContent = h.name;
  document.getElementById("print-address").textContent = h.address || "No address on file";

  const notesSection = document.getElementById("print-notes-section");
  if (h.notes) {
    notesSection.hidden = false;
    document.getElementById("print-notes").textContent = h.notes;
  } else {
    notesSection.hidden = true;
  }

  const codesSection = document.getElementById("print-codes-section");
  const codesList = document.getElementById("print-codes-list");
  codesList.innerHTML = "";
  if (h.doorCodes && h.doorCodes.length) {
    codesSection.hidden = false;
    h.doorCodes.forEach((code) => {
      const li = document.createElement("li");
      li.textContent = `${code.label}: ${code.value}`;
      codesList.appendChild(li);
    });
  } else {
    codesSection.hidden = true;
  }

  const checklistSection = document.getElementById("print-checklist-section");
  const checklistList = document.getElementById("print-checklist-list");
  checklistList.innerHTML = "";
  if (h.checklist && h.checklist.length) {
    checklistSection.hidden = false;
    h.checklist.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `☐ ${item.text}`;
      checklistList.appendChild(li);
    });
  } else {
    checklistSection.hidden = true;
  }

  window.print();
};

/* ---------- Door codes ---------- */

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
      <button class="btn-reveal" title="Show/hide">${revealed ? "🙈" : "👁️"}</button>
      <button class="btn-delete-code" title="Delete">🗑️</button>
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

/* ---------- Checklist / cleaning process ---------- */

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
      <button class="btn-delete-item" title="Delete">🗑️</button>
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
  showToast("Checklist reset for the next cleaning!");
};

/* ---------- Photos ---------- */

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
      showToast("Couldn't process one of the photos.");
    }
  }
  const ok = saveHouses();
  renderPhotos(h);
  renderHomeList();
  e.target.value = "";
  if (!ok) {
    // If saving failed (storage quota exceeded), undo the last addition in memory.
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

/* ---------- Settings ---------- */

document.getElementById("btn-change-pin").onclick = () => {
  if (confirm("Erase the current PIN and create a new one now?")) {
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
  a.download = `cleaning-backup-${date}.json`;
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
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      const merge = confirm(
        "MERGE this backup with your current houses?\n\nOK = merge (adds the houses from the backup)\nCancel = REPLACE everything with the backup"
      );
      if (merge) {
        state.houses = state.houses.concat(imported);
      } else {
        state.houses = imported;
      }
      saveHouses();
      renderHomeList();
      renderStorageInfo();
      showToast("Backup imported successfully!");
    } catch (err) {
      alert("Couldn't read this backup file.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById("btn-reset-all").onclick = () => {
  if (confirm("This will erase ALL houses, codes, photos and the PIN. This can't be undone. Continue?")) {
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
      `Storage used on this device: ~${kb} KB · ${state.houses.length} house(s) saved`;
  } catch (e) {
    document.getElementById("storage-info").textContent = "";
  }
}

/* ---------- Initialization ---------- */

initLockScreen();
