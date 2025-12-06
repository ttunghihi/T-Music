import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { url } from "../App";
import { toast } from "react-toastify";

const AddPodcast = () => {
  const [image, setImage] = useState(false);
  const [audio, setAudio] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image);
      formData.append("audio", audio);

      const response = await axios.post(`${url}/api/podcast/add`, formData);

      if (response.data.success) {
        toast.success("Podcast đã được tải lên");
        setName("");
        setDesc("");
        setImage(false);
        setAudio(false);
      } else {
        toast.error("Đã có lỗi xảy ra");
      }
    } catch (error) {
      console.error("add podcast error:", error);
      toast.error("Đã có lỗi xảy ra");
    }
    setLoading(false);
  };

  return loading ? (
    <div className="grid place-items-center min-h-[80vh]">
      <div className="w-16 h-16 place-self-center border-4 border-gray-400 border-t-orange-800 rounded-full animate-spin" />
    </div>
  ) : (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-start gap-8 text-gray-600">
      <div className="flex gap-8">
        <div className="flex flex-col gap-4">
          <p>Upload Podcast (Audio)</p>
          <input
            onChange={(e) => setAudio(e.target.files[0])}
            type="file"
            id="podcast-audio"
            accept="audio/*"
            hidden
          />
          <label htmlFor="podcast-audio">
            <img
              src={audio ? assets.upload_added : assets.upload_song}
              className="w-24 cursor-pointer"
              alt=""
            />
          </label>
        </div>

        <div className="flex flex-col gap-4">
          <p>Upload Ảnh giới thiệu</p>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="podcast-image"
            accept="image/*"
            hidden
          />
          <label htmlFor="podcast-image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              className="w-24 cursor-pointer"
              alt=""
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <p>Tên Podcast</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="bg-transparent outline-orange-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]"
          placeholder="Nhập tên podcast"
          type="text"
          required
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <p>Mô tả</p>
        <textarea
          onChange={(e) => setDesc(e.target.value)}
          value={desc}
          className="bg-transparent outline-orange-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)] resize-y min-h-[80px]"
          placeholder="Nhập mô tả cho podcast"
          required
        />
      </div>

      <button type="submit" className="text-base bg-black text-white py-2.5 px-14 cursor-pointer">
        Thêm Podcast
      </button>
    </form>
  );
};

export default AddPodcast;
