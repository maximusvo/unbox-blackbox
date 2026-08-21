// Ad-hoc QA helper: loads the local dev server, scrolls the drill hero to
// several progress points, and screenshots each. Not part of the site build.
"use strict";
const puppeteer = require("puppeteer-core");

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto("http://localhost:4321/", { waitUntil: "load" });

  const wrapperHeight = await page.evaluate(
    () => document.getElementById("drill-hero-wrapper").offsetHeight
  );
  const viewportHeight = 900;
  const scrollable = wrapperHeight - viewportHeight;

  const points = [0, 0.2, 0.45, 0.6, 0.8, 1.0];
  for (const p of points) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(scrollable * p));
    await new Promise((r) => setTimeout(r, 150));
    await page.screenshot({ path: `/tmp/drill_qa_${Math.round(p * 100)}.png` });
    console.log("captured", p);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
