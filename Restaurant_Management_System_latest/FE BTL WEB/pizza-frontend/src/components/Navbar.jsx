import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import { useStaff } from "../staff/StaffContext"
import "./Navbar.css"

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()
  const staffAuth = useStaff()
  const { language, setLanguage, isEnglish } = useLanguage()
  const user = auth?.user ?? null
  const staff = staffAuth?.staff ?? null
  const activeAccount = staff || user
  const logout = staff ? (staffAuth?.staffLogout ?? (() => {})) : (auth?.logout ?? (() => {}))
  const dropdownRef = useRef(null)

  const copy = isEnglish
    ? {
        booking: "Booking",
        delivery: "Delivery",
        careers: "Careers",
        staffPage: "Staff page",
        account: "Account",
        myOrders: "My orders",
        myBookings: "My bookings",
        changePassword: "Change password",
        logout: "Log out",
        login: "Log in",
        openMenu: "Open menu",
        closeMenu: "Close menu",
        reviewShop: "Review shop",
        menu: "Menu",
        companyProfile: "Company profile",
        privacyPolicy: "Privacy policy",
        invoice: "E-invoice",
        myAccount: "My account",
        loginRegister: "Log in / Sign up",
      }
    : {
        booking: "Đặt bàn",
        delivery: "Giao hàng",
        careers: "Tuyển dụng",
        staffPage: "Trang staff",
        account: "Tài khoản",
        myOrders: "Đơn hàng của tôi",
        myBookings: "Đặt bàn của tôi",
        changePassword: "Đổi mật khẩu",
        logout: "Đăng xuất",
        login: "Đăng nhập",
        openMenu: "Mở menu",
        closeMenu: "Đóng menu",
        reviewShop: "Review shop",
        menu: "Thực đơn",
        companyProfile: "Hồ sơ công ty",
        privacyPolicy: "Chính sách bảo mật",
        invoice: "Hóa đơn điện tử",
        myAccount: "Tài khoản của tôi",
        loginRegister: "Đăng nhập / Đăng ký",
      }

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
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
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

  const dropdownItems = staff
    ? [{ icon: "Admin", label: copy.staffPage, path: "/staff/dashboard" }]
    : [
        { icon: "👨‍🍳", label: copy.account, path: "/profile" },
        { icon: "📝", label: copy.myOrders, path: "/profile?tab=orders" },
        { icon: "💻", label: copy.myBookings, path: "/profile?tab=bookings" },
        { icon: "🔑", label: copy.changePassword, path: "/profile?tab=password" },
      ]

  const footerLinks = [
    activeAccount
      ? [staff ? copy.staffPage : copy.myAccount, staff ? "/staff/dashboard" : "/profile"]
      : [copy.loginRegister, "/login"],
    [copy.companyProfile, "/company"],
    [copy.privacyPolicy, "/privacy"],
    [copy.invoice, "/invoice"],
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
                    <span className="nav-link-icon">•</span> {copy.booking}
                  </button>
                  <button className="nav-link" onClick={() => goTo("/order")}>
                    <span className="nav-link-icon">•</span> {copy.delivery}
                  </button>
                  <button className="nav-link" onClick={() => goTo("/careers")}>
                    <span className="nav-link-icon">•</span> {copy.careers}
                  </button>

                  <div className="lang-toggle">
                    <button
                      type="button"
                      className={language === "vn" ? "lang-active" : "lang-inactive"}
                      onClick={() => setLanguage("vn")}
                    >
                      VN
                    </button>
                    <span className="lang-sep">|</span>
                    <button
                      type="button"
                      className={language === "en" ? "lang-active" : "lang-inactive"}
                      onClick={() => setLanguage("en")}
                    >
                      EN
                    </button>
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
                          {dropdownItems.map(item => (
                            <button key={item.label} className="nav-dd-item" onClick={() => goTo(item.path)}>
                              <span className="nav-dd-icon">{item.icon}</span>
                              {item.label}
                            </button>
                          ))}
                          <div className="nav-dd-divider" />
                          <button className="nav-dd-item nav-dd-logout" onClick={handleLogout}>
                            <span className="nav-dd-icon">❌</span>
                            {copy.logout}
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
                      {copy.login}
                    </button>
                  )}
                </div>

                <button className="hamburger" onClick={() => setOpen(true)} aria-label={copy.openMenu}>
                  <span className="bar bar-1" />
                  <span className="bar bar-2" />
                  <span className="bar bar-3" />
                </button>
              </div>
            </>
          )}

          {open && (
            <button className="close-btn" onClick={() => setOpen(false)} aria-label={copy.closeMenu}>
              <span />
              <span />
            </button>
          )}
        </div>
      </nav>

      <div className={`fullscreen-menu ${open ? "is-visible" : ""}`}>
        <div className="fm-inner">
          <div className="fm-col fm-primary">
            {[
              [copy.reviewShop, "/about"],
              [copy.menu, "/menu"],
            ].map(([label, path], index) => (
              <button key={label} className="fm-link fm-link-large" style={{ "--i": index }} onClick={() => goTo(path)}>
                <span className="fm-link-num">0{index + 1}</span>
                {label}
                <span className="fm-link-arrow">-</span>
              </button>
            ))}
          </div>

          <div className="fm-col fm-secondary">
            {[[copy.careers, "/careers"]].map(([label, path]) => (
              <button key={label} className="fm-link fm-link-large" style={{ "--i": 5 }} onClick={() => goTo(path)}>
                <span className="fm-link-num">03</span>
                {label}
                <span className="fm-link-arrow">-</span>
              </button>
            ))}

            <div className="fm-divider" />

            {footerLinks.map(([label, path], index) => (
              <button key={label} className="fm-link fm-link-small" style={{ "--i": index + 8 }} onClick={() => goTo(path)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="fm-footer">
          <span>(c) 2024 Hai SAPA</span>
          <div className="fm-footer-links">
            <button type="button" className={language === "vn" ? "lang-active" : "lang-inactive"} onClick={() => setLanguage("vn")}>VN</button>
            <span className="fm-footer-sep">.</span>
            <button type="button" className={language === "en" ? "lang-active" : "lang-inactive"} onClick={() => setLanguage("en")}>EN</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar

