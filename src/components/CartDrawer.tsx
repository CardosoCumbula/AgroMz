import React from 'react';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onClose: () => void;
  onOpenCheckout: () => void;
}

export default function CartDrawer({ onClose, onOpenCheckout }: CartDrawerProps) {
  const { cart, updateCartQty, removeFromCart } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
      ></div>

      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left text-stone-900 leading-normal border-l border-stone-200">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-1.5">
            <span>🛒</span> O Meu Carrinho
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition cursor-pointer">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-stone-400">
              <span className="text-5xl mb-2">🛒</span>
              <p className="text-sm font-semibold">O carrinho encontra-se vazio</p>
              <p className="text-xs mt-1">Explore o nosso mercado e adquira batatas doces, milho, banana e mandiocas!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 pb-4 border-b border-stone-100 animate-fade-in text-xs text-stone-750 font-medium">
                <div className="h-14 w-14 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-center text-3xl select-none flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 truncate">{item.name}</p>
                  <p className="text-green-700 font-bold mt-0.5">{item.price} MZN / kg</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => updateCartQty(item.id, -1)}
                      className="px-2 py-0.5 rounded border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-semibold px-1 min-w-[14px] text-center">{item.qty} kg</span>
                    <button 
                      onClick={() => updateCartQty(item.id, 1)}
                      className="px-2 py-0.5 rounded border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-stone-300 hover:text-red-700 self-start transition cursor-pointer"
                  title="Remover"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-stone-600">Subtotal Estimado:</span>
              <strong className="text-base font-bold text-green-800">
                {cart.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString("pt-MZ")} MZN
              </strong>
            </div>

            <div className="bg-white border border-stone-200 p-3 rounded-xl flex items-center gap-2.5 text-[11px] font-medium text-stone-500">
              <ShieldCheck className="h-5 w-5 text-green-700 flex-shrink-0" />
              <span>Sessão segura protegida por checkout de verificação bancária.</span>
            </div>

            <button 
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Smartphone className="h-4 w-4" />
              Pagar Com Vodacom M-Pesa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
