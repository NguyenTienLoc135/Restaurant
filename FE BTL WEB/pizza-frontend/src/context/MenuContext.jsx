import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { MENU_CATEGORIES, MENU_STATUS } from "../data/menuData"
import {
  createStaffItemApi,
  deleteStaffItemApi,
  fetchPublicItemsApi,
  fetchStaffItemsApi,
  updateStaffItemApi,
} from "../services/menuApi"
import { getApiErrorMessage } from "../services/apiClient"
import { normalizeMenuList } from "../services/responseAdapters"

const MenuContext = createContext(null)

function loadMenuFallback() {
  try {
    const saved = localStorage.getItem("hs_menu")
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveMenuFallback(items) {
  localStorage.setItem("hs_menu", JSON.stringify(items))
}

function normalizeSearchText(value) {
  return (value || "").trim().toLowerCase()
}

function toAvailabilityString(status) {
  return status === MENU_STATUS.available ? "true" : "false"
}

export function searchMenuItems(items, builder = {}) {
  const {
    name = "",
    category = "",
    leftPrice = null,
    rightPrice = null,
    isAvailable = "",
  } = builder

  const normalizedName = normalizeSearchText(name)
  const normalizedCategory = normalizeSearchText(category)
  const normalizedAvailable = String(isAvailable || "").trim().toLowerCase()
  const minPrice = leftPrice === "" || leftPrice == null ? null : Number(leftPrice)
  const maxPrice = rightPrice === "" || rightPrice == null ? null : Number(rightPrice)

  return items.filter(item => {
    const matchesName =
      !normalizedName ||
      item.name.toLowerCase().includes(normalizedName) ||
      item.desc?.toLowerCase().includes(normalizedName) ||
      item.ingredients?.toLowerCase().includes(normalizedName)

    const matchesCategory =
      !normalizedCategory ||
      item.cat.toLowerCase() === normalizedCategory ||
      item.catLabel?.toLowerCase() === normalizedCategory

    const matchesMinPrice = minPrice == null || item.price >= minPrice
    const matchesMaxPrice = maxPrice == null || item.price <= maxPrice

    const matchesAvailable =
      !normalizedAvailable ||
      toAvailabilityString(item.status) === normalizedAvailable

    return matchesName && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesAvailable
  })
}

export function MenuProvider({ children }) {
  const [items, setItems] = useState(loadMenuFallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isBackendSynced, setIsBackendSynced] = useState(false)

  useEffect(() => {
    async function loadFromApi() {
      try {
        setLoading(true)
        const apiItems = await fetchPublicItemsApi()
        const normalized = normalizeMenuList(apiItems)
        setItems(normalized)
        saveMenuFallback(normalized)
        setIsBackendSynced(true)
        setError("")
      } catch (apiError) {
        setItems(loadMenuFallback())
        setIsBackendSynced(false)
        setError(getApiErrorMessage(apiError, "Khong the tai menu tu server"))
      } finally {
        setLoading(false)
      }
    }

    loadFromApi()
  }, [])

  async function refreshFromStaffApi() {
    const apiItems = await fetchStaffItemsApi()
    const normalized = normalizeMenuList(apiItems)
    setItems(normalized)
    saveMenuFallback(normalized)
    setIsBackendSynced(true)
    return normalized
  }

  async function createItem(data) {
    await createStaffItemApi(data)
    return refreshFromStaffApi()
  }

  async function updateItem(id, changes) {
    await updateStaffItemApi(id, changes)
    return refreshFromStaffApi()
  }

  async function deleteItem(id) {
    await deleteStaffItemApi(id)
    return refreshFromStaffApi()
  }

  async function toggleItemStatus(id) {
    const current = items.find(item => item.id === id)
    if (!current) return []
    const nextStatus = current.status === MENU_STATUS.available ? MENU_STATUS.outOfStock : MENU_STATUS.available
    await updateStaffItemApi(id, { ...current, status: nextStatus })
    return refreshFromStaffApi()
  }

  const value = useMemo(() => {
    const normalizedItems = items
    const activeItems = normalizedItems.filter(item => item.status === MENU_STATUS.available)
    const groupedSections = MENU_CATEGORIES.map(category => ({
      id: category.key,
      category: category.label,
      items: normalizedItems.filter(item => item.cat === category.key),
    })).filter(section => section.items.length > 0)

    return {
      items: normalizedItems,
      activeItems,
      groupedSections,
      categories: MENU_CATEGORIES,
      loading,
      error,
      isBackendSynced,
      searchItems: searchBuilder => searchMenuItems(normalizedItems, searchBuilder),
      refreshItems: async builder => {
        const apiItems = await fetchPublicItemsApi(builder)
        const normalized = normalizeMenuList(apiItems)
        setItems(normalized)
        saveMenuFallback(normalized)
        setIsBackendSynced(true)
        return normalized
      },
      createItem,
      updateItem,
      deleteItem,
      toggleItemStatus,
    }
  }, [error, isBackendSynced, items, loading])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    return {
      items: [],
      activeItems: [],
      groupedSections: [],
      categories: MENU_CATEGORIES,
      loading: false,
      error: "",
      isBackendSynced: false,
      searchItems: () => [],
      refreshItems: async () => [],
      createItem: async () => [],
      updateItem: async () => [],
      deleteItem: async () => [],
      toggleItemStatus: async () => [],
    }
  }
  return context
}

