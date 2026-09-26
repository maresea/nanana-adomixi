import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  FileSearch,
  CheckSquare,
  Sparkles,
  Bot,
  Zap
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Tổng quan & Thống kê',
      sub: 'Báo cáo điều hành',
      icon: LayoutDashboard,
      roles: ['LEADER'],
      badge: 'FR11'
    },
    {
      to: '/documents/create',
      label: 'Tiếp nhận Công văn',
      sub: 'Số hóa & OCR AI',
      icon: FilePlus,
      roles: ['CLERK'],
      badge: 'AI Quét'
    },
    {
      to: '/documents',
      label: 'Sổ Công văn & Tra cứu',
      sub: 'Hồ sơ văn bản đến/đi',
      icon: FileSearch,
      roles: ['CLERK', 'LEADER', 'SPECIALIST'],
      badge: 'FR5'
    },
    {
      to: '/tasks',
      label: role === 'LEADER' ? 'Phân công & Giám sát' : 'Nhiệm vụ & Dự thảo',
      sub: role === 'LEADER' ? 'Giao việc chuyên viên' : 'Soạn phản hồi AI',
      icon: CheckSquare,
      roles: ['LEADER', 'SPECIALIST'],
      badge: role === 'LEADER' ? 'FR3' : 'FR4/FR10'
    }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-[calc(100vh-4rem)] border-r border-slate-800/80 shadow-inner">
      {/* Navigation menu */}
      <div className="p-4 flex-1 space-y-1.5">
        <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400/80 flex items-center justify-between">
          <span>Quy trình Xử lý</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
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
                    ? 'bg-gradient-to-r from-primary-700 to-primary-600 text-white shadow-md shadow-primary-900/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-white/10 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-primary-400'
                    }`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                    </div>
                    <div>
                      <div className="leading-snug">{item.label}</div>
                      <div className={`text-[10px] font-normal leading-none mt-0.5 ${isActive ? 'text-primary-100' : 'text-slate-400'}`}>
                        {item.sub}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border font-semibold ${
                      isActive 
                        ? 'bg-white/20 text-white border-white/20' 
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/60 group-hover:border-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* AI Assistant Status Card */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900 rounded-xl p-3.5 border border-slate-700/60 text-xs shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>AI Engine: Sẵn sàng</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 font-mono">
              v1.0
            </span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Hỗ trợ OCR số hóa, tóm tắt 3–5 ý và gợi ý dự thảo văn bản phản hồi tự động.
          </p>
        </div>
      </div>
    </aside>
  );
};
