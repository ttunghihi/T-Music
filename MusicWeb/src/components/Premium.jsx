import React from 'react'
import Navbar from './Navbar'
import { assets } from '../assets/assets'
import { useNavigate } from "react-router-dom";

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Premium = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#07070a] via-[#0b0b0f] to-[#050506] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img src={assets.tmusic_logo} alt="T-Music" className="w-14 h-14 rounded-md object-contain shadow-xl" />
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-orange-400">
                    T-Music <span className="text-white">Premium</span>
                  </h1>
                  <p className="text-sm text-gray-400 mt-1 max-w-xl">
                    Trải nghiệm âm nhạc đỉnh cao — không quảng cáo, chất lượng cao, tải offline và nhiều tiện ích hơn.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Giá</div>
                <div className="text-2xl md:text-3xl font-extrabold text-orange-500">59.000₫ <span className="text-sm text-gray-400 font-medium">/ tháng</span></div>
              </div>
              <button
                onClick={() => navigate("/premiumrequest")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-black font-semibold px-5 py-3 rounded-full shadow-2xl transform transition hover:-translate-y-0.5"
              >
                Nâng cấp ngay
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Card - Premium features */}
            <div className="lg:col-span-2 bg-[rgba(255,255,255,0.03)] border border-white/6 backdrop-blur-md rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Gói Premium</h2>
                  <p className="text-sm text-gray-400 max-w-2xl">Mở khóa toàn bộ tính năng, trải nghiệm âm thanh phòng thu và ưu đãi dành riêng cho thành viên.</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                  <span className="text-xs text-orange-300 font-semibold">Bán chạy</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
  <div>
    <ul className="space-y-4">
      <li className="flex items-start gap-3">
        <span className="text-orange-400 mt-1"><CheckIcon className="w-5 h-5" /></span>
        <div>
          <div className="font-semibold text-white">Upload nhạc lên website</div>
          <div className="text-sm text-gray-400">Chia sẻ sản phẩm âm nhạc của bạn đến mọi người.</div>
        </div>
      </li>

      <li className="flex items-start gap-3">
        <span className="text-orange-400 mt-1"><CheckIcon className="w-5 h-5" /></span>
        <div>
          <div className="font-semibold text-white">Tạo Playlist cá nhân</div>
          <div className="text-sm text-gray-400">Sắp xếp và lưu trữ những bài hát bạn yêu thích.</div>
        </div>
      </li>
    </ul>
  </div>

  <div>
    <ul className="space-y-4">
      <li className="flex items-start gap-3">
        <span className="text-orange-400 mt-1"><CheckIcon className="w-5 h-5" /></span>
        <div>
          <div className="font-semibold text-white">Nghe 320kbps & lossless</div>
          <div className="text-sm text-gray-400">Âm thanh chất lượng cao, sắc nét và chân thật.</div>
        </div>
      </li>

      <li className="flex items-start gap-3">
        <span className="text-orange-400 mt-1"><CheckIcon className="w-5 h-5" /></span>
        <div>
          <div className="font-semibold text-white">Không quảng cáo</div>
          <div className="text-sm text-gray-400">Tận hưởng âm nhạc liền mạch, không bị gián đoạn.</div>
        </div>
      </li>
    </ul>
  </div>
</div>


              {/* Illustration / feature highlight */}
              <div className="mt-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="p-6 rounded-xl bg-gradient-to-r from-white/3 to-white/2 border border-white/5 shadow-inner">
                    <h3 className="text-lg font-bold text-white">Trải nghiệm nghe nâng tầm</h3>
                    <p className="text-sm text-gray-300 mt-2">Cá nhân hoá playlist, crossfade, chế độ nghe chuyên sâu và hỗ trợ đa thiết bị.</p>
                    <div className="mt-4 inline-flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-200">Crossfade</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-200">EQ nâng cao</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-200">Multi-device</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-56">
                  <div className="rounded-xl overflow-hidden border border-white/6 shadow-lg p-4 bg-gradient-to-b from-[#0b0b0f] to-[#070707]">
                    <div className="text-sm text-gray-400">Ưu đãi dành cho bạn</div>
                    <div className="mt-3 text-2xl font-extrabold text-orange-400">59.000₫ <span className="text-xs text-gray-400 font-medium">/ tháng</span></div>
                    <div className="mt-4">
                      <button
                        onClick={() => navigate("/premiumrequest")}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 text-black font-semibold transition transform hover:scale-[1.01]"
                      >
                        Nâng cấp ngay
                      </button>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">Hủy bất kỳ lúc nào. Thanh toán an toàn.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - FAQ / quick benefits */}
            <aside className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0b0b0f] to-[#070707] border border-white/6 shadow-lg">
                <h4 className="text-lg font-bold text-orange-400">Lợi ích nhanh</h4>
                <ul className="mt-4 space-y-3 text-gray-300">
  <li className="text-sm flex items-start gap-3">
    <span className="mt-1 text-orange-400"><CheckIcon className="w-4 h-4" /></span>
    Upload nhạc lên T-Music
  </li>
  <li className="text-sm flex items-start gap-3">
    <span className="mt-1 text-orange-400"><CheckIcon className="w-4 h-4" /></span>
    Tạo Playlist cá nhân
  </li>
  <li className="text-sm flex items-start gap-3">
    <span className="mt-1 text-orange-400"><CheckIcon className="w-4 h-4" /></span>
    Nghe chất lượng 320kbps & lossless
  </li>
  <li className="text-sm flex items-start gap-3">
    <span className="mt-1 text-orange-400"><CheckIcon className="w-4 h-4" /></span>
    Không quảng cáo khi nghe nhạc
  </li>
</ul>

              </div>

              <div className="p-6 rounded-2xl bg-[linear-gradient(180deg,#071017,rgba(0,0,0,0.3))] border border-white/6 shadow-lg">
                <h4 className="text-lg font-bold text-white">Câu hỏi thường gặp</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-400">
                  <div><span className="font-medium text-gray-200">Hủy gói có được hoàn tiền?</span> — Có, theo chính sách hoàn tiền của T-Music.</div>
                  <div><span className="font-medium text-gray-200">Có thể dùng thử không?</span> — Thỉnh thoảng có chương trình dùng thử. Theo dõi thông báo app.</div>
                </div>
              </div>
            </aside>
          </div>

          {/* Footer small */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            © 2025 T-Music — Đỉnh cao âm nhạc dành cho bạn 🎧
          </div>
        </div>
      </div>
    </>
  )
}

export default Premium
