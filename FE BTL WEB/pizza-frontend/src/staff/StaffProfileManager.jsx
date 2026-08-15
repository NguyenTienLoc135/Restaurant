import { useEffect, useState } from "react"
import { useStaff } from "./StaffContext"

export default function StaffProfileManager() {
  const { staff, updateStaffProfile, changeStaffPassword } = useStaff()
  const [info, setInfo] = useState({
    name: staff?.name || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
  })
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [infoState, setInfoState] = useState({ type: "", message: "" })
  const [passwordState, setPasswordState] = useState({ type: "", message: "" })

  useEffect(() => {
    setInfo({
      name: staff?.name || "",
      email: staff?.email || "",
      phone: staff?.phone || "",
    })
  }, [staff])

  function handleInfoSubmit(event) {
    event.preventDefault()

    if (!info.name.trim()) {
      setInfoState({ type: "error", message: "Vui lòng nhập họ tên." })
      return
    }

    if (!/\S+@\S+\.\S+/.test(info.email)) {
      setInfoState({ type: "error", message: "Email không hợp lệ." })
      return
    }

    const result = updateStaffProfile(info)
    setInfoState({
      type: result.ok ? "success" : "error",
      message: result.ok ? "Đã cập nhật thông tin nhân viên." : result.message,
    })
  }

  function handlePasswordSubmit(event) {
    event.preventDefault()

    if (!password.current) {
      setPasswordState({ type: "error", message: "Nhập mật khẩu hiện tại." })
      return
    }

    if (!password.next || password.next.length < 6) {
      setPasswordState({ type: "error", message: "Mật khẩu mới tối thiểu 6 ký tự." })
      return
    }

    if (password.next !== password.confirm) {
      setPasswordState({ type: "error", message: "Xác nhận mật khẩu chưa khớp." })
      return
    }

    const result = changeStaffPassword(password.current, password.next)
    setPasswordState({
      type: result.ok ? "success" : "error",
      message: result.ok ? "Đã đổi mật khẩu thành công." : result.message,
    })

    if (result.ok) {
      setPassword({ current: "", next: "", confirm: "" })
    }
  }

  return (
    <div className="sm-page">
      <div className="sm-header sm-header-stack">
        <div>
          <h1 className="sm-title">Tài khoản nhân viên</h1>
          <p className="sm-sub">Cập nhật thông tin cá nhân và đổi mật khẩu ngay trong khu staff.</p>
        </div>
        <div className="ssp-badge-wrap">
          <span className="ssp-role-badge">{staff?.role || "staff"}</span>
        </div>
      </div>

      <div className="ssp-grid">
        <section className="ssp-card">
          <div className="ssp-card-head">
            <div className="ssp-avatar">{staff?.avatar || staff?.name?.charAt(0) || "S"}</div>
            <div>
              <p className="ssp-name">{staff?.name}</p>
              <p className="ssp-email">{staff?.email}</p>
            </div>
          </div>

          <div className="ssp-meta">
            <div className="ssp-meta-row">
              <span>Tên đăng nhập</span>
              <strong>{staff?.username || "-"}</strong>
            </div>
            <div className="ssp-meta-row">
              <span>Số điện thoại</span>
              <strong>{staff?.phone || "-"}</strong>
            </div>
            <div className="ssp-meta-row">
              <span>Ngày tham gia</span>
              <strong>{staff?.joined || "-"}</strong>
            </div>
          </div>
        </section>

        <section className="ssp-card">
          <div className="ssp-section-head">
            <h2>Thông tin cá nhân</h2>
            <p>Chỉnh sửa họ tên, email và số điện thoại.</p>
          </div>
          <form className="ssp-form" onSubmit={handleInfoSubmit}>
            <div className="sm-field">
              <label>Họ và tên</label>
              <input
                value={info.name}
                onChange={event => {
                  setInfo(current => ({ ...current, name: event.target.value }))
                  setInfoState({ type: "", message: "" })
                }}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="sm-field-row">
              <div className="sm-field">
                <label>Email</label>
                <input
                  type="email"
                  value={info.email}
                  onChange={event => {
                    setInfo(current => ({ ...current, email: event.target.value }))
                    setInfoState({ type: "", message: "" })
                  }}
                  placeholder="staff@example.com"
                />
              </div>
              <div className="sm-field">
                <label>Số điện thoại</label>
                <input
                  value={info.phone}
                  onChange={event => {
                    setInfo(current => ({ ...current, phone: event.target.value }))
                    setInfoState({ type: "", message: "" })
                  }}
                  placeholder="0901 234 567"
                />
              </div>
            </div>
            {infoState.message && (
              <p className={`ssp-message ${infoState.type}`}>{infoState.message}</p>
            )}
            <div className="ssp-actions">
              <button type="submit" className="sm-btn">Lưu thông tin</button>
            </div>
          </form>
        </section>

        <section className="ssp-card ssp-card-wide">
          <div className="ssp-section-head">
            <h2>Đổi mật khẩu</h2>
            <p>Mật khẩu mới sẽ được lưu lại cho lần đăng nhập sau.</p>
          </div>
          <form className="ssp-form" onSubmit={handlePasswordSubmit}>
            <div className="sm-field-row">
              <div className="sm-field">
                <label>Mật khẩu hiện tại</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password.current}
                  onChange={event => {
                    setPassword(current => ({ ...current, current: event.target.value }))
                    setPasswordState({ type: "", message: "" })
                  }}
                  placeholder="••••••••"
                />
              </div>
              <div className="sm-field">
                <label>Mật khẩu mới</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password.next}
                  onChange={event => {
                    setPassword(current => ({ ...current, next: event.target.value }))
                    setPasswordState({ type: "", message: "" })
                  }}
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
            </div>
            <div className="sm-field">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password.confirm}
                onChange={event => {
                  setPassword(current => ({ ...current, confirm: event.target.value }))
                  setPasswordState({ type: "", message: "" })
                }}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <label className="ssp-check">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={event => setShowPassword(event.target.checked)}
              />
              <span>Hiển thị mật khẩu</span>
            </label>
            {passwordState.message && (
              <p className={`ssp-message ${passwordState.type}`}>{passwordState.message}</p>
            )}
            <div className="ssp-actions">
              <button type="submit" className="sm-btn">Cập nhật mật khẩu</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
