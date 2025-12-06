import React, { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

// Giao diện được nâng cấp: tỉ mỉ, tối giản, "pro" nhưng KHÔNG thay đổi logic hay chức năng.
// Chỉ thay đổi className / cấu trúc DOM để đẹp hơn, thêm transitions, hover, accessibility.

const Sidebar = () => {
  const navigate = useNavigate();
  const { songsData, playWithId } = useContext(PlayerContext);

  // search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!searchOpen) {
      setQuery("");
      setResults([]);
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    const matched = (songsData || []).filter((s) => {
      const name = (s.name || "").toLowerCase();
      const author = (s.author || "Unknown").toLowerCase();
      return name.includes(q) || author.includes(q);
    });

    setResults(matched);
  }, [query, songsData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };

    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [searchOpen]);

  const handlePlay = (song) => {
    if (!song) return;
    playWithId(song._id);
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  };

  return (
    <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col gap-4 p-4 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4">
        <img className="w-12 h-12 rounded-md shadow-md" src={assets.Tmsl} alt="Tmsl Logo" />
        <div>
          <h1 className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-pink-300 to-yellow-200">T-Music</h1>
          <p className="text-xs text-gray-400">Nghe. Tạo. Chia sẻ.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <nav className="bg-[#0f0f0f] border border-[#212121] rounded-xl shadow-sm p-3">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Trang chủ"
          >
            <img className="w-5 h-5" src={assets.home_icon} alt="home" />
            <span className="font-semibold">Trang chủ</span>
          </button>

          {/* Search area */}
          <div className="mt-3" ref={containerRef}>
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm focus:outline-none"
                aria-expanded={searchOpen}
                aria-controls="sidebar-search-results"
              >
                <img className="w-5 h-5" src={assets.search_icon} alt="search" />
                <span className="font-semibold">Tìm kiếm</span>
                <span className="ml-auto text-xs text-gray-400">K</span>
              </button>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2 px-2 py-2">
                  <img className="w-5 h-5" src={assets.search_icon} alt="search" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm theo tên bài hoặc nghệ sĩ..."
                    className="w-full bg-transparent border border-[#262626] rounded-full px-3 py-2 outline-none text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                    aria-label="Tìm bài hát"
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                      setResults([]);
                    }}
                    className="text-sm px-3 py-1 rounded-md hover:bg-white/5 transition-colors"
                    aria-label="Hủy tìm kiếm"
                  >
                    Hủy
                  </button>
                </div>

                {/* Results overlay */}
                <div
                  id="sidebar-search-results"
                  className="absolute left-0 right-0 mt-2 z-50 bg-gradient-to-b from-[#0b0b0b] to-[#080808] border border-[#1b1b1b] rounded-2xl shadow-2xl max-h-80 overflow-auto backdrop-blur-sm"
                >
                  <div className="px-4 py-2 border-b border-[#151515] text-sm text-gray-300 flex items-center justify-between">
                    <div>Kết quả tìm kiếm ({results.length})</div>
                    <div className="text-xs text-gray-500">Nhấn Esc để đóng</div>
                  </div>

                  <div className="p-2">
                    {query && results.length === 0 && (
                      <div className="text-sm text-gray-500 px-1">Không tìm thấy</div>
                    )}

                    {results.map((s) => (
                      <button
                        key={s._id}
                        onClick={() => handlePlay(s)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
                        aria-label={`Play ${s.name} - ${s.author || 'Unknown'}`}
                      >
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate font-medium">{s.name}</div>
                          <div className="text-xs text-gray-400 truncate">{s.author || "Unknown"}</div>
                        </div>
                        <div className="text-xs text-gray-400">{s.duration}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="bg-[#0f0f0f] border border-[#212121] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img className="w-7 h-7" src={assets.stack_icon} alt="library" />
              <p className="font-semibold">Thư viện</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-md hover:bg-white/5 transition-colors" aria-label="previous">
                <img className="w-4 h-4" src={assets.arrow_icon} alt="prev" />
              </button>
              <button className="p-2 rounded-md hover:bg-white/5 transition-colors" aria-label="new">
                <img className="w-4 h-4" src={assets.plus_icon} alt="add" />
              </button>
            </div>
          </div>

          <div className="bg-[#171717] rounded-xl p-4">
            <h2 className="text-sm font-semibold">Tạo playlist</h2>
            <p className="text-xs text-gray-400 mt-1">Chúng tôi có thể giúp bạn bắt đầu danh sách phát chuyên nghiệp.</p>
            <button onClick={() => navigate("/createplaylist")} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium shadow-sm hover:scale-[0.995] transition-transform">
              <span>Tạo playlist</span>
            </button>
          </div>

          <div className="bg-[#171717] rounded-xl p-4">
            <h2 className="text-sm font-semibold">Thêm bài hát</h2>
            <p className="text-xs text-gray-400 mt-1">Đăng tải bài hát của bạn và chia sẻ với mọi người.</p>
            <button onClick={() => navigate("/useraddsong")} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium shadow-sm hover:scale-[0.995] transition-transform">
              <span>Tải lên</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto px-4 text-xs text-gray-500">v1.0 • © {new Date().getFullYear()} T-Music</div>
    </aside>
  );
};

export default Sidebar;
