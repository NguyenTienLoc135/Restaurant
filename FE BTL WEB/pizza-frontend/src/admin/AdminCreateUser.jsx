import { useState } from "react"
import { getApiErrorMessage } from "../services/apiClient"
import { createAdminUserApi } from "./adminApi"

const EMPTY_FORM = {
  fullname: "",
  username: "",
  password: "",
  phone: "",
  address: "",
  email: "",
  userGender: "MALE",
  userRole: "STAFF",
}

export default function AdminCreateUser() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    setError("")
    setSuccess("")
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const responseMessage = await createAdminUserApi(form)
      setForm(EMPTY_FORM)
      setSuccess(typeof responseMessage === "string" && responseMessage.trim() ? responseMessage : "Tạo tài khoản thành công")
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Không thể tạo tài khoản"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sm-page">
      <div className="sm-header sm-header-stack">
        <div>
          <h2 className="sm-title">Thêm người dùng</h2>
          <p className="sm-sub">Màn hình này đang tạo tài khoản nội bộ với hai vai trò: staff và driver.</p>
        </div>
      </div>

      <div className="adm-form-card">
        <form className="adm-form" onSubmit={handleSubmit}>
          <div className="sm-field-row">
            <div className="sm-field">
              <label>Họ và tên</label>
              <input value={form.fullname} onChange={event => setField("fullname", event.target.value)} required />
            </div>
            <div className="sm-field">
              <label>Username</label>
              <input value={form.username} onChange={event => setField("username", event.target.value)} required />
            </div>
          </div>

          <div className="sm-field-row">
            <div className="sm-field">
              <label>Mật khẩu</label>
              <input type="password" value={form.password} onChange={event => setField("password", event.target.value)} required />
            </div>
            <div className="sm-field">
              <label>Số điện thoại</label>
              <input value={form.phone} onChange={event => setField("phone", event.target.value)} required />
            </div>
          </div>

          <div className="sm-field-row">
            <div className="sm-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={event => setField("email", event.target.value)} />
            </div>
            <div className="sm-field">
              <label>Vai trò</label>
              <select value={form.userRole} onChange={event => setField("userRole", event.target.value)}>
                <option value="STAFF">STAFF</option>
                <option value="DRIVER">DRIVER</option>
              </select>
            </div>
          </div>

          <div className="sm-field-row">
            <div className="sm-field">
              <label>Giới tính</label>
              <select value={form.userGender} onChange={event => setField("userGender", event.target.value)}>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>
            <div className="sm-field">
              <label>Địa chỉ</label>
              <input value={form.address} onChange={event => setField("address", event.target.value)} required />
            </div>
          </div>

          {success ? <p className="adm-message success">{success}</p> : null}
          {error ? <p className="adm-message error">{error}</p> : null}

          <div className="adm-form-actions">
            <button type="submit" className="sm-btn" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
