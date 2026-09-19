import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider }          from './context/AuthContext'
import Navbar                    from './components/Navbar'
import ProtectedRoute            from './components/ProtectedRoute'
import AdminRoute                from './components/AdminRoute'
import FacultyRoute              from './components/FacultyRoute'
import LandingPage               from './pages/LandingPage'
import LoginPage                 from './pages/LoginPage'
import RegisterPage              from './pages/RegisterPage'
import DashboardPage             from './pages/DashboardPage'
import CompilerPage              from './pages/CompilerPage'
import UniversityPartnershipPage from './pages/UniversityPartnershipPage'
import UniversityDashboardPage   from './pages/UniversityDashboardPage'
import ProblemsPage              from './pages/ProblemsPage'
import ProblemDetailPage         from './pages/ProblemDetailPage'
import MySubmissionsPage         from './pages/MySubmissionsPage'
import SubmissionDetailPage      from './pages/SubmissionDetailPage'
import LeaderboardPage           from './pages/LeaderboardPage'
import ProfilePage               from './pages/ProfilePage'
import CreateProblemPage         from './pages/admin/CreateProblemPage'
import AddTestCasePage           from './pages/admin/AddTestCasePage'
import AdminDashboardPage        from './pages/admin/AdminDashboardPage'
import CollegeAssessmentPage     from './pages/college/CollegeAssessmentPage'
import StudentAssessmentsHubPage from './pages/college/StudentAssessmentsHubPage'
import StudentAssessmentTestPage from './pages/college/StudentAssessmentTestPage'
import ContestsPage              from './pages/contests/ContestsPage'
import ContestArenaPage          from './pages/contests/ContestArenaPage'
import CoursesPage               from './pages/courses/CoursesPage'
import CourseCurriculumPage      from './pages/courses/CourseCurriculumPage'

function AppContent() {
  const location = useLocation()
  // Hide the global practice navbar on dedicated auth, college assessment, and proctored exam pages
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/college/') ||
    location.pathname.startsWith('/assessments/')

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/"              element={<LandingPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/register"      element={<RegisterPage />} />
        <Route path="/compiler"      element={<CompilerPage />} />
        <Route path="/ide"           element={<CompilerPage />} />
        <Route path="/courses"       element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseCurriculumPage />} />
        <Route path="/contests"      element={<ContestsPage />} />
        <Route path="/contests/:code" element={<ContestArenaPage />} />
        <Route path="/for-colleges"  element={<UniversityPartnershipPage />} />
        <Route path="/university"    element={<UniversityPartnershipPage />} />
        <Route path="/university/dashboard" element={
          <FacultyRoute><UniversityDashboardPage /></FacultyRoute>
        } />
        <Route path="/college/assessments" element={
          <FacultyRoute><CollegeAssessmentPage /></FacultyRoute>
        } />
        <Route path="/assessments" element={
          <ProtectedRoute><StudentAssessmentsHubPage /></ProtectedRoute>
        } />
        <Route path="/assessments/:id" element={
          <ProtectedRoute><StudentAssessmentTestPage /></ProtectedRoute>
        } />
        <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/problems"      element={<ProblemsPage />} />
        <Route path="/problems/:slug" element={<ProblemDetailPage />} />
        <Route path="/leaderboard"   element={<LeaderboardPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />

        {/* Protected routes — require login */}
        <Route path="/submissions/my" element={
          <ProtectedRoute><MySubmissionsPage /></ProtectedRoute>
        } />
        <Route path="/submissions/:id" element={
          <ProtectedRoute><SubmissionDetailPage /></ProtectedRoute>
        } />

        {/* Admin routes — require ADMIN role */}
        <Route path="/admin" element={
          <AdminRoute><AdminDashboardPage /></AdminRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminRoute><AdminDashboardPage /></AdminRoute>
        } />
        <Route path="/admin/problems/new" element={
          <AdminRoute><CreateProblemPage /></AdminRoute>
        } />
        <Route path="/admin/problems/:id/testcases" element={
          <AdminRoute><AddTestCasePage /></AdminRoute>
        } />

        {/* 404 fallback */}
        <Route path="*" element={
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-medium">Page not found</p>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
