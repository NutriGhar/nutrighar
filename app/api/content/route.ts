import { NextResponse } from 'next/server';
import { getWebsiteContent, updateWebsiteContent, WebsiteContent } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

// GET: Fetch website content
export async function GET() {
  try {
    const content = await getWebsiteContent();
    return NextResponse.json({ success: true, data: content }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch website content' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT: Update website content section
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { section, data } = body;

    const validSections: Array<keyof WebsiteContent> = [
      'hero',
      'heroSlides',
      'curatedCollections',
      'productSpotlight',
      'testimonials',
      'announcement',
      'brandStory',
      'contact',
      'footer',
      'newsletter',
    ];

    if (!section || !validSections.includes(section)) {
      return NextResponse.json(
        { success: false, error: `Invalid section. Valid sections: ${validSections.join(', ')}` },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const updated = await updateWebsiteContent(section, data);
    return NextResponse.json({ success: true, data: updated }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update content' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
