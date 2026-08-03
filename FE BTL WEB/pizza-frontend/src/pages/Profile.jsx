import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Profile.css"

const TABS = [
  { key: "info",     icon: "👤", label: "Thông tin" },
  { key: "password", icon: "🔒", label: "Đổi mật khẩu" },
  { key: "orders",   icon: "📦", label: "Đơn hàng" },
  { key: "bookings", icon: "🍽️", label: "Đặt bàn" },
]

export default function Profile() {
  const { user, logout, updateUser, orders, bookings } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("info")

  // info form
  const [info, setInfo]         = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" })
  const [infoSaved, setInfoSaved] = useState(false)

  // password form
  const [pw, setPw]       = useState({ current: "", next: "", confirm: "" })
  const [pwErr, setPwErr] = useState({})
  const [pwSaved, setPwSaved] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  if (!user) { navigate("/login"); return null }

  function saveInfo(e) {
    e.preventDefault()
    updateUser({ name: info.name, email: info.email, phone: info.phone })
    setInfoSaved(true)
    setTimeout(() => setInfoSaved(false), 2000)
  }

  function savePw(e) {
    e.preventDefault()
    const e2 = {}
    if (!pw.current) e2.current = "Nhập mật khẩu hiện tại"
    if (!pw.next || pw.next.length < 6) e2.next = "Tối thiểu 6 ký tự"
    if (pw.next !== pw.confirm) e2.confirm = "Mật khẩu không khớp"
    setPwErr(e2)
    if (Object.keys(e2).length) return
    setPwSaved(true)
    setPw({ current: "", next: "", confirm: "" })
    setTimeout(() => setPwSaved(false), 2000)
  }

  function handleLogout() {
    logout()
    navigate("/")
  }

  return (
    <div className="pf-page">
      {/* SIDEBAR */}
      <aside className="pf-sidebar">
        <div className="pf-avatar-wrap">
          <div className="pf-avatar">{user.avatar || user.name?.charAt(0)}</div>
          <div>
            <p className="pf-name">{user.name}</p>
            <p className="pf-email">{user.email}</p>
            <span className="pf-member-badge">✦ Thành viên</span>
          </div>
        </div>

        <nav className="pf-nav">
          {TABS.map(t => (
            <button key={t.key} className={`pf-nav-item ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
              <span className="pf-nav-icon">{t.icon}</span>
              {t.label}
              <span className="pf-nav-arrow">→</span>
            </button>
          ))}
        </nav>

        <button className="pf-logout" onClick={handleLogout}>
          <span>↩</span> Đăng xuất
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="pf-main">

        {/* ── INFO ── */}
        {activeTab === "info" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Thông tin cá nhân</h2>
              <p className="pf-section-sub">Cập nhật tên, email và số điện thoại của bạn</p>
            </div>
            <form className="pf-form" onSubmit={saveInfo}>
              <div className="pf-field-row">
                <div className="pf-field">
                  <label>Họ và tên</label>
                  <input value={info.name} onChange={e => setInfo(i => ({ ...i, name: e.target.value }))} placeholder="Nguyễn Văn A" />
                </div>
                <div className="pf-field">
                  <label>Số điện thoại</label>
                  <input value={info.phone} onChange={e => setInfo(i => ({ ...i, phone: e.target.value }))} placeholder="0901 234 567" />
                </div>
              </div>
              <div className="pf-field">
                <label>Email</label>
                <input type="email" value={info.email} onChange={e => setInfo(i => ({ ...i, email: e.target.value }))} placeholder="email@example.com" />
              </div>
              <div className="pf-field">
                <label>Ngày tham gia</label>
                <input value={user.joined || "—"} disabled className="pf-disabled" />
              </div>
              <div className="pf-form-footer">
                <button type="submit" className={`pf-save-btn ${infoSaved ? "saved" : ""}`}>
                  {infoSaved ? "✓ Đã lưu!" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── PASSWORD ── */}
        {activeTab === "password" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Đổi mật khẩu</h2>
              <p className="pf-section-sub">Mật khẩu mới tối thiểu 6 ký tự</p>
            </div>
            <form className="pf-form" onSubmit={savePw}>
              {[
                { key: "current", label: "Mật khẩu hiện tại", ph: "••••••••" },
                { key: "next",    label: "Mật khẩu mới",      ph: "••••••••" },
                { key: "confirm", label: "Xác nhận mật khẩu", ph: "••••••••" },
              ].map(f => (
                <div className="pf-field" key={f.key}>
                  <label>{f.label}</label>
                  <div className="pf-pass-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder={f.ph}
                      value={pw[f.key]}
                      onChange={e => { setPw(p => ({ ...p, [f.key]: e.target.value })); setPwErr(p => ({ ...p, [f.key]: "" })) }}
                      className={pwErr[f.key] ? "err" : ""}
                    />
                    {f.key === "current" && (
                      <button type="button" className="pf-eye" onClick={() => setShowPw(s => !s)}>{showPw ? "🙈" : "👁"}</button>
                    )}
                  </div>
                  {pwErr[f.key] && <span className="pf-err">{pwErr[f.key]}</span>}
                </div>
              ))}
              <div className="pf-form-footer">
                <button type="submit" className={`pf-save-btn ${pwSaved ? "saved" : ""}`}>
                  {pwSaved ? "✓ Đã đổi!" : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Lịch sử đơn hàng</h2>
              <p className="pf-section-sub">Các đơn giao hàng gần đây</p>
            </div>
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr><th>Mã đơn</th><th>Ngày</th><th>Món</th><th>Tổng</th><th>Trạng thái</th></tr>
                </thead>
                <tbody>
                  {orders.length === 0
                    ? <tr><td colSpan={5} style={{textAlign:"center", padding:"40px", color:"#9ca3af", fontWeight:300}}>Chưa có đơn hàng nào</td></tr>
                    : orders.map(o => (
                    <tr key={o.id}>
                      <td className="pf-td-id">{o.id}</td>
                      <td>{o.date}</td>
                      <td className="pf-td-items">{o.items}</td>
                      <td className="pf-td-total">{o.total}</td>
                      <td><span className={`pf-status ${o.status === "Đã hủy" ? "cancelled" : "done"}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {activeTab === "bookings" && (
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 className="pf-section-title">Lịch sử đặt bàn</h2>
              <p className="pf-section-sub">Các lần đặt bàn tại nhà hàng</p>
            </div>
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr><th>Mã đặt bàn</th><th>Ngày</th><th>Giờ</th><th>Số khách</th><th>Trạng thái</th></tr>
                </thead>
                <tbody>
                  {bookings.length === 0
                    ? <tr><td colSpan={5} style={{textAlign:"center", padding:"40px", color:"#9ca3af", fontWeight:300}}>Chưa có đặt bàn nào</td></tr>
                    : bookings.map(b => (
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
    </div>
  )
}
