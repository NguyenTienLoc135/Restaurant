import { useEffect, useState } from "react"
import { useStaff } from "./StaffContext"

export default function StaffProfileManager() {
  const { staff, updateStaffProfile } = useStaff()
  const [info, setInfo] = useState({
    name: staff?.name || "",
    phone: staff?.phone || "",
    address: staff?.address || "",
  })
  const [infoState, setInfoState] = useState({ type: "", message: "" })

  useEffect(() => {
    setInfo({
      name: staff?.name || "",
      phone: staff?.phone || "",
      address: staff?.address || "",
    })
  }, [staff])

  async function handleInfoSubmit(event) {
    event.preventDefault()

    if (!info.name.trim()) {
      setInfoState({ type: "error", message: "Vui lòng nhập họ tên." })
      return
    }

    const result = await updateStaffProfile(info)
    setInfoState({
      type: result.ok ? "success" : "error",
      message: result.ok ? "Đã cập nhật thông tin tài khoản." : result.message,
    })
  }

  return (
    <div className="sm-page">
      <div className="sm-header sm-header-stack">
        <div>
          <h1 className="sm-title">Tài khoản nhân viên</h1>
          <p className="sm-sub">Màn này đã được chỉnh theo đúng dữ liệu và endpoint hồ sơ mà backend hiện đang hỗ trợ.</p>
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
              <span>Địa chỉ</span>
              <strong>{staff?.address || "-"}</strong>
            </div>
          </div>
        </section>

        <section className="ssp-card">
          <div className="ssp-section-head">
            <h2>Thông tin cá nhân</h2>
            <p>Backend hiện hỗ trợ cập nhật họ tên, số điện thoại và địa chỉ.</p>
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
                <input type="email" value={staff?.email || ""} readOnly />
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

            <div className="sm-field">
              <label>Địa chỉ</label>
              <input
                value={info.address}
                onChange={event => {
                  setInfo(current => ({ ...current, address: event.target.value }))
                  setInfoState({ type: "", message: "" })
                }}
                placeholder="123 Hai Bà Trưng, Hà Nội"
              />
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
            <p>Backend hiện chưa có endpoint đổi mật khẩu cho staff/driver, nên FE không hiển thị form đổi mật khẩu nữa để tránh lệch hành vi thực tế.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
