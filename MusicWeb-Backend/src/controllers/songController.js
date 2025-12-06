import { v2 as cloudinary } from "cloudinary";
import songModel from "../models/songModel.js";

const addSong = async (req, res) => {
  try {
    const name = req.body.name;
    const desc = req.body.desc;
    const album = req.body.album;
    const author = req.body.author || "Unknown"; // NEW: lấy tác giả từ form (fallback Unknown)
    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
    });
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      transformation: [
        { width: 300, height: 300, crop: "fill" }, // resize ảnh
      ],
    });

    const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(
      audioUpload.duration % 60
    )}`;

    const songData = {
      name,
      desc,
      album,
      author, // NEW: lưu tác giả
      image: imageUpload.secure_url,
      file: audioUpload.secure_url,
      duration,
    };

    const song = songModel(songData);
    await song.save();

    res.json({ success: true, message: "Đã thêm bài hát" });

    console.log(name, desc, album, author, audioUpload, imageUpload);
  } catch (error) {
    console.log("addSong error:", error);
    res.json({ success: false });
  }
};

const listSong = async (req, res) => {
  try {
    const allSongs = await songModel.find({});
    res.json({ success: true, songs: allSongs });
  } catch (error) {
    console.log("listSong error:", error);
    res.json({ success: false });
  }
};

const removeSong = async (req, res) => {
  try {
    await songModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Đã gỡ bài hát" });
  } catch (error) {
    console.log("removeSong error:", error);
    res.json({ success: false });
  }
};

export { addSong, listSong, removeSong };
