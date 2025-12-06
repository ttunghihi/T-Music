# Intents — T-Music (File cho intent classifier, đầy đủ & mở rộng)

## Mục tiêu
File này chứa danh sách `intents` (ý định) và hàng trăm mẫu câu mẫu (utterances) — bao gồm:
- từ khóa ngắn (1–2 chữ)  
- từ lóng, viết tắt, gõ sai  
- câu đầy đủ / câu hỏi  
Mục đích: dán vào bộ phân loại intent (Rasa / Dialogflow / custom matcher) để bot có thể kích hoạt đúng intent và truy vấn knowledge base.

---

## HƯỚNG DẪN SỬ DỤNG
- Mỗi intent kèm **một list** các mẫu câu (lowercase) để train matcher.
- Nên thêm **n-gram** ngắn (1–3 từ) làm triggers để bắt các câu rất ngắn.
- Bổ sung các dạng **gõ sai** phổ biến.
- Với multilingual, giữ cả tiếng Việt & tiếng Anh (ở đây ưu tiên tiếng Việt).
- Thêm regex patterns cho các trường hợp như `upload\W*?` hoặc `up(l(o|oa)d)?`.

---

# INTENTS

## 1. intent_upload_song
Mục tiêu: người dùng muốn upload/tải bài hát lên.
Mẫu:
- up
- upload
- up?
- upload?
- up bài
- up bài?
- upload nhạc
- upload nhạc ở đâu
- up nhạc ở đâu
- tải nhạc lên
- tải bài hát lên
- tải lên
- đăng nhạc
- đăng bài
- thêm bài
- add song
- add track
- up track
- up audio
- up song
- làm sao up bài
- cách up bài
- up không được
- upload failed
- upload bị lỗi
- up lỗi
- file quá lớn
- giới hạn dung lượng
- up bằng điện thoại
- up mobile
- bulk upload
- up nhiều bài
- reupload
- sửa bài đã đăng
- thay cover
- change cover
- upoad
- uplod
- uplaod
- up load
- up?
- tải? 
- "upload\W*?"
- "up\W*?"

## 2. intent_premium
Mục tiêu: câu hỏi về Premium / VIP / nâng cấp.
Mẫu:
- premium
- vip
- pro
- nâng cấp
- mua premium
- mua vip
- upgrade
- mở khóa
- mở khoá upload
- giá premium
- giá vip
- bao nhiêu tiền
- gửi bill
- gửi receipt
- gửi hoá đơn
- làm sao nâng cấp
- premium mất phí không
- premum
- preimum
- prem
- vipp
- reciept
- recipt
- hoadon
- hoá đơn

## 3. intent_playlist
Mục tiêu: tạo/ quản lý playlist, thắc mắc về playlist.
Mẫu:
- playlist
- tạo playlist
- tạo play list
- tạo danh sách phát
- add playlist
- thêm playlist
- xóa playlist
- xoá playlist
- tạo playlist không được
- không thể tạo playlist
- sao không tạo playlist được
- playlist ở đâu
- my playlist
- playlit
- plylist
- plist

## 4. intent_like_favorite
Mục tiêu: like / lưu bài / danh sách yêu thích
Mẫu:
- like
- thích
- thả tim
- tim
- fav
- favorite
- lưu
- lưu bài
- lưu bài hát
- xem bài đã like
- bài tôi đã like đâu
- mất like
- bỏ like
- unlike
- gỡ like
- likek
- lkie
- tim? 
- thả tym

## 5. intent_auth_login
Mục tiêu: đăng nhập, đăng xuất, token, session
Mẫu:
- login
- đăng nhập
- log in
- log?
- dn?
- đăng xuất
- logout
- out
- bị đá ra
- bị kick
- token
- token expired
- hết hạn
- session expired
- tự nhiên bị đăng xuất
- quên mật khẩu
- forgot password
- reset password
- save login
- remember me
- lgin
- lgoin
- loign

## 6. intent_help_faq
Mục tiêu: người dùng cần hỗ trợ chung / FAQ
Mẫu:
- help
- giúp
- support
- hỗ trợ
- admin
- hỏi admin
- hỏi tí
- chỉ mình với
- làm sao
- làm thế nào
- sao không được
- faq
- fqa
- faqq
- trợ giúp
- cứu

## 7. intent_error_report
Mục tiêu: báo lỗi hệ thống, crash, server
Mẫu:
- lỗi
- bug
- crash
- app văng
- server lỗi
- server down
- 500
- 401
- unauthorized
- timeout
- mạng yếu
- load chậm
- không load được
- stuck
- bị treo
- báo lỗi
- báo exception

## 8. intent_playback_control
Mục tiêu: điều khiển player (play, pause, next, prev, seek, loop, shuffle, volume)
Mẫu:
- play
- pause
- next
- prev
- previous
- tiếp
- tiếp theo
- lùi
- tua
- tua tới
- loop
- lặp
- loop 1
- shuffle
- trộn
- mix
- volume
- to tiếng
- nhỏ tiếng
- mute
- bật âm lượng
- tắt âm lượng
- tăng âm lượng
- giảm âm lượng
- seek 1:20
- tua 1:20

## 9. intent_search_song
Mục tiêu: tìm kiếm bài hát / nghệ sĩ
Mẫu:
- tìm bài
- tìm nhạc
- tìm ca sĩ
- search
- tìm bài hát tên ...
- tìm bài theo lời
- ai hát bài này
- tìm theo lời
- tìm bài giống ...
- tìm track
- tìm ...
- tìm? 

## 10. intent_account_profile
Mục tiêu: thông tin tài khoản, chỉnh sửa profile
Mẫu:
- profile
- thông tin tài khoản
- thay đổi tên
- đổi avatar
- đổi ảnh đại diện
- đổi password
- đổi mật khẩu
- update profile
- edit profile
- email đổi
- xóa tài khoản
- delete account

## 11. intent_payment_receipt
Mục tiêu: gửi hoá đơn / receipt / hỏi về trạng thái thanh toán
Mẫu:
- gửi bill
- gửi receipt
- upload bill
- upload receipt
- trạng thái thanh toán
- đã thanh toán chưa
- đã gửi bill chưa
- tiền đã vào chưa

## 12. intent_admin_actions
Mục tiêu: hành động quản trị (chỉ admin)
Mẫu:
- duyệt receipt
- ban user
- block user
- unblock
- set premium
- nâng cấp tài khoản
- xóa bài
- xoá bài
- reset db
- migrate
- là admin

## 13. intent_file_size_error
Mục tiêu: lỗi quá dung lượng
Mẫu:
- quá dung lượng
- file quá lớn
- max size
- limit file
- max 50mb
- max 5mb
- ảnh quá lớn
- audio quá lớn

## 14. intent_file_format_error
Mục tiêu: định dạng file không hợp lệ
Mẫu:
- sai định dạng
- format not supported
- chỉ nhận mp3
- chỉ nhận m4a
- wav được không
- mp3 không đọc được
- mime type

## 15. intent_mobile_upload
Mục tiêu: upload từ mobile
Mẫu:
- up bằng điện thoại
- upload mobile
- up trên mobile
- tải từ điện thoại
- up bằng iphone
- up bằng android

## 16. intent_bulk_upload
Mục tiêu: upload nhiều file / batch
Mẫu:
- up nhiều bài
- bulk upload
- upload hàng loạt
- upload batch
- multi upload

## 17. intent_reupload_edit
Mục tiêu: sửa bài đã đăng, thay file, reupload
Mẫu:
- sửa bài
- edit song
- reupload
- thay file
- thay audio
- update track
- update cover

## 18. intent_privacy_settings
Mục tiêu: quyền riêng tư, ai xem like, ẩn danh
Mẫu:
- riêng tư
- private
- ai thấy bài tôi thích
- ẩn danh
- ẩn danh khi like
- danh sách like riêng tư

---

# BEST PRACTICES & MATCHING RULES
1. **Prioritize exact match** for short tokens (e.g., "up", "like", "premium").  
2. **If user input is 1–3 words**, run n-gram matcher against intents' short triggers first.  
3. **Use synonyms** (mapping table) to normalize before matching (e.g., "tyM" -> "tim" -> "thả tim").  
4. **Include common misspellings** (uplaod, uplod, loign, dn, dx) in training data.  
5. **Confidence threshold**: if intent confidence < 0.6 → ask clarifying question ("Bạn đang muốn ...?").  
6. **Fallback**: if top intent is unknown → perform KB search with retrieval + LLM fallback.  
7. **Regex**: use patterns for file-related queries: `/(up|upload|tải)\W*(nhạc|bài|track)?/i`  
8. **Language detection**: handle mixed english/vietnamese phrases.  
9. **Entity extraction**: extract `song_name`, `artist`, `file_type`, `file_size`, `receipt_id` when possible.

---

# EXAMPLES: rules for short inputs
- Input: "up?" → match intent_upload_song  
- Input: "upload" → match intent_upload_song  
- Input: "premium" → match intent_premium  
- Input: "like" → match intent_like_favorite  
- Input: "dn" → match intent_auth_login (expand dn -> đăng nhập)

---

# KẾT LUẬN
File này là source chuẩn để feed vào intent classifier. Bạn có thể:
- Dùng trực tiếp cho Rasa / Dialogflow bằng cách convert utterances -> training phrases.  
- Dùng custom matcher: load short triggers, build trie / keyword index để match nhanh.  
- Cập nhật bổ sung theo logs thực tế (user queries) để tăng coverage.

