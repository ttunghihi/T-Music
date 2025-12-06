import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// import routes / wrappers
import ProtectedAdminApp from './ProtectedAdminApp'; // mới tạo bên dưới
import AdminLogin from './pages/AdminLogin'; // đường dẫn: chỉnh nếu khác

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Trang login (không hiển thị App/admin layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Tất cả route admin khác sẽ vào ProtectedAdminApp (nó sẽ render App nếu đã login) */}
        <Route path="/*" element={<ProtectedAdminApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
