import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import './global.css';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Framelet',
    template: '%s | Framelet',
  },
  description: 'Headless, Instagram-inspired image editor.',
  applicationName: 'Framelet',
  icons: {
    icon: [
      { url: '/brand/favicon.ico' },
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'Framelet',
    title: 'Framelet',
    description: 'Headless, Instagram-inspired image editor.',
    images: [
      {
        url: '/brand/framelet.jpg',
        width: 3125,
        height: 3125,
        alt: 'Framelet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/brand/framelet.jpg'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
