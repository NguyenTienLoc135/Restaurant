import { createContext, useContext, useState } from "react"
import { changeStaffAccountPassword, findStaffAccount, updateStaffAccount } from "../data/authDb"

const StaffContext = createContext(null)

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

function toSafeStaff(account) {
  const { password: _password, ...safeAccount } = account
  return safeAccount
}

export function StaffProvider({ children }) {
  const [staff, setStaff] = useState(() => loadStorage("hs_staff"))

  function syncStaffSession(account) {
    const safeAccount = toSafeStaff(account)
    setStaff(safeAccount)
    saveStorage("hs_staff", safeAccount)
    return safeAccount
  }

  function staffLogin(identifier, password) {
    const account = findStaffAccount(identifier, password)
    if (!account) return false

    syncStaffSession(account)
    return true
  }

  function staffLoginWithAccount(account) {
    syncStaffSession(account)
  }

  function staffLogout() {
    setStaff(null)
    localStorage.removeItem("hs_staff")
  }

  function updateStaffProfile(data) {
    if (!staff?.id) {
      return { ok: false, message: "Bạn chưa đăng nhập tài khoản staff" }
    }

    const result = updateStaffAccount(staff.id, data)
    if (!result.ok) return result

    syncStaffSession(result.staff)
    return { ok: true, staff: toSafeStaff(result.staff) }
  }

  function changeStaffPassword(currentPassword, nextPassword) {
    if (!staff?.id) {
      return { ok: false, message: "Bạn chưa đăng nhập tài khoản staff" }
    }

    return changeStaffAccountPassword(staff.id, currentPassword, nextPassword)
  }

  return (
    <StaffContext.Provider
      value={{
        staff,
        staffLogin,
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
      staffLogin: () => false,
      staffLoginWithAccount: () => {},
      staffLogout: () => {},
      updateStaffProfile: () => ({ ok: false }),
      changeStaffPassword: () => ({ ok: false }),
    }
  }
  return context
}
