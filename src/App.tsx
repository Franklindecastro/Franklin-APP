/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState } from 'react';
import { useMoneyFlowStore } from './viewmodel/useMoneyFlowStore';
import { Layout } from './ui/components/Layout';
import { Dashboard } from './ui/screens/Dashboard';
import { Transactions } from './ui/screens/Transactions';
import { Investments } from './ui/screens/Investments';
import { MarketPurchases } from './ui/screens/MarketPurchases';
import { Reports } from './ui/screens/Reports';
import { Settings } from './ui/screens/Settings';
import { Auth } from './ui/screens/Auth';

export default function App() {
  const { state, actions, stats } = useMoneyFlowStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!state.user) {
    return <Auth onLogin={actions.login} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            onQuickAdd={() => setActiveTab('transactions')} 
          />
        );
      case 'transactions':
        return (
          <Transactions 
            transactions={stats.transactionsWithSource} 
            incomeSources={state.incomeSources}
            onAdd={actions.addTransaction} 
            onAddSource={actions.addIncomeSource}
          />
        );
      case 'market':
        return (
          <MarketPurchases 
            purchases={state.marketPurchases} 
            shoppingListItems={state.shoppingListItems}
            onAdd={actions.addMarketPurchase} 
            onDelete={actions.deleteMarketPurchase}
            onAddShoppingItem={actions.addShoppingListItem}
            onUpdateShoppingItem={actions.updateShoppingListItem}
            onDeleteShoppingItem={actions.deleteShoppingListItem}
            onFinalizeShoppingList={actions.finalizeShoppingList}
            onClearShoppingList={actions.clearShoppingList}
            stats={stats}
            preferences={state.preferences}
          />
        );
      case 'investments':
        return (
          <Investments 
            investments={state.investments} 
            onAdd={actions.addInvestment} 
            totalInvested={stats.totalInvested}
            totalProfit={stats.totalProfit}
          />
        );
      case 'reports':
        return <Reports stats={stats} />;
      case 'settings':
        return (
          <Settings 
            preferences={state.preferences} 
            onUpdate={actions.updatePreferences} 
            onExportBackup={actions.exportBackup}
            onRestoreBackup={actions.restoreBackup}
          />
        );
      default:
        return <Dashboard stats={stats} onQuickAdd={() => setActiveTab('transactions')} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={actions.logout}
      userEmail={state.user.email}
      selectedDate={state.selectedDate}
      onDateChange={actions.setSelectedDate}
    >
      {renderContent()}
    </Layout>
  );
}
