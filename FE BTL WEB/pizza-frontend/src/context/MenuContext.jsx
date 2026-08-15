import { createContext, useContext, useMemo, useState } from "react"
import { INITIAL_MENU_ITEMS, MENU_CATEGORIES, MENU_STATUS, getCategoryLabel } from "../data/menuData"

const MenuContext = createContext(null)

function loadMenu() {
  try {
    const saved = localStorage.getItem("hs_menu")
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS
  } catch {
    return INITIAL_MENU_ITEMS
  }
}

function saveMenu(items) {
  localStorage.setItem("hs_menu", JSON.stringify(items))
}

export function MenuProvider({ children }) {
  const [items, setItems] = useState(loadMenu)

  function createItem(data) {
    const nextItem = {
      id: Date.now(),
      badge: null,
      origin: "",
      ingredients: "",
      story: "",
      status: MENU_STATUS.available,
      ...data,
      price: Number(data.price),
    }
    const updated = [...items, nextItem]
    setItems(updated)
    saveMenu(updated)
  }

  function updateItem(id, changes) {
    const updated = items.map(item =>
      item.id === id
        ? {
            ...item,
            ...changes,
            price: changes.price !== undefined ? Number(changes.price) : item.price,
          }
        : item
    )
    setItems(updated)
    saveMenu(updated)
  }

  function deleteItem(id) {
    const updated = items.filter(item => item.id !== id)
    setItems(updated)
    saveMenu(updated)
  }

  function toggleItemStatus(id) {
    const updated = items.map(item =>
      item.id === id
        ? {
            ...item,
            status: item.status === MENU_STATUS.available ? MENU_STATUS.outOfStock : MENU_STATUS.available,
          }
        : item
    )
    setItems(updated)
    saveMenu(updated)
  }

  const value = useMemo(() => {
    const normalizedItems = items.map(item => ({ ...item, catLabel: getCategoryLabel(item.cat) }))
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
      createItem,
      updateItem,
      deleteItem,
      toggleItemStatus,
    }
  }, [items])

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
      createItem: () => {},
      updateItem: () => {},
      deleteItem: () => {},
      toggleItemStatus: () => {},
    }
  }
  return context
}
