import { useState, useEffect, useMemo } from 'react';
import { Transaction, MarketItem, TransactionType, IncomeSource } from '../types';
import { subDays, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const STORAGE_KEY = 'zentro_app_data';

export interface CategoryAnalysis {
  name: string;
  amount: number;
  percentage: number;
  icon: string;
}

export interface ZentroDiagnosis {
  score: number;
  status: 'Excellent' | 'Stable' | 'Critical';
  recommendations: string[];
}

export function useZentroStore() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_transactions');
    return saved ? JSON.parse(saved) : [
      { id: '1', note: 'Salary', amount: 5000, type: TransactionType.REVENUE, category: 'Work', date: new Date().getTime(), paymentMethod: 'Transfer' },
      { id: '2', note: 'Rent', amount: 1200, type: TransactionType.EXPENSE, category: 'Housing', date: new Date().getTime(), paymentMethod: 'Boleto' },
      { id: '3', note: 'Groceries', amount: 450, type: TransactionType.EXPENSE, category: 'Food', date: new Date().getTime(), paymentMethod: 'Card' },
      { id: '4', note: 'Freelance', amount: 800, type: TransactionType.REVENUE, category: 'Work', date: subDays(new Date(), 5).getTime(), paymentMethod: 'Transfer' },
      { id: '5', note: 'Gym', amount: 60, type: TransactionType.EXPENSE, category: 'Health', date: subDays(new Date(), 10).getTime(), paymentMethod: 'Card' },
    ];
  });

  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_income_sources');
    return saved ? JSON.parse(saved) : [
      { id: 's1', name: 'Salário Principal', colorHex: '#10B981', iconName: 'Briefcase', createdDate: new Date().getTime() },
      { id: 's2', name: 'Freelance', colorHex: '#5B21B6', iconName: 'Laptop', createdDate: new Date().getTime() },
    ];
  });

  const [marketItems, setMarketItems] = useState<(MarketItem & { purchased: boolean; history: any[] })[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_market');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'm1', 
        name: 'Organic Milk', 
        quantity: 2, 
        unitPrice: 4.5, 
        totalPrice: 9,
        category: 'Food',
        purchased: false,
        history: [
          { date: subDays(new Date(), 30).getTime(), price: 4.2 },
          { date: subDays(new Date(), 15).getTime(), price: 4.8 },
          { date: new Date().getTime(), price: 4.5 },
        ]
      },
      { 
        id: 'm2', 
        name: 'Avocados', 
        quantity: 4, 
        unitPrice: 1.2, 
        totalPrice: 4.8,
        category: 'Food',
        purchased: false,
        history: [
          { date: subDays(new Date(), 30).getTime(), price: 1.5 },
          { date: subDays(new Date(), 15).getTime(), price: 1.3 },
          { date: new Date().getTime(), price: 1.2 },
        ]
      },
      { 
        id: 'm3', 
        name: 'Coffee Beans', 
        quantity: 1, 
        unitPrice: 18.0, 
        totalPrice: 18,
        category: 'Food',
        purchased: true,
        history: [
          { date: subDays(new Date(), 30).getTime(), price: 16.0 },
          { date: subDays(new Date(), 15).getTime(), price: 17.5 },
          { date: new Date().getTime(), price: 18.0 },
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_income_sources', JSON.stringify(incomeSources));
  }, [incomeSources]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_market', JSON.stringify(marketItems));
  }, [marketItems]);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === TransactionType.REVENUE).reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;

    const categories: Record<string, number> = {};
    transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const totalExpenses = Object.values(categories).reduce((acc, v) => acc + v, 0);
    const categoryAnalysis: CategoryAnalysis[] = Object.entries(categories).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      icon: name === 'Food' ? 'Utensils' : name === 'Housing' ? 'Home' : name === 'Health' ? 'Activity' : 'Tag'
    })).sort((a, b) => b.amount - a.amount);

    // Chart data for last 7 days
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'MMM dd');
      const dayIncome = transactions
        .filter(t => t.type === TransactionType.REVENUE && format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        .reduce((acc, t) => acc + t.amount, 0);
      const dayExpense = transactions
        .filter(t => t.type === TransactionType.EXPENSE && format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        .reduce((acc, t) => acc + t.amount, 0);
      return { name: dateStr, income: dayIncome, expense: dayExpense };
    });

    // Diagnosis
    const score = Math.max(0, Math.min(100, Math.round((income > 0 ? (income - expenses) / income : 0) * 100 + 50)));
    const diagnosis: ZentroDiagnosis = {
      score,
      status: score > 70 ? 'Excellent' : score > 40 ? 'Stable' : 'Critical',
      recommendations: [
        expenses > income * 0.7 ? 'Your expenses have grown by 8%.' : 'Your spending is under control.',
        income > 0 ? `You are saving ${Math.round(((income - expenses) / income) * 100)}% of your income.` : 'Start tracking your income to see savings.'
      ]
    };

    return {
      income,
      expenses,
      balance,
      categoryAnalysis,
      chartData,
      diagnosis,
      marketTotal: marketItems.reduce((acc, item) => acc + (item.purchased ? 0 : item.quantity * item.unitPrice), 0)
    };
  }, [transactions, marketItems]);

  const toggleMarketItem = (id: string) => {
    setMarketItems(prev => prev.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const finalizeMarketPurchase = () => {
    const purchasedItems = marketItems.filter(item => item.purchased);
    if (purchasedItems.length === 0) return;

    const total = purchasedItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      note: 'Market Purchase',
      amount: total,
      type: TransactionType.EXPENSE,
      category: 'Food',
      date: new Date().getTime(),
      paymentMethod: 'Card'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setMarketItems(prev => prev.filter(item => !item.purchased));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date().getTime()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  return {
    transactions,
    incomeSources,
    marketItems,
    stats,
    toggleMarketItem,
    finalizeMarketPurchase,
    addTransaction
  };
}
