import fs from "fs";
import path from "path";

const GENERATED_ROOT = "docs/reference";   // where organize script outputs final generated pages
const INTROS_ROOT = "docsIntros";     // your manually written index.md mirrors

function exists(p) {
    try { fs.accessSync(p); return true; } catch { return false; }
}

function ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
}

function walkDirs(dir, out = []) {
    if (!exists(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(full);
            walkDirs(full, out);
        }
    }
    return out;
}

function readFile(p) {
    return fs.readFileSync(p, "utf8");
}

function writeFile(p, content) {
    ensureDir(path.dirname(p));
    fs.writeFileSync(p, content, "utf8");
}

function mergeIndexWithToc(folderAbsPath) {
    const tocPath = path.join(folderAbsPath, "_toc.md");
    if (!exists(tocPath)) return false;

    // folder path relative to docs/reference
    const rel = path.relative(GENERATED_ROOT, folderAbsPath);

    const introIndexPath = path.join(INTROS_ROOT, rel, "index.md");
    const targetIndexPath = path.join(folderAbsPath, "index.md");

    // Intro is mandatory per your rules (but we’ll fail gracefully)
    const intro = exists(introIndexPath)
        ? readFile(introIndexPath).trimEnd()
        : `# ${path.basename(folderAbsPath)}\n\n> Missing intro: ${introIndexPath}\n`.trimEnd();

    const toc = readFile(tocPath).trim();

    // Merge: intro first, then TOC
    const merged = `${intro}\n\n---\n\n${toc}\n`;

    writeFile(targetIndexPath, merged);

    // Delete toc
    fs.rmSync(tocPath, { force: true });

    return true;
}

function main() {
    if (!exists(GENERATED_ROOT)) {
        console.error(`[merge] Missing generated root: ${GENERATED_ROOT}`);
        process.exit(1);
    }

    const dirs = [GENERATED_ROOT, ...walkDirs(GENERATED_ROOT)];
    let mergedCount = 0;

    for (const dir of dirs) {
        if (mergeIndexWithToc(dir)) mergedCount++;
    }

    console.log(`[merge] Done. Merged TOC into index.md in ${mergedCount} folders and removed _toc.md files.`);
}

main();
