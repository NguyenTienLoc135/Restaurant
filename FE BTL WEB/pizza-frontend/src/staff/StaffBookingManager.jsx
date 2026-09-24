import { useEffect, useMemo, useState } from "react"
import { normalizeBookingList } from "../services/responseAdapters"
import { getStaffBookingsApi, updateStaffBookingStatusApi } from "../services/staffApi"
import { getApiErrorMessage } from "../services/apiClient"
import StaffDateFilterBar from "./shared/StaffDateFilterBar"
import { createDefaultDateFilters, updateDateFilterField, validateDateFilters } from "./shared/staffDateFilters"

const BOOKING_STATUSES = [
  "Chờ xác nhận",
  "Bàn đã đặt",
  "Đã hủy",
]

const BOOKING_STATUS_LABEL_BY_CODE = {
  PENDING: "Chờ xác nhận",
  ACCEPTED: "Bàn đã đặt",
  CANCELLED: "Đã hủy",
}

const BADGE = {
  "Chờ xác nhận": "yellow",
  "Bàn đã đặt": "blue",
  "Đã hủy": "red",
}

function getBookingLabel(booking) {
  return BOOKING_STATUS_LABEL_BY_CODE[booking?.statusCode] || booking?.status || "Chờ xác nhận"
}

function getUpdateOptions(booking) {
  const label = getBookingLabel(booking)
  if (label === "Đã hủy") return ["Đã hủy"]
  if (label === "Bàn đã đặt") return ["Bàn đã đặt", "Đã hủy"]
  return BOOKING_STATUSES
}

function isEmptyCollectionError(error) {
  const status = Number(error?.response?.status)
  const message = getApiErrorMessage(error, "").toLowerCase()
  return status === 404 || message.includes("not found") || message.includes("khong tim thay")
}

async function loadCollection(request) {
  try {
    return await request()
  } catch (error) {
    if (isEmptyCollectionError(error)) {
      return []
    }
    throw error
  }
}

function buildBookingDateParams(filters) {
  if (filters.date) {
    return { bookingDate: filters.date }
  }

  const defaults = createDefaultDateFilters()
  return { bookingDate: defaults.date }
}

function getBookingTimestamp(booking) {
  const value = booking?.bookingDateTime || booking?.bookingTime
  if (!value) return null

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

function getDateRangeTimestamps(filters) {
  let fromTs = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00`).getTime() : null
  let toTs = filters.toDate ? new Date(`${filters.toDate}T23:59:59.999`).getTime() : null

  if (Number.isNaN(fromTs)) fromTs = null
  if (Number.isNaN(toTs)) toTs = null

  return { fromTs, toTs }
}

function filterBookingsByDateRange(bookings, filters) {
  if (!filters.fromDate && !filters.toDate) return bookings

  const { fromTs, toTs } = getDateRangeTimestamps(filters)
  return bookings.filter(booking => {
    const timestamp = getBookingTimestamp(booking)
    if (timestamp == null) return false

    const matchFrom = fromTs == null || timestamp >= fromTs
    const matchTo = toTs == null || timestamp <= toTs
    return matchFrom && matchTo
  })
}

export default function StaffBookingManager() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState("Tất cả")
  const [error, setError] = useState("")
  const [dateFilters, setDateFilters] = useState(createDefaultDateFilters)
  const [appliedDateFilters, setAppliedDateFilters] = useState(createDefaultDateFilters)

  useEffect(() => {
    let active = true

    async function loadBookings(showLoader = true) {
      try {
        if (showLoader) setLoading(true)

        const list = await loadCollection(() => getStaffBookingsApi(buildBookingDateParams(appliedDateFilters)))
        if (!active) return

        const normalized = normalizeBookingList(list)
        const filtered =
          appliedDateFilters.date || (!appliedDateFilters.fromDate && !appliedDateFilters.toDate)
            ? normalized
            : filterBookingsByDateRange(normalized, appliedDateFilters)

        setBookings(filtered)
        setError("")
      } catch (apiError) {
        if (!active) return
        setBookings([])
        setError(getApiErrorMessage(apiError, "Không thể tải dữ liệu đặt bàn"))
      } finally {
        if (!active || !showLoader) return
        setLoading(false)
      }
    }

    loadBookings(true)
    const intervalId = window.setInterval(() => loadBookings(false), 10000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [appliedDateFilters])

  function applyDateFilters() {
    const validation = validateDateFilters(dateFilters)
    if (!validation.valid) {
      setError(validation.message)
      return
    }

    setAppliedDateFilters(
      dateFilters.date || dateFilters.fromDate || dateFilters.toDate
        ? dateFilters
        : createDefaultDateFilters()
    )
    setError("")
  }

  function resetDateFilters() {
    const defaults = createDefaultDateFilters()
    setDateFilters(defaults)
    setAppliedDateFilters(defaults)
    setError("")
  }

  async function updateStatus(id, newStatus) {
    try {
      const numericId = Number(String(id).replace("#BK", ""))
      if (!Number.isInteger(numericId) || numericId <= 0) {
        setError("Booking này chưa có mã hợp lệ từ backend, không thể cập nhật trạng thái.")
        return
      }

      await updateStaffBookingStatusApi(numericId, newStatus)
      setBookings(current =>
        current.map(booking =>
          booking.id === id
            ? {
                ...booking,
                status: newStatus,
                statusCode:
                  newStatus === "Chờ xác nhận"
                    ? "PENDING"
                    : newStatus === "Bàn đã đặt"
                      ? "ACCEPTED"
                      : "CANCELLED",
              }
            : booking
        )
      )
      setError("")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể cập nhật trạng thái booking"))
    }
  }

  const displayed = useMemo(
    () => bookings.filter(booking => filterStatus === "Tất cả" || getBookingLabel(booking) === filterStatus),
    [bookings, filterStatus]
  )

  const counts = {
    total: bookings.length,
    pending: bookings.filter(booking => getBookingLabel(booking) === "Chờ xác nhận").length,
    confirmed: bookings.filter(booking => getBookingLabel(booking) === "Bàn đã đặt").length,
    cancelled: bookings.filter(booking => getBookingLabel(booking) === "Đã hủy").length,
  }

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div>
          <h2 className="sm-title">Quản lý đặt bàn</h2>
          <p className="sm-sub">Mặc định chỉ tải booking của hôm nay. Staff có thể lọc theo 1 ngày cụ thể hoặc theo khoảng ngày để giảm tải query không cần thiết.</p>
        </div>
      </div>

      <div className="sm-stats">
        {[["🍽️", counts.total, "Tổng đặt bàn"], ["⏳", counts.pending, "Chờ xác nhận"], ["📌", counts.confirmed, "Đã xác nhận"], ["❌", counts.cancelled, "Đã hủy"]].map(([icon, value, label]) => (
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
        <StaffDateFilterBar
          filters={dateFilters}
          loading={loading}
          onChangeField={(field, value) => setDateFilters(current => updateDateFilterField(current, field, value))}
          onSearch={applyDateFilters}
          onReset={resetDateFilters}
        />
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
              <th>Tài khoản</th>
              <th>Số người</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Đang tải dữ liệu đặt bàn...
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Không có booking nào trong khoảng thời gian đã chọn
                </td>
              </tr>
            ) : (
              displayed.map(booking => {
                const options = getUpdateOptions(booking)
                const displayStatus = getBookingLabel(booking)

                return (
                  <tr key={booking.id}>
                    <td style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600 }}>{booking.id}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{booking.date}</td>
                    <td style={{ fontWeight: 600, color: "#0f2044" }}>{booking.time}</td>
                    <td style={{ fontWeight: 600, color: "#0f2044" }}>{booking.name || "Khách"}</td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{booking.guests} người</td>
                    <td>
                      <span className={`sm-badge ${BADGE[displayStatus] || "gray"}`}>{displayStatus}</span>
                    </td>
                    <td>
                      <select
                        className="sm-status-select"
                        value={displayStatus}
                        onChange={event => updateStatus(booking.id, event.target.value)}
                      >
                        {options.map(status => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
