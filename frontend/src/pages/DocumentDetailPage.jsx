import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { AISummaryBox } from '../components/ai/AISummaryBox';
import {
  DOCUMENT_TYPES,
  DOCUMENT_SCOPES,
  URGENCIES,
  DOCUMENT_STATUSES
} from '../utils/constants';
import {
  FileText,
  Calendar,
  Building,
  ArrowLeft,
  Paperclip,
  CheckSquare,
  Sparkles,
  Download,
  Clock,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const DocumentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/documents/${id}`)
      .then(res => setDoc(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-xs text-slate-400 mt-2">Đang tải chi tiết hồ sơ công văn...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
        <h3 className="text-base font-bold text-slate-700">Không tìm thấy hồ sơ văn bản</h3>
        <Link to="/documents" className="text-xs text-primary-600 hover:underline mt-2 inline-block font-semibold">
          ← Quay lại danh sách công văn
        </Link>
      </div>
    );
  }

  const typeInfo = DOCUMENT_TYPES[doc.document_type] || { label: doc.document_type };
  const urgencyInfo = URGENCIES[doc.urgency] || { label: doc.urgency, badge: '' };
  const statusInfo = DOCUMENT_STATUSES[doc.status] || { label: doc.status, badge: '' };

  const fullText = doc.attachments?.[0]?.extracted_text || doc.title;

  const steps = [
    { key: 'RECEIVED', label: 'Tiếp nhận' },
    { key: 'ASSIGNED', label: 'Phân công' },
    { key: 'IN_PROGRESS', label: 'Đang xử lý' },
    { key: 'COMPLETED', label: 'Hoàn tất' }
  ];

  const currentStepIdx = steps.findIndex(s => s.key === doc.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/documents"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại sổ công văn</span>
        </Link>

        {user?.role === 'LEADER' && doc.status === 'RECEIVED' && (
          <Link
            to={`/tasks?doc_id=${doc.id}`}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Phân công xử lý công văn này (FR3)</span>
          </Link>
        )}
      </div>

      {/* Tiến trình xử lý (Lifecycle Progress Bar) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiến trình Xử lý Văn bản</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.badge}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-center justify-between relative pt-2 pb-1">
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0"></div>
          {steps.map((step, idx) => {
            const isPassed = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isPassed
                    ? 'bg-primary-700 text-white ring-4 ring-primary-50'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}>
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[11px] mt-1.5 font-semibold ${isCurrent ? 'text-primary-800 font-bold' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Document Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header Quốc hiệu */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${urgencyInfo.badge}`}>
              Độ khẩn: {urgencyInfo.label}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {typeInfo.label} ({doc.document_scope === 'INTERNAL' ? 'Nội bộ' : 'Ngoài cơ quan'})
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 leading-snug">
            {doc.title}
          </h2>
          <div className="text-xs text-slate-500 font-mono mt-2">
            Số ký hiệu: <strong className="text-primary-900 font-bold">{doc.document_number}</strong>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50/50 text-xs border-b border-slate-100">
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Ngày ban hành</span>
            <span className="font-bold text-slate-800">{doc.issued_date}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Thể loại văn bản</span>
            <span className="font-bold text-slate-800">{doc.category || 'Công văn'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Cơ quan ban hành / gửi</span>
            <span className="font-bold text-slate-800">{doc.sender_org}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Đơn vị nhận</span>
            <span className="font-bold text-slate-800">{doc.recipient_org}</span>
          </div>
        </div>

        {/* AI Summary Box (FR8) */}
        <div className="p-6 border-b border-slate-100">
          <AISummaryBox
            documentId={doc.id}
            initialSummary={doc.ai_summary}
            fullText={fullText}
            onSummaryUpdated={(newSummary) => setDoc({ ...doc, ai_summary: newSummary })}
          />
        </div>

        {/* Tệp đính kèm số hóa */}
        <div className="p-6">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Paperclip className="w-4 h-4 text-slate-500" />
            <span>Tệp văn bản số hóa đính kèm ({doc.attachments?.length || 0})</span>
          </h4>

          {doc.attachments?.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 italic">
              Chưa có tệp đính kèm nào được tải lên cho hồ sơ này.
            </div>
          ) : (
            <div className="space-y-2">
              {doc.attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 text-xs hover:bg-slate-100/60 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{att.file_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {(att.file_size / 1024).toFixed(1)} KB • Định dạng: {att.file_type}
                      </div>
                    </div>
                  </div>
                  <a
                    href={att.file_path}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-primary-700 hover:text-primary-900 font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải tệp</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
