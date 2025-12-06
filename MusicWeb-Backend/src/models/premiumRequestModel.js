import mongoose from "mongoose";

const premiumRequestSchema = new mongoose.Schema({
    name: { type: String, default: "" },   // tên hiển thị (lấy từ frontend)
    email: { type: String, required: true }, 

    // URL ảnh xác nhận thanh toán (upload Cloudinary)
    receiptUrl: { type: String, required: true },

    // Lưu public_id để xoá ảnh khi admin remove request
    receiptPublicId: { type: String, default: "" },

    // pending | approved | rejected
    status: { type: String, default: "pending" },

    // thời điểm admin duyệt / từ chối
    reviewedAt: { type: Date, default: null }
}, { timestamps: true });

const premiumRequestModel =
    mongoose.models.premiumrequest ||
    mongoose.model("premiumrequest", premiumRequestSchema);

export default premiumRequestModel;
