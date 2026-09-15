import { apiClient } from "./apiClient"

export async function getDriverAvailableOrdersApi() {
  const response = await apiClient.get("/delivery")
  return response.data
}

export async function getDriverDeliveringOrdersApi() {
  const response = await apiClient.get("/delivery/deliverying")
  return response.data
}

export async function getDriverDeliveredOrdersApi() {
  const response = await apiClient.get("/delivery/deliveried")
  return response.data
}

export async function claimDriverOrderApi(id) {
  const response = await apiClient.put(`/delivery/${id}`)
  return response.data
}

export async function completeDriverOrderApi(id, status = "COMPLETED") {
  const response = await apiClient.put(`/delivery/update/${id}`, null, {
    params: { status },
  })
  return response.data
}
