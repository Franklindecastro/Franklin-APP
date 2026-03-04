/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Tag, 
  CreditCard, 
  X,
  CheckCircle,
  PlusCircle
} from 'lucide-react';
import { TransactionType, Transaction, IncomeSource } from '../../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { IncomeSourceDialog, mapIcon } from '../components/IncomeSourceDialog';

interface TransactionsProps {
  transactions: (Transaction & { source?: IncomeSource })[];
  incomeSources: IncomeSource[];
  onAdd: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  onAddSource: (source: Omit<IncomeSource, 'id' | 'createdDate'>) => void;
}

const CATEGORIES = ['Alimentação', 'Transporte', 'Lazer', 'Compras', 'Saúde', 'Educação', 'Salário', 'Investimento', 'Outros'];
const METHODS = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Pix'];

export const Transactions = ({ transactions, incomeSources, onAdd, onAddSource }: TransactionsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('Transação salva com sucesso!');
  const [formData, setFormData] = useState({
    type: TransactionType.EXPENSE,
    amount: '',
    category: 'Alimentação',
    paymentMethod: 'Dinheiro',
    note: '',
    sourceId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || isNaN(Number(formData.amount))) return;

    if (formData.type === TransactionType.REVENUE && !formData.sourceId) {
      setSnackbarMessage('Por favor, selecione uma fonte de receita.');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      return;
    }

    try {
      onAdd({
        type: formData.type,
        amount: Number(formData.amount),
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        sourceId: formData.type === TransactionType.REVENUE ? formData.sourceId : undefined,
      });

      setIsModalOpen(false);
      setSnackbarMessage('Transação salva com sucesso!');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      setFormData({
        type: TransactionType.EXPENSE,
        amount: '',
        category: 'Alimentação',
        paymentMethod: 'Dinheiro',
        note: '',
        sourceId: '',
      });
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
          <p className="text-muted">Gerencie suas receitas e despesas em um só lugar.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Nova Transação</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Buscar transações..." 
            className="input-field pl-12"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-surface border border-white/10 rounded-xl hover:bg-white/5 transition-all">
          <Filter size={18} />
          <span className="font-medium">Filtrar</span>
        </button>
      </div>

      {/* Transactions List */}
      <div className="card overflow-hidden p-0 border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Método</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Nota</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {t.type === TransactionType.REVENUE && t.source ? (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: t.source.colorHex }}
                        >
                          {(() => {
                            const Icon = mapIcon(t.source.iconName);
                            return <Icon size={18} />;
                          })()}
                        </div>
                      ) : (
                        <div className={`p-2 rounded-lg ${t.type === TransactionType.REVENUE ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                          {t.type === TransactionType.REVENUE ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{t.type === TransactionType.REVENUE && t.source ? t.source.name : format(t.date, 'dd/MM/yyyy')}</span>
                        {t.type === TransactionType.REVENUE && t.source && (
                          <span className="text-[10px] text-muted uppercase tracking-widest">{format(t.date, 'dd/MM/yyyy')}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm px-3 py-1 bg-white/5 rounded-full font-medium">{t.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted">{t.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted italic">{t.note || '-'}</span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.REVENUE ? 'text-secondary' : 'text-error'}`}>
                    {t.type === TransactionType.REVENUE ? '+' : '-'}R${t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
                    Nenhuma transação encontrada. Comece adicionando uma!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-surface w-full max-w-lg rounded-2xl shadow-2xl p-8 overflow-hidden border border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">Nova Transação</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Toggle */}
                <div className="flex gap-2 p-1 bg-background/50 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: TransactionType.REVENUE })}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${formData.type === TransactionType.REVENUE ? 'bg-surface shadow-sm text-secondary' : 'text-muted'}`}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-surface shadow-sm text-error' : 'text-muted'}`}
                  >
                    Despesa
                  </button>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted uppercase tracking-wider">Valor</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0,00"
                      className="input-field pl-12 text-2xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted uppercase tracking-wider">Categoria</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field appearance-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted uppercase tracking-wider">Método de Pagamento</label>
                    <select 
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="input-field appearance-none"
                    >
                      {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Income Source (Only for REVENUE) */}
                {formData.type === TransactionType.REVENUE && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-muted uppercase tracking-wider">Fonte de Receita</label>
                      <button 
                        type="button"
                        onClick={() => setIsSourceModalOpen(true)}
                        className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                      >
                        <PlusCircle size={14} />
                        Nova Fonte
                      </button>
                    </div>
                    <select 
                      value={formData.sourceId}
                      onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                      className="input-field appearance-none bg-background/50"
                      required
                    >
                      <option value="">Selecione uma fonte...</option>
                      {incomeSources.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {incomeSources.length === 0 && (
                      <p className="text-[10px] text-error font-bold">Você precisa criar uma fonte antes de salvar uma receita.</p>
                    )}
                  </div>
                )}

                {/* Note */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted uppercase tracking-wider">Nota (Opcional)</label>
                  <textarea 
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Para que foi isso?"
                    className="input-field min-h-[100px] resize-none"
                  />
                </div>

                <button type="submit" className="btn-primary w-full text-lg py-4">
                  Salvar Transação
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <IncomeSourceDialog 
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onSave={onAddSource}
      />

      {/* Snackbar */}
      <AnimatePresence>
        {showSnackbar && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-accent text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            {snackbarMessage.includes('sucesso') ? (
              <CheckCircle className="text-secondary" size={24} />
            ) : (
              <X className="text-error" size={24} />
            )}
            <span className="font-medium">{snackbarMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
