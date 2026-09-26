import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-lg mx-auto mt-12">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-800">403 - Giới hạn Quyền truy cập</h2>
        <p className="mt-2 text-sm text-slate-600">
          Chức năng này không thuộc thẩm quyền của tài khoản vai trò: <span className="font-semibold text-rose-600">{user?.role}</span>.
        </p>
      </div>
    );
  }

  return children;
};
