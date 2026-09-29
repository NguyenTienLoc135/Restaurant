import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { decodeJwtToken, isJwtTokenExpired } from "../../services/jwt"
import { normalizeUserResponse } from "../../services/responseAdapters"
import { useStaff } from "../../staff/StaffContext"
import "./Profile.css"

const TABS = [
  { key: "info",     icon: "🗿", label: "Thông tin" },
  { key: "password", icon: "🔒", label: "Đổi mật khẩu" },
  { key: "orders",   icon: "📦", label: "Đơn hàng" },
  { key: "bookings", icon: "🧾", label: "Đặt bàn" },
]

const GENDER_OPTIONS = [
  { value: "",       label: "Chưa cập nhật" },
  { value: "MALE",   label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
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

function toNumber(value) {
  if (value == null || value === "") return null
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""))
  return Number.isFinite(numeric) ? numeric : null
}

function formatMoney(value) {
  const numeric = toNumber(value)
  return numeric == null ? "-" : `${numeric.toLocaleString("vi-VN")}đ`
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem("hs_user")
    return raw ? normalizeUserResponse(JSON.parse(raw)) : null
  } catch { return null }
}

function buildUserFromToken(token) {
  const payload = decodeJwtToken(token)
  const username = String(payload?.sub || "").trim()
  if (!username) return null
  return normalizeUserResponse({
    id: payload?.userId || payload?.id || username,
    username,
    fullname: username,
    email: "",
  })
}

/* ── ORDER DETAIL MODAL ── */
function OrderDetailModal({ order, onClose }) {
  const hasDetails = Array.isArray(order?.details) && order.details.length > 0

  return (
    <div className="pf-modal-back" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pf-modal">
        {/* Header */}
        <div className="pf-modal-header">
          <div>
            <h3 className="pf-modal-title">Chi tiết đơn hàng</h3>
            <p className="pf-modal-sub">
              <span className="pf-modal-id">{order.id}</span>
              {" · "}
              <span className={`pf-status ${isOrderCancelled(order) ? "cancelled" : "done"}`} style={{ fontSize: 11 }}>
                {getOrderDisplayStatus(order)}
              </span>
            </p>
          </div>
          <button className="pf-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Meta info */}
        <div className="pf-modal-meta">
          {[
            ["📅", "Ngày đặt",   order.date   || "—"],
            ["📍", "Địa chỉ",    order.address || "—"],
            ["📞", "Điện thoại", order.phone   || "—"],
            ["💰", "Tổng tiền",  order.total   || "—"],
          ].map(([icon, label, value]) => (
            <div key={label} className="pf-meta-row">
              <span className="pf-meta-icon">{icon}</span>
              <div>
                <span className="pf-meta-label">{label}</span>
                <span className="pf-meta-val">{value}</span>
              </div>
            </div>
          ))}
          {order.driverName && (
            <div className="pf-meta-row">
              <span className="pf-meta-icon">🛵</span>
              <div>
                <span className="pf-meta-label">Shipper</span>
                <span className="pf-meta-val">
                  {order.driverName}{order.driverPhone ? ` · ${order.driverPhone}` : ""}
                </span>
              </div>
            </div>
          )}
          {order.notes && (
            <div className="pf-meta-row">
              <span className="pf-meta-icon">📝</span>
              <div>
                <span className="pf-meta-label">Ghi chú</span>
                <span className="pf-meta-val">{order.notes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Item list */}
        <div className="pf-modal-body">
          <p className="pf-modal-section-label">Danh sách món</p>

          {hasDetails ? (
            <div className="pf-detail-list">
              {order.details.map((item, index) => {
                const amount   = Number(item.amount || item.quantity || 1) || 1
                const price    = toNumber(item.price)
                const subtotal = price == null ? null : price * amount

                return (
                  <div key={`${order.id}-${item.name || "item"}-${index}`} className="pf-detail-card">
                    <div className="pf-detail-card-top">
                      <div className="pf-detail-card-info">
                        <h4 className="pf-detail-name">{item.name || `Món ${index + 1}`}</h4>
                        {item.description && (
                          <p className="pf-detail-desc">{item.description}</p>
                        )}
                      </div>
                      <span className="pf-detail-qty">×{amount}</span>
                    </div>
                    <div className="pf-detail-card-bottom">
                      <div className="pf-detail-price-row">
                        <span>Đơn giá</span>
                        <strong>{formatMoney(item.price)}</strong>
                      </div>
                      <div className="pf-detail-price-row pf-detail-subtotal">
                        <span>Thành tiền</span>
                        <strong>{formatMoney(subtotal)}</strong>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Total row */}
              <div className="pf-detail-total-row">
                <span>Tổng cộng</span>
                <strong>{order.total || "—"}</strong>
              </div>
            </div>
          ) : (
            <div className="pf-detail-empty">
              <span>🍽️</span>
              <p>Đơn này chưa có thông tin chi tiết món.</p>
              <small>Dữ liệu chi tiết sẽ hiện sau khi đơn được nhà hàng xác nhận.</small>
            </div>
          )}
        </div>

        <div className="pf-modal-footer">
          <button className="pf-save-btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}

/* ── MAIN PAGE ── */
export default function Profile() {
  const auth = useAuth()
  const { staff } = useStaff()
  const navigate  = useNavigate()

  const storedToken   = localStorage.getItem("hs_user_token")
  const storedUser    = readStoredUser()
  const resolvedToken = auth.token || storedToken
  const resolvedUser  = auth.user || storedUser || buildUserFromToken(resolvedToken)

  const [activeTab,      setActiveTab]      = useState("info")
  const [info,           setInfo]           = useState({
    name:    resolvedUser?.name    || "",
    email:   resolvedUser?.email   || "",
    phone:   resolvedUser?.phone   || "",
    address: resolvedUser?.address || "",
    gender:  resolvedUser?.userGender || "",
  })
  const [infoSaved,      setInfoSaved]      = useState("")
  const [infoError,      setInfoError]      = useState("")
  const [pw,             setPw]             = useState({ current: "", next: "", confirm: "" })
  const [pwErr,          setPwErr]          = useState({})
  const [pwSaved,        setPwSaved]        = useState(false)
  const [showPw,         setShowPw]         = useState(false)
  const [cancelTarget,   setCancelTarget]   = useState(null)
  const [selectedOrder,  setSelectedOrder]  = useState(null)
  const [cancelError,    setCancelError]    = useState("")
  const [cancelSuccess,  setCancelSuccess]  = useState("")
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  if (staff) return <Navigate to="/staff/dashboard" replace />
  if (resolvedToken && !isJwtTokenExpired(resolvedToken) && !resolvedUser) return null
  if (!resolvedUser) return <Navigate to="/login" replace />

  async function saveInfo(e) {
    e.preventDefault(); setInfoError("")
    const result = await auth.updateUser({ name: info.name, phone: info.phone, address: info.address, gender: info.gender })
    if (!result.ok) { setInfoError(result.message || "Không thể cập nhật thông tin"); return }
    setInfoSaved(result.message || ""); setTimeout(() => setInfoSaved(""), 2500)
  }

  function savePw(e) {
    e.preventDefault()
    const errs = {}
    if (!pw.current) errs.current = "Nhập mật khẩu hiện tại"
    if (!pw.next || pw.next.length < 6) errs.next = "Tối thiểu 6 ký tự"
    if (pw.next !== pw.confirm) errs.confirm = "Mật khẩu không khớp"
    setPwErr(errs); if (Object.keys(errs).length) return
    setPwSaved(true); setPw({ current: "", next: "", confirm: "" }); setTimeout(() => setPwSaved(false), 2000)
  }

  function handleLogout() { auth.logout(); navigate("/") }

  function openCancelForm(order)  { setCancelTarget(order); setCancelError(""); setCancelSuccess("") }
  function closeCancelForm()      { setCancelTarget(null); setCancelError("") }
  function openOrderDetails(order){ setSelectedOrder(order) }
  function closeOrderDetails()    { setSelectedOrder(null) }

  async function submitOrderCancel(e) {
    e.preventDefault(); if (!cancelTarget) return
    const numericId = Number(String(cancelTarget.id).replace("#4P", ""))
    if (!Number.isInteger(numericId) || numericId <= 0) { setCancelError("Không xác định được đơn hàng cần hủy"); return }
    setCancelSubmitting(true); setCancelError("")
    const result = await auth.cancelOrder(numericId)
    setCancelSubmitting(false)
    if (!result.ok) { setCancelError(result.message || "Không thể hủy đơn hàng"); return }
    setCancelSuccess(result.message || ""); closeCancelForm()
  }

  return (
    <div className="pf-page">
      {/* SIDEBAR */}
      <aside className="pf-sidebar">
        <div className="pf-avatar-wrap">
          <div className="pf-avatar">{resolvedUser.avatar || resolvedUser.name?.charAt(0)}</div>
          <div>
            <p className="pf-name">{resolvedUser.name}</p>
            <p className="pf-email">{resolvedUser.email}</p>
            <span className="pf-member-badge">✦ Thành viên</span>
          </div>
        </div>
        <nav className="pf-nav">
          {TABS.map(t => (
            <button key={t.key} className={`pf-nav-item ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
              <span className="pf-nav-icon">{t.icon}</span>{t.label}
              <span className="pf-nav-arrow">→</span>
            </button>
          ))}
        </nav>
        <button className="pf-logout" onClick={handleLogout}><span>↩</span> Đăng xuất</button>
      </aside>

      {/* MAIN */}
      <main className="pf-main">

        {/* INFO */}
        {activeTab === "info" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Thông tin cá nhân</h2>
              <p className="pf-section-sub">Cập nhật họ tên, số điện thoại và địa chỉ của bạn</p>
            </div>
            <form className="pf-form" onSubmit={saveInfo}>
              <div className="pf-field-row">
                <div className="pf-field"><label>Họ và tên</label><input value={info.name} onChange={e => setInfo(c => ({ ...c, name: e.target.value }))} /></div>
                <div className="pf-field"><label>Số điện thoại</label><input value={info.phone} onChange={e => setInfo(c => ({ ...c, phone: e.target.value }))} /></div>
              </div>
              <div className="pf-field"><label>Email</label><input type="email" value={info.email} disabled className="pf-disabled" /></div>
              <div className="pf-field"><label>Địa chỉ</label><input value={info.address} onChange={e => setInfo(c => ({ ...c, address: e.target.value }))} /></div>
              <div className="pf-field-row">
                <div className="pf-field">
                  <label>Giới tính</label>
                  <select value={info.gender} onChange={e => setInfo(c => ({ ...c, gender: e.target.value }))}>
                    {GENDER_OPTIONS.map(o => <option key={o.value || "unknown"} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="pf-field"><label>Tên đăng nhập</label><input value={resolvedUser.username || "-"} disabled className="pf-disabled" /></div>
              </div>
              <div className="pf-field-row">
                <div className="pf-field"><label>Vai trò</label><input value={resolvedUser.userRole || "-"} disabled className="pf-disabled" /></div>
                <div className="pf-field"><label>Trạng thái</label><input value={resolvedUser.userIsActive || "-"} disabled className="pf-disabled" /></div>
              </div>
              {infoError && <span className="pf-err">{infoError}</span>}
              {infoSaved && <p className="pf-success">{infoSaved}</p>}
              <div className="pf-form-footer">
                <button type="submit" className={`pf-save-btn ${infoSaved ? "saved" : ""}`}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        )}

        {/* PASSWORD */}
        {activeTab === "password" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Đổi mật khẩu</h2>
              <p className="pf-section-sub">Phần này hiện vẫn đang ở giao diện mô phỏng</p>
            </div>
            <form className="pf-form" onSubmit={savePw}>
              {[
                { key: "current", label: "Mật khẩu hiện tại" },
                { key: "next",    label: "Mật khẩu mới" },
                { key: "confirm", label: "Xác nhận mật khẩu" },
              ].map(f => (
                <div className="pf-field" key={f.key}>
                  <label>{f.label}</label>
                  <div className="pf-pass-wrap">
                    <input type={showPw ? "text" : "password"} placeholder="••••••••" value={pw[f.key]}
                      onChange={e => { setPw(c => ({ ...c, [f.key]: e.target.value })); setPwErr(c => ({ ...c, [f.key]: "" })) }}
                      className={pwErr[f.key] ? "err" : ""} />
                    {f.key === "current" && (
                      <button type="button" className="pf-eye" onClick={() => setShowPw(s => !s)}>{showPw ? "🙈" : "👁"}</button>
                    )}
                  </div>
                  {pwErr[f.key] && <span className="pf-err">{pwErr[f.key]}</span>}
                </div>
              ))}
              <div className="pf-form-footer">
                <button type="submit" className={`pf-save-btn ${pwSaved ? "saved" : ""}`}>
                  {pwSaved ? "✓ Đã đổi" : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Lịch sử đơn hàng</h2>
              <p className="pf-section-sub">Theo dõi và hủy đơn hàng đang chờ xử lý</p>
            </div>
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th><th>Ngày</th><th>Món</th>
                    <th>Tổng</th><th>Trạng thái</th><th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {auth.orders.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontWeight: 300 }}>Chưa có đơn hàng nào</td></tr>
                  ) : auth.orders.map(order => (
                    <tr key={order.id}>
                      <td className="pf-td-id">{order.id}</td>
                      <td>{order.date}</td>
                      <td className="pf-td-items">
                        {/* ── Nút xem chi tiết ── */}
                        <button className="pf-detail-trigger" onClick={() => openOrderDetails(order)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                          Xem chi tiết
                        </button>
                        <p className="pf-items-text">{order.items}</p>
                        {order.notes      && <p className="pf-order-note">📝 {order.notes}</p>}
                        {order.driverName && <p className="pf-order-note">🛵 {order.driverName}{order.driverPhone ? ` · ${order.driverPhone}` : ""}</p>}
                      </td>
                      <td className="pf-td-total">{order.total}</td>
                      <td>
                        <span className={`pf-status ${isOrderCancelled(order) ? "cancelled" : "done"}`}>
                          {getOrderDisplayStatus(order)}
                        </span>
                      </td>
                      <td>
                        {canCancelOrder(order)
                          ? <button className="pf-inline-btn" onClick={() => openCancelForm(order)}>Hủy đơn</button>
                          : <span className="pf-order-meta">{isOrderCancelled(order) ? "Đã hủy" : "Không thể hủy"}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {cancelSuccess && <p className="pf-success">{cancelSuccess}</p>}

            {cancelTarget && (
              <form className="pf-cancel-box" onSubmit={submitOrderCancel}>
                <div className="pf-cancel-head">
                  <div>
                    <h3>Huỷ đơn {cancelTarget.id}</h3>
                    <p>Backend chỉ hỗ trợ hủy đơn đang chờ xử lý, không nhận thêm lý do.</p>
                  </div>
                  <button type="button" className="pf-inline-btn ghost" onClick={closeCancelForm}>Đóng</button>
                </div>
                {cancelError && <span className="pf-err">{cancelError}</span>}
                <div className="pf-form-footer">
                  <button type="submit" className="pf-save-btn" disabled={cancelSubmitting}>
                    {cancelSubmitting ? "Đang gửi..." : "Xác nhận huỷ đơn"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Lịch sử đặt bàn</h2>
              <p className="pf-section-sub">Dữ liệu được lấy từ backend của tài khoản hiện tại</p>
            </div>
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr><th>Mã đặt bàn</th><th>Ngày</th><th>Giờ</th><th>Số khách</th><th>Trạng thái</th></tr>
                </thead>
                <tbody>
                  {auth.bookings.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontWeight: 300 }}>Chưa có đặt bàn nào</td></tr>
                  ) : auth.bookings.map(b => (
                    <tr key={b.id}>
                      <td className="pf-td-id">{b.id}</td>
                      <td>{b.date}</td>
                      <td>{b.time}</td>
                      <td>{b.guests} người</td>
                      <td><span className={`pf-status ${b.status === "Đã hủy" ? "cancelled" : "done"}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={closeOrderDetails} />
      )}
    </div>
  )
}
