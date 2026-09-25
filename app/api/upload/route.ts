import { NextResponse } from 'next/server';
import { uploadProductImage } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, base64OrUrl } = body;

    if (!base64OrUrl) {
      return NextResponse.json({ success: false, error: 'Image data or URL is required' }, { status: 400 });
    }

    const result = await uploadProductImage({
      name: name || 'product-image',
      type: type || 'image/jpeg',
      base64OrUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
