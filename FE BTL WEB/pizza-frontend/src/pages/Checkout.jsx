import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import "./Checkout.css"

const PAYMENT_METHODS = [
  { id: "cod",    label: "Tiền mặt khi nhận",  icon: "💵", desc: "Thanh toán trực tiếp cho shipper" },
  { id: "momo",   label: "MoMo",               icon: "💜", desc: "Ví điện tử MoMo" },
  { id: "zalo",   label: "ZaloPay",            icon: "💙", desc: "Ví điện tử ZaloPay" },
  { id: "bank",   label: "Chuyển khoản",       icon: "🏦", desc: "Vietcombank, Techcombank, MB..." },
  { id: "card",   label: "Thẻ Visa / Mastercard", icon: "💳", desc: "Thanh toán qua cổng VNPay" },
]

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
]

const DELIVERY_FEE = 15000

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { addOrder } = useAuth()
  const navigate = useNavigate()

  const [name,    setName]    = useState("")
  const [phone,   setPhone]   = useState("")
  const [address, setAddress] = useState("")
  const [district, setDistrict] = useState("")
  const [time,    setTime]    = useState("")
  const [asap,    setAsap]    = useState(true)
  const [payment, setPayment] = useState("cod")
  const [notes,   setNotes]   = useState("")
  const [success, setSuccess] = useState(false)
  const [errors,  setErrors]  = useState({})

  const deliveryFee = subtotal >= 199000 ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  function validate() {
    const e = {}
    if (!name.trim())    e.name    = "Vui lòng nhập họ tên"
    if (!phone.trim())   e.phone   = "Vui lòng nhập số điện thoại"
    if (!address.trim()) e.address = "Vui lòng nhập địa chỉ"
    if (!district)       e.district = "Vui lòng chọn quận"
    if (!asap && !time)  e.time    = "Vui lòng chọn giờ giao"
    return e
  }

  function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSuccess(true)
    // Lưu đơn hàng vào profile
    addOrder({
      items: items.map(i => i.name).join(", "),
      total: total.toLocaleString("vi-VN") + "₫",
    })
    setTimeout(() => {
      clearCart()
      navigate("/")
    }, 3500)
  }

  if (items.length === 0 && !success) {
    navigate("/order")
    return null
  }

  return (
    <div className="co-page">
      <div className="co-inner">

        {/* LEFT — form */}
        <div className="co-form-col">
          <button className="co-back" onClick={() => navigate("/cart")}>← Quay lại giỏ hàng</button>

          <span className="co-eyebrow">Thông tin giao hàng</span>
          <h1 className="co-title">Gần xong rồi<em>!</em></h1>

          {/* ── SECTION 1: CONTACT ── */}
          <div className="co-section">
            <h2 className="co-section-h">01 · Người nhận</h2>
            <div className="co-grid-2">
              <div className={`co-field ${errors.name ? "error" : ""}`}>
                <label>Họ và tên *</label>
                <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ""})) }} placeholder="Nguyễn Văn A" />
                {errors.name && <span className="co-err">{errors.name}</span>}
              </div>
              <div className={`co-field ${errors.phone ? "error" : ""}`}>
                <label>Số điện thoại *</label>
                <div className="co-phone-wrap">
                  <span>🇻🇳 +84</span>
                  <input value={phone} onChange={e => { setPhone(e.target.value); setErrors(p => ({...p, phone: ""})) }} placeholder="0123 456 789" />
                </div>
                {errors.phone && <span className="co-err">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* ── SECTION 2: ADDRESS ── */}
          <div className="co-section">
            <h2 className="co-section-h">02 · Địa chỉ giao hàng</h2>
            <div className={`co-field ${errors.district ? "error" : ""}`}>
              <label>Quận / Huyện *</label>
              <select value={district} onChange={e => { setDistrict(e.target.value); setErrors(p => ({...p, district: ""})) }}>
                <option value="">Chọn quận...</option>
                {["Hoàn Kiếm","Ba Đình","Đống Đa","Hai Bà Trưng","Tây Hồ","Cầu Giấy"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.district && <span className="co-err">{errors.district}</span>}
            </div>
            <div className={`co-field ${errors.address ? "error" : ""}`}>
              <label>Địa chỉ cụ thể *</label>
              <input value={address} onChange={e => { setAddress(e.target.value); setErrors(p => ({...p, address: ""})) }} placeholder="Số nhà, tên đường, tòa nhà, tầng..." />
              {errors.address && <span className="co-err">{errors.address}</span>}
            </div>
          </div>

          {/* ── SECTION 3: TIME ── */}
          <div className="co-section">
            <h2 className="co-section-h">03 · Thời gian giao</h2>
            <div className="co-time-toggle">
              <button
                className={`co-time-opt ${asap ? "active" : ""}`}
                onClick={() => setAsap(true)}
              >
                <span className="co-time-opt-icon">⚡</span>
                <div>
                  <strong>Giao ngay</strong>
                  <small>30–45 phút</small>
                </div>
              </button>
              <button
                className={`co-time-opt ${!asap ? "active" : ""}`}
                onClick={() => setAsap(false)}
              >
                <span className="co-time-opt-icon">🕐</span>
                <div>
                  <strong>Hẹn giờ</strong>
                  <small>Chọn khung giờ</small>
                </div>
              </button>
            </div>
            {!asap && (
              <div className={`co-field ${errors.time ? "error" : ""}`} style={{ marginTop: 16 }}>
                <label>Chọn giờ giao *</label>
                <select value={time} onChange={e => { setTime(e.target.value); setErrors(p => ({...p, time: ""})) }}>
                  <option value="">Chọn giờ...</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.time && <span className="co-err">{errors.time}</span>}
              </div>
            )}
          </div>

          {/* ── SECTION 4: PAYMENT ── */}
          <div className="co-section">
            <h2 className="co-section-h">04 · Thanh toán</h2>
            <div className="co-payment-list">
              {PAYMENT_METHODS.map(m => (
                <label key={m.id} className={`co-payment-item ${payment === m.id ? "active" : ""}`}>
                  <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} />
                  <span className="co-pay-icon">{m.icon}</span>
                  <div className="co-pay-info">
                    <strong>{m.label}</strong>
                    <small>{m.desc}</small>
                  </div>
                  {payment === m.id && <span className="co-pay-check">✓</span>}
                </label>
              ))}
            </div>
          </div>

          {/* ── SECTION 5: NOTES ── */}
          <div className="co-section">
            <h2 className="co-section-h">05 · Ghi chú cho bếp</h2>
            <div className="co-field">
              <label>Ghi chú <span>(không bắt buộc)</span></label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="VD: Ít muối, không hành, dị ứng hải sản..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — order summary */}
        <div className="co-summary">
          <h2 className="co-sum-title">Đơn hàng</h2>

          <div className="co-sum-items">
            {items.map(item => (
              <div key={item.id} className="co-sum-item">
                <span className="co-sum-qty">{item.qty}×</span>
                <span className="co-sum-name">{item.name}</span>
                <span className="co-sum-price">{(item.price * item.qty).toLocaleString("vi-VN")}₫</span>
              </div>
            ))}
          </div>

          <div className="co-sum-divider" />

          <div className="co-sum-row">
            <span>Tạm tính</span>
            <span>{subtotal.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="co-sum-row">
            <span>Phí giao hàng</span>
            <span className={deliveryFee === 0 ? "co-free" : ""}>
              {deliveryFee === 0 ? "Miễn phí" : `${DELIVERY_FEE.toLocaleString("vi-VN")}₫`}
            </span>
          </div>

          <div className="co-sum-divider" />

          <div className="co-sum-total">
            <span>Tổng cộng</span>
            <span>{total.toLocaleString("vi-VN")}₫</span>
          </div>

          <button className="co-submit-btn" onClick={handleSubmit}>
            Đặt hàng ngay 🛵
          </button>

          <p className="co-sum-note">
            Bằng cách đặt hàng, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> của chúng tôi.
          </p>
        </div>

      </div>

      {/* SUCCESS POPUP */}
      {success && (
        <div className="co-success-overlay">
          <div className="co-success-box">
            <div className="co-success-icon">🛵</div>
            <h2>Đặt hàng thành công!</h2>
            <p>Đơn hàng của bạn đang được chuẩn bị.<br />Shipper sẽ đến trong <strong>30–45 phút</strong>.</p>
            <div className="co-success-bar" />
          </div>
        </div>
      )}
    </div>
  )
}
