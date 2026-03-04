/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Target, 
  Shield, 
  Bell, 
  CreditCard,
  CheckCircle,
  Crown,
  Download,
  Upload,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsProps {
  preferences: {
    monthlyGoal: number;
    marketBudget: number;
    isPremium: boolean;
  };
  onUpdate: (prefs: any) => void;
  onExportBackup: () => void;
  onRestoreBackup: (file: File) => Promise<boolean>;
}

export const Settings = ({ preferences, onUpdate, onExportBackup, onRestoreBackup }: SettingsProps) => {
  const [goal, setGoal] = useState(preferences.monthlyGoal.toString());
  const [marketBudget, setMarketBudget] = useState(preferences.marketBudget?.toString() || '1000');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('Configurações atualizadas!');

  const handleSave = () => {
    onUpdate({ 
      monthlyGoal: Number(goal),
      marketBudget: Number(marketBudget)
    });
    setSnackbarMessage('Configurações atualizadas!');
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await onRestoreBackup(file);
      if (success) {
        setSnackbarMessage('Backup restaurado com sucesso!');
      } else {
        setSnackbarMessage('Falha ao restaurar backup. Verifique o arquivo.');
      }
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted">Personalize sua experiência e gerencie preferências.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Monthly Goal */}
          <div className="card border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 text-accent rounded-lg">
                <Target size={20} />
              </div>
              <h3 className="text-lg font-bold">Metas de Gastos</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Meta de Gastos Geral (Mensal)</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">R$</span>
                    <input 
                      type="number" 
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="input-field pl-10 bg-background/50"
                      placeholder="2000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Orçamento Mensal de Mercado</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">R$</span>
                    <input 
                      type="number" 
                      value={marketBudget}
                      onChange={(e) => setMarketBudget(e.target.value)}
                      className="input-field pl-10 bg-background/50"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="btn-primary w-full py-4 uppercase font-black tracking-widest text-sm">Salvar Metas</button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="card border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 text-accent rounded-lg">
                <Database size={20} />
              </div>
              <h3 className="text-lg font-bold">Backup e Restauração</h3>
            </div>
            <div className="space-y-6">
              <p className="text-sm text-muted leading-relaxed">Exporte seus dados para um arquivo JSON ou restaure um backup anterior. Seus dados ficam salvos localmente no seu dispositivo.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={onExportBackup}
                  className="flex items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/5"
                >
                  <div className="p-2 bg-surface rounded-lg group-hover:bg-accent group-hover:text-white transition-all">
                    <Download size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">Exportar Backup</p>
                    <p className="text-[10px] text-muted uppercase tracking-tighter">Salvar dados em JSON</p>
                  </div>
                </button>

                <label className="flex items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group cursor-pointer border border-white/5">
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  <div className="p-2 bg-surface rounded-lg group-hover:bg-accent group-hover:text-white transition-all">
                    <Upload size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">Restaurar Backup</p>
                    <p className="text-[10px] text-muted uppercase tracking-tighter">Importar arquivo JSON</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 text-accent rounded-lg">
                <Bell size={20} />
              </div>
              <h3 className="text-lg font-bold">Notificações</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="font-bold text-sm">Lembrete Diário</p>
                  <p className="text-[10px] text-muted uppercase tracking-tighter">Lembrar-me de registrar gastos às 20:00</p>
                </div>
                <div className="w-12 h-6 bg-secondary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="font-bold text-sm">Alertas de Meta</p>
                  <p className="text-[10px] text-muted uppercase tracking-tighter">Notificar quando eu exceder 80% da minha meta</p>
                </div>
                <div className="w-12 h-6 bg-secondary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Premium */}
        <div className="space-y-8">
          <div className="card bg-accent text-white border-none relative overflow-hidden shadow-2xl shadow-accent/20">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="text-secondary" size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Zentro Premium</span>
              </div>
              <h3 className="text-2xl font-black mb-4 leading-tight">Desbloqueie Análises de Elite</h3>
              <ul className="space-y-4 mb-10 text-sm opacity-90">
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-secondary" />
                  Relatórios PDF Ilimitados
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-secondary" />
                  Categorias Inteligentes
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-secondary" />
                  Sincronização Cloud AES-256
                </li>
              </ul>
              <button 
                onClick={() => onUpdate({ isPremium: true })}
                className="w-full py-5 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-secondary/30"
              >
                {preferences.isPremium ? 'Atualmente Premium' : 'Atualizar Agora'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <AnimatePresence>
        {showSnackbar && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-accent text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="text-secondary" size={24} />
            <span className="font-bold uppercase tracking-widest text-xs">{snackbarMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
