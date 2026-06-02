# TODO: Dynamic Exam Refactor (DB schema migration + code/UI updates)

## Step 1 — DB migration (remove section columns + section constraints)
- [ ] Update `backend/src/database/schema.js` to drop:
  - `questions.section`, `questions.difficulty`
  - `results.section_a_score`, `results.section_b_score`, `results.section_c_score`
- [ ] Add/adjust constraints so questions support arbitrary N:
  - `questions` keeps `question_number`, `correct_option`, options
  - remove `CHECK(section IN ('A','B','C'))`
- [ ] Add a migration script (safe rebuild) to transform existing DB:
  - Create new tables (`questions_v2`, `results_v2`) with new schema
  - Copy compatible columns; recompute `score/percentage/rank` using global scoring
  - Rename/drop old tables or swap
- [ ] Update `backend/src/database/migrate.js` to run the new migration.

## Step 2 — Backend controller refactor
- [ ] `backend/src/controllers/examController.js`
  - remove section/difficulty validation and SECTION_ORDER/SECTION_CONFIG
  - accept `questions.length > 0`
  - persist only needed question fields
- [ ] `backend/src/controllers/examController.js`
  - `recalculateExamResults`: compute global score/percentage only; update `results.score` and `results.percentage`.
- [ ] `backend/src/controllers/resultController.js`
  - `createResult`: compute global score/percentage only
  - stop writing/reading `section_*` columns
  - update `answers` validation to use `exam.total_questions` (dynamic)
- [ ] `backend/src/controllers/resultController.js` response payloads:
  - remove `summary.section_scores`
  - remove `question.section` from `question_reviews`
- [ ] `getLeaderboardByExam`: remove section columns from SELECT.

## Step 3 — Frontend refactor (dynamic N questions + no section UI)
- [ ] `frontend/src/pages/AdminPages.jsx` (InputTestPage)
  - remove fixed 25-question creation
  - remove section UI and any section/difficulty usage
  - bulk import maps directly to question array length N
- [ ] `frontend/src/pages/AdminPages.jsx` (InputResultPage)
  - replace section summary cards with global score/percentage
  - remove section labels from question cards
  - remove usage of `section_a_score/b/c` in API response
- [ ] `frontend/src/pages/StudentResultPortal.jsx`
  - strip Section A/B/C UI and section-based scoring
  - show sequential question grid 1..N
  - show Global Score and Leaderboard Rank

## Step 4 — Testing
- [ ] Create exams with N != 25 and confirm backend accepts them
- [ ] Record results for Present/Absent students
- [ ] Validate ranking updates correctly
- [ ] Smoke test: student portal loads and shows sequential questions

