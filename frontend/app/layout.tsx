import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// next/font downloads the fonts at build time and serves them from our own
// domain — no request to Google at runtime, and no layout shift while loading.
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Movie Booking',
    template: '%s · Movie Booking',
  },
  description: 'Browse movies, pick your seats, and book tickets in seconds.',
};

// The root layout wraps every page. Shared UI (header, footer) goes here later.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
