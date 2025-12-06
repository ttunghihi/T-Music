// controllers/premiumController.js
import { v2 as cloudinary } from "cloudinary";
import premiumRequestModel from "../models/premiumRequestModel.js";
import userModel from "../models/userModel.js";

/**
 * Helper: add one calendar month safely
 * Returns a Date or null if input invalid.
 */
const addOneMonth = (d) => {
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    const month = dt.getMonth();
    dt.setMonth(month + 1);
    return dt;
  } catch (err) {
    return null;
  }
};

/**
 * POST /api/premium/request
 * Body: multipart/form-data
 *  - receipt (file)
 *  - email (string)
 *  - name (string, optional)
 */
const createPremiumRequest = async (req, res) => {
  try {
    const name = req.body.name || "";
    const email = req.body.email || "";

    if (!email) {
      return res.json({ success: false, message: "Thiếu email." });
    }

    // multer style: req.files.receipt[0]
    const receiptFile = req.files && req.files.receipt && req.files.receipt[0];
    if (!receiptFile) {
      return res.json({ success: false, message: "Thiếu file ảnh xác nhận thanh toán." });
    }

    // upload lên cloudinary (image)
    let upload;
    try {
      upload = await cloudinary.uploader.upload(receiptFile.path, {
        resource_type: "image",
        folder: "tmusic/premium_receipts",
      });
    } catch (err) {
      console.log("Cloudinary upload failed:", err);
      return res.json({ success: false, message: "Upload ảnh thất bại." });
    }

    const reqDoc = new premiumRequestModel({
      name,
      email,
      receiptUrl: upload.secure_url,
      receiptPublicId: upload.public_id,
      status: "pending", // pending | approved | rejected
      createdAt: new Date(),
    });

    await reqDoc.save();

    res.json({
      success: true,
      message: "Yêu cầu nâng cấp đã được gửi. Chờ admin xét duyệt.",
      requestId: reqDoc._id,
    });
  } catch (error) {
    console.log("createPremiumRequest error:", error);
    res.json({ success: false, message: "Có lỗi xảy ra khi gửi yêu cầu." });
  }
};

/**
 * GET /api/premium/list
 * (admin) trả về danh sách request
 */
const listPremiumRequests = async (req, res) => {
  try {
    const list = await premiumRequestModel
      .find({}, { __v: 0 })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, requests: list });
  } catch (error) {
    console.log("listPremiumRequests error:", error);
    res.json({ success: false });
  }
};

/**
 * POST /api/premium/approve
 * body: { id }  (id của premiumRequest)
 * Hành động:
 *  - set request.status = 'approved' và reviewedAt
 *  - cập nhật user: isPremium, premiumSince, premiumUntil (1 month calendar)
 *  - trả về user đã cập nhật (ẩn password nếu toClient có sẵn)
 */
const approvePremiumRequest = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.json({ success: false, message: "Thiếu id." });
    }

    const requestDoc = await premiumRequestModel.findById(id);
    if (!requestDoc) {
      return res.json({ success: false, message: "Không tìm thấy yêu cầu." });
    }

    if (requestDoc.status === "approved") {
      return res.json({ success: false, message: "Yêu cầu đã được duyệt trước đó." });
    }

    // Cập nhật status của request
    requestDoc.status = "approved";
    requestDoc.reviewedAt = new Date();
    await requestDoc.save();

    // Tìm user theo email
    const user = await userModel.findOne({ email: requestDoc.email });

    if (!user) {
      // Nếu không tìm thấy user, vẫn trả success nhưng báo thêm
      return res.json({
        success: true,
        message: "Đã duyệt yêu cầu nhưng không tìm thấy tài khoản người dùng để cập nhật.",
        requestId: requestDoc._id,
      });
    }

    const now = new Date();
    let newPremiumSince = now;
    let newPremiumUntil = null;

    // Nếu user đang premium và premiumUntil hợp lệ và còn hiệu lực -> gia hạn từ premiumUntil
    if (user.isPremium && user.premiumUntil) {
      const currentUntil = new Date(user.premiumUntil);
      if (!isNaN(currentUntil.getTime()) && currentUntil > now) {
        newPremiumSince = user.premiumSince || now;
        newPremiumUntil = addOneMonth(currentUntil);
      } else {
        // premiumUntil invalid hoặc đã hết -> bắt đầu từ now
        newPremiumSince = now;
        newPremiumUntil = addOneMonth(now);
      }
    } else {
      // không premium trước đó -> đặt từ now -> now + 1 month
      newPremiumSince = now;
      newPremiumUntil = addOneMonth(now);
    }

    // fallback guard: nếu addOneMonth trả null/invalid -> đặt now + 1 month
    if (!newPremiumUntil || isNaN(newPremiumUntil.getTime())) {
      console.warn("Computed premiumUntil invalid, fallback to now + 1 month for user:", user.email);
      newPremiumUntil = addOneMonth(new Date());
    }

    // debug log (tạm — bạn có thể gỡ sau khi ổn)
    console.log("Approving premium for:", user.email);
    console.log("Setting premiumSince =", newPremiumSince, "premiumUntil =", newPremiumUntil);

    const updated = await userModel.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          isPremium: true,
          premiumSince: newPremiumSince,
          premiumUntil: newPremiumUntil,
        },
      },
      { new: true }
    );

    const resultUser = (updated && typeof updated.toClient === "function") ? updated.toClient() : updated;

    res.json({
      success: true,
      message: "Đã duyệt yêu cầu và cập nhật tài khoản trở thành Premium (1 tháng).",
      requestId: requestDoc._id,
      user: resultUser,
    });
  } catch (error) {
    console.log("approvePremiumRequest error:", error);
    res.json({ success: false, message: "Có lỗi khi duyệt yêu cầu." });
  }
};

/**
 * POST /api/premium/remove
 * body: { id }
 * Xóa 1 request (admin) — đồng thời xóa ảnh trên cloudinary nếu có public_id
 */
const removePremiumRequest = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.json({ success: false, message: "Thiếu id." });

    const doc = await premiumRequestModel.findById(id);
    if (!doc) return res.json({ success: false, message: "Không tìm thấy yêu cầu." });

    // xóa ảnh trên cloudinary nếu lưu public_id
    if (doc.receiptPublicId) {
      try {
        await cloudinary.uploader.destroy(doc.receiptPublicId, { resource_type: "image" });
      } catch (err) {
        console.log("Warning: xóa ảnh cloudinary thất bại", err);
      }
    }

    await premiumRequestModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Đã xóa yêu cầu." });
  } catch (error) {
    console.log("removePremiumRequest error:", error);
    res.json({ success: false });
  }
};

export {
  createPremiumRequest,
  listPremiumRequests,
  approvePremiumRequest,
  removePremiumRequest,
};
