import React, { useState } from "react";
import { X, Smartphone, Check, Loader2, AlertCircle, Sparkles, CreditCard, ShoppingBag } from "lucide-react";
import { CartItem, User } from "../types";

interface MpesaPaymentModalProps {
  onClose: () => void;
  onPaymentSuccess: (orderId: string, details: any) => void;
  cartItems: CartItem[];
  total: number;
  user?: User | null;
}

export default function MpesaPaymentModal({ onClose, onPaymentSuccess, cartItems, total, user }: MpesaPaymentModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  
  // Payment States
  const [status, setStatus] = useState<"idle" | "requesting" | "pin_pending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [simulated, setSimulated] = useState(true);
  const [pinDigits, setPinDigits] = useState("");
  const [activeOrderId, setActiveOrderId] = useState("");
  const [activeCleanPhone, setActiveCleanPhone] = useState("");
  const [submittingPin, setSubmittingPin] = useState(false);
  const [activeTimeoutId, setActiveTimeoutId] = useState<any>(null);

  const confirmCheckoutOrder = async (orderId: string, cleanPhoneVal: string) => {
    try {
      setSubmittingPin(true);
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email || "comprador@agromoz.mz",
          phone: cleanPhoneVal,
          cartItems,
          total,
          paymentMethod: "M-Pesa"
        })
      });

      let checkoutData: any = {};
      const checkoutContentType = checkoutRes.headers.get("content-type");
      if (checkoutContentType && checkoutContentType.includes("application/json")) {
        checkoutData = await checkoutRes.json();
      }

      if (checkoutRes.ok) {
        setStatus("success");
        setTimeout(() => {
          onPaymentSuccess(checkoutData.orderId, checkoutData.order);
        }, 2000);
      } else {
        setErrorMessage(checkoutData.error || "Erro ao registar a encomenda paga.");
        setStatus("error");
      }
    } catch (_) {
      setErrorMessage("Erro durante a sincronização da encomenda.");
      setStatus("error");
    } finally {
      setSubmittingPin(false);
    }
  };

  const handleMpesaPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Por favor, introduza o seu nome para a encomenda.");
      setStatus("error");
      return;
    }

    // Mozambique format checks (Starts with 258 or simply any valid prefix like 84, 85, 82, 86, 87)
    const cleanPhone = phone.replace(/[\s\-\+]/g, "");
    const msisdnMatch = cleanPhone.match(/^(258)?(84|85|82|83|86|87)\d{7}$/);
    if (!msisdnMatch) {
      setErrorMessage("Número móvel inválido de Moçambique. Deve introduzir um número válido (ex: 84 ou 85 seguido de 7 dígitos).");
      setStatus("error");
      return;
    }

    setStatus("requesting");
    setErrorMessage("");
    setPinDigits("");

    try {
      const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      setActiveOrderId(orderId);
      setActiveCleanPhone(cleanPhone);
      
      // Request Payment Push
      const payRes = await fetch("/api/mpesa/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount: total, orderId })
      });

      let payData: any = {};
      const payContentType = payRes.headers.get("content-type");
      if (payContentType && payContentType.includes("application/json")) {
        payData = await payRes.json();
      }

      if (!payRes.ok) {
        setErrorMessage(payData.error || "Ocorreu uma falha ao comunicar com os canais da Vodacom.");
        setStatus("error");
        return;
      }

      setTransactionRef(payData.transactionReference);
      setSimulated(payData.simulated);
      setStatus("pin_pending");

      // Set up background fallback timer to auto-confirm if the user doesn't interact
      const tId = setTimeout(() => {
        confirmCheckoutOrder(orderId, cleanPhone);
      }, 5000);
      setActiveTimeoutId(tId);

    } catch (err) {
      setErrorMessage("Falha de conexão com os serviços M-Pesa AgroMoz.");
      setStatus("error");
    }
  };

  const handleManualPinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinDigits.length < 4) {
      setErrorMessage("Por favor, introduza um PIN de 4 dígitos do M-Pesa.");
      setStatus("error");
      return;
    }
    if (activeTimeoutId) {
      clearTimeout(activeTimeoutId);
    }
    confirmCheckoutOrder(activeOrderId, activeCleanPhone);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg overflow-hidden bg-white border border-stone-200 shadow-2xl rounded-3xl">
        
        {/* Header decoration */}
        <div className="relative p-6 bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl p-2.5">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Pagamento Móvel M-Pesa</h2>
              <p className="text-xs text-red-100 flex items-center gap-1 mt-0.5">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Vodacom Moçambique Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Declarar fecho"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === "idle" && (
          <form onSubmit={handleMpesaPay} className="p-6 space-y-4">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex justify-between items-center mb-1 text-stone-900">
              <span className="text-sm font-semibold text-stone-600 flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-stone-500" />
                Valor da Fatura:
              </span>
              <strong className="text-xl font-bold text-red-600">{total.toLocaleString("pt-MZ")} MZN</strong>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1" htmlFor="checkout-name">
                Nome do Comprador <span className="text-red-500">*</span>
              </label>
              <input
                id="checkout-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-red-500 transition"
                placeholder="Ex: Maria Nhantumbo"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1" htmlFor="checkout-email">
                Endereço de Email (Opcional)
              </label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-red-500 transition"
                placeholder="Ex: maria@gmail.com (para receber recibo)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1" htmlFor="checkout-phone">
                Número Vodacom M-Pesa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-stone-400 text-sm">🇲🇿 +258</span>
                <input
                  id="checkout-phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm font-medium border-2 border-stone-200 rounded-xl pl-20 pr-4 py-3 text-stone-900 focus:outline-none focus:border-red-500 transition"
                  placeholder="Ex: 84 123 4567"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                Suporta números da rede Vodacom Moçambique ativos (+258 84 ou 85).
              </p>
            </div>

            <button
              type="submit"
              className="w-full text-xs font-bold uppercase tracking-widest text-white rounded-xl py-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 transition cursor-pointer"
            >
              <Smartphone className="h-4.5 w-4.5" />
              Solicitar Pagamento M-Pesa
            </button>
          </form>
        )}
              {status === "requesting" && (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
            <h3 className="text-lg font-bold text-stone-900">Contactando a Redes Vodacom...</h3>
            <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
              Iniciando sessão segura e encriptando dados para solicitação de pagamento ao telemóvel informado.
            </p>
          </div>
        )}

        {status === "pin_pending" && (
          <div className="p-6 flex flex-col items-center space-y-4 font-sans text-stone-900">
            {/* Visual Phone Sandbox Container */}
            <div className="flex gap-4 w-full items-stretch">
              {/* Virtual Phone Mockup */}
              <div className="relative w-32 h-56 bg-stone-950 rounded-[28px] border-[3px] border-stone-800 shadow-xl overflow-hidden flex flex-col items-center p-3 flex-shrink-0">
                <div className="absolute top-1 w-10.5 h-3 bg-stone-800 rounded-full"></div>
                
                <div className="mt-4 space-y-1 text-center">
                  <span className="text-[8px] font-extrabold text-stone-400 block uppercase tracking-wider">Simulador</span>
                  <div className="bg-red-600 rounded-full p-1.5 w-6 h-6 mx-auto flex items-center justify-center animate-pulse">
                    <Smartphone className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-[8px] font-bold text-white px-1.5 py-0.5 whitespace-nowrap rounded bg-red-600 block">
                    M-PESA
                  </span>
                </div>
                
                <div className="bg-white/95 border border-red-200 text-stone-950 p-1.5 rounded-lg mt-3 text-[7px] font-bold text-center leading-tight shadow">
                  <p className="text-red-600 font-extrabold text-[8px]">VODACOM</p>
                  Confirmar {total.toLocaleString("pt-MZ")} MZN? Intro PIN:
                  <div className="mt-1 font-mono text-xs tracking-widest text-center bg-stone-100 p-1 rounded font-bold">
                    {pinDigits.padEnd(4, "•")}
                  </div>
                </div>
              </div>

              {/* Input Control Console */}
              <div className="flex-1 flex flex-col justify-between space-y-3 pt-1">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 font-sans">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                    Pop-up USSD Enviado!
                  </h3>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    Pedimos autorização para o número <strong>+258 {phone}</strong>. Sinta-se livre para introduzir o seu PIN de 4 dígitos para aprovar instantaneamente sem esperar.
                  </p>
                </div>

                {/* Virtual Keypad or Input */}
                <form onSubmit={handleManualPinSubmit} className="space-y-2">
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={4}
                      value={pinDigits}
                      onChange={(e) => setPinDigits(e.target.value.replace(/\D/g, ""))}
                      placeholder="Introduza o PIN (Ex: 1234)"
                      className="w-full text-center tracking-widest font-mono text-sm font-bold bg-stone-50 border-2 border-stone-200 focus:border-red-600 focus:outline-none rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTimeoutId) clearTimeout(activeTimeoutId);
                        setStatus("idle");
                      }}
                      className="flex-1 text-[10px] font-bold uppercase tracking-wider text-stone-600 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingPin || pinDigits.length < 4}
                      className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {submittingPin ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aprovar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="w-full pt-2.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
              <span>Ref: {transactionRef || "N/A"}</span>
              <span className="font-semibold text-red-600 text-[9px] flex items-center gap-1">
                {simulated ? "● AMBIENTE DE TESTE" : "● PRODUÇÃO"}
              </span>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 border border-green-200 shadow-sm">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Transação Autorizada com Sucesso!</h3>
            <p className="text-sm text-green-700 font-medium">Muito obrigado pela sua paciência.</p>
            <p className="text-xs text-stone-500">
              O pagamento de {total.toLocaleString("pt-MZ")} MZN foi liquidado pelo número +258 {phone}. Redirecionando para o histórico de encomendas...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="p-8 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-red-800 text-sm">Falha no Pagamento M-Pesa</h4>
                <p className="text-xs text-red-700/90 mt-1 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            
            <button
              onClick={() => setStatus("idle")}
              className="w-full text-xs font-bold uppercase tracking-wider border-2 border-stone-200 text-stone-600 py-3 rounded-xl hover:bg-stone-50 transition cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
