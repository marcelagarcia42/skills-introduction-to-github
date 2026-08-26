"use strict";

/* ---------- Constants / storage ---------- */

const STORAGE_KEY = "cleaningOrganizer.houses";
const VISITS_KEY = "cleaningOrganizer.visits";
const EMPLOYEES_KEY = "cleaningOrganizer.employees";
const PIN_KEY = "cleaningOrganizer.pin";
const MAX_PHOTO_DIMENSION = 1000; // px - photos are resized before saving
const PHOTO_QUALITY = 0.7;
const DEFAULT_HOURLY_RATE = 20;

const ROOMS = [
  { key: "bathrooms", label: "Bathrooms" },
  { key: "kitchen", label: "Kitchen" },
  { key: "bedrooms", label: "Bedrooms" },
  { key: "living_rooms", label: "Living Rooms" },
  { key: "outdoor", label: "Outdoor Area" },
  { key: "laundry", label: "Laundry" },
];

let state = {
  houses: [],
  visits: [],
  employees: [],
  currentHouseId: null,
  currentTab: "tab-info",
  revealedCodes: new Set(),
  calendarYear: null,
  calendarMonth: null,
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

function initials(name) {
  const words = (name || "").trim().split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w));
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
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

document.querySelectorAll(".tab-bar-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    if (target === "screen-home") renderHomeList();
    if (target === "screen-calendar") openCalendar();
    if (target === "screen-team") renderTeamScreen();
    if (target === "screen-settings") renderStorageInfo();
    showScreen(target);
  });
});

/* ---------- Storage: houses / visits / employees ---------- */

function loadHouses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.houses = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.houses = [];
  }
  migrateChecklistRooms();
}

// Older checklist items (before rooms existed) have no `room` field.
// Assign them to the first room so nothing goes missing.
function migrateChecklistRooms() {
  let changed = false;
  state.houses.forEach((h) => {
    (h.checklist || []).forEach((item) => {
      if (!item.room) {
        item.room = ROOMS[0].key;
        changed = true;
      }
    });
  });
  if (changed) saveHouses();
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

function loadVisits() {
  try {
    const raw = localStorage.getItem(VISITS_KEY);
    state.visits = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.visits = [];
  }
}

function saveVisits() {
  try {
    localStorage.setItem(VISITS_KEY, JSON.stringify(state.visits));
    return true;
  } catch (e) {
    showToast("Storage is full! Delete old photos to free up space.");
    return false;
  }
}

function loadEmployees() {
  try {
    const raw = localStorage.getItem(EMPLOYEES_KEY);
    state.employees = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.employees = [];
  }
  let changed = false;
  state.employees.forEach((emp) => {
    if (emp.hourlyRate === undefined || emp.hourlyRate === null) {
      emp.hourlyRate = DEFAULT_HOURLY_RATE;
      changed = true;
    }
  });
  if (changed) saveEmployees();
}

function saveEmployees() {
  try {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(state.employees));
  } catch (e) {
    showToast("Storage is full! Delete old photos to free up space.");
  }
}

function getEmployeeByName(name) {
  const trimmed = (name || "").trim().toLowerCase();
  return state.employees.find((emp) => emp.name.toLowerCase() === trimmed);
}

// Adds an employee to the roster if her name isn't already there
// (case-insensitive). Called whenever a visit is scheduled/logged for
// someone new, so the roster grows without needing to be set up first.
function addEmployeeIfNew(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  if (!getEmployeeByName(trimmed)) {
    state.employees.push({ id: uuid(), name: trimmed, hourlyRate: DEFAULT_HOURLY_RATE });
    saveEmployees();
    renderEmployeeDatalist();
  }
}

function renderEmployeeDatalist() {
  const datalist = document.getElementById("employees-datalist");
  datalist.innerHTML = "";
  state.employees.forEach((emp) => {
    const option = document.createElement("option");
    option.value = emp.name;
    datalist.appendChild(option);
  });
}

/* ---------- Date / hours utilities ---------- */

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Formats a local Date as "YYYY-MM-DD" (matches <input type="date"> values).
function toDateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Parses a "YYYY-MM-DD" string as a local date (avoids the UTC-midnight
// shift that `new Date("YYYY-MM-DD")` causes in negative UTC offsets).
function parseDateStr(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateDisplay(s) {
  return parseDateStr(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getWeekRange(refDate) {
  const start = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() - refDate.getDay());
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return { start, end };
}

function sumHours(visits) {
  return visits.reduce((sum, v) => sum + (Number(v.hours) || 0), 0);
}

function formatHours(h) {
  const rounded = Math.round(h * 100) / 100;
  return `${rounded}h`;
}

function formatMoney(n) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function getVisitsInRange(startStr, endStr) {
  return state.visits.filter((v) => v.date >= startStr && v.date <= endStr);
}

function getMonthVisits(year, month) {
  const prefix = `${year}-${pad2(month + 1)}`;
  return state.visits.filter((v) => v.date.startsWith(prefix));
}

// A visit with no hours yet is scheduled but not completed.
function isPendingVisit(v) {
  return v.hours === null || v.hours === undefined;
}

function createVisitRowElement(visit, { showHouse, onChange }) {
  const pending = isPendingVisit(visit);
  const row = document.createElement("div");
  row.className = "item-row";

  const titleParts = [];
  if (showHouse) {
    const house = getHouse(visit.houseId);
    titleParts.push(escapeHtml(house ? house.name : "Deleted house"));
  }
  titleParts.push(escapeHtml(visit.employeeName || "Unassigned"));

  const subtitleParts = [formatDateDisplay(visit.date)];
  if (visit.note) subtitleParts.push(escapeHtml(visit.note));

  row.innerHTML = `
    <div class="item-main">
      <div class="item-title">${titleParts.join(" · ")}</div>
      <div class="item-value">${subtitleParts.join(" · ")}</div>
    </div>
    ${pending
      ? `<span class="visit-status pending">Scheduled</span><button class="btn-complete-visit">Complete</button>`
      : `<span class="visit-status completed">${formatHours(visit.hours)}</span>`}
    <button class="btn-delete-visit" title="Delete">🗑️</button>
  `;

  if (pending) {
    row.querySelector(".btn-complete-visit").onclick = () => {
      const input = prompt(`How many hours did ${visit.employeeName || "she"} spend at this house?`, "");
      if (input === null) return;
      const hours = parseFloat(input);
      if (!input.trim() || isNaN(hours) || hours <= 0) {
        alert("Please enter a valid number of hours.");
        return;
      }
      visit.hours = hours;
      saveVisits();
      onChange();
    };
  }

  row.querySelector(".btn-delete-visit").onclick = () => {
    state.visits = state.visits.filter((v) => v.id !== visit.id);
    saveVisits();
    onChange();
  };

  return row;
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
  input.value = "";
  errorEl.textContent = "";

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
  loadVisits();
  loadEmployees();
  renderEmployeeDatalist();
  renderHomeList();
  showScreen("screen-home");
}

/* ---------- Generic navigation ---------- */

document.addEventListener("click", (e) => {
  const backBtn = e.target.closest(".btn-back");
  if (backBtn) {
    const target = backBtn.dataset.backTo;
    if (target === "screen-home") renderHomeList();
    if (target === "screen-calendar") renderCalendarScreen();
    if (target === "screen-team") renderTeamScreen();
    showScreen(target);
  }
});

/* ---------- Home screen: house list ---------- */

function getNextVisitForHouse(houseId) {
  const today = toDateStr(new Date());
  return state.visits
    .filter((v) => v.houseId === houseId && isPendingVisit(v) && v.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}

function getLastCompletedVisitForHouse(houseId) {
  return state.visits
    .filter((v) => v.houseId === houseId && !isPendingVisit(v))
    .sort((a, b) => b.date.localeCompare(a.date))[0] || null;
}

function shortDayLabel(dateStr) {
  const d = parseDateStr(dateStr);
  const todayStr = toDateStr(new Date());
  if (dateStr === todayStr) return "TODAY";
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }).toUpperCase();
}

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
      ? `<img class="avatar" src="${h.photos[0].dataUrl}" alt="">`
      : `<div class="avatar">${initials(h.name)}</div>`;

    const next = getNextVisitForHouse(h.id);
    let metaHtml;
    if (next) {
      metaHtml = `
        <p class="meta-top">${shortDayLabel(next.date)}</p>
        <p class="meta-bottom">${escapeHtml(next.employeeName || "")}</p>
      `;
    } else {
      const last = getLastCompletedVisitForHouse(h.id);
      metaHtml = last
        ? `<p class="meta-top done">DONE</p><p class="meta-bottom">${escapeHtml(last.employeeName || "")}</p>`
        : "";
    }

    card.innerHTML = `
      ${thumb}
      <div class="house-info">
        <p class="house-name">${escapeHtml(h.name)}</p>
        <p class="house-address">${escapeHtml(h.address || "No address")}</p>
      </div>
      <div class="house-meta">${metaHtml}</div>
    `;
    card.onclick = () => openHouseDetail(h.id);
    list.appendChild(card);
  });

  updateHomeHero();
}

document.getElementById("search-input").addEventListener("input", (e) => renderHomeList(e.target.value));

function updateHomeHero() {
  const today = new Date();
  const { start, end } = getWeekRange(today);
  const weekVisits = getVisitsInRange(toDateStr(start), toDateStr(end));
  const monthVisits = getMonthVisits(today.getFullYear(), today.getMonth());

  document.getElementById("hero-week-hours").innerHTML =
    `${Math.round(sumHours(weekVisits) * 100) / 100}<span>hours</span>`;
  document.getElementById("hero-month-hours").textContent = formatHours(sumHours(monthVisits));

  // "Today" banner: today's visits first, else the nearest upcoming one.
  const todayStr = toDateStr(today);
  const upcoming = state.visits
    .filter((v) => v.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const banner = document.getElementById("today-banner");
  if (!upcoming) {
    banner.hidden = true;
    return;
  }
  const house = getHouse(upcoming.houseId);
  const dayLabel = upcoming.date === todayStr ? "Today" : shortDayLabel(upcoming.date).replace(/^(\w{3}).*/, (m, d) => d.charAt(0) + d.slice(1).toLowerCase());
  document.getElementById("today-banner-text").textContent =
    `${dayLabel} · ${house ? house.name : "Deleted house"}${upcoming.employeeName ? " with " + upcoming.employeeName : ""}`;
  banner.hidden = false;
  banner.onclick = () => { if (house) openHouseDetail(house.id); };
}

document.getElementById("btn-lock-app").onclick = () => initLockScreen();

/* ---------- Calendar ---------- */

function openCalendar() {
  const today = new Date();
  state.calendarYear = today.getFullYear();
  state.calendarMonth = today.getMonth();
  renderCalendarScreen();
}

document.getElementById("btn-prev-month").onclick = () => {
  state.calendarMonth--;
  if (state.calendarMonth < 0) { state.calendarMonth = 11; state.calendarYear--; }
  renderCalendarScreen();
};

document.getElementById("btn-next-month").onclick = () => {
  state.calendarMonth++;
  if (state.calendarMonth > 11) { state.calendarMonth = 0; state.calendarYear++; }
  renderCalendarScreen();
};

function renderCalendarScreen() {
  if (state.calendarYear === null) {
    const today = new Date();
    state.calendarYear = today.getFullYear();
    state.calendarMonth = today.getMonth();
  }
  const year = state.calendarYear;
  const month = state.calendarMonth;

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  document.getElementById("calendar-month-label").textContent = monthLabel;

  const monthPrefix = `${year}-${pad2(month + 1)}`;
  const monthVisits = getMonthVisits(year, month);

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toDateStr(new Date());

  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${monthPrefix}-${pad2(day)}`;
    const dayVisits = monthVisits.filter((v) => v.date === dateStr);
    const hasPending = dayVisits.some(isPendingVisit);
    const hasCompleted = dayVisits.some((v) => !isPendingVisit(v));
    const cell = document.createElement("div");
    cell.className = "calendar-day" + (dateStr === todayStr ? " today" : "");
    let dotsHtml = "";
    if (dayVisits.length) {
      dotsHtml = `<span class="day-dots">`
        + (hasPending ? `<span class="day-dot pending"></span>` : "")
        + (hasCompleted ? `<span class="day-dot completed"></span>` : "")
        + `</span>`;
    }
    cell.innerHTML = `<span>${day}</span>${dotsHtml}`;
    grid.appendChild(cell);
  }

  const list = document.getElementById("calendar-visits-list");
  const empty = document.getElementById("calendar-visits-empty");
  list.innerHTML = "";
  const sorted = [...monthVisits].sort((a, b) => b.date.localeCompare(a.date));
  empty.hidden = sorted.length > 0;
  sorted.forEach((v) => {
    list.appendChild(createVisitRowElement(v, {
      showHouse: true,
      onChange: () => { renderCalendarScreen(); updateHomeHero(); },
    }));
  });
}

document.getElementById("btn-schedule-visit").onclick = () => {
  if (!state.houses.length) {
    showToast("Add a house first, then you can schedule a cleaning.");
    return;
  }
  const select = document.getElementById("input-schedule-house");
  select.innerHTML = "";
  state.houses.forEach((h) => {
    const option = document.createElement("option");
    option.value = h.id;
    option.textContent = h.name;
    select.appendChild(option);
  });
  document.getElementById("input-schedule-date").value = toDateStr(new Date());
  document.getElementById("input-schedule-employee").value = "";
  document.getElementById("input-schedule-note").value = "";
  renderEmployeeDatalist();
  showScreen("screen-schedule-visit");
};

document.getElementById("schedule-visit-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const houseId = document.getElementById("input-schedule-house").value;
  const date = document.getElementById("input-schedule-date").value;
  const employeeName = document.getElementById("input-schedule-employee").value.trim();
  const note = document.getElementById("input-schedule-note").value.trim();
  if (!houseId || !date || !employeeName) return;

  addEmployeeIfNew(employeeName);
  state.visits.push({ id: uuid(), houseId, date, employeeName, hours: null, note });
  saveVisits();
  renderCalendarScreen();
  showScreen("screen-calendar");
  showToast("Cleaning scheduled!");
});

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
  const visitCount = state.visits.filter((v) => v.houseId === h.id && !isPendingVisit(v)).length;
  document.getElementById("detail-subline").textContent =
    `${h.address || "No address on file"} · ${visitCount} visit${visitCount === 1 ? "" : "s"} logged`;
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
  renderVisits(h);
  document.getElementById("input-visit-date").value = toDateStr(new Date());
  document.getElementById("input-visit-employee").value = "";
  document.getElementById("input-visit-hours").value = "";
  document.getElementById("input-visit-note").value = "";

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
  if (confirm(`Delete "${h.name}"? This will erase its address, codes, checklist, photos and logged visits.`)) {
    state.houses = state.houses.filter((x) => x.id !== h.id);
    state.visits = state.visits.filter((v) => v.houseId !== h.id);
    saveHouses();
    saveVisits();
    renderHomeList();
    showScreen("screen-home");
  }
};

/* ---------- Cleaning visits (dates + hours worked) ---------- */

function renderVisits(house) {
  const list = document.getElementById("visits-list");
  const empty = document.getElementById("visits-empty");
  list.innerHTML = "";
  const visits = state.visits
    .filter((v) => v.houseId === house.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  empty.hidden = visits.length > 0;
  visits.forEach((v) => {
    list.appendChild(createVisitRowElement(v, {
      showHouse: false,
      onChange: () => { renderVisits(house); updateHomeHero(); },
    }));
  });
}

document.getElementById("visit-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const h = getHouse(state.currentHouseId);
  if (!h) return;
  const dateInput = document.getElementById("input-visit-date");
  const employeeInput = document.getElementById("input-visit-employee");
  const hoursInput = document.getElementById("input-visit-hours");
  const noteInput = document.getElementById("input-visit-note");
  const date = dateInput.value;
  const employeeName = employeeInput.value.trim();
  const hoursRaw = hoursInput.value.trim();
  const hours = hoursRaw === "" ? null : parseFloat(hoursRaw);
  const note = noteInput.value.trim();
  if (!date || !employeeName) return;
  if (hoursRaw !== "" && (isNaN(hours) || hours <= 0)) return;

  addEmployeeIfNew(employeeName);
  state.visits.push({ id: uuid(), houseId: h.id, date, employeeName, hours, note });
  saveVisits();
  dateInput.value = toDateStr(new Date());
  employeeInput.value = "";
  hoursInput.value = "";
  noteInput.value = "";
  renderVisits(h);
  document.getElementById("detail-subline").textContent =
    `${h.address || "No address on file"} · ${state.visits.filter((v) => v.houseId === h.id && !isPendingVisit(v)).length} visit(s) logged`;
  showToast(hours === null ? "Cleaning scheduled!" : "Visit logged!");
});

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
  const checklistGroups = document.getElementById("print-checklist-groups");
  checklistGroups.innerHTML = "";
  const hasItems = h.checklist && h.checklist.length;
  if (hasItems) {
    checklistSection.hidden = false;
    ROOMS.forEach((room) => {
      const items = h.checklist.filter((item) => item.room === room.key);
      if (!items.length) return;
      const heading = document.createElement("h3");
      heading.textContent = room.label;
      checklistGroups.appendChild(heading);
      const ul = document.createElement("ul");
      items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `☐ ${item.text}`;
        ul.appendChild(li);
      });
      checklistGroups.appendChild(ul);
    });
  } else {
    checklistSection.hidden = true;
  }

  document.getElementById("print-payroll").hidden = true;
  document.getElementById("print-house").hidden = false;
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
        <div class="item-value ${revealed ? "" : "hidden-value"}">${revealed ? escapeHtml(code.value) : "• • • •"}</div>
      </div>
      <button class="pill-btn btn-reveal">${revealed ? "Hide" : "Reveal"}</button>
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

// Populate the room <select> in the "add task" form once.
(function initChecklistRoomSelect() {
  const select = document.getElementById("input-checklist-room");
  ROOMS.forEach((room) => {
    const option = document.createElement("option");
    option.value = room.key;
    option.textContent = room.label;
    select.appendChild(option);
  });
})();

function renderChecklist(house) {
  const container = document.getElementById("room-groups");
  container.innerHTML = "";
  const items = house.checklist || [];

  ROOMS.forEach((room) => {
    const roomItems = items.filter((item) => item.room === room.key);
    if (!roomItems.length) return;

    const group = document.createElement("div");
    group.className = "room-group";
    const title = document.createElement("p");
    title.className = "room-title";
    title.textContent = room.label;
    group.appendChild(title);

    const list = document.createElement("div");
    list.className = "item-list";
    roomItems.forEach((item) => {
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
    group.appendChild(list);
    container.appendChild(group);
  });

  const done = items.filter((i) => i.done).length;
  document.getElementById("checklist-progress-text").textContent = `${done} of ${items.length} done`;
}

document.getElementById("checklist-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const h = getHouse(state.currentHouseId);
  if (!h) return;
  const input = document.getElementById("input-checklist-text");
  const roomSelect = document.getElementById("input-checklist-room");
  const text = input.value.trim();
  if (!text) return;
  h.checklist = h.checklist || [];
  h.checklist.push({ id: uuid(), text, done: false, room: roomSelect.value });
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

/* ---------- Team (employees, hours & pay) ---------- */

function computeWeeklyPay(refDate) {
  const { start, end } = getWeekRange(refDate);
  const weekVisits = getVisitsInRange(toDateStr(start), toDateStr(end)).filter((v) => !isPendingVisit(v));

  const rows = state.employees.map((emp) => {
    const empVisits = weekVisits.filter((v) => (v.employeeName || "").toLowerCase() === emp.name.toLowerCase());
    const hours = sumHours(empVisits);
    return { employee: emp, hours, visitCount: empVisits.length, pay: hours * (emp.hourlyRate || 0) };
  });

  const totalPay = rows.reduce((sum, r) => sum + r.pay, 0);
  const totalHours = rows.reduce((sum, r) => sum + r.hours, 0);
  const peopleWithHours = rows.filter((r) => r.hours > 0).length;

  return { start, end, rows, totalPay, totalHours, peopleWithHours };
}

function renderTeamScreen() {
  const { start, end, rows, totalPay, totalHours, peopleWithHours } = computeWeeklyPay(new Date());

  document.getElementById("team-subline").textContent =
    `Hours and pay for the week of ${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  document.getElementById("team-payroll-amount").textContent = formatMoney(totalPay);
  document.getElementById("team-payroll-sub").textContent =
    `${Math.round(totalHours * 100) / 100} hours · ${peopleWithHours} people`;

  const list = document.getElementById("team-list");
  const empty = document.getElementById("team-empty");
  list.innerHTML = "";
  const sortedRows = [...rows].sort((a, b) => a.employee.name.localeCompare(b.employee.name));
  empty.hidden = sortedRows.length > 0;

  sortedRows.forEach(({ employee, hours, visitCount, pay }) => {
    const card = document.createElement("div");
    card.className = "employee-card";
    card.innerHTML = `
      <div class="employee-top">
        <div class="avatar round">${initials(employee.name)}</div>
        <div class="employee-info">
          <div class="employee-name">${escapeHtml(employee.name)}</div>
          <div class="employee-sub">${formatHours(hours)} · ${visitCount} visit${visitCount === 1 ? "" : "s"}</div>
        </div>
        <div class="employee-pay">
          <div class="pay-amount">${formatMoney(pay)}</div>
          <div class="pay-label">This week</div>
        </div>
      </div>
      <div class="rate-row">
        <span class="rate-label">Hourly rate</span>
        <div class="rate-stepper">
          <button class="rate-minus" type="button">−</button>
          <span class="rate-value">$${employee.hourlyRate}/h</span>
          <button class="rate-plus" type="button">+</button>
        </div>
      </div>
      <div class="employee-remove"><button type="button">Remove</button></div>
    `;
    card.querySelector(".rate-minus").onclick = () => {
      employee.hourlyRate = Math.max(0, (employee.hourlyRate || 0) - 1);
      saveEmployees();
      renderTeamScreen();
    };
    card.querySelector(".rate-plus").onclick = () => {
      employee.hourlyRate = (employee.hourlyRate || 0) + 1;
      saveEmployees();
      renderTeamScreen();
    };
    card.querySelector(".employee-remove button").onclick = () => {
      if (confirm(`Remove ${employee.name} from your team?`)) {
        state.employees = state.employees.filter((e) => e.id !== employee.id);
        saveEmployees();
        renderEmployeeDatalist();
        renderTeamScreen();
      }
    };
    list.appendChild(card);
  });
}

document.getElementById("btn-add-employee").onclick = () => {
  document.getElementById("input-employee-name").value = "";
  document.getElementById("input-employee-rate").value = DEFAULT_HOURLY_RATE;
  showScreen("screen-employee-form");
};

document.getElementById("employee-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("input-employee-name").value.trim();
  const rate = parseFloat(document.getElementById("input-employee-rate").value);
  if (!name || isNaN(rate) || rate < 0) return;
  if (getEmployeeByName(name)) {
    alert("There's already someone on your team with that name.");
    return;
  }
  state.employees.push({ id: uuid(), name, hourlyRate: rate });
  saveEmployees();
  renderEmployeeDatalist();
  renderTeamScreen();
  showScreen("screen-team");
});

document.getElementById("btn-export-payroll").onclick = () => {
  const { start, end, rows, totalPay, totalHours } = computeWeeklyPay(new Date());
  const weekLabel = `Week of ${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  document.getElementById("print-payroll-week").textContent = weekLabel;
  document.getElementById("print-payroll-total").textContent =
    `Total: ${formatMoney(totalPay)} · ${Math.round(totalHours * 100) / 100} hours`;

  const list = document.getElementById("print-payroll-list");
  list.innerHTML = "";
  rows.filter((r) => r.hours > 0).forEach((r) => {
    const li = document.createElement("li");
    li.textContent = `${r.employee.name}: ${formatHours(r.hours)} × $${r.employee.hourlyRate}/h = ${formatMoney(r.pay)}`;
    list.appendChild(li);
  });

  document.getElementById("print-house").hidden = true;
  document.getElementById("print-payroll").hidden = false;
  window.print();
};

/* ---------- Settings ---------- */

document.getElementById("btn-change-pin").onclick = () => {
  if (confirm("Erase the current PIN and create a new one now?")) {
    localStorage.removeItem(PIN_KEY);
    initLockScreen();
  }
};

document.getElementById("btn-export").onclick = () => {
  const data = JSON.stringify({ houses: state.houses, visits: state.visits, employees: state.employees }, null, 2);
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
      // Older backups were a bare array of houses (no visits/employees included).
      const importedHouses = Array.isArray(imported) ? imported : imported.houses;
      const importedVisits = Array.isArray(imported) ? [] : (imported.visits || []);
      const importedEmployees = Array.isArray(imported) ? [] : (imported.employees || []);
      if (!Array.isArray(importedHouses)) throw new Error("Invalid format");
      const merge = confirm(
        "MERGE this backup with your current houses?\n\nOK = merge (adds the houses/visits/employees from the backup)\nCancel = REPLACE everything with the backup"
      );
      if (merge) {
        state.houses = state.houses.concat(importedHouses);
        state.visits = state.visits.concat(importedVisits);
        importedEmployees.forEach((emp) => addEmployeeIfNew(emp.name));
      } else {
        state.houses = importedHouses;
        state.visits = importedVisits;
        state.employees = importedEmployees.map((emp) => ({
          ...emp,
          hourlyRate: emp.hourlyRate ?? DEFAULT_HOURLY_RATE,
        }));
        saveEmployees();
      }
      saveHouses();
      saveVisits();
      renderHomeList();
      renderStorageInfo();
      renderEmployeeDatalist();
      showToast("Backup imported successfully!");
    } catch (err) {
      alert("Couldn't read this backup file.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById("btn-reset-all").onclick = () => {
  if (confirm("This will erase ALL houses, codes, photos, visits, employees and the PIN. This can't be undone. Continue?")) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VISITS_KEY);
    localStorage.removeItem(EMPLOYEES_KEY);
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
