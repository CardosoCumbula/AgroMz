import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [p, setP] = useState<Product | null>(null);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const found = products.find((x) => x.id === id);
      setP(found || null);
    }
  }, [id, products, loading]);

  if (loading) return <div className="text-center py-20 text-stone-500">Carregando produto...</div>;
  if (!p) return <div className="text-center py-20 text-stone-500">Produto não encontrado.</div>;

  const canAdd = !user || user.role === 'buyer';

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <button 
        onClick={() => navigate('/mercado')} 
        className="text-xs font-bold text-green-700 hover:underline cursor-pointer flex items-center gap-1"
      >
        ← Voltar ao Catálogo do Mercado
      </button>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
        <div className="bg-stone-100 border border-stone-200 rounded-3xl flex items-center justify-center text-[10rem] min-h-[300px] select-none p-4 shadow-inner">
          {p.emoji}
        </div>

        <div className="space-y-6">
          <div>
            <span className="bg-green-100 text-green-800 font-bold px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider">{p.category}</span>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mt-3">{p.name}</h1>
            <p className="text-xl font-bold text-green-800 mt-2">{p.price.toLocaleString("pt-MZ")} MZN / kg</p>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed border-t border-stone-150 pt-4">{p.desc}</p>

          <div className="border-t border-stone-150 pt-4 space-y-4">
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl">
              <p className="text-xs font-bold text-stone-700">Cooperado Produtor:</p>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">🌾 {p.farmer}</p>
              <p className="text-xs text-stone-400 mt-0.5">Localização: Província de {p.province}, Moçambique</p>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mt-2">✓ Qualidade e Origem Protegida AgroMoz</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => addToCart(p, 1)}
                disabled={!canAdd}
                className="flex-1 bg-green-700 hover:bg-green-800 disabled:bg-stone-200 py-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                Adicionar 1kg ao Carrinho
              </button>
              <button
                onClick={() => addToCart(p, 5)}
                disabled={!canAdd}
                className="px-4 border-2 border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl font-bold text-xs transition uppercase cursor-pointer"
              >
                Comprar fardo (5kg)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
