export default function StaffDateFilterBar({
  filters,
  loading = false,
  onChangeField,
  onSearch,
  onReset,
}) {
  return (
    <div className="sm-date-filter-bar">
      <div className="sm-date-fields">
        <div className="sm-date-field">
          <label>Ngày cụ thể</label>
          <input
            className="sm-status-select"
            type="date"
            value={filters.date}
            onChange={event => onChangeField("date", event.target.value)}
          />
        </div>

        <div className="sm-date-field">
          <label>Từ ngày</label>
          <input
            className="sm-status-select"
            type="date"
            value={filters.fromDate}
            onChange={event => onChangeField("fromDate", event.target.value)}
          />
        </div>

        <div className="sm-date-field">
          <label>Đến ngày</label>
          <input
            className="sm-status-select"
            type="date"
            value={filters.toDate}
            onChange={event => onChangeField("toDate", event.target.value)}
          />
        </div>
      </div>

      <div className="sm-filter-actions">
        <button type="button" className="sm-btn" onClick={onSearch} disabled={loading}>
          {loading ? "Đang tải..." : "Lọc"}
        </button>
        <button type="button" className="sm-btn outline" onClick={onReset} disabled={loading}>
          Đặt lại về hôm nay
        </button>
      </div>
    </div>
  )
}
