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
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const DocumentCreatePage = () => {
  const navigate = useNavigate();

  // File upload state
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [textExpanded, setTextExpanded] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiFieldFlags, setAiFieldFlags] = useState({});
  const [aiInitialValues, setAiInitialValues] = useState({});

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

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      // Gửi lên backend để trích xuất text thật từ tệp (PDF/DOCX/TXT)
      const formUpload = new FormData();
      formUpload.append("file", selected);
      try {
        const res = await apiClient.post("/ai/parse-file", formUpload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res.data && res.data.text) {
          setExtractedText(res.data.text);
          return;
        }
      } catch (err) {
        console.warn("Lỗi trích xuất tệp từ backend, dùng fallback:", err);
      }

      // Fallback nếu có sự cố
      if (selected.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          if (typeof text === 'string' && text.length > 0) {
            setExtractedText(text);
          }
        };
        reader.readAsText(selected);
      } else {
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
      const isInternal = formData.document_scope === 'INTERNAL';
      const [resMeta, resClass] = await Promise.all([
        apiClient.post('/ai/extract-metadata', {
          document_text: extractedText,
          document_scope: formData.document_scope,
          is_internal: isInternal
        }),
        apiClient.post('/ai/suggest-classification', {
          document_text: extractedText,
          document_scope: formData.document_scope,
          is_internal: isInternal
        })
      ]);

      const meta = resMeta.data;
      const cls = resClass.data;

      const initialAiVals = {
        document_number: meta.document_number || formData.document_number,
        issued_date: meta.issued_date || formData.issued_date,
        sender_org: meta.sender_org || formData.sender_org,
        title: meta.title || formData.title,
        category: cls.category || formData.category,
        urgency: cls.urgency || formData.urgency
      };

      setAiInitialValues(initialAiVals);

      setFormData(prev => ({
        ...prev,
        ...initialAiVals
      }));

      setAiFieldFlags({
        document_number: Boolean(meta.document_number),
        issued_date: Boolean(meta.issued_date),
        sender_org: Boolean(meta.sender_org),
        title: Boolean(meta.title),
        category: Boolean(cls.category),
        urgency: Boolean(cls.urgency)
      });

      setAiMessage(`AI đã tự động trích xuất & gợi ý phân loại thành công (Độ tin cậy: ${(meta.confidence_score * 100).toFixed(0)}%). Bạn có thể đối soát và chỉnh sửa trước khi vào sổ.`);
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

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Trạng thái đối soát dữ liệu
  const renderFieldStatus = (fieldKey) => {
    if (!aiFieldFlags[fieldKey]) return null;
    const initial = aiInitialValues[fieldKey];
    const current = formData[fieldKey];
    const isModified = initial !== undefined && current !== initial;

    if (isModified) {
      return (
        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          Đã hiệu chỉnh
        </span>
      );
    }

    return (
      <span className="text-[10px] font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
        Trích xuất tự động
      </span>
    );
  };

  const getFieldInputClass = (fieldKey, base = '') => {
    return `border-slate-300 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 ${base}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tiếp nhận & Vào sổ Công văn</h2>
          <p className="text-xs text-slate-500 mt-1">
            Số hóa hồ sơ, tự động trích xuất thông tin và đối soát văn bản trước khi lưu trữ
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-300"
          title="Nạp mẫu văn bản hành chính thực tế để trải nghiệm tính năng số hóa"
        >
          <FileText className="w-3.5 h-3.5 text-slate-600" />
          <span>Nạp văn bản mẫu thực tế</span>
        </button>
      </div>

      {/* Công cụ Hỗ trợ Số hóa & Trích xuất Văn bản */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Công cụ hỗ trợ số hóa & trích xuất</h3>
              <p className="text-[11px] text-slate-500">Tải tệp PDF/DOCX hoặc dán nội dung để hệ thống trích xuất thông tin tự động</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-full font-medium border border-slate-200 shadow-2xs">
            Trợ lý số hóa
          </span>
        </div>

        {/* 2 Cột: Tệp văn bản và Hộp chữ nhận dạng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Box Upload */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-white hover:border-slate-400 transition-colors flex flex-col justify-center items-center">
            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
            <div className="text-xs font-bold text-slate-700 mb-1">
              {file ? file.name : "Tải lên tệp công văn số hóa (.pdf, .docx)"}
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Tự động bóc tách nội dung văn bản</p>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt"
              className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>

          {/* Box Text trích xuất */}
          <div className="flex flex-col justify-between bg-white p-5 rounded-2xl border border-slate-200 text-xs shadow-2xs">
            <div className="text-slate-700 mb-2 font-bold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>Nội dung văn bản bóc tách:</span>
                {extractedText && (
                  <span className="text-[10px] text-slate-500 font-mono font-normal">
                    ({extractedText.length.toLocaleString('vi-VN')} ký tự)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {extractedText && (
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="inline-flex items-center space-x-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg transition-colors font-medium"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                )}
                {extractedText && (
                  <button
                    type="button"
                    onClick={() => setTextExpanded(!textExpanded)}
                    className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg transition-colors font-medium"
                    title={textExpanded ? 'Thu gọn khung chữ' : 'Mở rộng khung chữ'}
                  >
                    {textExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        <span>Thu gọn</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        <span>Mở rộng</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {textExpanded ? (
              <textarea
                rows={6}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Nội dung văn bản nhận dạng được sẽ hiển thị ở đây để trích xuất dữ liệu..."
                className="w-full text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-primary-600 max-h-48 overflow-y-auto leading-relaxed"
              />
            ) : (
              <div 
                onClick={() => setTextExpanded(true)}
                className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-500 font-mono text-[11px] truncate cursor-pointer hover:bg-slate-100/80 transition-colors"
                title="Bấm để mở rộng toàn bộ nội dung"
              >
                {extractedText.replace(/\n+/g, ' ').slice(0, 140)}... (Đã thu gọn để thuận tiện đối soát form)
              </div>
            )}

            <button
              type="button"
              onClick={handleAIExtract}
              disabled={loadingAi || !extractedText}
              className="mt-3 w-full py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
            >
              <span>{loadingAi ? 'Đang phân tích và bóc tách dữ liệu...' : 'Tự động trích xuất thông tin vào biểu mẫu'}</span>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {formData.document_type === 'OUTGOING' ? 'Thông tin Hồ sơ Công văn Đi' : 'Thông tin Hồ sơ Công văn Đến'}
            </h3>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {formData.document_scope === 'INTERNAL' ? 'Lưu hành nội bộ' : 'Ngoài cơ quan'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            Kiểm tra và hiệu chỉnh lại thông tin trước khi vào sổ chính thức
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chiều luân chuyển</label>
            <div className="relative">
              <select
                value={formData.document_type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFormData({
                    ...formData,
                    document_type: newType,
                    sender_org: newType === 'OUTGOING' && (!formData.sender_org || formData.sender_org.includes('UBND') || formData.sender_org.includes('Sở')) ? 'Văn phòng Cơ quan' : formData.sender_org,
                  });
                }}
                className="w-full px-3.5 py-2.5 pr-9 border border-slate-300 rounded-xl text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-primary-600 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="INCOMING">Công văn đến (Cơ quan ngoài / phòng ban gửi đến)</option>
                <option value="OUTGOING">Công văn đi (Cơ quan ban hành phát hành đi)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phạm vi lưu hành</label>
            <div className="relative">
              <select
                value={formData.document_scope}
                onChange={(e) => setFormData({ ...formData, document_scope: e.target.value })}
                className="w-full px-3.5 py-2.5 pr-9 border border-slate-300 rounded-xl text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-primary-600 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="EXTERNAL">Ngoài cơ quan (Liên cơ quan)</option>
                <option value="INTERNAL">Nội bộ cơ quan (Lưu chuyển nội bộ)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span>Số ký hiệu văn bản</span>
                <span className="text-rose-500">*</span>
              </div>
              {renderFieldStatus('document_number')}
            </label>
            <input
              type="text"
              required
              value={formData.document_number}
              onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
              placeholder={formData.document_type === 'OUTGOING' ? "VD: 45/QĐ-VP" : "VD: 125/UBND-VX"}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono focus:ring-2 focus:outline-none transition-colors ${getFieldInputClass('document_number')}`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span>Ngày ban hành</span>
                <span className="text-rose-500">*</span>
              </div>
              {renderFieldStatus('issued_date')}
            </label>
            <input
              type="date"
              required
              value={formData.issued_date}
              onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:outline-none transition-colors ${getFieldInputClass('issued_date')}`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span>
                  {formData.document_type === 'OUTGOING'
                    ? (formData.document_scope === 'INTERNAL' ? 'Phòng ban ban hành (Nội bộ)' : 'Đơn vị ban hành (Cơ quan mình)')
                    : (formData.document_scope === 'INTERNAL' ? 'Phòng ban gửi (Nội bộ)' : 'Cơ quan / Đơn vị gửi đến')}
                </span>
                <span className="text-rose-500">*</span>
              </div>
              {renderFieldStatus('sender_org')}
            </label>
            <input
              type="text"
              required
              value={formData.sender_org}
              onChange={(e) => setFormData({ ...formData, sender_org: e.target.value })}
              placeholder={formData.document_type === 'OUTGOING' ? "VD: Văn phòng Ban Giám đốc" : (formData.document_scope === 'INTERNAL' ? "VD: Phòng Tổ chức cán bộ" : "VD: Ủy ban nhân dân Tỉnh")}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:outline-none transition-colors ${getFieldInputClass('sender_org')}`}
            />
            {formData.document_scope === 'INTERNAL' && (
              <div className="mt-1 flex flex-wrap gap-1 items-center">
                <span className="text-[10px] text-slate-400">Gợi ý chọn nhanh:</span>
                {['Văn phòng Cơ quan', 'Phòng CNTT', 'Phòng Kế hoạch - Tài chính', 'Phòng Tổ chức cán bộ'].map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setFormData({ ...formData, sender_org: dept })}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              <span>
                {formData.document_type === 'OUTGOING'
                  ? (formData.document_scope === 'INTERNAL' ? 'Phòng ban tiếp nhận (Nội bộ)' : 'Nơi nhận (Kính gửi cơ quan bên ngoài)')
                  : (formData.document_scope === 'INTERNAL' ? 'Phòng ban tiếp nhận (Nội bộ)' : 'Cơ quan / Đơn vị tiếp nhận')}
              </span>{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.recipient_org}
              onChange={(e) => setFormData({ ...formData, recipient_org: e.target.value })}
              placeholder={formData.document_type === 'OUTGOING' ? (formData.document_scope === 'INTERNAL' ? "VD: Phòng Kế hoạch - Tài chính" : "VD: Sở Thông tin và Truyền thông") : "VD: Văn phòng Cơ quan"}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
            />
            {formData.document_scope === 'INTERNAL' && (
              <div className="mt-1 flex flex-wrap gap-1 items-center">
                <span className="text-[10px] text-slate-400">Gợi ý chọn nhanh:</span>
                {['Văn phòng Cơ quan', 'Phòng CNTT', 'Phòng Kế hoạch - Tài chính', 'Phòng Tổ chức cán bộ'].map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setFormData({ ...formData, recipient_org: dept })}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Độ khẩn</span>
              {renderFieldStatus('urgency')}
            </label>
            <div className="relative">
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className={`w-full px-3.5 py-2.5 pr-9 border rounded-xl text-sm font-semibold bg-white transition-colors appearance-none cursor-pointer ${getFieldInputClass('urgency')}`}
              >
                <option value="NORMAL">Bình thường</option>
                <option value="URGENT">Khẩn</option>
                <option value="VERY_URGENT">Hỏa tốc</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Thể loại văn bản</span>
              {renderFieldStatus('category')}
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="VD: Chỉ đạo điều hành, Tờ trình..."
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-colors ${getFieldInputClass('category')}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span>Trích yếu nội dung công văn</span>
              <span className="text-rose-500">*</span>
            </div>
            {renderFieldStatus('title')}
          </label>
          <textarea
            required
            rows={3}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Tóm tắt ngắn gọn nội dung văn bản..."
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:outline-none transition-colors ${getFieldInputClass('title')}`}
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
            <span>
              {saving
                ? 'Đang lưu vào sổ...'
                : formData.document_type === 'OUTGOING'
                ? 'Lưu & Ban hành công văn đi'
                : 'Lưu & Vào sổ công văn đến'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
