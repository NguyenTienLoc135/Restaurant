export const DRIVER_SECTION_META = {
  pending: {
    title: "Đơn chờ tài xế nhận",
    description: "Chỉ xem các đơn đang ở trạng thái chờ shipper nhận.",
    emptyText: "Không có đơn hàng nào đang chờ nhận",
  },
  delivering: {
    title: "Đơn đang giao",
    description: "Chỉ xem các đơn đã được tài xế nhận và đang giao.",
    emptyText: "Hiện chưa có đơn nào đang trên đường giao",
  },
  history: {
    title: "Lịch sử đơn hàng",
    description: "Chỉ xem các đơn đã hoàn tất hoặc bị hủy.",
    emptyText: "Chưa có đơn đã hoàn tất hoặc bị hủy",
  },
}

export function getDriverSectionMeta(section) {
  return DRIVER_SECTION_META[section] || DRIVER_SECTION_META.pending
}
