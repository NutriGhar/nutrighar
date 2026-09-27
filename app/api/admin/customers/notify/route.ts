import { NextResponse } from 'next/server';
import { sendProductAnnouncementEmail } from '@/lib/email';
import { getProductById } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recipients,
      subject,
      headline,
      message,
      productId,
      ctaText,
      ctaLink,
    } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one recipient email is required' },
        { status: 400 }
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Optional product details
    let productDetails: any = null;
    if (productId) {
      const p = await getProductById(productId);
      if (p) {
        productDetails = {
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image,
          slug: p.slug,
        };
      }
    }

    let sentCount = 0;
    let failedCount = 0;

    // Dispatch emails (parallel batches of 5)
    const batchSize = 5;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (r: { email: string; name?: string } | string) => {
          const email = typeof r === 'string' ? r : r.email;
          const name = typeof r === 'string' ? undefined : r.name;
          if (!email || !email.includes('@')) {
            failedCount++;
            return;
          }

          try {
            const ok = await sendProductAnnouncementEmail({
              recipientEmail: email,
              recipientName: name,
              subject,
              headline,
              message,
              product: productDetails,
              ctaText,
              ctaLink,
            });
            if (ok) sentCount++;
            else failedCount++;
          } catch {
            failedCount++;
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notification broadcast processed successfully. Sent: ${sentCount}, Failed/Skipped: ${failedCount}`,
      data: {
        totalRecipients: recipients.length,
        sentCount,
        failedCount,
      },
    });
  } catch (error: any) {
    console.error('[Admin Notify API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}
