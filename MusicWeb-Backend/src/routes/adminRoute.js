// routes/adminRoute.js
import express from "express";
import { adminLogin, getAllUsers, removeUser, toggleAdmin } from "../controllers/adminController.js";

const adminRouter = express.Router();

// Admin login (frontend admin gọi để kiểm tra credential hardcoded)
adminRouter.post("/login", adminLogin);

// Lấy danh sách user (không cần token theo yêu cầu)
adminRouter.get("/users", getAllUsers);

// Xóa user
adminRouter.post("/remove-user", removeUser);

// Gán / thu hồi quyền admin cho user
adminRouter.post("/toggle-admin", toggleAdmin);

export default adminRouter;
