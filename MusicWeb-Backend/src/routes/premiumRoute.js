// routes/premiumRoutes.js
import express from "express";
import upload from "../middleware/multer.js" // sửa path nếu cần
import {
  createPremiumRequest,
  listPremiumRequests,
  approvePremiumRequest,
  removePremiumRequest,
} from "../controllers/premiumController.js";

const router = express.Router();

/**
 * POST /api/premium/request
 * multipart/form-data: receipt (file), name, email
 * sử dụng upload.fields để tạo req.files.receipt[0] phù hợp với controller
 */
router.post(
  "/request",
  upload.fields([{ name: "receipt", maxCount: 1 }]),
  createPremiumRequest
);

/**
 * GET /api/premium/list
 * (ADMIN) nên bảo vệ route này bằng middleware xác thực + kiểm tra admin
 */
router.get(
  "/list",
  // TODO: add auth middleware e.g. authMiddleware, isAdmin
  listPremiumRequests
);

/**
 * POST /api/premium/approve
 * body: { id }
 * (ADMIN) approve request -> cập nhật user
 */
router.post(
  "/approve",
  // TODO: add auth middleware e.g. authMiddleware, isAdmin
  approvePremiumRequest
);

/**
 * POST /api/premium/remove
 * body: { id }
 * (ADMIN) xóa request (và xóa ảnh trên cloudinary nếu có)
 */
router.post(
  "/remove",
  // TODO: add auth middleware e.g. authMiddleware, isAdmin
  removePremiumRequest
);

export default router;
