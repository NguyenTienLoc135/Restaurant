import { Link } from "react-router-dom"

function PizzaCard({ pizza }) {

  return (
    <div className="col-md-3 mb-4">
      <div className="card">

        <img src={pizza.thumbnail} className="card-img-top"/>

        <div className="card-body">

          <h5>{pizza.title}</h5>

          <p>${pizza.price}</p>

          <Link to={`/pizza/${pizza.id}`} className="btn btn-primary">
            View
          </Link>

        </div>
      </div>
    </div>
  )
}

export default PizzaCard