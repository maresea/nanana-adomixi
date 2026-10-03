import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

export const AISummaryBox = ({ documentId, initialSummary, fullText, documentScope, isInternal, onSummaryUpdated }) => {
  const [summary, setSummary] = useState(initialSummary || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const isLocalAi = isInternal || documentScope === 'INTERNAL';

  const handleGenerateSummary = async () => {
    setMessage(null);
    if (!fullText) {
      setMessage({ type: 'error', text: 'Chưa có nội dung văn bản trích xuất để tóm tắt.' });
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/ai/summarize', {
        document_text: fullText,
        document_scope: documentScope || (isInternal ? 'INTERNAL' : 'EXTERNAL'),
        is_internal: isLocalAi
      });
      const newSummary = res.data.summary;
      setSummary(newSummary);
      setMessage({
        type: 'success',
        text: isLocalAi
          ? 'Đã tóm tắt thành công bằng Local AI On-Premise (Bảo mật tuyệt đối).'
          : 'Đã tóm tắt thành công các ý chính bằng AI.'
      });

      // Cập nhật vào DB
      if (documentId) {
        await apiClient.patch(`/documents/${documentId}`, { ai_summary: newSummary });
      }
      if (onSummaryUpdated) {
        onSummaryUpdated(newSummary);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Lỗi khi gọi tóm tắt: ' + (err.response?.data?.detail || err.message)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs transition-all space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-700 to-indigo-800 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-primary-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tóm tắt Nội dung Văn bản</h4>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                isLocalAi
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-primary-100 text-primary-800'
              }`}>
                {isLocalAi ? '🔒 Local AI On-Premise' : 'AI Assistant'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isLocalAi
                ? 'Văn bản nội bộ được xử lý hoàn toàn cục bộ trên máy chủ nội bộ, bảo mật tuyệt đối'
                : 'Trích xuất các ý chính hỗ trợ lãnh đạo duyệt và chỉ đạo nhanh'}
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-white border border-primary-200 rounded-xl hover:bg-primary-50 disabled:opacity-50 transition-all shadow-2xs self-start sm:self-auto"
        >
          <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Đang tóm tắt...' : summary ? 'Cập nhật tóm tắt' : 'Tự động tóm tắt'}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center space-x-2 border transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {summary ? (
        <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200/80 font-sans shadow-2xs">
          {summary}
        </div>
      ) : (
        <div className="text-center py-4 text-xs text-slate-500 italic">
          Chưa có bản tóm tắt nội dung. Bấm "Tự động tóm tắt" để hệ thống tổng hợp các ý chính của văn bản.
        </div>
      )}
    </div>
  );
};
