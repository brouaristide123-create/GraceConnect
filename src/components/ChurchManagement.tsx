import React from 'react';
import {
  Church as ChurchIcon,
  Plus,
  MapPin,
  User,
  Calendar,
  Trash2,
  Edit2,
  ArrowRight,
  Search,
  Filter,
  Settings,
  Activity,
  History,
  FileText,
  Mail,
  Phone,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Layers,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import { Badge } from './ui/badge';
import { useStore, Church } from '../lib/store';
import { cn } from '../lib/utils';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';

const churchSchema = z.object({
  name: z.string().min(2, "Nom de l'église requis"),
  address: z.string().min(2, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  country: z.string().min(2, "Pays requis"),
  phone: z.string().min(2, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  description: z.string().min(10, "Description requise"),
  pastor: z.string().min(2, "Nom du pasteur requis"),
});

// Returns a status badge for a church
function ChurchStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Actif</Badge>;
    case 'pending':
      return <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">En attente</Badge>;
    case 'suspended':
      return <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Suspendu</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function ChurchDetail({ church, onClose }: { church: Church & { code?: string }; onClose: () => void }) {
  const { members, children, departments, events, transactions } = useStore();
  const [memberSearch, setMemberSearch] = React.useState('');
  const [memberFilter, setMemberFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  const churchMembers = members.filter(m => m.churchId === church.id);
  const churchChildren = children.filter(c => c.churchId === church.id);
  const allPeople = [...churchMembers, ...churchChildren];
  const churchDepts = departments.filter(d => d.churchId === church.id);
  const churchEvents = events.filter(e => e.churchId === church.id);
  const churchTx = transactions.filter(t => t.churchId === church.id);

  // Finance totals
  const income = churchTx.filter(t => t.type !== 'expense').reduce((sum, t) => sum + t.amount, 0);
  const expenses = churchTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  // Filtered members list
  const filteredPeople = allPeople.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchSearch = memberSearch === '' || name.includes(memberSearch.toLowerCase());
    const matchFilter = memberFilter === 'all' || p.status === memberFilter;
    return matchSearch && matchFilter;
  });

  // Build recent activities from real data
  const recentActivities: { label: string; detail: string; date: string; type: 'member' | 'finance' | 'event' }[] = [];

  // Last 3 members joined
  const recentMembers = [...churchMembers].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()).slice(0, 2);
  recentMembers.forEach(m => {
    recentActivities.push({
      label: 'Nouveau membre',
      detail: `${m.firstName} ${m.lastName} a rejoint l'église`,
      date: format(new Date(m.joinedAt), 'dd MMM yyyy', { locale: fr }),
      type: 'member'
    });
  });

  // Last transaction
  const lastTx = [...churchTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  if (lastTx) {
    recentActivities.push({
      label: lastTx.type === 'expense' ? 'Dépense enregistrée' : 'Entrée financière',
      detail: `${lastTx.category} — ${lastTx.amount.toLocaleString()} FCFA`,
      date: format(new Date(lastTx.date), 'dd MMM yyyy', { locale: fr }),
      type: 'finance'
    });
  }

  // Last event
  const lastEvent = [...churchEvents].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
  if (lastEvent) {
    recentActivities.push({
      label: 'Événement',
      detail: lastEvent.name,
      date: format(new Date(lastEvent.startDate), 'dd MMM yyyy', { locale: fr }),
      type: 'event'
    });
  }

  // PDF download
  const handleDownloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const now = format(new Date(), 'MMMM yyyy', { locale: fr });

      // Header
      doc.setFontSize(18);
      doc.setTextColor(0, 158, 96); // church-green
      doc.text(church.name, 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Rapport mensuel — ${now}`, 14, 30);
      doc.text(`Pasteur: ${church.pastor}  |  ${church.city}, ${church.country}`, 14, 36);

      // Stats summary
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text('Statistiques générales', 14, 48);
      autoTable(doc, {
        startY: 52,
        head: [['Indicateur', 'Valeur']],
        body: [
          ['Membres adultes', churchMembers.length.toString()],
          ['Enfants', churchChildren.length.toString()],
          ['Départements', churchDepts.length.toString()],
          ['Événements', churchEvents.length.toString()],
          ['Recettes (FCFA)', income.toLocaleString()],
          ['Dépenses (FCFA)', expenses.toLocaleString()],
          ['Solde (FCFA)', balance.toLocaleString()],
        ],
        headStyles: { fillColor: [0, 158, 96] },
        theme: 'striped',
      });

      // Transactions
      if (churchTx.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text('Transactions récentes', 14, finalY);
        autoTable(doc, {
          startY: finalY + 4,
          head: [['Date', 'Type', 'Catégorie', 'Montant (FCFA)', 'Méthode']],
          body: churchTx.slice(0, 20).map(t => [
            format(new Date(t.date), 'dd/MM/yyyy'),
            t.type === 'tithe' ? 'Dîme' : t.type === 'offering' ? 'Offrande' : t.type === 'donation' ? 'Don' : 'Dépense',
            t.category,
            t.amount.toLocaleString(),
            t.paymentMethod
          ]),
          headStyles: { fillColor: [255, 130, 0] },
          theme: 'striped',
        });
      }

      doc.save(`rapport-${church.name.replace(/\s+/g, '-')}-${now}.pdf`);
      toast.success('Rapport PDF téléchargé !');
    } catch (err) {
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <ArrowRight className="w-5 h-5 rotate-180" />
        </Button>
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">{church.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <ChurchStatusBadge status={church.status} />
            {church.id === 'default' && <Badge className="bg-church-gold text-white">Siège</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="bg-slate-100 p-1">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="members">Adultes & Enfants ({allPeople.length})</TabsTrigger>
              <TabsTrigger value="departments">Départements</TabsTrigger>
              <TabsTrigger value="finances">Finances</TabsTrigger>
            </TabsList>

            {/* ── Overview ──────────────────────────────── */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-church-green" />
                      Informations Générales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Code Église</span>
                      <span className="font-mono font-bold text-church-green">{church.code || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Adresse</span>
                      <span className="font-medium">{church.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ville</span>
                      <span className="font-medium">{church.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pasteur Responsable</span>
                      <span className="font-medium">{church.pastor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date de création</span>
                      <span className="font-medium">{format(new Date(church.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Mail className="w-4 h-4 text-church-gold" />
                      Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium">{church.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Téléphone</span>
                      <span className="font-medium">{church.phone}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">À propos de cette branche</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 leading-relaxed">{church.description}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-church-green text-white border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] uppercase font-bold opacity-70">Membres Actifs</p>
                    <p className="text-2xl font-bold">{churchMembers.filter(m => m.status === 'active').length}</p>
                  </CardContent>
                </Card>
                <Card className="bg-church-gold text-white border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] uppercase font-bold opacity-70">Départements</p>
                    <p className="text-2xl font-bold">{churchDepts.length}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 text-white border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] uppercase font-bold opacity-70">Événements</p>
                    <p className="text-2xl font-bold">{churchEvents.length}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Members ───────────────────────────────── */}
            <TabsContent value="members" className="mt-6">
              <Card className="border-none shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher un membre..."
                      className="pl-9 h-9 text-xs rounded-lg"
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['all', 'active', 'inactive'] as const).map(f => (
                      <Button
                        key={f}
                        size="sm"
                        variant={memberFilter === f ? 'default' : 'outline'}
                        className={cn('h-9 text-xs', memberFilter === f ? 'bg-church-green text-white border-none' : 'border-slate-200')}
                        onClick={() => setMemberFilter(f)}
                      >
                        {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Inactifs'}
                      </Button>
                    ))}
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membre</TableHead>
                      <TableHead>Rôle / Groupe</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPeople.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-slate-400 py-8">
                          Aucun membre trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPeople.slice(0, 50).map((person) => (
                        <TableRow key={person.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-church-green/10 text-church-green">
                                  {person.firstName[0]}{person.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <p className="text-sm font-medium leading-none">{person.firstName} {person.lastName}</p>
                                <p className="text-[10px] font-mono font-bold text-church-gold mt-1">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Matricule:</span>
                                  {person.matricule || '---'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {'groups' in person ? (
                                person.groups.length > 0
                                  ? person.groups.map(g => (
                                    <Badge key={g} variant="secondary" className="text-[9px] h-4">{g}</Badge>
                                  ))
                                  : <span className="text-xs text-slate-400">—</span>
                              ) : (
                                <Badge variant="outline" className="text-[9px] h-4 text-blue-600 bg-blue-50 border-blue-100">
                                  Enfant ({(person as any).ageGroup})
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "border-none text-[10px] h-5",
                              person.status === 'active'
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                            )}>
                              {person.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toast.info(`Fiche de ${person.firstName} ${person.lastName} — accès depuis le menu Membres`)}
                            >
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {filteredPeople.length > 50 && (
                  <div className="p-4 text-center border-t border-slate-100 italic text-[10px] text-slate-400">
                    Affichage de 50 sur {filteredPeople.length} personnes
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* ── Departments ───────────────────────────── */}
            <TabsContent value="departments" className="mt-6">
              {churchDepts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aucun département pour cette église</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {churchDepts.map((dept) => {
                    const deptMemberCount = members.filter(m => m.groups.includes(dept.name) && m.churchId === church.id).length;
                    return (
                      <Card key={dept.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                              <CardTitle className="text-sm font-bold">{dept.name}</CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toast.info("Gestion du département depuis le menu Organisation")}
                            >
                              <Settings className="w-3 h-3 text-slate-400" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-xs text-slate-500">{dept.description}</p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {deptMemberCount} membre{deptMemberCount > 1 ? 's' : ''}
                            </span>
                            <Badge variant="outline" className={cn(
                              "text-[9px]",
                              dept.status === 'active' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-50'
                            )}>
                              {dept.status === 'active' ? 'Actif' : 'En pause'}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 italic">
                            Réunion: {dept.meetingDays.join(', ')} {dept.meetingTime && `à ${dept.meetingTime}`}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Finances ──────────────────────────────── */}
            <TabsContent value="finances" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-sm bg-emerald-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">Recettes</p>
                      <p className="text-lg font-bold text-emerald-700">{income.toLocaleString()} FCFA</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-red-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-red-600 font-bold uppercase">Dépenses</p>
                      <p className="text-lg font-bold text-red-700">{expenses.toLocaleString()} FCFA</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className={cn("border-none shadow-sm", balance >= 0 ? 'bg-slate-900' : 'bg-red-900')}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/70 font-bold uppercase">Solde</p>
                      <p className="text-lg font-bold text-white">{balance.toLocaleString()} FCFA</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">Transactions récentes</CardTitle>
                </CardHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {churchTx.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-slate-400 py-8">
                          Aucune transaction enregistrée
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...churchTx]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 20)
                        .map(t => (
                          <TableRow key={t.id}>
                            <TableCell className="text-xs">{format(new Date(t.date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-[9px] border-none",
                                t.type === 'expense' ? 'bg-red-100 text-red-700' :
                                t.type === 'tithe' ? 'bg-church-green/10 text-church-green' :
                                'bg-church-gold/10 text-church-gold'
                              )}>
                                {t.type === 'tithe' ? 'Dîme' : t.type === 'offering' ? 'Offrande' : t.type === 'donation' ? 'Don' : 'Dépense'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">{t.category}</TableCell>
                            <TableCell className="text-xs text-slate-500">{t.paymentMethod}</TableCell>
                            <TableCell className={cn(
                              "text-right text-sm font-bold",
                              t.type === 'expense' ? 'text-red-600' : 'text-emerald-600'
                            )}>
                              {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Right sidebar ─────────────────────────── */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Activités Récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center">Aucune activité récente</p>
              ) : (
                recentActivities.slice(0, 5).map((act, i) => (
                  <div key={i} className="flex gap-3 relative pb-4 border-l border-slate-100 pl-4 last:border-0 last:pb-0">
                    <div className={cn(
                      "absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white",
                      act.type === 'member' ? 'bg-church-green' :
                      act.type === 'finance' ? 'bg-church-gold' : 'bg-slate-400'
                    )} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{act.label}</p>
                      <p className="text-[10px] text-slate-500">{act.detail}</p>
                      <p className="text-[9px] text-slate-300 mt-1">{act.date}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="w-full text-[10px] text-slate-400"
                onClick={() => toast.info("Historique complet disponible dans les rapports")}
              >
                Voir tout l'historique
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/5 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-church-gold uppercase text-[10px] font-bold tracking-wider">
                  <FileText className="w-3 h-3" />
                  Rapport du mois
                </div>
                <h3 className="text-lg font-serif font-bold">Générer le rapport mensuel</h3>
                <p className="text-white/60 text-[10px]">Collectez automatiquement les statistiques de fréquentation et financières.</p>
                <Button
                  className="w-full bg-church-gold hover:bg-church-gold/90 text-white border-none h-10 text-xs"
                  onClick={handleDownloadPDF}
                >
                  Télécharger PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ChurchManagement() {
  const { churches, members, addChurch, updateChurch, deleteChurch } = useStore();
  const [selectedChurchId, setSelectedChurchId] = React.useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [churchToDelete, setChurchToDelete] = React.useState<Church | null>(null);
  const [churchToEdit, setChurchToEdit] = React.useState<Church | null>(null);

  const form = useForm<z.infer<typeof churchSchema>>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      description: '',
      pastor: '',
    },
  });

  const editForm = useForm<z.infer<typeof churchSchema>>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      description: '',
      pastor: '',
    },
  });

  const onSubmit = (values: z.infer<typeof churchSchema>) => {
    addChurch({ ...values, status: 'active' });
    setIsAddDialogOpen(false);
    form.reset();
    toast.success("Nouvelle branche ajoutée");
  };

  const onEditSubmit = (values: z.infer<typeof churchSchema>) => {
    if (churchToEdit) {
      updateChurch(churchToEdit.id, values);
      setIsEditDialogOpen(false);
      setChurchToEdit(null);
      toast.success("Branche mise à jour");
    }
  };

  const handleEdit = (church: Church) => {
    setChurchToEdit(church);
    editForm.reset({
      name: church.name,
      address: church.address,
      city: church.city,
      country: church.country,
      phone: church.phone,
      email: church.email,
      description: church.description,
      pastor: church.pastor,
    });
    setIsEditDialogOpen(true);
  };

  // For the "Siège" (HQ) card, we build a Church-compatible object from store context
  // (The HQ is not in the churches array — it's the platform's own pseudo-church)
  const hqChurch: Church & { code: string } = {
    id: 'default',
    name: 'Grace-Connect — Siège',
    code: '0001',
    address: 'Abidjan, Côte d\'Ivoire',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    pastor: 'Pasteur Principal Koffi',
    createdAt: '2010-01-01',
    email: 'siege@graceconnect.app',
    phone: '+225 00 00 00 00',
    description: 'Centre de coordination principal pour Grace-Connect.',
    status: 'active',
  };

  const selectedChurch = selectedChurchId === 'default'
    ? hqChurch
    : churches.find(c => c.id === selectedChurchId);

  if (selectedChurch) {
    return <ChurchDetail church={selectedChurch as Church} onClose={() => setSelectedChurchId(null)} />;
  }

  const handleDeleteConfirm = () => {
    if (churchToDelete) {
      deleteChurch(churchToDelete.id);
      setChurchToDelete(null);
      toast.info("Branche supprimée");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Gestion des Églises</h1>
          <p className="text-slate-500">Gérez vos différentes branches et lieux de culte.</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button className="bg-church-green hover:bg-church-green/90" />}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une Branche
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nouvelle Branche</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'église</FormLabel>
                      <FormControl>
                        <Input placeholder="Ekklesia - Branche Dakar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="Dakar, Plateau" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Dakar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays</FormLabel>
                        <FormControl>
                          <Input placeholder="Sénégal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+221..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@eglise.org" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Une brève description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pastor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pasteur Responsable</FormLabel>
                      <FormControl>
                        <Input placeholder="Pasteur Samuel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="w-full bg-church-green">Créer la branche</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Siège Central (HQ) — always shown first */}
        <Card className="border-none shadow-sm overflow-hidden border-l-4 border-church-gold">
          <CardHeader className="bg-slate-50/50">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-church-gold/20 rounded-lg">
                <ChurchIcon className="w-6 h-6 text-church-gold" />
              </div>
              <Badge className="bg-church-gold text-church-green">Siège Central</Badge>
            </div>
            <CardTitle className="mt-4">Grace-Connect — Siège</CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Code:</span>
              <span className="text-[10px] font-mono font-bold text-church-gold">0001</span>
            </div>
            <CardDescription className="mt-1">Centre de coordination principal</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              Abidjan, Côte d'Ivoire
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <User className="w-4 h-4 mr-2 text-slate-400" />
              Pasteur Principal Koffi
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              Établi en 2010
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex justify-between">
            <div className="text-xs text-slate-500">
              <strong>{members.filter(m => m.churchId === 'default' || !m.churchId).length}</strong> Membres
            </div>
            <Button variant="ghost" size="sm" className="text-church-green" onClick={() => setSelectedChurchId('default')}>
              Gérer <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Dynamic churches */}
        {churches.map((church) => (
          <Card key={church.id} className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-church-green/10 rounded-lg">
                  <ChurchIcon className="w-6 h-6 text-church-green" />
                </div>
                <div className="flex items-center gap-1">
                  <ChurchStatusBadge status={church.status} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(church)}>
                    <Edit2 className="w-4 h-4 text-slate-400 hover:text-church-green" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setChurchToDelete(church)}>
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-4">{church.name}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Code:</span>
                <span className="text-[10px] font-mono font-bold text-church-green">{church.code || '----'}</span>
              </div>
              <CardDescription className="mt-1">Branche locale</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                {church.address}, {church.city}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <User className="w-4 h-4 mr-2 text-slate-400" />
                {church.pastor}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                Créé le {format(new Date(church.createdAt), 'dd MMM yyyy', { locale: fr })}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex justify-between">
              <div className="text-xs text-slate-500">
                <strong>{members.filter(m => m.churchId === church.id).length}</strong> Membres
              </div>
              <Button variant="ghost" size="sm" className="text-church-green" onClick={() => setSelectedChurchId(church.id)}>
                Gérer <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!churchToDelete} onOpenChange={(open) => !open && setChurchToDelete(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-serif font-bold text-center text-slate-900">Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-slate-600">
            Êtes-vous sûr de vouloir supprimer la branche{' '}
            <span className="font-bold text-slate-900">"{churchToDelete?.name}"</span> ?{' '}
            Cette action est irréversible et supprimera toutes les données associées (membres, départements, événements, transactions).
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="w-full sm:flex-1 h-12 rounded-xl font-bold border-slate-200"
              onClick={() => setChurchToDelete(null)}
            >
              Annuler
            </Button>
            <Button
              className="w-full sm:flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={handleDeleteConfirm}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la Branche</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'église</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {churchToEdit?.code && (
                <div className="space-y-2">
                  <FormLabel className="text-slate-500">Code Église (Lecture seule)</FormLabel>
                  <div className="h-10 px-3 py-2 bg-slate-50 rounded-md border border-slate-200 text-sm font-mono font-bold text-slate-600 flex items-center">
                    {churchToEdit.code}
                  </div>
                </div>
              )}
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="pastor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pasteur Responsable</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="w-full bg-church-green">Enregistrer les modifications</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
