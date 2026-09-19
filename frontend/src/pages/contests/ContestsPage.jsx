import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CodeChefFooter from '../../components/CodeChefFooter'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

export default function ContestsPage() {
  const [activeTab, setActiveTab] = useState('PRESENT') // 'PRESENT' | 'FUTURE' | 'PAST'
  const [contests, setContests] = useState({ live: [], upcoming: [], past: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/contests')
      .then(({ data }) => setContests(data))
      .catch((err) => console.error('Failed to load contests', err))
      .finally(() => setLoading(false))
  }, [])

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA'
    const d = new Date(dateStr)
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 1. HERO BANNER                                                   */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#112446] via-[#1c3563] to-[#0f1f3d] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#5b4638] text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase">
              <span>⚔️</span> ByteForge Arena
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Official Rated Coding Contests
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl">
              Compete against top collegiate and global coders in timed rounds. Boost your Star Rating (1★ to 7★), unlock placement opportunities, and earn prestige.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 relative z-10">
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-lg font-black text-amber-400">Div 1 & 2</span>
              <span className="text-[10px] text-blue-200">Rating 1600+</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-lg font-black text-emerald-400">Div 3 & 4</span>
              <span className="text-[10px] text-blue-200">Rating &lt; 1600</span>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 2. CONTEST NAVIGATION TABS                                       */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-1">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('PRESENT')}
              className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'PRESENT'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span>Present Contests ({contests.live.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('FUTURE')}
              className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'FUTURE'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Future Contests ({contests.upcoming.length})
            </button>

            <button
              onClick={() => setActiveTab('PAST')}
              className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'PAST'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Past Contests ({contests.past.length})
            </button>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 3. CONTEST LISTINGS                                              */}
        {/* ──────────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* ── PRESENT (LIVE) CONTESTS ─────────────────────────────────── */}
            {activeTab === 'PRESENT' && (
              <>
                {contests.live.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3">
                    <span className="text-3xl">☕</span>
                    <h3 className="font-bold text-gray-800 text-sm">No Live Contests Right Now</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      Check the <strong>Future Contests</strong> tab to register for upcoming Starters and Cook-Offs!
                    </p>
                  </div>
                ) : (
                  contests.live.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white border-2 border-red-500/30 hover:border-red-500 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-red-500 text-white font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            LIVE NOW
                          </span>
                          <span className="bg-[#5b4638] text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-md">
                            {c.code}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {c.divisions}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-lg sm:text-xl font-black text-gray-900">
                            {c.name}
                          </h2>
                          <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                            {c.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-mono">
                          <span>⏱ Duration: <strong>{c.durationMins} Mins</strong></span>
                          <span>🌟 {c.ratedFor}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
                        <Link
                          to={`/contests/${c.code}`}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3.5 rounded-2xl text-center transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <span>▶</span>
                          <span>Enter Contest Arena</span>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* ── FUTURE (UPCOMING) CONTESTS ──────────────────────────────── */}
            {activeTab === 'FUTURE' && (
              <>
                {contests.upcoming.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-500">
                    No upcoming contests scheduled.
                  </div>
                ) : (
                  contests.upcoming.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white border border-gray-200/90 hover:border-blue-400 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            UPCOMING
                          </span>
                          <span className="bg-gray-100 text-gray-800 font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                            {c.code}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {c.divisions}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-gray-900">
                            {c.name}
                          </h2>
                          <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                            {c.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-mono">
                          <span>📅 Starts: <strong>{formatDate(c.startTime)}</strong></span>
                          <span>⏱ Duration: <strong>{c.durationMins} Mins</strong></span>
                          <span>🌟 {c.ratedFor}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
                        <button
                          onClick={() => alert(`Reminder set for ${c.name}! We'll notify you before the round starts.`)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-5 py-2.5 rounded-xl border border-blue-200 transition-colors"
                        >
                          🔔 Set Reminder
                        </button>
                        <Link
                          to={`/contests/${c.code}`}
                          className="bg-[#112446] hover:bg-[#1a3567] text-white font-bold text-xs px-5 py-2.5 rounded-xl text-center transition-colors"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* ── PAST CONTESTS ──────────────────────────────────────────── */}
            {activeTab === 'PAST' && (
              <>
                {contests.past.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-500">
                    No past contests found.
                  </div>
                ) : (
                  contests.past.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-100 text-gray-600 font-mono font-bold text-xs px-2 py-0.5 rounded">
                            {c.code}
                          </span>
                          <span className="text-xs text-gray-400">Ended on {formatDate(c.endTime)}</span>
                        </div>
                        <h2 className="text-base font-bold text-gray-900">{c.name}</h2>
                        <p className="text-xs text-gray-500">{c.ratedFor} • {c.divisions}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          to={`/contests/${c.code}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                        >
                          Practice Problems
                        </Link>
                        <Link
                          to={`/contests/${c.code}?tab=scoreboard`}
                          className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                        >
                          View Scoreboard
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

          </div>
        )}

      </main>

      <CodeChefFooter />
    </div>
  )
}
