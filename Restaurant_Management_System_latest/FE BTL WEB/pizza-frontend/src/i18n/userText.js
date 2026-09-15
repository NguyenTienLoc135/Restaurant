export function pickByLanguage(language, vietnameseText, englishText) {
  return language === "en" ? englishText : vietnameseText
}

const MENU_CATEGORY_LABELS = {
  appetizers: { vn: "Khai vị & salad", en: "Appetizers & salads" },
  appetizers_salads: { vn: "Khai vị & salad", en: "Appetizers & salads" },
  main_course: { vn: "Món chính", en: "Main course" },
  desserts: { vn: "Tráng miệng", en: "Desserts" },
  drinks: { vn: "Đồ uống", en: "Drinks" },
}

const MENU_BADGE_LABELS = {
  "Bán chạy": { vn: "Bán chạy", en: "Best seller" },
  "Đặc biệt": { vn: "Đặc biệt", en: "Special" },
  "Mới": { vn: "Mới", en: "New" },
  "Thuần chay": { vn: "Thuần chay", en: "Vegan" },
  Signature: { vn: "Signature", en: "Signature" },
}

const MENU_STATUS_LABELS = {
  available: { vn: "Có sẵn", en: "Available" },
  out_of_stock: { vn: "Hết món", en: "Out of stock" },
  unavailable: { vn: "Hết món", en: "Out of stock" },
}

const ORDER_STATUS_LABELS = {
  PENDING: { vn: "Chờ xác nhận", en: "Pending" },
  ACCEPTED: { vn: "Đã xác nhận", en: "Accepted" },
  DELIVERY: { vn: "Đang giao hàng", en: "Delivering" },
  COMPLETED: { vn: "Đã hoàn thành", en: "Completed" },
  CANCELLED: { vn: "Đã hủy", en: "Cancelled" },
  INCOMPLETE: { vn: "Đã hủy", en: "Cancelled" },
}

const BOOKING_STATUS_LABELS = {
  PENDING: { vn: "Chờ xác nhận", en: "Pending" },
  ACCEPTED: { vn: "Đã xác nhận", en: "Accepted" },
  CANCELLED: { vn: "Đã hủy", en: "Cancelled" },
}

export function getMenuCategoryLabel(category, language) {
  const key = String(category || "").trim().toLowerCase()
  const entry = MENU_CATEGORY_LABELS[key]
  return entry ? pickByLanguage(language, entry.vn, entry.en) : category
}

export function getMenuBadgeLabel(badge, language) {
  const entry = MENU_BADGE_LABELS[String(badge || "").trim()]
  return entry ? pickByLanguage(language, entry.vn, entry.en) : badge
}

export function getMenuStatusLabel(status, language) {
  const key = String(status || "").trim().toLowerCase().replace(/\s+/g, "_")
  const entry = MENU_STATUS_LABELS[key]
  return entry ? pickByLanguage(language, entry.vn, entry.en) : status
}

export function getOrderStatusLabel(status, language) {
  const key = String(status || "").trim().toUpperCase()
  const entry = ORDER_STATUS_LABELS[key]
  return entry ? pickByLanguage(language, entry.vn, entry.en) : status
}

export function getBookingStatusLabel(status, language) {
  const key = String(status || "").trim().toUpperCase()
  const entry = BOOKING_STATUS_LABELS[key]
  return entry ? pickByLanguage(language, entry.vn, entry.en) : status
}

