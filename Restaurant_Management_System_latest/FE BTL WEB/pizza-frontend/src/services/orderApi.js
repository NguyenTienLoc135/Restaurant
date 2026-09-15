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

export async function createOrderApi(payload, token) {
  const response = await apiClient.post("/orders/", payload, withAuthConfig(token))
  return response.data
}

export async function getMyOrdersApi(token) {
  const response = await apiClient.get("/orders/me", withAuthConfig(token))
  return response.data
}

export async function getOrderDetailsApi(id, token) {
  const response = await apiClient.get(`/orders/${id}`, withAuthConfig(token))
  return response.data
}

export async function cancelMyOrderApi(id, reason, token) {
  const response = await apiClient.delete(`/orders/${id}`, withAuthConfig(token))
  return response.data
}
