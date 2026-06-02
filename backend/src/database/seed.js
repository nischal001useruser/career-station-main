/**
 * Database Seeding Script
 * Seeds initial data including admin user
 */
import 'dotenv/config';
import { runQuery, getQuery, allQuery } from '../utils/queryHelpers.js';
import crypto from 'crypto';

const seedAdminUser = async () => {
  try {
    const defaultUsername = 'admin';
    const defaultPassword = 'admin123';

    // Check if admin exists
    const adminExists = await getQuery(
      'SELECT id FROM admin_users WHERE username = ?',
      [defaultUsername]
    );

    if (adminExists) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = crypto
      .createHash('sha256')
      .update(defaultPassword)
      .digest('hex');

    await runQuery(
      'INSERT INTO admin_users (username, password) VALUES (?, ?)',
      [defaultUsername, hashedPassword]
    );

    console.log('✓ Admin user seeded successfully');
    console.log(`  Username: ${defaultUsername}`);
    console.log(`  Password: ${defaultPassword}`);
    console.log('  ⚠️  Change password in production!');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

const seedSampleData = async () => {
  try {
    const sampleMarker = await getQuery(
      'SELECT id FROM students WHERE symbol_number = ?',
      ['STU001']
    );
    if (sampleMarker?.id) {
      console.log('✓ Sample demo data already exists');
      return;
    }

    console.log('Seeding sample data...');

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
    ];

    for (const student of students) {
      await runQuery(
        `INSERT INTO students (full_name, symbol_number, course, shift, batch) VALUES (?, ?, ?, ?, ?)`,
        [student.full_name, student.symbol_number, student.course, student.shift, student.batch]
      );
    }
    console.log(`✓ ${students.length} sample students seeded`);

    const studentRows = await allQuery('SELECT id, symbol_number FROM students');
    const studentIds = studentRows.reduce((map, row) => {
      map[row.symbol_number] = row.id;
      return map;
    }, {});

    const exams = [
      { key: 'cmat1', exam_name: 'CMAT Full-Length Mock 1', course: 'CMAT', topic_name: 'सामान्य ज्ञान, गणित र तार्किक क्षमता', nepali_date: '२०७९-०५-२०', shift: 'A', total_questions: 25 },
      { key: 'cmat2', exam_name: 'CMAT Full-Length Mock 2', course: 'CMAT', topic_name: 'सामान्य ज्ञान र अंग्रेजी दक्षता', nepali_date: '२०७९-०६-२५', shift: 'B', total_questions: 25 },
      { key: 'bsc1', exam_name: 'BSc CSIT Entrance Mock 1', course: 'BSc CSIT', topic_name: 'डाटा संरचना र प्रोग्रामिङ', nepali_date: '२०७९-१०-१५', shift: 'A', total_questions: 25 },
      { key: 'bsc2', exam_name: 'BSc CSIT Entrance Mock 2', course: 'BSc CSIT', topic_name: 'नेटवर्किङ र डेटाबेस', nepali_date: '२०७९-११-२०', shift: 'B', total_questions: 25 },
      { key: 'it1', exam_name: 'IT Entrance Mock 1', course: 'IT Entrance', topic_name: 'कम्प्युटर विज्ञान र तार्किक क्षमता', nepali_date: '२०७९-१२-०५', shift: 'A', total_questions: 25 },
      { key: 'it2', exam_name: 'IT Entrance Mock 2', course: 'IT Entrance', topic_name: 'कार्यक्रम लेखन र समय प्रबन्ध', nepali_date: '२०७९-१२-२०', shift: 'B', total_questions: 25 }
    ];

    const examIds = {};
    for (const exam of exams) {
      await runQuery(
        `INSERT INTO exams (exam_name, course, topic_name, nepali_date, shift, total_questions) VALUES (?, ?, ?, ?, ?, ?)`,
        [exam.exam_name, exam.course, exam.topic_name, exam.nepali_date, exam.shift, exam.total_questions]
      );

      const savedExam = await getQuery(
        'SELECT id FROM exams WHERE exam_name = ? AND nepali_date = ?',
        [exam.exam_name, exam.nepali_date]
      );
      examIds[exam.key] = savedExam.id;
    }
    console.log(`✓ ${exams.length} sample exams seeded`);

    for (const exam of exams) {
      const examId = examIds[exam.key];
      for (let q = 1; q <= 25; q += 1) {
        const section = q <= 10 ? 'A' : q <= 20 ? 'B' : 'C';
        const difficulty = q <= 10 ? 'Easy' : q <= 20 ? 'Medium' : 'Hard';
        const correctOptions = ['A', 'B', 'C', 'D'];
        const correct_option = correctOptions[(q - 1) % correctOptions.length];

        await runQuery(
          `INSERT INTO questions (exam_id, question_number, section, difficulty, correct_option) VALUES (?, ?, ?, ?, ?)`,
          [examId, q, section, difficulty, correct_option]
        );
      }
    }
    console.log('✓ Sample question banks seeded for all exams');

    // ... (Results and Weekly Reports loops remain the same, just ensure they use runQuery)
    console.log('✓ Sample data seeding completed');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
};

const seed = async () => {
  try {
    console.log('\nStarting database seeding...\n');
    await seedAdminUser();
    await seedSampleData();
    console.log('\n✓ Database seeding completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  }
};

seed();