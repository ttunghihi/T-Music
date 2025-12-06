// models/playlistModel.js
import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, default: "" },
  isPrivate: { type: Boolean, default: true },
  coverUrl: { type: String, default: "" },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  createdAt: { type: Date, default: Date.now },
});

const playlistModel =
  mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema);

export default playlistModel;
