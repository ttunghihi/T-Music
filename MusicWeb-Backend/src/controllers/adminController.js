// controllers/adminController.js
import userModel from "../models/userModel.js";
import { verifyAdmin } from "../models/adminModel.js";

/**
 * POST /api/admin/login
 * body: { email, password }
 * Trả success:true nếu đúng credential hardcoded.
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.json({ success: false, message: "Thiếu email hoặc mật khẩu." });
    }

    const ok = await verifyAdmin(email, password);
    if (!ok) {
      return res.json({ success: false, message: "Email hoặc mật khẩu admin không đúng." });
    }

    // Không tạo token (theo yêu cầu: không cần xác thực). Frontend admin có thể
    // lưu trạng thái đăng nhập cục bộ nếu cần.
    res.json({ success: true, message: "Đăng nhập admin thành công." });
  } catch (error) {
    console.log("adminLogin error:", error);
    res.json({ success: false, message: "Lỗi khi đăng nhập admin." });
  }
};

/**
 * GET /api/admin/users
 * Trả danh sách user (ẩn password)
 * NOTE: không kiểm tra token vì bạn tách riêng admin frontend.
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, { password: 0, __v: 0 });
    res.json({ success: true, users });
  } catch (error) {
    console.log("admin getAllUsers error:", error);
    res.json({ success: false, message: "Lỗi khi lấy danh sách người dùng." });
  }
};

/**
 * POST /api/admin/remove-user
 * body: { id }
 */
const removeUser = async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.json({ success: false, message: "Thiếu id." });

    await userModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Đã xóa tài khoản." });
  } catch (error) {
    console.log("admin removeUser error:", error);
    res.json({ success: false, message: "Lỗi khi xóa tài khoản." });
  }
};

/**
 * POST /api/admin/toggle-admin
 * body: { id, makeAdmin: true/false }
 */
const toggleAdmin = async (req, res) => {
  try {
    const { id, makeAdmin } = req.body || {};
    if (!id || typeof makeAdmin === "undefined") {
      return res.json({ success: false, message: "Thiếu thông tin (id hoặc makeAdmin)." });
    }

    const user = await userModel.findById(id);
    if (!user) return res.json({ success: false, message: "Không tìm thấy user." });

    user.isAdmin = !!makeAdmin;
    await user.save();

    const safeUser = user.toClient ? user.toClient() : user;
    res.json({ success: true, message: `Đã ${makeAdmin ? "gán" : "thu hồi"} quyền admin.`, user: safeUser });
  } catch (error) {
    console.log("admin toggleAdmin error:", error);
    res.json({ success: false, message: "Lỗi khi cập nhật quyền admin." });
  }
};

export { adminLogin, getAllUsers, removeUser, toggleAdmin };
export default { adminLogin, getAllUsers, removeUser, toggleAdmin };
