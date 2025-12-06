// AdminPremiumRequests.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { url } from "../App";
import { toast } from "react-toastify";

const ListPremiumRequest = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/premium/list`);
      console.log("PREMIUM LIST:", res.data);

      if (res.data.success && Array.isArray(res.data.requests)) {
        setData(res.data.requests);
      } else {
        setData([]);
        toast.error("Không thể tải danh sách yêu cầu.");
      }
    } catch (err) {
      console.error("fetchRequests error:", err);
      toast.error("Lỗi khi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    if (!window.confirm("Bạn có chắc muốn duyệt yêu cầu này?")) return;

    try {
      const res = await axios.post(`${url}/api/premium/approve`, { id });
      console.log("approve:", res.data);

      if (res.data.success) {
        toast.success(res.data.message || "Đã duyệt yêu cầu.");
        fetchRequests();
      } else {
        toast.error(res.data.message || "Không thể duyệt yêu cầu.");
      }
    } catch (err) {
      console.error("approveRequest error:", err);
      toast.error("Đã xảy ra lỗi khi duyệt.");
    }
  };

  const removeRequest = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa yêu cầu này?")) return;

    try {
      const res = await axios.post(`${url}/api/premium/remove`, { id });
      console.log("remove:", res.data);

      if (res.data.success) {
        toast.success(res.data.message || "Đã xóa yêu cầu.");
        fetchRequests();
      } else {
        toast.error(res.data.message || "Không thể xóa yêu cầu.");
      }
    } catch (err) {
      console.error("removeRequest error:", err);
      toast.error("Đã xảy ra lỗi.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <p>Danh sách yêu cầu nâng cấp Premium</p>
      <br />

      {/* Header */}
      <div className="sm:grid hidden grid-cols-[0.8fr_1.6fr_1fr_1fr_1fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-100">
        <b>Người gửi / Ảnh</b>
        <b>Email</b>
        <b>Ngày gửi</b>
        <b>Trạng thái</b>
        <b>Hành động</b>
      </div>

      {loading && <p className="text-gray-500 mt-3">Đang tải...</p>}

      {data.length === 0 && !loading && (
        <p className="mt-4 text-gray-500">Không có yêu cầu nào.</p>
      )}

      {data.map((req, idx) => (
        <div
          key={req._id || idx}
          className="grid grid-cols-[1fr_1fr] sm:grid-cols-[0.8fr_1.6fr_1fr_1fr_1fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5"
        >
          {/* Người gửi + ảnh */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-black border border-neutral-700 rounded-md overflow-hidden flex items-center justify-center">
              {req.receiptUrl ? (
                <img
                  src={req.receiptUrl}
                  alt="receipt"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => window.open(req.receiptUrl, "_blank")}
                />
              ) : (
                <span className="text-xs text-gray-400">Không có ảnh</span>
              )}
            </div>

            <div>
              <div className="font-medium">{req.name || "—"}</div>
              <div className="text-xs text-gray-500">
                {req.email || "—"}
              </div>
            </div>
          </div>

          {/* Email (redundant on large, useful on small) */}
          <div className="truncate text-gray-700">{req.email}</div>

          {/* Ngày gửi */}
          <div>
            {req.createdAt
              ? new Date(req.createdAt).toLocaleString("vi-VN")
              : "—"}
          </div>

          {/* Trạng thái */}
          <div>
            {req.status === "pending" && (
              <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                Chờ duyệt
              </span>
            )}
            {req.status === "approved" && (
              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Đã duyệt
              </span>
            )}
            {req.status === "rejected" && (
              <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                Từ chối
              </span>
            )}
          </div>

          {/* Hành động */}
          <div className="flex gap-2 justify-end">
            {req.status !== "approved" && (
              <button
                onClick={() => approveRequest(req._id)}
                className="px-3 py-1 rounded bg-green-500 text-white text-sm hover:bg-green-600"
              >
                Duyệt
              </button>
            )}

            <button
              onClick={() => removeRequest(req._id)}
              className="px-3 py-1 rounded border border-red-400 text-red-500 text-sm hover:bg-red-50"
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListPremiumRequest;
