import fs from "fs";
import path from "path";

const RAW = "docs/_raw";
const OUT = "docs/reference";

/**
 * Remove everything in docs/api except _raw
 */
function cleanStructuredOutput() {
  if (!fs.existsSync(OUT)) return;

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyTo(targetDir, fileName) {
  const src = path.join(RAW, fileName);
  const dstDir = path.join(OUT, targetDir);
  ensureDir(dstDir);
  const dst = path.join(dstDir, fileName);
  fs.copyFileSync(src, dst);
}

function classify(fileName) {
  // handle top-level index
  if (fileName === "index.md") return "api";

  // Most of your files are "list-display.<symbol>.md"
  const lower = fileName.toLowerCase();

  // ---- FEATURES (specific first) ----
  if (lower.includes("modal")) return "features/modals";
  if (lower.includes("rowaction") || lower.includes("generalaction") || lower.includes("action")) return "features/actions";
  if (lower.includes("selection") || lower.includes("select")) return "features/selection";
  if (lower.includes("pagination") || lower.includes("pageindex") || lower.includes("pagesize") || lower.includes("totalpages") || lower.includes("totalitems"))
    return "features/pagination";
  if (lower.includes("sorting") || lower.includes("sortbar") || lower.includes("sortdescriptor") || lower.includes("sortdirection") || lower.includes("sort"))
    return "features/sorting";
  if (lower.includes("filter") || lower.includes("operator") || lower.includes("predicate") || lower.includes("normalize"))
    return "features/filtering";

  // ---- DATA SOURCES ----
  if (lower.includes("datasource") || lower.includes("querysource") || lower.includes("streamsource") || lower.includes("streambootstrap") || lower.includes("applypatch"))
    return "core/data";

  // ---- CORE-ish plumbing ----
  if (lower.includes("featureregistry") || lower.includes("compiledfeatureplan") || lower.includes("featurenode") || lower.includes("featureresolver"))
    return "core/registry";
  if (lower.includes("state") || lower.includes("store") || lower.includes("featurestate") || lower.includes("corestate"))
    return "core/store";
  if (lower.includes("context") || lower.includes("listctx") || lower.includes("provider"))
    return "core/context";
  if (lower.includes("contract") || lower.includes("slots") || lower.includes("validateuiwiring") || lower.includes("featureui"))
    return "core/contracts";

  // ---- UI / slots ----
  if (lower.includes("tableprops") || lower.includes("toolbarprops") || lower.includes("filterspanelprops") || lower.includes("paginationprops") || lower.includes("modaloutletprops") || lower.includes("listcomponents"))
    return "ui/slots";
  if (lower.includes("defaulttable"))
    return "ui/default";

  // ---- MAIN component / public surface ----
  if (lower.includes("listdisplay")) return "component";
  if (lower.startsWith("list-display.")) return "api"; // generic API types

  // fallback
  return "misc";
}

cleanStructuredOutput();

const files = fs.readdirSync(RAW).filter((f) => f.endsWith(".md"));
if (files.length === 0) {
  console.error(`[organize] No markdown files found in ${RAW}.`);
  process.exit(1);
}

console.log(`[organize] Found ${files.length} markdown files in ${RAW}`);

const counts = new Map();

for (const file of files) {
  const target = classify(file);
  copyTo(target, file);
  counts.set(target, (counts.get(target) ?? 0) + 1);
}

console.log("[organize] Folder counts:");
for (const [k, v] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`  - ${k}: ${v}`);
}

// Optional: generate simple index.md per folder we created (non-recursive)
for (const folder of counts.keys()) {
  buildFolderToc(folder);
}

function readTitle(mdPath) {
  const txt = fs.readFileSync(mdPath, "utf8");
  const m = txt.match(/^#\s+(.+)\s*$/m);
  return m ? m[1].trim() : path.basename(mdPath);
}

function isPropertyPage(file) {
  // Heuristic: pages like "thing.prop.md" are usually noisy API member pages
  // Example: list-display.liststate.rows.md
  // Keep them, but group separately.
  return file.split(".").length >= 4;
}

function groupKey(file) {
  const lower = file.toLowerCase();

  if (lower.includes("props")) return "Props";
  if (lower.includes("context")) return "Contexts";
  if (lower.includes("state")) return "State";
  if (lower.includes("config")) return "Config";
  if (lower.includes("descriptor")) return "Descriptors";
  if (lower.includes("source") || lower.includes("datasource")) return "Data sources";
  if (lower.includes("apply") || lower.includes("build") || lower.includes("create") || lower.includes("update") || lower.includes("clear") || lower.includes("open") || lower.includes("close"))
    return "Functions";
  if (lower.includes("mode") || lower.includes("kind") || lower.includes("direction") || lower.includes("operator") || lower.includes("status") || lower.includes("type"))
    return "Enums & Unions";

  return "Types";
}

function buildFolderToc(folder) {
  const folderPath = path.join(OUT, folder);
  if (!fs.existsSync(folderPath)) return;

  const mdFiles = fs
      .readdirSync(folderPath)
      .filter((f) => f.endsWith(".md") && f !== "index.md" && f !== "_toc.md")
      .sort((a, b) => a.localeCompare(b));

  if (mdFiles.length === 0) return;

  const primary = mdFiles.filter((f) => !isPropertyPage(f));
  const properties = mdFiles.filter((f) => isPropertyPage(f));

  const groups = new Map();

  for (const f of primary) {
    const k = groupKey(f);
    const arr = groups.get(k) ?? [];
    arr.push(f);
    groups.set(k, arr);
  }

  const lines = [
    `# Table of contents`,
    ``,
    `This section is generated automatically.`,
    `It lists the documentation pages in this category with readable titles.`,
    ``,
  ];

  // stable group order
  const preferredOrder = ["Props", "Contexts", "State", "Config", "Descriptors", "Data sources", "Functions", "Enums & Unions", "Types"];
  const keys = [...groups.keys()].sort((a, b) => {
    const ia = preferredOrder.indexOf(a);
    const ib = preferredOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  for (const k of keys) {
    lines.push(`## ${k}`);
    lines.push(``);
    for (const f of groups.get(k)) {
      const base = cleanBaseName(f);
      const title = humanize(base);
      lines.push(`- [${title}](./${f})`);
    }
    lines.push(``);
  }

  if (properties.length > 0) {
    lines.push(`## Members`);
    lines.push(``);
    lines.push(`These are member-level pages (properties/methods) generated by the tool. Useful for detail, noisy for browsing.`);
    lines.push(``);
    for (const f of properties) {
      const base = cleanBaseName(f);
      const title = humanize(base);
      lines.push(`- [${title}](./${f})`);
    }
    lines.push(``);
  }

  fs.writeFileSync(path.join(folderPath, "_toc.md"), lines.join("\n"), "utf8");
}

function cleanBaseName(file) {
  return file
      .replace(/^list-display\./, "")
      .replace(/\.md$/, "");
}

function humanize(name) {
  return name
      .split(".")
      .map(part =>
          part
              .replace(/([a-z])([A-Z])/g, "$1 $2") // just in case
              .replace(/[-_]/g, " ")
              .replace(/^\w/, c => c.toUpperCase())
      )
      .join(" › ");
}


console.log("[organize] Done.");
