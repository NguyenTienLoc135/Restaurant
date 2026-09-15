function pad(value) {
  return String(value).padStart(2, "0")
}

export function getTodayDateValue() {
  const today = new Date()
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
}

export function createDefaultDateFilters() {
  return {
    date: getTodayDateValue(),
    fromDate: "",
    toDate: "",
  }
}

export function updateDateFilterField(current, field, value) {
  if (field === "date") {
    return {
      date: value,
      fromDate: "",
      toDate: "",
    }
  }

  return {
    ...current,
    date: "",
    [field]: value,
  }
}

export function validateDateFilters(filters) {
  if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
    return {
      valid: false,
      message: "Từ ngày không được lớn hơn đến ngày.",
    }
  }

  return {
    valid: true,
    message: "",
  }
}
