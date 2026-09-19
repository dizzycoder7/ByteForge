import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import CodeChefFooter from '../../components/CodeChefFooter'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

export default function ContestArenaPage() {
  const { code } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'problems') // 'problems' | 'scoreboard'
  const [selectedDiv, setSelectedDiv] = useState('Div 4')
  const [contestData, setContestData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Countdown timer in seconds
  const [timeLeft, setTimeLeft] = useState(5140)

  useEffect(() => {
    setLoading(true)
    api.get(`/contests/${code}`)
      .then(({ data }) => {
        setContestData(data)
      })
      .catch((err) => {
        console.error('Failed to load contest', err)
      })
      .finally(() => setLoading(false))
  }, [code])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatClock = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const contest = contestData?.contest
  const problems = contestData?.problems || []
  const scoreboard = contestData?.scoreboard || []
  const announcements = contestData?.announcements || []

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP CONTEST ARENA HEADER                                        */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#112446] text-white border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#5b4638] text-white font-mono font-black text-xs px-2.5 py-0.5 rounded">
                  {contest?.code || code}
                </span>
                <span className="bg-red-500 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ● LIVE ARENA
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {contest?.name || 'ByteForge Rated Starters Contest'}
              </h1>
              <p className="text-xs text-blue-200/90 font-mono">
                {contest?.ratedFor} • Total Duration: {contest?.durationMins} Mins
              </p>
            </div>

            {/* Live Clock & Division Selector */}
            <div className="flex flex-wrap items-center gap-4 bg-[#1c3563] p-3.5 rounded-2xl border border-blue-800">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-300 block">
                  Time Remaining
                </span>
                <span className="font-mono font-black text-lg sm:text-xl text-red-400 animate-pulse">
                  ⏱️ {formatClock(timeLeft)}
                </span>
              </div>

              <div className="h-8 w-[1px] bg-blue-700/60 hidden sm:block" />

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-300 block">
                  Division
                </span>
                <div className="flex gap-1">
                  {['Div 1', 'Div 2', 'Div 3', 'Div 4'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDiv(d)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                        selectedDiv === d
                          ? 'bg-[#2f66d4] text-white'
                          : 'bg-blue-900/50 text-blue-200 hover:bg-blue-800'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Announcements Bar */}
          {announcements.length > 0 && (
            <div className="bg-blue-950/70 border border-blue-800/80 rounded-xl px-4 py-2 text-xs text-blue-200 font-mono flex items-center gap-2">
              <span>📢</span>
              <span>{announcements[0]}</span>
            </div>
          )}

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. TAB NAVIGATION                                                  */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('problems')}
            className={`py-3.5 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 ${
              activeTab === 'problems'
                ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🧩 Problem Set ({problems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scoreboard')}
            className={`py-3.5 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 ${
              activeTab === 'scoreboard'
                ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🏆 Live Scoreboard</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3. MAIN ARENA CONTENT                                              */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* ── TAB 1: PROBLEMS TABLE ───────────────────────────────────────── */}
        {activeTab === 'problems' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {selectedDiv} Challenge Problems
                </h2>
                <p className="text-xs text-gray-500">
                  Solve problems in any order. Score points for each passed testcase set.
                </p>
              </div>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                Penalty: +10 mins per WA
              </span>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">Code</th>
                    <th className="px-4 py-3.5 font-bold">Problem Title</th>
                    <th className="px-4 py-3.5 font-bold text-center">Difficulty</th>
                    <th className="px-4 py-3.5 font-bold text-center">Score</th>
                    <th className="px-4 py-3.5 font-bold text-center">Accuracy</th>
                    <th className="px-4 py-3.5 font-bold text-center">Submissions</th>
                    <th className="px-4 py-3.5 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {problems.map((p) => (
                    <tr key={p.code} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-blue-700">
                        {p.code}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900">
                        <Link
                          to="/problems/two-sum"
                          className="hover:text-blue-600 hover:underline"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.difficulty === 'EASY'
                              ? 'bg-green-100 text-green-800'
                              : p.difficulty === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-gray-700 font-mono">
                        {p.score} Pts
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-gray-600">
                        {p.accuracyPercentage}%
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-gray-600">
                        {p.successfulSubmissions}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Link
                          to="/problems/two-sum"
                          className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors inline-block"
                        >
                          Solve →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: LIVE SCOREBOARD ──────────────────────────────────────── */}
        {activeTab === 'scoreboard' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {selectedDiv} Official Live Rankings
                </h2>
                <p className="text-xs text-gray-500">
                  Rankings dynamically sorted by highest score and lowest penalty time.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-gray-600">Live Auto-Sync</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3.5 font-bold text-center">Rank</th>
                    <th className="px-4 py-3.5 font-bold">Coder Handle</th>
                    <th className="px-4 py-3.5 font-bold">Institution / College</th>
                    <th className="px-4 py-3.5 font-bold text-center">Rating</th>
                    <th className="px-4 py-3.5 font-bold text-center">Total Score</th>
                    <th className="px-4 py-3.5 font-bold text-center">Penalty</th>
                    <th className="px-4 py-3.5 font-bold">Solved Problems</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {scoreboard.map((row) => (
                    <tr
                      key={row.handle}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        row.rank <= 3 ? 'bg-amber-50/30 font-semibold' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center font-black text-xs">
                        {row.rank === 1 && '🥇 1'}
                        {row.rank === 2 && '🥈 2'}
                        {row.rank === 3 && '🥉 3'}
                        {row.rank > 3 && `#${row.rank}`}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-blue-600">
                        <Link to={`/profile/${row.handle}`} className="hover:underline">
                          @{row.handle}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 text-xs">
                        {row.collegeName}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-mono text-[11px]">
                          {row.starRating}★
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-black text-gray-900 text-sm">
                        {row.totalScore}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-gray-500">
                        {row.penaltyTimeMins}m
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5 flex-wrap">
                          {row.solvedProblems.map((prob) => (
                            <span
                              key={prob}
                              className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                            >
                              ✓ {prob}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      <CodeChefFooter />
    </div>
  )
}
