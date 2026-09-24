import { useEffect, useMemo, useRef, useState } from "react"
import { useMenu } from "../../context/MenuContext"
import { MENU_STATUS } from "../../data/menuData"
import { getApiErrorMessage } from "../../services/apiClient"
import { fetchPublicItemDetailApi } from "../../services/menuApi"
import { normalizeMenuItemDetailResponse } from "../../services/responseAdapters"
import "./Menu.css"

const SORT_OPTIONS = [
  ["default", "Mặc định"],
  ["asc", "Giá tăng"],
  ["desc", "Giá giảm"],
]

const AVAILABILITY_OPTIONS = [
  ["", "Tất cả"],
  ["true", "Có sẵn"],
  ["false", "Hết món"],
]

function fmtPrice(price) {
  return `${price.toLocaleString("vi-VN")}₫`
}

function normalizeKeyword(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function createDefaultFilters(maxPrice) {
  return {
    search: "",
    category: "",
    availability: "",
    sort: "default",
    priceMin: 0,
    priceMax: maxPrice,
  }
}

function sanitizeFilters(filters, maxPrice, previousMaxPrice = maxPrice) {
  const nextMin = Math.min(Math.max(Number(filters.priceMin) || 0, 0), maxPrice)
  const rawMax = Number(filters.priceMax) || maxPrice
  const maxSource = rawMax === previousMaxPrice ? maxPrice : rawMax
  const nextMax = Math.min(Math.max(maxSource, nextMin), maxPrice)

  return {
    search: (filters.search || "").trim(),
    category: filters.category || "",
    availability: filters.availability || "",
    sort: filters.sort || "default",
    priceMin: nextMin,
    priceMax: nextMax,
  }
}

function hasActiveFilters(filters, maxPrice) {
  return (
    filters.search.trim() !== "" ||
    filters.category !== "" ||
    filters.availability !== "" ||
    filters.sort !== "default" ||
    filters.priceMin > 0 ||
    filters.priceMax < maxPrice
  )
}

function areFiltersEqual(left, right) {
  return (
    left.search === right.search &&
    left.category === right.category &&
    left.availability === right.availability &&
    left.sort === right.sort &&
    left.priceMin === right.priceMin &&
    left.priceMax === right.priceMax
  )
}

function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const currentLabel = options.find(([key]) => key === value)?.[1] || label

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div className="mc-dropdown" ref={dropdownRef}>
      <button className="mc-dropdown-trigger" onClick={() => setOpen(prev => !prev)}>
        <span className="mc-dropdown-label">{label}:</span>
        <span className="mc-dropdown-value">{currentLabel}</span>
        <span className={`mc-dropdown-arrow ${open ? "open" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="mc-dropdown-menu">
          {options.map(([key, optionLabel]) => (
            <button
              key={key || "all"}
              className={`mc-dropdown-item ${value === key ? "active" : ""}`}
              onClick={() => {
                onChange(key)
                setOpen(false)
              }}
            >
              {optionLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DishDetail({ item, loading, error, onClose }) {
  return (
    <div className="dish-detail-panel">
      <button className="dd-close" onClick={onClose} aria-label="Đóng chi tiết món">
        ×
      </button>
      <div className="dd-img-wrap">
        <img src={item.img} alt={item.name} draggable="false" />
        <div className="dd-img-overlay" />
      </div>
      <div className="dd-body">
        <span className="dd-cat">{item.catLabel}</span>
        <h3 className="dd-name">{item.name}</h3>
        <p className="dd-price">{fmtPrice(item.price)}</p>
        {item.status === MENU_STATUS.outOfStock && <p className="dd-stock dd-stock-out">Hết món</p>}
        {loading && <p className="dd-val">Đang tải chi tiết món...</p>}
        {error && <p className="dd-val dd-error">{error}</p>}

        {item.desc && (
          <div className="dd-story">
            <span className="dd-label">Mô tả</span>
            <p className="dd-story-text">{item.desc}</p>
          </div>
        )}
        {item.unit && (
          <div className="dd-row">
            <span className="dd-label">Đơn vị</span>
            <span className="dd-val">{item.unit}</span>
          </div>
        )}
        {!loading && !error && !item.desc && !item.unit && (
          <p className="dd-val">Chưa có thông tin chi tiết cho món này.</p>
        )}
      </div>
    </div>
  )
}

function DragScrollRow({ items }) {
  const viewportRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const didDrag = useRef(false)
  const [expanded, setExpanded] = useState(null)
  const [detailById, setDetailById] = useState({})
  const [detailLoadingById, setDetailLoadingById] = useState({})
  const [detailErrorById, setDetailErrorById] = useState({})

  async function loadItemDetail(item) {
    if (!item?.id || detailById[item.id] || detailLoadingById[item.id]) return

    setDetailLoadingById(prev => ({ ...prev, [item.id]: true }))
    setDetailErrorById(prev => ({ ...prev, [item.id]: "" }))

    try {
      const data = await fetchPublicItemDetailApi(item.id)
      const normalized = normalizeMenuItemDetailResponse({ ...item, ...data })
      setDetailById(prev => ({ ...prev, [item.id]: normalized }))
    } catch (apiError) {
      setDetailErrorById(prev => ({
        ...prev,
        [item.id]: getApiErrorMessage(apiError, "Không thể tải chi tiết món"),
      }))
    } finally {
      setDetailLoadingById(prev => ({ ...prev, [item.id]: false }))
    }
  }

  function onMouseDown(event) {
    isDragging.current = true
    didDrag.current = false
    startX.current = event.pageX - viewportRef.current.offsetLeft
    scrollLeft.current = viewportRef.current.scrollLeft
    viewportRef.current.style.cursor = "grabbing"
  }

  function onMouseMove(event) {
    if (!isDragging.current) return
    event.preventDefault()
    const x = event.pageX - viewportRef.current.offsetLeft
    const walk = (x - startX.current) * 1.2
    if (Math.abs(walk) > 4) didDrag.current = true
    viewportRef.current.scrollLeft = scrollLeft.current - walk
    if (Math.abs(walk) > 20 && expanded !== null) setExpanded(null)
  }

  function onMouseUp() {
    isDragging.current = false
    if (viewportRef.current) viewportRef.current.style.cursor = "grab"
  }

  function handleCardClick(index, item) {
    if (didDrag.current) return

    setExpanded(prev => {
      const nextExpanded = prev === index ? null : index
      if (nextExpanded !== null) {
        void loadItemDetail(item)
      }
      return nextExpanded
    })
  }

  return (
    <div
      className="scroll-viewport"
      ref={viewportRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={() => expanded !== null && setExpanded(null)}
    >
      <div className="scroll-track">
        {items.map((item, index) => (
          <div key={item.id} className={`dish-card-wrap ${expanded === index ? "is-expanded" : ""}`}>
            <div
              className={`dish-card ${expanded === index ? "hidden" : ""}`}
              onClick={() => handleCardClick(index, item)}
              style={{ opacity: item.status === MENU_STATUS.outOfStock ? 0.75 : 1 }}
            >
              <div className="dish-card-img">
                <img src={item.img} alt={item.name} loading="lazy" draggable="false" />
                <div className="dish-card-hover-hint">
                  <span>{item.status === MENU_STATUS.outOfStock ? "Tạm hết món" : "Xem chi tiết"}</span>
                </div>
                {item.status === MENU_STATUS.outOfStock && <span className="dish-card-badge">Hết món</span>}
              </div>
              <div className="dish-card-info">
                <h3 className="dish-card-name">{item.name}</h3>
                <p className="dish-card-price">{fmtPrice(item.price)}</p>
              </div>
            </div>

            {expanded === index && (
              <DishDetail
                item={detailById[item.id] || item}
                loading={!!detailLoadingById[item.id]}
                error={detailErrorById[item.id]}
                onClose={() => setExpanded(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function FilteredGrid({ items }) {
  return (
    <div className="filtered-section">
      <div className="filtered-header">
        <span className="filtered-count">{items.length} món</span>
      </div>
      {items.length === 0 ? (
        <div className="no-result">
          <p>Không tìm thấy món phù hợp.</p>
          <p>Hãy điều chỉnh bộ lọc hoặc bấm Đặt lại ở phía trên để thử lại.</p>
        </div>
      ) : (
        <div className="filtered-grid">
          {items.map(item => (
            <div key={item.id} className="fg-card" style={{ opacity: item.status === MENU_STATUS.outOfStock ? 0.7 : 1 }}>
              <div className="fg-img">
                <img src={item.img} alt={item.name} loading="lazy" />
              </div>
              <div className="fg-info">
                <span className="fg-cat">{item.catLabel}</span>
                <h3 className="fg-name">{item.name}</h3>
                <p className="fg-price">{fmtPrice(item.price)}</p>
                {item.status === MENU_STATUS.outOfStock && <p className="fg-stock-out">Hết món</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Menu() {
  const { groupedSections, items, categories, searchItems } = useMenu()
  const [activeSection, setActiveSection] = useState(null)
  const maxPrice = useMemo(
    () => Math.ceil((Math.max(...items.map(item => item.price), 0) || 500000) / 50000) * 50000,
    [items]
  )
  const [draftFilters, setDraftFilters] = useState(() => createDefaultFilters(maxPrice))
  const [appliedFilters, setAppliedFilters] = useState(() => createDefaultFilters(maxPrice))
  const [showSuggest, setShowSuggest] = useState(false)
  const [menuControlsHeight, setMenuControlsHeight] = useState(0)
  const sectionRefs = useRef({})
  const searchRef = useRef(null)
  const menuControlsRef = useRef(null)
  const previousMaxPriceRef = useRef(maxPrice)

  useEffect(() => {
    const previousMaxPrice = previousMaxPriceRef.current
    setDraftFilters(prev => sanitizeFilters(prev, maxPrice, previousMaxPrice))
    setAppliedFilters(prev => sanitizeFilters(prev, maxPrice, previousMaxPrice))
    previousMaxPriceRef.current = maxPrice
  }, [maxPrice])

  useEffect(() => {
    function updateHeight() {
      setMenuControlsHeight(menuControlsRef.current?.offsetHeight || 0)
    }

    updateHeight()

    if (typeof ResizeObserver === "undefined" || !menuControlsRef.current) {
      window.addEventListener("resize", updateHeight)
      return () => window.removeEventListener("resize", updateHeight)
    }

    const observer = new ResizeObserver(updateHeight)
    observer.observe(menuControlsRef.current)

    return () => observer.disconnect()
  }, [])

  const isFiltering = hasActiveFilters(appliedFilters, maxPrice)
  const hasPendingChanges = !areFiltersEqual(draftFilters, appliedFilters)
  const normalizedDraftKeyword = normalizeKeyword(draftFilters.search)
  const normalizedAppliedKeyword = normalizeKeyword(appliedFilters.search)

  useEffect(() => {
    if (isFiltering) return
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && setActiveSection(entry.target.dataset.id)),
      { rootMargin: "-40% 0px -40% 0px" }
    )
    Object.values(sectionRefs.current).forEach(element => element && observer.observe(element))
    return () => observer.disconnect()
  }, [groupedSections, isFiltering])

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggest(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const suggestions = useMemo(() => {
    if (!normalizedDraftKeyword) return []
    return items.filter(item => normalizeKeyword(item.name).includes(normalizedDraftKeyword)).slice(0, 6)
  }, [items, normalizedDraftKeyword])

  const filteredItems = useMemo(() => {
    const baseItems = searchItems({
      category: appliedFilters.category,
      leftPrice: appliedFilters.priceMin,
      rightPrice: appliedFilters.priceMax,
      isAvailable: appliedFilters.availability,
    })

    const keywordMatchedItems = normalizedAppliedKeyword
      ? baseItems.filter(item => normalizeKeyword(item.name).includes(normalizedAppliedKeyword))
      : baseItems

    if (appliedFilters.sort === "asc") {
      return [...keywordMatchedItems].sort((left, right) => left.price - right.price)
    }

    if (appliedFilters.sort === "desc") {
      return [...keywordMatchedItems].sort((left, right) => right.price - left.price)
    }

    return keywordMatchedItems
  }, [appliedFilters, normalizedAppliedKeyword, searchItems])

  function updateDraftFilter(key, value) {
    setDraftFilters(prev => ({ ...prev, [key]: value }))
  }

  function applyFilters() {
    const nextFilters = sanitizeFilters(draftFilters, maxPrice)
    setDraftFilters(nextFilters)
    setAppliedFilters(nextFilters)
    setShowSuggest(false)
  }

  function clearFilters() {
    const defaultFilters = createDefaultFilters(maxPrice)
    setDraftFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setShowSuggest(false)
  }

  const minPct = maxPrice === 0 ? 0 : (draftFilters.priceMin / maxPrice) * 100
  const maxPct = maxPrice === 0 ? 100 : (draftFilters.priceMax / maxPrice) * 100
  const statusMessage = hasPendingChanges
    ? "Bạn đã thay đổi bộ lọc. Bấm Search để cập nhật kết quả."
    : isFiltering
      ? `${filteredItems.length} món đang khớp với điều kiện đã áp dụng.`
      : "Hiện đang hiển thị toàn bộ menu."

  return (
    <div className="menu-page" style={{ "--menu-controls-offset": `${menuControlsHeight}px` }}>
      <div className="menu-hero">
        <h1 className="menu-hero-title">Menu</h1>
      </div>

      <div className="menu-controls" ref={menuControlsRef}>
        <div className="mc-shell">
          <div className="mc-row-search">
            <div className="mc-search-panel">
              <div className="mc-search-wrap" ref={searchRef}>
                <div className="mc-search-box">
                  <svg className="mc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    className="mc-search-input"
                    placeholder="Tìm món ăn..."
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
                      className="mc-search-clear"
                      onClick={() => {
                        updateDraftFilter("search", "")
                        setShowSuggest(false)
                      }}
                      aria-label="Xóa từ khóa tìm kiếm"
                    >
                      ✕
                    </button>
                  )}
                  <button className="mc-search-btn" onClick={applyFilters} title="Tìm kiếm">
                    Search
                  </button>
                </div>

                {showSuggest && suggestions.length > 0 && (
                  <div className="mc-suggest">
                    {suggestions.map(item => (
                      <button
                        key={item.id}
                        className="mc-suggest-item"
                        onMouseDown={() => {
                          updateDraftFilter("search", item.name)
                          setShowSuggest(false)
                        }}
                      >
                        <img src={item.img} alt="" />
                        <span className="mc-sug-name">{item.name}</span>
                        <span className="mc-sug-price">{fmtPrice(item.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              className="mc-reset-btn"
              onClick={clearFilters}
              title="Đặt lại bộ lọc"
              aria-label="Đặt lại bộ lọc"
            >
              ↻
            </button>
          </div>

          <div className="mc-row-categories">
            <div className="mc-categories-scroll">
              <button
                className={`mc-cat-chip ${draftFilters.category === "" ? "active" : ""}`}
                onClick={() => updateDraftFilter("category", "")}
              >
                Tất cả
              </button>
              {categories.map(item => (
                <button
                  key={item.key}
                  className={`mc-cat-chip ${draftFilters.category === item.key ? "active" : ""}`}
                  onClick={() => updateDraftFilter("category", item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mc-row-status">
            <div className="mc-status-tabs">
              <button
                className={`mc-status-chip ${draftFilters.availability === "" ? "active" : ""}`}
                onClick={() => updateDraftFilter("availability", "")}
              >
                Tất cả trạng thái
              </button>
              <button
                className={`mc-status-chip ${draftFilters.availability === "true" ? "active" : ""}`}
                onClick={() => updateDraftFilter("availability", "true")}
              >
                Có sẵn
              </button>
              <button
                className={`mc-status-chip ${draftFilters.availability === "false" ? "active" : ""}`}
                onClick={() => updateDraftFilter("availability", "false")}
              >
                Hết món
              </button>
            </div>
          </div>

          <div className="mc-row-sort-price">
            <div className="mc-sort-block">
              <span className="mc-sort-title">Sắp xếp:</span>
              <div className="mc-sort-options">
                {SORT_OPTIONS.map(([value, label]) => (
                  <button
                    key={value}
                    className={`mc-sort-option ${draftFilters.sort === value ? "active" : ""}`}
                    onClick={() => updateDraftFilter("sort", value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mc-price-compact">
              <div className="mc-price-header-compact">
                <span className="mc-price-label">Khoảng giá:</span>
                <div className="mc-price-values">
                  <span className="mc-price-val">{fmtPrice(draftFilters.priceMin)}</span>
                  <span className="mc-price-sep">—</span>
                  <span className="mc-price-val">{fmtPrice(draftFilters.priceMax)}</span>
                </div>
              </div>
              <div className="mc-slider-wrap-compact">
                <div className="mc-slider-track">
                  <div className="mc-slider-fill" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
                </div>
                <input
                  type="range"
                  className="mc-slider mc-slider-min"
                  min={0}
                  max={maxPrice}
                  step={10000}
                  value={draftFilters.priceMin}
                  onChange={event => {
                    const value = Number(event.target.value)
                    if (value <= draftFilters.priceMax - 50000) {
                      updateDraftFilter("priceMin", value)
                    }
                  }}
                />
                <input
                  type="range"
                  className="mc-slider mc-slider-max"
                  min={0}
                  max={maxPrice}
                  step={10000}
                  value={draftFilters.priceMax}
                  onChange={event => {
                    const value = Number(event.target.value)
                    if (value >= draftFilters.priceMin + 50000) {
                      updateDraftFilter("priceMax", value)
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {hasPendingChanges && (
            <div className="mc-status-line">
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>

      {!isFiltering && (
        <nav className="category-nav">
          {groupedSections.map(section => (
            <button
              key={section.id}
              className={`cat-btn ${activeSection === section.id ? "active" : ""}`}
              onClick={() => sectionRefs.current[section.id]?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              {section.category}
            </button>
          ))}
        </nav>
      )}

      {isFiltering ? (
        <FilteredGrid items={filteredItems} />
      ) : (
        <div className="menu-sections">
          {groupedSections.map(section => (
            <section
              key={section.id}
              className="menu-section"
              data-id={section.id}
              ref={element => {
                sectionRefs.current[section.id] = element
              }}
            >
              <div className="section-header">
                <h2 className="section-title">{section.category}</h2>
              </div>
              <DragScrollRow items={section.items} />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
