import React, { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { supabase } from '../lib/supabase';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setOrders(data.map(d => ({
          id: d.id,
          client: d.client,
          email: d.email,
          phone: d.phone,
          items: d.items, // assuming jsonb
          total: Number(d.total),
          paymentMethod: d.payment_method,
          status: d.status,
          date: d.created_at
        })));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      // Fallback if Supabase not configured:
      const res = await fetch("/api/orders");
      if (res.ok) {
        const d = await res.json();
        // naive fallback filter
        setOrders(d.filter((o: any) => o.email === user?.email));
      }
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'buyer') {
    return <div className="text-center py-20 text-stone-500">Acesso restrito. Faça login como comprador.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans text-stone-900">
      <h1 className="text-2xl font-serif font-bold text-stone-900 border-b border-stone-200 pb-3">📦 Minhas Compras</h1>
      
      {loading ? (
        <div className="text-center py-20 text-stone-500">Carregando encomendas...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl">
          <Smartphone className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-stone-600">Nenhuma encomenda registada de momento.</p>
          <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">Coloque produtos no carrinho e faça checkout com M-Pesa para listar compras na sua conta.</p>
          <button onClick={() => navigate('/mercado')} className="mt-4 bg-green-700 hover:bg-green-800 text-white px-4.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition uppercase">
            Explorar Mercado
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-green-300 transition duration-150">
              <div className="space-y-1.5 flex-1 select-none">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-900">Encomenda #{o.id}</span>
                  <span className="text-[10px] bg-green-150 border border-green-200 text-green-800 font-bold uppercase rounded px-2 py-0.5 tracking-wide">
                    ✓ {o.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400">Canal de Liquidação: 📱 {o.paymentMethod} • Data: {new Date(o.date).toLocaleDateString("pt-MZ")}</p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {o.items.map((it, i) => (
                    <span key={i} className="text-[11px] bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-stone-700 font-medium">
                      {it.emoji} {it.name} ({it.qty}kg)
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right flex-shrink-0 self-end md:self-center">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest text-[10px]">Total Liquidado</p>
                <p className="text-lg font-bold text-green-800">{o.total.toLocaleString("pt-MZ")} MZN</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
