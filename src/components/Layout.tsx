import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import MpesaPaymentModal from './MpesaPaymentModal';
import AdminLogs from './AdminLogs';
import VoiceAssistant from './VoiceAssistant';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

// Simple state wrapper for modals that were in App.tsx
export default function Layout() {
  const { highContrast, largeText, language } = useSettings();
  const { isCartOpen, setIsCartOpen, cart } = useCart();
  const { user } = useAuth();
  
  const [isMpesaModalOpen, setIsMpesaModalOpen] = React.useState(false);

  return (
    <div className={`min-h-screen bg-stone-50 text-stone-900 transition-all ${highContrast ? "contrast-150 grayscale" : ""} ${largeText ? "text-lg" : "text-sm"}`}>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8 min-h-[64vh]">
        <Outlet />
      </main>

      <Footer />

      {isCartOpen && (
        <CartDrawer onClose={() => setIsCartOpen(false)} onOpenCheckout={() => setIsMpesaModalOpen(true)} />
      )}

      {isMpesaModalOpen && (
        <MpesaPaymentModal 
          onClose={() => setIsMpesaModalOpen(false)}
          onPaymentSuccess={(id, data) => {
            setIsMpesaModalOpen(false);
            window.location.href = '/orders'; // Simple redirect for now
          }}
          cartItems={cart}
          total={cart.reduce((s, i) => s + (i.price * i.qty), 0)}
          user={user}
        />
      )}

      {/* COMPACT VOICE CONTROL FLOATING ASSISTANT */}
      <VoiceAssistant 
        onNavigate={(p) => window.location.href = `/${p === 'home' ? '' : p}`}
        onOpenCart={() => setIsCartOpen(true)}
        lang={language}
      />
    </div>
  );
}
