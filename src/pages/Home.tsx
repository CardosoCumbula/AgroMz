import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

export default function Home() {
  const navigate = useNavigate();
  const { products, loading } = useProducts();

  return (
    <div className="space-y-16 animate-fade-in">
      {/* HERO CAROUSEL ADVERTISEMENT */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-stone-900 text-white p-8 md:p-16 flex flex-col justify-center min-h-[500px]">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="relative max-w-xl z-10 space-y-6">
          <span className="bg-green-800 text-green-300 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest border border-green-700/60">
            🇲🇿 Cooperativa Agrícola Digital
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-extrabold leading-tight text-white sm:text-4xl">
            Compre diretamente dos <em className="text-green-300 not-italic">Agricultores</em> locais.
          </h1>
          <p className="text-sm md:text-base text-stone-200/95 leading-relaxed">
            Ligamos compradores urbanos às maiores colheitas rurais de Moçambique. Sem taxas de intermediários. Produtos colhidos no próprio dia, transportados com carinho.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={() => navigate('/mercado')} className="bg-white text-green-900 font-bold px-6 py-3.5 rounded-xl hover:shadow-lg hover:scale-102 transition text-xs uppercase tracking-wider cursor-pointer">
              🛒 Explorar Mercado
            </button>
            <button onClick={() => navigate('/signup')} className="border-2 border-white/60 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition text-xs uppercase tracking-wider cursor-pointer">
              👨‍🌾 Quero Vender Produção
            </button>
          </div>
        </div>
        
        {/* PLATFORM METRICS SHIELD */}
        <div className="mt-12 md:mt-20 border-t border-white/10 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
          <div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-green-300">1.240</h3>
            <p className="text-[10px] uppercase tracking-widest text-stone-300 mt-1">Agricultores Verificados</p>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-green-300">11 Províncias</h3>
            <p className="text-[10px] uppercase tracking-widest text-stone-300 mt-1">Cobertura Nacional</p>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-green-300">8.500+ kg</h3>
            <p className="text-[10px] uppercase tracking-widest text-stone-300 mt-1">Alimentos Vendidos</p>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-green-300">MZN local</h3>
            <p className="text-[10px] uppercase tracking-widest text-stone-300 mt-1">Câmbio de Moçambique</p>
          </div>
        </div>
      </section>

      {/* BENEFITS BENTO GRID */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-serif font-bold text-stone-900">Solução Cooperativa de Alto Impacto</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Desenvolvido para conectar o ecossistema agrário moçambicano à economia global.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-stone-200 p-8 rounded-3xl space-y-4 shadow-sm">
            <span className="p-3 bg-green-50 rounded-2xl block w-fit text-xl">🌱</span>
            <h3 className="text-lg font-bold font-serif text-stone-900">Origem 100% Controlada</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Nenhum armazém intermediário. Mandioca, milho, vegetais frescos e tubérculos colhidos e empacotados pelo próprio agricultor cooperado.
            </p>
          </div>
          <div className="bg-white border border-stone-200 p-8 rounded-3xl space-y-4 shadow-sm">
            <span className="p-3 bg-red-50 rounded-2xl block w-fit text-xl">📱</span>
            <h3 className="text-lg font-bold font-serif text-stone-950">M-Pesa Integrado</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pagamentos simplificados por USSD push. Digite o seu número Vodacom e receba o pop-up instantâneo de PIN no seu telemóvel para liquidar a transação.
            </p>
          </div>
          <div className="bg-white border border-stone-200 p-8 rounded-3xl space-y-4 shadow-sm">
            <span className="p-3 bg-amber-50 rounded-2xl block w-fit text-xl">♿</span>
            <h3 className="text-lg font-bold font-serif text-stone-900">Inclusivo e Acessível</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Painel com leitura de voz e suporte de múltiplos idiomas de Moçambique (Changana, Shona, Zulu) para que ninguém fique de fora.
            </p>
          </div>
        </div>
      </section>

      {/* POPULAR PRODUCTS FEATURE */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">Destaques da Cooperativa</h2>
            <p className="text-xs text-stone-500 mt-1">Colheitas e produções agrícolas populares nesta semana</p>
          </div>
          <button onClick={() => navigate('/mercado')} className="text-xs font-bold text-green-700 hover:text-green-800 hover:underline cursor-pointer">
            Ver Todo o Mercado →
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <p className="text-sm text-stone-500">Carregando destaques do Supabase...</p>
          ) : (
            products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
