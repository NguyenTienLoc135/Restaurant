import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Login.css"

export default function Login() {
  const [tab,      setTab]      = useState("login")
  const [form,     setForm]     = useState({ name: "", email: "", password: "", confirm: "" })
  const [errors,   setErrors]   = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })) }

  function validate() {
    const e = {}
    if (tab === "register" && !form.name.trim()) e.name = "Vui lòng nhập tên"
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email không hợp lệ"
    if (!form.password || form.password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự"
    if (tab === "register" && form.password !== form.confirm) e.confirm = "Mật khẩu không khớp"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      login({
        name:  tab === "register" ? form.name : form.email.split("@")[0],
        email: form.email,
        phone: "",
        joined: new Date().toLocaleDateString("vi-VN"),
      })
      setLoading(false)
      navigate(-1)
    }, 900)
  }

  return (
    <div className="ln-page">
      {/* LEFT PANEL */}
      <div className="ln-panel">
        <div className="ln-panel-overlay" />
        <div className="ln-panel-content">
          <button className="ln-logo" onClick={() => navigate("/")}>
            <span className="ln-logo-main">Hải SAPA</span>
            <span className="ln-logo-sub">VIETNAM</span>
          </button>
          <div className="ln-panel-body">
            <h2 className="ln-panel-title">Ẩm thực<br /><em>kết nối</em><br />con người</h2>
            <p className="ln-panel-desc">Đăng nhập để đặt bàn nhanh hơn, theo dõi đơn giao hàng và nhận ưu đãi thành viên độc quyền.</p>
          </div>
          <div className="ln-panel-badges">
            {["🍕 Đặt bàn ưu tiên", "🎁 Ưu đãi thành viên", "🛵 Theo dõi đơn hàng"].map(b => (
              <span key={b} className="ln-badge">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="ln-form-side">
        <div className="ln-form-wrap">
          <button className="ln-back" onClick={() => navigate(-1)}>← Quay lại</button>

          <div className="ln-tabs">
            <button className={`ln-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setErrors({}) }}>Đăng nhập</button>
            <button className={`ln-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setErrors({}) }}>Tạo tài khoản</button>
          </div>

          <h1 className="ln-heading">
            {tab === "login" ? <>Chào mừng<br /><em>trở lại</em></> : <>Gia nhập<br /><em>cùng chúng tôi</em></>}
          </h1>

          <form className="ln-form" onSubmit={handleSubmit} noValidate>
            {tab === "register" && (
              <div className="ln-field">
                <label>Họ và tên</label>
                <input type="text" placeholder="Nguyễn Văn A" value={form.name} onChange={e => set("name", e.target.value)} className={errors.name ? "err" : ""} />
                {errors.name && <span className="ln-err">{errors.name}</span>}
              </div>
            )}
            <div className="ln-field">
              <label>Email</label>
              <input type="email" placeholder="email@example.com" value={form.email} onChange={e => set("email", e.target.value)} className={errors.email ? "err" : ""} />
              {errors.email && <span className="ln-err">{errors.email}</span>}
            </div>
            <div className="ln-field">
              <div className="ln-label-row">
                <label>Mật khẩu</label>
                {tab === "login" && <button type="button" className="ln-forgot">Quên mật khẩu?</button>}
              </div>
              <div className="ln-pass-wrap">
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} className={errors.password ? "err" : ""} />
                <button type="button" className="ln-eye" onClick={() => setShowPass(s => !s)}>{showPass ? "🙈" : "👁"}</button>
              </div>
              {errors.password && <span className="ln-err">{errors.password}</span>}
            </div>
            {tab === "register" && (
              <div className="ln-field">
                <label>Xác nhận mật khẩu</label>
                <div className="ln-pass-wrap">
                  <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.confirm} onChange={e => set("confirm", e.target.value)} className={errors.confirm ? "err" : ""} />
                </div>
                {errors.confirm && <span className="ln-err">{errors.confirm}</span>}
              </div>
            )}
            <button type="submit" className={`ln-submit ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? <span className="ln-spinner" /> : (tab === "login" ? "Đăng nhập" : "Tạo tài khoản")}
            </button>
          </form>

          <div className="ln-divider"><span>hoặc</span></div>
          <div className="ln-social">
            {[{ icon: "G", label: "Google", color: "#4285F4" }, { icon: "f", label: "Facebook", color: "#1877F2" }].map(s => (
              <button key={s.label} className="ln-social-btn">
                <span className="ln-social-icon" style={{ color: s.color }}>{s.icon}</span>
                Tiếp tục với {s.label}
              </button>
            ))}
          </div>
          <p className="ln-switch">
            {tab === "login"
              ? <>Chưa có tài khoản? <button onClick={() => { setTab("register"); setErrors({}) }}>Đăng ký ngay</button></>
              : <>Đã có tài khoản? <button onClick={() => { setTab("login"); setErrors({}) }}>Đăng nhập</button></>
            }
          </p>
        </div>
      </div>
    </div>
  )
}
