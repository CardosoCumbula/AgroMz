import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const isSignup = location.pathname === '/signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'buyer' | 'farmer'>('buyer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (!fullName || !email || !password) {
          showToast('Preencha todos os campos obrigatórios.', 'error');
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            }
          }
        });

        if (error) throw error;
        
        // Profiles are handled by trigger or AuthContext will fallback until trigger syncs.
        // We'll create the profile manually if no trigger exists.
        if (data.user) {
          await supabase.from('profiles').insert([{
            id: data.user.id,
            full_name: fullName,
            role: role
          }]).single();
        }

        showToast('Registo efetuado com Sucesso! Por favor confirme o seu email.', 'success');
        navigate('/');

      } else {
        if (!email || !password) {
          showToast('Preencha todos os campos obrigatórios.', 'error');
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        showToast('Sessão iniciada com sucesso!', 'success');
        navigate('/');
      }
    } catch (err: any) {
      showToast(err.message || 'Ocorreu um erro durante a autenticação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-3xl p-8 shadow-xl animate-fade-in font-sans text-stone-950 my-10">
      <div className="text-center mb-6">
        <span className="text-3xl">🌾</span>
        <h1 className="text-2xl font-bold font-serif mt-2">
          {isSignup ? 'Criar Conta Comercial' : 'Entrar na Plataforma'}
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          {isSignup ? 'Cadastre os seus produtos ou inicie as suas compras agora' : 'Acesso livre para agricultores e compradores de Moçambique'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Maria Nhantumbo"
              className="w-full text-sm border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-green-600"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Endereço de Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full text-sm border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Palavra-passe *</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-green-600"
          />
        </div>

        {isSignup && (
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 mb-2">Qual o seu papel comercial? *</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition ${role === 'buyer' ? 'border-green-700 bg-green-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                <input type="radio" name="signup-role" value="buyer" checked={role === 'buyer'} onChange={() => setRole('buyer')} className="sr-only" />
                <span className="text-xl">🛒</span>
                <span className="text-xs font-bold text-stone-900 mt-1">Comprador</span>
                <span className="text-[9px] text-stone-400 mt-0.5">Adquirir produtos</span>
              </label>
              <label className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition ${role === 'farmer' ? 'border-green-700 bg-green-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                <input type="radio" name="signup-role" value="farmer" checked={role === 'farmer'} onChange={() => setRole('farmer')} className="sr-only" />
                <span className="text-xl">👨‍🌾</span>
                <span className="text-xs font-bold text-stone-900 mt-1">Agricultor</span>
                <span className="text-[9px] text-stone-400 mt-0.5">Vender colheitas</span>
              </label>
            </div>
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full text-xs font-bold uppercase tracking-widest bg-green-700 hover:bg-green-800 disabled:bg-stone-400 text-white rounded-xl py-4 transition cursor-pointer mt-2"
        >
          {loading ? 'Processando...' : (isSignup ? 'Cadastrar Conta' : 'Autenticar Entrada')}
        </button>
      </form>

      <p className="text-center text-xs text-stone-500 mt-5">
        {isSignup ? 'Já faz parte da cooperativa? ' : 'Ainda não tem conta? '}
        <button onClick={() => navigate(isSignup ? '/login' : '/signup')} className="text-green-700 font-bold hover:underline cursor-pointer">
          {isSignup ? 'Faça Login' : 'Criar Conta'}
        </button>
      </p>
    </div>
  );
}
