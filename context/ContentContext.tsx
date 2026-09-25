'use client';
// live dynamic content provider
import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteContent } from '@/lib/db';

export function formatWhatsAppUrl(numberOrUrl?: string, message?: string): string {
  if (!numberOrUrl) return 'https://wa.me/919876543210';
  const trimmed = numberOrUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const digits = trimmed.replace(/[^0-9]/g, '');
  const phone = digits.length === 10 ? `91${digits}` : digits;
  const textQuery = message ? `?text=${encodeURIComponent(message)}` : '';
  const finalDigits = phone || '919876543210';
  return `https://wa.me/${finalDigits}${textQuery}`;
}

export function formatTelUrl(phone?: string): string {
  if (!phone) return 'tel:+919876543210';
  const clean = phone.replace(/[^0-9+]/g, '');
  return `tel:${clean}`;
}

interface ContentContextType {
  content: WebsiteContent | null;
  whatsappLink: string;
  phone: string;
  email: string;
  getWhatsAppUrl: (message?: string) => string;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType>({
  content: null,
  whatsappLink: 'https://wa.me/919876543210',
  phone: '+91 98765 43210',
  email: 'care@nutrighar.com',
  getWhatsAppUrl: () => 'https://wa.me/919876543210',
  refreshContent: async () => {},
});

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<WebsiteContent | null>(null);

  const refreshContent = async () => {
    try {
      const res = await fetch('/api/content', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        setContent(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch website content:', err);
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  const rawWhatsApp = content?.contact?.whatsapp || content?.footer?.whatsappUrl || '+91 98765 43210';
  const whatsappLink = formatWhatsAppUrl(rawWhatsApp);
  const phone = content?.contact?.phone || '+91 98765 43210';
  const email = content?.contact?.email || 'care@nutrighar.com';

  const getWhatsAppUrl = (message?: string) => formatWhatsAppUrl(rawWhatsApp, message);

  return (
    <ContentContext.Provider
      value={{
        content,
        whatsappLink,
        phone,
        email,
        getWhatsAppUrl,
        refreshContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}
