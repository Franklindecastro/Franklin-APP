import * as React from 'react';
import { useState } from 'react';
import { Wallet, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onLogin: (email: string) => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 text-ink">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 sm:mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-4 bg-accent rounded-3xl mb-4 sm:mb-6 shadow-2xl shadow-accent/30"
          >
            <Wallet className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-ink mb-2 uppercase">ZENTRO</h1>
          <p className="text-xs sm:text-sm text-muted font-medium tracking-wide">Domine seu fluxo financeiro com inteligência.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 sm:p-8 border-white/10 bg-surface/50 backdrop-blur-xl"
        >
          <div className="flex gap-4 mb-10 bg-background/50 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest ${isLogin ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted hover:text-ink'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest ${!isLogin ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted hover:text-ink'}`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Endereço de E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12 bg-background/50"
                  placeholder="nome@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 bg-background/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-5 text-sm uppercase font-black tracking-[0.3em] flex items-center justify-center gap-3 mt-4 group">
              <span>{isLogin ? 'Autenticar' : 'Criar Zentro'}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-muted leading-relaxed uppercase tracking-tighter">
              Ao continuar, você concorda com nossos <span className="text-accent font-bold cursor-pointer hover:underline">Termos</span> e <span className="text-accent font-bold cursor-pointer hover:underline">Privacidade</span>.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 flex justify-center gap-8">
          <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
            <ShieldCheck size={14} className="text-secondary" />
            Zentro-Safe
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
            <ShieldCheck size={14} className="text-secondary" />
            AES-256
          </div>
        </div>
      </div>
    </div>
  );
};
