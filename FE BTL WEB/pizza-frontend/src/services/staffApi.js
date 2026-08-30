import { apiClient } from "./apiClient"
import { mapBookingStatusToApi, mapOrderStatusToApi } from "./responseAdapters"

export async function getStaffOrdersApi(params = {}) {
  const response = await apiClient.get("/orders/", { params })
  return response.data
}

export async function getStaffOrderDetailsApi(id) {
  const response = await apiClient.get(`/staff/orders/${id}`)
  return response.data
}

export async function updateStaffOrderStatusApi(id, status) {
  const response = await apiClient.put(`/orders/${id}`, null, {
    params: { status: mapOrderStatusToApi(status) },
  })
  return response.data
}

export async function getStaffBookingsApi(params = {}) {
  const response = await apiClient.get("/staff/staff/reservations", { params })
  return response.data
}

export async function updateStaffBookingStatusApi(id, status) {
  const response = await apiClient.put(`/staff/reservation/${id}`, null, {
    params: { bookingStatus: mapBookingStatusToApi(status) },
  })
  return response.data
}

export async function getStaffUsersApi() {
  const response = await apiClient.get("/staff/users")
  return response.data
}

export async function updateStaffUserStatusApi(id, userIsActive) {
  const response = await apiClient.put(`/staff/users/${id}`, null, {
    params: { userIsActive },
  })
  return response.data
}
