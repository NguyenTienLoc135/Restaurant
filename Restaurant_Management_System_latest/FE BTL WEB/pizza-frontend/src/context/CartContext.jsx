import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useMenu } from "./MenuContext"
import { MENU_STATUS } from "../data/menuData"

const CartContext = createContext()

export function CartProvider({ children }) {
  const { items: menuItems } = useMenu()
  const [items, setItems] = useState([])

  const menuMap = useMemo(
    () => new Map(menuItems.map(item => [item.id, item])),
    [menuItems]
  )

  useEffect(() => {
    setItems(prev =>
      prev
        .filter(item => menuMap.has(item.id))
        .map(item => ({ ...item, ...menuMap.get(item.id), qty: item.qty }))
    )
  }, [menuMap])

  function addItem(product) {
    const latest = menuMap.get(product.id)
    if (!latest || latest.status === MENU_STATUS.outOfStock) return

    setItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...prev, { ...latest, qty: 1 }]
    })
  }

  function removeItem(id) {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  function updateQty(id, qty) {
    if (qty <= 0) return removeItem(id)
    setItems(prev => prev.map(item => (item.id === id ? { ...item, qty } : item)))
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
