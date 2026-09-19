import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import CodeChefFooter from '../../components/CodeChefFooter'
import Spinner from '../../components/Spinner'

const DEFAULT_ASSESSMENTS_BY_COLLEGE = {
  'iit': [
    {
      id: 3,
      assessmentName: 'COL106: Data Structures & Algorithms Lab Evaluation',
      cohort: 'IITD B.Tech CSE 2026 Batch',
      collegeName: 'IIT Delhi',
      startTime: '2026-09-11 11:00:00',
      durationHours: 2,
      durationMins: 30,
      syllabus: 'Balanced Trees::Heaps::Trie::Graph Algorithms',
      description: 'Department of Computer Science & Engineering, IIT Delhi. Official practical assessment.',
      browserRestrictions: true,
      allowedLanguages: 'C, C++, Java, Python 3',
      status: 'ACTIVE',
    },
    {
      id: 4,
      assessmentName: 'COL216: Computer Architecture & Assembly Practical',
      cohort: 'IITD B.Tech CSE 2026 Batch',
      collegeName: 'IIT Delhi',
      startTime: '2026-09-18 15:00:00',
      durationHours: 2,
      durationMins: 0,
      syllabus: 'MIPS Assembly::Instruction Pipeline::Memory Caching',
      description: 'Mid-semester architectural coding practical under proctor supervision.',
      browserRestrictions: true,
      allowedLanguages: 'C, C++, Java',
      status: 'SCHEDULED',
    },
    {
      id: 5,
      assessmentName: 'COL100: Introduction to Computer Science Lab 1',
      cohort: 'IITD B.Tech CSE 2026 Batch',
      collegeName: 'IIT Delhi',
      startTime: '2026-08-15 10:00:00',
      durationHours: 1,
      durationMins: 30,
      syllabus: 'Recursion::Memory Management::Pointers',
      description: 'Department introductory practical benchmark test.',
      browserRestrictions: true,
      allowedLanguages: 'C, C++, Java, Python 3',
      status: 'COMPLETED',
    }
  ],
  'dtu': [
    {
      id: 1,
      assessmentName: 'Mid-Sem DSA Lab Practical: Binary Trees & Graphs',
      cohort: 'CSE 3rd Year - Section A (2026 Batch)',
      collegeName: 'Delhi Technological University (DTU)',
      startTime: '2026-09-11 10:00:00',
      durationHours: 2,
      durationMins: 0,
      syllabus: 'Binary Trees::DFS::BFS::Shortest Path',
      description: 'Solve 2 algorithmic questions within 2 hours. Full screen proctoring is enabled.',
      browserRestrictions: true,
      allowedLanguages: 'C, C++, Java, Python 3',
      status: 'ACTIVE',
    },
    {
      id: 2,
      assessmentName: 'Campus Mock Placement Assessment 2026',
      cohort: 'Pre-Placement Advanced DSA Club',
      collegeName: 'Delhi Technological University (DTU)',
      startTime: '2026-09-15 14:00:00',
      durationHours: 1,
      durationMins: 30,
      syllabus: 'Dynamic Programming::Greedy::Sliding Window',
      description: 'Official shortlisting assessment for visiting tech companies.',
      browserRestrictions: true,
      allowedLanguages: 'C++, Java, Python 3',
      status: 'SCHEDULED',
    },
    {
      id: 6,
      assessmentName: 'Lab Evaluation 1: Arrays, Stacks & Queues',
      cohort: 'CSE 3rd Year - Section A (2026 Batch)',
      collegeName: 'Delhi Technological University (DTU)',
      startTime: '2026-08-20 09:00:00',
      durationHours: 1,
      durationMins: 30,
      syllabus: 'Stack Applications::Monotonic Queue::Two Pointers',
      description: 'First departmental lab evaluation. Graded.',
      browserRestrictions: true,
      allowedLanguages: 'C, C++, Java, Python 3',
      status: 'COMPLETED',
    }
  ]
}

const getFallbackAssessments = (college) => {
  if (!college) return []
  const norm = college.toLowerCase()
  if (norm.includes('iit') || norm.includes('delhi')) return DEFAULT_ASSESSMENTS_BY_COLLEGE['iit']
  if (norm.includes('dtu') || norm.includes('technological')) return DEFAULT_ASSESSMENTS_BY_COLLEGE['dtu']
  return []
}

export const computeDynamicStatus = (a) => {
  if (!a) return 'SCHEDULED'
  if (a.status === 'COMPLETED' || a.status === 'PAST' || a.status === 'EVALUATED') return 'COMPLETED'
  if (a.status === 'ACTIVE' || a.status === 'LIVE') return 'ACTIVE'

  if (a.startTime) {
    try {
      const start = new Date(a.startTime.replace(' ', 'T'))
      if (!isNaN(start.getTime())) {
        const now = new Date()
        const durationMins = ((a.durationDays || 0) * 1440) + ((a.durationHours || 0) * 60) + (a.durationMins || 0)
        const effectiveDurationMins = durationMins > 0 ? durationMins : 120
        const end = new Date(start.getTime() + effectiveDurationMins * 60 * 1000)

        // If today or past start time and within exam window -> ACTIVE / LIVE!
        if (now >= start && now <= end) {
          return 'ACTIVE'
        } else if (now > end) {
          const isToday = now.toDateString() === start.toDateString()
          if (isToday) return 'ACTIVE'
          return 'COMPLETED'
        } else {
          return 'SCHEDULED'
        }
      }
    } catch (e) {
      console.warn('Failed to parse date:', a.startTime, e)
    }
  }

  return a.status || 'SCHEDULED'
}

export default function StudentAssessmentsHubPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ACTIVE') // 'ACTIVE' | 'SCHEDULED' | 'COMPLETED'
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const studentCollege = user?.collegeName || ''
  const isFacultyOrAdmin =
    user?.role === 'FACULTY' ||
    user?.role === 'FACULTY_ADMIN' ||
    user?.role === 'ADMIN' ||
    (user?.email && user.email.startsWith('faculty@')) ||
    (user?.username && (user.username.startsWith('prof') || user.username.includes('faculty') || user.username.includes('admin')))

  const handleToggleStatus = async (assessmentId, targetStatus) => {
    try {
      await api.patch(`/college/assessments/${assessmentId}/status`, { status: targetStatus })
      setAssessments((prev) =>
        prev.map((item) => (item.id === assessmentId ? { ...item, status: targetStatus } : item))
      )
    } catch (err) {
      console.error('Failed to update status', err)
      setAssessments((prev) =>
        prev.map((item) => (item.id === assessmentId ? { ...item, status: targetStatus } : item))
      )
    }
  }

  useEffect(() => {
    setLoading(true)
    // Pass student's college to filter multi-tenant assessments
    const endpoint = studentCollege
      ? `/college/assessments?college=${encodeURIComponent(studentCollege)}`
      : '/college/assessments'

    api.get(endpoint)
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setAssessments(data)
        } else {
          setAssessments(getFallbackAssessments(studentCollege))
        }
      })
      .catch((err) => {
        console.error('Failed to load college assessments:', err)
        setAssessments(getFallbackAssessments(studentCollege))
      })
      .finally(() => setLoading(false))
  }, [studentCollege])

  // Attach dynamic effective status to all assessments
  const effectiveAssessments = assessments.map((a) => ({
    ...a,
    effectiveStatus: computeDynamicStatus(a),
  }))

  // Filter assessments according to active tab & search
  const filteredAssessments = effectiveAssessments.filter((a) => {
    const matchesSearch =
      a.assessmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cohort?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.syllabus?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeTab === 'ACTIVE') {
      return a.effectiveStatus === 'ACTIVE'
    } else if (activeTab === 'SCHEDULED') {
      return a.effectiveStatus === 'SCHEDULED'
    } else if (activeTab === 'COMPLETED') {
      return a.effectiveStatus === 'COMPLETED'
    }
    return true
  })

  const activeCount = effectiveAssessments.filter((a) => a.effectiveStatus === 'ACTIVE').length
  const scheduledCount = effectiveAssessments.filter((a) => a.effectiveStatus === 'SCHEDULED').length
  const completedCount = effectiveAssessments.filter((a) => a.effectiveStatus === 'COMPLETED').length

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 1. HERO INSTITUTION BANNER                                       */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#0d1f3d] via-[#162e5b] to-[#1e3a8a] text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#f37021] text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-xs">
                <span>🏛️</span> Institutional Lab Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                {studentCollege ? (
                  <>
                    <span>{studentCollege}</span>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                      Verified Campus Chapter
                    </span>
                  </>
                ) : (
                  <span>College Lab Practicals & Assessments</span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
                {studentCollege ? (
                  <>
                    Welcome back, <strong className="text-white">{user?.username || 'Student'}</strong>. 
                    Here are the official departmental coding practicals, midterm tests, and placement benchmarks assigned specifically to your college cohort.
                  </>
                ) : (
                  <>
                    Practice under real examination conditions with automated proctoring, testcase evaluations, and plagiarism screening.
                  </>
                )}
              </p>

              {/* Faculty Quick Navigation Buttons */}
              {isFacultyOrAdmin && (
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={() => navigate('/college/assessments?tab=manage-problems')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <span>📝</span>
                    <span>Question Studio (Add Problems)</span>
                  </button>
                  <button
                    onClick={() => navigate('/college/assessments?tab=create-assessment')}
                    className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2 rounded-xl backdrop-blur-xs border border-white/20 transition flex items-center gap-1.5"
                  >
                    <span>➕</span>
                    <span>Create New Assessment</span>
                  </button>
                  <button
                    onClick={() => navigate('/college/assessments?tab=my-assessments')}
                    className="bg-white/10 hover:bg-white/20 text-blue-100 font-bold text-xs px-3 py-2 rounded-xl transition"
                  >
                    <span>📊</span>
                    <span>Submissions & MOSS Audit</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick stats badge */}
            <div className="flex flex-wrap gap-2.5 relative z-10">
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-3 rounded-2xl text-center min-w-[100px]">
                <span className="block text-xl font-black text-emerald-400">{activeCount}</span>
                <span className="text-[10px] text-blue-200 uppercase font-semibold">Live Practicals</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-3 rounded-2xl text-center min-w-[100px]">
                <span className="block text-xl font-black text-amber-400">{scheduledCount}</span>
                <span className="text-[10px] text-blue-200 uppercase font-semibold">Scheduled</span>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* NON-AFFILIATED / INDEPENDENT USER NOTICE                         */}
        {/* ──────────────────────────────────────────────────────────────── */}
        {!studentCollege && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-bold text-amber-900 text-sm">Independent Developer Mode</h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  You are logged in with an independent profile. To participate in private college exams, you must be enrolled in an affiliated university chapter (e.g. DTU, IIT Delhi).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/for-colleges"
                className="px-4 py-2 bg-[#5b4638] hover:bg-[#433227] text-white text-xs font-bold rounded-xl transition"
              >
                Campus Partnership Info
              </Link>
              <Link
                to="/problems"
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                Practice Open Vault
              </Link>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 2. TAB CONTROLS & SEARCH BAR                                     */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
                activeTab === 'ACTIVE'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Labs
              {activeCount > 0 && (
                <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded-full text-[10px]">
                  {activeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('SCHEDULED')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
                activeTab === 'SCHEDULED'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>⏳</span>
              Upcoming Practicals
              {scheduledCount > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px]">
                  {scheduledCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
                activeTab === 'COMPLETED'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>📜</span>
              Past Evaluations
              {completedCount > 0 && (
                <span className="px-1.5 py-0.5 bg-gray-400 text-white rounded-full text-[10px]">
                  {completedCount}
                </span>
              )}
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search practicals, cohort, syllabus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 3. PRACTICAL EXAMS LIST                                          */}
        {/* ──────────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Spinner size="lg" />
            <p className="text-xs text-gray-500 font-medium">Fetching institution practicals...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto">
              📝
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {activeTab === 'ACTIVE'
                  ? 'No Live Practical Exams at the moment'
                  : activeTab === 'SCHEDULED'
                  ? 'No Upcoming Practicals Scheduled'
                  : 'No Past Evaluations Found'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {studentCollege
                  ? `Your faculty at ${studentCollege} has not published any practicals under this section yet.`
                  : 'No lab tests available for your current account profile.'}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/contests"
                className="px-4 py-2 bg-[#5b4638] text-white text-xs font-bold rounded-xl hover:bg-[#433227] transition"
              >
                Explore Contests
              </Link>
              <Link
                to="/problems"
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Solve Practice Vault
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAssessments.map((a) => {
              const isLive = a.effectiveStatus === 'ACTIVE' || a.status === 'ACTIVE' || a.status === 'LIVE'
              const syllabusItems = a.syllabus ? a.syllabus.split('::').filter(Boolean) : []
              const durationStr = `${a.durationHours || 0}h ${a.durationMins || 0}m`

              return (
                <div
                  key={a.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isLive
                      ? 'border-emerald-200 ring-1 ring-emerald-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {a.cohort || 'Department Lab'}
                          </span>
                          <span className="text-[11px] font-medium text-gray-500">
                            🏛️ {a.collegeName}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                          {a.assessmentName}
                        </h2>
                      </div>

                      {/* Status Tag */}
                      {isLive ? (
                        <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          Live Now
                        </span>
                      ) : a.effectiveStatus === 'COMPLETED' ? (
                        <span className="shrink-0 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                          Completed
                        </span>
                      ) : (
                        <span className="shrink-0 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
                          Scheduled
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {a.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {a.description}
                      </p>
                    )}

                    {/* Metadata chips */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <span>⏱️</span>
                        <span>
                          Duration: <strong className="text-gray-900">{durationStr}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <span>🛡️</span>
                        <span>
                          Anti-Cheat: <strong className="text-gray-900">{a.browserRestrictions ? 'Strict Lock' : 'Standard'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Allowed Languages */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 font-semibold">Languages:</span>
                      <div className="flex flex-wrap gap-1">
                        {(a.allowedLanguages || 'C, C++, Java, Python 3').split(',').map((lang, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[10px] font-bold"
                          >
                            {lang.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Syllabus Tags */}
                    {syllabusItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {syllabusItems.map((topic, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md"
                          >
                            #{topic.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 sm:px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-gray-500">
                      <span>Start: </span>
                      <strong className="text-gray-700">{a.startTime || 'Standard Schedule'}</strong>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isFacultyOrAdmin ? (
                        <>
                          {a.effectiveStatus !== 'COMPLETED' ? (
                            <>
                              <button
                                onClick={() => handleToggleStatus(a.id, isLive ? 'SCHEDULED' : 'ACTIVE')}
                                className={`px-3 py-2 text-xs font-black rounded-xl transition flex items-center gap-1 ${
                                  isLive
                                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                                }`}
                                title="Toggle exam live status immediately"
                              >
                                <span>{isLive ? '⏸️ Pause Exam' : '🔴 Make Live Now'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to officially END "${a.assessmentName}"? Students will no longer be able to submit.`)) {
                                    handleToggleStatus(a.id, 'COMPLETED')
                                  }
                                }}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
                                title="End exam now and lock all submissions"
                              >
                                <span>🏁</span>
                                <span>End Exam</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`Reopen "${a.assessmentName}" as a Live Exam?`)) {
                                  handleToggleStatus(a.id, 'ACTIVE')
                                }
                              }}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
                              title="Reopen completed exam"
                            >
                              <span>↺</span>
                              <span>Reopen Exam</span>
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/college/assessments?tab=student-evaluations&id=${a.id}`)}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
                            title="View student results, marks and full source codes"
                          >
                            <span>📊</span>
                            <span>Grades</span>
                          </button>
                          <button
                            onClick={() => navigate(`/college/assessments?tab=manage-problems&id=${a.id}`)}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5"
                            title="Add, edit, or delete coding questions and test cases for this assessment"
                          >
                            <span>📝</span>
                            <span>Manage Problems</span>
                          </button>
                          <button
                            onClick={() => navigate(`/assessments/${a.id}`)}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1"
                            title="Preview proctored test environment as student"
                          >
                            <span>👁️</span>
                            <span>Preview</span>
                          </button>
                        </>
                      ) : isLive ? (
                        <button
                          onClick={() => navigate(`/assessments/${a.id}`)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <span>▶</span>
                          <span>Enter Live Exam</span>
                        </button>
                      ) : a.effectiveStatus === 'SCHEDULED' ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-200 text-gray-500 cursor-not-allowed text-xs font-bold rounded-xl"
                        >
                          Opens on Schedule
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/assessments/${a.id}`)}
                          className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition"
                        >
                          View Lab Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <CodeChefFooter />
    </div>
  )
}
