import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import AuthProvider from "@/components/auth-provider"
import SessionManager from "@/components/session-manager"
import Analytics from "@/components/analytics"
import CookieConsent from "@/components/cookie-consent"
import { AuthInitializer } from "@/components/auth-initializer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Organic Orchard - Premium Dry Fruits | Nature's Richest, Delivered to Your Door",
  description:
    "Discover our curated collection of premium organic dry fruits, sourced directly from the finest orchards across Pakistan. 100% organic, premium quality, fast delivery.",
  keywords:
    "organic dry fruits, premium almonds, kashmiri almonds, pistachios, dates, walnuts, cashews, healthy snacks, organic food",
  authors: [{ name: "Organic Orchard" }],
  creator: "Organic Orchard",
  publisher: "Organic Orchard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://organicorchard.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Organic Orchard - Premium Dry Fruits",
    description: "Nature's Richest, Delivered to Your Door. Premium organic dry fruits from the finest orchards.",
    url: "https://organicorchard.com",
    siteName: "Organic Orchard",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Organic Orchard - Premium Dry Fruits",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organic Orchard - Premium Dry Fruits",
    description: "Nature's Richest, Delivered to Your Door. Premium organic dry fruits from the finest orchards.",
    images: ["/og-image.jpg"],
    creator: "@organicorchard",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#355E3B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Organic Orchard" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#355E3B" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SessionManager />
            <Analytics />
            {children}
            <CookieConsent />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
