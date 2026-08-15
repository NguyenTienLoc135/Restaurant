import { useState } from "react"

function loadOrders() {
  try {
    const staff = JSON.parse(localStorage.getItem("hs_staff_orders") || "null")
    return (staff || []).filter(o => ["Đang chuẩn bị","Đã giao cho shipper","Chờ xác nhận"].includes(o.status))
  } catch { return [] }
}

export default function StaffDriverView() {
  const [orders, setOrders] = useState(loadOrders)
  const [claimed, setClaimed] = useState({})

  function claimOrder(id) {
    setClaimed(c => ({ ...c, [id]: true }))
    const all = JSON.parse(localStorage.getItem("hs_staff_orders") || "[]")
    const updated = all.map(o => o.id === id ? { ...o, status: "Đã giao cho shipper" } : o)
    localStorage.setItem("hs_staff_orders", JSON.stringify(updated))
    setOrders(updated.filter(o => ["Đang chuẩn bị","Đã giao cho shipper","Chờ xác nhận"].includes(o.status)))
  }

  function completeOrder(id) {
    const all = JSON.parse(localStorage.getItem("hs_staff_orders") || "[]")
    const updated = all.map(o => o.id === id ? { ...o, status: "Đã hoàn thành" } : o)
    localStorage.setItem("hs_staff_orders", JSON.stringify(updated))
    setOrders(updated.filter(o => ["Đang chuẩn bị","Đã giao cho shipper","Chờ xác nhận"].includes(o.status)))
  }

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div>
          <h2 className="sm-title">Đơn cần giao</h2>
          <p className="sm-sub">Nhận đơn và xác nhận giao thành công</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
          <p style={{ fontSize: 48 }}>🛵</p>
          <p style={{ fontSize: 17, marginTop: 16 }}>Không có đơn hàng nào cần giao</p>
        </div>
      ) : (
        <div className="smd-grid">
          {orders.map(o => (
            <div key={o.id} className="smd-card">
              <div className="smd-card-header">
                <span className="smd-id">{o.id}</span>
                <span className={`sm-badge ${o.status === "Đã giao cho shipper" ? "green" : "yellow"}`}>{o.status}</span>
              </div>
              <div className="smd-info">
                <p>👤 {o.customer || "Khách online"}</p>
                <p>📍 {o.address || "—"}</p>
                <p>📞 {o.phone || "—"}</p>
                <p>🍕 {o.items}</p>
                <p style={{ fontWeight: 700, color: "#0f2044", marginTop: 8 }}>💰 {o.total}</p>
              </div>
              <div className="smd-actions">
                {o.status !== "Đã giao cho shipper" ? (
                  <button className="sm-btn" onClick={() => claimOrder(o.id)}>🛵 Nhận đơn này</button>
                ) : (
                  <button className="sm-btn" style={{ background: "#16a34a" }} onClick={() => completeOrder(o.id)}>
                    ✅ Giao thành công
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
