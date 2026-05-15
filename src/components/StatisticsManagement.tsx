import React, { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  UserPlus, 
  UserMinus, 
  PieChart, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Lightbulb, 
  ShieldCheck, 
  Baby, 
  GraduationCap, 
  Briefcase, 
  Heart,
  ChevronRight,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';
import { 
  format, 
  subMonths, 
  subWeeks,
  subYears,
  startOfMonth, 
  endOfMonth, 
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  isWithinInterval, 
  parseISO,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
  isSameWeek
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

// Number counter animation component
const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    let startFrame = displayValue;
    const endValue = value;
    const duration = 800;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutQuart
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      
      const current = Math.floor(startFrame + (endValue - startFrame) * easedProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    const requestId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestId);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

export function StatisticsManagement() {
  const { 
    members, 
    children, 
    services, 
    events, 
    transactions, 
    attendance, 
    contributionPayments, 
    churchProjects, 
    projectContributions,
    courses, 
    courseEnrollments,
    eventRegistrations
  } = useStore();

  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('overview');

  // --- Date Range Calculation ---
  const dateRange = useMemo(() => {
    const now = new Date();
    let start, end, prevStart, prevEnd;

    if (period === 'week') {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
      prevStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      prevEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    } else if (period === 'month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
      prevStart = startOfMonth(subMonths(now, 1));
      prevEnd = endOfMonth(subMonths(now, 1));
    } else {
      start = startOfYear(now);
      end = endOfYear(now);
      prevStart = startOfYear(subYears(now, 1));
      prevEnd = endOfYear(subYears(now, 1));
    }

    return { start, end, prevStart, prevEnd };
  }, [period]);

  // --- Data Processing ---

  // 1. Global Metrics
  const totalMembers = members?.length || 0;
  
  const newMembersThisPeriod = useMemo(() => (members || []).filter(m => {
    try {
      return m.joinedAt && isWithinInterval(parseISO(m.joinedAt), { start: dateRange.start, end: dateRange.end });
    } catch (e) { return false; }
  }).length, [members, dateRange]);

  const newMembersLastPeriod = useMemo(() => (members || []).filter(m => {
    try {
      return m.joinedAt && isWithinInterval(parseISO(m.joinedAt), { start: dateRange.prevStart, end: dateRange.prevEnd });
    } catch (e) { return false; }
  }).length, [members, dateRange]);
  
  const growthRate = newMembersLastPeriod === 0 ? 100 : ((newMembersThisPeriod - newMembersLastPeriod) / newMembersLastPeriod) * 100;

  // 2. Financial Metrics
  const incomeThisPeriod = useMemo(() => (transactions || [])
    .filter(t => {
      try {
        return t.type !== 'expense' && t.date && isWithinInterval(parseISO(t.date), { start: dateRange.start, end: dateRange.end });
      } catch (e) { return false; }
    })
    .reduce((sum, t) => sum + t.amount, 0), [transactions, dateRange]);
  
  const expensesThisPeriod = useMemo(() => (transactions || [])
    .filter(t => {
      try {
        return t.type === 'expense' && t.date && isWithinInterval(parseISO(t.date), { start: dateRange.start, end: dateRange.end });
      } catch (e) { return false; }
    })
    .reduce((sum, t) => sum + t.amount, 0), [transactions, dateRange]);

  const incomeLastPeriod = useMemo(() => (transactions || [])
    .filter(t => {
      try {
        return t.type !== 'expense' && t.date && isWithinInterval(parseISO(t.date), { start: dateRange.prevStart, end: dateRange.prevEnd });
      } catch (e) { return false; }
    })
    .reduce((sum, t) => sum + t.amount, 0), [transactions, dateRange]);

  const financeTrend = incomeLastPeriod === 0 ? 0 : ((incomeThisPeriod - incomeLastPeriod) / incomeLastPeriod) * 100;

  // 3. Attendance Metrics
  const periodAttendance = useMemo(() => (attendance || []).filter(a => {
    try {
      return isWithinInterval(parseISO(a.date), { start: dateRange.start, end: dateRange.end });
    } catch (e) { return false; }
  }), [attendance, dateRange]);

  const lastPeriodAttendance = useMemo(() => (attendance || []).filter(a => {
    try {
      return isWithinInterval(parseISO(a.date), { start: dateRange.prevStart, end: dateRange.prevEnd });
    } catch (e) { return false; }
  }), [attendance, dateRange]);

  const avgAttendance = periodAttendance.length > 0 
    ? Math.round(periodAttendance.reduce((sum, a) => sum + (a.count || 0), 0) / periodAttendance.length) 
    : 0;
  
  const avgAttendanceLast = lastPeriodAttendance.length > 0
    ? Math.round(lastPeriodAttendance.reduce((sum, a) => sum + (a.count || 0), 0) / lastPeriodAttendance.length)
    : 0;

  const attendanceTrend = avgAttendanceLast === 0 ? 0 : ((avgAttendance - avgAttendanceLast) / avgAttendanceLast) * 100;

  const activeMembers = (members || []).filter(m => m.status === 'active').length;

  // 4. Church Health Score
  const healthScore = useMemo(() => {
    const memberScore = (activeMembers / totalMembers) * 40;
    const financeScore = incomeThisPeriod > expensesThisPeriod ? 30 : 15;
    const attendanceScore = attendanceTrend >= 0 ? 30 : 10;
    return Math.min(100, Math.round(memberScore + financeScore + attendanceScore));
  }, [activeMembers, totalMembers, incomeThisPeriod, expensesThisPeriod, attendanceTrend]);

  // 5. Charts Data (Dynamic based on period)
  const attendanceData = useMemo(() => {
    if (period === 'week') {
      return eachDayOfInterval({ start: dateRange.start, end: dateRange.end }).map(day => {
        const record = attendance.find(a => isSameDay(parseISO(a.date), day));
        return {
          date: format(day, 'EEE', { locale: fr }),
          count: record ? record.count : 0
        };
      });
    } else if (period === 'month') {
      return eachWeekOfInterval({ start: dateRange.start, end: dateRange.end }).map((week, idx) => {
        const count = attendance
          .filter(a => isSameWeek(parseISO(a.date), week, { weekStartsOn: 1 }))
          .reduce((sum, a) => sum + a.count, 0);
        return {
          date: `Sem ${idx + 1}`,
          count: count
        };
      });
    } else {
      return eachMonthOfInterval({ start: dateRange.start, end: dateRange.end }).map(month => {
        const count = attendance
          .filter(a => isSameMonth(parseISO(a.date), month))
          .reduce((sum, a) => sum + a.count, 0);
        return {
          date: format(month, 'MMM', { locale: fr }),
          count: count
        };
      });
    }
  }, [attendance, period, dateRange]);

  const financeData = useMemo(() => {
    const intervals = period === 'week' 
      ? eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
      : period === 'month'
      ? eachWeekOfInterval({ start: dateRange.start, end: dateRange.end })
      : eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });

    return intervals.map((date, idx) => {
      let income = 0;
      let expenses = 0;
      
      if (period === 'week') {
        const dayTrans = transactions.filter(t => isSameDay(parseISO(t.date), date));
        income = dayTrans.filter(t => t.type !== 'expense').reduce((sum, t) => sum + t.amount, 0);
        expenses = dayTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      } else if (period === 'month') {
        const weekTrans = transactions.filter(t => isSameWeek(parseISO(t.date), date, { weekStartsOn: 1 }));
        income = weekTrans.filter(t => t.type !== 'expense').reduce((sum, t) => sum + t.amount, 0);
        expenses = weekTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      } else {
        const monthTrans = transactions.filter(t => isSameMonth(parseISO(t.date), date));
        income = monthTrans.filter(t => t.type !== 'expense').reduce((sum, t) => sum + t.amount, 0);
        expenses = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      }

      const label = period === 'week' 
        ? format(date, 'EEE', { locale: fr })
        : period === 'month'
        ? `Sem ${idx + 1}`
        : format(date, 'MMM', { locale: fr });

      return {
        label,
        income,
        expenses
      };
    });
  }, [transactions, period, dateRange]);

  const memberGrowthData = useMemo(() => {
    const intervals = period === 'week' 
      ? eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
      : period === 'month'
      ? eachWeekOfInterval({ start: dateRange.start, end: dateRange.end })
      : eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });

    return intervals.map((date, idx) => {
      let count = 0;
      if (period === 'week') {
        count = (members || []).filter(m => m.joinedAt && isSameDay(parseISO(m.joinedAt), date)).length;
      } else if (period === 'month') {
        count = (members || []).filter(m => m.joinedAt && isSameWeek(parseISO(m.joinedAt), date, { weekStartsOn: 1 })).length;
      } else {
        count = (members || []).filter(m => m.joinedAt && isSameMonth(parseISO(m.joinedAt), date)).length;
      }

      return {
        label: period === 'week' ? format(date, 'EEE', { locale: fr }) : period === 'month' ? `Sem ${idx + 1}` : format(date, 'MMM', { locale: fr }),
        count
      };
    });
  }, [members, period, dateRange]);

  const memberDistribution = [
    { name: 'Hommes', value: members.filter(m => m.gender === 'M').length },
    { name: 'Femmes', value: members.filter(m => m.gender === 'F').length },
  ];

  const ageDistribution = [
    { name: 'Adultes', value: members.length },
    { name: 'Enfants', value: children.length },
  ];

  // 6. Insights Generation
  const insights = useMemo(() => {
    const list = [];
    if (attendanceTrend < 0) {
      list.push({
        type: 'warning',
        title: 'Baisse de fréquentation',
        description: `La fréquentation a baissé de ${Math.abs(Math.round(attendanceTrend))}% par rapport au dernier culte.`,
        suggestion: 'Relancer les membres absents via SMS ou appels.'
      });
    } else {
      list.push({
        type: 'success',
        title: 'Croissance positive',
        description: 'La fréquentation est en hausse constante ces dernières semaines.',
        suggestion: 'Continuer les programmes d\'accueil et d\'intégration.'
      });
    }

    if (incomeThisPeriod < expensesThisPeriod) {
      list.push({
        type: 'danger',
        title: 'Déficit financier',
        description: 'Les dépenses de cette période dépassent les revenus.',
        suggestion: 'Réviser les dépenses non essentielles ou encourager les dons.'
      });
    }

    if (newMembersThisPeriod > 5) {
      list.push({
        type: 'info',
        title: 'Vague de nouveaux membres',
        description: `${newMembersThisPeriod} nouveaux membres ont rejoint l'église cette période.`,
        suggestion: 'Organiser une session d\'orientation pour les nouveaux.'
      });
    }

    return list;
  }, [attendanceTrend, incomeThisPeriod, expensesThisPeriod, newMembersThisPeriod]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-serif font-bold text-slate-900">Statistiques & Rapports</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 mt-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
            </div>
          </div>
          <p className="text-slate-500">Données synchronisées en temps réel avec votre base de données.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <Button 
              variant={period === 'week' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="text-xs h-8"
              onClick={() => setPeriod('week')}
            >
              Semaine
            </Button>
            <Button 
              variant={period === 'month' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="text-xs h-8"
              onClick={() => setPeriod('month')}
            >
              Mois
            </Button>
            <Button 
              variant={period === 'year' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="text-xs h-8"
              onClick={() => setPeriod('year')}
            >
              Année
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Membres</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    <AnimatedNumber value={totalMembers} />
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={cn(
                      "text-xs font-medium flex items-center",
                      growthRate >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {growthRate >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {Math.abs(Math.round(growthRate))}%
                    </span>
                    <span className="text-[10px] text-slate-400">vs période préc.</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-none shadow-sm bg-emerald-50/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-emerald-600 mb-1">Fréquentation Moy.</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    <AnimatedNumber value={avgAttendance} />
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={cn(
                      "text-xs font-medium flex items-center",
                      attendanceTrend >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {attendanceTrend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {Math.abs(Math.round(attendanceTrend))}%
                    </span>
                    <span className="text-[10px] text-slate-400">tendance</span>
                  </div>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-none shadow-sm bg-amber-50/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Revenus ({period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'})</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    <AnimatedNumber value={incomeThisPeriod} suffix=" FCFA" />
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={cn(
                      "text-xs font-medium flex items-center",
                      financeTrend >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {financeTrend >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {Math.abs(Math.round(financeTrend))}%
                    </span>
                    <span className="text-[10px] text-slate-400">vs période préc.</span>
                  </div>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-none shadow-sm bg-purple-50/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Score de Santé</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    <AnimatedNumber value={healthScore} suffix="/100" />
                  </h3>
                  <div className="w-full bg-purple-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <motion.div 
                      className="bg-purple-600 h-full rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${healthScore}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="members">Membres & Engagement</TabsTrigger>
          <TabsTrigger value="finances">Finances & Projets</TabsTrigger>
          <TabsTrigger value="activities">Activités & Formations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={period}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Chart */}
              <Card className="lg:col-span-2 border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Évolution de la Fréquentation</CardTitle>
                  <CardDescription>
                    {period === 'week' ? 'Par jour cette semaine' : period === 'month' ? 'Par semaine ce mois' : 'Par mois cette année'}
                  </CardDescription>
                </div>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Insights Panel */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-lg">Analyses Intelligentes</CardTitle>
                </div>
                <CardDescription>Basé sur vos données récentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className={cn(
                    "p-4 rounded-xl border-l-4",
                    insight.type === 'warning' ? "bg-amber-50 border-amber-400" :
                    insight.type === 'success' ? "bg-emerald-50 border-emerald-400" :
                    insight.type === 'danger' ? "bg-rose-50 border-rose-400" :
                    "bg-blue-50 border-blue-400"
                  )}>
                    <h4 className="text-sm font-bold mb-1">{insight.title}</h4>
                    <p className="text-xs text-slate-600 mb-2">{insight.description}</p>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-white/50 p-1.5 rounded-md">
                      <ChevronRight className="w-3 h-3" />
                      {insight.suggestion}
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs text-blue-600 hover:text-blue-700">
                  Voir toutes les analyses
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Répartition Membres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={memberDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {memberDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Adultes vs Enfants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={ageDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {ageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engagement Global</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Responsable</span>
                    <span className="font-medium">{members.filter(m => m.engagementLevel === 'leader').length}</span>
                  </div>
                  <Progress value={(members.filter(m => m.engagementLevel === 'leader').length / totalMembers) * 100} className="h-1.5 bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Membre actif</span>
                    <span className="font-medium">{members.filter(m => m.engagementLevel === 'active').length}</span>
                  </div>
                  <Progress value={(members.filter(m => m.engagementLevel === 'active').length / totalMembers) * 100} className="h-1.5 bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Nouveau</span>
                    <span className="font-medium">{members.filter(m => m.engagementLevel === 'new').length}</span>
                  </div>
                  <Progress value={(members.filter(m => m.engagementLevel === 'new').length / totalMembers) * 100} className="h-1.5 bg-slate-100" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Projets en cours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {churchProjects.slice(0, 2).map(project => {
                  const contributions = projectContributions.filter(c => c.projectId === project.id).reduce((sum, c) => sum + c.amount, 0);
                  const progress = (contributions / project.totalBudget) * 100;
                  return (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-medium truncate max-w-[120px]">{project.name}</span>
                        <span className="text-slate-500">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-slate-100" />
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" className="w-full text-[10px] h-7">
                  Voir tous les projets
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </AnimatePresence>
    </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Croissance des Membres</CardTitle>
                <CardDescription>Nouveaux membres par mois (6 derniers mois)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={memberGrowthData}>
                      <defs>
                        <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" name="Nouveaux Membres" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMembers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Membres les plus actifs</CardTitle>
                <CardDescription>Basé sur la participation aux services et événements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.sort((a, b) => b.engagementLevel === 'leader' ? 1 : -1).slice(0, 5).map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
                          <p className="text-[10px] text-slate-500">{member.groups.join(', ')}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 border-none">
                        Très Actif
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finances" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Revenus vs Dépenses</CardTitle>
                <CardDescription>Comparaison mensuelle sur les 6 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="income" name="Revenus" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="expenses" name="Dépenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Sources de Revenus</CardTitle>
                <CardDescription>Répartition par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={[
                          { name: 'Dîmes', value: transactions.filter(t => t.type === 'tithe').reduce((sum, t) => sum + t.amount, 0) },
                          { name: 'Offrandes', value: transactions.filter(t => t.type === 'offering').reduce((sum, t) => sum + t.amount, 0) },
                          { name: 'Dons', value: transactions.filter(t => t.type === 'donation').reduce((sum, t) => sum + t.amount, 0) },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {COLORS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Taux de paiement cotisations</span>
                    <span className="font-bold text-emerald-600">72%</span>
                  </div>
                  <Progress value={72} className="h-1.5 bg-slate-100" />
                  <p className="text-[10px] text-slate-400 italic text-center">"70% des membres ont payé leur cotisation ce mois"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Formations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{courses.length}</p>
                  <p className="text-xs text-slate-500">Parcours actifs</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Participants totaux</span>
                    <span className="font-bold">{courseEnrollments.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Taux de réussite</span>
                    <span className="font-bold text-emerald-600">85%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Progression moy.</span>
                    <span className="font-bold text-blue-600">64%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Baby className="w-5 h-5 text-pink-500" />
                  <CardTitle className="text-lg">Enfants</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{children.length}</p>
                  <p className="text-xs text-slate-500">Enfants inscrits</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Présence moyenne</span>
                    <span className="font-bold">92%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Nouveaux ce mois</span>
                    <span className="font-bold text-emerald-600">+3</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Groupes d'âge</span>
                    <span className="font-bold">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-lg">Événements</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{events.filter(e => e.status === 'completed').length}</p>
                  <p className="text-xs text-slate-500">Événements réalisés</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Participants totaux</span>
                    <span className="font-bold">{eventRegistrations.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Taux de présence</span>
                    <span className="font-bold text-emerald-600">
                      {Math.round((eventRegistrations.filter(r => r.isCheckedIn).length / eventRegistrations.length) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Satisfaction moy.</span>
                    <span className="font-bold text-amber-600">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Rapports Récents</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">Voir tout</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {[
                { name: 'Rapport Mensuel - Mars 2026', type: 'PDF', size: '1.2 MB', date: '01/04/2026' },
                { name: 'Bilan Financier Trimestriel Q1', type: 'Excel', size: '850 KB', date: '31/03/2026' },
                { name: 'Statistiques de Fréquentation Annuelle', type: 'PDF', size: '2.4 MB', date: '15/03/2026' },
              ].map((report, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      report.type === 'PDF' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {report.type === 'PDF' ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium group-hover:text-blue-600 transition-colors">{report.name}</p>
                      <p className="text-[10px] text-slate-400">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-church-gold" />
              Générer un Rapport
            </CardTitle>
            <CardDescription className="text-slate-400">Créez un rapport personnalisé en quelques clics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Type de rapport</label>
              <select className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-church-gold/50">
                <option>Rapport Pastoral Global</option>
                <option>Rapport Financier Détaillé</option>
                <option>Rapport de Croissance Membres</option>
                <option>Rapport d'Activités Départements</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Format</label>
                <select className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-sm outline-none">
                  <option>PDF</option>
                  <option>Excel</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Période</label>
                <select className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-sm outline-none">
                  <option>Mois dernier</option>
                  <option>Trimestre</option>
                  <option>Année</option>
                </select>
              </div>
            </div>
            <Button className="w-full bg-church-gold hover:bg-church-gold/90 text-slate-900 font-bold mt-2">
              Générer le Rapport
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
