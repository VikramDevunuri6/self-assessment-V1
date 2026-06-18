/**
 * One-off migration script: uploads the existing question illustration
 * images from frontend/public/questions/ into the Supabase Storage bucket
 * `assessment-images`, preserving the same folder/file layout.
 *
 * Safe to re-run (upsert: true).
 *
 *   node backend/scripts/uploadQuestionImages.js
 */
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const supabase = require("../src/config/supabaseClient");

const BUCKET = "assessment-images";
const QUESTIONS_DIR = path.join(__dirname, "../../frontend/public/questions");
const TYPE_FOLDERS = ["instagram", "scenario", "thisorthat"]; // slider has no real images today

function contentTypeFor(filename) {
  return filename.endsWith(".png") ? "image/png" : "application/octet-stream";
}

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(error.message);

  if (!buckets.some((b) => b.name === BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (createError) throw new Error(createError.message);
    console.log(`Created bucket "${BUCKET}" (public)`);
  } else {
    console.log(`Bucket "${BUCKET}" already exists`);
  }
}

async function uploadFile(typeFolder, filename) {
  const localPath = path.join(QUESTIONS_DIR, typeFolder, filename);
  const storagePath = `${typeFolder}/${filename}`;
  const fileBuffer = fs.readFileSync(localPath);

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: contentTypeFor(filename),
    upsert: true,
  });

  if (error) throw new Error(`${storagePath}: ${error.message}`);
  console.log(`Uploaded ${storagePath}`);
}

async function main() {
  await ensureBucket();

  let count = 0;
  for (const typeFolder of TYPE_FOLDERS) {
    const dir = path.join(QUESTIONS_DIR, typeFolder);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f !== ".gitkeep");
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
