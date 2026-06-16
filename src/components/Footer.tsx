import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800 font-sans" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
        <div className="space-y-3">
          <h3 className="text-white font-serif text-lg font-bold">🌾 AgroMoz</h3>
          <p className="text-stone-400 leading-relaxed text-[11px]">
            Cooperativa Agrária Digital de Moçambique. Construção robusta e fomento comunitário nacional.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Cooperativa</h4>
          <Link to="/" className="block text-stone-400 hover:text-white transition">Início</Link>
          <Link to="/mercado" className="block text-stone-400 hover:text-white transition">Preços e Produtos</Link>
          <Link to="/sobre" className="block text-stone-400 hover:text-white transition">Registro Histórico Telemetrias</Link>
        </div>
        <div className="space-y-3">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Suporte Local</h4>
          <Link to="/contacto" className="block text-stone-400 hover:text-white transition">Canal Central de Ajuda</Link>
          <span className="block text-stone-500">Email: suporte@agromoz.mz</span>
          <span className="block text-stone-500">Maputo, Nampula e Sofala</span>
        </div>
        <div className="space-y-3">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Acessos Assistidos</h4>
          <p className="text-stone-500 leading-relaxed">
            Diga <strong>"ajuda"</strong> com o comando de voz ativo no microfone no canto de ecrã para comandos audíveis.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 border-t border-stone-800 pt-6 text-center text-[10px] text-stone-500">
        🌱 © 2026 AgroMoz Moçambique. Todos os direitos reservados. Aplicação adaptada aos padrões de acessibilidade WCAG 2.1 AA. Integrado com Supabase e Vodacom M-Pesa.
      </div>
    </footer>
  );
}
