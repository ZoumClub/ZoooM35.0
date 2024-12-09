import { useState } from 'react';
import { GetStaticProps } from 'next';
import { Hero } from '@/components/home/Hero';
import { FilterButtons } from '@/components/home/FilterButtons';
import { CarGrid } from '@/components/home/CarGrid';
import { BrandLogos } from '@/components/home/BrandLogos';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import type { Brand, Car } from '@/lib/supabase';

interface HomePageProps {
  brands: Brand[];
  cars: Car[];
}

export default function HomePage({ brands, cars }: HomePageProps) {
  const [filter, setFilter] = useState<'all' | 'new' | 'used'>('all');

  return (
    <Layout>
      <main>
        <Hero />
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Our Collection</h2>
              <p className="text-gray-600">Find your perfect car from our extensive inventory</p>
            </div>
            <FilterButtons onFilterChange={setFilter} currentFilter={filter} />
            <CarGrid cars={cars} filter={filter} />
          </div>
        </section>
        <BrandLogos brands={brands} />
        <WhyChooseUs />
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const [brandsResponse, carsResponse] = await Promise.all([
    supabase.from('brands').select('*').order('name'),
    supabase
      .from('cars')
      .select(`
        id,
        make,
        model,
        year,
        price,
        image,
        condition,
        is_sold,
        savings,
        brand:brands (
          id,
          name,
          logo_url
        )
      `)
      .order('created_at', { ascending: false })
  ]);

  if (brandsResponse.error) throw brandsResponse.error;
  if (carsResponse.error) throw carsResponse.error;

  return {
    props: {
      brands: brandsResponse.data || [],
      cars: carsResponse.data || [],
    },
    revalidate: 60, // Revalidate every minute
  };
}