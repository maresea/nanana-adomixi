import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  DOCUMENT_TYPES,
  DOCUMENT_SCOPES,
  URGENCIES,
  DOCUMENT_STATUSES
} from '../utils/constants';
import {
  Search,
  Filter,
  FilePlus,
  Eye,
  FileText,
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc tìm kiếm (FR5)
  const [search, setSearch] = useState('');
  const [docScope, setDocScope] = useState('');
  const [docType, setDocType] = useState('');
  const [urgency, setUrgency] = useState('');
  const [status, setStatus] = useState('');

  const fetchDocuments = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (docScope) params.document_scope = docScope;
    if (docType) params.document_type = docType;
    if (urgency) params.urgency = urgency;
    if (status) params.status = status;

    apiClient.get('/documents', { params })
      .then(res => setDocuments(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, [docScope, docType, urgency, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDocScope('');
    setDocType('');
    setUrgency('');
    setStatus('');
    setLoading(true);
    apiClient.get('/documents')
      .then(res => setDocuments(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const hasActiveFilters = search || docScope || docType || urgency || status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Sổ Quản lý & Tra cứu Văn bản</h2>
          <p className="text-xs text-slate-500 mt-1">
            Hồ sơ công văn đến, công văn đi và văn bản lưu hành nội bộ cơ quan
          </p>
        </div>

        {user?.role === 'CLERK' && (
          <Link
            to="/documents/create"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-all"
          >
            <FilePlus className="w-4 h-4" />
            <span>Tiếp nhận công văn mới</span>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo số ký hiệu, trích yếu hoặc đơn vị gửi..."
              className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="h-10 px-5 flex-1 sm:flex-none bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all shadow-xs flex items-center justify-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5 sm:hidden" />
              <span>Tìm kiếm</span>
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 px-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center justify-center"
                title="Xóa bộ lọc"
              >
                Đặt lại
              </button>
            )}
          </div>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="relative">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium appearance-none cursor-pointer"
            >
              <option value="">Tất cả chiều luân chuyển</option>
              <option value="INCOMING">Công văn đến</option>
              <option value="OUTGOING">Công văn đi</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={docScope}
              onChange={(e) => setDocScope(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium appearance-none cursor-pointer"
            >
              <option value="">Tất cả phạm vi</option>
              <option value="EXTERNAL">Ngoài cơ quan</option>
              <option value="INTERNAL">Nội bộ</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium appearance-none cursor-pointer"
            >
              <option value="">Tất cả độ khẩn</option>
              <option value="NORMAL">Thường</option>
              <option value="URGENT">Khẩn</option>
              <option value="VERY_URGENT">Hỏa tốc</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium appearance-none cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="RECEIVED">Mới tiếp nhận</option>
              <option value="ASSIGNED">Đã phân công</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="COMPLETED">Đã hoàn thành</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Document List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Đang tải danh sách công văn...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-700">
              Không tìm thấy văn bản nào phù hợp
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Không có công văn nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-xs font-semibold transition-all border border-primary-200"
              >
                <span>Xóa bộ lọc & Tải lại tất cả</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Số ký hiệu</th>
                  <th className="py-3 px-4">Trích yếu nội dung</th>
                  <th className="py-3 px-4">Cơ quan gửi / nhận</th>
                  <th className="py-3 px-4 text-center">Ngày ban hành</th>
                  <th className="py-3 px-4 text-center">Độ khẩn</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => {
                  const typeInfo = DOCUMENT_TYPES[doc.document_type] || { label: doc.document_type };
                  const urgencyInfo = URGENCIES[doc.urgency] || { label: doc.urgency, badge: '' };
                  const statusInfo = DOCUMENT_STATUSES[doc.status] || { label: doc.status, badge: '' };

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary-900 whitespace-nowrap">
                        {doc.document_number}
                        <div className="text-[10px] font-normal text-slate-500 font-sans mt-0.5">
                          {typeInfo.label} ({doc.document_scope === 'INTERNAL' ? 'Nội bộ' : 'Ngoài'})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="font-medium text-slate-800 hover:text-primary-600 line-clamp-2 transition-colors"
                        >
                          {doc.title}
                        </Link>
                        {doc.ai_summary && (
                          <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-500 font-medium">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>Có bản tóm tắt</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div><span className="font-semibold text-slate-500">Gửi:</span> {doc.sender_org}</div>
                        <div><span className="font-semibold text-slate-500">Nhận:</span> {doc.recipient_org}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-600 whitespace-nowrap">
                        {doc.issued_date}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${urgencyInfo.badge}`}>
                          {urgencyInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors border border-primary-200/50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
