import { useState } from "react"
import { useNavigate } from "react-router-dom"
import StaffCustomerManager from "../staff/StaffCustomerManager"
import StaffMenuManager from "../staff/StaffMenuManager"
import { useStaff } from "../staff/StaffContext"
import "../staff/StaffLayout.css"
import AdminCreateUser from "./AdminCreateUser"
import "./AdminLayout.css"
import { getAdminDriversApi, getAdminStaffsApi } from "./adminApi"
import AdminUserManager from "./AdminUserManager"

const NAV_ITEMS = [
  { key: "menu", label: "Quản lý menu" },
  { key: "customers", label: "Khách hàng" },
  { key: "drivers", label: "Driver" },
  { key: "staff", label: "Staff" },
  { key: "add-user", label: "Thêm người dùng" },
]

export default function AdminLayout() {
  const { staff, staffLogout } = useStaff()
  const navigate = useNavigate()
  const [tab, setTab] = useState("menu")
  const [sideOpen, setSideOpen] = useState(false)

  if (!staff) {
    navigate("/login")
    return null
  }

  if (staff.role !== "admin") {
    navigate("/staff/dashboard")
    return null
  }

  function handleLogout() {
    staffLogout()
    navigate("/login")
  }

  function openTab(nextTab) {
    setTab(nextTab)
    setSideOpen(false)
  }

  return (
    <div className="adm-page">
      <header className="sdl-topbar">
        <div className="sdl-topbar-left">
          <button className="sdl-hamburger" onClick={() => setSideOpen(current => !current)}>☰</button>
          <div className="sdl-brand" onClick={() => navigate("/")}>
            <span className="sdl-brand-main">Hai SAPA</span>
            <span className="sdl-brand-tag adm-brand-tag">ADMIN</span>
          </div>
        </div>

        <div className="sdl-topbar-right">
          <button className="sdl-profile-trigger" onClick={() => openTab("staff")}>
            <div className="sdl-staff-info">
              <div className="sdl-staff-avatar">{staff.avatar}</div>
              <div>
                <p className="sdl-staff-name">{staff.name}</p>
                <span className="sdl-staff-role" style={{ background: "#b88421" }}>
                  Quản trị viên
                </span>
              </div>
            </div>
          </button>
          <button className="sdl-logout" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </header>

      <div className="sdl-body">
        <aside className={`sdl-sidebar ${sideOpen ? "open" : ""}`}>
          <nav className="sdl-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`sdl-nav-item adm-nav-item ${tab === item.key ? "active" : ""}`}
                onClick={() => openTab(item.key)}
              >
                {item.key !== "add-user" ? <span className="sdl-nav-icon">Quản lý</span> : null}
                <span className="sdl-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sdl-sidebar-footer">
            <button className="sdl-goto-user" onClick={() => navigate("/")}>
              Về trang khách hàng
            </button>
          </div>
        </aside>

        <main className="sdl-main">
          {tab === "menu" ? <StaffMenuManager /> : null}
          {tab === "customers" ? <StaffCustomerManager /> : null}
          {tab === "drivers" ? (
            <AdminUserManager
              title="Quản lý driver"
              subtitle="Theo dõi và khóa hoặc mở khóa tài khoản driver."
              loadUsers={getAdminDriversApi}
            />
          ) : null}
          {tab === "staff" ? (
            <AdminUserManager
              title="Quản lý staff"
              subtitle="Danh sách nhân sự đang có quyền thao tác nội bộ."
              loadUsers={getAdminStaffsApi}
            />
          ) : null}
          {tab === "add-user" ? <AdminCreateUser /> : null}
        </main>
      </div>

      {sideOpen ? <div className="sdl-overlay" onClick={() => setSideOpen(false)} /> : null}
    </div>
  )
}
