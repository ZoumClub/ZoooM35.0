import { supabase } from './supabase';
import type { Brand, Car } from './supabase';

export async function getBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
  return data;
}

export async function getCars(): Promise<Car[]> {
  const { data, error } = await supabase
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
  return data;
}

export async function getCarsByBrand(brandName: string): Promise<Car[]> {
  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('name', brandName)
    .single();

  if (!brand) {
    throw new Error('Brand not found');
  }

  const { data, error } = await supabase
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
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cars by brand:', error);
    throw error;
  }
  return data;
}

export async function getNewCars(): Promise<Car[]> {
  const { data, error } = await supabase
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
    .eq('condition', 'new')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching new cars:', error);
    throw error;
  }
  return data;
}

export async function getUsedCars(): Promise<Car[]> {
  const { data, error } = await supabase
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
    .eq('condition', 'used')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching used cars:', error);
    throw error;
  }
  return data;
}