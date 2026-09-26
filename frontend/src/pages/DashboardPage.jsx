import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/statistics/dashboard')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Tổng công văn hồ sơ',
      value: stats?.total_documents || 0,
      sub: `${stats?.incoming_count || 0} đến • ${stats?.outgoing_count || 0} đi`,
      icon: FileText,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'Nhiệm vụ đang xử lý',
      value: stats?.pending_tasks || 0,
      sub: 'Chuyên viên đang thụ lý',
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      label: 'Công văn quá hạn',
      value: stats?.overdue_tasks || 0,
      sub: stats?.overdue_tasks > 0 ? 'Cần chỉ đạo đôn đốc ngay' : 'Không có văn bản trễ hạn',
      icon: AlertTriangle,
      color: stats?.overdue_tasks > 0 ? 'bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200'
    },
    {
      label: 'Đã hoàn thành đúng hạn',
      value: stats?.completed_tasks || 0,
      sub: 'Đạt tiến độ quy định',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-800">Bảng điều khiển Thống kê Giám sát</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200">
              Dành cho Lãnh đạo (FR11)
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tổng hợp tình hình luân chuyển công văn và chỉ số hiệu suất giải quyết công việc theo thời gian thực
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/tasks"
            className="px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center space-x-2"
          >
            <span>Phân công văn bản</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{kpi.value}</div>
              <div className="text-xs text-slate-500 mt-1.5 font-medium">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Phân bố Công văn & Tiến độ trực quan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phân bổ luân chuyển công văn */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <FileText className="w-4 h-4 text-primary-600" />
            <span>Cơ cấu Văn bản Hồ sơ</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Công văn đến (Bên ngoài gửi đến)</span>
                <span className="font-bold">{stats?.incoming_count || 0} văn bản</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-sky-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.total_documents ? (stats.incoming_count / stats.total_documents) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Công văn đi (Gửi ra ngoài)</span>
                <span className="font-bold">{stats?.outgoing_count || 0} văn bản</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.total_documents ? (stats.outgoing_count / stats.total_documents) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Văn bản nội bộ cơ quan</span>
                <span className="font-bold">{stats?.internal_count || 0} văn bản</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.total_documents ? (stats.internal_count / stats.total_documents) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bảng tổng hợp theo phòng ban */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-800">Hiệu suất Xử lý theo Phòng ban</h3>
            </div>
            <Link to="/tasks" className="text-xs text-primary-600 hover:text-primary-800 font-semibold flex items-center space-x-1">
              <span>Kiểm tra nhiệm vụ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-4 rounded-l-lg">Phòng ban</th>
                  <th className="py-2.5 px-4 text-center">Nhân sự</th>
                  <th className="py-2.5 px-4 text-center">Tình trạng Quá hạn</th>
                  <th className="py-2.5 px-4 text-center rounded-r-lg">Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.department_stats?.map((dept, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{dept.department_name}</td>
                    <td className="py-3 px-4 text-center text-slate-600 font-medium">{dept.total_documents} chuyên viên</td>
                    <td className="py-3 px-4 text-center">
                      {dept.overdue_tasks > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {dept.overdue_tasks} trễ hạn
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          100% Đúng hạn
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {dept.overdue_tasks === 0 ? (
                        <span className="text-xs font-bold text-emerald-600">Xuất sắc</span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600">Cần theo dõi</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
