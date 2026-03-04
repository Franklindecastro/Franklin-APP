import * as React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Zap,
  Target,
  ShieldCheck,
  LayoutDashboard,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { TransactionType } from '../../types';
import { format } from 'date-fns';

interface DashboardProps {
  stats: {
    totalIncome: number;
    totalExpenses: number;
    totalBalance: number;
    expensesByCategory: { name: string; value: number }[];
    currentMonthTransactions: any[];
  };
  onQuickAdd: () => void;
}

export const Dashboard = ({ stats, onQuickAdd }: DashboardProps) => {
  // Mock data for line chart (Cash Flow)
  const cashFlowData = [
    { name: '01', income: 4500, expense: 3200 },
    { name: '05', income: 5200, expense: 3100 },
    { name: '10', income: 4800, expense: 3800 },
    { name: '15', income: 6100, expense: 4200 },
    { name: '20', income: 5900, expense: 3900 },
    { name: '25', income: 7200, expense: 4500 },
    { name: '30', income: 8500, expense: 4800 },
  ];

  const financialScore = 82;

  return (
    <div className="space-y-8 pb-12">
      {/* 2️⃣ Main Card – Current Balance */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card bg-gradient-to-br from-surface to-accent/10 border-accent/20 p-8 text-center relative overflow-hidden group"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-700" />
        <p className="text-xs font-bold text-muted uppercase tracking-[0.2em] mb-2">Saldo Atual</p>
        <h2 className={`text-5xl font-black tracking-tighter mb-4 ${stats.totalBalance >= 0 ? 'text-secondary' : 'text-error'}`}>
          R$ {stats.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
          <TrendingUp size={14} className="text-secondary" />
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Resultado do período selecionado</span>
        </div>
      </motion.div>

      {/* 3️⃣ Secondary Cards (Side-by-Side) */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-5 border-secondary/10 hover:border-secondary/30 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-bold text-secondary">+12%</span>
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Receitas</p>
          <p className="text-xl font-bold text-ink">R$ {stats.totalIncome.toLocaleString('pt-BR')}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-5 border-error/10 hover:border-error/30 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-error/10 rounded-xl text-error">
              <TrendingDown size={20} />
            </div>
            <span className="text-[10px] font-bold text-error">-5%</span>
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Despesas</p>
          <p className="text-xl font-bold text-ink">R$ {stats.totalExpenses.toLocaleString('pt-BR')}</p>
        </motion.div>
      </div>

      {/* 4️⃣ Main Chart – Cash Flow */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <LayoutDashboard size={16} className="text-accent" />
            Fluxo Financeiro
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-[10px] text-muted font-bold uppercase">Entrada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-error" />
              <span className="text-[10px] text-muted font-bold uppercase">Saída</span>
            </div>
          </div>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 5️⃣ Category Analysis */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <PieChartIcon size={16} className="text-accent" />
          Análise por Categoria
        </h3>
        <div className="space-y-5">
          {stats.expensesByCategory.slice(0, 4).map((cat, idx) => {
            const percentage = (cat.value / stats.totalExpenses) * 100;
            return (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-ink">{cat.name}</span>
                  <span className="text-muted">{percentage.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-accent rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 6️⃣ ZENTRO Diagnosis (Differentiator) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-accent/5 border-accent/20 p-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 p-4 opacity-10">
          <Zap size={80} className="text-accent" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-accent">Diagnóstico do seu Zentro</h3>
        
        <div className="flex items-center gap-6 mb-8">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle 
                cx="48" cy="48" r="40" fill="transparent" stroke="#5B21B6" strokeWidth="8" 
                strokeDasharray={251.2}
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * financialScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute text-2xl font-black text-ink">{financialScore}</span>
          </div>
          <div>
            <p className="text-lg font-bold text-ink mb-1">Alta performance financeira</p>
            <p className="text-xs text-muted leading-relaxed">Seu capital está sendo otimizado. Continue diversificando seus aportes.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
            <ShieldCheck size={16} className="text-secondary" />
            <span className="text-[10px] font-bold text-muted uppercase">Segurança Alta</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
            <Target size={16} className="text-accent" />
            <span className="text-[10px] font-bold text-muted uppercase">Meta 92% OK</span>
          </div>
        </div>
      </motion.div>

      {/* 7️⃣ Recent Transactions */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-sm font-bold uppercase tracking-widest">Transações Recentes</h3>
          <button className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity">
            Ver Todas <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-3">
          {stats.currentMonthTransactions.slice(0, 4).map((t, idx) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${t.type === TransactionType.REVENUE ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                  {t.type === TransactionType.REVENUE ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">{t.category}</p>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">{format(t.date, 'dd MMM, yyyy')}</p>
                </div>
              </div>
              <p className={`text-sm font-black ${t.type === TransactionType.REVENUE ? 'text-secondary' : 'text-error'}`}>
                {t.type === TransactionType.REVENUE ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
