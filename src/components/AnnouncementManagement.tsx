import React, { useState, useMemo } from 'react';
import { useStore, Announcement } from '../lib/store';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Eye, 
  Bell, 
  Users, 
  FileText, 
  ExternalLink,
  BarChart3,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Pin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from './ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export function AnnouncementManagement() {
  const { 
    announcements, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement,
    markAnnouncementAsRead,
    members,
    departments
  } = useStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const currentUser = { id: '1' }; // Mock current user

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           a.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [announcements, searchTerm, categoryFilter]);

  const stats = useMemo(() => {
    const total = announcements.length;
    const active = announcements.filter(a => a.status === 'active').length;
    const urgent = announcements.filter(a => a.isUrgent).length;
    const readRate = (announcements?.length || 0) > 0 
      ? Math.round((announcements.reduce((acc, a) => acc + (a.readBy?.length || 0), 0) / (announcements.length * (members?.length || 1))) * 100)
      : 0;
    return { total, active, urgent, readRate };
  }, [announcements, members]);

  const getCategoryBadge = (category: Announcement['category']) => {
    const configs = {
      event: { label: 'Événement', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      training: { label: 'Formation', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      volunteering: { label: 'Volontariat', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      urgent: { label: 'Urgent', className: 'bg-rose-100 text-rose-700 border-rose-200' },
      general: { label: 'Général', className: 'bg-slate-100 text-slate-700 border-slate-200' }
    };
    const config = configs[category];
    return <Badge variant="outline" className={cn("font-medium", config.className)}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: Announcement['status']) => {
    const configs = {
      active: { label: 'Actif', className: 'bg-emerald-500 text-white' },
      expired: { label: 'Expiré', className: 'bg-slate-400 text-white' },
      upcoming: { label: 'À venir', className: 'bg-blue-500 text-white' }
    };
    const config = configs[status];
    return <Badge className={cn("text-[10px] h-4 px-1.5", config.className)}>{config.label}</Badge>;
  };

  const handleMarkAsRead = (id: string) => {
    markAnnouncementAsRead(id, currentUser.id);
    toast.success('Annonce marquée comme lue');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Gestion des Annonces</h1>
          <p className="text-slate-500">Communiquez efficacement avec toute l'assemblée.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-8 px-2", viewMode === 'grid' && "shadow-sm bg-white")}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-8 px-2", viewMode === 'list' && "shadow-sm bg-white")}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger render={
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Annonce
              </Button>
            } />
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Créer une annonce</DialogTitle>
                <DialogDescription>Diffusez une information importante à l'église.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input placeholder="Ex: Culte spécial de louange" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none" placeholder="Détails de l'annonce..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none">
                    <option value="general">Général</option>
                    <option value="event">Événement</option>
                    <option value="training">Formation</option>
                    <option value="volunteering">Volontariat</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Public cible</label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none">
                    <option value="all">Tous les membres</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de début</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de fin</label>
                  <Input type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
                <Button className="bg-slate-900" onClick={() => {
                  setIsAddDialogOpen(false);
                  toast.success('Annonce planifiée avec succès');
                }}>Publier</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Annonces</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Actives</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Urgentes</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.urgent}</h3>
              </div>
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Engagement</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.readRate}%</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stats.readRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Rechercher une annonce..." 
            className="pl-9 bg-slate-50 border-none h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-transparent text-sm font-medium outline-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Toutes catégories</option>
              <option value="event">Événements</option>
              <option value="training">Formations</option>
              <option value="volunteering">Volontariat</option>
              <option value="urgent">Urgences</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements Wall (Pinned/Urgent) */}
      {announcements.some(a => a.isUrgent && a.status === 'active') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-rose-600">
            <Pin className="w-4 h-4 fill-rose-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Annonces Prioritaires</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.filter(a => a.isUrgent && a.status === 'active').map(a => (
              <Card key={a.id} className="border-2 border-rose-100 bg-rose-50/30 overflow-hidden group">
                <div className="flex h-full">
                  {a.imageUrl && (
                    <div className="w-32 shrink-0 hidden sm:block">
                      <img src={a.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="flex-1 p-5 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      {getCategoryBadge(a.category)}
                      <Badge className="bg-rose-600 text-white animate-pulse">URGENT</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">{a.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{a.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <Clock className="w-3 h-3" />
                        Publié le {format(parseISO(a.createdAt), 'dd MMM', { locale: fr })}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-100"
                        onClick={() => {
                          setSelectedAnnouncement(a);
                          setIsDetailOpen(true);
                        }}
                      >
                        Voir plus <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Toutes les annonces</h2>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((a) => (
              <Card key={a.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
                {a.imageUrl ? (
                  <div className="h-48 overflow-hidden relative">
                    <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(a.status)}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-slate-100 flex items-center justify-center relative">
                    <Megaphone className="w-12 h-12 text-slate-300" />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(a.status)}
                    </div>
                  </div>
                )}
                <CardHeader className="p-5 pb-0">
                  <div className="flex items-center justify-between mb-2">
                    {getCategoryBadge(a.category)}
                    <span className="text-[10px] text-slate-400 font-medium">
                      {format(parseISO(a.createdAt), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{a.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-3 flex-1">
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{a.description}</p>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {a.readBy.slice(0, 3).map((uid, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                        {uid}
                      </div>
                    ))}
                    {a.readBy.length > 3 && (
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                        +{a.readBy.length - 3}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedAnnouncement(a);
                      setIsDetailOpen(true);
                    }}
                  >
                    Détails
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {filteredAnnouncements.map((a) => (
                <div key={a.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group cursor-pointer" onClick={() => {
                  setSelectedAnnouncement(a);
                  setIsDetailOpen(true);
                }}>
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    a.category === 'event' ? "bg-blue-50 text-blue-600" :
                    a.category === 'training' ? "bg-emerald-50 text-emerald-600" :
                    a.category === 'urgent' ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
                  )}>
                    {a.category === 'event' ? <CalendarIcon className="w-6 h-6" /> :
                     a.category === 'training' ? <GraduationCap className="w-6 h-6" /> :
                     a.category === 'urgent' ? <AlertCircle className="w-6 h-6" /> : <Megaphone className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{a.title}</h3>
                      {getStatusBadge(a.status)}
                      {a.isUrgent && <Badge className="bg-rose-100 text-rose-600 border-none text-[9px] h-4">URGENT</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{a.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-slate-900">{format(parseISO(a.createdAt), 'dd MMM yyyy', { locale: fr })}</p>
                    <p className="text-[9px] text-slate-400">{getCategoryBadge(a.category).props.children}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
          {selectedAnnouncement && (
            <div className="flex flex-col">
              {selectedAnnouncement.imageUrl && (
                <div className="h-64 w-full relative">
                  <img src={selectedAnnouncement.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {getCategoryBadge(selectedAnnouncement.category)}
                    {getStatusBadge(selectedAnnouncement.status)}
                  </div>
                </div>
              )}
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">{selectedAnnouncement.title}</h2>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        Du {format(parseISO(selectedAnnouncement.startDate), 'dd MMM yyyy', { locale: fr })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Publié le {format(parseISO(selectedAnnouncement.createdAt), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Bell className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="outline" size="icon" className="rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Modifier</DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600" onClick={() => {
                          deleteAnnouncement(selectedAnnouncement.id);
                          setIsDetailOpen(false);
                          toast.success('Annonce supprimée');
                        }}><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none mb-8">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.description}
                  </p>
                </div>

                {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pièces jointes</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedAnnouncement.attachments.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors cursor-pointer group">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:text-blue-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400">{file.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      Cible : {selectedAnnouncement.targetAudience === 'all' ? 'Tous les membres' : 'Groupe spécifique'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {!(selectedAnnouncement.readBy || []).includes(currentUser.id) && (
                      <Button 
                        variant="outline" 
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleMarkAsRead(selectedAnnouncement.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marquer comme lu
                      </Button>
                    )}
                    {selectedAnnouncement.actionLink && (
                      <Button className="bg-slate-900 text-white">
                        {selectedAnnouncement.actionLink.label}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GraduationCap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}
