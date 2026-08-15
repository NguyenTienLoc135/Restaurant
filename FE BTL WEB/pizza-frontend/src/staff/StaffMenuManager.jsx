import { useMemo, useState } from "react"
import { useMenu } from "../context/MenuContext"
import { MENU_STATUS } from "../data/menuData"
import { isCloudinaryConfigured, uploadImageToCloudinary } from "../services/cloudinary"

const BLANK = {
  cat: "pizza",
  name: "",
  desc: "",
  price: "",
  img: "",
  badge: "",
  origin: "",
  ingredients: "",
  story: "",
  status: MENU_STATUS.available,
  imagePublicId: "",
}

export default function StaffMenuManager() {
  const { items, categories, createItem, updateItem, deleteItem, toggleItemStatus } = useMenu()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [filterCat, setFilterCat] = useState("all")
  const [confirmDel, setConfirmDel] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadNotice, setUploadNotice] = useState("")

  const cloudinaryReady = isCloudinaryConfigured()
  const displayed = useMemo(
    () => (filterCat === "all" ? items : items.filter(item => item.cat === filterCat)),
    [filterCat, items]
  )

  function openAdd() {
    setForm(BLANK)
    setUploadError("")
    setUploadNotice("")
    setModal("add")
  }

  function openEdit(item) {
    setForm({
      ...item,
      badge: item.badge || "",
      imagePublicId: item.imagePublicId || "",
    })
    setUploadError("")
    setUploadNotice("")
    setModal("edit")
  }

  function closeModal() {
    setModal(null)
    setUploading(false)
    setUploadError("")
    setUploadNotice("")
  }

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function saveItem() {
    if (!form.name.trim() || !form.price) return

    const payload = {
      ...form,
      badge: form.badge.trim() || null,
    }

    if (modal === "add") createItem(payload)
    else updateItem(form.id, payload)

    closeModal()
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError("")
    setUploadNotice("")

    try {
      const uploaded = await uploadImageToCloudinary(file)
      setForm(prev => ({
        ...prev,
        img: uploaded.url,
        imagePublicId: uploaded.publicId,
      }))

      if (uploaded.provider === "cloudinary") {
        setUploadNotice("Ảnh đã được tải lên Cloudinary thành công.")
      } else if (uploaded.warning) {
        setUploadNotice(uploaded.warning)
      } else {
        setUploadNotice("Chưa cấu hình Cloudinary. Ảnh đã được lưu tạm trong trình duyệt.")
      }
    } catch (error) {
      setUploadError(error.message || "Không thể tải ảnh lên")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const availableCount = items.filter(item => item.status === MENU_STATUS.available).length
  const outOfStockCount = items.filter(item => item.status === MENU_STATUS.outOfStock).length

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div>
          <h2 className="sm-title">Quản lý Menu</h2>
          <p className="sm-sub">Thêm, sửa, xóa món ăn và đồng bộ ngay sang web user</p>
        </div>
        <button className="sm-btn" onClick={openAdd}>+ Thêm món mới</button>
      </div>

      <div className="sm-stats">
        {[["🍕", items.length, "Tổng món"], ["✅", availableCount, "Có sẵn"], ["❌", outOfStockCount, "Hết món"], ["📂", categories.length, "Danh mục"]].map(([icon, value, label]) => (
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
        <div className="sm-filter-tabs">
          <button className={`sm-filter-tab ${filterCat === "all" ? "active" : ""}`} onClick={() => setFilterCat("all")}>
            Tất cả
          </button>
          {categories.map(category => (
            <button
              key={category.key}
              className={`sm-filter-tab ${filterCat === category.key ? "active" : ""}`}
              onClick={() => setFilterCat(category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="smm-grid">
        {displayed.map(item => (
          <div key={item.id} className={`smm-card ${item.status === MENU_STATUS.outOfStock ? "out" : ""}`}>
            <div className="smm-img">
              <img src={item.img || "https://via.placeholder.com/300x200?text=No+Image"} alt={item.name} />
              <span className={`smm-status-badge ${item.status === MENU_STATUS.available ? "green" : "red"}`}>
                {item.status}
              </span>
            </div>
            <div className="smm-body">
              <span className="smm-cat">{categories.find(category => category.key === item.cat)?.label || item.cat}</span>
              <h3 className="smm-name">{item.name}</h3>
              <p className="smm-price">{Number(item.price).toLocaleString("vi-VN")}₫</p>
              <p style={{ color: "#6b7280", lineHeight: 1.5, marginTop: 8 }}>{item.desc}</p>
            </div>
            <div className="smm-actions">
              <button className="sm-btn sm-btn-sm outline" onClick={() => openEdit(item)}>Sửa</button>
              <button
                className={`sm-btn sm-btn-sm ${item.status === MENU_STATUS.available ? "danger" : "outline"}`}
                onClick={() => toggleItemStatus(item.id)}
              >
                {item.status === MENU_STATUS.available ? "Hết món" : "Có sẵn"}
              </button>
              <button className="sm-btn sm-btn-sm danger" onClick={() => setConfirmDel(item)}>Xóa</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="sm-modal-back" onClick={event => event.target === event.currentTarget && closeModal()}>
          <div className="sm-modal">
            <div className="sm-modal-header">
              <h3 className="sm-modal-title">{modal === "add" ? "Thêm món mới" : "Chỉnh sửa món"}</h3>
              <button className="sm-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="sm-modal-body">
              <div className="sm-field-row">
                <div className="sm-field">
                  <label>Tên món *</label>
                  <input value={form.name} onChange={event => setField("name", event.target.value)} />
                </div>
                <div className="sm-field">
                  <label>Giá *</label>
                  <input type="number" value={form.price} onChange={event => setField("price", event.target.value)} />
                </div>
              </div>

              <div className="sm-field-row">
                <div className="sm-field">
                  <label>Danh mục</label>
                  <select value={form.cat} onChange={event => setField("cat", event.target.value)}>
                    {categories.map(category => (
                      <option key={category.key} value={category.key}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div className="sm-field">
                  <label>Trạng thái</label>
                  <select value={form.status} onChange={event => setField("status", event.target.value)}>
                    <option value={MENU_STATUS.available}>Có sẵn</option>
                    <option value={MENU_STATUS.outOfStock}>Hết món</option>
                  </select>
                </div>
              </div>

              <div className="sm-field">
                <label>Mô tả ngắn</label>
                <input value={form.desc} onChange={event => setField("desc", event.target.value)} />
              </div>

              <div className="sm-field">
                <label>Badge</label>
                <input
                  placeholder="Bán chạy / Signature / Mới"
                  value={form.badge}
                  onChange={event => setField("badge", event.target.value)}
                />
              </div>

              <div className="sm-field">
                <label>Link ảnh trong database</label>
                <input
                  value={form.img}
                  onChange={event => setField("img", event.target.value)}
                  placeholder="Link ảnh sẽ tự điền sau khi upload"
                />
              </div>

              <div className="sm-field">
                <label>Upload ảnh</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                <p style={{ marginTop: 8, color: "#6b7280", lineHeight: 1.6 }}>
                  {cloudinaryReady
                    ? "Cloudinary đã được cấu hình. Ảnh sẽ được tải trực tiếp lên Cloudinary."
                    : "Chưa cấu hình Cloudinary. Ảnh vẫn dùng được và sẽ được lưu tạm trong trình duyệt. Muốn upload thật lên Cloudinary, hãy thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET vào file .env."}
                </p>
                {uploading && <p style={{ marginTop: 8, color: "#1a3f7a" }}>Đang tải ảnh...</p>}
                {uploadNotice && <p style={{ marginTop: 8, color: "#166534", lineHeight: 1.6 }}>{uploadNotice}</p>}
                {uploadError && <p style={{ marginTop: 8, color: "#b91c1c" }}>{uploadError}</p>}
                {form.imagePublicId && (
                  <p style={{ marginTop: 8, color: "#6b7280", wordBreak: "break-all" }}>
                    Cloudinary public_id: {form.imagePublicId}
                  </p>
                )}
              </div>

              {form.img && (
                <div className="sm-field">
                  <label>Xem trước ảnh</label>
                  <div className="smm-preview">
                    <img src={form.img} alt="Preview" />
                  </div>
                </div>
              )}

              <div className="sm-field">
                <label>Nguồn gốc</label>
                <input value={form.origin} onChange={event => setField("origin", event.target.value)} />
              </div>

              <div className="sm-field">
                <label>Nguyên liệu</label>
                <input value={form.ingredients} onChange={event => setField("ingredients", event.target.value)} />
              </div>

              <div className="sm-field">
                <label>Câu chuyện món ăn</label>
                <textarea value={form.story} onChange={event => setField("story", event.target.value)} rows={4} />
              </div>
            </div>

            <div className="sm-modal-footer">
              <button className="sm-btn outline" onClick={closeModal}>Hủy</button>
              <button className="sm-btn" onClick={saveItem}>{modal === "add" ? "Thêm món" : "Lưu thay đổi"}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="sm-modal-back">
          <div className="sm-modal" style={{ maxWidth: 400 }}>
            <div className="sm-modal-header">
              <h3 className="sm-modal-title">Xác nhận xóa</h3>
              <button className="sm-modal-close" onClick={() => setConfirmDel(null)}>✕</button>
            </div>
            <div className="sm-modal-body">
              <p style={{ color: "#374151", lineHeight: 1.7 }}>
                Xóa món <strong>{confirmDel.name}</strong> sẽ làm món này biến mất ngay khỏi web user.
              </p>
            </div>
            <div className="sm-modal-footer">
              <button className="sm-btn outline" onClick={() => setConfirmDel(null)}>Hủy</button>
              <button className="sm-btn danger" onClick={() => { deleteItem(confirmDel.id); setConfirmDel(null) }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
