import { useEffect, useState } from 'react';
import { supabase, isSupabaseOnline } from '../lib/supabase';
import { Product, INITIAL_PRODUCTS } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (!isSupabaseOnline) {
        // Use local data when offline
        setProducts(INITIAL_PRODUCTS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        const mappedProducts: Product[] = data.map(d => ({
          id: d.id,
          name: d.name,
          farmer: d.farmer,
          province: d.province,
          category: d.category,
          price: Number(d.price),
          qty: Number(d.qty),
          emoji: d.emoji,
          desc: d.desc_text,
          status: d.status,
          farmerId: d.farmer_id
        }));
        setProducts(mappedProducts);
      } else {
        // No products in DB, use local fallback
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (error) {
      console.error('Error fetching products from Supabase:', error);
      // Fallback to local data on any error
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (p: Product) => {
    if (!isSupabaseOnline) {
      // Add locally when offline
      setProducts(prev => [p, ...prev]);
      return;
    }
    try {
      const { error } = await supabase.from('products').insert([{
        id: p.id,
        name: p.name,
        farmer: p.farmer,
        province: p.province,
        category: p.category,
        price: p.price,
        qty: p.qty,
        emoji: p.emoji,
        desc_text: p.desc,
        status: p.status,
        farmer_id: p.farmerId
      }]);
      if (error) throw error;
      await fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      // Add locally anyway
      setProducts(prev => [p, ...prev]);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!isSupabaseOnline) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return;
    }
    try {
      const dbUpdates: any = { ...updates };
      if (updates.desc) {
        dbUpdates.desc_text = updates.desc;
        delete dbUpdates.desc;
      }
      if (updates.farmerId) {
        dbUpdates.farmer_id = updates.farmerId;
        delete dbUpdates.farmerId;
      }

      const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
      if (error) throw error;
      await fetchProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!isSupabaseOnline) {
      setProducts(prev => prev.filter(p => p.id !== id));
      return;
    }
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct };
};