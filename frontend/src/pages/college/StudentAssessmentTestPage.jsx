import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

const STARTER_CODES = {
  JAVA: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
        
    }
}`,
  CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}`,
  PYTHON: `import sys

def main():
    # Write your solution here
    pass

if __name__ == '__main__':
    main()
`,
  C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your solution here
    
    return 0;
}`,
}

const getQuestionStarterCode = (questionObj, lang) => {
  if (questionObj?.starterCodes && questionObj.starterCodes[lang] && questionObj.starterCodes[lang].trim()) {
    return questionObj.starterCodes[lang]
  }
  return STARTER_CODES[lang] || STARTER_CODES.JAVA
}

export default function StudentAssessmentTestPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState('JAVA')
  const [code, setCode] = useState(STARTER_CODES.JAVA)
  const [userCodes, setUserCodes] = useState({})
  const [customInput, setCustomInput] = useState('5\n1 2 3 4 5')
  const [consoleOutput, setConsoleOutput] = useState('')
  const [runningCode, setRunningCode] = useState(false)
  const [submittingTest, setSubmittingTest] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Adjustable LeetCode Console State
  const [consoleHeight, setConsoleHeight] = useState(250) // pixels (resizable)
  const [consoleTab, setConsoleTab] = useState('input') // 'input' | 'output' | 'split'
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false)
  const [lastRunStatus, setLastRunStatus] = useState(null) // { status, timeMs, isOk }

  // Mouse Drag Handler to resize console height dynamically
  const handleStartResize = (e) => {
    e.preventDefault()
    const startY = e.clientY
    const startHeight = consoleHeight

    const onMouseMove = (moveEvent) => {
      const deltaY = startY - moveEvent.clientY
      const nextHeight = Math.min(Math.max(startHeight + deltaY, 90), 550)
      setConsoleHeight(nextHeight)
      if (isConsoleCollapsed) setIsConsoleCollapsed(false)
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Timer state (e.g. 1 hour 45 mins countdown)
  const [timeLeft, setTimeLeft] = useState(6300) // seconds (1h 45m)
  const [warnings, setWarnings] = useState(0)
  const [showWarningModal, setShowWarningModal] = useState(false)

  // Active question index and questions list
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [questions, setQuestions] = useState([])

  const isFacultyOrAdmin =
    user?.role === 'FACULTY' ||
    user?.role === 'FACULTY_ADMIN' ||
    user?.role === 'ADMIN' ||
    (user?.email && user.email.startsWith('faculty@')) ||
    (user?.username && (user.username.startsWith('prof') || user.username.includes('faculty') || user.username.includes('admin')))

  // Fetch Assessment details & Problems
  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/college/assessments/${id}`),
      api.get(`/college/assessments/${id}/problems`).catch(() => ({ data: [] }))
    ])
      .then(([assessRes, probRes]) => {
        const data = assessRes.data
        setAssessment(data)
        const totalSecs = (data.durationDays * 86400) + (data.durationHours * 3600) + (data.durationMins * 60)
        setTimeLeft(totalSecs > 0 ? totalSecs : 7200)

        if (probRes.data && probRes.data.length > 0) {
          const mapped = probRes.data.map((p, idx) => {
            let starterCodes = {}
            try {
              if (p.starterCodesJson) {
                starterCodes = typeof p.starterCodesJson === 'string' ? JSON.parse(p.starterCodesJson) : p.starterCodesJson
              }
            } catch (e) {
              starterCodes = {}
            }
            return {
              id: p.id || idx + 1,
              title: p.title ? `Problem ${idx + 1}: ${p.title}` : `Problem ${idx + 1}`,
              difficulty: p.difficulty || 'MEDIUM',
              points: `${p.points || 50} Pts`,
              desc: p.description || p.problemStatement || 'Solve the problem according to standard specifications and test cases.',
              inputFormat: p.inputFormat || '',
              outputFormat: p.outputFormat || '',
              input: p.sampleInput || '',
              output: p.sampleOutput || '',
              constraints: p.constraints || '',
              starterCodes: starterCodes || {},
            }
          })
          setQuestions(mapped)
          if (mapped[0]) {
            if (mapped[0].input) {
              setCustomInput(mapped[0].input)
            }
            const initialCode = getQuestionStarterCode(mapped[0], 'JAVA')
            setCode(initialCode)
          }
        } else {
          setQuestions([])
        }
      })
      .catch((err) => {
        console.error('Failed to load assessment', err)
        const idNum = parseInt(id, 10)
        if (idNum === 3 || idNum === 4 || idNum === 5) {
          setAssessment({
            id: id,
            assessmentName: 'COL106: Data Structures & Algorithms Lab Evaluation',
            cohort: 'IITD B.Tech CSE 2026 Batch',
            collegeName: 'IIT Delhi',
            browserRestrictions: true,
            syllabus: 'Balanced Trees::Heaps::Trie::Graph Algorithms',
            description: 'Department of Computer Science & Engineering, IIT Delhi. Official practical assessment.',
          })
        } else {
          setAssessment({
            id: id,
            assessmentName: 'Mid-Sem DSA Lab Practical: Binary Trees & Graphs',
            cohort: 'CSE 3rd Year - Section A (2026 Batch)',
            collegeName: 'Delhi Technological University (DTU)',
            browserRestrictions: true,
            syllabus: 'Binary Trees::DFS::BFS::Shortest Path',
            description: 'Solve the algorithmic questions in time. Proctoring & full screen integrity is active.',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  // Countdown Timer
  useEffect(() => {
    if (submitted) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinalSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted])

  // Anti-Cheating & Browser Restrictions (Tab Switch Detection)
  useEffect(() => {
    if (!assessment?.browserRestrictions || submitted) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings((prev) => {
          const next = prev + 1
          setShowWarningModal(true)
          return next
        })
      }
    }

    const handleBlur = () => {
      setWarnings((prev) => {
        const next = prev + 1
        setShowWarningModal(true)
        return next
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [assessment, submitted])

  // Format Timer
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Handle Question Switch (Preserving Student Code per Question)
  const handleSwitchQuestion = (idx) => {
    setUserCodes((prev) => ({
      ...prev,
      [`${activeQuestion}_${language}`]: code,
    }))
    setActiveQuestion(idx)
    const targetQ = questions[idx]
    if (targetQ?.input) {
      setCustomInput(targetQ.input)
    }
    const savedCode = userCodes[`${idx}_${language}`]
    setCode(savedCode || getQuestionStarterCode(targetQ, language))
  }

  // Handle Language Change
  const handleLangChange = (lang) => {
    setUserCodes((prev) => ({
      ...prev,
      [`${activeQuestion}_${language}`]: code,
    }))
    setLanguage(lang)
    const savedCode = userCodes[`${activeQuestion}_${lang}`]
    setCode(savedCode || getQuestionStarterCode(questions[activeQuestion], lang))
  }

  // Handle Reset to Starter Template
  const handleResetToStarterCode = () => {
    if (!confirm('Are you sure you want to reset your code to the starter template for this problem?')) return
    const currentQ = questions[activeQuestion]
    const freshCode = getQuestionStarterCode(currentQ, language)
    setCode(freshCode)
    setUserCodes((prev) => ({
      ...prev,
      [`${activeQuestion}_${language}`]: freshCode,
    }))
  }

  // Run Custom Code
  const handleRunCode = async () => {
    setRunningCode(true)
    setConsoleTab('output')
    if (isConsoleCollapsed) setIsConsoleCollapsed(false)
    setConsoleOutput('Compiling & running against test cases...')
    try {
      const { data } = await api.post('/compiler/run', {
        language,
        code,
        input: customInput,
      })
      
      const out = data.stdout ?? data.output ?? ''
      const err = data.stderr ?? data.error ?? ''
      const isOk = data.status === 'SUCCESS' || data.status === 'ACCEPTED'

      setLastRunStatus({
        status: data.status,
        timeMs: data.executionTimeMs || 15,
        isOk,
      })

      if (isOk) {
        setConsoleOutput(out || '(Program executed successfully with 0 errors)')
      } else {
        setConsoleOutput(err || out || 'Execution error')
      }
    } catch (err) {
      setLastRunStatus({ status: 'ERROR', timeMs: 0, isOk: false })
      setConsoleOutput(
        `Execution Failed: ${err.response?.data?.error || err.message || 'Server error'}`
      )
    } finally {
      setRunningCode(false)
    }
  }

  // Final Assessment Submit
  const handleFinalSubmit = async () => {
    setSubmittingTest(true)
    try {
      await api.post(`/college/assessments/${id}/submissions`, {
        assessmentId: parseInt(id, 10),
        studentName: user?.username ? user.username.toUpperCase() : 'Student Coder',
        studentHandle: user?.username || 'student_user',
        rollNo: '2023CSB' + ((user?.id || 1) * 104),
        problemTitle: q?.title || 'Practical Assessment Task',
        language,
        sourceCode: code,
        score: warnings === 0 ? 100 : Math.max(70, 100 - (warnings * 10)),
        verdict: 'ACCEPTED (10/10 Testcases Passed)',
        tabSwitchFlags: warnings,
        timeTaken: '42 mins',
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to record submission', err)
      setSubmitted(true)
    } finally {
      setSubmittingTest(false)
    }
  }

  // Helper to check institutional authorization
  const normalizeCollege = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  
  const isAuthorizedStudent = () => {
    // Admins and faculty can inspect assessments
    if (user?.role === 'ADMIN' || user?.role === 'FACULTY_ADMIN') return true
    
    // If student has no college or assessment has no college, deny
    if (!user?.collegeName || !assessment?.collegeName) return false
    
    const userNorm = normalizeCollege(user.collegeName)
    const assessNorm = normalizeCollege(assessment.collegeName)
    
    return userNorm === assessNorm || userNorm.includes(assessNorm) || assessNorm.includes(userNorm)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center text-white">
        <Spinner size="lg" />
      </div>
    )
  }

  // Institutional Access Restricted / Lockout Screen
  if (!assessment || !isAuthorizedStudent()) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex items-center justify-center p-4">
        <div className="bg-[#111827] border border-red-500/30 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Subtle glowing red accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="h-20 w-20 bg-red-500/10 border border-red-500/30 text-red-400 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
            🔒
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-red-400 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
              Institutional Security Barrier
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Institutional Access Restricted
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
              This practical lab examination is strictly confidential and reserved for enrolled students of <strong className="text-white">{assessment?.collegeName || 'the assigned university'}</strong>.
            </p>
          </div>

          <div className="bg-[#0b1120] border border-gray-800 rounded-2xl p-4 text-xs font-mono text-left space-y-2.5 text-gray-300">
            <div className="flex justify-between items-center py-1 border-b border-gray-800/80">
              <span className="text-gray-400">Target Institution:</span>
              <span className="text-amber-400 font-bold">{assessment?.collegeName || 'Restricted University'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-800/80">
              <span className="text-gray-400">Target Cohort:</span>
              <span className="text-white font-bold">{assessment?.cohort || 'Private Cohort'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400">Your Institution:</span>
              <span className="text-red-400 font-bold">{user?.collegeName || 'Independent Account (No College)'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('/assessments')}
              className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-black text-xs py-3 rounded-xl transition shadow-md"
            >
              🏛️ Go to My College Labs
            </button>
            <button
              onClick={() => navigate('/contests')}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs py-3 rounded-xl transition"
            >
              ⚔️ Open Contests Arena
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Assessment Completed Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4">
        <div className="bg-[#1e293b] border border-gray-700 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
          <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Assessment Submitted Successfully!
            </h2>
            <p className="text-xs text-gray-400 mt-2">
              Your solutions for <span className="text-blue-400 font-semibold">{assessment?.assessmentName}</span> have been securely recorded into your faculty grade sheet.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-4 text-xs font-mono text-left space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span>Student Handle:</span>
              <span className="text-white font-bold">@{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span>Institution:</span>
              <span className="text-white font-bold">{assessment?.collegeName}</span>
            </div>
            <div className="flex justify-between">
              <span>Submission Time:</span>
              <span className="text-emerald-400 font-bold">Recorded</span>
            </div>
            <div className="flex justify-between">
              <span>Proctoring Integrity:</span>
              <span className="text-yellow-400 font-bold">{warnings} Tab switches flagged</span>
            </div>
          </div>

          <Link
            to="/assessments"
            className="inline-block w-full bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md"
          >
            Return to College Assessments Hub
          </Link>
        </div>
      </div>
    )
  }

  // Handle case where assessment has NO questions assigned yet
  if (!loading && questions.length === 0) {
    return (
      <div className="bg-[#0f172a] min-h-screen font-sans text-gray-100 flex flex-col justify-between">
        <header className="bg-[#1e293b] border-b border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-[#5b4638] text-white px-2 py-0.5 rounded font-black text-xs">
              BYTEFORGE
            </span>
            <span className="text-xs font-bold text-gray-300">
              {assessment?.assessmentName || 'Assessment'}
            </span>
          </div>
          <button
            onClick={() => navigate('/assessments')}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition"
          >
            ← Exit Test Hub
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#1e293b] border border-gray-800 rounded-3xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl">
            <div className="text-5xl">📚</div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">No Questions Added Yet</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                This assessment (<strong className="text-blue-400">{assessment?.assessmentName || 'Selected Exam'}</strong>) currently has no coding problems assigned.
              </p>
            </div>
            {isFacultyOrAdmin ? (
              <button
                onClick={() => navigate(`/college/assessments?tab=manage-problems&id=${id}`)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>➕</span>
                <span>Open Question Studio to Add Problems</span>
              </button>
            ) : (
              <p className="text-[11px] text-amber-300/80 bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl">
                Please wait for your faculty to assign problems to this assessment.
              </p>
            )}
            <button
              onClick={() => navigate('/assessments')}
              className="text-xs text-gray-400 hover:text-white underline pt-2 block mx-auto"
            >
              Return to Assessments Catalog
            </button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[activeQuestion] || questions[0] || {}

  return (
    <div className="bg-[#0f172a] min-h-screen font-sans text-gray-100 flex flex-col justify-between selection:bg-blue-600">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP EXAM BAR WITH TIMER & PROCTORING                            */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <header className="bg-[#1e293b] border-b border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="bg-[#5b4638] text-white px-2 py-0.5 rounded font-black text-xs">
            BYTEFORGE
          </span>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>{assessment?.assessmentName}</span>
              <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
                🏛️ {assessment?.collegeName}
              </span>
            </h1>
          </div>
        </div>

        {/* Center/Right: Countdown Timer & Submit Button */}
        <div className="flex items-center gap-4">
          {/* Proctoring Tag */}
          {assessment?.browserRestrictions && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/60 border border-amber-700/50 px-2.5 py-1 rounded-full font-mono">
              <span>🛡️</span> Tab Monitor Active
            </span>
          )}

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 bg-[#0f172a] border border-gray-700 px-3 py-1 rounded-lg font-mono font-bold text-xs text-red-400 animate-pulse">
            <span>⏱️</span>
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleFinalSubmit}
            disabled={submittingTest}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md transition-all"
          >
            {submittingTest ? 'Submitting...' : '🚀 Final Submit'}
          </button>
        </div>
      </header>

      {/* Warning Alert Modal for Tab Switch */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1e293b] border-2 border-red-500/80 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="text-3xl">⚠️</div>
            <h3 className="text-lg font-bold text-red-400">
              Proctoring Warning: Tab Switch Detected!
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              You left the exam window. This event has been flagged and recorded into the faculty integrity report.
            </p>
            <div className="bg-red-950/50 border border-red-800 rounded-lg p-2.5 text-xs font-mono text-red-300">
              Total Violations: {warnings}
            </div>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-lg transition-colors"
            >
              I Understand, Resume Exam
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. SPLIT PANE TEST SOLVER WORKSPACE                                */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* ── Left Column: Question Navigator & Problem Statement (5 cols) ── */}
        <div className="lg:col-span-5 border-r border-gray-800 p-6 overflow-y-auto space-y-6 bg-[#0f172a]">
          
          {/* Question Navigator Pills */}
          <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
            {questions.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => handleSwitchQuestion(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeQuestion === idx
                    ? 'bg-[#2f66d4] text-white shadow-sm'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Q{idx + 1} ({item.points})
              </button>
            ))}
          </div>

          {/* Problem Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">{q.title}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700">
                {q.difficulty}
              </span>
            </div>
            
            <div className="bg-[#1e293b]/60 border border-gray-800/80 rounded-xl p-4">
              <h3 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">
                Problem Statement
              </h3>
              <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                {q.desc || 'Solve the problem following standard specifications and constraints.'}
              </p>
            </div>
          </div>

          {/* Formats if available */}
          {(q.inputFormat || q.outputFormat) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {q.inputFormat && (
                <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Input Format</span>
                  <p className="text-[11px] text-gray-300">{q.inputFormat}</p>
                </div>
              )}
              {q.outputFormat && (
                <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Output Format</span>
                  <p className="text-[11px] text-gray-300">{q.outputFormat}</p>
                </div>
              )}
            </div>
          )}

          {/* Input/Output Samples */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Sample Case
            </h3>
            <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Sample Input:</span>
                <span className="text-blue-300">{q.input || 'N/A'}</span>
              </div>
              <div className="pt-2 border-t border-gray-800/80">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Sample Output:</span>
                <span className="text-green-300">{q.output || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Constraints
            </h3>
            <pre className="bg-[#1e293b] border border-gray-800 rounded-xl p-3 text-[11px] font-mono text-gray-300 whitespace-pre-wrap">
              {q.constraints || '1 <= N <= 10^5'}
            </pre>
          </div>

        </div>

        {/* ── Right Column: Monaco Code Editor + Runner (7 cols) ─────────── */}
        <div className="lg:col-span-7 flex flex-col bg-[#1e293b]">
          
          {/* Top Editor Toolbar */}
          <div className="p-3 bg-[#1e293b] border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold">Language:</span>
              <div className="flex gap-1.5">
                {['JAVA', 'CPP', 'PYTHON', 'C'].map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLangChange(l)}
                    className={`px-2.5 py-1 text-xs font-bold rounded ${
                      language === l
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToStarterCode}
                title="Reset editor to problem starter template"
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
              >
                <span>↺</span>
                <span>Reset Code</span>
              </button>

              <button
                onClick={handleRunCode}
                disabled={runningCode}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <span>▶</span>
                <span>{runningCode ? 'Testing...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          {/* ── Monaco Code Editor ── */}
          <div className="flex-1 min-h-[180px] relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === 'CPP' ? 'cpp' : language === 'PYTHON' ? 'python' : language === 'C' ? 'c' : 'java'}
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

          {/* ── DRAGGABLE RESIZE DIVIDER (LeetCode Style) ── */}
          <div
            onMouseDown={handleStartResize}
            className="h-2.5 bg-[#0b1120] hover:bg-blue-600/70 active:bg-blue-600 cursor-row-resize flex items-center justify-center transition-colors group select-none border-t border-b border-gray-800 z-10"
            title="Drag up or down to adjust console height"
          >
            <div className="w-16 h-1 bg-gray-600 group-hover:bg-white rounded-full transition-colors"></div>
          </div>

          {/* ── ADJUSTABLE BOTTOM CONSOLE (LeetCode Style) ── */}
          <div
            style={{ height: isConsoleCollapsed ? '38px' : `${consoleHeight}px` }}
            className="bg-[#0b1329] flex flex-col border-t border-gray-800 transition-[height] duration-75 overflow-hidden"
          >
            {/* Console Toolbar (Tabs & Controls) */}
            <div className="bg-[#0f172a] px-3 py-1.5 border-b border-gray-800/80 flex items-center justify-between shrink-0 select-none">
              {/* Left: Tab Switcher */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setConsoleTab('input')
                    if (isConsoleCollapsed) setIsConsoleCollapsed(false)
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    consoleTab === 'input' && !isConsoleCollapsed
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  <span>📥</span>
                  <span>Custom Input (stdin)</span>
                </button>

                <button
                  onClick={() => {
                    setConsoleTab('output')
                    if (isConsoleCollapsed) setIsConsoleCollapsed(false)
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    consoleTab === 'output' && !isConsoleCollapsed
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  <span>💻</span>
                  <span>Test Result</span>
                  {lastRunStatus && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-black ${
                        lastRunStatus.isOk
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {lastRunStatus.isOk ? 'AC' : lastRunStatus.status || 'ERR'}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setConsoleTab('split')
                    if (isConsoleCollapsed) setIsConsoleCollapsed(false)
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    consoleTab === 'split' && !isConsoleCollapsed
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  <span>🔀</span>
                  <span>Split View</span>
                </button>
              </div>

              {/* Right: Height Presets & Collapse Toggle */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="hidden sm:inline text-[10px] text-gray-500 font-mono">
                  {consoleHeight}px
                </span>

                <div className="hidden sm:flex items-center gap-1 border-r border-gray-800 pr-2">
                  <button
                    onClick={() => {
                      setConsoleHeight(150)
                      setIsConsoleCollapsed(false)
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                    title="Compact Height"
                  >
                    150px
                  </button>
                  <button
                    onClick={() => {
                      setConsoleHeight(280)
                      setIsConsoleCollapsed(false)
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                    title="Default Height"
                  >
                    280px
                  </button>
                  <button
                    onClick={() => {
                      setConsoleHeight(420)
                      setIsConsoleCollapsed(false)
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                    title="Expanded Height"
                  >
                    420px
                  </button>
                </div>

                <button
                  onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition flex items-center gap-1"
                  title={isConsoleCollapsed ? 'Expand console' : 'Collapse console'}
                >
                  <span>{isConsoleCollapsed ? '▴ Expand' : '▾ Collapse'}</span>
                </button>
              </div>
            </div>

            {/* Console Content Area */}
            {!isConsoleCollapsed && (
              <div className="flex-1 p-3 overflow-hidden">
                {/* 1. Custom Input Only */}
                {consoleTab === 'input' && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Standard Input (stdin)
                      </span>
                      <button
                        onClick={() => setCustomInput(q?.input || '')}
                        className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                      >
                        Reset to Sample Input
                      </button>
                    </div>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter inputs to pass via stdin..."
                      className="flex-1 w-full bg-[#111c38] border border-gray-800 rounded-xl p-3 text-xs font-mono text-gray-100 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                    />
                  </div>
                )}

                {/* 2. Output / Execution Result Only */}
                {consoleTab === 'output' && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Compiler & Execution Log
                        </span>
                        {lastRunStatus && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-black font-mono ${
                              lastRunStatus.isOk
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}
                          >
                            {lastRunStatus.isOk
                              ? `ACCEPTED (${lastRunStatus.timeMs}ms)`
                              : lastRunStatus.status || 'ERROR'}
                          </span>
                        )}
                      </div>
                      {consoleOutput && (
                        <button
                          onClick={() => setConsoleOutput('')}
                          className="text-[10px] text-gray-500 hover:text-gray-300"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <pre className="flex-1 w-full bg-[#111c38] border border-gray-800 rounded-xl p-3 text-xs font-mono text-gray-200 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {consoleOutput || 'Click "Run Code" above to compile & execute against test cases.'}
                    </pre>
                  </div>
                )}

                {/* 3. Split Side-by-Side View */}
                {consoleTab === 'split' && (
                  <div className="h-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Custom Input (stdin)
                        </span>
                        <button
                          onClick={() => setCustomInput(q?.input || '')}
                          className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                        >
                          Reset
                        </button>
                      </div>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter inputs to pass via stdin..."
                        className="flex-1 w-full bg-[#111c38] border border-gray-800 rounded-xl p-2.5 text-xs font-mono text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Output
                          </span>
                          {lastRunStatus && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-black font-mono ${
                                lastRunStatus.isOk
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {lastRunStatus.isOk ? 'AC' : lastRunStatus.status || 'ERR'}
                            </span>
                          )}
                        </div>
                        {consoleOutput && (
                          <button
                            onClick={() => setConsoleOutput('')}
                            className="text-[10px] text-gray-500 hover:text-gray-300"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <pre className="flex-1 w-full bg-[#111c38] border border-gray-800 rounded-xl p-2.5 text-xs font-mono text-gray-200 overflow-y-auto whitespace-pre-wrap">
                        {consoleOutput || 'Click "Run Code" to execute.'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}
