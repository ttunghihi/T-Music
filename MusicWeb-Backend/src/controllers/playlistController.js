// controllers/playlistController.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import PlaylistModel from "../models/playlistModel.js";

/**
 * Expectation:
 * - An auth middleware should set req.userId (or req.user._id).
 * - Multer middleware should put uploaded file in `req.file`.
 */

const createPlaylist = async (req, res) => {
  try {
    // auth check (adjust to your auth middleware)
    const userId = req.userId || (req.user && req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { name, desc = "", isPrivate = "true" } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Tên playlist là bắt buộc" });
    }

    let coverUrl = "";
    const file = req.file;

    if (file) {
      // upload to cloudinary (assumes cloudinary.config already set in your app)
      const uploadRes = await cloudinary.uploader.upload(file.path, {
        resource_type: "image",
        transformation: [{ width: 600, height: 600, crop: "fill", gravity: "auto" }],
      });
      coverUrl = uploadRes.secure_url || uploadRes.url || "";

      // remove temp file
      try { await fs.unlink(file.path); } catch (e) { /* ignore */ }
    }

    const playlistData = {
      name: name.trim(),
      desc: desc.trim(),
      isPrivate: isPrivate === "true" || isPrivate === true,
      coverUrl,
      creator: userId,
    };

    const playlist = new PlaylistModel(playlistData);
    await playlist.save();

    return res.json({ success: true, playlist });
  } catch (error) {
    console.error("createPlaylist error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server khi tạo playlist" });
  }
};

const getMyPlaylists = async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const playlists = await PlaylistModel.find({ creator: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, playlists });
  } catch (error) {
    console.error("getMyPlaylists error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    // populate creator and songs info (if present)
    const playlist = await PlaylistModel.findById(id)
      .populate("creator", "name email")
      .populate({
        path: "songs",
        select: "_id name author artist image duration album", // chọn những field cần thiết
      });

    if (!playlist) return res.status(404).json({ success: false, message: "Không tìm thấy playlist" });
    return res.json({ success: true, playlist });
  } catch (error) {
    console.error("getPlaylistById error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const removePlaylist = async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { id } = req.params;
    const playlist = await PlaylistModel.findById(id);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tồn tại" });

    // chỉ creator được xóa
    if (String(playlist.creator) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xóa playlist này" });
    }

    await PlaylistModel.findByIdAndDelete(id);
    return res.json({ success: true, message: "Đã xóa Playlist" });
  } catch (error) {
    console.error("removePlaylist error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const addSongToPlaylist = async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { id } = req.params; // playlist id
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ success: false, message: "Thiếu songId" });

    const playlist = await PlaylistModel.findById(id);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tồn tại" });

    // Quyền: chỉ creator mới add (bạn có thể mở rộng cho public playlists)
    if (String(playlist.creator) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền thêm bài vào playlist này" });
    }

    // tránh duplicate
    if (Array.isArray(playlist.songs) && playlist.songs.some((s) => String(s) === String(songId))) {
      return res.status(200).json({ success: true, message: "Bài này đã có trong playlist", playlist });
    }

    playlist.songs = Array.isArray(playlist.songs) ? playlist.songs.concat([songId]) : [songId];
    await playlist.save();

    // return updated playlist with songs populated
    const updated = await PlaylistModel.findById(id).populate({
      path: "songs",
      select: "_id name author artist image duration album",
    });
    return res.json({ success: true, message: "Đã thêm bài vào playlist", playlist: updated });
  } catch (error) {
    console.error("addSongToPlaylist error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

/**
 * DELETE /api/playlist/:id/songs/:songId
 * only creator can remove
 */
const removeSongFromPlaylist = async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { id, songId } = req.params;
    const playlist = await PlaylistModel.findById(id);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tồn tại" });

    if (String(playlist.creator) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xoá bài khỏi playlist này" });
    }

    if (!Array.isArray(playlist.songs) || !playlist.songs.some((s) => String(s) === String(songId))) {
      return res.status(404).json({ success: false, message: "Bài không tồn tại trong playlist" });
    }

    playlist.songs = playlist.songs.filter((s) => String(s) !== String(songId));
    await playlist.save();

    const updated = await PlaylistModel.findById(id).populate({
      path: "songs",
      select: "_id name author artist image duration album",
    });

    return res.json({ success: true, message: "Đã xoá bài khỏi playlist", playlist: updated });
  } catch (error) {
    console.error("removeSongFromPlaylist error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const getPlaylistSongs = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Missing playlist id" });

    // lấy playlist và chỉ populate trường songs
    const playlist = await PlaylistModel.findById(id).populate({
      path: "songs",
      select: "_id name author artist image duration album", // tùy chỉnh các fields cần thiết
    });

    if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tồn tại" });

    // trả về chỉ mảng songs để frontend dễ xử lý
    return res.json({ success: true, songs: playlist.songs || [] });
  } catch (error) {
    console.error("getPlaylistSongs error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách bài" });
  }
};

export { createPlaylist, getMyPlaylists, getPlaylistById, removePlaylist, addSongToPlaylist, removeSongFromPlaylist, getPlaylistSongs };