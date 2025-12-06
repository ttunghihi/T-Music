# Authentication & Session — T-Music (Bản mở rộng đầy đủ)

## 📌 TỪ KHÓA – TỪ LÓNG – CÁCH HỎI LIÊN QUAN ĐĂNG NHẬP / TÀI KHOẢN / TOKEN
### Các từ cực ngắn – chatbot phải nhận diện được
- login
- log in
- log?
- đăng nhập?
- đăng nhập
- vào acc
- vào tk
- tk?
- acc?
- vô tk
- sign in / signin
- đăng xuất / log out / logout
- out acc / out tk
- thoát?
- thoát tài khoản
- bị out / bị đá ra
- session?
- token?
- lỗi token
- token expired
- expired?
- hết hạn đăng nhập
- bị kick
- auto logout
- tự nhiên bị đăng xuất

### Gõ sai / gõ thiếu / viết tắt
- loign / logni / longin
- logn / lgin / lgn
- sigin / sig in / sigin
- dn / dn? (đăng nhập)
- dx (đăng xuất)
- acc / tk / ac
- toke / tokn / tokne
- sess / sesion / seson / ssion

### Câu hỏi phổ biến
- sao không đăng nhập được?
- đăng nhập ở đâu?
- chỗ nào login?
- đăng nhập bị lỗi
- tại sao bị thoát ra?
- vì sao token hết hạn?
- trang cứ bắt mình login lại?
- làm sao nhớ đăng nhập?
- có lưu đăng nhập không?
- đăng nhập bằng email hay username?
- đổi mật khẩu ở đâu?
- quên mật khẩu làm sao?

---

## 🎯 MỤC TIÊU CHO CHATBOT
- Nhận diện mọi câu có ý “đăng nhập / xác thực / phiên”
- Phản hồi tự nhiên, không máy móc
- Tự động gợi ý khi user gõ quá ngắn (“login?”, “dn?”, “tk?”)

---

# 🔐 HỆ THỐNG AUTH — GIẢI THÍCH CHO BOT

## ⭐ Cơ chế đăng nhập
- Hệ thống sử dụng **JWT** để xác thực.
- Sau khi login/register → server trả về token chứa:
```json
{ "id": "...", "email": "...", "isPremium": true, "role": "user" }
```
- Token có hạn sử dụng (ví dụ: 30 ngày).

### Phản hồi mẫu:
- “Bạn chỉ cần đăng nhập bằng email và mật khẩu. Sau khi đăng nhập, hệ thống sẽ cấp token để bạn sử dụng.”

---

## ⭐ Token lưu ở client
- `tmusic_token` → JWT token
- `tmusic_user` → thông tin user (rút gọn)

### Lưu trữ:
- Web dùng **localStorage**
- Xóa khi logout

---

## ⭐ Session / Token hết hạn (expired)
### Triệu chứng user hay gặp
- tự bị đăng xuất
- đang dùng bị đá ra
- reload cái là out luôn
- API trả về “401 unauthorized”
- “token expired”

### Phản hồi mẫu:
- “Token của bạn đã hết hạn nên hệ thống yêu cầu đăng nhập lại.”
- “Bạn chỉ cần login lại để tạo phiên mới nhé!”

---

## ⭐ JWT-based auth (backend)
- Sinh JWT khi login/register
- Dùng `JWT_SECRET` trong env
- Có thể dùng **refresh token** (tùy chọn)

---

## ⭐ Đăng xuất (logout)
- Xóa `tmusic_token`  
- Xóa `tmusic_user`  

### Phản hồi mẫu:
- “Bạn đã đăng xuất thành công.”
- “Bạn muốn thoát tài khoản phải không? Mình hướng dẫn nhé.”

---

## ⭐ Các lỗi đăng nhập thường gặp & chatbot cần hiểu
### 1. Sai mật khẩu
- “wrong password”
- “mật khẩu không đúng”
- “password incorrect”

### 2. Email không tồn tại
- “email not found”
- “không có tài khoản này”

### 3. Thiếu thông tin
- “thiếu email”
- “thiếu mật khẩu”

### 4. Server lỗi
- “500 error”
- “server down”
- “không login được”

### Phản hồi mẫu
- “Bạn kiểm tra lại email/mật khẩu giúp mình nhé.”
- “Có vẻ hệ thống đang quá tải, bạn thử lại sau ít phút.”

---

# 🔧 SECURITY
- Sử dụng HTTPS
- Nếu dùng cookie → bật `Secure`, `HttpOnly`
- Role-check cho admin
- Có thể blacklist token khi logout (tùy chọn)

---

# 🤖 Phản hồi mẫu cho chatbot (QUAN TRỌNG)
### Khi user gõ rất ngắn:
- User: `login?`  
  → “Bạn muốn đăng nhập phải không? Bạn chỉ cần nhập email và mật khẩu tại trang Login.”

- User: `dn?`  
  → “Bạn đang muốn đăng nhập? Mình hướng dẫn nhé.”

### Khi token lỗi:
- “Phiên đăng nhập của bạn đã hết hạn, bạn đăng nhập lại giúp mình nhé.”

### Khi quên mật khẩu:
- “Bạn có thể dùng chức năng ‘Quên mật khẩu’ để đặt lại mật khẩu mới.”

### Khi bị đá ra:
- “Có thể token đã hết hạn hoặc trình duyệt xoá dữ liệu. Bạn đăng nhập lại là được.”

---

# 🎉 KẾT LUẬN
File này giúp chatbot:
- hiểu mọi kiểu người dùng nói về đăng nhập
- nhận diện từ ngắn, gõ sai, từ lóng
- phản hồi tự nhiên, dễ hiểu
- mô tả rõ cơ chế auth/session của T‑Music
