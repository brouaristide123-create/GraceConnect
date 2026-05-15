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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { cn } from '../lib/utils';

export function Dashboard() {
  const { churches, members, transactions, events } = useStore();

  const totalMembers = members?.length || 0;
  const totalChurches = churches?.length || 0;
  
  const income = (transactions || [])
    .filter(t => t.type !== 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const expenses = (transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expenses;

  // Mock data for charts if empty
  const chartData = [
    { name: 'Jan', income: 4000, expenses: 2400 },
    { name: 'Fév', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 2000, expenses: 9800 },
    { name: 'Avr', income: 2780, expenses: 3908 },
    { name: 'Mai', income: 1890, expenses: 4800 },
    { name: 'Juin', income: 2390, expenses: 3800 },
  ];

  const stats = [
    { 
      name: 'Membres Totaux', 
      value: totalMembers, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      change: '+12%',
      trend: 'up'
    },
    { 
      name: 'Églises / Branches', 
      value: totalChurches, 
      icon: TrendingUp, 
      color: 'text-green-600', 
      bg: 'bg-green-50',
      change: '+2',
      trend: 'up'
    },
    { 
      name: 'Revenus (FCFA)', 
      value: income.toLocaleString(), 
      icon: Wallet, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      change: '+8%',
      trend: 'up'
    },
    { 
      name: 'Événements à venir', 
      value: events?.length || 0, 
      icon: Calendar, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      change: 'Cette semaine',
      trend: 'neutral'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Bienvenue, Pasteur</h1>
          <p className="text-slate-500">Voici un aperçu de l'activité de votre ministère aujourd'hui.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hidden sm:flex">Exporter Rapport</Button>
          <Button className="bg-church-green hover:bg-church-green/90">
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
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm italic">Aucune activité récente</p>
                </div>
              ) : (
                transactions.slice(0, 5).map((t) => (
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
            <Button variant="ghost" className="w-full mt-6 text-church-green font-medium">
              Voir tout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
