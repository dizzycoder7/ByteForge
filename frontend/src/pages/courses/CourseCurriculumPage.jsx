import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import CodeChefFooter from '../../components/CodeChefFooter'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

export default function CourseCurriculumPage() {
  const { slug } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState({ 1: true, 2: true, 3: true })

  // Interactive In-Browser Lesson Runner State
  const [activeLesson, setActiveLesson] = useState(null)
  const [code, setCode] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [outputConsole, setOutputConsole] = useState('')
  const [runningCode, setRunningCode] = useState(false)
  const [completedLessons, setCompletedLessons] = useState({})

  useEffect(() => {
    setLoading(true)
    api.get(`/courses/${slug}`)
      .then(({ data }) => setCourseData(data))
      .catch((err) => console.error('Failed to load course details', err))
      .finally(() => setLoading(false))
  }, [slug])

  const toggleModule = (modNum) => {
    setExpandedModules((prev) => ({ ...prev, [modNum]: !prev[modNum] }))
  }

  const handleOpenLesson = (lesson) => {
    setActiveLesson(lesson)
    setCode(lesson.starterCode || '#include <stdio.h>\n\nint main() {\n    // Write code here\n    return 0;\n}')
    setOutputConsole('')
  }

  const handleRunLessonCode = async () => {
    setRunningCode(true)
    setOutputConsole('Compiling and executing code...')
    try {
      const { data } = await api.post('/compiler/run', {
        language: 'C',
        code,
        input: customInput,
      })
      if (data.status === 'SUCCESS') {
        setOutputConsole(`STATUS: SUCCESS (${data.executionTimeMs}ms)\n────────────────────────\n${data.output || '(No output)'}`)
      } else {
        setOutputConsole(`STATUS: ${data.status}\n────────────────────────\n${data.error || data.output || 'Execution Error'}`)
      }
    } catch (err) {
      setOutputConsole(`Execution error: ${err.response?.data?.error || 'Server error'}`)
    } finally {
      setRunningCode(false)
    }
  }

  const handleCompleteLesson = () => {
    if (!activeLesson) return
    setCompletedLessons((prev) => ({ ...prev, [activeLesson.lessonId]: true }))
    alert(`🎉 Lesson "${activeLesson.title}" marked completed! +${activeLesson.points} points awarded.`)
    setActiveLesson(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const course = courseData?.course
  const modules = courseData?.modules || []
  const outcomes = courseData?.keyOutcomes || []
  const prereqs = courseData?.prerequisites || []

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP COURSE HEADER                                               */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#112446] text-white border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-300">
            <Link to="/courses" className="hover:underline">Courses</Link>
            <span>/</span>
            <span className="text-white">{course?.category}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="bg-[#5b4638] text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded">
                  {course?.level} TRACK
                </span>
                <span className="text-xs text-amber-400 font-bold">
                  ★ {course?.rating} ({course?.enrolledCount.toLocaleString()} Students Enrolled)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {course?.title}
              </h1>

              <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
                {course?.description}
              </p>
            </div>

            <div className="bg-[#1c3563] border border-blue-800 p-5 rounded-2xl space-y-3 flex-shrink-0 w-full sm:w-72 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">
                Track Progress
              </span>
              <div className="w-full bg-blue-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (Object.keys(completedLessons).length / (course?.lessonsCount || 10)) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs font-mono text-gray-300">
                {Object.keys(completedLessons).length} of {course?.lessonsCount || 10} Lessons Completed
              </p>
              <button
                onClick={() => {
                  const firstLab = modules[0]?.lessons[1] || modules[0]?.lessons[0]
                  if (firstLab) handleOpenLesson(firstLab)
                }}
                className="w-full bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md"
              >
                ▶ Resume First Lab
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. MAIN CURRICULUM ROADMAP                                         */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Syllabus Roadmap (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900">
              Interactive Course Syllabus ({modules.length} Modules)
            </h2>
            <span className="text-xs text-gray-500 font-mono">
              ⚡ Includes In-Browser Coding Labs
            </span>
          </div>

          <div className="space-y-4">
            {modules.map((mod) => (
              <div
                key={mod.moduleNumber}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Module Header Accordion */}
                <div
                  onClick={() => toggleModule(mod.moduleNumber)}
                  className="p-4 bg-gray-50/80 hover:bg-gray-100/80 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-lg bg-[#112446] text-white flex items-center justify-center font-black text-xs">
                      {mod.moduleNumber}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{mod.title}</h3>
                      <p className="text-[11px] text-gray-500">
                        {mod.lessons.length} Lessons • Estimated: {mod.estimatedTime}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-gray-400 font-bold">
                    {expandedModules[mod.moduleNumber] ? '▲ Collapse' : '▼ Expand'}
                  </span>
                </div>

                {/* Module Lessons List */}
                {expandedModules[mod.moduleNumber] && (
                  <div className="divide-y divide-gray-100 p-2">
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.lessonId}
                        className="p-3 hover:bg-blue-50/30 rounded-xl transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs ${
                              completedLessons[lesson.lessonId]
                                ? 'text-emerald-600 font-bold'
                                : 'text-gray-400'
                            }`}
                          >
                            {completedLessons[lesson.lessonId] ? '✓' : '○'}
                          </span>

                          <div>
                            <h4 className="text-xs font-bold text-gray-900">
                              {lesson.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 line-clamp-1">
                              {lesson.taskPrompt || lesson.theoryNotes}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                              lesson.type === 'CODING_LAB'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {lesson.type === 'CODING_LAB' ? '⚡ Interactive Lab' : '📖 Theory'}
                          </span>

                          <button
                            onClick={() => handleOpenLesson(lesson)}
                            className="bg-gray-100 hover:bg-[#2f66d4] hover:text-white text-gray-800 font-bold text-xs px-3 py-1 rounded-lg transition-colors"
                          >
                            {lesson.type === 'CODING_LAB' ? 'Open Lab →' : 'Read →'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Outcomes & Prerequisites (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Key Learning Outcomes */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">
              🎯 Key Learning Outcomes
            </h3>
            <ul className="space-y-2 text-xs text-gray-700">
              {outcomes.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prerequisites */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">
              📋 Prerequisites
            </h3>
            <ul className="space-y-2 text-xs text-gray-700">
              {prereqs.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </main>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3. INTERACTIVE IN-BROWSER CODING LAB MODAL WORKSPACE               */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {activeLesson && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1e293b] border border-gray-700 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white">
            
            {/* Workspace Header */}
            <div className="p-4 bg-[#0f172a] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                  {activeLesson.lessonId}
                </span>
                <h3 className="text-sm font-bold text-white">
                  {activeLesson.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCompleteLesson}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  ✓ Mark Completed (+{activeLesson.points} Pts)
                </button>
                <button
                  onClick={() => setActiveLesson(null)}
                  className="text-gray-400 hover:text-white text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Split Screen: Left (Theory & Task) + Right (Monaco IDE & Compiler) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* Left: Notes & Exercise (5 cols) */}
              <div className="lg:col-span-5 border-r border-gray-800 p-5 overflow-y-auto space-y-4 bg-[#0f172a]/70">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                    Concept &amp; Theory Notes
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {activeLesson.theoryNotes}
                  </p>
                </div>

                <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                    Interactive Task Instructions
                  </span>
                  <p className="text-xs text-gray-200 leading-relaxed font-mono">
                    {activeLesson.taskPrompt}
                  </p>
                </div>
              </div>

              {/* Right: Monaco Editor + Live Execution Runner (7 cols) */}
              <div className="lg:col-span-7 flex flex-col bg-[#1e293b]">
                {/* Editor Bar */}
                <div className="p-2.5 bg-[#0f172a] border-b border-gray-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-gray-400 font-bold">Language: C (GCC 13)</span>
                  <button
                    onClick={handleRunLessonCode}
                    disabled={runningCode}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <span>▶</span>
                    <span>{runningCode ? 'Executing...' : 'Run Code'}</span>
                  </button>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 min-h-[250px] h-[300px]">
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language="c"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>

                {/* Execution Output Console */}
                <div className="border-t border-gray-800 p-3 bg-[#0f172a] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">
                    Execution Output Console
                  </span>
                  <pre className="w-full h-16 bg-[#1e293b] border border-gray-800 rounded-lg p-2 text-xs font-mono text-gray-300 overflow-y-auto whitespace-pre-wrap">
                    {outputConsole || 'Click "Run Code" to compile and test output.'}
                  </pre>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      <CodeChefFooter />
    </div>
  )
}
