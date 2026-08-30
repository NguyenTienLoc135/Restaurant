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
