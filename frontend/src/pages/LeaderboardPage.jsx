import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import CodeChefFooter from '../components/CodeChefFooter'
import api from '../api/axios'

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

const PRESET_COLLEGES = [
  'All Colleges (Global)',
  'Delhi Technological University',
  'IIT Delhi',
  'BITS Pilani',
  'VIT Vellore',
  'NIT Trichy',
]

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedCollege, setSelectedCollege] = useState('All Colleges (Global)')
  const [customCollege, setCustomCollege] = useState('')
  const PAGE_SIZE = 20

  const activeCollegeFilter =
    selectedCollege === 'All Colleges (Global)' ? customCollege.trim() : selectedCollege

  useEffect(() => {
    setLoading(true)
    const params = {
      page,
      size: PAGE_SIZE,
    }
    if (activeCollegeFilter) {
      params.college = activeCollegeFilter
    }

    api.get('/leaderboard', { params })
      .then(({ data }) => {
        setEntries(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      })
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setLoading(false))
  }, [page, activeCollegeFilter])

  const handleCollegeSelect = (college) => {
    setSelectedCollege(college)
    setCustomCollege('')
    setPage(0)
  }

  const handleCustomSearch = (e) => {
    e.preventDefault()
    setSelectedCollege('')
    setPage(0)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'Rank,Handle,College,Problems Solved,Total Submissions\n'
    const rows = entries
      .map((e) => `${e.rank},"@${e.username}","${e.collegeName || 'Independent'}",${e.problemsSolved},${e.totalSubmissions}`)
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ByteForge_Leaderboard_${activeCollegeFilter || 'Global'}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200/90 py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold text-amber-900 mb-2">
                <span>🏆</span>
                <span>ByteForge Global &amp; Campus Standings</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Competitive Coding Leaderboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Ranked by distinct accepted problems solved across Java, C++, and Python.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                disabled={entries.length === 0}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
              >
                <span>📥</span>
                <span>Export Standings (CSV)</span>
              </button>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────── */}
          {/* UNIVERSITY / COLLEGE FILTER BAR                                */}
          {/* ────────────────────────────────────────────────────────────── */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Filter by College / University:
              </span>
              {activeCollegeFilter && (
                <button
                  onClick={() => handleCollegeSelect('All Colleges (Global)')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Clear filter (Show Global)
                </button>
              )}
            </div>

            {/* Preset College Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLLEGES.map((college) => {
                const isActive = selectedCollege === college
                return (
                  <button
                    key={college}
                    onClick={() => handleCollegeSelect(college)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#2f66d4] text-white shadow-xs'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>🏛️</span>
                    <span>{college}</span>
                  </button>
                )
              })}
            </div>

            {/* Custom College Search Input */}
            <form onSubmit={handleCustomSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  value={customCollege}
                  onChange={(e) => setCustomCollege(e.target.value)}
                  placeholder="Type any other college name (e.g. SRM, Manipal, RV College)..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Filter
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Main Leaderboard Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-20 font-semibold text-sm">
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8">
            <p className="text-3xl mb-2">🏛️</p>
            <p className="text-base font-bold text-gray-800">No coders found for this filter</p>
            <p className="text-xs text-gray-500 mt-1">
              Try switching back to &apos;All Colleges (Global)&apos; or search another institute.
            </p>
            <button
              onClick={() => handleCollegeSelect('All Colleges (Global)')}
              className="mt-4 bg-[#2f66d4] hover:bg-[#2554b5] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Reset to Global Leaderboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>
                Showing <strong>{entries.length}</strong> of <strong>{totalElements}</strong> ranked coders
                {activeCollegeFilter && ` representing "${activeCollegeFilter}"`}
              </span>
              <span className="font-mono text-[11px]">Sorted by: Problems Solved DESC</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f8fafc] border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 font-bold w-16 text-center">Rank</th>
                    <th className="px-5 py-3.5 font-bold">User</th>
                    <th className="px-5 py-3.5 font-bold">College / University</th>
                    <th className="px-5 py-3.5 font-bold text-center">Problems Solved</th>
                    <th className="px-5 py-3.5 font-bold text-center">Total Submissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {entries.map((entry) => {
                    const isTopThree = entry.rank <= 3
                    return (
                      <tr
                        key={entry.username}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          isTopThree ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="px-5 py-4 text-center font-bold text-sm">
                          {MEDALS[entry.rank] ?? `#${entry.rank}`}
                        </td>

                        {/* User with Handle */}
                        <td className="px-5 py-4">
                          <Link
                            to={`/profile/${entry.username}`}
                            className="font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                          >
                            <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                              {entry.username.charAt(0).toUpperCase()}
                            </span>
                            <span>@{entry.username}</span>
                          </Link>
                        </td>

                        {/* College Name */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                            <span>🏛️</span>
                            <span>{entry.collegeName || 'Independent Coder'}</span>
                          </span>
                        </td>

                        {/* Problems Solved */}
                        <td className="px-5 py-4 text-center">
                          <span className="font-bold text-sm text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                            {entry.problemsSolved}
                          </span>
                        </td>

                        {/* Total Submissions */}
                        <td className="px-5 py-4 text-center text-gray-500 font-mono">
                          {entry.totalSubmissions}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-4">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-white bg-white/60 transition-colors shadow-2xs"
                >
                  ← Previous
                </button>
                <span className="text-xs text-gray-600">
                  Page <span className="font-bold text-gray-900">{page + 1}</span> of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-white bg-white/60 transition-colors shadow-2xs"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <CodeChefFooter />

    </div>
  )
}
