import React from 'react';
import { 
  Church as ChurchIcon, 
  Plus, 
  Calendar as CalendarIcon, 
  Users, 
  Mic2, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  Wallet, 
  UserPlus, 
  Video, 
  FileText, 
  MoreVertical,
  Timer,
  BarChart3,
  ArrowRight,
  Search,
  Filter,
  Star,
  PlayCircle,
  Globe,
  Download,
  Trash2,
  Upload,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useStore, Service, ServiceProgramItem, Visitor, ServiceFinance } from '../lib/store';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { cn } from '../lib/utils';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';

const serviceSchema = z.object({
  type: z.enum(['sunday', 'vigil', 'fast', 'special', 'other']),
  customType: z.string().optional(),
  date: z.string().min(1, "La date est requise"),
  theme: z.string().min(2, "Le thème est requis"),
  preacher: z.string().min(2, "Le prédicateur est requis"),
  location: z.string().min(2, "Le lieu est requis"),
  expectedCapacity: z.number().min(1, "La capacité doit être positive"),
  verseOfDay: z.string().optional(),
  churchId: z.string().min(1, "L'église est requise"),
});

const programItemSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  responsibleId: z.string().min(1, "Le responsable est requis"),
  substituteId: z.string().optional(),
  duration: z.number().min(1, "La durée doit être positive"),
});

const visitorSchema = z.object({
  lastName: z.string().min(2, "Le nom est requis"),
  firstName: z.string().min(2, "Le prénom est requis"),
  gender: z.enum(['M', 'F']),
  phone: z.string().min(8, "Le numéro est requis"),
  originAddress: z.string().min(2, "Lieu de provenance requis"),
  residenceAddress: z.string().min(2, "Lieu d'habitation requis"),
  invitedBy: z.string().optional(),
});

const financeSchema = z.object({
  type: z.enum(['offering', 'tithe', 'donation']),
  amount: z.number().min(1, "Le montant doit être positif"),
  memberId: z.string().optional(),
  notes: z.string().optional(),
});

export function ServiceManagement() {
  const { 
    services, 
    members, 
    churches, 
    servicePrograms, 
    visitors, 
    serviceFinances,
    addService,
    updateService,
    deleteService
  } = useStore();

  const [selectedServiceId, setSelectedServiceId] = React.useState<string | null>(null);
  const [isAddServiceOpen, setIsAddServiceOpen] = React.useState(false);

  const serviceForm = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      type: 'sunday',
      customType: '',
      date: '',
      theme: '',
      preacher: '',
      location: 'Temple Principal',
      expectedCapacity: 100,
      verseOfDay: '',
      churchId: churches[0]?.id || '',
    },
  });

  const onAddService = (values: z.infer<typeof serviceSchema>) => {
    addService({ ...values, status: 'planned' } as any);
    setIsAddServiceOpen(false);
    serviceForm.reset();
    toast.success("Culte planifié avec succès");
  };

  const nextService = services
    .filter(s => s.status === 'planned' || s.status === 'live')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const pastServices = services
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (selectedServiceId) {
    const service = services.find(s => s.id === selectedServiceId);
    if (service) {
      return <ServiceDetail service={service} onBack={() => setSelectedServiceId(null)} />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Gestion des Cultes</h1>
          <p className="text-slate-500">Planifiez et suivez les moments de célébration.</p>
        </div>
        <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
          <DialogTrigger render={<Button className="bg-church-gold hover:bg-church-gold/90 text-white" />}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Culte
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Planifier un culte</DialogTitle>
              <DialogDescription>Remplissez les détails pour le prochain moment de grâce.</DialogDescription>
            </DialogHeader>
            <Form {...serviceForm}>
              <form onSubmit={serviceForm.handleSubmit(onAddService)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={serviceForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de culte</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sunday">Culte de Dimanche</SelectItem>
                            <SelectItem value="vigil">Veillée</SelectItem>
                            <SelectItem value="fast">Jeûne & Prière</SelectItem>
                            <SelectItem value="special">Culte Spécial</SelectItem>
                            <SelectItem value="other">Autres</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {serviceForm.watch('type') === 'other' && (
                    <FormField
                      control={serviceForm.control}
                      name="customType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Préciser le type de culte</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Culte de jeunesse, Mariage..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={serviceForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Heure</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={serviceForm.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thème / Message</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: La Puissance de la Foi..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={serviceForm.control}
                    name="preacher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prédicateur</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du prédicateur" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={serviceForm.control}
                    name="expectedCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacité attendue</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={serviceForm.control}
                  name="verseOfDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verset du jour (Optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Jean 3:16" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-church-green">Planifier</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {nextService ? (
        <Card className="border-none shadow-lg bg-church-dark text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ChurchIcon className="w-32 h-32" />
          </div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-church-gold text-white border-none">PROCHAIN CULTE</Badge>
                  {nextService.isPublished ? (
                    <Badge className="bg-white/10 text-white border-white/20">PUBLIÉ</Badge>
                  ) : (
                    <Badge variant="outline" className="text-white/40 border-white/10 italic">BROUILLON</Badge>
                  )}
                </div>
                <h2 className="text-4xl font-serif font-bold text-church-gold">{nextService.theme}</h2>
                <div className="flex flex-wrap gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-church-gold" />
                    <span>{format(new Date(nextService.date), 'EEEE dd MMMM yyyy', { locale: fr })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-church-gold" />
                    <span>{format(new Date(nextService.date), 'HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic2 className="w-5 h-5 text-church-gold" />
                    <span>Prédicateur: {nextService.preacher}</span>
                  </div>
                </div>
                <div className="pt-4 flex flex-wrap gap-4">
                  {!nextService.isPublished && (
                    <Button 
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => {
                        updateService(nextService.id, { isPublished: true } as any);
                        toast.success("Culte publié avec succès");
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Publier sur le site
                    </Button>
                  )}
                  <Button 
                    className="bg-church-gold hover:bg-church-gold/90 text-white"
                    onClick={() => setSelectedServiceId(nextService.id)}
                  >
                    Gérer le culte <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {nextService.status === 'live' && (
                    <Badge className="bg-red-500 animate-pulse text-white border-none px-4 py-2">
                      EN DIRECT
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 min-w-[240px]">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/40 uppercase font-bold mb-1">Capacité</p>
                  <p className="text-2xl font-bold">{nextService.expectedCapacity}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/40 uppercase font-bold mb-1">Type</p>
                  <p className="text-sm font-bold capitalize">
                    {nextService.type === 'sunday' ? 'Dimanche' : 
                     nextService.type === 'vigil' ? 'Veillée' : 
                     nextService.type === 'fast' ? 'Jeûne & Prière' :
                     nextService.type === 'other' ? (nextService.customType || 'Autres') : 'Spécial'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
          <CardContent className="py-12 flex flex-col items-center text-center">
            <CalendarIcon className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600">Aucun culte planifié</h3>
            <p className="text-slate-400 mb-6">Commencez par planifier votre prochain moment de célébration.</p>
            <Button variant="outline" onClick={() => setIsAddServiceOpen(true)}>Planifier maintenant</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Historique des cultes</h3>
          <div className="space-y-3">
            {pastServices.length === 0 ? (
              <p className="text-slate-400 italic">Aucun culte passé enregistré.</p>
            ) : (
              pastServices.map((s) => (
                <Card 
                  key={s.id} 
                  className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelectedServiceId(s.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-church-gold/10 transition-colors">
                        <span className="text-[10px] uppercase font-bold text-church-gold">
                          {format(new Date(s.date), 'MMM', { locale: fr })}
                        </span>
                        <span className="text-lg font-bold text-slate-900 leading-none">
                          {format(new Date(s.date), 'dd')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{s.theme}</h4>
                          {s.isPublished ? (
                            <Badge className="bg-church-gold/10 text-church-gold border-none text-[8px] h-4">PUBLIÉ</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-300 border-slate-200 text-[8px] h-4 italic">BROUILLON</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{s.preacher} • {format(new Date(s.date), 'HH:mm')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {!s.isPublished && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-church-gold hover:bg-church-gold/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateService(s.id, { isPublished: true } as any);
                            toast.success("Culte publié");
                          }}
                        >
                          <Share2 className="w-3 h-3 mr-1" /> Publier
                        </Button>
                      )}
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-400">Présents</p>
                        <p className="font-bold text-slate-700">{(s.summary?.adults || 0) + (s.summary?.children || 0)}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-church-gold transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Statistiques globales</h3>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Fréquentation Moyenne</span>
                  <span className="font-bold text-church-green">145</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Croissance Mensuelle</span>
                  <span className="font-bold text-blue-600">+12%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <p className="text-xs text-blue-700 font-medium">
                    La fréquentation a augmenté de 20% lors des cultes spéciaux ce trimestre.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ServiceDetail({ service, onBack }: { service: Service, onBack: () => void }) {
  const { 
    members, 
    servicePrograms, 
    visitors, 
    serviceFinances,
    updateService,
    addServiceProgramItem,
    updateServiceProgramItem,
    deleteServiceProgramItem,
    addVisitor,
    addServiceFinance
  } = useStore();

  const [activeTab, setActiveTab] = React.useState('program');
  const [isLiveMode, setIsLiveMode] = React.useState(service.status === 'live');
  const [isAddItemOpen, setIsAddItemOpen] = React.useState(false);
  const [isAddVisitorOpen, setIsAddVisitorOpen] = React.useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = React.useState('');
  const [isAddFinanceOpen, setIsAddFinanceOpen] = React.useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [selectedFinanceMembers, setSelectedFinanceMembers] = React.useState<string[]>([]);
  const [bulkAmount, setBulkAmount] = React.useState<string>('0');
  const [financeSearch, setFinanceSearch] = React.useState('');
  const [bulkFinanceType, setBulkFinanceType] = React.useState<'offering' | 'tithe' | 'donation'>('offering');

  // Use props directly for reactive updates
  const adults = service.summary?.adults || 0;
  const children = service.summary?.children || 0;

  const [selectedMembers, setSelectedMembers] = React.useState<string[]>(service.summary?.presentMemberIds || []);
  const [adultsInput, setAdultsInput] = React.useState(service.summary?.adults.toString() || '0');
  const [childrenInput, setChildrenInput] = React.useState(service.summary?.children.toString() || '0');

  React.useEffect(() => {
    setAdultsInput(adults.toString());
  }, [adults]);

  React.useEffect(() => {
    setChildrenInput(children.toString());
  }, [children]);

  const handleManualAttendanceUpdate = (type: 'adults' | 'children', value: string) => {
    const numValue = parseInt(value) || 0;
    const currentSummary = service.summary || { adults: 0, children: 0, visitors: 0, totalOfferings: 0, keyPoints: '' };
    
    if (type === 'adults') {
      setAdultsInput(value);
      updateService(service.id, { 
        summary: { ...currentSummary, adults: numValue } as any 
      });
    } else {
      setChildrenInput(value);
      updateService(service.id, { 
        summary: { ...currentSummary, children: numValue } as any 
      });
    }
  };

  const toggleMemberAttendance = (memberId: string) => {
    const currentSummary = service.summary || { adults: 0, children: 0, visitors: 0, totalOfferings: 0, keyPoints: '' };
    const currentPresentIds = currentSummary.presentMemberIds || [];
    const newPresentIds = currentPresentIds.includes(memberId)
      ? currentPresentIds.filter(id => id !== memberId)
      : [...currentPresentIds, memberId];
    
    updateService(service.id, {
      summary: { ...currentSummary, presentMemberIds: newPresentIds } as any
    });
  };

  const updateAttendance = (type: 'adults' | 'children', delta: number) => {
    const currentSummary = service.summary || { adults: 0, children: 0, visitors: 0, totalOfferings: 0, keyPoints: '' };
    if (type === 'adults') {
      const newVal = Math.max(0, adults + delta);
      updateService(service.id, { 
        summary: { ...currentSummary, adults: newVal } as any 
      });
    } else {
      const newVal = Math.max(0, children + delta);
      updateService(service.id, { 
        summary: { ...currentSummary, children: newVal } as any 
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const newFiles = Array.from(uploadedFiles as FileList).map(f => ({ name: f.name, url: '#' }));
      const currentFiles = service.files || [];
      updateService(service.id, { 
        files: [...currentFiles, ...newFiles] 
      });
      toast.success(`${uploadedFiles.length} fichier(s) téléversé(s)`);
    }
  };

  const linkForm = useForm({
    defaultValues: { url: '', platform: 'youtube' as 'youtube' | 'facebook' }
  });

  const onAddLink = (values: any) => {
    const currentLinks = service.videoLinks || [];
    updateService(service.id, { 
      videoLinks: [...currentLinks, { platform: values.platform, url: values.url }]
    });
    toast.success(`Lien ${values.platform} ajouté au culte`);
    setIsAddLinkOpen(false);
    linkForm.reset();
  };

  const programs = servicePrograms
    .filter(p => p.serviceId === service.id)
    .sort((a, b) => a.order - b.order);

  const serviceVisitors = visitors.filter(v => v.serviceId === service.id);
  const finances = serviceFinances.filter(f => f.serviceId === service.id);

  const programForm = useForm<z.infer<typeof programItemSchema>>({
    resolver: zodResolver(programItemSchema),
    defaultValues: { 
      title: '', 
      responsibleId: '', 
      duration: 15 
    }
  });

  const visitorForm = useForm<z.infer<typeof visitorSchema>>({
    resolver: zodResolver(visitorSchema),
    defaultValues: { 
      lastName: '', 
      firstName: '', 
      gender: 'M',
      phone: '', 
      originAddress: '',
      residenceAddress: '',
      invitedBy: ''
    }
  });

  const financeForm = useForm<z.infer<typeof financeSchema>>({
    resolver: zodResolver(financeSchema),
    defaultValues: { type: 'offering', amount: 0, notes: '' }
  });

  const [responsibleSearch, setResponsibleSearch] = React.useState('');
  const [substituteSearch, setSubstituteSearch] = React.useState('');

  const filteredMembersForResponsible = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(responsibleSearch.toLowerCase())
  );

  const filteredMembersForSubstitute = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(substituteSearch.toLowerCase())
  );

  const filteredMembersForFinance = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(financeSearch.toLowerCase())
  );

  const handleSelectAllFinanceMembers = () => {
    if (selectedFinanceMembers.length === filteredMembersForFinance.length) {
      setSelectedFinanceMembers([]);
    } else {
      setSelectedFinanceMembers(filteredMembersForFinance.map(m => m.id));
    }
  };

  const applyBulkFinance = () => {
    const amount = parseInt(bulkAmount) || 0;
    if (amount <= 0 || selectedFinanceMembers.length === 0) {
      toast.error("Choisissez des membres et un montant valide");
      return;
    }

    selectedFinanceMembers.forEach(memberId => {
      addServiceFinance({
        serviceId: service.id,
        memberId: memberId,
        amount: amount,
        type: bulkFinanceType,
        notes: `Saisie groupée (${bulkFinanceType})`
      });
    });

    toast.success(`Apports enregistrés pour ${selectedFinanceMembers.length} membres`);
    setSelectedFinanceMembers([]);
    setBulkAmount('0');
  };

  const onAddProgramItem = (values: z.infer<typeof programItemSchema>) => {
    addServiceProgramItem({
      ...values,
      serviceId: service.id,
      order: programs.length + 1,
      isCompleted: false
    });
    setIsAddItemOpen(false);
    programForm.reset();
    toast.success("Élément ajouté au programme");
  };

  const onAddVisitor = (values: z.infer<typeof visitorSchema>) => {
    addVisitor({
      ...values,
      serviceId: service.id,
      firstVisitDate: new Date().toISOString(),
      status: 'first_visit'
    });
    setIsAddVisitorOpen(false);
    visitorForm.reset();
    toast.success("Visiteur enregistré");
  };

  const onAddFinance = (values: z.infer<typeof financeSchema>) => {
    addServiceFinance({
      ...values,
      serviceId: service.id
    });
    setIsAddFinanceOpen(false);
    financeForm.reset();
    toast.success("Transaction enregistrée");
  };

  const toggleLiveMode = () => {
    const newStatus = isLiveMode ? 'planned' : 'live';
    updateService(service.id, { status: newStatus });
    setIsLiveMode(!isLiveMode);
    if (!isLiveMode) toast.success("Mode LIVE activé");
  };

  const completeService = () => {
    updateService(service.id, { 
      status: 'completed',
      summary: {
        adults: 120, // Mock data for now
        children: 45,
        visitors: serviceVisitors.length,
        totalOfferings: finances.reduce((acc, f) => acc + f.amount, 0),
        keyPoints: "Message puissant sur la persévérance."
      }
    });
    onBack();
    toast.success("Culte terminé et rapport généré");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif font-bold text-slate-900">{service.theme}</h1>
              {service.status === 'live' && (
                <Badge className="bg-red-500 animate-pulse text-white border-none">LIVE</Badge>
              )}
              {service.status === 'completed' && (
                <Badge variant="secondary">Terminé</Badge>
              )}
            </div>
            <p className="text-slate-500">{format(new Date(service.date), 'EEEE dd MMMM yyyy • HH:mm', { locale: fr })}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!service.isPublished && (
            <Button 
              variant="outline" 
              className="border-church-gold text-church-gold hover:bg-church-gold/5"
              onClick={() => {
                updateService(service.id, { isPublished: true } as any);
                toast.success("Culte publié avec succès");
              }}
            >
              <Share2 className="w-4 h-4 mr-2" /> Publier le Culte
            </Button>
          )}
          {service.status !== 'completed' && (
            <>
              <Button 
                variant={isLiveMode ? "destructive" : "outline"}
                onClick={toggleLiveMode}
              >
                {isLiveMode ? <Timer className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isLiveMode ? "Arrêter Live" : "Démarrer Live"}
              </Button>
              <Button className="bg-church-green" onClick={completeService}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Terminer le culte
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white p-1 border border-slate-100 h-12">
          <TabsTrigger value="program" className="data-[state=active]:bg-slate-50">
            <Mic2 className="w-4 h-4 mr-2" /> Programme
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-slate-50">
            <Users className="w-4 h-4 mr-2" /> Participants
          </TabsTrigger>
          <TabsTrigger value="finances" className="data-[state=active]:bg-slate-50">
            <Wallet className="w-4 h-4 mr-2" /> Offrandes
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-slate-50">
            <Video className="w-4 h-4 mr-2" /> Médias
          </TabsTrigger>
          <TabsTrigger value="report" className="data-[state=active]:bg-slate-50">
            <FileText className="w-4 h-4 mr-2" /> Rapport
          </TabsTrigger>
        </TabsList>

        <TabsContent value="program" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Déroulement du culte</h3>
            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
              <DialogTrigger render={<Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Ajouter une étape
              </Button>}>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle étape du programme</DialogTitle>
                </DialogHeader>
                <Form {...programForm}>
                  <form onSubmit={programForm.handleSubmit(onAddProgramItem)} className="space-y-4 py-4">
                    <FormField
                      control={programForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre (ex: Louange, Prédication...)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={programForm.control}
                      name="responsibleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsable Principal</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              <div className="p-2 border-b">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input 
                                    placeholder="Rechercher..." 
                                    className="pl-8 h-8 text-xs border-none bg-slate-50 focus-visible:ring-0" 
                                    value={responsibleSearch}
                                    onChange={(e) => setResponsibleSearch(e.target.value)}
                                    // Custom input in SelectContent can be tricky with Focus, but let's try.
                                  />
                                </div>
                              </div>
                              {filteredMembersForResponsible.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={programForm.control}
                      name="substituteId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remplaçant (Optionnel)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              <div className="p-2 border-b">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input 
                                    placeholder="Rechercher..." 
                                    className="pl-8 h-8 text-xs border-none bg-slate-50 focus-visible:ring-0" 
                                    value={substituteSearch}
                                    onChange={(e) => setSubstituteSearch(e.target.value)}
                                  />
                                </div>
                              </div>
                              <SelectItem value="none">Aucun</SelectItem>
                              {filteredMembersForSubstitute.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={programForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée estimée (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-church-green">Ajouter</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {programs.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-100 bg-slate-50/50">
                  <CardContent className="py-12 text-center text-slate-400 italic">
                    Aucun programme défini.
                  </CardContent>
                </Card>
              ) : (
                programs.map((item, index) => {
                  const responsible = members.find(m => m.id === item.responsibleId);
                  return (
                    <Card 
                      key={item.id} 
                      className={cn(
                        "border-none shadow-sm transition-all",
                        item.isCompleted ? "bg-slate-50 opacity-60" : "bg-white",
                        isLiveMode && !item.isCompleted && index === programs.findIndex(p => !p.isCompleted) ? "ring-2 ring-church-gold ring-offset-2" : ""
                      )}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                            item.isCompleted ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"
                          )}>
                            {item.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                            <p className="text-xs text-slate-500">
                              {responsible ? `${responsible.firstName} ${responsible.lastName}` : 'N/A'} • {item.duration} min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLiveMode && !item.isCompleted && (
                            <Button 
                              size="sm" 
                              className="bg-church-green h-8"
                              onClick={() => updateServiceProgramItem(item.id, { isCompleted: true })}
                            >
                              Terminer
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteServiceProgramItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-church-gold/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Timer className="w-5 h-5 text-church-gold" />
                    Temps Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {programs.reduce((acc, p) => acc + p.duration, 0)} min
                  </div>
                  <p className="text-xs text-slate-500">
                    Fin estimée: {format(new Date(new Date(service.date).getTime() + programs.reduce((acc, p) => acc + p.duration, 0) * 60000), 'HH:mm')}
                  </p>
                </CardContent>
              </Card>
              
              {isLiveMode && (
                <Card className="border-none shadow-sm bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                      <Play className="w-5 h-5 animate-pulse" />
                      Mode Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-600 mb-4">
                      Affichez le programme en cours sur les écrans du temple.
                    </p>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                      Lancer la projection
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500 uppercase">Adultes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={adultsInput}
                      onChange={(e) => handleManualAttendanceUpdate('adults', e.target.value)}
                      className="w-20 text-2xl font-bold border-none bg-slate-50 focus-visible:ring-church-gold/20"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-church-gold/10" onClick={() => updateAttendance('adults', -1)}>-</Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-church-gold/10" onClick={() => updateAttendance('adults', 1)}>+</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500 uppercase">Enfants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={childrenInput}
                      onChange={(e) => handleManualAttendanceUpdate('children', e.target.value)}
                      className="w-20 text-2xl font-bold border-none bg-slate-50 focus-visible:ring-church-gold/20"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-church-gold/10" onClick={() => updateAttendance('children', -1)}>-</Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-church-gold/10" onClick={() => updateAttendance('children', 1)}>+</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500 uppercase">Visiteurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold pl-3">{serviceVisitors.length}</span>
                  <Button variant="outline" size="sm" onClick={() => setIsAddVisitorOpen(true)} className="hover:bg-church-gold/10">
                    <UserPlus className="w-4 h-4 mr-2" /> Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-slate-900">Pointage des membres</h3>
                <div className="flex items-center gap-2">
                  <div className="relative w-64 mr-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Rechercher un membre..." 
                      className="pl-9 h-9 text-xs rounded-lg"
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const allIds = members.map(m => m.id);
                      const currentSummary = service.summary || { adults: 0, children: 0, visitors: 0, totalOfferings: 0, keyPoints: '' };
                      updateService(service.id, { 
                        summary: { ...currentSummary, presentMemberIds: allIds } as any 
                      });
                    }}
                  >
                    Tout sélectionner
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const currentSummary = service.summary || { adults: 0, children: 0, visitors: 0, totalOfferings: 0, keyPoints: '' };
                      updateService(service.id, { 
                        summary: { ...currentSummary, presentMemberIds: [] } as any 
                      });
                    }}
                  >
                    Effacer
                  </Button>
                </div>
              </div>
              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
                    {members.filter(m => 
                      m.firstName.toLowerCase().includes(memberSearchTerm.toLowerCase()) || 
                      m.lastName.toLowerCase().includes(memberSearchTerm.toLowerCase())
                    ).map((m) => (
                      <div 
                        key={m.id} 
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group",
                          service.summary?.presentMemberIds?.includes(m.id) 
                            ? "bg-church-green/10 border-church-green/20" 
                            : "bg-white border-slate-100 hover:border-slate-200"
                        )}
                        onClick={() => toggleMemberAttendance(m.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={cn(
                              "text-[10px]",
                              service.summary?.presentMemberIds?.includes(m.id) ? "bg-church-green text-white" : "bg-slate-100 text-slate-500"
                            )}>
                              {m.firstName[0]}{m.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{m.firstName} {m.lastName}</p>
                            <p className="text-[10px] text-slate-500">{m.phone}</p>
                          </div>
                        </div>
                        {service.summary?.presentMemberIds?.includes(m.id) && (
                          <CheckCircle2 className="w-4 h-4 text-church-green" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Nouveaux Visiteurs</h3>
              <div className="grid grid-cols-1 gap-4">
                {serviceVisitors.length === 0 ? (
                  <Card className="border-2 border-dashed border-slate-100 bg-slate-50/50">
                    <CardContent className="py-12 text-center text-slate-400 italic text-sm">
                      Aucun visiteur enregistré.
                    </CardContent>
                  </Card>
                ) : (
                  serviceVisitors.map((v) => (
                    <Card key={v.id} className="border border-slate-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blue-50 text-blue-600">
                              {v.firstName[0]}{v.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900">{v.firstName} {v.lastName}</p>
                            <p className="text-xs text-slate-500">{v.phone}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                          <Badge variant="outline" className="text-[10px] uppercase">1ère Visite</Badge>
                          <Button variant="ghost" size="sm" className="text-church-gold h-7 text-xs">Suivre</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="finances" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Collecte du culte</h3>
            <Button className="bg-church-green" onClick={() => setIsAddFinanceOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Enregistrer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm bg-green-50/50">
              <CardContent className="p-6">
                <p className="text-sm text-green-600 font-bold uppercase mb-1">Total Collecté</p>
                <p className="text-3xl font-bold text-slate-900">
                  {finances.reduce((acc, f) => acc + f.amount, 0).toLocaleString()} FCFA
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 uppercase mb-1">Offrandes</p>
                <p className="text-2xl font-bold text-slate-900">
                  {finances.filter(f => f.type === 'offering').reduce((acc, f) => acc + f.amount, 0).toLocaleString()} FCFA
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 uppercase mb-1">Dîmes</p>
                <p className="text-2xl font-bold text-slate-900">
                  {finances.filter(f => f.type === 'tithe').reduce((acc, f) => acc + f.amount, 0).toLocaleString()} FCFA
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Membre</th>
                      <th className="px-6 py-4">Notes</th>
                      <th className="px-6 py-4 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {finances.map((f) => {
                      const member = members.find(m => m.id === f.memberId);
                      return (
                        <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="capitalize">{f.type === 'offering' ? 'Offrande' : f.type === 'tithe' ? 'Dîme' : 'Don'}</Badge>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {member ? `${member.firstName} ${member.lastName}` : 'Anonyme'}
                          </td>
                          <td className="px-6 py-4 text-slate-500">{f.notes || '-'}</td>
                          <td className="px-6 py-4 text-right font-bold">{f.amount.toLocaleString()} FCFA</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-church-gold" />
                  Vidéo du message
                </CardTitle>
                <CardDescription>Ajoutez les liens de rediffusion YouTube ou Facebook.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={isAddLinkOpen} onOpenChange={setIsAddLinkOpen}>
                  <DialogTrigger render={<Button variant="outline" className="w-full" />}>
                    <Plus className="w-4 h-4 mr-2" /> Ajouter un lien YouTube / Facebook
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un lien vidéo</DialogTitle>
                    </DialogHeader>
                    <Form {...linkForm}>
                      <form onSubmit={linkForm.handleSubmit(onAddLink)} className="space-y-4 py-4">
                        <FormField
                          control={linkForm.control}
                          name="platform"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plateforme</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="youtube">YouTube</SelectItem>
                                  <SelectItem value="facebook">Facebook</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={linkForm.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL de la vidéo</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-church-green">Enregistrer le lien</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <div className="space-y-2 mt-4">
                  {(service.videoLinks || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Aucun lien vidéo pour le moment.</p>
                  ) : (
                    service.videoLinks?.map((link, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {link.platform === 'youtube' ? <PlayCircle className="w-3 h-3 text-red-500" /> : <Globe className="w-3 h-3 text-blue-500" />}
                          <span className="text-[10px] font-medium truncate max-w-[150px]">{link.url}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-slate-400 hover:text-red-500"
                          onClick={() => {
                            const remaining = service.videoLinks?.filter((_, i) => i !== idx);
                            updateService(service.id, { videoLinks: remaining });
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-church-gold" />
                  Notes & Photos
                </CardTitle>
                <CardDescription>Téléversez les photos du culte ou les documents liturgiques.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Affiche du culte (Public)</Label>
                  <div 
                    className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateService(service.id, { imageUrl: reader.result as string });
                            toast.success("Affiche du culte mise à jour");
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-slate-300 mb-1" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Ajouter une affiche</span>
                      </>
                    )}
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  onChange={handleFileUpload}
                />
                <div 
                  className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">Cliquez pour téléverser des fichiers</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  Téléverser des fichiers
                </Button>
                <div className="space-y-2 mt-4">
                  {(service.files || []).length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic text-center py-2">Aucun fichier pour le moment.</p>
                  ) : (
                    service.files?.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-[10px] font-medium truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-slate-400 hover:text-red-500"
                            onClick={() => {
                              const remaining = service.files?.filter((_, i) => i !== idx);
                              updateService(service.id, { files: remaining });
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="report" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Rapport de Synthèse</CardTitle>
                  <CardDescription>Généré automatiquement après le culte</CardDescription>
                </div>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" /> Exporter PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Présence Totale</p>
                  <p className="text-3xl font-bold text-slate-900">165</p>
                  <p className="text-[10px] text-green-600 font-bold">+15% vs moy.</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Nouveaux Visiteurs</p>
                  <p className="text-3xl font-bold text-slate-900">{serviceVisitors.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Collecté</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {finances.reduce((acc, f) => acc + f.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Durée Effective</p>
                  <p className="text-3xl font-bold text-slate-900">2h 15m</p>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-50">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-church-gold" />
                  Points clés du message
                </h4>
                <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 leading-relaxed">
                  {service.summary?.keyPoints || "Le rapport détaillé sera disponible une fois le culte marqué comme terminé."}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Visitor Dialog */}
      <Dialog open={isAddVisitorOpen} onOpenChange={setIsAddVisitorOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enregistrer un visiteur</DialogTitle>
          </DialogHeader>
          <Form {...visitorForm}>
            <form onSubmit={visitorForm.handleSubmit(onAddVisitor)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={visitorForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de famille" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={visitorForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={visitorForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexe</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="M">Masculin</SelectItem>
                          <SelectItem value="F">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={visitorForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="Numéro de contact" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={visitorForm.control}
                name="originAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de provenance</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Yamoussoukro, Quartier Dioulakro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={visitorForm.control}
                name="residenceAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu d'habitation (Abidjan)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cocody Angré, 8ème Tranche" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={visitorForm.control}
                name="invitedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invité par</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la personne qui l'a invité" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-church-green">Enregistrer le visiteur</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddFinanceOpen} onOpenChange={setIsAddFinanceOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Enregistrer les Apports Financiers</DialogTitle>
            <DialogDescription>
              Saisie groupée ou individuelle des offrandes et dîmes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type Global (pour sélection groupée)</Label>
                <Select 
                  value={bulkFinanceType} 
                  onValueChange={(v) => setBulkFinanceType(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offering">Offrande</SelectItem>
                    <SelectItem value="tithe">Dîme</SelectItem>
                    <SelectItem value="donation">Don Spécial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Montant Global (FCFA)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={bulkAmount} 
                    onChange={(e) => setBulkAmount(e.target.value)}
                    placeholder="Montant pour tous"
                  />
                  <Button variant="outline" className="shrink-0" onClick={handleSelectAllFinanceMembers}>
                    {selectedFinanceMembers.length === filteredMembersForFinance.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={applyBulkFinance} 
                className="bg-church-gold"
                disabled={selectedFinanceMembers.length === 0 || parseInt(bulkAmount) <= 0}
              >
                Appliquer à la sélection ({selectedFinanceMembers.length})
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 leading-none">Liste des contributeurs</h4>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Chercher un membre..." 
                    className="pl-8 h-8 text-xs w-[200px]"
                    value={financeSearch}
                    onChange={(e) => setFinanceSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-xl divide-y overflow-hidden max-h-[300px] overflow-y-auto">
                {filteredMembersForFinance.map((m) => (
                  <div 
                    key={m.id} 
                    className={cn(
                      "p-3 flex items-center justify-between transition-colors cursor-pointer",
                      selectedFinanceMembers.includes(m.id) ? "bg-church-gold/10" : "hover:bg-slate-50"
                    )}
                    onClick={() => {
                      setSelectedFinanceMembers(prev => 
                        prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                      );
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedFinanceMembers.includes(m.id)} 
                        onCheckedChange={() => {
                          setSelectedFinanceMembers(prev => 
                            prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                          );
                        }}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-slate-100 text-[10px]">{m.firstName[0]}{m.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
                        <p className="text-[10px] text-slate-500">{m.phone}</p>
                      </div>
                    </div>
                    {/* Individual entry logic preserved although bulk is preferred */}
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">FCFA</span>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          className="w-[100px] h-8 pl-10 text-xs text-right font-bold"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const amount = parseInt((e.target as HTMLInputElement).value);
                              if (amount > 0) {
                                addServiceFinance({
                                  serviceId: service.id,
                                  memberId: m.id,
                                  amount: amount,
                                  type: bulkFinanceType,
                                  notes: 'Saisie individuelle rapide'
                                });
                                toast.success(`Enregistré pour ${m.firstName}`);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-church-gold/5 rounded-2xl border border-church-gold/10 space-y-3">
              <h4 className="text-xs font-bold uppercase text-church-gold">Saisie Manuelle (Anonyme ou autre)</h4>
              <Form {...financeForm}>
                <form onSubmit={financeForm.handleSubmit(onAddFinance)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={financeForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="offering">Offrande</SelectItem>
                              <SelectItem value="tithe">Dîme</SelectItem>
                              <SelectItem value="donation">Don Spécial</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={financeForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Montant (FCFA)</FormLabel>
                          <FormControl>
                            <Input type="number" className="h-9" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-church-gold h-9 text-xs">
                    Enregistrer l'apport individuel
                  </Button>
                </form>
              </Form>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFinanceOpen(false)}>Fermer</Button>
            <Button className="bg-church-green" onClick={() => {
              setIsAddFinanceOpen(false);
              toast.success("Toutes les collectes ont été enregistrées");
            }}>
              Enregistrer tout le lot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

