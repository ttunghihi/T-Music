// models/userModel.js
import mongoose from "mongoose";
import Songs from "./songModel.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  // NEW: trạng thái Premium
  isPremium: { type: Boolean, default: false },
  premiumSince: { type: Date, default: null },
  premiumUntil: { type: Date, default: null }, // thời điểm Premium hết hạn

  // thêm vào userSchema (tham khảo file gốc của bạn)
  isVerified: { type: Boolean, default: false },     // đã xác thực email hay chưa
  otpCode: { type: String, default: null },          // mã OTP hiện tại (hash hoặc plaintext tùy chọn)
  otpExpires: { type: Date, default: null },         // thời hạn OTP
  googleId: { type: String, default: null },          // lưu google sub/id nếu đăng nhập bằng Google


  // NEW: danh sách bài hát user đã like
  likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});



// index on email
userSchema.index({ email: 1 }, { unique: true });

// virtual: playlists created by this user (không lưu trong document, thuận tiện khi populate)
userSchema.virtual("playlists", {
  ref: "Playlist",
  localField: "_id",
  foreignField: "creator",
  justOne: false,
});

// helper: trả object an toàn cho client (loại bỏ password)
userSchema.methods.toClient = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// If you have an auth system, consider adding password hashing and comparePassword here.
// e.g. userSchema.pre("save", ...), userSchema.methods.comparePassword = async (...) ...

// IMPORTANT: register model name as "User" (must match ref used in PlaylistModel.populate)
const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
