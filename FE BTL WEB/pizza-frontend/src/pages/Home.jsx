import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "./Home.css"

/* ── Intersection observer hook for scroll animations ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

/* ─────────────────────────────────────────
   NEWS DATA (mock)
───────────────────────────────────────── */
const NEWS = [
  {
    date: "2025.5.29",
    title: "MAKE THE WORLD SMILE FOR CHEESE 🧀",
    img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a318?w=400&q=80"
  },
  {
    date: "2025.5.17",
    title: "PRESERVING NATURE'S PUREST GIFT…",
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80"
  },
  {
    date: "2025.4.25",
    title: "2024 SUSTAINABILITY REPORT LAUNCH…",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80"
  }
]

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate()

  /* ── Hero video ── */
  const videos = {
    Japan:     "/videos/japan.mp4",
    Vietnam:   "/videos/vietnam.mp4",
    Cambodia:  "/videos/cambodia.mp4",
    India:     "/videos/india.mp4",
    Indonesia: "/videos/indonesia.mp4",
    "U.S.A":   "/videos/usa.mp4"
  }
  const [video, setVideo] = useState(videos.Japan)
  const [activeCountry, setActiveCountry] = useState("Japan")

  function selectCountry(name) {
    setActiveCountry(name)
    setVideo(videos[name])
  }

  /* ── Shop section ── */
  const countries  = ["Vietnam", "Cambodia", "Japan", "India", "Indonesia"]
  const [shopTab, setShopTab]   = useState("Vietnam")
  const [shopOpen, setShopOpen] = useState(false)

  /* ── Scroll-in refs ── */
  const [shopRef,   shopInView]   = useInView()
  const [newsRef,   newsInView]   = useInView()
  const [footerRef, footerInView] = useInView()

  /* ── Scroll down button ── */
  const shopSectionRef = useRef(null)
  function scrollToShop() {
    shopSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="home-page">

      {/* ══════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════ */}
      <section className="hero">
        <video autoPlay loop muted playsInline className="bg-video"
          ref={el => { if (el && el.src !== new URL(video, window.location.href).href) { el.src = video; el.load(); el.play() } }}
        >
          <source src={video} type="video/mp4" />
        </video>

        {/* subtle grain overlay */}
        <div className="grain" />
        <div className="hero-fade" />

        {/* COUNTRY LIST */}
        <div className="countries">
          {Object.keys(videos).map(name => (
            <div
              key={name}
              className={`country ${activeCountry === name ? "is-active" : ""}`}
              onClick={() => selectCountry(name)}
            >
              <span className="country-name">{name}</span>
              <span className="arrow">→</span>
            </div>
          ))}
        </div>

        {/* SCROLL CUE */}
        <button className="scroll-cue" onClick={scrollToShop}>
          <span className="scroll-cue-line" />
          <span className="scroll-cue-text">Scroll</span>
        </button>
      </section>

      {/* ══════════════════════════════
          SECTION 2 — SHOP / MENU
      ══════════════════════════════ */}
      <section className="shop-section" ref={shopSectionRef}>
        <div
          className={`shop-inner ${shopInView ? "fade-in" : ""}`}
          ref={shopRef}
        >

          {/* LEFT PANEL */}
          <div className="shop-left">

            {/* brand title */}
            <div className="shop-brand">
              <h2 className="shop-brand-title">Hải SAPA</h2>
              <p className="shop-brand-sub">Ba Đình · Hà Nội</p>
            </div>

            {/* shop image card */}
            <div
              className="shop-card"
              onClick={() => navigate("/about")}
            >
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=80"
                alt="Restaurant interior"
              />
              <div className="shop-card-overlay">
                <span className="shop-card-label">REVIEW SHOP</span>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL — Menu */}
          <div
            className="menu-card"
            onClick={() => navigate("/menu")}
          >
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&q=80"
              alt="Pizza menu"
            />
            <div className="menu-card-overlay">
              <div className="menu-badge">
                <span>XEM</span>
                <span>MENU</span>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION NAV TABS */}
        <div className="section-tabs">
          <button className="stab active" onClick={() => navigate("/about")}>Location</button>
          <button className="stab" onClick={() => navigate("/menu")}>Menu</button>
          <button className="stab">News</button>
        </div>
      </section>

      {/* ══════════════════════════════
          SECTION 3 — NEWS
      ══════════════════════════════ */}
      <section className="news-section">
        <div
          className={`news-inner ${newsInView ? "fade-in" : ""}`}
          ref={newsRef}
        >

          <div className="news-grid">
            {NEWS.map((n, i) => (
              <article key={i} className="news-card" style={{ "--delay": `${i * 0.12}s` }}>
                <div className="news-img-wrap">
                  <img src={n.img} alt={n.title} />
                </div>
                <div className="news-body">
                  <p className="news-date">{n.date}</p>
                  <h3 className="news-title">{n.title}</h3>
                </div>
              </article>
            ))}

            {/* VIEW ALL button */}
            <div className="news-view-all">
              <button className="view-all-btn">
                VIEW<br />NEWS
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════
          SECTION 4 — FOOTER
      ══════════════════════════════ */}
      <footer
        className={`site-footer ${footerInView ? "fade-in" : ""}`}
        ref={footerRef}
      >
        <div className="footer-inner">

          {/* Logo */}
          <div className="footer-logo">
            <div className="logo-badge">
              <span className="logo-4">H</span>
              <span className="logo-ps">Sp</span>
              <span className="logo-arrow">▶</span>
            </div>
          </div>

          {/* Links */}
          <nav className="footer-nav">
            <a href="#">Company Profile</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Career</a>
            <a href="#">E-Invoice</a>
          </nav>

          {/* Social */}
          <div className="footer-social">
            <p className="social-label">Follow Us!</p>
            <div className="social-icons">
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.9v2.2h3.3l-.5 3.5h-2.8V24C19.6 23.1 24 18.1 24 12.1z"/></svg>
              </a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <div className="footer-contact">
            <span><strong>For Inquiry</strong> info@haisapa.com</span>
            <span><strong>For Feedback</strong> feedback@haisapa.com</span>
          </div>
          <span className="footer-copy">© 2026 Hai SAPA</span>
        </div>
      </footer>

    </div>
  )
}
