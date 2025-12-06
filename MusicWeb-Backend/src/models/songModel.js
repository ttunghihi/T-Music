import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    name: { type: String, required: true },
    desc: { type: String, required: true },
    album: { type: String, required: true },
    image: { type: String, required: true },
    file: { type: String, required: true },
    duration: { type: String, required: true },
    author: { type: String, default: "Unknown" } // NEW: tác giả / nghệ sĩ
});

const songModel = mongoose.models.song || mongoose.model("Song", songSchema);

export default songModel;
