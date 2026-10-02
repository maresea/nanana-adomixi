import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Sparkles, LogIn, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('vanthu');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'LEADER') {
        navigate('/dashboard');
      } else if (user.role === 'CLERK') {
        navigate('/documents/create');
      } else {
        navigate('/tasks');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient decorative circles */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-900/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-950/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-8 text-white text-center relative">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/20 shadow-md">
            <FileText className="w-8 h-8 text-primary-200" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">HỆ THỐNG QUẢN LÝ CÔNG VĂN</h2>
          <p className="text-xs text-primary-200 mt-1 font-normal">
            Cơ quan Hành chính & Văn bản Nội bộ
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tài khoản đăng nhập
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all bg-slate-50/50"
                  placeholder="vanthu, lanhdao hoặc chuyenvien"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all bg-slate-50/50"
                  placeholder="Mật khẩu mặc định: 123456"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-semibold shadow-md shadow-primary-700/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Đang xác thực...' : 'Đăng nhập vào Hệ thống'}</span>
            </button>
          </form>

          {/* Quick select demo buttons with descriptive subtitles */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Tài khoản mẫu trải nghiệm (Mật khẩu: 123456)
            </div>
            <div className="grid grid-cols-3 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickSelect('vanthu', '123456')}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  username === 'vanthu'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold">Văn thư</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tiếp nhận & Vào sổ</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('lanhdao', '123456')}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  username === 'lanhdao'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold">Lãnh đạo</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Phân công & Giám sát</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('chuyenvien', '123456')}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  username === 'chuyenvien'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold">Chuyên viên</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Xử lý & Soạn dự thảo</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 mt-6">
        Dự án môn học: Hệ thống Quản lý Công văn và Văn bản Nội bộ có Tích hợp AI
      </div>
    </div>
  );
};
