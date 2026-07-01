import { apiFetch } from '@/lib/api'

export async function uploadPhoto(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const data = await apiFetch('/upload', {
      method: 'POST',
      body: formData,
    })
    return data?.url || null
  } catch (error) {
    console.error('Upload error:', error)
    return null
  }
}
