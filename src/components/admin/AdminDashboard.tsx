import React from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: { trendValue: string; positive: boolean };
  color: string;
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden rounded-3xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-4 rounded-2xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={`flex items-center gap-1 text-sm font-bold ${trend.positive ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {trend.trendValue}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { churches, platformStats, subscriptions, subscriptionPlans } = useStore();

  const recentChurches = [...churches].sort((a, b) => 
    parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
  ).slice(0, 5);

  const stats = [
    { 
      title: 'Total Églises', 
      value: platformStats.totalChurches, 
      icon: Building2, 
      trend: { trendValue: '+12%', positive: true }, 
      color: 'bg-indigo-500' 
    },
    { 
      title: 'Utilisateurs Actifs', 
      value: platformStats.totalUsers, 
      icon: Users, 
      trend: { trendValue: '+8%', positive: true }, 
      color: 'bg-emerald-500' 
    },
    { 
      title: 'Revenus Mensuels', 
      value: `${platformStats.totalRevenue.toLocaleString()} FCFA`, 
      icon: CreditCard, 
      trend: { trendValue: '+5%', positive: true }, 
      color: 'bg-amber-500' 
    },
    { 
      title: 'Taux de Croissance', 
      value: '22%', 
      icon: TrendingUp, 
      trend: { trendValue: '+15%', positive: true }, 
      color: 'bg-purple-500' 
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Actif</Badge>;
      case 'pending': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">En attente</Badge>;
      case 'suspended': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Suspendu</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Vue d'Ensemble</h1>
          <p className="text-slate-500 mt-1">Bienvenue sur la console Super Admin de Grace-Connect.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-11 border-slate-200">Exporter les données</Button>
          <Button className="bg-slate-900 rounded-xl h-11">Nouvelle Église</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <div>
              <CardTitle className="text-2xl font-serif font-bold">Églises Récemment Inscrites</CardTitle>
              <CardDescription>Suivi des 5 dernières inscriptions sur la plateforme.</CardDescription>
            </div>
            <Button variant="ghost" className="text-church-gold font-bold">Voir tout</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-y border-slate-100">
                    <th className="text-left px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Église</th>
                    <th className="text-left px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Responsable</th>
                    <th className="text-left px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                    <th className="text-left px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                    <th className="text-right px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentChurches.map((church) => {
                    const sub = subscriptions.find(s => s.churchId === church.id);
                    const plan = subscriptionPlans.find(p => p.id === sub?.planId);
                    return (
                      <tr key={church.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{church.name}</p>
                              <p className="text-xs text-slate-400">{church.city}, {church.country}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{church.pastor}</p>
                            <p className="text-xs text-slate-400">{church.email}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {plan ? (
                            <Badge variant="outline" className={`border-none ${
                              plan.id === 'premium' ? 'bg-amber-50 text-amber-700' :
                              plan.id === 'standard' ? 'bg-blue-50 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {plan.name}
                            </Badge>
                          ) : 'N/A'}
                        </td>
                        <td className="px-8 py-5">
                          {getStatusBadge(church.status)}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-serif font-bold">Vérifications Requises</CardTitle>
            <CardDescription>Églises en attente de validation.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6 flex-1">
            <div className="space-y-4">
              {churches.filter(c => c.status === 'pending').length > 0 ? (
                churches.filter(c => c.status === 'pending').map((church) => (
                  <div key={church.id} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{church.name}</p>
                          <p className="text-xs text-amber-600 font-medium">Inscrit le {format(parseISO(church.createdAt), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100 h-9 rounded-lg">Détails</Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 rounded-lg">Valider</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-3 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 text-sm italic">Aucune vérification en attente</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Performance des Plans
              </h4>
              <div className="space-y-4">
                {subscriptionPlans.map(plan => {
                  const count = subscriptions.filter(s => s.planId === plan.id).length;
                  const percentage = Math.round((count / subscriptions.length) * 100);
                  return (
                    <div key={plan.id} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 font-medium">{plan.name}</span>
                        <span className="text-slate-400 font-bold">{count} églises</span>
                      </div>
                      <Progress value={percentage} className="h-2 bg-slate-100" />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
