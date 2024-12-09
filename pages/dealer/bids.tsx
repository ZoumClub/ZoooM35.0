import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout/Layout';
import { BidButton } from '@/components/dealer/BidButton';
import { CarDetailsModal } from '@/components/dealer/CarDetailsModal';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import type { PrivateListing } from '@/lib/supabase';

export default function DealerBids() {
  const router = useRouter();
  const [listings, setListings] = useState<PrivateListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<PrivateListing | null>(null);
  const [dealerId, setDealerId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('dealer_id');
    if (!id) {
      router.replace('/dealer');
      return;
    }
    setDealerId(id);
    loadListings();
  }, [router]);

  const loadListings = async () => {
    try {
      const { data, error } = await supabase
        .from('private_listings')
        .select(`
          *,
          brand:brands (
            id,
            name,
            logo_url
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBidPlaced = () => {
    loadListings();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Available Cars for Bidding</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className="relative cursor-pointer"
                onClick={() => setSelectedListing(listing)}
              >
                <img
                  src={listing.image}
                  alt={`${listing.make} ${listing.model}`}
                  className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                />
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Click for details
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {listing.year} {listing.make} {listing.model}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {listing.mileage} • {listing.transmission} • {listing.fuel_type}
                </p>
                <div className="mt-4">
                  {dealerId && (
                    <BidButton
                      listingId={listing.id!}
                      dealerId={dealerId}
                      onBidPlaced={handleBidPlaced}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedListing && (
          <CarDetailsModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
          />
        )}

        {listings.length === 0 && !isLoading && (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-500">No cars available for bidding at the moment.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}