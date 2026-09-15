import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchPublicItemDetailApi } from "../../services/menuApi"
import { normalizeMenuItemDetailResponse } from "../../services/responseAdapters"
import { getApiErrorMessage } from "../../services/apiClient"
import { useCart } from "../../context/CartContext"

function PizzaDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [pizza, setPizza] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadItem() {
      try {
        const data = await fetchPublicItemDetailApi(id)
        setPizza(normalizeMenuItemDetailResponse(data))
        setError("")
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, "Không thể tải chi tiết món"))
      }
    }

    loadItem()
  }, [id])

  if (error) return <h2 style={{ padding: 24 }}>{error}</h2>
  if (!pizza) return <h2 style={{ padding: 24 }}>Loading...</h2>

  return (
    <div className="container mt-4">
      <h2>{pizza.name}</h2>
      <img src={pizza.img} width="300" alt={pizza.name} />
      <p>{pizza.desc}</p>
      <h3>{pizza.price.toLocaleString("vi-VN")}₫</h3>
      <button className="btn btn-success" onClick={() => addItem(pizza)}>
        Add to Cart
      </button>
    </div>
  )
}

export default PizzaDetail
