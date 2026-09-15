import { useEffect, useMemo, useRef, useState } from "react"
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
  Mới: "#22c55e",
  "Thuần chay": "#16a34a",
  Signature: "#7c3aed",
}

function fmtPrice(price) {
  return `${price.toLocaleString("vi-VN")}₫`
}

function createDefaultFilters(priceMax) {
  return {
    cat: "all",
    availability: "true",
    sort: "default",
    search: "",
    priceMin: 0,
    priceMax,
  }
}

function sanitizeFilters(filters, nextPriceMax, previousPriceMax = nextPriceMax) {
  const priceMin = Math.min(Math.max(Number(filters.priceMin) || 0, 0), nextPriceMax)
  const rawMax = Number(filters.priceMax) || nextPriceMax
  const maxSource = rawMax === previousPriceMax ? nextPriceMax : rawMax
  const priceMax = Math.min(Math.max(maxSource, priceMin), nextPriceMax)

  return {
    cat: filters.cat || "all",
    availability: filters.availability ?? "true",
    sort: filters.sort || "default",
    search: (filters.search || "").trim(),
    priceMin,
    priceMax,
  }
}

function areFiltersEqual(left, right) {
  return (
    left.cat === right.cat &&
    left.availability === right.availability &&
    left.sort === right.sort &&
    left.search === right.search &&
    left.priceMin === right.priceMin &&
    left.priceMax === right.priceMax
  )
}

function highlight(text, query) {
  const source = text || ""
  if (!query.trim()) return source
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  return source.split(regex).map((part, index) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={index} className="om-hl">{part}</mark>
      : part
  )
}

export default function OrderMenu() {
  const { categories, items, searchItems } = useMenu()
  const { addItem, totalItems, subtotal } = useCart()
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const [showSuggest, setShowSuggest] = useState(false)
  const [added, setAdded] = useState({})

  const PRICE_MAX = useMemo(() => {
    if (!items.length) return 500000
    return Math.ceil(Math.max(...items.map(item => item.price)) / 50000) * 50000
  }, [items])

  const [draftFilters, setDraftFilters] = useState(() => createDefaultFilters(PRICE_MAX))
  const [appliedFilters, setAppliedFilters] = useState(() => createDefaultFilters(PRICE_MAX))
  const previousPriceMaxRef = useRef(PRICE_MAX)

  useEffect(() => {
    const previousPriceMax = previousPriceMaxRef.current
    setDraftFilters(prev => sanitizeFilters(prev, PRICE_MAX, previousPriceMax))
    setAppliedFilters(prev => sanitizeFilters(prev, PRICE_MAX, previousPriceMax))
    previousPriceMaxRef.current = PRICE_MAX
  }, [PRICE_MAX])

  useEffect(() => {
    function handler(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggest(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const draftBuilder = useMemo(
    () => ({
      name: draftFilters.search,
      category: draftFilters.cat === "all" ? "" : draftFilters.cat,
      leftPrice: draftFilters.priceMin,
      rightPrice: draftFilters.priceMax,
      isAvailable: draftFilters.availability,
    }),
    [draftFilters]
  )

  const appliedBuilder = useMemo(
    () => ({
      name: appliedFilters.search,
      category: appliedFilters.cat === "all" ? "" : appliedFilters.cat,
      leftPrice: appliedFilters.priceMin,
      rightPrice: appliedFilters.priceMax,
      isAvailable: appliedFilters.availability,
    }),
    [appliedFilters]
  )

  const suggestions = useMemo(() => {
    if (!draftFilters.search.trim()) return []
    return searchItems(draftBuilder).slice(0, 8)
  }, [draftBuilder, draftFilters.search, searchItems])

  const filtered = useMemo(() => {
    let nextItems = searchItems(appliedBuilder)
    if (appliedFilters.sort === "price_asc") {
      nextItems = [...nextItems].sort((left, right) => left.price - right.price)
    }
    if (appliedFilters.sort === "price_desc") {
      nextItems = [...nextItems].sort((left, right) => right.price - left.price)
    }
    return nextItems
  }, [appliedBuilder, appliedFilters.sort, searchItems])

  const hasPendingChanges = !areFiltersEqual(draftFilters, appliedFilters)
  const isPriceFiltered = draftFilters.priceMin > 0 || draftFilters.priceMax < PRICE_MAX
  const minPct = (draftFilters.priceMin / PRICE_MAX) * 100
  const maxPct = (draftFilters.priceMax / PRICE_MAX) * 100

  function updateDraftFilter(key, value) {
    setDraftFilters(prev => ({ ...prev, [key]: value }))
  }

  function handleMinChange(event) {
    const value = Number(event.target.value)
    if (value <= draftFilters.priceMax - 50000) {
      updateDraftFilter("priceMin", value)
    }
  }

  function handleMaxChange(event) {
    const value = Number(event.target.value)
    if (value >= draftFilters.priceMin + 50000) {
      updateDraftFilter("priceMax", value)
    }
  }

  function resetPrice() {
    setDraftFilters(prev => ({ ...prev, priceMin: 0, priceMax: PRICE_MAX }))
  }

  function applyFilters() {
    const nextFilters = sanitizeFilters(draftFilters, PRICE_MAX)
    setDraftFilters(nextFilters)
    setAppliedFilters(nextFilters)
    setShowSuggest(false)
  }

  function clearAll() {
    const defaults = createDefaultFilters(PRICE_MAX)
    setDraftFilters(defaults)
    setAppliedFilters(defaults)
    setShowSuggest(false)
  }

  function handleAdd(item) {
    if (item.status === MENU_STATUS.outOfStock) return
    addItem(item)
    setAdded(prev => ({ ...prev, [item.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [item.id]: false })), 800)
  }

  return (
    <div className="om-page">
      <div className="om-header">
        <div className="om-header-inner">
          <div>
            <span className="om-eyebrow">Đặt hàng giao về nhà</span>
            <h1 className="om-title">
              Chọn món
              <br />
              <em>của bạn</em>
            </h1>
          </div>

          <button
            className={`om-cart-btn ${totalItems > 0 ? "has-items" : ""}`}
            onClick={() => navigate("/cart")}
            disabled={totalItems === 0}
          >
            <span className="om-cart-icon">🛒</span>
            <span className="om-cart-info">
              <span className="om-cart-count">{totalItems} món</span>
              <span className="om-cart-price">{fmtPrice(subtotal)}</span>
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
                value={draftFilters.search}
                onChange={event => {
                  updateDraftFilter("search", event.target.value)
                  setShowSuggest(true)
                }}
                onFocus={() => setShowSuggest(true)}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    applyFilters()
                  }
                }}
              />
              {draftFilters.search && (
                <button
                  className="om-search-clear"
                  onClick={() => {
                    updateDraftFilter("search", "")
                    setShowSuggest(false)
                  }}
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  ✕
                </button>
              )}
              <button className="om-search-submit" onClick={applyFilters}>
                Search
              </button>
            </div>

            {showSuggest && suggestions.length > 0 && (
              <div className="om-suggest-dropdown">
                {suggestions.map(item => (
                  <button
                    key={item.id}
                    className="om-suggest-item"
                    onMouseDown={() => {
                      updateDraftFilter("search", item.name)
                      setShowSuggest(false)
                    }}
                  >
                    <img src={item.img} alt="" className="om-suggest-img" />
                    <span className="om-suggest-name">{highlight(item.name, draftFilters.search)}</span>
                    <span className="om-suggest-price">{fmtPrice(item.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="om-reset-btn"
            onClick={clearAll}
            title="Đặt lại bộ lọc"
            aria-label="Đặt lại bộ lọc"
          >
            ↻
          </button>
        </div>

        <div className="om-tabs">
          <button className={`om-tab ${draftFilters.cat === "all" ? "active" : ""}`} onClick={() => updateDraftFilter("cat", "all")}>
            Tất cả
          </button>
          {categories.map(category => (
            <button
              key={category.key}
              className={`om-tab ${draftFilters.cat === category.key ? "active" : ""}`}
              onClick={() => updateDraftFilter("cat", category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="om-tabs" style={{ paddingTop: 0 }}>
          <button className={`om-tab ${draftFilters.availability === "" ? "active" : ""}`} onClick={() => updateDraftFilter("availability", "")}>
            Tất cả trạng thái
          </button>
          <button className={`om-tab ${draftFilters.availability === "true" ? "active" : ""}`} onClick={() => updateDraftFilter("availability", "true")}>
            Có sẵn
          </button>
          <button className={`om-tab ${draftFilters.availability === "false" ? "active" : ""}`} onClick={() => updateDraftFilter("availability", "false")}>
            Hết món
          </button>
        </div>

        <div className="om-sort-bar">
          <span className="om-sort-label">SẮP XẾP:</span>
          {SORT_TABS.map(item => (
            <button
              key={item.key}
              className={`om-sort-tab ${draftFilters.sort === item.key ? "active" : ""}`}
              onClick={() => updateDraftFilter("sort", item.key)}
            >
              {item.label}
            </button>
          ))}

          <div className="om-sort-divider" />

          <div className="om-price-range">
            <span className="om-price-label">Khoảng giá:</span>
            <span className="om-price-val om-price-min">{fmtPrice(draftFilters.priceMin)}</span>

            <div className="om-slider-wrap">
              <div className="om-slider-track">
                <div className="om-slider-fill" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
              </div>
              <input type="range" className="om-slider om-slider-min" min={0} max={PRICE_MAX} step={10000} value={draftFilters.priceMin} onChange={handleMinChange} />
              <input type="range" className="om-slider om-slider-max" min={0} max={PRICE_MAX} step={10000} value={draftFilters.priceMax} onChange={handleMaxChange} />
            </div>

            <span className="om-price-val">{fmtPrice(draftFilters.priceMax)}</span>

            {isPriceFiltered && (
              <button className="om-price-reset" onClick={resetPrice}>
                Reset
              </button>
            )}
          </div>
        </div>

        {hasPendingChanges && (
          <div className="om-filter-hint">
            <span>Bạn đã thay đổi bộ lọc. Bấm Search để cập nhật kết quả.</span>
          </div>
        )}
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
                    <span className="om-badge" style={{ background: "#991b1b", left: "auto", right: 14 }}>
                      Hết món
                    </span>
                  )}
                </div>

                <div className="om-card-body">
                  <h3 className="om-card-name">{highlight(item.name, appliedFilters.search)}</h3>
                  <p className="om-card-desc">{highlight(item.desc, appliedFilters.search)}</p>
                  <div className="om-card-footer">
                    <span className="om-price">{fmtPrice(item.price)}</span>
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
          <span>{fmtPrice(subtotal)}</span>
        </div>
      )}
    </div>
  )
}
