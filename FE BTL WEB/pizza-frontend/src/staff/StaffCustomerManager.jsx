import { useEffect, useMemo, useState } from "react"
import { formatDateTime, getTimestamp } from "../data/staffData"
import { getApiErrorMessage } from "../services/apiClient"
import { normalizeBookingList, normalizeOrderList, normalizeUserList } from "../services/responseAdapters"
import { getStaffBookingsApi, getStaffOrdersApi, getStaffUsersApi, updateStaffUserStatusApi } from "../services/staffApi"

function getCustomerKey(record) {
  if (record.userId) return `user-${record.userId}`
  if (record.email) return `email-${record.email.toLowerCase()}`
  if (record.phone) return `phone-${record.phone}`
  return `guest-${record.name}-${record.createdAt}`
}

function buildCustomers(users, orders, bookings) {
  const map = new Map()

  function findLinkedUser(base) {
    if (base.userId) {
      const linkedById = users.find(user => String(user.id) === String(base.userId))
      if (linkedById) return linkedById
    }

    const email = String(base.email || base.customerEmail || "").trim().toLowerCase()
    if (email) {
      const linkedByEmail = users.find(user => String(user.email || "").trim().toLowerCase() === email)
      if (linkedByEmail) return linkedByEmail
    }

    const phone = String(base.phone || "").trim()
    if (phone) {
      const linkedByPhone = users.find(user => String(user.phone || "").trim() === phone)
      if (linkedByPhone) return linkedByPhone
    }

    const usernameOrName = String(base.username || base.name || base.customer || "").trim().toLowerCase()
    if (usernameOrName) {
      const linkedByUsername = users.find(user => {
        const username = String(user.username || "").trim().toLowerCase()
        const fullname = String(user.name || user.fullname || "").trim().toLowerCase()
        return username === usernameOrName || fullname === usernameOrName
      })
      if (linkedByUsername) return linkedByUsername
    }

    return null
  }

  function ensureCustomer(base) {
    const key = getCustomerKey(base)
    if (!map.has(key)) {
      const linkedUser = findLinkedUser(base)
      const accountStatus = linkedUser?.isActive || null

      map.set(key, {
        key,
        userId: linkedUser?.id ?? base.userId ?? null,
        name: linkedUser?.name || base.name || base.customer || "Khách",
        email: linkedUser?.email || base.email || base.customerEmail || "",
        phone: linkedUser?.phone || base.phone || "",
        joined: linkedUser?.joined || "",
        hasAccount: !!linkedUser,
        accountStatus,
        isBanned: accountStatus === "INACTIVE",
        orderCount: 0,
        bookingCount: 0,
        lastActivityAt: null,
        firstActivityAt: null,
        history: [],
      })
    }
    return map.get(key)
  }

  orders.forEach(order => {
    const customer = ensureCustomer({
      userId: order.userId,
      username: order.username,
      name: order.customer,
      email: order.customerEmail,
      phone: order.phone,
      createdAt: order.createdAt,
    })

    customer.orderCount += 1
    customer.history.push({
      id: order.id,
      type: "Đặt món",
      createdAt: order.createdAt,
      status: order.status,
      detail: order.items,
    })
  })

  bookings.forEach(booking => {
    const customer = ensureCustomer({
      userId: booking.userId,
      username: booking.username,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      createdAt: booking.createdAt,
    })

    customer.bookingCount += 1
    customer.history.push({
      id: booking.id,
      type: "Đặt bàn",
      createdAt: booking.createdAt,
      status: booking.status,
      detail: `${booking.date} ${booking.time} - ${booking.guests} người`,
    })
  })

  return Array.from(map.values())
    .map(customer => {
      const sortedHistory = [...customer.history].sort(
        (a, b) => (getTimestamp(b.createdAt) || 0) - (getTimestamp(a.createdAt) || 0)
      )

      return {
        ...customer,
        history: sortedHistory,
        lastActivityAt: sortedHistory[0]?.createdAt || null,
        firstActivityAt: sortedHistory[sortedHistory.length - 1]?.createdAt || null,
      }
    })
    .sort((a, b) => (getTimestamp(b.lastActivityAt) || 0) - (getTimestamp(a.lastActivityAt) || 0))
}

export default function StaffCustomerManager() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [fromDateTime, setFromDateTime] = useState("")
  const [toDateTime, setToDateTime] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadCustomers() {
      try {
        const [users, orders, bookings] = await Promise.all([
          getStaffUsersApi(),
          getStaffOrdersApi(),
          getStaffBookingsApi(),
        ])
        const customerList = buildCustomers(
          normalizeUserList(users),
          normalizeOrderList(orders),
          normalizeBookingList(bookings)
        )
        setCustomers(customerList)
        setError("")
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, "Không thể tải dữ liệu khách hàng"))
      }
    }

    loadCustomers()
  }, [])

  async function handleToggleBan(customer) {
    if (!customer.userId) return

    const nextStatus = customer.isBanned ? "ACTIVE" : "INACTIVE"
    const confirmed = window.confirm(
      customer.isBanned
        ? `Bạn có chắc muốn bỏ ban user ${customer.name}? Tài khoản sẽ đăng nhập lại được.`
        : `Bạn có chắc muốn ban user ${customer.name}? Tài khoản sẽ bị khóa và không đăng nhập lại được.`
    )
    if (!confirmed) return

    try {
      await updateStaffUserStatusApi(customer.userId, nextStatus)
      setCustomers(current =>
        current.map(item =>
          item.key === customer.key
            ? {
                ...item,
                hasAccount: true,
                accountStatus: nextStatus,
                isBanned: nextStatus === "INACTIVE",
              }
            : item
        )
      )
      setSelectedCustomer(current =>
        current?.key === customer.key
          ? {
              ...current,
              hasAccount: true,
              accountStatus: nextStatus,
              isBanned: nextStatus === "INACTIVE",
            }
          : current
      )
      setError("")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, customer.isBanned ? "Không thể bỏ ban user" : "Không thể khóa user"))
    }
  }

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const fromTs = fromDateTime ? new Date(fromDateTime).getTime() : null
    const toTs = toDateTime ? new Date(toDateTime).getTime() : null

    return customers.filter(customer => {
      const matchesSearch =
        !normalizedSearch ||
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.email.toLowerCase().includes(normalizedSearch) ||
        customer.phone.includes(normalizedSearch)

      const matchingHistory = customer.history.filter(item => {
        const ts = getTimestamp(item.createdAt)
        const matchesType = typeFilter === "all" || item.type === typeFilter
        const matchesFrom = fromTs == null || (ts != null && ts >= fromTs)
        const matchesTo = toTs == null || (ts != null && ts <= toTs)
        return matchesType && matchesFrom && matchesTo
      })

      return matchesSearch && matchingHistory.length > 0
    })
  }, [customers, fromDateTime, search, toDateTime, typeFilter])

  const stats = {
    total: customers.length,
    active: customers.filter(customer => customer.hasAccount && !customer.isBanned).length,
    orders: customers.filter(customer => customer.orderCount > 0).length,
    bookings: customers.filter(customer => customer.bookingCount > 0).length,
  }

  return (
    <div className="sm-page">
      <div className="sm-header sm-header-stack">
        <div>
          <h2 className="sm-title">Quản lý khách hàng</h2>
          <p className="sm-sub">
            Staff xem khách đặt món và đặt bàn ở cả thời gian cũ lẫn hiện tại, lọc theo ngày giờ và khóa hoặc mở lại user có tài khoản.
          </p>
        </div>
      </div>

      <div className="sm-stats">
        {[["👥", stats.total, "Tổng khách"], ["🔐", stats.active, "Có tài khoản"], ["📦", stats.orders, "Khách đặt món"], ["🍽️", stats.bookings, "Khách đặt bàn"]].map(([icon, value, label]) => (
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
          placeholder="Tìm tên, email, số điện thoại"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
        <select className="sm-status-select" value={typeFilter} onChange={event => setTypeFilter(event.target.value)}>
          <option value="all">Tất cả giao dịch</option>
          <option value="Đặt món">Chỉ đặt món</option>
          <option value="Đặt bàn">Chỉ đặt bàn</option>
        </select>
        <input className="sm-status-select" type="datetime-local" value={fromDateTime} onChange={event => setFromDateTime(event.target.value)} />
        <input className="sm-status-select" type="datetime-local" value={toDateTime} onChange={event => setToDateTime(event.target.value)} />
        <button
          className="sm-btn outline"
          onClick={() => {
            setTypeFilter("all")
            setFromDateTime("")
            setToDateTime("")
            setSearch("")
          }}
        >
          Bỏ lọc
        </button>
      </div>
      {error && <p className="co-err">{error}</p>}

      <div className="sm-table-wrap">
        <table className="sm-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Thông tin liên hệ</th>
              <th>Đặt món</th>
              <th>Đặt bàn</th>
              <th>Lần đầu</th>
              <th>Gần nhất</th>
              <th>Tài khoản</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.key}>
                <td style={{ fontWeight: 700, color: "#0f2044" }}>{customer.name}</td>
                <td>
                  <p>{customer.email || "-"}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>{customer.phone || "-"}</p>
                </td>
                <td>{customer.orderCount}</td>
                <td>{customer.bookingCount}</td>
                <td>{formatDateTime(customer.firstActivityAt)}</td>
                <td>{formatDateTime(customer.lastActivityAt)}</td>
                <td>
                  <span className={`sm-badge ${customer.hasAccount ? (customer.isBanned ? "yellow" : "green") : "gray"}`}>
                    {customer.hasAccount
                      ? customer.isBanned
                        ? "BANDED"
                        : "ACTIVE"
                      : "Khách vãng lai"}
                  </span>
                </td>
                <td>
                  <div className="sm-action-stack">
                    <button className="sm-btn sm-btn-sm outline" onClick={() => setSelectedCustomer(customer)}>
                      Lịch sử
                    </button>
                    {customer.hasAccount ? (
                      <button
                        className={`sm-btn sm-btn-sm ${customer.isBanned ? "outline" : "danger"}`}
                        onClick={() => handleToggleBan(customer)}
                      >
                        {customer.isBanned ? "Bỏ ban" : "Ban user"}
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>Không có tài khoản để ban</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Không có khách hàng phù hợp bộ lọc ngày giờ hiện tại
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <div className="sm-modal-back" onClick={event => event.target === event.currentTarget && setSelectedCustomer(null)}>
          <div className="sm-modal" style={{ maxWidth: 720 }}>
            <div className="sm-modal-header">
              <h3 className="sm-modal-title">Lịch sử khách hàng</h3>
              <button className="sm-modal-close" onClick={() => setSelectedCustomer(null)}>
                x
              </button>
            </div>
            <div className="sm-modal-body">
              <div>
                <strong>{selectedCustomer.name}</strong>
                <p style={{ marginTop: 6, color: "#6b7280" }}>
                  {selectedCustomer.email || "-"} | {selectedCustomer.phone || "-"}
                </p>
              </div>
              <div className="sm-customer-history">
                {selectedCustomer.history.map(item => (
                  <div key={`${item.type}-${item.id}`} className="sm-history-item">
                    <div>
                      <strong>{item.type}</strong>
                      <p style={{ marginTop: 4, color: "#6b7280" }}>
                        {item.id} | {item.detail}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: 600, color: "#0f2044" }}>{formatDateTime(item.createdAt)}</p>
                      <span className="sm-badge blue">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
