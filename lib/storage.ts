// Image Management and Upload Storage
// Saves local uploaded images to public/uploads directory and supports external URLs

import fs from 'fs';
import path from 'path';

export interface UploadResult {
  url: string;
  provider: 'local' | 'cloud' | 'url';
  success: boolean;
  error?: string;
}

/**
 * Image storage provider - writes base64 images directly to public/uploads
 * and returns the persistent /uploads/... URL
 */
export async function uploadProductImage(fileData: {
  name: string;
  type: string;
  base64OrUrl: string;
}): Promise<UploadResult> {
  try {
    const { name, base64OrUrl } = fileData;

    if (!base64OrUrl || typeof base64OrUrl !== 'string') {
      return { url: '', provider: 'local', success: false, error: 'No image data provided' };
    }

    const trimmed = base64OrUrl.trim();

    // If it's already an HTTP/HTTPS URL or /uploads/ or /images/ path, return it directly
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/uploads/') ||
      trimmed.startsWith('/images/') ||
      trimmed.startsWith('/api/uploads/')
    ) {
      return {
        url: trimmed,
        provider: 'url',
        success: true,
      };
    }

    // If it's a data URL / base64 image
    if (trimmed.startsWith('data:image/')) {
      const matches = trimmed.match(/^data:([A-Za-z0-9-+\/]+);base64,([\s\S]+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        let ext = 'jpg';
        if (mimeType.includes('png')) ext = 'png';
        else if (mimeType.includes('webp')) ext = 'webp';
        else if (mimeType.includes('gif')) ext = 'gif';
        else if (mimeType.includes('svg')) ext = 'svg';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';

        const safeName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 35) : 'product';
        const filename = `${safeName}-${Date.now()}.${ext}`;

        // Ensure public/uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);

        console.log(`[uploadProductImage] ✅ Successfully saved file to: ${filePath} (${buffer.length} bytes)`);

        return {
          url: `/uploads/${filename}`,
          provider: 'local',
          success: true,
        };
      }
    }

    // Return as-is if plain string
    return {
      url: trimmed,
      provider: 'url',
      success: true,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image processing failed';
    console.error('[uploadProductImage] Error saving image:', message);
    return {
      url: fileData.base64OrUrl || '',
      provider: 'local',
      success: true,
      error: message,
    };
  }
}
