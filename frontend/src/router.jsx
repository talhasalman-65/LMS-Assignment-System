import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import Login from '@/pages/Login';

import StudentDashboard from '@/pages/student/Dashboard';
import StudentAssignments from '@/pages/student/Assignments';
import StudentAssignmentDetail from '@/pages/student/AssignmentDetail';
import StudentSubmissions from '@/pages/student/Submissions';
import StudentGrades from '@/pages/student/Grades';
import StudentProfile from '@/pages/student/Profile';

import TeacherDashboard from '@/pages/teacher/Dashboard';
import TeacherCreateAssignment from '@/pages/teacher/CreateAssignment';
import TeacherAssignments from '@/pages/teacher/Assignments';
import TeacherSubmissions from '@/pages/teacher/Submissions';
import TeacherGradeCenter from '@/pages/teacher/GradeCenter';
import TeacherGradeSubmission from '@/pages/teacher/GradeSubmission';
import TeacherReports from '@/pages/teacher/Reports';
import TeacherProfile from '@/pages/teacher/Profile';

import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminAssignments from '@/pages/admin/Assignments';
import AdminReports from '@/pages/admin/Reports';
import AdminSettings from '@/pages/admin/Settings';
import AdminLogs from '@/pages/admin/Logs';
import AdminProfile from '@/pages/admin/Profile';

function RootRedirect() {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  const user = useAuthStore.getState().user;
  const isCheckingSession = useAuthStore.getState().isCheckingSession;

  if (isCheckingSession) return null;

  if (isAuthenticated && user) {
    return <Navigate to={`/app/${user.role}/dashboard`} replace />;
  }
  return <Navigate to="/login" replace />;
}

const wrap = (Component, roles) => (
  <ProtectedRoute roles={roles}>
    <Component />
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        path: 'student',
        children: [
          { index: true, element: <Navigate to="/app/student/dashboard" replace /> },
          { path: 'dashboard', element: wrap(StudentDashboard, ['student']) },
          { path: 'assignments', element: wrap(StudentAssignments, ['student']) },
          { path: 'assignments/:id', element: wrap(StudentAssignmentDetail, ['student']) },
          { path: 'submissions', element: wrap(StudentSubmissions, ['student']) },
          { path: 'grades', element: wrap(StudentGrades, ['student']) },
          { path: 'profile', element: wrap(StudentProfile, ['student']) },
        ],
      },
      {
        path: 'teacher',
        children: [
          { index: true, element: <Navigate to="/app/teacher/dashboard" replace /> },
          { path: 'dashboard', element: wrap(TeacherDashboard, ['teacher']) },
          { path: 'create-assignment', element: wrap(TeacherCreateAssignment, ['teacher']) },
          { path: 'create-assignment/:edit', element: wrap(TeacherCreateAssignment, ['teacher']) },
          { path: 'assignments', element: wrap(TeacherAssignments, ['teacher']) },
          { path: 'submissions', element: wrap(TeacherSubmissions, ['teacher']) },
          { path: 'grade-center', element: wrap(TeacherGradeCenter, ['teacher']) },
          { path: 'grade-center/:submissionId', element: wrap(TeacherGradeSubmission, ['teacher']) },
          { path: 'reports', element: wrap(TeacherReports, ['teacher']) },
          { path: 'profile', element: wrap(TeacherProfile, ['teacher']) },
        ],
      },
      {
        path: 'administrator',
        children: [
          { index: true, element: <Navigate to="/app/administrator/dashboard" replace /> },
          { path: 'dashboard', element: wrap(AdminDashboard, ['administrator']) },
          { path: 'users', element: wrap(AdminUsers, ['administrator']) },
          { path: 'assignments', element: wrap(AdminAssignments, ['administrator']) },
          { path: 'reports', element: wrap(AdminReports, ['administrator']) },
          { path: 'settings', element: wrap(AdminSettings, ['administrator']) },
          { path: 'logs', element: wrap(AdminLogs, ['administrator']) },
          { path: 'profile', element: wrap(AdminProfile, ['administrator']) },
        ],
      },
    ],
  },
]);
