# New Assessment Scoring & Report Framework — Phase 1 Proposal

Status: **awaiting approval** — no code written yet, per instructions.

This is a from-scratch framework built only from the actual content of the
48 active questions (`questions.id 50–97`, `is_active = true`). The four
reference report images supplied with the request were treated as discarded
prior work, not as a source for trait names, question mappings, weights, or
report layout — none of their numbers, trait lists, or Q-number assignments
were reused. Any overlap in trait *names* (e.g. "Leadership", "Integrity")
is coincidental and unavoidable — those are the obvious English names for
what the question content measures, not borrowed structure.

---

## 1. Trait Framework

14 scored traits + 1 reliability subsystem (3 items, never scored as a
personality trait). Every one of the 45 scoring items loads on exactly one
primary trait — no item is double-counted into two trait averages. This
keeps the math transparent: each trait score is a plain average of its own
items, nothing more.

| # | Trait | Items (n) | What it captures |
|---|---|---|---|
| 1 | Communication & Social Confidence | 4 | Comfort initiating and engaging socially, including under pressure (presenting, meeting new people) |
| 2 | Empathy & Interpersonal Sensitivity | 5 | Noticing and responding to others' needs/struggles, patience with others |
| 3 | Discipline & Time Management | 3 | Planning ahead, follow-through on commitments and goals |
| 4 | Leadership & Initiative | 5 | Stepping up, organizing others, taking ownership of group outcomes |
| 5 | Resilience & Emotional Stability | 3 | Recovery from setbacks, handling criticism/failure without spiraling |
| 6 | Curiosity & Learning Agility | 4 | Self-driven exploration of new topics/tools outside what's required |
| 7 | Growth Mindset | 3 | Belief that ability improves with effort; response to repeated failure |
| 8 | Integrity & Accountability | 2 | Honesty when unobserved; owning mistakes rather than deflecting |
| 9 | Adaptability & Change Readiness | 4 | Comfort with sudden change, new tech, shifting circumstances |
| 10 | Critical Thinking & Problem Solving | 5 | Root-cause analysis, evidence-based reasoning, verification habits |
| 11 | Entrepreneurial & Innovative Thinking | 2 | Bias toward building/improving things rather than leaving them as-is |
| 12 | Risk Appetite | 2 | Willingness to choose uncertain-but-higher-upside paths |
| 13 | Career Values & Achievement Motivation | 3 | What "success" means to the person — growth/impact vs. salary/security |
| — | **Validity / Reliability checks** | 3 | Detects socially-desirable or careless responding (see §5) |

Trait count and item distribution were derived by reading all 48 questions
and options directly from the database, grouping by theme, then merging
single-question themes into the nearest related trait (e.g. the one
mentoring question, "junior doesn't understand the subject," was folded
into Empathy rather than kept as its own 1-item trait) so no scored trait
rests on fewer than 2 items.

---

## 2. Question Mapping Table (all 48)

`Score` is the value already stored in `question_options.score` (1–4),
already direction-corrected (4 = strongest expression of the trait) — no
reverse-scoring logic needed at calculation time.

| Q# | Type | Primary Trait | Secondary Trait | Behavior Indicator (high score) |
|---|---|---|---|---|
| 1 | instagram | Communication & Social Confidence | Adaptability | Initiates social contact in a new environment |
| 2 | instagram | Leadership & Initiative | Communication | Volunteers for visible responsibility |
| 3 | scenario | Empathy & Interpersonal Sensitivity | Communication | Stays patient re-explaining without frustration |
| 4 | slider | Empathy & Interpersonal Sensitivity | Resilience | Tolerates others' repeated mistakes calmly |
| 5 | slider | Discipline & Time Management | Growth Mindset | Starts tasks early rather than at deadline |
| 6 | slider | Discipline & Time Management | Resilience | Follows through on self-set goals consistently |
| 7 | scenario | Leadership & Initiative | Discipline | Proactively organizes a slipping group task |
| 8 | slider | Resilience & Emotional Stability | Growth Mindset | Recovers from a bad result by planning next steps |
| 9 | instagram | Communication & Social Confidence | Resilience | Stays composed/excited before public speaking |
| 10 | instagram | Curiosity & Learning Agility | Risk Appetite | Picks the unfamiliar option over the safe one |
| 11 | thisorthat | Curiosity & Learning Agility | — | Goes deep on topics outside what's required |
| 12 | thisorthat | Curiosity & Learning Agility | Growth Mindset | Drawn to genuinely new challenges over routine |
| 13 | thisorthat | Growth Mindset | — | Believes a weak skill improves substantially with practice |
| 14 | thisorthat | Growth Mindset | Resilience | Treats exam failure as data, not identity |
| 15 | thisorthat | Curiosity & Learning Agility | Adaptability | Tries new tools immediately rather than waiting |
| 16 | scenario | Leadership & Initiative | Empathy | Mediates conflict toward a shared solution |
| 17 | scenario | Leadership & Initiative | Empathy | Values shared ownership over solo-hero performance |
| 18 | scenario | Empathy & Interpersonal Sensitivity | Leadership | Actively helps a struggling teammate |
| 19 | scenario | Integrity & Accountability | — | Doesn't cheat even when undetectable |
| 20 | slider | Resilience & Emotional Stability | Career Values | Keeps trying after repeated interview rejection |
| 21 | scenario | Resilience & Emotional Stability | Growth Mindset | Extracts useful signal from public criticism instead of getting defensive |
| 22 | instagram | Empathy & Interpersonal Sensitivity | Communication | Notices and acts on a friend's hidden distress |
| 23 | scenario | Communication & Social Confidence | Adaptability | Adjusts explanation on the fly when audience is lost |
| 24 | slider | Adaptability & Change Readiness | Resilience | Embraces a sudden role change |
| 25 | slider | Adaptability & Change Readiness | Curiosity | Starts learning a new mandatory technology immediately |
| 26 | thisorthat | Critical Thinking & Problem Solving | Curiosity | Investigates root cause with evidence before acting |
| 27 | scenario | Empathy & Interpersonal Sensitivity | Leadership | Teaches/mentors a struggling junior directly |
| 28 | thisorthat | Critical Thinking & Problem Solving | Entrepreneurial | Drawn to solving unfamiliar problems over fixed process |
| 29 | thisorthat | Entrepreneurial & Innovative Thinking | Leadership | Builds a prototype rather than just discussing an idea |
| 30 | thisorthat | Entrepreneurial & Innovative Thinking | Critical Thinking | Improves a slow process instead of tolerating it |
| 31 | thisorthat | Adaptability & Change Readiness | Curiosity | Sees industry disruption as opportunity, not threat |
| 32 | thisorthat | Career Values & Achievement Motivation | Growth Mindset | Prioritizes growth/impact over salary in job choice |
| 33 | thisorthat | Career Values & Achievement Motivation | Growth Mindset | Draws satisfaction from personal growth, not external reward |
| 34 | thisorthat | Critical Thinking & Problem Solving | — | Decides using evidence over gut feeling |
| 35 | thisorthat | Risk Appetite | Critical Thinking | Gathers information and accepts uncertainty to act |
| 36 | thisorthat | Adaptability & Change Readiness | Growth Mindset | Responds to AI-driven job change by upskilling |
| 37 | thisorthat | Growth Mindset | Adaptability | Sees continuous learning as the key future skill |
| 38 | instagram | Communication & Social Confidence | — | Enjoys meeting new people (extraversion-leaning) |
| 39 | slider | Discipline & Time Management | Integrity | Treats completing assigned work as personally important |
| 40 | thisorthat | **Validity check** | — | Picking "I never make mistakes" flags unrealistic self-report |
| 41 | thisorthat | **Validity check** | — | Picking "I never feel stress" flags unrealistic self-report |
| 42 | scenario | **Validity check** | — | Picking "I never show wrong judgment" flags unrealistic self-report |
| 43 | thisorthat | Critical Thinking & Problem Solving | Integrity | Cross-verifies conflicting information before trusting it |
| 44 | thisorthat | Critical Thinking & Problem Solving | Discipline | Systematically isolates root cause among many possible ones |
| 45 | scenario | Integrity & Accountability | Growth Mindset | Owns a personal mistake instead of deflecting blame |
| 46 | thisorthat | Risk Appetite | Growth Mindset | Chooses uncertain-but-higher-growth path over safe-but-flat one |
| 47 | thisorthat | Career Values & Achievement Motivation | Growth Mindset | Prioritizes meaningful impact + growth over stability |
| 48 | scenario | Leadership & Initiative | Communication | Steps up to organize a directionless team |

Coverage check: 45 items across the 13 numbered traits (counts above sum to
45) + 3 validity items = 48. Every active question is used exactly once.

---

## 3. Trait Scoring Formula

For trait *T* with items *i₁…iₙ* (n = 2 to 5 depending on the trait):

```
raw_score(T)   = average(score of the option the user picked, for each item in T)   // 1–4
normalized(T)  = round( (raw_score(T) − 1) / 3 × 100 )                              // 0–100
```

No weighting *within* a trait — every item in a trait counts equally. This
is deliberately simple and auditable: given the answers, anyone can
recompute every trait score by hand from this formula alone.

**Why average-normalized, not something fancier:** with only 2–5 items per
trait, a more complex model (e.g. weighted composites, IRT) would imply a
level of measurement precision the item count doesn't support. A plain
average is honest about that.

---

## 4. Career Signal Framework

Career signals are generated from trait-score combinations, not a single
trait. Rules are evaluated in order; a person can match multiple signals.
"High" = normalized score ≥ 70. "Low" = ≤ 40.

| Signal | Condition | Rationale |
|---|---|---|
| Research & Analytical Careers | High Critical Thinking + High Curiosity | Investigates deeply and reasons from evidence |
| People & Leadership Careers | High Leadership + High Communication | Comfortable directing and persuading groups |
| Builder / Founder Track | High Entrepreneurial + High Risk Appetite | Acts on ideas despite uncertainty |
| People-Support Careers (HR, Teaching, Counseling) | High Empathy + High Communication | Reads and responds to others' emotional state |
| Structured / Operational Careers (Finance, Quality, Compliance) | High Discipline + High Integrity & Accountability | Reliable, rule-following, low-drift execution |
| Fast-Change Environments (Startups, Consulting, Tech) | High Adaptability + High Growth Mindset | Treats disruption as routine, not threat |
| Innovation / Product Roles | High Entrepreneurial + High Curiosity | Combines idea generation with active exploration |
| Stability-Oriented Roles | High Career Values toward security + Low Risk Appetite | Optimizes for predictability over upside |

This is a small, explicit rule table — not a black box. Each rule is two
trait thresholds and one resulting label; new rules can be added later
without touching the scoring engine.

---

## 5. Department Fit Framework

Each department's fit % is a weighted average of the traits most relevant
to it (weights sum to 1.0 per department).

| Department | Trait weights |
|---|---|
| Technology & Engineering | Critical Thinking 0.4, Discipline 0.3, Adaptability 0.3 |
| Data & Analytics | Critical Thinking 0.5, Curiosity 0.3, Discipline 0.2 |
| Business & Management | Leadership 0.4, Communication 0.3, Career Values 0.3 |
| Marketing & Communication | Communication 0.4, Curiosity 0.3, Entrepreneurial 0.3 |
| Design & Innovation | Entrepreneurial 0.4, Curiosity 0.3, Adaptability 0.3 |
| Finance & Operations | Discipline 0.4, Critical Thinking 0.3, Integrity & Accountability 0.3 |
| HR & People | Empathy 0.5, Communication 0.3, Leadership 0.2 |

`fit% = Σ (trait_normalized_score × weight)` per department, 0–100.

These weights are a starting proposal, not derived from any statistical
fitting (there's no historical outcome data to fit against yet) — they're
face-valid placeholders that should be revisited once real outcome data
exists. This is called out explicitly so it isn't mistaken for a validated
model.

---

## 6. Reliability / Validity Framework

Three independent signals, combined into one **Confidence Level**
(High / Moderate / Low) — no existing implementation reused.

1. **Validity-item check** (Q40, Q41, Q42): these ask the user to affirm
   absolute, implausible self-statements ("I never make mistakes"). Each
   has its own 1–4 scale already in the DB (4 = realistic/self-aware
   answer, e.g. "Impossible — everyone makes mistakes"). `validity_score =
   average(Q40,41,42 normalized)`. A low score here means the person is
   over-claiming — answering in a self-flattering, unrealistic way — which
   should lower confidence in the *whole* report, not just these 3 items.

2. **Straight-lining check**: if the same `option_order` (e.g. always
   position 1) is selected for ≥ 80% of the 48 answered questions, flag as
   likely careless/rushed responding rather than genuine reflection.

3. **Completion-time sanity check**: using `answers.answered_at` timestamps
   already captured per answer, flag if the full session was completed
   implausibly fast (e.g. under ~3 minutes for 48 questions — under 4
   seconds/question on average) as a sign of not reading the questions.

```
confidence = "High"     if validity_score ≥ 70 and no straight-lining and not too-fast
confidence = "Moderate" if validity_score 40–69, or one soft flag triggers
confidence = "Low"      if validity_score < 40, or straight-lining + too-fast both trigger
```

The report will display confidence as its own labeled metric — it does
**not** multiply into or hide inside the Overall Potential Score, so a
reader can always see "here's your score" and "here's how much to trust
it" as two separate, honest numbers.

---

## 7. Overall Score Framework

```
Overall Potential Score = round( average of all 13 trait normalized scores )   // 0–100, equal weight per trait
```

Equal weight per trait (not per-item) so that a trait measured by only 2
items (e.g. Risk Appetite) isn't structurally penalized relative to a
5-item trait (e.g. Critical Thinking) just because it has fewer questions.

Strengths = top 3 traits by normalized score. Growth Areas = bottom 3.
Both are derived live from whatever the actual scores are — never a fixed
list, never hardcoded.

---

## 8. Report Structure (content plan only — no visual design yet)

1. **Header** — name/ID, date, questions answered (48/48), completion time.
2. **Overall Potential Score** — 0–100 + a band label (own wording, e.g.
   Emerging / Developing / Strong / Exceptional — exact bands open for
   discussion).
3. **Trait Profile** — all 13 traits with score + one-line interpretation
   pulled from the behavior-indicator text in §2.
4. **Top Strengths / Growth Areas** — auto-derived top-3 / bottom-3, never
   hardcoded.
5. **Career Signals** — whichever rules from §4 matched, with the
   trait-pair rationale shown so it's explainable, not a black box.
6. **Department Fit** — bar/percentage per department from §5.
7. **Confidence & Reliability** — validity score, straight-lining flag,
   timing flag, overall confidence label, with a plain-language caveat
   when confidence is Moderate/Low.
8. **Suggested Next Steps** — short generated text keyed to the user's
   actual two lowest traits (e.g. low Discipline → a time-management
   suggestion), not generic filler.

Visual design (colors, layout, components) is intentionally not specified
yet — that's Phase 3 frontend work, to be designed fresh rather than
matching any prior report.

---

## Open questions for approval

1. Does the 13-trait list in §1 look right, or should any be split/merged/renamed?
2. Are the department-fit weights in §5 acceptable as a v1 placeholder (explicitly not statistically fitted)?
3. Overall-score banding labels in §8.2 — any preference, or leave to Phase 3?
4. Should Career Signals (§4) support a person matching zero rules (i.e. no "High ≥70" trait at all)? Proposed: fall back to "Balanced across multiple areas" rather than leaving the section empty.
