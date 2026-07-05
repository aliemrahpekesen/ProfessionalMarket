// E2E smoke: admin login → create professional → record market value →
// create rumor → confirm rumor → verify public pages reflect everything.
import { chromium } from "playwright";

const BASE = "http://localhost:3100";
const results = [];
function check(name, cond, extra = "") {
  results.push({ name, ok: Boolean(cond), extra });
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
page.setDefaultTimeout(15000);

try {
  // 1. login redirect
  await page.goto(`${BASE}/admin`);
  check("unauthenticated /admin redirects to login", page.url().includes("/admin/login"));

  // 2. wrong credentials
  await page.fill('input[name="email"]', "admin@professionalmarket.dev");
  await page.fill('input[name="password"]', "wrong-password");
  await page.click('button:has-text("Sign in")');
  await page.waitForURL(/error=1/);
  await page.waitForSelector("text=Invalid email or password");
  check("wrong password shows error", true);

  // 3. correct login
  await page.fill('input[name="email"]', "admin@professionalmarket.dev");
  await page.fill('input[name="password"]', "change-me-please");
  await page.click('button:has-text("Sign in")');
  await page.waitForURL(`${BASE}/admin`);
  check("login lands on dashboard", (await page.textContent("body")).includes("Total market cap"));

  // 4. create professional
  await page.goto(`${BASE}/admin/professionals/new`);
  await page.fill('input[name="firstName"]', "Testa");
  await page.fill('input[name="lastName"]', "Verifier");
  await page.fill('input[name="role"]', "QA Automation Lead");
  await page.selectOption('select[name="roleGroup"]', "ENGINEERING");
  await page.selectOption('select[name="seniority"]', "STAFF");
  await page.fill('input[name="birthDate"]', "1991-03-14");
  await page.fill('input[name="nationality"]', "TR");
  await page.fill('input[name="city"]', "Istanbul");
  await page.fill('input[name="initialMarketValue"]', "175000");
  await page.fill('input[name="skills"]', "Playwright,TypeScript");
  await page.click('button:has-text("Create professional")');
  await page.waitForURL(`${BASE}/admin/professionals`);
  check("professional created appears in admin list", (await page.textContent("body")).includes("Testa Verifier"));

  // 5. public profile exists with initial value
  await page.goto(`${BASE}/professionals/testa-verifier`);
  const profileBody = await page.textContent("body");
  check("public profile renders", profileBody.includes("QA Automation Lead"));
  check("initial market value shown", profileBody.includes("$175k"));
  check("free agent shown", profileBody.includes("Free agent"));

  // 6. record a market value bump
  await page.goto(`${BASE}/admin/market-values/new`);
  await page.selectOption('select[name="professionalId"]', { label: /Testa Verifier/.source ? undefined : undefined }).catch(() => {});
  // select by matching option text
  const options = await page.$$eval('select[name="professionalId"] option', (opts) =>
    opts.map((o) => ({ value: o.value, text: o.textContent })));
  const testa = options.find((o) => o.text.includes("Testa Verifier"));
  await page.selectOption('select[name="professionalId"]', testa.value);
  await page.fill('input[name="value"]', "210000");
  await page.fill('input[name="recordedAt"]', "2026-07-05");
  await page.fill('input[name="note"]', "Post-review bump");
  await page.click('button:has-text("Add record")');
  await page.waitForURL(`${BASE}/admin/market-values`);
  await page.goto(`${BASE}/professionals/testa-verifier`);
  check("market value updated on profile", (await page.textContent("body")).includes("$210k"));

  // 7. create rumor and confirm it
  await page.goto(`${BASE}/admin/rumors/new`);
  const proOpts = await page.$$eval('select[name="professionalId"] option', (opts) =>
    opts.map((o) => ({ value: o.value, text: o.textContent })));
  await page.selectOption('select[name="professionalId"]', proOpts.find((o) => o.text.includes("Testa Verifier")).value);
  const targetOpts = await page.$$eval('select[name="targetCompanyId"] option', (opts) =>
    opts.map((o) => ({ value: o.value, text: o.textContent })));
  const nexora = targetOpts.find((o) => o.text.includes("Nexora"));
  await page.selectOption('select[name="targetCompanyId"]', nexora.value);
  await page.selectOption('select[name="status"]', "HOT");
  await page.fill('input[name="probability"]', "85");
  await page.click('button:has-text("Create rumor")');
  await page.waitForURL(`${BASE}/admin/rumors`);
  check("rumor appears in admin list", (await page.textContent("body")).includes("Testa Verifier"));

  // confirm it (accept dialog)
  page.once("dialog", (d) => d.accept());
  const row = page.locator("tr", { hasText: "Testa Verifier" }).first();
  await row.locator('button:has-text("Confirm")').click();
  await page.waitForLoadState("networkidle");
  await page.goto(`${BASE}/professionals/testa-verifier`);
  const afterConfirm = await page.textContent("body");
  check("confirmed rumor moved professional to Nexora Systems", afterConfirm.includes("Nexora Systems"));
  check("transfer history shows the hire", afterConfirm.includes("1 moves") || afterConfirm.includes("Hire"));

  // 8. sign out
  await page.goto(`${BASE}/admin`);
  await page.click('button:has-text("Sign out")');
  await page.waitForURL(/admin\/login/);
  await page.goto(`${BASE}/admin`);
  check("after sign-out /admin is protected again", page.url().includes("/admin/login"));
} catch (err) {
  console.error("E2E ERROR:", err.message);
  results.push({ name: "script completed", ok: false, extra: err.message });
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
