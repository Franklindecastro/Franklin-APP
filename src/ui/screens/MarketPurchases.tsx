import * as React from 'react';
import { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronRight, 
  X, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ArrowLeft,
  ListTodo,
  CheckSquare,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { MarketPurchase, MarketItem, ShoppingListItem } from '../../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

interface MarketPurchasesProps {
  purchases: MarketPurchase[];
  shoppingListItems: ShoppingListItem[];
  onAdd: (purchase: Omit<MarketPurchase, 'id'>) => void;
  onDelete: (id: string) => void;
  onAddShoppingItem: (item: Omit<ShoppingListItem, 'id' | 'createdDate' | 'isChecked'>) => void;
  onUpdateShoppingItem: (id: string, updates: Partial<ShoppingListItem>) => void;
  onDeleteShoppingItem: (id: string) => void;
  onFinalizeShoppingList: (marketName: string, note?: string) => void;
  onClearShoppingList: () => void;
  stats: any;
  preferences: any;
}

const MARKET_CATEGORIES = ['Hortifruti', 'Carnes', 'Limpeza', 'Higiene', 'Bebidas', 'Laticínios', 'Padaria', 'Mercearia', 'Outros'];

export const MarketPurchases = ({ 
  purchases, 
  shoppingListItems,
  onAdd, 
  onDelete, 
  onAddShoppingItem,
  onUpdateShoppingItem,
  onDeleteShoppingItem,
  onFinalizeShoppingList,
  onClearShoppingList,
  stats, 
  preferences 
}: MarketPurchasesProps) => {
  const [view, setView] = useState<'list' | 'new' | 'analysis' | 'shopping-list'>('list');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // New Shopping Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Mercearia');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);

  // New Purchase Form State
  const [marketName, setMarketName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [items, setItems] = useState<Omit<MarketItem, 'id' | 'totalPrice'>[]>([]);

  const currentTotal = useMemo(() => 
    items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
  [items]);

  const addItem = () => {
    setItems([...items, { name: '', category: 'Mercearia', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Omit<MarketItem, 'id' | 'totalPrice'>, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = () => {
    if (!marketName || items.length === 0) return;

    const finalItems: MarketItem[] = items.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      totalPrice: item.quantity * item.unitPrice
    }));

    onAdd({
      marketName,
      purchaseDate: new Date(purchaseDate).getTime(),
      totalAmount: currentTotal,
      items: finalItems,
      note
    });

    setSnackbarMessage('Compra registrada com sucesso!');
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
    setView('list');
    resetForm();
  };

  const resetForm = () => {
    setMarketName('');
    setPurchaseDate(format(new Date(), 'yyyy-MM-dd'));
    setNote('');
    setItems([]);
  };

  const handleAddShoppingItem = () => {
    if (!newItemName) return;
    onAddShoppingItem({
      name: newItemName,
      category: newItemCategory,
      quantity: newItemQty,
      estimatedUnitPrice: newItemPrice
    });
    setNewItemName('');
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const handleFinalizeList = () => {
    if (!marketName) {
      setSnackbarMessage('Por favor, informe o nome do mercado.');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      return;
    }
    onFinalizeShoppingList(marketName, note);
    setSnackbarMessage('Compra registrada com sucesso!');
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
    setView('list');
    resetForm();
  };

  const spendingDiff = stats.totalMarketExpenses - stats.prevTotalMarketExpenses;
  const spendingDiffPercent = stats.prevTotalMarketExpenses > 0 
    ? (spendingDiff / stats.prevTotalMarketExpenses) * 100 
    : 0;

  if (view === 'new') {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nova Compra</h2>
            <p className="text-muted">Registre os detalhes da sua ida ao mercado.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted uppercase tracking-wider">Nome do Mercado</label>
                  <input 
                    type="text" 
                    value={marketName}
                    onChange={(e) => setMarketName(e.target.value)}
                    className="input-field"
                    placeholder="Ex: Carrefour, Pão de Açúcar"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted uppercase tracking-wider">Data</label>
                  <input 
                    type="date" 
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted uppercase tracking-wider">Observação</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Alguma nota sobre a compra..."
                />
              </div>
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Itens da Compra</h3>
                <button onClick={addItem} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                  <Plus size={16} />
                  Adicionar Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index} 
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-black/5 rounded-xl relative group"
                  >
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase">Produto</label>
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium"
                        placeholder="Nome do item"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase">Categoria</label>
                      <select 
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm"
                      >
                        {MARKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase">Qtd</label>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        className="w-full bg-transparent border-none focus:ring-0 p-0"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase">Preço Un.</label>
                      <input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                        className="w-full bg-transparent border-none focus:ring-0 p-0"
                      />
                    </div>
                    <button 
                      onClick={() => removeItem(index)}
                      className="absolute -right-2 -top-2 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
                {items.length === 0 && (
                  <div className="py-12 text-center text-muted border-2 border-dashed border-black/5 rounded-2xl">
                    Adicione itens para começar.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-primary text-white border-none sticky top-8">
              <h3 className="text-xl font-bold mb-6">Resumo da Compra</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm opacity-80">
                  <span>Total de Itens</span>
                  <span>{items.length}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-end">
                  <span className="text-sm opacity-80">Valor Total</span>
                  <span className="text-3xl font-bold">R${currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <button 
                onClick={handleSave}
                disabled={!marketName || items.length === 0}
                className="w-full py-4 bg-secondary text-white rounded-xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:hover:scale-100"
              >
                Salvar Compra
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'shopping-list') {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Lista de Compras</h2>
            <p className="text-muted">Prepare sua lista antes de ir ao mercado.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Add Item Form */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Adicionar Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase">Produto</label>
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="input-field py-2"
                    placeholder="Nome do item"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddShoppingItem()}
                  />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase">Categoria</label>
                  <select 
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="input-field py-2"
                  >
                    {MARKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase">Qtd</label>
                  <input 
                    type="number" 
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="input-field py-2"
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <button 
                    onClick={handleAddShoppingItem}
                    disabled={!newItemName}
                    className="btn-primary w-full py-2 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* List Items */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Itens na Lista</h3>
                <button 
                  onClick={onClearShoppingList}
                  className="text-error text-sm font-bold hover:underline"
                >
                  Limpar Lista
                </button>
              </div>

              <div className="space-y-3">
                {shoppingListItems.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.id} 
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${item.isChecked ? 'bg-black/5 opacity-60' : 'bg-black/5'}`}
                  >
                    <button 
                      onClick={() => onUpdateShoppingItem(item.id, { isChecked: !item.isChecked })}
                      className={`p-1 rounded-lg transition-all ${item.isChecked ? 'text-secondary' : 'text-muted'}`}
                    >
                      {item.isChecked ? <CheckSquare size={24} /> : <Square size={24} />}
                    </button>
                    <div className="flex-1">
                      <p className={`font-bold ${item.isChecked ? 'line-through' : ''}`}>{item.name}</p>
                      <p className="text-xs text-muted uppercase tracking-wider">{item.category} • {item.quantity} un.</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-xs text-muted uppercase tracking-widest">Est.</p>
                      <p className="font-bold">R${(item.quantity * item.estimatedUnitPrice).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => onDeleteShoppingItem(item.id)}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
                {shoppingListItems.length === 0 && (
                  <div className="py-12 text-center text-muted border-2 border-dashed border-black/5 rounded-2xl">
                    Sua lista está vazia. Comece adicionando itens acima.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-primary text-white border-none sticky top-8">
              <h3 className="text-xl font-bold mb-6">Finalizar Compra</h3>
              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-70 uppercase">Mercado</label>
                  <input 
                    type="text" 
                    value={marketName}
                    onChange={(e) => setMarketName(e.target.value)}
                    className="w-full bg-white/10 border-none rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-secondary"
                    placeholder="Onde você está comprando?"
                  />
                </div>
                <div className="flex justify-between text-sm opacity-80 mt-6">
                  <span>Itens Marcados</span>
                  <span>{shoppingListItems.filter(i => i.isChecked).length} / {shoppingListItems.length}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-end">
                  <span className="text-sm opacity-80">Total Estimado</span>
                  <span className="text-3xl font-bold">R${stats.shoppingListTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <button 
                onClick={handleFinalizeList}
                disabled={!marketName || shoppingListItems.filter(i => i.isChecked).length === 0}
                className="w-full py-4 bg-secondary text-white rounded-xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:hover:scale-100"
              >
                Finalizar e Salvar
              </button>
              <p className="text-[10px] text-center mt-4 opacity-60">
                Isso criará um registro de compra e limpará sua lista.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'analysis') {
    const COLORS = ['#1E2A38', '#00C853', '#FF5252', '#F27D26', '#7C3AED', '#EC4899', '#06B6D4', '#F59E0B', '#6B7280'];
    
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Análise de Mercado</h2>
            <p className="text-muted">Entenda seus padrões de consumo.</p>
          </div>
        </div>

        {/* Smart Alert */}
        {spendingDiffPercent !== 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card border-none flex items-center gap-4 ${spendingDiffPercent > 0 ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}
          >
            <div className={`p-3 rounded-xl ${spendingDiffPercent > 0 ? 'bg-error text-white' : 'bg-secondary text-white'}`}>
              {spendingDiffPercent > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div>
              <p className="font-bold text-lg">
                {spendingDiffPercent > 0 
                  ? `Seus gastos no mercado aumentaram ${spendingDiffPercent.toFixed(1)}% este mês.` 
                  : `Parabéns! Seus gastos no mercado diminuíram ${Math.abs(spendingDiffPercent).toFixed(1)}% este mês.`}
              </p>
              <p className="text-sm opacity-80">Comparado ao mês anterior (R${stats.prevTotalMarketExpenses.toLocaleString()})</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Média por Compra</p>
            <h4 className="text-2xl font-bold">R${(stats.totalMarketExpenses / (stats.currentMonthMarketPurchases.length || 1)).toFixed(2)}</h4>
          </div>
          <div className="card">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Produto Favorito</p>
            <h4 className="text-2xl font-bold truncate">{stats.mostPurchasedItem?.name || '---'}</h4>
            <p className="text-xs text-muted">{stats.mostPurchasedItem?.count || 0} unidades compradas</p>
          </div>
          <div className="card">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Total de Itens</p>
            <h4 className="text-2xl font-bold">
              {stats.currentMonthMarketPurchases.reduce((sum: number, p: any) => sum + p.items.length, 0)}
            </h4>
          </div>
          <div className="card">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Maior Gasto</p>
            <h4 className="text-2xl font-bold text-error">
              {stats.marketExpensesByCategory.sort((a: any, b: any) => b.value - a.value)[0]?.name || '---'}
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card h-[400px]">
            <h3 className="text-lg font-semibold mb-6">Gastos por Categoria</h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={stats.marketExpensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.marketExpensesByCategory.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card h-[400px]">
            <h3 className="text-lg font-semibold mb-6">Comparativo Mensal</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={[
                { name: 'Mês Anterior', value: stats.prevTotalMarketExpenses },
                { name: 'Mês Atual', value: stats.totalMarketExpenses }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8E9299', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8E9299', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <Cell fill="#1E2A38" />
                  <Cell fill="#00C853" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Mercado</h2>
          <p className="text-muted font-medium">Gerencie seus gastos com supermercado e analise seu consumo.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setView('analysis')}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
          >
            <BarChartIcon size={18} />
            <span>Análise</span>
          </button>
          <div className="relative group">
            <button 
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Plus size={18} />
              <span className="text-sm font-black uppercase tracking-widest">Novo</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl shadow-2xl border border-white/10 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 backdrop-blur-xl">
              <button 
                onClick={() => setView('new')}
                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors"
              >
                <div className="p-2 bg-accent/10 text-accent rounded-lg">
                  <ShoppingCart size={18} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Compra Direta</span>
              </button>
              <button 
                onClick={() => setView('shopping-list')}
                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors"
              >
                <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                  <ListTodo size={18} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Lista de Compras</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shopping List Card (if items exist) */}
      {shoppingListItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-secondary/5 border-secondary/20 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-secondary text-white rounded-2xl shadow-lg shadow-secondary/20">
              <ListTodo size={28} />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase tracking-tight">Lista de Compras Ativa</h3>
              <p className="text-xs text-muted font-medium">
                {shoppingListItems.filter(i => i.isChecked).length} de {shoppingListItems.length} itens marcados • Total est: R${stats.shoppingListTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setView('shopping-list')}
            className="px-6 py-3 bg-surface border border-white/10 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <span>Abrir Lista</span>
            <ChevronRight size={16} />
          </button>
        </motion.div>
      )}

      {/* Budget Control Card */}
      <div className="card bg-surface border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 text-accent rounded-xl">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tight">Orçamento Mensal</h3>
              <p className="text-[10px] text-muted font-black uppercase tracking-widest">Meta: R${preferences.marketBudget.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-ink">R${stats.totalMarketExpenses.toLocaleString()}</p>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">{stats.marketBudgetProgress.toFixed(1)}% utilizado</p>
          </div>
        </div>
        
        <div className="w-full h-2 bg-background rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(stats.marketBudgetProgress, 100)}%` }}
            className={`h-full transition-all ${
              stats.marketBudgetProgress > 100 ? 'bg-error' : 
              stats.marketBudgetProgress > 80 ? 'bg-amber-500' : 'bg-accent'
            }`}
          />
        </div>

        {stats.marketBudgetProgress > 100 && (
          <div className="flex items-center gap-2 text-error text-[10px] font-black uppercase tracking-widest">
            <AlertTriangle size={14} />
            Orçamento excedido
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-xl">
              <Calendar size={24} />
            </div>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Mês Selecionado</span>
          </div>
          <h4 className="text-3xl font-black">R${stats.totalMarketExpenses.toLocaleString()}</h4>
          <p className="text-xs text-muted font-medium mt-1">{stats.currentMonthMarketPurchases.length} compras realizadas</p>
        </div>
        <div className="card border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-xl">
              <PieChartIcon size={24} />
            </div>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Foco de Gasto</span>
          </div>
          <h4 className="text-3xl font-black truncate">
            {stats.marketExpensesByCategory.sort((a: any, b: any) => b.value - a.value)[0]?.name || '---'}
          </h4>
          <p className="text-xs text-muted font-medium mt-1">Maior volume de consumo</p>
        </div>
      </div>

      {/* Purchases List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Histórico de Compras</h3>
        <div className="grid grid-cols-1 gap-4">
          {purchases.map((purchase) => (
            <motion.div 
              layout
              key={purchase.id} 
              className="card group hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg">{purchase.marketName}</h5>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {format(purchase.purchaseDate, 'dd/MM/yyyy')}
                      </span>
                      <span>•</span>
                      <span>{purchase.items.length} itens</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-muted font-bold uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-bold">R${purchase.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(purchase.id);
                      }}
                      className="p-2 text-error hover:bg-error/10 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button className="p-2 text-muted hover:bg-black/5 rounded-xl transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {purchases.length === 0 && (
            <div className="py-20 text-center text-muted border-2 border-dashed border-black/5 rounded-3xl">
              Nenhuma compra registrada ainda.
            </div>
          )}
        </div>
      </div>

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
            <span className="font-medium">{snackbarMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
