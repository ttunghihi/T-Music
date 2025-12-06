// src/components/AdModal.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AdModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-ad-title"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal */}
      <div className="relative max-w-xl w-full bg-gradient-to-br from-[#0b0b0f] to-[#070707] text-white rounded-2xl shadow-2xl border border-white/6 p-6 z-10">
        <button
          onClick={onClose}
          aria-label="Đóng quảng cáo"
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          ✕
        </button>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2
              id="premium-ad-title"
              className="text-2xl font-extrabold text-orange-400"
            >
              Nâng cấp lên T-Music Premium
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Không quảng cáo, chất lượng cao và nhiều tính năng
              chuyên nghiệp.
            </p>

            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li>🎧 Nghe 320kbps & lossless</li>
              <li>⛔ Không quảng cáo khi nghe nhạc</li>
              <li>📥 upload nhạc và tạo playlist cá nhân</li>
            </ul>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  onClose(); // đóng popup trước
                  navigate("/premium"); // rồi điều hướng
                }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-black font-semibold"
              >
                Tìm hiểu Premium
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-white/10 text-white"
              >
                Đóng
              </button>
            </div>
          </div>

          <div className="w-36 h-36 flex items-center justify-center rounded-xl bg-white/5 border border-white/6">
            <div className="text-center">
              <div className="text-4xl">👑</div>
              <div className="text-xs text-gray-300 mt-1">Premium</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdModal;
