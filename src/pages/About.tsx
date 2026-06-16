import React, { useEffect, useState } from 'react';
import { Globe, RefreshCw, ServerCrash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { VisitorStats } from '../types';

export default function About() {
  const [visitors, setVisitors] = useState<VisitorStats[]>([]);

  const fetchVisitorStats = async () => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setVisitors(data as VisitorStats[]);
      } else {
        // Fallback to old API route if Supabase fails (or is not configured properly)
        const res = await fetch("/api/visitors");
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const d = await res.json();
            setVisitors(d);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching visitor stats:", err);
    }
  };

  useEffect(() => {
    fetchVisitorStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in font-sans text-stone-900">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-serif font-extrabold text-stone-955">Cooperativa Agrária AgroMoz</h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          Fortalecendo as comunidades de Moçambique através de conexões digitais encriptadas e inclusivas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm space-y-3">
          <h3 className="text-base font-bold font-serif text-stone-955 flex items-center gap-2">
            <span className="p-2 bg-green-50 rounded-xl text-lg inline-block text-green-800">🎯</span>
            Objetivo Social da Cooperativa
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            O AgroMoz nasceu em Nampula em parceria com sindicatos rurais. Nosso foco é eliminar intermediários abusivos que canibalizam o ganho financeiro do agricultor. Garantimos que cooperados rurais recebam de imediato por M-Pesa o valor justo de sua labuta.
          </p>
        </div>

        <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm space-y-3">
          <h3 className="text-base font-bold font-serif text-stone-955 flex items-center gap-2">
            <span className="p-2 bg-amber-50 rounded-xl text-lg inline-block text-amber-800">♿</span>
            Compromisso WCAG de Acessibilidade
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Esta ferramenta cumpre as diretivas W3C WCAG 2.1 no patamar duplo A (AA). Oferece controles integrados para aumentar fontes, aumentar contrastes visuais, ler elementos ativos via áudio, e navegar por voz para pessoas com limitações visuais.
          </p>
        </div>
      </div>

      {/* 10 VISITORS TELEMETRY FROM SUPABASE DISPLAY TABLE */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-1.5">
              <Globe className="h-5 w-5 text-green-700" />
              Telemetria de Visitas do Supabase (Últimos 10 Registos Finais)
            </h2>
            <p className="text-[11px] text-stone-500 mt-1 pb-1">
              Como exigido pelo regulamento, registamos até 10 metadados de acessos de clientes (Aparelho, Localização aproximada ou coordenadas, browser, OS, hardware e contagem de tempo de sessão) para segurança.
            </p>
          </div>
          <button
            onClick={fetchVisitorStats}
            className="px-3.5 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 text-xs font-bold text-stone-600 flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Atualizar Dados
          </button>
        </div>

        {visitors.length === 0 ? (
          <div className="text-center py-10 text-stone-400">
            <ServerCrash className="h-8 w-8 mx-auto text-stone-300 mb-2" />
            <p className="text-xs font-semibold">Sem telemetrias armazenadas de momento</p>
            <p className="text-[11px] mt-0.5">Sincronize as suas credenciais Supabase no .env para ativar a gravação em nuvem!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm">
            <table className="w-full text-left font-sans text-xs text-stone-700 select-none">
              <thead className="bg-stone-50 text-stone-550 font-bold">
                <tr className="border-b border-stone-200">
                  <th className="p-3 text-[11px] tracking-wider uppercase">Data / Hora</th>
                  <th className="p-3 text-[11px] tracking-wider uppercase">Dispositivo</th>
                  <th className="p-3 text-[11px] tracking-wider uppercase">Localização / Coordenadas</th>
                  <th className="p-3 text-[11px] tracking-wider uppercase">Navegador</th>
                  <th className="p-3 text-[11px] tracking-wider uppercase text-center">Tempo em Página</th>
                  <th className="p-3 text-[11px] tracking-wider uppercase">Especificações do Sistema</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 font-medium text-stone-800">
                {visitors.slice(0, 10).map((v) => {
                  let sys = {};
                  try {
                    sys = JSON.parse(v.device_spec || "{}");
                  } catch (_) {}
                  return (
                    <tr key={v.id} className="hover:bg-stone-50/50 transition duration-100">
                      <td className="p-3 whitespace-nowrap text-[11px] text-stone-550">
                        {new Date(v.timestamp).toLocaleString("pt-MZ")}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold text-[10px]">
                          💻 {v.device}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-stone-850 truncate max-w-[180px]">
                        📍 {v.location}
                      </td>
                      <td className="p-3 text-stone-600">
                        🌍 {v.browser}
                      </td>
                      <td className="p-3 text-center font-bold text-green-800">
                        ⏱️ {v.session_time}s
                      </td>
                      <td className="p-3 text-stone-400 font-mono text-[10px] truncate max-w-[200px]" title={v.device_spec}>
                        {(sys as any).os || "N/A"} • {(sys as any).screenWidth}x{(sys as any).screenHeight} • Cores: {(sys as any).cores}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
