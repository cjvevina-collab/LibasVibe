const IMGBB_API_KEY = '3aa7c298084dec017af906eaed607fd0';

export interface ImgBBUploadResult {
  url: string;
  displayUrl: string;
  deleteUrl?: string;
}

export async function uploadImageToImgBB(file: File): Promise<ImgBBUploadResult> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`ImgBB upload failed (${response.status})`);
  }

  const payload = await response.json();
  if (!payload?.success || !payload?.data) {
    throw new Error(payload?.error?.message || 'ImgBB upload failed');
  }

  return {
    url: payload.data.url,
    displayUrl: payload.data.display_url || payload.data.url,
    deleteUrl: payload.data.delete_url,
  };
}
