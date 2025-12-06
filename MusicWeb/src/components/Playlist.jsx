// PlaylistList.jsx
import React, { useEffect, useState, useContext } from "react";
import Navbar from "./Navbar";
import { assets } from "../assets/assets";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

const API_BASE = "http://localhost:4000";

const Playlist = () => {
  const navigate = useNavigate();
  const ctx = useContext(PlayerContext);

  const fetchMyPlaylistsFromCtx =
    ctx && typeof ctx.fetchMyPlaylists === "function"
      ? ctx.fetchMyPlaylists
      : null;

  const playlistsFromCtx =
    ctx && Array.isArray(ctx.myPlaylists) ? ctx.myPlaylists : null;

  const [playlists, setPlaylists] = useState(playlistsFromCtx || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    } else setUser(null);
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const doFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        if (fetchMyPlaylistsFromCtx) {
          const res = await fetchMyPlaylistsFromCtx();

          if (Array.isArray(res)) setPlaylists(res);
          else if (res && Array.isArray(res.playlists)) setPlaylists(res.playlists);
          else if (playlistsFromCtx) setPlaylists(playlistsFromCtx);
          else setPlaylists([]);
        } else {
          const token = localStorage.getItem("token") || user?.token;
          const r = await axios.get(`${API_BASE}/api/playlist/my-list`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (r?.data?.success) {
            setPlaylists(r.data.playlists || []);
          } else {
            setError(r?.data?.message || "Không tải được playlist");
            setPlaylists([]);
          }
        }
      } catch (err) {
        console.error("fetchMyPlaylists error:", err);
        setError("Lỗi khi kết nối tới server.");
      } finally {
        setLoading(false);
      }
    };

    doFetch();
  }, [user]);

  const handleDelete = async (playlistId) => {
    if (!window.confirm("Bạn có chắc muốn xoá playlist này?")) return;
    try {
      const token = localStorage.getItem("token") || user?.token;

      const res = await axios.delete(`${API_BASE}/api/playlist/${playlistId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res?.data?.success) {
        setPlaylists((prev) => prev.filter((p) => String(p._id) !== String(playlistId)));

        if (typeof ctx?.fetchMyPlaylists === "function") {
          try {
            await ctx.fetchMyPlaylists();
          } catch {}
        }
      } else {
        alert(res?.data?.message || "Không xoá được playlist.");
      }
    } catch (err) {
      console.error("delete playlist error:", err);
      alert(err?.response?.data?.message || "Lỗi khi xoá playlist");
    }
  };

  // navigate tới trang hiển thị playlist
  // truyền kèm state: playlist object (giúp DisplayPlaylist dùng sẵn nếu muốn)
  const openPlaylist = (playlist) => {
    if (!playlist) return;
    navigate(`/playlist/${playlist._id}`, { state: { playlist } });
  };

  return (
    <>
      <Navbar />
      <div className="px-6 py-6 text-white">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">Playlist của tôi</h1>
            <p className="text-sm text-gray-300 mt-1">{playlists.length} playlist</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/createplaylist")}
              className="bg-orange-500 text-black px-4 py-2 rounded-full font-semibold"
            >
              Tạo playlist mới
            </button>

            <button
              onClick={() => {
                if (typeof fetchMyPlaylistsFromCtx === "function") {
                  fetchMyPlaylistsFromCtx().catch(() => {});
                } else {
                  const token = localStorage.getItem("token") || user?.token;
                  setLoading(true);
                  axios
                    .get(`${API_BASE}/api/playlist/my-list`, {
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    })
                    .then((r) => {
                      if (r?.data?.success) setPlaylists(r.data.playlists || []);
                      else setError("Không tải được playlist");
                    })
                    .catch(() => setError("Lỗi khi kết nối server."))
                    .finally(() => setLoading(false));
                }
              }}
              className="text-sm text-gray-300 underline"
            >
              Làm mới
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-300">{error}</div>}
        {loading && <div className="text-gray-400 mb-4">Đang tải...</div>}

        {playlists.length === 0 && !loading ? (
          <div className="mt-10 bg-[#141414] p-8 rounded-xl text-center">
            <p className="text-gray-300 mb-4">Bạn chưa có playlist nào.</p>
            <p className="text-sm text-gray-400">Tạo playlist để quản lý bài hát của bạn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {playlists.map((p, idx) => (
              <div
                key={p._id || idx}
                className="relative p-3 rounded-xl transition-all hover:scale-[1.03] cursor-pointer shadow-md bg-[#0f0f0f]"
                // mở playlist khi click vào thẻ
                onClick={() => openPlaylist(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openPlaylist(p); }}
              >
                <div>
                  <img
                    src={p.coverUrl || assets.upload_area}
                    alt={p.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                  <div className="font-semibold text-lg">{p.name}</div>
                  <div className="text-sm text-gray-400 truncate">{p.desc || "—"}</div>
                </div>

                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/playlist/${p._id}/edit`, { state: { playlist: p } });
                    }}
                    title="Chỉnh sửa"
                    className="bg-black/40 backdrop-blur-md p-1 rounded-full hover:scale-105 transition-transform"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p._id);
                    }}
                    title="Xoá"
                    className="bg-black/40 backdrop-blur-md p-1 rounded-full hover:scale-105 transition-transform"
                  >
                    🗑️
                  </button>
                </div>

                <div className="absolute left-3 bottom-3 text-xs px-2 py-1 rounded-full bg-black/50 text-gray-200">
                  {p.isPrivate ? "Private" : "Public"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Playlist;
