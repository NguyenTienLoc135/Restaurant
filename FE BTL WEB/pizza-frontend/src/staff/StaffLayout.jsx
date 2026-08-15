import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStaff } from "./StaffContext"
import StaffMenuManager from "./StaffMenuManager"
import StaffOrderManager from "./StaffOrderManager"
import StaffBookingManager from "./StaffBookingManager"
import StaffDriverView from "./StaffDriverView"
import StaffProfileManager from "./StaffProfileManager"
import "./StaffLayout.css"

const NAV_STAFF = [
  { key: "orders", icon: "📦", label: "Đơn hàng" },
  { key: "bookings", icon: "🍽️", label: "Đặt bàn" },
  { key: "menu", icon: "🍕", label: "Quản lý Menu" },
  { key: "profile", icon: "👤", label: "Tài khoản" },
]

const NAV_DRIVER = [
  { key: "driver", icon: "🛵", label: "Đơn cần giao" },
  { key: "profile", icon: "👤", label: "Tài khoản" },
]

const NAV_ADMIN = [
  { key: "orders", icon: "📦", label: "Đơn hàng" },
  { key: "bookings", icon: "🍽️", label: "Đặt bàn" },
  { key: "menu", icon: "🍕", label: "Quản lý Menu" },
  { key: "driver", icon: "🛵", label: "Quản lý tài xế" },
  { key: "profile", icon: "👤", label: "Tài khoản" },
]

const ROLE_LABEL = {
  staff: "Nhân viên",
  admin: "Quản trị viên",
  driver: "Tài xế",
}

const ROLE_COLOR = {
  staff: "#1a3f7a",
  admin: "#c8a96e",
  driver: "#16a34a",
}

export default function StaffLayout() {
  const { staff, staffLogout } = useStaff()
  const navigate = useNavigate()
  const [tab, setTab] = useState(staff?.role === "driver" ? "driver" : "orders")
  const [sideOpen, setSideOpen] = useState(false)

  if (!staff) {
    navigate("/staff/login")
    return null
  }

  const navItems = staff.role === "driver" ? NAV_DRIVER : staff.role === "admin" ? NAV_ADMIN : NAV_STAFF

  function handleLogout() {
    staffLogout()
    navigate("/staff/login")
  }

  function openTab(nextTab) {
    setTab(nextTab)
    setSideOpen(false)
  }

  return (
    <div className="sdl-page">
      <header className="sdl-topbar">
        <div className="sdl-topbar-left">
          <button className="sdl-hamburger" onClick={() => setSideOpen(current => !current)}>☰</button>
          <div className="sdl-brand" onClick={() => navigate("/")}>
            <span className="sdl-brand-main">Hải SAPA</span>
            <span className="sdl-brand-tag">STAFF</span>
          </div>
        </div>

        <div className="sdl-topbar-right">
          <button className="sdl-profile-trigger" onClick={() => openTab("profile")}>
            <div className="sdl-staff-info">
              <div className="sdl-staff-avatar">{staff.avatar}</div>
              <div>
                <p className="sdl-staff-name">{staff.name}</p>
                <span className="sdl-staff-role" style={{ background: ROLE_COLOR[staff.role] }}>
                  {ROLE_LABEL[staff.role]}
                </span>
              </div>
            </div>
          </button>
          <button className="sdl-logout" onClick={handleLogout}>Đăng xuất ↩</button>
        </div>
      </header>

      <div className="sdl-body">
        <aside className={`sdl-sidebar ${sideOpen ? "open" : ""}`}>
          <nav className="sdl-nav">
            {navItems.map(item => (
              <button
                key={item.key}
                className={`sdl-nav-item ${tab === item.key ? "active" : ""}`}
                onClick={() => openTab(item.key)}
              >
                <span className="sdl-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sdl-sidebar-footer">
            <button className="sdl-goto-user" onClick={() => navigate("/")}>
              🌐 Trang khách hàng
            </button>
          </div>
        </aside>

        <main className="sdl-main">
          {tab === "orders" && <StaffOrderManager />}
          {tab === "bookings" && <StaffBookingManager />}
          {tab === "menu" && <StaffMenuManager />}
          {tab === "driver" && <StaffDriverView />}
          {tab === "profile" && <StaffProfileManager />}
        </main>
      </div>

      {sideOpen && <div className="sdl-overlay" onClick={() => setSideOpen(false)} />}
    </div>
  )
}
