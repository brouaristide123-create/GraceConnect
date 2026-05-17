import React from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Users, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  MessageSquare, 
  MoreVertical, 
  UserPlus, 
  Clock, 
  MapPin, 
  Target, 
  BookOpen,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  MoreHorizontal,
  ShieldCheck,
  UserCheck,
  Trash2,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useStore, Department, Member, DepartmentMember, DepartmentActivity, DepartmentGoal } from '../lib/store';
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
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormDescription,
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
import { cn, generateId } from '../lib/utils';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'motion/react';

const deptSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  type: z.enum(['ministry', 'department', 'group', 'other']),
  leaderId: z.string().min(1, "Le responsable est requis"),
  assistantIds: z.array(z.string()),
  leadershipIds: z.array(z.string()),
  description: z.string().min(10, "La description doit être plus longue"),
  mission: z.string().min(10, "La mission est requise"),
  verse: z.string().optional(),
  motto: z.string().optional(),
  meetingDays: z.array(z.string()).min(1, "Au moins un jour de réunion"),
  meetingTime: z.string().optional(),
  location: z.string().min(2, "Le lieu est requis"),
  frequency: z.enum(['weekly', 'monthly', 'occasional', 'other']),
  color: z.string(),
  icon: z.string(),
  logoUrl: z.string().optional(),
  churchId: z.string().min(1, "L'église est requise"),
  trackingOptions: z.object({
    attendance: z.boolean(),
    activities: z.boolean(),
  }),
  communication: z.object({
    createGroup: z.boolean(),
  }),
  permissions: z.object({
    visibility: z.enum(['all', 'leaders']),
    modification: z.enum(['admin', 'leader']),
  }),
  notifications: z.object({
    meetings: z.boolean(),
    activities: z.boolean(),
    announcements: z.boolean(),
  }),
  links: z.object({
    events: z.boolean(),
    services: z.boolean(),
    projects: z.boolean(),
  }),
  initialMembers: z.array(z.string()),
});

const activitySchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  description: z.string().min(5, "La description est requise"),
  date: z.string().min(1, "La date est requise"),
  location: z.string().min(2, "Le lieu est requis"),
  type: z.enum(['meeting', 'rehearsal', 'prayer', 'training']),
  isPublished: z.boolean(),
  imageUrl: z.string().optional(),
});

const memberSchema = z.object({
  memberIds: z.array(z.string()).min(1, "Choisissez au moins un membre"),
  role: z.string().min(1, "Le rôle est requis"),
  customRole: z.string().optional(),
});

const goalSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  target: z.number().min(1, "L'objectif doit être supérieur à 0"),
  month: z.string().min(1, "Le mois est requis"),
});

export function DepartmentManagement() {
  const { 
    departments, 
    members, 
    churches, 
    departmentMembers, 
    departmentActivities, 
    departmentGoals,
    addDepartment, 
    addDeptMember,
    addDeptActivity,
    addDeptGoal,
    updateDeptGoal,
    deleteDepartment,
    addConversation
  } = useStore();

  const [selectedDeptId, setSelectedDeptId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'paused'>('all');
  const [isAddDeptOpen, setIsAddDeptOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [typeOther, setTypeOther] = React.useState('');
  const [leaderSearch, setLeaderSearch] = React.useState('');
  const [assistantSearch, setAssistantSearch] = React.useState('');
  const [leadershipSearch, setLeadershipSearch] = React.useState('');
  const [memberSearch3, setMemberSearch3] = React.useState('');
  const [frequencyOther, setFrequencyOther] = React.useState('');

  const selectedDept = departments.find(d => d.id === selectedDeptId);

  const deptForm = useForm<z.infer<typeof deptSchema>>({
    resolver: zodResolver(deptSchema),
    defaultValues: {
      name: '',
      type: 'department',
      leaderId: '',
      assistantIds: [],
      leadershipIds: [],
      description: '',
      mission: '',
      verse: '',
      motto: '',
      meetingDays: ['Dimanche'],
      meetingTime: '10:00',
      location: '',
      frequency: 'weekly',
      color: '#009E60',
      icon: 'Layers',
      churchId: churches[0]?.id || '',
      trackingOptions: {
        attendance: true,
        activities: true,
      },
      communication: {
        createGroup: false,
      },
      permissions: {
        visibility: 'all',
        modification: 'leader',
      },
      notifications: {
        meetings: true,
        activities: true,
        announcements: true,
      },
      links: {
        events: true,
        services: true,
        projects: false,
      },
      initialMembers: [],
    },
  });

  const onInvalid = (errors: any) => {
    console.error("Form Errors:", errors);
    toast.error("Veuillez vérifier les informations saisies. Certains champs sont invalides.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        deptForm.setValue(fieldName, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onAddDept = (values: z.infer<typeof deptSchema>) => {
    const { initialMembers, ...deptData } = values;
    const newDeptId = generateId();
    
    // Create the department
    addDepartment({ 
      ...deptData, 
      id: newDeptId,
      status: 'active' 
    } as any);

    // Collect all initial people who should be members
    const allMembersToAdd = [...new Set([
      values.leaderId,
      ...values.assistantIds,
      ...values.leadershipIds,
      ...initialMembers
    ])].filter(id => id !== ''); // Remove empty selections

    allMembersToAdd.forEach(memberId => {
      const role = memberId === values.leaderId ? 'leader' : 
                   values.assistantIds.includes(memberId) ? 'assistant' : 'member';
      addDeptMember({
        departmentId: newDeptId,
        memberId,
        role,
        status: 'active'
      });
    });

    // Create messaging group if requested
    if (values.communication.createGroup) {
      addConversation({
        name: `Groupe: ${values.name}`,
        participants: allMembersToAdd,
        type: 'department',
        departmentId: newDeptId,
        lastMessage: "Groupe créé automatiquement lors de la création du département",
        lastMessageTime: new Date().toISOString()
      } as any);
    }
    
    setIsAddDeptOpen(false);
    setCurrentStep(1);
    deptForm.reset();
    toast.success("Département créé avec succès avec ses responsables et membres !");
  };

  const steps = [
    { title: "Général", icon: <FileText className="w-4 h-4" /> },
    { title: "Leaders", icon: <ShieldCheck className="w-4 h-4 text-blue-500" /> },
    { title: "Membres", icon: <Users className="w-4 h-4 text-green-500" /> },
    { title: "Organisation", icon: <Clock className="w-4 h-4 text-orange-500" /> },
    { title: "Validation", icon: <CheckCircle2 className="w-4 h-4 text-church-green" /> }
  ];

  const filteredDepts = departments.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedDeptId && selectedDept) {
    return <DepartmentDetail 
      dept={selectedDept} 
      onBack={() => setSelectedDeptId(null)} 
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Départements & Ministères</h1>
          <p className="text-slate-500">Gérez les différents piliers de votre église.</p>
        </div>
        <Dialog open={isAddDeptOpen} onOpenChange={(open) => {
          setIsAddDeptOpen(open);
          if (!open) setCurrentStep(1);
        }}>
          <DialogTrigger render={<Button className="bg-church-gold hover:bg-church-gold/90 text-white" />}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Département
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">CRÉER UN DÉPARTEMENT / MINISTÈRE</DialogTitle>
              <DialogDescription>Suivez les étapes pour structurer votre nouveau ministère.</DialogDescription>
            </DialogHeader>

            {/* Stepper UI */}
            <div className="py-4">
              <div className="flex items-center justify-between relative mb-8">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2"></div>
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-church-gold transition-all duration-300 -translate-y-1/2"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center">
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold",
                        currentStep > idx + 1 ? "bg-church-gold text-white" : 
                        currentStep === idx + 1 ? "bg-white border-2 border-church-gold text-church-gold shadow-md" : 
                        "bg-slate-50 border-2 border-slate-100 text-slate-400"
                      )}
                    >
                      {currentStep > idx + 1 ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className={cn(
                      "text-[10px] uppercase font-bold mt-2 tracking-wider",
                      currentStep === idx + 1 ? "text-church-gold" : "text-slate-400"
                    )}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              <Form {...deptForm}>
                <form onSubmit={deptForm.handleSubmit(onAddDept)} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={deptForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold uppercase text-slate-500">Nom du département *</FormLabel>
                                <FormControl>
                                  <Input placeholder="ex: Chorale, Jeunesse..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={deptForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold uppercase text-slate-500">Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ministry">Ministère</SelectItem>
                                    <SelectItem value="department">Département</SelectItem>
                                    <SelectItem value="group">Groupe</SelectItem>
                                    <SelectItem value="other">Autre</SelectItem>
                                  </SelectContent>
                                </Select>
                                {field.value === 'other' && (
                                  <Input
                                    className="mt-2"
                                    placeholder="Précisez le type..."
                                    value={typeOther}
                                    onChange={(e) => setTypeOther(e.target.value)}
                                  />
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={deptForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-slate-500">Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Donnez un aperçu général..." className="min-h-[80px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={deptForm.control}
                          name="mission"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-slate-500">Mission & Objectifs</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Quelle est la raison d'être de ce ministère ?" className="min-h-[80px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={deptForm.control}
                            name="verse"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold uppercase text-slate-500">Verset Clé</FormLabel>
                                <FormControl>
                                  <Input placeholder="ex: Jean 3:16" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={deptForm.control}
                            name="motto"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold uppercase text-slate-500">Devise</FormLabel>
                                <FormControl>
                                  <Input placeholder="Devise du département" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4 items-end">
                           <div className="flex flex-col gap-2">
                             <Label className="text-xs font-bold uppercase text-slate-500">Logo / Image</Label>
                             <div 
                               onClick={() => document.getElementById('dept-logo-upload')?.click()}
                               className="w-full aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden"
                             >
                               {deptForm.watch('logoUrl') ? (
                                 <img src={deptForm.watch('logoUrl')} alt="Preview" className="w-full h-full object-cover" />
                               ) : (
                                 <>
                                   <Plus className="w-6 h-6 text-slate-300" />
                                   <span className="text-[10px] text-slate-400 font-bold uppercase">Logo</span>
                                 </>
                               )}
                             </div>
                             <input id="dept-logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                           </div>
                           <div className="col-span-2 space-y-4">
                              <FormField
                                control={deptForm.control}
                                name="color"
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Couleur du département</FormLabel>
                                    <div className="flex items-center gap-3">
                                      <FormControl>
                                        <input type="color" className="w-10 h-10 rounded cursor-pointer border-none" {...field} />
                                      </FormControl>
                                      <span className="text-xs font-mono text-slate-400">{field.value}</span>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                 control={deptForm.control}
                                 name="churchId"
                                 render={({ field }) => (
                                   <FormItem className="flex-1">
                                     <FormLabel className="text-xs font-bold uppercase text-slate-500">Église / Branche</FormLabel>
                                     <Select onValueChange={field.onChange} value={field.value}>
                                       <FormControl>
                                         <SelectTrigger>
                                           <SelectValue placeholder="Sélectionner" />
                                         </SelectTrigger>
                                       </FormControl>
                                       <SelectContent>
                                         {churches.map(c => (
                                           <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                         ))}
                                       </SelectContent>
                                     </Select>
                                     <FormMessage />
                                   </FormItem>
                                 )}
                               />
                           </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                         <FormField
                            control={deptForm.control}
                            name="leaderId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold uppercase text-slate-500">Responsable Principal *</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Input
                                      placeholder="Rechercher un membre..."
                                      value={leaderSearch}
                                      onChange={(e) => setLeaderSearch(e.target.value)}
                                    />
                                    <div className="max-h-[200px] overflow-y-auto border rounded-xl divide-y">
                                      {members
                                        .filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(leaderSearch.toLowerCase()))
                                        .map(m => (
                                          <div
                                            key={m.id}
                                            className={cn(
                                              "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors",
                                              field.value === m.id ? "bg-church-gold/10" : ""
                                            )}
                                            onClick={() => field.onChange(m.id)}
                                          >
                                            <Avatar className="h-7 w-7">
                                              <AvatarFallback className="text-[10px]">{m.firstName[0]}{m.lastName[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{m.firstName} {m.lastName}</span>
                                            {field.value === m.id && <CheckCircle2 className="w-4 h-4 text-church-gold ml-auto" />}
                                          </div>
                                        ))}
                                    </div>
                                    {field.value && (
                                      <p className="text-xs text-church-green font-medium">
                                        Sélectionné : {members.find(m => m.id === field.value)?.firstName} {members.find(m => m.id === field.value)?.lastName}
                                      </p>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                            <h4 className="text-xs font-bold text-blue-900 uppercase">Assistants & Direction</h4>
                            <FormField
                              control={deptForm.control}
                              name="assistantIds"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Assistants</FormLabel>
                                  <Input
                                    className="h-8 text-xs mb-2"
                                    placeholder="Rechercher..."
                                    value={assistantSearch}
                                    onChange={(e) => setAssistantSearch(e.target.value)}
                                  />
                                  <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2">
                                    {members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(assistantSearch.toLowerCase())).slice(0, 10).map(m => (
                                      <div key={m.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`assistant-${m.id}`}
                                          checked={field.value?.includes(m.id)}
                                          onCheckedChange={(checked) => {
                                            const newVal = checked
                                              ? [...(field.value || []), m.id]
                                              : field.value?.filter(id => id !== m.id);
                                            field.onChange(newVal);
                                          }}
                                        />
                                        <Label htmlFor={`assistant-${m.id}`} className="text-xs leading-none cursor-pointer">
                                          {m.firstName} {m.lastName}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={deptForm.control}
                              name="leadershipIds"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Équipe de direction</FormLabel>
                                  <Input
                                    className="h-8 text-xs mb-2"
                                    placeholder="Rechercher..."
                                    value={leadershipSearch}
                                    onChange={(e) => setLeadershipSearch(e.target.value)}
                                  />
                                  <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2">
                                    {members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(leadershipSearch.toLowerCase())).slice(0, 10).map(m => (
                                      <div key={m.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`leadership-${m.id}`}
                                          checked={field.value?.includes(m.id)}
                                          onCheckedChange={(checked) => {
                                            const newVal = checked
                                              ? [...(field.value || []), m.id]
                                              : field.value?.filter(id => id !== m.id);
                                            field.onChange(newVal);
                                          }}
                                        />
                                        <Label htmlFor={`leadership-${m.id}`} className="text-xs leading-none cursor-pointer">
                                          {m.firstName} {m.lastName}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                         <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800">Sélectionner les membres initiaux</h3>
                            <Button type="button" variant="link" size="sm" onClick={() => {
                               const allIds = members.map(m => m.id);
                               deptForm.setValue('initialMembers', allIds);
                            }}>
                              Tout sélectionner
                            </Button>
                         </div>
                         <Input
                           placeholder="Rechercher un membre..."
                           value={memberSearch3}
                           onChange={(e) => setMemberSearch3(e.target.value)}
                         />
                         <div className="p-1 border rounded-xl max-h-[350px] overflow-y-auto">
                            <FormField
                              control={deptForm.control}
                              name="initialMembers"
                              render={({ field }) => (
                                <div className="space-y-1">
                                  {members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch3.toLowerCase())).map(m => (
                                    <div 
                                      key={m.id} 
                                      className={cn(
                                        "flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer",
                                        field.value?.includes(m.id) ? "bg-church-gold/10 border border-church-gold/20" : "hover:bg-slate-50 border border-transparent"
                                      )}
                                      onClick={() => {
                                        const newVal = field.value?.includes(m.id)
                                          ? field.value.filter(id => id !== m.id)
                                          : [...(field.value || []), m.id];
                                        field.onChange(newVal);
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="text-[10px]">{m.firstName[0]}{m.lastName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="text-xs font-bold text-slate-900">{m.firstName} {m.lastName}</p>
                                          <p className="text-[10px] text-slate-500">{m.phone}</p>
                                        </div>
                                      </div>
                                      <Checkbox checked={field.value?.includes(m.id)} />
                                    </div>
                                  ))}
                                </div>
                              )}
                            />
                         </div>
                      </motion.div>
                    )}

                    {currentStep === 4 && (
                      <motion.div 
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                         <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={deptForm.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Lieu habituel</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                      <Input className="pl-9" placeholder="ex: Salle B, Temple..." {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={deptForm.control}
                              name="meetingTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Heure habituelle</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                      <Input type="time" className="pl-9" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={deptForm.control}
                              name="meetingDays"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Jours de réunion</FormLabel>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                                      <div key={day} className="flex items-center space-x-2">
                                        <Checkbox 
                                          id={`day-${day}`}
                                          checked={field.value?.includes(day)}
                                          onCheckedChange={(checked) => {
                                            const newVal = checked 
                                              ? [...(field.value || []), day]
                                              : field.value?.filter(d => d !== day);
                                            field.onChange(newVal);
                                          }}
                                        />
                                        <Label htmlFor={`day-${day}`} className="text-xs leading-none cursor-pointer">
                                          {day}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={deptForm.control}
                              name="frequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Fréquence</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                      <SelectItem value="monthly">Mensuel</SelectItem>
                                      <SelectItem value="occasional">Occasionnel</SelectItem>
                                      <SelectItem value="other">Autre</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {field.value === 'other' && (
                                    <Input
                                      className="mt-2"
                                      placeholder="Précisez la fréquence..."
                                      value={frequencyOther}
                                      onChange={(e) => setFrequencyOther(e.target.value)}
                                    />
                                  )}
                                </FormItem>
                              )}
                            />
                         </div>

                         <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">SUIVI & PERFORMANCE</h4>
                            <div className="flex gap-4">
                              <FormField
                                control={deptForm.control}
                                name="trackingOptions.attendance"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0 p-3 bg-slate-50 rounded-xl flex-1 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel className="text-[10px] font-bold uppercase cursor-pointer">Suivi de présence</FormLabel>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={deptForm.control}
                                name="trackingOptions.activities"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0 p-3 bg-slate-50 rounded-xl flex-1 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel className="text-[10px] font-bold uppercase cursor-pointer">Suivi d'activités</FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {currentStep === 5 && (
                      <motion.div 
                        key="step5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                         <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-orange-600" />
                                <h4 className="text-sm font-bold text-orange-900">Communication directe</h4>
                              </div>
                              <FormField
                                control={deptForm.control}
                                name="communication.createGroup"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <p className="text-xs text-orange-700 leading-relaxed">
                              Générer automatiquement un groupe de discussion dans la "Messagerie" avec tous les membres sélectionnés.
                            </p>
                         </div>

                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PERMISSIONS & ACCÈS</h4>
                               <FormField
                                  control={deptForm.control}
                                  name="permissions.visibility"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Qui peut voir ?</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                          <SelectItem value="all">Tout le monde</SelectItem>
                                          <SelectItem value="leaders">Responsables uniquement</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={deptForm.control}
                                  name="permissions.modification"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Qui peut modifier ?</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                          <SelectItem value="admin">Administrateurs</SelectItem>
                                          <SelectItem value="leader">Responsable département</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                            </div>

                            <div className="space-y-4">
                               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NOTIFICATIONS</h4>
                               <div className="space-y-3 pt-2">
                                  {['meetings', 'activities', 'announcements'].map(item => (
                                    <div key={item}>
                                      <FormField
                                        control={deptForm.control}
                                        name={`notifications.${item}` as any}
                                        render={({ field }) => (
                                          <div className="flex items-center justify-between">
                                            <Label className="text-xs capitalize">{item === 'meetings' ? 'Réunions' : item === 'activities' ? 'Activités' : 'Annonces'}</Label>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                          </div>
                                        )}
                                      />
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>

                         <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-church-gold flex items-center gap-2">
                              <Target className="w-4 h-4" /> Lier automatiquement à :
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                               {['events', 'services', 'projects'].map(link => (
                                 <div key={link}>
                                   <FormField
                                      control={deptForm.control}
                                      name={`links.${link}` as any}
                                      render={({ field }) => (
                                        <div className="flex flex-col items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                          <Badge variant="outline" className={cn("text-[10px] uppercase border-none", field.value ? "text-church-gold" : "text-white/20")}>
                                            {link === 'events' ? 'Événements' : link === 'services' ? 'Cultes' : 'Projets'}
                                          </Badge>
                                          <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                                        </div>
                                      )}
                                    />
                                 </div>
                               ))}
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      disabled={currentStep === 1}
                    >
                      Précédent
                    </Button>
                    <div className="flex gap-3">
                      {currentStep < steps.length ? (
                        <Button 
                          type="button" 
                          onClick={() => {
                             // Basic validation before going next (optional if we want to enforce it per step)
                             setCurrentStep(prev => prev + 1);
                          }}
                          className="bg-church-gold hover:bg-church-gold/90 text-white"
                        >
                          Suivant
                        </Button>
                      ) : (
                        <>
                          <Button 
                            type="button"
                            variant="secondary"
                            onClick={deptForm.handleSubmit(onAddDept, onInvalid)}
                          >
                            Créer & Ajouter membres
                          </Button>
                          <Button 
                            type="button"
                            onClick={deptForm.handleSubmit(onAddDept, onInvalid)}
                            className="bg-church-green hover:bg-green-700 text-white"
                          >
                            Créer le département
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Départements</p>
              <p className="text-2xl font-bold text-slate-900">{departments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-green-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Membres Engagés</p>
              <p className="text-2xl font-bold text-slate-900">{departmentMembers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-orange-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Activités ce mois</p>
              <p className="text-2xl font-bold text-slate-900">{departmentActivities.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Rechercher un département..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="paused">En pause</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-100">
            <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600">Aucun département trouvé</h3>
            <p className="text-slate-400">Commencez par créer votre premier ministère.</p>
          </div>
        ) : (
          filteredDepts.map((dept) => {
            const deptMembers = departmentMembers.filter(m => m.departmentId === dept.id);
            const deptLeader = members.find(m => m.id === dept.leaderId);
            const deptActs = departmentActivities.filter(a => a.departmentId === dept.id);
            
            return (
              <Card 
                key={dept.id} 
                className="group border-none shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                onClick={() => setSelectedDeptId(dept.id)}
              >
                <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                  {dept.logoUrl ? (
                    <img src={dept.logoUrl} alt={dept.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50" style={{ borderTop: `4px solid ${dept.color}` }}>
                      <Layers className="w-12 h-12 text-slate-200" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge variant={dept.status === 'active' ? 'default' : 'secondary'} className={dept.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none backdrop-blur-sm' : ''}>
                      {dept.status === 'active' ? 'Actif' : 'En pause'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-white group-hover:shadow-sm transition-all -mt-12 relative z-10 border-4 border-white">
                      <Layers className="w-6 h-6" style={{ color: dept.color }} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{dept.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{dept.description}</p>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[10px] bg-church-gold/20 text-church-gold">
                        {deptLeader?.firstName[0]}{deptLeader?.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-600 font-medium">
                      {deptLeader ? `${deptLeader.firstName} ${deptLeader.lastName}` : 'Sans leader'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Membres</p>
                      <p className="font-bold text-slate-700">{deptMembers.length}</p>
                    </div>
                    <div className="text-center border-x border-slate-50">
                      <p className="text-xs text-slate-400 mb-1">Activités</p>
                      <p className="font-bold text-slate-700">{deptActs.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Présence</p>
                      <p className="font-bold text-slate-700">85%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function DepartmentDetail({ dept, onBack }: { dept: Department, onBack: () => void }) {
  const { 
    members, 
    departmentMembers, 
    departmentActivities, 
    departmentGoals,
    addDeptMember,
    addDeptActivity,
    updateDeptActivity,
    deleteDeptActivity,
    addDeptGoal,
    updateDeptGoal,
    deleteDeptMember,
    updateDepartment
  } = useStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateDepartment(dept.id, { logoUrl: reader.result as string });
        toast.success("Image du département mise à jour");
      };
      reader.readAsDataURL(file);
    }
  };

  const deptLeader = members.find(m => m.id === dept.leaderId);
  const deptMems = departmentMembers.filter(m => m.departmentId === dept.id);
  const deptActs = departmentActivities.filter(a => a.departmentId === dept.id);
  const deptGls = departmentGoals.filter(g => g.departmentId === dept.id);

  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = React.useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = React.useState(false);
  const [memberToDeleteId, setMemberToDeleteId] = React.useState<string | null>(null);
  const [isAttendanceOpen, setIsAttendanceOpen] = React.useState(false);
  const [selectedActForAttendance, setSelectedActForAttendance] = React.useState<DepartmentActivity | null>(null);
  const [attendanceList, setAttendanceList] = React.useState<string[]>([]);
  const [isEditDeptOpen, setIsEditDeptOpen] = React.useState(false);
  // Multi-select member picker state
  const [memberPickerSearch, setMemberPickerSearch] = React.useState('');
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
  // Role "Autre" state
  const [memberRole, setMemberRole] = React.useState<string>('member');
  const [customMemberRole, setCustomMemberRole] = React.useState('');

  const editDeptForm = useForm<z.infer<typeof deptSchema>>({
    resolver: zodResolver(deptSchema),
    defaultValues: {
      name: dept.name,
      type: dept.type,
      leaderId: dept.leaderId,
      assistantIds: dept.assistantIds,
      leadershipIds: dept.leadershipIds,
      description: dept.description,
      mission: dept.mission,
      verse: dept.verse || '',
      motto: dept.motto || '',
      meetingDays: dept.meetingDays,
      meetingTime: dept.meetingTime || '',
      location: dept.location,
      frequency: dept.frequency,
      color: dept.color,
      icon: dept.icon,
      logoUrl: dept.logoUrl || '',
      churchId: dept.churchId,
      trackingOptions: dept.trackingOptions,
      communication: dept.communication,
      permissions: dept.permissions,
      notifications: dept.notifications,
      links: dept.links,
      initialMembers: [],
    },
  });

  const onUpdateDept = (values: z.infer<typeof deptSchema>) => {
    const { initialMembers, ...deptData } = values;
    updateDepartment(dept.id, deptData as any);
    setIsEditDeptOpen(false);
    toast.success("Département mis à jour avec succès !");
  };

  const memberForm = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: { memberIds: [], role: 'member', customRole: '' }
  });

  const activityForm = useForm<z.infer<typeof activitySchema>>({
    resolver: zodResolver(activitySchema),
    defaultValues: { 
      title: '', 
      description: 'Réunion ou activité du département pour coordination.', 
      date: '', 
      location: dept.location, 
      type: 'meeting',
      isPublished: false,
      imageUrl: '',
    }
  });

  const goalForm = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: { title: '', target: 1, month: format(new Date(), 'MMMM yyyy', { locale: fr }) }
  });

  const onAddMember = () => {
    if (selectedMemberIds.length === 0) {
      toast.error("Sélectionnez au moins un membre");
      return;
    }
    const finalRole = memberRole === 'autre' ? (customMemberRole || 'Autre') : memberRole;
    selectedMemberIds.forEach(memberId => {
      addDeptMember({ memberId, role: finalRole as any, departmentId: dept.id, status: 'active' });
    });
    setIsAddMemberOpen(false);
    setSelectedMemberIds([]);
    setMemberPickerSearch('');
    setMemberRole('member');
    setCustomMemberRole('');
    toast.success(`${selectedMemberIds.length} membre(s) ajouté(s) au département`);
  };

  const onAddActivity = (values: z.infer<typeof activitySchema>) => {
    addDeptActivity({ ...values, departmentId: dept.id });
    setIsAddActivityOpen(false);
    activityForm.reset();
    toast.success("Activité programmée");
  };

  const onInvalidActivity = (errors: any) => {
    console.error("Activity Form Errors:", errors);
    toast.error("Veuillez remplir correctement les informations de l'activité.");
  };

  const onAddGoal = (values: z.infer<typeof goalSchema>) => {
    addDeptGoal({ ...values, departmentId: dept.id, current: 0 });
    setIsAddGoalOpen(false);
    goalForm.reset();
    toast.success("Objectif ajouté");
  };

  const handleDeleteMember = () => {
    if (memberToDeleteId) {
      deleteDeptMember(memberToDeleteId);
      setMemberToDeleteId(null);
      toast.info("Membre retiré du département");
    }
  };

  const handleAttendanceToggle = (memberId: string) => {
    setAttendanceList(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  const saveAttendance = () => {
    if (selectedActForAttendance) {
      updateDeptActivity(selectedActForAttendance.id, { attendance: attendanceList });
      setIsAttendanceOpen(false);
      setSelectedActForAttendance(null);
      toast.success("Présences enregistrées");
    }
  };

  const openAttendance = (act: DepartmentActivity) => {
    setSelectedActForAttendance(act);
    setAttendanceList(act.attendance || []);
    setIsAttendanceOpen(true);
  };

  const currentMonthActs = deptActs.filter(a => {
    const actDate = new Date(a.date);
    const now = new Date();
    return actDate.getMonth() === now.getMonth() && actDate.getFullYear() === now.getFullYear();
  });

  const attendanceRate = React.useMemo(() => {
    if (deptActs.length === 0 || deptMems.length === 0) return 0;
    const totalPossibleAttendance = deptActs.length * deptMems.length;
    const totalActualAttendance = deptActs.reduce((sum, act) => sum + (act.attendance?.length || 0), 0);
    return Math.round((totalActualAttendance / totalPossibleAttendance) * 100);
  }, [deptActs, deptMems]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronRight className="w-5 h-5 rotate-180" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif font-bold text-slate-900">{dept.name}</h1>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Actif</Badge>
            </div>
            <Dialog open={isEditDeptOpen} onOpenChange={setIsEditDeptOpen}>
              <DialogTrigger render={<Button variant="outline" size="sm" className="border-church-gold text-church-gold hover:bg-church-gold hover:text-white">
                Modifier le département
              </Button>}>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-serif">MODIFIER {dept.name.toUpperCase()}</DialogTitle>
                </DialogHeader>
                <Form {...editDeptForm}>
                  <form onSubmit={editDeptForm.handleSubmit(onUpdateDept)} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editDeptForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase text-slate-500">Nom du département *</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editDeptForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase text-slate-500">Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="ministry">Ministère</SelectItem>
                                <SelectItem value="department">Département</SelectItem>
                                <SelectItem value="group">Groupe</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                       <Label className="text-xs font-bold uppercase text-slate-500">Logo / Image</Label>
                       <div 
                         onClick={() => document.getElementById('edit-dept-logo')?.click()}
                         className="w-full h-48 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden"
                       >
                         {editDeptForm.watch('logoUrl') ? (
                           <img src={editDeptForm.watch('logoUrl')} alt="Preview" className="w-full h-full object-cover" />
                         ) : (
                           <>
                             <Plus className="w-6 h-6 text-slate-300" />
                             <span className="text-[10px] text-slate-400 font-bold uppercase">Ajouter une image</span>
                           </>
                         )}
                       </div>
                       <input id="edit-dept-logo" type="file" className="hidden" accept="image/*" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           const reader = new FileReader();
                           reader.onloadend = () => editDeptForm.setValue('logoUrl', reader.result as string);
                           reader.readAsDataURL(file);
                         }
                       }} />
                    </div>

                    <FormField
                      control={editDeptForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase text-slate-500">Description</FormLabel>
                          <FormControl><Textarea {...field} /></FormControl>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full bg-church-gold text-white">Enregistrer les modifications</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-slate-500">{dept.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden group/img">
            <div className="h-48 bg-slate-100 relative">
              {dept.logoUrl ? (
                <img src={dept.logoUrl} alt={dept.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-church-dark">
                   <Layers className="w-12 h-12 text-church-gold/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-white border-white hover:bg-white hover:text-black"
                  onClick={() => document.getElementById('detail-image-upload')?.click()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Changer l'image
                </Button>
                <input id="detail-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center -mt-16">
                <Avatar className="w-20 h-20 border-4 border-white shadow-xl mb-4 relative z-10">
                  <AvatarFallback className="text-xl bg-church-gold/20 text-church-gold">
                    {deptLeader?.firstName[0]}{deptLeader?.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{deptLeader?.firstName} {deptLeader?.lastName}</h3>
                <p className="text-sm text-church-gold font-medium mb-4">Responsable Principal</p>
                
                <div className="w-full space-y-3 pt-4 border-t border-slate-50 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Réunion: {dept.meetingDays.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{dept.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Target className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Mission: {dept.mission}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-church-gold/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-church-gold" />
                Verset Clé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic text-slate-600">
                "{dept.verse || "Que tout ce que vous faites soit fait avec amour."}"
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="members" className="space-y-6">
            <TabsList className="bg-white p-1 border border-slate-100 h-12">
              <TabsTrigger value="members" className="data-[state=active]:bg-slate-50">
                <Users className="w-4 h-4 mr-2" /> Membres
              </TabsTrigger>
              <TabsTrigger value="activities" className="data-[state=active]:bg-slate-50">
                <CalendarIcon className="w-4 h-4 mr-2" /> Activités
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-slate-50">
                <TrendingUp className="w-4 h-4 mr-2" /> Performance
              </TabsTrigger>
              <TabsTrigger value="communication" className="data-[state=active]:bg-slate-50">
                <MessageSquare className="w-4 h-4 mr-2" /> Discussion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Gestion des membres</h3>
                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                  <DialogTrigger render={<Button size="sm" className="bg-church-gold hover:bg-church-gold/90 text-white shadow-md transition-all">
                    <UserPlus className="w-4 h-4 mr-2" /> Ajouter un Membre
                  </Button>}>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader className="space-y-2">
                      <DialogTitle className="text-2xl font-serif font-bold text-slate-900">Intégrer un nouveau membre</DialogTitle>
                      <DialogDescription>
                        Rejoignez un membre de l'église au département <span className="font-bold text-church-gold">{dept.name}</span>.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-5">
                      {/* Multi-select member picker */}
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">Membre(s) de l'église</label>
                        {/* Search input */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            className="pl-9 h-10 border-slate-200"
                            placeholder="Rechercher un membre..."
                            value={memberPickerSearch}
                            onChange={e => setMemberPickerSearch(e.target.value)}
                          />
                        </div>
                        {/* Toggle all */}
                        {(() => {
                          const availableMembers = members.filter(m => !deptMems.some(dm => dm.memberId === m.id));
                          const filtered = availableMembers.filter(m =>
                            `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberPickerSearch.toLowerCase())
                          );
                          const allSelected = filtered.length > 0 && filtered.every(m => selectedMemberIds.includes(m.id));
                          return (
                            <>
                              <div className="flex items-center gap-2 px-1">
                                <Checkbox
                                  id="select-all-members"
                                  checked={allSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedMemberIds(prev => [...new Set([...prev, ...filtered.map(m => m.id)])]);
                                    } else {
                                      setSelectedMemberIds(prev => prev.filter(id => !filtered.some(m => m.id === id)));
                                    }
                                  }}
                                />
                                <Label htmlFor="select-all-members" className="text-xs text-slate-500 cursor-pointer">
                                  {allSelected ? 'Désélectionner tous' : 'Sélectionner tous'}
                                </Label>
                              </div>
                              {/* Scrollable list */}
                              <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                                {filtered.length === 0 ? (
                                  <p className="text-center text-slate-400 py-4 text-sm italic">Aucun membre disponible</p>
                                ) : filtered.map(m => (
                                  <div
                                    key={m.id}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors",
                                      selectedMemberIds.includes(m.id) && "bg-church-gold/5"
                                    )}
                                    onClick={() => setSelectedMemberIds(prev =>
                                      prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                                    )}
                                  >
                                    <Checkbox
                                      checked={selectedMemberIds.includes(m.id)}
                                      onCheckedChange={() => setSelectedMemberIds(prev =>
                                        prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                                      )}
                                    />
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback className="bg-church-gold/10 text-church-gold text-[10px]">
                                        {m.firstName[0]}{m.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium text-slate-900">{m.firstName} {m.lastName}</p>
                                      <p className="text-[10px] text-slate-500">{m.phone}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                        {/* Selected chips */}
                        {selectedMemberIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {selectedMemberIds.map(id => {
                              const m = members.find(m => m.id === id);
                              if (!m) return null;
                              return (
                                <span key={id} className="inline-flex items-center gap-1 bg-church-gold/10 text-church-gold text-xs px-2 py-0.5 rounded-full font-medium">
                                  {m.firstName} {m.lastName}
                                  <button
                                    type="button"
                                    className="ml-0.5 hover:text-church-gold/70"
                                    onClick={() => setSelectedMemberIds(prev => prev.filter(i => i !== id))}
                                  >×</button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Role selector */}
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">Rôle / Fonction</label>
                        <Select value={memberRole} onValueChange={setMemberRole}>
                          <SelectTrigger className="h-11 border-slate-200">
                            <SelectValue placeholder="Attribuer un rôle..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member" className="py-2">Membre actif</SelectItem>
                            <SelectItem value="assistant" className="py-2">Assistant / Adjoint</SelectItem>
                            <SelectItem value="leader" className="py-2">Responsable de pôle</SelectItem>
                            <SelectItem value="autre" className="py-2">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        {memberRole === 'autre' && (
                          <Input
                            placeholder="Précisez le rôle ou la fonction..."
                            value={customMemberRole}
                            onChange={e => setCustomMemberRole(e.target.value)}
                            className="border-slate-200"
                          />
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-11"
                          onClick={() => {
                            setIsAddMemberOpen(false);
                            setSelectedMemberIds([]);
                            setMemberPickerSearch('');
                            setMemberRole('member');
                            setCustomMemberRole('');
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="button"
                          className="flex-1 h-11 bg-church-green hover:bg-church-green/90 text-white font-bold"
                          onClick={onAddMember}
                        >
                          Confirmer l'ajout ({selectedMemberIds.length})
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deptMems.map((dm) => {
                  const member = members.find(m => m.id === dm.memberId);
                  return (
                    <Card key={dm.id} className="border border-slate-100">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-slate-100 text-slate-600">
                              {member?.firstName[0]}{member?.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900">{member?.firstName} {member?.lastName}</p>
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              {dm.role === 'leader' ? 'Responsable' : dm.role === 'assistant' ? 'Assistant' : 'Membre'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setMemberToDeleteId(dm.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Activités & Réunions</h3>
                <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
                  <DialogTrigger render={<Button size="sm" className="bg-church-green">
                    <Plus className="w-4 h-4 mr-2" /> Programmer
                  </Button>}>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nouvelle activité</DialogTitle>
                    </DialogHeader>
                    <Form {...activityForm}>
                      <form onSubmit={activityForm.handleSubmit(onAddActivity, onInvalidActivity)} className="space-y-4 py-4">
                        <FormField
                          control={activityForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Titre</FormLabel>
                              <FormControl>
                                <Input placeholder="ex: Répétition générale..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={activityForm.control}
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
                          <FormField
                            control={activityForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="meeting">Réunion</SelectItem>
                                    <SelectItem value="rehearsal">Répétition</SelectItem>
                                    <SelectItem value="prayer">Prière</SelectItem>
                                    <SelectItem value="training">Formation</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={activityForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lieu</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={activityForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Précisez l'ordre du jour ou les détails..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex flex-col gap-2">
                           <Label className="text-xs font-bold uppercase text-slate-500">Image / Affiche</Label>
                           <div 
                             onClick={() => document.getElementById('activity-image-upload')?.click()}
                             className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden"
                           >
                             {activityForm.watch('imageUrl') ? (
                               <img src={activityForm.watch('imageUrl')} alt="Preview" className="w-full h-full object-cover" />
                             ) : (
                               <>
                                 <Plus className="w-6 h-6 text-slate-300" />
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">Ajouter une image</span>
                               </>
                             )}
                           </div>
                           <input id="activity-image-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               const reader = new FileReader();
                               reader.onloadend = () => activityForm.setValue('imageUrl', reader.result as string);
                               reader.readAsDataURL(file);
                             }
                           }} />
                        </div>

                        <FormField
                          control={activityForm.control}
                          name="isPublished"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-slate-900 font-bold">Publier sur le site public</FormLabel>
                                <FormDescription>
                                  Cette activité sera visible par tous sur la page d'accueil simple.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full bg-church-green">Programmer l'activité</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {deptActs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 italic">Aucune activité programmée.</div>
                ) : (
                  deptActs.map((act) => (
                    <Card key={act.id} className="border border-slate-100">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-church-gold">
                              {format(new Date(act.date), 'MMM', { locale: fr })}
                            </span>
                            <span className="text-lg font-bold text-slate-900 leading-none">
                              {format(new Date(act.date), 'dd')}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900">{act.title}</h4>
                              {act.isPublished ? (
                                <Badge className="bg-church-gold/10 text-church-gold border-none text-[8px] h-4">PUBLIÉ</Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-300 border-slate-200 text-[8px] h-4 italic">BROUILLON</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {format(new Date(act.date), 'HH:mm')}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {act.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!act.isPublished && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-church-gold hover:bg-church-gold/5"
                              onClick={() => {
                                updateDeptActivity(act.id, { isPublished: true } as any);
                                toast.success("Activité publiée");
                              }}
                            >
                              <Share2 className="w-3 h-3 mr-1" /> Publier
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={cn(
                              "h-8 text-xs",
                              act.attendance && act.attendance.length > 0 ? "border-church-green text-church-green" : "border-church-gold text-church-gold"
                            )}
                            onClick={() => openAttendance(act)}
                          >
                            {act.attendance && act.attendance.length > 0 ? 'Gérer présences' : 'Marquer présences'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Statistiques de participation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Taux de présence moyen</span>
                        <span className="font-bold text-church-green">{attendanceRate}%</span>
                      </div>
                      <Progress value={attendanceRate} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Fréquence des réunions</span>
                        <span className="font-bold text-blue-600">{currentMonthActs.length} / mois</span>
                      </div>
                      <Progress value={Math.min((currentMonthActs.length / 4) * 100, 100)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">Objectifs du mois</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddGoalOpen(true)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deptGls.length === 0 ? (
                      <p className="text-sm text-slate-400 italic text-center py-4">Aucun objectif défini.</p>
                    ) : (
                      deptGls.map((goal) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-700 font-medium">{goal.title}</span>
                            <span className="text-xs text-slate-400">{goal.current} / {goal.target}</span>
                          </div>
                          <Progress value={(goal.current / goal.target) * 100} className="h-1.5" />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm bg-blue-50/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Analyse IA & Suggestions</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Basé sur l'activité récente, voici quelques suggestions pour dynamiser le département :
                      </p>
                      <ul className="space-y-2">
                        <li className="text-sm text-slate-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          Organisez une sortie informelle pour renforcer la cohésion d'équipe.
                        </li>
                        <li className="text-sm text-slate-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          Le taux de présence a baissé de 5% le mardi, envisagez de décaler l'heure.
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication" className="space-y-4">
              <Card className="border-none shadow-sm h-[500px] flex flex-col">
                <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Fil de discussion</CardTitle>
                    <CardDescription>Espace d'échange interne au département</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" /> Fichiers
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-[10px] bg-church-gold/20 text-church-gold">AP</AvatarFallback>
                    </Avatar>
                    <div className="bg-slate-50 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                      <p className="text-xs font-bold text-church-gold mb-1">Admin Pasteur</p>
                      <p className="text-sm text-slate-700">Bonjour à tous ! N'oubliez pas la répétition de demain à 18h.</p>
                      <p className="text-[10px] text-slate-400 mt-1">10:30</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">ME</AvatarFallback>
                    </Avatar>
                    <div className="bg-church-green text-white rounded-2xl rounded-tr-none p-3 max-w-[80%]">
                      <p className="text-sm">C'est noté, je serai présent avec les nouveaux chants.</p>
                      <p className="text-[10px] text-white/60 mt-1">11:15</p>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 border-t border-slate-50 flex gap-2">
                  <Input placeholder="Écrire un message..." className="flex-1" />
                  <Button size="icon" className="bg-church-green">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Définir un objectif</DialogTitle>
          </DialogHeader>
          <Form {...goalForm}>
            <form onSubmit={goalForm.handleSubmit(onAddGoal)} className="space-y-4 py-4">
              <FormField
                control={goalForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de l'objectif</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Recruter 5 nouveaux membres..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={goalForm.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valeur cible</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-church-green">Ajouter l'objectif</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceOpen} onOpenChange={(open) => !open && setIsAttendanceOpen(false)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Marquer les présences</DialogTitle>
            <DialogDescription>
              {selectedActForAttendance?.title} - {selectedActForAttendance && format(new Date(selectedActForAttendance.date), 'dd MMMM yyyy', { locale: fr })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
            {deptMems.length === 0 ? (
              <p className="text-center text-slate-400 py-4 italic">Aucun membre dans ce département.</p>
            ) : (
              deptMems.map(dm => {
                const member = members.find(m => m.id === dm.memberId);
                const isSelected = attendanceList.includes(dm.memberId);
                return (
                  <div 
                    key={dm.id} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                      isSelected ? "border-church-green bg-church-green/5" : "border-slate-100 hover:bg-slate-50"
                    )}
                    onClick={() => handleAttendanceToggle(dm.memberId)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member?.firstName[0]}{member?.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold">{member?.firstName} {member?.lastName}</p>
                        <p className="text-[10px] text-slate-400">{dm.role === 'leader' ? 'Responsable' : dm.role === 'assistant' ? 'Assistant' : 'Membre'}</p>
                      </div>
                    </div>
                    <Checkbox checked={isSelected} onCheckedChange={() => handleAttendanceToggle(dm.memberId)} />
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttendanceOpen(false)}>Annuler</Button>
            <Button onClick={saveAttendance} className="bg-church-green">Enregistrer ({attendanceList.length})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Member Deletion */}
      <Dialog open={!!memberToDeleteId} onOpenChange={(open) => !open && setMemberToDeleteId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Confirmer le retrait
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir retirer ce membre du département ? Cette action ne supprime pas le membre de l'église, seulement son affectation à ce département.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setMemberToDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteMember}>Retirer le membre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

