import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CodeChefFooter from '../components/CodeChefFooter'
import api from '../api/axios'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showHiredBanner, setShowHiredBanner] = useState(true)

  const [activeAssessments, setActiveAssessments] = useState([])

  const isStudent = user?.role === 'USER' || (!user?.role?.includes('ADMIN'))

  // Redirect to login if not authenticated & fetch active college assessments for students
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Fetch active practical assessments for student accounts matching their university
    if (isStudent && user?.collegeName) {
      api.get(`/college/assessments?college=${encodeURIComponent(user.collegeName)}`)
        .then(({ data }) => {
          if (Array.isArray(data) && data.length > 0) {
            setActiveAssessments(data)
          } else {
            const norm = user.collegeName.toLowerCase()
            if (norm.includes('iit') || norm.includes('delhi')) {
              setActiveAssessments([
                {
                  id: 3,
                  assessmentName: 'COL106: Data Structures & Algorithms Lab Evaluation',
                  cohort: 'IITD B.Tech CSE 2026 Batch',
                  collegeName: 'IIT Delhi',
                  syllabus: 'Balanced Trees::Heaps::Trie::Graph Algorithms',
                  durationHours: 2,
                  durationMins: 30,
                  status: 'ACTIVE',
                }
              ])
            } else {
              setActiveAssessments([
                {
                  id: 1,
                  assessmentName: 'Mid-Sem DSA Lab Practical: Binary Trees & Graphs',
                  cohort: 'CSE 3rd Year - Section A (2026 Batch)',
                  collegeName: 'Delhi Technological University (DTU)',
                  syllabus: 'Binary Trees::DFS::BFS::Shortest Path',
                  durationHours: 2,
                  durationMins: 0,
                  status: 'ACTIVE',
                }
              ])
            }
          }
        })
        .catch(() => {
          const norm = user.collegeName.toLowerCase()
          if (norm.includes('iit') || norm.includes('delhi')) {
            setActiveAssessments([
              {
                id: 3,
                assessmentName: 'COL106: Data Structures & Algorithms Lab Evaluation',
                cohort: 'IITD B.Tech CSE 2026 Batch',
                collegeName: 'IIT Delhi',
                syllabus: 'Balanced Trees::Heaps::Trie::Graph Algorithms',
                durationHours: 2,
                durationMins: 30,
                status: 'ACTIVE',
              }
            ])
          } else {
            setActiveAssessments([
              {
                id: 1,
                assessmentName: 'Mid-Sem DSA Lab Practical: Binary Trees & Graphs',
                cohort: 'CSE 3rd Year - Section A (2026 Batch)',
                collegeName: 'Delhi Technological University (DTU)',
                syllabus: 'Binary Trees::DFS::BFS::Shortest Path',
                durationHours: 2,
                durationMins: 0,
                status: 'ACTIVE',
              }
            ])
          }
        })
    } else {
      setActiveAssessments([])
    }
  }, [isAuthenticated, navigate, isStudent, user?.collegeName])

  // Compute greeting based on local time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const username = user?.username || 'Chef'
  const collegeName = user?.collegeName || 'Institutional Campus'

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* MAIN DASHBOARD 2-COLUMN LAYOUT (Screenshots 1 - 4)                */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: Main Learning Feed (8 cols)                       */}
          {/* ────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Greeting Banner (Screenshot 1) */}
            <div className="bg-[#112446] text-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="text-4xl select-none">
                👋
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {greeting} {username}
                </h1>
                <p className="text-xs sm:text-sm text-blue-200/90 mt-1">
                  Welcome back to ByteForge, continue your journey
                </p>
              </div>
            </div>

            {/* 1.5 ACTIVE COLLEGE ASSESSMENT & LAB PRACTICAL CARD (ONLY for enrolled students) */}
            {isStudent && activeAssessments.length > 0 && (
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/40 text-white p-5 rounded-2xl shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏛️</span>
                    <span className="text-xs font-bold text-blue-300 font-mono uppercase tracking-wider">
                      {activeAssessments[0]?.collegeName || user?.collegeName || 'Institutional'} Chapter Lab Practical
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-300 bg-green-950/80 border border-green-700/60 px-2 py-0.5 rounded-full font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live Exam Active
                    </span>
                    <Link
                      to="/assessments"
                      className="text-xs text-blue-300 hover:text-white font-bold underline transition"
                    >
                      View All Practicals →
                    </Link>
                  </div>
                </div>

                {activeAssessments.slice(0, 1).map((a) => (
                  <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-white">{a.assessmentName}</h3>
                      <p className="text-xs text-blue-200/90">
                        Cohort: <span className="text-white font-medium">{a.cohort}</span> • Syllabus: <span className="text-blue-300 font-mono">{a.syllabus}</span>
                      </p>
                      <p className="text-[11px] text-gray-300">
                        ⏱ Duration: {a.durationDays > 0 && `${a.durationDays}d `}{a.durationHours}h {a.durationMins}m • 🛡️ Browser Proctoring Enabled
                      </p>
                    </div>

                    <Link
                      to={`/assessments/${a.id}`}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 flex-shrink-0"
                    >
                      <span>▶</span>
                      <span>Enter Lab Practical</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* 1.6 FACULTY COORDINATOR BANNER (ONLY for faculty mentors) */}
            {user?.role === 'FACULTY_ADMIN' && (
              <div className="bg-gradient-to-r from-[#1e293b] via-[#24334d] to-[#1e293b] border border-blue-500/30 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    🏛️
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Institutional Faculty Workspace</h3>
                    <p className="text-xs text-gray-300">
                      Manage student cohorts, author lab exams, and download grade sheets for {collegeName}.
                    </p>
                  </div>
                </div>
                <Link
                  to="/university/dashboard"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs flex-shrink-0 text-center"
                >
                  Open Faculty Portal →
                </Link>
              </div>
            )}

            {/* 2. 'Want to get Hired?' Promo Banner (Screenshot 1) */}
            {showHiredBanner && (
              <div className="bg-gradient-to-r from-[#1c2d4a] via-[#1f385c] to-[#15233c] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="h-10 w-10 bg-[#f9735b]/20 text-[#f9735b] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    💼
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">Want to get Hired?</h3>
                    <p className="text-xs text-gray-300">Upload your CV and unlock job opportunities</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <button
                    onClick={() => alert('CV upload & recruiter portal.')}
                    className="bg-[#f9735b] hover:bg-[#ea5d44] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
                  >
                    Complete Now →
                  </button>
                  <button
                    onClick={() => setShowHiredBanner(false)}
                    className="text-gray-400 hover:text-white text-sm p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* 3. Featured course of the month (Screenshot 1) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🚀</span>
                <h2 className="text-sm font-bold text-gray-800">Featured course of the month</h2>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  New Course
                </span>
              </div>

              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 bg-blue-50 border border-blue-200 rounded-xl flex flex-col items-center justify-center p-1 text-center flex-shrink-0">
                    <span className="text-[10px] font-black text-blue-800">LLD</span>
                    <span className="text-[8px] text-gray-500">LOW-LEVEL DESIGN</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-gray-900">Practice LLD</h3>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
                      Strengthen your Low-Level Design (LLD) skills through interactive MCQs, short-answer questions, and hands-on Java coding projects. Practice object-oriented design, UML, Clean Code, SOLID principles, and Design Patterns.
                    </p>
                  </div>
                </div>

                <Link
                  to="/problems"
                  className="bg-[#2f66d4] hover:bg-[#2554b5] text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors flex-shrink-0"
                >
                  Start
                </Link>
              </div>
            </div>

            {/* 4. Continue your Roadmap (Screenshot 2) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🚩</span>
                <h2 className="text-sm font-bold text-gray-800">Continue your Roadmap</h2>
              </div>

              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                {/* Roadmap Header */}
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 bg-amber-100 border border-amber-300 rounded-xl flex items-center justify-center text-amber-800 font-bold text-sm shadow-2xs flex-shrink-0">
                    5★
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">
                      Competitive Programming roadmap - Become 5 star
                    </h3>
                    <p className="text-xs font-bold text-green-600 mt-0.5">0% Completed</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                      <span>🎓 7 courses</span>
                      <span>⏱ 12 months</span>
                      <span>💡 761 Problems</span>
                    </div>
                  </div>
                </div>

                {/* Submodule Card */}
                <div className="border border-gray-100 bg-[#f8fafc] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-base">
                      🍽️
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">500 to 1000 difficulty problems</h4>
                      <p className="text-[11px] text-gray-500">Current Module: 500 to 800 difficulty rating problems</p>
                    </div>
                  </div>

                  <Link
                    to="/problems"
                    className="bg-[#2f66d4] hover:bg-[#2554b5] text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors flex-shrink-0"
                  >
                    Resume
                  </Link>
                </div>

                {/* Bottom link */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                  <span className="text-gray-500">6 courses more in the roadmap</span>
                  <Link to="/problems" className="text-[#2f66d4] hover:underline font-bold">
                    View Roadmap →
                  </Link>
                </div>
              </div>
            </div>

            {/* 5. Roadmap Recommended for you (Screenshot 2 & 3) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">⭐</span>
                <h2 className="text-sm font-bold text-gray-800">Roadmap Recommended for you</h2>
              </div>

              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700 text-lg flex-shrink-0">
                    🌐
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">
                      Learn Data Structures and Algorithms - Roadmap
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                      <span>🎓 24 courses</span>
                      <span>⏱ 12 months</span>
                      <span>💡 815 Problems</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/problems"
                  className="bg-[#2f66d4] hover:bg-[#2554b5] text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors flex-shrink-0"
                >
                  Start
                </Link>
              </div>
            </div>

            {/* 6. Compete (Rated Contests) (Screenshot 3 & 4) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🏆</span>
                <h2 className="text-sm font-bold text-gray-800">Compete</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contest 1 */}
                <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">🏆</span>
                      <span className="text-gray-400 hover:text-gray-600 cursor-pointer">🔔</span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 mt-3">DSAMONDAY018</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Monday Munch - DSA Challenge 018 (Rated)</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <span className="text-gray-500 text-[11px]">Starts in ⏱ 3 Days 3 Hrs</span>
                    <Link
                      to="/leaderboard"
                      className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
                    >
                      View Contest
                    </Link>
                  </div>
                </div>

                {/* Contest 2 */}
                <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">🏆</span>
                      <span className="text-gray-400 hover:text-gray-600 cursor-pointer">🔔</span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 mt-3">START254D</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Starters 254 (Rated for Div 2, 3 &amp; 4)</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <span className="text-gray-500 text-[11px]">Starts in ⏱ 5 Days 4 Hrs</span>
                    <Link
                      to="/leaderboard"
                      className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
                    >
                      View Contest
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ────────────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN: Sidebar Widgets (4 cols)                         */}
          {/* ────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Complete your profile alert (Screenshot 1) */}
            <div className="bg-white border border-orange-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700">
                <span>⚠️</span>
                <span>Complete your profile</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Verify your mobile number in seconds to unlock exclusive benefits and stay updated with your learning progress.
              </p>
              <button
                onClick={() => alert('Profile verification modal.')}
                className="text-xs font-bold text-orange-700 hover:bg-orange-50 border border-orange-300 px-4 py-1.5 rounded-lg transition-colors"
              >
                Verify now
              </button>
            </div>

            {/* 2. Coding Streak Flame / Kitchen Flame (Screenshot 1 & 2) */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs text-center space-y-4">
              {/* Firewood / Kitchen Flame graphic */}
              <div className="py-2">
                <div className="text-4xl filter drop-shadow-xs">🪵</div>
                <h3 className="text-lg font-bold text-gray-900 mt-2">0 / 5 days</h3>
                <div className="w-full bg-gray-100 rounded-full h-1.5 my-2">
                  <div className="bg-amber-500 h-1.5 rounded-full w-0" />
                </div>
                <p className="text-[11px] text-gray-500">
                  Start your coding streak. Ignite the kitchen flame!
                </p>
              </div>

              {/* Gem Badges */}
              <div className="flex items-center justify-center gap-3 text-lg opacity-80">
                <span>💎</span>
                <span>🪙</span>
                <span>💠</span>
                <span>🔶</span>
              </div>

              {/* Weekly Calendar */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs pt-2 border-t border-gray-100">
                <span className="text-gray-400 text-[10px]">S</span>
                <span className="text-gray-400 text-[10px]">S</span>
                <span className="text-gray-400 text-[10px]">M</span>
                <span className="text-gray-400 text-[10px]">T</span>
                <span className="text-gray-400 text-[10px]">W</span>
                <span className="text-gray-400 text-[10px]">T</span>
                <span className="text-gray-400 text-[10px]">F</span>

                <span className="py-1 text-gray-600 font-semibold">22</span>
                <span className="py-1 text-gray-600 font-semibold">23</span>
                <span className="py-1 text-gray-600 font-semibold">24</span>
                <span className="py-1 text-gray-600 font-semibold">25</span>
                <span className="py-1 text-gray-600 font-semibold">26</span>
                <span className="py-1 text-gray-600 font-semibold">27</span>
                <span className="py-1 bg-amber-50 border border-amber-300 rounded-full text-amber-900 font-bold">28</span>
              </div>

              <a href="#streak" onClick={(e) => { e.preventDefault(); alert('Coding streaks keep your daily discipline alive!'); }} className="text-[#2f66d4] hover:underline text-xs font-semibold block pt-1">
                What is a streak flame?
              </a>
            </div>

            {/* 3. Your weekly leaderboard (Screenshot 2) */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-100 border border-gray-300 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                🛡️🔒
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs text-gray-900">Your weekly leaderboard!</h3>
                <p className="text-[11px] text-gray-500">Compete with peers to earn XP points. Stay ahead in learning.</p>
                <Link to="/leaderboard" className="text-[#2f66d4] hover:underline font-bold text-xs inline-block">
                  Start learning today →
                </Link>
              </div>
            </div>

            {/* 4. Manage Bookmarks (Screenshot 2 & 3) */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold text-gray-900">Manage Bookmarks</h3>
                <Link to="/problems" className="text-[#2f66d4] hover:underline font-semibold text-[11px]">View all</Link>
              </div>
              <p className="text-xs text-gray-500">You have not bookmarked any problem yet.</p>
              <a href="#know" onClick={(e) => { e.preventDefault(); alert('Bookmark tricky problems to review them later.'); }} className="text-[#2f66d4] hover:underline text-xs font-semibold inline-block">
                Know more
              </a>
            </div>

            {/* 5. Explore Our Blogs (Screenshot 3) */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold text-gray-900">Explore Our Blogs Today</h3>
                <Link to="/problems" className="text-[#2f66d4] hover:underline font-semibold text-[11px]">View all</Link>
              </div>
              <p className="text-xs text-gray-500">
                Read blogs about various topics in programming. Get expert guidance from ByteForge on coding.
              </p>
            </div>

            {/* 6. Community Discussion (Screenshot 3) */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs text-center space-y-3">
              <div className="flex justify-center -space-x-1 overflow-hidden">
                <span className="inline-block h-6 w-6 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center font-bold">A</span>
                <span className="inline-block h-6 w-6 rounded-full bg-green-500 text-[10px] text-white flex items-center justify-center font-bold">R</span>
                <span className="inline-block h-6 w-6 rounded-full bg-amber-500 text-[10px] text-white flex items-center justify-center font-bold">K</span>
              </div>
              <h3 className="font-bold text-xs text-gray-900">Community Discussion</h3>
              <p className="text-xs text-gray-500">Got a topic of discussion? Discuss in Community!</p>
              <button
                onClick={() => alert('Discussion forum modal.')}
                className="w-full bg-[#edf2fe] hover:bg-[#e2ecfe] text-[#2f66d4] font-bold text-xs py-2 rounded-lg transition-colors"
              >
                + Create new topic
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Floating Chat Bubble Widget (Screenshot 4) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => alert('ByteForge Support Chatbot')}
          className="h-12 w-12 bg-[#5b4638] hover:bg-[#4d3a2e] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform text-xl"
          title="ByteForge Help"
        >
          💬
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* FOOTER                                                             */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <CodeChefFooter />

    </div>
  )
}
