import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { RoleBasedRoute } from './components/layout/RoleBasedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentCreatePage } from './pages/DocumentCreatePage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { TasksPage } from './pages/TasksPage';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user.role === 'LEADER') return <Navigate to="/dashboard" replace />;
  if (user.role === 'CLERK') return <Navigate to="/documents/create" replace />;
  return <Navigate to="/tasks" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<RootRedirect />} />

            {/* Dashboard Lãnh đạo (FR11) */}
            <Route
              path="dashboard"
              element={
                <RoleBasedRoute allowedRoles={['LEADER']}>
                  <DashboardPage />
                </RoleBasedRoute>
              }
            />

            {/* Quản lý sổ công văn & Tra cứu (FR5) */}
            <Route
              path="documents"
              element={
                <RoleBasedRoute allowedRoles={['CLERK', 'LEADER', 'SPECIALIST']}>
                  <DocumentsPage />
                </RoleBasedRoute>
              }
            />

            {/* Tiếp nhận công văn (FR2, FR7, FR9, FR12) */}
            <Route
              path="documents/create"
              element={
                <RoleBasedRoute allowedRoles={['CLERK']}>
                  <DocumentCreatePage />
                </RoleBasedRoute>
              }
            />

            {/* Chi tiết công văn & AI tóm tắt (FR2, FR8) */}
            <Route
              path="documents/:id"
              element={
                <RoleBasedRoute allowedRoles={['CLERK', 'LEADER', 'SPECIALIST']}>
                  <DocumentDetailPage />
                </RoleBasedRoute>
              }
            />

            {/* Phân công & Tiến độ & Dự thảo AI (FR3, FR4, FR6, FR10) */}
            <Route
              path="tasks"
              element={
                <RoleBasedRoute allowedRoles={['LEADER', 'SPECIALIST']}>
                  <TasksPage />
                </RoleBasedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
