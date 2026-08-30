import { useEffect, useState } from "react"
import { normalizeBookingList } from "../services/responseAdapters"
import { getStaffBookingsApi, updateStaffBookingStatusApi } from "../services/staffApi"
import { getApiErrorMessage } from "../services/apiClient"

const BOOKING_STATUSES = [
  "Chờ xác nhận",
  "Bàn đã đặt",
  "Khách đã đến",
  "Đã hủy",
]

const BADGE = {
  "Chờ xác nhận": "yellow",
  "Bàn đã đặt": "blue",
  "Khách đã đến": "green",
  "Bàn còn trống": "gray",
  "Đã hủy": "red",
}

export default function StaffBookingManager() {
  const [bookings, setBookings] = useState([])
  const [filterStatus, setFilterStatus] = useState("Tất cả")
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadBookings() {
      try {
        const list = await getStaffBookingsApi()
        setBookings(normalizeBookingList(list))
        setError("")
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, "Không thể tải dữ liệu đặt bàn"))
      }
    }

    loadBookings()
  }, [])

  async function updateStatus(id, newStatus) {
    try {
      const numericId = Number(String(id).replace("#BK", ""))
      if (!Number.isInteger(numericId) || numericId <= 0) {
        setError("Booking nay chua co ma hop le tu backend, khong the cap nhat trang thai.")
        return
      }
      await updateStaffBookingStatusApi(numericId, newStatus)
      setBookings(current => current.map(booking => (booking.id === id ? { ...booking, status: newStatus } : booking)))
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể cập nhật trạng thái booking"))
    }
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
          <h2 className="sm-title">Quản lý đặt bàn</h2>
          <p className="sm-sub">Tất cả booking từ web được đưa vào đây để staff theo dõi lịch sử cũ và mới.</p>
        </div>
      </div>

      <div className="sm-stats">
        {[["🍽️", counts.total, "Tổng đặt bàn"], ["📌", counts.booked, "Đã đặt"], ["👥", counts.arrived, "Khách đến"], ["🟢", counts.empty, "Còn trống"]].map(([icon, value, label]) => (
          <div key={label} className="sm-stat-card">
            <span className="sm-stat-icon">{icon}</span>
            <div>
              <p className="sm-stat-val">{value}</p>
              <p className="sm-stat-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sm-filter-row">
        <div className="sm-filter-tabs">
          {["Tất cả", ...BOOKING_STATUSES].map(status => (
            <button
              key={status}
              className={`sm-filter-tab ${filterStatus === status ? "active" : ""}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="co-err">{error}</p>}

      <div className="sm-table-wrap">
        <table className="sm-table">
          <thead>
            <tr>
              <th>Mã đặt bàn</th>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Khách</th>
              <th>SDT</th>
              <th>Email</th>
              <th>Số người</th>
              <th>Bàn</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(booking => (
              <tr key={booking.id}>
                <td style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600 }}>{booking.id}</td>
                <td style={{ whiteSpace: "nowrap" }}>{booking.date}</td>
                <td style={{ fontWeight: 600, color: "#0f2044" }}>{booking.time}</td>
                <td style={{ fontWeight: 600, color: "#0f2044" }}>{booking.name || "Khách"}</td>
                <td style={{ fontSize: 13, color: "#6b7280" }}>{booking.phone || "-"}</td>
                <td style={{ fontSize: 13, color: "#6b7280" }}>{booking.email || "-"}</td>
                <td style={{ textAlign: "center", fontWeight: 600 }}>{booking.guests} người</td>
                <td>
                  <span style={{ background: "#f0f4ff", color: "#1a3f7a", padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                    {booking.table || "TBD"}
                  </span>
                </td>
                <td>
                  <span className={`sm-badge ${BADGE[booking.status] || "gray"}`}>{booking.status}</span>
                </td>
                <td>
                  <select className="sm-status-select" value={booking.status} onChange={event => updateStatus(booking.id, event.target.value)}>
                    {BOOKING_STATUSES.map(status => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
