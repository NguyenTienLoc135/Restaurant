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
