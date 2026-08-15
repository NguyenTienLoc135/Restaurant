import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMenu } from "../../context/MenuContext"
import { MENU_STATUS } from "../../data/menuData"
import "./Menu.css"

function fmtPrice(price) {
  return `${price.toLocaleString("vi-VN")}₫`
}

function DishDetail({ item, onClose }) {
  return (
    <div className="dish-detail-panel">
      <button className="dd-close" onClick={onClose}>✕</button>
      <div className="dd-img-wrap">
        <img src={item.img} alt={item.name} draggable="false" />
        <div className="dd-img-overlay" />
      </div>
      <div className="dd-body">
        <span className="dd-cat">{item.catLabel}</span>
        <h3 className="dd-name">{item.name}</h3>
        <p className="dd-price">{fmtPrice(item.price)}</p>
        {item.status === MENU_STATUS.outOfStock && <p className="dd-val" style={{ color: "#b91c1c", fontWeight: 700 }}>🚫 Hết món</p>}

        {item.origin && <div className="dd-row"><span className="dd-label">🌍 Nguồn gốc</span><span className="dd-val">{item.origin}</span></div>}
        {item.ingredients && <div className="dd-row"><span className="dd-label">🧀 Nguyên liệu</span><span className="dd-val">{item.ingredients}</span></div>}
        {item.story && <div className="dd-story"><span className="dd-label">📖 Câu chuyện</span><p className="dd-story-text">{item.story}</p></div>}
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

  function handleCardClick(index) {
    if (didDrag.current) return
    setExpanded(prev => (prev === index ? null : index))
  }

  return (
    <div className="scroll-viewport" ref={viewportRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onTouchMove={() => expanded !== null && setExpanded(null)}>
      <div className="scroll-track">
        {items.map((item, index) => (
          <div key={item.id} className={`dish-card-wrap ${expanded === index ? "is-expanded" : ""}`}>
            <div className={`dish-card ${expanded === index ? "hidden" : ""}`} onClick={() => handleCardClick(index)} style={{ opacity: item.status === MENU_STATUS.outOfStock ? 0.75 : 1 }}>
              <div className="dish-card-img">
                <img src={item.img} alt={item.name} loading="lazy" draggable="false" />
                <div className="dish-card-hover-hint"><span>{item.status === MENU_STATUS.outOfStock ? "Tạm hết món" : "Xem chi tiết"}</span></div>
                {item.status === MENU_STATUS.outOfStock && (
                  <span style={{ position: "absolute", top: 14, right: 14, background: "#991b1b", color: "#fff", padding: "6px 10px", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                    Hết món
                  </span>
                )}
              </div>
              <div className="dish-card-info">
                <h3 className="dish-card-name">{item.name}</h3>
                <p className="dish-card-price">{fmtPrice(item.price)}</p>
              </div>
            </div>
            {expanded === index && <DishDetail item={item} onClose={() => setExpanded(null)} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function FilteredGrid({ items, onClear }) {
  return (
    <div className="filtered-section">
      <div className="filtered-header">
        <span className="filtered-count">{items.length} món</span>
        <button className="filtered-clear" onClick={onClear}>✕ Xóa bộ lọc</button>
      </div>
      {items.length === 0 ? (
        <div className="no-result">
          <p>Không tìm thấy món phù hợp</p>
          <button onClick={onClear}>Xóa bộ lọc</button>
        </div>
      ) : (
        <div className="filtered-grid">
          {items.map(item => (
            <div key={item.id} className="fg-card" style={{ opacity: item.status === MENU_STATUS.outOfStock ? 0.7 : 1 }}>
              <div className="fg-img"><img src={item.img} alt={item.name} loading="lazy" /></div>
              <div className="fg-info">
                <span className="fg-cat">{item.catLabel}</span>
                <h3 className="fg-name">{item.name}</h3>
                <p className="fg-price">{fmtPrice(item.price)}</p>
                {item.status === MENU_STATUS.outOfStock && <p style={{ color: "#b91c1c", fontWeight: 700 }}>🚫 Hết món</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Menu() {
  const { groupedSections, items } = useMenu()
  const [activeSection, setActiveSection] = useState(null)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("default")
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(() => {
    const max = Math.max(...items.map(item => item.price), 0)
    return Math.ceil(max / 50000) * 50000 || 500000
  })
  const [showSuggest, setShowSuggest] = useState(false)
  const sectionRefs = useRef({})
  const searchRef = useRef(null)

  useEffect(() => {
    const max = Math.max(...items.map(item => item.price), 0)
    setPriceMax(Math.ceil(max / 50000) * 50000 || 500000)
  }, [items])

  const allItems = items
  const maxPrice = Math.ceil((Math.max(...allItems.map(item => item.price), 0) || 500000) / 50000) * 50000
  const isFiltering = search.trim() !== "" || sort !== "default" || priceMin > 0 || priceMax < maxPrice

  useEffect(() => {
    if (isFiltering) return
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && setActiveSection(entry.target.dataset.id)), { rootMargin: "-40% 0px -40% 0px" })
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

  const suggestions = search.trim() ? allItems.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6) : []
  let filteredItems = allItems.filter(item => {
    const matchSearch = !search.trim() || item.name.toLowerCase().includes(search.toLowerCase())
    const matchPrice = item.price >= priceMin && item.price <= priceMax
    return matchSearch && matchPrice
  })
  if (sort === "asc") filteredItems = [...filteredItems].sort((a, b) => a.price - b.price)
  if (sort === "desc") filteredItems = [...filteredItems].sort((a, b) => b.price - a.price)

  function clearFilters() {
    setSearch("")
    setSort("default")
    setPriceMin(0)
    setPriceMax(maxPrice)
  }

  const minPct = (priceMin / maxPrice) * 100
  const maxPct = (priceMax / maxPrice) * 100

  return (
    <div className="menu-page">
      <div className="menu-hero"><h1 className="menu-hero-title">Menu</h1></div>

      <div className="menu-controls">
        <div className="mc-inner">
          <div className="mc-search-wrap" ref={searchRef}>
            <div className="mc-search-box">
              <input className="mc-search-input" placeholder="Tìm món ăn..." value={search} onChange={event => { setSearch(event.target.value); setShowSuggest(true) }} onFocus={() => setShowSuggest(true)} />
              {search && <button className="mc-search-clear" onClick={() => { setSearch(""); setShowSuggest(false) }}>✕</button>}
            </div>

            {showSuggest && suggestions.length > 0 && (
              <div className="mc-suggest">
                {suggestions.map(item => (
                  <button key={item.id} className="mc-suggest-item" onMouseDown={() => { setSearch(item.name); setShowSuggest(false) }}>
                    <img src={item.img} alt="" />
                    <span className="mc-sug-name">{item.name}</span>
                    <span className="mc-sug-price">{fmtPrice(item.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mc-sort">
            <span className="mc-sort-label">Sắp xếp:</span>
            {[["default", "Mặc định"], ["asc", "Giá tăng"], ["desc", "Giá giảm"]].map(([key, label]) => (
              <button key={key} className={`mc-sort-btn ${sort === key ? "active" : ""}`} onClick={() => setSort(key)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="mc-slider-row">
          <div className="mc-slider-inner">
            <span className="mc-slider-label">Khoảng giá:</span>
            <span className="mc-slider-val mc-slider-val-min">{fmtPrice(priceMin)}</span>
            <div className="mc-slider-wrap">
              <div className="mc-slider-track"><div className="mc-slider-fill" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} /></div>
              <input type="range" className="mc-slider mc-slider-min" min={0} max={maxPrice} step={10000} value={priceMin} onChange={event => { const value = Number(event.target.value); if (value <= priceMax - 50000) setPriceMin(value) }} />
              <input type="range" className="mc-slider mc-slider-max" min={0} max={maxPrice} step={10000} value={priceMax} onChange={event => { const value = Number(event.target.value); if (value >= priceMin + 50000) setPriceMax(value) }} />
            </div>
            <span className="mc-slider-val">{fmtPrice(priceMax)}</span>
          </div>
        </div>
      </div>

      {!isFiltering && (
        <nav className="category-nav">
          {groupedSections.map(section => (
            <button key={section.id} className={`cat-btn ${activeSection === section.id ? "active" : ""}`} onClick={() => sectionRefs.current[section.id]?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              {section.category}
            </button>
          ))}
        </nav>
      )}

      {isFiltering ? (
        <FilteredGrid items={filteredItems} onClear={clearFilters} />
      ) : (
        <div className="menu-sections">
          {groupedSections.map(section => (
            <section key={section.id} className="menu-section" data-id={section.id} ref={element => { sectionRefs.current[section.id] = element }}>
              <div className="section-header"><h2 className="section-title">{section.category}</h2></div>
              <DragScrollRow items={section.items} />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
