import { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)

function loadStorage(key, fallback = null) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback }
  catch { return fallback }
}

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(() => loadStorage("hs_user"))
  const [orders,   setOrders]   = useState(() => loadStorage("hs_orders",   []))
  const [bookings, setBookings] = useState(() => loadStorage("hs_bookings", []))

  function login(userData) {
    const u = { ...userData, avatar: userData.name?.charAt(0).toUpperCase() }
    setUser(u)
    localStorage.setItem("hs_user", JSON.stringify(u))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem("hs_user")
  }

  function updateUser(data) {
    const u = { ...user, ...data, avatar: (data.name || user.name)?.charAt(0).toUpperCase() }
    setUser(u)
    localStorage.setItem("hs_user", JSON.stringify(u))
  }

  // Thêm đơn hàng mới (gọi sau khi checkout thành công)
  function addOrder(order) {
    const newOrder = {
      id: "#4P" + Date.now().toString().slice(-4),
      date: new Date().toLocaleDateString("vi-VN"),
      items: order.items,   // string mô tả món
      total: order.total,   // string VD: "391,000₫"
      status: "Đã giao",
    }
    const updated = [newOrder, ...orders]
    setOrders(updated)
    localStorage.setItem("hs_orders", JSON.stringify(updated))
  }

  // Thêm đặt bàn mới (gọi sau khi booking thành công)
  function addBooking(booking) {
    const newBooking = {
      id: "#BK" + Date.now().toString().slice(-4),
      date: booking.date,
      time: booking.time,
      guests: booking.guests,
      status: "Đã xác nhận",
    }
    const updated = [newBooking, ...bookings]
    setBookings(updated)
    localStorage.setItem("hs_bookings", JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, orders, bookings, addOrder, addBooking }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) return {
    user: null, login: () => {}, logout: () => {}, updateUser: () => {},
    orders: [], bookings: [], addOrder: () => {}, addBooking: () => {}
  }
  return ctx
}
