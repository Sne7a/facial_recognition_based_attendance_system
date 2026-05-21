import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "@/services/api";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import StudentDashboard from "@/pages/student/StudentDashboard";
import AttendanceHistory from "@/pages/student/AttendanceHistory";
import AttendanceReport from "@/pages/student/AttendanceReport";
import UpdateProfilePhoto from "@/pages/student/UpdateProfilePhoto";
import ParentDashboard from "@/pages/parent/ParentDashboard";
import ContactTeacher from "@/pages/parent/ContactTeacher";
import ChildrenProfile from "@/pages/parent/ChildrenProfile";
import ChildAttendance from "@/pages/parent/ChildAttendance";
import FacultyDashboard from "@/pages/faculty/FacultyDashboard";
import ViewAttendance from "@/pages/faculty/ViewAttendance";
import ViewStudents from "@/pages/faculty/ViewStudents";
import ClassSchedule from "@/pages/faculty/ClassSchedule";
import GenerateReports from "@/pages/faculty/GenerateReports";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageUsers from "@/pages/admin/ManageUsers";
import SubjectManagement from "@/pages/admin/SubjectManagement";
import AllAttendance from "@/pages/admin/AllAttendance";
import AdminReports from "@/pages/admin/AdminGenerateReports";
import DatabaseManagement from "@/pages/admin/DatabaseManagement";
import SystemSettings from "@/pages/admin/SystemSettings";
import Dashboard from "@/pages/Dashboard";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return getToken() ? children : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/student/dashboard"     element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/history"       element={<ProtectedRoute><AttendanceHistory /></ProtectedRoute>} />
        <Route path="/student/report"        element={<ProtectedRoute><AttendanceReport /></ProtectedRoute>} />
        <Route path="/student/profile-photo" element={<ProtectedRoute><UpdateProfilePhoto /></ProtectedRoute>} />
        <Route path="/parent/dashboard"      element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/contact"        element={<ProtectedRoute><ContactTeacher /></ProtectedRoute>} />
        <Route path="/parent/children"       element={<ProtectedRoute><ChildrenProfile /></ProtectedRoute>} />
        <Route path="/parent/attendance"     element={<ProtectedRoute><ChildAttendance /></ProtectedRoute>} />
        <Route path="/faculty/dashboard"     element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/mark-attendance" element={<ProtectedRoute><ViewAttendance /></ProtectedRoute>} />
        <Route path="/faculty/students"      element={<ProtectedRoute><ViewStudents /></ProtectedRoute>} />
        <Route path="/faculty/schedule"      element={<ProtectedRoute><ClassSchedule /></ProtectedRoute>} />
        <Route path="/faculty/reports"       element={<ProtectedRoute><GenerateReports /></ProtectedRoute>} />
        <Route path="/admin/dashboard"       element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"           element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/subjects"        element={<ProtectedRoute><SubjectManagement /></ProtectedRoute>} />
        <Route path="/admin/attendance"      element={<ProtectedRoute><AllAttendance /></ProtectedRoute>} />
        <Route path="/admin/reports"         element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/database"        element={<ProtectedRoute><DatabaseManagement /></ProtectedRoute>} />
        <Route path="/admin/settings"        element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
        <Route path="/dashboard"             element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}
