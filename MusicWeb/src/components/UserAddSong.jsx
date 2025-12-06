// AddSong.jsx
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { assets } from "../assets/assets";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000"; // nếu khác thì đổi ở đây

const UserAddSong = () => {
  const navigate = useNavigate();

  // current user (undefined = loading, null = not logged in, object = logged in)
  const [user, setUser] = useState(undefined);

  // form state
  const [image, setImage] = useState(false); // File object or false
  const [song, setSong] = useState(false); // File object or false
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [album, setAlbum] = useState("none");
  const [author, setAuthor] = useState(""); // tác giả tùy chọn

  const [albumData, setAlbumData] = useState([]);

  // ui state
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // upload progress 0-100
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // preview state (createObjectURL) and cleanup
  const [imagePreview, setImagePreview] = useState(null);

  const resetMsgs = () => {
    setMessage(null);
    setError(null);
  };

  // Load user từ localStorage (key "user")
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

  // nếu biết user null -> redirect login
  useEffect(() => {
    if (user === undefined) return; // loading
    if (!user) navigate("/login");
  }, [user, navigate]);

  // load albums for select
  const loadAlbumData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/album/list`);
      if (res?.data?.success) {
        setAlbumData(res.data.albums || []);
      } else {
        setAlbumData([]);
        setError("Không tải được dữ liệu album");
      }
    } catch (err) {
      console.error("loadAlbumData error:", err);
      setError("Lỗi khi tải album");
    }
  };

  useEffect(() => {
    loadAlbumData();
  }, []);

  // handlers for file inputs
  const handleSongChange = (e) => {
    const f = e.target.files?.[0] || false;
    setSong(f);
  };

  const handleImageChange = (e) => {
    const f = e.target.files?.[0] || false;
    if (!f) {
      setImage(false);
      setImagePreview(null);
      return;
    }
    // revoke previous preview if any
    if (imagePreview) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {}
    }
    const url = URL.createObjectURL(f);
    setImagePreview(url);
    setImage(f);
  };

  // cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
      }
    };
  }, [imagePreview]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    resetMsgs();

    // check logged in
    if (user === undefined) {
      // still loading user — block submit briefly
      setError("Đang kiểm tra trạng thái tài khoản, thử lại ngay sau.");
      return;
    }
    if (!user) {
      // not logged in
      navigate("/login");
      return;
    }

    // check premium
    if (!user.isPremium) {
      setError("Vui lòng đăng ký premium để sử dụng chức năng này");
      return;
    }

    // basic validation
    if (!name || !desc) {
      setError("Vui lòng nhập tên và mô tả bài hát.");
      return;
    }
    if (!song) {
      setError("Vui lòng chọn file audio.");
      return;
    }
    if (!image) {
      setError("Vui lòng chọn ảnh bìa.");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image); // backend dùng req.files.image
      formData.append("audio", song); // backend dùng req.files.audio
      formData.append("album", album);
      if (author) formData.append("author", author);

      // Endpoint: dựa trên backend bạn gửi, là /api/song/add
      const url = `${API_BASE}/api/song/add`;

      // get token from localStorage (convention mới) or fallback to user.token
      const token = localStorage.getItem("token") || (user && user.token);

      const res = await axios.post(url, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
        timeout: 120000, // optional: 2 phút
      });

      if (res?.data?.success) {
        setMessage(res.data.message || "Bài hát đã được tải lên");
        // reset form
        setName("");
        setDesc("");
        setAlbum("none");
        setImage(false);
        setSong(false);
        setAuthor("");
        setProgress(0);

        // cleanup preview URL
        if (imagePreview) {
          try {
            URL.revokeObjectURL(imagePreview);
          } catch {}
          setImagePreview(null);
        }

        // redirect or stay — here we navigate home shortly
        setTimeout(() => {
          navigate("/");
        }, 600);
      } else {
        setError(res?.data?.message || "Có lỗi khi tải lên");
      }
    } catch (err) {
      console.error("add song error:", err);
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || "Đã có lỗi xảy ra khi kết nối tới server.");
    } finally {
      setLoading(false);
    }
  };

  // during initial load, you can return null or spinner
  if (user === undefined) return null;

  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center text-white px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full max-w-3xl">
          <div className="flex items-center gap-4">
            <img src={assets.tmusic_logo} alt="T-Music" className="w-14 h-14 rounded-md object-contain shadow-lg" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Thêm bài hát</h1>
            <p className="mt-1 text-gray-400 max-w-xl">
              Tải lên bài hát của bạn — bao gồm file audio và ảnh bìa. Tính năng dành riêng cho tài khoản Premium.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="text-sm bg-amber-400 text-black px-3 py-1 rounded-full font-medium">Premium</div>
              <div className="text-sm text-gray-400">Vui lòng đảm bảo bạn có quyền sở hữu nội dung trước khi upload.</div>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="mt-8 w-full max-w-3xl">
          <div className="rounded-2xl bg-gradient-to-b from-[#071016]/60 to-[#000000]/60 border border-white/6 shadow-xl p-8">
            <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
              {/* messages */}
              <div className="flex flex-col gap-2">
                {message && <div className="text-green-300 p-3 rounded-lg bg-green-900/10 border border-green-800">{message}</div>}
                {error && <div className="text-red-300 p-3 rounded-lg bg-red-900/10 border border-red-800">{error}</div>}
              </div>

              {/* Upload area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audio upload */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-gray-300">File audio</label>
                  <div className="flex items-center gap-4">
                    <input
                      onChange={handleSongChange}
                      type="file"
                      id="song"
                      accept="audio/*"
                      hidden
                    />
                    <label htmlFor="song" className="flex items-center gap-4 cursor-pointer">
                      <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-[#071018] to-[#0b0b0f] border border-white/6 shadow-inner flex items-center justify-center">
                        <img src={song ? assets.upload_added : assets.upload_song} alt="upload" className="w-12 h-12 object-contain" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{song ? song.name : "Chưa chọn file audio"}</div>
                        <div className="text-sm text-gray-400 mt-1">Hỗ trợ mp3, m4a, wav... (tối đa tuỳ server)</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Image upload */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-gray-300">Ảnh bìa</label>
                  <div className="flex items-center gap-4">
                    <input
                      onChange={handleImageChange}
                      type="file"
                      id="image"
                      accept="image/*"
                      hidden
                    />
                    <label htmlFor="image" className="cursor-pointer">
                      <div className="w-28 h-28 rounded-xl overflow-hidden border border-gray-700 shadow-lg bg-[#0b0b0f] flex items-center justify-center">
                        <img
                          src={imagePreview || assets.upload_area}
                          className="w-full h-full object-cover"
                          alt="upload cover"
                        />
                      </div>
                    </label>
                    <div>
                      <div className="font-semibold text-white">{image ? image.name : "Chưa chọn ảnh"}</div>
                      <div className="text-sm text-gray-400 mt-1">Kích thước đề xuất: vuông 800×800 hoặc lớn hơn.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-300 font-semibold">Tên bài hát</label>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className="p-3 rounded-lg bg-[#0f1113] border border-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nhập tên bài hát"
                    type="text"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-gray-300 font-semibold">Tác giả / Nghệ sĩ</label>
                  <input
                    onChange={(e) => setAuthor(e.target.value)}
                    value={author}
                    className="p-3 rounded-lg bg-[#0f1113] border border-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nhập tên tác giả (tuỳ chọn)"
                    type="text"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-300 font-semibold">Mô tả bài hát</label>
                <input
                  onChange={(e) => setDesc(e.target.value)}
                  value={desc}
                  className="p-3 rounded-lg bg-[#0f1113] border border-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập mô tả"
                  type="text"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-gray-300 font-semibold">Album</label>
                  <select
                    onChange={(e) => setAlbum(e.target.value)}
                    value={album}
                    className="p-2 rounded-lg bg-[#0f1113] border border-gray-700 text-white"
                  >
                    <option value="none">Không</option>
                    {albumData.map((item, idx) => (
                      <option key={idx} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* progress */}
                <div className="w-full md:w-1/3">
                  {loading && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Đang tải lên: {progress}%</div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${progress}%` }}
                          className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-black font-semibold py-3 px-6 rounded-full shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Đang tải lên..." : "Tải lên và lưu"}
                </button>

                <button
                  type="button"
                  className="w-full sm:w-auto text-sm text-gray-300 underline"
                  onClick={() => {
                    // reset form
                    setName("");
                    setDesc("");
                    setAlbum("none");
                    setImage(false);
                    setSong(false);
                    setAuthor("");
                    setImagePreview(null);
                    resetMsgs();
                  }}
                >
                  Đặt lại
                </button>

                <div className="ml-auto text-xs text-gray-400">
                  <div>© 2025 T-Music</div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <p className="mt-8 text-gray-500 text-sm">
          Lưu ý: Kiểm tra bản quyền trước khi tải lên. Vi phạm có thể dẫn tới gỡ bài.
        </p>
      </div>
    </>
  );
};

export default UserAddSong;
