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
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  Copy,
  Check,
  ArrowRight,
  Filter,
  ChevronDown
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
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: string }

  const notify = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

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
      let deadlineFormatted = assignForm.deadline;
      if (deadlineFormatted && !deadlineFormatted.includes('T')) {
        deadlineFormatted = `${deadlineFormatted}T23:59:59`;
      }
      await apiClient.post('/tasks/assign', {
        ...assignForm,
        deadline: deadlineFormatted
      });
      notify('success', "Phân công nhiệm vụ xử lý văn bản thành công!");
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      notify('error', "Lỗi phân công: " + (err.response?.data?.detail || err.message));
    }
  };

  // Cập nhật tiến độ (FR4)
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
      notify('success', "Cập nhật tiến độ công việc thành công!");
      fetchData();
    } catch (err) {
      notify('error', "Lỗi cập nhật: " + (err.response?.data?.detail || err.message));
    }
  };

  // AI sinh dự thảo phản hồi (FR10)
  const handleGenerateAIDraft = async (task) => {
    setGeneratingAiDraft(true);
    try {
      const isInternal = task.document?.document_scope === 'INTERNAL' || Boolean(task.document?.is_internal);
      const docContext = task.document 
        ? `Số hiệu: ${task.document.document_number}\nTrích yếu: ${task.document.title}`
        : (task.instruction || "Công văn yêu cầu phối hợp giải quyết theo chức năng nhiệm vụ.");

      const res = await apiClient.post('/ai/generate-draft', {
        document_text: docContext,
        instruction: task.instruction || "Đồng ý phối hợp và báo cáo tiến độ theo quy định.",
        document_scope: task.document?.document_scope || (isInternal ? 'INTERNAL' : 'EXTERNAL'),
        is_internal: isInternal
      });
      setDraftContent(res.data.draft_content);
      notify('success', isInternal 
        ? "Local AI On-Premise đã hoàn tất sinh dự thảo bảo mật nội bộ!" 
        : "AI đã hoàn tất sinh dự thảo công văn phản hồi!");
    } catch (err) {
      notify('error', "Lỗi khi sinh dự thảo: " + (err.response?.data?.detail || err.message));
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
      notify('error', "Nội dung dự thảo không được để trống.");
      return;
    }
    try {
      await apiClient.post(`/drafts/tasks/${taskId}`, {
        content: draftContent,
        is_ai_generated: true
      });
      notify('success', "Đã trình dự thảo công văn phản hồi lên Lãnh đạo phê duyệt!");
      setActiveTaskForDraft(null);
      setDraftContent('');
      fetchData();
    } catch (err) {
      notify('error', "Lỗi nộp dự thảo: " + (err.response?.data?.detail || err.message));
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
      notify('success', isApproved ? "Đã phê duyệt ban hành công văn phản hồi!" : "Đã trả về dự thảo cho chuyên viên.");
      fetchData();
    } catch (err) {
      notify('error', "Lỗi phê duyệt: " + (err.response?.data?.detail || err.message));
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
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {user?.role === 'LEADER' ? 'Phân công & Giám sát Tiến độ' : 'Nhiệm vụ Xử lý Văn bản'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {user?.role === 'LEADER' 
              ? 'Giao việc cho chuyên viên chủ trì, thiết lập thời hạn và đôn đốc giải quyết văn bản' 
              : 'Theo dõi các công văn được phân công, cập nhật tiến độ và dự thảo phản hồi'}
          </p>
        </div>

        {user?.role === 'LEADER' && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Giao nhiệm vụ mới</span>
          </button>
        )}
      </div>

      {/* Toast Feedback Notification Banner */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cảnh báo hạn xử lý */}
      {(alerts.overdue_tasks.length > 0 || alerts.due_soon_tasks.length > 0) && (
        <div className="space-y-2">
          {alerts.overdue_tasks.map((al) => (
            <div key={al.task_id} className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-center justify-between text-xs text-rose-900 font-medium shadow-xs">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
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
          <div className="py-16 text-center space-y-3 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-700">
              Chưa có nhiệm vụ nào trong danh mục này
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {filterTab === 'OVERDUE'
                ? 'Tuyệt vời! Không có công văn nào bị trễ hạn xử lý.'
                : filterTab === 'RESOLVED'
                ? 'Chưa có công văn nào được hoàn tất giải quyết.'
                : 'Hiện tại bạn không có nhiệm vụ nào đang chờ xử lý.'}
            </p>
            {user?.role === 'LEADER' && filterTab !== 'RESOLVED' && (
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                <span>+ Phân công văn bản mới</span>
              </button>
            )}
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
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/70">
              <h3 className="text-base font-bold text-slate-800">Phân công Xử lý Văn bản</h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Công văn cần xử lý</label>
                  <div className="relative">
                    <select
                      required
                      value={assignForm.document_id}
                      onChange={(e) => setAssignForm({ ...assignForm, document_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 pr-9 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-600 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="">-- Chọn công văn --</option>
                      {documents.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.document_number} - {d.title.substring(0, 55)}...
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giao Chuyên viên chủ trì</label>
                  <div className="relative">
                    <select
                      required
                      value={assignForm.assignee_id}
                      onChange={(e) => setAssignForm({ ...assignForm, assignee_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 pr-9 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-600 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="">-- Chọn cán bộ thụ lý --</option>
                      {specialists.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name} ({s.username})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
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
              </div>

              <div className="p-4 px-6 bg-slate-50/80 border-t border-slate-100 flex justify-end space-x-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-white transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Xác nhận giao việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chuyên viên Soạn dự thảo văn bản phản hồi (Split-View Human-in-the-loop) */}
      {activeTaskForDraft && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-700 flex items-center justify-center text-white">
                  <FileCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Soạn thảo Dự thảo Văn bản Phản hồi
                    </h3>
                    {activeTaskForDraft.document?.document_scope === 'INTERNAL' && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        🔒 Local AI On-Premise
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">Khung văn bản phúc đáp theo thể thức hành chính (Nghị định 30/2020/NĐ-CP)</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {draftContent && (
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="px-2.5 py-1.5 border border-slate-200 hover:bg-white text-slate-600 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-2xs"
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
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 shadow-xs transition-colors"
                >
                  <span>
                    {generatingAiDraft
                      ? 'Đang soạn thảo...'
                      : activeTaskForDraft.document?.document_scope === 'INTERNAL'
                        ? 'Local AI: Tạo khung dự thảo'
                        : 'Tự động tạo khung dự thảo'}
                  </span>
                </button>
              </div>
            </div>

            {/* Split view: Left context, Right editor */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 text-sm">
              {/* Cột trái: Căn cứ & Ý kiến chỉ đạo */}
              <div className="md:col-span-5 space-y-3.5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200/80 pb-2 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary-600" />
                    <span>Căn cứ văn bản gốc</span>
                  </h4>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Số ký hiệu:</span>
                    <span className="font-mono font-bold text-xs text-primary-900">
                      {activeTaskForDraft.document?.document_number || 'Chưa gắn số hiệu'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Trích yếu nội dung:</span>
                    <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-3">
                      {activeTaskForDraft.document?.title || 'Không có trích yếu'}
                    </p>
                  </div>
                  {activeTaskForDraft.document?.ai_summary && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Tóm tắt cốt lõi:</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80 whitespace-pre-line">
                        {activeTaskForDraft.document.ai_summary}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ý kiến chỉ đạo của Lãnh đạo</span>
                  </h4>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed pt-1">
                    "{activeTaskForDraft.instruction || 'Thực hiện theo chức năng nhiệm vụ được giao.'}"
                  </p>
                  <div className="text-[10px] text-slate-500 pt-1 font-mono">
                    Hạn chót xử lý: {activeTaskForDraft.deadline ? new Date(activeTaskForDraft.deadline).toLocaleDateString('vi-VN') : 'Không quy định'}
                  </div>
                </div>
              </div>

              {/* Cột phải: Soạn thảo dự thảo */}
              <div className="md:col-span-7 flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Nội dung Dự thảo Công văn phản hồi:
                  </label>
                  <span className="text-[11px] text-slate-400 italic">Có thể sửa trực tiếp</span>
                </div>
                <textarea
                  rows={13}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Nhập nội dung dự thảo hoặc bấm 'Tự động tạo khung dự thảo' để hệ thống lập sẵn mẫu hành chính, sau đó rà soát và bổ sung chi tiết..."
                  className="w-full p-3.5 border border-slate-300 rounded-xl text-xs font-sans leading-relaxed focus:ring-1 focus:ring-primary-600 focus:outline-none flex-1 min-h-[280px]"
                />
              </div>
            </div>

            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTaskForDraft(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-white transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleSubmitDraft(activeTaskForDraft.id)}
                className="px-5 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trình Lãnh đạo phê duyệt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
