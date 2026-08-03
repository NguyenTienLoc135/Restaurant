import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import "./Cart.css"

const DELIVERY_FEE = 15000

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, totalItems } = useCart()
  const navigate = useNavigate()

  const deliveryFee = subtotal >= 199000 ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  if (items.length === 0) return (
    <div className="cart-empty">
      <span className="cart-empty-icon">🛒</span>
      <h2>Giỏ hàng trống</h2>
      <p>Bạn chưa chọn món nào. Hãy quay lại thực đơn!</p>
      <button className="cart-back-btn" onClick={() => navigate("/order")}>
        ← Quay lại thực đơn
      </button>
    </div>
  )

  return (
    <div className="cart-page">

      <div className="cart-inner">

        {/* LEFT — items */}
        <div className="cart-left">
          <div className="cart-top">
            <button className="cart-back" onClick={() => navigate("/order")}>
              ← Thêm món
            </button>
            <div>
              <span className="cart-eyebrow">Giỏ hàng của bạn</span>
              <h1 className="cart-title">
                {totalItems} món <em>đã chọn</em>
              </h1>
            </div>
          </div>

          <div className="cart-list">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  <span>
                    {item.cat === "pizza"   && "🍕"}
                    {item.cat === "pasta"   && "🍝"}
                    {item.cat === "drinks"  && "🥤"}
                    {item.cat === "dessert" && "🍮"}
                  </span>
                </div>
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-desc">{item.desc}</p>
                  <span className="cart-item-unit">{item.price.toLocaleString("vi-VN")}₫ / món</span>
                </div>
                <div className="cart-item-right">
                  <div className="qty-ctrl">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <span className="cart-item-total">
                    {(item.price * item.qty).toLocaleString("vi-VN")}₫
                  </span>
                  <button className="cart-remove" onClick={() => removeItem(item.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — summary */}
        <div className="cart-summary">
          <h2 className="cs-title">Tóm tắt đơn hàng</h2>

          <div className="cs-rows">
            <div className="cs-row">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="cs-row">
              <span>Phí giao hàng</span>
              <span className={deliveryFee === 0 ? "cs-free" : ""}>
                {deliveryFee === 0 ? "Miễn phí" : `${DELIVERY_FEE.toLocaleString("vi-VN")}₫`}
              </span>
            </div>
            {deliveryFee > 0 && (
              <p className="cs-hint">
                Thêm {(199000 - subtotal).toLocaleString("vi-VN")}₫ để miễn phí giao hàng
              </p>
            )}
          </div>

          <div className="cs-divider" />

          <div className="cs-total-row">
            <span>Tổng cộng</span>
            <span className="cs-total-price">{total.toLocaleString("vi-VN")}₫</span>
          </div>

          <button
            className="cs-checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Tiến hành đặt hàng →
          </button>

          <div className="cs-trust">
            <span>🔒 Thanh toán bảo mật</span>
            <span>🕐 Giao trong 30–45 phút</span>
            <span>🍕 Nóng giòn đảm bảo</span>
          </div>
        </div>

      </div>
    </div>
  )
}
