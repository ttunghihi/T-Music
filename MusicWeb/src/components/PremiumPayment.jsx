// PremiumPayment.jsx
import React, { useEffect, useState, useRef } from 'react'
import Navbar from './Navbar'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const API_BASE = "https://t-music.onrender.com" // <-- sửa nếu cần

const PremiumPayment = () => {
  const navigate = useNavigate()

  // undefined = loading, null = not logged in, object = logged in
  const [user, setUser] = useState(undefined)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef(null)

  // Load user từ localStorage giống Navbar (key "user")
  useEffect(() => {
    const saved = localStorage.getItem("user")
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [])

  // Nếu đã biết user là null thì chuyển sang login
  useEffect(() => {
    if (user === undefined) return // vẫn đang load
    if (!user) navigate("/login")
  }, [user, navigate])

  const displayName = () => {
    if (!user) return ""
    if (user.name && user.name.trim()) return user.name
    if (user.email) return user.email.split("@")[0]
    return "User"
  }

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      alert("Vui lòng tải lên ảnh xác nhận thanh toán.")
      return
    }

    setSubmitting(true)

    try {
      const fd = new FormData()
      fd.append("receipt", file)
      fd.append("email", user.email)
      fd.append("name", user.name || "")

      const headers = {}
      // lấy token từ localStorage theo convention mới
      const token = localStorage.getItem("token") || (user && user.token)
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch(`${API_BASE}/api/premium/request`, {
        method: "POST",
        headers, // NOTE: DON'T set Content-Type (browser will set multipart boundary)
        body: fd,
      })

      // nếu server trả JSON
      let data = null
      try {
        data = await res.json()
      } catch (err) {
        console.error("Không thể parse JSON từ server", err)
      }

      console.log("premium request response:", res.status, data)

      // kiểm tra data.success (theo style controller backend)
      if (!data || !data.success) {
        // nếu server có message hiển thị, nếu không thì show lỗi chung
        const msg = data?.message || `Server trả về lỗi (status ${res.status})`
        alert(msg)
        setSubmitting(false)
        return
      }

      // thành công
      setSuccess(true)
    } catch (err) {
      console.error("submit error", err)
      alert("Lỗi mạng hoặc server. Thử lại sau.")
    } finally {
      setSubmitting(false)
    }
  }

  // trong lúc load user: render null (hoặc spinner nếu muốn)
  if (user === undefined) return null
  if (!user) return null // sẽ redirect bởi useEffect

  return (
    <>
      <Navbar />

      <div className="mt-10 flex flex-col items-center text-center text-white px-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={assets.tmusic_logo} alt="T-Music" className="w-12" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-500">Yêu cầu nâng cấp Premium</h1>
        </div>

        <p className="text-gray-400 max-w-2xl mb-6">
          Chúng tôi sẽ xử lý yêu cầu của bạn sau khi xác nhận đã thanh toán đúng số tiền.
        </p>

        <div className="bg-gradient-to-b from-neutral-900 to-black border border-orange-500/30 shadow-lg rounded-2xl mt-4 w-full max-w-md p-8">
          {!success ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* THÔNG TIN TÀI KHOẢN (không cho sửa) */}
              <div className="text-left mb-3">
                <p className="text-gray-300 font-medium mb-1">Tài khoản của bạn:</p>
                <div className="bg-[#111] border border-neutral-800 rounded-lg px-4 py-3">
                  <p className="text-orange-400 font-semibold">{displayName()}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              </div>

              {/* QR + caption */}
              <div className="flex flex-col items-center w-full mb-4 mt-2">
                <img
                  src={assets.qrthanhtoan}
                  alt="QR chuyển khoản"
                  className="w-52 h-52 object-contain rounded-xl border border-neutral-800 shadow-md mb-2"
                />

                <p className="text-gray-300 text-sm italic">
                  Vui lòng chuyển khoản vào mã QR dưới đây
                </p>
              </div>

              {/* UPLOAD ẢNH */}
              <label className="text-left text-gray-300 font-medium">Ảnh xác nhận thanh toán</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer" onClick={() => inputRef.current && inputRef.current.click()}>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-full cursor-pointer bg-[#0f0f0f] border border-dashed border-neutral-700 rounded-lg px-4 py-3 hover:border-orange-500 transition-all">
                    {file ? (
                      <div className="flex items-center justify-between">
                        <span className="truncate">{file.name}</span>
                        <span className="text-sm text-gray-400">Đã chọn</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Nhấn để chọn ảnh hoặc kéo thả</span>
                    )}
                  </div>
                </label>

                <div className="w-20 h-20 rounded-md bg-[#0a0a0a] border border-neutral-800 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Clear file small button */}
              {file && (
                <div className="text-right">
                  <button type="button" onClick={clearFile} className="text-sm text-gray-400 underline">
                    Xóa ảnh đã chọn
                  </button>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-3 rounded-full transition-all disabled:opacity-60"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 rounded-full border border-neutral-700 text-gray-300"
                >
                  Huỷ
                </button>
              </div>

            </form>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#0a0a0a] border border-neutral-800 overflow-hidden">
                {preview && <img src={preview} alt="uploaded" className="w-full h-full object-cover" />}
              </div>

              <h3 className="text-xl font-bold text-orange-400">Gửi yêu cầu thành công!</h3>
              <p className="text-gray-300 max-w-xs">
                Cảm ơn {displayName()} - Vui lòng đăng nhập lại để kiểm tra trạng thái tài khoản! {user.email}.
              </p>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-full bg-orange-500 text-black font-semibold"
                >
                  Về trang chính
                </button>
                <button
                  onClick={() => {
                    setSuccess(false)
                    clearFile()
                  }}
                  className="px-6 py-3 rounded-full border border-neutral-700 text-gray-300"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-12 mb-10 text-gray-500 text-sm">
          © 2025 T-Music — Đỉnh cao âm nhạc dành cho bạn 🎧
        </p>
      </div>
    </>
  )
}

export default PremiumPayment
