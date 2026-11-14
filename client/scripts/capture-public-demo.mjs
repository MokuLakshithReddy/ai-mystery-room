import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = (process.env.DEMO_URL || "https://client-tau-sable-95.vercel.app").replace(/\/$/, "");
const outputDir = path.resolve(process.cwd(), "../docs/screenshots");
const videoDir = path.join(outputDir, "video");
await fs.mkdir(videoDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1,
  recordVideo: { dir: videoDir, size: { width: 1440, height: 960 } },
});
const page = await context.newPage();
const captures = [];

try {
  const homeResponse = await page.goto(baseUrl + "/", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2_000);
  const homeText = (await page.locator("body").innerText()).trim();
  if (!homeResponse || homeResponse.status() >= 400) {
    throw new Error(`Home page returned HTTP ${homeResponse?.status() ?? "no response"}`);
  }
  if (homeText.length < 30) {
    throw new Error("Home page rendered too little visible content to count as a useful screenshot.");
  }
  await page.screenshot({
    path: path.join(outputDir, "home.png"),
    fullPage: true,
    animations: "disabled",
  });
  captures.push({
    path: "docs/screenshots/home.png",
    url: baseUrl + "/",
    status: homeResponse.status(),
    title: await page.title(),
    visibleTextLength: homeText.length,
  });

  const createResponse = await page.goto(baseUrl + "/create", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1_500);
  const createText = (await page.locator("body").innerText()).trim();
  if (!createResponse || createResponse.status() >= 400) {
    throw new Error(`Create route returned HTTP ${createResponse?.status() ?? "no response"}`);
  }
  if (createText.length < 30) {
    throw new Error("Create route rendered too little visible content to count as a useful screenshot.");
  }
  await page.screenshot({
    path: path.join(outputDir, "create-case.png"),
    fullPage: true,
    animations: "disabled",
  });
  captures.push({
    path: "docs/screenshots/create-case.png",
    url: baseUrl + "/create",
    status: createResponse.status(),
    title: await page.title(),
    visibleTextLength: createText.length,
  });

  await page.waitForTimeout(1_000);
} finally {
  const video = page.video();
  await context.close();
  if (video) {
    await video.saveAs(path.join(outputDir, "navigation-demo.webm"));
  }
  await browser.close();
}

await fs.writeFile(
  path.join(outputDir, "capture-manifest.json"),
  JSON.stringify({
    capturedAt: new Date().toISOString(),
    source: "public production deployment",
    baseUrl,
    captures,
    note: "Screenshots verify that the public routes rendered; they do not prove case creation, persistence, or backend API correctness.",
  }, null, 2) + "\n",
);
console.log(JSON.stringify({ outputDir, captures }, null, 2));
