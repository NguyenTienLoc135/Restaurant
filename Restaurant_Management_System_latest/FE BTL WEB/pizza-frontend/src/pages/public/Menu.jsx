import { useEffect, useMemo, useRef, useState } from "react"
import { useLanguage } from "../../context/LanguageContext"
import { useMenu } from "../../context/MenuContext"
import { MENU_STATUS } from "../../data/menuData"
import { getMenuCategoryLabel, getMenuStatusLabel } from "../../i18n/userText"
import { getApiErrorMessage } from "../../services/apiClient"
import { fetchPublicItemDetailApi } from "../../services/menuApi"
import { normalizeMenuItemDetailResponse } from "../../services/responseAdapters"
import "./Menu.css"

const SORT_OPTIONS = ["default", "asc", "desc"]
const AVAILABILITY_OPTIONS = ["", "true", "false"]

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

function DishDetail({ item, loading, error, onClose, text, language }) {
  return (
    <div className="dish-detail-panel">
      <button className="dd-close" onClick={onClose} aria-label={text.closeDetail}>
        ×
      </button>
      <div className="dd-img-wrap">
        <img src={item.img} alt={item.name} draggable="false" />
        <div className="dd-img-overlay" />
      </div>
      <div className="dd-body">
        <span className="dd-cat">{getMenuCategoryLabel(item.cat, language)}</span>
        <h3 className="dd-name">{item.name}</h3>
        <p className="dd-price">{fmtPrice(item.price)}</p>
        {item.status === MENU_STATUS.outOfStock && <p className="dd-stock dd-stock-out">{text.outOfStock}</p>}
        {loading && <p className="dd-val">{text.loadingDetail}</p>}
        {error && <p className="dd-val dd-error">{error}</p>}

        {item.desc && (
          <div className="dd-story">
            <span className="dd-label">{text.description}</span>
            <p className="dd-story-text">{item.desc}</p>
          </div>
        )}
        {item.origin && (
          <div className="dd-row">
            <span className="dd-label">{text.origin}</span>
            <span className="dd-val">{item.origin}</span>
          </div>
        )}
        {item.ingredients && (
          <div className="dd-row">
            <span className="dd-label">{text.ingredients}</span>
            <span className="dd-val">{item.ingredients}</span>
          </div>
        )}
        {item.story && (
          <div className="dd-story">
            <span className="dd-label">{text.story}</span>
            <p className="dd-story-text">{item.story}</p>
          </div>
        )}
        {!loading && !error && !item.desc && !item.origin && !item.ingredients && !item.story && (
          <p className="dd-val">{text.noDetail}</p>
        )}
      </div>
    </div>
  )
}

function DragScrollRow({ items, text, language }) {
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
        [item.id]: getApiErrorMessage(apiError, text.loadDetailError),
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
                  <span>{item.status === MENU_STATUS.outOfStock ? text.temporarilyOut : text.viewDetail}</span>
                </div>
                {item.status === MENU_STATUS.outOfStock && (
                  <span className="dish-card-badge">{text.outOfStock}</span>
                )}
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
                text={text}
                language={language}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function FilteredGrid({ items, onClear, text, language }) {
  return (
    <div className="filtered-section">
      <div className="filtered-header">
        <span className="filtered-count">{items.length} {text.dishes}</span>
        <button className="filtered-clear" onClick={onClear}>
          × {text.clearFilters}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="no-result">
          <p>{text.noResult}</p>
          <button onClick={onClear}>{text.clearFilters}</button>
        </div>
      ) : (
        <div className="filtered-grid">
          {items.map(item => (
            <div key={item.id} className="fg-card" style={{ opacity: item.status === MENU_STATUS.outOfStock ? 0.7 : 1 }}>
              <div className="fg-img">
                <img src={item.img} alt={item.name} loading="lazy" />
              </div>
              <div className="fg-info">
                <span className="fg-cat">{getMenuCategoryLabel(item.cat, language)}</span>
                <h3 className="fg-name">{item.name}</h3>
                <p className="fg-price">{fmtPrice(item.price)}</p>
                {item.status === MENU_STATUS.outOfStock && <p className="fg-stock-out">{text.outOfStock}</p>}
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
  const { language, isEnglish } = useLanguage()
  const [activeSection, setActiveSection] = useState(null)
  const maxPrice = useMemo(() => Math.ceil((Math.max(...items.map(item => item.price), 0) || 500000) / 50000) * 50000, [items])
  const [draftFilters, setDraftFilters] = useState(() => createDefaultFilters(maxPrice))
  const [appliedFilters, setAppliedFilters] = useState(() => createDefaultFilters(maxPrice))
  const [showSuggest, setShowSuggest] = useState(false)
  const [menuControlsHeight, setMenuControlsHeight] = useState(0)
  const sectionRefs = useRef({})
  const searchRef = useRef(null)
  const menuControlsRef = useRef(null)
  const previousMaxPriceRef = useRef(maxPrice)

  const text = isEnglish
    ? {
        title: "Menu",
        closeDetail: "Close dish details",
        outOfStock: "Out of stock",
        loadingDetail: "Loading dish details...",
        description: "Description",
        origin: "Origin",
        ingredients: "Ingredients",
        story: "Story",
        noDetail: "No additional details are available for this dish yet.",
        loadDetailError: "Unable to load dish details",
        temporarilyOut: "Temporarily unavailable",
        viewDetail: "View details",
        dishes: "dishes",
        clearFilters: "Clear filters",
        noResult: "No matching dishes found.",
        default: "Default",
        asc: "Price low to high",
        desc: "Price high to low",
        all: "All",
        available: "Available",
        helper: "Enter a dish name, choose any filters you need, then press Search.",
        reset: "Reset",
        search: "Search dishes",
        searchPlaceholder: "Search by dish name...",
        searchAriaClear: "Clear search keyword",
        searchButton: "Search",
        sortLabel: "Sort by price",
        availabilityLabel: "Availability",
        categoryLabel: "Categories",
        priceRange: "Price range",
        pendingStatus: "You changed the filters. Press Search to refresh the results.",
        resultStatus: count => `${count} dishes currently match the applied filters.`,
        allStatus: "The full menu is currently displayed. You can enter a keyword and apply filters, then press Search.",
      }
    : {
        title: "Menu",
        closeDetail: "Đóng chi tiết món",
        outOfStock: "Hết món",
        loadingDetail: "Đang tải chi tiết món...",
        description: "Mô tả",
        origin: "Nguồn gốc",
        ingredients: "Nguyên liệu",
        story: "Câu chuyện",
        noDetail: "Chưa có thông tin chi tiết cho món này.",
        loadDetailError: "Không thể tải chi tiết món",
        temporarilyOut: "Tạm hết món",
        viewDetail: "Xem chi tiết",
        dishes: "món",
        clearFilters: "Xóa bộ lọc",
        noResult: "Không tìm thấy món phù hợp.",
        default: "Mặc định",
        asc: "Giá tăng",
        desc: "Giá giảm",
        all: "Tất cả",
        available: "Có sẵn",
        helper: "Gõ tên món, chọn thêm điều kiện nếu cần, sau đó bấm Search để lọc.",
        reset: "Đặt lại",
        search: "Tìm món ăn",
        searchPlaceholder: "Tìm món ăn theo tên...",
        searchAriaClear: "Xóa từ khóa tìm kiếm",
        searchButton: "Search",
        sortLabel: "Sắp xếp theo giá",
        availabilityLabel: "Trạng thái món",
        categoryLabel: "Danh mục món ăn",
        priceRange: "Khoảng giá",
        pendingStatus: "Bạn đã thay đổi bộ lọc. Bấm Search để cập nhật kết quả.",
        resultStatus: count => `${count} món đang khớp với điều kiện đã áp dụng.`,
        allStatus: "Hiện đang hiển thị toàn bộ menu. Bạn có thể nhập từ khóa và chọn bộ lọc rồi bấm Search.",
      }

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
    return items
      .filter(item => normalizeKeyword(item.name).includes(normalizedDraftKeyword))
      .slice(0, 6)
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
    ? text.pendingStatus
    : isFiltering
      ? text.resultStatus(filteredItems.length)
      : text.allStatus

  return (
    <div className="menu-page" style={{ "--menu-controls-offset": `${menuControlsHeight}px` }}>
      <div className="menu-hero">
        <h1 className="menu-hero-title">{text.title}</h1>
      </div>

      <div className="menu-controls" ref={menuControlsRef}>
        <div className="mc-shell">
          <div className="mc-topbar">
            <div className="mc-search-panel">
              <span className="mc-group-title">{text.search}</span>
              <div className="mc-search-wrap" ref={searchRef}>
                <div className="mc-search-box">
                  <input
                    className="mc-search-input"
                    placeholder={text.searchPlaceholder}
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
                      aria-label={text.searchAriaClear}
                    >
                      ×
                    </button>
                  )}
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
              <p className="mc-helper-text">{text.helper}</p>
            </div>

            <div className="mc-actions">
              <button className="mc-action-btn mc-action-btn-secondary" onClick={clearFilters}>
                {text.reset}
              </button>
              <button className="mc-action-btn mc-action-btn-primary" onClick={applyFilters}>
                {text.searchButton}
              </button>
            </div>
          </div>

          <div className="mc-grid">
            <div className="mc-group">
              <span className="mc-group-title">{text.sortLabel}</span>
              <div className="mc-chip-row">
                {SORT_OPTIONS.map(key => (
                  <button
                    key={key}
                    className={`mc-sort-btn ${draftFilters.sort === key ? "active" : ""}`}
                    onClick={() => updateDraftFilter("sort", key)}
                  >
                    {text[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mc-group">
              <span className="mc-group-title">{text.availabilityLabel}</span>
              <div className="mc-chip-row">
                {AVAILABILITY_OPTIONS.map(key => (
                  <button
                    key={key || "all"}
                    className={`mc-sort-btn ${draftFilters.availability === key ? "active" : ""}`}
                    onClick={() => updateDraftFilter("availability", key)}
                  >
                    {key === "" ? text.all : key === "true" ? text.available : text.outOfStock}
                  </button>
                ))}
              </div>
            </div>

            <div className="mc-group mc-group-wide">
              <span className="mc-group-title">{text.categoryLabel}</span>
              <div className="mc-chip-row">
                <button
                  className={`mc-sort-btn ${draftFilters.category === "" ? "active" : ""}`}
                  onClick={() => updateDraftFilter("category", "")}
                >
                  {text.all}
                </button>
                {categories.map(item => (
                  <button
                    key={item.key}
                    className={`mc-sort-btn ${draftFilters.category === item.key ? "active" : ""}`}
                    onClick={() => updateDraftFilter("category", item.key)}
                  >
                    {getMenuCategoryLabel(item.key, language)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mc-group mc-group-wide">
              <div className="mc-price-header">
                <span className="mc-group-title">{text.priceRange}</span>
                <div className="mc-price-values">
                  <span className="mc-slider-val mc-slider-val-min">{fmtPrice(draftFilters.priceMin)}</span>
                  <span className="mc-price-divider">-</span>
                  <span className="mc-slider-val">{fmtPrice(draftFilters.priceMax)}</span>
                </div>
              </div>
              <div className="mc-slider-wrap">
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

          <div className="mc-status-line">
            <span>{statusMessage}</span>
          </div>
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
              {getMenuCategoryLabel(section.id, language)}
            </button>
          ))}
        </nav>
      )}

      {isFiltering ? (
        <FilteredGrid items={filteredItems} onClear={clearFilters} text={text} language={language} />
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
                <h2 className="section-title">{getMenuCategoryLabel(section.id, language)}</h2>
              </div>
              <DragScrollRow items={section.items} text={text} language={language} />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

