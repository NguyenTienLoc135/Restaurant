import { useState, useRef, useEffect } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useAuth } from "../context/AuthContext"
import "./Booking.css"

function AddressChip({ restaurant }) {
  const [showMap, setShowMap] = useState(false)
  return (
    <div
      className="address-chip"
      onMouseEnter={() => setShowMap(true)}
      onMouseLeave={() => setShowMap(false)}
    >
      <span className="chip-pin">📍</span>
      <div className="chip-info">
        <strong>{restaurant.name}</strong>
        <small>{restaurant.address}</small>
      </div>
      {showMap && (
        <div className="map-popup-chip">
          <iframe src={restaurant.map} loading="lazy" title="map" />
          <a href={restaurant.mapLink} target="_blank" rel="noreferrer" className="open-map">
            Mở Google Maps ↗
          </a>
        </div>
      )}
    </div>
  )
}

function Booking() {
  const { addBooking } = useAuth()

  const restaurant = {
    name: "Pizza 4P's Ba Đình",
    address: "175 Nguyễn Thái Học, Ba Đình, Hà Nội",
    map: "https://www.google.com/maps?q=175%20Nguyen%20Thai%20Hoc%20Ba%20Dinh%20Hanoi&output=embed",
    mapLink: "https://maps.google.com/?q=175%20Nguyen%20Thai%20Hoc%20Ba%20Dinh%20Hanoi"
  }

  const [people, setPeople]       = useState(2)
  const [date,   setDate]         = useState(new Date())
  const [time,   setTime]         = useState("")
  const [available, setAvailable] = useState(null)
  const [loading,   setLoading]   = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName,  setLastName]  = useState("")
  const [email,     setEmail]     = useState("")
  const [phone,     setPhone]     = useState("")
  const [notify,    setNotify]    = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [cancelled, setCancelled] = useState(false)

  const HOLD = 900
  const [timeLeft,        setTimeLeft]        = useState(HOLD)
  const [countdownActive, setCountdownActive] = useState(false)

  const formRef  = useRef(null)
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
  const percent  = (timeLeft / HOLD) * 100

  const times = []
  for (let h = 9; h <= 22; h++) {
    ["00","15","30","45"].forEach(m => {
      if (h === 22 && m !== "00") return
      times.push(`${h}:${m}`)
    })
  }

  function handleSearch() {
    if (!time) return
    setLoading(true)
    // ← Replace with real API call: check DB availability
    setTimeout(() => {
      setLoading(false)
      setAvailable(true)   // set false to test "no table"
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
    setFirstName(""); setLastName(""); setEmail(""); setPhone("")
    setCancelled(true)
    setTimeout(() => setCancelled(false), 2500)
  }

  function handleSubmit() {
    if (!firstName || !lastName || !email || !phone) {
      alert("Vui lòng nhập đầy đủ thông tin")
      return
    }
    clearInterval(timerRef.current)
    setCountdownActive(false)
    setSuccess(true)
    // Lưu đặt bàn vào profile
    addBooking({
      date:   date.toLocaleDateString("vi-VN"),
      time:   time || "—",
      guests: people,
    })
    setTimeout(() => {
      setSuccess(false)
      setAvailable(null)
      setTimeLeft(HOLD)
      setFirstName(""); setLastName(""); setEmail(""); setPhone("")
      setTime("")
    }, 3500)
  }

  return (
    <div className="booking">

      {/* VIDEO BACKGROUND */}
      <video autoPlay loop muted className="bg-video">
        <source src="/videos/hanoi.mp4" type="video/mp4" />
      </video>
      <div className="overlay" />

      {/* ── MAIN LAYOUT ── */}
      <div className="booking-layout">

        {/* LEFT – City */}
        <div className="booking-left">
          <p className="city-eyebrow">Nhà hàng tại</p>
          <h1 className="city-title">
            <span>HÀ</span>
            <span>NỘI</span>
          </h1>
          <div className="city-line" />
          <p className="city-brand">Pizza 4P's</p>
          <p className="city-branch">Ba Đình</p>
        </div>

        {/* RIGHT – Booking card */}
        <div className="booking-card">

          {/* CARD HEADER */}
          <div className="card-header">
            <h2 className="card-title">Đặt bàn trực tuyến</h2>
            <p className="card-sub">Tìm bàn phù hợp với lịch của bạn</p>
          </div>

          {/* SEARCH FIELDS */}
          <div className="card-body">

            <div className="search-row">

              <div className="sfield">
                <label>Số người</label>
                <select value={people} onChange={e => setPeople(e.target.value)}>
                  {Array.from({ length: 29 }, (_, i) => (
                    <option key={i} value={i + 2}>{i + 2} người</option>
                  ))}
                </select>
              </div>

              <div className="sfield">
                <label>Ngày</label>
                <DatePicker
                  selected={date}
                  onChange={d => setDate(d)}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                />
              </div>

              <div className="sfield">
                <label>Giờ</label>
                <select value={time} onChange={e => setTime(e.target.value)}>
                  <option value="">Chọn giờ</option>
                  {times.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

            </div>

            <button
              className={`find-btn ${time ? "active" : ""}`}
              disabled={!time || loading}
              onClick={handleSearch}
            >
              {loading
                ? <><span className="spinner" /> Đang tìm...</>
                : "Tìm bàn trống →"
              }
            </button>

            {available === false && (
              <p className="no-table-msg">
                😔 Không còn bàn trống khung giờ này. Vui lòng chọn giờ khác.
              </p>
            )}

            {cancelled && (
              <p className="cancel-toast">✓ Đã huỷ đặt bàn thành công.</p>
            )}

          </div>

          {/* ── BOOKING FORM (shows after search) ── */}
          {available === true && (
            <div ref={formRef} className="booking-section">

              <div className="bs-divider"><span>Thông tin đặt bàn</span></div>

              {/* summary + countdown */}
              <div className="bs-summary">
                <div className="bs-tags">
                  <span className="bs-tag">🕐 {time}</span>
                  <span className="bs-tag">📅 {date.toLocaleDateString("vi-VN")}</span>
                  <span className="bs-tag">👥 {people} người</span>
                </div>
                <div className="bs-countdown">
                  <span className="bsc-label">Giữ bàn còn</span>
                  <span className="bsc-time">
                    {String(minutes).padStart(2,"0")}
                    <em>:</em>
                    {String(seconds).padStart(2,"0")}
                  </span>
                </div>
              </div>

              <div className="bs-bar"><div className="bs-bar-fill" style={{ width: `${percent}%` }} /></div>

              {/* customer fields */}
              <div className="cust-grid">

                <div className="cf">
                  <label>Tên *</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Nhập tên" />
                </div>

                <div className="cf">
                  <label>Họ *</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nhập họ" />
                </div>

                <div className="cf cf-full">
                  <label>Email *</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" type="email" />
                </div>

                <div className="cf">
                  <label>Số điện thoại *</label>
                  <div className="phone-wrap">
                    <span className="phone-code">🇻🇳 +84</span>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0123 456 789" />
                  </div>
                </div>

                <div className="cf cf-check">
                  <label className="chk-label">
                    <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} />
                    Nhận xác nhận qua tin nhắn
                  </label>
                </div>

              </div>

              {/* action buttons */}
              <div className="action-row">
                <button className="cancel-btn" onClick={handleCancel}>
                  Huỷ đặt bàn
                </button>
                <button className="confirm-btn" onClick={handleSubmit}>
                  Xác nhận &nbsp;·&nbsp; {String(minutes).padStart(2,"0")}:{String(seconds).padStart(2,"0")}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ── ADDRESS CHIP — fixed bottom-left ── */}
      <AddressChip restaurant={restaurant} />

      {/* SUCCESS POPUP */}
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
