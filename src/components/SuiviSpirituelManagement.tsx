import React from 'react';
import {
  Heart,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Flame,
  BookOpen,
  Star,
  Users,
  MessageSquare,
  ChevronDown,
  Trash2,
  Edit2,
  Filter,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

// ──────────────── Types locaux ────────────────
interface PrayerRequest {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  description: string;
  status: 'active' | 'answered' | 'archived';
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
  progress: number; // 0–100
  status: 'en_cours' | 'atteint' | 'abandonne';
}

// ──────────────── Données mock initiales ────────────────
const MOCK_PRAYERS: PrayerRequest[] = [
  { id: 'p1', memberId: '1', memberName: 'Jean Koffi', title: 'Guérison pour ma famille', description: 'Prière pour la santé de mes proches touchés par la maladie.', status: 'active', createdAt: '2025-05-01', isAnonymous: false },
  { id: 'p2', memberId: '2', memberName: 'Marie Nguessan', title: 'Direction professionnelle', description: 'Cherche la volonté de Dieu pour une décision de carrière importante.', status: 'active', createdAt: '2025-05-05', isAnonymous: false },
  { id: 'p3', memberId: '3', memberName: 'Membre anonyme', title: 'Restauration familiale', description: 'Situation difficile au foyer, besoin de paix.', status: 'active', createdAt: '2025-05-08', isAnonymous: true },
  { id: 'p4', memberId: '4', memberName: 'Awa Coulibaly', title: 'Nouveau logement', description: 'Recherche un appartement depuis 3 mois.', status: 'answered', createdAt: '2025-04-10', answeredAt: '2025-05-02', isAnonymous: false },
  { id: 'p5', memberId: '5', memberName: 'Paul Yao', title: 'Financement des études', description: 'Besoin d\'une bourse pour l\'université.', status: 'answered', createdAt: '2025-03-20', answeredAt: '2025-04-15', isAnonymous: false },
];

const MOCK_TESTIMONIES: Testimony[] = [
  { id: 't1', memberId: '4', memberName: 'Awa Coulibaly', title: 'Dieu a fourni mon logement !', content: 'Après trois mois de recherche et de prières, j\'ai trouvé un appartement qui correspond exactement à mes besoins et à mon budget. Gloire à Dieu !', category: 'provision', createdAt: '2025-05-03', isPublic: true },
  { id: 't2', memberId: '1', memberName: 'Jean Koffi', title: 'Guérison miraculeuse', content: 'Mon fils était hospitalisé et les médecins étaient pessimistes. Après les prières de l\'église, il s\'est rétabli en quelques jours.', category: 'guerison', createdAt: '2025-04-22', isPublic: true },
  { id: 't3', memberId: '5', memberName: 'Paul Yao', title: 'La bourse obtenue', content: 'Je n\'espérais plus l\'avoir mais Dieu a touché le cœur des décideurs. Ma bourse est accordée pour deux ans.', category: 'provision', createdAt: '2025-04-16', isPublic: true },
];

const MOCK_GOALS: SpiritualGoal[] = [
  { id: 'g1', memberId: '1', memberName: 'Jean Koffi', goal: 'Lire la Bible en entier d\'ici fin d\'année', category: 'lecture', targetDate: '2025-12-31', progress: 45, status: 'en_cours' },
  { id: 'g2', memberId: '2', memberName: 'Marie Nguessan', goal: 'Prier 30 minutes chaque matin pendant 90 jours', category: 'priere', targetDate: '2025-07-31', progress: 70, status: 'en_cours' },
  { id: 'g3', memberId: '3', memberName: 'Kouassi Bertin', goal: 'Partager l\'Évangile avec 5 personnes de mon entourage', category: 'evangelisation', targetDate: '2025-06-30', progress: 60, status: 'en_cours' },
  { id: 'g4', memberId: '4', memberName: 'Awa Coulibaly', goal: 'Rejoindre le ministère de la Louange', category: 'service', targetDate: '2025-05-01', progress: 100, status: 'atteint' },
];

// ──────────────── Composant principal ────────────────
export function SuiviSpirituelManagement() {
  const { members, currentUser } = useStore();

  // États Prières
  const [prayers, setPrayers] = React.useState<PrayerRequest[]>(MOCK_PRAYERS);
  const [prayerSearch, setPrayerSearch] = React.useState('');
  const [prayerFilter, setPrayerFilter] = React.useState<'all' | 'active' | 'answered' | 'archived'>('all');
  const [isPrayerDialogOpen, setIsPrayerDialogOpen] = React.useState(false);
  const [prayerForm, setPrayerForm] = React.useState({ memberId: '', title: '', description: '', isAnonymous: false });

  // États Témoignages
  const [testimonies, setTestimonies] = React.useState<Testimony[]>(MOCK_TESTIMONIES);
  const [testimonySearch, setTestimonySearch] = React.useState('');
  const [isTestimonyDialogOpen, setIsTestimonyDialogOpen] = React.useState(false);
  const [testimonyForm, setTestimonyForm] = React.useState({ memberId: '', title: '', content: '', category: 'autre' as Testimony['category'], isPublic: true });

  // États Objectifs
  const [goals, setGoals] = React.useState<SpiritualGoal[]>(MOCK_GOALS);
  const [goalSearch, setGoalSearch] = React.useState('');
  const [isGoalDialogOpen, setIsGoalDialogOpen] = React.useState(false);
  const [goalForm, setGoalForm] = React.useState({ memberId: '', goal: '', category: 'lecture' as SpiritualGoal['category'], targetDate: '', progress: 0 });

  const activeMembers = members.filter(m => m.status === 'active');

  // ── Stats rapides ──
  const activePrayers = prayers.filter(p => p.status === 'active').length;
  const answeredPrayers = prayers.filter(p => p.status === 'answered').length;
  const totalTestimonies = testimonies.length;
  const goalsInProgress = goals.filter(g => g.status === 'en_cours').length;

  // ── Filtres Prières ──
  const filteredPrayers = prayers.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(prayerSearch.toLowerCase()) ||
      p.memberName.toLowerCase().includes(prayerSearch.toLowerCase());
    const matchFilter = prayerFilter === 'all' || p.status === prayerFilter;
    return matchSearch && matchFilter;
  });

  // ── Filtres Témoignages ──
  const filteredTestimonies = testimonies.filter(t =>
    t.title.toLowerCase().includes(testimonySearch.toLowerCase()) ||
    t.memberName.toLowerCase().includes(testimonySearch.toLowerCase())
  );

  // ── Filtres Objectifs ──
  const filteredGoals = goals.filter(g =>
    g.goal.toLowerCase().includes(goalSearch.toLowerCase()) ||
    g.memberName.toLowerCase().includes(goalSearch.toLowerCase())
  );

  // ── Handlers Prières ──
  const handleAddPrayer = () => {
    if (!prayerForm.memberId || !prayerForm.title.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const member = activeMembers.find(m => m.id === prayerForm.memberId);
    const newPrayer: PrayerRequest = {
      id: crypto.randomUUID(),
      memberId: prayerForm.memberId,
      memberName: prayerForm.isAnonymous ? 'Membre anonyme' : `${member?.firstName} ${member?.lastName}`,
      title: prayerForm.title,
      description: prayerForm.description,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      isAnonymous: prayerForm.isAnonymous,
    };
    setPrayers(prev => [newPrayer, ...prev]);
    setPrayerForm({ memberId: '', title: '', description: '', isAnonymous: false });
    setIsPrayerDialogOpen(false);
    toast.success('Demande de prière enregistrée.');
  };

  const handleUpdatePrayerStatus = (id: string, status: PrayerRequest['status']) => {
    setPrayers(prev => prev.map(p =>
      p.id === id ? { ...p, status, answeredAt: status === 'answered' ? new Date().toISOString().split('T')[0] : p.answeredAt } : p
    ));
    toast.success(status === 'answered' ? 'Prière marquée comme exaucée !' : 'Statut mis à jour.');
  };

  // ── Handlers Témoignages ──
  const handleAddTestimony = () => {
    if (!testimonyForm.memberId || !testimonyForm.title.trim() || !testimonyForm.content.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const member = activeMembers.find(m => m.id === testimonyForm.memberId);
    const newTestimony: Testimony = {
      id: crypto.randomUUID(),
      memberId: testimonyForm.memberId,
      memberName: `${member?.firstName} ${member?.lastName}`,
      title: testimonyForm.title,
      content: testimonyForm.content,
      category: testimonyForm.category,
      createdAt: new Date().toISOString().split('T')[0],
      isPublic: testimonyForm.isPublic,
    };
    setTestimonies(prev => [newTestimony, ...prev]);
    setTestimonyForm({ memberId: '', title: '', content: '', category: 'autre', isPublic: true });
    setIsTestimonyDialogOpen(false);
    toast.success('Témoignage enregistré.');
  };

  // ── Handlers Objectifs ──
  const handleAddGoal = () => {
    if (!goalForm.memberId || !goalForm.goal.trim() || !goalForm.targetDate) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const member = activeMembers.find(m => m.id === goalForm.memberId);
    const newGoal: SpiritualGoal = {
      id: crypto.randomUUID(),
      memberId: goalForm.memberId,
      memberName: `${member?.firstName} ${member?.lastName}`,
      goal: goalForm.goal,
      category: goalForm.category,
      targetDate: goalForm.targetDate,
      progress: goalForm.progress,
      status: goalForm.progress >= 100 ? 'atteint' : 'en_cours',
    };
    setGoals(prev => [newGoal, ...prev]);
    setGoalForm({ memberId: '', goal: '', category: 'lecture', targetDate: '', progress: 0 });
    setIsGoalDialogOpen(false);
    toast.success('Objectif spirituel enregistré.');
  };

  const categoryLabel: Record<Testimony['category'], string> = {
    guerison: 'Guérison', provision: 'Provision', protection: 'Protection',
    salvation: 'Salut', autre: 'Autre',
  };
  const goalCategoryLabel: Record<SpiritualGoal['category'], string> = {
    lecture: 'Lecture Bible', priere: 'Prière', evangelisation: 'Évangélisation',
    service: 'Service', autre: 'Autre',
  };
  const goalCategoryColor: Record<SpiritualGoal['category'], string> = {
    lecture: 'bg-blue-100 text-blue-700', priere: 'bg-purple-100 text-purple-700',
    evangelisation: 'bg-orange-100 text-orange-700', service: 'bg-green-100 text-green-700',
    autre: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Suivi Spirituel
          </h1>
          <p className="text-slate-500 text-sm mt-1">Prières, témoignages et croissance spirituelle des membres</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-700">{activePrayers}</p>
              <p className="text-xs text-rose-600">Prières actives</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{answeredPrayers}</p>
              <p className="text-xs text-green-600">Prières exaucées</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{totalTestimonies}</p>
              <p className="text-xs text-amber-600">Témoignages</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{goalsInProgress}</p>
              <p className="text-xs text-purple-600">Objectifs en cours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="prayers" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="prayers" className="data-[state=active]:bg-white gap-2">
            <Heart className="w-4 h-4" /> Demandes de Prière
          </TabsTrigger>
          <TabsTrigger value="testimonies" className="data-[state=active]:bg-white gap-2">
            <Star className="w-4 h-4" /> Témoignages
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-white gap-2">
            <Flame className="w-4 h-4" /> Objectifs Spirituels
          </TabsTrigger>
        </TabsList>

        {/* ─── Onglet Prières ─── */}
        <TabsContent value="prayers" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'answered', 'archived'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setPrayerFilter(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    prayerFilter === f
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {f === 'all' ? 'Toutes' : f === 'active' ? 'Actives' : f === 'answered' ? 'Exaucées' : 'Archivées'}
                </button>
              ))}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9 w-full sm:w-64"
                  value={prayerSearch}
                  onChange={e => setPrayerSearch(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsPrayerDialogOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white gap-2 shrink-0">
                <Plus className="w-4 h-4" /> Nouvelle demande
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {filteredPrayers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Aucune demande de prière trouvée.</p>
              </div>
            ) : filteredPrayers.map(prayer => (
              <Card key={prayer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white',
                        prayer.status === 'active' ? 'bg-rose-400' : prayer.status === 'answered' ? 'bg-green-500' : 'bg-slate-400'
                      )}>
                        {prayer.isAnonymous ? '?' : prayer.memberName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-slate-800 text-sm">{prayer.title}</p>
                          <Badge variant="outline" className={cn(
                            'text-xs',
                            prayer.status === 'active' ? 'border-rose-300 text-rose-600' :
                            prayer.status === 'answered' ? 'border-green-300 text-green-600' :
                            'border-slate-300 text-slate-500'
                          )}>
                            {prayer.status === 'active' ? 'Active' : prayer.status === 'answered' ? 'Exaucée' : 'Archivée'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{prayer.memberName} · {prayer.createdAt}</p>
                        {prayer.description && (
                          <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{prayer.description}</p>
                        )}
                        {prayer.answeredAt && (
                          <p className="text-xs text-green-600 mt-1">✓ Exaucée le {prayer.answeredAt}</p>
                        )}
                      </div>
                    </div>
                    {prayer.status === 'active' && (
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-green-300 text-green-600 hover:bg-green-50"
                          onClick={() => handleUpdatePrayerStatus(prayer.id, 'answered')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Exaucée
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-slate-400 hover:text-slate-600"
                          onClick={() => handleUpdatePrayerStatus(prayer.id, 'archived')}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Onglet Témoignages ─── */}
        <TabsContent value="testimonies" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher un témoignage..."
                className="pl-9 w-full sm:w-72"
                value={testimonySearch}
                onChange={e => setTestimonySearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsTestimonyDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Ajouter un témoignage
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredTestimonies.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Aucun témoignage enregistré.</p>
              </div>
            ) : filteredTestimonies.map(testimony => (
              <Card key={testimony.id} className="hover:shadow-md transition-shadow border-amber-100">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold shrink-0">
                      {testimony.memberName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm">{testimony.title}</p>
                        <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">
                          {categoryLabel[testimony.category]}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{testimony.memberName} · {testimony.createdAt}</p>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">{testimony.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Onglet Objectifs ─── */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher un objectif..."
                className="pl-9 w-full sm:w-72"
                value={goalSearch}
                onChange={e => setGoalSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsGoalDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Nouvel objectif
            </Button>
          </div>

          <div className="grid gap-3">
            {filteredGoals.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Flame className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Aucun objectif spirituel enregistré.</p>
              </div>
            ) : filteredGoals.map(goal => (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0 text-sm">
                      {goal.memberName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium text-slate-800 text-sm">{goal.goal}</p>
                        <Badge className={cn('text-xs hover:opacity-100', goalCategoryColor[goal.category])}>
                          {goalCategoryLabel[goal.category]}
                        </Badge>
                        {goal.status === 'atteint' && (
                          <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Atteint
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{goal.memberName} · Échéance : {goal.targetDate}</p>
                      {/* Barre de progression */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Progression</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              goal.progress >= 100 ? 'bg-green-500' :
                              goal.progress >= 60 ? 'bg-purple-500' :
                              goal.progress >= 30 ? 'bg-amber-500' : 'bg-rose-400'
                            )}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Dialog Nouvelle Prière ─── */}
      <Dialog open={isPrayerDialogOpen} onOpenChange={setIsPrayerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Heart className="w-5 h-5" /> Nouvelle demande de prière
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Membre *</label>
              <Select value={prayerForm.memberId} onValueChange={v => setPrayerForm(f => ({ ...f, memberId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un membre" />
                </SelectTrigger>
                <SelectContent>
                  {activeMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Titre de la demande *</label>
              <Input
                placeholder="Ex: Guérison pour ma famille..."
                value={prayerForm.title}
                onChange={e => setPrayerForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
              <textarea
                className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
                rows={3}
                placeholder="Détails de la demande..."
                value={prayerForm.description}
                onChange={e => setPrayerForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prayerForm.isAnonymous}
                onChange={e => setPrayerForm(f => ({ ...f, isAnonymous: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-slate-600">Rendre anonyme</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrayerDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddPrayer} className="bg-rose-500 hover:bg-rose-600 text-white">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog Nouveau Témoignage ─── */}
      <Dialog open={isTestimonyDialogOpen} onOpenChange={setIsTestimonyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Star className="w-5 h-5" /> Nouveau témoignage
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Membre *</label>
              <Select value={testimonyForm.memberId} onValueChange={v => setTestimonyForm(f => ({ ...f, memberId: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
                <SelectContent>
                  {activeMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Catégorie *</label>
              <Select value={testimonyForm.category} onValueChange={v => setTestimonyForm(f => ({ ...f, category: v as Testimony['category'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="guerison">Guérison</SelectItem>
                  <SelectItem value="provision">Provision</SelectItem>
                  <SelectItem value="protection">Protection</SelectItem>
                  <SelectItem value="salvation">Salut</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Titre *</label>
              <Input
                placeholder="Titre du témoignage..."
                value={testimonyForm.title}
                onChange={e => setTestimonyForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Contenu *</label>
              <textarea
                className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
                rows={4}
                placeholder="Racontez ce que Dieu a fait..."
                value={testimonyForm.content}
                onChange={e => setTestimonyForm(f => ({ ...f, content: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestimonyDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddTestimony} className="bg-amber-500 hover:bg-amber-600 text-white">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog Nouvel Objectif ─── */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-600">
              <Flame className="w-5 h-5" /> Nouvel objectif spirituel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Membre *</label>
              <Select value={goalForm.memberId} onValueChange={v => setGoalForm(f => ({ ...f, memberId: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
                <SelectContent>
                  {activeMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Catégorie *</label>
              <Select value={goalForm.category} onValueChange={v => setGoalForm(f => ({ ...f, category: v as SpiritualGoal['category'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">Lecture Bible</SelectItem>
                  <SelectItem value="priere">Prière</SelectItem>
                  <SelectItem value="evangelisation">Évangélisation</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description de l'objectif *</label>
              <Input
                placeholder="Ex: Lire la Bible en entier cette année..."
                value={goalForm.goal}
                onChange={e => setGoalForm(f => ({ ...f, goal: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Date d'échéance *</label>
              <Input
                type="date"
                value={goalForm.targetDate}
                onChange={e => setGoalForm(f => ({ ...f, targetDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Progression initiale : <span className="text-purple-600 font-semibold">{goalForm.progress}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={goalForm.progress}
                onChange={e => setGoalForm(f => ({ ...f, progress: Number(e.target.value) }))}
                className="w-full accent-purple-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddGoal} className="bg-purple-600 hover:bg-purple-700 text-white">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
