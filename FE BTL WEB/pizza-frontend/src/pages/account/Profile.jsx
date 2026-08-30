import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { decodeJwtToken, isJwtTokenExpired } from "../../services/jwt"
import { normalizeUserResponse } from "../../services/responseAdapters"
import { useStaff } from "../../staff/StaffContext"
import "./Profile.css"

const TABS = [
  { key: "info", icon: "🗿", label: "Thông tin" },
  { key: "password", icon: "🔒", label: "Đổi mật khẩu" },
  { key: "orders", icon: "📦", label: "Đơn hàng" },
  { key: "bookings", icon: "🧾", label: "Đặt bàn" },
]

const CANCEL_REASONS = [
  { value: "Đổi phương thức thanh toán", label: "Đổi phương thức thanh toán" },
  { value: "Đổi món", label: "Đổi món" },
  { value: "Đơn hàng quá lâu chưa được làm", label: "Đơn hàng quá lâu chưa được làm" },
  { value: "OTHERS", label: "Khác" },
]

function getOrderDisplayStatus(order) {
  if (order?.statusCode === "INCOMPLETE") return "Đã hủy"
  return order?.status || "Chờ xác nhận"
}

function isOrderCancelled(order) {
  return ["CANCELLED", "INCOMPLETE"].includes(order?.statusCode)
}

function canCancelOrder(order) {
  return ["PENDING", "ACCEPTED"].includes(order?.statusCode)
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem("hs_user")
    return raw ? normalizeUserResponse(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

function buildUserFromToken(token) {
  const payload = decodeJwtToken(token)
  const username = String(payload?.sub || "").trim()
  if (!username) return null

  return normalizeUserResponse({
    id: payload?.userId || payload?.id || username,
    username,
    fullname: username,
    email: username.includes("@") ? username : "",
    role: payload?.role || payload?.userRole || "CUSTOMER",
  })
}

export default function Profile() {
  const auth = useAuth()
  const { staff } = useStaff()
  const navigate = useNavigate()

  const storedToken = localStorage.getItem("hs_user_token")
  const storedUser = readStoredUser()
  const resolvedToken = auth.token || storedToken
  const resolvedUser = auth.user || storedUser || buildUserFromToken(resolvedToken)

  const [activeTab, setActiveTab] = useState("info")
  const [info, setInfo] = useState({
    name: resolvedUser?.name || "",
    email: resolvedUser?.email || "",
    phone: resolvedUser?.phone || "",
    address: resolvedUser?.address || "",
  })
  const [infoSaved, setInfoSaved] = useState(false)
  const [infoError, setInfoError] = useState("")
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" })
  const [pwErr, setPwErr] = useState({})
  const [pwSaved, setPwSaved] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0].value)
  const [cancelOtherReason, setCancelOtherReason] = useState("")
  const [cancelError, setCancelError] = useState("")
  const [cancelSuccess, setCancelSuccess] = useState("")
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  if (staff) {
    return <Navigate to="/staff/dashboard" replace />
  }

  if (resolvedToken && !isJwtTokenExpired(resolvedToken) && !resolvedUser) {
    return null
  }

  if (!resolvedUser) {
    return <Navigate to="/login" replace />
  }

  async function saveInfo(event) {
    event.preventDefault()
    setInfoError("")
    const result = await auth.updateUser({
      name: info.name,
      phone: info.phone,
      address: info.address,
    })

    if (!result.ok) {
      setInfoError(result.message || "Khong the cap nhat thong tin")
      return
    }

    setInfoSaved(true)
    setTimeout(() => setInfoSaved(false), 2000)
  }

  function savePw(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!pw.current) nextErrors.current = "Nhap mat khau hien tai"
    if (!pw.next || pw.next.length < 6) nextErrors.next = "Toi thieu 6 ky tu"
    if (pw.next !== pw.confirm) nextErrors.confirm = "Mat khau khong khop"
    setPwErr(nextErrors)
    if (Object.keys(nextErrors).length) return
    setPwSaved(true)
    setPw({ current: "", next: "", confirm: "" })
    setTimeout(() => setPwSaved(false), 2000)
  }

  function handleLogout() {
    auth.logout()
    navigate("/")
  }

  function openCancelForm(order) {
    setCancelTarget(order)
    setCancelReason(CANCEL_REASONS[0].value)
    setCancelOtherReason("")
    setCancelError("")
    setCancelSuccess("")
  }

  function closeCancelForm() {
    setCancelTarget(null)
    setCancelReason(CANCEL_REASONS[0].value)
    setCancelOtherReason("")
    setCancelError("")
  }

  async function submitOrderCancel(event) {
    event.preventDefault()
    if (!cancelTarget) return

    const reason = cancelReason === "OTHERS" ? cancelOtherReason.trim() : cancelReason
    if (!reason) {
      setCancelError("Vui long nhap ly do huy don")
      return
    }

    const numericId = Number(String(cancelTarget.id).replace("#4P", ""))
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setCancelError("Khong xac dinh duoc don hang can huy")
      return
    }

    setCancelSubmitting(true)
    setCancelError("")
    const result = await auth.cancelOrder(numericId, reason)
    setCancelSubmitting(false)

    if (!result.ok) {
      setCancelError(result.message || "Khong the huy don hang")
      return
    }

    setCancelSuccess("Da gui yeu cau huy don hang")
    closeCancelForm()
  }

  return (
    <div className="pf-page">
      <aside className="pf-sidebar">
        <div className="pf-avatar-wrap">
          <div className="pf-avatar">{resolvedUser.avatar || resolvedUser.name?.charAt(0)}</div>
          <div>
            <p className="pf-name">{resolvedUser.name}</p>
            <p className="pf-email">{resolvedUser.email}</p>
            <span className="pf-member-badge">Thành viên</span>
          </div>
        </div>

        <nav className="pf-nav">
          {TABS.map(tab => (
            <button key={tab.key} className={`pf-nav-item ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
              <span className="pf-nav-icon">{tab.icon}</span>
              {tab.label}
              <span className="pf-nav-arrow">-</span>
            </button>
          ))}
        </nav>

        <button className="pf-logout" onClick={handleLogout}>
          <span>❌</span> Đăng xuất
        </button>
      </aside>

      <main className="pf-main">
        {activeTab === "info" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Thông tin cá nhân</h2>
              <p className="pf-section-sub">Cập nhật họ tên, số điện thoại và địa chỉ của bạn</p>
            </div>
            <form className="pf-form" onSubmit={saveInfo}>
              <div className="pf-field-row">
                <div className="pf-field">
                  <label>Họ và tên</label>
                  <input value={info.name} onChange={event => setInfo(current => ({ ...current, name: event.target.value }))} />
                </div>
                <div className="pf-field">
                  <label>Số điện thoại</label>
                  <input value={info.phone} onChange={event => setInfo(current => ({ ...current, phone: event.target.value }))} />
                </div>
              </div>
              <div className="pf-field">
                <label>Email</label>
                <input type="email" value={info.email} disabled className="pf-disabled" />
              </div>
              <div className="pf-field">
                <label>Địa chỉ</label>
                <input value={info.address} onChange={event => setInfo(current => ({ ...current, address: event.target.value }))} />
              </div>
              <div className="pf-field">
                <label>Ngày tham gia</label>
                <input value={resolvedUser.joined || "-"} disabled className="pf-disabled" />
              </div>
              {infoError && <span className="pf-err">{infoError}</span>}
              <div className="pf-form-footer">
                <button type="submit" className={`pf-save-btn ${infoSaved ? "saved" : ""}`}>
                  {infoSaved ? "Đã lưu" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "password" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Đổi mật khẩu</h2>
              <p className="pf-section-sub">Phan nay hien van dang o giao dien mo phong</p>
            </div>
            <form className="pf-form" onSubmit={savePw}>
              {[
                { key: "current", label: "Mật khẩu hiện tại", placeholder: "........" },
                { key: "next", label: "Mật khẩu mới", placeholder: "........" },
                { key: "confirm", label: "Xác nhận mật khẩu", placeholder: "........" },
              ].map(field => (
                <div className="pf-field" key={field.key}>
                  <label>{field.label}</label>
                  <div className="pf-pass-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder={field.placeholder}
                      value={pw[field.key]}
                      onChange={event => {
                        setPw(current => ({ ...current, [field.key]: event.target.value }))
                        setPwErr(current => ({ ...current, [field.key]: "" }))
                      }}
                      className={pwErr[field.key] ? "err" : ""}
                    />
                    {field.key === "current" && (
                      <button type="button" className="pf-eye" onClick={() => setShowPw(current => !current)}>
                        {showPw ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>
                  {pwErr[field.key] && <span className="pf-err">{pwErr[field.key]}</span>}
                </div>
              ))}
              <div className="pf-form-footer">
                <button type="submit" className={`pf-save-btn ${pwSaved ? "saved" : ""}`}>
                  {pwSaved ? "Da doi" : "Cap nhat mat khau"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Lịch sử đơn hàng</h2>
              <p className="pf-section-sub">Theo dõi đơn hàng, trạng thái giao và hủy đơn có kèm lý do</p>
            </div>
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>Ma don</th>
                    <th>Ngay</th>
                    <th>Mon</th>
                    <th>Tong</th>
                    <th>Trang thai</th>
                    <th>Thao tac</th>
                  </tr>
                </thead>
                <tbody>
                  {auth.orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontWeight: 300 }}>
                        Chua co don hang nao
                      </td>
                    </tr>
                  ) : (
                    auth.orders.map(order => (
                      <tr key={order.id}>
                        <td className="pf-td-id">{order.id}</td>
                        <td>{order.date}</td>
                        <td className="pf-td-items">
                          {order.items}
                          {order.notes ? <p className="pf-order-note">Ghi chú: {order.notes}</p> : null}
                          {order.driverName ? (
                            <p className="pf-order-note">
                              Shipper: {order.driverName}
                              {order.driverPhone ? ` - ${order.driverPhone}` : ""}
                            </p>
                          ) : null}
                        </td>
                        <td className="pf-td-total">{order.total}</td>
                        <td>
                          <span className={`pf-status ${isOrderCancelled(order) ? "cancelled" : "done"}`}>
                            {getOrderDisplayStatus(order)}
                          </span>
                        </td>
                        <td>
                          {canCancelOrder(order) ? (
                            <button className="pf-inline-btn" onClick={() => openCancelForm(order)}>
                              Huy don
                            </button>
                          ) : (
                            <span className="pf-order-meta">
                              {isOrderCancelled(order) ? "Don da huy" : "Khong the huy"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {cancelSuccess && <p className="pf-success">{cancelSuccess}</p>}
            {cancelTarget && (
              <form className="pf-cancel-box" onSubmit={submitOrderCancel}>
                <div className="pf-cancel-head">
                  <div>
                    <h3>Huỷ đơn {cancelTarget.id}</h3>
                    <p>Chọn lý do hủy đơn. Nếu cần, bạn có thể ghi thêm mô tả cụ thể.</p>
                  </div>
                  <button type="button" className="pf-inline-btn ghost" onClick={closeCancelForm}>
                    Đóng
                  </button>
                </div>
                <div className="pf-cancel-options">
                  {CANCEL_REASONS.map(option => (
                    <label key={option.value} className={`pf-cancel-option ${cancelReason === option.value ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="cancel-reason"
                        value={option.value}
                        checked={cancelReason === option.value}
                        onChange={event => setCancelReason(event.target.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {cancelReason === "OTHERS" && (
                  <div className="pf-field">
                    <label>Ly do khac</label>
                    <input value={cancelOtherReason} onChange={event => setCancelOtherReason(event.target.value)} />
                  </div>
                )}
                {cancelError && <span className="pf-err">{cancelError}</span>}
                <div className="pf-form-footer">
                  <button type="submit" className="pf-save-btn" disabled={cancelSubmitting}>
                    {cancelSubmitting ? "Dang gui..." : "Xác nhận huỷ đơn"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Lịch sử đặt bàn</h2>
              <p className="pf-section-sub">Dữ liệu hiện đang lấy từ local của FE</p>
            </div>
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>Mã đặt bàn</th>
                    <th>Ngày</th>
                    <th>Giờ</th>
                    <th>Số khách</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {auth.bookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontWeight: 300 }}>
                        Chưa có đặt bàn nào
                      </td>
                    </tr>
                  ) : (
                    auth.bookings.map(booking => (
                      <tr key={booking.id}>
                        <td className="pf-td-id">{booking.id}</td>
                        <td>{booking.date}</td>
                        <td>{booking.time}</td>
                        <td>{booking.guests} người</td>
                        <td>
                          <span className={`pf-status ${booking.status === "Đã hủy" ? "cancelled" : "done"}`}>{booking.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
