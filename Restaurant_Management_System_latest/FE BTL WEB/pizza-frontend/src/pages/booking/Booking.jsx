import { useEffect, useRef, useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useAuth } from "../../context/AuthContext"
import { useLanguage } from "../../context/LanguageContext"
import "./Booking.css"

function LocationCard({ restaurant, text }) {
  const [showMap, setShowMap] = useState(false)
  const closeTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  function openMap() {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setShowMap(true)
  }

  function scheduleClose() {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
    }

    closeTimeoutRef.current = window.setTimeout(() => setShowMap(false), 140)
  }

  return (
    <div
      className={`booking-location-shell ${showMap ? "open" : ""}`}
      onMouseEnter={openMap}
      onMouseLeave={scheduleClose}
    >
      <div
        className="booking-location-card"
        role="button"
        tabIndex={0}
        onFocus={openMap}
        onBlur={scheduleClose}
        aria-expanded={showMap}
      >
        <div className="booking-location-head">
          <span className="booking-location-icon">📍</span>
          <div className="booking-location-copy">
            <h3>{restaurant.name}</h3>
            <p className="booking-location-address">{restaurant.address}</p>
          </div>
        </div>
      </div>

      <div
        className={`map-popup-card ${showMap ? "open" : ""}`}
        onMouseEnter={openMap}
        onMouseLeave={scheduleClose}
      >
        <iframe
          src={restaurant.map}
          loading="lazy"
          title={`Google Maps - ${restaurant.name}`}
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a href={restaurant.mapLink} target="_blank" rel="noreferrer" className="open-map">
          {text.openMap}
        </a>
      </div>
    </div>
  )
}

export default function Booking() {
  const { addBooking, user } = useAuth()
  const { isEnglish } = useLanguage()

  const text = isEnglish
    ? {
        cityEyebrow: "Restaurant in",
        cityBranch: "Ba Dinh",
        title: "Online reservation",
        subtitle: "Find a table that fits your schedule",
        people: "Guests",
        date: "Date",
        time: "Time",
        chooseTime: "Choose time",
        findTable: "Find available table →",
        searching: "Searching...",
        noTable: "No table available for this time slot. Please choose another time.",
        cancelled: "Reservation cancelled successfully.",
        bookingInfo: "Reservation details",
        timeLeft: "Table hold time",
        firstName: "First name *",
        lastName: "Last name *",
        email: "Email *",
        phone: "Phone number *",
        smsNotice: "Receive confirmation by message",
        cancel: "Cancel reservation",
        confirm: "Confirm",
        openMap: "Open Google Maps →",
        successTitle: "Reservation successful!",
        successDesc: "We will contact you to confirm shortly.",
        missingInfo: "Please fill in all required information",
        bookingFailed: "Unable to create booking",
        instant: "people",
        note: "Receive confirmation by message",
      }
    : {
        cityEyebrow: "Nhà hàng tại",
        cityBranch: "Ba Đình",
        title: "Đặt bàn trực tuyến",
        subtitle: "Tìm bàn phù hợp với lịch của bạn",
        people: "Số người",
        date: "Ngày",
        time: "Giờ",
        chooseTime: "Chọn giờ",
        findTable: "Tìm bàn trống →",
        searching: "Đang tìm...",
        noTable: "Không còn bàn trống khung giờ này. Vui lòng chọn giờ khác.",
        cancelled: "Đã hủy đặt bàn thành công.",
        bookingInfo: "Thông tin đặt bàn",
        timeLeft: "Giữ bàn còn",
        firstName: "Tên *",
        lastName: "Họ *",
        email: "Email *",
        phone: "Số điện thoại *",
        smsNotice: "Nhận xác nhận qua tin nhắn",
        cancel: "Huỷ đặt bàn",
        confirm: "Xác nhận",
        openMap: "Mở Google Maps →",
        successTitle: "Đặt bàn thành công!",
        successDesc: "Chúng tôi sẽ liên hệ xác nhận sớm nhất.",
        missingInfo: "Vui lòng nhập đầy đủ thông tin",
        bookingFailed: "Không thể đặt bàn",
        instant: "người",
        note: "Nhận xác nhận qua tin nhắn",
      }

  const restaurant = {
    name: "Hải SAPA Ba Đình",
    address: "175 Nguyễn Thái Học, Ba Đình, Hà Nội",
    map: "https://www.google.com/maps?q=175%20Nguyen%20Thai%20Hoc%20Ba%20Dinh%20Hanoi&output=embed",
    mapLink: "https://maps.google.com/?q=175%20Nguyen%20Thai%20Hoc%20Ba%20Dinh%20Hanoi",
  }

  const [people, setPeople] = useState(2)
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState("")
  const [available, setAvailable] = useState(null)
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [notify, setNotify] = useState(false)
  const [success, setSuccess] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const HOLD = 900
  const [timeLeft, setTimeLeft] = useState(HOLD)
  const [countdownActive, setCountdownActive] = useState(false)

  const formRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!countdownActive) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setCountdownActive(false)
          setAvailable(null)
          return HOLD
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [countdownActive])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const percent = (timeLeft / HOLD) * 100

  const times = []
  for (let hour = 9; hour <= 22; hour++) {
    ;["00", "15", "30", "45"].forEach(minute => {
      if (hour === 22 && minute !== "00") return
      times.push(`${hour}:${minute}`)
    })
  }

  function handleSearch() {
    if (!time) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setAvailable(true)
      setTimeLeft(HOLD)
      setCountdownActive(true)
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 200)
    }, 900)
  }

  function handleCancel() {
    clearInterval(timerRef.current)
    setCountdownActive(false)
    setAvailable(null)
    setTimeLeft(HOLD)
    setFirstName("")
    setLastName(user?.name || "")
    setEmail(user?.email || "")
    setPhone(user?.phone || "")
    setCancelled(true)
    setTimeout(() => setCancelled(false), 2500)
  }

  async function handleSubmit() {
    if (!firstName || !lastName || !email || !phone) {
      alert(text.missingInfo)
      return
    }

    setSubmitError("")

    const dateParts = time.split(":")
    const bookingDate = new Date(date)
    bookingDate.setHours(Number(dateParts[0] || 0), Number(dateParts[1] || 0), 0, 0)

    const result = await addBooking({
      bookingDate: bookingDate.toISOString().slice(0, 19),
      date: date.toLocaleDateString("vi-VN"),
      time: time || "--:--",
      guests: Number(people),
      name: `${lastName} ${firstName}`.trim(),
      phone,
      email,
      restaurant: restaurant.name,
      note: notify ? text.note : "",
    })

    if (!result.ok) {
      setSubmitError(result.message || text.bookingFailed)
      return
    }

    clearInterval(timerRef.current)
    setCountdownActive(false)
    setSuccess(true)

    setTimeout(() => {
      setSuccess(false)
      setAvailable(null)
      setTimeLeft(HOLD)
      setFirstName("")
      setLastName(user?.name || "")
      setEmail(user?.email || "")
      setPhone(user?.phone || "")
      setTime("")
    }, 3500)
  }

  return (
    <div className="booking">
      <video autoPlay loop muted className="bg-video">
        <source src="/videos/hanoi.mp4" type="video/mp4" />
      </video>
      <div className="overlay" />

      <div className="booking-layout">
        <div className="booking-left">
          <p className="city-eyebrow">{text.cityEyebrow}</p>
          <h1 className="city-title">
            <span>HÀ</span>
            <span>NỘI</span>
          </h1>
          <div className="city-line" />
          <p className="city-brand">Hải SAPA</p>
          <p className="city-branch">{text.cityBranch}</p>
        </div>

        <div className="booking-main">
          <div className="booking-top-row">
            <div className="booking-card">
              <div className="card-header">
                <h2 className="card-title">{text.title}</h2>
                <p className="card-sub">{text.subtitle}</p>
              </div>

              <div className="card-body">
                <div className="search-row">
                  <div className="sfield">
                    <label>{text.people}</label>
                    <select value={people} onChange={event => setPeople(Number(event.target.value))}>
                      {Array.from({ length: 29 }, (_, index) => (
                        <option key={index} value={index + 2}>
                          {index + 2} {text.instant}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sfield">
                    <label>{text.date}</label>
                    <DatePicker
                      selected={date}
                      onChange={nextDate => setDate(nextDate || new Date())}
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                    />
                  </div>

                  <div className="sfield">
                    <label>{text.time}</label>
                    <select value={time} onChange={event => setTime(event.target.value)}>
                      <option value="">{text.chooseTime}</option>
                      {times.map(item => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button className={`find-btn ${time ? "active" : ""}`} disabled={!time || loading} onClick={handleSearch}>
                  {loading ? (
                    <>
                      <span className="spinner" />
                      {text.searching}
                    </>
                  ) : (
                    text.findTable
                  )}
                </button>

                {available === false && <p className="no-table-msg">😔 {text.noTable}</p>}
                {cancelled && <p className="cancel-toast">✓ {text.cancelled}</p>}
              </div>

              {available === true && (
                <div ref={formRef} className="booking-section">
                  <div className="bs-divider">
                    <span>{text.bookingInfo}</span>
                  </div>

                  <div className="bs-summary">
                    <div className="bs-tags">
                      <span className="bs-tag">🕐 {time}</span>
                      <span className="bs-tag">🗓 {date.toLocaleDateString("vi-VN")}</span>
                      <span className="bs-tag">👥 {people} {text.instant}</span>
                    </div>
                    <div className="bs-countdown">
                      <span className="bsc-label">{text.timeLeft}</span>
                      <span className="bsc-time">
                        {String(minutes).padStart(2, "0")}
                        <em>:</em>
                        {String(seconds).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  <div className="bs-bar">
                    <div className="bs-bar-fill" style={{ width: `${percent}%` }} />
                  </div>

                  <div className="cust-grid">
                    <div className="cf">
                      <label>{text.firstName}</label>
                      <input value={firstName} onChange={event => setFirstName(event.target.value)} placeholder={isEnglish ? "Enter first name" : "Nhập tên"} />
                    </div>
                    <div className="cf">
                      <label>{text.lastName}</label>
                      <input value={lastName} onChange={event => setLastName(event.target.value)} placeholder={isEnglish ? "Enter last name" : "Nhập họ"} />
                    </div>
                    <div className="cf cf-full">
                      <label>{text.email}</label>
                      <input value={email} onChange={event => setEmail(event.target.value)} placeholder="example@email.com" type="email" />
                    </div>
                    <div className="cf">
                      <label>{text.phone}</label>
                      <div className="phone-wrap">
                        <span className="phone-code">🇻🇳 +84</span>
                        <input value={phone} onChange={event => setPhone(event.target.value)} placeholder="0123 456 789" />
                      </div>
                    </div>
                    <div className="cf cf-check">
                      <label className="chk-label">
                        <input type="checkbox" checked={notify} onChange={event => setNotify(event.target.checked)} />
                        {text.smsNotice}
                      </label>
                    </div>
                  </div>

                  {submitError && (
                    <p className="cancel-toast" style={{ background: "#fef2f2", color: "#b91c1c" }}>
                      {submitError}
                    </p>
                  )}

                  <div className="action-row">
                    <button className="cancel-btn" onClick={handleCancel}>
                      {text.cancel}
                    </button>
                    <button className="confirm-btn" onClick={handleSubmit}>
                      {text.confirm} · {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <LocationCard restaurant={restaurant} text={text} />
          </div>
        </div>
      </div>

      {success && (
        <div className="success-overlay">
          <div className="success-box">
            <div className="success-check">✓</div>
            <h2>{text.successTitle}</h2>
            <p>{text.successDesc}</p>
          </div>
        </div>
      )}
    </div>
  )
}

