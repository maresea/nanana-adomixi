import React from 'react';
import { useParams } from 'react-router-dom';

export default function DocumentDetail() {
  const { id } = useParams();
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Chi tiết Công văn #{id}</h2>
      <div className="flex gap-6 h-[800px]">
        <div className="w-1/2 bg-gray-200 flex items-center justify-center rounded-md border border-gray-300">
          PDF Viewer Placeholder
        </div>
        <div className="w-1/2 bg-white rounded-md border border-gray-300 p-4 shadow-sm">
          Form Trích Xuất & AI Assistant Placeholder
        </div>
      </div>
    </div>
  );
}

