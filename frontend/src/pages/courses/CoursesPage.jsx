import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CodeChefFooter from '../../components/CodeChefFooter'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/courses')
      .then(({ data }) => setCourses(data))
      .catch((err) => console.error('Failed to load courses', err))
      .finally(() => setLoading(false))
  }, [])

  const filteredCourses = courses.filter((c) => {
    if (activeCategory === 'ALL') return true
    return c.category === activeCategory
  })

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 1. HERO HEADER                                                   */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#112446] via-[#1c3563] to-[#0f1f3d] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#5b4638] text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase">
              <span>📚</span> ByteForge Academy
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Structured Programming &amp; DSA Career Tracks
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl">
              Step-by-step interactive coding curriculums designed to take you from total beginner to 3★+ competitive programmer and crack tech company coding rounds.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 relative z-10">
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-lg font-black text-amber-400">4.9 ★</span>
              <span className="text-[10px] text-blue-200">65,000+ Enrolled</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-lg font-black text-emerald-400">100% Free</span>
              <span className="text-[10px] text-blue-200">Interactive IDE Labs</span>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 2. CATEGORY FILTER TABS                                          */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-4 border-b border-gray-200 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all relative flex-shrink-0 ${
              activeCategory === 'ALL'
                ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Tracks ({courses.length})
          </button>

          <button
            onClick={() => setActiveCategory('LANGUAGE')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all relative flex-shrink-0 ${
              activeCategory === 'LANGUAGE'
                ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Core Languages (C / Java)
          </button>

          <button
            onClick={() => setActiveCategory('DSA_ROADMAP')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all relative flex-shrink-0 ${
              activeCategory === 'DSA_ROADMAP'
                ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Competitive DSA Roadmaps (1★ to 5★)
          </button>
        </div>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 3. COURSES GRID                                                  */}
        {/* ──────────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-200 hover:border-blue-500 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  {/* Top Metadata Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        c.level === 'BEGINNER'
                          ? 'bg-green-100 text-green-800'
                          : c.level === 'INTERMEDIATE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {c.level}
                    </span>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <span>★</span>
                      <span className="text-gray-900">{c.rating}</span>
                      <span className="text-gray-400 font-normal">({c.enrolledCount.toLocaleString()} enrolled)</span>
                    </div>
                  </div>

                  {/* Course Title & Description */}
                  <div>
                    <h2 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                      {c.title}
                    </h2>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  {/* Skills / Topics Chips */}
                  {c.roadmapTopics && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.roadmapTopics.split('::').slice(0, 4).map((topic) => (
                        <span
                          key={topic}
                          className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-md font-mono"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Footer with Lesson Counts & Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="text-[11px] text-gray-500 font-mono space-y-0.5">
                    <div>📖 <strong>{c.modulesCount} Modules</strong> • {c.lessonsCount} Lessons</div>
                    <div>⚡ <strong>{c.practiceProblemsCount} Interactive Coding Labs</strong></div>
                  </div>

                  <Link
                    to={`/courses/${c.slug}`}
                    className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-xs flex-shrink-0 flex items-center gap-1.5"
                  >
                    <span>Start Track</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <CodeChefFooter />
    </div>
  )
}
