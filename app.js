/**
 * Monitora+ — Portal de Agendamento de Monitorias Acadêmicas
 * Autenticação, agendamento em 3 etapas e painel do monitor isolado por disciplina.
 */

const STORAGE_KEY = "monitoraplus_v7_preferences";


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

const OFFERINGS = [];

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

const USER_PREFS_PREFIX = "monitoraplus_v7_prefs_user_";
const PREFS_SYNC_DEBOUNCE_MS = 400;

const VALID_THEME_VALUES = ["light", "dark", "contrast"];
const VALID_COLOR_MODE_VALUES = [null, "system", "light", "dark", "contrast"];
const VALID_PRESET_VALUES = ["monitora", "academic-navy", "forest-slate", "amber-studio", "olive-moss", "graphite"];
const VALID_FONT_VALUES = ["dm-sans", "system", "readable", "mono"];
const VALID_LAYOUT_VALUES = ["list", "matrix"];
const VALID_ICS_VALUES = [0, 15, 30, 60];
const VALID_CVD_VALUES = ["none", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"];
const SYNCABLE_BOOL_KEYS = [
  "confirmBeforeBook",
  "autoIcsHint",
  "dyslexiaSpacing",
  "readingMask",
  "pauseDistractions",
  "extraFocus",
  "largeTargets",
  "reducedMotion",
  "vlibras",
];
const SYNCABLE_HEX_KEYS = ["customAccent", "customBg", "customFg"];

let prefsSyncState = { source: "device", status: "device", updatedAt: null };
let pendingPrefsTimer = null;
let pendingPrefsRequestSeq = 0;

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
    title: "Acessibilidade",
    desc: "Ajustes de cor, leitura, foco por teclado e leitor em voz alta.",
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
    desc: "Sessão ativa, portabilidade de dados e exclusão da conta.",
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
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
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

// ==================== PERSISTÊNCIA E SINCRONIZAÇÃO DE PREFERÊNCIAS ====================
function getUserPrefsStorageKey(userId) {
  return `${USER_PREFS_PREFIX}${String(userId)}`;
}

function sanitizeSyncablePrefs(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const nested = src.prefs && typeof src.prefs === "object" ? src.prefs : src;
  const theme = VALID_THEME_VALUES.includes(src.theme)
    ? src.theme
    : VALID_THEME_VALUES.includes(nested.theme)
    ? nested.theme
    : "light";
  const rawScale = Number.isFinite(src.fontScale)
    ? src.fontScale
    : Number.isFinite(nested.fontScale)
    ? nested.fontScale
    : 1;
  const fontScale = Math.round(Math.min(1.52, Math.max(0.88, Number(rawScale))) * 100) / 100;

  const cleanPrefs = { ...DEFAULT_PREFS };
  delete cleanPrefs.blockConflicts;

  cleanPrefs.colorMode = VALID_COLOR_MODE_VALUES.includes(nested.colorMode) ? nested.colorMode : null;
  cleanPrefs.themePreset = VALID_PRESET_VALUES.includes(nested.themePreset) ? nested.themePreset : "monitora";
  cleanPrefs.uiFont = VALID_FONT_VALUES.includes(nested.uiFont) ? nested.uiFont : "dm-sans";
  cleanPrefs.defaultLayout = VALID_LAYOUT_VALUES.includes(nested.defaultLayout) ? nested.defaultLayout : "list";
  cleanPrefs.icsReminderMinutes = VALID_ICS_VALUES.includes(nested.icsReminderMinutes) ? nested.icsReminderMinutes : 30;
  cleanPrefs.cvdFilter = VALID_CVD_VALUES.includes(nested.cvdFilter) ? nested.cvdFilter : "none";

  SYNCABLE_BOOL_KEYS.forEach((k) => {
    if (typeof nested[k] === "boolean") cleanPrefs[k] = nested[k];
  });
  SYNCABLE_HEX_KEYS.forEach((k) => {
    const val = nested[k];
    if (val === null) cleanPrefs[k] = null;
    else if (typeof val === "string" && /^#[0-9a-fA-F]{6}$/.test(val.trim())) cleanPrefs[k] = val.trim().toLowerCase();
  });

  return { theme, fontScale, prefs: cleanPrefs };
}

function buildSyncablePrefsPayload(bundle = state) {
  const clean = sanitizeSyncablePrefs(bundle);
  return {
    theme: clean.theme,
    fontScale: clean.fontScale,
    ...clean.prefs,
  };
}

function hasCustomPrefsBeyondDefaults(bundle) {
  const current = buildSyncablePrefsPayload(bundle);
  const defaults = buildSyncablePrefsPayload({ theme: "light", fontScale: 1, prefs: DEFAULT_PREFS });
  return Object.keys(defaults).some((key) => current[key] !== defaults[key]);
}

function readStoredPrefsBundle(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return sanitizeSyncablePrefs(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeStoredPrefsBundle(storageKey, bundle) {
  try {
    const clean = sanitizeSyncablePrefs(bundle);
    localStorage.setItem(storageKey, JSON.stringify({
      theme: clean.theme,
      fontScale: clean.fontScale,
      prefs: clean.prefs,
    }));
  } catch {
    /* Preferências continuam em memória. */
  }
}

function applyPrefsBundleToState(bundle) {
  const clean = sanitizeSyncablePrefs(bundle);
  state.theme = clean.theme;
  state.fontScale = clean.fontScale;
  state.prefs = { ...clean.prefs, blockConflicts: true };
  if (typeof ui !== "undefined") {
    ui.step1Layout = state.prefs.defaultLayout;
  }
}

function renderPrefsSyncStatus() {
  const el = document.getElementById("settings-sync-status");
  if (!el) return;
  const st = prefsSyncState.status;
  el.dataset.syncState = st;
  if (st === "syncing") el.textContent = "Sincronizando…";
  else if (st === "account") el.textContent = "Salvo na conta";
  else el.textContent = "Salvo neste dispositivo";
}

function setPrefsSyncStatus(status, source = prefsSyncState.source, updatedAt = prefsSyncState.updatedAt) {
  prefsSyncState = { status, source, updatedAt };
  renderPrefsSyncStatus();
}

function cancelPendingPrefsSave() {
  if (pendingPrefsTimer) {
    clearTimeout(pendingPrefsTimer);
    pendingPrefsTimer = null;
  }
  pendingPrefsRequestSeq += 1;
}

function loadState() {
  let stored = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("monitoraplus_v6_state");
    if (raw) stored = sanitizeSyncablePrefs(JSON.parse(raw));
    localStorage.removeItem("monitoraplus_v6_state"); // apaga senhas e contas do protótipo
  } catch { /* Preferências indisponíveis não impedem o uso da API. */ }
  const clean = stored || sanitizeSyncablePrefs({ theme: "light", fontScale: 1, prefs: DEFAULT_PREFS });
  return {
    users: [],
    slots: [],
    historySlots: [],
    bookings: [],
    currentUserId: null,
    theme: clean.theme,
    fontScale: clean.fontScale,
    prefs: { ...clean.prefs, blockConflicts: true },
  };
}

function getPrefs() {
  if (!state.prefs) state.prefs = { ...DEFAULT_PREFS, blockConflicts: true };
  return state.prefs;
}

function scheduleRemotePrefsSave() {
  const userId = state.currentUserId;
  if (!userId) {
    setPrefsSyncStatus("device", "device", null);
    return;
  }
  const sessionVer = remoteSessionVersion;
  cancelPendingPrefsSave();
  const seq = pendingPrefsRequestSeq;
  setPrefsSyncStatus("syncing", prefsSyncState.source, prefsSyncState.updatedAt);

  pendingPrefsTimer = setTimeout(async () => {
    pendingPrefsTimer = null;
    if (sessionVer !== remoteSessionVersion || state.currentUserId !== userId || seq !== pendingPrefsRequestSeq) {
      return;
    }
    const payload = buildSyncablePrefsPayload(state);
    try {
      const res = await apiClient.request("/prefs", {
        method: "PUT",
        body: { preferences: payload },
      });
      if (sessionVer !== remoteSessionVersion || state.currentUserId !== userId || seq !== pendingPrefsRequestSeq) {
        return;
      }
      setPrefsSyncStatus("account", "account", res?.updated_at || null);
    } catch {
      if (sessionVer !== remoteSessionVersion || state.currentUserId !== userId || seq !== pendingPrefsRequestSeq) {
        return;
      }
      setPrefsSyncStatus("device", "device", prefsSyncState.updatedAt);
    }
  }, PREFS_SYNC_DEBOUNCE_MS);
}

function saveState(options = {}) {
  const shouldSyncRemote = options.syncRemote !== false;
  const userId = state.currentUserId;
  const targetKey = userId ? getUserPrefsStorageKey(userId) : STORAGE_KEY;
  writeStoredPrefsBundle(targetKey, state);

  if (userId && shouldSyncRemote) {
    scheduleRemotePrefsSave();
  } else if (!userId) {
    setPrefsSyncStatus("device", "device", null);
  }
  if (typeof ui !== "undefined" && ui.activeView === "inicio") renderInicio();
}

async function syncPrefsWithServer(user, sessionVer, allowGuestSeed = true) {
  if (!user) return;
  cancelPendingPrefsSave();
  const userKey = getUserPrefsStorageKey(user.id);
  const cachedUserBundle = readStoredPrefsBundle(userKey);
  const guestBundle = readStoredPrefsBundle(STORAGE_KEY);

  // Carrega imediatamente apenas o cache isolado desta conta (nunca o de outra conta)
  applyPrefsBundleToState(cachedUserBundle || { theme: "light", fontScale: 1, prefs: DEFAULT_PREFS });
  applyThemeAndA11y();
  setPrefsSyncStatus("syncing", "device", null);

  try {
    const res = await apiClient.request("/prefs");
    if (sessionVer !== remoteSessionVersion || state.currentUserId !== user.id) return;

    const remotePrefs = res?.preferences ?? null;
    const remoteUpdatedAt = res?.updated_at ?? null;

    if (remotePrefs !== null) {
      // Servidor tem preferências gravadas -> servidor vence sempre
      applyPrefsBundleToState(remotePrefs);
      writeStoredPrefsBundle(userKey, state);
      applyThemeAndA11y();
      if (ui.activeView === "agendar" && ui.step === 1) renderStep1();
      setPrefsSyncStatus("account", "account", remoteUpdatedAt);
      return;
    }

    if (remoteUpdatedAt !== null) {
      // Reset explícito registrado no servidor -> aplica defaults e sobrescreve cache antigo deste aparelho
      applyPrefsBundleToState({ theme: "light", fontScale: 1, prefs: DEFAULT_PREFS });
      writeStoredPrefsBundle(userKey, state);
      applyThemeAndA11y();
      if (ui.activeView === "agendar" && ui.step === 1) renderStep1();
      setPrefsSyncStatus("account", "account", remoteUpdatedAt);
      return;
    }

    // Conta virgem (preferences === null && updated_at === null): só importa prefs de visitante se personalizadas
    if (allowGuestSeed && guestBundle && hasCustomPrefsBeyondDefaults(guestBundle)) {
      applyPrefsBundleToState(guestBundle);
      writeStoredPrefsBundle(userKey, state);
      applyThemeAndA11y();
      try {
        const seeded = await apiClient.request("/prefs", {
          method: "PUT",
          body: { preferences: buildSyncablePrefsPayload(guestBundle) },
        });
        if (sessionVer !== remoteSessionVersion || state.currentUserId !== user.id) return;
        setPrefsSyncStatus("account", "account", seeded?.updated_at || null);
      } catch {
        if (sessionVer !== remoteSessionVersion || state.currentUserId !== user.id) return;
        setPrefsSyncStatus("device", "device", null);
      }
      return;
    }

    applyPrefsBundleToState({ theme: "light", fontScale: 1, prefs: DEFAULT_PREFS });
    writeStoredPrefsBundle(userKey, state);
    applyThemeAndA11y();
    setPrefsSyncStatus("account", "account", null);
  } catch {
    if (sessionVer !== remoteSessionVersion || state.currentUserId !== user.id) return;
    // Offline ou VPS ainda sem /api/prefs -> degrada graciosamente para dispositivo
    setPrefsSyncStatus("device", "device", null);
  }
}

// ==================== API E ESTADO REMOTO ====================
const isLocalHost = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
const apiClient = MonitoraAPI.createClient({
  baseUrl: isLocalHost ? "http://localhost:8000/api"
    : location.hostname.endsWith(".trycloudflare.com") ? "/api" : window.MONITORA_API_URL,
  onUnauthorized: () => {
    if (!state.currentUserId) return;
    clearRemoteSession();
    renderTopbar();
    closeSettingsModal();
    switchView("landing");
    showToast("Sua sessão terminou. Entre novamente para continuar.", null, "error");
  },
});
const pendingApiActions = new Set();
let remoteSessionVersion = 0;
let refreshInFlight = null;
let lastRemoteRefresh = 0;
let authProviders = { google: { enabled: false, clientId: null }, gennera: { enabled: false } };
let googleGisInitializedClientId = null;
let pendingGoogleOnboarding = null;
let googleOnboardingRole = "student";
let ssoModalLastTrigger = null;

function mapUser(user) {
  return {
    id: String(user.id),
    role: user.role,
    name: user.name,
    ra: user.ra,
    email: user.email,
    course: user.course,
    offeringId: user.offering_id,
    avatarUrl: user.avatar_url || null,
    hasGoogle: Boolean(user.has_google),
  };
}

function getUserInitials(name, fallback = "M+") {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function renderAvatarContent(el, avatarUrl, initials) {
  if (!el) return;
  if (avatarUrl) {
    el.innerHTML = `<img src="${escapeHtml(avatarUrl)}" alt="" class="avatar-photo-img" referrerpolicy="no-referrer" />`;
    const img = el.querySelector("img");
    if (img) {
      img.addEventListener("error", () => {
        el.textContent = initials;
      }, { once: true });
    }
  } else {
    el.textContent = initials;
  }
}

const MONITOR_FALLBACK_LABEL = "Monitor ainda não informado";

function isMissingMonitorName(raw) {
  const clean = String(raw || "").trim();
  if (!clean) return true;
  const norm = clean
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return (
    norm === "monitor a definir" ||
    norm === "a definir" ||
    norm === "monitor ainda nao informado" ||
    norm === "nao informado"
  );
}

function formatCleanMonitorName(monitorStr) {
  if (isMissingMonitorName(monitorStr)) return MONITOR_FALLBACK_LABEL;
  const cleaned = String(monitorStr || "")
    .replace(/^Monitora?\s+/i, "")
    .trim();
  return cleaned || MONITOR_FALLBACK_LABEL;
}

function mapOffering(offering) {
  return { id: offering.id, subject: offering.subject, shortSubject: offering.short_subject,
    title: offering.title, mode: offering.mode, location: offering.location,
    shortLocation: offering.short_location,
    monitor: offering.monitors?.length ? offering.monitors.join(", ") : MONITOR_FALLBACK_LABEL,
    duration: `${offering.duration_minutes || 40} minutos` };
}

function mapSlot(slot, offeringId = slot.offering_id) {
  return { id: String(slot.id), offeringId, dateIso: slot.date, dayName: slot.day_name,
    time: slot.time, capacity: slot.capacity, occupied: slot.occupied || 0 };
}

function getSlot(slotId) {
  return state.slots.find((slot) => slot.id === slotId)
    || state.historySlots.find((slot) => slot.id === slotId);
}

function applyRemoteBooking(item) {
  const current = getCurrentUser();
  const studentId = String(item.student?.id || current.id);
  if (item.student && !state.users.some((user) => user.id === studentId)) {
    state.users.push({ id: studentId, role: "student", name: item.student.name, ra: item.student.ra });
  }
  const slot = mapSlot(item.slot, item.offering.id);
  state.historySlots = state.historySlots.filter((old) => old.id !== slot.id);
  state.historySlots.push(slot);
  const booking = { id: String(item.id), protocol: item.protocol, status: item.status,
    topic: item.topic, studentId, slotId: slot.id,
    createdAt: new Date(item.created_at).toLocaleString("pt-BR") };
  state.bookings = state.bookings.filter((old) => old.id !== booking.id);
  state.bookings.push(booking);
  return booking;
}

function renderCurrentData() {
  renderTopbar();
  if (ui.activeView === "inicio") renderInicio();
  if (ui.activeView === "agendar") renderAgendar();
  if (ui.activeView === "agendamentos") renderBookings();
  if (ui.activeView === "monitor") renderMonitorPanel();
}

function setApiStatus(message = "", loading = false) {
  const box = document.getElementById("api-status");
  document.getElementById("api-status-text").textContent = message;
  box.classList.toggle("is-hidden", !message);
  box.setAttribute("aria-busy", String(loading));
  const retry = document.getElementById("btn-api-retry");
  retry.disabled = loading;
  retry.textContent = loading ? "Carregando…" : "Atualizar dados";
}

function clearRemoteSession() {
  cancelPendingPrefsSave();
  remoteSessionVersion += 1;
  refreshInFlight = null;
  state.users = [];
  state.slots = [];
  state.historySlots = [];
  state.bookings = [];
  state.currentUserId = null;
  apiClient.clearSession();
  // Restaura preferências de visitante (deslogado) para que a próxima conta nunca herde prefs da conta anterior
  const guestBundle = readStoredPrefsBundle(STORAGE_KEY) || { theme: "light", fontScale: 1, prefs: DEFAULT_PREFS };
  applyPrefsBundleToState(guestBundle);
  setPrefsSyncStatus("device", "device", null);
  applyThemeAndA11y();
  ui.selectedSlotId = null;
  ui.lastCreatedBookingId = null;
  ui.reschedulingBookingId = null;
  ui.step3Completed = false;
  document.getElementById("form-login").reset();
  document.getElementById("form-register").reset();
  document.getElementById("form-new-slot").reset();
  document.getElementById("s3-topic").value = "";
  hideOtpStage();
  hideGoogleOnboardingStage();
  hideQuickAuthStage();
  closeSsoProviderModal(false);
  setAuthTab("login");
}

async function refreshRemoteData() {
  if (refreshInFlight) return refreshInFlight;
  const version = remoteSessionVersion;
  let user = getCurrentUser();
  const promise = (async () => {
    if (user) {
      const session = await apiClient.request("/auth/me");
      if (version !== remoteSessionVersion) return;
      user = mapUser(session.user);
    }
    const requests = [apiClient.request("/offerings")];
    if (user) {
      if (state.currentUserId !== user.id) {
        ui.reschedulingBookingId = null;
        ui.selectedSlotId = null;
        ui.step3Completed = false;
        ui.step = 1;
      }
      state.currentUserId = user.id;
      requests.push(apiClient.request("/slots"), apiClient.request("/schedules"));
      if (user.role === "monitor") requests.push(apiClient.request("/schedules/monitor?scope=all"));
    }
    const [catalog, slots, own, monitor] = await Promise.all(requests);
    if (version !== remoteSessionVersion) return;
    OFFERINGS.splice(0, OFFERINGS.length, ...catalog.offerings.map(mapOffering));
    const optionsHtml = OFFERINGS.map((off) => `<option value="${escapeHtml(off.id)}">${escapeHtml(off.subject)}</option>`).join("");
    ["reg-subject", "google-reg-subject"].forEach((selectId) => {
      const subjectSelect = document.getElementById(selectId);
      if (!subjectSelect) return;
      const selected = subjectSelect.value;
      subjectSelect.innerHTML = optionsHtml;
      if (OFFERINGS.some((off) => off.id === selected)) subjectSelect.value = selected;
      syncCustomSelect(subjectSelect);
    });
    if (user) {
      state.users = [user];
      state.slots = slots.slots.map((slot) => mapSlot(slot));
      state.bookings = [];
      state.historySlots = [];
      own.schedules.forEach(applyRemoteBooking);
      monitor?.schedules.forEach(applyRemoteBooking);
    }
    lastRemoteRefresh = Date.now();
    setApiStatus();
  })();
  refreshInFlight = promise;
  try {
    await promise;
  } finally {
    if (refreshInFlight === promise) refreshInFlight = null;
  }
}

async function refreshSafely() {
  try {
    await refreshRemoteData();
    return true;
  } catch (error) {
    if (error.status !== 401) setApiStatus(error.message);
    return false;
  }
}

function showApiError(error, form = null) {
  if (form?.id === "auth-stage-otp" && Object.keys(error.fields || {}).some((key) => key !== "professor_code")) {
    hideOtpStage();
    form = document.getElementById("form-register");
  }
  const isGoogleOnboard = form?.id === "auth-stage-google-onboarding";
  const fieldMap = {
    identifier: "login-identifier",
    password: form?.id === "form-login" ? "login-password" : "reg-password",
    name: isGoogleOnboard ? "google-reg-name" : "reg-name",
    ra: isGoogleOnboard ? "google-reg-ra" : "reg-ra",
    email: "reg-email",
    course: isGoogleOnboard ? "google-reg-course" : "reg-course",
    offering_id: isGoogleOnboard ? "google-reg-subject" : "reg-subject",
    professor_code: isGoogleOnboard ? "google-reg-code" : form?.id === "auth-stage-otp" ? "otp-code" : "ms-prof-code",
    date: "ms-date",
    time: "ms-time",
    capacity: "ms-capacity",
    topic: "s3-topic",
  };
  const fields = Object.entries(error.fields || {}).map(([key, message]) => ({ el: document.getElementById(fieldMap[key]), message }))
    .filter((field) => field.el && form?.contains(field.el));
  if (fields.length) applyFieldErrors(form, fields);
  if (form?.id === "auth-stage-otp") {
    document.getElementById("otp-error").textContent = error.message;
    document.getElementById("otp-error").classList.remove("is-hidden");
  }
  showToast(error.message, null, "error");
  if (!error.status) setApiStatus(error.message);
}

async function runApiAction(key, action, form = null) {
  if (pendingApiActions.size) return;
  pendingApiActions.add(key);
  const buttons = Array.from(form?.querySelectorAll('button[type="submit"]') || []);
  const previous = buttons.map((button) => ({ disabled: button.disabled, html: button.innerHTML }));
  form?.setAttribute("aria-busy", "true");
  buttons.forEach((button) => { button.disabled = true; button.textContent = "Aguarde…"; });
  try {
    const actingUserId = state.currentUserId;
    if (refreshInFlight) await refreshInFlight;
    if (actingUserId !== state.currentUserId) {
      throw new MonitoraAPI.ApiError("Sua sessão mudou. Confira a conta ativa antes de continuar.", 409);
    }
    return await action();
  } catch (error) {
    showApiError(error, form);
  } finally {
    pendingApiActions.delete(key);
    form?.removeAttribute("aria-busy");
    buttons.forEach((button, index) => { button.disabled = previous[index].disabled; button.innerHTML = previous[index].html; });
  }
}

async function acceptRemoteSession(response, registered = false) {
  let verified;
  try {
    verified = await apiClient.request("/auth/me");
  } catch (error) {
    if (error.status === 401) throw new MonitoraAPI.ApiError(registered
      ? "Conta criada, mas o navegador bloqueou a sessão. Permita cookies deste site e entre com sua matrícula e senha."
      : "O navegador não manteve sua sessão. Permita cookies deste site e tente entrar novamente.", 403);
    throw error;
  }
  cancelPendingPrefsSave();
  remoteSessionVersion += 1;
  const sessionVer = remoteSessionVersion;
  refreshInFlight = null;
  const user = mapUser(verified.user || response.user);
  state.users = [user];
  state.currentUserId = user.id;
  state.slots = [];
  state.historySlots = [];
  state.bookings = [];
  await Promise.all([refreshSafely(), syncPrefsWithServer(user, sessionVer, true)]);
  if (sessionVer !== remoteSessionVersion) return user;
  ui.step = 1;
  renderTopbar();
  switchView("inicio");
  return user;
}

async function changeRemoteBookingStatus(booking, status, message, undoStatus) {
  return runApiAction(`booking:${booking.id}`, async () => {
    const result = await apiClient.request(`/schedules/${booking.id}/status`, { method: "PATCH", body: { status } });
    applyRemoteBooking(result.schedule);
    await refreshSafely();
    ui.highlightedBookingId = booking.id;
    renderCurrentData();
    showToast(message, undoStatus ? () => changeRemoteBookingStatus(booking, undoStatus,
      `Alteração desfeita (${booking.protocol}).`) : null, "success");
  });
}

async function loadAuthProviders() {
  try {
    const data = await apiClient.request("/auth/providers");
    authProviders = {
      google: {
        enabled: Boolean(data?.google?.enabled && data?.google?.client_id),
        clientId: data?.google?.client_id || null,
      },
      gennera: {
        enabled: Boolean(data?.gennera?.enabled),
      },
    };
    initGoogleIdentity();
  } catch {
    // Mantém estado padrão seguro caso o backend ainda não exponha /auth/providers
  }
}

async function bootstrapRemote() {
  setApiStatus("Conectando ao Monitora+…", true);
  await loadAuthProviders();
  try {
    const result = await apiClient.request("/auth/me");
    const user = mapUser(result.user);
    state.users = [user];
    state.currentUserId = user.id;
  } catch (error) {
    if (error.status !== 401) {
      setApiStatus(error.message);
      return;
    }
  }
  await refreshSafely();
  const activeUser = getCurrentUser();
  if (activeUser) {
    await syncPrefsWithServer(activeUser, remoteSessionVersion, false);
  } else {
    setPrefsSyncStatus("device", "device", null);
  }
  renderTopbar();
  if (getCurrentUser()) {
    showQuickAuthStage(getCurrentUser());
  }
}


let lastInputWasKeyboard = false;
document.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Tab" || e.key === "Enter" || e.key === " " || e.key.startsWith("Arrow")) {
      lastInputWasKeyboard = true;
    }
  },
  true
);
document.addEventListener(
  "pointerdown",
  () => {
    lastInputWasKeyboard = false;
  },
  true
);

function runWithViewTransition(fn) {
  if (typeof document.startViewTransition === "function" && !prefersReducedMotion()) {
    try {
      document.startViewTransition(() => fn());
      return;
    } catch {
      // Fallback síncrono se houver transição concorrente
    }
  }
  fn();
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
  if (isMissingMonitorName(monitorName)) return "M";
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
  const error = document.getElementById("otp-error");
  error.classList.add("is-hidden");
  error.textContent = "";
  clearFieldError(document.getElementById("otp-code"));
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
  return slot.occupied || 0;
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
    const other = getSlot(b.slotId);
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

  // Dispara transição apenas na mudança de nível de contraste, nunca durante arraste no mesmo nível
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
  const themeColorMeta = document.getElementById("meta-theme-color");
  if (themeColorMeta) themeColorMeta.setAttribute("content", activeBg);

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
  const themeColorMeta = document.getElementById("meta-theme-color");
  if (themeColorMeta) {
    const themeColorHex = theme === "light" ? "#f6f6f4" : theme === "contrast" ? "#000000" : "#09090b";
    themeColorMeta.setAttribute("content", themeColorHex);
  }
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
  const isMobileInAppSettings =
    window.innerWidth <= 768 && !document.body.classList.contains("is-landing-mode");
  const modalIds = isMobileInAppSettings
    ? ["confirm-modal", "faq-modal"]
    : ["settings-modal", "confirm-modal", "faq-modal"];
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
  const monitorSlotForm = document.getElementById("form-new-slot");
  const monitorSheetOpen = Boolean(
    monitorSlotForm &&
      monitorSlotForm.classList.contains("is-mobile-sheet-open") &&
      window.innerWidth <= 768
  );
  const filtersSheet = document.getElementById("step1-filters-sheet");
  const filtersSheetOpen = Boolean(
    filtersSheet && !filtersSheet.classList.contains("is-hidden") && window.innerWidth <= 768
  );
  return anyModalOpen || mobileSheetOpen || monitorSheetOpen || filtersSheetOpen;
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
  let key = SETTINGS_TAB_META[tabKey] ? tabKey : "geral";
  if (window.innerWidth <= 768 && key === "atalhos") {
    key = "geral";
  }
  ui.activeSettingsTab = key;
  const meta = SETTINGS_TAB_META[key];

  document.getElementById("settings-panel-title").textContent = meta.title;
  document.getElementById("settings-panel-desc").textContent = meta.desc;

  document.querySelectorAll("[data-settings-tab]").forEach((btn) => {
    const active = btn.dataset.settingsTab === key;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
    btn.setAttribute("tabindex", active ? "0" : "-1");
    if (active && shouldFocus) {
      btn.focus();
    }
  });

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
    const initials = getUserInitials(user.name);
    renderAvatarContent(avatar, user.avatarUrl, initials);
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
    detailEl.textContent = "Faça login para gerenciar ou excluir sua conta.";
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
  renderPrefsSyncStatus();
  setSettingsTab(initialTab || ui.activeSettingsTab || "geral");
  applyThemeAndA11y();
  const win = document.querySelector(".settings-window");
  if (win) win.classList.toggle("is-mobile-detail", Boolean(mobileDetail));
  document.getElementById("settings-modal")?.classList.remove("is-hidden");
  syncBodyScrollLock();
  const sidebar = document.querySelector(".settings-sidebar");
  if (sidebar && !mobileDetail) sidebar.scrollTop = 0;
  const body = document.querySelector(".settings-body");
  if (body) body.scrollTop = 0;
  syncMobileChrome();
  if (window.innerWidth > 768 || mobileDetail) {
    const activeTabBtn = document.querySelector(`[data-settings-tab="${ui.activeSettingsTab}"]`);
    activeTabBtn?.focus();
  }
}

function closeSettingsModal() {
  closeAllCustomSelects();
  const modal = document.getElementById("settings-modal");
  const wasOpen = modal && !modal.classList.contains("is-hidden");
  document.querySelector(".settings-window")?.classList.remove("is-mobile-detail");
  modal?.classList.add("is-hidden");
  syncBodyScrollLock();
  syncMobileChrome();
  if (wasOpen && lastInputWasKeyboard && lastSettingsTriggerEl && document.contains(lastSettingsTriggerEl)) {
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

  if (window.innerWidth <= 768) {
    const hasSticky = document.body.classList.contains("has-mobile-sticky-cta");
    const blockingOpen = hasAnyBlockingOverlayOpen();
    accessEl.style.zIndex = blockingOpen ? "30" : "48";
    accessEl.style.top = "auto";
    accessEl.style.right = "10px";
    accessEl.style.bottom = hasSticky
      ? "calc(78px + env(safe-area-inset-bottom))"
      : "calc(76px + env(safe-area-inset-bottom))";
    accessEl.style.pointerEvents = blockingOpen ? "none" : "auto";
    accessEl.style.opacity = blockingOpen ? "0" : "1";
  } else {
    accessEl.style.zIndex = "120";
    accessEl.style.top = "auto";
    accessEl.style.right = "20px";
    accessEl.style.bottom = "24px";
    accessEl.style.pointerEvents = "auto";
    accessEl.style.opacity = "1";
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

// ==================== AJUDA RÁPIDA / FAQ & FOCUS TRAP ====================
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
  if (wasOpen && lastInputWasKeyboard && lastFaqTriggerEl && document.contains(lastFaqTriggerEl)) {
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
    summary = `Tela inicial do Monitora+. ${h}. Você pode entrar com matrícula ou e-mail, criar conta ou abrir configurações de acessibilidade.`;
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
  const fromAccount = Boolean(user && prefsSyncState.source === "account");
  const payload = {
    exportedAt: new Date().toISOString(),
    system: "Monitora+ UNIFSA",
    user: user ? { name: user.name, ra: user.ra, email: user.email, role: user.role } : null,
    preferencesSource: fromAccount ? "account" : "device",
    preferencesSourceLabel: fromAccount
      ? "Conta (sincronizado no servidor)"
      : "Dispositivo (salvo apenas neste navegador)",
    preferencesUpdatedAt: fromAccount ? prefsSyncState.updatedAt : null,
    preferences: buildSyncablePrefsPayload(state),
    bookings: mine.map((bk) => {
      const slot = getSlot(bk.slotId);
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
  showToast("Cópia dos seus dados baixada.", null, "success");
}

async function resetPrefsToDefault() {
  cancelPendingPrefsSave();
  applyPrefsBundleToState({ theme: "light", fontScale: 1, prefs: DEFAULT_PREFS });
  saveState({ syncRemote: false });
  applyThemeAndA11y();
  if (ui.activeView === "agendar" && ui.step === 1) renderStep1();
  announceA11y("Preferências restauradas para o padrão.");

  const userId = state.currentUserId;
  const sessionVer = remoteSessionVersion;
  if (userId) {
    setPrefsSyncStatus("syncing", prefsSyncState.source, prefsSyncState.updatedAt);
    try {
      const res = await apiClient.request("/prefs", { method: "DELETE" });
      if (sessionVer !== remoteSessionVersion || state.currentUserId !== userId) return;
      setPrefsSyncStatus("account", "account", res?.updated_at || null);
      showToast("Preferências restauradas na sua conta.");
      return;
    } catch {
      if (sessionVer !== remoteSessionVersion || state.currentUserId !== userId) return;
      setPrefsSyncStatus("device", "device", prefsSyncState.updatedAt);
      showToast("Preferências restauradas neste dispositivo.");
      return;
    }
  }
  showToast("Preferências de aparência e acessibilidade restauradas.");
}

function confirmDeleteAccount() {
  const user = getCurrentUser();
  if (!user) return;

  openConfirmDialog({
    title: "Excluir conta e dados?",
    desc: "Sua conta e seus agendamentos serão removidos permanentemente do servidor.",
    summaryHtml: buildConfirmSummaryCard({
      title: user.name,
      rows: [
        { label: "Matrícula", value: user.ra },
        { label: "E-mail", value: user.email },
      ],
    }),
    confirmText: "Excluir permanentemente",
    danger: true,
    onConfirm: () => runApiAction("delete-account", async () => {
      await apiClient.request("/auth/me", { method: "DELETE" });
      clearRemoteSession();
      closeSettingsModal();
      renderTopbar();
      switchView("landing");
      showToast("Conta e agendamentos removidos do servidor.", null, "success");
    }),
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

  if (wasOpen && restoreFocus && lastInputWasKeyboard && btn && document.contains(btn)) {
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
    const initialsUpper = getUserInitials(user.name);
    label.textContent = firstName;
    const topbarAvatarWrap = document.getElementById("topbar-user-avatar");
    const topbarInitials = document.getElementById("topbar-user-initials");
    if (topbarInitials) topbarInitials.textContent = initialsUpper;
    if (topbarAvatarWrap) {
      topbarAvatarWrap.querySelector(".avatar-photo-img")?.remove();
      if (user.avatarUrl) {
        topbarAvatarWrap.classList.add("has-photo");
        const img = document.createElement("img");
        img.src = user.avatarUrl;
        img.alt = "";
        img.className = "avatar-photo-img";
        img.referrerPolicy = "no-referrer";
        img.addEventListener("error", () => {
          img.remove();
          topbarAvatarWrap.classList.remove("has-photo");
        }, { once: true });
        topbarAvatarWrap.appendChild(img);
      } else {
        topbarAvatarWrap.classList.remove("has-photo");
      }
    }
    renderAvatarContent(ddAvatar, user.avatarUrl, initialsUpper);
    if (ddName) ddName.textContent = user.name;
    if (ddRoleBadge) ddRoleBadge.textContent = isMonitor ? "Monitor" : "Estudante";
    if (ddSub) ddSub.textContent = user.email;
  } else {
    label.textContent = "Entrar";
    const topbarAvatarWrap = document.getElementById("topbar-user-avatar");
    if (topbarAvatarWrap) {
      topbarAvatarWrap.querySelector(".avatar-photo-img")?.remove();
      topbarAvatarWrap.classList.remove("has-photo");
    }
    const topbarInitials = document.getElementById("topbar-user-initials");
    if (topbarInitials) topbarInitials.textContent = "M+";
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
  if (ui.activeView === "inicio") renderInicio();
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
  document.body.classList.toggle("is-mobile-settings-open", settingsOpen && window.innerWidth <= 768);

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
    if (settingsOpen) {
      settingsTabBtn.setAttribute("aria-current", "page");
    } else {
      settingsTabBtn.removeAttribute("aria-current");
    }
  }

  const step3Form = document.getElementById("step3-form-shell");
  const step3FormVisible = Boolean(step3Form && !step3Form.classList.contains("is-hidden"));
  const isCheckoutFocus =
    !settingsOpen && ui.activeView === "agendar" && (ui.step === 2 || (ui.step === 3 && step3FormVisible));
  const hasStickyBottomCta = isCheckoutFocus;
  document.body.classList.toggle("has-mobile-sticky-cta", isCheckoutFocus);
  document.body.classList.toggle("has-mobile-bottom-cta", hasStickyBottomCta);
  if (getPrefs().vlibras) positionVlibrasShadowAccess();
}

// ==================== TELA INÍCIO (PÓS-LOGIN DESKTOP-FIRST) ====================
const PT_WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const PT_MONTHS_LONG = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const PT_MONTHS_SHORT = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function formatInicioTodayLabel() {
  const now = new Date();
  const wk = FULL_WEEKDAYS[now.getDay()] || "Quarta";
  const day = now.getDate();
  const month = PT_MONTHS_LONG[now.getMonth()] || "novembro";
  return `${wk}, ${day} de ${month}`;
}

function formatInicioGreeting(user) {
  const hour = new Date().getHours();
  const salute = hour >= 5 && hour < 12 ? "Bom dia" : hour >= 12 && hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : "";
  return firstName ? `${salute}, ${firstName}` : salute;
}

function getSlotStartDate(dateIso, timeStr) {
  const p = parseIsoDateParts(dateIso);
  if (!p) return null;
  const startPart = String(timeStr || "").split(" - ")[0].trim();
  const [hh, mm] = startPart.split(":").map(Number);
  return new Date(p.year, p.month, p.day, Number.isFinite(hh) ? hh : 14, Number.isFinite(mm) ? mm : 0, 0, 0);
}

function isSlotUpcoming(slot, nowMs = Date.now()) {
  if (!slot) return false;
  const start = getSlotStartDate(slot.dateIso, slot.time);
  if (!start) return false;
  return start.getTime() >= nowMs - 40 * 60000;
}

function getOfferingNextUpcomingSlot(offeringId, nowMs = Date.now()) {
  return (
    state.slots
      .filter((s) => s.offeringId === offeringId && isSlotUpcoming(s, nowMs) && getSlotRemaining(s) > 0)
      .slice()
      .sort((a, b) => {
        const ta = getSlotStartDate(a.dateIso, a.time)?.getTime() || 0;
        const tb = getSlotStartDate(b.dateIso, b.time)?.getTime() || 0;
        return ta - tb;
      })[0] || null
  );
}

function getOfferingUpcomingRemainingTotal(offeringId, nowMs = Date.now()) {
  return state.slots
    .filter((s) => s.offeringId === offeringId && isSlotUpcoming(s, nowMs))
    .reduce((acc, s) => acc + getSlotRemaining(s), 0);
}

function getMonitorDisciplineStats(offeringId, nowMs = Date.now()) {
  const allSlots = state.slots
    .filter((s) => s.offeringId === offeringId)
    .map((slot) => {
      const startDate = getSlotStartDate(slot.dateIso, slot.time);
      const startMs = startDate ? startDate.getTime() : 0;
      const occupied = Math.min(slot.capacity, getSlotOccupied(slot));
      return { slot, occupied, startMs, isUpcoming: startMs >= nowMs - 40 * 60000 };
    })
    .sort((a, b) => a.startMs - b.startMs);

  const upcomingSlots = allSlots.filter((item) => item.isUpcoming);
  const totalOccupied = upcomingSlots.reduce((sum, item) => sum + item.occupied, 0);
  const totalCapacity = upcomingSlots.reduce((sum, item) => sum + item.slot.capacity, 0);
  return {
    allSlots,
    upcomingSlots,
    publishedCount: upcomingSlots.length,
    totalOccupied,
    totalCapacity,
  };
}

function formatRelativeCountdown(slot) {
  const start = getSlotStartDate(slot.dateIso, slot.time);
  const startTime = (slot.time || "").split(" - ")[0] || slot.time;
  if (!start) return `${slot.dayName} às ${startTime}`;

  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins >= -40 && diffMins <= 0) {
    return "Em andamento agora";
  }

  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const slotMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const diffDays = Math.round((slotMidnight - todayMidnight) / 86400000);

  if (diffMins > 0 && diffDays === 0) {
    if (diffMins < 60) return `Começa em ${diffMins}min`;
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return m > 0 ? `Começa em ${h}h ${m}min` : `Começa em ${h}h`;
  }
  if (diffDays === 1) {
    return `Amanhã às ${startTime}`;
  }
  if (diffDays > 1 && diffDays <= 7) {
    const shortM = PT_MONTHS_SHORT[start.getMonth()] || "";
    return `${slot.dayName}, ${start.getDate()} ${shortM} · ${startTime}`;
  }
  const shortM = PT_MONTHS_SHORT[start.getMonth()] || "";
  return `${slot.dayName}, ${start.getDate()} ${shortM} · ${startTime}`;
}

function formatTimelineWhen(slot) {
  const p = parseIsoDateParts(slot.dateIso);
  const startTime = (slot.time || "").split(" - ")[0] || slot.time;
  if (!p) return `${slot.dayName.slice(0, 3)} · ${startTime}`;
  const d = new Date(p.year, p.month, p.day);
  const wk = PT_WEEKDAYS_SHORT[d.getDay()] || slot.dayName.slice(0, 3);
  const mon = PT_MONTHS_SHORT[p.month] || "";
  return `${wk}, ${p.day} ${mon} · ${startTime}`;
}

function getShortMonitorName(fullName) {
  return formatCleanMonitorName(fullName);
}

function openOfferingStep2FromInicio(offeringId) {
  const off = getOffering(offeringId);
  if (!off) return;
  closeInicioSearchPopover();
  const input = document.getElementById("inicio-search-input");
  if (input) input.value = "";
  ui.selectedOfferingId = off.id;
  ui.selectedDateIso = null;
  ui.selectedSlotId = null;
  ui.step = 2;
  switchView("agendar", true);
}

let inicioSearchFocusedIdx = -1;

function closeInicioSearchPopover() {
  const pop = document.getElementById("inicio-search-popover");
  const input = document.getElementById("inicio-search-input");
  if (pop) pop.classList.add("is-hidden");
  if (input) input.setAttribute("aria-expanded", "false");
  inicioSearchFocusedIdx = -1;
}

function renderInicioSearchPopover(rawQuery) {
  const pop = document.getElementById("inicio-search-popover");
  const input = document.getElementById("inicio-search-input");
  if (!pop || !input) return;

  const q = normalizeText(rawQuery);
  if (!q) {
    closeInicioSearchPopover();
    return;
  }

  const matches = OFFERINGS.filter((off) => {
    const hay = normalizeText(
      `${off.subject} ${off.shortSubject} ${off.title} ${off.monitor} ${off.location} ${off.shortLocation} ${off.mode}`
    );
    return hay.includes(q);
  });

  inicioSearchFocusedIdx = matches.length > 0 ? 0 : -1;

  if (matches.length === 0) {
    pop.innerHTML = `
      <div class="inicio-search-empty">
        <span>Nenhuma monitoria encontrada para "${escapeHtml(rawQuery.trim())}".</span>
        <button type="button" class="inicio-quick-catalog" data-inicio-open-catalog="true">Ver catálogo →</button>
      </div>
    `;
  } else {
    const nowMs = Date.now();
    pop.innerHTML = matches
      .map((off, idx) => {
        const free = getOfferingUpcomingRemainingTotal(off.id, nowMs);
        const nextSlot = getOfferingNextUpcomingSlot(off.id, nowMs);
        const nextLbl = nextSlot ? `Próx.: ${formatTimelineWhen(nextSlot)}` : "Sem horários futuros";
        const vacTxt = free > 0 ? formatVagas(free, false) : "Lotado";
        return `
          <button
            type="button"
            class="inicio-search-option${idx === 0 ? " is-focused" : ""}"
            role="option"
            aria-selected="${idx === 0}"
            data-inicio-pick-offering="${escapeHtml(off.id)}"
          >
            <span class="inicio-search-opt-main">
              <span class="inicio-search-opt-title">${escapeHtml(off.subject)}</span>
              <span class="inicio-search-opt-sub">${escapeHtml(getShortMonitorName(off.monitor))} · ${escapeHtml(off.shortLocation || off.location)}</span>
            </span>
            <span class="inicio-search-opt-meta">${escapeHtml(nextLbl)} · ${escapeHtml(vacTxt)}</span>
          </button>
        `;
      })
      .join("");
  }

  pop.classList.remove("is-hidden");
  input.setAttribute("aria-expanded", "true");
}

function renderInicio() {
  const user = getCurrentUser();
  if (!user) return;

  const dateEl = document.getElementById("inicio-date");
  const greetEl = document.getElementById("inicio-greeting");
  const passEl = document.getElementById("inicio-pass-card");
  const timelineEl = document.getElementById("inicio-timeline");
  const ctxFootEl = document.getElementById("inicio-context-foot");
  const openGridEl = document.getElementById("inicio-open-grid");
  const openSectionEl = document.getElementById("inicio-open-slots");
  if (!passEl || !timelineEl || !ctxFootEl) return;

  if (dateEl) dateEl.textContent = formatInicioTodayLabel();
  if (greetEl) greetEl.textContent = formatInicioGreeting(user);

  const nowMs = Date.now();
  const activeStudentBookings = state.bookings
    .filter((b) => b.studentId === user.id && b.status === "Confirmado")
    .map((bk) => {
      const slot = getSlot(bk.slotId);
      const off = slot ? getOffering(slot.offeringId) : null;
      const startDate = slot ? getSlotStartDate(slot.dateIso, slot.time) : null;
      return { bk, slot, off, startMs: startDate ? startDate.getTime() : 0 };
    })
    .filter((item) => item.slot && item.off)
    .sort((a, b) => a.startMs - b.startMs);

  // Filtro rigoroso de datas futuras: nunca exibe uma data passada como "Próxima sessão"
  const upcomingStudentBookings = activeStudentBookings.filter((item) => isSlotUpcoming(item.slot, nowMs));
  const nextStudentItem = upcomingStudentBookings[0] || null;

  const isMonitor = user.role === "monitor";
  const monitorOff = isMonitor ? getOffering(user.offeringId) : null;
  const monitorStats = isMonitor ? getMonitorDisciplineStats(user.offeringId, nowMs) : null;
  const upcomingMonitorSlots = monitorStats ? monitorStats.upcomingSlots : [];
  const nextMonitorSlotItem = upcomingMonitorSlots[0] || null;

  // Cartão Passe (Coluna Esquerda)
  let passMode = "empty"; // 'student' | 'monitor' | 'empty'
  if (nextStudentItem) {
    passMode = "student";
    const { bk, slot, off } = nextStudentItem;
    const [startTime, endTime] = String(slot.time || "").split(" - ");
    const relText = formatRelativeCountdown(slot);
    passEl.innerHTML = `
      <div class="inicio-pass-top">
        <span class="inicio-pass-rel">
          <span class="inicio-live-dot" aria-hidden="true"></span>
          <span>${escapeHtml(relText)}</span>
        </span>
        <span class="inicio-pass-kicker">Próxima sessão</span>
      </div>
      <div class="inicio-pass-time">
        <span class="inicio-time-start">${escapeHtml(startTime || slot.time)}</span>
        ${endTime ? `<span class="inicio-time-end">— ${escapeHtml(endTime)}</span>` : ""}
      </div>
      <h2 class="inicio-pass-subject">${escapeHtml(off.subject)}</h2>
      <p class="inicio-pass-meta">${escapeHtml(getShortMonitorName(off.monitor))} · ${escapeHtml(off.shortLocation || off.location)}</p>
      <div class="inicio-pass-actions">
        <button type="button" class="btn btn-primary inicio-pass-cta inicio-pass-cta-desktop" data-inicio-ics="${escapeHtml(bk.id)}">
          Adicionar à agenda
        </button>
        <button type="button" class="inicio-pass-link inicio-pass-link-desktop" data-inicio-go="agendamentos">
          Ver detalhes →
        </button>
        <button type="button" class="btn btn-primary inicio-pass-cta inicio-pass-cta-mobile" data-inicio-go="agendamentos">
          Ver atendimento
        </button>
      </div>
    `;
  } else if (isMonitor && monitorOff && nextMonitorSlotItem) {
    passMode = "monitor";
    const { slot, occupied } = nextMonitorSlotItem;
    const [startTime, endTime] = String(slot.time || "").split(" - ");
    const relText = formatRelativeCountdown(slot);
    passEl.innerHTML = `
      <div class="inicio-pass-top">
        <span class="inicio-pass-rel">
          <span class="inicio-live-dot" aria-hidden="true"></span>
          <span>${escapeHtml(relText)}</span>
        </span>
        <span class="inicio-pass-kicker">Sua monitoria</span>
      </div>
      <div class="inicio-pass-time">
        <span class="inicio-time-start">${escapeHtml(startTime || slot.time)}</span>
        ${endTime ? `<span class="inicio-time-end">— ${escapeHtml(endTime)}</span>` : ""}
      </div>
      <h2 class="inicio-pass-subject">${escapeHtml(monitorOff.subject)}</h2>
      <p class="inicio-pass-meta">${occupied}/${slot.capacity} alunos · ${escapeHtml(monitorOff.shortLocation || monitorOff.location)}</p>
      <div class="inicio-pass-actions">
        <button type="button" class="btn btn-primary inicio-pass-cta" data-inicio-go="monitor">
          Abrir painel →
        </button>
        <button type="button" class="inicio-pass-link inicio-pass-link-desktop" data-inicio-open-catalog="true">
          Agendar monitoria →
        </button>
      </div>
    `;
  } else {
    passEl.innerHTML = `
      <div class="inicio-pass-top">
        <span class="inicio-pass-kicker">Próxima sessão</span>
      </div>
      <h2 class="inicio-pass-empty-title">Nenhum atendimento agendado</h2>
      <p class="inicio-pass-empty-sub">Escolha uma disciplina com horários livres para reservar sua vaga.</p>
      <div class="inicio-pass-actions">
        <button type="button" class="btn btn-primary inicio-pass-cta" data-inicio-open-catalog="true">
          Agendar monitoria →
        </button>
      </div>
    `;
  }

  // Timeline "Sua semana" (Coluna Direita — sem caixa externa e sem repetir o que já está no Passe)
  let weekItems = [];
  let weekEmptyMsg = "Nenhum compromisso futuro nesta semana.";

  if (passMode === "student") {
    const restStudent = upcomingStudentBookings.slice(1, 4);
    if (restStudent.length > 0) {
      weekItems = restStudent.map((item, idx) => ({
        isNext: idx === 0,
        when: formatTimelineWhen(item.slot),
        desc: `${item.off.shortSubject} · ${getShortMonitorName(item.off.monitor)}`,
      }));
    } else {
      weekEmptyMsg = "Nenhuma outra sessão marcada para esta semana.";
    }
  } else if (passMode === "monitor") {
    const restMonitor = upcomingMonitorSlots.slice(1, 4);
    if (restMonitor.length > 0) {
      weekItems = restMonitor.map((item, idx) => ({
        isNext: idx === 0,
        when: formatTimelineWhen(item.slot),
        desc: `${monitorOff ? monitorOff.shortSubject : "Monitoria"} · ${item.occupied}/${item.slot.capacity} alunos`,
      }));
    } else {
      weekEmptyMsg = "Nenhum outro horário publicado além da próxima sessão.";
    }
  }

  const weekAsideEl = timelineEl.closest(".inicio-week");
  weekAsideEl?.classList.toggle("is-week-empty", weekItems.length === 0);

  if (weekItems.length === 0) {
    timelineEl.classList.remove("has-items");
    timelineEl.innerHTML = `<p class="inicio-week-empty">${escapeHtml(weekEmptyMsg)}</p>`;
  } else {
    timelineEl.classList.add("has-items");
    timelineEl.innerHTML = weekItems
      .map(
        (it) => `
        <div class="inicio-tl-item${it.isNext ? " is-next" : ""}">
          <span class="inicio-tl-dot" aria-hidden="true"></span>
          <span class="inicio-tl-when">${escapeHtml(it.when)}</span>
          <span class="inicio-tl-desc">${escapeHtml(it.desc)}</span>
        </div>
      `
      )
      .join("");
  }

  // Bloco contextual inferior (Monitor vs. Estudante — mesma fonte de contagem e sem botão duplicado)
  if (isMonitor && monitorStats) {
    const subjName = monitorOff ? monitorOff.subject : "Disciplina vinculada";
    const pubCount = monitorStats.publishedCount;
    const occCount = monitorStats.totalOccupied;
    const pubTxt = `${pubCount} ${pubCount === 1 ? "horário publicado" : "horários publicados"}`;
    const occTxt = `${occCount} ${occCount === 1 ? "vaga ocupada" : "vagas ocupadas"}`;
    ctxFootEl.innerHTML = `
      <span class="inicio-ctx-title">${escapeHtml(subjName)}</span>
      <p class="inicio-ctx-sub">${escapeHtml(pubTxt)} · ${escapeHtml(occTxt)}</p>
      <button type="button" class="inicio-ctx-link" data-inicio-go-monitor-form="true">Publicar novo horário →</button>
    `;
  } else {
    const activeCount = upcomingStudentBookings.length;
    const quotaMax = 4;
    const pct = Math.min(100, Math.round((activeCount / quotaMax) * 100));
    ctxFootEl.innerHTML = `
      <div class="inicio-ctx-head">
        <span class="inicio-ctx-title">Limite semanal</span>
        <span class="inicio-ctx-stat">${activeCount} de ${quotaMax} agendamentos ativos</span>
      </div>
      <div class="inicio-quota-track" aria-hidden="true">
        <div class="inicio-quota-fill" style="width:${pct}%"></div>
      </div>
      <button type="button" class="inicio-ctx-link" data-inicio-go="agendamentos">Ver histórico →</button>
    `;
  }

  // Faixa aberta inferior: Próximos horários livres (até 4 disciplinas com vagas futuras reais)
  if (openGridEl && openSectionEl) {
    const openOfferings = OFFERINGS.map((off) => {
      const nextSlot = getOfferingNextUpcomingSlot(off.id, nowMs);
      const free = getOfferingUpcomingRemainingTotal(off.id, nowMs);
      const startMs = nextSlot ? getSlotStartDate(nextSlot.dateIso, nextSlot.time)?.getTime() || Infinity : Infinity;
      return { off, nextSlot, free, startMs };
    })
      .filter((item) => item.nextSlot && item.free > 0)
      .sort((a, b) => a.startMs - b.startMs)
      .slice(0, 4);

    if (openOfferings.length === 0) {
      openSectionEl.classList.add("is-hidden");
    } else {
      openSectionEl.classList.remove("is-hidden");
      openGridEl.innerHTML = openOfferings
        .map(
          ({ off, nextSlot, free }) => `
          <button type="button" class="inicio-open-item" data-inicio-pick-offering="${escapeHtml(off.id)}">
            <span class="inicio-open-subj-row">
              <span class="inicio-open-subj">${escapeHtml(off.shortSubject)}</span>
              <span class="inicio-open-arrow" aria-hidden="true">→</span>
            </span>
            <span class="inicio-open-when">${escapeHtml(formatTimelineWhen(nextSlot))}</span>
            <span class="inicio-open-meta">${escapeHtml(getShortMonitorName(off.monitor))} · ${escapeHtml(formatVagas(free, false))}</span>
          </button>
        `
        )
        .join("");
    }
  }
}

// ==================== NAVEGAÇÃO ====================
function switchView(viewName, useTransition = false) {
  closeMonitorSlotSheet(false);
  closeStep1FiltersSheet(false);
  closeInicioSearchPopover();
  document.body.classList.remove("is-mobile-input-focused");
  const user = getCurrentUser();
  if (viewName !== "landing" && !user) {
    viewName = "landing";
    showToast("Faça login para acessar os horários e dados acadêmicos.");
  }
  if (viewName === "monitor" && user?.role !== "monitor") {
    viewName = "inicio";
  }

  const prevView = ui.activeView;
  const applySwitch = () => {
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

    if (viewName === "inicio") renderInicio();
    if (viewName === "agendar") renderAgendar();
    if (viewName === "agendamentos") renderBookings();
    if (viewName === "monitor") renderMonitorPanel();
    syncMobileChrome();
    syncAllSlidingIndicators();

    if (prevView === "landing" && viewName !== "landing" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  if (useTransition && prevView !== viewName && prevView !== "landing" && viewName !== "landing") {
    runWithViewTransition(applySwitch);
  } else {
    applySwitch();
  }
}

// ==================== AUTENTICAÇÃO, RETORNO RÁPIDO E SSO REAL ====================
function showQuickAuthStage(user) {
  if (!user) return;
  const quickStage = document.getElementById("auth-stage-quick");
  const mainStage = document.getElementById("auth-stage-main");
  const otpStage = document.getElementById("auth-stage-otp");
  const googleStage = document.getElementById("auth-stage-google-onboarding");
  if (!quickStage || !mainStage) return;

  renderAvatarContent(document.getElementById("quick-avatar"), user.avatarUrl, getUserInitials(user.name));
  document.getElementById("quick-name").textContent = user.name;
  document.getElementById("quick-sub").textContent = "Acesse sua conta";

  mainStage.classList.add("is-hidden");
  otpStage?.classList.add("is-hidden");
  googleStage?.classList.add("is-hidden");
  quickStage.classList.remove("is-hidden");
}

function hideQuickAuthStage() {
  document.getElementById("auth-stage-quick")?.classList.add("is-hidden");
  document.getElementById("auth-stage-main")?.classList.remove("is-hidden");
}

function setGoogleOnboardingRole(role) {
  googleOnboardingRole = role === "monitor" ? "monitor" : "student";
  const isMonitor = googleOnboardingRole === "monitor";
  document.querySelectorAll("[data-google-role]").forEach((btn) => {
    const active = btn.dataset.googleRole === googleOnboardingRole;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-checked", String(active));
  });
  document.getElementById("google-course-wrap")?.classList.toggle("is-hidden", isMonitor);
  document.getElementById("google-subject-wrap")?.classList.toggle("is-hidden", !isMonitor);
  document.getElementById("google-code-wrap")?.classList.toggle("is-hidden", !isMonitor);
}

function showGoogleOnboardingStage(data) {
  pendingGoogleOnboarding = {
    onboardingToken: data.onboarding_token,
    profile: data.profile || {},
  };
  const profile = pendingGoogleOnboarding.profile;
  renderAvatarContent(
    document.getElementById("google-onboard-avatar"),
    profile.avatar_url || null,
    getUserInitials(profile.name || profile.email, "G")
  );
  document.getElementById("google-onboard-name").textContent = profile.name || "Conta Google";
  document.getElementById("google-onboard-email").textContent = profile.email || "";

  const form = document.getElementById("auth-stage-google-onboarding");
  clearFormErrors(form);
  document.getElementById("google-reg-name").value = profile.name || "";
  document.getElementById("google-reg-ra").value = "";
  document.getElementById("google-reg-course").value = "Eng. Software · 1º A";
  document.getElementById("google-reg-code").value = "";
  setGoogleOnboardingRole("student");

  document.getElementById("auth-stage-quick")?.classList.add("is-hidden");
  document.getElementById("auth-stage-main")?.classList.add("is-hidden");
  document.getElementById("auth-stage-otp")?.classList.add("is-hidden");
  form?.classList.remove("is-hidden");
  document.getElementById("google-reg-ra")?.focus();
}

function hideGoogleOnboardingStage() {
  pendingGoogleOnboarding = null;
  const form = document.getElementById("auth-stage-google-onboarding");
  if (form) {
    clearFormErrors(form);
    form.classList.add("is-hidden");
  }
  document.getElementById("auth-stage-main")?.classList.remove("is-hidden");
}

function initGoogleIdentity() {
  if (!authProviders.google.enabled || !authProviders.google.clientId) return false;
  if (!window.google?.accounts?.id) return false;
  if (googleGisInitializedClientId === authProviders.google.clientId) return true;
  window.google.accounts.id.initialize({
    client_id: authProviders.google.clientId,
    callback: handleGoogleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
  });
  googleGisInitializedClientId = authProviders.google.clientId;
  return true;
}

function openSsoProviderModal({ iconHtml, title, sub, bodyHtml, triggerEl = null }) {
  ssoModalLastTrigger = triggerEl || document.activeElement;
  document.getElementById("sso-provider-icon").innerHTML = iconHtml;
  document.getElementById("sso-provider-title").textContent = title;
  document.getElementById("sso-provider-sub").textContent = sub;
  document.getElementById("sso-provider-body").innerHTML = bodyHtml;
  document.getElementById("sso-provider-modal")?.classList.remove("is-hidden");
  syncBodyScrollLock();
}

function closeSsoProviderModal(restoreFocus = true) {
  const modal = document.getElementById("sso-provider-modal");
  if (!modal || modal.classList.contains("is-hidden")) return;
  modal.classList.add("is-hidden");
  syncBodyScrollLock();
  if (restoreFocus && lastInputWasKeyboard && ssoModalLastTrigger?.focus) {
    ssoModalLastTrigger.focus();
  }
  ssoModalLastTrigger = null;
}

function openGoogleFallbackModal(triggerEl = null) {
  const googleSvg = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;
  openSsoProviderModal({
    iconHtml: googleSvg,
    title: "Continuar com Google",
    sub: "Autenticação oficial verificada pelo servidor Monitora+.",
    bodyHtml: `
      <p class="sso-provider-note">Selecione sua conta Google abaixo para entrar ou concluir seu cadastro.</p>
      <div class="sso-google-render-slot" id="sso-google-render-slot"></div>
    `,
    triggerEl,
  });
  const slot = document.getElementById("sso-google-render-slot");
  if (slot && window.google?.accounts?.id) {
    const isDark = document.body.classList.contains("theme-dark") || document.body.classList.contains("theme-contrast");
    window.google.accounts.id.renderButton(slot, {
      type: "standard",
      theme: isDark ? "filled_black" : "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: 300,
    });
  }
}

async function triggerGoogleSignIn(triggerEl = null) {
  if (!authProviders.google.enabled) {
    await loadAuthProviders();
  }
  if (!authProviders.google.enabled || !authProviders.google.clientId) {
    showToast("Login com Google aguardando configuração de GOOGLE_CLIENT_ID no servidor.", null, "info");
    return;
  }
  if (!initGoogleIdentity()) {
    showToast("Carregando serviço do Google… tente novamente em 1 segundo.", null, "info");
    return;
  }
  // Abre diretamente o modal com o botão oficial renderButton do Google GIS,
  // evitando o cooldown silencioso do FedCM/One Tap após cancelamentos no Chrome.
  openGoogleFallbackModal(triggerEl);
}

function handleGoogleCredentialResponse(response) {
  const credential = response?.credential;
  if (!credential) {
    showToast("Não foi possível obter a credencial do Google.", null, "error");
    return;
  }
  closeSsoProviderModal(false);
  return runApiAction("auth-google", async () => {
    const result = await apiClient.request("/auth/google", {
      method: "POST",
      body: { credential },
    });
    if (result.needs_onboarding) {
      showGoogleOnboardingStage(result);
      showToast("Conta Google verificada. Informe sua matrícula para concluir.", null, "info");
      return;
    }
    const user = await acceptRemoteSession(result);
    showToast(`Bem-vindo(a), ${user.name.split(" ")[0]}!`, null, "success");
  });
}

function handleGoogleOnboardingSubmit(e) {
  e.preventDefault();
  if (!pendingGoogleOnboarding?.onboardingToken) {
    hideGoogleOnboardingStage();
    showToast("Sessão Google expirada. Clique em Google novamente.", null, "error");
    return;
  }
  const form = document.getElementById("auth-stage-google-onboarding");
  clearFormErrors(form);
  const nameEl = document.getElementById("google-reg-name");
  const raEl = document.getElementById("google-reg-ra");
  const courseEl = document.getElementById("google-reg-course");
  const subjectEl = document.getElementById("google-reg-subject");
  const codeEl = document.getElementById("google-reg-code");

  const name = nameEl.value.trim();
  const ra = raEl.value.trim();
  const course = courseEl.value.trim();
  const offeringId = subjectEl.value;
  const professorCode = codeEl.value.trim().toUpperCase();
  const isMonitor = googleOnboardingRole === "monitor";

  const errors = [];
  if (name.length < 3) errors.push({ el: nameEl, message: "Informe seu nome completo (mínimo 3 caracteres)." });
  if (!/^\d{5,12}$/.test(ra)) errors.push({ el: raEl, message: "A matrícula deve conter de 5 a 12 números." });
  if (!isMonitor && !course) errors.push({ el: courseEl, message: "Informe sua turma." });
  if (isMonitor && !offeringId) errors.push({ el: subjectEl, message: "Selecione a disciplina da monitoria." });
  if (isMonitor && !professorCode) errors.push({ el: codeEl, message: "Informe o código autorizado pelo docente." });
  if (applyFieldErrors(form, errors)) return;

  return runApiAction("auth-google-complete", async () => {
    const result = await apiClient.request("/auth/google/complete", {
      method: "POST",
      body: {
        onboarding_token: pendingGoogleOnboarding.onboardingToken,
        role: googleOnboardingRole,
        name,
        ra,
        course: isMonitor ? undefined : course,
        offering_id: isMonitor ? offeringId : undefined,
        professor_code: isMonitor ? professorCode : undefined,
      },
    });
    pendingGoogleOnboarding = null;
    hideGoogleOnboardingStage();
    const user = await acceptRemoteSession(result, true);
    showToast(`Cadastro Google concluído! Bem-vindo(a), ${user.name.split(" ")[0]}!`, null, "success");
  }, form);
}

function openGenneraModal(triggerEl = null) {
  const genneraIcon = `<img src="assets/gennera-icon.svg?v=20261124b1" alt="" width="22" height="22" class="sso-icon-img" aria-hidden="true" />`;
  const googleReady = authProviders.google.enabled;
  openSsoProviderModal({
    iconHtml: genneraIcon,
    title: "Acesso Institucional · Gennera",
    sub: "Integração com o portal acadêmico UNIFSA.",
    bodyHtml: `
      <p class="sso-provider-note">
        O login direto via Webservice da Gennera (UNIFSA) já está estruturado no servidor e aguarda apenas a liberação da chave institucional pela TI.
      </p>
      <p class="sso-provider-note">
        Enquanto isso, acesse com sua conta real do Monitora+ usando Google ou sua matrícula e senha:
      </p>
      <div class="sso-provider-actions">
        ${
          googleReady
            ? `<button type="button" class="btn btn-primary btn-full" id="btn-gennera-to-google">Continuar com Google</button>`
            : ""
        }
        <button type="button" class="btn ${googleReady ? "btn-secondary" : "btn-primary"} btn-full" id="btn-gennera-to-password">
          Entrar com matrícula e senha
        </button>
      </div>
    `,
    triggerEl,
  });
  document.getElementById("btn-gennera-to-google")?.addEventListener("click", () => {
    closeSsoProviderModal(false);
    triggerGoogleSignIn(document.getElementById("btn-sso-google"));
  });
  document.getElementById("btn-gennera-to-password")?.addEventListener("click", () => {
    closeSsoProviderModal(false);
    document.getElementById("login-identifier")?.focus();
  });
}

function setAuthTab(tabName) {
  ui.authTab = tabName;
  document.body.classList.toggle("is-auth-register", tabName === "register");
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
      headTitle.innerHTML =
        '<span class="auth-title-desktop">Entrar no Monitora+</span><span class="auth-title-mobile">Acesse sua conta</span>';
      headSub.textContent = "Acesse com sua matrícula ou e-mail.";
    } else {
      headTitle.innerHTML =
        '<span class="auth-title-desktop">Criar conta no Monitora+</span><span class="auth-title-mobile">Crie sua conta</span>';
      headSub.textContent = "Informe sua matrícula e seus dados de acesso.";
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
  document.getElementById("auth-stage-main").classList.add("is-hidden");
  document.getElementById("auth-stage-otp").classList.remove("is-hidden");
  document.getElementById("otp-subtitle").textContent = `Insira o código autorizado para ${off?.subject || "a disciplina"}.`;
  clearOtpErrors();
  document.getElementById("otp-code").value = "";
  document.getElementById("btn-verify-otp").disabled = true;
  document.getElementById("otp-code").focus();
}

function hideOtpStage() {
  ui.pendingMonitorDraft = null;
  clearOtpErrors();
  document.getElementById("auth-stage-otp").classList.add("is-hidden");
  document.getElementById("auth-stage-main").classList.remove("is-hidden");
}

function getOtpValue() {
  return document.getElementById("otp-code").value.trim().toUpperCase();
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const form = document.getElementById("form-login");
  clearFormErrors(form);
  const identifierEl = document.getElementById("login-identifier");
  const passwordEl = document.getElementById("login-password");
  const identifier = identifierEl.value.trim();
  const password = passwordEl.value;
  const errors = [];
  if (!identifier) errors.push({ el: identifierEl, message: "Informe sua matrícula ou e-mail." });
  if (!password) errors.push({ el: passwordEl, message: "Digite sua senha para continuar." });
  if (applyFieldErrors(form, errors)) return;
  return runApiAction("auth", async () => {
    const result = await apiClient.request("/auth/login", { method: "POST", body: { identifier, password } });
    const user = await acceptRemoteSession(result);
    form.reset();
    showToast(`Bem-vindo(a), ${user.name.split(" ")[0]}!`, null, "success");
  }, form);
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
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ el: emailEl, message: "Informe um e-mail válido." });
  }
  if (password.length < 6) {
    errors.push({ el: passEl, message: "A senha deve ter no mínimo 6 caracteres." });
  }
  return errors;
}

async function finalizeCreateUser(draft) {
  const result = await apiClient.request("/auth/register", { method: "POST", body: {
    role: draft.role, name: draft.name, ra: draft.ra, email: draft.email, password: draft.password,
    course: draft.course, offering_id: draft.offeringId, professor_code: draft.professorCode,
  } });
  return acceptRemoteSession(result, true);
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

  return runApiAction("auth", async () => {
    await finalizeCreateUser(draft);
    form.reset();
    clearFormErrors(form);
    showToast("Conta de estudante criada com sucesso!", null, "success");
  }, form);
}

function handleVerifyOtpSubmit(e) {
  e.preventDefault();
  const draft = ui.pendingMonitorDraft;
  if (!draft) return;
  clearOtpErrors();
  return runApiAction("auth", async () => {
    await finalizeCreateUser({ ...draft, professorCode: getOtpValue() });
    hideOtpStage();
    document.getElementById("form-register").reset();
    document.getElementById("otp-code").value = "";
    showToast("Conta de monitor autorizada e ativada!", null, "success");
  }, document.getElementById("auth-stage-otp"));
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
  const oldSlot = getSlot(bk.slotId);
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
  const oldSlot = getSlot(bk.slotId);
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
  closeStep1FiltersSheet(false);
  const applyStep = () => {
    ui.step = stepNumber;
    if (stepNumber === 1) ui.reschedulingBookingId = null;
    if (stepNumber < 3) ui.step3Completed = false;
    renderAgendar();
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  if (window.innerWidth > 768 && ui.step !== stepNumber) {
    runWithViewTransition(applyStep);
  } else {
    applyStep();
  }
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

  const counterEl = document.getElementById("mobile-step-counter");
  if (counterEl) counterEl.textContent = `${ui.step} de 3`;
  document.querySelectorAll("#mobile-step-progress [data-msp]").forEach((seg) => {
    const idx = Number(seg.dataset.msp);
    seg.classList.toggle("is-done", idx < ui.step || (idx === 3 && ui.step === 3 && ui.step3Completed));
    seg.classList.toggle("is-active", idx === ui.step && !(idx === 3 && ui.step3Completed));
  });
}

function getOfferingNextSlotLabel(offeringId) {
  const next = getOfferingNextUpcomingSlot(offeringId);
  if (!next) return "Sem horários livres";
  const shortDay = next.dayName.slice(0, 3);
  const startTime = next.time.split(" - ")[0] || next.time;
  return `Próx.: ${shortDay}, ${startTime}`;
}

function formatMobileCardDatetime(dateIso, dayName, timeStr) {
  const parts = getDateBadgeParts(dateIso, dayName);
  const monthCap = parts.month ? parts.month[0] + parts.month.slice(1).toLowerCase() : "";
  const wkCap = parts.weekday ? parts.weekday[0] + parts.weekday.slice(1).toLowerCase() : "";
  const startTime = (timeStr || "").split(" - ")[0] || timeStr || "";
  return `${parts.day} ${monthCap} · ${wkCap}, ${startTime}`;
}

function formatMonitorMobileDatetime(dateIso, dayName, timeStr) {
  const parts = getDateBadgeParts(dateIso, dayName);
  const monthCap = parts.month ? parts.month[0] + parts.month.slice(1).toLowerCase() : "";
  const wkCap = parts.weekday ? parts.weekday[0] + parts.weekday.slice(1).toLowerCase() : "";
  const rangeCompact = String(timeStr || "").replace(/\s*-\s*/g, "–");
  return `${wkCap}, ${parts.day} ${monthCap} · ${rangeCompact}`;
}

function formatBookingTopic(topic) {
  const clean = String(topic || "").trim();
  if (!clean) return "";
  return /^d[uú]vidas?\b/i.test(clean) ? clean : `Dúvida: ${clean}`;
}

function formatCompactLocation(off) {
  if (!off) return "";
  const raw = String(off.location || off.shortLocation || "");
  if (raw.includes("Virtual") && raw.includes("Sala 104")) return "Sala 104 / Virtual";
  return String(off.shortLocation || raw)
    .replace(/\s*·\s*Presencial\s*\/\s*Online/i, " / Virtual")
    .trim();
}

let lastMonitorSheetTriggerEl = null;

function openMonitorSlotSheet() {
  if (window.innerWidth > 768) return;
  const form = document.getElementById("form-new-slot");
  const backdrop = document.getElementById("monitor-slot-sheet-backdrop");
  if (!form || !backdrop) return;
  lastMonitorSheetTriggerEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  clearFormErrors(form);
  backdrop.classList.remove("is-hidden");
  form.classList.add("is-mobile-sheet-open");
  form.setAttribute("role", "dialog");
  form.setAttribute("aria-modal", "true");
  form.setAttribute("aria-label", "Publicar novo horário");
  syncBodyScrollLock();
  if (getPrefs().vlibras) positionVlibrasShadowAccess();
  setTimeout(() => {
    const dateInput = document.getElementById("ms-date");
    const dateCtx = customDateRegistry.get(dateInput);
    (dateCtx?.trigger || dateInput)?.focus();
  }, 40);
}

function closeMonitorSlotSheet(restoreFocus = false) {
  closeAllCustomSelects();
  closeAllCustomDatePickers();
  const form = document.getElementById("form-new-slot");
  const backdrop = document.getElementById("monitor-slot-sheet-backdrop");
  const wasOpen = Boolean(form && form.classList.contains("is-mobile-sheet-open"));
  form?.classList.remove("is-mobile-sheet-open");
  form?.removeAttribute("role");
  form?.removeAttribute("aria-modal");
  form?.removeAttribute("aria-label");
  backdrop?.classList.add("is-hidden");
  syncBodyScrollLock();
  if (getPrefs().vlibras) positionVlibrasShadowAccess();
  if (wasOpen && restoreFocus && lastMonitorSheetTriggerEl && document.contains(lastMonitorSheetTriggerEl)) {
    lastMonitorSheetTriggerEl.focus();
  }
  lastMonitorSheetTriggerEl = null;
}

// ==================== BOTTOM SHEET DE FILTROS (ETAPA 1 MOBILE — ESTADO RASCUNHO) ====================
let step1FilterDraft = { mode: "Todas", subject: "Todas" };
let lastStep1FiltersTriggerEl = null;

function renderStep1FiltersSheetDraft() {
  const modeWrap = document.getElementById("filters-sheet-mode-options");
  const subjWrap = document.getElementById("filters-sheet-subject-options");
  if (modeWrap) {
    modeWrap.querySelectorAll("[data-draft-mode]").forEach((btn) => {
      const active = btn.dataset.draftMode === step1FilterDraft.mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }
  if (subjWrap) {
    const subjects = ["Todas", ...OFFERINGS.map((o) => o.shortSubject)];
    subjWrap.innerHTML = subjects
      .map((subj) => {
        const active = step1FilterDraft.subject === subj;
        return `
          <button
            type="button"
            class="filter-opt-chip${active ? " is-active" : ""}"
            data-draft-subject="${escapeHtml(subj)}"
            aria-pressed="${active}"
          >
            ${escapeHtml(subj)}
          </button>
        `;
      })
      .join("");
  }
}

function openStep1FiltersSheet() {
  if (window.innerWidth > 768) return;
  const sheet = document.getElementById("step1-filters-sheet");
  const backdrop = document.getElementById("step1-filters-backdrop");
  const triggerBtn = document.getElementById("btn-step1-open-filters");
  if (!sheet || !backdrop) return;
  lastStep1FiltersTriggerEl = document.activeElement instanceof HTMLElement ? document.activeElement : triggerBtn;
  step1FilterDraft = {
    mode: ui.modeFilter || "Todas",
    subject: ui.subjectFilter || "Todas",
  };
  renderStep1FiltersSheetDraft();
  backdrop.classList.remove("is-hidden");
  sheet.classList.remove("is-hidden");
  triggerBtn?.setAttribute("aria-expanded", "true");
  syncBodyScrollLock();
  if (getPrefs().vlibras) positionVlibrasShadowAccess();
  setTimeout(() => {
    document.getElementById("btn-close-step1-filters")?.focus();
  }, 40);
}

function closeStep1FiltersSheet(restoreFocus = false) {
  const sheet = document.getElementById("step1-filters-sheet");
  const backdrop = document.getElementById("step1-filters-backdrop");
  const triggerBtn = document.getElementById("btn-step1-open-filters");
  const wasOpen = Boolean(sheet && !sheet.classList.contains("is-hidden"));
  sheet?.classList.add("is-hidden");
  backdrop?.classList.add("is-hidden");
  triggerBtn?.setAttribute("aria-expanded", "false");
  syncBodyScrollLock();
  if (getPrefs().vlibras) positionVlibrasShadowAccess();
  if (wasOpen && restoreFocus && lastStep1FiltersTriggerEl && document.contains(lastStep1FiltersTriggerEl)) {
    lastStep1FiltersTriggerEl.focus();
  }
  lastStep1FiltersTriggerEl = null;
}

function applyStep1FiltersDraft() {
  ui.modeFilter = step1FilterDraft.mode || "Todas";
  ui.subjectFilter = step1FilterDraft.subject || "Todas";
  closeStep1FiltersSheet(true);
  renderStep1();
}

function renderStep1MobileFilterState() {
  const activeFilters = [];
  if (ui.modeFilter && ui.modeFilter !== "Todas") {
    activeFilters.push({ kind: "mode", label: ui.modeFilter });
  }
  if (ui.subjectFilter && ui.subjectFilter !== "Todas") {
    activeFilters.push({ kind: "subject", label: ui.subjectFilter });
  }

  const count = activeFilters.length;
  const openBtn = document.getElementById("btn-step1-open-filters");
  const countEl = document.getElementById("step1-filter-count");
  const rowEl = document.getElementById("step1-active-filters-row");

  if (openBtn) openBtn.classList.toggle("has-active-filters", count > 0);
  if (countEl) {
    countEl.textContent = String(count);
    countEl.classList.toggle("is-hidden", count === 0);
  }
  if (rowEl) {
    if (count === 0) {
      rowEl.classList.add("is-hidden");
      rowEl.innerHTML = "";
    } else {
      rowEl.classList.remove("is-hidden");
      const chipsHtml = activeFilters
        .map(
          (f) => `
          <button
            type="button"
            class="active-filter-chip"
            data-remove-filter="${escapeHtml(f.kind)}"
            aria-label="Remover filtro ${escapeHtml(f.label)}"
          >
            <span>${escapeHtml(f.label)}</span>
            <span class="active-filter-chip-x" aria-hidden="true">×</span>
          </button>
        `
        )
        .join("");
      const clearHtml =
        count > 1
          ? `<button type="button" class="active-filter-clear-btn" data-remove-filter="all">Limpar</button>`
          : "";
      rowEl.innerHTML = chipsHtml + clearHtml;
    }
  }

  const viewBtn = document.getElementById("btn-step1-mobile-view");
  const viewLabel = document.getElementById("step1-mobile-view-label");
  if (viewBtn) {
    const isMatrix = ui.step1Layout === "matrix";
    viewBtn.classList.toggle("is-active", isMatrix);
    viewBtn.setAttribute("aria-pressed", String(isMatrix));
    viewBtn.title = isMatrix ? "Voltar para lista" : "Alternar para grade semanal";
    viewBtn.querySelector(".icon-view-grid")?.classList.toggle("is-hidden", isMatrix);
    viewBtn.querySelector(".icon-view-list")?.classList.toggle("is-hidden", !isMatrix);
    if (viewLabel) viewLabel.textContent = isMatrix ? "Lista" : "Grade";
  }
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
  renderStep1MobileFilterState();

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
        const vacShort = free === 0 ? "Lotado" : formatVagas(free, false);
        const initials = getMonitorInitials(off.monitor);
        const placeTag = off.shortLocation || off.location;
        const nextSlotLabel = getOfferingNextSlotLabel(off.id);

        return `
          <button type="button" class="list-row-btn" data-select-offering="${escapeHtml(off.id)}">
            <div class="row-left">
              <span class="monitor-monogram" aria-hidden="true">${escapeHtml(initials)}</span>
              <div class="row-body">
                <p class="row-title">${escapeHtml(off.subject)}</p>
                <div class="row-meta-line">
                  <span class="row-meta">${escapeHtml(formatCleanMonitorName(off.monitor))}</span>
                  <span class="row-meta-sep" aria-hidden="true">·</span>
                  <span class="row-loc-tag">${escapeHtml(placeTag)}</span>
                </div>
              </div>
            </div>
            <div class="row-right">
              <span class="status-dot-inline ${dotClass}" aria-hidden="true"></span>
              <span class="vac-desktop-full">${escapeHtml(vacText)}</span>
              <span class="vac-mobile-short">${escapeHtml(vacShort)}</span>
              <span class="row-arrow-desktop" aria-hidden="true">→</span>
            </div>
            <div class="row-next-slot">
              <span>${escapeHtml(nextSlotLabel)}</span>
              <span class="row-next-chevron" aria-hidden="true">›</span>
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
                    <p class="mms-meta">${escapeHtml(formatCleanMonitorName(off.monitor))} · ${escapeHtml(
                off.shortLocation || off.location
              )}</p>
                    <span class="mms-vac">
                      <span class="status-dot-inline ${dotClass}" aria-hidden="true"></span>
                      ${escapeHtml(formatVagas(rem, false))} · ${formatDateBr(sl.dateIso).slice(0, 5)}
                    </span>
                  </div>
                  <span class="mms-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
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
  document.getElementById("s2-monitor").textContent = formatCleanMonitorName(off.monitor);
  document.getElementById("s2-location").textContent = off.location;

  const s2MobTitle = document.getElementById("s2-mobile-title");
  const s2MobMeta = document.getElementById("s2-mobile-meta");
  if (s2MobTitle) s2MobTitle.textContent = off.subject;
  if (s2MobMeta) {
    s2MobMeta.textContent = `${formatCleanMonitorName(off.monitor)} · 40 min · ${formatCompactLocation(off)}`;
  }

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
  const slot = getSlot(ui.selectedSlotId);
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
  document.getElementById("s3-monitor").textContent = formatCleanMonitorName(off.monitor);
  document.getElementById("s3-location").textContent = off.location;
  const remCount = getSlotRemaining(slot);
  document.getElementById("s3-vacancies").textContent = `${remCount} de ${slot.capacity} ${
    remCount === 1 ? "livre" : "livres"
  }`;

  const s3MobSubj = document.getElementById("s3-mobile-subject");
  const s3MobDt = document.getElementById("s3-mobile-datetime");
  const s3MobMeta = document.getElementById("s3-mobile-meta");
  if (s3MobSubj) s3MobSubj.textContent = off.subject;
  if (s3MobDt) s3MobDt.textContent = formatMonitorMobileDatetime(slot.dateIso, slot.dayName, slot.time);
  if (s3MobMeta) {
    s3MobMeta.textContent = `${formatCleanMonitorName(off.monitor)} · ${formatCompactLocation(off)} · ${formatVagas(
      remCount,
      false
    )}`;
  }

  const user = getCurrentUser();
  if (!user) {
    switchView("landing");
    return;
  }

  document.getElementById("s3-user-display").textContent = `${user.name} (${user.ra})`;
  const s3MobName = document.getElementById("s3-user-name-mobile");
  const s3MobRa = document.getElementById("s3-user-ra-mobile");
  if (s3MobName) s3MobName.textContent = user.name;
  if (s3MobRa) s3MobRa.textContent = user.ra;
  syncTopicChips();

  const errBox = document.getElementById("s3-error-box");
  errBox.classList.add("is-hidden");
  if (user && hasScheduleConflict(user.id, slot, reschedBk?.id || null)) {
    errBox.textContent = `Você já possui outro atendimento confirmado em ${slot.dayName} às ${slot.time}.`;
    errBox.classList.remove("is-hidden");
  }
}

function renderAgendar() {
  document.body.classList.remove("is-mobile-input-focused");
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

  const slot = getSlot(ui.selectedSlotId);
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

  if (hasScheduleConflict(user.id, slot, reschedBk?.id || null)) {
    errBox.textContent = `Você já possui um atendimento confirmado em ${slot.dayName} às ${slot.time}.`;
    errBox.classList.remove("is-hidden");
    return;
  }

  const executeBooking = () => runApiAction("save-booking", async () => {
    const isReschedule = Boolean(reschedBk);
    const previousSlotId = reschedBk?.slotId;
    const previousTopic = reschedBk?.topic;
    const result = await apiClient.request(reschedBk ? `/schedules/${reschedBk.id}/slot` : "/schedules", {
      method: reschedBk ? "PATCH" : "POST", body: { slot_id: Number(slot.id), topic },
    });
    const booking = applyRemoteBooking(result.schedule);
    const protocol = booking.protocol;
    ui.lastCreatedBookingId = booking.id;
    ui.reschedulingBookingId = null;
    await refreshSafely();
    if (!getCurrentUser()) return;
    const undoRescheduleFn = reschedBk ? () => runApiAction(`booking:${booking.id}`, async () => {
      const restored = await apiClient.request(`/schedules/${booking.id}/slot`, {
        method: "PATCH", body: { slot_id: Number(previousSlotId), topic: previousTopic },
      });
      applyRemoteBooking(restored.schedule);
      await refreshSafely();
      ui.highlightedBookingId = booking.id;
      switchView("agendamentos");
      showToast(`Reagendamento desfeito (${protocol}).`, null, "success");
    }) : null;
    ui.highlightedBookingId = ui.lastCreatedBookingId;
    ui.step3Completed = true;
    saveState();
    renderTopbar();

    const successTitle = document.getElementById("success-title");
    const successSub = document.getElementById("success-sub");
    if (successTitle) successTitle.textContent = isReschedule ? "Monitoria reagendada" : "Monitoria confirmada";
    if (successSub) {
      successSub.textContent = isReschedule
        ? "Horário atualizado. Seu protocolo permanece o mesmo."
        : "Vaga reservada. Apresente o protocolo abaixo no atendimento.";
    }

    const isMobileNow = window.innerWidth <= 768;
    const summaryDateVal = isMobileNow
      ? formatMonitorMobileDatetime(slot.dateIso, slot.dayName, slot.time)
      : `${slot.dayName}, ${formatDateBr(slot.dateIso)} · ${slot.time}`;
    const summaryMonitorVal = formatCleanMonitorName(off.monitor);
    const summaryLocVal = isMobileNow ? formatCompactLocation(off) : off.location;

    document.getElementById("success-protocol").textContent = protocol;
    document.getElementById("success-summary").innerHTML = `
      <div><dt>Estudante</dt><dd>${escapeHtml(user.name)}</dd></div>
      <div><dt>Disciplina</dt><dd>${escapeHtml(off.subject)}</dd></div>
      <div><dt>Data e horário</dt><dd>${escapeHtml(summaryDateVal)}</dd></div>
      <div><dt>Monitor</dt><dd>${escapeHtml(summaryMonitorVal)}</dd></div>
      <div class="success-grid-wide"><dt>Local</dt><dd>${escapeHtml(summaryLocVal)}</dd></div>
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
    const toastMsg = isMobileNow
      ? isReschedule
        ? "Horário reagendado!"
        : "Agendamento confirmado!"
      : isReschedule
      ? `Horário reagendado (${protocol})`
      : `Agendamento confirmado (${protocol})`;
    showToast(toastMsg, undoRescheduleFn, "success");
  }, form);

  if (!getPrefs().confirmBeforeBook) {
    executeBooking();
    return;
  }

  const isMobileConfirm = window.innerWidth <= 768;
  openConfirmDialog({
    title: reschedBk ? "Confirmar troca de horário?" : "Confirmar agendamento?",
    desc: reschedBk
      ? "A vaga anterior só é liberada após confirmar a troca."
      : "",
    summaryHtml: buildConfirmSummaryCard({
      title: off.subject,
      rows: [
        {
          label: "Data e horário",
          value: isMobileConfirm
            ? formatMonitorMobileDatetime(slot.dateIso, slot.dayName, slot.time)
            : `${slot.dayName}, ${formatDateBr(slot.dateIso)} às ${slot.time}`,
        },
        { label: "Monitor", value: formatCleanMonitorName(off.monitor) },
        {
          label: isMobileConfirm ? "Local" : "Local / Modalidade",
          value: isMobileConfirm
            ? formatCompactLocation(off)
            : off.location.toLowerCase().includes(off.mode.toLowerCase())
            ? off.location
            : `${off.location} · ${off.mode}`,
        },
        { label: "Dúvida", value: topic, stacked: true },
      ],
    }),
    confirmText: isMobileConfirm
      ? reschedBk
        ? "Trocar horário"
        : "Confirmar vaga"
      : reschedBk
      ? "Sim, trocar horário"
      : "Sim, confirmar vaga",
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

  subEl.textContent = "Seus agendamentos ativos e histórico.";
  if (window.innerWidth <= 768) {
    const bookingsTabs = document.querySelector("#view-agendamentos .underline-tabs");
    if (bookingsTabs) bookingsTabs.scrollLeft = 0;
  }

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
      const slot = getSlot(bk.slotId);
      const off = slot ? getOffering(slot.offeringId) : null;
      if (!slot || !off) return "";

      const dateParts = getDateBadgeParts(slot.dateIso, slot.dayName);
      const mobileDt = formatMobileCardDatetime(slot.dateIso, slot.dayName, slot.time);
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
                <span class="mobile-card-datetime">${escapeHtml(mobileDt)}</span>
                <span class="status-tag is-${escapeHtml(bk.status)}">${escapeHtml(bk.status)}</span>
              </div>
              <p class="row-title">${escapeHtml(off.subject)}</p>
              <p class="row-meta booking-meta-desktop">
                ${escapeHtml(slot.dayName)}, ${formatDateBr(slot.dateIso)} · ${escapeHtml(slot.time)} · ${escapeHtml(
        off.shortLocation || off.location
      )}
              </p>
              <p class="mobile-card-meta-line">${escapeHtml(formatCleanMonitorName(off.monitor))} · ${escapeHtml(
        off.shortLocation || off.location
      )}</p>
              <p class="row-meta booking-topic-quote" style="margin-top:4px">${escapeHtml(formatBookingTopic(bk.topic))}</p>
            </div>
          </div>
          ${
            bk.status === "Confirmado"
              ? `<div class="booking-actions">
                   <button type="button" class="btn btn-secondary" data-reschedule-bk="${escapeHtml(bk.id)}">Reagendar</button>
                   <button type="button" class="btn btn-secondary" data-ics="${escapeHtml(bk.id)}">.ics</button>
                   <button type="button" class="btn btn-danger" data-cancel-bk="${escapeHtml(bk.id)}">Cancelar</button>
                 </div>`
              : ""
          }
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

  document.getElementById("ms-offering-display").value = subjectName;
  document.getElementById("ms-prof-code").placeholder = "Código fornecido pelo professor";
  document.getElementById(
    "monitor-sub"
  ).textContent = `${subjectName} · Agendamentos e horários da sua disciplina.`;
  const mobileSubEl = document.getElementById("monitor-sub-mobile");
  if (mobileSubEl) mobileSubEl.textContent = subjectName;

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
    const slot = getSlot(bk.slotId);
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
        const slot = getSlot(bk.slotId);
        const stu = getUserById(bk.studentId);
        if (!slot) return "";

        const dateParts = getDateBadgeParts(slot.dateIso, slot.dayName);
        const mobileDt = formatMonitorMobileDatetime(slot.dateIso, slot.dayName, slot.time);
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
                  <span class="mobile-card-datetime">${escapeHtml(mobileDt)}</span>
                  <span class="status-tag is-${escapeHtml(bk.status)}">${escapeHtml(bk.status)}</span>
                </div>
                <p class="row-title"><span class="mon-stu-name">${escapeHtml(
                  stu ? stu.name : "Estudante"
                )}</span><span class="mon-stu-ra-desktop"> (${escapeHtml(
          stu ? stu.ra : "—"
        )})</span><span class="mon-stu-ra-mobile">${escapeHtml(stu ? stu.ra : "—")}</span></p>
                <p class="row-meta booking-meta-desktop">${escapeHtml(slot.dayName)}, ${formatDateBr(slot.dateIso)} · ${escapeHtml(slot.time)}</p>
                <p class="row-meta booking-topic-quote" style="margin-top:4px">${escapeHtml(formatBookingTopic(bk.topic))}</p>
              </div>
            </div>
            ${
              bk.status === "Confirmado"
                ? `<div class="booking-actions">
                     <button type="button" class="btn btn-secondary" data-complete-bk="${escapeHtml(
                       bk.id
                     )}">Concluir</button>
                   </div>`
                : ""
            }
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
          const mobileDt = formatMonitorMobileDatetime(slot.dateIso, slot.dayName, slot.time);
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
                  <span class="mobile-card-datetime">${escapeHtml(mobileDt)}</span>
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
    onConfirm: () => runApiAction("publish-slot", async () => {
      const result = await apiClient.request("/slots", { method: "POST", body: {
        date: dateIso, time, capacity, professor_code: profCode,
      } });
      state.slots.push(mapSlot(result.slot));
      await refreshSafely();
      document.getElementById("ms-prof-code").value = "";
      closeMonitorSlotSheet(false);
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
    }, form),
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
  const slot = bk ? getSlot(bk.slotId) : null;
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
    const slot = getSlot(bk.slotId);
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
  const slot = bk ? getSlot(bk.slotId) : null;
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
  document.getElementById("btn-brand-home").addEventListener("click", (e) => {
    triggerBrandPulse();
    if (!lastInputWasKeyboard) e.currentTarget.blur();
    if (getCurrentUser()) {
      switchView("inicio", true);
    } else {
      switchView("landing");
    }
  });

  const performLogout = () => {
    cancelPendingPrefsSave();
    return runApiAction("logout", async () => {
      await apiClient.request("/auth/logout", { method: "POST" });
      clearRemoteSession();
      closeProfileMenu();
      closeSettingsModal();
      renderTopbar();
      switchView("landing");
      showToast("Sessão encerrada.");
    });
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
  document.getElementById("btn-profile-logout")?.addEventListener("click", performLogout);

  document.getElementById("profile-sheet-backdrop")?.addEventListener("click", () => closeProfileMenu(true));

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#profile-menu-wrap") && !e.target.closest("#profile-dropdown")) {
      closeProfileMenu(false);
    }
    if (!e.target.closest(".bc-select-wrap") && !e.target.closest(".bc-select-popover")) {
      closeAllCustomSelects();
    }
    if (!e.target.closest(".bc-date-wrap") && !e.target.closest(".bc-date-popover")) {
      closeAllCustomDatePickers();
    }
    if (!e.target.closest("#inicio-search-wrap")) {
      closeInicioSearchPopover();
    }
  });

  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!lastInputWasKeyboard) btn.blur();
      if (btn.dataset.view === "agendar") ui.step = 1;
      switchView(btn.dataset.view, true);
    });
  });

  // Tela Início: Barra de comando, atalhos rápidos, cartão Passe e luz especular neutra
  const inicioSearchInput = document.getElementById("inicio-search-input");
  const inicioSearchPopover = document.getElementById("inicio-search-popover");
  inicioSearchInput?.addEventListener("input", (e) => {
    renderInicioSearchPopover(e.target.value);
  });
  inicioSearchInput?.addEventListener("focus", (e) => {
    if (e.target.value.trim()) renderInicioSearchPopover(e.target.value);
  });
  inicioSearchInput?.addEventListener("keydown", (e) => {
    if (!inicioSearchPopover || inicioSearchPopover.classList.contains("is-hidden")) {
      if (e.key === "ArrowDown" && inicioSearchInput.value.trim()) {
        e.preventDefault();
        renderInicioSearchPopover(inicioSearchInput.value);
      }
      return;
    }
    const opts = Array.from(inicioSearchPopover.querySelectorAll("[data-inicio-pick-offering]"));
    if (e.key === "Escape") {
      e.preventDefault();
      closeInicioSearchPopover();
      return;
    }
    if (opts.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      inicioSearchFocusedIdx = (inicioSearchFocusedIdx + 1) % opts.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      inicioSearchFocusedIdx = (inicioSearchFocusedIdx - 1 + opts.length) % opts.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = opts[inicioSearchFocusedIdx] || opts[0];
      if (chosen) openOfferingStep2FromInicio(chosen.dataset.inicioPickOffering);
      return;
    } else {
      return;
    }
    opts.forEach((opt, i) => {
      const active = i === inicioSearchFocusedIdx;
      opt.classList.toggle("is-focused", active);
      opt.setAttribute("aria-selected", String(active));
    });
    opts[inicioSearchFocusedIdx]?.scrollIntoView({ block: "nearest" });
  });

  document.getElementById("view-inicio")?.addEventListener("click", (e) => {
    const pickBtn = e.target.closest("[data-inicio-pick-offering]");
    if (pickBtn) {
      openOfferingStep2FromInicio(pickBtn.dataset.inicioPickOffering);
      return;
    }
    const catalogBtn = e.target.closest("[data-inicio-open-catalog]");
    if (catalogBtn) {
      closeInicioSearchPopover();
      ui.step = 1;
      switchView("agendar", true);
      return;
    }
    const goMonitorFormBtn = e.target.closest("[data-inicio-go-monitor-form]");
    if (goMonitorFormBtn) {
      switchView("monitor", true);
      requestAnimationFrame(() => {
        if (window.innerWidth <= 768) {
          openMonitorSlotSheet();
        } else {
          const target = document.getElementById("ms-date-trigger") || document.getElementById("ms-time");
          target?.scrollIntoView({ behavior: "smooth", block: "center" });
          target?.focus();
        }
      });
      return;
    }
    const goBtn = e.target.closest("[data-inicio-go]");
    if (goBtn) {
      switchView(goBtn.dataset.inicioGo, true);
      return;
    }
    const icsBtn = e.target.closest("[data-inicio-ics]");
    if (icsBtn) {
      downloadIcs(icsBtn.dataset.inicioIcs, icsBtn);
    }
  });

  const inicioPassCard = document.getElementById("inicio-pass-card");
  inicioPassCard?.addEventListener("pointermove", (e) => {
    if (prefersReducedMotion() || document.body.classList.contains("theme-contrast")) return;
    const rect = inicioPassCard.getBoundingClientRect();
    inicioPassCard.style.setProperty("--mx", `${Math.round(e.clientX - rect.left)}px`);
    inicioPassCard.style.setProperty("--my", `${Math.round(e.clientY - rect.top)}px`);
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
    closeMonitorSlotSheet(false);
    const settingsModal = document.getElementById("settings-modal");
    const win = document.querySelector(".settings-window");
    if (settingsModal && !settingsModal.classList.contains("is-hidden")) {
      if (win && win.classList.contains("is-mobile-detail")) {
        win.classList.remove("is-mobile-detail");
        const sidebar = document.querySelector(".settings-sidebar");
        if (sidebar) sidebar.scrollTop = 0;
      }
      return;
    }
    const targetTab = ui.activeSettingsTab && ui.activeSettingsTab !== "atalhos" ? ui.activeSettingsTab : "geral";
    openSettingsModal(targetTab, false);
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

  // Aparência: cores personalizadas e validação de contraste ao vivo
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
  document.getElementById("btn-settings-logout")?.addEventListener("click", performLogout);
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

  // Alternância entre Entrar e Criar conta
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

  document.getElementById("btn-quick-continue")?.addEventListener("click", () => {
    const user = getCurrentUser();
    if (!user) {
      hideQuickAuthStage();
      return;
    }
    hideQuickAuthStage();
    switchView("inicio", true);
  });
  document.getElementById("btn-quick-logout")?.addEventListener("click", performLogout);

  document.getElementById("btn-sso-google")?.addEventListener("click", (e) => {
    triggerGoogleSignIn(e.currentTarget);
  });
  document.getElementById("btn-sso-gennera")?.addEventListener("click", (e) => {
    openGenneraModal(e.currentTarget);
  });
  document.getElementById("btn-close-sso-provider")?.addEventListener("click", () => closeSsoProviderModal(true));
  document.getElementById("sso-provider-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "sso-provider-modal") closeSsoProviderModal(true);
  });

  document.querySelectorAll("[data-google-role]").forEach((btn) => {
    btn.addEventListener("click", () => setGoogleOnboardingRole(btn.dataset.googleRole));
  });
  document.getElementById("auth-stage-google-onboarding")?.addEventListener("submit", handleGoogleOnboardingSubmit);
  document.getElementById("btn-google-cancel")?.addEventListener("click", hideGoogleOnboardingStage);

  document.getElementById("otp-code").addEventListener("input", () => {
    clearOtpErrors();
    document.getElementById("btn-verify-otp").disabled = !getOtpValue();
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
    const picked = btn.dataset.modeFilter;
    if (window.innerWidth <= 768 && picked !== "Todas" && ui.modeFilter === picked) {
      ui.modeFilter = "Todas";
    } else {
      ui.modeFilter = picked;
    }
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

  document.getElementById("btn-step1-mobile-view")?.addEventListener("click", () => {
    ui.step1Layout = ui.step1Layout === "matrix" ? "list" : "matrix";
    document.querySelectorAll("[data-step1-layout]").forEach((b) => {
      const active = b.dataset.step1Layout === ui.step1Layout;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    renderStep1();
  });

  document.getElementById("btn-step1-open-filters")?.addEventListener("click", openStep1FiltersSheet);
  document.getElementById("btn-close-step1-filters")?.addEventListener("click", () => closeStep1FiltersSheet(true));
  document.getElementById("step1-filters-backdrop")?.addEventListener("click", () => closeStep1FiltersSheet(true));

  document.getElementById("filters-sheet-mode-options")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-draft-mode]");
    if (!btn) return;
    step1FilterDraft.mode = btn.dataset.draftMode || "Todas";
    renderStep1FiltersSheetDraft();
  });

  document.getElementById("filters-sheet-subject-options")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-draft-subject]");
    if (!btn) return;
    step1FilterDraft.subject = btn.dataset.draftSubject || "Todas";
    renderStep1FiltersSheetDraft();
  });

  document.getElementById("btn-filters-clear")?.addEventListener("click", () => {
    step1FilterDraft = { mode: "Todas", subject: "Todas" };
    renderStep1FiltersSheetDraft();
  });

  document.getElementById("btn-filters-apply")?.addEventListener("click", applyStep1FiltersDraft);

  document.getElementById("step1-active-filters-row")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove-filter]");
    if (!btn) return;
    const kind = btn.dataset.removeFilter;
    if (kind === "mode" || kind === "all") ui.modeFilter = "Todas";
    if (kind === "subject" || kind === "all") ui.subjectFilter = "Todas";
    renderStep1();
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
      const slot = getSlot(mobileSlotBtn.dataset.mobileMatrixSlot);
      if (!slot) return;
      ui.selectedOfferingId = slot.offeringId;
      ui.selectedDateIso = slot.dateIso;
      ui.selectedSlotId = slot.id;
      setStep(2);
      return;
    }
    const btn = e.target.closest("[data-matrix-slot]");
    if (!btn || btn.disabled) return;
    const slot = getSlot(btn.dataset.matrixSlot);
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
  document.getElementById("btn-back-step2-mobile")?.addEventListener("click", () => setStep(2));

  // Proteção de teclado mobile na Etapa 3: garante campo de dúvida visível acima do rodapé fixo
  const step3ShellEl = document.getElementById("step3-form-shell");
  let step3FocusTimer = null;
  function ensureStep3InputVisible(inputEl) {
    if (!inputEl || window.innerWidth > 768) return;
    if (!document.body.classList.contains("is-mobile-input-focused")) {
      document.body.classList.add("is-mobile-input-focused");
    }
    const actionsBar = step3ShellEl?.querySelector(".step3-actions");
    const rect = inputEl.getBoundingClientRect();
    const vvHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const barRect = actionsBar ? actionsBar.getBoundingClientRect() : null;
    const safeBottom = Math.min(vvHeight, barRect && barRect.top > 0 ? barRect.top : vvHeight) - 16;
    const safeTop = 64;
    if (rect.bottom > safeBottom) {
      window.scrollBy({ top: rect.bottom - safeBottom, behavior: "auto" });
    } else if (rect.top < safeTop) {
      window.scrollBy({ top: rect.top - safeTop, behavior: "auto" });
    }
  }
  const handleStep3ViewportOrInput = () => {
    if (window.innerWidth > 768) return;
    const active = document.activeElement;
    if (active && step3ShellEl?.contains(active) && active.matches?.("input, textarea, select")) {
      ensureStep3InputVisible(active);
    }
  };
  step3ShellEl?.addEventListener("focusin", (e) => {
    if (window.innerWidth > 768) return;
    if (!e.target?.matches?.("input, textarea, select")) return;
    if (step3FocusTimer) clearTimeout(step3FocusTimer);
    document.body.classList.add("is-mobile-input-focused");
    const target = e.target;
    setTimeout(() => ensureStep3InputVisible(target), 80);
    setTimeout(() => ensureStep3InputVisible(target), 300);
  });
  step3ShellEl?.addEventListener("input", (e) => {
    if (window.innerWidth > 768) return;
    if (!e.target?.matches?.("input, textarea, select")) return;
    ensureStep3InputVisible(e.target);
  });
  step3ShellEl?.addEventListener("focusout", () => {
    if (window.innerWidth > 768) return;
    if (step3FocusTimer) clearTimeout(step3FocusTimer);
    step3FocusTimer = setTimeout(() => {
      const active = document.activeElement;
      const stillFocused = Boolean(
        active && step3ShellEl.contains(active) && active.matches?.("input, textarea, select")
      );
      if (!stillFocused) {
        document.body.classList.remove("is-mobile-input-focused");
      }
    }, 120);
  });
  window.visualViewport?.addEventListener("resize", handleStep3ViewportOrInput);
  window.addEventListener("resize", handleStep3ViewportOrInput);
  document.getElementById("btn-s3-switch-account").addEventListener("click", () => {
    state.currentUserId = null;
    saveState();
    renderTopbar();
    switchView("landing");
  });

  // Limpeza automática de erros inline ao digitar
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
      const slot = getSlot(bk.slotId);
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
        onConfirm: () => changeRemoteBookingStatus(bk, "Cancelado",
          `Agendamento ${bk.protocol} cancelado.`, "Confirmado"),
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

  document.getElementById("btn-mobile-open-slot-sheet")?.addEventListener("click", openMonitorSlotSheet);
  document.getElementById("btn-close-monitor-slot-sheet")?.addEventListener("click", () => closeMonitorSlotSheet(true));
  document.getElementById("monitor-slot-sheet-backdrop")?.addEventListener("click", () => closeMonitorSlotSheet(true));

  document.getElementById("form-new-slot").addEventListener("submit", handlePublishNewSlot);
  document.getElementById("monitor-slots-list")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove-slot]");
    if (!btn || btn.disabled) return;
    const slotId = btn.dataset.removeSlot;
    const slot = getSlot(slotId);
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
      onConfirm: () => runApiAction(`slot:${slot.id}`, async () => {
        await apiClient.request(`/slots/${slot.id}`, { method: "DELETE" });
        state.slots = state.slots.filter((item) => item.id !== slot.id);
        await refreshSafely();
        renderCurrentData();
        showToast(`Horário removido (${slot.dayName}, ${slot.time.split(" - ")[0]}).`, null, "success");
      }),
    });
  });

  document.getElementById("monitor-bookings-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-complete-bk]");
    if (!btn) return;
    const bk = state.bookings.find((b) => b.id === btn.dataset.completeBk);
    if (!bk) return;
    const stu = getUserById(bk.studentId);
    const slot = getSlot(bk.slotId);

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
      onConfirm: () => changeRemoteBookingStatus(bk, "Concluído",
        `Atendimento ${bk.protocol} concluído.`, "Confirmado"),
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const ssoProviderModal = document.getElementById("sso-provider-modal");
      if (ssoProviderModal && !ssoProviderModal.classList.contains("is-hidden")) {
        trapFocusInModal(e, ssoProviderModal);
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
      const filtersSheet = document.getElementById("step1-filters-sheet");
      if (filtersSheet && !filtersSheet.classList.contains("is-hidden") && window.innerWidth <= 768) {
        trapFocusInModal(e, filtersSheet);
        return;
      }
      const monitorSlotForm = document.getElementById("form-new-slot");
      if (monitorSlotForm && monitorSlotForm.classList.contains("is-mobile-sheet-open") && window.innerWidth <= 768) {
        trapFocusInModal(e, monitorSlotForm);
        return;
      }
      const profileSheet = document.getElementById("profile-dropdown");
      if (profileSheet && !profileSheet.classList.contains("is-hidden") && profileSheet.classList.contains("is-mobile-sheet")) {
        trapFocusInModal(e, profileSheet);
        return;
      }
    }
    if (e.key === "Escape") {
      if (document.querySelector(".bc-date-wrap.is-open")) {
        const openDateWrap = document.querySelector(".bc-date-wrap.is-open");
        const dateTrigger = openDateWrap?.querySelector(".bc-date-trigger");
        closeAllCustomDatePickers();
        dateTrigger?.focus();
        return;
      }
      if (document.querySelector(".bc-select-wrap.is-open")) {
        const openSelectWrap = document.querySelector(".bc-select-wrap.is-open");
        const selectTrigger = openSelectWrap?.querySelector(".bc-select-trigger");
        closeAllCustomSelects();
        selectTrigger?.focus();
        return;
      }
      const ssoProviderModal = document.getElementById("sso-provider-modal");
      if (ssoProviderModal && !ssoProviderModal.classList.contains("is-hidden")) {
        closeSsoProviderModal(true);
        return;
      }
      const confirmModal = document.getElementById("confirm-modal");
      if (confirmModal && !confirmModal.classList.contains("is-hidden")) {
        closeConfirmDialog();
        return;
      }
      const filtersSheet = document.getElementById("step1-filters-sheet");
      if (filtersSheet && !filtersSheet.classList.contains("is-hidden") && window.innerWidth <= 768) {
        closeStep1FiltersSheet(true);
        return;
      }
      const monitorSlotForm = document.getElementById("form-new-slot");
      if (monitorSlotForm && monitorSlotForm.classList.contains("is-mobile-sheet-open") && window.innerWidth <= 768) {
        closeMonitorSlotSheet(true);
        return;
      }
      const faqModal = document.getElementById("faq-modal");
      if (faqModal && !faqModal.classList.contains("is-hidden")) {
        closeFaqModal();
        return;
      }
      const settingsModal = document.getElementById("settings-modal");
      if (settingsModal && !settingsModal.classList.contains("is-hidden")) {
        const win = document.querySelector(".settings-window");
        if (window.innerWidth <= 768 && win && win.classList.contains("is-mobile-detail")) {
          win.classList.remove("is-mobile-detail");
          return;
        }
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
    if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
      if (ui.activeView === "inicio") {
        e.preventDefault();
        document.getElementById("inicio-search-input")?.focus();
      } else if (ui.activeView === "agendar" && ui.step === 1) {
        e.preventDefault();
        document.getElementById("input-search")?.focus();
      }
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

const customDateRegistry = new WeakMap();

function positionFixedPopover(trigger, popover, desiredWidth, maxDesiredHeight = 248) {
  const rect = trigger.getBoundingClientRect();
  const margin = 12;
  const popWidth = Math.min(window.innerWidth - margin * 2, Math.max(rect.width, desiredWidth));

  // Mede o origin real do containing block sem animação ativa (compensa filter em html[data-cvd] ou body scroll-locked)
  const prevVis = popover.style.visibility;
  const prevAnim = popover.style.animation;
  popover.style.animation = "none";
  popover.style.visibility = "hidden";
  popover.style.top = "0px";
  popover.style.left = "0px";
  popover.style.bottom = "auto";
  popover.style.width = `${Math.round(popWidth)}px`;
  void popover.offsetHeight;
  const originRect = popover.getBoundingClientRect();
  const offsetX = Math.abs(originRect.left) <= 2000 ? originRect.left : 0;
  const offsetY = Math.abs(originRect.top) <= 2000 ? originRect.top : 0;

  const targetLeft =
    rect.left + popWidth <= window.innerWidth - margin
      ? Math.max(margin, rect.left)
      : Math.max(margin, rect.right - popWidth);

  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const contentHeight = popover.scrollHeight || 220;

  let targetTop;
  let maxHeight;
  if (spaceBelow >= Math.min(contentHeight, maxDesiredHeight) || spaceBelow >= spaceAbove) {
    targetTop = rect.bottom + 6;
    maxHeight = Math.max(120, Math.min(maxDesiredHeight, Math.floor(spaceBelow)));
  } else {
    maxHeight = Math.max(120, Math.min(maxDesiredHeight, Math.floor(spaceAbove)));
    const actualHeight = Math.min(contentHeight, maxHeight);
    targetTop = Math.max(margin, rect.top - actualHeight - 6);
  }

  popover.style.left = `${Math.round(targetLeft - offsetX)}px`;
  popover.style.top = `${Math.round(targetTop - offsetY)}px`;
  popover.style.bottom = "auto";
  popover.style.maxHeight = `${maxHeight}px`;
  popover.style.visibility = prevVis === "hidden" ? "" : prevVis;
  popover.style.animation = prevAnim;
}

function positionCustomPopover(trigger, popover) {
  positionFixedPopover(trigger, popover, 280, 248);
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
  trigger.setAttribute("role", "combobox");
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  const listboxId = selectEl.id ? `${selectEl.id}-listbox` : `bc-listbox-${Math.random().toString(36).slice(2, 8)}`;
  trigger.setAttribute("aria-controls", listboxId);

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
  popover.id = listboxId;
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
    closeAllCustomDatePickers();
    wrap.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    popover.style.visibility = "hidden";
    document.body.appendChild(popover);
    popover.classList.remove("is-hidden");
    positionCustomPopover(trigger, popover);
    popover.style.visibility = "";

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

function closeAllCustomDatePickers(exceptWrap = null) {
  document.querySelectorAll(".bc-date-wrap.is-open").forEach((wrap) => {
    if (wrap === exceptWrap) return;
    wrap.classList.remove("is-open");
    const trigger = wrap.querySelector(".bc-date-trigger");
    const popover = wrap._bcDatePopover || wrap.querySelector(".bc-date-popover");
    trigger?.setAttribute("aria-expanded", "false");
    if (popover) {
      popover.classList.add("is-hidden");
      popover.style.top = "";
      popover.style.bottom = "";
      popover.style.left = "";
      popover.style.width = "";
      popover.style.maxHeight = "";
      popover.style.visibility = "";
      if (popover.parentNode !== wrap) {
        wrap.appendChild(popover);
      }
    }
  });
}

function parseIsoDateParts(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
}

function formatIsoFromParts(year, monthIdx, day) {
  const mm = String(monthIdx + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function formatCustomDateLabel(iso) {
  const parts = parseIsoDateParts(iso);
  if (!parts) return "Selecione a data";
  const d = new Date(parts.year, parts.month, parts.day);
  const wk = FULL_WEEKDAYS[d.getDay()] || "";
  const shortWk = wk ? wk.slice(0, 3) : "";
  return `${String(parts.day).padStart(2, "0")}/${String(parts.month + 1).padStart(2, "0")}/${parts.year}${
    shortWk ? ` · ${shortWk}` : ""
  }`;
}

function upgradeCustomDatePicker(inputEl) {
  if (!inputEl || customDateRegistry.has(inputEl)) return;

  const minIso = inputEl.getAttribute("min") || "2026-11-18";
  const maxIso = inputEl.getAttribute("max") || "2026-12-31";
  const initialParts = parseIsoDateParts(inputEl.value) || parseIsoDateParts(minIso) || { year: 2026, month: 10, day: 28 };
  let viewYear = initialParts.year;
  let viewMonth = initialParts.month;

  const wrap = document.createElement("div");
  wrap.className = "bc-date-wrap";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "bc-date-trigger";
  trigger.id = `${inputEl.id}-trigger`;
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-expanded", "false");

  const labelElRef = inputEl.id ? document.querySelector(`label[for="${inputEl.id}"]`) : null;
  if (labelElRef) {
    if (!labelElRef.id) labelElRef.id = `label-${inputEl.id}`;
    trigger.setAttribute("aria-labelledby", labelElRef.id);
    labelElRef.addEventListener("click", (ev) => {
      ev.preventDefault();
      trigger.focus();
      trigger.click();
    });
  }

  const triggerMain = document.createElement("span");
  triggerMain.className = "bc-date-trigger-main";

  const iconSpan = document.createElement("span");
  iconSpan.className = "bc-date-icon";
  iconSpan.setAttribute("aria-hidden", "true");
  iconSpan.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

  const labelSpan = document.createElement("span");
  labelSpan.className = "bc-date-label";
  triggerMain.appendChild(iconSpan);
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
  popover.className = "bc-date-popover is-hidden";
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-label", "Selecionar data");

  const head = document.createElement("div");
  head.className = "bc-date-head";

  const monthLabel = document.createElement("p");
  monthLabel.className = "bc-date-month-label";

  const navWrap = document.createElement("div");
  navWrap.className = "bc-date-nav";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "bc-date-nav-btn";
  prevBtn.setAttribute("aria-label", "Mês anterior");
  prevBtn.textContent = "‹";

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "bc-date-nav-btn";
  nextBtn.setAttribute("aria-label", "Próximo mês");
  nextBtn.textContent = "›";

  navWrap.appendChild(prevBtn);
  navWrap.appendChild(nextBtn);
  head.appendChild(monthLabel);
  head.appendChild(navWrap);

  const weekdaysEl = document.createElement("div");
  weekdaysEl.className = "bc-date-weekdays";
  weekdaysEl.setAttribute("aria-hidden", "true");
  weekdaysEl.innerHTML = "<span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>";

  const gridEl = document.createElement("div");
  gridEl.className = "bc-date-grid";
  gridEl.setAttribute("role", "grid");
  gridEl.setAttribute("aria-label", "Dias disponíveis");

  popover.appendChild(head);
  popover.appendChild(weekdaysEl);
  popover.appendChild(gridEl);

  const MONTH_NAMES_PT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const syncLabel = () => {
    labelSpan.textContent = formatCustomDateLabel(inputEl.value);
  };

  const renderCalendar = () => {
    monthLabel.textContent = `${MONTH_NAMES_PT[viewMonth]} ${viewYear}`;
    const minParts = parseIsoDateParts(minIso);
    const maxParts = parseIsoDateParts(maxIso);
    if (minParts) {
      prevBtn.disabled = viewYear < minParts.year || (viewYear === minParts.year && viewMonth <= minParts.month);
    }
    if (maxParts) {
      nextBtn.disabled = viewYear > maxParts.year || (viewYear === maxParts.year && viewMonth >= maxParts.month);
    }

    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    let html = "";
    for (let i = 0; i < firstWeekday; i += 1) {
      html += `<span class="bc-date-day-empty" aria-hidden="true"></span>`;
    }
    for (let day = 1; day <= totalDays; day += 1) {
      const iso = formatIsoFromParts(viewYear, viewMonth, day);
      const isDisabled = iso < minIso || iso > maxIso;
      const isSelected = iso === inputEl.value;
      html += `<button type="button" class="bc-date-day${isSelected ? " is-selected" : ""}" data-date-iso="${iso}" aria-pressed="${isSelected}" ${isDisabled ? "disabled" : ""}>${day}</button>`;
    }
    gridEl.innerHTML = html;
  };

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderCalendar();
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    renderCalendar();
  });

  gridEl.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("[data-date-iso]");
    if (!btn || btn.disabled) return;
    inputEl.value = btn.dataset.dateIso;
    syncLabel();
    closeAllCustomDatePickers();
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
    trigger.focus();
  });

  gridEl.addEventListener("keydown", (e) => {
    const enabled = Array.from(gridEl.querySelectorAll("[data-date-iso]:not(:disabled)"));
    const curIdx = enabled.indexOf(document.activeElement);
    if (e.key === "Escape") {
      e.preventDefault();
      closeAllCustomDatePickers();
      trigger.focus();
      return;
    }
    if (curIdx === -1 || enabled.length === 0) return;
    let target = null;
    if (e.key === "ArrowRight") target = enabled[Math.min(enabled.length - 1, curIdx + 1)];
    if (e.key === "ArrowLeft") target = enabled[Math.max(0, curIdx - 1)];
    if (e.key === "ArrowDown") target = enabled[Math.min(enabled.length - 1, curIdx + 7)];
    if (e.key === "ArrowUp") target = enabled[Math.max(0, curIdx - 7)];
    if (e.key === "Home") target = enabled[0];
    if (e.key === "End") target = enabled[enabled.length - 1];
    if (target) {
      e.preventDefault();
      target.focus();
    }
  });

  inputEl.classList.add("bc-date-native-hidden");
  inputEl.setAttribute("tabindex", "-1");
  inputEl.setAttribute("aria-hidden", "true");
  inputEl.parentNode.insertBefore(wrap, inputEl);
  wrap.appendChild(inputEl);
  wrap.appendChild(trigger);
  wrap.appendChild(popover);
  wrap._bcDatePopover = popover;

  const openDatePopover = (viaKeyboard = false) => {
    closeAllCustomSelects();
    closeAllCustomDatePickers(wrap);
    const p = parseIsoDateParts(inputEl.value);
    if (p) {
      viewYear = p.year;
      viewMonth = p.month;
    }
    renderCalendar();
    wrap.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    popover.style.visibility = "hidden";
    document.body.appendChild(popover);
    popover.classList.remove("is-hidden");
    positionFixedPopover(trigger, popover, 286, 340);
    popover.style.visibility = "";
    if (viaKeyboard) {
      const sel = popover.querySelector(".bc-date-day.is-selected") || popover.querySelector(".bc-date-day:not(:disabled)");
      sel?.focus();
    }
  };

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (wrap.classList.contains("is-open")) {
      closeAllCustomDatePickers();
    } else {
      openDatePopover(false);
    }
  });

  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDatePopover(true);
    }
  });

  inputEl.addEventListener("change", syncLabel);
  customDateRegistry.set(inputEl, { wrap, trigger, labelEl: labelSpan, popover, syncLabel });
  syncLabel();
}

function initCustomDatePickers() {
  document.querySelectorAll('input[type="date"][data-custom-date="true"]').forEach(upgradeCustomDatePicker);
}

function initCustomSelects() {
  document.querySelectorAll('select[data-custom-select="true"]').forEach(upgradeCustomSelect);
  initCustomDatePickers();

  window.addEventListener(
    "scroll",
    (e) => {
      if (e.target?.closest?.(".bc-select-popover") || e.target?.closest?.(".bc-date-popover")) return;
      const openWrap = document.querySelector(".bc-select-wrap.is-open");
      if (openWrap) {
        const trigger = openWrap.querySelector(".bc-select-trigger");
        const popover = openWrap._bcPopover;
        if (trigger && popover) positionCustomPopover(trigger, popover);
      }
      const openDate = document.querySelector(".bc-date-wrap.is-open");
      if (openDate) {
        const trigger = openDate.querySelector(".bc-date-trigger");
        const popover = openDate._bcDatePopover;
        if (trigger && popover) positionFixedPopover(trigger, popover, 286, 340);
      }
    },
    true
  );

  window.addEventListener("resize", () => {
    clearToastWidthMorph(document.getElementById("toast"));
    if (getPrefs().vlibras) positionVlibrasShadowAccess();
    syncSearchPlaceholder();
    if (ui.activeView === "agendar") renderStepper();
    if (window.innerWidth > 768) {
      closeMonitorSlotSheet(false);
      closeStep1FiltersSheet(false);
    }
    if (window.innerWidth <= 768 && ui.activeSettingsTab === "atalhos") {
      setSettingsTab("geral");
    }
    syncAllSlidingIndicators(true);
    const dd = document.getElementById("profile-dropdown");
    if (dd && !dd.classList.contains("is-hidden")) {
      const wantMobile = isMobileSheetViewport();
      if (wantMobile !== dd.classList.contains("is-mobile-sheet")) {
        openProfileMenu();
      }
    }
    syncMobileChrome();
    syncBodyScrollLock();
    const openWrap = document.querySelector(".bc-select-wrap.is-open");
    if (openWrap) {
      const trigger = openWrap.querySelector(".bc-select-trigger");
      const popover = openWrap._bcPopover;
      if (trigger && popover) positionCustomPopover(trigger, popover);
    }
    const openDate = document.querySelector(".bc-date-wrap.is-open");
    if (openDate) {
      const trigger = openDate.querySelector(".bc-date-trigger");
      const popover = openDate._bcDatePopover;
      if (trigger && popover) positionFixedPopover(trigger, popover, 286, 340);
    }
  });
}

// Inicialização
bindEvents();
initCustomSelects();
syncSearchPlaceholder();
applyThemeAndA11y();
renderTopbar();
startPhraseCarousel();

document.getElementById("btn-api-retry").addEventListener("click", () => runApiAction("refresh", async () => {
  if (!getCurrentUser()) await bootstrapRemote();
  else {
    setApiStatus("Atualizando seus dados…", true);
    await refreshSafely();
    renderCurrentData();
  }
}));
async function refreshOnReturn() {
  if (document.hidden || !getCurrentUser() || pendingApiActions.size || Date.now() - lastRemoteRefresh < 15000) return;
  await refreshSafely();
  renderCurrentData();
}
window.addEventListener("focus", refreshOnReturn);
document.addEventListener("visibilitychange", refreshOnReturn);
setInterval(refreshOnReturn, 30000);
runApiAction("bootstrap", bootstrapRemote, document.getElementById("form-login"));
