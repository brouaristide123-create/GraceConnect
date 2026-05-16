import React from 'react';
import { useStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Users,
  Wallet,
  Calendar,
  Mic2,
  Activity,
  UserPlus,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';

type ActivityType = 'member' | 'transaction' | 'event' | 'service';
type FilterType = 'all' | ActivityType;

interface ActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  date: string;
}

const TYPE_CONFIG: Record<ActivityType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  member: {
    label: 'Membres',
    icon: <UserPlus className="w-4 h-4" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  transaction: {
    label: 'Finances',
    icon: <Wallet className="w-4 h-4" />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  event: {
    label: 'Événements',
    icon: <Calendar className="w-4 h-4" />,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  service: {
    label: 'Cultes',
    icon: <Mic2 className="w-4 h-4" />,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
};

export function RecentActivitiesPage() {
  const { members, transactions, events, services, currentUser } = useStore();
  const [filter, setFilter] = React.useState<FilterType>('all');

  const churchId = currentUser?.churchId;

  // Build unified activity list
  const allActivities: ActivityEntry[] = React.useMemo(() => {
    const entries: ActivityEntry[] = [];

    // Members
    members
      .filter((m) => m.churchId === churchId)
      .forEach((m) => {
        entries.push({
          id: `member-${m.id}`,
          type: 'member',
          title: `${m.firstName} ${m.lastName} inscrit(e)`,
          detail: m.matricule ? `Matricule : ${m.matricule}` : m.phone,
          date: m.joinedAt,
        });
      });

    // Transactions
    transactions
      .filter((t) => t.churchId === churchId)
      .forEach((t) => {
        const typeLabel =
          t.type === 'tithe'
            ? 'Dîme'
            : t.type === 'offering'
            ? 'Offrande'
            : t.type === 'donation'
            ? 'Don'
            : 'Dépense';
        entries.push({
          id: `tx-${t.id}`,
          type: 'transaction',
          title: `${typeLabel} — ${t.amount.toLocaleString('fr-FR')} FCFA`,
          detail: t.category + (t.paymentMethod ? ` · ${t.paymentMethod}` : ''),
          date: t.date,
        });
      });

    // Events
    events
      .filter((e) => e.churchId === churchId)
      .forEach((e) => {
        entries.push({
          id: `event-${e.id}`,
          type: 'event',
          title: e.name,
          detail: e.location,
          date: e.startDate,
        });
      });

    // Services
    services
      .filter((s) => s.churchId === churchId)
      .forEach((s) => {
        entries.push({
          id: `service-${s.id}`,
          type: 'service',
          title: s.theme || 'Culte',
          detail: `${s.preacher} · ${s.location}`,
          date: s.date,
        });
      });

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [members, transactions, events, services, churchId]);

  const filtered = filter === 'all' ? allActivities : allActivities.filter((a) => a.type === filter);
  const displayed = filtered.slice(0, 20);

  // Summary stats
  const recentMembers = members.filter((m) => m.churchId === churchId).sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()).slice(0, 3);
  const recentTransactions = transactions.filter((t) => t.churchId === churchId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  const recentEvents = events.filter((e) => e.churchId === churchId).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 3);
  const recentServices = services.filter((s) => s.churchId === churchId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <Activity className="w-8 h-8 text-church-gold" />
          Activités Récentes
        </h1>
        <p className="text-slate-500 mt-1">Toutes les dernières actions enregistrées pour votre église.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(TYPE_CONFIG) as [ActivityType, typeof TYPE_CONFIG[ActivityType]][]).map(([type, cfg]) => {
          const count =
            type === 'member'
              ? members.filter((m) => m.churchId === churchId).length
              : type === 'transaction'
              ? transactions.filter((t) => t.churchId === churchId).length
              : type === 'event'
              ? events.filter((e) => e.churchId === churchId).length
              : services.filter((s) => s.churchId === churchId).length;
          return (
            <Card key={type} className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn('p-2 rounded-lg', cfg.bg, cfg.color)}>{cfg.icon}</div>
                <div>
                  <p className="text-xs text-slate-500">{cfg.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'member', 'transaction', 'event', 'service'] as FilterType[]).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            className={cn(
              filter === f ? 'bg-church-gold text-white hover:bg-church-gold/90' : '',
              'rounded-full'
            )}
            onClick={() => setFilter(f)}
          >
            {f === 'all'
              ? 'Tous'
              : f === 'member'
              ? 'Membres'
              : f === 'transaction'
              ? 'Finances'
              : f === 'event'
              ? 'Événements'
              : 'Cultes'}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            Timeline — {filter === 'all' ? 'Toutes activités' : TYPE_CONFIG[filter as ActivityType]?.label} (20 dernières)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayed.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic">Aucune activité enregistrée.</div>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />
              {displayed.map((entry, idx) => {
                const cfg = TYPE_CONFIG[entry.type];
                return (
                  <div key={entry.id} className="relative flex items-start gap-4 py-4 pl-2">
                    {/* Dot */}
                    <div className={cn('relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center', cfg.bg, cfg.color)}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{entry.detail}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge className={cn('border-none text-[10px]', cfg.bg, cfg.color)}>
                            {cfg.label}
                          </Badge>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {format(new Date(entry.date), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Derniers membres */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
              <UserPlus className="w-4 h-4" /> Derniers membres inscrits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMembers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucun membre.</p>
            ) : (
              recentMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {m.firstName[0]}{m.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-slate-400">{m.matricule}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{format(new Date(m.joinedAt), 'dd MMM', { locale: fr })}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Dernières transactions */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
              <Wallet className="w-4 h-4" /> Dernières transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucune transaction.</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs', t.type === 'expense' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600')}>
                      {t.type === 'expense' ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.category}</p>
                      <p className="text-xs text-slate-400">{t.paymentMethod}</p>
                    </div>
                  </div>
                  <span className={cn('text-sm font-bold', t.type === 'expense' ? 'text-rose-600' : 'text-emerald-600')}>
                    {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Derniers événements */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
              <Calendar className="w-4 h-4" /> Derniers événements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucun événement.</p>
            ) : (
              recentEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-slate-400">{e.location}</p>
                  </div>
                  <span className="text-xs text-slate-400">{format(new Date(e.startDate), 'dd MMM', { locale: fr })}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Derniers cultes */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
              <Mic2 className="w-4 h-4" /> Derniers cultes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentServices.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucun culte.</p>
            ) : (
              recentServices.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{s.theme || 'Culte'}</p>
                    <p className="text-xs text-slate-400">{s.preacher}</p>
                  </div>
                  <span className="text-xs text-slate-400">{format(new Date(s.date), 'dd MMM', { locale: fr })}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
