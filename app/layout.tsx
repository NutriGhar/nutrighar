import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { ContentProvider } from "@/context/ContentContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nutri Ghar — Goodness That Feels Like Home",
  description: "Naturally crafted foods and homemade nutrition made with love, purity, and time-tested Indian traditions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FAF7F2] text-[#1C1917]">
        <ContentProvider>
          <CustomerAuthProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1 pb-28 lg:pb-0">{children}</main>
              <Footer />
              <FloatingWhatsApp />
            </CartProvider>
          </CustomerAuthProvider>
        </ContentProvider>
      </body>
    </html>
  );
}
