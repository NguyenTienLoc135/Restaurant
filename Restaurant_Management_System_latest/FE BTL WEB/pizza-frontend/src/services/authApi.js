import { apiClient } from "./apiClient"

function withAuthConfig(token) {
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined
}

export async function loginUserApi({ username, password }) {
  const response = await apiClient.post("/public/login", { username, password })
  return response.data
}

export async function registerUserApi({
  fullname,
  username,
  password,
  phone,
  address,
  email,
  userGender,
}) {
  const response = await apiClient.post("/public/register", {
    fullname,
    username,
    password,
    phone,
    address,
    email,
    userGender,
  })
  return response.data
}

export async function getMyInfoApi(token) {
  const response = await apiClient.get("/info/me", withAuthConfig(token))
  return response.data
}

export async function updateMyInfoApi(payload, token) {
  const response = await apiClient.patch("/info/me", payload, withAuthConfig(token))
  return response.data
}

function isAccessDenied(error) {
  const status = Number(error?.response?.status)
  return status === 401 || status === 403
}

export async function resolveAccountRoleApi(token) {
  try {
    await apiClient.get("/staff/users", withAuthConfig(token))
    return "staff"
  } catch (error) {
    if (!isAccessDenied(error)) throw error
  }

  try {
    await apiClient.get("/delivery", withAuthConfig(token))
    return "driver"
  } catch (error) {
    if (!isAccessDenied(error)) throw error
  }

  return "customer"
}
