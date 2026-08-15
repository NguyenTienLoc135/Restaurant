import { useState } from "react"

const BOOKING_STATUSES = ["Chờ xác nhận", "Bàn đã đặt", "Khách đã đến", "Bàn còn trống", "Đã hủy"]

const BADGE = {
  "Chờ xác nhận": "yellow",
  "Bàn đã đặt": "blue",
  "Khách đã đến": "green",
  "Bàn còn trống": "gray",
  "Đã hủy": "red",
}

const SEED_BOOKINGS = [
  { id: "#BK0001", date: "30/03/2026", time: "19:00", guests: 4, name: "Nguyễn Anh Khoa", phone: "0901 111 222", email: "anhkhoa@email.com", table: "Bàn 5", status: "Bàn đã đặt" },
  { id: "#BK0002", date: "30/03/2026", time: "20:30", guests: 2, name: "Trần Bích Ngọc", phone: "0912 222 333", email: "bichngoc@email.com", table: "Bàn 2", status: "Chờ xác nhận" },
  { id: "#BK0003", date: "29/03/2026", time: "12:00", guests: 6, name: "Lê Hùng Dũng", phone: "0923 333 444", email: "hungdung@email.com", table: "Bàn 8", status: "Khách đã đến" },
  { id: "#BK0004", date: "29/03/2026", time: "18:00", guests: 3, name: "Phạm Thùy Linh", phone: "0934 444 555", email: "thuylinh@email.com", table: "Bàn 3", status: "Bàn còn trống" },
]

function loadBookings() {
  try {
    const staff = JSON.parse(localStorage.getItem("hs_staff_bookings") || "null")
    if (staff?.length) return staff
    const real = JSON.parse(localStorage.getItem("hs_bookings") || "[]")
    const merged = [...real]
    SEED_BOOKINGS.forEach(seed => {
      if (!merged.find(item => item.id === seed.id)) merged.push(seed)
    })
    return merged
  } catch {
    return SEED_BOOKINGS
  }
}

function saveBookings(list) {
  localStorage.setItem("hs_staff_bookings", JSON.stringify(list))
  localStorage.setItem("hs_bookings", JSON.stringify(list))
}

export default function StaffBookingManager() {
  const [bookings, setBookings] = useState(loadBookings)
  const [filterStatus, setFilterStatus] = useState("Tất cả")

  function updateStatus(id, newStatus) {
    const updated = bookings.map(booking => (booking.id === id ? { ...booking, status: newStatus } : booking))
    setBookings(updated)
    saveBookings(updated)
  }

  const displayed = bookings.filter(booking => filterStatus === "Tất cả" || booking.status === filterStatus)

  const counts = {
    total: bookings.length,
    booked: bookings.filter(booking => booking.status === "Bàn đã đặt").length,
    arrived: bookings.filter(booking => booking.status === "Khách đã đến").length,
    empty: bookings.filter(booking => booking.status === "Bàn còn trống").length,
  }

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div>
          <h2 className="sm-title">Quản lý Đặt bàn</h2>
          <p className="sm-sub">Toàn bộ thông tin khách vừa đặt bàn trên web sẽ hiện ở đây</p>
        </div>
      </div>

      <div className="sm-stats">
        {[["🍽️", counts.total, "Tổng đặt bàn"], ["📌", counts.booked, "Đã đặt"], ["👥", counts.arrived, "Khách đến"], ["🟢", counts.empty, "Còn trống"]].map(([icon, value, label]) => (
          <div key={label} className="sm-stat-card">
            <span className="sm-stat-icon">{icon}</span>
            <div><p className="sm-stat-val">{value}</p><p className="sm-stat-label">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="sm-filter-row">
        <div className="sm-filter-tabs">
          {["Tất cả", ...BOOKING_STATUSES].map(status => (
            <button key={status} className={`sm-filter-tab ${filterStatus === status ? "active" : ""}`} onClick={() => setFilterStatus(status)}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="sm-table-wrap">
        <table className="sm-table">
          <thead>
            <tr><th>Mã đặt bàn</th><th>Ngày</th><th>Giờ</th><th>Khách</th><th>SĐT</th><th>Email</th><th>Số người</th><th>Bàn</th><th>Trạng thái</th><th>Cập nhật</th></tr>
          </thead>
          <tbody>
            {displayed.map(booking => (
              <tr key={booking.id}>
                <td style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 600 }}>{booking.id}</td>
                <td style={{ whiteSpace: "nowrap" }}>{booking.date}</td>
                <td style={{ fontWeight: 600, color: "#0f2044" }}>{booking.time}</td>
                <td style={{ fontWeight: 600, color: "#0f2044" }}>{booking.name || "Khách"}</td>
                <td style={{ fontSize: 13, color: "#6b7280" }}>{booking.phone || "—"}</td>
                <td style={{ fontSize: 13, color: "#6b7280" }}>{booking.email || "—"}</td>
                <td style={{ textAlign: "center", fontWeight: 600 }}>{booking.guests} người</td>
                <td>
                  <span style={{ background: "#f0f4ff", color: "#1a3f7a", padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                    {booking.table || "TBD"}
                  </span>
                </td>
                <td><span className={`sm-badge ${BADGE[booking.status] || "gray"}`}>{booking.status}</span></td>
                <td>
                  <select className="sm-status-select" value={booking.status} onChange={e => updateStatus(booking.id, e.target.value)}>
                    {BOOKING_STATUSES.map(status => <option key={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {displayed.length === 0 && <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Không có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
