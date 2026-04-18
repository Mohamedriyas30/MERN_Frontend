import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student pages
import StudentOverview from './pages/student/Overview';
import { StudentCourses, CourseDetail } from './pages/student/Courses';
import StudentAnalytics from './pages/student/Analytics';
import Certificates from './pages/student/Certificates';
import Notifications from './pages/student/Notifications';

// Faculty pages
import FacultyOverview from './pages/faculty/Overview';
import { FacultyCourses, FacultyStudents, CreateCourse, FacultyAnalytics } from './pages/faculty/Pages';

// Admin pages
import { AdminOverview, AdminUsers, AdminCourses, AdminAnalytics, AdminReports } from './pages/admin/Pages';

// Guard: redirect if not logged in or wrong role
function RequireAuth({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

// Guard: redirect if already logged in
function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth */}
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      {/* Student */}
      <Route path="/student" element={<RequireAuth role="student"><Layout title="Overview"><StudentOverview /></Layout></RequireAuth>} />
      <Route path="/student/courses" element={<RequireAuth role="student"><Layout title="My Courses"><StudentCourses /></Layout></RequireAuth>} />
      <Route path="/student/courses/:id" element={<RequireAuth role="student"><Layout title="Course Detail"><CourseDetail /></Layout></RequireAuth>} />
      <Route path="/student/analytics" element={<RequireAuth role="student"><Layout title="Analytics"><StudentAnalytics /></Layout></RequireAuth>} />
      <Route path="/student/certificates" element={<RequireAuth role="student"><Layout title="Certificates"><Certificates /></Layout></RequireAuth>} />
      <Route path="/student/notifications" element={<RequireAuth role="student"><Layout title="Notifications"><Notifications /></Layout></RequireAuth>} />

      {/* Faculty */}
      <Route path="/faculty" element={<RequireAuth role="faculty"><Layout title="Overview"><FacultyOverview /></Layout></RequireAuth>} />
      <Route path="/faculty/courses" element={<RequireAuth role="faculty"><Layout title="My Courses"><FacultyCourses /></Layout></RequireAuth>} />
      <Route path="/faculty/students" element={<RequireAuth role="faculty"><Layout title="Students"><FacultyStudents /></Layout></RequireAuth>} />
      <Route path="/faculty/create" element={<RequireAuth role="faculty"><Layout title="New Course"><CreateCourse /></Layout></RequireAuth>} />
      <Route path="/faculty/analytics" element={<RequireAuth role="faculty"><Layout title="Analytics"><FacultyAnalytics /></Layout></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin" element={<RequireAuth role="admin"><Layout title="Overview"><AdminOverview /></Layout></RequireAuth>} />
      <Route path="/admin/users" element={<RequireAuth role="admin"><Layout title="All Users"><AdminUsers /></Layout></RequireAuth>} />
      <Route path="/admin/courses" element={<RequireAuth role="admin"><Layout title="All Courses"><AdminCourses /></Layout></RequireAuth>} />
      <Route path="/admin/analytics" element={<RequireAuth role="admin"><Layout title="Analytics"><AdminAnalytics /></Layout></RequireAuth>} />
      <Route path="/admin/reports" element={<RequireAuth role="admin"><Layout title="Reports"><AdminReports /></Layout></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
