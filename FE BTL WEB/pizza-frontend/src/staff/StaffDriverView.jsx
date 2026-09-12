import { useState } from "react"
import { useStaff } from "./StaffContext"
import DriverDashboardCards from "./driver/DriverDashboardCards"
import DriverSectionDetail from "./driver/DriverSectionDetail"

export default function StaffDriverView() {
  const { staff } = useStaff()
  const [activeSection, setActiveSection] = useState("")
  const isDriverMode = staff?.role === "driver"

  return (
    <div className="sm-page">
      {!activeSection ? (
        <>
          <div className="sm-header">
            <div>
              <h2 className="sm-title">Vận hành giao hàng</h2>
              <p className="sm-sub">
                {isDriverMode
                  ? "Chọn đúng nhóm đơn để tải dữ liệu khi cần. Page này không còn fetch cả 3 danh sách cùng lúc."
                  : "Staff theo dõi vận hành driver theo từng nhóm đơn riêng, chỉ mở mục nào thì mới tải dữ liệu mục đó."}
              </p>
            </div>
          </div>

          <DriverDashboardCards onOpenSection={setActiveSection} />
        </>
      ) : (
        <DriverSectionDetail
          section={activeSection}
          isDriverMode={isDriverMode}
          onBack={() => setActiveSection("")}
        />
      )}
    </div>
  )
}
