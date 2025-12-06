import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://t-music.onrender.com"; 

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);

  // controlled inputs
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // OTP states
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Google sign-in
  const googleButtonRef = useRef(null);
  const googleInitializedRef = useRef(false);

  const navigate = useNavigate();

  const resetMsgs = () => {
    setMessage(null);
    setError(null);
  };

  const clearForm = () => {
    setEmail("");
    setName("");
    setPassword("");
    setConfirmPassword("");
  };

  const fetchMeAndSave = async (token) => {
    try {
      const r = await fetch(`${API_BASE}/api/user/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const d = await r.json().catch(() => null);
      if (d && d.success && d.user) {
        try {
          localStorage.setItem("user", JSON.stringify(d.user));
        } catch (err) {
          console.warn("Lưu user vào localStorage thất bại:", err);
        }
        // dispatch event để Navbar và các component khác bắt được
        window.dispatchEvent(new CustomEvent("tmusic_login", { detail: d.user }));
        return d.user;
      } else {
        return null;
      }
    } catch (err) {
      console.error("fetchMe error:", err);
      return null;
    }
  };

  // ------------------- Auth submit -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMsgs();

    if (!email || !password || (!isLogin && !name)) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "login" : "register";
      const url = `${API_BASE}/api/user/${endpoint}`;

      const body = isLogin
        ? { email, password }
        : { name, email, password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!data) {
        setError("Không nhận được phản hồi hợp lệ từ server.");
        setLoading(false);
        return;
      }

      if (!data.success) {
        setError(data.message || "Có lỗi xảy ra.");
        setLoading(false);
        return;
      }

      // --- Nếu là LOGIN: xử lý token/user như trước ---
      if (isLogin) {
        // Nếu server trả token -> lưu token trước
        if (data.token) {
          try {
            localStorage.setItem("token", data.token);
          } catch (err) {
            console.warn("Lưu token thất bại:", err);
          }
        }

        // Thử lấy /api/user/me để có user chính xác (isPremium, premiumUntil, ...)
        let finalUser = null;
        if (data.token) {
          finalUser = await fetchMeAndSave(data.token);
        }

        // Nếu /me không trả user, fallback dùng data.user nếu có
        if (!finalUser && data.user) {
          try {
            localStorage.setItem("user", JSON.stringify(data.user));
            window.dispatchEvent(new CustomEvent("tmusic_login", { detail: data.user }));
            finalUser = data.user;
          } catch (err) {
            console.warn("Lưu user fallback thất bại:", err);
          }
        }

        setMessage(data.message || "Đăng nhập thành công.");
        // redirect nhỏ sau
        setTimeout(() => navigate("/"), 600);
      } else {
        // --- Nếu là REGISTER: KHÔNG lưu token/user ở bước này ---
        // Backend theo flow mới chỉ trả success + message (không trả token)
        setMessage(data.message || "Đăng ký tạm thành công. Vui lòng kiểm tra email để nhận mã OTP.");
        // mở modal OTP để user nhập mã (giữ email để tiện)
        setOtpModalOpen(true);
        // reset mật khẩu / tên (giữ email để xuất trong modal)
        setPassword("");
        setConfirmPassword("");
        setName("");
        // KHÔNG lưu token/user ở đây
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError("Không thể kết nối tới server.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- OTP flows -------------------
  const handleSendOtp = async (targetEmail = null) => {
    const e = (targetEmail || email || "").trim().toLowerCase();
    if (!e) {
      setError("Vui lòng nhập email để nhận mã OTP.");
      return;
    }
    resetMsgs();
    setOtpSending(true);
    try {
      const r = await fetch(`${API_BASE}/api/user/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });
      const d = await r.json().catch(() => null);
      if (!d) {
        setError("Không nhận được phản hồi từ server.");
        setOtpSending(false);
        return;
      }
      if (!d.success) {
        setError(d.message || "Gửi OTP thất bại.");
        setOtpSending(false);
        return;
      }
      setMessage(d.message || "Đã gửi mã OTP. Kiểm tra email.");
      setOtpModalOpen(true);
    } catch (err) {
      console.error("sendOtp error:", err);
      setError("Lỗi khi gửi OTP.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const e = (email || "").trim().toLowerCase();
    if (!e || !otp) {
      setError("Vui lòng nhập email và mã OTP.");
      return;
    }
    resetMsgs();
    setOtpVerifying(true);
    try {
      const r = await fetch(`${API_BASE}/api/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, otp: otp.trim() }),
      });
      const d = await r.json().catch(() => null);
      if (!d) {
        setError("Không nhận được phản hồi từ server.");
        setOtpVerifying(false);
        return;
      }
      if (!d.success) {
        setError(d.message || "Xác thực OTP thất bại.");
        setOtpVerifying(false);
        return;
      }

      // thành công -> lưu token & user (server có thể trả token & user)
      if (d.token) {
        try {
          localStorage.setItem("token", d.token);
        } catch (err) {}
      }
      if (d.user) {
        try {
          localStorage.setItem("user", JSON.stringify(d.user));
          window.dispatchEvent(new CustomEvent("tmusic_login", { detail: d.user }));
        } catch (err) {}
      } else if (d.token) {
        // fallback: try fetching /me
        await fetchMeAndSave(d.token);
      }

      setMessage(d.message || "Xác thực thành công.");
      setOtpModalOpen(false);
      setOtp("");
      // redirect to home after success
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      console.error("verifyOtp error:", err);
      setError("Lỗi khi xác thực OTP.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // ------------------- Google Identity -------------------
  useEffect(() => {
    // load Google Identity script dynamically and render button
    const clientId = ""; // đặt GOOGLE_CLIENT_ID ở đây nếu muốn bật

    if (!clientId) {
      // no client id - skip initializing
      return;
    }

    const addScriptAndInit = () => {
      if (googleInitializedRef.current) return;
      const scriptId = "google-identity-js";
      if (document.getElementById(scriptId)) {
        // already loaded
        initGoogle();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogle();
      };
      script.onerror = () => {
        console.error("Không thể load Google Identity script.");
      };
      document.head.appendChild(script);
    };

    const initGoogle = () => {
      try {
        if (!window.google || !window.google.accounts || googleInitializedRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          ux_mode: "popup",
        });
        // render button into ref if exists
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: "280",
          });
        }
        // optionally one-tap prompt (disabled here)
        // window.google.accounts.id.prompt();
        googleInitializedRef.current = true;
      } catch (err) {
        console.error("initGoogle error:", err);
      }
    };

    addScriptAndInit();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleResponse = async (response) => {
    // response.credential is the id_token
    if (!response || !response.credential) {
      setError("Không nhận được phản hồi từ Google.");
      return;
    }
    resetMsgs();
    setLoading(true);
    try {
      const idToken = response.credential;
      const r = await fetch(`${API_BASE}/api/user/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const d = await r.json().catch(() => null);
      if (!d) {
        setError("Không nhận được phản hồi từ server.");
        setLoading(false);
        return;
      }
      if (!d.success) {
        setError(d.message || "Đăng nhập Google thất bại.");
        setLoading(false);
        return;
      }
      if (d.token) {
        try {
          localStorage.setItem("token", d.token);
        } catch (err) {}
      }
      if (d.user) {
        try {
          localStorage.setItem("user", JSON.stringify(d.user));
          window.dispatchEvent(new CustomEvent("tmusic_login", { detail: d.user }));
        } catch (err) {}
      } else if (d.token) {
        await fetchMeAndSave(d.token);
      }
      setMessage(d.message || "Đăng nhập bằng Google thành công.");
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      console.error("googleLogin frontend error:", err);
      setError("Lỗi khi đăng nhập bằng Google.");
    } finally {
      setLoading(false);
    }
  };

  // Fallback click to open Google prompt (in case you prefer popup)
  const handleGoogleClick = () => {
    if (window.google && window.google.accounts && window.google.accounts.id && googleInitializedRef.current) {
      window.google.accounts.id.prompt();
    } else {
      setError("Google Sign-In chưa sẵn sàng. Vui lòng thử lại sau.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center text-white px-6 py-16">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-4">
          <img src={assets.tmusic_logo} alt="T-Music" className="w-12" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-orange-500">
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </h1>
        </div>

        <p className="text-gray-400 max-w-md text-center mb-10">
          {isLogin
            ? "Chào mừng trở lại! Hãy đăng nhập để tiếp tục thưởng thức âm nhạc."
            : "Tạo tài khoản để khám phá thế giới âm nhạc không giới hạn cùng T-Music."}
        </p>

        {/* Form */}
        <div className="bg-gradient-to-b from-neutral-900 to-black border border-orange-500/40 shadow-lg rounded-2xl w-full max-w-md p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {message && (
              <div className="text-green-300 p-2 rounded bg-green-900/10">{message}</div>
            )}
            {error && (
              <div className="text-red-300 p-2 rounded bg-red-900/10">{error}</div>
            )}

            {/* Email */}
            <div className="flex flex-col text-left">
              <label className="mb-1 text-gray-300 font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white"
                placeholder="Nhập email..."
              />
            </div>

            {/* Username khi đăng ký */}
            {!isLogin && (
              <div className="flex flex-col text-left">
                <label className="mb-1 text-gray-300 font-semibold">Tên người dùng</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="p-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white"
                  placeholder="Nhập tên của bạn..."
                />
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col text-left">
              <label className="mb-1 text-gray-300 font-semibold">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="p-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white"
                placeholder="Nhập mật khẩu..."
              />
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div className="flex flex-col text-left">
                <label className="mb-1 text-gray-300 font-semibold">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="p-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white"
                  placeholder="Nhập lại mật khẩu..."
                />
              </div>
            )}

            {/* Submit */}
            <button
              className="bg-orange-500 hover:bg-orange-600 text-black font-semibold py-3 rounded-full mt-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
            </button>
          </form>

          {/* Switch */}
          <p className="text-gray-400 text-center mt-6">
            {isLogin ? (
              <>
                Chưa có tài khoản?{" "}
                <span
                  className="text-orange-400 font-semibold cursor-pointer"
                  onClick={() => { setIsLogin(false); resetMsgs(); clearForm(); }}
                >
                  Đăng ký ngay
                </span>
              </>
            ) : (
              <>
                Đã có tài khoản?{" "}
                <span
                  className="text-orange-400 font-semibold cursor-pointer"
                  onClick={() => { setIsLogin(true); resetMsgs(); clearForm(); }}
                >
                  Đăng nhập
                </span>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="mt-20 mb-10 text-gray-500 text-sm">
          © 2025 T-Music — Đỉnh cao âm nhạc dành cho bạn 🎧
        </p>
      </div>

      {/* OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0b0b0b] rounded-xl max-w-md w-full p-6 border border-orange-500/30">
            <h3 className="text-xl font-semibold text-white mb-2">Nhập mã OTP</h3>
            <p className="text-sm text-gray-400 mb-4">
              Mã OTP đã được gửi tới: <span className="text-orange-400">{email}</span>
            </p>

            {message && (
              <div className="text-green-300 p-2 rounded bg-green-900/10 mb-2">{message}</div>
            )}
            {error && (
              <div className="text-red-300 p-2 rounded bg-red-900/10 mb-2">{error}</div>
            )}

            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#111] border border-gray-700 text-white mb-4"
              placeholder="Nhập mã OTP (6 chữ số)..."
            />

            <div className="flex gap-3">
              <button
                onClick={handleVerifyOtp}
                disabled={otpVerifying}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-semibold py-2 rounded"
              >
                {otpVerifying ? "Đang xác thực..." : "Xác thực OTP"}
              </button>
              <button
                onClick={() => handleSendOtp(email)}
                disabled={otpSending}
                className="px-4 py-2 border border-gray-700 rounded text-sm"
              >
                {otpSending ? "Gửi lại..." : "Gửi lại mã"}
              </button>
            </div>

            <div className="mt-3 text-right">
              <button
                onClick={() => { setOtpModalOpen(false); setOtp(""); resetMsgs(); }}
                className="text-sm text-gray-300 hover:underline"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginRegister;
