import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'CLERK') navigate('/clerk/dashboard');
      else if (user.role === 'LEADER') navigate('/leader/dashboard');
      else if (user.role === 'SPECIALIST') navigate('/specialist/dashboard');
      else navigate('/login');
    }
  }, [user, navigate]);

  return <div className="flex justify-center items-center h-full">Đang tải...</div>;
}

