import { useState } from "react"

const ORDER_STATUSES = ["Chờ xác nhận", "Đã nhận món", "Đang chuẩn bị", "Đã giao cho shipper", "Đã hoàn thành", "Đã hủy"]

const BADGE = {
  "Chờ xác nhận": "yellow",
  "Đã nhận món": "blue",
  "Đang chuẩn bị": "blue",
  "Đã giao cho shipper": "green",
  "Đã hoàn thành": "green",
  "Đã hủy": "red",
}

const SEED_ORDERS = [
  { id: "#4P0001", date: "29/03/2026", customer: "Nguyễn Văn A", phone: "0901 234 567", items: "Pizza 4 loại phô mai, Tiramisu", total: "391,000₫", status: "Chờ xác nhận", address: "12 Đội Cấn, Ba Đình" },
  { id: "#4P0002", date: "29/03/2026", customer: "Trần Thị B", phone: "0912 345 678", items: "Bò Wagyu, Cocktail Negroni", total: "640,000₫", status: "Đang chuẩn bị", address: "45 Hàng Bông, Hoàn Kiếm" },
  { id: "#4P0003", date: "28/03/2026", customer: "Lê Minh C", phone: "0923 456 789", items: "Cá hồi áp chảo, Yuzu Lemonade", total: "325,000₫", status: "Đã hoàn thành", address: "88 Tây Hồ, Tây Hồ" },
]

function loadOrders() {
  try {
    const staff = JSON.parse(localStorage.getItem("hs_staff_orders") || "null")
    if (staff?.length) return staff
    const real = JSON.parse(localStorage.getItem("hs_orders") || "[]")
    const merged = [...real]
    SEED_ORDERS.forEach(seed => {
      if (!merged.find(item => item.id === seed.id)) merged.push(seed)
    })
    return merged
  } catch {
    return SEED_ORDERS
  }
}

function saveOrders(orders) {
  localStorage.setItem("hs_staff_orders", JSON.stringify(orders))
  localStorage.setItem("hs_orders", JSON.stringify(orders))
}

export default function StaffOrderManager() {
  const [orders, setOrders] = useState(loadOrders)
  const [filterStatus, setFilterStatus] = useState("Tất cả")
  const [search, setSearch] = useState("")

  function updateStatus(id, newStatus) {
    const updated = orders.map(order => (order.id === id ? { ...order, status: newStatus } : order))
    setOrders(updated)
    saveOrders(updated)
  }

  const displayed = orders.filter(order => {
    const matchStatus = filterStatus === "Tất cả" || order.status === filterStatus
    const matchSearch = !search || order.id.includes(search) || order.customer?.toLowerCase().includes(search.toLowerCase()) || order.phone?.includes(search)
    return matchStatus && matchSearch
  })

  const counts = {
    total: orders.length,
    pending: orders.filter(order => order.status === "Chờ xác nhận").length,
    cooking: orders.filter(order => order.status === "Đang chuẩn bị" || order.status === "Đã nhận món").length,
    done: orders.filter(order => order.status === "Đã hoàn thành").length,
  }

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div>
          <h2 className="sm-title">Quản lý Đơn hàng</h2>
          <p className="sm-sub">Đơn khách đặt từ web sẽ đẩy đầy đủ sang đây để nhân viên xử lý</p>
        </div>
      </div>

      <div className="sm-stats">
        {[["📦", counts.total, "Tổng đơn"], ["⏳", counts.pending, "Chờ xác nhận"], ["👨‍🍳", counts.cooking, "Đang làm"], ["✅", counts.done, "Hoàn thành"]].map(([icon, value, label]) => (
          <div key={label} className="sm-stat-card">
            <span className="sm-stat-icon">{icon}</span>
            <div><p className="sm-stat-val">{value}</p><p className="sm-stat-label">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="sm-filter-row">
        <input className="sm-search" placeholder="🔍  Tìm mã đơn, tên khách..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="sm-filter-tabs">
          {["Tất cả", ...ORDER_STATUSES].map(status => (
            <button key={status} className={`sm-filter-tab ${filterStatus === status ? "active" : ""}`} onClick={() => setFilterStatus(status)}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="sm-table-wrap">
        <table className="sm-table">
          <thead>
            <tr><th>Mã đơn</th><th>Ngày</th><th>Khách hàng</th><th>Địa chỉ</th><th>Món</th><th>Tổng</th><th>Trạng thái</th><th>Cập nhật</th></tr>
          </thead>
          <tbody>
            {displayed.map(order => (
              <tr key={order.id}>
                <td style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600 }}>{order.id}</td>
                <td style={{ whiteSpace: "nowrap" }}>{order.date}</td>
                <td>
                  <p style={{ fontWeight: 600, color: "#0f2044" }}>{order.customer || "Khách online"}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>{order.phone || "—"}</p>
                </td>
                <td style={{ fontSize: 13, color: "#6b7280", maxWidth: 180 }}>{order.address || "—"}</td>
                <td style={{ fontSize: 13, maxWidth: 180, color: "#374151" }}>
                  {order.items}
                  {order.notes ? <p style={{ marginTop: 6, color: "#9ca3af" }}>📝 {order.notes}</p> : null}
                </td>
                <td style={{ fontWeight: 700, color: "#0f2044", whiteSpace: "nowrap" }}>{order.total}</td>
                <td><span className={`sm-badge ${BADGE[order.status] || "gray"}`}>{order.status}</span></td>
                <td>
                  <select className="sm-status-select" value={order.status} onChange={e => updateStatus(order.id, e.target.value)}>
                    {ORDER_STATUSES.map(status => <option key={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {displayed.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Không có đơn hàng nào</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
