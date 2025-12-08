// controllers/userController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

import userModel from "../models/userModel.js";
import Song from "../models/songModel.js"; // nếu đường dẫn khác, chỉnh lại

// ----------------- PendingUser model (tạm lưu đăng ký trước khi verify OTP) -----------------
// Bạn có thể tách phần này ra models/pendingUserModel.js nếu muốn.
const pendingUserSchema = new mongoose.Schema(
  
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // đã hash
    otpCode: { type: String, default: null }, // hashed otp
    otpExpires: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// TTL index: xóa pending user sau 24 giờ (tùy chỉnh). Nếu không muốn TTL, bỏ dòng index bên dưới.
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

const PendingUser = mongoose.models.PendingUser || mongoose.model("PendingUser", pendingUserSchema);

// ----------------------- Configs -----------------------
const JWT_SECRET = process.env.JWT_SECRET || "tmusic_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Config mailer (nodemailer)
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

mailTransporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP VERIFY FAILED:", error);
  } else {
    console.log("✅ SMTP READY TO SEND MAIL");
  }
});


// Google client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ----------------------- Helpers -----------------------
const createToken = (user) => {
  const id = user?._id || user?.id;
  const payload = {
    id,
    email: user?.email || undefined,
    name: user?.name || undefined,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const generateOtp = (digits = 6) => {
  const num = crypto.randomInt(0, 10 ** digits).toString().padStart(digits, "0");
  return num;
};

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"T-Music" <no-reply@tmusic.app>',
    to,
    subject: "Mã OTP xác thực T-Music",
    text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`,
    html: `<p>Mã OTP của bạn là: <b>${otp}</b></p><p>Mã có hiệu lực trong 10 phút.</p>`,
  };
  return mailTransporter.sendMail(mailOptions);
};

// expire premium nếu đến hạn (lazy)
const expireIfNeeded = async (userDoc) => {
  try {
    if (!userDoc) return userDoc;
    if (userDoc.isPremium && userDoc.premiumUntil) {
      const now = new Date();
      if (new Date(userDoc.premiumUntil) <= now) {
        await userModel.findByIdAndUpdate(userDoc._id, {
          $set: { isPremium: false, premiumSince: null, premiumUntil: null },
        });
        userDoc.isPremium = false;
        userDoc.premiumSince = null;
        userDoc.premiumUntil = null;
      }
    }
  } catch (err) {
    console.error("expireIfNeeded error:", err);
  }
  return userDoc;
};

// ----------------------- Controller functions -----------------------

// REGISTER (tạo PendingUser, gửi OTP — KHÔNG tạo User chính thức)
const registerUser = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Thiếu thông tin." });
    }

    // nếu đã có user chính thức -> báo lỗi
    const exist = await userModel.findOne({ email });
    if (exist) {
      return res.json({ success: false, message: "Email đã được sử dụng." });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.json({
        success: false,
        message: "Mật khẩu phải có ít nhất 8 ký tự.",
      });
    }

    // hash password để lưu tạm
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // nếu đã có pending trước đó -> cập nhật (ghi đè) để reset OTP
    try {
      await PendingUser.deleteOne({ email });
    } catch (e) {
      // ignore
    }

    const otp = generateOtp(6);
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    const pending = new PendingUser({
      name,
      email,
      passwordHash: hashedPassword,
      otpCode: hashedOtp,
      otpExpires: expires,
    });

    await pending.save();

    // gửi mail (không block)
    sendOtpEmail(email, otp).catch((e) => console.error("sendOtpEmail error:", e));

    return res.json({
      success: true,
      message: "Đăng ký tạm thành công. Đã gửi OTP tới email, vui lòng xác thực để hoàn tất đăng ký.",
      // không trả token/user ở bước register
    });
  } catch (error) {
    console.log("registerUser error:", error);
    res.json({ success: false, message: "Có lỗi xảy ra khi đăng ký." });
  }
};

// LOGIN (email + password)
const loginUser = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.json({ success: false, message: "Thiếu thông tin." });
    }

    let user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Email hoặc mật khẩu không đúng.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({
        success: false,
        message: "Email hoặc mật khẩu không đúng.",
      });
    }

    // lazy-expire nếu cần
    await expireIfNeeded(user);
    user = await userModel.findOne({ email });

    const token = createToken(user);

    let userForClient = user;
    if (typeof user.toClient === "function") {
      userForClient = user.toClient();
    } else {
      userForClient = {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium || false,
        premiumSince: user.premiumSince || null,
        premiumUntil: user.premiumUntil || null,
        isVerified: user.isVerified || false,
      };
    }

    res.json({
      success: true,
      message: "Đăng nhập thành công.",
      token,
      user: userForClient,
    });
  } catch (error) {
    console.log("loginUser error:", error);
    res.json({ success: false, message: "Có lỗi xảy ra khi đăng nhập." });
  }
};

// ----------------------- OTP endpoints -----------------------

// POST /api/user/send-otp  body: { email }
// Gửi OTP tới email (tạo/ cập nhật PendingUser nếu cần)
const sendOtpToEmail = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email) return res.json({ success: false, message: "Thiếu email." });

    // nếu đã có user chính thức -> trả lỗi (khuyến nghị: dùng forgot password flow)
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      // nếu user chưa verify thì có thể gửi OTP verify cho user hiện có — nhưng ở flow này ta ưu tiên dùng PendingUser để đăng ký
      return res.json({ success: false, message: "Email đã được đăng ký." });
    }

    // tạo hoặc cập nhật pending user
    let pending = await PendingUser.findOne({ email });

    // nếu chưa có pending: cần passwordHash để lưu — trong trường hợp user chỉ muốn nhận OTP (ví dụ forgot password) flow khác phải áp dụng.
    // Ở đây ta từ chối nếu chưa có pending (để tránh tạo bản ghi thiếu mật khẩu)
    if (!pending) {
      return res.json({
        success: false,
        message: "Không tìm thấy đăng ký tạm. Vui lòng gửi thông tin đăng ký trước.",
      });
    }

    const otp = generateOtp(6);
    const hashed = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    pending.otpCode = hashed;
    pending.otpExpires = expires;
    await pending.save();

    try {
      await sendOtpEmail(email, otp);
    } catch (e) {
      console.error("sendOtpEmail failed:", e);
      return res.json({ success: false, message: "Không thể gửi email OTP." });
    }

    return res.json({ success: true, message: "Đã gửi mã OTP vào email." });
  } catch (err) {
    console.error("sendOtpToEmail error:", err);
    return res.json({ success: false, message: "Có lỗi server khi gửi OTP." });
  }
};

// POST /api/user/verify-otp  body: { email, otp }
// Xác thực OTP: tạo User chính thức từ PendingUser, xóa pending, trả token
const verifyOtp = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) return res.json({ success: false, message: "Thiếu email hoặc otp." });

    const pending = await PendingUser.findOne({ email });
    if (!pending || !pending.otpCode || !pending.otpExpires) {
      return res.json({ success: false, message: "Không tìm thấy OTP cho email này." });
    }

    if (new Date(pending.otpExpires) < new Date()) {
      // xóa pending khi otp hết hạn
      await PendingUser.deleteOne({ email });
      return res.json({ success: false, message: "OTP đã hết hạn." });
    }

    const match = await bcrypt.compare(otp, pending.otpCode);
    if (!match) return res.json({ success: false, message: "OTP không đúng." });

    // trước khi tạo User chính thức, đảm bảo user chưa tồn tại (race condition)
    const exist = await userModel.findOne({ email });
    if (exist) {
      // xóa pending để tránh rác (tùy chọn)
      await PendingUser.deleteOne({ email });
      return res.json({ success: false, message: "Email đã được sử dụng." });
    }

    // tạo user chính thức từ pending
    const newUser = new userModel({
      name: pending.name,
      email: pending.email,
      password: pending.passwordHash, // đã hash
      isPremium: false,
      premiumSince: null,
      premiumUntil: null,
      isVerified: true,
    });

    await newUser.save();

    // xóa pending
    await PendingUser.deleteOne({ email });

    const token = createToken(newUser);

    let userForClient = newUser;
    if (typeof newUser.toClient === "function") userForClient = newUser.toClient();
    else
      userForClient = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isPremium: newUser.isPremium || false,
        premiumSince: newUser.premiumSince || null,
        premiumUntil: newUser.premiumUntil || null,
        isVerified: newUser.isVerified || false,
      };

    return res.json({ success: true, message: "Xác thực thành công.", token, user: userForClient });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.json({ success: false, message: "Lỗi server khi xác thực OTP." });
  }
};

// ----------------------- Google Sign-In -----------------------

const googleLogin = async (req, res) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) return res.json({ success: false, message: "Thiếu idToken." });

    // verify token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.json({ success: false, message: "Không lấy được thông tin từ Google." });
    }

    const email = String(payload.email).toLowerCase();
    let user = await userModel.findOne({ email });

    if (!user) {
      // tạo user mới, đánh dấu verified
      user = new userModel({
        name: payload.name || email.split("@")[0],
        email,
        password: crypto.randomBytes(16).toString("hex"),
        isVerified: true,
        googleId: payload.sub,
        isPremium: false,
      });
      await user.save();
    } else {
      // cập nhật googleId và isVerified nếu cần
      let needSave = false;
      if (!user.googleId && payload.sub) {
        user.googleId = payload.sub;
        needSave = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        needSave = true;
      }
      if (needSave) await user.save();
    }

    await expireIfNeeded(user);
    user = await userModel.findOne({ email });

    const token = createToken(user);
    let userForClient = user;
    if (typeof user.toClient === "function") userForClient = user.toClient();
    else
      userForClient = {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium || false,
        premiumSince: user.premiumSince || null,
        premiumUntil: user.premiumUntil || null,
        isVerified: user.isVerified || false,
      };

    return res.json({ success: true, message: "Đăng nhập bằng Google thành công.", token, user: userForClient });
  } catch (err) {
    console.error("googleLogin error:", err);
    return res.json({ success: false, message: "Lỗi xác thực Google." });
  }
};

// ----------------------- Existing admin / utility endpoints (giữ nguyên) -----------------------

const listUsers = async (req, res) => {
  try {
    try {
      await userModel.updateMany(
        { isPremium: true, premiumUntil: { $lte: new Date() } },
        { $set: { isPremium: false, premiumSince: null, premiumUntil: null } }
      );
    } catch (err) {
      console.error("Error expiring old premiums in listUsers:", err);
    }

    const users = await userModel.find({}, { password: 0, __v: 0 });
    res.json({ success: true, users });
  } catch (error) {
    console.log("listUsers error:", error);
    res.json({ success: false });
  }
};

const removeUser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.json({ success: false, message: "Thiếu id." });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.json({ success: false, message: "Id không hợp lệ." });
    }

    await userModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Đã xóa tài khoản." });
  } catch (error) {
    console.log("removeUser error:", error);
    res.json({ success: false });
  }
};

const upgradeUserToPremium = async (req, res) => {
  try {
    const id = req.body.id;
    const email = req.body.email ? String(req.body.email).trim().toLowerCase() : null;

    if (!id && !email) {
      return res.json({ success: false, message: "Thiếu id hoặc email." });
    }

    const filter = id ? { _id: id } : { email };
    const user = await userModel.findOne(filter);
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy tài khoản để nâng cấp." });
    }

    const now = new Date();
    let until;

    if (user.isPremium && user.premiumUntil && new Date(user.premiumUntil) > now) {
      until = new Date(user.premiumUntil);
      until.setMonth(until.getMonth() + 1);
    } else {
      until = new Date(now);
      until.setMonth(until.getMonth() + 1);
    }

    const updated = await userModel.findOneAndUpdate(
      filter,
      {
        $set: {
          isPremium: true,
          premiumSince: (user.isPremium && user.premiumSince) ? user.premiumSince : now,
          premiumUntil: until,
        },
      },
      { new: true }
    );

    let userForClient = updated;
    if (typeof updated.toClient === "function") userForClient = updated.toClient();

    res.json({
      success: true,
      message: "Đã nâng cấp/gia hạn Premium (1 tháng).",
      user: userForClient,
    });
  } catch (error) {
    console.log("upgradeUserToPremium error:", error);
    res.json({ success: false, message: "Có lỗi khi nâng cấp tài khoản." });
  }
};

// Toggle like song
const toggleLikeSong = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    const { songId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: "Chưa xác thực." });
    if (!songId || !mongoose.isValidObjectId(songId)) {
      return res.status(400).json({ success: false, message: "songId không hợp lệ." });
    }

    const songExists = await Song.findById(songId).select("_id");
    if (!songExists) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài hát." });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User không tồn tại." });

    const idx = user.likedSongs ? user.likedSongs.findIndex(id => id.toString() === songId) : -1;
    let action;
    if (idx === -1) {
      user.likedSongs = user.likedSongs || [];
      user.likedSongs.push(songId);
      action = "liked";
    } else {
      user.likedSongs.splice(idx, 1);
      action = "unliked";
    }

    await user.save();
    return res.json({ success: true, action, likedSongs: user.likedSongs });
  } catch (err) {
    console.error("toggleLikeSong error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// Get my liked songs (populated)
const getMyLikedSongs = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: "Chưa xác thực." });

    const user = await userModel.findById(userId).populate({
      path: "likedSongs",
      model: "Song",
    });

    if (!user) return res.status(404).json({ success: false, message: "User không tồn tại." });

    return res.json({ success: true, likedSongs: user.likedSongs || [] });
  } catch (err) {
    console.error("getMyLikedSongs error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// Get current user info
const getMe = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: "Chưa xác thực." });

    let user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User không tồn tại." });

    await expireIfNeeded(user);
    user = await userModel.findById(userId);

    let userForClient = user;
    if (typeof user.toClient === "function") userForClient = user.toClient();

    return res.json({ success: true, user: userForClient });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

// ------------------- Export -------------------
export {
  registerUser,
  loginUser,
  sendOtpToEmail,
  verifyOtp,
  googleLogin,
  listUsers,
  removeUser,
  upgradeUserToPremium,
  toggleLikeSong,
  getMyLikedSongs,
  getMe,
};
