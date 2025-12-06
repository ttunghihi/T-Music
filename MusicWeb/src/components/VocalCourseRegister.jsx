// VocalCourseRegister.jsx
import React from "react";
import Navbar from "./Navbar";
import { assets } from "../assets/assets";

const VocalCourseRegister = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10 w-full max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-orange-500 mb-3">
            Khóa Học Thanh Nhạc Cơ Bản
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Cùng <span className="text-orange-400 font-semibold">T-Music Academy</span> nâng cao kỹ năng
            thanh nhạc: hơi thở, phát âm, cao độ và phong cách biểu diễn. Nội dung sẽ sớm được cập nhật.
          </p>
        </div>

        {/* Main content */}
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 items-stretch">
          {/* Left: visual + bullets */}
          <div className="flex-1 rounded-2xl bg-gradient-to-b from-[#071018]/60 to-[#000000]/60 border border-white/6 shadow-2xl p-6 flex flex-col gap-6">
            <div className="rounded-xl overflow-hidden shadow-inner">
              <img
                src={assets.vocal_course || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80&auto=format&fit=crop"}
                alt="Vocal Course"
                className="w-full h-60 object-cover"
              />
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-bold text-white mb-3">Nội dung dự kiến</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Luyện hơi – kiểm soát hơi thở và hỗ trợ âm</li>
                <li>Phát âm & xử lý cao độ chính xác</li>
                <li>Biểu cảm và kỹ năng biểu diễn sân khấu</li>
                <li>Thực hành cùng giảng viên chuyên nghiệp</li>
              </ul>

              <div className="mt-6 inline-flex items-center gap-3">
                <div className="text-lg font-extrabold text-orange-400">Dự kiến học phí</div>
                <div className="text-lg text-gray-300">4.999.000₫ / khóa</div>
              </div>
            </div>

            <div className="mt-auto text-xs text-gray-500">
              Lưu ý: Thông tin khóa học có thể thay đổi theo thời điểm và chương trình đào tạo.
            </div>
          </div>

          {/* Right: development notice (thay form) */}
          <aside className="w-full lg:w-[420px] rounded-2xl bg-gradient-to-b from-[#0b0b0f] to-[#080808] border border-white/6 shadow-2xl p-6 flex flex-col justify-center items-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-400/20">
                <svg className="w-10 h-10 text-orange-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-white">Tính năng đang được phát triển</h3>
              <p className="text-gray-300 max-w-xs">
                Chức năng đăng ký trực tiếp cho khóa học hiện chưa sẵn sàng. Đội ngũ T-Music đang hoàn thiện trải nghiệm.
              </p>

              <div className="mt-3 w-full">
                <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/8 text-left">
                  <div className="text-sm text-gray-300">Bạn muốn được thông báo khi mở đăng ký?</div>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => {
                        // nhẹ nhàng: chỉ toast UI — không tác động logic
                        try {
                          // eslint-disable-next-line no-alert
                          alert("Cảm ơn! Chúng tôi sẽ thông báo khi mở đăng ký.");
                        } catch {}
                      }}
                      className="flex-1 py-3 rounded-full bg-orange-400 hover:bg-orange-500 text-black font-semibold transition"
                    >
                      Thông báo cho tôi
                    </button>

                    <button
                      onClick={() => {
                        // eslint-disable-next-line no-alert
                        alert("Bạn có thể xem trước nội dung hoặc liên hệ chúng tôi để biết thêm.");
                      }}
                      className="py-3 px-4 rounded-full border border-white/8 text-sm text-gray-200 hover:bg-white/3 transition"
                    >
                      Liên hệ
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Hoàn thiện trong vài tuần tới — theo dõi thông báo trong ứng dụng.
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <p className="mt-12 text-gray-500 text-sm text-center">
          © 2025 T-Music Academy — Học hát cùng đam mê 🎶
        </p>
      </div>
    </>
  );
};

export default VocalCourseRegister;
