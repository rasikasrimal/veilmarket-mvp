import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VeilMarket - Privacy-First B2B Marketplace',
  description: 'Secure B2B ingredients marketplace where identities stay private until acceptance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}