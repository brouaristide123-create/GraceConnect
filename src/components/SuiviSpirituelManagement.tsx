import React from 'react';
import {
  Heart, Plus, Search, CheckCircle2, Clock, Archive, Flame, Star,
  Users, AlertTriangle, Bell, Lock, Eye, Globe, Phone, MapPin,
  Calendar, ChevronLeft, FileText, Activity, Shield, Stethoscope,
  HandHeart, Home, Building, MessageCircle, Headphones, Filter,
  MoreVertical, Trash2, Edit2, ChevronDown, ChevronRight,
  UserCheck, Siren, Hospital, ClipboardList, BookOpen, TrendingUp,
  DollarSign, Package, X,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn, generateId } from '../lib/utils';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type CaseType =
  | 'sante' | 'hospitalisation' | 'assistance_spirituelle'
  | 'accompagnement_pastoral' | 'soutien_psychologique'
  | 'difficultes_familiales' | 'besoin_priere' | 'soutien_social' | 'cas_sensible';

type UrgencyLevel = 'faible' | 'moyen' | 'eleve' | 'urgent';
type CaseStatus = 'actif' | 'en_cours' | 'stabilise' | 'clos' | 'archive';
type Confidentiality = 'prive' | 'restreint' | 'general';
type VisitType = 'appel' | 'visite_domicile' | 'hopital' | 'priere' | 'counseling';
type Frequency = 'quotidien' | 'hebdomadaire' | 'mensuel';

interface CaseVisit {
  id: string;
  date: string;
  responsibleName: string;
  type: VisitType;
  observation: string;
}

interface SuiviCase {
  id: string;
  memberId: string;
  memberName: string;
  matricule: string;
  phone: string;
  department: string;
  responsibleName: string;
  type: CaseType;
  urgency: UrgencyLevel;
  confidentiality: Confidentiality;
  description: string;
  firstVisitDate: string;
  nextFollowUpDate: string;
  frequency: Frequency;
  location: string;
  contactPerson: string;
  specificNeeds: string;
  status: CaseStatus;
  createdAt: string;
  visits: CaseVisit[];
  communityAssistance?: { type: string; description: string; amount?: number; status: string };
}

interface PrayerRequest {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  description: string;
  status: 'active' | 'answered' | 'archived';
  confidentiality: Confidentiality;
  intercessionGroup: string;
  createdAt: string;
  answeredAt?: string;
  isAnonymous: boolean;
}

interface Testimony {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  content: string;
  category: 'guerison' | 'provision' | 'protection' | 'salvation' | 'autre';
  createdAt: string;
  isPublic: boolean;
}

interface SpiritualGoal {
  id: string;
  memberId: string;
  memberName: string;
  goal: string;
  category: 'lecture' | 'priere' | 'evangelisation' | 'service' | 'autre';
  targetDate: string;
  progress: number;
  status: 'en_cours' | 'atteint' | 'abandonne';
}

interface CounselingSession {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  topic: string;
  counselorName: string;
  status: 'planifie' | 'en_cours' | 'termine';
  notes: string;
  isConfidential: boolean;
  followUpDate?: string;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
const MOCK_CASES: SuiviCase[] = [
  {
    id: 'c1', memberId: '1', memberName: 'Jean Koffi', matricule: '3847291JK',
    phone: '0707070707', department: 'Conseil', responsibleName: 'Pasteur Martin',
    type: 'hospitalisation', urgency: 'urgent', confidentiality: 'restreint',
    description: 'Jean est hospitalisé au CHU d\'Abidjan suite à une opération chirurgicale. Il a besoin de prières et de visites régulières.',
    firstVisitDate: '2025-05-10', nextFollowUpDate: '2025-05-17', frequency: 'hebdomadaire',
    location: 'CHU Cocody, Chambre 214', contactPerson: 'Mme Koffi - 0707070707',
    specificNeeds: 'Soutien moral, présence régulière, aide pour les frais médicaux',
    status: 'actif', createdAt: '2025-05-10',
    visits: [
      { id: 'v1', date: '2025-05-10', responsibleName: 'Pasteur Martin', type: 'hopital', observation: 'Premier contact. Jean est stable mais fatigué. Prière effectuée.' },
      { id: 'v2', date: '2025-05-14', responsibleName: 'Diacre Paul', type: 'hopital', observation: 'Jean va mieux. Il est encouragé. Lecture de Psaume 23.' },
    ],
    communityAssistance: { type: 'financier', description: 'Aide pour les frais médicaux estimés à 150 000 FCFA', amount: 150000, status: 'en_cours' }
  },
  {
    id: 'c2', memberId: '2', memberName: 'Marie Nguessan', matricule: '7291048MN',
    phone: '0505050505', department: 'Femmes', responsibleName: 'Sœur Grace',
    type: 'difficultes_familiales', urgency: 'eleve', confidentiality: 'prive',
    description: 'Marie traverse une période difficile dans son foyer. Situation nécessitant un accompagnement pastoral discret et confidentiel.',
    firstVisitDate: '2025-05-08', nextFollowUpDate: '2025-05-22', frequency: 'hebdomadaire',
    location: 'Domicile', contactPerson: 'Marie - 0505050505',
    specificNeeds: 'Écoute, counseling, prières',
    status: 'en_cours', createdAt: '2025-05-08',
    visits: [
      { id: 'v3', date: '2025-05-08', responsibleName: 'Sœur Grace', type: 'visite_domicile', observation: 'Première rencontre. La situation est délicate. Marie a accepté d\'être accompagnée.' },
    ]
  },
  {
    id: 'c3', memberId: '3', memberName: 'Kouassi Bertin', matricule: '5820194KB',
    phone: '0101010101', department: 'Jeunesse', responsibleName: 'Responsable Jeunes',
    type: 'soutien_psychologique', urgency: 'moyen', confidentiality: 'restreint',
    description: 'Kouassi traverse une période de découragement spirituel et professionnel. A besoin d\'un accompagnement régulier.',
    firstVisitDate: '2025-05-05', nextFollowUpDate: '2025-05-19', frequency: 'hebdomadaire',
    location: 'Salle de réunion église', contactPerson: 'Kouassi - 0101010101',
    specificNeeds: 'Mentorat spirituel, prières',
    status: 'en_cours', createdAt: '2025-05-05',
    visits: [
      { id: 'v4', date: '2025-05-05', responsibleName: 'Responsable Jeunes', type: 'counseling', observation: 'Premier entretien. Kouassi s\'est ouvert sur ses difficultés.' },
      { id: 'v5', date: '2025-05-12', responsibleName: 'Responsable Jeunes', type: 'priere', observation: 'Séance de prière. Visible amélioration de l\'état d\'esprit.' },
    ]
  },
  {
    id: 'c4', memberId: '4', memberName: 'Awa Coulibaly', matricule: '9147382AC',
    phone: '0808080808', department: 'Chorale', responsibleName: 'Ancien Koné',
    type: 'besoin_priere', urgency: 'faible', confidentiality: 'general',
    description: 'Awa cherche la direction de Dieu pour une décision importante concernant sa carrière. Besoin de soutien en prière.',
    firstVisitDate: '2025-05-01', nextFollowUpDate: '2025-06-01', frequency: 'mensuel',
    location: 'Église', contactPerson: 'Awa - 0808080808',
    specificNeeds: 'Prières de direction',
    status: 'stabilise', createdAt: '2025-05-01',
    visits: [
      { id: 'v6', date: '2025-05-01', responsibleName: 'Ancien Koné', type: 'priere', observation: 'Prière collective pour la direction divine. Awa est en paix.' },
    ]
  },
];

const MOCK_PRAYERS: PrayerRequest[] = [
  { id: 'p1', memberId: '1', memberName: 'Jean Koffi', title: 'Guérison & rétablissement rapide', description: 'Prière pour la guérison complète suite à l\'opération chirurgicale.', status: 'active', confidentiality: 'restreint', intercessionGroup: 'Groupe Intercession A', createdAt: '2025-05-10', isAnonymous: false },
  { id: 'p2', memberId: '2', memberName: 'Membre anonyme', title: 'Restauration familiale', description: 'Situation difficile au foyer, besoin de paix et de réconciliation.', status: 'active', confidentiality: 'prive', intercessionGroup: 'Équipe Pastorale', createdAt: '2025-05-08', isAnonymous: true },
  { id: 'p3', memberId: '3', memberName: 'Kouassi Bertin', title: 'Direction professionnelle', description: 'Cherche la volonté de Dieu pour son avenir professionnel.', status: 'active', confidentiality: 'general', intercessionGroup: 'Groupe Jeunesse', createdAt: '2025-05-05', isAnonymous: false },
  { id: 'p4', memberId: '4', memberName: 'Awa Coulibaly', title: 'Nouveau logement trouvé !', description: 'Après 3 mois de recherche, Dieu a pourvu.', status: 'answered', confidentiality: 'general', intercessionGroup: 'Groupe Intercession B', createdAt: '2025-04-10', answeredAt: '2025-05-02', isAnonymous: false },
];

const MOCK_TESTIMONIES: Testimony[] = [
  { id: 't1', memberId: '4', memberName: 'Awa Coulibaly', title: 'Dieu a fourni mon logement !', content: 'Après trois mois de recherche et de prières, j\'ai trouvé un appartement qui correspond exactement à mes besoins. Gloire à Dieu !', category: 'provision', createdAt: '2025-05-03', isPublic: true },
  { id: 't2', memberId: '1', memberName: 'Jean Koffi', title: 'Guérison miraculeuse', content: 'Mon fils était hospitalisé et les médecins étaient pessimistes. Après les prières de l\'église, il s\'est rétabli en quelques jours.', category: 'guerison', createdAt: '2025-04-22', isPublic: true },
];

const MOCK_GOALS: SpiritualGoal[] = [
  { id: 'g1', memberId: '1', memberName: 'Jean Koffi', goal: 'Lire la Bible en entier d\'ici fin d\'année', category: 'lecture', targetDate: '2025-12-31', progress: 45, status: 'en_cours' },
  { id: 'g2', memberId: '2', memberName: 'Marie Nguessan', goal: 'Prier 30 minutes chaque matin pendant 90 jours', category: 'priere', targetDate: '2025-07-31', progress: 70, status: 'en_cours' },
  { id: 'g3', memberId: '4', memberName: 'Awa Coulibaly', goal: 'Rejoindre le ministère de la Louange', category: 'service', targetDate: '2025-05-01', progress: 100, status: 'atteint' },
];

const MOCK_COUNSELING: CounselingSession[] = [
  { id: 'cs1', memberId: '2', memberName: 'Marie Nguessan', date: '2025-05-12', topic: 'Difficultés conjugales', counselorName: 'Pasteur Martin', status: 'termine', notes: 'Séance productive. Des pistes de réconciliation ont été explorées.', isConfidential: true, followUpDate: '2025-05-26' },
  { id: 'cs2', memberId: '3', memberName: 'Kouassi Bertin', date: '2025-05-15', topic: 'Crise de foi & découragement', counselorName: 'Ancien Koné', status: 'en_cours', notes: 'En cours d\'accompagnement.', isConfidential: false, followUpDate: '2025-05-22' },
  { id: 'cs3', memberId: '1', memberName: 'Jean Koffi', date: '2025-05-20', topic: 'Soutien durant l\'hospitalisation', counselorName: 'Pasteur Martin', status: 'planifie', notes: '', isConfidential: false },
];

// ═══════════════════════════════════════════════════════════════
// LABELS & COULEURS
// ═══════════════════════════════════════════════════════════════
const CASE_TYPE_LABELS: Record<CaseType, string> = {
  sante: 'Santé physique', hospitalisation: 'Hospitalisation',
  assistance_spirituelle: 'Assistance spirituelle', accompagnement_pastoral: 'Accompagnement pastoral',
  soutien_psychologique: 'Soutien psychologique', difficultes_familiales: 'Difficultés familiales',
  besoin_priere: 'Besoin de prière', soutien_social: 'Soutien social', cas_sensible: 'Cas sensible',
};

const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; color: string; bg: string; dot: string }> = {
  faible:  { label: 'Faible',  color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500' },
  moyen:   { label: 'Moyen',   color: 'text-amber-700',  bg: 'bg-amber-100',  dot: 'bg-amber-500' },
  eleve:   { label: 'Élevé',   color: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  urgent:  { label: 'Urgent',  color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500' },
};

const STATUS_CONFIG: Record<CaseStatus, { label: string; color: string }> = {
  actif:     { label: 'Actif',      color: 'bg-blue-100 text-blue-700' },
  en_cours:  { label: 'En cours',   color: 'bg-amber-100 text-amber-700' },
  stabilise: { label: 'Stabilisé',  color: 'bg-green-100 text-green-700' },
  clos:      { label: 'Clos',       color: 'bg-slate-100 text-slate-600' },
  archive:   { label: 'Archivé',    color: 'bg-slate-100 text-slate-400' },
};

const CONFID_CONFIG: Record<Confidentiality, { label: string; icon: React.ReactNode; color: string }> = {
  prive:     { label: 'Privé',      icon: <Lock className="w-3 h-3" />,  color: 'bg-red-100 text-red-700' },
  restreint: { label: 'Restreint',  icon: <Eye className="w-3 h-3" />,   color: 'bg-amber-100 text-amber-700' },
  general:   { label: 'Général',    icon: <Globe className="w-3 h-3" />, color: 'bg-green-100 text-green-700' },
};

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  appel: 'Appel téléphonique', visite_domicile: 'Visite à domicile',
  hopital: 'Visite à l\'hôpital', priere: 'Séance de prière', counseling: 'Counseling',
};

const VISIT_ICONS: Record<VisitType, React.ReactNode> = {
  appel: <Phone className="w-3.5 h-3.5" />, visite_domicile: <Home className="w-3.5 h-3.5" />,
  hopital: <Building className="w-3.5 h-3.5" />, priere: <Heart className="w-3.5 h-3.5" />,
  counseling: <MessageCircle className="w-3.5 h-3.5" />,
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export function SuiviSpirituelManagement() {
  const { members, currentUser } = useStore();
  const activeMembers = members.filter(m => m.status === 'active');

  // ── État global ──
  const [cases, setCases] = React.useState<SuiviCase[]>(MOCK_CASES);
  const [prayers, setPrayers] = React.useState<PrayerRequest[]>(MOCK_PRAYERS);
  const [testimonies] = React.useState<Testimony[]>(MOCK_TESTIMONIES);
  const [goals] = React.useState<SpiritualGoal[]>(MOCK_GOALS);
  const [counselingSessions, setCounselingSessions] = React.useState<CounselingSession[]>(MOCK_COUNSELING);

  // ── Navigation ──
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null);
  const [mainTab, setMainTab] = React.useState('dashboard');

  // ── Filtres cas ──
  const [caseSearch, setCaseSearch] = React.useState('');
  const [caseStatusFilter, setCaseStatusFilter] = React.useState<CaseStatus | 'all'>('all');
  const [caseUrgencyFilter, setCaseUrgencyFilter] = React.useState<UrgencyLevel | 'all'>('all');

  // ── Filtres prières ──
  const [prayerSearch, setPrayerSearch] = React.useState('');
  const [prayerFilter, setPrayerFilter] = React.useState<'all' | 'active' | 'answered' | 'archived'>('all');

  // ── Dialogues ──
  const [isNewCaseOpen, setIsNewCaseOpen] = React.useState(false);
  const [isAddVisitOpen, setIsAddVisitOpen] = React.useState(false);
  const [isPrayerDialogOpen, setIsPrayerDialogOpen] = React.useState(false);
  const [isCounselingDialogOpen, setIsCounselingDialogOpen] = React.useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = React.useState<string | null>(null);

  // ── Formulaire nouveau cas ──
  const emptyCase = {
    memberId: '', phone: '', department: '', responsibleName: '',
    type: 'besoin_priere' as CaseType, urgency: 'moyen' as UrgencyLevel,
    confidentiality: 'general' as Confidentiality, description: '',
    firstVisitDate: '', nextFollowUpDate: '', frequency: 'hebdomadaire' as Frequency,
    location: '', contactPerson: '', specificNeeds: '', status: 'actif' as CaseStatus,
  };
  const [caseForm, setCaseForm] = React.useState(emptyCase);

  // ── Formulaire nouvelle visite ──
  const [visitForm, setVisitForm] = React.useState({ date: '', type: 'appel' as VisitType, observation: '' });

  // ── Formulaire prière ──
  const [prayerForm, setPrayerForm] = React.useState({ memberId: '', title: '', description: '', isAnonymous: false, confidentiality: 'general' as Confidentiality, intercessionGroup: '' });

  // ── Formulaire counseling ──
  const [counselingForm, setCounselingForm] = React.useState({ memberId: '', date: '', topic: '', counselorName: currentUser?.firstName + ' ' + currentUser?.lastName || '', isConfidential: false, followUpDate: '', notes: '' });

  // ═══ Données calculées ═══
  const activeCases = cases.filter(c => c.status !== 'archive' && c.status !== 'clos');
  const urgentCases = activeCases.filter(c => c.urgency === 'urgent');
  const hospitalizedCases = activeCases.filter(c => c.type === 'hospitalisation');
  const activePrayerCount = prayers.filter(p => p.status === 'active').length;
  const today = new Date().toISOString().split('T')[0];
  const visitsToday = activeCases.filter(c => c.nextFollowUpDate <= today);

  const archivedCases = cases.filter(c => c.status === 'archive' || c.status === 'clos');
  const selectedCase = cases.find(c => c.id === selectedCaseId);

  const filteredCases = activeCases.filter(c => {
    const matchSearch = c.memberName.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.matricule.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.responsibleName.toLowerCase().includes(caseSearch.toLowerCase());
    const matchStatus = caseStatusFilter === 'all' || c.status === caseStatusFilter;
    const matchUrgency = caseUrgencyFilter === 'all' || c.urgency === caseUrgencyFilter;
    return matchSearch && matchStatus && matchUrgency;
  });

  const filteredPrayers = prayers.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(prayerSearch.toLowerCase()) || p.memberName.toLowerCase().includes(prayerSearch.toLowerCase());
    const matchFilter = prayerFilter === 'all' || p.status === prayerFilter;
    return matchSearch && matchFilter;
  });

  // ═══ Handlers ═══
  const handleAddCase = () => {
    if (!caseForm.memberId || !caseForm.description.trim()) {
      toast.error('Veuillez remplir les champs obligatoires (membre et description).');
      return;
    }
    const member = activeMembers.find(m => m.id === caseForm.memberId);
    const newCase: SuiviCase = {
      id: generateId(),
      memberId: caseForm.memberId,
      memberName: `${member?.firstName} ${member?.lastName}`,
      matricule: member?.matricule || '',
      phone: caseForm.phone || member?.phone || '',
      department: caseForm.department,
      responsibleName: caseForm.responsibleName,
      type: caseForm.type,
      urgency: caseForm.urgency,
      confidentiality: caseForm.confidentiality,
      description: caseForm.description,
      firstVisitDate: caseForm.firstVisitDate,
      nextFollowUpDate: caseForm.nextFollowUpDate,
      frequency: caseForm.frequency,
      location: caseForm.location,
      contactPerson: caseForm.contactPerson,
      specificNeeds: caseForm.specificNeeds,
      status: caseForm.status,
      createdAt: today,
      visits: [],
    };
    setCases(prev => [newCase, ...prev]);
    setCaseForm(emptyCase);
    setIsNewCaseOpen(false);
    toast.success('Nouveau dossier de suivi créé.');
  };

  const handleAddVisit = () => {
    if (!visitForm.date || !visitForm.observation.trim()) {
      toast.error('Date et observation sont obligatoires.');
      return;
    }
    const visit: CaseVisit = {
      id: generateId(),
      date: visitForm.date,
      responsibleName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Responsable',
      type: visitForm.type,
      observation: visitForm.observation,
    };
    setCases(prev => prev.map(c =>
      c.id === selectedCaseId ? { ...c, visits: [...c.visits, visit] } : c
    ));
    setVisitForm({ date: '', type: 'appel', observation: '' });
    setIsAddVisitOpen(false);
    toast.success('Visite enregistrée.');
  };

  const handleArchiveCase = (id: string) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'archive' } : c));
    setIsArchiveConfirmOpen(null);
    if (selectedCaseId === id) setSelectedCaseId(null);
    toast.success('Dossier archivé.');
  };

  const handleUpdateCaseStatus = (id: string, status: CaseStatus) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success('Statut mis à jour.');
  };

  const handleAddPrayer = () => {
    if (!prayerForm.memberId || !prayerForm.title.trim()) {
      toast.error('Veuillez remplir les champs obligatoires.');
      return;
    }
    const member = activeMembers.find(m => m.id === prayerForm.memberId);
    const newPrayer: PrayerRequest = {
      id: generateId(), memberId: prayerForm.memberId,
      memberName: prayerForm.isAnonymous ? 'Membre anonyme' : `${member?.firstName} ${member?.lastName}`,
      title: prayerForm.title, description: prayerForm.description,
      status: 'active', confidentiality: prayerForm.confidentiality,
      intercessionGroup: prayerForm.intercessionGroup,
      createdAt: today, isAnonymous: prayerForm.isAnonymous,
    };
    setPrayers(prev => [newPrayer, ...prev]);
    setPrayerForm({ memberId: '', title: '', description: '', isAnonymous: false, confidentiality: 'general', intercessionGroup: '' });
    setIsPrayerDialogOpen(false);
    toast.success('Demande de prière enregistrée.');
  };

  const handleAddCounseling = () => {
    if (!counselingForm.memberId || !counselingForm.topic.trim() || !counselingForm.date) {
      toast.error('Veuillez remplir les champs obligatoires.');
      return;
    }
    const member = activeMembers.find(m => m.id === counselingForm.memberId);
    const newSession: CounselingSession = {
      id: generateId(), memberId: counselingForm.memberId,
      memberName: `${member?.firstName} ${member?.lastName}`,
      date: counselingForm.date, topic: counselingForm.topic,
      counselorName: counselingForm.counselorName, status: 'planifie',
      notes: counselingForm.notes, isConfidential: counselingForm.isConfidential,
      followUpDate: counselingForm.followUpDate || undefined,
    };
    setCounselingSessions(prev => [newSession, ...prev]);
    setCounselingForm({ memberId: '', date: '', topic: '', counselorName: '', isConfidential: false, followUpDate: '', notes: '' });
    setIsCounselingDialogOpen(false);
    toast.success('Session de counseling planifiée.');
  };

  // ═══════════════════════════════════════════════════════════════
  // VUE DÉTAIL D'UN CAS
  // ═══════════════════════════════════════════════════════════════
  if (selectedCase) {
    const urg = URGENCY_CONFIG[selectedCase.urgency];
    const conf = CONFID_CONFIG[selectedCase.confidentiality];
    return (
      <div className="space-y-6">
        {/* Retour */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setSelectedCaseId(null)} className="gap-2 text-slate-600">
            <ChevronLeft className="w-4 h-4" /> Retour à la liste
          </Button>
          <div className="h-4 w-px bg-slate-300" />
          <span className="text-sm text-slate-500">Dossier de suivi</span>
        </div>

        {/* En-tête du dossier */}
        <Card className="border-l-4" style={{ borderLeftColor: selectedCase.urgency === 'urgent' ? '#ef4444' : selectedCase.urgency === 'eleve' ? '#f97316' : selectedCase.urgency === 'moyen' ? '#f59e0b' : '#22c55e' }}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 shrink-0">
                  {selectedCase.memberName[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedCase.memberName}</h2>
                  <p className="text-slate-500 text-sm">{selectedCase.matricule} · {selectedCase.phone}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={cn('text-xs', urg.bg, urg.color)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5 inline-block', urg.dot)} />
                      {urg.label}
                    </Badge>
                    <Badge className={cn('text-xs flex items-center gap-1', conf.color)}>
                      {conf.icon} {conf.label}
                    </Badge>
                    <Badge className={cn('text-xs', STATUS_CONFIG[selectedCase.status].color)}>
                      {STATUS_CONFIG[selectedCase.status].label}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-slate-600">
                      {CASE_TYPE_LABELS[selectedCase.type]}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Select value={selectedCase.status} onValueChange={(v) => handleUpdateCaseStatus(selectedCase.id, v as CaseStatus)}>
                  <SelectTrigger className="h-9 text-xs w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="stabilise">Stabilisé</SelectItem>
                    <SelectItem value="clos">Clos</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="text-slate-500 h-9" onClick={() => setIsArchiveConfirmOpen(selectedCase.id)}>
                  <Archive className="w-4 h-4 mr-1" /> Archiver
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Colonne gauche */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700">Informations du dossier</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><p className="text-xs text-slate-400 mb-0.5">Responsable spirituel</p><p className="font-medium text-slate-700">{selectedCase.responsibleName || '—'}</p></div>
                <div><p className="text-xs text-slate-400 mb-0.5">Département</p><p className="font-medium text-slate-700">{selectedCase.department || '—'}</p></div>
                <div><p className="text-xs text-slate-400 mb-0.5">Lieu</p><p className="font-medium text-slate-700">{selectedCase.location || '—'}</p></div>
                <div><p className="text-xs text-slate-400 mb-0.5">Contact</p><p className="font-medium text-slate-700">{selectedCase.contactPerson || '—'}</p></div>
                <div><p className="text-xs text-slate-400 mb-0.5">Prochain suivi</p><p className="font-medium text-slate-700">{selectedCase.nextFollowUpDate || '—'}</p></div>
                <div><p className="text-xs text-slate-400 mb-0.5">Fréquence</p><p className="font-medium text-slate-700 capitalize">{selectedCase.frequency}</p></div>
                {selectedCase.specificNeeds && (
                  <div><p className="text-xs text-slate-400 mb-0.5">Besoins spécifiques</p><p className="font-medium text-slate-700">{selectedCase.specificNeeds}</p></div>
                )}
                <div className="pt-2 border-t"><p className="text-xs text-slate-400 mb-0.5">Ouvert le</p><p className="font-medium text-slate-700">{selectedCase.createdAt}</p></div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700">Description du cas</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedCase.description}</p>
              </CardContent>
            </Card>

            {/* Assistance communautaire */}
            {selectedCase.communityAssistance && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                    <HandHeart className="w-4 h-4" /> Assistance communautaire
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-amber-800">{selectedCase.communityAssistance.description}</p>
                  {selectedCase.communityAssistance.amount && (
                    <p className="font-bold text-amber-700">{selectedCase.communityAssistance.amount.toLocaleString()} FCFA</p>
                  )}
                  <Badge className="bg-amber-200 text-amber-800 hover:bg-amber-200 capitalize">
                    {selectedCase.communityAssistance.status}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne droite — Timeline visites */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Timeline des visites ({selectedCase.visits.length})
                </CardTitle>
                <Button size="sm" onClick={() => setIsAddVisitOpen(true)} className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1">
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </Button>
              </CardHeader>
              <CardContent>
                {selectedCase.visits.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Activity className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                    <p className="text-sm">Aucune visite enregistrée.</p>
                  </div>
                ) : (
                  <div className="relative space-y-0">
                    {[...selectedCase.visits].sort((a, b) => b.date.localeCompare(a.date)).map((visit, i, arr) => (
                      <div key={visit.id} className="flex gap-4 pb-6 relative">
                        {/* Ligne verticale */}
                        {i < arr.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
                        )}
                        {/* Icône */}
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 z-10">
                          {VISIT_ICONS[visit.type]}
                        </div>
                        {/* Contenu */}
                        <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{VISIT_TYPE_LABELS[visit.type]}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{visit.date} · {visit.responsibleName}</p>
                            </div>
                          </div>
                          {visit.observation && (
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{visit.observation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog Ajouter visite */}
        <Dialog open={isAddVisitOpen} onOpenChange={setIsAddVisitOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-600">
                <Activity className="w-5 h-5" /> Enregistrer une visite
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Date *</label>
                <Input type="date" value={visitForm.date} onChange={e => setVisitForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Type de visite *</label>
                <Select value={visitForm.type} onValueChange={v => setVisitForm(f => ({ ...f, type: v as VisitType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(VISIT_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Observation / Notes *</label>
                <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" rows={3}
                  value={visitForm.observation} onChange={e => setVisitForm(f => ({ ...f, observation: e.target.value }))}
                  placeholder="Ce qui a été fait, état observé, prochaines étapes..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddVisitOpen(false)}>Annuler</Button>
              <Button onClick={handleAddVisit} className="bg-blue-600 hover:bg-blue-700 text-white">Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Archive confirmation */}
        <Dialog open={!!isArchiveConfirmOpen} onOpenChange={() => setIsArchiveConfirmOpen(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle className="text-amber-700">Archiver ce dossier ?</DialogTitle></DialogHeader>
            <p className="text-sm text-slate-600 py-2">Le dossier sera conservé dans les archives et ne sera plus affiché dans la liste active.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsArchiveConfirmOpen(null)}>Annuler</Button>
              <Button onClick={() => isArchiveConfirmOpen && handleArchiveCase(isArchiveConfirmOpen)} className="bg-amber-600 hover:bg-amber-700 text-white">Archiver</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // VUE PRINCIPALE
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" /> Suivi Spirituel
          </h1>
          <p className="text-slate-500 text-sm mt-1">Accompagnement pastoral, soins, prières et croissance des membres</p>
        </div>
        <Button onClick={() => setIsNewCaseOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white gap-2">
          <Plus className="w-4 h-4" /> Nouveau dossier
        </Button>
      </div>

      {/* Alertes urgentes */}
      {urgentCases.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">{urgentCases.length} cas urgent{urgentCases.length > 1 ? 's' : ''} nécessite{urgentCases.length === 1 ? '' : 'nt'} une attention immédiate</p>
            <p className="text-xs text-red-600 mt-0.5">{urgentCases.map(c => c.memberName).join(', ')}</p>
          </div>
        </div>
      )}

      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-white gap-1.5 text-xs">
            <ClipboardList className="w-3.5 h-3.5" /> Tableau de Bord
          </TabsTrigger>
          <TabsTrigger value="cases" className="data-[state=active]:bg-white gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" /> Cas de Suivi
            {urgentCases.length > 0 && <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{urgentCases.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="prayers" className="data-[state=active]:bg-white gap-1.5 text-xs">
            <Heart className="w-3.5 h-3.5" /> Demandes de Prière
          </TabsTrigger>
          <TabsTrigger value="testimonies" className="data-[state=active]:bg-white gap-1.5 text-xs">
            <Star className="w-3.5 h-3.5" /> Témoignages
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-white gap-1.5 text-xs">
            <Flame className="w-3.5 h-3.5" /> Objectifs Spirituels
          </TabsTrigger>
          <TabsTrigger value="counseling" className="data-[state=active]:bg-white gap-1.5 text-xs">
            <Headphones className="w-3.5 h-3.5" /> Cellule d'Écoute
          </TabsTrigger>
          <TabsTrigger value="archives" className="data-[state=active]:bg-white gap-1.5 text-xs">
            <Archive className="w-3.5 h-3.5" /> Archives
          </TabsTrigger>
        </TabsList>

        {/* ───────── TABLEAU DE BORD ───────── */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Cas actifs', value: activeCases.length, icon: <Users className="w-5 h-5 text-white" />, bg: 'from-blue-500 to-blue-600', text: 'text-blue-700', light: 'from-blue-50 to-blue-100', border: 'border-blue-200' },
              { label: 'Cas urgents', value: urgentCases.length, icon: <AlertTriangle className="w-5 h-5 text-white" />, bg: 'from-red-500 to-red-600', text: 'text-red-700', light: 'from-red-50 to-red-100', border: 'border-red-200' },
              { label: 'Hospitalisés', value: hospitalizedCases.length, icon: <Building className="w-5 h-5 text-white" />, bg: 'from-orange-500 to-orange-600', text: 'text-orange-700', light: 'from-orange-50 to-orange-100', border: 'border-orange-200' },
              { label: 'Demandes de prière', value: activePrayerCount, icon: <Heart className="w-5 h-5 text-white" />, bg: 'from-rose-500 to-rose-600', text: 'text-rose-700', light: 'from-rose-50 to-rose-100', border: 'border-rose-200' },
              { label: 'Visites à effectuer', value: visitsToday.length, icon: <Calendar className="w-5 h-5 text-white" />, bg: 'from-purple-500 to-purple-600', text: 'text-purple-700', light: 'from-purple-50 to-purple-100', border: 'border-purple-200' },
            ].map((kpi, i) => (
              <Card key={i} className={cn('bg-gradient-to-br border', kpi.light, kpi.border)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', kpi.bg)}>
                    {kpi.icon}
                  </div>
                  <div>
                    <p className={cn('text-2xl font-bold', kpi.text)}>{kpi.value}</p>
                    <p className={cn('text-xs', kpi.text, 'opacity-80')}>{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Cas urgents */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Cas prioritaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeCases.filter(c => c.urgency === 'urgent' || c.urgency === 'eleve').length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Aucun cas prioritaire.</p>
                ) : activeCases.filter(c => c.urgency === 'urgent' || c.urgency === 'eleve').map(c => {
                  const urg = URGENCY_CONFIG[c.urgency];
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => { setSelectedCaseId(c.id); }}>
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0', c.urgency === 'urgent' ? 'bg-red-500' : 'bg-orange-500')}>
                        {c.memberName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{c.memberName}</p>
                        <p className="text-xs text-slate-500 truncate">{CASE_TYPE_LABELS[c.type]}</p>
                      </div>
                      <Badge className={cn('text-xs shrink-0', urg.bg, urg.color)}>{urg.label}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Visites à planifier */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-500" /> Rappels & visites à effectuer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeCases.filter(c => c.nextFollowUpDate).sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate)).slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setSelectedCaseId(c.id)}>
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
                      {c.memberName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{c.memberName}</p>
                      <p className="text-xs text-slate-500">{c.responsibleName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn('text-xs font-medium', c.nextFollowUpDate <= today ? 'text-red-600' : 'text-slate-600')}>
                        {c.nextFollowUpDate <= today ? '⚠ En retard' : c.nextFollowUpDate}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">{c.frequency}</p>
                    </div>
                  </div>
                ))}
                {activeCases.filter(c => c.nextFollowUpDate).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Aucun rappel planifié.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Répartition par type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Répartition des cas actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.keys(CASE_TYPE_LABELS) as CaseType[]).map(type => {
                  const count = activeCases.filter(c => c.type === type).length;
                  if (count === 0) return null;
                  return (
                    <div key={type} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600 truncate">{CASE_TYPE_LABELS[type]}</p>
                        <p className="text-sm font-bold text-slate-800">{count}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───────── CAS DE SUIVI ───────── */}
        <TabsContent value="cases" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Rechercher par nom, matricule, responsable..." className="pl-9" value={caseSearch} onChange={e => setCaseSearch(e.target.value)} />
            </div>
            <Select value={caseUrgencyFilter} onValueChange={v => setCaseUrgencyFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Urgence" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes urgences</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="eleve">Élevé</SelectItem>
                <SelectItem value="moyen">Moyen</SelectItem>
                <SelectItem value="faible">Faible</SelectItem>
              </SelectContent>
            </Select>
            <Select value={caseStatusFilter} onValueChange={v => setCaseStatusFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="stabilise">Stabilisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredCases.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                <p>Aucun cas de suivi trouvé.</p>
              </div>
            ) : filteredCases.map(c => {
              const urg = URGENCY_CONFIG[c.urgency];
              const conf = CONFID_CONFIG[c.confidentiality];
              return (
                <Card key={c.id} className={cn('cursor-pointer hover:shadow-md transition-all border-l-4', c.urgency === 'urgent' ? 'border-l-red-500' : c.urgency === 'eleve' ? 'border-l-orange-500' : c.urgency === 'moyen' ? 'border-l-amber-500' : 'border-l-green-500')}
                  onClick={() => setSelectedCaseId(c.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0', c.urgency === 'urgent' ? 'bg-red-500' : c.urgency === 'eleve' ? 'bg-orange-500' : c.urgency === 'moyen' ? 'bg-amber-500' : 'bg-green-500')}>
                        {c.memberName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800 text-sm">{c.memberName}</p>
                          <span className="text-xs text-slate-400">{c.matricule}</span>
                          <Badge className={cn('text-xs', urg.bg, urg.color)}>{urg.label}</Badge>
                          <Badge className={cn('text-xs flex items-center gap-0.5', conf.color)}>{conf.icon} {conf.label}</Badge>
                          <Badge className={cn('text-xs', STATUS_CONFIG[c.status].color)}>{STATUS_CONFIG[c.status].label}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{CASE_TYPE_LABELS[c.type]} · Resp: {c.responsibleName}</p>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-1">{c.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{c.visits.length} visite{c.visits.length !== 1 ? 's' : ''}</span>
                          {c.nextFollowUpDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Prochain : {c.nextFollowUpDate}</span>}
                          {c.communityAssistance && <span className="flex items-center gap-1 text-amber-600"><HandHeart className="w-3 h-3" />Assistance</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ───────── DEMANDES DE PRIÈRE ───────── */}
        <TabsContent value="prayers" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'answered', 'archived'] as const).map(f => (
                <button key={f} onClick={() => setPrayerFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', prayerFilter === f ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                  {f === 'all' ? 'Toutes' : f === 'active' ? 'Actives' : f === 'answered' ? 'Exaucées' : 'Archivées'}
                </button>
              ))}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher..." className="pl-9 w-full sm:w-60" value={prayerSearch} onChange={e => setPrayerSearch(e.target.value)} />
              </div>
              <Button onClick={() => setIsPrayerDialogOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white gap-2 shrink-0">
                <Plus className="w-4 h-4" /> Nouvelle demande
              </Button>
            </div>
          </div>
          <div className="grid gap-3">
            {filteredPrayers.map(prayer => {
              const conf = CONFID_CONFIG[prayer.confidentiality];
              return (
                <Card key={prayer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white', prayer.status === 'active' ? 'bg-rose-400' : prayer.status === 'answered' ? 'bg-green-500' : 'bg-slate-400')}>
                          {prayer.isAnonymous ? '?' : prayer.memberName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-slate-800 text-sm">{prayer.title}</p>
                            <Badge variant="outline" className={cn('text-xs', prayer.status === 'active' ? 'border-rose-300 text-rose-600' : prayer.status === 'answered' ? 'border-green-300 text-green-600' : 'border-slate-300 text-slate-500')}>
                              {prayer.status === 'active' ? 'Active' : prayer.status === 'answered' ? '✓ Exaucée' : 'Archivée'}
                            </Badge>
                            <Badge className={cn('text-xs flex items-center gap-0.5', conf.color)}>{conf.icon} {conf.label}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{prayer.memberName} · {prayer.createdAt}</p>
                          {prayer.intercessionGroup && <p className="text-xs text-blue-600 mt-0.5">📍 {prayer.intercessionGroup}</p>}
                          {prayer.description && <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{prayer.description}</p>}
                        </div>
                      </div>
                      {prayer.status === 'active' && (
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="outline" className="h-8 text-xs border-green-300 text-green-600 hover:bg-green-50"
                            onClick={() => setPrayers(prev => prev.map(p => p.id === prayer.id ? { ...p, status: 'answered', answeredAt: today } : p))}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Exaucée
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ───────── TÉMOIGNAGES ───────── */}
        <TabsContent value="testimonies" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {testimonies.map(t => (
              <Card key={t.id} className="hover:shadow-md transition-shadow border-amber-100">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold shrink-0">{t.memberName[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm">{t.title}</p>
                        <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">{t.category}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{t.memberName} · {t.createdAt}</p>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">{t.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ───────── OBJECTIFS SPIRITUELS ───────── */}
        <TabsContent value="goals" className="space-y-3">
          {goals.map(g => (
            <Card key={g.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0 text-sm">{g.memberName[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-slate-800 text-sm">{g.goal}</p>
                      <Badge className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-100">{g.category}</Badge>
                      {g.status === 'atteint' && <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />Atteint</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{g.memberName} · Échéance : {g.targetDate}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500"><span>Progression</span><span className="font-medium">{g.progress}%</span></div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all', g.progress >= 100 ? 'bg-green-500' : g.progress >= 60 ? 'bg-purple-500' : g.progress >= 30 ? 'bg-amber-500' : 'bg-rose-400')} style={{ width: `${g.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ───────── CELLULE D'ÉCOUTE ───────── */}
        <TabsContent value="counseling" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3 flex-1 mr-4">
              <Headphones className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-indigo-700">Cellule d'Écoute & Counseling</p>
                <p className="text-xs text-indigo-600 mt-0.5">Espace confidentiel pour le counseling, l'accompagnement émotionnel et le soutien pastoral individuel.</p>
              </div>
            </div>
            <Button onClick={() => setIsCounselingDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Planifier
            </Button>
          </div>
          <div className="space-y-3">
            {counselingSessions.map(s => (
              <Card key={s.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 text-sm">{s.memberName[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-800 text-sm">{s.topic}</p>
                        <Badge className={cn('text-xs', s.status === 'planifie' ? 'bg-blue-100 text-blue-700' : s.status === 'en_cours' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}>
                          {s.status === 'planifie' ? 'Planifié' : s.status === 'en_cours' ? 'En cours' : 'Terminé'}
                        </Badge>
                        {s.isConfidential && <Badge className="text-xs bg-red-100 text-red-700 flex items-center gap-0.5 hover:bg-red-100"><Lock className="w-2.5 h-2.5" /> Confidentiel</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{s.memberName} · {s.date} · {s.counselorName}</p>
                      {s.notes && <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{s.notes}</p>}
                      {s.followUpDate && <p className="text-xs text-indigo-600 mt-1">🔁 Prochain suivi : {s.followUpDate}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ───────── ARCHIVES ───────── */}
        <TabsContent value="archives" className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <Archive className="w-4 h-4" />
            <span>{archivedCases.length} dossier{archivedCases.length !== 1 ? 's' : ''} archivé{archivedCases.length !== 1 ? 's' : ''} · L'historique complet est conservé.</span>
          </div>
          {archivedCases.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Archive className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p>Aucun dossier archivé.</p>
            </div>
          ) : archivedCases.map(c => (
            <Card key={c.id} className="opacity-75 hover:opacity-100 transition-opacity">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold shrink-0 text-sm">{c.memberName[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-700 text-sm">{c.memberName}</p>
                      <Badge className="text-xs bg-slate-100 text-slate-500">{STATUS_CONFIG[c.status].label}</Badge>
                      <Badge variant="outline" className="text-xs text-slate-500">{CASE_TYPE_LABELS[c.type]}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Ouvert le {c.createdAt} · {c.visits.length} visite{c.visits.length !== 1 ? 's' : ''} enregistrée{c.visits.length !== 1 ? 's' : ''}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 text-xs text-blue-600 shrink-0" onClick={() => setSelectedCaseId(c.id)}>
                    Voir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* ═══ DIALOG NOUVEAU DOSSIER ═══ */}
      <Dialog open={isNewCaseOpen} onOpenChange={setIsNewCaseOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Plus className="w-5 h-5" /> Nouveau dossier de suivi
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-2">
            {/* Membre */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> Informations membre</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Membre *</label>
                  <Select value={caseForm.memberId} onValueChange={v => {
                    const m = activeMembers.find(m => m.id === v);
                    setCaseForm(f => ({ ...f, memberId: v, phone: m?.phone || '', department: m?.groups?.[0] || '' }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
                    <SelectContent>{activeMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName} — {m.matricule}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Téléphone</label>
                  <Input placeholder="0700000000" value={caseForm.phone} onChange={e => setCaseForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Département</label>
                  <Input placeholder="Département" value={caseForm.department} onChange={e => setCaseForm(f => ({ ...f, department: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Responsable spirituel</label>
                  <Input placeholder="Nom du responsable" value={caseForm.responsibleName} onChange={e => setCaseForm(f => ({ ...f, responsibleName: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Type & urgence */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-rose-500" /> Type de suivi</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Type *</label>
                  <Select value={caseForm.type} onValueChange={v => setCaseForm(f => ({ ...f, type: v as CaseType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(CASE_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Niveau d'urgence *</label>
                  <Select value={caseForm.urgency} onValueChange={v => setCaseForm(f => ({ ...f, urgency: v as UrgencyLevel }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faible">🟢 Faible</SelectItem>
                      <SelectItem value="moyen">🟡 Moyen</SelectItem>
                      <SelectItem value="eleve">🟠 Élevé</SelectItem>
                      <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Confidentialité</label>
                  <Select value={caseForm.confidentiality} onValueChange={v => setCaseForm(f => ({ ...f, confidentiality: v as Confidentiality }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">🟢 Général</SelectItem>
                      <SelectItem value="restreint">🟡 Restreint</SelectItem>
                      <SelectItem value="prive">🔒 Privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Statut initial</label>
                  <Select value={caseForm.status} onValueChange={v => setCaseForm(f => ({ ...f, status: v as CaseStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Description du cas *</label>
                <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300" rows={3}
                  placeholder="Décrivez la situation du membre et les besoins identifiés..."
                  value={caseForm.description} onChange={e => setCaseForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            {/* Planification */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-500" /> Planification</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">1ère visite</label>
                  <Input type="date" value={caseForm.firstVisitDate} onChange={e => setCaseForm(f => ({ ...f, firstVisitDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Prochain suivi</label>
                  <Input type="date" value={caseForm.nextFollowUpDate} onChange={e => setCaseForm(f => ({ ...f, nextFollowUpDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Fréquence</label>
                  <Select value={caseForm.frequency} onValueChange={v => setCaseForm(f => ({ ...f, frequency: v as Frequency }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quotidien">Quotidien</SelectItem>
                      <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                      <SelectItem value="mensuel">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Infos complémentaires */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><MapPin className="w-4 h-4 text-green-500" /> Informations complémentaires</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Hôpital / Domicile</label>
                  <Input placeholder="Ex: CHU Cocody, Chambre 12" value={caseForm.location} onChange={e => setCaseForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Personne à contacter</label>
                  <Input placeholder="Nom & téléphone" value={caseForm.contactPerson} onChange={e => setCaseForm(f => ({ ...f, contactPerson: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Besoins spécifiques</label>
                  <Input placeholder="Aide financière, nourriture, transport..." value={caseForm.specificNeeds} onChange={e => setCaseForm(f => ({ ...f, specificNeeds: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={() => setIsNewCaseOpen(false)}>Annuler</Button>
            <Button onClick={handleAddCase} className="bg-rose-500 hover:bg-rose-600 text-white">Créer le dossier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ DIALOG NOUVELLE PRIÈRE ═══ */}
      <Dialog open={isPrayerDialogOpen} onOpenChange={setIsPrayerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600"><Heart className="w-5 h-5" /> Nouvelle demande de prière</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Membre *</label>
              <Select value={prayerForm.memberId} onValueChange={v => setPrayerForm(f => ({ ...f, memberId: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
                <SelectContent>{activeMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Sujet de prière *</label>
              <Input placeholder="Ex: Guérison, Direction divine..." value={prayerForm.title} onChange={e => setPrayerForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
              <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300" rows={3}
                value={prayerForm.description} onChange={e => setPrayerForm(f => ({ ...f, description: e.target.value }))} placeholder="Détails de la demande..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Confidentialité</label>
                <Select value={prayerForm.confidentiality} onValueChange={v => setPrayerForm(f => ({ ...f, confidentiality: v as Confidentiality }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">🟢 Général</SelectItem>
                    <SelectItem value="restreint">🟡 Restreint</SelectItem>
                    <SelectItem value="prive">🔒 Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Groupe d'intercession</label>
                <Input placeholder="Groupe A, Équipe pastorale..." value={prayerForm.intercessionGroup} onChange={e => setPrayerForm(f => ({ ...f, intercessionGroup: e.target.value }))} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={prayerForm.isAnonymous} onChange={e => setPrayerForm(f => ({ ...f, isAnonymous: e.target.checked }))} className="rounded" />
              <span className="text-sm text-slate-600">Rendre anonyme</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrayerDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddPrayer} className="bg-rose-500 hover:bg-rose-600 text-white">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ DIALOG COUNSELING ═══ */}
      <Dialog open={isCounselingDialogOpen} onOpenChange={setIsCounselingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600"><Headphones className="w-5 h-5" /> Planifier une session d'écoute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Membre *</label>
              <Select value={counselingForm.memberId} onValueChange={v => setCounselingForm(f => ({ ...f, memberId: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
                <SelectContent>{activeMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Date *</label>
                <Input type="date" value={counselingForm.date} onChange={e => setCounselingForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Suivi planifié</label>
                <Input type="date" value={counselingForm.followUpDate} onChange={e => setCounselingForm(f => ({ ...f, followUpDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Sujet / Problématique *</label>
              <Input placeholder="Ex: Difficultés familiales, crise de foi..." value={counselingForm.topic} onChange={e => setCounselingForm(f => ({ ...f, topic: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Conseiller</label>
              <Input placeholder="Nom du conseiller" value={counselingForm.counselorName} onChange={e => setCounselingForm(f => ({ ...f, counselorName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Notes préliminaires</label>
              <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300" rows={2}
                value={counselingForm.notes} onChange={e => setCounselingForm(f => ({ ...f, notes: e.target.value }))} placeholder="Contexte, informations utiles..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={counselingForm.isConfidential} onChange={e => setCounselingForm(f => ({ ...f, isConfidential: e.target.checked }))} className="rounded" />
              <span className="text-sm text-slate-600">Marquer comme confidentiel</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCounselingDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddCounseling} className="bg-indigo-600 hover:bg-indigo-700 text-white">Planifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
