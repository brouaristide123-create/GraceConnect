import React from 'react';
import { 
  Coins, 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  History,
  Download,
  CreditCard,
  Smartphone,
  Banknote,
  MoreVertical,
  ArrowRight,
  Bell,
  Sparkles,
  Shield,
  FileText
} from 'lucide-react';
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
  DialogDescription,
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
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useStore, ContributionType, ContributionPayment, Member } from '../lib/store';
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const paymentSchema = z.object({
  memberId: z.string().min(1, "Membre requis"),
  amount: z.coerce.number().min(1, "Le montant doit être supérieur à 0"),
  paymentMethod: z.enum(['Cash', 'Mobile Money', 'Bank']),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const typeSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  amount: z.coerce.number().min(1, "Montant requis"),
  frequency: z.enum(['monthly', 'weekly', 'annual', 'one-time']),
  deadline: z.string().optional(),
  churchId: z.string().min(1, "Église requise"),
});

type TypeFormValues = z.infer<typeof typeSchema>;

function ContributionDetail({ type, onClose }: { type: ContributionType; onClose: () => void }) {
  const { 
    members, 
    contributionPayments, 
    addContributionPayment 
  } = useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddPaymentOpen, setIsAddPaymentOpen] = React.useState(false);

  const payments = contributionPayments.filter(p => p.typeId === type.id);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      memberId: '',
      amount: type.amount,
      paymentMethod: 'Cash',
      notes: '',
    },
  });

  const onSubmit = (values: PaymentFormValues) => {
    addContributionPayment({
      ...values,
      typeId: type.id,
      date: new Date().toISOString(),
      status: 'paid',
    });
    setIsAddPaymentOpen(false);
    form.reset();
    toast.success("Paiement enregistré");
  };

  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paidMemberIds = new Set(payments.map(p => p.memberId));
  const unpaidMembers = members.filter(m => !paidMemberIds.has(m.id) && m.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">{type.name}</h2>
            <p className="text-sm text-slate-500">
              {type.amount.toLocaleString()} FCFA • {
                type.frequency === 'monthly' ? 'Mensuel' :
                type.frequency === 'weekly' ? 'Hebdomadaire' :
                type.frequency === 'annual' ? 'Annuel' : 'Ponctuel'
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Exportation en cours...")}>
            <Download className="w-4 h-4 mr-2" /> Exporter
          </Button>
          <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
            <DialogTrigger render={<Button size="sm" className="bg-church-green" />}>
              <Plus className="w-4 h-4 mr-2" /> Nouveau Paiement
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enregistrer un paiement</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control as any}
                    name="memberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membre</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Choisir un membre" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {members.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant (FCFA)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mode</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Cash">Espèces</SelectItem>
                              <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                              <SelectItem value="Bank">Banque</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-church-green">Valider</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-slate-900">{totalCollected.toLocaleString()} FCFA</p>
                <p className="text-xs text-slate-500 mt-1">Total collecté à ce jour</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Participation</span>
                  <span className="font-bold">{payments.length} / {members.length} membres</span>
                </div>
                <Progress value={(payments.length / members.length) * 100} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                En attente ({unpaidMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {unpaidMembers.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-100 shadow-sm">
                    <span className="text-xs font-medium">{m.firstName} {m.lastName}</span>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-amber-600">
                      <Bell className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full text-amber-700 mt-2 text-xs h-8">
                Tout relancer
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm h-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">Historique des versements</CardTitle>
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Chercher..." 
                    className="pl-9 h-8 text-xs" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Membre</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-slate-400 italic">
                          Aucun versement enregistré pour le moment.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments
                        .filter(p => {
                          const m = members.find(mem => mem.id === p.memberId);
                          return m && `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
                        })
                        .map(p => {
                          const m = members.find(mem => mem.id === p.memberId);
                          return (
                            <TableRow key={p.id} className="hover:bg-slate-50/50">
                              <TableCell className="font-medium">{m ? `${m.firstName} ${m.lastName}` : 'Inconnu'}</TableCell>
                              <TableCell className="text-xs text-slate-500">{format(new Date(p.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                              <TableCell className="text-xs">{p.paymentMethod}</TableCell>
                              <TableCell className="text-right font-bold text-emerald-600">{p.amount.toLocaleString()} FCFA</TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContributionJournal({ onClose }: { onClose: () => void }) {
  const logs = [
    { id: '1', action: 'Génération automatique', details: 'Prochaine cotisation mensuelle générée pour 142 membres', date: '2026-04-01T08:00:00Z', type: 'system' },
    { id: '2', action: 'Identification retards', details: '12 membres identifiés en retard (échéance du 15 dépassée)', date: '2026-04-16T09:30:00Z', type: 'alert' },
    { id: '3', action: 'Relance automatique', details: 'Emails et SMS envoyés aux 12 membres en retard', date: '2026-04-16T10:00:00Z', type: 'notification' },
    { id: '4', action: 'Configuration mise à jour', details: 'Date de détection des retards modifiée du 15 au 18', date: '2026-04-17T11:20:00Z', type: 'admin' },
    { id: '5', action: 'Clôture de mois', details: 'Rapport mensuel généré et envoyé à la comptabilité', date: '2026-03-31T23:59:59Z', type: 'system' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10 border-slate-200 hover:bg-slate-50 transition-colors"
            onClick={onClose}
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Journal du Système</h2>
            <p className="text-sm text-slate-500">Historique des actions automatiques et logs système.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.info("Journal exporté")} className="border-slate-200 text-slate-600 hover:bg-slate-50">
          <Download className="w-4 h-4 mr-2" /> Exporter le log
        </Button>
      </div>

      <Card className="border-none shadow-lg bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[200px] py-4 px-6">Date & Heure</TableHead>
                <TableHead className="py-4 px-6">Action</TableHead>
                <TableHead className="py-4 px-6">Détails</TableHead>
                <TableHead className="text-right py-4 px-6">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id} className="hover:bg-slate-50/20 border-slate-100">
                  <TableCell className="text-xs text-slate-400 font-mono px-6">
                    {format(new Date(log.date), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800 px-6">{log.action}</TableCell>
                  <TableCell className="text-sm text-slate-500 px-6">{log.details}</TableCell>
                  <TableCell className="text-right px-6">
                    <Badge variant="outline" className={cn(
                      "capitalize text-[10px] px-2 py-0 h-5 border-none",
                      log.type === 'system' ? "bg-blue-50 text-blue-700" :
                      log.type === 'alert' ? "bg-amber-50 text-amber-700" :
                      log.type === 'notification' ? "bg-emerald-50 text-emerald-700" :
                      "bg-slate-50 text-slate-600"
                    )}>
                      {log.type === 'system' ? 'Système' : 
                       log.type === 'alert' ? 'Alerte' : 
                       log.type === 'notification' ? 'Notification' : 'Admin'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function ContributionsManagement() {
  const { 
    members, 
    contributionTypes, 
    contributionPayments, 
    contributionGoals,
    churches,
    addContributionPayment,
    addContributionType,
    currentUser,
  } = useStore();

  const [selectedTypeId, setSelectedTypeId] = React.useState<string | null>(null);
  const [isAddTypeOpen, setIsAddTypeOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isConfigRulesOpen, setIsConfigRulesOpen] = React.useState(false);
  const [showJournal, setShowJournal] = React.useState(false);
  const [intelligentRules, setIntelligentRules] = React.useState({
    generationDay: 1,
    lateDay: 15,
    autoAlerts: true,
    isAutoEnabled: true
  });
  const [isToggleAutoOpen, setIsToggleAutoOpen] = React.useState(false);

  const paidCount = contributionPayments.filter(p => p.status === 'paid').length;
  const pendingCount = contributionPayments.filter(p => p.status === 'pending').length;
  const overdueCount = contributionPayments.filter(p => p.status === 'overdue').length;
  const totalExpected = contributionPayments.length;
  const globalScore = totalExpected > 0 ? Math.round((paidCount / totalExpected) * 100) : 0;

  const typeForm = useForm<TypeFormValues>({
    resolver: zodResolver(typeSchema) as any,
    defaultValues: {
      name: '',
      amount: 0,
      frequency: 'monthly',
      deadline: '',
      churchId: currentUser?.churchId || churches[0]?.id || '1'
    },
  });

  const onAddType = (values: TypeFormValues) => {
    addContributionType(values);
    setIsAddTypeOpen(false);
    typeForm.reset();
    toast.success("Catégorie de cotisation créée");
  };

  const selectedType = contributionTypes.find(t => t.id === selectedTypeId);

  if (selectedType) {
    return <ContributionDetail type={selectedType} onClose={() => setSelectedTypeId(null)} />;
  }

  if (showJournal) {
    return <ContributionJournal onClose={() => setShowJournal(false)} />;
  }

  const totalCollected = contributionPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Gestion des Cotisations</h1>
          <p className="text-slate-500">Suivi des engagements financiers et contributions des membres.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Dialog open={isAddTypeOpen} onOpenChange={setIsAddTypeOpen}>
            <DialogTrigger render={<Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg" />}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Type
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Définir une nouvelle cotisation</DialogTitle>
              </DialogHeader>
              <Form {...typeForm}>
                <form onSubmit={typeForm.handleSubmit(onAddType)} className="space-y-4">
                  <FormField
                    control={typeForm.control as any}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la Cotisation</FormLabel>
                        <FormControl><Input placeholder="Ex: Cotisation Mensuelle, Fonds Social..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={typeForm.control as any}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant (FCFA)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={typeForm.control as any}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fréquence</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="monthly">Mensuel</SelectItem>
                              <SelectItem value="weekly">Hebdo</SelectItem>
                              <SelectItem value="annual">Annuel</SelectItem>
                              <SelectItem value="one-time">Ponctuel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={typeForm.control as any}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Limite (Optionnel)</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-slate-900">Créer</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contributionTypes.map(type => {
          const payments = contributionPayments.filter(p => p.typeId === type.id);
          const collected = payments.reduce((acc, p) => acc + p.amount, 0);
          
          return (
            <Card key={type.id} className="border-none shadow-sm hover:shadow-md transition-all group border-l-4 border-church-gold">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-church-gold/10 text-church-gold border-none">
                    {type.frequency === 'monthly' ? 'Mensuel' : 
                     type.frequency === 'weekly' ? 'Hebdo' : 
                     type.frequency === 'annual' ? 'Annuel' : 'Ponctuel'}
                  </Badge>
                  {type.deadline && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(type.deadline), 'dd MMM yyyy')}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">{type.name}</h3>
                <p className="text-sm font-bold text-church-green mb-6">{type.amount.toLocaleString()} FCFA</p>
                
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Total Collecté</span>
                    <span className="font-bold text-slate-900">{collected.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Participation</span>
                    <span className="font-bold text-slate-900">{payments.length} membres</span>
                  </div>
                  <Button 
                    className="w-full bg-white text-church-gold border border-church-gold/20 hover:bg-church-gold hover:text-white transition-all"
                    onClick={() => setSelectedTypeId(type.id)}
                  >
                    Détails <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="history" className="data-[state=active]:bg-white text-xs">
            <History className="w-3.5 h-3.5 mr-2" />
            Historique des Paiements
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-white text-xs">
            <TrendingUp className="w-3.5 h-3.5 mr-2" />
            Statistiques & Analyse
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Timeline des Contributions</CardTitle>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="Mois" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les mois</SelectItem>
                      <SelectItem value="03">Mars 2026</SelectItem>
                      <SelectItem value="02">Février 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributionPayments.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-slate-400 text-sm italic">
                    Aucun historique de paiement disponible.
                  </div>
                ) : (
                  contributionPayments.slice().reverse().map((payment) => {
                    const member = members.find(m => m.id === payment.memberId);
                    const type = contributionTypes.find(t => t.id === payment.typeId);
                    return (
                      <div key={payment.id} className="flex items-start gap-4 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-slate-900">
                              {member?.firstName} {member?.lastName}
                            </p>
                            <span className="text-sm font-bold text-emerald-600">+{payment.amount.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-slate-500">{type?.name} • {payment.paymentMethod}</p>
                            <span className="text-[10px] text-slate-400">{format(new Date(payment.date), 'dd MMM yyyy HH:mm')}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Évolution de la Collecte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Jan', amount: 320000 },
                      { name: 'Fév', amount: 410000 },
                      { name: 'Mar', amount: totalCollected },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Membres les plus Réguliers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {members.slice(0, 4).map((m, i) => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">#{i+1}</span>
                      <span className="text-sm font-medium">{m.firstName} {m.lastName}</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">100% à jour</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>

      {/* Automatic Mode Feature */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-950 text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <Dialog open={isToggleAutoOpen} onOpenChange={setIsToggleAutoOpen}>
                <DialogTrigger 
                  render={
                    <button className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all hover:scale-105 active:scale-95",
                      intelligentRules.isAutoEnabled 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                        : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                    )} />
                  }
                >
                  <Sparkles className={cn("w-3 h-3", intelligentRules.isAutoEnabled ? "text-emerald-400" : "text-slate-400")} />
                  Mode Automatique {intelligentRules.isAutoEnabled ? 'Activé' : 'Désactivé'}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {intelligentRules.isAutoEnabled ? 'Désactiver' : 'Activer'} le mode automatique ?
                    </DialogTitle>
                    <DialogDescription>
                      {intelligentRules.isAutoEnabled 
                        ? "La génération mensuelle et l'identification des retards ne seront plus effectuées automatiquement par le système."
                        : "Le système reprendra la génération automatique des cotisations et la détection des retards selon vos règles."}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsToggleAutoOpen(false)}>Annuler</Button>
                    <Button 
                      className={cn(intelligentRules.isAutoEnabled ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700")}
                      onClick={() => {
                        setIntelligentRules(prev => ({ ...prev, isAutoEnabled: !prev.isAutoEnabled }));
                        setIsToggleAutoOpen(false);
                        toast.success(intelligentRules.isAutoEnabled ? "Mode automatique désactivé" : "Mode automatique activé");
                      }}
                    >
                      Confirmer la {intelligentRules.isAutoEnabled ? 'désactivation' : 'activation'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <h2 className="text-2xl font-serif font-bold">
                Génération Mensuelle Intelligente 
                {!intelligentRules.isAutoEnabled && <span className="text-sm font-sans font-normal text-rose-500 ml-2">(Inactif)</span>}
              </h2>
              <p className={cn("text-sm max-w-md transition-opacity", intelligentRules.isAutoEnabled ? "text-slate-300" : "text-slate-500 italic")}>
                {intelligentRules.isAutoEnabled 
                  ? `Le système génère automatiquement les cotisations attendues le ${intelligentRules.generationDay}${intelligentRules.generationDay === 1 ? 'er' : ''} de chaque mois et identifie les retards après le ${intelligentRules.lateDay}.`
                  : "Le mode automatique est actuellement désactivé. Aucune opération intelligente n'est en cours."}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Dialog open={isConfigRulesOpen} onOpenChange={setIsConfigRulesOpen}>
                  <DialogTrigger render={<Button disabled={!intelligentRules.isAutoEnabled} className="bg-blue-600 hover:bg-blue-700 text-white text-xs disabled:opacity-50" />}>
                    Configurer les règles
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Règles de génération intelligente</DialogTitle>
                      <DialogDescription>Paramétrez les automatismes du système pour les cotisations périodiques.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          Jour de génération mensuelle
                        </label>
                        <Select 
                          value={intelligentRules.generationDay.toString()} 
                          onValueChange={(v) => setIntelligentRules(prev => ({ ...prev, generationDay: parseInt(v) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 5, 10].map(day => (
                              <SelectItem key={day} value={day.toString()}>Le {day}{day === 1 ? 'er' : ''} du mois</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-slate-500 italic">L’émission des factures attendues se fera à 00h00 ce jour-là.</p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          Identification des retards
                        </label>
                        <Select 
                          value={intelligentRules.lateDay.toString()} 
                          onValueChange={(v) => setIntelligentRules(prev => ({ ...prev, lateDay: parseInt(v) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[10, 15, 20, 25].map(day => (
                              <SelectItem key={day} value={day.toString()}>Le {day} du mois</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-slate-500 italic">Tous les paiements non effectués seront marqués comme "en retard" après cette date.</p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Alertes automatiques</p>
                          <p className="text-xs text-slate-500">Notifier les membres en cas de retard</p>
                        </div>
                        <Button 
                          variant={intelligentRules.autoAlerts ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIntelligentRules(prev => ({ ...prev, autoAlerts: !prev.autoAlerts }))}
                          className={cn("text-xs h-7", intelligentRules.autoAlerts && "bg-blue-600")}
                        >
                          {intelligentRules.autoAlerts ? "Activé" : "Désactivé"}
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="bg-slate-900 text-white w-full" onClick={() => {
                        setIsConfigRulesOpen(false);
                        toast.success("Règles mises à jour avec succès");
                      }}>Enregistrer les paramètres</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs border-none shadow-sm"
                  onClick={() => setShowJournal(true)}
                >
                  Voir le journal
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Score Global</p>
                <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 flex items-center justify-center relative">
                  <div 
                    className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin-slow transition-all duration-1000" 
                    style={{ 
                      clipPath: `inset(0 0 0 0)`, // For simplicity, though a real progress ring is better
                      opacity: 0.3
                    }} 
                  />
                  <div 
                    className="absolute inset-0 border-4 border-blue-500 rounded-full" 
                    style={{ 
                      clipPath: `polygon(50% 50%, 50% 0%, ${globalScore > 25 ? '100% 0%,' : ''} ${globalScore > 50 ? '100% 100%,' : ''} ${globalScore > 75 ? '0% 100%,' : ''} ${globalScore === 100 ? '0% 0%,' : ''} 50% 0%)`,
                      display: globalScore === 0 ? 'none' : 'block'
                    }} 
                  />
                  <span className="text-xl font-bold">{globalScore}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{paidCount} Payés</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{pendingCount} En attente</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{overdueCount} En retard</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
