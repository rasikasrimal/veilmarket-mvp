import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              VeilMarket
            </Link>
            <nav className="space-x-4">
              <Link href="/listings" className="text-muted-foreground hover:text-foreground">
                Browse
              </Link>
              <Link href="/auth/signin" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
              <Link href="/auth/signup" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Privacy-First B2B
            <br />
            Ingredients Marketplace
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Identities stay private until an offer is accepted. 
            Connect with suppliers and buyers while maintaining confidentiality.
          </p>
          <div className="space-x-4">
            <Link href="/auth/signup" className="bg-primary text-primary-foreground px-8 py-3 rounded-md text-lg hover:bg-primary/90 inline-block">
              Start Trading
            </Link>
            <Link href="/listings" className="border border-input px-8 py-3 rounded-md text-lg hover:bg-accent inline-block">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                🛡️
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy Protection</h3>
              <p className="text-muted-foreground">
                Company identities remain veiled until offers are accepted
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                🔍
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-muted-foreground">
                Find materials by CAS numbers, E-numbers, and other identifiers
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                💎
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Access</h3>
              <p className="text-muted-foreground">
                Premium members get 48-hour early access to new listings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 VeilMarket. Built with ❤️ on Next.js, Fastify, Prisma, Postgres, and Stripe.</p>
        </div>
      </footer>
    </div>
  );
}