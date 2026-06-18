/**
 * One-off performance script: uploads the WebP-converted question images
 * (produced by convertImagesToWebp.js, in os.tmpdir()/question-images-webp)
 * into the same `assessment-images` bucket, alongside the original PNGs,
 * with a long-lived Cache-Control header so browsers don't revalidate on
 * every repeat view.
 *
 * Safe to re-run (upsert: true).
 *
 *   node backend/scripts/convertImagesToWebp.js   (run first)
 *   node backend/scripts/uploadQuestionImagesWebp.js
 */
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const supabase = require("../src/config/supabaseClient");

const BUCKET = "assessment-images";
const WEBP_DIR = path.join(require("os").tmpdir(), "question-images-webp");
const TYPE_FOLDERS = ["instagram", "scenario", "thisorthat"];
const ONE_YEAR_SECONDS = "31536000";

async function uploadFile(typeFolder, filename) {
  const localPath = path.join(WEBP_DIR, typeFolder, filename);
  const storagePath = `${typeFolder}/${filename}`;
  const fileBuffer = fs.readFileSync(localPath);

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: "image/webp",
    cacheControl: ONE_YEAR_SECONDS,
    upsert: true,
  });

  if (error) throw new Error(`${storagePath}: ${error.message}`);
  console.log(`Uploaded ${storagePath}`);
}

async function main() {
  if (!fs.existsSync(WEBP_DIR)) {
    throw new Error(`${WEBP_DIR} not found -- run convertImagesToWebp.js first`);
  }

  let count = 0;
  for (const typeFolder of TYPE_FOLDERS) {
    const dir = path.join(WEBP_DIR, typeFolder);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webp"));
    for (const filename of files) {
      await uploadFile(typeFolder, filename);
      count += 1;
    }
  }

  console.log(`Done. Uploaded ${count} files.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
