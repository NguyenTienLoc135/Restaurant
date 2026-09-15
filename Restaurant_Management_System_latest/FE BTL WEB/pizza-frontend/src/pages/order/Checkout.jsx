import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { useLanguage } from "../../context/LanguageContext"
import { useMenu } from "../../context/MenuContext"
import "./Checkout.css"

const JAVA_INT_MAX = 2147483647

const DISTRICTS = [
  "Hoàn Kiếm", "Ba Đình", "Đống Đa", "Hai Bà Trưng", "Tây Hồ", "Cầu Giấy",
  "Thanh Xuân", "Long Biên", "Hà Đông", "Nam Từ Liêm", "Bắc Từ Liêm",
]

const DELIVERY_FEE = 15000
const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
]

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { addOrder, user } = useAuth()
  const { isBackendSynced } = useMenu()
  const { isEnglish } = useLanguage()
  const navigate = useNavigate()

  const paymentMethods = isEnglish
    ? [
        { id: "cod", label: "Cash on delivery", icon: "💵", desc: "Pay directly to the driver" },
        { id: "momo", label: "MoMo", icon: "💖", desc: "MoMo e-wallet" },
        { id: "zalo", label: "ZaloPay", icon: "💙", desc: "ZaloPay e-wallet" },
        { id: "bank", label: "Bank transfer", icon: "🏦", desc: "Vietcombank, Techcombank, MB..." },
        { id: "card", label: "Visa / Mastercard", icon: "💳", desc: "Pay via VNPay gateway" },
      ]
    : [
        { id: "cod", label: "Tiền mặt khi nhận", icon: "💵", desc: "Thanh toán trực tiếp cho shipper" },
        { id: "momo", label: "MoMo", icon: "💖", desc: "Ví điện tử MoMo" },
        { id: "zalo", label: "ZaloPay", icon: "💙", desc: "Ví điện tử ZaloPay" },
        { id: "bank", label: "Chuyển khoản", icon: "🏦", desc: "Vietcombank, Techcombank, MB..." },
        { id: "card", label: "Thẻ Visa / Mastercard", icon: "💳", desc: "Thanh toán qua cổng VNPay" },
      ]

  const text = isEnglish
    ? {
        back: "← Back to cart",
        eyebrow: "Delivery information",
        titleMain: "Almost",
        titleEm: "done",
        receiver: "01 · Receiver",
        fullName: "Full name *",
        phone: "Phone number *",
        addressSection: "02 · Delivery address",
        district: "District *",
        districtPlaceholder: "Select district...",
        address: "Full address *",
        addressPlaceholder: "House number, street name, building, floor...",
        timeSection: "03 · Delivery time",
        asap: "Deliver now",
        asapDesc: "30-45 minutes",
        scheduled: "Schedule",
        scheduledDesc: "Choose a time slot",
        selectTime: "Select delivery time *",
        selectTimePlaceholder: "Choose time...",
        paymentSection: "04 · Payment",
        notesSection: "05 · Kitchen note",
        notesLabel: "Notes",
        notesOptional: "(optional)",
        notesPlaceholder: "Example: Less salt, no onion, seafood allergy...",
        orderTitle: "Order",
        subtotal: "Subtotal",
        deliveryFee: "Delivery fee",
        free: "Free",
        total: "Total",
        submit: "Place order now 🛵",
        submitting: "Submitting order...",
        terms: "By placing this order, you agree to our",
        termsLink: "Terms of Service",
        successTitle: "Order placed successfully!",
        successDesc: "Your order is being prepared.",
        successEta: "The driver will arrive in 30-45 minutes.",
        needName: "Please enter your full name",
        needPhone: "Please enter your phone number",
        needAddress: "Please enter your address",
        needDistrict: "Please select a district",
        needTime: "Please choose a delivery time",
        menuNotSynced: "The menu is not synced with backend yet. Please reload and try again.",
        invalidItemPrefix: "Item",
        invalidItemSuffix: "has an invalid backend id. Please remove it from the cart and add it again.",
        submitFailed: "Unable to place order",
      }
    : {
        back: "← Quay lại giỏ hàng",
        eyebrow: "Thông tin giao hàng",
        titleMain: "Gần xong",
        titleEm: "rồi",
        receiver: "01 · Người nhận",
        fullName: "Họ và tên *",
        phone: "Số điện thoại *",
        addressSection: "02 · Địa chỉ giao hàng",
        district: "Quận / Huyện *",
        districtPlaceholder: "Chọn quận...",
        address: "Địa chỉ cụ thể *",
        addressPlaceholder: "Số nhà, tên đường, tòa nhà, tầng...",
        timeSection: "03 · Thời gian giao",
        asap: "Giao ngay",
        asapDesc: "30-45 phút",
        scheduled: "Hẹn giờ",
        scheduledDesc: "Chọn khung giờ",
        selectTime: "Chọn giờ giao *",
        selectTimePlaceholder: "Chọn giờ...",
        paymentSection: "04 · Thanh toán",
        notesSection: "05 · Ghi chú cho bếp",
        notesLabel: "Ghi chú",
        notesOptional: "(không bắt buộc)",
        notesPlaceholder: "VD: Ít muối, không hành, dị ứng hải sản...",
        orderTitle: "Đơn hàng",
        subtotal: "Tạm tính",
        deliveryFee: "Phí giao hàng",
        free: "Miễn phí",
        total: "Tổng cộng",
        submit: "Đặt hàng ngay 🛵",
        submitting: "Đang gửi đơn...",
        terms: "Bằng cách đặt hàng, bạn đồng ý với",
        termsLink: "Điều khoản dịch vụ",
        successTitle: "Đặt hàng thành công!",
        successDesc: "Đơn hàng của bạn đang được chuẩn bị.",
        successEta: "Shipper sẽ đến trong 30-45 phút.",
        needName: "Vui lòng nhập họ tên",
        needPhone: "Vui lòng nhập số điện thoại",
        needAddress: "Vui lòng nhập địa chỉ",
        needDistrict: "Vui lòng chọn quận",
        needTime: "Vui lòng chọn giờ giao",
        menuNotSynced: "Menu chưa đồng bộ với backend. Vui lòng tải lại trang và thử lại sau khi server sẵn sàng.",
        invalidItemPrefix: "Món",
        invalidItemSuffix: "có mã không hợp lệ để đồng bộ với backend. Vui lòng xóa món này khỏi giỏ và thêm lại.",
        submitFailed: "Không thể đặt hàng",
      }

  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [address, setAddress] = useState(user?.address || "")
  const [district, setDistrict] = useState("")
  const [time, setTime] = useState("")
  const [asap, setAsap] = useState(true)
  const [payment, setPayment] = useState("cod")
  const [notes, setNotes] = useState("")
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLockRef = useRef(false)

  const deliveryFee = subtotal >= 199000 ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  function validate() {
    const nextErrors = {}
    if (!name.trim()) nextErrors.name = text.needName
    if (!phone.trim()) nextErrors.phone = text.needPhone
    if (!address.trim()) nextErrors.address = text.needAddress
    if (!district) nextErrors.district = text.needDistrict
    if (!asap && !time) nextErrors.time = text.needTime
    return nextErrors
  }

  async function handleSubmit() {
    if (submitLockRef.current || success) return

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitError("")

    if (!isBackendSynced) {
      setSubmitError(text.menuNotSynced)
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
      setSubmitError(`${text.invalidItemPrefix} "${invalidItem.name}" ${text.invalidItemSuffix}`)
      return
    }

    submitLockRef.current = true
    setIsSubmitting(true)

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
      deliveryTime: asap ? (isEnglish ? "ASAP" : "Giao ngay") : time,
      total: total.toLocaleString("vi-VN") + "₫",
    })

    if (!result.ok) {
      submitLockRef.current = false
      setIsSubmitting(false)
      setSubmitError(result.message || text.submitFailed)
      return
    }

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
          <button className="co-back" onClick={() => navigate("/cart")}>{text.back}</button>

          <span className="co-eyebrow">{text.eyebrow}</span>
          <h1 className="co-title">{text.titleMain}<em> {text.titleEm}</em></h1>

          <div className="co-section">
            <h2 className="co-section-h">{text.receiver}</h2>
            <div className="co-grid-2">
              <div className={`co-field ${errors.name ? "error" : ""}`}>
                <label>{text.fullName}</label>
                <input value={name} onChange={event => { setName(event.target.value); setErrors(prev => ({ ...prev, name: "" })) }} placeholder={isEnglish ? "Nguyen Van A" : "Nguyễn Văn A"} />
                {errors.name && <span className="co-err">{errors.name}</span>}
              </div>
              <div className={`co-field ${errors.phone ? "error" : ""}`}>
                <label>{text.phone}</label>
                <div className="co-phone-wrap">
                  <span>🇻🇳 +84</span>
                  <input value={phone} onChange={event => { setPhone(event.target.value); setErrors(prev => ({ ...prev, phone: "" })) }} placeholder="0123 456 789" />
                </div>
                {errors.phone && <span className="co-err">{errors.phone}</span>}
              </div>
            </div>
          </div>

          <div className="co-section">
            <h2 className="co-section-h">{text.addressSection}</h2>
            <div className={`co-field ${errors.district ? "error" : ""}`}>
              <label>{text.district}</label>
              <select value={district} onChange={event => { setDistrict(event.target.value); setErrors(prev => ({ ...prev, district: "" })) }}>
                <option value="">{text.districtPlaceholder}</option>
                {DISTRICTS.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {errors.district && <span className="co-err">{errors.district}</span>}
            </div>
            <div className={`co-field ${errors.address ? "error" : ""}`}>
              <label>{text.address}</label>
              <input value={address} onChange={event => { setAddress(event.target.value); setErrors(prev => ({ ...prev, address: "" })) }} placeholder={text.addressPlaceholder} />
              {errors.address && <span className="co-err">{errors.address}</span>}
            </div>
          </div>

          <div className="co-section">
            <h2 className="co-section-h">{text.timeSection}</h2>
            <div className="co-time-toggle">
              <button type="button" className={`co-time-opt ${asap ? "active" : ""}`} onClick={() => setAsap(true)}>
                <span className="co-time-opt-icon">⚡</span>
                <div><strong>{text.asap}</strong><small>{text.asapDesc}</small></div>
              </button>
              <button type="button" className={`co-time-opt ${!asap ? "active" : ""}`} onClick={() => setAsap(false)}>
                <span className="co-time-opt-icon">🕐</span>
                <div><strong>{text.scheduled}</strong><small>{text.scheduledDesc}</small></div>
              </button>
            </div>
            {!asap && (
              <div className={`co-field ${errors.time ? "error" : ""}`} style={{ marginTop: 16 }}>
                <label>{text.selectTime}</label>
                <select value={time} onChange={event => { setTime(event.target.value); setErrors(prev => ({ ...prev, time: "" })) }}>
                  <option value="">{text.selectTimePlaceholder}</option>
                  {TIME_SLOTS.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                {errors.time && <span className="co-err">{errors.time}</span>}
              </div>
            )}
          </div>

          <div className="co-section">
            <h2 className="co-section-h">{text.paymentSection}</h2>
            <div className="co-payment-list">
              {paymentMethods.map(method => (
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
            <h2 className="co-section-h">{text.notesSection}</h2>
            <div className="co-field">
              <label>{text.notesLabel} <span>{text.notesOptional}</span></label>
              <textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder={text.notesPlaceholder} rows={3} />
            </div>
          </div>
          {submitError && <p className="co-err">{submitError}</p>}
        </div>

        <div className="co-summary">
          <h2 className="co-sum-title">{text.orderTitle}</h2>

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
          <div className="co-sum-row"><span>{text.subtotal}</span><span>{subtotal.toLocaleString("vi-VN")}₫</span></div>
          <div className="co-sum-row">
            <span>{text.deliveryFee}</span>
            <span className={deliveryFee === 0 ? "co-free" : ""}>{deliveryFee === 0 ? text.free : `${DELIVERY_FEE.toLocaleString("vi-VN")}₫`}</span>
          </div>
          <div className="co-sum-divider" />
          <div className="co-sum-total"><span>{text.total}</span><span>{total.toLocaleString("vi-VN")}₫</span></div>

          <button className="co-submit-btn" onClick={handleSubmit} disabled={isSubmitting || success}>
            {isSubmitting || success ? text.submitting : text.submit}
          </button>

          <p className="co-sum-note">
            {text.terms} <a href="#">{text.termsLink}</a>.
          </p>
        </div>
      </div>

      {success && (
        <div className="co-success-overlay">
          <div className="co-success-box">
            <div className="co-success-icon">🛵</div>
            <h2>{text.successTitle}</h2>
            <p>{text.successDesc}<br />{text.successEta}</p>
            <div className="co-success-bar" />
          </div>
        </div>
      )}
    </div>
  )
}

