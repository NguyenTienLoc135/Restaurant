import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { decodeJwtToken } from "../services/jwt"
import { useStaff } from "../staff/StaffContext"
import "./Navbar.css"

function getInternalRole(account) {
  const normalized = String(account?.role || account?.userRole || "").trim().toLowerCase()
  if (normalized === "admin" || normalized === "staff" || normalized === "driver") {
    return normalized
  }
  return ""
}

function getInternalRoleFromTokens() {
  const staffToken = localStorage.getItem("hs_staff_token")
  const userToken = localStorage.getItem("hs_user_token")
  const payload = decodeJwtToken(staffToken || userToken)
  const normalized = String(payload?.role || payload?.userRole || "").trim().toLowerCase()
  if (normalized === "admin" || normalized === "staff" || normalized === "driver") {
    return normalized
  }
  return ""
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()
  const staffAuth = useStaff()
  const user = auth?.user ?? null
  const staff = staffAuth?.staff ?? null
  const activeAccount = staff || user
  const activeInternalRole = staff?.role || getInternalRole(activeAccount) || getInternalRoleFromTokens()
  const isInternalAccount = !!activeInternalRole
  const logout = isInternalAccount ? (staff ? (staffAuth?.staffLogout ?? (() => {})) : (auth?.logout ?? (() => {}))) : (auth?.logout ?? (() => {}))
  const dropdownRef = useRef(null)
  const internalDashboardPath = activeInternalRole === "admin" ? "/admin/dashboard" : "/staff/dashboard"
  const internalDashboardLabel = activeInternalRole === "admin" ? "Trang admin" : "Trang staff"

  const lightPages = ["/menu", "/about", "/vision", "/careers", "/library", "/order", "/cart", "/checkout", "/login", "/profile"]
  const isLight = lightPages.some(page => location.pathname.startsWith(page))

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    function handler(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function goTo(path) {
    setOpen(false)
    setUserMenuOpen(false)
    navigate(path)
  }

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    navigate("/")
  }

  const dropdownItems = isInternalAccount
    ? [{ icon: "Admin", label: internalDashboardLabel, path: internalDashboardPath }]
    : [
        { icon: "👨‍🍳", label: "Tài khoản", path: "/profile" },
        { icon: "📝", label: "Đơn hàng của tôi", path: "/profile?tab=orders" },
        { icon: "💻", label: "Đặt bàn của tôi", path: "/profile?tab=bookings" },
        { icon: "🔑", label: "Đổi mật khẩu", path: "/profile?tab=password" },
      ]

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""} ${open ? "menu-open" : ""} ${isLight ? "navbar-light" : ""}`}>
        <div className="navbar-container">
          {!open && (
            <>
              <div className="logo" onClick={() => goTo("/")}>
                <span className="logo-main">Hải SAPA</span>
                <span className="logo-sub">VIETNAM</span>
              </div>

              <div className="navbar-right">
                <div className="nav-links">
                  <button className="nav-link" onClick={() => goTo("/booking")}>
                    <span className="nav-link-icon">⁕</span> Đặt Bàn
                  </button>
                  <button className="nav-link" onClick={() => goTo("/order")}>
                    <span className="nav-link-icon">⁂</span> Giao Hàng
                  </button>
                  <button className="nav-link" onClick={() => goTo("/careers")}>
                    <span className="nav-link-icon">⌀</span> Tuyển Dụng
                  </button>

                  <div className="lang-toggle">
                    <span className="lang-active">VN</span>
                    <span className="lang-sep">|</span>
                    <span className="lang-inactive">EN</span>
                  </div>

                  {activeAccount ? (
                    <div className="nav-user-wrap" ref={dropdownRef}>
                      <button className="nav-user-btn" onClick={() => setUserMenuOpen(current => !current)}>
                        <div className="nav-user-avatar">{activeAccount.avatar}</div>
                        <span className="nav-user-name">{activeAccount.name}</span>
                        <svg className={`nav-user-chevron ${userMenuOpen ? "open" : ""}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>

                      {userMenuOpen && (
                        <div className="nav-dropdown">
                          <div className="nav-dd-header">
                            <div className="nav-dd-avatar">{activeAccount.avatar}</div>
                            <div>
                              <p className="nav-dd-name">{activeAccount.name}</p>
                              <p className="nav-dd-email">{activeAccount.email}</p>
                            </div>
                          </div>
                          <div className="nav-dd-divider" />
                          {dropdownItems.filter(item => item.path !== "/profile?tab=password").map(item => (
                            <button key={item.label} className="nav-dd-item" onClick={() => goTo(item.path)}>
                              <span className="nav-dd-icon">{item.icon}</span>
                              {item.label}
                            </button>
                          ))}
                          <div className="nav-dd-divider" />
                          <button className="nav-dd-item nav-dd-logout" onClick={handleLogout}>
                            <span className="nav-dd-icon">❌</span>
                            Đăng xuất
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button className="nav-login-btn" onClick={() => goTo("/login")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Đăng nhập
                    </button>
                  )}
                </div>

                <button className="hamburger" onClick={() => setOpen(true)} aria-label="Mo menu">
                  <span className="bar bar-1" />
                  <span className="bar bar-2" />
                  <span className="bar bar-3" />
                </button>
              </div>
            </>
          )}

          {open && (
            <button className="close-btn" onClick={() => setOpen(false)} aria-label="Dong menu">
              <span />
              <span />
            </button>
          )}
        </div>
      </nav>

      <div className={`fullscreen-menu ${open ? "is-visible" : ""}`}>
        <div className="fm-inner">
          <div className="fm-col fm-primary">
            {[["Review Shop", "/about"], ["Thuc don", "/menu"]].map(([label, path], index) => (
              <button key={label} className="fm-link fm-link-large" style={{ "--i": index }} onClick={() => goTo(path)}>
                <span className="fm-link-num">0{index + 1}</span>
                {label}
                <span className="fm-link-arrow">-</span>
              </button>
            ))}
          </div>

          <div className="fm-col fm-secondary">
            {[["Tuyen dung", "/careers"]].map(([label, path]) => (
              <button key={label} className="fm-link fm-link-large" style={{ "--i": 5 }} onClick={() => goTo(path)}>
                <span className="fm-link-num">03</span>
                {label}
                <span className="fm-link-arrow">-</span>
              </button>
            ))}

            <div className="fm-divider" />

            {[
              activeAccount
                ? [isInternalAccount ? internalDashboardLabel : "Tai khoan cua toi", isInternalAccount ? internalDashboardPath : "/profile"]
                : ["Dang nhap / Dang ky", "/login"],
              ["Ho so cong ty", "/company"],
              ["Chinh sach bao mat", "/privacy"],
              ["Hoa don dien tu", "/invoice"],
            ].map(([label, path], index) => (
              <button key={label} className="fm-link fm-link-small" style={{ "--i": index + 8 }} onClick={() => goTo(path)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="fm-footer">
          <span>(c) 2024 Hai SAPA</span>
          <div className="fm-footer-links">
            <span>VN</span>
            <span className="fm-footer-sep">.</span>
            <span>EN</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
