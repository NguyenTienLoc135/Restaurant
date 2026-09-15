import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useLanguage } from "../../context/LanguageContext"
import "./BookingConfirm.css"

function BookingConfirm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isEnglish } = useLanguage()
  const data = location.state

  const text = isEnglish
    ? {
        back: "← Back",
        timeLeft: "Time remaining",
        contactPrompt: "Please provide the contact information used for your reservation:",
        firstName: "First name *",
        lastName: "Last name *",
        email: "Email *",
        phone: "Phone number *",
        smsNotice: "Notify me by message",
        submit: "Reserve table",
        missingInfo: "Please fill in all required information.",
        noData: "No booking data found.",
        successTitle: "Reservation successful",
        successDesc: "We will contact you shortly.",
        guests: "guests",
      }
    : {
        back: "← Quay lại",
        timeLeft: "Thời gian còn lại",
        contactPrompt: "Xin vui lòng cung cấp thông tin liên lạc được dùng cho việc đặt bàn của quý khách:",
        firstName: "Tên *",
        lastName: "Họ *",
        email: "Email *",
        phone: "Số điện thoại *",
        smsNotice: "Thông báo tôi qua tin nhắn?",
        submit: "Đặt bàn",
        missingInfo: "Vui lòng nhập đầy đủ thông tin",
        noData: "Không có dữ liệu",
        successTitle: "Đặt bàn thành công",
        successDesc: "Chúng tôi sẽ liên hệ với bạn sớm!",
        guests: "người",
      }

  const [timeLeft, setTimeLeft] = useState(300)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate("/booking")
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const percent = (timeLeft / 300) * 100

  function handleSubmit() {
    if (!firstName || !lastName || !email || !phone) {
      alert(text.missingInfo)
      return
    }

    setSuccess(true)

    setTimeout(() => {
      navigate("/booking")
    }, 2000)
  }

  if (!data) {
    return <h2>{text.noData}</h2>
  }

  return (
    <div className="confirm-page">
      <button className="back-btn" onClick={() => navigate("/booking")}>
        {text.back}
      </button>

      <div className="confirm-card">
        <div className="restaurant-box">
          <div>
            <h3>{data.name}</h3>
            <p>{data.address}</p>
            <p>{data.people} {text.guests}</p>
            <p>{data.date} - {data.time}</p>
          </div>

          <div className="countdown">
            <p>{text.timeLeft}</p>
            <h2>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </h2>
          </div>
        </div>

        <div className="progress">
          <div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>

        <div className="form-box">
          <h3>{text.contactPrompt}</h3>

          <div className="form-grid">
            <div className="input-group">
              <label>{text.firstName}</label>
              <input value={firstName} onChange={event => setFirstName(event.target.value)} placeholder={isEnglish ? "Enter first name" : "Nhập tên"} />
            </div>

            <div className="input-group">
              <label>{text.lastName}</label>
              <input value={lastName} onChange={event => setLastName(event.target.value)} placeholder={isEnglish ? "Enter last name" : "Nhập họ"} />
            </div>

            <div className="input-group full">
              <label>{text.email}</label>
              <input value={email} onChange={event => setEmail(event.target.value)} placeholder="example@email.com" />
            </div>

            <div className="input-group">
              <label>{text.phone}</label>

              <div className="phone-input">
                <span className="phone-country">🇻🇳 +84</span>
                <input value={phone} onChange={event => setPhone(event.target.value)} placeholder="0123456789" />
              </div>
            </div>

            <div className="notify">
              <input type="checkbox" />
              <label>{text.smsNotice}</label>
            </div>
          </div>

          <button className="confirm-btn" onClick={handleSubmit}>
            {text.submit} ({minutes}:{seconds.toString().padStart(2, "0")})
          </button>
        </div>
      </div>

      {success && (
        <div className="success-popup">
          <div className="success-box">
            <h2>{text.successTitle}</h2>
            <p>{text.successDesc}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingConfirm

