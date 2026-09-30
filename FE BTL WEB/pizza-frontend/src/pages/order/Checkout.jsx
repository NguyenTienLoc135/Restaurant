import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { useMenu } from "../../context/MenuContext"
import { useStaff } from "../../staff/StaffContext"
import "./Checkout.css"

const JAVA_INT_MAX = 2147483647

const PAYMENT_METHODS = [
  { id: "cod", label: "Tiền mặt khi nhận", icon: "💵", desc: "Thanh toán trực tiếp cho shipper" },
  { id: "momo", label: "MoMo", icon: "💖", desc: "Ví điện tử MoMo" },
  { id: "zalo", label: "ZaloPay", icon: "💙", desc: "Ví điện tử ZaloPay" },
  { id: "bank", label: "Chuyển khoản", icon: "🏦", desc: "Vietcombank, Techcombank, MB..." },
  { id: "card", label: "Thẻ Visa / Mastercard", icon: "💳", desc: "Thanh toán qua cổng VNPay" },
]

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
]

const DELIVERY_FEE = 20000

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { addOrder, user } = useAuth()
  const { staff } = useStaff()
  const { isBackendSynced, items: menuItems, refreshItems } = useMenu()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [address, setAddress] = useState(user?.address || "")
  const [district, setDistrict] = useState("")
  const [time, setTime] = useState("")
  const [asap, setAsap] = useState(true)
  const [payment, setPayment] = useState("cod")
  const [notes, setNotes] = useState("")
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")

  const deliveryFee = DELIVERY_FEE
  const total = subtotal + deliveryFee

  function validate() {
    const nextErrors = {}
    if (!name.trim()) nextErrors.name = "Vui lòng nhập họ tên"
    if (!phone.trim()) nextErrors.phone = "Vui lòng nhập số điện thoại"
    if (!address.trim()) nextErrors.address = "Vui lòng nhập địa chỉ"
    if (!district) nextErrors.district = "Vui lòng chọn quận"
    if (!asap && !time) nextErrors.time = "Vui lòng chọn giờ giao"
    return nextErrors
  }

  async function handleSubmit() {
    if (staff) {
      setSubmitError("Tài khoản staff hoặc driver không thể đặt món ở giao diện khách hàng.")
      return
    }

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitError("")

    let availableMenuItems = menuItems

    if (!isBackendSynced) {
      try {
        const refreshedItems = await refreshItems()
        if (!refreshedItems.length) {
          setSubmitError("Menu tren backend hien dang trong. Vui long kiem tra lai danh sach mon trong he thong.")
          return
        }
        availableMenuItems = refreshedItems
      } catch {
        setSubmitError("Menu chua dong bo voi backend. Vui long tai lai trang va thu lai sau khi server san sang.")
        return
      }
    }

    const validMenuIds = new Set(availableMenuItems.map(item => Number(item.id)))
    const missingItems = items.filter(item => !validMenuIds.has(Number(item.id)))

    if (missingItems.length) {
      const missingNames = missingItems.map(item => `"${item.name}"`).join(", ")
      setSubmitError(`Mot vai mon trong gio khong con ton tai tren backend: ${missingNames}. Vui long quay lai menu va them lai mon.`)
      return
    }

    const normalizedItems = items.map(item => ({
      id: Number(item.id),
      amount: item.qty,
      name: item.name,
    }))

    const invalidItem = normalizedItems.find(
      item => !Number.isInteger(item.id) || item.id <= 0 || item.id > JAVA_INT_MAX
    )

    if (invalidItem) {
      setSubmitError(
        `Mon "${invalidItem.name}" co ma khong hop le de dong bo voi backend. Vui long quay lai menu, xoa mon nay khoi gio va them lai.`
      )
      return
    }

    const result = await addOrder({
      items: normalizedItems.map(item => ({
        id: item.id,
        amount: item.amount,
      })),
      notes,
      customer: name,
      phone,
      address: `${address}, ${district}`,
      district,
      payment,
      deliveryTime: asap ? "Giao ngay" : time,
      total: total.toLocaleString("vi-VN") + "₫",
    })

    if (!result.ok) {
      setSubmitError(result.message || "Không thể đặt hàng")
      return
    }

    setSuccessMessage(result.message || "Don hang cua ban da duoc tao va dang cho duyet.")
    setSuccess(true)
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
        <div className="co-form-col">
          <button className="co-back" onClick={() => navigate("/cart")}>← Quay lại giỏ hàng</button>

          <span className="co-eyebrow">Thông tin giao hàng</span>
          <h1 className="co-title">Gần xong rồi<em>!</em></h1>

          <div className="co-section">
            <h2 className="co-section-h">01 · Người nhận</h2>
            <div className="co-grid-2">
              <div className={`co-field ${errors.name ? "error" : ""}`}>
                <label>Họ và tên *</label>
                <input value={name} onChange={event => { setName(event.target.value); setErrors(prev => ({ ...prev, name: "" })) }} placeholder="Nguyễn Văn A" />
                {errors.name && <span className="co-err">{errors.name}</span>}
              </div>
              <div className={`co-field ${errors.phone ? "error" : ""}`}>
                <label>Số điện thoại *</label>
                <div className="co-phone-wrap">
                  <span>🇻🇳 +84</span>
                  <input value={phone} onChange={event => { setPhone(event.target.value); setErrors(prev => ({ ...prev, phone: "" })) }} placeholder="0123 456 789" />
                </div>
                {errors.phone && <span className="co-err">{errors.phone}</span>}
              </div>
            </div>
          </div>

          <div className="co-section">
            <h2 className="co-section-h">02 · Địa chỉ giao hàng</h2>
            <div className={`co-field ${errors.district ? "error" : ""}`}>
              <label>Quận / Huyện *</label>
              <select value={district} onChange={event => { setDistrict(event.target.value); setErrors(prev => ({ ...prev, district: "" })) }}>
                <option value="">Chọn quận...</option>
                {["Hoàn Kiếm", "Ba Đình", "Đống Đa", "Hai Bà Trưng", "Tây Hồ", "Cầu Giấy", "Thanh Xuân", "Long Biên", "Hà Đông", "Nam Từ Liêm", "Bắc Từ Liêm"].map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {errors.district && <span className="co-err">{errors.district}</span>}
            </div>
            <div className={`co-field ${errors.address ? "error" : ""}`}>
              <label>Địa chỉ cụ thể *</label>
              <input value={address} onChange={event => { setAddress(event.target.value); setErrors(prev => ({ ...prev, address: "" })) }} placeholder="Số nhà, tên đường, tòa nhà, tầng..." />
              {errors.address && <span className="co-err">{errors.address}</span>}
            </div>
          </div>

          <div className="co-section">
            <h2 className="co-section-h">03 · Thời gian giao</h2>
            <div className="co-time-toggle">
              <button className={`co-time-opt ${asap ? "active" : ""}`} onClick={() => setAsap(true)}>
                <span className="co-time-opt-icon">⚡</span>
                <div><strong>Giao ngay</strong><small>30-45 phút</small></div>
              </button>
              <button className={`co-time-opt ${!asap ? "active" : ""}`} onClick={() => setAsap(false)}>
                <span className="co-time-opt-icon">🕐</span>
                <div><strong>Hẹn giờ</strong><small>Chọn khung giờ</small></div>
              </button>
            </div>
            {!asap && (
              <div className={`co-field ${errors.time ? "error" : ""}`} style={{ marginTop: 16 }}>
                <label>Chọn giờ giao *</label>
                <select value={time} onChange={event => { setTime(event.target.value); setErrors(prev => ({ ...prev, time: "" })) }}>
                  <option value="">Chọn giờ...</option>
                  {TIME_SLOTS.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                {errors.time && <span className="co-err">{errors.time}</span>}
              </div>
            )}
          </div>

          <div className="co-section">
            <h2 className="co-section-h">04 · Thanh toán</h2>
            <div className="co-payment-list">
              {PAYMENT_METHODS.map(method => (
                <label key={method.id} className={`co-payment-item ${payment === method.id ? "active" : ""}`}>
                  <input type="radio" name="payment" value={method.id} checked={payment === method.id} onChange={() => setPayment(method.id)} />
                  <span className="co-pay-icon">{method.icon}</span>
                  <div className="co-pay-info">
                    <strong>{method.label}</strong>
                    <small>{method.desc}</small>
                  </div>
                  {payment === method.id && <span className="co-pay-check">✓</span>}
                </label>
              ))}
            </div>
          </div>

          <div className="co-section">
            <h2 className="co-section-h">05 · Ghi chú cho bếp</h2>
            <div className="co-field">
              <label>Ghi chú <span>(không bắt buộc)</span></label>
              <textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="VD: Ít muối, không hành, dị ứng hải sản..." rows={3} />
            </div>
          </div>
          {submitError && <p className="co-err">{submitError}</p>}
        </div>

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
          <div className="co-sum-row"><span>Tạm tính</span><span>{subtotal.toLocaleString("vi-VN")}₫</span></div>
          <div className="co-sum-row">
            <span>Phí giao hàng</span>
            <span>{DELIVERY_FEE.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="co-sum-divider" />
          <div className="co-sum-total"><span>Tổng cộng</span><span>{total.toLocaleString("vi-VN")}₫</span></div>

          <button className="co-submit-btn" onClick={handleSubmit}>Đặt hàng ngay 🛵</button>

          <p className="co-sum-note">
            Bằng cách đặt hàng, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> của chúng tôi.
          </p>
        </div>
      </div>

      {success && (
        <div className="co-success-overlay">
          <div className="co-success-box">
            <div className="co-success-icon">🛵</div>
            <h2>Đặt hàng thành công!</h2>
            <p>Đơn hàng của bạn đang được chuẩn bị.<br />Shipper sẽ đến trong <strong>30-45 phút</strong>.</p>
            {successMessage ? <p>{successMessage}</p> : null}
            <div className="co-success-bar" />
          </div>
        </div>
      )}
    </div>
  )
}
