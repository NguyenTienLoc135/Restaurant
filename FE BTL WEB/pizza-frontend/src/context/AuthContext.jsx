import { createContext, useContext, useState } from "react"
import { createUserAccount, findUserAccount } from "../data/authDb"

const AuthContext = createContext(null)

function loadStorage(key, fallback = null) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadStorage("hs_user"))
  const [orders, setOrders] = useState(() => loadStorage("hs_orders", []))
  const [bookings, setBookings] = useState(() => loadStorage("hs_bookings", []))

  function login(userData) {
    const nextUser = { ...userData, avatar: userData.name?.charAt(0).toUpperCase() }
    setUser(nextUser)
    saveStorage("hs_user", nextUser)
  }

  function loginWithCredentials(email, password) {
    const account = findUserAccount(email, password)
    if (!account) {
      return { ok: false, message: "Email hoặc mật khẩu không đúng" }
    }

    const { password: _password, ...safeUser } = account
    const nextUser = { ...safeUser, avatar: safeUser.name?.charAt(0).toUpperCase() }
    setUser(nextUser)
    saveStorage("hs_user", nextUser)
    return { ok: true, user: nextUser }
  }

  function registerUser({ name, email, password }) {
    const result = createUserAccount({ name, email, password })
    if (!result.ok) return result

    const { password: _password, ...safeUser } = result.user
    const nextUser = { ...safeUser, avatar: safeUser.name?.charAt(0).toUpperCase() }
    setUser(nextUser)
    saveStorage("hs_user", nextUser)
    return { ok: true, user: nextUser }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem("hs_user")
  }

  function updateUser(data) {
    const nextUser = {
      ...user,
      ...data,
      avatar: (data.name || user.name)?.charAt(0).toUpperCase(),
    }
    setUser(nextUser)
    saveStorage("hs_user", nextUser)
  }

  function addOrder(order) {
    const newOrder = {
      id: "#4P" + Date.now().toString().slice(-4),
      date: new Date().toLocaleDateString("vi-VN"),
      items: order.items,
      total: order.total,
      status: "Chờ xác nhận",
      customer: order.customer || user?.name || "Khách online",
      phone: order.phone || user?.phone || "",
      address: order.address || "—",
      district: order.district || "",
      payment: order.payment || "cod",
      notes: order.notes || "",
      deliveryTime: order.deliveryTime || "Giao ngay",
    }

    const updatedOrders = [newOrder, ...orders]
    setOrders(updatedOrders)
    saveStorage("hs_orders", updatedOrders)

    const currentStaffOrders = loadStorage("hs_staff_orders", [])
    saveStorage("hs_staff_orders", [newOrder, ...currentStaffOrders])
  }

  function addBooking(booking) {
    const newBooking = {
      id: "#BK" + Date.now().toString().slice(-4),
      date: booking.date,
      time: booking.time,
      guests: Number(booking.guests),
      status: "Chờ xác nhận",
      name: booking.name || user?.name || "Khách online",
      phone: booking.phone || user?.phone || "",
      email: booking.email || user?.email || "",
      restaurant: booking.restaurant || "Pizza 4P's Ba Đình",
      note: booking.note || "",
      table: booking.table || "TBD",
    }

    const updatedBookings = [newBooking, ...bookings]
    setBookings(updatedBookings)
    saveStorage("hs_bookings", updatedBookings)

    const currentStaffBookings = loadStorage("hs_staff_bookings", [])
    saveStorage("hs_staff_bookings", [newBooking, ...currentStaffBookings])
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithCredentials, registerUser, logout, updateUser, orders, bookings, addOrder, addBooking }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      login: () => {},
      loginWithCredentials: () => ({ ok: false }),
      registerUser: () => ({ ok: false }),
      logout: () => {},
      updateUser: () => {},
      orders: [],
      bookings: [],
      addOrder: () => {},
      addBooking: () => {},
    }
  }
  return context
}
