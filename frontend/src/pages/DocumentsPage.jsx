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
  Sparkles
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sổ Quản lý & Tra cứu Công văn</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tra cứu hồ sơ công văn đến, công văn đi và văn bản lưu hành nội bộ (FR5)
          </p>
        </div>

        {user?.role === 'CLERK' && (
          <Link
            to="/documents/create"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-all"
          >
            <FilePlus className="w-4 h-4" />
            <span>Tiếp nhận công văn mới</span>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo số ký hiệu, trích yếu hoặc đơn vị gửi..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-all"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Tất cả chiều luân chuyển</option>
            <option value="INCOMING">Công văn đến</option>
            <option value="OUTGOING">Công văn đi</option>
          </select>

          <select
            value={docScope}
            onChange={(e) => setDocScope(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Tất cả phạm vi</option>
            <option value="EXTERNAL">Ngoài cơ quan</option>
            <option value="INTERNAL">Nội bộ</option>
          </select>

          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Tất cả độ khẩn</option>
            <option value="NORMAL">Thường</option>
            <option value="URGENT">Khẩn</option>
            <option value="VERY_URGENT">Hỏa tốc</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="RECEIVED">Mới tiếp nhận</option>
            <option value="ASSIGNED">Đã phân công</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="COMPLETED">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Document List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Đang tải danh sách công văn...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Không tìm thấy văn bản nào phù hợp với tiêu chí lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
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
                          <div className="flex items-center space-x-1 mt-1 text-[11px] text-rose-600 font-medium">
                            <Sparkles className="w-3 h-3" />
                            <span>Đã có tóm tắt AI</span>
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
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
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
