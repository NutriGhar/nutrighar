import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrders, getSubscribers } from '@/lib/db';

export interface AdminCustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'Registered Account' | 'Order Guest' | 'Newsletter Subscriber';
  isRegistered: boolean;
  isSubscriber: boolean;
  orderCount: number;
  totalSpent: number;
  city?: string;
  state?: string;
  createdAt: string;
  lastOrderAt?: string;
}

export async function GET() {
  try {
    const customerMap = new Map<string, AdminCustomerRecord>();

    // 1. Fetch registered customers from PostgreSQL (with order relations if available)
    try {
      const dbCustomers = await prisma.customer.findMany({
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      for (const c of dbCustomers) {
        const key = c.email ? c.email.toLowerCase() : (c.phone || c.id);
        const orderCount = c.orders?.length || 0;
        const totalSpent = c.orders?.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0) || 0;
        const lastOrderAt = c.orders?.[0]?.createdAt ? new Date(c.orders[0].createdAt).toISOString() : undefined;

        customerMap.set(key, {
          id: c.id,
          name: c.name || 'Registered Customer',
          email: c.email || '',
          phone: c.phone || '',
          source: 'Registered Account',
          isRegistered: true,
          isSubscriber: false,
          orderCount,
          totalSpent,
          city: c.city || '',
          state: c.state || '',
          createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
          lastOrderAt,
        });
      }
    } catch (err: any) {
      console.warn('[Admin Customers] DB customer fetch note:', err.message);
    }

    // 2. Fetch all orders to capture Guest checkouts & update stats
    try {
      const allOrders = await getOrders();
      for (const order of allOrders) {
        const emailKey = order.customerEmail ? order.customerEmail.toLowerCase().trim() : null;
        const phoneKey = order.customerPhone ? order.customerPhone.replace(/[^0-9]/g, '').slice(-10) : null;
        const primaryKey = emailKey || phoneKey || order.id;

        const existing = customerMap.get(emailKey || '') || (phoneKey ? customerMap.get(phoneKey) : null);

        if (existing) {
          if (existing.orderCount === 0) {
            existing.orderCount += 1;
            existing.totalSpent += (order.totalAmount || 0);
          }
          if (!existing.city && order.city) existing.city = order.city;
          if (!existing.state && order.state) existing.state = order.state;
          if (!existing.phone && order.customerPhone) existing.phone = order.customerPhone;
          if (!existing.lastOrderAt) existing.lastOrderAt = order.createdAt;
        } else {
          customerMap.set(primaryKey, {
            id: `guest-${order.id}`,
            name: order.customerName || 'Customer',
            email: order.customerEmail || '',
            phone: order.customerPhone || '',
            source: 'Order Guest',
            isRegistered: false,
            isSubscriber: false,
            orderCount: 1,
            totalSpent: order.totalAmount || 0,
            city: order.city || '',
            state: order.state || '',
            createdAt: order.createdAt || new Date().toISOString(),
            lastOrderAt: order.createdAt,
          });
        }
      }
    } catch (err: any) {
      console.warn('[Admin Customers] Orders fetch note:', err.message);
    }

    // 3. Mark/Add newsletter subscribers
    try {
      const subscribers = await getSubscribers();
      for (const sub of subscribers) {
        const cleanSub = sub.toLowerCase().trim();
        const existing = customerMap.get(cleanSub);
        if (existing) {
          existing.isSubscriber = true;
        } else {
          customerMap.set(cleanSub, {
            id: `sub-${cleanSub.replace(/[^a-zA-Z0-9]/g, '')}`,
            name: cleanSub.split('@')[0],
            email: cleanSub,
            phone: '',
            source: 'Newsletter Subscriber',
            isRegistered: false,
            isSubscriber: true,
            orderCount: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (err: any) {
      console.warn('[Admin Customers] Subscribers fetch note:', err.message);
    }

    const customers = Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const stats = {
      totalCustomers: customers.length,
      registeredCount: customers.filter((c) => c.isRegistered).length,
      orderBuyersCount: customers.filter((c) => c.orderCount > 0).length,
      subscribersCount: customers.filter((c) => c.isSubscriber).length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        customers,
      },
    });
  } catch (error: any) {
    console.error('[Admin Customers API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
