import { useEffect, useMemo, useState } from "react"
import {
  claimDriverOrderApi,
  completeDriverOrderApi,
  getDriverAvailableOrdersApi,
  getDriverDeliveredOrdersApi,
  getDriverDeliveringOrdersApi,
} from "../../services/driverApi"
import { getApiErrorMessage } from "../../services/apiClient"
import { normalizeOrderList } from "../../services/responseAdapters"
import { getStaffOrdersApi } from "../../services/staffApi"
import { getDriverSectionMeta } from "./driverSections"

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

function sortOrders(items) {
  return [...items].sort((left, right) => {
    const rightTime = new Date(right.createdAt || 0).getTime()
    const leftTime = new Date(left.createdAt || 0).getTime()
    return rightTime - leftTime
  })
}

function DriverOrderCard({ order, showActions, onClaim, onComplete, onCancel }) {
  return (
    <div className="smd-card">
      <div className="smd-card-header">
        <span className="smd-id">{order.id}</span>
        <span className={`sm-badge ${getDriverBadge(order)}`}>{getDriverStatusLabel(order)}</span>
      </div>

      <div className="smd-info">
        <p>Khách: {order.customer || "Khách online"}</p>
        <p>Địa chỉ: {order.address || "-"}</p>
        <p>SDT: {order.phone || "-"}</p>
        {order.driverName ? (
          <p>
            Tài xế: {order.driverName}
            {order.driverPhone ? ` - ${order.driverPhone}` : ""}
          </p>
        ) : null}
        {order.notes ? <p>Ghi chú: {order.notes}</p> : null}
        <p style={{ fontWeight: 700, color: "#0f2044", marginTop: 8 }}>Tổng: {order.total}</p>
      </div>

      {showActions === "pending" ? (
        <div className="smd-actions">
          <button className="sm-btn" onClick={() => onClaim(order.id)}>
            Nhận đơn này
          </button>
        </div>
      ) : null}

      {showActions === "delivering" ? (
        <div className="smd-actions">
          <button className="sm-btn" style={{ background: "#16a34a" }} onClick={() => onComplete(order.id)}>
            Giao thành công
          </button>
          <button className="sm-btn sm-btn-sm danger" onClick={() => onCancel(order.id)}>
            Khách không nhận món
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function DriverSectionDetail({ section, isDriverMode, onBack }) {
  const meta = getDriverSectionMeta(section)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  async function loadSectionOrders() {
    try {
      setLoading(true)

      let nextOrders = []

      if (isDriverMode) {
        if (section === "pending") {
          nextOrders = normalizeOrderList(await loadCollection(getDriverAvailableOrdersApi))
        }

        if (section === "delivering") {
          nextOrders = normalizeOrderList(await loadCollection(getDriverDeliveringOrdersApi))
        }

        if (section === "history") {
          nextOrders = normalizeOrderList(await loadCollection(getDriverDeliveredOrdersApi))
        }
      } else {
        if (section === "pending" || section === "delivering") {
          const deliveryOrders = normalizeOrderList(
            await loadCollection(() => getStaffOrdersApi({ status: "DELIVERY" }))
          )
          nextOrders = deliveryOrders.filter(order =>
            section === "pending" ? order.statusCode === "DELIVERY" : order.statusCode === "DELIVERING"
          )
        }

        if (section === "history") {
          const [completed, cancelled, incomplete] = await Promise.all([
            loadCollection(() => getStaffOrdersApi({ status: "COMPLETED" })),
            loadCollection(() => getStaffOrdersApi({ status: "CANCELLED" })),
            loadCollection(() => getStaffOrdersApi({ status: "INCOMPLETE" })),
          ])

          nextOrders = normalizeOrderList([
            ...completed,
            ...cancelled,
            ...incomplete,
          ])
        }
      }

      setOrders(sortOrders(nextOrders))
      setError("")
    } catch (apiError) {
      setOrders([])
      setError(getApiErrorMessage(apiError, "Không thể tải đơn giao hàng"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSectionOrders()
    const intervalId = window.setInterval(loadSectionOrders, 10000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isDriverMode, section])

  async function handleClaim(orderId) {
    try {
      const numericId = Number(String(orderId).replace("#4P", ""))
      const responseMessage = await claimDriverOrderApi(numericId)
      await loadSectionOrders()
      setError("")
      setNotice(typeof responseMessage === "string" && responseMessage.trim() ? responseMessage : "claim success")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể nhận đơn"))
    }
  }

  async function handleFinish(orderId, status) {
    try {
      const numericId = Number(String(orderId).replace("#4P", ""))
      const responseMessage = await completeDriverOrderApi(numericId, status)
      await loadSectionOrders()
      setError("")
      setNotice(typeof responseMessage === "string" && responseMessage.trim() ? responseMessage : "update success")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể cập nhật giao hàng"))
    }
  }

  const actionMode = useMemo(() => {
    if (!isDriverMode) return null
    if (section === "pending") return "pending"
    if (section === "delivering") return "delivering"
    return null
  }, [isDriverMode, section])

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div>
          <h2 className="sm-title">{meta.title}</h2>
          <p className="sm-sub">{meta.description}</p>
        </div>

        <div className="smd-toolbar">
          <button type="button" className="sm-btn outline" onClick={onBack}>
            Quay lại dashboard
          </button>
          <button type="button" className="sm-btn" onClick={loadSectionOrders}>
            Tải lại
          </button>
        </div>
      </div>

      {error ? <p className="co-err">{error}</p> : null}
      {notice ? <p className="pf-success">{notice}</p> : null}

      {loading ? (
        <div className="smd-section-state">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="smd-section-state">
          <p>{meta.emptyText}</p>
        </div>
      ) : (
        <div className="smd-list">
          {orders.map(order => (
            <DriverOrderCard
              key={order.id}
              order={order}
              showActions={actionMode}
              onClaim={handleClaim}
              onComplete={id => handleFinish(id, "COMPLETED")}
              onCancel={id => handleFinish(id, "INCOMPLETE")}
            />
          ))}
        </div>
      )}
    </div>
  )
}
