import React from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone,
  UserPlus,
  Trash2,
  Edit2,
  BarChart3,
  HeartHandshake,
  Coins,
  CheckCircle2,
  Calendar as CalendarIcon,
  MapPin,
  Shield,
  MessageSquare,
  ChevronRight,
  Star,
  Bell,
  User,
  PhoneCall,
  Info,
  Stethoscope,
  Briefcase,
  Church as ChurchIcon,
  BookOpen,
  Link,
  Flame,
  FileText,
  XCircle,
  X,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { useStore, Member } from '../lib/store';
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

const memberSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  gender: z.enum(['M', 'F']),
  birthDate: z.string().optional(),
  photoUrl: z.string().optional(),
  
  phone: z.string().min(1, "Téléphone requis"),
  phone2: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  spouseName: z.string().optional(),
  childrenCount: z.coerce.number().min(0).optional(),
  childrenDetails: z.string().optional(),
  
  profession: z.string().optional(),
  workplace: z.string().optional(),
  educationLevel: z.string().optional(),
  
  conversionDate: z.string().optional(),
  isBaptized: z.boolean().default(false),
  baptismDate: z.string().optional(),
  baptismPlace: z.string().optional(),
  formerChurch: z.string().optional(),
  referredBy: z.enum(['invitation', 'social_media', 'family', 'other']).optional(),
  
  departmentId: z.string().optional(),
  engagementLevel: z.enum(['new', 'active', 'leader']).default('new'),
  
  archiveReason: z.enum(['departure', 'transfer', 'inactivity', 'death', 'other']).optional(),
  archiveNotes: z.string().optional(),
  matricule: z.string().optional(),
  status: z.enum(['new', 'active', 'inactive', 'archived', 'suspended', 'deceased']).default('new'),
  joinedAt: z.string().optional(),
  frequency: z.enum(['regular', 'occasional']).optional(),
  
  healthIssues: z.string().optional(),
  specialNeeds: z.string().optional(),
  pastoralFollowupNeeded: z.boolean().default(false),
  
  prayerNeeds: z.string().optional(),
  leaderNotes: z.string().optional(),
  spiritualGoals: z.string().optional(),
  
  emergencyContactName: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  
  churchId: z.string().min(1, "Église requise"),
  groups: z.array(z.string()).default([]),
  idCardUrl: z.string().optional(),
  baptismCertificateUrl: z.string().optional(),
  otherDocs: z.array(z.object({ name: z.string(), url: z.string() })).default([]),
});

type MemberFormValues = z.infer<typeof memberSchema>;

const calculateAge = (birthDate: string | undefined): number | null => {
  if (!birthDate) return null;
  try {
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch (e) {
    return null;
  }
};

export function MemberManagement() {
  const { 
    members, 
    churches, 
    departments,
    departmentMembers,
    services,
    serviceFinances,
    eventRegistrations,
    pastoralNotes,
    trainings,
    addMember, 
    updateMember, 
    deleteMember 
  } = useStore();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('active');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(null);
  const [filterGender, setFilterGender] = React.useState<string>('all');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [filterDept, setFilterDept] = React.useState<string>('all');
  const [filterGroup, setFilterGroup] = React.useState<string>('all');
  const [shouldCloseAfterSubmit, setShouldCloseAfterSubmit] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  
  // New States
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = React.useState(false);
  const [memberToArchive, setMemberToArchive] = React.useState<Member | null>(null);
  const [archiveForm, setArchiveForm] = React.useState({ reason: 'departure', notes: '' });
  
  const [isReintegrationDialogOpen, setIsReintegrationDialogOpen] = React.useState(false);
  const [memberToReintegrate, setMemberToReintegrate] = React.useState<Member | null>(null);
  
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = React.useState(false);
  const [verificationData, setVerificationData] = React.useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    birthDate: ''
  });
  const [foundMembers, setFoundMembers] = React.useState<Member[]>([]);
  const [showArchivedAlert, setShowArchivedAlert] = React.useState(false);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      phone2: '',
      photoUrl: '',
      address: '',
      city: '',
      neighborhood: '',
      churchId: churches[0]?.id || '',
      status: 'new',
      gender: 'M',
      birthDate: '',
      maritalStatus: 'single',
      spouseName: '',
      childrenCount: 0,
      childrenDetails: '',
      profession: '',
      workplace: '',
      educationLevel: '',
      conversionDate: '',
      isBaptized: false,
      baptismDate: '',
      baptismPlace: '',
      formerChurch: '',
      referredBy: 'other',
      departmentId: 'autre',
      engagementLevel: 'new',
      joinedAt: new Date().toISOString().split('T')[0],
      frequency: 'regular',
      healthIssues: '',
      specialNeeds: '',
      pastoralFollowupNeeded: false,
      prayerNeeds: '',
      leaderNotes: '',
      spiritualGoals: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactPhone: '',
      groups: [],
      idCardUrl: '',
      baptismCertificateUrl: '',
      otherDocs: [],
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 2MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fieldName === 'otherDocs') {
          const currentDocs = form.getValues('otherDocs') || [];
          form.setValue('otherDocs', [...currentDocs, { name: file.name, url: reader.result as string }]);
        } else {
          form.setValue(fieldName, reader.result as string);
        }
        toast.success(`${file.name} téléversé avec succès`);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: MemberFormValues) => {
    if (isEditing && editingId) {
      updateMember(editingId, {
        ...values,
        email: values.email || '',
        groups: values.groups || [],
      } as any);
      toast.success("Informations du membre mises à jour");
    } else {
      addMember({
        ...values,
        email: values.email || '',
        groups: values.groups || [],
        joinedAt: values.joinedAt || new Date().toISOString(),
      } as any);
      toast.success("Membre ajouté avec succès");
    }
    
    if (shouldCloseAfterSubmit) {
      setIsAddDialogOpen(false);
      setIsEditing(false);
      setEditingId(null);
      form.reset();
    } else {
      if (!isEditing) {
        // Keep some values but clear personal ones only for "Add another"
        form.reset({
          ...form.getValues(),
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          phone2: '',
          photoUrl: '',
          birthDate: '',
        });
      }
    }
  };

  const handleEdit = (member: Member) => {
    setEditingId(member.id);
    setIsEditing(true);
    form.reset({
      ...member,
      email: member.email || '',
      joinedAt: member.joinedAt ? new Date(member.joinedAt).toISOString().split('T')[0] : '',
      birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
      conversionDate: member.conversionDate ? new Date(member.conversionDate).toISOString().split('T')[0] : '',
      baptismDate: member.baptismDate ? new Date(member.baptismDate).toISOString().split('T')[0] : '',
    } as any);
    setIsAddDialogOpen(true);
  };

  const handleVerifyMember = () => {
    const found = members.filter(m => 
      m.phone === verificationData.phone || 
      (m.email && m.email === verificationData.email) ||
      (m.lastName.toLowerCase() === verificationData.lastName.toLowerCase() && 
       m.firstName.toLowerCase() === verificationData.firstName.toLowerCase() && 
       m.birthDate === verificationData.birthDate)
    );

    if (found.length > 0) {
      const archived = found.filter(m => m.status === 'archived');
      const active = found.filter(m => m.status !== 'archived');

      if (active.length > 0) {
        toast.error("Un membre actif avec ces informations existe déjà.");
        return;
      }

      if (archived.length > 0) {
        setFoundMembers(archived);
        setShowArchivedAlert(true);
        return;
      }
    }

    // No members found, proceed to full form
    setIsVerificationDialogOpen(false);
    handleAddNew(verificationData);
  };

  const handleConfirmArchive = () => {
    if (memberToArchive) {
      updateMember(memberToArchive.id, {
        status: 'archived',
        archivedAt: new Date().toISOString(),
        archiveReason: archiveForm.reason as any,
        archiveNotes: archiveForm.notes
      });
      toast.success(`${memberToArchive.lastName} a été archivé.`);
      setIsArchiveDialogOpen(false);
      setMemberToArchive(null);
    }
  };

  const handleConfirmReintegration = (member: Member, updatedData?: any) => {
    updateMember(member.id, {
      ...updatedData,
      status: 'active',
      archivedAt: undefined,
      archiveReason: undefined,
      archiveNotes: undefined
    });
    toast.success(`${member.lastName} a été réintégré avec succès.`);
    setIsReintegrationDialogOpen(false);
    setMemberToReintegrate(null);
    setShowArchivedAlert(false);
  };

  const handleAddNew = (initialData?: Partial<MemberFormValues>) => {
    setIsEditing(false);
    setEditingId(null);
    form.reset({
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      phone2: '',
      photoUrl: '',
      address: '',
      city: '',
      neighborhood: '',
      churchId: churches[0]?.id || '',
      status: 'new',
      gender: 'M',
      birthDate: initialData?.birthDate || '',
      maritalStatus: 'single',
      spouseName: '',
      childrenCount: 0,
      childrenDetails: '',
      profession: '',
      workplace: '',
      educationLevel: '',
      conversionDate: '',
      isBaptized: false,
      baptismDate: '',
      baptismPlace: '',
      formerChurch: '',
      referredBy: 'other',
      departmentId: 'autre',
      engagementLevel: 'new',
      joinedAt: new Date().toISOString().split('T')[0],
      frequency: 'regular',
      healthIssues: '',
      specialNeeds: '',
      pastoralFollowupNeeded: false,
      prayerNeeds: '',
      leaderNotes: '',
      spiritualGoals: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactPhone: '',
      groups: [],
      idCardUrl: '',
      baptismCertificateUrl: '',
      otherDocs: [],
    });
    setIsAddDialogOpen(true);
  };

  const filteredMembers = members.filter(m => {
    const matchesTab = activeTab === 'archives' ? m.status === 'archived' : m.status !== 'archived';
    const matchesSearch = 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.phone.includes(searchTerm) ||
      (m.matricule && m.matricule.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGender = filterGender === 'all' || m.gender === filterGender;
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchesDept = filterDept === 'all' || departmentMembers.some(dm => dm.memberId === m.id && dm.departmentId === filterDept);
    const matchesGroup = filterGroup === 'all' || m.groups.includes(filterGroup);
    
    return matchesTab && matchesSearch && matchesGender && matchesStatus && matchesDept && matchesGroup;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    inactive: members.filter(m => m.status === 'inactive').length,
    newThisMonth: members.filter(m => {
      const joined = new Date(m.joinedAt);
      const now = new Date();
      return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length
  };

  const notifications = React.useMemo(() => {
    const alerts: any[] = [];
    const now = new Date();

    // 1. Birthdays
    members.forEach(m => {
      if (m.birthDate) {
        try {
          const b = new Date(m.birthDate);
          if (b.getMonth() === now.getMonth() && b.getDate() === now.getDate()) {
            alerts.push({
              id: `bday-${m.id}`,
              title: "Anniversaire aujourd'hui",
              description: `${m.firstName} ${m.lastName}`,
              icon: Star,
              color: "bg-pink-100 text-pink-600"
            });
          }
        } catch (e) {}
      }
    });

    // 2. Missing Documents for Active Members
    members.filter(m => m.status === 'active').forEach(m => {
      if (!m.idCardUrl) {
         alerts.push({
            id: `missing-id-${m.id}`,
            title: "Document manquant",
            description: `${m.firstName}: Pièce d'identité`,
            icon: Shield,
            color: "bg-amber-100 text-amber-600"
          });
      }
    });

    // 3. Pastoral Followup
    members.filter(m => m.pastoralFollowupNeeded).forEach(m => {
      alerts.push({
        id: `pastoral-${m.id}`,
        title: "Suivi Pastoral Requis",
        description: `Visite pour ${m.lastName}`,
        icon: HeartHandshake,
        color: "bg-rose-100 text-rose-600"
      });
    });

    return alerts.slice(0, 6);
  }, [members]);

  if (selectedMemberId) {
    const member = members.find(m => m.id === selectedMemberId);
    if (member) {
      return <MemberDetail member={member} onBack={() => setSelectedMemberId(null)} onEdit={() => handleEdit(member)} />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Gestion des Membres</h1>
          <p className="text-slate-500">Suivi complet des membres, engagement spirituel et croissance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
            <DialogTrigger render={
              <Button className="bg-church-green hover:bg-church-green/90">
                <UserPlus className="w-4 h-4 mr-2" />
                Nouveau Membre
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-serif font-bold">Vérification de membre</DialogTitle>
                <CardDescription>
                  Vérifiez si le membre existe déjà dans la base avant de créer une nouvelle fiche.
                </CardDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Nom</label>
                    <Input 
                      placeholder="Nom" 
                      value={verificationData.lastName} 
                      onChange={e => setVerificationData({...verificationData, lastName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Prénom</label>
                    <Input 
                      placeholder="Prénom"
                      value={verificationData.firstName}
                      onChange={e => setVerificationData({...verificationData, firstName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Téléphone</label>
                  <Input 
                    placeholder="Téléphone"
                    value={verificationData.phone}
                    onChange={e => setVerificationData({...verificationData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Email</label>
                  <Input 
                    placeholder="email@exemple.com"
                    value={verificationData.email}
                    onChange={e => setVerificationData({...verificationData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Date de naissance</label>
                  <Input 
                    type="date"
                    value={verificationData.birthDate}
                    onChange={e => setVerificationData({...verificationData, birthDate: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsVerificationDialogOpen(false)}>Annuler</Button>
                <Button className="bg-church-green hover:bg-church-green/90" onClick={handleVerifyMember}>
                  Vérifier
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Archived Member Alert Dialog */}
        <Dialog open={showArchivedAlert} onOpenChange={setShowArchivedAlert}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <Info className="w-5 h-5" />
                Ancien membre détecté
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-slate-500">Un ou plusieurs membres archivés correspondent à ces informations :</p>
              {foundMembers.map(m => (
                <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900">{m.firstName} {m.lastName}</p>
                      <p className="text-[10px] font-mono text-slate-500">{m.matricule}</p>
                      <p className="text-xs text-slate-500 mt-1">Archivé le : {m.archivedAt ? format(new Date(m.archivedAt), 'dd/MM/yyyy') : 'N/A'}</p>
                    </div>
                    <Badge variant="outline" className="bg-slate-200 text-slate-700">Archivé</Badge>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                      onClick={() => {
                        setMemberToReintegrate(m);
                        setIsReintegrationDialogOpen(true);
                      }}
                    >
                      Réintégrer
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-xs italic text-slate-400">Si aucun de ces membres ne correspond, vous pouvez continuer la création d'une nouvelle fiche.</p>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="ghost" size="sm" onClick={() => setShowArchivedAlert(false)}>Annuler</Button>
              <Button size="sm" variant="outline" onClick={() => {
                setShowArchivedAlert(false);
                setIsVerificationDialogOpen(false);
                handleAddNew(verificationData);
              }}>
                Continuer (Nouveau)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setIsEditing(false);
            setEditingId(null);
          }
        }}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
            <div className="bg-church-green p-6 text-white">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {isEditing ? <Edit2 className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-serif">
                      {isEditing ? 'Modifier Membre' : 'Nouveau Membre'}
                    </DialogTitle>
                    <p className="text-white/70 text-sm">
                      {isEditing 
                        ? 'Mise à jour des informations du membre adulte.' 
                        : 'Enregistrement complet d\'un membre adulte dans le ministère.'}
                    </p>
                  </div>
                </div>
              </DialogHeader>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-10 bg-slate-50/30">
                {/* 1. Informations personnelles */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <User className="w-5 h-5 text-church-green" />
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center justify-between w-full">
                      <span>1. Informations personnelles</span>
                      {isEditing && form.getValues('matricule') && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Matricule:</span>
                          <span className="text-[11px] font-mono font-bold text-slate-900">{form.getValues('matricule')}</span>
                        </div>
                      )}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Saisir le nom" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Saisir le prénom" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control as any}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexe *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-slate-200">
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M">Homme</SelectItem>
                              <SelectItem value="F">Femme</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de naissance</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Âge (auto-calculé)</FormLabel>
                      <div className="h-10 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-slate-500 font-bold flex items-center">
                        {calculateAge(form.watch('birthDate')) !== null ? `${calculateAge(form.watch('birthDate'))} ans` : '--'}
                      </div>
                    </FormItem>
                  </div>
                  <FormField
                    control={form.control as any}
                    name="photoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo (upload)</FormLabel>
                        <FormControl>
                          <div 
                            onClick={() => document.getElementById('photo-upload')?.click()}
                            className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-church-green/10 transition-colors overflow-hidden">
                              {field.value ? (
                                <img src={field.value} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-slate-400 group-hover:text-church-green" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">
                                {field.value ? 'Photo prête' : 'Cliquer pour uploader'}
                              </p>
                              <p className="text-[10px] text-slate-500">PNG, JPG jusqu'à 2MB</p>
                            </div>
                            <input 
                              id="photo-upload" 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'photoUrl')} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 2. Coordonnées */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <PhoneCall className="w-5 h-5 text-church-green" />
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">2. Coordonnées</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone principal *</FormLabel>
                          <FormControl>
                            <Input placeholder="+225 00 00 00 00 00" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="phone2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone secondaire</FormLabel>
                          <FormControl>
                            <Input placeholder="+225 00 00 00 00 00" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemple.com" {...field} className="bg-white border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse complète</FormLabel>
                        <FormControl>
                          <Input placeholder="Rue, Bâtiment, Porte..." {...field} className="bg-white border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input placeholder="Abidjan" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quartier</FormLabel>
                          <FormControl>
                            <Input placeholder="Cocody" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 3. Informations familiales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Users className="w-5 h-5 text-church-green" />
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">3. Informations familiales</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Situation matrimoniale</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-slate-200">
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single">Célibataire</SelectItem>
                              <SelectItem value="married">Marié(e)</SelectItem>
                              <SelectItem value="widowed">Veuf(ve)</SelectItem>
                              <SelectItem value="divorced">Divorcé(e)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="spouseName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du conjoint (si applicable)</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom et prénom" {...field} className="bg-white border-slate-200" disabled={form.watch('maritalStatus') === 'single'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="childrenCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre d’enfants</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-white border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="childrenDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Détails enfants (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénoms et âges..." {...field} className="bg-white border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 4. Informations professionnelles */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Briefcase className="w-5 h-5 text-church-green" />
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">4. Informations professionnelles</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Comptable" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="workplace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lieu de travail</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom de l'entreprise/quartier" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="educationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau d’étude</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Master, CAP, Bac..." {...field} className="bg-white border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 5. Informations spirituelles */}
                <div className="space-y-4 p-5 bg-church-green/5 rounded-2xl border border-church-green/10">
                  <div className="flex items-center gap-2 border-b border-church-green/20 pb-2">
                    <Flame className="w-5 h-5 text-church-green" />
                    <h3 className="font-bold text-church-green uppercase tracking-wider text-sm flex items-center gap-2">
                      5. Informations spirituelles <span className="text-[10px] bg-church-green text-white px-2 py-0.5 rounded-full font-bold">FEU</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control as any}
                      name="conversionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de conversion</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="isBaptized"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-white p-3 shadow-sm mt-8 h-10">
                          <FormLabel>Baptisé ?</FormLabel>
                          <FormControl>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={field.value} onChange={() => field.onChange(true)} className="accent-church-green" />
                                <span className="text-sm">Oui</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={!field.value} onChange={() => field.onChange(false)} className="accent-church-green" />
                                <span className="text-sm">Non</span>
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {form.watch('isBaptized') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <FormField
                        control={form.control as any}
                        name="baptismDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date du baptême</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="bg-white border-slate-200" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="baptismPlace"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lieu</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom du lieu/église" {...field} className="bg-white border-slate-200" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <FormField
                    control={form.control as any}
                    name="formerChurch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ancienne église (si nouveau venu)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'église précédente" {...field} className="bg-white border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="referredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comment avez-vous connu l’église ?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white border-slate-200">
                              <SelectValue placeholder="Choisir" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="invitation">Invitation</SelectItem>
                            <SelectItem value="social_media">Réseaux sociaux</SelectItem>
                            <SelectItem value="family">Famille</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 6. Intégration dans l’église */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Link className="w-5 h-5 text-church-green" />
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">6. Intégration dans l’église</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Département / Ministère</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-slate-200">
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="chorale">Chorale</SelectItem>
                              <SelectItem value="jeunesse">Jeunesse</SelectItem>
                              <SelectItem value="intercession">Intercession</SelectItem>
                              <SelectItem value="media">Média</SelectItem>
                              <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="engagementLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Niveau d’engagement</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-slate-200">
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new">Nouveau</SelectItem>
                              <SelectItem value="active">Membre actif</SelectItem>
                              <SelectItem value="leader">Responsable</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 7. Suivi & adhésion */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <CalendarIcon className="w-5 h-5 text-church-green" />
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">7. Suivi & adhésion</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control as any}
                      name="joinedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date d’intégration</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Statut</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-slate-200">
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new">Nouveau</SelectItem>
                              <SelectItem value="active">Actif</SelectItem>
                              <SelectItem value="inactive">Inactif</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fréquence de présence</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-slate-200">
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="regular">Régulier</SelectItem>
                              <SelectItem value="occasional">Occasionnel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 8. Informations sensibles (optionnel) */}
                <div className="space-y-4 p-5 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="flex items-center gap-2 border-b border-rose-200 pb-2">
                    <Stethoscope className="w-5 h-5 text-rose-600" />
                    <h3 className="font-bold text-rose-800 uppercase tracking-wider text-sm flex items-center gap-2">
                      8. Informations sensibles <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">ACCÈS RESTREINT</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control as any}
                      name="healthIssues"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Problèmes de santé</FormLabel>
                          <FormControl>
                            <Input placeholder="Allergies, conditions chroniques..." {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="specialNeeds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Besoins particuliers</FormLabel>
                          <FormControl>
                            <Input placeholder="Handicap, aide spécifique..." {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="pastoralFollowupNeeded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border bg-white p-4">
                        <FormControl>
                          <input 
                            type="checkbox" 
                            checked={field.value} 
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-600"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-bold text-rose-800">
                            Suivi pastoral nécessaire
                          </FormLabel>
                          <p className="text-[10px] text-slate-500">
                            Marquer ce profil comme prioritaire pour les visites pastorales.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* 9. Suivi pastoral */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <HeartHandshake className="w-5 h-5 text-church-green" />
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">9. Suivi pastoral</h3>
                  </div>
                  <FormField
                    control={form.control as any}
                    name="prayerNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Besoin de prière</FormLabel>
                        <FormControl>
                          <Input placeholder="Principaux sujets de prière..." {...field} className="bg-white border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="leaderNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes du responsable</FormLabel>
                        <FormControl>
                          <textarea 
                            className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-green"
                            placeholder="Observations, tempérament, potentiel..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="spiritualGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objectifs spirituels</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Devenir responsable, baptême, etc." {...field} className="bg-white border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 10. Personne à contacter en cas d’urgence */}
                <div className="space-y-4 p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-2 border-b border-orange-200 pb-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <h3 className="font-bold text-orange-800 uppercase tracking-wider text-sm">10. Personne à contacter en cas d’urgence</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control as any}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom et prénom" {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="emergencyContactRelation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lien (parent, ami…)</FormLabel>
                          <FormControl>
                            <Input placeholder="Frère, Epoux, Ami..." {...field} className="bg-white border-slate-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as any}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+225 00 00 00 00 00" {...field} className="bg-white border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 11. Documents (optionnel) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <FileText className="w-5 h-5 text-church-green" />
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">11. Documents (optionnel)</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div 
                      onClick={() => document.getElementById('id-card-upload')?.click()}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl bg-white hover:bg-slate-50 transition-all cursor-pointer text-center group",
                        form.watch('idCardUrl') ? "border-church-green bg-church-green/5" : "border-slate-200"
                      )}
                    >
                      {form.watch('idCardUrl') ? (
                        <CheckCircle2 className="w-6 h-6 text-church-green mb-2" />
                      ) : (
                        <FileText className="w-6 h-6 text-slate-300 mb-2 group-hover:text-church-green transition-colors" />
                      )}
                      <p className="text-[10px] font-bold text-slate-600">Pièce d'identité</p>
                      <input 
                        id="id-card-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'idCardUrl')} 
                      />
                    </div>

                    <div 
                      onClick={() => document.getElementById('baptism-upload')?.click()}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl bg-white hover:bg-slate-50 transition-all cursor-pointer text-center group",
                        form.watch('baptismCertificateUrl') ? "border-church-green bg-church-green/5" : "border-slate-200"
                      )}
                    >
                      {form.watch('baptismCertificateUrl') ? (
                        <CheckCircle2 className="w-6 h-6 text-church-green mb-2" />
                      ) : (
                        <Shield className="w-6 h-6 text-slate-300 mb-2 group-hover:text-church-green transition-colors" />
                      )}
                      <p className="text-[10px] font-bold text-slate-600">Certificat de baptême</p>
                      <input 
                        id="baptism-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'baptismCertificateUrl')} 
                      />
                    </div>

                    <div 
                      onClick={() => document.getElementById('others-upload')?.click()}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl bg-white hover:bg-slate-50 transition-all cursor-pointer text-center group",
                        (form.watch('otherDocs')?.length || 0) > 0 ? "border-church-green bg-church-green/5" : "border-slate-200"
                      )}
                    >
                      {(form.watch('otherDocs')?.length || 0) > 0 ? (
                        <div className="flex items-center gap-1 mb-2">
                          <CheckCircle2 className="w-6 h-6 text-church-green" />
                          <span className="text-[10px] font-bold text-church-green">({form.watch('otherDocs')?.length || 0})</span>
                        </div>
                      ) : (
                        <Plus className="w-6 h-6 text-slate-300 mb-2 group-hover:text-church-green transition-colors" />
                      )}
                      <p className="text-[10px] font-bold text-slate-600">Autres (CV, diplômes...)</p>
                      <input 
                        id="others-upload" 
                        type="file" 
                        className="hidden" 
                        multiple
                        onChange={(e) => handleFileUpload(e, 'otherDocs')} 
                      />
                    </div>
                  </div>
                  {(form.watch('otherDocs')?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch('otherDocs')?.map((doc: any, i: number) => (
                        <Badge key={i} variant="secondary" className="text-[9px] bg-slate-100 flex items-center gap-1">
                          {doc.name}
                          <XCircle 
                            className="w-3 h-3 cursor-pointer hover:text-rose-500" 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newDocs = [...form.getValues('otherDocs')];
                              newDocs.splice(i, 1);
                              form.setValue('otherDocs', newDocs);
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* 12. Validation */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 -mx-6 -mb-6 flex flex-col sm:flex-row gap-3 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-church-green hover:bg-church-green/90 h-12 text-base font-bold shadow-lg shadow-church-green/20"
                    onClick={() => setShouldCloseAfterSubmit(true)}
                  >
                    Enregistrer le membre
                  </Button>
                  <Button 
                    type="submit" 
                    variant="outline" 
                    className="flex-1 border-church-green text-church-green hover:bg-church-green/5 h-12 text-base font-bold"
                    onClick={() => setShouldCloseAfterSubmit(false)}
                  >
                    Enregistrer & ajouter un autre
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="sm:w-auto h-12 text-slate-500"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Total Adultes</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-green-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Actifs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-red-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <div className="w-3 h-3 rounded-full bg-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Inactifs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.inactive}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-church-gold/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-church-gold/20 rounded-xl">
                <UserPlus className="w-6 h-6 text-church-gold" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Nouveaux (Mois)</p>
                <p className="text-2xl font-bold text-slate-900">{stats.newThisMonth}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white border border-slate-100 relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-church-gold" /> Notifications & Alertes
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100/50 border border-slate-200/50">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            <AnimatePresence mode="popLayout">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <motion.div 
                    key={notif.id}
                    layout
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className={cn("p-2 rounded-lg shrink-0", notif.color.split(' ')[0])}>
                      <notif.icon className={cn("w-3 h-3", notif.color.split(' ')[1])} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900">{notif.title}</p>
                      <p className="text-[10px] text-slate-500">{notif.description}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[11px] text-slate-400 italic">Aucune alerte active</p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
            <Activity className="w-24 h-24" />
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-6">
          <TabsTrigger value="active" className="rounded-md">Membres Actifs</TabsTrigger>
          <TabsTrigger value="archives" className="rounded-md flex items-center gap-2">
            Archives
            {members.filter(m => m.status === 'archived').length > 0 && (
              <span className="bg-slate-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {members.filter(m => m.status === 'archived').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-0">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3 text-slate-500 font-medium">
              Liste des membres actifs et engagement spirituel.
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Rechercher par nom, téléphone ou matricule..." 
                    className="pl-10 h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={filterGender} onValueChange={setFilterGender}>
                    <SelectTrigger className="w-[130px] h-10">
                      <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous Genres</SelectItem>
                      <SelectItem value="M">Hommes</SelectItem>
                      <SelectItem value="F">Femmes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[130px] h-10">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous Statuts</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="suspended">Suspendus</SelectItem>
                      <SelectItem value="deceased">Décédés</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDept} onValueChange={setFilterDept}>
                    <SelectTrigger className="w-[160px] h-10">
                      <SelectValue placeholder="Département" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous Dépts</SelectItem>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Matricule & Membre</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                          Aucun membre trouvé.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member.id} className="cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setSelectedMemberId(member.id)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={member.photoUrl} />
                                <AvatarFallback className="bg-church-gold/20 text-church-green font-bold">
                                  {member.firstName[0]}{member.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium leading-none">{member.firstName} {member.lastName}</p>
                                <p className="text-[10px] font-mono font-bold text-church-gold mt-1">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Matricule:</span>
                                  {member.matricule || '---'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-xs text-slate-600 font-medium">
                                <Phone className="w-3 h-3 mr-1.5 text-slate-400" />
                                {member.phone}
                              </div>
                              {member.email && (
                                <div className="flex items-center text-[11px] text-slate-500">
                                  <Mail className="w-3 h-3 mr-1.5 text-slate-400" />
                                  {member.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full",
                                    member.engagementLevel === 'leader' ? "bg-church-green w-full" :
                                    member.engagementLevel === 'active' ? "bg-church-gold w-2/3" :
                                    "bg-blue-400 w-1/3"
                                  )}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                {member.engagementLevel === 'leader' ? 'Responsable' : member.engagementLevel === 'active' ? 'Membre actif' : 'Nouveau'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {member.status === 'active' && <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1 py-0 shadow-none border-none">🟢 Actif</Badge>}
                              {member.status === 'suspended' && <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1 py-0 shadow-none border-none">🟡 Suspendu</Badge>}
                              {member.status === 'deceased' && <Badge className="bg-rose-100 text-rose-700 text-[10px] px-1 py-0 shadow-none border-none">🔴 Décédé</Badge>}
                              {(member.status === 'new' || member.status === 'inactive') && <Badge className="bg-blue-50 text-blue-700 text-[10px] px-1 py-0 shadow-none border-none uppercase">{member.status}</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-church-green"
                                onClick={() => handleEdit(member)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                                onClick={() => {
                                  setMemberToArchive(member);
                                  setIsArchiveDialogOpen(true);
                                }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
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

        <TabsContent value="archives" className="mt-0">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3 text-slate-500 font-medium">
              Liste des membres archivés avec raison et date d'archivage.
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                      <TableHead>Matricule & Membre</TableHead>
                      <TableHead>Date Archive</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                          Aucun membre archivé.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member.id} className="cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setSelectedMemberId(member.id)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-white shadow-sm grayscale">
                                <AvatarImage src={member.photoUrl} />
                                <AvatarFallback className="bg-slate-200 text-slate-400 font-bold">
                                  {member.firstName[0]}{member.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-slate-900 leading-none mb-1">{member.firstName} {member.lastName}</p>
                                <p className="text-[10px] font-mono font-bold bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 inline-block">
                                  {member.matricule}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium">
                            {member.archivedAt ? format(new Date(member.archivedAt), 'dd/MM/yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] uppercase bg-slate-50 border-slate-200 text-slate-500">
                              {member.archiveReason === 'departure' ? 'Départ Volontaire' :
                               member.archiveReason === 'transfer' ? 'Transfert' :
                               member.archiveReason === 'inactivity' ? 'Inactivité' :
                               member.archiveReason === 'death' ? 'Décès' : 'Autre'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => {
                                  setMemberToReintegrate(member);
                                  setIsReintegrationDialogOpen(true);
                                }}
                              >
                                Réintégrer
                              </Button>
                            </div>
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
      </Tabs>
      
      {/* Archiving Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-serif">
              <XCircle className="w-5 h-5 text-red-500" />
              Archiver Membre
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-bold text-slate-900">{memberToArchive?.firstName} {memberToArchive?.lastName}</p>
              <p className="text-[10px] font-mono text-slate-500">{memberToArchive?.matricule}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Raison de l'archivage</label>
              <Select value={archiveForm.reason} onValueChange={(val) => setArchiveForm({...archiveForm, reason: val})}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Choisir une raison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departure">Départ Volontaire</SelectItem>
                  <SelectItem value="transfer">Transfert</SelectItem>
                  <SelectItem value="inactivity">Inactivité</SelectItem>
                  <SelectItem value="death">Décès</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Notes d'archivage</label>
              <textarea 
                className="w-full min-h-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-green"
                placeholder="Détails supplémentaires..."
                value={archiveForm.notes}
                onChange={(e) => setArchiveForm({...archiveForm, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsArchiveDialogOpen(false)}>Annuler</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleConfirmArchive}>
              Confirmer l'archivage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reintegration Dialog */}
      <Dialog open={isReintegrationDialogOpen} onOpenChange={setIsReintegrationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-church-green font-serif">
              <Activity className="w-5 h-5" />
              Réintégrer Membre
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-bold text-slate-900">{memberToReintegrate?.firstName} {memberToReintegrate?.lastName}</p>
              <p className="text-[10px] font-mono text-slate-500">Ancien Matricule: {memberToReintegrate?.matricule}</p>
              <p className="text-[10px] text-slate-500 mt-1">Archivé le : {memberToReintegrate?.archivedAt ? format(new Date(memberToReintegrate.archivedAt), 'dd/MM/yyyy') : 'N/A'}</p>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600 border-b pb-1">Mettre à jour les coordonnées</p>
              <div className="space-y-2">
                <label className="text-xs font-bold">Téléphone actuel</label>
                <Input 
                  defaultValue={memberToReintegrate?.phone}
                  onChange={e => setMemberToReintegrate(prev => prev ? {...prev, phone: e.target.value} : null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Adresse actuelle</label>
                <Input 
                  defaultValue={memberToReintegrate?.address}
                  onChange={e => setMemberToReintegrate(prev => prev ? {...prev, address: e.target.value} : null)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsReintegrationDialogOpen(false)}>Annuler</Button>
            <Button className="bg-church-green hover:bg-church-green/90" onClick={() => memberToReintegrate && handleConfirmReintegration(memberToReintegrate, { phone: memberToReintegrate.phone, address: memberToReintegrate.address })}>
              Réactiver le membre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberDetail({ member, onBack, onEdit }: { member: Member, onBack: () => void, onEdit: () => void }) {
  const { 
    pastoralNotes, 
    trainings, 
    services, 
    serviceFinances, 
    eventRegistrations,
    departmentMembers,
    departments,
    addPastoralNote,
    deletePastoralNote,
    addTraining
  } = useStore();

  const [activeTab, setActiveTab] = React.useState('infos');
  const [isAddNoteOpen, setIsAddNoteOpen] = React.useState(false);

  const memberNotes = pastoralNotes.filter(n => n.memberId === member.id);
  const memberTrainings = trainings.filter(t => t.memberId === member.id);
  const memberFinances = serviceFinances.filter(f => f.memberId === member.id);
  const memberEvents = eventRegistrations.filter(r => r.email === member.email || r.phone === member.phone);
  const memberDepts = departmentMembers.filter(dm => dm.memberId === member.id);

  const noteForm = useForm({
    defaultValues: { content: '', category: 'prayer' as const, isPrivate: true }
  });

  const onAddNote = (values: any) => {
    addPastoralNote({
      ...values,
      memberId: member.id,
      date: new Date().toISOString(),
      authorId: 'pastor-1', // Mock author
    });
    setIsAddNoteOpen(false);
    noteForm.reset();
    toast.success("Note ajoutée");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-white shadow-md">
              <AvatarImage src={member.photoUrl} />
              <AvatarFallback className="bg-church-gold/20 text-church-green text-xl font-bold">
                {member.firstName[0]}{member.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900">{member.firstName} {member.lastName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-[10px] font-mono font-bold text-church-gold bg-church-gold/5 px-2 py-0.5 rounded border border-church-gold/10">
                  <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Matricule:</span>
                  {member.matricule || '---'}
                </p>
                <Badge className={cn(
                  "font-bold text-[10px] uppercase tracking-wider shadow-none border-none",
                  member.status === 'active' ? "bg-emerald-100 text-emerald-700" : 
                  member.status === 'suspended' ? "bg-amber-100 text-amber-700" :
                  member.status === 'archived' ? "bg-slate-100 text-slate-700" :
                  member.status === 'deceased' ? "bg-rose-100 text-rose-700" :
                  "bg-slate-100 text-slate-700"
                )}>
                  {member.status === 'active' ? '🟢 Actif' : 
                   member.status === 'suspended' ? '🟡 Suspendu' : 
                   member.status === 'archived' ? '⚫ Archivé' : 
                   member.status === 'deceased' ? '🔴 Décédé' : member.status}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">Membre depuis {format(new Date(member.joinedAt), 'MMMM yyyy', { locale: fr })}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {member.status === 'archived' ? (
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                // Since this component might not have access to MemberManagement states, 
                // we should handle it or pass the handler.
                // For now, let's assume we can trigger a re-integration if needed.
                // But normally we'd do it from the list.
                // Let's just add the button for UI completeness and use a local toast or similar.
                toast.info("Veuillez utiliser l'onglet Archives pour réintégrer ce membre.");
              }}
            >
              <Activity className="w-4 h-4 mr-2" /> Réintégrer
            </Button>
          ) : (
            <>
              <Button variant="outline" className="border-church-green text-church-green hover:bg-church-green/5">
                <Mail className="w-4 h-4 mr-2" /> Message
              </Button>
              <Button className="bg-church-green" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" /> Modifier
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Quick Info & Engagement */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Engagement Spirituel</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center py-4 bg-church-gold/5 rounded-2xl border border-church-gold/10">
                <p className="text-xs text-church-gold font-bold uppercase mb-1">Score d'engagement</p>
                <p className="text-4xl font-serif font-bold text-slate-900">84%</p>
                <p className="text-[10px] text-green-600 font-bold mt-1">+5% ce mois</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Présence Cultes</span>
                  <span className="font-bold">12/15</span>
                </div>
                <Progress value={80} className="h-1.5" />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Participation Événements</span>
                  <span className="font-bold">3/4</span>
                </div>
                <Progress value={75} className="h-1.5" />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Départements</p>
                <div className="flex flex-wrap gap-2">
                  {memberDepts.length > 0 ? memberDepts.map(dm => {
                    const dept = departments.find(d => d.id === dm.departmentId);
                    return (
                      <Badge key={dm.id} variant="secondary" className="bg-slate-100 text-slate-700">
                        {dept?.name}
                      </Badge>
                    );
                  }) : (
                    <p className="text-xs text-slate-400 italic">Aucun département</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-purple-50/50 border border-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-2">
                <Shield className="w-3 h-3" /> Assistant Pastoral IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-purple-100 text-[11px] text-slate-600 leading-relaxed">
                <p className="font-bold text-purple-700 mb-1">Suggestion</p>
                "Ce membre a un fort potentiel de leadership. Suggérez-lui de rejoindre la formation de leadership le mois prochain."
              </div>
              <div className="p-3 bg-white rounded-xl border border-purple-100 text-[11px] text-slate-600 leading-relaxed">
                <p className="font-bold text-purple-700 mb-1">Alerte</p>
                "N'a pas assisté aux 2 derniers cultes de dimanche. Un appel de courtoisie serait bénéfique."
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white p-1 border border-slate-100 h-12">
              <TabsTrigger value="infos" className="data-[state=active]:bg-slate-50">
                <UserPlus className="w-4 h-4 mr-2" /> Infos
              </TabsTrigger>
              <TabsTrigger value="activities" className="data-[state=active]:bg-slate-50">
                <BarChart3 className="w-4 h-4 mr-2" /> Activités
              </TabsTrigger>
              <TabsTrigger value="spirituel" className="data-[state=active]:bg-slate-50">
                <HeartHandshake className="w-4 h-4 mr-2" /> Spirituel
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-slate-50">
                <MessageSquare className="w-4 h-4 mr-2" /> Notes Pastorales
              </TabsTrigger>
              <TabsTrigger value="contributions" className="data-[state=active]:bg-slate-50">
                <Coins className="w-4 h-4 mr-2" /> Contributions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="infos" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Informations Personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                        <UserPlus className="w-12 h-12 text-church-gold" />
                      </div>
                      <p className="text-[10px] text-church-gold font-black uppercase tracking-[0.2em] mb-2">Matricule Officiel</p>
                      <p className="text-3xl font-mono font-black text-white tracking-tighter">
                        {member.matricule || 'NON ATTRIBUÉ'}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest leading-none italic">Plateforme Certifiée ✅</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Genre</p>
                        <p className="text-sm font-medium">{member.gender === 'M' ? 'Homme' : 'Femme'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Situation</p>
                        <p className="text-sm font-medium capitalize">{member.maritalStatus || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Profession</p>
                        <p className="text-sm font-medium">{member.profession || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Date de naissance</p>
                        <p className="text-sm font-medium">{member.birthDate ? format(new Date(member.birthDate), 'dd MMM yyyy', { locale: fr }) : 'Non spécifié'}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <p className="text-xs text-slate-400 font-bold uppercase">Adresse</p>
                      <p className="text-sm font-medium flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        {member.address || 'Non spécifiée'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Contact & Réseaux</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{member.phone}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-church-green h-8">Appeler</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{member.email || 'Pas d\'email'}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-church-green h-8">Email</Button>
                    </div>
                    <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                      <MessageSquare className="w-4 h-4 mr-2" /> Ouvrir dans WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Timeline Spirituelle & Activités</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-church-gold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-900">Adhésion à l'église</div>
                          <time className="font-serif italic text-xs text-church-gold">{format(new Date(member.joinedAt), 'dd MMM yyyy', { locale: fr })}</time>
                        </div>
                        <div className="text-slate-500 text-sm">Bienvenue dans la famille de Dieu !</div>
                      </div>
                    </div>
                    
                    {member.isBaptized && member.baptismDate && (
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-slate-900">Baptême d'eau</div>
                            <time className="font-serif italic text-xs text-church-gold">{format(new Date(member.baptismDate), 'dd MMM yyyy', { locale: fr })}</time>
                          </div>
                          <div className="text-slate-500 text-sm">Engagement public de foi.</div>
                        </div>
                      </div>
                    )}

                    {memberEvents.map((reg, i) => {
                      const event = useStore.getState().events.find(e => e.id === reg.eventId);
                      return (
                        <div key={reg.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-bold text-slate-900">Participation: {event?.name}</div>
                              <time className="font-serif italic text-xs text-church-gold">{format(new Date(reg.registeredAt), 'dd MMM yyyy', { locale: fr })}</time>
                            </div>
                            <div className="text-slate-500 text-sm">{reg.isCheckedIn ? 'Présence confirmée' : 'Inscrit'}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="spirituel" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Formations & Croissance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {memberTrainings.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 italic text-sm">
                        Aucune formation enregistrée.
                      </div>
                    ) : (
                      memberTrainings.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div>
                            <p className="font-bold text-slate-900">{t.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">
                              {t.status === 'completed' ? 'Terminé' : 'En cours'}
                            </p>
                          </div>
                          {t.status === 'completed' && <Badge className="bg-green-100 text-green-700">Certifié</Badge>}
                        </div>
                      ))
                    )}
                    <Button variant="outline" className="w-full" onClick={() => toast.info("Fonctionnalité d'ajout de formation bientôt disponible")}>
                      <Plus className="w-4 h-4 mr-2" /> Ajouter une formation
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Informations Spirituelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Date de conversion</span>
                        <span className="text-sm font-bold">{member.conversionDate ? format(new Date(member.conversionDate), 'dd MMM yyyy', { locale: fr }) : 'Non renseigné'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Baptême d'eau</span>
                        <Badge variant="outline" className={member.isBaptized ? "border-green-200 text-green-600" : "border-red-200 text-red-600"}>
                          {member.isBaptized ? 'Oui' : 'Non'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Niveau d'engagement</span>
                        <Badge className={cn(
                          "capitalize",
                          member.engagementLevel === 'leader' ? "bg-church-green text-white" :
                          member.engagementLevel === 'active' ? "bg-church-gold/10 text-church-gold" :
                          "bg-blue-100 text-blue-700"
                        )}>
                          {member.engagementLevel === 'leader' ? 'Responsable' : member.engagementLevel === 'active' ? 'Membre actif' : 'Nouveau'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Notes Pastorales & Suivi</h3>
                <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                  <DialogTrigger render={
                    <Button className="bg-church-green">
                      <Plus className="w-4 h-4 mr-2" /> Nouvelle Note
                    </Button>
                  } />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une note pastorale</DialogTitle>
                    </DialogHeader>
                    <Form {...noteForm}>
                      <form onSubmit={noteForm.handleSubmit(onAddNote)} className="space-y-4 py-4">
                        <FormField
                          control={noteForm.control as any}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Catégorie</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Catégorie" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="prayer">Sujet de Prière</SelectItem>
                                  <SelectItem value="counseling">Conseil / Entretien</SelectItem>
                                  <SelectItem value="visit">Visite à domicile</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={noteForm.control as any}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contenu</FormLabel>
                              <FormControl>
                                <textarea 
                                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Détails de l'entretien ou du besoin..."
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={noteForm.control as any}
                          name="isPrivate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Note Privée</FormLabel>
                                <p className="text-[10px] text-slate-500">Visible uniquement par les pasteurs.</p>
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
                        <Button type="submit" className="w-full bg-church-green">Enregistrer la note</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {memberNotes.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 italic">Aucune note pastorale pour le moment.</p>
                  </div>
                ) : (
                  memberNotes.slice().reverse().map(note => (
                    <Card key={note.id} className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <Badge className={cn(
                              "capitalize font-bold text-[10px]",
                              note.category === 'prayer' ? "bg-blue-100 text-blue-700" :
                              note.category === 'counseling' ? "bg-purple-100 text-purple-700" :
                              "bg-orange-100 text-orange-700"
                            )}>
                              {note.category === 'prayer' ? 'Prière' : note.category === 'counseling' ? 'Conseil' : note.category === 'visit' ? 'Visite' : 'Autre'}
                            </Badge>
                            {note.isPrivate && <Shield className="w-3 h-3 text-red-400" />}
                          </div>
                          <time className="text-xs text-slate-400">{format(new Date(note.date), 'dd MMM yyyy HH:mm', { locale: fr })}</time>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{note.content}</p>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Auteur: Pasteur Principal</span>
                          <Button variant="ghost" size="sm" className="h-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deletePastoralNote(note.id)}>
                            Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="contributions" className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Historique des Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {memberFinances.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-32 text-center text-slate-400 italic">
                              Aucune contribution enregistrée.
                            </TableCell>
                          </TableRow>
                        ) : (
                          memberFinances.map(f => (
                            <TableRow key={f.id}>
                              <TableCell className="text-sm text-slate-500">
                                {format(new Date(), 'dd MMM yyyy')} {/* Mock date as serviceFinance doesn't have it yet */}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {f.type === 'tithe' ? 'Dîme' : f.type === 'offering' ? 'Offrande' : 'Don'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-bold text-green-600">
                                {f.amount.toLocaleString()} FCFA
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Re-exporting necessary icons that might be missing in imports
