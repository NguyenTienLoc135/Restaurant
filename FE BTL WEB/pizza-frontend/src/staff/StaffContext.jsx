import { createContext, useContext, useState } from "react"
import { findStaffAccountByIdentifier } from "../data/authDb"
import { isJwtTokenExpired } from "../services/jwt"
import { getMyInfoApi, loginUserApi, updateMyInfoApi } from "../services/authApi"
import { getApiErrorMessage } from "../services/apiClient"
import { normalizeUserResponse } from "../services/responseAdapters"

const StaffContext = createContext(null)
const STAFF_SESSION_KEY = "hs_staff"
const STAFF_TOKEN_KEY = "hs_staff_token"

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

function clearStaffSessionStorage() {
  localStorage.removeItem(STAFF_SESSION_KEY)
  localStorage.removeItem(STAFF_TOKEN_KEY)
}

function clearUserSessionShadow() {
  localStorage.removeItem("hs_user")
  localStorage.removeItem("hs_user_token")
}

export function getStaffToken() {
  return localStorage.getItem(STAFF_TOKEN_KEY)
}

export function isStaffLoggedIn() {
  const token = getStaffToken()
  return !!token && !isJwtTokenExpired(token)
}

function toSafeStaff(account, fallbackRole = "staff") {
  const normalized = normalizeUserResponse(account)
  const nextRole = String(account?.role || account?.userRole || fallbackRole || normalized?.role).trim().toLowerCase()
  return {
    ...normalized,
    role: nextRole,
    avatar: normalized?.avatar || normalized?.name?.charAt(0)?.toUpperCase() || nextRole.charAt(0).toUpperCase(),
  }
}

async function fetchCurrentStaff(roleHint, token) {
  const profile = await getMyInfoApi(token)
  return toSafeStaff(profile, roleHint)
}

function hydrateStoredStaff() {
  const saved = loadStorage(STAFF_SESSION_KEY)
  const token = localStorage.getItem(STAFF_TOKEN_KEY)

  if (saved?.id && token && !isJwtTokenExpired(token)) {
    return { staff: toSafeStaff(saved, saved.role), token }
  }

  clearStaffSessionStorage()

  const userShadow = loadStorage("hs_user")
  const userShadowToken = localStorage.getItem("hs_user_token")
  const identifier = userShadow?.username || userShadow?.email || ""

  if (!userShadow?.id || !userShadowToken || isJwtTokenExpired(userShadowToken) || !identifier) {
    return { staff: null, token: null }
  }

  const matchedStaff = findStaffAccountByIdentifier(identifier)
  if (!matchedStaff) {
    return { staff: null, token: null }
  }

  const hydratedStaff = toSafeStaff({ ...userShadow, role: matchedStaff.role }, matchedStaff.role)
  clearUserSessionShadow()
  saveStorage(STAFF_SESSION_KEY, hydratedStaff)
  localStorage.setItem(STAFF_TOKEN_KEY, userShadowToken)

  return { staff: hydratedStaff, token: userShadowToken }
}

export function StaffProvider({ children }) {
  const [session, setSession] = useState(hydrateStoredStaff)

  const staff = session.staff
  const token = session.token

  function syncStaffSession(account, nextToken) {
    const safeAccount = toSafeStaff(account, account?.role)
    clearUserSessionShadow()
    setSession({ staff: safeAccount, token: nextToken })
    saveStorage(STAFF_SESSION_KEY, safeAccount)
    localStorage.setItem(STAFF_TOKEN_KEY, nextToken)
    return safeAccount
  }

  function acceptStaffSession(account, nextToken) {
    const safeAccount = syncStaffSession(account, nextToken)
    return { ok: true, staff: safeAccount, token: nextToken }
  }

  async function staffLogin(identifier, password) {
    try {
      const nextToken = await loginUserApi({ username: identifier.trim(), password })
      const nextStaff = await fetchCurrentStaff("staff", nextToken)
      const nextRole = String(nextStaff?.role || "").trim().toLowerCase()

      if (nextRole !== "staff" && nextRole !== "driver") {
        clearStaffSessionStorage()
        return { ok: false, message: "Tài khoản này không có quyền staff." }
      }

      const safeStaff = syncStaffSession({ ...nextStaff, role: nextRole }, nextToken)
      return { ok: true, staff: safeStaff, token: nextToken }
    } catch (error) {
      clearStaffSessionStorage()
      return { ok: false, message: getApiErrorMessage(error, "Không thể đăng nhập staff") }
    }
  }

  function staffLoginWithAccount(account) {
    return staffLogin(account.username, account.password)
  }

  function staffLogout() {
    setSession({ staff: null, token: null })
    clearStaffSessionStorage()
  }

  async function updateStaffProfile(data) {
    if (!staff?.id) {
      return { ok: false, message: "Bạn chưa đăng nhập tài khoản staff" }
    }

    try {
      await updateMyInfoApi({
        fullname: data.name,
        phone: data.phone,
        address: data.address,
      }, token)
      const refreshed = await fetchCurrentStaff(staff.role, token)
      const safeStaff = syncStaffSession({ ...refreshed, role: staff.role }, token)
      return { ok: true, staff: safeStaff }
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, "Không thể cập nhật staff") }
    }
  }

  function changeStaffPassword() {
    return { ok: false, message: "Backend hiện chưa có endpoint đổi mật khẩu cho staff" }
  }

  return (
    <StaffContext.Provider
      value={{
        staff,
        token,
        getToken: getStaffToken,
        isLoggedIn: isStaffLoggedIn,
        staffLogin,
        acceptStaffSession,
        staffLoginWithAccount,
        staffLogout,
        updateStaffProfile,
        changeStaffPassword,
      }}
    >
      {children}
    </StaffContext.Provider>
  )
}

export function useStaff() {
  const context = useContext(StaffContext)
  if (!context) {
    return {
      staff: null,
      token: null,
      getToken: () => null,
      isLoggedIn: () => false,
      staffLogin: async () => ({ ok: false }),
      acceptStaffSession: async () => ({ ok: false }),
      staffLoginWithAccount: async () => ({ ok: false }),
      staffLogout: () => {},
      updateStaffProfile: async () => ({ ok: false }),
      changeStaffPassword: () => ({ ok: false }),
    }
  }
  return context
}
