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
    ra: "2025042",
    email: "rafael@academico.edu.br",
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
  icsReminderMinutes: 30,
  cvdFilter: "none",
  dyslexiaSpacing: false,
  readingMask: false,
  pauseDistractions: false,
  extraFocus: false,
  largeTargets: false,
  reducedMotion: false,
  vlibras: false,
  colorMode: null,
  themePreset: "monitora",
  customAccent: null,
  uiFont: "dm-sans",
  customBg: null,
  customFg: null,
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
  mobileMatrixDay: null,
  activeSettingsTab: "geral",
  selectedOfferingId: null,
  calYear: 2026,
  calMonth: 10,
  selectedDateIso: null,
  selectedSlotId: null,
  step3Completed: false,
  reschedulingBookingId: null,
  lastCreatedBookingId: null,
  highlightedBookingId: null,
  bookingFilter: "todos",
  monitorFilter: "active",
  monitorTab: "bookings",
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

function prefersReducedMotion() {
  const prefs = getPrefs();
  return Boolean(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      prefs.reducedMotion ||
      prefs.pauseDistractions
  );
}

function syncSlidingIndicator(container, activeSelector, kind = "pill", forceInstant = false) {
  if (!container) return;
  const clsHost = kind === "pill" ? "has-sliding-pill" : "has-sliding-underline";
  const clsReady = kind === "pill" ? "is-pill-ready" : "is-underline-ready";
  const clsInd = kind === "pill" ? "sliding-pill" : "sliding-underline";

  container.classList.add(clsHost);
  let ind = container.querySelector(`:scope > .${clsInd}`);
  const isFirst = !ind;
  if (!ind) {
    ind = document.createElement("span");
    ind.className = clsInd;
    ind.setAttribute("aria-hidden", "true");
    container.prepend(ind);
  }

  const activeEl = container.querySelector(activeSelector);
  if (!activeEl || activeEl.offsetParent === null || activeEl.offsetWidth === 0) {
    container.classList.remove(clsReady);
    return;
  }

  const instant = isFirst || forceInstant || prefersReducedMotion();
  if (instant) ind.classList.add("is-instant");
  else ind.classList.remove("is-instant");

  const x = activeEl.offsetLeft;
  const y = activeEl.offsetTop;
  const w = activeEl.offsetWidth;
  const h = activeEl.offsetHeight;

  if (kind === "pill") {
    ind.style.width = `${w}px`;
    ind.style.height = `${h}px`;
    ind.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  } else {
    ind.style.width = `${w}px`;
    ind.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  container.classList.add(clsReady);
  if (instant) {
    void ind.offsetWidth;
    ind.classList.remove("is-instant");
  }
}

function syncAllSlidingIndicators(forceInstant = false) {
  requestAnimationFrame(() => {
    syncSlidingIndicator(document.getElementById("main-nav"), ".nav-link.is-active", "underline", forceInstant);
    syncSlidingIndicator(document.getElementById("subject-tabs"), ".u-tab.is-active", "underline", forceInstant);
    syncSlidingIndicator(
      document.querySelector("#view-agendamentos .underline-tabs"),
      ".u-tab.is-active",
      "underline",
      forceInstant
    );
    syncSlidingIndicator(document.getElementById("mode-filter-group"), ".layout-btn.is-active", "pill", forceInstant);
    syncSlidingIndicator(
      document.querySelector(".step1-layout-desktop"),
      ".layout-btn.is-active",
      "pill",
      forceInstant
    );
    syncSlidingIndicator(
      document.querySelector(".step1-layout-mobile"),
      ".layout-btn.is-active",
      "pill",
      forceInstant
    );
    syncSlidingIndicator(
      document.getElementById("monitor-section-tabs"),
      ".u-tab.is-active",
      "underline",
      forceInstant
    );
    syncSlidingIndicator(
      document.getElementById("monitor-filter-toggle"),
      ".layout-btn.is-active",
      "pill",
      forceInstant
    );
    syncSlidingIndicator(
      document.querySelector(".profile-dd-theme-row"),
      ".profile-dd-theme-btn.is-active",
      "pill",
      forceInstant
    );
    syncSlidingIndicator(
      document.getElementById("ics-reminder-group"),
      ".ics-reminder-opt.is-active",
      "pill",
      forceInstant
    );
    syncSlidingIndicator(
      document.getElementById("mobile-matrix-days"),
      ".mmd-btn.is-active",
      "pill",
      forceInstant
    );
    syncSlidingIndicator(
      document.querySelector(".role-toggle"),
      ".role-opt.is-active",
      "pill",
      forceInstant
    );
  });
}

function animateRowExitAndRun(rowEl, callback) {
  if (!rowEl || prefersReducedMotion()) {
    callback();
    return;
  }
  rowEl.classList.add("is-row-exiting");
  setTimeout(callback, 170);
}

const THEME_BASE_COLORS = {
  light: { bg: "#f6f6f4", fg: "#141b29" },
  dark: { bg: "#09090b", fg: "#fafafa" },
  contrast: { bg: "#000000", fg: "#ffffff" },
};

const THEME_PRESETS = {
  monitora: { light: "#b44b1e", dark: "#c2592b", contrast: "#facc15" },
  "academic-navy": { light: "#1d4ed8", dark: "#3b82f6", contrast: "#38bdf8" },
  "forest-slate": { light: "#15803d", dark: "#22c55e", contrast: "#4ade80" },
  "amber-studio": { light: "#ca8a04", dark: "#eab308", contrast: "#facc15" },
  "olive-moss": { light: "#65a30d", dark: "#a3e635", contrast: "#bef264" },
  graphite: { light: "#3f3f46", dark: "#d4d4d8", contrast: "#ffffff" },
};

const UI_FONTS = {
  "dm-sans": '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  readable: 'Verdana, Geneva, "DM Sans", sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};

function getResolvedTheme() {
  const prefs = getPrefs();
  if (prefs.colorMode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return state.theme || "light";
}

function getBestOnColor(bgHex) {
  const darkFg = "#0d0d0f";
  const lightFg = "#ffffff";
  const cDark = getContrastRatio(bgHex, darkFg);
  const cLight = getContrastRatio(bgHex, lightFg);
  return cDark >= cLight ? darkFg : lightFg;
}

const CUSTOM_COLOR_VARS = [
  "--bg",
  "--text",
  "--surface",
  "--surface-2",
  "--surface-elevated",
  "--surface-hover",
  "--border",
  "--border-strong",
  "--text-secondary",
  "--text-muted",
  "--scroll-thumb",
  "--scroll-thumb-hover",
];

function normalizeHexColor(raw) {
  const clean = String(raw ?? "").trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    const [r, g, b] = clean.split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `#${clean}`.toLowerCase();
  }
  return null;
}

function hexToRgb(hex) {
  const norm = normalizeHexColor(hex) || "#000000";
  return [
    parseInt(norm.slice(1, 3), 16),
    parseInt(norm.slice(3, 5), 16),
    parseInt(norm.slice(5, 7), 16),
  ];
}

function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function getRelativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function mixRgb(rgbA, rgbB, t) {
  return [
    rgbA[0] + (rgbB[0] - rgbA[0]) * t,
    rgbA[1] + (rgbB[1] - rgbA[1]) * t,
    rgbA[2] + (rgbB[2] - rgbA[2]) * t,
  ];
}

function findNearestReadableFg(bgHex, fgHex, targetRatio = 7.0) {
  if (getContrastRatio(bgHex, fgHex) >= targetRatio) return normalizeHexColor(fgHex) || fgHex;

  const fgRgb = hexToRgb(fgHex);
  const searchToward = (extremeRgb) => {
    const extremeHex = rgbToHex(...extremeRgb);
    const maxRatio = getContrastRatio(bgHex, extremeHex);
    if (maxRatio < targetRatio) {
      return { reachable: false, t: 1, hex: extremeHex, ratio: maxRatio };
    }
    let lo = 0;
    let hi = 1;
    let bestHex = extremeHex;
    for (let i = 0; i < 18; i += 1) {
      const mid = (lo + hi) / 2;
      const candHex = rgbToHex(...mixRgb(fgRgb, extremeRgb, mid));
      if (getContrastRatio(bgHex, candHex) >= targetRatio) {
        bestHex = candHex;
        hi = mid;
      } else {
        lo = mid;
      }
    }
    return { reachable: true, t: hi, hex: bestHex, ratio: getContrastRatio(bgHex, bestHex) };
  };

  const toWhite = searchToward([255, 255, 255]);
  const toBlack = searchToward([0, 0, 0]);

  if (toWhite.reachable && toBlack.reachable) {
    return toWhite.t <= toBlack.t ? toWhite.hex : toBlack.hex;
  }
  if (toWhite.reachable) return toWhite.hex;
  if (toBlack.reachable) return toBlack.hex;
  return toWhite.ratio >= toBlack.ratio ? toWhite.hex : toBlack.hex;
}

const ACCENT_COLOR_VARS = [
  "--accent",
  "--accent-hover",
  "--accent-soft",
  "--accent-fg",
  "--on-accent",
  "--accent-text",
];

function clearCustomColorsFromDom() {
  CUSTOM_COLOR_VARS.forEach((v) => document.body.style.removeProperty(v));
}

function clearAccentOverridesFromDom() {
  ACCENT_COLOR_VARS.forEach((v) => document.body.style.removeProperty(v));
}

function isAuthScreenIsolated() {
  return !getCurrentUser() || ui.activeView === "landing";
}

function syncWcagGuardUI(bgHex, fgHex) {
  const bgPicker = document.getElementById("custom-bg-picker");
  const fgPicker = document.getElementById("custom-fg-picker");
  const bgHexInput = document.getElementById("custom-bg-hex");
  const fgHexInput = document.getElementById("custom-fg-hex");
  const bgDot = document.getElementById("custom-bg-dot");
  const fgDot = document.getElementById("custom-fg-dot");
  const strip = document.getElementById("wcag-guard-strip");
  const badge = document.getElementById("wcag-contrast-badge");
  const hint = document.getElementById("wcag-contrast-hint");
  const fixBtn = document.getElementById("btn-fix-contrast");

  if (bgPicker && bgPicker.value.toLowerCase() !== bgHex) bgPicker.value = bgHex;
  if (fgPicker && fgPicker.value.toLowerCase() !== fgHex) fgPicker.value = fgHex;
  if (bgHexInput && document.activeElement !== bgHexInput) bgHexInput.value = bgHex.toUpperCase();
  if (fgHexInput && document.activeElement !== fgHexInput) fgHexInput.value = fgHex.toUpperCase();
  if (bgDot) bgDot.style.backgroundColor = bgHex;
  if (fgDot) fgDot.style.backgroundColor = fgHex;

  if (!strip || !badge) return;
  const prevLevel = strip.dataset.level || "";
  const ratio = getContrastRatio(bgHex, fgHex);
  const ratioTxt = `${ratio.toFixed(1)}:1`;
  let nextLevel = "fail";

  if (ratio >= 7.0) {
    nextLevel = "aaa";
    strip.dataset.level = nextLevel;
    badge.textContent = `${ratioTxt} · WCAG AAA`;
    if (hint) hint.textContent = "Contraste excelente para leitura prolongada.";
    fixBtn?.classList.add("is-hidden");
    fixBtn?.classList.remove("is-wcag-btn-enter");
  } else if (ratio >= 4.5) {
    nextLevel = "aa";
    strip.dataset.level = nextLevel;
    badge.textContent = `${ratioTxt} · WCAG AA`;
    if (hint) hint.textContent = "Legível conforme padrão mínimo WCAG 2.1 AA.";
    fixBtn?.classList.add("is-hidden");
    fixBtn?.classList.remove("is-wcag-btn-enter");
  } else {
    nextLevel = "fail";
    strip.dataset.level = nextLevel;
    badge.textContent = `${ratioTxt} · Contraste baixo (abaixo de WCAG AA)`;
    if (hint) hint.textContent = "Texto difícil de ler sobre este fundo. Use a correção automática abaixo.";
    fixBtn?.classList.remove("is-hidden");
  }

  // Ponto 5 (Técnica A): dispara morph apenas na virada de faixa (AAA <-> AA <-> fail), nunca durante arraste no mesmo nível
  if (prevLevel && prevLevel !== nextLevel && !prefersReducedMotion()) {
    badge.classList.remove("is-wcag-morph");
    hint?.classList.remove("is-wcag-morph");
    void badge.offsetWidth;
    badge.classList.add("is-wcag-morph");
    hint?.classList.add("is-wcag-morph");

    if (nextLevel === "fail" && fixBtn) {
      fixBtn.classList.remove("is-wcag-btn-enter");
      void fixBtn.offsetWidth;
      fixBtn.classList.add("is-wcag-btn-enter");
    }
  }
}

function applyAccentAndFont(resolvedTheme, activeBg) {
  const prefs = getPrefs();
  const isolated = isAuthScreenIsolated();
  const presetKey = THEME_PRESETS[prefs.themePreset] ? prefs.themePreset : "monitora";
  const preset = THEME_PRESETS[presetKey];
  const savedAccentHex = normalizeHexColor(prefs.customAccent) || preset[resolvedTheme] || preset.light;
  const s = document.body.style;

  if (isolated) {
    if (resolvedTheme === "contrast") {
      clearAccentOverridesFromDom();
    } else {
      const brandHex = THEME_PRESETS.monitora[resolvedTheme] || THEME_PRESETS.monitora.light;
      const brandFg = getBestOnColor(brandHex);
      const brandText =
        getContrastRatio(activeBg, brandHex) >= 4.5
          ? brandHex
          : findNearestReadableFg(activeBg, brandHex, 4.5);
      s.setProperty("--accent", brandHex);
      s.setProperty("--accent-hover", `color-mix(in srgb, ${brandHex} 88%, ${brandFg} 12%)`);
      s.setProperty("--accent-soft", `color-mix(in srgb, ${brandHex} 14%, transparent)`);
      s.setProperty("--accent-fg", brandFg);
      s.setProperty("--on-accent", brandFg);
      s.setProperty("--accent-text", brandText);
    }
  } else {
    const accentFg = getBestOnColor(savedAccentHex);
    const accentText =
      getContrastRatio(activeBg, savedAccentHex) >= 4.5
        ? savedAccentHex
        : findNearestReadableFg(activeBg, savedAccentHex, 4.5);
    s.setProperty("--accent", savedAccentHex);
    s.setProperty("--accent-hover", `color-mix(in srgb, ${savedAccentHex} 88%, ${accentFg} 12%)`);
    s.setProperty("--accent-soft", `color-mix(in srgb, ${savedAccentHex} 14%, transparent)`);
    s.setProperty("--accent-fg", accentFg);
    s.setProperty("--on-accent", accentFg);
    s.setProperty("--accent-text", accentText);
  }

  const fontKey = UI_FONTS[prefs.uiFont] ? prefs.uiFont : "dm-sans";
  document.documentElement.style.setProperty("--font-sans", UI_FONTS[fontKey]);

  const presetSelect = document.getElementById("pref-theme-preset");
  if (presetSelect) {
    presetSelect.value = presetKey;
    syncCustomSelect(presetSelect);
  }
  const fontSelect = document.getElementById("pref-ui-font");
  if (fontSelect) {
    fontSelect.value = fontKey;
    syncCustomSelect(fontSelect);
  }

  let matchedSwatch = false;
  document.querySelectorAll("[data-accent-hex]").forEach((btn) => {
    const active = normalizeHexColor(btn.dataset.accentHex) === savedAccentHex;
    if (active) matchedSwatch = true;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-checked", String(active));
  });

  const accentPicker = document.getElementById("pref-accent-picker");
  if (accentPicker && accentPicker.value.toLowerCase() !== savedAccentHex) {
    accentPicker.value = savedAccentHex;
  }
  const customWrap = accentPicker?.closest(".accent-swatch-custom");
  if (customWrap) {
    const isCustom = Boolean(normalizeHexColor(prefs.customAccent) && !matchedSwatch);
    const savedFg = getBestOnColor(savedAccentHex);
    customWrap.style.background = isCustom ? savedAccentHex : "";
    customWrap.style.color = isCustom ? savedFg : "";
    customWrap.style.borderStyle = isCustom ? "solid" : "";
    customWrap.style.borderColor = isCustom ? savedAccentHex : "";
    customWrap.style.boxShadow = isCustom ? `0 0 0 2px var(--surface), 0 0 0 4px ${savedAccentHex}` : "";
  }
}

function applyCustomColors() {
  const prefs = getPrefs();
  const theme = getResolvedTheme();
  const base = THEME_BASE_COLORS[theme] || THEME_BASE_COLORS.light;
  const customBg = normalizeHexColor(prefs.customBg);
  const customFg = normalizeHexColor(prefs.customFg);
  const activeBg = customBg || base.bg;
  const activeFg = customFg || base.fg;

  if (isAuthScreenIsolated()) {
    clearCustomColorsFromDom();
    document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
    applyAccentAndFont(theme, base.bg);
    syncWcagGuardUI(activeBg, activeFg);
    return;
  }

  if (!customBg && !customFg) {
    clearCustomColorsFromDom();
    document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
    applyAccentAndFont(theme, activeBg);
    syncWcagGuardUI(activeBg, activeFg);
    return;
  }

  const isDarkBg = getRelativeLuminance(activeBg) < 0.25;
  const s = document.body.style;
  s.setProperty("--bg", activeBg);
  s.setProperty("--text", activeFg);

  if (isDarkBg) {
    s.setProperty("--surface", `color-mix(in srgb, ${activeBg} 93%, #ffffff 7%)`);
    s.setProperty("--surface-2", `color-mix(in srgb, ${activeBg} 88%, #ffffff 12%)`);
    s.setProperty("--surface-elevated", `color-mix(in srgb, ${activeBg} 88%, #ffffff 12%)`);
    s.setProperty("--surface-hover", `color-mix(in srgb, ${activeBg} 85%, #ffffff 15%)`);
    s.setProperty("--border", `color-mix(in srgb, ${activeBg} 78%, ${activeFg} 22%)`);
    s.setProperty("--border-strong", `color-mix(in srgb, ${activeBg} 66%, ${activeFg} 34%)`);
  } else {
    s.setProperty("--surface", `color-mix(in srgb, ${activeBg} 55%, #ffffff 45%)`);
    s.setProperty("--surface-2", `color-mix(in srgb, ${activeBg} 93%, #000000 7%)`);
    s.setProperty("--surface-elevated", `color-mix(in srgb, ${activeBg} 55%, #ffffff 45%)`);
    s.setProperty("--surface-hover", `color-mix(in srgb, ${activeBg} 90%, #000000 10%)`);
    s.setProperty("--border", `color-mix(in srgb, ${activeBg} 84%, ${activeFg} 16%)`);
    s.setProperty("--border-strong", `color-mix(in srgb, ${activeBg} 72%, ${activeFg} 28%)`);
  }

  s.setProperty("--text-secondary", `color-mix(in srgb, ${activeFg} 76%, ${activeBg} 24%)`);
  s.setProperty("--text-muted", `color-mix(in srgb, ${activeFg} 58%, ${activeBg} 42%)`);
  s.setProperty("--scroll-thumb", `color-mix(in srgb, ${activeFg} 22%, transparent)`);
  s.setProperty("--scroll-thumb-hover", `color-mix(in srgb, ${activeFg} 40%, transparent)`);
  document.documentElement.style.colorScheme = isDarkBg ? "dark" : "light";

  applyAccentAndFont(theme, activeBg);
  syncWcagGuardUI(activeBg, activeFg);
}

function applyThemeAndA11y() {
  const prefs = getPrefs();
  const theme = getResolvedTheme();
  const modeSelection = prefs.colorMode === "system" ? "system" : theme;
  const scale = state.fontScale || 1;
  const pct = Math.round(scale * 100);

  document.body.classList.remove("theme-dark", "theme-light", "theme-contrast");
  document.body.classList.add(`theme-${theme}`);
  document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
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

  document.querySelectorAll(".theme-opt:not([data-mode-opt])").forEach((btn) => {
    const active = btn.dataset.theme === theme;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  document.querySelectorAll("[data-mode-opt]").forEach((btn) => {
    const active = btn.dataset.modeOpt === modeSelection;
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

  const reminderMins = Number(prefs.icsReminderMinutes ?? 30);
  document.querySelectorAll("[data-ics-reminder]").forEach((btn) => {
    const active = Number(btn.dataset.icsReminder) === reminderMins;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-checked", String(active));
  });
  syncSettingsAgendaBox();

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
  applyCustomColors();
  syncAllSlidingIndicators();
}

// ==================== SCROLL LOCK REAL PARA iOS SAFARI E ANDROID ====================
let bodyScrollLocked = false;
let lockedScrollY = 0;

function hasAnyBlockingOverlayOpen() {
  const modalIds = ["settings-modal", "confirm-modal", "faq-modal", "sso-modal"];
  const anyModalOpen = modalIds.some((id) => {
    const el = document.getElementById(id);
    return Boolean(el && !el.classList.contains("is-hidden"));
  });
  const profileSheet = document.getElementById("profile-dropdown");
  const mobileSheetOpen = Boolean(
    profileSheet &&
      !profileSheet.classList.contains("is-hidden") &&
      profileSheet.classList.contains("is-mobile-sheet")
  );
  return anyModalOpen || mobileSheetOpen;
}

function lockBodyScroll(shouldLock) {
  const wantLock = Boolean(shouldLock);
  if (wantLock === bodyScrollLocked) return;

  if (wantLock) {
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    bodyScrollLocked = true;
    document.body.classList.add("is-scroll-locked");
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  } else {
    const restoreY = lockedScrollY;
    bodyScrollLocked = false;
    document.body.classList.remove("is-scroll-locked");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    window.scrollTo(0, restoreY);
  }
}

function syncBodyScrollLock() {
  lockBodyScroll(hasAnyBlockingOverlayOpen());
}

function setSettingsTab(tabKey, shouldFocus = false) {
  closeAllCustomSelects();
  const key = SETTINGS_TAB_META[tabKey] ? tabKey : "geral";
  ui.activeSettingsTab = key;
  const meta = SETTINGS_TAB_META[key];

  document.getElementById("settings-panel-title").textContent = meta.title;
  document.getElementById("settings-panel-desc").textContent = meta.desc;

  let activeTabEl = null;
  document.querySelectorAll("[data-settings-tab]").forEach((btn) => {
    const active = btn.dataset.settingsTab === key;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
    btn.setAttribute("tabindex", active ? "0" : "-1");
    if (active) {
      activeTabEl = btn;
      if (shouldFocus) btn.focus();
    }
  });

  if (activeTabEl && window.innerWidth <= 768) {
    activeTabEl.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  Object.keys(SETTINGS_TAB_META).forEach((k) => {
    const panel = document.getElementById(`settings-tab-${k}`);
    if (panel) panel.classList.toggle("is-hidden", k !== key);
  });
  syncAllSlidingIndicators(true);
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

function syncSettingsAgendaBox() {
  const metaEl = document.getElementById("settings-agenda-export-meta");
  const btnEl = document.getElementById("btn-export-confirmed-ics");
  if (!metaEl || !btnEl) return;

  const user = getCurrentUser();
  const confirmed = user
    ? state.bookings.filter((b) => b.studentId === user.id && b.status === "Confirmado")
    : [];
  const count = confirmed.length;

  if (!user) {
    metaEl.textContent = "Entre na sua conta para exportar suas monitorias confirmadas.";
    btnEl.disabled = true;
    return;
  }

  if (count === 0) {
    metaEl.textContent = "Nenhuma monitoria confirmada no momento.";
    btnEl.disabled = true;
  } else if (count === 1) {
    metaEl.textContent = "1 monitoria confirmada pronta para importar no calendário.";
    btnEl.disabled = false;
  } else {
    metaEl.textContent = `${count} monitorias confirmadas prontas para importar no calendário.`;
    btnEl.disabled = false;
  }
}

let lastSettingsTriggerEl = null;

function openSettingsModal(initialTab = "geral", mobileDetail = false) {
  lastSettingsTriggerEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  syncSettingsAccountBox();
  syncSettingsAgendaBox();
  setSettingsTab(initialTab || ui.activeSettingsTab || "geral");
  applyThemeAndA11y();
  const win = document.querySelector(".settings-window");
  if (win) win.classList.toggle("is-mobile-detail", Boolean(mobileDetail));
  document.getElementById("settings-modal")?.classList.remove("is-hidden");
  syncBodyScrollLock();
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
  syncBodyScrollLock();
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
  if (window.innerWidth <= 768) {
    const hasSticky = document.body.classList.contains("has-mobile-sticky-cta");
    accessEl.style.top = "auto";
    accessEl.style.right = "12px";
    accessEl.style.bottom = hasSticky
      ? "calc(138px + env(safe-area-inset-bottom))"
      : "calc(70px + env(safe-area-inset-bottom))";
  } else {
    accessEl.style.top = "auto";
    accessEl.style.right = "20px";
    accessEl.style.bottom = "24px";
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
  syncBodyScrollLock();
  document.getElementById("btn-close-faq")?.focus();
  announceA11y("Ajuda rápida aberta.");
}

function closeFaqModal() {
  const modal = document.getElementById("faq-modal");
  const wasOpen = modal && !modal.classList.contains("is-hidden");
  modal?.classList.add("is-hidden");
  syncBodyScrollLock();
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
    summaryHtml: buildConfirmSummaryCard({
      title: user.name,
      rows: [
        { label: "Matrícula", value: user.ra },
        { label: "E-mail", value: user.email },
      ],
    }),
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

function isMobileSheetViewport() {
  return window.innerWidth <= 768;
}

function restoreProfileDropdownHome() {
  const dd = document.getElementById("profile-dropdown");
  const wrap = document.getElementById("profile-menu-wrap");
  if (dd && wrap && dd.parentNode !== wrap) {
    wrap.appendChild(dd);
  }
  dd?.classList.remove("is-mobile-sheet");
}

function closeProfileMenu(restoreFocus = false) {
  const dd = document.getElementById("profile-dropdown");
  const backdrop = document.getElementById("profile-sheet-backdrop");
  const btn = document.getElementById("btn-account-action");
  const wasOpen = Boolean(dd && !dd.classList.contains("is-hidden"));

  dd?.classList.add("is-hidden");
  backdrop?.classList.add("is-hidden");
  restoreProfileDropdownHome();
  syncBodyScrollLock();
  btn?.setAttribute("aria-expanded", "false");

  if (wasOpen && restoreFocus && btn && document.contains(btn)) {
    btn.focus();
  }
}

function openProfileMenu() {
  const dd = document.getElementById("profile-dropdown");
  const backdrop = document.getElementById("profile-sheet-backdrop");
  const btn = document.getElementById("btn-account-action");
  if (!dd || !btn) return;

  if (isMobileSheetViewport()) {
    dd.classList.add("is-mobile-sheet");
    if (dd.parentNode !== document.body) {
      document.body.appendChild(dd);
    }
    backdrop?.classList.remove("is-hidden");
  } else {
    restoreProfileDropdownHome();
    backdrop?.classList.add("is-hidden");
  }

  dd.classList.remove("is-hidden");
  syncBodyScrollLock();
  btn.setAttribute("aria-expanded", "true");
  syncAllSlidingIndicators(true);

  if (isMobileSheetViewport()) {
    const firstFocus = dd.querySelector("button:not(.is-hidden):not([disabled])");
    firstFocus?.focus();
  }
}

function toggleProfileMenu() {
  const dd = document.getElementById("profile-dropdown");
  if (!dd) return;
  if (dd.classList.contains("is-hidden")) {
    openProfileMenu();
  } else {
    closeProfileMenu(false);
  }
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
  syncSettingsAgendaBox();
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
  applyCustomColors();

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
  syncAllSlidingIndicators();

  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

// ==================== AUTH & OTP ASSAAD ====================
function setAuthTab(tabName) {
  ui.authTab = tabName;
  document.querySelectorAll("[data-auth-tab]").forEach((t) => {
    const active = t.dataset.authTab === tabName;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", String(active));
  });
  document.getElementById("auth-sso-block")?.classList.toggle("is-hidden", tabName !== "login");
  document.getElementById("form-login").classList.toggle("is-hidden", tabName !== "login");
  document.getElementById("form-register").classList.toggle("is-hidden", tabName !== "register");
  clearFormErrors(document.getElementById("form-login"));
  clearFormErrors(document.getElementById("form-register"));

  const headTitle = document.getElementById("auth-head-title");
  const headSub = document.getElementById("auth-head-sub");
  if (headTitle && headSub) {
    if (tabName === "login") {
      headTitle.textContent = "Entrar no Monitora+";
      headSub.textContent = "Acesse com sua matrícula ou e-mail institucional.";
    } else {
      headTitle.textContent = "Criar conta no Monitora+";
      headSub.textContent = "Cadastre-se com seus dados institucionais.";
    }
  }

  const switchLine = document.getElementById("assaad-switch-line");
  if (tabName === "login") {
    switchLine.innerHTML =
      'Primeiro acesso? <button type="button" class="text-accent-link" id="btn-link-to-register">Criar conta</button>';
  } else {
    switchLine.innerHTML =
      'Já possui conta? <button type="button" class="text-accent-link" id="btn-link-to-login">Entrar</button>';
    syncAllSlidingIndicators(true);
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
  if (password.length < 6) {
    errors.push({ el: passEl, message: "A senha deve ter no mínimo 6 caracteres." });
  }
  return errors;
}

// ==================== SSO INSTITUCIONAL (GENNERA UNIFSA / GOOGLE) ====================
const SSO_GENNERA_ICON_SVG = `<img src="assets/gennera-icon.svg?v=20261124b1" alt="" width="34" height="34" class="sso-provider-img" aria-hidden="true" />`;
const SSO_GOOGLE_ICON_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;

const SSO_PROVIDERS = {
  gennera: {
    name: "Gennera",
    loadingHeader: "Gennera · UNIFSA",
    title: "Gennera · UNIFSA",
    desc: "Escolha a conta acadêmica para entrar.",
    loadingTitle: "Sincronizando matrícula e disciplinas do Gennera...",
    footer: "Fluxo simulado · Pronto para integração via SAML / API da UNIFSA",
    iconSvg: SSO_GENNERA_ICON_SVG,
    badgeClass: "is-gennera",
  },
  google: {
    name: "Google",
    loadingHeader: "Google Institucional",
    title: "Google Institucional",
    desc: "Escolha sua conta @academico.edu.br.",
    loadingTitle: "Validando conta institucional...",
    footer: "Fluxo simulado · Pronto para OAuth 2.0 institucional",
    iconSvg: SSO_GOOGLE_ICON_SVG,
    badgeClass: "is-google",
  },
};

const SSO_ACCOUNTS = [
  {
    userId: "usr-stu-1",
    name: "Ana Paula Ribeiro",
    shortToastName: "Ana Paula",
    initials: "AP",
    roleLabel: "Estudante",
    detail: "Engenharia de Software",
    ra: "2026101",
    email: "ana@academico.edu.br",
  },
  {
    userId: "usr-mon-1",
    name: "Rafael Silva",
    shortToastName: "Rafael",
    initials: "RS",
    roleLabel: "Monitor",
    detail: "Algoritmo e Programação",
    ra: "2025042",
    email: "rafael@academico.edu.br",
  },
];

const ssoState = {
  provider: "gennera",
  selectedUserId: "usr-stu-1",
  loading: false,
  timer: null,
  heightTimer: null,
  heightEndHandler: null,
  triggerEl: null,
};

function resetSsoBoxHeightTransition() {
  clearTimeout(ssoState.heightTimer);
  ssoState.heightTimer = null;
  const box = document.querySelector("#sso-modal .sso-modal-box");
  if (!box) return;
  if (ssoState.heightEndHandler) {
    box.removeEventListener("transitionend", ssoState.heightEndHandler);
    ssoState.heightEndHandler = null;
  }
  box.classList.remove("is-morphing-height");
  box.style.height = "";
  box.style.overflow = "";
}

function ensureDemoUser(demoId) {
  let user = state.users.find((u) => u.id === demoId);
  let restored = false;
  const seed = INITIAL_USERS.find((u) => u.id === demoId);
  if (!user && seed) {
    user = structuredClone(seed);
    state.users.push(user);
    INITIAL_BOOKINGS.filter((b) => b.studentId === demoId).forEach((seedBk) => {
      if (!state.bookings.some((b) => b.id === seedBk.id)) {
        state.bookings.push(structuredClone(seedBk));
      }
    });
    restored = true;
  } else if (user && seed && demoId === "usr-mon-1" && user.email === "rafael.monitor@academico.edu.br") {
    user.ra = seed.ra;
    user.email = seed.email;
  }
  return { user, restored };
}

function renderSsoAccountList() {
  const listEl = document.getElementById("sso-account-list");
  if (!listEl) return;

  listEl.innerHTML = SSO_ACCOUNTS.map((acc) => {
    const selected = acc.userId === ssoState.selectedUserId;

    return `
      <button
        type="button"
        class="sso-account-card ${selected ? "is-selected" : ""}"
        role="radio"
        aria-checked="${selected}"
        data-sso-account="${escapeHtml(acc.userId)}"
      >
        <span class="sso-avatar" aria-hidden="true">${escapeHtml(acc.initials)}</span>
        <span class="sso-account-info">
          <span class="sso-account-top">
            <strong class="sso-account-name">${escapeHtml(acc.name)}</strong>
            <span class="sso-role-pill">${escapeHtml(acc.roleLabel)}</span>
          </span>
          <span class="sso-account-meta">${escapeHtml(acc.detail)} · ${escapeHtml(acc.ra)}</span>
          <span class="sso-account-email">${escapeHtml(acc.email)}</span>
        </span>
        <span class="sso-account-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
        <span class="sso-account-radio" aria-hidden="true"></span>
      </button>
    `;
  }).join("");
}

function openSsoModal(providerKey, triggerEl = null) {
  const cfg = SSO_PROVIDERS[providerKey] || SSO_PROVIDERS.gennera;
  clearTimeout(ssoState.timer);
  ssoState.timer = null;
  ssoState.loading = false;
  resetSsoBoxHeightTransition();
  ssoState.provider = providerKey === "google" ? "google" : "gennera";
  ssoState.selectedUserId = SSO_ACCOUNTS[0].userId;
  ssoState.triggerEl =
    triggerEl instanceof HTMLElement
      ? triggerEl
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  const badgeEl = document.getElementById("sso-provider-icon");
  if (badgeEl) {
    badgeEl.className = `sso-provider-badge ${cfg.badgeClass}`;
    badgeEl.innerHTML = cfg.iconSvg;
  }
  document.getElementById("sso-modal-title").textContent = cfg.title;
  document.getElementById("sso-modal-desc").textContent = cfg.desc;
  document.getElementById("sso-modal-foot-text").textContent = cfg.footer;

  document.getElementById("sso-stage-select")?.classList.remove("is-hidden");
  const loadingStage = document.getElementById("sso-stage-loading");
  loadingStage?.classList.add("is-hidden");
  loadingStage?.classList.remove("is-morph-enter");
  renderSsoAccountList();

  const modal = document.getElementById("sso-modal");
  modal?.classList.remove("is-hidden");
  syncBodyScrollLock();
  const firstCard = modal?.querySelector(".sso-account-card");
  firstCard?.focus();
  announceA11y(`${cfg.title}. ${cfg.desc}`);
}

function closeSsoModal(restoreFocus = true) {
  clearTimeout(ssoState.timer);
  ssoState.timer = null;
  ssoState.loading = false;
  resetSsoBoxHeightTransition();
  document.getElementById("sso-stage-loading")?.classList.remove("is-morph-enter");
  const modal = document.getElementById("sso-modal");
  const wasOpen = modal && !modal.classList.contains("is-hidden");
  modal?.classList.add("is-hidden");
  syncBodyScrollLock();
  if (wasOpen && restoreFocus && ssoState.triggerEl && document.contains(ssoState.triggerEl)) {
    ssoState.triggerEl.focus();
  }
  ssoState.triggerEl = null;
}

function startSsoSync(userId) {
  if (ssoState.loading) return;
  hideToast(true);
  const acc = SSO_ACCOUNTS.find((a) => a.userId === userId) || SSO_ACCOUNTS[0];
  const cfg = SSO_PROVIDERS[ssoState.provider] || SSO_PROVIDERS.gennera;
  ssoState.loading = true;
  ssoState.selectedUserId = acc.userId;

  const loadIcon = document.getElementById("sso-loading-provider-icon");
  if (loadIcon) {
    loadIcon.className = `sso-provider-badge is-sm ${cfg.badgeClass}`;
    loadIcon.innerHTML = cfg.iconSvg;
  }
  document.getElementById("sso-loading-provider-name").textContent = cfg.loadingHeader;
  document.getElementById("sso-loading-title").textContent = cfg.loadingTitle;

  document.getElementById("sso-loading-profile").innerHTML = `
    <span class="sso-loading-profile-main">
      <span class="sso-avatar is-sm" aria-hidden="true">${escapeHtml(acc.initials)}</span>
      <strong>${escapeHtml(acc.name)}</strong>
    </span>
    <span class="sso-loading-check" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
  `;

  const box = document.querySelector("#sso-modal .sso-modal-box");
  const selectStage = document.getElementById("sso-stage-select");
  const loadingStage = document.getElementById("sso-stage-loading");
  resetSsoBoxHeightTransition();

  if (box && !prefersReducedMotion()) {
    const fromHeight = box.getBoundingClientRect().height;
    selectStage?.classList.add("is-hidden");
    loadingStage?.classList.remove("is-hidden");
    loadingStage?.classList.remove("is-morph-enter");
    void loadingStage?.offsetWidth;
    loadingStage?.classList.add("is-morph-enter");

    const toHeight = box.getBoundingClientRect().height;
    if (Math.abs(toHeight - fromHeight) > 2) {
      box.style.height = `${fromHeight}px`;
      box.style.overflow = "hidden";
      void box.offsetHeight;
      box.classList.add("is-morphing-height");
      box.style.height = `${toHeight}px`;

      const onEnd = (ev) => {
        if (ev.target === box && ev.propertyName === "height") {
          resetSsoBoxHeightTransition();
        }
      };
      ssoState.heightEndHandler = onEnd;
      box.addEventListener("transitionend", onEnd);
      ssoState.heightTimer = setTimeout(resetSsoBoxHeightTransition, 290);
    }
  } else {
    selectStage?.classList.add("is-hidden");
    loadingStage?.classList.remove("is-hidden");
    loadingStage?.classList.remove("is-morph-enter");
  }
  announceA11y(cfg.loadingTitle);

  const delayMs = prefersReducedMotion() ? 60 : 600;
  ssoState.timer = setTimeout(() => {
    ssoState.timer = null;
    ssoState.loading = false;
    const { user } = ensureDemoUser(acc.userId);
    if (!user) {
      closeSsoModal(true);
      return;
    }
    state.currentUserId = user.id;
    saveState();
    closeSsoModal(false);
    renderTopbar();
    if (user.role === "monitor") {
      switchView("monitor");
    } else {
      ui.step = 1;
      switchView("agendar");
    }
    showToast(`Conectado via ${cfg.name} · ${acc.shortToastName}`, null, "success");
  }, delayMs);
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

function syncSearchPlaceholder() {
  const input = document.getElementById("input-search");
  if (!input) return;
  const isCompactOrTouch =
    window.innerWidth <= 768 ||
    Boolean(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  input.placeholder = isCompactOrTouch
    ? "Buscar disciplina ou monitor"
    : "Buscar disciplina ou monitor (/)";
}

function renderStepper() {
  const c1 = document.getElementById("crumb-1");
  const c2 = document.getElementById("crumb-2");
  const c3 = document.getElementById("crumb-3");
  const isMobile = window.innerWidth <= 768;

  const lbl1 = isMobile ? "1. Monitoria" : "1. Escolher monitoria";
  const lbl2 = isMobile ? "2. Horário" : "2. Data e horário";
  const lbl3 = "3. Confirmar";
  const lbl3Done = "3. Confirmado";

  [c1, c2, c3].forEach((c) => c.classList.remove("is-active", "is-done"));
  c1.disabled = false;
  c2.disabled = !ui.selectedOfferingId;
  c3.disabled = !ui.selectedSlotId;

  c1.innerHTML = `<span>${lbl1}</span>`;
  c2.innerHTML = `<span>${lbl2}</span>`;
  c3.innerHTML = `<span>${lbl3}</span>`;

  if (ui.step === 1) c1.classList.add("is-active");
  if (ui.step === 2) {
    c1.classList.add("is-done");
    c1.innerHTML = `${STEP_CHECK_SVG}<span>${lbl1}</span>`;
    c2.classList.add("is-active");
  }
  if (ui.step === 3) {
    c1.classList.add("is-done");
    c1.innerHTML = `${STEP_CHECK_SVG}<span>${lbl1}</span>`;
    c2.classList.add("is-done");
    c2.innerHTML = `${STEP_CHECK_SVG}<span>${lbl2}</span>`;
    if (ui.step3Completed) {
      c3.classList.add("is-done");
      c3.innerHTML = `${STEP_CHECK_SVG}<span>${lbl3Done}</span>`;
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

  if (!tabsEl.querySelector("[data-subject-tab]")) {
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
  } else {
    tabsEl.querySelectorAll("[data-subject-tab]").forEach((btn) => {
      const active = btn.dataset.subjectTab === ui.subjectFilter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
  }
  syncAllSlidingIndicators();

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

    const dayShortMap = {
      Segunda: "Seg",
      "Terça": "Ter",
      Quarta: "Qua",
      Quinta: "Qui",
      Sexta: "Sex",
    };

    const slotsByDay = Object.fromEntries(DAYS_OF_WEEK.map((d) => [d, []]));
    filteredSlots.forEach((sl) => {
      if (slotsByDay[sl.dayName]) slotsByDay[sl.dayName].push(sl);
    });
    DAYS_OF_WEEK.forEach((d) => {
      slotsByDay[d].sort((a, b) => a.time.localeCompare(b.time));
    });

    if (!ui.mobileMatrixDay || !DAYS_OF_WEEK.includes(ui.mobileMatrixDay)) {
      ui.mobileMatrixDay = DAYS_OF_WEEK.find((d) => slotsByDay[d].length > 0) || DAYS_OF_WEEK[0];
    }
    const activeDaySlots = slotsByDay[ui.mobileMatrixDay] || [];

    const mobileDayTabsHtml = DAYS_OF_WEEK.map((day) => {
      const count = slotsByDay[day].length;
      const active = day === ui.mobileMatrixDay;
      return `
        <button
          type="button"
          class="mmd-btn ${active ? "is-active" : ""} ${count === 0 ? "is-empty" : ""}"
          role="tab"
          aria-selected="${active}"
          data-matrix-day="${escapeHtml(day)}"
        >
          <span class="mmd-day">${escapeHtml(dayShortMap[day] || day.slice(0, 3))}</span>
          <span class="mmd-badge" aria-label="${count} ${count === 1 ? "horário" : "horários"}">${count}</span>
        </button>
      `;
    }).join("");

    const mobileSlotsListHtml =
      activeDaySlots.length === 0
        ? `<div class="mobile-matrix-empty">Nenhuma monitoria disponível na ${escapeHtml(
            ui.mobileMatrixDay.toLowerCase()
          )} para os filtros atuais.</div>`
        : activeDaySlots
            .map((sl) => {
              const off = getOffering(sl.offeringId);
              const rem = getSlotRemaining(sl);
              const [startT, endT] = sl.time.split(" - ");
              const dotClass = rem === 0 ? "dot-muted" : rem <= 1 ? "dot-amber" : "dot-green";
              return `
                <button
                  type="button"
                  class="mobile-matrix-slot"
                  data-mobile-matrix-slot="${escapeHtml(sl.id)}"
                  ${rem <= 0 ? "disabled" : ""}
                >
                  <div class="mms-time">
                    <strong>${escapeHtml(startT)}</strong>
                    <span>${escapeHtml(endT || "")}</span>
                  </div>
                  <div class="mms-body">
                    <p class="mms-subject">${escapeHtml(off.subject)}</p>
                    <p class="mms-meta">${escapeHtml(off.monitor)} · ${escapeHtml(
                off.shortLocation || off.location
              )}</p>
                    <span class="mms-vac">
                      <span class="status-dot-inline ${dotClass}" aria-hidden="true"></span>
                      ${escapeHtml(formatVagas(rem, false))} · ${formatDateBr(sl.dateIso).slice(0, 5)}
                    </span>
                  </div>
                  <span class="mms-arrow" aria-hidden="true">→</span>
                </button>
              `;
            })
            .join("");

    matrixBox.innerHTML = `
      <div class="matrix-desktop-view">
        <table class="matrix-table">
          <thead><tr><th scope="col">Horário</th>${headCols}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
      <div class="matrix-mobile-view">
        <div class="mobile-matrix-days" id="mobile-matrix-days" role="tablist" aria-label="Dias da semana">
          ${mobileDayTabsHtml}
        </div>
        <div class="mobile-matrix-list" role="tabpanel">
          ${mobileSlotsListHtml}
        </div>
      </div>
    `;
    syncAllSlidingIndicators(true);
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
  resetLiquidButtonState(document.getElementById("btn-download-ics"));
  resetLiquidButtonState(document.getElementById("btn-copy-proof"));
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
        ui.highlightedBookingId = reschedBk.id;
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

    ui.highlightedBookingId = ui.lastCreatedBookingId;
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
    summaryHtml: buildConfirmSummaryCard({
      title: off.subject,
      rows: [
        { label: "Data e horário", value: `${slot.dayName}, ${formatDateBr(slot.dateIso)} às ${slot.time}` },
        { label: "Monitor", value: off.monitor },
        {
          label: "Local / Modalidade",
          value: off.location.toLowerCase().includes(off.mode.toLowerCase())
            ? off.location
            : `${off.location} · ${off.mode}`,
        },
        { label: "Dúvida", value: topic, stacked: true },
      ],
    }),
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
    syncAllSlidingIndicators();
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
      const isHighlight = bk.id === ui.highlightedBookingId;

      return `
        <div class="booking-row ${isInactive ? "is-status-inactive" : "is-status-active"} ${
        isHighlight ? "is-row-highlight" : ""
      }" data-booking-row="${escapeHtml(bk.id)}">
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
  ui.highlightedBookingId = null;
  syncAllSlidingIndicators();
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
  ).textContent = `Disciplina vinculada: ${subjectName}. Apenas agendamentos e horários desta matéria aparecem aqui.`;

  const listEl = document.getElementById("monitor-bookings-list");
  const slotsListEl = document.getElementById("monitor-slots-list");
  const filterToggleEl = document.getElementById("monitor-filter-toggle");
  const activeTab = ui.monitorTab === "slots" ? "slots" : "bookings";

  document.querySelectorAll("#monitor-section-tabs [data-mon-tab]").forEach((btn) => {
    const active = btn.dataset.monTab === activeTab;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  listEl?.classList.toggle("is-hidden", activeTab !== "bookings");
  slotsListEl?.classList.toggle("is-hidden", activeTab !== "slots");
  filterToggleEl?.classList.toggle("is-hidden", activeTab !== "bookings");

  const disciplineBookings = state.bookings.filter((bk) => {
    const slot = state.slots.find((s) => s.id === bk.slotId);
    return Boolean(slot && user.offeringId && slot.offeringId === user.offeringId);
  });

  const relevantBookings =
    ui.monitorFilter === "active"
      ? disciplineBookings.filter((bk) => bk.status === "Confirmado")
      : disciplineBookings;

  const disciplineSlots = state.slots
    .filter((s) => user.offeringId && s.offeringId === user.offeringId)
    .slice()
    .sort((a, b) => `${a.dateIso} ${a.time}`.localeCompare(`${b.dateIso} ${b.time}`));

  const bookingsCountEl = document.getElementById("monitor-bookings-count");
  const slotsCountEl = document.getElementById("monitor-slots-count");
  if (bookingsCountEl) bookingsCountEl.textContent = String(relevantBookings.length);
  if (slotsCountEl) slotsCountEl.textContent = String(disciplineSlots.length);

  if (relevantBookings.length === 0) {
    listEl.innerHTML = `<div class="empty-box" style="border:none"><p>Nenhum aluno agendado nesta disciplina${
      ui.monitorFilter === "active" ? " no momento" : ""
    }.</p></div>`;
  } else {
    listEl.innerHTML = relevantBookings
      .slice()
      .reverse()
      .map((bk) => {
        const slot = state.slots.find((s) => s.id === bk.slotId);
        const stu = getUserById(bk.studentId);
        if (!slot) return "";

        const dateParts = getDateBadgeParts(slot.dateIso, slot.dayName);
        const isInactive = bk.status !== "Confirmado";
        const isHighlight = bk.id === ui.highlightedBookingId;

        return `
          <div class="booking-row ${isInactive ? "is-status-inactive" : "is-status-active"} ${
          isHighlight ? "is-row-highlight" : ""
        }" data-booking-row="${escapeHtml(bk.id)}">
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

  if (slotsListEl) {
    if (disciplineSlots.length === 0) {
      slotsListEl.innerHTML = `<div class="empty-box" style="border:none"><p>Nenhum horário publicado para esta disciplina.</p></div>`;
    } else {
      slotsListEl.innerHTML = disciplineSlots
        .map((slot) => {
          const dateParts = getDateBadgeParts(slot.dateIso, slot.dayName);
          const confirmedDynamic = state.bookings.filter(
            (b) => b.slotId === slot.id && b.status === "Confirmado"
          ).length;
          const occupied = Math.min(slot.capacity, getSlotOccupied(slot));
          const rem = getSlotRemaining(slot);
          const canRemove = confirmedDynamic === 0;

          return `
            <div class="monitor-slot-row" data-slot-row="${escapeHtml(slot.id)}">
              <div class="monitor-slot-main">
                <div class="booking-date-block" aria-hidden="true">
                  <span class="booking-date-day">${escapeHtml(dateParts.day)}</span>
                  <span class="booking-date-month">${escapeHtml(dateParts.month)}</span>
                  <span class="booking-date-wk">${escapeHtml(dateParts.weekday)}</span>
                </div>
                <div class="monitor-slot-meta">
                  <p class="monitor-slot-time">${escapeHtml(slot.time)}</p>
                  <p class="monitor-slot-sub">${escapeHtml(slot.dayName)}, ${formatDateBr(slot.dateIso)} · ${escapeHtml(
            formatVagas(rem, false)
          )}</p>
                </div>
              </div>
              <div class="monitor-slot-right">
                <span class="slot-occ-badge">${occupied}/${slot.capacity} ocupadas</span>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  data-remove-slot="${escapeHtml(slot.id)}"
                  ${canRemove ? "" : 'disabled title="Há aluno confirmado neste horário"'}
                >
                  Remover
                </button>
              </div>
            </div>
          `;
        })
        .join("");
    }
  }

  ui.highlightedBookingId = null;
  syncAllSlidingIndicators(true);
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
    summaryHtml: buildConfirmSummaryCard({
      title: off ? off.subject : "Monitoria",
      rows: [
        { label: "Data e horário", value: `${dayName}, ${formatDateBr(dateIso)} às ${time}` },
        { label: "Limite de vagas", value: `${capacity} ${capacity === 1 ? "vaga" : "vagas"}` },
      ],
    }),
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
      if (!prefersReducedMotion()) {
        const panel = document.getElementById("form-new-slot");
        if (panel) {
          panel.classList.remove("is-flash-confirm");
          void panel.offsetWidth;
          panel.classList.add("is-flash-confirm");
          setTimeout(() => panel.classList.remove("is-flash-confirm"), 620);
        }
      }
      showToast(`Novo horário publicado (${dayName}, ${formatDateBr(dateIso)} às ${time.split(" - ")[0]}).`);
      renderMonitorPanel();
    },
  });
}

// ==================== UTILITÁRIOS: MODAL, .ICS, TOAST ====================
let pendingConfirmCallback = null;
let lastConfirmTriggerEl = null;

function buildConfirmSummaryCard({ title = "", rows = [] }) {
  const titleMarkup = title ? `<p class="confirm-summary-title">${escapeHtml(title)}</p>` : "";
  const rowsMarkup = rows
    .filter((r) => r && r.value)
    .map(
      (r) => `
      <div class="confirm-summary-row ${r.stacked ? "is-stacked" : ""}">
        <dt>${escapeHtml(r.label)}</dt>
        <dd>${escapeHtml(r.value)}</dd>
      </div>
    `
    )
    .join("");
  return `${titleMarkup}${rowsMarkup ? `<dl class="confirm-summary-list">${rowsMarkup}</dl>` : ""}`;
}

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
  syncBodyScrollLock();
  proceedBtn.focus();
}

function closeConfirmDialog() {
  const modal = document.getElementById("confirm-modal");
  const wasOpen = modal && !modal.classList.contains("is-hidden");
  pendingConfirmCallback = null;
  modal?.classList.add("is-hidden");
  syncBodyScrollLock();
  if (wasOpen && lastConfirmTriggerEl && document.contains(lastConfirmTriggerEl)) {
    lastConfirmTriggerEl.focus();
  }
  lastConfirmTriggerEl = null;
}

function buildIcsEventLines(bk, slot, off, reminderMinutes) {
  const dateCompact = slot.dateIso.replaceAll("-", "");
  const [startRaw, endRaw] = slot.time.split(" - ");
  const start = startRaw.replace(":", "") + "00";
  const end = endRaw.replace(":", "") + "00";

  const lines = [
    "BEGIN:VEVENT",
    `UID:${bk.id}@monitoraplus`,
    `DTSTART:${dateCompact}T${start}`,
    `DTEND:${dateCompact}T${end}`,
    `SUMMARY:Monitoria - ${off.subject}`,
    `DESCRIPTION:Protocolo ${bk.protocol} | ${off.monitor} | Dúvida: ${bk.topic}`,
    `LOCATION:${off.location}`,
  ];

  if (reminderMinutes > 0) {
    lines.push(
      "BEGIN:VALARM",
      `TRIGGER:-PT${reminderMinutes}M`,
      "ACTION:DISPLAY",
      `DESCRIPTION:Lembrete de monitoria: ${off.subject} (${off.location})`,
      "END:VALARM"
    );
  }

  lines.push("END:VEVENT");
  return lines;
}

function buildIcsCalendar(eventBlocks) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Monitora+//PT-BR",
    "CALSCALE:GREGORIAN",
    ...eventBlocks.flat(),
    "END:VCALENDAR",
  ].join("\r\n");
}

function triggerIcsFileDownload(icsContent, filename) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const LIQUID_CHECK_SVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

function resetLiquidButtonState(btn) {
  if (!btn) return;
  clearTimeout(btn._liquidTimer);
  clearTimeout(btn._liquidCleanupTimer);
  btn._liquidTimer = null;
  btn._liquidCleanupTimer = null;
  if (btn.dataset.origLabel) {
    btn.textContent = btn.dataset.origLabel;
  }
  btn.classList.remove("is-liquid-confirmed");
  btn.style.minWidth = "";
}

function flashLiquidButtonState(btn, confirmedText, durationMs = 1800) {
  if (!btn) return;
  if (!btn.dataset.origLabel) {
    btn.dataset.origLabel = btn.textContent.trim();
  }
  const origLabel = btn.dataset.origLabel;
  clearTimeout(btn._liquidTimer);
  clearTimeout(btn._liquidCleanupTimer);
  btn._liquidTimer = null;
  btn._liquidCleanupTimer = null;

  // Ajuste fino 4: preserva largura original (>= min-width) para evitar saltos laterais nos botões vizinhos
  if (!btn.style.minWidth) {
    const rect = btn.getBoundingClientRect();
    if (rect.width > 0) {
      btn.style.minWidth = `${Math.ceil(rect.width)}px`;
    }
  }

  const animate = !prefersReducedMotion();
  btn.classList.add("is-liquid-confirmed");
  btn.innerHTML = `<span class="btn-liquid-content${animate ? " is-liquid-swap" : ""}">${LIQUID_CHECK_SVG}<span>${escapeHtml(confirmedText)}</span></span>`;

  btn._liquidTimer = setTimeout(() => {
    btn._liquidTimer = null;
    btn.classList.remove("is-liquid-confirmed");
    if (!prefersReducedMotion()) {
      btn.innerHTML = `<span class="btn-liquid-content is-liquid-swap">${escapeHtml(origLabel)}</span>`;
      btn._liquidCleanupTimer = setTimeout(() => {
        btn._liquidCleanupTimer = null;
        btn.textContent = origLabel;
        btn.style.minWidth = "";
      }, 220);
    } else {
      btn.textContent = origLabel;
      btn.style.minWidth = "";
    }
  }, durationMs);
}

function downloadIcs(bookingId, triggerBtn = null) {
  const bk = state.bookings.find((b) => b.id === bookingId);
  const slot = bk ? state.slots.find((s) => s.id === bk.slotId) : null;
  const off = slot ? getOffering(slot.offeringId) : null;
  if (!bk || !slot || !off) return;

  const reminderMinutes = Number(getPrefs().icsReminderMinutes ?? 30);
  const ics = buildIcsCalendar([buildIcsEventLines(bk, slot, off, reminderMinutes)]);
  triggerIcsFileDownload(ics, `monitoria-${bk.protocol.replace("#", "")}.ics`);
  if (triggerBtn) flashLiquidButtonState(triggerBtn, "Salvo", 1800);
  showToast("Lembrete .ics baixado.");
}

function downloadAllConfirmedIcs() {
  const user = getCurrentUser();
  if (!user) return;

  const confirmed = state.bookings.filter((b) => b.studentId === user.id && b.status === "Confirmado");
  if (confirmed.length === 0) {
    showToast("Nenhuma monitoria confirmada para exportar.");
    return;
  }

  const reminderMinutes = Number(getPrefs().icsReminderMinutes ?? 30);
  const eventBlocks = [];
  confirmed.forEach((bk) => {
    const slot = state.slots.find((s) => s.id === bk.slotId);
    const off = slot ? getOffering(slot.offeringId) : null;
    if (slot && off) {
      eventBlocks.push(buildIcsEventLines(bk, slot, off, reminderMinutes));
    }
  });

  if (eventBlocks.length === 0) return;

  const ics = buildIcsCalendar(eventBlocks);
  triggerIcsFileDownload(ics, `monitoraplus-agenda-${user.ra}.ics`);
  const label = eventBlocks.length === 1 ? "1 monitoria exportada" : `${eventBlocks.length} monitorias exportadas`;
  showToast(`Agenda .ics baixada (${label}).`, null, "success");
}

async function copyProof(bookingId, triggerBtn = null) {
  const bk = state.bookings.find((b) => b.id === bookingId);
  const slot = bk ? state.slots.find((s) => s.id === bk.slotId) : null;
  const off = slot ? getOffering(slot.offeringId) : null;
  const usr = bk ? getUserById(bk.studentId) : null;
  if (!bk || !slot || !off || !usr) return;

  const text = `Comprovante Monitora+ (${bk.protocol})\nEstudante: ${usr.name}\nDisciplina: ${off.subject}\nData: ${slot.dayName}, ${formatDateBr(slot.dateIso)} às ${slot.time}\nLocal: ${off.location}`;
  try {
    await navigator.clipboard.writeText(text);
    if (triggerBtn) flashLiquidButtonState(triggerBtn, "Copiado", 1800);
    showToast("Comprovante copiado.");
  } catch {
    if (triggerBtn) flashLiquidButtonState(triggerBtn, "Copiado", 1800);
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
let toastHideTimer = null;
let toastMorphTimer = null;
let toastRemainingMs = 0;
let toastStartedAt = 0;
let currentToastUndo = null;

function clearToastWidthMorph(el) {
  clearTimeout(toastMorphTimer);
  toastMorphTimer = null;
  if (!el) return;
  el.classList.remove("is-width-morphing");
  el.style.width = "";
}

function hideToast(immediate = false) {
  const el = document.getElementById("toast");
  clearTimeout(toastTimer);
  clearTimeout(toastHideTimer);
  toastTimer = null;
  toastHideTimer = null;
  currentToastUndo = null;
  toastRemainingMs = 0;
  if (!el) return;

  clearToastWidthMorph(el);
  el.dataset.paused = "false";

  if (immediate || prefersReducedMotion() || el.classList.contains("is-hidden")) {
    el.classList.remove("is-exiting", "is-toast-swap");
    el.classList.add("is-hidden");
    return;
  }

  el.classList.remove("is-toast-swap");
  el.classList.add("is-exiting");
  toastHideTimer = setTimeout(() => {
    toastHideTimer = null;
    el.classList.remove("is-exiting");
    el.classList.add("is-hidden");
  }, 180);
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
  toastTimer = setTimeout(() => hideToast(false), toastRemainingMs);
}

function showToast(msg, onUndo = null, explicitCategory = null) {
  const el = document.getElementById("toast");
  const iconEl = document.getElementById("toast-icon");
  const msgEl = document.getElementById("toast-msg");
  const subEl = document.getElementById("toast-sub");
  const undoBtn = document.getElementById("toast-undo-btn");
  const progressEl = document.getElementById("toast-progress");
  if (!el || !msgEl) return;

  // Ajuste fino 3: cancela imediatamente qualquer saída em andamento (180ms) para nunca ocultar o novo toast
  const wasExiting = el.classList.contains("is-exiting");
  clearTimeout(toastHideTimer);
  toastHideTimer = null;
  el.classList.remove("is-exiting");

  const wasVisible = !el.classList.contains("is-hidden");
  const reduceMotion = prefersReducedMotion();
  const isDesktopMorph = wasVisible && !wasExiting && !reduceMotion && window.innerWidth > 768;
  const prevWidth = isDesktopMorph ? el.getBoundingClientRect().width : 0;

  clearToastWidthMorph(el);

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

  if (wasVisible && !reduceMotion) {
    if (isDesktopMorph && prevWidth > 0) {
      const nextWidth = el.getBoundingClientRect().width;
      if (Math.abs(nextWidth - prevWidth) > 2) {
        el.style.width = `${prevWidth}px`;
        void el.offsetWidth;
        el.classList.add("is-width-morphing");
        el.style.width = `${nextWidth}px`;
        toastMorphTimer = setTimeout(() => clearToastWidthMorph(el), 230);
      }
    }
    el.classList.remove("is-toast-swap");
    void el.offsetWidth;
    el.classList.add("is-toast-swap");
  } else {
    el.classList.remove("is-toast-swap");
  }

  clearTimeout(toastTimer);
  toastRemainingMs = duration;
  toastStartedAt = Date.now();
  toastTimer = setTimeout(() => hideToast(false), duration);
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

  document.getElementById("profile-sheet-backdrop")?.addEventListener("click", () => closeProfileMenu(true));

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#profile-menu-wrap") && !e.target.closest("#profile-dropdown")) {
      closeProfileMenu(false);
    }
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

  document.querySelectorAll("[data-mode-opt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.modeOpt;
      const prefs = getPrefs();
      prefs.colorMode = mode;
      if (mode !== "system") {
        state.theme = mode;
      }
      prefs.customBg = null;
      prefs.customFg = null;
      saveState();
      applyThemeAndA11y();
    });
  });

  document.querySelectorAll(".theme-opt:not([data-mode-opt])").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prefs = getPrefs();
      prefs.colorMode = btn.dataset.theme;
      state.theme = btn.dataset.theme;
      prefs.customBg = null;
      prefs.customFg = null;
      saveState();
      applyThemeAndA11y();
    });
  });

  if (window.matchMedia) {
    const schemeMql = window.matchMedia("(prefers-color-scheme: dark)");
    const onSchemeChange = () => {
      if (getPrefs().colorMode === "system") applyThemeAndA11y();
    };
    if (typeof schemeMql.addEventListener === "function") {
      schemeMql.addEventListener("change", onSchemeChange);
    }
  }

  document.getElementById("pref-theme-preset")?.addEventListener("change", (e) => {
    const prefs = getPrefs();
    prefs.themePreset = e.target.value;
    prefs.customAccent = null;
    saveState();
    applyThemeAndA11y();
    announceA11y(`Tema alterado para ${e.target.selectedOptions[0]?.textContent || e.target.value}.`);
  });

  document.getElementById("accent-swatches")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-accent-hex]");
    if (!btn) return;
    getPrefs().customAccent = btn.dataset.accentHex;
    saveState();
    applyThemeAndA11y();
    announceA11y(`Cor de destaque alterada para ${btn.getAttribute("aria-label") || btn.dataset.accentHex}.`);
  });

  document.getElementById("pref-accent-picker")?.addEventListener("input", (e) => {
    const hex = normalizeHexColor(e.target.value);
    if (!hex) return;
    getPrefs().customAccent = hex;
    applyCustomColors();
  });

  document.getElementById("pref-accent-picker")?.addEventListener("change", (e) => {
    const hex = normalizeHexColor(e.target.value);
    if (!hex) return;
    getPrefs().customAccent = hex;
    saveState();
    applyCustomColors();
  });

  document.getElementById("pref-ui-font")?.addEventListener("change", (e) => {
    getPrefs().uiFont = e.target.value;
    saveState();
    applyThemeAndA11y();
    syncAllSlidingIndicators(true);
    announceA11y(`Fonte da interface alterada para ${e.target.selectedOptions[0]?.textContent || e.target.value}.`);
  });

  // Aparência -> Avançado: cores personalizadas + validador WCAG 2.1 ao vivo
  let customColorSaveTimer = null;
  const scheduleColorSave = () => {
    clearTimeout(customColorSaveTimer);
    customColorSaveTimer = setTimeout(() => saveState(), 120);
  };

  const setCustomColor = (key, rawHex, immediateSave = false) => {
    const norm = normalizeHexColor(rawHex);
    if (!norm) return false;
    getPrefs()[key] = norm;
    applyCustomColors();
    if (immediateSave) {
      clearTimeout(customColorSaveTimer);
      saveState();
    } else {
      scheduleColorSave();
    }
    return true;
  };

  document.getElementById("custom-bg-picker")?.addEventListener("input", (e) => {
    setCustomColor("customBg", e.target.value, false);
  });
  document.getElementById("custom-bg-picker")?.addEventListener("change", (e) => {
    setCustomColor("customBg", e.target.value, true);
  });
  document.getElementById("custom-fg-picker")?.addEventListener("input", (e) => {
    setCustomColor("customFg", e.target.value, false);
  });
  document.getElementById("custom-fg-picker")?.addEventListener("change", (e) => {
    setCustomColor("customFg", e.target.value, true);
  });

  [
    ["custom-bg-hex", "customBg"],
    ["custom-fg-hex", "customFg"],
  ].forEach(([inputId, prefKey]) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener("input", () => {
      const val = input.value.trim();
      if (/^#?[0-9a-fA-F]{6}$/.test(val)) {
        setCustomColor(prefKey, val, false);
      }
    });
    input.addEventListener("blur", () => {
      if (!setCustomColor(prefKey, input.value, true)) {
        applyCustomColors();
      }
    });
  });

  document.getElementById("btn-fix-contrast")?.addEventListener("click", () => {
    const prefs = getPrefs();
    const resolvedTheme = getResolvedTheme();
    const base = THEME_BASE_COLORS[resolvedTheme] || THEME_BASE_COLORS.light;
    const bg = normalizeHexColor(prefs.customBg) || base.bg;
    const fg = normalizeHexColor(prefs.customFg) || base.fg;
    const fixedFg = findNearestReadableFg(bg, fg, 7.0);
    prefs.customBg = bg;
    prefs.customFg = fixedFg;
    saveState();
    applyCustomColors();
    const ratio = getContrastRatio(bg, fixedFg).toFixed(1);
    announceA11y(`Contraste corrigido automaticamente para ${ratio} para 1.`);
    showToast(`Contraste ajustado para ${ratio}:1 (${fixedFg.toUpperCase()}).`, null, "success");
  });

  document.getElementById("btn-reset-custom-colors")?.addEventListener("click", () => {
    const prefs = getPrefs();
    const resolvedTheme = getResolvedTheme();
    prefs.customBg = null;
    prefs.customFg = null;
    saveState();
    applyThemeAndA11y();
    const themeLabel =
      resolvedTheme === "dark" ? "Escuro" : resolvedTheme === "contrast" ? "Contraste AAA" : "Claro";
    announceA11y(`Cores padrão do tema ${themeLabel} restauradas.`);
    showToast(`Cores padrão do tema ${themeLabel} restauradas.`, null, "success");
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

  document.getElementById("ics-reminder-group")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-ics-reminder]");
    if (!btn) return;
    const mins = Number(btn.dataset.icsReminder);
    getPrefs().icsReminderMinutes = mins;
    saveState();
    applyThemeAndA11y();
    const label = mins === 0 ? "sem alerta" : mins === 60 ? "1 hora antes" : `${mins} minutos antes`;
    announceA11y(`Antecedência do lembrete .ics definida para ${label}.`);
  });

  document.getElementById("btn-export-confirmed-ics")?.addEventListener("click", downloadAllConfirmedIcs);

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
      syncAllSlidingIndicators();
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

  // Toggle mostrar/ocultar senha (Entrar e Criar conta)
  document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.togglePassword);
      if (!input) return;
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      const nowShowing = !showing;
      btn.setAttribute("aria-pressed", String(nowShowing));
      btn.setAttribute("aria-label", nowShowing ? "Ocultar senha" : "Mostrar senha");
      btn.querySelector(".icon-eye-open")?.classList.toggle("is-hidden", nowShowing);
      btn.querySelector(".icon-eye-closed")?.classList.toggle("is-hidden", !nowShowing);
    });
  });

  // SSO Institucional (Gennera UNIFSA & Google)
  document.getElementById("btn-sso-gennera")?.addEventListener("click", (e) => {
    openSsoModal("gennera", e.currentTarget);
  });
  document.getElementById("btn-sso-google")?.addEventListener("click", (e) => {
    openSsoModal("google", e.currentTarget);
  });
  document.getElementById("btn-sso-close")?.addEventListener("click", () => closeSsoModal(true));
  document.getElementById("sso-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "sso-modal") closeSsoModal(true);
  });
  document.getElementById("sso-account-list")?.addEventListener("click", (e) => {
    const card = e.target.closest("[data-sso-account]");
    if (!card || ssoState.loading) return;
    const chosenId = card.dataset.ssoAccount;
    ssoState.selectedUserId = chosenId;
    if (window.innerWidth <= 768) {
      renderSsoAccountList();
    } else {
      startSsoSync(chosenId);
    }
  });
  document.getElementById("btn-sso-continue")?.addEventListener("click", () => {
    if (!ssoState.loading) startSsoSync(ssoState.selectedUserId);
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
        const active = b.dataset.step1Layout === ui.step1Layout;
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
    const dayBtn = e.target.closest("[data-matrix-day]");
    if (dayBtn) {
      ui.mobileMatrixDay = dayBtn.dataset.matrixDay;
      renderStep1();
      return;
    }
    const mobileSlotBtn = e.target.closest("[data-mobile-matrix-slot]");
    if (mobileSlotBtn && !mobileSlotBtn.disabled) {
      const slot = state.slots.find((s) => s.id === mobileSlotBtn.dataset.mobileMatrixSlot);
      if (!slot) return;
      ui.selectedOfferingId = slot.offeringId;
      ui.selectedDateIso = slot.dateIso;
      ui.selectedSlotId = slot.id;
      setStep(2);
      return;
    }
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
    if (window.innerWidth <= 768) {
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
  document.getElementById("btn-download-ics").addEventListener("click", (e) => {
    if (ui.lastCreatedBookingId) downloadIcs(ui.lastCreatedBookingId, e.currentTarget);
  });
  document.getElementById("btn-copy-proof").addEventListener("click", (e) => {
    if (ui.lastCreatedBookingId) copyProof(ui.lastCreatedBookingId, e.currentTarget);
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
            ? buildConfirmSummaryCard({
                title: `${bk.protocol} · ${off.subject}`,
                rows: [
                  { label: "Data e horário", value: `${slot.dayName}, ${formatDateBr(slot.dateIso)} às ${slot.time}` },
                  { label: "Monitor", value: off.monitor },
                ],
              })
            : "",
        confirmText: "Sim, cancelar vaga",
        danger: true,
        onConfirm: () => {
          const rowEl = document.querySelector(`#bookings-list [data-booking-row="${bk.id}"]`);
          animateRowExitAndRun(rowEl, () => {
            bk.status = "Cancelado";
            saveState();
            renderTopbar();
            renderBookings();
            showToast(`Agendamento ${bk.protocol} cancelado.`, () => {
              bk.status = "Confirmado";
              ui.highlightedBookingId = bk.id;
              saveState();
              renderTopbar();
              renderBookings();
              showToast(`Cancelamento desfeito (${bk.protocol}).`);
            });
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
  document.getElementById("btn-confirm-close")?.addEventListener("click", closeConfirmDialog);
  document.getElementById("confirm-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "confirm-modal") closeConfirmDialog();
  });
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

  document.getElementById("toast-close-btn")?.addEventListener("click", () => hideToast(false));

  document.getElementById("toast-undo-btn")?.addEventListener("click", () => {
    const fn = currentToastUndo;
    hideToast(false);
    if (typeof fn === "function") fn();
  });

  // Painel do Monitor
  document.getElementById("monitor-section-tabs")?.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-mon-tab]");
    if (!tab) return;
    ui.monitorTab = tab.dataset.monTab;
    renderMonitorPanel();
  });

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
  document.getElementById("monitor-slots-list")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove-slot]");
    if (!btn || btn.disabled) return;
    const slotId = btn.dataset.removeSlot;
    const slot = state.slots.find((s) => s.id === slotId);
    if (!slot) return;
    const hasConfirmed = state.bookings.some((b) => b.slotId === slot.id && b.status === "Confirmado");
    if (hasConfirmed) {
      showToast("Não é possível remover um horário com alunos confirmados.");
      return;
    }
    const off = getOffering(slot.offeringId);

    openConfirmDialog({
      title: "Remover horário publicado?",
      desc: "Este horário deixará de aparecer para novos agendamentos.",
      summaryHtml: buildConfirmSummaryCard({
        title: off ? off.subject : "Monitoria",
        rows: [
          { label: "Data e horário", value: `${slot.dayName}, ${formatDateBr(slot.dateIso)} às ${slot.time}` },
          { label: "Capacidade", value: `${slot.capacity} ${slot.capacity === 1 ? "vaga" : "vagas"}` },
        ],
      }),
      confirmText: "Sim, remover horário",
      danger: true,
      onConfirm: () => {
        const snapshot = structuredClone(slot);
        const rowEl = document.querySelector(`#monitor-slots-list [data-slot-row="${slot.id}"]`);
        animateRowExitAndRun(rowEl, () => {
          state.slots = state.slots.filter((s) => s.id !== slot.id);
          saveState();
          renderMonitorPanel();
          showToast(`Horário removido (${slot.dayName}, ${slot.time.split(" - ")[0]}).`, () => {
            if (!state.slots.some((s) => s.id === snapshot.id)) {
              state.slots.push(snapshot);
              saveState();
              renderMonitorPanel();
              showToast("Remoção de horário desfeita.");
            }
          });
        });
      },
    });
  });

  document.getElementById("monitor-bookings-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-complete-bk]");
    if (!btn) return;
    const bk = state.bookings.find((b) => b.id === btn.dataset.completeBk);
    if (!bk) return;
    const stu = getUserById(bk.studentId);
    const slot = state.slots.find((s) => s.id === bk.slotId);

    openConfirmDialog({
      title: "Concluir atendimento?",
      desc: "O atendimento será marcado como realizado no histórico do estudante.",
      summaryHtml: buildConfirmSummaryCard({
        title: `${bk.protocol} · ${stu ? stu.name : "Estudante"}`,
        rows: [
          slot ? { label: "Data e horário", value: `${slot.dayName}, ${formatDateBr(slot.dateIso)} às ${slot.time}` } : null,
          { label: "Dúvida", value: bk.topic, stacked: true },
        ],
      }),
      confirmText: "Sim, concluir",
      danger: false,
      onConfirm: () => {
        const rowEl = document.querySelector(`#monitor-bookings-list [data-booking-row="${bk.id}"]`);
        animateRowExitAndRun(rowEl, () => {
          bk.status = "Concluído";
          saveState();
          renderMonitorPanel();
          showToast(`Atendimento ${bk.protocol} concluído.`, () => {
            bk.status = "Confirmado";
            ui.highlightedBookingId = bk.id;
            saveState();
            renderMonitorPanel();
            showToast(`Conclusão desfeita (${bk.protocol}).`);
          });
        });
      },
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const ssoModal = document.getElementById("sso-modal");
      if (ssoModal && !ssoModal.classList.contains("is-hidden")) {
        trapFocusInModal(e, ssoModal);
        return;
      }
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
      const profileSheet = document.getElementById("profile-dropdown");
      if (profileSheet && !profileSheet.classList.contains("is-hidden") && profileSheet.classList.contains("is-mobile-sheet")) {
        trapFocusInModal(e, profileSheet);
        return;
      }
    }
    if (e.key === "Escape") {
      if (document.querySelector(".bc-select-wrap.is-open")) {
        closeAllCustomSelects();
        return;
      }
      const ssoModal = document.getElementById("sso-modal");
      if (ssoModal && !ssoModal.classList.contains("is-hidden")) {
        closeSsoModal(true);
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
      const settingsModal = document.getElementById("settings-modal");
      if (settingsModal && !settingsModal.classList.contains("is-hidden")) {
        closeSettingsModal();
        return;
      }
      const profileDropdown = document.getElementById("profile-dropdown");
      if (profileDropdown && !profileDropdown.classList.contains("is-hidden")) {
        closeProfileMenu(true);
        return;
      }
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
    resetSsoBoxHeightTransition();
    clearToastWidthMorph(document.getElementById("toast"));
    if (getPrefs().vlibras) positionVlibrasShadowAccess();
    syncSearchPlaceholder();
    if (ui.activeView === "agendar") renderStepper();
    syncAllSlidingIndicators(true);
    const dd = document.getElementById("profile-dropdown");
    if (dd && !dd.classList.contains("is-hidden")) {
      const wantMobile = isMobileSheetViewport();
      if (wantMobile !== dd.classList.contains("is-mobile-sheet")) {
        openProfileMenu();
      }
    }
    syncBodyScrollLock();
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
syncSearchPlaceholder();
applyThemeAndA11y();
renderTopbar();
startPhraseCarousel();
