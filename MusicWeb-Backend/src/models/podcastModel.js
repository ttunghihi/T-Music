import mongoose from "mongoose";

const podcastSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: true },
  file: { type: String, required: true },
  duration: { type: String, required: true }
});

const podcastModel = mongoose.models.Podcast || mongoose.model("Podcast", podcastSchema);

export default podcastModel;
