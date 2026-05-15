import React from 'react';
import { 
  Building2, 
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
  ClipboardList,
  Camera,
  ChevronRight,
  Info,
  DollarSign,
  Receipt,
  Image as ImageIcon,
  Video,
  Share2,
  ExternalLink,
  Trophy,
  Layout,
  Heart
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
  DialogFooter,
  DialogDescription
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
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { 
  useStore, 
  ChurchProject, 
  ProjectContribution, 
  ProjectExpense, 
  ProjectStep, 
  ProjectMedia,
  Member
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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

const projectSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  description: z.string().min(10, "Description requise"),
  type: z.enum(['construction', 'mission', 'equipment', 'other']),
  totalBudget: z.coerce.number().min(1, "Budget requis"),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
  leaderId: z.string().min(1, "Responsable requis"),
  churchId: z.string().min(1, "Église requise"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const stepSchema = z.object({
  title: z.string().min(2, "Titre requis"),
  description: z.string().min(2, "Description requise"),
  status: z.enum(['pending', 'ongoing', 'completed']),
});

type StepFormValues = z.infer<typeof stepSchema>;

function ProjectDetail({ project, onClose }: { project: ChurchProject; onClose: () => void }) {
  const { 
    members, 
    projectContributions, 
    projectExpenses, 
    projectSteps, 
    projectMedia,
    addProjectContribution,
    addProjectExpense,
    addProjectStep,
    updateProjectStep,
    addProjectMedia
  } = useStore();

  const [activeTab, setActiveTab] = React.useState('info');
  const [isAddStepDialogOpen, setIsAddStepDialogOpen] = React.useState(false);
  const [stepToCompleteId, setStepToCompleteId] = React.useState<string | null>(null);
  const [isAIEnabled, setIsAIEnabled] = React.useState(true);
  const [showAIConfirm, setShowAIConfirm] = React.useState(false);
  const [donorSearch, setDonorSearch] = React.useState('');
  const [selectedDonorMember, setSelectedDonorMember] = React.useState<Member | null>(null);
  const [isAddContributionOpen, setIsAddContributionOpen] = React.useState(false);
  const [isAnonymousDonation, setIsAnonymousDonation] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const contributions = projectContributions.filter(c => c.projectId === project.id);
  const expenses = projectExpenses.filter(e => e.projectId === project.id);
  const steps = projectSteps.filter(s => s.projectId === project.id).sort((a, b) => a.order - b.order);
  const media = projectMedia.filter(m => m.projectId === project.id);

  const totalCollected = contributions.reduce((acc, c) => acc + c.amount, 0);
  const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
  const progress = (totalCollected / project.totalBudget) * 100;
  const balance = totalCollected - totalSpent;

  const leader = members.find(m => m.id === project.leaderId);

  const contributionForm = useForm({
    defaultValues: { contributorName: '', amount: 0, isAnonymous: false }
  });

  const expenseForm = useForm({
    defaultValues: { category: 'other', description: '', amount: 0, date: new Date().toISOString().split('T')[0] }
  });

  const stepForm = useForm<StepFormValues>({
    resolver: zodResolver(stepSchema) as any,
    defaultValues: { title: '', description: '', status: 'pending' }
  });

  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(donorSearch.toLowerCase())
  ).slice(0, 5);

  const handleAddContribution = (values: any) => {
    addProjectContribution({
      ...values,
      projectId: project.id,
      date: new Date().toISOString(),
    });
    contributionForm.reset();
    setDonorSearch('');
    setSelectedDonorMember(null);
    setIsAnonymousDonation(false);
    setIsAddContributionOpen(false);
    toast.success("Contribution enregistrée");
  };

  const handleAddExpense = (values: any) => {
    addProjectExpense({
      ...values,
      projectId: project.id,
    });
    expenseForm.reset();
    toast.success("Dépense enregistrée");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each file
    Array.from(files).forEach((file: File) => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      
      addProjectMedia({
        projectId: project.id,
        type: type as 'image' | 'video',
        url: url,
        caption: file.name
      });
    });

    toast.success(`${files.length} fichier(s) téléversé(s)`);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddStep = (values: StepFormValues) => {
    addProjectStep({
      ...values,
      projectId: project.id,
      order: steps.length + 1,
    });
    stepForm.reset();
    setIsAddStepDialogOpen(false);
    toast.success("Étape ajoutée au projet");
  };

  const handleCompleteStep = () => {
    if (stepToCompleteId) {
      updateProjectStep(stepToCompleteId, { status: 'completed' });
      setStepToCompleteId(null);
      toast.success("Étape marquée comme terminée");
    }
  };

  const toggleAI = () => {
    setShowAIConfirm(true);
  };

  const confirmToggleAI = () => {
    setIsAIEnabled(!isAIEnabled);
    setShowAIConfirm(false);
    toast.success(isAIEnabled ? "IA désactivée" : "IA activée");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">{project.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="capitalize">{project.type}</Badge>
              <Badge className={cn(
                project.status === 'ongoing' ? "bg-blue-100 text-blue-700" : 
                project.status === 'completed' ? "bg-emerald-100 text-emerald-700" : 
                "bg-slate-100 text-slate-700"
              )}>
                {project.status === 'ongoing' ? 'En cours' : project.status === 'completed' ? 'Terminé' : 'En attente'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
          <Button size="sm" className="bg-church-green">
            <ExternalLink className="w-4 h-4 mr-2" />
            Page Publique
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100 p-1 w-full justify-start overflow-x-auto">
              <TabsTrigger value="info" className="text-xs">Infos & Planning</TabsTrigger>
              <TabsTrigger value="finances" className="text-xs">Finances</TabsTrigger>
              <TabsTrigger value="contributions" className="text-xs">Contributeurs</TabsTrigger>
              <TabsTrigger value="media" className="text-xs">Médias</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Détails du Projet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">Description</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase font-bold">Début</p>
                        <p className="text-sm flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-slate-400" />
                          {format(new Date(project.startDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase font-bold">Fin prévue</p>
                        <p className="text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {format(new Date(project.endDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">Responsable</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[10px]">{leader?.firstName[0]}{leader?.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{leader?.firstName} {leader?.lastName}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 h-9"
                        onClick={() => setIsAddContributionOpen(true)}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Soutenir ce Projet (Dons)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Étapes & Avancement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-start gap-3 relative">
                          {idx < steps.length - 1 && (
                            <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-100" />
                          )}
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center z-10",
                            step.status === 'completed' ? "bg-emerald-500 text-white" : 
                            step.status === 'ongoing' ? "bg-blue-500 text-white" : 
                            "bg-slate-200 text-slate-500"
                          )}>
                            {step.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[10px]">{idx + 1}</span>}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold">{step.title}</p>
                            <p className="text-xs text-slate-500">{step.description}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] capitalize cursor-pointer transition-colors",
                              step.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "hover:bg-slate-50"
                            )}
                            onClick={() => {
                              if (step.status !== 'completed') {
                                setStepToCompleteId(step.id);
                              }
                            }}
                          >
                            {step.status === 'completed' ? 'Terminé' : step.status === 'ongoing' ? 'En cours' : 'En attente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Dialog open={isAddStepDialogOpen} onOpenChange={setIsAddStepDialogOpen}>
                      <DialogTrigger render={
                        <Button variant="outline" className="w-full border-dashed text-xs h-8">
                          <Plus className="w-3 h-3 mr-2" />
                          Ajouter une étape
                        </Button>
                      } />
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-church-green" />
                            Nouvelle étape du Projet
                          </DialogTitle>
                        </DialogHeader>
                        <Form {...stepForm}>
                          <form onSubmit={stepForm.handleSubmit(handleAddStep)} className="space-y-4 py-2">
                            <FormField
                              control={stepForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Titre de l'étape</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex: Fondations, Gros œuvre..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={stepForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Détails de l'étape..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={stepForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Statut Initial</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Choisir un statut" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="pending">En attente</SelectItem>
                                      <SelectItem value="ongoing">En cours</SelectItem>
                                      <SelectItem value="completed">Terminé</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            <DialogFooter className="pt-4">
                              <Button variant="outline" type="button" className="flex-1" onClick={() => setIsAddStepDialogOpen(false)}>Annuler</Button>
                              <Button type="submit" className="flex-1 bg-church-green">Ajouter</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="finances" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-none">
                  <CardContent className="p-4">
                    <p className="text-xs text-blue-600 font-bold uppercase">Budget Total</p>
                    <p className="text-xl font-bold text-blue-900">{project.totalBudget.toLocaleString()} FCFA</p>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-none">
                  <CardContent className="p-4">
                    <p className="text-xs text-emerald-600 font-bold uppercase">Collecté</p>
                    <p className="text-xl font-bold text-emerald-900">{totalCollected.toLocaleString()} FCFA</p>
                  </CardContent>
                </Card>
                <Card className="bg-rose-50 border-none">
                  <CardContent className="p-4">
                    <p className="text-xs text-rose-600 font-bold uppercase">Dépensé</p>
                    <p className="text-xl font-bold text-rose-900">{totalSpent.toLocaleString()} FCFA</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-950 text-white overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                      <h3 className="text-xl font-bold">Progression du Financement</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{progress.toFixed(1)}% atteint</span>
                          <span>Reste: {(project.totalBudget - totalCollected).toLocaleString()} FCFA</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-white/10" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                          onClick={() => setIsAddContributionOpen(true)}
                        >
                          Enregistrer un Don
                        </Button>
                        <Dialog>
                          <DialogTrigger render={<Button className="bg-rose-600 hover:bg-rose-700 text-white border-none text-xs">Ajouter une Dépense</Button>}>
                            Ajouter une Dépense
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Nouvelle Dépense Projet</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Catégorie</label>
                                <Select onValueChange={(v) => (window as any)._expenseCat = v}>
                                  <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="materials">Matériaux</SelectItem>
                                    <SelectItem value="labor">Main d'œuvre</SelectItem>
                                    <SelectItem value="logistics">Logistique</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input id="exp-desc" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Montant (FCFA)</label>
                                <Input type="number" id="exp-amount" />
                              </div>
                              <Button className="w-full bg-rose-600" onClick={() => {
                                const desc = (document.getElementById('exp-desc') as HTMLInputElement).value;
                                const amount = parseInt((document.getElementById('exp-amount') as HTMLInputElement).value);
                                const cat = (window as any)._expenseCat || 'other';
                                if (desc && amount) {
                                  handleAddExpense({ category: cat, description: desc, amount, date: new Date().toISOString() });
                                }
                              }}>Enregistrer</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin-slow" />
                        <span className="text-xl font-bold">{progress.toFixed(0)}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">Financé</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Détail des Dépenses</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map(e => (
                        <TableRow key={e.id}>
                          <TableCell className="capitalize text-xs font-medium">{e.category}</TableCell>
                          <TableCell className="text-sm">{e.description}</TableCell>
                          <TableCell className="text-xs text-slate-500">{format(new Date(e.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="text-right font-bold text-rose-600">{e.amount.toLocaleString()} FCFA</TableCell>
                        </TableRow>
                      ))}
                      {expenses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-400 italic">Aucune dépense enregistrée.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contributions" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Mur des Donateurs</CardTitle>
                    <CardDescription>Reconnaissance de la générosité des membres</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contributions.sort((a, b) => b.amount - a.amount).slice(0, 5).map((c, i) => (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                            i === 0 ? "bg-amber-100 text-amber-600" : 
                            i === 1 ? "bg-slate-100 text-slate-600" : 
                            i === 2 ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-400"
                          )}>
                            {i === 0 ? <Trophy className="w-4 h-4" /> : i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{c.isAnonymous ? 'Donateur Anonyme' : c.contributorName}</p>
                            <p className="text-[10px] text-slate-400">{format(new Date(c.date), 'dd MMM yyyy')}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{c.amount.toLocaleString()} FCFA</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Statistiques des Dons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Anonymes', value: contributions.filter(c => c.isAnonymous).reduce((acc, c) => acc + c.amount, 0) },
                              { name: 'Nominatifs', value: contributions.filter(c => !c.isAnonymous).reduce((acc, c) => acc + c.amount, 0) },
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#3b82f6" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-xs mt-4">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Anonymes</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Nominatifs</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 mt-6">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,video/*" 
                multiple 
                onChange={handleFileUpload}
              />
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Suivi Visuel du Chantier</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-church-green text-church-green hover:bg-emerald-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Ajouter Photo/Vidéo
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media.map(m => (
                  <div key={m.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    {m.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <Video className="w-8 h-8 text-white/50" />
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">VIDÉO</div>
                      </div>
                    ) : (
                      <img src={m.url} alt={m.caption} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-white text-[10px] font-medium truncate">{m.caption}</p>
                      <p className="text-white/60 text-[8px]">{format(new Date(m.createdAt), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                ))}
                <div 
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-church-green hover:text-church-green hover:bg-emerald-50 cursor-pointer transition-all active:scale-95 bg-white group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium">Ajouter Photo/Vidéo</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md bg-slate-900 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Analyse Intelligente
              </CardTitle>
              <Switch 
                checked={isAIEnabled} 
                onCheckedChange={toggleAI}
                className="data-[state=checked]:bg-blue-500"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {isAIEnabled ? (
                <>
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-xs font-bold">⏳ Prévision de Fin</p>
                    <p className="text-[10px] text-slate-300 mt-1">Au rythme actuel des contributions, le financement sera bouclé dans <strong>4 mois</strong> (Août 2026).</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-xs font-bold">💡 Suggestion</p>
                    <p className="text-[10px] text-slate-300 mt-1">Lancer une campagne spéciale "Mur des Donateurs" pour accélérer les 20% restants.</p>
                  </div>
                  <Button variant="outline" className="w-full border-none bg-emerald-600 text-white hover:bg-emerald-700 text-xs h-8 font-bold">
                    Générer Rapport IA
                  </Button>
                </>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-400">L'analyse IA est désactivée.</p>
                  <p className="text-[10px] text-slate-500">Activez-la pour obtenir des prévisions et suggestions.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Campagne de Partage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Smartphone className="w-6 h-6 text-church-green" />
                </div>
                <p className="text-xs font-bold text-slate-900">Mobilisez vos proches</p>
                <p className="text-[10px] text-slate-500 mt-1 mb-4">Partagez le lien de don sécurisé sur WhatsApp et les réseaux sociaux.</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white text-[10px]">WhatsApp</Button>
                  <Button size="sm" variant="outline" className="flex-1 text-[10px]">Copier Lien</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Complete Step Dialog */}
      <Dialog open={!!stepToCompleteId} onOpenChange={(open) => !open && setStepToCompleteId(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Terminer cette étape ?</DialogTitle>
            <DialogDescription>
              Voulez-vous marquer cette étape comme terminée ? Cette action confirmera l'avancement du projet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setStepToCompleteId(null)}>
              Annuler
            </Button>
            <Button 
              className="flex-1 bg-church-green" 
              onClick={handleCompleteStep}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Toggle Confirmation Dialog */}
      <Dialog open={showAIConfirm} onOpenChange={setShowAIConfirm}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>{isAIEnabled ? "Désactiver l'IA ?" : "Activer l'IA ?"}</DialogTitle>
            <DialogDescription>
              {isAIEnabled 
                ? "L'analyse prédictive et les suggestions intelligentes ne seront plus visibles." 
                : "L'IA analysera les données du projet pour fournir des conseils et prévisions."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowAIConfirm(false)}>
              Annuler
            </Button>
            <Button 
              className={cn("flex-1", isAIEnabled ? "bg-rose-600 hover:bg-rose-700" : "bg-church-green")} 
              onClick={confirmToggleAI}
            >
              {isAIEnabled ? "Désactiver" : "Activer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Donation Dialog */}
      <Dialog open={isAddContributionOpen} onOpenChange={setIsAddContributionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau Don pour le Projet</DialogTitle>
            <DialogDescription>Recherchez un membre ou saisissez le nom d'un donateur externe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Donateur</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder={isAnonymousDonation ? "Donateur Anonyme" : "Nom du donateur (membre ou externe)"} 
                    className="pl-9"
                    value={isAnonymousDonation ? "Anonyme" : donorSearch}
                    disabled={isAnonymousDonation}
                    onChange={(e) => {
                      setDonorSearch(e.target.value);
                      if (selectedDonorMember) setSelectedDonorMember(null);
                    }}
                  />
                </div>
                
                {donorSearch && !selectedDonorMember && !isAnonymousDonation && (
                  <Card className="p-2 border-slate-100 shadow-sm">
                    <ScrollArea className="h-[120px]">
                      <div className="space-y-1">
                        {filteredMembers.map(m => (
                          <div 
                            key={m.id} 
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm"
                            onClick={() => {
                              setSelectedDonorMember(m);
                              setDonorSearch(`${m.firstName} ${m.lastName}`);
                            }}
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-[10px]">{m.firstName[0]}{m.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <span>{m.firstName} {m.lastName}</span>
                            <Badge variant="outline" className="ml-auto text-[8px]">Membre</Badge>
                          </div>
                        ))}
                        <div 
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm font-medium text-blue-600"
                          onClick={() => {
                            // Just use the search string as manual name
                            setSelectedDonorMember(null);
                          }}
                        >
                          <Plus className="w-3 h-3" />
                          Utiliser "{donorSearch}" comme donateur externe
                        </div>
                      </div>
                    </ScrollArea>
                  </Card>
                )}
                
                {selectedDonorMember && !isAnonymousDonation && (
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{selectedDonorMember.firstName} {selectedDonorMember.lastName}</p>
                      <p className="text-[10px] text-emerald-600">Donateur sélectionné (Membre)</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                      setSelectedDonorMember(null);
                      setDonorSearch('');
                    }}>
                      <Plus className="w-3 h-3 rotate-45" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Montant (FCFA)</Label>
              <Input type="number" id="donor-amount" placeholder="Entrez le montant" />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="is-anon" 
                className="rounded border-slate-300 cursor-pointer" 
                checked={isAnonymousDonation}
                onChange={(e) => setIsAnonymousDonation(e.target.checked)}
              />
              <Label htmlFor="is-anon" className="text-xs font-normal cursor-pointer">Don anonyme</Label>
            </div>
            <Button className="w-full bg-emerald-600" onClick={() => {
              const amount = parseInt((document.getElementById('donor-amount') as HTMLInputElement).value);
              const name = isAnonymousDonation ? 'Donateur Anonyme' : (selectedDonorMember ? `${selectedDonorMember.firstName} ${selectedDonorMember.lastName}` : donorSearch);
              
              if ((isAnonymousDonation || name) && amount) {
                handleAddContribution({ 
                  contributorName: name, 
                  amount, 
                  isAnonymous: isAnonymousDonation,
                  memberId: isAnonymousDonation ? undefined : selectedDonorMember?.id
                });
              } else {
                toast.error("Veuillez remplir tous les champs");
              }
            }}>Valider le Don</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ProjectManagement() {
  const { churchProjects, projectContributions, churches, members, addChurchProject } = useStore();
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      type: 'construction',
      totalBudget: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      churchId: churches[0]?.id || '1',
    },
  });

  const onSubmit = (values: ProjectFormValues) => {
    addChurchProject({
      ...values,
      status: 'pending',
    });
    setIsAddDialogOpen(false);
    form.reset();
    toast.success("Projet créé avec succès");
  };

  const selectedProject = churchProjects.find(p => p.id === selectedProjectId);

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onClose={() => setSelectedProjectId(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Projets de l'Église</h1>
          <p className="text-slate-500">Bâtissons ensemble l'avenir de notre communauté.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button className="bg-church-green hover:bg-church-green/90 text-white shadow-lg shadow-church-green/20">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Projet
          </Button>}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Projet
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Lancer un nouveau projet</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du Projet</FormLabel>
                      <FormControl><Input placeholder="Ex: Construction du Temple" {...field} /></FormControl>
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
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="mission">Mission</SelectItem>
                            <SelectItem value="equipment">Équipement</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="totalBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Total (FCFA)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de Début</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de Fin prévue</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as any}
                  name="leaderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable du Projet</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                        </FormControl>
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
                <FormField
                  control={form.control as any}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Objectifs, impact, besoins..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="w-full bg-church-green">Créer le Projet</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Layout className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500">Projets Actifs</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{churchProjects.filter(p => p.status === 'ongoing').length}</h3>
            <p className="text-xs text-slate-400 mt-1">En cours de réalisation</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500">Mobilisation Totale</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {projectContributions.reduce((acc, c) => acc + c.amount, 0).toLocaleString()} FCFA
            </h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Fonds levés pour les projets</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500">Taux de Réussite</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {churchProjects.length > 0 ? ((churchProjects.filter(p => p.status === 'completed').length / churchProjects.length) * 100).toFixed(0) : 0}%
            </h3>
            <p className="text-xs text-slate-400 mt-1">Projets finalisés</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-slate-900">Nos Projets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {churchProjects.length === 0 ? (
            <div className="col-span-full h-32 flex items-center justify-center text-slate-400 italic border-2 border-dashed rounded-xl">
              Aucun projet lancé pour le moment.
            </div>
          ) : (
            churchProjects.slice().reverse().map((project) => {
              const contributions = projectContributions.filter(c => c.projectId === project.id);
              const total = contributions.reduce((acc, c) => acc + c.amount, 0);
              const progress = (total / project.totalBudget) * 100;
              return (
                <Card 
                  key={project.id} 
                  className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={project.imageUrl || `https://picsum.photos/seed/${project.id}/800/600`} 
                      alt={project.name} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={cn(
                        "text-[10px]",
                        project.status === 'ongoing' ? "bg-blue-500" : 
                        project.status === 'completed' ? "bg-emerald-500" : "bg-slate-500"
                      )}>
                        {project.status === 'ongoing' ? 'En cours' : project.status === 'completed' ? 'Terminé' : 'En attente'}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    <CardDescription className="text-[10px] flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Objectif: {project.totalBudget.toLocaleString()} FCFA
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Financement</span>
                        <span className="font-bold text-slate-900">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-slate-100" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Users className="w-3 h-3" />
                        {contributions.length} donateurs
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs group-hover:text-church-green">
                        Détails
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
    </div>
  );
}
