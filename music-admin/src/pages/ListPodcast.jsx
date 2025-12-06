import axios from "axios";
import React, { useEffect, useState } from "react";
import { url } from "../App";
import { toast } from "react-toastify";

const ListPodcast = () => {
  const [data, setData] = useState([]);

  const fetchPodcasts = async () => {
    try {
      const response = await axios.get(`${url}/api/podcast/list`);
      console.log(response.data);
      if (response.data.success && Array.isArray(response.data.podcasts)) {
        setData(response.data.podcasts);
      } else {
        setData([]);
        toast.error("Không thể tải danh sách podcast.");
      }
    } catch (error) {
      console.error("fetchPodcasts error:", error);
      toast.error("Đã xảy ra lỗi khi kết nối đến server.");
    }
  };

  const removePodcast = async (id) => {
    try {
      const response = await axios.post(`${url}/api/podcast/remove`, { id });

      if (response.data.success) {
        toast.success(response.data.message || "Đã gỡ podcast");
        await fetchPodcasts();
      } else {
        toast.error("Không thể gỡ podcast.");
      }
    } catch (error) {
      console.error("removePodcast error:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  return (
    <div>
      <p>Danh sách tất cả podcast</p>
      <br />
      <div>
        {/* Header */}
        <div className="sm:grid hidden grid-cols-[0.5fr_1fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-100">
          <b>Ảnh</b>
          <b>Tên</b>
          <b>Thời lượng</b>
          <b>Hành động</b>
        </div>

        {data.length === 0 && (
          <p className="mt-4 text-gray-500">Không có podcast nào.</p>
        )}

        {data.map((item, index) => {
          // safe values
          const image = item?.image || "";
          const name = item?.name || "Không có tên";
          const duration = item?.duration || "-";
          const id = item?._id;

          return (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr] sm:grid-cols-[0.5fr_1fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5"
            >
              <img className="w-12" src={image} alt={name} />
              <p>{name}</p>
              <p>{duration}</p>
              <p
                className="cursor-pointer text-red-600 hover:underline"
                onClick={() => {
                  if (confirm("Bạn có chắc muốn xóa podcast này?")) {
                    removePodcast(id);
                  }
                }}
              >
                x
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListPodcast;
