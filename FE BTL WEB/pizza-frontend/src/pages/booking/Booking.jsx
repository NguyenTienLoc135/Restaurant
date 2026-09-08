import { useEffect, useRef, useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useAuth } from "../../context/AuthContext"
import "./Booking.css"

function LocationCard({ restaurant }) {
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
          Mở Google Maps →
        </a>
      </div>
    </div>
  )
}

function Booking() {
  const { addBooking, user } = useAuth()

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
      alert("Vui lòng nhập đầy đủ thông tin")
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
      note: notify ? "Nhận xác nhận qua tin nhắn" : "",
    })

    if (!result.ok) {
      setSubmitError(result.message || "Không thể đặt bàn")
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
          <p className="city-eyebrow">Nhà hàng tại</p>
          <h1 className="city-title">
            <span>HÀ</span>
            <span>NỘI</span>
          </h1>
          <div className="city-line" />
          <p className="city-brand">Hải SAPA</p>
          <p className="city-branch">Ba Đình</p>
        </div>

        <div className="booking-main">
          <div className="booking-top-row">
            <div className="booking-card">
              <div className="card-header">
                <h2 className="card-title">Đặt bàn trực tuyến</h2>
                <p className="card-sub">Tìm bàn phù hợp với lịch của bạn</p>
              </div>

              <div className="card-body">
                <div className="search-row">
                  <div className="sfield">
                    <label>Số người</label>
                    <select value={people} onChange={event => setPeople(Number(event.target.value))}>
                      {Array.from({ length: 29 }, (_, index) => (
                        <option key={index} value={index + 2}>
                          {index + 2} người
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sfield">
                    <label>Ngày</label>
                    <DatePicker
                      selected={date}
                      onChange={nextDate => setDate(nextDate || new Date())}
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                    />
                  </div>

                  <div className="sfield">
                    <label>Giờ</label>
                    <select value={time} onChange={event => setTime(event.target.value)}>
                      <option value="">Chọn giờ</option>
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
                      Đang tìm...
                    </>
                  ) : (
                    "Tìm bàn trống →"
                  )}
                </button>

                {available === false && (
                  <p className="no-table-msg">😔 Không còn bàn trống khung giờ này. Vui lòng chọn giờ khác.</p>
                )}
                {cancelled && <p className="cancel-toast">✓ Đã huỷ đặt bàn thành công.</p>}
              </div>

              {available === true && (
                <div ref={formRef} className="booking-section">
                  <div className="bs-divider">
                    <span>Thông tin đặt bàn</span>
                  </div>

                  <div className="bs-summary">
                    <div className="bs-tags">
                      <span className="bs-tag">🕐 {time}</span>
                      <span className="bs-tag">🗓 {date.toLocaleDateString("vi-VN")}</span>
                      <span className="bs-tag">👥 {people} người</span>
                    </div>
                    <div className="bs-countdown">
                      <span className="bsc-label">Giữ bàn còn</span>
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
                      <label>Tên *</label>
                      <input value={firstName} onChange={event => setFirstName(event.target.value)} placeholder="Nhập tên" />
                    </div>
                    <div className="cf">
                      <label>Họ *</label>
                      <input value={lastName} onChange={event => setLastName(event.target.value)} placeholder="Nhập họ" />
                    </div>
                    <div className="cf cf-full">
                      <label>Email *</label>
                      <input value={email} onChange={event => setEmail(event.target.value)} placeholder="example@email.com" type="email" />
                    </div>
                    <div className="cf">
                      <label>Số điện thoại *</label>
                      <div className="phone-wrap">
                        <span className="phone-code">🇻🇳 +84</span>
                        <input value={phone} onChange={event => setPhone(event.target.value)} placeholder="0123 456 789" />
                      </div>
                    </div>
                    <div className="cf cf-check">
                      <label className="chk-label">
                        <input type="checkbox" checked={notify} onChange={event => setNotify(event.target.checked)} />
                        Nhận xác nhận qua tin nhắn
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
                      Huỷ đặt bàn
                    </button>
                    <button className="confirm-btn" onClick={handleSubmit}>
                      Xác nhận · {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <LocationCard restaurant={restaurant} />
          </div>
        </div>
      </div>

      {success && (
        <div className="success-overlay">
          <div className="success-box">
            <div className="success-check">✓</div>
            <h2>Đặt bàn thành công!</h2>
            <p>Chúng tôi sẽ liên hệ xác nhận sớm nhất.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Booking
