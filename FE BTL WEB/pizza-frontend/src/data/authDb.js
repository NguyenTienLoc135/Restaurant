const STAFF_DB_KEY = "hs_staff_db"
const USER_DB_KEY = "hs_users_db"

const STAFF_SEED = [
  {
    id: 1,
    username: "admin",
    email: "admin@haisapa.vn",
    password: "admin123",
    name: "Trần Hải Nam",
    role: "admin",
    avatar: "A",
    phone: "0901 000 001",
    joined: "01/01/2024",
  },
  {
    id: 2,
    username: "staff",
    email: "staff@haisapa.vn",
    password: "staff123",
    name: "Nguyễn Minh Anh",
    role: "staff",
    avatar: "S",
    phone: "0901 000 002",
    joined: "01/02/2024",
  },
  {
    id: 3,
    username: "driver",
    email: "driver@haisapa.vn",
    password: "driver123",
    name: "Lê Văn Tài",
    role: "driver",
    avatar: "D",
    phone: "0901 000 003",
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

export function getStaffAccounts() {
  const current = readStorage(STAFF_DB_KEY, null)
  if (current?.length) return current
  writeStorage(STAFF_DB_KEY, STAFF_SEED)
  return STAFF_SEED
}

export function getUserAccounts() {
  return readStorage(USER_DB_KEY, [])
}

export function findStaffAccount(identifier, password) {
  const normalized = identifier.trim().toLowerCase()
  return getStaffAccounts().find(
    account =>
      (account.username.toLowerCase() === normalized || account.email.toLowerCase() === normalized) &&
      account.password === password
  )
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
    return { ok: false, message: "Email này đã được đăng ký" }
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

export function updateStaffAccount(staffId, data) {
  const staffAccounts = getStaffAccounts()
  const current = staffAccounts.find(account => account.id === staffId)

  if (!current) {
    return { ok: false, message: "Không tìm thấy tài khoản nhân viên" }
  }

  const nextEmail = data.email?.trim().toLowerCase() || current.email
  const nextPhone = data.phone?.trim() ?? current.phone ?? ""
  const nextName = data.name?.trim() || current.name

  if (!/\S+@\S+\.\S+/.test(nextEmail)) {
    return { ok: false, message: "Email không hợp lệ" }
  }

  const emailTaken = staffAccounts.some(
    account => account.id !== staffId && account.email.toLowerCase() === nextEmail
  )
  if (emailTaken) {
    return { ok: false, message: "Email này đã được sử dụng" }
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
    return { ok: false, message: "Không tìm thấy tài khoản nhân viên" }
  }

  if (current.password !== currentPassword) {
    return { ok: false, message: "Mật khẩu hiện tại không đúng" }
  }

  if (!nextPassword || nextPassword.length < 6) {
    return { ok: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự" }
  }

  const updatedAccount = { ...current, password: nextPassword }
  const updatedAccounts = staffAccounts.map(account =>
    account.id === staffId ? updatedAccount : account
  )

  writeStorage(STAFF_DB_KEY, updatedAccounts)
  return { ok: true }
}
