export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔐 VeilMarket
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Privacy-First B2B Marketplace
          </h2>
          <p className="text-gray-600 mb-8">
            Where identities stay private until an offer is accepted.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">🏗️ MVP Implementation</h3>
            <p className="text-gray-600 text-sm">
              This is the foundational implementation of VeilMarket with organizations, 
              RBAC, listings, offers engine, document management, and privacy features.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Coming soon:</strong> Authentication, listing management, 
              offer system, and premium features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}