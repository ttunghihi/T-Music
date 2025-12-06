// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * AdminLogin.jsx
 * - Backend chạy ở http://localhost:4000
 * - Gọi endpoint POST /api/admin/login
 * - Nếu success: lưu localStorage.isAdminLoggedIn = "true" và navigate("/list-song")
 * - Hiển thị lỗi chi tiết nếu không kết nối được hoặc server trả lỗi
 *
 * (Bạn có thể chuyển API_BASE vào file config nếu muốn)
 */

const API_BASE = "https://t-music.onrender.com";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@tmusic.local"); // mặc định giúp test nhanh
  const [password, setPassword] = useState("Admin12345"); // mặc định giúp test nhanh
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // đọc response text rồi parse JSON nếu có thể — giúp debug khi server trả HTML hoặc lỗi khác
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        // nếu server trả về không phải JSON
        throw new Error(`Server trả về dữ liệu không hợp lệ: ${text}`);
      }

      // Nếu HTTP status không ok, hiển thị message nếu có
      if (!res.ok) {
        const msg = (data && data.message) || `Lỗi server (status ${res.status})`;
        setError(msg);
        return;
      }

      // Kiểm tra payload
      if (data && data.success) {
        localStorage.setItem("isAdminLoggedIn", "true");
        setSuccess(data.message || "Đăng nhập thành công.");
        // redirect tới trang chính admin
        setTimeout(() => navigate("/list-song"), 300);
      } else {
        setError((data && data.message) || "Đăng nhập thất bại.");
      }
    } catch (err) {
      console.error("admin login error", err);
      // hiển thị message rõ ràng cho user
      if (err.message && err.message.includes("Failed to fetch")) {
        setError("Không thể kết nối tới server. Hãy kiểm tra server backend đang chạy trên http://localhost:4000");
      } else {
        setError("Lỗi kết nối tới server: " + (err.message || ""));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-4 text-center">Admin Login</h1>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="admin@tmusic.local"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Mật khẩu admin"
              autoComplete="current-password"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
