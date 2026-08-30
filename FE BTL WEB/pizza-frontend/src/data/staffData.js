import { normalizeBookingResponse, normalizeOrderResponse } from "../services/responseAdapters"

export const ORDER_STATUSES = [
  "Chờ xác nhận",
  "Đã nhận món",
  "Đang chuẩn bị",
  "Đã giao cho shipper",
  "Đã hoàn thành",
  "Đã hủy",
]

export const BOOKING_STATUSES = [
  "Chờ xác nhận",
  "Bàn đã đặt",
  "Khách đã đến",
  "Bàn còn trống",
  "Đã hủy",
]

const ORDER_STATUS_ALIASES = {
  "Chờ xác nhận": "Cho xac nhan",
  "Đã nhận món": "Da nhan mon",
  "Đang chuẩn bị": "Dang chuan bi",
  "Đã giao cho shipper": "Da giao cho shipper",
  "Đã hoàn thành": "Da hoan thanh",
  "Đã hủy": "Da huy",
}

const BOOKING_STATUS_ALIASES = {
  "Chờ xác nhận": "Cho xac nhan",
  "Bàn đã đặt": "Ban da dat",
  "Khách đã đến": "Khach da den",
  "Bàn còn trống": "Ban con trong",
  "Đã hủy": "Da huy",
}

const ORDER_STATUS_REVERSE_ALIASES = Object.fromEntries(
  Object.entries(ORDER_STATUS_ALIASES).map(([accented, ascii]) => [ascii, accented])
)

const BOOKING_STATUS_REVERSE_ALIASES = Object.fromEntries(
  Object.entries(BOOKING_STATUS_ALIASES).map(([accented, ascii]) => [ascii, accented])
)

const ORDER_KEY = "hs_orders"
const STAFF_ORDER_KEY = "hs_staff_orders"
const BOOKING_KEY = "hs_bookings"
const STAFF_BOOKING_KEY = "hs_staff_bookings"

const SEED_ORDERS = [
  {
    id: "#4P0001",
    date: "29/03/2026",
    createdAt: "2026-03-29T10:15:00",
    customer: "Nguyen Van A",
    phone: "0901 234 567",
    customerEmail: "nguyenvana@email.com",
    items: "Pizza 4 loai pho mai, Tiramisu",
    total: "391,000d",
    status: "Chờ xác nhận",
    address: "12 Doi Can, Ba Dinh",
    deliveryTime: "10:45",
  },
  {
    id: "#4P0002",
    date: "29/03/2026",
    createdAt: "2026-03-29T12:40:00",
    customer: "Tran Thi B",
    phone: "0912 345 678",
    customerEmail: "tranthib@email.com",
    items: "Bo Wagyu, Cocktail Negroni",
    total: "640,000d",
    status: "Đang chuẩn bị",
    address: "45 Hang Bong, Hoan Kiem",
    deliveryTime: "13:15",
  },
  {
    id: "#4P0003",
    date: "28/03/2026",
    createdAt: "2026-03-28T18:20:00",
    customer: "Le Minh C",
    phone: "0923 456 789",
    customerEmail: "leminhc@email.com",
    items: "Ca hoi ap chao, Yuzu Lemonade",
    total: "325,000d",
    status: "Đã hoàn thành",
    address: "88 Tay Ho, Tay Ho",
    deliveryTime: "19:00",
  },
]

const SEED_BOOKINGS = [
  {
    id: "#BK0001",
    date: "30/03/2026",
    time: "19:00",
    createdAt: "2026-03-27T09:30:00",
    guests: 4,
    name: "Nguyen Anh Khoa",
    phone: "0901 111 222",
    email: "anhkhoa@email.com",
    table: "Ban 5",
    status: "Bàn đã đặt",
  },
  {
    id: "#BK0002",
    date: "30/03/2026",
    time: "20:30",
    createdAt: "2026-03-28T15:10:00",
    guests: 2,
    name: "Tran Bich Ngoc",
    phone: "0912 222 333",
    email: "bichngoc@email.com",
    table: "Ban 2",
    status: "Chờ xác nhận",
  },
  {
    id: "#BK0003",
    date: "29/03/2026",
    time: "12:00",
    createdAt: "2026-03-26T17:55:00",
    guests: 6,
    name: "Le Hung Dung",
    phone: "0923 333 444",
    email: "hungdung@email.com",
    table: "Ban 8",
    status: "Khách đã đến",
  },
  {
    id: "#BK0004",
    date: "29/03/2026",
    time: "18:00",
    createdAt: "2026-03-25T11:25:00",
    guests: 3,
    name: "Pham Thuy Linh",
    phone: "0934 444 555",
    email: "thuylinh@email.com",
    table: "Ban 3",
    status: "Bàn còn trống",
  },
]

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function pad(value) {
  return String(value).padStart(2, "0")
}

function parseVietnameseDate(date) {
  if (!date || typeof date !== "string") return null
  const [day, month, year] = date.split("/")
  if (!day || !month || !year) return null
  return `${year}-${pad(month)}-${pad(day)}`
}

function buildDateTime(date, time = "00:00") {
  const normalizedDate = parseVietnameseDate(date)
  if (!normalizedDate) return null
  const normalizedTime = /^\d{1,2}:\d{2}$/.test(time || "") ? time : "00:00"
  return `${normalizedDate}T${normalizedTime}:00`
}

function normalizeOrder(order) {
  const adapted = normalizeOrderResponse(order)
  const normalizedStatus =
    ORDER_STATUS_REVERSE_ALIASES[adapted.status] ||
    (ORDER_STATUSES.includes(adapted.status) ? adapted.status : null) ||
    ORDER_STATUS_REVERSE_ALIASES[ORDER_STATUS_ALIASES[adapted.status]] ||
    null

  return {
    ...adapted,
    status: ORDER_STATUSES.includes(normalizedStatus) ? normalizedStatus : "Chờ xác nhận",
    date: adapted.date || new Date().toLocaleDateString("vi-VN"),
    createdAt: adapted.createdAt || buildDateTime(adapted.date, adapted.deliveryTime) || new Date().toISOString(),
    customer: adapted.customer || "Khach online",
    customerEmail: adapted.customerEmail || adapted.email || "",
    phone: adapted.phone || "",
    address: adapted.address || "-",
    notes: adapted.notes || "",
    deliveryTime: adapted.deliveryTime || "",
    userId: adapted.userId ?? null,
  }
}

function normalizeBooking(booking) {
  const adapted = normalizeBookingResponse(booking)
  const normalizedStatus =
    BOOKING_STATUS_REVERSE_ALIASES[adapted.status] ||
    (BOOKING_STATUSES.includes(adapted.status) ? adapted.status : null) ||
    BOOKING_STATUS_REVERSE_ALIASES[BOOKING_STATUS_ALIASES[adapted.status]] ||
    null

  return {
    ...adapted,
    status: BOOKING_STATUSES.includes(normalizedStatus) ? normalizedStatus : "Chờ xác nhận",
    date: adapted.date || new Date().toLocaleDateString("vi-VN"),
    time: adapted.time || "--:--",
    createdAt: adapted.createdAt || buildDateTime(adapted.date, adapted.time) || new Date().toISOString(),
    name: adapted.name || "Khach",
    phone: adapted.phone || "",
    email: adapted.email || "",
    table: adapted.table || "TBD",
    guests: Number(adapted.guests) || 1,
    userId: adapted.userId ?? null,
  }
}

function mergeById(primary, seeds, normalize) {
  const merged = [...primary.map(normalize)]
  seeds.forEach(seed => {
    if (!merged.find(item => item.id === seed.id)) {
      merged.push(normalize(seed))
    }
  })
  return merged
}

export function loadOrders() {
  const staffOrders = readStorage(STAFF_ORDER_KEY, null)
  const source = Array.isArray(staffOrders) && staffOrders.length ? staffOrders : readStorage(ORDER_KEY, [])
  const merged = mergeById(Array.isArray(source) ? source : [], SEED_ORDERS, normalizeOrder)
  saveOrders(merged)
  return merged
}

export function saveOrders(orders) {
  const normalized = (orders || []).map(normalizeOrder)
  writeStorage(STAFF_ORDER_KEY, normalized)
  writeStorage(ORDER_KEY, normalized)
}

export function loadBookings() {
  const staffBookings = readStorage(STAFF_BOOKING_KEY, null)
  const source =
    Array.isArray(staffBookings) && staffBookings.length ? staffBookings : readStorage(BOOKING_KEY, [])
  const merged = mergeById(Array.isArray(source) ? source : [], SEED_BOOKINGS, normalizeBooking)
  saveBookings(merged)
  return merged
}

export function saveBookings(bookings) {
  const normalized = (bookings || []).map(normalizeBooking)
  writeStorage(STAFF_BOOKING_KEY, normalized)
  writeStorage(BOOKING_KEY, normalized)
}

export function formatDateTime(value) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`
}

export function getTimestamp(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}
