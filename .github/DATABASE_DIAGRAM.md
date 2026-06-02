# Career Station - Database Entity Relationship Diagram

## Tables and Relationships

```
┌──────────────────┐
│   admin_users    │
├──────────────────┤
│ id (PK)          │
│ username (UNIQUE)│
│ password         │
│ created_at       │
└──────────────────┘


┌──────────────────────────────────────────────────────────┐
│                     students                              │
├──────────────────────────────────────────────────────────┤
│ id (PK)                                                  │
│ full_name                                                │
│ symbol_number (UNIQUE)                                   │
│ course                    ─┐                              │
│ shift                      │  ┌─→ [INDEXES]              │
│ batch                      └──┤  idx_students_course      │
│ created_at                    │  idx_students_shift       │
└──────────────────────────────────────────────────────────┘
          │
          │ (1:N)
          ├─────────────────────────────────┐
          │                                 │
          │                                 │
          ▼                                 ▼
  ┌──────────────────────┐      ┌──────────────────────┐
  │ student_answers      │      │ results              │
  ├──────────────────────┤      ├──────────────────────┤
  │ id (PK)              │      │ id (PK)              │
  │ student_id (FK)      │      │ student_id (FK) ────┐│
  │ exam_id (FK)    ─┐   │      │ exam_id (FK) ────┐   ││
  │ question_number  │   │      │ score            │   ││
  │ selected_option  │   │      │ percentage       │   ││
  │ is_correct       │   │      │ rank             │   ││
  │ created_at       │   │      │ section_a_score  │   ││
  └──────────────────────┘      │ section_b_score  │   ││
                │                │ section_c_score  │   ││
                │                │ created_at       │   ││
                │                └──────────────────────┘│
                │                  │                    │
          ┌─────┘                  │                    │
          │                        │                    │
          ▼                        ▼                    ▼
  ┌──────────────────────────────────────────────────────┐
  │                  exams                               │
  ├──────────────────────────────────────────────────────┤
  │ id (PK)                                              │
  │ exam_name                                            │
  │ course              ─┐     ┌──→ [INDEXES]            │
  │ topic_name           ├────┤    idx_exams_course     │
  │ nepali_date          │    └──→ [CONSTRAINT]          │
  │ shift               │     total_questions = 25       │
  │ total_questions = 25│     (10+10+5)                  │
  │ created_at          │                                │
  └──────────────────────────────────────────────────────┘
          │
          │ (1:N)
          ▼
  ┌──────────────────────┐
  │ questions            │
  ├──────────────────────┤
  │ id (PK)              │
  │ exam_id (FK)         │
  │ question_number      │
  │ section (A/B/C)  ┌───┼──→ Section A: Q1-Q10 (Easy)
  │ difficulty       │   │     Section B: Q11-Q20 (Understanding)
  │ correct_option   └───┼──→ Section C: Q21-Q25 (Hard)
  │ created_at           │
  └──────────────────────┘


          ┌──────────────────────────────┐
          │   weekly_reports             │
          ├──────────────────────────────┤
          │ id (PK)                      │
          │ student_id (FK) ────────┐    │
          │ week_start (YYYY-MM-DD) │    │
          │ week_end (YYYY-MM-DD)   │    │
          │ ai_feedback             │    │
          │ teacher_remark          │    │
          │ created_at              │    │
          └──────────────────────────────┘
                          ▲
                          │
                          │ References students(id)
                          │ CASCADE DELETE
```

## Key Relationships

### 1. Students → Student Answers (1:N)
- One student can have many answers across exams
- **Foreign Key:** `student_answers.student_id` → `students.id`
- **Cascade:** DELETE student cascades to all their answers

### 2. Students → Results (1:N)
- One student can have many exam results
- **Foreign Key:** `results.student_id` → `students.id`
- **Cascade:** DELETE student cascades to all their results
- **Unique:** One result per student per exam

### 3. Students → Weekly Reports (1:N)
- One student can have many weekly reports
- **Foreign Key:** `weekly_reports.student_id` → `students.id`
- **Cascade:** DELETE student cascades to all their reports

### 4. Exams → Questions (1:N)
- One exam has exactly 25 questions (10+10+5)
- **Foreign Key:** `questions.exam_id` → `exams.id`
- **Cascade:** DELETE exam cascades to all questions
- **Unique:** One question per question_number per exam

### 5. Exams → Student Answers (1:N)
- One exam has many student answers (from different students)
- **Foreign Key:** `student_answers.exam_id` → `exams.id`
- **Cascade:** DELETE exam cascades to all answers

### 6. Exams → Results (1:N)
- One exam has many student results
- **Foreign Key:** `results.exam_id` → `exams.id`
- **Cascade:** DELETE exam cascades to all results

### 7. Questions → Student Answers (1:N)
- One question can be answered by many students
- **Relationship:** Through `exam_id` and `question_number` matching

---

## Data Flow

### Exam Submission Flow
```
Student Starts Exam
       │
       ▼
   [Exam Displayed]
   Questions loaded from questions table
       │
       ▼
Student Answers Questions
       │
       ▼
   [Answers Stored]
   Inserted into student_answers table
       │
       ▼
   [Correctness Checked]
   is_correct = (selected_option == correct_option)
       │
       ▼
   [Result Calculated]
   Score = SUM of is_correct
   Percentage = (Score / 25) × 100
   Section Scores = breakdown by A, B, C
       │
       ▼
   [Ranking Calculated]
   Rank = position among all exam takers
       │
       ▼
   [Result Stored]
   Inserted into results table
```

### Analytics Flow
```
Results Table
       │
       ├──→ Ranking Analysis
       │    (Get top 10, bottom performers)
       │
       ├──→ Section Analysis
       │    (Avg performance per section A, B, C)
       │
       ├──→ Class Statistics
       │    (Overall class performance)
       │
       └──→ Weekly Reports
            (Generate AI feedback & teacher remarks)
```

---

## Ranking System Details

### How Ranking is Calculated

1. **Score:** Total correct answers (0-25)
2. **Percentage:** (Score / 25) × 100 = 0-100%
3. **Rank:** Position in descending percentage order

### Ranking Example
```
Exam 1 Results:

| Rank | Symbol# | Name          | Score | % | Sections A/B/C |
|------|---------|---------------|-------|---|----------------|
| 1    | STU001  | Raj Kumar     | 24    |96%| 10/10/4        |
| 2    | STU003  | Sunil Pandey  | 22    |88%| 10/8/4         |
| 3    | STU002  | Priya Sharma  | 20    |80%| 9/9/2          |
| 4    | STU004  | Anita Singh   | 15    |60%| 8/5/2          |
```

### Ranking Query
```sql
SELECT 
  r.rank,
  r.percentage,
  r.score,
  s.full_name,
  s.symbol_number,
  r.section_a_score,
  r.section_b_score,
  r.section_c_score
FROM results r
JOIN students s ON r.student_id = s.id
WHERE r.exam_id = ?
ORDER BY r.rank ASC
```

---

## Section Structure

### Section A (Easy) - 10 Questions
- Questions 1-10
- Tests basic understanding
- Full marks: 10

### Section B (Understanding) - 10 Questions
- Questions 11-20
- Tests application knowledge
- Full marks: 10

### Section C (Hard/Topper Filter) - 5 Questions
- Questions 21-25
- Tests advanced concepts
- For top performers
- Full marks: 5

**Total: 25 questions, 25 marks**

---

## Indexes for Performance

```
TABLE: students
├── idx_students_course (course)
└── idx_students_shift (shift)

TABLE: exams
└── idx_exams_course (course)

TABLE: questions
├── idx_questions_exam_id (exam_id)
└── idx_questions_section (section)

TABLE: student_answers
├── idx_student_answers_exam_id (exam_id)
└── idx_student_answers_student_id (student_id)

TABLE: results
├── idx_results_exam_id (exam_id)
└── idx_results_student_id (student_id)

TABLE: weekly_reports
└── idx_weekly_reports_student_id (student_id)
```

These indexes optimize queries for:
- Filtering students by course/shift
- Finding all answers for an exam/student
- Calculating rankings
- Generating reports
