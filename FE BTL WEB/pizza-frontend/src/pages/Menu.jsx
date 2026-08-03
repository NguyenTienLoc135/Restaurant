import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Menu.css"

/* ══════════════════════════════════════
   MENU DATA
══════════════════════════════════════ */
const MENU = [
  {
    id: "appetizers",
    category: "Appetizers & Salads",
    items: [
      { name: "Các loại phô mai nhà làm (S)", price: "109,000", img: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=500&q=80" },
      { name: "Các loại phô mai nhà làm (L)", price: "198,000", img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a318?w=500&q=80" },
      { name: "Set thịt nguội và phô mai (Nhỏ)", price: "172,000", img: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&q=80" },
      { name: "Set thịt nguội và phô mai (Lớn)", price: "334,000", img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80" },
      { name: "Salad Caesar tôm nướng", price: "145,000", img: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&q=80" },
      { name: "Salad rau hỗn hợp 4P's", price: "118,000", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80" },
      { name: "Bruschetta phô mai tươi", price: "95,000", img: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500&q=80" },
      { name: "Soup bí đỏ nhà làm", price: "88,000", img: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=500&q=80" },
    ]
  },
  {
    id: "pizza",
    category: "Pizza",
    items: [
      { name: "Pizza Tôm sốt tỏi cay", price: "254,000", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80" },
      { name: "Phô mai Burrata thịt nguội", price: "298,000", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80" },
      { name: "Thịt nguội Ý Parma & rau rocket", price: "331,000", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80" },
      { name: "Pizza Margherita xúc xích cay", price: "238,000", img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80" },
      { name: "Pizza 4 loại phô mai nhà làm", price: "276,000", img: "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=500&q=80" },
      { name: "Pizza rau củ nướng & pesto", price: "218,000", img: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80" },
      { name: "Pizza Diavola salami cay", price: "265,000", img: "https://images.unsplash.com/photo-1539982703440-68f589f86e4f?w=500&q=80" },
    ]
  },
  {
    id: "pasta",
    category: "Pasta & Main Dishes",
    items: [
      { name: "Mì Ý nghêu và xốt quế tây", price: "165,000", img: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&q=80" },
      { name: "Mì Ý xốt kem với cua và cà chua", price: "254,000", img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80" },
      { name: "Mì Fettuccine nhà làm xốt kem cá hồi", price: "194,000", img: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=500&q=80" },
      { name: "Mỳ ý bò bằm phô mai hun khói", price: "210,000", img: "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=500&q=80" },
      { name: "Cá hồi áp chảo sốt bơ chanh", price: "325,000", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80" },
      { name: "Bò Wagyu áp chảo khoai tây", price: "485,000", img: "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80" },
    ]
  },
  {
    id: "desserts",
    category: "Desserts",
    items: [
      { name: "Tiramisu phô mai nhà làm", price: "115,000", img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80" },
      { name: "Bánh mousse chanh leo", price: "98,000", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80" },
      { name: "Kem phô mai 4P's", price: "78,000", img: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&q=80" },
      { name: "Bánh Panna Cotta vanilla", price: "88,000", img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80" },
      { name: "Chocolate Lava Cake", price: "105,000", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80" },
      { name: "Sorbet trái cây tươi", price: "72,000", img: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500&q=80" },
    ]
  },
  {
    id: "drinks",
    category: "Drink / Alcohol",
    others: [
      { name: "Kombucha", price: "69,000" },
      { name: "Classic Mojito", price: "112,000" },
      { name: "Passion Fruit Mojito", price: "138,000" },
      { name: "Raspberry Mojito", price: "138,000" },
      { name: "Coca Cola", price: "39,000" },
      { name: "Coca Cola Zero", price: "39,000" },
      { name: "Sprite", price: "39,000" },
      { name: "Organic Detox Juice", price: "65,000" },
    ],
    items: [
      { name: "Bia 4P's Yuzu Wheat (4.8% ABV)", price: "98,000", img: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&q=80" },
      { name: "Bia 4P's Whey Cider (5.5% ABV)", price: "98,000", img: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500&q=80" },
      { name: "4P's Session IPA (4.5% ABV)", price: "85,000", img: "https://images.unsplash.com/photo-1569944565098-4d69d0d2dd83?w=500&q=80" },
      { name: "Bia 4P's Dalat Whey Stout", price: "85,000", img: "https://images.unsplash.com/photo-1518099074172-2e47ee6cfdc0?w=500&q=80" },
      { name: "Rượu vang đỏ Ý nhà làm", price: "145,000", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&q=80" },
      { name: "Cocktail Negroni 4P's", price: "155,000", img: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&q=80" },
    ]
  }
]

/* ══════════════════════════════════════
   DRAG-TO-SCROLL ROW
══════════════════════════════════════ */
function DragScrollRow({ items }) {
  const viewportRef = useRef(null)
  const isDragging  = useRef(false)
  const startX      = useRef(0)
  const scrollLeft  = useRef(0)

  function onMouseDown(e) {
    isDragging.current = true
    startX.current     = e.pageX - viewportRef.current.offsetLeft
    scrollLeft.current = viewportRef.current.scrollLeft
    viewportRef.current.style.cursor = "grabbing"
  }

  function onMouseMove(e) {
    if (!isDragging.current) return
    e.preventDefault()
    const x    = e.pageX - viewportRef.current.offsetLeft
    const walk = (x - startX.current) * 1.2
    viewportRef.current.scrollLeft = scrollLeft.current - walk
  }

  function onMouseUp() {
    isDragging.current = false
    viewportRef.current.style.cursor = "grab"
  }

  return (
    <div
      className="scroll-viewport"
      ref={viewportRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="scroll-track">
        {items.map((item, i) => (
          <div className="dish-card" key={i}>
            <div className="dish-card-img">
              <img
                src={item.img}
                alt={item.name}
                loading="lazy"
                draggable="false"
              />
            </div>
            <div className="dish-card-info">
              <h3 className="dish-card-name">{item.name}</h3>
              <p className="dish-card-price">{item.price} vnd</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
function Footer() {
  const navigate = useNavigate()
  const NEWS = [
    { date: "2025.5.29", title: "MAKE THE WORLD SMILE FOR CHEESE 🧀", img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a318?w=400&q=80" },
    { date: "2025.5.17", title: "PRESERVING NATURE'S PUREST GIFT…",   img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80" },
    { date: "2025.4.25", title: "2024 SUSTAINABILITY REPORT LAUNCH…", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80" },
  ]

  return (
    <footer className="site-footer">

      {/* NEWS ROW */}
      <div className="footer-news">
        <div className="footer-news-grid">
          {NEWS.map((n, i) => (
            <article key={i} className="fn-card">
              <div className="fn-img"><img src={n.img} alt={n.title} /></div>
              <div className="fn-body">
                <p className="fn-date">{n.date}</p>
                <h3 className="fn-title">{n.title}</h3>
              </div>
            </article>
          ))}
          <div className="fn-view-all">
            <button className="view-all-btn">VIEW<br />NEWS</button>
          </div>
        </div>
      </div>

      {/* FOOTER MAIN */}
      <div className="footer-main">
        <div className="footer-inner">

          <div className="footer-logo" onClick={() => navigate("/")}>
            <div className="logo-badge">
              <span className="logo-4">4</span>
              <span className="logo-ps">Ps</span>
              <span className="logo-arr">▶</span>
            </div>
          </div>

          <nav className="footer-nav">
            <a href="#">Company Profile</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Career</a>
            <a href="#">E-Invoice</a>
          </nav>

          <div className="footer-social">
            <p className="social-label">Follow Us!</p>
            <div className="social-icons">
              {[
                ["YT",  "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"],
                ["IG",  "M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"],
                ["FB",  "M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.9v2.2h3.3l-.5 3.5h-2.8V24C19.6 23.1 24 18.1 24 12.1z"],
              ].map(([label, path]) => (
                <a key={label} href="#" aria-label={label}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <div className="footer-contact">
            <span><strong>For Inquiry</strong> info@pizza4ps.com</span>
            <span><strong>For Feedback</strong> feedback@pizza4ps.com</span>
          </div>
          <span className="footer-copy">© 2024 Hải SAPA</span>
        </div>
      </div>

    </footer>
  )
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function Menu() {
  const [activeSection, setActiveSection] = useState(null)
  const sectionRefs = useRef({})

  /* sticky category nav highlight */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveSection(e.target.dataset.id)
        })
      },
      { rootMargin: "-40% 0px -40% 0px" }
    )
    Object.values(sectionRefs.current).forEach(el => { if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  function scrollTo(id) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="menu-page">

      {/* HERO TITLE */}
      <div className="menu-hero">
        <h1 className="menu-hero-title">Menu</h1>
      </div>

      {/* STICKY CATEGORY NAV */}
      <nav className="category-nav">
        {MENU.map(s => (
          <button
            key={s.id}
            className={`cat-btn ${activeSection === s.id ? "active" : ""}`}
            onClick={() => scrollTo(s.id)}
          >
            {s.category}
          </button>
        ))}
      </nav>

      {/* MENU SECTIONS */}
      <div className="menu-sections">
        {MENU.map(section => (
          <section
            key={section.id}
            className="menu-section"
            data-id={section.id}
            ref={el => sectionRefs.current[section.id] = el}
          >
            <div className="section-header">
              <h2 className="section-title">{section.category}</h2>
            </div>

            <DragScrollRow items={section.items} />

            {/* Others row for drinks */}
            {section.others && (
              <div className="others-row">
                <span className="others-label">Others</span>
                <div className="others-list">
                  {section.others.map((o, i) => (
                    <span key={i} className="other-item">
                      {o.name} <strong>{o.price} vnd</strong>
                      {i < section.others.length - 1 && <span className="other-sep"> · </span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  )
}
