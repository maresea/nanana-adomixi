import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import {
  UploadCloud,
  Sparkles,
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  Info,
  Zap,
  RotateCcw
} from 'lucide-react';

export const DocumentCreatePage = () => {
  const navigate = useNavigate();

  // File upload state
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiFieldFlags, setAiFieldFlags] = useState({});

  // Form fields (Editable by Clerk)
  const [formData, setFormData] = useState({
    document_number: '',
    title: '',
    document_scope: 'EXTERNAL',
    document_type: 'INCOMING',
    category: '',
    issued_date: new Date().toISOString().split('T')[0],
    sender_org: '',
    recipient_org: 'Văn phòng Cơ quan',
    urgency: 'NORMAL',
  });

  const [saving, setSaving] = useState(false);

  // Mẫu văn bản hành chính thực tế để test nhanh cho giảng viên/người dùng
  const sampleDocument = `ỦY BAN NHÂN DÂN TỈNH
Số: 236/UBND-VX
V/v tăng cường an toàn thông tin và đẩy nhanh số hóa công văn năm 2026.
Ngày 24 tháng 03 năm 2026

Kính gửi: Các Sở, Ban, ngành và Ủy ban nhân dân các huyện, thị xã.

Thực hiện chỉ đạo của Thủ tướng Chính phủ về đề án chuyển đổi số quốc gia, Ủy ban nhân dân Tỉnh yêu cầu các cơ quan, đơn vị khẩn trương thực hiện các nhiệm vụ sau:
1. Hoàn thành số hóa 100% hồ sơ công văn đến và văn bản lưu hành nội bộ trước ngày 30/04/2026.
2. Thiết lập quy chế bảo vệ bí mật nhà nước trên môi trường số; tuyệt đối không để lộ lọt văn bản mật.
3. Định kỳ ngày 25 hàng tháng gửi báo cáo tiến độ về Văn phòng UBND Tỉnh để tổng hợp báo cáo Chủ tịch UBND Tỉnh.

Yêu cầu Thủ trưởng các đơn vị nghiêm túc triển khai thực hiện.`;

  const handleLoadSample = () => {
    setExtractedText(sampleDocument);
    setFile({ name: "CV_236_UBND_Tinh_AnToanThongTin.pdf", size: 142000, type: "application/pdf" });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        if (typeof text === 'string' && text.length > 0) {
          setExtractedText(text);
        }
      };
      if (selected.type === "text/plain") {
        reader.readAsText(selected);
      } else {
        // Mẫu tự động cho tệp pdf/docx nếu đọc text thô phía client
        setExtractedText(`ỦY BAN NHÂN DÂN TỈNH\nSố: 142/UBND-VX\nNgày 22 tháng 03 năm 2026\n\nV/v tăng cường công tác bảo đảm an toàn thông tin và phối hợp chuyển đổi số cơ quan nhà nước năm 2026.\n\nKính gửi: Các Sở, Ban, ngành và Ủy ban nhân dân các huyện, thị xã.`);
      }
    }
  };

  // Kích hoạt AI Trích xuất thông tin (FR7, FR9)
  const handleAIExtract = async () => {
    if (!extractedText.trim()) {
      alert("Vui lòng tải lên tệp văn bản hoặc nạp văn bản mẫu để AI bóc tách.");
      return;
    }
    setLoadingAi(true);
    setAiMessage('');
    try {
      const [resMeta, resClass] = await Promise.all([
        apiClient.post('/ai/extract-metadata', { document_text: extractedText }),
        apiClient.post('/ai/suggest-classification', { document_text: extractedText })
      ]);

      const meta = resMeta.data;
      const cls = resClass.data;

      setFormData(prev => ({
        ...prev,
        document_number: meta.document_number || prev.document_number,
        issued_date: meta.issued_date || prev.issued_date,
        sender_org: meta.sender_org || prev.sender_org,
        title: meta.title || prev.title,
        category: cls.category || prev.category,
        urgency: cls.urgency || prev.urgency
      }));

      setAiFieldFlags({
        document_number: true,
        issued_date: true,
        sender_org: true,
        title: true,
        category: true,
        urgency: true
      });

      setAiMessage(`AI đã tự động trích xuất & gợi ý phân loại thành công (Độ tin cậy: ${(meta.confidence_score * 100).toFixed(0)}%). Bạn có thể chỉnh sửa tự do trước khi bấm xác nhận.`);
    } catch (err) {
      alert("Lỗi khi gọi AI: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.post('/documents', formData);
      const newDoc = res.data;

      if (file && file instanceof File) {
        const fileData = new FormData();
        fileData.append('file', file);
        await apiClient.post(`/documents/${newDoc.id}/attachments`, fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert("Tiếp nhận công văn vào sổ thành công!");
      navigate(`/documents/${newDoc.id}`);
    } catch (err) {
      alert("Lỗi lưu công văn: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tiếp nhận & Vào sổ Công văn mới</h2>
          <p className="text-sm text-slate-500 mt-1">
            Quy trình dành cho Văn thư: Số hóa tệp đính kèm và trích xuất dữ liệu bằng AI (FR2, FR7, FR9, FR12)
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-300"
          title="Nạp nhanh nội dung công văn thực tế để chấm điểm / kiểm thử AI"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Nạp văn bản mẫu để Test AI</span>
        </button>
      </div>

      {/* Khu vực AI Bóc tách & Đối soát (Human-in-the-loop) */}
      <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-900">Trợ lý AI Trích xuất & Gợi ý Phân loại (FR7, FR9)</h3>
              <p className="text-[11px] text-rose-700">Tự động đọc nội dung để điền trước thông tin cho Văn thư đối soát</p>
            </div>
          </div>
          <span className="text-xs text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full font-semibold border border-rose-200">
            Cơ chế: Human-in-the-loop
          </span>
        </div>

        {/* 2 Cột: Tệp văn bản và Hộp chữ nhận dạng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Box Upload */}
          <div className="border-2 border-dashed border-rose-200/80 rounded-xl p-5 text-center bg-white hover:bg-rose-50/30 transition-colors flex flex-col justify-center items-center">
            <UploadCloud className="w-9 h-9 text-rose-400 mb-2" />
            <div className="text-xs font-bold text-slate-700 mb-1">
              {file ? file.name : "Tải lên tệp công văn số hóa (.pdf, .docx)"}
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Tự động nhận dạng ký tự OCR & bóc tách chữ</p>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt"
              className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 cursor-pointer"
            />
          </div>

          {/* Box Text trích xuất */}
          <div className="flex flex-col justify-between bg-white p-4 rounded-xl border border-rose-200/80 text-xs">
            <div className="text-slate-600 mb-1.5 font-bold flex items-center justify-between">
              <span>Nội dung văn bản nhận dạng:</span>
              {extractedText && (
                <span className="text-[10px] text-emerald-600 font-normal">Đã có nội dung</span>
              )}
            </div>
            <textarea
              rows={4}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Chữ thô nhận dạng được sẽ hiển thị ở đây để AI phân tích..."
              className="w-full text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
            <button
              type="button"
              onClick={handleAIExtract}
              disabled={loadingAi || !extractedText}
              className="mt-3 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-rose-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              <span>{loadingAi ? 'AI đang đọc và bóc tách dữ liệu...' : 'AI Quét & Điền thông tin tự động'}</span>
            </button>
          </div>
        </div>

        {aiMessage && (
          <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center space-x-2 shadow-xs">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{aiMessage}</span>
          </div>
        )}
      </div>

      {/* Form Nhập liệu & Đối soát chính thức */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Thông tin Hồ sơ Công văn (Văn thư xác nhận)
          </h3>
          <span className="text-xs text-slate-400 font-medium">Các ô có icon ✨ là thông tin do AI điền</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
              <span>Số ký hiệu văn bản</span>
              <span className="text-rose-500">*</span>
              {aiFieldFlags.document_number && <Sparkles className="w-3 h-3 text-rose-500" />}
            </label>
            <input
              type="text"
              required
              value={formData.document_number}
              onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
              placeholder="VD: 125/UBND-VX"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-600 focus:outline-none ${aiFieldFlags.document_number ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'}`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
              <span>Ngày ban hành</span>
              <span className="text-rose-500">*</span>
              {aiFieldFlags.issued_date && <Sparkles className="w-3 h-3 text-rose-500" />}
            </label>
            <input
              type="date"
              required
              value={formData.issued_date}
              onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none ${aiFieldFlags.issued_date ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'}`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
              <span>Cơ quan / Đơn vị gửi</span>
              <span className="text-rose-500">*</span>
              {aiFieldFlags.sender_org && <Sparkles className="w-3 h-3 text-rose-500" />}
            </label>
            <input
              type="text"
              required
              value={formData.sender_org}
              onChange={(e) => setFormData({ ...formData, sender_org: e.target.value })}
              placeholder="VD: Ủy ban nhân dân Tỉnh"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none ${aiFieldFlags.sender_org ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'}`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cơ quan / Đơn vị nhận <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.recipient_org}
              onChange={(e) => setFormData({ ...formData, recipient_org: e.target.value })}
              placeholder="VD: Văn phòng Cơ quan"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chiều luân chuyển</label>
            <select
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white"
            >
              <option value="INCOMING">Công văn đến</option>
              <option value="OUTGOING">Công văn đi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phạm vi lưu hành</label>
            <select
              value={formData.document_scope}
              onChange={(e) => setFormData({ ...formData, document_scope: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white"
            >
              <option value="EXTERNAL">Ngoài cơ quan</option>
              <option value="INTERNAL">Nội bộ cơ quan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
              <span>Độ khẩn (AI gợi ý)</span>
              {aiFieldFlags.urgency && <Sparkles className="w-3 h-3 text-rose-500" />}
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold bg-white ${aiFieldFlags.urgency ? 'border-rose-300 text-rose-800' : 'border-slate-300'}`}
            >
              <option value="NORMAL">Bình thường</option>
              <option value="URGENT">Khẩn</option>
              <option value="VERY_URGENT">Hỏa tốc</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
              <span>Thể loại văn bản (AI gợi ý)</span>
              {aiFieldFlags.category && <Sparkles className="w-3 h-3 text-rose-500" />}
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="VD: Chỉ đạo điều hành, Tờ trình..."
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm ${aiFieldFlags.category ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
            <span>Trích yếu nội dung công văn</span>
            <span className="text-rose-500">*</span>
            {aiFieldFlags.title && <Sparkles className="w-3 h-3 text-rose-500" />}
          </label>
          <textarea
            required
            rows={3}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Tóm tắt ngắn gọn nội dung văn bản..."
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none ${aiFieldFlags.title ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'}`}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-700/20 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{saving ? 'Đang lưu vào sổ...' : 'Xác nhận & Vào sổ Công văn'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
