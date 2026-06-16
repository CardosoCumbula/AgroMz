import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../types';

export default function Marketplace() {
  const { user } = useAuth();
  const { products, loading } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [sorting, setSorting] = useState('default');

  const getFilteredProducts = () => {
    return products.filter((p) => {
      const matchCat = activeCategory === 'Todos' || p.category === activeCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.desc || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.province.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && p.status === 'approved' && matchSearch;
    });
  };

  const getSortedProducts = () => {
    const list = getFilteredProducts();
    if (sorting === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sorting === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (sorting === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm font-sans space-y-4">
        <h1 className="text-2xl font-bold font-serif text-stone-900">Mercado Agrícola Moçambicano</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 min-w-[240px] relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar batata, coco, mandioca, feijão ou agricultores cooperados..."
              className="w-full text-sm border-2 border-stone-200 focus:border-green-600 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-stone-900 transition"
            />
          </div>

          {/* Sorter Selector */}
          <select
            value={sorting}
            onChange={(e) => setSorting(e.target.value)}
            className="bg-white border-2 border-stone-200 text-stone-700 font-bold px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-green-600 cursor-pointer"
          >
            <option value="default">Ordenação padrão</option>
            <option value="price-asc">Preço: Menor → Maior</option>
            <option value="price-desc">Preço: Maior → Menor</option>
            <option value="name">Nome: A → Z</option>
          </select>
        </div>

        {/* Category selector capsules */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition ${
                activeCategory === c
                  ? 'bg-green-700 text-white border-green-800 shadow-sm'
                  : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-500'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {user?.role === 'farmer' && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-800 font-medium font-sans">
          ⚠️ <strong>Painel do Produtor:</strong> Encontra-se ligado com uma conta de agricultor. Para selecionar itens no carrinho, efetue logout e compre como cliente/visitante.
        </div>
      )}

      <div className="flex justify-between items-center px-2">
        <span className="text-xs text-stone-400 font-medium tracking-wide">
          Exibindo {getSortedProducts().length} produto(s) agrícolas
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl font-sans text-stone-500">
          Carregando produtos de Moçambique do Supabase...
        </div>
      ) : getSortedProducts().length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl font-sans">
          <span className="text-5xl block">🌱</span>
          <p className="text-sm font-semibold text-stone-600 mt-4">Nenhuma hortaliça ou produto disponível para os filtros atuais.</p>
          <p className="text-xs text-stone-400 mt-1">Experimente alterar a sua busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
          {getSortedProducts().map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
