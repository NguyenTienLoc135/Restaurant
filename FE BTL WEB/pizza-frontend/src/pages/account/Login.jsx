import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { decodeJwtToken, isJwtTokenExpired } from "../../services/jwt"
import { normalizeUserResponse } from "../../services/responseAdapters"
import { useStaff } from "../../staff/StaffContext"
import "./Login.css"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082"

export default function Login() {
  const navigate = useNavigate()
  const { user, login, registerUser, logout } = useAuth()
  const { staff, staffLogout, acceptStaffSession } = useStaff()

  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({
    name: "",
    username: "",
    identifier: "",
    email: "",
    phone: "",
    address: "",
    gender: "MALE",
    password: "",
    confirm: "",
  })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const storedStaffToken = localStorage.getItem("hs_staff_token")
  const storedUserToken = localStorage.getItem("hs_user_token")

  if (staff || (storedStaffToken && !isJwtTokenExpired(storedStaffToken))) {
    return <Navigate to="/staff/dashboard" replace />
  }

  if (user || (storedUserToken && !isJwtTokenExpired(storedUserToken))) {
    return <Navigate to="/profile" replace />
  }

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: "", submit: "" }))
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setErrors({})
  }

  function validate() {
    const nextErrors = {}

    if (mode === "register") {
      if (!form.name.trim()) nextErrors.name = "Vui long nhap ho ten"
      if (!form.username.trim()) nextErrors.username = "Vui long nhap ten dang nhap"
      if (!form.phone.trim()) nextErrors.phone = "Vui long nhap so dien thoai"
      if (!form.address.trim()) nextErrors.address = "Vui long nhap dia chi"
      if (!form.gender) nextErrors.gender = "Vui long chon gioi tinh"
      if (!form.password || form.password.length < 6) nextErrors.password = "Mat khau toi thieu 6 ky tu"
      if (form.password !== form.confirm) nextErrors.confirm = "Mat khau khong khop"
    } else {
      if (!form.identifier.trim()) nextErrors.identifier = "Nhap ten dang nhap"
      if (!form.password) nextErrors.password = "Nhap mat khau"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function redirectTo(path) {
    navigate(path, { replace: true })
  }

  function persistUserSession(nextUser, nextToken) {
    if (!nextToken) return
    localStorage.setItem("hs_user_token", nextToken)
    localStorage.setItem("hs_user", JSON.stringify(normalizeUserResponse(nextUser)))
    localStorage.removeItem("hs_staff")
    localStorage.removeItem("hs_staff_token")
  }

  function buildFallbackUser(identifier, token) {
    const payload = decodeJwtToken(token) || {}
    const username = String(payload.sub || identifier || "").trim()
    return normalizeUserResponse({
      id: payload.userId || payload.id || username || "pending-user",
      username,
      fullname: username,
      email: "",
      role: payload.role || payload.userRole || "CUSTOMER",
    })
  }

  async function loginDirectly(identifier, password) {
    const username = identifier.trim()

    const loginResponse = await fetch(`${API_BASE_URL}/public/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const loginText = await loginResponse.text()
    if (!loginResponse.ok) {
      throw new Error(loginText || "Tai khoan khong hop le.")
    }

    const nextToken = loginText.trim().replace(/^"|"$/g, "")
    let nextUser

    try {
      const meResponse = await fetch(`${API_BASE_URL}/info/me`, {
        headers: {
          Authorization: `Bearer ${nextToken}`,
        },
      })

      if (!meResponse.ok) {
        throw new Error(await meResponse.text())
      }

      nextUser = normalizeUserResponse(await meResponse.json())
    } catch {
      nextUser = buildFallbackUser(username, nextToken)
    }

    return { ok: true, user: nextUser, token: nextToken }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)

    if (mode === "register") {
      staffLogout()
      const result = await registerUser({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        gender: form.gender,
      })
      setLoading(false)
      if (!result.ok) {
        setErrors(prev => ({ ...prev, submit: result.message || "Khong the tao tai khoan" }))
        return
      }
      redirectTo("/profile")
      return
    }

    staffLogout()
    let loginResult
    try {
      loginResult = await loginDirectly(form.identifier, form.password)
    } catch (error) {
      loginResult = {
        ok: false,
        message: error?.message || "Tai khoan khong hop le.",
      }
    }
    setLoading(false)
    if (!loginResult.ok) {
      setErrors(prev => ({
        ...prev,
        submit: loginResult.message || "Tai khoan khong hop le.",
      }))
      return
    }

    const nextRole = String(loginResult.user?.role || "").trim().toLowerCase()
    if (nextRole === "staff" || nextRole === "driver") {
      logout()
      acceptStaffSession({ ...loginResult.user, role: nextRole }, loginResult.token)
      redirectTo("/staff/dashboard")
      return
    }

    persistUserSession(loginResult.user, loginResult.token)
    login(loginResult.user)
    redirectTo("/profile")
  }

  return (
    <div className="ln-page">
      <div className="ln-panel">
        <div className="ln-panel-overlay" />
        <div className="ln-panel-content">
          <button className="ln-logo" onClick={() => navigate("/")}>
            <span className="ln-logo-main">Hai SAPA</span>
            <span className="ln-logo-sub">UNIFIED ACCESS</span>
          </button>
          <div className="ln-panel-body">
            <h2 className="ln-panel-title">
              Cổng đăng nhập
              <br />
              <em>vào thế giới ẩm thực của chúng tôi</em>
            </h2>
            <p className="ln-panel-desc">
              Đăng nhập để khám phá menu đa dạng, đặt hàng nhanh chóng và trải nghiệm dịch vụ tuyệt vời. Tài khoản của bạn cũng giúp chúng tôi cá nhân hóa trải nghiệm và mang đến những ưu đãi hấp dẫn chỉ dành cho thành viên.
              Đăng nhập để xem menu, đặt hàng, đặt bàn và nhiều hơn thế nữa. 
              
            </p>
          </div>
          <div className="ln-panel-badges">
            {[
              "Dang nhap de xem menu, dat hang, dat ban",
              "Dat mon nhanh chong voi tai khoan da dang ky",
              "Uu dai hap dan chi danh cho thanh vien",
            ].map(badge => (
              <span key={badge} className="ln-badge">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="ln-form-side">
        <div className="ln-form-wrap">
          <button className="ln-back" onClick={() => navigate(-1)}>
            ← Quay Lại
          </button>

          <div className="ln-tabs">
            <button className={`ln-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>
              Đăng nhập
            </button>
            <button className={`ln-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>
              Đăng ký
            </button>
          </div>

          <h1 className="ln-heading">
            {mode === "login" ? (
              <>
                Đăng nhập
                <br />
                <em>vào tài khoản của bạn</em>
              </>
            ) : (
              <>
                Tạo tài khoản mới
                <br />
                <em>để trải nghiệm dịch vụ tốt hơn</em>
              </>
            )}
          </h1>

          <form className="ln-form" onSubmit={handleSubmit} noValidate>
            {mode === "register" ? (
              <>
                <div className="ln-field">
                  <label>Ho va ten</label>
                  <input
                    type="text"
                    placeholder="Nguyen Van A"
                    value={form.name}
                    onChange={event => setField("name", event.target.value)}
                    className={errors.name ? "err" : ""}
                  />
                  {errors.name && <span className="ln-err">{errors.name}</span>}
                </div>
                <div className="ln-field">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    placeholder="nguyenvana"
                    value={form.username}
                    onChange={event => setField("username", event.target.value)}
                    className={errors.username ? "err" : ""}
                  />
                  {errors.username && <span className="ln-err">{errors.username}</span>}
                </div>
                <div className="ln-field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={event => setField("email", event.target.value)}
                    className={errors.email ? "err" : ""}
                  />
                  {errors.email && <span className="ln-err">{errors.email}</span>}
                </div>
                <div className="ln-field">
                  <label>So dien thoai</label>
                  <input
                    type="text"
                    placeholder="0123456789"
                    value={form.phone}
                    onChange={event => setField("phone", event.target.value)}
                    className={errors.phone ? "err" : ""}
                  />
                  {errors.phone && <span className="ln-err">{errors.phone}</span>}
                </div>
                <div className="ln-field">
                  <label>Dia chi</label>
                  <input
                    type="text"
                    placeholder="So nha, duong, quan..."
                    value={form.address}
                    onChange={event => setField("address", event.target.value)}
                    className={errors.address ? "err" : ""}
                  />
                  {errors.address && <span className="ln-err">{errors.address}</span>}
                </div>
                <div className="ln-field">
                  <label>Gioi tinh</label>
                  <select value={form.gender} onChange={event => setField("gender", event.target.value)} className={errors.gender ? "err" : ""}>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                  {errors.gender && <span className="ln-err">{errors.gender}</span>}
                </div>
              </>
            ) : (
              <div className="ln-field">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={form.identifier}
                  onChange={event => setField("identifier", event.target.value)}
                  className={errors.identifier ? "err" : ""}
                />
                {errors.identifier && <span className="ln-err">{errors.identifier}</span>}
              </div>
            )}

            <div className="ln-field">
              <div className="ln-label-row">
                <label>Mật khẩu</label>
                {mode === "login" && (
                  <button type="button" className="ln-forgot">
                    Quên mật khẩu
                  </button>
                )}
              </div>
              <div className="ln-pass-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="........"
                  value={form.password}
                  onChange={event => setField("password", event.target.value)}
                  className={errors.password ? "err" : ""}
                />
                <button type="button" className="ln-eye" onClick={() => setShowPass(prev => !prev)}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <span className="ln-err">{errors.password}</span>}
            </div>

            {mode === "register" && (
              <div className="ln-field">
                <label>Xac nhan mat khau</label>
                <div className="ln-pass-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="........"
                    value={form.confirm}
                    onChange={event => setField("confirm", event.target.value)}
                    className={errors.confirm ? "err" : ""}
                  />
                </div>
                {errors.confirm && <span className="ln-err">{errors.confirm}</span>}
              </div>
            )}

            {errors.submit && <span className="ln-err">{errors.submit}</span>}

            <button type="submit" className={`ln-submit ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? <span className="ln-spinner" /> : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>

          <div className="ln-switch">
            <span>Dang nhap staff/driver hien duoc dong bo theo role backend.</span>
          </div>

          {mode === "register" ? (
            <p className="ln-switch">
              Da co tai khoan? <button onClick={() => switchMode("login")}>Đăng nhập</button>
            </p>
          ) : (
            <p className="ln-switch">
              User chua co tai khoan? <button onClick={() => switchMode("register")}>Đăng ký mới</button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
