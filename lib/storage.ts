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

    // If it's already an HTTP/HTTPS URL or /uploads/ or /images/ path, return it directly
    if (
      base64OrUrl.startsWith('http://') ||
      base64OrUrl.startsWith('https://') ||
      base64OrUrl.startsWith('/uploads/') ||
      base64OrUrl.startsWith('/images/')
    ) {
      return {
        url: base64OrUrl,
        provider: 'url',
        success: true,
      };
    }

    // If it's a data URL / base64 image
    if (base64OrUrl.startsWith('data:image/')) {
      const matches = base64OrUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        let ext = 'jpg';
        if (mimeType.includes('png')) ext = 'png';
        else if (mimeType.includes('webp')) ext = 'webp';
        else if (mimeType.includes('gif')) ext = 'gif';
        else if (mimeType.includes('svg')) ext = 'svg';

        const safeName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) : 'img';
        const filename = `${safeName}-${Date.now()}.${ext}`;

        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, buffer);

          return {
            url: `/uploads/${filename}`,
            provider: 'local',
            success: true,
          };
        } catch {
          // On Vercel serverless (read-only filesystem), return base64 Data URI directly
          return {
            url: base64OrUrl,
            provider: 'cloud',
            success: true,
          };
        }
      }
    }

    // Return as-is
    return {
      url: base64OrUrl,
      provider: 'url',
      success: true,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image processing failed';
    return {
      url: '',
      provider: 'local',
      success: false,
      error: message,
    };
  }
}

