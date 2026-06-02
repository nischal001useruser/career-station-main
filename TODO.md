# TODO: Remove hardcoded 25-question limit + add Exam Modes

## Step 1 (Frontend) — in progress
- Update `frontend/src/pages/AdminPages.jsx`
  - Add exam mode dropdown: `25marks`, `100marks`, `custom`
  - If `custom`, show integer input for total questions
  - Replace `createQuestionRows()` with dynamic generator driven by selected total
  - Ensure question cards render Q.1..Q.N
  - Remove all UI text and calculations assuming 25 (e.g. `.../25`, “Auto-create 25 questions”)
  - Update bulk import messaging + apply imported rows up to current N
  - Update submit payload to send `exam_mode` and `total_questions` dynamically
  - Update result summary UI to show `totalScore/${questions.length}`



## Step 2 (Backend)
- Update `backend/src/controllers/examController.js`
  - Remove fixed `questions.length !== 25` / `=== 25` request validations
  - Accept `exam_mode` and `total_questions` from request
  - Validate question count matches `total_questions`
  - Persist `exam_mode` into `exams`
  - Loosen section/difficulty constraints for modes other than `25marks` (keep strict constraints only for `25marks`)
  - Recalculate results/ranks after updating answer key

## Step 3 (Backend grading)
- Search for any remaining `/25` or `Exactly 25` assumptions in backend and remove/replace with `exam.total_questions`.

## Step 4 (Verification)
- Manual test matrix:
  - Create exam with 25 marks → submit result → verify % uses 25
  - Create exam with 100 marks → submit result → verify % uses 100
  - Create exam with custom N (e.g. 37) → submit result → verify % uses N
- Check result entry UI does not overflow for 100/custom.

