import React from 'react';
import { Sparkles } from 'lucide-react';

export const AISparkleBadge = ({ text = "Trợ lý AI" }) => {
  return (
    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
      <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
      <span>{text}</span>
    </span>
  );
};
