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

const STARTERS = {
  JAVA: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your solution here
    }
}`,
  CPP: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Your solution here
    return 0;
}`,
  PYTHON: `import sys
input = sys.stdin.readline

# Your solution here
`,
}

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
  const [code, setCode]         = useState(STARTERS.JAVA)

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState(null)
  const pollRef = useRef(null)  // stores setInterval id for cleanup

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
          // If slug lookup fails, try by numeric ID
          const res = await api.get(`/problems/${slug}`)
          prob = res.data
        }

        setProblem(prob)
        setCode(getStarterCode(prob.slug, language))

        try {
          const { data: samps } = await api.get(`/problems/${prob.id}/testcases/samples`)
          setSamples(samps || [])
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

  // ── Poll submission verdict while PENDING ─────────────────────────────────
  useEffect(() => {
    // Clear any existing poll when submission changes
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

    // Cleanup poll on unmount or when submission changes
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [submission?.id, submission?.verdict])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(getStarterCode(problem?.slug, lang))
  }

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
    <div className="max-w-screen-xl mx-auto px-4 py-6 flex gap-6 items-start">

      {/* ── Left: Problem Statement ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Title + meta */}
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            ⏱ {problem.timeLimitMs}ms &nbsp;|&nbsp;
            💾 {problem.memoryLimitMb}MB &nbsp;|&nbsp;
            by @{problem.authorUsername}
          </p>
        </div>

        <Section title="Problem Statement">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>
        </Section>

        {problem.inputFormat && (
          <Section title="Input Format">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{problem.inputFormat}</p>
          </Section>
        )}

        {problem.outputFormat && (
          <Section title="Output Format">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{problem.outputFormat}</p>
          </Section>
        )}

        {problem.constraints && (
          <Section title="Constraints">
            <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap">{problem.constraints}</p>
          </Section>
        )}

        {samples.length > 0 && (
          <Section title="Sample Test Cases">
            <div className="space-y-4">
              {samples.map((tc, i) => (
                <div key={tc.id} className="grid grid-cols-2 gap-3">
                  <IOBlock label={`Input ${i + 1}`}  content={tc.inputData} />
                  <IOBlock label={`Output ${i + 1}`} content={tc.expectedOutput} />
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ── Right: Code Editor + Submit ────────────────────────────────── */}
      <div className="w-[500px] flex-shrink-0 space-y-3 sticky top-20">

        {/* Language selector */}
        <div className="flex gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.value}
              onClick={() => handleLanguageChange(l.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                language === l.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Monaco Editor */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <Editor
            height="440px"
            language={selectedLang?.monaco}
            value={code}
            onChange={val => setCode(val ?? '')}
            theme="vs-dark"
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 4,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
        >
          {submitting
            ? 'Submitting...'
            : isAuthenticated
              ? '⚡ Submit Solution'
              : '🔒 Login to Submit'}
        </button>

        {/* Verdict panel */}
        {submission && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Result</span>
              <VerdictBadge verdict={submission.verdict} />
            </div>

            {submission.verdict === 'PENDING' && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Spinner size="sm" />
                <span>Judge is running your code...</span>
              </div>
            )}

            {submission.executionTimeMs != null && submission.executionTimeMs > 0 && (
              <p className="text-xs text-gray-500">⏱ {submission.executionTimeMs}ms</p>
            )}

            {submission.errorMessage && (
              <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32 font-mono">
                {submission.errorMessage}
              </pre>
            )}

            <a
              href={`/submissions/${submission.id}`}
              className="block text-xs text-indigo-600 hover:underline"
            >
              View full submission →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Small helper components ────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 pb-1 border-b border-gray-100">
        {title}
      </h3>
      {children}
    </div>
  )
}

function IOBlock({ label, content }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded font-mono overflow-auto min-h-[60px]">
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
    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${styles[difficulty]}`}>
      {difficulty}
    </span>
  )
}
