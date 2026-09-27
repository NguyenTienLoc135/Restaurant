function toArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeId(value, prefix) {
  if (value == null || value === "") return ""
  const text = String(value).trim()
  if (!text) return ""
  if (text.startsWith("#")) return text
  return `${prefix}${text}`
}

// ── FIX: xử lý thêm format "2026-04-12 10:30:00" (dấu cách thay vì T)
// và timestamp số, chuỗi ISO có offset
function normalizeDateValue(value) {
  if (!value) return null

  // Đã là Date object
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  // Timestamp số (milliseconds)
  if (typeof value === "number") {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const str = String(value).trim()
  if (!str) return null

  // Thử parse trực tiếp trước (ISO 8601 chuẩn)
  let d = new Date(str)
  if (!Number.isNaN(d.getTime())) return d

  // FIX: "2026-04-12 10:30:00" → "2026-04-12T10:30:00"
  const isoFixed = str.replace(" ", "T")
  d = new Date(isoFixed)
  if (!Number.isNaN(d.getTime())) return d

  // "2026-04-12 10:30:00.000" (với milliseconds)
  const isoMs = str.replace(" ", "T").replace(/(\d{2}:\d{2}:\d{2})(\.\d+)?$/, "$1")
  d = new Date(isoMs)
  if (!Number.isNaN(d.getTime())) return d

  return null
}

function formatDate(date) {
  return date ? date.toLocaleDateString("vi-VN") : ""
}

function formatTime(date) {
  return date
    ? date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : "--:--"
}

function formatMoney(value) {
  if (value == null || value === "") return ""
  if (typeof value === "string" && /\d/.test(value) && /[^\d.,\s]/.test(value)) return value
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""))
  if (!Number.isFinite(numeric)) return String(value)
  return `${numeric.toLocaleString("vi-VN")}d`
}

function firstValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value
  }
  return ""
}

const ORDER_STATUS_MAP = {
  PENDING: "Chờ xác nhận",
  NEW: "Chờ xác nhận",
  ACCEPTED: "Đang chuẩn bị",
  CONFIRMED: "Đang chuẩn bị",
  PREPARING: "Đang chuẩn bị",
  READY: "Đang chuẩn bị",
  DELIVERY: "Đã giao cho shipper",
  DELIVERING: "Đang giao hàng",
  DELIVERED: "Đã hoàn thành",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
  INCOMPLETE: "Khách không nhận món",
}

const ORDER_STATUS_CODE_BY_LABEL = {
  "Chờ xác nhận": "PENDING",
  "Đang chuẩn bị": "ACCEPTED",
  "Đã giao cho shipper": "DELIVERY",
  "Đang giao hàng": "DELIVERING",
  "Đã hoàn thành": "COMPLETED",
  "Đã hủy": "CANCELLED",
  "Khách không nhận món": "INCOMPLETE",
}

const BOOKING_STATUS_MAP = {
  PENDING: "Chờ xác nhận",
  ACCEPTED: "Bàn đã đặt",
  CANCELLED: "Đã hủy",
}

const MENU_CATEGORY_UI_TO_BE = {
  appetizers: "APPETIZERS_SALADS",
  main_course: "MAIN_COURSE",
  desserts: "DESSERTS",
  drinks: "DRINK",
}

const MENU_CATEGORY_BE_TO_UI = {
  APPETIZERS_SALADS: "appetizers",
  MAIN_COURSE: "main_course",
  DESSERTS: "desserts",
  DRINK: "drinks",
}

const MENU_CATEGORY_LABEL = {
  appetizers: "Appetizers & Salads",
  main_course: "Pasta & Main Dishes",
  desserts: "Desserts",
  drinks: "Drink / Alcohol",
}

const MENU_STATUS_BE_TO_UI = {
  AVAILABLE: "Có sẵn",
  UNAVAILABLE: "Hết món",
}

export function mapMenuCategoryToApi(category) {
  return MENU_CATEGORY_UI_TO_BE[category] || category || ""
}

export function mapOrderStatusToApi(status) {
  const map = {
    "Chờ xác nhận": "PENDING",
    "Đang chuẩn bị": "ACCEPTED",
    "Đã giao cho shipper": "DELIVERY",
    "Đang giao hàng": "DELIVERY",
    "Đã hoàn thành": "COMPLETED",
    "Đã hủy": "CANCELLED",
    "Khách không nhận món": "INCOMPLETE",
  }
  return map[status] || status
}

export function mapBookingStatusToApi(status) {
  const map = {
    "Chờ xác nhận": "PENDING",
    "Bàn đã đặt": "ACCEPTED",
    "Đã hủy": "CANCELLED",
  }
  return map[status] || status
}

export function mapMenuStatusToApi(status) {
  return status === "Hết món" ? "UNAVAILABLE" : "AVAILABLE"
}

export function normalizeUserResponse(user) {
  if (!user) return null

  const name = firstValue(user.name, user.fullname, user.username, "Khach hang")
  const email = firstValue(user.email)
  const joinedDate = normalizeDateValue(firstValue(user.joinedAt, user.createdAt, user.joined))
  const userRole = String(firstValue(user.userRole, user.role, "")).trim().toUpperCase()
  const userIsActive = String(firstValue(user.userIsActive, user.isActive, "")).trim().toUpperCase()

  return {
    ...user,
    id: user.id ?? null,
    name,
    fullname: firstValue(user.fullname, name),
    username: firstValue(user.username, name),
    email,
    phone: firstValue(user.phone),
    address: firstValue(user.address),
    userGender: firstValue(user.userGender, user.gender, ""),
    role: firstValue(user.role, user.userRole, ""),
    userRole: userRole || "",
    isActive: userIsActive || "",
    userIsActive: userIsActive || "",
    status: userIsActive || "",
    joined: typeof user.joined === "string" && user.joined ? user.joined : formatDate(joinedDate),
    avatar: firstValue(user.avatar, name.charAt(0).toUpperCase()),
  }
}

function buildOrderItems(order) {
  if (typeof order.items === "string" && order.items.trim()) return order.items
  if (typeof order.itemSummary === "string" && order.itemSummary.trim()) return order.itemSummary

  const details = toArray(firstValue(order.details, order.orderDetails, order.items))
  if (details.length) {
    const summary = details
      .map(item => {
        const label = firstValue(item.name, item.itemName, item.description)
        const amount = Number(firstValue(item.amount, item.quantity, 1)) || 1
        return label ? `${label}${amount > 1 ? ` x${amount}` : ""}` : ""
      })
      .filter(Boolean)
      .join(", ")
    if (summary) return summary
  }

  return order.id != null ? "Xem chi tiết đơn hàng" : ""
}

export function normalizeOrderResponse(order) {
  if (!order) return null

  // FIX: thêm orderDate, createTime, timeCreated, created_at vào danh sách tìm kiếm
  const createdAt = normalizeDateValue(
    firstValue(
      order.createdAt,
      order.created_at,
      order.orderTime,
      order.orderDate,
      order.createTime,
      order.timeCreated,
      order.dateTime,
      order.deliveryTime,
    )
  )

  const rawStatusCode = String(
    firstValue(order.statusCode, ORDER_STATUS_CODE_BY_LABEL[order.status], order.status, "")
  ).toUpperCase()

  const driverName  = firstValue(order.driverName)
  const driverPhone = firstValue(order.driverPhone)

  const statusCode =
    rawStatusCode === "DELIVERY" && driverName ? "DELIVERING" : rawStatusCode

  const normalizedStatus =
    statusCode === "DELIVERING"
      ? "Đang giao hàng"
      : ORDER_STATUS_MAP[statusCode] || firstValue(order.status, "Chờ xác nhận")

  const normalizedId =
    typeof order.id === "string" && order.id.startsWith("#")
      ? order.id
      : normalizeId(order.id, "#4P")

  // FIX: nếu createdAt parse được thì dùng, ngược lại giữ "-" thay vì ""
  const dateDisplay = firstValue(order.date, formatDate(createdAt)) || "-"

  return {
    ...order,
    id: normalizedId,
    date: dateDisplay,
    createdAt: firstValue(order.createdAt, createdAt?.toISOString(), ""),
    customer: firstValue(order.customer, order.name, order.fullname, order.username, "Khách online"),
    customerEmail: firstValue(order.customerEmail, order.email),
    phone: firstValue(order.phone, order.userPhone),
    address: firstValue(order.address, "-"),
    items: buildOrderItems(order),
    total: firstValue(order.total, formatMoney(firstValue(order.totalPrice, order.itemsTotal))),
    statusCode,
    status: normalizedStatus,
    notes: firstValue(order.notes, order.note),
    deliveryTime: firstValue(order.deliveryTime, createdAt ? formatTime(createdAt) : "--:--"),
    userId: firstValue(order.userId, order.customerId, null),
    driverName,
    driverPhone,
  }
}

export function normalizeBookingResponse(booking) {
  if (!booking) return null

  // FIX: thêm bookingDate, reservationTime, checkInTime, created_at
  const bookingDate = normalizeDateValue(
    firstValue(
      booking.bookingTime,
      booking.bookingDate,
      booking.reservationTime,
      booking.checkInTime,
      booking.createdAt,
      booking.created_at,
    )
  )

  const rawStatusCode = String(firstValue(booking.statusCode, booking.status, "")).toUpperCase()

  const normalizedStatus =
    BOOKING_STATUS_MAP[String(firstValue(booking.status, "")).toUpperCase()] ||
    firstValue(booking.status, "Chờ xác nhận")

  const normalizedId =
    typeof booking.id === "string" && booking.id.startsWith("#")
      ? booking.id
      : normalizeId(booking.id, "#BK")

  return {
    ...booking,
    id: normalizedId,
    date: firstValue(booking.date, formatDate(bookingDate)) || "-",
    time: firstValue(booking.time, formatTime(bookingDate)),
    createdAt: firstValue(booking.createdAt, ""),
    bookingDateTime: firstValue(booking.bookingTime, booking.createdAt, bookingDate?.toISOString(), ""),
    guests: Number(firstValue(booking.guests, booking.guestNumber, 1)) || 1,
    statusCode: rawStatusCode,
    status: normalizedStatus,
    name: firstValue(booking.name, booking.fullname, booking.username, "Khách"),
    phone: firstValue(booking.phone),
    email: firstValue(booking.email),
    table: firstValue(booking.table),
    userId: firstValue(booking.userId, booking.customerId, null),
  }
}

export function normalizeMenuItemResponse(item) {
  if (!item) return null

  const apiCategory = String(firstValue(item.category)).toUpperCase()
  const cat = MENU_CATEGORY_BE_TO_UI[apiCategory] || "main_course"
  const name = firstValue(item.name, "Món ăn")

  return {
    ...item,
    id: item.id ?? null,
    cat,
    catLabel: MENU_CATEGORY_LABEL[cat] || cat,
    name,
    desc: firstValue(item.desc, item.description),
    unit: firstValue(item.unit),
    price: Number(item.price) || 0,
    img: firstValue(item.img, "https://via.placeholder.com/500x320?text=No+Image"),
    status:
      MENU_STATUS_BE_TO_UI[String(firstValue(item.isAvailable, item.itemAvailable)).toUpperCase()] ||
      firstValue(item.status, "Có sẵn"),
  }
}

export function normalizeMenuItemDetailResponse(item) {
  return normalizeMenuItemResponse({
    ...item,
    isAvailable: firstValue(item.isAvailable, item.itemAvailable),
    description: firstValue(item.description, item.desc),
  })
}

export function normalizeOrderList(orders) {
  return toArray(orders).map(normalizeOrderResponse).filter(Boolean)
}

export function normalizeBookingList(bookings) {
  return toArray(bookings).map(normalizeBookingResponse).filter(Boolean)
}

export function normalizeUserList(users) {
  return toArray(users).map(normalizeUserResponse).filter(Boolean)
}

export function normalizeMenuList(items) {
  return toArray(items).map(normalizeMenuItemResponse).filter(Boolean)
}