import { DRIVER_SECTION_META } from "./driverSections"

export default function DriverDashboardCards({ onOpenSection }) {
  return (
    <div className="smd-dashboard">
      {Object.entries(DRIVER_SECTION_META).map(([key, section]) => (
        <button
          key={key}
          type="button"
          className="smd-dashboard-card"
          onClick={() => onOpenSection(key)}
        >
          <span className="smd-dashboard-kicker">Điều hướng nhanh</span>
          <h3 className="smd-dashboard-title">{section.title}</h3>
          <p className="smd-dashboard-desc">{section.description}</p>
          <span className="smd-dashboard-link">Mở chi tiết</span>
        </button>
      ))}
    </div>
  )
}
