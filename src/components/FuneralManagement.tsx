import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleGenAI } from "@google/genai";
import { 
  HeartHandshake, 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Users,
  Coins,
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
  Trash2,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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
import { 
  useStore, 
  FuneralCase, 
  FuneralContribution, 
  FuneralExpense, 
  FuneralTask, 
  FuneralMessage,
  FuneralMilestone,
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

const caseSchema = z.object({
  deceasedName: z.string().min(2, "Nom requis"),
  memberId: z.string().optional(),
  familyContactId: z.string().min(1, "Contact famille requis"),
  dateOfDeath: z.string().min(1, "Date requise"),
  location: z.string().min(2, "Lieu requis"),
  description: z.string().min(10, "Description requise"),
  churchId: z.string().min(1, "Église requise"),
});

type CaseFormValues = z.infer<typeof caseSchema>;

const contributionSchema = z.object({
  contributorName: z.string().min(2, "Nom requis"),
  memberId: z.string().optional(),
  amount: z.coerce.number().min(1, "Montant requis"),
  paymentMethod: z.enum(['Cash', 'Orange Money', 'MTN MoMo', 'Moov Money', 'Wave', 'Djamo', 'Bank']),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

const expenseSchema = z.object({
  category: z.enum(['transport', 'organization', 'family_aid', 'other']),
  description: z.string().min(2, "Description requise"),
  amount: z.coerce.number().min(1, "Montant requis"),
  date: z.string().min(1, "Date requise"),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const taskSchema = z.object({
  title: z.string().min(2, "Titre requis"),
  dueDate: z.string().min(1, "Date d'échéance requise"),
  assignedTo: z.string().min(1, "Responsable requis"),
  type: z.enum(['visit', 'logistics', 'ceremony', 'other']),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const programSchema = z.object({
  wakeDate: z.string().optional(),
  wakeLocation: z.string().optional(),
  wakeDescription: z.string().optional(),
  ceremonyDate: z.string().optional(),
  ceremonyTime: z.string().optional(),
  ceremonyLocation: z.string().optional(),
  burialLocation: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type ProgramFormValues = z.infer<typeof programSchema>;

const milestoneSchema = z.object({
  label: z.string().min(2, "Nom de l'étape requis"),
  date: z.string().min(1, "Date requise"),
});

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

function CaseDetail({ funeralCase, onClose }: { funeralCase: FuneralCase; onClose: () => void }) {
  const { 
    members, 
    funeralContributions, 
    funeralExpenses, 
    funeralTasks, 
    funeralMessages,
    addFuneralContribution,
    addFuneralExpense,
    addFuneralTask,
    updateFuneralTask,
    addFuneralMessage,
    updateFuneralCase
  } = useStore();

  const [activeTab, setActiveTab] = React.useState('info');
  const [message, setMessage] = React.useState('');
  const [memberSearch, setMemberSearch] = React.useState('');
  const [isMemberPopoverOpen, setIsMemberPopoverOpen] = React.useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = React.useState(false);
  const [confirmTaskDoneId, setConfirmTaskDoneId] = React.useState<string | null>(null);
  const [isCloseCaseDialogOpen, setIsCloseCaseDialogOpen] = React.useState(false);
  const [isAddContributionOpen, setIsAddContributionOpen] = React.useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = React.useState(false);
  const [isAiSuggestionConfirmed, setIsAiSuggestionConfirmed] = React.useState(false);
  const [isAiConfirmDialogOpen, setIsAiConfirmDialogOpen] = React.useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = React.useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = React.useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = React.useState(false);
  const [uploadedPhotos, setUploadedPhotos] = React.useState<string[]>(funeralCase.photos || []);
  const [aiDialog, setAiDialog] = React.useState<{ 
    isOpen: boolean; 
    type: 'announcement' | 'reminder'; 
    content: string; 
    isGenerating: boolean; 
    isConfirmed: boolean;
    suggestions: string[];
    isManual: boolean;
  }>({
    isOpen: false,
    type: 'announcement',
    content: '',
    isGenerating: false,
    isConfirmed: false,
    suggestions: [],
    isManual: false
  });

  const generateFinalReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); 
    doc.text(`RAPPORT DE CLÔTURE`, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(`Cas: ${funeralCase.deceasedName}`, pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); 
    doc.text(`Période: Du ${format(new Date(funeralCase.createdAt), 'dd/MM/yyyy')} au ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth / 2, 38, { align: 'center' });
    
    // Page 1: Cotisations
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("I. RÉCAPITULATIF DES COTISATIONS", 20, 55);
    
    const contributionData = caseContributions.map(c => [
      c.contributorName,
      `${c.amount.toLocaleString()} FCFA`,
      c.paymentMethod,
      format(new Date(c.date), 'dd/MM/yyyy')
    ]);
    
    autoTable(doc, {
      startY: 60,
      head: [['Contributeur', 'Montant', 'Mode', 'Date']],
      body: contributionData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });
    
    const finalY1 = (doc as any).lastAutoTable.finalY || 60;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL COLLECTÉ: ${totalCollected.toLocaleString()} FCFA`, pageWidth - 20, finalY1 + 10, { align: 'right' });
    
    // Page 2: Dépenses
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("II. ÉTAT DES DÉPENSES EFFECTUÉES", 20, 20);
    
    const expenseData = caseExpenses.map(e => [
      e.category.toUpperCase(),
      e.description,
      `${e.amount.toLocaleString()} FCFA`,
      format(new Date(e.date), 'dd/MM/yyyy')
    ]);
    
    autoTable(doc, {
      startY: 25,
      head: [['Catégorie', 'Description', 'Montant', 'Date']],
      body: expenseData,
      theme: 'striped',
      headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255] }
    });
    
    const finalY2 = (doc as any).lastAutoTable.finalY || 25;
    doc.setFontSize(11);
    doc.text(`TOTAL DÉPENSÉ: ${totalSpent.toLocaleString()} FCFA`, pageWidth - 20, finalY2 + 10, { align: 'right' });
    
    // Page 3: Tâches
    doc.addPage();
    doc.setFontSize(14);
    doc.text("III. ACTIONS ET TÂCHES RÉALISÉES", 20, 20);
    
    const completedTasks = caseTasks.filter(t => t.status === 'completed');
    const taskData = completedTasks.map(t => {
      const assignee = members.find(m => m.id === t.assignedTo);
      return [
        t.type.toUpperCase(),
        t.title,
        assignee ? `${assignee.firstName} ${assignee.lastName}` : 'N/A',
        format(new Date(t.dueDate), 'dd/MM/yyyy')
      ];
    });
    
    autoTable(doc, {
      startY: 25,
      head: [['Type', 'Action', 'Responsable', 'Date']],
      body: taskData.length > 0 ? taskData : [['-', 'Aucune tâche complétée', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] }
    });

    // Summary Page 4 or Footer
    const finalY3 = (doc as any).lastAutoTable.finalY || 25;
    doc.setFontSize(12);
    doc.text("BILAN FINAL", 20, finalY3 + 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Entrées: ${totalCollected.toLocaleString()} FCFA`, 20, finalY3 + 30);
    doc.text(`Total Sorties: ${totalSpent.toLocaleString()} FCFA`, 20, finalY3 + 38);
    doc.setFont("helvetica", "bold");
    doc.text(`SOLDE RESTANT: ${balance.toLocaleString()} FCFA`, 20, finalY3 + 48);

    doc.save(`Rapport_Funeral_${funeralCase.deceasedName.replace(/\s+/g, '_')}.pdf`);
  };

  const onPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newPhotos = [...uploadedPhotos];
    Array.from(files).forEach((file: File) => {
      if (newPhotos.length < 5) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPhotos.push(event.target.result as string);
            setUploadedPhotos([...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const savePhotos = () => {
    updateFuneralCase(funeralCase.id, { photos: uploadedPhotos });
    setIsPhotoDialogOpen(false);
    toast.success("Photos enregistrées avec succès");
  };

  const togglePublic = () => {
    const newState = !funeralCase.isPublic;
    updateFuneralCase(funeralCase.id, { isPublic: newState });
    toast.success(newState ? "Cas rendu public" : "Cas retiré de la publication");
  };

  const generateWithAi = async (type: 'announcement' | 'reminder') => {
    setAiDialog(prev => ({ 
      ...prev, 
      isOpen: true, 
      type, 
      isGenerating: true, 
      isConfirmed: false, 
      content: '', 
      suggestions: [],
      isManual: false 
    }));
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = type === 'announcement' 
        ? `Génère 3 suggestions distinctes et professionnelles pour une annonce officielle de décès pour une église. 
           Nom du défunt: ${funeralCase.deceasedName}. 
           Date du décès: ${format(new Date(funeralCase.dateOfDeath), 'dd MMMM yyyy', { locale: fr })}.
           Lieu: ${funeralCase.location}.
           Le ton doit être respectueux et compatissant. Inclut un appel à la prière.
           Réponds uniquement sous forme de tableau JSON de chaînes de caractères : ["suggestion 1", "suggestion 2", "suggestion 3"].`
        : `Génère 3 suggestions distinctes de messages de rappel de solidarité pour une église. 
           Objectif: Rappeler aux membres de participer aux contributions solidaires pour les funérailles de ${funeralCase.deceasedName}.
           Souligne l'importance de l'amour fraternel et de l'entraide. Mentionne que les fonds sont collectés par le secrétariat.
           Réponds uniquement sous forme de tableau JSON de chaînes de caractères : ["suggestion 1", "suggestion 2", "suggestion 3"].`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const suggestions = JSON.parse(response.text || '[]');
      setAiDialog(prev => ({ ...prev, suggestions, isGenerating: false }));
    } catch (error) {
      console.error("AI Generation failed:", error);
      toast.error("Échec de la génération IA");
      setAiDialog(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const shareViaWhatsApp = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareViaGmail = (text: string) => {
    const subject = aiDialog.type === 'announcement' 
      ? `Annonce Officielle - Décès de ${funeralCase.deceasedName}`
      : `Appel à Solidarité - ${funeralCase.deceasedName}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = url;
  };

  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const caseContributions = funeralContributions.filter(c => c.caseId === funeralCase.id);
  const caseExpenses = funeralExpenses.filter(e => e.caseId === funeralCase.id);
  const caseTasks = funeralTasks.filter(t => t.caseId === funeralCase.id);
  const caseMessages = funeralMessages.filter(m => m.caseId === funeralCase.id);

  // Calculate real-time participation metrics
  const totalMen = members.filter(m => m.gender === 'M').length;
  const totalWomen = members.filter(m => m.gender === 'F').length;
  
  const contributingMembers = caseContributions
    .map(c => members.find(m => m.id === c.memberId))
    .filter(Boolean) as Member[];
    
  const menContributing = contributingMembers.filter(m => m.gender === 'M').length;
  const womenContributing = contributingMembers.filter(m => m.gender === 'F').length;
  
  const menParticipationPercent = totalMen > 0 ? Math.round((menContributing / totalMen) * 100) : 0;
  const womenParticipationPercent = totalWomen > 0 ? Math.round((womenContributing / totalWomen) * 100) : 0;

  const totalCollected = caseContributions.reduce((acc, c) => acc + c.amount, 0);
  const totalSpent = caseExpenses.reduce((acc, e) => acc + e.amount, 0);
  const balance = totalCollected - totalSpent;

  const familyContact = members.find(m => m.id === funeralCase.familyContactId);

  const contributionForm = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema) as any,
    defaultValues: { 
      memberId: '',
      contributorName: '',
      amount: 0, 
      paymentMethod: 'Cash' 
    },
  });

  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: { 
      amount: 0, 
      category: 'other', 
      description: '', 
      date: new Date().toISOString().split('T')[0] 
    },
  });

  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: { 
      title: '', 
      dueDate: new Date().toISOString().split('T')[0], 
      assignedTo: '',
      type: 'logistics'
    },
  });

  const programForm = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema) as any,
    defaultValues: funeralCase.program || {
      wakeDate: '',
      wakeLocation: '',
      wakeDescription: '',
      ceremonyDate: '',
      ceremonyTime: '',
      ceremonyLocation: '',
      burialLocation: '',
      additionalNotes: '',
    },
  });

  const milestoneForm = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema) as any,
    defaultValues: { label: '', date: new Date().toISOString().split('T')[0] },
  });

  const onAddContribution = (values: ContributionFormValues) => {
    if (funeralCase.status === 'closed') {
      toast.error("Le cas est clôturé. Aucune action n'est permise.");
      return;
    }
    addFuneralContribution({
      ...values,
      caseId: funeralCase.id,
      date: new Date().toISOString(),
    });
    contributionForm.reset();
    setIsAddContributionOpen(false);
    toast.success("Contribution enregistrée");
  };

  const onAddExpense = (values: ExpenseFormValues) => {
    if (funeralCase.status === 'closed') {
      toast.error("Le cas est clôturé. Aucune action n'est permise.");
      return;
    }
    addFuneralExpense({
      ...values,
      caseId: funeralCase.id,
    });
    expenseForm.reset();
    setIsAddExpenseOpen(false);
    toast.success("Dépense enregistrée");
  };

  const onAddTask = (values: TaskFormValues) => {
    if (funeralCase.status === 'closed') {
      toast.error("Le cas est clôturé. Aucune action n'est permise.");
      return;
    }
    addFuneralTask({
      ...values,
      caseId: funeralCase.id,
      status: 'pending',
    });
    taskForm.reset();
    setIsAddTaskDialogOpen(false);
    toast.success("Tâche ajoutée avec succès");
  };

  const onUpdateProgram = (values: ProgramFormValues) => {
    updateFuneralCase(funeralCase.id, { program: values });
    setIsProgramDialogOpen(false);
    toast.success("Programme funèbre mis à jour");
  };

  const onAddMilestone = (values: MilestoneFormValues) => {
    const newMilestone: FuneralMilestone = {
      id: Math.random().toString(36).substr(2, 9),
      ...values,
      isCompleted: true,
    };
    const currentMilestones = funeralCase.milestones || [];
    updateFuneralCase(funeralCase.id, { milestones: [...currentMilestones, newMilestone] });
    milestoneForm.reset();
    setIsAddMilestoneOpen(false);
    toast.success("Étape d'avancement ajoutée");
  };

  const onToggleTaskStatus = (id: string) => {
    if (funeralCase.status === 'closed') {
      toast.error("Le cas est clôturé. Aucune action n'est permise.");
      return;
    }
    const task = funeralTasks.find(t => t.id === id);
    if (task) {
      updateFuneralTask(id, { status: task.status === 'completed' ? 'pending' : 'completed' });
      toast.success(task.status === 'completed' ? "Tâche marquée comme à faire" : "Tâche complétée");
    }
  };

  const onSendMessage = () => {
    if (funeralCase.status === 'closed') {
      toast.error("Le cas est clôturé. Aucune action n'est permise.");
      return;
    }
    if (!message.trim()) return;
    addFuneralMessage({
      caseId: funeralCase.id,
      authorName: "Trésorier", // Mock author
      content: message,
    });
    setMessage('');
    toast.success("Message envoyé");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">{funeralCase.deceasedName}</h2>
            <p className="text-sm text-slate-500">Décès survenu le {format(new Date(funeralCase.dateOfDeath), 'dd MMMM yyyy', { locale: fr })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 text-xs font-bold gap-2 border-slate-200"
            onClick={() => setIsProgramDialogOpen(true)}
          >
            <ClipboardList className="w-4 h-4 text-church-gold" />
            Programme Funèbre
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "h-9 text-xs font-bold gap-2 border-slate-200",
              funeralCase.isPublic ? "bg-church-gold/10 text-church-gold border-church-gold/20" : "text-slate-600"
            )}
            onClick={togglePublic}
          >
            <Globe className={cn("w-4 h-4", funeralCase.isPublic ? "text-church-gold" : "text-slate-400")} />
            {funeralCase.isPublic ? "Publié" : "Publier"}
          </Button>
          <Badge className={funeralCase.status === 'active' ? "bg-emerald-100 text-emerald-700 border-none px-3" : "bg-slate-100 text-slate-700 border-none px-3"}>
            {funeralCase.status === 'active' ? 'En cours' : 'Clôturé'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100 p-1 w-full justify-start overflow-x-auto">
              <TabsTrigger value="info" className="text-xs">Infos</TabsTrigger>
              <TabsTrigger value="contributions" className="text-xs">Contributions</TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs">Dépenses</TabsTrigger>
              <TabsTrigger value="support" className="text-xs">Soutien & Tâches</TabsTrigger>
              <TabsTrigger value="balance" className="text-xs">Bilan</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Détails du Cas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">Lieu</p>
                      <p className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {funeralCase.location}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">Contact Famille</p>
                      <p className="text-sm font-medium">
                        {familyContact ? `${familyContact.firstName} ${familyContact.lastName}` : 'Non spécifié'}
                      </p>
                      {familyContact?.phone && <p className="text-xs text-slate-400">{familyContact.phone}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase font-bold">Description / Contexte</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{funeralCase.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Messages de Soutien</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {caseMessages.map(m => (
                      <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-slate-900">{m.authorName}</span>
                          <span className="text-[10px] text-slate-400">{format(new Date(m.createdAt), 'dd/MM HH:mm')}</span>
                        </div>
                        <p className="text-sm text-slate-600 italic">"{m.content}"</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder={funeralCase.status === 'closed' ? "Cas clôturé" : "Votre message de soutien..."} 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                      disabled={funeralCase.status === 'closed'}
                    />
                    <Button size="icon" onClick={onSendMessage} className="bg-church-green" disabled={funeralCase.status === 'closed'}>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contributions" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Contributions Solidaires</h3>
                <Dialog open={isAddContributionOpen} onOpenChange={(open) => {
                  if (funeralCase.status === 'closed' && open) {
                    toast.error("Ce cas est clôturé");
                    return;
                  }
                  setIsAddContributionOpen(open);
                }}>
                  <DialogTrigger render={<Button size="sm" className="bg-emerald-600" disabled={funeralCase.status === 'closed'} />}>
                    <Plus className="w-4 h-4 mr-2" /> Ajouter
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enregistrer une contribution</DialogTitle>
                    </DialogHeader>
                    <Form {...contributionForm}>
                      <form onSubmit={contributionForm.handleSubmit(onAddContribution)} className="space-y-4">
                        <FormField
                          control={contributionForm.control as any}
                          name="contributorName"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Nom du Contributeur</FormLabel>
                              <div className="relative">
                                <Input 
                                  placeholder="Entrez un nom ou recherchez un membre..." 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setMemberSearch(e.target.value);
                                    if (e.target.value.length > 0) setIsMemberPopoverOpen(true);
                                  }}
                                  onFocus={() => {
                                    if (field.value && field.value.length > 0) setIsMemberPopoverOpen(true);
                                  }}
                                />
                                {isMemberPopoverOpen && filteredMembers.length > 0 && (
                                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {filteredMembers.map((member) => (
                                      <button
                                        key={member.id}
                                        type="button"
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center justify-between"
                                        onClick={() => {
                                          field.onChange(`${member.firstName} ${member.lastName}`);
                                          contributionForm.setValue('memberId', member.id);
                                          setIsMemberPopoverOpen(false);
                                          setMemberSearch('');
                                        }}
                                      >
                                        <span>{member.firstName} {member.lastName}</span>
                                        <Badge variant="outline" className="text-[8px] h-4">Membre</Badge>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={contributionForm.control as any}
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
                            control={contributionForm.control as any}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mode</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    <SelectItem value="Cash">Espèces</SelectItem>
                                    <SelectItem value="Orange Money">Orange Money</SelectItem>
                                    <SelectItem value="MTN MoMo">MTN MoMo</SelectItem>
                                    <SelectItem value="Moov Money">Moov Money</SelectItem>
                                    <SelectItem value="Wave">Wave</SelectItem>
                                    <SelectItem value="Djamo">Djamo</SelectItem>
                                    <SelectItem value="Bank">Virement Bancaire</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="w-full bg-emerald-600">Enregistrer</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead>Contributeur</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {caseContributions.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.contributorName}</TableCell>
                          <TableCell className="text-xs text-slate-500">{format(new Date(c.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="text-xs">{c.paymentMethod}</TableCell>
                          <TableCell className="font-bold text-emerald-600">{c.amount.toLocaleString()} FCFA</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger render={<Button variant="ghost" size="sm" className="text-xs h-7 px-2" />}>
                                Détails
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Détails de la Contribution</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-slate-500 uppercase font-bold">Contributeur</p>
                                      <p className="text-sm font-medium">{c.contributorName}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-slate-500 uppercase font-bold">Montant</p>
                                      <p className="text-sm font-bold text-emerald-600">{c.amount.toLocaleString()} FCFA</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-slate-500 uppercase font-bold">Mode de paiement</p>
                                      <p className="text-sm">{c.paymentMethod}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-slate-500 uppercase font-bold">Date de réception</p>
                                      <p className="text-sm">{format(new Date(c.date), 'dd MMMM yyyy HH:mm', { locale: fr })}</p>
                                    </div>
                                  </div>
                                  <div className="border-t pt-4 flex gap-2">
                                    <Button variant="outline" className="flex-1 h-8 text-xs">
                                      <FileText className="w-3.5 h-3.5 mr-2" />
                                      Reçu PDF
                                    </Button>
                                    <Button variant="outline" className="flex-1 h-8 text-xs text-rose-600 hover:text-rose-700">
                                      Annuler
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Gestion des Dépenses</h3>
                <Dialog open={isAddExpenseOpen} onOpenChange={(open) => {
                   if (funeralCase.status === 'closed' && open) {
                    toast.error("Ce cas est clôturé");
                    return;
                  }
                  setIsAddExpenseOpen(open);
                }}>
                  <DialogTrigger render={<Button size="sm" className="bg-rose-600" disabled={funeralCase.status === 'closed'} />}>
                    <Plus className="w-4 h-4 mr-2" /> Dépense
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enregistrer une dépense</DialogTitle>
                    </DialogHeader>
                    <Form {...expenseForm}>
                      <form onSubmit={expenseForm.handleSubmit(onAddExpense)} className="space-y-4">
                        <FormField
                          control={expenseForm.control as any}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Catégorie</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="transport">Transport</SelectItem>
                                  <SelectItem value="organization">Organisation</SelectItem>
                                  <SelectItem value="family_aid">Aide Famille</SelectItem>
                                  <SelectItem value="other">Autres</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expenseForm.control as any}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={expenseForm.control as any}
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
                            control={expenseForm.control as any}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="w-full bg-rose-600">Enregistrer</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="border-none shadow-sm">
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
                      {caseExpenses.map(e => (
                        <TableRow key={e.id}>
                          <TableCell className="capitalize text-xs font-medium">{e.category.replace('_', ' ')}</TableCell>
                          <TableCell className="text-sm">{e.description}</TableCell>
                          <TableCell className="text-xs text-slate-500">{format(new Date(e.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="text-right font-bold text-rose-600">{e.amount.toLocaleString()} FCFA</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Organisation & Tâches</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {caseTasks.map(t => {
                      const assignee = members.find(m => m.id === t.assignedTo);
                      return (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              t.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                            )}>
                              {t.type === 'visit' ? <Users className="w-4 h-4" /> :
                               t.type === 'logistics' ? <ClipboardList className="w-4 h-4" /> :
                               t.type === 'ceremony' ? <CalendarIcon className="w-4 h-4" /> :
                               <Sparkles className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className={cn("text-sm font-medium", t.status === 'completed' && "line-through text-slate-400")}>
                                {t.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-slate-400">Pour le {format(new Date(t.dueDate), 'dd/MM')}</p>
                                <span className="text-[10px] text-slate-300">•</span>
                                <p className="text-[10px] text-slate-400 italic">Par {assignee ? `${assignee.firstName} ${assignee.lastName}` : 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          
                          {t.status === 'pending' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 px-3 text-[10px] border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                              onClick={() => setConfirmTaskDoneId(t.id)}
                              disabled={funeralCase.status === 'closed'}
                            >
                              Fait
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none text-[10px] h-6">
                              Terminé
                            </Badge>
                          )}
                        </div>
                      );
                    })}

                    <Dialog open={isAddTaskDialogOpen} onOpenChange={(open) => {
                      if (funeralCase.status === 'closed' && open) {
                        toast.error("Ce cas est clôturé");
                        return;
                      }
                      setIsAddTaskDialogOpen(open);
                    }}>
                      <DialogTrigger render={
                        <Button variant="outline" className="w-full border-dashed text-xs h-10 mt-2 bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-600" disabled={funeralCase.status === 'closed'}>
                          <Plus className="w-4 h-4 mr-2" />
                          Nouvelle tâche
                        </Button>
                      } />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Créer une nouvelle tâche d'organisation</DialogTitle>
                          <DialogDescription>Définissez les actions nécessaires pour l'organisation de ce cas de funérailles.</DialogDescription>
                        </DialogHeader>
                        <Form {...taskForm}>
                          <form onSubmit={taskForm.handleSubmit(onAddTask)} className="space-y-4 pt-4">
                            <FormField
                              control={taskForm.control as any}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Intitulé de la tâche</FormLabel>
                                  <FormControl><Input placeholder="Ex: Récupérer les chaises à la mairie..." {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={taskForm.control as any}
                                name="type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                      <SelectContent>
                                        <SelectItem value="visit">Visite</SelectItem>
                                        <SelectItem value="logistics">Logistique</SelectItem>
                                        <SelectItem value="ceremony">Cérémonie</SelectItem>
                                        <SelectItem value="other">Autre</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={taskForm.control as any}
                                name="dueDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Date d'échéance</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={taskForm.control as any}
                              name="assignedTo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Responsable (Membre)</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Choisir un membre" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                      {members.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                          {m.firstName} {m.lastName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit" className="w-full bg-slate-900 text-white">Créer la tâche</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Confirmation mark as done Dialog */}
                <Dialog open={!!confirmTaskDoneId} onOpenChange={(open) => !open && setConfirmTaskDoneId(null)}>
                  <DialogContent className="max-w-xs">
                    <DialogHeader>
                      <DialogTitle>Confirmation</DialogTitle>
                      <DialogDescription>Voulez-vous vraiment marquer cette tâche comme terminée ?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                      <Button variant="outline" className="flex-1" onClick={() => setConfirmTaskDoneId(null)}>
                        Annuler
                      </Button>
                      <Button 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" 
                        onClick={() => {
                          if (confirmTaskDoneId) {
                            onToggleTaskStatus(confirmTaskDoneId);
                            setConfirmTaskDoneId(null);
                          }
                        }}
                      >
                        Confirmer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Card className="border-none shadow-md bg-slate-900 text-white">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                      <p className="text-xs font-bold">📢 Annonce Officielle</p>
                      <p className="text-[10px] text-slate-300 mt-1">Envoyer l'annonce du décès à tous les membres via WhatsApp/Email.</p>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="link" 
                          className="text-blue-400 text-[10px] p-0 h-auto"
                          onClick={() => generateWithAi('announcement')}
                          disabled={funeralCase.status === 'closed'}
                        >
                          Générer par IA
                        </Button>
                        <span className="text-[10px] text-white/20">|</span>
                        <Button 
                          variant="link" 
                          className="text-slate-400 text-[10px] p-0 h-auto"
                          onClick={() => setAiDialog({ isOpen: true, type: 'announcement', content: '', isGenerating: false, isConfirmed: false, suggestions: [], isManual: true })}
                          disabled={funeralCase.status === 'closed'}
                        >
                          Saisie manuelle
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                      <p className="text-xs font-bold">🤝 Appel à Solidarité</p>
                      <p className="text-[10px] text-slate-300 mt-1">Rappel des contributions solidaires pour soutenir la famille Koffi.</p>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="link" 
                          className="text-blue-400 text-[10px] p-0 h-auto"
                          onClick={() => generateWithAi('reminder')}
                          disabled={funeralCase.status === 'closed'}
                        >
                          Générer par IA
                        </Button>
                        <span className="text-[10px] text-white/20">|</span>
                        <Button 
                          variant="link" 
                          className="text-slate-400 text-[10px] p-0 h-auto"
                          onClick={() => setAiDialog({ isOpen: true, type: 'reminder', content: '', isGenerating: false, isConfirmed: false, suggestions: [], isManual: true })}
                          disabled={funeralCase.status === 'closed'}
                        >
                          Saisie manuelle
                        </Button>
                      </div>
                    </div>

                    {/* AI Notification Dialog */}
                    <Dialog open={aiDialog.isOpen} onOpenChange={(open) => setAiDialog(prev => ({ ...prev, isOpen: open }))}>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-500" />
                            {aiDialog.isManual ? "Rédaction manuelle" : (aiDialog.type === 'announcement' ? "Suggestions par IA" : "Rappel par IA")}
                          </DialogTitle>
                          <DialogDescription>
                            {aiDialog.isManual 
                              ? "Rédigez votre propre message ci-dessous." 
                              : "Choisissez l'une des suggestions générées ou passez en saisie manuelle."}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          {aiDialog.isGenerating ? (
                            <div className="py-8 flex flex-col items-center justify-center space-y-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                              <p className="text-sm text-slate-500">L'IA prépare 3 suggestions...</p>
                            </div>
                          ) : aiDialog.isManual ? (
                            <>
                              <textarea 
                                className="w-full h-48 p-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50"
                                value={aiDialog.content}
                                autoFocus
                                onChange={(e) => setAiDialog(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Saisissez votre texte ici..."
                              />
                              <Button 
                                className="w-full bg-slate-900 text-white"
                                disabled={!aiDialog.content.trim()}
                                onClick={() => setAiDialog(prev => ({ ...prev, isConfirmed: true, isManual: false }))}
                              >
                                Utiliser ce texte
                              </Button>
                            </>
                          ) : aiDialog.content ? (
                            <div className="space-y-4">
                               <textarea 
                                className="w-full h-48 p-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50"
                                value={aiDialog.content}
                                readOnly={!aiDialog.isConfirmed}
                                onChange={(e) => aiDialog.isConfirmed && setAiDialog(prev => ({ ...prev, content: e.target.value }))}
                              />
                              {!aiDialog.isConfirmed ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => setAiDialog(prev => ({ ...prev, content: '', suggestions: aiDialog.suggestions }))}
                                    >
                                      Changer de suggestion
                                    </Button>
                                    <Button 
                                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                      onClick={() => setAiDialog(prev => ({ ...prev, isConfirmed: true }))}
                                    >
                                      Confirmer et envoyer
                                    </Button>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    className="text-xs text-blue-500 hover:text-blue-700 h-8"
                                    onClick={() => generateWithAi(aiDialog.type)}
                                  >
                                    <Sparkles className="w-3 h-3 mr-2" />
                                    Nouveau texte (Régénérer)
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 border-t pt-4">
                                  <p className="text-xs text-center font-bold text-slate-600">Choisissez un moyen d'envoi</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <Button 
                                      variant="outline" 
                                      className="border-emerald-200 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 h-11"
                                      onClick={() => shareViaWhatsApp(aiDialog.content)}
                                    >
                                      <Smartphone className="w-4 h-4" />
                                      WhatsApp
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      className="border-blue-200 hover:bg-blue-50 text-blue-700 flex items-center gap-2 h-11"
                                      onClick={() => shareViaGmail(aiDialog.content)}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                      Gmail
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {aiDialog.suggestions.map((s, i) => (
                                <button
                                  key={i}
                                  onClick={() => setAiDialog(prev => ({ ...prev, content: s }))}
                                  className="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-sm leading-relaxed"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Suggestion {i+1}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                  </div>
                                  <div className="line-clamp-3 text-slate-600 italic">"{s}"</div>
                                </button>
                              ))}
                              <div className="grid grid-cols-2 gap-3 mt-2">
                                <Button 
                                  variant="outline" 
                                  className="text-xs h-9 border-blue-200 text-blue-600 hover:bg-blue-50"
                                  onClick={() => generateWithAi(aiDialog.type)}
                                >
                                  <Sparkles className="w-3 h-3 mr-2" />
                                  Nouveau texte
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="text-xs h-9 border-slate-200 text-slate-600 hover:bg-slate-50"
                                  onClick={() => setAiDialog(prev => ({ ...prev, isManual: true }))}
                                >
                                  Saisie manuelle
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="balance" className="space-y-6 mt-6">
              <Card className="border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-950 text-white overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                      <h2 className="text-2xl font-serif font-bold">Bilan Financier du Cas</h2>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Total Collecté</span>
                          <span className="font-bold text-emerald-400">{totalCollected.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Total Dépensé</span>
                          <span className="font-bold text-rose-400">{totalSpent.toLocaleString()} FCFA</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Solde Restant</span>
                          <span className={balance >= 0 ? "text-blue-400" : "text-rose-400"}>
                            {balance.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button 
                          className="bg-white text-slate-900 hover:bg-slate-100 text-xs"
                          onClick={generateFinalReport}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Rapport Final PDF
                        </Button>
                        {funeralCase.status === 'active' ? (
                          <Dialog open={isCloseCaseDialogOpen} onOpenChange={setIsCloseCaseDialogOpen}>
                            <DialogTrigger render={
                              <Button 
                                className="bg-rose-600 hover:bg-rose-700 text-white text-xs border-none"
                              >
                                Clôturer le Cas
                              </Button>
                            } />
                            <DialogContent className="max-w-xs">
                              <DialogHeader>
                                <DialogTitle>Clôturer ce cas ?</DialogTitle>
                                <DialogDescription>
                                  Une fois clôturé, plus aucune cotisation ou dépense ne pourra être enregistrée pour ce cas.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="flex-col gap-2 sm:flex-row">
                                <Button variant="outline" className="flex-1" onClick={() => setIsCloseCaseDialogOpen(false)}>
                                  Annuler
                                </Button>
                                <Button 
                                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                                  onClick={() => {
                                    updateFuneralCase(funeralCase.id, { status: 'closed' });
                                    setIsCloseCaseDialogOpen(false);
                                    toast.success("Cas clôturé avec succès");
                                  }}
                                >
                                  Confirmer
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Badge className="bg-slate-700 text-white border-none h-9 px-4">Cas Clôturé</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Participation</p>
                        <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
                          <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent" />
                          <span className="text-xl font-bold">{caseContributions.length}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Donateurs</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Timeline du Cas</CardTitle>
                  {funeralCase.status === 'active' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[10px] font-bold text-blue-600 hover:bg-blue-50"
                      onClick={() => setIsAddMilestoneOpen(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Ajouter une étape
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-rose-100 border-4 border-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      </div>
                      <p className="text-sm font-bold">Décès déclaré</p>
                      <p className="text-xs text-slate-500">{format(new Date(funeralCase.dateOfDeath), 'dd MMMM yyyy')}</p>
                    </div>
                    
                    {/* Manual Milestones */}
                    {funeralCase.milestones?.map(m => (
                      <div key={m.id} className="relative pl-8 animate-in slide-in-from-left-2 duration-300">
                        <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        </div>
                        <p className="text-sm font-bold">{m.label}</p>
                        <p className="text-xs text-slate-500">{format(new Date(m.date), 'dd MMMM yyyy')}</p>
                      </div>
                    ))}

                    {caseContributions.length > 0 && (
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-emerald-100 border-4 border-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-sm font-bold">Premières contributions</p>
                        <p className="text-xs text-slate-500">Solidarité active des membres</p>
                      </div>
                    )}
                    {caseTasks.filter(t => t.status === 'completed').map(t => (
                      <div key={t.id} className="relative pl-8">
                        <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        </div>
                        <p className="text-sm font-bold">{t.title}</p>
                        <p className="text-xs text-slate-500">Tâche effectuée</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Solidarité Intelligente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAiSuggestionConfirmed ? (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-900">Suggestion IA Active</span>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Basé sur l'historique, le montant moyen suggéré par membre pour ce cas est de <strong>3,500 FCFA</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <p className="text-[10px] text-slate-500 mb-2 leading-tight">
                    Activez l'analyse intelligente pour obtenir une suggestion de montant basée sur les cas précédents.
                  </p>
                  <Dialog open={isAiConfirmDialogOpen} onOpenChange={setIsAiConfirmDialogOpen}>
                    <DialogTrigger render={
                      <Button variant="outline" className="w-full h-8 text-[10px] border-blue-100 text-blue-600 hover:bg-blue-50">
                        <Sparkles className="w-3 h-3 mr-2" />
                        Activer la suggestion IA
                      </Button>
                    } />
                    <DialogContent className="max-w-xs">
                      <DialogHeader>
                        <DialogTitle>Activer l'IA ?</DialogTitle>
                        <DialogDescription>
                          L'IA analysera les collectes passées pour suggérer un montant de solidarité juste pour ce cas.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button variant="outline" className="flex-1" onClick={() => setIsAiConfirmDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button 
                          className="flex-1 bg-blue-600 text-white" 
                          onClick={() => {
                            setIsAiSuggestionConfirmed(true);
                            setIsAiConfirmDialogOpen(false);
                            toast.success("Suggestions IA activées");
                          }}
                        >
                          Confirmer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                  <span>Participation par Genre</span>
                  <span className="text-[10px] lowercase font-normal text-slate-400 italic">Temps réel</span>
                </p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-600">Hommes</span>
                      <span className="font-bold text-blue-600">{menParticipationPercent}%</span>
                    </div>
                    <Progress value={menParticipationPercent} className="h-1 bg-slate-100" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-600">Femmes</span>
                      <span className="font-bold text-rose-600">{womenParticipationPercent}%</span>
                    </div>
                    <Progress value={womenParticipationPercent} className="h-1 bg-slate-100" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <div className="relative group">
              <div 
                className="aspect-video bg-slate-100 relative cursor-pointer overflow-hidden"
                onClick={() => setIsPhotoDialogOpen(true)}
              >
                {uploadedPhotos.length > 0 ? (
                  <img 
                    src={uploadedPhotos[0]} 
                    alt="Affiche/Photo principale" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                    <Camera className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-[10px] font-medium uppercase tracking-widest">Ajouter une photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                    <span className="text-white text-xs font-bold flex items-center gap-2">
                       <Plus className="w-4 h-4" /> Gérer les photos ({uploadedPhotos.length}/5)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-500 italic">"En mémoire de notre bien-aimé(e)"</p>
                {uploadedPhotos.length > 0 && (
                  <Button 
                    variant={funeralCase.isPublic ? "secondary" : "default"} 
                    size="sm"
                    className={cn(
                      "h-8 text-[10px] font-bold uppercase tracking-wider",
                      funeralCase.isPublic ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none" : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                    onClick={togglePublic}
                  >
                    {funeralCase.isPublic ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Publié</>
                    ) : (
                      "Rendre Publique"
                    )}
                  </Button>
                )}
              </div>
              
              {uploadedPhotos.length > 1 && (
                <div className="grid grid-cols-4 gap-2 border-t pt-4">
                  {uploadedPhotos.slice(1).map((p, i) => (
                    <div key={i} className="aspect-square rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={p} alt={`Photo ${i+2}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  {uploadedPhotos.length < 5 && (
                    <button 
                      className="aspect-square rounded-md border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50"
                      onClick={() => setIsPhotoDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Management Dialog */}
          <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  Galerie Photos du Cas
                </DialogTitle>
                <DialogDescription>
                  Ajoutez jusqu'à 5 photos. La première photo est idéalement l'affiche officielle ou le faire-part.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-5 gap-3 py-4">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 relative group overflow-hidden">
                      {uploadedPhotos[index] ? (
                        <>
                          <img src={uploadedPhotos[index]} className="w-full h-full object-cover" alt={`Photo ${index + 1}`} />
                          <button 
                            className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const newPhotos = [...uploadedPhotos];
                              newPhotos.splice(index, 1);
                              setUploadedPhotos(newPhotos);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <label className="cursor-pointer flex flex-col items-center">
                            <Plus className="w-6 h-6 text-slate-300 mb-1" />
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Ajouter</span>
                            <input type="file" className="hidden" accept="image/*" onChange={onPhotoUpload} />
                          </label>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-center">
                        <span className="text-[8px] text-white font-bold">
                          {index === 0 ? "AFFICHE" : index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <DialogFooter>
                <Button variant="outline" className="flex-1" onClick={() => setIsPhotoDialogOpen(false)}>Annuler</Button>
                <Button className="flex-1 bg-slate-900 text-white" onClick={savePhotos}>Enregistrer la galerie</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Funeral Program Dialog */}
          <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-church-gold" />
                  Programme des Obsèques
                </DialogTitle>
                <DialogDescription>
                  Définissez le calendrier et les lieux pour les différentes étapes des funérailles.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...programForm}>
                <form onSubmit={programForm.handleSubmit(onUpdateProgram)} className="space-y-6 py-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-church-gold" />
                       La Veillée
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={programForm.control}
                        name="wakeDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de la veillée</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={programForm.control}
                        name="wakeLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lieu de la veillée</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Domicile familial, Paroisse..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={programForm.control}
                      name="wakeDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description / Programme de la veillée</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Détails du déroulement de la veillée..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                       Cérémonie & Levée
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={programForm.control}
                        name="ceremonyDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de la cérémonie</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={programForm.control}
                        name="ceremonyTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heure de la cérémonie</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={programForm.control}
                      name="ceremonyLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lieu de la cérémonie</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: IVOSEP, Église..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       Inhumation & Divers
                    </h3>
                    <FormField
                      control={programForm.control}
                      name="burialLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lieu de l'inhumation</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Cimetière de Williamsville..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={programForm.control}
                      name="additionalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes additionnelles</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Autres informations importantes..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsProgramDialogOpen(false)}>Annuler</Button>
                    <Button type="submit" className="bg-slate-900">Enregistrer le Programme</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Add Milestone Dialog */}
          <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Nouvelle étape d'avancement
                </DialogTitle>
                <DialogDescription>
                  Ajoutez un événement marquant ou une étape franchie dans le processus.
                </DialogDescription>
              </DialogHeader>
              <Form {...milestoneForm}>
                <form onSubmit={milestoneForm.handleSubmit(onAddMilestone)} className="space-y-4 py-2">
                  <FormField
                    control={milestoneForm.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'étape</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Levée du corps effectuée, Faire-part distribués..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={milestoneForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de l'étape</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button variant="outline" type="button" className="flex-1" onClick={() => setIsAddMilestoneOpen(false)}>Annuler</Button>
                    <Button type="submit" className="flex-1 bg-blue-600 text-white hover:bg-blue-700">Ajouter</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export function FuneralManagement() {
  const { funeralCases, funeralContributions, contributionTypes, contributionPayments, churches, members, addFuneralCase, addContributionPayment, cashRegisters } = useStore();
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null);
  const [selectedContributionTypeId, setSelectedContributionTypeId] = React.useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = React.useState(false);
  const [isAddContributionTypeOpen, setIsAddContributionTypeOpen] = React.useState(false);
  const [activeMainTab, setActiveMainTab] = React.useState('cases');
  // Transfer funds
  const [isTransferOpen, setIsTransferOpen] = React.useState(false);
  const [transferRegisterId, setTransferRegisterId] = React.useState('');
  // Configuration
  const [fundConfig, setFundConfig] = React.useState({
    amount: 2000, period: 'monthly', gracePeriod: 30, autoRelance: true, beneficiaires: ''
  });
  // Pay member dialog
  const [payMemberOpen, setPayMemberOpen] = React.useState(false);
  const [payMemberData, setPayMemberData] = React.useState<{ member: Member | null; amount: number; typeId: string }>({ member: null, amount: 0, typeId: '' });
  const [payForm, setPayForm] = React.useState({ method: 'Cash', amount: '', date: new Date().toISOString().split('T')[0], note: '' });

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema) as any,
    defaultValues: {
      deceasedName: '',
      memberId: '',
      familyContactId: '',
      dateOfDeath: new Date().toISOString().split('T')[0],
      location: '',
      description: '',
      churchId: churches[0]?.id || '1',
    },
  });

  const onSubmit = (values: CaseFormValues) => {
    addFuneralCase({
      ...values,
      status: 'active',
    });
    setIsAddDialogOpen(false);
    form.reset();
    toast.success("Nouveau cas créé avec respect");
  };

  const selectedCase = funeralCases.find(c => c.id === selectedCaseId);

  if (selectedCase) {
    return <CaseDetail funeralCase={selectedCase} onClose={() => setSelectedCaseId(null)} />;
  }

  // If a contribution type is selected from the Cotisations tab
  const selectedType = contributionTypes.find(t => t.id === selectedContributionTypeId);
  if (selectedType) {
    const payments = contributionPayments.filter(p => p.typeId === selectedType.id);
    const collected = payments.reduce((acc, p) => acc + p.amount, 0);
    const progress = Math.min(100, (collected / (selectedType.amount * 50)) * 100); // Mock target based on member count

    return (
      <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-10 w-10 border-slate-200 hover:bg-slate-50 transition-colors"
              onClick={() => setSelectedContributionTypeId(null)}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900">{selectedType.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3">
                  {selectedType.frequency === 'monthly' ? 'Mensuel' : 'Ponctuel'}
                </Badge>
                <span className="text-sm text-slate-500">Gestion détaillée de la cotisation</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50">
              <Download className="w-4 h-4 mr-2" /> Rapports
            </Button>

            <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-md" onClick={() => setIsTransferOpen(true)}>
              <DollarSign className="w-4 h-4 mr-2" /> Transférer les fonds
            </Button>

            <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
              <DialogTrigger render={<Button className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md" />}>
                <Plus className="w-4 h-4 mr-2" /> Enregistrer Versement
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau versement: {selectedType.name}</DialogTitle>
                  <CardDescription>Enregistrer la contribution d'un membre pour ce fonds.</CardDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Membre</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un membre" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Montant (FCFA)</label>
                    <Input type="number" defaultValue={selectedType.amount} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mode de paiement</label>
                    <Select defaultValue="Cash">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Espèces</SelectItem>
                        <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                        <SelectItem value="Bank">Virement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>Annuler</Button>
                  <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => {
                    setIsAddPaymentOpen(false);
                    toast.success("Versement enregistré avec succès");
                  }}>Confirmer le versement</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Progression Globale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-4xl font-serif font-bold text-slate-900 mb-1">{collected.toLocaleString()} FCFA</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase">Total Collecté</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Objectif (Estimé)</span>
                    <span className="font-bold">{(selectedType.amount * 50).toLocaleString()} FCFA</span>
                  </div>
                  <Progress value={progress} className="h-1.5 bg-slate-100" />
                  <p className="text-[10px] text-right text-slate-400">{Math.round(progress)}% complété</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-emerald-50/50 border border-emerald-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-700">Statistiques Participation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-slate-600">Membres à jour</span>
                  </div>
                  <span className="font-bold text-emerald-700">{payments.length}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-xs font-medium text-slate-600">En attente</span>
                  </div>
                  <span className="font-bold text-rose-700">{Math.max(0, 50 - payments.length)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="payments" className="space-y-6">
              <TabsList className="bg-slate-100/50 p-1 border border-slate-200 w-full sm:w-auto h-12">
                <TabsTrigger value="payments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 h-full">
                  <History className="w-4 h-4 mr-2" />
                  Versements
                </TabsTrigger>
                <TabsTrigger value="unpaid" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 h-full text-rose-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Non-payés
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 h-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Configuration
                </TabsTrigger>
              </TabsList>

              <TabsContent value="payments" className="mt-0">
                <Card className="border-none shadow-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold">
                      <TableRow>
                        <TableHead>Membre</TableHead>
                        <TableHead>Montant Versé</TableHead>
                        <TableHead>Dernier Versement</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map(member => {
                        const mPayments = payments.filter(p => p.memberId === member.id);
                        const paidAmount = mPayments.reduce((acc, p) => acc + p.amount, 0);
                        const isAtLeastHalf = paidAmount >= selectedType.amount / 2;
                        const isFullyPaid = paidAmount >= selectedType.amount;
                        
                        // Only show members who have paid something in this tab
                        if (paidAmount === 0) return null;

                        return (
                          <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-bold text-slate-900">{member.firstName} {member.lastName}</TableCell>
                            <TableCell className="font-medium text-emerald-600">{paidAmount.toLocaleString()} FCFA</TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {mPayments.length > 0 ? format(new Date(mPayments[mPayments.length - 1].date), 'dd/MM/yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] uppercase font-bold px-2 py-0",
                                  isFullyPaid ? "text-emerald-600 bg-emerald-50 border-emerald-100" : 
                                  isAtLeastHalf ? "text-church-gold bg-church-gold/10 border-church-gold/20" : 
                                  "text-rose-600 bg-rose-50 border-rose-100"
                                )}
                              >
                                {isFullyPaid ? 'Terminé' : 'Partiel'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-slate-100">
                                Détails <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {payments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic">
                            Aucun versement enregistré pour le moment.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="unpaid" className="mt-0">
                <Card className="border-none shadow-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold">
                      <TableRow>
                        <TableHead>Membre</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map(member => {
                        const paidAmount = payments.filter(p => p.memberId === member.id).reduce((acc, p) => acc + p.amount, 0);
                        if (paidAmount > 0) return null;

                        return (
                          <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-bold text-slate-900">{member.firstName} {member.lastName}</TableCell>
                            <TableCell className="text-xs text-slate-500">{member.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-100 text-[10px] uppercase font-bold">
                                En attente
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-[10px] text-church-gold border-church-gold/20 hover:bg-church-gold/5 uppercase font-bold">
                                  Relancer
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white uppercase font-bold"
                                  onClick={() => {
                                    setPayMemberData({ member: member as Member, amount: selectedType.amount, typeId: selectedType.id });
                                    setPayForm({ method: 'Cash', amount: String(selectedType.amount), date: new Date().toISOString().split('T')[0], note: '' });
                                    setPayMemberOpen(true);
                                  }}
                                >
                                  Payer
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              {/* Configuration tab */}
              <TabsContent value="settings" className="mt-0">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">Configuration du Fonds de Cotisation</CardTitle>
                    <CardDescription>Paramétrez les règles de collecte pour ce fonds.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Montant par membre (XOF)</label>
                        <Input
                          type="number"
                          value={fundConfig.amount}
                          onChange={e => setFundConfig(c => ({...c, amount: parseInt(e.target.value) || 0}))}
                          className="border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Période de collecte</label>
                        <Select value={fundConfig.period} onValueChange={v => setFundConfig(c => ({...c, period: v}))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Mensuelle</SelectItem>
                            <SelectItem value="quarterly">Trimestrielle</SelectItem>
                            <SelectItem value="biannual">Semestrielle</SelectItem>
                            <SelectItem value="annual">Annuelle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Délai de grâce (jours)</label>
                        <Input
                          type="number"
                          value={fundConfig.gracePeriod}
                          onChange={e => setFundConfig(c => ({...c, gracePeriod: parseInt(e.target.value) || 0}))}
                          className="border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Relance automatique</label>
                        <div className="flex items-center gap-3 h-10">
                          <button
                            type="button"
                            onClick={() => setFundConfig(c => ({...c, autoRelance: !c.autoRelance}))}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              fundConfig.autoRelance ? "bg-emerald-600" : "bg-slate-200"
                            )}
                          >
                            <span className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                              fundConfig.autoRelance ? "translate-x-6" : "translate-x-1"
                            )} />
                          </button>
                          <span className="text-sm text-slate-600">{fundConfig.autoRelance ? 'Activé' : 'Désactivé'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Bénéficiaires par défaut</label>
                      <textarea
                        className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-church-gold/20"
                        placeholder="Liste des bénéficiaires (un par ligne)..."
                        value={fundConfig.beneficiaires}
                        onChange={e => setFundConfig(c => ({...c, beneficiaires: e.target.value}))}
                      />
                    </div>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => toast.success("Configuration enregistrée avec succès")}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Enregistrer la configuration
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Transfer funds dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Transférer les fonds collectés</DialogTitle>
            <DialogDescription>
              Transférez <strong>{selectedType && payments && payments.reduce((a, p) => a + p.amount, 0).toLocaleString()} FCFA</strong> vers une caisse de l'église.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Caisse destinataire</label>
              <Select value={transferRegisterId} onValueChange={setTransferRegisterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une caisse..." />
                </SelectTrigger>
                <SelectContent>
                  {cashRegisters.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name} — {r.balance.toLocaleString()} FCFA</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferOpen(false)}>Annuler</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!transferRegisterId}
              onClick={() => {
                if (transferRegisterId) {
                  setIsTransferOpen(false);
                  setTransferRegisterId('');
                  toast.success("Transfert enregistré avec succès");
                }
              }}
            >
              Confirmer le transfert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay member dialog */}
      <Dialog open={payMemberOpen} onOpenChange={setPayMemberOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription>
              Membre : <strong>{payMemberData.member?.firstName} {payMemberData.member?.lastName}</strong> — Montant dû : <strong>{payMemberData.amount.toLocaleString()} FCFA</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Mode de paiement</label>
              <Select value={payForm.method} onValueChange={v => setPayForm(f => ({...f, method: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Espèces</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Bank">Virement bancaire</SelectItem>
                  <SelectItem value="Cheque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Montant (FCFA)</label>
              <Input type="number" value={payForm.amount} onChange={e => setPayForm(f => ({...f, amount: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Date</label>
              <Input type="date" value={payForm.date} onChange={e => setPayForm(f => ({...f, date: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Note / Référence</label>
              <Input placeholder="Référence optionnelle..." value={payForm.note} onChange={e => setPayForm(f => ({...f, note: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayMemberOpen(false)}>Annuler</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                if (!payMemberData.member) return;
                if (addContributionPayment) {
                  addContributionPayment({
                    typeId: payMemberData.typeId,
                    memberId: payMemberData.member.id,
                    amount: parseFloat(payForm.amount) || payMemberData.amount,
                    date: payForm.date,
                    paymentMethod: (['Cash', 'Mobile Money', 'Bank'].includes(payForm.method) ? payForm.method : 'Cash') as any,
                    status: 'paid',
                    notes: payForm.note,
                  } as any);
                }
                setPayMemberOpen(false);
                toast.success(`Paiement enregistré pour ${payMemberData.member.firstName} ${payMemberData.member.lastName}`);
              }}
            >
              Confirmer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  return (
    <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
      <div className="space-y-8 text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Fonds de Solidarité</h1>
            <p className="text-slate-500">Accompagnement et gestion des contributions d'entraide.</p>
          </div>
          
          <TabsList className="bg-slate-100/80 p-1 border border-slate-200">
            <TabsTrigger 
              value="cases" 
              className="text-sm px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium transition-all"
            >
              <HeartHandshake className="w-4 h-4 mr-2" />
              Cas de Décès
            </TabsTrigger>
            <TabsTrigger 
              value="cotisations" 
              className="text-sm px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium transition-all"
            >
              <Coins className="w-4 h-4 mr-2" />
              Cotisations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cases" className="mt-0 space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger render={<Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg" />}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Cas
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Déclarer un nouveau cas de décès</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control as any}
                    name="deceasedName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du Défunt</FormLabel>
                        <FormControl><Input placeholder="Ex: M. Jean Kouassi" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="dateOfDeath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date du Décès</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lieu</FormLabel>
                          <FormControl><Input placeholder="Ex: Abidjan" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="familyContactId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Famille (Membre)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un membre" />
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
                        <FormLabel>Description / Contexte</FormLabel>
                        <FormControl>
                          <Input placeholder="Détails sur la famille, besoins spécifiques..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" className="w-full bg-slate-900">Créer le Cas</Button>
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
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Cas en cours</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{funeralCases.filter(c => c.status === 'active').length}</h3>
              <p className="text-xs text-slate-400 mt-1">Familles à soutenir</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Solidarité Totale</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {funeralContributions.reduce((acc, c) => acc + c.amount, 0).toLocaleString()} FCFA
              </h3>
              <p className="text-xs text-emerald-600 mt-1 font-medium">Collecté pour tous les cas</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Cas Clôturés</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{funeralCases.filter(c => c.status === 'closed').length}</h3>
              <p className="text-xs text-slate-400 mt-1">Accompagnement terminé</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-slate-900">Liste des Cas de Décès</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funeralCases.length === 0 ? (
              <div className="col-span-full h-32 flex items-center justify-center text-slate-400 italic border-2 border-dashed rounded-xl">
                Aucun cas enregistré pour le moment.
              </div>
            ) : (
              funeralCases.slice().reverse().map((fCase) => {
                const contributions = funeralContributions.filter(c => c.caseId === fCase.id);
                const total = contributions.reduce((acc, c) => acc + c.amount, 0);
                return (
                  <Card 
                    key={fCase.id} 
                    className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                    onClick={() => setSelectedCaseId(fCase.id)}
                  >
                    <div className="h-2 bg-slate-900" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{fCase.deceasedName}</CardTitle>
                        <div className="flex items-center gap-1">
                          {fCase.isPublic && (
                             <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] h-4 px-1 flex items-center gap-0.5">
                               <Globe className="w-2.5 h-2.5" /> Public
                             </Badge>
                          )}
                          <Badge variant="outline" className={cn(
                            "text-[10px] px-1.5 py-0",
                            fCase.status === 'active' ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-slate-500 border-slate-200 bg-slate-50"
                          )}>
                            {fCase.status === 'active' ? 'En cours' : 'Clôturé'}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-[10px]">
                        <CalendarIcon className="w-3 h-3" />
                        Décès: {format(new Date(fCase.dateOfDeath), 'dd MMM yyyy')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {fCase.location}
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Soutien collecté</span>
                          <span className="font-bold text-slate-900">{total.toLocaleString()} FCFA</span>
                        </div>
                        <Progress value={Math.min(100, (total / 500000) * 100)} className="h-1 bg-slate-200" />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                              {i}
                            </div>
                          ))}
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">
                            +{contributions.length}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs group-hover:text-slate-900">
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
      </TabsContent>

      <TabsContent value="cotisations" className="mt-0 space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center sm:items-start flex-col sm:flex-row gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto">
            <Card className="border-none shadow-sm bg-blue-50/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-blue-800">Total Collecté</p>
                  <p className="text-lg font-bold text-slate-900">
                    {contributionPayments
                      .filter(p => {
                        const type = contributionTypes.find(t => t.id === p.typeId);
                        return type && (type.name.toLowerCase().includes('décès') || type.name.toLowerCase().includes('solidarité'));
                      })
                      .reduce((acc, p) => acc + p.amount, 0).toLocaleString()} FCFA
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-emerald-50/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-800">Participations</p>
                  <p className="text-lg font-bold text-slate-900">
                    {contributionPayments
                      .filter(p => {
                        const type = contributionTypes.find(t => t.id === p.typeId);
                        return type && (type.name.toLowerCase().includes('décès') || type.name.toLowerCase().includes('solidarité'));
                      }).length} Versements
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={isAddContributionTypeOpen} onOpenChange={setIsAddContributionTypeOpen}>
            <DialogTrigger render={<Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg w-full sm:w-auto" />}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Cotisation
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau type de cotisation de solidarité</DialogTitle>
                <DialogDescription>Configurez une cotisation périodique ou ponctuelle pour le fonds d'entraide.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de la cotisation</label>
                  <Input placeholder="Ex: Fonds de Solidarité Sociale" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Montant (FCFA)</label>
                    <Input type="number" placeholder="5000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fréquence</label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="annual">Annuel</SelectItem>
                        <SelectItem value="one-time">Ponctuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddContributionTypeOpen(false)}>Annuler</Button>
                <Button className="bg-slate-900 text-white" onClick={() => {
                  setIsAddContributionTypeOpen(false);
                  toast.success("Nouveau type de cotisation créé");
                }}>Créer la cotisation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributionTypes.filter(t => t.name.toLowerCase().includes('décès') || t.name.toLowerCase().includes('funérailles') || t.name.toLowerCase().includes('solidarité')).length === 0 ? (
            <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-2xl bg-slate-50/50">
              <Coins className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium italic">Aucune cotisation de solidarité configurée.</p>
              <Button variant="link" className="text-slate-900 mt-2" onClick={() => setIsAddContributionTypeOpen(true)}>
                Cliquez ici pour en créer une
              </Button>
            </div>
          ) : (
            contributionTypes.filter(t => t.name.toLowerCase().includes('décès') || t.name.toLowerCase().includes('funérailles') || t.name.toLowerCase().includes('solidarité')).map(type => {
              const paymentsForType = contributionPayments.filter(p => p.typeId === type.id);
              const collectedForType = paymentsForType.reduce((acc, p) => acc + p.amount, 0);
              
              return (
                <Card key={type.id} className="border-none shadow-md hover:shadow-lg transition-all group border-t-4 border-slate-900">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-900 border-none">
                        {type.frequency === 'monthly' ? 'Mensuel' : 
                         type.frequency === 'weekly' ? 'Hebdo' : 
                         type.frequency === 'annual' ? 'Annuel' : 'Ponctuel'}
                      </Badge>
                      <div className="p-2 bg-slate-50 rounded-full group-hover:bg-slate-900 transition-colors text-slate-400 group-hover:text-white">
                        <Coins className="w-4 h-4" />
                      </div>
                    </div>
                    <CardDescription className="text-[10px] uppercase font-bold text-slate-500 mb-1">Cotisation Solidarité</CardDescription>
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">{type.name}</h3>
                    <p className="text-sm font-bold text-emerald-600 mb-6">{type.amount.toLocaleString()} FCFA / membre</p>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Total Collecté</p>
                          <p className="text-sm font-bold text-slate-900">{collectedForType.toLocaleString()} FCFA</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Participation</p>
                          <p className="text-sm font-bold text-slate-900">{paymentsForType.length} Membres</p>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md mt-4"
                        onClick={() => setSelectedContributionTypeId(type.id)}
                      >
                        Gérer cette cotisation <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </TabsContent>
    </div>
  </Tabs>
  );
}
