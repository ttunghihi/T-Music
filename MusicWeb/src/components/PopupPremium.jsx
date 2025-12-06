import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Props:
 * - isOpen: boolean - có hiển thị popup không
 * - onClose: () => void - callback khi đóng
 * - title / description (optional)
 *
 * Usage:
 * <PopupPremium isOpen={open} onClose={() => setOpen(false)} />
 */

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PopupPremium({
  isOpen = false,
  onClose = () => {},
  title = "Nâng cấp lên T-Music Premium",
  description = "Trải nghiệm không quảng cáo, nghe 320kbps & lossless, upload nhạc và tạo playlist cá nhân."
}) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const ctaRef = useRef(null);

  // close on ESC & focus management
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      // trap focus inside dialog (simple)
      if (e.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    // focus the CTA for immediate action
    setTimeout(() => ctaRef.current?.focus(), 50);

    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
      aria-label={title}
      onMouseDown={(e) => {
        // click outside to close: if clicking the backdrop (not the panel), close
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* dim + blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      {/* panel */}
      <div
        ref={panelRef}
        className="relative z-10 max-w-2xl w-full mx-auto transform overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b0b0f] to-[#071017] border border-white/6 shadow-2xl p-6 sm:p-8
                   transition-all duration-300 ease-out scale-100 motion-safe:animate-fade-in"
        style={{ boxShadow: "0 10px 40px rgba(2,6,23,0.7)" }}
      >
        {/* top bar with badge + close */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 text-orange-300 rounded-full px-3 py-1 text-sm font-semibold border border-orange-400/20">
              Ưu đãi dành cho bạn
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
          </div>

          <button
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/5 transition"
          >
            <CloseIcon className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* content */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* left: text */}
          <div className="md:col-span-2">
            <p className="text-sm text-gray-300">{description}</p>

            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-orange-400">✔</span>
                <div>
                  <div className="font-semibold text-white">Upload nhạc lên T-Music</div>
                  <div className="text-xs text-gray-400">Chia sẻ tác phẩm của bạn tới cộng đồng.</div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-1 text-orange-400">✔</span>
                <div>
                  <div className="font-semibold text-white">Tạo Playlist cá nhân</div>
                  <div className="text-xs text-gray-400">Sắp xếp và lưu lại bộ sưu tập yêu thích.</div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-1 text-orange-400">✔</span>
                <div>
                  <div className="font-semibold text-white">Nghe 320kbps & lossless</div>
                  <div className="text-xs text-gray-400">Âm thanh sắc nét, chi tiết nhất.</div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-1 text-orange-400">✔</span>
                <div>
                  <div className="font-semibold text-white">Không quảng cáo</div>
                  <div className="text-xs text-gray-400">Nghe nhạc liền mạch, không gián đoạn.</div>
                </div>
              </li>
            </ul>
          </div>

          {/* right: CTA card */}
          <div className="flex flex-col items-stretch gap-3">
            <div className="rounded-xl p-4 bg-gradient-to-b from-white/3 to-white/5 border border-white/6">
              <div className="text-sm text-gray-300">Giá chỉ</div>
              <div className="mt-1 text-2xl font-extrabold text-orange-400">59.000₫ <span className="text-sm text-gray-400 font-medium">/ tháng</span></div>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  ref={ctaRef}
                  onClick={() => navigate("/premiumrequest")}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 text-black font-semibold transition transform hover:-translate-y-[1px]"
                >
                  Nâng cấp ngay
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-lg border border-white/8 text-sm text-gray-200 hover:bg-white/3 transition"
                >
                  Xem sau
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-500">Thanh toán an toàn — Hủy bất kỳ lúc nào.</div>
            </div>

            <div className="text-xs text-gray-400 px-2">
              <strong>Gợi ý:</strong> Nếu bạn là nghệ sĩ, upload ngay để tiếp cận người nghe và nhận phản hồi.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
