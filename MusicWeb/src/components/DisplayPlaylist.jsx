// DisplayPlaylist.jsx — UI updated only (logic unchanged)
import React, { useContext, useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import { useParams, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { PlayerContext } from "../context/PlayerContext";

const API_BASE = "https://t-music.onrender.com";

const DisplayPlaylist = () => {
  const { id } = useParams();
  const location = useLocation();
  const { playWithId, songsData } = useContext(PlayerContext);

  const [playlistData, setPlaylistData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [addSearchOpen, setAddSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const addContainerRef = useRef(null);

  const [allSongsForSearch, setAllSongsForSearch] = useState([]);

  // token header helper
  const tokenHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // --- backend helpers (unchanged logic) ---
  const fetchPlaylistMeta = async (playlistId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/playlist/${playlistId}`);
      if (res?.data?.success && res.data.playlist) return res.data.playlist;
      return null;
    } catch (err) {
      return null;
    }
  };

  const fetchPlaylistSongsOnly = async (playlistId) => {
    if (!playlistId) return [];
    try {
      const res = await axios.get(`${API_BASE}/api/playlist/${playlistId}/get-songs`);
      if (res?.data?.success && Array.isArray(res.data.songs)) return res.data.songs;
      return [];
    } catch (err) {
      return [];
    }
  };

  const fetchPlaylistMetaAndSongs = async (playlistId) => {
    if (!playlistId) return;
    setLoading(true);
    setError(null);
    try {
      const meta = await fetchPlaylistMeta(playlistId);
      if (!meta) {
        setError("Không tìm thấy playlist");
        setPlaylistData(null);
        return;
      }

      const songsFromEndpoint = await fetchPlaylistSongsOnly(playlistId);
      if (songsFromEndpoint && songsFromEndpoint.length >= 0) {
        setPlaylistData({ ...meta, songs: songsFromEndpoint });
        return;
      }

      const songsArr = Array.isArray(meta.songs) ? meta.songs : [];
      const firstSong = songsArr[0];
      const isPopulated = !!(firstSong && (firstSong.name || firstSong.title));
      if (isPopulated) {
        setPlaylistData(meta);
        return;
      }

      let songsList = allSongsForSearch;
      if (!Array.isArray(songsList) || songsList.length === 0) {
        try {
          const sres = await axios.get(`${API_BASE}/api/song/list`);
          songsList = sres?.data?.songs || [];
          setAllSongsForSearch(songsList);
        } catch (e) {
          songsList = [];
        }
      }

      const populatedSongs = songsArr.map((s) => {
        const idStr = String(s._id || s);
        const found = songsList.find((x) => String(x._id || x.id) === idStr);
        if (found) return found;
        return { _id: idStr, name: "Unknown", author: "Unknown", image: assets.upload_area, duration: "—" };
      });

      setPlaylistData({ ...meta, songs: populatedSongs });
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải playlist");
      setPlaylistData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndSetSongs = async (playlistId, meta) => {
    try {
      const songsFromEndpoint = await fetchPlaylistSongsOnly(playlistId);
      if (songsFromEndpoint && songsFromEndpoint.length >= 0) {
        setPlaylistData({ ...meta, songs: songsFromEndpoint });
        return;
      }

      const songsArr = Array.isArray(meta?.songs) ? meta.songs : [];
      const firstSong = songsArr[0];
      const isPopulated = !!(firstSong && (firstSong.name || firstSong.title));
      if (isPopulated) {
        setPlaylistData(meta);
        return;
      }

      let songsList = allSongsForSearch;
      if (!Array.isArray(songsList) || songsList.length === 0) {
        try {
          const sres = await axios.get(`${API_BASE}/api/song/list`);
          songsList = sres?.data?.songs || [];
          setAllSongsForSearch(songsList);
        } catch (e) {
          songsList = [];
        }
      }

      const populatedSongs = songsArr.map((s) => {
        const idStr = String(s._id || s);
        const found = songsList.find((x) => String(x._id || x.id) === idStr);
        if (found) return found;
        return { _id: idStr, name: "Unknown", author: "Unknown", image: assets.upload_area, duration: "—" };
      });

      setPlaylistData({ ...meta, songs: populatedSongs });
    } catch (err) {
      // ignore
    }
  };

  // initial load
  useEffect(() => {
    const statePlaylist = location?.state?.playlist;
    if (statePlaylist && statePlaylist._id && String(statePlaylist._id) === String(id)) {
      setPlaylistData(statePlaylist);
      fetchAndSetSongs(id, statePlaylist);
      return;
    }
    fetchPlaylistMetaAndSongs(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location?.state]);

  // fetch current user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/user/me`, { headers: tokenHeader() });
        if (res?.data?.success && res.data.user) setCurrentUser(res.data.user);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const isInPlaylist = (songId) => {
    if (!playlistData) return false;
    const { songs } = playlistData;
    if (!songs) return false;
    return songs.some((s) => String(s._id || s) === String(songId));
  };

  const addSong = async (songId) => {
    if (!playlistData) return;
    setActionMessage(null);
    setActionLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/playlist/${playlistData._id}/songs`,
        { songId },
        { headers: tokenHeader() }
      );
      if (res?.data?.success) {
        const songsFromEndpoint = await fetchPlaylistSongsOnly(playlistData._id);
        if (songsFromEndpoint && songsFromEndpoint.length >= 0) {
          setPlaylistData((prev) => ({ ...prev, songs: songsFromEndpoint }));
        } else if (res.data.playlist) {
          await fetchAndSetSongs(res.data.playlist._id || playlistData._id, res.data.playlist);
        } else {
          setPlaylistData((prev) => {
            const newSong = { _id: songId, name: "Unknown", author: "Unknown", image: assets.upload_area, duration: "—" };
            return { ...prev, songs: [...(prev.songs || []), newSong] };
          });
        }
        setActionMessage("Đã thêm bài vào playlist");
      } else {
        setActionMessage(res?.data?.message || "Thêm thất bại");
      }
    } catch (err) {
      console.error("addSong error", err?.response || err);
      setActionMessage(err?.response?.data?.message || "Lỗi khi thêm bài");
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 2000);
    }
  };

  const removeSong = async (songId) => {
    if (!playlistData) return;
    setActionMessage(null);
    setActionLoading(true);
    try {
      const res = await axios.delete(
        `${API_BASE}/api/playlist/${playlistData._id}/songs/${songId}`,
        { headers: tokenHeader() }
      );
      if (res?.data?.success) {
        const songsFromEndpoint = await fetchPlaylistSongsOnly(playlistData._id);
        if (songsFromEndpoint && songsFromEndpoint.length >= 0) {
          setPlaylistData((prev) => ({ ...prev, songs: songsFromEndpoint }));
        } else if (res.data.playlist) {
          await fetchAndSetSongs(res.data.playlist._id || playlistData._id, res.data.playlist);
        } else {
          setPlaylistData((prev) => ({ ...prev, songs: (prev.songs || []).filter((s) => String(s._id || s) !== String(songId)) }));
        }
        setActionMessage("Đã xoá bài khỏi playlist");
      } else {
        setActionMessage(res?.data?.message || "Xoá thất bại");
      }
    } catch (err) {
      console.error("removeSong error", err?.response || err);
      setActionMessage(err?.response?.data?.message || "Lỗi khi xoá bài");
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 2000);
    }
  };

  // search overlay logic
  useEffect(() => {
    if (!addSearchOpen) {
      setQuery("");
      setResults([]);
      return;
    }
    setTimeout(() => inputRef.current?.focus(), 50);

    if (Array.isArray(songsData) && songsData.length > 0) {
      setAllSongsForSearch(songsData);
      return;
    }

    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/song/list`);
        const list = res?.data?.songs || [];
        setAllSongsForSearch(list);
      } catch (err) {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addSearchOpen, songsData]);

  useEffect(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    const matched = (allSongsForSearch || []).filter((s) => {
      const name = (s.name || s.title || "").toLowerCase();
      const author = ((s.author || s.artist || s.singer || "") + "").toLowerCase();
      return name.includes(q) || author.includes(q);
    });

    setResults(matched.slice(0, 50));
  }, [query, allSongsForSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!addContainerRef.current) return;
      if (!addContainerRef.current.contains(e.target)) {
        setAddSearchOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setAddSearchOpen(false);
    };

    if (addSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [addSearchOpen]);

  const handleSelectAndAdd = async (song) => {
    if (!song || !song._id) return;
    setActionLoading(true);
    setActionMessage(null);
    await addSong(song._id);
    setActionLoading(false);
    setAddSearchOpen(false);
    setQuery("");
    setResults([]);
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="px-6 py-10 text-gray-300">Đang tải playlist...</div>
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="px-6 py-10 text-red-300">{error}</div>
      </>
    );

  if (!playlistData) return null;

  const songs = Array.isArray(playlistData.songs) ? playlistData.songs : [];

  // prepare playlist queue (normalize items like DisplayAlbum does)
  const playlistQueue = songs.map((s) => {
    if (!s) return s;
    return { ...s, _id: String(s._id || s.id || s), type: s.type || "song" };
  });

  const creatorId =
    playlistData && playlistData.creator ? (playlistData.creator._id || playlistData.creator) : null;
  const isCreator = currentUser && creatorId && String(currentUser._id || currentUser.id) === String(creatorId);

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="mt-10 px-6">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex items-center gap-5">
            <img
              className="w-36 h-36 rounded-lg object-cover shadow-lg"
              src={playlistData.coverUrl || assets.upload_area}
              alt={playlistData.name}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-400 uppercase tracking-wide">Playlist</p>
            <div className="flex items-center gap-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white truncate">{playlistData.name}</h2>

              <div className="ml-auto flex items-center gap-3">
                <div ref={addContainerRef} className="relative">
                  <button
                    onClick={() => setAddSearchOpen((s) => !s)}
                    className="px-3 py-2 rounded-full bg-white/6 text-white hover:bg-white/8 transition"
                    title="Tìm và thêm bài vào playlist này"
                  >
                    <span className="mr-2">➕</span> Thêm vào Playlist
                  </button>

                  {addSearchOpen && (
                    <div
                      className="absolute right-0 mt-3 w-[380px] max-h-[420px] bg-[#0b0b0b] rounded-xl border border-white/6 shadow-2xl z-50 overflow-hidden"
                      role="dialog"
                      aria-label="Thêm bài"
                    >
                      <div className="p-3 border-b border-white/6 flex items-center gap-2">
                        <img src={assets.search_icon} alt="search" className="w-5" />
                        <input
                          ref={inputRef}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Tìm theo tên bài hoặc nghệ sĩ..."
                          className="flex-1 bg-transparent border border-[#222] rounded px-3 py-2 outline-none text-white placeholder:text-[#9a9a9a]"
                        />
                        <button
                          onClick={() => {
                            setAddSearchOpen(false);
                            setQuery("");
                            setResults([]);
                          }}
                          className="text-sm px-3 py-2 text-gray-300"
                        >
                          Hủy
                        </button>
                      </div>

                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-white/6 text-sm text-[#cfcfcf]">
                          Kết quả tìm kiếm ({results.length})
                        </div>

                        <div className="max-h-[320px] overflow-auto">
                          {query && results.length === 0 && (
                            <div className="text-sm text-[#a7a7a7] px-3 py-4">Không tìm thấy</div>
                          )}

                          {results.map((s) => (
                            <div
                              key={s._id}
                              onClick={() => handleSelectAndAdd(s)}
                              className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer"
                            >
                              <img
                                src={s.image || s.img || assets.upload_area}
                                alt={s.name}
                                className="w-12 h-12 rounded object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white truncate">{s.name}</div>
                                <div className="text-xs text-[#a7a7a7] truncate">{s.author || s.artist || "Unknown"}</div>
                              </div>
                              <div className="text-xs text-[#a7a7a7]">{s.duration || "—"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isCreator && (
                  <button
                    onClick={() => setAddSearchOpen((s) => !s)}
                    className="px-3 py-2 rounded-full bg-white/6 text-white hover:bg-white/8 transition"
                  >
                    📋 Thêm bài hát
                  </button>
                )}
              </div>
            </div>

            <p className="mt-3 text-gray-300 truncate">{playlistData.desc || "—"}</p>

            <div className="mt-3 text-sm text-gray-400 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <img className="w-5" src={assets.tmusic_logo} alt="" />
                <b className="ml-1">T-Music</b>
              </div>
              <div>• {songs.length.toLocaleString()} lượt thích</div>
              <div>• <b>{songs.length}</b> bài hát</div>
              <div>• <span className="text-gray-400">2h30m</span></div>
            </div>

            {actionMessage && <div className="mt-4 inline-block text-sm text-green-300">{actionMessage}</div>}
          </div>
        </div>
      </div>

      {/* Table header */}
      <div className="px-6 mt-8">
        <div className="grid grid-cols-12 gap-4 items-center text-[#a7a7a7] text-sm">
          <div className="col-span-6 sm:col-span-6 md:col-span-6 lg:col-span-6 flex items-center gap-3">
            <span className="w-8 text-center">#</span>
            <div className="min-w-0">Tiêu đề</div>
          </div>
          <div className="hidden md:block md:col-span-3 lg:col-span-3">Album / Playlist</div>
          <div className="hidden lg:block lg:col-span-2">Tác giả</div>
          <div className="col-span-2 text-right">Thời lượng</div>
        </div>
        <hr className="border-white/6 mt-3" />

        {/* Songs list */}
        <div className="mt-4 space-y-2">
          {songs.length === 0 ? (
            <div className="text-gray-400 px-2 py-6">Không có bài nào trong playlist này.</div>
          ) : (
            songs.map((item, index) => {
              const songId = item && (item._id || item);
              const inPlaylist = isInPlaylist(songId);

              return (
                <div
                  key={songId || index}
                  className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-white/3 transition"
                >
                  <div
                    className="col-span-6 flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                      // when playing from playlist, pass normalized playlistQueue as queue
                      if (typeof playWithId === "function") {
                        // Tìm bài hát đúng format trong songsData
const fullSong = songsData.find(s => String(s._id) === String(songId));

// Lấy danh sách bài đầy đủ đúng format
const fullQueue = songs
  .map(item => songsData.find(s => String(s._id) === String(item._id)))
  .filter(Boolean);

// Nếu không tìm được data chuẩn thì bỏ qua
if (!fullSong) return;

playWithId(fullSong._id, fullQueue);

                      }
                    }}
                  >
                    <div className="w-8 text-center text-sm text-[#a7a7a7]">{index + 1}</div>
                    <img
                      className="w-12 h-12 rounded object-cover"
                      src={(item && (item.image || item.img)) || assets.upload_area}
                      alt={(item && item.name) || "Unknown"}
                    />
                    <div className="min-w-0">
                      <div className="text-sm text-white truncate">{(item && item.name) || "Unknown title"}</div>
                      <div className="text-xs text-[#a7a7a7] mt-1 truncate">{(item && item.album) || playlistData.name}</div>
                    </div>
                  </div>

                  <div className="hidden md:block md:col-span-3 lg:col-span-3 text-sm text-[#cfcfcf]">{(item && item.album) || playlistData.name}</div>

                  <div className="hidden lg:block lg:col-span-2 text-sm text-[#cfcfcf]">{(item && (item.author || item.artist)) || "Unknown"}</div>

                  <div className="col-span-2 text-right">
                    <div className="text-sm text-[#cfcfcf]">{(item && item.duration) || "—"}</div>
                    <div className="mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inPlaylist) removeSong(songId);
                          else addSong(songId);
                        }}
                        disabled={actionLoading}
                        className={`text-xs px-3 py-1 rounded-full ${inPlaylist ? "bg-white/10 text-white" : "bg-orange-400 text-black"} hover:opacity-90`}
                      >
                        {actionLoading ? "Đang..." : inPlaylist ? "Xóa" : "Thêm"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default DisplayPlaylist;
