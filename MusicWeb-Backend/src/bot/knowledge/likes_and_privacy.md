# Like (Yêu thích) & Quyền riêng tư — Bản mở rộng đầy đủ cho Chatbot T‑Music

## 🎯 Mục tiêu của file
- Giúp chatbot nhận diện **mọi câu hỏi ngắn, từ lóng, gõ sai** liên quan đến *like*, *yêu thích*, *riêng tư*.
- Mở rộng toàn bộ logic để AI trả lời tự nhiên & chính xác.

---

# 📌 1. TỪ KHÓA – TỪ LÓNG – GÕ SAI (CHATBOT PHẢI HIỂU)

## A. Từ cực ngắn
- like?
- thích?
- tim?
- ♥?
- fav?
- yt? (yêu thích)
- save?
- lưu?
- thả tim?
- fav bài?

## B. Các cụm từ phổ biến
- yêu thích bài này
- thêm vào yêu thích
- lưu bài hát này
- lưu bài
- add to favorite
- cho vào list yêu thích
- mở danh sách yêu thích
- xem bài đã like
- bài tôi đã like đâu?
- mất like rồi?
- không like được
- like bị lỗi

## C. Từ lóng
- thả tym
- tym bài
- lưu vô thư viện
- bỏ tym
- gỡ like
- unlike

## D. Gõ sai / viết tắt
- likek / lik / lkie
- fav / fva / fave
- yeu thich / iu thik / iu thic
- priv / priva / prv / pv
- prvc / privcy
- an bai / an like / an danh

---

# 📌 2. TÌNH HUỐNG USER HAY HỎI

## 🎵 Về like bài hát
- sao like không được?
- like mãi không lưu
- like xong thoát ra mất?
- tại sao không xem được bài đã like?
- chỗ xem like nằm đâu?

### → Phản hồi mẫu
- “Bạn vào mục *Yêu thích* trong tài khoản là xem được tất cả bài đã like.”
- “Nếu like không lưu, bạn kiểm tra xem đã đăng nhập chưa nhé.”

---

## 🔒 Về quyền riêng tư
- không muốn ai thấy bài tôi đã like
- like có công khai không?
- người khác có xem được like của tôi không?
- tài khoản riêng tư là gì?
- làm sao ẩn danh sách yêu thích?

### → Phản hồi mẫu
- “Danh sách bài bạn đã like chỉ mình bạn xem được. Người khác không thể xem.”
- “Hiện tại hệ thống mặc định để danh sách like ở chế độ riêng tư.”

---

## ❗ Về lỗi like
- like bị fail
- backend không nhận
- báo 401
- token expired khi like
- like xong biến mất
- bị out nên mất like

### → Phản hồi mẫu
- “Có vẻ token hết hạn nên hệ thống không lưu được like. Bạn đăng nhập lại giúp mình nhé.”

---

# 📌 3. CÁCH HOẠT ĐỘNG CỦA LIKE TRONG T‑MUSIC

## ⭐ Yêu cầu
- User **phải đăng nhập**
- Like gửi kèm **JWT token**

## ⭐ Frontend
- Gọi POST `/api/song/like`
- Hoặc `/api/user/likes`
- Body gồm: `songId`
- Header: `Authorization: Bearer <token>`

## ⭐ Backend (logic đầy đủ)
### Hai cách triển khai:

### **1. Lưu trực tiếp trong User model**
```json
{
  "likedSongs": ["songId1", "songId2"]
}
```

### **2. Collection riêng `likes`**
```
{ userId, songId, createdAt }
```

## ⭐ Endpoint gợi ý
- POST `/api/song/like` → toggle (like/unlike)
- GET `/api/user/likes` → trả về list bài đã like

---

# 📌 4. QUYỀN RIÊNG TƯ (PRIVACY)

## ✔ Danh sách like là **riêng tư**
- Chỉ user đó xem được.
- Người khác không thể truy cập.
- Backend phải check `userId === requesterId`.

## ✔ Khi logout
- Xóa `tmusic_token`
- Xóa `tmusic_user`

---

# 📌 5. PHẢN HỒI MẪU CHO CHATBOT (QUAN TRỌNG)

### Khi user gõ *rất ngắn*
- User: `like?`  
  → “Bạn muốn lưu bài hát này vào danh sách yêu thích đúng không?”

- User: `tim?`  
  → “Bạn muốn thả tim bài hát? Mình hướng dẫn nhé.”

### Khi user muốn xem bài đã like
- “Bạn vào mục *Yêu thích* ở menu tài khoản để xem danh sách bài bạn đã like.”

### Khi user sợ bị lộ thông tin
- “Danh sách bài đã like là riêng tư. Không ai khác xem được.”

### Khi like lỗi
- “Bạn thử đăng nhập lại nhé. Token hết hạn có thể khiến hệ thống không lưu được like.”

---

# 📌 6. KẾT LUẬN
File này giúp chatbot:
- nhận diện từ khóa tự nhiên nhất về Like & Privacy
- hiểu gõ sai / từ viết tắt
- trả lời tự nhiên & chính xác
- mô tả rõ cách hệ thống hoạt động
