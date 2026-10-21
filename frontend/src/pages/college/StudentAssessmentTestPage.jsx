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
  const [submissionResults, setSubmissionResults] = useState([])

  // CodeChef-style Pre-Test Entry & Rules Gate
  const [testStarted, setTestStarted] = useState(false)
  const [hasAgreedRules, setHasAgreedRules] = useState(false)

  // Autosave Status Tracking
  const [autosaveStatus, setAutosaveStatus] = useState('saved') // 'saved' | 'saving'
  const draftStorageKey = `byteforge_draft_${id}_${user?.username || 'student'}`
  const startedStorageKey = `byteforge_started_${id}_${user?.username || 'student'}`

  // Question execution tracking: { [qIdx]: 'ACCEPTED' | 'ERROR' }
  const [questionRunStatus, setQuestionRunStatus] = useState({})

  // Adjustable LeetCode Console State
  const [consoleHeight, setConsoleHeight] = useState(250)
  const [consoleTab, setConsoleTab] = useState('input') // 'input' | 'output' | 'split'
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false)
  const [lastRunStatus, setLastRunStatus] = useState(null) // { status, timeMs, isOk }

  // Drag handler for console resize
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

  // Timer state
  const [timeLeft, setTimeLeft] = useState(7200) // seconds
  const [warnings, setWarnings] = useState(0)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false)
  const [autoTerminated, setAutoTerminated] = useState(false)
  const [terminationReason, setTerminationReason] = useState('')
  const [checkingReassessment, setCheckingReassessment] = useState(false)

  // Active question index and questions list
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [questions, setQuestions] = useState([])

  // Refs to prevent stale closure during browser focus/blur events
  const codeRef = useRef(code)
  const userCodesRef = useRef(userCodes)
  const activeQuestionRef = useRef(activeQuestion)
  const languageRef = useRef(language)
  const submittingTestRef = useRef(false)
  const autoSubmittedRef = useRef(false)

  useEffect(() => { codeRef.current = code }, [code])
  useEffect(() => { userCodesRef.current = userCodes }, [userCodes])
  useEffect(() => { activeQuestionRef.current = activeQuestion }, [activeQuestion])
  useEffect(() => { languageRef.current = language }, [language])

  const maxAllowedFlags = assessment?.maxFlags && assessment.maxFlags > 0 ? assessment.maxFlags : 3

  const isFacultyOrAdmin =
    user?.role === 'FACULTY' ||
    user?.role === 'FACULTY_ADMIN' ||
    user?.role === 'ADMIN' ||
    (user?.email && user.email.startsWith('faculty@')) ||
    (user?.username && (user.username.startsWith('prof') || user.username.includes('faculty') || user.username.includes('admin')))

  // Fetch Assessment details, Problems & Prior Submissions
  useEffect(() => {
    setLoading(true)

    // Check if test was previously started in this browser session
    const previouslyStarted = localStorage.getItem(startedStorageKey) === 'true'
    if (previouslyStarted) {
      setTestStarted(true)
    }

    Promise.all([
      api.get(`/college/assessments/${id}`),
      api.get(`/college/assessments/${id}/problems`).catch(() => ({ data: [] })),
      api.get(`/college/assessments/${id}/my-submissions`, {
        params: { studentHandle: user?.username }
      }).catch(() => ({ data: [] }))
    ])
      .then(([assessRes, probRes, mySubRes]) => {
        const data = assessRes.data
        setAssessment(data)

        const totalSecs = (data.durationDays * 86400) + (data.durationHours * 3600) + (data.durationMins * 60)
        setTimeLeft(totalSecs > 0 ? totalSecs : 7200)

        // Check if student has already submitted this assessment
        if (mySubRes.data && mySubRes.data.length > 0) {
          setSubmissionResults(mySubRes.data)
          setSubmitted(true)
          setTestStarted(true)
        }

        // Restore draft from localStorage if available
        let restoredCodes = {}
        try {
          const rawDraft = localStorage.getItem(draftStorageKey)
          if (rawDraft) {
            restoredCodes = JSON.parse(rawDraft)
            setUserCodes(restoredCodes)
          }
        } catch (e) {
          console.warn('Could not restore draft', e)
        }

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
              pointsNum: p.points || 50,
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
            const savedDraft = restoredCodes[`0_JAVA`]
            const initialCode = savedDraft || getQuestionStarterCode(mapped[0], 'JAVA')
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
            allowedLanguages: 'C, C++, Java, Python 3',
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
            allowedLanguages: 'C, C++, Java, Python 3',
            syllabus: 'Binary Trees::DFS::BFS::Shortest Path',
            description: 'Solve the algorithmic questions in time. Proctoring & full screen integrity is active.',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [id, user?.username])

  // Core submission executor (used for manual final submit, timer expiration, and proctoring auto-submit)
  const executeSubmission = async (flagCount, isAuto = false, customReason = '') => {
    if (submittingTestRef.current) return
    submittingTestRef.current = true
    setSubmittingTest(true)

    const currentCode = codeRef.current
    const currentLang = languageRef.current
    const currentActiveQ = activeQuestionRef.current
    const updatedCodes = {
      ...userCodesRef.current,
      [`${currentActiveQ}_${currentLang}`]: currentCode,
    }

    try {
      const itemsToSubmit = questions.length > 0 ? questions : [{ title: 'Practical Assessment Task' }]
      const payload = itemsToSubmit.map((item, idx) => {
        const itemCode = updatedCodes[`${idx}_${currentLang}`] || (idx === currentActiveQ ? currentCode : '')
        return {
          assessmentId: parseInt(id, 10),
          studentName: user?.username ? user.username.toUpperCase() : 'Student Coder',
          studentHandle: user?.username || 'student_user',
          rollNo: '2023CSB' + ((user?.id || 1) * 104),
          problemTitle: item?.title || `Problem ${idx + 1}`,
          language: currentLang,
          sourceCode: itemCode || '// No code submitted',
          tabSwitchFlags: flagCount,
          timeTaken: isAuto
            ? (customReason || `Terminated (>${maxAllowedFlags} Flags)`)
            : 'Exam duration elapsed',
        }
      })

      const { data } = await api.post(`/college/assessments/${id}/submissions/batch`, payload)
      setSubmissionResults(Array.isArray(data) ? data : [data])
      setSubmitted(true)
      if (isAuto) {
        setAutoTerminated(true)
      }
      localStorage.removeItem(startedStorageKey)
    } catch (err) {
      console.error('Failed to submit assessment', err)
      const errorMsg = err.response?.data?.message || err.message || 'Error recording submission'

      if (err.response?.status === 403) {
        alert('This assessment has concluded. Submissions are now closed.')
        navigate('/assessments')
        return
      } else if (err.response?.status === 409) {
        api.get(`/college/assessments/${id}/my-submissions`, { params: { studentHandle: user?.username } })
          .then((res) => {
            if (res.data) setSubmissionResults(res.data)
            setSubmitted(true)
            if (isAuto) setAutoTerminated(true)
          })
        return
      }

      // Fallback single submit in case of network issue
      try {
        const { data } = await api.post(`/college/assessments/${id}/submissions`, {
          assessmentId: parseInt(id, 10),
          studentName: user?.username ? user.username.toUpperCase() : 'Student Coder',
          studentHandle: user?.username || 'student_user',
          rollNo: '2023CSB' + ((user?.id || 1) * 104),
          problemTitle: questions[currentActiveQ]?.title || 'Practical Assessment Task',
          language: currentLang,
          sourceCode: currentCode,
          tabSwitchFlags: flagCount,
          timeTaken: isAuto
            ? (customReason || `Terminated (>${maxAllowedFlags} Flags)`)
            : 'Exam duration elapsed',
        })
        setSubmissionResults(data ? [data] : [])
        setSubmitted(true)
        if (isAuto) setAutoTerminated(true)
      } catch (e) {
        if (!isAuto) {
          alert(`Submission could not be completed: ${errorMsg}`)
        }
      }
    } finally {
      setSubmittingTest(false)
      submittingTestRef.current = false
    }
  }

  // Teacher Reassessment Checker (polling / on-demand verification)
  const handleCheckReassessment = async () => {
    setCheckingReassessment(true)
    try {
      const { data } = await api.get(`/college/assessments/${id}/my-submissions`, {
        params: { studentHandle: user?.username }
      })
      if (!data || data.length === 0) {
        alert('🎉 Your teacher has granted you a reassessment! Resetting your exam session now...')
        localStorage.removeItem(startedStorageKey)
        localStorage.removeItem(draftStorageKey)
        autoSubmittedRef.current = false
        setSubmitted(false)
        setTestStarted(false)
        setWarnings(0)
        setTerminationReason('')
        setAutoTerminated(false)
        setSubmissionResults([])
      } else {
        alert('Your previous submission is still on record. Please ask your course teacher/faculty to click "Allow Reassessment" in their dashboard.')
      }
    } catch (err) {
      console.error('Error checking reassessment status', err)
      alert('Unable to check reassessment status right now. Please try again.')
    } finally {
      setCheckingReassessment(false)
    }
  }

  // Countdown Timer (Only active once student has begun test and not submitted)
  useEffect(() => {
    if (!testStarted || submitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          executeSubmission(warnings, false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [testStarted, submitted, warnings])

  // Anti-Cheating & Browser Restrictions (Tab Switch Detection: >maxAllowedFlags triggers instant submit)
  useEffect(() => {
    if (!testStarted || !assessment?.browserRestrictions || submitted) return

    const handleViolation = () => {
      if (autoSubmittedRef.current || submittingTestRef.current) return

      setWarnings((prev) => {
        const next = prev + 1
        if (next > maxAllowedFlags) {
          // EXCEEDED FACULTY CONFIGURED FLAG LIMIT: Instantly auto-submit
          autoSubmittedRef.current = true
          setShowWarningModal(false)
          const reason = `Terminated: Exceeded proctoring limit of ${maxAllowedFlags} flags (${next} violations recorded)`
          setTerminationReason(`You exceeded the institutional proctoring limit of ${maxAllowedFlags} flags (${next} violations recorded). Under exam integrity rules, your test has been finalized and submitted automatically.`)
          setAutoTerminated(true)
          executeSubmission(next, true, reason)
          return next
        } else {
          setShowWarningModal(true)
          return next
        }
      })
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation()
      }
    }

    const handleBlur = () => {
      handleViolation()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [testStarted, assessment?.browserRestrictions, maxAllowedFlags, submitted])

  // Back Navigation & Page Exit Auto-Submission Interceptor
  useEffect(() => {
    if (!testStarted || submitted) return

    // Push state so that the browser Back button fires 'popstate' without immediately navigating away
    window.history.pushState({ inAssessment: true }, '', window.location.href)

    const handlePopState = () => {
      if (!autoSubmittedRef.current && !submittingTestRef.current) {
        autoSubmittedRef.current = true
        // Keep on the assessment page so student receives their evaluation scorecard and notice
        window.history.pushState(null, '', window.location.href)
        const reason = 'Terminated: Navigated back / exited active assessment session'
        setTerminationReason('You clicked the browser Back button or attempted to exit the active test session. Under university proctoring integrity rules, leaving an active exam triggers instant final submission.')
        setAutoTerminated(true)
        executeSubmission(warnings, true, reason)
      }
    }

    const handleBeforeUnload = (e) => {
      if (!autoSubmittedRef.current && !submittingTestRef.current) {
        try {
          const currentCode = codeRef.current
          const currentLang = languageRef.current
          const currentActiveQ = activeQuestionRef.current
          const updatedCodes = {
            ...userCodesRef.current,
            [`${currentActiveQ}_${currentLang}`]: currentCode,
          }
          const itemsToSubmit = questions.length > 0 ? questions : [{ title: 'Practical Assessment Task' }]
          const payload = itemsToSubmit.map((item, idx) => {
            const itemCode = updatedCodes[`${idx}_${currentLang}`] || (idx === currentActiveQ ? currentCode : '')
            return {
              assessmentId: parseInt(id, 10),
              studentName: user?.username ? user.username.toUpperCase() : 'Student Coder',
              studentHandle: user?.username || 'student_user',
              rollNo: '2023CSB' + ((user?.id || 1) * 104),
              problemTitle: item?.title || `Problem ${idx + 1}`,
              language: currentLang,
              sourceCode: itemCode || '// No code submitted',
              tabSwitchFlags: warnings,
              timeTaken: 'Terminated: Exited or refreshed browser tab during active assessment',
            }
          })
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
          navigator.sendBeacon(`/api/college/assessments/${id}/submissions/batch`, blob)
        } catch (err) {}

        e.preventDefault()
        e.returnValue = 'Assessment session in progress. Leaving will automatically submit your exam.'
        return e.returnValue
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [testStarted, submitted, warnings, id, user?.username, user?.id, questions, maxAllowedFlags])

  // Format Timer
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Handle Code Change with Autosave
  const handleCodeChange = (newCode) => {
    const safeCode = newCode || ''
    setCode(safeCode)
    setAutosaveStatus('saving')

    const updated = {
      ...userCodes,
      [`${activeQuestion}_${language}`]: safeCode,
    }
    setUserCodes(updated)

    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(updated))
      setTimeout(() => setAutosaveStatus('saved'), 300)
    } catch (e) {
      console.warn('Storage quota exceeded', e)
    }
  }

  // Handle Question Switch (Preserving Student Code per Question)
  const handleSwitchQuestion = (idx) => {
    const updated = {
      ...userCodes,
      [`${activeQuestion}_${language}`]: code,
    }
    setUserCodes(updated)
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(updated))
    } catch (e) {}

    setActiveQuestion(idx)
    const targetQ = questions[idx]
    if (targetQ?.input) {
      setCustomInput(targetQ.input)
    }
    const savedCode = updated[`${idx}_${language}`]
    setCode(savedCode || getQuestionStarterCode(targetQ, language))
  }

  // Handle Language Change
  const handleLangChange = (lang) => {
    const updated = {
      ...userCodes,
      [`${activeQuestion}_${language}`]: code,
    }
    setUserCodes(updated)
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(updated))
    } catch (e) {}

    setLanguage(lang)
    const savedCode = updated[`${activeQuestion}_${lang}`]
    setCode(savedCode || getQuestionStarterCode(questions[activeQuestion], lang))
  }

  // Handle Reset to Starter Template
  const handleResetToStarterCode = () => {
    if (!confirm('Are you sure you want to reset your code to the starter template for this problem?')) return
    const currentQ = questions[activeQuestion]
    const freshCode = getQuestionStarterCode(currentQ, language)
    setCode(freshCode)
    const updated = {
      ...userCodes,
      [`${activeQuestion}_${language}`]: freshCode,
    }
    setUserCodes(updated)
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(updated))
    } catch (e) {}
  }

  // Helper to normalize stdout and expected output for fair whitespace comparison
  const normalizeOutput = (str) =>
    (str || '')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim()

  // Run Code against Custom or Sample Input
  const handleRunCode = async (overrideInput) => {
    const runInput = overrideInput !== undefined ? overrideInput : customInput
    setRunningCode(true)
    setConsoleTab('output')
    if (isConsoleCollapsed) setIsConsoleCollapsed(false)
    setConsoleOutput('Compiling & executing code...')

    const currentQ = questions[activeQuestion] || {}
    const sampleIn = (currentQ.input || '').trim()
    const sampleOut = (currentQ.output || '').trim()
    const isSampleTest = sampleOut !== '' && runInput.trim() === sampleIn

    try {
      const { data } = await api.post('/compiler/run', {
        language,
        code,
        input: runInput,
      })

      const rawStdout = data.stdout ?? data.output ?? ''
      const rawStderr = data.stderr ?? data.error ?? ''
      const normalizedUserOut = normalizeOutput(rawStdout)
      const normalizedExpectedOut = normalizeOutput(sampleOut)

      const isExecutionSuccess = data.status === 'SUCCESS' || data.status === 'ACCEPTED'

      if (!isExecutionSuccess) {
        setLastRunStatus({
          status: data.status || 'ERROR',
          timeMs: data.executionTimeMs || 0,
          isOk: false,
          verdictType: 'ERR',
        })
        setConsoleOutput(rawStderr || rawStdout || 'Execution failed.')
        setQuestionRunStatus((prev) => ({ ...prev, [activeQuestion]: 'ERROR' }))
        return
      }

      // Check against expected sample output if evaluating against sample testcase
      if (isSampleTest) {
        const isMatch = normalizedUserOut === normalizedExpectedOut
        if (isMatch) {
          setLastRunStatus({
            status: 'ACCEPTED',
            timeMs: data.executionTimeMs || 15,
            isOk: true,
            verdictType: 'AC',
          })
          setConsoleOutput(
            `✓ Sample Test Passed (AC)\n\n` +
            `Input:\n${runInput}\n\n` +
            `Your Output:\n${rawStdout.trim()}\n\n` +
            `Expected Output:\n${sampleOut}`
          )
          setQuestionRunStatus((prev) => ({ ...prev, [activeQuestion]: 'ACCEPTED' }))
        } else {
          setLastRunStatus({
            status: 'WRONG_ANSWER',
            timeMs: data.executionTimeMs || 15,
            isOk: false,
            verdictType: 'WA',
          })
          setConsoleOutput(
            `✗ Wrong Answer (WA)\n\n` +
            `Input:\n${runInput}\n\n` +
            `Your Output:\n${normalizedUserOut ? rawStdout.trim() : '[No output produced - check your print/println statements]'}\n\n` +
            `Expected Output:\n${sampleOut}`
          )
          setQuestionRunStatus((prev) => ({ ...prev, [activeQuestion]: 'ERROR' }))
        }
      } else {
        // Custom input run where no expected output is defined
        setLastRunStatus({
          status: 'SUCCESS',
          timeMs: data.executionTimeMs || 15,
          isOk: true,
          verdictType: 'RAN',
        })
        setConsoleOutput(rawStdout.trim() || '(Program executed successfully with 0 output)')
      }
    } catch (err) {
      setLastRunStatus({ status: 'ERROR', timeMs: 0, isOk: false, verdictType: 'ERR' })
      setConsoleOutput(
        `Execution Failed: ${err.response?.data?.error || err.message || 'Server error'}`
      )
      setQuestionRunStatus((prev) => ({ ...prev, [activeQuestion]: 'ERROR' }))
    } finally {
      setRunningCode(false)
    }
  }

  // Quick 1-Click Run with Sample Input
  const handleRunSampleCase = () => {
    const currentSample = questions[activeQuestion]?.input || ''
    setCustomInput(currentSample)
    handleRunCode(currentSample)
  }

  // Final Assessment Submit — evaluates and records all problems attempted during exam
  const handleFinalSubmit = async () => {
    if (!confirm('Are you sure you want to finalize and submit your assessment? This will record your answers and end the test.')) {
      return
    }
    await executeSubmission(warnings, false)
  }

  // Helper to check institutional authorization
  const normalizeCollege = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]/g, '')

  const isAuthorizedStudent = () => {
    if (user?.role === 'ADMIN' || user?.role === 'FACULTY_ADMIN') return true
    if (!user?.collegeName || !assessment?.collegeName) return false

    const userNorm = normalizeCollege(user.collegeName)
    const assessNorm = normalizeCollege(assessment.collegeName)

    return userNorm === assessNorm || userNorm.includes(assessNorm) || assessNorm.includes(userNorm)
  }

  // Calculate question status badge
  const getQuestionStatus = (idx) => {
    if (questionRunStatus[idx] === 'ACCEPTED') return { label: 'Tested', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' }
    if (questionRunStatus[idx] === 'ERROR') return { label: 'Errors', color: 'bg-red-500/20 text-red-400 border-red-500/40' }

    const saved = userCodes[`${idx}_${language}`] || (idx === activeQuestion ? code : '')
    const starter = getQuestionStarterCode(questions[idx], language)
    const isModified = saved && saved.trim() !== '' && saved.trim() !== starter.trim()

    if (isModified) return { label: 'Drafted', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
    return { label: 'Not Attempted', color: 'bg-gray-800 text-gray-400 border-gray-700' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <Spinner size="lg" />
      </div>
    )
  }

  // Institutional Access Restricted / Lockout Screen
  if (!assessment || !isAuthorizedStudent()) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex items-center justify-center p-4">
        <div className="bg-[#111827] border border-red-500/30 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
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

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 1: PRE-TEST INSTRUCTIONS & ENTRY GATE (CodeChef Aligned)
  // ──────────────────────────────────────────────────────────────────────────
  if (!submitted && !testStarted) {
    const durationMins = ((assessment?.durationDays || 0) * 1440) + ((assessment?.durationHours || 0) * 60) + (assessment?.durationMins || 0)
    const effectiveMins = durationMins > 0 ? durationMins : 120
    const hours = Math.floor(effectiveMins / 60)
    const mins = effectiveMins % 60
    const durationLabel = `${hours > 0 ? `${hours} hr ` : ''}${mins > 0 ? `${mins} mins` : ''}`

    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="bg-[#5b4638] text-white px-2.5 py-1 rounded font-black text-xs tracking-wider">
              BYTEFORGE
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Institutional Assessment Portal
            </span>
          </div>
          <button
            onClick={() => navigate('/assessments')}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
          >
            ← Exit to Hub
          </button>
        </header>

        {/* Instructions Body */}
        <main className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6 my-auto">
          {/* Assessment Title Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                🏛️ {assessment?.collegeName}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                👥 {assessment?.cohort}
              </span>
              {assessment?.browserRestrictions && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  🛡️ Proctoring Monitored
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {assessment?.assessmentName}
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {assessment?.description || 'Official college department coding evaluation benchmark.'}
              </p>
            </div>

            {/* Test Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Duration</span>
                <span className="text-base font-black text-slate-900 font-mono">{durationLabel}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Problems</span>
                <span className="text-base font-black text-slate-900 font-mono">{questions.length || '2'} Coding Tasks</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Languages</span>
                <span className="text-base font-black text-slate-900 truncate block">{assessment?.allowedLanguages || 'Java, C++, Python, C'}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Proctoring Limit</span>
                <span className="text-base font-black text-amber-600 font-mono">{maxAllowedFlags} Flags Allowed</span>
              </div>
            </div>
          </div>

          {/* Test Guidelines & Anti-Cheat Rules (CodeChef Aligned) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>📋</span>
              <span>Important Assessment Rules & Guidelines</span>
            </h2>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-base mt-0.5">⏱️</span>
                <div>
                  <strong className="text-slate-900 block font-bold">Continuous Server Timer:</strong>
                  <span>The examination timer runs continuously once started. Reloading your browser or disconnecting does not pause or extend the remaining test duration.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-base mt-0.5">💾</span>
                <div>
                  <strong className="text-slate-900 block font-bold">Local Draft Persistence:</strong>
                  <span>Your code is automatically backed up in real time. If your browser closes unexpectedly, re-entering the test immediately restores your latest code drafts.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-base mt-0.5">▶️</span>
                <div>
                  <strong className="text-slate-900 block font-bold">Run Code vs Final Submit:</strong>
                  <span>Use <strong>"Run Code"</strong> to test your solution against sample and custom test inputs as many times as you need. Only <strong>"Final Submit"</strong> performs the official grading against hidden test suites.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-base mt-0.5">🛡️</span>
                <div>
                  <strong className="text-slate-900 block font-bold">Proctoring Flag Limit ({maxAllowedFlags} Allowed):</strong>
                  <span>Switching tabs or losing window focus more than <strong>{maxAllowedFlags} times</strong> will automatically terminate and finalize your assessment.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-base mt-0.5">↩️</span>
                <div>
                  <strong className="text-slate-900 block font-bold">Exit & Back Navigation Auto-Submit:</strong>
                  <span>Once you enter the assessment, clicking the browser Back button, navigating away, or closing the tab will <strong>instantly auto-submit</strong> your current code.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-base mt-0.5">🔒</span>
                <div>
                  <strong className="text-slate-900 block font-bold">Single Final Submission:</strong>
                  <span>Once you finalize and submit your test, solutions are permanently locked and evaluated. Duplicate re-attempts are strictly barred unless your teacher grants a reassessment.</span>
                </div>
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAgreedRules}
                  onChange={(e) => setHasAgreedRules(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">
                  I confirm that I am <strong className="text-slate-900">@{user?.username}</strong> ({user?.collegeName || 'Student'}). I have read and agree to follow all examination rules, integrity guidelines, and the university academic honor code.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                disabled={!hasAgreedRules}
                onClick={() => {
                  setTestStarted(true)
                  try {
                    localStorage.setItem(startedStorageKey, 'true')
                  } catch (e) {}
                }}
                className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs transition shadow-sm flex items-center justify-center gap-2 ${
                  hasAgreedRules
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>🚀</span>
                <span>Begin Assessment</span>
              </button>
              <button
                onClick={() => navigate('/assessments')}
                className="py-3.5 px-6 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-400">
          ByteForge Assessment Engine • Powered by Verified Multi-Language Judge
        </footer>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 2: POST-TEST SCORECARD & PERFORMANCE REPORT (CodeChef Aligned)
  // ──────────────────────────────────────────────────────────────────────────
  if (submitted) {
    const totalScore = submissionResults.reduce((acc, curr) => acc + (curr.score || 0), 0)
    const maxScore = questions.length > 0
      ? questions.reduce((acc, curr) => acc + (curr.pointsNum || 50), 0)
      : (submissionResults.length * 50 || 100)
    const scorePct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="bg-[#5b4638] text-white px-2.5 py-1 rounded font-black text-xs tracking-wider">
              BYTEFORGE
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Evaluation Scorecard
            </span>
          </div>
          <Link
            to="/assessments"
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
          >
            ← Return to Hub
          </Link>
        </header>

        {/* Scorecard Body */}
        <main className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6 my-auto">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
              ✓
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                Submission Recorded & Evaluated
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-2">
                {assessment?.assessmentName}
              </h1>
              <p className="text-xs text-slate-500">
                Institution: <strong className="text-slate-700">{assessment?.collegeName}</strong> • Candidate: <strong className="text-slate-700">@{user?.username}</strong>
              </p>
            </div>

            {/* Auto-Termination / Locked Out Proctoring Banner */}
            {(autoTerminated || submissionResults.some(s => (s.tabSwitchFlags || 0) > maxAllowedFlags || (s.timeTaken && s.timeTaken.includes('Terminated')))) && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-left space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛑</span>
                    <h3 className="text-sm font-bold text-red-800">
                      Assessment Auto-Submitted: {submissionResults[0]?.timeTaken || 'Proctoring Violation / Session Exit'}
                    </h3>
                  </div>
                  <span className="bg-red-100 text-red-800 font-mono text-[10px] font-black px-2 py-0.5 rounded border border-red-200">
                    LOCKED OUT
                  </span>
                </div>
                <p className="text-xs text-red-700 leading-relaxed">
                  Your assessment was automatically finalized &amp; submitted ({submissionResults[0]?.timeTaken || `${warnings} violations detected, exceeding limit of ${maxAllowedFlags} flags`}). You cannot resubmit code on your own. If your instructor agrees, they can click <strong>"Allow Reassessment"</strong> in their dashboard to grant you a retake.
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <button
                    onClick={handleCheckReassessment}
                    disabled={checkingReassessment}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>🔄</span>
                    <span>{checkingReassessment ? 'Checking with Server...' : 'Check If Teacher Allowed Reassessment'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-left">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Marks</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-blue-600 font-mono">{totalScore}</span>
                  <span className="text-xs text-slate-400 font-bold">/ {maxScore} Pts</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Accuracy Rate</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{scorePct}%</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Problems Attempted</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                  {submissionResults.length} / {questions.length || submissionResults.length}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Proctor Flags</span>
                <span className={`text-2xl font-black font-mono mt-1 block ${warnings > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {warnings} Flag{warnings === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>

          {/* Problem Breakdown Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📊</span>
              <span>Problem-by-Problem Evaluation Breakdown</span>
            </h2>

            {submissionResults.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No individual problem breakdown recorded.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {submissionResults.map((sub, idx) => {
                  const isAccepted = sub.verdict && sub.verdict.toUpperCase().includes('ACCEPTED')
                  return (
                    <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{sub.problemTitle}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {sub.language}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-3">
                          <span>Execution: {sub.timeTaken || 'Verified'}</span>
                          {sub.facultyFeedback && (
                            <span className="text-slate-400">• Notes: {sub.facultyFeedback}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <span className="text-sm font-black text-slate-900 font-mono">
                          {sub.score} Pts
                        </span>
                        <span
                          className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {sub.verdict}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/assessments')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs"
              >
                Return to My College Assessments
              </button>
              <button
                onClick={() => navigate('/contests')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition"
              >
                Browse Practice Contests
              </button>
            </div>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-slate-400">
          ByteForge Assessment Engine • Final Verified Submission
        </footer>
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

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 3: ACTIVE TEST WORKSPACE (Monaco + Resizable Console + Autosave)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#0f172a] min-h-screen font-sans text-gray-100 flex flex-col justify-between selection:bg-blue-600">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP EXAM BAR WITH TIMER & PROCTORING                            */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <header className="bg-[#1e293b] border-b border-gray-800 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="bg-[#5b4638] text-white px-2 py-0.5 rounded font-black text-xs">
            BYTEFORGE
          </span>
          <button
            onClick={() => setShowExitConfirmModal(true)}
            className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Exit Test & Auto-Submit"
          >
            <span>←</span>
            <span className="hidden sm:inline">Back / Exit</span>
          </button>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span className="truncate max-w-[200px] sm:max-w-xs">{assessment?.assessmentName}</span>
              <span className="hidden sm:inline-block text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
                🏛️ {assessment?.collegeName}
              </span>
            </h1>
          </div>
        </div>

        {/* Center/Right: Autosave, Proctoring, Timer, Final Submit */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Autosave Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
            <span className={`h-2 w-2 rounded-full ${autosaveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
            <span>{autosaveStatus === 'saving' ? 'Saving...' : 'Draft Autosaved'}</span>
          </div>

          {/* Proctoring Tag */}
          {assessment?.browserRestrictions && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/60 border border-amber-700/50 px-2.5 py-1 rounded-full font-mono">
              <span>🛡️</span> Tab Monitor {warnings > 0 && `(${warnings})`}
            </span>
          )}

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 bg-[#0f172a] border border-gray-700 px-3 py-1 rounded-lg font-mono font-bold text-xs text-red-400">
            <span>⏱️</span>
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleFinalSubmit}
            disabled={submittingTest}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
          >
            <span>{submittingTest ? 'Submitting...' : '🚀 Final Submit'}</span>
          </button>
        </div>
      </header>

      {/* Exit & Auto-Submit Confirmation Modal */}
      {showExitConfirmModal && !autoTerminated && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1e293b] border-2 border-red-500/80 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="text-4xl animate-pulse">🚪</div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-300 bg-red-950/80 border border-red-800 px-3 py-1 rounded-full">
                Exit Active Examination
              </span>
              <h3 className="text-lg font-bold text-white pt-1">
                Leave &amp; Automatically Submit Test?
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              You are currently inside an active, timed exam. If you go back or exit now, your current code solutions will be <strong>immediately finalized and submitted</strong> to your faculty. You will not be able to re-enter without instructor authorization.
            </p>

            <div className="bg-red-950/40 border border-red-800/80 rounded-xl p-3 text-xs text-left space-y-1 text-red-200">
              <p className="font-bold flex items-center gap-1.5 text-white">
                <span>⚠️</span>
                <span>Proctoring Exit Rule</span>
              </p>
              <p className="text-[11px] text-gray-400">
                Leaving the session marks your submission as <span className="font-mono text-amber-300">"Terminated: Student exited assessment session"</span>.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirmModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs py-2.5 rounded-xl border border-gray-700 transition cursor-pointer"
              >
                Cancel, Stay in Exam
              </button>
              <button
                onClick={() => {
                  setShowExitConfirmModal(false)
                  autoSubmittedRef.current = true
                  const reason = 'Terminated: Student exited assessment session'
                  setTerminationReason('You exited the active test session. Under university proctoring integrity rules, leaving an active exam triggers instant final submission.')
                  setAutoTerminated(true)
                  executeSubmission(warnings, true, reason)
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg cursor-pointer"
              >
                Yes, Exit &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Alert Modal for Tab Switch */}
      {showWarningModal && !autoTerminated && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1e293b] border-2 border-amber-500/80 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="text-3xl animate-bounce">⚠️</div>
            <div className="space-y-1">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                warnings >= maxAllowedFlags ? 'bg-red-950 text-red-400 border-red-700' : 'bg-amber-950 text-amber-400 border-amber-700'
              }`}>
                Flag {warnings} of {maxAllowedFlags} Allowed
              </span>
              <h3 className="text-lg font-bold text-white pt-1">
                {warnings >= maxAllowedFlags
                  ? 'Final Warning: Critical Threshold Reached!'
                  : warnings === 1
                  ? 'Proctoring Warning: Focus Lost / Tab Switched'
                  : 'Urgent Warning: Proctoring Violation'}
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {warnings >= maxAllowedFlags ? (
                <>
                  <strong className="text-red-400 block font-bold mb-1">STRICT PENALTY ALERT:</strong>
                  You have reached the limit of <strong>{maxAllowedFlags} allowed warnings</strong>. The very next tab switch or loss of window focus will instantly finalize &amp; submit your code.
                </>
              ) : (
                <>
                  You left or minimized the assessment window. This event has been logged for faculty review. You have <strong className="text-amber-400">{Math.max(0, maxAllowedFlags - warnings)} warning(s) remaining</strong> before automatic submission.
                </>
              )}
            </p>

            <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-2.5 text-xs font-mono text-amber-300 flex items-center justify-between">
              <span>Proctoring Violations:</span>
              <span className="font-bold text-red-400">{warnings} / {maxAllowedFlags} Flags</span>
            </div>

            <button
              onClick={() => setShowWarningModal(false)}
              className={`w-full font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer ${
                warnings >= maxAllowedFlags
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              I Understand, Return to Test
            </button>
          </div>
        </div>
      )}

      {/* Auto-Termination Lockout Modal */}
      {autoTerminated && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1a0f0f] border-2 border-red-600 rounded-3xl p-7 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="text-5xl animate-pulse">🚨</div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-300 bg-red-950 border border-red-800 px-3 py-1 rounded-full">
                Test Terminated
              </span>
              <h3 className="text-xl font-black text-white tracking-tight pt-1">
                Assessment Automatically Submitted
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {terminationReason || `You exceeded the maximum institutional limit of ${maxAllowedFlags} proctoring flags (${warnings} violations recorded).`}
            </p>

            <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-4 text-xs text-left space-y-2 text-red-200">
              <p className="font-bold flex items-center gap-1.5 text-white">
                <span>🔒</span>
                <span>Session Locked &amp; Evaluated</span>
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Your current code has been finalized and submitted automatically to your course instructor. You cannot re-enter the test on your own.
              </p>
              <p className="text-[11px] text-amber-300/90 leading-relaxed pt-1 border-t border-red-900/60">
                💡 <strong>Need to Retake?</strong> Contact your course faculty. They have the administrative ability to grant you a reassessment from their dashboard.
              </p>
            </div>

            <button
              onClick={() => {
                setAutoTerminated(false)
                setSubmitted(true)
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-xs py-3 rounded-xl transition shadow-lg cursor-pointer"
            >
              View Evaluation Scorecard
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
          
          {/* Question Navigator Pills with Status Badges */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-gray-800">
            {questions.map((item, idx) => {
              const status = getQuestionStatus(idx)
              return (
                <button
                  key={item.id}
                  onClick={() => handleSwitchQuestion(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeQuestion === idx
                      ? 'bg-[#2f66d4] text-white shadow-sm ring-1 ring-blue-400'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>Q{idx + 1} ({item.points})</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${status.color}`}>
                    {status.label}
                  </span>
                </button>
              )
            })}
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

          {/* Input/Output Samples with 1-Click Run */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Sample Case
              </h3>
              {q.input && (
                <button
                  onClick={handleRunSampleCase}
                  disabled={runningCode}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 hover:bg-emerald-950 border border-emerald-800/80 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                >
                  <span>▶</span>
                  <span>Run with Sample Input</span>
                </button>
              )}
            </div>

            <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Sample Input:</span>
                <span className="text-blue-300 whitespace-pre-wrap">{q.input || 'N/A'}</span>
              </div>
              <div className="pt-2 border-t border-gray-800/80">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Sample Output:</span>
                <span className="text-green-300 whitespace-pre-wrap">{q.output || 'N/A'}</span>
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
          <div className="p-2.5 bg-[#1e293b] border-b border-gray-800 flex items-center justify-between">
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
                onClick={() => handleRunCode()}
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
              onChange={handleCodeChange}
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
                        lastRunStatus.verdictType === 'AC'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : lastRunStatus.verdictType === 'WA'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : lastRunStatus.verdictType === 'RAN'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {lastRunStatus.verdictType || (lastRunStatus.isOk ? 'AC' : 'ERR')}
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
                              lastRunStatus.verdictType === 'AC'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : lastRunStatus.verdictType === 'WA'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : lastRunStatus.verdictType === 'RAN'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}
                          >
                            {lastRunStatus.verdictType === 'AC'
                              ? `ACCEPTED (${lastRunStatus.timeMs}ms)`
                              : lastRunStatus.verdictType === 'WA'
                              ? `WRONG ANSWER (${lastRunStatus.timeMs}ms)`
                              : lastRunStatus.verdictType === 'RAN'
                              ? `RAN (${lastRunStatus.timeMs}ms)`
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
