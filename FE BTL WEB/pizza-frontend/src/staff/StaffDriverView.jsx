import { useEffect, useMemo, useState } from "react"
import {
  claimDriverOrderApi,
  completeDriverOrderApi,
  getDriverAvailableOrdersApi,
  getDriverDeliveredOrdersApi,
  getDriverDeliveringOrdersApi,
} from "../services/driverApi"
import { getApiErrorMessage } from "../services/apiClient"
import { normalizeOrderList } from "../services/responseAdapters"

function getDriverStatusLabel(order) {
  switch (order.statusCode) {
    case "DELIVERY":
      return "Chờ nhận đơn"
    case "DELIVERING":
      return "Đang giao hàng"
    case "COMPLETED":
      return "Đã giao thành công"
    case "CANCELLED":
    case "INCOMPLETE":
      return "Khách không nhận món"
    default:
      return order.status || "Chờ nhận đơn"
  }
}

function getDriverBadge(order) {
  switch (order.statusCode) {
    case "COMPLETED":
      return "green"
    case "CANCELLED":
    case "INCOMPLETE":
      return "red"
    case "DELIVERING":
      return "blue"
    default:
      return "yellow"
  }
}

function DriverSection({ title, emptyText, orders, renderActions }) {
  return (
    <section style={{ marginTop: 28 }}>
      <div className="sm-header" style={{ marginBottom: 16 }}>
        <div>
          <h3 className="sm-title" style={{ fontSize: 28 }}>{title}</h3>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 0", color: "#9ca3af" }}>
          <p style={{ fontSize: 16 }}>{emptyText}</p>
        </div>
      ) : (
        <div className="smd-list">
          {orders.map(order => (
            <div key={order.id} className="smd-card">
              <div className="smd-card-header">
                <span className="smd-id">{order.id}</span>
                <span className={`sm-badge ${getDriverBadge(order)}`}>{getDriverStatusLabel(order)}</span>
              </div>
              <div className="smd-info">
                <p>Khách: {order.customer || "Khách online"}</p>
                <p>Địa chỉ: {order.address || "-"}</p>
                <p>SDT: {order.phone || "-"}</p>
                <p>Món: {order.items}</p>
                {order.notes ? <p>Ghi chú: {order.notes}</p> : null}
                <p style={{ fontWeight: 700, color: "#0f2044", marginTop: 8 }}>Tổng: {order.total}</p>
              </div>
              <div className="smd-actions">{renderActions(order)}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function StaffDriverView() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadDriverOrders() {
      try {
        const [available, delivering, delivered] = await Promise.all([
          getDriverAvailableOrdersApi().catch(() => []),
          getDriverDeliveringOrdersApi().catch(() => []),
          getDriverDeliveredOrdersApi().catch(() => []),
        ])

        if (!active) return
        setOrders(normalizeOrderList([...available, ...delivering, ...delivered]))
        setError("")
      } catch (apiError) {
        if (!active) return
        setError(getApiErrorMessage(apiError, "Không thể tải đơn giao hàng"))
      }
    }

    loadDriverOrders()
    const intervalId = window.setInterval(loadDriverOrders, 8000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  async function claimOrder(id) {
    try {
      const numericId = Number(String(id).replace("#4P", ""))
      await claimDriverOrderApi(numericId)
      setOrders(current =>
        current.map(order =>
          order.id === id ? { ...order, statusCode: "DELIVERING", status: "Đang giao hàng" } : order
        )
      )
      setError("")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể nhận đơn"))
    }
  }

  async function finishOrder(id, status) {
    try {
      const numericId = Number(String(id).replace("#4P", ""))
      await completeDriverOrderApi(numericId, status)
      setOrders(current =>
        current.map(order =>
          order.id === id
            ? {
                ...order,
                statusCode: status,
                status: status === "COMPLETED" ? "Đã hoàn thành" : "Đã hủy",
              }
            : order
        )
      )
      setError("")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể cập nhật giao hàng"))
    }
  }

  const availableOrders = useMemo(
    () => orders.filter(order => order.statusCode === "DELIVERY"),
    [orders]
  )

  const deliveringOrders = useMemo(
    () => orders.filter(order => order.statusCode === "DELIVERING"),
    [orders]
  )

  const resolvedOrders = useMemo(
    () => orders.filter(order => ["COMPLETED", "CANCELLED", "INCOMPLETE"].includes(order.statusCode)),
    [orders]
  )

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div>
          <h2 className="sm-title">Vận hành giao hàng</h2>
          <p className="sm-sub">Driver nhận đơn, xác nhận đang giao, giao thành công hoặc báo khách không nhận món ngay tại đây.</p>
        </div>
      </div>
      {error && <p className="co-err">{error}</p>}

      <DriverSection
        title="Đơn chờ tài xế nhận"
        emptyText="Không có đơn hàng nào đang chờ nhận"
        orders={availableOrders}
        renderActions={order => (
          <button className="sm-btn" onClick={() => claimOrder(order.id)}>
            Nhận đơn này
          </button>
        )}
      />

      <DriverSection
        title="Đơn đang giao"
        emptyText="Hiện chưa có đơn nào đang trên đường giao"
        orders={deliveringOrders}
        renderActions={order => (
          <>
            <button className="sm-btn" style={{ background: "#16a34a" }} onClick={() => finishOrder(order.id, "COMPLETED")}>
              Giao thành công
            </button>
            <button className="sm-btn sm-btn-sm danger" onClick={() => finishOrder(order.id, "CANCELLED")}>
              Khách không nhận món
            </button>
          </>
        )}
      />

      <DriverSection
        title="Lịch sử giao hàng"
        emptyText="Chưa có đơn đã hoàn tất hoặc bị hủy"
        orders={resolvedOrders}
        renderActions={() => null}
      />
    </div>
  )
}
