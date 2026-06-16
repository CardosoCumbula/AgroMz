import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { Plus } from 'lucide-react';
import { Product } from '../types';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { showToast } = useToast();

  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newCategory, setNewCategory] = useState('Vegetais');
  const [newEmoji, setNewEmoji] = useState('🥬');

  if (user?.role !== 'farmer') {
    return <div className="text-center py-20 text-stone-500">Acesso restrito.</div>;
  }

  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setNewTitle('');
    setNewDesc('');
    setNewPrice('');
    setNewQty('');
    setIsFarmerModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setNewTitle(p.name);
    setNewDesc(p.desc);
    setNewPrice(p.price.toString());
    setNewQty(p.qty.toString());
    setNewCategory(p.category);
    setNewEmoji(p.emoji);
    setIsFarmerModalOpen(true);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja apagar o produto "${name}"?`)) {
      try {
        await deleteProduct(id);
        showToast('Produto removido com sucesso.', 'info');
      } catch (err) {
        showToast('Erro ao remover produto.', 'error');
      }
    }
  };

  const handleSaveProduct = async () => {
    if (!newTitle.trim() || !newPrice) {
      showToast('Por favor, preencha o Título e o Preço por kg.', 'error');
      return;
    }

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, {
          name: newTitle,
          desc: newDesc,
          price: parseFloat(newPrice),
          qty: parseInt(newQty) || 100,
          category: newCategory,
          emoji: newEmoji
        });
        showToast('Produto atualizado com sucesso!', 'success');
      } else {
        const p: Product = {
          id: 'prod-' + Date.now(),
          name: newTitle,
          desc: newDesc,
          price: parseFloat(newPrice),
          qty: parseInt(newQty) || 100,
          category: newCategory,
          emoji: newEmoji,
          farmer: user.name || 'Agricultor AgroMoz',
          province: 'Maputo (Província)',
          status: 'approved',
          farmerId: user.id
        };
        await addProduct(p);
        showToast('Novo produto registado com sucesso!', 'success');
      }

      setNewTitle('');
      setNewDesc('');
      setNewPrice('');
      setNewQty('');
      setEditingProductId(null);
      setIsFarmerModalOpen(false);
    } catch (err) {
      showToast('Erro ao guardar produto no banco de dados.', 'error');
    }
  };

  const farmerProducts = products.filter((p) => p.farmerId === user.id);

  return (
    <div className="space-y-6 animate-fade-in font-sans text-stone-900">
      <div className="flex justify-between items-center gap-4 flex-wrap pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Estatísticas do Meu Mostruário</h1>
          <p className="text-xs text-stone-500 mt-1">Gerencie produtos e visualize receitas para a Província de Maputo</p>
        </div>
        <button
          onClick={handleOpenCreateProduct}
          className="bg-green-700 hover:bg-green-800 font-bold text-xs uppercase text-white rounded-xl px-5 py-3 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Novas Colheitas
        </button>
      </div>

      {/* FARMER GRAPH CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 p-5 rounded-3xl text-center shadow-sm">
          <p className="text-5xl font-serif text-green-700 font-extrabold text-green-850">
            {farmerProducts.length}
          </p>
          <p className="text-[10px] font-bold text-stone-400 mt-2 uppercase tracking-widest">Total Produtos</p>
        </div>
        <div className="bg-white border border-stone-200 p-5 rounded-3xl text-center shadow-sm">
          <p className="text-5xl font-serif text-green-700 font-extrabold text-green-850">
            {farmerProducts.filter(p => p.status === 'approved').length}
          </p>
          <p className="text-[10px] font-bold text-stone-400 mt-2 uppercase tracking-widest">Aprovados</p>
        </div>
        <div className="bg-white border border-stone-200 p-5 rounded-3xl text-center shadow-sm">
          <p className="text-5xl font-serif text-amber-600 font-extrabold">0</p>
          <p className="text-[10px] font-bold text-stone-400 mt-2 uppercase tracking-widest">Revisões Pendentes</p>
        </div>
        <div className="bg-white border border-stone-200 p-5 rounded-3xl text-center shadow-sm">
          <p className="text-2xl font-serif text-green-800 font-extrabold mt-3">
            {(farmerProducts.reduce((s, x) => s + (x.price * x.qty), 0)).toLocaleString("pt-MZ")}
          </p>
          <p className="text-[10px] font-bold text-stone-400 mt-2.5 uppercase tracking-widest">Valor do Mostruário (MZN)</p>
        </div>
      </div>

      {/* FARMER PRODUCT GRID */}
      <h2 className="text-lg font-serif font-bold text-stone-900 pt-4">Os Meus Produtos Registados</h2>
      {loading ? (
        <p className="text-stone-500">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {farmerProducts.map((p) => (
            <div key={p.id} className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <div className="h-32 bg-stone-100 flex items-center justify-center text-4xl select-none">{p.emoji}</div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{p.category}</span>
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-[9px] font-bold uppercase tracking-wider border border-green-200">
                      {p.status === "approved" ? "Ativo" : "Revisão"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-stone-900 text-sm leading-snug">{p.name}</h3>
                  <p className="text-xs text-stone-500 mt-2">Estoque: {p.qty} kg disponível</p>
                  <p className="text-xs font-bold text-green-800 mt-0.5">{p.price} MZN/kg</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => handleOpenEditProduct(p)}
                    className="py-2.5 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 text-xs font-semibold cursor-pointer"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    className="py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 text-xs font-semibold border border-red-200 cursor-pointer"
                  >
                    🗑️ Apagar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NOVEL FARMER CREATION DIALOG */}
      {isFarmerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in text-stone-900 leading-normal">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                {editingProductId ? "Editar Produto Cooperado" : "Registar Nova Colheita"}
              </h3>
              <button onClick={() => setIsFarmerModalOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">✕</button>
            </div>

            <div className="space-y-3.5 text-xs text-stone-700 font-medium col-gap-2">
              <div>
                <label className="block mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Mandioca fresca colhida no campo"
                  className="w-full text-xs border-2 border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-green-600 bg-white"
                />
              </div>

              <div>
                <label className="block mb-1">Descrição</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Origem, métodos biológicos de cultivo, etc..."
                  rows={2.5}
                  className="w-full text-xs border-2 border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Preço (MZN/kg) *</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Ex: 80"
                    className="w-full text-xs border-2 border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Quantidade (kg) *</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    placeholder="Ex: 500"
                    className="w-full text-xs border-2 border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full border-2 border-stone-200 rounded-xl px-3 py-2 bg-white cursor-pointer focus:outline-none"
                  >
                    <option>Vegetais</option>
                    <option>Frutas</option>
                    <option>Cereais</option>
                    <option>Tubérculos</option>
                    <option>Leguminosas</option>
                    <option>Hortaliças</option>
                    <option>Nozes & Sementes</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Ícone Emoji</label>
                  <select
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full border-2 border-stone-200 rounded-xl px-3 py-2 bg-white cursor-pointer focus:outline-none text-base"
                  >
                    <option value="🥬 flex">🥬 Folhosos</option>
                    <option value="🍅">🍅 Tomate</option>
                    <option value="🥕">🥕 Cenoura</option>
                    <option value="🌽">🌽 Milho</option>
                    <option value="🍠">🍠 Batatas</option>
                    <option value="🥜">🥜 Amendoim</option>
                    <option value="🍋">🍋 Limões</option>
                    <option value="🥭">🥭 Manga</option>
                    <option value="🍌">🍌 Bananas</option>
                    <option value="🌶️">🌶️ Piri-piri</option>
                    <option value="🫘">🫘 Feijões</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-3 flex gap-2">
              <button
                onClick={() => setIsFarmerModalOpen(false)}
                className="flex-1 py-1.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Guardar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
