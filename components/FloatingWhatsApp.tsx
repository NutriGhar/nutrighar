'use client';

import { usePathname } from 'next/navigation';
import { useContent } from '@/context/ContentContext';

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const { getWhatsAppUrl } = useContent();

  // Hide floating WhatsApp on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const url = getWhatsAppUrl('Hi Nutri Ghar, I have a question about your products');

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Nutri Ghar on WhatsApp"
      className="hidden sm:flex fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
      style={{
        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
      }}
    >
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.158.572 4.185 1.572 5.941l-1.572 5.887 6.035-1.583c1.706.932 3.659 1.467 5.733 1.467 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
      </svg>
      
      {/* Tooltip on hover */}
      <span className="absolute right-16 bg-[#13241C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
        Chat with us on WhatsApp
      </span>
    </a>
  );
}
