import React from 'react';
import ContactForm from '../components/ContactForm';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { language } = useSettings();
  const { showToast } = useToast();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-stone-900 leading-relaxed">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-stone-950">Espaço de Atendimento ao Produtor e Cliente</h1>
        <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
          Cooperativa AgroMoz — sede fiscal em Nampula e filiais em Maputo e Sofala. Entre em contacto por canal autenticado.
        </p>
      </div>

      <ContactForm 
        lang={language}
        onSuccess={(msg) => showToast(msg, "success")}
        onError={(msg) => showToast(msg, "error")}
      />
    </div>
  );
}
