import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VeilMarket - Privacy-First B2B Ingredients Marketplace',
  description: 'Identities stay private until an offer is accepted.',
  keywords: ['B2B', 'marketplace', 'ingredients', 'privacy', 'chemicals'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}