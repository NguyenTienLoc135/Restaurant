import { apiClient } from "../services/apiClient"

export async function getAdminStaffsApi() {
  const response = await apiClient.get("/admin/staffs")
  return response.data
}

export async function getAdminDriversApi() {
  const response = await apiClient.get("/admin/drivers")
  return response.data
}

export async function createAdminUserApi(payload) {
  const response = await apiClient.post("/admin/register", payload)
  return response.data
}
