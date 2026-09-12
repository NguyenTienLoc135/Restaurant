import { apiClient } from "./apiClient"
import { mapBookingStatusToApi, mapOrderStatusToApi } from "./responseAdapters"

const ORDER_STATUS_API_BY_ASCII = {
  "Cho xac nhan": "PENDING",
  "Dang chuan bi": "ACCEPTED",
  "Da giao cho shipper": "DELIVERY",
  "Dang giao hang": "DELIVERY",
  "Da hoan thanh": "COMPLETED",
  "Da huy": "CANCELLED",
  "Khach khong nhan mon": "INCOMPLETE",
}

const BOOKING_STATUS_API_BY_ASCII = {
  "Cho xac nhan": "PENDING",
  "Ban da dat": "ACCEPTED",
  "Da huy": "CANCELLED",
}

function toOrderStatusParam(status) {
  return ORDER_STATUS_API_BY_ASCII[status] || mapOrderStatusToApi(status)
}

function toBookingStatusParam(status) {
  return BOOKING_STATUS_API_BY_ASCII[status] || mapBookingStatusToApi(status)
}

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
    params: { status: toOrderStatusParam(status) },
  })
  return response.data
}

export async function getStaffBookingsApi(params = {}) {
  const response = await apiClient.get("/staff/staff/reservations", { params })
  return response.data
}

export async function updateStaffBookingStatusApi(id, status) {
  const response = await apiClient.put(`/staff/reservation/${id}`, null, {
    params: { bookingStatus: toBookingStatusParam(status) },
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
