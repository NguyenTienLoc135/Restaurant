const STAFF_DB_KEY = "hs_staff_db"
const USER_DB_KEY = "hs_users_db"

const STAFF_SEED = [
  {
    id: 1,
    username: "staff",
    email: "staff@haisapa.vn",
    password: "staff123",
    name: "Tran Hai Nam",
    role: "staff",
    avatar: "S",
    phone: "0901 000 001",
    joined: "01/01/2024",
  },
  {
    id: 2,
    username: "driver",
    email: "driver@haisapa.vn",
    password: "driver123",
    name: "Le Van Tai",
    role: "driver",
    avatar: "D",
    phone: "0901 000 002",
    joined: "01/03/2024",
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

function normalizeStaffAccount(account, fallback) {
  const base = fallback || {}
  const nextRole = account.role === "driver" ? "driver" : "staff"
  const nextName = account.name?.trim() || base.name || "Staff"

  return {
    ...base,
    ...account,
    username: (account.username || base.username || nextRole).trim().toLowerCase(),
    email: (account.email || base.email || `${nextRole}@haisapa.vn`).trim().toLowerCase(),
    password: account.password || base.password || `${nextRole}123`,
    name: nextName,
    role: nextRole,
    avatar: (account.avatar || nextName.charAt(0) || nextRole.charAt(0)).toUpperCase(),
    phone: account.phone ?? base.phone ?? "",
    joined: account.joined || base.joined || new Date().toLocaleDateString("vi-VN"),
  }
}

function normalizeStaffAccounts(accounts) {
  const source = Array.isArray(accounts) ? accounts : []
  const mapped = { staff: null, driver: null }

  source.forEach(account => {
    if (!account) return
    const role = account.role === "driver" ? "driver" : "staff"
    if (!mapped[role]) {
      mapped[role] = normalizeStaffAccount(account, STAFF_SEED.find(item => item.role === role))
    }
  })

  return STAFF_SEED.map(seed => mapped[seed.role] || seed)
}

export function getStaffAccounts() {
  const current = readStorage(STAFF_DB_KEY, null)
  const normalized = normalizeStaffAccounts(current?.length ? current : STAFF_SEED)
  writeStorage(STAFF_DB_KEY, normalized)
  return normalized
}

export function getUserAccounts() {
  return readStorage(USER_DB_KEY, [])
}

export function getUserAccountById(userId) {
  return getUserAccounts().find(account => account.id === userId) || null
}

export function findStaffAccount(identifier, password) {
  const normalized = identifier.trim().toLowerCase()
  return getStaffAccounts().find(
    account =>
      (account.username.toLowerCase() === normalized || account.email.toLowerCase() === normalized) &&
      account.password === password
  )
}

export function findStaffAccountByIdentifier(identifier) {
  const normalized = identifier.trim().toLowerCase()
  return getStaffAccounts().find(
    account =>
      account.username.toLowerCase() === normalized || account.email.toLowerCase() === normalized
  ) || null
}

export function findUserAccount(email, password) {
  const normalized = email.trim().toLowerCase()
  return getUserAccounts().find(
    account => account.email.toLowerCase() === normalized && account.password === password
  )
}

export function createUserAccount({ name, email, password }) {
  const users = getUserAccounts()
  const normalized = email.trim().toLowerCase()

  if (users.some(user => user.email.toLowerCase() === normalized)) {
    return { ok: false, message: "Email nay da duoc dang ky" }
  }

  const nextUser = {
    id: Date.now(),
    name: name.trim(),
    email: normalized,
    password,
    role: "user",
    phone: "",
    joined: new Date().toLocaleDateString("vi-VN"),
  }

  const updated = [nextUser, ...users]
  writeStorage(USER_DB_KEY, updated)
  return { ok: true, user: nextUser }
}

export function updateUserAccount(userId, data) {
  const users = getUserAccounts()
  const current = users.find(account => account.id === userId)

  if (!current) {
    return { ok: false, message: "Khong tim thay tai khoan nguoi dung" }
  }

  const nextEmail = data.email?.trim().toLowerCase() || current.email
  const nextPhone = data.phone?.trim() ?? current.phone ?? ""
  const nextName = data.name?.trim() || current.name

  if (!/\S+@\S+\.\S+/.test(nextEmail)) {
    return { ok: false, message: "Email khong hop le" }
  }

  const emailTaken = users.some(
    account => account.id !== userId && account.email.toLowerCase() === nextEmail
  )
  if (emailTaken) {
    return { ok: false, message: "Email nay da duoc su dung" }
  }

  const updatedUser = {
    ...current,
    name: nextName,
    email: nextEmail,
    phone: nextPhone,
  }

  const updatedUsers = users.map(account => (account.id === userId ? updatedUser : account))
  writeStorage(USER_DB_KEY, updatedUsers)
  return { ok: true, user: updatedUser }
}

export function removeUserAccount(userId) {
  const users = getUserAccounts()
  const current = users.find(account => account.id === userId)

  if (!current) {
    return { ok: false, message: "Khong tim thay tai khoan nguoi dung" }
  }

  const updatedUsers = users.filter(account => account.id !== userId)
  writeStorage(USER_DB_KEY, updatedUsers)

  try {
    const currentSession = JSON.parse(localStorage.getItem("hs_user") || "null")
    if (currentSession?.id === userId) {
      localStorage.removeItem("hs_user")
    }
  } catch {
    localStorage.removeItem("hs_user")
  }

  return { ok: true, user: current }
}

export function updateStaffAccount(staffId, data) {
  const staffAccounts = getStaffAccounts()
  const current = staffAccounts.find(account => account.id === staffId)

  if (!current) {
    return { ok: false, message: "Khong tim thay tai khoan staff" }
  }

  const nextEmail = data.email?.trim().toLowerCase() || current.email
  const nextPhone = data.phone?.trim() ?? current.phone ?? ""
  const nextName = data.name?.trim() || current.name

  if (!/\S+@\S+\.\S+/.test(nextEmail)) {
    return { ok: false, message: "Email khong hop le" }
  }

  const emailTaken = staffAccounts.some(
    account => account.id !== staffId && account.email.toLowerCase() === nextEmail
  )
  if (emailTaken) {
    return { ok: false, message: "Email nay da duoc su dung" }
  }

  const updatedAccount = {
    ...current,
    name: nextName,
    email: nextEmail,
    phone: nextPhone,
    avatar: nextName.charAt(0).toUpperCase(),
  }

  const updatedAccounts = staffAccounts.map(account =>
    account.id === staffId ? updatedAccount : account
  )

  writeStorage(STAFF_DB_KEY, updatedAccounts)
  return { ok: true, staff: updatedAccount }
}

export function changeStaffAccountPassword(staffId, currentPassword, nextPassword) {
  const staffAccounts = getStaffAccounts()
  const current = staffAccounts.find(account => account.id === staffId)

  if (!current) {
    return { ok: false, message: "Khong tim thay tai khoan staff" }
  }

  if (current.password !== currentPassword) {
    return { ok: false, message: "Mat khau hien tai khong dung" }
  }

  if (!nextPassword || nextPassword.length < 6) {
    return { ok: false, message: "Mat khau moi phai co it nhat 6 ky tu" }
  }

  const updatedAccount = { ...current, password: nextPassword }
  const updatedAccounts = staffAccounts.map(account =>
    account.id === staffId ? updatedAccount : account
  )

  writeStorage(STAFF_DB_KEY, updatedAccounts)
  return { ok: true }
}
