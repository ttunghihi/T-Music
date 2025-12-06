# T-Music — Tổng quan (Bản mở rộng đầy đủ cho Chatbot)

## 🎯 Mục tiêu của file
Giúp chatbot hiểu toàn bộ hệ thống T‑Music, nhận diện câu hỏi tổng quan, câu hỏi ngắn, từ lóng, gõ sai, và trả lời một cách đầy đủ – tự nhiên.

---

# 📌 1. TỪ KHÓA – TỪ LÓNG – CÁCH HỎI LIÊN QUAN ĐẾN “TỔNG QUAN”
### A. Câu cực ngắn (AI phải hiểu)
- T-Music là gì?
- app gì đây?
- hệ thống này sao?
- tổng quan?
- overview?
- info?
- giới thiệu?
- app hoạt động sao?
- chức năng?
- có gì hay?
- làm được gì?
- hệ thống này dùng để làm gì?

### B. Cụm từ user thường hỏi
- app này gồm những tính năng gì?
- có upload không?
- có premium không?
- có chat bot không?
- nhạc lưu ở đâu?
- server chạy kiểu gì?
- có bảo mật không?
- có bị mất dữ liệu không?
- có thể nghe nhạc chất lượng cao không?

### C. Từ lóng / gõ sai / viết tắt
- tmusic / tmusc / t-musik / tmsic
- func / func? / fea (feature)
- premum / pre / prm
- upld / uplo / uploa
- ovw / ov? / overv
- systm / sytem / sys

---

# 📌 2. T‑MUSIC LÀ GÌ? (TRẢ LỜI CHUẨN CHO CHATBOT)
T‑Music là một **web app nghe nhạc** tích hợp:
- Nghe nhạc chất lượng cao  
- Upload bài hát (cho user Premium)  
- Like bài & tạo danh sách yêu thích  
- Playlist cá nhân  
- Chatbot AI hỗ trợ người dùng  
- Hệ thống đăng nhập / đăng ký với JWT  
- Giao diện player có play/pause, next/prev, loop, shuffle, seek, volume  

---

# 📌 3. DANH SÁCH TÍNH NĂNG CHI TIẾT

## 🎵 Nghe nhạc
- Play / pause  
- Next / previous  
- Loop 1 bài hoặc loop toàn playlist  
- Shuffle (trộn bài)  
- Điều chỉnh âm lượng  
- Thanh seek (tua bài)  
- Ảnh bìa + metadata hiển thị trực quan  

---

## 💛 Like & Yêu thích
- Like / unlike bài hát  
- Danh sách bài đã like riêng tư  
- Chỉ user đó mới xem được  

---

## 🎧 Upload bài hát (chỉ Premium)
- Upload file *audio + image + metadata*  
- Hệ thống kiểm tra dung lượng, định dạng  
- Được lưu trên storage server hoặc cloud  
- Có phân tích metadata (duration / bitrate)  

---

## ⭐ Premium
- Quyền upload bài hát  
- Nghe nhạc mượt và không quảng cáo  
- Hỗ trợ ưu tiên từ hệ thống  

User nâng cấp Premium bằng cách:
- Gửi ảnh **receipt** (hoá đơn) thanh toán  
- Admin duyệt và bật cờ `isPremium`  

---

## 📝 Playlist
- Tạo playlist  
- Thêm bài / xóa bài  
- Phát playlist theo thứ tự hoặc shuffle  

---

## 🤖 Chatbot trợ lý (RAG + LLM)
- Trả lời dựa trên **knowledge base**  
- Nhận diện từ lóng, câu hỏi ngắn, sai chính tả  
- Hiểu ý định (intent)  
- Fallback LLM khi không tìm được câu trả lời trong KB  

---

## 🔐 Auth / Session (JWT)
- Đăng ký bằng email + mật khẩu  
- Login nhận **JWT token**  
- Token lưu tại `localStorage`  
- Token timeout → yêu cầu đăng nhập lại  

---

## ☁ Lưu trữ nhạc & tốc độ server
- Nhạc và ảnh được lưu vào:
  - Local storage  
  - Hoặc cloud (tuỳ cấu hình backend)
- Server xử lý:
  - Node.js  
  - MongoDB  
  - Socket/Web API nhanh, phản hồi thời gian thực  
- Tối ưu tốc độ phát nhạc & tải file  

---

# 📌 4. CÂU HỎI THƯỜNG GẶP & TRẢ LỜI MẪU

### ❓ T-Music dùng để làm gì?
→ “T‑Music là nền tảng nghe nhạc có hỗ trợ upload bài hát cho Premium và chatbot hỗ trợ người dùng.”

### ❓ Có upload nhạc không?
→ “Có, nhưng tính năng upload chỉ dành cho Premium.”

### ❓ Dữ liệu có an toàn không?
→ “Hệ thống dùng JWT, HTTPS và bảo mật API nên dữ liệu của bạn được bảo vệ.”

### ❓ Chatbot hoạt động như thế nào?
→ “Chatbot dùng RAG + LLM, truy vấn kiến thức từ hệ thống và trả lời tự nhiên.”

### ❓ App có playlist không?
→ “Bạn có thể tạo playlist, thêm bài, xoá bài và phát theo thứ tự hoặc shuffle.”

---

# 📌 5. HÀNH VI CHATBOT (RẤT QUAN TRỌNG)

- Khi user chỉ gõ “tổng quan?”, “app này là gì?”, “T-Music?” → trả lời giới thiệu đầy đủ.  
- Khi user hỏi “có chức năng gì?” → liệt kê rõ ràng.  
- Khi user hỏi quá ngắn:
  - User: “tmusic?”  
    → “Bạn muốn biết tổng quan về T‑Music đúng không? Đây là hệ thống nghe nhạc + upload + playlist + AI trợ lý…”

- Chatbot phải *giải thích rõ ràng*, tránh trả lời quá ngắn.  
- Với câu hỏi kỹ thuật → chatbot cung cấp thông tin đúng file KB.  

---

# 📌 6. KẾT LUẬN
File overview này giúp chatbot:
- Hiểu toàn bộ hệ thống  
- Trả lời tự nhiên & đầy đủ  
- Nhận diện từ khóa tổng quan, gõ sai, từ ngắn  
- Tránh trả lời lệch nội dung  

