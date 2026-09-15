import axios from "axios"

const DEFAULT_API_BASE_URL = "http://localhost:8082"

function isStaffRoute() {
  if (typeof window === "undefined") return false
  return window.location.pathname.startsWith("/staff")
}

function getStoredToken(requestUrl = "") {
  const userToken = localStorage.getItem("hs_user_token") || ""
  const staffToken = localStorage.getItem("hs_staff_token") || ""
  const normalizedUrl = String(requestUrl || "")
  const prefersStaffToken =
    isStaffRoute() ||
    normalizedUrl.startsWith("/staff") ||
    normalizedUrl.startsWith("/delivery") ||
    normalizedUrl === "/orders/" ||
    /^\/orders\/\d+$/.test(normalizedUrl)

  if (prefersStaffToken) {
    return staffToken || userToken || ""
  }

  return userToken || staffToken || ""
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(config => {
  const existingAuthorization = config.headers?.Authorization || config.headers?.authorization
  if (existingAuthorization) {
    return config
  }

  const token = getStoredToken(config.url)
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getApiErrorMessage(error, fallback = "Có lỗi xảy ra, vui lòng thử lại.") {
  const responseData = error?.response?.data

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData
  }

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message
  }

  return fallback
}
