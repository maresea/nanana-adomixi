import React, { useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import apiClient from '../../services/apiClient';

export const AISummaryBox = ({ documentId, initialSummary, fullText, onSummaryUpdated }) => {
  const [summary, setSummary] = useState(initialSummary || '');
  const [loading, setLoading] = useState(false);

  const handleGenerateSummary = async () => {
    if (!fullText) {
      alert("Chưa có nội dung văn bản trích xuất để tóm tắt.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/ai/summarize', { document_text: fullText });
      const newSummary = res.data.summary;
      setSummary(newSummary);

      // Cập nhật vào DB
      if (documentId) {
        await apiClient.patch(`/documents/${documentId}`, { ai_summary: newSummary });
      }
      if (onSummaryUpdated) {
        onSummaryUpdated(newSummary);
      }
    } catch (err) {
      alert("Lỗi khi gọi tóm tắt: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-700 flex items-center justify-center text-white">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tóm tắt Nội dung Văn bản</h4>
            <p className="text-[11px] text-slate-500">Trích xuất các ý chính hỗ trợ lãnh đạo duyệt và chỉ đạo nhanh</p>
          </div>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100/80 disabled:opacity-50 transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Đang tóm tắt...' : summary ? 'Cập nhật tóm tắt' : 'Tự động tóm tắt'}</span>
        </button>
      </div>

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
