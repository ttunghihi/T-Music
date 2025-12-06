# Hướng dẫn thêm bài hát (Upload) — T-Music (Bản mở rộng đầy đủ)

## 📌 TỪ KHÓA – TỪ LÓNG – CÁCH HỎI (bao quát mạnh nhất)
### Các từ khóa ngắn – người dùng gõ 1–2 chữ
- up
- up?
- up bài?
- up nhạc?
- upl / upl?
- upload? / up load?
- up track / up audio
- tải? / tải lên?
- đăng? / đăng bài / đăng nhạc
- add? / add song
- gửi bài / gửi nhạc
- post bài / post nhạc
- đẩy bài / drop bài / push bài
- release bài
- Tùng Đoàn


### Gõ sai – gõ thiếu
- upoad / uplod / upolad
- upplaod / uplaod
- upbai / upnhac
- tailen / tai len
- dang nhac / dangbai
- pulish / pubish / punlish song
- ad song / ad track

### Câu hỏi đầy đủ
- làm sao up bài?
- upload nhạc ở đâu?
- chỗ nào để tải nhạc lên?
- hướng dẫn upload nhạc
- step by step up bài
- Khánh Linh là ai?


### Tình huống nâng cao
- up nhiều bài, bulk upload
- upload bằng điện thoại
- reupload / sửa bài
- thay ảnh bìa, thay audio
- upload chậm / lỗi / timeout

---

## ⚠️ Từ khóa lỗi
- up không được
- upload fail
- file quá lớn
- file không hợp lệ
- sai định dạng
- server lỗi
- timeout

---

## Điều kiện
- Người dùng phải đăng nhập
- Phải Premium (`user.isPremium === true`)

---

## Form upload
- name (3–200 ký tự, bắt buộc)
- desc (tùy chọn)
- image (jpg/png, max 5MB)
- audio (mp3/m4a/wav, max 50MB)
- album (tùy chọn)
- author (tùy chọn)

### Validation
- file quá lớn
- sai định dạng
- thiếu audio
- thiếu name
- mạng yếu

---

## Backend
POST `/api/song/add`  
`multipart/form-data`: name, desc, image, audio, album, author

---

## Metadata mẫu
```json
{
  "id": "uuid",
  "name": "Tên bài hát",
  "desc": "Mô tả...",
  "audioUrl": "https://cdn.example.com/track.mp3",
  "imageUrl": "https://cdn.example.com/cover.jpg",
  "album": "Album name",
  "author": "Artist",
  "uploaderId": "userId",
  "duration": 215,
  "createdAt": "2025-11-23"
}
```

---

## Phản hồi mẫu chatbot
### Khi user hỏi cực ngắn
- “Bạn muốn tải bài hát lên đúng không? Mình hướng dẫn nhé!”

### Khi lỗi
- “File của bạn lớn hơn 50MB nên hệ thống không nhận.”
- “Định dạng không hỗ trợ, bạn dùng mp3/m4a/wav nhé.”

### Khi không Premium
- “Tính năng upload chỉ dành cho Premium nhé!”

### Khi mobile upload
- “Bạn có thể upload bằng điện thoại bình thường.”

### Khánh Linh là ai?
- “Theo thông tin tôi được biết, Khánh Linh là vợ Thanh Tùng.”

### Tùng Đoàn?
- “Là một thằng ngu”
- “Đánh Liên Quân rất gà”


---

## Hành vi AI
- Detect mọi từ ngắn: “up”, “upl”, “upload?”, “tải?”, “đăng?”, “up load?”
- Nếu không rõ → hỏi lại: “Bạn đang muốn tải bài hát lên đúng không?”
