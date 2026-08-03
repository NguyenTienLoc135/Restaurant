import { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import "./OrderMenu.css"

const CATEGORIES = [
  { key: "all",       label: "Tất cả" },
  { key: "appetizers",label: "Khai vị" },
  { key: "pizza",     label: "Pizza" },
  { key: "pasta",     label: "Pasta & Món chính" },
  { key: "desserts",  label: "Tráng miệng" },
  { key: "drinks",    label: "Đồ uống" },
]

const SORT_TABS = [
  { key: "default",    label: "Mặc định" },
  { key: "price_asc",  label: "Giá tăng dần ↑" },
  { key: "price_desc", label: "Giá giảm dần ↓" },
]

const BADGE_COLOR = {
  "Bán chạy":  "#c8a96e",
  "Đặc biệt":  "#1a3f7a",
  "Mới":        "#22c55e",
  "Thuần chay": "#16a34a",
  "Signature":  "#7c3aed",
}

const PRODUCTS = [
  // ── KHAI VỊ ──
  { id: 1,  cat: "appetizers", name: "Các loại phô mai nhà làm (S)", desc: "Phô mai tươi tự làm hàng ngày, dùng kèm bánh mì nướng và mứt trái cây", price: 109000, badge: null, img: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=500&q=80" },
  { id: 2,  cat: "appetizers", name: "Các loại phô mai nhà làm (L)", desc: "Phô mai tươi tự làm hàng ngày, dùng kèm bánh mì nướng và mứt trái cây", price: 198000, badge: null, img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a318?w=500&q=80" },
  { id: 3,  cat: "appetizers", name: "Set thịt nguội và phô mai (Nhỏ)", desc: "Tổng hợp thịt nguội nhập khẩu, phô mai nhà làm và bánh mì nướng giòn", price: 172000, badge: null, img: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&q=80" },
  { id: 4,  cat: "appetizers", name: "Set thịt nguội và phô mai (Lớn)", desc: "Tổng hợp thịt nguội nhập khẩu, phô mai nhà làm và bánh mì nướng giòn", price: 334000, badge: "Bán chạy", img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80" },
  { id: 5,  cat: "appetizers", name: "Salad Caesar tôm nướng", desc: "Tôm sú nướng bơ tỏi, xà lách romaine, sốt Caesar nhà làm, bánh crouton", price: 145000, badge: null, img: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&q=80" },
  { id: 6,  cat: "appetizers", name: "Salad rau hỗn hợp 4P's", desc: "Rau organic Đà Lạt, dressing balsamic mật ong, hạt rang, phô mai parmesan vụn", price: 118000, badge: "Thuần chay", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80" },
  { id: 7,  cat: "appetizers", name: "Bruschetta phô mai tươi", desc: "Bánh mì nướng giòn, cà chua bi, phô mai tươi nhà làm, dầu ô liu, lá basil", price: 95000, badge: null, img: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500&q=80" },
  { id: 8,  cat: "appetizers", name: "Soup bí đỏ nhà làm", desc: "Bí đỏ Đà Lạt hầm với kem tươi, hành tây caramel, bánh mì nướng bơ", price: 88000, badge: null, img: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=500&q=80" },

  // ── PIZZA ──
  { id: 9,  cat: "pizza", name: "Pizza Tôm sốt tỏi cay", desc: "Tôm sú, sốt tỏi ớt cay, phô mai mozzarella, ngò gai, chanh tươi", price: 254000, badge: "Bán chạy", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80" },
  { id: 10, cat: "pizza", name: "Phô mai Burrata thịt nguội", desc: "Phô mai burrata tươi, prosciutto Parma, cà chua cherry, dầu ô liu truffle", price: 298000, badge: "Đặc biệt", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80" },
  { id: 11, cat: "pizza", name: "Thịt nguội Ý Parma & rau rocket", desc: "Prosciutto di Parma, rau rocket, parmesan bào mỏng, dầu ô liu extra virgin", price: 331000, badge: "Signature", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80" },
  { id: 12, cat: "pizza", name: "Pizza Margherita xúc xích cay", desc: "Sốt cà chua San Marzano, mozzarella tươi, xúc xích cay Ý, lá basil", price: 238000, badge: null, img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80" },
  { id: 13, cat: "pizza", name: "Pizza 4 loại phô mai nhà làm", desc: "Mozzarella, brie, gorgonzola, parmesan — tất cả làm tại nhà bếp 4P's", price: 276000, badge: "Bán chạy", img: "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=500&q=80" },
  { id: 14, cat: "pizza", name: "Pizza rau củ nướng & pesto", desc: "Rau củ organic Đà Lạt nướng, sốt pesto húng quế, phô mai dê, hạt thông", price: 218000, badge: "Thuần chay", img: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80" },
  { id: 15, cat: "pizza", name: "Pizza Diavola salami cay", desc: "Salami cay nhập khẩu, ớt jalapeño, sốt cà chua cay, mozzarella, olive đen", price: 265000, badge: null, img: "https://images.unsplash.com/photo-1539982703440-68f589f86e4f?w=500&q=80" },

  // ── PASTA & MÓN CHÍNH ──
  { id: 16, cat: "pasta", name: "Mì Ý nghêu và xốt quế tây", desc: "Nghêu tươi, tỏi, rượu trắng, sốt cà chua cherry, mì linguine nhà làm", price: 165000, badge: null, img: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&q=80" },
  { id: 17, cat: "pasta", name: "Mì Ý xốt kem cua và cà chua", desc: "Cua hoàng đế, kem tươi, cà chua tươi, tỏi, mì tagliatelle nhà làm", price: 254000, badge: "Bán chạy", img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80" },
  { id: 18, cat: "pasta", name: "Fettuccine nhà làm xốt kem cá hồi", desc: "Cá hồi Na Uy áp chảo, kem tươi, dill tươi, capers, mì fettuccine tươi", price: 194000, badge: null, img: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=500&q=80" },
  { id: 19, cat: "pasta", name: "Mì Ý bò bằm phô mai hun khói", desc: "Thịt bò bằm nướng than, phô mai hun khói nhà làm, sốt cà chua đặc", price: 210000, badge: null, img: "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=500&q=80" },
  { id: 20, cat: "pasta", name: "Cá hồi áp chảo sốt bơ chanh", desc: "Cá hồi Na Uy phi lê 180g, bơ chanh tươi, rau củ nướng, khoai tây nghiền", price: 325000, badge: "Đặc biệt", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80" },
  { id: 21, cat: "pasta", name: "Bò Wagyu áp chảo khoai tây", desc: "Bò Wagyu Nhật 150g, khoai tây chiên giòn, sốt demi-glace, rau salad tươi", price: 485000, badge: "Signature", img: "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80" },

  // ── TRÁNG MIỆNG ──
  { id: 22, cat: "desserts", name: "Tiramisu phô mai nhà làm", desc: "Mascarpone nhà làm, bánh ladyfinger thấm espresso, cacao Valrhona", price: 115000, badge: "Bán chạy", img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80" },
  { id: 23, cat: "desserts", name: "Bánh mousse chanh leo", desc: "Mousse chanh leo, lớp sablé bơ giòn, kem tươi đánh bông, mint tươi", price: 98000, badge: null, img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80" },
  { id: 24, cat: "desserts", name: "Kem phô mai 4P's", desc: "Kem phô mai tươi nhà làm, coulis dâu tây, wafer giòn, bạc hà", price: 78000, badge: null, img: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&q=80" },
  { id: 25, cat: "desserts", name: "Bánh Panna Cotta vanilla", desc: "Panna cotta vanilla Madagascar, sốt caramel mặn, hoa quả tươi theo mùa", price: 88000, badge: null, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80" },
  { id: 26, cat: "desserts", name: "Chocolate Lava Cake", desc: "Bánh socola nóng nhân chảy, kem vanilla, bột cacao, dâu tây tươi", price: 105000, badge: "Đặc biệt", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80" },
  { id: 27, cat: "desserts", name: "Sorbet trái cây tươi", desc: "Sorbet xoài, chanh leo hoặc dâu — làm tươi hàng ngày từ trái cây Việt Nam", price: 72000, badge: "Thuần chay", img: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500&q=80" },

  // ── ĐỒ UỐNG ──
  { id: 28, cat: "drinks", name: "Bia 4P's Yuzu Wheat (4.8%)", desc: "Bia craft nhà làm hương yuzu Nhật, nhẹ nhàng và thơm mát", price: 98000, badge: "Mới", img: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&q=80" },
  { id: 29, cat: "drinks", name: "Bia 4P's Whey Cider (5.5%)", desc: "Cider craft từ táo và whey phô mai, độc đáo chỉ có tại 4P's", price: 98000, badge: "Signature", img: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500&q=80" },
  { id: 30, cat: "drinks", name: "4P's Session IPA (4.5%)", desc: "IPA nhẹ vị hoa bia citra, uống dễ chịu kèm pizza hoặc pasta", price: 85000, badge: null, img: "https://images.unsplash.com/photo-1569944565098-4d69d0d2dd83?w=500&q=80" },
  { id: 31, cat: "drinks", name: "Rượu vang đỏ Ý nhà làm", desc: "Vang đỏ tuyển chọn từ vùng Tuscany, hương anh đào và gỗ sồi", price: 145000, badge: null, img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&q=80" },
  { id: 32, cat: "drinks", name: "Cocktail Negroni 4P's", desc: "Gin, Campari, vermouth đỏ, vỏ cam tươi — phong cách Ý cổ điển", price: 155000, badge: null, img: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&q=80" },
  { id: 33, cat: "drinks", name: "Classic Mojito", desc: "Rum trắng, chanh tươi, lá bạc hà, đường mía, soda — thanh mát ngày hè", price: 112000, badge: "Bán chạy", img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80" },
]

function highlight(text, query) {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="om-hl">{part}</mark> : part
  )
}

export default function OrderMenu() {
  const [cat,         setCat]         = useState("all")
  const [sort,        setSort]        = useState("default")
  const [search,      setSearch]      = useState("")
  const [showSuggest, setShowSuggest] = useState(false)
  const { addItem, totalItems, subtotal } = useCart()
  const [added, setAdded] = useState({})
  const navigate  = useNavigate()
  const searchRef = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggest(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const suggestions = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [search])

  let filtered = cat === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat)
  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    )
  }
  if (sort === "price_asc")  filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === "price_desc") filtered = [...filtered].sort((a, b) => b.price - a.price)

  function handleAdd(p) {
    addItem(p)
    setAdded(prev => ({ ...prev, [p.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [p.id]: false })), 800)
  }

  function pickSuggestion(p) { setSearch(p.name); setShowSuggest(false) }
  function clearSearch()      { setSearch(""); setShowSuggest(false) }

  return (
    <div className="om-page">

      {/* ══ HEADER ══ */}
      <div className="om-header">
        <div className="om-header-inner">
          <div>
            <span className="om-eyebrow">Đặt hàng giao về nhà</span>
            <h1 className="om-title">Chọn món<br /><em>của bạn</em></h1>
          </div>
          <button
            className={`om-cart-btn ${totalItems > 0 ? "has-items" : ""}`}
            onClick={() => navigate("/cart")}
            disabled={totalItems === 0}
          >
            <span className="om-cart-icon">🛒</span>
            <span className="om-cart-info">
              <span className="om-cart-count">{totalItems} món</span>
              <span className="om-cart-price">{subtotal.toLocaleString("vi-VN")}₫</span>
            </span>
            <span className="om-cart-arrow">→</span>
          </button>
        </div>

        {/* SEARCH */}
        <div className="om-search-row">
          <div className="om-search-box" ref={searchRef}>
            <div className={`om-search-wrap ${showSuggest && suggestions.length ? "open" : ""}`}>
              <svg className="om-search-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="om-search-input"
                type="text"
                placeholder="Tìm tên món, nguyên liệu..."
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSuggest(true) }}
                onFocus={() => setShowSuggest(true)}
              />
              {search && <button className="om-search-clear" onClick={clearSearch}>✕</button>}
            </div>

            {showSuggest && suggestions.length > 0 && (
              <div className="om-suggest-dropdown">
                {suggestions.map(p => (
                  <button key={p.id} className="om-suggest-item" onMouseDown={() => pickSuggestion(p)}>
                    <img src={p.img} alt="" className="om-suggest-img" />
                    <span className="om-suggest-name">{highlight(p.name, search)}</span>
                    <span className="om-suggest-price">{p.price.toLocaleString("vi-VN")}₫</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="om-tabs">
          {CATEGORIES.map(c => (
            <button key={c.key} className={`om-tab ${cat === c.key ? "active" : ""}`} onClick={() => setCat(c.key)}>
              {c.label}
            </button>
          ))}
        </div>

        {/* SORT TABS */}
        <div className="om-sort-bar">
          <span className="om-sort-label">SẮP XẾP:</span>
          {SORT_TABS.map(s => (
            <button key={s.key} className={`om-sort-tab ${sort === s.key ? "active" : ""}`} onClick={() => setSort(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ GRID ══ */}
      <div className="om-grid-wrap">
        {filtered.length === 0 ? (
          <div className="om-no-result">
            <span>🍽️</span>
            <p>Không tìm thấy món <strong>"{search}"</strong></p>
            <button onClick={clearSearch}>Xóa tìm kiếm</button>
          </div>
        ) : (
          <div className="om-grid">
            {filtered.map(p => (
              <div key={p.id} className="om-card">
                <div className="om-card-img">
                  <img src={p.img} alt={p.name} draggable="false" />
                  {p.badge && (
                    <span className="om-badge" style={{ background: BADGE_COLOR[p.badge] || "#c8a96e" }}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="om-card-body">
                  <h3 className="om-card-name">{highlight(p.name, search)}</h3>
                  <p className="om-card-desc">{highlight(p.desc, search)}</p>
                  <div className="om-card-footer">
                    <span className="om-price">{p.price.toLocaleString("vi-VN")}₫</span>
                    <button
                      className={`om-add-btn ${added[p.id] ? "added" : ""}`}
                      onClick={() => handleAdd(p)}
                    >
                      {added[p.id] ? "✓" : "+"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="om-sticky-cart" onClick={() => navigate("/cart")}>
          <span>🛒 {totalItems} món</span>
          <span>Xem giỏ hàng →</span>
          <span>{subtotal.toLocaleString("vi-VN")}₫</span>
        </div>
      )}
    </div>
  )
}
