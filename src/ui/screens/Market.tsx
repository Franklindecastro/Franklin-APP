import React from 'react';
import { ShoppingCart, Check, History, TrendingDown, TrendingUp, ChevronRight, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketItem } from '../../types';

interface MarketProps {
  items: MarketItem[];
  onToggle: (id: string) => void;
  onFinalize: () => void;
  total: number;
}

export const Market: React.FC<MarketProps> = ({ items, onToggle, onFinalize, total }) => {
  return (
    <div className="flex flex-col gap-6 pb-40 pt-28 px-6">
      {/* Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h2 className="text-2xl font-bold">Smart Market</h2>
        <p className="text-sm zentro-text-secondary">Control your supermarket spending strategically.</p>
      </motion.div>

      {/* Smart Shopping List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Shopping List</h3>
          <span className="text-xs zentro-text-secondary font-bold uppercase tracking-widest">
            {items.filter(i => i.purchased).length}/{items.length} Items
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {items.map((item, idx) => {
              const lastPrice = item.history[item.history.length - 2]?.price || item.estimatedPrice;
              const priceDiff = ((item.estimatedPrice - lastPrice) / lastPrice) * 100;

              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onToggle(item.id)}
                  className={`zentro-card p-4 flex items-center gap-4 cursor-pointer transition-all ${
                    item.purchased ? 'opacity-50 grayscale' : 'opacity-100'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.purchased ? 'bg-zentro-highlight border-zentro-highlight' : 'border-white/10'
                  }`}>
                    {item.purchased && <Check size={14} className="text-white" />}
                  </div>

                  <div className="flex-1">
                    <h4 className={`font-bold ${item.purchased ? 'line-through' : ''}`}>{item.product}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs zentro-text-secondary font-bold uppercase tracking-widest">Qty: {item.quantity}</span>
                      <span className="text-xs zentro-text-secondary font-bold uppercase tracking-widest">${item.estimatedPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className={`flex items-center gap-1 text-xs font-bold ${
                      priceDiff <= 0 ? 'text-zentro-positive' : 'text-zentro-negative'
                    }`}>
                      {priceDiff <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                      {Math.abs(priceDiff).toFixed(1)}%
                    </div>
                    <span className="text-xs zentro-text-secondary">History</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Price Comparison / History Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="zentro-card bg-zentro-highlight/5 border-zentro-highlight/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-zentro-highlight/10 text-zentro-highlight">
            <History size={20} />
          </div>
          <h3 className="text-lg font-bold">Price Intelligence</h3>
        </div>
        <p className="text-sm zentro-text-secondary mb-4">
          Zentro analyzed your history. 3 items in your list are currently at their lowest price in 30 days.
        </p>
        <button className="w-full py-3 rounded-xl bg-zentro-highlight/10 text-zentro-highlight font-bold text-sm uppercase tracking-widest hover:bg-zentro-highlight/20 transition-colors">
          View Detailed Insights
        </button>
      </motion.div>

      {/* Fixed Bottom Card for Estimated Total */}
      <div className="fixed bottom-24 left-6 right-6 z-40">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="zentro-card bg-zentro-highlight p-6 shadow-2xl shadow-zentro-highlight/20"
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-white/70 uppercase font-bold tracking-widest">Estimated cart total</span>
              <h3 className="text-3xl font-bold text-white mt-1">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <button 
              onClick={onFinalize}
              className="bg-white text-zentro-highlight px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-all active:scale-95"
            >
              Finalize
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
