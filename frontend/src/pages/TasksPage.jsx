import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { TASK_STATUSES } from '../utils/constants';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  User,
  Sparkles,
  Send,
  FileCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Copy,
  Check,
  ArrowRight,
  Filter
} from 'lucide-react';

export const TasksPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const prefillDocId = searchParams.get('doc_id');

  const [tasks, setTasks] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [alerts, setAlerts] = useState({ overdue_tasks: [], due_soon_tasks: [] });
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, PROCESSING, OVERDUE, RESOLVED

  // Modal phân công mới (FR3 - Lãnh đạo)
  const [showAssignModal, setShowAssignModal] = useState(!!prefillDocId);
  const [assignForm, setAssignForm] = useState({
    document_id: prefillDocId || '',
    assignee_id: '',
    instruction: '',
    deadline: ''
  });

  // Modal soạn dự thảo (FR4, FR10 - Chuyên viên)
  const [activeTaskForDraft, setActiveTaskForDraft] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [generatingAiDraft, setGeneratingAiDraft] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTasks, resAlerts] = await Promise.all([
        apiClient.get('/tasks'),
        apiClient.get('/tasks/alerts/deadline-warnings')
      ]);
      setTasks(resTasks.data);
      setAlerts(resAlerts.data);

      if (user?.role === 'LEADER') {
        const [resUsers, resDocs] = await Promise.all([
          apiClient.get('/auth/users?role=SPECIALIST'),
          apiClient.get('/documents')
        ]);
        setSpecialists(resUsers.data);
        setDocuments(resDocs.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Phân công xử lý (FR3)
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/tasks/assign', assignForm);
      alert("Phân công nhiệm vụ xử lý văn bản thành công!");
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      alert("Lỗi phân công: " + (err.response?.data?.detail || err.message));
    }
  };

  // Cập nhật tiến độ (FR4)
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert("Lỗi cập nhật: " + (err.response?.data?.detail || err.message));
    }
  };

  // AI sinh dự thảo phản hồi (FR10)
  const handleGenerateAIDraft = async (task) => {
    setGeneratingAiDraft(true);
    try {
      const docContext = task.document 
        ? `Số hiệu: ${task.document.document_number}\nTrích yếu: ${task.document.title}`
        : (task.instruction || "Công văn yêu cầu phối hợp giải quyết theo chức năng nhiệm vụ.");

      const res = await apiClient.post('/ai/generate-draft', {
        document_text: docContext,
        instruction: task.instruction || "Đồng ý phối hợp và báo cáo tiến độ theo quy định."
      });
      setDraftContent(res.data.draft_content);
    } catch (err) {
      alert("Lỗi khi sinh dự thảo: " + (err.response?.data?.detail || err.message));
    } finally {
      setGeneratingAiDraft(false);
    }
  };

  // Copy dự thảo vào clipboard
  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Nộp dự thảo (FR4, FR10)
  const handleSubmitDraft = async (taskId) => {
    if (!draftContent.trim()) {
      alert("Nội dung dự thảo không được để trống.");
      return;
    }
    try {
      await apiClient.post(`/drafts/tasks/${taskId}`, {
        content: draftContent,
        is_ai_generated: true
      });
      alert("Đã trình dự thảo công văn phản hồi lên Lãnh đạo phê duyệt!");
      setActiveTaskForDraft(null);
      setDraftContent('');
      fetchData();
    } catch (err) {
      alert("Lỗi nộp dự thảo: " + (err.response?.data?.detail || err.message));
    }
  };

  // Lãnh đạo phê duyệt dự thảo (FR4)
  const handleApproveDraft = async (draftId, isApproved) => {
    const note = prompt(isApproved ? "Nhập ý kiến phê duyệt (tùy chọn):" : "Nhập lý do trả về để chuyên viên hoàn thiện lại:");
    if (note === null) return;

    try {
      await apiClient.post(`/drafts/${draftId}/approve`, {
        is_approved: isApproved,
        approval_note: note
      });
      alert(isApproved ? "Đã phê duyệt ban hành công văn phản hồi!" : "Đã trả về dự thảo cho chuyên viên.");
      fetchData();
    } catch (err) {
      alert("Lỗi phê duyệt: " + (err.response?.data?.detail || err.message));
    }
  };

  // Lọc theo tabs
  const now = new Date();
  const filteredTasks = tasks.filter(t => {
    if (filterTab === 'PROCESSING') return t.status === 'PROCESSING' || t.status === 'ASSIGNED';
    if (filterTab === 'RESOLVED') return t.status === 'RESOLVED';
    if (filterTab === 'OVERDUE') return new Date(t.deadline) < now && t.status !== 'RESOLVED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {user?.role === 'LEADER' ? 'Phân công Xử lý & Giám sát Tiến độ' : 'Nhiệm vụ Xử lý & Soạn Dự thảo AI'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Quy trình phối hợp: Đặt hạn chót, đôn đốc nhắc việc và ứng dụng AI soạn dự thảo công văn phản hồi (FR3, FR4, FR6, FR10)
          </p>
        </div>

        {user?.role === 'LEADER' && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Phân công nhiệm vụ mới (FR3)</span>
          </button>
        )}
      </div>

      {/* Cảnh báo hạn xử lý tự động (FR6) */}
      {(alerts.overdue_tasks.length > 0 || alerts.due_soon_tasks.length > 0) && (
        <div className="space-y-2">
          {alerts.overdue_tasks.map((al) => (
            <div key={al.task_id} className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-center justify-between text-xs text-rose-900 font-medium shadow-xs">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-bounce" />
                <div>
                  <span className="font-bold text-rose-950 uppercase tracking-wider">Cảnh báo Quá hạn: </span>
                  Công văn <strong className="font-mono">{al.document_number}</strong> đã quá hạn ({new Date(al.deadline).toLocaleString('vi-VN')})! Cán bộ phụ trách: <strong>{al.assignee_name}</strong>.
                </div>
              </div>
            </div>
          ))}

          {alerts.due_soon_tasks.map((al) => (
            <div key={al.task_id} className="p-3 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center justify-between text-xs text-amber-900 font-medium shadow-xs">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-amber-950 uppercase tracking-wider">Sắp đến hạn: </span>
                  Công văn <strong className="font-mono">{al.document_number}</strong> cần hoàn tất trong <strong>{al.hours_remaining} giờ</strong> tới!
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${filterTab === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Tất cả ({tasks.length})
        </button>
        <button
          onClick={() => setFilterTab('PROCESSING')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${filterTab === 'PROCESSING' ? 'bg-primary-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Đang thực hiện
        </button>
        <button
          onClick={() => setFilterTab('OVERDUE')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${filterTab === 'OVERDUE' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Quá hạn ({alerts.overdue_tasks.length})
        </button>
        <button
          onClick={() => setFilterTab('RESOLVED')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${filterTab === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Đã hoàn tất
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
            Không có nhiệm vụ nào trong danh mục này.
          </div>
        ) : (
          filteredTasks.map((t) => {
            const statusInfo = TASK_STATUSES[t.status] || { label: t.status, badge: '' };
            const isOverdue = new Date(t.deadline) < now && t.status !== 'RESOLVED';
            const latestDraft = t.drafts?.[0];

            return (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                            Quá hạn xử lý
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-mono">
                          Hạn chót: <strong className="text-slate-800">{new Date(t.deadline).toLocaleString('vi-VN')}</strong>
                        </span>
                      </div>

                      {t.document && (
                        <div className="text-xs font-semibold text-primary-800 bg-primary-50/80 px-2.5 py-1 rounded-lg border border-primary-200/60 inline-flex items-center space-x-1.5 mt-1">
                          <span>📄 Hồ sơ: <strong>{t.document.document_number}</strong> - {t.document.title}</span>
                        </div>
                      )}

                      <div className="text-sm font-bold text-slate-800 pt-1">
                        Chỉ đạo: {t.instruction || "Chủ trì rà soát và thực hiện công văn theo quy định."}
                      </div>

                      <div className="text-xs text-slate-500 flex items-center space-x-3 pt-1">
                        <span>Lãnh đạo giao: <strong className="text-slate-700">{t.assigner?.full_name}</strong></span>
                        <span>•</span>
                        <span>Chuyên viên nhận: <strong className="text-slate-700">{t.assignee?.full_name}</strong></span>
                      </div>
                    </div>

                    {/* Right action controls */}
                    <div className="flex items-center space-x-2 flex-shrink-0 pt-2 sm:pt-0">
                      {user?.role === 'SPECIALIST' && t.status !== 'RESOLVED' && (
                        <>
                          <button
                            onClick={() => {
                              setActiveTaskForDraft(t);
                              setDraftContent(latestDraft?.content || '');
                            }}
                            className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                            <span>Soạn dự thảo (AI)</span>
                          </button>

                          <select
                            value={t.status}
                            onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 font-semibold focus:ring-1 focus:ring-primary-600 focus:outline-none"
                          >
                            <option value="ASSIGNED">Chờ xử lý</option>
                            <option value="PROCESSING">Đang thực hiện</option>
                            <option value="RESOLVED">Đã hoàn tất</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Existing Draft Memo Card */}
                  {latestDraft && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <FileCheck className="w-4 h-4 text-primary-700" />
                          <span className="font-bold text-slate-800">Dự thảo Công văn phản hồi:</span>
                          {latestDraft.is_ai_generated && (
                            <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold">
                              ✨ AI hỗ trợ
                            </span>
                          )}
                        </div>

                        <div>
                          {latestDraft.is_approved ? (
                            <span className="text-emerald-700 font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Lãnh đạo đã phê duyệt</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Chờ Lãnh đạo phê duyệt
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="whitespace-pre-line text-slate-700 leading-relaxed font-sans bg-white p-3.5 rounded-lg border border-slate-200/60 shadow-2xs">
                        {latestDraft.content}
                      </p>

                      {latestDraft.approval_note && (
                        <div className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                          Ý kiến chỉ đạo của Lãnh đạo: "{latestDraft.approval_note}"
                        </div>
                      )}

                      {/* Lãnh đạo phê duyệt nút bấm (FR4) */}
                      {user?.role === 'LEADER' && !latestDraft.is_approved && (
                        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200/80">
                          <button
                            onClick={() => handleApproveDraft(latestDraft.id, false)}
                            className="px-3.5 py-1.5 bg-white border border-rose-300 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-50 transition-colors"
                          >
                            Yêu cầu sửa đổi
                          </button>
                          <button
                            onClick={() => handleApproveDraft(latestDraft.id, true)}
                            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center space-x-1.5 shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Phê duyệt ban hành</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Lãnh đạo Phân công (FR3) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Phân công Xử lý Văn bản (FR3)</h3>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Công văn cần xử lý</label>
                <select
                  required
                  value={assignForm.document_id}
                  onChange={(e) => setAssignForm({ ...assignForm, document_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-600 focus:outline-none"
                >
                  <option value="">-- Chọn công văn --</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.document_number} - {d.title.substring(0, 55)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giao Chuyên viên chủ trì</label>
                <select
                  required
                  value={assignForm.assignee_id}
                  onChange={(e) => setAssignForm({ ...assignForm, assignee_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-600 focus:outline-none"
                >
                  <option value="">-- Chọn cán bộ thụ lý --</option>
                  {specialists.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thời hạn xử lý (Deadline)</label>
                <input
                  type="datetime-local"
                  required
                  value={assignForm.deadline}
                  onChange={(e) => setAssignForm({ ...assignForm, deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ý kiến chỉ đạo</label>
                <textarea
                  rows={3}
                  value={assignForm.instruction}
                  onChange={(e) => setAssignForm({ ...assignForm, instruction: e.target.value })}
                  placeholder="Ghi rõ yêu cầu chỉ đạo, thời hạn báo cáo..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Xác nhận giao việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chuyên viên Soạn dự thảo với AI (FR4, FR10) */}
      {activeTaskForDraft && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Trợ lý AI Soạn thảo Dự thảo Phản hồi (FR10)
                  </h3>
                  <p className="text-[11px] text-slate-500">Tự động sinh văn bản khung theo thể thức hành chính</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {draftContent && (
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    title="Sao chép nội dung"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleGenerateAIDraft(activeTaskForDraft)}
                  disabled={generatingAiDraft}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50 shadow-xs"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${generatingAiDraft ? 'animate-spin' : ''}`} />
                  <span>{generatingAiDraft ? 'Đang tạo dự thảo...' : 'AI Tạo dự thảo'}</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600">
              Chỉ đạo của Lãnh đạo: <strong className="text-slate-800">{activeTaskForDraft.instruction || 'Thực hiện theo chức năng nhiệm vụ.'}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nội dung Dự thảo Công văn phản hồi (Chuyên viên chỉnh sửa tự do):
              </label>
              <textarea
                rows={10}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="Bấm 'AI Tạo dự thảo' để trợ lý sinh văn bản khung chuẩn hành chính (Kính gửi, Căn cứ, Nội dung báo cáo), sau đó bạn rà soát và bổ sung chi tiết..."
                className="w-full p-3.5 border border-slate-300 rounded-xl text-xs font-sans leading-relaxed focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTaskForDraft(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleSubmitDraft(activeTaskForDraft.id)}
                className="px-5 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trình Lãnh đạo phê duyệt (FR4)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
