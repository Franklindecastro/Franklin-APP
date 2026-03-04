import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Landmark, 
  Wallet, 
  CreditCard, 
  Briefcase, 
  Building2, 
  CircleDollarSign, 
  TrendingUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IncomeSource } from '../../types';

interface IncomeSourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (source: Omit<IncomeSource, 'id' | 'createdDate'>) => void;
  editingSource?: IncomeSource;
}

const ICONS = [
  { name: 'account_balance', icon: Landmark },
  { name: 'wallet', icon: Wallet },
  { name: 'payments', icon: CreditCard },
  { name: 'business', icon: Building2 },
  { name: 'work', icon: Briefcase },
  { name: 'attach_money', icon: CircleDollarSign },
  { name: 'trending_up', icon: TrendingUp },
];

const COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
  '#F44336', '#009688', '#3F51B5', '#795548', 
  '#607D8B', '#E91E63', '#CDDC39', '#00BCD4'
];

export const IncomeSourceDialog = ({ isOpen, onClose, onSave, editingSource }: IncomeSourceDialogProps) => {
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('wallet');
  const [colorHex, setColorHex] = useState(COLORS[0]);

  useEffect(() => {
    if (editingSource) {
      setName(editingSource.name);
      setIconName(editingSource.iconName);
      setColorHex(editingSource.colorHex);
    } else {
      setName('');
      setIconName('wallet');
      setColorHex(COLORS[0]);
    }
  }, [editingSource, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), iconName, colorHex });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingSource ? 'Editar Fonte' : 'Nova Fonte de Receita'}</h3>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Nome da Fonte</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Ex: Salário, Freelance, Aluguel"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Ícone</label>
                <div className="flex flex-wrap gap-3">
                  {ICONS.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setIconName(item.name)}
                        className={`p-3 rounded-2xl transition-all ${iconName === item.name ? 'bg-primary text-white shadow-lg' : 'bg-black/5 text-muted hover:bg-black/10'}`}
                      >
                        <IconComp size={24} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Cor</label>
                <div className="grid grid-cols-6 gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setColorHex(color)}
                      className="relative group flex items-center justify-center"
                    >
                      <div 
                        className="w-10 h-10 rounded-full shadow-sm transition-transform group-hover:scale-110"
                        style={{ backgroundColor: color }}
                      />
                      {colorHex === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border-2 border-white shadow-md pointer-events-none" />
                          <Check size={16} className="text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/5 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 font-bold text-muted hover:bg-black/5 rounded-2xl transition-all">
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const mapIcon = (iconName: string) => {
  const found = ICONS.find(i => i.name === iconName);
  return found ? found.icon : Wallet;
};
