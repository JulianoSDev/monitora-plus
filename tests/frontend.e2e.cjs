const { chromium, request } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const screenshotDir = path.join(root, 'work', 'e2e');
const origin = process.env.MONITORA_E2E_ORIGIN || 'https://julianosdev.github.io/monitora-plus/';
const api = process.env.MONITORA_E2E_API_URL || require('node:fs').readFileSync(path.join(root, 'api-config.js'), 'utf8').match(/MONITORA_API_URL = "([^"]+)"/)[1];
const codes = { 'off-ihc': process.env.MONITORA_E2E_PROFESSOR_CODE };
if (!codes['off-ihc']) throw new Error('Defina MONITORA_E2E_PROFESSOR_CODE para a API de demonstração.');
const password = crypto.randomBytes(16).toString('hex');
const suffix = String(Date.now()).slice(-8);
const accounts = [
  { name: 'Monitor Teste Integracao', ra: '81' + suffix, email: `monitor${suffix}@example.org`, role: 'monitor' },
  { name: 'Estudante Teste Integracao', ra: '82' + suffix, email: `aluno${suffix}@example.org`, role: 'student' },
];
const slots = [];
const errors = [];
let browser;

async function prepare(page, expectConnected = true) {
  page.on('pageerror', error => errors.push(error.message));
  if (process.env.MONITORA_E2E_SOURCE === '1') await page.route(origin + '**', async route => {
    const relative = new URL(route.request().url()).pathname.replace('/monitora-plus/', '') || 'index.html';
    if (relative === 'api-config.js') return route.fulfill({ contentType: 'text/javascript', body: 'window.MONITORA_API_URL = ' + JSON.stringify(api) + ';' });
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) return route.abort();
    try { await route.fulfill({ path: target }); } catch { await route.abort(); }
  });
  await page.goto(origin);
  await page.waitForFunction(connected => pendingApiActions.size === 0 && (!connected || OFFERINGS.length === 6), expectConnected);
  assert.equal(await page.evaluate(() => getCurrentUser()), null);
}

async function register(page, account) {
  await page.locator('#btn-link-to-register').click();
  if (account.role === 'monitor') await page.locator('[data-reg-role="monitor"]').click();
  await page.locator('#reg-name').fill(account.name);
  await page.locator('#reg-ra').fill(account.ra);
  await page.locator('#reg-email').fill(account.email);
  await page.locator('#reg-password').fill(password);
  if (account.role === 'monitor') {
    await page.locator('#reg-subject').selectOption('off-ihc', { force: true });
    await page.locator('#btn-register-next').click();
    await page.locator('#otp-code').fill(codes['off-ihc']);
    await page.locator('#btn-verify-otp').click();
  } else await page.locator('#btn-register-next').click();
  await page.waitForFunction(() => ui.activeView === 'inicio' && pendingApiActions.size === 0, null, { timeout: 30000 });
  assert.equal(await page.evaluate(() => getCurrentUser().role), account.role);
}

async function cleanup() {
  for (const account of accounts.slice().reverse()) {
    const client = await request.newContext({ baseURL: api });
    try {
      const login = await client.post(api + '/auth/login', { data: { identifier: account.ra, password } });
      if (!login.ok()) continue;
      const csrf = (await login.json()).csrf_token;
      const headers = { 'X-CSRF-TOKEN': csrf };
      if (account.role === 'monitor') for (const slot of slots) await client.delete(api + '/slots/' + slot, { headers });
      await client.delete(api + '/auth/me', { headers });
    } finally { await client.dispose(); }
  }
}

(async () => {
  await fs.mkdir(screenshotDir, { recursive: true });
  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const monitorContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const studentContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const monitor = await monitorContext.newPage();
  const student = await studentContext.newPage();
  await student.addInitScript(() => localStorage.setItem('monitoraplus_v6_state', JSON.stringify({
    users: [{ id: 'fake', name: 'Fake Account', password: 'plaintext' }], slots: [], bookings: [], currentUserId: 'fake',
    prefs: { reducedMotion: true },
  })));
  await prepare(monitor);
  await register(monitor, accounts[0]);
  await monitor.evaluate(() => switchView('monitor'));
  for (let index = 0; index < 2; index++) {
    const date = new Date(); date.setDate(date.getDate() + 150 + Number(suffix.slice(-2)) + index);
    await monitor.locator('#ms-date').fill(date.toISOString().slice(0, 10), { force: true });
    await monitor.locator('#ms-time').selectOption('14:00 - 14:40', { force: true });
    await monitor.locator('#ms-capacity').fill('3');
    await monitor.locator('#ms-prof-code').fill(codes['off-ihc']);
    await monitor.locator('#form-new-slot button[type="submit"]').click();
    const published = monitor.waitForResponse(response => response.url() === api + '/slots' && response.request().method() === 'POST');
    await monitor.locator('#btn-confirm-proceed').click();
    const response = await published;
    assert.equal(response.status(), 201, await response.text());
    const slotId = String((await response.json()).slot.id);
    slots.push(slotId);
    await monitor.waitForFunction(id => state.slots.some(slot => slot.id === id) && pendingApiActions.size === 0, slotId);
  }
  await prepare(student);
  await register(student, accounts[1]);
  console.log('PASS: real HTTPS monitor/student registration, private code and slot publishing');
  await student.reload();
  await student.waitForFunction(() => Boolean(getCurrentUser()) && !document.getElementById('auth-stage-quick').classList.contains('is-hidden') && pendingApiActions.size === 0);
  await student.locator('#btn-quick-continue').click();
  await student.waitForFunction(() => ui.activeView === 'inicio' && pendingApiActions.size === 0);
  assert.equal(await student.evaluate(() => localStorage.getItem('monitoraplus_v6_state')), null);
  const stored = await student.evaluate(() => JSON.parse(localStorage.getItem('monitoraplus_v7_preferences') || '{}'));
  assert.ok(!('users' in stored) && !('bookings' in stored));
  console.log('PASS: cookie session restored via quick-continue card on reload; legacy credentials removed');
  await student.evaluate(slot => {
    ui.selectedOfferingId = 'off-ihc'; ui.selectedSlotId = slot; ui.selectedDateIso = getSlot(slot).dateIso;
    ui.step = 3; switchView('agendar');
  }, slots[0]);
  await student.locator('#s3-topic').fill('Duvida sobre heuristicas de usabilidade');
  await student.locator('#btn-s3-submit').click();
  let conflictReturned = false;
  const rejectOnce = async route => {
    if (route.request().method() === 'POST' && !conflictReturned) {
      conflictReturned = true;
      await route.fulfill({ status: 409, contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': 'https://julianosdev.github.io', 'Access-Control-Allow-Credentials': 'true' },
        body: JSON.stringify({ error: 'Esta vaga acabou de ser preenchida.' }) });
    } else await route.continue();
  };
  await student.route(api + '/schedules', rejectOnce);
  await student.locator('#btn-confirm-proceed').click();
  await student.waitForFunction(() => pendingApiActions.size === 0);
  assert.equal(await student.evaluate(() => ui.step3Completed), false);
  assert.equal(await student.evaluate(() => state.bookings.length), 0);
  assert.match(await student.locator('#s3-topic').inputValue(), /heuristicas/);
  await student.unroute(api + '/schedules', rejectOnce);
  await student.locator('#btn-s3-submit').click();
  await student.locator('#btn-confirm-proceed').click();
  await student.waitForFunction(() => ui.step3Completed && pendingApiActions.size === 0);
  const booking = await student.evaluate(() => state.bookings[0]);
  assert.match(booking.protocol, /^#MON-2026-/);
  await student.evaluate(() => switchView('agendamentos'));
  const downloaded = student.waitForEvent('download');
  await student.locator(`[data-ics="${booking.id}"]`).click();
  const calendar = await downloaded;
  assert.match(await fs.readFile(await calendar.path(), 'utf8'), /BEGIN:VEVENT/);
  await student.screenshot({ path: path.join(screenshotDir, 'student-mobile.png'), fullPage: true });
  await monitor.evaluate(async () => { await refreshSafely(); switchView('monitor'); });
  await monitor.locator(`[data-complete-bk="${booking.id}"]`).click();
  await monitor.locator('#btn-confirm-proceed').click();
  await monitor.waitForFunction(id => state.bookings.find(b => b.id === id)?.status === 'Concluído' && pendingApiActions.size === 0, booking.id);
  await monitor.locator('#toast-undo-btn').click();
  await monitor.waitForFunction(id => state.bookings.find(b => b.id === id)?.status === 'Confirmado' && pendingApiActions.size === 0, booking.id);
  await student.locator(`[data-reschedule-bk="${booking.id}"]`).click();
  await student.evaluate(slot => { ui.selectedSlotId = slot; ui.selectedDateIso = getSlot(slot).dateIso; setStep(3); }, slots[1]);
  await student.locator('#s3-topic').fill('Reagendamento para revisar heuristicas');
  await student.locator('#btn-s3-submit').click();
  await student.locator('#btn-confirm-proceed').click();
  await student.waitForFunction(() => ui.step3Completed && pendingApiActions.size === 0);
  assert.equal(await student.evaluate(id => state.bookings.find(b => b.id === id).protocol, booking.id), booking.protocol);
  await student.locator('#toast-undo-btn').click();
  await student.waitForFunction(({ id, slot }) => state.bookings.find(b => b.id === id)?.slotId === slot && pendingApiActions.size === 0,
    { id: booking.id, slot: slots[0] });
  await student.locator(`[data-reschedule-bk="${booking.id}"]`).click();
  await student.evaluate(slot => { ui.selectedSlotId = slot; ui.selectedDateIso = getSlot(slot).dateIso; setStep(3); }, slots[1]);
  await student.locator('#s3-topic').fill('Reagendamento para revisar heuristicas');
  await student.locator('#btn-s3-submit').click();
  await student.locator('#btn-confirm-proceed').click();
  await student.waitForFunction(() => ui.step3Completed && pendingApiActions.size === 0);
  await student.evaluate(() => switchView('agendamentos'));
  await student.locator(`[data-cancel-bk="${booking.id}"]`).click();
  await student.locator('#btn-confirm-proceed').click();
  await student.waitForFunction(id => state.bookings.find(b => b.id === id)?.status === 'Cancelado' && pendingApiActions.size === 0, booking.id);
  await student.locator('#toast-undo-btn').click();
  await student.waitForFunction(id => state.bookings.find(b => b.id === id)?.status === 'Confirmado' && pendingApiActions.size === 0, booking.id);
  console.log('PASS: booking, monitor completion + undo, rescheduling with same protocol, cancellation + undo');
  await monitor.evaluate(async () => { await refreshSafely(); switchView('monitor'); ui.monitorTab = 'slots'; renderMonitorPanel(); });
  await monitor.locator(`[data-remove-slot="${slots[0]}"]`).click();
  await monitor.locator('#btn-confirm-proceed').click();
  await monitor.waitForFunction(id => !state.slots.some(s => s.id === id) && pendingApiActions.size === 0, slots[0]);
  assert.equal(await monitor.locator(`[data-remove-slot="${slots[1]}"]`).isDisabled(), true);
  await monitor.screenshot({ path: path.join(screenshotDir, 'monitor-desktop.png'), fullPage: true });
  await student.evaluate(() => openProfileMenu());
  await student.locator('#btn-profile-logout').click();
  await student.waitForFunction(() => !getCurrentUser() && pendingApiActions.size === 0);
  await student.reload();
  await student.waitForFunction(() => pendingApiActions.size === 0);
  assert.equal(await student.evaluate(() => getCurrentUser()), null);
  await student.locator('#login-identifier').fill(accounts[1].ra);
  await student.locator('#login-password').fill('senha-incorreta');
  await student.locator('#form-login button[type="submit"]').click();
  await student.waitForFunction(() => pendingApiActions.size === 0);
  assert.equal(await student.evaluate(() => getCurrentUser()), null);
  assert.equal(await student.locator('#login-password').getAttribute('aria-invalid'), 'true');
  await student.locator('#login-password').fill(password);
  await student.locator('#form-login button[type="submit"]').click();
  await student.waitForFunction(() => ui.activeView === 'inicio' && pendingApiActions.size === 0);
  const expireSession = route => route.fulfill({ status: 401, contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': 'https://julianosdev.github.io', 'Access-Control-Allow-Credentials': 'true' },
    body: JSON.stringify({ error: 'Sua sessão expirou.' }) });
  await student.route(api + '/slots', expireSession);
  await student.evaluate(async () => { await refreshSafely(); });
  assert.equal(await student.evaluate(() => getCurrentUser()), null);
  assert.equal(await student.evaluate(() => ui.activeView), 'landing');
  await student.unroute(api + '/slots', expireSession);
  await student.locator('#login-identifier').fill(accounts[1].ra);
  await student.locator('#login-password').fill(password);
  await student.locator('#form-login button[type="submit"]').click();
  await student.waitForFunction(() => ui.activeView === 'inicio' && pendingApiActions.size === 0);
  await student.evaluate(() => confirmDeleteAccount());
  await student.locator('#btn-confirm-proceed').click();
  await student.waitForFunction(() => !getCurrentUser() && pendingApiActions.size === 0);
  const deletedLogin = await studentContext.request.post(api + '/auth/login', { data: { identifier: accounts[1].ra, password } });
  assert.equal(deletedLogin.status(), 401);
  console.log('PASS: 409 preserves the draft without a fake booking; wrong password and expired session handled');
  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const offline = await offlineContext.newPage();
  const unavailable = route => route.abort('failed');
  await offline.route(api + '/**', unavailable);
  await prepare(offline, false);
  assert.match(await offline.locator('#api-status-text').textContent(), /conectar/);
  assert.equal(await offline.evaluate(() => state.slots.length + state.bookings.length + state.users.length), 0);
  await offline.unroute(api + '/**', unavailable);
  await offline.locator('#btn-api-retry').click();
  await offline.waitForFunction(() => OFFERINGS.length === 6 && pendingApiActions.size === 0);
  assert.equal(await offline.locator('#api-status').isVisible(), false);
  await offlineContext.close();
  console.log('PASS: calendar download, account deletion on server and connection failure/retry');
  console.log('PASS: slot removal/confirmed-slot protection and server logout survives reload');
  assert.deepEqual(errors, []);
  console.log('PASS: no JavaScript page errors; desktop and mobile screenshots saved');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await cleanup();
  if (browser) await browser.close();
});
