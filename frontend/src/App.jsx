import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Report from "./pages/Report";
import ReportV1 from "./pages/ReportV1";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminStudentDetail from "./pages/admin/AdminStudentDetail";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminSessionDetail from "./pages/admin/AdminSessionDetail";
import AdminReports from "./pages/admin/AdminReports";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminConfig from "./pages/admin/AdminConfig";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import { ROLES, ADMIN_PORTAL_ROLES } from "./constants/roles";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role={ROLES.STUDENT}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute role={ROLES.STUDENT}>
              <Assessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:sessionId"
          element={
            <ProtectedRoute role={ROLES.STUDENT}>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-v1/:sessionId"
          element={
            <ProtectedRoute role={ROLES.STUDENT}>
              <ReportV1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={ADMIN_PORTAL_ROLES}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="students/:userId" element={<AdminStudentDetail />} />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="sessions/:sessionId" element={<AdminSessionDetail />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="configuration" element={<AdminConfig />} />
          <Route
            path="users"
            element={
              <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="audit-logs"
            element={
              <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
                <AdminAuditLogs />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
