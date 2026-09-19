import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import VerdictBadge from '../components/VerdictBadge'
import Spinner from '../components/Spinner'
import api from '../api/axios'

const MONACO_LANG = { JAVA: 'java', CPP: 'cpp', PYTHON: 'python' }

export default function SubmissionDetailPage() {
  const { id }                            = useParams()
  const [submission, setSubmission]       = useState(null)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const pollRef                           = useRef(null)

  // Initial load + auto-poll while PENDING
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/submissions/${id}`)
        setSubmission(data)
        setLoading(false)

        if (data.verdict === 'PENDING') {
          // Poll every 2s until verdict is final
          pollRef.current = setInterval(async () => {
            try {
              const { data: updated } = await api.get(`/submissions/${id}`)
              setSubmission(updated)
              if (updated.verdict !== 'PENDING') clearInterval(pollRef.current)
            } catch {
              clearInterval(pollRef.current)
            }
          }, 2000)
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load submission.')
        setLoading(false)
      }
    }

    load()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (error)   return <div className="text-center text-red-500 py-20">{error}</div>
  if (!submission) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Breadcrumb */}
      <Link to="/submissions/my" className="text-sm text-indigo-600 hover:underline">
        ← My Submissions
      </Link>

      {/* Verdict card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Problem</p>
            <Link
              to={`/problems/${submission.problemSlug}`}
              className="text-lg font-bold text-indigo-600 hover:underline"
            >
              {submission.problemTitle}
            </Link>
            <p className="text-xs text-gray-400 mt-0.5">by @{submission.username}</p>
          </div>
          <div className="flex-shrink-0">
            <VerdictBadge verdict={submission.verdict} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 text-sm">
          <Stat label="Language"       value={submission.language} />
          <Stat label="Execution Time" value={submission.executionTimeMs != null ? `${submission.executionTimeMs}ms` : '—'} />
          <Stat label="Submitted"      value={new Date(submission.submittedAt).toLocaleString('en-IN')} />
        </div>

        {/* Still judging */}
        {submission.verdict === 'PENDING' && (
          <div className="flex items-center gap-2 text-sm text-gray-400 border-t pt-4">
            <Spinner size="sm" />
            <span>Judge is processing your submission...</span>
          </div>
        )}

        {/* Error output (CE / RE) */}
        {submission.errorMessage && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">
              Error Output
            </p>
            <pre className="text-xs text-red-700 bg-red-50 border border-red-100 p-3 rounded-lg overflow-auto max-h-52 font-mono">
              {submission.errorMessage}
            </pre>
          </div>
        )}
      </div>

      {/* Submitted code (read-only Monaco) */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Submitted Code</h2>
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <Editor
            height="420px"
            language={MONACO_LANG[submission.language] ?? 'plaintext'}
            value={submission.code}
            theme="vs-dark"
            options={{
              readOnly: true,
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-semibold text-gray-800 text-sm">{value}</p>
    </div>
  )
}
