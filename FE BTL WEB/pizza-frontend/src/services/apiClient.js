import axios from "axios"

const DEFAULT_API_BASE_URL = "http://localhost:8082"

function getStoredToken() {
  return (
    localStorage.getItem("hs_user_token") ||
    localStorage.getItem("hs_staff_token") ||
    ""
  )
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(config => {
  const token = getStoredToken()
  if (token) {
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
