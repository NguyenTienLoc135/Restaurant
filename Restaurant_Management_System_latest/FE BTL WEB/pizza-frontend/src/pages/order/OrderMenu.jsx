import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useLanguage } from "../../context/LanguageContext"
import { useMenu } from "../../context/MenuContext"
import { MENU_STATUS } from "../../data/menuData"
import { getMenuBadgeLabel, getMenuCategoryLabel, getMenuStatusLabel } from "../../i18n/userText"
import "./OrderMenu.css"

const SORT_TABS = ["default", "price_asc", "price_desc"]

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
  const { addItem, totalItems, subtotal } = useCart()
  const { language, isEnglish } = useLanguage()
  const navigate = useNavigate()
  const searchRef = useRef(null)

  const text = isEnglish
    ? {
        eyebrow: "Delivery order",
        title: "Choose your dishes",
        cartItems: "items",
        searchPlaceholder: "Search dishes or ingredients...",
        all: "All",
        allStatuses: "All statuses",
        available: "Available",
        outOfStock: "Out of stock",
        sortLabel: "SORT:",
        sort: {
          default: "Default",
          price_asc: "Price low to high ↑",
          price_desc: "Price high to low ↓",
        },
        priceRange: "Price range:",
        reset: "Reset",
        noResult: "No matching dishes found",
        clearFilters: "Clear filters",
        viewCart: "View cart →",
      }
    : {
        eyebrow: "Đặt hàng giao về nhà",
        title: "Chọn món của bạn",
        cartItems: "món",
        searchPlaceholder: "Tìm tên món, nguyên liệu...",
        all: "Tất cả",
        allStatuses: "Tất cả trạng thái",
        available: "Có sẵn",
        outOfStock: "Hết món",
        sortLabel: "SẮP XẾP:",
        sort: {
          default: "Mặc định",
          price_asc: "Giá tăng dần ↑",
          price_desc: "Giá giảm dần ↓",
        },
        priceRange: "Khoảng giá:",
        reset: "Reset",
        noResult: "Không tìm thấy món phù hợp",
        clearFilters: "Xóa bộ lọc",
        viewCart: "Xem giỏ hàng →",
      }

  const [cat, setCat] = useState("all")
  const [availability, setAvailability] = useState("true")
  const [sort, setSort] = useState("default")
  const [search, setSearch] = useState("")
  const [showSuggest, setShowSuggest] = useState(false)
  const [added, setAdded] = useState({})

  const priceMaxLimit = useMemo(() => {
    if (!items.length) return 500000
    return Math.ceil(Math.max(...items.map(item => item.price)) / 50000) * 50000
  }, [items])

  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(priceMaxLimit)

  useEffect(() => {
    setPriceMax(priceMaxLimit)
  }, [priceMaxLimit])

  const minPct = (priceMin / priceMaxLimit) * 100
  const maxPct = (priceMax / priceMaxLimit) * 100
  const isPriceFiltered = priceMin > 0 || priceMax < priceMaxLimit

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggest(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
    setPriceMax(priceMaxLimit)
  }

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
            <span className="om-eyebrow">{text.eyebrow}</span>
            <h1 className="om-title">{text.title}</h1>
          </div>
          <button
            className={`om-cart-btn ${totalItems > 0 ? "has-items" : ""}`}
            onClick={() => navigate("/cart")}
            disabled={totalItems === 0}
          >
            <span className="om-cart-icon">🛒</span>
            <span className="om-cart-info">
              <span className="om-cart-count">{totalItems} {text.cartItems}</span>
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
                placeholder={text.searchPlaceholder}
                value={search}
                onChange={event => {
                  setSearch(event.target.value)
                  setShowSuggest(true)
                }}
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
          <button className={`om-tab ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>{text.all}</button>
          {categories.map(category => (
            <button key={category.key} className={`om-tab ${cat === category.key ? "active" : ""}`} onClick={() => setCat(category.key)}>
              {getMenuCategoryLabel(category.key, language)}
            </button>
          ))}
        </div>

        <div className="om-tabs" style={{ paddingTop: 0 }}>
          <button className={`om-tab ${availability === "" ? "active" : ""}`} onClick={() => setAvailability("")}>{text.allStatuses}</button>
          <button className={`om-tab ${availability === "true" ? "active" : ""}`} onClick={() => setAvailability("true")}>{text.available}</button>
          <button className={`om-tab ${availability === "false" ? "active" : ""}`} onClick={() => setAvailability("false")}>{text.outOfStock}</button>
        </div>

        <div className="om-sort-bar">
          <span className="om-sort-label">{text.sortLabel}</span>
          {SORT_TABS.map(item => (
            <button key={item} className={`om-sort-tab ${sort === item ? "active" : ""}`} onClick={() => setSort(item)}>
              {text.sort[item]}
            </button>
          ))}

          <div className="om-sort-divider" />

          <div className="om-price-range">
            <span className="om-price-label">{text.priceRange}</span>
            <span className="om-price-val om-price-min">{priceMin.toLocaleString("vi-VN")}₫</span>

            <div className="om-slider-wrap">
              <div className="om-slider-track">
                <div className="om-slider-fill" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
              </div>
              <input type="range" className="om-slider om-slider-min" min={0} max={priceMaxLimit} step={10000} value={priceMin} onChange={handleMinChange} />
              <input type="range" className="om-slider om-slider-max" min={0} max={priceMaxLimit} step={10000} value={priceMax} onChange={handleMaxChange} />
            </div>

            <span className="om-price-val">{priceMax.toLocaleString("vi-VN")}₫</span>

            {isPriceFiltered && (
              <button className="om-price-reset" onClick={resetPrice}>{text.reset}</button>
            )}
          </div>
        </div>
      </div>

      <div className="om-grid-wrap">
        {filtered.length === 0 ? (
          <div className="om-no-result">
            <span>🍽️</span>
            <p>{text.noResult}</p>
            <button onClick={clearAll}>{text.clearFilters}</button>
          </div>
        ) : (
          <div className="om-grid">
            {filtered.map(item => (
              <div key={item.id} className="om-card" style={{ opacity: item.status === MENU_STATUS.outOfStock ? 0.75 : 1 }}>
                <div className="om-card-img">
                  <img src={item.img} alt={item.name} draggable="false" />
                  {item.badge && (
                    <span className="om-badge" style={{ background: BADGE_COLOR[item.badge] || "#c8a96e" }}>
                      {getMenuBadgeLabel(item.badge, language)}
                    </span>
                  )}
                  {item.status === MENU_STATUS.outOfStock && (
                    <span className="om-badge" style={{ background: "#991b1b", left: "auto", right: 14 }}>
                      {getMenuStatusLabel("out_of_stock", language)}
                    </span>
                  )}
                </div>
                <div className="om-card-body">
                  <span className="om-card-category">{getMenuCategoryLabel(item.cat, language)}</span>
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
          <span>🛒 {totalItems} {text.cartItems}</span>
          <span>{text.viewCart}</span>
          <span>{subtotal.toLocaleString("vi-VN")}₫</span>
        </div>
      )}
    </div>
  )
}

