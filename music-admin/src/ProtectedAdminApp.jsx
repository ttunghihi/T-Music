// ProtectedAdminApp.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import App from './App';

export default function ProtectedAdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  useEffect(() => {
    // Nếu chưa login -> chuyển về login (giữ path /admin/login)
    if (!isLoggedIn) {
      // tránh vòng lặp nếu đã ở trang login
      if (location.pathname !== '/admin/login') navigate('/admin/login');
    }
  }, [isLoggedIn, location.pathname, navigate]);

  // Nếu chưa login: trả null để không render App (tránh nháy)
  if (!isLoggedIn) return null;

  // Đã login -> render App (app chính của admin)
  return <App />;
}
