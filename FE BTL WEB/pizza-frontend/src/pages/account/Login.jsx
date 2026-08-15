import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { findStaffAccount } from "../../data/authDb"
import { useStaff } from "../../staff/StaffContext"
import "./Login.css"

export default function Login() {
  const navigate = useNavigate()
  const { user, loginWithCredentials, registerUser, logout } = useAuth()
  const { staff, staffLoginWithAccount, staffLogout } = useStaff()

  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({
    name: "",
    identifier: "",
    email: "",
    password: "",
    confirm: "",
  })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (staff) navigate("/staff/dashboard", { replace: true })
  }, [navigate, staff])

  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true })
    }
  }, [navigate, user])

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
      if (!form.name.trim()) nextErrors.name = "Vui lòng nhập họ tên"
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = "Email không hợp lệ"
      if (!form.password || form.password.length < 6) nextErrors.password = "Mật khẩu tối thiểu 6 ký tự"
      if (form.password !== form.confirm) nextErrors.confirm = "Mật khẩu không khớp"
    } else {
      if (!form.identifier.trim()) nextErrors.identifier = "Nhập email"
      if (!form.password) nextErrors.password = "Nhập mật khẩu"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    setTimeout(() => {
      if (mode === "register") {
        staffLogout()
        const result = registerUser({
          name: form.name,
          email: form.email,
          password: form.password,
        })
        setLoading(false)
        if (!result.ok) {
          setErrors(prev => ({ ...prev, submit: result.message || "Không thể tạo tài khoản" }))
          return
        }
        navigate("/profile")
        return
      }

      const staffAccount = findStaffAccount(form.identifier, form.password)
      if (staffAccount) {
        logout()
        staffLoginWithAccount(staffAccount)
        setLoading(false)
        navigate("/staff/dashboard")
        return
      }

      staffLogout()
      const userResult = loginWithCredentials(form.identifier, form.password)
      setLoading(false)
      if (!userResult.ok) {
        setErrors(prev => ({
          ...prev,
          submit: "Tài khoản không hợp lệ.",
        }))
        return
      }
      navigate("/profile")
    }, 600)
  }

  return (
    <div className="ln-page">
      <div className="ln-panel">
        <div className="ln-panel-overlay" />
        <div className="ln-panel-content">
          <button className="ln-logo" onClick={() => navigate("/")}>
            <span className="ln-logo-main">Hải SAPA</span>
            <span className="ln-logo-sub">UNIFIED ACCESS</span>
          </button>
          <div className="ln-panel-body">
            <h2 className="ln-panel-title">
              Cổng truy cập<br /><em>dùng chung</em><br />mọi vai trò
            </h2>
            <p className="ln-panel-desc">
              User đăng ký tài khoản mới để sử dụng. Staff, admin và driver đăng nhập chung tại đây nhưng chỉ vào được khi tài khoản đã có trong database.
            </p>
          </div>
          <div className="ln-panel-badges">
            {[
              "🌐 Public: xem menu, đặt bàn, đặt hàng",
              "👤 User: hồ sơ, đơn hàng, reservation",
              "🧑‍🍳 Staff/Admin/Driver: dashboard theo vai trò",
            ].map(badge => (
              <span key={badge} className="ln-badge">{badge}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="ln-form-side">
        <div className="ln-form-wrap">
          <button className="ln-back" onClick={() => navigate(-1)}>← Quay lại</button>

          <div className="ln-tabs">
            <button className={`ln-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>
              Đăng nhập
            </button>
            <button className={`ln-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>
              Đăng ký
            </button>
          </div>

          <h1 className="ln-heading">
            {mode === "login"
              ? <>Đăng nhập<br /><em>phân luồng tự động</em></>
              : <>Tạo tài khoản mới<br /><em></em></>}
          </h1>

          <form className="ln-form" onSubmit={handleSubmit} noValidate>
            {mode === "register" ? (
              <>
                <div className="ln-field">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={form.name}
                    onChange={e => setField("name", e.target.value)}
                    className={errors.name ? "err" : ""}
                  />
                  {errors.name && <span className="ln-err">{errors.name}</span>}
                </div>
                <div className="ln-field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={e => setField("email", e.target.value)}
                    className={errors.email ? "err" : ""}
                  />
                  {errors.email && <span className="ln-err">{errors.email}</span>}
                </div>
              </>
            ) : (
              <div className="ln-field">
                <label>Email</label>
                <input
                  type="text"
                  placeholder="user@email.com"
                  value={form.identifier}
                  onChange={e => setField("identifier", e.target.value)}
                  className={errors.identifier ? "err" : ""}
                />
                {errors.identifier && <span className="ln-err">{errors.identifier}</span>}
              </div>
            )}

            <div className="ln-field">
              <div className="ln-label-row">
                <label>Mật khẩu</label>
                {mode === "login" && <button type="button" className="ln-forgot">Quên mật khẩu</button>}
              </div>
              <div className="ln-pass-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setField("password", e.target.value)}
                  className={errors.password ? "err" : ""}
                />
                <button type="button" className="ln-eye" onClick={() => setShowPass(prev => !prev)}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && <span className="ln-err">{errors.password}</span>}
            </div>

            {mode === "register" && (
              <div className="ln-field">
                <label>Xác nhận mật khẩu</label>
                <div className="ln-pass-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={e => setField("confirm", e.target.value)}
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
            <span>Admin test khi chưa có database thật: `admin / admin123`</span>
          </div>

          {mode === "register" ? (
            <p className="ln-switch">
              Đã có tài khoản? <button onClick={() => switchMode("login")}>Đăng nhập</button>
            </p>
          ) : (
            <p className="ln-switch">
              User chưa có tài khoản? <button onClick={() => switchMode("register")}>Đăng ký mới</button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
