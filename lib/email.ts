import nodemailer from 'nodemailer';

// Helper to create SMTP transporter
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  totalAmount: number;
  deliveryCharge?: number;
  paymentStatus?: string;
  items: Array<{
    productName: string;
    productPrice: number;
    quantity: number;
    productImage?: string | null;
  }>;
}

/**
 * Send rich HTML order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<boolean> {
  if (!order.customerEmail || !order.customerEmail.includes('@')) {
    console.log(`[Email] Skipping order confirmation: no valid email provided for ${order.orderNumber}`);
    return false;
  }

  const transporter = getTransporter();
  const fromAddress = process.env.EMAIL_FROM || `"Nutri Ghar" <${process.env.SMTP_USER || 'care@nutrighar.com'}>`;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #F0EAE1; color: #1C2914; font-weight: 600;">
          ${item.productName} <span style="font-weight: 400; color: #777;">× ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #F0EAE1; color: #1C2914; text-align: right; font-weight: 700;">
          ₹${(item.productPrice * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Nutri Ghar</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 24px; color: #2C2A29;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin: 0 auto; border: 1px solid #EFEAE3;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #5C7A38; padding: 32px 24px; text-align: center; color: #FFFFFF;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">Nutri Ghar</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Pure Homemade Goodness</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <span style="font-size: 24px; display: block; margin-bottom: 4px;">🎉</span>
                <h2 style="margin: 0; color: #065F46; font-size: 18px; font-weight: 700;">Order Confirmed!</h2>
                <p style="margin: 4px 0 0 0; color: #047857; font-size: 13px;">Thank you for your order, <strong>${order.customerName}</strong>.</p>
              </div>

              <table width="100%" style="margin-bottom: 24px; font-size: 13px; color: #555;">
                <tr>
                  <td><strong>Order Number:</strong></td>
                  <td style="text-align: right; color: #5C7A38; font-weight: 700; font-family: monospace; font-size: 14px;">#${order.orderNumber}</td>
                </tr>
                <tr>
                  <td><strong>Contact Phone:</strong></td>
                  <td style="text-align: right;">+91 ${order.customerPhone}</td>
                </tr>
                <tr>
                  <td><strong>Payment Status:</strong></td>
                  <td style="text-align: right; font-weight: 600; color: #166534;">${order.paymentStatus || 'Paid / Confirmed'}</td>
                </tr>
              </table>

              <!-- Ordered Items -->
              <h3 style="font-size: 15px; font-weight: 700; color: #1C2914; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Order Summary</h3>
              <table width="100%" style="margin-bottom: 24px; font-size: 14px;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 10px 0; color: #666;">Delivery Charges</td>
                  <td style="padding: 10px 0; text-align: right; color: #166534; font-weight: 600;">
                    ${order.deliveryCharge === 0 || !order.deliveryCharge ? 'FREE' : `₹${order.deliveryCharge.toFixed(2)}`}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 0; font-size: 16px; font-weight: 800; color: #1C2914; border-top: 2px solid #1C2914;">Total Amount</td>
                  <td style="padding: 14px 0; font-size: 18px; font-weight: 800; color: #5C7A38; text-align: right; border-top: 2px solid #1C2914;">
                    ₹${order.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </table>

              <!-- Delivery Address -->
              <div style="background-color: #FAF7F2; border-radius: 12px; padding: 18px; border: 1px solid #EFEAE3; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #5C7A38; text-transform: uppercase;">📍 Shipping Address</h4>
                <p style="margin: 0; font-size: 13px; color: #333; line-height: 1.5;">
                  <strong>${order.customerName}</strong><br>
                  ${order.addressLine1}${order.addressLine2 ? ', ' + order.addressLine2 : ''}<br>
                  ${order.city}, ${order.state} - ${order.postalCode}<br>
                  Phone: +91 ${order.customerPhone}
                </p>
              </div>

              <!-- Support Note -->
              <p style="font-size: 12px; color: #777; line-height: 1.5; text-align: center; margin: 0;">
                Have questions regarding your order? Reach out to us directly on WhatsApp at 
                <a href="https://wa.me/917976119153" style="color: #5C7A38; font-weight: 700; text-decoration: none;">+91 79761 19153</a> 
                or reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F3EFEA; padding: 20px 24px; text-align: center; font-size: 11px; color: #888;">
              © 2026 Nutri Ghar • Pure Homemade Nutrition Crafted With Care.<br>
              Sector 14, Gurugram, Haryana - 122001
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Simulation] SMTP not configured. Order confirmation for #${order.orderNumber} prepared for ${order.customerEmail}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: order.customerEmail,
      subject: `Order Confirmed: #${order.orderNumber} - Nutri Ghar`,
      html: emailHtml,
    });
    console.log(`[Email] Order confirmation sent successfully to ${order.customerEmail}`);
    return true;
  } catch (error: any) {
    console.error(`[Email] Failed to send order confirmation to ${order.customerEmail}:`, error.message);
    return false;
  }
}

/**
 * Send welcome email to newly registered customer
 */
export async function sendWelcomeEmail(name: string, email: string): Promise<boolean> {
  if (!email || !email.includes('@')) return false;

  const transporter = getTransporter();
  const fromAddress = process.env.EMAIL_FROM || `"Nutri Ghar" <${process.env.SMTP_USER || 'care@nutrighar.com'}>`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Nutri Ghar</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 24px; color: #2C2A29;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin: 0 auto; border: 1px solid #EFEAE3;">
          <tr>
            <td style="background-color: #5C7A38; padding: 32px 24px; text-align: center; color: #FFFFFF;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700;">Welcome to Nutri Ghar!</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Pure Homemade Goodness</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <p style="font-size: 15px; color: #333; line-height: 1.6; margin-top: 0;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="font-size: 14px; color: #555; line-height: 1.6;">
                Thank you for joining the Nutri Ghar family! We craft traditional sweets and stone-ground nut butters made with 100% pure desi cow ghee, California almonds, and zero preservatives.
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="background-color: #5C7A38; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
                  Explore Pure Goodness →
                </a>
              </div>
              <p style="font-size: 12px; color: #777; line-height: 1.5; text-align: center; margin: 0;">
                Need assistance? WhatsApp us anytime at <a href="https://wa.me/917976119153" style="color: #5C7A38; font-weight: 700;">+91 79761 19153</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F3EFEA; padding: 16px 24px; text-align: center; font-size: 11px; color: #888;">
              © 2026 Nutri Ghar • Pure Homemade Nutrition Crafted With Care.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Simulation] SMTP not configured. Welcome email prepared for ${email}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Welcome to Nutri Ghar, ${name}! 🍯`,
      html: emailHtml,
    });
    return true;
  } catch (error: any) {
    console.error(`[Email] Failed to send welcome email to ${email}:`, error.message);
    return false;
  }
}
