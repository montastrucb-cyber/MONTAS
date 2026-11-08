// Génère les miniatures 3D des produits (public/thumbs/*.webp).
// Usage : ENABLE_STUDIO=1 npm run build && npx next start -p 3100 & ; node scripts/thumbnails.mjs
// (voir README, section « Miniatures 3D »)
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright est nécessaire : npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";

const BASE = process.env.STUDIO_URL ?? "http://localhost:3100";
const OUT = new URL("../public/thumbs/", import.meta.url);
await mkdir(OUT, { recursive: true });

// Liste des produits lue dans le catalogue (slug + nombre de coloris)
const src = await readFile(new URL("../src/data/catalog.ts", import.meta.url), "utf8");
const slugs = [...src.matchAll(/slug: "([a-z0-9-]+)",\s*\n\s*name: "[^"]*",\s*\n\s*category:/g)].map((m) => m[1]);

const jobs = slugs.map((slug) => ({ slug, color: 0, logo: 0, file: `${slug}.webp` }));
// Visuels de l'accroche : t-shirt avec logo, en trois coloris
for (const [i, color] of [3, 0, 2].entries()) jobs.push({ slug: "t-shirt-coton-bio", color, logo: 1, yaw: -0.35, file: `hero-${i}.webp` });

// ONLY=slug1,slug2 pour ne régénérer que certains produits
const only = process.env.ONLY?.split(",");
if (only) jobs.splice(0, jobs.length, ...jobs.filter((j) => only.includes(j.slug)));

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 720, height: 720 }, deviceScaleFactor: 1 });
for (const j of jobs) {
  await page.goto(`${BASE}/studio?slug=${j.slug}&color=${j.color}&logo=${j.logo}&yaw=${j.yaw ?? -0.4}`);
  await page.waitForFunction(() => window.__ready3d === true, null, { timeout: 180000 });
  await page.waitForTimeout(300);
  const png = await page.locator("#studio canvas").screenshot({ omitBackground: true });
  await sharp(png).resize(720, 720).webp({ quality: 82, alphaQuality: 90 }).toFile(new URL(j.file, OUT).pathname);
  console.log("✓", j.file);
}
await browser.close();
