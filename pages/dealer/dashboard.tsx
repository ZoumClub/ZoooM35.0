import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Layout } from '@/components/layout/Layout';
import { CarFront, Gavel, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { CarDetailsModal } from '@/components/dealer/CarDetailsModal';
import type { Car as CarType } from '@/lib/supabase';

export default function DealerDashboard() {
  const router = useRouter();
  const [dealerName, setDealerName] = useState('');
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [cars, setCars] = useState<CarType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('dealer_id');
    const name = localStorage.getItem('dealer_name');

    if (!id) {
      router.replace('/dealer');
      return;
    }

    setDealerId(id);
    setDealerName(name || '');
    loadInventory(id);
  }, [router]);

  const loadInventory = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          brand:brands (
            id,
            name,
            logo_url
          )
        `)
        .eq('dealer_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSoldStatus = async (car: CarType, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('cars')
        .update({ is_sold: !car.is_sold })
        .eq('id', car.id);

      if (error) throw error;

      setCars(cars.map(c => c.id === car.id ? { ...c, is_sold: !car.is_sold } : c));
      toast.success(`Car marked as ${!car.is_sold ? 'sold' : 'available'}`);
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error('Failed to update car status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dealer_id');
    localStorage.removeItem('dealer_name');
    router.replace('/dealer');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h1 className="text-xl font-semibold text-gray-900">Welcome</h1>
                <p className="text-gray-600">{dealerName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => router.push('/dealer/sell-car')}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-white group"
            >
              <CarFront className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform stroke-[1.5]" />
              <span className="text-sm font-medium">Sell Car</span>
            </button>

            <button
              onClick={() => router.push('/dealer/bids')}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-white group"
            >
              <Gavel className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform stroke-[1.5]" />
              <span className="text-sm font-medium">Bid on Cars</span>
            </button>
          </div>

          {/* Inventory Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Inventory</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : cars.length > 0 ? (
              <div className="space-y-4">
                {cars.map((car) => (
                  <div
                    key={car.id}
                    onClick={() => setSelectedCar(car)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={car.image}
                          alt={`${car.make} ${car.model}`}
                          width={64}
                          height={64}
                          className="object-cover rounded-md"
                          priority={false}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {car.year} {car.make} {car.model}
                        </h3>
                        <p className="text-sm text-gray-500">
                          £{car.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => toggleSoldStatus(car, e)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
                        car.is_sold
                          ? 'text-green-700 bg-green-100 hover:bg-green-200'
                          : 'text-red-700 bg-red-100 hover:bg-red-200'
                      }`}
                    >
                      <Tag className="h-4 w-4 stroke-[1.5]" />
                      {car.is_sold ? 'Mark Available' : 'Mark Sold'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No cars in your inventory. Click "Sell Car" to add your first listing.
              </div>
            )}
          </div>
        </div>

        {/* Car Details Modal */}
        {selectedCar && (
          <CarDetailsModal
            car={selectedCar}
            onClose={() => setSelectedCar(null)}
          />
        )}
      </div>
    </Layout>
  );
}