import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Map data if needed, but assuming column names match or we adapt
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
      }
    } catch (error) {
      console.error('Error fetching products from Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (p: Product) => {
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
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
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
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  return { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct };
};
