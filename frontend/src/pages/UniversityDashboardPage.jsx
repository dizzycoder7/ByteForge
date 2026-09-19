import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import CodeChefFooter from '../components/CodeChefFooter'
import Spinner from '../components/Spinner'
import api from '../api/axios'

import { useAuth } from '../context/AuthContext'

export default function UniversityDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [collegeAssessments, setCollegeAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('roster') // 'roster', 'leaderboard', 'labs', 'analytics'
  const [selectedBatch, setSelectedBatch] = useState('All College Batches')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // ── Plagiarism Engine State ──────────────────────────────────────────────
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false)
  const [plagiarismReport, setPlagiarismReport] = useState(null)
  const [selectedMatchPair, setSelectedMatchPair] = useState(null)
  const [scanningPlagiarism, setScanningPlagiarism] = useState(false)
  const [selectedAssessmentName, setSelectedAssessmentName] = useState('')

  const facultyCollege = user?.collegeName || 'Delhi Technological University (DTU)'

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/university/dashboard?college=${encodeURIComponent(facultyCollege)}`),
      api.get(`/college/assessments?college=${encodeURIComponent(facultyCollege)}`),
    ])
      .then(([dashRes, assessRes]) => {
        setData(dashRes.data)
        setCollegeAssessments(assessRes.data || [])
      })
      .catch((err) => console.error('Failed to load university dashboard', err))
      .finally(() => setLoading(false))
  }, [facultyCollege])

  // ── Plagiarism Engine Handlers ──────────────────────────────────────────
  const handleRunPlagiarism = async (assessmentId, assessmentName) => {
    setSelectedAssessmentName(assessmentName || 'Semester Lab Practical')
    setScanningPlagiarism(true)
    setShowPlagiarismModal(true)
    try {
      const { data } = await api.get(`/college/assessments/${assessmentId || 1}/plagiarism`)
      setPlagiarismReport(data)
      if (data.matches && data.matches.length > 0) {
        setSelectedMatchPair(data.matches[0])
      }
    } catch (err) {
      console.error('Failed to run plagiarism check', err)
    } finally {
      setScanningPlagiarism(false)
    }
  }

  const handlePenalizePair = (pair) => {
    alert(`🚨 Academic Penalty Applied (-50% score deduction) for ${pair.studentNameA} and ${pair.studentNameB}. Flagged in Academic Integrity Record.`)
    setPlagiarismReport((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        matches: prev.matches.map((m) =>
          m.submissionIdA === pair.submissionIdA && m.submissionIdB === pair.submissionIdB
            ? { ...m, status: 'PENALIZED' }
            : m
        ),
      }
    })
  }

  const handleDismissPair = (pair) => {
    alert(`✅ Plagiarism flag dismissed for ${pair.studentNameA} and ${pair.studentNameB} (Marked legitimate).`)
    setPlagiarismReport((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        matches: prev.matches.map((m) =>
          m.submissionIdA === pair.submissionIdA && m.submissionIdB === pair.submissionIdB
            ? { ...m, status: 'DISMISSED' }
            : m
        ),
      }
    })
  }

  const handleExportPlagiarismCSV = () => {
    if (!plagiarismReport || !plagiarismReport.matches) return
    const headers = 'Assessment,Student A,Roll A,Student B,Roll B,Problem,Language,Similarity (%),Risk Level,Status,Matched AST Pattern\n'
    const rows = plagiarismReport.matches
      .map(
        (m) =>
          `"${selectedAssessmentName}","${m.studentNameA}","${m.rollNoA}","${m.studentNameB}","${m.rollNoB}","${m.problemTitle}","${m.language}",${m.similarityPercentage},"${m.riskLevel}","${m.status}","${m.matchedStructurePattern}"`
      )
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedAssessmentName.replaceAll(' ', '_')}_Plagiarism_Audit_Report.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!data) return null

  // Filter students by search term & placement status
  const filteredStudents = data.students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.handle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || s.placementStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = 'Roll No,Name,Handle,Batch,Problems Solved,Star Rating,Rating Score,Placement Status\n'
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.rollNo}","${s.name}","@${s.handle}","${s.batch}",${s.problemsSolved},${s.starRating}★,${s.ratingScore},"${s.placementStatus}"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ByteForge_${data.campusCode}_Student_Report.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. INSTITUTIONAL HEADER BAR                                        */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200/90 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* University Identity */}
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shadow-2xs">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  {data.universityName}
                </h1>
                <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full border border-green-200">
                  {data.chapterTier}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Coordinator: <span className="font-semibold text-gray-700">{data.coordinatorName}</span> • Campus ID: <span className="font-mono text-gray-600">{data.campusCode}</span>
              </p>
            </div>
          </div>

          {/* Controls: Batch Dropdown + Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {data.batches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-2xs transition-colors"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => alert('New Lab Assessment Creation Modal')}
              className="flex items-center gap-1 bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs transition-colors"
            >
              <span>+</span>
              <span>Create Lab Assessment</span>
            </button>
          </div>

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. TOP METRIC CARDS (4 KPIs)                                       */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-gray-500">Total Enrolled Students</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-gray-900">{data.totalStudents}</span>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                Active Chapter
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Across 4 academic sections</p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-gray-500">Problems Solved (This Term)</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-blue-600">
                {data.problemsSolvedThisTerm.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Avg 8.5/student
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Java, C++, and Python practicals</p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-gray-500">Placement-Ready Coders</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-emerald-600">{data.placementReadyCount}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                ★ 3+ Rated
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">100+ problems solved &amp; contest ready</p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-gray-500">Active Lab Assessments</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-amber-600">{data.activeLabTests} Live</span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Auto-Graded
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">1 upcoming mock placement test</p>
          </div>

        </div>

        {/* ────────────────────────────────────────────────────────────────── */}
        {/* 3. TABBED WORKSPACE CONTROLS                                       */}
        {/* ────────────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 px-6 pt-3 gap-8 text-xs font-bold text-gray-500">
            <button
              onClick={() => setActiveTab('roster')}
              className={`pb-3 transition-colors ${
                activeTab === 'roster'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'hover:text-gray-900'
              }`}
            >
              👥 Student Roster &amp; Batches ({filteredStudents.length})
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`pb-3 transition-colors ${
                activeTab === 'leaderboard'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'hover:text-gray-900'
              }`}
            >
              🏆 Campus-Exclusive Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('labs')}
              className={`pb-3 transition-colors ${
                activeTab === 'labs'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'hover:text-gray-900'
              }`}
            >
              🧪 Lab Assessments &amp; Exams ({data.labTests.length})
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 transition-colors ${
                activeTab === 'analytics'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'hover:text-gray-900'
              }`}
            >
              📊 Placement &amp; Skill Analytics
            </button>
          </div>

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* TAB 1: STUDENT ROSTER & BATCHES                                  */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeTab === 'roster' && (
            <div className="p-6 space-y-5">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by student name, roll number, or handle..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-semibold">Placement:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="READY">Ready (★3+)</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="NEEDS_PRACTICE">Needs Practice</option>
                  </select>
                </div>
              </div>

              {/* Roster Table */}
              <div className="border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8fafc] text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">Roll No</th>
                      <th className="px-4 py-3 font-bold">Student Name</th>
                      <th className="px-4 py-3 font-bold">Handle</th>
                      <th className="px-4 py-3 font-bold">Batch</th>
                      <th className="px-4 py-3 font-bold text-center">Problems Solved</th>
                      <th className="px-4 py-3 font-bold text-center">Star Rating</th>
                      <th className="px-4 py-3 font-bold text-center">Placement Status</th>
                      <th className="px-4 py-3 font-bold">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {filteredStudents.map((s) => (
                      <tr key={s.rollNo} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">{s.rollNo}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{s.name}</td>
                        <td className="px-4 py-3">
                          <Link to={`/profile/${s.handle}`} className="text-blue-600 hover:underline">
                            @{s.handle}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{s.batch}</td>
                        <td className="px-4 py-3 text-center font-bold text-blue-700">{s.problemsSolved}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                            {s.starRating}★ ({s.ratingScore})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              s.placementStatus === 'READY'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.placementStatus === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {s.placementStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{s.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* TAB 2: CAMPUS-EXCLUSIVE LEADERBOARD                              */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeTab === 'leaderboard' && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    🏛️ {data.universityName} — Official Campus Standings
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Real-time ranking of students enrolled in this college chapter.
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Download Standings CSV →
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-bold w-16 text-center">Rank</th>
                      <th className="px-4 py-3 font-bold">Student</th>
                      <th className="px-4 py-3 font-bold">Roll No</th>
                      <th className="px-4 py-3 font-bold text-center">Problems Solved</th>
                      <th className="px-4 py-3 font-bold text-center">Rating</th>
                      <th className="px-4 py-3 font-bold text-center">Placement Readiness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {[...data.students]
                      .sort((a, b) => b.problemsSolved - a.problemsSolved)
                      .map((s, idx) => (
                        <tr key={s.rollNo} className={idx < 3 ? 'bg-amber-50/40 font-semibold' : ''}>
                          <td className="px-4 py-3 text-center text-sm font-bold">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-gray-900">{s.name}</span>
                            <span className="text-gray-400 ml-2">(@{s.handle})</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-600">{s.rollNo}</td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">{s.problemsSolved}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                              {s.starRating}★ ({s.ratingScore})
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.placementStatus === 'READY'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {s.placementStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* TAB 3: LAB ASSESSMENTS & EXAMS                                   */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeTab === 'labs' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Academic Programming Labs</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automated test-case grading for weekly practicals and semester exams.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunPlagiarism(collegeAssessments[0]?.id || 1, collegeAssessments[0]?.assessmentName || 'Semester Lab Practical')}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <span>🚨</span> Run Plagiarism Check
                  </button>
                  <Link
                    to="/college/assessments?tab=create-assessment"
                    className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                  >
                    + Create New Assessment
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Live Assessments Created via CodeChef College Offering */}
                {collegeAssessments.map((ca) => (
                  <div
                    key={`ca-${ca.id}`}
                    className="border border-blue-200 bg-blue-50/20 rounded-2xl p-5 space-y-3 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          ASSESS-#{ca.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">
                          {ca.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-gray-900 line-clamp-2">
                        {ca.assessmentName}
                      </h4>
                      <p className="text-[11px] text-gray-500">{ca.cohort}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Duration:</span>
                        <span className="font-semibold font-mono">
                          {ca.durationDays > 0 && `${ca.durationDays}d `}
                          {ca.durationHours}h {ca.durationMins}m
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Start Time:</span>
                        <span className="font-semibold text-[11px]">{ca.startTime}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Languages:</span>
                        <span className="font-semibold text-blue-700 text-[11px]">{ca.allowedLanguages}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => handleRunPlagiarism(ca.id, ca.assessmentName)}
                          className="py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 rounded-lg transition-colors shadow-2xs text-center flex items-center justify-center gap-1"
                        >
                          <span>🚨</span> Plagiarism
                        </button>
                        <button
                          onClick={() => alert(`Grade Sheet downloaded for ${ca.assessmentName}`)}
                          className="py-1.5 text-xs bg-white hover:bg-gray-50 text-blue-600 font-bold border border-blue-200 rounded-lg transition-colors shadow-2xs"
                        >
                          Grade Sheet
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pre-configured Semester Lab Practical Tests */}
                {data.labTests.map((t) => (
                  <div
                    key={t.id}
                    className="border border-gray-200 rounded-2xl p-5 space-y-3 bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          {t.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            t.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 animate-pulse'
                              : t.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-gray-900 line-clamp-2">{t.title}</h4>
                      <p className="text-[11px] text-gray-500">{t.batch}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Duration:</span>
                        <span className="font-semibold">{t.duration}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Submissions:</span>
                        <span className="font-semibold">
                          {t.submissionsCount} / {t.totalEnrolled}
                        </span>
                      </div>
                      {t.avgScore > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Class Avg:</span>
                          <span>{t.avgScore}/100</span>
                        </div>
                      )}

                      <button
                        onClick={() => alert(`Grade Sheet downloaded for ${t.id}`)}
                        className="w-full mt-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold border border-gray-300 rounded-lg transition-colors"
                      >
                        Download Grade Sheet (CSV)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* TAB 4: PLACEMENT & SKILL ANALYTICS                               */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Campus Skill &amp; Rating Distribution</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time algorithmic breakdown of enrolled students across Star Ratings.
                </p>
              </div>

              {/* Rating Distribution Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <span className="text-xs font-bold text-gray-500">1★ Rating (&lt;1400)</span>
                  <p className="text-2xl font-black text-gray-700 mt-1">{data.ratingDistribution.oneStar}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Beginner coders</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <span className="text-xs font-bold text-green-700">2★ Rating (1400-1599)</span>
                  <p className="text-2xl font-black text-green-800 mt-1">{data.ratingDistribution.twoStar}</p>
                  <p className="text-[10px] text-green-600 mt-1">DSA Foundation</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <span className="text-xs font-bold text-blue-700">3★ Rating (1600-1799)</span>
                  <p className="text-2xl font-black text-blue-800 mt-1">{data.ratingDistribution.threeStar}</p>
                  <p className="text-[10px] text-blue-600 mt-1">Placement Ready</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <span className="text-xs font-bold text-purple-700">4★ Rating (1800-1999)</span>
                  <p className="text-2xl font-black text-purple-800 mt-1">{data.ratingDistribution.fourStar}</p>
                  <p className="text-[10px] text-purple-600 mt-1">Advanced Algorithmists</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <span className="text-xs font-bold text-amber-700">5★+ Rating (2000+)</span>
                  <p className="text-2xl font-black text-amber-800 mt-1">{data.ratingDistribution.fiveStarPlus}</p>
                  <p className="text-[10px] text-amber-600 mt-1">Grandmaster / FAANG</p>
                </div>
              </div>

              {/* Topic Mastery Summary */}
              <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-3">
                <h4 className="text-xs font-bold text-gray-900">Campus Core Topic Mastery</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Arrays &amp; Strings</span>
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-1">
                      <div className="bg-blue-600 h-2 rounded-full w-[88%]" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-700">88% Avg Accuracy</span>
                  </div>

                  <div>
                    <span className="text-gray-500">Trees &amp; Binary Search</span>
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-1">
                      <div className="bg-emerald-600 h-2 rounded-full w-[74%]" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-700">74% Avg Accuracy</span>
                  </div>

                  <div>
                    <span className="text-gray-500">Dynamic Programming</span>
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-1">
                      <div className="bg-amber-500 h-2 rounded-full w-[56%]" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-700">56% Avg Accuracy</span>
                  </div>

                  <div>
                    <span className="text-gray-500">Graph Algorithms</span>
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-1">
                      <div className="bg-purple-600 h-2 rounded-full w-[44%]" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-700">44% Avg Accuracy</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3.5 FACULTY PLAGIARISM & MOSS INTEGRITY AUDIT MODAL                 */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {showPlagiarismModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1e293b] border-2 border-red-500/50 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white">
            
            {/* Modal Top Header */}
            <div className="p-5 bg-[#0f172a] border-b border-gray-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-red-500 text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      MOSS Engine Active
                    </span>
                    <h3 className="text-base font-black text-white">
                      Automated Code Plagiarism &amp; Structural Similarity Audit
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    Assessment: <strong className="text-blue-400">{selectedAssessmentName}</strong> • Institution: {data?.stats?.collegeName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportPlagiarismCSV}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>📥</span> Export Audit Report (CSV)
                  </button>
                  <button
                    onClick={() => setShowPlagiarismModal(false)}
                    className="text-gray-400 hover:text-white text-xl font-bold p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              {plagiarismReport && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Submissions Analyzed</span>
                    <span className="text-base font-mono font-black text-white">{plagiarismReport.totalSubmissionsAnalyzed}</span>
                  </div>
                  <div className="bg-red-950/40 border border-red-800/80 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-red-300 uppercase font-bold block">🚨 High Risk (&ge;75%)</span>
                    <span className="text-base font-mono font-black text-red-400">{plagiarismReport.highRiskCount} Pairs</span>
                  </div>
                  <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">⚠️ Suspicious (50-74%)</span>
                    <span className="text-base font-mono font-black text-amber-400">{plagiarismReport.mediumRiskCount} Pairs</span>
                  </div>
                  <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-emerald-300 uppercase font-bold block">🟢 Clean (&lt;50%)</span>
                    <span className="text-base font-mono font-black text-emerald-400">{plagiarismReport.lowRiskCount} Pairs</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body: Comparison List (Left) + Side-by-Side Monaco Diff (Right) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* Left Column: Flagged Pair Matches (4 cols) */}
              <div className="lg:col-span-4 border-r border-gray-800 overflow-y-auto p-4 space-y-2.5 bg-[#0f172a]/70">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Flagged Comparison Pairs:</span>
                  <span className="font-mono text-gray-500">{plagiarismReport?.matches?.length || 0} Total</span>
                </p>

                {plagiarismReport?.matches?.map((pair, idx) => (
                  <div
                    key={`pair-${idx}`}
                    onClick={() => setSelectedMatchPair(pair)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                      selectedMatchPair === pair
                        ? 'bg-red-950/50 border-red-500 text-white shadow-md'
                        : 'bg-[#1e293b] border-gray-800 text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">
                        {pair.studentNameA} <span className="text-gray-500">↔</span> {pair.studentNameB}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          pair.riskLevel === 'HIGH'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : pair.riskLevel === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {pair.similarityPercentage}% Match
                      </span>
                    </div>

                    {/* Similarity Progress Bar */}
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pair.riskLevel === 'HIGH'
                            ? 'bg-red-500'
                            : pair.riskLevel === 'MEDIUM'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pair.similarityPercentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-gray-400 line-clamp-2">
                      {pair.matchedStructurePattern}
                    </p>

                    <div className="text-[10px] text-gray-500 flex items-center justify-between pt-1 border-t border-gray-800/80">
                      <span>Rolls: {pair.rollNoA} vs {pair.rollNoB}</span>
                      <span
                        className={`font-mono font-bold ${
                          pair.status === 'PENALIZED'
                            ? 'text-red-400'
                            : pair.status === 'DISMISSED'
                            ? 'text-green-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {pair.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Side-by-Side Dual Monaco Code Inspector (8 cols) */}
              <div className="lg:col-span-8 flex flex-col bg-[#1e293b] overflow-hidden">
                {selectedMatchPair ? (
                  <>
                    {/* Top Diff Header */}
                    <div className="p-3 bg-[#0f172a] border-b border-gray-800 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="text-gray-400">Exam Question: </span>
                        <strong className="text-white">{selectedMatchPair.problemTitle}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                          {selectedMatchPair.similarityPercentage}% Structural Match
                        </span>
                      </div>
                    </div>

                    {/* Dual Monaco Split-Pane: Student A on Left, Student B on Right */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden min-h-[300px] h-[360px]">
                      
                      {/* Left: Student A */}
                      <div className="border-r border-gray-800 flex flex-col h-full overflow-hidden">
                        <div className="p-2 bg-[#112446] border-b border-gray-800 flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-300">
                            👤 {selectedMatchPair.studentNameA} ({selectedMatchPair.rollNoA})
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 font-bold">
                            {selectedMatchPair.language}
                          </span>
                        </div>
                        <div className="flex-1 h-full">
                          <Editor
                            height="100%"
                            theme="vs-dark"
                            language={selectedMatchPair.language === 'CPP' ? 'cpp' : 'java'}
                            value={selectedMatchPair.sourceCodeA}
                            options={{
                              readOnly: true,
                              fontSize: 12,
                              minimap: { enabled: false },
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                            }}
                          />
                        </div>
                      </div>

                      {/* Right: Student B */}
                      <div className="flex flex-col h-full overflow-hidden">
                        <div className="p-2 bg-[#112446] border-b border-gray-800 flex items-center justify-between text-xs">
                          <span className="font-bold text-red-300">
                            👤 {selectedMatchPair.studentNameB} ({selectedMatchPair.rollNoB})
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 font-bold">
                            {selectedMatchPair.language}
                          </span>
                        </div>
                        <div className="flex-1 h-full">
                          <Editor
                            height="100%"
                            theme="vs-dark"
                            language={selectedMatchPair.language === 'CPP' ? 'cpp' : 'java'}
                            value={selectedMatchPair.sourceCodeB}
                            options={{
                              readOnly: true,
                              fontSize: 12,
                              minimap: { enabled: false },
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                            }}
                          />
                        </div>
                      </div>

                    </div>

                    {/* Bottom Action Footer for Faculty Decision */}
                    <div className="p-3 bg-[#0f172a] border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <p className="text-[11px] text-gray-400">
                        {selectedMatchPair.matchedStructurePattern}
                      </p>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleDismissPair(selectedMatchPair)}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-700"
                        >
                          ✅ Dismiss False Positive
                        </button>
                        <button
                          onClick={() => handlePenalizePair(selectedMatchPair)}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          🚩 Apply Plagiarism Penalty (-50%)
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                    Select a flagged comparison pair on the left to inspect side-by-side code diff.
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 4. FOOTER                                                          */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <CodeChefFooter />

    </div>
  )
}
