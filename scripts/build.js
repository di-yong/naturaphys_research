const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const site = "https://natphx.com";
const required = ["category", "object", "code", "material", "process", "image", "state"];

function readWorks() {
  const file = path.join(root, "works.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(data.works) || data.works.length === 0) {
    throw new Error("works.json needs a non-empty works array.");
  }
  return data.works;
}

function fail(errors) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blank(value) {
  return value === undefined || value === null || String(value).trim() === "" || String(value).trim() === "-";
}

function webpPath(image) {
  return image.replace(/\.(png|jpe?g|webp)$/i, ".webp");
}

function posix(value) {
  return value.split(path.sep).join("/");
}

async function prepareImages(works) {
  const errors = [];
  const seen = new Set();
  for (const work of works) {
    for (const key of required) {
      if (blank(work[key])) errors.push(`${work.code || "(missing code)"} is missing ${key}.`);
    }
    if (work.code && seen.has(work.code)) errors.push(`Duplicate code ${work.code}.`);
    if (work.code) seen.add(work.code);
    if (work.code && !/^[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(work.code)) {
      errors.push(`${work.code} should look like FW-RB-03.`);
    }
    const source = work.image ? path.join(root, work.image) : "";
    if (work.image && !fs.existsSync(source)) errors.push(`${work.code}: image not found at ${work.image}.`);
  }
  if (errors.length) fail(errors);

  for (const work of works) {
    const display = webpPath(work.image);
    const source = path.join(root, work.image);
    const target = path.join(root, display);
    if (path.extname(source).toLowerCase() === ".webp") {
      work.display = posix(display);
      continue;
    }
    await sharp(source).rotate().webp({ quality: 90, effort: 6 }).toFile(target);
    const before = fs.statSync(source).size;
    const after = fs.statSync(target).size;
    console.log(`${work.code}: ${(before / 1e6).toFixed(2)} MB -> ${(after / 1e3).toFixed(0)} KB`);
    work.display = posix(display);
  }
}

function groups(works) {
  const result = [];
  for (const work of works) {
    const last = result[result.length - 1];
    if (!last || last.category !== work.category) result.push({ category: work.category, works: [work] });
    else last.works.push(work);
  }
  return result;
}

function listHtml(works) {
  return groups(works).map((group, index) => {
    const items = group.works.map((work) => {
      const sold = work.state === "SOLD";
      return `          <a class="list-item${sold ? " is-sold-item" : ""}" href="archive/${work.code.toLowerCase()}/index.html">
            <span class="item-code">${esc(work.code)}</span>
            <span class="item-name">${esc(work.object)}</span>
            <span class="item-state ${sold ? "is-sold" : "is-available"}"></span>
          </a>`;
    }).join("\n");
    return `        <div class="list-group${index ? " has-gap" : ""}">
          <div class="list-category">${esc(group.category)}</div>
${items}
        </div>`;
  }).join("\n");
}

function writeIndex(works) {
  const file = path.join(root, "index.html");
  const html = fs.readFileSync(file, "utf8");
  const nav = `<nav id="object-list" aria-label="Archive">\n${listHtml(works)}\n      </nav>`;
  const next = html.replace(/<!-- archive-list -->[\s\S]*?<!-- \/archive-list -->/, `<!-- archive-list -->\n      ${nav}\n      <!-- /archive-list -->`);
  if (next === html) throw new Error("Could not find the archive list in index.html.");
  fs.writeFileSync(file, next);
}

function rows(work) {
  const fields = [
    ["MATERIAL", work.material],
    ["PROCESS", work.process],
    ["DIMENSIONS", work.dimensions],
    ["THICKNESS", work.thickness],
    ["WEIGHT", work.weight],
    ["SEQ NO", work.seq],
  ];
  const lines = fields
    .filter(([, value]) => !blank(value))
    .map(([label, value]) => `            <div class="card-row"><span class="field-label">${label}</span><span class="field-value">${esc(value)}</span></div>`);
  const sold = work.state === "SOLD";
  lines.push(`            <div class="card-row"><span class="field-label">STATE</span><span class="field-value"><i class="card-state-dot ${sold ? "is-sold" : "is-available"}"></i>${esc(work.state)}</span></div>`);
  return lines.join("\n");
}

function writeWork(work, index, works) {
  const prev = works[(index - 1 + works.length) % works.length];
  const next = works[(index + 1) % works.length];
  const slug = work.code.toLowerCase();
  const description = `${work.object}, ${work.code}. ${work.material}. ${work.process}.`;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${esc(work.object)} — ${esc(work.code)} — NATPHX</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${site}/archive/${slug}/" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0e0e0c" />
    <meta property="og:title" content="${esc(work.object)} — NATPHX" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${site}/archive/${slug}/" />
    <meta property="og:image" content="${site}/${work.display}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../style.css" />
    <link rel="prefetch" href="../../${prev.display}" />
    <link rel="prefetch" href="../../${next.display}" />
  </head>
  <body class="work-page">
    <div id="custom-cursor"></div>
    <a id="card-close" href="../../index.html#screen-list">[ CLOSE ]</a>
    <a id="card-prev" href="../${prev.code.toLowerCase()}/index.html" aria-label="Previous, ${esc(prev.object)}">[ ← ]</a>
    <a id="card-next" href="../${next.code.toLowerCase()}/index.html" aria-label="Next, ${esc(next.object)}">[ → ]</a>
    <main id="object-card">
      <button type="button" id="card-img">
        <img src="../../${work.display}" alt="${esc(work.object)} hanging on a metal rack against a concrete wall" />
      </button>
      <div id="card-fields">
        <header class="card-header">
          <p class="card-kicker">${esc(work.category)}</p>
          <h1 class="card-title">${esc(work.object)}</h1>
          <p class="card-code">${esc(work.code)}</p>
        </header>
${rows(work)}
      </div>
    </main>
    <div id="img-fullscreen" aria-hidden="true">
      <img id="img-fs-photo" alt="" />
    </div>
    <audio id="click-sound" src="../../assets/click.wav" preload="auto"></audio>
    <script src="../../app.js"></script>
  </body>
</html>
`;
  const dir = path.join(root, "archive", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

function removeRetired(works) {
  const keep = new Set(works.map((work) => work.code.toLowerCase()));
  const archive = path.join(root, "archive");
  if (!fs.existsSync(archive)) return;
  for (const name of fs.readdirSync(archive)) {
    const dir = path.join(archive, name);
    if (fs.statSync(dir).isDirectory() && !keep.has(name)) fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeSitemap(works) {
  const urls = [`  <url><loc>${site}/</loc></url>`]
    .concat(works.map((work) => `  <url><loc>${site}/archive/${work.code.toLowerCase()}/</loc></url>`));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
}

function writeData(works) {
  const records = works.map((work) => `    {
        category: ${JSON.stringify(work.category)},
        object: ${JSON.stringify(work.object)},
        code: ${JSON.stringify(work.code)},
        material: ${JSON.stringify(work.material)},
        process: ${JSON.stringify(work.process)},
        dimensions: ${JSON.stringify(work.dimensions || "-")},
        thickness: ${JSON.stringify(work.thickness || "-")},
        weight: ${JSON.stringify(work.weight || "-")},
        seq: ${JSON.stringify(work.seq || "-")},
        state: ${JSON.stringify(work.state)},
        img: ${JSON.stringify(work.display)}
    }`);
  const js = `// Generated from works.json. Edit works.json, then run publish.bat.
const ARCHIVE_DATA = [
${records.join(",\n")}
];
`;
  fs.writeFileSync(path.join(root, "data.js"), js);
}

(async () => {
  const works = readWorks();
  await prepareImages(works);
  writeIndex(works);
  removeRetired(works);
  works.forEach(writeWork);
  writeSitemap(works);
  writeData(works);
  console.log(`Built ${works.length} works.`);
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
