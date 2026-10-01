import { useEffect, useMemo, useState } from "react"
import { getApiErrorMessage } from "../services/apiClient"
import { normalizeUserList } from "../services/responseAdapters"
import { updateStaffUserStatusApi } from "../services/staffApi"

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
]

function normalizeDirectoryUser(user) {
  const normalized = normalizeUserList([user])[0]
  return {
    ...normalized,
    key: `${normalized.userRole || "USER"}-${normalized.id ?? normalized.username}`,
    status: String(normalized.userIsActive || normalized.status || "").toUpperCase(),
  }
}

function matchesSearch(user, keyword) {
  const normalizedKeyword = String(keyword || "").trim().toLowerCase()
  if (!normalizedKeyword) return true

  return [
    user.id,
    user.name,
    user.username,
    user.phone,
    user.address,
    user.email,
    user.userRole,
    user.status,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedKeyword)
}

function getBadgeTone(status) {
  const normalized = String(status || "").trim().toUpperCase()
  if (normalized === "ACTIVE") return "green"
  if (normalized === "INACTIVE") return "red"
  return "gray"
}

export default function AdminUserManager({ title, subtitle, loadUsers }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    let active = true

    async function loadDirectory() {
      try {
        setLoading(true)
        const response = await loadUsers()
        if (!active) return
        setUsers(normalizeUserList(response).map(normalizeDirectoryUser))
        setError("")
      } catch (apiError) {
        if (!active) return
        setUsers([])
        setError(getApiErrorMessage(apiError, "Không thể tải danh sách người dùng"))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDirectory()
    return () => {
      active = false
    }
  }, [loadUsers])

  async function handleToggleStatus(user) {
    const nextStatus = user.status === "INACTIVE" ? "ACTIVE" : "INACTIVE"
    const confirmed = window.confirm(
      nextStatus === "INACTIVE"
        ? `Bạn có chắc muốn khóa tài khoản ${user.name}?`
        : `Bạn có chắc muốn mở khóa tài khoản ${user.name}?`
    )

    if (!confirmed) return

    try {
      await updateStaffUserStatusApi(user.id, nextStatus)
      setUsers(current =>
        current.map(item => (item.key === user.key ? { ...item, status: nextStatus, userIsActive: nextStatus } : item))
      )
      setError("")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể cập nhật trạng thái tài khoản"))
    }
  }

  const filteredUsers = useMemo(
    () =>
      users.filter(user => {
        const matchesStatus = statusFilter === "all" || user.status === statusFilter
        return matchesStatus && matchesSearch(user, search)
      }),
    [search, statusFilter, users]
  )

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter(user => user.status === "ACTIVE").length,
      inactive: users.filter(user => user.status === "INACTIVE").length,
    }),
    [users]
  )

  return (
    <div className="sm-page">
      <div className="sm-header sm-header-stack">
        <div>
          <h2 className="sm-title">{title}</h2>
          {subtitle ? <p className="sm-sub">{subtitle}</p> : null}
        </div>
      </div>

      <div className="sm-stats sm-account-stats">
        {[[stats.total, "Tổng tài khoản"], [stats.active, "Đang hoạt động"], [stats.inactive, "Không hoạt động"]].map(([value, label]) => (
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
          placeholder="Tìm theo tên, username, số điện thoại, email, địa chỉ"
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
              <th>Họ tên</th>
              <th>Username</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Đang tải danh sách...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  Không có tài khoản phù hợp với bộ lọc hiện tại
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.key}>
                  <td>{user.id ?? "-"}</td>
                  <td>{user.name}</td>
                  <td>{user.username || "-"}</td>
                  <td>{user.phone || "-"}</td>
                  <td style={{ maxWidth: 220 }}>{user.address || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>
                    <span className={`sm-badge ${getBadgeTone(user.status)}`}>{user.status || "-"}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`sm-btn sm-btn-sm ${user.status === "INACTIVE" ? "outline" : "danger"}`}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.status === "INACTIVE" ? "Mở khóa" : "Khóa"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
