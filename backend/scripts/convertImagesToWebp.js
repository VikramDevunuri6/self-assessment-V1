/**
 * One-off performance script: converts the question illustration PNGs
 * (frontend/public/questions/) to WebP at quality 82, preserving alpha for
 * this-or-that images. Requires the `cwebp` binary (brew install webp).
 *
 * Output goes to a temp dir, not into the repo -- the next step
 * (uploadQuestionImagesWebp.js) uploads straight from there.
 *
 *   node backend/scripts/convertImagesToWebp.js
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const QUESTIONS_DIR = path.join(__dirname, "../../frontend/public/questions");
const OUT_DIR = path.join(require("os").tmpdir(), "question-images-webp");
const TYPE_FOLDERS = ["instagram", "scenario", "thisorthat"];
const QUALITY = "82";

function main() {
  let count = 0;

  for (const typeFolder of TYPE_FOLDERS) {
    const inDir = path.join(QUESTIONS_DIR, typeFolder);
    const outDir = path.join(OUT_DIR, typeFolder);
    if (!fs.existsSync(inDir)) continue;
    fs.mkdirSync(outDir, { recursive: true });

    const files = fs.readdirSync(inDir).filter((f) => f.endsWith(".png"));
    for (const filename of files) {
      const inPath = path.join(inDir, filename);
      const outPath = path.join(outDir, filename.replace(/\.png$/, ".webp"));
      execFileSync("cwebp", ["-quiet", "-q", QUALITY, inPath, "-o", outPath]);
      console.log(`Converted ${typeFolder}/${filename}`);
      count += 1;
    }
  }

  console.log(`Done. Converted ${count} files to ${OUT_DIR}`);
}

main();
