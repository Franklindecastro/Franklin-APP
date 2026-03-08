/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  ArrowRight,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, TransactionType, IncomeSource } from '../../types';
import { format } from 'date-fns';

interface ReportsProps {
  stats: {
    totalIncome: number;
    totalExpenses: number;
    expensesByCategory: { name: string; value: number }[];
    currentMonthTransactions: Transaction[];
    incomeBySourceChartData: { sourceName: string; totalAmount: number; colorHex: string }[];
  };
}

export const Reports = ({ stats }: ReportsProps) => {
  const exportToPDF = () => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 42, 56); // Primary color (#1E2A38)
    doc.text('MoneyFlowPro - Relatório Mensal', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 30);
    
    // Summary
    doc.setFontSize(16);
    doc.setTextColor(30, 42, 56);
    doc.text('Resumo Financeiro', 14, 45);
    
    doc.setFontSize(12);
    doc.text(`Receita Total: R$${stats.totalIncome.toFixed(2)}`, 14, 55);
    doc.text(`Despesa Total: R$${stats.totalExpenses.toFixed(2)}`, 14, 62);
    doc.text(`Saldo Líquido: R$${(stats.totalIncome - stats.totalExpenses).toFixed(2)}`, 14, 69);
    
    // Transactions Table
    doc.text('Detalhes das Transações', 14, 85);
    const tableData = stats.currentMonthTransactions.map(t => [
      format(t.date, 'dd/MM/yyyy'),
      t.category,
      t.type === TransactionType.REVENUE ? 'Receita' : 'Despesa',
      t.paymentMethod,
      `R$${t.amount.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: 90,
      head: [['Data', 'Categoria', 'Tipo', 'Método', 'Valor']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 42, 56] },
    });
    
    doc.save(`MoneyFlowPro_Relatorio_${format(new Date(), 'yyyy-MM')}.pdf`);
  };

  const comparativeData = [
    { name: 'Receita', value: stats.totalIncome },
    { name: 'Despesas', value: stats.totalExpenses },
  ];

  const highestExpense = stats.expensesByCategory.length > 0 
    ? stats.expensesByCategory.reduce((prev, current) => (prev.value > current.value) ? prev : current)
    : { name: 'Nenhuma', value: 0 };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Relatórios Financeiros</h2>
          <p className="text-sm text-muted">Analise seus hábitos de gastos e tendências.</p>
        </div>
        <button 
          onClick={exportToPDF}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Download size={20} />
          <span>Exportar PDF</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-white/5">
          <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">Maior Categoria de Gastos</p>
          <h4 className="text-2xl font-black text-error">{highestExpense.name}</h4>
          <p className="text-xs text-muted mt-1">R${highestExpense.value.toLocaleString()} este mês</p>
        </div>
        <div className="card border-white/5">
          <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">Média de Gastos Mensal</p>
          <h4 className="text-2xl font-black text-ink">R${(stats.totalExpenses / 30).toFixed(2)}</h4>
          <p className="text-xs text-muted mt-1">Média diária para o mês atual</p>
        </div>
        <div className="card border-white/5">
          <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">Taxa de Poupança</p>
          <h4 className="text-2xl font-black text-secondary">
            {stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome * 100).toFixed(1) : 0}%
          </h4>
          <p className="text-xs text-muted mt-1">Porcentagem da renda economizada</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card h-[400px] border-white/5">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6">Receita vs Despesas</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={comparativeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8E9299', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#8E9299', fontSize: 10}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E2A38', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {comparativeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#00C853' : '#FF5252'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-[400px] border-white/5">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6">Receita por Fonte</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={stats.incomeBySourceChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="totalAmount"
                nameKey="sourceName"
              >
                {stats.incomeBySourceChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.colorHex} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-[400px] border-white/5">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={stats.expensesByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#8E9299', fontSize: 10}} 
                width={80}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E2A38', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Bar dataKey="value" fill="#7C3AED" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
