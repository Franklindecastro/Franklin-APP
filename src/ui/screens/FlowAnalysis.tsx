import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  Calendar, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction, TransactionType } from '../../types';
import { 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  format, 
  eachDayOfInterval, 
  getDay,
  differenceInMonths,
  startOfDay
} from 'date-fns';

interface FlowAnalysisProps {
  transactions: Transaction[];
}

export const FlowAnalysis = ({ transactions }: FlowAnalysisProps) => {
  const now = new Date();
  const last30Days = { start: subDays(now, 30), end: now };
  const prev30Days = { start: subDays(now, 60), end: subDays(now, 31) };

  // 1. Strategic Summary Calculations
  const summary = useMemo(() => {
    const currentTransactions = transactions.filter(t => 
      isWithinInterval(new Date(t.date), last30Days)
    );
    const previousTransactions = transactions.filter(t => 
      isWithinInterval(new Date(t.date), prev30Days)
    );

    const income = currentTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = currentTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;

    const prevIncome = previousTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const prevExpenses = previousTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const prevBalance = prevIncome - prevExpenses;
    
    const variation = prevBalance !== 0 ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100 : 0;

    let status = { label: 'Equilíbrio Instável', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertCircle, dot: '🟡' };
    if (balance > income * 0.2) {
      status = { label: 'Superávit Saudável', color: 'text-secondary', bg: 'bg-secondary/10', icon: CheckCircle2, dot: '🟢' };
    } else if (balance <= 0) {
      status = { label: 'Déficit Preocupante', color: 'text-error', bg: 'bg-error/10', icon: AlertCircle, dot: '🔴' };
    }

    return { income, expenses, balance, savingsRate, variation, status };
  }, [transactions]);

  // 2. Financial Trend
  const trend = useMemo(() => {
    // Group by month for last 3 months
    const months = [0, 1, 2].map(i => {
      const start = startOfMonth(subDays(now, i * 30));
      const end = endOfMonth(start);
      const monthTransactions = transactions.filter(t => 
        isWithinInterval(new Date(t.date), { start, end })
      );
      return {
        income: monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
        expenses: monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
      };
    });

    const avgIncome = months.reduce((acc, m) => acc + m.income, 0) / months.length;
    const avgExpenses = months.reduce((acc, m) => acc + m.expenses, 0) / months.length;
    
    const expenseGrowth = months[1].expenses > 0 
      ? ((months[0].expenses - months[1].expenses) / months[1].expenses) * 100 
      : 0;

    const projection = summary.balance + (avgIncome - avgExpenses);

    return {
      avgIncome,
      avgExpenses,
      expenseGrowth,
      projection,
      trendText: expenseGrowth > 0 
        ? `Suas despesas estão crescendo ${expenseGrowth.toFixed(1)}% ao mês.`
        : `Suas despesas diminuíram ${Math.abs(expenseGrowth).toFixed(1)}% este mês.`,
      projectionText: projection > 0
        ? `Mantendo o ritmo atual, seu saldo será positivo em 30 dias.`
        : `Atenção: Projeção de saldo negativo para o próximo mês.`
    };
  }, [transactions, summary]);

  // 3. Behavior Analysis
  const behavior = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Days of week
    const days = Array(7).fill(0);
    expenseTransactions.forEach(t => {
      days[getDay(new Date(t.date))] += t.amount;
    });
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const maxDayIdx = days.indexOf(Math.max(...days));

    // Categories
    const cats: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    const sortedCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    const dominantCategory = sortedCats[0]?.[0] || 'Nenhuma';
    const dominantPercentage = summary.expenses > 0 ? (sortedCats[0]?.[1] / summary.expenses) * 100 : 0;

    // Recurring (simple check: same description and amount > 1 time)
    const recurringMap: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      const key = `${t.description}-${t.amount}`;
      recurringMap[key] = (recurringMap[key] || 0) + 1;
    });
    const recurringCount = Object.values(recurringMap).filter(v => v > 1).length;

    return {
      maxDay: dayNames[maxDayIdx],
      dominantCategory,
      dominantPercentage,
      recurringCount,
      isWeekendHeavy: maxDayIdx === 0 || maxDayIdx === 6
    };
  }, [transactions, summary]);

  // 4. Zentro Stability Index
  const stabilityIndex = useMemo(() => {
    // Regularity (0-25)
    const monthsWithIncome = new Set(transactions.filter(t => t.type === 'income').map(t => format(new Date(t.date), 'yyyy-MM'))).size;
    const regularity = Math.min(25, monthsWithIncome * 8);

    // Control (0-25)
    const control = summary.income > 0 ? Math.max(0, Math.min(25, (1 - summary.expenses / summary.income) * 25)) : 0;

    // Balance (0-25)
    const positiveBalanceMonths = 25; // Placeholder for MVP

    // Variation (0-25)
    const variationScore = Math.max(0, 25 - Math.abs(trend.expenseGrowth) / 2);

    const score = Math.round(regularity + control + positiveBalanceMonths + variationScore);
    
    let label = 'Instável';
    let color = 'text-error';
    if (score >= 70) {
      label = 'Estável';
      color = 'text-secondary';
    } else if (score >= 40) {
      label = 'Moderado';
      color = 'text-amber-500';
    }

    return { score, label, color };
  }, [transactions, summary, trend]);

  // 5. Recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    if (behavior.dominantPercentage > 30) {
      recs.push(`Reduza gastos em ${behavior.dominantCategory} em 10% para aumentar sua poupança.`);
    }
    if (trend.expenseGrowth > 5) {
      recs.push(`Suas despesas estão subindo rápido. Revise seus gastos fixos.`);
    }
    if (summary.savingsRate < 10) {
      recs.push(`Tente poupar pelo menos 15% da sua renda este mês.`);
    }
    if (recs.length === 0) {
      recs.push("Seu padrão de gastos está saudável. Continue assim!");
    }
    return recs.slice(0, 3);
  }, [behavior, trend, summary]);

  return (
    <div className="space-y-6 pb-32 pt-28 px-6 max-w-md mx-auto">
      {/* 1. Strategic Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="zentro-card bg-gradient-to-br from-zentro-card to-zentro-bg border border-white/5 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[10px] font-black zentro-text-secondary uppercase tracking-[0.2em] mb-1">Resumo Estratégico</h3>
            <div className="flex items-center gap-2">
              <span className="text-lg">{summary.status.dot}</span>
              <span className={`text-sm font-black uppercase tracking-wider ${summary.status.color}`}>{summary.status.label}</span>
            </div>
          </div>
          <div className={`${summary.status.bg} p-3 rounded-2xl`}>
            <summary.status.icon className={summary.status.color} size={24} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-bold zentro-text-secondary uppercase tracking-widest mb-1">Receita Total</p>
            <p className="text-xl font-black text-zentro-positive">R${summary.income.toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold zentro-text-secondary uppercase tracking-widest mb-1">Despesa Total</p>
            <p className="text-xl font-black text-zentro-negative">R${summary.expenses.toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold zentro-text-secondary uppercase tracking-widest mb-1">Saldo Líquido</p>
            <p className={`text-xl font-black ${summary.balance >= 0 ? 'text-zentro-text-main' : 'text-zentro-negative'}`}>
              R${summary.balance.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold zentro-text-secondary uppercase tracking-widest mb-1">Taxa de Poupança</p>
            <p className="text-xl font-black text-zentro-highlight">{summary.savingsRate.toFixed(0)}%</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-bold zentro-text-secondary uppercase tracking-widest">Variação vs Período Anterior</span>
          <div className={`flex items-center gap-1 font-black text-sm ${summary.variation >= 0 ? 'text-zentro-positive' : 'text-zentro-negative'}`}>
            {summary.variation >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(summary.variation).toFixed(1)}%
          </div>
        </div>
      </motion.div>

      {/* 2. Financial Trend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="zentro-card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-zentro-highlight/10 rounded-xl text-zentro-highlight">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Tendência Financeira</h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl">
            <span className="text-xs font-bold zentro-text-secondary">Média Mensal Receita</span>
            <span className="text-sm font-black">R${trend.avgIncome.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl">
            <span className="text-xs font-bold zentro-text-secondary">Média Mensal Despesa</span>
            <span className="text-sm font-black">R${trend.avgExpenses.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div className="p-4 bg-zentro-highlight/5 border border-zentro-highlight/10 rounded-2xl space-y-2">
          <p className="text-xs font-bold text-zentro-highlight leading-relaxed">
            “{trend.trendText}”
          </p>
          <p className="text-xs font-medium zentro-text-secondary leading-relaxed">
            {trend.projectionText}
          </p>
        </div>
      </motion.div>

      {/* 3. Behavior Analysis */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="zentro-card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
            <Activity size={20} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Análise de Comportamento</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <Calendar size={18} className="zentro-text-secondary" />
            </div>
            <div>
              <p className="text-[10px] font-black zentro-text-secondary uppercase tracking-widest mb-0.5">Pico de Gastos</p>
              <p className="text-sm font-bold">Seus maiores gastos ocorrem aos <span className="text-zentro-highlight">{behavior.maxDay}s</span>.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <PieChartIcon size={18} className="zentro-text-secondary" />
            </div>
            <div>
              <p className="text-[10px] font-black zentro-text-secondary uppercase tracking-widest mb-0.5">Categoria Dominante</p>
              <p className="text-sm font-bold"><span className="text-zentro-highlight">{behavior.dominantCategory}</span> representa {behavior.dominantPercentage.toFixed(0)}% das despesas.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <Zap size={18} className="zentro-text-secondary" />
            </div>
            <div>
              <p className="text-[10px] font-black zentro-text-secondary uppercase tracking-widest mb-0.5">Recorrência</p>
              <p className="text-sm font-bold">Você possui <span className="text-zentro-highlight">{behavior.recurringCount} despesas</span> fixas recorrentes.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Stability Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="zentro-card"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">Índice de Estabilidade Zentro</h3>
          <span className={`text-xs font-black uppercase tracking-widest ${stabilityIndex.color}`}>{stabilityIndex.label}</span>
        </div>

        <div className="relative h-12 bg-white/5 rounded-2xl overflow-hidden mb-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stabilityIndex.score}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-zentro-highlight"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black text-white drop-shadow-md">{stabilityIndex.score}</span>
          </div>
        </div>

        <div className="flex justify-between text-[10px] font-black zentro-text-secondary uppercase tracking-widest px-1">
          <span>Instável</span>
          <span>Moderado</span>
          <span>Estável</span>
        </div>
      </motion.div>

      {/* 5. Intelligent Recommendations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="zentro-card border-l-4 border-zentro-highlight"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-zentro-highlight/10 rounded-xl text-zentro-highlight">
            <Target size={20} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Recomendações Inteligentes</h3>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-zentro-highlight shrink-0" />
              <p className="text-xs font-medium zentro-text-secondary leading-relaxed">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
