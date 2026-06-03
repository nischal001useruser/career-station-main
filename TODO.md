# TODO - View Exam Results (Admin)

## Plan summary
Implement a new Admin “View Exam Results” dashboard that lets admin choose Course + Exam Date, fetches students who took that exam, and displays:
- Ranked: students with numeric scores, sorted desc, with Rank #
- Unmarked: present students with no score value
- Absent: attendance_status === 'ABSENT'
Unmarked + Absent should be shown in an “Archived” style section.

## Steps
- [x] Create backend endpoint to fetch all students/results for selected exam (course + nepali_date or exam_id).
- [x] Add route in `backend/src/routes/resultRoutes.js`.

- [x] Implement React page `ViewExamResultsPage` inside `frontend/src/pages/AdminPages.jsx`.

- [x] Update Admin sidebar to include a new menu item and navigation path.

- [x] Ensure frontend router wiring for `/admin/view-exam-results`.
- [x] Run backend + frontend to verify sorting/filtering and UI states.




