import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore, Church, Announcement } from '../lib/store';
import { 
  ArrowLeft, 
  Search, 
  Megaphone, 
  Calendar, 
  Music, 
  Briefcase,
  MapPin,
  Building2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Tag,
  User,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { TrainingRegistrationDialog } from './TrainingRegistrationDialog';
import { AnnouncementDetailDialog } from './AnnouncementDetailDialog';
import { ProjectContributionDialog } from './ProjectContributionDialog';

type ListingType = 'announcement' | 'event' | 'service' | 'project' | 'training';

interface ListingItem {
  id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  churchId: string;
  churchName: string;
  type: ListingType;
  category?: string;
  imageUrl?: string;
  isUrgent?: boolean;
  targetAmount?: number;
  currentAmount?: number;
  preacher?: string;
  startTime?: string;
}

export function ListingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { churches, announcements, events, services } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedAnnouncementDetail, setSelectedAnnouncementDetail] = useState<Announcement | null>(null);
  const [selectedProjectContribution, setSelectedProjectContribution] = useState<any>(null);
  const [selectedTrainingForRegistration, setSelectedTrainingForRegistration] = useState<any>(null);

  // Determine type based on path
  const listingType = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/annonces')) return 'announcement';
    if (path.includes('/evenements')) return 'event';
    if (path.includes('/cultes')) return 'service';
    if (path.includes('/projets')) return 'project';
    if (path.includes('/formations')) return 'training';
    return 'announcement';
  }, [location.pathname]);

  const config = {
    announcement: {
      title: 'Annonces Importantes',
      description: 'Restez informé des dernières nouvelles et annonces de nos communautés.',
      icon: Megaphone,
      color: 'bg-amber-500',
      emptyMessage: 'Aucune annonce disponible pour le moment.'
    },
    event: {
      title: 'Événements à Venir',
      description: 'Découvrez les conférences, séminaires et rassemblements à venir.',
      icon: Calendar,
      color: 'bg-purple-500',
      emptyMessage: 'Aucun événement à venir pour le moment.'
    },
    service: {
      title: 'Cultes & Célébrations',
      description: 'Rejoignez-nous pour nos moments d\'adoration et de partage de la Parole.',
      icon: Music,
      color: 'bg-blue-500',
      emptyMessage: 'Aucun culte programmé pour le moment.'
    },
    project: {
      title: 'Bâtir l\'Avenir',
      description: 'Soutenez les projets de développement et les missions de nos églises.',
      icon: Briefcase,
      color: 'bg-emerald-500',
      emptyMessage: 'Aucun projet en cours pour le moment.'
    },
    training: {
      title: 'Nos Formations',
      description: 'Développez vos compétences et approfondissez votre foi à travers nos programmes.',
      icon: GraduationCap,
      color: 'bg-blue-600',
      emptyMessage: 'Aucune formation disponible pour le moment.'
    }
  }[listingType];

  const allItems = useMemo(() => {
    const items: ListingItem[] = [];

    if (listingType === 'announcement') {
      announcements.forEach(ann => {
        const church = churches.find(c => c.id === ann.churchId);
        items.push({
          id: ann.id,
          title: ann.title,
          description: ann.description,
          date: ann.createdAt,
          churchId: ann.churchId,
          churchName: church?.name || 'Église Inconnue',
          type: 'announcement',
          category: ann.category,
          imageUrl: ann.imageUrl,
          isUrgent: ann.isUrgent
        });
      });
    } else if (listingType === 'event') {
      events.filter(e => e.isPublished).forEach(evt => {
        const church = churches.find(c => c.id === evt.churchId);
        items.push({
          id: evt.id,
          title: evt.name,
          description: evt.description,
          date: evt.startDate,
          location: evt.location,
          churchId: evt.churchId,
          churchName: church?.name || 'Église Inconnue',
          type: 'event',
          category: evt.type,
          imageUrl: evt.bannerUrl
        });
      });
    } else if (listingType === 'service') {
      services.filter(s => s.isPublished).forEach(srv => {
        const church = churches.find(c => c.id === srv.churchId);
        items.push({
          id: srv.id,
          title: srv.theme,
          description: `Prédicateur: ${srv.preacher}`,
          date: srv.date,
          startTime: srv.startTime,
          location: srv.location,
          churchId: srv.churchId,
          churchName: church?.name || 'Église Inconnue',
          type: 'service',
          category: srv.type,
          imageUrl: srv.imageUrl,
          preacher: srv.preacher
        });
      });
    } else if (listingType === 'project') {
      churches.forEach(church => {
        church.publishedProjects?.forEach(proj => {
          items.push({
            id: proj.id,
            title: proj.title,
            description: proj.description,
            churchId: church.id,
            churchName: church.name,
            type: 'project',
            imageUrl: proj.imageUrl,
            targetAmount: proj.targetAmount,
            currentAmount: proj.currentAmount
          });
        });
      });
    } else if (listingType === 'training') {
      churches.forEach(church => {
        church.publishedTrainings?.forEach(train => {
          items.push({
            id: train.id,
            title: train.title,
            description: train.description,
            date: train.startDate,
            churchId: church.id,
            churchName: church.name,
            type: 'training',
            imageUrl: train.imageUrl,
            startTime: train.instructor // Reusing startTime for instructor name if needed or just storing it
          });
        });
      });
    }

    return items.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [listingType, announcements, events, services, churches]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return allItems;
    const query = searchQuery.toLowerCase();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query) ||
      item.churchName.toLowerCase().includes(query)
    );
  }, [allItems, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{config.title}</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Explorez les activités de nos églises</p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-church-gold transition-colors" />
            <Input 
              placeholder="Rechercher par titre, description ou église..." 
              className="pl-11 bg-slate-100 border-none rounded-xl focus-visible:ring-church-gold/20 focus-visible:bg-white transition-all h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Hero Mini Section */}
      <div className="bg-slate-900 overflow-hidden relative py-12 px-4 shadow-inner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-church-gold/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className={`w-16 h-16 ${config.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl`}>
            <config.icon className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Aller plus loin ensemble
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {config.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col p-0 rounded-3xl bg-white border border-slate-100 group h-full">
                  {/* Image/Placeholder */}
                  <div className="h-48 relative overflow-hidden shrink-0">
                    <img 
                      src={item.imageUrl || (
                        listingType === 'announcement' ? 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=800&q=80' :
                        listingType === 'event' ? 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80' :
                        listingType === 'service' ? 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80' :
                        listingType === 'training' ? 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80' :
                        'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80'
                      )} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Urgency Badge for Announcements */}
                    {item.isUrgent && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500 text-white border-none flex items-center gap-1.5 animate-pulse">
                          <AlertCircle className="w-3 h-3" /> Urgent
                        </Badge>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-3 h-3 text-church-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{item.churchName}</span>
                      </div>
                      <h4 className="font-bold text-lg leading-tight line-clamp-2">{item.title}</h4>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex-1">
                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {item.date && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                            <Calendar className="w-3.5 h-3.5 text-church-gold" />
                            {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                        {item.startTime && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                            {listingType === 'training' ? (
                              <>
                                <User className="w-3.5 h-3.5 text-church-gold" />
                                {item.startTime}
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-church-gold" />
                                {item.startTime}
                              </>
                            )}
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                            <MapPin className="w-3.5 h-3.5 text-church-gold" />
                            {item.location}
                          </div>
                        )}
                      </div>

                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
                        {item.description}
                      </p>

                      {/* Project Progress */}
                      {listingType === 'project' && item.targetAmount && item.currentAmount !== undefined && (
                        <div className="mb-6 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-400">Progression</span>
                            <span className="text-church-gold">{Math.round((item.currentAmount / item.targetAmount) * 100)}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-church-gold transition-all duration-1000"
                              style={{ width: `${Math.min((item.currentAmount / item.targetAmount) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Récolté: <span className="text-slate-900">{item.currentAmount.toLocaleString()} FCFA</span></div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Cible: <span className="text-slate-900">{item.targetAmount.toLocaleString()} FCFA</span></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-slate-900 hover:bg-black text-white rounded-xl py-6 font-bold flex items-center justify-center gap-2 group/btn"
                      onClick={() => {
                        if (listingType === 'project') {
                          setSelectedProjectContribution(item);
                        } else if (listingType === 'training') {
                          setSelectedTrainingForRegistration({
                             ...item,
                             instructor: item.startTime, // item.startTime was used to map instructor
                             startDate: item.date,
                             duration: "10 séances",
                             level: "Tous niveaux",
                             cost: 0
                          });
                        } else if (listingType === 'announcement') {
                          setSelectedAnnouncementDetail({
                            ...item,
                            isUrgent: item.isUrgent || false,
                            category: item.category || 'general',
                            createdAt: item.date || new Date().toISOString()
                          } as any);
                        } else {
                          navigate('/eglises');
                        }
                      }}
                    >
                      {listingType === 'project' ? (
                        <>Contribuer au projet <TrendingUp className="w-4 h-4" /></>
                      ) : listingType === 'service' ? (
                        <>Participer au culte <Music className="w-4 h-4" /></>
                      ) : listingType === 'event' ? (
                        <>S'inscrire à l'événement <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
                      ) : listingType === 'training' ? (
                        <>S'inscrire à la formation <GraduationCap className="w-4 h-4" /></>
                      ) : (
                        <>Plus de détails <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mx-auto mb-6">
              <config.icon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Pas encore de contenu</h3>
            <p className="text-slate-400 max-w-md mx-auto italic">{config.emptyMessage}</p>
            <Button 
              variant="outline" 
              className="mt-8 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => navigate('/')}
            >
              Retour à l'accueil
            </Button>
          </div>
        )}
      </main>

      {/* Footer Meta */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-church-gold rounded-xl flex items-center justify-center text-white font-bold text-xl">
              G
            </div>
            <span className="font-serif font-bold text-slate-900">Grace-Connect</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 Grace-Connect - Connecter les communautés, bâtir le Royaume.</p>
        </div>
      </footer>

      {/* Dialogs */}
      <TrainingRegistrationDialog 
        isOpen={!!selectedTrainingForRegistration}
        onOpenChange={(open) => !open && setSelectedTrainingForRegistration(null)}
        training={selectedTrainingForRegistration}
      />

      <AnnouncementDetailDialog 
        isOpen={!!selectedAnnouncementDetail}
        onOpenChange={(open) => !open && setSelectedAnnouncementDetail(null)}
        announcement={selectedAnnouncementDetail}
      />

      <ProjectContributionDialog 
        isOpen={!!selectedProjectContribution}
        onOpenChange={(open) => !open && setSelectedProjectContribution(null)}
        project={selectedProjectContribution}
      />
    </div>
  );
}
