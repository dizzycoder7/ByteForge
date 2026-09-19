import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import CodeChefFooter from '../../components/CodeChefFooter'
import api from '../../api/axios'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('partnerships') // 'partnerships', 'problems', 'users', 'judge'
  const [metrics, setMetrics] = useState(null)
  const [partnerships, setPartnerships] = useState([])
  const [problems, setProblems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState('')

  // Load all admin data
  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [metricsRes, partnersRes, probsRes, usersRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/partnerships'),
        api.get('/problems?size=100'),
        api.get('/admin/users'),
      ])

      setMetrics(metricsRes.data)
      setPartnerships(partnersRes.data)
      setProblems(probsRes.data.content || [])
      setUsers(usersRes.data || [])
    } catch (err) {
      console.error('Failed to load admin data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  // Approve a University Partnership Application
  const handleApprovePartnership = async (id, collegeName) => {
    setActionLoading(true)
    try {
      await api.patch(`/partnerships/${id}/status`, { status: 'APPROVED' })
      setNotification(`🎉 Successfully approved and issued campus chapter for ${collegeName}!`)
      // Refresh list
      const res = await api.get('/partnerships')
      setPartnerships(res.data)
      // Refresh metrics
      const mRes = await api.get('/admin/metrics')
      setMetrics(mRes.data)
      setTimeout(() => setNotification(''), 5000)
    } catch (err) {
      alert('Failed to update partnership status.')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete a Problem
  const handleDeleteProblem = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete problem "${title}"?`)) return
    try {
      await api.delete(`/problems/${id}`)
      setNotification(`Problem "${title}" deleted successfully.`)
      setProblems((prev) => prev.filter((p) => p.id !== id))
      setTimeout(() => setNotification(''), 4000)
    } catch (err) {
      alert('Failed to delete problem.')
    }
  }

  // Toggle User Role
  const handleToggleRole = async (userId, currentRole, handle) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      setNotification(`Updated @${handle} role to ${newRole}`)
      setTimeout(() => setNotification(''), 4000)
    } catch (err) {
      alert('Failed to update user role.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex flex-col justify-between">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP SUPER ADMIN HEADER                                          */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <header className="bg-[#1e2430] border-b border-gray-800 text-white px-4 sm:px-8 py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Identity & Console Badge */}
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="bg-[#5b4638] text-white px-2.5 py-1 rounded font-black text-xs tracking-wider">
                BYTEFORGE
              </span>
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                Super Admin Console
              </span>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-green-400 bg-green-950/60 border border-green-800/60 px-2 py-0.5 rounded-full font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Judge Engine Online
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-300 font-mono">
              👑 Super Admin: <span className="text-white font-bold">@{user?.username}</span>
            </span>

            <Link
              to="/admin/problems/new"
              className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              + Author Problem
            </Link>

            <Link
              to="/dashboard"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
            >
              🌐 Main Site
            </Link>
          </div>

        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white text-xs font-bold text-center py-2.5 px-4 shadow-md sticky top-16 z-40 animate-fade-in">
          {notification}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. TOP METRIC KPI CARDS (4 Main Pillars)                           */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Total Registered Coders */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Registered Coders</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-gray-900">{metrics?.totalUsers || 0}</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Students
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Active platform accounts</p>
          </div>

          {/* Problems in Vault */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Problems in Vault</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-purple-600">{metrics?.totalProblems || 0}</span>
              <Link to="/admin/problems/new" className="text-xs font-bold text-purple-700 hover:underline">
                + Create
              </Link>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Easy, Medium &amp; Hard</p>
          </div>

          {/* Total Submissions Evaluated */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Submissions Evaluated</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-green-600">
                {metrics?.totalSubmissions || 0}
              </span>
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                0ms Queue
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Java, C++, Python Judge Engine</p>
          </div>

          {/* Pending University Inquiries (Highlighted) */}
          <div className={`border rounded-2xl p-5 shadow-xs transition-all ${
            (metrics?.pendingPartnerships || 0) > 0
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-white border-gray-200/90'
          }`}>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending University MoUs</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-amber-900">
                {metrics?.pendingPartnerships || 0}
              </span>
              {(metrics?.pendingPartnerships || 0) > 0 && (
                <span className="text-xs font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded animate-pulse">
                  Requires Review
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-700/80 mt-2">Submitted via /for-colleges</p>
          </div>

        </div>

        {/* ────────────────────────────────────────────────────────────────── */}
        {/* 3. TABBED SUPER ADMIN WORKSPACE                                    */}
        {/* ────────────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs">
          
          {/* Tab Navigation Bar */}
          <div className="flex border-b border-gray-200 px-6 pt-3 gap-8 text-xs font-bold text-gray-500">
            <button
              onClick={() => setActiveTab('partnerships')}
              className={`pb-3 transition-colors flex items-center gap-1.5 ${
                activeTab === 'partnerships'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'hover:text-gray-900'
              }`}
            >
              <span>🏛️</span>
              <span>College Chapter Approvals ({partnerships.length})</span>
              {partnerships.filter(p => p.status === 'PENDING').length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {partnerships.filter(p => p.status === 'PENDING').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('problems')}
              className={`pb-3 transition-colors flex items-center gap-1.5 ${
                activeTab === 'problems'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'hover:text-gray-900'
              }`}
            >
              <span>🧩</span>
              <span>Problem Vault ({problems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 transition-colors flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'hover:text-gray-900'
              }`}
            >
              <span>👥</span>
              <span>User Governance ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('judge')}
              className={`pb-3 transition-colors flex items-center gap-1.5 ${
                activeTab === 'judge'
                  ? 'text-[#2f66d4] border-b-2 border-[#2f66d4]'
                  : 'hover:text-gray-900'
              }`}
            >
              <span>⚙️</span>
              <span>Judge &amp; Submissions Monitor</span>
            </button>
          </div>

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* TAB 1: COLLEGE CHAPTER APPROVALS (The core question feature!)    */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeTab === 'partnerships' && (
            <div className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Institutional Partnership Inquiries &amp; Chapter Approvals
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Review incoming applications from college faculty, HODs, and student chapter presidents.
                  </p>
                </div>
                <Link
                  to="/for-colleges"
                  target="_blank"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View Public Application Form ↗
                </Link>
              </div>

              {partnerships.length === 0 ? (
                <div className="text-center py-14 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-2xl mb-1">🏛️</p>
                  <p className="text-xs font-semibold text-gray-500">No college applications received yet.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f8fafc] text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-bold">College Name</th>
                        <th className="px-4 py-3 font-bold">Location</th>
                        <th className="px-4 py-3 font-bold">Coordinator</th>
                        <th className="px-4 py-3 font-bold">Role / Designation</th>
                        <th className="px-4 py-3 font-bold">Contact</th>
                        <th className="px-4 py-3 font-bold text-center">Students</th>
                        <th className="px-4 py-3 font-bold text-center">Status</th>
                        <th className="px-4 py-3 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {partnerships.map((p) => {
                        const isPending = p.status === 'PENDING'
                        return (
                          <tr key={p.id} className={isPending ? 'bg-amber-50/30' : 'hover:bg-gray-50/70'}>
                            <td className="px-4 py-3 font-bold text-gray-900">
                              {p.collegeName}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {p.city}, {p.state}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-800">
                              {p.coordinatorName}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {p.designation}
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-gray-600">
                              <div>{p.coordinatorEmail}</div>
                              <div className="text-gray-400">{p.coordinatorPhone}</div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-gray-800">
                              {p.studentCount}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-800'
                                    : p.status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isPending ? (
                                <button
                                  onClick={() => handleApprovePartnership(p.id, p.collegeName)}
                                  disabled={actionLoading}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors"
                                >
                                  ✓ Approve &amp; Issue Chapter
                                </button>
                              ) : (
                                <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1">
                                  <span>✓</span> Chapter Active
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* TAB 2: PROBLEM VAULT & CRUD                                      */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeTab === 'problems' && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Coding Problem Vault
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Author, modify, add testcases, or delete problems in the practice catalog.
                  </p>
                </div>
                <Link
                  to="/admin/problems/new"
                  className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs"
                >
                  + Author New Problem
                </Link>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">Title</th>
                      <th className="px-4 py-3 font-bold">Slug</th>
                      <th className="px-4 py-3 font-bold text-center">Difficulty</th>
                      <th className="px-4 py-3 font-bold text-center">Time Limit</th>
                      <th className="px-4 py-3 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {problems.map((prob) => (
                      <tr key={prob.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-bold text-gray-900">
                          <Link to={`/problems/${prob.slug}`} className="hover:text-blue-600">
                            {prob.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500">
                          {prob.slug}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              prob.difficulty === 'EASY'
                                ? 'bg-green-100 text-green-800'
                                : prob.difficulty === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-gray-600">
                          {prob.timeLimitMs}ms
                        </td>
                        <td className="px-4 py-3 text-center space-x-2">
                          <Link
                            to={`/admin/problems/${prob.id}/testcases`}
                            className="text-blue-600 hover:underline font-bold"
                          >
                            Add Testcases
                          </Link>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDeleteProblem(prob.id, prob.title)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* TAB 3: USER GOVERNANCE & ROLES                                   */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Registered Users &amp; Role Governance
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage accounts, elevate to Super Admin, or verify student institutional affiliations.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">Handle</th>
                      <th className="px-4 py-3 font-bold">Email</th>
                      <th className="px-4 py-3 font-bold">College / University</th>
                      <th className="px-4 py-3 font-bold text-center">Current Role</th>
                      <th className="px-4 py-3 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-bold text-gray-900">
                          <Link to={`/profile/${u.username}`} className="hover:underline text-blue-600">
                            @{u.username}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-600">
                          {u.email}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          🏛️ {u.collegeName || 'Independent'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleRole(u.id, u.role, u.username)}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                              u.role === 'ADMIN'
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                            }`}
                          >
                            {u.role === 'ADMIN' ? 'Demote to USER' : 'Promote to ADMIN'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────── */}
          {/* TAB 4: JUDGE ENGINE & RECENT SUBMISSIONS MONITOR                 */}
          {/* ──────────────────────────────────────────────────────────────── */}
          {activeTab === 'judge' && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Judge Engine Execution Cluster
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live stream of student submissions processed through ProcessBuilder compilation.
                  </p>
                </div>
                <button
                  onClick={loadAdminData}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  🔄 Refresh Stream
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">Sub ID</th>
                      <th className="px-4 py-3 font-bold">Student</th>
                      <th className="px-4 py-3 font-bold">Problem</th>
                      <th className="px-4 py-3 font-bold text-center">Language</th>
                      <th className="px-4 py-3 font-bold text-center">Verdict</th>
                      <th className="px-4 py-3 font-bold text-center">Time</th>
                      <th className="px-4 py-3 font-bold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {metrics?.recentSubmissions?.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-gray-400">
                          No submissions logged yet.
                        </td>
                      </tr>
                    ) : (
                      metrics?.recentSubmissions?.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/70">
                          <td className="px-4 py-3 font-mono text-gray-500">#{s.id}</td>
                          <td className="px-4 py-3 font-bold text-gray-900">@{s.username}</td>
                          <td className="px-4 py-3 text-gray-800">{s.problemTitle}</td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-blue-700">{s.language}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.verdict === 'ACCEPTED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {s.verdict}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-gray-600">{s.executionTimeMs}ms</td>
                          <td className="px-4 py-3 text-right text-gray-400 text-[11px]">{s.submittedAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <CodeChefFooter />

    </div>
  )
}
