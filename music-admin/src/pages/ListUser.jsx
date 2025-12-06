import axios from "axios";
import React, { useEffect, useState } from "react";
import { url } from "../App";
import { toast } from "react-toastify";

const ListUsers = () => {
  const [data, setData] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${url}/api/user/list`);

      if (response.data.success && Array.isArray(response.data.users)) {
        setData(response.data.users);
      } else {
        setData([]);
        toast.error("Không thể tải danh sách tài khoản.");
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối server.");
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

    try {
      const response = await axios.post(`${url}/api/user/remove`, { id });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      } else {
        toast.error("Không thể xóa tài khoản.");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <p>Danh sách tài khoản</p>
      <br />

      <div>

        {/* HEADER */}
        <div className="sm:grid hidden grid-cols-[1fr_2fr_2fr_1fr_1fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-100">
          <b>Tên người dùng</b>
          <b>Email</b>
          <b>Ngày tạo</b>
          <b>Premium</b>
          <b>Hành động</b>
        </div>

        {data.length === 0 && (
          <p className="mt-4 text-gray-500">Không có tài khoản nào.</p>
        )}

        {data.map((user, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_1fr] sm:grid-cols-[1fr_2fr_2fr_1fr_1fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5"
          >
            <p>{user.name || "Không có tên"}</p>
            <p>{user.email}</p>

            <p>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                : "Không có"}
            </p>

            {/* PREMIUM STATUS */}
            <p>
              {user.isPremium ? (
                <span className="px-2 py-1 text-green-600 font-semibold">
                  PREMIUM
                </span>
              ) : (
                <span className="px-2 py-1 text-gray-500">Thường</span>
              )}
            </p>

            <p
              className="cursor-pointer text-red-500"
              onClick={() => removeUser(user._id)}
            >
              x
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListUsers;
