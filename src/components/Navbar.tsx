import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { TRANSLATIONS } from '../types';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const { highContrast, setHighContrast, largeText, setLargeText, language, setLanguage } = useSettings();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  const T = (key: keyof typeof TRANSLATIONS['pt']) => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS['pt'];
    return currentDict[key] || TRANSLATIONS['pt'][key] || key;
  };

  const handleLogout = async () => {
    await signOut();
    showToast("Sessão terminada. Até breve!", "info");
    navigate('/');
  };

  return (
    <>
      {/* ACCESSIBILITY UTILITY BAR */}
      <div className="bg-green-900 text-white py-2 px-6 flex flex-wrap items-center justify-between gap-4 border-b border-green-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold uppercase tracking-wider text-green-300">Acessibilidade:</span>
          <button 
            type="button"
            onClick={() => setHighContrast(!highContrast)} 
            className={`border cursor-pointer transition hover:bg-white/10 border-white/30 px-3 py-1 rounded bg-white/5 font-bold ${highContrast ? "bg-white text-green-900" : ""}`}
            aria-pressed={highContrast}
          >
            🌗 Alto Contraste
          </button>
          <button 
            type="button"
            onClick={() => setLargeText(!largeText)} 
            className={`border cursor-pointer transition hover:bg-white/10 border-white/30 px-3 py-1 rounded bg-white/5 font-bold ${largeText ? "bg-white text-green-900" : ""}`}
            aria-pressed={largeText}
          >
            🔠 Texto Grande
          </button>
          <button 
            type="button"
            onClick={() => alert(T("accessibilityInfo"))} 
            className="border cursor-pointer transition hover:bg-white/10 border-white/30 px-3 py-1 rounded bg-white/5 font-bold flex items-center gap-1"
          >
            ♿ Directrizes WCAG 2.1
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="opacity-80">Idioma:</span>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)} 
            className="bg-green-950 text-white border border-green-700 rounded px-2.5 py-1 focus:outline-none text-xs font-semibold"
          >
            <option value="pt">🇲🇿 Português (Moçambique)</option>
            <option value="en">🇬🇧 English</option>
            <option value="sn">ChiShona</option>
            <option value="zu">isiZulu</option>
            <option value="ts">Tsonga/Changana</option>
            <option value="nd">Ndebele</option>
          </select>

          {/* SANDBOX INTEGRATOR PANEL BUTTON */}
          <button
            onClick={() => setIsSandboxOpen(!isSandboxOpen)}
            className="ml-3 bg-red-650 hover:bg-red-700 font-bold px-3 py-1 rounded flex items-center gap-1 animate-pulse cursor-pointer"
          >
            🔌 Sandbox Admin
          </button>
        </div>
      </div>

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-sm font-sans" role="banner">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-green-800 hover:opacity-95 transition cursor-pointer">
            <span className="text-3xl">🌾</span> AgroMoz
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-bold text-stone-600" aria-label="Nível primário">
            <Link to="/" className="px-4 py-2.5 rounded-xl cursor-pointer transition hover:bg-stone-50">
              {T("home")}
            </Link>
            <Link to="/mercado" className="px-4 py-2.5 rounded-xl cursor-pointer transition hover:bg-stone-50">
              {T("mercado")}
            </Link>
            <Link to="/contacto" className="px-4 py-2.5 rounded-xl cursor-pointer transition hover:bg-stone-50">
              Falar Connosco
            </Link>
            <Link to="/sobre" className="px-4 py-2.5 rounded-xl cursor-pointer transition hover:bg-stone-50">
              {T("sobre")}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            
            {/* CART INDICATOR ACTIONS */}
            {(!user || user.role === "buyer") && (
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                aria-label="Carrinho do cliente"
              >
                <span>🛒 {T("cart")}</span>
                {cart.length > 0 && (
                  <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {cart.reduce((s, i) => s + i.qty, 0)}
                  </span>
                )}
              </button>
            )}

            {/* SECTOR DE GESTÃO AUTOMÁTICA DE USUÁRIO */}
            {!user ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer px-4 py-2.5">
                  {T("login")}
                </Link>
                <Link to="/signup" className="text-xs font-bold bg-green-700 hover:bg-green-800 text-white rounded-xl px-4.5 py-2.5 transition cursor-pointer">
                  {T("signup")}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                  <div className="h-7 w-7 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-green-900 leading-none">{user.name}</p>
                    <p className="text-[9px] text-green-600 font-medium tracking-wide scale-95 origin-left uppercase mt-0.5">
                      🌱 {user.role === "buyer" ? "Comprador" : "Agricultor"}
                    </p>
                  </div>
                </div>

                {user.role === "farmer" && (
                  <Link to="/dashboard" className="text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer border-2 border-stone-200 text-stone-600 hover:bg-stone-50">
                    Loja Painel
                  </Link>
                )}

                {user.role === "buyer" && (
                  <Link to="/orders" className="text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer border-2 border-stone-200 text-stone-600 hover:bg-stone-50">
                    Minhas Compras
                  </Link>
                )}

                <button onClick={handleLogout} className="text-xs font-bold border-2 border-red-200 text-red-700 px-4 py-2.5 rounded-xl hover:bg-red-50 transition cursor-pointer">
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
