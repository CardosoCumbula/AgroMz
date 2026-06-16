import React, { useEffect, useState } from "react";
import { X, Mail, Server, PhoneCall, Trash2, ShieldCheck, RefreshCw } from "lucide-react";
import { SystemLog } from "../types";

interface AdminLogsProps {
  onClose: () => void;
}

export default function AdminLogs({ onClose }: AdminLogsProps) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [sysStatus, setSysStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"logs" | "setup">("logs");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [openEmailId, setOpenEmailId] = useState<string | null>(null);

  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dev/logs");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setLogs(data);
        } else {
          console.warn("Expected JSON from /api/dev/logs but received non-JSON type:", contentType);
        }
      }
      
      const statusRes = await fetch("/api/sys/status");
      if (statusRes.ok) {
        const statusContentType = statusRes.headers.get("content-type");
        if (statusContentType && statusContentType.includes("application/json")) {
          const statusData = await statusRes.json();
          setSysStatus(statusData);
        }
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      const res = await fetch("/api/dev/logs/clear", { method: "POST" });
      if (res.ok) {
        setLogs([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000); // Poll every 4s
    return () => clearInterval(interval);
  }, []);

  const getLogIcon = (type: string) => {
    switch (type) {
      case "otp":
        return <Mail className="h-5 w-5 text-amber-500" />;
      case "order":
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case "payment":
        return <PhoneCall className="h-5 w-5 text-red-500" />;
      default:
        return <Server className="h-5 w-5 text-blue-500" />;
    }
  };

  const getLogBg = (type: string) => {
    switch (type) {
      case "otp":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "order":
        return "bg-green-50 border-green-200 text-green-800";
      case "payment":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const sqlSchemaCode = `-- 🔧 SCRIPT SQL PARA BASE DE DADOS SUPABASE (AgroMoz)
-- Cole e execute no SQL Editor do seu novo projeto Supabase

-- 1. Tabela de Telemetria de Visitas
CREATE TABLE IF NOT EXISTS public.visitors (
    id TEXT PRIMARY KEY,
    device TEXT,
    location TEXT,
    browser TEXT,
    session_time NUMERIC,
    device_spec TEXT,
    timestamp TEXT NOT NULL DEFAULT timezone('utc'::text, now())::text
);

-- Habilitar leitura/escrita aberta (ou crie regras customizadas)
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura e Escrita Livre" ON public.visitors FOR ALL USING (true) WITH CHECK (true);

-- 2. Tabela de Formulário de Contactos
CREATE TABLE IF NOT EXISTS public.contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gravação Livre de Contactos" ON public.contacts FOR ALL USING (true) WITH CHECK (true);

-- 3. Tabela de Encomendas & Compras M-Pesa
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    client TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso e Criação de Encomendas" ON public.orders FOR ALL USING (true) WITH CHECK (true);
`;

  const envExampleCode = `# 🔑 SUPABASE CONFIG (Pegue do novo projeto no painel do Supabase da API Settings)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 💳 RESENHA DE CONFIGURAÇÕES M-PESA MOÇAMBIQUE
MPESA_API_KEY=sua_api_key_vodacom
MPESA_PUBLIC_KEY=sua_public_key_pem_da_vodacom_para_encriptar_rsa
MPESA_SERVICE_PROVIDER_CODE=171717
MPESA_ENVIRONMENT=production # ou sandbox

# ✉️ CONFIG DE EMAIL OPCIONAL (Notificações de Código OTP)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
`;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-stone-200 bg-stone-50 p-6 shadow-2xl flex flex-col font-sans">
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-3 bg-stone-50">
        <div>
          <h2 className="text-xl font-bold text-stone-950 flex items-center gap-2">
            🔌 Consola de Controlo Real
          </h2>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Sincronização de Encomendas & Gateways em Produção.
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
          aria-label="Fazer fecho"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {sysStatus && (
        <div className="mb-4 bg-white rounded-xl p-3 border border-stone-200 text-xs text-stone-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-900 font-sans">Canal de Servidor:</span>
            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-mono font-bold text-[9px] uppercase tracking-wider">
              {sysStatus.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Integração Supabase:</span>
            <span className={sysStatus.supabaseConnected ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
              {sysStatus.supabaseConnected ? "✓ LIGADO AO NOVO SUPABASE" : "⚠ FALLBACK EM MEMÓRIA LOCAL"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>M-Pesa Moçambique:</span>
            <span className={sysStatus.env.hasMpesaKey ? "text-red-600 font-bold" : "text-stone-500"}>
              {sysStatus.env.hasMpesaKey ? `✓ PORTAL DE PRODUÇÃO (${sysStatus.env.mpesaEnvironment.toUpperCase()})` : "MODO SIMULADOR SEGURO"}
            </span>
          </div>
        </div>
      )}

      {/* Modern High-Contrast Tabs */}
      <div className="flex border-b border-stone-200 mb-4 text-xs font-bold leading-none bg-stone-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex-1 py-2 text-center rounded-md transition cursor-pointer ${
            activeTab === "logs"
              ? "bg-white text-stone-900 shadow-sm border border-stone-200"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Atividades Ativas ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab("setup")}
          className={`flex-1 py-2 text-center rounded-md transition cursor-pointer ${
            activeTab === "setup"
              ? "bg-white text-stone-900 shadow-sm border border-stone-200"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          ⚙ Manual Técnico & SQL
        </button>
      </div>

      {activeTab === "logs" ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
            <button
              onClick={clearLogs}
              disabled={logs.length === 0}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold cursor-pointer disabled:opacity-50 ml-auto"
            >
              <Trash2 className="h-3 w-3" />
              Limpar Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
                <Mail className="h-10 w-10 text-stone-300 mb-2" />
                <p className="text-xs font-semibold text-stone-600">Nenhum registo disponível ainda</p>
                <p className="text-[10px] mt-1 max-w-[220px] text-stone-400">
                  Envie um código OTP ou efetue uma compra M-Pesa para registar atividades reais de teste instantaneamente.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border text-sm transition hover:shadow-sm ${getLogBg(log.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-stone-200/55 flex-shrink-0">
                      {getLogIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-900">{log.title}</span>
                        <span className="text-[9px] font-semibold opacity-75 text-stone-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString("pt-MZ")}
                        </span>
                      </div>
                      <p className="text-[11px] font-normal leading-relaxed text-stone-700 break-words">{log.content}</p>

                      {log.details && log.details.code && (
                        <div className="mt-2 bg-white border border-stone-200 rounded-lg p-2 text-center text-stone-900">
                          <p className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">Código de Segurança OTP</p>
                          <p className="text-xl font-mono tracking-[4px] font-extrabold text-green-700 mt-0.5">
                            {log.details.code}
                          </p>
                        </div>
                      )}

                      {log.details && log.details.items && (
                        <div className="mt-2 bg-white border border-stone-200 rounded-lg p-2 text-[10px] text-stone-700 space-y-1">
                          <p className="font-bold text-stone-900 uppercase text-[8px] text-stone-500 tracking-wider">Itens Pagos:</p>
                          {log.details.items.map((it: any, i: number) => (
                            <div key={i} className="flex justify-between font-mono">
                              <span>{it.emoji} {it.name} ({it.qty}kg)</span>
                              <span>{(it.price * it.qty).toLocaleString("pt-MZ")} MZN</span>
                            </div>
                          ))}
                          <div className="border-t border-stone-100 pt-1 mt-1 flex justify-between font-bold text-stone-950 font-mono text-[11px]">
                            <span>TOTAL:</span>
                            <span className="text-green-700">{log.details.total.toLocaleString("pt-MZ")} MZN</span>
                          </div>
                        </div>
                      )}

                      {log.details && log.details.emailHtml && (
                        <div className="mt-2.5">
                          <button
                            onClick={() => setOpenEmailId(openEmailId === log.id ? null : log.id)}
                            className="w-full text-[10px] font-bold uppercase tracking-wider bg-stone-900 border border-stone-800 text-white hover:bg-stone-800 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm"
                          >
                            <Mail className="h-3 w-3" />
                            {openEmailId === log.id ? "Ocultar Email" : "Ver Email Enviado"}
                          </button>
                          {openEmailId === log.id && (
                            <div className="mt-2 border-2 border-stone-200 rounded-xl overflow-hidden bg-white shadow-inner animate-fade-in">
                              <div className="p-1.5 px-3 bg-stone-100 border-b border-stone-200 text-[9px] text-stone-500 font-bold flex justify-between items-center">
                                <span>Simulador de Caixa de Entrada</span>
                                <span className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold">Simulado</span>
                              </div>
                              <div 
                                className="p-3 overflow-y-auto max-h-60 bg-[#f4f5f0] border-t border-stone-200 text-[11px] leading-relaxed select-text"
                                style={{ transform: "scale(0.98)", transformOrigin: "top left" }}
                                dangerouslySetInnerHTML={{ __html: log.details.emailHtml }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 pb-4">
          <div className="bg-amber-50 border border-amber-200 text-[11px] leading-relaxed rounded-xl p-3 text-amber-900">
            <strong className="block font-bold text-amber-950 mb-0.5">ℹ️ Reconstrução de Ambiente</strong>
            A sua base de dados anterior crashou. Siga o guia abaixo para configurar um novo projeto Supabase e ativar o M-Pesa oficial de forma permanente sem esforço.
          </div>

          {/* 1. Supabase copy sql block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                1. Tabelas do Novo Supabase (SQL)
              </h3>
              <button
                onClick={() => triggerCopy(sqlSchemaCode, "sql")}
                className="text-[10px] bg-stone-200 hover:bg-stone-300 font-bold px-2 py-1 rounded transition"
              >
                {copiedText === "sql" ? "Copiado! ✓" : "Copiar SQL"}
              </button>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight">
              Abra o painel do seu novo projeto Supabase, aceda a <strong>SQL Editor</strong>, crie uma nova query, cole o código abaixo e clique em <strong>Run</strong>.
            </p>
            <pre className="text-[9px] bg-stone-900 text-stone-200 rounded-lg p-3 overflow-x-auto whitespace-pre font-mono max-h-48 border border-stone-800">
              {sqlSchemaCode}
            </pre>
          </div>

          {/* 2. Environment Variables instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                2. Variáveis de Ambiente (.env)
              </h3>
              <button
                onClick={() => triggerCopy(envExampleCode, "env")}
                className="text-[10px] bg-stone-200 hover:bg-stone-300 font-bold px-2 py-1 rounded transition"
              >
                {copiedText === "env" ? "Copiado! ✓" : "Copiar Variáveis"}
              </button>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight">
              Adicione estas chaves no ficheiro <strong>.env</strong> em produção (e nas definições do AI Studio) para ligar o Supabase e M-Pesa ativamente:
            </p>
            <pre className="text-[9px] bg-stone-900 text-stone-200 rounded-lg p-3 overflow-x-auto whitespace-pre font-mono max-h-40 border border-stone-800">
              {envExampleCode}
            </pre>
          </div>

          {/* 3. M-Pesa Security Encryption Info */}
          <div className="space-y-2 bg-white border border-stone-200 p-3 rounded-xl">
            <h3 className="text-xs font-bold text-red-600 flex items-center gap-1.5 uppercase tracking-wider">
              <span>💳 M-Pesa Produção Moçambique</span>
            </h3>
            <p className="text-[10px] text-stone-600 leading-relaxed">
              O gateway oficial M-Pesa da <strong>Vodacom Moçambique</strong> exige segurança militar. O nosso servidor já possui encriptação automatizada <strong>RSA-PKCS1</strong> nativa em Node.js!
            </p>
            <ol className="text-[10px] text-stone-600 space-y-1 pl-4 list-decimal leading-relaxed">
              <li>Adquira o <strong>Public Key PEM</strong> e o <strong>API Key</strong> no portal de desenvolvedores Vodacom MZ.</li>
              <li>Configure o Pem em <code>MPESA_PUBLIC_KEY</code> e a chave em <code>MPESA_API_KEY</code>.</li>
              <li>O nosso servidor fará a cifragem e assinará as chamadas C2B automaticamente em tempo de execução para garantir transações de PIN seguras!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
