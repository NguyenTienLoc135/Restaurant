import { useMemo, useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useMenu } from "../../context/MenuContext"
import { MENU_STATUS } from "../../data/menuData"
import "./OrderMenu.css"

const ALL_PRICES = [109000,198000,172000,334000,145000,118000,95000,88000,254000,298000,331000,238000,276000,218000,265000,165000,254000,194000,210000,325000,485000,115000,98000,78000,88000,105000,72000,98000,98000,85000,85000,145000,155000,112000]
const OM_PRICE_MAX = Math.ceil(Math.max(...ALL_PRICES) / 50000) * 50000

const SORT_TABS = [
  { key: "default",    label: "Mặc định" },
  { key: "price_asc",  label: "Giá tăng dần ↑" },
  { key: "price_desc", label: "Giá giảm dần ↓" },
]

const BADGE_COLOR = {
  "Bán chạy": "#c8a96e", "Đặc biệt": "#1a3f7a",
  "Mới": "#22c55e", "Thuần chay": "#16a34a", Signature: "#7c3aed",
}

function highlight(text, query) {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  return text.split(regex).map((part, index) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={index} className="om-hl">{part}</mark>
      : part
  )
}

export default function OrderMenu() {
  const { categories, items } = useMenu()
  const [cat,        setCat]        = useState("all")
  const [sort,       setSort]       = useState("default")
  const [search,     setSearch]     = useState("")
  const [showSuggest,setShowSuggest]= useState(false)
  const { addItem, totalItems, subtotal } = useCart()
  const [added,      setAdded]      = useState({})
  const navigate  = useNavigate()
  const searchRef = useRef(null)

  // ── price range ──
  const PRICE_MAX = useMemo(() => {
    if (!items.length) return 500000
    return Math.ceil(Math.max(...items.map(i => i.price)) / 50000) * 50000
  }, [items])

  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(PRICE_MAX)

  // sync khi PRICE_MAX thay đổi (data load)
  useEffect(() => { setPriceMax(PRICE_MAX) }, [PRICE_MAX])

  const minPct = (priceMin / PRICE_MAX) * 100
  const maxPct = (priceMax / PRICE_MAX) * 100
  const isPriceFiltered = priceMin > 0 || priceMax < PRICE_MAX

  function handleMinChange(e) {
    const v = Number(e.target.value)
    if (v <= priceMax - 50000) setPriceMin(v)
  }
  function handleMaxChange(e) {
    const v = Number(e.target.value)
    if (v >= priceMin + 50000) setPriceMax(v)
  }
  function resetPrice() { setPriceMin(0); setPriceMax(PRICE_MAX) }

  useEffect(() => {
    function handler(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggest(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const suggestions = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return items.filter(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)).slice(0, 8)
  }, [items, search])

  let filtered = cat === "all" ? items : items.filter(i => i.cat === cat)
  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
  }
  filtered = filtered.filter(i => i.price >= priceMin && i.price <= priceMax)
  if (sort === "price_asc")  filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === "price_desc") filtered = [...filtered].sort((a, b) => b.price - a.price)

  function handleAdd(item) {
    if (item.status === MENU_STATUS.outOfStock) return
    addItem(item)
    setAdded(prev => ({ ...prev, [item.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [item.id]: false })), 800)
  }

  function clearAll() { setSearch(""); setCat("all"); resetPrice() }

  return (
    <div className="om-page">
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
              <input
                className="om-search-input" type="text"
                placeholder="Tìm tên món, nguyên liệu..."
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSuggest(true) }}
                onFocus={() => setShowSuggest(true)}
              />
              {search && (
                <button className="om-search-clear" onClick={() => { setSearch(""); setShowSuggest(false) }}>✕</button>
              )}
            </div>
            {showSuggest && suggestions.length > 0 && (
              <div className="om-suggest-dropdown">
                {suggestions.map(item => (
                  <button key={item.id} className="om-suggest-item" onMouseDown={() => { setSearch(item.name); setShowSuggest(false) }}>
                    <img src={item.img} alt="" className="om-suggest-img" />
                    <span className="om-suggest-name">{highlight(item.name, search)}</span>
                    <span className="om-suggest-price">{item.price.toLocaleString("vi-VN")}₫</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="om-tabs">
          <button className={`om-tab ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>Tất cả</button>
          {categories.map(c => (
            <button key={c.key} className={`om-tab ${cat === c.key ? "active" : ""}`} onClick={() => setCat(c.key)}>
              {c.label}
            </button>
          ))}
        </div>

        {/* SORT + PRICE RANGE */}
        <div className="om-sort-bar">
          <span className="om-sort-label">SẮP XẾP:</span>
          {SORT_TABS.map(s => (
            <button key={s.key} className={`om-sort-tab ${sort === s.key ? "active" : ""}`} onClick={() => setSort(s.key)}>
              {s.label}
            </button>
          ))}

          {/* Divider */}
          <div className="om-sort-divider" />

          {/* PRICE RANGE SLIDER */}
          <div className="om-price-range">
            <span className="om-price-label">Khoảng giá:</span>
            <span className="om-price-val om-price-min">{priceMin.toLocaleString("vi-VN")}₫</span>

            <div className="om-slider-wrap">
              <div className="om-slider-track">
                <div
                  className="om-slider-fill"
                  style={{ left: minPct + "%", width: (maxPct - minPct) + "%" }}
                />
              </div>
              <input
                type="range" className="om-slider om-slider-min"
                min={0} max={PRICE_MAX} step={10000}
                value={priceMin} onChange={handleMinChange}
              />
              <input
                type="range" className="om-slider om-slider-max"
                min={0} max={PRICE_MAX} step={10000}
                value={priceMax} onChange={handleMaxChange}
              />
            </div>

            <span className="om-price-val">{priceMax.toLocaleString("vi-VN")}₫</span>

            {isPriceFiltered && (
              <button className="om-price-reset" onClick={resetPrice}>Reset</button>
            )}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="om-grid-wrap">
        {filtered.length === 0 ? (
          <div className="om-no-result">
            <span>🍽️</span>
            <p>Không tìm thấy món phù hợp</p>
            <button onClick={clearAll}>Xóa bộ lọc</button>
          </div>
        ) : (
          <div className="om-grid">
            {filtered.map(item => (
              <div
                key={item.id}
                className="om-card"
                style={{ opacity: item.status === MENU_STATUS.outOfStock ? 0.75 : 1 }}
              >
                <div className="om-card-img">
                  <img src={item.img} alt={item.name} draggable="false" />
                  {item.badge && (
                    <span className="om-badge" style={{ background: BADGE_COLOR[item.badge] || "#c8a96e" }}>
                      {item.badge}
                    </span>
                  )}
                  {item.status === MENU_STATUS.outOfStock && (
                    <span className="om-badge" style={{ background: "#991b1b", left: "auto", right: 14 }}>Hết món</span>
                  )}
                </div>
                <div className="om-card-body">
                  <h3 className="om-card-name">{highlight(item.name, search)}</h3>
                  <p className="om-card-desc">{highlight(item.desc, search)}</p>
                  <div className="om-card-footer">
                    <span className="om-price">{item.price.toLocaleString("vi-VN")}₫</span>
                    <button
                      className={`om-add-btn ${added[item.id] ? "added" : ""}`}
                      onClick={() => handleAdd(item)}
                      disabled={item.status === MENU_STATUS.outOfStock}
                      style={item.status === MENU_STATUS.outOfStock ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                    >
                      {item.status === MENU_STATUS.outOfStock ? "!" : added[item.id] ? "✓" : "+"}
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
