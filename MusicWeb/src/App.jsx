// src/App.jsx  (hoặc sửa file App hiện tại)
import React from "react";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Display from "./components/Display";
import { PlayerContext } from "./context/PlayerContext";
import Chatbot from "./components/Chatbot";
import AdModal from "./components/AdModal";

const AD_INTERVAL_MS = 5 * 60 * 1000; // 5 phút

const App = () => {
  const { audioRef, track, songsData } = React.useContext(PlayerContext);

  // user state giống Navbar (đọc localStorage "user")
  const [user, setUser] = React.useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isPremium = Boolean(user && user.isPremium);

  const [showAd, setShowAd] = React.useState(false);
  const adTimerRef = React.useRef(null);

  // handler show once on mount (if not premium)
  React.useEffect(() => {
    if (isPremium) return; // không show nếu đã premium

    // show ngay khi mở trang
    setShowAd(true);

    // set up interval để show lại mỗi 5 phút
    adTimerRef.current = setInterval(() => {
      setShowAd(true);
    }, AD_INTERVAL_MS);

    return () => {
      if (adTimerRef.current) {
        clearInterval(adTimerRef.current);
        adTimerRef.current = null;
      }
    };
    // chỉ chạy 1 lần khi mount; isPremium có thể thay đổi qua event listener dưới
  }, []); // intentionally empty

  // lắng nghe sự kiện từ Navbar / storage để cập nhật user realtime
  React.useEffect(() => {
    const onLogin = (e) => {
      const newUser = e?.detail;
      if (newUser) {
        setUser(newUser);
        if (newUser.isPremium) {
          // nếu mới là premium, tắt modal và clear interval
          setShowAd(false);
          if (adTimerRef.current) {
            clearInterval(adTimerRef.current);
            adTimerRef.current = null;
          }
        }
      }
    };
    const onLogout = () => {
      setUser(null);
      // khi logout, có thể muốn resume quảng cáo -> không auto show ngay, nhưng interval vẫn chạy
    };
    const onStorage = (ev) => {
      if (ev.key === "user") {
        if (ev.newValue) {
          try {
            const parsed = JSON.parse(ev.newValue);
            setUser(parsed);
            if (parsed.isPremium) {
              setShowAd(false);
              if (adTimerRef.current) {
                clearInterval(adTimerRef.current);
                adTimerRef.current = null;
              }
            }
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("tmusic_login", onLogin);
    window.addEventListener("tmusic_logout", onLogout);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("tmusic_login", onLogin);
      window.removeEventListener("tmusic_logout", onLogout);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // đóng modal
  const handleCloseAd = () => {
    setShowAd(false);
  };

  return (
    <div className="h-screen bg-black">
      {/* popup quảng cáo */}
      {!isPremium && (
        <AdModal
          open={showAd}
          onClose={handleCloseAd}
        />
      )}

      {songsData.length !== 0 ? (
        <>
          <div className="h-[90%] flex">
            <Chatbot />
            <Sidebar />
            <Display />
          </div>
          <Player />
        </>
      ) : null}

      <audio ref={audioRef} src={track ? track.file : ""} preload="auto"></audio>
    </div>
  );
};

export default App;
