import { useMemo, useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useMenu } from "../../context/MenuContext"
import { MENU_STATUS } from "../../data/menuData"
import "./OrderMenu.css"

const SORT_TABS = [
  { key: "default", label: "Mặc định" },
  { key: "price_asc", label: "Giá tăng dần ↑" },
  { key: "price_desc", label: "Giá giảm dần ↓" },
]

const BADGE_COLOR = {
  "Bán chạy": "#c8a96e",
  "Đặc biệt": "#1a3f7a",
  "Mới": "#22c55e",
  "Thuần chay": "#16a34a",
  Signature: "#7c3aed",
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
  const { categories, items, searchItems } = useMenu()
  const [cat, setCat] = useState("all")
  const [availability, setAvailability] = useState("true")
  const [sort, setSort] = useState("default")
  const [search, setSearch] = useState("")
  const [showSuggest, setShowSuggest] = useState(false)
  const { addItem, totalItems, subtotal } = useCart()
  const [added, setAdded] = useState({})
  const navigate = useNavigate()
  const searchRef = useRef(null)

  const PRICE_MAX = useMemo(() => {
    if (!items.length) return 500000
    return Math.ceil(Math.max(...items.map(item => item.price)) / 50000) * 50000
  }, [items])

  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(PRICE_MAX)

  useEffect(() => {
    setPriceMax(PRICE_MAX)
  }, [PRICE_MAX])

  const minPct = (priceMin / PRICE_MAX) * 100
  const maxPct = (priceMax / PRICE_MAX) * 100
  const isPriceFiltered = priceMin > 0 || priceMax < PRICE_MAX

  function handleMinChange(event) {
    const value = Number(event.target.value)
    if (value <= priceMax - 50000) setPriceMin(value)
  }

  function handleMaxChange(event) {
    const value = Number(event.target.value)
    if (value >= priceMin + 50000) setPriceMax(value)
  }

  function resetPrice() {
    setPriceMin(0)
    setPriceMax(PRICE_MAX)
  }

  useEffect(() => {
    function handler(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggest(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const builder = {
    name: search,
    category: cat === "all" ? "" : cat,
    leftPrice: priceMin,
    rightPrice: priceMax,
    isAvailable: availability,
  }

  const suggestions = useMemo(() => {
    if (!search.trim()) return []
    return searchItems(builder).slice(0, 8)
  }, [builder.category, builder.isAvailable, builder.leftPrice, builder.name, builder.rightPrice, searchItems, search])

  let filtered = searchItems(builder)
  if (sort === "price_asc") filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === "price_desc") filtered = [...filtered].sort((a, b) => b.price - a.price)

  function handleAdd(item) {
    if (item.status === MENU_STATUS.outOfStock) return
    addItem(item)
    setAdded(prev => ({ ...prev, [item.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [item.id]: false })), 800)
  }

  function clearAll() {
    setSearch("")
    setCat("all")
    setAvailability("true")
    resetPrice()
  }

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

        <div className="om-search-row">
          <div className="om-search-box" ref={searchRef}>
            <div className={`om-search-wrap ${showSuggest && suggestions.length ? "open" : ""}`}>
              <input
                className="om-search-input"
                type="text"
                placeholder="Tìm tên món, nguyên liệu..."
                value={search}
                onChange={event => { setSearch(event.target.value); setShowSuggest(true) }}
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

        <div className="om-tabs">
          <button className={`om-tab ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>Tất cả</button>
          {categories.map(category => (
            <button key={category.key} className={`om-tab ${cat === category.key ? "active" : ""}`} onClick={() => setCat(category.key)}>
              {category.label}
            </button>
          ))}
        </div>

        <div className="om-tabs" style={{ paddingTop: 0 }}>
          <button className={`om-tab ${availability === "" ? "active" : ""}`} onClick={() => setAvailability("")}>Tất cả trạng thái</button>
          <button className={`om-tab ${availability === "true" ? "active" : ""}`} onClick={() => setAvailability("true")}>Có sẵn</button>
          <button className={`om-tab ${availability === "false" ? "active" : ""}`} onClick={() => setAvailability("false")}>Hết món</button>
        </div>

        <div className="om-sort-bar">
          <span className="om-sort-label">SẮP XẾP:</span>
          {SORT_TABS.map(item => (
            <button key={item.key} className={`om-sort-tab ${sort === item.key ? "active" : ""}`} onClick={() => setSort(item.key)}>
              {item.label}
            </button>
          ))}

          <div className="om-sort-divider" />

          <div className="om-price-range">
            <span className="om-price-label">Khoảng giá:</span>
            <span className="om-price-val om-price-min">{priceMin.toLocaleString("vi-VN")}₫</span>

            <div className="om-slider-wrap">
              <div className="om-slider-track">
                <div className="om-slider-fill" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
              </div>
              <input type="range" className="om-slider om-slider-min" min={0} max={PRICE_MAX} step={10000} value={priceMin} onChange={handleMinChange} />
              <input type="range" className="om-slider om-slider-max" min={0} max={PRICE_MAX} step={10000} value={priceMax} onChange={handleMaxChange} />
            </div>

            <span className="om-price-val">{priceMax.toLocaleString("vi-VN")}₫</span>

            {isPriceFiltered && (
              <button className="om-price-reset" onClick={resetPrice}>Reset</button>
            )}
          </div>
        </div>
      </div>

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
              <div key={item.id} className="om-card" style={{ opacity: item.status === MENU_STATUS.outOfStock ? 0.75 : 1 }}>
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
