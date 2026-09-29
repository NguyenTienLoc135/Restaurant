import { useEffect, useMemo, useState } from "react"
import { normalizeOrderList, normalizeOrderResponse } from "../services/responseAdapters"
import { getStaffOrderDetailsApi, getStaffOrdersApi, updateStaffOrderStatusApi } from "../services/staffApi"
import { getApiErrorMessage } from "../services/apiClient"
import StaffDateFilterBar from "./shared/StaffDateFilterBar"
import { createDefaultDateFilters, updateDateFilterField, validateDateFilters } from "./shared/staffDateFilters"

const FILTER_STATUSES = [
  "Tất cả",
  "Chờ xác nhận",
  "Đang chuẩn bị",
  "Đã giao cho shipper",
  "Đang giao hàng",
  "Đã hoàn thành",
  "Khách không nhận món",
  "Đã hủy",
]

const ORDER_STATUS_LABEL_BY_CODE = {
  PENDING: "Chờ xác nhận",
  ACCEPTED: "Đang chuẩn bị",
  DELIVERY: "Đã giao cho shipper",
  DELIVERING: "Đang giao hàng",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
  INCOMPLETE: "Khách không nhận món",
}

const BADGE = {
  "Chờ xác nhận": "yellow",
  "Đang chuẩn bị": "blue",
  "Đã giao cho shipper": "green",
  "Đang giao hàng": "blue",
  "Đã hoàn thành": "green",
  "Khách không nhận món": "red",
  "Đã hủy": "red",
}

function getOrderLabel(order) {
  if (!order) return "Chờ xác nhận"
  return ORDER_STATUS_LABEL_BY_CODE[order.statusCode] || order.status || "Chờ xác nhận"
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
      return ["Đã hủy"]
    case "INCOMPLETE":
      return ["Khách không nhận món"]
    default:
      return [getOrderLabel(order)]
  }
}

function toNumber(value) {
  if (value == null || value === "") return null
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""))
  return Number.isFinite(numeric) ? numeric : null
}

function formatMoney(value) {
  const numeric = toNumber(value)
  return numeric == null ? "-" : `${numeric.toLocaleString("vi-VN")}d`
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

function buildOrderDateParams(filters) {
  if (filters.date) {
    return { date: filters.date }
  }

  if (filters.fromDate || filters.toDate) {
    return {
      ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
      ...(filters.toDate ? { toDate: filters.toDate } : {}),
    }
  }

  const defaults = createDefaultDateFilters()
  return { date: defaults.date }
}

export default function StaffOrderManager() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState("Tất cả")
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [dateFilters, setDateFilters] = useState(createDefaultDateFilters)
  const [appliedDateFilters, setAppliedDateFilters] = useState(createDefaultDateFilters)

  useEffect(() => {
    let active = true

    async function loadOrders(showLoader = true) {
      try {
        if (showLoader) setLoading(true)

        const list = await loadCollection(() => getStaffOrdersApi(buildOrderDateParams(appliedDateFilters)))
        if (!active) return

        setOrders(normalizeOrderList(list))
        setError("")
      } catch (apiError) {
        if (!active) return
        setOrders([])
        setError(getApiErrorMessage(apiError, "Không thể tải danh sách đơn hàng"))
      } finally {
        if (!active || !showLoader) return
        setLoading(false)
      }
    }

    loadOrders(true)
    const intervalId = window.setInterval(() => loadOrders(false), 10000)

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
                            : newStatus === "Khách không nhận món"
                              ? "INCOMPLETE"
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

  async function openOrderDetails(order) {
    setSelectedOrder(order)

    if (Array.isArray(order.details) && order.details.length > 0) {
      setDetailsLoading(false)
      return
    }

    try {
      setDetailsLoading(true)
      const numericId = Number(String(order.id).replace("#4P", ""))
      const details = await getStaffOrderDetailsApi(numericId)
      const hydratedOrder = normalizeOrderResponse({ ...order, details })

      setOrders(current =>
        current.map(item => (item.id === order.id ? hydratedOrder : item))
      )
      setSelectedOrder(hydratedOrder)
      setError("")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể tải chi tiết món của đơn hàng"))
    } finally {
      setDetailsLoading(false)
    }
  }

  function closeOrderDetails() {
    setSelectedOrder(null)
    setDetailsLoading(false)
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
        <StaffDateFilterBar
          filters={dateFilters}
          loading={loading}
          onChangeField={(field, value) => setDateFilters(current => updateDateFilterField(current, field, value))}
          onSearch={applyDateFilters}
          onReset={resetDateFilters}
        />
      </div>

      <div className="sm-filter-row">
        <input
          className="sm-search"
          placeholder="Tìm mã đơn, tên khách, số điện thoại, shipper"
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
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Đang tải dữ liệu đơn hàng...
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Không có đơn hàng nào trong khoảng thời gian đã chọn
                </td>
              </tr>
            ) : (
              displayed.map(order => {
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
                      <button
                        type="button"
                        className="sm-detail-trigger"
                        onClick={() => openOrderDetails(order)}
                      >
                        Xem chi tiết đơn hàng
                      </button>
                      {order.notes ? <p style={{ marginTop: 6, color: "#9ca3af" }}>Ghi chú: {order.notes}</p> : null}
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
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="sm-modal-back" onClick={event => event.target === event.currentTarget && closeOrderDetails()}>
          <div className="sm-modal sm-order-detail-modal">
            <div className="sm-modal-header">
              <div>
                <h3 className="sm-modal-title">Chi tiết đơn hàng {selectedOrder.id}</h3>
                <p className="sm-sub">
                  {selectedOrder.customer || "Khách online"} • {selectedOrder.total}
                </p>
              </div>
              <button className="sm-modal-close" onClick={closeOrderDetails}>
                x
              </button>
            </div>

            <div className="sm-modal-body">
              <div className="sm-order-detail-meta">
                <div>
                  <span>Trạng thái</span>
                  <strong>{getOrderLabel(selectedOrder)}</strong>
                </div>
                <div>
                  <span>Thời gian</span>
                  <strong>{selectedOrder.date}</strong>
                </div>
                <div>
                  <span>Số điện thoại</span>
                  <strong>{selectedOrder.phone || "-"}</strong>
                </div>
                <div>
                  <span>Địa chỉ</span>
                  <strong>{selectedOrder.address || "-"}</strong>
                </div>
              </div>

              {detailsLoading ? (
                <div className="sm-order-detail-empty">
                  <strong>Đang tải chi tiết món...</strong>
                </div>
              ) : Array.isArray(selectedOrder.details) && selectedOrder.details.length > 0 ? (
                <div className="sm-order-detail-list">
                  {selectedOrder.details.map((item, index) => {
                    const amount = Number(item.amount || item.quantity || 1) || 1
                    const price = toNumber(item.price)
                    const subtotal = price == null ? null : price * amount

                    return (
                      <article key={`${selectedOrder.id}-${item.name || "item"}-${index}`} className="sm-order-detail-card">
                        <div className="sm-order-detail-head">
                          <div>
                            <h4>{item.name || `Món ${index + 1}`}</h4>
                            {item.description ? <p>{item.description}</p> : null}
                          </div>
                          <span>x{amount}</span>
                        </div>

                        <div className="sm-order-detail-row">
                          <span>Đơn giá</span>
                          <strong>{formatMoney(item.price)}</strong>
                        </div>
                        <div className="sm-order-detail-row">
                          <span>Thành tiền</span>
                          <strong>{formatMoney(subtotal)}</strong>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="sm-order-detail-empty">
                  <strong>Chưa có dữ liệu món từ backend.</strong>
                  <p>Đơn này hiện chưa lấy được danh sách món chi tiết.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
