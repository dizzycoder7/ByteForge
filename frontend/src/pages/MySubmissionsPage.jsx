import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import VerdictBadge from '../components/VerdictBadge'
import Spinner from '../components/Spinner'
import api from '../api/axios'

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [page, setPage]               = useState(0)
  const [totalPages, setTotalPages]   = useState(0)

  useEffect(() => {
    setLoading(true)
    api.get('/submissions/my', { params: { page, size: 15 } })
      .then(({ data }) => {
        setSubmissions(data.content)
        setTotalPages(data.totalPages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Submissions</h1>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">No submissions yet.</p>
          <Link to="/problems" className="text-indigo-600 hover:underline text-sm">
            Browse problems →
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Problem</th>
                  <th className="px-4 py-3 text-left font-semibold">Language</th>
                  <th className="px-4 py-3 text-left font-semibold">Verdict</th>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.id}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/problems/${s.problemSlug}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {s.problemTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.language}</td>
                    <td className="px-4 py-3">
                      <Link to={`/submissions/${s.id}`}>
                        <VerdictBadge verdict={s.verdict} />
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {s.executionTimeMs != null ? `${s.executionTimeMs}ms` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(s.submittedAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                ← Prev
              </button>
              <span className="text-sm text-gray-500">
                Page <span className="font-semibold text-gray-800">{page + 1}</span> of {totalPages}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
