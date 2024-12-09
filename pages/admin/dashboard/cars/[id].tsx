import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout/Layout';
import { CarFormComponent } from '@/components/admin/CarFormComponent';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import type { Brand, Car } from '@/lib/supabase';

export default function EditCarPage() {
  const router = useRouter();
  const { id } = router.query;
  const [car, setCar] = useState<Car | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      // Load car and brands in parallel
      const [carResponse, brandsResponse] = await Promise.all([
        supabase
          .from('cars')
          .select(`
            *,
            brand:brands (
              id,
              name,
              logo_url
            ),
            features:car_features (
              id,
              name,
              available
            )
          `)
          .eq('id', id)
          .single(),
        supabase
          .from('brands')
          .select('*')
          .order('name')
      ]);

      if (carResponse.error) throw carResponse.error;
      if (brandsResponse.error) throw brandsResponse.error;

      setCar(carResponse.data);
      setBrands(brandsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load car details');
      router.push('/admin/dashboard');
    } finally {
      setIsLoading(false);
    }
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

  if (!car) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Car not found</h2>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Car: {car.year} {car.make} {car.model}
              </h1>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <CarFormComponent
              brands={brands}
              initialData={car}
              onSuccess={() => {
                toast.success('Car updated successfully');
                router.push('/admin/dashboard');
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}