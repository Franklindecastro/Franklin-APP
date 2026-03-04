/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  DollarSign, 
  Calendar,
  X,
  CheckCircle
} from 'lucide-react';
import { Investment } from '../../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

interface InvestmentsProps {
  investments: Investment[];
  onAdd: (investment: Omit<Investment, 'id' | 'date'>) => void;
  totalInvested: number;
  totalProfit: number;
}

const INVESTMENT_TYPES = ['Ações', 'Cripto', 'Imóveis', 'Renda Fixa', 'Fundos', 'Outros'];

export const Investments = ({ investments, onAdd, totalInvested, totalProfit }: InvestmentsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Ações',
    investedAmount: '',
    profitability: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.investedAmount || isNaN(Number(formData.investedAmount))) return;

    onAdd({
      type: formData.type,
      investedAmount: Number(formData.investedAmount),
      profitability: Number(formData.profitability) || 0,
    });

    setIsModalOpen(false);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
    setFormData({
      type: 'Ações',
      investedAmount: '',
      profitability: '',
    });
  };

  // Mock data for evolution chart
  const evolutionData = [
    { name: 'Jan', value: totalInvested * 0.8 },
    { name: 'Fev', value: totalInvested * 0.9 },
    { name: 'Mar', value: totalInvested + totalProfit },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Investimentos</h2>
          <p className="text-muted">Acompanhe seus ativos e veja seu patrimônio crescer.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>Novo Investimento</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-primary text-white border-none shadow-xl shadow-primary/20">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/10 rounded-xl">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Total Investido</span>
          </div>
          <h4 className="text-4xl font-bold tracking-tighter mb-1">R${totalInvested.toLocaleString('pt-BR')}</h4>
          <p className="text-sm opacity-80">Capital atualmente alocado em todos os ativos.</p>
        </div>
        <div className="card bg-secondary text-white border-none shadow-xl shadow-secondary/20">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/10 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Lucro Estimado</span>
          </div>
          <h4 className="text-4xl font-bold tracking-tighter mb-1">+R${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
          <p className="text-sm opacity-80">Ganhos totais acumulados do seu portfólio.</p>
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="card h-[400px]">
        <h3 className="text-lg font-semibold mb-6">Crescimento do Portfólio</h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={evolutionData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C853" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8E9299', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#8E9299', fontSize: 12}} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#00C853" 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Investments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((inv) => (
          <div key={inv.id} className="card group hover:scale-[1.02] transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-black/5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                <PieChartIcon size={20} />
              </div>
              <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-lg">
                +{inv.profitability}%
              </span>
            </div>
            <h5 className="font-bold text-lg mb-1">{inv.type}</h5>
            <p className="text-sm text-muted mb-4">{format(inv.date, 'dd/MM/yyyy')}</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-muted font-semibold uppercase tracking-wider">Investido</p>
                <p className="text-xl font-bold">R${inv.investedAmount.toLocaleString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted font-semibold uppercase tracking-wider">Lucro</p>
                <p className="text-lg font-bold text-secondary">+R${(inv.investedAmount * inv.profitability / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
        {investments.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted border-2 border-dashed border-black/5 rounded-2xl">
            Nenhum investimento registrado. Comece a construir seu patrimônio!
          </div>
        )}
      </div>

      {/* Add Investment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">Novo Investimento</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted uppercase tracking-wider">Tipo de Ativo</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field appearance-none"
                  >
                    {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted uppercase tracking-wider">Valor Investido</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl">R$</span>
                    <input 
                      type="number" 
                      required
                      value={formData.investedAmount}
                      onChange={(e) => setFormData({ ...formData, investedAmount: e.target.value })}
                      placeholder="0,00"
                      className="input-field pl-12 text-2xl font-bold"
                    />
                  </div>
                </div>

                {/* Profitability */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted uppercase tracking-wider">Rentabilidade Esperada (%)</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xl">%</span>
                    <input 
                      type="number" 
                      step="0.1"
                      required
                      value={formData.profitability}
                      onChange={(e) => setFormData({ ...formData, profitability: e.target.value })}
                      placeholder="0.0"
                      className="input-field pr-10 text-xl font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted">Lucro Anual Estimado</span>
                    <span className="text-xl font-bold text-secondary">
                      +R${((Number(formData.investedAmount) || 0) * (Number(formData.profitability) || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full text-lg py-4">
                  Adicionar ao Portfólio
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Snackbar */}
      <AnimatePresence>
        {showSnackbar && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="text-secondary" size={24} />
            <span className="font-medium">Investimento adicionado com sucesso!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
