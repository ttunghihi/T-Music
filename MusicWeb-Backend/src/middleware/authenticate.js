// src/middleware/authenticate.js
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "tmusic_secret_key";

export default async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: "No token provided." });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ success: false, message: "Invalid authorization header." });
    }

    const token = parts[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    if (!payload || !payload.id) {
      return res.status(401).json({ success: false, message: "Invalid token payload." });
    }

    // fetch user doc (without password)
    const user = await userModel.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "User not found." });

    // attach minimal info and compatibility fields expected by controllers
    req.user = { id: user._id, email: user.email, name: user.name };
    req.userDoc = user;         // full user doc (no password)
    req.userId = user._id;      // legacy/compatibility with playlistController
    req.user._id = user._id;    // ensure req.user._id exists if controllers expect it

    return next();
  } catch (err) {
    console.error("authenticate error:", err);
    return res.status(500).json({ success: false, message: "Server error in auth." });
  }
}
