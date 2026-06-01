# Career Station Exam Analytics - Database Architecture

## Database Overview

SQLite database for Career Station Exam Analytics System with complete schema for managing students, exams, questions, answers, results, reports, and admin users.

## Database Location
- **Path:** `backend/database/exams.db`
- **Type:** SQLite3
- **Auto-initialized:** On first backend server start

## Table Relationships

```
students (1) ─────┬──→ (∞) student_answers
                  ├──→ (∞) results
                  └──→ (∞) weekly_reports

exams (1) ────────┬──→ (∞) questions
                  ├──→ (∞) student_answers
                  └──→ (∞) results

questions (1) ────→ (∞) student_answers

admin_users (standalone)
```

## Table Schemas

### 1. students
Stores student information.

```sql
id                INTEGER PRIMARY KEY
full_name         TEXT NOT NULL
symbol_number     TEXT UNIQUE NOT NULL (unique student ID)
course            TEXT NOT NULL (e.g., "Class 12")
shift             TEXT NOT NULL (e.g., "A", "B")
batch             TEXT NOT NULL (e.g., "2023-2024")
created_at        TIMESTAMP (auto-set)
```

**Indexes:**
- `idx_students_course` - On course column
- `idx_students_shift` - On shift column

---

### 2. exams
Stores exam information.

```sql
id                INTEGER PRIMARY KEY
exam_name         TEXT NOT NULL (e.g., "Math Mid-term")
course            TEXT NOT NULL
topic_name        TEXT NOT NULL (e.g., "Trigonometry")
nepali_date       TEXT NOT NULL (date in Nepali format)
shift             TEXT NOT NULL
total_questions   INTEGER DEFAULT 25 (always 25: 10+10+5)
created_at        TIMESTAMP (auto-set)
```

**Indexes:**
- `idx_exams_course` - On course column

---

### 3. questions
Stores exam questions with answer keys.

```sql
id                INTEGER PRIMARY KEY
exam_id           INTEGER NOT NULL → exams(id) CASCADE
question_number   INTEGER NOT NULL (1-25)
section           TEXT NOT NULL CHECK IN ('A', 'B', 'C')
difficulty        TEXT NOT NULL (e.g., "Easy", "Medium", "Hard")
correct_option    TEXT NOT NULL (e.g., "A", "B", "C", "D")
created_at        TIMESTAMP (auto-set)

CONSTRAINT: UNIQUE(exam_id, question_number)
CONSTRAINT: CHECK(section IN ('A', 'B', 'C'))
```

**Section Structure:**
- **Section A:** Questions 1-10 (Easy)
- **Section B:** Questions 11-20 (Understanding)
- **Section C:** Questions 21-25 (Hard/Topper Filter)

**Indexes:**
- `idx_questions_exam_id` - On exam_id column
- `idx_questions_section` - On section column

---

### 4. student_answers
Stores student's answers during exam.

```sql
id                INTEGER PRIMARY KEY
student_id        INTEGER NOT NULL → students(id) CASCADE
exam_id           INTEGER NOT NULL → exams(id) CASCADE
question_number   INTEGER NOT NULL
selected_option   TEXT NOT NULL (student's choice: "A", "B", "C", "D")
is_correct        BOOLEAN NOT NULL DEFAULT 0 (calculated automatically)
created_at        TIMESTAMP (auto-set)

CONSTRAINT: UNIQUE(student_id, exam_id, question_number)
```

**Indexes:**
- `idx_student_answers_exam_id` - On exam_id column
- `idx_student_answers_student_id` - On student_id column

---

### 5. results
Final results and rankings for each student-exam combination.

```sql
id                INTEGER PRIMARY KEY
student_id        INTEGER NOT NULL → students(id) CASCADE
exam_id           INTEGER NOT NULL → exams(id) CASCADE
score             INTEGER NOT NULL (0-25 total points)
percentage        REAL NOT NULL (0-100%)
rank              INTEGER (calculated based on percentage)
section_a_score   INTEGER DEFAULT 0 (0-10)
section_b_score   INTEGER DEFAULT 0 (0-10)
section_c_score   INTEGER DEFAULT 0 (0-5)
created_at        TIMESTAMP (auto-set)

CONSTRAINT: UNIQUE(student_id, exam_id)
```

**Indexes:**
- `idx_results_exam_id` - On exam_id column
- `idx_results_student_id` - On student_id column

---

### 6. weekly_reports
AI-generated and teacher remarks for student performance.

```sql
id                INTEGER PRIMARY KEY
student_id        INTEGER NOT NULL → students(id) CASCADE
week_start        TEXT NOT NULL (date format: YYYY-MM-DD)
week_end          TEXT NOT NULL (date format: YYYY-MM-DD)
ai_feedback       TEXT (AI-generated analysis of performance)
teacher_remark    TEXT (Teacher's comments/feedback)
created_at        TIMESTAMP (auto-set)
```

**Indexes:**
- `idx_weekly_reports_student_id` - On student_id column

---

### 7. admin_users
Administrative users for system access.

```sql
id                INTEGER PRIMARY KEY
username          TEXT UNIQUE NOT NULL
password          TEXT NOT NULL (SHA256 hash - update to bcrypt in production)
created_at        TIMESTAMP (auto-set)
```

**Default Admin:**
- Username: `admin`
- Password: `admin123`

---

## How Ranking Works

### Ranking Algorithm

Ranking is calculated and stored in the `results` table based on exam performance:

1. **Calculate Score:** Total correct answers across all sections (max 25)
2. **Calculate Percentage:** (Score / 25) × 100
3. **Determine Rank:** 
   - Students ranked by percentage in descending order
   - Tied percentages get same rank
   - Rank updated when results are saved

### Ranking Example

| Rank | Student | Score | Percentage |
|------|---------|-------|-----------|
| 1 | Raj Kumar | 24 | 96% |
| 2 | Priya Sharma | 22 | 88% |
| 3 | Sunil Pandey | 20 | 80% |
| 4 | Anita Singh | 15 | 60% |

### Ranking Logic in Code

```javascript
// Get all scores for exam
const allResults = await allQuery(
  'SELECT percentage FROM results WHERE exam_id = ?',
  [examId]
)

// Calculate rank
let rank = 1
for (let i = 0; i < allResults.length; i++) {
  if (allResults[i].percentage > currentPercentage) {
    rank++
  }
}
```

---

## Data Flow for Exam Submission

### 1. Student Completes Exam
- Student answers stored in `student_answers` table
- `is_correct` calculated by comparing with `questions.correct_option`

### 2. Result Calculation
- Score calculated: sum of all correct answers
- Section scores calculated separately (A, B, C)
- Percentage calculated: (score / 25) × 100

### 3. Ranking
- All exam scores compared
- Rank assigned based on percentage
- Result stored in `results` table

### 4. Analytics
- Section-wise performance analyzed
- Weekly report generated
- AI feedback and teacher remarks added

---

## Important Relationships

### Cascade Delete
All foreign keys have `ON DELETE CASCADE`, meaning:
- Deleting a student cascades to: answers, results, weekly_reports
- Deleting an exam cascades to: questions, answers, results

### Unique Constraints
- `students.symbol_number` - Unique per student
- `questions.(exam_id, question_number)` - One question per number per exam
- `student_answers.(student_id, exam_id, question_number)` - One answer per question per student
- `results.(student_id, exam_id)` - One result per student per exam
- `admin_users.username` - Unique usernames

---

## Database Operations

### Available Scripts

```bash
# Initialize database (creates tables)
npm run dev  # Runs automatically on startup

# Reset database completely (DELETE ALL DATA!)
npm run migrate

# Seed sample data and admin account
npm run seed
```

### Helper Functions

Located in `src/database/helpers.js`:

- `runQuery(sql, params)` - INSERT, UPDATE, DELETE
- `getQuery(sql, params)` - Fetch single row
- `allQuery(sql, params)` - Fetch all rows
- `transactionQuery(queries)` - Multi-query transaction
- `countQuery(table, whereClause)` - Count records
- `paginatedQuery(sql, params, page, pageSize)` - Pagination
- `existsQuery(table, whereClause, params)` - Check existence
- `distinctQuery(table, column, whereClause)` - Get distinct values

### Analytics Functions

Located in `src/database/analytics.js`:

- `calculateExamResult(studentId, examId)` - Calculate score and percentage
- `saveExamResult(studentId, examId)` - Save result with ranking
- `getStudentPerformance(studentId, examId)` - Get performance summary
- `getExamRankings(examId, limit)` - Get top performers
- `getClassSectionAnalysis(examId)` - Get class-wide analysis
- `getWeeklyReport(studentId, weekStart, weekEnd)` - Get weekly report
- `saveWeeklyReport(...)` - Save/update weekly report

---

## Query Examples

### Get top 10 students in exam
```sql
SELECT r.rank, r.percentage, r.score, s.full_name, s.symbol_number
FROM results r
JOIN students s ON r.student_id = s.id
WHERE r.exam_id = 1
ORDER BY r.rank ASC
LIMIT 10
```

### Get class performance statistics
```sql
SELECT 
  COUNT(*) as total_students,
  AVG(section_a_score) as avg_section_a,
  AVG(section_b_score) as avg_section_b,
  AVG(section_c_score) as avg_section_c,
  AVG(percentage) as avg_percentage
FROM results
WHERE exam_id = 1
```

### Get student's exam answers with correctness
```sql
SELECT sa.*, q.correct_option, q.section
FROM student_answers sa
JOIN questions q ON q.exam_id = sa.exam_id AND q.question_number = sa.question_number
WHERE sa.student_id = 1 AND sa.exam_id = 1
ORDER BY q.section, q.question_number
```

---

## Performance Optimization

### Indexes Created
- Course and shift indexing for quick student filtering
- Exam-id indexing for quick exam lookups
- Student-id and exam-id indexing for answer/result queries
- Section indexing for question filtering

### Future Optimizations
- Add database connection pooling
- Implement query caching for frequently accessed data
- Add views for complex joins
- Implement data archiving for old exams

---

## Backup and Migration

### Export Data
```bash
# Export specific table to CSV
sqlite3 backend/database/exams.db ".mode csv" ".output students.csv" "SELECT * FROM students;"
```

### Import Data
```bash
# Import CSV to table
sqlite3 backend/database/exams.db ".mode csv" ".import students.csv students"
```

---

## File Locations

- **Database:** `backend/database/exams.db`
- **Schema:** `backend/src/database/schema.js`
- **Helpers:** `backend/src/database/helpers.js`
- **Analytics:** `backend/src/database/analytics.js`
- **Connection:** `backend/src/database/connection.js`
- **Migration:** `backend/src/database/migrate.js`
- **Seeding:** `backend/src/database/seed.js`

---

## Next Steps

1. **API Controllers** - Create endpoints for exams, students, results
2. **Authentication** - Implement admin login
3. **Data Import** - Bulk upload students/questions from CSV
4. **Analytics Dashboard** - Visualize rankings and performance
5. **Reports** - Generate PDF reports
6. **Caching** - Optimize frequently accessed queries
