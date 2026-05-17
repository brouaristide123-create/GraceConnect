import React from 'react';
import {
  Users,
  TrendingUp,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isSameMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import { cn } from '../lib/utils';

export function Dashboard() {
  const { churches, members, transactions, events, currentUser } = useStore();
  const navigate = useNavigate();

  const churchId = currentUser?.churchId;

  // Filter data by current church
  const churchMembers = (members || []).filter(m => !churchId || m.churchId === churchId);
  const churchTransactions = (transactions || []).filter(t => !churchId || t.churchId === churchId);
  const churchEvents = (events || []).filter(e => !churchId || e.churchId === churchId);
  const churchBranches = churchId ? churches.filter(c => c.id === churchId) : churches;

  const totalMembers = churchMembers.length;
  const totalChurches = churchBranches.length;

  const income = churchTransactions
    .filter(t => t.type !== 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = churchTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expenses;

  const upcomingEvents = churchEvents.filter(e => e.status === 'upcoming').length;

  // Build real 6-month chart data from transactions
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(now, 5 - i);
    const label = format(monthDate, 'MMM', { locale: fr });
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthTx = churchTransactions.filter(t => {
      try {
        const d = parseISO(t.date);
        return d >= monthStart && d <= monthEnd;
      } catch { return false; }
    });
    return {
      name: label,
      income: monthTx.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0),
      expenses: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  });

  // Compute last month income for trend
  const lastMonth = subMonths(now, 1);
  const lastMonthIncome = churchTransactions
    .filter(t => t.type !== 'expense')
    .filter(t => { try { return isSameMonth(parseISO(t.date), lastMonth); } catch { return false; } })
    .reduce((s, t) => s + t.amount, 0);
  const currentMonthIncome = churchTransactions
    .filter(t => t.type !== 'expense')
    .filter(t => { try { return isSameMonth(parseISO(t.date), now); } catch { return false; } })
    .reduce((s, t) => s + t.amount, 0);
  const incomeTrendPct = lastMonthIncome > 0
    ? Math.round(((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100)
    : 0;

  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Pasteur';

  const stats = [
    {
      name: 'Membres Totaux',
      value: totalMembers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: `${churchMembers.filter(m => m.status === 'active').length} actifs`,
      trend: 'up'
    },
    {
      name: 'Églises / Branches',
      value: totalChurches,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      change: `${churches.filter(c => c.status === 'active').length} actives`,
      trend: 'up'
    },
    {
      name: 'Revenus (FCFA)',
      value: income.toLocaleString('fr-FR'),
      icon: Wallet,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      change: incomeTrendPct >= 0 ? `+${incomeTrendPct}%` : `${incomeTrendPct}%`,
      trend: incomeTrendPct >= 0 ? 'up' : 'down'
    },
    {
      name: 'Événements à venir',
      value: upcomingEvents,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      change: `${churchEvents.length} total`,
      trend: 'neutral'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Bienvenue, {userName}</h1>
          <p className="text-slate-500">Voici un aperçu de l'activité de votre ministère aujourd'hui.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hidden sm:flex" onClick={() => navigate('/stats')}>Exporter Rapport</Button>
          <Button className="bg-church-green hover:bg-church-green/90" onClick={() => navigate('/finances')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Entrée
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm group hover:shadow-md transition-shadow relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className="flex flex-col items-end">
                  <div className={cn(
                    "flex items-center text-xs font-medium mb-1",
                    stat.trend === 'up' ? "text-green-600" : stat.trend === 'down' ? "text-red-600" : "text-slate-500"
                  )}>
                    {stat.change}
                    {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3 ml-1" />}
                    {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3 ml-1" />}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100/50 border border-slate-200/50">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500 font-medium">{stat.name}</p>
                <div className="flex items-baseline gap-1">
                  <motion.h3 
                    key={stat.value}
                    initial={{ translateY: 10, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    className="text-2xl font-bold text-slate-900 mt-1"
                  >
                    {stat.value}
                  </motion.h3>
                </div>
              </div>
            </CardContent>
            {/* Subtle background pulse for active feel */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <Activity className="w-24 h-24" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Aperçu Financier</CardTitle>
            <CardDescription>Revenus vs Dépenses sur les 6 derniers mois (FCFA)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="income" name="Revenus" fill="#FF8200" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Dépenses" fill="#009E60" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Dernières transactions et membres</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {churchTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm italic">Aucune activité récente</p>
                </div>
              ) : (
                churchTransactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        t.type === 'expense' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                      )}>
                        {t.type === 'expense' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{t.category}</p>
                        <p className="text-xs text-slate-500">{format(new Date(t.date), 'dd MMM yyyy', { locale: fr })}</p>
                      </div>
                    </div>
                    <p className={cn(
                      "text-sm font-bold",
                      t.type === 'expense' ? "text-red-600" : "text-green-600"
                    )}>
                      {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-church-green font-medium" onClick={() => navigate('/activities')}>
              Voir tout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
