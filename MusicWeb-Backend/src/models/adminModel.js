// models/adminModel.js
import bcrypt from "bcrypt";

/**
 * Admin "hardcoded" trong code.
 * Thay đổi trực tiếp ở đây nếu muốn đổi email/password.
 *
 * WARNING: Đây là hardcoded credential, chỉ dùng khi bạn tách hẳn admin frontend
 * và backend trong môi trường kiểm soát. Không dùng cách này trên production công khai.
 */

const ADMIN_EMAIL = "admin@tmusic.local";
const ADMIN_PASSWORD_PLAIN = "Admin12345"; // <-- đổi nếu cần

// hash ngay khi load module (synchronous, chạy 1 lần)
const SALT_ROUNDS = 10;
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD_PLAIN, SALT_ROUNDS);

/**
 * verifyAdmin(email, password) => Promise<boolean>
 */
const verifyAdmin = async (email, password) => {
  if (!email || !password) return false;
  if (email !== ADMIN_EMAIL) return false;
  return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
};

// Export các hằng và helper
export { ADMIN_EMAIL, ADMIN_PASSWORD_HASH, verifyAdmin };
export default { ADMIN_EMAIL, ADMIN_PASSWORD_HASH, verifyAdmin };
