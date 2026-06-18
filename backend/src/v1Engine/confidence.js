const STRAIGHT_LINE_THRESHOLD = 0.8;
const TOO_FAST_MINUTES = 3;

/**
 * scoredAnswers: [{groupNo, score}], config-driven validityGroupNos (1-4 scale per item).
 */
function computeValidityScore(scoredAnswers, validityGroupNos) {
  const validityScores = scoredAnswers
    .filter((a) => validityGroupNos.includes(a.groupNo))
    .map((a) => a.score);

  if (!validityScores.length) return 0;

  const rawAvg = validityScores.reduce((sum, s) => sum + s, 0) / validityScores.length;
  return Math.round(((rawAvg - 1) / 3) * 100);
}

/**
 * scoredAnswers: [{optionOrder}]. True if the same option_order was picked
 * for >=80% of all answered questions (likely careless/rushed responding).
 */
function detectStraightLining(scoredAnswers) {
  if (!scoredAnswers.length) return false;

  const counts = new Map();
  for (const a of scoredAnswers) {
    counts.set(a.optionOrder, (counts.get(a.optionOrder) || 0) + 1);
  }

  const maxCount = Math.max(...counts.values());
  return maxCount / scoredAnswers.length >= STRAIGHT_LINE_THRESHOLD;
}

/**
 * startedAt: ISO timestamp the session began. Uses session timestamps
 * rather than answers.answered_at, which shifts on every answer revision
 * (upsert) and would make this check noisy.
 */
function detectTooFast(startedAt) {
  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  return elapsedMs < TOO_FAST_MINUTES * 60 * 1000;
}

/**
 * Resolution order (the three stated rules overlap, so this makes them
 * exhaustive and non-overlapping): Low if validity_score<40 OR both flags
 * set; else High if validity_score>=70 AND no flags; else Moderate.
 */
function computeConfidence({ validityScore, straightLiningFlag, tooFastFlag }) {
  const bothFlags = straightLiningFlag && tooFastFlag;

  let level;
  if (validityScore < 40 || bothFlags) {
    level = "Low";
  } else if (validityScore >= 70 && !straightLiningFlag && !tooFastFlag) {
    level = "High";
  } else {
    level = "Moderate";
  }

  return {
    level,
    validityScore,
    flags: { straightLining: straightLiningFlag, tooFast: tooFastFlag },
  };
}

module.exports = { computeValidityScore, detectStraightLining, detectTooFast, computeConfidence };
