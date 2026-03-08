import * as React from 'react';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  PieChart, 
  User, 
  Wallet, 
  Calendar, 
  ShoppingCart, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userEmail?: string;
  selectedDate: number;
  onDateChange: (date: number) => void;
}

export const Layout = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  userEmail,
  selectedDate,
  onDateChange
}: LayoutProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePrevMonth = () => {
    onDateChange(subMonths(new Date(selectedDate), 1).getTime());
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(new Date(selectedDate), 1).getTime());
  };

  const handleCurrentMonth = () => {
    onDateChange(startOfMonth(new Date()).getTime());
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden text-ink">
      {/* Compact Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-accent p-1.5 rounded-lg shadow-lg shadow-accent/20">
            <Wallet className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-ink">ZENTRO</h1>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted">Olá, Franklin 👋</span>
              <span className="text-[8px] text-muted/50 uppercase tracking-tighter">Domine seu Zentro</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
              {format(new Date(selectedDate), 'MMMM yyyy', { locale: ptBR })}
            </span>
          </div>
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="p-2 bg-surface rounded-xl border border-white/5 text-muted hover:text-ink transition-colors"
          >
            <Calendar size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 h-16 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center justify-around px-2 z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === 'dashboard' ? 'text-accent scale-110' : 'text-muted hover:text-ink'}`}
        >
          <LayoutDashboard size={18} />
          <span className="text-[9px] font-medium hidden xs:block">Início</span>
          {activeTab === 'dashboard' && <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-accent rounded-full mt-0.5" />}
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === 'transactions' ? 'text-accent scale-110' : 'text-muted hover:text-ink'}`}
        >
          <ArrowUpRight size={18} />
          <span className="text-[9px] font-medium hidden xs:block">Fluxo</span>
          {activeTab === 'transactions' && <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-accent rounded-full mt-0.5" />}
        </button>
        <button 
          onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === 'market' ? 'text-accent scale-110' : 'text-muted hover:text-ink'}`}
        >
          <ShoppingCart size={18} />
          <span className="text-[9px] font-medium hidden xs:block">Mercado</span>
          {activeTab === 'market' && <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-accent rounded-full mt-0.5" />}
        </button>
        <button 
          onClick={() => setActiveTab('investments')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === 'investments' ? 'text-accent scale-110' : 'text-muted hover:text-ink'}`}
        >
          <TrendingUp size={18} />
          <span className="text-[9px] font-medium hidden xs:block">Ativos</span>
          {activeTab === 'investments' && <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-accent rounded-full mt-0.5" />}
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === 'reports' ? 'text-accent scale-110' : 'text-muted hover:text-ink'}`}
        >
          <PieChart size={18} />
          <span className="text-[9px] font-medium hidden xs:block">Análise</span>
          {activeTab === 'reports' && <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-accent rounded-full mt-0.5" />}
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === 'settings' ? 'text-accent scale-110' : 'text-muted hover:text-ink'}`}
        >
          <User size={18} />
          <span className="text-[9px] font-medium hidden xs:block">Perfil</span>
          {activeTab === 'settings' && <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-accent rounded-full mt-0.5" />}
        </button>
      </nav>

      {/* Calendar Modal */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalendarOpen(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-surface w-full max-w-xs rounded-2xl shadow-2xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest">Selecionar Período</h3>
                <button onClick={() => setIsCalendarOpen(false)} className="p-1.5 hover:bg-white/5 rounded-full transition-all">
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted hover:text-ink"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                  <p className="text-lg font-black text-ink capitalize">
                    {format(new Date(selectedDate), 'MMMM', { locale: ptBR })}
                  </p>
                  <p className="text-xs font-bold text-muted tracking-widest">
                    {format(new Date(selectedDate), 'yyyy')}
                  </p>
                </div>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted hover:text-ink"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    handleCurrentMonth();
                    setIsCalendarOpen(false);
                  }}
                  className="w-full py-3 bg-accent text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  Ir para Mês Atual
                </button>
                <button 
                  onClick={() => setIsCalendarOpen(false)}
                  className="w-full py-3 bg-white/5 text-muted rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
