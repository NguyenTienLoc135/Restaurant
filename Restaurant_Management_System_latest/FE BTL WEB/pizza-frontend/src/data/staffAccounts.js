export const STAFF_ACCOUNTS = [
  {
    id: 1,
    username: "staff",
    email: "staff@haisapa.vn",
    password: "staff123",
    name: "Nguyen Minh Anh",
    role: "staff",
    avatar: "S",
  },
  {
    id: 2,
    username: "admin",
    email: "admin@haisapa.vn",
    password: "admin123",
    name: "Tran Hai Nam",
    role: "admin",
    avatar: "A",
  },
  {
    id: 3,
    username: "driver",
    email: "driver@haisapa.vn",
    password: "driver123",
    name: "Le Van Tai",
    role: "driver",
    avatar: "D",
  },
]

export function findStaffAccount(identifier, password) {
  const normalized = identifier.trim().toLowerCase()
  return STAFF_ACCOUNTS.find(
    account =>
      (account.username === normalized || account.email === normalized) &&
      account.password === password
  )
}
