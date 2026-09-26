import React, { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
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
      alert("Lỗi khi gọi AI tóm tắt: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-5 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3 border-b border-rose-200/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900">Bản tóm tắt thông minh của AI (FR8)</h4>
            <p className="text-[11px] text-rose-700">Hỗ trợ Lãnh đạo nắm bắt 3–5 ý chính trong 10 giây</p>
          </div>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-100/60 disabled:opacity-50 transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Đang tóm tắt...' : summary ? 'Tóm tắt lại' : 'Tạo tóm tắt AI'}</span>
        </button>
      </div>

      {summary ? (
        <div className="text-xs text-rose-950 leading-relaxed whitespace-pre-line bg-white/80 p-3.5 rounded-lg border border-rose-100 font-sans">
          {summary}
        </div>
      ) : (
        <div className="text-center py-4 text-xs text-rose-600 italic">
          Chưa có bản tóm tắt AI. Bấm "Tạo tóm tắt AI" để hệ thống tự động đọc và trích rút 3–5 ý chính.
        </div>
      )}
    </div>
  );
};
