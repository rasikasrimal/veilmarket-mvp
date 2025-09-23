'use client';

import { useState, useEffect } from 'react';

interface Organization {
  id: string;
  handle: string;
  tier: string;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  type: string;
  quantity: string;
  unit: string;
  location: string;
  organization_handle: string;
  organization_tier: string;
  material_scheme: string;
  material_value: string;
  material_description: string;
}

export default function HomePage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch organizations
      const orgsResponse = await fetch('http://localhost:4000/trpc/organizations');
      const orgsData = await orgsResponse.json();
      setOrganizations(orgsData.result?.data || []);

      // Fetch listings
      const listingsResponse = await fetch('http://localhost:4000/trpc/listings?input=%7B%7D');
      const listingsData = await listingsResponse.json();
      setListings(listingsData.result?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VeilMarket data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              🔐 VeilMarket
            </h1>
            <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              MVP Demo
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Privacy-first B2B ingredients marketplace
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organizations Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            🏢 Active Organizations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organizations.map((org) => (
              <div key={org.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {org.handle}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    org.tier === 'PREMIUM' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {org.tier}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Identity protected until offer acceptance
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Listings Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            📋 Available Listings
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {listing.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        listing.type === 'SELL'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {listing.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {listing.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Material</p>
                    <p className="text-sm text-gray-900">
                      {listing.material_value} ({listing.material_scheme})
                    </p>
                    <p className="text-xs text-gray-600">
                      {listing.material_description}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quantity</p>
                    <p className="text-sm text-gray-900">
                      {listing.quantity} {listing.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">{listing.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Organization</p>
                    <p className="text-sm text-gray-900">{listing.organization_handle}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      listing.organization_tier === 'PREMIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.organization_tier}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    🔒 Identity revealed only upon offer acceptance
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Make Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Footer */}
        <footer className="mt-12 bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{organizations.length}</p>
              <p className="text-gray-600">Active Organizations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{listings.length}</p>
              <p className="text-gray-600">Published Listings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">100%</p>
              <p className="text-gray-600">Privacy Protected</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}