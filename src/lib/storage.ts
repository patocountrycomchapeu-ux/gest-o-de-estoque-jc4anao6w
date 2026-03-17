import { supabase } from '@/lib/supabase/client'

export async function uploadPhoto(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`

  const { data, error } = await supabase.storage.from('asset-photos').upload(fileName, file)

  if (data) {
    const { data: publicUrlData } = supabase.storage.from('asset-photos').getPublicUrl(fileName)
    return publicUrlData.publicUrl
  }

  console.error('Upload error:', error)
  return null
}
