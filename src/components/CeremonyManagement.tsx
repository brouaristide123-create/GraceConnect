import React from 'react';
import { 
  HeartHandshake, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Users, 
  MapPin, 
  MoreHorizontal, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  X,
  User,
  Church,
  ScrollText,
  Clock,
  Briefcase,
  Globe,
  Phone,
  Mail,
  Home,
  GraduationCap,
  Award,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { useStore } from '../lib/store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function CeremonyManagement() {
  const { baptisms, weddings, members, addBaptism, addWedding } = useStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isNewDialogOpen, setIsNewDialogOpen] = React.useState(false);
  const [ceremonyType, setCeremonyType] = React.useState<'none' | 'baptism' | 'wedding'>('none');
  const [step, setStep] = React.useState(1);

  // Search states for members
  const [memberSearchTerm, setMemberSearchTerm] = React.useState('');
  const [showMemberResults, setShowMemberResults] = React.useState(false);

  // Form States - Baptism
  const [baptismForm, setBaptismForm] = React.useState({
    type: 'adult' as 'child' | 'adult',
    date: '',
    location: '',
    pastor: '',
    firstName: '',
    lastName: '',
    gender: 'M' as 'M' | 'F',
    birthDate: '',
    nationality: '',
    phone: '',
    email: '',
    address: '',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    conversionDate: '',
    isTraining: false,
    trainingLevel: 'new' as 'new' | 'in_progress' | 'ready',
    spiritualLeader: '',
    godparentName: '',
    godparentPhone: '',
    godparentRelation: '',
    status: 'pending' as 'pending' | 'validated' | 'refused',
    notes: '',
  });

  // Form States - Wedding
  const [weddingForm, setWeddingForm] = React.useState({
    date: '',
    time: '',
    location: '',
    pastor: '',
    groomFirstName: '',
    groomLastName: '',
    groomBirthDate: '',
    groomNationality: '',
    groomProfession: '',
    groomPhone: '',
    groomAddress: '',
    groomStatus: 'single' as 'single' | 'divorced' | 'widowed',
    brideFirstName: '',
    brideLastName: '',
    brideBirthDate: '',
    brideNationality: '',
    brideProfession: '',
    bridePhone: '',
    brideAddress: '',
    brideStatus: 'single' as 'single' | 'divorced' | 'widowed',
    groomFatherName: '',
    groomMotherName: '',
    brideFatherName: '',
    brideMotherName: '',
    witnesses: [
      { name: '', phone: '', relation: '' },
      { name: '', phone: '', relation: '' }
    ],
    groomIsBaptized: false,
    groomIsMember: false,
    brideIsBaptized: false,
    brideIsMember: false,
    hasWeddingPrep: false,
    prepStatus: 'in_progress' as 'in_progress' | 'completed',
    status: 'pending' as 'pending' | 'validated' | 'refused',
    notes: '',
    specialInstructions: '',
  });

  const resetForms = () => {
    setCeremonyType('none');
    setStep(1);
    setIsNewDialogOpen(false);
    setMemberSearchTerm('');
    setShowMemberResults(false);
  };

  const handleSelectMember = (member: any, role: 'groom' | 'bride' | 'baptism') => {
    if (role === 'groom') {
      setWeddingForm(prev => ({
        ...prev,
        groomFirstName: member.firstName,
        groomLastName: member.lastName,
        groomBirthDate: member.birthDate || '',
        groomNationality: member.nationality || '',
        groomProfession: member.profession || '',
        groomPhone: member.phone || '',
        groomAddress: member.address || '',
        groomIsMember: true,
      }));
    } else if (role === 'bride') {
      setWeddingForm(prev => ({
        ...prev,
        brideFirstName: member.firstName,
        brideLastName: member.lastName,
        brideBirthDate: member.birthDate || '',
        brideNationality: member.nationality || '',
        brideProfession: member.profession || '',
        bridePhone: member.phone || '',
        brideAddress: member.address || '',
        brideIsMember: true,
      }));
    } else if (role === 'baptism') {
      setBaptismForm(prev => ({
        ...prev,
        firstName: member.firstName,
        lastName: member.lastName,
        gender: member.gender as 'M' | 'F' || 'M',
        birthDate: member.birthDate || '',
        nationality: member.nationality || '',
        phone: member.phone || '',
        email: member.email || '',
        address: member.address || '',
      }));
    }
    setMemberSearchTerm('');
    setShowMemberResults(false);
  };

  const filteredMembers = members.filter(m => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(memberSearchTerm.toLowerCase());
    
    if (ceremonyType === 'wedding') {
      const genderMatch = step === 1 ? m.gender === 'M' : m.gender === 'F';
      return matchesSearch && genderMatch;
    }
    
    return matchesSearch;
  });

  const filteredBaptisms = (baptisms || []).filter(b => {
    const searchLower = searchTerm.toLowerCase();
    const firstName = b.firstName || '';
    const lastName = b.lastName || '';
    const pastor = b.pastor || '';
    const location = b.location || '';
    
    return firstName.toLowerCase().includes(searchLower) || 
           lastName.toLowerCase().includes(searchLower) ||
           pastor.toLowerCase().includes(searchLower) ||
           location.toLowerCase().includes(searchLower);
  });

  const filteredWeddings = (weddings || []).filter(w => {
    const searchLower = searchTerm.toLowerCase();
    const groomFirstName = w.groomFirstName || '';
    const groomLastName = w.groomLastName || '';
    const brideFirstName = w.brideFirstName || '';
    const brideLastName = w.brideLastName || '';
    const pastor = w.pastor || '';
    const location = w.location || '';
    
    return groomFirstName.toLowerCase().includes(searchLower) || 
           groomLastName.toLowerCase().includes(searchLower) ||
           brideFirstName.toLowerCase().includes(searchLower) || 
           brideLastName.toLowerCase().includes(searchLower) ||
           pastor.toLowerCase().includes(searchLower) ||
           location.toLowerCase().includes(searchLower);
  });

  const handleCreateCeremony = () => {
    if (ceremonyType === 'baptism') {
      addBaptism({
        ...baptismForm,
        churchId: '1', // Hardcoded for demo
      });
    } else {
      addWedding({
        ...weddingForm,
        churchId: '1', // Hardcoded for demo
        prepSessions: [],
      });
    }
    resetForms();
  };

  const renderStepIndicator = (totalSteps: number, currentStep: number, stepLabels: string[]) => (
    <div className="flex items-center justify-between mb-8 px-4">
      {stepLabels.map((label, idx) => (
        <React.Fragment key={idx}>
          <div className="flex flex-col items-center gap-2 relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              currentStep > idx + 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 
              currentStep === idx + 1 ? 'border-church-gold text-church-gold font-bold bg-amber-50' : 
              'border-slate-200 text-slate-400 bg-white'
            }`}>
              {currentStep > idx + 1 ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-bold ${
              currentStep === idx + 1 ? 'text-church-gold' : 'text-slate-400'
            }`}>{label}</span>
          </div>
          {idx < totalSteps - 1 && (
            <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-all duration-500 ${
              currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Baptêmes & Mariages</h1>
          <p className="text-slate-500">Gérez les cérémonies et célébrations de l'église</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-church-gold hover:bg-church-gold/90 text-white rounded-xl shadow-lg shadow-amber-200/50"
            onClick={() => setIsNewDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Cérémonie
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="baptisms">Baptêmes</TabsTrigger>
            <TabsTrigger value="weddings">Mariages</TabsTrigger>
          </TabsList>

          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBaptisms.length === 0 && filteredWeddings.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
                  <HeartHandshake className="w-10 h-10 text-church-gold" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-serif">Aucune cérémonie trouvée</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                  Essayez de modifier vos critères de recherche ou ajoutez une nouvelle cérémonie.
                </p>
              </div>
            ) : (
              <>
                {filteredBaptisms.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <Users className="w-6 h-6 text-emerald-600" />
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Baptême</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{b.lastName} {b.firstName}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                      <Calendar className="w-4 h-4" />
                      {b.date ? format(new Date(b.date), 'dd MMMM yyyy', { locale: fr }) : 'Date non fixée'}
                    </div>
                    <div className="space-y-2 border-t pt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Statut:</span>
                        <span className={`font-bold ${
                          b.status === 'validated' ? 'text-emerald-600' : 
                          b.status === 'refused' ? 'text-rose-600' : 'text-amber-600'
                        }`}>{b.status.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Type:</span>
                        <span className="text-slate-700 font-medium">{b.type === 'child' ? 'Enfant' : 'Adulte'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredWeddings.map(w => (
                  <div key={w.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-church-gold/10 rounded-xl">
                        <HeartHandshake className="w-6 h-6 text-church-gold" />
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Mariage</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{w.groomLastName} & {w.brideLastName}</h3>
                    <p className="text-xs text-slate-400 mb-3">{w.groomFirstName} & {w.brideFirstName}</p>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                      <Calendar className="w-4 h-4" />
                      {w.date ? format(new Date(w.date), 'dd MMMM yyyy', { locale: fr }) : 'Date non fixée'}
                    </div>
                    <div className="space-y-2 border-t pt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Statut:</span>
                        <span className={`font-bold ${
                          w.status === 'validated' ? 'text-emerald-600' : 
                          w.status === 'refused' ? 'text-rose-600' : 'text-amber-600'
                        }`}>{w.status.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="baptisms" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBaptisms.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                  <Users className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-serif">Aucun baptême trouvé</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                  Essayez de modifier vos critères de recherche ou ajoutez un nouveau baptême.
                </p>
              </div>
            ) : (
              filteredBaptisms.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Baptême</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{b.lastName} {b.firstName}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    {b.date ? format(new Date(b.date), 'dd MMMM yyyy', { locale: fr }) : 'Date non fixée'}
                  </div>
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Statut:</span>
                      <span className={`font-bold ${
                        b.status === 'validated' ? 'text-emerald-600' : 
                        b.status === 'refused' ? 'text-rose-600' : 'text-amber-600'
                      }`}>{b.status.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-slate-700 font-medium">{b.type === 'child' ? 'Enfant' : 'Adulte'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="weddings" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWeddings.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
                  <HeartHandshake className="w-10 h-10 text-church-gold" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-serif">Aucun mariage trouvé</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                  Essayez de modifier vos critères de recherche ou ajoutez un nouveau mariage.
                </p>
              </div>
            ) : (
              filteredWeddings.map(w => (
                <div key={w.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-church-gold/10 rounded-xl">
                      <HeartHandshake className="w-6 h-6 text-church-gold" />
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Mariage</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{w.groomLastName} & {w.brideLastName}</h3>
                  <p className="text-xs text-slate-400 mb-3">{w.groomFirstName} & {w.brideFirstName}</p>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    {w.date ? format(new Date(w.date), 'dd MMMM yyyy', { locale: fr }) : 'Date non fixée'}
                  </div>
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Statut:</span>
                      <span className={`font-bold ${
                        w.status === 'validated' ? 'text-emerald-600' : 
                        w.status === 'refused' ? 'text-rose-600' : 'text-amber-600'
                      }`}>{w.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isNewDialogOpen} onOpenChange={(open) => !open && resetForms()}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 border-none bg-slate-50 rounded-3xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 bg-white border-b shrink-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl font-serif">
                {ceremonyType === 'none' ? 'Nouvelle Cérémonie' : 
                 ceremonyType === 'baptism' ? '🧾 FORMULAIRE : BAPTÊME' : '💒 FORMULAIRE : MARIAGE RELIGIEUX'}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={resetForms} className="rounded-full h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {ceremonyType === 'none' ? (
              <div className="space-y-6 py-12">
                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-lg font-bold text-slate-900">Que souhaitez-vous préparer ?</h3>
                  <p className="text-sm text-slate-500">Sélectionnez le type de cérémonie pour commencer le formulaire</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setCeremonyType('baptism')}
                    className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-church-gold hover:bg-amber-50 transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-10 h-10 text-emerald-600" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 font-serif">Baptême</span>
                    <p className="text-xs text-slate-400 mt-2 text-center">Préparer une cérémonie de baptême pour un enfant ou un adulte</p>
                  </button>
                  <button 
                    onClick={() => setCeremonyType('wedding')}
                    className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-church-gold hover:bg-amber-50 transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="w-20 h-20 bg-church-gold/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <HeartHandshake className="w-10 h-10 text-church-gold" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 font-serif">Mariage</span>
                    <p className="text-xs text-slate-400 mt-2 text-center">Organiser une célébration de mariage religieux</p>
                  </button>
                </div>
              </div>
            ) : ceremonyType === 'baptism' ? (
              <div className="space-y-8 animate-in slide-in-from-right duration-300">
                {renderStepIndicator(3, step, ['Infos perso', 'Spirituel', 'Validation'])}
                
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <Church className="w-4 h-4" /> ⛪ 1. Informations générales
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-full">
                          <Label>Type de baptême</Label>
                          <div className="flex gap-4 mt-2">
                            <Button 
                              variant={baptismForm.type === 'child' ? 'default' : 'outline'}
                              className={baptismForm.type === 'child' ? 'bg-church-gold hover:bg-church-gold/90' : ''}
                              onClick={() => setBaptismForm({ ...baptismForm, type: 'child' })}
                            >Enfant</Button>
                            <Button 
                              variant={baptismForm.type === 'adult' ? 'default' : 'outline'}
                              className={baptismForm.type === 'adult' ? 'bg-church-gold hover:bg-church-gold/90' : ''}
                              onClick={() => setBaptismForm({ ...baptismForm, type: 'adult' })}
                            >Adulte</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Date prévue *</Label>
                          <Input type="date" value={baptismForm.date} onChange={(e) => setBaptismForm({ ...baptismForm, date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Lieu *</Label>
                          <Input placeholder="Localisation" value={baptismForm.location} onChange={(e) => setBaptismForm({ ...baptismForm, location: e.target.value })} />
                        </div>
                        <div className="col-span-full space-y-2">
                          <Label>Célébrant (Pasteur) *</Label>
                          <Input placeholder="Nom du pasteur" value={baptismForm.pastor} onChange={(e) => setBaptismForm({ ...baptismForm, pastor: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <User className="w-4 h-4" /> 👤 2. Informations du candidat
                      </h4>
                      
                      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 mb-4">
                        <Label className="text-church-gold mb-2 block">🔎 Rechercher ou sélectionner un membre existant</Label>
                        <div className="relative">
                          <Input 
                            placeholder="Entrez le nom ou prénom du membre..." 
                            value={memberSearchTerm}
                            onChange={(e) => {
                              setMemberSearchTerm(e.target.value);
                              setShowMemberResults(true);
                            }}
                            className="pl-10 bg-white"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          
                          {showMemberResults && memberSearchTerm.length > 0 && (
                            <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden">
                              {filteredMembers.length > 0 ? (
                                filteredMembers.map(m => (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => handleSelectMember(m, 'baptism')}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-0"
                                  >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                      m.gender === 'F' ? 'bg-pink-50 text-pink-600' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {m.firstName[0]}{m.lastName[0]}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-900">{m.firstName} {m.lastName}</p>
                                      <p className="text-[10px] text-slate-400">{m.phone || 'Pas de téléphone'}</p>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-sm text-slate-500">Aucun membre trouvé</div>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">
                          Sélectionner un membre remplira automatiquement les champs ci-dessous.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom *</Label>
                          <Input value={baptismForm.lastName} onChange={(e) => setBaptismForm({ ...baptismForm, lastName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Prénom(s) *</Label>
                          <Input value={baptismForm.firstName} onChange={(e) => setBaptismForm({ ...baptismForm, firstName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Sexe</Label>
                          <Select value={baptismForm.gender} onValueChange={(v: 'M' | 'F') => setBaptismForm({ ...baptismForm, gender: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="M">Masculin</SelectItem>
                              <SelectItem value="F">Féminin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Date de naissance *</Label>
                          <div className="flex gap-2">
                            <Input type="date" value={baptismForm.birthDate} onChange={(e) => setBaptismForm({ ...baptismForm, birthDate: e.target.value })} />
                            <div className="w-16 bg-slate-50 border rounded-md flex items-center justify-center text-xs font-bold text-slate-500">
                              {calculateAge(baptismForm.birthDate)} ans
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Nationalité</Label>
                          <Input value={baptismForm.nationality} onChange={(e) => setBaptismForm({ ...baptismForm, nationality: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input value={baptismForm.phone} onChange={(e) => setBaptismForm({ ...baptismForm, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" value={baptismForm.email} onChange={(e) => setBaptismForm({ ...baptismForm, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Adresse</Label>
                          <Input value={baptismForm.address} onChange={(e) => setBaptismForm({ ...baptismForm, address: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    {baptismForm.type === 'child' && (
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                          <Users className="w-4 h-4" /> 👨‍👩‍👧‍👦 3. Informations familiales
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nom du père</Label>
                            <Input value={baptismForm.fatherName} onChange={(e) => setBaptismForm({ ...baptismForm, fatherName: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Nom de la mère</Label>
                            <Input value={baptismForm.motherName} onChange={(e) => setBaptismForm({ ...baptismForm, motherName: e.target.value })} />
                          </div>
                          <div className="col-span-full space-y-2">
                            <Label>Téléphone parent *</Label>
                            <Input value={baptismForm.parentPhone} onChange={(e) => setBaptismForm({ ...baptismForm, parentPhone: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <ScrollText className="w-4 h-4" /> 🙏 4. Informations spirituelles
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date de conversion</Label>
                          <Input type="date" value={baptismForm.conversionDate} onChange={(e) => setBaptismForm({ ...baptismForm, conversionDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Suit-il une formation ?</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Checkbox checked={baptismForm.isTraining} onCheckedChange={(c: boolean) => setBaptismForm({ ...baptismForm, isTraining: c })} />
                            <span>Oui</span>
                          </div>
                        </div>
                        {baptismForm.isTraining && (
                          <div className="space-y-2">
                            <Label>Niveau :</Label>
                            <Select value={baptismForm.trainingLevel} onValueChange={(v: any) => setBaptismForm({ ...baptismForm, trainingLevel: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">Nouveau</SelectItem>
                                <SelectItem value="in_progress">En formation</SelectItem>
                                <SelectItem value="ready">Prêt pour baptême</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Responsable spirituel</Label>
                          <Input value={baptismForm.spiritualLeader} onChange={(e) => setBaptismForm({ ...baptismForm, spiritualLeader: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <Users className="w-4 h-4" /> 🧑‍🤝‍🧑 5. Parrain / Marraine
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom</Label>
                          <Input value={baptismForm.godparentName} onChange={(e) => setBaptismForm({ ...baptismForm, godparentName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input value={baptismForm.godparentPhone} onChange={(e) => setBaptismForm({ ...baptismForm, godparentPhone: e.target.value })} />
                        </div>
                        <div className="col-span-full space-y-2">
                          <Label>Relation</Label>
                          <Input placeholder="Lien avec le candidat" value={baptismForm.godparentRelation} onChange={(e) => setBaptismForm({ ...baptismForm, godparentRelation: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <FileText className="w-4 h-4" /> 📎 6. Documents requis
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         {['Pièce d’identité', 'Photo', 'Certificat de formation (optionnel)'].map((doc) => (
                           <div key={doc} className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                             <div className="flex items-center gap-2">
                               <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-church-gold group-hover:text-white transition-colors">
                                 <Plus className="w-4 h-4" />
                               </div>
                               <span className="text-xs font-medium">{doc}</span>
                             </div>
                           </div>
                         ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <CheckCircle2 className="w-4 h-4" /> ⚙️ 7. Validation
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Statut :</Label>
                          <Select value={baptismForm.status} onValueChange={(v: any) => setBaptismForm({ ...baptismForm, status: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="validated">Validé</SelectItem>
                              <SelectItem value="refused">Refusé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Approuvé par (Responsable)</Label>
                          <Input value={baptismForm.spiritualLeader} readOnly className="bg-slate-50" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <MoreHorizontal className="w-4 h-4" /> 📝 8. Notes
                      </h4>
                      <Textarea 
                        placeholder="Observations pastorales..." 
                        className="min-h-[100px]"
                        value={baptismForm.notes}
                        onChange={(e) => setBaptismForm({ ...baptismForm, notes: e.target.value })}
                      />
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right duration-300">
                {renderStepIndicator(4, step, ['Marié', 'Mariée', 'Témoins', 'Validation'])}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-church-gold/20 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                         <Search className="w-4 h-4" /> 🔎 Rechercher un membre (Masculin)
                      </h4>
                      <div className="relative">
                        <Input 
                          placeholder="Rechercher par nom ou prénom..." 
                          value={memberSearchTerm}
                          onChange={(e) => {
                            setMemberSearchTerm(e.target.value);
                            setShowMemberResults(true);
                          }}
                          className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        
                        {showMemberResults && memberSearchTerm.length > 0 && (
                          <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden">
                            {filteredMembers.length > 0 ? (
                              filteredMembers.map(m => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => handleSelectMember(m, 'groom')}
                                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-0"
                                >
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {m.firstName[0]}{m.lastName[0]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{m.firstName} {m.lastName}</p>
                                    <p className="text-[10px] text-slate-400">{m.phone || 'Pas de téléphone'}</p>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-center text-sm text-slate-500">Aucun membre masculin trouvé</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                         <User className="w-4 h-4" /> 🤵 3. Informations du marié
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom *</Label>
                          <Input value={weddingForm.groomLastName} onChange={(e) => setWeddingForm({ ...weddingForm, groomLastName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Prénom(s) *</Label>
                          <Input value={weddingForm.groomFirstName} onChange={(e) => setWeddingForm({ ...weddingForm, groomFirstName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Date de naissance *</Label>
                          <Input type="date" value={weddingForm.groomBirthDate} onChange={(e) => setWeddingForm({ ...weddingForm, groomBirthDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Nationalité</Label>
                          <Input value={weddingForm.groomNationality} onChange={(e) => setWeddingForm({ ...weddingForm, groomNationality: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Profession</Label>
                          <Input value={weddingForm.groomProfession} onChange={(e) => setWeddingForm({ ...weddingForm, groomProfession: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input value={weddingForm.groomPhone} onChange={(e) => setWeddingForm({ ...weddingForm, groomPhone: e.target.value })} />
                        </div>
                        <div className="col-span-full space-y-2">
                          <Label>Adresse</Label>
                          <Input value={weddingForm.groomAddress} onChange={(e) => setWeddingForm({ ...weddingForm, groomAddress: e.target.value })} />
                        </div>
                        <div className="col-span-full space-y-2">
                          <Label>Situation matrimoniale</Label>
                          <Select value={weddingForm.groomStatus} onValueChange={(v: any) => setWeddingForm({ ...weddingForm, groomStatus: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Célibataire</SelectItem>
                              <SelectItem value="divorced">Divorcé(e)</SelectItem>
                              <SelectItem value="widowed">Veuf(ve)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                   <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-church-gold/20 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                         <Search className="w-4 h-4" /> 🔎 Rechercher une membre (Féminin)
                      </h4>
                      <div className="relative">
                        <Input 
                          placeholder="Rechercher par nom ou prénom..." 
                          value={memberSearchTerm}
                          onChange={(e) => {
                            setMemberSearchTerm(e.target.value);
                            setShowMemberResults(true);
                          }}
                          className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        
                        {showMemberResults && memberSearchTerm.length > 0 && (
                          <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden">
                            {filteredMembers.length > 0 ? (
                              filteredMembers.map(m => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => handleSelectMember(m, 'bride')}
                                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-0"
                                >
                                  <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-xs font-bold text-pink-600">
                                    {m.firstName[0]}{m.lastName[0]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{m.firstName} {m.lastName}</p>
                                    <p className="text-[10px] text-slate-400">{m.phone || 'Pas de téléphone'}</p>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-center text-sm text-slate-500">Aucun membre féminin trouvé</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                         <User className="w-4 h-4" /> 👰 2. Informations de la mariée
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom *</Label>
                          <Input value={weddingForm.brideLastName} onChange={(e) => setWeddingForm({ ...weddingForm, brideLastName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Prénom(s) *</Label>
                          <Input value={weddingForm.brideFirstName} onChange={(e) => setWeddingForm({ ...weddingForm, brideFirstName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Date de naissance *</Label>
                          <Input type="date" value={weddingForm.brideBirthDate} onChange={(e) => setWeddingForm({ ...weddingForm, brideBirthDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Nationalité</Label>
                          <Input value={weddingForm.brideNationality} onChange={(e) => setWeddingForm({ ...weddingForm, brideNationality: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Profession</Label>
                          <Input value={weddingForm.brideProfession} onChange={(e) => setWeddingForm({ ...weddingForm, brideProfession: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input value={weddingForm.bridePhone} onChange={(e) => setWeddingForm({ ...weddingForm, bridePhone: e.target.value })} />
                        </div>
                        <div className="col-span-full space-y-2">
                          <Label>Adresse</Label>
                          <Input value={weddingForm.brideAddress} onChange={(e) => setWeddingForm({ ...weddingForm, brideAddress: e.target.value })} />
                        </div>
                        <div className="col-span-full space-y-2">
                          <Label>Situation matrimoniale</Label>
                          <Select value={weddingForm.brideStatus} onValueChange={(v: any) => setWeddingForm({ ...weddingForm, brideStatus: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Célibataire</SelectItem>
                              <SelectItem value="divorced">Divorcé(e)</SelectItem>
                              <SelectItem value="widowed">Veuf(ve)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                   <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <Church className="w-4 h-4" /> ⛪ 1. Informations générales
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date du mariage *</Label>
                          <Input type="date" value={weddingForm.date} onChange={(e) => setWeddingForm({ ...weddingForm, date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Heure</Label>
                          <Input type="time" value={weddingForm.time} onChange={(e) => setWeddingForm({ ...weddingForm, time: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Lieu *</Label>
                          <Input placeholder="Lieu de la cérémonie" value={weddingForm.location} onChange={(e) => setWeddingForm({ ...weddingForm, location: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Pasteur célébrant *</Label>
                          <Input placeholder="Nom du pasteur" value={weddingForm.pastor} onChange={(e) => setWeddingForm({ ...weddingForm, pastor: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <Users className="w-4 h-4" /> 👨‍👩‍👧‍👦 5. Informations familiales
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-full">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parents du marié :</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Nom du père</Label>
                          <Input value={weddingForm.groomFatherName} onChange={(e) => setWeddingForm({ ...weddingForm, groomFatherName: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Nom de la mère</Label>
                          <Input value={weddingForm.groomMotherName} onChange={(e) => setWeddingForm({ ...weddingForm, groomMotherName: e.target.value })} />
                        </div>
                        <div className="col-span-full mt-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parents de la mariée :</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Nom du père</Label>
                          <Input value={weddingForm.brideFatherName} onChange={(e) => setWeddingForm({ ...weddingForm, brideFatherName: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Nom de la mère</Label>
                          <Input value={weddingForm.brideMotherName} onChange={(e) => setWeddingForm({ ...weddingForm, brideMotherName: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <Users className="w-4 h-4" /> 🧑‍🤝‍🧑 6. Témoins (Min 2)
                      </h4>
                      {weddingForm.witnesses.map((witness, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Nom Témoin {idx + 1}</Label>
                            <Input value={witness.name} onChange={(e) => {
                               const newW = [...weddingForm.witnesses];
                               newW[idx].name = e.target.value;
                               setWeddingForm({ ...weddingForm, witnesses: newW });
                            }} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Téléphone</Label>
                            <Input value={witness.phone} onChange={(e) => {
                               const newW = [...weddingForm.witnesses];
                               newW[idx].phone = e.target.value;
                               setWeddingForm({ ...weddingForm, witnesses: newW });
                            }} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Lien</Label>
                            <Input value={witness.relation} onChange={(e) => {
                               const newW = [...weddingForm.witnesses];
                               newW[idx].relation = e.target.value;
                               setWeddingForm({ ...weddingForm, witnesses: newW });
                            }} />
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full text-[10px]" onClick={() => setWeddingForm({
                         ...weddingForm,
                         witnesses: [...weddingForm.witnesses, { name: '', phone: '', relation: '' }]
                      })}>
                        <Plus className="w-3 h-3 mr-1" /> Ajouter un témoin
                      </Button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                   <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <ScrollText className="w-4 h-4" /> 📖 7. Informations spirituelles
                      </h4>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase text-slate-400">Marié</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                               <Checkbox checked={weddingForm.groomIsBaptized} onCheckedChange={(c: boolean) => setWeddingForm({ ...weddingForm, groomIsBaptized: c })} />
                               <span className="text-xs">Baptisé(e)</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <Checkbox checked={weddingForm.groomIsMember} onCheckedChange={(c: boolean) => setWeddingForm({ ...weddingForm, groomIsMember: c })} />
                               <span className="text-xs">Membre</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase text-slate-400">Mariée</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                               <Checkbox checked={weddingForm.brideIsBaptized} onCheckedChange={(c: boolean) => setWeddingForm({ ...weddingForm, brideIsBaptized: c })} />
                               <span className="text-xs">Baptisé(e)</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <Checkbox checked={weddingForm.brideIsMember} onCheckedChange={(c: boolean) => setWeddingForm({ ...weddingForm, brideIsMember: c })} />
                               <span className="text-xs">Membre</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-full border-t pt-4">
                          <div className="flex items-center gap-4">
                             <Label>Suivi de préparation au mariage :</Label>
                             <Checkbox checked={weddingForm.hasWeddingPrep} onCheckedChange={(c: boolean) => setWeddingForm({ ...weddingForm, hasWeddingPrep: c })} />
                             <span className="text-xs">{weddingForm.hasWeddingPrep ? 'Oui' : 'Non'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <FileText className="w-4 h-4" /> 📎 8. Documents requis
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         {['Pièces d’identité', 'Acte de mariage civil', 'Photos', 'Certificat de baptême'].map((doc) => (
                           <div key={doc} className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                             <div className="flex items-center gap-2">
                               <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-church-gold group-hover:text-white transition-colors">
                                 <Plus className="w-4 h-4" />
                               </div>
                               <span className="text-xs font-medium">{doc}</span>
                             </div>
                           </div>
                         ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <Calendar className="w-4 h-4" /> 📅 9. Préparation au mariage
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Responsable (pasteur / conseiller)</Label>
                          <Input value={weddingForm.pastor} readOnly className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                          <Label>Statut :</Label>
                          <Select value={weddingForm.prepStatus} onValueChange={(v: any) => setWeddingForm({ ...weddingForm, prepStatus: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_progress">En cours</SelectItem>
                              <SelectItem value="completed">Terminé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <CheckCircle2 className="w-4 h-4" /> ⚙️ 10. Validation
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Statut :</Label>
                          <Select value={weddingForm.status} onValueChange={(v: any) => setWeddingForm({ ...weddingForm, status: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="validated">Validé</SelectItem>
                              <SelectItem value="refused">Refusé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-church-gold border-b pb-2">
                        <MoreHorizontal className="w-4 h-4" /> 📝 11. Notes
                      </h4>
                      <Textarea 
                        placeholder="Observations, Instructions spéciales..." 
                        className="min-h-[100px]"
                        value={weddingForm.notes}
                        onChange={(e) => setWeddingForm({ ...weddingForm, notes: e.target.value })}
                      />
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Footer fixe — en dehors du conteneur scrollable */}
          {ceremonyType !== 'none' && (
            <div className="shrink-0 flex justify-between items-center px-6 py-4 border-t bg-white">
              <Button variant="ghost" onClick={step === 1 ? resetForms : () => setStep(step - 1)}>
                {step === 1 ? 'Annuler' : (
                  <>
                    <ChevronLeft className="w-4 h-4 mr-2" /> Retour
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCreateCeremony}>Enregistrer</Button>
                {ceremonyType === 'baptism' ? (
                  step < 3 ? (
                    <Button className="bg-church-gold hover:bg-church-gold/90 text-white px-8" onClick={() => setStep(step + 1)}>
                      Suivant <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateCeremony}>
                      Valider le baptême
                    </Button>
                  )
                ) : (
                  step < 4 ? (
                    <Button className="bg-church-gold hover:bg-church-gold/90 text-white px-8" onClick={() => setStep(step + 1)}>
                      Suivant <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateCeremony}>
                      Valider mariage
                    </Button>
                  )
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
