import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { useAuth } from '../../context/AuthContext'
import BrandLogo from '../../components/BrandLogo'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

const ALL_LANGS = ['C', 'C#', 'C++', 'Go', 'Java', 'Oracledb', 'Pyth 3', 'Sql']

const DEFAULT_STARTER_TEMPLATES = {
  JAVA: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution below
        
    }
}`,
  CPP: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Write your solution below
    
    return 0;
}`,
  PYTHON: `import sys

def main():
    # Write your solution below
    pass

if __name__ == '__main__':
    main()
`,
  C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your solution below
    
    return 0;
}`,
}

export default function CollegeAssessmentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Tab from URL query or default to 'create-assessment'
  const currentSubTab = searchParams.get('tab') || 'create-assessment'

  const [assessments, setAssessments] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [notification, setNotification] = useState('')

  // Modal & Code Inspection State
  const [showModal, setShowModal] = useState(false)
  const [inspectAssessment, setInspectAssessment] = useState(null)
  const [studentSubmissions, setStudentSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [submissionsCountMap, setSubmissionsCountMap] = useState({})

  // Plagiarism Detection Engine State
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false)
  const [plagiarismReport, setPlagiarismReport] = useState(null)
  const [selectedMatchPair, setSelectedMatchPair] = useState(null)
  const [scanningPlagiarism, setScanningPlagiarism] = useState(false)

  // ── Question Studio & Problem Authoring State ─────────────────────────────
  const [selectedAssessmentForQuestions, setSelectedAssessmentForQuestions] = useState(null)
  const [assessmentQuestions, setAssessmentQuestions] = useState([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [showAddProblemModal, setShowAddProblemModal] = useState(false)
  const [savingProblem, setSavingProblem] = useState(false)

  // Problem Form Fields
  const [problemTitle, setProblemTitle] = useState('')
  const [problemDifficulty, setProblemDifficulty] = useState('MEDIUM')
  const [problemPoints, setProblemPoints] = useState(50)
  const [problemDesc, setProblemDesc] = useState('')
  const [problemConstraints, setProblemConstraints] = useState('1 <= N <= 10^5\\n-100 <= Node.val <= 100')
  const [problemInputFormat, setProblemInputFormat] = useState('First line contains array/input representing nodes/elements.')
  const [problemOutputFormat, setProblemOutputFormat] = useState('Print the resulting processed output.')
  const [problemSampleInput, setProblemSampleInput] = useState('[4, 2, 7, 1, 3, 6, 9]')
  const [problemSampleOutput, setProblemSampleOutput] = useState('[4, 7, 2, 9, 6, 3, 1]')
  const [hiddenTestCases, setHiddenTestCases] = useState([
    { input: '[1, 2, 3]', output: '[1, 3, 2]' },
    { input: '[]', output: '[]' }
  ])
  const [starterLangTab, setStarterLangTab] = useState('JAVA')
  const [customStarterCodes, setCustomStarterCodes] = useState({ ...DEFAULT_STARTER_TEMPLATES })

  // ── Student Evaluations & Grade Sheet State ─────────────────────────────
  const [selectedAssessmentForSubmissions, setSelectedAssessmentForSubmissions] = useState(null)
  const [evaluationSubmissions, setEvaluationSubmissions] = useState([])
  const [loadingEvaluations, setLoadingEvaluations] = useState(false)
  const [evalSearchQuery, setEvalSearchQuery] = useState('')
  const [inspectingSub, setInspectingSub] = useState(null)
  const [editScore, setEditScore] = useState(100)
  const [editFeedback, setEditFeedback] = useState('')
  const [savingGrade, setSavingGrade] = useState(false)

  // Form State matching CodeChef screenshots
  const [cohort, setCohort] = useState('Faculty Review - Learn C')
  const [assessmentName, setAssessmentName] = useState('')
  const [startTime, setStartTime] = useState('2026-09-05 10:00:00')
  const [durationDays, setDurationDays] = useState(0)
  const [durationHours, setDurationHours] = useState(1)
  const [durationMins, setDurationMins] = useState(30)
  const [syllabus, setSyllabus] = useState('Loops::Functions::Arrays')
  const [description, setDescription] = useState('')
  const [browserRestrictions, setBrowserRestrictions] = useState(true)
  const [enableReview, setEnableReview] = useState(false)
  const [hideStudentReport, setHideStudentReport] = useState(false)

  // Language selections
  const [selectedLangs, setSelectedLangs] = useState({
    'C': true,
    'C#': true,
    'C++': true,
    'Go': true,
    'Java': true,
    'Oracledb': false,
    'Pyth 3': true,
    'Sql': false,
  })

  const [submitting, setSubmitting] = useState(false)

  // Toggle all languages
  const handleSelectAll = (e) => {
    const checked = e.target.checked
    const next = {}
    ALL_LANGS.forEach((l) => {
      next[l] = checked
    })
    setSelectedLangs(next)
  }

  // Load existing assessments
  const fetchAssessments = async () => {
    setLoadingList(true)
    try {
      const { data } = await api.get('/college/assessments')
      setAssessments(data)
    } catch (err) {
      console.error('Failed to load assessments', err)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    fetchAssessments()
  }, [])

  // Helper to load assessment and its problems for Question Studio
  const loadAssessmentForStudio = async (assessmentId, fallbackAssessment = null) => {
    if (!assessmentId) return
    setLoadingQuestions(true)
    try {
      let targetAssess = fallbackAssessment
      if (!targetAssess) {
        try {
          const { data } = await api.get(`/college/assessments/${assessmentId}`)
          targetAssess = data
        } catch (e) {
          // If single fetch fails, look in list
          targetAssess = assessments.find((a) => String(a.id) === String(assessmentId))
        }
      }
      if (targetAssess) {
        setSelectedAssessmentForQuestions(targetAssess)
      }
      const { data: qData } = await api.get(`/college/assessments/${assessmentId}/problems`)
      setAssessmentQuestions(Array.isArray(qData) ? qData : [])
    } catch (err) {
      console.error('Failed to load assessment questions:', err)
      setAssessmentQuestions([])
    } finally {
      setLoadingQuestions(false)
    }
  }

  // Helper to load submissions for student evaluations tab
  const loadSubmissionsForAssessment = async (assessmentId, fallbackAssess = null) => {
    if (!assessmentId) return
    setLoadingEvaluations(true)
    try {
      let targetAssess = fallbackAssess
      if (!targetAssess) {
        try {
          const { data } = await api.get(`/college/assessments/${assessmentId}`)
          targetAssess = data
        } catch (e) {
          targetAssess = assessments.find((a) => String(a.id) === String(assessmentId))
        }
      }
      if (targetAssess) {
        setSelectedAssessmentForSubmissions(targetAssess)
      }
      const { data: subData } = await api.get(`/college/assessments/${assessmentId}/submissions`)
      setEvaluationSubmissions(Array.isArray(subData) ? subData : [])
    } catch (err) {
      console.error('Failed to load assessment submissions:', err)
      setEvaluationSubmissions([])
    } finally {
      setLoadingEvaluations(false)
    }
  }

  const handleOpenStudentEvaluations = (assessment) => {
    if (!assessment) return
    setSelectedAssessmentForSubmissions(assessment)
    setSearchParams({ tab: 'student-evaluations', id: assessment.id })
    loadSubmissionsForAssessment(assessment.id, assessment)
  }

  const handleSaveStudentGrade = async () => {
    if (!inspectingSub || !selectedAssessmentForSubmissions) return
    setSavingGrade(true)
    try {
      const { data } = await api.patch(
        `/college/assessments/${selectedAssessmentForSubmissions.id}/submissions/${inspectingSub.id}/grade`,
        {
          score: parseInt(editScore, 10) || 0,
          facultyFeedback: editFeedback,
        }
      )
      setEvaluationSubmissions((prev) =>
        prev.map((s) => (s.id === inspectingSub.id ? { ...s, score: data.score, facultyFeedback: data.facultyFeedback } : s))
      )
      setInspectingSub((prev) => (prev ? { ...prev, score: data.score, facultyFeedback: data.facultyFeedback } : null))
      setNotification(`✅ Grade updated for ${inspectingSub.studentName}!`)
      setTimeout(() => setNotification(''), 3500)
    } catch (err) {
      alert('Failed to update student score.')
    } finally {
      setSavingGrade(false)
    }
  }

  // Auto-load assessment if tab is in URL
  const activeTabParam = searchParams.get('tab') || 'create-assessment'
  const activeIdParam = searchParams.get('id')

  useEffect(() => {
    if (activeTabParam === 'manage-problems') {
      if (activeIdParam) {
        if (!selectedAssessmentForQuestions || String(selectedAssessmentForQuestions.id) !== String(activeIdParam)) {
          const found = assessments.find((a) => String(a.id) === String(activeIdParam))
          loadAssessmentForStudio(activeIdParam, found)
        }
      } else if (assessments.length > 0 && !selectedAssessmentForQuestions) {
        handleOpenQuestionStudio(assessments[0])
      }
    } else if (activeTabParam === 'student-evaluations') {
      if (activeIdParam) {
        if (!selectedAssessmentForSubmissions || String(selectedAssessmentForSubmissions.id) !== String(activeIdParam)) {
          const found = assessments.find((a) => String(a.id) === String(activeIdParam))
          loadSubmissionsForAssessment(activeIdParam, found)
        }
      } else if (assessments.length > 0 && !selectedAssessmentForSubmissions) {
        handleOpenStudentEvaluations(assessments[0])
      }
    }
  }, [activeTabParam, activeIdParam, assessments.length])

  // Inspect Submissions & Code for an Assessment
  const handleInspectSubmissions = async (assessment) => {
    setInspectAssessment(assessment)
    setShowModal(true)
    try {
      const { data } = await api.get(`/college/assessments/${assessment.id}/submissions`)
      if (data && data.length > 0) {
        setStudentSubmissions(data)
        setSelectedSubmission(data[0])
      } else {
        // Sample demo submissions so the code viewer is immediately interactive
        const fallbackSubs = [
          {
            id: 101,
            assessmentId: assessment.id,
            studentName: 'Priya Sharma',
            studentHandle: 'priya_sharma',
            rollNo: '2023CSB1042',
            problemTitle: 'Problem 1: Invert a Binary Tree',
            language: 'JAVA',
            score: 100,
            verdict: 'ACCEPTED (10/10 Passed)',
            tabSwitchFlags: 0,
            timeTaken: '38 mins',
            sourceCode: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int x) { val = x; }
}

public class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }

    public static void main(String[] args) {
        System.out.println("Binary Tree Inversion Test Passed (10/10 Testcases)");
    }
}`,
          },
          {
            id: 102,
            assessmentId: assessment.id,
            studentName: 'Rohit Coder',
            studentHandle: 'rohit_coder',
            rollNo: '2023CSB1018',
            problemTitle: 'Problem 2: Maximum Subarray Sum (Kadane)',
            language: 'CPP',
            score: 90,
            verdict: 'ACCEPTED (9/10 Passed)',
            tabSwitchFlags: 1,
            timeTaken: '44 mins',
            sourceCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxSubArray(vector<int>& nums) {
    int maxSoFar = nums[0];
    int currMax = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        currMax = max(nums[i], currMax + nums[i]);
        maxSoFar = max(maxSoFar, currMax);
    }
    return maxSoFar;
}

int main() {
    vector<int> nums = {-2,1,-3,4,-1,2,1,-5,4};
    cout << "Maximum Subarray Sum: " << maxSubArray(nums) << endl;
    return 0;
}`,
          },
        ]
        setStudentSubmissions(fallbackSubs)
        setSelectedSubmission(fallbackSubs[0])
      }
    } catch (err) {
      console.error('Failed to load submissions', err)
    }
  }

  // Export CSV Handler
  const handleExportCSV = (assessment) => {
    const subs = studentSubmissions.length > 0 ? studentSubmissions : []
    const headers = 'Roll No,Student Name,Handle,Problem,Language,Score,Verdict,Tab Switches,Time Taken\n'
    const rows = subs
      .map(
        (s) =>
          `"${s.rollNo}","${s.studentName}","@${s.studentHandle}","${s.problemTitle}","${s.language}",${s.score},"${s.verdict}",${s.tabSwitchFlags},"${s.timeTaken}"`
      )
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assessment.assessmentName.replaceAll(' ', '_')}_GradeSheet.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // ── Plagiarism Engine Handlers ──────────────────────────────────────────
  const handleRunPlagiarism = async (assessment) => {
    setInspectAssessment(assessment)
    setScanningPlagiarism(true)
    setShowPlagiarismModal(true)
    try {
      const { data } = await api.get(`/college/assessments/${assessment.id}/plagiarism`)
      setPlagiarismReport(data)
      if (data.matches && data.matches.length > 0) {
        setSelectedMatchPair(data.matches[0])
      }
    } catch (err) {
      console.error('Failed to run plagiarism audit', err)
    } finally {
      setScanningPlagiarism(false)
    }
  }

  const handlePenalizePair = (pair) => {
    alert(`🚨 Academic Penalty Applied (-50% score deduction) for ${pair.studentNameA} and ${pair.studentNameB}. Flagged in Dean of Academics record.`)
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
          `"${plagiarismReport.assessmentName}","${m.studentNameA}","${m.rollNoA}","${m.studentNameB}","${m.rollNoB}","${m.problemTitle}","${m.language}",${m.similarityPercentage},"${m.riskLevel}","${m.status}","${m.matchedStructurePattern}"`
      )
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${plagiarismReport.assessmentName.replaceAll(' ', '_')}_Plagiarism_Audit_Report.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // ── Question Studio Handlers ─────────────────────────────────────────────
  const handleOpenQuestionStudio = (assessment) => {
    if (!assessment) return
    setSelectedAssessmentForQuestions(assessment)
    setSearchParams({ tab: 'manage-problems', id: assessment.id })
    loadAssessmentForStudio(assessment.id, assessment)
  }

  const handleSaveProblem = async (e) => {
    e?.preventDefault()
    if (!problemTitle.trim() || !problemDesc.trim()) {
      alert('Please fill in Problem Title and Problem Description.')
      return
    }

    if (!selectedAssessmentForQuestions) {
      alert('No assessment selected.')
      return
    }

    setSavingProblem(true)
    try {
      const validHiddenCases = hiddenTestCases.filter((tc) => tc.input?.trim() || tc.output?.trim())
      await api.post(`/college/assessments/${selectedAssessmentForQuestions.id}/problems`, {
        title: problemTitle,
        difficulty: problemDifficulty,
        points: parseInt(problemPoints, 10) || 50,
        description: problemDesc,
        constraints: problemConstraints,
        inputFormat: problemInputFormat,
        outputFormat: problemOutputFormat,
        sampleInput: problemSampleInput,
        sampleOutput: problemSampleOutput,
        hiddenTestCasesJson: JSON.stringify(validHiddenCases),
        starterCodesJson: JSON.stringify(customStarterCodes),
        orderIndex: assessmentQuestions.length + 1,
      })

      setNotification(`✅ Problem "${problemTitle}" added to ${selectedAssessmentForQuestions.assessmentName}!`)
      // Refresh questions list
      const { data } = await api.get(`/college/assessments/${selectedAssessmentForQuestions.id}/problems`)
      setAssessmentQuestions(Array.isArray(data) ? data : [])

      // Reset form
      setProblemTitle('')
      setProblemDesc('')
      setProblemConstraints('1 <= N <= 10^5\n-100 <= Node.val <= 100')
      setProblemSampleInput('')
      setProblemSampleOutput('')
      setHiddenTestCases([{ input: '', output: '' }])
      setCustomStarterCodes({ ...DEFAULT_STARTER_TEMPLATES })
      setShowAddProblemModal(false)
      setTimeout(() => setNotification(''), 4000)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add problem to assessment.')
    } finally {
      setSavingProblem(false)
    }
  }

  const handleDeleteProblem = async (problemId, title) => {
    if (!confirm(`Are you sure you want to delete problem "${title}" from this assessment?`)) return
    try {
      await api.delete(`/college/assessments/${selectedAssessmentForQuestions.id}/problems/${problemId}`)
      setAssessmentQuestions((prev) => prev.filter((p) => p.id !== problemId))
      setNotification(`🗑️ Problem "${title}" removed from assessment.`)
      setTimeout(() => setNotification(''), 3000)
    } catch (err) {
      alert('Failed to delete problem.')
    }
  }

  // Helper to add extra hidden testcase row
  const handleAddHiddenTestCaseRow = () => {
    setHiddenTestCases((prev) => [...prev, { input: '', output: '' }])
  }

  const handleStarterCodeChange = (lang, val) => {
    setCustomStarterCodes((prev) => ({ ...prev, [lang]: val }))
  }

  const handleResetStarterCode = (lang) => {
    setCustomStarterCodes((prev) => ({
      ...prev,
      [lang]: DEFAULT_STARTER_TEMPLATES[lang] || ''
    }))
  }

  const handleHiddenTestCaseChange = (index, field, value) => {
    setHiddenTestCases((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleRemoveHiddenTestCaseRow = (index) => {
    setHiddenTestCases((prev) => prev.filter((_, i) => i !== index))
  }

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!assessmentName.trim()) {
      alert('Please provide an Assessment Name.')
      return
    }

    setSubmitting(true)
    const allowed = Object.keys(selectedLangs)
      .filter((k) => selectedLangs[k])
      .join(',')

    const dDays = Number.isNaN(parseInt(durationDays, 10)) ? 0 : parseInt(durationDays, 10)
    const dHours = Number.isNaN(parseInt(durationHours, 10)) ? 1 : parseInt(durationHours, 10)
    const dMins = Number.isNaN(parseInt(durationMins, 10)) ? 30 : parseInt(durationMins, 10)

    try {
      const { data: newAssessment } = await api.post('/college/assessments', {
        cohort,
        assessmentName,
        startTime: startTime || '2026-09-05 10:00:00',
        durationDays: dDays,
        durationHours: dHours,
        durationMins: dMins,
        syllabus,
        description,
        browserRestrictions,
        enableReview,
        hideStudentReport,
        allowedLanguages: allowed,
        collegeName: user?.collegeName || 'Delhi Technological University',
      })

      setNotification(`🎉 Assessment "${assessmentName}" created successfully! Now add problems & testcases below.`)
      await fetchAssessments()
      // Reset form
      setAssessmentName('')
      // Immediately open Question Studio for this newly created assessment
      handleOpenQuestionStudio(newAssessment)
      setTimeout(() => setNotification(''), 6000)
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.response?.data && typeof err.response.data === 'object'
          ? Object.values(err.response.data).join(', ')
          : null) ||
        'Failed to create assessment.'
      alert(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const facultyDisplayName = user?.username ? `Hello, ${user.username}` : 'Hello, Govind Singh Panwar'

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP NAVBAR (Screenshot 1)                                       */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200/90 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <BrandLogo />
          <span className="text-xs font-semibold text-gray-700 hidden sm:inline">
            {facultyDisplayName}
          </span>
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-gray-600">
            <span className="hover:text-blue-600 cursor-pointer">Courses ▾</span>
            <Link to="/problems" className="hover:text-blue-600">Practice</Link>
            <Link to="/leaderboard" className="hover:text-blue-600">Compete</Link>
            <Link to="/compiler" className="hover:text-blue-600">Compiler</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 font-bold px-3 py-1.5 rounded-lg shadow-2xs">
            <span>⭐</span>
            <span>Upgrade To Pro</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-[#5b4638] text-white flex items-center justify-center text-xs font-bold">
            👨‍🍳
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. COLLEGE DASHBOARD DARK BANNER (Screenshot 1)                    */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="bg-[#242b3b] text-white px-4 sm:px-8 py-5 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight">
              College Dashboard - <span className="font-extrabold text-white">ByteForge College Offering</span>
            </h1>
            <p className="text-xs text-gray-300 mt-0.5">
              ByteForge has collaborated with your college for an integrated learning program
            </p>
          </div>

          <div>
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-gray-200 hover:text-white underline"
            >
              View Your ByteForge Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3. HORIZONTAL COLLEGE TABS (Screenshot 1)                          */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-xs font-bold text-gray-500 overflow-x-auto">
          <Link to="/university/dashboard" className="py-3.5 hover:text-gray-900 whitespace-nowrap">
            Dashboard
          </Link>
          <span className="py-3.5 hover:text-gray-900 cursor-pointer whitespace-nowrap">
            Overview
          </span>
          <span className="py-3.5 hover:text-gray-900 cursor-pointer whitespace-nowrap">
            Courses
          </span>
          <span className="py-3.5 hover:text-gray-900 cursor-pointer whitespace-nowrap">
            Reports
          </span>
          <Link to="/university/dashboard" className="py-3.5 hover:text-gray-900 whitespace-nowrap">
            Students
          </Link>
          <Link to="/problems" className="py-3.5 hover:text-gray-900 whitespace-nowrap">
            Problems
          </Link>
          <span className="py-3.5 text-[#2f66d4] border-b-2 border-[#2f66d4] font-black whitespace-nowrap">
            Assessments
          </span>
        </div>
      </nav>

      {/* Notification Banner */}
      {notification && (
        <div className="bg-emerald-600 text-white text-xs font-bold text-center py-2.5 px-4 shadow-md">
          {notification}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 4. MAIN ASSESSMENT WORKSPACE (SIDEBAR + CREATE FORM) (Screenshots)  */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* ── Left Sidebar Navigation (3 cols) ────────────────────────── */}
          <div className="md:col-span-3">
            <div className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-xs">
              
              {/* Bullseye Icon Header (Screenshot 1) */}
              <div className="bg-[#f0f4ff] p-5 text-center border-b border-gray-100 flex flex-col items-center">
                <div className="h-12 w-12 rounded-xl bg-[#e0ecff] border border-blue-200 flex items-center justify-center text-xl text-blue-600 mb-2 shadow-2xs">
                  🎯
                </div>
                <span className="text-xs font-bold text-gray-700">
                  Assessments Dashboard
                </span>
              </div>

              {/* Sub-links */}
              <div className="p-2 space-y-1 text-xs font-bold">
                <button
                  onClick={() => setSearchParams({ tab: 'create-assessment' })}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                    currentSubTab === 'create-assessment'
                      ? 'bg-blue-50 text-[#2f66d4] font-black'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Create Assessment
                </button>

                <button
                  onClick={() => setSearchParams({ tab: 'my-assessments' })}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                    currentSubTab === 'my-assessments'
                      ? 'bg-blue-50 text-[#2f66d4] font-black'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>My Assessments</span>
                  <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {assessments.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (assessments.length > 0) {
                      handleOpenQuestionStudio(selectedAssessmentForQuestions || assessments[0])
                    } else {
                      setSearchParams({ tab: 'manage-problems' })
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                    currentSubTab === 'manage-problems'
                      ? 'bg-blue-50 text-[#2f66d4] font-black'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>📝</span>
                    <span>Question Studio</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                    Problems
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (assessments.length > 0) {
                      handleOpenStudentEvaluations(selectedAssessmentForSubmissions || assessments[0])
                    } else {
                      setSearchParams({ tab: 'student-evaluations' })
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                    currentSubTab === 'student-evaluations'
                      ? 'bg-blue-50 text-[#2f66d4] font-black'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>📊</span>
                    <span>Student Grades & Code</span>
                  </span>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                    Evaluations
                  </span>
                </button>
              </div>

            </div>
          </div>

          {/* ── Right Content Area (9 cols) ─────────────────────────────── */}
          <div className="md:col-span-9">
            
            {/* SUB-VIEW 1: CREATE NEW ASSESSMENT FORM (Screenshots 1, 2, 3) */}
            {currentSubTab === 'create-assessment' && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
                
                <h2 className="text-base sm:text-lg font-bold text-gray-900 pb-4 border-b border-gray-100">
                  Create New Assessment
                </h2>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6 text-left">
                  
                  {/* 1. Cohort */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Cohort:
                    </label>
                    <select
                      value={cohort}
                      onChange={(e) => setCohort(e.target.value)}
                      className="w-full max-w-md px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                    >
                      <option value="Faculty Review - Learn C">Faculty Review - Learn C</option>
                      <option value="CSE 3rd Year - Section A (2026 Batch)">CSE 3rd Year - Section A (2026 Batch)</option>
                      <option value="CSE 3rd Year - Section B (2026 Batch)">CSE 3rd Year - Section B (2026 Batch)</option>
                      <option value="IT 3rd Year - Section A (2026 Batch)">IT 3rd Year - Section A (2026 Batch)</option>
                      <option value="Pre-Placement Advanced DSA Club">Pre-Placement Advanced DSA Club</option>
                    </select>
                  </div>

                  {/* 2. Assessment Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Assessment Name
                    </label>
                    <input
                      type="text"
                      value={assessmentName}
                      onChange={(e) => setAssessmentName(e.target.value)}
                      required
                      placeholder="Enter assessment name"
                      className="w-full max-w-xl px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      A short and sweet name for the contest, which should be 5-100 characters long.
                    </p>
                  </div>

                  {/* 3. Start Time */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Start Time
                    </label>
                    <div className="relative max-w-xs">
                      <input
                        type="text"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        placeholder="YYYY-MM-DD hh:mm:ss"
                        className="w-full px-3.5 py-2.5 pr-10 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 text-sm pointer-events-none">
                        📅
                      </span>
                    </div>
                  </div>

                  {/* 4. Duration of Assessment (3 Inputs) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Duration of Assessment
                    </label>
                    <div className="flex items-center gap-3 max-w-md">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-1">
                        <span className="bg-gray-50 text-gray-500 px-3 py-2 text-xs font-semibold border-r border-gray-300">
                          Days
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={durationDays}
                          onChange={(e) => setDurationDays(e.target.value)}
                          className="w-full px-3 py-2 text-xs text-gray-900 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-1">
                        <span className="bg-gray-50 text-gray-500 px-3 py-2 text-xs font-semibold border-r border-gray-300">
                          Hours
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={durationHours}
                          onChange={(e) => setDurationHours(e.target.value)}
                          className="w-full px-3 py-2 text-xs text-gray-900 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-1">
                        <span className="bg-gray-50 text-gray-500 px-3 py-2 text-xs font-semibold border-r border-gray-300">
                          Mins
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={durationMins}
                          onChange={(e) => setDurationMins(e.target.value)}
                          className="w-full px-3 py-2 text-xs text-gray-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. Assessment Syllabus */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Assessment Syllabus
                    </label>
                    <textarea
                      rows={2}
                      value={syllabus}
                      onChange={(e) => setSyllabus(e.target.value)}
                      placeholder="Enter syllabus for this assessment"
                      className="w-full max-w-2xl px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Enter &apos;::&apos; separated syllabus for this skill-test. Eg: Loops::Functions
                    </p>
                  </div>

                  {/* 6. Details/Description */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Details/Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter details for this assessment"
                      className="w-full max-w-2xl px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      This section supports HTML
                    </p>
                  </div>

                  {/* 7. Anti-Cheating & Assessment Policy Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={browserRestrictions}
                        onChange={(e) => setBrowserRestrictions(e.target.checked)}
                        className="h-4 w-4 mt-0.5 text-blue-600 rounded border-gray-300"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900">
                          Enable Browsers Restrictions
                        </span>
                        <p className="text-[11px] text-gray-500">
                          Tick the checkbox if you want to enable browsers restrictions on assessments.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableReview}
                        onChange={(e) => setEnableReview(e.target.checked)}
                        className="h-4 w-4 mt-0.5 text-blue-600 rounded border-gray-300"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900">
                          Enable Review for Students
                        </span>
                        <p className="text-[11px] text-gray-500">
                          Tick the checkbox if you want to enable review mode on assessments.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hideStudentReport}
                        onChange={(e) => setHideStudentReport(e.target.checked)}
                        className="h-4 w-4 mt-0.5 text-blue-600 rounded border-gray-300"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900">
                          Hide Student Report
                        </span>
                        <p className="text-[11px] text-gray-500">
                          Tick the checkbox to prevent students from seeing their final report or score at the end of the assessment.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* 8. Languages Matrix (Screenshot 3) */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between max-w-2xl pb-2 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-900">Languages</span>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={ALL_LANGS.every((l) => selectedLangs[l])}
                          className="h-3.5 w-3.5 text-blue-600 rounded border-gray-300"
                        />
                        <span>Select All</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 pt-4 max-w-2xl">
                      {ALL_LANGS.map((lang) => (
                        <div key={lang} className="text-center space-y-1">
                          <label className="block text-xs font-bold text-gray-800 cursor-pointer">
                            {lang}
                          </label>
                          <input
                            type="checkbox"
                            checked={selectedLangs[lang] || false}
                            onChange={(e) =>
                              setSelectedLangs((prev) => ({
                                ...prev,
                                [lang]: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 mx-auto"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 9. Bottom Action: Create Assessment Button */}
                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-8 py-3 rounded-lg shadow-md transition-colors disabled:opacity-60"
                    >
                      {submitting ? 'Creating Assessment...' : 'Create Assessment'}
                    </button>
                  </div>

                </form>

              </div>
            )}

            {/* SUB-VIEW 2: MY ASSESSMENTS TABLE */}
            {currentSubTab === 'my-assessments' && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                      College Lab Assessments &amp; Contests
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Scheduled and active coding exams created for your college cohorts.
                    </p>
                  </div>
                  <button
                    onClick={() => setSearchParams({ tab: 'create-assessment' })}
                    className="bg-[#2f66d4] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg"
                  >
                    + Create New
                  </button>
                </div>

                {assessments.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-2xl mb-1">📝</p>
                    <p className="text-xs text-gray-500">No assessments created yet.</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 font-bold">Assessment Name</th>
                          <th className="px-4 py-3 font-bold">Cohort</th>
                          <th className="px-4 py-3 font-bold">Start Time</th>
                          <th className="px-4 py-3 font-bold text-center">Duration</th>
                          <th className="px-4 py-3 font-bold text-center">Status</th>
                          <th className="px-4 py-3 font-bold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {assessments.map((a) => (
                          <tr key={a.id} className="hover:bg-gray-50/70">
                            <td className="px-4 py-3 font-bold text-gray-900">
                              {a.assessmentName}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{a.cohort}</td>
                            <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{a.startTime}</td>
                            <td className="px-4 py-3 text-center font-semibold text-gray-700">
                              {a.durationDays > 0 && `${a.durationDays}d `}
                              {a.durationHours}h {a.durationMins}m
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                {a.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenQuestionStudio(a)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md text-xs border border-emerald-300 transition-colors inline-flex items-center gap-1"
                                title="Add and manage coding problems for this assessment"
                              >
                                <span>📝</span> Problems
                              </button>
                              <button
                                onClick={() => handleOpenStudentEvaluations(a)}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-md text-xs border border-indigo-200 transition-colors inline-flex items-center gap-1"
                                title="View student grades and inspect submitted code"
                              >
                                <span>📊</span> Grades
                              </button>
                              <button
                                onClick={() => handleInspectSubmissions(a)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-md text-xs border border-blue-200 transition-colors"
                              >
                                👁️ Code ({submissionsCountMap[a.id] || 1})
                              </button>
                              <button
                                onClick={() => handleRunPlagiarism(a)}
                                className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-md text-xs border border-red-200 transition-colors inline-flex items-center gap-1"
                              >
                                <span>🚨</span> MOSS
                              </button>
                              <button
                                onClick={() => handleExportCSV(a)}
                                className="text-gray-500 hover:text-gray-900 text-xs font-semibold underline px-1"
                              >
                                CSV
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 3: ASSESSMENT QUESTION STUDIO (MANAGE & ADD PROBLEMS) */}
            {currentSubTab === 'manage-problems' && (
              !selectedAssessmentForQuestions ? (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-8 text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                    📝
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Select an Assessment to Manage Problems
                  </h2>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Choose which assessment you want to author coding problems, test cases, and constraints for.
                  </p>
                  {assessments.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      {assessments.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => handleOpenQuestionStudio(a)}
                          className="px-4 py-2.5 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 transition"
                        >
                          {a.assessmentName} ({a.cohort})
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => setSearchParams({ tab: 'create-assessment' })}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                    >
                      + Create Your First Assessment
                    </button>
                  )}
                </div>
              ) : (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                
                {/* Header Banner with Assessment Context */}
                <div className="bg-gradient-to-r from-[#112446] via-[#1c3563] to-[#0f1f3d] text-white p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full">
                        Question Studio
                      </span>
                      <span className="text-xs text-blue-200">
                        Cohort: <strong className="text-white">{selectedAssessmentForQuestions.cohort}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        {selectedAssessmentForQuestions.assessmentName}
                      </h2>
                      {assessments.length > 1 && (
                        <select
                          value={selectedAssessmentForQuestions.id}
                          onChange={(e) => {
                            const found = assessments.find((a) => String(a.id) === e.target.value)
                            if (found) handleOpenQuestionStudio(found)
                          }}
                          className="bg-[#0b1720] border border-blue-400/40 text-blue-100 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none"
                        >
                          {assessments.map((a) => (
                            <option key={a.id} value={a.id}>
                              Switch: {a.assessmentName}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <p className="text-xs text-blue-200/80">
                      Syllabus: <span className="text-white font-mono">{selectedAssessmentForQuestions.syllabus}</span> • Duration: {selectedAssessmentForQuestions.durationHours}h {selectedAssessmentForQuestions.durationMins}m
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      onClick={() => navigate(`/assessments/${selectedAssessmentForQuestions.id}`)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                      title="Preview live student test arena"
                    >
                      <span>👁️</span>
                      <span>Preview Exam</span>
                    </button>
                    <button
                      onClick={() => setShowAddProblemModal(!showAddProblemModal)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>{showAddProblemModal ? '✕ Close Form' : '➕ Add New Problem'}</span>
                    </button>
                    <button
                      onClick={() => setSearchParams({ tab: 'my-assessments' })}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition"
                    >
                      ← Back
                    </button>
                  </div>
                </div>

                {/* ── Problem Authoring Form (Accordion / Card) ─────────────── */}
                {showAddProblemModal && (
                  <form onSubmit={handleSaveProblem} className="bg-blue-50/60 border-2 border-blue-200 rounded-2xl p-6 space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✍️</span>
                        <h3 className="text-sm font-black text-blue-950">
                          Author Coding Problem for this Assessment
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                        Question #{assessmentQuestions.length + 1}
                      </span>
                    </div>

                    {/* Row 1: Title, Difficulty, Points */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-6 space-y-1">
                        <label className="block text-xs font-bold text-gray-800">
                          Problem Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={problemTitle}
                          onChange={(e) => setProblemTitle(e.target.value)}
                          placeholder="e.g. Invert a Binary Tree / Shortest Path in Graph"
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="block text-xs font-bold text-gray-800">
                          Difficulty
                        </label>
                        <select
                          value={problemDifficulty}
                          onChange={(e) => setProblemDifficulty(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="EASY">🟢 EASY</option>
                          <option value="MEDIUM">🟡 MEDIUM</option>
                          <option value="HARD">🔴 HARD</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="block text-xs font-bold text-gray-800">
                          Points (Score Weight)
                        </label>
                        <input
                          type="number"
                          min="10"
                          max="200"
                          step="5"
                          value={problemPoints}
                          onChange={(e) => setProblemPoints(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Row 2: Problem Description Statement */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-800">
                        Problem Statement / Description *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={problemDesc}
                        onChange={(e) => setProblemDesc(e.target.value)}
                        placeholder="Given the root of a binary tree, invert the tree, and return its root. Each left child becomes the right child, and vice versa..."
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                      />
                    </div>

                    {/* Row 3: Constraints & Formats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-800">
                          Constraints
                        </label>
                        <textarea
                          rows={2}
                          value={problemConstraints}
                          onChange={(e) => setProblemConstraints(e.target.value)}
                          placeholder="1 <= N <= 10^5\n-100 <= val <= 100"
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-800">
                          Input Format
                        </label>
                        <textarea
                          rows={2}
                          value={problemInputFormat}
                          onChange={(e) => setProblemInputFormat(e.target.value)}
                          placeholder="First line contains integer N..."
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-800">
                          Output Format
                        </label>
                        <textarea
                          rows={2}
                          value={problemOutputFormat}
                          onChange={(e) => setProblemOutputFormat(e.target.value)}
                          placeholder="Print the inverted tree / result..."
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Row 4: Sample Public Testcase */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <span>🌐</span> Public Sample Test Case (Visible to Students)
                        </span>
                        <span className="text-[10px] text-gray-400">Sample 1</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[11px] font-semibold text-gray-500 block mb-1">Sample Input:</span>
                          <textarea
                            rows={2}
                            value={problemSampleInput}
                            onChange={(e) => setProblemSampleInput(e.target.value)}
                            placeholder="[4, 2, 7, 1, 3, 6, 9]"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono text-gray-800"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-gray-500 block mb-1">Sample Expected Output:</span>
                          <textarea
                            rows={2}
                            value={problemSampleOutput}
                            onChange={(e) => setProblemSampleOutput(e.target.value)}
                            placeholder="[4, 7, 2, 9, 6, 3, 1]"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono text-gray-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 5: Hidden Grading Testcases (Automated Judge) */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <span>🔒</span> Hidden Grading Test Cases (Judge Engine Evaluation)
                          </span>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            These test cases will be run automatically by the compiler judge to score student submissions.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddHiddenTestCaseRow}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          + Add Test Case
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {hiddenTestCases.map((tc, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                            <span className="text-xs font-mono font-bold text-gray-500 w-8 text-center">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={tc.input}
                              onChange={(e) => handleHiddenTestCaseChange(idx, 'input', e.target.value)}
                              placeholder="Hidden Input (e.g. [1, 2, 3])"
                              className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                            />
                            <input
                              type="text"
                              value={tc.output}
                              onChange={(e) => handleHiddenTestCaseChange(idx, 'output', e.target.value)}
                              placeholder="Expected Output (e.g. [1, 3, 2])"
                              className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                            />
                            {hiddenTestCases.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveHiddenTestCaseRow(idx)}
                                className="text-red-500 hover:text-red-700 font-bold text-xs p-1"
                                title="Remove test case"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Row 6: Starter Code Boilerplate per Language */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <span>⚡</span> Starter Code Template (Pre-configured I/O for Students)
                          </span>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            This boilerplate code will be loaded into the student's editor when they start solving this question.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleResetStarterCode(starterLangTab)}
                          className="self-start sm:self-auto text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition"
                        >
                          ↺ Reset {starterLangTab} Template
                        </button>
                      </div>

                      {/* Language Tabs */}
                      <div className="flex items-center gap-1.5 border-b border-gray-200 pb-2">
                        {[
                          { id: 'JAVA', label: '☕ Java', color: 'text-amber-700' },
                          { id: 'CPP', label: '⚡ C++', color: 'text-blue-700' },
                          { id: 'PYTHON', label: '🐍 Python 3', color: 'text-emerald-700' },
                          { id: 'C', label: '⚙️ C', color: 'text-slate-700' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStarterLangTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              starterLangTab === tab.id
                                ? 'bg-gray-900 text-white shadow-xs'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Code Editor for Active Starter Language */}
                      <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#1e1e1e]">
                        <div className="bg-[#181818] px-3 py-1.5 border-b border-gray-800 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                          <span>{starterLangTab.toLowerCase()}_starter_template</span>
                          <span className="text-gray-500">Edit custom Scanner/I/O logic here</span>
                        </div>
                        <textarea
                          rows={8}
                          value={customStarterCodes[starterLangTab] || ''}
                          onChange={(e) => handleStarterCodeChange(starterLangTab, e.target.value)}
                          placeholder={`// Paste or write ${starterLangTab} starter boilerplate with Scanner/I/O handling...`}
                          className="w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs p-3 focus:outline-none leading-relaxed resize-y border-none"
                          spellCheck={false}
                        />
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddProblemModal(false)}
                        className="bg-white border border-gray-300 text-gray-700 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProblem}
                        className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-black text-xs px-7 py-2.5 rounded-xl shadow-md transition disabled:opacity-60 flex items-center gap-1.5"
                      >
                        <span>💾</span>
                        <span>{savingProblem ? 'Saving Problem...' : 'Save Problem to Assessment'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* ── List of Current Problems in this Assessment ───────────── */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                      <span>Assigned Problems in this Exam</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-mono">
                        {assessmentQuestions.length} Total
                      </span>
                    </h3>
                    <span className="text-xs font-bold text-gray-500 font-mono">
                      Total Points: {assessmentQuestions.reduce((acc, q) => acc + (q.points || 50), 0)} Pts
                    </span>
                  </div>

                  {loadingQuestions ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-2">
                      <Spinner size="md" />
                      <p className="text-xs text-gray-500">Loading exam questions...</p>
                    </div>
                  ) : assessmentQuestions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl p-6 space-y-3">
                      <span className="text-4xl">📚</span>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">No Problems Added Yet</h4>
                        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                          This assessment currently has no coding questions assigned. Click <strong>"➕ Add New Problem"</strong> above to create problem statements, constraints, and test cases.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddProblemModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                      >
                        ➕ Add First Problem
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assessmentQuestions.map((prob, idx) => (
                        <div
                          key={prob.id || idx}
                          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-gray-300 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  Q{idx + 1}
                                </span>
                                <h4 className="text-base font-black text-gray-900">
                                  {prob.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                    prob.difficulty === 'HARD'
                                      ? 'bg-red-100 text-red-800'
                                      : prob.difficulty === 'MEDIUM'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {prob.difficulty || 'MEDIUM'}
                                </span>
                                <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-mono">
                                  {prob.points || 50} Points
                                </span>
                                {prob.starterCodesJson && prob.starterCodesJson !== '{}' && (
                                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                                    <span>⚡</span> Starter Template
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteProblem(prob.id, prob.title)}
                              className="text-red-500 hover:text-red-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition"
                            >
                              🗑 Delete
                            </button>
                          </div>

                          {/* Problem Description */}
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {prob.description}
                          </p>

                          {/* Constraints & Sample Preview */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div>
                              <span className="font-bold text-gray-600 block mb-0.5">Constraints:</span>
                              <pre className="text-[11px] font-mono text-gray-700 whitespace-pre-wrap">
                                {prob.constraints || '1 <= N <= 10^5'}
                              </pre>
                            </div>
                            <div>
                              <span className="font-bold text-gray-600 block mb-0.5">Sample Case:</span>
                              <p className="text-[11px] font-mono text-gray-700 truncate">
                                <strong>In:</strong> {prob.sampleInput || 'N/A'}
                              </p>
                              <p className="text-[11px] font-mono text-gray-700 truncate">
                                <strong>Out:</strong> {prob.sampleOutput || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) )}

            {/* SUB-VIEW 4: DEDICATED STUDENT EVALUATIONS & GRADE SHEET PER ASSESSMENT */}
            {currentSubTab === 'student-evaluations' && (
              !selectedAssessmentForSubmissions ? (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-8 text-center space-y-4 shadow-xs">
                  <span className="text-4xl">📊</span>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Select an Assessment to View Grades</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                      Choose a college assessment below to inspect submitted student source codes, marks, testcase results, and proctoring logs.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {assessments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleOpenStudentEvaluations(a)}
                        className="bg-gray-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-xl transition"
                      >
                        {a.assessmentName} ({a.cohort})
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                  
                  {/* Assessment Selection Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                          {selectedAssessmentForSubmissions.cohort || 'General Cohort'}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          🏛️ {selectedAssessmentForSubmissions.collegeName}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <span>📊 Student Grades & Attempt Evaluation:</span>
                        <span className="text-[#2f66d4]">{selectedAssessmentForSubmissions.assessmentName}</span>
                      </h2>
                    </div>

                    {/* Switch Assessment Dropdown & Actions */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <select
                        value={selectedAssessmentForSubmissions.id}
                        onChange={(e) => {
                          const target = assessments.find((a) => String(a.id) === String(e.target.value))
                          if (target) handleOpenStudentEvaluations(target)
                        }}
                        className="bg-gray-50 border border-gray-300 text-gray-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {assessments.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.assessmentName}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleExportCSV(selectedAssessmentForSubmissions)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      >
                        <span>📥</span>
                        <span>Export CSV Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-center">
                      <span className="text-2xl font-black text-blue-700 block font-mono">
                        {evaluationSubmissions.length}
                      </span>
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                        Candidates Attempted
                      </span>
                    </div>

                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-center">
                      <span className="text-2xl font-black text-emerald-700 block font-mono">
                        {evaluationSubmissions.length > 0
                          ? Math.round(evaluationSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / evaluationSubmissions.length)
                          : 0}
                        %
                      </span>
                      <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                        Class Average Marks
                      </span>
                    </div>

                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 text-center">
                      <span className="text-2xl font-black text-amber-700 block font-mono">
                        {evaluationSubmissions.length > 0
                          ? Math.max(...evaluationSubmissions.map((s) => s.score || 0))
                          : 0}
                        %
                      </span>
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                        Highest Score
                      </span>
                    </div>

                    <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 text-center">
                      <span className="text-2xl font-black text-red-700 block font-mono">
                        {evaluationSubmissions.reduce((acc, s) => acc + (s.tabSwitchFlags || 0), 0)}
                      </span>
                      <span className="text-[11px] font-bold text-red-900 uppercase tracking-wider">
                        Integrity Flags
                      </span>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="relative flex-1 max-w-md">
                      <input
                        type="text"
                        value={evalSearchQuery}
                        onChange={(e) => setEvalSearchQuery(e.target.value)}
                        placeholder="🔍 Search student by name, roll number, or handle..."
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {evalSearchQuery && (
                        <button
                          onClick={() => setEvalSearchQuery('')}
                          className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <span className="text-xs text-gray-500 font-mono">
                      Showing {evaluationSubmissions.filter((s) =>
                        (s.studentName || '').toLowerCase().includes(evalSearchQuery.toLowerCase()) ||
                        (s.rollNo || '').toLowerCase().includes(evalSearchQuery.toLowerCase()) ||
                        (s.studentHandle || '').toLowerCase().includes(evalSearchQuery.toLowerCase())
                      ).length} of {evaluationSubmissions.length} Students
                    </span>
                  </div>

                  {/* Student Evaluations List Table */}
                  {loadingEvaluations ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-2">
                      <Spinner size="md" />
                      <p className="text-xs text-gray-500">Loading student submissions &amp; codes...</p>
                    </div>
                  ) : evaluationSubmissions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl p-6 space-y-3">
                      <span className="text-4xl">📝</span>
                      <h4 className="font-bold text-sm text-gray-800">No Student Submissions Yet</h4>
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        Students from this cohort have not submitted answers for this assessment yet. As soon as students take the test, their evaluated scores and source code will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 font-bold">Roll No &amp; Student</th>
                            <th className="px-4 py-3 font-bold">Question Attempted</th>
                            <th className="px-4 py-3 font-bold text-center">Lang</th>
                            <th className="px-4 py-3 font-bold text-center">Marks / Score</th>
                            <th className="px-4 py-3 font-bold text-center">Verdict</th>
                            <th className="px-4 py-3 font-bold text-center">Time</th>
                            <th className="px-4 py-3 font-bold text-center">Integrity</th>
                            <th className="px-4 py-3 font-bold text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                          {evaluationSubmissions
                            .filter((s) =>
                              (s.studentName || '').toLowerCase().includes(evalSearchQuery.toLowerCase()) ||
                              (s.rollNo || '').toLowerCase().includes(evalSearchQuery.toLowerCase()) ||
                              (s.studentHandle || '').toLowerCase().includes(evalSearchQuery.toLowerCase())
                            )
                            .map((sub, idx) => {
                              const isPassing = (sub.score || 0) >= 70
                              const isAverage = (sub.score || 0) >= 40 && (sub.score || 0) < 70

                              return (
                                <tr key={sub.id || idx} className="hover:bg-blue-50/40 transition">
                                  <td className="px-4 py-3.5 space-y-0.5">
                                    <div className="font-black text-gray-900 flex items-center gap-1.5">
                                      <span>{sub.studentName}</span>
                                      <span className="text-[10px] text-gray-400 font-mono font-normal">
                                        (@{sub.studentHandle})
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                      {sub.rollNo || '2023CSB1001'}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3.5 text-gray-700 font-medium">
                                    {sub.problemTitle || 'General Task'}
                                  </td>

                                  <td className="px-4 py-3.5 text-center">
                                    <span className="bg-gray-100 text-gray-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                                      {sub.language || 'JAVA'}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3.5 text-center">
                                    <span
                                      className={`font-black font-mono px-2.5 py-1 rounded-full text-xs ${
                                        isPassing
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : isAverage
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {sub.score || 0} / 100
                                    </span>
                                  </td>

                                  <td className="px-4 py-3.5 text-center">
                                    <span className="text-[11px] font-semibold text-gray-700">
                                      {sub.verdict || 'EVALUATED'}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3.5 text-center text-gray-500 font-mono text-[11px]">
                                    {sub.timeTaken || '35 mins'}
                                  </td>

                                  <td className="px-4 py-3.5 text-center">
                                    {(sub.tabSwitchFlags || 0) > 0 ? (
                                      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center gap-1">
                                        <span>⚠️</span>
                                        <span>{sub.tabSwitchFlags} flags</span>
                                      </span>
                                    ) : (
                                      <span className="text-emerald-700 text-[11px] font-bold">
                                        ✓ Clean
                                      </span>
                                    )}
                                  </td>

                                  <td className="px-4 py-3.5 text-center">
                                    <button
                                      onClick={() => {
                                        setInspectingSub(sub)
                                        setEditScore(sub.score || 0)
                                        setEditFeedback(sub.facultyFeedback || '')
                                      }}
                                      className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 mx-auto"
                                    >
                                      <span>👁️</span>
                                      <span>View Code &amp; Grade</span>
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )
            )}

          </div>

        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 5. CODE INSPECTION & INLINE GRADING MODAL                           */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {inspectingSub && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1e293b] border border-gray-700 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#0f172a] border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>🧑‍🎓 Student Submission Inspector:</span>
                  <span className="text-blue-400 font-bold">{inspectingSub.studentName}</span>
                  <span className="text-xs text-gray-400 font-mono font-normal">({inspectingSub.rollNo})</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>Problem: <strong className="text-white">{inspectingSub.problemTitle}</strong></span>
                  <span>•</span>
                  <span>Language: <strong className="text-blue-300 font-mono">{inspectingSub.language}</strong></span>
                  <span>•</span>
                  <span>Time Taken: <strong className="text-gray-300">{inspectingSub.timeTaken || 'N/A'}</strong></span>
                </p>
              </div>

              <button
                onClick={() => setInspectingSub(null)}
                className="text-gray-400 hover:text-white text-xl font-bold p-1 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Split between Code Viewer and Faculty Feedback/Score Panel */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* Left Column: Monaco Code Editor (8 cols) */}
              <div className="lg:col-span-8 flex flex-col bg-[#1e1e1e] border-r border-gray-800">
                <div className="bg-[#181818] px-4 py-2 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>submitted_solution.{inspectingSub.language?.toLowerCase() === 'python' ? 'py' : inspectingSub.language?.toLowerCase() === 'cpp' ? 'cpp' : inspectingSub.language?.toLowerCase() === 'c' ? 'c' : 'java'}</span>
                  <span className="text-emerald-400 font-bold">{inspectingSub.verdict}</span>
                </div>
                
                <div className="flex-1 min-h-[350px]">
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language={inspectingSub.language?.toLowerCase() === 'python' ? 'python' : inspectingSub.language?.toLowerCase() === 'cpp' ? 'cpp' : inspectingSub.language?.toLowerCase() === 'c' ? 'c' : 'java'}
                    value={inspectingSub.sourceCode || '// No code found'}
                    options={{
                      readOnly: true,
                      fontSize: 13,
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </div>

              {/* Right Column: Faculty Score Adjuster & Proctoring Audit (4 cols) */}
              <div className="lg:col-span-4 p-5 bg-[#0f172a] flex flex-col justify-between overflow-y-auto space-y-4">
                
                <div className="space-y-4">
                  
                  {/* Proctoring Integrity Report */}
                  <div className="bg-[#1e293b] border border-gray-800 rounded-xl p-3.5 space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      🛡️ Integrity &amp; Proctoring Audit
                    </span>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-gray-300">Tab Switch Violations:</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${(inspectingSub.tabSwitchFlags || 0) > 0 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                        {inspectingSub.tabSwitchFlags || 0} Events
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Testcase Status:</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {inspectingSub.verdict || 'ACCEPTED'}
                      </span>
                    </div>
                  </div>

                  {/* Faculty Score Adjuster */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-300">
                      Awarded Marks / Score (0 - 100):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editScore}
                      onChange={(e) => setEditScore(e.target.value)}
                      className="w-full bg-[#1e293b] border border-gray-700 rounded-xl px-3.5 py-2 text-sm font-bold font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Faculty Feedback Comments */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-300">
                      Faculty Remarks &amp; Feedback:
                    </label>
                    <textarea
                      rows={4}
                      value={editFeedback}
                      onChange={(e) => setEditFeedback(e.target.value)}
                      placeholder="Leave detailed code quality remarks or deduction rationale for the student..."
                      className="w-full bg-[#1e293b] border border-gray-700 rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>

                </div>

                {/* Save Grade Action */}
                <div className="pt-2">
                  <button
                    onClick={handleSaveStudentGrade}
                    disabled={savingGrade}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl shadow-md transition disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    <span>💾</span>
                    <span>{savingGrade ? 'Saving Grade...' : 'Save Student Grade & Feedback'}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 5. FACULTY STUDENT CODE INSPECTION MODAL                            */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {showModal && inspectAssessment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1e293b] border border-gray-700 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#0f172a] border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>📑 Student Practical Code Inspector:</span>
                  <span className="text-blue-400 font-bold">{inspectAssessment.assessmentName}</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Cohort: {inspectAssessment.cohort} • Total Evaluated: {studentSubmissions.length} Students
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExportCSV(inspectAssessment)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
                >
                  📥 Export Grade Sheet (CSV)
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: 2-Column Inspector */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              
              {/* Left Column: Student Roster List (4 cols) */}
              <div className="md:col-span-4 border-r border-gray-800 overflow-y-auto p-4 space-y-2 bg-[#0f172a]/70">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Select Student to Review Code:
                </p>
                {studentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1 ${
                      selectedSubmission?.id === sub.id
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-[#1e293b] border-gray-800 text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{sub.studentName}</span>
                      <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded">
                        {sub.score}/100 Pts
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center justify-between">
                      <span>Roll: {sub.rollNo}</span>
                      <span className="font-mono text-emerald-400 font-bold">{sub.language}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center justify-between">
                      <span>⏱ {sub.timeTaken}</span>
                      <span className={sub.tabSwitchFlags > 0 ? 'text-amber-400 font-bold' : 'text-gray-400'}>
                        {sub.tabSwitchFlags > 0 ? `⚠️ ${sub.tabSwitchFlags} Tab switches` : '✓ 0 Flags'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Monaco Code Viewer (8 cols) */}
              <div className="md:col-span-8 flex flex-col bg-[#1e293b] overflow-hidden">
                {selectedSubmission ? (
                  <>
                    {/* Top Status Bar */}
                    <div className="p-3 bg-[#0f172a] border-b border-gray-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400">Exam Question: </span>
                        <span className="text-white font-bold">{selectedSubmission.problemTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                          {selectedSubmission.verdict}
                        </span>
                      </div>
                    </div>

                    {/* Read-Only Monaco Editor */}
                    <div className="flex-1 min-h-[300px] h-[360px]">
                      <Editor
                        height="100%"
                        theme="vs-dark"
                        language={
                          selectedSubmission.language === 'CPP'
                            ? 'cpp'
                            : selectedSubmission.language === 'PYTHON'
                            ? 'python'
                            : selectedSubmission.language === 'C'
                            ? 'c'
                            : 'java'
                        }
                        value={selectedSubmission.sourceCode}
                        options={{
                          readOnly: true,
                          fontSize: 13,
                          minimap: { enabled: false },
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>

                    {/* Professor Remarks & Grade Bar */}
                    <div className="p-3 bg-[#0f172a] border-t border-gray-800 flex items-center justify-between gap-3 text-xs">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Add professor feedback (e.g. 'Good optimal recursion, clean code')..."
                          className="w-full bg-[#1e293b] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => alert(`Feedback saved for ${selectedSubmission.studentName}!`)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        Save Remark
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                    Select a student submission on the left to inspect their code.
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 5.5 FACULTY PLAGIARISM & MOSS INTEGRITY AUDIT MODAL                 */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {showPlagiarismModal && inspectAssessment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1e293b] border-2 border-red-500/50 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white">
            
            {/* Modal Top Header */}
            <div className="p-5 bg-[#0f172a] border-b border-gray-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-red-500 text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      MOSS Engine
                    </span>
                    <h3 className="text-base font-black text-white">
                      Automated Code Plagiarism &amp; Structural Similarity Audit
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    Assessment: <strong className="text-blue-400">{inspectAssessment.assessmentName}</strong> • Cohort: {inspectAssessment.cohort}
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
      {/* 6. FOOTER (Screenshot 3)                                           */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 px-4 sm:px-8 py-5 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>www.codechef.com</span>
          <div className="flex items-center gap-3">
            <span>Follow Us</span>
            <span className="text-base space-x-2">
              <span className="cursor-pointer">🔴</span>
              <span className="cursor-pointer">🔵</span>
              <span className="cursor-pointer">📷</span>
              <span className="cursor-pointer">✖️</span>
              <span className="cursor-pointer">🔗</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}
