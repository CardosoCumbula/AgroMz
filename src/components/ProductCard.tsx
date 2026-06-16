import React from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  p: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ p }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const canAdd = !user || user.role === 'buyer';

  return (
    <article className="bg-white border border-stone-200 rounded-3xl overflow-hidden hover:shadow-md transition duration-150 flex flex-col group">
      <div
        onClick={() => navigate(`/produto/${p.id}`)}
        className="h-44 bg-stone-100 flex items-center justify-center text-5xl hover:bg-stone-200/80 cursor-pointer transition select-none"
      >
        {p.emoji}
      </div>
      <div className="p-5 flex-1 flex flex-col font-sans">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
          {p.category}
        </span>
        <h3 className="font-serif font-bold text-stone-900 text-sm group-hover:text-green-800 transition">
          {p.name}
        </h3>
        <p className="text-[11px] text-stone-400 mt-1">
          👨‍🌾 {p.farmer} · {p.province}
        </p>

        <div className="border-t border-stone-100 pt-3 mt-4 flex items-center justify-between">
          <span className="font-bold text-green-800 text-sm">{p.price} MZN/kg</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(p, 1);
            }}
            disabled={!canAdd}
            className="bg-green-700 hover:bg-green-800 text-white rounded-lg p-2.5 transition disabled:bg-stone-200 disabled:text-stone-400 cursor-pointer"
            aria-label="Adicionar no carrinho"
          >
            <span>🛒 (+1)</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
