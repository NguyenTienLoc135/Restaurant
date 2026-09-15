import { apiClient } from "./apiClient"
import { mapMenuCategoryToApi, mapMenuStatusToApi } from "./responseAdapters"

function buildItemParams(builder = {}) {
  const params = {}

  if (builder.name?.trim()) params.name = builder.name.trim()
  if (builder.category?.trim()) params.category = mapMenuCategoryToApi(builder.category.trim())
  if (builder.leftPrice !== "" && builder.leftPrice != null) params.leftPrice = builder.leftPrice
  if (builder.rightPrice !== "" && builder.rightPrice != null) params.rightPrice = builder.rightPrice
  if (builder.isAvailable !== "" && builder.isAvailable != null) {
    params.isAvailable = builder.isAvailable
  }

  return params
}

export async function fetchPublicItemsApi(builder = {}) {
  const response = await apiClient.get("/public/item", {
    params: buildItemParams(builder),
  })
  return response.data
}

export async function fetchPublicItemDetailApi(id) {
  const response = await apiClient.get(`/public/item/${id}`)
  return response.data
}

function buildItemPayload(item) {
  return {
    name: item.name,
    price: String(item.price),
    description: item.desc || item.description || "",
    unit: item.unit || "",
    img: item.img || "",
    category: mapMenuCategoryToApi(item.cat || item.category),
    isAvailable: mapMenuStatusToApi(item.status),
  }
}

export async function fetchStaffItemsApi(builder = {}) {
  const response = await apiClient.get("/staff/item", {
    params: buildItemParams(builder),
  })
  return response.data
}

export async function createStaffItemApi(item) {
  const response = await apiClient.post("/staff/item", buildItemPayload(item))
  return response.data
}

export async function updateStaffItemApi(id, item) {
  const response = await apiClient.put(`/staff/item/${id}`, buildItemPayload(item))
  return response.data
}

export async function deleteStaffItemApi(id) {
  const response = await apiClient.delete(`/staff/item/${id}`)
  return response.data
}
