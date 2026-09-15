import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useLanguage } from "../../context/LanguageContext"
import { isJwtTokenExpired } from "../../services/jwt"
import { useStaff } from "../../staff/StaffContext"
import "./Login.css"

export default function Login() {
  const navigate = useNavigate()
  const { user, loginWithCredentials, registerUser, logout } = useAuth()
  const { staff, staffLogout, acceptStaffSession } = useStaff()
  const { isEnglish } = useLanguage()

  const text = isEnglish
    ? {
        portalTitle: "Access portal",
        portalSubtitle: "to our culinary world",
        portalDesc: "Log in to explore the menu, place orders, reserve a table, and enjoy a more personalized experience with exclusive member perks.",
        badges: [
          "Log in to browse menu, delivery, and reservations",
          "Order faster with your saved account",
          "Member-only offers and a smoother experience",
        ],
        back: "← Back",
        loginTab: "Log in",
        registerTab: "Sign up",
        loginHeading: "Log in",
        loginHeadingEm: "to your account",
        registerHeading: "Create a new account",
        registerHeadingEm: "for a better experience",
        name: "Full name",
        username: "Username",
        email: "Email",
        phone: "Phone number",
        address: "Address",
        gender: "Gender",
        male: "Male",
        female: "Female",
        password: "Password",
        forgot: "Forgot password",
        confirmPassword: "Confirm password",
        createAccount: "Create account",
        roleHint: "Staff and driver sign-in is synced with backend roles.",
        alreadyHave: "Already have an account?",
        noAccount: "No account yet?",
        signIn: "Log in",
        signUp: "Sign up",
        show: "Show",
        hide: "Hide",
        errors: {
          name: "Please enter your full name",
          username: "Please enter a username",
          phone: "Please enter your phone number",
          address: "Please enter your address",
          gender: "Please choose your gender",
          password: "Password must be at least 6 characters",
          confirm: "Passwords do not match",
          identifier: "Please enter your username",
          loginPassword: "Please enter your password",
          createAccount: "Unable to create account",
          invalid: "Invalid account credentials.",
        },
      }
    : {
        portalTitle: "Cổng đăng nhập",
        portalSubtitle: "vào thế giới ẩm thực của chúng tôi",
        portalDesc: "Đăng nhập để khám phá menu đa dạng, đặt hàng nhanh chóng, đặt bàn thuận tiện và tận hưởng trải nghiệm cá nhân hóa cùng các ưu đãi dành riêng cho thành viên.",
        badges: [
          "Đăng nhập để xem menu, đặt hàng, đặt bàn",
          "Đặt món nhanh hơn với tài khoản đã đăng ký",
          "Ưu đãi hấp dẫn chỉ dành cho thành viên",
        ],
        back: "← Quay lại",
        loginTab: "Đăng nhập",
        registerTab: "Đăng ký",
        loginHeading: "Đăng nhập",
        loginHeadingEm: "vào tài khoản của bạn",
        registerHeading: "Tạo tài khoản mới",
        registerHeadingEm: "để trải nghiệm dịch vụ tốt hơn",
        name: "Họ và tên",
        username: "Tên đăng nhập",
        email: "Email",
        phone: "Số điện thoại",
        address: "Địa chỉ",
        gender: "Giới tính",
        male: "Nam",
        female: "Nữ",
        password: "Mật khẩu",
        forgot: "Quên mật khẩu",
        confirmPassword: "Xác nhận mật khẩu",
        createAccount: "Tạo tài khoản",
        roleHint: "Đăng nhập staff/driver hiện được đồng bộ theo role backend.",
        alreadyHave: "Đã có tài khoản?",
        noAccount: "Chưa có tài khoản?",
        signIn: "Đăng nhập",
        signUp: "Đăng ký mới",
        show: "Show",
        hide: "Hide",
        errors: {
          name: "Vui lòng nhập họ tên",
          username: "Vui lòng nhập tên đăng nhập",
          phone: "Vui lòng nhập số điện thoại",
          address: "Vui lòng nhập địa chỉ",
          gender: "Vui lòng chọn giới tính",
          password: "Mật khẩu tối thiểu 6 ký tự",
          confirm: "Mật khẩu không khớp",
          identifier: "Nhập tên đăng nhập",
          loginPassword: "Nhập mật khẩu",
          createAccount: "Không thể tạo tài khoản",
          invalid: "Tài khoản không hợp lệ.",
        },
      }

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
    return <Navigate to="/" replace />
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
      if (!form.name.trim()) nextErrors.name = text.errors.name
      if (!form.username.trim()) nextErrors.username = text.errors.username
      if (!form.phone.trim()) nextErrors.phone = text.errors.phone
      if (!form.address.trim()) nextErrors.address = text.errors.address
      if (!form.gender) nextErrors.gender = text.errors.gender
      if (!form.password || form.password.length < 6) nextErrors.password = text.errors.password
      if (form.password !== form.confirm) nextErrors.confirm = text.errors.confirm
    } else {
      if (!form.identifier.trim()) nextErrors.identifier = text.errors.identifier
      if (!form.password) nextErrors.password = text.errors.loginPassword
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function redirectTo(path) {
    navigate(path, { replace: true })
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
        setErrors(prev => ({ ...prev, submit: result.message || text.errors.createAccount }))
        return
      }
      redirectTo("/profile")
      return
    }

    staffLogout()
    const loginResult = await loginWithCredentials(form.identifier, form.password)
    setLoading(false)
    if (!loginResult.ok) {
      setErrors(prev => ({
        ...prev,
        submit: loginResult.message || text.errors.invalid,
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

    redirectTo("/")
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
              {text.portalTitle}
              <br />
              <em>{text.portalSubtitle}</em>
            </h2>
            <p className="ln-panel-desc">{text.portalDesc}</p>
          </div>
          <div className="ln-panel-badges">
            {text.badges.map(badge => (
              <span key={badge} className="ln-badge">{badge}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="ln-form-side">
        <div className="ln-form-wrap">
          <button className="ln-back" onClick={() => navigate(-1)}>
            {text.back}
          </button>

          <div className="ln-tabs">
            <button className={`ln-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>
              {text.loginTab}
            </button>
            <button className={`ln-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>
              {text.registerTab}
            </button>
          </div>

          <h1 className="ln-heading">
            {mode === "login" ? (
              <>
                {text.loginHeading}
                <br />
                <em>{text.loginHeadingEm}</em>
              </>
            ) : (
              <>
                {text.registerHeading}
                <br />
                <em>{text.registerHeadingEm}</em>
              </>
            )}
          </h1>

          <form className="ln-form" onSubmit={handleSubmit} noValidate>
            {mode === "register" ? (
              <>
                <div className="ln-field">
                  <label>{text.name}</label>
                  <input type="text" placeholder={isEnglish ? "Nguyen Van A" : "Nguyễn Văn A"} value={form.name} onChange={event => setField("name", event.target.value)} className={errors.name ? "err" : ""} />
                  {errors.name && <span className="ln-err">{errors.name}</span>}
                </div>
                <div className="ln-field">
                  <label>{text.username}</label>
                  <input type="text" placeholder="nguyenvana" value={form.username} onChange={event => setField("username", event.target.value)} className={errors.username ? "err" : ""} />
                  {errors.username && <span className="ln-err">{errors.username}</span>}
                </div>
                <div className="ln-field">
                  <label>{text.email}</label>
                  <input type="email" placeholder="email@example.com" value={form.email} onChange={event => setField("email", event.target.value)} className={errors.email ? "err" : ""} />
                  {errors.email && <span className="ln-err">{errors.email}</span>}
                </div>
                <div className="ln-field">
                  <label>{text.phone}</label>
                  <input type="text" placeholder="0123456789" value={form.phone} onChange={event => setField("phone", event.target.value)} className={errors.phone ? "err" : ""} />
                  {errors.phone && <span className="ln-err">{errors.phone}</span>}
                </div>
                <div className="ln-field">
                  <label>{text.address}</label>
                  <input type="text" placeholder={isEnglish ? "House number, street, district..." : "Số nhà, đường, quận..."} value={form.address} onChange={event => setField("address", event.target.value)} className={errors.address ? "err" : ""} />
                  {errors.address && <span className="ln-err">{errors.address}</span>}
                </div>
                <div className="ln-field">
                  <label>{text.gender}</label>
                  <select value={form.gender} onChange={event => setField("gender", event.target.value)} className={errors.gender ? "err" : ""}>
                    <option value="MALE">{text.male}</option>
                    <option value="FEMALE">{text.female}</option>
                  </select>
                  {errors.gender && <span className="ln-err">{errors.gender}</span>}
                </div>
              </>
            ) : (
              <div className="ln-field">
                <label>{text.username}</label>
                <input type="text" placeholder={isEnglish ? "Enter username" : "Nhập tên đăng nhập"} value={form.identifier} onChange={event => setField("identifier", event.target.value)} className={errors.identifier ? "err" : ""} />
                {errors.identifier && <span className="ln-err">{errors.identifier}</span>}
              </div>
            )}

            <div className="ln-field">
              <div className="ln-label-row">
                <label>{text.password}</label>
                {mode === "login" && (
                  <button type="button" className="ln-forgot">
                    {text.forgot}
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
                  {showPass ? text.hide : text.show}
                </button>
              </div>
              {errors.password && <span className="ln-err">{errors.password}</span>}
            </div>

            {mode === "register" && (
              <div className="ln-field">
                <label>{text.confirmPassword}</label>
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
              {loading ? <span className="ln-spinner" /> : mode === "login" ? text.loginTab : text.createAccount}
            </button>
          </form>

          <div className="ln-switch">
            <span>{text.roleHint}</span>
          </div>

          {mode === "register" ? (
            <p className="ln-switch">
              {text.alreadyHave} <button onClick={() => switchMode("login")}>{text.signIn}</button>
            </p>
          ) : (
            <p className="ln-switch">
              {text.noAccount} <button onClick={() => switchMode("register")}>{text.signUp}</button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

