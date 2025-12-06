// Navbar.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { assets } from "../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("music"); // "music" | "podcast" | "album"

  const menuRef = useRef(null);

  // Sync activeTab với route hiện tại (bắt các đường dẫn phổ biến)
  useEffect(() => {
    const p = location.pathname || "/";
    if (p.startsWith("/podcast")) {
      setActiveTab("podcast");
    } else if (p === "/" || p.startsWith("/album") || p.startsWith("/albums")) {
      setActiveTab("album");
    } else if (p.startsWith("/songs") || p.startsWith("/song") || p.startsWith("/vocalcourse") || p.startsWith("/likedsongs") || p.startsWith("/playlist")) {
      // các route liên quan âm nhạc coi là music
      setActiveTab("music");
    } else {
      // fallback
      setActiveTab("music");
    }
  }, [location.pathname]);

  // Load user từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (err) {
        setUser(null);
      }
    }
  }, []);

  // Custom event login (same tab)
  useEffect(() => {
    const onLoginEvent = (e) => {
      const newUser = e?.detail;
      if (newUser) setUser(newUser);
    };
    window.addEventListener("tmusic_login", onLoginEvent);
    return () => window.removeEventListener("tmusic_login", onLoginEvent);
  }, []);

  // Custom event logout
  useEffect(() => {
    const onLogoutEvent = () => {
      setUser(null);
    };
    window.addEventListener("tmusic_logout", onLogoutEvent);
    return () => window.removeEventListener("tmusic_logout", onLogoutEvent);
  }, []);

  // Storage event (other tabs)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e?.target) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setOpenMenu(false);
    try {
      window.dispatchEvent(new CustomEvent("tmusic_logout"));
    } catch (err) {
      // ignore
    }
    navigate("/login");
  }, [navigate]);

  // display name helper
  const displayName = () => {
    if (!user) return "";
    if (user.name && user.name.trim()) return user.name;
    if (user.email) return user.email.split("@")[0];
    return "User";
  };

  const isPremium = Boolean(user && user.isPremium);

  // Tab handlers
  const goMusic = () => {
    setActiveTab("music");
    navigate("/songs");
  };
  const goPodcast = () => {
    setActiveTab("podcast");
    navigate("/podcast");
  };
  const goAlbum = () => {
    setActiveTab("album");
    navigate("/");
  };

  // Menu item handlers (hàm riêng để dùng cho click + keyboard)
  const openPlaylist = useCallback(() => {
    navigate("/playlist");
    setOpenMenu(false);
  }, [navigate]);
  const openLiked = useCallback(() => {
    navigate("/likedsongs");
    setOpenMenu(false);
  }, [navigate]);

  // dynamic classes
  const musicClass = activeTab === "music"
    ? "bg-white text-black"
    : "bg-transparent text-white/90 hover:bg-white/10";
  const podcastClass = activeTab === "podcast"
    ? "bg-white text-black"
    : "bg-transparent text-white/90 hover:bg-white/10";
  const albumClass = activeTab === "album"
    ? "bg-white text-black"
    : "bg-transparent text-white/90 hover:bg-white/10";

  return (
    <>
      <div className="w-full sticky top-0 z-30 bg-neutral-900/60 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: back / forward */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
              aria-label="Home"
            ></div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/40 transition"
                aria-label="Quay lại"
              >
                <img src={assets.arrow_left} alt="Quay lại" className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate(1)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/40 transition"
                aria-label="Chuyển tiếp"
              >
                <img src={assets.arrow_right} alt="Chuyển tiếp" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right content: pills & user */}
          <div className="flex items-center gap-3">
            <p
              onClick={() => navigate("/vocalcourse")}
              className="cursor-pointer bg-green-500 text-white text-[15px] px-4 py-1 rounded-2xl hidden md:inline-flex items-center justify-center hover:brightness-95 transition"
            >
              Khóa học thanh nhạc cơ bản
            </p>

            {isPremium ? (
              <p
                className="cursor-pointer bg-amber-400 text-black text-[15px] px-4 py-1 rounded-2xl hidden md:inline-flex items-center justify-center hover:brightness-95 transition"
                title="Tài khoản Premium"
              >
                Premium
              </p>
            ) : (
              <p
                onClick={() => navigate("/premium")}
                className="cursor-pointer bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:inline-flex items-center justify-center hover:brightness-95 transition"
              >
                Khám phá premium
              </p>
            )}

            {!user ? (
              <p
                onClick={() => navigate("/login")}
                className="cursor-pointer bg-orange-500 text-white text-[15px] px-4 py-1 rounded-2xl hidden md:inline-flex items-center justify-center hover:brightness-95 transition"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/login")}
              >
                Đăng nhập
              </p>
            ) : (
              <div className="relative" ref={menuRef}>
                <div className="relative inline-block">
                  {isPremium && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 z-30">
                      {assets.crown ? (
                        <img src={assets.crown} alt="Premium" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-sm">👑</span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setOpenMenu((prev) => !prev)}
                    className="cursor-pointer bg-orange-500 text-white text-[15px] px-4 py-1 rounded-2xl inline-flex items-center gap-2 hover:brightness-95 transition relative"
                    aria-haspopup="true"
                    aria-expanded={openMenu}
                  >
                    {displayName()}
                  </button>
                </div>

                {openMenu && (
                  <div
                    className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-gray-700 rounded-xl shadow-lg z-20"
                    role="menu"
                  >
                    <p
                      onClick={openPlaylist}
                      className="px-4 py-2 hover:bg-neutral-800 cursor-pointer text-gray-200"
                      role="menuitem"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && openPlaylist()}
                    >
                      Playlists
                    </p>
                    <p
                      onClick={openLiked}
                      className="px-4 py-2 hover:bg-neutral-800 cursor-pointer text-gray-200"
                      role="menuitem"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && openLiked()}
                    >
                      Likes
                    </p>
                    <p
                      onClick={handleLogout}
                      className="px-4 py-2 hover:bg-neutral-800 cursor-pointer text-red-400"
                      role="menuitem"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleLogout()}
                    >
                      Đăng xuất
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Secondary navigation with active effect */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={goAlbum}
              onKeyDown={(e) => e.key === "Enter" && goAlbum()}
              aria-pressed={activeTab === "album"}
              aria-label="Albums"
              className={`px-4 py-1 rounded-2xl cursor-pointer transition ${albumClass}`}
            >
              Albums
            </button>
            <button
              onClick={goMusic}
              onKeyDown={(e) => e.key === "Enter" && goMusic()}
              aria-pressed={activeTab === "music"}
              aria-label="Âm nhạc"
              className={`px-4 py-1 rounded-2xl cursor-pointer transition ${musicClass}`}
            >
              Âm nhạc
            </button>

            <button
              onClick={goPodcast}
              onKeyDown={(e) => e.key === "Enter" && goPodcast()}
              aria-pressed={activeTab === "podcast"}
              aria-label="Podcasts"
              className={`px-4 py-1 rounded-2xl cursor-pointer transition ${podcastClass}`}
            >
              Podcasts
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
