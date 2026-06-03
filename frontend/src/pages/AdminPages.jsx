import { API_BASE_URL } from '../config/api'

import { useEffect, useState } from 'react'


import { Pie, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js'
import { chartColors, chartOptions } from '../charts/chartConfig'
import { useAuth } from '../context/AuthContext'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement)

const createQuestionRows = () => {
  const rows = []

  for (let i = 1; i <= 25; i++) {
    let section = 'A'
    let difficulty = 'Easy'

    if (i >= 11 && i <= 20) {
      section = 'B'
      difficulty = 'Understanding'
    } else if (i >= 21 && i <= 25) {
      section = 'C'
      difficulty = 'Hard'
    }

    rows.push({
      question_number: i,
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      section,
      difficulty,
      correct_option: '',
    })
  }

  return rows
}

function PlaceholderPage({ title, icon }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="text-6xl mb-4">{icon}</div>
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">Coming soon - placeholder for development</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <p className="text-gray-600 mb-4">This page will be developed next.</p>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 text-lg">Development placeholder</p>
        </div>
      </div>
    </div>
  )
}

export function InputTestPage() {
  const { token } = useAuth()
  const [course, setCourse] = useState('')
  const [topicName, setTopicName] = useState('')
  const [nepaliDate, setNepaliDate] = useState('')
  const [shift, setShift] = useState('A')
  const [questions, setQuestions] = useState(createQuestionRows())
  const [existingExams, setExistingExams] = useState([])
  const [editingExamId, setEditingExamId] = useState(null)
  const [isLoadingExams, setIsLoadingExams] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const updateQuestionAnswer = (questionNumber, option) => {
    setQuestions((current) =>
      current.map((question) =>
        question.question_number === questionNumber
          ? { ...question, correct_option: option }
          : question
      )
    )
  }

  const updateQuestionField = (questionNumber, field, value) => {
    setQuestions((current) =>
      current.map((question) =>
        question.question_number === questionNumber
          ? { ...question, [field]: value }
          : question
      )
    )
  }

  const resetForm = () => {
    setCourse('')
    setTopicName('')
    setNepaliDate('')
    setShift('A')
    setQuestions(createQuestionRows())
    setMessage('')
    setError('')
  }

  const fetchExistingExams = async () => {
    try {
      setIsLoadingExams(true)
      const response = await fetch(`${API_BASE_URL}/exams`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load exams')
      }
      setExistingExams(data.data || [])
    } catch (err) {
      console.error('Failed to load exams', err)
    } finally {
      setIsLoadingExams(false)
    }
  }

  const loadExamForEdit = async (examId) => {
    setError('')
    setMessage('')
      try {
      setIsLoadingExams(true)
      const [examResponse, questionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/exams/${examId}`),
        fetch(`${API_BASE_URL}/exams/${examId}/questions`),
      ])

      const examData = await examResponse.json()
      const questionsData = await questionsResponse.json()

      if (!examResponse.ok) {
        throw new Error(examData.message || 'Failed to load exam')
      }
      if (!questionsResponse.ok) {
        throw new Error(questionsData.message || 'Failed to load exam questions')
      }

      const exam = examData.data
      setCourse(exam.course)
      setTopicName(exam.topic_name)
      setNepaliDate(exam.nepali_date)
      setShift(exam.shift)
      setQuestions(questionsData.data || createQuestionRows())
      setEditingExamId(examId)
      setMessage('Loaded exam for editing. Save to apply updates.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingExams(false)
    }
  }

  const deleteExam = async (examId) => {
    const confirmed = window.confirm('Delete this exam and all associated questions? This action cannot be undone.')
    if (!confirmed) {
      return
    }
    setError('')
    setMessage('')

    try {
      setIsSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete exam')
      }

      setExistingExams((current) => current.filter((exam) => exam.id !== examId))
      setMessage('Exam deleted successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchExistingExams()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!course || !topicName || !nepaliDate || !shift) {
      setError('Please fill in course, topic name, nepali date, and shift.')
      return
    }

    const incompleteQuestions = questions.filter((question) =>
      !question.question_text.trim() ||
      !question.option_a.trim() ||
      !question.option_b.trim() ||
      !question.option_c.trim() ||
      !question.option_d.trim() ||
      !question.correct_option
    )

    if (incompleteQuestions.length > 0) {
      setError(`Please complete text, options, and correct answer for all questions. Missing: ${incompleteQuestions.length}`)
      return
    }

    setIsSubmitting(true)

    try {
      const endpoint = editingExamId ? `${API_BASE_URL}/exams/${editingExamId}` : `${API_BASE_URL}/exams`
      const method = editingExamId ? 'PUT' : 'POST'
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          exam_name: `${course} - ${topicName}`,
          course,
          topic_name: topicName,
          nepali_date: nepaliDate,
          shift,
          total_questions: 25,
          questions,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save exam')
      }

      setMessage(editingExamId ? 'Exam updated successfully.' : `Exam saved successfully. Exam ID: ${data.data.exam_id}`)
      resetForm()
      setEditingExamId(null)
      fetchExistingExams()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const answeredCount = questions.filter((question) => question.correct_option).length
  const sectionAQuestions = questions.filter((question) => question.section === 'A')
  const sectionBQuestions = questions.filter((question) => question.section === 'B')
  const sectionCQuestions = questions.filter((question) => question.section === 'C')

  // Bulk Import state
  const [bulkTab, setBulkTab] = useState('manual') // manual | bulk
  const [bulkImportText, setBulkImportText] = useState('')
  const [bulkImportErrors, setBulkImportErrors] = useState([])
  const [bulkImportedCount, setBulkImportedCount] = useState(0)
  const [bulkHasReviewed, setBulkHasReviewed] = useState(false)

  const parseBulkImport = (text) => {
    const rawLines = (text || '').split(/\r?\n/)
    const lines = rawLines.map((l) => l.trim())

    const imported = []
    const errors = []

    const toOptionKey = (letter) => {
      const normalized = String(letter || '').trim().toUpperCase()
      if (!['A', 'B', 'C', 'D'].includes(normalized)) return null
      return normalized
    }

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx]
      if (!line) continue

      const fields = line.split('|').map((f) => f.trim())
      if (fields.length !== 6) {
        errors.push(`Line ${idx + 1}: Expected exactly 6 fields separated by '|', got ${fields.length}.`)
        continue
      }

      const [question, optionA, optionB, optionC, optionD, correctAnswerRaw] = fields

      const questionTrimmed = question?.trim()
      const optionATrimmed = optionA?.trim()
      const optionBTrimmed = optionB?.trim()
      const optionCTrimmed = optionC?.trim()
      const optionDTrimmed = optionD?.trim()
      const correctAnswer = toOptionKey(correctAnswerRaw)

      if (!questionTrimmed || !optionATrimmed || !optionBTrimmed || !optionCTrimmed || !optionDTrimmed) {
        errors.push(`Line ${idx + 1}: All fields question and options (A-D) must be non-empty.`)
        continue
      }

      if (!correctAnswer) {
        errors.push(`Line ${idx + 1}: Correct Answer must be one of A, B, C, or D.`)
        continue
      }

      imported.push({
        question_text: questionTrimmed,
        option_a: optionATrimmed,
        option_b: optionBTrimmed,
        option_c: optionCTrimmed,
        option_d: optionDTrimmed,
        correct_option: correctAnswer,
      })
    }

    return { imported, errors }
  }

  const applyBulkImportToQuestions = (importedRows) => {
    // Fixed exam is 25 questions. Map imported rows in order onto the slots.
    const next = createQuestionRows()
    const existing = questions
    const finalQuestions = (existing?.length ? existing : next).map((q) => ({ ...q }))

    for (let i = 0; i < importedRows.length && i < finalQuestions.length; i++) {
      const imported = importedRows[i]
      finalQuestions[i] = {
        ...finalQuestions[i],
        question_text: imported.question_text,
        option_a: imported.option_a,
        option_b: imported.option_b,
        option_c: imported.option_c,
        option_d: imported.option_d,
        correct_option: imported.correct_option,
      }
    }

    return finalQuestions
  }

  const handleBulkPreview = () => {
    setBulkImportErrors([])
    setBulkImportedCount(0)
    setBulkHasReviewed(false)

    const { imported, errors } = parseBulkImport(bulkImportText)

    setBulkImportedCount(imported.length)
    setBulkImportErrors(errors)

    if (imported.length === 0) {
      setError('No valid questions found to import. Fix the format and try again.')
      return
    }

    const nextQuestions = applyBulkImportToQuestions(imported)
    setQuestions(nextQuestions)
    setBulkHasReviewed(true)
    setMessage(`Imported ${imported.length} questions successfully. Review/edit imported questions below before saving.`)
  }

  return (
    <div className="p-6 lg:p-8">

      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Admin Workflow</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Input Test</h1>
        <p className="text-gray-600 mt-2">Create a single-topic exam and input the answer key. The exam structure is fixed at 25 questions.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Step 1</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">Select exam details</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Step 2</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">Auto-create 25 questions</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Step 3</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">Mark correct options</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Status</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{answeredCount}/25 answered</p>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Existing Tests</h2>
            <p className="text-sm text-gray-500">View and delete any previously created exam sessions.</p>
          </div>
          <span className="text-xs font-semibold text-gray-600">{isLoadingExams ? 'Loading exams...' : `${existingExams.length} exams`}</span>
        </div>

        {isLoadingExams ? (
          <div className="rounded-lg bg-gray-50 p-4 text-gray-600">Loading exams...</div>
        ) : existingExams.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-4 text-gray-600">No exams have been created yet.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {existingExams
              .slice()
              .sort((a, b) => b.nepali_date.localeCompare(a.nepali_date))
              .map((exam) => (
                <div key={exam.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{exam.exam_name}</p>
                    <p className="text-sm text-gray-500">{exam.topic_name} • {exam.course} • {exam.nepali_date} • Shift {exam.shift}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{exam.total_questions} questions</span>
                    <button
                      type="button"
                      onClick={() => loadExamForEdit(exam.id)}
                      disabled={isSubmitting}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    >
                      Edit Test
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteExam(exam.id)}
                      disabled={isSubmitting}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
                    >
                      Delete Test
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {editingExamId && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 mb-6 text-sm text-blue-900">
          Editing exam ID {editingExamId}. Save to update the question content and answer key, and student scores will be recalculated automatically.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Step 1: Exam Details</h2>
              <p className="text-sm text-gray-500">Select the test metadata before saving the answer key.</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">Single-topic exam</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Class 12"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic Name</label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Trigonometry"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nepali Date</label>
              <input
                type="text"
                value={nepaliDate}
                onChange={(e) => setNepaliDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2082-12-02"
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Step 2: Fixed Exam Structure</h2>
              <p className="text-sm text-gray-500">Questions are automatically generated in fixed sections with difficulty levels.</p>
            </div>
            <div className="flex gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">A: 10 Easy</span>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700">B: 10 Understanding</span>
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700">C: 5 Hard</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Section A</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{sectionAQuestions.length}</p>
              <p className="text-xs text-gray-600 mt-1">Easy questions</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-700 font-medium">Section B</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{sectionBQuestions.length}</p>
              <p className="text-xs text-gray-600 mt-1">Understanding questions</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-lg">
              <p className="text-sm text-rose-700 font-medium">Section C</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{sectionCQuestions.length}</p>
              <p className="text-xs text-gray-600 mt-1">Hard questions</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Step 3: Correct Answer Key</h2>
              <p className="text-sm text-gray-500">Select the correct option for each question. The answer key will be saved with section and difficulty metadata.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">25 questions total</div>
              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setBulkTab('manual')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${bulkTab === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setBulkTab('bulk')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${bulkTab === 'bulk' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Bulk Import
                </button>
              </div>
            </div>
          </div>

          {bulkTab === 'bulk' && (
            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-gray-900">Bulk Import (25 fixed questions)</div>
              <textarea
                value={bulkImportText}
                onChange={(e) => {
                  setBulkImportText(e.target.value)
                  setBulkImportErrors([])
                  setBulkImportedCount(0)
                  setBulkHasReviewed(false)
                }}
                rows={10}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Question | Option A | Option B | Option C | Option D | Correct Answer\n\nWhat is computer? | Electronic device | Wooden device | Petroleum device | All | A\n\nWhat is CPU? | Central Processing Unit | Computer Power Unit | Control Program Unit | None | A"
              />

              {bulkImportedCount > 0 && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm font-medium">
                  Imported {bulkImportedCount} questions successfully.
                </div>
              )}

              {bulkImportErrors.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-semibold text-red-700 mb-2">Import errors</div>
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                    <ul className="list-disc pl-5 space-y-1">
                      {bulkImportErrors.slice(0, 10).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                    {bulkImportErrors.length > 10 && (
                      <div className="mt-2 text-xs text-red-600">+ {bulkImportErrors.length - 10} more...</div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleBulkPreview}
                  disabled={!bulkImportText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-medium transition"
                >
                  Preview Import
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBulkImportText('')
                    setBulkImportErrors([])
                    setBulkImportedCount(0)
                    setBulkHasReviewed(false)
                  }}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition"
                >
                  Clear Bulk Text
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.question_number}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Q.{question.question_number}</p>
                    <p className="text-xs text-gray-500">Section {question.section} • {question.difficulty}</p>
                  </div>
                  <div className="text-xs font-medium px-3 py-1 rounded-full bg-white text-gray-700 border border-gray-200">
                    Correct answer required
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question text</label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestionField(question.question_number, 'question_text', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the question prompt here"
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 mb-4">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <div key={`${question.question_number}-${option}`} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Option {option}</label>
                      <input
                        type="text"
                        value={question[`option_${option.toLowerCase()}`]}
                        onChange={(e) => updateQuestionField(question.question_number, `option_${option.toLowerCase()}`, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Text for option ${option}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <label
                      key={`${question.question_number}-${option}`}
                      className={`flex items-center justify-between rounded-lg border px-3 py-3 cursor-pointer transition ${
                        question.correct_option === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold">{option}</span>
                      <input
                        type="radio"
                        name={`question-${question.question_number}`}
                        value={option}
                        checked={question.correct_option === option}
                        onChange={() => updateQuestionAnswer(question.question_number, option)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>


        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm">
            {message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-medium transition"
          >
            {isSubmitting ? 'Saving exam...' : editingExamId ? 'Update Exam' : 'Save Exam and Answer Key'}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition"
          >
            Reset Form
          </button>

          {editingExamId && (
            <button
              type="button"
              onClick={() => {
                resetForm()
                setEditingExamId(null)
              }}
              className="bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export function InputResultPage() {
  const { token } = useAuth()
  const [exams, setExams] = useState([])

  const [students, setStudents] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedExamId, setSelectedExamId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [resultSummary, setResultSummary] = useState(null)

  const [statusFilter, setStatusFilter] = useState('pending') // pending | completed | all
  const [statusFetchError, setStatusFetchError] = useState('')

  const [examStatus, setExamStatus] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentExisted, setCurrentExisted] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState('PRESENT')
  const attendanceValue = attendanceStatus === 'ABSENT' ? 'ABSENT' : 'PRESENT'


  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [examResponse, studentResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/exams`),
          fetch(`${API_BASE_URL}/students`),
        ])

        const examData = await examResponse.json()
        const studentData = await studentResponse.json()

        setExams(examData.data || [])
        setStudents(studentData.data || [])
      } catch (err) {
        setError('Failed to load exams or students')
      }
    }

    loadData()
  }, [])

  const courseOptions = [...new Set(exams.map((exam) => exam.course))]
  const examOptions = exams.filter((exam) => exam.course === selectedCourse)
  const selectedExam = exams.find((exam) => exam.id === Number(selectedExamId))

  useEffect(() => {
    const loadQuestions = async () => {
      if (!selectedExamId) {
        setQuestions([])
        setAnswers({})
        setIsEditMode(false)
        setCurrentExisted(false)
        setResultSummary(null)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/exams/${selectedExamId}/questions`)
        const data = await response.json()
        setQuestions(data.data || [])
        setAnswers({})
        setResultSummary(null)
        setIsEditMode(false)
        setCurrentExisted(false)
        setError('')
      } catch (err) {
        setError('Failed to load exam questions')
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [selectedExamId])

  useEffect(() => {
    const loadExamStatus = async () => {
      if (!selectedExamId) {
        setExamStatus(null)
        return
      }

      try {
        setStatusFetchError('')
        const response = await fetch(`${API_BASE_URL}/input-result-status/exam/${selectedExamId}/students/status`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load exam status')
        }

        setExamStatus(data.data || null)
      } catch (err) {
        setStatusFetchError(err.message)
      }
    }

    loadExamStatus()
  }, [selectedExamId, token])

  const completedSet = new Set((examStatus?.completedStudentIds || []).map((id) => Number(id)))

  const filteredStudents = students
    .filter((student) => {
      const query = searchTerm.toLowerCase()
      return [student.full_name, student.symbol_number, student.course, student.batch, student.shift]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
    .filter((student) => {
      if (!examStatus) return true
      const isCompleted = completedSet.has(Number(student.id))
      if (statusFilter === 'pending') return !isCompleted
      if (statusFilter === 'completed') return isCompleted
      return true
    })

  const handleAnswerChange = (questionNumber, option) => {
    // Pending students must be editable immediately (isEditMode=false only blocks completed edit-review).
    if (currentExisted && !isEditMode) return
    setAnswers((current) => ({
      ...current,
      [questionNumber]: option,
    }))
  }


  const loadSelectedStudentResult = async (studentId, examId) => {
    try {
      setError('')
      setMessage('')
      setIsLoading(true)
      setIsEditMode(false)
      setCurrentExisted(false)
      setResultSummary(null)
      setAnswers({})

      // Pending student: keep answers empty
      if (!completedSet.has(Number(studentId))) {
        return
      }

      const response = await fetch(`${API_BASE_URL}/results/student/${studentId}/exam/${examId}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load student result')
      }

      setCurrentExisted(true)
      setAnswers(
        (data.data?.question_reviews || []).reduce((acc, row) => {
          acc[row.question_number] = row.selected_option
          return acc
        }, {})
      )

      setResultSummary({
        totalScore: data.data?.summary?.marks,
        sectionA: data.data?.summary?.section_scores?.A,
        sectionB: data.data?.summary?.section_scores?.B,
        sectionC: data.data?.summary?.section_scores?.C,
        percentage: data.data?.summary?.percentage,
      })

      setMessage('Result already entered. You may review or edit it.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectStudent = (studentId) => {
    // Ensure selection always updates current student context even while in edit mode.
    setIsEditMode(false)
    setCurrentExisted(false)
    setSelectedStudentId(String(studentId))
    setMessage('')
    setError('')
  }


  const resetWorkflow = () => {
    setSelectedCourse('')
    setSelectedExamId('')
    setSelectedStudentId('')
    setQuestions([])
    setAnswers({})
    setMessage('')
    setError('')
    setResultSummary(null)
    setSearchTerm('')
    setStatusFilter('pending')
    setExamStatus(null)
    setIsEditMode(false)
    setCurrentExisted(false)
  }

  useEffect(() => {
    if (!selectedStudentId || !selectedExamId) return

    // Selecting a student: always view existing answers if they exist
    loadSelectedStudentResult(selectedStudentId, Number(selectedExamId))
  }, [selectedStudentId, selectedExamId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setResultSummary(null)

    if (!selectedCourse || !selectedExamId || !selectedStudentId) {
      setError('Select a course, exam date, and student before submitting.')
      return
    }

    // Unanswered questions are allowed (skipped). ABSENT students will also bypass this.
    // If admin sends missing answers array or empty payload, backend will treat them as unanswered.


    try {
      setIsLoading(true)
      const payload = {
        exam_id: Number(selectedExamId),
        student_id: Number(selectedStudentId),
        attendance_status: attendanceValue,
        // Backend expects `answers` array only for PRESENT.
        answers: attendanceValue === 'ABSENT'
          ? []
          : questions.map((question) => ({
              question_number: question.question_number,
              // allow null for Blank/Skip
              selected_option:
                answers[question.question_number] === undefined ? null : answers[question.question_number],
            })),
      }


      const response = await fetch(`${API_BASE_URL}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save result')
      }

      setCurrentExisted(!!data.data?.existed)

      setResultSummary({
        totalScore: data.data.score,
        sectionA: data.data.section_a_score,
        sectionB: data.data.section_b_score,
        sectionC: data.data.section_c_score,
        percentage: data.data.percentage,
        attendance_status: data.data.attendance_status,
        rank: data.data.rank,
      })

      setMessage(data.data?.existed ? 'Result updated successfully.' : 'Result saved successfully.')
      setIsEditMode(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const totalStudents = examStatus?.totalStudents ?? students.length
  const completedCount = examStatus?.completedCount ?? (examStatus ? completedSet.size : 0)
  const pendingCount = examStatus?.pendingCount ?? Math.max(0, totalStudents - completedCount)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Admin Workflow</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Input Result</h1>
        <p className="text-gray-600 mt-2">Select the exam, student, and answer key in a fast workflow. Scores and section totals are calculated automatically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Step 1</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">Course & exam date</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Step 2</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">Choose student</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Step 3</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">Answer interface</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Auto-save</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">Score + sections</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Step 1: Select exam</h2>
              <p className="text-sm text-gray-500">Choose the course and exam date to load the answer key.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value)
                  setSelectedExamId('')
                  setQuestions([])
                  setAnswers({})
                  setResultSummary(null)
                  setSelectedStudentId('')
                  setExamStatus(null)
                  setIsEditMode(false)
                  setCurrentExisted(false)
                  setMessage('')
                  setError('')
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select course</option>
                {courseOptions.map((courseName) => (
                  <option key={courseName} value={courseName}>{courseName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                disabled={!selectedCourse}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select exam date</option>
                {examOptions.map((exam) => (
                  <option key={exam.id} value={exam.id}>{exam.nepali_date} — {exam.topic_name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedExam && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p className="font-semibold">Loaded exam</p>
              <p className="mt-1">{selectedExam.exam_name} • {selectedExam.topic_name} • {selectedExam.nepali_date}</p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Step 2: Select student</h2>
              <p className="text-sm text-gray-500">Filter students and choose the exam taker.</p>
            </div>
            <div className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{totalStudents} students available</div>
          </div>

          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Total Students:</span> {totalStudents} &nbsp;•&nbsp;
                <span className="font-semibold">Completed:</span> {completedCount} &nbsp;•&nbsp;
                <span className="font-semibold">Pending:</span> {pendingCount}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'pending', label: 'Pending' },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setStatusFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      statusFilter === f.key
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {statusFetchError && (
              <div className="mt-2 text-sm text-red-600">{statusFetchError}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search students</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name, symbol number, course, or batch"
            />
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Shift</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => {
                  const isCompleted = completedSet.has(Number(student.id))
                  return (
                    <tr key={student.id} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{student.full_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.symbol_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.course}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.shift}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.batch}</td>
                      <td className="px-4 py-3 text-sm">
                        {isCompleted ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
                            🟢 Result Entered
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-700 px-3 py-1 text-xs font-semibold">
                            ⚪ Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                        onClick={() => handleSelectStudent(student.id)}

                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            selectedStudentId === String(student.id)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {selectedStudentId === String(student.id) ? 'Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {selectedStudentId && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg text-sm text-green-800">
              <p className="font-semibold">Selected student</p>
              <p className="mt-1">
                {students.find((student) => student.id === Number(selectedStudentId))?.full_name} — {students.find((student) => student.id === Number(selectedStudentId))?.symbol_number}
              </p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Step 3: Answer input</h2>
              <p className="text-sm text-gray-500">Tap the chosen answer for each question. Total score, section totals, and percentage are computed automatically.</p>
            </div>
            <div className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{questions.length} questions loaded</div>
          </div>

          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-gray-800">Attendance status</p>
                <p className="text-xs text-gray-500">Mark student as Present/Absent for this exam.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAttendanceStatus('PRESENT')
                    setAnswers((current) => current)
                  }}
                  disabled={currentExisted && !isEditMode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    attendanceValue === 'PRESENT'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  Present
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAttendanceStatus('ABSENT')
                    // Clear answer selections when absent
                    setAnswers({})
                  }}
                  disabled={currentExisted && !isEditMode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    attendanceValue === 'ABSENT'
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  Absent
                </button>
              </div>
            </div>
          </div>


          {currentExisted && !isEditMode && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
              Result already entered. You may review or edit it.
            </div>
          )}

          {selectedStudentId && currentExisted && (
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Edit Result
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(false)
                  // keep loaded answers
                }}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Review Mode
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="p-4 rounded-lg bg-gray-50 text-gray-600">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="p-4 rounded-lg bg-gray-50 text-gray-600">Select an exam to load the answer interface.</div>
          ) : (
            <div className="space-y-3">
              {questions.map((question) => (
                <div key={question.question_number} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Q.{question.question_number}</p>
                      <p className="text-xs text-gray-500">Section {question.section} • {question.difficulty}</p>
                    </div>
                    {!isEditMode && currentExisted && (
                      <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-3 py-1 font-medium">
                        Read-only
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-700">{question.question_text || 'Question text not provided'}</p>
                  </div>
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option) => {
                      const selected = answers[question.question_number] === option
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleAnswerChange(question.question_number, option)}
                          disabled={currentExisted && !isEditMode}
                          className={`w-full rounded-lg border px-3 py-3 text-left font-medium transition ${
                            selected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          } disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-semibold">{option}.</span>
                            <span>{question[`option_${option.toLowerCase()}`] || 'Option text not provided'}</span>
                          </div>
                        </button>
                      )
                    })}

                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question.question_number, null)}
                      disabled={currentExisted && !isEditMode}
                      className={`w-full rounded-lg border px-3 py-3 text-left font-medium transition ${
                        answers[question.question_number] === null || answers[question.question_number] === undefined
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      } disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-semibold">—</span>
                        <span>Blank / Skip</span>
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm">{message}</div>
        )}

        {resultSummary && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Result Summary</h2>
                <p className="text-sm text-gray-500">Stored result details and calculated section scores.</p>
              </div>
              {resultSummary.attendance_status === 'ABSENT' && (
                <div className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                  ABSENT
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Total Score</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{resultSummary.totalScore}/25</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-700 font-medium">Section A</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{resultSummary.sectionA}</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-lg">
                <p className="text-sm text-rose-700 font-medium">Section B</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{resultSummary.sectionB}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-700 font-medium">Section C</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{resultSummary.sectionC}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
              <p className="font-semibold">Percentage</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{resultSummary.percentage}%</p>
            </div>
          </section>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={
              isLoading ||
              !selectedExamId ||
              !selectedStudentId ||
              questions.length === 0 ||
              (!isEditMode && currentExisted)
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-medium transition"
          >
            {isLoading ? (currentExisted ? 'Updating result...' : 'Saving result...') : currentExisted ? 'Update Result' : 'Save Result'}
          </button>

          <button
            type="button"
            onClick={resetWorkflow}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition"
          >
            Reset Workflow
          </button>
        </div>
      </form>
    </div>
  )
}

export function PastResultsPage() {
  const [exams, setExams] = useState([])
  const [viewMode, setViewMode] = useState('this-week')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDay, setSelectedDay] = useState('Sunday')
  const [selectedExamId, setSelectedExamId] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const loadExams = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/exams`)

        const data = await response.json()
        setExams(data.data || [])
      } catch (err) {
        setStatus('Failed to load exams')
      }
    }

    loadExams()
  }, [])

  const weekdayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const parseExamDate = (dateString) => {
    if (!dateString) return null
    const [year, month, day] = dateString.split('-').map(Number)
    if (!year || !month || !day) return null
    return new Date(year, month - 1, day)
  }

  const groupedExams = exams.reduce((acc, exam) => {
    const examDate = parseExamDate(exam.nepali_date)
    const weekDay = examDate ? weekdayOrder[examDate.getDay()] : 'Sunday'
    if (!acc[weekDay]) {
      acc[weekDay] = []
    }
    acc[weekDay].push(exam)
    return acc
  }, {})

  const examsForSelectedDay = (groupedExams[selectedDay] || []).sort((a, b) => a.nepali_date.localeCompare(b.nepali_date))

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!selectedExamId) {
        setLeaderboard([])
        return
      }

      try {
      const response = await fetch(`${API_BASE_URL}/results/leaderboard/${selectedExamId}`)
        const data = await response.json()
        setLeaderboard(data.data || [])
      } catch (err) {
        setStatus('Failed to load leaderboard')
      }
    }

    loadLeaderboard()
  }, [selectedExamId])

  useEffect(() => {
    const clearSelection = () => {
      setSelectedStudentId('')
      setSelectedStudentDetail(null)
    }

    clearSelection()
  }, [selectedExamId])

  const selectedExam = exams.find((exam) => exam.id === Number(selectedExamId))

  const filteredPreviousExams = exams
    .filter((exam) => {
      const haystack = `${exam.exam_name} ${exam.course} ${exam.topic_name} ${exam.nepali_date}`.toLowerCase()
      return haystack.includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => b.nepali_date.localeCompare(a.nepali_date))

  const loadStudentDetail = async (studentId, examId) => {
    try {
      setIsLoadingDetail(true)
      setStatus('')
      const response = await fetch(`${API_BASE_URL}/results/student/${studentId}/exam/${examId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load student result')
      }

      setSelectedStudentDetail(data.data)
    } catch (err) {
      setStatus(err.message)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Admin Result Review</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">View Past Results</h1>
        <p className="text-gray-600 mt-2">Browse exam records by week or historical archive, then inspect individual student answer review.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['this-week', 'previous-results'].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              setViewMode(mode)
              setSelectedExamId('')
              setSelectedStudentId('')
              setSelectedStudentDetail(null)
              setStatus('')
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm border transition ${viewMode === mode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {mode === 'this-week' ? 'This Week Results' : 'Previous Results'}
          </button>
        ))}
      </div>

      {status && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{status}</div>
      )}

      {viewMode === 'this-week' ? (
        <div className="space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Weekly Result Navigation</h2>
                <p className="text-sm text-gray-500">Choose a day to review exams conducted during that session.</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{selectedDay}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {weekdayOrder.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`rounded-xl border px-3 py-4 text-left transition ${selectedDay === day ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-blue-50'}`}
                >
                  <p className="text-sm font-semibold">{day}</p>
                  <p className={`mt-2 text-xs ${selectedDay === day ? 'text-blue-100' : 'text-gray-500'}`}>{(groupedExams[day] || []).length} exams</p>
                </button>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Exams on {selectedDay}</h2>
                  <p className="text-sm text-gray-500">Select an exam to inspect student performance.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{examsForSelectedDay.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Exam</th>
                      <th className="px-3 py-2">Course</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Shift</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {examsForSelectedDay.map((exam) => (
                      <tr key={exam.id} className={selectedExamId === String(exam.id) ? 'bg-blue-50' : 'bg-white'}>
                        <td className="px-3 py-3 text-sm font-semibold text-gray-900">{exam.exam_name}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{exam.course}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{exam.nepali_date}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{exam.shift}</td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedExamId(String(exam.id))}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            View Students
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {examsForSelectedDay.length === 0 && (
                  <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">No exams scheduled for this day.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Student Results</h2>
                  <p className="text-sm text-gray-500">Marks, percentage, and rank from the selected exam.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{leaderboard.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Symbol No.</th>
                      <th className="px-3 py-2">Marks</th>
                      <th className="px-3 py-2">Percentage</th>
                      <th className="px-3 py-2">Rank</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leaderboard.map((entry) => (
                      <tr key={entry.id} className={selectedStudentId === String(entry.student_id) ? 'bg-blue-50' : 'bg-white'}>
                        <td className="px-3 py-3 text-sm font-semibold text-gray-900">{entry.full_name}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{entry.symbol_number}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{entry.score}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{Number(entry.percentage).toFixed(2)}%</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{entry.rank || '—'}</td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(String(entry.student_id))
                              loadStudentDetail(entry.student_id, Number(selectedExamId))
                            }}
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {leaderboard.length === 0 && (
                  <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">Select an exam to view student results.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Student Result Details</h2>
                <p className="text-sm text-gray-500">Review score summary, sections, and answer checking.</p>
              </div>

              {isLoadingDetail && (
                <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Loading student review...</div>
              )}

              {!isLoadingDetail && !selectedStudentDetail && (
                <div className="rounded-lg border border-dashed border-gray-200 p-5 text-sm text-gray-500">Choose a student from the selected exam to inspect their answer review.</div>
              )}

              {!isLoadingDetail && selectedStudentDetail && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-900 text-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-slate-300">Student Summary</p>
                        <h3 className="text-xl font-bold mt-1">{selectedStudentDetail.student.full_name}</h3>
                        <p className="text-sm text-slate-300 mt-1">Symbol No.: {selectedStudentDetail.student.symbol_number}</p>
                      </div>
                      <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">#{selectedStudentDetail.summary.rank || '—'}</div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-white/10 p-3">
                        <p className="text-slate-300 text-xs uppercase tracking-wide">Marks</p>
                        <p className="text-2xl font-bold mt-1">{selectedStudentDetail.summary.marks}</p>
                      </div>
                      <div className="rounded-lg bg-white/10 p-3">
                        <p className="text-slate-300 text-xs uppercase tracking-wide">Percentage</p>
                        <p className="text-2xl font-bold mt-1">{Number(selectedStudentDetail.summary.percentage).toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{selectedStudentDetail.exam.exam_name}</p>
                        <p className="text-sm text-gray-500">{selectedStudentDetail.exam.course} • {selectedStudentDetail.exam.nepali_date}</p>
                      </div>
                      <span className="rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium">{selectedStudentDetail.exam.shift} Shift</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {Object.entries(selectedStudentDetail.summary.section_scores || {}).map(([section, score]) => (
                        <div key={section} className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Section {section}</p>
                          <p className="font-semibold text-gray-900 mt-1">{score}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">Question Review</p>
                        <p className="text-sm text-gray-500">Correct answer, student answer, and result status per question.</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{selectedStudentDetail.question_reviews.length} questions</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                          <tr>
                            <th className="px-3 py-2">Question</th>
                            <th className="px-3 py-2">Section</th>
                            <th className="px-3 py-2">Correct Answer</th>
                            <th className="px-3 py-2">Student Answer</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedStudentDetail.question_reviews.map((question) => (
                            <tr
                              key={question.question_number}
                              className={question.status === 'Correct' ? 'bg-emerald-50/70' : 'bg-rose-50/70'}
                            >
                              <td className="px-3 py-3 text-sm font-semibold text-gray-900">Q.{question.question_number}</td>
                              <td className="px-3 py-3 text-sm text-gray-700">{question.section}</td>
                              <td className="px-3 py-3 text-sm text-gray-900 font-semibold">{question.correct_option}</td>
                              <td className="px-3 py-3 text-sm text-gray-700">{question.selected_option || 'No response'}</td>
                              <td className="px-3 py-3">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${question.status === 'Correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {question.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Historical Exams</h2>
                <p className="text-sm text-gray-500">Search and select any saved exam.</p>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exam, course, or topic"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Exam</th>
                    <th className="px-3 py-2">Course</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Shift</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPreviousExams.map((exam) => (
                    <tr key={exam.id} className={selectedExamId === String(exam.id) ? 'bg-blue-50' : 'bg-white'}>
                      <td className="px-3 py-3 text-sm font-semibold text-gray-900">{exam.exam_name}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{exam.course}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{exam.nepali_date}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{exam.shift}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedExamId(String(exam.id))}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          View Students
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPreviousExams.length === 0 && (
                <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">No exams match your search.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Student Results</h2>
                <p className="text-sm text-gray-500">Marks, percentage, and rank for the selected exam.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{leaderboard.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Symbol No.</th>
                    <th className="px-3 py-2">Marks</th>
                    <th className="px-3 py-2">Percentage</th>
                    <th className="px-3 py-2">Rank</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboard.map((entry) => (
                    <tr key={entry.id} className={selectedStudentId === String(entry.student_id) ? 'bg-blue-50' : 'bg-white'}>
                      <td className="px-3 py-3 text-sm font-semibold text-gray-900">{entry.full_name}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{entry.symbol_number}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{entry.score}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{Number(entry.percentage).toFixed(2)}%</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{entry.rank || '—'}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(String(entry.student_id))
                            loadStudentDetail(entry.student_id, Number(selectedExamId))
                          }}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {leaderboard.length === 0 && (
                <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">Select an exam to view student results.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Student Result Details</h2>
              <p className="text-sm text-gray-500">Review score summary, section scores, and answer checking.</p>
            </div>

            {isLoadingDetail && (
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Loading student review...</div>
            )}

            {!isLoadingDetail && !selectedStudentDetail && (
              <div className="rounded-lg border border-dashed border-gray-200 p-5 text-sm text-gray-500">Choose a student to inspect their result details.</div>
            )}

            {!isLoadingDetail && selectedStudentDetail && (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-900 text-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-300">Student Summary</p>
                      <h3 className="text-xl font-bold mt-1">{selectedStudentDetail.student.full_name}</h3>
                      <p className="text-sm text-slate-300 mt-1">Symbol No.: {selectedStudentDetail.student.symbol_number}</p>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">#{selectedStudentDetail.summary.rank || '—'}</div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-white/10 p-3">
                      <p className="text-slate-300 text-xs uppercase tracking-wide">Marks</p>
                      <p className="text-2xl font-bold mt-1">{selectedStudentDetail.summary.marks}</p>
                    </div>
                    <div className="rounded-lg bg-white/10 p-3">
                      <p className="text-slate-300 text-xs uppercase tracking-wide">Percentage</p>
                      <p className="text-2xl font-bold mt-1">{Number(selectedStudentDetail.summary.percentage).toFixed(2)}%</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedStudentDetail.exam.exam_name}</p>
                      <p className="text-sm text-gray-500">{selectedStudentDetail.exam.course} • {selectedStudentDetail.exam.nepali_date}</p>
                    </div>
                    <span className="rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium">{selectedStudentDetail.exam.shift} Shift</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {Object.entries(selectedStudentDetail.summary.section_scores || {}).map(([section, score]) => (
                      <div key={section} className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Section {section}</p>
                        <p className="font-semibold text-gray-900 mt-1">{score}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">Question Review</p>
                      <p className="text-sm text-gray-500">Correct answer, student answer, and status per question.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{selectedStudentDetail.question_reviews.length} questions</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-3 py-2">Question</th>
                          <th className="px-3 py-2">Section</th>
                          <th className="px-3 py-2">Correct Answer</th>
                          <th className="px-3 py-2">Student Answer</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedStudentDetail.question_reviews.map((question) => (
                          <tr
                            key={question.question_number}
                            className={question.status === 'Correct' ? 'bg-emerald-50/70' : 'bg-rose-50/70'}
                          >
                            <td className="px-3 py-3 text-sm font-semibold text-gray-900">Q.{question.question_number}</td>
                            <td className="px-3 py-3 text-sm text-gray-700">{question.section}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 font-semibold">{question.correct_option}</td>
                            <td className="px-3 py-3 text-sm text-gray-700">{question.selected_option || 'No response'}</td>
                            <td className="px-3 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${question.status === 'Correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {question.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export function WeeklyReportsPage() {
  const { token } = useAuth()
  const [reviewRequests, setReviewRequests] = useState([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [requestsError, setRequestsError] = useState('')
  const [activeReportTab, setActiveReportTab] = useState('weekly')
  const [expandedRequestId, setExpandedRequestId] = useState(null)
  const [showHiddenRequests, setShowHiddenRequests] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [reportGeneratedAt, setReportGeneratedAt] = useState('')

  const visibleReviewRequests = reviewRequests.filter((request) => request.status === 'ToBeReviewed')
  const hiddenReviewRequests = reviewRequests.filter(
    (request) => request.status === 'Solved' || request.status === 'False Report'
  )



  const reportCardData = [
    { title: 'Generated Reports', value: '0', detail: 'Ready-to-share weekly summaries', accent: 'from-blue-600 to-cyan-500' },
    { title: 'Review Queue', value: `${visibleReviewRequests.length}`, detail: 'Review requests waiting for attention', accent: 'from-emerald-500 to-teal-500' },
    { title: 'AI Notes', value: '0', detail: 'Manual analysis prompts prepared', accent: 'from-violet-500 to-fuchsia-500' },
    { title: 'Print Ready', value: '0', detail: 'Printable report panels assembled', accent: 'from-amber-500 to-orange-500' },
  ]

  const tabs = [
    { key: 'weekly', label: 'Weekly Report' },
    { key: 'review', label: 'Review Requests' },
  ]

  const statusOptions = [
    { value: 'ToBeReviewed', label: 'To Be Reviewed' },
    { value: 'Solved', label: 'Solved' },
    { value: 'False Report', label: 'False Report' },
  ]

  const getStatusLabel = (status) => statusOptions.find((option) => option.value === status)?.label || status

  const fetchReviewRequests = async () => {
    setIsLoadingRequests(true)
    setRequestsError('')

    try {
      const response = await fetch(`${API_BASE_URL}/review-requests`, {

        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Unable to load review requests')
      }

      setReviewRequests(data.data || [])
    } catch (error) {
      setRequestsError(error.message)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const updateReviewRequestStatus = async (requestId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/review-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Unable to update review status')
      }

      setReviewRequests((current) =>
        current.map((request) =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      )
    } catch (error) {
      setRequestsError(error.message)
    }
  }

  const deleteReviewRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/review-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete review request')
      }

      setReviewRequests((current) => current.filter((request) => request.id !== requestId))
      if (expandedRequestId === requestId) {
        setExpandedRequestId(null)
      }
    } catch (error) {
      setRequestsError(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      fetchReviewRequests()
    }
  }, [token])

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Admin Reporting</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Weekly Reports</h1>
        <p className="text-gray-600 mt-2">Review printable reporting snapshots, summary readiness, and teacher commentary blocks in a clean premium workspace.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setActiveReportTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeReportTab === tab.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeReportTab === 'weekly' ? (
        <>
          <div className="grid gap-4 xl:grid-cols-4">
            {reportCardData.map((item) => (
              <div key={item.title} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{item.title}</p>
                    <p className="mt-3 text-4xl font-bold text-slate-900">{item.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${item.accent}`} />
                </div>
                <p className="mt-4 text-xs text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Report Preview</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Weekly summary layout</h2>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-inset ring-slate-200">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Institute Overview</p>
                      <p className="text-xs text-slate-500">Professional report-ready summary panel</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">Ready</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-100 px-3 py-3"><p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Average</p><p className="mt-2 text-2xl font-bold text-slate-900">0%</p></div>
                    <div className="rounded-xl bg-slate-100 px-3 py-3"><p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Top Topic</p><p className="mt-2 text-2xl font-bold text-slate-900">—</p></div>
                    <div className="rounded-xl bg-slate-100 px-3 py-3"><p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Weak Topic</p><p className="mt-2 text-2xl font-bold text-slate-900">—</p></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Review Requests</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Student Review Requests</h2>
            <p className="text-sm text-slate-500">Review active requests separately from solved or false-report items.</p>
          </div>

          {isLoadingRequests ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">Loading review requests...</div>
          ) : requestsError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{requestsError}</div>
          ) : reviewRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">No review requests have been submitted yet.</div>
          ) : (
            <div className="space-y-4">
              {visibleReviewRequests.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                  No active review requests are pending. Archived items are still available below.
                </div>
              ) : (
                visibleReviewRequests.map((request) => {
                  const isExpanded = expandedRequestId === request.id
                  return (
                    <div key={request.id} className="rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}
                        className="w-full px-5 py-4 text-left"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{request.full_name}</p>
                            <p className="text-sm text-slate-500">{request.exam_name} • {request.nepali_date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${request.status === 'ToBeReviewed' ? 'bg-amber-100 text-amber-800' : request.status === 'Solved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {getStatusLabel(request.status)}
                            </span>
                            <span className="text-slate-400 text-xl font-semibold">{isExpanded ? '−' : '+'}</span>
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-white px-5 py-5">
                          <div className="grid gap-3 sm:grid-cols-2 mb-4">
                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Symbol Number</p>
                              <p className="mt-2 text-sm text-slate-900">{request.symbol_number}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Question Numbers</p>
                              <p className="mt-2 text-sm text-slate-900">{request.question_numbers.join(', ')}</p>
                            </div>
                          </div>

                          <div className="mb-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Submitted</p>
                              <p className="mt-2 text-sm text-slate-900">{new Date(request.created_at).toLocaleString()}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                              <label className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</label>
                              <select
                                value={request.status}
                                onChange={(e) => updateReviewRequestStatus(request.id, e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={false}
                              >
                                {statusOptions
                                  .filter((s) => {
                                    // UI rule: allow administrators to re-open an archived request by selecting ToBeReviewed.
                                    // Backend still enforces immutability if the current status is Solved/False Report.
                                    // This UI will keep it editable; user intent is preserved.
                                    return true
                                  })
                                  .map((status) => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                  ))}
                              </select>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-slate-100 p-4 border border-slate-200">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Reason</p>
                            <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{request.reason}</p>
                          </div>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <button
                              type="button"
                              onClick={() => deleteReviewRequest(request.id)}
                              className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              Delete review request
                            </button>
                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 sm:w-fit">
                              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Current status</p>
                              <p className="mt-2 text-sm font-semibold text-slate-900">{getStatusLabel(request.status)}</p>
                            </div>
                          </div>

                          {request.questions.length > 0 && (
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Question details</p>
                              <div className="mt-3 space-y-3">
                                {request.questions.map((question) => (
                                  <div key={question.question_number} className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                                    <p className="text-sm font-semibold text-slate-900">Q.{question.question_number}: {question.question_text || 'Question text unavailable'}</p>
                                    <div className="mt-2 grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                                      <div>
                                        <p className="font-semibold text-slate-900">Correct</p>
                                        <p>{question.correct_option}</p>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-900">Options</p>
                                        <p>A: {question.option_a || '—'}</p>
                                        <p>B: {question.option_b || '—'}</p>
                                        <p>C: {question.option_c || '—'}</p>
                                        <p>D: {question.option_d || '—'}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              {hiddenReviewRequests.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                  <button
                    type="button"
                    className="w-full px-5 py-4 text-left flex items-center justify-between"
                    onClick={() => setShowHiddenRequests((current) => !current)}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Archived review requests</p>
                      <p className="text-sm text-slate-500">
                        {hiddenReviewRequests.length} solved or false-report request{hiddenReviewRequests.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-slate-400 text-xl font-semibold">{showHiddenRequests ? '−' : '+'}</span>
                  </button>

                  {showHiddenRequests && (
                    <div className="border-t border-slate-200 bg-white px-5 py-5 space-y-3">
                  {hiddenReviewRequests.map((request) => (
                        <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{request.full_name}</p>
                              <p className="text-sm text-slate-500">{request.exam_name} • {request.nepali_date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <select
                                value={request.status}
                                onChange={(e) => updateReviewRequestStatus(request.id, e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                              >
                                {statusOptions.map((status) => (
                                  <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                              </select>
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${request.status === 'Solved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {getStatusLabel(request.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export function ViewExamResultsPage() {
  const { token } = useAuth()
  const [exams, setExams] = useState([])
  const [courses, setCourses] = useState([])

  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedExamId, setSelectedExamId] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [examInfo, setExamInfo] = useState(null)
  const [ranked, setRanked] = useState([])
  const [unmarked, setUnmarked] = useState([])
  const [absent, setAbsent] = useState([])

  const [showArchived, setShowArchived] = useState(true)

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`${API_BASE_URL}/exams`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load exams')
        const list = data.data || []
        setExams(list)
        setCourses([...new Set(list.map((e) => e.course))])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadExams()
  }, [])

  const examsForSelectedCourse = exams.filter((e) => e.course === selectedCourse)

  const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId))

  const fetchExamResults = async () => {
    if (!selectedExamId) {
      setError('Select an exam date first.')
      return
    }

    setError('')
    setMessage('')
    setLoading(true)

    try {
      const url = `${API_BASE_URL}/results/admin/exam-results/${selectedExamId}`
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load exam results')

      const results = data?.data?.results || []
      const info = data?.data?.exam || null
      setExamInfo(info)

      // Buckets
      const rankedRows = []
      const unmarkedRows = []
      const absentRows = []

      for (const row of results) {
        const attendance = row.attendance_status
        const score = row.score

        if (attendance === 'ABSENT') {
          absentRows.push(row)
          continue
        }

        const hasNumericScore = score !== null && score !== undefined && !Number.isNaN(Number(score))
        if (hasNumericScore) {
          rankedRows.push({
            ...row,
            scoreNumber: Number(score),
          })
        } else {
          unmarkedRows.push(row)
        }
      }

      // Ranked sorted desc by marks
      rankedRows.sort((a, b) => {
        if (b.scoreNumber !== a.scoreNumber) return b.scoreNumber - a.scoreNumber
        // tie-breakers for deterministic ordering
        const ap = Number(a.percentage ?? 0)
        const bp = Number(b.percentage ?? 0)
        if (bp !== ap) return bp - ap
        return String(a.full_name || '').localeCompare(String(b.full_name || ''))
      })

      // Assign Rank 1..n based on sorted order (ties not merged)
      const withRanks = rankedRows.map((r, idx) => ({ ...r, displayRank: idx + 1 }))

      setRanked(withRanks)
      setUnmarked(unmarkedRows)
      setAbsent(absentRows)
      setMessage('Results loaded successfully.')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Admin Dashboard</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">View Exam Results</h1>
        <p className="text-gray-600 mt-2">Select a course + exam date to view Ranked, Unmarked, and Absent students.</p>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Exam</h2>
            <p className="text-sm text-gray-500">Choose the exam session you want to review.</p>
          </div>
          <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{loading ? 'Loading…' : 'Ready'}</span>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">{error}</div>}
        {message && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm">{message}</div>}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            fetchExamResults()
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value)
                  setSelectedExamId('')
                  setExamInfo(null)
                  setRanked([])
                  setUnmarked([])
                  setAbsent([])
                  setMessage('')
                  setError('')
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                disabled={!selectedCourse}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select exam date</option>
                {examsForSelectedCourse.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.nepali_date} — {ex.topic_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <button
              type="submit"
              disabled={loading || !selectedExamId}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-medium transition"
            >
              {loading ? 'Fetching results…' : 'View Results'}
            </button>

            {selectedExam && (
              <div className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <span className="font-semibold">Loaded:</span> {selectedExam.exam_name} • {selectedExam.nepali_date}
              </div>
            )}
          </div>
        </form>
      </section>

      {examInfo && (
        <section className="mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Exam: {examInfo.exam_name}</h2>
            <p className="text-sm text-gray-500">{examInfo.course} • {examInfo.nepali_date}</p>
          </div>
        </section>
      )}

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Ranked</h2>
            <p className="text-sm text-gray-500">Students with numeric scores (sorted by marks descending).</p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
            {ranked.length} ranked
          </span>
        </div>

        {ranked.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">No ranked results found for this exam.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Symbol No.</th>
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ranked.map((row) => (
                  <tr key={row.result_id || row.student_id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.displayRank}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.symbol_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.score}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{Number(row.percentage || 0).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Archived (Unmarked + Absent)</h2>
            <p className="text-sm text-gray-500">Unmarked: present but no score. Absent: explicitly marked absent.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowArchived((s) => !s)}
            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 hover:bg-slate-200"
          >
            {showArchived ? 'Hide' : 'Show'}
          </button>
        </div>

        {showArchived ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-amber-900">Unmarked</h3>
                  <span className="text-xs bg-white px-3 py-1 rounded-full border border-amber-200 text-amber-800">{unmarked.length}</span>
                </div>
                {unmarked.length === 0 ? (
                  <div className="text-sm text-amber-900/70">No unmarked students.</div>
                ) : (
                  <div className="space-y-2">
                    {unmarked.map((row) => (
                      <div key={row.result_id || row.student_id} className="flex items-center justify-between gap-3 bg-white border border-amber-200 rounded-lg px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-amber-900 truncate">{row.full_name}</div>
                          <div className="text-xs text-amber-800">{row.symbol_number}</div>
                        </div>
                        <span className="text-xs font-semibold text-amber-800 rounded-full bg-amber-100 px-3 py-1">— / {selectedExam?.total_questions ?? 25}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-rose-900">Absent</h3>
                  <span className="text-xs bg-white px-3 py-1 rounded-full border border-rose-200 text-rose-800">{absent.length}</span>
                </div>
                {absent.length === 0 ? (
                  <div className="text-sm text-rose-900/70">No absent students.</div>
                ) : (
                  <div className="space-y-2">
                    {absent.map((row) => (
                      <div key={row.result_id || row.student_id} className="flex items-center justify-between gap-3 bg-white border border-rose-200 rounded-lg px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-rose-900 truncate">{row.full_name}</div>
                          <div className="text-xs text-rose-800">{row.symbol_number}</div>
                        </div>
                        <span className="text-xs font-semibold text-rose-800 rounded-full bg-rose-100 px-3 py-1">ABSENT</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </section>

      {loading && (
        <div className="mt-4 text-sm text-slate-600">Loading…</div>
      )}
    </div>
  )
}

export function StudentsPage() {
  const { token } = useAuth()

  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentAnalytics, setStudentAnalytics] = useState(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [analyticsMessage, setAnalyticsMessage] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [promptCopied, setPromptCopied] = useState(false)
  const [teacherRemarks, setTeacherRemarks] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [reportGenerated, setReportGenerated] = useState(false)
  const [reportGeneratedAt, setReportGeneratedAt] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    symbol_number: '',
    course: '',
    shift: '',
    batch: '',
  })

  const loadStudents = async () => {
      const response = await fetch(`${API_BASE_URL}/students`)

    const data = await response.json()
    setStudents(data.data || [])
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const filteredStudents = students.filter((student) => {
    const query = searchTerm.toLowerCase()
    return [student.full_name, student.symbol_number, student.course, student.shift, student.batch]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm({
      full_name: '',
      symbol_number: '',
      course: '',
      shift: '',
      batch: '',
    })
    setEditingStudentId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { full_name, symbol_number, course, shift, batch } = form
    if (!full_name || !symbol_number || !course || !shift || !batch) {
      alert('Please fill in all student fields')
      return
    }

    try {
      setIsSaving(true)
      const url = editingStudentId ? `${API_BASE_URL}/students/${editingStudentId}` : `${API_BASE_URL}/students`
      const method = editingStudentId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to save student')
      }

      await loadStudents()
      resetForm()
    } catch (error) {
      alert(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (student) => {
    setEditingStudentId(student.id)
    setForm({
      full_name: student.full_name,
      symbol_number: student.symbol_number,
      course: student.course,
      shift: student.shift,
      batch: student.batch,
    })
  }

  const handleDelete = async (studentId) => {
    if (!window.confirm('Remove this student?')) return

    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (response.ok) {
      await loadStudents()
    }
  }

  const loadStudentAnalytics = async (student) => {
    setSelectedStudent(student)
    setStudentAnalytics(null)
    setGeneratedPrompt('')
    setPromptCopied(false)
    setTeacherRemarks('')
    setAiAnalysis('')
    setReportGenerated(false)
    setReportGeneratedAt('')
    setAnalyticsMessage('')
    setIsLoadingAnalytics(true)

    try {
      const response = await fetch(`${API_BASE_URL}/results/analytics/student/${student.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load analytics')
      }

      setStudentAnalytics(data.data)
    } catch (error) {
      setAnalyticsMessage(error.message)
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  const analyticsPalette = [chartColors.primary, chartColors.secondary, chartColors.warning, chartColors.danger, chartColors.info]

  const topicChartData = {
    labels: (studentAnalytics?.student_analytics?.topic_performance || []).map((item) => item.topic),
    datasets: [
      {
        data: (studentAnalytics?.student_analytics?.topic_performance || []).map((item) => Number(item.avg_percentage.toFixed(1))),
        backgroundColor: analyticsPalette,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }

  const sectionChartData = {
    labels: ['Section A', 'Section B', 'Section C'],
    datasets: [
      {
        data: [
          studentAnalytics?.student_analytics?.section_performance?.A || 0,
          studentAnalytics?.student_analytics?.section_performance?.B || 0,
          studentAnalytics?.student_analytics?.section_performance?.C || 0,
        ],
        backgroundColor: [chartColors.primary, chartColors.secondary, chartColors.warning],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }

  const weeklyTrendData = {
    labels: (studentAnalytics?.student_analytics?.weekly_average || []).map((item) => item.week_key),
    datasets: [
      {
        label: 'Average %',
        data: (studentAnalytics?.student_analytics?.weekly_average || []).map((item) => Number(item.avg_percentage.toFixed(1))),
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}33`,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  }

  const chartLegendBottom = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'bottom',
      },
    },
  }

  const trendOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,
      },
    },
  }

  const topicPerformance = studentAnalytics?.student_analytics?.topic_performance || []
  const weeklyAverage = studentAnalytics?.student_analytics?.weekly_average || []
  const examHistory = studentAnalytics?.student_analytics?.exam_history || []
  const repeatedMistakes = studentAnalytics?.student_analytics?.repeated_mistakes || []
  const sectionPerformance = studentAnalytics?.student_analytics?.section_performance || { A: 0, B: 0, C: 0 }
  const strongestTopic = studentAnalytics?.student_analytics?.strongest_topic
  const weakestTopic = studentAnalytics?.student_analytics?.weakest_topic

  const generateAnalysisPrompt = () => {
    if (!selectedStudent || !studentAnalytics) return

    const weeklySummary = weeklyAverage.map((item) => `${item.week_key} (${item.week_start}): ${Number(item.avg_percentage).toFixed(1)}%`).join('\n')
    const examSummary = examHistory.map((item) => `${item.exam_name} (${item.topic_name}) — ${item.percentage.toFixed(1)}%`).join('\n')
    const repeatedMistakeSummary = repeatedMistakes.length > 0
      ? repeatedMistakes.map((item) => `Question ${item.question_number} (${item.section}) repeated ${item.wrong_attempts} time(s), wrong options: ${item.wrong_options.join(', ')}`).join('\n')
      : 'No repeated mistakes detected.'

    const prompt = [
      `Student Name: ${selectedStudent.full_name}`,
      `Symbol Number: ${selectedStudent.symbol_number}`,
      `Course: ${selectedStudent.course}`,
      `Exam History:\n${examSummary || 'No exam history recorded'}`,
      `Weekly Performance:\n${weeklySummary || 'No weekly data recorded'}`,
      `Strongest Topic: ${strongestTopic?.topic || 'N/A'} (${strongestTopic?.avg_percentage?.toFixed(1) || '0'}%)`,
      `Weakest Topic: ${weakestTopic?.topic || 'N/A'} (${weakestTopic?.avg_percentage?.toFixed(1) || '0'}%)`,
      `Section Performance: A ${Number(sectionPerformance.A).toFixed(1)}%, B ${Number(sectionPerformance.B).toFixed(1)}%, C ${Number(sectionPerformance.C).toFixed(1)}%`,
      `Repeated Mistakes:\n${repeatedMistakeSummary}`,
      `Score Trend: ${weeklyAverage.map((item) => `${item.week_key}: ${Number(item.avg_percentage).toFixed(1)}%`).join(' | ') || 'No trend data'}`,
      `Motivation Request: Provide supportive, constructive feedback with clear improvement priorities and next-step study encouragement.`,
    ].join('\n\n')

    setGeneratedPrompt(prompt)
    setPromptCopied(false)
  }

  const copyGeneratedPrompt = async () => {
    if (!generatedPrompt) return
    await navigator.clipboard.writeText(generatedPrompt)
    setPromptCopied(true)
  }

  const generateWeeklyReport = () => {
    setReportGenerated(true)
    setReportGeneratedAt(new Date().toLocaleString())
  }

  const printWeeklyReport = () => {
    window.print()
  }

  return (
    <div className="p-6 lg:p-8">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .weekly-report-print, .weekly-report-print * {
            visibility: visible;
          }

          .weekly-report-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .no-print {
            display: none !important;
          }
        }

        @page {
          size: A4;
          margin: 12mm;
        }
      `}</style>
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Admin Management</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Students</h1>
        <p className="text-gray-600 mt-2">Add, edit, remove, search, and open analytics-driven student profiles.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{editingStudentId ? 'Edit Student' : 'Add Student'}</h2>
              <p className="text-sm text-gray-500">Manage the student roster.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symbol Number</label>
              <input
                type="text"
                value={form.symbol_number}
                onChange={(e) => handleChange('symbol_number', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <input
                type="text"
                value={form.course}
                onChange={(e) => handleChange('course', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
              <input
                type="text"
                value={form.shift}
                onChange={(e) => handleChange('shift', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
              <input
                type="text"
                value={form.batch}
                onChange={(e) => handleChange('batch', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {isSaving ? 'Saving...' : editingStudentId ? 'Update Student' : 'Add Student'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Student List</h2>
              <p className="text-sm text-gray-500">Search, manage, and open analytics profiles for students.</p>
            </div>

            <div className="w-full md:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search students"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Shift</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{student.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{student.symbol_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{student.course}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{student.shift}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{student.batch}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => loadStudentAnalytics(student)}
                          className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium"
                        >
                          View Analytics
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(student)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(student.id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Student Analytics Profile</h2>
            <p className="text-sm text-gray-500">Open a student to inspect trends, performance patterns, and class-level insights.</p>
          </div>
          {selectedStudent && (
            <div className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold">
              {selectedStudent.full_name} • {selectedStudent.symbol_number}
            </div>
          )}
        </div>

        {!selectedStudent && (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
            Select a student and click <span className="font-semibold text-gray-700">View Analytics</span> to load performance charts and insights.
          </div>
        )}

        {selectedStudent && (
          <div className="space-y-6">
            {analyticsMessage && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{analyticsMessage}</div>
            )}

            {isLoadingAnalytics && (
              <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">Loading analytics profile...</div>
            )}

            {studentAnalytics && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-gray-200 bg-slate-900 text-white p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-300">Average Accuracy</p>
                    <p className="text-3xl font-bold mt-2">{studentAnalytics.student_analytics.overall_average.toFixed(1)}%</p>
                    <p className="text-sm text-slate-300 mt-2">Across all recorded tests</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Strongest Topic</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{studentAnalytics.student_analytics.strongest_topic?.topic || '—'}</p>
                    <p className="text-sm text-gray-600 mt-2">{studentAnalytics.student_analytics.strongest_topic ? `${studentAnalytics.student_analytics.strongest_topic.avg_percentage.toFixed(1)}% average` : 'No topic data'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Weakest Topic</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{studentAnalytics.student_analytics.weakest_topic?.topic || '—'}</p>
                    <p className="text-sm text-gray-600 mt-2">{studentAnalytics.student_analytics.weakest_topic ? `${studentAnalytics.student_analytics.weakest_topic.avg_percentage.toFixed(1)}% average` : 'No topic data'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Weekly Average</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{studentAnalytics.student_analytics.weekly_average.length > 0 ? `${(studentAnalytics.student_analytics.weekly_average.reduce((sum, item) => sum + item.avg_percentage, 0) / studentAnalytics.student_analytics.weekly_average.length).toFixed(1)}%` : '0.0%'}</p>
                    <p className="text-sm text-gray-600 mt-2">Average across tracked weeks</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 no-print">
                  <div className="rounded-xl border border-gray-200 p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI Prompt Generator</h3>
                        <p className="text-sm text-gray-500">Generate a structured prompt for free AI use, then copy it into an external assistant.</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <button
                        type="button"
                        onClick={generateAnalysisPrompt}
                        className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                      >
                        Generate Analysis Prompt
                      </button>
                      <button
                        type="button"
                        onClick={copyGeneratedPrompt}
                        disabled={!generatedPrompt}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-gray-300"
                      >
                        {promptCopied ? 'Copied!' : 'Copy Prompt'}
                      </button>
                    </div>

                    <textarea
                      readOnly
                      value={generatedPrompt}
                      rows="12"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none"
                      placeholder="Generate a structured prompt to see the analysis text here."
                    />
                  </div>

                  <div className="rounded-xl border border-gray-200 p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Weekly Report Studio</h3>
                        <p className="text-sm text-gray-500">Add teacher remarks, paste the free AI response, and generate the printable report.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Remarks</label>
                        <textarea
                          value={teacherRemarks}
                          onChange={(e) => setTeacherRemarks(e.target.value)}
                          rows="4"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add weekly teacher remarks and support notes here."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pasted AI Analysis</label>
                        <textarea
                          value={aiAnalysis}
                          onChange={(e) => setAiAnalysis(e.target.value)}
                          rows="6"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Paste the free AI response here after manual analysis."
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={generateWeeklyReport}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Generate Weekly Report
                        </button>
                        <button
                          type="button"
                          onClick={printWeeklyReport}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Print Weekly Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-gray-200 p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Topic Accuracy</h3>
                        <p className="text-sm text-gray-500">Pie chart by topic performance.</p>
                      </div>
                    </div>
                    <div className="h-72">
                      <Pie data={topicChartData} options={chartLegendBottom} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Section Performance</h3>
                        <p className="text-sm text-gray-500">Section A/B/C accuracy overview.</p>
                      </div>
                    </div>
                    <div className="h-72">
                      <Pie data={sectionChartData} options={chartLegendBottom} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 rounded-xl border border-gray-200 p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Score Trend</h3>
                        <p className="text-sm text-gray-500">Weekly comparison across the student’s recorded attempts.</p>
                      </div>
                    </div>
                    <div className="h-72">
                      <Line data={weeklyTrendData} options={trendOptions} />
                    </div>
                  </div>

                  {reportGenerated && (
                    <div className="weekly-report-print rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
                      <div className="flex items-start justify-between border-b border-gray-200 pb-4 mb-5">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Weekly Report</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-1">{selectedStudent.full_name}</h3>
                          <p className="text-sm text-gray-500">{selectedStudent.symbol_number} • {selectedStudent.course}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p className="font-semibold text-gray-700">Generated</p>
                          <p>{reportGeneratedAt || '—'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                          <p className="text-xs uppercase tracking-wide text-gray-500">Overall Accuracy</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{studentAnalytics.student_analytics.overall_average.toFixed(1)}%</p>
                          <p className="text-sm text-gray-600 mt-2">Best topic: {studentAnalytics.student_analytics.strongest_topic?.topic || 'N/A'}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                          <p className="text-xs uppercase tracking-wide text-gray-500">Weekly Trend</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{studentAnalytics.student_analytics.weekly_average.length > 0 ? `${(studentAnalytics.student_analytics.weekly_average.reduce((sum, item) => sum + item.avg_percentage, 0) / studentAnalytics.student_analytics.weekly_average.length).toFixed(1)}%` : '0.0%'}</p>
                          <p className="text-sm text-gray-600 mt-2">Tracked across {studentAnalytics.student_analytics.weekly_average.length} recorded weeks</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
                        <div className="rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">Topic Performance</h4>
                              <p className="text-xs text-gray-500">Pie distribution by topic accuracy</p>
                            </div>
                          </div>
                          <div className="h-56">
                            <Pie data={topicChartData} options={chartLegendBottom} />
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">Section Performance</h4>
                              <p className="text-xs text-gray-500">Section accuracy summary</p>
                            </div>
                          </div>
                          <div className="h-56">
                            <Pie data={sectionChartData} options={chartLegendBottom} />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4 mb-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Weekly Score Trend</h4>
                            <p className="text-xs text-gray-500">Historical weekly average performance</p>
                          </div>
                        </div>
                        <div className="h-64">
                          <Line data={weeklyTrendData} options={trendOptions} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-gray-200 p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Teacher Remarks</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{teacherRemarks || 'No remarks added for this weekly report.'}</p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">AI Analysis</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiAnalysis || 'No AI analysis pasted yet.'}</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4 mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Repeated Mistakes</h4>
                        {studentAnalytics.student_analytics.repeated_mistakes.length > 0 ? (
                          <ul className="space-y-2">
                            {studentAnalytics.student_analytics.repeated_mistakes.map((mistake, index) => (
                              <li key={`${mistake.question_number}-${index}`} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                <span className="font-semibold">Question {mistake.question_number}</span> • Section {mistake.section} • Correct option {mistake.correct_option}
                                <span className="block mt-1 text-gray-600">Wrong attempts: {mistake.wrong_attempts} • Selected options: {mistake.wrong_options.join(', ') || 'N/A'}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No repeated mistakes recorded yet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-gray-200 p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Section Analysis</h3>
                        <p className="text-sm text-gray-500">Average section-wise performance summary.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {['A', 'B', 'C'].map((section) => {
                        const value = studentAnalytics.student_analytics.section_performance[section]
                        return (
                          <div key={section} className="rounded-lg bg-gray-50 p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-900">Section {section}</p>
                              <p className="text-sm font-bold text-gray-900">{value.toFixed(1)}%</p>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-600"
                                style={{ width: `${Math.min(value, 100)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-5 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Class Insights</h3>
                      <p className="text-sm text-gray-500">Aggregated class-level performance signals.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                    <div className="rounded-xl bg-slate-900 text-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-300">Class Average</p>
                      <p className="text-2xl font-bold mt-1">{studentAnalytics.class_insights.class_average.toFixed(1)}%</p>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Topper Marks</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{studentAnalytics.class_insights.topper_marks}</p>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Lowest Marks</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{studentAnalytics.class_insights.lowest_marks}</p>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Strongest Topic</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{studentAnalytics.class_insights.strongest_topic?.topic || '—'}</p>
                      <p className="text-sm text-gray-600 mt-1">{studentAnalytics.class_insights.strongest_topic ? `${studentAnalytics.class_insights.strongest_topic.avg_percentage.toFixed(1)}%` : 'No data'}</p>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Hardest Topic</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{studentAnalytics.class_insights.hardest_topic?.topic || '—'}</p>
                      <p className="text-sm text-gray-600 mt-1">{studentAnalytics.class_insights.hardest_topic ? `${studentAnalytics.class_insights.hardest_topic.avg_percentage.toFixed(1)}%` : 'No data'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
