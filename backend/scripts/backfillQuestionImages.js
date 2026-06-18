/**
 * One-off migration script: backfills questions.question_type,
 * questions.image_url, and question_options.image_url from the same
 * position->type/image mapping that lived in frontend/src/data/questions.json
 * (sectionMap + imagePaths + the this-or-that "-a"/"-b" file convention).
 * Points at the .webp objects uploaded by uploadQuestionImagesWebp.js.
 *
 * "Position" = 1-based row rank ordered by id ASC, matching
 * questionRepository.getActiveQuestions()'s own ordering.
 *
 * Position 49 has no entry in the original sectionMap and defaulted to
 * "scenario" with no image in the frontend code -- that default is
 * reproduced explicitly here, not "fixed".
 *
 * Run with --dry-run first to review the planned updates without writing.
 *
 *   node backend/scripts/backfillQuestionImages.js --dry-run
 *   node backend/scripts/backfillQuestionImages.js
 */
require("dotenv").config();

const supabase = require("../src/config/supabaseClient");

const BUCKET = "assessment-images";

const SECTION_GROUPS = {
  instagram: [1, 2, 9, 10, 22, 38],
  scenario: [3, 7, 16, 17, 18, 19, 21, 23, 27, 42, 45, 48],
  slider: [4, 5, 6, 8, 20, 24, 25, 39],
  thisorthat: [
    11, 12, 13, 14, 15, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 40, 41, 43, 44, 46, 47,
  ],
};

const POSITION_TO_TYPE = {};
for (const [type, positions] of Object.entries(SECTION_GROUPS)) {
  for (const position of positions) POSITION_TO_TYPE[position] = type;
}

function typeForPosition(position) {
  return POSITION_TO_TYPE[position] || "scenario"; // matches frontend's old default fallback
}

function hasRealSingleImage(position, type) {
  // Only instagram/scenario positions that were explicitly listed have a real
  // uploaded file. slider has none today; position 49 falls through to the
  // "scenario" default above but was never in the scenario group, so no image.
  return (type === "instagram" || type === "scenario") && POSITION_TO_TYPE[position] === type;
}

function publicUrl(storagePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function fetchQuestionsInOrder() {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question_options ( id, option_order )")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

function buildPlan(questions) {
  const questionUpdates = [];
  const optionUpdates = [];

  questions.forEach((question, index) => {
    const position = index + 1;
    const type = typeForPosition(position);

    const imageUrl = hasRealSingleImage(position, type)
      ? publicUrl(`${type}/q${position}.webp`)
      : null;

    questionUpdates.push({ id: question.id, question_type: type, image_url: imageUrl });

    if (type === "thisorthat") {
      const sortedOptions = [...question.question_options].sort(
        (a, b) => a.option_order - b.option_order
      );
      const [optionA, optionB] = sortedOptions;
      if (optionA) {
        optionUpdates.push({ id: optionA.id, image_url: publicUrl(`thisorthat/q${position}-a.webp`) });
      }
      if (optionB) {
        optionUpdates.push({ id: optionB.id, image_url: publicUrl(`thisorthat/q${position}-b.webp`) });
      }
    }
  });

  return { questionUpdates, optionUpdates };
}

async function applyPlan({ questionUpdates, optionUpdates }) {
  for (const update of questionUpdates) {
    const { id, ...fields } = update;
    const { error } = await supabase.from("questions").update(fields).eq("id", id);
    if (error) throw new Error(`question ${id}: ${error.message}`);
  }

  for (const update of optionUpdates) {
    const { id, ...fields } = update;
    const { error } = await supabase.from("question_options").update(fields).eq("id", id);
    if (error) throw new Error(`option ${id}: ${error.message}`);
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const questions = await fetchQuestionsInOrder();
  const plan = buildPlan(questions);

  console.log(`Plan: ${plan.questionUpdates.length} questions, ${plan.optionUpdates.length} options`);
  console.table(plan.questionUpdates);
  console.table(plan.optionUpdates);

  if (dryRun) {
    console.log("Dry run -- no writes performed.");
    return;
  }

  await applyPlan(plan);
  console.log(`Done. Updated ${plan.questionUpdates.length} questions, ${plan.optionUpdates.length} options.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
