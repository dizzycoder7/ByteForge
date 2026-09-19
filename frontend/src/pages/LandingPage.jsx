import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-blue-100">
      
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION WITH BLUE NOTEBOOK GRID PATTERN (Screenshot 1)          */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-10 pb-20 px-4 sm:px-6 lg:px-8 codechef-grid-bg border-b border-blue-100/60">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          {/* Avatar stack + { Trusted by 5M+ developers } badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="flex -space-x-1.5 overflow-hidden">
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"
                alt="user1"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces"
                alt="user2"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=64&h=64&fit=crop&crop=faces"
                alt="user3"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces"
                alt="user4"
              />
            </div>
            <span className="text-[13px] font-semibold text-[#5b4638] font-mono">
              &#123; Trusted by 5M+ developers &#125;
            </span>
          </div>

          {/* Master Programming Subtitle */}
          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-extrabold text-[#1f2937] tracking-tight mb-2">
            Master Programming with ByteChef
          </h2>

          {/* Main Huge Blue Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-[68px] font-black text-[#3b6fc2] tracking-tight leading-tight mb-5">
            Bored of Theory? Let&apos;s Code for Real
          </h1>

          {/* Subtexts */}
          <p className="text-[15px] sm:text-[16px] text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Join 5M+ students building projects, cracking contests, and landing internships.
          </p>
          <p className="text-[14px] sm:text-[15px] font-bold text-gray-800 mt-1 mb-8">
            Kickstart Your Coding Journey — No Boring Lectures, Just Real Practice!
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 bg-[#3169d2] hover:bg-[#2556b3] text-white font-bold px-7 py-3 rounded-lg shadow-sm hover:shadow transition-all text-sm"
            >
              <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Sign in</span>
            </Link>

            <Link
              to="/problems"
              className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-800 font-bold px-7 py-3 rounded-lg border border-gray-300/90 shadow-xs hover:border-gray-400 transition-all text-sm"
            >
              <span>Explore Courses</span>
            </Link>
          </div>

          {/* INTERACTIVE LEARNING CARD SHOWCASE */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xl overflow-hidden text-left max-w-5xl mx-auto">
            <div className="bg-[#f8fafc] px-6 py-3 border-b border-gray-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-gray-700">
                <span>🚩 This path is a part of <strong className="text-gray-900">Python with Beginner DSA ⚡</strong></span>
              </div>
              <Link to="/problems" className="text-blue-600 hover:underline font-bold text-xs">
                View Roadmap →
              </Link>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white">
              <div className="md:col-span-7 space-y-4">
                <div className="bg-gradient-to-r from-[#173059] via-[#1c3a6b] to-[#20437d] text-white p-5 rounded-xl shadow-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-[#f7c948] rounded-lg flex items-center justify-center text-xl shadow-xs flex-shrink-0">
                        🐍
                      </div>
                      <div>
                        <h3 className="font-bold text-[17px] text-white leading-snug">Learn Python Programming</h3>
                        <p className="text-[11px] text-blue-100/80 mt-1 leading-relaxed">
                          Learn Python 3 programming language within a month using our practical course. Understand the basic syntax of Python using our online tutorial. Prepare for a future in data science, AI and ML.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-blue-100 font-medium">
                        🎖️ Certification Available
                      </span>
                      <span className="text-[10px] bg-amber-400 text-gray-900 px-2 py-0.5 rounded font-bold">
                        ★ 4.6 (71.8k+)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-blue-200 mt-4 pt-3 border-t border-blue-300/20 font-medium flex-wrap">
                    <span>📖 37 Lessons</span>
                    <span>⏱ 10 Hours</span>
                    <span>🧩 240 Problems</span>
                    <span>👥 281.2k Learners</span>
                    <span>📈 Beginner Level</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4 pt-1">
                    <div className="text-[11px] text-blue-100 flex items-center gap-2">
                      <span>🚩 Your Progress : <strong className="text-white">0% Completed</strong></span>
                    </div>
                    <Link
                      to="/problems"
                      className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs"
                    >
                      Start Learning
                    </Link>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold flex items-center justify-center">1</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Output / Print in Python</h4>
                      <p className="text-[11px] text-gray-500">Learn how to make Python print whatever you want, and learn to use it as a basic calculator.</p>
                    </div>
                  </div>

                  <div className="space-y-2 pl-8 pt-1 text-xs text-gray-700">
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-300" />
                        <span>Introducing output / printing</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded font-semibold">Lesson</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-300" />
                        <span>Printing on multiple lines</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded font-semibold">Lesson</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-300" />
                        <span>Print text and numbers using single print</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded font-semibold">Lesson</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        <span>Module test: Output / print in python</span>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-semibold">Test</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                <div className="border border-gray-200 rounded-xl p-5 bg-[#fafbfc] text-center shadow-2xs flex flex-col items-center">
                  <div className="h-12 w-12 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center text-2xl shadow-xs mb-3">
                    🏅
                  </div>
                  <h4 className="text-xs font-bold text-gray-800">Certificate on Completion</h4>
                  <div className="w-full bg-white border border-gray-200 rounded p-2.5 my-2.5 space-y-1.5 text-left opacity-75">
                    <div className="h-1.5 bg-gray-300 rounded w-3/4" />
                    <div className="h-1.5 bg-gray-200 rounded w-1/2" />
                    <div className="flex justify-between pt-2">
                      <div className="h-2 w-12 bg-blue-300 rounded" />
                      <div className="h-2 w-12 bg-gray-300 rounded" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    <strong className="text-gray-800">Certification available:</strong> Included in premium. On Completing all the lessons in this course, you&apos;ll get a course completion certificate.
                  </p>
                </div>

                <div className="border border-blue-100 bg-[#f8fbff] rounded-xl p-4 text-left relative">
                  <span className="text-blue-500 font-serif text-3xl font-black leading-none block mb-1">“</span>
                  <p className="text-xs text-gray-700 leading-relaxed italic">
                    The step-by-step process is great for learning, and the explanations help me understand the lessons better. Additionally, the email notifications are excellent reminders to keep me on track.
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-100/80">
                    <span className="text-base">🇵🇭</span>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Ed Site</p>
                      <p className="text-[10px] text-gray-500">Student</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 2. DELIVERING JOB READY DEVELOPERS (Screenshots 2 & 3)                    */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 border-b border-gray-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-1">
            Delivering job ready developers
          </h3>
          <p className="text-xs text-gray-500 mb-10">
            Companies where our course graduates are working
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-14 text-gray-700">
            <div className="flex items-center font-black tracking-tight text-xl text-gray-900">
              amazon<span className="text-amber-500 text-xs ml-0.5">smile</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-base text-gray-700">
              <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                <div className="bg-[#f25022]" />
                <div className="bg-[#7fba00]" />
                <div className="bg-[#00a4ef]" />
                <div className="bg-[#ffb900]" />
              </div>
              <span>Microsoft</span>
            </div>
            <div className="font-extrabold tracking-widest text-[#f80000] text-lg font-sans">
              ORACLE
            </div>
            <div className="font-black text-[#007db8] text-xl tracking-tighter">
              DELL
            </div>
            <div className="font-black text-2xl text-black">
              𝕏
            </div>
            <div className="font-black text-[#006699] text-xl tracking-widest font-mono">
              IBM
            </div>
            <div className="font-bold text-[#005073] text-base tracking-wider">
              CISCO
            </div>
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#eb001b]" />
                <div className="w-4 h-4 rounded-full bg-[#f79e1b] opacity-80" />
              </div>
              <span className="font-semibold text-xs text-gray-800">mastercard</span>
            </div>
            <div className="font-black text-[#034ea2] text-lg tracking-wider">
              SAMSUNG
            </div>
            <div className="font-bold text-[#76b900] text-base tracking-tight">
              NVIDIA
            </div>
            <div className="font-bold text-base text-gray-800">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </div>
            <div className="font-black text-[#3253dc] text-base tracking-tight">
              Qualcomm
            </div>
            <div className="font-bold text-[#0668e1] text-base">
              ∞ Meta
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 3. FEATURED COURSES SECTION (Screenshots 3 & 4)                           */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm mb-3">
            <span className="text-xl">🏷️</span>
            <span className="text-2xl sm:text-3xl text-gray-900 font-extrabold">Featured Courses</span>
            <span className="text-xl">🏷️</span>
          </div>

          <p className="text-sm font-semibold text-gray-700">
            Courses That Actually Help You Land Internships and Jobs
          </p>
          <p className="text-xs text-gray-400 mt-1">
            From Python basics to 5 star CP prep — built for students, tested by recruiter
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Card 1: Python */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div className="h-44 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] p-4 text-white relative flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-base">🐍</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces"
                alt="student"
                className="absolute right-0 bottom-0 h-36 w-32 object-cover opacity-90 rounded-tl-xl"
              />
              <div className="relative z-10">
                <span className="text-[11px] font-black uppercase tracking-wider text-white block">
                  PYTHON FOR BEGINNERS
                </span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-1.5">
                  <span>★</span>
                  <span className="text-gray-700">4.6 (103.4k+)</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">
                  Python with Beginner DSA
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  Learn the basics of Python and data structures. Use practice modules to boost your coding and...
                </p>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100 font-medium">
                  <span>📖 6 courses</span>
                  <span>👥 451k+ learners</span>
                </div>
              </div>
              <Link
                to="/problems"
                className="w-full py-2.5 text-center text-white font-bold text-xs bg-[#2f66d4] hover:bg-[#2554b5] rounded-lg transition-colors"
              >
                Enrol now
              </Link>
            </div>
          </div>

          {/* Card 2: DSA */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div className="h-44 bg-gradient-to-br from-[#065f46] to-[#022c22] p-4 text-white relative flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-base">⚡</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces"
                alt="student"
                className="absolute right-0 bottom-0 h-36 w-32 object-cover opacity-90 rounded-tl-xl"
              />
              <div className="relative z-10">
                <span className="text-[11px] font-black uppercase tracking-wider text-white block">
                  DATA STRUCTURE & ALGO MASTERY
                </span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-1.5">
                  <span>★</span>
                  <span className="text-gray-700">4.6 (72.9k+)</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">
                  Learn Data Structures and...
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  Learn and Practice problems on data structures and algorithms like Linked Lists, Stacks, Queues...
                </p>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100 font-medium">
                  <span>📖 23 courses</span>
                  <span>👥 125k+ learners</span>
                </div>
              </div>
              <Link
                to="/problems"
                className="w-full py-2.5 text-center text-white font-bold text-xs bg-[#2f66d4] hover:bg-[#2554b5] rounded-lg transition-colors"
              >
                Enrol now
              </Link>
            </div>
          </div>

          {/* Card 3: React */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div className="h-44 bg-gradient-to-br from-[#064e3b] to-[#042f2e] p-4 text-white relative flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-base">⚛️</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces"
                alt="student"
                className="absolute right-0 bottom-0 h-36 w-32 object-cover opacity-90 rounded-tl-xl"
              />
              <div className="relative z-10">
                <span className="text-[11px] font-black uppercase tracking-wider text-white block">
                  REACT FOR WEB DEVELOPMENT
                </span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-1.5">
                  <span>★</span>
                  <span className="text-gray-700">4.7 (94k+)</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">
                  React JS for Front-end...
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  Start with the fundamentals—learn to build dynamic interfaces using JSX, components, and...
                </p>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100 font-medium">
                  <span>📖 4 courses</span>
                  <span>👥 178k+ learners</span>
                </div>
              </div>
              <Link
                to="/problems"
                className="w-full py-2.5 text-center text-white font-bold text-xs bg-[#2f66d4] hover:bg-[#2554b5] rounded-lg transition-colors"
              >
                Enrol now
              </Link>
            </div>
          </div>

          {/* Card 4: Java */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div className="h-44 bg-gradient-to-br from-[#881337] to-[#4c0519] p-4 text-white relative flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-base">☕</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces"
                alt="student"
                className="absolute right-0 bottom-0 h-36 w-32 object-cover opacity-90 rounded-tl-xl"
              />
              <div className="relative z-10">
                <span className="text-[11px] font-black uppercase tracking-wider text-white block">
                  JAVA WITH BEGINNER DSA
                </span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-1.5">
                  <span>★</span>
                  <span className="text-gray-700">4.6 (784k+)</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">
                  Java with Beginner DSA...
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  Master core Java programming and practice on data structures and algorithms...
                </p>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100 font-medium">
                  <span>📖 6 courses</span>
                  <span>👥 520k+ learners</span>
                </div>
              </div>
              <Link
                to="/problems"
                className="w-full py-2.5 text-center text-white font-bold text-xs bg-[#2f66d4] hover:bg-[#2554b5] rounded-lg transition-colors"
              >
                Enrol now
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 space-y-3">
          <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Each course gives you a clear snapshot — Watch a quick preview, read a short description, see ratings, and check how many students are enrolled. Click &ldquo;Enrol Now&rdquo; to jump in, or browse all available courses
          </p>
          <div>
            <Link to="/problems" className="text-[#2f66d4] hover:underline font-bold text-xs">
              &lt;&lt; Explore all &gt;&gt;
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 4. FEATURES THAT DRIVE OUR LEARNING (6 CARDS + CHEF HAND - Image 1)      */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f0f6ff] border-t border-blue-100 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Heading, Subtitle, Get Started + Chef OK Hand */}
          <div className="lg:col-span-5 space-y-6 text-left relative">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                <span className="relative inline-block px-2">
                  Features
                  <svg className="absolute -inset-1.5 w-full h-full text-amber-500 -rotate-1 pointer-events-none" viewBox="0 0 100 40" fill="none" preserveAspectRatio="none">
                    <ellipse cx="50" cy="20" rx="48" ry="17" stroke="#f59e0b" strokeWidth="2.5" />
                  </svg>
                </span>{' '}
                that drive our learning programs
              </h2>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Try Before You Buy, Experience premium courses for free before committing.
            </p>

            <div>
              <Link
                to="/register"
                className="inline-block bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-sm px-7 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Chef OK Hand Sign (👌 Illustration from screenshot 1) */}
            <div className="pt-8 hidden sm:block">
              <div className="text-7xl transform -rotate-12 filter drop-shadow-md select-none">
                👌
              </div>
            </div>
          </div>

          {/* Right Column: 6 Staggered Floating White Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Card 1: AI Mentor Support */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all -rotate-1 hover:rotate-0">
              <div className="text-2xl mb-2 text-blue-600">✨</div>
              <h4 className="font-bold text-sm text-gray-900 mb-1.5">AI Mentor Support</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Stuck on a problem? Get instant help with clear, step-by-step guidance.
              </p>
            </div>

            {/* Card 2: Job-Ready Courses */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all rotate-1 hover:rotate-0">
              <div className="text-2xl mb-2 text-indigo-600">&lt;/&gt;</div>
              <h4 className="font-bold text-sm text-gray-900 mb-1.5">Job-Ready Courses</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Learn the most in-demand tech, such as Python, Java, DSA, AI/ML, and more, built with industry input
              </p>
            </div>

            {/* Card 3: Practice Made Simple */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all rotate-1 hover:rotate-0">
              <div className="text-2xl mb-2 text-blue-500">📊</div>
              <h4 className="font-bold text-sm text-gray-900 mb-1.5">Practice Made Simple</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Solve real coding problems, sorted by difficulty. Practice what actually gets asked.
              </p>
            </div>

            {/* Card 4: Industry Certificates */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all -rotate-1 hover:rotate-0">
              <div className="text-2xl mb-2 text-blue-600">📜</div>
              <h4 className="font-bold text-sm text-gray-900 mb-1.5">Industry Certificates</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Earn certificates that add weight to your resume.
              </p>
            </div>

            {/* Card 5: Built-In Compiler */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all -rotate-1 hover:rotate-0">
              <div className="text-2xl mb-2 text-blue-600">🎖️</div>
              <h4 className="font-bold text-sm text-gray-900 mb-1.5">Built-In Compiler</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Code, test, and debug right in your browser. No setup needed.
              </p>
            </div>

            {/* Card 6: Global Coding Contests */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all rotate-1 hover:rotate-0">
              <div className="text-2xl mb-2 text-blue-600">🏆</div>
              <h4 className="font-bold text-sm text-gray-900 mb-1.5">Global Coding Contests</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Compete, climb leaderboards, and get noticed by top recruiters.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 5. AI MENTOR SECTION (Screenshot 2)                                      */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Left: Illustration Card (Robot + Coder Boy) */}
          <div className="md:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-[#eaf4fe] border border-blue-200/60 rounded-3xl p-8 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
              {/* Decorative badges */}
              <div className="absolute top-6 left-6 bg-white text-blue-700 font-mono text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                &lt;/&gt;
              </div>
              <div className="absolute top-6 right-6 bg-white text-blue-700 font-mono text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                &#123;...&#125;
              </div>

              {/* Friendly Robot & Boy Graphic */}
              <div className="my-8 flex items-center justify-center gap-4 text-7xl select-none">
                <span className="transform hover:scale-110 transition-transform">🤖</span>
                <span className="text-2xl text-blue-400">⚡</span>
                <span className="transform hover:scale-110 transition-transform">🧑‍💻</span>
              </div>

              <div className="bg-white/90 backdrop-blur-xs border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-900 font-semibold shadow-xs">
                💡 Instant Step-by-Step AI Solutions
              </div>
            </div>
          </div>

          {/* Right: AI Mentor Content */}
          <div className="md:col-span-6 space-y-5 text-left">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
              AI mentor
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-black text-gray-900 leading-snug">
              Your Personal AI Tutor : Solve Problems Instantly
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              Get step-by-step explanations, debugging help, and personalized learning guidance from our AI-powered assistant.
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-900 border-b-2 border-gray-900 inline-block pb-0.5 mb-4">
                How It Works
              </h4>

              <div className="space-y-3 text-xs text-gray-700 font-medium">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-amber-400 text-gray-900 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <span>Ask a coding-related question.</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-amber-400 text-gray-900 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <span>Get instant solutions &amp; explanations.</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-amber-400 text-gray-900 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <span>Debug and optimize your code in real time..</span>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Link
                to="/problems"
                className="inline-block bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-6 py-3 rounded-lg shadow-xs transition-all"
              >
                Ask AI Mentor
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 6. REAL WORLD PROJECTS SECTION (Screenshot 3)                            */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Left: Pale Yellow Project Showcase Card */}
          <div className="md:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-[#fef9c3]/60 border border-yellow-200 rounded-3xl p-8 shadow-xs flex flex-col items-center text-center">
              <h3 className="text-sm font-bold text-gray-800 mb-6">Build Real World Projects</h3>

              {/* Developer at multi-monitor desk illustration */}
              <div className="my-6 flex flex-col items-center text-center">
                <div className="flex gap-3 text-4xl mb-3">
                  <span>🖥️</span>
                  <span>💻</span>
                  <span>🖥️</span>
                </div>
                <div className="text-5xl">🧑‍💻</div>
                <div className="text-xs text-gray-500 font-mono mt-2">cat on desk 🐱</div>
              </div>

              <div className="bg-white border border-yellow-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-800 shadow-2xs">
                Full-Stack &amp; DSA Applications
              </div>
            </div>
          </div>

          {/* Right: Real World Projects Content */}
          <div className="md:col-span-6 space-y-5 text-left">
            <span className="text-xs font-bold text-[#ef4444] uppercase tracking-widest block">
              Real World projects
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-black text-gray-900 leading-snug">
              Build Real World Projects
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              Work on hands-on projects that reflect real industry challenges
            </p>

            <div className="space-y-3 text-xs text-gray-700 font-medium pt-2">
              <div className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  ✓
                </span>
                <span>Solve real problems with projects.</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  ✓
                </span>
                <span>Explore projects in full stack development and data science.</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  ✓
                </span>
                <span>Gain practical, job-ready skills.</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                to="/problems"
                className="inline-block bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-6 py-3 rounded-lg shadow-xs transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 7. CODING CONTESTS SECTION (Screenshot 4)                                */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Left: Coding Contests Content */}
          <div className="md:col-span-6 space-y-5 text-left order-2 md:order-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
              Coding Contests
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-black text-gray-900 leading-snug">
              Show off what you&apos;ve got and learn from top coders worldwide.
            </h2>

            <div className="space-y-3 text-xs text-gray-700 font-medium pt-2">
              <div className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  ✓
                </span>
                <span>Join contests at global, national, and even college levels.</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  ✓
                </span>
                <span>Climb our leaderboards and showcase your success.</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  ✓
                </span>
                <span>Win rewards, certificates, and internship opportunities that add real value to your professional profile.</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                to="/leaderboard"
                className="inline-block bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-6 py-3 rounded-lg shadow-xs transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Right: Soft Coral Contest Card */}
          <div className="md:col-span-6 flex justify-center order-1 md:order-2">
            <div className="w-full max-w-md bg-[#fca5a5]/30 border border-red-200/80 rounded-3xl p-8 shadow-xs flex flex-col items-center text-center">
              <h3 className="text-sm font-bold text-gray-800 mb-6">
                Compete in Coding with top talents in the world
              </h3>

              <div className="my-6 flex items-center justify-center gap-4 text-6xl">
                <span>💻</span>
                <span>🏆</span>
                <span>🧑‍💻</span>
              </div>

              <div className="bg-white border border-red-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-800 shadow-2xs">
                Starters, Cook-Offs &amp; Div 1 - Div 4 Challenges
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 8. PARTNER WITH CODECHEF (Screenshot 5)                                  */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#fafbfc]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Left: Partner Content */}
          <div className="md:col-span-6 space-y-5 text-left">
            <div className="flex items-center gap-2 text-xl mb-1">
              <span>👨‍🍳</span>
              <span className="text-amber-500 font-bold">✳️</span>
              <span>🎓</span>
            </div>

            <span className="text-xs font-semibold text-gray-500 block">
              Partner with CodeChef
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-black text-gray-900 leading-snug">
              Are you an educator, an institution, or a University?
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              Join forces with CodeChef to bring structured coding programs, AI-enhanced learning, and global contests to your students. Empower them with the skills and certifications they need to move confidently from code to career.
            </p>

            <div className="pt-3">
              <Link
                to="/register"
                className="inline-block bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-6 py-3 rounded-lg shadow-xs transition-all"
              >
                Partner With Us Now
              </Link>
            </div>
          </div>

          {/* Right: Pinned University Students Photo Card */}
          <div className="md:col-span-6 flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Blue Pushpin Graphic on Top */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-3xl filter drop-shadow">
                📌
              </div>

              {/* Photo Frame */}
              <div className="bg-white p-3 rounded-2xl border-2 border-blue-200/80 shadow-lg overflow-hidden transform rotate-1 hover:rotate-0 transition-transform">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=700&fit=crop"
                  alt="University Students"
                  className="w-full h-80 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 9. FOOTER (CodeChef Signature Clean Footer)                              */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-10 px-4 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CodeChef | ByteChef — A Competitive Programming Platform.</p>
          <div className="flex gap-6 font-semibold text-gray-600">
            <Link to="/problems" className="hover:text-blue-600">Practice</Link>
            <Link to="/leaderboard" className="hover:text-blue-600">Compete</Link>
            <Link to="/login" className="hover:text-blue-600">Login</Link>
            <Link to="/register" className="hover:text-blue-600">Sign Up</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
