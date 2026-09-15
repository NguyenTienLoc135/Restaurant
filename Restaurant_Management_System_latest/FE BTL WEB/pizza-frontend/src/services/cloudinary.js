function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh đã chọn"))
    reader.readAsDataURL(file)
  })
}

function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim()
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim()

  if (!cloudName || !uploadPreset) {
    return null
  }

  return { cloudName, uploadPreset }
}

async function uploadToCloudinary(file, config) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", config.uploadPreset)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || "Upload ảnh lên Cloudinary thất bại")
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    provider: "cloudinary",
  }
}

async function saveLocally(file) {
  const url = await readFileAsDataUrl(file)

  return {
    url,
    publicId: "",
    provider: "local",
  }
}

export async function uploadImageToCloudinary(file) {
  const config = getCloudinaryConfig()

  if (!config) {
    return saveLocally(file)
  }

  try {
    return await uploadToCloudinary(file, config)
  } catch (error) {
    const fallback = await saveLocally(file)

    return {
      ...fallback,
      warning: `${error.message}. Ảnh đã được lưu tạm trong trình duyệt thay vì Cloudinary.`,
    }
  }
}

export function isCloudinaryConfigured() {
  return Boolean(getCloudinaryConfig())
}
