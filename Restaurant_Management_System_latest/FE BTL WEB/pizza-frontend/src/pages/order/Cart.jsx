import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../context/LanguageContext"
import { useCart } from "../../context/CartContext"
import "./Cart.css"

const DELIVERY_FEE = 15000

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, totalItems } = useCart()
  const { isEnglish } = useLanguage()
  const navigate = useNavigate()

  const text = isEnglish
    ? {
        emptyTitle: "Your cart is empty",
        emptyDesc: "You have not selected any dishes yet. Head back to the menu.",
        backToMenu: "← Back to menu",
        addMore: "← Add more dishes",
        eyebrow: "Your cart",
        selectedItems: "items selected",
        summaryTitle: "Order summary",
        subtotal: "Subtotal",
        deliveryFee: "Delivery fee",
        free: "Free",
        freeHint: "Add",
        freeHintSuffix: "more for free delivery",
        total: "Total",
        checkout: "Proceed to checkout →",
        secure: "Secure payment",
        eta: "Delivery in 30–45 minutes",
        quality: "Hot and fresh guaranteed",
        unit: "/ item",
      }
    : {
        emptyTitle: "Giỏ hàng trống",
        emptyDesc: "Bạn chưa chọn món nào. Hãy quay lại thực đơn!",
        backToMenu: "← Quay lại thực đơn",
        addMore: "← Thêm món",
        eyebrow: "Giỏ hàng của bạn",
        selectedItems: "món đã chọn",
        summaryTitle: "Tóm tắt đơn hàng",
        subtotal: "Tạm tính",
        deliveryFee: "Phí giao hàng",
        free: "Miễn phí",
        freeHint: "Thêm",
        freeHintSuffix: "để miễn phí giao hàng",
        total: "Tổng cộng",
        checkout: "Tiến hành đặt hàng →",
        secure: "Thanh toán bảo mật",
        eta: "Giao trong 30–45 phút",
        quality: "Nóng giòn đảm bảo",
        unit: "/ món",
      }

  const deliveryFee = subtotal >= 199000 ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-icon">🛒</span>
        <h2>{text.emptyTitle}</h2>
        <p>{text.emptyDesc}</p>
        <button className="cart-back-btn" onClick={() => navigate("/order")}>
          {text.backToMenu}
        </button>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-inner">
        <div className="cart-left">
          <div className="cart-top">
            <button className="cart-back" onClick={() => navigate("/order")}>
              {text.addMore}
            </button>
            <div>
              <span className="cart-eyebrow">{text.eyebrow}</span>
              <h1 className="cart-title">
                {totalItems} {text.selectedItems.split(" ")[0]} <em>{text.selectedItems.replace(`${text.selectedItems.split(" ")[0]} `, "")}</em>
              </h1>
            </div>
          </div>

          <div className="cart-list">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  <span>
                    {item.cat === "pizza" && "🍕"}
                    {item.cat === "pasta" && "🍝"}
                    {item.cat === "drinks" && "🥤"}
                    {item.cat === "dessert" && "🍮"}
                  </span>
                </div>
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-desc">{item.desc}</p>
                  <span className="cart-item-unit">{item.price.toLocaleString("vi-VN")}₫ {text.unit}</span>
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

        <div className="cart-summary">
          <h2 className="cs-title">{text.summaryTitle}</h2>

          <div className="cs-rows">
            <div className="cs-row">
              <span>{text.subtotal}</span>
              <span>{subtotal.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="cs-row">
              <span>{text.deliveryFee}</span>
              <span className={deliveryFee === 0 ? "cs-free" : ""}>
                {deliveryFee === 0 ? text.free : `${DELIVERY_FEE.toLocaleString("vi-VN")}₫`}
              </span>
            </div>
            {deliveryFee > 0 && (
              <p className="cs-hint">
                {text.freeHint} {(199000 - subtotal).toLocaleString("vi-VN")}₫ {text.freeHintSuffix}
              </p>
            )}
          </div>

          <div className="cs-divider" />

          <div className="cs-total-row">
            <span>{text.total}</span>
            <span className="cs-total-price">{total.toLocaleString("vi-VN")}₫</span>
          </div>

          <button className="cs-checkout-btn" onClick={() => navigate("/checkout")}>
            {text.checkout}
          </button>

          <div className="cs-trust">
            <span>🔒 {text.secure}</span>
            <span>🕐 {text.eta}</span>
            <span>🍕 {text.quality}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

