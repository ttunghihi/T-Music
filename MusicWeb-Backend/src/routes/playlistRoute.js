// routes/playlistRoute.js
import express from "express";
import upload from "../middleware/multer.js"; // reuse existing multer config you have
import {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  removePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylistSongs,
} from "../controllers/playlistController.js";

import authMiddleware from "../middleware/authenticate.js"; // your auth middleware that sets req.userId

const router = express.Router();

// tạo playlist: cover file field name = "cover" (frontend dùng FormData append('cover', file))
router.post("/create", authMiddleware, upload.single("cover"), createPlaylist);

// lấy playlist của user
router.get("/my-list", authMiddleware, getMyPlaylists);

// lấy playlist theo id
router.get("/:id", getPlaylistById);

// xóa playlist
router.delete("/:id", authMiddleware, removePlaylist);

router.post("/:id/songs", authMiddleware, addSongToPlaylist);

// xóa một bài khỏi playlist
router.delete("/:id/songs/:songId", authMiddleware, removeSongFromPlaylist);

router.get("/:id/get-songs", getPlaylistSongs);

export default router;
