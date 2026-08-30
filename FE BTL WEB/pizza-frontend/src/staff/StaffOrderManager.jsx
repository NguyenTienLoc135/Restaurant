import { useEffect, useMemo, useState } from "react"
import { normalizeOrderList, normalizeOrderResponse } from "../services/responseAdapters"
import { getStaffOrderDetailsApi, getStaffOrdersApi, updateStaffOrderStatusApi } from "../services/staffApi"
import { getApiErrorMessage } from "../services/apiClient"

const FILTER_STATUSES = [
  "Tất cả",
  "Chờ xác nhận",
  "Đang chuẩn bị",
  "Đã giao cho shipper",
  "Đang giao hàng",
  "Đã hoàn thành",
  "Đã hủy",
]

const BADGE = {
  "Chờ xác nhận": "yellow",
  "Đang chuẩn bị": "blue",
  "Đã giao cho shipper": "green",
  "Đang giao hàng": "blue",
  "Đã hoàn thành": "green",
  "Đã hủy": "red",
}

function getOrderLabel(order) {
  if (!order) return "Chờ xác nhận"
  if (order.statusCode === "INCOMPLETE") return "Đã hủy"
  return order.status || "Chờ xác nhận"
}

function getUpdateOptions(order) {
  switch (order.statusCode) {
    case "PENDING":
      return ["Chờ xác nhận", "Đang chuẩn bị", "Đã hủy"]
    case "ACCEPTED":
      return ["Đang chuẩn bị", "Đã giao cho shipper", "Đã hủy"]
    case "DELIVERY":
      return ["Đã giao cho shipper", "Đã hủy"]
    case "DELIVERING":
      return ["Đang giao hàng"]
    case "COMPLETED":
      return ["Đã hoàn thành"]
    case "CANCELLED":
    case "INCOMPLETE":
      return ["Đã hủy"]
    default:
      return [getOrderLabel(order)]
  }
}

export default function StaffOrderManager() {
  const [orders, setOrders] = useState([])
  const [filterStatus, setFilterStatus] = useState("Tất cả")
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadOrders() {
      try {
        const list = await getStaffOrdersApi()
        const normalized = normalizeOrderList(list)
        const hydrated = await Promise.all(
          normalized.map(async order => {
            try {
              const numericId = Number(String(order.id).replace("#4P", ""))
              const details = await getStaffOrderDetailsApi(numericId)
              return normalizeOrderResponse({ ...order, details })
            } catch {
              return order
            }
          })
        )

        if (!active) return
        setOrders(hydrated)
        setError("")
      } catch (apiError) {
        if (!active) return
        setError(getApiErrorMessage(apiError, "Không thể tải danh sách đơn hàng"))
      }
    }

    loadOrders()
    const intervalId = window.setInterval(loadOrders, 8000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  async function updateStatus(id, newStatus) {
    try {
      const numericId = Number(String(id).replace("#4P", ""))
      await updateStaffOrderStatusApi(numericId, newStatus)
      setOrders(current =>
        current.map(order =>
          order.id === id
            ? normalizeOrderResponse({
                ...order,
                status: newStatus,
                statusCode:
                  newStatus === "Chờ xác nhận"
                    ? "PENDING"
                    : newStatus === "Đang chuẩn bị"
                      ? "ACCEPTED"
                      : newStatus === "Đã giao cho shipper"
                        ? "DELIVERY"
                        : newStatus === "Đang giao hàng"
                          ? "DELIVERING"
                          : newStatus === "Đã hoàn thành"
                            ? "COMPLETED"
                            : "CANCELLED",
                driverName: newStatus === "Đã giao cho shipper" || newStatus === "Đã hủy" ? "" : order.driverName,
                driverPhone: newStatus === "Đã giao cho shipper" || newStatus === "Đã hủy" ? "" : order.driverPhone,
              })
            : order
        )
      )
      setError("")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể cập nhật trạng thái đơn"))
    }
  }

  const displayed = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return orders.filter(order => {
      const displayStatus = getOrderLabel(order)
      const matchStatus = filterStatus === "Tất cả" || displayStatus === filterStatus
      const matchSearch =
        !normalizedSearch ||
        order.id.toLowerCase().includes(normalizedSearch) ||
        order.customer?.toLowerCase().includes(normalizedSearch) ||
        order.phone?.includes(normalizedSearch) ||
        order.customerEmail?.toLowerCase().includes(normalizedSearch) ||
        order.driverName?.toLowerCase().includes(normalizedSearch)

      return matchStatus && matchSearch
    })
  }, [filterStatus, orders, search])

  const counts = {
    total: orders.length,
    pending: orders.filter(order => order.statusCode === "PENDING").length,
    preparing: orders.filter(order => order.statusCode === "ACCEPTED").length,
    shipping: orders.filter(order => ["DELIVERY", "DELIVERING"].includes(order.statusCode)).length,
    done: orders.filter(order => order.statusCode === "COMPLETED").length,
  }

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div>
          <h2 className="sm-title">Quản lý đơn hàng</h2>
          <p className="sm-sub">Staff theo dõi toàn bộ đơn đặt món và điều phối giao hàng tại đây.</p>
        </div>
      </div>

      <div className="sm-stats">
        {[["📦", counts.total, "Tổng đơn"], ["⏳", counts.pending, "Chờ xác nhận"], ["👨‍🍳", counts.preparing, "Đang chuẩn bị"], ["🛵", counts.shipping, "Đang giao"], ["✅", counts.done, "Hoàn thành"]].map(([icon, value, label]) => (
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
        <input
          className="sm-search"
          placeholder="Tìm mã đơn, tên khách, email, số điện thoại, shipper"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
        <div className="sm-filter-tabs">
          {FILTER_STATUSES.map(status => (
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
              <th>Mã đơn</th>
              <th>Ngày tạo</th>
              <th>Khách hàng</th>
              <th>Địa chỉ / shipper</th>
              <th>Món</th>
              <th>Tổng</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(order => {
              const displayStatus = getOrderLabel(order)
              const options = getUpdateOptions(order)
              const locked = ["DELIVERING", "COMPLETED", "CANCELLED", "INCOMPLETE"].includes(order.statusCode)

              return (
                <tr key={order.id}>
                  <td style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600 }}>{order.id}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{order.date}</td>
                  <td>
                    <p style={{ fontWeight: 600, color: "#0f2044" }}>{order.customer || "Khách online"}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>{order.phone || "-"}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>{order.customerEmail || "-"}</p>
                  </td>
                  <td style={{ fontSize: 13, color: "#6b7280", maxWidth: 220 }}>
                    <p>{order.address || "-"}</p>
                    {order.driverName ? (
                      <p style={{ marginTop: 6, color: "#0f2044" }}>
                        Shipper: {order.driverName} {order.driverPhone ? `- ${order.driverPhone}` : ""}
                      </p>
                    ) : (
                      <p style={{ marginTop: 6, color: "#9ca3af" }}>Chưa có shipper nhận</p>
                    )}
                  </td>
                  <td style={{ fontSize: 13, maxWidth: 220, color: "#374151" }}>
                    {order.items}
                    {order.notes ? <p style={{ marginTop: 6, color: "#9ca3af" }}>📝 {order.notes}</p> : null}
                  </td>
                  <td style={{ fontWeight: 700, color: "#0f2044", whiteSpace: "nowrap" }}>{order.total}</td>
                  <td>
                    <span className={`sm-badge ${BADGE[displayStatus] || "gray"}`}>{displayStatus}</span>
                  </td>
                  <td>
                    <select
                      className="sm-status-select"
                      value={displayStatus}
                      disabled={locked}
                      onChange={event => updateStatus(order.id, event.target.value)}
                    >
                      {options.map(status => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            })}
            {displayed.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Không có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
