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
  INCOMING: { label: 'Công văn đến', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  OUTGOING: { label: 'Công văn đi', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
};

export const DOCUMENT_SCOPES = {
  EXTERNAL: { label: 'Ngoài cơ quan', color: 'text-slate-600' },
  INTERNAL: { label: 'Nội bộ', color: 'text-amber-700' }
};

export const URGENCIES = {
  NORMAL: { label: 'Thường', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  URGENT: { label: 'Khẩn', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  VERY_URGENT: { label: 'Hỏa tốc', badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' }
};

export const DOCUMENT_STATUSES = {
  RECEIVED: { label: 'Mới tiếp nhận', badge: 'bg-slate-100 text-slate-700' },
  ASSIGNED: { label: 'Đã phân công', badge: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'Đang xử lý', badge: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Đã hoàn thành', badge: 'bg-emerald-100 text-emerald-700' }
};

export const TASK_STATUSES = {
  ASSIGNED: { label: 'Chờ xử lý', badge: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Đang thực hiện', badge: 'bg-amber-100 text-amber-700' },
  RESOLVED: { label: 'Đã hoàn tất', badge: 'bg-emerald-100 text-emerald-700' }
};
