/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TransactionType {
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  paymentMethod: string;
  date: number; // timestamp
  note: string;
  sourceId?: string; // Mandatory for REVENUE
}

export interface IncomeSource {
  id: string;
  name: string;
  iconName: string;
  colorHex: string;
  createdDate: number;
}

export interface Investment {
  id: string;
  type: string;
  investedAmount: number;
  profitability: number; // percentage
  date: number;
}

export interface MarketItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface MarketPurchase {
  id: string;
  marketName: string;
  purchaseDate: number;
  totalAmount: number;
  items: MarketItem[];
  note: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  estimatedUnitPrice: number;
  isChecked: boolean;
  createdDate: number;
}

export interface UserPreferences {
  monthlyGoal: number;
  marketBudget: number;
  isPremium: boolean;
}

export interface AppState {
  transactions: Transaction[];
  investments: Investment[];
  marketPurchases: MarketPurchase[];
  shoppingListItems: ShoppingListItem[];
  incomeSources: IncomeSource[];
  preferences: UserPreferences;
  user: { email: string } | null;
  selectedDate: number; // timestamp of the first day of the selected month
}

export interface BackupData {
  transactions: Transaction[];
  investments: Investment[];
  marketPurchases: MarketPurchase[];
  shoppingListItems: ShoppingListItem[];
  incomeSources: IncomeSource[];
  exportDate: number;
  appVersion: string;
}
