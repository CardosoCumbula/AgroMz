import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, HelpCircle } from "lucide-react";

interface VoiceAssistantProps {
  onNavigate: (page: string) => void;
  onOpenCart: () => void;
  lang: string;
}

export default function VoiceAssistant({ onNavigate, onOpenCart, lang }: VoiceAssistantProps) {
  const [active, setActive] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const recognitionRef = useRef<any>(null);

  const getLanguageCode = () => {
    switch (lang) {
      case "en":
        return "en-US";
      default:
        return "pt-MZ";
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-US" : "pt-PT";
    utterance.rate = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusText("Navegador não suporta controlo de voz. Use o Chrome.");
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 4000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getLanguageCode();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setActive(true);
      setStatusText(lang === "en" ? "Listening..." : "A ouvir... Diga um comando");
      setShowTooltip(true);
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase().trim();
      setStatusText(`"${command}"`);
      handleCommand(command);
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setStatusText("Lamentamos, ocorreu um erro.");
      setActive(false);
      setTimeout(() => setShowTooltip(false), 2000);
    };

    recognition.onend = () => {
      setActive(false);
      setTimeout(() => setShowTooltip(false), 1500);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setActive(false);
  };

  const handleCommand = (text: string) => {
    let alertMsg = "";
    if (
      text.includes("mercado") ||
      text.includes("market") ||
      text.includes("musika") ||
      text.includes("imakethe") ||
      text.includes("maxava")
    ) {
      onNavigate("mercado");
      alertMsg = lang === "en" ? "Opening market page" : "Abrindo página do mercado";
    } else if (
      text.includes("início") ||
      text.includes("home") ||
      text.includes("kaya") ||
      text.includes("ikhaya") ||
      text.includes("kumba")
    ) {
      onNavigate("home");
      alertMsg = lang === "en" ? "Going to home page" : "Indo para o início";
    } else if (
      text.includes("carrinho") ||
      text.includes("cart") ||
      text.includes("bhagi") ||
      text.includes("inqola") ||
      text.includes("nkwama")
    ) {
      onOpenCart();
      alertMsg = lang === "en" ? "Opening shopping cart" : "Abrindo o carrinho de compras";
    } else if (
      text.includes("entrar") ||
      text.includes("login") ||
      text.includes("pinda") ||
      text.includes("ngena")
    ) {
      onNavigate("login");
      alertMsg = lang === "en" ? "Redirecting to login" : "Redirecionando para entrada";
    } else if (
      text.includes("cadastro") ||
      text.includes("sign up") ||
      text.includes("register")
    ) {
      onNavigate("signup");
      alertMsg = lang === "en" ? "Opening registration drawer" : "Abrindo formulário de cadastro";
    } else if (
      text.includes("sobre") ||
      text.includes("about") ||
      text.includes("cooperativa")
    ) {
      onNavigate("sobre");
      alertMsg = lang === "en" ? "Opening about description" : "Navegando para a cooperativa AgroMoz";
    } else if (
      text.includes("contacto") ||
      text.includes("falar") ||
      text.includes("contact")
    ) {
      onNavigate("contacto");
      alertMsg = lang === "en" ? "Going to contact portal" : "Abrindo formulário de contacto";
    } else if (text.includes("ajuda") || text.includes("help") || text.includes("socorro")) {
      alertMsg = lang === "en" ? "Say home, market, cart, or contact to navigate." : "Diga: início, mercado, carrinho, ou contacto para navegar.";
    } else {
      alertMsg = lang === "en" ? "Unhandled command. Try 'help'" : "Comando não reconhecido. Deseja obter ajuda?";
    }

    speak(alertMsg);
  };

  const handleToggle = () => {
    if (active) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 font-sans">
      {showTooltip && (
        <div className="bg-stone-900 border border-stone-800 text-white text-xs px-3.5 py-2.5 rounded-2xl shadow-xl max-w-[220px] text-center leading-relaxed animate-fade-in-up">
          <p className="font-semibold text-green-400 flex items-center gap-1 justify-center mb-0.5">
            <Volume2 className="h-4 w-4" />
            Voz AgroMoz Activa
          </p>
          <p>{statusText}</p>
        </div>
      )}
      
      <button
        onClick={handleToggle}
        className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-2xl transition hover:scale-105 active:scale-95 cursor-pointer relative ${
          active ? "bg-red-600 animate-pulse" : "bg-green-700 hover:bg-green-800"
        }`}
        aria-label={active ? "Parar assistente de voz" : "Iniciar assistente de voz"}
        title="Controlo de Voz"
      >
        {active ? <MicOff className="h-6 w-6 animate-pulse" /> : <Mic className="h-6 w-6" />}
        {active && (
          <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25"></span>
        )}
      </button>
    </div>
  );
}
