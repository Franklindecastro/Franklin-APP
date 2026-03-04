/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, Investment, UserPreferences, AppState, MarketPurchase, MarketItem, ShoppingListItem, IncomeSource } from '../types';
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths } from 'date-fns';

const STORAGE_KEY = 'moneyflowpro_data';

export function useMoneyFlowStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration for new fields
        return {
          transactions: parsed.transactions || [],
          investments: parsed.investments || [],
          marketPurchases: parsed.marketPurchases || [],
          shoppingListItems: parsed.shoppingListItems || [],
          incomeSources: parsed.incomeSources || [],
          preferences: {
            monthlyGoal: parsed.preferences?.monthlyGoal ?? 2000,
            marketBudget: parsed.preferences?.marketBudget ?? 1000,
            isPremium: parsed.preferences?.isPremium ?? false,
          },
          user: parsed.user || null,
          selectedDate: startOfMonth(new Date()).getTime(),
        };
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return {
      transactions: [],
      investments: [],
      marketPurchases: [],
      shoppingListItems: [],
      incomeSources: [],
      preferences: {
        monthlyGoal: 2000,
        marketBudget: 1000,
        isPremium: false,
      },
      user: null,
      selectedDate: startOfMonth(new Date()).getTime(),
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Actions
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (transaction.type === TransactionType.REVENUE && !transaction.sourceId) {
      throw new Error('A fonte de receita é obrigatória.');
    }
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: Date.now(),
    };
    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));
  };

  const addInvestment = (investment: Omit<Investment, 'id' | 'date'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: crypto.randomUUID(),
      date: Date.now(),
    };
    setState(prev => ({
      ...prev,
      investments: [newInvestment, ...prev.investments],
    }));
  };

  const addMarketPurchase = (purchase: Omit<MarketPurchase, 'id'>) => {
    const newPurchase: MarketPurchase = {
      ...purchase,
      id: crypto.randomUUID(),
    };
    setState(prev => ({
      ...prev,
      marketPurchases: [newPurchase, ...prev.marketPurchases],
    }));
  };

  const deleteMarketPurchase = (id: string) => {
    setState(prev => ({
      ...prev,
      marketPurchases: prev.marketPurchases.filter(p => p.id !== id),
    }));
  };

  const addShoppingListItem = (item: Omit<ShoppingListItem, 'id' | 'createdDate' | 'isChecked'>) => {
    const newItem: ShoppingListItem = {
      ...item,
      id: crypto.randomUUID(),
      createdDate: Date.now(),
      isChecked: false,
    };
    setState(prev => ({
      ...prev,
      shoppingListItems: [...prev.shoppingListItems, newItem],
    }));
  };

  const updateShoppingListItem = (id: string, updates: Partial<ShoppingListItem>) => {
    setState(prev => ({
      ...prev,
      shoppingListItems: prev.shoppingListItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const deleteShoppingListItem = (id: string) => {
    setState(prev => ({
      ...prev,
      shoppingListItems: prev.shoppingListItems.filter(item => item.id !== id),
    }));
  };

  const clearShoppingList = () => {
    setState(prev => ({
      ...prev,
      shoppingListItems: [],
    }));
  };

  const finalizeShoppingList = (marketName: string, note: string = '') => {
    const checkedItems = state.shoppingListItems.filter(item => item.isChecked);
    if (checkedItems.length === 0) return;

    const marketItems: MarketItem[] = checkedItems.map(item => ({
      id: crypto.randomUUID(),
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.estimatedUnitPrice,
      totalPrice: item.quantity * item.estimatedUnitPrice,
    }));

    const totalAmount = marketItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const newPurchase: MarketPurchase = {
      id: crypto.randomUUID(),
      marketName,
      purchaseDate: Date.now(),
      totalAmount,
      items: marketItems,
      note,
    };

    setState(prev => ({
      ...prev,
      marketPurchases: [newPurchase, ...prev.marketPurchases],
      shoppingListItems: [], // Clear list after finalizing
    }));
  };

  const addIncomeSource = (source: Omit<IncomeSource, 'id' | 'createdDate'>) => {
    if (!source.name) throw new Error('O nome da fonte não pode ser vazio.');
    if (state.incomeSources.some(s => s.name.toLowerCase() === source.name.toLowerCase())) {
      throw new Error('Já existe uma fonte com este nome.');
    }
    const newSource: IncomeSource = {
      ...source,
      id: crypto.randomUUID(),
      createdDate: Date.now(),
    };
    setState(prev => ({
      ...prev,
      incomeSources: [...prev.incomeSources, newSource].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  };

  const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
    setState(prev => ({
      ...prev,
      incomeSources: prev.incomeSources.map(s => s.id === id ? { ...s, ...updates } : s).sort((a, b) => a.name.localeCompare(b.name)),
    }));
  };

  const deleteIncomeSource = (id: string) => {
    if (state.transactions.some(t => t.sourceId === id)) {
      throw new Error('Não é possível excluir uma fonte que possui receitas vinculadas.');
    }
    setState(prev => ({
      ...prev,
      incomeSources: prev.incomeSources.filter(s => s.id !== id),
    }));
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs },
    }));
  };

  const login = (email: string) => {
    setState(prev => ({ ...prev, user: { email } }));
  };

  const setSelectedDate = (date: number) => {
    setState(prev => ({ ...prev, selectedDate: startOfMonth(new Date(date)).getTime() }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null }));
  };

  const exportBackup = () => {
    const backupData = {
      transactions: state.transactions,
      investments: state.investments,
      marketPurchases: state.marketPurchases,
      shoppingListItems: state.shoppingListItems,
      incomeSources: state.incomeSources,
      exportDate: Date.now(),
      appVersion: '1.3.0',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `moneyflow_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const restoreBackup = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          // Basic validation
          if (Array.isArray(data.transactions) && Array.isArray(data.investments)) {
            setState(prev => ({
              ...prev,
              transactions: data.transactions,
              investments: data.investments,
              marketPurchases: data.marketPurchases || [],
              shoppingListItems: data.shoppingListItems || [],
              incomeSources: data.incomeSources || [],
            }));
            resolve(true);
          } else {
            console.error('Invalid backup format');
            resolve(false);
          }
        } catch (err) {
          console.error('Failed to restore backup', err);
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  };

  // Derived State (Calculations)
  const currentMonthInterval = useMemo(() => ({
    start: startOfMonth(new Date(state.selectedDate)),
    end: endOfMonth(new Date(state.selectedDate)),
  }), [state.selectedDate]);

  const prevMonthInterval = useMemo(() => ({
    start: startOfMonth(subMonths(new Date(state.selectedDate), 1)),
    end: endOfMonth(subMonths(new Date(state.selectedDate), 1)),
  }), [state.selectedDate]);

  const currentMonthTransactions = useMemo(() => 
    state.transactions.filter(t => 
      isWithinInterval(new Date(t.date), currentMonthInterval)
    ), [state.transactions, currentMonthInterval]);

  const currentMonthMarketPurchases = useMemo(() => 
    state.marketPurchases.filter(p => 
      isWithinInterval(new Date(p.purchaseDate), currentMonthInterval)
    ), [state.marketPurchases, currentMonthInterval]);

  const prevMonthMarketPurchases = useMemo(() => 
    state.marketPurchases.filter(p => 
      isWithinInterval(new Date(p.purchaseDate), prevMonthInterval)
    ), [state.marketPurchases, prevMonthInterval]);

  const totalIncome = useMemo(() => 
    currentMonthTransactions
      .filter(t => t.type === TransactionType.REVENUE)
      .reduce((sum, t) => sum + t.amount, 0),
    [currentMonthTransactions]
  );

  const totalExpenses = useMemo(() => {
    const transactionsExpenses = currentMonthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const marketExpenses = currentMonthMarketPurchases
      .reduce((sum, p) => sum + p.totalAmount, 0);

    return transactionsExpenses + marketExpenses;
  }, [currentMonthTransactions, currentMonthMarketPurchases]);

  const totalMarketExpenses = useMemo(() => 
    currentMonthMarketPurchases.reduce((sum, p) => sum + p.totalAmount, 0),
    [currentMonthMarketPurchases]
  );

  const prevTotalMarketExpenses = useMemo(() => 
    prevMonthMarketPurchases.reduce((sum, p) => sum + p.totalAmount, 0),
    [prevMonthMarketPurchases]
  );

  const totalBalance = useMemo(() => {
    const transBalance = state.transactions.reduce((sum, t) => 
      t.type === TransactionType.REVENUE ? sum + t.amount : sum - t.amount, 0
    );
    const marketBalance = state.marketPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
    return transBalance - marketBalance;
  }, [state.transactions, state.marketPurchases]);

  const totalInvested = useMemo(() => 
    state.investments.reduce((sum, i) => sum + i.investedAmount, 0),
    [state.investments]
  );

  const totalProfit = useMemo(() => 
    state.investments.reduce((sum, i) => sum + (i.investedAmount * i.profitability / 100), 0),
    [state.investments]
  );

  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    currentMonthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    
    // Add market as a category
    if (totalMarketExpenses > 0) {
      categories['Mercado'] = (categories['Mercado'] || 0) + totalMarketExpenses;
    }

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [currentMonthTransactions, totalMarketExpenses]);

  const marketExpensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    currentMonthMarketPurchases.forEach(p => {
      p.items.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + item.totalPrice;
      });
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [currentMonthMarketPurchases]);

  const mostPurchasedItem = useMemo(() => {
    const counts: Record<string, number> = {};
    state.marketPurchases.forEach(p => {
      p.items.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.quantity;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, [state.marketPurchases]);

  const goalProgress = useMemo(() => {
    if (state.preferences.monthlyGoal === 0) return 0;
    return (totalExpenses / state.preferences.monthlyGoal) * 100;
  }, [totalExpenses, state.preferences.monthlyGoal]);

  const marketBudgetProgress = useMemo(() => {
    if (state.preferences.marketBudget === 0) return 0;
    return (totalMarketExpenses / state.preferences.marketBudget) * 100;
  }, [totalMarketExpenses, state.preferences.marketBudget]);

  const shoppingListTotal = useMemo(() => 
    state.shoppingListItems.reduce((sum, item) => sum + (item.quantity * item.estimatedUnitPrice), 0),
    [state.shoppingListItems]
  );

  const transactionsWithSource = useMemo(() => {
    return state.transactions.map(t => ({
      ...t,
      source: t.sourceId ? state.incomeSources.find(s => s.id === t.sourceId) : undefined
    }));
  }, [state.transactions, state.incomeSources]);

  const incomeBySourceChartData = useMemo(() => {
    const sources: Record<string, { totalAmount: number, colorHex: string }> = {};
    
    currentMonthTransactions
      .filter(t => t.type === TransactionType.REVENUE && t.sourceId)
      .forEach(t => {
        const source = state.incomeSources.find(s => s.id === t.sourceId);
        if (source) {
          if (!sources[source.name]) {
            sources[source.name] = { totalAmount: 0, colorHex: source.colorHex };
          }
          sources[source.name].totalAmount += t.amount;
        }
      });

    return Object.entries(sources).map(([sourceName, data]) => ({
      sourceName,
      totalAmount: data.totalAmount,
      colorHex: data.colorHex
    }));
  }, [currentMonthTransactions, state.incomeSources]);

  return {
    state,
    actions: {
      addTransaction,
      addInvestment,
      addMarketPurchase,
      deleteMarketPurchase,
      addShoppingListItem,
      updateShoppingListItem,
      deleteShoppingListItem,
      clearShoppingList,
      finalizeShoppingList,
      addIncomeSource,
      updateIncomeSource,
      deleteIncomeSource,
      updatePreferences,
      setSelectedDate,
      login,
      logout,
      exportBackup,
      restoreBackup,
    },
    stats: {
      totalIncome,
      totalExpenses,
      totalBalance,
      totalInvested,
      totalProfit,
      expensesByCategory,
      goalProgress,
      currentMonthTransactions,
      totalMarketExpenses,
      prevTotalMarketExpenses,
      marketExpensesByCategory,
      marketBudgetProgress,
      mostPurchasedItem,
      currentMonthMarketPurchases,
      shoppingListTotal,
      transactionsWithSource,
      incomeBySourceChartData,
    }
  };
}
