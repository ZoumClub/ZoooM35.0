import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout/Layout';
import { SellerListings } from '@/components/seller/SellerListings';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { LogOut } from 'lucide-react';
import type { PrivateListing } from '@/lib/supabase';

export default function SellerDashboard() {
  const router = useRouter();
  const [listings, setListings] = useState<PrivateListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sellerName = localStorage.getItem('seller_name');
    const sellerPhone = localStorage.getItem('seller_phone');

    if (!sellerName || !sellerPhone) {
      router.replace('/seller/login');
      return;
    }

    loadListings(sellerName, sellerPhone);
  }, [router]);

  const loadListings = async (name: string, phone: string) => {
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
        .eq('client_name', name)
        .eq('client_phone', phone)
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

  const handleLogout = () => {
    localStorage.removeItem('seller_name');
    localStorage.removeItem('seller_phone');
    router.push('/seller/login');
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {localStorage.getItem('seller_name')}
            </h1>
            <p className="text-gray-600 mt-1">
              Here are your car listings and their current status
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        <SellerListings listings={listings} />
      </div>
    </Layout>
  );
}