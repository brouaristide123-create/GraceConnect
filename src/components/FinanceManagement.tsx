import React from 'react';
import { 
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Search,
  Smartphone,
  Banknote,
  Building2,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  Sparkles,
  AlertTriangle,
  FileText,
  History,
  Shield,
  Eye,
  UserCog,
  ArrowRight,
  CheckCircle2,
  Archive,
  Trash2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { useStore, Transaction, CashRegister, CashTransaction } from '../lib/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from './ui/form';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

// ── Label maps to avoid Base UI SelectValue showing raw English keys ──
const TX_TYPE_FR: Record<string, string> = {
  tithe: 'Dîme', offering: 'Offrande', donation: 'Don', expense: 'Dépense',
  income: 'Entrée', transfer: 'Virement',
};
const PERIOD_FR: Record<string, string> = {
  '3m': '3 Mois', '6m': '6 Mois', '1y': '1 An',
};
const LINKED_TYPE_FR: Record<string, string> = {
  general: 'Général', event: 'Événement', service: 'Culte',
};
const PAYMENT_FR: Record<string, string> = {
  Cash: 'Espèces', 'Mobile Money': 'Mobile Money', Bank: 'Virement Bancaire',
  Wave: 'Wave', Djamo: 'Djamo',
};

const transactionSchema = z.object({
  type: z.enum(['tithe', 'offering', 'donation', 'expense']),
  amount: z.coerce.number().min(0, "Le montant doit être positif"),
  category: z.string().min(1, "Catégorie requise"),
  churchId: z.string().min(1, "Église requise"),
  memberId: z.string().optional(),
  paymentMethod: z.enum(['Cash', 'Mobile Money', 'Bank']),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function FinanceManagement() {
  const { transactions, churches, members, addTransaction, cashRegisters, cashTransactions, addCashRegister, updateCashRegister, deleteCashRegister, addCashTransaction, currentUser, events, services } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isAddCaisseOpen, setIsAddCaisseOpen] = React.useState(false);
  const [isCaisseTransactionOpen, setIsCaisseTransactionOpen] = React.useState(false);
  const [selectedCaisseId, setSelectedCaisseId] = React.useState<string | null>(null);
  const [caisseForm, setCaisseForm] = React.useState({ name: '', description: '', linkedType: 'general' as 'general' | 'event' | 'service', linkedId: '' });
  const [txForm, setTxForm] = React.useState({ type: 'income' as CashTransaction['type'], amount: '', description: '', category: '', paymentMethod: 'Cash' as CashTransaction['paymentMethod'], notes: '' });
  const [isAISummaryEnabled, setIsAISummaryEnabled] = React.useState(true);
  const [showSummaryConfirm, setShowSummaryConfirm] = React.useState(false);
  const [pendingAIToggle, setPendingAIToggle] = React.useState(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = React.useState(false);
  const [isAIAssistanceEnabled, setIsAIAssistanceEnabled] = React.useState(true);
  const [showAIAssistConfirm, setShowAIAssistConfirm] = React.useState(false);
  const [pendingAIAssistToggle, setPendingAIAssistToggle] = React.useState(false);
  const [chartPeriod, setChartPeriod] = React.useState('6m');

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      type: 'tithe',
      amount: 0,
      category: 'Dîme',
      churchId: churches[0]?.id || 'default',
      memberId: '',
      paymentMethod: 'Cash',
      notes: '',
    },
  });

  const onSubmit = (values: any) => {
    addTransaction({
      ...values,
      date: new Date().toISOString(),
    });
    setIsAddDialogOpen(false);
    form.reset();
    toast.success("Transaction enregistrée");
  };

  const handleDownloadPDF = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Type,Categorie,Montant,Methode,Notes\n"
      + transactions.map(t => `${format(new Date(t.date), 'dd/MM/yyyy')},${t.type},${t.category},${t.amount},${t.paymentMethod},${t.notes || ''}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rapport_financier_${format(new Date(), 'yyyy_MM')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Le rapport PDF/CSV a été généré et téléchargé");
  };

  const toggleAISummary = () => {
    setPendingAIToggle(!isAISummaryEnabled);
    setShowSummaryConfirm(true);
  };

  const confirmAIToggle = () => {
    setIsAISummaryEnabled(pendingAIToggle);
    setShowSummaryConfirm(false);
    toast.success(pendingAIToggle ? "Résumé IA activé" : "Résumé IA désactivé");
  };

  const toggleAIAssistance = (checked: boolean) => {
    setPendingAIAssistToggle(checked);
    setShowAIAssistConfirm(true);
  };

  const confirmAIAssistanceToggle = () => {
    setIsAIAssistanceEnabled(pendingAIAssistToggle);
    setShowAIAssistConfirm(false);
    toast.success(pendingAIAssistToggle ? "Assistance IA activée" : "Assistance IA désactivée");
  };

  const income = transactions
    .filter(t => t.type !== 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const [lastSync, setLastSync] = React.useState(new Date());

  React.useEffect(() => {
    setLastSync(new Date());
  }, [transactions]);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = income - expenses;
  const savingsRate = income > 0 ? Math.round((netBalance / income) * 100) : 0;

  const currentMonthIncome = transactions
    .filter(t => t.type !== 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((acc, t) => acc + t.amount, 0);

  const lastMonthIncome = 450000; // Mock for comparison
  const incomeEvolution = ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;

  const chartData = [
    { name: 'Jan', income: 400000, expenses: 240000 },
    { name: 'Feb', income: 300000, expenses: 139800 },
    { name: 'Mar', income: 200000, expenses: 980000 },
    { name: 'Apr', income: 278000, expenses: 390800 },
    { name: 'May', income: 189000, expenses: 480000 },
    { name: 'Jun', income: 239000, expenses: 380000 },
    { name: 'Jul', income: 349000, expenses: 430000 },
  ];

  const expenseDistribution = React.useMemo(() => {
    const expensesList = transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};
    
    expensesList.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#64748b', '#ef4444', '#06b6d4'];
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyGoal = 1000000;
  const goalProgress = (income / monthlyGoal) * 100;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Vue d'ensemble Financière</h1>
          <p className="text-slate-500">Analyse complète et pilotage de la santé financière du ministère.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200">
            <Download className="w-4 h-4 mr-2" />
            Rapports
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger render={<Button className="bg-church-green hover:bg-church-green/90 shadow-lg shadow-church-green/20" />}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Transaction
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Enregistrer une transaction</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <span className="text-sm">{TX_TYPE_FR[field.value] || 'Type'}</span>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tithe">Dîme</SelectItem>
                              <SelectItem value="offering">Offrande</SelectItem>
                              <SelectItem value="donation">Don</SelectItem>
                              <SelectItem value="expense">Dépense</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant (FCFA)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie / Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Offrande de Dimanche" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mode de Paiement</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <span className="text-sm">{PAYMENT_FR[field.value] || field.value || 'Mode'}</span>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Cash">Espèces</SelectItem>
                              <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                              <SelectItem value="Bank">Virement Bancaire</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="churchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Église</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Église" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {churches.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                              {churches.length === 0 && <SelectItem value="default">Siège Central</SelectItem>}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="memberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membre (Optionnel)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un membre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Anonyme</SelectItem>
                            {members.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Détails supplémentaires..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-church-green">Enregistrer</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Hyper-visual Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-none shadow-md bg-white group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight className="w-12 h-12 text-emerald-600" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Entrées du mois</span>
              </div>
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
            </div>
            <div className="space-y-1">
              <motion.h3 
                key={currentMonthIncome}
                initial={{ scale: 1.1, color: "#10b981" }}
                animate={{ scale: 1, color: "#0f172a" }}
                className="text-2xl font-bold text-slate-900"
              >
                {currentMonthIncome.toLocaleString()} FCFA
              </motion.h3>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                <span>+{incomeEvolution.toFixed(1)}% vs mois dernier</span>
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-emerald-500" />
        </Card>

        <Card className="relative overflow-hidden border-none shadow-md bg-white group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownRight className="w-12 h-12 text-rose-600" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Dépenses totales</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100/50 border border-slate-200/50">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live</span>
              </div>
            </div>
            <div className="space-y-1">
              <motion.h3 
                key={expenses}
                initial={{ scale: 1.1, color: "#ef4444" }}
                animate={{ scale: 1, color: "#0f172a" }}
                className="text-2xl font-bold text-slate-900"
              >
                {expenses.toLocaleString()} FCFA
              </motion.h3>
              <div className="flex items-center gap-1 text-xs font-medium text-rose-600">
                <TrendingUp className="w-3 h-3" />
                <span>+12% ce mois</span>
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-rose-500" />
        </Card>

        <Card className="relative overflow-hidden border-none shadow-md bg-white group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-12 h-12 text-blue-600" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Solde Actuel</span>
              </div>
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </div>
            </div>
            <div className="space-y-1">
              <motion.h3 
                key={income - expenses}
                initial={{ scale: 1.1, color: "#3b82f6" }}
                animate={{ scale: 1, color: "#0f172a" }}
                className="text-2xl font-bold text-slate-900"
              >
                {(income - expenses).toLocaleString()} FCFA
              </motion.h3>
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Situation stable</span>
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-blue-500" />
        </Card>

        <Card className="relative overflow-hidden border-none shadow-md bg-white group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-12 h-12 text-amber-600" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Objectif Mensuel</span>
              </div>
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <motion.h3 
                  key={goalProgress}
                  initial={{ scale: 1.2, color: "#f59e0b" }}
                  animate={{ scale: 1, color: "#0f172a" }}
                  className="text-2xl font-bold text-slate-900"
                >
                  {goalProgress.toFixed(0)}%
                </motion.h3>
                <span className="text-xs text-slate-400 font-medium">Cible: 1M</span>
              </div>
              <Progress value={goalProgress} className="h-2 bg-amber-100" />
            </div>
          </CardContent>
          <div className="h-1 bg-amber-500" />
        </Card>
      </div>

      {/* Charts & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle>Analyse des Flux</CardTitle>
                  <CardDescription>Comparaison des entrées et sorties sur les 6 derniers mois</CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 tracking-wider">LIVE</span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-[10px] text-slate-400 font-medium">Synchronisé {format(lastSync, 'HH:mm:ss')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={chartPeriod} onValueChange={setChartPeriod}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <span className="text-xs">{PERIOD_FR[chartPeriod] || chartPeriod}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">3 Mois</SelectItem>
                    <SelectItem value="6m">6 Mois</SelectItem>
                    <SelectItem value="1y">1 An</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontSize: '12px', fontWeight: 600}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    name="Entrées" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    name="Dépenses" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-md bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Sparkles className="w-12 h-12 text-blue-400" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Sparkles className="w-5 h-5" />
                Assistant IA
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">ASSISTANCE</span>
                <Switch 
                  checked={isAIAssistanceEnabled} 
                  onCheckedChange={toggleAIAssistance}
                  className="data-checked:bg-blue-500"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAIAssistanceEnabled ? (
                <>
                  <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                    <p className="text-sm font-medium">💡 Insight du mois</p>
                    <p className="text-xs text-slate-300 mt-1">Les dépenses ont augmenté de 20% ce mois, principalement dues au matériel.</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                    <p className="text-sm font-medium">📈 Tendance</p>
                    <p className="text-xs text-slate-300 mt-1">Les offrandes sont en légère baisse. Envisagez une collecte spéciale lors du prochain événement.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full bg-yellow-400 border-none hover:bg-yellow-500 text-black font-bold"
                    onClick={() => setIsRecommendationsOpen(true)}
                  >
                    Voir l'analyse complète
                  </Button>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">L'assistance IA est désactivée.</p>
                  <p className="text-[10px] text-slate-500 mt-1">Activez-la pour obtenir des analyses et insights en temps réel.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Répartition des Dépenses</CardTitle>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">
                  <div className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                  </div>
                  <span className="text-[9px] font-bold text-blue-700 tracking-wider">LIVE</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Dernier mouvement: {format(lastSync, 'HH:mm')}</p>
            </CardHeader>
            <CardContent>
              <motion.div 
                key={expenseDistribution.length}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-[180px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {expenseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
              <div className="mt-4 space-y-2">
                {expenseDistribution.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                      <span className="text-slate-600 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {expenses > 0 ? ((item.value / expenses) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for detailed management */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-white">
            <History className="w-4 h-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="revenues" className="data-[state=active]:bg-white">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Revenus
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-white">
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Dépenses
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité & Accès
          </TabsTrigger>
          <TabsTrigger value="caisses" className="data-[state=active]:bg-white">
            <Archive className="w-4 h-4 mr-2" />
            Caisses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Dernières Opérations</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Rechercher..." className="pl-10 h-9" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                          Aucune transaction enregistrée.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.slice().reverse().slice(0, 10).map((t) => (
                        <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="text-sm text-slate-500">
                            {format(new Date(t.date), 'dd MMM yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{t.category}</p>
                              <p className="text-xs text-slate-400">Responsable: Trésorier Principal</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "capitalize font-normal",
                              t.type === 'expense' ? "border-rose-200 text-rose-600 bg-rose-50" : "border-emerald-200 text-emerald-600 bg-emerald-50"
                            )}>
                              {t.type === 'tithe' ? 'Dîme' : t.type === 'offering' ? 'Offrande' : t.type === 'donation' ? 'Don' : 'Dépense'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-slate-600">
                              {t.paymentMethod === 'Mobile Money' ? <Smartphone className="w-4 h-4" /> : 
                               t.paymentMethod === 'Bank' ? <Building2 className="w-4 h-4" /> : 
                               <Banknote className="w-4 h-4" />}
                              <span className="text-xs">{t.paymentMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-bold",
                            t.type === 'expense' ? "text-rose-600" : "text-emerald-600"
                          )}>
                            {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenues" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Sources de Revenus</CardTitle>
              <CardDescription>Détail par catégorie d'entrée</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Dîmes', amount: 450000, color: 'bg-emerald-500' },
                { label: 'Offrandes', amount: 280000, color: 'bg-blue-500' },
                { label: 'Dons Spéciaux', amount: 150000, color: 'bg-amber-500' },
                { label: 'Événements', amount: 120000, color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold">{item.amount.toLocaleString()} FCFA</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{width: `${(item.amount / 1000000) * 100}%`}} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Alertes Intelligentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Solde Faible</p>
                  <p className="text-xs text-amber-700">Le solde actuel est inférieur à 20% de l'objectif mensuel.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                <TrendingUp className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-rose-900">Dépenses Élevées</p>
                  <p className="text-xs text-rose-700">Les dépenses de maintenance ont dépassé le budget alloué de 15%.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Loyer & Charges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">150,000 FCFA</p>
                <p className="text-xs text-slate-500 mt-1">Payé le 05/04</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Aide Sociale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">80,000 FCFA</p>
                <p className="text-xs text-slate-500 mt-1">3 familles aidées</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Matériel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">120,000 FCFA</p>
                <p className="text-xs text-slate-500 mt-1">Sonorisation</p>
              </CardContent>
            </Card>
          </div>
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Justificatifs & Reçus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-slate-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group hover:border-church-green transition-colors cursor-pointer">
                    <FileText className="w-8 h-8 text-slate-400 group-hover:text-church-green" />
                    <span className="text-[10px] text-slate-500 mt-2">Reçu_{i}.pdf</span>
                  </div>
                ))}
                <div className="aspect-square bg-slate-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Plus className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] text-slate-500 mt-2">Ajouter un reçu</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Gestion des Accès Financiers</CardTitle>
              <CardDescription>Définissez qui peut voir et modifier les données financières.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { name: 'Pasteur Principal', role: 'Admin', icon: Shield, color: 'text-rose-600 bg-rose-50' },
                  { name: 'Trésorier', role: 'Éditeur', icon: UserCog, color: 'text-blue-600 bg-blue-50' },
                  { name: 'Secrétaire', role: 'Lecture seule', icon: Eye, color: 'text-slate-600 bg-slate-50' },
                ].map((user) => (
                  <div key={user.name} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", user.color)}>
                        <user.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Gérer</Button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-semibold">Journal des Actions</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <strong>Trésorier</strong> a ajouté une dépense (Loyer) - <span className="text-slate-400">Il y a 2h</span>
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <strong>Admin</strong> a validé le rapport mensuel - <span className="text-slate-400">Hier</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CAISSES ── */}
        <TabsContent value="caisses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Gestion des Caisses</h3>
              <p className="text-slate-500 text-sm">Gérez les caisses de votre église avec leur solde en temps réel.</p>
            </div>
            <Button
              className="bg-church-gold hover:bg-church-gold/90 text-white"
              onClick={() => setIsAddCaisseOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une caisse
            </Button>
          </div>

          {cashRegisters.filter(r => r.churchId === (currentUser?.churchId || churches[0]?.id)).length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Archive className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600">Aucune caisse créée</h3>
              <p className="text-slate-400 text-sm">Créez votre première caisse pour commencer à gérer les fonds.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cashRegisters.filter(r => r.churchId === (currentUser?.churchId || churches[0]?.id)).map(reg => {
                const regTxs = cashTransactions.filter(t => t.registerId === reg.id);
                return (
                  <Card key={reg.id} className="border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{reg.name}</CardTitle>
                          {reg.description && <CardDescription className="text-xs mt-1">{reg.description}</CardDescription>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-400 hover:text-rose-600" onClick={() => deleteCashRegister(reg.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Solde actuel</span>
                        <span className={cn("text-xl font-bold", reg.balance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                          {reg.balance.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      {reg.linkedTo && (
                        <Badge className="bg-slate-100 text-slate-600 border-none text-xs">
                          {reg.linkedTo.type === 'event' ? 'Événement' : reg.linkedTo.type === 'service' ? 'Culte' : 'Général'}
                          {reg.linkedTo.name ? ` : ${reg.linkedTo.name}` : ''}
                        </Badge>
                      )}
                      <p className="text-xs text-slate-400">{regTxs.length} transaction(s)</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                          onClick={() => { setSelectedCaisseId(reg.id); setTxForm(f => ({...f, type: 'income'})); setIsCaisseTransactionOpen(true); }}
                        >
                          + Entrée
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 text-xs h-8"
                          onClick={() => { setSelectedCaisseId(reg.id); setTxForm(f => ({...f, type: 'expense'})); setIsCaisseTransactionOpen(true); }}
                        >
                          - Dépense
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={() => { setSelectedCaisseId(reg.id); setTxForm(f => ({...f, type: 'donation'})); setIsCaisseTransactionOpen(true); }}
                        >
                          Don
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Dialog: Créer caisse */}
          <Dialog open={isAddCaisseOpen} onOpenChange={setIsAddCaisseOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une caisse</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Nom *</label>
                  <Input placeholder="ex: Caisse Principale, Caisse Concert..." value={caisseForm.name} onChange={e => setCaisseForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                  <Input placeholder="Description optionnelle..." value={caisseForm.description} onChange={e => setCaisseForm(f => ({...f, description: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Liée à</label>
                  <Select value={caisseForm.linkedType} onValueChange={(v: any) => setCaisseForm(f => ({...f, linkedType: v, linkedId: ''}))}>
                    <SelectTrigger>
                      <span className="text-sm">{LINKED_TYPE_FR[caisseForm.linkedType] || caisseForm.linkedType}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Général</SelectItem>
                      <SelectItem value="event">Événement</SelectItem>
                      <SelectItem value="service">Culte</SelectItem>
                    </SelectContent>
                  </Select>
                  {caisseForm.linkedType === 'event' && (
                    <Select value={caisseForm.linkedId} onValueChange={v => setCaisseForm(f => ({...f, linkedId: v}))}>
                      <SelectTrigger><SelectValue placeholder="Choisir un événement" /></SelectTrigger>
                      <SelectContent>
                        {events.filter(e => e.churchId === (currentUser?.churchId || churches[0]?.id)).map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {caisseForm.linkedType === 'service' && (
                    <Select value={caisseForm.linkedId} onValueChange={v => setCaisseForm(f => ({...f, linkedId: v}))}>
                      <SelectTrigger><SelectValue placeholder="Choisir un culte" /></SelectTrigger>
                      <SelectContent>
                        {services.filter(s => s.churchId === (currentUser?.churchId || churches[0]?.id)).map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.theme || s.date}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCaisseOpen(false)}>Annuler</Button>
                <Button
                  className="bg-church-gold hover:bg-church-gold/90 text-white"
                  onClick={() => {
                    if (!caisseForm.name.trim()) { toast.error("Le nom est requis"); return; }
                    const linkedItem = caisseForm.linkedType !== 'general'
                      ? (caisseForm.linkedType === 'event'
                          ? events.find(e => e.id === caisseForm.linkedId)
                          : services.find(s => s.id === caisseForm.linkedId))
                      : undefined;
                    addCashRegister({
                      name: caisseForm.name,
                      description: caisseForm.description,
                      churchId: currentUser?.churchId || churches[0]?.id || '',
                      balance: 0,
                      isActive: true,
                      linkedTo: caisseForm.linkedType !== 'general' ? {
                        type: caisseForm.linkedType,
                        id: caisseForm.linkedId || undefined,
                        name: linkedItem && 'name' in linkedItem ? linkedItem.name : linkedItem && 'theme' in linkedItem ? linkedItem.theme : undefined
                      } : undefined,
                    });
                    setCaisseForm({ name: '', description: '', linkedType: 'general', linkedId: '' });
                    setIsAddCaisseOpen(false);
                    toast.success("Caisse créée avec succès");
                  }}
                >
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Transaction */}
          <Dialog open={isCaisseTransactionOpen} onOpenChange={setIsCaisseTransactionOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvelle transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Type</label>
                  <Select value={txForm.type} onValueChange={(v: any) => setTxForm(f => ({...f, type: v}))}>
                    <SelectTrigger>
                      <span className="text-sm">{TX_TYPE_FR[txForm.type] || txForm.type}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Entrée</SelectItem>
                      <SelectItem value="expense">Dépense</SelectItem>
                      <SelectItem value="donation">Don</SelectItem>
                      <SelectItem value="offering">Offrande</SelectItem>
                      <SelectItem value="tithe">Dîme</SelectItem>
                      <SelectItem value="transfer">Virement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Montant (FCFA) *</label>
                  <Input type="number" min="0" placeholder="0" value={txForm.amount} onChange={e => setTxForm(f => ({...f, amount: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Description *</label>
                  <Input placeholder="Description..." value={txForm.description} onChange={e => setTxForm(f => ({...f, description: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Catégorie</label>
                  <Input placeholder="ex: Quête, Frais, Dîme..." value={txForm.category} onChange={e => setTxForm(f => ({...f, category: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Méthode de paiement</label>
                  <Select value={txForm.paymentMethod} onValueChange={(v: any) => setTxForm(f => ({...f, paymentMethod: v}))}>
                    <SelectTrigger>
                      <span className="text-sm">{PAYMENT_FR[txForm.paymentMethod] || txForm.paymentMethod}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Espèces</SelectItem>
                      <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                      <SelectItem value="Bank">Virement bancaire</SelectItem>
                      <SelectItem value="Wave">Wave</SelectItem>
                      <SelectItem value="Djamo">Djamo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCaisseTransactionOpen(false)}>Annuler</Button>
                <Button
                  className="bg-church-gold hover:bg-church-gold/90 text-white"
                  onClick={() => {
                    if (!txForm.amount || !txForm.description) { toast.error("Montant et description requis"); return; }
                    addCashTransaction({
                      registerId: selectedCaisseId!,
                      type: txForm.type,
                      amount: parseFloat(txForm.amount),
                      description: txForm.description,
                      category: txForm.category || txForm.type,
                      paymentMethod: txForm.paymentMethod,
                      date: new Date().toISOString(),
                      notes: txForm.notes,
                    });
                    setTxForm({ type: 'income', amount: '', description: '', category: '', paymentMethod: 'Cash', notes: '' });
                    setIsCaisseTransactionOpen(false);
                    toast.success("Transaction enregistrée");
                  }}
                >
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Monthly Summary Feature */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-church-green to-emerald-700 text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                  <Sparkles className="w-3 h-3" />
                  Résumé Automatique Mars 2026
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-full border border-white/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider">IA</span>
                  <button 
                    onClick={toggleAISummary}
                    className={cn(
                      "w-8 h-4 rounded-full transition-colors relative",
                      isAISummaryEnabled ? "bg-white" : "bg-slate-500"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 rounded-full transition-all bg-emerald-600",
                      isAISummaryEnabled ? "left-[18px]" : "left-0.5"
                    )} />
                  </button>
                </div>
              </div>
              <h2 className="text-3xl font-serif font-bold">Bilan Financier Mensuel</h2>
              {isAISummaryEnabled ? (
                <p className="text-emerald-50 max-w-md">
                  Votre ministère a généré un surplus de <strong>{netBalance.toLocaleString()} FCFA</strong> ce mois. 
                  Les offrandes représentent le pilier de vos revenus. Votre taux d'épargne est de <strong>{savingsRate}%</strong>.
                </p>
              ) : (
                <p className="text-emerald-50/50 italic max-w-md">
                  Le résumé automatique de l'IA est actuellement désactivé. Activez-le pour obtenir une analyse détaillée de vos finances.
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Button 
                  className="bg-white text-emerald-700 hover:bg-emerald-50"
                  onClick={handleDownloadPDF}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger le PDF
                </Button>
                <Button 
                  variant="outline" 
                   className="border-white/30 text-black bg-orange-500 hover:bg-orange-600 border-none font-bold"
                  onClick={() => setIsRecommendationsOpen(true)}
                >
                  Voir les recommandations
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                <p className="text-xs text-emerald-200">Entrées</p>
                <p className="text-xl font-bold">{(income / 1000).toFixed(0)}k</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                <p className="text-xs text-emerald-200">Dépenses</p>
                <p className="text-xl font-bold">{(expenses / 1000).toFixed(0)}k</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-center col-span-2">
                <p className="text-xs text-emerald-200">Taux d'Épargne</p>
                <p className="text-xl font-bold">{savingsRate}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations Dialog */}
      <Dialog open={isRecommendationsOpen} onOpenChange={setIsRecommendationsOpen}>
        <DialogContent className="max-w-lg bg-slate-50 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-serif">Recommandations Stratégiques</DialogTitle>
                <p className="text-sm text-slate-500 italic">Basé sur une analyse de {transactions.length} transactions ce mois-ci</p>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] px-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Card className="border-none shadow-sm overflow-hidden border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">Optimisation des Entrées</CardTitle>
                      <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2 text-slate-600">
                    <p>• Promouvoir davantage les dons via Mobile Money pour faciliter les contributions à distance.</p>
                    <p>• Les offrandes dominicales ont baissé de 5%. Envisager un message de sensibilisation sur la vision des projets en cours.</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden border-l-4 border-l-orange-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">Contrôle des Coûts</CardTitle>
                      <ArrowDownRight className="w-4 h-4 text-orange-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2 text-slate-600">
                    <p>• Les frais d'électricité sont en hausse constante (+12%). Envisager l'installation de projecteurs LED basse consommation.</p>
                    <p>• Remplacer certains achats ponctuels par des achats en gros pour les consommables de nettoyage.</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">Planification Future</CardTitle>
                      <Target className="w-4 h-4 text-emerald-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2 text-slate-600">
                    <p>• Au rythme actuel, le fonds de réserve sera épuisé en cas d'imprévu majeur. Viser un taux d'épargne de 20%.</p>
                    <p>• Allouer 50,000 FCFA supplémentaires par mois au fonds de maintenance préventive du temple.</p>
                  </CardContent>
                </Card>

                <div className="p-4 bg-orange-600 rounded-xl text-white flex flex-col justify-center">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2">Score de Santé Financière</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-serif font-bold">82/100</span>
                    <span className="text-[10px] mb-1 opacity-80 decoration-emerald-300 underline">Excellent</span>
                  </div>
                  <Progress value={82} className="h-2 bg-white/20 mt-4" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-900">Note Importante</p>
                    <p className="text-xs text-orange-800 leading-relaxed">
                      Ces recommandations sont générées par l'intelligence artificielle pour vous aider dans la prise de décision. 
                      Veuillez valider chaque action avec le conseil presbytéral.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-0 flex sm:justify-center">
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 flex-1" onClick={() => setIsRecommendationsOpen(false)}>
              J'ai compris ces recommandations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Toggle Confirmation Dialog */}
      <Dialog open={showSummaryConfirm} onOpenChange={setShowSummaryConfirm}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>{pendingAIToggle ? "Activer l'IA ?" : "Désactiver l'IA ?"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600">
            {pendingAIToggle 
              ? "L'IA analysera vos transactions pour générer des résumés et des recommandations stratégiques." 
              : "Le résumé automatique et les recommandations ne seront plus générés jusqu'à réactivation."}
          </div>
          <DialogFooter className="flex gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setShowSummaryConfirm(false)}>
              Annuler
            </Button>
            <Button 
              className={cn("flex-1", pendingAIToggle ? "bg-church-green" : "bg-rose-600 hover:bg-rose-700")} 
              onClick={confirmAIToggle}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Assistance Toggle Confirmation Dialog */}
      <Dialog open={showAIAssistConfirm} onOpenChange={setShowAIAssistConfirm}>
        <DialogContent className="max-w-xs text-center sm:text-left">
          <DialogHeader>
            <DialogTitle>{pendingAIAssistToggle ? "Activer l'assistance IA ?" : "Désactiver l'assistance IA ?"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600 leading-relaxed">
            {pendingAIAssistToggle 
              ? "L'assistance IA vous fournira des insights en temps réel et des analyses prédictives sur vos finances." 
              : "En désactivant l'assistance, vous ne recevrez plus d'insights ou de tendances automatiques."}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" className="flex-1 text-slate-600" onClick={() => setShowAIAssistConfirm(false)}>
              Annuler
            </Button>
            <Button 
              className={cn("flex-1 font-bold", pendingAIAssistToggle ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-700 hover:bg-slate-800")} 
              onClick={confirmAIAssistanceToggle}
            >
              Confirmer le choix
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
