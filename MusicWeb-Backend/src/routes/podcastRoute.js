import { addPodcast, listPodcast, removePodcast } from "../controllers/podcastController.js";
import express from "express";
import upload from "../middleware/multer.js";

const podcastRouter = express.Router();

podcastRouter.post(
  "/add",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 }
  ]),
  addPodcast
);

podcastRouter.get("/list", listPodcast);

podcastRouter.post("/remove", removePodcast);

export default podcastRouter;
