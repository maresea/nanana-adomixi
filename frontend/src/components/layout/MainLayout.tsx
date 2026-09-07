import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, FileText, LayoutDashboard, UserCircle } from 'lucide-react';

export function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2 text-primary-600 font-bold text-xl">
          <FileText className="w-6 h-6" />
          <span>QLCV AI</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-50 hover:text-primary-600">
            <LayoutDashboard className="w-5 h-5" />
            Bảng điều khiển
          </Link>
          {/* Menu phụ thuộc vào role có thể thêm sau */}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <UserCircle className="w-8 h-8 text-gray-400" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">Hệ thống Quản lý Công văn</h1>
          {/* Notifications Placeholder */}
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

