import React from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  Clock,
  ShieldCheck,
  CheckCircle2,
  Building2,
  MoreVertical,
  ChevronRight,
  Zap,
  BarChart4
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function SubscriptionManagement() {
  const { churches, subscriptions, subscriptionPlans } = useStore();

  const totalMonthlyRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, sub) => {
      const plan = subscriptionPlans.find(p => p.id === sub.planId);
      return acc + (plan?.price || 0);
    }, 0);

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Gestion des Abonnements</h1>
          <p className="text-slate-500 mt-1">Suivez les revenus et gérez les plans des églises.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-11 border-slate-200">Facturation Globale</Button>
          <Button className="bg-slate-900 rounded-xl h-11">Nouveau Plan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white overflow-hidden relative">
          <CardContent className="p-8">
            <div className="relative z-10">
              <p className="text-white/60 text-sm font-medium mb-1">Revenu Mensuel Estimé</p>
              <h3 className="text-4xl font-bold">{totalMonthlyRevenue.toLocaleString()} FCFA</h3>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mt-4">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5% vs mois dernier</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl border-l-4 border-l-emerald-500 overflow-hidden">
          <CardContent className="p-8">
            <p className="text-slate-500 text-sm font-medium mb-1">Abos. Actifs</p>
            <h3 className="text-4xl font-bold text-slate-900">{activeSubscriptions}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Sur {subscriptions.length} inscriptions totales</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl border-l-4 border-l-amber-500 overflow-hidden">
          <CardContent className="p-8">
            <p className="text-slate-500 text-sm font-medium mb-1">Taux de Rétention</p>
            <h3 className="text-4xl font-bold text-slate-900">94%</h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-4">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Performance exceptionnelle</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-serif font-bold">Historique des Paiements</CardTitle>
              <CardDescription>Dernières transactions enregistrées sur la plateforme.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-y border-slate-100">
                      <th className="text-left px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Église</th>
                      <th className="text-left px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date / Type</th>
                      <th className="text-left px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Montant</th>
                      <th className="text-left px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                      <th className="text-right px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Reçu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.slice(0, 5).map((sub) => {
                      const church = churches.find(c => c.id === sub.churchId);
                      const plan = subscriptionPlans.find(p => p.id === sub.planId);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-slate-900">{church?.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div>
                              <p className="text-sm font-medium text-slate-700">{format(parseISO(sub.startDate), 'dd MMM yyyy', { locale: fr })}</p>
                              <p className="text-xs text-slate-400">{plan?.name}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="font-bold text-slate-900">{plan?.price.toLocaleString()} FCFA</span>
                          </td>
                          <td className="px-8 py-5">
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Payé</Badge>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <Button variant="ghost" size="icon" className="text-slate-400">
                              <DollarSign className="w-4 h-4" />
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
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-serif font-bold">Plans & Tarifs</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              {subscriptionPlans.map(plan => (
                <div key={plan.id} className="p-5 rounded-2xl bg-slate-50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">{plan.name}</h4>
                      <p className="text-2xl font-bold text-church-gold">{plan.price.toLocaleString()} <span className="text-xs text-slate-400">/mois</span></p>
                    </div>
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Zap className="w-5 h-5 text-church-gold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inclus :</p>
                    <ul className="text-xs space-y-2 text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Jusqu'à {plan.limits.members} membres
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {plan.limits.storage} stockage
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {plan.limits.modules.includes('all') ? 'Tous les modules' : `${plan.limits.modules.length} modules de base`}
                      </li>
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl bg-white border-slate-200">Modifier le plan</Button>
                </div>
              ))}
              <Button className="w-full bg-slate-100 text-slate-600 hover:bg-slate-200 border-none rounded-xl h-12 dashed font-bold">
                Ajouter un nouveau plan
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-emerald-600 text-white overflow-hidden">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart4 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl">Conversion Premium</h4>
                <p className="text-white/70 text-sm mt-1">Vos églises migrent de plus en plus vers le plan Premium ce mois-ci.</p>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Objectif mensuel</span>
                  <span>78%</span>
                </div>
                <Progress value={78} className="h-2 bg-white/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
