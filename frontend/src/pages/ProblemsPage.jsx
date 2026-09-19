import { useState, useEffect } from 'react'
import ProblemCard from '../components/ProblemCard'
import Spinner from '../components/Spinner'
import api from '../api/axios'

const DIFFICULTIES = ['ALL', 'EASY', 'MEDIUM', 'HARD']

export default function ProblemsPage() {
  const [allProblems, setAllProblems] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [page, setPage]               = useState(0)
  const [totalPages, setTotalPages]   = useState(0)
  const [difficulty, setDifficulty]   = useState('ALL')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get('/problems', {
      params: { page, size: 15, sortBy: 'createdAt', sortDir: 'desc' }
    })
      .then(({ data }) => {
        setAllProblems(data.content)
        setTotalPages(data.totalPages)
      })
      .catch(() => setError('Failed to load problems. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [page])

  // Client-side difficulty filter (server-side filtering is a Phase 5 enhancement)
  const problems = difficulty === 'ALL'
    ? allProblems
    : allProblems.filter(p => p.difficulty === difficulty)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Problems</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {allProblems.length > 0 ? `${allProblems.length} problems on this page` : ''}
          </p>
        </div>

        {/* Difficulty filter pills */}
        <div className="flex gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setPage(0) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                difficulty === d
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 font-medium">{error}</p>
          <button onClick={() => setPage(0)} className="mt-3 text-sm text-indigo-600 hover:underline">
            Retry
          </button>
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {difficulty !== 'ALL' ? `No ${difficulty} problems found.` : 'No problems yet.'}
        </div>
      ) : (
        <div className="space-y-2">
          {problems.map((p, i) => (
            <ProblemCard key={p.id} problem={p} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page <span className="font-semibold text-gray-800">{page + 1}</span> of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
