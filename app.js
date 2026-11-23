/**
 * Monitora+ — Portal de Agendamento de Monitorias Acadêmicas (v6)
 * Landing 50/50 (Gennera + Assaad) + Ícone M Interativo + Verificação em 6 caixinhas
 * + Fluxo Cal.com em 3 etapas + Painel do Monitor isolado por disciplina.
 */

const STORAGE_KEY = "monitoraplus_v6_state";

const PROFESSOR_CODES = {
  "off-ihc": "IHC026",
  "off-es": "ESW026",
  "off-aoc": "AOC026",
  "off-md": "MAT026",
  "off-alg": "ALG026",
  "off-ing": "ING026",
};

const LANDING_PHRASES = [
  {
    headline: "Aprender fica mais<br />leve com apoio",
    sub: "Tire dúvidas no horário certo, sem mensagens perdidas ou choque de agenda.",
  },
  {
    headline: "Organizar monitorias<br />é ganhar tempo",
    sub: "Consulte vagas disponíveis em tempo real e acompanhe tudo pelo protocolo.",
  },
  {
    headline: "Cuidar da rotina é<br />focar no que importa",
    sub: "Estudantes e monitores conectados com clareza em cada disciplina.",
  },
];

const DAYS_OF_WEEK = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const FULL_WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const TIME_BANDS = ["14:00 - 14:40", "15:00 - 15:40", "16:30 - 17:10", "18:30 - 19:10"];

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const MONTH_SHORT = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

const INITIAL_USERS = [
  {
    id: "usr-stu-1",
    role: "student",
    name: "Ana Paula Ribeiro",
    ra: "2026101",
    email: "ana@academico.edu.br",
    course: "Eng. Software · 1º A",
    password: "1234",
  },
  {
    id: "usr-stu-2",
    role: "student",
    name: "Lucas Mendes",
    ra: "2026102",
    email: "lucas@academico.edu.br",
    course: "Eng. Software · 1º A",
    password: "1234",
  },
  {
    id: "usr-mon-1",
    role: "monitor",
    name: "Rafael Silva",
    ra: "2026901",
    email: "rafael.monitor@academico.edu.br",
    offeringId: "off-alg",
    password: "1234",
  },
];

const OFFERINGS = [
  {
    id: "off-ihc",
    subject: "Interação Humano-Computador",
    shortSubject: "IHC",
    title: "Heurísticas, Usabilidade e Protótipos (90h/a)",
    monitor: "Monitora Mariana L.",
    mode: "Presencial / Online",
    location: "Sala 104 · Bloco A / Virtual",
    shortLocation: "Sala 104 · Presencial / Online",
    duration: "40 minutos",
  },
  {
    id: "off-es",
    subject: "Introdução à Engenharia de Software",
    shortSubject: "Eng. Software",
    title: "Requisitos, Casos de Uso e Processos (72h/a)",
    monitor: "Monitor Bruno T.",
    mode: "Presencial",
    location: "Presencial · Sala 201, Bloco A",
    shortLocation: "Sala 201 · Presencial",
    duration: "40 minutos",
  },
  {
    id: "off-aoc",
    subject: "Arquitetura e Organização de Computadores",
    shortSubject: "Arq. Computadores",
    title: "Sistemas Numéricos, Portas Lógicas e ULA (54h/a)",
    monitor: "Monitor Gabriel N.",
    mode: "Presencial",
    location: "Presencial · Lab Hardware, Bloco C",
    shortLocation: "Lab Hardware · Presencial",
    duration: "40 minutos",
  },
  {
    id: "off-md",
    subject: "Matemática Discreta",
    shortSubject: "Mat. Discreta",
    title: "Conjuntos, Relações, Grafos e Indução (54h/a)",
    monitor: "Monitor Pedro H.",
    mode: "Online",
    location: "Online · Sala Virtual Acadêmica",
    shortLocation: "Sala Virtual · Online",
    duration: "40 minutos",
  },
  {
    id: "off-alg",
    subject: "Algoritmo e Programação",
    shortSubject: "Algoritmos",
    title: "Vetores, Matrizes e Lógica em Python (54h/a)",
    monitor: "Monitor Rafael S.",
    mode: "Presencial",
    location: "Presencial · Lab 02, Bloco B",
    shortLocation: "Lab 02 · Presencial",
    duration: "40 minutos",
  },
  {
    id: "off-ing",
    subject: "Introdução à Língua Inglesa",
    shortSubject: "Língua Inglesa",
    title: "Leitura Técnica e Vocabulário de Computação (54h/a)",
    monitor: "Monitora Sofia M.",
    mode: "Online",
    location: "Online · Sala Virtual Acadêmica",
    shortLocation: "Sala Virtual · Online",
    duration: "40 minutos",
  },
];

const INITIAL_SLOTS = [
  { id: "sl-1", offeringId: "off-alg", dateIso: "2026-11-23", dayName: "Segunda", time: "14:00 - 14:40", capacity: 4, baseOccupied: 1 },
  { id: "sl-2", offeringId: "off-alg", dateIso: "2026-11-23", dayName: "Segunda", time: "15:00 - 15:40", capacity: 4, baseOccupied: 2 },
  { id: "sl-3", offeringId: "off-alg", dateIso: "2026-11-23", dayName: "Segunda", time: "16:30 - 17:10", capacity: 3, baseOccupied: 3 },
  { id: "sl-4", offeringId: "off-alg", dateIso: "2026-11-26", dayName: "Quinta", time: "14:00 - 14:40", capacity: 4, baseOccupied: 2 },

  { id: "sl-7", offeringId: "off-ihc", dateIso: "2026-11-24", dayName: "Terça", time: "15:00 - 15:40", capacity: 4, baseOccupied: 2 },
  { id: "sl-8", offeringId: "off-ihc", dateIso: "2026-11-25", dayName: "Quarta", time: "14:00 - 14:40", capacity: 4, baseOccupied: 0 },
  { id: "sl-9", offeringId: "off-ihc", dateIso: "2026-11-26", dayName: "Quinta", time: "16:30 - 17:10", capacity: 3, baseOccupied: 1 },

  { id: "sl-10", offeringId: "off-es", dateIso: "2026-11-24", dayName: "Terça", time: "15:00 - 15:40", capacity: 4, baseOccupied: 2 },
  { id: "sl-11", offeringId: "off-es", dateIso: "2026-11-25", dayName: "Quarta", time: "18:30 - 19:10", capacity: 4, baseOccupied: 3 },
  { id: "sl-12", offeringId: "off-es", dateIso: "2026-11-27", dayName: "Sexta", time: "14:00 - 14:40", capacity: 3, baseOccupied: 2 },

  { id: "sl-13", offeringId: "off-aoc", dateIso: "2026-11-23", dayName: "Segunda", time: "18:30 - 19:10", capacity: 4, baseOccupied: 1 },
  { id: "sl-14", offeringId: "off-aoc", dateIso: "2026-11-27", dayName: "Sexta", time: "15:00 - 15:40", capacity: 4, baseOccupied: 2 },

  { id: "sl-15", offeringId: "off-md", dateIso: "2026-11-24", dayName: "Terça", time: "18:30 - 19:10", capacity: 5, baseOccupied: 2 },
  { id: "sl-16", offeringId: "off-md", dateIso: "2026-11-26", dayName: "Quinta", time: "16:30 - 17:10", capacity: 3, baseOccupied: 3 },

  { id: "sl-17", offeringId: "off-ing", dateIso: "2026-11-25", dayName: "Quarta", time: "16:30 - 17:10", capacity: 5, baseOccupied: 1 },
  { id: "sl-18", offeringId: "off-ing", dateIso: "2026-11-30", dayName: "Segunda", time: "18:30 - 19:10", capacity: 4, baseOccupied: 1 },
];

const INITIAL_BOOKINGS = [
  {
    id: "bk-100",
    protocol: "#MON-2026-014",
    studentId: "usr-stu-1",
    slotId: "sl-7",
    topic: "Revisar heurísticas e roteiro de usabilidade",
    status: "Confirmado",
    createdAt: "18/11/2026 10:15",
  },
  {
    id: "bk-099",
    protocol: "#MON-2026-009",
    studentId: "usr-stu-1",
    slotId: "sl-12",
    topic: "Critérios de aceitação no Documento de Requisitos",
    status: "Concluído",
    createdAt: "11/11/2026 14:20",
  },
  {
    id: "bk-101",
    protocol: "#MON-2026-011",
    studentId: "usr-stu-2",
    slotId: "sl-1",
    topic: "Dúvida em percurso de matrizes bidimensionais em Python",
    status: "Confirmado",
    createdAt: "18/11/2026 11:05",
  },
];

const DEFAULT_PREFS = {
  defaultLayout: "list",
  confirmBeforeBook: true,
  blockConflicts: true,
  autoIcsHint: false,
  cvdFilter: "none",
  dyslexiaSpacing: false,
  readingMask: false,
  pauseDistractions: false,
  extraFocus: false,
  largeTargets: false,
  reducedMotion: false,
  vlibras: false,
};

const SETTINGS_TAB_META = {
  geral: {
    title: "Geral",
    desc: "Configure como o catálogo de monitorias e confirmações funcionam.",
  },
  aparencia: {
    title: "Aparência",
    desc: "Ajuste tema visual, escala de texto e redução de movimento.",
  },
  acessibilidade: {
    title: "Acessibilidade e Tecnologia Assistiva",
    desc: "Recursos reais alinhados à WCAG 2.2 para visão, cognição, mobilidade e voz.",
  },
  agenda: {
    title: "Agenda e Lembretes",
    desc: "Regras de conflito de horário e exportação de calendário (.ics).",
  },
  atalhos: {
    title: "Atalhos de Teclado",
    desc: "Comandos rápidos para navegar sem depender do mouse.",
  },
  conta: {
    title: "Conta e Privacidade (LGPD)",
    desc: "Sessão ativa, portabilidade de dados e exclusão local.",
  },
};

let state = loadState();

const ui = {
  activeView: "landing",
  authTab: "login", // 'login' | 'register'
  regRole: "student",
  pendingMonitorDraft: null,
  phraseIdx: 0,
  step: 1,
  search: "",
  subjectFilter: "Todas",
  modeFilter: "Todas",
  step1Layout: state.prefs?.defaultLayout || "list",
  activeSettingsTab: "geral",
  selectedOfferingId: null,
  calYear: 2026,
  calMonth: 10,
  selectedDateIso: null,
  selectedSlotId: null,
  step3Completed: false,
  reschedulingBookingId: null,
  lastCreatedBookingId: null,
  bookingFilter: "todos",
  monitorFilter: "active",
};

// ==================== PERSISTÊNCIA ====================
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.users && parsed.slots && parsed.bookings) {
        return {
          ...parsed,
          prefs: { ...DEFAULT_PREFS, ...(parsed.prefs || {}) },
        };
      }
    }
  } catch {
    // Fallback silencioso
  }

  return {
    users: structuredClone(INITIAL_USERS),
    slots: structuredClone(INITIAL_SLOTS),
    bookings: structuredClone(INITIAL_BOOKINGS),
    currentUserId: null,
    theme: "light",
    fontScale: 1,
    prefs: { ...DEFAULT_PREFS },
    nextSeq: 15,
  };
}

function getPrefs() {
  if (!state.prefs) state.prefs = { ...DEFAULT_PREFS };
  return state.prefs;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignora em modo privado restrito
  }
}

// ==================== HELPERS ====================
function escapeHtml(val) {
  return String(val ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeText(val) {
  return String(val ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatVagas(count, withAvailable = false) {
  if (count <= 0) return withAvailable ? "Sem vagas na semana" : "Lotado";
  if (count === 1) return withAvailable ? "1 vaga disponível" : "1 vaga";
  return withAvailable ? `${count} vagas disponíveis` : `${count} vagas`;
}

function getMonitorInitials(monitorName) {
  const clean = String(monitorName ?? "")
    .replace(/^(Monitora|Monitor)\s+/i, "")
    .replace(/\./g, "")
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getDateBadgeParts(dateIso, dayName) {
  const [, mm, dd] = String(dateIso || "").split("-");
  const monthIdx = Math.max(0, Math.min(11, Number(mm) - 1));
  return {
    day: dd || "--",
    month: MONTH_SHORT[monthIdx] || "---",
    weekday: String(dayName || "").slice(0, 3).toUpperCase(),
  };
}

const FIELD_ERR_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

function setFieldError(fieldEl, message) {
  if (!fieldEl || !fieldEl.id) return;
  const errId = `err-${fieldEl.id}`;
  fieldEl.classList.add("is-invalid");
  fieldEl.setAttribute("aria-invalid", "true");

  if (fieldEl.dataset.origDescribedby === undefined) {
    fieldEl.dataset.origDescribedby = fieldEl.getAttribute("aria-describedby") || "";
  }
  const tokens = fieldEl.dataset.origDescribedby.split(/\s+/).filter(Boolean);
  if (!tokens.includes(errId)) tokens.push(errId);
  fieldEl.setAttribute("aria-describedby", tokens.join(" "));

  const container = fieldEl.closest(".field") || fieldEl.parentElement;
  let errNode = document.getElementById(errId);
  if (!errNode) {
    errNode = document.createElement("p");
    errNode.id = errId;
    errNode.className = "field-error";
    errNode.setAttribute("role", "alert");
    container.appendChild(errNode);
  }
  errNode.innerHTML = `${FIELD_ERR_ICON}<span>${escapeHtml(message)}</span>`;
}

function clearFieldError(fieldEl) {
  if (!fieldEl || !fieldEl.id) return;
  const errId = `err-${fieldEl.id}`;
  fieldEl.classList.remove("is-invalid");
  fieldEl.removeAttribute("aria-invalid");

  if (fieldEl.dataset.origDescribedby !== undefined) {
    if (fieldEl.dataset.origDescribedby) {
      fieldEl.setAttribute("aria-describedby", fieldEl.dataset.origDescribedby);
    } else {
      fieldEl.removeAttribute("aria-describedby");
    }
  }
  document.getElementById(errId)?.remove();
}

function clearFormErrors(formEl) {
  if (!formEl) return;
  formEl.querySelectorAll(".is-invalid").forEach((el) => clearFieldError(el));
  formEl.querySelectorAll(".field-error").forEach((el) => el.remove());
  formEl.querySelectorAll(".inline-alert").forEach((el) => {
    el.classList.add("is-hidden");
    el.textContent = "";
  });
}

function applyFieldErrors(formEl, errors) {
  clearFormErrors(formEl);
  if (!errors || errors.length === 0) return false;
  errors.forEach(({ el, message }) => setFieldError(el, message));
  const first = errors[0].el;
  if (first) {
    first.focus();
    first.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return true;
}

function clearOtpErrors() {
  const errEl = document.getElementById("otp-error");
  if (errEl) {
    errEl.classList.add("is-hidden");
    errEl.textContent = "";
  }
  document.querySelectorAll(".otp-box").forEach((box) => {
    box.classList.remove("is-invalid");
    box.removeAttribute("aria-invalid");
    box.removeAttribute("aria-describedby");
  });
}

function getCurrentUser() {
  if (!state.currentUserId) return null;
  return state.users.find((u) => u.id === state.currentUserId) || null;
}

function getUserById(userId) {
  return state.users.find((u) => u.id === userId) || null;
}

function getOffering(offeringId) {
  return OFFERINGS.find((o) => o.id === offeringId);
}

function getSlotOccupied(slot) {
  const dynamicConfirmed = state.bookings.filter(
    (b) => b.slotId === slot.id && b.status === "Confirmado"
  ).length;
  const initialConfirmed = INITIAL_BOOKINGS.filter(
    (b) => b.slotId === slot.id && b.status === "Confirmado"
  ).length;
  return Math.max(0, slot.baseOccupied + (dynamicConfirmed - initialConfirmed));
}

function getSlotRemaining(slot) {
  return Math.max(0, slot.capacity - getSlotOccupied(slot));
}

function getOfferingRemainingTotal(offeringId) {
  return state.slots
    .filter((s) => s.offeringId === offeringId)
    .reduce((acc, s) => acc + getSlotRemaining(s), 0);
}

function hasScheduleConflict(userId, targetSlot, ignoreBookingId = null) {
  if (!userId) return false;
  return state.bookings.some((b) => {
    if (ignoreBookingId && b.id === ignoreBookingId) return false;
    if (b.studentId !== userId || b.status !== "Confirmado") return false;
    const other = state.slots.find((s) => s.id === b.slotId);
    if (!other) return false;
    return other.dateIso === targetSlot.dateIso && other.time === targetSlot.time;
  });
}

function formatDateBr(dateIso) {
  const [y, m, d] = dateIso.split("-");
  return `${d}/${m}/${y}`;
}

function formatDayHeading(dateIso, dayName) {
  const [, m, d] = dateIso.split("-");
  return `${dayName.slice(0, 3)}, ${Number(d)} de ${MONTH_NAMES[Number(m) - 1].slice(0, 3)}`;
}

function getWeekdayNameFromIso(dateIso) {
  const [y, m, d] = dateIso.split("-").map(Number);
  return FULL_WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

// ==================== ÍCONE INTERATIVO & CARROSSEL GENNERA ====================
function triggerBrandPulse() {
  document.querySelectorAll(".interactive-mark").forEach((svg) => {
    svg.classList.remove("is-pulsing");
    void svg.offsetWidth;
    svg.classList.add("is-pulsing");
    setTimeout(() => svg.classList.remove("is-pulsing"), 420);
  });
}

function setPhraseSlide(index) {
  const targetIdx = ((index % LANDING_PHRASES.length) + LANDING_PHRASES.length) % LANDING_PHRASES.length;
  if (targetIdx === ui.phraseIdx) return;

  const stage = document.getElementById("phrase-stage");
  const titleEl = document.getElementById("landing-phrase-title");
  const subEl = document.getElementById("landing-phrase-sub");

  stage.classList.add("is-switching");
  setTimeout(() => {
    ui.phraseIdx = targetIdx;
    const item = LANDING_PHRASES[targetIdx];
    titleEl.innerHTML = `${item.headline}<span class="brand-plus-light">.</span>`;
    subEl.textContent = item.sub;

    document.querySelectorAll(".phrase-dot").forEach((dot, i) => {
      const active = i === targetIdx;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", String(active));
    });

    stage.classList.remove("is-switching");
  }, 240);
}

let phraseInterval = null;
function startPhraseCarousel() {
  stopPhraseCarousel();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const prefs = getPrefs();
  if (reduced || prefs.reducedMotion || prefs.pauseDistractions || document.hidden || ui.activeView !== "landing") {
    return;
  }

  phraseInterval = setInterval(() => {
    setPhraseSlide(ui.phraseIdx + 1);
  }, 5200);
}

function stopPhraseCarousel() {
  if (phraseInterval) {
    clearInterval(phraseInterval);
    phraseInterval = null;
  }
}

// ==================== TEMA, CONFIGURAÇÕES & TECNOLOGIA ASSISTIVA ====================
function announceA11y(message) {
  const el = document.getElementById("a11y-announcer");
  if (!el) return;
  el.textContent = "";
  setTimeout(() => {
    el.textContent = message;
  }, 20);
}

function applyThemeAndA11y() {
  const prefs = getPrefs();
  const theme = state.theme || "light";
  const scale = state.fontScale || 1;
  const pct = Math.round(scale * 100);

  document.body.classList.remove("theme-dark", "theme-light", "theme-contrast");
  document.body.classList.add(`theme-${theme}`);
  document.documentElement.style.setProperty("--font-scale", String(scale));

  document.body.classList.toggle("a11y-dyslexia", Boolean(prefs.dyslexiaSpacing));
  document.body.classList.toggle("a11y-extra-focus", Boolean(prefs.extraFocus));
  document.body.classList.toggle("a11y-large-targets", Boolean(prefs.largeTargets));
  document.body.classList.toggle("a11y-reduced-motion", Boolean(prefs.reducedMotion));
  document.body.classList.toggle("a11y-pause-distractions", Boolean(prefs.pauseDistractions));

  const cvd = prefs.cvdFilter || "none";
  if (cvd === "none") {
    document.documentElement.removeAttribute("data-cvd");
  } else {
    document.documentElement.setAttribute("data-cvd", cvd);
  }

  const maskEl = document.getElementById("reading-mask");
  if (maskEl) maskEl.classList.toggle("is-hidden", !prefs.readingMask);

  document.querySelectorAll(".theme-opt").forEach((btn) => {
    const active = btn.dataset.theme === theme;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  const fontPct = document.getElementById("modal-font-pct");
  if (fontPct) fontPct.textContent = `${pct}%`;

  const slider = document.getElementById("settings-font-slider");
  if (slider) {
    slider.value = String(pct);
    const min = Number(slider.min || 88);
    const max = Number(slider.max || 152);
    const ratio = max === min ? 0 : ((pct - min) / (max - min)) * 100;
    slider.style.setProperty("--slider-value", `${Math.max(0, Math.min(100, ratio))}%`);
  }

  document.querySelectorAll("[data-pref-layout]").forEach((card) => {
    const selected = card.dataset.prefLayout === prefs.defaultLayout;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-checked", String(selected));
  });

  const switchBindings = [
    ["pref-confirm-book", "confirmBeforeBook"],
    ["pref-pause-distractions", "pauseDistractions"],
    ["pref-reduced-motion", "reducedMotion"],
    ["pref-dyslexia-spacing", "dyslexiaSpacing"],
    ["pref-reading-mask", "readingMask"],
    ["pref-extra-focus", "extraFocus"],
    ["pref-large-targets", "largeTargets"],
    ["pref-block-conflicts", "blockConflicts"],
    ["pref-auto-ics", "autoIcsHint"],
    ["pref-vlibras", "vlibras"],
  ];
  switchBindings.forEach(([id, key]) => {
    const input = document.getElementById(id);
    if (input) input.checked = Boolean(prefs[key]);
  });

  syncVlibras(Boolean(prefs.vlibras));

  const cvdSelect = document.getElementById("pref-cvd-filter");
  if (cvdSelect) {
    cvdSelect.value = cvd;
    syncCustomSelect(cvdSelect);
  }

  if (ui.activeView === "landing") {
    if (prefs.reducedMotion || prefs.pauseDistractions) stopPhraseCarousel();
    else startPhraseCarousel();
  }
}

function setSettingsTab(tabKey, shouldFocus = false) {
  closeAllCustomSelects();
  const key = SETTINGS_TAB_META[tabKey] ? tabKey : "geral";
  ui.activeSettingsTab = key;
  const meta = SETTINGS_TAB_META[key];

  document.getElementById("settings-panel-title").textContent = meta.title;
  document.getElementById("settings-panel-desc").textContent = meta.desc;

  document.querySelectorAll("[data-settings-tab]").forEach((btn) => {
    const active = btn.dataset.settingsTab === key;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
    btn.setAttribute("tabindex", active ? "0" : "-1");
    if (active && shouldFocus) btn.focus();
  });

  Object.keys(SETTINGS_TAB_META).forEach((k) => {
    const panel = document.getElementById(`settings-tab-${k}`);
    if (panel) panel.classList.toggle("is-hidden", k !== key);
  });
}

function syncSettingsAccountBox() {
  const user = getCurrentUser();
  const avatar = document.getElementById("settings-user-avatar");
  const nameEl = document.getElementById("settings-user-name");
  const subEl = document.getElementById("settings-user-sub");
  const statusEl = document.getElementById("settings-account-status");
  const detailEl = document.getElementById("settings-account-detail");
  const logoutBtn = document.getElementById("btn-settings-logout");
  const dangerZone = document.getElementById("settings-danger-zone");

  if (user) {
    const parts = user.name.trim().split(/\s+/);
    const initials = parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
    avatar.textContent = initials.toUpperCase();
    nameEl.textContent = user.name;
    subEl.textContent = `${user.role === "monitor" ? "Monitor(a)" : "Estudante"} · ${user.ra}`;
    statusEl.textContent = `${user.name} (${user.ra})`;
    detailEl.textContent = `${user.email} · ${user.role === "monitor" ? "Acesso de monitoria" : user.course || "Estudante"}`;
    logoutBtn.classList.remove("is-hidden");
    dangerZone.classList.remove("is-hidden");
  } else {
    avatar.textContent = "M+";
    nameEl.textContent = "Visitante";
    subEl.textContent = "Entre para personalizar sua conta";
    statusEl.textContent = "Nenhum usuário autenticado";
    detailEl.textContent = "Faça login para gerenciar ou excluir sua conta local.";
    logoutBtn.classList.add("is-hidden");
    dangerZone.classList.add("is-hidden");
  }
}

let lastSettingsTriggerEl = null;

function openSettingsModal(initialTab = "geral", mobileDetail = false) {
  lastSettingsTriggerEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  syncSettingsAccountBox();
  setSettingsTab(initialTab || ui.activeSettingsTab || "geral");
  applyThemeAndA11y();
  const win = document.querySelector(".settings-window");
  if (win) win.classList.toggle("is-mobile-detail", Boolean(mobileDetail));
  document.getElementById("settings-modal")?.classList.remove("is-hidden");
  const body = document.querySelector(".settings-body");
  if (body) body.scrollTop = 0;
  syncMobileChrome();
  const activeTabBtn = document.querySelector(`[data-settings-tab="${ui.activeSettingsTab}"]`);
  activeTabBtn?.focus();
}

function closeSettingsModal() {
  closeAllCustomSelects();
  const modal = document.getElementById("settings-modal");
  const wasOpen = modal && !modal.classList.contains("is-hidden");
  document.querySelector(".settings-window")?.classList.remove("is-mobile-detail");
  modal?.classList.add("is-hidden");
  syncMobileChrome();
  if (wasOpen && lastSettingsTriggerEl && document.contains(lastSettingsTriggerEl)) {
    lastSettingsTriggerEl.focus();
  }
  lastSettingsTriggerEl = null;
}

// ==================== VLIBRAS OPCIONAL (SOB DEMANDA) ====================
const vlibrasRuntime = {
  mounted: false,
  loading: false,
};

function getVlibrasHosts() {
  return Array.from(
    document.querySelectorAll("#vlibras-access-wrapper, #vlibras-app-root, #monitora-vlibras-root, div[vw]")
  );
}

function positionVlibrasShadowAccess() {
  const wrapper = document.getElementById("vlibras-access-wrapper");
  const accessEl = wrapper?.shadowRoot?.querySelector("#vlibras-access");
  if (!accessEl) return;

  accessEl.style.zIndex = "120";
  if (window.innerWidth <= 720) {
    const hasSticky = document.body.classList.contains("has-mobile-sticky-cta");
    accessEl.style.top = "auto";
    accessEl.style.bottom = hasSticky
      ? "calc(152px + env(safe-area-inset-bottom))"
      : "calc(82px + env(safe-area-inset-bottom))";
  } else {
    accessEl.style.top = "calc(50vh - 20px)";
    accessEl.style.bottom = "auto";
  }
}

function applyVlibrasVisibility(enabled) {
  const hosts = getVlibrasHosts();
  hosts.forEach((el) => {
    if (!enabled) {
      el.classList.remove("enabled");
      el.classList.add("is-vlibras-hidden");
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.setAttribute("aria-hidden", "true");
      el.inert = true;
    } else {
      if (el.hasAttribute("vw")) el.classList.add("enabled");
      el.classList.remove("is-vlibras-hidden");
      el.style.removeProperty("display");
      el.style.removeProperty("visibility");
      el.removeAttribute("aria-hidden");
      el.inert = false;
      el.style.setProperty("z-index", "120", "important");
    }
  });
  if (enabled) positionVlibrasShadowAccess();
}

function syncVlibras(enabled) {
  document.body.classList.toggle("has-vlibras-active", Boolean(enabled));

  if (!enabled) {
    applyVlibrasVisibility(false);
    return;
  }

  applyVlibrasVisibility(true);

  if (vlibrasRuntime.mounted) return;

  const initWidget = () => {
    if (vlibrasRuntime.mounted) {
      applyVlibrasVisibility(Boolean(getPrefs().vlibras));
      return;
    }
    if (window.VLibras && typeof window.VLibras.Widget === "function") {
      try {
        new window.VLibras.Widget("https://vlibras.gov.br/app");
        vlibrasRuntime.mounted = true;
        // VLibras v7 cria #vlibras-access-wrapper no Shadow DOM de forma síncrona ou após 50ms
        applyVlibrasVisibility(Boolean(getPrefs().vlibras));
        setTimeout(() => applyVlibrasVisibility(Boolean(getPrefs().vlibras)), 120);
      } catch {
        showToast("Não foi possível inicializar o VLibras neste momento.");
      }
    }
  };

  if (window.VLibras && typeof window.VLibras.Widget === "function") {
    initWidget();
    return;
  }

  if (vlibrasRuntime.loading || document.getElementById("vlibras-plugin-script")) return;
  vlibrasRuntime.loading = true;

  const script = document.createElement("script");
  script.id = "vlibras-plugin-script";
  script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  script.async = true;
  script.onload = () => {
    vlibrasRuntime.loading = false;
    initWidget();
  };
  script.onerror = () => {
    vlibrasRuntime.loading = false;
    script.remove();
    showToast("Não foi possível carregar o VLibras agora (verifique sua conexão).");
  };
  document.body.appendChild(script);
}

// ==================== AJUDA RÁPIDA / FAQ (HEURÍSTICA 10) & FOCUS TRAP ====================
let lastFaqTriggerEl = null;

function trapFocusInModal(e, modalEl) {
  if (e.key !== "Tab" || !modalEl || modalEl.classList.contains("is-hidden")) return;
  const focusables = Array.from(
    modalEl.querySelectorAll(
      'button:not([disabled]):not(.is-hidden), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null);
  if (focusables.length === 0) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openFaqModal(triggerEl = null) {
  lastFaqTriggerEl =
    triggerEl instanceof HTMLElement
      ? triggerEl
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  const modal = document.getElementById("faq-modal");
  if (!modal) return;
  modal.classList.remove("is-hidden");
  document.getElementById("btn-close-faq")?.focus();
  announceA11y("Ajuda rápida aberta.");
}

function closeFaqModal() {
  const modal = document.getElementById("faq-modal");
  const wasOpen = modal && !modal.classList.contains("is-hidden");
  modal?.classList.add("is-hidden");
  if (wasOpen && lastFaqTriggerEl && document.contains(lastFaqTriggerEl)) {
    lastFaqTriggerEl.focus();
  }
  lastFaqTriggerEl = null;
}

function speakCurrentScreen() {
  if (!("speechSynthesis" in window)) {
    showToast("Seu navegador não suporta leitura em voz alta.");
    return;
  }

  window.speechSynthesis.cancel();
  const user = getCurrentUser();
  let summary = "";

  if (ui.activeView === "landing") {
    const h = document.getElementById("landing-phrase-title")?.textContent?.trim() || "Monitora+";
    summary = `Tela inicial do Monitora+. ${h}. Você pode entrar com matrícula ou e-mail institucional, criar conta ou abrir configurações de acessibilidade.`;
  } else if (ui.activeView === "agendar") {
    if (ui.step === 1) {
      summary = `Etapa 1 de 3: Escolher monitoria. Filtre por disciplina ou busque pelo nome do monitor.`;
    } else if (ui.step === 2) {
      const title = document.getElementById("s2-title")?.textContent || "monitoria";
      const day = document.getElementById("s2-selected-day-label")?.textContent || "";
      summary = `Etapa 2 de 3: Data e horário para ${title}. Dia selecionado: ${day}. Use as setas do teclado no calendário e escolha um horário.`;
    } else {
      const title = document.getElementById("s3-title")?.textContent || "monitoria";
      const dt = document.getElementById("s3-datetime")?.textContent || "";
      summary = `Etapa 3 de 3: Confirmar atendimento de ${title}, ${dt}. Selecione um assunto rápido ou descreva sua dúvida e confirme.`;
    }
  } else if (ui.activeView === "agendamentos") {
    const count = user
      ? state.bookings.filter((b) => b.studentId === user.id && b.status === "Confirmado").length
      : 0;
    summary = `Meus Agendamentos. Você possui ${count} atendimento(s) confirmado(s).`;
  } else if (ui.activeView === "monitor") {
    summary = `Painel do Monitor. Publique novos horários com o código docente e acompanhe os alunos agendados.`;
  }

  const utter = new SpeechSynthesisUtterance(summary);
  utter.lang = "pt-BR";
  utter.rate = 1.02;

  const speakBtn = document.getElementById("btn-speak-screen");
  const stopBtn = document.getElementById("btn-stop-speak");
  stopBtn?.classList.remove("is-hidden");
  speakBtn?.setAttribute("aria-pressed", "true");

  utter.onend = utter.onerror = () => {
    stopBtn?.classList.add("is-hidden");
    speakBtn?.setAttribute("aria-pressed", "false");
  };

  window.speechSynthesis.speak(utter);
  announceA11y("Iniciando leitura da tela.");
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  document.getElementById("btn-stop-speak")?.classList.add("is-hidden");
  document.getElementById("btn-speak-screen")?.setAttribute("aria-pressed", "false");
}

function exportUserBookingsJson() {
  const user = getCurrentUser();
  const mine = user ? state.bookings.filter((b) => b.studentId === user.id) : [];
  const payload = {
    exportedAt: new Date().toISOString(),
    system: "Monitora+ UNIFSA",
    user: user ? { name: user.name, ra: user.ra, email: user.email, role: user.role } : null,
    bookings: mine.map((bk) => {
      const slot = state.slots.find((s) => s.id === bk.slotId);
      const off = slot ? getOffering(slot.offeringId) : null;
      return {
        protocol: bk.protocol,
        status: bk.status,
        subject: off?.subject || "",
        date: slot?.dateIso || "",
        time: slot?.time || "",
        location: off?.location || "",
        topic: bk.topic,
      };
    }),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `monitoraplus-dados-${user ? user.ra : "local"}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("Dados exportados em JSON.");
}

function resetPrefsToDefault() {
  state.theme = "light";
  state.fontScale = 1;
  state.prefs = { ...DEFAULT_PREFS };
  ui.step1Layout = state.prefs.defaultLayout;
  saveState();
  applyThemeAndA11y();
  if (ui.activeView === "agendar" && ui.step === 1) renderStep1();
  announceA11y("Preferências restauradas para o padrão.");
  showToast("Preferências de aparência e acessibilidade restauradas.");
}

function confirmDeleteAccount() {
  const user = getCurrentUser();
  if (!user) return;

  openConfirmDialog({
    title: "Excluir conta e dados?",
    desc: "Sua conta e os seus agendamentos salvos neste navegador serão removidos permanentemente.",
    summaryHtml: `<strong>${escapeHtml(user.name)}</strong> · Mat. ${escapeHtml(user.ra)}`,
    confirmText: "Excluir permanentemente",
    danger: true,
    onConfirm: () => {
      state.bookings = state.bookings.filter((b) => b.studentId !== user.id);
      state.users = state.users.filter((u) => u.id !== user.id);
      state.currentUserId = null;
      saveState();
      closeSettingsModal();
      renderTopbar();
      switchView("landing");
      showToast("Conta e dados locais removidos.");
    },
  });
}

function closeProfileMenu() {
  document.getElementById("profile-dropdown")?.classList.add("is-hidden");
  document.getElementById("btn-account-action")?.setAttribute("aria-expanded", "false");
}

function toggleProfileMenu() {
  const dd = document.getElementById("profile-dropdown");
  const btn = document.getElementById("btn-account-action");
  if (!dd || !btn) return;
  const willOpen = dd.classList.contains("is-hidden");
  dd.classList.toggle("is-hidden", !willOpen);
  btn.setAttribute("aria-expanded", String(willOpen));
}

function renderTopbar() {
  const user = getCurrentUser();
  const label = document.getElementById("topbar-user-label");
  const ddName = document.getElementById("profile-dd-name");
  const ddSub = document.getElementById("profile-dd-sub");
  const ddAvatar = document.getElementById("profile-dd-avatar");
  const ddRoleBadge = document.getElementById("profile-dd-role-badge");
  const ddBookingsCount = document.getElementById("profile-dd-bookings-count");
  const ddMonitorBtn = document.getElementById("btn-profile-monitor");
  const monitorTab = document.getElementById("nav-monitor-tab");
  closeProfileMenu();

  const activeCount = user
    ? state.bookings.filter((b) => b.studentId === user.id && b.status === "Confirmado").length
    : 0;

  if (user) {
    const parts = user.name.trim().split(/\s+/);
    const firstName = parts[0];
    const initials = parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
    const isMonitor = user.role === "monitor";
    const roleTag = isMonitor ? "Monitor(a)" : `Mat. ${user.ra}`;
    label.textContent = firstName;
    if (ddAvatar) ddAvatar.textContent = initials.toUpperCase();
    if (ddName) ddName.textContent = user.name;
    if (ddRoleBadge) ddRoleBadge.textContent = isMonitor ? "Monitor(a)" : "Estudante";
    if (ddSub) ddSub.textContent = `${roleTag} · ${user.email}`;
  } else {
    label.textContent = "Entrar";
    if (ddAvatar) ddAvatar.textContent = "M+";
    if (ddName) ddName.textContent = "Visitante";
    if (ddRoleBadge) ddRoleBadge.textContent = "Visitante";
    if (ddSub) ddSub.textContent = "Faça login";
  }

  if (ddBookingsCount) ddBookingsCount.textContent = String(activeCount);
  if (ddMonitorBtn) ddMonitorBtn.classList.toggle("is-hidden", !user || user.role !== "monitor");

  document.querySelector(".profile-chevron")?.classList.toggle("is-hidden", !user);
  monitorTab.classList.toggle("is-hidden", !user || user.role !== "monitor");
  document.getElementById("badge-agendamentos").textContent = String(activeCount);
  syncMobileChrome();
}

function syncMobileChrome() {
  const user = getCurrentUser();
  const activeCount = user
    ? state.bookings.filter((b) => b.studentId === user.id && b.status === "Confirmado").length
    : 0;

  const mobileMonitorTab = document.getElementById("mobile-nav-monitor-tab");
  if (mobileMonitorTab) {
    mobileMonitorTab.classList.toggle("is-hidden", !user || user.role !== "monitor");
  }

  const mobileBadge = document.getElementById("mobile-badge-agendamentos");
  if (mobileBadge) {
    mobileBadge.textContent = String(activeCount);
    mobileBadge.classList.toggle("is-hidden", activeCount <= 0);
  }

  const settingsModal = document.getElementById("settings-modal");
  const settingsOpen = Boolean(settingsModal && !settingsModal.classList.contains("is-hidden"));

  document.querySelectorAll("[data-mobile-nav]").forEach((btn) => {
    const active = !settingsOpen && btn.dataset.mobileNav === ui.activeView;
    btn.classList.toggle("is-active", active);
    if (active) {
      btn.setAttribute("aria-current", "page");
    } else {
      btn.removeAttribute("aria-current");
    }
  });

  const settingsTabBtn = document.getElementById("mobile-nav-settings-btn");
  if (settingsTabBtn) {
    settingsTabBtn.classList.toggle("is-active", settingsOpen);
    settingsTabBtn.setAttribute("aria-expanded", String(settingsOpen));
  }

  const step3Form = document.getElementById("step3-form-shell");
  const step3FormVisible = Boolean(step3Form && !step3Form.classList.contains("is-hidden"));
  const hasStickyCta =
    ui.activeView === "agendar" && (ui.step === 2 || (ui.step === 3 && step3FormVisible));
  document.body.classList.toggle("has-mobile-sticky-cta", hasStickyCta);
  if (getPrefs().vlibras) positionVlibrasShadowAccess();
}

// ==================== NAVEGAÇÃO ====================
function switchView(viewName) {
  const user = getCurrentUser();
  if (viewName !== "landing" && !user) {
    viewName = "landing";
    showToast("Faça login para acessar os horários e dados acadêmicos.");
  }
  if (viewName === "monitor" && user?.role !== "monitor") {
    viewName = "agendar";
  }

  ui.activeView = viewName;
  if (viewName !== "agendar") {
    ui.reschedulingBookingId = null;
  }
  document.body.classList.toggle("is-landing-mode", viewName === "landing");

  document.querySelectorAll(".view-section").forEach((sec) => {
    sec.classList.toggle("is-active", sec.id === `view-${viewName}`);
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    const active = link.dataset.view === viewName;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (viewName === "landing") {
    startPhraseCarousel();
  } else {
    stopPhraseCarousel();
  }

  if (viewName === "agendar") renderAgendar();
  if (viewName === "agendamentos") renderBookings();
  if (viewName === "monitor") renderMonitorPanel();
  syncMobileChrome();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==================== AUTH & OTP ASSAAD ====================
function setAuthTab(tabName) {
  ui.authTab = tabName;
  document.querySelectorAll("[data-auth-tab]").forEach((t) => {
    const active = t.dataset.authTab === tabName;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", String(active));
  });
  document.getElementById("form-login").classList.toggle("is-hidden", tabName !== "login");
  document.getElementById("form-register").classList.toggle("is-hidden", tabName !== "register");
  clearFormErrors(document.getElementById("form-login"));
  clearFormErrors(document.getElementById("form-register"));

  const switchLine = document.getElementById("assaad-switch-line");
  if (tabName === "login") {
    switchLine.innerHTML =
      'Primeiro acesso? <button type="button" class="text-accent-link" id="btn-link-to-register">Criar conta</button>';
  } else {
    switchLine.innerHTML =
      'Já possui conta? <button type="button" class="text-accent-link" id="btn-link-to-login">Entrar</button>';
  }
}

function showOtpStage(draft) {
  ui.pendingMonitorDraft = draft;
  const off = getOffering(draft.offeringId);
  const hintCode = PROFESSOR_CODES[draft.offeringId] || "IHC026";

  document.getElementById("auth-stage-main").classList.add("is-hidden");
  document.getElementById("auth-stage-otp").classList.remove("is-hidden");
  document.getElementById("otp-subtitle").textContent = `Insira o código de 6 caracteres autorizado para ${
    off ? off.subject : "a disciplina"
  }.`;
  document.getElementById("otp-hint-code").textContent = hintCode;
  clearOtpErrors();

  const boxes = Array.from(document.querySelectorAll(".otp-box"));
  boxes.forEach((b) => {
    b.value = "";
  });
  document.getElementById("btn-verify-otp").disabled = true;
  boxes[0].focus();
}

function hideOtpStage() {
  ui.pendingMonitorDraft = null;
  clearOtpErrors();
  document.getElementById("auth-stage-otp").classList.add("is-hidden");
  document.getElementById("auth-stage-main").classList.remove("is-hidden");
}

function getOtpValue() {
  return Array.from(document.querySelectorAll(".otp-box"))
    .map((b) => b.value.trim().toUpperCase())
    .join("");
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const form = document.getElementById("form-login");
  clearFormErrors(form);

  const idInput = document.getElementById("login-identifier");
  const passInput = document.getElementById("login-password");
  const identifier = idInput.value.trim().toLowerCase();
  const password = passInput.value;

  const errors = [];
  if (!identifier) {
    errors.push({ el: idInput, message: "Informe sua matrícula ou e-mail institucional." });
  }
  if (!password) {
    errors.push({ el: passInput, message: "Digite sua senha para continuar." });
  }
  if (applyFieldErrors(form, errors)) return;

  const user = state.users.find(
    (u) => (u.ra.toLowerCase() === identifier || u.email.toLowerCase() === identifier) && u.password === password
  );

  if (!user) {
    idInput.classList.add("is-invalid");
    idInput.setAttribute("aria-invalid", "true");
    setFieldError(passInput, "Matrícula/e-mail ou senha inválidos. Confira os dados e tente novamente.");
    passInput.focus();
    return;
  }

  state.currentUserId = user.id;
  saveState();
  renderTopbar();

  if (user.role === "monitor") {
    switchView("monitor");
  } else {
    ui.step = 1;
    switchView("agendar");
  }
  showToast(`Bem-vindo(a), ${user.name.split(" ")[0]}!`);
}

function validateNewAccountFields({ name, ra, email, password }) {
  const errors = [];
  const nameEl = document.getElementById("reg-name");
  const raEl = document.getElementById("reg-ra");
  const emailEl = document.getElementById("reg-email");
  const passEl = document.getElementById("reg-password");

  if (name.length < 3) {
    errors.push({ el: nameEl, message: "Informe seu nome completo (mínimo 3 caracteres)." });
  }
  if (!/^\d{5,12}$/.test(ra)) {
    errors.push({ el: raEl, message: "A matrícula deve conter de 5 a 12 números." });
  } else if (state.users.some((u) => u.ra === ra)) {
    errors.push({ el: raEl, message: "Já existe uma conta cadastrada com esta matrícula." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ el: emailEl, message: "Informe um e-mail institucional válido." });
  } else if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    errors.push({ el: emailEl, message: "Já existe uma conta cadastrada com este e-mail." });
  }
  if (password.length < 4) {
    errors.push({ el: passEl, message: "A senha deve ter no mínimo 4 caracteres." });
  }
  return errors;
}

function finalizeCreateUser({ role, name, ra, email, password, course, offeringId }) {
  const user = {
    id: `usr-${Date.now()}`,
    role,
    name,
    ra,
    email,
    password,
    course: role === "student" ? course : undefined,
    offeringId: role === "monitor" ? offeringId : undefined,
  };
  state.users.push(user);
  state.currentUserId = user.id;
  saveState();
  return user;
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const form = document.getElementById("form-register");
  clearFormErrors(form);

  const draft = {
    role: ui.regRole,
    name: document.getElementById("reg-name").value.trim(),
    ra: document.getElementById("reg-ra").value.trim(),
    email: document.getElementById("reg-email").value.trim(),
    password: document.getElementById("reg-password").value,
    course: document.getElementById("reg-course").value,
    offeringId: document.getElementById("reg-subject").value,
  };

  const errors = validateNewAccountFields(draft);
  if (applyFieldErrors(form, errors)) return;

  if (draft.role === "monitor") {
    showOtpStage(draft);
    return;
  }

  finalizeCreateUser(draft);
  form.reset();
  clearFormErrors(form);
  renderTopbar();
  ui.step = 1;
  switchView("agendar");
  showToast("Conta de estudante criada com sucesso!");
}

function handleVerifyOtpSubmit(e) {
  e.preventDefault();
  const draft = ui.pendingMonitorDraft;
  if (!draft) return;

  clearOtpErrors();
  const errEl = document.getElementById("otp-error");

  const codeEntered = getOtpValue();
  const expected = PROFESSOR_CODES[draft.offeringId];

  if (!expected || codeEntered !== expected) {
    errEl.textContent = "Código inválido para esta disciplina. Solicite o código ao professor.";
    errEl.classList.remove("is-hidden");
    const boxes = document.querySelectorAll(".otp-box");
    boxes.forEach((box) => {
      box.classList.add("is-invalid");
      box.setAttribute("aria-invalid", "true");
      box.setAttribute("aria-describedby", "otp-error");
    });
    boxes[0]?.focus();
    return;
  }

  finalizeCreateUser(draft);
  hideOtpStage();
  document.getElementById("form-register").reset();
  renderTopbar();
  switchView("monitor");
  showToast("Conta de monitor autorizada e ativada!");
}

// ==================== AGENDAR (3 ETAPAS) ====================
const STEP_CHECK_SVG = `<svg class="step-crumb-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

function getActiveReschedulingBooking() {
  if (!ui.reschedulingBookingId) return null;
  const bk = state.bookings.find((b) => b.id === ui.reschedulingBookingId && b.status === "Confirmado");
  if (!bk) {
    ui.reschedulingBookingId = null;
    return null;
  }
  return bk;
}

function syncRescheduleBanner() {
  const banner = document.getElementById("reschedule-banner");
  if (!banner) return;
  const bk = getActiveReschedulingBooking();
  if (!bk || ui.step < 2 || ui.step3Completed) {
    banner.classList.add("is-hidden");
    return;
  }
  const oldSlot = state.slots.find((s) => s.id === bk.slotId);
  const off = oldSlot ? getOffering(oldSlot.offeringId) : null;
  document.getElementById("reschedule-banner-title").textContent = `Reagendando ${bk.protocol}${
    off ? ` · ${off.shortSubject}` : ""
  }`;
  document.getElementById("reschedule-banner-desc").textContent = oldSlot
    ? `Vaga atual (${oldSlot.dayName}, ${formatDateBr(oldSlot.dateIso)} às ${oldSlot.time.split(" - ")[0]}) garantida até confirmar o novo horário.`
    : "Sua vaga atual permanece garantida até confirmar o novo horário.";
  banner.classList.remove("is-hidden");
}

function startReschedule(bookingId) {
  const bk = state.bookings.find((b) => b.id === bookingId && b.status === "Confirmado");
  if (!bk) return;
  const oldSlot = state.slots.find((s) => s.id === bk.slotId);
  const off = oldSlot ? getOffering(oldSlot.offeringId) : null;
  if (!oldSlot || !off) return;

  const altSlot = state.slots.find(
    (s) => s.offeringId === off.id && s.id !== oldSlot.id && getSlotRemaining(s) > 0
  );

  ui.reschedulingBookingId = bk.id;
  ui.selectedOfferingId = off.id;
  ui.selectedDateIso = altSlot ? altSlot.dateIso : oldSlot.dateIso;
  ui.selectedSlotId = null;
  ui.step3Completed = false;
  ui.step = 2;

  const topicEl = document.getElementById("s3-topic");
  if (topicEl) topicEl.value = bk.topic || "";

  switchView("agendar");
  announceA11y(`Reagendando atendimento ${bk.protocol}. Escolha a nova data e horário.`);
}

function cancelReschedule(returnToBookings = false) {
  ui.reschedulingBookingId = null;
  syncRescheduleBanner();
  if (returnToBookings) {
    switchView("agendamentos");
    showToast("Reagendamento cancelado. Sua vaga original foi mantida.");
  }
}

function setStep(stepNumber) {
  ui.step = stepNumber;
  if (stepNumber === 1) ui.reschedulingBookingId = null;
  if (stepNumber < 3) ui.step3Completed = false;
  renderAgendar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderStepper() {
  const c1 = document.getElementById("crumb-1");
  const c2 = document.getElementById("crumb-2");
  const c3 = document.getElementById("crumb-3");

  [c1, c2, c3].forEach((c) => c.classList.remove("is-active", "is-done"));
  c1.disabled = false;
  c2.disabled = !ui.selectedOfferingId;
  c3.disabled = !ui.selectedSlotId;

  c1.innerHTML = `<span>1. Escolher monitoria</span>`;
  c2.innerHTML = `<span>2. Data e horário</span>`;
  c3.innerHTML = `<span>3. Confirmar</span>`;

  if (ui.step === 1) c1.classList.add("is-active");
  if (ui.step === 2) {
    c1.classList.add("is-done");
    c1.innerHTML = `${STEP_CHECK_SVG}<span>1. Escolher monitoria</span>`;
    c2.classList.add("is-active");
  }
  if (ui.step === 3) {
    c1.classList.add("is-done");
    c1.innerHTML = `${STEP_CHECK_SVG}<span>1. Escolher monitoria</span>`;
    c2.classList.add("is-done");
    c2.innerHTML = `${STEP_CHECK_SVG}<span>2. Data e horário</span>`;
    if (ui.step3Completed) {
      c3.classList.add("is-done");
      c3.innerHTML = `${STEP_CHECK_SVG}<span>3. Confirmado</span>`;
    } else {
      c3.classList.add("is-active");
    }
  }

  document.getElementById("step-1").classList.toggle("is-hidden", ui.step !== 1);
  document.getElementById("step-2").classList.toggle("is-hidden", ui.step !== 2);
  document.getElementById("step-3").classList.toggle("is-hidden", ui.step !== 3);
}

function renderStep1() {
  document.querySelectorAll("[data-step1-layout]").forEach((b) => {
    const active = b.dataset.step1Layout === ui.step1Layout;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-pressed", String(active));
  });

  document.querySelectorAll("[data-mode-filter]").forEach((b) => {
    const active = b.dataset.modeFilter === ui.modeFilter;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-pressed", String(active));
  });

  const tabsEl = document.getElementById("subject-tabs");
  const subjects = ["Todas", ...OFFERINGS.map((o) => o.shortSubject)];

  tabsEl.innerHTML = subjects
    .map(
      (subj) => `
      <button
        type="button"
        class="u-tab ${ui.subjectFilter === subj ? "is-active" : ""}"
        role="tab"
        aria-selected="${ui.subjectFilter === subj}"
        data-subject-tab="${escapeHtml(subj)}"
      >
        ${escapeHtml(subj)}
      </button>
    `
    )
    .join("");

  const query = normalizeText(ui.search);
  const filteredOfferings = OFFERINGS.filter((off) => {
    if (ui.subjectFilter !== "Todas" && off.shortSubject !== ui.subjectFilter) return false;
    if (ui.modeFilter !== "Todas" && !off.mode.includes(ui.modeFilter)) return false;
    if (query) {
      const hay = normalizeText(
        `${off.subject} ${off.shortSubject} ${off.title} ${off.monitor} ${off.location} ${off.shortLocation} ${off.mode}`
      );
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  const listBox = document.getElementById("step1-list-box");
  const matrixBox = document.getElementById("step1-matrix-box");
  const emptyBox = document.getElementById("step1-empty");

  if (filteredOfferings.length === 0) {
    listBox.classList.add("is-hidden");
    matrixBox.classList.add("is-hidden");
    emptyBox.classList.remove("is-hidden");
    return;
  }

  emptyBox.classList.add("is-hidden");

  if (ui.step1Layout === "list") {
    matrixBox.classList.add("is-hidden");
    listBox.classList.remove("is-hidden");

    listBox.innerHTML = filteredOfferings
      .map((off) => {
        const free = getOfferingRemainingTotal(off.id);
        const dotClass = free === 0 ? "dot-muted" : free <= 3 ? "dot-amber" : "dot-green";
        const vacText = formatVagas(free, true);
        const initials = getMonitorInitials(off.monitor);
        const placeTag = off.shortLocation || off.location;

        return `
          <button type="button" class="list-row-btn" data-select-offering="${escapeHtml(off.id)}">
            <div class="row-left">
              <span class="monitor-monogram" aria-hidden="true">${escapeHtml(initials)}</span>
              <div class="row-body">
                <p class="row-title">${escapeHtml(off.subject)} — ${escapeHtml(off.title)}</p>
                <div class="row-meta-line">
                  <span class="row-meta">${escapeHtml(off.monitor)}</span>
                  <span class="row-loc-tag">${escapeHtml(placeTag)}</span>
                </div>
              </div>
            </div>
            <div class="row-right">
              <span class="status-dot-inline ${dotClass}" aria-hidden="true"></span>
              <span>${escapeHtml(vacText)}</span>
              <span aria-hidden="true">→</span>
            </div>
          </button>
        `;
      })
      .join("");
  } else {
    listBox.classList.add("is-hidden");
    matrixBox.classList.remove("is-hidden");

    const allowedIds = new Set(filteredOfferings.map((o) => o.id));
    const filteredSlots = state.slots.filter((s) => allowedIds.has(s.offeringId));

    const matrix = TIME_BANDS.map(() => DAYS_OF_WEEK.map(() => []));
    filteredSlots.forEach((slot) => {
      const r = TIME_BANDS.indexOf(slot.time);
      const c = DAYS_OF_WEEK.indexOf(slot.dayName);
      if (r !== -1 && c !== -1) matrix[r][c].push(slot);
    });

    const headCols = DAYS_OF_WEEK.map((d) => `<th scope="col">${escapeHtml(d)}</th>`).join("");
    const bodyRows = TIME_BANDS.map((band, rIdx) => {
      const cols = DAYS_OF_WEEK.map((_, cIdx) => {
        const items = matrix[rIdx][cIdx];
        if (items.length === 0) return `<td><span style="color:var(--text-muted);font-size:0.78rem">—</span></td>`;
        return `<td>${items
          .map((sl) => {
            const off = getOffering(sl.offeringId);
            const rem = getSlotRemaining(sl);
            return `
              <button
                type="button"
                class="matrix-slot-btn"
                data-matrix-slot="${escapeHtml(sl.id)}"
                ${rem <= 0 ? "disabled" : ""}
              >
                <strong>${escapeHtml(off.shortSubject)}</strong>
                <span>${escapeHtml(formatVagas(rem, false))} · ${formatDateBr(sl.dateIso).slice(0, 5)}</span>
              </button>
            `;
          })
          .join("")}</td>`;
      }).join("");
      return `<tr><th scope="row">${escapeHtml(band.split(" - ")[0])}</th>${cols}</tr>`;
    }).join("");

    matrixBox.innerHTML = `
      <table class="matrix-table">
        <thead><tr><th scope="col">Horário</th>${headCols}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    `;
  }
}

function renderStep2() {
  const off = getOffering(ui.selectedOfferingId);
  if (!off) return;

  document.getElementById("s2-subject").textContent = off.subject.toUpperCase();
  document.getElementById("s2-title").textContent = off.title;
  document.getElementById("s2-monitor").textContent = off.monitor;
  document.getElementById("s2-location").textContent = off.location;

  const offeringSlots = state.slots.filter((s) => s.offeringId === off.id);
  const availableDateSet = new Set(offeringSlots.filter((s) => getSlotRemaining(s) > 0).map((s) => s.dateIso));
  const anySlotDateSet = new Set(offeringSlots.map((s) => s.dateIso));

  if (!ui.selectedDateIso || !anySlotDateSet.has(ui.selectedDateIso)) {
    const firstAvail = offeringSlots.find((s) => getSlotRemaining(s) > 0) || offeringSlots[0];
    ui.selectedDateIso = firstAvail ? firstAvail.dateIso : null;
  }

  document.getElementById("cal-month-label").textContent = `${MONTH_NAMES[ui.calMonth]} ${ui.calYear}`;

  const firstDayWeekday = new Date(ui.calYear, ui.calMonth, 1).getDay();
  const daysInMonth = new Date(ui.calYear, ui.calMonth + 1, 0).getDate();
  const grid = document.getElementById("cal-days-grid");

  const cells = [];
  for (let i = 0; i < firstDayWeekday; i += 1) cells.push(`<div></div>`);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const mm = String(ui.calMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const iso = `${ui.calYear}-${mm}-${dd}`;
    const hasSlots = anySlotDateSet.has(iso);
    const hasOpen = availableDateSet.has(iso);
    const selected = ui.selectedDateIso === iso;

    cells.push(`
      <button
        type="button"
        class="cal-day-btn ${hasSlots ? "is-available" : ""} ${selected ? "is-selected" : ""}"
        data-cal-date="${iso}"
        ${hasSlots ? "" : "disabled"}
        aria-label="${day} de ${MONTH_NAMES[ui.calMonth]}${hasOpen ? ", com vagas" : hasSlots ? ", lotado" : ", indisponível"}"
      >
        ${day}
      </button>
    `);
  }

  grid.innerHTML = cells.join("");

  const daySlots = offeringSlots.filter((s) => s.dateIso === ui.selectedDateIso);
  const dayLabel = document.getElementById("s2-selected-day-label");
  const listEl = document.getElementById("s2-slots-list");
  const continueBtn = document.getElementById("btn-go-step3");

  if (!ui.selectedDateIso || daySlots.length === 0) {
    dayLabel.textContent = "Selecione um dia disponível";
    listEl.innerHTML = `<p class="step-sub">Nenhum horário cadastrado para este dia.</p>`;
    continueBtn.disabled = true;
    return;
  }

  dayLabel.textContent = formatDayHeading(ui.selectedDateIso, daySlots[0].dayName);

  const reschedBk = getActiveReschedulingBooking();
  if (
    !daySlots.some(
      (s) => s.id === ui.selectedSlotId && getSlotRemaining(s) > 0 && (!reschedBk || s.id !== reschedBk.slotId)
    )
  ) {
    ui.selectedSlotId = null;
  }

  const slotCheckSvg = `<svg class="slot-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

  listEl.innerHTML = daySlots
    .map((slot) => {
      const rem = getSlotRemaining(slot);
      const isCurrentReschedSlot = Boolean(reschedBk && slot.id === reschedBk.slotId);
      const selected = !isCurrentReschedSlot && slot.id === ui.selectedSlotId;
      const startTime = slot.time.split(" - ")[0];
      const vacLabel = isCurrentReschedSlot ? "Horário atual" : formatVagas(rem, false);
      const disabled = isCurrentReschedSlot || rem <= 0;

      return `
        <button
          type="button"
          class="slot-pick-btn ${selected ? "is-selected" : ""}"
          data-pick-slot="${escapeHtml(slot.id)}"
          aria-pressed="${selected}"
          ${disabled ? "disabled" : ""}
        >
          <span class="slot-pick-main">
            ${selected ? slotCheckSvg : ""}
            <span class="slot-time-mono">${escapeHtml(startTime)}</span>
          </span>
          <span class="slot-vac-label">${escapeHtml(vacLabel)}</span>
        </button>
      `;
    })
    .join("");

  continueBtn.disabled = !ui.selectedSlotId;
}

function syncTopicChips() {
  const val = document.getElementById("s3-topic").value.trim();
  document.querySelectorAll("#s3-topic-chips .topic-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.topic === val);
  });
}

function renderStep3() {
  const slot = state.slots.find((s) => s.id === ui.selectedSlotId);
  const off = slot ? getOffering(slot.offeringId) : null;
  if (!slot || !off) return;

  const reschedBk = getActiveReschedulingBooking();
  ui.step3Completed = false;
  clearFormErrors(document.getElementById("form-confirm-booking"));
  document.getElementById("step3-form-shell").classList.remove("is-hidden");
  document.getElementById("step3-success-shell").classList.add("is-hidden");

  const headingEl = document.getElementById("s3-form-heading");
  const submitBtn = document.getElementById("btn-s3-submit");
  if (headingEl) headingEl.textContent = reschedBk ? "Confirmar reagendamento" : "Confirmar atendimento";
  if (submitBtn) submitBtn.textContent = reschedBk ? "Confirmar novo horário" : "Confirmar agendamento";

  document.getElementById("s3-subject").textContent = off.subject.toUpperCase();
  document.getElementById("s3-title").textContent = off.title;
  document.getElementById("s3-datetime").innerHTML = `${escapeHtml(slot.dayName)}, ${formatDateBr(
    slot.dateIso
  )}<br>${escapeHtml(slot.time.replace(" - ", " — "))}`;
  document.getElementById("s3-monitor").textContent = off.monitor;
  document.getElementById("s3-location").textContent = off.location;
  const remCount = getSlotRemaining(slot);
  document.getElementById("s3-vacancies").textContent = `${remCount} de ${slot.capacity} ${
    remCount === 1 ? "livre" : "livres"
  }`;

  const user = getCurrentUser();
  if (!user) {
    switchView("landing");
    return;
  }

  document.getElementById("s3-user-display").textContent = `${user.name} (${user.ra})`;
  syncTopicChips();

  const errBox = document.getElementById("s3-error-box");
  errBox.classList.add("is-hidden");
  if (user && hasScheduleConflict(user.id, slot, reschedBk?.id || null)) {
    errBox.textContent = `Você já possui outro atendimento confirmado em ${slot.dayName} às ${slot.time}.`;
    errBox.classList.remove("is-hidden");
  }
}

function renderAgendar() {
  renderStepper();
  syncRescheduleBanner();
  if (ui.step === 1) renderStep1();
  if (ui.step === 2) renderStep2();
  if (ui.step === 3) renderStep3();
  syncMobileChrome();
}

function handleConfirmBooking(e) {
  e.preventDefault();
  const form = document.getElementById("form-confirm-booking");
  const errBox = document.getElementById("s3-error-box");
  clearFormErrors(form);

  const slot = state.slots.find((s) => s.id === ui.selectedSlotId);
  const off = slot ? getOffering(slot.offeringId) : null;
  if (!slot || !off) return;

  const user = getCurrentUser();
  if (!user) {
    switchView("landing");
    return;
  }

  const reschedBk = getActiveReschedulingBooking();
  const topicEl = document.getElementById("s3-topic");
  const topic = topicEl.value.trim();
  if (topic.length < 4) {
    setFieldError(topicEl, "Descreva brevemente sua dúvida (mínimo 4 caracteres).");
    topicEl.focus();
    topicEl.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  if (reschedBk && slot.id === reschedBk.slotId) {
    errBox.textContent = "Selecione um horário diferente do atual para reagendar.";
    errBox.classList.remove("is-hidden");
    return;
  }

  if (getSlotRemaining(slot) <= 0) {
    errBox.textContent = "As vagas deste horário acabaram de ser preenchidas.";
    errBox.classList.remove("is-hidden");
    return;
  }

  if (getPrefs().blockConflicts && hasScheduleConflict(user.id, slot, reschedBk?.id || null)) {
    errBox.textContent = `Você já possui um atendimento confirmado em ${slot.dayName} às ${slot.time}.`;
    errBox.classList.remove("is-hidden");
    return;
  }

  const executeBooking = () => {
    if (getSlotRemaining(slot) <= 0) {
      errBox.textContent = "As vagas deste horário acabaram de ser preenchidas.";
      errBox.classList.remove("is-hidden");
      return;
    }

    let protocol = "";
    let undoRescheduleFn = null;
    const isReschedule = Boolean(reschedBk);

    if (reschedBk) {
      const oldSlotId = reschedBk.slotId;
      const oldTopic = reschedBk.topic;
      reschedBk.slotId = slot.id;
      reschedBk.topic = topic;
      protocol = reschedBk.protocol;
      ui.lastCreatedBookingId = reschedBk.id;
      ui.reschedulingBookingId = null;

      undoRescheduleFn = () => {
        const prevSlot = state.slots.find((s) => s.id === oldSlotId);
        if (!prevSlot || getSlotRemaining(prevSlot) <= 0) {
          showToast("O horário anterior não possui mais vagas disponíveis.");
          return;
        }
        reschedBk.slotId = oldSlotId;
        reschedBk.topic = oldTopic;
        saveState();
        renderTopbar();
        if (ui.activeView === "agendamentos") renderBookings();
        showToast(`Reagendamento desfeito (${protocol}).`);
      };
    } else {
      const seq = String(state.nextSeq).padStart(3, "0");
      state.nextSeq += 1;
      protocol = `#MON-2026-${seq}`;

      const booking = {
        id: `bk-${Date.now()}`,
        protocol,
        studentId: user.id,
        slotId: slot.id,
        topic,
        status: "Confirmado",
        createdAt: new Date().toLocaleString("pt-BR"),
      };

      state.bookings.push(booking);
      ui.lastCreatedBookingId = booking.id;
    }

    ui.step3Completed = true;
    saveState();
    renderTopbar();

    const successTitle = document.getElementById("success-title");
    const successSub = document.getElementById("success-sub");
    if (successTitle) successTitle.textContent = isReschedule ? "Monitoria reagendada" : "Monitoria confirmada";
    if (successSub) {
      successSub.textContent = isReschedule
        ? "Seu horário foi atualizado mantendo o mesmo protocolo abaixo."
        : "Seu atendimento está reservado. Guarde o código de protocolo abaixo.";
    }

    document.getElementById("success-protocol").textContent = protocol;
    document.getElementById("success-summary").innerHTML = `
      <div><dt>Estudante</dt><dd>${escapeHtml(user.name)}</dd></div>
      <div><dt>Disciplina</dt><dd>${escapeHtml(off.subject)}</dd></div>
      <div><dt>Data e horário</dt><dd>${escapeHtml(slot.dayName)}, ${formatDateBr(slot.dateIso)} · ${escapeHtml(slot.time)}</dd></div>
      <div><dt>Monitor</dt><dd>${escapeHtml(off.monitor)}</dd></div>
      <div class="success-grid-wide"><dt>Local</dt><dd>${escapeHtml(off.location)}</dd></div>
    `;

    document.getElementById("btn-download-ics")?.classList.toggle("is-emphasized", Boolean(getPrefs().autoIcsHint));
    document.getElementById("step3-form-shell").classList.add("is-hidden");
    document.getElementById("step3-success-shell").classList.remove("is-hidden");
    renderStepper();
    syncRescheduleBanner();
    syncMobileChrome();
    announceA11y(
      isReschedule
        ? `Monitoria reagendada com sucesso. Protocolo ${protocol}.`
        : `Agendamento confirmado. Protocolo ${protocol}.`
    );
    showToast(
      isReschedule ? `Horário reagendado (${protocol})` : `Agendamento confirmado (${protocol})`,
      undoRescheduleFn,
      "success"
    );
  };

  if (!getPrefs().confirmBeforeBook) {
    executeBooking();
    return;
  }

  openConfirmDialog({
    title: reschedBk ? "Confirmar troca de horário?" : "Confirmar agendamento?",
    desc: reschedBk
      ? "A vaga anterior só será liberada após confirmar este novo horário."
      : "Confira os dados abaixo antes de reservar sua vaga.",
    summaryHtml: `
      <strong>${escapeHtml(off.subject)}</strong><br>
      ${escapeHtml(slot.dayName)}, ${formatDateBr(slot.dateIso)} · ${escapeHtml(slot.time)}<br>
      ${escapeHtml(off.monitor)} · ${escapeHtml(off.location)}<br>
      <strong>Dúvida:</strong> ${escapeHtml(topic)}
    `,
    confirmText: reschedBk ? "Sim, trocar horário" : "Sim, confirmar vaga",
    danger: false,
    onConfirm: executeBooking,
  });
}

// ==================== MEUS AGENDAMENTOS ====================
function renderBookings() {
  const user = getCurrentUser();
  const subEl = document.getElementById("bookings-owner-sub");
  const listEl = document.getElementById("bookings-list");

  if (!user) {
    subEl.textContent = "Entre na sua conta para acompanhar seus atendimentos.";
    listEl.innerHTML = `
      <div class="empty-box" style="border:none">
        <p>Você ainda não entrou em uma conta.</p>
        <button type="button" class="btn btn-primary" id="btn-bookings-login">Ir para Login / Criar conta</button>
      </div>
    `;
    return;
  }

  subEl.textContent = `Atendimentos de ${user.name} (Mat. ${user.ra})`;

  const mine = state.bookings.filter((b) => b.studentId === user.id);
  const filtered = mine.filter((b) => (ui.bookingFilter === "todos" ? true : b.status === ui.bookingFilter));

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="empty-box" style="border:none">
        <p>Nenhum agendamento encontrado neste filtro.</p>
        <button type="button" class="btn btn-primary" id="btn-bookings-go-agendar">Agendar monitoria →</button>
      </div>
    `;
    return;
  }

  const statusRank = { Confirmado: 0, "Concluído": 1, Cancelado: 2 };
  listEl.innerHTML = filtered
    .slice()
    .reverse()
    .sort((a, b) => (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9))
    .map((bk) => {
      const slot = state.slots.find((s) => s.id === bk.slotId);
      const off = slot ? getOffering(slot.offeringId) : null;
      if (!slot || !off) return "";

      const dateParts = getDateBadgeParts(slot.dateIso, slot.dayName);
      const isInactive = bk.status !== "Confirmado";

      return `
        <div class="booking-row ${isInactive ? "is-status-inactive" : "is-status-active"}">
          <div class="booking-main">
            <div class="booking-date-block" aria-hidden="true">
              <span class="booking-date-day">${escapeHtml(dateParts.day)}</span>
              <span class="booking-date-month">${escapeHtml(dateParts.month)}</span>
              <span class="booking-date-wk">${escapeHtml(dateParts.weekday)}</span>
            </div>
            <div class="booking-info">
              <div class="booking-meta-top">
                <span class="mono-badge">${escapeHtml(bk.protocol)}</span>
                <span class="status-tag is-${escapeHtml(bk.status)}">${escapeHtml(bk.status)}</span>
              </div>
              <p class="row-title">${escapeHtml(off.subject)} — ${escapeHtml(off.title)}</p>
              <p class="row-meta">
                ${escapeHtml(slot.dayName)}, ${formatDateBr(slot.dateIso)} · ${escapeHtml(slot.time)} · ${escapeHtml(
        off.shortLocation || off.location
      )}
              </p>
              <p class="row-meta" style="margin-top:4px">Dúvida: ${escapeHtml(bk.topic)}</p>
            </div>
          </div>
          <div class="booking-actions">
            ${
              bk.status === "Confirmado"
                ? `<button type="button" class="btn btn-secondary" data-reschedule-bk="${escapeHtml(bk.id)}">Reagendar</button>
                   <button type="button" class="btn btn-secondary" data-ics="${escapeHtml(bk.id)}">.ics</button>
                   <button type="button" class="btn btn-danger" data-cancel-bk="${escapeHtml(bk.id)}">Cancelar</button>`
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");
}

// ==================== PAINEL DO MONITOR ====================
function renderMonitorPanel() {
  const user = getCurrentUser();
  if (!user || user.role !== "monitor") {
    switchView("landing");
    return;
  }

  const off = getOffering(user.offeringId);
  const subjectName = off ? off.subject : "Disciplina não vinculada";
  const expectedCode = PROFESSOR_CODES[user.offeringId] || "";

  document.getElementById("ms-offering-display").value = subjectName;
  document.getElementById("ms-prof-code").placeholder = expectedCode || "Ex.: IHC026";
  document.getElementById(
    "monitor-sub"
  ).textContent = `Disciplina vinculada: ${subjectName}. Apenas agendamentos desta matéria aparecem aqui.`;

  const listEl = document.getElementById("monitor-bookings-list");
  const disciplineBookings = state.bookings.filter((bk) => {
    const slot = state.slots.find((s) => s.id === bk.slotId);
    return Boolean(slot && user.offeringId && slot.offeringId === user.offeringId);
  });

  const relevantBookings =
    ui.monitorFilter === "active"
      ? disciplineBookings.filter((bk) => bk.status === "Confirmado")
      : disciplineBookings;

  document.getElementById("monitor-bookings-count").textContent = String(relevantBookings.length);

  if (relevantBookings.length === 0) {
    listEl.innerHTML = `<div class="empty-box" style="border:none"><p>Nenhum aluno agendado nesta disciplina${
      ui.monitorFilter === "active" ? " no momento" : ""
    }.</p></div>`;
    return;
  }

  listEl.innerHTML = relevantBookings
    .slice()
    .reverse()
    .map((bk) => {
      const slot = state.slots.find((s) => s.id === bk.slotId);
      const stu = getUserById(bk.studentId);
      if (!slot) return "";

      const dateParts = getDateBadgeParts(slot.dateIso, slot.dayName);
      const isInactive = bk.status !== "Confirmado";

      return `
        <div class="booking-row ${isInactive ? "is-status-inactive" : "is-status-active"}">
          <div class="booking-main">
            <div class="booking-date-block" aria-hidden="true">
              <span class="booking-date-day">${escapeHtml(dateParts.day)}</span>
              <span class="booking-date-month">${escapeHtml(dateParts.month)}</span>
              <span class="booking-date-wk">${escapeHtml(dateParts.weekday)}</span>
            </div>
            <div class="booking-info">
              <div class="booking-meta-top">
                <span class="mono-badge">${escapeHtml(bk.protocol)}</span>
                <span class="status-tag is-${escapeHtml(bk.status)}">${escapeHtml(bk.status)}</span>
              </div>
              <p class="row-title">${escapeHtml(stu ? stu.name : "Estudante")} (${escapeHtml(stu ? stu.ra : "—")})</p>
              <p class="row-meta">${escapeHtml(slot.dayName)}, ${formatDateBr(slot.dateIso)} · ${escapeHtml(slot.time)}</p>
              <p class="row-meta" style="margin-top:4px">Dúvida: ${escapeHtml(bk.topic)}</p>
            </div>
          </div>
          <div class="booking-actions">
            ${
              bk.status === "Confirmado"
                ? `<button type="button" class="btn btn-secondary" data-complete-bk="${escapeHtml(
                    bk.id
                  )}">Concluir</button>`
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");
}

function handlePublishNewSlot(e) {
  e.preventDefault();
  const form = document.getElementById("form-new-slot");
  clearFormErrors(form);

  const user = getCurrentUser();
  if (!user || user.role !== "monitor") return;

  const offeringId = user.offeringId;
  const expectedCode = PROFESSOR_CODES[offeringId];
  const dateEl = document.getElementById("ms-date");
  const timeEl = document.getElementById("ms-time");
  const capEl = document.getElementById("ms-capacity");
  const codeEl = document.getElementById("ms-prof-code");

  const dateIso = dateEl.value;
  const time = timeEl.value;
  const capacity = Number(capEl.value);
  const profCode = codeEl.value.trim().toUpperCase();

  const errors = [];
  if (!dateIso) {
    errors.push({ el: dateEl, message: "Selecione a data do atendimento." });
  }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 15) {
    errors.push({ el: capEl, message: "Informe um limite entre 1 e 15 vagas." });
  }
  if (!profCode) {
    errors.push({ el: codeEl, message: "Informe o código autorizado pelo docente." });
  } else if (!expectedCode || profCode !== expectedCode) {
    errors.push({ el: codeEl, message: "Código do professor inválido para esta disciplina." });
  }

  if (applyFieldErrors(form, errors)) return;

  const off = getOffering(offeringId);
  const dayName = getWeekdayNameFromIso(dateIso);

  openConfirmDialog({
    title: "Publicar horário na agenda?",
    desc: "Este horário ficará disponível para agendamento dos estudantes.",
    summaryHtml: `
      <strong>${escapeHtml(off ? off.subject : "")}</strong><br>
      ${escapeHtml(dayName)}, ${formatDateBr(dateIso)} · ${escapeHtml(time)}<br>
      <strong>Vagas:</strong> ${capacity}
    `,
    confirmText: "Sim, publicar horário",
    danger: false,
    onConfirm: () => {
      const newSlot = {
        id: `sl-${Date.now()}`,
        offeringId,
        dateIso,
        dayName,
        time,
        capacity,
        baseOccupied: 0,
      };

      state.slots.push(newSlot);
      saveState();
      document.getElementById("ms-prof-code").value = "";
      showToast(`Novo horário publicado (${dayName}, ${formatDateBr(dateIso)} às ${time.split(" - ")[0]}).`);
      renderMonitorPanel();
    },
  });
}

// ==================== UTILITÁRIOS: MODAL, .ICS, TOAST ====================
let pendingConfirmCallback = null;
let lastConfirmTriggerEl = null;

function openConfirmDialog({ title, desc, summaryHtml = "", confirmText = "Confirmar", danger = false, onConfirm }) {
  lastConfirmTriggerEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const modal = document.getElementById("confirm-modal");
  const summaryEl = document.getElementById("confirm-modal-summary");
  const proceedBtn = document.getElementById("btn-confirm-proceed");

  document.getElementById("confirm-modal-title").textContent = title;
  document.getElementById("confirm-modal-desc").textContent = desc;

  if (summaryHtml) {
    summaryEl.innerHTML = summaryHtml;
    summaryEl.classList.remove("is-hidden");
  } else {
    summaryEl.innerHTML = "";
    summaryEl.classList.add("is-hidden");
  }

  proceedBtn.textContent = confirmText;
  proceedBtn.classList.toggle("btn-danger", danger);
  proceedBtn.classList.toggle("btn-primary", !danger);

  pendingConfirmCallback = onConfirm;
  modal.classList.remove("is-hidden");
  proceedBtn.focus();
}

function closeConfirmDialog() {
  const modal = document.getElementById("confirm-modal");
  const wasOpen = modal && !modal.classList.contains("is-hidden");
  pendingConfirmCallback = null;
  modal?.classList.add("is-hidden");
  if (wasOpen && lastConfirmTriggerEl && document.contains(lastConfirmTriggerEl)) {
    lastConfirmTriggerEl.focus();
  }
  lastConfirmTriggerEl = null;
}

function downloadIcs(bookingId) {
  const bk = state.bookings.find((b) => b.id === bookingId);
  const slot = bk ? state.slots.find((s) => s.id === bk.slotId) : null;
  const off = slot ? getOffering(slot.offeringId) : null;
  if (!bk || !slot || !off) return;

  const dateCompact = slot.dateIso.replaceAll("-", "");
  const [startRaw, endRaw] = slot.time.split(" - ");
  const start = startRaw.replace(":", "") + "00";
  const end = endRaw.replace(":", "") + "00";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Monitora+//PT-BR",
    "BEGIN:VEVENT",
    `UID:${bk.id}@monitoraplus`,
    `DTSTART:${dateCompact}T${start}`,
    `DTEND:${dateCompact}T${end}`,
    `SUMMARY:Monitoria - ${off.subject}`,
    `DESCRIPTION:Protocolo ${bk.protocol} | ${off.monitor} | Dúvida: ${bk.topic}`,
    `LOCATION:${off.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `monitoria-${bk.protocol.replace("#", "")}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("Lembrete .ics baixado.");
}

async function copyProof(bookingId) {
  const bk = state.bookings.find((b) => b.id === bookingId);
  const slot = bk ? state.slots.find((s) => s.id === bk.slotId) : null;
  const off = slot ? getOffering(slot.offeringId) : null;
  const usr = bk ? getUserById(bk.studentId) : null;
  if (!bk || !slot || !off || !usr) return;

  const text = `Comprovante Monitora+ (${bk.protocol})\nEstudante: ${usr.name}\nDisciplina: ${off.subject}\nData: ${slot.dayName}, ${formatDateBr(slot.dateIso)} às ${slot.time}\nLocal: ${off.location}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Comprovante copiado.");
  } catch {
    showToast(`Protocolo: ${bk.protocol}`);
  }
}

const TOAST_ICONS = {
  success: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
  error: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  info: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
};

function detectToastCategory(msg, onUndo) {
  const lower = String(msg || "").toLowerCase();
  if (lower.includes("não suporta") || lower.includes("erro") || lower.includes("inválido")) return "error";
  if (lower.includes("cancelado") || lower.includes("removidos") || lower.includes("desfeita") || onUndo) {
    if (lower.includes("concluído")) return "success";
    return "warning";
  }
  if (
    lower.includes("confirmado") ||
    lower.includes("criada") ||
    lower.includes("ativada") ||
    lower.includes("publicado") ||
    lower.includes("concluído") ||
    lower.includes("desfeito") ||
    lower.includes("copiado") ||
    lower.includes("exportados") ||
    lower.includes("baixado") ||
    lower.includes("conectado") ||
    lower.includes("restauradas")
  ) {
    return "success";
  }
  return "info";
}

let toastTimer = null;
let toastRemainingMs = 0;
let toastStartedAt = 0;
let currentToastUndo = null;

function hideToast() {
  const el = document.getElementById("toast");
  clearTimeout(toastTimer);
  toastTimer = null;
  currentToastUndo = null;
  toastRemainingMs = 0;
  if (el) {
    el.dataset.paused = "false";
    el.classList.add("is-hidden");
  }
}

function pauseToastTimer() {
  const el = document.getElementById("toast");
  if (!el || el.classList.contains("is-hidden") || !toastTimer) return;
  clearTimeout(toastTimer);
  toastTimer = null;
  toastRemainingMs = Math.max(400, toastRemainingMs - (Date.now() - toastStartedAt));
  el.dataset.paused = "true";
}

function resumeToastTimer() {
  const el = document.getElementById("toast");
  if (!el || el.classList.contains("is-hidden") || toastTimer || toastRemainingMs <= 0) return;
  el.dataset.paused = "false";
  toastStartedAt = Date.now();
  toastTimer = setTimeout(hideToast, toastRemainingMs);
}

function showToast(msg, onUndo = null, explicitCategory = null) {
  const el = document.getElementById("toast");
  const iconEl = document.getElementById("toast-icon");
  const msgEl = document.getElementById("toast-msg");
  const subEl = document.getElementById("toast-sub");
  const undoBtn = document.getElementById("toast-undo-btn");
  const progressEl = document.getElementById("toast-progress");
  if (!el || !msgEl) return;

  const hasUndo = typeof onUndo === "function";
  const category = explicitCategory || detectToastCategory(msg, hasUndo);
  const duration = hasUndo ? 6000 : 3400;

  el.dataset.category = category;
  el.dataset.paused = "false";
  el.style.setProperty("--toast-duration", `${duration}ms`);

  if (iconEl) iconEl.innerHTML = TOAST_ICONS[category] || TOAST_ICONS.info;
  msgEl.textContent = msg;

  if (subEl) {
    if (hasUndo) {
      subEl.textContent = "Toque em Desfazer se quiser restaurar.";
      subEl.classList.remove("is-hidden");
    } else {
      subEl.textContent = "";
      subEl.classList.add("is-hidden");
    }
  }

  currentToastUndo = hasUndo ? onUndo : null;
  undoBtn?.classList.toggle("is-hidden", !currentToastUndo);

  if (progressEl) {
    progressEl.style.animation = "none";
    void progressEl.offsetWidth;
    progressEl.style.animation = "";
  }

  el.classList.remove("is-hidden");
  clearTimeout(toastTimer);
  toastRemainingMs = duration;
  toastStartedAt = Date.now();
  toastTimer = setTimeout(hideToast, duration);
}

// ==================== EVENTOS ====================
function bindEvents() {
  // Ícone interativo
  document.querySelectorAll(".interactive-brand-trigger").forEach((el) => {
    el.addEventListener("click", triggerBrandPulse);
  });

  // Carrossel Gennera
  document.querySelectorAll(".phrase-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      setPhraseSlide(Number(dot.dataset.phraseIdx));
      startPhraseCarousel();
    });
  });

  const carouselArea = document.getElementById("landing-carousel-area");
  carouselArea.addEventListener("pointerenter", stopPhraseCarousel);
  carouselArea.addEventListener("pointerleave", startPhraseCarousel);
  carouselArea.addEventListener("focusin", stopPhraseCarousel);
  carouselArea.addEventListener("focusout", startPhraseCarousel);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopPhraseCarousel();
    else startPhraseCarousel();
  });

  // Topbar & Navegação
  document.getElementById("btn-brand-home").addEventListener("click", () => {
    triggerBrandPulse();
    switchView("landing");
  });

  const performLogout = () => {
    state.currentUserId = null;
    saveState();
    closeProfileMenu();
    closeSettingsModal();
    renderTopbar();
    hideOtpStage();
    switchView("landing");
    showToast("Sessão encerrada.");
  };

  document.getElementById("btn-account-action").addEventListener("click", (e) => {
    e.stopPropagation();
    if (getCurrentUser()) {
      toggleProfileMenu();
    } else {
      switchView("landing");
    }
  });

  document.getElementById("btn-profile-bookings")?.addEventListener("click", () => {
    closeProfileMenu();
    switchView("agendamentos");
  });
  document.getElementById("btn-profile-monitor")?.addEventListener("click", () => {
    closeProfileMenu();
    switchView("monitor");
  });
  document.getElementById("btn-profile-a11y")?.addEventListener("click", () => {
    closeProfileMenu();
    openSettingsModal("acessibilidade", true);
  });
  document.getElementById("btn-profile-account")?.addEventListener("click", () => {
    closeProfileMenu();
    openSettingsModal("conta", true);
  });
  document.getElementById("btn-profile-settings")?.addEventListener("click", () => {
    closeProfileMenu();
    openSettingsModal("geral", false);
  });
  document.getElementById("btn-profile-faq")?.addEventListener("click", () => {
    closeProfileMenu();
    openFaqModal(document.getElementById("btn-account-action"));
  });
  document.getElementById("btn-close-faq")?.addEventListener("click", closeFaqModal);
  document.getElementById("btn-close-faq-foot")?.addEventListener("click", closeFaqModal);
  document.getElementById("faq-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "faq-modal") closeFaqModal();
  });
  document.getElementById("btn-cancel-reschedule")?.addEventListener("click", () => cancelReschedule(true));
  document.getElementById("btn-profile-export")?.addEventListener("click", () => {
    closeProfileMenu();
    exportUserBookingsJson();
  });
  document.getElementById("btn-profile-logout")?.addEventListener("click", performLogout);

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#profile-menu-wrap")) closeProfileMenu();
    if (!e.target.closest(".bc-select-wrap") && !e.target.closest(".bc-select-popover")) {
      closeAllCustomSelects();
    }
  });

  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.view === "agendar") ui.step = 1;
      switchView(btn.dataset.view);
    });
  });

  document.querySelectorAll("[data-mobile-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeProfileMenu();
      closeSettingsModal();
      const targetView = btn.dataset.mobileNav;
      if (targetView === "agendar") ui.step = 1;
      switchView(targetView);
    });
  });

  document.getElementById("mobile-nav-settings-btn")?.addEventListener("click", () => {
    closeProfileMenu();
    openSettingsModal("geral", false);
  });

  document.querySelectorAll(".theme-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.theme = btn.dataset.theme;
      saveState();
      applyThemeAndA11y();
    });
  });

  const incFont = () => {
    state.fontScale = Math.min(1.52, Number(((state.fontScale || 1) + 0.08).toFixed(2)));
    saveState();
    applyThemeAndA11y();
    announceA11y(`Tamanho da fonte ${Math.round(state.fontScale * 100)} porcento.`);
  };
  const decFont = () => {
    state.fontScale = Math.max(0.88, Number(((state.fontScale || 1) - 0.08).toFixed(2)));
    saveState();
    applyThemeAndA11y();
    announceA11y(`Tamanho da fonte ${Math.round(state.fontScale * 100)} porcento.`);
  };

  document.getElementById("btn-modal-font-inc")?.addEventListener("click", incFont);
  document.getElementById("btn-modal-font-dec")?.addEventListener("click", decFont);

  document.getElementById("settings-font-slider")?.addEventListener("input", (e) => {
    const pct = Number(e.target.value || 100);
    state.fontScale = Number((pct / 100).toFixed(2));
    saveState();
    applyThemeAndA11y();
  });

  // Central de Configurações & Tecnologia Assistiva
  document.getElementById("btn-open-settings-topbar")?.addEventListener("click", () => openSettingsModal("geral", false));
  document.getElementById("btn-open-settings-landing")?.addEventListener("click", () => openSettingsModal("aparencia", false));
  document.getElementById("btn-mobile-settings-landing")?.addEventListener("click", () => openSettingsModal("geral", false));
  document.getElementById("btn-settings-mobile-back")?.addEventListener("click", () => {
    document.querySelector(".settings-window")?.classList.remove("is-mobile-detail");
  });
  document.getElementById("btn-close-settings")?.addEventListener("click", closeSettingsModal);
  document.getElementById("btn-close-settings-mobile")?.addEventListener("click", closeSettingsModal);
  document.getElementById("settings-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "settings-modal") closeSettingsModal();
  });

  const settingsTablist = document.getElementById("settings-tablist");
  settingsTablist?.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-settings-tab]");
    if (!tab) return;
    setSettingsTab(tab.dataset.settingsTab);
    document.querySelector(".settings-window")?.classList.add("is-mobile-detail");
    const body = document.querySelector(".settings-body");
    if (body) body.scrollTop = 0;
  });
  settingsTablist?.addEventListener("keydown", (e) => {
    const tabs = Array.from(settingsTablist.querySelectorAll("[data-settings-tab]"));
    const cur = tabs.indexOf(document.activeElement);
    if (cur === -1) return;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (cur + 1) % tabs.length;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (cur - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    if (next !== -1) {
      e.preventDefault();
      setSettingsTab(tabs[next].dataset.settingsTab, true);
    }
  });

  document.querySelectorAll("[data-pref-layout]").forEach((card) => {
    card.addEventListener("click", () => {
      const val = card.dataset.prefLayout;
      getPrefs().defaultLayout = val;
      ui.step1Layout = val;
      saveState();
      applyThemeAndA11y();
      if (ui.activeView === "agendar" && ui.step === 1) renderStep1();
      announceA11y(`Visualização padrão definida para ${val === "matrix" ? "grade semanal" : "lista organizada"}.`);
    });
  });

  const switchPrefMap = [
    ["pref-confirm-book", "confirmBeforeBook", "Confirmação antes de concluir"],
    ["pref-pause-distractions", "pauseDistractions", "Pausar distrações"],
    ["pref-reduced-motion", "reducedMotion", "Reduzir animações"],
    ["pref-dyslexia-spacing", "dyslexiaSpacing", "Espaçamento para Dislexia"],
    ["pref-reading-mask", "readingMask", "Guia de leitura"],
    ["pref-extra-focus", "extraFocus", "Foco extra visível"],
    ["pref-large-targets", "largeTargets", "Alvos de toque ampliados"],
    ["pref-block-conflicts", "blockConflicts", "Bloqueio de choque de horário"],
    ["pref-auto-ics", "autoIcsHint", "Destaque de lembrete .ics"],
    ["pref-vlibras", "vlibras", "Tradutor em Libras (VLibras)"],
  ];
  switchPrefMap.forEach(([id, key, label]) => {
    document.getElementById(id)?.addEventListener("change", (e) => {
      getPrefs()[key] = Boolean(e.target.checked);
      saveState();
      applyThemeAndA11y();
      announceA11y(`${label} ${e.target.checked ? "ativado" : "desativado"}.`);
    });
  });

  document.getElementById("pref-cvd-filter")?.addEventListener("change", (e) => {
    getPrefs().cvdFilter = e.target.value;
    saveState();
    applyThemeAndA11y();
    announceA11y(`Filtro de daltonismo alterado para ${e.target.selectedOptions[0]?.textContent || e.target.value}.`);
  });

  document.getElementById("btn-speak-screen")?.addEventListener("click", speakCurrentScreen);
  document.getElementById("btn-stop-speak")?.addEventListener("click", stopSpeaking);
  document.getElementById("btn-export-data")?.addEventListener("click", exportUserBookingsJson);
  document.getElementById("btn-reset-prefs")?.addEventListener("click", resetPrefsToDefault);
  document.getElementById("btn-settings-logout")?.addEventListener("click", () => {
    state.currentUserId = null;
    saveState();
    closeSettingsModal();
    renderTopbar();
    hideOtpStage();
    switchView("landing");
    showToast("Sessão encerrada.");
  });
  document.getElementById("btn-settings-delete-account")?.addEventListener("click", confirmDeleteAccount);

  // Régua / Guia de leitura (acompanha cursor e foco de teclado)
  const updateMaskY = (yPx) => {
    if (!getPrefs().readingMask) return;
    document.getElementById("reading-mask")?.style.setProperty("--mask-y", `${Math.round(yPx)}px`);
  };
  document.addEventListener("pointermove", (e) => updateMaskY(e.clientY), { passive: true });
  document.addEventListener("focusin", (e) => {
    const rect = e.target?.getBoundingClientRect?.();
    if (rect && rect.height) updateMaskY(rect.top + rect.height / 2);
  });

  // Auth Tabs & Assaad Links
  document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
    tab.addEventListener("click", () => setAuthTab(tab.dataset.authTab));
  });

  document.getElementById("assaad-switch-line").addEventListener("click", (e) => {
    if (e.target.closest("#btn-link-to-register")) setAuthTab("register");
    if (e.target.closest("#btn-link-to-login")) setAuthTab("login");
  });

  document.querySelectorAll("[data-reg-role]").forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.regRole = btn.dataset.regRole;
      document.querySelectorAll("[data-reg-role]").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-checked", String(active));
      });

      const isMonitor = ui.regRole === "monitor";
      document.getElementById("reg-course-wrap").classList.toggle("is-hidden", isMonitor);
      document.getElementById("reg-subject-wrap").classList.toggle("is-hidden", !isMonitor);
      document.getElementById("btn-register-next").textContent = isMonitor
        ? "Continuar para código →"
        : "Criar conta";
    });
  });

  document.getElementById("form-login").addEventListener("submit", handleLoginSubmit);
  document.getElementById("form-register").addEventListener("submit", handleRegisterSubmit);
  document.getElementById("auth-stage-otp").addEventListener("submit", handleVerifyOtpSubmit);
  document.getElementById("btn-otp-back").addEventListener("click", hideOtpStage);

  // 6 caixinhas OTP (avanço automático, colar e backspace)
  const otpBoxes = Array.from(document.querySelectorAll(".otp-box"));
  otpBoxes.forEach((box, idx) => {
    box.addEventListener("input", () => {
      const clean = box.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      box.value = clean.slice(0, 1);
      if (box.value && idx < otpBoxes.length - 1) {
        otpBoxes[idx + 1].focus();
      }
      document.getElementById("btn-verify-otp").disabled = getOtpValue().length !== 6;
    });

    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && idx > 0) {
        otpBoxes[idx - 1].focus();
      }
      if (e.key === "ArrowLeft" && idx > 0) otpBoxes[idx - 1].focus();
      if (e.key === "ArrowRight" && idx < otpBoxes.length - 1) otpBoxes[idx + 1].focus();
    });

    box.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData)
        .getData("text")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 6);
      pasted.split("").forEach((ch, i) => {
        if (otpBoxes[i]) otpBoxes[i].value = ch;
      });
      const focusIdx = Math.min(pasted.length, otpBoxes.length - 1);
      otpBoxes[focusIdx].focus();
      document.getElementById("btn-verify-otp").disabled = getOtpValue().length !== 6;
    });
  });

  document.getElementById("btn-demo-student").addEventListener("click", () => {
    state.currentUserId = "usr-stu-1";
    saveState();
    renderTopbar();
    ui.step = 1;
    switchView("agendar");
    showToast("Conectado como Estudante (Ana Paula Ribeiro).");
  });

  document.getElementById("btn-demo-monitor").addEventListener("click", () => {
    state.currentUserId = "usr-mon-1";
    saveState();
    renderTopbar();
    switchView("monitor");
    showToast("Conectado como Monitor (Rafael Silva).");
  });

  // Stepper & Passo 1
  document.getElementById("crumb-1").addEventListener("click", () => setStep(1));
  document.getElementById("crumb-2").addEventListener("click", () => {
    if (ui.selectedOfferingId) setStep(2);
  });
  document.getElementById("crumb-3").addEventListener("click", () => {
    if (ui.selectedSlotId) setStep(3);
  });

  document.getElementById("input-search").addEventListener("input", (e) => {
    ui.search = e.target.value;
    renderStep1();
  });

  document.getElementById("subject-tabs").addEventListener("click", (e) => {
    const tab = e.target.closest("[data-subject-tab]");
    if (!tab) return;
    ui.subjectFilter = tab.dataset.subjectTab;
    renderStep1();
  });

  document.getElementById("mode-filter-group")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-mode-filter]");
    if (!btn) return;
    ui.modeFilter = btn.dataset.modeFilter;
    renderStep1();
  });

  document.querySelectorAll("[data-step1-layout]").forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.step1Layout = btn.dataset.step1Layout;
      document.querySelectorAll("[data-step1-layout]").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      renderStep1();
    });
  });

  document.getElementById("btn-clear-search").addEventListener("click", () => {
    ui.search = "";
    ui.subjectFilter = "Todas";
    ui.modeFilter = "Todas";
    document.getElementById("input-search").value = "";
    renderStep1();
  });

  document.getElementById("step1-list-box").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-select-offering]");
    if (!btn) return;
    ui.selectedOfferingId = btn.dataset.selectOffering;
    ui.selectedDateIso = null;
    ui.selectedSlotId = null;
    setStep(2);
  });

  document.getElementById("step1-matrix-box").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-matrix-slot]");
    if (!btn || btn.disabled) return;
    const slot = state.slots.find((s) => s.id === btn.dataset.matrixSlot);
    if (!slot) return;
    ui.selectedOfferingId = slot.offeringId;
    ui.selectedDateIso = slot.dateIso;
    ui.selectedSlotId = slot.id;
    document.getElementById("s3-topic").value = "";
    setStep(3);
  });

  // Passo 2
  document.getElementById("btn-back-step1").addEventListener("click", () => setStep(1));
  document.getElementById("btn-prev-month").addEventListener("click", () => {
    ui.calMonth -= 1;
    if (ui.calMonth < 0) {
      ui.calMonth = 11;
      ui.calYear -= 1;
    }
    renderStep2();
  });
  document.getElementById("btn-next-month").addEventListener("click", () => {
    ui.calMonth += 1;
    if (ui.calMonth > 11) {
      ui.calMonth = 0;
      ui.calYear += 1;
    }
    renderStep2();
  });

  document.getElementById("cal-days-grid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cal-date]");
    if (!btn || btn.disabled) return;
    ui.selectedDateIso = btn.dataset.calDate;
    ui.selectedSlotId = null;
    renderStep2();
    if (window.innerWidth <= 720) {
      document.getElementById("s2-selected-day-label")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  document.getElementById("cal-days-grid").addEventListener("keydown", (e) => {
    const grid = document.getElementById("cal-days-grid");
    const enabled = Array.from(grid.querySelectorAll("[data-cal-date]:not(:disabled)"));
    const curIdx = enabled.indexOf(document.activeElement);
    if (curIdx === -1 || enabled.length === 0) return;

    let target = null;
    if (e.key === "ArrowRight") target = enabled[Math.min(enabled.length - 1, curIdx + 1)];
    if (e.key === "ArrowLeft") target = enabled[Math.max(0, curIdx - 1)];
    if (e.key === "ArrowDown") target = enabled[Math.min(enabled.length - 1, curIdx + 1)];
    if (e.key === "ArrowUp") target = enabled[Math.max(0, curIdx - 1)];
    if (e.key === "Home") target = enabled[0];
    if (e.key === "End") target = enabled[enabled.length - 1];
    if (!target) return;

    e.preventDefault();
    target.focus();
  });

  document.getElementById("s2-slots-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pick-slot]");
    if (!btn || btn.disabled) return;
    ui.selectedSlotId = btn.dataset.pickSlot;
    renderStep2();
  });

  document.getElementById("btn-go-step3").addEventListener("click", () => {
    if (!ui.selectedSlotId) return;
    if (!ui.reschedulingBookingId) {
      document.getElementById("s3-topic").value = "";
    }
    setStep(3);
  });

  // Passo 3
  const topicInput = document.getElementById("s3-topic");
  const topicChips = document.getElementById("s3-topic-chips");
  topicChips.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-topic]");
    if (!chip) return;
    topicInput.value = chip.dataset.topic;
    clearFieldError(topicInput);
    syncTopicChips();
    topicInput.focus();
  });
  topicInput.addEventListener("input", () => {
    clearFieldError(topicInput);
    syncTopicChips();
  });

  document.getElementById("btn-back-step2").addEventListener("click", () => setStep(2));
  document.getElementById("btn-s3-switch-account").addEventListener("click", () => {
    state.currentUserId = null;
    saveState();
    renderTopbar();
    switchView("landing");
  });

  // Limpeza automática de erros inline ao digitar (Heurística 9)
  ["form-login", "form-register", "form-new-slot"].forEach((formId) => {
    const formEl = document.getElementById(formId);
    if (!formEl) return;
    const clearTarget = (ev) => {
      const target = ev.target;
      if (target && target.matches("input, textarea, select")) {
        clearFieldError(target);
      }
    };
    formEl.addEventListener("input", clearTarget);
    formEl.addEventListener("change", clearTarget);
  });

  document.getElementById("otp-grid")?.addEventListener("input", clearOtpErrors);

  document.getElementById("form-confirm-booking").addEventListener("submit", handleConfirmBooking);
  document.getElementById("btn-download-ics").addEventListener("click", () => {
    if (ui.lastCreatedBookingId) downloadIcs(ui.lastCreatedBookingId);
  });
  document.getElementById("btn-copy-proof").addEventListener("click", () => {
    if (ui.lastCreatedBookingId) copyProof(ui.lastCreatedBookingId);
  });
  document.getElementById("btn-view-my-bookings").addEventListener("click", () => switchView("agendamentos"));

  // Meus Agendamentos
  document.querySelectorAll("[data-booking-filter]").forEach((tab) => {
    tab.addEventListener("click", () => {
      ui.bookingFilter = tab.dataset.bookingFilter;
      document.querySelectorAll("[data-booking-filter]").forEach((t) => t.classList.toggle("is-active", t === tab));
      renderBookings();
    });
  });

  document.getElementById("bookings-list").addEventListener("click", (e) => {
    const reschedBtn = e.target.closest("[data-reschedule-bk]");
    if (reschedBtn) {
      startReschedule(reschedBtn.dataset.rescheduleBk);
      return;
    }
    const cancelBtn = e.target.closest("[data-cancel-bk]");
    if (cancelBtn) {
      const bk = state.bookings.find((b) => b.id === cancelBtn.dataset.cancelBk);
      if (!bk) return;
      const slot = state.slots.find((s) => s.id === bk.slotId);
      const off = slot ? getOffering(slot.offeringId) : null;

      openConfirmDialog({
        title: "Cancelar agendamento?",
        desc: "A vaga será liberada imediatamente para outros estudantes.",
        summaryHtml:
          slot && off
            ? `<strong>${escapeHtml(bk.protocol)}</strong> · ${escapeHtml(off.subject)}<br>${escapeHtml(
                slot.dayName
              )}, ${formatDateBr(slot.dateIso)} · ${escapeHtml(slot.time)}`
            : "",
        confirmText: "Sim, cancelar vaga",
        danger: true,
        onConfirm: () => {
          bk.status = "Cancelado";
          saveState();
          renderTopbar();
          renderBookings();
          showToast(`Agendamento ${bk.protocol} cancelado.`, () => {
            bk.status = "Confirmado";
            saveState();
            renderTopbar();
            renderBookings();
            showToast(`Cancelamento desfeito (${bk.protocol}).`);
          });
        },
      });
      return;
    }
    const icsBtn = e.target.closest("[data-ics]");
    if (icsBtn) {
      downloadIcs(icsBtn.dataset.ics);
      return;
    }
    if (e.target.closest("#btn-bookings-login")) switchView("landing");
    if (e.target.closest("#btn-bookings-go-agendar")) {
      ui.step = 1;
      switchView("agendar");
    }
  });

  // Modal & Desfazer (exclusão LGPD fica somente na Central de Configurações)
  document.getElementById("btn-confirm-abort").addEventListener("click", closeConfirmDialog);
  document.getElementById("btn-confirm-proceed").addEventListener("click", () => {
    const fn = pendingConfirmCallback;
    closeConfirmDialog();
    if (typeof fn === "function") fn();
  });

  const toastEl = document.getElementById("toast");
  toastEl?.addEventListener("mouseenter", pauseToastTimer);
  toastEl?.addEventListener("mouseleave", resumeToastTimer);
  toastEl?.addEventListener("focusin", pauseToastTimer);
  toastEl?.addEventListener("focusout", resumeToastTimer);

  document.getElementById("toast-close-btn")?.addEventListener("click", hideToast);

  document.getElementById("toast-undo-btn")?.addEventListener("click", () => {
    const fn = currentToastUndo;
    hideToast();
    if (typeof fn === "function") fn();
  });

  // Painel do Monitor
  document.querySelectorAll("[data-mon-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.monitorFilter = btn.dataset.monFilter;
      document.querySelectorAll("[data-mon-filter]").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });
      renderMonitorPanel();
    });
  });

  document.getElementById("form-new-slot").addEventListener("submit", handlePublishNewSlot);
  document.getElementById("monitor-bookings-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-complete-bk]");
    if (!btn) return;
    const bk = state.bookings.find((b) => b.id === btn.dataset.completeBk);
    if (!bk) return;
    const stu = getUserById(bk.studentId);

    openConfirmDialog({
      title: "Concluir atendimento?",
      desc: "O atendimento será marcado como realizado no histórico do estudante.",
      summaryHtml: `<strong>${escapeHtml(bk.protocol)}</strong> · ${escapeHtml(
        stu ? stu.name : "Estudante"
      )}`,
      confirmText: "Sim, concluir",
      danger: false,
      onConfirm: () => {
        bk.status = "Concluído";
        saveState();
        renderMonitorPanel();
        showToast(`Atendimento ${bk.protocol} concluído.`, () => {
          bk.status = "Confirmado";
          saveState();
          renderMonitorPanel();
          showToast(`Conclusão desfeita (${bk.protocol}).`);
        });
      },
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const confirmModal = document.getElementById("confirm-modal");
      if (confirmModal && !confirmModal.classList.contains("is-hidden")) {
        trapFocusInModal(e, confirmModal);
        return;
      }
      const faqModal = document.getElementById("faq-modal");
      if (faqModal && !faqModal.classList.contains("is-hidden")) {
        trapFocusInModal(e, faqModal);
        return;
      }
      const settingsModal = document.getElementById("settings-modal");
      if (settingsModal && !settingsModal.classList.contains("is-hidden")) {
        trapFocusInModal(e, settingsModal);
        return;
      }
    }
    if (e.key === "Escape") {
      if (document.querySelector(".bc-select-wrap.is-open")) {
        closeAllCustomSelects();
        return;
      }
      const confirmModal = document.getElementById("confirm-modal");
      if (confirmModal && !confirmModal.classList.contains("is-hidden")) {
        closeConfirmDialog();
        return;
      }
      const faqModal = document.getElementById("faq-modal");
      if (faqModal && !faqModal.classList.contains("is-hidden")) {
        closeFaqModal();
        return;
      }
      closeSettingsModal();
      closeProfileMenu();
      stopSpeaking();
      return;
    }
    if (e.altKey && (e.key === "," || e.key === ";")) {
      e.preventDefault();
      const modal = document.getElementById("settings-modal");
      if (modal && modal.classList.contains("is-hidden")) openSettingsModal();
      else closeSettingsModal();
      return;
    }
    if (e.altKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      speakCurrentScreen();
      return;
    }
    const tag = document.activeElement?.tagName;
    if (
      e.key === "/" &&
      tag !== "INPUT" &&
      tag !== "TEXTAREA" &&
      tag !== "SELECT" &&
      ui.activeView === "agendar" &&
      ui.step === 1
    ) {
      e.preventDefault();
      document.getElementById("input-search").focus();
    }
  });
}

// ==================== CUSTOM SELECT POPOVER (BASECOAT / SHADCN PATTERN) ====================
const customSelectRegistry = new WeakMap();

function getSelectIconSvg(iconName) {
  switch (iconName) {
    case "clock":
      return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 13.5"/></svg>`;
    case "graduation":
      return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
    case "book":
      return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
    case "eye":
      return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    default:
      return "";
  }
}

function closeAllCustomSelects(exceptWrap = null) {
  document.querySelectorAll(".bc-select-wrap.is-open").forEach((wrap) => {
    if (wrap === exceptWrap) return;
    wrap.classList.remove("is-open");
    const trigger = wrap.querySelector(".bc-select-trigger");
    const popover = wrap._bcPopover || wrap.querySelector(".bc-select-popover");
    trigger?.setAttribute("aria-expanded", "false");
    if (popover) {
      popover.classList.add("is-hidden");
      popover.style.top = "";
      popover.style.bottom = "";
      popover.style.left = "";
      popover.style.width = "";
      popover.style.maxHeight = "";
      if (popover.parentNode !== wrap) {
        wrap.appendChild(popover);
      }
    }
  });
}

function positionCustomPopover(trigger, popover) {
  const rect = trigger.getBoundingClientRect();
  const margin = 12;
  const popWidth = Math.min(window.innerWidth - margin * 2, Math.max(rect.width, 280));
  const left =
    rect.left + popWidth <= window.innerWidth - margin
      ? Math.max(margin, rect.left)
      : Math.max(margin, rect.right - popWidth);

  popover.style.width = `${Math.round(popWidth)}px`;
  popover.style.left = `${Math.round(left)}px`;

  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const contentHeight = popover.scrollHeight || 180;
  const maxDesired = 248;

  if (spaceBelow >= Math.min(contentHeight, maxDesired) || spaceBelow >= spaceAbove) {
    popover.style.top = `${Math.round(rect.bottom + 6)}px`;
    popover.style.bottom = "auto";
    popover.style.maxHeight = `${Math.max(120, Math.min(maxDesired, Math.floor(spaceBelow)))}px`;
  } else {
    popover.style.bottom = `${Math.round(window.innerHeight - rect.top + 6)}px`;
    popover.style.top = "auto";
    popover.style.maxHeight = `${Math.max(120, Math.min(maxDesired, Math.floor(spaceAbove)))}px`;
  }
}

function syncCustomSelect(selectEl) {
  const ctx = customSelectRegistry.get(selectEl);
  if (!ctx) return;

  const selectedOpt = selectEl.selectedOptions[0] || selectEl.options[0];
  if (selectedOpt) {
    ctx.labelEl.textContent = selectedOpt.textContent.trim();
  }

  ctx.optionBtns.forEach((btn) => {
    const isSel = btn.dataset.value === selectEl.value;
    btn.setAttribute("aria-selected", String(isSel));
    btn.classList.toggle("is-focused", isSel);
  });
}

function upgradeCustomSelect(selectEl) {
  if (!selectEl || customSelectRegistry.has(selectEl)) return;

  const wrap = document.createElement("div");
  wrap.className = "bc-select-wrap";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "bc-select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  const labelElRef = selectEl.id ? document.querySelector(`label[for="${selectEl.id}"]`) : null;
  if (labelElRef) {
    if (!labelElRef.id) labelElRef.id = `label-${selectEl.id}`;
    trigger.setAttribute("aria-labelledby", labelElRef.id);
    labelElRef.addEventListener("click", (ev) => {
      ev.preventDefault();
      trigger.focus();
      trigger.click();
    });
  }

  const triggerMain = document.createElement("span");
  triggerMain.className = "bc-select-trigger-main";

  const iconMarkup = getSelectIconSvg(selectEl.dataset.selectIcon || "");
  if (iconMarkup) {
    const iconSpan = document.createElement("span");
    iconSpan.className = "bc-select-icon";
    iconSpan.innerHTML = iconMarkup;
    triggerMain.appendChild(iconSpan);
  }

  const labelSpan = document.createElement("span");
  labelSpan.className = "bc-select-label";
  triggerMain.appendChild(labelSpan);

  const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chevron.setAttribute("viewBox", "0 0 24 24");
  chevron.setAttribute("width", "14");
  chevron.setAttribute("height", "14");
  chevron.setAttribute("fill", "none");
  chevron.setAttribute("stroke", "currentColor");
  chevron.setAttribute("stroke-width", "2.2");
  chevron.setAttribute("stroke-linecap", "round");
  chevron.setAttribute("stroke-linejoin", "round");
  chevron.setAttribute("aria-hidden", "true");
  chevron.classList.add("bc-select-chevron");
  chevron.innerHTML = `<polyline points="6 9 12 15 18 9"/>`;

  trigger.appendChild(triggerMain);
  trigger.appendChild(chevron);

  const popover = document.createElement("div");
  popover.className = "bc-select-popover is-hidden";
  popover.setAttribute("role", "listbox");
  if (labelElRef?.id) popover.setAttribute("aria-labelledby", labelElRef.id);

  const optionBtns = [];
  Array.from(selectEl.options).forEach((opt) => {
    const optBtn = document.createElement("button");
    optBtn.type = "button";
    optBtn.className = "bc-select-option";
    optBtn.setAttribute("role", "option");
    optBtn.dataset.value = opt.value;
    optBtn.setAttribute("aria-selected", String(opt.selected));

    const textSpan = document.createElement("span");
    textSpan.className = "bc-select-option-text";
    textSpan.textContent = opt.textContent.trim();
    optBtn.appendChild(textSpan);

    const rightWrap = document.createElement("span");
    rightWrap.className = "bc-select-option-right";

    if (opt.dataset.badge) {
      const badgeSpan = document.createElement("span");
      badgeSpan.className = "bc-select-option-badge";
      badgeSpan.textContent = opt.dataset.badge;
      rightWrap.appendChild(badgeSpan);
    }

    const checkIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    checkIcon.setAttribute("viewBox", "0 0 24 24");
    checkIcon.setAttribute("fill", "none");
    checkIcon.setAttribute("stroke", "currentColor");
    checkIcon.setAttribute("stroke-width", "2.5");
    checkIcon.setAttribute("stroke-linecap", "round");
    checkIcon.setAttribute("stroke-linejoin", "round");
    checkIcon.setAttribute("aria-hidden", "true");
    checkIcon.classList.add("bc-select-check");
    checkIcon.innerHTML = `<polyline points="20 6 9 17 4 12"/>`;
    rightWrap.appendChild(checkIcon);

    optBtn.appendChild(rightWrap);

    optBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectEl.value = opt.value;
      syncCustomSelect(selectEl);
      closeAllCustomSelects();
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      trigger.focus();
    });

    popover.appendChild(optBtn);
    optionBtns.push(optBtn);
  });

  // Posiciona o select nativo oculto dentro do wrapper
  selectEl.classList.add("bc-select-native-hidden");
  selectEl.setAttribute("tabindex", "-1");
  selectEl.setAttribute("aria-hidden", "true");
  selectEl.parentNode.insertBefore(wrap, selectEl);
  wrap.appendChild(selectEl);
  wrap.appendChild(trigger);
  wrap.appendChild(popover);
  wrap._bcPopover = popover;

  const openPopover = (viaKeyboard = false) => {
    closeAllCustomSelects(wrap);
    wrap.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    document.body.appendChild(popover);
    popover.classList.remove("is-hidden");
    positionCustomPopover(trigger, popover);

    if (viaKeyboard) {
      const activeOpt = popover.querySelector('[aria-selected="true"]') || optionBtns[0];
      activeOpt?.focus();
    }
  };

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (wrap.classList.contains("is-open")) {
      closeAllCustomSelects();
    } else {
      openPopover(false);
    }
  });

  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPopover(true);
    }
  });

  popover.addEventListener("keydown", (e) => {
    const curIdx = optionBtns.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = optionBtns[(curIdx + 1) % optionBtns.length];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = optionBtns[(curIdx - 1 + optionBtns.length) % optionBtns.length];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      optionBtns[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      optionBtns[optionBtns.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeAllCustomSelects();
      trigger.focus();
    } else if (e.key === "Tab") {
      closeAllCustomSelects();
    }
  });

  selectEl.addEventListener("change", () => syncCustomSelect(selectEl));

  customSelectRegistry.set(selectEl, { wrap, trigger, labelEl: labelSpan, popover, optionBtns });
  syncCustomSelect(selectEl);
}

function initCustomSelects() {
  document.querySelectorAll('select[data-custom-select="true"]').forEach(upgradeCustomSelect);

  window.addEventListener(
    "scroll",
    (e) => {
      if (e.target?.closest?.(".bc-select-popover")) return;
      const openWrap = document.querySelector(".bc-select-wrap.is-open");
      if (!openWrap) return;
      const trigger = openWrap.querySelector(".bc-select-trigger");
      const popover = openWrap._bcPopover;
      if (trigger && popover) positionCustomPopover(trigger, popover);
    },
    true
  );

  window.addEventListener("resize", () => {
    if (getPrefs().vlibras) positionVlibrasShadowAccess();
    const openWrap = document.querySelector(".bc-select-wrap.is-open");
    if (!openWrap) return;
    const trigger = openWrap.querySelector(".bc-select-trigger");
    const popover = openWrap._bcPopover;
    if (trigger && popover) positionCustomPopover(trigger, popover);
  });
}

// Inicialização
bindEvents();
initCustomSelects();
applyThemeAndA11y();
renderTopbar();
startPhraseCarousel();
