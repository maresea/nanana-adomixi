import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { Bell, LogOut, FileText, AlertTriangle, Clock, ChevronDown, CheckCircle, ExternalLink } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState({ overdue_tasks: [], due_soon_tasks: [], overdue_count: 0, due_soon_count: 0 });
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      apiClient.get('/tasks/alerts/deadline-warnings')
        .then(res => setAlerts(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleInfo = ROLES[user?.role] || { name: user?.role, badgeClass: 'bg-gray-100 text-gray-800' };
  const totalWarnings = (alerts.overdue_count || 0) + (alerts.due_soon_count || 0);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs transition-all">
      {/* Brand logo & title */}
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center text-white shadow-md shadow-primary-950/10 group-hover:scale-105 transition-transform">
          <FileText className="w-5 h-5 text-primary-200" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-primary-700 transition-colors">
              HỆ THỐNG QUẢN LÝ CÔNG VĂN
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 font-mono">
              AI 2026
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Cơ quan Hành chính & Văn bản Nội bộ</p>
        </div>
      </Link>

      {/* Right side: Interactive Notifications & User profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Dropdown Chuông Cảnh báo hạn (FR6) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl border transition-all relative ${
              showNotifications 
                ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-xs' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
            title="Nhắc hạn xử lý công văn"
          >
            <Bell className="w-4 h-4" />
            {totalWarnings > 0 && (
              <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-xs ${
                alerts.overdue_count > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
              }`}>
                {totalWarnings}
              </span>
            )}
          </button>

          {/* Interactive Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Cảnh báo hạn xử lý (FR6)</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold font-mono">
                    {totalWarnings}
                  </span>
                </div>
                <Link
                  to="/tasks"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-semibold text-primary-600 hover:text-primary-800"
                >
                  Xem tất cả
                </Link>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                {totalWarnings === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                    Không có văn bản nào bị quá hạn hoặc sắp đến hạn!
                  </div>
                ) : (
                  <>
                    {/* Quá hạn */}
                    {alerts.overdue_tasks?.map((item) => (
                      <Link
                        key={item.task_id}
                        to="/tasks"
                        onClick={() => setShowNotifications(false)}
                        className="p-3 hover:bg-rose-50/60 flex items-start space-x-2.5 transition-colors block text-left"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-950 font-mono truncate">{item.document_number}</span>
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">Quá hạn</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{item.document_title}</p>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Phụ trách: <strong>{item.assignee_name}</strong>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {/* Sắp đến hạn */}
                    {alerts.due_soon_tasks?.map((item) => (
                      <Link
                        key={item.task_id}
                        to="/tasks"
                        onClick={() => setShowNotifications(false)}
                        className="p-3 hover:bg-amber-50/60 flex items-start space-x-2.5 transition-colors block text-left"
                      >
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 font-mono truncate">{item.document_number}</span>
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              Còn {item.hours_remaining}h
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{item.document_title}</p>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center space-x-3 pl-3 sm:pl-4 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-slate-800">{user?.full_name}</div>
            <div className="flex items-center justify-end space-x-1 mt-0.5">
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold border ${roleInfo.badgeClass}`}>
                {roleInfo.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                • {user?.department?.name || 'Cơ quan'}
              </span>
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs shadow-xs">
            {user?.full_name?.charAt(0) || 'U'}
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
