import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { useAuth } from '../context/AuthContext'
import VerdictBadge from '../components/VerdictBadge'
import Spinner from '../components/Spinner'
import api from '../api/axios'
import { getStarterCode } from '../data/problemTemplates'

const LANGUAGES = [
  { value: 'JAVA',   label: 'Java 21',   monaco: 'java' },
  { value: 'CPP',    label: 'C++ (g++)', monaco: 'cpp' },
  { value: 'PYTHON', label: 'Python 3',  monaco: 'python' },
]

export default function ProblemDetailPage() {
  const { slug }              = useParams()
  const { isAuthenticated }   = useAuth()
  const navigate              = useNavigate()

  // Problem state
  const [problem, setProblem] = useState(null)
  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Editor state
  const [language, setLanguage] = useState('JAVA')
  const [code, setCode]         = useState('')

  // Testcase & Runner state
  const [activeTab, setActiveTab] = useState(0) // index 0, 1 for samples, -1 for custom
  const [customInput, setCustomInput] = useState('')
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState(null)

  // Official Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState(null)
  const pollRef = useRef(null)

  // ── Load problem + sample test cases ─────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    setNotFound(false)

    const fetchProblem = async () => {
      try {
        let prob = null
        try {
          const res = await api.get(`/problems/slug/${slug}`)
          prob = res.data
        } catch {
          const res = await api.get(`/problems/${slug}`)
          prob = res.data
        }

        setProblem(prob)
        setCode(getStarterCode(prob.slug, language))

        try {
          const { data: samps } = await api.get(`/problems/${prob.id}/testcases/samples`)
          setSamples(samps || [])
          if (samps && samps.length > 0) {
            setCustomInput(samps[0].inputData)
          }
        } catch {
          setSamples([])
        }
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchProblem()
  }, [slug])

  // ── Poll official submission verdict while PENDING ───────────────────────
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)

    if (submission?.verdict === 'PENDING') {
      pollRef.current = setInterval(async () => {
        try {
          const { data } = await api.get(`/submissions/${submission.id}`)
          setSubmission(data)
          if (data.verdict !== 'PENDING') clearInterval(pollRef.current)
        } catch {
          clearInterval(pollRef.current)
        }
      }, 2000)
    }

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [submission?.id, submission?.verdict])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(getStarterCode(problem?.slug, lang))
  }

  const handleResetCode = () => {
    if (window.confirm('Reset editor to the default blank starter template?')) {
      setCode(getStarterCode(problem?.slug, language))
    }
  }

  // ── Run Code (Compile & Auto Validate without recording submission) ───────
  const handleRunCode = async () => {
    setRunning(true)
    setRunResult(null)

    const currentInput = activeTab === -1 
      ? customInput 
      : (samples[activeTab]?.inputData || '')
    
    const expectedOutput = activeTab === -1
      ? null
      : (samples[activeTab]?.expectedOutput || null)

    try {
      const { data } = await api.post('/compiler/run', {
        code,
        language,
        input: currentInput,
      })

      // Automatic Validation Check
      const actualOut = (data.stdout || '').trim()
      const expectedOut = (expectedOutput || '').trim()
      const isSuccess = data.status === 'SUCCESS'
      const isMatch = expectedOut ? actualOut === expectedOut : true

      setRunResult({
        ...data,
        isMatch: isSuccess && isMatch,
        expectedOutput: expectedOut,
        actualOutput: actualOut,
        testCaseIndex: activeTab,
      })
    } catch (err) {
      setRunResult({
        status: 'COMPILATION_ERROR',
        stderr: err.response?.data?.error || 'Execution failed.',
        stdout: '',
        executionTimeMs: 0,
        isMatch: false,
      })
    } finally {
      setRunning(false)
    }
  }

  // ── Submit Official Solution ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setSubmitting(true)
    setSubmission(null)
    try {
      const { data } = await api.post('/submissions', {
        problemId: problem.id,
        code,
        language,
      })
      setSubmission(data)
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading)   return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (notFound)  return <div className="text-center py-20 text-gray-500">Problem not found.</div>
  if (!problem)  return null

  const selectedLang = LANGUAGES.find(l => l.value === language)

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/problems')}
            className="text-xs font-semibold text-gray-500 hover:text-blue-600 flex items-center gap-1"
          >
            ← Back to Problems
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-xl font-bold text-gray-900">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-4">
          <span>⏱ Time Limit: <strong>{problem.timeLimitMs}ms</strong></span>
          <span>💾 Memory: <strong>{problem.memoryLimitMb}MB</strong></span>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Left Column: Problem Description & Testcases (5 Cols) ─────── */}
        <div className="lg:col-span-5 space-y-6 bg-white p-5 rounded-xl border border-gray-200 shadow-xs max-h-[85vh] overflow-y-auto">
          
          <Section title="Problem Statement">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {problem.description}
            </p>
          </Section>

          {problem.inputFormat && (
            <Section title="Input Format">
              <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-2.5 rounded border border-gray-100">
                {problem.inputFormat}
              </p>
            </Section>
          )}

          {problem.outputFormat && (
            <Section title="Output Format">
              <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-2.5 rounded border border-gray-100">
                {problem.outputFormat}
              </p>
            </Section>
          )}

          {problem.constraints && (
            <Section title="Constraints">
              <pre className="text-xs text-gray-700 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed">
                {problem.constraints}
              </pre>
            </Section>
          )}

          {samples.length > 0 && (
            <Section title="Sample Test Cases">
              <div className="space-y-4">
                {samples.map((tc, i) => (
                  <div key={tc.id || i} className="border border-gray-100 rounded-lg p-3 bg-gray-50/60">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">
                      Sample Case {i + 1}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <IOBlock label="Input" content={tc.inputData} />
                      <IOBlock label="Expected Output" content={tc.expectedOutput} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── Right Column: Monaco Code Editor + Runner (7 Cols) ─────────── */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Editor Header: Language Switcher & Tools */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 mr-1">Language:</span>
              {LANGUAGES.map(l => (
                <button
                  key={l.value}
                  onClick={() => handleLanguageChange(l.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    language === l.value
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleResetCode}
              title="Reset code to blank template"
              className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-gray-100"
            >
              ↺ Reset Template
            </button>
          </div>

          {/* Monaco Code Editor */}
          <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-[#1e1e1e]">
            <div className="bg-[#2d2d2d] px-4 py-1.5 flex items-center justify-between text-xs text-gray-400 font-mono border-b border-neutral-700">
              <span>Solution.{language === 'JAVA' ? 'java' : language === 'CPP' ? 'cpp' : 'py'}</span>
              <span>Monaco Editor</span>
            </div>
            <Editor
              height="480px"
              language={selectedLang?.monaco}
              value={code}
              onChange={val => setCode(val ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 13.5,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 4,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Interactive Testcase & Validation Console (LeetCode Style) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Testcases:</span>
                {samples.map((tc, idx) => (
                  <button
                    key={tc.id || idx}
                    onClick={() => { setActiveTab(idx); setRunResult(null) }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeTab === idx
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Case {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => { setActiveTab(-1); setRunResult(null) }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeTab === -1
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Custom Input
                </button>
              </div>

              {runResult && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  runResult.status !== 'SUCCESS'
                    ? 'bg-red-100 text-red-700'
                    : runResult.isMatch
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                }`}>
                  {runResult.status !== 'SUCCESS' 
                    ? runResult.status 
                    : runResult.isMatch 
                      ? '🟢 Passed' 
                      : '🔴 Wrong Answer'}
                </span>
              )}
            </div>

            {/* Testcase Input Viewer / Editor */}
            {activeTab !== -1 ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-gray-500 mb-1 block">Input:</span>
                  <pre className="bg-gray-900 text-gray-200 p-2.5 rounded-md font-mono overflow-auto max-h-24">
                    {samples[activeTab]?.inputData}
                  </pre>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 mb-1 block">Expected Output:</span>
                  <pre className="bg-gray-900 text-green-400 p-2.5 rounded-md font-mono overflow-auto max-h-24">
                    {samples[activeTab]?.expectedOutput}
                  </pre>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold text-gray-500 mb-1 block">Enter Custom Input (stdin):</span>
                <textarea
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900 text-white font-mono text-xs p-2.5 rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Paste custom stdin here..."
                />
              </div>
            )}

            {/* Run Code Output Box */}
            {runResult && (
              <div className="pt-2 border-t border-gray-100 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-gray-500">
                  <span className="font-bold">Execution Output:</span>
                  <span>⏱ {runResult.executionTimeMs}ms</span>
                </div>

                {runResult.stderr ? (
                  <pre className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 overflow-x-auto whitespace-pre-wrap max-h-36">
                    {runResult.stderr}
                  </pre>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500 font-semibold mb-1 block">Your Output:</span>
                      <pre className={`p-2.5 rounded-md border overflow-auto max-h-24 ${
                        runResult.isMatch 
                          ? 'bg-green-50 text-green-800 border-green-200' 
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {runResult.actualOutput || '(No output)'}
                      </pre>
                    </div>
                    {runResult.expectedOutput && (
                      <div>
                        <span className="text-gray-500 font-semibold mb-1 block">Expected:</span>
                        <pre className="p-2.5 rounded-md bg-gray-50 text-gray-800 border border-gray-200 overflow-auto max-h-24">
                          {runResult.expectedOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Control Bar: Run Code & Submit Solution */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunCode}
              disabled={running || submitting}
              className="flex-1 bg-gray-800 hover:bg-gray-900 active:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {running ? <Spinner size="sm" /> : '▶'}
              <span>{running ? 'Compiling & Running...' : 'Run Code'}</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={running || submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? <Spinner size="sm" /> : '🚀'}
              <span>
                {submitting
                  ? 'Judging All Cases...'
                  : isAuthenticated
                    ? 'Submit Solution'
                    : '🔒 Login to Submit'}
              </span>
            </button>
          </div>

          {/* Official Submission Verdict Card */}
          {submission && (
            <div className="bg-white border-2 border-blue-200 rounded-xl p-4 shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">Official Submission Result</span>
                <VerdictBadge verdict={submission.verdict} />
              </div>

              {submission.verdict === 'PENDING' && (
                <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                  <Spinner size="sm" />
                  <span>Evaluating against hidden test cases...</span>
                </div>
              )}

              {submission.executionTimeMs != null && submission.executionTimeMs > 0 && (
                <p className="text-xs text-gray-500">⏱ Runtime: {submission.executionTimeMs}ms</p>
              )}

              {submission.errorMessage && (
                <pre className="text-xs text-red-600 bg-red-50 p-3 rounded-lg overflow-auto max-h-36 font-mono border border-red-200">
                  {submission.errorMessage}
                </pre>
              )}

              <a
                href={`/submissions/${submission.id}`}
                className="inline-block text-xs font-bold text-blue-600 hover:underline"
              >
                View Full Submission Details & Logs →
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Helper Components ──────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pb-1 border-b border-gray-100">
        {title}
      </h3>
      {children}
    </div>
  )
}

function IOBlock({ label, content }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-500 mb-1">{label}</p>
      <pre className="bg-gray-900 text-green-400 text-xs p-2.5 rounded font-mono overflow-auto min-h-[48px]">
        {content}
      </pre>
    </div>
  )
}

function DifficultyBadge({ difficulty }) {
  const styles = {
    EASY:   'text-green-700 bg-green-50 border-green-200',
    MEDIUM: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    HARD:   'text-red-700 bg-red-50 border-red-200',
  }
  return (
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${styles[difficulty] || styles.EASY}`}>
      {difficulty}
    </span>
  )
}
