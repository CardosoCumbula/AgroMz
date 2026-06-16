import React, { useState } from "react";
import { Mail, CheckCircle2, AlertTriangle, Send, ShieldAlert, Sparkles } from "lucide-react";

interface ContactFormProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  lang: string;
}

export default function ContactForm({ onSuccess, onError, lang }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  
  // OTP States
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  // Send validation OTP code
  const handleRequestOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onError("Por favor, digite o seu nome primeiro.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      onError("Por favor, introduza um endereço de email válido.");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "Formulário de Contacto" })
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        setOtpSent(true);
        if (data.simulated) {
          setSimulatedCode(data.code);
          onSuccess(`[SIMULADOR] Código de verificação gerado para teste: ${data.code}`);
        } else {
          setSimulatedCode(null);
          onSuccess("Código de verificação OTP solicitado! Verifique a sua caixa de correio.");
        }
      } else {
        onError(data.error || "Lamentamos, ocorreu um erro ao enviar o código OTP.");
      }
    } catch (err) {
      onError("Erro na ligação ao servidor.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify back with backend validation code
  const handleVerifyOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      onError("O código OTP deve possuir 6 dígitos numéricos.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode })
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        setOtpVerified(true);
        onSuccess("Email validado e autenticado com sucesso! Pronto para envio.");
      } else {
        onError(data.error || "Código OTP incorreto ou expirado.");
      }
    } catch (err) {
      onError("Erro de conexão ao servidor.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Submit complete validated form details
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      onError("Por favor, efetue a verificação OTP do seu email primeiro.");
      return;
    }
    if (!message.trim()) {
      onError("Por favor, escreva a sua mensagem agrícola.");
      return;
    }

    setSubmittingForm(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        onSuccess("Obrigado pelo contacto! A sua mensagem foi guardada e validada.");
        // Reset state
        setName("");
        setEmail("");
        setMessage("");
        setOtpCode("");
        setOtpSent(false);
        setOtpVerified(false);
      } else {
        onError(data.error || "Erro ao guardar a mensagem.");
      }
    } catch (err) {
      onError("Erro de comunicação ao servidor.");
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden font-sans">
      <div className="bg-gradient-to-br from-green-800 to-green-950 text-white p-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-green-300 uppercase">
          <Sparkles className="h-4 w-4 animate-pulse" />
          Fale Connosco de Forma Segura
        </div>
        <h2 className="text-2xl font-serif font-semibold mt-2 text-white">Contacto com Validação OTP</h2>
        <p className="text-xs text-green-100/90 mt-1 leading-relaxed">
          Para garantir interações reais no AgroMoz e evitar comunicações fictícias, envie uma mensagem verificando a posse do seu email num piscar de olhos.
        </p>
      </div>

      <form onSubmit={handleSubmitContact} className="p-8 space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5" htmlFor="contact-name">
            Nome Completo <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            required
            disabled={otpSent}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-green-600 focus:ring-3 focus:ring-green-400/20 disabled:bg-stone-50 disabled:text-stone-400 transition"
            placeholder="Ex: Maria Nhantumbo"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5" htmlFor="contact-email">
            Endereço de Email <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="contact-email"
              type="email"
              required
              disabled={otpSent}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 text-sm border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-green-600 focus:ring-3 focus:ring-green-400/20 disabled:bg-stone-50 disabled:text-stone-400 transition"
              placeholder="Ex: maria@gmail.com"
            />
            {!otpVerified && (
              <button
                type="button"
                disabled={sendingOtp || otpSent}
                onClick={handleRequestOtp}
                className="px-4 py-3 rounded-xl border-2 border-green-600 text-green-700 font-bold text-xs uppercase hover:bg-green-50 active:bg-green-100 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                {sendingOtp ? "A enviar..." : otpSent ? "Código Enviado" : "Enviar OTP"}
              </button>
            )}
          </div>
          <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed">
            💡 Precisa de um email ativo. Se simular no sandbox do AgroMoz, abra o <strong>Sandbox Admin Console (ícone lateral)</strong> para copiar o código OTP gerado!
          </p>
        </div>

        {otpSent && !otpVerified && (
          <div className="bg-amber-50 p-4 border border-amber-200 rounded-2xl animate-fade-in space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Verificação OTP Pendente</span>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Enviámos um código temporário de 6 dígitos para o correio de: <strong>{email}</strong>.
            </p>
            {simulatedCode && (
              <div className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-2 rounded-xl">
                🔑 CODIGO DE TESTE (SANDBOX): <span className="font-mono text-xs text-green-850 px-1.5 py-0.5 bg-white border rounded font-extrabold">{simulatedCode}</span>
                <p className="font-normal text-[10px] text-amber-700 mt-1">Insira este código ao lado para simular o recebimento de email com sucesso.</p>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Introduza o código (Ex: 123456)"
                className="flex-1 text-center font-mono text-sm tracking-[6px] border-2 border-amber-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                disabled={verifyingOtp}
                onClick={handleVerifyOtp}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs uppercase transition cursor-pointer"
              >
                {verifyingOtp ? "A validar..." : "Confirmar"}
              </button>
            </div>
          </div>
        )}

        {otpVerified && (
          <div className="bg-green-50 p-3 border border-green-200 rounded-2xl flex items-center gap-2.5 text-xs text-green-800 font-medium">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Email Verificado!</p>
              <p className="text-[11px] text-green-600/90 font-normal">Identidade digital autenticada temporariamente para envio da mensagem.</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5" htmlFor="contact-msg">
            Mensagem Agrícola <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contact-msg"
            rows={4}
            required
            disabled={!otpVerified}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-sm border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-green-600 focus:ring-3 focus:ring-green-400/20 disabled:bg-stone-50 disabled:text-stone-400 transition duration-150 resize-y"
            placeholder={otpVerified ? "Que dúvidas quer esclarecer com a nossa cooperativa de agricultores..." : "🔐 Verifique o seu email com o código OTP para libertar o campo de texto."}
          />
        </div>

        <button
          type="submit"
          disabled={!otpVerified || submittingForm}
          className="w-full text-xs font-bold uppercase tracking-widest text-white rounded-xl py-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-stone-200 disabled:text-stone-400 cursor-pointer disabled:cursor-not-allowed transition"
        >
          <Send className="h-4 w-4" />
          {submittingForm ? "A enviar..." : "Enviar Mensagem de Contacto"}
        </button>
      </form>
    </div>
  );
}
