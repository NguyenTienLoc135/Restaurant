import { useEffect, useMemo, useRef, useState } from "react"
import { formatDateTime, getTimestamp } from "../data/staffData"
import { getApiErrorMessage } from "../services/apiClient"
import { normalizeBookingList, normalizeOrderList, normalizeUserList } from "../services/responseAdapters"
import { getStaffBookingsApi, getStaffOrdersApi, getStaffUsersApi, updateStaffUserStatusApi } from "../services/staffApi"

const HISTORY_VIEW_OPTIONS = [
  { value: "orders", label: "Lịch sử đặt món" },
  { value: "bookings", label: "Lịch sử đặt bàn" },
]

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
]

const EMPTY_HISTORY_FILTERS = {
  fromDateTime: "",
  toDateTime: "",
}

const EMPTY_HISTORY_STATE = {
  orders: [],
  bookings: [],
  loading: false,
  loaded: false,
  error: "",
}

function normalizeLookupValue(value) {
  return String(value || "").trim().toLowerCase()
}

function matchesCustomerBooking(booking, customer) {
  const bookingUsername = normalizeLookupValue(booking?.username || booking?.name)
  const customerUsername = normalizeLookupValue(customer?.username)
  const customerName = normalizeLookupValue(customer?.name || customer?.fullname)

  if (bookingUsername && customerUsername) {
    return bookingUsername === customerUsername
  }

  return !!bookingUsername && bookingUsername === customerName
}

function isCustomerLikeUser(user) {
  const role = String(user?.userRole || user?.role || "").trim().toUpperCase()
  return role === "CUSTOMER" || role === "USER"
}

function getCustomerKey(customer) {
  if (customer?.id != null) return `user-${customer.id}`
  if (customer?.username) return `username-${customer.username}`
  return `customer-${customer?.name || "unknown"}`
}

function normalizeCustomer(user) {
  const userRole = String(user?.userRole || user?.role || "").trim().toUpperCase()
  const status = String(user?.userIsActive || user?.isActive || user?.status || "").trim().toUpperCase()

  return {
    ...user,
    key: getCustomerKey(user),
    id: user?.id ?? null,
    name: user?.fullname || user?.name || user?.username || "Khách hàng",
    fullName: user?.fullname || user?.name || user?.username || "Khách hàng",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    userRole: userRole || "",
    status: status || "",
  }
}

function sortCustomers(users) {
  return [...users].sort((left, right) => {
    const leftName = String(left.name || "").toLowerCase()
    const rightName = String(right.name || "").toLowerCase()
    if (leftName !== rightName) {
      return leftName.localeCompare(rightName)
    }
    return Number(left.id || 0) - Number(right.id || 0)
  })
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

function getHoverCardPosition(target) {
  const rect = target.getBoundingClientRect()
  const cardWidth = 340
  const cardHeight = 420
  const left = Math.min(Math.max(16, rect.left), Math.max(16, window.innerWidth - cardWidth - 16))
  const openAbove = rect.bottom + cardHeight > window.innerHeight - 16 && rect.top > cardHeight
  const top = openAbove
    ? Math.max(16, rect.top - cardHeight - 12)
    : Math.min(window.innerHeight - cardHeight - 16, rect.bottom + 12)

  return {
    top,
    left,
    placement: openAbove ? "top" : "bottom",
  }
}

function normalizeDateRange(fromDateTime, toDateTime) {
  let fromTs = fromDateTime ? new Date(fromDateTime).getTime() : null
  let toTs = toDateTime ? new Date(toDateTime).getTime() : null

  if (Number.isNaN(fromTs)) fromTs = null
  if (Number.isNaN(toTs)) toTs = null

  if (fromTs != null && toTs != null && fromTs > toTs) {
    return { fromTs: toTs, toTs: fromTs }
  }

  return { fromTs, toTs }
}

function getOrderHistoryTimestamp(order) {
  return getTimestamp(order?.createdAt || order?.orderTime)
}

function getBookingHistoryTimestamp(booking) {
  return getTimestamp(booking?.bookingDateTime || booking?.bookingTime || booking?.createdAt)
}

function filterOrdersByRange(items, filters) {
  const { fromTs, toTs } = normalizeDateRange(filters.fromDateTime, filters.toDateTime)
  if (fromTs == null && toTs == null) return items

  return items.filter(item => {
    const timestamp = getOrderHistoryTimestamp(item)
    if (timestamp == null) return false
    const matchFrom = fromTs == null || timestamp >= fromTs
    const matchTo = toTs == null || timestamp <= toTs
    return matchFrom && matchTo
  })
}

function filterBookingsByRange(items, filters) {
  const { fromTs, toTs } = normalizeDateRange(filters.fromDateTime, filters.toDateTime)
  if (fromTs == null && toTs == null) return items

  return items.filter(item => {
    const timestamp = getBookingHistoryTimestamp(item)
    if (timestamp == null) return false
    const matchFrom = fromTs == null || timestamp >= fromTs
    const matchTo = toTs == null || timestamp <= toTs
    return matchFrom && matchTo
  })
}

function sortByLatest(items, getTime) {
  return [...items].sort((left, right) => (getTime(right) || 0) - (getTime(left) || 0))
}

function getStatusBadgeTone(status) {
  const value = normalizeLookupValue(status)
  if (!value) return "gray"
  if (value.includes("inactive")) return "yellow"
  if (value.includes("active")) return "green"
  if (value.includes("cancel") || value.includes("huy")) return "red"
  if (value.includes("pending") || value.includes("cho")) return "yellow"
  if (value.includes("complete") || value.includes("hoan thanh") || value.includes("accepted")) return "green"
  return "blue"
}

function formatBookingMoment(item) {
  const value = item?.bookingDateTime || item?.bookingTime || ""
  return value ? formatDateTime(value) : "-"
}

function CustomerHoverCard({ customer, anchor, onMouseEnter, onMouseLeave, onViewBookings, onViewOrders }) {
  if (!customer || !anchor) return null

  return (
    <div
      className={`sm-customer-hover-card ${anchor.placement === "top" ? "top" : ""}`}
      style={{ top: anchor.top, left: anchor.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="sm-customer-hover-head">
        <div>
          <p className="sm-customer-hover-kicker">Khách hàng</p>
          <h4 className="sm-customer-hover-title">{customer.name}</h4>
        </div>
        <div className="sm-customer-hover-badges">
          <span className={`sm-badge ${getStatusBadgeTone(customer.userRole)}`}>{customer.userRole}</span>
          <span className={`sm-badge ${getStatusBadgeTone(customer.status)}`}>{customer.status}</span>
        </div>
      </div>

      <div className="sm-customer-hover-grid">
        <div>
          <span>ID</span>
          <strong>{customer.id ?? "-"}</strong>
        </div>
        <div>
          <span>Số điện thoại</span>
          <strong>{customer.phone || "-"}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{customer.email || "-"}</strong>
        </div>
        <div>
          <span>Địa chỉ</span>
          <strong>{customer.address || "-"}</strong>
        </div>
        <div>
          <span>Vai trò</span>
          <strong>{customer.userRole}</strong>
        </div>
      </div>

      <div className="sm-customer-hover-options">
        <span>Tùy chọn</span>
        <div className="sm-customer-hover-actions">
          <button type="button" className="sm-btn sm-btn-sm outline" onClick={onViewBookings}>
            Xem lịch sử đặt bàn
          </button>
          <button type="button" className="sm-btn sm-btn-sm outline" onClick={onViewOrders}>
            Xem lịch sử đặt món
          </button>
        </div>
      </div>
    </div>
  )
}

function CustomerHistoryModal({
  customer,
  historyState,
  view,
  filters,
  onClose,
  onResetFilters,
  onUpdateFilters,
  onViewChange,
  onRefresh,
}) {
  const filteredOrders = useMemo(
    () => sortByLatest(filterOrdersByRange(historyState.orders, filters), getOrderHistoryTimestamp),
    [filters, historyState.orders]
  )
  const filteredBookings = useMemo(
    () => sortByLatest(filterBookingsByRange(historyState.bookings, filters), getBookingHistoryTimestamp),
    [filters, historyState.bookings]
  )

  const activeItems = view === "orders" ? filteredOrders : filteredBookings

  return (
    <div className="sm-modal-back" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="sm-modal sm-history-modal">
        <div className="sm-modal-header">
          <div>
            <h3 className="sm-modal-title">Lịch sử khách hàng</h3>
            <p className="sm-history-modal-sub">{customer.name}</p>
          </div>
          <button className="sm-modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <div className="sm-modal-body">
          <div className="sm-history-customer-panel">
            <div>
              <div className="sm-history-customer-badges">
                <span className={`sm-badge ${getStatusBadgeTone(customer.userRole)}`}>{customer.userRole}</span>
                <span className={`sm-badge ${getStatusBadgeTone(customer.status)}`}>{customer.status}</span>
              </div>
              <h4 className="sm-history-customer-name">{customer.name}</h4>
              <p className="sm-history-customer-line">
                ID {customer.id ?? "-"} · {customer.phone || "-"} · {customer.email || "-"}
              </p>
              <p className="sm-history-customer-line">{customer.address || "Chưa có địa chỉ"}</p>
            </div>

            <div className="sm-history-summary-grid">
              <div className="sm-history-summary-card">
                <span>Đơn hàng</span>
                <strong>{historyState.orders.length}</strong>
              </div>
              <div className="sm-history-summary-card">
                <span>Đặt bàn</span>
                <strong>{historyState.bookings.length}</strong>
              </div>
              <div className="sm-history-summary-card">
                <span>Dữ liệu</span>
                <strong>{historyState.loaded ? "Đã tải" : historyState.loading ? "Đang tải" : "Chưa tải"}</strong>
              </div>
            </div>
          </div>

          <div className="sm-history-tabs">
            {HISTORY_VIEW_OPTIONS.map(option => {
              const count = option.value === "orders" ? historyState.orders.length : historyState.bookings.length
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`sm-history-tab ${view === option.value ? "active" : ""}`}
                  onClick={() => onViewChange(option.value)}
                >
                  {option.label}
                  <span>{count}</span>
                </button>
              )
            })}
          </div>

          <div className="sm-history-toolbar">
            <div className="sm-history-filter-field">
              <label>Từ</label>
              <input
                className="sm-status-select"
                type="datetime-local"
                value={filters.fromDateTime}
                onChange={event => onUpdateFilters("fromDateTime", event.target.value)}
              />
            </div>
            <div className="sm-history-filter-field">
              <label>Đến</label>
              <input
                className="sm-status-select"
                type="datetime-local"
                value={filters.toDateTime}
                onChange={event => onUpdateFilters("toDateTime", event.target.value)}
              />
            </div>
            <button type="button" className="sm-btn sm-btn-sm outline" onClick={onResetFilters}>
              Đặt lại bộ lọc
            </button>
            <button type="button" className="sm-btn sm-btn-sm outline" onClick={onRefresh}>
              Tải lại dữ liệu
            </button>
          </div>

          {historyState.error ? <p className="co-err">{historyState.error}</p> : null}

          <div className="sm-history-list">
            {historyState.loading && !historyState.loaded ? (
              <div className="sm-history-empty">
                <strong>Đang tải lịch sử...</strong>
                <p>Dữ liệu booking/order sẽ chỉ được gọi khi bạn mở modal này.</p>
              </div>
            ) : activeItems.length === 0 ? (
              <div className="sm-history-empty">
                <strong>Không có dữ liệu phù hợp.</strong>
                <p>Hãy đổi tab hoặc điều chỉnh khoảng thời gian để xem thêm lịch sử.</p>
              </div>
            ) : (
              activeItems.map(item => (
                <article key={`${view}-${item.id}`} className="sm-history-card">
                  <div className="sm-history-card-header">
                    <div>
                      <p className="sm-history-card-kicker">{view === "orders" ? "Đơn hàng" : "Đặt bàn"}</p>
                      <h4 className="sm-history-card-title">{item.id || "-"}</h4>
                    </div>
                    <span className={`sm-badge ${getStatusBadgeTone(item.status)}`}>{item.status || "-"}</span>
                  </div>

                  {view === "orders" ? (
                    <div className="sm-history-card-grid">
                      <div>
                        <span>Thời gian đặt</span>
                        <strong>{formatDateTime(item.createdAt)}</strong>
                      </div>
                      <div>
                        <span>Tổng tiền</span>
                        <strong>{item.total || "-"}</strong>
                      </div>
                      <div className="wide">
                        <span>Địa chỉ giao</span>
                        <strong>{item.address || "-"}</strong>
                      </div>
                      {item.paymentMethod ? (
                        <div>
                          <span>Thanh toán</span>
                          <strong>{item.paymentMethod}</strong>
                        </div>
                      ) : null}
                      {item.notes ? (
                        <div className="wide">
                          <span>Ghi chú</span>
                          <strong>{item.notes}</strong>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="sm-history-card-grid">
                      <div>
                        <span>Thời gian tạo</span>
                        <strong>{formatDateTime(item.createdAt)}</strong>
                      </div>
                      <div>
                        <span>Ngày giờ đặt bàn</span>
                        <strong>{formatBookingMoment(item)}</strong>
                      </div>
                      <div>
                        <span>Số người</span>
                        <strong>{item.guests ? `${item.guests} người` : "-"}</strong>
                      </div>
                      {item.note ? (
                        <div className="wide">
                          <span>Ghi chú</span>
                          <strong>{item.note}</strong>
                        </div>
                      ) : null}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StaffCustomerManager() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [hoverCard, setHoverCard] = useState(null)
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [historyFilters, setHistoryFilters] = useState(EMPTY_HISTORY_FILTERS)
  const [historyCache, setHistoryCache] = useState({})
  const [statusFilter, setStatusFilter] = useState("all")
  const hoverCloseTimeoutRef = useRef(null)
  const historyCacheRef = useRef({})

  useEffect(() => {
    historyCacheRef.current = historyCache
  }, [historyCache])

  useEffect(() => {
    let active = true

    async function loadCustomers() {
      try {
        setLoading(true)
        const list = await getStaffUsersApi()
        if (!active) return

        const normalized = sortCustomers(
          normalizeUserList(list)
            .filter(isCustomerLikeUser)
            .map(normalizeCustomer)
        )

        setCustomers(normalized)
        setError("")
      } catch (apiError) {
        if (!active) return
        setCustomers([])
        setError(getApiErrorMessage(apiError, "Không thể tải danh sách khách hàng"))
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    loadCustomers()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (hoverCloseTimeoutRef.current) {
        window.clearTimeout(hoverCloseTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!hoverCard) return undefined

    function dismissHoverCard() {
      setHoverCard(null)
    }

    window.addEventListener("scroll", dismissHoverCard, true)
    window.addEventListener("resize", dismissHoverCard)

    return () => {
      window.removeEventListener("scroll", dismissHoverCard, true)
      window.removeEventListener("resize", dismissHoverCard)
    }
  }, [hoverCard])

  const selectedCustomer = useMemo(
    () => customers.find(customer => customer.key === selectedHistory?.customerKey) || null,
    [customers, selectedHistory]
  )

  const selectedHistoryState = useMemo(() => {
    if (!selectedCustomer) return EMPTY_HISTORY_STATE
    return historyCache[selectedCustomer.key] || EMPTY_HISTORY_STATE
  }, [historyCache, selectedCustomer])

  const hoveredCustomer = useMemo(
    () => customers.find(customer => customer.key === hoverCard?.customerKey) || null,
    [customers, hoverCard]
  )

  function cancelHoverClose() {
    if (hoverCloseTimeoutRef.current) {
      window.clearTimeout(hoverCloseTimeoutRef.current)
      hoverCloseTimeoutRef.current = null
    }
  }

  function scheduleHoverClose() {
    cancelHoverClose()
    hoverCloseTimeoutRef.current = window.setTimeout(() => setHoverCard(null), 120)
  }

  function openHoverCard(customer, target) {
    cancelHoverClose()
    setHoverCard({
      customerKey: customer.key,
      ...getHoverCardPosition(target),
    })
  }

  async function ensureCustomerHistory(customer, force = false) {
    if (!customer?.id) return

    const key = customer.key
    const cached = historyCacheRef.current[key]
    if (!force && (cached?.loading || cached?.loaded)) {
      return
    }

    setHistoryCache(current => ({
      ...current,
      [key]: {
        ...(current[key] || EMPTY_HISTORY_STATE),
        loading: true,
        error: "",
      },
    }))

    try {
      const [ordersResult, bookingsResult] = await Promise.allSettled([
        loadCollection(() => getStaffOrdersApi({ userId: customer.id })),
        loadCollection(() => getStaffBookingsApi()),
      ])

      const orders = ordersResult.status === "fulfilled"
        ? sortByLatest(normalizeOrderList(ordersResult.value), getOrderHistoryTimestamp)
        : []
      const bookings = bookingsResult.status === "fulfilled"
        ? sortByLatest(
            normalizeBookingList(bookingsResult.value).filter(booking => matchesCustomerBooking(booking, customer)),
            getBookingHistoryTimestamp
          )
        : []

      const failures = [ordersResult, bookingsResult].filter(result => result.status === "rejected")
      const nextError =
        failures.length === 0
          ? ""
          : failures.length === 2
            ? getApiErrorMessage(failures[0].reason, "Không thể tải lịch sử khách hàng")
            : "Đã tải được một phần lịch sử. Một nguồn dữ liệu backend chưa phản hồi."

      setHistoryCache(current => ({
        ...current,
        [key]: {
          orders,
          bookings,
          loading: false,
          loaded: true,
          error: nextError,
        },
      }))
    } catch (apiError) {
      setHistoryCache(current => ({
        ...current,
        [key]: {
          ...(current[key] || EMPTY_HISTORY_STATE),
          loading: false,
          loaded: false,
          error: getApiErrorMessage(apiError, "Không thể tải lịch sử khách hàng"),
        },
      }))
    }
  }

  function openHistory(customer, preferredView) {
    setSelectedHistory({
      customerKey: customer.key,
      view: preferredView,
    })
    setHistoryFilters(EMPTY_HISTORY_FILTERS)
    setHoverCard(null)
    ensureCustomerHistory(customer)
  }

  function closeHistory() {
    setSelectedHistory(null)
    setHistoryFilters(EMPTY_HISTORY_FILTERS)
  }

  async function handleToggleBan(customer) {
    const nextStatus = customer.status === "INACTIVE" ? "ACTIVE" : "INACTIVE"
    const confirmed = window.confirm(
      nextStatus === "INACTIVE"
        ? `Bạn có chắc muốn khóa tài khoản của ${customer.name}?`
        : `Bạn có chắc muốn mở khóa tài khoản của ${customer.name}?`
    )

    if (!confirmed) return

    try {
      await updateStaffUserStatusApi(customer.id, nextStatus)
      setCustomers(current =>
        current.map(item =>
          item.key === customer.key
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      )
      setError("")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể cập nhật trạng thái tài khoản"))
    }
  }

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = normalizeLookupValue(search)

    return customers.filter(customer => {
      const matchesStatus = statusFilter === "all" || customer.status === statusFilter
      const matchesKeyword =
        !normalizedSearch ||
        [
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          customer.address,
          customer.userRole,
          customer.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)

      return matchesStatus && matchesKeyword
    })
  }, [customers, search, statusFilter])

  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter(customer => customer.status === "ACTIVE").length,
      inactive: customers.filter(customer => customer.status === "INACTIVE").length,
    }),
    [customers]
  )

  return (
    <div className="sm-page">
      <div className="sm-header sm-header-stack">
        <div>
          <h2 className="sm-title">Quản lý khách hàng</h2>
        </div>
      </div>

      <div className="sm-stats sm-account-stats">
        {[[stats.total, "Tổng khách"], [stats.active, "Đang hoạt động"], [stats.inactive, "Không hoạt động"]].map(([value, label]) => (
          <div key={label} className="sm-stat-card">
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
          placeholder="Tìm theo ID, tên, số điện thoại, địa chỉ, email, vai trò"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
        <div className="sm-filter-tabs">
          {STATUS_FILTERS.map(option => (
            <button
              key={option.value}
              type="button"
              className={`sm-filter-tab ${statusFilter === option.value ? "active" : ""}`}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button className="sm-btn outline" onClick={() => {
          setSearch("")
          setStatusFilter("all")
        }}>
          Bỏ lọc
        </button>
      </div>

      {error ? <p className="co-err">{error}</p> : null}

      <div className="sm-table-wrap">
        <table className="sm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Đang tải danh sách khách hàng...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Không có khách hàng phù hợp với bộ lọc hiện tại
                </td>
              </tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.key}>
                  <td>{customer.id ?? "-"}</td>
                  <td>
                    <div className="sm-customer-cell">
                      <button
                        type="button"
                        className="sm-customer-trigger"
                        onMouseEnter={event => openHoverCard(customer, event.currentTarget)}
                        onMouseLeave={scheduleHoverClose}
                        onFocus={event => openHoverCard(customer, event.currentTarget)}
                        onBlur={scheduleHoverClose}
                      >
                        {customer.name}
                      </button>
                      <p className="sm-customer-id-line">{customer.username || customer.fullName || "-"}</p>
                    </div>
                  </td>
                  <td>{customer.phone || "-"}</td>
                  <td style={{ maxWidth: 220 }}>
                    <p className="sm-customer-address">{customer.address || "-"}</p>
                  </td>
                  <td>{customer.email || "-"}</td>
                  <td>
                    <span className={`sm-badge ${getStatusBadgeTone(customer.userRole)}`}>{customer.userRole}</span>
                  </td>
                  <td>
                    <span className={`sm-badge ${getStatusBadgeTone(customer.status)}`}>{customer.status}</span>
                  </td>
                  <td>
                    <div className="sm-action-stack">
                      <button
                        type="button"
                        className={`sm-btn sm-btn-sm ${customer.status === "INACTIVE" ? "outline" : "danger"}`}
                        onClick={() => handleToggleBan(customer)}
                      >
                        {customer.status === "INACTIVE" ? "UNBAN" : "BAN"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CustomerHoverCard
        customer={hoveredCustomer}
        anchor={hoverCard}
        onMouseEnter={cancelHoverClose}
        onMouseLeave={scheduleHoverClose}
        onViewBookings={() => hoveredCustomer && openHistory(hoveredCustomer, "bookings")}
        onViewOrders={() => hoveredCustomer && openHistory(hoveredCustomer, "orders")}
      />

      {selectedCustomer ? (
        <CustomerHistoryModal
          customer={selectedCustomer}
          historyState={selectedHistoryState}
          view={selectedHistory?.view || "orders"}
          filters={historyFilters}
          onClose={closeHistory}
          onResetFilters={() => setHistoryFilters(EMPTY_HISTORY_FILTERS)}
          onUpdateFilters={(field, value) =>
            setHistoryFilters(current => ({
              ...current,
              [field]: value,
            }))
          }
          onViewChange={nextView =>
            setSelectedHistory(current =>
              current
                ? {
                    ...current,
                    view: nextView,
                  }
                : current
            )
          }
          onRefresh={() => ensureCustomerHistory(selectedCustomer, true)}
        />
      ) : null}
    </div>
  )
}
