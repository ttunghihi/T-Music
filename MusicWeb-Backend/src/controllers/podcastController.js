import { v2 as cloudinary } from "cloudinary";
import podcastModel from "../models/podcastModel.js";

const addPodcast = async (req, res) => {
  try {
    const name = req.body.name;
    const desc = req.body.desc;

    // file từ multipart form (giả sử key là audio và image giống songController)
    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];

    if (!audioFile || !imageFile) {
      return res.status(400).json({ success: false, message: "Thiếu file audio hoặc image" });
    }

    // Upload audio (resource_type "video" dùng cho audio trong Cloudinary)
    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
    });

    // Upload ảnh với crop/resize
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      transformation: [
        { width: 300, height: 300, crop: "fill" },
      ],
    });

    // Tạo duration dạng M:SS (nếu cloudinary trả về duration)
    let duration = "";
    if (audioUpload.duration || audioUpload.duration === 0) {
      const totalSec = Math.floor(audioUpload.duration);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      duration = `${mins}:${secs.toString().padStart(2, "0")}`;
    } else {
      // fallback nếu không có duration
      duration = req.body.duration || "";
    }

    const podcastData = {
      name,
      desc,
      image: imageUpload.secure_url,
      file: audioUpload.secure_url,
      duration,
    };

    const podcast = new podcastModel(podcastData);
    await podcast.save();

    res.json({ success: true, message: "Đã thêm podcast" });

    console.log("addPodcast:", name, desc, audioUpload.public_id, imageUpload.public_id);
  } catch (error) {
    console.log("addPodcast error:", error);
    res.json({ success: false });
  }
};

const listPodcast = async (req, res) => {
  try {
    const all = await podcastModel.find({});
    res.json({ success: true, podcasts: all });
  } catch (error) {
    console.log("listPodcast error:", error);
    res.json({ success: false });
  }
};

const removePodcast = async (req, res) => {
  try {
    await podcastModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Đã gỡ podcast" });
  } catch (error) {
    console.log("removePodcast error:", error);
    res.json({ success: false });
  }
};

export { addPodcast, listPodcast, removePodcast };
