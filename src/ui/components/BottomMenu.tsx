import React from 'react';
import { LayoutDashboard, Receipt, ShoppingCart, BarChart3, User } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
  { id: 'transactions', icon: Receipt, label: 'Fluxo' },
  { id: 'marketplace', icon: ShoppingCart, label: 'Mercado' },
  { id: 'analysis', icon: BarChart3, label: 'Análise' },
  { id: 'profile', icon: User, label: 'Perfil' },
];

export const BottomMenu: React.FC<BottomMenuProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zentro-card/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-50">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === item.id ? 'text-zentro-highlight' : 'text-zentro-text-secondary'
          }`}
        >
          <div className="relative">
            <item.icon size={24} />
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-zentro-highlight rounded-full"
              />
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
