import React from 'react';
import { 
  ClipboardList, 
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
  FileText,
  MapPin,
  MessageSquare,
  ChevronRight,
  Info,
  UserPlus,
  UserMinus,
  RefreshCw,
  Check,
  X,
  CalendarDays,
  List,
  UserCheck,
  Settings
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
import { 
  useStore, 
  Assignment, 
  AssignmentMember, 
  Member,
  MemberAvailability
} from '../lib/store';
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
import { format, isToday, isThisWeek, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const assignmentSchema = z.object({
  title: z.string().min(2, "Titre requis"),
  type: z.enum(['service', 'event', 'department', 'project', 'other']),
  date: z.string().min(1, "Date requise"),
  startTime: z.string().min(1, "Heure de début requise"),
  endTime: z.string().min(1, "Heure de fin requise"),
  location: z.string().min(2, "Lieu requis"),
  description: z.string().optional(),
  recurrence: z.enum(['none', 'weekly', 'bi-weekly', 'monthly']),
  churchId: z.string().min(1, "Église requise"),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

function AssignmentDetail({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) {
  const { 
    members, 
    assignmentMembers, 
    addAssignmentMember, 
    updateAssignmentMember, 
    deleteAssignmentMember,
    updateAssignment
  } = useStore();

  const [activeTab, setActiveTab] = React.useState('members');
  const currentMembers = assignmentMembers.filter(am => am.assignmentId === assignment.id);

  const handleAddMember = (memberId: string) => {
    if (currentMembers.some(am => am.memberId === memberId)) {
      toast.error("Ce membre est déjà assigné");
      return;
    }
    addAssignmentMember({
      assignmentId: assignment.id,
      memberId,
      role: 'participant',
      status: 'pending'
    });
    toast.success("Membre ajouté");
  };

  const handleStatusChange = (amId: string, status: AssignmentMember['status']) => {
    updateAssignmentMember(amId, { status });
    toast.success("Statut mis à jour");
  };

  const handleRoleChange = (amId: string, role: AssignmentMember['role']) => {
    updateAssignmentMember(amId, { role });
    toast.success("Rôle mis à jour");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">{assignment.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="capitalize">{assignment.type}</Badge>
              <Badge className={cn(
                assignment.status === 'planned' ? "bg-blue-100 text-blue-700" : 
                assignment.status === 'completed' ? "bg-emerald-100 text-emerald-700" : 
                "bg-slate-100 text-slate-700"
              )}>
                {assignment.status === 'planned' ? 'Planifié' : assignment.status === 'completed' ? 'Terminé' : 'En cours'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Rappels
          </Button>
          <Button size="sm" className="bg-church-green" onClick={() => updateAssignment(assignment.id, { status: 'completed' })}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Clôturer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100 p-1">
              <TabsTrigger value="members" className="text-xs">Membres Assignés</TabsTrigger>
              <TabsTrigger value="info" className="text-xs">Informations</TabsTrigger>
              <TabsTrigger value="history" className="text-xs">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Équipe Assignée</h3>
                <Dialog>
                  <DialogTrigger render={<Button size="sm" className="bg-blue-600" />}>
                    <UserPlus className="w-4 h-4 mr-2" /> Assigner
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Assigner des membres</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Chercher un membre..." className="pl-9" />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {members.filter(m => !currentMembers.some(am => am.memberId === m.id)).map(m => (
                          <div key={m.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{m.firstName[0]}{m.lastName[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
                                <p className="text-[10px] text-slate-500">{m.groups.join(', ')}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => handleAddMember(m.id)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {currentMembers.map(am => {
                  const member = members.find(m => m.id === am.memberId);
                  if (!member) return null;
                  return (
                    <Card key={am.id} className="border-none shadow-sm group">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900">{member.firstName} {member.lastName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Select value={am.role} onValueChange={(v) => handleRoleChange(am.id, v as any)}>
                                <SelectTrigger className="h-6 text-[10px] w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="leader">Chef</SelectItem>
                                  <SelectItem value="assistant">Assistant</SelectItem>
                                  <SelectItem value="participant">Participant</SelectItem>
                                </SelectContent>
                              </Select>
                              <Badge variant="outline" className={cn(
                                "text-[9px] px-1.5 py-0",
                                am.status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                am.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                "bg-rose-50 text-rose-600 border-rose-200"
                              )}>
                                {am.status === 'confirmed' ? 'Confirmé' : am.status === 'pending' ? 'En attente' : 'Refusé'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {am.status === 'pending' && (
                            <>
                              <Button size="icon-sm" variant="ghost" className="text-emerald-600" onClick={() => handleStatusChange(am.id, 'confirmed')}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="icon-sm" variant="ghost" className="text-rose-600" onClick={() => handleStatusChange(am.id, 'declined')}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button size="icon-sm" variant="ghost" className="text-blue-600">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button size="icon-sm" variant="ghost" className="text-rose-600" onClick={() => deleteAssignmentMember(am.id)}>
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {currentMembers.length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-xl">
                    <Users className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm italic">Aucun membre assigné pour le moment.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-6 mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-base">Détails de l'Affectation</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">Date & Heure</p>
                      <p className="text-sm flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        {format(new Date(assignment.date), 'dd MMM yyyy')} • {assignment.startTime} - {assignment.endTime}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">Lieu</p>
                      <p className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {assignment.location}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase font-bold">Description</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{assignment.description || 'Aucune description fournie.'}</p>
                  </div>
                  {assignment.recurrence !== 'none' && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-blue-700 font-medium">Récurrence: {assignment.recurrence}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6 mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-base">Historique des Présences</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 italic">L'historique sera disponible une fois l'affectation terminée.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Affectation Intelligente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="text-xs font-bold">🧠 Suggestions IA</p>
                <p className="text-[10px] text-slate-300 mt-1">Basé sur la régularité et les compétences, nous suggérons:</p>
                <div className="mt-2 space-y-2">
                  {members.slice(0, 2).map(m => (
                    <div key={m.id} className="flex items-center justify-between text-[10px]">
                      <span>{m.firstName} {m.lastName}</span>
                      <Button variant="link" className="h-auto p-0 text-blue-400 text-[10px]">Assigner</Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="text-xs font-bold">⚖️ Équilibrage</p>
                <p className="text-[10px] text-slate-300 mt-1">L'équipe actuelle est équilibrée. Pas de surcharge détectée.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader><CardTitle className="text-sm font-bold">Disponibilités</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Membres disponibles</span>
                <span className="font-bold text-emerald-600">85%</span>
              </div>
              <Progress value={85} className="h-1 bg-slate-100" />
              <Button variant="outline" className="w-full text-[10px] h-8">
                Voir le calendrier des absences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AssignmentManagement() {
  const { assignments, assignmentMembers, members, churches, addAssignment, currentUser } = useStore();
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list');

  // Intelligent Generation States
  const [isRulesDialogOpen, setIsRulesDialogOpen] = React.useState(false);
  const [isGenerationPreviewOpen, setIsGenerationPreviewOpen] = React.useState(false);
  const [generatedPreview, setGeneratedPreview] = React.useState<any[]>([]);
  const [rules, setRules] = React.useState({
    peoplePerTeam: 4,
    rotationFrequency: 'weekly',
    prioritizeNewMembers: true,
    excludeUnavailable: true
  });

  const handleGenerate = () => {
    // Simulated Intelligent Generation Logic
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Generate for the 4 Sundays of next month
    const simulation = [
      { 
        id: 'gen-1',
        title: "Culte Dominical - Accueil", 
        date: "2026-05-03", 
        suggested: members.slice(0, 4).map(m => ({ ...m, role: 'participant' }))
      },
      { 
        id: 'gen-2',
        title: "Culte Dominical - Accueil", 
        date: "2026-05-10", 
        suggested: members.slice(4, 8).map(m => ({ ...m, role: 'participant' }))
      }
    ];
    
    setGeneratedPreview(simulation);
    setIsGenerationPreviewOpen(true);
  };

  const confirmGeneration = () => {
    generatedPreview.forEach(item => {
      addAssignment({
        title: item.title,
        type: 'service',
        date: item.date,
        startTime: '08:00',
        endTime: '12:00',
        location: 'Temple Principal',
        description: 'Généré automatiquement par l\'IA',
        recurrence: 'none',
        churchId: currentUser?.churchId || churches[0]?.id || '1',
        status: 'planned'
      } as any);
      // In a real app we would also add the assignmentMembers here
    });
    setIsGenerationPreviewOpen(false);
    toast.success("Affectations générées pour le mois prochain");
  };

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      title: '',
      type: 'service',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '12:00',
      location: '',
      recurrence: 'none',
      churchId: churches[0]?.id || '1',
    },
  });

  const onSubmit = (values: AssignmentFormValues) => {
    addAssignment({
      ...values,
      status: 'planned',
    });
    setIsAddDialogOpen(false);
    form.reset();
    toast.success("Affectation créée avec succès");
  };

  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);

  if (selectedAssignment) {
    return <AssignmentDetail assignment={selectedAssignment} onClose={() => setSelectedAssignmentId(null)} />;
  }

  const todayAssignments = assignments.filter(a => isToday(parseISO(a.date)));
  const weekAssignments = assignments.filter(a => isThisWeek(parseISO(a.date), { weekStartsOn: 1 }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Affectations & Planning</h1>
          <p className="text-slate-500">Organisez vos équipes et gérez les responsabilités au sein du ministère.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex">
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn(
                "h-8 text-xs px-3 transition-colors", 
                viewMode === 'list' ? "bg-church-green text-black shadow-sm hover:bg-church-green/90 font-bold" : "hover:bg-slate-200"
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="w-3.5 h-3.5 mr-2" />
              Liste
            </Button>
            <Button 
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn(
                "h-8 text-xs px-3 transition-colors", 
                viewMode === 'calendar' ? "bg-church-green text-black shadow-sm hover:bg-church-green/90 font-bold" : "hover:bg-slate-200"
              )}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="w-3.5 h-3.5 mr-2" />
              Calendrier
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger render={<Button className="bg-church-gold hover:bg-church-gold/90 text-white shadow-lg shadow-church-gold/20" />}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Affectation
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader><DialogTitle>Créer une nouvelle affectation</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control as any}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl><Input placeholder="Ex: Accueil Culte Dimanche" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="service">Culte</SelectItem>
                              <SelectItem value="event">Événement</SelectItem>
                              <SelectItem value="department">Département</SelectItem>
                              <SelectItem value="project">Projet</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="recurrence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Récurrence</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="none">Aucune</SelectItem>
                              <SelectItem value="weekly">Chaque semaine</SelectItem>
                              <SelectItem value="bi-weekly">Toutes les 2 semaines</SelectItem>
                              <SelectItem value="monthly">Chaque mois</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control as any}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel>Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Début</FormLabel>
                          <FormControl><Input type="time" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fin</FormLabel>
                          <FormControl><Input type="time" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lieu</FormLabel>
                        <FormControl><Input placeholder="Ex: Entrée Principale" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Input placeholder="Détails de la mission..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-church-gold text-white">Créer l'Affectation</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500">Aujourd'hui</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{todayAssignments.length}</h3>
            <p className="text-xs text-slate-400 mt-1">Affectations prévues</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500">Assignés cette semaine</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {assignmentMembers.filter(am => weekAssignments.some(a => a.id === am.assignmentId)).length}
            </h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Membres mobilisés</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500">Taux de Présence</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">92%</h3>
            <p className="text-xs text-slate-400 mt-1">Moyenne de fiabilité</p>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-slate-900">Planning des Affectations</h2>
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Chercher..." className="pl-9 h-8 text-xs" />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Filter className="w-3 h-3 mr-1" />
                Filtres
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.length === 0 ? (
              <div className="col-span-full h-32 flex items-center justify-center text-slate-400 italic border-2 border-dashed rounded-xl">
                Aucune affectation planifiée.
              </div>
            ) : (
              assignments.slice().reverse().map((assignment) => {
                const assignedCount = assignmentMembers.filter(am => am.assignmentId === assignment.id).length;
                return (
                  <Card 
                    key={assignment.id} 
                    className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                    onClick={() => setSelectedAssignmentId(assignment.id)}
                  >
                    <div className={cn(
                      "h-1.5",
                      assignment.type === 'service' ? "bg-church-gold" :
                      assignment.type === 'event' ? "bg-blue-500" :
                      assignment.type === 'department' ? "bg-emerald-500" : "bg-slate-500"
                    )} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-1">{assignment.title}</CardTitle>
                        <Badge variant="outline" className="text-[9px] capitalize">{assignment.type}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-[10px]">
                        <CalendarIcon className="w-3 h-3" />
                        {format(new Date(assignment.date), 'dd MMM yyyy')} • {assignment.startTime}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {assignment.location}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Users className="w-3 h-3" />
                          {assignedCount} personnes assignées
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs group-hover:text-church-gold">
                          Gérer
                          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Calendrier des Affectations</CardTitle>
            <CardDescription>Vue hebdomadaire des responsabilités</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
                const dayAssignments = assignments.filter(a => format(parseISO(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
                return (
                  <div key={i} className="space-y-2">
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-slate-400">{format(date, 'EEE', { locale: fr })}</p>
                      <p className="text-sm font-bold">{format(date, 'dd')}</p>
                    </div>
                    <div className="space-y-1">
                      {dayAssignments.map(a => (
                        <div 
                          key={a.id} 
                          className="p-1.5 rounded bg-blue-50 border border-blue-100 text-[9px] font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => setSelectedAssignmentId(a.id)}
                        >
                          {a.startTime} - {a.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intelligent Planning Feature */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-950 text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Planning Automatique
              </div>
              <h2 className="text-2xl font-serif font-bold">Génération Intelligente des Équipes</h2>
              <p className="text-slate-300 text-sm max-w-md">
                Laissez l'IA organiser vos rotations en fonction des disponibilités, des compétences et de l'équité entre les membres.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Button 
                  className={cn(
                    "text-xs font-bold transition-all shadow-lg shadow-church-green/20",
                    "bg-church-green text-black hover:bg-church-green/90"
                  )}
                  onClick={handleGenerate}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Générer le mois prochain
                </Button>
                <Button 
                  onClick={() => setIsRulesDialogOpen(true)}
                  className={cn(
                    "text-xs font-bold transition-all shadow-lg shadow-red-600/20",
                    "bg-church-green text-black hover:bg-church-green/90"
                  )}
                >
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  Configurer les règles
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Disponibilité</p>
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent" />
                  <span className="text-xl font-bold">85%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Équipes au complet</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>2 remplacements à valider</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Configuration Dialog */}
      <Dialog open={isRulesDialogOpen} onOpenChange={setIsRulesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-church-gold" />
              Règles de génération intelligente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Membres par équipe</label>
                  <Input 
                    type="number" 
                    value={rules.peoplePerTeam} 
                    onChange={e => setRules({...rules, peoplePerTeam: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fréquence</label>
                  <Select value={rules.rotationFrequency} onValueChange={v => setRules({...rules, rotationFrequency: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="bi-weekly">Bimensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Prioriser les nouveaux</p>
                  <p className="text-xs text-slate-500">Favorise l'intégration des nouveaux membres</p>
                </div>
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300"
                  checked={rules.prioritizeNewMembers}
                  onChange={e => setRules({...rules, prioritizeNewMembers: e.target.checked})}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Respecter les indisponibilités</p>
                  <p className="text-xs text-slate-500">Exclut automatiquement les membres absents</p>
                </div>
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300"
                  checked={rules.excludeUnavailable}
                  onChange={e => setRules({...rules, excludeUnavailable: e.target.checked})}
                />
              </div>
            </div>
            <Button className="w-full bg-church-green" onClick={() => {
              setIsRulesDialogOpen(false);
              toast.success("Règles enregistrées");
            }}>
              Enregistrer les règles
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generation Preview Dialog */}
      <Dialog open={isGenerationPreviewOpen} onOpenChange={setIsGenerationPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              Aperçu de la génération
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
            {generatedPreview.map((item, idx) => (
              <div key={item.id} className="border rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900">{item.title}</h4>
                  <Badge variant="outline" className="bg-white">{format(new Date(item.date), 'dd MMMM yyyy', { locale: fr })}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {item.suggested.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-[8px]">{m.firstName[0]}{m.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{m.firstName} {m.lastName}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsGenerationPreviewOpen(false)}>Annuler</Button>
            <Button className="bg-blue-600" onClick={confirmGeneration}>Confirmer et publier le planning</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
