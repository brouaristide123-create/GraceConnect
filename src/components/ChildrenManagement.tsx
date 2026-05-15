import React from 'react';
import { 
  Baby, 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  XCircle,
  QrCode,
  ShieldCheck,
  LayoutGrid,
  BookOpen,
  Award,
  MessageSquare,
  Settings,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  UserCheck,
  UserMinus,
  Filter,
  BarChart3,
  Heart,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  GraduationCap,
  DoorOpen,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useStore, Child, ChildCheckIn, ChildClass, ChildLesson, ChildReport } from '../lib/store';
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
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from './ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format, differenceInYears, isSameDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
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
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { cn } from '../lib/utils';

const childSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  gender: z.enum(['M', 'F']),
  photoUrl: z.string().optional(),
  
  // Parents
  parentId: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  mainPhone: z.string().min(8, "Le téléphone principal est requis"),
  secondaryPhone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
  address: z.string().optional(),

  // Education
  churchId: z.string().min(1, "L'église est requise"),
  ageGroup: z.enum(['0-5', '6-10', '11-15']),
  classId: z.string().optional(),
  teacherName: z.string().optional(),

  // Spiritual
  isNewAtChurch: z.boolean().default(false),
  joinedAt: z.string().optional(),
  participation: z.enum(['regular', 'occasional']).default('regular'),

  // Medical
  allergies: z.string().optional(),
  diseases: z.string().optional(),
  currentTreatment: z.string().optional(),
  specialNeeds: z.string().optional(),

  // Emergency
  emergencyContactName: z.string().min(2, "Le nom du contact d'urgence est requis"),
  emergencyContactRelation: z.string().min(2, "Le lien est requis"),
  emergencyContactPhone: z.string().min(8, "Le téléphone d'urgence est requis"),

  // Status
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().optional(),

  // Security features
  securitySettings: z.object({
    useQRCode: z.boolean().default(false),
    parentChildCode: z.string().optional(),
  }).optional(),

  // General settings
  settings: z.object({
    allowPhotosVideos: z.boolean().default(true),
    receiveNotifications: z.boolean().default(true),
  }).default({ allowPhotosVideos: true, receiveNotifications: true }),

  // Documents
  medicalCertificateUrl: z.string().optional(),
  parentalAuthorizationUrl: z.string().optional(),
  
  authorizedPickups: z.array(z.object({
    name: z.string().min(2, "Le nom est requis"),
    phone: z.string().min(8, "Le téléphone est requis"),
    relation: z.string().min(2, "Le lien est requis"),
    photoUrl: z.string().optional(),
  })).default([]),
});

type ChildFormValues = z.infer<typeof childSchema>;

const classSchema = z.object({
  name: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
  minAge: z.coerce.number().min(0, "Âge minimum invalide"),
  maxAge: z.coerce.number().min(0, "Âge maximum invalide"),
  room: z.string().min(1, "La salle est requise"),
  teacherId: z.string().min(1, "L'enseignant est requis"),
  churchId: z.string().min(1, "L'église est requise"),
});

type ClassFormValues = z.infer<typeof classSchema>;

function ChildDetail({ child, onClose }: { child: Child; onClose: () => void }) {
  const { 
    members, 
    churches, 
    childCheckIns, 
    childClasses, 
    childLessons, 
    childReports,
    addChildCheckIn,
    updateChildCheckIn,
    addChildReport,
    updateChildPoints,
    addChildBadge
  } = useStore();

  const linkedParent = members.find(m => m.id === child.parentId);
  const church = churches.find(c => c.id === child.churchId);
  const childClass = childClasses.find(c => c.id === child.classId);
  const checkIns = childCheckIns.filter(c => c.childId === child.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const reports = childReports.filter(r => r.childId === child.id).sort((a, b) => b.month.localeCompare(a.month));
  
  const age = differenceInYears(new Date(), new Date(child.birthDate));
  const todayCheckIn = childCheckIns.find(c => c.childId === child.id && isSameDay(new Date(c.date), new Date()));

  const handleCheckIn = () => {
    if (todayCheckIn) {
      updateChildCheckIn(todayCheckIn.id, { 
        checkOutTime: new Date().toISOString(),
        status: 'checked_out',
        checkedOutBy: linkedParent ? `${linkedParent.firstName} ${linkedParent.lastName}` : 'Parent'
      });
      toast.success("Check-out effectué");
    } else {
      addChildCheckIn({
        childId: child.id,
        date: new Date().toISOString(),
        checkInTime: new Date().toISOString(),
        status: 'present',
        checkedInBy: linkedParent ? `${linkedParent.firstName} ${linkedParent.lastName}` : 'Parent'
      });
      updateChildPoints(child.id, 10); // Reward for presence
      toast.success("Check-in effectué (+10 points)");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white border-b border-slate-100 z-10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XCircle className="w-6 h-6 text-slate-400" />
            </Button>
            <h2 className="text-xl font-bold text-slate-900">Profil de l'enfant</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleCheckIn}
              className={cn(
                "font-bold",
                todayCheckIn?.status === 'present' ? "bg-red-500 hover:bg-red-600" : "bg-church-green hover:bg-church-green/90"
              )}
            >
              {todayCheckIn?.status === 'present' ? (
                <><UserMinus className="w-4 h-4 mr-2" /> Check-out</>
              ) : (
                <><UserCheck className="w-4 h-4 mr-2" /> Check-in</>
              )}
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={child.photoUrl} />
              <AvatarFallback className={cn("text-2xl font-bold", child.gender === 'M' ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600")}>
                {child.firstName[0]}{child.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{child.firstName} {child.lastName}</h1>
                <Badge variant="outline" className="bg-slate-50">{age} ans</Badge>
                {todayCheckIn?.status === 'present' && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 uppercase text-[10px] tracking-widest px-2 py-0.5">Présent</Badge>
                )}
              </div>
              <p className="text-[10px] font-mono font-bold text-church-gold mb-2">
                <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Matricule:</span>
                {child.matricule || '---'}
              </p>
              <p className="text-slate-500 flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-church-gold" /> {church?.name} • {childClass?.name || 'Sans classe'}
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-church-gold/10 text-church-gold rounded-full text-xs font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" /> {child.points} Points
                </div>
                {child.badges.map(badge => (
                  <div key={badge} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                    {badge}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center gap-2">
              <QrCode className="w-16 h-16 text-slate-900" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Badge Numérique</span>
            </div>
          </div>

          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="infos" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Infos</TabsTrigger>
              <TabsTrigger value="presence" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Présence</TabsTrigger>
              <TabsTrigger value="parents" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Famille</TabsTrigger>
              <TabsTrigger value="medical" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Médical</TabsTrigger>
              <TabsTrigger value="progression" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Progrès</TabsTrigger>
            </TabsList>

            <TabsContent value="infos" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-none bg-slate-50/50">
                  <CardContent className="p-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-200 pb-2">Informations Personnelles</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold uppercase text-[10px]">Matricule</span>
                        <span className="font-mono font-bold text-church-gold">{child.matricule || '---'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Date de naissance</span>
                        <span className="font-medium">{format(new Date(child.birthDate), 'dd MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Sexe</span>
                        <span className="font-medium">{child.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Groupe d'âge</span>
                        <span className="font-medium">{child.ageGroup} ans</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Inscrit le</span>
                        <span className="font-medium">{format(new Date(child.joinedAt), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none bg-slate-50/50">
                  <CardContent className="p-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-200 pb-2">Informations Spirituelles</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Nouveau ?</span>
                        <span className="font-medium">{child.isNewAtChurch ? 'Oui' : 'Non'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Participation</span>
                        <Badge variant="outline" className="capitalize">{child.participation === 'regular' ? 'Régulier' : 'Occasionnel'}</Badge>
                      </div>
                      {child.teacherName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Moniteur</span>
                          <span className="font-medium">{child.teacherName}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none bg-indigo-50/50">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-indigo-900 uppercase mb-3 border-b border-indigo-100 pb-2 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" /> Personnes autorisées à récupérer l'enfant
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {child.authorizedPickups.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-indigo-100 shadow-sm">
                        <Avatar className="w-10 h-10 border border-slate-100">
                          <AvatarImage src={p.photoUrl} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px] font-bold">
                            {p.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{p.relation} • {p.phone}</p>
                        </div>
                      </div>
                    ))}
                    {child.authorizedPickups.length === 0 && (
                      <p className="text-xs text-slate-400 italic col-span-2">Aucune personne autorisée spécifiée</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {child.notes && (
                <Card className="border-none bg-slate-50/50">
                  <CardContent className="p-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Observations & Notes</h3>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{child.notes}"</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="presence" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-none bg-green-50/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{checkIns.length}</p>
                    <p className="text-[10px] font-bold text-green-700 uppercase">Présences totales</p>
                  </CardContent>
                </Card>
                <Card className="border-none bg-blue-50/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">85%</p>
                    <p className="text-[10px] font-bold text-blue-700 uppercase">Taux de présence</p>
                  </CardContent>
                </Card>
                <Card className="border-none bg-purple-50/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{child.status === 'active' ? 'Régulier' : 'Inactif'}</p>
                    <p className="text-[10px] font-bold text-purple-700 uppercase">Statut</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Historique récent</h3>
                {checkIns.map(ci => (
                  <div key={ci.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", ci.status === 'present' ? "bg-green-100" : "bg-slate-100")}>
                        <CalendarIcon className={cn("w-4 h-4", ci.status === 'present' ? "text-green-600" : "text-slate-600")} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{format(new Date(ci.date), 'dd MMMM yyyy', { locale: fr })}</p>
                        <p className="text-[10px] text-slate-500">Arrivée: {format(new Date(ci.checkInTime), 'HH:mm')} par {ci.checkedInBy}</p>
                      </div>
                    </div>
                    {ci.checkOutTime && (
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Sortie</p>
                        <p className="text-xs font-medium text-slate-700">{format(new Date(ci.checkOutTime), 'HH:mm')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="parents" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-none bg-slate-50/50">
                  <CardContent className="p-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-200 pb-2">Informations des Parents</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Père</span>
                        <span className="font-medium">{child.fatherName || 'Non renseigné'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Mère</span>
                        <span className="font-medium">{child.motherName || 'Non renseigné'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tél. Principal</span>
                        <span className="font-medium text-church-green font-bold">{child.mainPhone}</span>
                      </div>
                      {child.secondaryPhone && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Tél. Secondaire</span>
                          <span className="font-medium">{child.secondaryPhone}</span>
                        </div>
                      )}
                      {child.email && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Email</span>
                          <span className="font-medium">{child.email}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none bg-rose-50/50">
                  <CardContent className="p-4">
                    <h3 className="text-xs font-bold text-rose-900 uppercase mb-3 border-b border-rose-200 pb-2 flex items-center gap-2">
                       <AlertCircle className="w-3 h-3" /> Contact d'urgence
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900">{child.emergencyContactName}</p>
                      <p className="text-xs text-slate-500">{child.emergencyContactRelation}</p>
                      <p className="text-base font-bold text-rose-600">{child.emergencyContactPhone}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {linkedParent && (
                <Card className="border-none bg-white border border-slate-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase">Membre Adulte Lié</h3>
                      <Badge className="bg-church-gold">Parent</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={linkedParent.photoUrl} />
                        <AvatarFallback>{linkedParent.firstName[0]}{linkedParent.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{linkedParent.firstName} {linkedParent.lastName}</p>
                        <p className="text-xs text-slate-500">{linkedParent.phone} • {linkedParent.email}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-8">Voir Profil</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="medical" className="space-y-6">
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mb-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-200">
                  <div className="p-3 bg-red-600 rounded-xl text-white">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Dossier Médical Confidentiel</h3>
                    <p className="text-xs text-red-700">Ces informations sont strictement réservées aux responsables autorisés.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-red-800 uppercase mb-1">Allergies connues</p>
                    <p className={cn("text-sm font-bold", child.allergies ? "text-red-700" : "text-slate-400 italic")}>
                      {child.allergies || "Aucune allergie signalée"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-800 uppercase mb-1">Maladies / Pathologies</p>
                    <p className={cn("text-sm font-bold", child.diseases ? "text-red-700" : "text-slate-400 italic")}>
                      {child.diseases || "Aucune pathologie signalée"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-800 uppercase mb-1">Traitement en cours</p>
                    <p className={cn("text-sm font-bold", child.currentTreatment ? "text-slate-700" : "text-slate-400 italic")}>
                      {child.currentTreatment || "Pas de traitement"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-800 uppercase mb-1">Besoins spécifiques</p>
                    <p className={cn("text-sm font-bold", child.specialNeeds ? "text-slate-700" : "text-slate-400 italic")}>
                      {child.specialNeeds || "Aucun besoin spécifique"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="border-slate-200 text-slate-600 h-12">
                  <FileText className="w-4 h-4 mr-2" /> Certificat Médical
                </Button>
                <Button variant="outline" className="border-slate-200 text-slate-600 h-12">
                  <FileText className="w-4 h-4 mr-2" /> Autorisation Parentale
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="progression" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none bg-slate-50/50">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Suivi Pédagogique</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Participation</span>
                          <span className="font-bold text-church-green">Excellent</span>
                        </div>
                        <Progress value={90} className="h-1.5 bg-slate-200" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Comportement</span>
                          <span className="font-bold text-blue-600">Très Bien</span>
                        </div>
                        <Progress value={80} className="h-1.5 bg-slate-200" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Mémorisation</span>
                          <span className="font-bold text-church-gold">Bien</span>
                        </div>
                        <Progress value={70} className="h-1.5 bg-slate-200" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none bg-slate-50/50">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Dernier Rapport</h3>
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "L'enfant est très attentif pendant les leçons. Il participe activement aux jeux et mémorise bien ses versets. Il continue de progresser de manière régulière."
                      </p>
                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Moniteur responsable</p>
                        <p className="text-xs font-medium text-slate-700">{child.teacherName || 'Responsable de classe'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4 shadow-sm">
                <div className="p-3 bg-blue-600 rounded-xl text-white">
                  <Star className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-blue-900 mb-1">Assistant Intelligent (IA)</h3>
                  <p className="text-xs text-blue-700 leading-relaxed mb-3">
                    D'après les observations, {child.firstName} montre un fort potentiel pour le leadership. Envisagez de lui confier des petites responsabilités lors des prochains ateliers.
                  </p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">Appliquer la suggestion</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export function ChildrenManagement() {
  const { 
    children, 
    members, 
    churches, 
    childClasses, 
    childCheckIns, 
    addChild, 
    deleteChild,
    addChildClass,
    updateChildClass,
    deleteChildClass 
  } = useStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isClassesDialogOpen, setIsClassesDialogOpen] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState<ChildClass | null>(null);
  const [isClassFormOpen, setIsClassFormOpen] = React.useState(false);
  const [selectedChild, setSelectedChild] = React.useState<Child | null>(null);
  const [filterAge, setFilterAge] = React.useState<string>('all');

  const [shouldCloseAfterSubmit, setShouldCloseAfterSubmit] = React.useState(true);

  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'M',
      parentId: '',
      fatherName: '',
      motherName: '',
      mainPhone: '',
      secondaryPhone: '',
      email: '',
      address: '',
      churchId: churches[0]?.id || '',
      ageGroup: '0-5',
      classId: '',
      teacherName: '',
      isNewAtChurch: false,
      participation: 'regular',
      allergies: '',
      diseases: '',
      currentTreatment: '',
      specialNeeds: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactPhone: '',
      status: 'active',
      notes: '',
      medicalCertificateUrl: '',
      parentalAuthorizationUrl: '',
      photoUrl: '',
      securitySettings: {
        useQRCode: false,
        parentChildCode: '',
      },
      settings: {
        allowPhotosVideos: true,
        receiveNotifications: true,
      },
      authorizedPickups: [],
    },
  });

  const classForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: {
      name: '',
      minAge: 0,
      maxAge: 5,
      room: '',
      teacherId: '',
      churchId: churches[0]?.id || '',
    },
  });

  // Auto-fill parent info when a member is selected
  const selectedParentId = form.watch('parentId');
  React.useEffect(() => {
    if (selectedParentId && selectedParentId !== 'none') {
      const parent = members.find(m => m.id === selectedParentId);
      if (parent) {
        if (parent.gender === 'M') {
          form.setValue('fatherName', `${parent.firstName} ${parent.lastName}`);
        } else {
          form.setValue('motherName', `${parent.firstName} ${parent.lastName}`);
        }
        form.setValue('mainPhone', parent.phone);
        if (parent.email) form.setValue('email', parent.email);
        if (parent.address) form.setValue('address', parent.address);
        form.setValue('lastName', parent.lastName);
      }
    }
  }, [selectedParentId, members, form]);

  // Auto-fill teacher name when a class is selected
  const selectedClassId = form.watch('classId');
  React.useEffect(() => {
    if (selectedClassId) {
      const selectedClass = childClasses.find(c => c.id === selectedClassId);
      if (selectedClass) {
        const teacher = members.find(m => m.id === selectedClass.teacherId);
        if (teacher) {
          form.setValue('teacherName', `${teacher.firstName} ${teacher.lastName}`);
        }
      }
    }
  }, [selectedClassId, childClasses, members, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "authorizedPickups"
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: any, index?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 2MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (index !== undefined && fieldName === 'authorizedPickups') {
          const currentPickups = form.getValues('authorizedPickups');
          currentPickups[index].photoUrl = reader.result as string;
          form.setValue('authorizedPickups', currentPickups);
        } else {
          form.setValue(fieldName, reader.result as string);
        }
        toast.success(`${file.name} téléversé avec succès`);
      };
      reader.readAsDataURL(file);
    }
  };

  const onClassSubmit = (values: ClassFormValues) => {
    if (editingClass) {
      updateChildClass(editingClass.id, values);
      toast.success("Classe mise à jour avec succès");
    } else {
      addChildClass(values);
      toast.success("Classe créée avec succès");
    }
    setIsClassFormOpen(false);
    setEditingClass(null);
    classForm.reset();
  };

  const handleEditClass = (c: ChildClass) => {
    setEditingClass(c);
    classForm.reset({
      name: c.name,
      minAge: c.minAge,
      maxAge: c.maxAge,
      room: c.room,
      teacherId: c.teacherId,
      churchId: c.churchId,
    });
    setIsClassFormOpen(true);
  };

  const handleDeleteClass = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      deleteChildClass(id);
      toast.success("Classe supprimée");
    }
  };

  const onSubmit = (values: ChildFormValues) => {
    addChild({
      ...values,
      joinedAt: new Date().toISOString(),
      points: 0,
      badges: [],
      photoUrl: values.photoUrl || '',
    } as any);
    
    if (shouldCloseAfterSubmit) {
      setIsAddDialogOpen(false);
      form.reset();
    } else {
      form.reset({
        ...form.getValues(),
        firstName: '',
        lastName: '',
        birthDate: '',
        photoUrl: '',
        securitySettings: {
          ...form.getValues().securitySettings,
          parentChildCode: '',
        }
      });
    }
    toast.success("Enfant enregistré avec succès");
  };

  const filteredChildren = children.filter(c => {
    const matchesSearch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const age = differenceInYears(new Date(), new Date(c.birthDate));
    let matchesAge = true;
    if (filterAge === '0-5') matchesAge = age <= 5;
    else if (filterAge === '6-10') matchesAge = age >= 6 && age <= 10;
    else if (filterAge === '11-15') matchesAge = age >= 11 && age <= 15;
    
    return matchesSearch && matchesAge;
  });

  const stats = {
    total: children.length,
    present: childCheckIns.filter(ci => isSameDay(new Date(ci.date), new Date()) && ci.status === 'present').length,
    absent: children.length - childCheckIns.filter(ci => isSameDay(new Date(ci.date), new Date()) && ci.status === 'present').length,
    newThisMonth: children.filter(c => {
      const joined = new Date(c.joinedAt);
      return joined >= startOfMonth(new Date()) && joined <= endOfMonth(new Date());
    }).length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Département des Enfants</h1>
          <p className="text-slate-500">Gérez l'école du dimanche, la sécurité et le suivi pédagogique.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isClassesDialogOpen} onOpenChange={setIsClassesDialogOpen}>
            <DialogTrigger render={<Button variant="outline" className="border-church-gold text-church-gold hover:bg-church-gold/10" />}>
              <Settings className="w-4 h-4 mr-2" /> Gérer les Classes
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-serif">Gestion des Classes</DialogTitle>
                    <DialogDescription>Créez et organisez les groupes de l'école du dimanche.</DialogDescription>
                  </div>
                  {!isClassFormOpen && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setEditingClass(null);
                        classForm.reset({
                          name: '',
                          minAge: 0,
                          maxAge: 5,
                          room: '',
                          teacherId: '',
                          churchId: churches[0]?.id || '',
                        });
                        setIsClassFormOpen(true);
                      }}
                      className="bg-church-gold hover:bg-church-gold/90 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Ajouter
                    </Button>
                  )}
                </div>
              </DialogHeader>

              {isClassFormOpen ? (
                <Form {...classForm}>
                  <form onSubmit={classForm.handleSubmit(onClassSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={classForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de la classe</FormLabel>
                          <FormControl><Input placeholder="Ex: Les Petits Agneaux" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={classForm.control}
                        name="minAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Âge min</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={classForm.control}
                        name="maxAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Âge max</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={classForm.control}
                      name="room"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salle / Lieu</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DoorOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                              <Input className="pl-9" placeholder="Ex: Salle B2" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={classForm.control}
                      name="teacherId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moniteur Responsable</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un enseignant" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {members.filter(m => m.status === 'active').map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={classForm.control}
                      name="churchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paroisse</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la paroisse" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {churches.map(church => (
                                <SelectItem key={church.id} value={church.id}>{church.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="pt-4 gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsClassFormOpen(false)}>Annuler</Button>
                      <Button type="submit" className="bg-church-gold hover:bg-church-gold/90 text-white">
                        {editingClass ? "Mettre à jour" : "Créer la classe"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              ) : (
                <div className="py-4 space-y-3">
                  {childClasses.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">Aucune classe n'a encore été créée.</p>
                      <Button variant="link" onClick={() => setIsClassFormOpen(true)} className="text-church-gold mt-2">Créer la première classe</Button>
                    </div>
                  ) : (
                    childClasses.map(c => {
                      const teacher = members.find(m => m.id === c.teacherId);
                      const childrenInClass = children.filter(child => child.classId === c.id).length;
                      return (
                        <div key={c.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between group hover:border-church-gold/30 transition-all">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-church-gold">
                              <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 leading-tight">{c.name}</h4>
                              <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-1 uppercase font-bold tracking-wider">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.minAge}-{c.maxAge} ans</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.room}</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {childrenInClass} enfants</span>
                              </p>
                              {teacher && (
                                <p className="text-xs text-slate-600 mt-2 font-medium italic">
                                  Resp: {teacher.firstName} {teacher.lastName}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEditClass(c)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDeleteClass(c.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger render={<Button className="bg-church-gold hover:bg-church-gold/90 text-white" />}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Enfant
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl font-serif">Enregistrer un enfant</DialogTitle>
                <DialogDescription>Remplissez le formulaire pour inscrire un nouvel enfant au département.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* 1. Informations de l'enfant */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Baby className="w-5 h-5 text-church-gold" />
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">1. Informations de l'enfant</h3>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom *</FormLabel>
                                <FormControl><Input placeholder="Nom" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prénom *</FormLabel>
                                <FormControl><Input placeholder="Prénom" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sexe</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Sexe" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    <SelectItem value="M">Garçon</SelectItem>
                                    <SelectItem value="F">Fille</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="birthDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date de naissance *</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {field.value && `Âge: ${differenceInYears(new Date(), new Date(field.value))} ans`}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Photo</Label>
                        <div 
                          onClick={() => document.getElementById('child-photo-upload')?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden"
                        >
                          {form.watch('photoUrl') ? (
                            <img src={form.watch('photoUrl')} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Plus className="w-6 h-6 text-slate-300" />
                              <span className="text-[10px] text-slate-400 font-bold">Upload</span>
                            </>
                          )}
                        </div>
                        <input id="child-photo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'photoUrl')} />
                      </div>
                    </div>
                  </div>

                  {/* 2. Informations des parents */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Users className="w-5 h-5 text-church-gold" />
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">2. Informations des parents</h3>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="parentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex justify-between items-center">
                            Lier à un membre existant
                            <span className="text-[10px] text-slate-400 font-normal italic">Optionnel</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Chercher un membre..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="none">Aucun (Saisie manuelle)</SelectItem>
                              {members.map(member => (
                                <SelectItem key={member.id} value={member.id}>{member.firstName} {member.lastName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du père</FormLabel>
                            <FormControl><Input placeholder="Nom complet" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de la mère</FormLabel>
                            <FormControl><Input placeholder="Nom complet" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mainPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone principal *</FormLabel>
                            <FormControl><Input placeholder="01 02 03 04 05" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="secondaryPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone secondaire</FormLabel>
                            <FormControl><Input placeholder="01 02 03 04 05" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" placeholder="parent@example.com" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse</FormLabel>
                            <FormControl><Input placeholder="Quartier, Rue..." {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* 3. Personnes autorisées */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-rose-500" />
                        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">3. Personnes autorisées à récupérer l'enfant</h3>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-church-green text-[10px] font-bold"
                        onClick={() => append({ name: '', phone: '', relation: '', photoUrl: '' })}
                      >
                        <Plus className="w-3 h-3 mr-1" /> AJOUTER
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <Card key={field.id} className="border-slate-100 bg-slate-50/50 p-4">
                          <div className="flex gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="Nom complet" {...form.register(`authorizedPickups.${index}.name` as const)} />
                                <Input placeholder="Lien (oncle, tante...)" {...form.register(`authorizedPickups.${index}.relation` as const)} />
                              </div>
                              <div className="flex gap-3">
                                <Input placeholder="Téléphone" className="flex-1" {...form.register(`authorizedPickups.${index}.phone` as const)} />
                                <Button type="button" variant="ghost" size="icon" className="text-rose-500 shrink-0" onClick={() => remove(index)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="w-16 space-y-1">
                              <div 
                                onClick={() => document.getElementById(`pickup-photo-${index}`)?.click()}
                                className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-white cursor-pointer overflow-hidden"
                              >
                                {form.watch(`authorizedPickups.${index}.photoUrl`) ? (
                                  <img src={form.watch(`authorizedPickups.${index}.photoUrl`)} className="w-full h-full object-cover" />
                                ) : (
                                  <Plus className="w-4 h-4 text-slate-300" />
                                )}
                              </div>
                              <input id={`pickup-photo-${index}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'authorizedPickups', index)} />
                              <p className="text-[8px] text-center text-slate-400 font-bold uppercase">Photo</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button variant="outline" className="w-full border-dashed text-slate-500 text-xs py-6 h-auto" type="button" onClick={() => toast.info("Scanner QR Code (Feature à venir)")}>
                        <QrCode className="w-4 h-4 mr-2" /> Scanner QR Code pour vérification
                      </Button>
                    </div>
                  </div>

                  {/* 4. Classe / Groupe */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <LayoutGrid className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">4. Classe / Groupe</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="ageGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Groupe d'âge</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="0-5">0-5 ans</SelectItem>
                                <SelectItem value="6-10">6-10 ans</SelectItem>
                                <SelectItem value="11-15">11-15 ans</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Classe (optionnel)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {childClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="teacherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enseignant / Responsable</FormLabel>
                            <FormControl><Input placeholder="Nom du moniteur" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* 5. Informations spirituelles */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Star className="w-5 h-5 text-amber-500" />
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">5. Informations spirituelles</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="isNewAtChurch"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-slate-50/50">
                            <div className="space-y-0.5">
                              <FormLabel>Nouveau à l'église ?</FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="joinedAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date d'intégration</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="participation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Participation</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="regular">Régulier</SelectItem>
                                <SelectItem value="occasional">Occasionnel</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* 6. Médical */}
                  <div className="space-y-4 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                    <div className="flex items-center gap-2 pb-2 border-b border-red-100">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-red-900 uppercase text-xs tracking-wider flex items-center gap-2">
                        6. Informations médicales <Badge variant="destructive" className="text-[8px] h-4">Accès restreint</Badge>
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-900">Allergies</FormLabel>
                            <FormControl><Input placeholder="Ex: Arachides, Pénicilline..." className="bg-white" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="diseases"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-900">Maladies (asthme, etc.)</FormLabel>
                            <FormControl><Input placeholder="Ex: Asthme, Diabète..." className="bg-white" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="currentTreatment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-900">Traitement en cours</FormLabel>
                            <FormControl><Input placeholder="Médicaments, posologie..." className="bg-white" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="specialNeeds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-red-900">Besoins particuliers</FormLabel>
                            <FormControl><Input placeholder="Handicap, régime..." className="bg-white" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* 7. Contact d'urgence */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Phone className="w-5 h-5 text-rose-500" />
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">7. Contact d'urgence</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom *</FormLabel>
                            <FormControl><Input placeholder="Nom du contact" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactRelation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lien *</FormLabel>
                            <FormControl><Input placeholder="Oncle, voisin..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone *</FormLabel>
                            <FormControl><Input placeholder="01 02 03 04 05" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* 8. Suivi & Statut */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">8. Statut</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="active">Actif</SelectItem>
                              <SelectItem value="inactive">Inactif</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 9. Notes */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <MessageSquare className="w-5 h-5 text-slate-500" />
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">9. Notes (optionnel)</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Textarea placeholder="Comportement, observations, suivi pédagogique..." className="h-24 resize-none" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 10. Documents */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <FileText className="w-5 h-5 text-slate-500" />
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">10. Documents (optionnel)</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => document.getElementById('med-cert-upload')?.click()}
                        className={cn(
                          "p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all",
                          form.watch('medicalCertificateUrl') ? "border-church-green bg-church-green/5" : "border-slate-200"
                        )}
                      >
                        {form.watch('medicalCertificateUrl') ? <CheckCircle2 className="w-6 h-6 text-church-green" /> : <Plus className="w-6 h-6 text-slate-300" />}
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Certificat médical</span>
                        <input id="med-cert-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'medicalCertificateUrl')} />
                      </div>
                      <div 
                        onClick={() => document.getElementById('parental-auth-upload')?.click()}
                        className={cn(
                          "p-4 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all",
                          form.watch('parentalAuthorizationUrl') ? "border-church-green bg-church-green/5" : "border-slate-200"
                        )}
                      >
                        {form.watch('parentalAuthorizationUrl') ? <CheckCircle2 className="w-6 h-6 text-church-green" /> : <Plus className="w-6 h-6 text-slate-300" />}
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Autorisation parentale</span>
                        <input id="parental-auth-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'parentalAuthorizationUrl')} />
                      </div>
                    </div>
                  </div>

                  {/* 11. Sécurité & Check-in */}
                  <div className="space-y-4 p-4 bg-church-gold/5 rounded-2xl border border-church-gold/20">
                    <div className="flex items-center gap-2 pb-2 border-b border-church-gold/20">
                      <ShieldCheck className="w-5 h-5 text-church-gold" />
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">11. Sécurité & Check-in</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="securitySettings.useQRCode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-church-gold/10 p-3 bg-white">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Badge / QR code enfant</FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="securitySettings.parentChildCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Code parent-enfant</FormLabel>
                            <FormControl><Input placeholder="Ex: BK-001" className="bg-white" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* 12. Paramètres */}
                  <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                      <Settings className="w-5 h-5 text-slate-400" />
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">12. Paramètres</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="settings.allowPhotosVideos"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                            <FormLabel className="text-sm">Autoriser photos/vidéos ?</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="settings.receiveNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                            <FormLabel className="text-sm">Recevoir notifications (parents)</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
                
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex flex-col md:flex-row gap-3 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-church-green hover:bg-church-green/90 h-12 text-base font-bold shadow-lg shadow-church-green/20"
                    onClick={() => setShouldCloseAfterSubmit(true)}
                  >
                    Enregistrer l'enfant
                  </Button>
                  <Button 
                    type="submit" 
                    variant="outline" 
                    className="flex-1 border-church-green text-church-green hover:bg-church-green/5 h-12 text-base font-bold"
                    onClick={() => setShouldCloseAfterSubmit(false)}
                  >
                    Enregistrer & ajouter un autre
                  </Button>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Baby className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Total Enfants</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-green-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Présents Aujourd'hui</p>
                <p className="text-2xl font-bold text-slate-900">{stats.present}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-red-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Absents</p>
                <p className="text-2xl font-bold text-slate-900">{stats.absent}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-church-gold/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-church-gold/20 rounded-xl">
                <Plus className="w-6 h-6 text-church-gold" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Nouveaux (Mois)</p>
                <p className="text-2xl font-bold text-slate-900">{stats.newThisMonth}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white border border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-church-gold" /> Répartition par âge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>0-5 ans (Petits)</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-1.5 bg-slate-100" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>6-10 ans (Moyens)</span>
                <span>35%</span>
              </div>
              <Progress value={35} className="h-1.5 bg-slate-100" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>11-15 ans (Ados)</span>
                <span>20%</span>
              </div>
              <Progress value={20} className="h-1.5 bg-slate-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Rechercher un enfant..." 
                className="pl-10 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterAge} onValueChange={setFilterAge}>
                <SelectTrigger className="w-[150px] h-10">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Tranche d'âge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les âges</SelectItem>
                  <SelectItem value="0-5">0-5 ans</SelectItem>
                  <SelectItem value="6-10">6-10 ans</SelectItem>
                  <SelectItem value="11-15">11-15 ans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredChildren.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 italic">
                Aucun enfant trouvé.
              </div>
            ) : (
              filteredChildren.map((child) => {
                const parent = members.find(m => m.id === child.parentId);
                const age = differenceInYears(new Date(), new Date(child.birthDate));
                const isPresent = childCheckIns.some(ci => ci.childId === child.id && isSameDay(new Date(ci.date), new Date()) && ci.status === 'present');
                
                return (
                  <Card 
                    key={child.id} 
                    className="group border border-slate-100 hover:border-church-gold/30 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedChild(child)}
                  >
                    {isPresent && (
                      <div className="absolute top-0 right-0 w-12 h-12">
                        <div className="absolute transform rotate-45 bg-green-500 text-white text-[8px] font-bold py-1 px-4 right-[-20px] top-[10px] w-[80px] text-center shadow-sm">
                          PRÉSENT
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Avatar className="w-20 h-20 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                          <AvatarImage src={child.photoUrl} />
                          <AvatarFallback className={cn("text-xl font-bold", child.gender === 'M' ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600")}>
                            {child.firstName[0]}{child.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-church-gold transition-colors">{child.firstName} {child.lastName}</h3>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Matricule:</span>
                            <p className="text-[10px] font-mono font-bold text-church-gold">
                              {child.matricule || '---'}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500">{age} ans • {child.gender === 'M' ? 'Garçon' : 'Fille'}</p>
                        </div>
                        <div className="w-full pt-3 border-t border-slate-50 space-y-2">
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <Users className="w-3 h-3" />
                            <span className="truncate">{parent ? `${parent.firstName} ${parent.lastName}` : 'Parent non lié'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-church-gold" />
                              <span className="text-[10px] font-bold text-slate-700">{child.points} pts</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] font-bold text-slate-700">{child.badges.length} badges</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-church-gold opacity-0 group-hover:opacity-100 transition-opacity">
                          Voir Profil <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {selectedChild && (
        <ChildDetail 
          child={selectedChild} 
          onClose={() => setSelectedChild(null)} 
        />
      )}
    </div>
  );
}
