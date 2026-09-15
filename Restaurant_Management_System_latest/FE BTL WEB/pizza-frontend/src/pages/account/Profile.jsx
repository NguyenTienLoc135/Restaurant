import { useMemo, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useLanguage } from "../../context/LanguageContext"
import { decodeJwtToken, isJwtTokenExpired } from "../../services/jwt"
import { getBookingStatusLabel, getOrderStatusLabel } from "../../i18n/userText"
import { normalizeUserResponse } from "../../services/responseAdapters"
import { useStaff } from "../../staff/StaffContext"
import "./Profile.css"

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

function isOrderCancelled(order) {
  return ["CANCELLED", "INCOMPLETE"].includes(order?.statusCode)
}

function canCancelOrder(order) {
  return ["PENDING", "ACCEPTED"].includes(order?.statusCode)
}

export default function Profile() {
  const auth = useAuth()
  const { staff } = useStaff()
  const { language, isEnglish } = useLanguage()
  const navigate = useNavigate()

  const text = isEnglish
    ? {
        tabs: {
          info: "Information",
          password: "Change password",
          orders: "Orders",
          bookings: "Reservations",
        },
        member: "Member",
        logout: "Log out",
        personalTitle: "Personal information",
        personalSub: "Update your name, phone number, and address",
        fullName: "Full name",
        phone: "Phone number",
        email: "Email",
        address: "Address",
        joined: "Joined date",
        save: "Save changes",
        saved: "Saved",
        passwordTitle: "Change password",
        passwordSub: "This section is currently frontend-only.",
        currentPassword: "Current password",
        newPassword: "New password",
        confirmPassword: "Confirm password",
        updatePassword: "Update password",
        passwordUpdated: "Updated",
        orderTitle: "Order history",
        orderSub: "Track your orders, delivery progress, and cancellation requests",
        bookingTitle: "Reservation history",
        bookingSub: "Review your reservation history",
        orderTable: ["Order ID", "Date", "Items", "Total", "Status", "Action"],
        bookingTable: ["Booking ID", "Date", "Time", "Guests", "Status"],
        noOrders: "No orders yet",
        noBookings: "No reservations yet",
        note: "Note",
        driver: "Driver",
        cancelOrder: "Cancel order",
        orderCancelled: "Order cancelled",
        cannotCancel: "Cannot cancel",
        cancelTitle: orderId => `Cancel ${orderId}`,
        cancelSub: "Choose a reason for cancelling the order. You can add a more specific note if needed.",
        close: "Close",
        otherReason: "Other reason",
        submitCancel: "Confirm cancellation",
        submitting: "Submitting...",
        cancelSuccess: "Your cancellation request has been sent.",
        needCancelReason: "Please enter a cancellation reason",
        invalidCancelOrder: "Unable to identify the order to cancel",
        show: "Show",
        hide: "Hide",
        placeholders: {
          current: "........",
          next: "Minimum 6 characters",
          confirm: "Re-enter new password",
          otherReason: "Enter another reason",
        },
        errors: {
          updateInfo: "Unable to update information",
          currentPassword: "Please enter your current password",
          shortPassword: "At least 6 characters",
          passwordMismatch: "Passwords do not match",
          cancelOrder: "Unable to cancel order",
        },
        cancelReasons: [
          { value: "Change payment method", label: "Change payment method" },
          { value: "Change dishes", label: "Change dishes" },
          { value: "Order is taking too long", label: "Order is taking too long" },
          { value: "OTHERS", label: "Other" },
        ],
        guests: "guests",
      }
    : {
        tabs: {
          info: "Thông tin",
          password: "Đổi mật khẩu",
          orders: "Đơn hàng",
          bookings: "Đặt bàn",
        },
        member: "Thành viên",
        logout: "Đăng xuất",
        personalTitle: "Thông tin cá nhân",
        personalSub: "Cập nhật họ tên, số điện thoại và địa chỉ của bạn",
        fullName: "Họ và tên",
        phone: "Số điện thoại",
        email: "Email",
        address: "Địa chỉ",
        joined: "Ngày tham gia",
        save: "Lưu thay đổi",
        saved: "Đã lưu",
        passwordTitle: "Đổi mật khẩu",
        passwordSub: "Phần này hiện vẫn đang ở giao diện mô phỏng.",
        currentPassword: "Mật khẩu hiện tại",
        newPassword: "Mật khẩu mới",
        confirmPassword: "Xác nhận mật khẩu",
        updatePassword: "Cập nhật mật khẩu",
        passwordUpdated: "Đã đổi",
        orderTitle: "Lịch sử đơn hàng",
        orderSub: "Theo dõi đơn hàng, trạng thái giao và huỷ đơn có kèm lý do",
        bookingTitle: "Lịch sử đặt bàn",
        bookingSub: "Xem lại lịch sử đặt bàn của bạn",
        orderTable: ["Mã đơn", "Ngày", "Món", "Tổng", "Trạng thái", "Thao tác"],
        bookingTable: ["Mã đặt bàn", "Ngày", "Giờ", "Số khách", "Trạng thái"],
        noOrders: "Chưa có đơn hàng nào",
        noBookings: "Chưa có đặt bàn nào",
        note: "Ghi chú",
        driver: "Shipper",
        cancelOrder: "Huỷ đơn",
        orderCancelled: "Đơn đã huỷ",
        cannotCancel: "Không thể huỷ",
        cancelTitle: orderId => `Huỷ đơn ${orderId}`,
        cancelSub: "Chọn lý do huỷ đơn. Nếu cần, bạn có thể ghi thêm mô tả cụ thể.",
        close: "Đóng",
        otherReason: "Lý do khác",
        submitCancel: "Xác nhận huỷ đơn",
        submitting: "Đang gửi...",
        cancelSuccess: "Đã gửi yêu cầu huỷ đơn hàng",
        needCancelReason: "Vui lòng nhập lý do huỷ đơn",
        invalidCancelOrder: "Không xác định được đơn hàng cần huỷ",
        show: "Show",
        hide: "Hide",
        placeholders: {
          current: "........",
          next: "Tối thiểu 6 ký tự",
          confirm: "Nhập lại mật khẩu mới",
          otherReason: "Nhập lý do khác",
        },
        errors: {
          updateInfo: "Không thể cập nhật thông tin",
          currentPassword: "Nhập mật khẩu hiện tại",
          shortPassword: "Tối thiểu 6 ký tự",
          passwordMismatch: "Mật khẩu không khớp",
          cancelOrder: "Không thể huỷ đơn hàng",
        },
        cancelReasons: [
          { value: "Đổi phương thức thanh toán", label: "Đổi phương thức thanh toán" },
          { value: "Đổi món", label: "Đổi món" },
          { value: "Đơn hàng quá lâu chưa được làm", label: "Đơn hàng quá lâu chưa được làm" },
          { value: "OTHERS", label: "Khác" },
        ],
        guests: "người",
      }

  const tabs = useMemo(() => ([
    { key: "info", icon: "🗿", label: text.tabs.info },
    { key: "password", icon: "🔒", label: text.tabs.password },
    { key: "orders", icon: "📦", label: text.tabs.orders },
    { key: "bookings", icon: "🧾", label: text.tabs.bookings },
  ]), [text.tabs])

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
  const [cancelReason, setCancelReason] = useState(text.cancelReasons[0].value)
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

  function getOrderDisplayStatus(order) {
    return getOrderStatusLabel(order?.statusCode || order?.status, language)
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
      setInfoError(result.message || text.errors.updateInfo)
      return
    }

    setInfoSaved(true)
    setTimeout(() => setInfoSaved(false), 2000)
  }

  function savePw(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!pw.current) nextErrors.current = text.errors.currentPassword
    if (!pw.next || pw.next.length < 6) nextErrors.next = text.errors.shortPassword
    if (pw.next !== pw.confirm) nextErrors.confirm = text.errors.passwordMismatch
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
    setCancelReason(text.cancelReasons[0].value)
    setCancelOtherReason("")
    setCancelError("")
    setCancelSuccess("")
  }

  function closeCancelForm() {
    setCancelTarget(null)
    setCancelReason(text.cancelReasons[0].value)
    setCancelOtherReason("")
    setCancelError("")
  }

  async function submitOrderCancel(event) {
    event.preventDefault()
    if (!cancelTarget) return

    const reason = cancelReason === "OTHERS" ? cancelOtherReason.trim() : cancelReason
    if (!reason) {
      setCancelError(text.needCancelReason)
      return
    }

    const numericId = Number(String(cancelTarget.id).replace("#4P", ""))
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setCancelError(text.invalidCancelOrder)
      return
    }

    setCancelSubmitting(true)
    setCancelError("")
    const result = await auth.cancelOrder(numericId, reason)
    setCancelSubmitting(false)

    if (!result.ok) {
      setCancelError(result.message || text.errors.cancelOrder)
      return
    }

    setCancelSuccess(text.cancelSuccess)
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
            <span className="pf-member-badge">{text.member}</span>
          </div>
        </div>

        <nav className="pf-nav">
          {tabs.map(tab => (
            <button key={tab.key} className={`pf-nav-item ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
              <span className="pf-nav-icon">{tab.icon}</span>
              {tab.label}
              <span className="pf-nav-arrow">-</span>
            </button>
          ))}
        </nav>

        <button className="pf-logout" onClick={handleLogout}>
          <span>❌</span> {text.logout}
        </button>
      </aside>

      <main className="pf-main">
        {activeTab === "info" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">{text.personalTitle}</h2>
              <p className="pf-section-sub">{text.personalSub}</p>
            </div>
            <form className="pf-form" onSubmit={saveInfo}>
              <div className="pf-field-row">
                <div className="pf-field">
                  <label>{text.fullName}</label>
                  <input value={info.name} onChange={event => setInfo(current => ({ ...current, name: event.target.value }))} />
                </div>
                <div className="pf-field">
                  <label>{text.phone}</label>
                  <input value={info.phone} onChange={event => setInfo(current => ({ ...current, phone: event.target.value }))} />
                </div>
              </div>
              <div className="pf-field">
                <label>{text.email}</label>
                <input type="email" value={info.email} disabled className="pf-disabled" />
              </div>
              <div className="pf-field">
                <label>{text.address}</label>
                <input value={info.address} onChange={event => setInfo(current => ({ ...current, address: event.target.value }))} />
              </div>
              <div className="pf-field">
                <label>{text.joined}</label>
                <input value={resolvedUser.joined || "-"} disabled className="pf-disabled" />
              </div>
              {infoError && <span className="pf-err">{infoError}</span>}
              <div className="pf-form-footer">
                <button type="submit" className={`pf-save-btn ${infoSaved ? "saved" : ""}`}>
                  {infoSaved ? text.saved : text.save}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "password" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">{text.passwordTitle}</h2>
              <p className="pf-section-sub">{text.passwordSub}</p>
            </div>
            <form className="pf-form" onSubmit={savePw}>
              {[
                { key: "current", label: text.currentPassword, placeholder: text.placeholders.current },
                { key: "next", label: text.newPassword, placeholder: text.placeholders.next },
                { key: "confirm", label: text.confirmPassword, placeholder: text.placeholders.confirm },
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
                        {showPw ? text.hide : text.show}
                      </button>
                    )}
                  </div>
                  {pwErr[field.key] && <span className="pf-err">{pwErr[field.key]}</span>}
                </div>
              ))}
              <div className="pf-form-footer">
                <button type="submit" className={`pf-save-btn ${pwSaved ? "saved" : ""}`}>
                  {pwSaved ? text.passwordUpdated : text.updatePassword}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">{text.orderTitle}</h2>
              <p className="pf-section-sub">{text.orderSub}</p>
            </div>
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr>
                    {text.orderTable.map(label => <th key={label}>{label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {auth.orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontWeight: 300 }}>
                        {text.noOrders}
                      </td>
                    </tr>
                  ) : (
                    auth.orders.map(order => (
                      <tr key={order.id}>
                        <td className="pf-td-id">{order.id}</td>
                        <td>{order.date}</td>
                        <td className="pf-td-items">
                          {order.items}
                          {order.notes ? <p className="pf-order-note">{text.note}: {order.notes}</p> : null}
                          {order.driverName ? (
                            <p className="pf-order-note">
                              {text.driver}: {order.driverName}
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
                              {text.cancelOrder}
                            </button>
                          ) : (
                            <span className="pf-order-meta">
                              {isOrderCancelled(order) ? text.orderCancelled : text.cannotCancel}
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
                    <h3>{text.cancelTitle(cancelTarget.id)}</h3>
                    <p>{text.cancelSub}</p>
                  </div>
                  <button type="button" className="pf-inline-btn ghost" onClick={closeCancelForm}>
                    {text.close}
                  </button>
                </div>
                <div className="pf-cancel-options">
                  {text.cancelReasons.map(option => (
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
                    <label>{text.otherReason}</label>
                    <input value={cancelOtherReason} onChange={event => setCancelOtherReason(event.target.value)} placeholder={text.placeholders.otherReason} />
                  </div>
                )}
                {cancelError && <span className="pf-err">{cancelError}</span>}
                <div className="pf-form-footer">
                  <button type="submit" className="pf-save-btn" disabled={cancelSubmitting}>
                    {cancelSubmitting ? text.submitting : text.submitCancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">{text.bookingTitle}</h2>
              <p className="pf-section-sub">{text.bookingSub}</p>
            </div>
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr>
                    {text.bookingTable.map(label => <th key={label}>{label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {auth.bookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontWeight: 300 }}>
                        {text.noBookings}
                      </td>
                    </tr>
                  ) : (
                    auth.bookings.map(booking => (
                      <tr key={booking.id}>
                        <td className="pf-td-id">{booking.id}</td>
                        <td>{booking.date}</td>
                        <td>{booking.time}</td>
                        <td>{booking.guests} {text.guests}</td>
                        <td>
                          <span className={`pf-status ${booking.statusCode === "CANCELLED" ? "cancelled" : "done"}`}>
                            {getBookingStatusLabel(booking.statusCode || booking.status, language)}
                          </span>
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

