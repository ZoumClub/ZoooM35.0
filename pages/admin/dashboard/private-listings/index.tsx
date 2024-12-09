import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout/Layout';
import { PrivateListingsTable } from '@/components/admin/PrivateListingsTable';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import type { PrivateListing } from '@/lib/supabase';

export default function PrivateListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<PrivateListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

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

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.rpc('process_private_listing', {
        p_listing_id: id,
        p_status: status
      });

      if (error) throw error;

      toast.success(`Listing ${status} successfully`);
      loadListings(); // Reload the listings
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Private Listings</h1>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              <PrivateListingsTable
                listings={listings}
                onStatusUpdate={handleStatusUpdate}
                isProcessing={isProcessing}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}