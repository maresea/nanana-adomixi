export const ROLES = {
  CLERK: {
    code: 'CLERK',
    name: 'Văn thư',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  LEADER: {
    code: 'LEADER',
    name: 'Lãnh đạo',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  SPECIALIST: {
    code: 'SPECIALIST',
    name: 'Chuyên viên',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
};

export const DOCUMENT_TYPES = {
  INCOMING: { label: 'Công văn đến', badge: 'bg-primary-50 text-primary-700 border-primary-200' },
  OUTGOING: { label: 'Công văn đi', badge: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export const DOCUMENT_SCOPES = {
  EXTERNAL: { label: 'Ngoài cơ quan', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  INTERNAL: { label: 'Nội bộ', badge: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export const URGENCIES = {
  NORMAL: { label: 'Thường', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  URGENT: { label: 'Khẩn', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  VERY_URGENT: { label: 'Hỏa tốc', badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' }
};

export const DOCUMENT_STATUSES = {
  RECEIVED: { label: 'Mới tiếp nhận', badge: 'bg-slate-100 text-slate-700 border border-slate-200' },
  ASSIGNED: { label: 'Đã phân công', badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  IN_PROGRESS: { label: 'Đang xử lý', badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
  COMPLETED: { label: 'Đã hoàn thành', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
};

export const TASK_STATUSES = {
  ASSIGNED: { label: 'Chờ xử lý', badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  PROCESSING: { label: 'Đang thực hiện', badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
  RESOLVED: { label: 'Đã hoàn tất', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
};
