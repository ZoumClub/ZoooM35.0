import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { CarList } from '@/components/admin/CarList';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Car, Plus, ClipboardList, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/admin/login');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Car className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-4 mb-8">
            <Link
              href="/admin/dashboard/cars/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Car</span>
            </Link>
            <Link
              href="/admin/dashboard/private-listings"
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ClipboardList className="h-5 w-5" />
              <span>Private Listings</span>
            </Link>
          </div>

          {/* Car Listings */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Car Listings</h2>
            </div>
            <CarList
              onDelete={async (id) => {
                try {
                  const { error } = await supabase
                    .from('cars')
                    .delete()
                    .eq('id', id);

                  if (error) throw error;
                  toast.success('Car deleted successfully');
                  router.reload();
                } catch (error) {
                  console.error('Error deleting car:', error);
                  toast.error('Failed to delete car');
                }
              }}
              onToggleSold={async (car) => {
                try {
                  const { error } = await supabase
                    .from('cars')
                    .update({ is_sold: !car.is_sold })
                    .eq('id', car.id);

                  if (error) throw error;
                  toast.success(`Car marked as ${!car.is_sold ? 'sold' : 'available'}`);
                  router.reload();
                } catch (error) {
                  console.error('Error updating car:', error);
                  toast.error('Failed to update car status');
                }
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}