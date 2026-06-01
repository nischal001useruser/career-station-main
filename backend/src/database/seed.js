/**
 * Database Seeding Script
 * Seeds initial data including admin user
 */

import { initDatabase, closeDatabase } from './connection.js'
import { runQuery, getQuery, allQuery } from './helpers.js'
import crypto from 'crypto'

const seedAdminUser = async () => {
  try {
    const defaultUsername = 'admin'
    const defaultPassword = 'admin123'

    // Check if admin exists
    const adminExists = await getQuery(
      'SELECT id FROM admin_users WHERE username = ?',
      [defaultUsername]
    )

    if (adminExists) {
      console.log('✓ Admin user already exists')
      return
    }

    // Hash password (simple hash for now - use bcrypt in production)
    const hashedPassword = crypto
      .createHash('sha256')
      .update(defaultPassword)
      .digest('hex')

    await runQuery(
      'INSERT INTO admin_users (username, password) VALUES (?, ?)',
      [defaultUsername, hashedPassword]
    )

    console.log('✓ Admin user seeded successfully')
    console.log(`  Username: ${defaultUsername}`)
    console.log(`  Password: ${defaultPassword}`)
    console.log('  ⚠️  Change password in production!')
  } catch (error) {
    console.error('Error seeding admin user:', error)
  }
}

const seedSampleData = async () => {
  try {
    // Detect whether the demo dataset has already been seeded
    const sampleMarker = await getQuery(
      'SELECT id FROM students WHERE symbol_number = ?',
      ['STU001']
    )
    if (sampleMarker?.id) {
      console.log('✓ Sample demo data already exists')
      return
    }

    console.log('Seeding sample data...')

    const students = [
      { full_name: 'राज कुमार', symbol_number: 'STU001', course: 'Class 12', shift: 'A', batch: '2023-2024' },
      { full_name: 'प्रिया शर्मा', symbol_number: 'STU002', course: 'Class 12', shift: 'A', batch: '2023-2024' },
      { full_name: 'सुनील पाण्डे', symbol_number: 'STU003', course: 'Class 12', shift: 'B', batch: '2023-2024' },
      { full_name: 'सिता अधिकारी', symbol_number: 'STU004', course: 'Class 12', shift: 'B', batch: '2023-2024' },
      { full_name: 'मनोज बस्नेत', symbol_number: 'STU005', course: 'Class 12', shift: 'A', batch: '2023-2024' },
      { full_name: 'कविता महतो', symbol_number: 'STU006', course: 'Class 12', shift: 'B', batch: '2023-2024' },
      { full_name: 'रोहित अधिकारी', symbol_number: 'STU007', course: 'Class 12', shift: 'A', batch: '2023-2024' },
      { full_name: 'सृष्टि राई', symbol_number: 'STU008', course: 'Class 12', shift: 'B', batch: '2023-2024' },
      { full_name: 'दीपक श्रेष्ठ', symbol_number: 'STU009', course: 'BSc CSIT', shift: 'A', batch: '2023-2024' },
      { full_name: 'निशा भट्ट', symbol_number: 'STU010', course: 'BSc CSIT', shift: 'A', batch: '2023-2024' },
      { full_name: 'अर्जुन थापा', symbol_number: 'STU011', course: 'BSc CSIT', shift: 'B', batch: '2023-2024' },
      { full_name: 'पूजा गैरे', symbol_number: 'STU012', course: 'BSc CSIT', shift: 'B', batch: '2023-2024' },
      { full_name: 'अनिल गुरुङ', symbol_number: 'STU013', course: 'BSc CSIT', shift: 'A', batch: '2023-2024' },
      { full_name: 'मीरा कार्की', symbol_number: 'STU014', course: 'BSc CSIT', shift: 'A', batch: '2023-2024' },
      { full_name: 'सरिता नेपाल', symbol_number: 'STU015', course: 'BSc CSIT', shift: 'B', batch: '2023-2024' },
      { full_name: 'प्रवीण चौधरी', symbol_number: 'STU016', course: 'BSc CSIT', shift: 'B', batch: '2023-2024' },
      { full_name: 'सुमन खनाल', symbol_number: 'STU017', course: 'BSc CSIT', shift: 'A', batch: '2023-2024' },
      { full_name: 'निकिता दाहाल', symbol_number: 'STU018', course: 'IT Entrance', shift: 'A', batch: '2024-2025' },
      { full_name: 'राजेश कार्की', symbol_number: 'STU019', course: 'IT Entrance', shift: 'B', batch: '2024-2025' },
      { full_name: 'बिनीता अधिकारी', symbol_number: 'STU020', course: 'IT Entrance', shift: 'A', batch: '2024-2025' },
      { full_name: 'अजय वर्मा', symbol_number: 'STU021', course: 'IT Entrance', shift: 'B', batch: '2024-2025' },
      { full_name: 'रेखा पोखरेल', symbol_number: 'STU022', course: 'IT Entrance', shift: 'A', batch: '2024-2025' },
      { full_name: 'धीरेज श्रेष्ठ', symbol_number: 'STU023', course: 'IT Entrance', shift: 'B', batch: '2024-2025' },
      { full_name: 'नेहा राई', symbol_number: 'STU024', course: 'IT Entrance', shift: 'A', batch: '2024-2025' },
      { full_name: 'करण सुनुवार', symbol_number: 'STU025', course: 'IT Entrance', shift: 'B', batch: '2024-2025' }
    ]

    for (const student of students) {
      await runQuery(
        `INSERT INTO students (full_name, symbol_number, course, shift, batch)
         VALUES (?, ?, ?, ?, ?)`,
        [student.full_name, student.symbol_number, student.course, student.shift, student.batch]
      )
    }
    console.log(`✓ ${students.length} sample students seeded`)

    const studentRows = await allQuery('SELECT id, symbol_number FROM students')
    const studentIds = studentRows.reduce((map, row) => {
      map[row.symbol_number] = row.id
      return map
    }, {})

    const exams = [
      { key: 'cmat1', exam_name: 'CMAT Full-Length Mock 1', course: 'CMAT', topic_name: 'सामान्य ज्ञान, गणित र तार्किक क्षमता', nepali_date: '२०७९-०५-२०', shift: 'A', total_questions: 25 },
      { key: 'cmat2', exam_name: 'CMAT Full-Length Mock 2', course: 'CMAT', topic_name: 'सामान्य ज्ञान र अंग्रेजी दक्षता', nepali_date: '२०७९-०६-२५', shift: 'B', total_questions: 25 },
      { key: 'bsc1', exam_name: 'BSc CSIT Entrance Mock 1', course: 'BSc CSIT', topic_name: 'डाटा संरचना र प्रोग्रामिङ', nepali_date: '२०७९-१०-१५', shift: 'A', total_questions: 25 },
      { key: 'bsc2', exam_name: 'BSc CSIT Entrance Mock 2', course: 'BSc CSIT', topic_name: 'नेटवर्किङ र डेटाबेस', nepali_date: '२०७९-११-२०', shift: 'B', total_questions: 25 },
      { key: 'it1', exam_name: 'IT Entrance Mock 1', course: 'IT Entrance', topic_name: 'कम्प्युटर विज्ञान र तार्किक क्षमता', nepali_date: '२०७९-१२-०५', shift: 'A', total_questions: 25 },
      { key: 'it2', exam_name: 'IT Entrance Mock 2', course: 'IT Entrance', topic_name: 'कार्यक्रम लेखन र समय प्रबन्ध', nepali_date: '२०७९-१२-२०', shift: 'B', total_questions: 25 }
    ]

    const examIds = {}
    for (const exam of exams) {
      await runQuery(
        `INSERT INTO exams (exam_name, course, topic_name, nepali_date, shift, total_questions)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [exam.exam_name, exam.course, exam.topic_name, exam.nepali_date, exam.shift, exam.total_questions]
      )

      const savedExam = await getQuery(
        'SELECT id FROM exams WHERE exam_name = ? AND nepali_date = ?',
        [exam.exam_name, exam.nepali_date]
      )
      examIds[exam.key] = savedExam.id
    }
    console.log(`✓ ${exams.length} sample exams seeded`)

    for (const exam of exams) {
      const examId = examIds[exam.key]
      for (let q = 1; q <= 25; q += 1) {
        const section = q <= 10 ? 'A' : q <= 20 ? 'B' : 'C'
        const difficulty = q <= 10 ? 'Easy' : q <= 20 ? 'Medium' : 'Hard'
        const correctOptions = ['A', 'B', 'C', 'D']
        const correct_option = correctOptions[(q - 1) % correctOptions.length]

        await runQuery(
          `INSERT INTO questions (exam_id, question_number, section, difficulty, correct_option)
           VALUES (?, ?, ?, ?, ?)`,
          [examId, q, section, difficulty, correct_option]
        )
      }
    }
    console.log('✓ Sample question banks seeded for all exams')

    const results = [
      { symbol_number: 'STU001', examKey: 'cmat1', score: 23, percentage: 92.0, rank: 1, section_a_score: 8, section_b_score: 9, section_c_score: 6 },
      { symbol_number: 'STU005', examKey: 'cmat1', score: 23, percentage: 92.0, rank: 1, section_a_score: 9, section_b_score: 8, section_c_score: 6 },
      { symbol_number: 'STU003', examKey: 'cmat1', score: 21, percentage: 84.0, rank: 3, section_a_score: 8, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU002', examKey: 'cmat1', score: 20, percentage: 80.0, rank: 4, section_a_score: 7, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU004', examKey: 'cmat1', score: 18, percentage: 72.0, rank: 5, section_a_score: 6, section_b_score: 8, section_c_score: 4 },
      { symbol_number: 'STU006', examKey: 'cmat1', score: 17, percentage: 68.0, rank: 6, section_a_score: 7, section_b_score: 6, section_c_score: 4 },
      { symbol_number: 'STU007', examKey: 'cmat1', score: 16, percentage: 64.0, rank: 7, section_a_score: 6, section_b_score: 6, section_c_score: 4 },
      { symbol_number: 'STU008', examKey: 'cmat1', score: 15, percentage: 60.0, rank: 8, section_a_score: 5, section_b_score: 6, section_c_score: 4 },
      { symbol_number: 'STU001', examKey: 'cmat2', score: 24, percentage: 96.0, rank: 1, section_a_score: 9, section_b_score: 10, section_c_score: 5 },
      { symbol_number: 'STU005', examKey: 'cmat2', score: 24, percentage: 96.0, rank: 1, section_a_score: 10, section_b_score: 9, section_c_score: 5 },
      { symbol_number: 'STU003', examKey: 'cmat2', score: 22, percentage: 88.0, rank: 3, section_a_score: 8, section_b_score: 9, section_c_score: 5 },
      { symbol_number: 'STU002', examKey: 'cmat2', score: 21, percentage: 84.0, rank: 4, section_a_score: 8, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU004', examKey: 'cmat2', score: 19, percentage: 76.0, rank: 5, section_a_score: 7, section_b_score: 8, section_c_score: 4 },
      { symbol_number: 'STU006', examKey: 'cmat2', score: 18, percentage: 72.0, rank: 6, section_a_score: 6, section_b_score: 8, section_c_score: 4 },
      { symbol_number: 'STU007', examKey: 'cmat2', score: 17, percentage: 68.0, rank: 7, section_a_score: 6, section_b_score: 7, section_c_score: 4 },
      { symbol_number: 'STU008', examKey: 'cmat2', score: 16, percentage: 64.0, rank: 8, section_a_score: 5, section_b_score: 7, section_c_score: 4 },
      { symbol_number: 'STU009', examKey: 'bsc1', score: 24, percentage: 96.0, rank: 1, section_a_score: 9, section_b_score: 10, section_c_score: 5 },
      { symbol_number: 'STU012', examKey: 'bsc1', score: 24, percentage: 96.0, rank: 1, section_a_score: 10, section_b_score: 9, section_c_score: 5 },
      { symbol_number: 'STU010', examKey: 'bsc1', score: 22, percentage: 88.0, rank: 3, section_a_score: 8, section_b_score: 9, section_c_score: 5 },
      { symbol_number: 'STU011', examKey: 'bsc1', score: 21, percentage: 84.0, rank: 4, section_a_score: 8, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU013', examKey: 'bsc1', score: 20, percentage: 80.0, rank: 5, section_a_score: 7, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU014', examKey: 'bsc1', score: 19, percentage: 76.0, rank: 6, section_a_score: 7, section_b_score: 7, section_c_score: 5 },
      { symbol_number: 'STU015', examKey: 'bsc1', score: 18, percentage: 72.0, rank: 7, section_a_score: 6, section_b_score: 7, section_c_score: 5 },
      { symbol_number: 'STU016', examKey: 'bsc1', score: 17, percentage: 68.0, rank: 8, section_a_score: 6, section_b_score: 6, section_c_score: 5 },
      { symbol_number: 'STU017', examKey: 'bsc1', score: 16, percentage: 64.0, rank: 9, section_a_score: 5, section_b_score: 6, section_c_score: 5 },
      { symbol_number: 'STU009', examKey: 'bsc2', score: 25, percentage: 100.0, rank: 1, section_a_score: 10, section_b_score: 10, section_c_score: 5 },
      { symbol_number: 'STU012', examKey: 'bsc2', score: 25, percentage: 100.0, rank: 1, section_a_score: 10, section_b_score: 10, section_c_score: 5 },
      { symbol_number: 'STU010', examKey: 'bsc2', score: 23, percentage: 92.0, rank: 3, section_a_score: 9, section_b_score: 9, section_c_score: 5 },
      { symbol_number: 'STU011', examKey: 'bsc2', score: 22, percentage: 88.0, rank: 4, section_a_score: 8, section_b_score: 9, section_c_score: 5 },
      { symbol_number: 'STU013', examKey: 'bsc2', score: 21, percentage: 84.0, rank: 5, section_a_score: 8, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU014', examKey: 'bsc2', score: 20, percentage: 80.0, rank: 6, section_a_score: 7, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU015', examKey: 'bsc2', score: 19, percentage: 76.0, rank: 7, section_a_score: 6, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU016', examKey: 'bsc2', score: 18, percentage: 72.0, rank: 8, section_a_score: 6, section_b_score: 7, section_c_score: 5 },
      { symbol_number: 'STU017', examKey: 'bsc2', score: 17, percentage: 68.0, rank: 9, section_a_score: 5, section_b_score: 7, section_c_score: 5 },
      { symbol_number: 'STU018', examKey: 'it1', score: 22, percentage: 88.0, rank: 1, section_a_score: 8, section_b_score: 9, section_c_score: 5 },
      { symbol_number: 'STU022', examKey: 'it1', score: 22, percentage: 88.0, rank: 1, section_a_score: 9, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU020', examKey: 'it1', score: 20, percentage: 80.0, rank: 3, section_a_score: 8, section_b_score: 7, section_c_score: 5 },
      { symbol_number: 'STU019', examKey: 'it1', score: 19, percentage: 76.0, rank: 4, section_a_score: 7, section_b_score: 7, section_c_score: 5 },
      { symbol_number: 'STU021', examKey: 'it1', score: 18, percentage: 72.0, rank: 5, section_a_score: 7, section_b_score: 6, section_c_score: 5 },
      { symbol_number: 'STU023', examKey: 'it1', score: 15, percentage: 60.0, rank: 6, section_a_score: 5, section_b_score: 5, section_c_score: 5 },
      { symbol_number: 'STU024', examKey: 'it1', score: 17, percentage: 68.0, rank: 7, section_a_score: 6, section_b_score: 6, section_c_score: 5 },
      { symbol_number: 'STU025', examKey: 'it1', score: 16, percentage: 64.0, rank: 8, section_a_score: 5, section_b_score: 6, section_c_score: 5 },
      { symbol_number: 'STU018', examKey: 'it2', score: 23, percentage: 92.0, rank: 1, section_a_score: 9, section_b_score: 9, section_c_score: 5 },
      { symbol_number: 'STU022', examKey: 'it2', score: 23, percentage: 92.0, rank: 1, section_a_score: 10, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU020', examKey: 'it2', score: 21, percentage: 84.0, rank: 3, section_a_score: 8, section_b_score: 8, section_c_score: 5 },
      { symbol_number: 'STU019', examKey: 'it2', score: 20, percentage: 80.0, rank: 4, section_a_score: 8, section_b_score: 7, section_c_score: 5 },
      { symbol_number: 'STU021', examKey: 'it2', score: 19, percentage: 76.0, rank: 5, section_a_score: 7, section_b_score: 7, section_c_score: 5 },
      { symbol_number: 'STU023', examKey: 'it2', score: 16, percentage: 64.0, rank: 6, section_a_score: 5, section_b_score: 6, section_c_score: 5 },
      { symbol_number: 'STU024', examKey: 'it2', score: 18, percentage: 72.0, rank: 7, section_a_score: 6, section_b_score: 7, section_c_score: 5 },
      { symbol_number: 'STU025', examKey: 'it2', score: 17, percentage: 68.0, rank: 8, section_a_score: 6, section_b_score: 6, section_c_score: 5 }
    ]

    for (const result of results) {
      const studentId = studentIds[result.symbol_number]
      const examId = examIds[result.examKey]
      await runQuery(
        `INSERT INTO results (student_id, exam_id, score, percentage, rank, section_a_score, section_b_score, section_c_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentId,
          examId,
          result.score,
          result.percentage,
          result.rank,
          result.section_a_score,
          result.section_b_score,
          result.section_c_score
        ]
      )
    }
    console.log(`✓ ${results.length} sample results seeded`)

    const weeklyReports = [
      {
        symbol_number: 'STU001',
        week_start: '२०७९-०५-०१',
        week_end: '२०७९-०५-०७',
        ai_feedback: 'राजले पहिलो साता सामान्य ज्ञान र तार्किक अंशमा नियमित सुधार देखाए। प्राथमिक ध्यानगर्ने क्षेत्र C सेक्शनमा समय व्यवस्थापन र उत्तर लेख्ने चाँडोपनमा छ।',
        teacher_remark: 'राजले राम्रो तयारी देखायो, यस हप्ता फेला परेका त्रुटिहरू व्याख्या गर्नुहोस् र C सेक्शनका प्रारम्भिक प्रश्नहरू दोहोर्याउनुहोस्।'
      },
      {
        symbol_number: 'STU001',
        week_start: '२०७९-०५-०८',
        week_end: '२०७९-०५-१४',
        ai_feedback: 'दोस्रो हप्तामा राजले समय सीमा भित्र काम पुरा गर्न थाले र क्षेत्र B मा राम्रो प्रतिक्रिया दिए। अझै पनि केही प्रश्नहरुमा अधिक ध्यान दिन आवश्यक छ।',
        teacher_remark: 'दोस्रो हप्तामा प्रदर्शन सकारात्मक छ। अब अभ्यास सेटहरूमा A र B सेक्शनलाई समान प्राथमिकता दिनुहोस्।'
      },
      {
        symbol_number: 'STU009',
        week_start: '२०७९-१०-०१',
        week_end: '२०७९-१०-०७',
        ai_feedback: 'दीपकले डाटा संरचना र प्रोग्रामिङ भागमा सटीक उत्तरहरू दिई उत्कृष्ट स्थिरता देखायो। भाग C मा १००% सही हुन नजिक छ।',
        teacher_remark: 'दीपकले उत्कृष्ट गति र समझ देखाइरहेका छन्। अर्को हप्ता नेटवर्किङ अभ्यासमा ध्यान दिनुहोस्।'
      },
      {
        symbol_number: 'STU015',
        week_start: '२०७९-११-०१',
        week_end: '२०७९-११-०७',
        ai_feedback: 'सरिताले समस्या समाधानमा भरपूर प्रयास गरिन्, तर डेटा संरचनामा केही अवधारणा अस्पष्ट छन्। नियमित रिविजनले आत्मविश्वास बढाउँछ।',
        teacher_remark: 'सरिताको आधार बलियो छ। C सेक्शन र बिग-ओ विश्लेषणको व्यायाममा समय दिनुहोस्।'
      },
      {
        symbol_number: 'STU022',
        week_start: '२०७९-१२-०१',
        week_end: '२०७९-१२-०७',
        ai_feedback: 'रेखाले तार्किक प्रश्न र कम्प्युटर सिद्धान्तमा राम्रो पकड देखाइन्। समय प्रबन्ध सुधार गर्दा IT entrance मा प्रतिस्पर्धात्मक अग्रता हुन्छ।',
        teacher_remark: 'अगाडि बढ्दैछिन्। जटिल प्रश्नहरूमा गति बढाउन नियमित मॉक अभ्यास जारी राख्नुहोस्।'
      },
      {
        symbol_number: 'STU023',
        week_start: '२०७९-१२-०१',
        week_end: '२०७९-१२-०७',
        ai_feedback: 'धिरेजले कमजोर विषयहरू चिन्न थालेका छन् तर अझै परीक्षण वातावरणमा तनावले प्रदर्शन घटाइरहेको छ। सरल प्रश्नमा स्पष्टता आवश्यक छ।',
        teacher_remark: 'अर्को हप्ताको लागि संक्षिप्त पाठ्यक्रम र दोहोरिने नोट्स तयार गर्नुहोस्। विशेष गरी गणित र तार्किक भागमा ध्यान दिनुहोस्।'
      }
    ]

    for (const report of weeklyReports) {
      const studentId = studentIds[report.symbol_number]
      await runQuery(
        `INSERT INTO weekly_reports (student_id, week_start, week_end, ai_feedback, teacher_remark)
         VALUES (?, ?, ?, ?, ?)`,
        [studentId, report.week_start, report.week_end, report.ai_feedback, report.teacher_remark]
      )
    }
    console.log(`✓ ${weeklyReports.length} weekly reports seeded`)

  } catch (error) {
    console.error('Error seeding sample data:', error)
  }
}

const seed = async () => {
  try {
    await initDatabase()
    console.log('\nStarting database seeding...\n')

    await seedAdminUser()
    await seedSampleData()

    console.log('\n✓ Database seeding completed!\n')
    closeDatabase()
    process.exit(0)
  } catch (error) {
    console.error('Fatal error during seeding:', error)
    process.exit(1)
  }
}

seed()
