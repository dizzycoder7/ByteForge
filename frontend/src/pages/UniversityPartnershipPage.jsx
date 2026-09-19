import { useState } from 'react'
import CodeChefFooter from '../components/CodeChefFooter'
import api from '../api/axios'

export default function UniversityPartnershipPage() {
  const [form, setForm] = useState({
    collegeName: '',
    city: '',
    state: '',
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
    designation: 'Head of Department (HOD)',
    studentCount: 500,
    preferredTracks: 'DSA Labs & Automated Grading, Campus Chapter, Placement Prep',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await api.post('/partnerships', {
        ...form,
        studentCount: parseInt(form.studentCount, 10),
      })
      setSuccess(true)
      setForm({
        collegeName: '',
        city: '',
        state: '',
        coordinatorName: '',
        coordinatorEmail: '',
        coordinatorPhone: '',
        designation: 'Head of Department (HOD)',
        studentCount: 500,
        preferredTracks: 'DSA Labs & Automated Grading, Campus Chapter, Placement Prep',
        message: '',
      })
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to submit partnership application. Please check your fields.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-blue-100 flex flex-col justify-between">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION WITH COLLEGE STUDENTS BACKGROUND IMAGE             */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#111827]">
        {/* Background Image of College Students Collaborating */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80')`,
          }}
        />
        {/* Dark Vignette Overlay for High Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/80" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full shadow-2xs">
            <span className="text-lg">🏛️</span>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
              ByteForge for Higher Education
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Empower Your Campus with{' '}
            <span className="text-[#60a5fa]">Institutional Collaboration</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Partner with ByteForge to bring automated programming lab evaluations, official campus chapters, campus-exclusive leaderboards, and placement-ready algorithms directly to your students.
          </p>

          {/* Key Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-white">
            <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-2 rounded-lg shadow-2xs flex items-center gap-1.5">
              <span>⚡</span> Automated Lab Grading
            </span>
            <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-2 rounded-lg shadow-2xs flex items-center gap-1.5">
              <span>🏆</span> Campus-Exclusive Leaderboards
            </span>
            <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-2 rounded-lg shadow-2xs flex items-center gap-1.5">
              <span>🎓</span> Official College Chapters
            </span>
            <span className="bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-2 rounded-lg shadow-2xs flex items-center gap-1.5">
              <span>💼</span> Placement Drive Analytics
            </span>
          </div>

          {/* CTA to Scroll to Form */}
          <div className="pt-4">
            <a
              href="#apply-form"
              className="inline-block bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Apply for College Partnership ↓
            </a>
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. FOUR PILLARS OF INSTITUTIONAL COLLABORATION                    */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold text-[#2f66d4] uppercase tracking-widest mb-1">
            Campus Ecosystem
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
            Four Core Pillars Built for Engineering Colleges
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-xl font-bold">
              ⚡
            </div>
            <h4 className="text-base font-bold text-gray-900">
              Automated Programming Labs &amp; Grading
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Faculty can create structured weekly lab assignments with private and sample test cases. The platform automatically compiles and evaluates student code across Java, C++, and Python—saving hours of manual evaluation.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-xl font-bold">
              🏆
            </div>
            <h4 className="text-base font-bold text-gray-900">
              Campus-Exclusive Leaderboards &amp; Contests
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Students see their real-time rank against their immediate college peers, batchmates, and sections. Host private internal college hackathons or compete against other engineering institutes in inter-college coding leagues.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-xl font-bold">
              🎓
            </div>
            <h4 className="text-base font-bold text-gray-900">
              Official ByteForge Campus Chapters
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Establish an active student-run programming club on campus. We provide official branding, session guides, starter curriculums, and national recognition for your faculty mentors and student chapter leaders.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-xl font-bold">
              💼
            </div>
            <h4 className="text-base font-bold text-gray-900">
              Placement Cell &amp; TPO Shortlisting Analytics
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Training &amp; Placement Officers (TPOs) gain deep insights into who is interview-ready. Filter students by Star Rating (1★ to 7★), total problems solved, and export ready-to-use candidate rosters for visiting tech companies.
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3. COLLABORATION LIFECYCLE ROADMAP                                 */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f8fafc] border-y border-gray-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold text-[#2f66d4] uppercase tracking-widest mb-1">
              Onboarding Roadmap
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              How Your College Partners with ByteForge
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Inquire & Submit Application',
                desc: 'Faculty coordinator or student lead fills out the institutional form with estimated student strength.',
              },
              {
                step: '02',
                title: 'Verification & MoU Finalization',
                desc: 'ByteForge verifies institutional credentials and provides official partnership agreement.',
              },
              {
                step: '03',
                title: 'Faculty Admin Workspace Setup',
                desc: 'Your college domain is whitelisted, and coordinators receive administrative access to set up batches.',
              },
              {
                step: '04',
                title: 'Student Ingestion & Campus Chapter Formation',
                desc: 'Students join via college email, linking their profiles directly to the campus leaderboard.',
              },
              {
                step: '05',
                title: 'Continuous Labs, Contests & Placement Drives',
                desc: 'Run automated lab practicals, semester-end coding exams, and shortlist candidates for company drives.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs flex items-start gap-4"
              >
                <div className="h-10 w-10 bg-blue-50 text-[#2f66d4] border border-blue-200 rounded-lg flex items-center justify-center font-mono font-black text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 4. PREVIOUS COMPREHENSIVE SUBMIT FORM (#apply-form)                */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section id="apply-form" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-10 shadow-lg">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Institutional Partnership Application
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Submit your college details to initiate formal collaboration and request campus chapter setup.
            </p>
          </div>

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-r-xl text-xs mb-6 space-y-1">
              <p className="font-bold text-sm">🎉 Application Submitted Successfully!</p>
              <p>Our institutional onboarding team will review your application and reach out within 24 hours.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl text-xs mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* College Details */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                College / University Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="collegeName"
                value={form.collegeName}
                onChange={handleChange}
                required
                placeholder="e.g. Delhi Technological University"
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="e.g. New Delhi"
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Delhi"
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            </div>

            {/* Coordinator Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Coordinator Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="coordinatorName"
                  value={form.coordinatorName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Dr. Rajesh Verma"
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Designation / Role
                </label>
                <select
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                  <option value="Training & Placement Officer (TPO)">Training &amp; Placement Officer (TPO)</option>
                  <option value="Associate Professor / Faculty Lead">Associate Professor / Faculty Lead</option>
                  <option value="Dean / Principal">Dean / Principal</option>
                  <option value="Student Technical Club President">Student Technical Club President</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Official / Academic Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="coordinatorEmail"
                  value={form.coordinatorEmail}
                  onChange={handleChange}
                  required
                  placeholder="e.g. rverma@dtu.ac.in"
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="coordinatorPhone"
                  value={form.coordinatorPhone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Estimated Student Strength
              </label>
              <select
                name="studentCount"
                value={form.studentCount}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value="150">100 - 250 Students</option>
                <option value="500">250 - 500 Students</option>
                <option value="1000">500 - 1000 Students</option>
                <option value="2500">1000+ Students (Campus-wide)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Collaboration Programs of Interest
              </label>
              <input
                type="text"
                name="preferredTracks"
                value={form.preferredTracks}
                onChange={handleChange}
                placeholder="e.g. DSA Labs, Automated Grading, Campus Chapter, Placement Mock Drives"
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Additional Notes / Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                placeholder="Tell us about your upcoming semester lab schedule or specific placement goals..."
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold rounded-xl shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all text-xs tracking-wider uppercase"
            >
              {loading ? 'SUBMITTING APPLICATION...' : 'SUBMIT PARTNERSHIP APPLICATION'}
            </button>
          </form>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 5. PARTNER UNIVERSITIES SHOWCASE                                   */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-14 border-t border-gray-200/80 bg-gray-50/60 text-center">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
          Trusted by Academic Chapters Across India
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-bold text-gray-600 font-mono">
          <span>🏛️ IIT Delhi</span>
          <span>🏛️ BITS Pilani</span>
          <span>🏛️ DTU Delhi</span>
          <span>🏛️ VIT Vellore</span>
          <span>🏛️ NIT Trichy</span>
          <span>🏛️ RV College Bangalore</span>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 6. FOOTER                                                          */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <CodeChefFooter />

    </div>
  )
}
