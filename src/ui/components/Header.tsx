import React from 'react';
import { Filter } from 'lucide-react';

interface HeaderProps {
  userName: string;
}

export const Header: React.FC<HeaderProps> = ({ userName }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-zentro-bg z-50 px-6 py-4 flex justify-between items-start border-b border-white/5">
      <div>
        <h1 className="text-2xl font-bold tracking-tighter text-zentro-highlight">ZENTRO</h1>
        <div className="mt-1">
          <h2 className="text-lg font-medium">Hello, {userName} 👋</h2>
          <p className="text-sm zentro-text-secondary">Master your Zentro</p>
        </div>
      </div>
      <button className="p-2 rounded-xl bg-zentro-card border border-white/5 text-zentro-text-secondary hover:text-white transition-colors">
        <Filter size={20} />
      </button>
    </header>
  );
};
