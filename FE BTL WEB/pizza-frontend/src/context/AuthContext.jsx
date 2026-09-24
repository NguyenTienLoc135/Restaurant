import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { decodeJwtToken, isJwtTokenExpired } from "../services/jwt"
import {
  normalizeBookingList,
  normalizeBookingResponse,
  normalizeOrderList,
  normalizeOrderResponse,
  normalizeUserResponse,
} from "../services/responseAdapters"
import {
  getMyInfoApi,
  loginUserApi,
  registerUserApi,
  updateMyInfoApi,
} from "../services/authApi"
import { getApiErrorMessage } from "../services/apiClient"
import { cancelMyOrderApi, createOrderApi, getMyOrdersApi, getOrderDetailsApi } from "../services/orderApi"
import { createBookingApi, getMyBookingsApi } from "../services/bookingApi"

const AuthContext = createContext(null)
const USER_SESSION_KEY = "hs_user"
const USER_TOKEN_KEY = "hs_user_token"

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

function clearUserSessionStorage() {
  localStorage.removeItem(USER_SESSION_KEY)
  localStorage.removeItem(USER_TOKEN_KEY)
}

export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY)
}

export function isUserLoggedIn() {
  const token = getUserToken()
  return !!token && !isJwtTokenExpired(token)
}

function toSafeUser(account) {
  return normalizeUserResponse(account)
}

function buildFallbackUser(identifier, token) {
  const payload = decodeJwtToken(token) || {}
  const username = String(identifier || "").trim()
  return toSafeUser({
    id: payload.userId || payload.id || payload.sub || username || "pending-user",
    username,
    fullname: username,
    email: "",
    role: "customer",
  })
}

function getAccountRole(account) {
  return String(account?.userRole || account?.role || "").trim().toUpperCase()
}

async function fetchCurrentUser(token) {
  const profile = await getMyInfoApi(token)
  return toSafeUser(profile)
}

async function fetchOrderHistory(token) {
  const orders = await getMyOrdersApi(token)
  const normalizedOrders = normalizeOrderList(orders)
  const hydratedOrders = await Promise.all(
    normalizedOrders.map(async order => {
      try {
        const numericId = Number(String(order.id).replace("#4P", ""))
        const details = await getOrderDetailsApi(numericId, token)
        return normalizeOrderResponse({ ...order, details })
      } catch {
        return order
      }
    })
  )
  return hydratedOrders
}

async function fetchBookingHistory(token) {
  const bookings = await getMyBookingsApi(token)
  return normalizeBookingList(bookings)
}

function hydrateStoredUser() {
  const saved = loadStorage(USER_SESSION_KEY)
  const token = localStorage.getItem(USER_TOKEN_KEY)

  if (!token || isJwtTokenExpired(token)) {
    clearUserSessionStorage()
    return { user: null, token: null }
  }

  if (saved?.id) {
    return {
      user: toSafeUser(saved),
      token,
    }
  }

  return { user: null, token }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(hydrateStoredUser)
  const [orders, setOrders] = useState([])
  const [bookings, setBookings] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingBookings, setLoadingBookings] = useState(false)

  useEffect(() => {
    function handleStorage(event) {
      if ([USER_SESSION_KEY, USER_TOKEN_KEY].includes(event.key)) {
        setSession(hydrateStoredUser())
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  useEffect(() => {
    async function refreshCurrentUser() {
      const token = localStorage.getItem(USER_TOKEN_KEY)
      if (!token || isJwtTokenExpired(token)) return

      try {
        const [nextUser, nextOrders, nextBookings] = await Promise.all([
          fetchCurrentUser(token),
          fetchOrderHistory(token).catch(() => []),
          fetchBookingHistory(token).catch(() => []),
        ])
        setSession({ user: nextUser, token })
        saveStorage(USER_SESSION_KEY, nextUser)
        setOrders(nextOrders)
        setBookings(nextBookings)
      } catch {
        setSession(hydrateStoredUser())
      }
    }

    refreshCurrentUser()
  }, [])

  const user = session.user
  const token = session.token

  useEffect(() => {
    let active = true

    async function loadHistories() {
      if (!token || !user?.id) {
        setOrders([])
        setBookings([])
        return
      }

      setLoadingOrders(true)
      setLoadingBookings(true)

      try {
        const nextOrders = await fetchOrderHistory(token)
        if (!active) return
        setOrders(nextOrders)
      } catch {
        if (!active) return
        setOrders([])
      } finally {
        if (!active) return
        setLoadingOrders(false)
      }

      try {
        const nextBookings = await fetchBookingHistory(token)
        if (!active) return
        setBookings(nextBookings)
      } catch {
        if (!active) return
        setBookings([])
      } finally {
        if (!active) return
        setLoadingBookings(false)
      }
    }

    loadHistories()
    const intervalId = window.setInterval(loadHistories, 10000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [token, user?.id])

  function login(userData) {
    const currentToken = getUserToken()
    const safeUser = toSafeUser(userData) || buildFallbackUser("", currentToken)
    setSession({ user: safeUser, token: currentToken })
    saveStorage(USER_SESSION_KEY, safeUser)
  }

  async function loginWithCredentials(identifier, password) {
    try {
      const username = identifier.trim()
      const nextToken = await loginUserApi({ username, password })
      localStorage.setItem(USER_TOKEN_KEY, nextToken)

      const nextUser = await fetchCurrentUser(nextToken)
      setSession({ user: nextUser, token: nextToken })
      saveStorage(USER_SESSION_KEY, nextUser)
      return { ok: true, user: nextUser, token: nextToken }
    } catch (error) {
      clearUserSessionStorage()
      return { ok: false, message: getApiErrorMessage(error, "Tên đăng nhập hoặc mật khẩu không đúng") }
    }
  }

  async function registerUser({ name, username, email, password, phone, address, gender }) {
    try {
      await registerUserApi({
        fullname: name,
        username,
        email,
        password,
        phone,
        address,
        userGender: gender,
      })

      return await loginWithCredentials(username, password)
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, "Không thể tạo tài khoản") }
    }
  }

  function logout() {
    setSession({ user: null, token: null })
    setOrders([])
    setBookings([])
    clearUserSessionStorage()
  }

  async function updateUser(data) {
    if (!user?.id) {
      return { ok: false, message: "Bạn chưa đăng nhập" }
    }

    try {
      await updateMyInfoApi({
        fullname: data.name,
        phone: data.phone,
        address: data.address,
        gender: data.gender || undefined,
      }, token)

      const nextUser = await fetchCurrentUser(token)
      setSession({ user: nextUser, token })
      saveStorage(USER_SESSION_KEY, nextUser)
      return { ok: true, user: nextUser, token }
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, "Không thể cập nhật thông tin") }
    }
  }

  async function addOrder(order) {
    if (!user?.id || !token) {
      return { ok: false, message: "Bạn cần đăng nhập để đặt hàng" }
    }

    try {
      await createOrderApi({
        note: order.notes || "",
        items: order.items,
      }, token)
      const nextOrders = await fetchOrderHistory(token)
      setOrders(nextOrders)
      return { ok: true, message: "Đặt hàng thành công" }
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, "Không thể tạo đơn hàng") }
    }
  }

  async function cancelOrder(orderId) {
    if (!user?.id || !token) {
      return { ok: false, message: "Bạn cần đăng nhập để hủy đơn hàng" }
    }

    try {
      await cancelMyOrderApi(orderId, null, token)
      const nextOrders = await fetchOrderHistory(token)
      setOrders(nextOrders)
      return { ok: true, message: "Đã hủy đơn hàng" }
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, "Không thể hủy đơn hàng") }
    }
  }

  async function addBooking(booking) {
    if (!user?.id || !token) {
      return { ok: false, message: "Bạn cần đăng nhập để đặt bàn" }
    }

    try {
      await createBookingApi({
        bookingDate: booking.bookingDate,
        guests: booking.guests,
      }, token)
      const nextBookings = await fetchBookingHistory(token)
      setBookings(nextBookings)
      return { ok: true, message: "Đặt bàn thành công" }
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, "Không thể tạo đặt bàn") }
    }
  }

  const userOrders = useMemo(() => {
    if (!user) return []
    return orders
  }, [orders, user])

  const userBookings = useMemo(() => {
    if (!user) return []
    return bookings
  }, [bookings, user])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        getToken: getUserToken,
        isLoggedIn: isUserLoggedIn,
        login,
        loginWithCredentials,
        registerUser,
        logout,
        updateUser,
        orders: userOrders,
        bookings: userBookings,
        addOrder,
        cancelOrder,
        addBooking,
        loadingOrders,
        loadingBookings,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      token: null,
      getToken: () => null,
      isLoggedIn: () => false,
      login: () => {},
      loginWithCredentials: async () => ({ ok: false }),
      registerUser: async () => ({ ok: false }),
      logout: () => {},
      updateUser: async () => ({ ok: false }),
      orders: [],
      bookings: [],
      addOrder: async () => ({ ok: false }),
      cancelOrder: async () => ({ ok: false }),
      addBooking: async () => ({ ok: false }),
      loadingOrders: false,
      loadingBookings: false,
    }
  }
  return context
}
