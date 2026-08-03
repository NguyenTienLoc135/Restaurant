import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

function PizzaDetail() {

  const { id } = useParams()
  const [pizza, setPizza] = useState(null)

  useEffect(() => {

    fetch(`https://dummyjson.com/products/${id}`)
      .then(res => res.json())
      .then(data => setPizza(data))

  }, [id])

  if (!pizza) return <h2>Loading...</h2>

  return (
    <div className="container mt-4">

      <h2>{pizza.title}</h2>

      <img src={pizza.thumbnail} width="300"/>

      <p>{pizza.description}</p>

      <h3>${pizza.price}</h3>

      <button className="btn btn-success">
        Add to Cart
      </button>

    </div>
  )
}

export default PizzaDetail