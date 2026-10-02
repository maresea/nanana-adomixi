import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  FileSearch,
  CheckSquare,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Tổng quan điều hành',
      sub: 'Thống kê & chỉ số tiến độ',
      icon: LayoutDashboard,
      roles: ['LEADER']
    },
    {
      to: '/documents/create',
      label: 'Tiếp nhận văn bản',
      sub: 'Số hóa & vào sổ công văn',
      icon: FilePlus,
      roles: ['CLERK']
    },
    {
      to: '/documents',
      label: 'Sổ văn bản hồ sơ',
      sub: 'Tra cứu công văn đến và đi',
      icon: FileSearch,
      roles: ['CLERK', 'LEADER', 'SPECIALIST']
    },
    {
      to: '/tasks',
      label: role === 'LEADER' ? 'Phân công nhiệm vụ' : 'Xử lý công việc',
      sub: role === 'LEADER' ? 'Giao việc & đôn đốc hạn' : 'Nhiệm vụ & soạn dự thảo',
      icon: CheckSquare,
      roles: ['LEADER', 'SPECIALIST']
    }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  const roleNameMap = {
    CLERK: 'Văn thư cơ quan',
    LEADER: 'Lãnh đạo đơn vị',
    SPECIALIST: 'Chuyên viên thụ lý'
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-[calc(100vh-4rem)] border-r border-slate-800 shadow-inner">
      {/* Navigation menu */}
      <div className="p-4 flex-1 space-y-1.5">
        <div className="px-3 pt-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Quy trình nghiệp vụ</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-primary-700 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center space-x-3 w-full">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-primary-300'
                  }`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="leading-snug truncate">{item.label}</div>
                    <div className={`text-[10px] font-normal leading-none mt-0.5 truncate ${isActive ? 'text-primary-100' : 'text-slate-400'}`}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role & Workspace Info Card */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-[11px] font-medium truncate">Cơ quan Hành chính</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Vai trò: <strong className="text-slate-200 font-semibold">{roleNameMap[role] || role}</strong></span>
          </div>
        </div>
      </div>
    </aside>
  );
};
