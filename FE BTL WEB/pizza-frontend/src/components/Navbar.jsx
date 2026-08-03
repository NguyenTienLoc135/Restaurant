import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"

function Navbar() {
  const [open,       setOpen]       = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const auth = useAuth()
  const user = auth?.user ?? null
  const logout = auth?.logout ?? (() => {})
  const dropdownRef = useRef(null)

  const lightPages = ["/menu", "/about", "/vision", "/careers", "/library", "/order", "/cart", "/checkout", "/login", "/profile"]
  const isLight = lightPages.some(p => location.pathname.startsWith(p))

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setUserMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const goTo = (path) => { setOpen(false); setUserMenuOpen(false); navigate(path) }

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    navigate("/")
  }

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
                    <span className="nav-link-icon">⊞</span> Đặt bàn
                  </button>
                  <button className="nav-link" onClick={() => goTo("/order")}>
                    <span className="nav-link-icon">◎</span> Giao Hàng
                  </button>
                  <button className="nav-link" onClick={() => goTo("/careers")}>
                    <span className="nav-link-icon">◈</span> Tuyển dụng
                  </button>

                  <div className="lang-toggle">
                    <span className="lang-active">VN</span>
                    <span className="lang-sep">|</span>
                    <span className="lang-inactive">EN</span>
                  </div>

                  {/* ── USER AREA ── */}
                  {user ? (
                    <div className="nav-user-wrap" ref={dropdownRef}>
                      <button
                        className="nav-user-btn"
                        onClick={() => setUserMenuOpen(s => !s)}
                      >
                        <div className="nav-user-avatar">{user.avatar}</div>
                        <span className="nav-user-name">{user.name}</span>
                        <svg className={`nav-user-chevron ${userMenuOpen ? "open" : ""}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>

                      {userMenuOpen && (
                        <div className="nav-dropdown">
                          <div className="nav-dd-header">
                            <div className="nav-dd-avatar">{user.avatar}</div>
                            <div>
                              <p className="nav-dd-name">{user.name}</p>
                              <p className="nav-dd-email">{user.email}</p>
                            </div>
                          </div>
                          <div className="nav-dd-divider" />
                          {[
                            { icon: "👤", label: "Thông tin tài khoản", path: "/profile" },
                            { icon: "📦", label: "Đơn hàng của tôi",    path: "/profile?tab=orders" },
                            { icon: "🍽️", label: "Đặt bàn của tôi",     path: "/profile?tab=bookings" },
                            { icon: "🔒", label: "Đổi mật khẩu",        path: "/profile?tab=password" },
                          ].map(item => (
                            <button key={item.label} className="nav-dd-item" onClick={() => goTo(item.path)}>
                              <span className="nav-dd-icon">{item.icon}</span>
                              {item.label}
                            </button>
                          ))}
                          <div className="nav-dd-divider" />
                          <button className="nav-dd-item nav-dd-logout" onClick={handleLogout}>
                            <span className="nav-dd-icon">↩</span>
                            Đăng xuất
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button className="nav-login-btn" onClick={() => goTo("/login")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Đăng nhập
                    </button>
                  )}
                </div>

                <button className="hamburger" onClick={() => setOpen(true)} aria-label="Mở menu">
                  <span className="bar bar-1" />
                  <span className="bar bar-2" />
                  <span className="bar bar-3" />
                </button>
              </div>
            </>
          )}

          {open && (
            <button className="close-btn" onClick={() => setOpen(false)} aria-label="Đóng menu">
              <span /><span />
            </button>
          )}
        </div>
      </nav>

      {/* FULLSCREEN MENU */}
      <div className={`fullscreen-menu ${open ? "is-visible" : ""}`}>
        <div className="fm-inner">
          <div className="fm-col fm-primary">
            {[["Review Shop", "/about"], ["Thực đơn", "/menu"]].map(([label, path], i) => (
              <button key={label} className="fm-link fm-link-large" style={{ "--i": i }} onClick={() => goTo(path)}>
                <span className="fm-link-num">0{i + 1}</span>
                {label}
                <span className="fm-link-arrow">→</span>
              </button>
            ))}
          </div>
          <div className="fm-col fm-secondary">
            {[["Tuyển dụng", "/careers"]].map(([label, path]) => (
              <button key={label} className="fm-link fm-link-large" style={{ "--i": 5 }} onClick={() => goTo(path)}>
                <span className="fm-link-num">03</span>
                {label}
                <span className="fm-link-arrow">→</span>
              </button>
            ))}
            <div className="fm-divider" />
            {[
              user ? ["Tài khoản của tôi", "/profile"] : ["Đăng nhập / Đăng ký", "/login"],
              ["Hồ sơ công ty", "/company"],
              ["Chính sách bảo mật", "/privacy"],
              ["Hóa đơn điện tử", "/invoice"],
            ].map(([label, path], i) => (
              <button key={label} className="fm-link fm-link-small" style={{ "--i": i + 8 }} onClick={() => goTo(path)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="fm-footer">
          <span>© 2024 Hải SAPA</span>
          <div className="fm-footer-links">
            <span>VN</span><span className="fm-footer-sep">·</span><span>EN</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
