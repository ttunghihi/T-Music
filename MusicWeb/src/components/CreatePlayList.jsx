// CreatePlaylist.jsx
import React, { useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import { assets } from "../assets/assets";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000"; // đổi nếu cần

const CreatePlaylist = () => {
  const navigate = useNavigate();

  // user state (undefined = loading, null = not logged in, object = logged in)
  const [user, setUser] = useState(undefined);

  // form
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [cover, setCover] = useState(false); // File or false
  const [isPrivate, setIsPrivate] = useState(true); // playlist mặc định private
  const [coverPreview, setCoverPreview] = useState(null);

  // ui
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const coverInputRef = useRef(null);

  const resetMsgs = () => {
    setMessage(null);
    setError(null);
  };

  // Load user từ localStorage (match AddSong.jsx)
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  // nếu biết user null -> redirect login (hành vi giống AddSong)
  useEffect(() => {
    if (user === undefined) return; // loading
    if (!user) navigate("/login");
  }, [user, navigate]);

  // handle cover change + preview + validation
  const handleCoverChange = (e) => {
    resetMsgs();
    const f = e.target.files?.[0] || false;

    if (!f) {
      setCover(false);
      if (coverPreview) {
        try { URL.revokeObjectURL(coverPreview); } catch {}
        setCoverPreview(null);
      }
      return;
    }

    // validate type and size
    if (!f.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh.");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Ảnh quá lớn (max 5MB).");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    setCover(f);
    if (coverPreview) {
      try { URL.revokeObjectURL(coverPreview); } catch {}
    }
    setCoverPreview(URL.createObjectURL(f));
  };

  // cleanup preview on unmount
  useEffect(() => {
    return () => {
      if (coverPreview) {
        try { URL.revokeObjectURL(coverPreview); } catch {}
      }
    };
  }, [coverPreview]);

  const onSubmit = async (e) => {
    e.preventDefault();
    resetMsgs();

    // check logged in (same logic as AddSong)
    if (user === undefined) {
      setError("Đang kiểm tra trạng thái tài khoản, thử lại sau.");
      return;
    }
    if (!user) {
      navigate("/login");
      return;
    }

    // check premium
    if (!user.isPremium) {
      setError("Chức năng chỉ dành cho user Premium.");
      return;
    }

    // validation
    if (!name || !name.trim()) {
      setError("Vui lòng nhập tên playlist.");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("desc", desc || "");
      formData.append("isPrivate", isPrivate ? "true" : "false");
      if (cover) formData.append("cover", cover);

      const token = localStorage.getItem("token") || (user && user.token);

      const res = await axios.post(`${API_BASE}/api/playlist/create`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
        timeout: 120000,
      });

      if (res?.data?.success) {
        setMessage(res.data.message || "Playlist đã được tạo.");
        // reset form
        setName("");
        setDesc("");
        setIsPrivate(true);
        setCover(false);
        setProgress(0);
        if (coverInputRef.current) coverInputRef.current.value = "";
        if (coverPreview) {
          try { URL.revokeObjectURL(coverPreview); } catch {}
          setCoverPreview(null);
        }

        const newPlaylistId = res.data.playlist && res.data.playlist._id;
        setTimeout(() => {
          if (newPlaylistId) navigate(`/playlist`);
          else navigate("/my-playlists");
        }, 600);
      } else {
        setError(res?.data?.message || "Không tạo được playlist.");
      }
    } catch (err) {
      console.error("create playlist error:", err);
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || "Đã có lỗi xảy ra khi kết nối tới server.");
    } finally {
      setLoading(false);
    }
  };

  // during initial load, return null to match AddSong behavior
  if (user === undefined) return null;

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center text-white px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full max-w-4xl">
          <div className="flex items-center gap-4">
            <img src={assets.tmusic_logo} alt="T-Music" className="w-14 h-14 rounded-md object-contain shadow-lg" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Tạo playlist mới</h1>
            <p className="mt-1 text-gray-400 max-w-xl">
              Tạo playlist cá nhân để lưu bộ sưu tập âm nhạc của bạn. Chức năng dành cho tài khoản Premium.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="text-sm bg-amber-400 text-black px-3 py-1 rounded-full font-medium">Premium</div>
              <div className="text-sm text-gray-400">Bạn có thể chọn đặt riêng tư hoặc công khai cho playlist.</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="mt-8 w-full max-w-4xl">
          <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(7,16,22,0.6),rgba(0,0,0,0.6))] border border-white/6 shadow-2xl p-8">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              {/* messages */}
              <div className="flex flex-col gap-2">
                {message && <div className="text-green-300 p-3 rounded-lg bg-green-900/10 border border-green-800">{message}</div>}
                {error && <div className="text-red-300 p-3 rounded-lg bg-red-900/10 border border-red-800">{error}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cover upload */}
                <div className="flex flex-col items-center gap-3">
                  <label className="text-sm font-semibold text-gray-300">Ảnh bìa (tùy chọn)</label>

                  <input
                    ref={coverInputRef}
                    onChange={handleCoverChange}
                    type="file"
                    id="cover"
                    accept="image/*"
                    hidden
                  />
                  <label htmlFor="cover" className="cursor-pointer">
                    <div className="w-40 h-40 rounded-2xl overflow-hidden border border-white/8 shadow-inner bg-[#071018] flex items-center justify-center transition-transform transform hover:scale-105">
                      <img
                        src={coverPreview || assets.upload_area}
                        className="w-full h-full object-cover"
                        alt="cover preview"
                      />
                    </div>
                  </label>

                  <div className="text-sm text-gray-400 mt-2 text-center">
                    {cover ? cover.name : "Chưa chọn ảnh"}
                  </div>

                  <div className="mt-2 text-xs text-gray-500 text-center max-w-[180px]">
                    Kích thước đề xuất: 800×800 (JPEG/PNG). Dung lượng tối đa 5MB.
                  </div>
                </div>

                {/* Form fields */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-300 font-semibold">Tên playlist</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-3 rounded-lg bg-[#0f1113] border border-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nhập tên playlist"
                        type="text"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-gray-300 font-semibold">Trạng thái</label>
                      <div className="flex items-center gap-4">
                        
                        <button
                          type="button"
                          onClick={() => setIsPrivate(true)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${isPrivate ? "bg-amber-400 text-black" : "bg-transparent text-gray-300 border border-white/6"}`}
                        >
                          Riêng tư
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Riêng tư: chỉ bạn (creator) có thể xem.</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-gray-300 font-semibold">Mô tả</label>
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="p-3 rounded-lg bg-[#0f1113] border border-gray-700 text-white w-full h-36 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Mô tả ngắn cho playlist (tuỳ chọn)"
                    />
                  </div>

                  {/* premium hint */}
                  {user && !user.isPremium && (
                    <div className="mt-1 text-sm text-yellow-300 bg-yellow-900/5 p-3 rounded border border-yellow-800/20">
                      Chức năng này chỉ dành cho user Premium. <span className="font-semibold">Nâng cấp ngay</span> để tạo playlist và quản lý riêng tư.
                    </div>
                  )}

                  {/* progress */}
                  {loading && (
                    <div className="w-full">
                      <div className="text-sm text-gray-400 mb-1">Đang tải lên: {progress}%</div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${progress}%` }}
                          className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* actions */}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-black font-semibold py-3 px-6 rounded-full shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-60"
                      disabled={loading}
                    >
                      {loading ? "Đang tạo..." : "Tạo playlist"}
                    </button>

                    <button
                      type="button"
                      className="text-sm text-gray-300 underline"
                      onClick={() => {
                        setName("");
                        setDesc("");
                        setCover(false);
                        if (coverInputRef.current) coverInputRef.current.value = "";
                        setCoverPreview(null);
                        setIsPrivate(true);
                        resetMsgs();
                      }}
                    >
                      Đặt lại
                    </button>

                    <div className="ml-auto text-xs text-gray-400">
                      © 2025 T-Music
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        
      </div>
    </>
  );
};

export default CreatePlaylist;
