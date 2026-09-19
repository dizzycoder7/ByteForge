import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import CodeChefFooter from '../components/CodeChefFooter'
import api from '../api/axios'

// CodeChef official star rating colors
const STAR_COLORS = {
  1: { text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' },
  2: { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' },
  3: { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' },
  4: { text: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300' },
  5: { text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300' },
  6: { text: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' },
  7: { text: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' },
}

export default function ProfilePage() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isEditingCollege, setIsEditingCollege] = useState(false)
  const [collegeInput, setCollegeInput] = useState('')
  const [savingCollege, setSavingCollege] = useState(false)

  const isOwnProfile = currentUser?.username === username

  const fetchProfile = () => {
    setLoading(true)
    api.get(`/users/${username}`)
      .then(({ data }) => {
        setProfile(data)
        setCollegeInput(data.collegeName || '')
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProfile()
  }, [username])

  const handleUpdateCollege = async (e) => {
    e.preventDefault()
    setSavingCollege(true)
    try {
      await api.put('/users/profile/college', { collegeName: collegeInput })
      setProfile((prev) => ({ ...prev, collegeName: collegeInput }))
      setIsEditingCollege(false)
    } catch (err) {
      alert('Failed to update college affiliation.')
    } finally {
      setSavingCollege(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <p className="text-4xl mb-2">🔍</p>
        <h2 className="text-xl font-bold text-gray-800">User @{username} not found</h2>
        <Link to="/leaderboard" className="text-blue-600 font-semibold text-xs mt-3 hover:underline">
          ← Return to Leaderboard
        </Link>
      </div>
    )
  }

  if (!profile) return null

  const solveRate =
    profile.totalSubmissions > 0
      ? ((profile.problemsSolved / profile.totalSubmissions) * 100).toFixed(1)
      : '0.0'

  const starStyle = STAR_COLORS[profile.starRating] || STAR_COLORS[1]

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* TOP PROFILE HERO CARD                                              */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200/90 py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar + Identity */}
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-[#5b4638] to-[#8d6e53] text-white flex items-center justify-center text-3xl font-black shadow-md">
              {profile.username.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-gray-900">@{profile.username}</h1>
                <span className="bg-gray-100 border border-gray-300 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">
                  {profile.role}
                </span>
              </div>

              {/* Institutional College Tag */}
              <div className="flex items-center gap-2 text-xs">
                {isEditingCollege ? (
                  <form onSubmit={handleUpdateCollege} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={collegeInput}
                      onChange={(e) => setCollegeInput(e.target.value)}
                      placeholder="Enter college name..."
                      className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={savingCollege}
                      className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCollege(false)}
                      className="text-gray-400 text-xs hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200/80 text-blue-900 px-3 py-1 rounded-full font-bold text-xs">
                      <span>🏛️</span>
                      <span>{profile.collegeName}</span>
                    </span>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditingCollege(true)}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        Edit College
                      </button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-gray-400">
                Member since {new Date(profile.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* CodeChef Star Rating Banner */}
          <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-2xs">
            <div className={`px-4 py-2 rounded-xl text-center border ${starStyle.bg} ${starStyle.border}`}>
              <div className={`text-2xl font-black ${starStyle.text}`}>
                {profile.starRating}★
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Star Rating
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-black text-gray-900 font-mono">
                {profile.ratingScore}
              </div>
              <div className="text-[11px] text-gray-500">
                Division {profile.starRating >= 4 ? '1' : profile.starRating >= 3 ? '2' : profile.starRating >= 2 ? '3' : '4'} Coder
              </div>
              <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold border border-green-200 inline-block">
                Campus Chapter Active
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* MAIN STATS & HEATMAP SECTION                                       */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-gray-500">Problems Solved</p>
            <p className="text-3xl font-black text-green-600 mt-1">{profile.problemsSolved}</p>
            <p className="text-[11px] text-gray-400 mt-1">Unique accepted</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-gray-500">Total Submissions</p>
            <p className="text-3xl font-black text-blue-600 mt-1">{profile.totalSubmissions}</p>
            <p className="text-[11px] text-gray-400 mt-1">Java / C++ / Python</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-gray-500">Accuracy / Solve Rate</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">{solveRate}%</p>
            <p className="text-[11px] text-gray-400 mt-1">AC / Total</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-semibold text-gray-500">Campus Standing</p>
            <p className="text-3xl font-black text-amber-600 mt-1">Top 5%</p>
            <p className="text-[11px] text-gray-400 mt-1">In {profile.collegeName}</p>
          </div>
        </div>

        {/* 2-Column: Activity Heatmap & Difficulty Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 52-Week Activity Heatmap (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Annual Activity Heatmap</h3>
                <p className="text-xs text-gray-500 mt-0.5">Coding frequency over the academic year</p>
              </div>
              <span className="text-xs text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
                Active Streak 🔥
              </span>
            </div>

            {/* Contribution Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
                {Array.from({ length: 52 * 7 }).map((_, i) => {
                  const intensity =
                    i % 11 === 0 ? 'bg-green-600' :
                    i % 7 === 0 ? 'bg-green-400' :
                    i % 4 === 0 ? 'bg-green-200' : 'bg-gray-100'
                  return (
                    <div
                      key={i}
                      className={`h-2.5 w-2.5 rounded-2xs ${intensity} hover:ring-1 hover:ring-black/20 cursor-pointer`}
                      title="Coding Activity Day"
                    />
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
              <span>Learn more about how activity is calculated</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <span className="h-2.5 w-2.5 rounded-2xs bg-gray-100" />
                <span className="h-2.5 w-2.5 rounded-2xs bg-green-200" />
                <span className="h-2.5 w-2.5 rounded-2xs bg-green-400" />
                <span className="h-2.5 w-2.5 rounded-2xs bg-green-600" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900">Solved by Difficulty</h3>

            <div className="space-y-3">
              <DiffBar
                label="Easy"
                count={profile.easyCount}
                color="bg-green-500"
                total={profile.problemsSolved}
              />
              <DiffBar
                label="Medium"
                count={profile.mediumCount}
                color="bg-yellow-500"
                total={profile.problemsSolved}
              />
              <DiffBar
                label="Hard"
                count={profile.hardCount}
                color="bg-red-500"
                total={profile.problemsSolved}
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Link
                to="/leaderboard"
                className="w-full inline-block text-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-300 transition-colors"
              >
                View in Campus Leaderboard →
              </Link>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <CodeChefFooter />

    </div>
  )
}

function DiffBar({ label, count, color, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900">{count} solved ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
