import { NextResponse } from 'next/server';
import { getWebsiteContent, updateWebsiteContent, WebsiteContent } from '@/lib/db';

// GET: Fetch website content
export async function GET() {
  try {
    const content = await getWebsiteContent();
    return NextResponse.json({ success: true, data: content });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch website content' },
      { status: 500 }
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
      'announcement',
      'brandStory',
      'contact',
      'footer',
      'newsletter',
    ];

    if (!section || !validSections.includes(section)) {
      return NextResponse.json(
        { success: false, error: `Invalid section. Valid sections: ${validSections.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await updateWebsiteContent(section, data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update content' },
      { status: 500 }
    );
  }
}
