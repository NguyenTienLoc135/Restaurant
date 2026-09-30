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

export async function createBookingApi(payload, token) {
  const response = await apiClient.post("/user/booking/me", payload, withAuthConfig(token))
  return response.data
}

export async function getMyBookingsApi(token) {
  const response = await apiClient.get("/user/user/reservation/me", withAuthConfig(token))
  return response.data
}

export async function cancelMyBookingApi(id, token) {
  const response = await apiClient.delete(`/user/booking/me/${id}`, withAuthConfig(token))
  return response.data
}
