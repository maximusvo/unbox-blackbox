// Drives the unmodified bleeptrack 35c3-circuit-generator (vendor/, GPL-3.0)
// in a real browser and extracts its own SVG export (project.exportSVG +
// colorizeSvgString, exactly as their downloadSVG() does) for each post.
// One generated image per post, keyed by the post's title as "text" input,
// exactly like the original tool: https://35c3.bleeptrack.de/
"use strict";
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");
const yaml = require("js-yaml");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const POSTS_DIR = path.join(REPO_ROOT, "_posts");
const OUT_DIR = path.join(REPO_ROOT, "assets", "img", "teasers");

const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("No local Chrome found, set CHROME_PATH env var");
}

// Same slug Jekyll derives from a post filename (strips the date prefix and
// extension) — has to match so <img> tags built from `post.slug` resolve.
function slugFor(filename) {
  return filename.replace(/\.(markdown|md)$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function loadPosts() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.(markdown|md)$/.test(f))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf-8");
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) return null;
      const frontMatter = yaml.load(match[1]) || {};
      const title = String(frontMatter.title || "").trim();
      if (!title) return null;
      return { slug: slugFor(filename), title, filename };
    })
    .filter(Boolean);
}

// Runs inside the page. Wraps `rawTitle` (uppercased, matching the tool's
// own all-caps word list) to real Montserrat-bold pixel widths so long
// titles don't overflow the canvas, then re-runs the vendored generate()
// with that wrapped text as the "usertext" input — exactly the same code
// path as typing into the tool's own Text field.
/* istanbul ignore next -- runs in the browser context via page.evaluate */
function wrapAndRegenerate(rawTitle) {
  const canvasEl = document.getElementById("myCanvas");
  const fontPx = fontsize * fak; // globals set by memories.js from the query string
  const font = "bold " + fontPx + "px Montserrat";

  const measureCanvas = document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  ctx.font = font;

  const maxWidth = canvasEl.width * 0.6;
  const words = rawTitle.toUpperCase().replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? line + " " + w : w;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  // Cap at 4 lines — beyond that the text block starves the circuit layout
  // almost entirely, so fold any remainder onto the last line instead.
  const capped =
    lines.length > 4 ? lines.slice(0, 3).concat(lines.slice(3).join(" ")) : lines;

  document.getElementById("usertext").value = capped.join("\n");
  generate();

  const settings = { size: { width: canvasEl.width } };
  const raw = project.exportSVG({ asString: true });
  // Drop the rendered title text itself. The generator still routes the
  // circuit's wires around the space it reserved for that text, so this
  // leaves a deliberate-looking clear patch in the layout rather than a
  // gap-free redraw — same topology as before, just no lettering.
  const rawNoText = raw.replace(/<text[^>]*>[\s\S]*?<\/text>/, "");
  return {
    svg: colorizeSvgString(rawNoText, settings),
    width: canvasEl.width,
    height: canvasEl.height,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--all") || args.includes("--force");
  const outDir = args.find((a) => !a.startsWith("--")) || OUT_DIR;

  fs.mkdirSync(outDir, { recursive: true });

  const posts = loadPosts();
  const todo = force
    ? posts
    : posts.filter((p) => !fs.existsSync(path.join(outDir, p.slug + ".svg")));

  if (!todo.length) {
    console.log("Teaser images are already up to date — nothing to generate.");
    return;
  }
  console.log(
    `Generating ${todo.length} teaser image(s)${force ? " (--all)" : ""}: ` +
      todo.map((p) => p.slug).join(", ")
  );

  const executablePath = process.env.CHROME_PATH || findChrome();
  const browser = await puppeteer.launch({ executablePath, headless: "new" });
  const harnessPath = path.join(__dirname, "harness.html");

  try {
    for (const { slug, title } of todo) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1754, height: 1241 });

      const url = "file://" + harnessPath + "?strokewidth=3&fontsize=30&scale=2";
      await page.goto(url, { waitUntil: "load" });
      await page.waitForFunction("window.__fontsReady === true", { timeout: 15000 });

      const { svg, width, height } = await page.evaluate(wrapAndRegenerate, title);

      // Paper.js's exportSVG only sets width/height, no viewBox — without one
      // the image clips instead of scaling when embedded at any other size.
      const scalable = svg.replace(
        "<svg ",
        `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" `
      );

      fs.writeFileSync(path.join(outDir, slug + ".svg"), scalable);
      console.log("generated", slug);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
